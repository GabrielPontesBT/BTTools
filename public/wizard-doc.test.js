// Gate tests del wizard (front-end). wizard-doc.js es un script de navegador
// sin module.exports, asi que se carga tal cual en un sandbox de vm con los
// globals minimos que usa al cargar (EventSource para el keepAlive). Se testea
// el archivo que realmente se sirve, sin duplicar la logica.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeMemoryStorage() {
  var store = {};
  return {
    getItem: function(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function(k, v) { store[k] = String(v); },
    removeItem: function(k) { delete store[k]; },
  };
}

function loadWizard() {
  const src = fs.readFileSync(path.join(__dirname, 'wizard-doc.js'), 'utf8');
  const sandbox = {
    EventSource: function() { this.close = function() {}; },
    setTimeout: function() {},
    clearTimeout: function() {},
    console: { log: function() {} },
    document: {
      getElementById: function() { return null; },
      querySelectorAll: function() { return []; },
      querySelector: function() { return null; },
      addEventListener: function() {}, // wizard-doc.js se auto-inicia con esto; no debe correr initWizard en los tests
    },
    fetch: function() { return Promise.reject(new Error('sin red en los tests')); },
    localStorage: makeMemoryStorage(),
    confirm: function() { return true; },
    alert: function() {},
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'wizard-doc.js' });
  return sandbox;
}

// Stub de elemento del DOM generico: sirve para las funciones que tocan
// varios ids/selectores a la vez (paneles, footer, watchers de conexion) sin
// tener que enumerar cada uno. Los tests que necesitan leer/ver un valor
// puntual (inputs de conexion, etc.) siguen pisando getElementById con su
// propio mock especifico.
function stubEl() {
  return {
    style: {},
    classList: { add: function() {}, remove: function() {}, contains: function() { return false; }, toggle: function() {} },
    textContent: '', innerHTML: '', value: '', disabled: false,
    querySelectorAll: function() { return []; },
    querySelector: function() { return stubEl(); },
    addEventListener: function() {}, removeEventListener: function() {},
  };
}

function makeDomStub() {
  return {
    getElementById: function() { return stubEl(); },
    querySelectorAll: function() { return []; },
    querySelector: function() { return stubEl(); },
    addEventListener: function() {},
  };
}

function item(overrides) {
  return Object.assign({
    header: { BTISrvNom: 'Guarantees', BTIMtdNom: 'associateGuaranteesToLoan' },
    method: { dsc: 'Associates guarantees to a loan' }, // sin punto, en ingles, sin "Metodo para"
    params: [
      { nom: 'companyId', dsc: '', tipo: 'int', largo: '0', deci: '0' },
      { nom: 'branchId', dsc: '', tipo: 'string', largo: '0' },
    ],
  }, overrides || {});
}

// Los arrays vienen del contexto del vm (otro realm), asi que se compara
// longitud/contenido y no deepEqual estricto (los prototipos no son los mismos).
test('validateItems con apiMode interna no valida descripcion/largo (eso es exclusivo de la API Publica)', () => {
  const { validateItems } = loadWizard();
  const withChannels = item({ channels: [{ chnname: 'REST', srvenab: 'S' }] });
  assert.equal(validateItems([withChannels], 'interna').length, 0);
});

// Sin ninguna fila en BTCBS012 el metodo no queda expuesto por ningun canal,
// aunque BTCBS014/019 esten completos: es un chequeo aparte del estandar de
// documentacion, y corre siempre (incluso en interna).
test('validateItems con apiMode interna advierte si el metodo no tiene ningun canal en BTCBS012', () => {
  const { validateItems } = loadWizard();
  const warns = validateItems([item()], 'interna'); // item() no trae channels
  assert.equal(warns.length, 1);
  assert.equal(warns[0].field, 'BSSRVENAB');
  assert.match(warns[0].msg, /BTCBS012/);
});

