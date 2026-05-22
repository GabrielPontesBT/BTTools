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
  return L.join('\n');
}

// -- HTML --------------------------------------------------

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Generador MD - Configuracion</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#1D4ED8;--blue-h:#1E40AF;--blue-l:#EFF6FF;
  --green:#059669;--green-l:#ECFDF5;
  --red:#DC2626;--red-l:#FEF2F2;
  --warn:#D97706;--warn-l:#FFFBEB;
  --text:#0F172A;--muted:#64748B;--border:#E2E8F0;--bg:#F1F5F9;
  --r:12px;--shadow:0 8px 40px rgba(0,0,0,.12)
}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;color:var(--text)}
.wizard{background:#fff;border-radius:var(--r);box-shadow:var(--shadow);width:100%;max-width:600px;overflow:hidden}

/* header */
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

/* body */
.wiz-bd{padding:30px 32px;min-height:310px}
.panel{display:none;animation:fadeIn .2s ease}.panel.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.ptitle{font-size:15px;font-weight:600;margin-bottom:4px}
.psub{font-size:12px;color:var(--muted);margin-bottom:22px;line-height:1.5}

/* choice cards */
.cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px}
.ccard{border:2px solid var(--border);border-radius:10px;padding:20px 14px;cursor:pointer;text-align:center;background:#fff;transition:all .18s;position:relative;user-select:none}
.ccard:hover{border-color:var(--blue);background:var(--blue-l)}
.ccard.sel{border-color:var(--blue);background:var(--blue-l)}
.ccard-title{font-size:22px;font-weight:700;color:var(--blue);display:block;margin-bottom:5px}
.ccard-desc{font-size:11px;color:var(--muted);display:block;line-height:1.4}
.ccard-badge{position:absolute;top:-9px;right:10px;background:var(--blue);color:#fff;font-size:9px;font-weight:700;padding:2px 9px;border-radius:10px;letter-spacing:.04em;text-transform:uppercase}

/* form */
.field{margin-bottom:15px}
.field label{display:block;font-size:12px;font-weight:500;color:var(--text);margin-bottom:5px}
.field input,.field select{width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;color:var(--text);outline:none;transition:border-color .15s;background:#fff;font-family:inherit}
.field input:focus,.field select:focus{border-color:var(--blue)}
.field select{cursor:pointer}
.field .hint{font-size:11px;color:var(--muted);margin-top:4px}
.frow{display:grid;grid-template-columns:1fr 90px;gap:10px}
.pw{position:relative}
.pw input{padding-right:36px}
.pw-btn{position:absolute;right:9px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);font-size:14px;padding:2px;line-height:1}

/* connection result */
.cres{display:none;padding:10px 13px;border-radius:8px;font-size:12px;margin-bottom:14px;align-items:flex-start;gap:8px;line-height:1.5}
.cres.show{display:flex}
.cres.ok{background:var(--green-l);color:var(--green)}
.cres.err{background:var(--red-l);color:var(--red)}

/* service picker */
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

/* footer */
.wiz-ft{display:flex;justify-content:space-between;align-items:center;padding:16px 32px;border-top:1px solid var(--border);background:#FAFAFA;min-height:64px}
.btn{padding:9px 18px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all .17s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;text-decoration:none}
.btn:disabled{opacity:.45;cursor:not-allowed;pointer-events:none}
.btn-ghost{background:none;color:var(--muted);border:1.5px solid var(--border)}
.btn-ghost:hover{border-color:#94A3B8;color:var(--text)}
.btn-primary{background:var(--blue);color:#fff}
.btn-primary:hover{background:var(--blue-h)}
.btn-outline{background:none;color:var(--blue);border:1.5px solid var(--blue)}
.btn-outline:hover{background:var(--blue-l)}
.btn-success{background:var(--green);color:#fff}
.btn-success:hover{background:#047857}

/* spinner */
.spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:rot .65s linear infinite;flex-shrink:0}
.spin.dk{border-color:rgba(0,0,0,.1);border-top-color:var(--blue)}
@keyframes rot{to{transform:rotate(360deg)}}

/* success panel */
.ok-panel{text-align:center;padding:8px 0 4px}
.ok-icon{width:54px;height:54px;border-radius:50%;background:var(--green-l);display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 14px;color:var(--green)}
.ok-panel h2{font-size:18px;font-weight:600;color:var(--green);margin-bottom:18px}
.close-hint{font-size:11px;color:var(--muted)}

/* gen log */
.gen-log{border:1.5px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:14px;text-align:left}
.gen-row{display:flex;align-items:center;gap:10px;padding:9px 13px;font-size:12px}
.gen-row+.gen-row{border-top:1px solid var(--border)}
.gen-ic{width:18px;flex-shrink:0;text-align:center;font-size:14px}
.gen-lbl{flex:1;color:var(--text)}
.gen-lbl strong{font-weight:600}
.gen-out{font-size:10px;color:var(--muted);margin-top:2px;font-family:Consolas,monospace;white-space:pre-wrap;word-break:break-all;display:none}
.gen-row.has-err .gen-out{display:block;color:var(--red)}

/* ejecutar toggle + param form */
.exec-toggle{text-align:left;margin-bottom:14px;padding:11px 13px;background:var(--warn-l);border-radius:8px;border:1.5px solid #F59E0B}
.exec-lbl{display:flex;align-items:center;gap:9px;cursor:pointer;font-size:13px;font-weight:500;color:var(--text)}
.exec-sub{font-size:11px;color:var(--muted);margin-top:4px;margin-left:26px;line-height:1.5}
.param-card{margin-bottom:10px;border:1.5px solid var(--border);border-radius:8px;overflow:hidden;text-align:left}
.param-card-hd{padding:8px 12px;background:#F8FAFC;border-bottom:1px solid var(--border);font-size:12px;font-weight:600}
.param-card-bd{padding:10px 12px}
.param-f{margin-bottom:8px}
.param-f label{display:block;font-size:11px;font-weight:500;margin-bottom:3px}
.param-f input{width:100%;padding:7px 10px;border:1.5px solid var(--border);border-radius:6px;font-size:12px;outline:none;font-family:inherit}
.param-f input:focus,.param-f textarea:focus{border-color:var(--blue)}
.param-f textarea{width:100%;padding:7px 10px;border:1.5px solid var(--border);border-radius:6px;font-size:11px;font-family:Consolas,monospace;resize:vertical;outline:none;line-height:1.4}

/* workflow drag-and-drop */
.wf-step{cursor:grab;user-select:none;transition:background .1s}
.wf-step:active{cursor:grabbing}
.wf-step.wf-dragging{opacity:.35}
.wf-step.wf-over{border-top:2px solid var(--blue) !important}
.wf-step-hd{display:flex;align-items:center;gap:8px;padding:7px 12px}
.wf-global-params{padding:10px 14px;background:var(--blue-l);border-bottom:1px solid #BFDBFE}
.wf-handle{color:var(--border);font-size:13px;flex-shrink:0;line-height:1}
</style>
</head>
<body>
<div class="wizard">

  <div class="wiz-hd">
    <h1>Generador de Documentacion Bantotal</h1>
    <div class="steps-bar">
      <div class="sdot active" id="d1"><span id="dn1">1</span><span class="sdot-lb">Version</span></div>
      <div class="sline" id="l1"></div>
      <div class="sdot" id="d2"><span id="dn2">2</span><span class="sdot-lb">Plataforma</span></div>
      <div class="sline" id="l2"></div>
      <div class="sdot" id="d3"><span id="dn3">3</span><span class="sdot-lb">BD</span></div>
      <div class="sline" id="l3"></div>
      <div class="sdot" id="d4"><span id="dn4">4</span><span class="sdot-lb">API</span></div>
      <div class="sline" id="l4"></div>
      <div class="sdot" id="d5"><span id="dn5">5</span><span class="sdot-lb">Servicios</span></div>
    </div>
  </div>

  <div class="wiz-bd">

    <!-- Paso 1: Version -->
    <div class="panel active" id="p1">
      <div class="ptitle">Que version de Bantotal vas a documentar?</div>
      <div class="psub">Podes volver a correr el setup en cualquier momento para configurar la otra version.</div>
      <div class="cards">
        <div class="ccard" onclick="pick('version','V3',this)">
          <span class="ccard-title">V3</span>
          <span class="ccard-desc">Bantotal Version 3</span>
        </div>
        <div class="ccard" onclick="pick('version','V4',this)">
          <span class="ccard-title">V4</span>
          <span class="ccard-desc">Bantotal Version 4</span>
        </div>
      </div>
    </div>

    <!-- Paso 2: Plataforma -->
    <div class="panel" id="p2">
      <div class="ptitle">Que motor de base de datos usa el ambiente?</div>
      <div class="psub">La plataforma puede variar segun el ambiente, independientemente de la version de Bantotal.</div>
      <div class="cards">
        <div class="ccard" onclick="pick('platform','sqlserver',this)">
          <span class="ccard-badge">JavaSQL</span>
          <span class="ccard-title" style="font-size:17px;margin-top:4px">SQL Server</span>
          <span class="ccard-desc">Microsoft SQL Server</span>
        </div>
        <div class="ccard" onclick="pick('platform','oracle',this)">
          <span class="ccard-title" style="font-size:17px">Oracle</span>
          <span class="ccard-desc">Oracle Database</span>
        </div>
      </div>
    </div>

    <!-- Paso 3: Datos BD -->
    <div class="panel" id="p3">
      <div class="ptitle">Datos de conexion a la base de datos</div>
      <div class="psub">Ingresa los datos del ambiente al que queres apuntar.</div>

      <div id="sql-fields">
        <div class="frow">
          <div class="field">
            <label>Servidor</label>
            <input type="text" id="db-server" placeholder="ej: 192.168.1.10">
          </div>
          <div class="field">
            <label>Puerto</label>
            <input type="text" id="db-port" value="1433" placeholder="1433">
          </div>
        </div>
        <div class="field">
          <label>Nombre de la base de datos</label>
          <input type="text" id="db-name" placeholder="ej: ProductoGx16">
        </div>
        <div class="field">
          <label>Usuario</label>
          <input type="text" id="db-user-s" placeholder="ej: usuario_bd" autocomplete="username">
        </div>
        <div class="field">
          <label>Contrasena</label>
          <div class="pw">
            <input type="password" id="db-pass-s" placeholder="Contrasena" autocomplete="current-password">
            <button class="pw-btn" onclick="togglePw('db-pass-s',this)">&#128065;</button>
          </div>
        </div>
      </div>

      <div id="ora-fields" style="display:none">
        <div class="field">
          <label>Usuario</label>
          <input type="text" id="db-user-o" placeholder="ej: btdesav23" autocomplete="username">
        </div>
        <div class="field">
          <label>Contrasena</label>
          <div class="pw">
            <input type="password" id="db-pass-o" placeholder="Contrasena" autocomplete="current-password">
            <button class="pw-btn" onclick="togglePw('db-pass-o',this)">&#128065;</button>
          </div>
        </div>
        <div class="field">
          <label>Connect String</label>
          <input type="text" id="db-cs" placeholder="ej: 10.0.0.4:1521/btv4db">
          <div class="hint">Formato: host:puerto/nombre-servicio</div>
        </div>
      </div>

      <div class="cres" id="cres"></div>
    </div>

    <!-- Paso 4: API -->
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
    </div>

    <!-- Paso 6: Exito -->
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
      </div>
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
var S = { step: 1, version: null, platform: null };
var items = [];
var loadedEnv = null;
var allServices = [];
var paramFields = {};
var workflowData = {};
var wfConfirmed = false;

async function tryLoadEnv(version) {
  loadedEnv = null;
  try {
    var r = await fetch('/api/load-env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: version })
    });
    var d = await r.json();
    if (!d.ok) return;
    loadedEnv = d.data;
    if (d.data.DB_CONNECT_STRING) S.platform = 'oracle';
    else if (d.data.DB_SERVER) S.platform = 'sqlserver';
  } catch(e) {}
}

function setVal(id, val) {
  var el = document.getElementById(id);
  if (el && val !== undefined && val !== null) el.value = val;
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
}

function fillApiFields() {
  if (!loadedEnv) return;
  setVal('a-base', loadedEnv.BASE_URL);
  setVal('a-api', loadedEnv.API_BASE_URL);
  setVal('a-auth', loadedEnv.API_AUTH_URL);
  setVal('a-user', loadedEnv.API_USER);
  setVal('a-pass', loadedEnv.API_PASSWORD);
}

function pick(key, val, el) {
  S[key] = val;
  el.closest('.cards').querySelectorAll('.ccard').forEach(function(c) { c.classList.remove('sel'); });
  el.classList.add('sel');
  var nb = document.getElementById('btn-next');
  if (nb) nb.disabled = false;
  if (key === 'version') tryLoadEnv(val);
}

function dots(step) {
  [1, 2, 3, 4, 5].forEach(function(i) {
    var d = document.getElementById('d' + i);
    d.classList.remove('active', 'done');
    if (i < step) d.classList.add('done');
    else if (i === step) d.classList.add('active');
    document.getElementById('dn' + i).innerHTML = i < step ? '&#10003;' : String(i);
    if (i < 5) document.getElementById('l' + i).classList.toggle('done', i < step);
  });
}

function foot(step) {
  var back = document.getElementById('btn-back');
  back.style.display = step > 1 ? 'flex' : 'none';
  var ftr = document.getElementById('ft-r');
  if (step === 3) {
    ftr.innerHTML =
      '<button class="btn btn-outline" onclick="testConn()" id="btn-test">Probar conexion</button>' +
      '&nbsp;&nbsp;' +
      '<button class="btn btn-primary" id="btn-next" onclick="goNext()">Siguiente &#8594;</button>';
  } else if (step === 4) {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()">Siguiente &#8594;</button>';
  } else if (step === 5) {
    ftr.innerHTML = '<button class="btn btn-success" id="btn-save" onclick="saveEnv()" disabled>Guardar y finalizar &#10003;</button>';
  } else if (step === 6) {
    ftr.innerHTML = '';
  } else {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()" disabled>Siguiente &#8594;</button>';
  }
}

function show(step) {
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('p' + step).classList.add('active');
  S.step = step;
  dots(step);
  foot(step);
  if (step === 2 && S.platform) {
    var cards = document.querySelectorAll('#p2 .ccard');
    cards.forEach(function(c) { c.classList.remove('sel'); });
    cards[S.platform === 'sqlserver' ? 0 : 1].classList.add('sel');
    var nb = document.getElementById('btn-next');
    if (nb) nb.disabled = false;
  }
  if (step === 3) fillDbFields();
  if (step === 4) fillApiFields();
  if (step === 5) { if (!allServices.length) loadServices(); else renderList(); }
}

function goNext() {
  var s = S.step;
  if (s === 1 && !S.version) return;
  if (s === 2) {
    if (!S.platform) return;
    document.getElementById('sql-fields').style.display = S.platform === 'sqlserver' ? 'block' : 'none';
    document.getElementById('ora-fields').style.display  = S.platform === 'oracle'    ? 'block' : 'none';
  }
  if (s === 3) {
    document.getElementById('a-auth-wrap').style.display = S.version === 'V3' ? 'block' : 'none';
  }
  if (s < 6) show(s + 1);
}

function goBack() {
  if (S.step > 1) show(S.step - 1);
}

function togglePw(id, btn) {
  var inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.innerHTML = inp.type === 'password' ? '&#128065;' : '&#128584;';
}

function v(id)  { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
function vp(id) { var el = document.getElementById(id); return el ? el.value : ''; }

function getDb() {
  if (S.platform === 'sqlserver') {
    return { DB_SERVER: v('db-server'), DB_PORT: v('db-port') || '1433',
             DB_DATABASE: v('db-name'), DB_USER: v('db-user-s'), DB_PASSWORD: vp('db-pass-s') };
  }
  return { DB_USER: v('db-user-o'), DB_PASSWORD: vp('db-pass-o'), DB_CONNECT_STRING: v('db-cs') };
}

function getApi() {
  return { BASE_URL: v('a-base'), API_BASE_URL: v('a-api'),
           API_AUTH_URL: v('a-auth'), API_USER: v('a-user'), API_PASSWORD: vp('a-pass') };
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
  renderList();
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
          var fp = S.version + '/' + item.service + '/' + item.method + '.md';
          lbl.insertAdjacentHTML('beforeend',
            '<br><a href="/files/' + encodeURIComponent(fp) + '" download' +
            ' style="font-size:10px;color:var(--blue);text-decoration:none">&#8595; Descargar .md</a>');
        } else {
          var folder = S.version + '/' + item.service;
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
      const results = (fileItems || []).map(function(item) {
        const relPath = version + '/' + item.service + '/' + item.method + '.md';
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
