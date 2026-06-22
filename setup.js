'use strict';
const http = require('http');
const fs   = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const PORT = 3777;
const ROOT = __dirname;

// -- helpers -------------------------------------------

function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', c => (s += c));
    req.on('end', () => { try { resolve(JSON.parse(s)); } catch (e) { reject(e); } });
  });
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
  if (api.DOC_ERRORES_MODELOS) {
    L.push('');
    L.push('# Documentador de Errores');
    L.push('DOC_ERRORES_MODELOS=' + api.DOC_ERRORES_MODELOS);
  }
  return L.join('\n');
}

// ── Script Generator backend ──────────────────────────────
const V3_BTI004_COLS = ['BTINom','BTISrvNom','BTISrvVer','BTISrvDsc','BTISrvNSBT','BTISrvCanNSBT','BTISrvOpNSBT','BTISrvVarNSBT','BTISrvPgmName','BTISrvStatus','BTISrvFPath'];
const V3_BTI014_COLS = ['BTINom','BTISrvNom','BTISrvVer','BTIMtdNom','BTIMtdDsc','BTIMtdNSBT','BTIMtdPgmNom','BTIMtdPgmMtd','BTIMtdStatus','BTIMtdFPath','BTIMtdEnbTra','BTIMtdEsPgGx'];
const V4_BTI014_COLS = ['BTINOM','BTISRVNOM','BTISRVVER','BTIMTDNOM','BTIMTDDSC','BTIMTDNSBT','BTIMTDPGMNOM','BTIMTDPGMMTD','BTIMTDSTATUS','BTIMTDFPATH','BTIMTDENBTRA','BTIMTDESPGGX'];
const V3_BTI019_COLS = ['BTINom','BTISrvNom','BTISrvVer','BTIMtdNom','BTISrvParPosi','BTISrvParNom','BTISrvParNomJava','BTISrvParDir','BTISrvVarTipo','BTISrvParItTipo','BTISrvParValor','BTISrvSDTVer','BTISrvCat','BTISrvCatIt','BTISrvParLargo','BTISrvParLVal','BTISrvParItNom','BTISRVPARDECI'];
const V4_BTI019_COLS = ['BTINOM','BTISRVNOM','BTISRVVER','BTIMTDNOM','BTISRVPARPOSI','BTISRVPARNOM','BTISRVPARNOMJAVA','BTISRVPARDIR','BTISRVVARTIPO','BTISRVPARITTIPO','BTISRVPARVALOR','BTISRVCATIT','BTISRVCAT','BTISRVSDTVER','BTISRVPARLARGO','BTISRVPARLVAL','BTISRVPARITNOM','BTISRVPARDECI','BTISRVPARDSC'];
const V3_BTI025_COLS = ['BTISDTNom','BTISDTVersion','BTISDTDescrip','BTISDTNativo','BTISDTFecha','BTISDTNomInt','BTISDTEstado','BTISDTTipo','BTISDTNameSpace'];
const V4_BTI025_COLS = ['BTISDTNOM','BTISDTVERSION','BTISDTNOMINT','BTISDTESTADO','BTISDTTIPO','BTISDTNAMESPACE','BTISDTFECHA','BTISDTDESCRIP','BTISDTNATIVO'];
const V3_BTI026_COLS = ['BTISDTNom','BTISDTElemNom','BTISDTElemTipo','BTISDTElemLargo','BTISDTElemCat','BTISDTElemDsc','BTISDTElemSDT'];
const V4_BTI026_COLS = ['BTISDTNOM','BTISDTELEMNOM','BTISDTELEMTIPO','BTISDTELEMLARGO','BTISDTELEMDECI','BTISDTELEMCAT','BTISDTELEMDSC','BTISDTELEMSDT'];

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

