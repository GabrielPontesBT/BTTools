'use strict';

// ============================================================
// De (servicio, metodo) de la base a la URL real del endpoint.
//
// El generador de doc armaba la ruta a mano:
//
//   /public/ + servicio.replace(/^Public/, '') + /v1/ + nombreCortoMetodo
//   -> /public/SavingAccounts/v1/additionalInformation
//
// Los ambientes pasaron a kebab-case y esa ruta ya no existe:
//
//   -> /public/saving-accounts/v1/additional-information
//
// Inventar la ruta es adivinar. El swagger del ambiente la tiene medida, y
// ademas trae el verbo HTTP real (hoy se infiere del prefijo del nombre del
// metodo, que le pega casi siempre pero no siempre). Verificado contra el
// swagger de un ambiente real (10.0.0.7:5101/api/publicapi/v1/api-docs, 175
// paths / 192 operaciones):
//
//   operationId == el nombre del metodo de la base  (getAdditionalInformation)
//   tag         == el servicio, en kebab            (public-persons)
//
// asi que el match es exacto y no hace falta heuristica de nombres.
//
// Cuando no hay swagger (o el metodo no esta en el), se cae a derivar la
// ruta, pero ya en kebab-case: es lo que usan los ambientes de hoy.
// ============================================================

// ── Normalizacion ───────────────────────────────────────────

// Clave de comparacion: sin separadores y en minusculas, para que
// "PublicSavingAccounts", "public-saving-accounts" y "public_savingaccounts"
// sean el mismo servicio. Los tags del swagger vienen en kebab salvo alguna
// excepcion en camelCase (PublicCashManagement en el ambiente medido), y
// aplanar los dos lados es lo unico que las hace coincidir sin casos especiales.
function normalizar(valor) {
  return String(valor || '').replace(/[^A-Za-z0-9]+/g, '').toLowerCase();
}

