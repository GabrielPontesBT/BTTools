const test = require('node:test');
const assert = require('node:assert/strict');

const { buildExecPayload, buildExampleQuery, buildExampleBody } = require('./exec-payload');

test('GET: solo manda los query params que el usuario completo, no los placeholder de ejemplo', () => {
  const filteredParams = { countryId: 484 };
  const requestPayload = { countryId: 0, firstLevel: 0, secondLevel: 0, ...filteredParams };
  assert.deepEqual(buildExecPayload('GET', filteredParams, requestPayload), { countryId: 484 });
});

test('GET sin ningun param completado: no manda query params (no countryId=0 etc)', () => {
  const filteredParams = {};
  const requestPayload = { offset: 0, limit: 10 };
  assert.deepEqual(buildExecPayload('GET', filteredParams, requestPayload), {});
});

test('DELETE se comporta igual que GET (query params, no body)', () => {
  const filteredParams = { id: 'ABC-123' };
  const requestPayload = { id: 'ABC-123', reason: '' };
  assert.deepEqual(buildExecPayload('DELETE', filteredParams, requestPayload), { id: 'ABC-123' });
});

test('POST/PUT mandan el body completo (con placeholders incluidos), no solo lo completado', () => {
  const filteredParams = { name: 'Juan' };
  const requestPayload = { name: 'Juan', age: 0, address: '' };
  assert.deepEqual(buildExecPayload('POST', filteredParams, requestPayload), requestPayload);
  assert.deepEqual(buildExecPayload('PUT', filteredParams, requestPayload), requestPayload);
});

function campo(nombre) {
  return { BTISRVPARNOM: nombre };
}

test('buildExampleQuery: sin nada completado, el ejemplo de curl no lleva query params', () => {
  const entradaQuery = [campo('offset'), campo('limit')];
  assert.deepEqual(buildExampleQuery({}, entradaQuery), {});
});

test('buildExampleQuery: muestra el valor real completado, no un placeholder', () => {
  const entradaQuery = [campo('countryId'), campo('firstLevel'), campo('secondLevel')];
  assert.deepEqual(buildExampleQuery({ countryId: 484 }, entradaQuery), { countryId: 484 });
});

test('buildExampleQuery ignora valores completados que no pertenecen a este grupo de campos (body vs query)', () => {
  const entradaQuery = [campo('countryId')];
  assert.deepEqual(buildExampleQuery({ countryId: 484, name: 'Juan' }, entradaQuery), { countryId: 484 });
});

test('buildExampleBody: sin nada completado, usa el placeholder completo', () => {
  const entradaBody = [campo('name'), campo('age')];
  const placeholder = { name: '', age: 0 };
  assert.deepEqual(buildExampleBody({}, entradaBody, placeholder), placeholder);
});

test('buildExampleBody: el campo completado muestra su valor real, el resto sigue en placeholder', () => {
  const entradaBody = [campo('name'), campo('age')];
  const placeholder = { name: '', age: 0 };
  assert.deepEqual(buildExampleBody({ name: 'Juan' }, entradaBody, placeholder), { name: 'Juan', age: 0 });
});
