'use strict';

const { sg_generateParamsUpdateScript, sg_generateFieldsUpdateScript } = require('../generar-scripts/index.js');

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
// Categoria del item DENTRO de una Coleccion (BTISRVCATIT/BSPARITCAT): solo
// puede ser Basico o SDT (una coleccion de colecciones no esta soportada).
const VALID_CATIT = new Set(['B', 'S']);

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

function isValidCatit(catit) {
  return VALID_CATIT.has(catit);
}

// editedParams: array ordenado de parametros completos, mismo shape que
// sg_mapParamRow (setup.js): nom, nomjava, dir, tipo, ittipo, valor, sdtver,
// cat, catit, largo, lval, itnom, deci, dsc. A diferencia de buildSdtCopy (que
// parte de una copia y localiza cada campo por origElemnom) aca no hay
// "original" que buscar: el array que llega YA es la lista completa deseada
// (edicion in-place), y el orden define BTISRVPARPOSI (sg_generateParamsUpdateScript
// lo recalcula por indice: posicion = indice + 1).
//
// Que campos son obligatorios depende de "cat" (ver public/wizard-doc.js,
// pgFieldGroupsFor, para el mismo arbol reflejado en la UI):
//   B (Basico):   tipo + largo/decimales del propio parametro.
//   S (SDT):      tipo = nombre del SDT elegido, sdtver = version elegida;
//                 sin largo/decimales (no aplican a un SDT).
//   C (Coleccion): el parametro es una lista. catit + itnom describen el
//                 item de esa lista; si catit=B el item tiene su propio
//                 tipo/largo/decimales (en ittipo/largo/deci), si catit=S
//                 el item es un SDT (ittipo=nombre, sdtver=version).
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

    const largoRaw = String(src.largo != null && src.largo !== '' ? src.largo : '0');
    if (!isValidDigits(largoRaw)) throw new Error('Largo invalido para el parametro ' + nom + ': debe ser un numero entero (0 o mayor).');
    const deciRaw = String(src.deci != null && src.deci !== '' ? src.deci : '0');
    if (!isValidDigits(deciRaw)) throw new Error('Decimales invalidos para el parametro ' + nom + ': debe ser un numero entero (0 o mayor).');
    const valor = src.valor || '';
    if (!isValidParamText(valor)) throw new Error('Valor por defecto invalido para el parametro ' + nom + ': ' + FORBIDDEN_TEXT_ERR);
    const dsc = src.dsc || '';
    if (!isValidParamText(dsc)) throw new Error('Descripcion invalida para el parametro ' + nom + ': ' + FORBIDDEN_TEXT_ERR);
    const nomjava = (src.nomjava || 'param0').trim() || 'param0';
    if (!isValidParamText(nomjava)) throw new Error('Nombre Java invalido para el parametro ' + nom + ': ' + FORBIDDEN_TEXT_ERR);

    let tipo = '', sdtver = '', ittipo = '', itnom = '', catit = '', largo = largoRaw, deci = deciRaw;

    if (cat === 'B') {
      tipo = (src.tipo || '').trim();
      if (!tipo || !isValidParamText(tipo)) throw new Error('Tipo invalido para el parametro ' + nom + ': ' + FORBIDDEN_TEXT_ERR);
    } else if (cat === 'S') {
      tipo = (src.tipo || '').trim();
      if (!tipo || !isValidParamText(tipo)) throw new Error('Debe elegir un SDT para el parametro ' + nom + '.');
      sdtver = (src.sdtver || '').trim();
      if (!sdtver) throw new Error('Falta la version del SDT elegido para el parametro ' + nom + '.');
      largo = '0'; deci = '0';
    } else {
      // Coleccion.
      catit = (src.catit || '').trim().toUpperCase();
      if (!isValidCatit(catit)) throw new Error('Categoria del item invalida para el parametro ' + nom + ': debe ser Basico o SDT.');
      itnom = (src.itnom || '').trim();
      if (!isValidParamName(itnom)) throw new Error('Nombre de item invalido para el parametro ' + nom + ': debe empezar con una letra y usar solo letras, numeros o guion bajo.');
      ittipo = (src.ittipo || '').trim();
      if (catit === 'B') {
        if (!ittipo || !isValidParamText(ittipo)) throw new Error('Tipo de item invalido para el parametro ' + nom + ': ' + FORBIDDEN_TEXT_ERR);
      } else {
        if (!ittipo || !isValidParamText(ittipo)) throw new Error('Debe elegir un SDT de item para el parametro ' + nom + '.');
        sdtver = (src.sdtver || '').trim();
        if (!sdtver) throw new Error('Falta la version del SDT de item elegido para el parametro ' + nom + '.');
        largo = '0'; deci = '0';
      }
    }

    return {
      nom, nomjava, dir, tipo, ittipo, valor, sdtver, cat,
      catit: cat === 'C' ? catit : 'B',
      largo, lval: src.lval || '', itnom, deci, dsc,
    };
  });
}