function sg_fmtDate(val, ver) {
  if (!val) return ver === 'V3' ? "''" : 'NULL';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return ver === 'V3' ? "''" : 'NULL';
  const p = (n, z) => String(n).padStart(z || 2, '0');
  const s = d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
  return ver === 'V3' ? "'"+s+".000'" : "TIMESTAMP '"+s+".000000'";
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

const SG_SDT_EXCLUDE = new Set(['SdtsBTBusinessError']);

const VALIDATE_ENGLISH_RE = /\b(the|this|that|these|those|is|are|was|were|has|have|had|get|gets|set|sets|update|updates|create|creates|delete|deletes|return|returns|method|service|parameter|value|field|list|object|type|name|code|date|amount|flag|allow|allows|perform|performs|retrieve|retrieves)\b/i;
const VALIDATE_LARGO_TYPES = new Set(['long','int','double','byte','short','string']);

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

function sg_extractSdtNames(params) {
  const names = new Set();
  for (var i = 0; i < params.length; i++) {
    const p = params[i];
    if (p.tipo && p.tipo.startsWith('Sdt') && !SG_SDT_EXCLUDE.has(p.tipo.trim())) names.add(p.tipo.trim());
    if (p.ittipo && p.ittipo.trim().startsWith('Sdt') && !SG_SDT_EXCLUDE.has(p.ittipo.trim())) names.add(p.ittipo.trim());
  }
  return [...names];
}

function sg_sq(val, ver, nullable) {
  const s = val != null ? String(val) : '';
  if (nullable && s.trim() === '') return 'NULL';
  if (ver === 'V3') return "N'" + s + "'";
  return s.trim() === '' ? "' '" : "'" + s + "'";
}
function sg_nq(val) { const n = parseInt(String(val == null ? '0' : val).trim(), 10); return isNaN(n) ? '0' : String(n); }

function sg_generateScript(data, mode) {
  const ver = data.version, h = data.header, m = data.method, ps = data.params || [], lines = [];
  const BTINom = h.BTINom||'BTSERVICES', BTISrvNom = h.BTISrvNom||'', BTISrvVer = h.BTISrvVer||'1', BTIMtdNom = h.BTIMtdNom||'';
  const q = (v) => sg_sq(v, ver);
  function delBti019() { if(ver==='V3')return["DELETE FROM BTI019 WHERE BTINom=N'"+BTINom+"' AND BTISrvNom=N'"+BTISrvNom+"' AND BTIMtdNom=N'"+BTIMtdNom+"';"]; return["DELETE FROM BTI019 WHERE BTINOM='"+BTINom+"' AND BTISRVNOM='"+BTISrvNom+"' AND BTIMTDNOM='"+BTIMtdNom+"';"]; }
  function delBti014() { if(ver==='V3')return["DELETE FROM BTI014 WHERE BTINom=N'"+BTINom+"' AND BTISrvNom=N'"+BTISrvNom+"' AND BTIMtdNom=N'"+BTIMtdNom+"';"]; return["DELETE FROM BTI014 WHERE BTINOM='"+BTINom+"' AND BTISRVNOM='"+BTISrvNom+"' AND BTIMTDNOM='"+BTIMtdNom+"';"]; }
  function delBti004() { return["DELETE FROM BTI004 WHERE BTINom=N'"+BTINom+"' AND BTISrvNom=N'"+BTISrvNom+"';"]; }
  function insBti004() { const cols=V3_BTI004_COLS.join(', '),dsc=h.BTISrvDsc||'',pgm=(h.BTISrvPgmName||'').trim()||' '; return['INSERT INTO BTI004 ('+cols+") VALUES(N'"+BTINom+"', N'"+BTISrvNom+"', N'"+BTISrvVer+"', N'"+dsc+"', N' ', 0, 0, 0, N'"+pgm+"', N'                    ', N' ');"]; }
  function insBti014() {
    const status=(m.status||'Validado').padEnd(20).slice(0,20), enbtra=m.enbtra||'N', enbtraV=enbtra==='NULL'?'NULL':(ver==='V3'?"N'"+enbtra+"'":"'"+enbtra+"'");
    if(ver==='V3'){const cols=V3_BTI014_COLS.join(', ');return['INSERT INTO BTI014 ('+cols+") VALUES(N'"+BTINom+"', N'"+BTISrvNom+"', N'"+BTISrvVer+"', N'"+BTIMtdNom+"', N'"+(m.dsc||'')+"', N'"+(m.nsbt||' ')+"', N'"+(m.pgmnom||'')+"', N'"+(m.pgmmtd||'execute')+"', N'"+status+"', N'"+(m.fpath||'')+"', "+enbtraV+", N'"+(m.espggx||'S')+"');"];}
    const cols=V4_BTI014_COLS.join(', '),dscV=(m.dsc||'').trim()?"'"+(m.dsc)+"'":"' '";
    return['INSERT INTO BTI014 ('+cols+") VALUES('"+BTINom+"', '"+BTISrvNom+"', '"+BTISrvVer+"', '"+BTIMtdNom+"', "+dscV+", '"+(m.nsbt||' ')+"', '"+(m.pgmnom||'')+"', '"+(m.pgmmtd||'execute')+"', '"+status+"', ' ', "+enbtraV+", '"+(m.espggx||'S')+"');"];
  }
  function insBti019() {
    const cols=(ver==='V3'?V3_BTI019_COLS:V4_BTI019_COLS).join(', ');
    return ps.map(function(p,i) {
      const posi=i+1,largo=sg_nq(p.largo),deci=sg_nq(p.deci);
      var vals;
      if(ver==='V3'){vals=[sg_sq(BTINom,ver),sg_sq(BTISrvNom,ver),sg_sq(BTISrvVer,ver),sg_sq(BTIMtdNom,ver),posi,sg_sq(p.nom,ver),sg_sq(p.nomjava,ver),sg_sq(p.dir,ver),sg_sq(p.tipo,ver),sg_sq(p.ittipo,ver),sg_sq(p.valor,ver),sg_sq(p.sdtver,ver),sg_sq(p.cat,ver),sg_sq(p.catit,ver),largo,sg_sq(p.lval,ver),sg_sq(p.itnom,ver),deci].join(', ');}
      else{vals=[sg_sq(BTINom,ver),sg_sq(BTISrvNom,ver),sg_sq(BTISrvVer,ver),sg_sq(BTIMtdNom,ver),posi,sg_sq(p.nom,ver),sg_sq(p.nomjava,ver),sg_sq(p.dir,ver),sg_sq(p.tipo,ver),sg_sq(p.ittipo,ver),sg_sq(p.valor,ver),sg_sq(p.catit,ver),sg_sq(p.cat,ver),sg_sq(p.sdtver,ver),largo,sg_sq(p.lval,ver),sg_sq(p.itnom,ver),deci,sg_sq(p.dsc,ver,true)].join(', ');}
      return 'INSERT INTO BTI019 ('+cols+') VALUES('+vals+');';
    });
  }
  if(mode==='delete'){if(ver==='V3')lines.push(...delBti004(),''); lines.push(...delBti014(),'', ...delBti019());}
  else if(mode==='insert'){if(ver==='V3')lines.push(...insBti004(),''); lines.push(...insBti014(),'', ...insBti019());}
  else{if(ver==='V3')lines.push(...delBti004(),...insBti004(),''); lines.push(...delBti014(),...insBti014(),'', ...delBti019(),...insBti019());}
  return lines.join('\n');
}

function sg_generateSdtScript(sdt, mode, version) {
  const lines = [], nom = sdt.nom || '', b25 = sdt.bti025, b26 = sdt.bti026 || [];
  const q = function(v) { return sg_sq(v, version); };
  const nomCol = version === 'V3' ? 'BTISDTNom' : 'BTISDTNOM';
  function delBti025() { return ['DELETE FROM BTI025 WHERE '+nomCol+'='+q(nom)+';']; }
  function delBti026() { return ['DELETE FROM BTI026 WHERE '+nomCol+'='+q(nom)+';']; }
  function insBti025() {
    if (!b25) return [];
    if (version === 'V3') {
      const cols = V3_BTI025_COLS.join(', ');
      const vals = [q(b25.nom),q(b25.version),q(b25.descrip),q(b25.nativo),sg_fmtDate(b25.fecha,'V3'),q(b25.nomint),q(b25.estado),b25.tipo,q(b25.namespace)].join(', ');
      return ['INSERT INTO BTI025 ('+cols+') VALUES('+vals+');'];
    }
    const cols = V4_BTI025_COLS.join(', ');
    const dsc = b25.descrip ? q(b25.descrip) : "' '";
    const vals = [q(b25.nom),q(b25.version),q(b25.nomint),q(b25.estado),b25.tipo,q(b25.namespace),sg_fmtDate(b25.fecha,'V4'),dsc,q(b25.nativo)].join(', ');
    return ['INSERT INTO BTI025 ('+cols+') VALUES('+vals+');'];
  }
  function insBti026() {
    if (!b26.length) return [];
    if (version === 'V3') {
      const cols = V3_BTI026_COLS.join(', ');
      return b26.map(function(e) { return 'INSERT INTO BTI026 ('+cols+') VALUES('+[q(nom),q(e.elemnom),q(e.elemtipo),sg_nq(e.elemlargo),q(e.elemcat),q(e.elemdsc),q(e.elemsdt)].join(', ')+');'; });
    }
    const cols = V4_BTI026_COLS.join(', ');
    return b26.map(function(e) {
      const dsc = e.elemdsc ? q(e.elemdsc) : "' '", sdt = e.elemsdt ? q(e.elemsdt) : "' '";
      return 'INSERT INTO BTI026 ('+cols+') VALUES('+[q(nom),q(e.elemnom),q(e.elemtipo),sg_nq(e.elemlargo),sg_nq(e.elemdeci),q(e.elemcat),dsc,sdt].join(', ')+');';
    });
  }
  if (mode === 'delete') { lines.push(...delBti025(), '', ...delBti026()); }
  else if (mode === 'insert') { lines.push(...insBti025(), '', ...insBti026()); }
  else { lines.push(...delBti025(), ...insBti025(), '', ...delBti026(), ...insBti026()); }
  return lines.join('\n');
}

// -- HTML --------------------------------------------------

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Herramienta Bantotal</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#c42e2c;--blue-h:#9e2423;--blue-l:#fdf3f3;
  --green:#059669;--green-l:#ECFDF5;
  --red:#c42e2c;--red-l:#fdf3f3;
  --warn:#D97706;--warn-l:#FFFBEB;
  --text:#121418;--muted:#636768;--border:#c6c7c7;--bg:#f2f2f2;
  --r:12px;--shadow:0 8px 40px rgba(18,20,24,.14)
}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;color:var(--text)}
.wizard{background:#fff;border-radius:var(--r);box-shadow:var(--shadow);width:100%;max-width:620px;overflow:hidden}

.wiz-hd{background:var(--blue);padding:28px 32px 40px;color:#fff}
.wiz-hd h1{font-size:17px;font-weight:600;margin-bottom:24px;opacity:.95;letter-spacing:-.01em}
.steps-bar{display:flex;align-items:center}
.sdot{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:rgba(255,255,255,.4);transition:all .3s;position:relative;flex-shrink:0;cursor:default}
.sdot.done{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.7);color:#fff}
.sdot.active{background:#fff;border-color:#fff;color:var(--blue)}
.sdot-lb{position:absolute;top:30px;left:50%;transform:translateX(-50%);font-size:9px;white-space:nowrap;color:rgba(255,255,255,.45);font-weight:400}
.sdot.active .sdot-lb,.sdot.done .sdot-lb{color:rgba(255,255,255,.85)}
.sline{flex:1;height:2px;background:rgba(255,255,255,.18);transition:background .3s}
.sline.done{background:rgba(255,255,255,.55)}

.wiz-bd{padding:30px 32px;min-height:320px}
.panel{display:none;animation:fadeIn .2s ease}.panel.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.ptitle{font-size:15px;font-weight:600;margin-bottom:4px}
.psub{font-size:12px;color:var(--muted);margin-bottom:22px;line-height:1.5}

.cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px}
.ccard{border:2px solid var(--border);border-radius:10px;padding:20px 14px;cursor:pointer;text-align:center;background:#fff;transition:all .18s;position:relative;user-select:none}
.ccard:hover{border-color:var(--blue);background:var(--blue-l)}
.ccard.sel{border-color:var(--blue);background:var(--blue-l)}
.ccard-title{font-size:22px;font-weight:700;color:var(--blue);display:block;margin-bottom:5px}
.ccard-desc{font-size:11px;color:var(--muted);display:block;line-height:1.4}
.ccard-badge{position:absolute;top:-9px;right:10px;background:var(--blue);color:#fff;font-size:9px;font-weight:700;padding:2px 9px;border-radius:10px;letter-spacing:.04em;text-transform:uppercase}
.act-icon{font-size:28px;display:block;margin-bottom:10px}
.act-ccard{padding:28px 16px}

.field{margin-bottom:15px}
.field label{display:block;font-size:12px;font-weight:500;color:var(--text);margin-bottom:5px}
.field input,.field select{width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;color:var(--text);outline:none;transition:border-color .15s;background:#fff;font-family:inherit}
.field input:focus,.field select:focus{border-color:var(--blue)}
.field select{cursor:pointer}
.field .hint{font-size:11px;color:var(--muted);margin-top:4px}
.frow{display:grid;grid-template-columns:1fr 90px;gap:10px}
.pw{position:relative}.pw input{padding-right:36px}
.pw-btn{position:absolute;right:9px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);font-size:14px;padding:2px;line-height:1}

.cres{display:none;padding:10px 13px;border-radius:8px;font-size:12px;margin-bottom:14px;align-items:flex-start;gap:8px;line-height:1.5}
.cres.show{display:flex}.cres.ok{background:var(--green-l);color:var(--green)}.cres.err{background:var(--red-l);color:var(--red)}

.svc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
.svc-wrap{border:1.5px solid var(--border);border-radius:8px;overflow:hidden;margin-top:12px}
.svc-row{display:flex;justify-content:space-between;align-items:center;padding:9px 13px;font-size:12px}
.svc-row+.svc-row{border-top:1px solid var(--border)}
.svc-row strong{color:var(--text);font-weight:600}
.svc-row .svc-mtd{color:var(--muted);margin-left:4px}
.svc-rm{background:none;border:none;cursor:pointer;color:var(--muted);padding:0 4px;line-height:1;font-size:16px;transition:color .15s}
.svc-rm:hover{color:var(--red)}
.add-btn{width:100%;padding:9px;border:1.5px dashed var(--border);border-radius:8px;background:none;font-size:12px;color:var(--muted);cursor:pointer;transition:all .15s;font-family:inherit;margin-bottom:4px}
.add-btn:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-l)}

.wiz-ft{display:flex;justify-content:space-between;align-items:center;padding:16px 32px;border-top:1px solid var(--border);background:#f5f5f5;min-height:64px}
.btn{padding:9px 18px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all .17s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;text-decoration:none}
.btn:disabled{opacity:.45;cursor:not-allowed;pointer-events:none}
.btn-ghost{background:none;color:var(--muted);border:1.5px solid var(--border)}.btn-ghost:hover{border-color:#9a9a9a;color:var(--text)}
.btn-primary{background:var(--blue);color:#fff}.btn-primary:hover{background:var(--blue-h)}
.btn-outline{background:none;color:var(--blue);border:1.5px solid var(--blue)}.btn-outline:hover{background:var(--blue-l)}
.btn-success{background:var(--green);color:#fff}.btn-success:hover{background:#047857}
.btn-sm{padding:6px 12px;font-size:12px}

.spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:rot .65s linear infinite;flex-shrink:0}
.spin.dk{border-color:rgba(0,0,0,.1);border-top-color:var(--blue)}
@keyframes rot{to{transform:rotate(360deg)}}

.ok-panel{text-align:center;padding:8px 0 4px}
.ok-icon{width:54px;height:54px;border-radius:50%;background:var(--green-l);display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 14px;color:var(--green)}
.ok-panel h2{font-size:18px;font-weight:600;color:var(--green);margin-bottom:18px}
.close-hint{font-size:11px;color:var(--muted)}

.gen-log{border:1.5px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:14px;text-align:left}
.gen-row{display:flex;align-items:center;gap:10px;padding:9px 13px;font-size:12px}
.gen-row+.gen-row{border-top:1px solid var(--border)}
.gen-ic{width:18px;flex-shrink:0;text-align:center;font-size:14px}
.gen-lbl{flex:1;color:var(--text)}.gen-lbl strong{font-weight:600}
.gen-out{font-size:10px;color:var(--muted);margin-top:2px;font-family:Consolas,monospace;white-space:pre-wrap;word-break:break-all;display:none}
.gen-row.has-err .gen-out{display:block;color:var(--red)}

.exec-toggle{text-align:left;margin-bottom:14px;padding:11px 13px;background:var(--warn-l);border-radius:8px;border:1.5px solid #F59E0B}
.exec-lbl{display:flex;align-items:center;gap:9px;cursor:pointer;font-size:13px;font-weight:500;color:var(--text)}
.exec-sub{font-size:11px;color:var(--muted);margin-top:4px;margin-left:26px;line-height:1.5}
.param-card{margin-bottom:10px;border:1.5px solid var(--border);border-radius:8px;overflow:hidden;text-align:left}
.param-card-hd{padding:8px 12px;background:#f5f5f5;border-bottom:1px solid var(--border);font-size:12px;font-weight:600}
.param-card-bd{padding:10px 12px}
.param-f{margin-bottom:8px}.param-f label{display:block;font-size:11px;font-weight:500;margin-bottom:3px}
.param-f input{width:100%;padding:7px 10px;border:1.5px solid var(--border);border-radius:6px;font-size:12px;outline:none;font-family:inherit}
.param-f input:focus,.param-f textarea:focus{border-color:var(--blue)}
.param-f textarea{width:100%;padding:7px 10px;border:1.5px solid var(--border);border-radius:6px;font-size:11px;font-family:Consolas,monospace;resize:vertical;outline:none;line-height:1.4}

.wf-step{cursor:grab;user-select:none;transition:background .1s}.wf-step:active{cursor:grabbing}
.wf-step.wf-dragging{opacity:.35}.wf-step.wf-over{border-top:2px solid var(--blue) !important}
.wf-step-hd{display:flex;align-items:center;gap:8px;padding:7px 12px}
.wf-global-params{padding:10px 14px;background:var(--blue-l);border-bottom:1px solid #f0bcbc}
.wf-handle{color:var(--border);font-size:13px;flex-shrink:0;line-height:1}

/* SG service groups */
.sg-svc-group{border:1.5px solid var(--border);border-radius:10px;margin-bottom:12px;overflow:hidden}
.sg-svc-group-hd{background:#f5f5f5;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.sg-svc-group-name{font-size:13px;font-weight:600;color:var(--text)}
.sg-svc-group-bd{max-height:200px;overflow-y:auto}
.sg-search-wrap{padding:6px 10px;border-bottom:1px solid var(--border);background:#fff}
.sg-mtd-item{display:flex;align-items:center;padding:9px 14px;gap:10px;cursor:pointer;border-bottom:1px solid var(--border);transition:background .12s;user-select:none;font-size:13px}
.sg-mtd-item:last-child{border-bottom:none}.sg-mtd-item:hover{background:var(--blue-l)}
.sg-mtd-item input[type=checkbox]{display:none}
.sg-chk{width:16px;height:16px;border:2px solid var(--border);border-radius:4px;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s}
.sg-mtd-item:hover .sg-chk{border-color:var(--blue)}
.sg-mtd-item input:checked~.sg-chk{background:var(--blue);border-color:var(--blue)}
.sg-mtd-item input:checked~.sg-chk::after{content:'';display:block;width:4px;height:8px;border:2px solid #fff;border-top:none;border-left:none;transform:rotate(45deg) translate(0,-1px)}
.sg-chk-lbl{font-size:13px;color:var(--text);flex:1}
.btn-pill{padding:4px 11px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;line-height:1.5;transition:all .15s;border:1.5px solid var(--border);background:#fff;color:var(--muted)}
.btn-pill:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-l)}
.pinput{border:1.5px solid var(--border);border-radius:6px;padding:5px 7px;font-size:11px;font-family:inherit;outline:none;background:#fff;color:var(--text)}
.pinput:focus{border-color:var(--blue)}
.pin-rm{background:none;border:none;cursor:pointer;color:var(--muted);font-size:16px;padding:2px 6px;line-height:1;transition:color .15s}
.pin-rm:hover{color:var(--red)}
.sql-out{width:100%;min-height:200px;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-family:Consolas,monospace;font-size:12px;color:#1e293b;background:#f8fafc;resize:vertical;outline:none;line-height:1.55}
.gen-btns{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
</style>
</head>
<body>
<div class="wizard">

  <div class="wiz-hd">
    <h1>Herramienta Bantotal</h1>
    <div class="steps-bar">
      <div class="sdot active" id="d1"><span id="dn1">1</span><span class="sdot-lb">Versión</span></div>
      <div class="sline" id="l1"></div>
      <div class="sdot" id="d2"><span id="dn2">2</span><span class="sdot-lb">Conexión</span></div>
      <div class="sline" id="l2"></div>
      <div class="sdot" id="d3"><span id="dn3">3</span><span class="sdot-lb">Acción</span></div>
      <div class="sline" id="l3"></div>
      <div class="sdot" id="d4"><span id="dn4">4</span><span class="sdot-lb" id="lb4"> </span></div>
      <div class="sline" id="l4"></div>
      <div class="sdot" id="d5"><span id="dn5">5</span><span class="sdot-lb" id="lb5"> </span></div>
    </div>
  </div>

  <div class="wiz-bd">

    <!-- Paso 1: Versión -->
    <div class="panel active" id="p1">
      <div class="ptitle">¿Qué versión de Bantotal vas a usar?</div>
      <div class="psub">V3 usa SQL Server · V4 usa Oracle. Podés cambiar la configuración en cualquier momento.</div>
      <div class="cards">
        <div class="ccard" onclick="pick('version','V3',this)">
          <span class="ccard-title">V3</span>
          <span class="ccard-desc">SQL Server</span>
        </div>
        <div class="ccard" onclick="pick('version','V4',this)">
          <span class="ccard-title">V4</span>
          <span class="ccard-desc">Oracle</span>
        </div>
      </div>
    </div>

    <!-- Paso 2: Conexión (BD) -->
    <div class="panel" id="p2">
      <div class="ptitle">Datos de conexión a la base de datos</div>
      <div class="psub">Ingresá los datos del ambiente al que querés conectarte.</div>

      <div id="db-hist-wrap" style="display:none;margin-bottom:4px">
        <div class="field" style="margin-bottom:10px">
          <label style="margin-bottom:6px;display:block">Conexiones guardadas</label>
          <div style="display:flex;gap:8px;align-items:center">
            <select id="db-hist-sel" onchange="loadDbHistEntry()" style="flex:1;height:36px;border:1px solid var(--border);border-radius:6px;padding:0 10px;font-size:13px;background:var(--bg);color:var(--text)">
              <option value="">-- Nueva conexión --</option>
            </select>
            <button id="db-hist-del" onclick="deleteDbHistEntry()" disabled style="height:36px;padding:0 14px;border-radius:6px;border:1px solid #fca5a5;background:#fee2e2;color:#dc2626;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:opacity .15s" onmouseover="this.style.opacity='.75'" onmouseout="this.style.opacity='1'">Eliminar</button>
          </div>
        </div>
        <div style="border-top:1px solid var(--border);margin:14px 0 18px"></div>
      </div>

      <div class="field" style="margin-bottom:16px">
        <label>Nombre de la conexión <span style="font-weight:400;color:var(--muted);font-size:11px">(opcional)</span></label>
        <input type="text" id="db-conn-name" placeholder="ej: Producción V4" autocomplete="off">
      </div>

      <div id="sql-fields">
        <div class="frow">
          <div class="field"><label>Servidor</label><input type="text" id="db-server" placeholder="ej: 192.168.1.10"></div>
          <div class="field"><label>Puerto</label><input type="text" id="db-port" value="1433"></div>
        </div>
        <div class="field"><label>Base de datos</label><input type="text" id="db-name" placeholder="ej: ProductoGx16"></div>
        <div class="field"><label>Usuario</label><input type="text" id="db-user-s" autocomplete="username"></div>
        <div class="field"><label>Contraseña</label><div class="pw"><input type="password" id="db-pass-s" autocomplete="current-password"><button class="pw-btn" onclick="togglePw('db-pass-s',this)">&#128065;</button></div></div>
      </div>

      <div id="ora-fields" style="display:none">
        <div class="frow">
          <div class="field"><label>Usuario</label><input type="text" id="db-user-o" autocomplete="username"></div>
          <div class="field"><label>Contraseña</label><div class="pw"><input type="password" id="db-pass-o" autocomplete="current-password"><button class="pw-btn" onclick="togglePw('db-pass-o',this)">&#128065;</button></div></div>
        </div>
        <div class="field"><label>Connect String</label><input type="text" id="db-cs" placeholder="ej: 10.0.0.4:1521/btv4db"><div class="hint">Formato: host:puerto/nombre-servicio</div></div>
      </div>

      <div class="cres" id="cres"></div>
    </div>

    <!-- Paso 3: Acción -->
    <div class="panel" id="p3">
      <div class="ptitle">¿Qué querés hacer?</div>
      <div class="psub">Elegí la herramienta que querés usar con los servicios de esta base de datos.</div>
      <div class="cards">
        <div class="ccard act-ccard" onclick="pick('action','doc',this)">
          <span class="act-icon">&#128196;</span>
          <span class="ccard-title" style="font-size:17px;display:block;margin-bottom:6px">Documentar</span>
          <span class="ccard-desc">Genera archivos .md con la documentación de los servicios Bantotal</span>
        </div>
        <div class="ccard act-ccard" onclick="pick('action','scripts',this)">
          <span class="act-icon">&#128196;</span>
          <span class="ccard-title" style="font-size:17px;display:block;margin-bottom:6px">Generar Scripts</span>
          <span class="ccard-desc">Genera scripts INSERT/DELETE para instalar servicios en otra base de datos</span>
        </div>
      </div>
    </div>

    <!-- Paso 4: API (flujo doc) -->
    <div class="panel" id="p4">
      <div class="ptitle">Configuracion del ambiente Bantotal</div>
      <div class="psub">URLs y credenciales que usa el modo <code style="background:#F1F5F9;padding:1px 5px;border-radius:4px;font-size:11px">--ejecutar</code> para llamar a la API real.</div>

      <div class="field">
        <label>URL base (BASE_URL)</label>
        <input type="text" id="a-base" placeholder="ej: https://mi-servidor:6004">
      </div>
      <div class="field">
        <label>URL de la API (API_BASE_URL)</label>
        <input type="text" id="a-api" placeholder="ej: https://mi-servidor:6004/nombrebd">
      </div>
      <div id="a-auth-wrap">
        <div class="field">
          <label>URL de autenticacion (API_AUTH_URL) <span style="color:var(--muted);font-weight:400">- solo V3</span></label>
          <input type="text" id="a-auth" placeholder="...servlet/com.dlya.bantotal.ardwsbt_Authenticate_v1">
        </div>
      </div>
      <div class="frow">
        <div class="field">
          <label>Usuario API</label>
          <input type="text" id="a-user" placeholder="ej: INSTALADOR">
        </div>
        <div class="field">
          <label>Contrasena API</label>
          <div class="pw">
            <input type="password" id="a-pass" placeholder="Contrasena">
            <button class="pw-btn" onclick="togglePw('a-pass',this)">&#128065;</button>
          </div>
        </div>
      </div>
      <div id="ares" class="cres" style="margin-bottom:0"></div>
      <button class="btn btn-outline" id="btn-test-api" onclick="testAuth()" style="margin-top:2px;width:100%">Probar autenticacion</button>

      <div style="border-top:1px solid var(--border);margin-top:18px;padding-top:14px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:600;font-size:13px">
          <input type="checkbox" id="cb-doc-errores" onchange="toggleDocErrores()" style="width:15px;height:15px;cursor:pointer">
          Documentar errores posibles
        </label>
        <p style="margin-top:3px;margin-left:23px;font-size:11px;color:var(--muted)">
          Llama al Documentador de Errores para incluir la tabla de errores en cada .md generado.
          Requiere Python y los archivos KB del modelo GeneXus.
        </p>
        <div id="doc-errores-fields" style="display:none;margin-top:10px">
          <div class="field">
            <label>Ruta a los modelos KB</label>
            <input type="text" id="doc-errores-modelos" placeholder="ej: C:\\1 - MODELOS\\V4">
            <div class="hint">Carpeta raiz con los modelos GeneXus (contiene subcarpetas con kb.data)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paso 5: Seleccion de servicios -->
    <div class="panel" id="p5">
      <div class="ptitle">Que servicios queres documentar?</div>
      <div class="psub">Carga los servicios disponibles en la BD y selecciona los metodos. Podes agregar varios a la lista.</div>

      <div id="svc-load-area"></div>

      <div id="svc-picker" style="display:none;margin-top:16px">
        <div class="field" style="margin-bottom:10px">
          <label>Filtrar servicios</label>
          <input type="text" id="svc-filter" placeholder="Escribi para filtrar..." oninput="filterServices()">
        </div>
        <div class="svc-grid">
          <div class="field" style="margin:0">
            <label>Servicio</label>
            <select id="sel-svc" onchange="loadMethods(this.value)">
              <option value="">-- Seleccionar --</option>
            </select>
          </div>
          <div class="field" style="margin:0">
            <label>Metodo</label>
            <select id="sel-mtd">
              <option value="">-- Seleccionar --</option>
            </select>
          </div>
        </div>
        <button class="add-btn" onclick="addItem()">+ Agregar a la lista</button>
      </div>

      <div id="svc-list"></div>
      <div class="cres" id="svc-err" style="margin-top:10px"></div>
      <div id="doc-val-block" style="display:none;margin-top:14px"></div>
    </div>

    <!-- Paso 6: Éxito (flujo doc) -->
    <div class="panel" id="p6">
      <div class="ok-panel">
        <div class="ok-icon">&#10003;</div>
        <h2>Configuracion guardada!</h2>
        <div class="exec-toggle" id="exec-toggle" style="display:none">
          <label class="exec-lbl">
            <input type="checkbox" id="cb-ejecutar" onchange="toggleEjecutar()" style="width:16px;height:16px;cursor:pointer">
            Llamar a la API
          </label>
          <p class="exec-sub">Ejecuta cada metodo contra la API de Bantotal y adjunta la respuesta real en el documento.</p>
        </div>
        <div id="params-section" style="display:none;margin-bottom:14px"></div>
        <button class="btn btn-primary" id="btn-generate" onclick="generateDocs()" style="margin-bottom:16px">Generar documentacion ahora</button>
        <div id="gen-log" class="gen-log" style="display:none"></div>
        <p class="close-hint" id="gen-hint">Podes cerrar esta pestana. Para cambiar la configuracion, volve a ejecutar <strong>node setup.js</strong>.</p>
        <div id="post-gen-actions" style="display:none;margin-top:12px">
          <button class="btn btn-outline" onclick="resetParaOtroServicio()" style="width:100%">&#8592; Documentar otro servicio</button>
        </div>
      </div>
    </div>

    <!-- Paso 4 Scripts: Selección de servicios y métodos -->
    <div class="panel" id="p4s">
      <div class="ptitle">¿De qué servicios querés generar scripts?</div>
      <div class="psub">Agregá uno o más servicios y seleccioná los métodos de cada uno.</div>
      <div id="sg-svc-loading" style="display:none;font-size:12px;color:var(--muted);margin-bottom:14px;align-items:center;gap:6px"><span class="spin dk"></span>&nbsp;Cargando servicios...</div>
      <div class="cres" id="sg-svc-err"></div>
      <div style="display:flex;gap:8px;margin-bottom:14px;align-items:flex-end">
        <div class="field" style="flex:1;margin-bottom:0"><label>Servicio</label><select id="sg-sel-svc"><option value="">-- Seleccioná un servicio --</option></select></div>
        <button class="btn btn-primary" onclick="sgAddServiceToList()" style="flex-shrink:0;padding:9px 16px">+ Agregar</button>
      </div>
      <div id="sg-service-groups"></div>
      <div id="sg-val-block" style="display:none;margin-top:14px"></div>
    </div>

    <!-- Paso 5 Scripts: Script generado -->
    <div class="panel" id="p5s">
      <div class="ptitle" id="sg-out-title">Script generado</div>
      <div class="psub" id="sg-out-sub">Copiá el script y ejecutalo en la base de datos.</div>
      <div class="gen-btns">
        <button class="btn btn-outline btn-sm" onclick="sgGenerate('delete')">Solo DELETE</button>
        <button class="btn btn-outline btn-sm" onclick="sgGenerate('insert')">Solo INSERT</button>
        <button class="btn btn-primary btn-sm" onclick="sgGenerate('both')">DELETE + INSERT</button>
        <button class="btn btn-success btn-sm" onclick="sgCopyScript()">Copiar</button>
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('sg-sql-out').value=''">Limpiar</button>
      </div>
      <div id="sg-warnings" style="display:none;margin-bottom:12px"></div>
      <textarea class="sql-out" id="sg-sql-out" readonly placeholder="Acá va a aparecer el script generado..."></textarea>
      <div class="cres" id="sg-copy-res" style="margin-top:8px"></div>
    </div>

  </div>

  <div class="wiz-ft">
    <button class="btn btn-ghost" id="btn-back" onclick="goBack()" style="display:none">&#8592; Volver</button>
    <span></span>
    <div id="ft-r">
      <button class="btn btn-primary" id="btn-next" onclick="goNext()" disabled>Siguiente &#8594;</button>
    </div>
  </div>

</div>
<script>
// ── Estado compartido ────────────────────────────────────────
var S = { step: 1, version: null, platform: null, action: null };
var _connOk = false, _connTimer = null;
var loadedEnv = null;

// ── Estado flujo Doc ─────────────────────────────────────────
var items = [];
var allServices = [];
var paramFields = {};
var workflowData = {};
var wfConfirmed = false;

// ── Estado flujo Scripts ─────────────────────────────────────
var sgServiceGroups = [];
var sgMultiData = null;
var sgServicesLoaded = false;

// ── Historial de conexiones ───────────────────────────────────
var _dbHistory = [];

// ── Validaciones ──────────────────────────────────────────────
var _VALIDATE_ENGLISH_RE = /\b(the|this|that|these|those|is|are|was|were|has|have|had|get|gets|set|sets|update|updates|create|creates|delete|deletes|return|returns|method|service|parameter|value|field|list|object|type|name|code|date|amount|flag|allow|allows|perform|performs|retrieve|retrieves)\b/i;
var _VALIDATE_LARGO_TYPES = new Set(['long','int','double','byte','short','string']);

function validateItems(items) {
  var warns = [];
  (items || []).forEach(function(item) {
    var svc = (item.header && item.header.BTISrvNom) || item.service || '?';
    var mtd = (item.header && item.header.BTIMtdNom) || item.method_name || '?';
    var m   = (item.header ? item.method : null) || {};
    if (typeof m === 'string') m = {};
    var params = item.params || [];
    var dsc = (m.dsc || '').trim();
    if (!dsc) {
      warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'Descripción vacía.' });
    } else {
      if (!/^m[eé]todo para /i.test(dsc)) warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'No comienza con "Método para".' });
      if (!dsc.endsWith('.'))                          warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'No termina con punto.' });
      if (_VALIDATE_ENGLISH_RE.test(dsc))              warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'Podría estar en inglés.' });
    }
    params.forEach(function(p) {
      var pnom = p.nom || '?', tipo = (p.tipo || '').toLowerCase().trim();
      var pdsc = p.dsc !== undefined ? (p.dsc || '').trim() : undefined;
      if (pdsc !== undefined) {
        if (!pdsc) warns.push({ service: svc, method: mtd, field: 'BTISRVPARDSC', param: pnom, msg: 'Descripción vacía.' });
        else {
          if (!pdsc.endsWith('.'))                          warns.push({ service: svc, method: mtd, field: 'BTISRVPARDSC', param: pnom, msg: 'No termina con punto.' });
          if (_VALIDATE_ENGLISH_RE.test(pdsc))              warns.push({ service: svc, method: mtd, field: 'BTISRVPARDSC', param: pnom, msg: 'Podría estar en inglés.' });
        }
      }
      if (_VALIDATE_LARGO_TYPES.has(tipo) && parseInt(p.largo || '0') === 0) warns.push({ service: svc, method: mtd, field: 'BTISRVPARLARGO', param: pnom, msg: 'Largo es 0 para tipo ' + p.tipo + '.' });
      if (tipo === 'double' && parseInt(p.deci || '0') === 0)                warns.push({ service: svc, method: mtd, field: 'BTISRVPARDECI',  param: pnom, msg: 'Decimales son 0 para tipo double.' });
    });
  });
  return warns;
}

function renderWarnings(containerId, warnings) {
  var el = document.getElementById(containerId); if (!el) return;
  if (!warnings || !warnings.length) { el.innerHTML = ''; el.style.display = 'none'; return; }
  var n = warnings.length;
  var html = '<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px 16px">' +
    '<div style="font-weight:600;font-size:13px;color:#92400e;margin-bottom:10px">&#9888; ' + n + ' advertencia' + (n > 1 ? 's' : '') + ' encontrada' + (n > 1 ? 's' : '') + '</div>' +
    '<ul style="margin:0;padding-left:18px;font-size:12px;color:#78350f;line-height:1.9">';
  warnings.forEach(function(w) {
    var ctx = w.param ? w.method + ' &rsaquo; ' + w.param : w.method;
    html += '<li><code style="background:rgba(0,0,0,.06);padding:1px 5px;border-radius:3px;font-size:11px">' + w.field + '</code> ' +
      '<span style="color:#b45309;font-weight:500">[' + ctx + ']</span> ' + w.msg + '</li>';
  });
  html += '</ul></div>';
  el.innerHTML = html; el.style.display = '';
}

// ── Utilidades ────────────────────────────────────────────────
function v(id)  { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
function vp(id) { var el = document.getElementById(id); return el ? el.value : ''; }
function setVal(id, val) { var el = document.getElementById(id); if (el && val != null) el.value = val; }

function togglePw(id, btn) {
  var inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.innerHTML = inp.type === 'password' ? '&#128065;' : '&#128584;';
}

function toFolderName(s) {
  return s.replace(/^Public/,'').replace(/([A-Z]+)([A-Z][a-z])/g,'$1-$2').replace(/([a-z\d])([A-Z])/g,'$1-$2');
}

function getDb() {
  if (S.platform === 'sqlserver') return { DB_SERVER: v('db-server'), DB_PORT: v('db-port')||'1433', DB_DATABASE: v('db-name'), DB_USER: v('db-user-s'), DB_PASSWORD: vp('db-pass-s') };
  return { DB_USER: v('db-user-o'), DB_PASSWORD: vp('db-pass-o'), DB_CONNECT_STRING: v('db-cs') };
}

function getDbSG() {
  if (S.platform === 'sqlserver') return { server: v('db-server'), port: v('db-port')||'1433', database: v('db-name'), user: v('db-user-s'), password: vp('db-pass-s') };
  return { user: v('db-user-o'), password: vp('db-pass-o'), connectString: v('db-cs') };
}

function getApi() {
  return { BASE_URL: v('a-base'), API_BASE_URL: v('a-api'), API_AUTH_URL: v('a-auth'), API_USER: v('a-user'), API_PASSWORD: vp('a-pass'), DOC_ERRORES_MODELOS: v('doc-errores-modelos') };
}

// ── Navegación del wizard ─────────────────────────────────────

function pick(key, val, el) {
  S[key] = val;
  el.closest('.cards').querySelectorAll('.ccard').forEach(function(c) { c.classList.remove('sel'); });
  el.classList.add('sel');
  if (key === 'version') {
    S.platform = val === 'V3' ? 'sqlserver' : 'oracle';
    tryLoadEnv(val);
  }
  if (key === 'action') updateStepLabels(val);
  var nb = document.getElementById('btn-next');
  if (nb) nb.disabled = false;
}

function updateStepLabels(action) {
  var lb4 = document.getElementById('lb4'), lb5 = document.getElementById('lb5');
  if (action === 'scripts') { if (lb4) lb4.textContent = 'Servicios'; if (lb5) lb5.textContent = 'Script'; }
  else { if (lb4) lb4.textContent = 'API'; if (lb5) lb5.textContent = 'Servicios'; }
}

function vizPos(step) {
  if (step <= 3) return step;
  if (S.action === 'scripts') return step <= 5 ? step : 5;
  return step <= 5 ? step : 6; // doc: step 6 (success) has no dot
}

function dots(step) {
  var pos = vizPos(step);
  [1,2,3,4,5].forEach(function(i) {
    var d = document.getElementById('d' + i);
    d.classList.remove('active','done');
    if (i < pos) d.classList.add('done');
    else if (i === pos) d.classList.add('active');
    document.getElementById('dn' + i).innerHTML = i < pos ? '&#10003;' : String(i);
    if (i < 5) document.getElementById('l' + i).classList.toggle('done', i < pos);
  });
}

function panelId(step) {
  if (step <= 3) return 'p' + step;
  if (S.action === 'scripts') return step === 4 ? 'p4s' : 'p5s';
  return 'p' + step; // doc: p4, p5, p6
}

function show(step) {
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  var pid = panelId(step);
  var panel = document.getElementById(pid);
  if (panel) panel.classList.add('active');
  S.step = step;
  dots(step);
  foot(step);
  if (step === 2) {
    document.getElementById('sql-fields').style.display = S.platform === 'sqlserver' ? 'block' : 'none';
    document.getElementById('ora-fields').style.display  = S.platform === 'oracle'    ? 'block' : 'none';
    loadDbHistory();
    fillDbFields();
    setTimeout(setupConnWatchers, 0);
  }
  if (step === 4 && S.action === 'doc') fillApiFields();
  if (step === 5 && S.action === 'doc') { if (!allServices.length) loadServices(); else renderList(); }
  if (step === 4 && S.action === 'scripts' && !sgServicesLoaded) sgLoadServices();
}

function foot(step) {
  var back = document.getElementById('btn-back');
  back.style.display = step > 1 ? 'flex' : 'none';
  var ftr = document.getElementById('ft-r');
  if (step === 2) {
    ftr.innerHTML = '<button class="btn btn-outline" id="btn-test" onclick="testConn()">Probar conexión</button>&nbsp;&nbsp;' +
      '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (_connOk ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 3) {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (S.action ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 4 && S.action === 'scripts') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()" disabled>Generar script &#8594;</button>';
  } else if (step === 5 && S.action === 'doc') {
    ftr.innerHTML = '<button class="btn btn-success" id="btn-save" onclick="saveEnv()" disabled>Guardar y finalizar &#10003;</button>';
  } else if (step === 5 && S.action === 'scripts') {
    ftr.innerHTML = '<button class="btn btn-ghost" onclick="sgReset()">&#8635; Nuevo script</button>';
  } else if (step === 6) {
    ftr.innerHTML = '';
  } else {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (!S.version && step===1 ? ' disabled' : '') + '>Siguiente &#8594;</button>';
  }
}

function goNext() {
  var s = S.step;
  if (s === 1 && !S.version) return;
  if (s === 2 && !_connOk) return;
  if (s === 3 && !S.action) return;
  if (s === 3) { show(4); return; }
  if (s === 4 && S.action === 'doc') {
    document.getElementById('a-auth-wrap').style.display = S.version === 'V3' ? 'block' : 'none';
  }
  if (s === 4 && S.action === 'scripts') {
    var grps = sgServiceGroups.filter(function(g) { return g.selected.size > 0; });
    if (!grps.length) { alert('Seleccioná al menos un método.'); return; }
    sgFetchAndShowOutput(grps);
    return;
  }
  if (s < 6) show(s + 1);
}

function goBack() {
  var s = S.step;
  if (s === 4) { show(3); return; }
  if (s === 5 && S.action === 'scripts') { show(4); return; }
  if (s > 1) show(s - 1);
}

// ── Conexión (paso 2) ──────────────────────────────────────────

async function tryLoadEnv(version) {
  loadedEnv = null;
  try {
    var r = await fetch('/api/load-env', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ version: version }) });
    var d = await r.json();
    if (!d.ok) return;
    loadedEnv = d.data;
    if (d.data.DB_CONNECT_STRING) S.platform = 'oracle';
    else if (d.data.DB_SERVER) S.platform = 'sqlserver';
  } catch(e) {}
}

function fillDbFields() {
  if (!loadedEnv) return;
  if (S.platform === 'sqlserver') {
    setVal('db-server', loadedEnv.DB_SERVER);
    setVal('db-port', loadedEnv.DB_PORT || '1433');
    setVal('db-name', loadedEnv.DB_DATABASE);
    setVal('db-user-s', loadedEnv.DB_USER);
    setVal('db-pass-s', loadedEnv.DB_PASSWORD);
  } else {
    setVal('db-user-o', loadedEnv.DB_USER);
    setVal('db-pass-o', loadedEnv.DB_PASSWORD);
    setVal('db-cs', loadedEnv.DB_CONNECT_STRING);
  }
  scheduleConnTest();
}

function fillApiFields() {
  if (!loadedEnv) return;
  setVal('a-base', loadedEnv.BASE_URL);
  setVal('a-api', loadedEnv.API_BASE_URL);
  setVal('a-auth', loadedEnv.API_AUTH_URL);
  setVal('a-user', loadedEnv.API_USER);
  setVal('a-pass', loadedEnv.API_PASSWORD);
  if (loadedEnv.DOC_ERRORES_MODELOS) {
    var cb = document.getElementById('cb-doc-errores');
    if (cb) { cb.checked = true; toggleDocErrores(); }
    setVal('doc-errores-modelos', loadedEnv.DOC_ERRORES_MODELOS);
  }
}

function allConnFilled() {
  if (S.platform === 'sqlserver') return !!(v('db-server') && v('db-name') && v('db-user-s') && vp('db-pass-s'));
  return !!(v('db-user-o') && vp('db-pass-o') && v('db-cs'));
}

function setupConnWatchers() {
  var ids = S.platform === 'sqlserver' ? ['db-server','db-port','db-name','db-user-s','db-pass-s'] : ['db-user-o','db-pass-o','db-cs'];
  ids.forEach(function(id) {
    var el = document.getElementById(id); if (!el) return;
    el.removeEventListener('input', scheduleConnTest);
    el.addEventListener('input', scheduleConnTest);
  });
  if (allConnFilled()) scheduleConnTest();
}

function scheduleConnTest() {
  var res = document.getElementById('cres'); if (res) res.className = 'cres';
  _connOk = false; updateConnBtn();
  if (!allConnFilled()) return;
  clearTimeout(_connTimer); _connTimer = setTimeout(runAutoConnTest, 700);
}

// ── Historial de conexiones ───────────────────────────────────

async function loadDbHistory() {
  try {
    var r = await fetch('/sg/api/db-history', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action: 'list' }) });
    var d = await r.json();
    if (d.ok) { _dbHistory = d.history || []; renderDbHistory(); }
  } catch(e) {}
}

