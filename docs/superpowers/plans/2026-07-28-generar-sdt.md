# Generar SDT Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 5th wizard action, "Generar SDT", that lets Gabriel pick an existing SDT from `BTI025`/`BTI026`, remove/reorder its fields, and produce (and optionally execute) the DELETE+INSERT script for a non-native copy under a new name.

**Architecture:** New self-contained backend module `scripts/generar-sdt/index.js` (same `createXxxFeature(deps).handleApi(req, res, helpers)` shape as `scripts/generar-collections/index.js`), wired into `setup.js` next to `collectionFeature`. It reuses `sg_queryBti025`/`sg_queryBti026`/`sg_getPool`/`sg_getOra` already defined in `setup.js` (injected as deps, never duplicated) and `sg_generateSdtScript` already exported from `scripts/generar-scripts/index.js`. New frontend action `sdtgen` reuses the existing steps 1-3 (acción/versión/conexión) and adds 3 new panels for steps 4-6.

**Tech Stack:** Vanilla Node.js (`http`, no framework), vanilla frontend JS (`public/wizard-doc.js`), `mssql`/`oracledb` npm packages already vendored under `V3/node_modules`/`V4/node_modules`, `node:test` + `node:assert/strict` for tests (no test framework dependency, matches `scripts/validar-doc/index.test.js`).

## Global Constraints

- No new npm dependencies. Reuse `mssql`/`oracledb` already resolved via `sg_findModule`.
- Backend query/transaction code lives in `scripts/generar-sdt/index.js`, injected with deps from `setup.js` — never re-implement `sg_getPool`/`sg_getOra`/`sg_queryBti025`/`sg_queryBti026` inside the new module.
- Reuse `sg_generateSdtScript` from `scripts/generar-scripts/index.js` for script text generation — do not duplicate the column lists or quoting logic.
- Nested SDTs referenced by a field (`elemsdt`) are copied as-is, never edited recursively (per approved spec).
- The new SDT copy always forces `BTISDTNativo='N'` and `BTISDTVersion='1'`; all other BTI025 metadata is inherited from the source.
- "Ejecutar contra la conexión activa" always requires an explicit `confirm()` before firing the request, and always runs DELETE+INSERT inside one transaction with rollback on any failure.
- Run tests with `node --test scripts/generar-sdt/index.test.js` after every backend task.
- Follow the existing route-naming convention: `/api/sdtgen/<route>` (mirrors `/api/collection/<route>`, not the older inline `/sg/api/<route>` style).

---

## File Structure

- **Create:** `scripts/generar-sdt/index.js` — `createSdtGenFeature(deps)` factory: `listSdtNames`, `executeSdtCopy`, `handleApi`; plus standalone pure exports `buildSdtCopy`, `generateSdtScript`.
- **Create:** `scripts/generar-sdt/index.test.js` — unit tests for all of the above with fake pool/connection/transaction objects (no real DB, no real server).
- **Modify:** `setup.js` — require the new module, instantiate `sdtGenFeature` with real deps, dispatch `sdtGenFeature.handleApi` in the request handler.
- **Modify:** `public/index.html` — new 5th home tile, 3 new panels (`p-sdtbase`, `p-sdtedit`, `p-sdtresult`).
- **Modify:** `public/wizard-doc.js` — `pick`/`updateStepLabels`/`panelId`/`show`/`foot`/`goNext` branches for `S.action === 'sdtgen'`, plus new `sdtgen*` client functions.
- **Modify:** `public/styles.css` — new `.sdtgen-list`/`.sdtgen-row`/`.sdtgen-fields`/`.sdtgen-field-item` rules.

---

### Task 1: Pure SDT-copy logic (`buildSdtCopy` + `generateSdtScript`)

**Files:**
- Create: `scripts/generar-sdt/index.js`
- Test: `scripts/generar-sdt/index.test.js`

**Interfaces:**
- Consumes: `sg_generateSdtScript(sdt, mode, version)` from `../generar-scripts/index.js` (existing, signature unchanged — `sdt = { nom, bti025, bti026 }`, `mode` is `'delete'|'insert'|'both'`, `version` is `'V3'|'V4'`).
- Produces: `buildSdtCopy(sourceSdt, nuevoNombre, fieldsOrdenados)` → `{ bti025Copy, bti026Copy }`, where `sourceSdt = { bti025, bti026 }` (same shape `sg_queryBti025`/`sg_queryBti026` return) and `fieldsOrdenados` is an array of `elemnom` strings in the desired final order (a subset of `sourceSdt.bti026`). `generateSdtScript(nuevoNombre, bti025Copy, bti026Copy, version, mode)` → script text (string). Later tasks (4) call both.

- [ ] **Step 1: Write the failing tests**

```js
// scripts/generar-sdt/index.test.js
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
  assert.ok(!script.includes("N'"), 'V4 no debe usar el prefijo N de SQL Server');
  assert.match(script, /INSERT INTO BTI026 \([^)]+\) VALUES\('SdtCopia', '1', 'campoA'/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/generar-sdt/index.test.js`
