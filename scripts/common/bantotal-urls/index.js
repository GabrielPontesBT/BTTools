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

// ============================================================
// Autenticacion de la API publica: jwt de session/user-login
// ------------------------------------------------------------
// Arquitectura dejo de usar Authenticate.Execute. La API publica pasa a
// autenticarse con el metodo user-login de session:
//
//   POST <raiz>/session/v1/user-login
//   Canal: BTPUBLIC
//   { "user": ..., "userPassword": ..., "jwt": true }
//   -> { success, sessionToken, refreshToken, userCode }
//
// y el sessionToken viaja despues como "Authorization: Bearer <token>".
// Con Bearer NO se mandan los headers de canal/usuario/requerimiento/token:
// el jwt ya lleva esa informacion adentro.
//
// El Authenticate viejo queda como fallback, no como camino principal: los
// ambientes que todavia no se actualizaron siguen respondiendo solo la forma
// vieja, y ahi un 404 del user-login tiene que poder degradar solo.
// ============================================================

const SESSION_LOGIN_PATH = '/session/v1/user-login';

// Canal fijo del login publico. No sale de la parametria del ambiente a
// proposito: arquitectura lo definio como el canal de la API publica, y un
// BTDIGITAL heredado de la config vieja hace fallar el login con un error de
// canal que no dice de donde salio.
const CANAL_PUBLICO = 'BTPUBLIC';

// Los dos esquemas de autenticacion posibles de la API publica V4.
const KIND_SESSION_PUBLICA = 'public-session-userlogin';
const KIND_AUTHENTICATE = 'authenticate-execute';

// Path del login de sesion: el kebab de la API publica
// (/session/v1/user-login) y el camelCase que exponen algunos swagger
// (/Session/v1/userLogin). Sirve para detectarlo dentro de un swagger.
const RE_SESSION_LOGIN = /\/session\/v\d+\/user-?login$/i;

function esPathSessionLogin(pathName) {
  return RE_SESSION_LOGIN.test(String(pathName || '').trim());
}

// true si el token de este esquema viaja como Authorization: Bearer.
function usaBearer(kind) {
  return kind === KIND_SESSION_PUBLICA;
}

/**
 * Los candidatos de autenticacion de la API publica V4, en orden de
 * preferencia: primero el user-login nuevo, despues las dos formas del
 * Authenticate viejo (minusculas y el casing legacy).
 *
 * @returns {{kind: string, url: string}[]}
 */
function authCandidates(api) {
  const root = resolvePublicApiRoot(api);
  return [
    { kind: KIND_SESSION_PUBLICA, url: root + SESSION_LOGIN_PATH },
    { kind: KIND_AUTHENTICATE, url: root + AUTH_PATH },
    { kind: KIND_AUTHENTICATE, url: root + AUTH_PATH_LEGACY },
  ];
}

// La URL de login preferida de la API publica (la nueva).
function resolveSessionLoginUrl(api) {
  return resolvePublicApiRoot(api) + SESSION_LOGIN_PATH;
}

/**
 * Body y headers del request de autenticacion, segun el esquema.
 * El body sale ya serializado: quien lo manda necesita su Content-Length.
 */
function buildAuthPayload(kind, credenciales) {
  const c = credenciales || {};
  const usuario = String(c.username || '');
  const password = String(c.password || '');

  if (kind === KIND_SESSION_PUBLICA) {
    return {
      body: JSON.stringify({ user: usuario, userPassword: password, jwt: true }),
      // Solo el canal: user-login no pide device/requerimiento/token.
      headers: { 'Content-Type': 'application/json', Canal: CANAL_PUBLICO },
    };
  }

  return {
    body: JSON.stringify({ UserId: usuario, UserPassword: password }),
    headers: {
      'Content-Type': 'application/json',
      Canal: String(c.channel || 'BTDIGITAL'),
      Device: String(c.device || 'INSTALADOR'),
      Usuario: usuario,
      Requerimiento: String(c.requirement || '1'),
      Token: '',
      'idempotency-key': '1',
    },
  };
}

/**
 * El token dentro de la respuesta ya parseada. user-login lo devuelve en
 * "sessionToken" (minuscula); Authenticate.Execute en "SessionToken".
 */
function extractAuthToken(kind, parsedJson) {
  const data = parsedJson || {};
  if (kind === KIND_SESSION_PUBLICA) return data.sessionToken || '';
  return data.SessionToken || '';
}

/**
 * Headers de autenticacion de un request de negocio.
 *
 * Con Bearer se manda solo Authorization: el mensaje de arquitectura es
 * explicito en que el resto de los headers de canal/usuario/requerimiento ya
 * no hacen falta, y mandarlos igual es ruido al leer el request exportado.
 */
function buildRequestAuthHeaders(kind, contexto) {
  const c = contexto || {};
  const token = String(c.token || '');
  if (usaBearer(kind)) {
    return { Authorization: 'Bearer ' + token };
  }
  return {
    Canal: String(c.channel || 'BTDIGITAL'),
    Usuario: String(c.username || 'INSTALADOR'),
    Device: String(c.device || 'INSTALADOR'),
    Requerimiento: String(c.requirement || '1'),
    Token: token,
  };
}

