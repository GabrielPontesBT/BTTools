const test = require('node:test');
const assert = require('node:assert/strict');

const { nombreVisibleParam, nombreVisibleCampo } = require('./sdt-display-name');

test('nombreVisibleParam: coleccion de SDT usa el nombre del item, no el del SDT', () => {
  const row = { BTISRVPARNOM: 'administrativeLevels', BTISRVPARITTIPO: 'SdtsBTCNPAAdministrativeLevel', BTISRVPARITNOM: 'administrativeLevel', BTISRVVARTIPO: 'SdtsBTCNPAAdministrativeLevel' };
  const r = nombreVisibleParam(row);
  assert.equal(r.esSdt, true);
  assert.equal(r.esColeccion, true);
  assert.equal(r.nombre, 'administrativeLevel');
  assert.equal(r.sdtNomDB, 'SdtsBTCNPAAdministrativeLevel');
});

test('nombreVisibleParam: coleccion sin item nombrado cae al nombre del parametro', () => {
  const row = { BTISRVPARNOM: 'items', BTISRVPARITTIPO: 'SdtAlgo', BTISRVPARITNOM: '', BTISRVVARTIPO: 'SdtAlgo' };
  const r = nombreVisibleParam(row);
  assert.equal(r.esColeccion, true);
  assert.equal(r.nombre, 'items');
});

test('nombreVisibleParam: SDT simple (sin item) usa el nombre del parametro', () => {
  const row = { BTISRVPARNOM: 'product', BTISRVPARITTIPO: null, BTISRVVARTIPO: 'SdtBTLOPAProduct' };
  const r = nombreVisibleParam(row);
  assert.equal(r.esSdt, true);
  assert.equal(r.esColeccion, false);
  assert.equal(r.nombre, 'product');
  assert.equal(r.sdtNomDB, 'SdtBTLOPAProduct');
});

test('nombreVisibleParam: campo primitivo no es SDT', () => {
  const row = { BTISRVPARNOM: 'countryId', BTISRVPARITTIPO: null, BTISRVVARTIPO: 'Short' };
  assert.deepEqual(nombreVisibleParam(row), { esSdt: false });
});

test('nombreVisibleParam: BTISRVPARITTIPO primitivo (no Sdt) no cuenta como coleccion de SDT', () => {
  const row = { BTISRVPARNOM: 'codes', BTISRVPARITTIPO: 'String', BTISRVVARTIPO: 'String' };
  assert.deepEqual(nombreVisibleParam(row), { esSdt: false });
});

test('nombreVisibleCampo: campo anidado con BTISDTELEMSDT usa el nombre del campo', () => {
  const row = { BTISDTELEMNOM: 'address', BTISDTELEMSDT: 'SdtBTGENAddress', BTISDTELEMTIPO: 'SdtBTGENAddress' };
  const r = nombreVisibleCampo(row);
  assert.equal(r.esSdt, true);
  assert.equal(r.nombre, 'address');
  assert.equal(r.sdtNomDB, 'SdtBTGENAddress');
});

test('nombreVisibleCampo: campo anidado sin BTISDTELEMSDT pero con tipo Sdt* usa el nombre del campo', () => {
  const row = { BTISDTELEMNOM: 'contact', BTISDTELEMSDT: null, BTISDTELEMTIPO: 'SdtBTGENContact' };
  const r = nombreVisibleCampo(row);
  assert.equal(r.esSdt, true);
  assert.equal(r.nombre, 'contact');
  assert.equal(r.sdtNomDB, 'SdtBTGENContact');
});

test('nombreVisibleCampo: campo primitivo no es SDT', () => {
  const row = { BTISDTELEMNOM: 'id', BTISDTELEMSDT: null, BTISDTELEMTIPO: 'Int' };
  assert.deepEqual(nombreVisibleCampo(row), { esSdt: false });
});
