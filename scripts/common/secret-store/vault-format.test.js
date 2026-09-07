const test = require('node:test');
const assert = require('node:assert/strict');

const fmt = require('./vault-format');

// Shape real de una entrada del historial, con valores ficticios, y con
// los dos tipos de secreto: db.password y api.<modo>.API_PASSWORD.
// Los valores son inventados a proposito: meter credenciales reales en un
// test es la misma falla que este modulo existe para arreglar.
function entradaOracle() {
  return {
    id: '1786626429595',
    key: 'V4|ora|host-ficticio:1521/basefict|usuario_fict',
    version: 'V4',
    platform: 'oracle',
    label: 'Desa',
    db: { user: 'usuario_fict', password: 'secreto-db', connectString: 'host-ficticio:1521/basefict' },
    api: {
      publica: { BASE_URL: 'http://x', API_USER: 'apiuser', API_PASSWORD: 'secreto-api' },
    },
    savedAt: '2026-08-13T14:57:14.418Z',
  };
}

test('secretPathsOf encuentra db.password y API_PASSWORD de cada modo', () => {
  const e = entradaOracle();
  e.api.interna = { API_USER: 'u', API_PASSWORD: 'otro' };
  assert.deepEqual(fmt.secretPathsOf(e), [
    ['db', 'password'],
    ['api', 'publica', 'API_PASSWORD'],
    ['api', 'interna', 'API_PASSWORD'],
  ]);
});

test('secretPathsOf no inventa rutas cuando no hay api ni db', () => {
  assert.deepEqual(fmt.secretPathsOf({ id: '1' }), []);
  assert.deepEqual(fmt.secretPathsOf(null), []);
  assert.deepEqual(fmt.secretPathsOf('no soy un objeto'), []);
});

test('secretPathsOf ignora un modo de api que no tiene API_PASSWORD', () => {
  const e = { id: '1', api: { publica: { BASE_URL: 'http://x' } } };
  assert.deepEqual(fmt.secretPathsOf(e), []);
});

test('splitSecrets saca las passwords de las entradas y las junta aparte', () => {
  const { entries, secrets } = fmt.splitSecrets([entradaOracle()]);

  assert.equal(entries[0].db.password, '', 'la password no queda en la entrada');
  assert.equal(entries[0].api.publica.API_PASSWORD, '');
  assert.equal(entries[0].db.user, 'usuario_fict', 'lo que no es secreto queda en claro');

  assert.deepEqual(secrets, {
    '1786626429595:db.password': 'secreto-db',
    '1786626429595:api.publica.API_PASSWORD': 'secreto-api',
  });
});

test('splitSecrets no muta la lista original', () => {
  const original = entradaOracle();
  fmt.splitSecrets([original]);
  assert.equal(original.db.password, 'secreto-db');
});

test('splitSecrets no guarda passwords vacias como secreto', () => {
  const e = entradaOracle();
  e.db.password = '';
  const { secrets } = fmt.splitSecrets([e]);
  assert.equal(Object.keys(secrets).length, 1, 'solo el secreto de api');
  assert.ok(!('1786626429595:db.password' in secrets));
});

test('mergeSecrets es el inverso de splitSecrets', () => {
  const original = [entradaOracle()];
  const { entries, secrets } = fmt.splitSecrets(original);
  assert.deepEqual(fmt.mergeSecrets(entries, secrets), original);
});

test('el round-trip aguanta varias entradas y plataformas mezcladas', () => {
  const original = [
    entradaOracle(),
    { id: '2', platform: 'sqlserver', db: { server: 'h', port: '1433', database: 'd', user: 'u', password: 'pw-ss' }, api: {} },
    { id: '3', platform: 'oracle', db: { user: 'u', connectString: 'c' } },
  ];
  const { entries, secrets } = fmt.splitSecrets(original);
  assert.deepEqual(secrets, {
    '1786626429595:db.password': 'secreto-db',
    '1786626429595:api.publica.API_PASSWORD': 'secreto-api',
    '2:db.password': 'pw-ss',
  });
  assert.deepEqual(fmt.mergeSecrets(entries, secrets), original);
});

test('mergeSecrets deja la password en blanco si el secreto falta, no rompe', () => {
  const { entries } = fmt.splitSecrets([entradaOracle()]);
  const merged = fmt.mergeSecrets(entries, {});
  assert.equal(merged[0].db.password, '');
  assert.equal(merged[0].db.user, 'usuario_fict', 'el resto de la entrada sobrevive');
});

test('mergeSecrets tolera un vault nulo o basura', () => {
  const { entries } = fmt.splitSecrets([entradaOracle()]);
  assert.equal(fmt.mergeSecrets(entries, null)[0].db.password, '');
  assert.equal(fmt.mergeSecrets(entries, 'no soy objeto')[0].db.password, '');
});

test('las claves van por id: reordenar entries no cruza passwords', () => {
  const a = entradaOracle();
  const b = Object.assign(entradaOracle(), { id: '999', db: { user: 'otro', password: 'pw-b', connectString: 'c' }, api: {} });
  const { entries, secrets } = fmt.splitSecrets([a, b]);

  const alReves = [entries[1], entries[0]];
  const merged = fmt.mergeSecrets(alReves, secrets);

  assert.equal(merged[0].id, '999');
  assert.equal(merged[0].db.password, 'pw-b', 'cada password volvio a su entrada');
  assert.equal(merged[1].db.password, 'secreto-db');
});

test('una entrada sin id usa el indice como fallback y sigue funcionando', () => {
  const original = [{ db: { user: 'u', password: 'pw' } }];
  const { entries, secrets } = fmt.splitSecrets(original);
  assert.deepEqual(secrets, { 'idx0:db.password': 'pw' });
  assert.deepEqual(fmt.mergeSecrets(entries, secrets), original);
});

test('isLegacyShape reconoce el array pelado del formato viejo', () => {
  assert.equal(fmt.isLegacyShape([]), true);
  assert.equal(fmt.isLegacyShape([entradaOracle()]), true);
  assert.equal(fmt.isLegacyShape({ __format: fmt.FORMAT }), false);
  assert.equal(fmt.isLegacyShape(null), false);
});

test('isCurrentShape exige el __format exacto', () => {
  assert.equal(fmt.isCurrentShape({ __format: fmt.FORMAT }), true);
  assert.equal(fmt.isCurrentShape({ __format: 'btapi-db-history/99' }), false);
  assert.equal(fmt.isCurrentShape({}), false);
  assert.equal(fmt.isCurrentShape([]), false);
  assert.equal(fmt.isCurrentShape(null), false);
});

test('splitSecrets sobre lista vacia o no-array devuelve algo usable', () => {
  assert.deepEqual(fmt.splitSecrets([]), { entries: [], secrets: {} });
  assert.deepEqual(fmt.splitSecrets(null), { entries: [], secrets: {} });
});

test('setIn crea los niveles que falten sin pisar hermanos', () => {
  const o = { a: { b: 1 } };
  fmt.setIn(o, ['a', 'c', 'd'], 'x');
  assert.deepEqual(o, { a: { b: 1, c: { d: 'x' } } });
});

test('getIn devuelve undefined en vez de romper si el camino no existe', () => {
  assert.equal(fmt.getIn({}, ['a', 'b', 'c']), undefined);
  assert.equal(fmt.getIn(null, ['a']), undefined);
});
