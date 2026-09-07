// ============================================================
// Extrae los ejemplos de invocación/respuesta de un .md ya
// generado, para preservarlos cuando el documento se regenera
// sin volver a llamar a la API (--ejecutar apagado): sin esto,
// cada regeneración pisa un ejemplo real (de una corrida previa
// con --ejecutar) con el placeholder genérico.
//
// Hay dos casos:
// - Formato actual (v4 con tab cURL, o v3 con tab XML): el bloque
//   se reutiliza tal cual, verbatim.
// - Formato viejo de v4 (un único @tab JSON con el body envuelto
//   en Btinreq, sin separar query/body ni limpiar el envelope de
//   la respuesta - así generaba una versión anterior del script):
//   NO se preserva tal cual, porque eso clavaría el documento en
//   el formato viejo para siempre. En cambio se extraen los
//   valores reales (sin el envelope) para que el llamador los
//   migre al armar el documento con la plantilla actual.
// ============================================================

function extraerSeccion(md, aperturaMarcador, cierreMarcador) {
  const re = new RegExp(`${aperturaMarcador}([\\s\\S]*?)${cierreMarcador}`);
  const m = md.match(re);
  return m ? m[1] : null;
}

function extraerTab(seccion, tabLabel, lang) {
  if (!seccion) return null;
  const re = new RegExp(`@tab ${tabLabel}\\n\`\`\`${lang}\\n([\\s\\S]*?)\\n\`\`\``);
  const m = seccion.match(re);
  return m ? m[1] : null;
}

// El formato viejo a veces dejaba una comilla suelta al final del bloque
// JSON (residuo de un curl -d '...' armado a mano). Se reintenta sin ella
// antes de rendirse.
function parsearJsonTolerante(texto) {
  if (!texto) return null;
  const limpio = texto.trim();
  try {
    return JSON.parse(limpio);
  } catch {
    try {
      return JSON.parse(limpio.replace(/['"]+\s*$/, ''));
    } catch {
      return null;
    }
  }
}

const CLAVES_ENVELOPE = new Set(['Btinreq', 'Btoutreq', 'BusinessErrors', '_xmlns']);

function sinEnvelope(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !CLAVES_ENVELOPE.has(k)));
}

// Devuelve null si el .md no tiene ninguna sección de ejemplos reconocible
// (archivo vacío, corrupto, o de un formato distinto al esperado).
function leerEjemplosExistentes(mdContenidoRaw) {
  if (!mdContenidoRaw) return null;
  // Los `\n` literales de extraerTab no matchean CRLF: en Windows, un .md
  // recien traido con `git checkout` (core.autocrlf) viene en CRLF y esto
  // hacia que la deteccion de formato fallara siempre (devolvia null), sin
  // ningun error visible - la migracion quedaba deshabilitada en silencio.
  const mdContenido = mdContenidoRaw.replace(/\r\n/g, '\n');

  const invocacion = extraerSeccion(mdContenido, '<!-- ABRE EJEMPLO DE INVOCACIÓN -->', '<!-- CIERRA EJEMPLO DE INVOCACIÓN -->');
  const respuesta = extraerSeccion(mdContenido, '<!-- ABRE EJEMPLO DE RESPUESTA -->', '<!-- CIERRA EJEMPLO DE RESPUESTA -->');
  if (!invocacion && !respuesta) return null;

  const curlCmd = extraerTab(invocacion, 'cURL', 'bash');
  const requestXml = extraerTab(invocacion, 'XML', 'xml');

  if (curlCmd || requestXml) {
    // Formato actual: v4 (tiene cURL) o v3 (tiene XML). Se reutiliza tal cual.
    const ejemplos = {
      formato: curlCmd ? 'v4-actual' : 'v3-actual',
      curlCmd,
      // v4 usa "JSON Body", v3 usa "JSON" a secas para el request
      requestJson: extraerTab(invocacion, 'JSON Body', 'json') || extraerTab(invocacion, 'JSON', 'json'),
      requestXml,
      responseJson: extraerTab(respuesta, 'JSON', 'json'),
      responseXml: extraerTab(respuesta, 'XML', 'xml'),
    };
    const tieneAlgo = Object.entries(ejemplos).some(([k, v]) => k !== 'formato' && v !== null);
    return tieneAlgo ? ejemplos : null;
  }

  // Sin cURL ni XML: formato viejo de v4 (un único @tab JSON, body envuelto
  // en Btinreq). Se migran los valores reales en vez de preservar el bloque.
  const requestObj = parsearJsonTolerante(extraerTab(invocacion, 'JSON', 'json'));
  const responseObj = parsearJsonTolerante(extraerTab(respuesta, 'JSON', 'json'));
  if (!requestObj && !responseObj) return null;

  const valoresEntrada = requestObj ? sinEnvelope(requestObj) : {};
  const valoresSalida = responseObj ? sinEnvelope(responseObj) : {};
  const tieneValores = Object.keys(valoresEntrada).length > 0 || Object.keys(valoresSalida).length > 0;

  return tieneValores ? { formato: 'v4-legado', valoresEntrada, valoresSalida } : null;
}

module.exports = { leerEjemplosExistentes };