test('validateItems con apiMode interna no advierte cuando el metodo tiene al menos un canal', () => {
  const { validateItems } = loadWizard();
  const withChannels = item({ channels: [{ chnname: 'REST', srvenab: 'N' }] });
  assert.equal(validateItems([withChannels], 'interna').length, 0);
});

test('validateItems con apiMode publica sigue advirtiendo lo mismo que antes', () => {
  const { validateItems } = loadWizard();
  const warns = validateItems([item()], 'publica');
  const msgs = warns.map(w => w.field + ': ' + w.msg);
  assert.ok(warns.length > 0, 'la API Publica tiene que seguir validando');
  assert.ok(msgs.includes('BTIMTDDSC: No comienza con "Método para".'), msgs.join(' | '));
  assert.ok(msgs.includes('BTIMTDDSC: No termina con punto ni signo de pregunta.'), msgs.join(' | '));
  assert.ok(msgs.some(m => m === 'BTISRVPARDSC: Descripción vacía.'), msgs.join(' | '));
  assert.ok(msgs.some(m => m.startsWith('BTISRVPARLARGO: Largo es 0')), msgs.join(' | '));
});

test('validateItems sin apiMode (V3 / flujos viejos) valida como API Publica', () => {
  const { validateItems } = loadWizard();
  assert.ok(validateItems([item()], undefined).length > 0);
  assert.ok(validateItems([item()]).length > 0);
});

test('validateItems no advierte nada cuando la descripcion cumple el estandar', () => {
  const { validateItems } = loadWizard();
  const ok = item({
    method: { dsc: 'Método para asociar garantías a un préstamo.' },
    params: [{ nom: 'idEmpresa', dsc: 'Identificador de la empresa.', tipo: 'int', largo: '4', deci: '0' }],
    channels: [{ chnname: 'REST', srvenab: 'S' }],
  });
  assert.equal(validateItems([ok], 'publica').length, 0);
});

// Igual que con BTCBS012 en interna: sin ninguna fila en BTI012 el metodo no
// queda expuesto por ningun canal, aunque BTI014/019 esten completos.
test('validateItems con apiMode publica advierte si el metodo no tiene ningun canal en BTI012', () => {
  const { validateItems } = loadWizard();
  const ok = item({
    method: { dsc: 'Método para asociar garantías a un préstamo.' },
    params: [{ nom: 'idEmpresa', dsc: 'Identificador de la empresa.', tipo: 'int', largo: '4', deci: '0' }],
  }); // sin channels
  const warns = validateItems([ok], 'publica');
  assert.equal(warns.length, 1);
  assert.equal(warns[0].field, 'BTISRVHAB');
  assert.match(warns[0].msg, /BTI012/);
});

// El ambiente (version+conexion) ahora se elige una sola vez, antes de
// elegir herramienta: paso 1 = version/motor, paso 2 = conexion, paso 3 =
// accion (con el toggle de API si la herramienta lo requiere).
test('versionReady (paso 1) solo exige el motor cuando esa seccion esta visible', () => {
  const w = loadWizard();
  const visible = { 'engine-section': 'block' };
  w.document.getElementById = function(id) {
    if (visible[id] === undefined) return null;
    return { style: { display: visible[id] } };
  };
  w.S.version = null; w.S.engine = null;
  assert.equal(w.versionReady(), false, 'sin version no se puede avanzar');
  w.S.version = 'V4';
  assert.equal(w.versionReady(), false, 'motor visible sin elegir bloquea');
  w.S.engine = 'oracle';
  assert.equal(w.versionReady(), true);
  visible['engine-section'] = 'none';
  w.S.engine = null;
  assert.equal(w.versionReady(), true, 'motor oculto (V3) no bloquea');
});

test('connReady (paso 2) depende solo de la conexion probada', () => {
  const w = loadWizard();
  w._connOk = false;
  assert.equal(w.connReady(), false);
  w._connOk = true;
  assert.equal(w.connReady(), true);
});

