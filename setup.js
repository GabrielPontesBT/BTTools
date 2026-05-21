'use strict';
const http = require('http');
const fs   = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3777;
const ROOT = __dirname;

// ── helpers ───────────────────────────────────────────────

function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', c => (s += c));
    req.on('end', () => { try { resolve(JSON.parse(s)); } catch (e) { reject(e); } });
  });
}

async function testSqlServer(db) {
  const mod = path.join(ROOT, 'V3', 'node_modules', 'mssql');
  if (!fs.existsSync(mod)) throw new Error('mssql no instalado — ejecutá npm install en V3/');
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
  if (!fs.existsSync(mod)) throw new Error('oracledb no instalado — ejecutá npm install en V4/');
  const oracledb = require(mod);
  const conn = await oracledb.getConnection({
    user: db.DB_USER,
    password: db.DB_PASSWORD,
    connectString: db.DB_CONNECT_STRING,
  });
  await conn.close();
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

// ── HTML ──────────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Generador MD — Configuracion</title>
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
.wizard{background:#fff;border-radius:var(--r);box-shadow:var(--shadow);width:100%;max-width:580px;overflow:hidden}

/* ── header ── */
.wiz-hd{background:var(--blue);padding:28px 32px 40px;color:#fff}
.wiz-hd h1{font-size:17px;font-weight:600;margin-bottom:24px;opacity:.95;letter-spacing:-.01em}
.steps-bar{display:flex;align-items:center}
.sdot{width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:rgba(255,255,255,.4);transition:all .3s;position:relative;flex-shrink:0;cursor:default}
.sdot.done{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.7);color:#fff}
.sdot.active{background:#fff;border-color:#fff;color:var(--blue)}
.sdot-lb{position:absolute;top:32px;left:50%;transform:translateX(-50%);font-size:10px;white-space:nowrap;color:rgba(255,255,255,.45);font-weight:400}
.sdot.active .sdot-lb,.sdot.done .sdot-lb{color:rgba(255,255,255,.85)}
.sline{flex:1;height:2px;background:rgba(255,255,255,.18);transition:background .3s}
.sline.done{background:rgba(255,255,255,.55)}

/* ── body ── */
.wiz-bd{padding:30px 32px;min-height:310px}
.panel{display:none;animation:fadeIn .2s ease}.panel.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.ptitle{font-size:15px;font-weight:600;margin-bottom:4px}
.psub{font-size:12px;color:var(--muted);margin-bottom:22px;line-height:1.5}

/* ── choice cards ── */
.cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px}
.ccard{border:2px solid var(--border);border-radius:10px;padding:20px 14px;cursor:pointer;text-align:center;background:#fff;transition:all .18s;position:relative;user-select:none}
.ccard:hover{border-color:var(--blue);background:var(--blue-l)}
.ccard.sel{border-color:var(--blue);background:var(--blue-l)}
.ccard-title{font-size:22px;font-weight:700;color:var(--blue);display:block;margin-bottom:5px}
.ccard-desc{font-size:11px;color:var(--muted);display:block;line-height:1.4}
.ccard-badge{position:absolute;top:-9px;right:10px;background:var(--blue);color:#fff;font-size:9px;font-weight:700;padding:2px 9px;border-radius:10px;letter-spacing:.04em;text-transform:uppercase}

/* ── form ── */
.field{margin-bottom:15px}
.field label{display:block;font-size:12px;font-weight:500;color:var(--text);margin-bottom:5px}
.field input{width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;color:var(--text);outline:none;transition:border-color .15s;background:#fff;font-family:inherit}
.field input:focus{border-color:var(--blue)}
.field .hint{font-size:11px;color:var(--muted);margin-top:4px}
.frow{display:grid;grid-template-columns:1fr 90px;gap:10px}
.pw{position:relative}
.pw input{padding-right:36px}
.pw-btn{position:absolute;right:9px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);font-size:14px;padding:2px;line-height:1}

/* ── connection result ── */
.cres{display:none;padding:10px 13px;border-radius:8px;font-size:12px;margin-bottom:14px;align-items:flex-start;gap:8px;line-height:1.5}
.cres.show{display:flex}
.cres.ok{background:var(--green-l);color:var(--green)}
.cres.err{background:var(--red-l);color:var(--red)}

/* ── footer ── */
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

/* ── spinner ── */
.spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:rot .65s linear infinite;flex-shrink:0}
.spin.dk{border-color:rgba(0,0,0,.1);border-top-color:var(--blue)}
@keyframes rot{to{transform:rotate(360deg)}}

/* ── success panel ── */
.ok-panel{text-align:center;padding:8px 0 4px}
.ok-icon{width:54px;height:54px;border-radius:50%;background:var(--green-l);display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 14px;color:var(--green)}
.ok-panel h2{font-size:18px;font-weight:600;color:var(--green);margin-bottom:6px}
.ok-panel .ok-sub{font-size:12px;color:var(--muted);margin-bottom:4px}
.ok-path{font-size:11px;color:var(--muted);margin-bottom:18px;font-family:Consolas,monospace;word-break:break-all}
.code-blk{background:#1E293B;color:#E2E8F0;border-radius:8px;padding:14px 16px;text-align:left;font-family:'Cascadia Code','Fira Code',Consolas,monospace;font-size:12px;line-height:1.8;margin-bottom:16px}
.code-blk .cmt{color:#64748B}
.code-blk .cmd{color:#7DD3FC}
.close-hint{font-size:11px;color:var(--muted)}
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
      <div class="sdot" id="d3"><span id="dn3">3</span><span class="sdot-lb">Base de datos</span></div>
      <div class="sline" id="l3"></div>
      <div class="sdot" id="d4"><span id="dn4">4</span><span class="sdot-lb">API</span></div>
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
          <label>URL de autenticacion (API_AUTH_URL) <span style="color:var(--muted);font-weight:400">— solo V3</span></label>
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

    <!-- Paso 5: Exito -->
    <div class="panel" id="p5">
      <div class="ok-panel">
        <div class="ok-icon">&#10003;</div>
        <h2>Configuracion guardada!</h2>
        <p class="ok-sub">Archivo creado en:</p>
        <p class="ok-path" id="ok-path"></p>
        <div class="code-blk" id="ok-cmds"></div>
        <p class="close-hint">Podes cerrar esta pestana. Para cambiar la configuracion, volvé a ejecutar <strong>node setup.js</strong>.</p>
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

function pick(key, val, el) {
  S[key] = val;
  el.closest('.cards').querySelectorAll('.ccard').forEach(function(c) { c.classList.remove('sel'); });
  el.classList.add('sel');
  var nb = document.getElementById('btn-next');
  if (nb) nb.disabled = false;
}

function dots(step) {
  [1, 2, 3, 4].forEach(function(i) {
    var d = document.getElementById('d' + i);
    d.classList.remove('active', 'done');
    if (i < step) d.classList.add('done');
    else if (i === step) d.classList.add('active');
    document.getElementById('dn' + i).innerHTML = i < step ? '&#10003;' : String(i);
    if (i < 4) document.getElementById('l' + i).classList.toggle('done', i < step);
  });
}

function foot(step) {
  var back = document.getElementById('btn-back');
  back.style.display = (step > 1 && step < 5) ? 'flex' : 'none';
  var ftr = document.getElementById('ft-r');
  if (step === 3) {
    ftr.innerHTML =
      '<button class="btn btn-outline" onclick="testConn()" id="btn-test">Probar conexion</button>' +
      '&nbsp;&nbsp;' +
      '<button class="btn btn-primary" id="btn-next" onclick="goNext()">Siguiente &#8594;</button>';
  } else if (step === 4) {
    ftr.innerHTML = '<button class="btn btn-success" id="btn-save" onclick="saveEnv()">Guardar y finalizar &#10003;</button>';
  } else if (step === 5) {
    ftr.innerHTML = '';
    back.style.display = 'none';
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
  if (s < 5) show(s + 1);
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
      document.getElementById('ok-path').textContent = d.path;
      document.getElementById('ok-cmds').innerHTML =
        '<span class="cmt"># Siguiente paso: generar documentacion</span>\n' +
        '<span class="cmd">cd ' + S.version + '</span>\n' +
        '<span class="cmd">node generar_md.js &lt;Servicio&gt; &lt;Metodo&gt;</span>';
      show(5);
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
</script>
</body>
</html>`;

// ── server ────────────────────────────────────────────────

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
  console.log('\n  Generador MD — Configuracion inicial');
  console.log('  → Abriendo ' + url + '\n');
  console.log('  Presiona Ctrl+C para cerrar\n');
  const cmd = process.platform === 'win32' ? 'start ' + url
            : process.platform === 'darwin' ? 'open ' + url
            : 'xdg-open ' + url;
  exec(cmd);
});
