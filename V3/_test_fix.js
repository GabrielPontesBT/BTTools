// ============================================================
// Validador de archivos .md generados para documentacion Bantotal V3
// Uso: node validar_md.js <Carpeta>
// Ejemplo: node validar_md.js "BTPARTNERS"
// ============================================================

const fs = require('fs');
const path = require('path');

const CAMPOS_IGNORADOS_ENTRADA = new Set(['Btinreq']);
const CAMPOS_IGNORADOS_SALIDA = new Set(['Btinreq', 'Btoutreq', 'Erroresnegocio']);

function parsearTablaParametros(bloque) {
  if (!bloque || /no aplica/i.test(bloque.trim())) return null;
  const lineas = bloque.trim().split('\n');
  const campos = [];
  for (const linea of lineas) {
    const partes = linea.split('|').map(p => p.trim());
    if (partes.length < 2) continue;
    const nombre = partes[0];
    const tipo = partes[1] || '';
    const comentario = partes[2] || '';
    if (!nombre || nombre.startsWith(':') || nombre === 'Nombre') continue;
    if (/hidden/i.test(comentario)) continue;
    const esSdt = /\[.*?\]\(#.*?\)/.test(tipo);
    const nombreSdt = esSdt ? tipo.match(/\[([^\]]+)\]/)?.[1] : null;
    campos.push({ nombre, tipo, esSdt, nombreSdt });
  }
  return campos.length > 0 ? campos : null;
}

function parsearSeccionTab(contenido, nombreTab) {
  const regex = new RegExp(`@tab ${nombreTab}\\s*\\n([\\s\\S]*?)(?=@tab |:::)`, 'i');
  const match = contenido.match(regex);
  return match ? match[1] : null;
}

function parsearJsonEjemplo(contenido, tituloSeccion) {
  const regex = new RegExp(
    `:::.*?details.*?${tituloSeccion}[\\s\\S]*?@tab JSON\\s*\\n\`\`\`json\\s*\\n([\\s\\S]*?)\`\`\``,
    'i'
  );
  const match = contenido.match(regex);
  if (!match) return null;
  const raw = match[1];
  // Extrae el objeto JSON más externo ({ ... }), ignorando envolturas de curl o comillas simples
  const inicio = raw.indexOf('{');
  const fin = raw.lastIndexOf('}');
  if (inicio === -1 || fin === -1 || fin <= inicio) return null;
  try {
    return JSON.parse(raw.slice(inicio, fin + 1));
  } catch {
    return null;
  }
}

function parsearSdts(contenido) {
  const sdts = {};
  const regex = /:::.*?details\s+(sBT\w+)\s*\n[\s\S]*?Los campos del tipo de dato estructurado \w+ son los siguientes:\s*\n\s*Nombre \| Tipo \| Comentarios\s*\n[:\s-|]+\n([\s\S]*?)(?=:::)/gi;
  let match;
  while ((match = regex.exec(contenido)) !== null) {
    const nombreSdt = match[1];
    const tablaBloque = match[2];
    const campos = parsearTablaParametros(tablaBloque);
    if (campos) sdts[nombreSdt.toLowerCase()] = campos.map(c => c.nombre);
  }
  return sdts;
}

function parsearSdtsConTipos(contenido) {
  const sdts = {};
  const regex = /:::.*?details\s+(sBT\w+)\s*\n[\s\S]*?Los campos del tipo de dato estructurado \w+ son los siguientes:\s*\n\s*Nombre \| Tipo \| Comentarios\s*\n[:\s-|]+\n([\s\S]*?)(?=:::)/gi;
  let match;
  while ((match = regex.exec(contenido)) !== null) {
    const nombreSdt = match[1];
    const campos = parsearTablaParametros(match[2]);
    if (campos) sdts[nombreSdt.toLowerCase()] = campos.map(c => ({ nombre: c.nombre, tipo: c.tipo }));
  }
  return sdts;
}