test('actionReady (paso 3) exige accion elegida y, si la herramienta lo pide, el modo de API', () => {
  const w = loadWizard();
  const visible = { 'apimode-section': 'none' };
  w.document.getElementById = function(id) {
    if (visible[id] === undefined) return null;
    return { style: { display: visible[id] } };
  };
  w.S.action = null; w.S.apiMode = null;
  assert.equal(w.actionReady(), false, 'sin accion no se puede avanzar');

  w.S.action = 'doc';
  assert.equal(w.actionReady(), true, 'doc no muestra el toggle, no lo exige');

  w.S.action = 'sdtgen'; w.S.apiMode = null;
  visible['apimode-section'] = 'block';
  assert.equal(w.actionReady(), false, 'sdtgen necesita elegir API');

  w.S.apiMode = 'publica';
  assert.equal(w.actionReady(), true);

  w.S.apiMode = 'interna';
  assert.equal(w.actionReady(), true);
});

test('validateItems acepta descripcion de metodo o parametro terminada en signo de pregunta', () => {
  const { validateItems } = loadWizard();
  const it = item({
    method: { dsc: 'Método para saber si el cliente existe?' },
    params: [{ nom: 'id', dsc: '¿Es un cliente activo?', tipo: 'int', largo: '4' }],
  });
  const warns = validateItems([it], 'publica');
  assert.ok(!warns.some(function(w) { return /No termina con punto/.test(w.msg); }), JSON.stringify(warns));
});

test('validateItems sigue advirtiendo cuando la descripcion no termina ni en punto ni en signo de pregunta', () => {
  const { validateItems } = loadWizard();
  const it = item({ method: { dsc: 'Método para saber si el cliente existe' } });
  const warns = validateItems([it], 'publica');
  assert.ok(warns.some(function(w) { return w.field === 'BTIMTDDSC' && w.msg === 'No termina con punto ni signo de pregunta.'; }), JSON.stringify(warns));
});

// El toggle de API vive ahora en el paso de Accion (para cualquier
// herramienta de APIMODE_ACTIONS, no solo Generar SDT), via pick('apiMode',...).
test('pick("apiMode",...) setea S.apiMode y marca la tarjeta clickeada', () => {
  const w = loadWizard();
  var marked = [];
  var cardPublica = { classList: { add: function(c) { marked.push(['pub', 'add', c]); }, remove: function(c) { marked.push(['pub', 'rm', c]); } } };
  var cardInterna = { classList: { add: function(c) { marked.push(['int', 'add', c]); }, remove: function(c) { marked.push(['int', 'rm', c]); } } };
  var clicked = { closest: function() { return { querySelectorAll: function() { return [cardPublica, cardInterna]; } }; }, classList: cardInterna.classList };
  w.document.getElementById = function(id) { return id === 'btn-next' ? { disabled: true } : null; };
  w.S.step = 3;
  w.S.action = 'sdtgen'; // APIMODE_ACTIONS: la seccion aplica
  w.pick('apiMode', 'interna', clicked);
  assert.equal(w.S.apiMode, 'interna');
  assert.ok(marked.some(m => m[0] === 'int' && m[1] === 'add' && m[2] === 'sel'));
});

// sgInvalidateState/pgInvalidateState (llamadas por pick()) tocan elementos
// del DOM por id: con el mock generico (getElementById->null) no rompen nada,
// asi que no hace falta stubearlas aparte.

function sdtItem(elemOverrides) {
  return {
    nom: 'SdtDatosCliente',
    bti026: [Object.assign({ elemnom: 'nombre', elemtipo: 'C', elemlargo: '100', elemdsc: 'Nombre del cliente.' }, elemOverrides || {})],
  };
}

