'use strict';

const { sg_generateSdtScript } = require('../generar-scripts/index.js');

const SDT_NAME_RE = /^[A-Za-z][A-Za-z0-9_]{0,99}$/;
const SDT_NAME_ERR = 'Nombre de SDT invalido: debe empezar con una letra y usar solo letras, numeros o guion bajo (maximo 100 caracteres).';
const FIELD_NAME_RE = SDT_NAME_RE;
const FIELD_NAME_ERR = 'Nombre de campo invalido: debe empezar con una letra y usar solo letras, numeros o guion bajo (maximo 100 caracteres).';
const DIGITS_RE = /^\d{1,9}$/;
const FORBIDDEN_TEXT_RE = /['";\\\r\n]/;
const FIELD_TEXT_ERR = 'no puede contener comillas, punto y coma, barra invertida ni saltos de linea.';

function isValidSdtName(nombre) {
  return typeof nombre === 'string' && SDT_NAME_RE.test(nombre);
}

function isValidFieldName(nombre) {
  return typeof nombre === 'string' && FIELD_NAME_RE.test(nombre);
}

function isValidDigits(valor) {
  return typeof valor === 'string' && DIGITS_RE.test(valor);
}

function isValidFieldText(texto) {
  return typeof texto === 'string' && !FORBIDDEN_TEXT_RE.test(texto);
}

// editedFields: array ordenado de { origElemnom, elemnom, elemlargo, elemdsc, elemdeci, nomit }.
// origElemnom identifica el campo real en sourceSdt.bti026 (nunca se edita);
// el resto son los valores editables que el usuario cambio en el paso 5.
function buildSdtCopy(sourceSdt, nuevoNombre, editedFields) {
  const b25 = sourceSdt.bti025 || {};
  const bti025Copy = Object.assign({}, b25, { nom: nuevoNombre, nativo: 'N', version: '1' });

  const byName = new Map((sourceSdt.bti026 || []).map(f => [f.elemnom, f]));
  const bti026Copy = editedFields.map((edited, idx) => {
    const original = byName.get(edited.origElemnom);
    if (!original) throw new Error('Campo no encontrado en el SDT original: ' + edited.origElemnom);
    if (!isValidFieldName(edited.elemnom)) throw new Error(FIELD_NAME_ERR + ' (campo original: ' + edited.origElemnom + ')');
    if (!isValidDigits(edited.elemlargo)) throw new Error('Largo invalido para el campo ' + edited.elemnom + ': debe ser un numero entero (0 o mayor).');
    if (!isValidDigits(edited.elemdeci)) throw new Error('Decimales invalidos para el campo ' + edited.elemnom + ': debe ser un numero entero (0 o mayor).');
    if (!isValidFieldText(edited.elemdsc)) throw new Error('Descripcion invalida para el campo ' + edited.elemnom + ': ' + FIELD_TEXT_ERR);
    if (edited.nomit != null && edited.nomit !== '' && !isValidFieldText(edited.nomit)) {
      throw new Error('Nombre de iterador invalido para el campo ' + edited.elemnom + ': ' + FIELD_TEXT_ERR);
    }
    return Object.assign({}, original, {
      elemnom: edited.elemnom,
      elemlargo: edited.elemlargo,
      elemdeci: edited.elemdeci,
      elemdsc: edited.elemdsc,
      nomit: edited.nomit != null ? edited.nomit : original.nomit,
      posi: String(idx + 1),
      version: '1',
    });
  });

  return { bti025Copy, bti026Copy };
}

function generateSdtScript(nuevoNombre, bti025Copy, bti026Copy, version, mode, apiMode) {
  return sg_generateSdtScript({ nom: nuevoNombre, bti025: bti025Copy, bti026: bti026Copy }, mode || 'both', version, apiMode);
}

function createSdtGenFeature(deps) {
  const getPool = deps.getPool;
  const getOra = deps.getOra;
  const queryBti025 = deps.queryBti025;
  const queryBti026 = deps.queryBti026;

  async function listSdtNames(platform, db, apiMode) {
    // Una copia no nativa solo puede armarse a partir de un SDT nativo.
    if (platform === 'sqlserver') {
      const { pool } = await getPool(db);
      const r = await pool.request().query("SELECT BTISDTNom FROM BTI025 WHERE LTRIM(RTRIM(BTISDTNativo))='S' ORDER BY BTISDTNom");
      return r.recordset.map(row => (row.BTISDTNom || '').trim()).filter(Boolean);
    }
    const { conn, oracledb } = await getOra(db);
    const interna = apiMode === 'interna';
    try {
      const r = await conn.execute(
        interna ? "SELECT BSSDTNAME FROM BTCBS025 WHERE BSSDTNATIV=1 ORDER BY BSSDTNAME" : "SELECT BTISDTNOM FROM BTI025 WHERE TRIM(BTISDTNATIVO)='S' ORDER BY BTISDTNOM",
        [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const col = interna ? 'BSSDTNAME' : 'BTISDTNOM';
      return r.rows.map(row => (row[col] || '').trim()).filter(Boolean);
    } finally {
      await conn.close();
    }
  }

  // Copias no nativas ya creadas a partir del mismo SDT nativo (mismo
  // BTISDTNomInt), para avisar antes de generar una nueva.
  async function listExistingCopies(platform, db, version, nomInt, apiMode) {
    if (!nomInt) return [];
    if (platform === 'sqlserver') {
      const { pool, mssql } = await getPool(db);
      const r = await pool.request().input('nomint', mssql.VarChar(100), nomInt).query(
        "SELECT BTISDTNom, BTISDTDescrip, BTISDTEstado FROM BTI025 WHERE LTRIM(RTRIM(BTISDTNativo))='N' AND LTRIM(RTRIM(BTISDTNomInt))=@nomint ORDER BY BTISDTNom"
      );
      return r.recordset.map(row => ({
        nom: (row.BTISDTNom || '').trim(),
        descrip: (row.BTISDTDescrip || '').trim(),
        estado: (row.BTISDTEstado || '').trim(),
      })).filter(c => c.nom);
    }
    const { conn, oracledb } = await getOra(db);
    const interna = apiMode === 'interna';
    try {
      const r = await conn.execute(
        interna
          ? "SELECT BSSDTNAME, BSSDTDESC, BSSDTSTAT FROM BTCBS025 WHERE BSSDTNATIV=0 AND TRIM(BSSDTINTNM)=:1 ORDER BY BSSDTNAME"
          : "SELECT BTISDTNOM, BTISDTDESCRIP, BTISDTESTADO FROM BTI025 WHERE TRIM(BTISDTNATIVO)='N' AND TRIM(BTISDTNOMINT)=:1 ORDER BY BTISDTNOM",
        [nomInt], { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const [nomCol, descCol, estCol] = interna ? ['BSSDTNAME','BSSDTDESC','BSSDTSTAT'] : ['BTISDTNOM','BTISDTDESCRIP','BTISDTESTADO'];
      return r.rows.map(row => ({
        nom: (row[nomCol] || '').trim(),
        descrip: (row[descCol] || '').trim(),
        estado: (row[estCol] || '').trim(),
      })).filter(c => c.nom);
    } finally {
      await conn.close();
    }
  }

  function scriptToStatements(nuevoNombre, bti025Copy, bti026Copy, version, apiMode) {
    const script = generateSdtScript(nuevoNombre, bti025Copy, bti026Copy, version, 'both', apiMode);
    // El generador emite cada sentencia con ';' final. oracledb rechaza el
    // terminador (ORA-00911) y mssql lo tolera, asi que lo quitamos siempre.
    return script.split('\n').map(s => s.trim()).filter(Boolean).map(s => s.replace(/;\s*$/, ''));
  }

  async function executeSdtCopy(platform, db, version, nuevoNombre, bti025Copy, bti026Copy, apiMode) {
    const statements = scriptToStatements(nuevoNombre, bti025Copy, bti026Copy, version, apiMode);
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
        const names = await listSdtNames(body.platform, body.db, body.apiMode);
        json(200, { ok: true, names });
      } catch (e) { json(200, { ok: false, message: e.message }); }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/sdtgen/sdt') {
      try {
        const body = await readBody(req);
        const bti025 = await queryBti025(body.platform, body.db, body.version, body.nom, body.apiMode);
        if (!bti025) { json(200, { ok: false, message: 'SDT no encontrado: ' + body.nom }); return true; }
        const bti026 = await queryBti026(body.platform, body.db, body.version, body.nom, body.apiMode);
        json(200, { ok: true, bti025, bti026 });
      } catch (e) { json(200, { ok: false, message: e.message }); }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/sdtgen/existing-copies') {
      try {
        const body = await readBody(req);
        const copies = await listExistingCopies(body.platform, body.db, body.version, body.nomint, body.apiMode);
        json(200, { ok: true, copies });
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
          body.editedFields
        );
        const script = generateSdtScript(body.nuevoNombre, bti025Copy, bti026Copy, body.version, body.mode || 'both', body.apiMode);
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
        const bti025 = await queryBti025(body.platform, body.db, body.version, body.nom, body.apiMode);
        if (!bti025) { json(200, { ok: false, message: 'SDT no encontrado: ' + body.nom }); return true; }
        const bti026 = await queryBti026(body.platform, body.db, body.version, body.nom, body.apiMode);
        const { bti025Copy, bti026Copy } = buildSdtCopy(
          { bti025, bti026 },
          body.nuevoNombre,
          body.editedFields
        );
        const result = await executeSdtCopy(body.platform, body.db, body.version, body.nuevoNombre, bti025Copy, bti026Copy, body.apiMode);
        json(200, Object.assign({ ok: true }, result));
      } catch (e) { json(200, { ok: false, message: e.message }); }
      return true;
    }

    return false;
  }

  return { listSdtNames, listExistingCopies, executeSdtCopy, handleApi };
}

module.exports = { createSdtGenFeature, buildSdtCopy, generateSdtScript, isValidSdtName, isValidFieldName, isValidDigits, isValidFieldText };
