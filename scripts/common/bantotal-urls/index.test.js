const test = require('node:test');
const assert = require('node:assert/strict');

const U = require('./index');

// Medido contra un ambiente real (10.0.0.7:5101):
//   POST /api/publicapi/Authenticate/v1/Execute -> 404
//   POST /api/publicapi/authenticate/v1/execute -> 400 (existe)
// Y en su swagger el path declarado es /authenticate/v1/execute.
const RAIZ = 'http://10.0.0.7:5101/api/publicapi';

test('el path actual es todo en minusculas', () => {
  assert.equal(U.AUTH_PATH, '/authenticate/v1/execute');
  assert.equal(U.AUTH_PATH, U.AUTH_PATH.toLowerCase(),
               'si esto falla es que alguien volvio a poner mayusculas');
});

test('la forma vieja se conserva aparte, para los ambientes sin actualizar', () => {
  assert.equal(U.AUTH_PATH_LEGACY, '/Authenticate/v1/Execute');
  assert.notEqual(U.AUTH_PATH, U.AUTH_PATH_LEGACY);
});

test('resolveV4AuthUrl devuelve la forma actual, no la vieja', () => {
  assert.equal(U.resolveV4AuthUrl({ BASE_URL: RAIZ }), RAIZ + '/authenticate/v1/execute');
  assert.ok(!/Authenticate|Execute/.test(U.resolveV4AuthUrl({ BASE_URL: RAIZ })),
            'no puede salir con mayusculas: esa forma da 404');
});

test('los candidatos van en orden: primero la actual, despues la vieja', () => {
  const c = U.authUrlCandidates({ BASE_URL: RAIZ });
  assert.deepEqual(c, [
    RAIZ + '/authenticate/v1/execute',
    RAIZ + '/Authenticate/v1/Execute',
  ]);
});

// ── Resolucion de la raiz ────────────────────────────────────

test('BASE_URL se usa tal cual, sin barra final', () => {
  assert.equal(U.resolvePublicApiRoot({ BASE_URL: RAIZ }), RAIZ);
  assert.equal(U.resolvePublicApiRoot({ BASE_URL: RAIZ + '/' }), RAIZ);
  assert.equal(U.resolvePublicApiRoot({ BASE_URL: RAIZ + '///' }), RAIZ);
});

test('sin BASE_URL, API_BASE_URL se completa con /api/publicapi', () => {
  assert.equal(U.resolvePublicApiRoot({ API_BASE_URL: 'http://10.0.0.7:5110/btv4core' }),
               'http://10.0.0.7:5110/btv4core/api/publicapi');
});

test('si API_BASE_URL ya termina en /api/publicapi no se duplica', () => {
  assert.equal(U.resolvePublicApiRoot({ API_BASE_URL: RAIZ }), RAIZ);
  // Y tolera el casing raro del sufijo.
  assert.equal(U.resolvePublicApiRoot({ API_BASE_URL: 'http://h/API/PublicApi' }),
               'http://h/api/publicapi');
});

test('BASE_URL gana sobre API_BASE_URL', () => {
  const root = U.resolvePublicApiRoot({ BASE_URL: RAIZ, API_BASE_URL: 'http://otro/btv4core' });
  assert.equal(root, RAIZ);
});

test('sin nada configurado devuelve vacio: no se inventa un host', () => {
  assert.equal(U.resolvePublicApiRoot({}), '');
  assert.equal(U.resolvePublicApiRoot(null), '');
  assert.equal(U.resolvePublicApiRoot({ BASE_URL: '   ' }), '');
});

test('sin raiz, los candidatos quedan como rutas relativas', () => {
  assert.deepEqual(U.authUrlCandidates({}), ['/authenticate/v1/execute', '/Authenticate/v1/Execute']);
});

// ── Comparacion de URLs ──────────────────────────────────────