function renderDbHistory() {
  var wrap = document.getElementById('db-hist-wrap');
  var sel = document.getElementById('db-hist-sel');
  if (!sel || !wrap) return;
  var filtered = _dbHistory.filter(function(e) { return e.version === S.version; });
  sel.innerHTML = '<option value="">-- Nueva conexión --</option>';
  filtered.forEach(function(e) {
    var opt = document.createElement('option'); opt.value = e.id; opt.textContent = e.label; sel.appendChild(opt);
  });
  wrap.style.display = filtered.length ? '' : 'none';
  var del = document.getElementById('db-hist-del'); if (del) del.disabled = true;
}

function loadDbHistEntry() {
  var sel = document.getElementById('db-hist-sel'); if (!sel) return;
  var del = document.getElementById('db-hist-del'); if (del) del.disabled = !sel.value;
  if (!sel.value) { setVal('db-conn-name', ''); return; }
  var entry = _dbHistory.find(function(e) { return e.id === sel.value; }); if (!entry) return;
  setVal('db-conn-name', entry.label || '');
  if (entry.platform === 'sqlserver') {
    setVal('db-server', entry.db.server || ''); setVal('db-port', entry.db.port || '1433');
    setVal('db-name', entry.db.database || ''); setVal('db-user-s', entry.db.user || '');
    setVal('db-pass-s', entry.db.password || '');
  } else {
    setVal('db-user-o', entry.db.user || ''); setVal('db-pass-o', entry.db.password || '');
    setVal('db-cs', entry.db.connectString || '');
  }
  scheduleConnTest();
}

async function deleteDbHistEntry() {
  var sel = document.getElementById('db-hist-sel'); if (!sel || !sel.value) return;
  var id = sel.value;
  try {
    await fetch('/sg/api/db-history', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action: 'delete', id: id }) });
    _dbHistory = _dbHistory.filter(function(e) { return e.id !== id; });
    renderDbHistory();
  } catch(e) {}
}

async function saveDbHistEntry() {
  if (!allConnFilled()) return;
  var db = getDbSG();
  var customName = v('db-conn-name');
  var autoLabel = S.platform === 'sqlserver'
    ? (v('db-name') || v('db-server')) + ' · ' + (v('db-server') || '') + ' (SQL Server)'
    : v('db-cs') + ' (Oracle)';
  var label = customName || autoLabel;
  try {
    var r = await fetch('/sg/api/db-history', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action: 'save', version: S.version, platform: S.platform, label: label, db: db }) });
    var d = await r.json();
    if (d.ok) {
      await loadDbHistory();
      var sel = document.getElementById('db-hist-sel'); if (sel && d.id) { sel.value = d.id; var del = document.getElementById('db-hist-del'); if (del) del.disabled = false; }
    }
  } catch(e) {}
}

async function runAutoConnTest() {
  var res = document.getElementById('cres'); if (!res) return;
  res.className = 'cres show'; res.style.color = 'var(--muted)';
  res.innerHTML = '<span class="spin dk"></span>&nbsp;Conectando...';
  try {
    var r = await fetch('/api/test', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDb() }) });
    var d = await r.json(); res.style.color = '';
    res.className = 'cres show ' + (d.ok ? 'ok' : 'err');
    res.textContent = d.ok ? 'Conexión exitosa ✓' : d.message;
    _connOk = d.ok;
    if (d.ok) { sgServiceGroups = []; allServices = []; sgServicesLoaded = false; saveDbHistEntry(); }
  } catch(e) { res.style.color = ''; res.className = 'cres show err'; res.textContent = 'No se pudo conectar'; _connOk = false; }
  updateConnBtn();
}

