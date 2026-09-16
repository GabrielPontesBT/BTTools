const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { createSwaggerHistoryStore, FILE_NAME } = require('./swagger-history-store');

function carpetaTemp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'btapi-swagger-history-'));
}

test('read() sin archivo devuelve lista vacia', () => {
  const store = createSwaggerHistoryStore({ dir: carpetaTemp() });
  assert.deepEqual(store.read(), []);
});

test('write()/read() persisten y devuelven las mismas entradas', () => {
  const store = createSwaggerHistoryStore({ dir: carpetaTemp() });
  const entradas = [
    { id: '1', label: 'Produccion V4', swaggerUrls: ['http://a/swagger.json'], autoDetectAuth: true },
  ];
  store.write(entradas);
  assert.deepEqual(store.read(), entradas);
});

test('write() crea el directorio si no existe todavia', () => {
  const dir = path.join(carpetaTemp(), 'no-existe-aun');
  const store = createSwaggerHistoryStore({ dir });
  store.write([{ id: '1', label: 'X', swaggerUrls: ['u'] }]);
  assert.ok(fs.existsSync(path.join(dir, FILE_NAME)));
});

test('read() con archivo corrupto no explota: devuelve vacio', () => {
  const dir = carpetaTemp();
  const store = createSwaggerHistoryStore({ dir });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, FILE_NAME), '{ esto no es json valido');
  assert.deepEqual(store.read(), []);
});

test('read() con un JSON valido que no es array devuelve vacio', () => {
  const dir = carpetaTemp();
  const store = createSwaggerHistoryStore({ dir });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, FILE_NAME), JSON.stringify({ no: 'es una lista' }));
  assert.deepEqual(store.read(), []);
});

test('write() es atomica: no deja un .tmp colgado', () => {
  const dir = carpetaTemp();
  const store = createSwaggerHistoryStore({ dir });
  store.write([{ id: '1', label: 'X', swaggerUrls: ['u'] }]);
  assert.ok(!fs.existsSync(path.join(dir, FILE_NAME + '.tmp')));
});