// oldCount: cantidad de parametros que tenia el metodo ANTES de la edicion.
// Como el editor no permite reordenar, la posicion 1..oldCount ya identifica
// una fila real de la base: se UPDATEa en vez de borrar todo y reinsertar.
// Solo se INSERTan las filas agregadas al final (posicion > oldCount) y solo
// se DELETEan las que sobran si se quitaron parametros (ver
// sg_generateParamsUpdateScript).
function generateParamsScript(service, srvver, method, editedParams, version, apiMode, oldCount) {
  const params = buildParams(editedParams);
  const header = { BTINom: 'BTSERVICES', BTISrvNom: service, BTISrvVer: srvver || '1', BTIMtdNom: method };
  return sg_generateParamsUpdateScript({ version, apiMode, header, params }, oldCount || 0);
}

// editedFields: array ordenado de campos de UN SDT existente, mismo shape
// que sg_queryBti026 (setup.js): elemnom, elemlargo, elemdeci, elemdsc,
// nomit son los unicos editables desde esta herramienta (el resto -- tipo,
// categoria, SDT anidado, obligatoriedad, etc. -- se preserva tal cual llego,
// via Object.assign). Solo se puede editar, quitar o REORDENAR campos, no
// agregar uno nuevo: eso requeriria elegirle tipo/categoria, que es
// exactamente el flujo que ya cubre "Generar SDT" (copiar un SDT nativo).
//
// Importante para el reorden: se preserva la fila COMPLETA (no solo las
// columnas editables) porque sg_generateFieldsUpdateScript escribe el campo
// entero en su nueva posicion. Si solo se pisaran elemnom/elemlargo/
// elemdeci/elemdsc/nomit, un campo movido de posicion terminaria con el
// tipo/categoria de OTRO campo que antes estaba ahi.
function buildFieldEdits(editedFields) {
  if (!Array.isArray(editedFields) || !editedFields.length) {
    throw new Error('La lista de campos no puede quedar vacia.');
  }
  return editedFields.map((f) => {
    const src = f || {};
    const elemnom = (src.elemnom || '').trim();
    if (!isValidParamName(elemnom)) throw new Error(PARAM_NAME_ERR + (elemnom ? ' (' + elemnom + ')' : ''));
    const elemlargo = String(src.elemlargo != null && src.elemlargo !== '' ? src.elemlargo : '0');
    if (!isValidDigits(elemlargo)) throw new Error('Largo invalido para el campo ' + elemnom + ': debe ser un numero entero (0 o mayor).');
    const elemdeci = String(src.elemdeci != null && src.elemdeci !== '' ? src.elemdeci : '0');
    if (!isValidDigits(elemdeci)) throw new Error('Decimales invalidos para el campo ' + elemnom + ': debe ser un numero entero (0 o mayor).');
    const elemdsc = src.elemdsc || '';
    if (!isValidParamText(elemdsc)) throw new Error('Descripcion invalida para el campo ' + elemnom + ': ' + FORBIDDEN_TEXT_ERR);
    const nomit = src.nomit || '';
    if (nomit && !isValidParamText(nomit)) throw new Error('Nombre de iterador invalido para el campo ' + elemnom + ': ' + FORBIDDEN_TEXT_ERR);
    return Object.assign({}, src, { elemnom, elemlargo, elemdeci, elemdsc, nomit });
  });
}

// oldCount: cantidad de campos que tenia el SDT ANTES de la edicion. Mismo
// criterio que generateParamsScript: se UPDATEa por posicion, y solo se
// DELETEa (por rango de posicion) si se quitaron campos.
function generateFieldsScript(sdtNom, editedFields, version, apiMode, oldCount) {
  const fields = buildFieldEdits(editedFields);
  return sg_generateFieldsUpdateScript({ nom: sdtNom, bti026: fields }, oldCount || 0, version, apiMode);
}