test('esMismaAuthSalvoCasing detecta que las dos formas son la misma ruta', () => {
  assert.equal(U.esMismaAuthSalvoCasing(RAIZ + '/authenticate/v1/execute',
                                        RAIZ + '/Authenticate/v1/Execute'), true);
  assert.equal(U.esMismaAuthSalvoCasing(RAIZ + '/authenticate/v1/execute',
                                        RAIZ + '/session/v1/userlogin'), false);
  assert.equal(U.esMismaAuthSalvoCasing('', ''), true);
});

// ── Que ninguna copia del proyecto vuelva a las mayusculas ───

test('ningun archivo del front ni del backend arma la URL con mayusculas', () => {
  const fs = require('fs');
  const path = require('path');
  const RAIZ_PROY = path.join(__dirname, '..', '..', '..');

  const archivos = [
    'setup.js',
    'scripts/generar-collections/index.js',
    'public/collections.js',
    'public/collections/shared/collection-utils.js',
    'public/wizard-doc.js',
    'public/collections/execution/collection-execution-mock-data-builder.js',
  ];

  archivos.forEach(function (rel) {
    const src = fs.readFileSync(path.join(RAIZ_PROY, rel), 'utf8');
    // Se buscan literales de URL, no los regex de deteccion (que son
    // case-insensitive a proposito y tienen que seguir aceptando las dos).
    const literales = [...src.matchAll(/['"`][^'"`]*\/Authenticate\/v\d+\/Execute[^'"`]*['"`]/g)]
      .map(function (m) { return m[0]; });
    assert.deepEqual(literales, [],
      rel + ' arma la URL con mayusculas: ' + literales.join(', ') +
      '\n  Esa forma devuelve 404. Usa bantotal-urls (backend) o el literal en minusculas (front).');
  });
});

test('los regex de deteccion siguen aceptando las dos formas', () => {
  const fs = require('fs');
  const path = require('path');
  const src = fs.readFileSync(
    path.join(__dirname, '..', '..', 'generar-collections', 'index.js'), 'utf8');

  // findInternaAuthOperation y resolveSwaggerAuthUrl matchean el path que
  // declare el swagger, y ese puede venir en cualquier casing segun el
  // ambiente. Si alguien les saca el /i, dejan de encontrar la mitad.
  const deteccion = [...src.matchAll(/\/\\\/Authenticate\\\/v\\d\+\\\/Execute\$\/([a-z]*)/g)]
    .map(function (m) { return m[1]; });
  assert.ok(deteccion.length >= 2, 'esperaba al menos 2 regex de deteccion, hay ' + deteccion.length);
  deteccion.forEach(function (flags) {
    assert.ok(flags.includes('i'),
              'un regex de deteccion perdio el flag /i: dejaria de reconocer el path segun el ambiente');
  });
});

// ── El reintento entre las dos formas ────────────────────────

function posterFalso(porUrl) {
  const pedidos = [];
  const poster = async function (url) {
    pedidos.push(url);
    const r = porUrl[url];
    if (!r) return { status: 404, raw: 'no encontrado' };
    return r;
  };
  return { poster, pedidos };
}

test('si la forma actual anda, no se prueba la vieja', async () => {
  const c = U.authUrlCandidates({ BASE_URL: RAIZ });
  const { poster, pedidos } = posterFalso({ [c[0]]: { status: 200, raw: '{"SessionToken":"t"}' } });

  const r = await U.intentarCandidatos(c, poster);
  assert.equal(r.authUrl, c[0]);
  assert.equal(r.respuesta.status, 200);
  assert.deepEqual(pedidos, [c[0]], 'no tiene que pedir la forma vieja');
});

