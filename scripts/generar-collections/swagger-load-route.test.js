// Gate test de la ruta /api/collection/swagger/load.
//
// Cubre los dos defectos que el modulo puro swagger-candidates no puede
// cubrir solo, porque viven en el handler:
//
//  1. Dejar el campo Swagger vacio y descubrirlo por api.BASE_URL dejo de
//     funcionar cuando la ruta paso a aceptar una lista de URLs: el
//     .filter(Boolean) descartaba el string vacio y cortaba antes de
//     intentar. Andaba antes del cambio a multi-swagger.
//
//  2. Con varias URLs, cada una caia de vuelta a los candidatos derivados
//     de api.BASE_URL. Un microservicio caido entonces resolvia al swagger
//     principal y DUPLICABA todas sus operaciones en el catalogo fusionado.
//
// Levanta un swagger real en loopback en vez de mockear el fetch: el bug 2
// era justamente en que URL se termina pidiendo, y un mock del fetch no lo
// hubiera mostrado. Es rapido igual (~150ms) y no sale de 127.0.0.1.

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const path = require('path');

const { createCollectionFeature } = require('./index');

const RAIZ_PROYECTO = path.join(__dirname, '..', '..');

// Paths versionados, como los expone Bantotal (/Session/v1/userLogin, no
// /Session/userLogin): findInternaAuthOperation exige el segmento de version.
function swaggerDoc(raiz, opciones) {
  const o = opciones || {};
  const doc = {
    openapi: '3.0.1',
    info: { title: 'Fake', version: '1.0' },
    servers: [{ url: raiz + '/btv4core' }],
    paths: {
      '/Customers/v1/getCustomer': { get: { tags: ['Customers'], operationId: 'getCustomer', responses: { 200: { description: 'ok' } } } },
      '/Customers/v1/additionalInformation': {
        get: { tags: ['Customers'], operationId: 'getAdd', responses: { 200: { description: 'ok' } } },
        put: { tags: ['Customers'], operationId: 'putAdd', responses: { 200: { description: 'ok' } } },
      },
      '/Session/v1/userLogin': { post: { tags: ['Session'], operationId: 'userLogin', responses: { 200: { description: 'ok' } } } },
      '/Authenticate/v1/Execute': { post: { tags: ['Authenticate'], operationId: 'exec', responses: { 200: { description: 'ok' } } } },
    },
  };
  // Variantes para los ambientes que no exponen uno u otro login.
  if (o.sinSessionLogin) delete doc.paths['/Session/v1/userLogin'];
  if (o.sinAuthenticate) delete doc.paths['/Authenticate/v1/Execute'];
  return doc;
}

