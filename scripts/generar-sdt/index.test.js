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