test('si la actual da 404, cae a la vieja (ambiente sin actualizar)', async () => {
  const c = U.authUrlCandidates({ BASE_URL: RAIZ });
  const { poster, pedidos } = posterFalso({ [c[1]]: { status: 200, raw: '{"SessionToken":"t"}' } });

  const r = await U.intentarCandidatos(c, poster);
  assert.equal(r.authUrl, c[1], 'tenia que quedarse con la forma que respondio');
  assert.equal(r.respuesta.status, 200);
  assert.deepEqual(pedidos, c, 'probo las dos, en orden');
});

test('un 401 NO dispara el reintento: la ruta existe, fallan las credenciales', async () => {
  const c = U.authUrlCandidates({ BASE_URL: RAIZ });
  const { poster, pedidos } = posterFalso({ [c[0]]: { status: 401, raw: '{"Mensaje":"credenciales"}' } });

  const r = await U.intentarCandidatos(c, poster);
  assert.equal(r.respuesta.status, 401);
  assert.deepEqual(pedidos, [c[0]],
    'reintentar aca duplicaria el intento de login, y hay ambientes que bloquean por intentos fallidos');
});

test('un 400 tampoco reintenta', async () => {
  const c = U.authUrlCandidates({ BASE_URL: RAIZ });
  const { poster, pedidos } = posterFalso({ [c[0]]: { status: 400, raw: '{}' } });
  await U.intentarCandidatos(c, poster);
  assert.deepEqual(pedidos, [c[0]]);
});

test('si las dos dan 404, se devuelve el ultimo estado y los dos intentos', async () => {
  const c = U.authUrlCandidates({ BASE_URL: RAIZ });
  const { poster } = posterFalso({});

  const r = await U.intentarCandidatos(c, poster);
  assert.equal(r.respuesta.status, 404);
  assert.equal(r.intentos.length, 2);
  assert.match(r.intentos[0], /authenticate\/v1\/execute -> HTTP 404/);
  assert.match(r.intentos[1], /Authenticate\/v1\/Execute -> HTTP 404/);
});

test('con un solo candidato (URL escrita a mano) no inventa un segundo intento', async () => {
  const mano = 'http://mi-host/mi/ruta/de/auth';
  const { poster, pedidos } = posterFalso({});
  const r = await U.intentarCandidatos([mano], poster);
  assert.deepEqual(pedidos, [mano]);
  assert.equal(r.intentos.length, 1);
});

test('sin candidatos falla con un mensaje claro en vez de romper', async () => {
  await assert.rejects(() => U.intentarCandidatos([], async () => ({ status: 200, raw: '' })),
                       /No hay ninguna URL de autenticacion/);
  await assert.rejects(() => U.intentarCandidatos(null, async () => ({ status: 200, raw: '' })),
                       /No hay ninguna URL/);
});

// ── Autenticacion nueva de la API publica: user-login + Bearer ─────────────
//
// Arquitectura dejo de usar Authenticate.Execute. Estos tests fijan el
// contrato entero del esquema nuevo (URL, canal, body, de donde sale el
// token, como viaja despues), porque hay cuatro consumidores -- setup.js,
// generar-collections, generar-doc y el front -- y la unica forma de que no
// se desincronicen es que todos pidan lo mismo aca.

test('el primer candidato es el user-login de session, no el Authenticate viejo', () => {
  const c = U.authCandidates({ BASE_URL: RAIZ });
  assert.equal(c[0].kind, U.KIND_SESSION_PUBLICA);
  assert.equal(c[0].url, RAIZ + '/session/v1/user-login');
});

test('el Authenticate viejo sigue como fallback, en sus dos formas', () => {
  const c = U.authCandidates({ BASE_URL: RAIZ });
  assert.equal(c.length, 3);
  assert.equal(c[1].kind, U.KIND_AUTHENTICATE);
  assert.equal(c[1].url, RAIZ + '/authenticate/v1/execute');
  assert.equal(c[2].kind, U.KIND_AUTHENTICATE);
  assert.equal(c[2].url, RAIZ + '/Authenticate/v1/Execute');
});

