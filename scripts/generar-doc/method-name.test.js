const test = require('node:test');
const assert = require('node:assert/strict');

const { stripMethodPrefix, tituloDesdeMetodo, nombreCortoMetodo } = require('./method-name');

test('stripMethodPrefix recorta el verbo cuando hay limite real de camelCase', () => {
  assert.equal(stripMethodPrefix('getAddress'), 'Address');
  assert.equal(stripMethodPrefix('getGUID'), 'GUID');
  assert.equal(stripMethodPrefix('getBranches'), 'Branches');
  assert.equal(stripMethodPrefix('updateClientData'), 'ClientData');
  assert.equal(stripMethodPrefix('modifyStatus'), 'Status');
  assert.equal(stripMethodPrefix('deleteAccount'), 'Account');
  assert.equal(stripMethodPrefix('fetchBalance'), 'Balance');
});

test('stripMethodPrefix no toca metodos sin ese prefijo o sin limite de palabra', () => {
  assert.equal(stripMethodPrefix('calculateInterest'), 'calculateInterest');
  assert.equal(stripMethodPrefix('getter'), 'getter'); // "t" en minuscula tras "get": no es limite real
  assert.equal(stripMethodPrefix('get'), 'get'); // nada queda despues del prefijo
  assert.equal(stripMethodPrefix('Get'), 'Get'); // primera letra mayuscula: no matchea "get" en minuscula...
});

test('tituloDesdeMetodo arma el titulo del front-matter sin el verbo, respetando siglas', () => {
  assert.equal(tituloDesdeMetodo('getBranches'), 'Branches');
  assert.equal(tituloDesdeMetodo('getAddress'), 'Address');
  assert.equal(tituloDesdeMetodo('getGUID'), 'GUID');
  assert.equal(tituloDesdeMetodo('updateClientData'), 'Client Data');
  assert.equal(tituloDesdeMetodo('calculateInterest'), 'Calculate Interest');
});

test('nombreCortoMetodo devuelve el nombre recortado con primera letra en minuscula', () => {
  assert.equal(nombreCortoMetodo('getBranches'), 'branches');
  assert.equal(nombreCortoMetodo('getAddress'), 'address');
  assert.equal(nombreCortoMetodo('updateClientData'), 'clientData');
  assert.equal(nombreCortoMetodo('deleteAccount'), 'account');
  assert.equal(nombreCortoMetodo('fetchBalance'), 'balance');
  assert.equal(nombreCortoMetodo('modifyStatus'), 'status');
});

test('nombreCortoMetodo baja completo el resto cuando queda todo en mayusculas (sigla)', () => {
  assert.equal(nombreCortoMetodo('getGUID'), 'guid');
});

test('nombreCortoMetodo no modifica metodos sin prefijo reconocido', () => {
  assert.equal(nombreCortoMetodo('calculateInterest'), 'calculateInterest');
  assert.equal(nombreCortoMetodo('getter'), 'getter');
});
