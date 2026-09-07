// ============================================================
// Payload real a enviar al ejecutar el servicio contra la API.
// En GET/DELETE los parámetros van por query string: uno sin
// completar significa "no filtrar por ese campo", no "0"/"" -
// por eso ahí se manda solo lo que el usuario completó
// (filteredParams), nunca los valores de ejemplo/placeholder.
// En POST/PUT el body sí necesita todos los campos, con
// placeholder incluido para los no completados.
// ============================================================

function buildExecPayload(httpMethod, filteredParams, requestPayload) {
  const usaQueryAll = httpMethod === 'GET' || httpMethod === 'DELETE';
  return usaQueryAll ? filteredParams : requestPayload;
}

function pickParamsByName(filteredParams, campos) {
  const nombres = new Set(campos.map(r => r.BTISRVPARNOM));
  return Object.fromEntries(Object.entries(filteredParams).filter(([k]) => nombres.has(k)));
}

// Ejemplo de query string documentado en el .md: mismo criterio que la
// ejecución real (buildExecPayload) - sin completar, no aparece en la URL;
// si se completó, se muestra el valor real, no un placeholder genérico.
function buildExampleQuery(filteredParams, entradaQuery) {
  return pickParamsByName(filteredParams, entradaQuery);
}

// Ejemplo de body documentado: el body siempre lleva todos los campos
// (placeholder para los no completados), pero los que sí se completaron
// muestran su valor real en vez del genérico.
function buildExampleBody(filteredParams, entradaBody, placeholderBody) {
  return { ...placeholderBody, ...pickParamsByName(filteredParams, entradaBody) };
}

module.exports = { buildExecPayload, buildExampleQuery, buildExampleBody };