test('los candidatos derivan la raiz igual que authUrlCandidates', () => {
  const c = U.authCandidates({ API_BASE_URL: 'http://10.0.0.7:5101/core' });
  assert.equal(c[0].url, 'http://10.0.0.7:5101/core/api/publicapi/session/v1/user-login');
});

// Medido contra un ambiente real (10.0.0.7:5101): el login necesita Canal Y
// Device. Solo con Canal devuelve "API internal error" (Code 500), y con un
// header Token (aunque sea vacio) devuelve 401 "Token is blank".
test('el login publico manda canal BTPUBLIC, Device y jwt:true, y nada mas', () => {
  const r = U.buildAuthPayload(U.KIND_SESSION_PUBLICA, {
    username: 'INSTALADOR', password: 'Bantotal2015', channel: 'BTDIGITAL', device: 'GP', requirement: '9',
  });
  assert.deepEqual(JSON.parse(r.body), { user: 'INSTALADOR', userPassword: 'Bantotal2015', jwt: true });
  assert.equal(r.headers.Canal, 'BTPUBLIC');
  assert.equal(r.headers.Device, 'GP');
  assert.deepEqual(Object.keys(r.headers).sort(), ['Canal', 'Content-Type', 'Device']);
});

test('el login publico NO manda Token: con Token el ambiente contesta 401', () => {
  const r = U.buildAuthPayload(U.KIND_SESSION_PUBLICA, { username: 'u', password: 'p', device: 'GP' });
  assert.equal('Token' in r.headers, false);
  assert.equal('Usuario' in r.headers, false);
  assert.equal('Requerimiento' in r.headers, false);
});

test('sin Device configurado el login cae a INSTALADOR, no manda el header vacio', () => {
  const r = U.buildAuthPayload(U.KIND_SESSION_PUBLICA, { username: 'u', password: 'p' });
  assert.equal(r.headers.Device, 'INSTALADOR');
});

test('el canal del ambiente NO pisa el BTPUBLIC del login publico', () => {
  const r = U.buildAuthPayload(U.KIND_SESSION_PUBLICA, { username: 'u', password: 'p', channel: 'BTMOVIL' });
  assert.equal(r.headers.Canal, 'BTPUBLIC');
});

test('el Authenticate viejo sigue mandando UserId/UserPassword y los cinco headers', () => {
  const r = U.buildAuthPayload(U.KIND_AUTHENTICATE, {
    username: 'INSTALADOR', password: 'p', channel: 'BTDIGITAL', device: 'INSTALADOR', requirement: '1',
  });
  assert.deepEqual(JSON.parse(r.body), { UserId: 'INSTALADOR', UserPassword: 'p' });
  assert.equal(r.headers.Canal, 'BTDIGITAL');
  assert.equal(r.headers.Usuario, 'INSTALADOR');
  assert.equal(r.headers.Token, '');
});

test('el token sale de sessionToken con user-login y de SessionToken con Authenticate', () => {
  assert.equal(U.extractAuthToken(U.KIND_SESSION_PUBLICA, { sessionToken: 'abc', SessionToken: 'no' }), 'abc');
  assert.equal(U.extractAuthToken(U.KIND_AUTHENTICATE, { SessionToken: 'xyz' }), 'xyz');
  assert.equal(U.extractAuthToken(U.KIND_SESSION_PUBLICA, { success: false }), '');
});

test('con jwt el request de negocio lleva SOLO Authorization: Bearer', () => {
  const h = U.buildRequestAuthHeaders(U.KIND_SESSION_PUBLICA, {
    token: 'jwt.123', channel: 'BTPUBLIC', username: 'INSTALADOR', device: 'X', requirement: '1',
  });
  assert.deepEqual(h, { Authorization: 'Bearer jwt.123' });
});

