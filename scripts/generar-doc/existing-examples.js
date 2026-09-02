// ============================================================
// Extrae los ejemplos de invocación/respuesta de un .md ya
// generado, para preservarlos cuando el documento se regenera
// sin volver a llamar a la API (--ejecutar apagado): sin esto,
// cada regeneración pisa un ejemplo real (de una corrida previa
// con --ejecutar) con el placeholder genérico.
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

// Devuelve null si el .md no tiene ninguna sección de ejemplos reconocible
// (archivo vacío, corrupto, o de un formato distinto al esperado).
function leerEjemplosExistentes(mdContenido) {
  if (!mdContenido) return null;

  const invocacion = extraerSeccion(mdContenido, '<!-- ABRE EJEMPLO DE INVOCACIÓN -->', '<!-- CIERRA EJEMPLO DE INVOCACIÓN -->');
  const respuesta = extraerSeccion(mdContenido, '<!-- ABRE EJEMPLO DE RESPUESTA -->', '<!-- CIERRA EJEMPLO DE RESPUESTA -->');

  const ejemplos = {
    curlCmd: extraerTab(invocacion, 'cURL', 'bash'),
    // v4 usa "JSON Body", v3 usa "JSON" a secas para el request
    requestJson: extraerTab(invocacion, 'JSON Body', 'json') || extraerTab(invocacion, 'JSON', 'json'),
    requestXml: extraerTab(invocacion, 'XML', 'xml'),
    responseJson: extraerTab(respuesta, 'JSON', 'json'),
    responseXml: extraerTab(respuesta, 'XML', 'xml'),
  };

  const tieneAlgo = Object.values(ejemplos).some(v => v !== null);
  return tieneAlgo ? ejemplos : null;
}

module.exports = { leerEjemplosExistentes };