function obtenerClavesJson(obj) {
  if (!obj || typeof obj !== 'object') return new Set();
  // Si es array, usamos el primer elemento
  if (Array.isArray(obj)) {
    const item = obj[0];
    if (!item || typeof item !== 'object') return new Set();
    return new Set(Object.keys(item));
  }
  const keys = Object.keys(obj);
  // Patrón wrapper: { "sBTNivel": [...] } — un solo key que apunta a array u objeto
  if (keys.length === 1) {
    const inner = obj[keys[0]];
    if (Array.isArray(inner)) {
      const item = inner[0];
      if (item && typeof item === 'object') return new Set(Object.keys(item));
    }
    if (inner && typeof inner === 'object') return new Set(Object.keys(inner));
  }
  return new Set(keys);
}

// ── XML ──────────────────────────────────────────────────────

function parsearXmlEjemplo(contenido, tituloSeccion) {
  const regex = new RegExp(
    `:::.*?details.*?${tituloSeccion}[\\s\\S]*?@tab XML\\s*\\n\`\`\`xml\\s*\\n([\\s\\S]*?)\`\`\``,
    'i'
  );
  const match = contenido.match(regex);
  return match ? match[1] : null;
}

function eliminarBloqueTag(xml, tagName) {
  return xml.replace(
    new RegExp(`<(?:\\w+:)?${tagName}(?:[\\s>][\\s\\S]*?<\\/(?:\\w+:)?${tagName}>|\\s*\\/>)`, 'gi'),
    ''
  );
}

function extraerContenidoTag(xml, tagName) {
  const m = xml.match(new RegExp(`<(?:\\w+:)?${tagName}(?:[\\s][^>]*)?>([\\s\\S]*?)<\\/(?:\\w+:)?${tagName}>`, 'i'));
  return m ? m[1] : null;
}

function tagExisteEnXml(xml, tagName) {
  return new RegExp(`<(?:\\w+:)?${tagName}(?:[\\s\\/>])`, 'i').test(xml);
}

function validarParametrosContraXml(campos, xmlStr, camposIgnorados, sdts, etiqueta) {
  const problemas = [];
  if (!campos) return problemas;
  if (!xmlStr) {
    problemas.push(`⚠️  No se encontró el XML de ${etiqueta}`);
    return problemas;
  }

  let xmlLimpio = xmlStr;
  for (const ignorado of camposIgnorados) {
    xmlLimpio = eliminarBloqueTag(xmlLimpio, ignorado);
  }

  for (const campo of campos) {
    if (!tagExisteEnXml(xmlLimpio, campo.nombre)) {
      problemas.push(`❌ [XML ${etiqueta}] "${campo.nombre}" documentado pero ausente en el ejemplo XML`);
      continue;
    }

    if (campo.esSdt && campo.nombreSdt) {
      const camposSdt = sdts[campo.nombreSdt.toLowerCase()];
      if (!camposSdt) continue;

      const contenedor = extraerContenidoTag(xmlLimpio, campo.nombre);
      if (!contenedor) continue;

      for (const campoClave of camposSdt) {
        if (!tagExisteEnXml(contenedor, campoClave)) {
          problemas.push(`❌ [XML ${etiqueta}] SDT "${campo.nombreSdt}.${campoClave}" documentado pero ausente en el ejemplo XML`);
        }
      }
    }
  }

  return problemas;
}

// ── JSON ──────────────────────────────────────────────────────

function validarParametrosContraEjemplo(campos, jsonEjemplo, camposIgnorados, sdts, etiqueta) {
  const problemas = [];
  if (!campos) return problemas;
  if (!jsonEjemplo) {
    problemas.push(`⚠️  No se pudo parsear el JSON de ${etiqueta}`);
    return problemas;
  }

  // Mapa CI: lowercase → key real (para no reportar falsos positivos por diferencias de casing)
  const mapaRaiz = new Map(
    Object.keys(jsonEjemplo).filter(k => !camposIgnorados.has(k)).map(k => [k.toLowerCase(), k])
  );

  for (const campo of campos) {
    if (!mapaRaiz.has(campo.nombre.toLowerCase())) {
      problemas.push(`❌ [${etiqueta}] "${campo.nombre}" documentado pero ausente en el ejemplo JSON`);
      continue;
    }

    if (campo.esSdt && campo.nombreSdt) {
      const camposSdt = sdts[campo.nombreSdt.toLowerCase()];
      if (!camposSdt) continue;

      const keyActual = mapaRaiz.get(campo.nombre.toLowerCase());
      const valorEnJson = jsonEjemplo[keyActual];
      const clavesAnidadas = obtenerClavesJson(valorEnJson);
      const clavesAnidadasLower = new Set([...clavesAnidadas].map(k => k.toLowerCase()));

      for (const campoClave of camposSdt) {
        if (!clavesAnidadasLower.has(campoClave.toLowerCase())) {
          problemas.push(`❌ [${etiqueta}] SDT "${campo.nombreSdt}.${campoClave}" documentado pero ausente en el ejemplo JSON`);
        }
      }
    }
  }

  return problemas;
}

