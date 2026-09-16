// Gate test de /api/collection/swagger-history: guardar/listar/eliminar
// ambientes Swagger con nombre, el mismo patron que /sg/api/db-history pero
// sin credenciales. Usa un directorio temporal (deps.swaggerHistoryDir) para
// no tocar el %APPDATA% real de quien corre la suite.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { createCollectionFeature } = require('./index');

const RAIZ_PROYECTO = path.join(__dirname, '..', '..');

function carpetaTemp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'btapi-swagger-history-route-'));
}

function feature(dir) {
  return createCollectionFeature({
    ROOT: RAIZ_PROYECTO,
    queryServicesWithMethods: async () => ({ services: [], methodsByService: {} }),
    queryMethodSchema: async () => ({}),
    swaggerHistoryDir: dir || carpetaTemp(),
  });
}

function llamar(f, body) {
  return new Promise((resolve, reject) => {
    const req = { method: 'POST', url: '/api/collection/swagger-history' };
    const res = {};
    const helpers = {
      json: (status, payload) => resolve(payload),
      readBody: async () => body,
    };
    f.handleApi(req, res, helpers).then((manejada) => {
      if (!manejada) reject(new Error('handleApi no tomo la ruta'));
    }, reject);
  });
}

test('list() sin nada guardado devuelve historial vacio', async () => {
  const r = await llamar(feature(), { action: 'list' });
  assert.equal(r.ok, true);
  assert.deepEqual(r.history, []);
});

test('save() sin URLs falla con mensaje claro', async () => {
  const r = await llamar(feature(), { action: 'save', label: 'X', swaggerUrls: [] });
  assert.equal(r.ok, false);
  assert.match(r.message, /al menos una ruta Swagger/);
});

test('save() + list(): la entrada guardada aparece con su label y URLs', async () => {
  const dir = carpetaTemp();
  const f = feature(dir);

  const saved = await llamar(f, {
    action: 'save',
    label: 'Produccion V4',
    swaggerUrls: [' http://10.0.0.7:5101/api/publicapi/v3/api-docs ', ''],
    autoDetectAuth: false,
  });
  assert.equal(saved.ok, true);
  assert.ok(saved.id);

  const listed = await llamar(f, { action: 'list' });
  assert.equal(listed.history.length, 1);
  assert.equal(listed.history[0].label, 'Produccion V4');
  // Se recorta el whitespace y se descarta la URL vacia.
  assert.deepEqual(listed.history[0].swaggerUrls, ['http://10.0.0.7:5101/api/publicapi/v3/api-docs']);
  assert.equal(listed.history[0].autoDetectAuth, false);
});

test('save() sin label usa la primera URL como nombre', async () => {
  const f = feature();
  const saved = await llamar(f, { action: 'save', swaggerUrls: ['http://x/swagger.json'] });
  const listed = await llamar(f, { action: 'list' });
  assert.equal(listed.history[0].label, 'http://x/swagger.json');
});

test('save() con el mismo set de URLs actualiza la entrada, no la duplica', async () => {
  const dir = carpetaTemp();
  const f = feature(dir);

  const primero = await llamar(f, { action: 'save', label: 'Desa', swaggerUrls: ['http://a/x'] });
  const segundo = await llamar(f, { action: 'save', label: 'Desa (renombrada)', swaggerUrls: ['http://a/x'] });

  assert.equal(segundo.id, primero.id);
  assert.equal(segundo.updated, true);

  const listed = await llamar(f, { action: 'list' });
  assert.equal(listed.history.length, 1);
  assert.equal(listed.history[0].label, 'Desa (renombrada)');
});

test('save() con el mismo set de URLs en otro orden tambien dedupea', async () => {
  const dir = carpetaTemp();
  const f = feature(dir);

  await llamar(f, { action: 'save', label: 'A', swaggerUrls: ['http://a/x', 'http://b/y'] });
  const segundo = await llamar(f, { action: 'save', label: 'A (2)', swaggerUrls: ['http://b/y', 'http://a/x'] });

  assert.equal(segundo.updated, true);
  const listed = await llamar(f, { action: 'list' });
  assert.equal(listed.history.length, 1);
});

test('delete() saca la entrada del historial', async () => {
  const dir = carpetaTemp();
  const f = feature(dir);

  const saved = await llamar(f, { action: 'save', label: 'Para borrar', swaggerUrls: ['http://a/x'] });
  await llamar(f, { action: 'delete', id: saved.id });

  const listed = await llamar(f, { action: 'list' });
  assert.deepEqual(listed.history, []);
});

test('accion desconocida devuelve ok:false sin explotar', async () => {
  const r = await llamar(feature(), { action: 'lo-que-sea' });
  assert.equal(r.ok, false);
});