// Servidor de swagger en puerto efimero. Registra que rutas se pidieron,
// que es lo que hace observable el bug de duplicacion.
function servidorSwagger(opciones) {
  const pedidos = [];
  const server = http.createServer((req, res) => {
    pedidos.push(req.url);
    if (/^\/(v3\/api-docs|api-docs|swagger\.json|openapi\.json|swagger\/v1\/swagger\.json)/.test(req.url)) {
      const raiz = 'http://127.0.0.1:' + server.address().port;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(swaggerDoc(raiz, opciones)));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404');
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({
        raiz: 'http://127.0.0.1:' + server.address().port,
        pedidos,
        cerrar: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

// Llama handleApi directo, sin levantar el server de la app.
function cargarSwagger(feature, body) {
  return new Promise((resolve, reject) => {
    const req = { method: 'POST', url: '/api/collection/swagger/load' };
    const res = {};
    const helpers = {
      json: (status, payload) => resolve(payload),
      readBody: async () => body,
    };
    feature.handleApi(req, res, helpers).then((manejada) => {
      if (!manejada) reject(new Error('handleApi no tomo la ruta'));
    }, reject);
  });
}

function feature() {
  return createCollectionFeature({
    ROOT: RAIZ_PROYECTO,
    queryServicesWithMethods: async () => ({ services: [], methodsByService: {} }),
    queryMethodSchema: async () => ({}),
  });
}

function totalOps(resultado) {
  return Object.values(resultado.operationsByService || {}).reduce((a, v) => a + v.length, 0);
}

test('url directa al documento: carga el catalogo', async () => {
  const sw = await servidorSwagger();
  try {
    const r = await cargarSwagger(feature(), { swaggerUrl: sw.raiz + '/v3/api-docs', api: {} });
    assert.equal(r.ok, true, r.message);
    assert.deepEqual(r.services, ['Authenticate', 'Customers', 'Session']);
    assert.equal(totalOps(r), 5);
  } finally { await sw.cerrar(); }
});

test('url base pelada: prueba los sufijos y encuentra el documento', async () => {
  const sw = await servidorSwagger();
  try {
    const r = await cargarSwagger(feature(), { swaggerUrl: sw.raiz, api: {} });
    assert.equal(r.ok, true, r.message);
    assert.equal(totalOps(r), 5);
    assert.ok(sw.pedidos.includes('/v3/api-docs'),
              'tenia que probar /v3/api-docs; pidio: ' + sw.pedidos.join(' '));
  } finally { await sw.cerrar(); }
});

// Defecto 1
test('campo Swagger vacio + BASE_URL: descubre el documento solo', async () => {
  const sw = await servidorSwagger();
  try {
    const r = await cargarSwagger(feature(), { swaggerUrl: '', api: { BASE_URL: sw.raiz + '/publicapi' } });
    assert.equal(r.ok, true, r.message);
    assert.equal(totalOps(r), 5);
  } finally { await sw.cerrar(); }
});

test('campo Swagger vacio en la lista nueva: mismo comportamiento', async () => {
  const sw = await servidorSwagger();
  try {
    const r = await cargarSwagger(feature(), { swaggerUrls: [''], api: { BASE_URL: sw.raiz + '/publicapi' } });
    assert.equal(r.ok, true, r.message);
    assert.equal(totalOps(r), 5);
  } finally { await sw.cerrar(); }
});

test('sin url y sin BASE_URL: error que dice que hacer, no uno generico', async () => {
  const r = await cargarSwagger(feature(), { swaggerUrl: '', api: {} });
  assert.equal(r.ok, false);
  assert.match(r.message, /URL base del ambiente/i,
               'el mensaje tiene que decir la alternativa; dijo: ' + r.message);
});

// Defecto 2
test('una fuente caida NO duplica las operaciones de la que si respondio', async () => {
  const sw = await servidorSwagger();
  try {
    const r = await cargarSwagger(feature(), {
      // La segunda no existe. Antes, sus candidatos caian a BASE_URL (que
      // apunta al MISMO swagger) y cargaba todo dos veces.
      swaggerUrls: [sw.raiz + '/v3/api-docs', 'http://127.0.0.1:1/term-deposit'],
      api: { BASE_URL: sw.raiz + '/publicapi' },
    });
    assert.equal(r.ok, true, r.message);
    assert.equal(totalOps(r), 5, 'se duplicaron las operaciones');
    assert.equal(r.sources.length, 1, 'solo una fuente tiene que haber cargado');
    assert.equal(r.failedSources.length, 1, 'y la caida tiene que reportarse como caida');
    assert.equal(sw.pedidos.filter((u) => u === '/v3/api-docs').length, 1,
                 'el swagger se pidio mas de una vez: ' + sw.pedidos.join(' '));
  } finally { await sw.cerrar(); }
});

test('todas las fuentes caidas: falla y lista cual fallo y por que', async () => {
  const r = await cargarSwagger(feature(), {
    swaggerUrls: ['http://127.0.0.1:1/a', 'http://127.0.0.1:2/b'],
    api: {},
  });
  assert.equal(r.ok, false);
  assert.match(r.message, /No se pudo leer ningun swagger/);
  assert.match(r.message, /127\.0\.0\.1:1/);
  assert.match(r.message, /127\.0\.0\.1:2/);
});

// La deteccion de autenticacion que trajo el merge
test('API interna: detecta Session.userLogin', async () => {
  const sw = await servidorSwagger();
  try {
    const r = await cargarSwagger(feature(), {
      swaggerUrls: [sw.raiz + '/v3/api-docs'], apiMode: 'interna', api: {},
    });
    assert.equal(r.ok, true, r.message);
    assert.equal(r.authKind, 'session-userlogin');
    assert.match(r.authUrl, /\/Session\/v1\/userLogin$/);
    assert.equal(r.authWarning, '');
  } finally { await sw.cerrar(); }
});

// La API publica dejo de usar Authenticate.Execute: si el ambiente expone el
// login de session, ese es el esquema (jwt + Authorization: Bearer).
test('API publica: prefiere el user-login de session sobre Authenticate', async () => {
  const sw = await servidorSwagger();
  try {
    const r = await cargarSwagger(feature(), {
      swaggerUrls: [sw.raiz + '/v3/api-docs'], apiMode: 'publica', api: {},
    });
    assert.equal(r.ok, true, r.message);
    assert.equal(r.authKind, 'public-session-userlogin');
    assert.match(r.authUrl, /\/Session\/v1\/userLogin$/);
  } finally { await sw.cerrar(); }
});

// Ambiente sin migrar: no expone el login de session, solo el Authenticate
// viejo. Ahi el esquema viejo es el unico que anda y hay que respetarlo.
test('API publica: cae a Authenticate/Execute si el ambiente no expone user-login', async () => {
  const sw = await servidorSwagger({ sinSessionLogin: true });
  try {
    const r = await cargarSwagger(feature(), {
      swaggerUrls: [sw.raiz + '/v3/api-docs'], apiMode: 'publica', api: {},
    });
    assert.equal(r.ok, true, r.message);
    assert.equal(r.authKind, 'authenticate-execute');
    assert.match(r.authUrl, /\/Authenticate\/v1\/Execute$/);
  } finally { await sw.cerrar(); }
});

// Ningun swagger cargado declara el login (es comun: session suele vivir en
// otro swagger). Se asume el esquema nuevo y se arma la URL contra la raiz
// del ambiente; el fallback al Authenticate viejo lo hace despues "Probar
// autenticacion" (ver authCandidates).
test('API publica: sin login declarado asume user-login contra la raiz del ambiente', async () => {
  const sw = await servidorSwagger({ sinSessionLogin: true, sinAuthenticate: true });
  try {
    const r = await cargarSwagger(feature(), {
      swaggerUrls: [sw.raiz + '/v3/api-docs'], apiMode: 'publica',
      api: { BASE_URL: sw.raiz + '/api/publicapi' },
    });
    assert.equal(r.ok, true, r.message);
    assert.equal(r.authKind, 'public-session-userlogin');
    assert.equal(r.authUrl, sw.raiz + '/api/publicapi/session/v1/user-login');
  } finally { await sw.cerrar(); }
});

test('autoDetectAuth:false no resuelve autenticacion ni avisa', async () => {
  const sw = await servidorSwagger();
  try {
    const r = await cargarSwagger(feature(), {
      swaggerUrls: [sw.raiz + '/v3/api-docs'], apiMode: 'interna', autoDetectAuth: false, api: {},
    });
    assert.equal(r.ok, true, r.message);
    assert.equal(r.authKind, null);
    assert.equal(r.authUrl, '');
    assert.equal(r.authWarning, '');
  } finally { await sw.cerrar(); }
});

test('el mismo nombre con dos verbos cuenta como dos operaciones', async () => {
  const sw = await servidorSwagger();
  try {
    const r = await cargarSwagger(feature(), { swaggerUrl: sw.raiz + '/v3/api-docs', api: {} });
    const nombres = (r.operationsByService.Customers || []).map((o) => o.path + ' ' + o.httpMethod);
    const add = nombres.filter((n) => /additionalInformation/.test(n));
    assert.equal(add.length, 2, 'GET y PUT del mismo path son dos: ' + nombres.join(' | '));
  } finally { await sw.cerrar(); }
});

// ── HTTPS con certificado interno ────────────────────────────
//
// Los ambientes Bantotal usan certificados que no validan contra las CAs
// del sistema. El proyecto ya lo asume en 7 lugares (setup.js
// /api/test-auth y 3 veces en index.js); httpGetText era el unico que no,
// asi que un swagger servido por HTTPS fallaba con error de TLS y el
// usuario solo veia "no se pudo leer".

// ── Reporte de intentos ──────────────────────────────────────

test('cuando no encuentra nada, el error lista CADA ruta probada y su motivo', async () => {
  // Puerto 1: nadie escucha, todos los candidatos dan ECONNREFUSED.
  const r = await cargarSwagger(feature(), { swaggerUrl: 'http://127.0.0.1:1/btv4core', api: {} });

  assert.equal(r.ok, false);
  assert.match(r.message, /Se probaron \d+ rutas/,
               'el mensaje tiene que decir cuantas probo; dijo: ' + r.message);
  assert.match(r.message, /\/v3\/api-docs/, 'y nombrar los candidatos');
  assert.match(r.message, /\/swagger\.json/);
  assert.match(r.message, /ECONNREFUSED|refused/i, 'y el motivo de cada uno');
});

test('un 404 se reporta como HTTP 404, no como error generico', async () => {
  const sw = await servidorSwagger();
  try {
    // /nada no matchea ninguna ruta del servidor de prueba: siempre 404.
    const r = await cargarSwagger(feature(), { swaggerUrl: sw.raiz + '/nada/openapi.json', api: {} });
    assert.equal(r.ok, false);
    assert.match(r.message, /HTTP 404/, 'dijo: ' + r.message);
  } finally { await sw.cerrar(); }
});

test('una respuesta que no es swagger se reporta como tal, no como "no se pudo leer"', async () => {
  const otro = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ hola: 'no soy un swagger' }));
  });
  await new Promise((r) => otro.listen(0, '127.0.0.1', r));
  try {
    const raiz = 'http://127.0.0.1:' + otro.address().port;
    const r = await cargarSwagger(feature(), { swaggerUrl: raiz + '/v3/api-docs', api: {} });
    assert.equal(r.ok, false);
    assert.match(r.message, /no es un documento Swagger|sin campo/i, 'dijo: ' + r.message);
  } finally { await new Promise((r) => otro.close(r)); }
});

