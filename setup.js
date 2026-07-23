'use strict';
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const crypto = require('crypto');
const { exec, spawn } = require('child_process');
const { createCollectionFeature } = require('./scripts/generar-collections');

const PORT = 3777;
const ROOT = __dirname;

// ── Cache de datos de validación ─────────────────────────────
// Evita que generar_md.js tenga que reconectarse a Oracle cuando
// la validación ya trajo todos los datos necesarios.
const DOC_DATA_CACHE = new Map(); // cacheKey → { expires, entries }
const CACHE_TTL_MS   = 15 * 60 * 1000; // 15 minutos

function docCacheSet(entries) {
  const key = crypto.randomBytes(16).toString('hex');
  DOC_DATA_CACHE.set(key, { expires: Date.now() + CACHE_TTL_MS, entries });
  // Limpiar entradas vencidas
  for (const [k, v] of DOC_DATA_CACHE) if (v.expires < Date.now()) DOC_DATA_CACHE.delete(k);
  return key;
}

function docCacheGet(key, service, method) {
  const entry = DOC_DATA_CACHE.get(key);
  if (!entry || entry.expires < Date.now()) return null;
  return entry.entries.get(service + ':' + method) || null;
}

// Convierte el formato sg_ al formato de columnas Oracle que usa generar_md.js
function sgToOracleBti014(detail) {
  return { BTIMTDDSC: detail.dsc || '', BTIMTDPGMNOM: detail.pgmnom || '' };
}
function sgToOracleBti019(params) {
  return params.map(p => ({
    BTISRVPARNOM:  p.nom    || '',
    BTISRVVARTIPO: p.tipo   || '',
    BTISRVPARDIR:  p.dir    || 'I',
    BTISRVPARDSC:  p.dsc    || '',
    BTISRVPARLARGO: p.largo || '0',
    BTISRVPARDECI:  p.deci  || '0',
    BTISRVCATIT:   p.catit  || 'B',
    BTISRVPARITTIPO: p.ittipo || '',
    BTISRVPARITNOM:  p.itnom  || '',
  }));
}
function sgToOracleBti026(sdts) {
  const result = {};
  for (const sdt of sdts) {
    result[sdt.nom] = (sdt.bti026 || []).map(f => ({
      BTISDTELEMNOM:   f.elemnom   || '',
      BTISDTELEMTIPO:  f.elemtipo  || '',
      BTISDTELEMLARGO: f.elemlargo || '0',
      BTISDTELEMDECI:  f.elemdeci  || '0',
      BTISDTELEMCAT:   f.elemcat   || '',
      BTISDTELEMDSC:   f.elemdsc   || '',
      BTISDTELEMSDT:   f.elemsdt   || '',
    }));
  }
  return result;
}

// -- helpers -------------------------------------------

function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', c => (s += c));
    req.on('end', () => { try { resolve(JSON.parse(s)); } catch (e) { reject(e); } });
  });
}

function resolveV4AuthUrl(api) {
  const publicBaseUrl = String((api && api.BASE_URL) || '').replace(/\/+$/g, '');
  const apiBaseUrl = String((api && api.API_BASE_URL) || '').replace(/\/+$/g, '');
  if (publicBaseUrl) return `${publicBaseUrl}/Authenticate/v1/Execute`;
  if (apiBaseUrl) {
    const normalized = apiBaseUrl.replace(/\/api\/publicapi$/i, '');
    return `${normalized}/api/publicapi/Authenticate/v1/Execute`;
  }
  return '/Authenticate/v1/Execute';
}

async function testSqlServer(db) {
  const mod = path.join(ROOT, 'V3', 'node_modules', 'mssql');
  if (!fs.existsSync(mod)) throw new Error('mssql no instalado - ejecuta npm install en V3/');
  const mssql = require(mod);
  const pool = new mssql.ConnectionPool({
    server: db.DB_SERVER,
    port: Number(db.DB_PORT) || 1433,
    database: db.DB_DATABASE,
    user: db.DB_USER,
    password: db.DB_PASSWORD,
    options: { trustServerCertificate: true },
    connectionTimeout: 8000,
  });
  await pool.connect();
  await pool.close();
}

async function testOracle(db) {
  const mod = path.join(ROOT, 'V4', 'node_modules', 'oracledb');
  if (!fs.existsSync(mod)) throw new Error('oracledb no instalado - ejecuta npm install en V4/');
  const oracledb = require(mod);
  const conn = await oracledb.getConnection({
    user: db.DB_USER,
    password: db.DB_PASSWORD,
    connectString: db.DB_CONNECT_STRING,
  });
  await conn.close();
}

