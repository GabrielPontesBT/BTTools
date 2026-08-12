const test = require('node:test');
const assert = require('node:assert/strict');

const { sg_generateScript, sg_generateSdtScript, sn_num, sg_serviceNamePrefix, sg_serviceListQuery, sg_cellText, sg_sq, btcbs_sq, sg_extractSdtNames, sg_isSdtType } = require('./index.js');

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

// Regresion: en API interna los tipos SDT reales no llevan el prefijo 'Sdt'
// (eso es exclusivo de las BTI/API publica), van directo como 'sBT<Nombre>'
// (ej. sBTProductosDepositoAPlazo, confirmado en scripts/validar-doc). Antes
// de este fix, sg_extractSdtNames los descartaba y nunca se generaba su
// bloque BTCBS025/026.
test('sg_isSdtType reconoce prefijo Sdt en cualquier apiMode', () => {
  assert.equal(sg_isSdtType('SdtDatosCliente'), true);
  assert.equal(sg_isSdtType('SdtDatosCliente', 'publica'), true);
  assert.equal(sg_isSdtType('SdtDatosCliente', 'interna'), true);
});

test('sg_isSdtType reconoce prefijo sBT solo en apiMode interna', () => {
  assert.equal(sg_isSdtType('sBTProductosDepositoAPlazo', 'interna'), true);
  assert.equal(sg_isSdtType('sBTProductosDepositoAPlazo', 'publica'), false);
  assert.equal(sg_isSdtType('sBTProductosDepositoAPlazo'), false);
});

test('sg_isSdtType rechaza tipos primitivos y valores vacios', () => {
  assert.equal(sg_isSdtType('String', 'interna'), false);
  assert.equal(sg_isSdtType('Numeric', 'interna'), false);
  assert.equal(sg_isSdtType('', 'interna'), false);
  assert.equal(sg_isSdtType(null, 'interna'), false);
});

test('sg_extractSdtNames detecta tipos sBT en apiMode interna (tipo e ittipo)', () => {
  const params = [
    { nom: 'producto', tipo: 'sBTProductosDepositoAPlazo', ittipo: '' },
    { nom: 'items', tipo: 'Collection', ittipo: 'sBTDatoExtendido' },
    { nom: 'id', tipo: 'Numeric', ittipo: '' },
  ];
  assert.deepEqual(sg_extractSdtNames(params, 'interna'), ['sBTProductosDepositoAPlazo', 'sBTDatoExtendido']);
});

test('sg_extractSdtNames detecta Sdt y sBT mezclados en la misma llamada interna', () => {
  const params = [
    { nom: 'legacy', tipo: 'SdtDatosCliente', ittipo: '' },
    { nom: 'nuevo', tipo: 'sBTProductosDepositoAPlazo', ittipo: '' },
  ];
  assert.deepEqual(sg_extractSdtNames(params, 'interna'), ['SdtDatosCliente', 'sBTProductosDepositoAPlazo']);
});

test('sg_extractSdtNames NO trata prefijo sBT como SDT fuera de apiMode interna', () => {
  const params = [{ nom: 'producto', tipo: 'sBTProductosDepositoAPlazo', ittipo: '' }];
  assert.deepEqual(sg_extractSdtNames(params, 'publica'), []);
  assert.deepEqual(sg_extractSdtNames(params), []);
});

test('sg_extractSdtNames sigue detectando el prefijo Sdt en apiMode interna', () => {
  const params = [{ nom: 'x', tipo: 'SdtDatosCliente', ittipo: '' }];
  assert.deepEqual(sg_extractSdtNames(params, 'interna'), ['SdtDatosCliente']);
});