async function testConn() {
  var btn = document.getElementById('btn-test');
  if (btn) { btn.innerHTML = '<span class="spin"></span>&nbsp;Probando...'; btn.disabled = true; }
  await runAutoConnTest();
  if (btn) { btn.innerHTML = 'Probar conexión'; btn.disabled = false; }
}

function updateConnBtn() {
  if (S.step === 2) { var btn = document.getElementById('btn-next'); if (btn) btn.disabled = !_connOk; }
}

// ── Paso 4 Doc: API ────────────────────────────────────────────

function toggleDocErrores() {
  var cb = document.getElementById('cb-doc-errores');
  var fields = document.getElementById('doc-errores-fields');
  if (fields) fields.style.display = cb && cb.checked ? 'block' : 'none';
}

async function testAuth() {
  var btn = document.getElementById('btn-test-api');
  var res = document.getElementById('ares');
  btn.innerHTML = '<span class="spin dk"></span>&nbsp;Probando...';
  btn.disabled = true;
  res.className = 'cres';
  try {
    var r = await fetch('/api/test-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: S.version, api: getApi() })
    });
    var d = await r.json();
    res.className = 'cres show ' + (d.ok ? 'ok' : 'err');
    res.textContent = d.ok ? 'Autenticacion exitosa — token obtenido correctamente' : ('Error: ' + d.message);
  } catch(e) {
    res.className = 'cres show err';
    res.textContent = 'Error al conectar con el servidor de setup';
  }
  btn.innerHTML = 'Probar autenticacion';
  btn.disabled = false;
}

async function testConn() {
  var btn = document.getElementById('btn-test');
  var res = document.getElementById('cres');
  btn.innerHTML = '<span class="spin"></span>&nbsp;Probando...';
  btn.disabled = true;
  res.className = 'cres';
  try {
    var r = await fetch('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: S.platform, db: getDb() })
    });
    var d = await r.json();
    res.className = 'cres show ' + (d.ok ? 'ok' : 'err');
    res.textContent = d.ok ? 'Conexion exitosa' : d.message;
  } catch (e) {
    res.className = 'cres show err';
    res.textContent = 'Error al conectar con el servidor';
  }
  btn.innerHTML = 'Probar conexion';
  btn.disabled = false;
}

async function loadServices() {
  var area = document.getElementById('svc-load-area');
  var err  = document.getElementById('svc-err');
  err.className = 'cres';
  area.innerHTML = '<div style="font-size:12px;color:var(--muted);padding:4px 0"><span class="spin dk"></span>&nbsp;Cargando servicios...</div>';
  document.getElementById('svc-picker').style.display = 'none';
  try {
    var r = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: S.platform, db: getDb() })
    });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    allServices = d.services;
    var filterEl = document.getElementById('svc-filter');
    if (filterEl && !filterEl.value) filterEl.value = S.version === 'V3' ? 'BT' : 'Public';
    filterServices();
    document.getElementById('svc-picker').style.display = 'block';
    area.innerHTML = '';
  } catch(e) {
    area.innerHTML = '';
    err.className = 'cres show err';
    err.textContent = e.message;
  }
}

function filterServices() {
  var filter = (document.getElementById('svc-filter').value || '').toLowerCase();
  var sel = document.getElementById('sel-svc');
  var prev = sel.value;
  sel.innerHTML = '<option value="">-- Seleccionar --</option>';
  allServices.filter(function(s) {
    return !filter || s.toLowerCase().startsWith(filter);
  }).forEach(function(s) {
    var opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    if (s === prev) opt.selected = true;
    sel.appendChild(opt);
  });
  if (prev && sel.value !== prev) {
    document.getElementById('sel-mtd').innerHTML = '<option value="">-- Seleccionar --</option>';
  }
}

async function loadMethods(service) {
  var sel = document.getElementById('sel-mtd');
  sel.innerHTML = '<option value="">Cargando...</option>';
  if (!service) {
    sel.innerHTML = '<option value="">-- Seleccionar metodo --</option>';
    return;
  }
  try {
    var r = await fetch('/api/methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: S.platform, db: getDb(), service: service })
    });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    sel.innerHTML = '<option value="__all__">Todos los metodos (' + d.methods.length + ')</option>';
    d.methods.forEach(function(m) {
      var opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      sel.appendChild(opt);
    });
    sel.value = '__all__';
  } catch(e) {
    sel.innerHTML = '<option value="">Error al cargar</option>';
  }
}

function addItem() {
  var svc = document.getElementById('sel-svc').value;
  var mtd = document.getElementById('sel-mtd').value;
  if (!svc || !mtd) return;
  var dup = items.some(function(it) { return it.service === svc && it.method === mtd; });
  if (dup) return;
  items.push({ service: svc, method: mtd });
  renderList();
  var btn = document.getElementById('btn-save');
  if (btn) btn.disabled = false;
}

function removeItem(idx) {
  items.splice(idx, 1);
  renderList();
  if (items.length === 0) {
    var btn = document.getElementById('btn-save');
    if (btn) btn.disabled = true;
  }
}

async function renderList() {
  var el = document.getElementById('svc-list');
  if (!items.length) { el.innerHTML = ''; return; }
  var rows = items.map(function(item, i) {
    var label = item.method === '__all__' ? 'Todos los metodos' : item.method;
    var border = i > 0 ? 'border-top:1px solid var(--border)' : '';
    var badge = item.method !== '__all__'
      ? '<div id="svc-badge-' + i + '" style="font-size:10px;margin-top:2px"><span class="spin dk"></span></div>'
      : '';
    return '<div class="svc-row" style="' + border + '">' +
      '<span><strong>' + item.service + '</strong><span class="svc-mtd">/ ' + label + '</span>' + badge + '</span>' +
      '<button class="svc-rm" onclick="removeItem(' + i + ')">&#10005;</button>' +
      '</div>';
  });
  el.innerHTML = '<div class="svc-wrap">' + rows.join('') + '</div>';

  var checkItems = items
    .map(function(item, i) { return { i: i, service: item.service, method: item.method }; })
    .filter(function(x) { return x.method !== '__all__'; });
  if (!checkItems.length || !S || !S.version) return;

  try {
    var r = await fetch('/api/check-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: S.version, items: checkItems.map(function(x) { return { service: x.service, method: x.method }; }) })
    });
    var d = await r.json();
    if (!d.ok) return;
    d.results.forEach(function(res, ri) {
      var idx = checkItems[ri].i;
      var badgeEl = document.getElementById('svc-badge-' + idx);
      if (!badgeEl) return;
      if (res.exists) {
        var dt = new Date(res.mtime);
        var fmt = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        badgeEl.innerHTML = '<span style="color:#16a34a;font-weight:500">&#10003; Generado</span> <span style="color:var(--muted)">' + fmt + '</span>';
      } else {
        badgeEl.innerHTML = '<span style="color:var(--muted)">&#9679; No generado aun</span>';
      }
    });
  } catch(e) {}
}

async function saveEnv() {
  var btn = document.getElementById('btn-save');
  var valEl = document.getElementById('doc-val-block');
  if (valEl) { valEl.innerHTML = ''; valEl.style.display = 'none'; }

  var docItems = items.filter(function(it) { return it.method; }).map(function(it) { return { service: it.service, method: it.method }; });
  if (docItems.length) {
    btn.innerHTML = '<span class="spin"></span>&nbsp;Validando...';
    btn.disabled = true;
    try {
      var rv = await fetch('/sg/api/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, items: docItems }) });
      var dv = await rv.json();
      if (dv.ok && dv.warnings && dv.warnings.length) {
        renderWarnings('doc-val-block', dv.warnings);
        btn.innerHTML = 'Guardar y finalizar &#10003;';
        btn.disabled = false;
        return;
      }
      if (!dv.ok) {
        if (valEl) { valEl.innerHTML = '<div style="background:#fff7ed;border:1px solid #fdba74;border-radius:8px;padding:12px 16px;font-size:12px;color:#9a3412">&#9888; No se pudo validar: ' + (dv.message || 'error desconocido') + '</div>'; valEl.style.display = ''; }
        btn.innerHTML = 'Guardar y finalizar &#10003;';
        btn.disabled = false;
        return;
      }
    } catch(e) {
      if (valEl) { valEl.innerHTML = '<div style="background:#fff7ed;border:1px solid #fdba74;border-radius:8px;padding:12px 16px;font-size:12px;color:#9a3412">&#9888; Error al validar: ' + e.message + '</div>'; valEl.style.display = ''; }
      btn.innerHTML = 'Guardar y finalizar &#10003;';
      btn.disabled = false;
      return;
    }
  }

  btn.innerHTML = '<span class="spin"></span>&nbsp;Guardando...';
  btn.disabled = true;
  try {
    var r = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: S.version, platform: S.platform, db: getDb(), api: getApi() })
    });
    var d = await r.json();
    if (d.ok) {
      show(6);
      var et = document.getElementById('exec-toggle');
      if (et) { et.style.display = 'block'; }
      var cbEjSave = document.getElementById('cb-ejecutar');
      if (cbEjSave) cbEjSave.checked = false;
      var ps = document.getElementById('params-section');
      if (ps) ps.style.display = 'none';
      paramFields = {};
      workflowData = {};
      wfConfirmed = false;
    } else {
      alert('Error al guardar: ' + d.message);
      btn.innerHTML = 'Guardar y finalizar &#10003;';
      btn.disabled = false;
    }
  } catch (e) {
    alert('Error inesperado: ' + e.message);
    btn.innerHTML = 'Guardar y finalizar &#10003;';
    btn.disabled = false;
  }
}

function buildWorkflowCard(service, workflow, uncovered) {
  var steps = workflow.steps || [];
  var total = steps.length;

  // Deduplicate all uncovered params across steps into one global list
  var globalParams = [];
  var seenGlobal = new Set();
  if (uncovered) {
    uncovered.forEach(function(stepUnc) {
      (stepUnc || []).forEach(function(p) {
        if (!seenGlobal.has(p.name)) { seenGlobal.add(p.name); globalParams.push(p); }
      });
    });
  }

  var html = '<div class="param-card">';
  html += '<div class="param-card-hd" style="display:flex;justify-content:space-between;align-items:center">';
  html += '<span>' + service + ' &mdash; ' + total + ' pasos</span>';
  html += '<span style="font-size:10px;font-weight:400;color:var(--muted)">Arrastra para reordenar</span>';
  html += '</div>';

  // Global params block (only shown after confirming order)
  if (globalParams.length) {
    html += '<div class="wf-global-params" ondragstart="return false">';
    html += '<div style="font-size:11px;font-weight:600;color:var(--blue);margin-bottom:8px">Parametros de entrada del workflow:</div>';
    globalParams.forEach(function(p) {
      var fid = 'wfg-' + service + '-' + p.name;
      html += '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px">';
      html += '<label style="min-width:130px;font-size:11px;font-weight:500;flex-shrink:0;padding-top:5px">' + p.name;
      if (p.type) html += '<div style="font-size:10px;font-weight:400;color:var(--muted)">' + p.type + '</div>';
      html += '</label>';
      if (p.isComplex) {
        var lines = p.example ? Math.min(p.example.split('\\n').length, 12) : 3;
        var exVal = p.example ? p.example.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : (p.itemType ? '[]' : '{}');
        html += '<textarea id="' + fid + '" rows="' + lines + '" data-example="' + exVal + '" style="flex:1;padding:5px 8px;border:1.5px solid var(--border);border-radius:6px;font-size:11px;font-family:Consolas,monospace;resize:vertical;outline:none">' + exVal + '</textarea>';
      } else {
        html += '<input type="text" id="' + fid + '" placeholder="Ingresar valor..." style="flex:1;padding:5px 8px;border:1.5px solid var(--border);border-radius:6px;font-size:12px;font-family:inherit;outline:none">';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  html += '<div class="param-card-bd" style="padding:0" id="wf-bd-' + service + '">';
  if (!total) {
    html += '<p style="font-size:12px;color:var(--muted);padding:10px 12px">Sin metodos detectados.</p>';
  } else {
    steps.forEach(function(step, idx) {
      var extracts = (step.extract || []).map(function(e) { return typeof e === 'string' ? e : (e.as || ''); }).filter(Boolean);
      html += '<div class="wf-step" draggable="true" data-svc="' + service + '" data-idx="' + idx + '"' +
        ' ondragstart="wfDragStart(this)" ondragend="wfDragEnd(this)"' +
        ' ondragover="wfDragOver(event)" ondragenter="wfDragEnter(this)" ondragleave="wfDragLeave(this)" ondrop="wfDrop(event,this)"' +
        ' style="' + (idx > 0 ? 'border-top:1px solid var(--border)' : '') + '">';
      html += '<div class="wf-step-hd">';
      html += '<span class="wf-handle">&#9776;</span>';
      html += '<span style="font-size:10px;font-weight:700;color:var(--muted);min-width:18px;text-align:right">' + (idx + 1) + '</span>';
      html += '<div style="flex:1">';
      html += '<span style="font-size:12px;font-weight:600">' + step.method + '</span>';
      if (extracts.length) {
        html += '<div style="font-size:10px;color:var(--green);margin-top:1px">Extrae: ' + extracts.join(', ') + '</div>';
      }
      html += '</div>';
      html += '</div>';
      html += '</div>';
    });
  }
  html += '</div></div>';
  return html;
}

var wfDragSrc = null;

function wfDragStart(el) {
  wfDragSrc = el;
  el.classList.add('wf-dragging');
}

function wfDragEnd(el) {
  el.classList.remove('wf-dragging');
  document.querySelectorAll('.wf-step').forEach(function(s) { s.classList.remove('wf-over'); });
  wfDragSrc = null;
}

function wfDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function wfDragEnter(el) {
  if (wfDragSrc && wfDragSrc !== el && wfDragSrc.dataset.svc === el.dataset.svc) {
    el.classList.add('wf-over');
  }
}

function wfDragLeave(el) {
  el.classList.remove('wf-over');
}

async function wfDrop(e, el) {
  e.preventDefault();
  el.classList.remove('wf-over');
  if (!wfDragSrc || wfDragSrc === el) return;
  var svc = wfDragSrc.dataset.svc;
  if (el.dataset.svc !== svc) return;
  var fromIdx = parseInt(wfDragSrc.dataset.idx);
  var toIdx   = parseInt(el.dataset.idx);
  if (isNaN(fromIdx) || isNaN(toIdx)) return;
  var savedVals = {};
  if (wfConfirmed) {
    document.querySelectorAll('[id^="wfg-"]').forEach(function(inp) {
      if (inp.value) savedVals[inp.id] = inp.value;
    });
  }
  var steps = workflowData[svc].workflow.steps;
  var moved = steps.splice(fromIdx, 1)[0];
  steps.splice(toIdx, 0, moved);
  if (wfConfirmed) {
    workflowData[svc].uncovered = await computeWorkflowUncovered(svc, steps);
  }
  var html = '';
  items.forEach(function(it) {
    if (it.method === '__all__' && workflowData[it.service]) {
      html += buildWorkflowCard(it.service, workflowData[it.service].workflow, wfConfirmed ? workflowData[it.service].uncovered : null);
    }
  });
  if (!wfConfirmed) {
    html += '<button class="btn btn-outline" id="btn-confirm-wf" onclick="confirmWorkflowOrder()" style="margin-top:10px;width:100%">Confirmar orden &#10003;</button>';
  }
  document.getElementById('params-section').innerHTML = html;
  if (wfConfirmed) {
    Object.keys(savedVals).forEach(function(id) {
      var inp = document.getElementById(id);
      if (inp) inp.value = savedVals[id];
    });
  }
}

async function confirmWorkflowOrder() {
  var btn = document.getElementById('btn-confirm-wf');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spin dk"></span>&nbsp;Analizando parametros...'; }
  for (var wi = 0; wi < items.length; wi++) {
    var wfItem = items[wi];
    if (wfItem.method !== '__all__' || !workflowData[wfItem.service]) continue;
    var uncWf = await computeWorkflowUncovered(wfItem.service, workflowData[wfItem.service].workflow.steps);
    workflowData[wfItem.service].uncovered = uncWf;
  }
  wfConfirmed = true;
  var html = '';
  items.forEach(function(it) {
    if (it.method === '__all__' && workflowData[it.service]) {
      html += buildWorkflowCard(it.service, workflowData[it.service].workflow, workflowData[it.service].uncovered);
    }
  });
  document.getElementById('params-section').innerHTML = html;
}

async function computeWorkflowUncovered(service, steps) {
  var available = new Set();
  var result = [];
  for (var i = 0; i < steps.length; i++) {
    var step = steps[i];
    var uncovered = [];
    try {
      var rp = await fetch('/api/input-params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: S.platform, db: getDb(), service: service, method: step.method })
      });
      var dp = await rp.json();
      if (dp.ok) {
        uncovered = dp.params.filter(function(p) { return !available.has(p.name); });
      }
    } catch(e) {}
    result.push(uncovered);
    if (step.extract) {
      step.extract.forEach(function(e) { available.add(typeof e === 'string' ? e : e.as); });
    }
    uncovered.forEach(function(p) { available.add(p.name); });
  }
  return result;
}

async function toggleEjecutar() {
  var enabled = document.getElementById('cb-ejecutar').checked;
  var section = document.getElementById('params-section');
  if (!enabled) { section.style.display = 'none'; paramFields = {}; workflowData = {}; wfConfirmed = false; return; }
  section.style.display = 'block';
  paramFields = {};
  workflowData = {};

  var hasAll  = items.some(function(it) { return it.method === '__all__'; });
  var hasSpec = items.some(function(it) { return it.method !== '__all__'; });

  if (hasAll && hasSpec) {
    section.innerHTML = '<div class="cres show err">No se puede combinar "Todos los metodos" con metodos especificos cuando la API real esta activada. Volve al paso 5 y ajusta la seleccion.</div>';
    return;
  }

  if (hasAll) {
    section.innerHTML = '<div style="padding:6px 0;font-size:12px;color:var(--muted)"><span class="spin dk"></span>&nbsp;Analizando dependencias...</div>';
    var wfHtml = '';
    for (var wi = 0; wi < items.length; wi++) {
      var wfItem = items[wi];
      try {
        var wfR = await fetch('/api/analyze-workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: S.version, service: wfItem.service })
        });
        var wfD = await wfR.json();
        if (!wfD.ok) throw new Error(wfD.message || 'Error al analizar');
        workflowData[wfItem.service] = wfD;
        wfHtml += buildWorkflowCard(wfItem.service, wfD.workflow, null);
      } catch(wfE) {
        wfHtml += '<div class="param-card"><div class="param-card-hd">' + wfItem.service + '</div>' +
          '<div class="param-card-bd" style="font-size:12px;color:var(--red)">Error: ' + wfE.message + '</div></div>';
      }
    }
    if (wfHtml) {
      wfHtml += '<button class="btn btn-outline" id="btn-confirm-wf" onclick="confirmWorkflowOrder()" style="margin-top:10px;width:100%">Confirmar orden &#10003;</button>';
    }
    section.innerHTML = wfHtml || '<div style="padding:6px 0;font-size:12px;color:var(--muted)">No hay servicios para analizar.</div>';
    return;
  }

  // Modo parametros individuales
  section.innerHTML = '<div style="padding:6px 0;font-size:12px;color:var(--muted)"><span class="spin dk"></span>&nbsp;Cargando parametros...</div>';
  var html = '';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    try {
      var rp = await fetch('/api/input-params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: S.platform, db: getDb(), service: item.service, method: item.method })
      });
      var dp = await rp.json();
      if (!dp.ok) throw new Error(dp.message || 'Error al consultar BD');
      if (!dp.params.length) {
        html += '<div class="param-card"><div class="param-card-hd">' + item.service + ' / ' + item.method + '</div>' +
          '<div class="param-card-bd" style="font-size:12px;color:var(--muted)">Sin parametros de entrada.</div></div>';
        continue;
      }
      paramFields[i] = dp.params.map(function(p) { return { name: p.name, id: 'pf-' + i + '-' + p.name, isComplex: !!p.isComplex }; });
      html += '<div class="param-card"><div class="param-card-hd">' + item.service + ' / ' + item.method + '</div><div class="param-card-bd">';
      dp.params.forEach(function(p) {
        var fid = 'pf-' + i + '-' + p.name;
        html += '<div class="param-f">';
        html += '<label>' + p.name;
        if (p.type) html += ' <span style="font-weight:400;color:var(--muted)">(' + p.type + ')</span>';
        html += '</label>';
        if (p.isComplex) {
          var lines = p.example ? Math.min(p.example.split('\\n').length, 12) : 3;
          var exVal = p.example ? p.example.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : (p.itemType ? '[]' : '{}');
          html += '<textarea id="' + fid + '" rows="' + lines + '" data-example="' + exVal + '" style="width:100%;padding:7px 10px;border:1.5px solid var(--border);border-radius:6px;font-size:11px;font-family:Consolas,monospace;resize:vertical;outline:none">' + exVal + '</textarea>';
        } else {
          html += '<input type="text" id="' + fid + '" placeholder="' + (p.type || 'Varchar') + '">';
        }
        html += '</div>';
      });
      html += '</div></div>';
    } catch(ep) {
      html += '<div class="param-card"><div class="param-card-hd">' + item.service + ' / ' + item.method + '</div>' +
        '<div class="param-card-bd" style="font-size:12px;color:var(--red)">Error: ' + ep.message + '</div></div>';
    }
  }
  section.innerHTML = html || '<div style="padding:6px 0;font-size:12px;color:var(--muted)">No hay parametros de entrada para los servicios seleccionados.</div>';
}

