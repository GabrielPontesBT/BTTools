// ============================================================
// Generador automático de workflow.json para servicios Bantotal V4
// Analiza BTI019/BTI026 y detecta dependencias entre métodos
// Uso: node generar_workflow.js <Servicio> [archivo-salida.json]
// ============================================================

require('./_node-modules')(module, 'V4');
require('dotenv').config();
const oracledb = require('oracledb');
const fs = require('fs');

const DB_CONFIG = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

function esGuid(nombre) {
  return nombre && nombre.toLowerCase().includes('guid');
}

// Singulariza el nombre del param para obtener el nombre del ítem en el JSON.
// Ej: "countries" → "country", "branches" → "branch", "documentTypes" → "documentType"
function singularizar(nombre) {
  if (nombre.endsWith('ies')) return nombre.slice(0, -3) + 'y';
  if (/(?:ch|sh|x|z)es$/.test(nombre)) return nombre.slice(0, -2);
  if (nombre.endsWith('s') && !nombre.endsWith('ss')) return nombre.slice(0, -1);
  return nombre;
}

// Para un param de salida, busca en BTI026 los campos id/GUID extraíbles.
//
// Hay dos modos según cómo viene el param en BTI019:
//
// A) BTISRVCATIT='S' con BTISRVPARITTIPO = SDT del ítem (colección directa)
//    → JSON: paramNom.itemNombre[0].Field
//    → Solo mirar campos básicos del ítem, NO recursar en colecciones anidadas
//    → itemNombre se deriva del SDT: SdtBTCountry → country
//
// B) BTISRVVARTIPO.startsWith('Sdt') (SDT wrapper)
//    → JSON: paramNom.coleccion[0].Field
//    → Buscar campos colección en el wrapper, ir a sus ítems
async function resolverExtracts(conn, paramNom, sdtTipo, todosInputs, esColeccionDirecta, itemNombre) {
  if (!sdtTipo) return [];

  const r26 = await conn.execute(
    `SELECT BTISDTELEMNOM, BTISDTELEMTIPO, BTISDTELEMCAT, BTISDTELEMSDT
     FROM BTI026 WHERE BTISDTNOM = :1 ORDER BY BTISDTELEMNOM`,
    [sdtTipo],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const extracts = [];

  if (esColeccionDirecta && itemNombre) {
    // Modo A: BTI026 describe al ítem directamente.
    // El path en JSON es paramNom.itemNombre[0].Field
    // NO recursar en colecciones anidadas dentro del ítem (ej: EconomicBlocs)
    for (const campo of r26.rows) {
      const fieldName = campo.BTISDTELEMNOM;
      if (campo.BTISDTELEMCAT === 'C' || campo.BTISDTELEMCAT === 'S') continue;
      if (fieldName.toLowerCase() === 'id') {
        const asName = `${itemNombre}Id`;
        extracts.push({ path: `${paramNom}.${itemNombre}[0].${fieldName}`, as: asName });
      } else if (/Id$/i.test(fieldName) && todosInputs.has(fieldName)) {
        extracts.push({ path: `${paramNom}.${itemNombre}[0].${fieldName}`, as: fieldName });
      } else if (esGuid(fieldName)) {
        const asName = todosInputs.has(fieldName)                   ? fieldName
                     : todosInputs.has(`${itemNombre}GUID`)         ? `${itemNombre}GUID`
                     : todosInputs.has(`${itemNombre}${fieldName}`) ? `${itemNombre}${fieldName}`
                     : null;
        if (asName) extracts.push({ path: `${paramNom}.${itemNombre}[0].${fieldName}`, as: asName });
      }
    }
  } else {
    // Modo B: BTI026 describe un SDT wrapper que contiene colecciones.
    for (const campo of r26.rows) {
      const fieldName = campo.BTISDTELEMNOM;
      const itemSdt = (campo.BTISDTELEMSDT && campo.BTISDTELEMSDT.trim()) ||
                      (campo.BTISDTELEMTIPO && campo.BTISDTELEMTIPO.trim().startsWith('Sdt')
                        ? campo.BTISDTELEMTIPO.trim() : null);

      if ((campo.BTISDTELEMCAT === 'C' || campo.BTISDTELEMCAT === 'S') && itemSdt) {
        // Colección dentro del wrapper: buscar id/GUID en los ítems (sin recursar más)
        const inner = await conn.execute(
          `SELECT BTISDTELEMNOM, BTISDTELEMCAT FROM BTI026 WHERE BTISDTNOM = :1 ORDER BY BTISDTELEMNOM`,
          [itemSdt],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const itemNombreB = singularizar(fieldName);
        for (const item of inner.rows) {
          if (item.BTISDTELEMCAT === 'C' || item.BTISDTELEMCAT === 'S') continue;
          const itemField = item.BTISDTELEMNOM;
          if (itemField.toLowerCase() === 'id') {
            extracts.push({ path: `${paramNom}.${fieldName}[0].${itemField}`, as: `${itemNombreB}Id` });
          } else if (/Id$/i.test(itemField) && todosInputs.has(itemField)) {
            extracts.push({ path: `${paramNom}.${fieldName}[0].${itemField}`, as: itemField });
          } else if (esGuid(itemField)) {
            const asName = todosInputs.has(itemField)                    ? itemField
                         : todosInputs.has(`${itemNombreB}GUID`)         ? `${itemNombreB}GUID`
                         : todosInputs.has(`${itemNombreB}${itemField}`) ? `${itemNombreB}${itemField}`
                         : null;
            if (asName) extracts.push({ path: `${paramNom}.${fieldName}[0].${itemField}`, as: asName });
          }
        }
      } else if (esGuid(fieldName) && todosInputs.has(fieldName)) {
        extracts.push({ path: `${paramNom}.${fieldName}`, as: fieldName });
      } else if (fieldName.toLowerCase() === 'id' && todosInputs.has(`${paramNom}Id`)) {
        extracts.push({ path: `${paramNom}.${fieldName}`, as: `${paramNom}Id` });
      } else if (/Id$/i.test(fieldName) && todosInputs.has(fieldName)) {
        extracts.push({ path: `${paramNom}.${fieldName}`, as: fieldName });
      }
    }
  }

  return extracts;
}

function ordenTopologico(metodos, dependencias) {
  const inDegree = new Map();
  const adyacentes = new Map();

  for (const m of metodos) {
    inDegree.set(m, 0);
    adyacentes.set(m, []);
  }

  for (const [metodo, deps] of dependencias) {
    for (const dep of deps) {
      adyacentes.get(dep).push(metodo);
      inDegree.set(metodo, inDegree.get(metodo) + 1);
    }
  }

  const disponibles = metodos.filter(m => inDegree.get(m) === 0).sort();
  const resultado = [];

  while (disponibles.Length > 0) {
    disponibles.sort();
    const m = disponibles.shift();
    resultado.push(m);
    for (const siguiente of adyacentes.get(m).sort()) {
      inDegree.set(siguiente, inDegree.get(siguiente) - 1);
      if (inDegree.get(siguiente) === 0) disponibles.push(siguiente);
    }
  }

  const restantes = metodos.filter(m => !resultado.includes(m)).sort();
  if (restantes.Length > 0) {
    console.log(`  ⚠️  Dependencias circulares en: ${restantes.join(', ')} — agregados al final`);
  }

  return [...resultado, ...restantes];
}

async function generarWorkflow(servicio, archivoSalida) {
  console.log(`🔍 Analizando servicio: ${servicio}`);
  console.log('─'.repeat(50));

  let conn;
  try {
    conn = await oracledb.getConnection(DB_CONFIG);
    console.log('✅ Conectado a Oracle');
  } catch (e) {
    console.error('❌ Error de conexión:', e.message);
    return;
  }

  try {
    // ── BTI014: métodos del servicio ──────────────────────────
    const r14 = await conn.execute(
      `SELECT BTIMTDNOM FROM BTI014 WHERE BTISRVNOM = :1 ORDER BY BTIMTDNOM`,
      [servicio],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (r14.rows.Length === 0) {
      console.error(`❌ No se encontró el servicio '${servicio}' en BTI014`);
      return;
    }

    const metodos = r14.rows.map(r => r.BTIMTDNOM);
    console.log(`📋 ${metodos.Length} métodos encontrados en ${servicio}`);

    // ── BTI019: todos los parámetros del servicio ─────────────
    const r19 = await conn.execute(
      `SELECT BTIMTDNOM, BTISRVPARNOM, BTISRVPARDIR, BTISRVCATIT, BTISRVVARTIPO, BTISRVPARITTIPO
       FROM BTI019
       WHERE BTISRVNOM = :1
       ORDER BY BTIMTDNOM, BTISRVPARPOSI`,
      [servicio],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Agrupar por método
    const paramsPorMetodo = new Map();
    for (const m of metodos) paramsPorMetodo.set(m, { inputs: [], outputs: [] });

    for (const row of r19.rows) {
      const entry = paramsPorMetodo.get(row.BTIMTDNOM);
      if (!entry) continue;
      const nombre = row.BTISRVPARNOM;
      if (row.BTISRVPARDIR === 'I') {
        entry.inputs.push(nombre);
      } else if (row.BTISRVPARDIR === 'O' && nombre !== 'businessErrors') {
        const esColeccionDirecta = row.BTISRVCATIT === 'S' && !!row.BTISRVPARITTIPO;
        const sdtTipo = esColeccionDirecta
          ? row.BTISRVPARITTIPO.trim()
          : (row.BTISRVVARTIPO && row.BTISRVVARTIPO.trim().startsWith('Sdt') ? row.BTISRVVARTIPO.trim() : null);
        const itemNombre = esColeccionDirecta ? singularizar(nombre) : null;
        entry.outputs.push({ nombre, sdtTipo, esColeccionDirecta, itemNombre });
      }
    }

    // DEBUG: mostrar outputs de getCountries e inputs de getAdministrativeLevels
    if (process.argv.includes('--debug')) {
      for (const [m, p] of paramsPorMetodo) {
        if (p.outputs.Length > 0 || p.inputs.Length > 0) {
          console.log(`\n🔎 ${m}`);
          if (p.inputs.Length) console.log(`   inputs:  ${p.inputs.join(', ')}`);
          if (p.outputs.Length) p.outputs.forEach(o =>
            console.log(`   output:  ${o.nombre}  cat=${o.esColeccionDirecta ? 'S(directo)' : 'B/SDT'}  sdtTipo=${o.sdtTipo}  itemNombre=${o.itemNombre}`)
          );
        }
      }
      console.log('');
    }

    // Set de todos los inputs del servicio (para matching de id fields)
    const todosInputs = new Set(
      [...paramsPorMetodo.values()].flatMap(p => p.inputs)
    );

    // ── Construir extracts por método (BTI019 + BTI026) ───────
    console.log('\n⚙️  Consultando BTI026 para detectar extracts anidados...');
    const extractsPorMetodo = new Map();

    for (const metodo of metodos) {
      const extracts = [];
      for (const output of paramsPorMetodo.get(metodo).outputs) {
        if (esGuid(output.nombre)) {
          // GUID top-level: siempre incluir
          extracts.push(output.nombre);
        } else if (output.sdtTipo) {
          // SDT/Collection: buscar id/GUID en BTI026
          const nested = await resolverExtracts(conn, output.nombre, output.sdtTipo, todosInputs, output.esColeccionDirecta, output.itemNombre);
          extracts.push(...nested);
        } else if (todosInputs.has(output.nombre)) {
          // Escalar directo que coincide con un input de otro metodo
          extracts.push(output.nombre);
        }
      }
      extractsPorMetodo.set(metodo, extracts);
    }

    // ── Mapa: asName/nombre → [métodos productores] ───────────
    const productores = new Map();
    for (const [metodo, extracts] of extractsPorMetodo) {
      for (const e of extracts) {
        const key = typeof e === 'string' ? e : e.as;
        if (!productores.has(key)) productores.set(key, []);
        productores.get(key).push(metodo);
      }
    }

    // ── Dependencias: B depende de A si B consume lo que A extrae ──
    const dependencias = new Map();
    const requeridosPor = new Map();

    for (const metodo of metodos) {
      dependencias.set(metodo, new Set());
      requeridosPor.set(metodo, []);
      for (const input of paramsPorMetodo.get(metodo).inputs) {
        if (productores.has(input)) {
          requeridosPor.get(metodo).push(input);
          for (const prod of productores.get(input)) {
            if (prod !== metodo) dependencias.get(metodo).add(prod);
          }
        }
      }
    }

    // ── Resumen ───────────────────────────────────────────────
    const metodosConDeps = [...requeridosPor.entries()].filter(([, v]) => v.Length > 0);

    console.log('\n📊 Resultado del análisis:');

    if (productores.size > 0) {
      console.log(`  🔑 Campos extraíbles detectados (${productores.size}):`);
      for (const [key, prods] of productores) {
        console.log(`     ${key}  ←  ${prods.join(', ')}`);
      }
    } else {
      console.log('  ℹ️  Ningún método produce campos encadenables');
    }

    if (metodosConDeps.Length > 0) {
      console.log(`  🔗 Métodos con dependencias (${metodosConDeps.Length}):`);
      for (const [m, campos] of metodosConDeps) {
        const prods = campos.flatMap(g => productores.get(g) || []);
        console.log(`     ${m}  necesita ${campos.join(', ')}  ←  ${[...new Set(prods)].join(', ')}`);
      }
    } else {
      console.log('  ℹ️  No se detectaron dependencias entre métodos');
    }

    // ── Orden topológico y construcción del workflow ──────────
    // Tres niveles:
    // 1) Métodos con dependencias entre sí (core)
    // 2) Flotantes: sin deps entrantes ni salientes → van antes que terminales
    // 3) Terminales (cancel/close/delete/remove) → siempre al final
    const dependidosPor = new Set();
    for (const [, deps] of dependencias) for (const d of deps) dependidosPor.add(d);

    const esTerminal = m => /^(cancel|close|delete|remove)/i.test(m);
    const esFlotante  = m => !esTerminal(m) && dependencias.get(m).size === 0 && !dependidosPor.has(m);

    const crudo = ordenTopologico(metodos, dependencias);
    const ordenado = [
      ...crudo.filter(m => !esFlotante(m) && !esTerminal(m)),
      ...crudo.filter(m => esFlotante(m)),
      ...crudo.filter(m => esTerminal(m)),
    ];

    const steps = ordenado.map(metodo => {
      const extracts = extractsPorMetodo.get(metodo);
      const step = { method: metodo };
      if (extracts && extracts.Length > 0) step.extract = extracts;
      return step;
    });

    const workflow = { service: servicio, folder: servicio, steps };
    const outputFile = archivoSalida || `${servicio}_workflow.json`;
    fs.writeFileSync(outputFile, JSON.stringify(workflow, null, 2), 'utf8');

    console.log(`\n✅ Workflow generado: ${outputFile}`);
    console.log(`📝 ${steps.Length} pasos:`);

    for (let i = 0; i < steps.Length; i++) {
      const step = steps[i];
      const deps = [...(dependencias.get(step.method) || [])];
      const partes = [];
      if (step.extract && step.extract.Length > 0) {
        const names = step.extract.map(e => typeof e === 'string' ? e : e.as);
        partes.push(`extrae: ${names.join(', ')}`);
      }
      if (deps.Length > 0) partes.push(`depende de: ${deps.join(', ')}`);
      const extra = partes.Length > 0 ? `  [${partes.join(' | ')}]` : '';
      console.log(`  ${String(i + 1).padStart(2)}. ${step.method}${extra}`);
    }

    console.log('\n💡 Revisá y ajustá el archivo antes de ejecutarlo con --workflow');

  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await conn.close();
  }
}

// ── ENTRY POINT ───────────────────────────────────────────────
if (require.main === module) {
  const [,, servicio, archivoSalida] = process.argv;

  if (!servicio) {
    console.log('Uso:');
    console.log('  node generar_workflow.js <Servicio> [archivo-salida.json]');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node generar_workflow.js PublicSavingAccounts');
    console.log('  node generar_workflow.js PublicSavingAccounts mi_workflow.json');
    process.exit(1);
  }

  generarWorkflow(servicio, archivoSalida);
}

module.exports = { generarWorkflow };
