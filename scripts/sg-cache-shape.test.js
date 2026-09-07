const test = require('node:test');
const assert = require('node:assert/strict');

const { sgToOracleBti019, sgToOracleBti026 } = require('./sg-cache-shape');

test('sgToOracleBti019: preserva BTISRVPARITNOM (nombre de item de un parametro top-level)', () => {
  const params = [{ nom: 'occupations', tipo: 'SdtBTPEOccupation', dir: 'I', catit: 'S', ittipo: 'SdtBTPEOccupation', itnom: 'occupation' }];
  const rows = sgToOracleBti019(params);
  assert.equal(rows[0].BTISRVPARITNOM, 'occupation');
});

test('sgToOracleBti026: preserva BTISDTELEMNOMIT (nombre de item de un campo anidado que es coleccion)', () => {
  // Caso reportado: al pasar por /sg/api/validate (flujo normal del
  // wizard), este dato se perdia y createReduced.md volvia a generar
  // "addresses"/"contacts" en vez de "address"/"contact", pese a que
  // construirObjeto y nombreVisibleCampo ya sabian usarlo.
  const sdts = [{
    nom: 'SdtBTPENaturalPerson',
    bti026: [
      { elemnom: 'addresses', elemtipo: 'SdtBTPEAddress', elemcat: 'C', elemsdt: 'SdtBTPEAddress', nomit: 'address' },
      { elemnom: 'contacts', elemtipo: 'SdtBTPEContact', elemcat: 'C', elemsdt: 'SdtBTPEContact', nomit: 'contact' },
    ],
  }];
  const result = sgToOracleBti026(sdts);
  const fields = result.SdtBTPENaturalPerson;
  assert.equal(fields[0].BTISDTELEMNOMIT, 'address');
  assert.equal(fields[1].BTISDTELEMNOMIT, 'contact');
});

test('sgToOracleBti026: sin nomit (ej. V3, que no tiene esta columna) cae a string vacio, no undefined', () => {
  const sdts = [{ nom: 'Sdt1', bti026: [{ elemnom: 'items', elemtipo: 'SdtItem', elemcat: 'C', elemsdt: 'SdtItem' }] }];
  const fields = sgToOracleBti026(sdts).Sdt1;
  assert.equal(fields[0].BTISDTELEMNOMIT, '');
});
