// ── Estado compartido ────────────────────────────────────────
var S = { step: 1, version: null, platform: null, action: null };
var _connOk = false, _connTimer = null;
var loadedEnv = null;
(function keepAlive() {
  var es = new EventSource('/api/alive');
  es.onerror = function() { es.close(); setTimeout(keepAlive, 3000); };
})();
function buildConnectString() { var h = v('db-host'), p = v('db-port-o') || '1521', s = v('db-service'); return h + ':' + p + '/' + s; }
function parseConnectString(cs) { if (!cs) return { host: '', port: '1521', service: '' }; var c = cs.indexOf(':'), s = cs.indexOf('/'); if (c < 0 || s < 0) return { host: cs, port: '1521', service: '' }; return { host: cs.slice(0, c), port: cs.slice(c + 1, s), service: cs.slice(s + 1) }; }

// ── Estado flujo Doc ─────────────────────────────────────────
var items = [];
var allServices = [];
var paramFields = {};
var workflowData = {};
var docCacheKey = null;
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

var _FIELD_TABLE = {
  BTIMTDDSC:       'BTI014',
  BTISRVPARDSC:    'BTI019',
  BTISRVPARLARGO:  'BTI019',
  BTISRVPARDECI:   'BTI019',
  BTISDTELEMLARGO: 'BTI026',
  BTISDTELEMDSC:   'BTI026'
};

