const test = require('node:test');
const assert = require('node:assert/strict');

const { adaptarValoresTopLevel, adaptarValorSdt, buscarValorCI, extraerArrayColeccion } = require('./migrate-legacy-value');

function paramBti019(nom, overrides) {
  return Object.assign({ BTISRVPARNOM: nom, BTISRVVARTIPO: 'String' }, overrides);
}

function campoBti026(nom, overrides) {
  return Object.assign({ BTISDTELEMNOM: nom, BTISDTELEMTIPO: 'String' }, overrides);
}

test('buscarValorCI: encuentra el valor sin importar mayusculas/minusculas', () => {
  assert.equal(buscarValorCI({ Counterparty: 1 }, 'counterparty'), 1);
  assert.equal(buscarValorCI({ counterparty: 1 }, 'Counterparty'), 1);
  assert.equal(buscarValorCI({ a: 1 }, 'b'), undefined);
  assert.equal(buscarValorCI(null, 'a'), undefined);
});

test('extraerArrayColeccion: array suelto, wrapper con nombre viejo, o ninguno', () => {
  assert.deepEqual(extraerArrayColeccion([1, 2]), [1, 2]);
  assert.deepEqual(extraerArrayColeccion({ SdtsBTCPWCounterpartyIntegration: [1, 2] }), [1, 2]);
  assert.equal(extraerArrayColeccion({ a: 1 }), null);
  assert.equal(extraerArrayColeccion(null), null);
});

test('adaptarValoresTopLevel: caso reportado - PublicCustomers.get, campo de salida en PascalCase (Counterparty) migra a camelCase (counterparty)', () => {
  const salida = [paramBti019('counterparty', { BTISRVVARTIPO: 'SdtCounterpartyQuery', BTISRVCATIT: 'B' })];
  const sdtCache = new Map();
  sdtCache.set('SdtCounterpartyQuery', [campoBti026('branchId', { BTISDTELEMTIPO: 'N' })]);

  // El .md viejo tenia la clave de salida en PascalCase y el campo interno tambien.
  const valoresViejo = { Counterparty: { BranchId: 7 } };
  const resultado = adaptarValoresTopLevel(valoresViejo, salida, sdtCache);
  assert.deepEqual(resultado, { counterparty: { branchId: 7 } });
});

test('adaptarValoresTopLevel: coleccion anidada envuelta con el nombre interno de la SDT (formato viejo) se re-envuelve con el item actual', () => {
  // Reproduce el caso real: Integration -> {"SdtsBTCPWCounterpartyIntegration": [...]}
  // debe quedar como integration -> {"integration": [...adaptado...]}.
  const salida = [paramBti019('counterparty', { BTISRVVARTIPO: 'SdtCounterpartyQuery', BTISRVCATIT: 'B' })];
  const sdtCache = new Map();
  sdtCache.set('SdtCounterpartyQuery', [
    campoBti026('integration', { BTISDTELEMCAT: 'C', BTISDTELEMSDT: 'SdtIntegration', BTISDTELEMNOMIT: 'integration' }),
  ]);
  sdtCache.set('SdtIntegration', [campoBti026('personGUID', { BTISDTELEMTIPO: 'C' })]);

  const valoresViejo = {
    Counterparty: {
      Integration: { SdtsBTCPWCounterpartyIntegration: [{ PersonGUID: 'f43a3946-4ae1-4a27-861d-c1c2d9cee87d' }] },
    },
  };
  const resultado = adaptarValoresTopLevel(valoresViejo, salida, sdtCache);
  assert.deepEqual(resultado, {
    counterparty: { integration: { integration: [{ personGUID: 'f43a3946-4ae1-4a27-861d-c1c2d9cee87d' }] } },
  });
});

test('adaptarValoresTopLevel: campo de entrada simple (no SDT) se preserva tal cual', () => {
  const entrada = [paramBti019('counterpartyGUID')];
  const resultado = adaptarValoresTopLevel({ counterpartyGUID: '45399742-1326-4d8d-b7c8-10eb4cf976b0' }, entrada, new Map());
  assert.deepEqual(resultado, { counterpartyGUID: '45399742-1326-4d8d-b7c8-10eb4cf976b0' });
});

test('adaptarValoresTopLevel: campo ausente en el valor viejo no aparece en el resultado (no inventa datos)', () => {
  const entrada = [paramBti019('a'), paramBti019('b')];
  const resultado = adaptarValoresTopLevel({ a: 1 }, entrada, new Map());
  assert.deepEqual(resultado, { a: 1 });
});

test('adaptarValorSdt: sin metadata para el SDT (no resuelto), devuelve el valor tal cual en vez de perderlo', () => {
  const valor = { Cualquiera: 1 };
  assert.deepEqual(adaptarValorSdt(valor, 'SdtNoResuelto', new Map()), valor);
});

test('adaptarValoresTopLevel: coleccion sin item nombrado (formato nuevo, sin migracion) queda como array suelto', () => {
  const salida = [paramBti019('items', { BTISRVVARTIPO: 'SdtItem', BTISRVCATIT: 'B', BTISRVPARITTIPO: 'SdtItem', BTISRVCAT: 'S' })];
  Object.assign(salida[0], { BTISRVCATIT: 'S', BTISRVPARITTIPO: 'SdtItem' });
  const sdtCache = new Map();
  sdtCache.set('SdtItem', [campoBti026('id', { BTISDTELEMTIPO: 'N' })]);
  const resultado = adaptarValoresTopLevel({ items: [{ Id: 5 }] }, salida, sdtCache);
  assert.deepEqual(resultado, { items: [{ id: 5 }] });
});
