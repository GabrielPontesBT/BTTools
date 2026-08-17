'use strict';

const { sg_generateScript } = require('../generar-scripts/index.js');

const PARAM_NAME_RE = /^[A-Za-z][A-Za-z0-9_]{0,99}$/;
const PARAM_NAME_ERR = 'Nombre de parametro invalido: debe empezar con una letra y usar solo letras, numeros o guion bajo (maximo 100 caracteres).';
const DIGITS_RE = /^\d{1,9}$/;
const FORBIDDEN_TEXT_RE = /['";\\\r\n]/;
const FORBIDDEN_TEXT_ERR = 'no puede contener comillas, punto y coma, barra invertida ni saltos de linea.';
// Valores reales de BTISRVPARDIR/BSPARDIR (Bantotal): H=Hidden,
// S=ErroresNegocio, R=BusinessErrors, I=In, B=InOut, O=Out.
const VALID_DIR = new Set(['H', 'S', 'R', 'I', 'B', 'O']);
// Valores reales de BTISRVCAT/BSPARCAT: B=Basico, C=Coleccion, S=SDT.
const VALID_CAT = new Set(['B', 'C', 'S']);

function isValidParamName(nombre) {
  return typeof nombre === 'string' && PARAM_NAME_RE.test(nombre);
}

function isValidDigits(valor) {
  return typeof valor === 'string' && DIGITS_RE.test(valor);
}

function isValidParamText(texto) {
  return typeof texto === 'string' && !FORBIDDEN_TEXT_RE.test(texto);
}

function isValidDir(dir) {
  return VALID_DIR.has(dir);
}

function isValidCat(cat) {
  return VALID_CAT.has(cat);
}

// editedParams: array ordenado de parametros completos, mismo shape que
// sg_mapParamRow (setup.js): nom, nomjava, dir, tipo, ittipo, valor, sdtver,
// cat, catit, largo, lval, itnom, deci, dsc. A diferencia de buildSdtCopy (que
// parte de una copia y localiza cada campo por origElemnom) aca no hay
// "original" que buscar: el array que llega YA es la lista completa deseada
// (edicion in-place), y el orden define BTISRVPARPOSI (sg_generateScript lo
// recalcula por indice en insBti019/insBtcbs019).
function buildParams(editedParams) {
  if (!Array.isArray(editedParams) || !editedParams.length) {
    throw new Error('La lista de parametros no puede quedar vacia.');
  }
  return editedParams.map((p) => {
    const src = p || {};
    const nom = (src.nom || '').trim();
    if (!isValidParamName(nom)) throw new Error(PARAM_NAME_ERR + (nom ? ' (' + nom + ')' : ''));
    const dir = (src.dir || 'I').trim().toUpperCase();
    if (!isValidDir(dir)) throw new Error('Direccion invalida para el parametro ' + nom + ': debe ser H, S, R, I, B u O.');
    const cat = (src.cat || 'B').trim().toUpperCase();
    if (!isValidCat(cat)) throw new Error('Categoria invalida para el parametro ' + nom + ': debe ser B, C o S.');
    const tipo = (src.tipo || '').trim();
    if (!tipo || !isValidParamText(tipo)) throw new Error('Tipo invalido para el parametro ' + nom + ': ' + FORBIDDEN_TEXT_ERR);
    const largo = String(src.largo != null && src.largo !== '' ? src.largo : '0');
    if (!isValidDigits(largo)) throw new Error('Largo invalido para el parametro ' + nom + ': debe ser un numero entero (0 o mayor).');
    const deci = String(src.deci != null && src.deci !== '' ? src.deci : '0');
    if (!isValidDigits(deci)) throw new Error('Decimales invalidos para el parametro ' + nom + ': debe ser un numero entero (0 o mayor).');
    const valor = src.valor || '';
    if (!isValidParamText(valor)) throw new Error('Valor por defecto invalido para el parametro ' + nom + ': ' + FORBIDDEN_TEXT_ERR);
    const dsc = src.dsc || '';
    if (!isValidParamText(dsc)) throw new Error('Descripcion invalida para el parametro ' + nom + ': ' + FORBIDDEN_TEXT_ERR);
    const ittipo = src.ittipo || '';
    if (!isValidParamText(ittipo)) throw new Error('Tipo de iterador invalido para el parametro ' + nom + ': ' + FORBIDDEN_TEXT_ERR);
    const itnom = src.itnom || '';
    if (!isValidParamText(itnom)) throw new Error('Nombre de iterador invalido para el parametro ' + nom + ': ' + FORBIDDEN_TEXT_ERR);
    const nomjava = (src.nomjava || 'param0').trim() || 'param0';
    if (!isValidParamText(nomjava)) throw new Error('Nombre Java invalido para el parametro ' + nom + ': ' + FORBIDDEN_TEXT_ERR);
    return {
      nom, nomjava, dir, tipo, ittipo, valor,
      sdtver: src.sdtver || '',
      cat,
      catit: src.catit || 'B',
      largo, lval: src.lval || '', itnom, deci, dsc,
    };
  });
}

function generateParamsScript(service, srvver, method, editedParams, version, mode, apiMode) {
  const params = buildParams(editedParams);
  const header = { BTINom: 'BTSERVICES', BTISrvNom: service, BTISrvVer: srvver || '1', BTIMtdNom: method };
  return sg_generateScript({ version, apiMode, header, method: {}, params, channels: [] }, mode || 'params');
}

function createParamEditFeature(deps) {
  const getPool = deps.getPool;
  const getOra = deps.getOra;
  const queryMethodParams = deps.queryMethodParams;
  const queryServiceVersions = deps.queryServiceVersions;

  async function resolveSrvVer(platform, db, version, service, apiMode) {
    const versions = await queryServiceVersions(platform, db, version, service, apiMode);
    return versions[0] || '1';
  }

  async function loadParams(platform, db, version, service, method, apiMode) {
    const srvver = await resolveSrvVer(platform, db, version, service, apiMode);
    const params = await queryMethodParams(platform, db, version, service, srvver, method, apiMode);
    return { srvver, params };
  }

  function scriptToStatements(service, srvver, method, editedParams, version, apiMode) {
    const script = generateParamsScript(service, srvver, method, editedParams, version, 'params', apiMode);
    // Mismo motivo que en generar-sdt: oracledb rechaza el ';' final
    // (ORA-00911) y mssql lo tolera, asi que se quita siempre.
    return script.split('\n').map(s => s.trim()).filter(Boolean).map(s => s.replace(/;\s*$/, ''));
  }

  async function executeParams(platform, db, version, service, srvver, method, editedParams, apiMode) {
    const statements = scriptToStatements(service, srvver, method, editedParams, version, apiMode);
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

    if (req.method === 'POST' && req.url === '/api/paramgen/params') {
      try {
        const body = await readBody(req);
        const { srvver, params } = await loadParams(body.platform, body.db, body.version, body.service, body.method, body.apiMode);
        json(200, { ok: true, srvver, params });
      } catch (e) { json(200, { ok: false, message: e.message }); }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/paramgen/generate') {
      try {
        const body = await readBody(req);
        const script = generateParamsScript(body.service, body.srvver, body.method, body.params, body.version, body.mode || 'params', body.apiMode);
        json(200, { ok: true, script });
      } catch (e) { json(200, { ok: false, message: e.message }); }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/paramgen/execute') {
      try {
        const body = await readBody(req);
        const result = await executeParams(body.platform, body.db, body.version, body.service, body.srvver, body.method, body.params, body.apiMode);
        json(200, Object.assign({ ok: true }, result));
      } catch (e) { json(200, { ok: false, message: e.message }); }
      return true;
    }

    return false;
  }

  return { loadParams, generateParamsScript, executeParams, handleApi };
}

module.exports = {
  createParamEditFeature,
  buildParams,
  generateParamsScript,
  isValidParamName,
  isValidDigits,
  isValidParamText,
  isValidDir,
  isValidCat,
};
