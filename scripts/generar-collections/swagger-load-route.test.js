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
function swaggerDoc(raiz) {
  return {
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
}

// Servidor de swagger en puerto efimero. Registra que rutas se pidieron,
// que es lo que hace observable el bug de duplicacion.
function servidorSwagger() {
  const pedidos = [];
  const server = http.createServer((req, res) => {
    pedidos.push(req.url);
    if (/^\/(v3\/api-docs|api-docs|swagger\.json|openapi\.json|swagger\/v1\/swagger\.json)/.test(req.url)) {
      const raiz = 'http://127.0.0.1:' + server.address().port;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(swaggerDoc(raiz)));
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

test('API publica: usa Authenticate/Execute', async () => {
  const sw = await servidorSwagger();
  try {
    const r = await cargarSwagger(feature(), {
      swaggerUrls: [sw.raiz + '/v3/api-docs'], apiMode: 'publica', api: {},
    });
    assert.equal(r.ok, true, r.message);
    assert.equal(r.authKind, 'authenticate-execute');
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