function renderWarnings(containerId, warnings) {
  var el = document.getElementById(containerId); if (!el) return;
  if (!warnings || !warnings.length) { el.innerHTML = ''; el.style.display = 'none'; return; }
  var n = warnings.length;
  var html = '<div style="background:var(--warn-l);border:1px solid var(--warn);border-radius:8px;padding:14px 16px">' +
    '<div style="font-weight:600;font-size:var(--fs-sm);color:var(--warn-d);margin-bottom:var(--sp-3)">&#9888; ' + n + ' advertencia' + (n > 1 ? 's' : '') + ' encontrada' + (n > 1 ? 's' : '') + '</div>' +
    '<ul style="margin:0;padding-left:18px;font-size:var(--fs-sm);color:var(--warn-d);line-height:1.9">';
  warnings.forEach(function(w) {
    var tabla = _FIELD_TABLE[w.field] || '?';
    var loc = w.service ? (w.service + ' &rsaquo; ' + w.method) : w.method;
    if (w.param) loc += ' &rsaquo; ' + w.param;
    html += '<li>' +
      '<span style="background:var(--warn-l);color:var(--warn-d);font-weight:600;font-size:var(--fs-sm);padding:1px 5px;border-radius:3px;margin-right:var(--sp-1)">' + tabla + '</span>' +
      '<code style="background:rgba(0,0,0,.06);padding:1px 5px;border-radius:3px;font-size:var(--fs-sm)">' + w.field + '</code> ' +
      '<span style="color:var(--warn-d);font-weight:500"> [' + loc + ']</span> ' + w.msg + '</li>';
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
  return { DB_USER: v('db-user-o'), DB_PASSWORD: vp('db-pass-o'), DB_CONNECT_STRING: buildConnectString() };
}

function getDbSG() {
  if (S.platform === 'sqlserver') return { server: v('db-server'), port: v('db-port')||'1433', database: v('db-name'), user: v('db-user-s'), password: vp('db-pass-s') };
  return { user: v('db-user-o'), password: vp('db-pass-o'), connectString: buildConnectString() };
}

function getApi() {
  return { BASE_URL: v('a-base'), API_BASE_URL: v('a-api'), API_AUTH_URL: v('a-auth'), API_USER: v('a-user'), API_PASSWORD: vp('a-pass'), API_CANAL: v('a-canal'), API_DEVICE: v('a-device'), API_REQUERIMIENTO: v('a-requerimiento'), DOC_ERRORES_MODELOS: v('doc-errores-modelos') };
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
  else { if (lb4) lb4.textContent = 'Servicios'; if (lb5) lb5.textContent = 'API'; }
}

function vizPos(step) {
  if (S.action === 'validate' || S.action === 'collections') {
    return step === 1 ? 1 : 2; // action→1, panel→2
  }
  return step; // doc/scripts: 1-5 direct (step 6 success has no active dot)
}

function dots(step) {
  var pos = vizPos(step);
  var isSingle = S.action === 'validate' || S.action === 'collections';

  // Para validate/collections: d2 = label, ocultar d3..d5; para otros: d2 = "Versión"
  var lb2 = document.getElementById('lb2');
  if (lb2) lb2.textContent = S.action === 'validate' ? 'Validar' : S.action === 'collections' ? 'Collections' : 'Versión';
  ['d3','d4','d5','l2','l3','l4'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = isSingle ? 'none' : '';
  });

  var maxDot = isSingle ? 2 : 5;
  [1,2,3,4,5].forEach(function(i) {
    var d = document.getElementById('d' + i);
    if (!d) return;
    d.classList.remove('active','done');
    if (i <= maxDot) {
      if (i < pos) d.classList.add('done');
      else if (i === pos) d.classList.add('active');
      document.getElementById('dn' + i).innerHTML = i < pos ? '&#10003;' : String(i);
    }
    if (i < 5) document.getElementById('l' + i).classList.toggle('done', i < pos);
  });
}

function panelId(step) {
  if (step === 1) return 'p3'; // acción
  if (step === 2) return 'p1'; // versión
  if (step === 3) return 'p2'; // conexión
  if (S.action === 'validate') return 'p4v';
  if (S.action === 'collections') return 'p4c';
  if (S.action === 'scripts') return step === 4 ? 'p4s' : 'p5s';
  if (S.action === 'doc') {
    if (step === 4) return 'p5'; // selección de servicios
    if (step === 5) return 'p4'; // ambiente + llamar a la API
    return 'p6'; // éxito
  }
  return 'p' + step;
}

function show(step) {
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  var pid = panelId(step);
  var panel = document.getElementById(pid);
  if (panel) panel.classList.add('active');
  S.step = step;
  dots(step);
  foot(step);
  if (step === 3) { // paso de conexión (ahora es el paso 3)
    document.getElementById('sql-fields').style.display = S.platform === 'sqlserver' ? 'block' : 'none';
    document.getElementById('ora-fields').style.display  = S.platform === 'oracle'    ? 'block' : 'none';
    clearDbFields();
    loadDbHistory();
    setTimeout(setupConnWatchers, 0);
  }
  if (step === 4 && S.action === 'validate') { loadValidateFolders(); }
  if (step === 4 && S.action === 'doc') { if (!allServices.length) loadServices(); else renderList(); }
  if (step === 5 && S.action === 'doc') {
    var isV4 = S.version === 'V4';
    document.getElementById('a-auth-wrap').style.display = isV4 ? 'none' : 'block';
    document.getElementById('a-api-wrap').style.display  = isV4 ? 'none' : 'block';
    var lbl = document.getElementById('a-base-label');
    if (lbl) lbl.innerHTML = isV4
      ? 'URL de la API <span style="color:var(--muted);font-weight:400;font-size:var(--fs-sm)">(ej: http://10.0.0.7:5101/api/publicapi)</span>'
      : 'URL publica <span style="color:var(--muted);font-weight:400;font-size:var(--fs-sm)">(para los ejemplos de la documentacion)</span>';
    fillApiFields();
  }
  if (step === 4 && S.action === 'scripts' && !sgServicesLoaded) sgLoadServices();
}

function foot(step) {
  var back = document.getElementById('btn-back');
  back.style.display = step > 1 ? 'flex' : 'none';
  var ftr = document.getElementById('ft-r');
  if (step === 1) { // acción
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (S.action ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 2) { // versión
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (S.version ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 3) { // conexión
    ftr.innerHTML = '<button class="btn btn-outline" id="btn-test" onclick="testConn()">Probar conexión</button>&nbsp;&nbsp;' +
      '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (_connOk ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 4 && (S.action === 'validate' || S.action === 'collections')) {
    ftr.innerHTML = '';
  } else if (step === 4 && S.action === 'scripts') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()" disabled>Generar script &#8594;</button>';
  } else if (step === 4 && S.action === 'doc') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (items.length ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 5 && S.action === 'doc') {
    ftr.innerHTML = '<button class="btn btn-success" id="btn-save" onclick="saveEnv()">Guardar y finalizar &#10003;</button>';
  } else if (step === 5 && S.action === 'scripts') {
    ftr.innerHTML = '<button class="btn btn-ghost" onclick="sgReset()">&#8635; Nuevo script</button>';
  } else if (step === 6) {
    ftr.innerHTML = '';
  } else {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()">Siguiente &#8594;</button>';
  }
}

async function goNext() {
  var s = S.step;
  if (s === 1 && !S.action) return;
  if (s === 1 && (S.action === 'validate' || S.action === 'collections')) { show(4); return; } // saltar versión y conexión
  if (s === 1) { show(2); return; }
  if (s === 2 && !S.version) return;
  if (s === 2) { show(3); return; }
  if (s === 3 && !_connOk) return;
  if (s === 3) { show(4); return; }
  if (s === 4 && S.action === 'scripts') {
    var grps = sgServiceGroups.filter(function(g) { return g.selected.size > 0; });
    if (!grps.length) { alert('Seleccioná al menos un método.'); return; }
    sgFetchAndShowOutput(grps);
    return;
  }
  if (s === 4 && S.action === 'doc') { await validateDocItems(); return; }
  if (s < 6) show(s + 1);
}

function goBack() {
  var s = S.step;
  if (s === 4 && (S.action === 'validate' || S.action === 'collections')) { show(1); return; } // saltar versión y conexión
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

function clearDbFields() {
  setVal('db-conn-name', '');
  setVal('db-server', ''); setVal('db-port', '1433'); setVal('db-name', '');
  setVal('db-user-s', ''); setVal('db-pass-s', '');
  setVal('db-host', ''); setVal('db-port-o', '1521'); setVal('db-service', '');
  setVal('db-user-o', ''); setVal('db-pass-o', '');
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
    var _cs = parseConnectString(loadedEnv.DB_CONNECT_STRING);
    setVal('db-host', _cs.host); setVal('db-port-o', _cs.port); setVal('db-service', _cs.service);
    setVal('db-user-o', loadedEnv.DB_USER);
    setVal('db-pass-o', loadedEnv.DB_PASSWORD);
  }
  scheduleConnTest();
}

var _lastAutoBase = '';
var _lastAutoAuth = '';

function _rtrim(s) { s = s || ''; return s.charAt(s.length - 1) === '/' ? s.slice(0, -1) : s; }

function onApiUrlInput() {
  var apiUrl = _rtrim((v('a-api') || '').trim());
  if (!apiUrl) { _setApiHints('', ''); return; }
  if (S.version === 'V3') {
    var curAuth = v('a-auth');
    var autoAuth = apiUrl + '/servlet/com.dlya.bantotal.ardwsbt_Authenticate_v1';
    if (!curAuth || curAuth === _lastAutoAuth) { setVal('a-auth', autoAuth); _lastAutoAuth = autoAuth; }
  }
  _setApiHints(apiUrl, v('a-base'));
}

function _setApiHints(apiUrl, baseUrl) {
  var hapi  = document.getElementById('a-api-hint');
  var hbase = document.getElementById('a-base-hint');
  var a = _rtrim(apiUrl  || '');
  var b = _rtrim(baseUrl || '');
  if (S.version === 'V4') {
    if (hapi) hapi.textContent = '';
    if (hbase) hbase.textContent = b
      ? 'Autenticacion: ' + b + '/Authenticate/v1/Execute  |  Servicios: ' + b + '/public/{Servicio}/v1/{Metodo}'
      : '';
  } else {
    if (hapi) hapi.textContent = a ? 'Ej de llamada: ' + a + '/servlet/com.dlya.bantotal.ardwsbt_{Servicio}?{Metodo}' : '';
    if (hbase) hbase.textContent = b
      ? 'Ej en docs: ' + b + '/btdeveloper/servlet/com.dlya.bantotal.odwsbt_{Servicio}_v1?{Metodo}'
      : '';
  }
}

function fillApiFields() {
  setVal('a-base', loadedEnv ? loadedEnv.BASE_URL : '');
  setVal('a-api',  loadedEnv ? loadedEnv.API_BASE_URL : '');
  setVal('a-auth', loadedEnv ? loadedEnv.API_AUTH_URL : '');
  setVal('a-user', loadedEnv ? loadedEnv.API_USER : '');
  setVal('a-pass', loadedEnv ? loadedEnv.API_PASSWORD : '');
  setVal('a-canal',        loadedEnv ? loadedEnv.API_CANAL        : '');
  setVal('a-device',       loadedEnv ? loadedEnv.API_DEVICE       : '');
  setVal('a-requerimiento',loadedEnv ? loadedEnv.API_REQUERIMIENTO : '');
  _lastAutoBase = (loadedEnv && loadedEnv.BASE_URL) ? loadedEnv.BASE_URL : '';
  _lastAutoAuth = (loadedEnv && loadedEnv.API_AUTH_URL) ? loadedEnv.API_AUTH_URL : '';
  if (loadedEnv && loadedEnv.DOC_ERRORES_MODELOS) {
    var cb = document.getElementById('cb-doc-errores');
    if (cb) { cb.checked = true; toggleDocErrores(); }
    setVal('doc-errores-modelos', loadedEnv.DOC_ERRORES_MODELOS);
  }
  _setApiHints(loadedEnv ? loadedEnv.API_BASE_URL : '', loadedEnv ? loadedEnv.BASE_URL : '');
}

function allConnFilled() {
  if (S.platform === 'sqlserver') return !!(v('db-server') && v('db-name') && v('db-user-s') && vp('db-pass-s'));
  return !!(v('db-host') && v('db-user-o') && vp('db-pass-o') && v('db-service'));
}

function setupConnWatchers() {
  var ids = S.platform === 'sqlserver' ? ['db-server','db-port','db-name','db-user-s','db-pass-s'] : ['db-host','db-port-o','db-user-o','db-pass-o','db-service'];
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
    var _cs2 = parseConnectString(entry.db.connectString || '');
    setVal('db-host', _cs2.host); setVal('db-port-o', _cs2.port); setVal('db-service', _cs2.service);
    setVal('db-user-o', entry.db.user || ''); setVal('db-pass-o', entry.db.password || '');
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
    : v('db-host') + ':' + (v('db-port-o')||'1521') + '/' + v('db-service') + ' (Oracle)';
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

async function saveConnName() {
  if (!allConnFilled()) { showConnNameRes('Completá los datos de conexión primero.', false); return; }
  var fb = document.getElementById('conn-name-res');
  if (fb) { fb.style.display = ''; fb.style.color = 'var(--muted)'; fb.textContent = 'Guardando...'; }
  await saveDbHistEntry();
  showConnNameRes('Nombre guardado.', true);
}

function showConnNameRes(msg, ok) {
  var fb = document.getElementById('conn-name-res');
  if (!fb) return;
  fb.style.display = '';
  fb.style.color = ok ? 'var(--success)' : 'var(--danger)';
  fb.textContent = msg;
  setTimeout(function() { if (fb) fb.style.display = 'none'; }, 2500);
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
  if (S.step === 3) { var btn = document.getElementById('btn-next'); if (btn) btn.disabled = !_connOk; }
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


async function loadServices() {
  var area = document.getElementById('svc-load-area');
  var err  = document.getElementById('svc-err');
  err.className = 'cres';
  area.innerHTML = '<div style="font-size:var(--fs-sm);color:var(--muted);padding:4px 0"><span class="spin dk"></span>&nbsp;Cargando servicios...</div>';
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
  var btn = document.getElementById('btn-next');
  if (btn) btn.disabled = false;
}

function removeItem(idx) {
  items.splice(idx, 1);
  renderList();
  if (items.length === 0) {
    var btn = document.getElementById('btn-next');
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
      ? '<div id="svc-badge-' + i + '" style="font-size:var(--fs-sm);margin-top:var(--sp-1)"><span class="spin dk"></span></div>'
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
        badgeEl.innerHTML = '<span style="color:var(--green);font-weight:500">&#10003; Generado</span> <span style="color:var(--muted)">' + fmt + '</span>';
      } else {
        badgeEl.innerHTML = '<span style="color:var(--muted)">&#9679; No generado aun</span>';
      }
    });
  } catch(e) {}
}

async function validateDocItems() {
  var btn = document.getElementById('btn-next');
  var valEl = document.getElementById('doc-val-block');
  if (valEl) { valEl.innerHTML = ''; valEl.style.display = 'none'; }

  var docItems = items.filter(function(it) { return it.method; }).map(function(it) { return { service: it.service, method: it.method }; });
  if (!docItems.length) { show(5); return; }

  btn.innerHTML = '<span class="spin"></span>&nbsp;Validando...';
  btn.disabled = true;
  try {
    var rv = await fetch('/sg/api/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, items: docItems }) });
    var dv = await rv.json();
    docCacheKey = dv.cacheKey || null;
    if (dv.ok && dv.warnings && dv.warnings.length) {
      renderWarnings('doc-val-block', dv.warnings);
      btn.innerHTML = 'Siguiente &#8594;';
      btn.disabled = false;
      return;
    }
    if (!dv.ok) {
      if (valEl) { valEl.innerHTML = '<div style="background:var(--warn-l);border:1px solid var(--warn);border-radius:8px;padding:12px 16px;font-size:var(--fs-sm);color:var(--warn-d)">&#9888; No se pudo validar: ' + (dv.message || 'error desconocido') + '</div>'; valEl.style.display = ''; }
      btn.innerHTML = 'Siguiente &#8594;';
      btn.disabled = false;
      return;
    }
  } catch(e) {
    if (valEl) { valEl.innerHTML = '<div style="background:var(--warn-l);border:1px solid var(--warn);border-radius:8px;padding:12px 16px;font-size:var(--fs-sm);color:var(--warn-d)">&#9888; Error al validar: ' + e.message + '</div>'; valEl.style.display = ''; }
    btn.innerHTML = 'Siguiente &#8594;';
    btn.disabled = false;
    return;
  }

  btn.innerHTML = 'Siguiente &#8594;';
  btn.disabled = false;
  show(5);
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
  html += '<span style="font-size:var(--fs-sm);font-weight:400;color:var(--muted)">Arrastra para reordenar</span>';
  html += '</div>';

  // Global params block (only shown after confirming order)
  if (globalParams.length) {
    html += '<div class="wf-global-params" ondragstart="return false">';
    html += '<div style="font-size:var(--fs-sm);font-weight:600;color:var(--blue);margin-bottom:var(--sp-2)">Parametros de entrada del workflow:</div>';
    globalParams.forEach(function(p) {
      var fid = 'wfg-' + service + '-' + p.name;
      html += '<div style="display:flex;align-items:flex-start;gap:var(--sp-2);margin-bottom:var(--sp-2)">';
      html += '<label style="min-width:130px;font-size:var(--fs-sm);font-weight:500;flex-shrink:0;padding-top:5px">' + p.name;
      if (p.type) html += '<div style="font-size:var(--fs-sm);font-weight:400;color:var(--muted)">' + p.type + '</div>';
      html += '</label>';
      if (p.isComplex) {
        var lines = p.example ? Math.min(p.example.split('\\n').length, 12) : 3;
        var exVal = p.example ? p.example.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : (p.itemType ? '[]' : '{}');
        html += '<textarea id="' + fid + '" rows="' + lines + '" data-example="' + exVal + '" style="flex:1;padding:5px 8px;border:1.5px solid var(--border);border-radius:6px;font-size:var(--fs-sm);font-family:Consolas,monospace;resize:vertical;outline:none">' + exVal + '</textarea>';
      } else {
        html += '<input type="text" id="' + fid + '" placeholder="Ingresar valor..." style="flex:1;padding:5px 8px;border:1.5px solid var(--border);border-radius:6px;font-size:var(--fs-sm);font-family:inherit;outline:none">';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  html += '<div class="param-card-bd" style="padding:0" id="wf-bd-' + service + '">';
  if (!total) {
    html += '<p style="font-size:var(--fs-sm);color:var(--muted);padding:10px 12px">Sin metodos detectados.</p>';
  } else {
    steps.forEach(function(step, idx) {
      var extracts = (step.extract || []).map(function(e) { return typeof e === 'string' ? e : (e.as || ''); }).filter(Boolean);
      html += '<div class="wf-step" draggable="true" data-svc="' + service + '" data-idx="' + idx + '"' +
        ' ondragstart="wfDragStart(this)" ondragend="wfDragEnd(this)"' +
        ' ondragover="wfDragOver(event)" ondragenter="wfDragEnter(this)" ondragleave="wfDragLeave(this)" ondrop="wfDrop(event,this)"' +
        ' style="' + (idx > 0 ? 'border-top:1px solid var(--border)' : '') + '">';
      html += '<div class="wf-step-hd">';
      html += '<span class="wf-handle">&#9776;</span>';
      html += '<span style="font-size:var(--fs-sm);font-weight:700;color:var(--muted);min-width:18px;text-align:right">' + (idx + 1) + '</span>';
      html += '<div style="flex:1">';
      html += '<span style="font-size:var(--fs-sm);font-weight:600">' + step.method + '</span>';
      if (extracts.length) {
        html += '<div style="font-size:var(--fs-sm);color:var(--green);margin-top:var(--sp-1)">Extrae: ' + extracts.join(', ') + '</div>';
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
    html += '<button class="btn btn-outline" id="btn-confirm-wf" onclick="confirmWorkflowOrder()" style="margin-top:var(--sp-3);width:100%">Confirmar orden &#10003;</button>';
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
  var credsWrap = document.getElementById('api-creds-wrap');
  if (credsWrap) credsWrap.style.display = enabled ? 'block' : 'none';
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
    section.innerHTML = '<div style="padding:6px 0;font-size:var(--fs-sm);color:var(--muted)"><span class="spin dk"></span>&nbsp;Analizando dependencias...</div>';
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
          '<div class="param-card-bd" style="font-size:var(--fs-sm);color:var(--red)">Error: ' + wfE.message + '</div></div>';
      }
    }
    if (wfHtml) {
      wfHtml += '<button class="btn btn-outline" id="btn-confirm-wf" onclick="confirmWorkflowOrder()" style="margin-top:var(--sp-3);width:100%">Confirmar orden &#10003;</button>';
    }
    section.innerHTML = wfHtml || '<div style="padding:6px 0;font-size:var(--fs-sm);color:var(--muted)">No hay servicios para analizar.</div>';
    return;
  }

  // Modo parametros individuales
  section.innerHTML = '<div style="padding:6px 0;font-size:var(--fs-sm);color:var(--muted)"><span class="spin dk"></span>&nbsp;Cargando parametros...</div>';
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
          '<div class="param-card-bd" style="font-size:var(--fs-sm);color:var(--muted)">Sin parametros de entrada.</div></div>';
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
          html += '<textarea id="' + fid + '" rows="' + lines + '" data-example="' + exVal + '" style="width:100%;padding:7px 10px;border:1.5px solid var(--border);border-radius:6px;font-size:var(--fs-sm);font-family:Consolas,monospace;resize:vertical;outline:none">' + exVal + '</textarea>';
        } else {
          html += '<input type="text" id="' + fid + '" placeholder="' + (p.type || 'Varchar') + '">';
        }
        html += '</div>';
      });
      html += '</div></div>';
    } catch(ep) {
      html += '<div class="param-card"><div class="param-card-hd">' + item.service + ' / ' + item.method + '</div>' +
        '<div class="param-card-bd" style="font-size:var(--fs-sm);color:var(--red)">Error: ' + ep.message + '</div></div>';
    }
  }
  section.innerHTML = html || '<div style="padding:6px 0;font-size:var(--fs-sm);color:var(--muted)">No hay parametros de entrada para los servicios seleccionados.</div>';
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
      body: JSON.stringify({ version: S.version, items: items, ejecutar: ejecutar, paramValues: paramValues, wfOverrides: wfOverrides, cacheKey: docCacheKey })
    });
    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    var buf = '';
    while (true) {
      var chunk = await reader.read();
      if (chunk.done) break;
      buf += decoder.decode(chunk.value, { stream: true });
      var parts = buf.split('\n\n');
      buf = parts.pop();
      parts.forEach(function(part) {
        if (!part.startsWith('data: ')) return;
        try { handleGenEvent(JSON.parse(part.slice(6))); } catch(e) {}
      });
    }
  } catch(e) {
    log.innerHTML += '<div style="padding:10px 13px;font-size:var(--fs-sm);color:var(--red)">Error: ' + e.message + '</div>';
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
  var credsWrap = document.getElementById('api-creds-wrap');
  if (credsWrap) credsWrap.style.display = 'none';
  var ps = document.getElementById('params-section');
  if (ps) { ps.style.display = 'none'; ps.innerHTML = ''; }
  var hint = document.getElementById('gen-hint');
  if (hint) hint.style.display = 'none';
  var btn = document.getElementById('btn-generate');
  if (btn) { btn.style.display = 'block'; btn.disabled = false; btn.innerHTML = 'Generar documentacion ahora'; }
  show(4);
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
            ' style="font-size:var(--fs-sm);color:var(--blue);text-decoration:none">&#8595; Descargar .md</a>');
        } else {
          var folder = S.version + '/' + toFolderName(item.service);
          lbl.insertAdjacentHTML('beforeend',
            '<br><button data-folder="' + folder + '" onclick="openFolder(this.dataset.folder)"' +
            ' style="background:none;border:none;cursor:pointer;font-size:var(--fs-sm);color:var(--blue);padding:0">&#128193; Abrir carpeta</button>');
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
  div.innerHTML = '<div class="sg-svc-group-hd"><span class="sg-svc-group-name">'+svc+'</span><span style="font-size:var(--fs-sm);color:var(--muted);display:flex;align-items:center;gap:var(--sp-2)"><span class="spin dk"></span> Cargando...</span></div>';
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
  var left = document.createElement('div'); left.style.cssText = 'display:flex;align-items:center;gap:var(--sp-3)';
  var nameSpan = document.createElement('span'); nameSpan.className = 'sg-svc-group-name'; nameSpan.textContent = group.name; left.appendChild(nameSpan);
  if (group.versions.length > 1) {
    var verSel = document.createElement('select'); verSel.className = 'pinput'; verSel.style.cssText = 'width:60px;font-size:var(--fs-sm)';
    group.versions.forEach(function(ver) { var opt = document.createElement('option'); opt.value = ver; opt.textContent = ver; if (ver === group.version) opt.selected = true; verSel.appendChild(opt); });
    verSel.addEventListener('change', (function(i) { return function() { sgServiceGroups[i].version = this.value; }; })(idx));
    left.appendChild(verSel);
  } else {
    var verSpan = document.createElement('span'); verSpan.style.cssText = 'font-size:var(--fs-sm);color:var(--muted)'; verSpan.textContent = 'Ver. '+group.version; left.appendChild(verSpan);
  }
  var right = document.createElement('div'); right.style.cssText = 'display:flex;align-items:center;gap:var(--sp-2)';
  var allBtn = document.createElement('button'); allBtn.className = 'btn-pill'; allBtn.textContent = '✓ Todos';
  allBtn.addEventListener('click', (function(i) { return function() { sgSelectAllInGroup(i, true); }; })(idx));
  var noneBtn = document.createElement('button'); noneBtn.className = 'btn-pill'; noneBtn.textContent = '✗ Ninguno';
  noneBtn.addEventListener('click', (function(i) { return function() { sgSelectAllInGroup(i, false); }; })(idx));
  var rmBtn = document.createElement('button'); rmBtn.className = 'pin-rm'; rmBtn.style.fontSize = '18px'; rmBtn.textContent = '×';
  rmBtn.addEventListener('click', (function(i) { return function() { sgRemoveServiceGroup(i); }; })(idx));
  right.appendChild(allBtn); right.appendChild(noneBtn); right.appendChild(rmBtn);
  hd.appendChild(left); hd.appendChild(right); el.appendChild(hd);
  var searchWrap = document.createElement('div'); searchWrap.className = 'sg-search-wrap';
  var searchInput = document.createElement('input'); searchInput.type = 'text'; searchInput.placeholder = 'Buscar método...'; searchInput.className = 'pinput'; searchInput.style.cssText = 'width:100%;font-size:var(--fs-sm)';
  searchWrap.appendChild(searchInput); el.appendChild(searchWrap);
  var bd = document.createElement('div'); bd.className = 'sg-svc-group-bd';
  searchInput.addEventListener('input', function() { var q = this.value.toLowerCase(); bd.querySelectorAll('.sg-mtd-item').forEach(function(item) { var lbl = item.querySelector('.sg-chk-lbl'); item.style.display = (!q || lbl.textContent.toLowerCase().indexOf(q) !== -1) ? '' : 'none'; }); });
  if (!group.methods.length) { var empty = document.createElement('div'); empty.style.cssText = 'padding:13px 16px;font-size:var(--fs-sm);color:var(--muted)'; empty.textContent = 'Sin métodos'; bd.appendChild(empty); }
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

// ── Validar Documentos ──────────────────────────────────────────────

var _VAL_HISTORY_KEY = 'val_path_history';

function loadValidateFolders() {
  var inp = document.getElementById('val-path');
  if (!inp) return;
  var last = _valGetHistory()[0];
  if (last && !inp.value) inp.value = last;
  onValPathInput();
}

function _valGetHistory() {
  try { return JSON.parse(localStorage.getItem(_VAL_HISTORY_KEY) || '[]'); } catch(e) { return []; }
}

function _valSavePath(p) {
  if (!p) return;
  var h = _valGetHistory().filter(function(x) { return x !== p; });
  h.unshift(p);
  localStorage.setItem(_VAL_HISTORY_KEY, JSON.stringify(h.slice(0, 8)));
}

function onValPathInput() {
  var inp = document.getElementById('val-path');
  var btn = document.getElementById('btn-run-validate');
  var hasPath = inp && inp.value.trim().length > 0;
  if (btn) btn.disabled = !hasPath;
}

// Renderiza la lista de archivos con checkboxes
function _valRenderResults(results, basePath) {
  var out = document.getElementById('val-output');
  if (!out) return;
  if (!results || results.length === 0) { out.style.display = 'none'; return; }

  var html = '';
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    var tieneErrores = r.problemas.length > 0;
    var tag = r.version === 'v4' ? '<span class="vf-tag">V4</span>' : (r.version === 'v3' ? '<span class="vf-tag" style="background:#dcfce7;color:#166534">V3</span>' : '');
    if (!tieneErrores) {
      html += '<div class="vf-item ok">✅ ' + _escHtml(r.relPath) + tag + '</div>';
    } else {
      var errHtml = r.problemas.map(function(p) { return '<div>' + _escHtml(p) + '</div>'; }).join('');
      html += '<div class="vf-item err" data-abs="' + _escHtml(r.absPath) + '">'
        + '<input type="checkbox" class="val-file-cb" value="' + _escHtml(r.absPath) + '" onchange="updateFixBar()">'
        + '<div style="flex:1;min-width:0">'
        + '<div class="vf-name" onclick="this.closest(\'.vf-item\').classList.toggle(\'expanded\')">'
        + '📄 ' + _escHtml(r.relPath) + tag
        + ' <span style="font-size:var(--fs-sm);color:var(--muted)">(' + r.problemas.length + ' problema' + (r.problemas.length > 1 ? 's' : '') + ') ▸</span>'
        + '</div>'
        + '<div class="vf-errors">' + errHtml + '</div>'
        + '</div></div>';
    }
  }
  out.innerHTML = html;
  out.style.display = 'block';
}

