const test = require('node:test');
const assert = require('node:assert/strict');

const { sg_generateScript, sg_generateParamsUpdateScript, sg_generateSdtScript, sg_generateFieldsUpdateScript, sn_num, sg_serviceNamePrefix, sg_serviceListQuery, sg_cellText, sg_sq, btcbs_sq, sg_extractSdtNames, sg_isSdtType } = require('./index.js');

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

test('sg_generateScript interna genera DELETE+INSERT de BTCBS012 por cada canal', () => {
  const data = methodData({ channels: [
    { chnname: 'REST', srvenab: 'S' },
    { chnname: 'SOAP', srvenab: 'N' },
  ] });
  const script = sg_generateScript(data, 'both');
  assert.match(script, /DELETE FROM BTCBS012 WHERE BSSRVNAME='PublicCustomers' AND BSSRVVER='1' AND BSMTDNAME='get';/);
  assert.match(script, /INSERT INTO BTCBS012 \(BSCHNNAME, BSINTNAME, BSSRVNAME, BSSRVVER, BSMTDNAME, BSSRVENAB\) VALUES\('REST', 'BTSERVICES', 'PublicCustomers', '1', 'get', 1\);/);
  assert.match(script, /INSERT INTO BTCBS012 \(BSCHNNAME, BSINTNAME, BSSRVNAME, BSSRVVER, BSMTDNAME, BSSRVENAB\) VALUES\('SOAP', 'BTSERVICES', 'PublicCustomers', '1', 'get', 0\);/);
});

test('sg_generateScript interna modo insert/delete de BTCBS012 solo trae la mitad correspondiente', () => {
  const data = methodData({ channels: [{ chnname: 'REST', srvenab: 'S' }] });
  const onlyInsert = sg_generateScript(data, 'insert');
  assert.doesNotMatch(onlyInsert, /DELETE FROM BTCBS012/);
  assert.match(onlyInsert, /INSERT INTO BTCBS012/);
  const onlyDelete = sg_generateScript(data, 'delete');
  assert.match(onlyDelete, /DELETE FROM BTCBS012/);
  assert.doesNotMatch(onlyDelete, /INSERT INTO BTCBS012/);
});

test('sg_generateScript interna sin canales: DELETE de BTCBS012 igual corre, pero sin INSERT', () => {
  const script = sg_generateScript(methodData(), 'both'); // methodData() no trae channels
  assert.match(script, /DELETE FROM BTCBS012 WHERE BSSRVNAME='PublicCustomers' AND BSSRVVER='1' AND BSMTDNAME='get';/);
  assert.doesNotMatch(script, /INSERT INTO BTCBS012/);
});