test('validateItems detecta descripcion vacia en un campo SDT', () => {
  const { validateItems } = loadWizard();
  const it = item({ sdts: [sdtItem({ elemdsc: '' })] });
  const warns = validateItems([it], 'publica');
  assert.ok(warns.some(function(w) { return w.field === 'BTISDTELEMDSC' && w.msg === 'Descripción vacía.'; }), JSON.stringify(warns));
});

test('validateItems acepta descripcion de campo SDT terminada en ? o en punto, advierte si no termina en ninguno', () => {
  const { validateItems } = loadWizard();
  const conPregunta = item({ sdts: [sdtItem({ elemdsc: '¿Incluye datos personales?' })] });
  const conPunto = item({ sdts: [sdtItem({ elemdsc: 'Incluye datos personales.' })] });
  const sinNinguno = item({ sdts: [sdtItem({ elemdsc: 'Incluye datos personales' })] });
  assert.equal(validateItems([conPregunta], 'publica').filter(function(w) { return w.field === 'BTISDTELEMDSC'; }).length, 0);
  assert.equal(validateItems([conPunto], 'publica').filter(function(w) { return w.field === 'BTISDTELEMDSC'; }).length, 0);
  assert.ok(validateItems([sinNinguno], 'publica').some(function(w) { return w.field === 'BTISDTELEMDSC' && /No termina con punto/.test(w.msg); }));
});

test('validateItems detecta largo 0 en campo SDT de tipo C/N/F', () => {
  const { validateItems } = loadWizard();
  const it = item({ sdts: [sdtItem({ elemtipo: 'C', elemlargo: '0' })] });
  const warns = validateItems([it], 'publica');
  assert.ok(warns.some(function(w) { return w.field === 'BTISDTELEMLARGO'; }), JSON.stringify(warns));
});

test('validateItems no advierte largo 0 en campo SDT de tipo distinto a C/N/F', () => {
  const { validateItems } = loadWizard();
  const it = item({ sdts: [sdtItem({ elemtipo: 'B', elemlargo: '0' })] });
  const warns = validateItems([it], 'publica');
  assert.equal(warns.filter(function(w) { return w.field === 'BTISDTELEMLARGO'; }).length, 0);
});

test('validateItems no duplica advertencias cuando el mismo SDT aparece en dos items', () => {
  const { validateItems } = loadWizard();
  const sdt = sdtItem({ elemdsc: '' });
  const it1 = item({ sdts: [sdt] });
  const it2 = item({ header: { BTISrvNom: 'Otro', BTIMtdNom: 'otroMetodo' }, sdts: [sdt] });
  const warns = validateItems([it1, it2], 'publica');
  assert.equal(warns.filter(function(w) { return w.field === 'BTISDTELEMDSC' && w.param === 'SdtDatosCliente.nombre'; }).length, 1);
});

test('validateItems con apiMode interna no valida SDT', () => {
  const { validateItems } = loadWizard();
  const it = item({ sdts: [sdtItem({ elemdsc: '' })], channels: [{ chnname: 'REST', srvenab: 'S' }] });
  assert.equal(validateItems([it], 'interna').length, 0);
});

// ── Config de API atada a la conexion (ver _apiFieldsSource/fillApiFields) ──
// Cada conexion guardada en el historial tiene su propia config de API por
// apiMode (publica/interna apuntan a Swagger/paginas distintas), asi que
// elegir una conexion tiene que autocompletar la que le corresponde a ESE
// ambiente puntual, no la config generica por version (loadedEnv, legado).

test('_apiFieldsSource prioriza la config de API de la conexion activa sobre el .env legado', () => {
  const w = loadWizard();
  w.S.apiMode = 'publica';
  w.loadedEnv = { BASE_URL: 'http://legado', API_USER: 'legado' };
  w._activeDbHistEntry = { api: { publica: { BASE_URL: 'http://nuevo', API_USER: 'nuevo' } } };
  const src = w._apiFieldsSource();
  assert.equal(src.BASE_URL, 'http://nuevo');
  assert.equal(src.API_USER, 'nuevo');
});

