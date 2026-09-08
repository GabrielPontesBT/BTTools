'use strict';

// ============================================================
// URLs de la API publica de Bantotal V4 (REST).
//
// Existe por el casing del endpoint de autenticacion. Medido contra
// un ambiente real (10.0.0.7:5101):
//
//   POST /api/publicapi/Authenticate/v1/Execute  -> 404
//   POST /api/publicapi/authenticate/v1/execute  -> 400 (existe)
//
// El endpoint paso a ser todo en minusculas. La deteccion desde el
// Swagger nunca fue el problema (los regex ya eran case-insensitive):
// el problema son los lugares que ARMAN la URL cuando todavia no se
// leyo ningun swagger, como el boton "Probar autenticacion" del paso
// de ambiente, que corre antes de cargar el catalogo.
//
// No se hardcodea minusculas y listo: el endpoint "cambio", asi que
// los ambientes que no se actualizaron siguen respondiendo con la
// forma vieja. Se devuelven las dos formas, la actual primero, y
// quien las use prueba en orden.
//
// Habia cuatro copias de esta logica (setup.js,
// generar-collections/index.js, public/collections.js y
// public/collections/shared/collection-utils.js). Las dos de backend
// usan este modulo; las dos del browser son fallbacks que se
// corrigieron a minusculas y apuntan aca por comentario, porque el
// front se sirve como scripts planos y no puede requerirlo.
// ============================================================

// Forma actual y forma vieja del path de autenticacion REST.
const AUTH_PATH = '/authenticate/v1/execute';
const AUTH_PATH_LEGACY = '/Authenticate/v1/Execute';

// Trim antes de todo: un campo del formulario con solo espacios es "vacio",
// no una URL. Sin el trim, '   ' pasaba como raiz valida y se armaba una URL
// con espacios adelante.
function sinBarraFinal(url) {
  return String(url || '').trim().replace(/\/+$/g, '');
}

// Raiz de la API publica a partir de lo que haya configurado el usuario.
// BASE_URL ya apunta a /api/publicapi; API_BASE_URL puede apuntar al core,
// y en ese caso se le agrega el prefijo.
function resolvePublicApiRoot(api) {
  const publicBaseUrl = sinBarraFinal((api && api.BASE_URL) || '');
  if (publicBaseUrl) return publicBaseUrl;

  const apiBaseUrl = sinBarraFinal((api && api.API_BASE_URL) || '');
  if (apiBaseUrl) {
    // Si ya termina en /api/publicapi no se duplica.
    const normalized = apiBaseUrl.replace(/\/api\/publicapi$/i, '');
    return normalized + '/api/publicapi';
  }
  return '';
}

/**
 * Las URLs candidatas de autenticacion, en orden de preferencia.
 * La primera es la forma actual (minusculas); la segunda, la vieja.
 *
 * Devuelve rutas relativas si no hay forma de resolver la raiz, para no
 * inventar un host.
 */
function authUrlCandidates(api) {
  const root = resolvePublicApiRoot(api);
  return [root + AUTH_PATH, root + AUTH_PATH_LEGACY];
}

/**
 * La URL de autenticacion preferida (la forma actual). Es el reemplazo
 * directo de las cuatro copias de resolveV4AuthUrl.
 */
function resolveV4AuthUrl(api) {
  return authUrlCandidates(api)[0];
}

// true si dos URLs son la misma salvo el casing del path de autenticacion.
// Sirve para no reintentar cuando el usuario escribio la URL a mano y
// justo coincide con el candidato que ya fallo.
function esMismaAuthSalvoCasing(a, b) {
  const norm = function (u) { return String(u || '').toLowerCase(); };
  return norm(a) === norm(b);
}

/**
 * Prueba los candidatos en orden hasta que uno responda algo distinto de 404.
 *
 * Solo un 404 justifica pasar al siguiente: cualquier otro status significa
 * que la ruta existe y el problema es de credenciales o de payload.
 * Reintentar ahi duplicaria el intento de login, que contra un ambiente con
 * politica de bloqueo por intentos fallidos no es gratis.
 *
 * @param {string[]} candidatos
 * @param {(url: string) => Promise<{status: number, raw: string}>} poster
 * @returns {Promise<{respuesta, authUrl, intentos: string[]}>}
 */
async function intentarCandidatos(candidatos, poster) {
  const lista = Array.isArray(candidatos) ? candidatos.filter(Boolean) : [];
  if (!lista.length) throw new Error('No hay ninguna URL de autenticacion para probar');

  const intentos = [];
  let respuesta = null;
  let authUrl = '';

  for (const candidato of lista) {
    respuesta = await poster(candidato);
    authUrl = candidato;
    intentos.push(candidato + ' -> HTTP ' + respuesta.status);
    if (respuesta.status !== 404) break;
  }

  return { respuesta, authUrl, intentos };
}

module.exports = {
  AUTH_PATH,
  AUTH_PATH_LEGACY,
  resolvePublicApiRoot,
  authUrlCandidates,
  resolveV4AuthUrl,
  esMismaAuthSalvoCasing,
  intentarCandidatos,
};