test('sin jwt el request de negocio sigue llevando los headers de canal', () => {
  const h = U.buildRequestAuthHeaders(U.KIND_AUTHENTICATE, {
    token: 'T1', channel: 'BTDIGITAL', username: 'INSTALADOR', device: 'INSTALADOR', requirement: '1',
  });
  assert.deepEqual(h, {
    Canal: 'BTDIGITAL', Usuario: 'INSTALADOR', Device: 'INSTALADOR', Requerimiento: '1', Token: 'T1',
  });
  assert.equal(h.Authorization, undefined);
});

test('usaBearer solo es cierto para el login publico', () => {
  assert.equal(U.usaBearer(U.KIND_SESSION_PUBLICA), true);
  assert.equal(U.usaBearer(U.KIND_AUTHENTICATE), false);
  // 'session-userlogin' es "API interna": mismo body, pero header Token.
  assert.equal(U.usaBearer('session-userlogin'), false);
  assert.equal(U.usaBearer(undefined), false);
});

test('esPathSessionLogin acepta el kebab publico y el camelCase de los swagger', () => {
  assert.equal(U.esPathSessionLogin('/session/v1/user-login'), true);
  assert.equal(U.esPathSessionLogin('/Session/v1/userLogin'), true);
  assert.equal(U.esPathSessionLogin('/session/v2/user-login'), true);
  assert.equal(U.esPathSessionLogin('/session/user-login'), false, 'exige el segmento de version');
  assert.equal(U.esPathSessionLogin('/Authenticate/v1/Execute'), false);
});

test('intentarCandidatosAuth devuelve el esquema del candidato que respondio', async () => {
  const c = U.authCandidates({ BASE_URL: RAIZ });
  // Ambiente sin migrar: el user-login no existe y contesta el Authenticate.
  const poster = async (cand) => ({ status: cand.kind === U.KIND_SESSION_PUBLICA ? 404 : 200, raw: '{}' });
  const r = await U.intentarCandidatosAuth(c, poster);
  assert.equal(r.authKind, U.KIND_AUTHENTICATE);
  assert.equal(r.authUrl, RAIZ + '/authenticate/v1/execute');
  assert.equal(r.intentos.length, 2);
});

test('intentarCandidatosAuth corta en el user-login si existe, sin tocar el Authenticate', async () => {
  const c = U.authCandidates({ BASE_URL: RAIZ });
  const vistos = [];
  const poster = async (cand) => { vistos.push(cand.url); return { status: 200, raw: '{}' }; };
  const r = await U.intentarCandidatosAuth(c, poster);
  assert.equal(r.authKind, U.KIND_SESSION_PUBLICA);
  assert.deepEqual(vistos, [RAIZ + '/session/v1/user-login']);
});

test('un 401 del user-login NO reintenta con el Authenticate viejo', async () => {
  // Credenciales mal no es "el endpoint no existe": reintentar duplicaria el
  // intento fallido contra un ambiente que bloquea por intentos.
  const c = U.authCandidates({ BASE_URL: RAIZ });
  const vistos = [];
  const poster = async (cand) => { vistos.push(cand.url); return { status: 401, raw: '{}' }; };
  const r = await U.intentarCandidatosAuth(c, poster);
  assert.equal(vistos.length, 1);
  assert.equal(r.authKind, U.KIND_SESSION_PUBLICA);
});

// ── Diagnostico de una autenticacion fallida ──────────────────────────────
//
// Medido contra un ambiente real (10.0.0.7:5101): el user-login existe pero
// contesta HTTP 400 con {"Description":"API internal error","Code":500}. Con
// el Description pelado no habia forma de saber si fallaba la URL, las
// credenciales o el ambiente, y se perdia media hora probando lo que ya
// estaba bien.