test('_apiFieldsSource cae al .env legado si la conexion activa no tiene nada guardado para ese apiMode', () => {
  const w = loadWizard();
  w.S.apiMode = 'interna';
  w.loadedEnv = { BASE_URL: 'http://legado' };
  w._activeDbHistEntry = { api: { publica: { BASE_URL: 'http://solo-publica' } } }; // sin 'interna'
  assert.equal(w._apiFieldsSource().BASE_URL, 'http://legado');
});

test('_apiFieldsSource distingue publica de interna dentro de la misma conexion', () => {
  const w = loadWizard();
  w._activeDbHistEntry = { api: { publica: { BASE_URL: 'http://pub' }, interna: { BASE_URL: 'http://int' } } };
  w.S.apiMode = 'publica';
  assert.equal(w._apiFieldsSource().BASE_URL, 'http://pub');
  w.S.apiMode = 'interna';
  assert.equal(w._apiFieldsSource().BASE_URL, 'http://int');
});

test('_apiFieldsSource devuelve objeto vacio si no hay conexion activa ni .env', () => {
  const w = loadWizard();
  w.S.apiMode = 'publica';
  w.loadedEnv = null;
  w._activeDbHistEntry = null;
  // El objeto viene del realm del vm (otro prototipo Object), asi que se
  // compara por claves y no con deepEqual estricto (ver nota al inicio del
  // archivo sobre arrays del vm).
  assert.equal(Object.keys(w._apiFieldsSource()).length, 0);
});

test('clearDbFields resetea la conexion activa', () => {
  const w = loadWizard();
  w._activeDbHistEntry = { id: 'x', api: {} };
  w.clearDbFields();
  assert.equal(w._activeDbHistEntry, null);
});

test('loadDbHistEntry marca la entrada elegida como conexion activa', () => {
  const w = loadWizard();
  w._dbHistory = [{ id: '1', label: 'Prod V4', platform: 'oracle', db: { connectString: 'h:1521/s', user: 'u', password: 'p' }, api: { publica: { BASE_URL: 'http://x' } } }];
  const fakeSel = { value: '1' };
  const fakeDel = { disabled: true };
  w.document.getElementById = function(id) {
    if (id === 'db-hist-sel') return fakeSel;
    if (id === 'db-hist-del') return fakeDel;
    return null;
  };
  w.loadDbHistEntry();
  assert.equal(w._activeDbHistEntry.id, '1');
  assert.equal(fakeDel.disabled, false);
});

test('loadDbHistEntry sin seleccion limpia la conexion activa', () => {
  const w = loadWizard();
  w._activeDbHistEntry = { id: 'previo' };
  const fakeSel = { value: '' };
  const fakeDel = { disabled: false };
  w.document.getElementById = function(id) {
    if (id === 'db-hist-sel') return fakeSel;
    if (id === 'db-hist-del') return fakeDel;
    return null;
  };
  w.loadDbHistEntry();
  assert.equal(w._activeDbHistEntry, null);
});

test('saveApiToActiveEntry no hace nada si no hay conexion activa', async () => {
  const w = loadWizard();
  w._activeDbHistEntry = null;
  let called = false;
  w.fetch = function() { called = true; return Promise.resolve({ json: function() { return Promise.resolve({ ok: true }); } }); };
  await w.saveApiToActiveEntry();
  assert.equal(called, false);
});

test('saveApiToActiveEntry manda la config actual atada al id de la conexion activa, separada por apiMode', async () => {
  const w = loadWizard();
  w._activeDbHistEntry = { id: '42', api: { interna: { BASE_URL: 'http://viejo-interna' } } };
  w.S.apiMode = 'publica';
  let sentBody = null;
  w.fetch = function(url, opts) { sentBody = JSON.parse(opts.body); return Promise.resolve({ json: function() { return Promise.resolve({ ok: true }); } }); };
  await w.saveApiToActiveEntry();
  assert.equal(sentBody.action, 'save-api');
  assert.equal(sentBody.id, '42');
  assert.equal(sentBody.apiMode, 'publica');
  assert.deepEqual(w._activeDbHistEntry.api.interna, { BASE_URL: 'http://viejo-interna' }); // no se pisa
  assert.ok(w._activeDbHistEntry.api.publica); // se agrego la config nueva
});

