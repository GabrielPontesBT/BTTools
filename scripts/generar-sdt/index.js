'use strict';

const { sg_generateSdtScript } = require('../generar-scripts/index.js');

const SDT_NAME_RE = /^[A-Za-z][A-Za-z0-9_]{0,99}$/;
const SDT_NAME_ERR = 'Nombre de SDT invalido: debe empezar con una letra y usar solo letras, numeros o guion bajo (maximo 100 caracteres).';

function isValidSdtName(nombre) {
  return typeof nombre === 'string' && SDT_NAME_RE.test(nombre);
}

function buildSdtCopy(sourceSdt, nuevoNombre, fieldsOrdenados) {
  const b25 = sourceSdt.bti025 || {};
  const bti025Copy = Object.assign({}, b25, { nom: nuevoNombre, nativo: 'N', version: '1' });

  const byName = new Map((sourceSdt.bti026 || []).map(f => [f.elemnom, f]));
  const bti026Copy = fieldsOrdenados.map((elemnom, idx) => {
    const f = byName.get(elemnom);
    if (!f) throw new Error('Campo no encontrado en el SDT original: ' + elemnom);
    return Object.assign({}, f, { posi: String(idx + 1), version: '1' });
  });

  return { bti025Copy, bti026Copy };
}

function generateSdtScript(nuevoNombre, bti025Copy, bti026Copy, version, mode) {
  return sg_generateSdtScript({ nom: nuevoNombre, bti025: bti025Copy, bti026: bti026Copy }, mode || 'both', version);
}

function createSdtGenFeature(deps) {
  const getPool = deps.getPool;
  const getOra = deps.getOra;
  const queryBti025 = deps.queryBti025;
  const queryBti026 = deps.queryBti026;

  async function listSdtNames(platform, db) {
    // Una copia no nativa solo puede armarse a partir de un SDT nativo.
    if (platform === 'sqlserver') {
      const { pool } = await getPool(db);
      const r = await pool.request().query("SELECT BTISDTNom FROM BTI025 WHERE LTRIM(RTRIM(BTISDTNativo))='S' ORDER BY BTISDTNom");
      return r.recordset.map(row => (row.BTISDTNom || '').trim()).filter(Boolean);
    }
    const { conn, oracledb } = await getOra(db);
    try {
      const r = await conn.execute("SELECT BTISDTNOM FROM BTI025 WHERE TRIM(BTISDTNATIVO)='S' ORDER BY BTISDTNOM", [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return r.rows.map(row => (row.BTISDTNOM || '').trim()).filter(Boolean);
    } finally {
      await conn.close();
    }
  }

  function scriptToStatements(nuevoNombre, bti025Copy, bti026Copy, version) {
    const script = generateSdtScript(nuevoNombre, bti025Copy, bti026Copy, version, 'both');
    // El generador emite cada sentencia con ';' final. oracledb rechaza el
    // terminador (ORA-00911) y mssql lo tolera, asi que lo quitamos siempre.
    return script.split('\n').map(s => s.trim()).filter(Boolean).map(s => s.replace(/;\s*$/, ''));
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
        try {
          await tx.rollback();
        } catch (rollbackErr) {
          throw new Error('Fallo la operacion (' + e.message + ') y tambien fallo el rollback (' + rollbackErr.message + '). La transaccion puede haber quedado abierta.', { cause: e });
        }
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
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        throw new Error('Fallo la operacion (' + e.message + ') y tambien fallo el rollback (' + rollbackErr.message + '). La transaccion puede haber quedado abierta.', { cause: e });
      }
      throw e;
    } finally {
      await conn.close();
    }
  }

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
        if (!isValidSdtName(body.nuevoNombre)) { json(200, { ok: false, message: SDT_NAME_ERR }); return true; }
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
        if (!isValidSdtName(body.nuevoNombre)) { json(200, { ok: false, message: SDT_NAME_ERR }); return true; }
        // No confiamos en los datos del SDT origen que vuelven del browser:
        // se vuelven a consultar en la base antes de armar el DELETE/INSERT.
        const bti025 = await queryBti025(body.platform, body.db, body.version, body.nom);
        if (!bti025) { json(200, { ok: false, message: 'SDT no encontrado: ' + body.nom }); return true; }
        const bti026 = await queryBti026(body.platform, body.db, body.version, body.nom);
        const { bti025Copy, bti026Copy } = buildSdtCopy(
          { bti025, bti026 },
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
}

module.exports = { createSdtGenFeature, buildSdtCopy, generateSdtScript, isValidSdtName };