test('extractAuthError lee el error de negocio en los formatos que usa el ambiente', () => {
  assert.deepEqual(
    U.extractAuthError({ BusinessErrors: { BusinessError: [{ Description: 'API internal error', Code: 500 }] } }),
    { description: 'API internal error', code: '500' });
  assert.deepEqual(U.extractAuthError({ messages: { global: 'Token is blank' } }),
                   { description: 'Token is blank', code: '' });
  assert.deepEqual(U.extractAuthError({ Btoutreq: { Mensaje: 'Usuario invalido' } }),
                   { description: 'Usuario invalido', code: '' });
  assert.deepEqual(U.extractAuthError({}), { description: '', code: '' });
});

test('el mensaje de falla dice que URL, que esquema y que status', () => {
  const m = U.describeAuthFailure({
    url: RAIZ + '/session/v1/user-login',
    authKind: U.KIND_SESSION_PUBLICA,
    status: 400,
    parsedJson: { BusinessErrors: { BusinessError: [{ Description: 'API internal error', Code: 500 }] } },
  });
  assert.match(m, /API internal error \(codigo 500\)/);
  assert.match(m, /user-login de session/);
  assert.match(m, /session\/v1\/user-login/);
  assert.match(m, /HTTP 400/);
});

test('un Code 500 se llama por su nombre: el ambiente fallo, no la configuracion', () => {
  const m = U.describeAuthFailure({
    url: RAIZ + '/session/v1/user-login',
    authKind: U.KIND_SESSION_PUBLICA,
    status: 400,
    parsedJson: { BusinessErrors: { BusinessError: [{ Description: 'API internal error', Code: 500 }] } },
  });
  assert.match(m, /fallo del lado del servidor/);
  // Y explica por que no se cayo al Authenticate viejo, que es la otra
  // pregunta obvia al ver el error.
  assert.match(m, /No se probo el Authenticate viejo/);
});

test('un error de credenciales NO se disfraza de problema del ambiente', () => {
  const m = U.describeAuthFailure({
    url: RAIZ + '/session/v1/user-login',
    authKind: U.KIND_SESSION_PUBLICA,
    status: 401,
    parsedJson: { BusinessErrors: { BusinessError: [{ Description: 'Usuario o contrasena invalidos', Code: 10005 }] } },
  });
  assert.match(m, /Usuario o contrasena invalidos \(codigo 10005\)/);
  assert.doesNotMatch(m, /fallo del lado del servidor/);
});

test('cuando se probo mas de un esquema, el mensaje los lista', () => {
  const m = U.describeAuthFailure({
    url: RAIZ + '/authenticate/v1/execute',
    authKind: U.KIND_AUTHENTICATE,
    status: 400,
    parsedJson: { BusinessErrors: { BusinessError: [{ Description: 'Canal no declarado', Code: 10021 }] } },
    intentos: [RAIZ + '/session/v1/user-login -> HTTP 404', RAIZ + '/authenticate/v1/execute -> HTTP 400'],
  });
  assert.match(m, /Canal no declarado/);
  assert.match(m, /Se probaron: .*user-login -> HTTP 404/);
  assert.doesNotMatch(m, /No se probo el Authenticate viejo/);
});

test('sin JSON parseable el mensaje muestra el crudo recortado, no "undefined"', () => {
  const m = U.describeAuthFailure({
    url: RAIZ + '/session/v1/user-login',
    authKind: U.KIND_SESSION_PUBLICA,
    status: 502,
    parsedJson: null,
    raw: '<html>\n  <body>Bad Gateway</body>\n</html>',
  });
  assert.match(m, /Bad Gateway/);
  assert.doesNotMatch(m, /undefined/);
  assert.match(m, /fallo del lado del servidor/, 'un 502 tambien es del ambiente');
});

test('intentarCandidatosAuth sin candidatos falla con un mensaje claro', async () => {
  await assert.rejects(() => U.intentarCandidatosAuth([], async () => ({ status: 200, raw: '' })),
                       /No hay ninguna URL de autenticacion/);
  await assert.rejects(() => U.intentarCandidatosAuth(null, async () => ({ status: 200, raw: '' })),
                       /No hay ninguna URL de autenticacion/);
});