// ── Ambiente activo global (S.activeEnv) ──────────────────────────────────
// El ambiente se elige una sola vez (paso 1+2, antes de elegir herramienta) y
// se usa para TODAS las herramientas via getDb()/getDbSG(). Generar SDT es la
// unica excepcion: si el ambiente global no es V4/Oracle, usa una conexion
// aparte (S.sdtEnv) sin pisar el ambiente global salvo confirmacion explicita.

// Los objetos que devuelven getDb/getDbSG vienen del realm del vm (otro
// prototipo Object que el de este proceso), asi que deepEqual estricto los
// rechaza aunque el contenido sea identico (ver nota al inicio del archivo).
// Un roundtrip por JSON los normaliza a objetos planos de este realm.
function plain(o) { return JSON.parse(JSON.stringify(o)); }

test('getDb/getDbSG leen del ambiente activo (S.activeEnv), no del DOM', () => {
  const w = loadWizard();
  w.S.platform = 'oracle';
  w.S.activeEnv = { version: 'V4', platform: 'oracle', engine: 'oracle', connName: 'x', fields: { host: 'h1', port: '1521', service: 'svc', user: 'u1', password: 'p1' } };
  assert.deepEqual(plain(w.getDb()), { DB_USER: 'u1', DB_PASSWORD: 'p1', DB_CONNECT_STRING: 'h1:1521/svc' });
  assert.deepEqual(plain(w.getDbSG()), { user: 'u1', password: 'p1', connectString: 'h1:1521/svc' });
});

test('getDb/getDbSG con plataforma sqlserver arman el shape correcto desde S.activeEnv', () => {
  const w = loadWizard();
  w.S.platform = 'sqlserver';
  w.S.activeEnv = { version: 'V3', platform: 'sqlserver', engine: null, fields: { server: 'srv', port: '1433', database: 'db', user: 'u', password: 'p' } };
  assert.deepEqual(plain(w.getDb()), { DB_SERVER: 'srv', DB_PORT: '1433', DB_DATABASE: 'db', DB_USER: 'u', DB_PASSWORD: 'p' });
  assert.deepEqual(plain(w.getDbSG()), { server: 'srv', port: '1433', database: 'db', user: 'u', password: 'p' });
});

test('sin ambiente activo, getDb/getDbSG devuelven campos vacios en vez de romper', () => {
  const w = loadWizard();
  w.S.platform = 'sqlserver';
  w.S.activeEnv = null;
  assert.deepEqual(plain(w.getDb()), { DB_SERVER: '', DB_PORT: '1433', DB_DATABASE: '', DB_USER: '', DB_PASSWORD: '' });
});

test('getDb/getDbSG usan la conexion especifica de Generar SDT (S.sdtEnv) cuando esta activa, sin tocar S.activeEnv', () => {
  const w = loadWizard();
  w.S.platform = 'oracle';
  w.S.action = 'sdtgen';
  w.S.activeEnv = { version: 'V3', platform: 'sqlserver', fields: { server: 's', database: 'd', user: 'gu', password: 'gp' } };
  w.S.sdtEnv = { version: 'V4', platform: 'oracle', fields: { host: 'h2', port: '1521', service: 'svc2', user: 'u2', password: 'p2' } };
  assert.equal(w.getDbSG().connectString, 'h2:1521/svc2');
  assert.equal(w.getDbSG().user, 'u2');
  assert.equal(w.S.activeEnv.platform, 'sqlserver', 'la conexion de sdtgen no pisa el ambiente global');
});