// Campos "intrinsecos" de un parametro: describen QUE es el parametro, no
// COMO se usa en un metodo puntual. Quedan afuera nom (es lo que el usuario
// ya escribio), nomjava/lval (metadata interna sin valor para sugerir) y dir
// (la direccion depende del metodo, no del parametro: el mismo "Cuit" puede
// ser entrada en un metodo y salida en otro).
const SUGGEST_FIELDS = ['tipo', 'ittipo', 'valor', 'sdtver', 'cat', 'catit', 'largo', 'itnom', 'deci', 'dsc'];

// candidates: parametros ya mapeados (shape de sg_mapParamRow) que comparten
// nombre en cualquier servicio/metodo. Devuelve la combinacion MAS FRECUENTE
// de SUGGEST_FIELDS (la moda, no el primer resultado ni el mas reciente):
// asi un typo aislado en un metodo viejo no termina sugiriendose como "la"
// definicion del parametro cuando la gran mayoria usa otros valores.
function suggestParamShape(candidates) {
  if (!Array.isArray(candidates) || !candidates.length) return null;
  const counts = new Map();
  candidates.forEach((row) => {
    const src = row || {};
    const shape = {};
    SUGGEST_FIELDS.forEach((f) => { shape[f] = src[f] != null ? src[f] : ''; });
    const key = JSON.stringify(shape);
    const entry = counts.get(key);
    if (entry) entry.count++;
    else counts.set(key, { shape, count: 1 });
  });
  let best = null;
  for (const entry of counts.values()) {
    if (!best || entry.count > best.count) best = entry;
  }
  return { shape: best.shape, count: best.count, total: candidates.length };
}

