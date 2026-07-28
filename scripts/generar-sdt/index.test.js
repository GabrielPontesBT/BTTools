const test = require('node:test');
const assert = require('node:assert/strict');

const { buildSdtCopy, generateSdtScript } = require('./index.js');

function sourceSdt() {
  return {
    bti025: { nom: 'SdtOriginal', version: '2', descrip: 'Descripcion original.', nativo: 'S', fecha: new Date('2025-01-01'), nomint: 'SdtOriginalInt', estado: 'Validado', tipo: '0', namespace: 'uy.com.dlya' },
    bti026: [
      { elemnom: 'campoA', elemtipo: 'String', elemlargo: '50', elemcat: 'B', elemdsc: 'Campo A.', elemsdt: '' },
      { elemnom: 'campoB', elemtipo: 'Int', elemlargo: '0', elemcat: 'B', elemdsc: 'Campo B.', elemsdt: '' },
      { elemnom: 'campoC', elemtipo: 'SdtAnidado', elemlargo: '0', elemcat: 'B', elemdsc: 'Campo anidado.', elemsdt: 'SdtAnidado' },
    ],
  };
}

test('buildSdtCopy fuerza Nativo=N y Version=1 en la copia, hereda el resto de BTI025', () => {
  const { bti025Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA', 'campoB', 'campoC']);
  assert.equal(bti025Copy.nativo, 'N');
  assert.equal(bti025Copy.version, '1');
  assert.equal(bti025Copy.nom, 'SdtCopia');
  assert.equal(bti025Copy.namespace, 'uy.com.dlya');
  assert.equal(bti025Copy.descrip, 'Descripcion original.');
});

test('buildSdtCopy respeta el orden de fieldsOrdenados y asigna posi consecutivo', () => {
  const { bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoC', 'campoA']);
  assert.deepEqual(bti026Copy.map(f => f.elemnom), ['campoC', 'campoA']);
  assert.equal(bti026Copy[0].posi, '1');
  assert.equal(bti026Copy[1].posi, '2');
});

test('buildSdtCopy excluye campos no presentes en fieldsOrdenados', () => {
  const { bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA']);
  assert.equal(bti026Copy.length, 1);
  assert.equal(bti026Copy[0].elemnom, 'campoA');
});

test('buildSdtCopy conserva el SDT anidado referenciado sin renombrarlo', () => {
  const { bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoC']);
  assert.equal(bti026Copy[0].elemsdt, 'SdtAnidado');
  assert.equal(bti026Copy[0].elemtipo, 'SdtAnidado');
});

test('buildSdtCopy lanza si fieldsOrdenados referencia un campo inexistente', () => {
  assert.throws(() => buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoZ']), /campoZ/);
});

test('generateSdtScript V3 emite DELETE antes que INSERT y usa el nombre nuevo', () => {
  const { bti025Copy, bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA', 'campoB']);
  const script = generateSdtScript('SdtCopia', bti025Copy, bti026Copy, 'V3', 'both');
  const deleteIdx = script.indexOf("DELETE FROM BTI025 WHERE BTISDTNom=N'SdtCopia'");
  const insertIdx = script.indexOf("INSERT INTO BTI025");
  assert.ok(deleteIdx >= 0, 'debe incluir el DELETE de BTI025 con el nombre nuevo');
  assert.ok(insertIdx > deleteIdx, 'el INSERT debe venir despues del DELETE');
  assert.ok(script.includes("N'N'"), 'debe insertar Nativo=N');
  assert.match(script, /INSERT INTO BTI026 \([^)]+\) VALUES\(N'SdtCopia', N'campoA'/);
});

test('generateSdtScript V4 usa columnas y comillas de Oracle', () => {
  const { bti025Copy, bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA']);
  const script = generateSdtScript('SdtCopia', bti025Copy, bti026Copy, 'V4', 'insert');
  assert.ok(!/[(,]\s*N'/.test(script), 'V4 no debe usar el prefijo N de SQL Server');
  assert.match(script, /INSERT INTO BTI026 \([^)]+\) VALUES\('SdtCopia', '1', 'campoA'/);
});

const { createSdtGenFeature } = require('./index.js');

function fakeDeps(overrides) {
  return Object.assign({
    getPool: async () => { throw new Error('getPool no configurado en el fake'); },
    getOra: async () => { throw new Error('getOra no configurado en el fake'); },
    queryBti025: async () => { throw new Error('queryBti025 no configurado en el fake'); },
    queryBti026: async () => { throw new Error('queryBti026 no configurado en el fake'); },
  }, overrides || {});
}

test('listSdtNames (SQL Server) devuelve nombres recortados en el orden de la query', async () => {
  const fakePool = { request: () => ({ query: async () => ({ recordset: [{ BTISDTNom: 'SdtA ' }, { BTISDTNom: 'SdtB' }] }) }) };
  const feature = createSdtGenFeature(fakeDeps({ getPool: async () => ({ pool: fakePool, mssql: {} }) }));
  const names = await feature.listSdtNames('sqlserver', {});
  assert.deepEqual(names, ['SdtA', 'SdtB']);
});

test('listSdtNames (Oracle) cierra la conexion y devuelve nombres recortados', async () => {
  let closed = false;
  const fakeConn = { execute: async () => ({ rows: [{ BTISDTNOM: 'SdtC ' }] }), close: async () => { closed = true; } };
  const feature = createSdtGenFeature(fakeDeps({ getOra: async () => ({ conn: fakeConn, oracledb: { OUT_FORMAT_OBJECT: 1 } }) }));
  const names = await feature.listSdtNames('oracle', {});
  assert.deepEqual(names, ['SdtC']);
  assert.equal(closed, true);
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
  const { bti025Copy, bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA', 'campoB']);
  const result = await feature.executeSdtCopy('sqlserver', {}, 'V3', 'SdtCopia', bti025Copy, bti026Copy);
  assert.equal(result.ok, true);
  assert.ok(result.statementsRun > 0);
  assert.deepEqual(log, ['begin', 'commit']);
  assert.ok(queriesRun.some(q => q.startsWith('DELETE FROM BTI025')));
  assert.ok(queriesRun.some(q => q.startsWith('INSERT INTO BTI025')));
});

test('executeSdtCopy (SQL Server) hace rollback si un INSERT falla', async () => {
  const log = [];
  const FakeTransaction = fakeMssqlTransaction(null, log);
  const FakeRequest = class { async query(sql) { if (sql.startsWith('INSERT INTO BTI026')) throw new Error('fallo simulado'); } };
  const feature = createSdtGenFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
  }));
  const { bti025Copy, bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA']);
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
  const { bti025Copy, bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA']);
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
  const { bti025Copy, bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA']);
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
  const { bti025Copy, bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA']);
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
  const { bti025Copy, bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA']);
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

test('handleApi POST /api/sdtgen/generate responde con el script', async () => {
  const feature = createSdtGenFeature(fakeDeps());
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('POST', '/api/sdtgen/generate', {
    version: 'V3', nuevoNombre: 'SdtCopia',
    sourceBti025: sourceSdt().bti025, sourceBti026: sourceSdt().bti026,
    fieldsOrdenados: ['campoA', 'campoB'],
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.script.includes("DELETE FROM BTI025 WHERE BTISDTNom=N'SdtCopia'"));
});

test('handleApi POST /api/sdtgen/execute delega en executeSdtCopy', async () => {
  const log = [];
  const FakeTransaction = fakeMssqlTransaction(null, log);
  const FakeRequest = class { async query() {} };
  const feature = createSdtGenFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
  }));
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('POST', '/api/sdtgen/execute', {
    platform: 'sqlserver', db: {}, version: 'V3', nuevoNombre: 'SdtCopia',
    sourceBti025: sourceSdt().bti025, sourceBti026: sourceSdt().bti026,
    fieldsOrdenados: ['campoA'],
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.statementsRun > 0);
});

test('handleApi devuelve false para una ruta desconocida', async () => {
  const feature = createSdtGenFeature(fakeDeps());
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('GET', '/api/otra-cosa', {}), res, fakeHelpers(res));
  assert.equal(handled, false);
});