test('getDb/getDbSG ignoran S.sdtEnv fuera de la herramienta Generar SDT', () => {
  const w = loadWizard();
  w.S.platform = 'oracle';
  w.S.action = 'scripts'; // no es sdtgen
  w.S.activeEnv = { version: 'V4', platform: 'oracle', fields: { host: 'global', port: '1521', service: 'g', user: 'gu', password: 'gp' } };
  w.S.sdtEnv = { version: 'V4', platform: 'oracle', fields: { host: 'restos-de-sdtgen', port: '1521', service: 'x', user: 'x', password: 'x' } };
  assert.equal(w.getDbSG().connectString, 'global:1521/g');
});

test('commitActiveEnv arma S.activeEnv desde el DOM, lo persiste en localStorage y actualiza el chip', () => {
  const w = loadWizard();
  w.S.version = 'V4'; w.S.platform = 'oracle'; w.S.engine = 'oracle';
  const values = { 'db-conn-name': 'Mi conexion', 'db-host': 'h', 'db-port-o': '1521', 'db-service': 'svc', 'db-user-o': 'u', 'db-pass-o': 'p' };
  var chip = stubEl();
  w.document.getElementById = function(id) {
    if (id === 'env-chip') return chip;
    if (id in values) return { value: values[id] };
    return null;
  };
  w.document.querySelector = function() { return null; };
  w.commitActiveEnv();
  assert.equal(w.S.activeEnv.connName, 'Mi conexion');
  assert.equal(w.S.activeEnv.fields.host, 'h');
  const saved = JSON.parse(w.localStorage.getItem('bt_active_environment'));
  assert.equal(saved.platform, 'oracle');
  assert.equal(saved.fields.service, 'svc');
  assert.equal(chip.style.display, 'flex', 'el chip del navbar se muestra al confirmar un ambiente');
});

test('openEnvSwitcher pide confirmacion si hay una herramienta en curso, y no reabre el paso de ambiente si se cancela', () => {
  const w = loadWizard();
  w.document = makeDomStub();
  w.S.action = 'scripts';
  w.confirm = function() { return false; };
  let shown = false;
  w.show = function() { shown = true; };
  w.openEnvSwitcher();
  assert.equal(shown, false, 'si el usuario cancela, no se reabre el paso de ambiente');
  assert.equal(w.S.action, 'scripts', 'tampoco se pierde la herramienta actual');
});

test('openEnvSwitcher precarga el DOM con el ambiente activo y reabre el paso de version', () => {
  const w = loadWizard();
  const values = {};
  w.document = makeDomStub();
  w.document.getElementById = function(id) {
    if (id === 'db-conn-name') return (values[id] = values[id] || { value: '' });
    if (/^db-/.test(id)) return (values[id] = values[id] || { value: '' });
    return stubEl();
  };
  w.S.action = 'doc';
  w.S.activeEnv = { version: 'V4', platform: 'oracle', engine: 'oracle', connName: 'Prod', fields: { host: 'h', port: '1521', service: 's', user: 'u', password: 'p' } };
  let shownStep = null;
  w.show = function(step) { shownStep = step; };
  w.openEnvSwitcher();
  assert.equal(w.S.action, null, 'se vuelve a elegir herramienta despues de confirmar el ambiente');
  assert.equal(values['db-host'].value, 'h', 'los campos de conexion se precargan con el ambiente activo');
  assert.equal(shownStep, 1, 'reabre el paso de Versión');
});

