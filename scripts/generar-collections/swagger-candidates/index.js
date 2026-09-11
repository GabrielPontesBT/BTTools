'use strict';

// ============================================================
// Que URLs probar para encontrar el documento Swagger/OpenAPI de
// un ambiente, y en que orden.
//
// Se extrajo de index.js (era una funcion interna del closure de
// createCollectionFeature, imposible de testear) al detectarse
// tres defectos, todos con el mismo sintoma para el usuario:
// "No se pudo leer el swagger".
//
// 1. Una URL base pelada no se probaba con sufijos. El campo del
//    wizard sugiere "ej: http://10.0.0.7:5110/btv4core", o sea una
//    base, y con eso se pedia esa URL tal cual, daba 404 y se
//    cortaba. Los sufijos (/v3/api-docs, /swagger.json, etc.) solo
//    se agregaban si la URL ya tenia /swagger-ui/index.html, o
//    derivados de api.BASE_URL, nunca de lo que el usuario escribio.
//
// 2. Con multi-swagger, cada URL de la lista caia de vuelta a los
//    candidatos derivados de api.BASE_URL. Un microservicio caido
//    entonces resolvia al swagger principal y duplicaba TODAS sus
//    operaciones en el catalogo fusionado. Por eso ahora el fallback
//    a BASE_URL es opcional (incluirFallbackDeBaseUrl) y el que
//    llama lo activa solo cuando no hay URL explicita.
//
// 3. Sin ninguna URL y sin BASE_URL la lista quedaba vacia y el
//    error no decia que hacer.
// ============================================================

// Rutas donde suele vivir el documento, en orden de probabilidad para los
// ambientes Bantotal vistos: Spring/springdoc expone /v3/api-docs, las
// APIs viejas /api-docs, y los .NET /swagger/v1/swagger.json.
const SUFIJOS_SWAGGER = [
  '/v3/api-docs',
  // /v1/api-docs es el que usa el ambiente Bantotal medido (10.0.0.7:5101):
  // springdoc con la version en la ruta. Sin este sufijo, ese ambiente daba
  // 404 en las 5 rutas y el error era "no se pudo leer el swagger".
  '/v1/api-docs',
  '/v2/api-docs',
  '/api-docs',
  '/swagger/v1/swagger.json',
  '/swagger.json',
  '/openapi.json',
];

// Una URL que ya apunta al documento no necesita que le agreguemos sufijos:
// pedirla tal cual es lo correcto y ahorra 5 requests al aire.
function yaEsDocumento(url) {
  return /\.json(\?|$)/i.test(url) || /\/(v\d+\/)?api-docs(\/|\?|$)/i.test(url);
}

function esSwaggerUi(url) {
  return /\/swagger-ui\/index\.html/i.test(url);
}

function sinBarraFinal(url) {
  return String(url || '').replace(/\/+$/g, '');
}

/**
 * @param {string} rawUrl     Lo que el usuario escribio en el campo Swagger.
 * @param {object} api        Config del ambiente (BASE_URL, API_BASE_URL...).
 * @param {object} [opciones]
 * @param {boolean} [opciones.incluirFallbackDeBaseUrl=true]
 *        Si agrega candidatos derivados de api.BASE_URL. Con multi-swagger
 *        hay que pasarlo en false cuando la URL es explicita: si no, una
 *        fuente caida resuelve al swagger de BASE_URL y duplica sus
 *        operaciones (defecto 2 del encabezado).
 */
function buildSwaggerCandidateUrls(rawUrl, api, opciones) {
  const opts = opciones || {};
  const incluirFallback = opts.incluirFallbackDeBaseUrl !== false;

  const trimmed = String(rawUrl || '').trim().replace(/#.*$/, '');
  const candidatos = [];
  const push = function (url) {
    const clean = String(url || '').trim();
    if (!clean || candidatos.includes(clean)) return;
    candidatos.push(clean);
  };

  if (trimmed) {
    // Primero la URL tal cual: si el usuario sabe la ruta exacta, se
    // respeta y se acierta en el primer request.
    push(trimmed);

    if (esSwaggerUi(trimmed)) {
      const base = sinBarraFinal(trimmed.replace(/\/swagger-ui\/index\.html.*$/i, ''));
      SUFIJOS_SWAGGER.forEach(function (s) { push(base + s); });
    } else if (!yaEsDocumento(trimmed)) {
      // Defecto 1: una base pelada ahora si se prueba con los sufijos.
      const base = sinBarraFinal(trimmed);
      SUFIJOS_SWAGGER.forEach(function (s) { push(base + s); });
      push(base + '/swagger-ui/index.html');
    }
  }

  if (incluirFallback) {
    const publicBaseUrl = sinBarraFinal(String((api && api.BASE_URL) || '').trim());
    if (publicBaseUrl) {
      // Primero la BASE_URL tal cual: el ambiente medido (10.0.0.7:5101)
      // publica el documento en <BASE_URL>/v1/api-docs, o sea DENTRO de
      // /api/publicapi. Recortando el /publicapi (lo de abajo) daban 404 las
      // ocho rutas y el descubrimiento fallaba con un swagger que si existia.
      SUFIJOS_SWAGGER.forEach(function (s) { push(publicBaseUrl + s); });
      push(publicBaseUrl + '/swagger-ui/index.html');

      const apiRoot = publicBaseUrl.replace(/\/publicapi$/i, '');
      SUFIJOS_SWAGGER.forEach(function (s) { push(apiRoot + s); });
      push(apiRoot + '/swagger-ui/index.html');
    }
  }

  return candidatos;
}

module.exports = { buildSwaggerCandidateUrls, SUFIJOS_SWAGGER };