// ── HTTPS con certificado interno ────────────────────────────
//
// Los ambientes Bantotal usan certificados que no validan contra las CAs
// del sistema. El proyecto ya lo asume en 7 lugares (setup.js
// /api/test-auth y 3 veces en index.js); httpGetText era el unico que no,
// asi que un swagger servido por HTTPS fallaba con error de TLS y el
// usuario solo veia "no se pudo leer". Es la causa mas probable del caso
// que no se pudo reproducir en local.
//
// Se verifica la opcion que se le pasa a https.request en vez de levantar
// un servidor TLS: generar un certificado autofirmado necesitaria una
// dependencia nueva (regla de "vanilla por defecto") o meter una clave
// privada de test en el repo, que es justo lo que este proyecto acaba de
// terminar de limpiar. La asercion pinta exactamente la linea que importa,
// asi que si alguien la borra el test se cae.

test('un swagger por HTTPS no valida el certificado contra las CAs del sistema', async () => {
  const https = require('https');
  const original = https.request;
  const opcionesVistas = [];

  https.request = function(url, opciones, cb) {
    opcionesVistas.push(opciones);
    // Se corta el pedido: solo interesa con que opciones se abrio.
    const { EventEmitter } = require('events');
    const falso = new EventEmitter();
    falso.end = function() { setImmediate(() => falso.emit('error', new Error('cortado por el test'))); };
    falso.setTimeout = function() {};
    falso.destroy = function() {};
    return falso;
  };

  try {
    await cargarSwagger(feature(), { swaggerUrl: 'https://10.0.0.7:5110/btv4core/v3/api-docs', api: {} });
  } finally {
    https.request = original;
  }

  assert.ok(opcionesVistas.length > 0, 'no se llamo a https.request');
  opcionesVistas.forEach(function(o) {
    assert.equal(o.rejectUnauthorized, false,
                 'https.request se abrio validando el certificado: un swagger con cert interno falla');
  });
});

