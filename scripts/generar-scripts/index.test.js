const test = require('node:test');
const assert = require('node:assert/strict');

const { sg_generateScript, sg_generateSdtScript, sn_num } = require('./index.js');

const UUID_RE = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/;

function methodData(overrides) {
  return Object.assign({
    version: 'V4',
    apiMode: 'interna',
    header: { BTINom: 'BTSERVICES', BTISrvNom: 'PublicCustomers', BTISrvVer: '1', BTIMtdNom: 'get' },
    method: { dsc: 'Obtiene datos.', nsbt: 'S', pgmnom: 'CustomersWS', pgmmtd: 'execute', status: 'Validado', enbtra: 'N', espggx: 'S' },
    params: [
      { nom: 'id', nomjava: 'id', dir: 'I', tipo: 'Numeric', ittipo: '', cat: 'B', catit: 'B', sdtver: '', largo: '9', deci: '0' },
    ],
  }, overrides || {});
}

test('sn_num convierte S/N (o vacio) a 1/0', () => {
  assert.equal(sn_num('S'), 1);
  assert.equal(sn_num('s'), 1);
  assert.equal(sn_num('N'), 0);
  assert.equal(sn_num(''), 0);
  assert.equal(sn_num(null), 0);
});

test('sg_generateScript con apiMode=interna genera contra BTCBS014/BTCBS019, no BTI014/BTI019', () => {
  const script = sg_generateScript(methodData(), 'both');
  assert.match(script, /DELETE FROM BTCBS014 WHERE BSINTNAME='BTSERVICES' AND BSSRVNAME='PublicCustomers' AND BSMTDNAME='get';/);
  assert.match(script, /INSERT INTO BTCBS014 \(BSINTNAME, BSSRVNAME, BSSRVVER, BSMTDNAME, BSMTDDESC, BSMTDNSBT, BSMTDPRG, BSPRGENTPO, BSMTDSTAT, BSMTDPATH, BSMTDTRACE, BSMTDGXPRG, BSMTDUUID\)/);
  assert.match(script, /DELETE FROM BTCBS019 WHERE BSINTNAME='BTSERVICES' AND BSSRVNAME='PublicCustomers' AND BSMTDNAME='get';/);
  assert.match(script, /INSERT INTO BTCBS019 \(BSINTNAME, BSSRVNAME, BSSRVVER, BSMTDNAME, BSPARPOS, BSPARNAME/);
  assert.doesNotMatch(script, /BTI014/);
  assert.doesNotMatch(script, /BTI019/);
});

test('sg_generateScript interna convierte NSBT/ENBTRA/ESPGGX (S/N) a numero', () => {
  const script = sg_generateScript(methodData(), 'insert');
  // BSMTDNSBT=1 (nsbt:'S'), BSMTDTRACE=0 (enbtra:'N'), BSMTDGXPRG=1 (espggx:'S')
  const insertLine = script.split('\n').find(l => l.startsWith('INSERT INTO BTCBS014'));
  const vals = insertLine.slice(insertLine.indexOf('VALUES(') + 7, -2);
  const parts = vals.split(', ');
  assert.equal(parts[5], '1'); // BSMTDNSBT
  assert.equal(parts[10], '0'); // BSMTDTRACE
  assert.equal(parts[11], '1'); // BSMTDGXPRG
});

test('sg_generateScript interna genera un BSMTDUUID valido y distinto en cada llamada', () => {
  const s1 = sg_generateScript(methodData(), 'insert');
  const s2 = sg_generateScript(methodData(), 'insert');
  const uuid1 = s1.match(/'([0-9A-F-]{36})'\);/)[1];
  const uuid2 = s2.match(/'([0-9A-F-]{36})'\);/)[1];
  assert.match(uuid1, UUID_RE);
  assert.match(uuid2, UUID_RE);
  assert.notEqual(uuid1, uuid2);
});

test('sg_generateScript interna no incluye BSPARENUM/BSPARDFVAL (se descartan)', () => {
  const script = sg_generateScript(methodData(), 'insert');
  assert.doesNotMatch(script, /BSPARENUM/);
  assert.doesNotMatch(script, /BSPARDFVAL/);
});

