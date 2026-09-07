const test = require('node:test');
const assert = require('node:assert/strict');

const { wrapColeccion, mapBti026Row, buildSdtObj } = require('./input-params-example');

test('mapBti026Row: mapea BTISDTELEMNOMIT a itemName', () => {
  const row = { BTISDTELEMNOM: 'occupations', BTISDTELEMTIPO: 'SdtBTPEOccupation', BTISDTELEMCAT: 'C', BTISDTELEMSDT: 'SdtBTPEOccupation', BTISDTELEMNOMIT: 'occupation' };
  const f = mapBti026Row(row);
  assert.equal(f.name, 'occupations');
  assert.equal(f.itemName, 'occupation');
  assert.equal(f.sdt, 'SdtBTPEOccupation');
});

test('wrapColeccion: con nombre de item envuelve, sin nombre cae a array suelto', () => {
  assert.deepEqual(wrapColeccion({ a: 1 }, 'item'), { item: [{ a: 1 }] });
  assert.deepEqual(wrapColeccion({ a: 1 }, ''), [{ a: 1 }]);
});

test('buildSdtObj: caso reportado - PublicPersons/updateOccupations, param top-level "occupations" no debe quedar como array suelto', () => {
  // Reproduce el bug de la captura: el textarea de "occupations" en el
  // wizard mostraba un array de objetos sin la clave "occupation".
  const sdtCache = new Map();
  const queryFn = async (sdtType) => {
    if (sdtType === 'SdtBTPEOccupation') {
      return [mapBti026Row({ BTISDTELEMNOM: 'occupationId', BTISDTELEMTIPO: 'N', BTISDTELEMCAT: 'B' })];
    }
    return [];
  };
  const itemType = 'SdtBTPEOccupation';
  const itemName = 'occupation';

  return buildSdtObj(queryFn, itemType, sdtCache, new Set()).then(built => {
    const example = wrapColeccion(built, itemName);
    // INCORRECTO seria: example = [ { occupationId: 0 } ]  (sin la clave "occupation")
    assert.ok(!Array.isArray(example), 'el ejemplo no debe ser un array suelto');
    assert.deepEqual(example, { occupation: [{ occupationId: 0 }] });
  });
});

test('buildSdtObj: coleccion anidada dentro del SDT tambien se envuelve con su item', () => {
  const sdtCache = new Map();
  sdtCache.set('SdtRaiz', [
    mapBti026Row({ BTISDTELEMNOM: 'addresses', BTISDTELEMTIPO: 'SdtAddress', BTISDTELEMCAT: 'C', BTISDTELEMSDT: 'SdtAddress', BTISDTELEMNOMIT: 'address' }),
  ]);
  sdtCache.set('SdtAddress', [
    mapBti026Row({ BTISDTELEMNOM: 'street', BTISDTELEMTIPO: 'C', BTISDTELEMCAT: 'B' }),
  ]);
  const queryFn = async (sdtType) => sdtCache.get(sdtType) || [];

  return buildSdtObj(queryFn, 'SdtRaiz', sdtCache, new Set()).then(obj => {
    assert.deepEqual(obj, { addresses: { address: [{ street: '' }] } });
  });
});

test('buildSdtObj: coleccion sin item nombrado cae a array suelto', () => {
  const sdtCache = new Map();
  const queryFn = async () => [mapBti026Row({ BTISDTELEMNOM: 'id', BTISDTELEMTIPO: 'N', BTISDTELEMCAT: 'B' })];
  const itemType = 'SdtSinItem';
  return buildSdtObj(queryFn, itemType, sdtCache, new Set()).then(built => {
    assert.deepEqual(wrapColeccion(built, ''), [{ id: 0 }]);
  });
});

test('buildSdtObj: SDT no coleccion no se envuelve', () => {
  const sdtCache = new Map();
  const queryFn = async () => [mapBti026Row({ BTISDTELEMNOM: 'id', BTISDTELEMTIPO: 'N', BTISDTELEMCAT: 'B' })];
  return buildSdtObj(queryFn, 'SdtProduct', sdtCache, new Set()).then(built => {
    assert.deepEqual(built, { id: 0 });
  });
});