function validarArchivo(filePath) {
  const contenido = fs.readFileSync(filePath, 'utf8');
  const nombre = path.basename(filePath);
  const problemas = [];

  // --- Validaciones existentes ---
  if (contenido.includes('::: note [Pendiente de completar]') || contenido.match(/::: note\s*\n/)) {
    problemas.push('❌ Descripción del método vacía');
  }
  if (contenido.match(/::: note Method /)) {
    problemas.push('⚠️  Descripción del método en inglés');
  }
  if (contenido.includes('Completar manualmente | Completar manualmente')) {
    problemas.push('⚠️  Códigos de error sin completar');
  }
  const lineasSdt = contenido.match(/\w+ \| \w[\w\s$<>():]+\|$/gm);
  if (lineasSdt && lineasSdt.length > 0) {
    problemas.push(`⚠️  ${lineasSdt.length} campo(s) del SDT sin descripción`);
  }
  const lineasTabla = contenido.match(/\w+ \| \w[\w\s$<>():.]+ \| $/gm);
  if (lineasTabla && lineasTabla.length > 0) {
    problemas.push(`⚠️  ${lineasTabla.length} parámetro(s) sin comentario`);
  }
  if (contenido.includes('**Programa:** Completar manualmente')) {
    problemas.push('❌ Programa sin completar');
  }
  if (contenido.includes('"Token": "TOKEN_AQUI"')) {
    problemas.push('⚠️  Ejemplo de respuesta con datos genéricos');
  }

  // --- Validación de parámetros contra ejemplos ---
  const sdts = parsearSdts(contenido);

  const bloqueEntrada = parsearSeccionTab(contenido, 'Datos de Entrada');
  const camposEntrada = parsearTablaParametros(bloqueEntrada);
  const bloqueSalida = parsearSeccionTab(contenido, 'Datos de Salida');
  const camposSalida = parsearTablaParametros(bloqueSalida);

  // JSON
  const jsonInvocacion = parsearJsonEjemplo(contenido, 'Invocación');
  problemas.push(...validarParametrosContraEjemplo(camposEntrada, jsonInvocacion, CAMPOS_IGNORADOS_ENTRADA, sdts, 'Entrada'));
  const jsonRespuesta = parsearJsonEjemplo(contenido, 'Respuesta');
  problemas.push(...validarParametrosContraEjemplo(camposSalida, jsonRespuesta, CAMPOS_IGNORADOS_SALIDA, sdts, 'Salida'));

  // XML
  const xmlInvocacion = parsearXmlEjemplo(contenido, 'Invocación');
  problemas.push(...validarParametrosContraXml(camposEntrada, xmlInvocacion, CAMPOS_IGNORADOS_ENTRADA, sdts, 'Entrada'));
  const xmlRespuesta = parsearXmlEjemplo(contenido, 'Respuesta');
  problemas.push(...validarParametrosContraXml(camposSalida, xmlRespuesta, CAMPOS_IGNORADOS_SALIDA, sdts, 'Salida'));

  return { nombre, problemas };
}

function buscarMdRecursivo(dir) {
  const archivos = [];
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, entrada.name);
    if (entrada.isDirectory()) archivos.push(...buscarMdRecursivo(ruta));
    else if (entrada.name.endsWith('.md')) archivos.push(ruta);
  }
  return archivos;
}

