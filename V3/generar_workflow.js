// ============================================================
// Generador automático de workflow.json para servicios Bantotal V3
// Analiza BTI019/BTI026 (SQL Server) y detecta dependencias entre métodos
// Uso: node generar_workflow.js <Servicio> [archivo-salida.json] [--debug]
// ============================================================

require('dotenv').config();
const sql = require('mssql');
const fs  = require('fs');

const DB_CONFIG = {
  server:   process.env.DB_SERVER,
  port:     parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options:  { trustServerCertificate: true, encrypt: false }
};

function esGuid(nombre) {
  return nombre && nombre.toLowerCase().includes('guid');
}

function singularizar(nombre) {
  if (nombre.endsWith('ies')) return nombre.slice(0, -3) + 'y';
  if (/(?:ch|sh|x|z)es$/.test(nombre)) return nombre.slice(0, -2);
  if (nombre.endsWith('s') && !nombre.endsWith('ss')) return nombre.slice(0, -1);
  return nombre;
}

// Para un param de salida busca en BTI026 los campos id/GUID extraíbles.
//
// Modo A — BTISRVCATIT='S' con BTISRVPARITTIPO (colección directa de ítems SDT):
//   Path JSON: paramNom.itemNombre[0].Field
//   Solo mirar campos básicos del ítem, NO recursar en colecciones anidadas
//
// Modo B — BTISRVVARTIPO.startsWith('Sdt') (SDT wrapper):
//   Buscar campos colección en el wrapper, ir a sus ítems
async function resolverExtracts(pool, paramNom, sdtTipo, todosInputs, esColeccionDirecta, itemNombre) {
  if (!sdtTipo) return [];

  const r26 = await pool.request()
    .input('sdt', sql.VarChar(100), sdtTipo)
    .query(`SELECT BTISDTELEMNOM, BTISDTELEMTIPO, BTISDTELEMCAT, BTISDTELEMSDT
            FROM BTI026 WHERE BTISDTNOM = @sdt ORDER BY BTISDTELEMNOM`);

  const extracts = [];

  if (esColeccionDirecta && itemNombre) {
    for (const campo of r26.recordset) {
      const fieldName = campo.BTISDTELEMNOM;
      if (campo.BTISDTELEMCAT === 'C' || campo.BTISDTELEMCAT === 'S') continue;
      if (fieldName.toLowerCase() === 'id') {
        extracts.push({ path: `${paramNom}.${itemNombre}[0].${fieldName}`, as: `${itemNombre}Id` });
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
    for (const campo of r26.recordset) {
      const fieldName = campo.BTISDTELEMNOM;
      const itemSdt = (campo.BTISDTELEMSDT && campo.BTISDTELEMSDT.trim()) ||
                      (campo.BTISDTELEMTIPO && campo.BTISDTELEMTIPO.trim().startsWith('Sdt')
                        ? campo.BTISDTELEMTIPO.trim() : null);

      if ((campo.BTISDTELEMCAT === 'C' || campo.BTISDTELEMCAT === 'S') && itemSdt) {
        const inner = await pool.request()
          .input('sdt', sql.VarChar(100), itemSdt)
          .query(`SELECT BTISDTELEMNOM, BTISDTELEMCAT FROM BTI026 WHERE BTISDTNOM = @sdt ORDER BY BTISDTELEMNOM`);
        const itemNombreB = singularizar(fieldName);
        for (const item of inner.recordset) {
          if (item.BTISDTELEMCAT === 'C' || item.BTISDTELEMCAT === 'S') continue;
          const itemField = item.BTISDTELEMNOM;
          if (itemField.toLowerCase() === 'id') {
            extracts.push({ path: `${paramNom}.${fieldName}[0].${itemField}`, as: `${itemNombreB}Id` });
          } else if (/Id$/i.test(itemField) && todosInputs.has(itemField)) {
            extracts.push({ path: `${paramNom}.${fieldName}[0].${itemField}`, as: itemField });
          } else if (esGuid(itemField)) {
            const asName = todosInputs.has(itemField)                     ? itemField
                         : todosInputs.has(`${itemNombreB}GUID`)          ? `${itemNombreB}GUID`
                         : todosInputs.has(`${itemNombreB}${itemField}`)  ? `${itemNombreB}${itemField}`
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
  const inDegree   = new Map();
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
  const resultado   = [];

  while (disponibles.length > 0) {
    disponibles.sort();
    const m = disponibles.shift();
    resultado.push(m);
    for (const siguiente of adyacentes.get(m).sort()) {
      inDegree.set(siguiente, inDegree.get(siguiente) - 1);
      if (inDegree.get(siguiente) === 0) disponibles.push(siguiente);
    }
  }

  const restantes = metodos.filter(m => !resultado.includes(m)).sort();
  if (restantes.length > 0) {
    console.log(`  ⚠️  Dependencias circulares en: ${restantes.join(', ')} — agregados al final`);
  }

  return [...resultado, ...restantes];
}

async function generarWorkflow(servicio, archivoSalida) {
  console.log(`🔍 Analizando servicio: ${servicio}`);
  console.log('─'.repeat(50));

  let pool;
  try {
    pool = await new sql.ConnectionPool(DB_CONFIG).connect();
    console.log('✅ Conectado a SQL Server');
  } catch (e) {
    console.error('❌ Error de conexión:', e.message);
    return;
  }

  try {
    // ── BTI014: métodos del servicio ──────────────────────────
    const r14 = await pool.request()
      .input('srv', sql.VarChar(100), servicio)
      .query(`SELECT BTIMTDNOM FROM BTI014 WHERE BTISRVNOM = @srv ORDER BY BTIMTDNOM`);

    if (r14.recordset.length === 0) {
      console.error(`❌ No se encontró el servicio '${servicio}' en BTI014`);
      return;
    }

    const metodos = r14.recordset.map(r => r.BTIMTDNOM);
    console.log(`📋 ${metodos.length} métodos encontrados en ${servicio}`);

    // ── BTI019: todos los parámetros del servicio ─────────────
    const r19 = await pool.request()
      .input('srv', sql.VarChar(100), servicio)
      .query(`SELECT BTIMTDNOM, BTISRVPARNOM, BTISRVPARDIR, BTISRVCATIT, BTISRVVARTIPO, BTISRVPARITTIPO
              FROM BTI019 WHERE BTISRVNOM = @srv
              ORDER BY BTIMTDNOM, BTISRVPARPOSI`);

    const paramsPorMetodo = new Map();
    for (const m of metodos) paramsPorMetodo.set(m, { inputs: [], outputs: [] });

    for (const row of r19.recordset) {
      const entry = paramsPorMetodo.get(row.BTIMTDNOM);
      if (!entry) continue;
      const nombre = row.BTISRVPARNOM;
      if (row.BTISRVPARDIR === 'I') {
        entry.inputs.push(nombre);
      } else if ((row.BTISRVPARDIR === 'O' || row.BTISRVPARDIR === 'R') && nombre !== 'businessErrors') {
        const esColeccionDirecta = row.BTISRVCATIT === 'S' && !!row.BTISRVPARITTIPO;
        const rawTipo = row.BTISRVVARTIPO ? row.BTISRVVARTIPO.trim() : null;
        const sdtTipo = esColeccionDirecta
          ? row.BTISRVPARITTIPO.trim()
          : (rawTipo && rawTipo.startsWith('Sdt') ? rawTipo : null);
        const itemNombre = esColeccionDirecta ? singularizar(nombre) : null;
        entry.outputs.push({ nombre, sdtTipo, esColeccionDirecta, itemNombre });
      }
    }

    if (process.argv.includes('--debug')) {
      for (const [m, p] of paramsPorMetodo) {
        if (p.outputs.length > 0 || p.inputs.length > 0) {
          console.log(`\n🔎 ${m}`);
          if (p.inputs.length) console.log(`   inputs:  ${p.inputs.join(', ')}`);
          if (p.outputs.length) p.outputs.forEach(o =>
            console.log(`   output:  ${o.nombre}  cat=${o.esColeccionDirecta ? 'S(directo)' : 'B/SDT'}  sdtTipo=${o.sdtTipo}  itemNombre=${o.itemNombre}`)
          );
        }
      }
      console.log('');
    }

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
          extracts.push(output.nombre);
        } else if (output.sdtTipo) {
          const nested = await resolverExtracts(pool, output.nombre, output.sdtTipo, todosInputs, output.esColeccionDirecta, output.itemNombre);
          extracts.push(...nested);
        } else if (todosInputs.has(output.nombre)) {
          extracts.push(output.nombre);
        }
      }
      extractsPorMetodo.set(metodo, extracts);
    }

    // ── Mapa: asName → [métodos productores] ─────────────────
    const productores = new Map();
    for (const [metodo, extracts] of extractsPorMetodo) {
      for (const e of extracts) {
        const key = typeof e === 'string' ? e : e.as;
        if (!productores.has(key)) productores.set(key, []);
        productores.get(key).push(metodo);
      }
    }

    // ── Dependencias: B depende de A si B consume lo que A extrae ──
    const dependencias  = new Map();
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
    const metodosConDeps = [...requeridosPor.entries()].filter(([, v]) => v.length > 0);

    console.log('\n📊 Resultado del análisis:');

    if (productores.size > 0) {
      console.log(`  🔑 Campos extraíbles detectados (${productores.size}):`);
      for (const [key, prods] of productores) {
        console.log(`     ${key}  ←  ${prods.join(', ')}`);
      }
    } else {
      console.log('  ℹ️  Ningún método produce campos encadenables');
    }

    if (metodosConDeps.length > 0) {
      console.log(`  🔗 Métodos con dependencias (${metodosConDeps.length}):`);
      for (const [m, campos] of metodosConDeps) {
        const prods = campos.flatMap(g => productores.get(g) || []);
        console.log(`     ${m}  necesita ${campos.join(', ')}  ←  ${[...new Set(prods)].join(', ')}`);
      }
    } else {
      console.log('  ℹ️  No se detectaron dependencias entre métodos');
    }

    // ── Orden topológico y construcción del workflow ──────────
    // Clasificacion de métodos:
    //   terminal  → cancel/close/delete/remove: cierra la entidad, siempre al final
    //   flotante  → sin deps entrantes ni salientes: no bloquea ni desbloquea nada
    //   core      → el resto (con dependencias reales)
    // Orden: [core] → [flotantes] → [terminales]
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
      if (extracts && extracts.length > 0) step.extract = extracts;
      return step;
    });

    const workflow   = { service: servicio, folder: servicio, steps };
    const outputFile = archivoSalida || `${servicio}_workflow.json`;
    fs.writeFileSync(outputFile, JSON.stringify(workflow, null, 2), 'utf8');

    console.log(`\n✅ Workflow generado: ${outputFile}`);
    console.log(`📝 ${steps.length} pasos:`);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const deps = [...(dependencias.get(step.method) || [])];
      const partes = [];
      if (step.extract && step.extract.length > 0) {
        const names = step.extract.map(e => typeof e === 'string' ? e : e.as);
        partes.push(`extrae: ${names.join(', ')}`);
      }
      if (deps.length > 0) partes.push(`depende de: ${deps.join(', ')}`);
      const extra = partes.length > 0 ? `  [${partes.join(' | ')}]` : '';
      console.log(`  ${String(i + 1).padStart(2)}. ${step.method}${extra}`);
    }

    console.log('\n💡 Revisá y ajustá el archivo antes de ejecutarlo con:');
    console.log(`   node generar_md.js --workflow ${outputFile}`);

  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await pool.close();
  }
}

if (require.main === module) {
  const rawArgs  = process.argv.slice(2);
  const positional = rawArgs.filter(a => !a.startsWith('--'));
  const [servicio, archivoSalida] = positional;

  if (!servicio) {
    console.log('Uso:');
    console.log('  node generar_workflow.js <Servicio> [archivo-salida.json] [--debug]');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node generar_workflow.js BTPartners');
    console.log('  node generar_workflow.js BTPartners mi_workflow.json');
    console.log('  node generar_workflow.js BTPartners --debug');
    process.exit(1);
  }

  generarWorkflow(servicio, archivoSalida);
}

module.exports = { generarWorkflow };