/**
 * Igual que intentarCandidatos, pero sobre candidatos {kind, url}: cada
 * esquema manda un body y unos headers distintos, asi que el poster recibe el
 * candidato entero y no solo la URL.
 *
 * Un 404 pasa al siguiente candidato (ese esquema no existe en el ambiente).
 * Cualquier otro status significa que la ruta existe: ahi se corta, porque
 * reintentar duplica el intento de login y contra un ambiente con bloqueo por
 * intentos fallidos eso no es gratis.
 */
async function intentarCandidatosAuth(candidatos, poster) {
  const lista = (Array.isArray(candidatos) ? candidatos : []).filter(function (c) {
    return c && c.url;
  });
  if (!lista.length) throw new Error('No hay ninguna URL de autenticacion para probar');

  const intentos = [];
  let respuesta = null;
  let candidato = null;

  for (const actual of lista) {
    respuesta = await poster(actual);
    candidato = actual;
    intentos.push(actual.url + ' -> HTTP ' + respuesta.status);
    if (respuesta.status !== 404) break;
  }

  return { respuesta, authUrl: candidato.url, authKind: candidato.kind, intentos };
}

// ============================================================
// Diagnostico de una autenticacion fallida
// ------------------------------------------------------------
// El ambiente contesta cosas como {"BusinessErrors":{"BusinessError":
// [{"Description":"API internal error","Code":500}]}} y mostrar solo el
// Description deja al usuario sin saber contra que URL fue, con que esquema,
// ni si se llego a probar el otro. Medido contra un ambiente real
// (10.0.0.7:5101) donde el user-login existe pero revienta del lado del
// servidor: con el mensaje pelado no habia forma de distinguir eso de un
// problema de credenciales o de URL.
// ============================================================

// El error de negocio de la respuesta, en el formato que use el ambiente.
function extractAuthError(parsedJson) {
  const data = parsedJson || {};
  const lista = data.BusinessErrors && data.BusinessErrors.BusinessError;
  const primero = Array.isArray(lista) ? lista[0] : lista;
  if (primero && (primero.Description || primero.Code)) {
    return {
      description: String(primero.Description || '').trim(),
      code: primero.Code === undefined || primero.Code === null ? '' : String(primero.Code),
    };
  }
  const global = data.messages && data.messages.global;
  const mensaje = global || (data.Btoutreq && data.Btoutreq.Mensaje) || data.Mensaje;
  if (mensaje) return { description: String(mensaje).trim(), code: '' };
  return { description: '', code: '' };
}

// Nombre legible del esquema, para que el mensaje no escupa el slug interno.
function nombreEsquema(kind) {
  if (kind === KIND_SESSION_PUBLICA) return 'user-login de session (jwt)';
  if (kind === 'session-userlogin') return 'Session.userLogin (API interna)';
  return 'Authenticate.Execute';
}

/**
 * El mensaje de una autenticacion que respondio pero no dio token.
 *
 * Incluye URL, esquema y status porque son las tres cosas que deciden a quien
 * le toca el problema: la URL dice si se pego donde corresponde, el esquema
 * dice si el ambiente ya migro, y un Code 500 dice que el error es del
 * servidor y no de lo que se mando.
 */
function describeAuthFailure(info) {
  const i = info || {};
  const error = extractAuthError(i.parsedJson);
  const detalle = error.description || String(i.raw || '').replace(/\s+/g, ' ').slice(0, 200) || 'sin detalle';
  const codigo = error.code ? ' (codigo ' + error.code + ')' : '';

  const lineas = [
    detalle + codigo,
    'Esquema: ' + nombreEsquema(i.authKind) + ' | URL: ' + (i.url || 'desconocida') +
      (i.status ? ' | HTTP ' + i.status : ''),
  ];

  // Un 500 del ambiente no se arregla desde aca: sirve decirlo, porque si no
  // el siguiente paso es revisar credenciales o URL, que ya estan bien.
  if (String(error.code) === '500' || Number(i.status) >= 500) {
    lineas.push('El ambiente fallo del lado del servidor: la URL y el esquema son correctos. Es un tema del ambiente, no de la configuracion de la herramienta.');
  }

  if (Array.isArray(i.intentos) && i.intentos.length > 1) {
    lineas.push('Se probaron: ' + i.intentos.join(' | '));
  } else if (i.authKind === KIND_SESSION_PUBLICA) {
    lineas.push('No se probo el Authenticate viejo: esa ruta solo se intenta cuando el user-login no existe (404), y aca si existe.');
  }

  return lineas.join('\n');
}

module.exports = {
  AUTH_PATH,
  AUTH_PATH_LEGACY,
  resolvePublicApiRoot,
  authUrlCandidates,
  resolveV4AuthUrl,
  esMismaAuthSalvoCasing,
  intentarCandidatos,
  SESSION_LOGIN_PATH,
  CANAL_PUBLICO,
  KIND_SESSION_PUBLICA,
  KIND_AUTHENTICATE,
  esPathSessionLogin,
  usaBearer,
  authCandidates,
  resolveSessionLoginUrl,
  buildAuthPayload,
  extractAuthToken,
  buildRequestAuthHeaders,
  intentarCandidatosAuth,
  extractAuthError,
  describeAuthFailure,
};