function validarCarpeta(carpeta) {
  if (!fs.existsSync(carpeta)) {
    console.error(`❌ No existe la carpeta: ${carpeta}`);
    process.exit(1);
  }

  const archivos = buscarMdRecursivo(carpeta).map(f => path.relative(carpeta, f));

  if (archivos.length === 0) {
    console.log(`⚠️  No se encontraron archivos .md en: ${carpeta}`);
    return;
  }

  console.log(`\n📂 Validando ${archivos.length} archivos en: ${carpeta}`);
  console.log('─'.repeat(60));

  let totalOk = 0;
  let totalConProblemas = 0;
  const resumen = [];

  for (const archivo of archivos) {
    const filePath = path.join(carpeta, archivo);
    const { problemas } = validarArchivo(filePath);
    const nombre = archivo.replace(/\\/g, '/');

    if (problemas.length === 0) {
      console.log(`✅ ${nombre}`);
      totalOk++;
    } else {
      console.log(`\n📄 ${nombre}`);
      for (const p of problemas) {
        console.log(`   ${p}`);
      }
      totalConProblemas++;
      resumen.push({ nombre, problemas });
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`✅ Sin problemas: ${totalOk} | ⚠️  Con problemas: ${totalConProblemas}`);

  if (resumen.length > 0) {
    console.log('\n📋 RESUMEN DE PENDIENTES:');
    console.log('─'.repeat(60));
    for (const { nombre, problemas } of resumen) {
      console.log(`\n${nombre}:`);
      for (const p of problemas) {
        console.log(`  ${p}`);
      }
    }
  }
}

// ── CORRECCIÓN ────────────────────────────────────────────────

// Aplica la convención de sufijos Bantotal:
//   ...uid (cualquier casing) → ...UId
//   ...id  (sin U previa)     → ...Id
function normalizarSufijoCampo(nombre) {
  if (/uid$/i.test(nombre)) return nombre.slice(0, -3) + 'UId';
  if (/(?<![uU])id$/i.test(nombre)) return nombre.slice(0, -2) + 'Id';
  return nombre;
}

// Normaliza los nombres de campo (primera columna) en todas las filas de tabla del MD.
// Solo actúa sobre filas de datos (identificador | tipo | comentario), no sobre
// encabezados (:-----), bloques de código ni otro contenido.
function normalizarNombresEnMd(contenido) {
  let cambios = 0;
  const resultado = contenido.replace(
    /^([a-zA-Z_]\w*)([ \t]*\|[ \t]*[^|\n]+\|[^\n]*)$/gm,
    (linea, nombre, resto) => {
      const norm = normalizarSufijoCampo(nombre);
      if (norm === nombre) return linea;
      cambios++;
      return norm + resto;
    }
  );
  return { resultado, cambios };
}

function obtenerDefaultPorTipo(tipo) {
  const t = (tipo || '').replace(/\[.*?\]\(.*?\)/g, '').trim().toLowerCase();
  if (t === 'string') return '';
  if (['int', 'long', 'short', 'byte', 'integer'].includes(t)) return 0;
  if (['double', 'decimal', 'float'].includes(t)) return 0.0;
  if (t === 'boolean') return false;
  if (t === 'date') return '2026-01-01';
  return '';
}

function agregarCampoAnidado(obj, campoClave, valor) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    if (obj.length > 0 && obj[0] && typeof obj[0] === 'object') obj[0][campoClave] = valor;
    return;
  }
  const keys = Object.keys(obj);
  if (keys.length === 1) {
    const inner = obj[keys[0]];
    if (Array.isArray(inner)) {
      if (inner[0] && typeof inner[0] === 'object') inner[0][campoClave] = valor;
      return;
    }
    if (inner && typeof inner === 'object') { inner[campoClave] = valor; return; }
  }
  obj[campoClave] = valor;
}

function isValorDefault(v) {
  if (v === 0 || v === 0.0 || v === '' || v === false || v === '2026-01-01') return true;
  if (v && typeof v === 'object' && Object.keys(v).length === 0) return true;
  return false;
}