Expected: FAIL — `Cannot find module './index.js'` (file doesn't exist yet).

- [ ] **Step 3: Write the minimal implementation**

```js
// scripts/generar-sdt/index.js
'use strict';

const { sg_generateSdtScript } = require('../generar-scripts/index.js');

function buildSdtCopy(sourceSdt, nuevoNombre, fieldsOrdenados) {
  const b25 = sourceSdt.bti025 || {};
  const bti025Copy = Object.assign({}, b25, { nom: nuevoNombre, nativo: 'N', version: '1' });

  const byName = new Map((sourceSdt.bti026 || []).map(f => [f.elemnom, f]));
  const bti026Copy = fieldsOrdenados.map((elemnom, idx) => {
    const f = byName.get(elemnom);
    if (!f) throw new Error('Campo no encontrado en el SDT original: ' + elemnom);
    return Object.assign({}, f, { posi: String(idx + 1) });
  });

  return { bti025Copy, bti026Copy };
}

function generateSdtScript(nuevoNombre, bti025Copy, bti026Copy, version, mode) {
  return sg_generateSdtScript({ nom: nuevoNombre, bti025: bti025Copy, bti026: bti026Copy }, mode || 'both', version);
}

module.exports = { buildSdtCopy, generateSdtScript };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/generar-sdt/index.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/generar-sdt/index.js scripts/generar-sdt/index.test.js
git commit -m "feat(generar-sdt): copia pura de SDT (buildSdtCopy + generateSdtScript)"
```

---

### Task 2: `listSdtNames` (lectura de todos los nombres de BTI025)

**Files:**
- Modify: `scripts/generar-sdt/index.js`
- Modify: `scripts/generar-sdt/index.test.js`

**Interfaces:**
- Consumes: `deps.getPool(db)` → `Promise<{ pool, mssql }>` (same contract as `sg_getPool` in `setup.js:386-400`); `deps.getOra(db)` → `Promise<{ conn, oracledb }>` (same contract as `sg_getOra` in `setup.js:402-414`).
- Produces: `createSdtGenFeature(deps).listSdtNames(platform, db)` → `Promise<string[]>` (trimmed, non-empty names). Task 4's `handleApi` calls this for the `/api/sdtgen/list` route.

- [ ] **Step 1: Write the failing tests**

```js
// añadir a scripts/generar-sdt/index.test.js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/generar-sdt/index.test.js`
Expected: FAIL — `feature.listSdtNames is not a function` (`createSdtGenFeature` doesn't exist yet).

- [ ] **Step 3: Write the minimal implementation**

```js
// agregar a scripts/generar-sdt/index.js, antes de module.exports
function createSdtGenFeature(deps) {
  const getPool = deps.getPool;
  const getOra = deps.getOra;
  const queryBti025 = deps.queryBti025;
  const queryBti026 = deps.queryBti026;

  async function listSdtNames(platform, db) {
    if (platform === 'sqlserver') {
      const { pool } = await getPool(db);
      const r = await pool.request().query('SELECT BTISDTNom FROM BTI025 ORDER BY BTISDTNom');
      return r.recordset.map(row => (row.BTISDTNom || '').trim()).filter(Boolean);
    }
    const { conn, oracledb } = await getOra(db);
    try {
      const r = await conn.execute('SELECT BTISDTNOM FROM BTI025 ORDER BY BTISDTNOM', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return r.rows.map(row => (row.BTISDTNOM || '').trim()).filter(Boolean);
    } finally {
      await conn.close();
    }
  }

  return { listSdtNames };
}

module.exports = { createSdtGenFeature, buildSdtCopy, generateSdtScript };
```

(Replace the earlier `module.exports = { buildSdtCopy, generateSdtScript };` line with the one above.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/generar-sdt/index.test.js`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/generar-sdt/index.js scripts/generar-sdt/index.test.js
git commit -m "feat(generar-sdt): listSdtNames para SQL Server y Oracle"
```

---

### Task 3: `executeSdtCopy` (DELETE+INSERT transaccional)

**Files:**
- Modify: `scripts/generar-sdt/index.js`
- Modify: `scripts/generar-sdt/index.test.js`

**Interfaces:**
- Consumes: `generateSdtScript` (Task 1), `deps.getPool`/`deps.getOra` (Task 2). Statements are extracted by splitting the generated script on `'\n'` and dropping blank lines — safe here because `sg_generateSdtScript` never breaks a single INSERT/DELETE statement across lines (verified in Task 1's tests).
- Produces: `createSdtGenFeature(deps).executeSdtCopy(platform, db, version, nuevoNombre, bti025Copy, bti026Copy)` → `Promise<{ ok: true, statementsRun: number }>`, throws on any failure after rolling back. Task 4's `handleApi` calls this for the `/api/sdtgen/execute` route.

- [ ] **Step 1: Write the failing tests**

```js
// añadir a scripts/generar-sdt/index.test.js

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/generar-sdt/index.test.js`
Expected: FAIL — `feature.executeSdtCopy is not a function`.

- [ ] **Step 3: Write the minimal implementation**

```js
// dentro de createSdtGenFeature en scripts/generar-sdt/index.js, junto a listSdtNames
function scriptToStatements(nuevoNombre, bti025Copy, bti026Copy, version) {
  const script = generateSdtScript(nuevoNombre, bti025Copy, bti026Copy, version, 'both');
  return script.split('\n').map(s => s.trim()).filter(Boolean);
}

async function executeSdtCopy(platform, db, version, nuevoNombre, bti025Copy, bti026Copy) {
  const statements = scriptToStatements(nuevoNombre, bti025Copy, bti026Copy, version);
  if (platform === 'sqlserver') {
    const { pool, mssql } = await getPool(db);
    const tx = new mssql.Transaction(pool);
    await tx.begin();
    try {
      for (const stmt of statements) {
        await new mssql.Request(tx).query(stmt);
      }
      await tx.commit();
      return { ok: true, statementsRun: statements.length };
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }
  const { conn } = await getOra(db);
  try {
    for (const stmt of statements) {
      await conn.execute(stmt, [], { autoCommit: false });
    }
    await conn.commit();
    return { ok: true, statementsRun: statements.length };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    await conn.close();
  }
}
```

Add `executeSdtCopy` to the object `createSdtGenFeature` returns: `return { listSdtNames, executeSdtCopy };`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/generar-sdt/index.test.js`
Expected: PASS (13 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/generar-sdt/index.js scripts/generar-sdt/index.test.js
git commit -m "feat(generar-sdt): executeSdtCopy transaccional (SQL Server y Oracle)"
```

---

### Task 4: `handleApi` (rutas HTTP del módulo)

**Files:**
- Modify: `scripts/generar-sdt/index.js`
- Modify: `scripts/generar-sdt/index.test.js`

**Interfaces:**
- Consumes: `listSdtNames`, `executeSdtCopy` (Task 2/3), `buildSdtCopy`/`generateSdtScript` (Task 1), `deps.queryBti025(platform, db, version, nom)` / `deps.queryBti026(platform, db, version, nom)` (same contracts as `sg_queryBti025`/`sg_queryBti026` in `setup.js:598-630`).
- Produces: `createSdtGenFeature(deps).handleApi(req, res, helpers)` → `Promise<boolean>`, `helpers = { readBody(req): Promise<object>, json(status, obj): void }` (same contract `setup.js` already passes to `collectionFeature.handleApi`, `setup.js:921`). Routes: `POST /api/sdtgen/list`, `POST /api/sdtgen/sdt`, `POST /api/sdtgen/generate`, `POST /api/sdtgen/execute`. Task 5 wires this into `setup.js`.

- [ ] **Step 1: Write the failing tests**

```js
// añadir a scripts/generar-sdt/index.test.js

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/generar-sdt/index.test.js`
Expected: FAIL — `feature.handleApi is not a function`.

- [ ] **Step 3: Write the minimal implementation**

```js
// dentro de createSdtGenFeature, reemplazando el "return { listSdtNames, executeSdtCopy };" anterior
async function handleApi(req, res, helpers) {
  const json = helpers.json;
  const readBody = helpers.readBody;

  if (req.method === 'POST' && req.url === '/api/sdtgen/list') {
    try {
      const body = await readBody(req);
      const names = await listSdtNames(body.platform, body.db);
      json(200, { ok: true, names });
    } catch (e) { json(200, { ok: false, message: e.message }); }
    return true;
  }

  if (req.method === 'POST' && req.url === '/api/sdtgen/sdt') {
    try {
      const body = await readBody(req);
      const bti025 = await queryBti025(body.platform, body.db, body.version, body.nom);
      if (!bti025) { json(200, { ok: false, message: 'SDT no encontrado: ' + body.nom }); return true; }
      const bti026 = await queryBti026(body.platform, body.db, body.version, body.nom);
      json(200, { ok: true, bti025, bti026 });
    } catch (e) { json(200, { ok: false, message: e.message }); }
    return true;
  }

  if (req.method === 'POST' && req.url === '/api/sdtgen/generate') {
    try {
      const body = await readBody(req);
      const { bti025Copy, bti026Copy } = buildSdtCopy(
        { bti025: body.sourceBti025, bti026: body.sourceBti026 },
        body.nuevoNombre,
        body.fieldsOrdenados
      );
      const script = generateSdtScript(body.nuevoNombre, bti025Copy, bti026Copy, body.version, body.mode || 'both');
      json(200, { ok: true, script, bti025Copy, bti026Copy });
    } catch (e) { json(200, { ok: false, message: e.message }); }
    return true;
  }

  if (req.method === 'POST' && req.url === '/api/sdtgen/execute') {
    try {
      const body = await readBody(req);
      const { bti025Copy, bti026Copy } = buildSdtCopy(
        { bti025: body.sourceBti025, bti026: body.sourceBti026 },
        body.nuevoNombre,
        body.fieldsOrdenados
      );
      const result = await executeSdtCopy(body.platform, body.db, body.version, body.nuevoNombre, bti025Copy, bti026Copy);
      json(200, Object.assign({ ok: true }, result));
    } catch (e) { json(200, { ok: false, message: e.message }); }
    return true;
  }

  return false;
}

return { listSdtNames, executeSdtCopy, handleApi };
```

Also update the bottom-of-file export to include the factory (if not already from Task 2):

```js
module.exports = { createSdtGenFeature, buildSdtCopy, generateSdtScript };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/generar-sdt/index.test.js`
Expected: PASS (19 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/generar-sdt/index.js scripts/generar-sdt/index.test.js
git commit -m "feat(generar-sdt): handleApi con rutas list/sdt/generate/execute"
```

---

### Task 5: Wire the module into `setup.js`

**Files:**
- Modify: `setup.js`

**Interfaces:**
- Consumes: `createSdtGenFeature` (Task 4), `sg_getPool`/`sg_getOra`/`sg_queryBti025`/`sg_queryBti026` (already defined in `setup.js`, unchanged), `readBody`/`json` (already defined in `setup.js:68`, `setup.js:903`).
- Produces: live routes `/api/sdtgen/list`, `/api/sdtgen/sdt`, `/api/sdtgen/generate`, `/api/sdtgen/execute` on the running server. Task 7-9's frontend calls these.

This task has no automated test — `setup.js` starts an HTTP server as a side effect of being required, so it cannot be `require()`'d from `node:test` the way `scripts/generar-sdt/index.js` can. Verification is a syntax check plus the manual browser check in Task 10.

- [ ] **Step 1: Add the require**

In `setup.js`, next to the existing collections require (`setup.js:8`):

```js
const { createCollectionFeature } = require('./scripts/generar-collections');
const { createSdtGenFeature } = require('./scripts/generar-sdt');
```

- [ ] **Step 2: Instantiate the feature next to `collectionFeature`**

In `setup.js`, right after the `collectionFeature` block (`setup.js:876-879`):

```js
const collectionFeature = createCollectionFeature({
  ROOT,
  queryMethodSchema
});

const sdtGenFeature = createSdtGenFeature({
  getPool: sg_getPool,
  getOra: sg_getOra,
  queryBti025: sg_queryBti025,
  queryBti026: sg_queryBti026,
});
```

- [ ] **Step 3: Dispatch it in the request handler**

In `setup.js`, right after the existing collections dispatch (`setup.js:921-923`):

```js
  if (await collectionFeature.handleApi(req, res, { readBody, json })) {
    return;
  }

  if (await sdtGenFeature.handleApi(req, res, { readBody, json })) {
    return;
  }
```

- [ ] **Step 4: Syntax-check the file**

Run: `node --check setup.js`
Expected: no output, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add setup.js
git commit -m "feat(generar-sdt): wire sdtGenFeature into the wizard server"
```

---

### Task 6: Frontend wizard wiring — home tile, step routing, panel skeletons

**Files:**
- Modify: `public/index.html`
- Modify: `public/wizard-doc.js`

**Interfaces:**
- Consumes: `pick`, `panelId`, `show`, `foot`, `goNext` (existing functions in `public/wizard-doc.js`, patterns at lines 125-290).
- Produces: clicking the new home tile and clicking through steps 2-3 (existing) lands on 3 new (empty-for-now) panels for steps 4/5/6, wired for Task 7/8/9 to fill in. `S.action === 'sdtgen'` becomes a recognized action across `panelId`/`show`/`foot`/`goNext`.

- [ ] **Step 1: Add the 5th home tile in `public/index.html`**

Change the `.cards` grid at `public/index.html:114` from 4 to 5 columns, and add the tile after "Generar Casos de Prueba" (`public/index.html:130-134`):

```html
      <div class="cards" style="grid-template-columns:repeat(5,1fr)">
        <div class="ccard act-ccard" onclick="pick('action','doc',this)">
          <span class="act-icon">&#128196;</span>
          <span class="ccard-title" style="font-size:var(--fs-2xl);display:block;margin-bottom:var(--sp-2)">Documentar</span>
          <span class="ccard-desc">Genera archivos .md con la documentación de los servicios Bantotal.</span>
        </div>
        <div class="ccard act-ccard" onclick="pick('action','scripts',this)">
          <span class="act-icon">&#128295;</span>
          <span class="ccard-title" style="font-size:var(--fs-2xl);display:block;margin-bottom:var(--sp-2)">Generar Scripts</span>
          <span class="ccard-desc">Genera scripts INSERT/DELETE para instalar servicios en otra base de datos.</span>
        </div>
        <div class="ccard act-ccard" onclick="pick('action','validate',this)">
          <span class="act-icon">&#128269;</span>
          <span class="ccard-title" style="font-size:var(--fs-2xl);display:block;margin-bottom:var(--sp-2)">Validar Documentos</span>
          <span class="ccard-desc">Verifica que los documentos se encuentren con el estándar correct, y que los parámetros documentados coincidan con los ejemplos de invocación/respuesta.</span>
        </div>
        <div class="ccard act-ccard" onclick="pick('action','collections',this)">
          <span class="act-icon">&#129514;</span>
          <span class="ccard-title" style="font-size:var(--fs-2xl);display:block;margin-bottom:var(--sp-2)">Generar Casos de Prueba</span>
          <span class="ccard-desc">Genera casos de uso a partir de la información de los servicios del ambiente.</span>
        </div>
        <div class="ccard act-ccard" onclick="pick('action','sdtgen',this)">
          <span class="act-icon">&#128203;</span>
          <span class="ccard-title" style="font-size:var(--fs-2xl);display:block;margin-bottom:var(--sp-2)">Generar SDT</span>
          <span class="ccard-desc">Genera una copia no nativa de un SDT existente, con campos eliminados y reordenados.</span>
        </div>
      </div>
```

- [ ] **Step 2: Add the 3 new (skeleton) panels**

Add right after the "Paso 5 Scripts" panel (`public/index.html:293`, right before the "Paso 3 Validar" comment):

```html
    <!-- Paso 4 SDT Gen: Elegir SDT base -->
    <div class="panel" id="p-sdtbase">
      <div class="ptitle">¿Qué SDT querés usar como base?</div>
      <div class="psub">Elegí un SDT existente para generar una copia no nativa a partir de él.</div>
      <div id="sdtgen-list-loading" style="display:none;font-size:var(--fs-sm);color:var(--muted);margin-bottom:var(--sp-4);align-items:center;gap:var(--sp-2)"><span class="spin dk"></span>&nbsp;Cargando SDTs...</div>
      <div class="cres" id="sdtgen-list-err"></div>
      <div class="field" style="margin-bottom:var(--sp-3)">
        <input type="text" id="sdtgen-search" placeholder="Buscar SDT por nombre..." autocomplete="off" oninput="sdtgenFilterList()">
      </div>
      <div id="sdtgen-list" class="sdtgen-list"></div>
    </div>

    <!-- Paso 5 SDT Gen: Editar copia -->
    <div class="panel" id="p-sdtedit">
      <div class="ptitle">Editá la copia de <span id="sdtgen-base-name"></span></div>
      <div class="psub">Elegí el nombre de la copia y reordená o quitá campos.</div>
      <div class="field">
        <label>Nombre del nuevo SDT</label>
        <input type="text" id="sdtgen-new-name" placeholder="ej: SdtMiCopiaPersonalizada" autocomplete="off">
      </div>
      <div class="cres" id="sdtgen-name-err"></div>
      <div id="sdtgen-fields" class="sdtgen-fields"></div>
    </div>

    <!-- Paso 6 SDT Gen: Resultado -->
    <div class="panel" id="p-sdtresult">
      <div class="ptitle">Script generado</div>
      <div class="psub">Copiá el script o ejecutalo directo contra la conexión activa.</div>
      <div class="gen-btns">
        <button class="btn btn-success btn-sm" onclick="sdtgenCopyScript()">Copiar</button>
        <button class="btn btn-outline btn-sm" onclick="sdtgenExecute()">Ejecutar contra la conexión activa</button>
      </div>
      <textarea class="sql-out" id="sdtgen-sql-out" readonly placeholder="Acá va a aparecer el script generado..."></textarea>
      <div class="cres" id="sdtgen-exec-res" style="margin-top:var(--sp-2)"></div>
    </div>
```

- [ ] **Step 3: Wire `panelId`, `updateStepLabels`, `show`, `foot`, `goNext` in `public/wizard-doc.js`**

`updateStepLabels` (`public/wizard-doc.js:138-150`) — add a branch:

```js
function updateStepLabels(action) {
  var lb4 = document.getElementById('lb4'), lb5 = document.getElementById('lb5');
  if (action === 'scripts') {
    if (lb4) lb4.textContent = 'Servicios';
    if (lb5) lb5.textContent = 'Script';
  } else if (action === 'collections') {
    if (lb4) lb4.textContent = 'API';
    if (lb5) lb5.textContent = 'Collections';
  } else if (action === 'sdtgen') {
    if (lb4) lb4.textContent = 'SDT base';
    if (lb5) lb5.textContent = 'Editar';
  } else {
    if (lb4) lb4.textContent = 'API';
    if (lb5) lb5.textContent = 'Servicios';
  }
}
```

`panelId` (`public/wizard-doc.js:185-193`) — add a branch before the final `return 'p' + step;`:

```js
function panelId(step) {
  if (step === 1) return 'p3'; // acción
  if (step === 2) return 'p1'; // versión
  if (step === 3) return 'p2'; // conexión
  if (S.action === 'validate') return 'p4v';
  if (S.action === 'collections') return step === 4 ? 'p4' : 'p4c';
  if (S.action === 'scripts') return step === 4 ? 'p4s' : 'p5s';
  if (S.action === 'sdtgen') return step === 4 ? 'p-sdtbase' : step === 5 ? 'p-sdtedit' : 'p-sdtresult';
  return 'p' + step; // doc: p4, p5, p6
}
```

`show` (`public/wizard-doc.js:195-234`) — add at the end, before the closing brace:

```js
  if (step === 4 && S.action === 'scripts' && !sgServicesLoaded) sgLoadServices();
  if (step === 4 && S.action === 'sdtgen' && !sdtgenNames.length) sdtgenLoadList();
  if (step === 5 && S.action === 'sdtgen') sdtgenRenderEditor();
  if (step === 6 && S.action === 'sdtgen') sdtgenDoGenerate();
}
```

`foot` (`public/wizard-doc.js:236-262`) — insert new branches before the final `step === 6` catch-all:

```js
  } else if (step === 4 && S.action === 'scripts') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()" disabled>Generar script &#8594;</button>';
  } else if (step === 4 && S.action === 'sdtgen') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (sdtgenSelectedName ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 5 && S.action === 'doc') {
    ftr.innerHTML = '<button class="btn btn-success" id="btn-save" onclick="saveEnv()" disabled>Guardar y finalizar &#10003;</button>';
  } else if (step === 5 && S.action === 'scripts') {
    ftr.innerHTML = '<button class="btn btn-ghost" onclick="sgReset()">&#8635; Nuevo script</button>';
  } else if (step === 5 && S.action === 'sdtgen') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()">Siguiente &#8594;</button>';
  } else if (step === 6 && S.action === 'sdtgen') {
    ftr.innerHTML = '<button class="btn btn-ghost" onclick="sdtgenReset()">&#8635; Nueva copia</button>';
  } else if (step === 6) {
    ftr.innerHTML = '';
```

`goNext` (`public/wizard-doc.js:264-281`) — insert new branches before `if (s < 6) show(s + 1);`:

```js
  if (s === 4 && S.action === 'scripts') {
    var grps = sgServiceGroups.filter(function(g) { return g.selected.size > 0; });
    if (!grps.length) { alert('Seleccioná al menos un método.'); return; }
    sgFetchAndShowOutput(grps);
    return;
  }
  if (s === 4 && S.action === 'sdtgen') { sdtgenGoToEdit(); return; }
  if (s === 5 && S.action === 'sdtgen') { sdtgenGoToResult(); return; }
  if (s < 6) show(s + 1);
```

Declare the shared state variables near the other per-flow state (`public/wizard-doc.js:20-23`, right after the scripts-flow state block):

```js
// ── Estado flujo Generar SDT ─────────────────────────────────
var sdtgenNames = [];
var sdtgenSelectedName = null;
var sdtgenBaseData = null; // { bti025, bti026 }
var sdtgenFields = []; // copia de trabajo de bti026, reordenada/filtrada
var sdtgenDragIdx = null;
```

At this point `sdtgenLoadList`, `sdtgenFilterList`, `sdtgenGoToEdit`, `sdtgenRenderEditor`, `sdtgenGoToResult`, `sdtgenDoGenerate`, `sdtgenCopyScript`, `sdtgenExecute`, `sdtgenReset` are referenced but not yet defined — Tasks 7-9 add them. This task's manual check (Step 4 below) only verifies navigation up to the point those functions get called; a `ReferenceError` there is expected until Task 7/8/9 land.

- [ ] **Step 4: Manual check — navigation reaches the new panels**

Start the wizard (`node setup.js` from repo root, or via the `run` skill / browser preview), click "Generar SDT" on the home screen, click through Versión → Conexión (Probar conexión) → should land on the empty "¿Qué SDT querés usar como base?" panel. Confirm the sidebar step labels read "SDT base" / "Editar" for steps 4/5. It is expected/acceptable that step 4 shows no list yet (console will show a `ReferenceError: sdtgenLoadList is not defined` — that's fine, resolved in Task 7).

- [ ] **Step 5: Commit**

```bash
git add public/index.html public/wizard-doc.js
git commit -m "feat(generar-sdt): wizard routing y paneles vacios para la accion sdtgen"
```

---

### Task 7: Frontend — Paso 4 "Elegir SDT base" (lista + búsqueda)

**Files:**
- Modify: `public/wizard-doc.js`
- Modify: `public/styles.css`

**Interfaces:**
- Consumes: `getDbSG()` (existing, `public/wizard-doc.js:114-117`), `S.platform`/`S.version` (existing global state), `POST /api/sdtgen/list` (Task 4/5).
- Produces: `sdtgenLoadList()`, `sdtgenRenderList(names)`, `sdtgenFilterList()` — fills `sdtgenNames`/`sdtgenSelectedName`, enables `#btn-next` once a row is selected. Task 8 reads `sdtgenSelectedName` when leaving this step.

- [ ] **Step 1: Add the CSS for the selectable list**

Append to `public/styles.css` (near the `.sg-svc-group` rules, `public/styles.css:160-171`):

```css
.sdtgen-list{border:1.5px solid var(--border);border-radius:10px;max-height:360px;overflow-y:auto}
.sdtgen-row{display:flex;align-items:center;padding:11px 16px;cursor:pointer;border-bottom:1px solid var(--border);transition:background .12s;user-select:none;font-size:var(--fs-md)}
.sdtgen-row:last-child{border-bottom:none}
.sdtgen-row:hover{background:var(--blue-l)}
.sdtgen-row.sel{background:var(--blue-l);color:var(--blue);font-weight:600}
```

- [ ] **Step 2: Add the list/search functions in `public/wizard-doc.js`**

Add after the `sdtgen*` state declarations from Task 6:

```js
async function sdtgenLoadList() {
  var loading = document.getElementById('sdtgen-list-loading'), err = document.getElementById('sdtgen-list-err');
  if (err) err.className = 'cres';
  if (loading) loading.style.display = 'flex';
  try {
    var r = await fetch('/api/sdtgen/list', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG() }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    sdtgenNames = d.names || [];
    sdtgenRenderList(sdtgenNames);
  } catch(e) {
    if (err) { err.className = 'cres show err'; err.textContent = e.message; }
  }
  if (loading) loading.style.display = 'none';
}

function sdtgenRenderList(names) {
  var container = document.getElementById('sdtgen-list');
  container.innerHTML = '';
  names.forEach(function(nom) {
    var row = document.createElement('div');
    row.className = 'sdtgen-row' + (nom === sdtgenSelectedName ? ' sel' : '');
    row.textContent = nom;
    row.onclick = function() {
      sdtgenSelectedName = nom;
      container.querySelectorAll('.sdtgen-row').forEach(function(r) { r.classList.remove('sel'); });
      row.classList.add('sel');
      var btn = document.getElementById('btn-next');
      if (btn) btn.disabled = false;
    };
    container.appendChild(row);
  });
}

function sdtgenFilterList() {
  var q = v('sdtgen-search').toLowerCase();
  var filtered = q ? sdtgenNames.filter(function(n) { return n.toLowerCase().indexOf(q) !== -1; }) : sdtgenNames;
  sdtgenRenderList(filtered);
}
```

- [ ] **Step 3: Manual check**

With the server running and a real (or test) V3/V4 connection, navigate Home → Generar SDT → Versión → Conexión → step 4 should show the full list of SDT names from `BTI025`, typing in the search box should filter it live, and clicking a row should highlight it and enable "Siguiente".

- [ ] **Step 4: Commit**

```bash
git add public/wizard-doc.js public/styles.css
git commit -m "feat(generar-sdt): paso Elegir SDT base (lista + busqueda)"
```

---

### Task 8: Frontend — Paso 5 "Editar copia" (nombre + drag-and-drop)

**Files:**
- Modify: `public/wizard-doc.js`
- Modify: `public/styles.css`

**Interfaces:**
- Consumes: `sdtgenSelectedName` (Task 7), `POST /api/sdtgen/sdt` (Task 4/5), `S.version`, `S.platform`, `getDbSG()`.
- Produces: `sdtgenGoToEdit()` (called from `goNext` at step 4, Task 6), `sdtgenRenderEditor()` (called from `show(5)`, Task 6), `sdtgenGoToResult()` (called from `goNext` at step 5, Task 6). Sets `sdtgenBaseData`/`sdtgenFields`, which Task 9 reads to build the script.

- [ ] **Step 1: Add the CSS for the draggable field list**

Append to `public/styles.css`:

```css
.sdtgen-fields{border:1.5px solid var(--border);border-radius:10px;overflow:hidden}
.sdtgen-field-item{display:flex;align-items:center;gap:var(--sp-3);padding:11px 16px;border-bottom:1px solid var(--border);background:#fff;cursor:grab}
.sdtgen-field-item:last-child{border-bottom:none}
.sdtgen-field-item.dragging{opacity:.4}
.sdtgen-field-item .sdtgen-drag-handle{color:var(--muted);font-size:16px;flex-shrink:0}
.sdtgen-field-item .sdtgen-field-name{flex:1;font-weight:600}
.sdtgen-field-item .sdtgen-field-type{color:var(--muted);font-size:var(--fs-sm)}
.sdtgen-field-item .sdtgen-field-rm{border:none;background:none;color:var(--red);font-size:18px;cursor:pointer;padding:0 4px;flex-shrink:0}
```

- [ ] **Step 2: Add the editor functions in `public/wizard-doc.js`**

```js
async function sdtgenGoToEdit() {
  if (!sdtgenSelectedName) return;
  var btn = document.getElementById('btn-next');
  if (btn) { btn.innerHTML = '<span class="spin"></span>&nbsp;Cargando...'; btn.disabled = true; }
  try {
    var r = await fetch('/api/sdtgen/sdt', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, nom: sdtgenSelectedName }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    sdtgenBaseData = { bti025: d.bti025, bti026: d.bti026 };
    sdtgenFields = (d.bti026 || []).slice();
    setVal('sdtgen-new-name', '');
    document.getElementById('sdtgen-base-name').textContent = sdtgenSelectedName;
    show(5);
  } catch(e) {
    alert('Error: ' + e.message);
  }
  if (btn) { btn.innerHTML = 'Siguiente &#8594;'; btn.disabled = false; }
}

function sdtgenRenderEditor() {
  var container = document.getElementById('sdtgen-fields');
  container.innerHTML = '';
  sdtgenFields.forEach(function(field, idx) {
    var item = document.createElement('div');
    item.className = 'sdtgen-field-item';
    item.draggable = true;
    item.innerHTML = '<span class="sdtgen-drag-handle">&#9776;</span>' +
      '<span class="sdtgen-field-name">' + field.elemnom + '</span>' +
      '<span class="sdtgen-field-type">' + (field.elemtipo || '') + '</span>' +
      '<button type="button" class="sdtgen-field-rm" title="Quitar">&times;</button>';
    item.querySelector('.sdtgen-field-rm').onclick = function() {
      sdtgenFields.splice(idx, 1);
      sdtgenRenderEditor();
    };
    item.addEventListener('dragstart', function() { sdtgenDragIdx = idx; item.classList.add('dragging'); });
    item.addEventListener('dragend', function() { item.classList.remove('dragging'); });
    item.addEventListener('dragover', function(e) { e.preventDefault(); });
    item.addEventListener('drop', function(e) {
      e.preventDefault();
      if (sdtgenDragIdx === null || sdtgenDragIdx === idx) return;
      var moved = sdtgenFields.splice(sdtgenDragIdx, 1)[0];
      sdtgenFields.splice(idx, 0, moved);
      sdtgenDragIdx = null;
      sdtgenRenderEditor();
    });
    container.appendChild(item);
  });
}

function sdtgenGoToResult() {
  var nombre = v('sdtgen-new-name');
  var err = document.getElementById('sdtgen-name-err');
  if (!nombre) { err.className = 'cres show err'; err.textContent = 'Ingresá un nombre para la copia.'; return; }
  if (nombre === sdtgenSelectedName) { err.className = 'cres show err'; err.textContent = 'El nombre debe ser distinto al del SDT base.'; return; }
  err.className = 'cres';
  show(6);
}
```

- [ ] **Step 3: Manual check**

From step 4, select an SDT and click "Siguiente" — step 5 should show the SDT's fields in their original order, each draggable. Drag a field to a new position and confirm the order updates. Click the "×" on a field and confirm it disappears from the list. Leave the name empty and click "Siguiente" — confirm it blocks with "Ingresá un nombre para la copia." Type the same name as the base SDT — confirm it blocks with the distinct-name message. Type a valid new name and click "Siguiente" — confirm it advances to step 6.

- [ ] **Step 4: Commit**

```bash
git add public/wizard-doc.js public/styles.css
git commit -m "feat(generar-sdt): paso Editar copia (nombre + reordenar/quitar campos)"
```

---

### Task 9: Frontend — Paso 6 "Resultado" (generar, copiar, ejecutar)

**Files:**
- Modify: `public/wizard-doc.js`

**Interfaces:**
- Consumes: `sdtgenBaseData`, `sdtgenFields`, `sdtgenSelectedName` (Task 8), `S.version`, `S.platform`, `getDbSG()`, `POST /api/sdtgen/generate` and `POST /api/sdtgen/execute` (Task 4/5).
- Produces: `sdtgenDoGenerate()` (called from `show(6)`, Task 6), `sdtgenCopyScript()`, `sdtgenExecute()`, `sdtgenReset()` (called from the step-6 footer button, Task 6).

- [ ] **Step 1: Add the result-step functions in `public/wizard-doc.js`**

```js
async function sdtgenDoGenerate() {
  var ta = document.getElementById('sdtgen-sql-out');
  ta.value = 'Generando...';
  try {
    var r = await fetch('/api/sdtgen/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      version: S.version,
      nuevoNombre: v('sdtgen-new-name'),
      sourceBti025: sdtgenBaseData.bti025,
      sourceBti026: sdtgenBaseData.bti026,
      fieldsOrdenados: sdtgenFields.map(function(f) { return f.elemnom; })
    }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    ta.value = d.script || '';
  } catch(e) { ta.value = 'Error: ' + e.message; }
}

function sdtgenCopyScript() {
  var ta = document.getElementById('sdtgen-sql-out'); if (!ta.value.trim()) return;
  navigator.clipboard.writeText(ta.value).then(function() {
    var res = document.getElementById('sdtgen-exec-res');
    res.className = 'cres show ok'; res.textContent = 'Copiado al portapapeles ✓';
    setTimeout(function() { res.className = 'cres'; }, 2000);
  }).catch(function() { ta.select(); document.execCommand('copy'); });
}

async function sdtgenExecute() {
  if (!confirm('Esto va a ejecutar DELETE + INSERT contra la base conectada. ¿Confirmás?')) return;
  var res = document.getElementById('sdtgen-exec-res');
  res.className = 'cres show'; res.textContent = 'Ejecutando...';
  try {
    var r = await fetch('/api/sdtgen/execute', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      platform: S.platform, db: getDbSG(), version: S.version,
      nuevoNombre: v('sdtgen-new-name'),
      sourceBti025: sdtgenBaseData.bti025,
      sourceBti026: sdtgenBaseData.bti026,
      fieldsOrdenados: sdtgenFields.map(function(f) { return f.elemnom; })
    }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    res.className = 'cres show ok'; res.textContent = 'Ejecutado correctamente (' + d.statementsRun + ' sentencias) ✓';
  } catch(e) {
    res.className = 'cres show err'; res.textContent = 'Error: ' + e.message;
  }
}

function sdtgenReset() {
  sdtgenSelectedName = null; sdtgenBaseData = null; sdtgenFields = [];
  setVal('sdtgen-search', ''); setVal('sdtgen-new-name', '');
  document.getElementById('sdtgen-sql-out').value = '';
  var res = document.getElementById('sdtgen-exec-res'); if (res) res.className = 'cres';
  show(4);
  sdtgenLoadList();
}
```

- [ ] **Step 2: Manual check**

From step 5, click "Siguiente" — step 6 should auto-generate and display the DELETE+INSERT script for the new name. Click "Copiar" — confirm the clipboard has the script and the inline "Copiado ✓" message shows. Click "Ejecutar contra la conexión activa" — confirm the `confirm()` dialog appears; cancelling does nothing; confirming runs `/api/sdtgen/execute` and shows either the success message with statement count or the DB error message. Query `BTI025`/`BTI026` directly against the test database to confirm the new SDT row and its fields exist with `BTISDTNativo='N'` and the edited field set/order. Click "Nueva copia" — confirm it returns to step 4 with the list reloaded and all sdtgen state cleared.

- [ ] **Step 3: Commit**

```bash
git add public/wizard-doc.js
git commit -m "feat(generar-sdt): paso Resultado (generar, copiar, ejecutar)"
```

---

### Task 10: End-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full backend test suite**

Run: `node --test scripts/generar-sdt/index.test.js scripts/validar-doc/index.test.js`
Expected: all tests PASS, 0 failures — confirms Task 1-4's work didn't regress the existing `validar-doc` suite (both live under `scripts/`, no shared state, but this is a cheap belt-and-suspenders check).

- [ ] **Step 2: Full manual walkthrough against a real V3 or V4 connection**

Using the `run` skill or browser preview against a real Bantotal database:
1. Home → "Generar SDT" → V3 or V4 → conexión real → probar conexión (debe dar OK).
2. Paso 4: confirmar que la lista de SDTs coincide con `SELECT BTISDTNom FROM BTI025 ORDER BY BTISDTNom` corrido a mano contra la misma base.
3. Elegir un SDT con al menos 3 campos y al menos un campo que referencie un SDT anidado si existe alguno en el ambiente.
4. Paso 5: quitar un campo, reordenar los restantes por drag-and-drop, tipear un nombre nuevo que no exista en `BTI025`.
5. Paso 6: revisar que el script generado tenga el DELETE+INSERT de `BTI025` con `Nativo='N'`, `Version=1`, y el INSERT de `BTI026` solo con los campos sobrevivientes en el nuevo orden.
6. Ejecutar contra la conexión activa, confirmar el diálogo, y verificar en la base (`SELECT * FROM BTI025 WHERE BTISDTNom=...` / `BTI026`) que la copia quedó creada correctamente.
7. Repetir el flujo eligiendo `sdtgenSelectedName` = SDT recién creado, para confirmar que aparece en la lista del paso 4 (loop de verificación).

- [ ] **Step 3: Report DONE / DONE_WITH_CONCERNS**

If all checks in Step 2 pass: report DONE, list the commits made, and state explicitly which restart is needed (`node setup.js` must be restarted to pick up the `setup.js`/`scripts/generar-sdt` changes — static `public/` files are served fresh on every request and don't need a restart, but a hard browser refresh is recommended to bust any cached `wizard-doc.js`).
If anything in Step 2 fails: report DONE_WITH_CONCERNS with the specific failing check and a proposed fix, per the Completion Status Protocol in `.claude/CLAUDE.md`.