test('sg_generateScript interna escapa comillas en BSCHNNAME de BTCBS012', () => {
  const data = methodData({ channels: [{ chnname: "REST'API", srvenab: 'S' }] });
  const script = sg_generateScript(data, 'insert');
  assert.match(script, /VALUES\('REST''API', /);
});

test('sg_generateScript interna genera las tablas en orden numerico: 012, 014, 019', () => {
  const data = methodData({ channels: [{ chnname: 'REST', srvenab: 'S' }] });
  const script = sg_generateScript(data, 'both');
  const p012 = script.indexOf('BTCBS012'), p014 = script.indexOf('BTCBS014'), p019 = script.indexOf('BTCBS019');
  assert.ok(p012 >= 0 && p014 >= 0 && p019 >= 0, script);
  assert.ok(p012 < p014, 'BTCBS012 tiene que ir antes que BTCBS014');
  assert.ok(p014 < p019, 'BTCBS014 tiene que ir antes que BTCBS019');
});

test('sg_generateScript con apiMode=publica no genera BTCBS012 (esa tabla no existe ahi)', () => {
  const script = sg_generateScript(methodData({ apiMode: 'publica', channels: [{ chnname: 'REST', srvenab: 'S' }] }), 'both');
  assert.doesNotMatch(script, /BTCBS012/);
});

test('sg_generateScript V4 publica genera DELETE+INSERT de BTI012 por cada canal', () => {
  const data = methodData({ apiMode: 'publica', channels: [
    { chnname: 'REST', srvenab: 'S' },
    { chnname: 'SOAP', srvenab: 'N' },
  ] });
  const script = sg_generateScript(data, 'both');
  assert.match(script, /DELETE FROM BTI012 WHERE BTINOM='BTSERVICES' AND BTISRVNOM='PublicCustomers' AND BTISRVVER='1' AND BTIMTDNOM='get';/);
  assert.match(script, /INSERT INTO BTI012 \(BTICANNOM, BTINOM, BTISRVNOM, BTISRVVER, BTIMTDNOM, BTISRVHAB\) VALUES\('REST', 'BTSERVICES', 'PublicCustomers', '1', 'get', 'S'\);/);
  assert.match(script, /VALUES\('SOAP', 'BTSERVICES', 'PublicCustomers', '1', 'get', 'N'\);/);
});

test('sg_generateScript V3 publica genera BTI012 con el casing y quoting N\'\' propios de V3', () => {
  const data = methodData({ version: 'V3', apiMode: 'publica', channels: [{ chnname: 'REST', srvenab: 'S' }] });
  const script = sg_generateScript(data, 'both');
  assert.match(script, /DELETE FROM BTI012 WHERE BTINom=N'BTSERVICES' AND BTISrvNom=N'PublicCustomers' AND BTISrvVer=N'1' AND BTIMtdNom=N'get';/);
  assert.match(script, /INSERT INTO BTI012 \(BTICanNom, BTINom, BTISrvNom, BTISrvVer, BTIMtdNom, BTISrvHab\) VALUES\(N'REST', N'BTSERVICES', N'PublicCustomers', N'1', N'get', N'S'\);/);
});

test('sg_generateScript V4 publica genera las tablas en orden numerico: 012, 014, 019', () => {
  const data = methodData({ apiMode: 'publica', channels: [{ chnname: 'REST', srvenab: 'S' }] });
  const script = sg_generateScript(data, 'both');
  const p012 = script.indexOf('BTI012'), p014 = script.indexOf('BTI014'), p019 = script.indexOf('BTI019');
  assert.ok(p012 >= 0 && p014 >= 0 && p019 >= 0, script);
  assert.ok(p012 < p014, 'BTI012 tiene que ir antes que BTI014');
  assert.ok(p014 < p019, 'BTI014 tiene que ir antes que BTI019');
});

test('sg_generateScript V3 publica genera las tablas en orden numerico: 004, 012, 014, 019', () => {
  const data = methodData({ version: 'V3', apiMode: 'publica', channels: [{ chnname: 'REST', srvenab: 'S' }] });
  const script = sg_generateScript(data, 'both');
  const p004 = script.indexOf('BTI004'), p012 = script.indexOf('BTI012'), p014 = script.indexOf('BTI014'), p019 = script.indexOf('BTI019');
  assert.ok(p004 >= 0 && p012 >= 0 && p014 >= 0 && p019 >= 0, script);
  assert.ok(p004 < p012, 'BTI004 tiene que ir antes que BTI012');
  assert.ok(p012 < p014, 'BTI012 tiene que ir antes que BTI014');
  assert.ok(p014 < p019, 'BTI014 tiene que ir antes que BTI019');
});

test('sg_generateScript publica modo insert/delete de BTI012 solo trae la mitad correspondiente', () => {
  const data = methodData({ apiMode: 'publica', channels: [{ chnname: 'REST', srvenab: 'S' }] });
  const onlyInsert = sg_generateScript(data, 'insert');
  assert.doesNotMatch(onlyInsert, /DELETE FROM BTI012/);
  assert.match(onlyInsert, /INSERT INTO BTI012/);
  const onlyDelete = sg_generateScript(data, 'delete');
  assert.match(onlyDelete, /DELETE FROM BTI012/);
  assert.doesNotMatch(onlyDelete, /INSERT INTO BTI012/);
});

test('sg_generateScript publica sin canales: DELETE de BTI012 igual corre, pero sin INSERT', () => {
  const script = sg_generateScript(methodData({ apiMode: 'publica' }), 'both'); // sin channels
  assert.match(script, /DELETE FROM BTI012 WHERE BTINOM='BTSERVICES' AND BTISRVNOM='PublicCustomers' AND BTISRVVER='1' AND BTIMTDNOM='get';/);
  assert.doesNotMatch(script, /INSERT INTO BTI012/);
});

// BTISrvHab es nullable (a diferencia de BSSRVENAB en BTCBS012, NUMBER NOT
// NULL): si el canal no trae valor, el INSERT tiene que preservar NULL en
// vez de inventar un default.
test('sg_generateScript publica emite NULL en BTISRVHAB cuando el canal no trae valor', () => {
  const data = methodData({ apiMode: 'publica', channels: [{ chnname: 'REST', srvenab: '' }] });
  const script = sg_generateScript(data, 'insert');
  assert.match(script, /VALUES\('REST', 'BTSERVICES', 'PublicCustomers', '1', 'get', NULL\);/);
});

test('sg_generateScript publica escapa comillas en BTICANNOM de BTI012', () => {
  const data = methodData({ apiMode: 'publica', channels: [{ chnname: "REST'API", srvenab: 'S' }] });
  const script = sg_generateScript(data, 'insert');
  assert.match(script, /VALUES\('REST''API', /);
});

test('sg_generateScript interna (BTCBS) no genera BTI012 (esa tabla es de la API Publica)', () => {
  const script = sg_generateScript(methodData({ channels: [{ chnname: 'REST', srvenab: 'S' }] }), 'both');
  assert.doesNotMatch(script, /BTI012/);
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
    channels: [{ chnname: lobLike(), srvenab: 'S' }],
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

// ── sg_generateParamsUpdateScript (editar-parametria: UPDATE en vez de DELETE+INSERT) ──

function paramsData(overrides) {
  return Object.assign({
    version: 'V4',
    apiMode: 'publica',
    header: { BTINom: 'BTSERVICES', BTISrvNom: 'PublicCustomers', BTISrvVer: '1', BTIMtdNom: 'get' },
    params: [
      { nom: 'id', nomjava: 'id', dir: 'I', tipo: 'Numeric', ittipo: '', valor: '', sdtver: '', cat: 'B', catit: 'B', largo: '9', lval: '', itnom: '', deci: '0', dsc: 'Identificador.' },
    ],
  }, overrides || {});
}

test('sg_generateParamsUpdateScript UPDATEa por posicion cuando oldCount cubre todos los parametros', () => {
  const script = sg_generateParamsUpdateScript(paramsData(), 1);
  assert.doesNotMatch(script, /INSERT|DELETE/);
  assert.match(script, /^UPDATE BTI019 SET .* WHERE BTINOM='BTSERVICES' AND BTISRVNOM='PublicCustomers' AND BTISRVVER='1' AND BTIMTDNOM='get' AND BTISRVPARPOSI=1;$/);
});

test('sg_generateParamsUpdateScript escapa comillas en el SET del UPDATE (BTI019, V4)', () => {
  const script = sg_generateParamsUpdateScript(paramsData({
    params: [{ nom: "id'malicioso", nomjava: 'id', dir: 'I', tipo: 'Numeric', ittipo: '', valor: '', sdtver: '', cat: 'B', catit: 'B', largo: '9', lval: '', itnom: '', deci: '0', dsc: "Con ' comilla." }],
  }), 1);
  assert.match(script, /BTISRVPARNOM='id''malicioso'/);
  assert.match(script, /BTISRVPARDSC='Con '' comilla\.'/);
});

test('sg_generateParamsUpdateScript V3 usa el prefijo N y las columnas PascalCase en el SET', () => {
  const script = sg_generateParamsUpdateScript(paramsData({ version: 'V3' }), 1);
  assert.match(script, /^UPDATE BTI019 SET .* WHERE BTINom=N'BTSERVICES' AND BTISrvNom=N'PublicCustomers' AND BTISrvVer=N'1' AND BTIMtdNom=N'get' AND BTISrvParPosi=1;$/);
  assert.match(script, /BTISrvParNom=N'id'/);
  assert.doesNotMatch(script, /BTISRVPARDSC/, 'V3 no tiene columna de descripcion en BTI019');
});

test('sg_generateParamsUpdateScript INSERTa solo las filas nuevas (posicion > oldCount)', () => {
  const script = sg_generateParamsUpdateScript(paramsData({
    params: [
      { nom: 'id', nomjava: 'id', dir: 'I', tipo: 'Numeric', ittipo: '', valor: '', sdtver: '', cat: 'B', catit: 'B', largo: '9', lval: '', itnom: '', deci: '0', dsc: 'Identificador.' },
      { nom: 'nuevo', nomjava: 'nuevo', dir: 'I', tipo: 'string', ittipo: '', valor: '', sdtver: '', cat: 'B', catit: 'B', largo: '50', lval: '', itnom: '', deci: '0', dsc: 'Nuevo.' },
    ],
  }), 1);
  const updateLines = script.split('\n').filter(l => l.startsWith('UPDATE'));
  const insertLines = script.split('\n').filter(l => l.startsWith('INSERT'));
  assert.equal(updateLines.length, 1);
  assert.equal(insertLines.length, 1);
  assert.match(insertLines[0], /VALUES\('BTSERVICES', 'PublicCustomers', '1', 'get', 2, 'nuevo'/);
  assert.doesNotMatch(script, /DELETE/);
});

test('sg_generateParamsUpdateScript DELETEa por posicion las filas que sobran (posicion > newCount)', () => {
  const script = sg_generateParamsUpdateScript(paramsData(), 3);
  assert.match(script, /DELETE FROM BTI019 WHERE BTINOM='BTSERVICES' AND BTISRVNOM='PublicCustomers' AND BTISRVVER='1' AND BTIMTDNOM='get' AND BTISRVPARPOSI > 1;/);
  assert.doesNotMatch(script, /INSERT/);
});

test('sg_generateParamsUpdateScript (apiMode interna) UPDATEa BTCBS019, no BTI019, y escapa comillas', () => {
  const script = sg_generateParamsUpdateScript(paramsData({
    apiMode: 'interna',
    params: [{ nom: "id'x", nomjava: 'id', dir: 'I', tipo: 'Numeric', ittipo: '', valor: '', sdtver: '', cat: 'B', catit: 'B', largo: '9', lval: '', itnom: '', deci: '0', dsc: '' }],
  }), 1);
  assert.match(script, /^UPDATE BTCBS019 SET .* WHERE BSINTNAME='BTSERVICES' AND BSSRVNAME='PublicCustomers' AND BSSRVVER='1' AND BSMTDNAME='get' AND BSPARPOS=1;$/);
  assert.match(script, /BSPARNAME='id''x'/);
  assert.doesNotMatch(script, /BTI019/);
});

// ── sg_generateFieldsUpdateScript (editar-parametria: editar campos de un SDT existente) ──

function fieldsData(overrides) {
  return Object.assign({
    nom: 'SdtCliente',
    bti026: [
      { version: '1', elemnom: 'nombre', nint: '', obl: 'N', elemcat: 'B', elemtipo: 'string', elemsdt: '', sdtve: '', plano: '', elemlargo: '50', enu: '', val: '', elemdsc: 'Nombre del cliente.', catit: 'B', elemdeci: '0', nomit: '' },
    ],
  }, overrides || {});
}

test('sg_generateFieldsUpdateScript V4 UPDATEa la fila completa por posicion y no toca INSERT/DELETE si no cambio la cantidad', () => {
  const script = sg_generateFieldsUpdateScript(fieldsData(), 1, 'V4', 'publica');
  assert.doesNotMatch(script, /INSERT|DELETE/);
  const lines = script.split('\n');
  assert.equal(lines.length, 2, 'fase 0 (blanquear nombre) + fase 1 (UPDATE completo), ver ORA-00001');
  assert.match(lines[0], /^UPDATE BTI026 SET BTISDTELEMNOM='~TMP~1' WHERE BTISDTNOM='SdtCliente' AND BTISDTELEMPOSI=1;$/);
  assert.match(lines[1], /^UPDATE BTI026 SET .* WHERE BTISDTNOM='SdtCliente' AND BTISDTELEMPOSI=1;$/);
  assert.ok(lines[1].includes("BTISDTELEMNOM='nombre'"));
  assert.ok(lines[1].includes('BTISDTELEMLARGO=50'));
  assert.ok(lines[1].includes("BTISDTELEMTIPO='string'"), 'debe escribir el tipo tambien, no solo las columnas editables');
  assert.ok(lines[1].includes("BTISDTELEMCAT='B'"));
});

test('sg_generateFieldsUpdateScript V4 mueve el tipo/categoria JUNTO con el campo reordenado (no se queda pegado a la posicion vieja)', () => {
  // Simula un reorden: el campo SDT (elemtipo='SdtDireccion', elemcat='S')
  // que estaba en la posicion 2 ahora es el primero del array.
  const campoSdt = { version: '1', elemnom: 'direccion', nint: '', obl: 'N', elemcat: 'S', elemtipo: 'SdtDireccion', elemsdt: 'SdtDireccion', sdtve: '1', plano: '', elemlargo: '0', enu: '', val: '', elemdsc: 'Direccion del cliente.', catit: 'B', elemdeci: '0', nomit: '' };
  const campoBasico = fieldsData().bti026[0];
  const script = sg_generateFieldsUpdateScript({ nom: 'SdtCliente', bti026: [campoSdt, campoBasico] }, 2, 'V4', 'publica');
  const lines = script.split('\n');
  // 2 UPDATE de fase 0 (blanquear nombre por posicion) + 2 UPDATE de fase 1 (fila completa).
  assert.equal(lines.length, 4);
  assert.match(lines[2], /WHERE BTISDTNOM='SdtCliente' AND BTISDTELEMPOSI=1;$/);
  assert.ok(lines[2].includes("BTISDTELEMNOM='direccion'"));
  assert.ok(lines[2].includes("BTISDTELEMTIPO='SdtDireccion'"), 'la posicion 1 ahora debe tener el tipo del campo SDT que se movio ahi');
  assert.ok(lines[2].includes("BTISDTELEMCAT='S'"));
  assert.match(lines[3], /WHERE BTISDTNOM='SdtCliente' AND BTISDTELEMPOSI=2;$/);
  assert.ok(lines[3].includes("BTISDTELEMNOM='nombre'"));
  assert.ok(lines[3].includes("BTISDTELEMTIPO='string'"), 'la posicion 2 ahora debe tener el tipo del campo basico que se movio ahi');
});

test('sg_generateFieldsUpdateScript V4 blanquea el nombre a un valor temporal unico por posicion ANTES de reescribir la fila (evita ORA-00001 al cruzar posiciones)', () => {
  // Reproduce el bug real: dos campos "cruzan" posiciones (A pasa a donde
  // estaba B y viceversa). Si el UPDATE de la fila completa corriera antes
  // de blanquear el nombre, la primera sentencia dejaria transitoriamente
  // dos filas con el mismo BTISDTELEMNOM y Oracle tiraria ORA-00001 por el
  // UNIQUE (BTISDTNOM, BTISDTELEMNOM), aunque el estado final sea valido.
  const campoA = Object.assign({}, fieldsData().bti026[0], { elemnom: 'campoA' });
  const campoB = Object.assign({}, fieldsData().bti026[0], { elemnom: 'campoB' });
  // Estado viejo en la base: posicion 1 = campoA, posicion 2 = campoB.
  // Estado nuevo (reordenado): posicion 1 = campoB, posicion 2 = campoA.
  const script = sg_generateFieldsUpdateScript({ nom: 'SdtCliente', bti026: [campoB, campoA] }, 2, 'V4', 'publica');
  const lines = script.split('\n');
  assert.equal(lines.length, 4);
  // Fase 0: las dos posiciones se blanquean a un valor temporal unico-por-
  // posicion ANTES de que cualquier UPDATE toque el nombre real -- en
  // ningun punto de la ejecucion secuencial hay dos filas con el mismo
  // BTISDTELEMNOM.
  assert.match(lines[0], /^UPDATE BTI026 SET BTISDTELEMNOM='~TMP~1' WHERE BTISDTNOM='SdtCliente' AND BTISDTELEMPOSI=1;$/);
  assert.match(lines[1], /^UPDATE BTI026 SET BTISDTELEMNOM='~TMP~2' WHERE BTISDTNOM='SdtCliente' AND BTISDTELEMPOSI=2;$/);
  // Fase 1: recien aca se escribe el nombre final, ya sin riesgo de colision
  // porque las dos filas dejaron de compartir el nombre real en el medio.
  assert.ok(lines[2].includes("BTISDTELEMNOM='campoB'") && lines[2].includes('BTISDTELEMPOSI=1'));
  assert.ok(lines[3].includes("BTISDTELEMNOM='campoA'") && lines[3].includes('BTISDTELEMPOSI=2'));
});

test('sg_generateFieldsUpdateScript V4 escapa comillas y preserva el nombre de iterador si viene', () => {
  const script = sg_generateFieldsUpdateScript(fieldsData({
    bti026: [Object.assign({}, fieldsData().bti026[0], { elemnom: "campo'x", elemdsc: "Con ' comilla.", nomit: 'iterA' })],
  }), 1, 'V4', 'publica');
  assert.match(script, /BTISDTELEMNOM='campo''x'/);
  assert.match(script, /BTISDTELEMDSC='Con '' comilla\.'/);
  assert.match(script, /BTISDTELEMNOMIT='iterA'/);
});

test('sg_generateFieldsUpdateScript V3 usa el prefijo N, columnas PascalCase y no incluye decimales/iterador (no existen en V3)', () => {
  const script = sg_generateFieldsUpdateScript(fieldsData(), 1, 'V3', 'publica');
  const lines = script.split('\n');
  assert.equal(lines.length, 2);
  assert.match(lines[0], /^UPDATE BTI026 SET BTISDTElemNom=N'~TMP~1' WHERE BTISDTNom=N'SdtCliente' AND BTISDTElemPosi=1;$/);
  assert.match(lines[1], /^UPDATE BTI026 SET BTISDTElemNom=N'nombre', BTISDTElemTipo=N'string', BTISDTElemLargo=50, BTISDTElemCat=N'B', BTISDTElemDsc=N'Nombre del cliente\.', BTISDTElemSDT=N'' WHERE BTISDTNom=N'SdtCliente' AND BTISDTElemPosi=1;$/);
  assert.doesNotMatch(script, /DECI|NOMIT/);
});

test('sg_generateFieldsUpdateScript DELETEa por posicion los campos que sobran cuando se quita uno (sin INSERT: no se agregan campos nuevos)', () => {
  const script = sg_generateFieldsUpdateScript(fieldsData(), 3, 'V4', 'publica');
  const updateLines = script.split('\n').filter(l => l.startsWith('UPDATE'));
  assert.equal(updateLines.length, 2, 'fase 0 (blanquear nombre) + fase 1 (UPDATE completo) para la unica posicion tocada');
  assert.match(script, /DELETE FROM BTI026 WHERE BTISDTNOM='SdtCliente' AND BTISDTELEMPOSI > 1;/);
  assert.doesNotMatch(script, /INSERT/);
});

test('sg_generateFieldsUpdateScript (apiMode interna) UPDATEa BTCBS026, no BTI026', () => {
  const script = sg_generateFieldsUpdateScript(fieldsData({
    bti026: [Object.assign({}, fieldsData().bti026[0], { elemnom: "campo'y", elemlargo: '20', elemdeci: '2', elemdsc: 'Descripcion.' })],
  }), 1, 'V4', 'interna');
  assert.ok(script.includes('BTCBS026'));
  assert.ok(!script.includes('BTI026'));
  const lines = script.split('\n');
  assert.equal(lines.length, 2);
  assert.match(lines[0], /^UPDATE BTCBS026 SET BSELMNAME='~TMP~1' WHERE BSSDTNAME='SdtCliente' AND BSELMPOS=1;$/);
  assert.match(lines[1], /^UPDATE BTCBS026 SET .* WHERE BSSDTNAME='SdtCliente' AND BSELMPOS=1;$/);
  assert.ok(lines[1].includes("BSELMNAME='campo''y'"));
  assert.ok(lines[1].includes('BSELMLEN=20'));
  assert.ok(lines[1].includes('BSELMDECI=2'));
  assert.ok(lines[1].includes("BSELMDESC='Descripcion.'"));
});

test('sg_generateFieldsUpdateScript (apiMode interna) tambien blanquea BSELMNAME antes de reescribir (mismo fix de ORA-00001 que la API publica)', () => {
  const campoA = Object.assign({}, fieldsData().bti026[0], { elemnom: 'campoA' });
  const campoB = Object.assign({}, fieldsData().bti026[0], { elemnom: 'campoB' });
  const script = sg_generateFieldsUpdateScript({ nom: 'SdtCliente', bti026: [campoB, campoA] }, 2, 'V4', 'interna');
  const lines = script.split('\n');
  assert.equal(lines.length, 4);
  assert.match(lines[0], /^UPDATE BTCBS026 SET BSELMNAME='~TMP~1' WHERE BSSDTNAME='SdtCliente' AND BSELMPOS=1;$/);
  assert.match(lines[1], /^UPDATE BTCBS026 SET BSELMNAME='~TMP~2' WHERE BSSDTNAME='SdtCliente' AND BSELMPOS=2;$/);
});