// Normaliza el casing de un campo en un objeto plano:
// - Si no existe (CI) → lo agrega con valorDefault
// - Si existe con casing incorrecto → lo renombra al nombre documentado
// - Si hay duplicados (ej: fixer anterior los creó) → los consolida, prefiriendo el valor no-default
function normalizarCampoCI(obj, nombreDocumentado, valorDefault) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return 0;
  const lower = nombreDocumentado.toLowerCase();
  const coincidencias = Object.keys(obj).filter(k => k.toLowerCase() === lower);

  if (coincidencias.length === 0) {
    obj[nombreDocumentado] = valorDefault;
    return 1;
  }
  if (coincidencias.length === 1 && coincidencias[0] === nombreDocumentado) return 0;

  // Elegir el mejor valor (preferir el no-default)
  let mejorValor = valorDefault;
  for (const k of coincidencias) {
    if (!isValorDefault(obj[k])) { mejorValor = obj[k]; break; }
    if (isValorDefault(mejorValor)) mejorValor = obj[k];
  }
  for (const k of coincidencias) delete obj[k];
  obj[nombreDocumentado] = mejorValor;
  return 1;
}

// Igual que normalizarCampoCI pero navega el patrón wrapper antes de normalizar
function normalizarCampoAnidadoCI(obj, nombreDocumentado, valorDefault) {
  if (!obj || typeof obj !== 'object') return 0;
  let target = obj;
  if (Array.isArray(obj)) {
    if (!obj[0] || typeof obj[0] !== 'object') return 0;
    target = obj[0];
  } else {
    const keys = Object.keys(obj);
    if (keys.length === 1) {
      const inner = obj[keys[0]];
      if (Array.isArray(inner)) { if (!inner[0] || typeof inner[0] !== 'object') return 0; target = inner[0]; }
      else if (inner && typeof inner === 'object') target = inner;
    }
  }
  return normalizarCampoCI(target, nombreDocumentado, valorDefault);
}

function reemplazarJsonEnMd(contenido, tituloSeccion, nuevoJson) {
  const jsonStr = JSON.stringify(nuevoJson, null, 2);
  return contenido.replace(
    new RegExp(
      `(:::.*?details.*?${tituloSeccion}[\\s\\S]*?@tab JSON\\s*\\n\`\`\`json\\s*\\n)([\\s\\S]*?)(\`\`\`)`,
      'i'
    ),
    (_, pre, _old, post) => `${pre}${jsonStr}\n${post}`
  );
}

function fixarJsonSeccion(json, campos, camposIgnorados, sdtsConTipos) {
  if (!json || !campos) return 0;
  let cambios = 0;

  for (const campo of campos) {
    if (camposIgnorados.has(campo.nombre)) continue;

    // Normalizar casing a nivel raíz (agrega si no existe, renombra si mal escrito, consolida duplicados)
    const c = normalizarCampoCI(json, campo.nombre, campo.esSdt ? {} : obtenerDefaultPorTipo(campo.tipo));
    cambios += c;

    if (campo.esSdt && campo.nombreSdt) {
      const camposSdt = sdtsConTipos[campo.nombreSdt.toLowerCase()];
      if (!camposSdt) continue;
      const valorEnJson = json[campo.nombre];
      for (const { nombre: ck, tipo: ct } of camposSdt) {
        cambios += normalizarCampoAnidadoCI(valorEnJson, ck, obtenerDefaultPorTipo(ct));
      }
    }
  }
  return cambios;
}

// ── XML fix ───────────────────────────────────────────────────

function detectarNsXml(xml) {
  const m = (xml || '').match(/<(\w+):Btinreq/i);
  return m ? m[1] + ':' : '';
}

function jsonValorAXml(valor) {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'object') return '';
  if (typeof valor === 'boolean') return valor ? 'true' : 'false';
  return String(valor);
}

function obtenerValorAnidadoJson(obj, campoClave) {
  if (!obj || typeof obj !== 'object') return undefined;
  if (Array.isArray(obj)) return obj[0] ? obtenerValorAnidadoJson(obj[0], campoClave) : undefined;
  if (Object.prototype.hasOwnProperty.call(obj, campoClave)) return obj[campoClave];
  const keys = Object.keys(obj);
  if (keys.length === 1) {
    const inner = obj[keys[0]];
    if (Array.isArray(inner) && inner[0]) return obtenerValorAnidadoJson(inner[0], campoClave);
    if (inner && typeof inner === 'object') return obtenerValorAnidadoJson(inner, campoClave);
  }
  return undefined;
}

function reemplazarXmlEnMd(contenido, tituloSeccion, nuevoXml) {
  return contenido.replace(
    new RegExp(
      `(:::.*?details.*?${tituloSeccion}[\\s\\S]*?@tab XML\\s*\\n\`\`\`xml\\s*\\n)([\\s\\S]*?)(\`\`\`)`,
      'i'
    ),
    (_, pre, _old, post) => `${pre}${nuevoXml.trimEnd()}\n${post}`
  );
}