async function generateDocs() {
  var unchanged = [];
  document.querySelectorAll('textarea[data-example]').forEach(function(el) {
    if (el.value.trim() === el.getAttribute('data-example').trim()) unchanged.push(el.id);
  });
  if (unchanged.length > 0) {
    if (!confirm('Hay ' + unchanged.length + ' campo(s) SDT con valores de ejemplo sin modificar.\\nEstos valores son solo estructurales y pueden no ser validos para la API.\\n\\n¿Continuar de todas formas?')) return;
  }

  var btn = document.getElementById('btn-generate');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span>&nbsp;Generando...';
  document.getElementById('gen-hint').style.display = 'none';

  var log = document.getElementById('gen-log');
  log.style.display = 'block';
  log.innerHTML = items.map(function(item, i) {
    var label = item.method === '__all__' ? 'Todos los metodos' : item.method;
    return '<div class="gen-row" id="gen-row-' + i + '">' +
      '<span class="gen-ic" id="gen-ic-' + i + '"><span class="spin dk"></span></span>' +
      '<div class="gen-lbl" id="gen-lbl-' + i + '"><strong>' + item.service + '</strong> / ' + label +
        '<div class="gen-out" id="gen-out-' + i + '"></div>' +
      '</div>' +
      '</div>';
  }).join('');

  var cbEj = document.getElementById('cb-ejecutar');
  var ejecutar = cbEj ? cbEj.checked : false;
  var paramValues = {};
  var wfOverrides = {};
  if (ejecutar) {
    items.forEach(function(item, i) {
      if (item.method === '__all__') {
        if (workflowData[item.service]) {
          var wfCopy = JSON.parse(JSON.stringify(workflowData[item.service].workflow));
          var wfUnc = workflowData[item.service].uncovered || [];
          // Read each global param once from wfg- fields
          var globalVals = {};
          var seenG = new Set();
          wfUnc.forEach(function(stepUnc) {
            (stepUnc || []).forEach(function(p) {
              if (seenG.has(p.name)) return;
              seenG.add(p.name);
              var inp = document.getElementById('wfg-' + item.service + '-' + p.name);
              var raw = inp ? inp.value.trim() : '';
              if (!raw) return;
              if (p.isComplex) {
                try { globalVals[p.name] = JSON.parse(raw); } catch(e) { globalVals[p.name] = raw; }
              } else {
                globalVals[p.name] = raw;
              }
            });
          });
          // Inject into each step that needs the param
          wfCopy.steps.forEach(function(wfStep, wfIdx) {
            (wfUnc[wfIdx] || []).forEach(function(p) {
              if (globalVals[p.name] !== undefined) {
                wfStep.params = wfStep.params || {};
                wfStep.params[p.name] = globalVals[p.name];
              }
            });
          });
          wfOverrides[item.service] = wfCopy;
        }
      } else {
        if (!paramFields[i] || !paramFields[i].length) return;
        var vals = {};
        paramFields[i].forEach(function(f) {
          var el = document.getElementById(f.id);
          var raw = el ? el.value.trim() : '';
          if (!raw) return;
          if (f.isComplex) {
            try { vals[f.name] = JSON.parse(raw); } catch(e) { vals[f.name] = raw; }
          } else {
            vals[f.name] = raw;
          }
        });
        if (Object.keys(vals).length) paramValues[i] = vals;
      }
    });
  }

  try {
    var response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: S.version, items: items, ejecutar: ejecutar, paramValues: paramValues, wfOverrides: wfOverrides })
    });
    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    var buf = '';
    while (true) {
      var chunk = await reader.read();
      if (chunk.done) break;
      buf += decoder.decode(chunk.value, { stream: true });
      var parts = buf.split('\\n\\n');
      buf = parts.pop();
      parts.forEach(function(part) {
        if (!part.startsWith('data: ')) return;
        try { handleGenEvent(JSON.parse(part.slice(6))); } catch(e) {}
      });
    }
  } catch(e) {
    log.innerHTML += '<div style="padding:10px 13px;font-size:12px;color:var(--red)">Error: ' + e.message + '</div>';
  }

  btn.innerHTML = 'Generar documentacion';
  btn.disabled = false;
  document.getElementById('gen-hint').style.display = 'block';
  document.getElementById('post-gen-actions').style.display = 'block';
  renderList();
}

function resetParaOtroServicio() {
  items = [];
  paramFields = {};
  workflowData = {};
  wfConfirmed = false;
  var genLog = document.getElementById('gen-log');
  if (genLog) { genLog.style.display = 'none'; genLog.innerHTML = ''; }
  var postActs = document.getElementById('post-gen-actions');
  if (postActs) postActs.style.display = 'none';
  var cbEj = document.getElementById('cb-ejecutar');
  if (cbEj) cbEj.checked = false;
  var ps = document.getElementById('params-section');
  if (ps) { ps.style.display = 'none'; ps.innerHTML = ''; }
  var hint = document.getElementById('gen-hint');
  if (hint) hint.style.display = 'none';
  var btn = document.getElementById('btn-generate');
  if (btn) { btn.style.display = 'block'; btn.disabled = false; btn.innerHTML = 'Generar documentacion ahora'; }
  show(5);
}

function handleGenEvent(ev) {
  if (ev.type === 'result') {
    var item = items[ev.index];
    var ic  = document.getElementById('gen-ic-'  + ev.index);
    var row = document.getElementById('gen-row-' + ev.index);
    var out = document.getElementById('gen-out-' + ev.index);
    var lbl = document.getElementById('gen-lbl-' + ev.index);
    if (!ic) return;
    if (ev.code === 0) {
      ic.innerHTML = '<span style="color:var(--green)">&#10003;</span>';
      if (lbl && item) {
        if (item.method !== '__all__') {
          var fp = S.version + '/' + toFolderName(item.service) + '/' + item.method + '.md';
          lbl.insertAdjacentHTML('beforeend',
            '<br><a href="/files/' + encodeURIComponent(fp) + '" download' +
            ' style="font-size:10px;color:var(--blue);text-decoration:none">&#8595; Descargar .md</a>');
        } else {
          var folder = S.version + '/' + toFolderName(item.service);
          lbl.insertAdjacentHTML('beforeend',
            '<br><button data-folder="' + folder + '" onclick="openFolder(this.dataset.folder)"' +
            ' style="background:none;border:none;cursor:pointer;font-size:10px;color:var(--blue);padding:0">&#128193; Abrir carpeta</button>');
        }
      }
    } else {
      ic.innerHTML = '<span style="color:var(--red)">&#10005;</span>';
      if (row) row.classList.add('has-err');
      if (out && ev.output) out.textContent = ev.output.trim().slice(-400);
    }
  }
}

async function openFolder(folder) {
  try {
    await fetch('/api/open-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: folder })
    });
  } catch(e) {}
}

// ── Flujo Scripts: funciones ───────────────────────────────────

async function sgLoadServices() {
  var loading = document.getElementById('sg-svc-loading'), err = document.getElementById('sg-svc-err');
  if (err) err.className = 'cres';
  if (loading) loading.style.display = 'flex';
  try {
    var r = await fetch('/sg/api/services', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    var sel = document.getElementById('sg-sel-svc');
    sel.innerHTML = '<option value="">-- Seleccioná un servicio --</option>';
    d.services.forEach(function(s) { var o = document.createElement('option'); o.value = s; o.textContent = s; sel.appendChild(o); });
    sgServicesLoaded = true;
  } catch(e) {
    if (err) { err.className = 'cres show err'; err.textContent = e.message; }
  }
  if (loading) loading.style.display = 'none';
}

async function sgAddServiceToList() {
  var svc = document.getElementById('sg-sel-svc').value; if (!svc) return;
  var err = document.getElementById('sg-svc-err');
  if (sgServiceGroups.find(function(g) { return g.name === svc; })) {
    err.className = 'cres show err'; err.textContent = 'Ese servicio ya fue agregado.';
    setTimeout(function() { err.className = 'cres'; }, 2500); return;
  }
  err.className = 'cres';
  var container = document.getElementById('sg-service-groups');
  var div = document.createElement('div'); div.className = 'sg-svc-group';
  div.innerHTML = '<div class="sg-svc-group-hd"><span class="sg-svc-group-name">'+svc+'</span><span style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:5px"><span class="spin dk"></span> Cargando...</span></div>';
  container.appendChild(div);
  try {
    var results = await Promise.all([
      fetch('/sg/api/methods', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, service: svc }) }),
      fetch('/sg/api/service-versions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, service: svc }) }),
    ]);
    var dm = await results[0].json(), dv = await results[1].json();
    if (!dm.ok) throw new Error(dm.message);
    var versions = (dv.ok && dv.versions && dv.versions.length) ? dv.versions : ['1'];
    var group = { name: svc, version: versions[0], versions: versions, methods: dm.methods, selected: new Set(), el: div };
    sgServiceGroups.push(group);
    sgRenderServiceGroup(div, group, sgServiceGroups.length - 1);
  } catch(e) {
    div.remove();
    err.className = 'cres show err'; err.textContent = 'Error al cargar '+svc+': '+e.message;
  }
  sgUpdateNextBtn();
}

function sgRenderServiceGroup(el, group, idx) {
  el.innerHTML = '';
  var hd = document.createElement('div'); hd.className = 'sg-svc-group-hd';
  var left = document.createElement('div'); left.style.cssText = 'display:flex;align-items:center;gap:10px';
  var nameSpan = document.createElement('span'); nameSpan.className = 'sg-svc-group-name'; nameSpan.textContent = group.name; left.appendChild(nameSpan);
  if (group.versions.length > 1) {
    var verSel = document.createElement('select'); verSel.className = 'pinput'; verSel.style.cssText = 'width:60px;font-size:11px';
    group.versions.forEach(function(ver) { var opt = document.createElement('option'); opt.value = ver; opt.textContent = ver; if (ver === group.version) opt.selected = true; verSel.appendChild(opt); });
    verSel.addEventListener('change', (function(i) { return function() { sgServiceGroups[i].version = this.value; }; })(idx));
    left.appendChild(verSel);
  } else {
    var verSpan = document.createElement('span'); verSpan.style.cssText = 'font-size:11px;color:var(--muted)'; verSpan.textContent = 'Ver. '+group.version; left.appendChild(verSpan);
  }
  var right = document.createElement('div'); right.style.cssText = 'display:flex;align-items:center;gap:8px';
  var allBtn = document.createElement('button'); allBtn.className = 'btn-pill'; allBtn.textContent = '✓ Todos';
  allBtn.addEventListener('click', (function(i) { return function() { sgSelectAllInGroup(i, true); }; })(idx));
  var noneBtn = document.createElement('button'); noneBtn.className = 'btn-pill'; noneBtn.textContent = '✗ Ninguno';
  noneBtn.addEventListener('click', (function(i) { return function() { sgSelectAllInGroup(i, false); }; })(idx));
  var rmBtn = document.createElement('button'); rmBtn.className = 'pin-rm'; rmBtn.style.fontSize = '18px'; rmBtn.textContent = '×';
  rmBtn.addEventListener('click', (function(i) { return function() { sgRemoveServiceGroup(i); }; })(idx));
  right.appendChild(allBtn); right.appendChild(noneBtn); right.appendChild(rmBtn);
  hd.appendChild(left); hd.appendChild(right); el.appendChild(hd);
  var searchWrap = document.createElement('div'); searchWrap.className = 'sg-search-wrap';
  var searchInput = document.createElement('input'); searchInput.type = 'text'; searchInput.placeholder = 'Buscar método...'; searchInput.className = 'pinput'; searchInput.style.cssText = 'width:100%;font-size:12px';
  searchWrap.appendChild(searchInput); el.appendChild(searchWrap);
  var bd = document.createElement('div'); bd.className = 'sg-svc-group-bd';
  searchInput.addEventListener('input', function() { var q = this.value.toLowerCase(); bd.querySelectorAll('.sg-mtd-item').forEach(function(item) { var lbl = item.querySelector('.sg-chk-lbl'); item.style.display = (!q || lbl.textContent.toLowerCase().indexOf(q) !== -1) ? '' : 'none'; }); });
  if (!group.methods.length) { var empty = document.createElement('div'); empty.style.cssText = 'padding:13px 16px;font-size:13px;color:var(--muted)'; empty.textContent = 'Sin métodos'; bd.appendChild(empty); }
  else { group.methods.forEach(function(method) { bd.appendChild(sgBuildMethodCheckbox(group, idx, method)); }); }
  el.appendChild(bd);
}

function sgBuildMethodCheckbox(group, idx, method) {
  var label = document.createElement('label'); label.className = 'sg-mtd-item';
  var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = group.selected.has(method);
  cb.addEventListener('change', (function(i, m) { return function() { if (this.checked) sgServiceGroups[i].selected.add(m); else sgServiceGroups[i].selected.delete(m); sgUpdateNextBtn(); }; })(idx, method));
  var box = document.createElement('span'); box.className = 'sg-chk';
  var lbl = document.createElement('span'); lbl.className = 'sg-chk-lbl'; lbl.textContent = method;
  label.appendChild(cb); label.appendChild(box); label.appendChild(lbl); return label;
}

function sgSelectAllInGroup(idx, val) {
  var group = sgServiceGroups[idx];
  if (val) { group.methods.forEach(function(m) { group.selected.add(m); }); } else { group.selected.clear(); }
  var bd = group.el.querySelector('.sg-svc-group-bd'); bd.innerHTML = '';
  group.methods.forEach(function(method) { bd.appendChild(sgBuildMethodCheckbox(group, idx, method)); });
  sgUpdateNextBtn();
}

function sgRemoveServiceGroup(idx) {
  if (sgServiceGroups[idx].el) sgServiceGroups[idx].el.remove();
  sgServiceGroups.splice(idx, 1);
  var container = document.getElementById('sg-service-groups'); container.innerHTML = '';
  sgServiceGroups.forEach(function(g, i) { var div = document.createElement('div'); div.className = 'sg-svc-group'; g.el = div; container.appendChild(div); sgRenderServiceGroup(div, g, i); });
  sgUpdateNextBtn();
}

function sgUpdateNextBtn() {
  var has = sgServiceGroups.some(function(g) { return g.selected.size > 0; });
  var btn = document.getElementById('btn-next');
  if (btn && S.step === 4 && S.action === 'scripts') btn.disabled = !has;
}

