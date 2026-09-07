const test = require('node:test');
const assert = require('node:assert/strict');

const { valorEjemplo, construirObjeto } = require('./sdt-example');

test('valorEjemplo: boolean, fecha, decimal y numerico tienen placeholder tipado', () => {
  assert.equal(valorEjemplo('B'), false);
  assert.equal(valorEjemplo('D'), '2026-01-01');
  assert.equal(valorEjemplo('F'), 0.0);
  assert.equal(valorEjemplo('N'), 0);
  assert.equal(valorEjemplo('C'), '');
});

test('construirObjeto: campo coleccion se envuelve con el nombre del item, no queda como array suelto', () => {
  // Caso reportado: naturalPerson.contacts es una coleccion de "contact".
  const sdtCache = new Map();
  sdtCache.set('SdtBTPEContacts', [
    { BTISDTELEMNOM: 'contacts', BTISDTELEMCAT: 'C', BTISDTELEMNOMIT: 'contact', BTISDTELEMSDT: 'SdtBTPEContact', BTISDTELEMTIPO: 'SdtBTPEContact' },
  ]);
  sdtCache.set('SdtBTPEContact', [
    { BTISDTELEMNOM: 'text', BTISDTELEMCAT: 'B', BTISDTELEMTIPO: 'C' },
    { BTISDTELEMNOM: 'enabled', BTISDTELEMCAT: 'B', BTISDTELEMTIPO: 'B' },
  ]);

  const obj = construirObjeto('SdtBTPEContacts', sdtCache);

  // INCORRECTO seria: obj.contacts = [ {...} ]  (array suelto, sin la clave "contact")
  assert.ok(!Array.isArray(obj.contacts), 'contacts no debe ser un array suelto');
  assert.deepEqual(obj, { contacts: { contact: [{ text: '', enabled: false }] } });
});

test('construirObjeto: coleccion sin item nombrado cae a array suelto (no rompe)', () => {
  const sdtCache = new Map();
  sdtCache.set('SdtRaiz', [
    { BTISDTELEMNOM: 'items', BTISDTELEMCAT: 'C', BTISDTELEMNOMIT: '', BTISDTELEMSDT: 'SdtItem', BTISDTELEMTIPO: 'SdtItem' },
  ]);
  sdtCache.set('SdtItem', [
    { BTISDTELEMNOM: 'id', BTISDTELEMCAT: 'B', BTISDTELEMTIPO: 'N' },
  ]);

  const obj = construirObjeto('SdtRaiz', sdtCache);
  assert.deepEqual(obj, { items: [{ id: 0 }] });
});

test('construirObjeto: coleccion sin datos en cache (tipo no resuelto) igual respeta el nombre del item', () => {
  const sdtCache = new Map();
  sdtCache.set('SdtRaiz', [
    { BTISDTELEMNOM: 'references', BTISDTELEMCAT: 'C', BTISDTELEMNOMIT: 'reference', BTISDTELEMSDT: 'SdtNoResuelto', BTISDTELEMTIPO: 'SdtNoResuelto' },
  ]);

  const obj = construirObjeto('SdtRaiz', sdtCache);
  assert.deepEqual(obj, { references: { reference: [] } });
});

test('construirObjeto: campo SDT simple (no coleccion) no se envuelve', () => {
  const sdtCache = new Map();
  sdtCache.set('SdtRaiz', [
    { BTISDTELEMNOM: 'product', BTISDTELEMCAT: 'S', BTISDTELEMSDT: 'SdtProduct', BTISDTELEMTIPO: 'SdtProduct' },
  ]);
  sdtCache.set('SdtProduct', [
    { BTISDTELEMNOM: 'id', BTISDTELEMCAT: 'B', BTISDTELEMTIPO: 'N' },
  ]);

  const obj = construirObjeto('SdtRaiz', sdtCache);
  assert.deepEqual(obj, { product: { id: 0 } });
});

test('construirObjeto: campo primitivo usa el placeholder de valorEjemplo', () => {
  const sdtCache = new Map();
  sdtCache.set('SdtRaiz', [
    { BTISDTELEMNOM: 'name', BTISDTELEMCAT: 'B', BTISDTELEMTIPO: 'C' },
  ]);
  const obj = construirObjeto('SdtRaiz', sdtCache);
  assert.deepEqual(obj, { name: '' });
});

test('construirObjeto: SDT no presente en cache devuelve objeto vacio', () => {
  assert.deepEqual(construirObjeto('SdtInexistente', new Map()), {});
});