// Renombra todas las ocurrencias de un tag XML (CI) al nombre correcto
function renombrarTagXml(xml, nombreCorrecto) {
  return xml
    .replace(new RegExp(`<(\\w+:)?(${nombreCorrecto})([ />])`, 'gi'), `<$1${nombreCorrecto}$3`)
    .replace(new RegExp(`</(\\w+:)?(${nombreCorrecto})>`, 'gi'), `</$1${nombreCorrecto}>`);
}

function fixarXmlSeccion(xml, campos, camposIgnorados, sdtsConTipos, jsonObj, esInvocacion) {
  if (!xml || !campos) return { xml: xml || '', cambios: 0 };
  const ns = detectarNsXml(xml);
  let cambios = 0;

  for (const campo of campos) {
    if (camposIgnorados.has(campo.nombre)) continue;

    if (!tagExisteEnXml(xml, campo.nombre)) {
      // Tag totalmente ausente → insertar
      const valorJson = jsonObj ? jsonObj[campo.nombre] : undefined;
      const xmlVal = jsonValorAXml(valorJson);
      const tag = `${ns}${campo.nombre}`;
      const nuevoTag = (campo.esSdt || typeof valorJson === 'object')
        ? `<${tag}></${tag}>`
        : `<${tag}>${xmlVal}</${tag}>`;

      let nuevoXml;
      if (esInvocacion) {
        nuevoXml = xml.replace(
          new RegExp(`(<\\/(?:\\w+:)?Btinreq>)`, 'i'),
          `$1\n         ${nuevoTag}`
        );
      } else {
        const refTag = /Erroresnegocio/i.test(xml) ? 'Erroresnegocio' : 'Btoutreq';
        nuevoXml = xml.replace(
          new RegExp(`([ \\t]*<(?:\\w+:)?${refTag}(?:[\\s>]))`, 'i'),
          `         ${nuevoTag}\n$1`
        );
      }
      if (nuevoXml !== xml) { xml = nuevoXml; cambios++; }
    } else {
      // Tag existe (CI) → verificar si el casing es exacto; si no, renombrar
      const matchActual = xml.match(new RegExp(`<(?:\\w+:)?(${campo.nombre})(?:[\\s/>])`, 'i'));
      if (matchActual && matchActual[1] !== campo.nombre) {
        xml = renombrarTagXml(xml, campo.nombre);
        cambios++;
      }
    }

    if (campo.esSdt && campo.nombreSdt) {
      const camposSdt = sdtsConTipos[campo.nombreSdt.toLowerCase()];
      if (!camposSdt) continue;
      const contenedor = extraerContenidoTag(xml, campo.nombre);
      if (!contenedor) continue;

      for (const { nombre: ck, tipo: ct } of camposSdt) {
        if (!tagExisteEnXml(contenedor, ck)) {
          // Tag ausente → insertar
          const valAnidado = jsonObj ? obtenerValorAnidadoJson(jsonObj[campo.nombre], ck) : undefined;
          const xmlVal = (valAnidado === undefined || valAnidado === null)
            ? jsonValorAXml(obtenerDefaultPorTipo(ct))
            : jsonValorAXml(valAnidado);
          const nuevoTag = `<${ck}>${xmlVal}</${ck}>`;

          let nuevoXml = xml.replace(
            new RegExp(`([ \\t]*<\\/(?:\\w+:)?${campo.nombreSdt}>)`, 'i'),
            `            ${nuevoTag}\n$1`
          );
          if (nuevoXml === xml) {
            nuevoXml = xml.replace(
              new RegExp(`([ \\t]*<\\/(?:\\w+:)?${campo.nombre}>)`, 'i'),
              `            ${nuevoTag}\n$1`
            );
          }
          if (nuevoXml !== xml) { xml = nuevoXml; cambios++; }
        } else {
          // Tag existe (CI) → verificar casing exacto dentro del contenedor
          const matchActual = contenedor.match(new RegExp(`<(?:\\w+:)?(${ck})(?:[\\s/>])`, 'i'));
          if (matchActual && matchActual[1] !== ck) {
            // Renombrar solo dentro del bloque del campo contenedor
            const contenedorFixed = renombrarTagXml(contenedor, ck);
            xml = xml.replace(contenedor, contenedorFixed);
            cambios++;
          }
        }
      }
    }
  }

  return { xml, cambios };
}