async function sgFetchAndShowOutput(groups) {
  var btn = document.getElementById('btn-next');
  if (btn) { btn.innerHTML = '<span class="spin"></span>&nbsp;Generando...'; btn.disabled = true; }
  try {
    var allItems = [];
    await Promise.all(groups.map(async function(group) {
      var methods = Array.from(group.selected);
      var r = await fetch('/sg/api/methods-full', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, service: group.name, srvver: group.version, methods: methods }) });
      var d = await r.json(); if (!d.ok) throw new Error(d.message);
      d.items.forEach(function(item) { allItems.push(item); });
    }));
    var warnings = validateItems(allItems);
    console.log('[SG] validateItems result:', warnings.length, 'warnings', warnings);
    var valEl = document.getElementById('sg-val-block');
    if (warnings.length) {
      if (valEl) renderWarnings('sg-val-block', warnings);
      if (btn) { btn.innerHTML = 'Generar script &#8594;'; btn.disabled = false; sgUpdateNextBtn(); }
      return;
    }
    if (valEl) { valEl.innerHTML = ''; valEl.style.display = 'none'; }
    sgMultiData = allItems;
    var svcs = allItems.reduce(function(a,it){ if(a.indexOf(it.header.BTISrvNom)<0)a.push(it.header.BTISrvNom); return a; },[]);
    document.getElementById('sg-out-title').textContent = 'Script — ' + svcs.join(', ');
    document.getElementById('sg-out-sub').textContent = allItems.length + ' método' + (allItems.length>1?'s':'');
    show(5);
    sgDoGenerate('both');
  } catch(e) {
    alert('Error: ' + e.message);
    if (btn) { btn.innerHTML = 'Generar script &#8594;'; btn.disabled = false; sgUpdateNextBtn(); }
  }
}