async function queryServices(platform, db) {
  if (platform === 'sqlserver') {
    const mod = path.join(ROOT, 'V3', 'node_modules', 'mssql');
    if (!fs.existsSync(mod)) throw new Error('mssql no instalado - ejecuta npm install en V3/');
    const mssql = require(mod);
    const pool = new mssql.ConnectionPool({
      server: db.DB_SERVER, port: Number(db.DB_PORT) || 1433,
      database: db.DB_DATABASE, user: db.DB_USER, password: db.DB_PASSWORD,
      options: { trustServerCertificate: true }, connectionTimeout: 8000,
    });
    await pool.connect();
    const r = await pool.request()
      .query('SELECT DISTINCT BTISRVNOM FROM BTI014 ORDER BY BTISRVNOM');
    await pool.close();
    return r.recordset.map(function(row) { return (row.BTISRVNOM || '').trim(); }).filter(Boolean);
  } else {
    const mod = path.join(ROOT, 'V4', 'node_modules', 'oracledb');
    if (!fs.existsSync(mod)) throw new Error('oracledb no instalado - ejecuta npm install en V4/');
    const oracledb = require(mod);
    const conn = await oracledb.getConnection({
      user: db.DB_USER, password: db.DB_PASSWORD, connectString: db.DB_CONNECT_STRING,
    });
    const r = await conn.execute(
      'SELECT DISTINCT BTISRVNOM FROM BTI014 ORDER BY BTISRVNOM', [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await conn.close();
    return r.rows.map(function(row) { return (row.BTISRVNOM || '').trim(); }).filter(Boolean);
  }
}

/**
 * Trae TODOS los servicios y metodos de BTI014 en una sola consulta y una
 * sola conexion, en vez de una consulta por servicio. Pensado para el
 * builder de Collections, que necesita el catalogo completo de una vez y
 * puede apuntar a ambientes de produccion: minimizar la cantidad de golpes
 * a la base es mas importante que la simplicidad del codigo por servicio.
 */
async function queryServicesWithMethods(platform, db) {
  function groupRows(rows) {
    const services = [];
    const methodsByService = {};
    (rows || []).forEach(function(row) {
      const service = String(row.BTISRVNOM || '').trim();
      const method = String(row.BTIMTDNOM || '').trim();
      if (!service || !method) return;
      if (!methodsByService[service]) { methodsByService[service] = []; services.push(service); }
      methodsByService[service].push(method);
    });
    return { services, methodsByService };
  }

  if (platform === 'sqlserver') {
    const mod = path.join(ROOT, 'V3', 'node_modules', 'mssql');
    if (!fs.existsSync(mod)) throw new Error('mssql no instalado - ejecuta npm install en V3/');
    const mssql = require(mod);
    const pool = new mssql.ConnectionPool({
      server: db.DB_SERVER, port: Number(db.DB_PORT) || 1433,
      database: db.DB_DATABASE, user: db.DB_USER, password: db.DB_PASSWORD,
      options: { trustServerCertificate: true }, connectionTimeout: 8000,
    });
    await pool.connect();
    const r = await pool.request()
      .query('SELECT BTISRVNOM, BTIMTDNOM FROM BTI014 ORDER BY BTISRVNOM, BTIMTDNOM');
    await pool.close();
    return groupRows(r.recordset);
  } else {
    const mod = path.join(ROOT, 'V4', 'node_modules', 'oracledb');
    if (!fs.existsSync(mod)) throw new Error('oracledb no instalado - ejecuta npm install en V4/');
    const oracledb = require(mod);
    const conn = await oracledb.getConnection({
      user: db.DB_USER, password: db.DB_PASSWORD, connectString: db.DB_CONNECT_STRING,
    });
    const r = await conn.execute(
      'SELECT BTISRVNOM, BTIMTDNOM FROM BTI014 ORDER BY BTISRVNOM, BTIMTDNOM', [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await conn.close();
    return groupRows(r.rows);
  }
}

async function queryMethods(platform, db, service) {
  if (platform === 'sqlserver') {
    const mod = path.join(ROOT, 'V3', 'node_modules', 'mssql');
    if (!fs.existsSync(mod)) throw new Error('mssql no instalado - ejecuta npm install en V3/');
    const mssql = require(mod);
    const pool = new mssql.ConnectionPool({
      server: db.DB_SERVER, port: Number(db.DB_PORT) || 1433,
      database: db.DB_DATABASE, user: db.DB_USER, password: db.DB_PASSWORD,
      options: { trustServerCertificate: true }, connectionTimeout: 8000,
    });
    await pool.connect();
    const r = await pool.request()
      .input('svc', mssql.VarChar(100), service)
      .query('SELECT BTIMTDNOM FROM BTI014 WHERE BTISRVNOM = @svc ORDER BY BTIMTDNOM');
    await pool.close();
    return r.recordset.map(function(row) { return (row.BTIMTDNOM || '').trim(); }).filter(Boolean);
  } else {
    const mod = path.join(ROOT, 'V4', 'node_modules', 'oracledb');
    if (!fs.existsSync(mod)) throw new Error('oracledb no instalado - ejecuta npm install en V4/');
    const oracledb = require(mod);
    const conn = await oracledb.getConnection({
      user: db.DB_USER, password: db.DB_PASSWORD, connectString: db.DB_CONNECT_STRING,
    });
    const r = await conn.execute(
      'SELECT BTIMTDNOM FROM BTI014 WHERE BTISRVNOM = :1 ORDER BY BTIMTDNOM', [service],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await conn.close();
    return r.rows.map(function(row) { return (row.BTIMTDNOM || '').trim(); }).filter(Boolean);
  }
}

function valorEjemploSetup(tipo) {
  const t = (tipo || '').toUpperCase();
  if (t === 'N') return 0;
  if (t === 'D') return '2026-01-01';
  if (t === 'B') return false;
  if (t === 'F') return 0.0;
  return '';
}

async function buildSdtObj(queryFn, sdtType, isCollection, cache, visited) {
  if (!sdtType || visited.has(sdtType)) return isCollection ? [] : {};
  const vis = new Set(visited);
  vis.add(sdtType);
  if (!cache.has(sdtType)) cache.set(sdtType, await queryFn(sdtType));
  const fields = cache.get(sdtType);
  const obj = {};
  for (const f of fields) {
    if (f.sdt) {
      obj[f.name] = await buildSdtObj(queryFn, f.sdt, f.cat === 'C', cache, vis);
    } else if (f.cat === 'C') {
      obj[f.name] = [];
    } else {
      obj[f.name] = valorEjemploSetup(f.type);
    }
  }
  return isCollection ? [obj] : obj;
}

function mapBti026Row(row) {
  const sdt = (row.BTISDTELEMSDT && row.BTISDTELEMSDT.trim()) ||
              (row.BTISDTELEMTIPO && row.BTISDTELEMTIPO.trim().startsWith('Sdt') ? row.BTISDTELEMTIPO.trim() : '');
  return { name: (row.BTISDTELEMNOM || '').trim(), type: (row.BTISDTELEMTIPO || '').trim(),
           cat: (row.BTISDTELEMCAT || '').trim(), sdt };
}

async function queryInputParams(platform, db, service, method) {
  if (platform === 'sqlserver') {
    const mod = path.join(ROOT, 'V3', 'node_modules', 'mssql');
    if (!fs.existsSync(mod)) throw new Error('mssql no instalado - ejecuta npm install en V3/');
    const mssql = require(mod);
    const pool = new mssql.ConnectionPool({
      server: db.DB_SERVER, port: Number(db.DB_PORT) || 1433,
      database: db.DB_DATABASE, user: db.DB_USER, password: db.DB_PASSWORD,
      options: { trustServerCertificate: true }, connectionTimeout: 8000,
    });
    await pool.connect();
    try {
      const r = await pool.request()
        .input('svc', mssql.VarChar(100), service)
        .input('mtd', mssql.VarChar(100), method)
        .query("SELECT BTISRVPARNOM,BTISRVVARTIPO,BTISRVPARLARGO,BTISRVCATIT,BTISRVPARITTIPO FROM BTI019 WHERE BTISRVNOM=@svc AND BTIMTDNOM=@mtd AND BTISRVPARDIR='I' ORDER BY BTISRVPARPOSI");
      const sdtCache = new Map();
      const queryFn = async (sdtType) => {
        const r26 = await pool.request()
          .input('sdt', mssql.VarChar(100), sdtType)
          .query('SELECT BTISDTELEMNOM,BTISDTELEMTIPO,BTISDTELEMCAT,BTISDTELEMSDT FROM BTI026 WHERE BTISDTNOM=@sdt ORDER BY BTISDTELEMNOM');
        return r26.recordset.map(mapBti026Row).filter(f => f.name);
      };
      const params = [];
      for (const row of r.recordset) {
        const name     = (row.BTISRVPARNOM    || '').trim(); if (!name) continue;
        const type     = (row.BTISRVVARTIPO   || '').trim();
        const cat      = (row.BTISRVCATIT     || '').trim();
        const itemType = (row.BTISRVPARITTIPO || '').trim();
        const p = { name, type, label: cat, itemType };
        const sdtType = itemType || (type.startsWith('Sdt') ? type : '');
        if (sdtType) {
          p.isComplex = true;
          try { p.example = JSON.stringify(await buildSdtObj(queryFn, sdtType, !!itemType, sdtCache, new Set()), null, 2); }
          catch(e) { p.example = itemType ? '[]' : '{}'; }
        }
        params.push(p);
      }
      return params;
    } finally {
      await pool.close();
    }
  } else {
    const mod = path.join(ROOT, 'V4', 'node_modules', 'oracledb');
    if (!fs.existsSync(mod)) throw new Error('oracledb no instalado - ejecuta npm install en V4/');
    const oracledb = require(mod);
    const conn = await oracledb.getConnection({
      user: db.DB_USER, password: db.DB_PASSWORD, connectString: db.DB_CONNECT_STRING,
    });
    try {
      const r = await conn.execute(
        "SELECT BTISRVPARNOM,BTISRVVARTIPO,BTISRVPARLARGO,BTISRVCATIT,BTISRVPARITTIPO FROM BTI019 WHERE BTISRVNOM=:1 AND BTIMTDNOM=:2 AND BTISRVPARDIR='I' ORDER BY BTISRVPARPOSI",
        [service, method], { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const sdtCache = new Map();
      const queryFn = async (sdtType) => {
        const r26 = await conn.execute(
          'SELECT BTISDTELEMNOM,BTISDTELEMTIPO,BTISDTELEMCAT,BTISDTELEMSDT FROM BTI026 WHERE BTISDTNOM=:1 ORDER BY BTISDTELEMNOM',
          [sdtType], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return r26.rows.map(mapBti026Row).filter(f => f.name);
      };
      const params = [];
      for (const row of r.rows) {
        const name     = (row.BTISRVPARNOM    || '').trim(); if (!name) continue;
        const type     = (row.BTISRVVARTIPO   || '').trim();
        const cat      = (row.BTISRVCATIT     || '').trim();
        const itemType = (row.BTISRVPARITTIPO || '').trim();
        const p = { name, type, label: cat, itemType };
        const sdtType = itemType || (type.startsWith('Sdt') ? type : '');
        if (sdtType) {
          p.isComplex = true;
          try { p.example = JSON.stringify(await buildSdtObj(queryFn, sdtType, !!itemType, sdtCache, new Set()), null, 2); }
          catch(e) { p.example = itemType ? '[]' : '{}'; }
        }
        params.push(p);
      }
      return params;
    } finally {
      await conn.close();
    }
  }
}

const DB_HISTORY_FILE = path.join(ROOT, 'db_history.json');

function readDbHistory() {
  try { if (fs.existsSync(DB_HISTORY_FILE)) return JSON.parse(fs.readFileSync(DB_HISTORY_FILE, 'utf8')); } catch(e) {}
  return [];
}
function writeDbHistory(list) {
  try { fs.writeFileSync(DB_HISTORY_FILE, JSON.stringify(list, null, 2), 'utf8'); } catch(e) {}
}

function parseEnvFile(content) {
  var result = {};
  content.split('\n').forEach(function(line) {
    line = line.trim();
    if (!line || line[0] === '#') return;
    var idx = line.indexOf('=');
    if (idx === -1) return;
    result[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
  });
  return result;
}

function buildEnv(version, platform, db, api) {
  const L = [];
  if (platform === 'sqlserver') {
    L.push('# Base de datos SQL Server');
    L.push('DB_SERVER=' + db.DB_SERVER);
    L.push('DB_PORT=' + (db.DB_PORT || '1433'));
    L.push('DB_DATABASE=' + db.DB_DATABASE);
    L.push('DB_USER=' + db.DB_USER);
    L.push('DB_PASSWORD=' + db.DB_PASSWORD);
  } else {
    L.push('# Base de datos Oracle');
    L.push('DB_USER=' + db.DB_USER);
    L.push('DB_PASSWORD=' + db.DB_PASSWORD);
    L.push('DB_CONNECT_STRING=' + db.DB_CONNECT_STRING);
  }
  L.push('');
  L.push('# URL base para links de documentacion');
  L.push('BASE_URL=' + api.BASE_URL);
  L.push('');
  L.push('# API Bantotal');
  L.push('API_BASE_URL=' + api.API_BASE_URL);
  if (version === 'V3' && api.API_AUTH_URL) L.push('API_AUTH_URL=' + api.API_AUTH_URL);
  L.push('API_USER=' + api.API_USER);
  L.push('API_PASSWORD=' + api.API_PASSWORD);
  if (api.API_CANAL)        L.push('API_CANAL=' + api.API_CANAL);
  if (api.API_DEVICE)       L.push('API_DEVICE=' + api.API_DEVICE);
  if (api.API_REQUERIMIENTO) L.push('API_REQUERIMIENTO=' + api.API_REQUERIMIENTO);
  if (api.DOC_ERRORES_MODELOS) {
    L.push('');
    L.push('# Documentador de Errores');
    L.push('DOC_ERRORES_MODELOS=' + api.DOC_ERRORES_MODELOS);
  }
  return L.join('\n');
}

// ── Script Generator backend ──────────────────────────────
const {
  sg_generateScript, sg_generateSdtScript, sg_extractSdtNames,
  sg_sq, sg_nq, sg_fmtDate, SG_SDT_EXCLUDE,
  V3_BTI004_COLS, V3_BTI014_COLS, V4_BTI014_COLS,
  V3_BTI019_COLS, V4_BTI019_COLS,
  V3_BTI025_COLS, V4_BTI025_COLS,
  V3_BTI026_COLS, V4_BTI026_COLS,
} = require('./scripts/generar-scripts/index.js');

function sg_loadEnvForVersion(version) {
  var envPath = path.join(ROOT, version, '.env');
  if (!fs.existsSync(envPath)) return null;
  try { return parseEnvFile(fs.readFileSync(envPath, 'utf8')); } catch(e) { return null; }
}

function sg_findModule(name) {
  const candidates = [
    path.join(ROOT, 'node_modules', name),
    path.join(ROOT, 'V3', 'node_modules', name),
    path.join(ROOT, 'V4', 'node_modules', name),
    path.join(process.env.APPDATA || '', 'npm', 'node_modules', name),
    path.join(process.execPath, '..', '..', 'lib', 'node_modules', name),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return require(c);
  throw new Error('Modulo "' + name + '" no encontrado. Ejecuta npm install primero.');
}

var _sg_sqlPool = null, _sg_sqlPoolKey = '';
var _sg_oraPool = null, _sg_oraPoolKey = '';

async function sg_getPool(db) {
  const mssql = sg_findModule('mssql');
  const key = JSON.stringify(db);
  if (_sg_sqlPool && _sg_sqlPoolKey === key && _sg_sqlPool.connected) return { pool: _sg_sqlPool, mssql };
  if (_sg_sqlPool) { try { await _sg_sqlPool.close(); } catch(e) {} }
  const pool = new mssql.ConnectionPool({
    server: db.server, port: Number(db.port) || 1433,
    database: db.database, user: db.user, password: db.password,
    options: { trustServerCertificate: true }, connectionTimeout: 8000,
    pool: { max: 5, min: 1, idleTimeoutMillis: 30000 },
  });
  await pool.connect();
  _sg_sqlPool = pool; _sg_sqlPoolKey = key;
  return { pool, mssql };
}

async function sg_getOra(db) {
  const oracledb = sg_findModule('oracledb');
  const key = JSON.stringify(db);
  if (_sg_oraPool && _sg_oraPoolKey === key) {
    try { const conn = await _sg_oraPool.getConnection(); return { conn, oracledb }; }
    catch(e) { try { await _sg_oraPool.close(0); } catch(_) {} _sg_oraPool = null; _sg_oraPoolKey = ''; }
  }
  if (_sg_oraPool) { try { await _sg_oraPool.close(0); } catch(e) {} _sg_oraPool = null; }
  const pool = await oracledb.createPool({ user: db.user, password: db.password, connectString: db.connectString, poolMin:1, poolMax:5, poolIncrement:1, poolTimeout:60 });
  _sg_oraPool = pool; _sg_oraPoolKey = key;
  const conn = await pool.getConnection();
  return { conn, oracledb };
}

async function sg_testConn(platform, db) {
  if (platform === 'sqlserver') { await sg_getPool(db); }
  else { const { conn } = await sg_getOra(db); await conn.close(); }
}

async function sg_queryServices(platform, db, version) {
  const prefix = version === 'V3' ? 'BT' : 'Public';
  if (platform === 'sqlserver') {
    const { pool } = await sg_getPool(db);
    const col = version === 'V3' ? 'BTISrvNom' : 'BTISRVNOM';
    const r = await pool.request().query("SELECT DISTINCT " + col + " FROM BTI014 WHERE " + col + " LIKE '" + prefix + "%' ORDER BY " + col);
    return r.recordset.map(function(row) { return (row[col] || '').trim(); }).filter(Boolean);
  } else {
    const { conn, oracledb } = await sg_getOra(db);
    try {
      const r = await conn.execute('SELECT DISTINCT BTISRVNOM FROM BTI014 WHERE BTISRVNOM LIKE :1 ORDER BY BTISRVNOM', [prefix + '%'], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      await conn.close();
      return r.rows.map(function(row) { return (row.BTISRVNOM || '').trim(); }).filter(Boolean);
    } catch(e) { await conn.close(); throw e; }
  }
}

async function sg_queryMethods(platform, db, version, service) {
  if (platform === 'sqlserver') {
    const { pool, mssql } = await sg_getPool(db);
    const col = version === 'V3' ? 'BTIMtdNom' : 'BTIMTDNOM';
    const svcCol = version === 'V3' ? 'BTISrvNom' : 'BTISRVNOM';
    const r = await pool.request().input('svc', mssql.VarChar(100), service).query('SELECT DISTINCT ' + col + ' FROM BTI014 WHERE ' + svcCol + ' = @svc ORDER BY ' + col);
    return r.recordset.map(function(row) { return (row[col] || '').trim(); }).filter(Boolean);
  } else {
    const { conn, oracledb } = await sg_getOra(db);
    try {
      const r = await conn.execute('SELECT DISTINCT BTIMTDNOM FROM BTI014 WHERE BTISRVNOM = :1 ORDER BY BTIMTDNOM', [service], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      await conn.close();
      return r.rows.map(function(row) { return (row.BTIMTDNOM || '').trim(); }).filter(Boolean);
    } catch(e) { await conn.close(); throw e; }
  }
}

async function sg_queryMethodDetails(platform, db, version, service, method) {
  if (platform === 'sqlserver') {
    const { pool, mssql } = await sg_getPool(db);
    const v3 = version === 'V3';
    const svcCol = v3 ? 'BTISrvNom' : 'BTISRVNOM', mtdCol = v3 ? 'BTIMtdNom' : 'BTIMTDNOM';
    const cols = v3 ? 'BTIMtdDsc,BTIMtdNSBT,BTIMtdPgmNom,BTIMtdPgmMtd,BTIMtdStatus,BTIMtdFPath,BTIMtdEnbTra,BTIMtdEsPgGx' : 'BTIMTDDSC,BTIMTDNSBT,BTIMTDPGMNOM,BTIMTDPGMMTD,BTIMTDSTATUS,BTIMTDFPATH,BTIMTDENBTRA,BTIMTDESPGGX';
    const r = await pool.request().input('svc', mssql.VarChar(100), service).input('mtd', mssql.VarChar(100), method).query('SELECT TOP 1 ' + cols + ' FROM BTI014 WHERE ' + svcCol + '=@svc AND ' + mtdCol + '=@mtd');
    if (!r.recordset.length) return null;
    const row = r.recordset[0], g = (k) => row[k] == null ? null : String(row[k]), p = v3 ? 'BTIMtd' : 'BTIMTD';
    return { dsc:(g(p+(v3?'Dsc':'DSC'))||'').trim(), nsbt:g(p+'NSBT'), pgmnom:(g(p+(v3?'PgmNom':'PGMNOM'))||'').trim(), pgmmtd:(g(p+(v3?'PgmMtd':'PGMMTD'))||'execute').trim(), status:(g(p+(v3?'Status':'STATUS'))||'Validado').trim(), fpath:g(p+(v3?'FPath':'FPATH')), enbtra:row[p+(v3?'EnbTra':'ENBTRA')]==null?'NULL':g(p+(v3?'EnbTra':'ENBTRA')), espggx:g(p+(v3?'EsPgGx':'ESPGGX')) };
  } else {
    const { conn, oracledb } = await sg_getOra(db);
    try {
      const r = await conn.execute('SELECT BTIMTDDSC,BTIMTDNSBT,BTIMTDPGMNOM,BTIMTDPGMMTD,BTIMTDSTATUS,BTIMTDFPATH,BTIMTDENBTRA,BTIMTDESPGGX FROM BTI014 WHERE BTISRVNOM=:1 AND BTIMTDNOM=:2 AND ROWNUM=1', [service, method], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      await conn.close();
      if (!r.rows.length) return null;
      const row = r.rows[0], g = (k) => row[k] == null ? null : String(row[k]);
      return { dsc:(g('BTIMTDDSC')||'').trim(), nsbt:g('BTIMTDNSBT'), pgmnom:(g('BTIMTDPGMNOM')||'').trim(), pgmmtd:(g('BTIMTDPGMMTD')||'execute').trim(), status:(g('BTIMTDSTATUS')||'Validado').trim(), fpath:g('BTIMTDFPATH'), enbtra:row.BTIMTDENBTRA==null?'NULL':g('BTIMTDENBTRA'), espggx:g('BTIMTDESPGGX') };
    } catch(e) { await conn.close(); throw e; }
  }
}

function sg_mapParamRow(row, version) {
  const g = function(k) { const val = row[k]; if (val == null || typeof val === 'object') return ''; return String(val).trim(); };
  if (version === 'V3') {
    return { nom:g('BTISrvParNom'), nomjava:g('BTISrvParNomJava')||'param0', dir:g('BTISrvParDir')||'I', tipo:g('BTISrvVarTipo'), ittipo:g('BTISrvParItTipo'), valor:g('BTISrvParValor'), sdtver:g('BTISrvSDTVer'), cat:g('BTISrvCat')||'B', catit:g('BTISrvCatIt')||'B', largo:row.BTISrvParLargo!=null?String(row.BTISrvParLargo):'0', lval:g('BTISrvParLVal'), itnom:g('BTISrvParItNom'), deci:row.BTISRVPARDECI!=null?String(row.BTISRVPARDECI):'0' };
  }
  return { nom:g('BTISRVPARNOM'), nomjava:g('BTISRVPARNOMJAVA')||'param0', dir:g('BTISRVPARDIR')||'I', tipo:g('BTISRVVARTIPO'), ittipo:g('BTISRVPARITTIPO'), valor:g('BTISRVPARVALOR'), sdtver:g('BTISRVSDTVER'), cat:g('BTISRVCAT')||'B', catit:g('BTISRVCATIT')||'B', largo:row.BTISRVPARLARGO!=null?String(row.BTISRVPARLARGO):'0', lval:g('BTISRVPARLVAL'), itnom:g('BTISRVPARITNOM'), deci:row.BTISRVPARDECI!=null?String(row.BTISRVPARDECI):'0', dsc:g('BTISRVPARDSC') };
}

async function sg_queryMethodParams(platform, db, version, service, srvver, method) {
  const v3 = version === 'V3', ver = String(srvver || '1');
  const selectCols = v3 ? 'BTISrvParPosi,BTISrvParNom,BTISrvParNomJava,BTISrvParDir,BTISrvVarTipo,BTISrvParItTipo,BTISrvParValor,BTISrvSDTVer,BTISrvCat,BTISrvCatIt,BTISrvParLargo,BTISrvParLVal,BTISrvParItNom,BTISRVPARDECI' : 'BTISRVPARPOSI,BTISRVPARNOM,BTISRVPARNOMJAVA,BTISRVPARDIR,BTISRVVARTIPO,BTISRVPARITTIPO,BTISRVPARVALOR,BTISRVCATIT,BTISRVCAT,BTISRVSDTVER,BTISRVPARLARGO,BTISRVPARLVAL,BTISRVPARITNOM,BTISRVPARDECI,BTISRVPARDSC';
  if (platform === 'sqlserver') {
    const { pool, mssql } = await sg_getPool(db);
    const svcCol = v3?'BTISrvNom':'BTISRVNOM', verCol = v3?'BTISrvVer':'BTISRVVER', mtdCol = v3?'BTIMtdNom':'BTIMTDNOM', posiCol = v3?'BTISrvParPosi':'BTISRVPARPOSI';
    const r = await pool.request().input('svc',mssql.VarChar(100),service).input('ver',mssql.VarChar(10),ver).input('mtd',mssql.VarChar(100),method).query('SELECT '+selectCols+' FROM BTI019 WHERE '+svcCol+'=@svc AND '+verCol+'=@ver AND '+mtdCol+'=@mtd ORDER BY '+posiCol);
    return r.recordset.map(function(row) { return sg_mapParamRow(row, version); });
  } else {
    const { conn, oracledb } = await sg_getOra(db);
    try {
      const r = await conn.execute('SELECT BTISRVPARPOSI,BTISRVPARNOM,BTISRVPARNOMJAVA,BTISRVPARDIR,BTISRVVARTIPO,BTISRVPARITTIPO,BTISRVPARVALOR,BTISRVCATIT,BTISRVCAT,BTISRVSDTVER,BTISRVPARLARGO,BTISRVPARLVAL,BTISRVPARITNOM,BTISRVPARDECI,BTISRVPARDSC FROM BTI019 WHERE BTISRVNOM=:1 AND BTISRVVER=:2 AND BTIMTDNOM=:3 ORDER BY BTISRVPARPOSI', [service, ver, method], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      await conn.close();
      return r.rows.map(function(row) { return sg_mapParamRow(row, version); });
    } catch(e) { await conn.close(); throw e; }
  }
}

async function sg_queryServiceVersions(platform, db, version, service) {
  const v3 = version === 'V3', svcCol = v3?'BTISrvNom':'BTISRVNOM', verCol = v3?'BTISrvVer':'BTISRVVER';
  if (platform === 'sqlserver') {
    const { pool, mssql } = await sg_getPool(db);
    const r = await pool.request().input('svc',mssql.VarChar(100),service).query('SELECT DISTINCT '+verCol+' FROM BTI014 WHERE '+svcCol+'=@svc ORDER BY '+verCol);
    return r.recordset.map(function(row) { return (row[verCol]||'').trim(); }).filter(Boolean);
  } else {
    const { conn, oracledb } = await sg_getOra(db);
    try {
      const r = await conn.execute('SELECT DISTINCT BTISRVVER FROM BTI014 WHERE BTISRVNOM=:1 ORDER BY BTISRVVER', [service], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      await conn.close();
      return r.rows.map(function(row) { return (row.BTISRVVER||'').trim(); }).filter(Boolean);
    } catch(e) { await conn.close(); throw e; }
  }
}

async function sg_queryServiceBTI004(platform, db, service) {
  if (platform !== 'sqlserver') return null;
  const { pool, mssql } = await sg_getPool(db);
  const r = await pool.request().input('svc',mssql.VarChar(100),service).query("SELECT TOP 1 BTISrvDsc,BTISrvPgmName FROM BTI004 WHERE BTINom='BTSERVICES' AND BTISrvNom=@svc ORDER BY BTISrvVer");
  if (!r.recordset.length) return null;
  return { dsc:(r.recordset[0].BTISrvDsc||'').trim(), pgmnom:(r.recordset[0].BTISrvPgmName||'').trim() };
}

async function sg_queryParamOptions(platform, db, version) {
  if (platform === 'sqlserver') {
    const { pool } = await sg_getPool(db);
    const t=version==='V3'?'BTISrvVarTipo':'BTISRVVARTIPO', i=version==='V3'?'BTISrvParItTipo':'BTISRVPARITTIPO', n=version==='V3'?'BTISrvParItNom':'BTISRVPARITNOM';
    const [r1,r2,r3] = await Promise.all([
      pool.request().query("SELECT DISTINCT "+t+" v FROM BTI019 WHERE "+t+" IS NOT NULL AND LEN(LTRIM("+t+"))>0 ORDER BY "+t),
      pool.request().query("SELECT DISTINCT "+i+" v FROM BTI019 WHERE "+i+" IS NOT NULL AND LEN(LTRIM("+i+"))>0 ORDER BY "+i),
      pool.request().query("SELECT DISTINCT "+n+" v FROM BTI019 WHERE "+n+" IS NOT NULL AND LEN(LTRIM("+n+"))>0 ORDER BY "+n),
    ]);
    return { tipos:r1.recordset.map(function(r){return(r.v||'').trim();}).filter(Boolean), ittipos:r2.recordset.map(function(r){return(r.v||'').trim();}).filter(Boolean), itnoms:r3.recordset.map(function(r){return(r.v||'').trim();}).filter(Boolean) };
  } else {
    const { conn, oracledb } = await sg_getOra(db);
    try {
      const opts = { outFormat: oracledb.OUT_FORMAT_OBJECT };
      const [r1,r2,r3] = await Promise.all([
        conn.execute("SELECT DISTINCT BTISRVVARTIPO v FROM BTI019 WHERE BTISRVVARTIPO IS NOT NULL AND TRIM(BTISRVVARTIPO)!='' ORDER BY BTISRVVARTIPO", [], opts),
        conn.execute("SELECT DISTINCT BTISRVPARITTIPO v FROM BTI019 WHERE BTISRVPARITTIPO IS NOT NULL AND TRIM(BTISRVPARITTIPO)!='' ORDER BY BTISRVPARITTIPO", [], opts),
        conn.execute("SELECT DISTINCT BTISRVPARITNOM v FROM BTI019 WHERE BTISRVPARITNOM IS NOT NULL AND TRIM(BTISRVPARITNOM)!='' ORDER BY BTISRVPARITNOM", [], opts),
      ]);
      await conn.close();
      return { tipos:r1.rows.map(function(r){return(r.V||'').trim();}).filter(Boolean), ittipos:r2.rows.map(function(r){return(r.V||'').trim();}).filter(Boolean), itnoms:r3.rows.map(function(r){return(r.V||'').trim();}).filter(Boolean) };
    } catch(e) { await conn.close(); throw e; }
  }
}

async function sg_queryMethodDetailsBatch(platform, db, version, service, methods) {
  if (!methods.length) return {};
  const v3 = version === 'V3', svcCol = v3?'BTISrvNom':'BTISRVNOM', mtdCol = v3?'BTIMtdNom':'BTIMTDNOM';
  const cols = v3 ? 'BTIMtdNom,BTIMtdDsc,BTIMtdNSBT,BTIMtdPgmNom,BTIMtdPgmMtd,BTIMtdStatus,BTIMtdFPath,BTIMtdEnbTra,BTIMtdEsPgGx' : 'BTIMTDNOM,BTIMTDDSC,BTIMTDNSBT,BTIMTDPGMNOM,BTIMTDPGMMTD,BTIMTDSTATUS,BTIMTDFPATH,BTIMTDENBTRA,BTIMTDESPGGX';
  function toDetail(row) {
    const g = (k) => row[k] == null ? null : String(row[k]), p = v3?'BTIMtd':'BTIMTD';
    return { dsc:(g(p+(v3?'Dsc':'DSC'))||'').trim(), nsbt:g(p+'NSBT'), pgmnom:(g(p+(v3?'PgmNom':'PGMNOM'))||'').trim(), pgmmtd:(g(p+(v3?'PgmMtd':'PGMMTD'))||'execute').trim(), status:(g(p+(v3?'Status':'STATUS'))||'Validado').trim(), fpath:g(p+(v3?'FPath':'FPATH')), enbtra:row[p+(v3?'EnbTra':'ENBTRA')]==null?'NULL':g(p+(v3?'EnbTra':'ENBTRA')), espggx:g(p+(v3?'EsPgGx':'ESPGGX')) };
  }
  if (platform === 'sqlserver') {
    const { pool, mssql } = await sg_getPool(db);
    const req = pool.request().input('svc',mssql.VarChar(100),service);
    const inParams = methods.map((m,i) => { req.input('m'+i,mssql.VarChar(100),m); return '@m'+i; });
    const r = await req.query('SELECT '+cols+' FROM BTI014 WHERE '+svcCol+'=@svc AND '+mtdCol+' IN ('+inParams.join(',')+')');
    const result = {}; r.recordset.forEach(function(row) { result[(row[mtdCol]||'').trim()] = toDetail(row); }); return result;
  } else {
    const { conn, oracledb } = await sg_getOra(db);
    try {
      const placeholders = methods.map((_,i) => ':'+(i+2)).join(',');
      const r = await conn.execute('SELECT '+cols+' FROM BTI014 WHERE BTISRVNOM=:1 AND BTIMTDNOM IN ('+placeholders+')', [service,...methods], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      const result = {}; r.rows.forEach(function(row) { result[(row.BTIMTDNOM||'').trim()] = toDetail(row); }); return result;
    } finally { await conn.close(); }
  }
}

async function sg_queryMethodParamsBatch(platform, db, version, service, srvver, methods) {
  if (!methods.length) return {};
  const v3 = version==='V3', ver = String(srvver||'1');
  const svcCol=v3?'BTISrvNom':'BTISRVNOM', verCol=v3?'BTISrvVer':'BTISRVVER', mtdCol=v3?'BTIMtdNom':'BTIMTDNOM', posiCol=v3?'BTISrvParPosi':'BTISRVPARPOSI';
  const selectCols = v3 ? 'BTIMtdNom,BTISrvParPosi,BTISrvParNom,BTISrvParNomJava,BTISrvParDir,BTISrvVarTipo,BTISrvParItTipo,BTISrvParValor,BTISrvSDTVer,BTISrvCat,BTISrvCatIt,BTISrvParLargo,BTISrvParLVal,BTISrvParItNom,BTISRVPARDECI' : 'BTIMTDNOM,BTISRVPARPOSI,BTISRVPARNOM,BTISRVPARNOMJAVA,BTISRVPARDIR,BTISRVVARTIPO,BTISRVPARITTIPO,BTISRVPARVALOR,BTISRVCATIT,BTISRVCAT,BTISRVSDTVER,BTISRVPARLARGO,BTISRVPARLVAL,BTISRVPARITNOM,BTISRVPARDECI,BTISRVPARDSC';
  const emptyResult = () => { const r = {}; methods.forEach(m => { r[m] = []; }); return r; };
  if (platform === 'sqlserver') {
    const { pool, mssql } = await sg_getPool(db);
    const req = pool.request().input('svc',mssql.VarChar(100),service).input('ver',mssql.VarChar(10),ver);
    const inParams = methods.map((m,i) => { req.input('m'+i,mssql.VarChar(100),m); return '@m'+i; });
    const r = await req.query('SELECT '+selectCols+' FROM BTI019 WHERE '+svcCol+'=@svc AND '+verCol+'=@ver AND '+mtdCol+' IN ('+inParams.join(',')+') ORDER BY '+mtdCol+','+posiCol);
    const result = emptyResult(); r.recordset.forEach(function(row) { const name=(row[v3?'BTIMtdNom':'BTIMTDNOM']||'').trim(); if(result[name])result[name].push(sg_mapParamRow(row,version)); }); return result;
  } else {
    const { conn, oracledb } = await sg_getOra(db);
    try {
      const placeholders = methods.map((_,i) => ':'+(i+3)).join(',');
      const r = await conn.execute('SELECT '+selectCols+' FROM BTI019 WHERE BTISRVNOM=:1 AND BTISRVVER=:2 AND BTIMTDNOM IN ('+placeholders+') ORDER BY BTIMTDNOM,BTISRVPARPOSI', [service,ver,...methods], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      const result = emptyResult(); r.rows.forEach(function(row) { const name=(row.BTIMTDNOM||'').trim(); if(result[name])result[name].push(sg_mapParamRow(row,version)); }); return result;
    } finally { await conn.close(); }
  }
}

async function sg_queryBti025(platform, db, version, sdtNom) {
  if (platform === 'sqlserver') {
    const { pool, mssql } = await sg_getPool(db);
    const r = await pool.request().input('nom',mssql.VarChar(100),sdtNom).query('SELECT TOP 1 BTISDTNom,BTISDTVersion,BTISDTDescrip,BTISDTNativo,BTISDTFecha,BTISDTNomInt,BTISDTEstado,BTISDTTipo,BTISDTNameSpace FROM BTI025 WHERE BTISDTNom=@nom');
    if (!r.recordset.length) return null;
    const row = r.recordset[0], g = k => row[k] == null ? '' : String(row[k]).trim();
    return { nom:g('BTISDTNom'), version:g('BTISDTVersion'), descrip:g('BTISDTDescrip'), nativo:g('BTISDTNativo'), fecha:row.BTISDTFecha, nomint:g('BTISDTNomInt'), estado:(g('BTISDTEstado')||'Desarrollo').padEnd(20).slice(0,20), tipo:row.BTISDTTipo!=null?String(row.BTISDTTipo):'0', namespace:g('BTISDTNameSpace') };
  } else {
    const { conn, oracledb } = await sg_getOra(db);
    try {
      const r = await conn.execute('SELECT BTISDTNOM,BTISDTVERSION,BTISDTNOMINT,BTISDTESTADO,BTISDTTIPO,BTISDTNAMESPACE,BTISDTFECHA,BTISDTDESCRIP,BTISDTNATIVO FROM BTI025 WHERE BTISDTNOM=:1 AND ROWNUM=1', [sdtNom], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      await conn.close();
      if (!r.rows.length) return null;
      const row = r.rows[0], g = k => row[k] == null ? '' : String(row[k]).trim();
      return { nom:g('BTISDTNOM'), version:g('BTISDTVERSION'), descrip:g('BTISDTDESCRIP'), nativo:g('BTISDTNATIVO'), fecha:row.BTISDTFECHA, nomint:g('BTISDTNOMINT'), estado:(g('BTISDTESTADO')||'Desarrollo').padEnd(20).slice(0,20), tipo:row.BTISDTTIPO!=null?String(row.BTISDTTIPO):'0', namespace:g('BTISDTNAMESPACE') };
    } catch(e) { await conn.close(); throw e; }
  }
}

async function sg_queryBti026(platform, db, version, sdtNom) {
  if (platform === 'sqlserver') {
    const { pool, mssql } = await sg_getPool(db);
    const r = await pool.request().input('nom',mssql.VarChar(100),sdtNom).query('SELECT BTISDTELEMNOM,BTISDTELEMTIPO,BTISDTELEMLARGO,BTISDTELEMCAT,BTISDTELEMDSC,BTISDTELEMSDT FROM BTI026 WHERE BTISDTNOM=@nom ORDER BY BTISDTELEMNOM');
    return r.recordset.map(function(row) { const g=k=>row[k]==null?'':String(row[k]).trim(); return {elemnom:g('BTISDTELEMNOM'),elemtipo:g('BTISDTELEMTIPO'),elemlargo:row.BTISDTELEMLARGO!=null?String(row.BTISDTELEMLARGO):'0',elemdeci:'0',elemcat:g('BTISDTELEMCAT'),elemdsc:g('BTISDTELEMDSC'),elemsdt:g('BTISDTELEMSDT')}; });
  } else {
    const { conn, oracledb } = await sg_getOra(db);
    try {
      const r = await conn.execute('SELECT BTISDTELEMNOM,BTISDTELEMTIPO,BTISDTELEMLARGO,BTISDTELEMDECI,BTISDTELEMCAT,BTISDTELEMDSC,BTISDTELEMSDT FROM BTI026 WHERE BTISDTNOM=:1 ORDER BY BTISDTELEMNOM', [sdtNom], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      await conn.close();
      return r.rows.map(function(row) { const g=k=>row[k]==null?'':String(row[k]).trim(); return {elemnom:g('BTISDTELEMNOM'),elemtipo:g('BTISDTELEMTIPO'),elemlargo:row.BTISDTELEMLARGO!=null?String(row.BTISDTELEMLARGO):'0',elemdeci:row.BTISDTELEMDECI!=null?String(row.BTISDTELEMDECI):'0',elemcat:g('BTISDTELEMCAT'),elemdsc:g('BTISDTELEMDSC'),elemsdt:g('BTISDTELEMSDT')}; });
    } catch(e) { await conn.close(); throw e; }
  }
}

async function sg_querySdtsBatch(platform, db, version, initialSdtNames) {
  const result = new Map();
  const toProcess = [...new Set(initialSdtNames.filter(Boolean).map(function(s){return s.trim();}).filter(Boolean))];
  const processed = new Set();
  while (toProcess.length) {
    const sdtNom = toProcess.shift();
    if (processed.has(sdtNom)) continue;
    processed.add(sdtNom);
    const b25 = await sg_queryBti025(platform, db, version, sdtNom);
    const b26 = await sg_queryBti026(platform, db, version, sdtNom);
    result.set(sdtNom, { nom: sdtNom, bti025: b25, bti026: b26 });
    for (var i = 0; i < b26.length; i++) {
      const e = b26[i];
      const ns = e.elemsdt || (e.elemtipo && e.elemtipo.startsWith('Sdt') ? e.elemtipo : '');
      if (ns && !SG_SDT_EXCLUDE.has(ns) && !processed.has(ns)) toProcess.push(ns);
    }
  }
  return [...result.values()];
}

const VALIDATE_ENGLISH_RE = /\b(the|this|that|these|those|is|are|was|were|has|have|had|get|gets|set|sets|update|updates|create|creates|delete|deletes|return|returns|method|service|parameter|value|field|list|object|type|name|code|date|amount|flag|allow|allows|perform|performs|retrieve|retrieves)\b/i;
const VALIDATE_LARGO_TYPES = new Set(['long','int','double','byte','short','string']);

const VALIDATE_SDT_LARGO_TYPES = new Set(['C', 'N', 'F']);

async function sg_validateSdts(platform, db, version, params, svcNom, mtdNom) {
  const w = [];
  const sdtNames = new Set();
  params.forEach(function(p) {
    const ittipo = (p.ittipo || '').trim();
    const tipo   = (p.tipo   || '').trim();
    if (ittipo.startsWith('Sdt') && !SG_SDT_EXCLUDE.has(ittipo)) sdtNames.add(ittipo);
    if (tipo.startsWith('Sdt')   && !SG_SDT_EXCLUDE.has(tipo))   sdtNames.add(tipo);
  });
  if (!sdtNames.size) return { warnings: w, sdts: [] };
  const sdts = await sg_querySdtsBatch(platform, db, version, [...sdtNames]);
  sdts.forEach(function(sdt) {
    (sdt.bti026 || []).forEach(function(f) {
      const campo = sdt.nom + '.' + f.elemnom;
      const dsc   = (f.elemdsc || '').trim();
      if (!dsc) {
        w.push({ service: svcNom, method: mtdNom, field: 'BTISDTELEMDSC', param: campo, msg: 'Descripción vacía.' });
      } else {
        if (!dsc.endsWith('.'))            w.push({ service: svcNom, method: mtdNom, field: 'BTISDTELEMDSC', param: campo, msg: 'No termina con punto.' });
        if (VALIDATE_ENGLISH_RE.test(dsc)) w.push({ service: svcNom, method: mtdNom, field: 'BTISDTELEMDSC', param: campo, msg: 'Podría estar en inglés.' });
      }
      const tipoRaw = (f.elemtipo || '').toUpperCase();
      if (VALIDATE_SDT_LARGO_TYPES.has(tipoRaw) && parseInt(f.elemlargo || '0') === 0) {
        w.push({ service: svcNom, method: mtdNom, field: 'BTISDTELEMLARGO', param: campo, msg: 'Largo es 0 para tipo ' + f.elemtipo + '.' });
      }
    });
  });
  return { warnings: w, sdts };
}

function sg_validateOne(mtdNom, svcNom, method, params) {
  const w = [];
  const dsc = (method.dsc || '').trim();
  if (!dsc) {
    w.push({ service: svcNom, method: mtdNom, field: 'BTIMTDDSC', msg: 'Descripción vacía.' });
  } else {
    if (!/^m[eé]todo para /i.test(dsc)) w.push({ service: svcNom, method: mtdNom, field: 'BTIMTDDSC', msg: 'No comienza con "Método para".' });
    if (!dsc.endsWith('.'))             w.push({ service: svcNom, method: mtdNom, field: 'BTIMTDDSC', msg: 'No termina con punto.' });
    if (VALIDATE_ENGLISH_RE.test(dsc)) w.push({ service: svcNom, method: mtdNom, field: 'BTIMTDDSC', msg: 'Podría estar en inglés.' });
  }
  params.forEach(function(p) {
    const pnom = p.nom || '?', tipo = (p.tipo || '').toLowerCase().trim();
    const pdsc = p.dsc !== undefined ? (p.dsc || '').trim() : undefined;
    if (pdsc !== undefined) {
      if (!pdsc) w.push({ service: svcNom, method: mtdNom, field: 'BTISRVPARDSC', param: pnom, msg: 'Descripción vacía.' });
      else {
        if (!pdsc.endsWith('.'))             w.push({ service: svcNom, method: mtdNom, field: 'BTISRVPARDSC', param: pnom, msg: 'No termina con punto.' });
        if (VALIDATE_ENGLISH_RE.test(pdsc)) w.push({ service: svcNom, method: mtdNom, field: 'BTISRVPARDSC', param: pnom, msg: 'Podría estar en inglés.' });
      }
    }
    if (VALIDATE_LARGO_TYPES.has(tipo) && parseInt(p.largo || '0') === 0) w.push({ service: svcNom, method: mtdNom, field: 'BTISRVPARLARGO', param: pnom, msg: 'Largo es 0 para tipo ' + p.tipo + '.' });
    if (tipo === 'double' && parseInt(p.deci || '0') === 0)               w.push({ service: svcNom, method: mtdNom, field: 'BTISRVPARDECI',  param: pnom, msg: 'Decimales son 0 para tipo double.' });
  });
  return w;
}

// Mapea una fila de BTI019 (parametro de un metodo) al shape comun que
// consume el resto del codigo, sin importar si vino de la rama V3 (SQL
// Server) o V4 (Oracle) de queryMethodSchema.
// Nota V3: BTI019 en V3 no tiene columna de descripcion por parametro,
// asi que el SELECT de la rama V3 no la selecciona; `row.BTISRVPARDSC`
// llega como `undefined` y `description` queda en '' para esos casos.
// Esto es intencional, no un dato faltante por error.
function mapMethodSchemaRow(row) {
  const name = (row.BTISRVPARNOM || '').trim();
  const type = (row.BTISRVVARTIPO || '').trim();
  const direction = (row.BTISRVPARDIR || '').trim();
  const category = (row.BTISRVCATIT || '').trim();
  const itemType = (row.BTISRVPARITTIPO || '').trim();
  const itemName = (row.BTISRVPARITNOM || '').trim();
  const sdtType = itemType || (type.startsWith('Sdt') ? type : '');
  return {
    name,
    type,
    direction,
    category,
    itemType,
    itemName,
    sdtType,
    isComplex: !!sdtType,
    isCollection: category === 'C' || (category === 'S' && !!itemType),
    description: (row.BTISRVPARDSC || '').trim(),
    length: row.BTISRVPARLARGO,
    decimals: row.BTISRVPARDECI
  };
}

function mapBti026SchemaRow(row) {
  const type = (row.BTISDTELEMTIPO || '').trim();
  const category = (row.BTISDTELEMCAT || '').trim();
  const sdtType = (row.BTISDTELEMSDT && row.BTISDTELEMSDT.trim()) ||
                  (type.startsWith('Sdt') ? type : '');
  return {
    name: (row.BTISDTELEMNOM || '').trim(),
    type,
    category,
    sdtType,
    isComplex: !!sdtType,
    isCollection: category === 'C',
    description: (row.BTISDTELEMDSC || '').trim(),
    length: row.BTISDTELEMLARGO,
    decimals: row.BTISDTELEMDECI
  };
}

// ================================================================
// queryMethodSchema
// ----------------------------------------------------------------
// Punto de entrada UNICO para leer el esquema (inputs/outputs/SDTs)
// de un metodo puntual, usado por el flujo "Casos de uso" (Collections)
// cuando el catalogo se carga desde Base de datos.
//
// La funcion se bifurca por `platform` ('sqlserver' vs 'oracle'), y en
// este proyecto esa bifurcacion YA equivale 1 a 1 a la version de
// Bantotal: V3 siempre corre sobre SQL Server, V4 siempre sobre
// Oracle (ver db_history.json y el resto de setup.js). Por eso no
// hace falta un parametro `version` extra aca: cada rama de abajo
// es, en la practica, el codigo de una sola version, y estan
// completamente separadas (ni comparten el texto del SELECT ni
// ninguna variable intermedia). Tocar una rama NUNCA debe requerir
// tocar la otra.
// ================================================================
async function queryMethodSchema(platform, db, service, method) {
  if (platform === 'sqlserver') {
    // ==============================================================
    // RAMA V3 (SQL Server / GeneXus BT clasico - tablas BTI014/BTI019/BTI026)
    // ==============================================================
    // IMPORTANTE - diferencia real de esquema entre V3 y V4:
    // El nombre de columnas de V3 esta en PascalCase (ej. BTISrvParNom)
    // mientras que V4 (Oracle) las tiene en MAYUSCULAS (BTISRVPARNOM).
    // Eso NO requiere ningun cambio aca: SQL Server compara nombres de
    // columna sin distinguir mayusculas/minusculas con el collation por
    // defecto, asi que "BTISRVPARNOM" en el SELECT matchea sin problema
    // contra la columna real "BTISrvParNom".
    //
    // Lo que SI es una diferencia real (no solo de casing) es que la
    // tabla BTI019 de V3 NO tiene ninguna columna de descripcion por
    // parametro (no existe un equivalente a BTISRVPARDSC de V4 en este
    // esquema). Por eso el SELECT de abajo omite esa columna para V3;
    // mapMethodSchemaRow ya tolera su ausencia (linea ~782: usa
    // `row.BTISRVPARDSC || ''`) y deja `description` en '' para los
    // parametros de V3, sin romper el shape que espera el resto del
    // codigo. BTI026 (descripcion a nivel de campo de un SDT) SI tiene
    // su columna equivalente (BTISDTElemDsc) en V3, por eso esa query
    // no cambia.
    //
    // Confirmado contra el esquema real de V3 (INFORMATION_SCHEMA.COLUMNS
    // de BTI014/BTI019/BTI026, provisto por el usuario) el 2026-07-22.
    // Si en el futuro aparece otro "Invalid column name" para V3, hay
    // que volver a pedir el esquema real de esa tabla puntual antes de
    // adivinar nombres de columna: NO restaurar columnas de la rama V4
    // "por las dudas", porque eso reintroduce este mismo bug.
    const mod = path.join(ROOT, 'V3', 'node_modules', 'mssql');
    if (!fs.existsSync(mod)) throw new Error('mssql no instalado - ejecuta npm install en V3/');
    const mssql = require(mod);
    const pool = new mssql.ConnectionPool({
      server: db.DB_SERVER,
      port: Number(db.DB_PORT) || 1433,
      database: db.DB_DATABASE,
      user: db.DB_USER,
      password: db.DB_PASSWORD,
      options: { trustServerCertificate: true },
      connectionTimeout: 8000,
    });
    await pool.connect();
    try {
      const meta = await pool.request()
        .input('svc', mssql.VarChar(100), service)
        .input('mtd', mssql.VarChar(100), method)
        // Sin BTISRVPARDSC: en V3 esa columna no existe en BTI019 (ver nota arriba).
        .query(`SELECT BTISRVPARNOM, BTISRVVARTIPO, BTISRVPARDIR, BTISRVPARLARGO, BTISRVPARDECI, BTISRVCATIT, BTISRVPARITTIPO, BTISRVPARITNOM
                  FROM BTI019
                 WHERE BTISRVNOM = @svc AND BTIMTDNOM = @mtd
                 ORDER BY BTISRVPARPOSI`);

      const info = await pool.request()
        .input('svc', mssql.VarChar(100), service)
        .input('mtd', mssql.VarChar(100), method)
        .query('SELECT BTIMTDDSC FROM BTI014 WHERE BTISRVNOM = @svc AND BTIMTDNOM = @mtd');

      const sdts = {};
      async function loadSdt(sdtName) {
        if (!sdtName || sdts[sdtName]) return;
        // BTI026 si tiene descripcion por campo (BTISDTElemDsc) en V3:
        // este SELECT queda identico al de la rama V4, sin cambios.
        const r26 = await pool.request()
          .input('sdt', mssql.VarChar(100), sdtName)
          .query(`SELECT BTISDTELEMNOM, BTISDTELEMTIPO, BTISDTELEMLARGO, BTISDTELEMDECI, BTISDTELEMCAT, BTISDTELEMDSC, BTISDTELEMSDT
                    FROM BTI026
                   WHERE BTISDTNOM = @sdt
                   ORDER BY BTISDTELEMNOM`);
        sdts[sdtName] = r26.recordset.map(mapBti026SchemaRow).filter(function(field) { return field.name; });
        for (const field of sdts[sdtName]) {
          if (field.sdtType) await loadSdt(field.sdtType);
        }
      }

      const params = meta.recordset.map(mapMethodSchemaRow).filter(function(param) { return param.name; });
      for (const param of params) {
        if (param.sdtType) await loadSdt(param.sdtType);
      }

      return {
        service,
        method,
        description: info.recordset[0] && info.recordset[0].BTIMTDDSC ? info.recordset[0].BTIMTDDSC.trim() : '',
        inputs: params.filter(function(param) { return param.direction === 'I'; }),
        outputs: params.filter(function(param) { return param.direction === 'O' || param.direction === 'R'; }),
        sdts
      };
    } finally {
      await pool.close();
    }
  }

  // ==================================================================
  // RAMA V4 (Oracle). A proposito DEBAJO del `return`/`if` de arriba y
  // sin ningun `else`: si `platform === 'sqlserver'` la funcion ya
  // termino y retorno en el bloque de arriba (V3). Este bloque de aca
  // abajo es exclusivamente para V4/Oracle y quedo BYTE A BYTE igual
  // que antes de resolver el bug de columnas de V3 (no se le toco una
  // sola linea): la separacion entre versiones es completa a proposito,
  // para que un cambio de esquema de V3 nunca pueda afectar a V4 y
  // viceversa.
  // ==================================================================
  const mod = path.join(ROOT, 'V4', 'node_modules', 'oracledb');
  if (!fs.existsSync(mod)) throw new Error('oracledb no instalado - ejecuta npm install en V4/');
  const oracledb = require(mod);
  const conn = await oracledb.getConnection({
    user: db.DB_USER,
    password: db.DB_PASSWORD,
    connectString: db.DB_CONNECT_STRING,
  });
  try {
    const meta = await conn.execute(
      `SELECT BTISRVPARNOM, BTISRVVARTIPO, BTISRVPARDIR, BTISRVPARDSC, BTISRVPARLARGO, BTISRVPARDECI, BTISRVCATIT, BTISRVPARITTIPO, BTISRVPARITNOM
         FROM BTI019
        WHERE BTISRVNOM = :1 AND BTIMTDNOM = :2
        ORDER BY BTISRVPARPOSI`,
      [service, method],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const info = await conn.execute(
      'SELECT BTIMTDDSC FROM BTI014 WHERE BTISRVNOM = :1 AND BTIMTDNOM = :2',
      [service, method],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const sdts = {};
    async function loadSdt(sdtName) {
      if (!sdtName || sdts[sdtName]) return;
      const r26 = await conn.execute(
        `SELECT BTISDTELEMNOM, BTISDTELEMTIPO, BTISDTELEMLARGO, BTISDTELEMDECI, BTISDTELEMCAT, BTISDTELEMDSC, BTISDTELEMSDT
           FROM BTI026
          WHERE BTISDTNOM = :1
          ORDER BY BTISDTELEMNOM`,
        [sdtName],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      sdts[sdtName] = r26.rows.map(mapBti026SchemaRow).filter(function(field) { return field.name; });
      for (const field of sdts[sdtName]) {
        if (field.sdtType) await loadSdt(field.sdtType);
      }
    }

    const params = meta.rows.map(mapMethodSchemaRow).filter(function(param) { return param.name; });
    for (const param of params) {
      if (param.sdtType) await loadSdt(param.sdtType);
    }

    return {
      service,
      method,
      description: info.rows[0] && info.rows[0].BTIMTDDSC ? info.rows[0].BTIMTDDSC.trim() : '',
      inputs: params.filter(function(param) { return param.direction === 'I'; }),
      outputs: params.filter(function(param) { return param.direction === 'O' || param.direction === 'R'; }),
      sdts
    };
  } finally {
    await conn.close();
  }
}

  const collectionFeature = createCollectionFeature({
    ROOT,
    queryServicesWithMethods,
    queryMethodSchema
  });

// -- server ------------------------------------------------

const PUBLIC_DIR = path.join(ROOT, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
};

function serveStatic(res, filePath) {
  const ext  = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  try {
    res.writeHead(200, { 'Content-Type': mime });
    res.end(fs.readFileSync(filePath));
  } catch(e) {
    res.writeHead(404); res.end();
  }
}

http.createServer(async (req, res) => {
  const json = (code, data) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  if (req.method === 'GET' && req.url === '/') {
    serveStatic(res, path.join(PUBLIC_DIR, 'index.html'));
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/public/')) {
    const rel  = req.url.slice('/public/'.length);
    const full = path.resolve(PUBLIC_DIR, rel);
    if (!full.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end(); return; }
    serveStatic(res, full);
    return;
  }

  if (await collectionFeature.handleApi(req, res, { readBody, json })) {
    return;
  }

  if (req.method === 'POST' && req.url === '/api/load-env') {
    try {
      const { version } = await readBody(req);
      const envPath = path.join(ROOT, version, '.env');
      if (!fs.existsSync(envPath)) { json(200, { ok: false }); return; }
      const content = fs.readFileSync(envPath, 'utf8');
      json(200, { ok: true, data: parseEnvFile(content) });
    } catch (e) {
      json(200, { ok: false, message: e.message });
    }
    return;
  }

  if (req.method === 'GET' && req.url === '/api/alive') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(': connected\n\n');
    onClientConnected();
    req.on('close', onClientDisconnected);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/test') {
    try {
      const { platform, db } = await readBody(req);
      if (platform === 'sqlserver') await testSqlServer(db);
      else await testOracle(db);
      json(200, { ok: true });
    } catch (e) {
      json(200, { ok: false, message: e.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/test-auth') {
    try {
      const { version, api, authUrl: explicitAuthUrl } = await readBody(req);
      const https = require('https');
      let authUrl = explicitAuthUrl || (version === 'V3' ? api.API_AUTH_URL : resolveV4AuthUrl(api));
      if (version === 'V3') {
        authUrl = String(authUrl || '').trim();
        if (!/[?&]Execute$/i.test(authUrl)) {
          authUrl += (authUrl.indexOf('?') >= 0 ? '&' : '?') + 'Execute';
        }
      }
      const isV4 = version === 'V4';
      const body = isV4
        ? JSON.stringify({ UserId: api.API_USER, UserPassword: api.API_PASSWORD })
        : JSON.stringify({
            Btinreq: { Canal: api.API_CANAL || 'BTDIGITAL', Usuario: api.API_USER, Device: api.API_DEVICE || 'INSTALADOR', Requerimiento: api.API_REQUERIMIENTO || '1', Token: '' },
            UserId: api.API_USER,
            UserPassword: api.API_PASSWORD
          });
      const parsed = new URL(authUrl);
      const mod = parsed.protocol === 'https:' ? require('https') : require('http');
      const raw = await new Promise((resolve, reject) => {
        const btHeaders = isV4 ? {
          Canal:        api.API_CANAL        || 'BTDIGITAL',
          Device:       api.API_DEVICE       || 'INSTALADOR',
          Usuario:      api.API_USER,
          Requerimiento: api.API_REQUERIMIENTO || '1',
          Token:        '',
          'idempotency-key': '1'
        } : {};
        const options = {
          hostname: parsed.hostname, port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
          path: parsed.pathname + parsed.search, method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...btHeaders },
          rejectUnauthorized: false
        };
        const r = mod.request(options, res => {
          let s = ''; res.on('data', c => s += c); res.on('end', () => resolve(s));
        });
        r.on('error', reject);
        r.write(body); r.end();
      });
      let parsed2;
      try { parsed2 = JSON.parse(raw); } catch { throw new Error('Respuesta inesperada: ' + raw.slice(0, 200)); }
      const token = parsed2.SessionToken;
      if (!token) throw new Error(parsed2.Btoutreq?.Mensaje || parsed2.Mensaje || JSON.stringify(parsed2).slice(0, 200));
      json(200, {
        ok: true,
        token,
        authContext: {
          channel: api.API_CANAL || 'BTDIGITAL',
          username: api.API_USER || '',
          device: api.API_DEVICE || 'INSTALADOR',
          requirement: api.API_REQUERIMIENTO || '1',
          token
        }
      });
    } catch(e) {
      json(200, { ok: false, message: e.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/services') {
    try {
      const { platform, db } = await readBody(req);
      const services = await queryServices(platform, db);
      json(200, { ok: true, services });
    } catch (e) {
      json(200, { ok: false, message: e.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/methods') {
    try {
      const { platform, db, service } = await readBody(req);
      const methods = await queryMethods(platform, db, service);
      json(200, { ok: true, methods });
    } catch (e) {
      json(200, { ok: false, message: e.message });
    }
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/files/')) {
    try {
      const relPath = decodeURIComponent(req.url.slice('/files/'.length));
      const filePath = path.resolve(ROOT, relPath);
      if (!filePath.startsWith(ROOT) || !filePath.endsWith('.md')) {
        res.writeHead(403); res.end(); return;
      }
      if (!fs.existsSync(filePath)) { res.writeHead(404); res.end(); return; }
      const filename = path.basename(filePath);
      res.writeHead(200, {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="' + filename + '"',
      });
      res.end(fs.readFileSync(filePath));
    } catch(e) { res.writeHead(500); res.end(); }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/open-folder') {
    try {
      const { folder } = await readBody(req);
      const folderPath = path.resolve(ROOT, folder);
      if (!folderPath.startsWith(ROOT)) { json(400, { ok: false }); return; }
      const cmd = process.platform === 'win32' ? 'explorer "' + folderPath + '"'
                : process.platform === 'darwin' ? 'open "' + folderPath + '"'
                : 'xdg-open "' + folderPath + '"';
      exec(cmd);
      json(200, { ok: true });
    } catch(e) { json(200, { ok: false, message: e.message }); }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/analyze-workflow') {
    let body;
    try { body = await readBody(req); } catch(e) { res.writeHead(400); res.end(); return; }
    const { version, service } = body;
    const cwd = path.join(ROOT, version);
    const outputFile = 'workflows/' + service + '_workflow.json';
    try {
      await new Promise((resolve, reject) => {
        let out = '';
        const wfScript = path.join(ROOT, 'scripts', 'generar-doc', 'workflow-' + version.toLowerCase() + '.js');
        const child = spawn('node', [wfScript, service, outputFile], { cwd });
        child.stdout.on('data', d => { out += d.toString(); });
        child.stderr.on('data', d => { out += d.toString(); });
        child.on('close', code => { code === 0 ? resolve() : reject(new Error(out.slice(-600))); });
        child.on('error', reject);
      });
      const wfPath = path.join(cwd, outputFile);
      const workflow = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
      json(200, { ok: true, workflow, file: outputFile });
    } catch(e) {
      json(200, { ok: false, message: e.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/input-params') {
    try {
      const { platform, db, service, method } = await readBody(req);
      const params = await queryInputParams(platform, db, service, method);
      json(200, { ok: true, params });
    } catch (e) {
      json(200, { ok: false, message: e.message, params: [] });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/generate') {
    let body;
    try { body = await readBody(req); } catch(e) { res.writeHead(400); res.end(); return; }
    const { version, items: genItems, ejecutar, paramValues, wfOverrides, cacheKey } = body;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    const send = (data) => { try { res.write('data: ' + JSON.stringify(data) + '\n\n'); } catch(e) {} };
    const cwd = path.join(ROOT, version);
    const mdScript = path.join(ROOT, 'scripts', 'generar-doc', version.toLowerCase() + '.js');
    for (let i = 0; i < genItems.length; i++) {
      const item = genItems[i];
      send({ type: 'start', index: i });
      let args;
      let tempCacheFile = null;
      if (ejecutar && item.method === '__all__') {
        const wfFile = 'workflows/' + item.service + '_workflow.json';
        const wfPath = path.join(cwd, wfFile);
        if (wfOverrides && wfOverrides[item.service]) {
          fs.writeFileSync(wfPath, JSON.stringify(wfOverrides[item.service], null, 2), 'utf8');
        }
        if (fs.existsSync(wfPath)) {
          args = [mdScript, '--workflow', wfFile];
        } else {
          args = [mdScript, item.service, '--ejecutar'];
        }
      } else {
        args = [mdScript, item.service];
        if (item.method && item.method !== '__all__') args.push(item.method);
        // Si hay datos en caché y no se solicita ejecución real, pasarlos como archivo temp
        if (cacheKey && !ejecutar && item.method && item.method !== '__all__') {
          const cached = docCacheGet(cacheKey, item.service, item.method);
          if (cached) {
            tempCacheFile = path.join(os.tmpdir(), 'bt_cache_' + item.service + '_' + item.method + '_' + cacheKey.slice(0, 8) + '.json');
            fs.writeFileSync(tempCacheFile, JSON.stringify(cached), 'utf8');
            args.push('--cache-file', tempCacheFile);
          }
        }
        if (ejecutar) {
          args.push('--ejecutar');
          const pv = paramValues && paramValues[i];
          if (pv && Object.keys(pv).length > 0) args.push('--params', JSON.stringify(pv));
        }
      }
      await new Promise((resolve) => {
        let output = '';
        const child = spawn('node', args, { cwd });
        child.stdout.on('data', d => { output += d.toString(); });
        child.stderr.on('data', d => { output += d.toString(); });
        child.on('close', code => {
          if (tempCacheFile) try { fs.unlinkSync(tempCacheFile); } catch(_) {}
          send({ type: 'result', index: i, code, output });
          resolve();
        });
        child.on('error', err => {
          if (tempCacheFile) try { fs.unlinkSync(tempCacheFile); } catch(_) {}
          send({ type: 'result', index: i, code: 1, output: err.message });
          resolve();
        });
      });
    }
    send({ type: 'end' });
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/check-files') {
    try {
      const { version, items: fileItems } = await readBody(req);
      const toFolderNameSrv = s => s.replace(/^Public/, '').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').replace(/([a-z\d])([A-Z])/g, '$1-$2');
      const results = (fileItems || []).map(function(item) {
        const relPath = version + '/' + toFolderNameSrv(item.service) + '/' + item.method + '.md';
        const fullPath = path.resolve(ROOT, relPath);
        try {
          const stat = fs.statSync(fullPath);
          return { service: item.service, method: item.method, exists: true, mtime: stat.mtime.toISOString() };
        } catch(e) {
          return { service: item.service, method: item.method, exists: false };
        }
      });
      json(200, { ok: true, results });
    } catch(e) {
      json(500, { ok: false, message: e.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/save') {
    try {
      const { version, platform, db, api } = await readBody(req);
      const envPath = path.join(ROOT, version, '.env');
      fs.writeFileSync(envPath, buildEnv(version, platform, db, api), 'utf8');
      json(200, { ok: true, path: envPath });
    } catch (e) {
      json(500, { ok: false, message: e.message });
    }
    return;
  }

  // ---- Script Generator routes --------------------------------

  if (req.method === 'GET' && req.url === '/scripts') {
    res.writeHead(301, { 'Location': '/' });
    res.end();
    return;
  }

  if (req.url.startsWith('/sg/api/')) {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      const j = (st, ob) => { res.writeHead(st, {'Content-Type':'application/json'}); res.end(JSON.stringify(ob)); };
      let payload = {};
      try { payload = JSON.parse(body || '{}'); } catch(e) { j(400, {ok:false, message:'JSON inválido'}); return; }

      const route = req.url.slice('/sg/api/'.length);

      if (route === 'load-env') {
        try { const env = sg_loadEnvForVersion(payload.version); j(200, { ok: true, env }); } catch(e) { j(200, { ok: false, message: e.message }); }
        return;
      }
      if (route === 'db-history') {
        try {
          if (payload.action === 'list') {
            j(200, { ok: true, history: readDbHistory() });
          } else if (payload.action === 'save') {
            const list = readDbHistory();
            const db = payload.db || {};
            const key = payload.platform === 'sqlserver'
              ? (payload.version+'|ss|'+(db.server||'')+'|'+(db.database||'')+'|'+(db.user||''))
              : (payload.version+'|ora|'+(db.connectString||'')+'|'+(db.user||''));
            const idx = list.findIndex(function(e) { return e.key === key; });
            const entry = {
              id: idx >= 0 ? list[idx].id : String(Date.now()),
              key, version: payload.version, platform: payload.platform,
              label: payload.label || key,
              db: payload.db,
              savedAt: new Date().toISOString()
            };
            if (idx >= 0) list.splice(idx, 1);
            list.unshift(entry);
            if (list.length > 50) list.length = 50;
            writeDbHistory(list);
            j(200, { ok: true, id: entry.id, updated: idx >= 0 });
          } else if (payload.action === 'delete') {
            writeDbHistory(readDbHistory().filter(function(e) { return e.id !== payload.id; }));
            j(200, { ok: true });
          } else {
            j(200, { ok: false, message: 'Acción desconocida' });
          }
        } catch(e) { j(200, { ok: false, message: e.message }); }
        return;
      }
      if (route === 'test') {
        try { await sg_testConn(payload.platform, payload.db); j(200, { ok: true }); } catch(e) { j(200, { ok: false, message: e.message }); }
        return;
      }
      if (route === 'services') {
        try { const services = await sg_queryServices(payload.platform, payload.db, payload.version); j(200, { ok: true, services }); } catch(e) { j(200, { ok: false, message: e.message }); }
        return;
      }
      if (route === 'methods') {
        try { const methods = await sg_queryMethods(payload.platform, payload.db, payload.version, payload.service); j(200, { ok: true, methods }); } catch(e) { j(200, { ok: false, message: e.message }); }
        return;
      }
      if (route === 'service-versions') {
        try { const versions = await sg_queryServiceVersions(payload.platform, payload.db, payload.version, payload.service); j(200, { ok: true, versions }); } catch(e) { j(200, { ok: false, message: e.message }); }
        return;
      }
      if (route === 'bti004') {
        try { const data = await sg_queryServiceBTI004(payload.platform, payload.db, payload.service); j(200, { ok: true, found: true, data }); } catch(e) { j(200, { ok: false, found: false, message: e.message }); }
        return;
      }
      if (route === 'param-options') {
        try { const opts = await sg_queryParamOptions(payload.platform, payload.db, payload.version); j(200, { ok: true, opts }); } catch(e) { j(200, { ok: false, message: e.message }); }
        return;
      }
      if (route === 'validate') {
        try {
          const reqItems = payload.items || [];
          const byService = {};
          reqItems.forEach(function(it) {
            if (!byService[it.service]) byService[it.service] = new Set();
            byService[it.service].add(it.method);
          });
          let allWarnings = [];
          const cacheEntries = new Map();
          for (const [service, methodSet] of Object.entries(byService)) {
            let methods = [...methodSet];
            if (methods.includes('__all__')) {
              methods = await sg_queryMethods(payload.platform, payload.db, payload.version, service);
            }
            if (!methods.length) continue;
            const versions = await sg_queryServiceVersions(payload.platform, payload.db, payload.version, service);
            const srvver = versions[0] || '1';
            const details = await sg_queryMethodDetailsBatch(payload.platform, payload.db, payload.version, service, methods);
            const params  = await sg_queryMethodParamsBatch(payload.platform, payload.db, payload.version, service, srvver, methods);
            for (const m of methods) {
              allWarnings = allWarnings.concat(sg_validateOne(m, service, details[m] || {}, params[m] || []));
              const sdtResult = await sg_validateSdts(payload.platform, payload.db, payload.version, params[m] || [], service, m);
              allWarnings = allWarnings.concat(sdtResult.warnings);
              cacheEntries.set(service + ':' + m, {
                bti014: sgToOracleBti014(details[m] || {}),
                bti019: sgToOracleBti019(params[m] || []),
                sdt:    sgToOracleBti026(sdtResult.sdts),
              });
            }
          }
          const cacheKey = allWarnings.length === 0 ? docCacheSet(cacheEntries) : null;
          j(200, { ok: true, warnings: allWarnings, cacheKey });
        } catch(e) { j(200, { ok: false, message: e.message }); }
        return;
      }
      if (route === 'methods-full') {
        try {
          const details = await sg_queryMethodDetailsBatch(payload.platform, payload.db, payload.version, payload.service, payload.methods);
          const params  = await sg_queryMethodParamsBatch(payload.platform, payload.db, payload.version, payload.service, payload.srvver, payload.methods);
          const allSdtNames = new Set();
          (payload.methods || []).forEach(function(m) { sg_extractSdtNames(params[m] || []).forEach(function(n) { allSdtNames.add(n); }); });
          const sdts = allSdtNames.size > 0 ? await sg_querySdtsBatch(payload.platform, payload.db, payload.version, [...allSdtNames]) : [];
          const items = (payload.methods || []).map(method => ({
            version: payload.version,
            header: { BTINom: 'BTSERVICES', BTISrvNom: payload.service, BTISrvVer: payload.srvver || '1', BTIMtdNom: method },
            method: details[method] || {},
            params: params[method] || [],
            sdts
          }));
          j(200, { ok: true, items });
        } catch(e) { j(200, { ok: false, message: e.message }); }
        return;
      }
      if (route === 'generate') {
        try {
          const data = payload.data, mode = payload.mode || 'both';
          const items = Array.isArray(data) ? data : [data];
          const methodPart = items.map(function(item) { return sg_generateScript(item, mode); }).join('\n\n');
          const sdtMap = new Map();
          items.forEach(function(item) { (item.sdts || []).forEach(function(sdt) { if (!sdtMap.has(sdt.nom)) sdtMap.set(sdt.nom, { sdt, version: item.version }); }); });
          const sdtPart = [...sdtMap.values()].map(function(e) { return sg_generateSdtScript(e.sdt, mode, e.version); }).filter(Boolean).join('\n\n');
          const script = [methodPart, sdtPart].filter(Boolean).join('\n\n');
          j(200, { ok: true, script });
        } catch(e) { j(200, { ok: false, message: e.message }); }
        return;
      }

      j(404, { ok: false, message: 'Ruta no encontrada' });
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/list-folders') {
    try {
      const { version } = await readBody(req);
      const vDir = path.join(ROOT, version || 'V3');
      if (!fs.existsSync(vDir)) { json(200, { ok: true, folders: [] }); return; }
      const SKIP = new Set(['node_modules', '__pycache__', '.git', '.vscode']);
      const entries = fs.readdirSync(vDir, { withFileTypes: true });
      const folders = entries
        .filter(e => e.isDirectory() && !SKIP.has(e.name))
        .map(e => e.name)
        .sort();
      json(200, { ok: true, folders });
    } catch (e) {
      json(200, { ok: false, message: e.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/validate-md') {
    try {
      const { docPath, version, folder } = await readBody(req);
      const targetPath = docPath || path.join(ROOT, version || 'V3', folder || '');
      const scriptPath = path.join(ROOT, 'scripts', 'validar-doc', 'index.js');
      if (!fs.existsSync(scriptPath)) {
        json(200, { ok: false, output: 'No se encontró validar_md.js en ' + path.join(ROOT, 'scripts', 'validar-doc') });
        return;
      }
      const raw = await new Promise((resolve, reject) => {
        const child = spawn('node', [scriptPath, targetPath, '--json']);
        let out = '';
        child.stdout.on('data', d => out += d.toString());
        child.stderr.on('data', d => out += d.toString());
        child.on('close', () => resolve(out));
        child.on('error', reject);
        setTimeout(() => { child.kill(); resolve(out + '\n[Timeout]'); }, 60000);
      });
      let results;
      try { results = JSON.parse(raw.trim()); } catch { results = null; }
      if (!results) { json(200, { ok: false, output: raw }); return; }
      // Generar texto resumen desde los resultados estructurados
      const lines = [];
      let totalOk = 0, totalErr = 0;
      for (const r of results) {
        if (r.problemas.length === 0) { lines.push(`✅ ${r.relPath}`); totalOk++; }
        else { lines.push(`\n📄 ${r.relPath}`); r.problemas.forEach(p => lines.push(`   ${p}`)); totalErr++; }
      }
      lines.push('\n' + '─'.repeat(60));
      lines.push(`✅ Sin problemas: ${totalOk} | ⚠️  Con problemas: ${totalErr}`);
      json(200, { ok: true, output: lines.join('\n'), results });
    } catch (e) {
      json(200, { ok: false, output: e.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/detect-casing') {
    try {
      const { files } = await readBody(req);
      const scriptPath = path.join(ROOT, 'scripts', 'validar-doc', 'index.js');
      const output = await new Promise((resolve, reject) => {
        const child = spawn('node', [scriptPath, ...(files || []), '--detect-casing']);
        let out = '';
        child.stdout.on('data', d => out += d.toString());
        child.stderr.on('data', d => out += d.toString());
        child.on('close', () => resolve(out));
        child.on('error', reject);
        setTimeout(() => { child.kill(); resolve('[]'); }, 30000);
      });
      let conflicts = [];
      try { conflicts = JSON.parse(output.trim()); } catch {}
      json(200, { ok: true, conflicts });
    } catch (e) {
      json(200, { ok: false, conflicts: [], error: e.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/apply-casing') {
    try {
      const { choices } = await readBody(req);
      const scriptPath = path.join(ROOT, 'scripts', 'validar-doc', 'index.js');
      const tmpFile = path.join(require('os').tmpdir(), `casing_choices_${Date.now()}.json`);
      fs.writeFileSync(tmpFile, JSON.stringify(choices));
      const output = await new Promise((resolve, reject) => {
        const child = spawn('node', [scriptPath, `--apply-casing=${tmpFile}`]);
        let out = '';
        child.stdout.on('data', d => out += d.toString());
        child.stderr.on('data', d => out += d.toString());
        child.on('close', () => { try { fs.unlinkSync(tmpFile); } catch {} resolve(out); });
        child.on('error', reject);
        setTimeout(() => { child.kill(); resolve('{}'); }, 30000);
      });
      let result = {};
      try { result = JSON.parse(output.trim()); } catch {}
      json(200, { ok: true, ...result });
    } catch (e) {
      json(200, { ok: false, error: e.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/fix-md') {
    try {
      const { docPath, files, version, folder } = await readBody(req);
      const scriptPath = path.join(ROOT, 'scripts', 'validar-doc', 'index.js');
      if (!fs.existsSync(scriptPath)) {
        json(200, { ok: false, output: 'No se encontró validar_md.js en ' + path.join(ROOT, 'scripts', 'validar-doc') });
        return;
      }
      // files = array de rutas específicas; docPath = carpeta completa (fallback)
      const cliArgs = (files && files.length > 0)
        ? [...files, '--fix']
        : [docPath || path.join(ROOT, version || 'V3', folder || ''), '--fix'];
      const output = await new Promise((resolve, reject) => {
        const child = spawn('node', [scriptPath, ...cliArgs]);
        let out = '';
        child.stdout.on('data', d => out += d.toString());
        child.stderr.on('data', d => out += d.toString());
        child.on('close', () => resolve(out));
        child.on('error', reject);
        setTimeout(() => { child.kill(); resolve(out + '\n[Timeout]'); }, 60000);
      });
      json(200, { ok: true, output });
    } catch (e) {
      json(200, { ok: false, output: e.message });
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Not found: ' + req.url }));

}).listen(PORT, '127.0.0.1', () => {
  const url = 'http://localhost:' + PORT;
  console.log('\n  Generador MD - Configuracion inicial');
  console.log('  -> Abriendo ' + url + '\n');
  console.log('  Presiona Ctrl+C para cerrar\n');
  const cmd = process.platform === 'win32' ? 'start ' + url
            : process.platform === 'darwin' ? 'open ' + url
            : 'xdg-open ' + url;
  exec(cmd);
});

// ── Apagado automático por inactividad ───────────────────────
// El cliente abre una conexión SSE a /api/alive al cargar la página.
// Cuando la cierra (pestaña/navegador cerrado), el servidor espera
// SHUTDOWN_GRACE_MS y se apaga si no volvió ninguna conexión.
let aliveClients = 0;
let shutdownTimer = null;
const SHUTDOWN_GRACE_MS = 15000;

function onClientConnected() {
  aliveClients++;
  if (shutdownTimer) { clearTimeout(shutdownTimer); shutdownTimer = null; }
}
function onClientDisconnected() {
  aliveClients = Math.max(0, aliveClients - 1);
  if (aliveClients === 0 && !shutdownTimer) {
    shutdownTimer = setTimeout(() => process.exit(0), SHUTDOWN_GRACE_MS);
  }
}