function _escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function updateFixBar() {
  var bar = document.getElementById('val-fix-bar');
  var btn = document.getElementById('btn-fix-selected');
  var cbs = document.querySelectorAll('.val-file-cb:checked');
  if (!bar || !btn) return;
  var n = cbs.length;
  btn.disabled = n === 0;
  btn.textContent = '⚙ Corregir seleccionados (' + n + ')';
  bar.style.display = 'flex';
}

function valSelectAll(checked) {
  document.querySelectorAll('.val-file-cb').forEach(function(cb) { cb.checked = checked; });
  updateFixBar();
}

async function runValidation() {
  var inp = document.getElementById('val-path');
  var folder = inp ? inp.value.trim() : '';
  if (!folder) return;
  _valSavePath(folder);
  var res = document.getElementById('val-res');
  var out = document.getElementById('val-output');
  var btn = document.getElementById('btn-run-validate');
  var bar = document.getElementById('val-fix-bar');
  var fixOut = document.getElementById('fix-output');
  var fixRes = document.getElementById('fix-res');

  if (res) { res.className = 'cres show'; res.textContent = 'Validando...'; }
  if (out) { out.style.display = 'none'; out.innerHTML = ''; }
  if (bar) bar.style.display = 'none';
  if (fixOut) { fixOut.style.display = 'none'; fixOut.textContent = ''; }
  if (fixRes) fixRes.className = 'cres';
  if (btn) btn.disabled = true;

  try {
    var r = await fetch('/api/validate-md', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ docPath: folder }) });
    var d = await r.json();
    if (res) res.className = 'cres';
    if (d.results) {
      _valRenderResults(d.results, folder);
      var hayErrores = d.results.some(function(r) { return r.problemas.length > 0; });
      if (hayErrores) {
        if (bar) bar.style.display = 'flex';
        updateFixBar();
      }
    } else if (d.output) {
      // fallback texto plano
      out.textContent = d.output;
      out.style.display = 'block';
    }
  } catch (e) {
    if (res) { res.className = 'cres show err'; res.textContent = 'Error: ' + e.message; }
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ── Diálogo de resolución de casing ──────────────────────────

var _casingResolve = null;

function showCasingDialog(conflicts) {
  return new Promise(function(resolve) {
    _casingResolve = resolve;
    var list = document.getElementById('casing-conflicts-list');
    if (!list) { resolve(null); return; }

    // Agrupar por archivo
    var byFile = {};
    conflicts.forEach(function(c) {
      if (!byFile[c.file]) byFile[c.file] = [];
      byFile[c.file].push(...c.conflictos);
    });

    list.innerHTML = Object.entries(byFile).map(function(_ref, fi) {
      var file = _ref[0], items = _ref[1];
      var shortName = file.replace(/\\/g, '/').split('/').pop();
      var rows = items.map(function(item, ii) {
        var key = 'c_' + fi + '_' + ii;
        var pathAttr = _escHtml(JSON.stringify(item.path || [item.sdtKey || item.sdt]));
        return '<div class="casing-item">' +
          '<div class="casing-item-label">Campo <code>' + _escHtml(item.campo) + '</code> del SDT <code>' + _escHtml(item.sdt) + '</code></div>' +
          '<div class="casing-opts">' +
            '<label class="casing-opt">' +
              '<input type="radio" name="' + key + '" value="doc" data-file="' + _escHtml(file) + '" data-sdt="' + _escHtml(item.sdt) + '" data-sdtkey="' + _escHtml(item.sdtKey||item.sdt) + '" data-path="' + pathAttr + '" data-campo="' + _escHtml(item.campo) + '" data-doc="' + _escHtml(item.enDoc) + '" data-ej="' + _escHtml(item.enEjemplo) + '">' +
              'Usar <code>' + _escHtml(item.enDoc) + '</code> (documentación) — se corrige el ejemplo' +
            '</label>' +
            '<label class="casing-opt">' +
              '<input type="radio" name="' + key + '" value="ejemplo" data-file="' + _escHtml(file) + '" data-sdt="' + _escHtml(item.sdt) + '" data-sdtkey="' + _escHtml(item.sdtKey||item.sdt) + '" data-path="' + pathAttr + '" data-campo="' + _escHtml(item.campo) + '" data-doc="' + _escHtml(item.enDoc) + '" data-ej="' + _escHtml(item.enEjemplo) + '">' +
              'Usar <code>' + _escHtml(item.enEjemplo) + '</code> (ejemplo) — se corrige la documentación' +
            '</label>' +
          '</div>' +
        '</div>';
      }).join('');
      return '<div class="casing-group"><div class="casing-group-hd">' + _escHtml(shortName) + '</div>' + rows + '</div>';
    }).join('');

    document.getElementById('casing-overlay').classList.add('show');
  });
}

function confirmCasingDialog() {
  // Recolectar elecciones
  var radios = document.querySelectorAll('#casing-conflicts-list input[type=radio]:checked');
  var byFile = {};
  radios.forEach(function(r) {
    var f = r.dataset.file;
    if (!byFile[f]) byFile[f] = [];
    var path = null;
    try { path = JSON.parse(r.dataset.path); } catch (e) { path = [r.dataset.sdtkey]; }
    byFile[f].push({ sdt: r.dataset.sdt, sdtKey: r.dataset.sdtkey, path: path, campo: r.dataset.campo, choice: r.value, enDoc: r.dataset.doc, enEjemplo: r.dataset.ej });
  });
  document.getElementById('casing-overlay').classList.remove('show');
  if (_casingResolve) { _casingResolve(byFile); _casingResolve = null; }
}

function cancelCasingDialog() {
  document.getElementById('casing-overlay').classList.remove('show');
  if (_casingResolve) { _casingResolve(null); _casingResolve = null; }
}

// ─────────────────────────────────────────────────────────────

async function fixSelected() {
  var cbs = document.querySelectorAll('.val-file-cb:checked');
  var files = Array.from(cbs).map(function(cb) { return cb.value; });
  if (files.length === 0) return;

  var btn = document.getElementById('btn-fix-selected');
  var fixOut = document.getElementById('fix-output');
  var fixRes = document.getElementById('fix-res');

  if (fixOut) { fixOut.style.display = 'none'; fixOut.textContent = ''; }
  if (btn) btn.disabled = true;

  try {
    // Paso 1: detectar conflictos de casing
    if (fixRes) { fixRes.className = 'cres show'; fixRes.textContent = 'Detectando conflictos de casing...'; }
    var dr = await fetch('/api/detect-casing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files: files }) });
    var dd = dr.ok ? await dr.json() : { conflicts: [] };

    if (dd.conflicts && dd.conflicts.length > 0) {
      // Paso 2: mostrar diálogo y esperar elecciones
      if (fixRes) { fixRes.className = 'cres'; }
      var choices = await showCasingDialog(dd.conflicts);

      if (choices && Object.keys(choices).length > 0) {
        // Paso 3: aplicar elecciones
        if (fixRes) { fixRes.className = 'cres show'; fixRes.textContent = 'Aplicando correcciones de casing...'; }
        var choicesList = Object.entries(choices).map(function(_ref) { return { file: _ref[0], decisions: _ref[1] }; });
        await fetch('/api/apply-casing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ choices: choicesList }) });
      }
    }

    // Paso 4: correcciones generales
    if (fixRes) { fixRes.className = 'cres show'; fixRes.textContent = 'Corrigiendo ' + files.length + ' archivo(s)...'; }
    var r = await fetch('/api/fix-md', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files: files }) });
    var d = await r.json();
    if (fixRes) fixRes.className = 'cres';
    if (fixOut && d.output) { fixOut.textContent = d.output; fixOut.style.display = 'block'; }
    await runValidation();
  } catch (e) {
    if (fixRes) { fixRes.className = 'cres show err'; fixRes.textContent = 'Error: ' + e.message; }
  } finally {
    if (btn) btn.disabled = false;
  }
}
