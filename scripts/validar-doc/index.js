// ============================================================
// Validador de archivos .md generados para documentacion Bantotal
// Soporta V3 (JSON + XML, sBT SDTs, Erroresnegocio)
//     y V4 (solo JSON, Sdts SDTs, BusinessErrors)
// Uso: node validar_md.js <Carpeta>
// ============================================================

const fs = require('fs');
const path = require('path');
const os = require('os');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Detección automática de versión por archivo
function detectarVersion(contenido) {
  if (/@tab XML/i.test(contenido)) return 'v3';
  return 'v4';
}

function camposIgnoradosEntrada() { return new Set(['Btinreq']); }
function camposIgnoradosSalida(version) {
  return version === 'v3'
    ? new Set(['Btinreq', 'Btoutreq', 'Erroresnegocio'])
    : new Set(['Btinreq', 'Btoutreq', 'BusinessErrors']);
}

// Mantener para compatibilidad con fixer (usa estas constantes en su propio scope)
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
    const esSdt = /\[[^\]]+\]\(#[^)]+\)/.test(tipo);
    const nombreSdt = esSdt ? tipo.match(/\[([^\]]+)\]/)?.[1] : null;
    campos.push({ nombre, tipo, esSdt, nombreSdt });
  }
  return campos.length > 0 ? campos : null;
}

// Devuelve los nombres (lowercase) de campos marcados [Hidden] en la tabla — documentados
// pero excluidos de validación. Se usan para no reportarlos como "no documentados" en el reverse check.
function parsearCamposOcultos(bloque) {
  const ocultos = new Set();
  if (!bloque) return ocultos;
  for (const linea of bloque.trim().split('\n')) {
    const partes = linea.split('|').map(p => p.trim());
    if (partes.length < 3) continue;
    const nombre = partes[0];
    const comentario = partes[2] || '';
    if (!nombre || nombre.startsWith(':') || nombre === 'Nombre') continue;
    if (/hidden/i.test(comentario)) ocultos.add(nombre.toLowerCase());
  }
  return ocultos;
}

function parsearSeccionTab(contenido, nombreTab) {
  const regex = new RegExp(`@tab ${nombreTab}\\s*\\n([\\s\\S]*?)(?=@tab |:::)`, 'i');
  const match = contenido.match(regex);
  return match ? match[1] : null;
}

function parsearJsonEjemplo(contenido, tituloSeccion) {
  // Intento 1: bloque completo ```json...```
  const regexCompleto = new RegExp(
    `:::.*?details.*?${tituloSeccion}[\\s\\S]*?@tab JSON\\s*\\n\`\`\`json\\s*\\n([\\s\\S]*?)\`\`\``,
    'i'
  );
  const matchCompleto = contenido.match(regexCompleto);
  if (matchCompleto) {
    const raw = matchCompleto[1];
    const inicio = raw.indexOf('{');
    const fin = raw.lastIndexOf('}');
    if (inicio === -1 || fin === -1 || fin <= inicio) {
      return { data: null, error: 'No se encontró objeto { } en el bloque JSON' };
    }
    try {
      const texto = raw.slice(inicio, fin + 1).replace(/,(\s*[}\]])/g, '$1');
      return { data: JSON.parse(texto), error: null };
    } catch (e) {
      return { data: null, error: `JSON inválido: ${e.message}` };
    }
  }

  // Intento 2: diagnóstico del motivo (sin lookahead complejo)
  const idxSeccion = contenido.search(new RegExp(`:::.*?details.*?${tituloSeccion}`, 'i'));
  if (idxSeccion === -1) return { data: null, error: `No se encontró la sección "${tituloSeccion}"` };

  const resto = contenido.slice(idxSeccion);
  const idxTabJson = resto.search(/@tab JSON/i);
  if (idxTabJson === -1) return { data: null, error: 'No tiene sección @tab JSON' };

  const desdeTabJson = resto.slice(idxTabJson);
  if (!/```json/i.test(desdeTabJson)) return { data: null, error: 'No tiene bloque ```json' };

  return { data: null, error: 'Falta el cierre ``` del bloque JSON' };
}