test('sg_extractSdtNames respeta SG_SDT_EXCLUDE tambien para tipos sBT', () => {
  const params = [{ nom: 'errores', tipo: 'sBTBusinessErrors', ittipo: '' }];
  // No esta en SG_SDT_EXCLUDE (solo 'SdtsBTBusinessError' lo esta), asi que
  // hoy SI se detecta como SDT: este test documenta el comportamiento actual,
  // no una exclusion nueva.
  assert.deepEqual(sg_extractSdtNames(params, 'interna'), ['sBTBusinessErrors']);
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

// Regresion: el listado de servicios con API Interna volvia vacio porque se
// le aplicaba el prefijo 'Public%' de las BTI a la tabla BTCBS014.
test('sg_serviceNamePrefix no filtra por prefijo cuando el apiMode es interna', () => {
  assert.equal(sg_serviceNamePrefix('V4', 'interna'), null);
  assert.equal(sg_serviceNamePrefix('V3', 'interna'), null);
});

test('sg_serviceNamePrefix mantiene BT para V3 y Public para V4 en API publica', () => {
  assert.equal(sg_serviceNamePrefix('V3', 'publica'), 'BT');
  assert.equal(sg_serviceNamePrefix('V4', 'publica'), 'Public');
  assert.equal(sg_serviceNamePrefix('V4', undefined), 'Public');
});

test('sg_serviceListQuery interna consulta BTCBS014 sin WHERE ni binds', () => {
  const q = sg_serviceListQuery('V4', 'interna');
  assert.equal(q.col, 'BSSRVNAME');
  assert.equal(q.sql, 'SELECT DISTINCT BSSRVNAME FROM BTCBS014 ORDER BY BSSRVNAME');
  assert.deepEqual(q.binds, []);
  assert.doesNotMatch(q.sql, /WHERE/);
  assert.doesNotMatch(q.sql, /Public/);
});

test('sg_serviceListQuery publica sigue filtrando BTI014 por Public%', () => {
  const q = sg_serviceListQuery('V4', 'publica');
  assert.equal(q.col, 'BTISRVNOM');
  assert.equal(q.sql, 'SELECT DISTINCT BTISRVNOM FROM BTI014 WHERE BTISRVNOM LIKE :1 ORDER BY BTISRVNOM');
  assert.deepEqual(q.binds, ['Public%']);
});

// Regresion: un CLOB llega como objeto Lob y String(lob) daba
// '[object Object]' escrito dentro del INSERT.
function lobLike() { return { _isLob: true, type: 2017, getData: function() {} }; }

test('sg_cellText trata como vacio todo lo que no sea primitivo', () => {
  assert.equal(sg_cellText(lobLike()), '');
  assert.equal(sg_cellText(Buffer.from('abc')), '');
  assert.equal(sg_cellText(new Date()), '');
  assert.equal(sg_cellText(null), '');
  assert.equal(sg_cellText(undefined), '');
});

test('sg_cellText deja pasar strings y numeros tal cual', () => {
  assert.equal(sg_cellText('  hola  '), '  hola  ');
  assert.equal(sg_cellText(0), '0');
  assert.equal(sg_cellText(12), '12');
  assert.equal(sg_cellText(false), 'false');
});

test('sg_cellText respeta el valor vacio pedido (null para las columnas nullables)', () => {
  assert.equal(sg_cellText(null, null), null);
  assert.equal(sg_cellText(lobLike(), null), null);
  assert.equal(sg_cellText('x', null), 'x');
});

test('ningun script generado puede contener [object Object]', () => {
  const withLobs = methodData({
    method: { dsc: lobLike(), nsbt: 'S', pgmnom: 'CustomersWS', pgmmtd: 'execute', status: 'Validado', enbtra: 'N', espggx: 'S' },
    params: [{ nom: 'id', nomjava: 'id', dir: 'I', tipo: 'Numeric', ittipo: '', cat: 'B', catit: 'B', sdtver: '', largo: '9', deci: '0', dsc: lobLike() }],
  });
  ['interna', 'publica'].forEach(function(mode) {
    ['delete', 'insert', 'both'].forEach(function(m) {
      const script = sg_generateScript(Object.assign({}, withLobs, { apiMode: mode }), m);
      assert.doesNotMatch(script, /\[object Object\]/, mode + '/' + m);
    });
  });
});

test('ningun script de SDT generado puede contener [object Object]', () => {
  const src = sdtData();
  const withLobs = {
    nom: src.nom,
    bti025: Object.assign({}, src.bti025, { descrip: lobLike(), namespace: lobLike(), tipo: lobLike() }),
    bti026: (src.bti026 || []).map(function(e) { return Object.assign({}, e, { elemdsc: lobLike(), val: lobLike() }); }),
  };
  [['V4','interna'],['V4','publica'],['V3','publica']].forEach(function(pair) {
    ['delete','insert','both'].forEach(function(m) {
      const script = sg_generateSdtScript(withLobs, m, pair[0], pair[1]);
      assert.doesNotMatch(script, /\[object Object\]/, pair.join('/') + '/' + m);
    });
  });
});

test('sg_sq escapa comillas simples duplicandolas', () => {
  assert.equal(sg_sq("O'Connor", 'V4'), "'O''Connor'");
  assert.equal(sg_sq("Debe indicarse 'S' o 'N'.", 'V3'), "N'Debe indicarse ''S'' o ''N''.'");
});

test('btcbs_sq escapa comillas simples duplicandolas', () => {
  assert.equal(btcbs_sq("Debe indicarse 'S'.", false), "'Debe indicarse ''S''.'");
});

function methodDataWithQuotes(version, apiMode) {
  return methodData({
    version: version,
    apiMode: apiMode,
    header: { BTINom: 'BTSERVICES', BTISrvNom: 'PublicCustomers', BTISrvVer: '1', BTIMtdNom: 'get', BTISrvDsc: "Servicio de 'clientes'.", BTISrvPgmName: "Customers'WS" },
    method: { dsc: "Debe indicarse 'S' o 'N'.", nsbt: 'S', pgmnom: "Pgm'X", pgmmtd: 'execute', status: 'Validado', fpath: "C:\\ruta'con'comilla", enbtra: 'N', espggx: 'S' },
  });
}

test('sg_generateScript V3 escapa comillas en BTISrvDsc (BTI004) y en dsc/pgmnom/fpath (BTI014)', () => {
  const script = sg_generateScript(methodDataWithQuotes('V3', 'publica'), 'insert');
  assert.match(script, /INSERT INTO BTI004[^\n]*N'Servicio de ''clientes''\.'/);
  assert.match(script, /INSERT INTO BTI004[^\n]*N'Customers''WS'/);
  assert.match(script, /INSERT INTO BTI014[^\n]*N'Debe indicarse ''S'' o ''N''\.'/);
  assert.match(script, /N'Pgm''X'/);
  assert.match(script, /N'C:\\ruta''con''comilla'/);
});

test('sg_generateScript V4 publica escapa comillas en dsc (BTI014)', () => {
  const script = sg_generateScript(methodDataWithQuotes('V4', 'publica'), 'insert');
  assert.match(script, /'Debe indicarse ''S'' o ''N''\.'/);
});

test('sg_generateScript V4 interna (BTCBS) escapa comillas en dsc', () => {
  const script = sg_generateScript(methodDataWithQuotes('V4', 'interna'), 'insert');
  assert.match(script, /'Debe indicarse ''S'' o ''N''\.'/);
});

test('sg_generateScript V3 delete escapa comillas en identificadores (BTI004/BTI014/BTI019)', () => {
  const script = sg_generateScript(methodDataWithQuotes('V3', 'publica'), 'delete');
  assert.match(script, /DELETE FROM BTI004 WHERE BTINom=N'BTSERVICES' AND BTISrvNom=N'PublicCustomers';/);
  assert.match(script, /DELETE FROM BTI014 WHERE BTINom=N'BTSERVICES' AND BTISrvNom=N'PublicCustomers' AND BTIMtdNom=N'get';/);
  assert.match(script, /DELETE FROM BTI019 WHERE BTINom=N'BTSERVICES' AND BTISrvNom=N'PublicCustomers' AND BTIMtdNom=N'get';/);
});

test('sg_generateScript V4 interna (BTCBS) delete escapa comillas via q() en delBtcbs014/delBtcbs019', () => {
  const data = methodData({
    version: 'V4',
    apiMode: 'interna',
    header: { BTINom: 'BTSERVICES', BTISrvNom: "Public'Customers", BTISrvVer: '1', BTIMtdNom: 'get', BTISrvDsc: 'Servicio.', BTISrvPgmName: 'CustomersWS' },
    method: { dsc: 'Metodo.', nsbt: 'S', pgmnom: 'PgmX', pgmmtd: 'execute', status: 'Validado', fpath: 'C:\\ruta', enbtra: 'N', espggx: 'S' },
  });
  const script = sg_generateScript(data, 'delete');
  assert.match(script, /DELETE FROM BTCBS014 WHERE BSINTNAME='BTSERVICES' AND BSSRVNAME='Public''Customers' AND BSMTDNAME='get';/);
  assert.match(script, /DELETE FROM BTCBS019 WHERE BSINTNAME='BTSERVICES' AND BSSRVNAME='Public''Customers' AND BSMTDNAME='get';/);
});