test('sdtgenEnterOrCapture reutiliza el ambiente activo si ya es V4/Oracle, sin pedir una conexion aparte', () => {
  const w = loadWizard();
  w.S.activeEnv = { version: 'V4', platform: 'oracle', engine: 'oracle', fields: { host: 'h', service: 's', user: 'u', password: 'p' } };
  w.S.sdtEnv = { version: 'V4', platform: 'oracle', fields: {} }; // residuo de una vuelta anterior, debe descartarse
  let shownStep = null;
  w.show = function(step) { shownStep = step; };
  w.sdtgenEnterOrCapture();
  assert.equal(w.S.sdtEnv, null, 'usa el ambiente global directo, no crea una conexion aparte');
  assert.equal(w.S.version, 'V4'); assert.equal(w.S.platform, 'oracle'); assert.equal(w.S.engine, 'oracle');
  assert.equal(shownStep, 4, 'entra directo al paso de elegir el SDT base');
});

test('sdtgenEnterOrCapture pide una conexion V4/Oracle aparte si el ambiente global no lo es, sin tocarlo', () => {
  const w = loadWizard();
  w.S.activeEnv = { version: 'V3', platform: 'sqlserver', engine: null, connName: 'Prod V3', fields: { server: 's', database: 'd', user: 'u', password: 'p' } };
  w.document = makeDomStub();
  w.fetch = function() { return Promise.reject(new Error('sin red')); };
  w.sdtgenEnterOrCapture();
  assert.equal(w.sdtEnvCaptureActive, true);
  assert.equal(w.S.version, 'V4'); assert.equal(w.S.platform, 'oracle'); assert.equal(w.S.engine, 'oracle');
  assert.equal(w.S.activeEnv.platform, 'sqlserver', 'el ambiente global no se toca todavia');
  assert.equal(w.S.activeEnv.connName, 'Prod V3');
});

test('sdtEnvCaptureNext promueve la conexion a ambiente global solo si el usuario confirma', () => {
  const w = loadWizard();
  const values = { 'db-conn-name': 'SDT temporal', 'db-host': 'h3', 'db-port-o': '1521', 'db-service': 'svc3', 'db-user-o': 'u3', 'db-pass-o': 'p3' };
  w.document = makeDomStub();
  w.document.getElementById = function(id) { return (id in values) ? { value: values[id] } : stubEl(); };
  w._connOk = true;
  w.confirm = function() { return true; };
  let shownStep = null;
  w.show = function(step) { shownStep = step; };
  w.sdtEnvCaptureNext();
  assert.equal(w.S.activeEnv.fields.host, 'h3', 'confirmado: la conexion de sdtgen pasa a ser el ambiente global');
  assert.equal(w.S.sdtEnv, null);
  assert.equal(w.sdtEnvCaptureActive, false);
  assert.equal(shownStep, 4);
});

test('sdtEnvCaptureNext no toca el ambiente global si el usuario no confirma la promocion', () => {
  const w = loadWizard();
  const values = { 'db-conn-name': '', 'db-host': 'h4', 'db-port-o': '1521', 'db-service': 'svc4', 'db-user-o': 'u4', 'db-pass-o': 'p4' };
  w.document = makeDomStub();
  w.document.getElementById = function(id) { return (id in values) ? { value: values[id] } : stubEl(); };
  w.S.activeEnv = { version: 'V3', platform: 'sqlserver', fields: { server: 'orig' } };
  w._connOk = true;
  w.confirm = function() { return false; };
  w.show = function() {};
  w.sdtEnvCaptureNext();
  assert.equal(w.S.activeEnv.platform, 'sqlserver', 'sin confirmar, el ambiente global no cambia');
  assert.equal(w.S.sdtEnv.fields.host, 'h4', 'la conexion queda disponible solo para esta sesion de Generar SDT');
});

test('sdtEnvCaptureNext no hace nada si la conexion todavia no fue probada con exito', () => {
  const w = loadWizard();
  w.document = makeDomStub();
  w._connOk = false;
  w.S.sdtEnv = null;
  let shown = false;
  w.show = function() { shown = true; };
  w.sdtEnvCaptureNext();
  assert.equal(w.S.sdtEnv, null);
  assert.equal(shown, false);
});