test('un swagger por HTTP no toca la opcion de certificados', async () => {
  const http2 = require('http');
  const original = http2.request;
  const opcionesVistas = [];

  http2.request = function(url, opciones, cb) {
    opcionesVistas.push(opciones);
    const { EventEmitter } = require('events');
    const falso = new EventEmitter();
    falso.end = function() { setImmediate(() => falso.emit('error', new Error('cortado por el test'))); };
    falso.setTimeout = function() {};
    falso.destroy = function() {};
    return falso;
  };

  try {
    await cargarSwagger(feature(), { swaggerUrl: 'http://10.0.0.7:5110/btv4core/v3/api-docs', api: {} });
  } finally {
    http2.request = original;
  }

  assert.ok(opcionesVistas.length > 0, 'no se llamo a http.request');
  opcionesVistas.forEach(function(o) {
    assert.equal('rejectUnauthorized' in o, false, 'en HTTP la opcion no tiene sentido');
  });
});

test('cada candidato tiene timeout: un host que dropea no deja la herramienta colgada', () => {
  // Se lee del fuente porque el timeout solo se puede observar esperandolo,
  // y un test que espera 15s no es un gate test. La asercion existe para que
  // sacar el setTimeout rompa algo.
  const fs = require('fs');
  const src = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');
  assert.match(src, /req\.setTimeout\(SWAGGER_TIMEOUT_MS/,
               'httpGetText perdio el timeout por candidato');
  assert.match(src, /const SWAGGER_TIMEOUT_MS = \d+/);
});

// ── La cadena del swagger-ui ─────────────────────────────────
//
// Replica la topologia exacta del ambiente Bantotal medido
// (10.0.0.7:5101, springdoc + swagger-ui-dist):
//
//   /api/publicapi/swagger-ui/index.html          -> HTML sin config
//   /api/publicapi/swagger-ui/swagger-initializer.js -> "configUrl": ...
//   /api/publicapi/v1/api-docs/swagger-config     -> {"url": ...}
//   /api/publicapi/v1/api-docs                    -> el documento
//
// Es el caso que fallaba en uso real y que costo tres vueltas encontrar.

function servidorSwaggerUiCompleto() {
  const pedidos = [];
  const server = http.createServer((req, res) => {
    pedidos.push(req.url);
    const raiz = 'http://127.0.0.1:' + server.address().port;

    if (req.url === '/api/publicapi/swagger-ui/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      // index.html de swagger-ui-dist 4+: NO lleva la config adentro.
      res.end('<!-- HTML for static distribution bundle build -->\n<!DOCTYPE html>' +
              '<html><head><title>Swagger UI</title></head><body><div id="swagger-ui"></div>' +
              '<script src="./swagger-ui-bundle.js"></script>' +
              '<script src="./swagger-initializer.js"></script></body></html>');
      return;
    }
    if (req.url === '/api/publicapi/swagger-ui/swagger-initializer.js') {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      // Con el url: de fabrica que apunta a petstore, igual que el real.
      res.end('window.onload = function() {\n  window.ui = SwaggerUIBundle({\n' +
              '    url: "https://petstore.swagger.io/v2/swagger.json",\n' +
              '    dom_id: \'#swagger-ui\',\n' +
              '  "configUrl" : "/api/publicapi/v1/api-docs/swagger-config",\n' +
              '  "validatorUrl" : ""\n  });\n};');
      return;
    }
    if (req.url === '/api/publicapi/v1/api-docs/swagger-config') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        configUrl: '/api/publicapi/v1/api-docs/swagger-config',
        url: '/api/publicapi/v1/api-docs',
        validatorUrl: '',
      }));
      return;
    }
    if (req.url === '/api/publicapi/v1/api-docs') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(swaggerDoc(raiz + '/api/publicapi')));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404');
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({
      raiz: 'http://127.0.0.1:' + server.address().port,
      pedidos,
      cerrar: () => new Promise((r) => server.close(r)),
    }));
  });
}