async function sgDoGenerate(mode) {
  if (!sgMultiData || !sgMultiData.length) return;
  try {
    var r = await fetch('/sg/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: sgMultiData, mode: mode }) });
    var d = await r.json();
    document.getElementById('sg-sql-out').value = d.script || '';
  } catch(e) { document.getElementById('sg-sql-out').value = 'Error: ' + e.message; }
}

function sgGenerate(mode) { sgDoGenerate(mode); }

function sgCopyScript() {
  var ta = document.getElementById('sg-sql-out'); if (!ta.value.trim()) return;
  navigator.clipboard.writeText(ta.value).then(function() {
    var res = document.getElementById('sg-copy-res');
    res.className = 'cres show ok'; res.textContent = 'Copiado al portapapeles ✓';
    setTimeout(function() { res.className = 'cres'; }, 2000);
  }).catch(function() { ta.select(); document.execCommand('copy'); });
}

function sgReset() {
  sgServiceGroups = []; sgMultiData = null; sgServicesLoaded = false;
  document.getElementById('sg-service-groups').innerHTML = '';
  document.getElementById('sg-sel-svc').innerHTML = '<option value="">-- Seleccioná un servicio --</option>';
  document.getElementById('sg-sql-out').value = '';
  show(4); sgLoadServices();
}
</script>
</body>
</html>`;

// -- Script Generator HTML ---------------------------------

const SG_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Generador de Scripts Bantotal</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--blue:#c42e2c;--blue-h:#9e2423;--blue-l:#fdf3f3;--green:#059669;--green-l:#ECFDF5;--red:#c42e2c;--red-l:#fdf3f3;--text:#121418;--muted:#636768;--border:#c6c7c7;--bg:#f2f2f2;--r:12px;--shadow:0 8px 40px rgba(18,20,24,.14)}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:24px;padding-top:56px;color:var(--text)}
.nav-bar{position:fixed;top:0;left:0;right:0;background:#9e2423;padding:0 20px;height:36px;display:flex;align-items:center;gap:14px;z-index:200;font-size:12px}
.nav-bar a{color:rgba(255,255,255,.75);text-decoration:none;padding:4px 10px;border-radius:5px;transition:background .15s}.nav-bar a:hover{background:rgba(255,255,255,.15)}
.nav-bar .nav-active{color:#fff;font-weight:600;pointer-events:none}
.nav-sep{color:rgba(255,255,255,.3)}
.wizard{background:#fff;border-radius:var(--r);box-shadow:var(--shadow);width:100%;max-width:740px;overflow:hidden}
.wiz-hd{background:var(--blue);padding:28px 32px 40px;color:#fff;position:relative}
.wiz-hd h1{font-size:17px;font-weight:600;margin-bottom:24px;opacity:.95;letter-spacing:-.01em}
.steps-bar{display:flex;align-items:center}
.sdot{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:rgba(255,255,255,.4);transition:all .3s;position:relative;flex-shrink:0}
.sdot.done{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.7);color:#fff}
.sdot.active{background:#fff;border-color:#fff;color:var(--blue)}
.sdot-lb{position:absolute;top:30px;left:50%;transform:translateX(-50%);font-size:9px;white-space:nowrap;color:rgba(255,255,255,.45);font-weight:400}
.sdot.active .sdot-lb,.sdot.done .sdot-lb{color:rgba(255,255,255,.85)}
.sline{flex:1;height:2px;background:rgba(255,255,255,.18);transition:background .3s}
.sline.done{background:rgba(255,255,255,.55)}
.wiz-bd{padding:30px 32px;min-height:380px}
.panel{display:none;animation:fadeIn .2s ease}.panel.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.ptitle{font-size:15px;font-weight:600;margin-bottom:4px}
.psub{font-size:12px;color:var(--muted);margin-bottom:22px;line-height:1.5}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.ccard{border:2px solid var(--border);border-radius:10px;padding:20px 14px;cursor:pointer;text-align:center;background:#fff;transition:all .18s;user-select:none}
.ccard:hover{border-color:var(--blue);background:var(--blue-l)}
.ccard.sel{border-color:var(--blue);background:var(--blue-l)}
.ccard-title{font-size:22px;font-weight:700;color:var(--blue);display:block;margin-bottom:5px}
.ccard-desc{font-size:11px;color:var(--muted);display:block;line-height:1.4}
.field{margin-bottom:15px}
.field label{display:block;font-size:12px;font-weight:500;color:var(--text);margin-bottom:5px}
.field input,.field select{width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;color:var(--text);outline:none;transition:border-color .15s;background:#fff;font-family:inherit}
.field input:focus,.field select:focus{border-color:var(--blue)}
.field input[readonly]{background:#f5f5f5;color:var(--muted)}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.frow3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.pw{position:relative}.pw input{padding-right:36px}
.pw-btn{position:absolute;right:9px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);font-size:14px;padding:2px}
.hint{font-size:11px;color:var(--muted);margin-top:4px}
.cres{display:none;padding:10px 13px;border-radius:8px;font-size:12px;margin-bottom:14px;align-items:flex-start;gap:8px;line-height:1.5}
.cres.show{display:flex}.cres.ok{background:var(--green-l);color:var(--green)}.cres.err{background:var(--red-l);color:var(--red)}
.sep{border:none;border-top:1px solid var(--border);margin:20px 0}
.section-lbl{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px}
.param-wrap{border:1.5px solid var(--border);border-radius:8px;overflow:auto;margin-bottom:10px;max-height:340px}
.param-table{border-collapse:collapse;width:max-content;min-width:100%}
.param-table th{background:#f5f5f5;padding:7px 8px;font-size:11px;font-weight:600;color:var(--muted);white-space:nowrap;border-bottom:1.5px solid var(--border);text-align:left;position:sticky;top:0;z-index:1}
.param-table td{padding:4px 4px;border-bottom:1px solid var(--border);vertical-align:middle}
.param-table tr:last-child td{border-bottom:none}
.param-table td:first-child{padding-left:10px;font-size:11px;color:var(--muted);font-weight:600;text-align:center;width:32px}
.pinput{border:1.5px solid var(--border);border-radius:6px;padding:5px 7px;font-size:11px;font-family:inherit;outline:none;background:#fff;color:var(--text)}
.pinput:focus{border-color:var(--blue)}
.pin-rm{background:none;border:none;cursor:pointer;color:var(--muted);font-size:15px;padding:2px 6px;line-height:1;transition:color .15s}
.pin-rm:hover{color:var(--red)}
.add-btn{width:100%;padding:9px;border:1.5px dashed var(--border);border-radius:8px;background:none;font-size:12px;color:var(--muted);cursor:pointer;transition:all .15s;font-family:inherit;margin-bottom:4px}
.add-btn:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-l)}
.sql-out{width:100%;min-height:220px;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-family:Consolas,monospace;font-size:12px;color:#1e293b;background:#f8fafc;resize:vertical;outline:none;line-height:1.55}
.gen-btns{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.wiz-ft{display:flex;justify-content:space-between;align-items:center;padding:16px 32px;border-top:1px solid var(--border);background:#f5f5f5;min-height:64px}
.btn{padding:9px 18px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all .17s;font-family:inherit;display:inline-flex;align-items:center;gap:6px}
.btn:disabled{opacity:.45;cursor:not-allowed;pointer-events:none}
.btn-ghost{background:none;color:var(--muted);border:1.5px solid var(--border)}
.btn-ghost:hover{border-color:#9a9a9a;color:var(--text)}
.btn-primary{background:var(--blue);color:#fff}.btn-primary:hover{background:var(--blue-h)}
.btn-outline{background:none;color:var(--blue);border:1.5px solid var(--blue)}.btn-outline:hover{background:var(--blue-l)}
.btn-green{background:var(--green);color:#fff}.btn-green:hover{background:#047857}
.btn-sm{padding:6px 12px;font-size:12px}
.spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:rot .65s linear infinite;flex-shrink:0}
.spin.dk{border-color:rgba(0,0,0,.1);border-top-color:var(--blue)}
@keyframes rot{to{transform:rotate(360deg)}}
label.mtd-check-item{display:flex;align-items:center;padding:11px 16px;gap:11px;cursor:pointer;border-bottom:1px solid var(--border);transition:background .12s;user-select:none;font-size:13px;font-weight:400;color:var(--text);margin-bottom:0}
label.mtd-check-item:last-child{border-bottom:none}
label.mtd-check-item:hover{background:var(--blue-l)}
label.mtd-check-item input[type=checkbox]{display:none}
.chk-box{width:18px;height:18px;border:2px solid var(--border);border-radius:5px;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s}
label.mtd-check-item:hover .chk-box{border-color:var(--blue)}
label.mtd-check-item input:checked~.chk-box{background:var(--blue);border-color:var(--blue)}
label.mtd-check-item input:checked~.chk-box::after{content:'';display:block;width:5px;height:9px;border:2px solid #fff;border-top:none;border-left:none;transform:rotate(45deg) translate(0px,-1px)}
.chk-label{font-size:13px;color:var(--text);cursor:pointer;flex:1}
.btn-pill{padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;line-height:1.5;transition:all .15s;border:1.5px solid var(--border);background:#fff;color:var(--muted)}
.btn-pill:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-l)}
.btn-pill.sel{border-color:var(--blue);color:var(--blue);background:var(--blue-l)}
.btn-pill.sel:hover{background:var(--blue);color:#fff}
.svc-group{border:1.5px solid var(--border);border-radius:10px;margin-bottom:12px;overflow:hidden}
.svc-group-hd{background:#f5f5f5;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.svc-group-name{font-size:13px;font-weight:600;color:var(--text)}
.svc-group-bd{max-height:220px;overflow-y:auto}
.svc-search-wrap{padding:6px 10px;border-bottom:1px solid var(--border);background:#fff}
.dm-btn{position:absolute;top:14px;right:16px;background:#fff;border:none;border-radius:8px;color:var(--blue);cursor:pointer;width:34px;height:34px;display:flex;align-items:center;justify-content:center;transition:background .2s;flex-shrink:0;z-index:10}
.dm-btn:hover{background:rgba(255,255,255,.85)}
body.dark .dm-btn{background:#252830;color:var(--blue)}
body.dark{--bg:#111317;--text:#dde1e7;--muted:#8a9ab0;--border:#2e333d;--blue-l:rgba(196,46,44,.13);--green-l:rgba(5,150,105,.13);--red-l:rgba(196,46,44,.13)}
body.dark .wizard{background:#1c1f26}
body.dark .wiz-ft{background:#161920}
body.dark .wiz-bd{background:#1c1f26}
body.dark .ccard{background:#252830;border-color:#2e333d}
body.dark .ccard:hover{background:rgba(196,46,44,.18);border-color:#e04442}
body.dark .ccard.sel{background:rgba(196,46,44,.25);border-color:#e04442}
body.dark .field input,body.dark .field select{background:#252830;color:var(--text);border-color:var(--border)}
body.dark .field input[readonly]{background:#1a1d23;color:var(--muted)}
body.dark .pinput{background:#252830;color:var(--text);border-color:var(--border)}
body.dark .sql-out{background:#161b27;color:#93c5fd;border-color:var(--border)}
body.dark .param-table th{background:#252830}
body.dark .param-table td{border-color:var(--border)}
body.dark .param-wrap{border-color:var(--border)}
body.dark .svc-group-hd{background:#252830}
body.dark .svc-group{border-color:var(--border)}
body.dark .svc-search-wrap{background:#1c1f26}
body.dark .chk-box{background:#252830;border-color:var(--border)}
body.dark .add-btn{border-color:var(--border);color:var(--muted)}
body.dark .btn-ghost{border-color:var(--border);color:var(--muted)}
body.dark .btn-pill{background:#252830;border-color:var(--border)}
body.dark select option{background:#252830;color:var(--text)}
body.dark .nav-bar{background:#7a1a1a}
</style>
</head>
<body>
<nav class="nav-bar">
  <a href="/">&#8592; Documentar</a>
  <span class="nav-sep">|</span>
  <span class="nav-active">Generar Scripts</span>
</nav>
<div class="wizard">
  <div class="wiz-hd">
    <button class="dm-btn" id="dm-btn" onclick="toggleDark()" title="Modo oscuro"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>
    <h1>Generador de Scripts Bantotal</h1>
    <div class="steps-bar">
      <div class="sdot active" id="d1"><span id="dn1">1</span><span class="sdot-lb">Versión</span></div>
      <div class="sline" id="l1"></div>
      <div class="sdot" id="d2"><span id="dn2">2</span><span class="sdot-lb">Conexión</span></div>
      <div class="sline" id="l2"></div>
      <div class="sdot" id="d3"><span id="dn3">3</span><span class="sdot-lb">Servicio</span></div>
      <div class="sline" id="l3"></div>
      <div class="sdot" id="d4"><span id="dn4">4</span><span class="sdot-lb">Método</span></div>
      <div class="sline" id="l4"></div>
      <div class="sdot" id="d5"><span id="dn5">5</span><span class="sdot-lb">Parámetros</span></div>
    </div>
  </div>
  <div class="wiz-bd">
    <div class="panel active" id="p1">
      <div class="ptitle">¿Qué versión de Bantotal vas a usar?</div>
      <div class="psub">V3 se conecta a SQL Server · V4 se conecta a Oracle</div>
      <div class="cards">
        <div class="ccard" onclick="pick('version','V3',this)"><span class="ccard-title">V3</span><span class="ccard-desc">SQL Server</span></div>
        <div class="ccard" onclick="pick('version','V4',this)"><span class="ccard-title">V4</span><span class="ccard-desc">Oracle</span></div>
      </div>
    </div>
    <div class="panel" id="p2">
      <div class="ptitle">Datos de conexión a la base de datos</div>
      <div class="psub">Ingresá las credenciales del ambiente al que querés conectarte.</div>
      <div id="sql-fields">
        <div class="frow">
          <div class="field"><label>Servidor</label><input type="text" id="db-server" placeholder="ej: 192.168.1.10"></div>
          <div class="field"><label>Puerto</label><input type="text" id="db-port" value="1433"></div>
        </div>
        <div class="field"><label>Nombre de la base de datos</label><input type="text" id="db-name" placeholder="ej: ProductoGx16"></div>
        <div class="frow">
          <div class="field"><label>Usuario</label><input type="text" id="db-user-s" autocomplete="username"></div>
          <div class="field"><label>Contraseña</label><div class="pw"><input type="password" id="db-pass-s" autocomplete="current-password"><button class="pw-btn" onclick="togglePw('db-pass-s',this)">&#128065;</button></div></div>
        </div>
      </div>
      <div id="ora-fields" style="display:none">
        <div class="frow">
          <div class="field"><label>Usuario</label><input type="text" id="db-user-o" autocomplete="username"></div>
          <div class="field"><label>Contraseña</label><div class="pw"><input type="password" id="db-pass-o" autocomplete="current-password"><button class="pw-btn" onclick="togglePw('db-pass-o',this)">&#128065;</button></div></div>
        </div>
        <div class="field"><label>Connect String</label><input type="text" id="db-cs" placeholder="ej: 10.0.0.4:1521/btv4db"><div class="hint">Formato: host:puerto/nombre-servicio</div></div>
      </div>
      <div class="cres" id="conn-res"></div>
    </div>
    <div class="panel" id="p3">
      <div class="ptitle">¿De qué servicios querés generar scripts?</div>
      <div class="psub">Agregá uno o más servicios y seleccioná los métodos de cada uno.</div>
      <div id="svc-loading" style="display:none;font-size:12px;color:var(--muted);margin-bottom:14px;align-items:center;gap:6px"><span class="spin dk"></span>&nbsp;Cargando servicios...</div>
      <div class="cres" id="svc-err"></div>
      <div style="display:flex;gap:8px;margin-bottom:16px;align-items:flex-end">
        <div class="field" style="flex:1;margin-bottom:0"><label>Servicio</label><select id="sel-service"><option value="">-- Seleccioná un servicio --</option></select></div>
        <button class="btn btn-primary" onclick="addServiceToList()" style="flex-shrink:0;padding:9px 16px">+ Agregar</button>
      </div>
      <div id="service-groups"></div>
      <div id="val-block-multi" style="display:none;margin-top:14px"></div>
    </div>
    <div class="panel" id="p4">
      <div class="ptitle">Datos del método</div>
      <div class="psub">Completá la información del método que vas a agregar.</div>
      <div class="field"><label>Descripción del método</label><input type="text" id="m-dsc" placeholder="ej: Simula un ahorro programado"></div>
      <div class="frow">
        <div class="field"><label>Programa GeneXus</label><input type="text" id="m-pgmnom" placeholder="ej: BTAhorroProgramado"></div>
        <div class="field"><label>Método del programa</label><select id="m-pgmmtd"><option value="execute">execute</option></select></div>
      </div>
      <div class="frow3">
        <div class="field"><label>Estado</label><select id="m-status"><option>Validado</option><option>Desarrollo</option><option>Cargado con errores</option><option>MockupUndefined</option><option>MockupDefined</option></select></div>
        <div class="field"><label>Habilita transacción</label><select id="m-enbtra"><option value="N">No (N)</option><option value="S">Sí (S)</option><option value="NULL">Sin valor (NULL)</option><option value=" ">Espacio</option></select></div>
        <div class="field"><label>Es programa GeneXus</label><select id="m-espggx"><option value="S">Sí (S)</option><option value=" ">No ( )</option></select></div>
      </div>
      <div class="frow">
        <div class="field"><label>NSBT</label><select id="m-nsbt"><option value=" ">Espacio ( )</option><option value="N">N</option></select></div>
        <div class="field"><label>FPath</label><select id="m-fpath"><option value="">Vacío</option><option value=" ">Espacio</option></select></div>
      </div>
    </div>
    <div class="panel" id="p5">
      <div class="ptitle">Parámetros del método</div>
      <div class="psub" id="p5-sub">Agregá los parámetros de entrada, salida y colecciones del método.</div>
      <div id="param-opts-loading" style="display:none;font-size:12px;color:var(--muted);margin-bottom:10px"><span class="spin dk"></span>&nbsp;Cargando opciones desde la base de datos...</div>
      <div class="param-wrap"><table class="param-table" id="param-table"><thead id="param-thead"></thead><tbody id="param-tbody"></tbody></table></div>
      <button class="add-btn" onclick="addRow()">+ Agregar parámetro</button>
      <div id="val-block-single" style="display:none;margin-top:14px"></div>
      <datalist id="dl-tipo"></datalist>
      <datalist id="dl-ittipo"></datalist>
      <datalist id="dl-itnom"></datalist>
      <datalist id="dl-valor"><option value=""></option><option value="0"></option><option value="1"></option><option value="true"></option><option value="false"></option></datalist>
    </div>
    <div class="panel" id="p6">
      <div class="ptitle" id="out-title">Script generado</div>
      <div class="psub" id="out-sub">Copiá el script y ejecutalo en la base de datos.</div>
      <div class="gen-btns">
        <button class="btn btn-outline btn-sm" onclick="generate('delete')">Solo DELETE</button>
        <button class="btn btn-outline btn-sm" onclick="generate('insert')">Solo INSERT</button>
        <button class="btn btn-primary btn-sm" onclick="generate('both')">DELETE + INSERT</button>
        <button class="btn btn-green btn-sm" onclick="copyScript()">Copiar</button>
        <button class="btn btn-ghost btn-sm" onclick="clearScript()">Limpiar</button>
      </div>
      <textarea class="sql-out" id="sql-out" readonly placeholder="Acá va a aparecer el script generado..."></textarea>
      <div class="cres" id="copy-res" style="margin-top:8px"></div>
    </div>
  </div>
  <div class="wiz-ft">
    <button class="btn btn-ghost" id="btn-back" onclick="goBack()" style="display:none">&#8592; Volver</button>
    <span></span>
    <div id="ft-r"><button class="btn btn-primary" id="btn-next" onclick="goNext()" disabled>Siguiente &#8594;</button></div>
  </div>
</div>
<script>
var S = { step: 1, version: null, platform: null, isMultiMethod: false, multiData: null };
var paramRows = [];
var paramOpts = { tipos: [], ittipos: [], itnoms: [] };
var paramOptsLoaded = false;
var serviceGroups = [];
var _connOk = false;
var _connTestTimer = null;

var _VE_RE = /\b(the|this|that|these|those|is|are|was|were|has|have|had|get|gets|set|sets|update|updates|create|creates|delete|deletes|return|returns|method|service|parameter|value|field|list|object|type|name|code|date|amount|flag|allow|allows|perform|performs|retrieve|retrieves)\b/i;
var _VL_TYPES = new Set(['long','int','double','byte','short','string']);

function validateItems(itemList) {
  var warns = [];
  (itemList || []).forEach(function(item) {
    var svc = (item.header && item.header.BTISrvNom) || '?';
    var mtd = (item.header && item.header.BTIMtdNom) || '?';
    var m   = (item.method && typeof item.method === 'object') ? item.method : {};
    var params = item.params || [];
    var dsc = (m.dsc || '').trim();
    if (!dsc) {
      warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'Descripción vacía.' });
    } else {
      if (!/^m[eé]todo para /i.test(dsc)) warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'No comienza con "Método para".' });
      if (!dsc.endsWith('.'))              warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'No termina con punto.' });
      if (_VE_RE.test(dsc))               warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'Podría estar en inglés.' });
    }
    params.forEach(function(p) {
      var pnom = p.nom || '?', tipo = (p.tipo || '').toLowerCase().trim();
      var pdsc = p.dsc !== undefined ? (p.dsc || '').trim() : undefined;
      if (pdsc !== undefined) {
        if (!pdsc) warns.push({ service: svc, method: mtd, field: 'BTISRVPARDSC', param: pnom, msg: 'Descripción vacía.' });
        else {
          if (!pdsc.endsWith('.')) warns.push({ service: svc, method: mtd, field: 'BTISRVPARDSC', param: pnom, msg: 'No termina con punto.' });
          if (_VE_RE.test(pdsc))   warns.push({ service: svc, method: mtd, field: 'BTISRVPARDSC', param: pnom, msg: 'Podría estar en inglés.' });
        }
      }
      if (_VL_TYPES.has(tipo) && parseInt(p.largo || '0') === 0) warns.push({ service: svc, method: mtd, field: 'BTISRVPARLARGO', param: pnom, msg: 'Largo es 0 para tipo ' + p.tipo + '.' });
      if (tipo === 'double' && parseInt(p.deci || '0') === 0)    warns.push({ service: svc, method: mtd, field: 'BTISRVPARDECI',  param: pnom, msg: 'Decimales son 0 para tipo double.' });
    });
  });
  return warns;
}

function renderWarnings(containerId, warnings) {
  var el = document.getElementById(containerId); if (!el) return;
  if (!warnings || !warnings.length) { el.innerHTML = ''; el.style.display = 'none'; return; }
  var n = warnings.length;
  var html = '<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px 16px">' +
    '<div style="font-weight:600;font-size:13px;color:#92400e;margin-bottom:10px">&#9888; ' + n + ' advertencia' + (n > 1 ? 's' : '') + ' encontrada' + (n > 1 ? 's' : '') + '. Corregila' + (n > 1 ? 's' : '') + ' antes de generar el script.</div>' +
    '<ul style="margin:0;padding-left:18px;font-size:12px;color:#78350f;line-height:1.9">';
  warnings.forEach(function(w) {
    var ctx = w.param ? w.method + ' › ' + w.param : w.method;
    html += '<li><code style="background:rgba(0,0,0,.06);padding:1px 5px;border-radius:3px;font-size:11px">' + w.field + '</code> ' +
      '<span style="color:#b45309;font-weight:500">[' + ctx + ']</span> ' + w.msg + '</li>';
  });
  html += '</ul></div>';
  el.innerHTML = html; el.style.display = '';
}

function pick(key, val, el) {
  S[key] = val;
  el.closest('.cards').querySelectorAll('.ccard').forEach(function(c) { c.classList.remove('sel'); });
  el.classList.add('sel');
  if (key === 'version') { S.platform = val === 'V3' ? 'sqlserver' : 'oracle'; tryLoadEnv(val); }
  checkStep1();
}

async function tryLoadEnv(version) {
  try {
    var r = await fetch('/sg/api/load-env', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ version: version }) });
    var d = await r.json();
    if (!d.ok) return;
    S._pendingEnv = d.env;
  } catch(ex) {}
}

function applyEnvToForm() {
  var e = S._pendingEnv;
  if (!e) return;
  if (S.platform === 'sqlserver') { setv('db-server',e.DB_SERVER); setv('db-port',e.DB_PORT||'1433'); setv('db-name',e.DB_DATABASE); setv('db-user-s',e.DB_USER); setv('db-pass-s',e.DB_PASSWORD); }
  else { setv('db-user-o',e.DB_USER); setv('db-pass-o',e.DB_PASSWORD); setv('db-cs',e.DB_CONNECT_STRING); }
  scheduleConnTest();
}

function setv(id, val) { var el = document.getElementById(id); if (el && val != null) el.value = val; }
function setSelectVal(id, val) {
  if (val == null) return;
  var el = document.getElementById(id); if (!el) return;
  for (var i = 0; i < el.options.length; i++) { if (el.options[i].value === val) { el.value = val; return; } }
  var trimmed = String(val).trim();
  for (var i = 0; i < el.options.length; i++) { if (el.options[i].value.trim() === trimmed) { el.value = el.options[i].value; return; } }
}

function checkStep1() { var nb = document.getElementById('btn-next'); if (nb) nb.disabled = !S.version; }

function dots(step) {
  [1,2,3,4,5].forEach(function(i) {
    var d = document.getElementById('d'+i); d.classList.remove('active','done');
    if (i < step) d.classList.add('done'); else if (i === step) d.classList.add('active');
    document.getElementById('dn'+i).innerHTML = i < step ? '&#10003;' : String(i);
    if (i < 5) document.getElementById('l'+i).classList.toggle('done', i < step);
  });
}

function foot(step) {
  var back = document.getElementById('btn-back'); back.style.display = step > 1 ? 'flex' : 'none';
  var ftr = document.getElementById('ft-r');
  if (step === 2) { ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()" disabled>Siguiente &#8594;</button>'; }
  else if (step === 3) { ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()" disabled>Siguiente &#8594;</button>'; }
  else if (step === 5) { ftr.innerHTML = '<button class="btn btn-primary" id="btn-gen" onclick="goToOutput()">Generar script &#8594;</button>'; }
  else if (step === 6) { ftr.innerHTML = '<button class="btn btn-ghost" onclick="resetAll()">&#8635; Nuevo script</button>'; }
  else { ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()">Siguiente &#8594;</button>'; }
}

function show(step) {
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('p'+step).classList.add('active');
  S.step = step; dots(step); foot(step);
  if (step === 2) { _connOk = false; document.getElementById('sql-fields').style.display = S.version === 'V3' ? 'block' : 'none'; document.getElementById('ora-fields').style.display = S.version === 'V4' ? 'block' : 'none'; applyEnvToForm(); setTimeout(setupStep2Watchers, 0); }
  if (step === 3) { if (document.getElementById('sel-service').options.length <= 1) loadServices(); updateStep3NextBtn(); }
  if (step === 4) { updateP4ForVersion(); applyMethodDetails(); }
  if (step === 5 && !paramOptsLoaded) loadParamOpts();
}

function goNext() {
  var s = S.step;
  if (s === 1 && !(S.version && S.platform)) return;
  if (s === 2 && !_connOk) return;
  if (s === 3) { var groups = serviceGroups.filter(function(g) { return g.selected.size > 0; }); if (!groups.length) { alert('Seleccioná al menos un método.'); return; } fetchAndShowOutputMultiService(groups); return; }
  if (s < 6) show(s + 1);
}

function goBack() { if (S.step === 6 && S.isMultiMethod) { show(3); return; } if (S.step > 1) show(S.step - 1); }
function togglePw(id, btn) { var inp = document.getElementById(id); inp.type = inp.type === 'password' ? 'text' : 'password'; btn.innerHTML = inp.type === 'password' ? '&#128065;' : '&#128584;'; }

function getDb() {
  if (S.platform === 'sqlserver') return { server: v('db-server'), port: v('db-port')||'1433', database: v('db-name'), user: v('db-user-s'), password: vp('db-pass-s') };
  return { user: v('db-user-o'), password: vp('db-pass-o'), connectString: v('db-cs') };
}

function v(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
function vp(id) { var e = document.getElementById(id); return e ? e.value : ''; }

function allConnFieldsFilled() {
  if (S.platform === 'sqlserver') return !!(v('db-server') && v('db-name') && v('db-user-s') && vp('db-pass-s'));
  return !!(v('db-user-o') && vp('db-pass-o') && v('db-cs'));
}

function setupStep2Watchers() {
  var ids = S.platform === 'sqlserver' ? ['db-server','db-port','db-name','db-user-s','db-pass-s'] : ['db-user-o','db-pass-o','db-cs'];
  ids.forEach(function(id) { var el = document.getElementById(id); if (!el) return; el.removeEventListener('input', scheduleConnTest); el.addEventListener('input', scheduleConnTest); });
  if (allConnFieldsFilled()) scheduleConnTest();
}

function scheduleConnTest() {
  var res = document.getElementById('conn-res'); if (res) res.className = 'cres';
  _connOk = false; updateStep2NextBtn(); if (!allConnFieldsFilled()) return;
  clearTimeout(_connTestTimer); _connTestTimer = setTimeout(runAutoConnTest, 700);
}

async function runAutoConnTest() {
  var res = document.getElementById('conn-res'); if (!res) return;
  res.className = 'cres show'; res.style.color = 'var(--muted)'; res.innerHTML = '<span class="spin dk"></span>&nbsp;Conectando...';
  try {
    var r = await fetch('/sg/api/test', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDb() }) });
    var d = await r.json(); res.style.color = ''; res.className = 'cres show ' + (d.ok ? 'ok' : 'err'); res.textContent = d.ok ? 'Conexión exitosa ✓' : d.message; _connOk = d.ok;
    if (d.ok) { serviceGroups = []; var svcGrps = document.getElementById('service-groups'); if (svcGrps) svcGrps.innerHTML = ''; var svcSel = document.getElementById('sel-service'); if (svcSel) svcSel.innerHTML = '<option value="">-- Seleccioná un servicio --</option>'; }
  } catch(e) { res.style.color = ''; res.className = 'cres show err'; res.textContent = 'No se pudo conectar con el servidor local'; _connOk = false; }
  updateStep2NextBtn();
}

function updateStep2NextBtn() { var btn = document.getElementById('btn-next'); if (btn) btn.disabled = !_connOk; }

async function loadServices() {
  var loading = document.getElementById('svc-loading'), err = document.getElementById('svc-err');
  err.className = 'cres'; loading.style.display = 'flex';
  try {
    var r = await fetch('/sg/api/services', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDb(), version: S.version }) });
    var d = await r.json(); if (!d.ok) throw new Error(d.message);
    var sel = document.getElementById('sel-service'); sel.innerHTML = '<option value="">-- Seleccioná un servicio --</option>';
    d.services.forEach(function(s) { var opt = document.createElement('option'); opt.value = s; opt.textContent = s; sel.appendChild(opt); });
    loading.style.display = 'none';
  } catch(e) { loading.style.display = 'none'; err.className = 'cres show err'; err.textContent = e.message; }
}

async function addServiceToList() {
  var svc = document.getElementById('sel-service').value; if (!svc) return;
  if (serviceGroups.find(function(g) { return g.name === svc; })) { var err = document.getElementById('svc-err'); err.className = 'cres show err'; err.textContent = 'Ese servicio ya fue agregado.'; setTimeout(function() { err.className = 'cres'; }, 2500); return; }
  document.getElementById('svc-err').className = 'cres';
  var container = document.getElementById('service-groups');
  var div = document.createElement('div'); div.className = 'svc-group';
  div.innerHTML = '<div class="svc-group-hd"><span class="svc-group-name">'+svc+'</span><span style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:5px"><span class="spin dk"></span> Cargando...</span></div>';
  container.appendChild(div);
  var db = getDb();
  var fetches = [
    fetch('/sg/api/methods', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: db, version: S.version, service: svc }) }),
    fetch('/sg/api/service-versions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: db, version: S.version, service: svc }) }),
  ];
  if (S.version === 'V3') fetches.push(fetch('/sg/api/bti004', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: db, service: svc }) }));
  try {
    var results = await Promise.all(fetches); var dm = await results[0].json(); var dv = await results[1].json(); var db4 = S.version === 'V3' ? await results[2].json() : null;
    if (!dm.ok) throw new Error(dm.message);
    var versions = (dv.ok && dv.versions && dv.versions.length) ? dv.versions : ['1'];
    var group = { name: svc, version: versions[0], versions: versions, methods: dm.methods, selected: new Set(), bti004: (db4 && db4.found) ? db4.data : null, el: div };
    serviceGroups.push(group); renderServiceGroup(div, group, serviceGroups.length - 1);
  } catch(e) { div.remove(); var err = document.getElementById('svc-err'); err.className = 'cres show err'; err.textContent = 'Error al cargar '+svc+': '+e.message; }
  updateStep3NextBtn();
}

function renderServiceGroup(el, group, idx) {
  el.innerHTML = '';
  var hd = document.createElement('div'); hd.className = 'svc-group-hd';
  var left = document.createElement('div'); left.style.cssText = 'display:flex;align-items:center;gap:10px';
  var nameSpan = document.createElement('span'); nameSpan.className = 'svc-group-name'; nameSpan.textContent = group.name; left.appendChild(nameSpan);
  if (group.versions.length === 1) { var verSpan = document.createElement('span'); verSpan.style.cssText = 'font-size:11px;color:var(--muted)'; verSpan.textContent = 'Ver. '+group.version; left.appendChild(verSpan); }
  else { var verSel = document.createElement('select'); verSel.className = 'pinput'; verSel.style.cssText = 'width:60px;font-size:11px'; group.versions.forEach(function(ver) { var opt = document.createElement('option'); opt.value = ver; opt.textContent = ver; if (ver === group.version) opt.selected = true; verSel.appendChild(opt); }); verSel.addEventListener('change', (function(i) { return function() { serviceGroups[i].version = this.value; }; })(idx)); left.appendChild(verSel); }
  var right = document.createElement('div'); right.style.cssText = 'display:flex;align-items:center;gap:8px';
  var allBtn = document.createElement('button'); allBtn.className = 'btn-pill sel'; allBtn.textContent = '✓ Todos'; allBtn.addEventListener('click', (function(i) { return function() { selectAllInGroup(i, true); }; })(idx));
  var noneBtn = document.createElement('button'); noneBtn.className = 'btn-pill'; noneBtn.textContent = '✗ Ninguno'; noneBtn.addEventListener('click', (function(i) { return function() { selectAllInGroup(i, false); }; })(idx));
  var rmBtn = document.createElement('button'); rmBtn.className = 'pin-rm'; rmBtn.style.fontSize = '18px'; rmBtn.textContent = '×'; rmBtn.addEventListener('click', (function(i) { return function() { removeServiceGroup(i); }; })(idx));
  right.appendChild(allBtn); right.appendChild(noneBtn); right.appendChild(rmBtn);
  hd.appendChild(left); hd.appendChild(right); el.appendChild(hd);
  var searchWrap = document.createElement('div'); searchWrap.className = 'svc-search-wrap';
  var searchInput = document.createElement('input'); searchInput.type = 'text'; searchInput.placeholder = 'Buscar método...'; searchInput.className = 'pinput'; searchInput.style.cssText = 'width:100%;font-size:12px';
  el.appendChild(searchWrap); searchWrap.appendChild(searchInput);
  var bd = document.createElement('div'); bd.className = 'svc-group-bd';
  searchInput.addEventListener('input', function() { var q = this.value.toLowerCase(); bd.querySelectorAll('.mtd-check-item').forEach(function(item) { var lbl = item.querySelector('.chk-label'); item.style.display = (!q || lbl.textContent.toLowerCase().indexOf(q) !== -1) ? '' : 'none'; }); });
  if (!group.methods.length) { var empty = document.createElement('div'); empty.style.cssText = 'padding:13px 16px;font-size:13px;color:var(--muted)'; empty.textContent = 'Sin métodos'; bd.appendChild(empty); }
  else { group.methods.forEach(function(method) { bd.appendChild(buildMethodCheckbox(group, idx, method)); }); }
  el.appendChild(bd);
}

function buildMethodCheckbox(group, idx, method) {
  var label = document.createElement('label'); label.className = 'mtd-check-item';
  var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = group.selected.has(method);
  cb.addEventListener('change', (function(i, m) { return function() { if (this.checked) serviceGroups[i].selected.add(m); else serviceGroups[i].selected.delete(m); updateStep3NextBtn(); }; })(idx, method));
  var box = document.createElement('span'); box.className = 'chk-box';
  var lbl = document.createElement('span'); lbl.className = 'chk-label'; lbl.textContent = method;
  label.appendChild(cb); label.appendChild(box); label.appendChild(lbl); return label;
}

function selectAllInGroup(idx, val) {
  var group = serviceGroups[idx]; if (val) { group.methods.forEach(function(m) { group.selected.add(m); }); } else { group.selected.clear(); }
  var bd = group.el.querySelector('.svc-group-bd'); bd.innerHTML = ''; group.methods.forEach(function(method) { bd.appendChild(buildMethodCheckbox(group, idx, method)); }); updateStep3NextBtn();
}

function removeServiceGroup(idx) {
  if (serviceGroups[idx].el) serviceGroups[idx].el.remove(); serviceGroups.splice(idx, 1);
  var container = document.getElementById('service-groups'); container.innerHTML = '';
  serviceGroups.forEach(function(g, i) { var div = document.createElement('div'); div.className = 'svc-group'; g.el = div; container.appendChild(div); renderServiceGroup(div, g, i); });
  updateStep3NextBtn();
}

function updateStep3NextBtn() { var hasSelected = serviceGroups.some(function(g) { return g.selected.size > 0; }); var btn = document.getElementById('btn-next'); if (btn) btn.disabled = !hasSelected; }

async function fetchAndShowOutputMultiService(groups) {
  var btn = document.getElementById('btn-next'); btn.innerHTML = '<span class="spin"></span>&nbsp;Cargando...'; btn.disabled = true;
  try {
    var allItems = [];
    await Promise.all(groups.map(async function(group) {
      var methods = Array.from(group.selected);
      var r = await fetch('/sg/api/methods-full', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: S.platform, db: getDb(), version: S.version, service: group.name, srvver: group.version, methods: methods }) });
      var d = await r.json(); if (!d.ok) throw new Error(d.message);
      d.items.forEach(function(item) { allItems.push(item); });
    }));
    var warnings = validateItems(allItems);
    var valEl = document.getElementById('val-block-multi');
    if (warnings.length) {
      renderWarnings('val-block-multi', warnings);
      btn.innerHTML = 'Siguiente &#8594;'; btn.disabled = false; updateStep3NextBtn();
      return;
    }
    if (valEl) { valEl.innerHTML = ''; valEl.style.display = 'none'; }
    S.isMultiMethod = true; S.multiData = allItems; show(6); doGenerateMulti('both');
  } catch(e) { alert('Error al cargar datos: ' + e.message); btn.innerHTML = 'Siguiente &#8594;'; btn.disabled = false; updateStep3NextBtn(); }
}

async function doGenerateMulti(mode) {
  var items = S.multiData; if (!items || !items.length) return;
  var svcs = items.reduce(function(acc, it) { if (acc.indexOf(it.header.BTISrvNom) < 0) acc.push(it.header.BTISrvNom); return acc; }, []);
  var names = items.map(function(it) { return it.header.BTIMtdNom; }).join(', ');
  document.getElementById('out-title').textContent = 'Scripts — ' + svcs.join(', ');
  document.getElementById('out-sub').textContent = items.length + ' método' + (items.length > 1 ? 's' : '') + ': ' + names;
  try {
    var r = await fetch('/sg/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: items, mode: mode }) });
    var d = await r.json(); document.getElementById('sql-out').value = d.script || '';
  } catch(e) { document.getElementById('sql-out').value = 'Error: ' + e.message; }
}

function generate(mode) { if (S.isMultiMethod) doGenerateMulti(mode); else doGenerate(mode); }

function applyMethodDetails() {
  var d = S.methodDetails; if (!d) return;
  setv('m-dsc', d.dsc); setv('m-pgmnom', d.pgmnom); setSelectVal('m-pgmmtd', d.pgmmtd); setSelectVal('m-status', d.status); setSelectVal('m-enbtra', d.enbtra); setSelectVal('m-espggx', d.espggx); setSelectVal('m-nsbt', d.nsbt); setSelectVal('m-fpath', d.fpath);
}

function updateP4ForVersion() {
  var enbtraEl = document.getElementById('m-enbtra');
  if (S.version === 'V4') { if (!enbtraEl.querySelector('option[value="NULL"]')) { var opt = document.createElement('option'); opt.value='NULL'; opt.textContent='Sin valor (NULL)'; enbtraEl.insertBefore(opt, enbtraEl.firstChild); } enbtraEl.value = 'NULL'; }
  else { enbtraEl.value = 'N'; }
}

async function loadParamOpts() {
  var loading = document.getElementById('param-opts-loading'); loading.style.display = 'flex'; loading.style.alignItems = 'center';
  try {
    var r = await fetch('/sg/api/param-options', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDb(), version: S.version }) });
    var d = await r.json();
    if (d.ok) { paramOpts = d.opts; populateDatalist('dl-tipo', d.opts.tipos); populateDatalist('dl-ittipo', d.opts.ittipos); populateDatalist('dl-itnom', d.opts.itnoms); paramOptsLoaded = true; }
  } catch(e) {}
  loading.style.display = 'none'; renderParamTable();
}

function populateDatalist(id, vals) { var dl = document.getElementById(id); dl.innerHTML = ''; vals.forEach(function(v) { var opt = document.createElement('option'); opt.value = v; dl.appendChild(opt); }); }

var PARAM_COLS_BASE = [
  { key:'nom',     label:'Nombre del parámetro', width:150, type:'datalist', list:'dl-nom',    def:'' },
  { key:'nomjava', label:'Nombre Java',           width:80,  type:'select',   opts:['param0','param1','param2','param3','param4','param5','param6','param7','param8','param9'], def:'param0' },
  { key:'dir',     label:'Dirección',             width:55,  type:'select',   opts:['I','O','S','H','B','R'], def:'I' },
  { key:'tipo',    label:'Tipo de dato',           width:140, type:'datalist', list:'dl-tipo',  def:'' },
  { key:'ittipo',  label:'Tipo de ítem',           width:140, type:'datalist', list:'dl-ittipo',def:'' },
  { key:'valor',   label:'Valor',                  width:80,  type:'datalist', list:'dl-valor', def:'' },
  { key:'cat',     label:'Cat.',                   width:50,  type:'select',   opts:['B','C','S',' '], def:'B' },
  { key:'catit',   label:'Cat. ítem',              width:60,  type:'select',   opts:['B','C','S',' '], def:'B' },
  { key:'sdtver',  label:'Ver. SDT',               width:65,  type:'select',   opts:['','1','2','3','4','5'], def:'' },
  { key:'largo',   label:'Largo',                  width:65,  type:'select',   opts:['0','8','10','16','20','32','36','50','100','200','255','500'], def:'0' },
  { key:'lval',    label:'Largo lista',            width:75,  type:'select',   opts:['','0'], def:'' },
  { key:'itnom',   label:'Nombre ítem',            width:130, type:'datalist', list:'dl-itnom', def:'' },
  { key:'deci',    label:'Decimales',              width:70,  type:'select',   opts:['0','2','4','6','8'], def:'0' },
];
var PARAM_COL_DSC = { key:'dsc', label:'Descripción', width:180, type:'text', def:'' };
function activeCols() { var cols = PARAM_COLS_BASE.slice(); if (S.version === 'V4') cols.push(PARAM_COL_DSC); return cols; }

function renderParamTable() {
  var cols = activeCols(), thead = document.getElementById('param-thead');
  var th = '<tr><th style="width:32px">#</th>';
  cols.forEach(function(c) { th += '<th style="min-width:'+c.width+'px">'+c.label+'</th>'; });
  thead.innerHTML = th + '<th></th></tr>';
  var tbody = document.getElementById('param-tbody'); tbody.innerHTML = '';
  paramRows.forEach(function(row, idx) { tbody.appendChild(buildRow(row, idx, cols)); });
}

function buildRow(row, idx, cols) {
  var tr = document.createElement('tr');
  var numTd = document.createElement('td'); numTd.textContent = String(idx + 1); tr.appendChild(numTd);
  cols.forEach(function(c) {
    var td = document.createElement('td'), el;
    if (c.type === 'select') { el = document.createElement('select'); el.className = 'pinput'; el.style.width = c.width+'px'; c.opts.forEach(function(o) { var opt = document.createElement('option'); opt.value = o; opt.textContent = o === '' ? '—' : o; el.appendChild(opt); }); el.value = row[c.key] != null ? row[c.key] : c.def; }
    else { el = document.createElement('input'); el.className = 'pinput'; el.style.width = c.width+'px'; if (c.list) el.setAttribute('list', c.list); el.value = row[c.key] != null ? row[c.key] : c.def; el.placeholder = c.key === 'nom' ? 'ej: clienteUId' : ''; }
    el.addEventListener('change', (function(i, k) { return function() { paramRows[i][k] = this.value; }; })(idx, c.key));
    el.addEventListener('input',  (function(i, k) { return function() { paramRows[i][k] = this.value; }; })(idx, c.key));
    td.appendChild(el); tr.appendChild(td);
  });
  var rmTd = document.createElement('td'), rmBtn = document.createElement('button');
  rmBtn.className = 'pin-rm'; rmBtn.innerHTML = '&#10005;'; rmBtn.addEventListener('click', (function(i) { return function() { paramRows.splice(i,1); renderParamTable(); }; })(idx));
  rmTd.appendChild(rmBtn); tr.appendChild(rmTd); return tr;
}

function addRow() {
  var idx = paramRows.length, row = { nomjava:'param'+idx, dir:'I', cat:'B', catit:'B', deci:'0', largo:'0', valor:'', sdtver:'', ittipo:'', lval:'', itnom:'', dsc:'', nom:'' };
  paramRows.push(row); var cols = activeCols(); var tbody = document.getElementById('param-tbody'); tbody.appendChild(buildRow(row, idx, cols));
  var numCells = tbody.querySelectorAll('tr td:first-child'); numCells.forEach(function(c, i) { c.textContent = String(i+1); });
}

function goToOutput() {
  if (!paramRows.length) { alert('Agregá al menos un parámetro antes de generar.'); return; }
  var svc = document.getElementById('sel-service') ? document.getElementById('sel-service').value : '';
  var mtd = v('inp-mtdnom-manual');
  var item = { header: { BTISrvNom: svc, BTIMtdNom: mtd }, method: { dsc: v('m-dsc') }, params: paramRows };
  var warnings = validateItems([item]);
  var valEl = document.getElementById('val-block-single');
  if (warnings.length) {
    renderWarnings('val-block-single', warnings);
    return;
  }
  if (valEl) { valEl.innerHTML = ''; valEl.style.display = 'none'; }
  show(6); doGenerate('both');
}

async function doGenerate(mode) {
  var svc = document.getElementById('sel-service').value, mtd = v('inp-mtdnom-manual');
  if (!svc || !mtd) { alert('Seleccioná un servicio y un método antes de generar.'); return; }
  var enbtraRaw = document.getElementById('m-enbtra').value;
  var data = { version: S.version, header: { BTINom:'BTSERVICES', BTISrvNom:svc, BTISrvVer:v('sel-srvver')||'1', BTIMtdNom:mtd, BTISrvDsc:v('inp-srvdsc'), BTISrvPgmName:v('inp-srvpgm') }, method: { dsc:v('m-dsc'), nsbt:document.getElementById('m-nsbt').value, pgmnom:v('m-pgmnom'), pgmmtd:document.getElementById('m-pgmmtd').value, status:document.getElementById('m-status').value, fpath:document.getElementById('m-fpath').value, enbtra:enbtraRaw, espggx:document.getElementById('m-espggx').value }, params: paramRows };
  document.getElementById('out-title').textContent = 'Script generado — ' + svc + ' / ' + mtd;
  document.getElementById('out-sub').textContent = (S.version === 'V3' ? 'SQL Server · BTI004 + ' : 'Oracle · ') + 'BTI014 + BTI019';
  try {
    var r = await fetch('/sg/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: data, mode: mode }) });
    var d = await r.json(); document.getElementById('sql-out').value = d.script || '';
  } catch(e) { document.getElementById('sql-out').value = 'Error: ' + e.message; }
}

function copyScript() {
  var ta = document.getElementById('sql-out'); if (!ta.value.trim()) return;
  navigator.clipboard.writeText(ta.value).then(function() { var res = document.getElementById('copy-res'); res.className = 'cres show ok'; res.textContent = 'Copiado al portapapeles ✓'; setTimeout(function() { res.className = 'cres'; }, 2000); }).catch(function() { ta.select(); document.execCommand('copy'); });
}

function clearScript() { document.getElementById('sql-out').value = ''; }

var _DM_MOON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
var _DM_SUN  = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';

function toggleDark() { var isDark = document.body.classList.toggle('dark'); var btn = document.getElementById('dm-btn'); if (btn) btn.innerHTML = isDark ? _DM_SUN : _DM_MOON; localStorage.setItem('dm', isDark ? '1' : ''); }

function resetAll() {
  paramRows = []; paramOptsLoaded = false; serviceGroups = [];
  document.getElementById('service-groups').innerHTML = '';
  document.getElementById('sel-service').innerHTML = '<option value="">-- Seleccioná un servicio --</option>';
  document.getElementById('sel-service').value = ''; document.getElementById('sql-out').value = ''; document.getElementById('m-dsc').value = ''; document.getElementById('m-pgmnom').value = '';
  show(1); S = { step: 1, version: S.version, platform: S.platform, isMultiMethod: false, multiData: null };
}

(function() { if (localStorage.getItem('dm') === '1') { document.body.classList.add('dark'); var btn = document.getElementById('dm-btn'); if (btn) btn.innerHTML = _DM_SUN; } })();
</script>
</body>
</html>`;

// -- server ------------------------------------------------

http.createServer(async (req, res) => {
  const json = (code, data) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
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
      const { version, api } = await readBody(req);
      const https = require('https');
      const authUrl = version === 'V3'
        ? `${api.API_AUTH_URL}?Execute`
        : `${api.API_BASE_URL}/servlet/com.dlya.bantotal.ardwsbt_Authenticate?Execute`;
      const body = JSON.stringify({
        Btinreq: { Canal: 'BTDIGITAL', Usuario: api.API_USER, Device: 'INSTALADOR', Requerimiento: '1', Token: '' },
        UserId: api.API_USER,
        UserPassword: api.API_PASSWORD
      });
      const parsed = new URL(authUrl);
      const mod = parsed.protocol === 'https:' ? require('https') : require('http');
      const raw = await new Promise((resolve, reject) => {
        const options = {
          hostname: parsed.hostname, port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
          path: parsed.pathname + parsed.search, method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
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
      json(200, { ok: true });
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
    const outputFile = service + '_workflow.json';
    try {
      await new Promise((resolve, reject) => {
        let out = '';
        const child = spawn('node', ['generar_workflow.js', service, outputFile], { cwd });
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
    const { version, items: genItems, ejecutar, paramValues, wfOverrides } = body;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    const send = (data) => { try { res.write('data: ' + JSON.stringify(data) + '\n\n'); } catch(e) {} };
    const cwd = path.join(ROOT, version);
    for (let i = 0; i < genItems.length; i++) {
      const item = genItems[i];
      send({ type: 'start', index: i });
      let args;
      if (ejecutar && item.method === '__all__') {
        const wfFile = item.service + '_workflow.json';
        const wfPath = path.join(cwd, wfFile);
        if (wfOverrides && wfOverrides[item.service]) {
          fs.writeFileSync(wfPath, JSON.stringify(wfOverrides[item.service], null, 2), 'utf8');
        }
        if (fs.existsSync(wfPath)) {
          args = ['generar_md.js', '--workflow', wfFile];
        } else {
          args = ['generar_md.js', item.service, '--ejecutar'];
        }
      } else {
        args = ['generar_md.js', item.service];
        if (item.method && item.method !== '__all__') args.push(item.method);
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
        child.on('close', code => { send({ type: 'result', index: i, code, output }); resolve(); });
        child.on('error', err => { send({ type: 'result', index: i, code: 1, output: err.message }); resolve(); });
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
            methods.forEach(function(m) {
              allWarnings = allWarnings.concat(sg_validateOne(m, service, details[m] || {}, params[m] || []));
            });
          }
          j(200, { ok: true, warnings: allWarnings });
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

  res.writeHead(404);
  res.end();

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