// Regex que matchea SDTs definidos con "::: details NAME" o "### NAME" anidados
// Termina al encontrar :::, o un nuevo "### Heading" en inicio de línea
const SDT_REGEX = () => /(?:(?:::.*?details\s+)|(?:^###\s+))(\w+)\s*\n[\s\S]*?Los campos del tipo de dato estructurado \w+ son los siguientes:\s*\r?\n\s*Nombre \| Tipo \| Comentarios\s*\r?\n[:\s\-|]+\r?\n([\s\S]*?)(?=:::|^###\s)/gim;

function parsearSdts(contenido) {
  const sdts = {};
  const regex = SDT_REGEX();
  let match;
  while ((match = regex.exec(contenido)) !== null) {
    const nombreSdt = match[1];
    const campos = parsearTablaParametros(match[2]);
    if (campos) sdts[nombreSdt.toLowerCase()] = campos.map(c => c.nombre);
  }
  return sdts;
}

function parsearSdtsConTipos(contenido) {
  const sdts = {};
  const regex = SDT_REGEX();
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
  // Patrón wrapper: { "sBTNivel": [...] } — un solo key que ES un nombre de tipo SDT (no un campo)
  // Solo desenvolver si la clave parece tipo SDT, para no confundirla con un SDT de un único campo
  if (keys.length === 1 && /^(?:sBT|SdtsBT)/i.test(keys[0])) {
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

// Extrae el contenido directo del envelope de respuesta/invocación SOAP y devuelve el Set
// de nombres de tags que son hijos DIRECTOS (profundidad 0 dentro del envelope).
// Reconoce cualquier tag Bantotal con punto: BTModulo.Metodo o BTModulo.MetodoResponse
function getDirectChildTagNames(xml) {
  // Busca el wrapper del método Bantotal (tag que contiene un punto, ignorando prefijo ns)
  const wm = xml.match(/<(?:\w+:)?([A-Za-z][\w.]*\.[A-Za-z][\w.]*)(?:\s[^>]*)?>[\s\S]*?<\/(?:\w+:)?\1>/i);
  let raiz = xml;
  if (wm) {
    const escaped = wm[1].replace(/\./g, '\\.');
    const im = xml.match(new RegExp(`<(?:\\w+:)?${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:\\w+:)?${escaped}>`, 'i'));
    if (im) raiz = im[1];
  }
  // Rastrear profundidad para encontrar solo hijos directos
  const names = new Set();
  let i = 0, depth = 0;
  while (i < raiz.length) {
    if (raiz[i] !== '<') { i++; continue; }
    const sub = raiz.substring(i);
    const closeIdx = sub.indexOf('>');
    if (closeIdx < 0) break;
    if (/^<[/!?]/.test(sub)) {       // closing tag, comment o PI
      if (sub[1] === '/') depth--;
      i += closeIdx + 1;
    } else {
      const nm = sub.match(/^<([\w:.]+)/);
      const selfClose = sub[closeIdx - 1] === '/';
      if (nm && depth === 0) {
        const local = nm[1].includes(':') ? nm[1].split(':')[1] : nm[1];
        names.add(local.toLowerCase());
      }
      if (!selfClose) depth++;
      i += closeIdx + 1;
    }
  }
  return names;
}

function validarParametrosContraXml(campos, xmlStr, camposIgnorados, sdts, etiqueta, camposOcultos = new Set()) {
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

  // Para la detección del nombre alternativo (tipo SDT en lugar del nombre de parámetro),
  // solo consideramos hijos DIRECTOS del envelope, no tags anidados a mayor profundidad.
  const tagHijosDirectos = getDirectChildTagNames(xmlLimpio);

  for (const campo of campos) {
    // Nombre efectivo del tag en el XML (puede ser el nombre del parámetro o el del tipo SDT)
    let tagEfectivo = campo.nombre;
    if (!tagExisteEnXml(xmlLimpio, campo.nombre)) {
      if (campo.esSdt && campo.nombreSdt && tagHijosDirectos.has(campo.nombreSdt.toLowerCase())) {
        tagEfectivo = campo.nombreSdt;
        problemas.push(`❌ [XML ${etiqueta}] "${campo.nombre}" aparece en el ejemplo como "${campo.nombreSdt}" — el ejemplo debe usar el nombre del parámetro, no el nombre del tipo SDT`);
      } else {
        problemas.push(`❌ [XML ${etiqueta}] "${campo.nombre}" documentado pero ausente en el ejemplo XML`);
        continue;
      }
    }

    if (campo.esSdt && campo.nombreSdt) {
      const camposSdt = sdts[campo.nombreSdt.toLowerCase()];
      if (!camposSdt) continue;

      const contenedor = extraerContenidoTag(xmlLimpio, tagEfectivo);
      if (contenedor === null) continue;  // null = tag ausente; "" = tag vacío → validar igual

      for (const campoClave of camposSdt) {
        if (!tagExisteEnXml(contenedor, campoClave)) {
          problemas.push(`❌ [XML ${etiqueta}] SDT "${campo.nombreSdt}.${campoClave}" documentado pero ausente en el ejemplo XML`);
        } else {
          const matchTag = contenedor.match(new RegExp(`<(?:\\w+:)?(${campoClave})(?:[\\s/>])`, 'i'));
          if (matchTag && matchTag[1] !== campoClave) {
            problemas.push(`❌ [XML ${etiqueta}] SDT "${campo.nombreSdt}" — casing difiere: documentado como "${campoClave}", en el ejemplo aparece como "${matchTag[1]}"`);
          }
        }
      }
    }
  }

  // Reverse check: tags en el ejemplo que no están documentados o son hidden
  const nombresDocXml = new Set(campos.map(c => c.nombre.toLowerCase()));
  for (const tag of tagHijosDirectos) {
    if (camposIgnorados.has(tag) || nombresDocXml.has(tag)) continue;
    const matchReal = xmlLimpio.match(new RegExp(`<(?:\\w+:)?(${escapeRegex(tag)})(?:[\\s/>])`, 'i'));
    const tagDisplay = matchReal ? matchReal[1] : tag;
    if (camposOcultos.has(tag)) {
      problemas.push(`❌ [XML ${etiqueta}] <${tagDisplay}> está marcado como [Hidden] y no debe aparecer en el ejemplo`);
    } else {
      problemas.push(`⚠️  [XML ${etiqueta}] <${tagDisplay}> está en el ejemplo pero no está documentado en los parámetros`);
    }
  }

  return problemas;
}

// ── JSON ──────────────────────────────────────────────────────

function validarParametrosContraEjemplo(campos, jsonEjemplo, camposIgnorados, sdts, etiqueta, errorParseo = null, camposOcultos = new Set()) {
  const problemas = [];
  if (!campos) return problemas;
  if (!jsonEjemplo) {
    const motivo = errorParseo || 'motivo desconocido';
    problemas.push(`⚠️  [${etiqueta}] No se pudo parsear el JSON — ${motivo}`);
    return problemas;
  }

  // Desenvolver envelope SOAP/REST si existe ({"BT...Response":{...}})
  const jsonEf = desenvolverEnvoltorio(jsonEjemplo);
  // Mapa CI: lowercase → key real (para no reportar falsos positivos por diferencias de casing)
  const mapaRaiz = new Map(
    Object.keys(jsonEf).filter(k => !camposIgnorados.has(k)).map(k => [k.toLowerCase(), k])
  );

  for (const campo of campos) {
    let keyEnJson = mapaRaiz.get(campo.nombre.toLowerCase());

    if (!keyEnJson) {
      // Fallback: algunos ejemplos usan el nombre del tipo SDT en lugar del nombre del parámetro
      if (campo.esSdt && campo.nombreSdt && mapaRaiz.has(campo.nombreSdt.toLowerCase())) {
        keyEnJson = mapaRaiz.get(campo.nombreSdt.toLowerCase());
        problemas.push(`❌ [${etiqueta}] "${campo.nombre}" aparece en el ejemplo como "${keyEnJson}" — el ejemplo debe usar el nombre del parámetro, no el nombre del tipo SDT`);
      } else {
        problemas.push(`❌ [${etiqueta}] "${campo.nombre}" documentado pero ausente en el ejemplo JSON`);
        continue;
      }
    }

    if (campo.esSdt && campo.nombreSdt) {
      const camposSdt = sdts[campo.nombreSdt.toLowerCase()];
      if (!camposSdt) continue;

      const valorEnJson = jsonEf[keyEnJson];
      const clavesAnidadas = obtenerClavesJson(valorEnJson);
      // Mapa lowercase → clave real para detectar tanto ausencia como diferencia de casing
      const mapaAnidado = new Map([...clavesAnidadas].map(k => [k.toLowerCase(), k]));

      for (const campoClave of camposSdt) {
        const claveEnJson = mapaAnidado.get(campoClave.toLowerCase());
        if (!claveEnJson) {
          problemas.push(`❌ [${etiqueta}] SDT "${campo.nombreSdt}.${campoClave}" documentado pero ausente en el ejemplo JSON`);
        } else if (claveEnJson !== campoClave) {
          problemas.push(`❌ [${etiqueta}] SDT "${campo.nombreSdt}" — casing difiere: documentado como "${campoClave}", en el ejemplo aparece como "${claveEnJson}"`);
        }
      }
    }
  }

  // Reverse check: claves en el JSON que no están documentadas o son hidden
  const nombresDocJson = new Set(campos.map(c => c.nombre.toLowerCase()));
  for (const [lower, real] of mapaRaiz) {
    if (nombresDocJson.has(lower)) continue;
    if (camposOcultos.has(lower)) {
      problemas.push(`❌ [${etiqueta}] "${real}" está marcado como [Hidden] y no debe aparecer en el ejemplo`);
    } else {
      problemas.push(`⚠️  [${etiqueta}] "${real}" está en el ejemplo pero no está documentado en los parámetros`);
    }
  }

  return problemas;
}

function detectarSdtsAnidados(contenido) {
  const problemas = [];

  const detailsRegex = /^::: details (\w+)/gim;
  const bloques = [];
  let m;
  while ((m = detailsRegex.exec(contenido)) !== null) {
    bloques.push({ pos: m.index, nombre: m[1] });
  }

  for (let i = 0; i < bloques.length; i++) {
    const inicio = bloques[i].pos;
    const fin = i + 1 < bloques.length ? bloques[i + 1].pos : contenido.length;
    const bloque = contenido.slice(inicio, fin);

    const sdtDefRegex = /Los campos del tipo de dato estructurado (\w+) son los siguientes:/gi;
    const defs = [];
    let sm;
    while ((sm = sdtDefRegex.exec(bloque)) !== null) {
      defs.push(sm[1]);
    }

    if (defs.length > 1) {
      const anidados = defs.slice(1);
      problemas.push(`❌ Bloque "::: details ${bloques[i].nombre}" contiene SDT(s) anidado(s): ${anidados.join(', ')} — cada SDT debe ser un bloque ::: details independiente`);
    }
  }

  // SDT definitions outside any ::: details block
  const limiteInicio = bloques.length > 0 ? bloques[0].pos : contenido.length;
  const antesDelPrimero = contenido.slice(0, limiteInicio);
  const sdtFueraRegex = /Los campos del tipo de dato estructurado (\w+) son los siguientes:/gi;
  const sdtFuera = [];
  let sf;
  while ((sf = sdtFueraRegex.exec(antesDelPrimero)) !== null) {
    sdtFuera.push(sf[1]);
  }
  if (sdtFuera.length > 0) {
    problemas.push(`❌ SDT(s) definido(s) fuera de un bloque ::: details: ${sdtFuera.join(', ')} — cada SDT debe tener su propio bloque ::: details`);
  }

  return problemas;
}

function validarArchivo(filePath) {
  const contenido = fs.readFileSync(filePath, 'utf8');
  const nombre = path.basename(filePath);
  const problemas = [];
  const version = detectarVersion(contenido);
  const ignoradosEntrada = camposIgnoradosEntrada();
  const ignoradosSalida = camposIgnoradosSalida(version);

  // --- Validaciones comunes ---
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
  const revisar = (contenido.match(/\bREVISAR\b/g) || []).length;
  if (revisar > 0) {
    problemas.push(`⚠️  ${revisar} campo(s) con valor "REVISAR" pendiente(s) de completar`);
  }
  // --- Validaciones estructurales ---

  // SDTs inline dentro de tabs (deben estar al final como ::: details)
  const _bloqueEntradaEst = parsearSeccionTab(contenido, 'Datos de Entrada');
  const _bloqueSalidaEst  = parsearSeccionTab(contenido, 'Datos de Salida');
  const tabsConSdtInline = [];
  if (_bloqueEntradaEst && /Los campos del tipo de dato estructurado/i.test(_bloqueEntradaEst)) {
    tabsConSdtInline.push('Datos de Entrada');
  }
  if (_bloqueSalidaEst && /Los campos del tipo de dato estructurado/i.test(_bloqueSalidaEst)) {
    tabsConSdtInline.push('Datos de Salida');
  }
  if (tabsConSdtInline.length > 0) {
    problemas.push(`❌ Definiciones de SDT inline en tab(s) ${tabsConSdtInline.join(', ')} — deben estar al final del documento en bloques ::: details`);
  }

  // SDTs anidados dentro de otros bloques ::: details
  problemas.push(...detectarSdtsAnidados(contenido));

  // Tipos SDT en tablas sin hipervínculo [Nombre](#anchor)
  const sdtSinLink = new Set();
  const rowSdtRegex = /^[a-zA-Z_]\w*[ \t]*\|[ \t]*(sBT\w+|Sdts\w+)[ \t]*\|/gm;
  let _m;
  while ((_m = rowSdtRegex.exec(contenido)) !== null) {
    sdtSinLink.add(_m[1]);
  }
  if (sdtSinLink.size > 0) {
    problemas.push(`❌ Tipos SDT sin enlace en tabla de parámetros: ${[...sdtSinLink].join(', ')} — usar formato [Nombre](#anchor)`);
  }

  // Placeholder '...' en ejemplos (JSON/XML incompletos)
  const ejemplosConPuntos = [];
  if (/:::.*?details.*?Invocaci[oó]n[\s\S]*?```[\s\S]*?\.\.\.[\s\S]*?```/i.test(contenido)) {
    ejemplosConPuntos.push('Invocación');
  }
  if (/:::.*?details.*?Respuesta[\s\S]*?```[\s\S]*?\.\.\.[\s\S]*?```/i.test(contenido)) {
    ejemplosConPuntos.push('Respuesta');
  }
  if (ejemplosConPuntos.length > 0) {
    problemas.push(`⚠️  Placeholder "..." en ejemplo(s) de ${ejemplosConPuntos.join(', ')} (ejemplo incompleto)`);
  }

  // JSON de respuesta sin bloque de código ```json
  if (!/:::.*?details.*?Respuesta[\s\S]*?```json/i.test(contenido)) {
    problemas.push('❌ Ejemplo de Respuesta sin bloque de código ```json');
  }

  // Comentarios en tablas que comienzan con minúscula
  const comentariosMinuscula = [];
  for (const linea of contenido.split(/\r?\n/)) {
    const t = linea.trim();
    if (!t || t.startsWith(':')) continue;
    const cols = t.split('|');
    if (cols.length < 3) continue;
    const campo = cols[0].trim();
    const comentario = cols[2].trim();
    if (!campo || !comentario) continue;
    if (/^(Nombre|Código|Campo|Parámetro|Nombre publicación)$/i.test(campo)) continue;
    if (/^[a-záéíóúüñàèìòùäëïöü]/.test(comentario)) {
      comentariosMinuscula.push(`"${campo}": ${comentario.substring(0, 40)}${comentario.length > 40 ? '...' : ''}`);
    }
  }
  if (comentariosMinuscula.length > 0) {
    problemas.push(`⚠️  ${comentariosMinuscula.length} comentario(s) de tabla comienzan con minúscula: ${comentariosMinuscula.slice(0, 3).join(' | ')}${comentariosMinuscula.length > 3 ? ` (+${comentariosMinuscula.length - 3} más)` : ''}`);
  }

  // --- Validación de parámetros contra ejemplos ---
  const sdts = parsearSdts(contenido);

  const bloqueEntrada = parsearSeccionTab(contenido, 'Datos de Entrada');
  const camposEntrada = parsearTablaParametros(bloqueEntrada);
  const bloqueSalida = parsearSeccionTab(contenido, 'Datos de Salida');
  const camposSalida = parsearTablaParametros(bloqueSalida);

  const ocultoEntrada = parsearCamposOcultos(bloqueEntrada);
  const ocultoSalida  = parsearCamposOcultos(bloqueSalida);

  // JSON (V3 y V4)
  const resJsonInv = parsearJsonEjemplo(contenido, 'Invocación');
  problemas.push(...validarParametrosContraEjemplo(camposEntrada, resJsonInv.data, ignoradosEntrada, sdts, 'Entrada', resJsonInv.error, ocultoEntrada));
  const resJsonResp = parsearJsonEjemplo(contenido, 'Respuesta');
  problemas.push(...validarParametrosContraEjemplo(camposSalida, resJsonResp.data, ignoradosSalida, sdts, 'Salida', resJsonResp.error, ocultoSalida));

  // XML (solo V3)
  if (version === 'v3') {
    const xmlInvocacion = parsearXmlEjemplo(contenido, 'Invocación');
    problemas.push(...validarParametrosContraXml(camposEntrada, xmlInvocacion, ignoradosEntrada, sdts, 'Entrada', ocultoEntrada));
    const xmlRespuesta = parsearXmlEjemplo(contenido, 'Respuesta');
    problemas.push(...validarParametrosContraXml(camposSalida, xmlRespuesta, ignoradosSalida, sdts, 'Salida', ocultoSalida));
  }

  return { nombre, problemas, version };
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

// Cross-reference: actualiza nombres de campo en las tablas MD usando el JSON como referencia.
// Cuando la tabla tiene un nombre con MENOS uppercase que el JSON, el JSON (de una llamada real)
// tiene el casing correcto → se actualiza la tabla. Si la tabla tiene igual o más uppercase,
// se conserva la tabla y el fixer corregirá el JSON.
function normalizarNombresConJson(contenido, camposEntrada, camposSalida, jsonInv, jsonResp) {
  function ucCount(s) { return (s.match(/[A-Z]/g) || []).length; }
  const mapaRef = new Map(); // lowercase → nombre con más uppercase

  function addKey(k) {
    const lower = k.toLowerCase();
    const ex = mapaRef.get(lower);
    if (!ex || ucCount(k) > ucCount(ex)) mapaRef.set(lower, k);
  }

  // Agrega claves del objeto SDT anidado dentro del JSON root
  function addSdtInner(json, campos) {
    if (!json || typeof json !== 'object' || !campos) return;
    for (const campo of campos) {
      if (!campo.esSdt) continue;
      const subKey = Object.keys(json).find(k => k.toLowerCase() === campo.nombre.toLowerCase());
      if (!subKey) continue;
      let sub = json[subKey];
      // Patrón wrapper: { sBTNivel: [{...}] }
      if (sub && typeof sub === 'object' && !Array.isArray(sub)) {
        const subKeys = Object.keys(sub);
        if (subKeys.length === 1) {
          const inner = sub[subKeys[0]];
          if (Array.isArray(inner) && inner.length > 0) sub = inner[0];
          else if (inner && typeof inner === 'object') sub = inner;
        }
      }
      if (Array.isArray(sub) && sub.length > 0) sub = sub[0];
      if (sub && typeof sub === 'object' && !Array.isArray(sub)) {
        Object.keys(sub).forEach(addKey);
      }
    }
  }

  // Claves raíz de ambos JSONs (desenvolver envelope SOAP si existe)
  const efInv  = desenvolverEnvoltorio(jsonInv);
  const efResp = desenvolverEnvoltorio(jsonResp);
  if (efInv  && typeof efInv  === 'object') Object.keys(efInv ).forEach(addKey);
  if (efResp && typeof efResp === 'object') Object.keys(efResp).forEach(addKey);
  // Claves internas de SDTs
  addSdtInner(efInv,  camposEntrada);
  addSdtInner(efResp, camposSalida);

  let cambios = 0;
  const resultado = contenido.replace(
    /^([a-zA-Z_]\w*)([ \t]*\|[ \t]*[^|\n]+\|[^\n]*)$/gm,
    (linea, nombre, resto) => {
      const ref = mapaRef.get(nombre.toLowerCase());
      if (!ref || ref === nombre) return linea;
      if (ucCount(ref) <= ucCount(nombre)) return linea; // tabla ya tiene igual o más uppercase → conservar
      cambios++;
      return ref + resto;
    }
  );
  return { resultado, cambios };
}

function obtenerDefaultPorTipo(_tipo) {
  return 'REVISAR';
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

// Detecta el envoltorio SOAP/REST (ej: {"BTClientes.ObtenerResponse":{...}}) y devuelve el objeto interno.
// Al devolver una referencia al objeto interno, cualquier modificación persiste en el wrapper original.
function desenvolverEnvoltorio(json) {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return json;
  const keys = Object.keys(json);
  if (keys.length !== 1) return json;
  const inner = json[keys[0]];
  if (!inner || typeof inner !== 'object' || Array.isArray(inner)) return json;
  if ('Btinreq' in inner || 'Btoutreq' in inner || 'Erroresnegocio' in inner || 'BusinessErrors' in inner) {
    return inner;
  }
  return json;
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

function fixarJsonSeccion(json, campos, camposIgnorados, sdtsConTipos, camposOcultos = new Set()) {
  if (!json || !campos) return 0;
  // Trabalhar sobre el objeto interno si hay envelope SOAP (la mutación persiste en el wrapper vía referencia)
  json = desenvolverEnvoltorio(json);
  let cambios = 0;

  // Eliminar campos marcados [Hidden] del ejemplo
  for (const oculto of camposOcultos) {
    const keyReal = Object.keys(json).find(k => k.toLowerCase() === oculto);
    if (keyReal) {
      delete json[keyReal];
      cambios++;
    }
  }

  for (const campo of campos) {
    if (camposIgnorados.has(campo.nombre)) continue;

    // Si el parámetro no existe pero el tipo SDT sí está como clave, usarlo sin duplicar
    const altSdtKey = campo.esSdt && campo.nombreSdt
      ? Object.keys(json).find(k => k.toLowerCase() === campo.nombreSdt.toLowerCase())
      : null;
    const nombreExiste = Object.keys(json).some(k => k.toLowerCase() === campo.nombre.toLowerCase());

    if (altSdtKey && !nombreExiste) {
      // El SDT existe bajo su tipo — corregir campos internos sin agregar duplicado
      const camposSdt = sdtsConTipos[campo.nombreSdt.toLowerCase()];
      if (camposSdt) {
        const valorEnJson = json[altSdtKey];
        for (const { nombre: ck, tipo: ct } of camposSdt) {
          cambios += normalizarCampoAnidadoCI(valorEnJson, ck, obtenerDefaultPorTipo(ct));
        }
      }
      continue;
    }

    // Normalizar casing a nivel raíz (agrega si no existe, renombra si mal escrito, consolida duplicados)
    const c = normalizarCampoCI(json, campo.nombre, campo.esSdt ? {} : obtenerDefaultPorTipo(campo.tipo));
    cambios += c;

    if (campo.esSdt && campo.nombreSdt) {
      const camposSdt = sdtsConTipos[campo.nombreSdt.toLowerCase()];
      if (!camposSdt) continue;

      // Si el valor existe pero no es un objeto (ej: "" vacío), convertirlo a {} para poder insertar campos
      const keyReal = Object.keys(json).find(k => k.toLowerCase() === campo.nombre.toLowerCase());
      if (keyReal && (json[keyReal] === null || typeof json[keyReal] !== 'object' || Array.isArray(json[keyReal]))) {
        json[keyReal] = {};
        cambios++;
      }

      const valorEnJson = json[keyReal || campo.nombre];
      for (const { nombre: ck, tipo: ct } of camposSdt) {
        cambios += normalizarCampoAnidadoCI(valorEnJson, ck, obtenerDefaultPorTipo(ct));
      }
    }
  }

  // Reordenar claves: Btinreq primero, parámetros en el medio, Erroresnegocio/BusinessErrors/Btoutreq al final
  cambios += reordenarClavesJson(json);

  return cambios;
}

function reordenarClavesJson(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return 0;
  const PRIMERAS = new Set(['btinreq']);
  const ULTIMAS  = new Set(['erroresnegocio', 'businesserrors', 'btoutreq']);

  const keys = Object.keys(obj);
  const primeras = keys.filter(k => PRIMERAS.has(k.toLowerCase()));
  const ultimas  = keys.filter(k => ULTIMAS.has(k.toLowerCase()));
  const medio    = keys.filter(k => !PRIMERAS.has(k.toLowerCase()) && !ULTIMAS.has(k.toLowerCase()));

  const ordenado = [...primeras, ...medio, ...ultimas];
  if (keys.join(',') === ordenado.join(',')) return 0; // ya está en orden

  const vals = {};
  for (const k of keys) vals[k] = obj[k];
  for (const k of keys) delete obj[k];
  for (const k of ordenado) obj[k] = vals[k];
  return 1;
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

function eliminarTagXml(xml, nombreTag) {
  // Elimina el tag con todo su contenido (apertura + contenido + cierre, cualquier namespace)
  const escaped = escapeRegex(nombreTag);
  return xml.replace(
    new RegExp(`\\r?\\n?[ \\t]*<(?:\\w+:)?${escaped}(?:\\s[^>]*)?>(?:[\\s\\S]*?)<\\/(?:\\w+:)?${escaped}>[ \\t]*\\r?\\n?`, 'gi'),
    '\n'
  ).replace(
    new RegExp(`\\r?\\n?[ \\t]*<(?:\\w+:)?${escaped}(?:\\s[^>]*)?\\/?>[ \\t]*\\r?\\n?`, 'gi'),
    '\n'
  );
}

function fixarXmlSeccion(xml, campos, camposIgnorados, sdtsConTipos, jsonObj, esInvocacion, camposOcultos = new Set()) {
  if (!xml || !campos) return { xml: xml || '', cambios: 0 };
  const ns = detectarNsXml(xml);
  let cambios = 0;

  // Eliminar campos marcados [Hidden] del ejemplo XML
  for (const oculto of camposOcultos) {
    if (tagExisteEnXml(xml, oculto)) {
      xml = eliminarTagXml(xml, oculto);
      cambios++;
    }
  }

  // Solo contar como "el SDT alternativo existe" si es hijo DIRECTO del wrapper BT,
  // para no confundir con ocurrencias anidadas del mismo tipo SDT en otras estructuras.
  const tagHijosDirectosFixer = getDirectChildTagNames(xml);

  for (const campo of campos) {
    if (camposIgnorados.has(campo.nombre)) continue;

    // Si el parámetro no existe como tag pero el tipo SDT sí (solo como hijo directo), tratarlo como el mismo campo
    const tagAusenteNombre = !tagExisteEnXml(xml, campo.nombre);
    const altSdtTagExiste = campo.esSdt && campo.nombreSdt && tagHijosDirectosFixer.has(campo.nombreSdt.toLowerCase());
    if (tagAusenteNombre && altSdtTagExiste) {
      // El SDT existe bajo su nombre de tipo — corregir campos internos, no insertar duplicado
      if (campo.esSdt && campo.nombreSdt) {
        const camposSdt = sdtsConTipos[campo.nombreSdt.toLowerCase()];
        if (camposSdt) {
          const contenedorAlt = extraerContenidoTag(xml, campo.nombreSdt);
          if (contenedorAlt !== null) {
            for (const { nombre: ck, tipo: ct } of camposSdt) {
              if (!tagExisteEnXml(contenedorAlt, ck)) {
                const valAnidado = jsonObj ? obtenerValorAnidadoJson(jsonObj[campo.nombreSdt] || jsonObj[campo.nombre], ck) : undefined;
                const xmlVal = (valAnidado === undefined || valAnidado === null)
                  ? jsonValorAXml(obtenerDefaultPorTipo(ct))
                  : jsonValorAXml(valAnidado);
                xml = xml.replace(
                  new RegExp(`(<\\/(?:\\w+:)?${campo.nombreSdt}>)`, 'i'),
                  `\n            <${ck}>${xmlVal}</${ck}>$1`
                );
                cambios++;
              }
            }
          }
        }
      }
      continue;
    }

    if (tagAusenteNombre) {
      // Solo insertar si el JSON ya tiene este campo (el fixer JSON lo validó previamente).
      // Si no está en el JSON tampoco, podría ser un tag con nombre incorrecto en el XML — dejar para corrección manual.
      const jsonTieneElCampo = jsonObj && Object.keys(jsonObj).some(k => k.toLowerCase() === campo.nombre.toLowerCase());
      if (!jsonTieneElCampo) continue;

      // Detectar indentación del nivel raíz buscando otros tags hermanos conocidos
      const indentMatch = xml.match(/^([ \t]*)<(?:\w+:)?(?:Btinreq|Btoutreq|Erroresnegocio|BusinessErrors)(?:\s|>)/im);
      const indent = indentMatch ? indentMatch[1] : '         ';

      // Construir el contenido interno del tag con campos del SDT (si aplica)
      let contenidoInterno = '';
      if (campo.esSdt && campo.nombreSdt) {
        const camposSdt = sdtsConTipos[campo.nombreSdt.toLowerCase()];
        if (camposSdt) {
          const jsonValCampo = jsonObj[Object.keys(jsonObj).find(k => k.toLowerCase() === campo.nombre.toLowerCase())];
          for (const { nombre: ck, tipo: ct } of camposSdt) {
            const valAnidado = obtenerValorAnidadoJson(jsonValCampo, ck);
            const xmlVal = (valAnidado === undefined || valAnidado === null)
              ? jsonValorAXml(obtenerDefaultPorTipo(ct))
              : jsonValorAXml(valAnidado);
            contenidoInterno += `\n${indent}   <${ck}>${xmlVal}</${ck}>`;
          }
        }
      }

      const nuevoTag = contenidoInterno
        ? `${indent}<${campo.nombre}>${contenidoInterno}\n${indent}</${campo.nombre}>`
        : `${indent}<${campo.nombre}></${campo.nombre}>`;

      // Insertar antes de Erroresnegocio/BusinessErrors/Btoutreq
      const insertRe = /^([ \t]*<(?:\w+:)?(?:Erroresnegocio|BusinessErrors|Btoutreq)(?:\s[^>]*)?>)/im;
      const nuevoXml = xml.replace(insertRe, `${nuevoTag}\n$1`);
      if (nuevoXml !== xml) { xml = nuevoXml; cambios++; }
      continue;
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
      if (contenedor === null) continue; // null = tag ausente; "" = vacío → insertar campos igual

      // Si el contenedor está en una sola línea (vacío), expandirlo para que la inserción quede bien indentada
      if (contenedor === '') {
        xml = xml.replace(
          new RegExp(`(<(?:\\w+:)?${escapeRegex(campo.nombre)}(?:\\s[^>]*)?>)(<\\/(?:\\w+:)?${escapeRegex(campo.nombre)}>)`, 'i'),
          (_, open, close) => {
            const indent = (xml.match(new RegExp(`([ \\t]*)<(?:\\w+:)?${escapeRegex(campo.nombre)}(?:\\s[^>]*)?>`, 'i')) || ['',''])[1];
            return `${open}\n${indent}</${campo.nombre}>`;
          }
        );
      }

      for (const { nombre: ck, tipo: ct } of camposSdt) {
        if (!tagExisteEnXml(contenedor, ck)) {
          // Tag ausente → insertar
          const valAnidado = jsonObj ? obtenerValorAnidadoJson(jsonObj[campo.nombre], ck) : undefined;
          const xmlVal = (valAnidado === undefined || valAnidado === null)
            ? jsonValorAXml(obtenerDefaultPorTipo(ct))
            : jsonValorAXml(valAnidado);
          const nuevoTag = `<${ck}>${xmlVal}</${ck}>`;

          // Siempre insertar usando campo.nombre como anchor del contenedor,
          // para no confundirlo con otros elementos del mismo tipo SDT en el documento.
          // Solo usar campo.nombreSdt si campo.nombre === campo.nombreSdt (mismo tag).
          const anchorInsertar = campo.nombre;
          const nuevoXml = xml.replace(
            new RegExp(`([ \\t]*<\\/(?:\\w+:)?${escapeRegex(anchorInsertar)}>)`, 'i'),
            `            ${nuevoTag}\n$1`
          );
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

// ── Casing ────────────────────────────────────────────────────

function renombrarClaveJson(obj, claveVieja, claveNueva) {
  if (!(claveVieja in obj) || claveVieja === claveNueva) return false;
  const entries = Object.entries(obj);
  const idx = entries.findIndex(([k]) => k === claveVieja);
  if (idx === -1) return false;
  entries[idx] = [claveNueva, entries[idx][1]];
  for (const key of Object.keys(obj)) delete obj[key];
  for (const [k, v] of entries) obj[k] = v;
  return true;
}

function fixarCasingEnTabla(contenido, sdtNombre, enDoc, enEjemplo) {
  let cambios = 0;
  // 'm' sin 'i': el nombre del campo debe coincidir exactamente (evita matchear el header "Nombre | Tipo")
  const regex = new RegExp(
    `(:::[ \\t]*details[ \\t]+${escapeRegex(sdtNombre)}[\\s\\S]*?^)(${escapeRegex(enDoc)})([ \\t]*\\|)`,
    'm'
  );
  const resultado = contenido.replace(regex, (match, prefix, _campo, pipe) => {
    cambios++;
    return prefix + enEjemplo + pipe;
  });
  return { resultado, cambios };
}

function detectarConflictosCasingArchivo(contenido) {
  const version = detectarVersion(contenido);
  const sdts = parsearSdts(contenido);
  const conflictos = [];

  for (const [seccion, tituloEjemplo, tituloDatos] of [
    ['Entrada', 'Invocación', 'Datos de Entrada'],
    ['Salida', 'Respuesta', 'Datos de Salida'],
  ]) {
    const bloque = parsearSeccionTab(contenido, tituloDatos);
    const campos = parsearTablaParametros(bloque);
    if (!campos) continue;

    const ignorados = seccion === 'Entrada' ? camposIgnoradosEntrada() : camposIgnoradosSalida(version);
    const res = parsearJsonEjemplo(contenido, tituloEjemplo);
    if (!res.data) continue;

    const mapaRaiz = new Map(
      Object.keys(res.data).filter(k => !ignorados.has(k)).map(k => [k.toLowerCase(), k])
    );

    for (const campo of campos) {
      if (ignorados.has(campo.nombre) || !campo.esSdt || !campo.nombreSdt) continue;
      const camposSdt = sdts[campo.nombreSdt.toLowerCase()];
      if (!camposSdt) continue;

      const keyEnJson = mapaRaiz.get(campo.nombre.toLowerCase()) || mapaRaiz.get(campo.nombreSdt.toLowerCase());
      if (!keyEnJson) continue;

      const valorEnJson = res.data[keyEnJson];
      const clavesAnidadas = obtenerClavesJson(valorEnJson);
      const mapaAnidado = new Map([...clavesAnidadas].map(k => [k.toLowerCase(), k]));

      for (const campoClave of camposSdt) {
        const claveEnJson = mapaAnidado.get(campoClave.toLowerCase());
        if (claveEnJson && claveEnJson !== campoClave) {
          conflictos.push({ seccion, sdt: campo.nombreSdt, sdtKey: keyEnJson, campo: campoClave, enDoc: campoClave, enEjemplo: claveEnJson });
        }
      }
    }
  }
  return conflictos;
}

function aplicarEleccionesCasing(filePath, decisions) {
  // decisions: [{sdt, sdtKey, campo, choice: 'doc'|'ejemplo', enDoc, enEjemplo}]
  let contenido = fs.readFileSync(filePath, 'utf8');
  let cambios = 0;

  for (const { sdt, sdtKey, choice, enDoc, enEjemplo } of decisions) {
    if (choice === 'doc') {
      // Renombrar en los ejemplos JSON: enEjemplo → enDoc
      for (const seccion of ['Invocación', 'Respuesta']) {
        const res = parsearJsonEjemplo(contenido, seccion);
        if (!res.data) continue;
        const mapaRaiz = new Map(Object.keys(res.data).map(k => [k.toLowerCase(), k]));
        const key = mapaRaiz.get((sdtKey || sdt).toLowerCase());
        if (!key) continue;
        const sdtObj = res.data[key];
        if (!sdtObj || typeof sdtObj !== 'object' || Array.isArray(sdtObj)) continue;
        if (renombrarClaveJson(sdtObj, enEjemplo, enDoc)) {
          contenido = reemplazarJsonEnMd(contenido, seccion, res.data);
          cambios++;
        }
      }
    } else if (choice === 'ejemplo') {
      // Renombrar en la tabla de documentación: enDoc → enEjemplo
      const { resultado, cambios: c } = fixarCasingEnTabla(contenido, sdt, enDoc, enEjemplo);
      if (c > 0) { contenido = resultado; cambios += c; }
    }
  }

  if (cambios > 0) fs.writeFileSync(filePath, contenido, 'utf8');
  return cambios;
}

function fixarCierreJsonFaltante(contenido) {
  // Detecta bloques ```json sin cierre ``` (se cierran directamente con :::)
  // Soporta tanto LF como CRLF
  const nl = contenido.includes('\r\n') ? '\r\n' : '\n';
  let resultado = contenido;
  let cambios = 0;
  resultado = resultado.replace(
    /(```json\r?\n)([\s\S]*?)(\r?\n[ \t]*:::[ \t]*(?:\r?\n|$))/g,
    (match, open, body, close) => {
      if (/```/.test(body)) return match; // ya tiene cierre
      cambios++;
      return open + body + nl + '```' + close;
    }
  );
  return { resultado, cambios };
}

function fixarArchivo(filePath) {
  let contenido = fs.readFileSync(filePath, 'utf8');
  let totalCambios = 0;

  // --- Paso 0: corregir bloques ```json sin cierre ``` ---
  const { resultado: norm00, cambios: c00 } = fixarCierreJsonFaltante(contenido);
  if (c00 > 0) { contenido = norm00; totalCambios += c00; }

  // --- Paso 0b2: capitalizar primer caracter de comentarios en tablas ---
  {
    const nl = contenido.includes('\r\n') ? '\r\n' : '\n';
    const lineas = contenido.split(/\r?\n/);
    let capCambios = 0;
    const lineasFixed = lineas.map(linea => {
      const t = linea.trim();
      if (!t || t.startsWith(':')) return linea;
      const cols = t.split('|');
      if (cols.length < 3) return linea;
      const campo = cols[0].trim();
      const comentario = cols[2].trim();
      if (!campo || !comentario) return linea;
      if (/^(Nombre|Código|Campo|Parámetro|Nombre publicación)$/i.test(campo)) return linea;
      if (/^[a-záéíóúüñàèìòùäëïöü]/.test(comentario)) {
        const capitalizado = comentario.charAt(0).toUpperCase() + comentario.slice(1);
        const pos = linea.lastIndexOf(cols[2]); // posición del bloque de comentario original
        if (pos !== -1) {
          capCambios++;
          return linea.slice(0, pos) + cols[2].replace(comentario, capitalizado) + linea.slice(pos + cols[2].length);
        }
      }
      return linea;
    });
    if (capCambios > 0) { contenido = lineasFixed.join(nl); totalCambios += capCambios; }
  }

  // --- Paso 0a: normalizar sufijos Id/UId en tablas del MD (una sola vez) ---
  const { resultado: norm0, cambios: c0a } = normalizarNombresEnMd(contenido);
  if (c0a > 0) { contenido = norm0; totalCambios += c0a; }

  // --- Hasta 3 pasadas de JSON/XML para converger ---
  for (let iter = 0; iter < 3; iter++) {
    // Paso 0b: cross-reference tabla ↔ JSON (prefiere el nombre con más uppercase)
    const _camposEnt = parsearTablaParametros(parsearSeccionTab(contenido, 'Datos de Entrada'));
    const _camposSal = parsearTablaParametros(parsearSeccionTab(contenido, 'Datos de Salida'));
    const _jsonInvR  = parsearJsonEjemplo(contenido, 'Invocación').data;
    const _jsonRespR = parsearJsonEjemplo(contenido, 'Respuesta').data;
    const { resultado: norm1, cambios: c0b } = normalizarNombresConJson(
      contenido, _camposEnt, _camposSal, _jsonInvR, _jsonRespR
    );
    if (c0b > 0) { contenido = norm1; totalCambios += c0b; }

    // Re-parsear con nombres corregidos
    const sdtsConTipos = parsearSdtsConTipos(contenido);
    const bloqueEnt = parsearSeccionTab(contenido, 'Datos de Entrada');
    const bloqueSal = parsearSeccionTab(contenido, 'Datos de Salida');
    const camposEntrada = parsearTablaParametros(bloqueEnt);
    const camposSalida  = parsearTablaParametros(bloqueSal);
    const ocultoEnt = parsearCamposOcultos(bloqueEnt);
    const ocultoSal = parsearCamposOcultos(bloqueSal);

    // JSON
    const jsonInv = parsearJsonEjemplo(contenido, 'Invocación').data;
    const c1 = fixarJsonSeccion(jsonInv, camposEntrada, CAMPOS_IGNORADOS_ENTRADA, sdtsConTipos, ocultoEnt);
    if (c1 > 0) { contenido = reemplazarJsonEnMd(contenido, 'Invocación', jsonInv); totalCambios += c1; }

    const jsonResp = parsearJsonEjemplo(contenido, 'Respuesta').data;
    const c2 = fixarJsonSeccion(jsonResp, camposSalida, CAMPOS_IGNORADOS_SALIDA, sdtsConTipos, ocultoSal);
    if (c2 > 0) { contenido = reemplazarJsonEnMd(contenido, 'Respuesta', jsonResp); totalCambios += c2; }

    // XML (usa los valores del JSON ya corregidos)
    const xmlInv = parsearXmlEjemplo(contenido, 'Invocación');
    const { xml: xmlInvFixed, cambios: c3 } = fixarXmlSeccion(xmlInv, camposEntrada, CAMPOS_IGNORADOS_ENTRADA, sdtsConTipos, jsonInv, true, ocultoEnt);
    if (c3 > 0) { contenido = reemplazarXmlEnMd(contenido, 'Invocación', xmlInvFixed); totalCambios += c3; }

    const xmlResp = parsearXmlEjemplo(contenido, 'Respuesta');
    const { xml: xmlRespFixed, cambios: c4 } = fixarXmlSeccion(xmlResp, camposSalida, CAMPOS_IGNORADOS_SALIDA, sdtsConTipos, jsonResp, false, ocultoSal);
    if (c4 > 0) { contenido = reemplazarXmlEnMd(contenido, 'Respuesta', xmlRespFixed); totalCambios += c4; }

    // Si esta iteración no produjo cambios, convergió
    if (c0b + c1 + c2 + c3 + c4 === 0) break;
  }

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

// ── CLI ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flagArgs = args.filter(a => a.startsWith('--'));
const flags = new Set(flagArgs);
const rutas = args.filter(a => !a.startsWith('--'));
const modoFix          = flags.has('--fix');
const modoJson         = flags.has('--json');
const modoDetectCasing = flags.has('--detect-casing');
const applyCasingFlag  = flagArgs.find(f => f.startsWith('--apply-casing='));
const modoApplyCasing  = applyCasingFlag ? applyCasingFlag.split('=').slice(1).join('=') : null;

if (!modoApplyCasing && rutas.length === 0) {
  console.log('Uso: node validar_md.js <Carpeta|Archivo...> [--fix] [--json] [--detect-casing]');
  console.log('     node validar_md.js --apply-casing=<choices.json>');
  process.exit(1);
}

if (modoApplyCasing) {
  // Aplica elecciones de casing desde un archivo JSON
  const choices = JSON.parse(fs.readFileSync(modoApplyCasing, 'utf8'));
  // choices: [{file, decisions:[...]}]
  let corregidos = 0;
  for (const { file, decisions } of choices) {
    const cambios = aplicarEleccionesCasing(file, decisions);
    if (cambios > 0) corregidos++;
  }
  console.log(JSON.stringify({ ok: true, corregidos }));
} else if (modoDetectCasing) {
  // Detecta conflictos de casing en los archivos indicados
  const archivos = [];
  for (const ruta of rutas) {
    if (!fs.existsSync(ruta)) continue;
    if (fs.statSync(ruta).isDirectory()) archivos.push(...buscarMdRecursivo(ruta));
    else archivos.push(ruta);
  }
  const resultado = archivos
    .map(filePath => {
      const contenido = fs.readFileSync(filePath, 'utf8');
      return { file: filePath, conflictos: detectarConflictosCasingArchivo(contenido) };
    })
    .filter(r => r.conflictos.length > 0);
  console.log(JSON.stringify(resultado));
} else if (modoFix) {
  // Acepta una carpeta o uno/varios archivos específicos
  const archivosAFix = [];
  for (const ruta of rutas) {
    if (!fs.existsSync(ruta)) { console.error(`❌ No existe: ${ruta}`); continue; }
    if (fs.statSync(ruta).isDirectory()) archivosAFix.push(...buscarMdRecursivo(ruta));
    else archivosAFix.push(ruta);
  }
  let corregidos = 0, sinCambios = 0;
  for (const filePath of archivosAFix) {
    const cambios = fixarArchivo(filePath);
    if (cambios > 0) { console.log(`✅ ${filePath.replace(/\\/g, '/')} — ${cambios} cambio(s)`); corregidos++; }
    else sinCambios++;
  }
  console.log(`\n🔧 Corregidos: ${corregidos} | Sin cambios: ${sinCambios}`);
} else if (modoJson) {
  // Salida estructurada para uso programático
  const carpeta = rutas[0];
  if (!fs.existsSync(carpeta)) { console.log(JSON.stringify([])); process.exit(0); }
  const esCarpeta = fs.statSync(carpeta).isDirectory();
  const archivos = esCarpeta ? buscarMdRecursivo(carpeta) : [carpeta];
  const base = esCarpeta ? carpeta : path.dirname(carpeta);
  const resultados = archivos.map(filePath => {
    const { problemas, version } = validarArchivo(filePath);
    return {
      relPath: path.relative(base, filePath).replace(/\\/g, '/'),
      absPath: filePath,
      problemas,
      version
    };
  });
  console.log(JSON.stringify(resultados));
} else {
  validarCarpeta(rutas[0]);
}
