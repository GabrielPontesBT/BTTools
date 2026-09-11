// Gate test de la carga del documento Swagger.
//
// Levanta un servidor real en loopback en vez de mockear el http: lo que se
// prueba es CONTRA QUE URL se pega, y un mock del fetch no lo mostraria. El
// caso que origina el test es concreto: el ambiente medido publica el
// documento en <BASE_URL>/v1/api-docs, o sea DENTRO de /api/publicapi, y el
// descubrimiento solo probaba la raiz sin /publicapi -- 404 en todo y
// "no se encontro el swagger" con un swagger que estaba ahi.

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { descargarDocumento, leerDocumento, cargarIndice, esDocumentoSwagger } = require('./cargar');

const DOC = {
  openapi: '3.0.1',
  info: { title: 'Fake', version: '1.0' },
  paths: {
    '/public/persons/v1/additional-information': {
      get: { tags: ['public-persons'], operationId: 'getAdditionalInformation' },
    },
  },
};

// Servidor que sirve el documento en UNA ruta y 404 en todo lo demas, y que
// registra que rutas se pidieron.
function servidor(rutaDelDoc) {
  const pedidos = [];
  const server = http.createServer((req, res) => {
    pedidos.push(req.url);
    if (req.url === rutaDelDoc) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(DOC));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end('{"status":404}');
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

test('encuentra el documento dentro de /api/publicapi, que es donde lo publica el ambiente real', async () => {
  const sv = await servidor('/api/publicapi/v1/api-docs');
  try {
    const r = await descargarDocumento('', { BASE_URL: sv.raiz + '/api/publicapi' });
    assert.equal(r.ok, true, r.message);
    assert.equal(r.url, sv.raiz + '/api/publicapi/v1/api-docs');
  } finally { await sv.cerrar(); }
});

test('sigue encontrandolo cuando cuelga de la raiz, sin /publicapi', async () => {
  const sv = await servidor('/v3/api-docs');
  try {
    const r = await descargarDocumento('', { BASE_URL: sv.raiz + '/publicapi' });
    assert.equal(r.ok, true, r.message);
    assert.equal(r.url, sv.raiz + '/v3/api-docs');
  } finally { await sv.cerrar(); }
});

test('una URL explicita se respeta y se pide primero', async () => {
  const sv = await servidor('/mi/swagger/raro.json');
  try {
    const r = await descargarDocumento(sv.raiz + '/mi/swagger/raro.json', {});
    assert.equal(r.ok, true, r.message);
    assert.deepEqual(sv.pedidos, ['/mi/swagger/raro.json'], 'no tiene que probar nada mas');
  } finally { await sv.cerrar(); }
});

test('una URL base explicita tambien se prueba con los sufijos', async () => {
  const sv = await servidor('/gateway/v3/api-docs');
  try {
    const r = await descargarDocumento(sv.raiz + '/gateway', {});
    assert.equal(r.ok, true, r.message);
    assert.equal(r.url, sv.raiz + '/gateway/v3/api-docs');
  } finally { await sv.cerrar(); }
});

test('si no hay documento, el error lista cada ruta probada', async () => {
  const sv = await servidor('/no-se-sirve-nunca');
  try {
    const r = await descargarDocumento('', { BASE_URL: sv.raiz + '/api/publicapi' });
    assert.equal(r.ok, false);
    assert.match(r.message, /No se encontro el documento Swagger/);
    assert.match(r.message, /api-docs -> HTTP 404/);
    assert.ok(r.intentos.length >= 8, 'tienen que quedar registradas todas las rutas probadas');
  } finally { await sv.cerrar(); }
});

test('sin URL ni BASE_URL el error dice que completar, no "no se encontro"', async () => {
  const r = await descargarDocumento('', {});
  assert.equal(r.ok, false);
  assert.match(r.message, /completa la URL de la API publica/);
});

test('una respuesta 200 que no es un swagger no se toma como documento', async () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html>Bienvenido al gateway</html>');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const raiz = 'http://127.0.0.1:' + server.address().port;
  try {
    const r = await descargarDocumento(raiz + '/v3/api-docs', {});
    assert.equal(r.ok, false);
  } finally { await new Promise((r) => server.close(r)); }
});

test('esDocumentoSwagger reconoce openapi y swagger, y descarta el resto', () => {
  assert.equal(esDocumentoSwagger('{"openapi":"3.0.1","paths":{}}'), true);
  assert.equal(esDocumentoSwagger('{"swagger":"2.0","paths":{}}'), true);
  assert.equal(esDocumentoSwagger('<html></html>'), false);
  assert.equal(esDocumentoSwagger(''), false);
});

// ── Archivo local ──────────────────────────────────────────────────────────

function archivoTemporal(contenido) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'btapi-swagger-'));
  const ruta = path.join(dir, 'swagger.json');
  fs.writeFileSync(ruta, contenido);
  return ruta;
}

test('lee el documento de un archivo guardado', () => {
  const r = leerDocumento(archivoTemporal(JSON.stringify(DOC)));
  assert.equal(r.ok, true);
  assert.ok(r.doc.paths);
});

test('un archivo que no es swagger se rechaza con un motivo', () => {
  assert.match(leerDocumento(archivoTemporal('{"hola":1}')).message, /no tiene "paths"/);
  assert.match(leerDocumento(archivoTemporal('no es json')).message, /No se pudo leer/);
  assert.match(leerDocumento('C:/no/existe/swagger.json').message, /No se pudo leer/);
});

// ── El indice completo ─────────────────────────────────────────────────────

test('el archivo guardado gana sobre la URL: es lo que el usuario pego a mano', async () => {
  const sv = await servidor('/api/publicapi/v1/api-docs');
  try {
    const r = await cargarIndice({
      archivo: archivoTemporal(JSON.stringify(DOC)),
      url: sv.raiz + '/api/publicapi/v1/api-docs',
      api: { BASE_URL: sv.raiz + '/api/publicapi' },
    });
    assert.equal(r.origen, 'archivo');
    assert.equal(r.operaciones, 1);
    assert.deepEqual(sv.pedidos, [], 'con archivo no tiene que salir a la red');
  } finally { await sv.cerrar(); }
});

test('sin swagger no se cae: devuelve indice null y quien llama deriva la ruta', async () => {
  const r = await cargarIndice({ api: {}, autodetectar: true });
  assert.equal(r.indice, null);
  assert.equal(r.origen, 'ninguno');
  assert.ok(r.message, 'tiene que decir por que no hay indice');
});

test('autodetectar:false sin URL no sale a la red', async () => {
  const sv = await servidor('/api/publicapi/v1/api-docs');
  try {
    const r = await cargarIndice({ api: { BASE_URL: sv.raiz + '/api/publicapi' }, autodetectar: false });
    assert.equal(r.indice, null);
    assert.deepEqual(sv.pedidos, []);
  } finally { await sv.cerrar(); }
});