test('sg_generateScript con apiMode=publica (o ausente) sigue generando BTI014/BTI019 igual que antes', () => {
  const script = sg_generateScript(methodData({ apiMode: 'publica' }), 'both');
  assert.match(script, /INSERT INTO BTI014/);
  assert.match(script, /INSERT INTO BTI019/);
  assert.doesNotMatch(script, /BTCBS/);
});

function sdtData(overrides) {
  return Object.assign({
    nom: 'SdtDatosCliente',
    bti025: { nom: 'SdtDatosCliente', version: '1', descrip: 'Datos del cliente.', nativo: 'S', fecha: new Date('2025-06-01T10:30:00'), nomint: 'SdtDatosClienteInt', estado: 'Validado', tipo: '0', namespace: 'uy.com.dlya' },
    bti026: [
      { elemnom: 'nombre', elemtipo: 'String', elemlargo: '100', elemcat: 'B', elemdsc: 'Nombre.', elemsdt: '', elemdeci: '0', nomit: '', posi: '1', obl: 'S' },
      { elemnom: 'edad', elemtipo: 'Numeric', elemlargo: '3', elemcat: 'B', elemdsc: 'Edad.', elemsdt: '', elemdeci: '0', nomit: '', posi: '2', obl: 'N' },
    ],
  }, overrides || {});
}

test('sg_generateSdtScript con apiMode=interna genera contra BTCBS025/BTCBS026', () => {
  const script = sg_generateSdtScript(sdtData(), 'both', 'V4', 'interna');
  assert.match(script, /DELETE FROM BTCBS025 WHERE BSSDTNAME='SdtDatosCliente';/);
  assert.match(script, /INSERT INTO BTCBS025 \(BSSDTNAME, BSSDTVER, BSSDTDESC, BSSDTNATIV, BSSDTDATE, BSSDTINTNM, BSSDTSTAT, BSSDTTYPE, BSSDTNMSP\)/);
  assert.match(script, /BSSDTNATIV.*|.*, 1, TO_DATE\('2025-06-01 10:30:00','YYYY-MM-DD HH24:MI:SS'\)/);
  assert.match(script, /DELETE FROM BTCBS026 WHERE BSSDTNAME='SdtDatosCliente';/);
  assert.match(script, /INSERT INTO BTCBS026 \(BSSDTNAME, BSSDTVER, BSELMNAME, BSELMPOS, BSELMDESC, BSELMINTNM, BSELMISREQ, BSELMCAT, BSEIMITCAT, BSELMITNAM, BSELMTYPE, BSELMSDTNM, BSELMSDTVE, BSELMFLAT, BSELMLEN, BSELMDECI, BSELMENUM, BSELMVALS\)/);
  assert.doesNotMatch(script, /BTI025/);
  assert.doesNotMatch(script, /BTI026/);
});

test('sg_generateSdtScript interna convierte BSSDTNATIV y BSELMISREQ de S/N a 1/0', () => {
  const script = sg_generateSdtScript(sdtData(), 'insert', 'V4', 'interna');
  const b25Line = script.split('\n').find(l => l.startsWith('INSERT INTO BTCBS025'));
  assert.match(b25Line, /'SdtDatosCliente', '1', 'Datos del cliente\.', 1, TO_DATE/);
  const b26Lines = script.split('\n').filter(l => l.startsWith('INSERT INTO BTCBS026'));
  assert.match(b26Lines[0], /'nombre', 1, 'Nombre\.', ' ', 1, 'B'/); // BSELMPOS=1, BSELMISREQ=1 (obl:'S')
  assert.match(b26Lines[1], /'edad', 2, 'Edad\.', ' ', 0, 'B'/); // BSELMPOS=2, BSELMISREQ=0 (obl:'N')
});

test('sg_generateSdtScript usa TO_DATE (no TIMESTAMP) para BSSDTDATE porque la columna es DATE', () => {
  const script = sg_generateSdtScript(sdtData(), 'insert', 'V4', 'interna');
  assert.match(script, /TO_DATE\(/);
  assert.doesNotMatch(script, /TIMESTAMP '/);
});

test('sg_generateSdtScript con apiMode publica/ausente sigue generando BTI025/BTI026 igual que antes', () => {
  const script = sg_generateSdtScript(sdtData(), 'both', 'V4');
  assert.match(script, /INSERT INTO BTI025/);
  assert.match(script, /INSERT INTO BTI026/);
  assert.doesNotMatch(script, /BTCBS/);
});
