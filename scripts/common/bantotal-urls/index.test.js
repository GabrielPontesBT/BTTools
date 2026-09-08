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
