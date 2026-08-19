const test = require('node:test');
const assert = require('node:assert/strict');

const { buildSdtCopy, generateSdtScript, isValidFieldName, isValidDigits, isValidFieldText } = require('./index.js');

function sourceSdt() {
  return {
    bti025: { nom: 'SdtOriginal', version: '2', descrip: 'Descripcion original.', nativo: 'S', fecha: new Date('2025-01-01'), nomint: 'SdtOriginalInt', estado: 'Validado', tipo: '0', namespace: 'uy.com.dlya' },
    bti026: [
      { elemnom: 'campoA', elemtipo: 'String', elemlargo: '50', elemcat: 'B', elemdsc: 'Campo A.', elemsdt: '', elemdeci: '0', nomit: '', version: '2', posi: '7' },
      { elemnom: 'campoB', elemtipo: 'Int', elemlargo: '0', elemcat: 'B', elemdsc: 'Campo B.', elemsdt: '', elemdeci: '0', nomit: '' },
      { elemnom: 'campoC', elemtipo: 'SdtAnidado', elemlargo: '0', elemcat: 'B', elemdsc: 'Campo anidado.', elemsdt: 'SdtAnidado', elemdeci: '0', nomit: '' },
    ],
  };
}

// Arma un editedFields[i] "sin cambios" a partir de un campo real del origen,
// permitiendo pisar puntualmente los valores editables via overrides.
function edited(src, elemnom, overrides) {
  const f = src.bti026.find(x => x.elemnom === elemnom);
  if (!f) throw new Error('fixture invalido: no existe ' + elemnom);
  return Object.assign({
    origElemnom: elemnom,
    elemnom: f.elemnom,
    elemlargo: f.elemlargo,
    elemdsc: f.elemdsc,
    elemdeci: f.elemdeci || '0',
    nomit: f.nomit,
  }, overrides || {});
}

function editedAll(src, elemnoms) {
  return elemnoms.map(n => edited(src, n));
}