test('sigue la cadena index.html -> initializer -> swagger-config -> documento', async () => {
  const sw = await servidorSwaggerUiCompleto();
  try {
    const r = await cargarSwagger(feature(), {
      // Con el fragmento #/ incluido, como lo copia el usuario del navegador.
      swaggerUrl: sw.raiz + '/api/publicapi/swagger-ui/index.html#/',
      api: {},
    });
    assert.equal(r.ok, true, 'fallo con: ' + r.message);
    assert.equal(r.resolvedUrl, sw.raiz + '/api/publicapi/v1/api-docs');
    assert.equal(totalOps(r), 5);

    // Los 4 saltos, en orden.
    const esperados = [
      '/api/publicapi/swagger-ui/index.html',
      '/api/publicapi/swagger-ui/swagger-initializer.js',
      '/api/publicapi/v1/api-docs/swagger-config',
      '/api/publicapi/v1/api-docs',
    ];
    esperados.forEach(function (u) {
      assert.ok(sw.pedidos.includes(u), 'no pidio ' + u + '; pidio: ' + sw.pedidos.join(' '));
    });
  } finally { await sw.cerrar(); }
});

test('NUNCA carga el spec de petstore que trae el initializer de fabrica', async () => {
  // El fallo silencioso mas peligroso: si el orden de precedencia se
  // rompiera, la herramienta generaria una collection de la tienda de
  // mascotas de ejemplo sin dar ningun error.
  const sw = await servidorSwaggerUiCompleto();
  try {
    const r = await cargarSwagger(feature(), {
      swaggerUrl: sw.raiz + '/api/publicapi/swagger-ui/index.html',
      api: {},
    });
    assert.equal(r.ok, true, r.message);
    assert.ok(!/petstore/i.test(r.resolvedUrl), 'resolvio al señuelo: ' + r.resolvedUrl);
    assert.ok(!r.services.includes('pet'), 'cargo el spec de petstore: ' + r.services.join(', '));
  } finally { await sw.cerrar(); }
});