// camelCase/PascalCase -> kebab-case, sin partir siglas:
// "SavingAccounts" -> "saving-accounts", "getGUID" -> "guid" (ya recortado),
// "additionalInformation" -> "additional-information".
function aKebab(valor) {
  return String(valor || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

// El servicio tal como aparece en la ruta: PublicSavingAccounts ->
// saving-accounts (el prefijo Public ya lo aporta el /public/ de la ruta).
function servicioEnRuta(servicio) {
  return aKebab(String(servicio || '').replace(/^Public/i, ''));
}

// ── Indice de operaciones del swagger ───────────────────────

// springdoc desambigua los operationId repetidos con un sufijo _N: el mismo
// getTexts existe en persons y en customers, y el segundo sale como
// "getTexts_1". Sin sacar ese sufijo, 28 de los 148 metodos del ambiente
// medido no matcheaban y caian a la ruta derivada.
function sinSufijoDeDuplicado(metodo) {
  return String(metodo || '').replace(/_\d+$/, '');
}

// Clave de una operacion: servicio + metodo, los dos normalizados. El
// servicio sale del tag (que trae el "public-" adelante) o del propio path,
// asi que se compara sin ese prefijo para que de igual de los dos lados.
function claveEndpoint(servicio, metodo) {
  return normalizar(String(servicio || '').replace(/^public[-_]?/i, '')) +
         '|' + normalizar(sinSufijoDeDuplicado(metodo));
}

/**
 * Indexa las operaciones de un documento OpenAPI/Swagger por (servicio, metodo).
 *
 * El servicio se toma del tag y, si no hay, del segmento del path
 * (/public/<servicio>/v1/<metodo>): hay ambientes que publican operaciones sin
 * tags y perderlas por eso seria peor que mirar la ruta.
 *
 * @returns {Map<string, {path: string, httpMethod: string, operationId: string, servicio: string}>}
 */
function indexarEndpoints(doc) {
  const indice = new Map();
  const paths = (doc && doc.paths) || {};

  Object.keys(paths).forEach(function (ruta) {
    const operaciones = paths[ruta] || {};
    Object.keys(operaciones).forEach(function (verbo) {
      if (!/^(get|post|put|delete|patch)$/i.test(verbo)) return;
      const operacion = operaciones[verbo] || {};

      const tag = Array.isArray(operacion.tags) && operacion.tags.length ? operacion.tags[0] : '';
      const delPath = (String(ruta).match(/^\/?(?:public\/)?([^/]+)\/v\d+\//i) || [])[1] || '';
      const servicio = tag || delPath;

      // El operationId es el nombre del metodo de la base. Sin el se cae al
      // ultimo segmento de la ruta, que es el mismo nombre en kebab.
      const metodo = operacion.operationId || (String(ruta).split('/').filter(Boolean).pop() || '');
      if (!servicio || !metodo) return;

      const entrada = {
        path: String(ruta),
        httpMethod: verbo.toUpperCase(),
        operationId: String(operacion.operationId || ''),
        servicio: String(servicio),
      };

      // Una misma clave puede venir de dos verbos (GET y PUT sobre
      // /texts, con operationId getTexts y updateTexts): como la clave
      // incluye el metodo, no chocan. Si igual chocara, gana el primero:
      // reemplazarlo haria que el resultado dependa del orden del JSON.
      const clave = claveEndpoint(servicio, metodo);
      if (!indice.has(clave)) indice.set(clave, entrada);
    });
  });

  return indice;
}

/**
 * La raiz de la API que declara el propio documento (servers[0].url).
 *
 * Es lo mismo que el usuario escribe en "URL de la API publica": el ambiente
 * medido declara "http://10.0.0.7:5101/api/publicapi". Teniendo el swagger,
 * pedirle al usuario que lo escriba de nuevo es pedirle un dato que ya esta.
 *
 * Se ignora una url relativa o con plantilla ("/api", "{host}/api"): sin host
 * no sirve para armar la URL de una llamada, y completar el campo con eso
 * seria peor que dejarlo vacio.
 */
function baseUrlDeDocumento(doc) {
  const servers = (doc && Array.isArray(doc.servers)) ? doc.servers : [];
  for (const server of servers) {
    const url = String((server && server.url) || '').trim();
    if (!url || url.indexOf('{') >= 0) continue;
    if (!/^https?:\/\//i.test(url)) continue;
    return url.replace(/\/+$/g, '');
  }
  return '';
}

// ── Resolucion ──────────────────────────────────────────────

/**
 * La ruta derivada del nombre, en kebab-case. Es el plan B cuando no hay
 * swagger: no es medido, pero es la forma que usan los ambientes actuales.
 */
function derivarEndpoint(servicio, metodo) {
  return '/public/' + servicioEnRuta(servicio) + '/v1/' + aKebab(metodo);
}

/**
 * El endpoint de un (servicio, metodo).
 *
 * @param {Map} indice        El de indexarEndpoints, o null si no hay swagger.
 * @param {string} servicio   Servicio de la base (PublicPersons).
 * @param {string} metodo     Metodo de la base (getAdditionalInformation).
 * @param {string} [metodoCorto] Nombre ya recortado (additionalInformation),
 *                            que es lo que el generador usa para la ruta.
 * @returns {{path: string, httpMethod: string, fuente: 'swagger'|'derivado'}}
 *          httpMethod queda vacio cuando la fuente es derivada: ahi lo decide
 *          quien llama (inferirMetodoHttp), como venia haciendo.
 */
function resolverEndpoint(indice, servicio, metodo, metodoCorto) {
  if (indice && typeof indice.get === 'function') {
    // Se prueba con el nombre completo y con el corto: el operationId del
    // swagger es el nombre completo (getTexts), pero un ambiente que no
    // publique operationId cae al ultimo segmento de la ruta, que es el corto.
    const candidatos = [metodo, metodoCorto].filter(Boolean);
    for (const nombre of candidatos) {
      const encontrado = indice.get(claveEndpoint(servicio, nombre));
      if (encontrado) {
        return { path: encontrado.path, httpMethod: encontrado.httpMethod, fuente: 'swagger' };
      }
    }
  }
  return { path: derivarEndpoint(servicio, metodoCorto || metodo), httpMethod: '', fuente: 'derivado' };
}

module.exports = {
  normalizar,
  sinSufijoDeDuplicado,
  aKebab,
  servicioEnRuta,
  claveEndpoint,
  indexarEndpoints,
  baseUrlDeDocumento,
  derivarEndpoint,
  resolverEndpoint,
};