test('buildSdtCopy fuerza Nativo=N y Version=1 en la copia, hereda el resto de BTI025', () => {
  const src = sourceSdt();
  const { bti025Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA', 'campoB', 'campoC']));
  assert.equal(bti025Copy.nativo, 'N');
  assert.equal(bti025Copy.version, '1');
  assert.equal(bti025Copy.nom, 'SdtCopia');
  assert.equal(bti025Copy.namespace, 'uy.com.dlya');
  assert.equal(bti025Copy.descrip, 'Descripcion original.');
});

test('buildSdtCopy respeta el orden de editedFields y asigna posi consecutivo', () => {
  const src = sourceSdt();
  const { bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoC', 'campoA']));
  assert.deepEqual(bti026Copy.map(f => f.elemnom), ['campoC', 'campoA']);
  assert.equal(bti026Copy[0].posi, '1');
  assert.equal(bti026Copy[1].posi, '2');
});

test('buildSdtCopy fuerza version=1 en cada campo de BTI026 aunque el origen traiga otra', () => {
  const src = sourceSdt();
  src.bti026[1].version = '3';
  const { bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA', 'campoB', 'campoC']));
  assert.ok(bti026Copy.every(f => f.version === '1'), 'todos los campos copiados deben tener version=1');
});

test('buildSdtCopy excluye campos no presentes en editedFields', () => {
  const src = sourceSdt();
  const { bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA']));
  assert.equal(bti026Copy.length, 1);
  assert.equal(bti026Copy[0].elemnom, 'campoA');
});

test('buildSdtCopy conserva el SDT anidado referenciado sin renombrarlo', () => {
  const src = sourceSdt();
  const { bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoC']));
  assert.equal(bti026Copy[0].elemsdt, 'SdtAnidado');
  assert.equal(bti026Copy[0].elemtipo, 'SdtAnidado');
});

test('buildSdtCopy lanza si editedFields referencia un origElemnom inexistente', () => {
  const src = sourceSdt();
  assert.throws(() => buildSdtCopy(src, 'SdtCopia', [edited(src, 'campoA', { origElemnom: 'campoZ' })]), /campoZ/);
});

test('buildSdtCopy permite renombrar un campo (BTISDTELEMNOM editable)', () => {
  const src = sourceSdt();
  const { bti026Copy } = buildSdtCopy(src, 'SdtCopia', [edited(src, 'campoA', { elemnom: 'campoRenombrado' })]);
  assert.equal(bti026Copy[0].elemnom, 'campoRenombrado');
});

test('buildSdtCopy lanza si el nombre editado no es un identificador valido', () => {
  const src = sourceSdt();
  for (const nombreInvalido of ['campo A', '1campo', "campo'A", '']) {
    assert.throws(
      () => buildSdtCopy(src, 'SdtCopia', [edited(src, 'campoA', { elemnom: nombreInvalido })]),
      /Nombre de campo invalido/,
      'deberia rechazar: ' + JSON.stringify(nombreInvalido)
    );
  }
});

test('buildSdtCopy permite editar largo y decimales con valores numericos', () => {
  const src = sourceSdt();
  const { bti026Copy } = buildSdtCopy(src, 'SdtCopia', [edited(src, 'campoA', { elemlargo: '120', elemdeci: '2' })]);
  assert.equal(bti026Copy[0].elemlargo, '120');
  assert.equal(bti026Copy[0].elemdeci, '2');
});

test('buildSdtCopy lanza si largo o decimales no son numericos', () => {
  const src = sourceSdt();
  assert.throws(() => buildSdtCopy(src, 'SdtCopia', [edited(src, 'campoA', { elemlargo: '12a' })]), /Largo invalido/);
  assert.throws(() => buildSdtCopy(src, 'SdtCopia', [edited(src, 'campoA', { elemdeci: '-1' })]), /Decimales invalidos/);
  assert.throws(() => buildSdtCopy(src, 'SdtCopia', [edited(src, 'campoA', { elemlargo: '' })]), /Largo invalido/);
});

test('buildSdtCopy permite editar la descripcion con texto normal (incluye acentos y enie)', () => {
  const src = sourceSdt();
  const { bti026Copy } = buildSdtCopy(src, 'SdtCopia', [edited(src, 'campoA', { elemdsc: 'Descripcion en espanol con ñ y acentos: código, año.' })]);
  assert.equal(bti026Copy[0].elemdsc, 'Descripcion en espanol con ñ y acentos: código, año.');
});

test('buildSdtCopy lanza si la descripcion contiene comillas, punto y coma, barra invertida o salto de linea', () => {
  const src = sourceSdt();
  for (const textoInvalido of ["Tiene ' apostrofo", 'Tiene " comilla doble', 'Tiene ; punto y coma', 'Tiene \\ barra', 'Tiene\nsalto de linea']) {
    assert.throws(
      () => buildSdtCopy(src, 'SdtCopia', [edited(src, 'campoA', { elemdsc: textoInvalido })]),
      /Descripcion invalida/,
      'deberia rechazar: ' + JSON.stringify(textoInvalido)
    );
  }
});

test('buildSdtCopy permite editar el nombre de iterador (BTISDTELEMNOMIT) y lo deja vacio si no se manda', () => {
  const src = sourceSdt();
  const conNomit = buildSdtCopy(src, 'SdtCopia', [edited(src, 'campoA', { nomit: 'iterA' })]).bti026Copy;
  assert.equal(conNomit[0].nomit, 'iterA');
  const sinNomit = buildSdtCopy(src, 'SdtCopia', [edited(src, 'campoA', { nomit: '' })]).bti026Copy;
  assert.equal(sinNomit[0].nomit, '');
});

test('buildSdtCopy lanza si el nombre de iterador contiene caracteres prohibidos', () => {
  const src = sourceSdt();
  assert.throws(() => buildSdtCopy(src, 'SdtCopia', [edited(src, 'campoA', { nomit: "iter'A" })]), /Nombre de iterador invalido/);
});

test('isValidFieldName / isValidDigits / isValidFieldText validan lo esperado', () => {
  assert.equal(isValidFieldName('campoA'), true);
  assert.equal(isValidFieldName('1campo'), false);
  assert.equal(isValidDigits('0'), true);
  assert.equal(isValidDigits('-1'), false);
  assert.equal(isValidDigits('1.5'), false);
  assert.equal(isValidFieldText('texto normal.'), true);
  assert.equal(isValidFieldText("con '"), false);
});

test('generateSdtScript V3 emite DELETE antes que INSERT y usa el nombre nuevo', () => {
  const src = sourceSdt();
  const { bti025Copy, bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA', 'campoB']));
  const script = generateSdtScript('SdtCopia', bti025Copy, bti026Copy, 'V3', 'both');
  const deleteIdx = script.indexOf("DELETE FROM BTI025 WHERE BTISDTNom=N'SdtCopia'");
  const insertIdx = script.indexOf("INSERT INTO BTI025");
  assert.ok(deleteIdx >= 0, 'debe incluir el DELETE de BTI025 con el nombre nuevo');
  assert.ok(insertIdx > deleteIdx, 'el INSERT debe venir despues del DELETE');
  assert.ok(script.includes("N'N'"), 'debe insertar Nativo=N');
  assert.match(script, /INSERT INTO BTI026 \([^)]+\) VALUES\(N'SdtCopia', N'campoA'/);
});

test('generateSdtScript V4 usa columnas y comillas de Oracle', () => {
  const src = sourceSdt();
  const { bti025Copy, bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA']));
  const script = generateSdtScript('SdtCopia', bti025Copy, bti026Copy, 'V4', 'insert');
  assert.ok(!/[(,]\s*N'/.test(script), 'V4 no debe usar el prefijo N de SQL Server');
  assert.match(script, /INSERT INTO BTI026 \([^)]+\) VALUES\('SdtCopia', '1', 'campoA'/);
});

test('generateSdtScript V3 incluye BTISDTElemPosi con la posicion asignada por buildSdtCopy', () => {
  const src = sourceSdt();
  const { bti025Copy, bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoC', 'campoA']));
  const script = generateSdtScript('SdtCopia', bti025Copy, bti026Copy, 'V3', 'insert');
  const lines = script.split('\n').filter(l => l.startsWith('INSERT INTO BTI026'));
  assert.equal(lines.length, 2);
  assert.ok(lines[0].includes('BTISDTElemPosi'), 'la lista de columnas V3 debe incluir BTISDTElemPosi');
  assert.match(lines[0], /VALUES\(N'SdtCopia', N'campoC'.*, 1\);$/);
  assert.match(lines[1], /VALUES\(N'SdtCopia', N'campoA'.*, 2\);$/);
});

test('generateSdtScript V4 fuerza BTISDTVersion=1 aunque el campo origen tenga otra version', () => {
  const src = sourceSdt();
  const { bti025Copy, bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA']));
  assert.equal(sourceSdt().bti026[0].version, '2', 'el fixture debe traer una version distinta de 1');
  const script = generateSdtScript('SdtCopia', bti025Copy, bti026Copy, 'V4', 'insert');
  const line = script.split('\n').find(l => l.startsWith('INSERT INTO BTI026'));
  assert.match(line, /VALUES\('SdtCopia', '1', 'campoA'/);
  assert.ok(!line.includes("'2'"), 'no debe filtrarse la version del origen');
});

test('generateSdtScript refleja un campo renombrado en el INSERT generado', () => {
  const src = sourceSdt();
  const { bti025Copy, bti026Copy } = buildSdtCopy(src, 'SdtCopia', [edited(src, 'campoA', { elemnom: 'campoNuevoNombre' })]);
  const script = generateSdtScript('SdtCopia', bti025Copy, bti026Copy, 'V3', 'insert');
  assert.match(script, /INSERT INTO BTI026 \([^)]+\) VALUES\(N'SdtCopia', N'campoNuevoNombre'/);
});

const { createSdtGenFeature, suggestFieldShape, humanizeFieldName } = require('./index.js');

test('humanizeFieldName separa camelCase en palabras capitalizadas', () => {
  assert.equal(humanizeFieldName('countryId'), 'Country Id');
  assert.equal(humanizeFieldName('fechaAltaCliente'), 'Fecha Alta Cliente');
});

test('humanizeFieldName separa snake_case/kebab-case en palabras capitalizadas', () => {
  assert.equal(humanizeFieldName('fecha_alta'), 'Fecha Alta');
  assert.equal(humanizeFieldName('fecha-alta'), 'Fecha Alta');
});

test('humanizeFieldName separa siglas en mayuscula seguidas de una palabra normal (aunque no preserve el casing de la sigla)', () => {
  assert.equal(humanizeFieldName('idCUITCliente'), 'Id Cuit Cliente');
});

test('suggestFieldShape devuelve null si no hay candidatos', () => {
  assert.equal(suggestFieldShape('campoA', []), null);
  assert.equal(suggestFieldShape('campoA', null), null);
});

test('suggestFieldShape descarta candidatos con largo=0 (default de "recien definido")', () => {
  const candidates = [
    { largo: '0', dsc: 'Nombre del cliente.' },
    { largo: '0', dsc: 'Otra descripcion valida.' },
  ];
  assert.equal(suggestFieldShape('campoA', candidates), null);
});

test('suggestFieldShape descarta candidatos con descripcion igual al nombre del campo (default de "recien definido")', () => {
  const candidates = [
    { largo: '20', dsc: 'campoA' },
    { largo: '30', dsc: 'campoA' },
  ];
  assert.equal(suggestFieldShape('campoA', candidates), null);
});

test('suggestFieldShape elige la combinacion mas frecuente (moda) entre los candidatos utiles', () => {
  const candidates = [
    { largo: '0', dsc: 'campoA' },                 // default, se descarta
    { largo: '20', dsc: 'Nombre del cliente.' },
    { largo: '50', dsc: 'typo aislado.' },          // outlier
    { largo: '20', dsc: 'Nombre del cliente.' },
  ];
  const suggestion = suggestFieldShape('campoA', candidates);
  assert.equal(suggestion.shape.largo, '20');
  assert.equal(suggestion.shape.dsc, 'Nombre del cliente.');
  assert.equal(suggestion.count, 2);
  assert.equal(suggestion.total, 3, 'total cuenta solo los utiles, no el descartado por default');
});

test('suggestFieldShape normaliza el largo (numero, no string con ceros/espacios)', () => {
  const suggestion = suggestFieldShape('campoA', [{ largo: '020', dsc: 'Descripcion real.' }]);
  assert.equal(suggestion.shape.largo, '20');
});

test('suggestFieldShape descarta candidatos cuya descripcion es el nombre "humanizado" (default de GeneXus, no informacion real)', () => {
  // Caso real reportado: countryId con Largo=3, Decimales=0, Descripcion=
  // "Country Id" -- ese default (nombre separado en palabras y capitalizado)
  // no es informacion real, pese a no ser un match exacto de dsc===nombre.
  const candidates = [
    { largo: '3', dsc: 'Country Id' },
    { largo: '3', dsc: 'Country Id' },
    { largo: '3', dsc: 'country id' }, // mismo default, distinto casing
  ];
  assert.equal(suggestFieldShape('countryId', candidates), null);
});

test('suggestFieldShape SI sugiere cuando la descripcion humanizada coincide por casualidad con una descripcion real (unica) y el resto son defaults', () => {
  const candidates = [
    { largo: '3', dsc: 'Country Id' },     // default, se descarta
    { largo: '5', dsc: 'Codigo de pais segun ISO 3166.' }, // real
  ];
  const suggestion = suggestFieldShape('countryId', candidates);
  assert.equal(suggestion.shape.largo, '5');
  assert.equal(suggestion.shape.dsc, 'Codigo de pais segun ISO 3166.');
  assert.equal(suggestion.total, 1, 'el default humanizado no debe contarse ni siquiera como candidato util');
});

function fakeDeps(overrides) {
  return Object.assign({
    getPool: async () => { throw new Error('getPool no configurado en el fake'); },
    getOra: async () => { throw new Error('getOra no configurado en el fake'); },
    queryBti025: async () => { throw new Error('queryBti025 no configurado en el fake'); },
    queryBti026: async () => { throw new Error('queryBti026 no configurado en el fake'); },
    queryFieldCandidates: async () => { throw new Error('queryFieldCandidates no configurado en el fake'); },
  }, overrides || {});
}

test('listSdtNames (SQL Server) devuelve nombres recortados en el orden de la query', async () => {
  const fakePool = { request: () => ({ query: async () => ({ recordset: [{ BTISDTNom: 'SdtA ' }, { BTISDTNom: 'SdtB' }] }) }) };
  const feature = createSdtGenFeature(fakeDeps({ getPool: async () => ({ pool: fakePool, mssql: {} }) }));
  const names = await feature.listSdtNames('sqlserver', {});
  assert.deepEqual(names, ['SdtA', 'SdtB']);
});

test('listSdtNames (SQL Server) filtra solo SDT nativos (BTISDTNativo=S)', async () => {
  let sqlSent = null;
  const fakePool = { request: () => ({ query: async (sql) => { sqlSent = sql; return { recordset: [] }; } }) };
  const feature = createSdtGenFeature(fakeDeps({ getPool: async () => ({ pool: fakePool, mssql: {} }) }));
  await feature.listSdtNames('sqlserver', {});
  assert.match(sqlSent, /WHERE\s+LTRIM\(RTRIM\(BTISDTNativo\)\)\s*=\s*'S'/i);
});

test('listSdtNames (Oracle) cierra la conexion y devuelve nombres recortados', async () => {
  let closed = false;
  const fakeConn = { execute: async () => ({ rows: [{ BTISDTNOM: 'SdtC ' }] }), close: async () => { closed = true; } };
  const feature = createSdtGenFeature(fakeDeps({ getOra: async () => ({ conn: fakeConn, oracledb: { OUT_FORMAT_OBJECT: 1 } }) }));
  const names = await feature.listSdtNames('oracle', {});
  assert.deepEqual(names, ['SdtC']);
  assert.equal(closed, true);
});

test('listSdtNames (Oracle) filtra solo SDT nativos (BTISDTNATIVO=S)', async () => {
  let sqlSent = null;
  const fakeConn = { execute: async (sql) => { sqlSent = sql; return { rows: [] }; }, close: async () => {} };
  const feature = createSdtGenFeature(fakeDeps({ getOra: async () => ({ conn: fakeConn, oracledb: { OUT_FORMAT_OBJECT: 1 } }) }));
  await feature.listSdtNames('oracle', {});
  assert.match(sqlSent, /WHERE\s+TRIM\(BTISDTNATIVO\)\s*=\s*'S'/i);
});

test('listSdtNames (Oracle, apiMode=interna) consulta BTCBS025 con BSSDTNATIV=1 (numerico, no CHAR)', async () => {
  let sqlSent = null;
  const fakeConn = { execute: async (sql) => { sqlSent = sql; return { rows: [{ BSSDTNAME: 'SdtInternaA ' }] }; }, close: async () => {} };
  const feature = createSdtGenFeature(fakeDeps({ getOra: async () => ({ conn: fakeConn, oracledb: { OUT_FORMAT_OBJECT: 1 } }) }));
  const names = await feature.listSdtNames('oracle', {}, 'interna');
  assert.match(sqlSent, /FROM BTCBS025 WHERE BSSDTNATIV\s*=\s*1/i);
  assert.deepEqual(names, ['SdtInternaA']);
});

test('listExistingCopies (SQL Server) filtra por BTISDTNativo=N y BTISDTNomInt=valor recibido', async () => {
  let sqlSent = null, nomintSent = null;
  const fakePool = {
    request: () => ({
      input: function(name, type, val) { if (name === 'nomint') nomintSent = val; return this; },
      query: async (sql) => { sqlSent = sql; return { recordset: [{ BTISDTNom: 'SdtCopiaA ', BTISDTDescrip: 'Copia A.', BTISDTEstado: 'Validado' }] }; },
    }),
  };
  const feature = createSdtGenFeature(fakeDeps({ getPool: async () => ({ pool: fakePool, mssql: { VarChar: () => 'varchar' } }) }));
  const copies = await feature.listExistingCopies('sqlserver', {}, 'V3', 'SdtOriginalInt');
  assert.match(sqlSent, /WHERE\s+LTRIM\(RTRIM\(BTISDTNativo\)\)\s*=\s*'N'\s+AND\s+LTRIM\(RTRIM\(BTISDTNomInt\)\)\s*=\s*@nomint/i);
  assert.equal(nomintSent, 'SdtOriginalInt');
  assert.deepEqual(copies, [{ nom: 'SdtCopiaA', descrip: 'Copia A.', estado: 'Validado' }]);
});

test('listExistingCopies (Oracle) filtra por BTISDTNATIVO=N y BTISDTNOMINT=valor recibido', async () => {
  let sqlSent = null, bindsSent = null;
  const fakeConn = {
    execute: async (sql, binds) => { sqlSent = sql; bindsSent = binds; return { rows: [{ BTISDTNOM: 'SdtCopiaB ', BTISDTDESCRIP: 'Copia B.', BTISDTESTADO: 'Validado' }] }; },
    close: async () => {},
  };
  const feature = createSdtGenFeature(fakeDeps({ getOra: async () => ({ conn: fakeConn, oracledb: { OUT_FORMAT_OBJECT: 1 } }) }));
  const copies = await feature.listExistingCopies('oracle', {}, 'V4', 'SdtOriginalInt');
  assert.match(sqlSent, /WHERE\s+TRIM\(BTISDTNATIVO\)\s*=\s*'N'\s+AND\s+TRIM\(BTISDTNOMINT\)\s*=\s*:1/i);
  assert.deepEqual(bindsSent, ['SdtOriginalInt']);
  assert.deepEqual(copies, [{ nom: 'SdtCopiaB', descrip: 'Copia B.', estado: 'Validado' }]);
});

test('listExistingCopies (Oracle, apiMode=interna) consulta BTCBS025 con BSSDTNATIV=0 (numerico)', async () => {
  let sqlSent = null, bindsSent = null;
  const fakeConn = {
    execute: async (sql, binds) => { sqlSent = sql; bindsSent = binds; return { rows: [{ BSSDTNAME: 'SdtCopiaInterna ', BSSDTDESC: 'Copia interna.', BSSDTSTAT: 'Validado' }] }; },
    close: async () => {},
  };
  const feature = createSdtGenFeature(fakeDeps({ getOra: async () => ({ conn: fakeConn, oracledb: { OUT_FORMAT_OBJECT: 1 } }) }));
  const copies = await feature.listExistingCopies('oracle', {}, 'V4', 'SdtOriginalInt', 'interna');
  assert.match(sqlSent, /FROM BTCBS025 WHERE BSSDTNATIV\s*=\s*0\s+AND\s+TRIM\(BSSDTINTNM\)\s*=\s*:1/i);
  assert.deepEqual(bindsSent, ['SdtOriginalInt']);
  assert.deepEqual(copies, [{ nom: 'SdtCopiaInterna', descrip: 'Copia interna.', estado: 'Validado' }]);
});

test('listExistingCopies devuelve [] sin consultar la base si no hay nomInt', async () => {
  let touched = false;
  const feature = createSdtGenFeature(fakeDeps({
    getPool: async () => { touched = true; throw new Error('no deberia llamarse'); },
    getOra: async () => { touched = true; throw new Error('no deberia llamarse'); },
  }));
  const copiesVacio = await feature.listExistingCopies('sqlserver', {}, 'V3', '');
  const copiesNull = await feature.listExistingCopies('sqlserver', {}, 'V3', null);
  assert.deepEqual(copiesVacio, []);
  assert.deepEqual(copiesNull, []);
  assert.equal(touched, false);
});

test('suggestField consulta candidatos por el nombre recibido y devuelve la combinacion mas frecuente', async () => {
  const calls = [];
  const feature = createSdtGenFeature(fakeDeps({
    queryFieldCandidates: async (...a) => {
      calls.push(a);
      return [
        { largo: '11', dsc: 'CUIT del titular.' },
        { largo: '11', dsc: 'CUIT del titular.' },
      ];
    },
  }));
  const suggestion = await feature.suggestField('oracle', {}, 'V4', 'cuit', 'publica');
  assert.deepEqual(calls, [['oracle', {}, 'V4', 'cuit', 'publica']]);
  assert.equal(suggestion.shape.largo, '11');
  assert.equal(suggestion.shape.dsc, 'CUIT del titular.');
  assert.equal(suggestion.count, 2);
});

test('suggestField devuelve null si el unico candidato tiene los defaults de "recien definido"', async () => {
  const feature = createSdtGenFeature(fakeDeps({
    queryFieldCandidates: async () => [{ largo: '0', dsc: 'campoNuevo' }],
  }));
  const suggestion = await feature.suggestField('oracle', {}, 'V4', 'campoNuevo', 'publica');
  assert.equal(suggestion, null);
});

function fakeMssqlTransaction(pool, log) {
  return class FakeTransaction {
    constructor(p) { this.pool = p; }
    async begin() { log.push('begin'); }
    async commit() { log.push('commit'); }
    async rollback() { log.push('rollback'); }
  };
}

test('executeSdtCopy (SQL Server) corre DELETE+INSERT en una transaccion y hace commit', async () => {
  const log = [];
  const queriesRun = [];
  const FakeTransaction = fakeMssqlTransaction(null, log);
  const FakeRequest = class { constructor(tx) { this.tx = tx; } async query(sql) { queriesRun.push(sql); } };
  const feature = createSdtGenFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
  }));
  const src = sourceSdt();
  const { bti025Copy, bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA', 'campoB']));
  const result = await feature.executeSdtCopy('sqlserver', {}, 'V3', 'SdtCopia', bti025Copy, bti026Copy);
  assert.equal(result.ok, true);
  assert.ok(result.statementsRun > 0);
  assert.deepEqual(log, ['begin', 'commit']);
  assert.ok(queriesRun.some(q => q.startsWith('DELETE FROM BTI025')));
  assert.ok(queriesRun.some(q => q.startsWith('INSERT INTO BTI025')));
});

test('executeSdtCopy (SQL Server) no manda punto y coma final en ninguna sentencia', async () => {
  const log = [];
  const queriesRun = [];
  const FakeTransaction = fakeMssqlTransaction(null, log);
  const FakeRequest = class { async query(sql) { queriesRun.push(sql); } };
  const feature = createSdtGenFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
  }));
  const src = sourceSdt();
  const { bti025Copy, bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA', 'campoB']));
  await feature.executeSdtCopy('sqlserver', {}, 'V3', 'SdtCopia', bti025Copy, bti026Copy);
  assert.ok(queriesRun.length > 0);
  assert.deepEqual(queriesRun.filter(q => /;\s*$/.test(q)), [], 'ninguna sentencia debe terminar en ;');
});

test('executeSdtCopy (Oracle) no manda punto y coma final en ninguna sentencia', async () => {
  const sqls = [];
  const fakeConn = {
    execute: async (sql) => { sqls.push(sql); },
    commit: async () => {}, rollback: async () => {}, close: async () => {},
  };
  const feature = createSdtGenFeature(fakeDeps({ getOra: async () => ({ conn: fakeConn, oracledb: {} }) }));
  const src = sourceSdt();
  const { bti025Copy, bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA', 'campoB']));
  await feature.executeSdtCopy('oracle', {}, 'V4', 'SdtCopia', bti025Copy, bti026Copy);
  assert.ok(sqls.length > 0);
  assert.deepEqual(sqls.filter(q => /;\s*$/.test(q)), [], 'ORA-00911: ninguna sentencia debe terminar en ;');
});

test('executeSdtCopy (SQL Server) hace rollback si un INSERT falla', async () => {
  const log = [];
  const FakeTransaction = fakeMssqlTransaction(null, log);
  const FakeRequest = class { async query(sql) { if (sql.startsWith('INSERT INTO BTI026')) throw new Error('fallo simulado'); } };
  const feature = createSdtGenFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
  }));
  const src = sourceSdt();
  const { bti025Copy, bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA']));
  await assert.rejects(
    () => feature.executeSdtCopy('sqlserver', {}, 'V3', 'SdtCopia', bti025Copy, bti026Copy),
    /fallo simulado/
  );
  assert.deepEqual(log, ['begin', 'rollback']);
});

test('executeSdtCopy (Oracle) corre con autoCommit false y confirma con commit', async () => {
  const calls = [];
  const fakeConn = {
    execute: async (sql, binds, opts) => { calls.push({ sql, opts }); },
    commit: async () => { calls.push({ action: 'commit' }); },
    rollback: async () => { calls.push({ action: 'rollback' }); },
    close: async () => { calls.push({ action: 'close' }); },
  };
  const feature = createSdtGenFeature(fakeDeps({ getOra: async () => ({ conn: fakeConn, oracledb: {} }) }));
  const src = sourceSdt();
  const { bti025Copy, bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA']));
  const result = await feature.executeSdtCopy('oracle', {}, 'V4', 'SdtCopia', bti025Copy, bti026Copy);
  assert.equal(result.ok, true);
  assert.ok(calls.every(c => !c.sql || c.opts.autoCommit === false));
  assert.equal(calls[calls.length - 2].action, 'commit');
  assert.equal(calls[calls.length - 1].action, 'close');
});

test('executeSdtCopy (Oracle) hace rollback y cierra la conexion si falla', async () => {
  const calls = [];
  const fakeConn = {
    execute: async (sql) => { if (sql.startsWith('DELETE')) return; throw new Error('fallo oracle'); },
    commit: async () => { calls.push('commit'); },
    rollback: async () => { calls.push('rollback'); },
    close: async () => { calls.push('close'); },
  };
  const feature = createSdtGenFeature(fakeDeps({ getOra: async () => ({ conn: fakeConn, oracledb: {} }) }));
  const src = sourceSdt();
  const { bti025Copy, bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA']));
  await assert.rejects(
    () => feature.executeSdtCopy('oracle', {}, 'V4', 'SdtCopia', bti025Copy, bti026Copy),
    /fallo oracle/
  );
  assert.deepEqual(calls, ['rollback', 'close']);
});

test('executeSdtCopy (SQL Server) preserva error original si rollback tambien falla', async () => {
  const log = [];
  const FakeTransaction = fakeMssqlTransaction(null, log);
  const FakeRequest = class { async query(sql) { if (sql.startsWith('INSERT INTO BTI025')) throw new Error('error en insert'); } };
  let rollbackCalled = false;
  FakeTransaction.prototype.rollback = async function() { rollbackCalled = true; throw new Error('rollback fallo'); };
  const feature = createSdtGenFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
  }));
  const src = sourceSdt();
  const { bti025Copy, bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA']));
  let caughtError;
  try {
    await feature.executeSdtCopy('sqlserver', {}, 'V3', 'SdtCopia', bti025Copy, bti026Copy);
  } catch (e) {
    caughtError = e;
  }
  assert.ok(caughtError, 'debe lanzar error');
  assert.match(caughtError.message, /error en insert/);
  assert.match(caughtError.message, /rollback fallo/);
  assert.match(caughtError.message, /La transaccion puede haber quedado abierta/);
  assert.equal(caughtError.cause?.message, 'error en insert');
  assert.equal(rollbackCalled, true);
});

test('executeSdtCopy (Oracle) preserva error original si rollback tambien falla y cierra la conexion', async () => {
  const calls = [];
  let rollbackCalled = false;
  const fakeConn = {
    execute: async (sql) => { throw new Error('execute fallo'); },
    commit: async () => { calls.push('commit'); },
    rollback: async () => { rollbackCalled = true; throw new Error('rollback fallo'); },
    close: async () => { calls.push('close'); },
  };
  const feature = createSdtGenFeature(fakeDeps({ getOra: async () => ({ conn: fakeConn, oracledb: {} }) }));
  const src = sourceSdt();
  const { bti025Copy, bti026Copy } = buildSdtCopy(src, 'SdtCopia', editedAll(src, ['campoA']));
  let caughtError;
  try {
    await feature.executeSdtCopy('oracle', {}, 'V4', 'SdtCopia', bti025Copy, bti026Copy);
  } catch (e) {
    caughtError = e;
  }
  assert.ok(caughtError, 'debe lanzar error');
  assert.match(caughtError.message, /execute fallo/);
  assert.match(caughtError.message, /rollback fallo/);
  assert.match(caughtError.message, /La transaccion puede haber quedado abierta/);
  assert.equal(caughtError.cause?.message, 'execute fallo');
  assert.equal(rollbackCalled, true);
  assert.deepEqual(calls, ['close']);
});

function fakeReq(method, url, body) { return { method, url, _body: body }; }
function fakeRes() {
  const res = { statusCode: null, body: null };
  return res;
}
function fakeHelpers(res) {
  return {
    readBody: async (req) => req._body,
    json: (status, obj) => { res.statusCode = status; res.body = obj; },
  };
}

test('handleApi POST /api/sdtgen/list responde con los nombres', async () => {
  const feature = createSdtGenFeature(fakeDeps({
    getPool: async () => ({ pool: { request: () => ({ query: async () => ({ recordset: [{ BTISDTNom: 'SdtA' }] }) }) }, mssql: {} }),
  }));
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('POST', '/api/sdtgen/list', { platform: 'sqlserver', db: {} }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.deepEqual(res.body, { ok: true, names: ['SdtA'] });
});

test('handleApi POST /api/sdtgen/sdt responde con bti025 y bti026', async () => {
  const feature = createSdtGenFeature(fakeDeps({
    queryBti025: async () => ({ nom: 'SdtOriginal', nativo: 'S' }),
    queryBti026: async () => ([{ elemnom: 'campoA' }]),
  }));
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('POST', '/api/sdtgen/sdt', { platform: 'sqlserver', db: {}, version: 'V3', nom: 'SdtOriginal' }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.bti025.nom, 'SdtOriginal');
  assert.equal(res.body.bti026[0].elemnom, 'campoA');
});

test('handleApi POST /api/sdtgen/sdt responde ok:false si el SDT no existe', async () => {
  const feature = createSdtGenFeature(fakeDeps({ queryBti025: async () => null }));
  const res = fakeRes();
  await feature.handleApi(fakeReq('POST', '/api/sdtgen/sdt', { platform: 'sqlserver', db: {}, version: 'V3', nom: 'NoExiste' }), res, fakeHelpers(res));
  assert.equal(res.body.ok, false);
  assert.match(res.body.message, /NoExiste/);
});

test('handleApi POST /api/sdtgen/existing-copies responde con las copias no nativas encontradas', async () => {
  const feature = createSdtGenFeature(fakeDeps({
    getPool: async () => ({
      pool: { request: () => ({ input: function() { return this; }, query: async () => ({ recordset: [{ BTISDTNom: 'SdtCopiaA', BTISDTDescrip: 'Copia.', BTISDTEstado: 'Validado' }] }) }) },
      mssql: { VarChar: () => 'varchar' },
    }),
  }));
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('POST', '/api/sdtgen/existing-copies', { platform: 'sqlserver', db: {}, version: 'V3', nomint: 'SdtOriginalInt' }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.deepEqual(res.body, { ok: true, copies: [{ nom: 'SdtCopiaA', descrip: 'Copia.', estado: 'Validado' }] });
});

test('handleApi POST /api/sdtgen/suggest-field responde con la sugerencia', async () => {
  const feature = createSdtGenFeature(fakeDeps({
    queryFieldCandidates: async () => [{ largo: '8', dsc: 'Fecha de nacimiento.' }],
  }));
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('POST', '/api/sdtgen/suggest-field', {
    platform: 'oracle', db: {}, version: 'V4', apiMode: 'publica', nombre: 'FechaNacimiento',
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.suggestion.shape.largo, '8');
  assert.equal(res.body.suggestion.shape.dsc, 'Fecha de nacimiento.');
});

test('handleApi POST /api/sdtgen/suggest-field responde con suggestion:null si no hay coincidencias utiles', async () => {
  const feature = createSdtGenFeature(fakeDeps({ queryFieldCandidates: async () => [] }));
  const res = fakeRes();
  await feature.handleApi(fakeReq('POST', '/api/sdtgen/suggest-field', {
    platform: 'oracle', db: {}, version: 'V4', nombre: 'Inexistente',
  }), res, fakeHelpers(res));
  assert.deepEqual(res.body, { ok: true, suggestion: null });
});

test('handleApi POST /api/sdtgen/generate responde con el script', async () => {
  const feature = createSdtGenFeature(fakeDeps());
  const res = fakeRes();
  const src = sourceSdt();
  const handled = await feature.handleApi(fakeReq('POST', '/api/sdtgen/generate', {
    version: 'V3', nuevoNombre: 'SdtCopia',
    sourceBti025: src.bti025, sourceBti026: src.bti026,
    editedFields: editedAll(src, ['campoA', 'campoB']),
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.script.includes("DELETE FROM BTI025 WHERE BTISDTNom=N'SdtCopia'"));
});

test('handleApi POST /api/sdtgen/generate rechaza un nuevoNombre invalido', async () => {
  const feature = createSdtGenFeature(fakeDeps());
  const res = fakeRes();
  const src = sourceSdt();
  await feature.handleApi(fakeReq('POST', '/api/sdtgen/generate', {
    version: 'V3', nuevoNombre: "Sdt'; DROP TABLE BTI025--",
    sourceBti025: src.bti025, sourceBti026: src.bti026,
    editedFields: editedAll(src, ['campoA']),
  }), res, fakeHelpers(res));
  assert.equal(res.body.ok, false);
  assert.match(res.body.message, /nombre/i);
});

test('handleApi POST /api/sdtgen/generate rechaza una descripcion editada con comillas', async () => {
  const feature = createSdtGenFeature(fakeDeps());
  const res = fakeRes();
  const src = sourceSdt();
  await feature.handleApi(fakeReq('POST', '/api/sdtgen/generate', {
    version: 'V3', nuevoNombre: 'SdtCopia',
    sourceBti025: src.bti025, sourceBti026: src.bti026,
    editedFields: [edited(src, 'campoA', { elemdsc: "con ' apostrofo" })],
  }), res, fakeHelpers(res));
  assert.equal(res.body.ok, false);
  assert.match(res.body.message, /Descripcion invalida/);
});

test('handleApi POST /api/sdtgen/execute re-consulta el SDT origen en la base, aplica ediciones y ejecuta', async () => {
  const log = [];
  const queriesRun = [];
  const q25Calls = [], q26Calls = [];
  const FakeTransaction = fakeMssqlTransaction(null, log);
  const FakeRequest = class { async query(sql) { queriesRun.push(sql); } };
  const feature = createSdtGenFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
    queryBti025: async (...a) => { q25Calls.push(a); return sourceSdt().bti025; },
    queryBti026: async (...a) => { q26Calls.push(a); return sourceSdt().bti026; },
  }));
  const res = fakeRes();
  const src = sourceSdt();
  const handled = await feature.handleApi(fakeReq('POST', '/api/sdtgen/execute', {
    platform: 'sqlserver', db: {}, version: 'V3', nom: 'SdtOriginal', nuevoNombre: 'SdtCopia',
    editedFields: [edited(src, 'campoA', { elemnom: 'campoRenombrado', elemdsc: 'Descripcion editada.' })],
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.statementsRun > 0);
  assert.deepEqual(q25Calls, [['sqlserver', {}, 'V3', 'SdtOriginal', undefined]]);
  assert.deepEqual(q26Calls, [['sqlserver', {}, 'V3', 'SdtOriginal', undefined]]);
  assert.ok(queriesRun.some(s => s.includes("N'campoRenombrado'")), 'debe usar el nombre editado');
  assert.ok(queriesRun.some(s => s.includes("N'Descripcion editada.'")), 'debe usar la descripcion editada');
});

test('handleApi POST /api/sdtgen/execute rechaza un nuevoNombre invalido sin tocar la base', async () => {
  const invalidos = ['Sdt Copia', "Sdt'Copia", '1SdtCopia', '', 'A'.repeat(101)];
  const src = sourceSdt();
  for (const nuevoNombre of invalidos) {
    let touched = false;
    const feature = createSdtGenFeature(fakeDeps({
      getPool: async () => { touched = true; throw new Error('no deberia llamarse'); },
      getOra: async () => { touched = true; throw new Error('no deberia llamarse'); },
      queryBti025: async () => { touched = true; return src.bti025; },
      queryBti026: async () => { touched = true; return src.bti026; },
    }));
    const res = fakeRes();
    await feature.handleApi(fakeReq('POST', '/api/sdtgen/execute', {
      platform: 'sqlserver', db: {}, version: 'V3', nom: 'SdtOriginal', nuevoNombre,
      editedFields: editedAll(src, ['campoA']),
    }), res, fakeHelpers(res));
    assert.equal(res.body.ok, false, 'debe rechazar: ' + JSON.stringify(nuevoNombre));
    assert.match(res.body.message, /nombre/i);
    assert.equal(touched, false, 'no debe tocar la base para: ' + JSON.stringify(nuevoNombre));
  }
});

test('handleApi POST /api/sdtgen/execute rechaza ediciones de campo invalidas re-consultadas de la base', async () => {
  const src = sourceSdt();
  let executed = false;
  const feature = createSdtGenFeature(fakeDeps({
    getPool: async () => { executed = true; throw new Error('no deberia llamarse'); },
    queryBti025: async () => src.bti025,
    queryBti026: async () => src.bti026,
  }));
  const res = fakeRes();
  await feature.handleApi(fakeReq('POST', '/api/sdtgen/execute', {
    platform: 'sqlserver', db: {}, version: 'V3', nom: 'SdtOriginal', nuevoNombre: 'SdtCopia',
    editedFields: [edited(src, 'campoA', { elemnom: '1invalido' })],
  }), res, fakeHelpers(res));
  assert.equal(res.body.ok, false);
  assert.match(res.body.message, /Nombre de campo invalido/);
  assert.equal(executed, false);
});

test('handleApi POST /api/sdtgen/execute responde ok:false si el SDT origen ya no existe', async () => {
  const src = sourceSdt();
  let executed = false;
  const feature = createSdtGenFeature(fakeDeps({
    getPool: async () => { executed = true; throw new Error('no deberia llamarse'); },
    queryBti025: async () => null,
  }));
  const res = fakeRes();
  await feature.handleApi(fakeReq('POST', '/api/sdtgen/execute', {
    platform: 'sqlserver', db: {}, version: 'V3', nom: 'Borrado', nuevoNombre: 'SdtCopia',
    editedFields: editedAll(src, ['campoA']),
  }), res, fakeHelpers(res));
  assert.equal(res.body.ok, false);
  assert.equal(res.body.message, 'SDT no encontrado: Borrado');
  assert.equal(executed, false);
});

test('handleApi devuelve false para una ruta desconocida', async () => {
  const feature = createSdtGenFeature(fakeDeps());
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('GET', '/api/otra-cosa', {}), res, fakeHelpers(res));
  assert.equal(handled, false);
});