// ── Archivo + Carpeta ─────────────────────────────────────────

function fixarArchivo(filePath) {
  let contenido = fs.readFileSync(filePath, 'utf8');
  let totalCambios = 0;

  // --- Paso 0: normalizar sufijos de nombres de campo en las tablas del MD ---
  const { resultado: contenidoNorm, cambios: c0 } = normalizarNombresEnMd(contenido);
  if (c0 > 0) { contenido = contenidoNorm; totalCambios += c0; }

  // Re-parsear con los nombres ya corregidos
  const sdtsConTipos = parsearSdtsConTipos(contenido);
  const camposEntrada = parsearTablaParametros(parsearSeccionTab(contenido, 'Datos de Entrada'));
  const camposSalida = parsearTablaParametros(parsearSeccionTab(contenido, 'Datos de Salida'));

  // --- JSON ---
  const jsonInv = parsearJsonEjemplo(contenido, 'Invocación');
  const c1 = fixarJsonSeccion(jsonInv, camposEntrada, CAMPOS_IGNORADOS_ENTRADA, sdtsConTipos);
  if (c1 > 0) { console.log("JSON Inv cambios:",c1); contenido = reemplazarJsonEnMd(contenido, 'Invocación', jsonInv); totalCambios += c1; }

  const jsonResp = parsearJsonEjemplo(contenido, 'Respuesta');
  const c2 = fixarJsonSeccion(jsonResp, camposSalida, CAMPOS_IGNORADOS_SALIDA, sdtsConTipos);
  if (c2 > 0) { console.log("JSON Resp cambios:",c2); contenido = reemplazarJsonEnMd(contenido, 'Respuesta', jsonResp); totalCambios += c2; }

  // --- XML (usa los valores del JSON ya corregidos) ---
  const xmlInv = parsearXmlEjemplo(contenido, 'Invocación');
  const { xml: xmlInvFixed, cambios: c3 } = fixarXmlSeccion(xmlInv, camposEntrada, CAMPOS_IGNORADOS_ENTRADA, sdtsConTipos, jsonInv, true);
  if (c3 > 0) { contenido = reemplazarXmlEnMd(contenido, 'Invocación', xmlInvFixed); totalCambios += c3; }

  const xmlResp = parsearXmlEjemplo(contenido, 'Respuesta');
  const { xml: xmlRespFixed, cambios: c4 } = fixarXmlSeccion(xmlResp, camposSalida, CAMPOS_IGNORADOS_SALIDA, sdtsConTipos, jsonResp, false);
  if (c4 > 0) { contenido = reemplazarXmlEnMd(contenido, 'Respuesta', xmlRespFixed); totalCambios += c4; }

  if (totalCambios > 0) fs.writeFileSync(filePath, contenido, 'utf8');
  return totalCambios;
}

function fixarCarpeta(carpeta) {
  if (!fs.existsSync(carpeta)) { console.error(`❌ No existe la carpeta: ${carpeta}`); process.exit(1); }

  const archivos = buscarMdRecursivo(carpeta).map(f => path.relative(carpeta, f));
  if (archivos.length === 0) { console.log(`⚠️  No se encontraron archivos .md en: ${carpeta}`); return; }

  console.log(`\n🔧 Corrigiendo ${archivos.length} archivos en: ${carpeta}`);
  console.log('─'.repeat(60));

  let corregidos = 0;
  let sinCambios = 0;

  for (const archivo of archivos) {
    const filePath = path.join(carpeta, archivo);
    const nombre = archivo.replace(/\\/g, '/');
    const cambios = fixarArchivo(filePath);
    if (cambios > 0) { console.log(`✅ ${nombre} — ${cambios} campo(s) agregado(s)`); corregidos++; }
    else { sinCambios++; }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`🔧 Corregidos: ${corregidos} archivos | Sin cambios: ${sinCambios}`);
}


const r = fixarArchivo(process.argv[2]); console.log("Total:",r);