test('/v1/api-docs esta entre los candidatos: el ambiente real lo usa', async () => {
  // Sin este sufijo, el ambiente medido daba 404 en las 5 rutas probadas.
  const sw = await servidorSwaggerUiCompleto();
  try {
    const r = await cargarSwagger(feature(), { swaggerUrl: sw.raiz + '/api/publicapi', api: {} });
    assert.equal(r.ok, true, 'fallo con: ' + r.message);
    assert.equal(r.resolvedUrl, sw.raiz + '/api/publicapi/v1/api-docs');
  } finally { await sw.cerrar(); }
});

test('una cadena que se apunta a si misma corta por ciclo, no cuelga', async () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    // Un config que apunta a si mismo.
    res.end(JSON.stringify({ url: req.url }));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    const raiz = 'http://127.0.0.1:' + server.address().port;
    const r = await cargarSwagger(feature(), { swaggerUrl: raiz + '/config.json', api: {} });
    assert.equal(r.ok, false);
    assert.match(r.message, /ciclo|demasiado larga/i, 'dijo: ' + r.message);
  } finally { await new Promise((r) => server.close(r)); }
});

test('el error lista los saltos de la cadena, no solo el ultimo', async () => {
  // Un swagger-ui cuyo initializer apunta a un config que no existe.
  const server = http.createServer((req, res) => {
    if (/index\.html$/.test(req.url)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<!DOCTYPE html><html><body><script src="./swagger-initializer.js"></script></body></html>');
      return;
    }
    if (/swagger-initializer\.js$/.test(req.url)) {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end('SwaggerUIBundle({ "configUrl" : "/no-existe/swagger-config" });');
      return;
    }
    res.writeHead(404); res.end('404');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    const raiz = 'http://127.0.0.1:' + server.address().port;
    const r = await cargarSwagger(feature(), { swaggerUrl: raiz + '/swagger-ui/index.html', api: {} });
    assert.equal(r.ok, false);
    assert.match(r.message, /swagger-initializer\.js/, 'no menciona el initializer: ' + r.message);
    assert.match(r.message, /no-existe\/swagger-config/, 'no menciona el config roto');
    assert.match(r.message, /HTTP 404/, 'no dice el motivo final');
  } finally { await new Promise((r) => server.close(r)); }
});