function createParamEditFeature(deps) {
  const getPool = deps.getPool;
  const getOra = deps.getOra;
  const queryMethodParams = deps.queryMethodParams;
  const queryServiceVersions = deps.queryServiceVersions;
  const queryAllSdts = deps.queryAllSdts;
  const queryParamCandidates = deps.queryParamCandidates;
  const queryBti025 = deps.queryBti025;
  const queryBti026 = deps.queryBti026;

  async function resolveSrvVer(platform, db, version, service, apiMode) {
    const versions = await queryServiceVersions(platform, db, version, service, apiMode);
    return versions[0] || '1';
  }

  async function loadParams(platform, db, version, service, method, apiMode) {
    const srvver = await resolveSrvVer(platform, db, version, service, apiMode);
    const params = await queryMethodParams(platform, db, version, service, srvver, method, apiMode);
    return { srvver, params };
  }

  // Sugiere valores para un parametro nuevo (o recien renombrado) buscando
  // ese mismo nombre en cualquier otro servicio/metodo. Se llama al escribir
  // el nombre (ver public/wizard-doc.js, pgLookupSuggestion) para autocompletar
  // tipo/largo/descripcion/etc. con lo que ya se uso antes, en vez de que cada
  // metodo redefina "Cuit" o "FechaNacimiento" con datos ligeramente distintos.
  async function suggestParam(platform, db, version, nombre, apiMode) {
    const candidates = await queryParamCandidates(platform, db, version, nombre, apiMode);
    return suggestParamShape(candidates);
  }

  // Catalogo de SDTs (nombre + version) para poblar el combo "SDT"/"SDT del
  // item" del editor: cualquier SDT existente (nativo o no) es un tipo de
  // parametro valido, a diferencia de sdtgen que solo trabaja con nativos.
  async function listSdtOptions(platform, db, version, apiMode) {
    return queryAllSdts(platform, db, version, apiMode);
  }

  // Campos de un SDT existente para editar (BTI026/BTCBS026), analogo a
  // loadParams pero para el modo "SDT" del editor (ver public/wizard-doc.js,
  // pgGoToSdtEdit). bti025 va solo para mostrar contexto (version, estado);
  // no se edita desde aca.
  async function loadFields(platform, db, version, sdtNom, apiMode) {
    const bti025 = await queryBti025(platform, db, version, sdtNom, apiMode);
    if (!bti025) return { bti025: null, bti026: [] };
    const bti026 = await queryBti026(platform, db, version, sdtNom, apiMode);
    return { bti025, bti026 };
  }

  function fieldsScriptToStatements(sdtNom, editedFields, version, apiMode, oldCount) {
    const script = generateFieldsScript(sdtNom, editedFields, version, apiMode, oldCount);
    return script.split('\n').map(s => s.trim()).filter(Boolean).map(s => s.replace(/;\s*$/, ''));
  }

  async function executeFieldEdits(platform, db, version, sdtNom, editedFields, apiMode) {
    // Mismo orden que executeParams: se valida antes de tocar la base, y se
    // re-consulta cuantos campos tiene HOY el SDT (no se confia en lo que
    // mande el browser) antes de armar el UPDATE/DELETE.
    buildFieldEdits(editedFields);
    const currentFields = await queryBti026(platform, db, version, sdtNom, apiMode);
    const statements = fieldsScriptToStatements(sdtNom, editedFields, version, apiMode, currentFields.length);
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

  function scriptToStatements(service, srvver, method, editedParams, version, apiMode, oldCount) {
    const script = generateParamsScript(service, srvver, method, editedParams, version, apiMode, oldCount);
    // Mismo motivo que en generar-sdt: oracledb rechaza el ';' final
    // (ORA-00911) y mssql lo tolera, asi que se quita siempre.
    return script.split('\n').map(s => s.trim()).filter(Boolean).map(s => s.replace(/;\s*$/, ''));
  }

  async function executeParams(platform, db, version, service, srvver, method, editedParams, apiMode) {
    // Se valida ANTES de tocar la base (buildParams tira si algo es invalido):
    // asi un parametro mal cargado no gasta ni siquiera la consulta de
    // reconteo de abajo. No se confia en el oldCount que pueda mandar el
    // browser (ademas ni lo manda: ver handleApi): se re-consulta cuantos
    // parametros tiene HOY el metodo en la base, igual que sdtgen re-consulta
    // el SDT origen antes de ejecutar. Sin esto, un UPDATE/INSERT/DELETE
    // armado contra un oldCount viejo podria pisar o saltear filas si alguien
    // mas edito el metodo mientras este browser tenia el editor abierto.
    buildParams(editedParams);
    const currentParams = await queryMethodParams(platform, db, version, service, srvver, method, apiMode);
    const statements = scriptToStatements(service, srvver, method, editedParams, version, apiMode, currentParams.length);
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

    if (req.method === 'POST' && req.url === '/api/paramgen/sdt-options') {
      try {
        const body = await readBody(req);
        const sdts = await listSdtOptions(body.platform, body.db, body.version, body.apiMode);
        json(200, { ok: true, sdts });
      } catch (e) { json(200, { ok: false, message: e.message }); }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/paramgen/suggest') {
      try {
        const body = await readBody(req);
        const suggestion = await suggestParam(body.platform, body.db, body.version, body.nombre, body.apiMode);
        json(200, { ok: true, suggestion });
      } catch (e) { json(200, { ok: false, message: e.message }); }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/paramgen/sdt-fields') {
      try {
        const body = await readBody(req);
        const { bti025, bti026 } = await loadFields(body.platform, body.db, body.version, body.nom, body.apiMode);
        if (!bti025) { json(200, { ok: false, message: 'SDT no encontrado: ' + body.nom }); return true; }
        json(200, { ok: true, bti025, bti026 });
      } catch (e) { json(200, { ok: false, message: e.message }); }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/paramgen/generate-fields') {
      try {
        const body = await readBody(req);
        const script = generateFieldsScript(body.sdtNom, body.editedFields, body.version, body.apiMode, body.oldCount);
        json(200, { ok: true, script });
      } catch (e) { json(200, { ok: false, message: e.message }); }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/paramgen/execute-fields') {
      try {
        const body = await readBody(req);
        const result = await executeFieldEdits(body.platform, body.db, body.version, body.sdtNom, body.editedFields, body.apiMode);
        json(200, Object.assign({ ok: true }, result));
      } catch (e) { json(200, { ok: false, message: e.message }); }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/paramgen/generate') {
      try {
        const body = await readBody(req);
        const script = generateParamsScript(body.service, body.srvver, body.method, body.params, body.version, body.apiMode, body.oldCount);
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

  return {
    loadParams, listSdtOptions, suggestParam, generateParamsScript, executeParams,
    loadFields, generateFieldsScript, executeFieldEdits,
    handleApi,
  };
}

module.exports = {
  createParamEditFeature,
  buildParams,
  suggestParamShape,
  generateParamsScript,
  buildFieldEdits,
  generateFieldsScript,
  isValidParamName,
  isValidDigits,
  isValidParamText,
  isValidDir,
  isValidCat,
  isValidCatit,
};
