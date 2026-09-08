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

// Regresion: el "Tipo" de un campo de SDT (BTI026/BTCBS026) vive en columnas
// distintas segun BTISDTELEMCAT. Categoria Basico (B) lo tiene en elemtipo
// (ej: "string", "boolean"); Categoria SDT (S) y Coleccion (C) lo dejan
// vacio y el nombre real esta en elemsdt (ej: "SdtsBTEGWEconomicGroup").
// Mostrar siempre field.elemtipo sin mirar elemcat dejaba el campo Tipo en
// blanco para todo lo que no fuera Basico (reportado por el usuario:
// Editar Parametria de SDT nunca mostraba el tipo).
test('sdtFieldTipoDisplay muestra elemtipo para campos Basicos', () => {
  const w = loadWizard();
  assert.equal(w.sdtFieldTipoDisplay({ elemcat: 'B', elemtipo: 'boolean', elemsdt: '' }), 'boolean');
});

test('sdtFieldTipoDisplay muestra elemsdt (no elemtipo) para campos de categoria SDT', () => {
  const w = loadWizard();
  assert.equal(w.sdtFieldTipoDisplay({ elemcat: 'S', elemtipo: '', elemsdt: 'SdtCliente' }), 'SdtCliente');
});

test('sdtFieldTipoDisplay muestra elemsdt (no elemtipo) para campos de categoria Coleccion', () => {
  const w = loadWizard();
  assert.equal(w.sdtFieldTipoDisplay({ elemcat: 'C', elemtipo: '', elemsdt: 'SdtsBTEGWEconomicGroup' }), 'SdtsBTEGWEconomicGroup');
});

test('sdtFieldTipoDisplay no rompe con campos sin elemcat/elemsdt (fallback a elemtipo)', () => {
  const w = loadWizard();
  assert.equal(w.sdtFieldTipoDisplay({ elemtipo: 'int' }), 'int');
  assert.equal(w.sdtFieldTipoDisplay({}), '');
});

// Editar Parametria -> editor de campos de SDT: para categoria S/C ahora se
// puede reapuntar el campo a otro SDT (antes era de solo lectura siempre).
// pgSdtFieldTipoHtml arma ese tramo del formulario; pgSdtFieldValidate exige
// elegir un SDT real del catalogo (mismo criterio que el editor de BTI019
// para su combo "SDT").
test('pgSdtFieldTipoHtml arma un input editable con datalist de SDTs para categoria S', () => {
  const w = loadWizard();
  const html = w.pgSdtFieldTipoHtml({ elemcat: 'S', elemsdt: 'SdtCliente' });
  assert.match(html, /pg-input-elemsdt/);
  assert.match(html, /list="pg-sdt-list"/);
  assert.match(html, /value="SdtCliente"/);
  assert.doesNotMatch(html, /disabled/);
});

test('pgSdtFieldTipoHtml arma un input editable con datalist de SDTs para categoria C (coleccion)', () => {
  const w = loadWizard();
  const html = w.pgSdtFieldTipoHtml({ elemcat: 'C', elemsdt: 'SdtsBTEGWEconomicGroup' });
  assert.match(html, /pg-input-elemsdt/);
  assert.match(html, /list="pg-sdt-list"/);
  assert.match(html, /value="SdtsBTEGWEconomicGroup"/);
});

test('pgSdtFieldTipoHtml sigue de solo lectura para categoria Basico', () => {
  const w = loadWizard();
  const html = w.pgSdtFieldTipoHtml({ elemcat: 'B', elemtipo: 'boolean' });
  assert.match(html, /disabled/);
  assert.match(html, /value="boolean"/);
  assert.doesNotMatch(html, /pg-input-elemsdt/);
});

test('pgSdtFieldValidate exige elegir un SDT (nombre + version del catalogo) para categoria S', () => {
  const w = loadWizard();
  w.pgSdtOptions = [{ nom: 'SdtCliente', version: '3' }];
  assert.equal(w.pgSdtFieldValidate({ elemnom: 'campo1', elemcat: 'S', elemsdt: '', sdtve: '', elemlargo: '0', elemdeci: '0' }), 'Elegí un SDT para este campo.');
  assert.equal(w.pgSdtFieldValidate({ elemnom: 'campo1', elemcat: 'S', elemsdt: 'SdtNoExiste', sdtve: '', elemlargo: '0', elemdeci: '0' }), 'Elegí un SDT para este campo.', 'un nombre que no matchea el catalogo no tiene version -> sigue invalido');
  assert.equal(w.pgSdtFieldValidate({ elemnom: 'campo1', elemcat: 'S', elemsdt: 'SdtCliente', sdtve: '3', elemlargo: '0', elemdeci: '0' }), null);
});

test('pgSdtFieldValidate exige elegir un SDT para categoria C (coleccion), no para Basico', () => {
  const w = loadWizard();
  assert.equal(w.pgSdtFieldValidate({ elemnom: 'campo1', elemcat: 'C', elemsdt: '', sdtve: '', elemlargo: '0', elemdeci: '0' }), 'Elegí un SDT para este campo.');
  assert.equal(w.pgSdtFieldValidate({ elemnom: 'campo1', elemcat: 'B', elemtipo: 'boolean', elemlargo: '0', elemdeci: '0' }), null, 'Basico no requiere elemsdt/sdtve');
});

// Regresion: reportado por el usuario como "a veces no me deja escribir,
// pero si me deja borrar" en el editor de parametros. Reproducido contra la
// pagina real: pgRenderEditor/pgRenderSdtEditor/sdtgenRenderEditor reconstruyen
// TODO el HTML de las tarjetas en cada render, asi que un input enfocado
// pierde el foco (document.activeElement pasa a <body>). Eso es invisible la
// mayoria de las veces, pero la sugerencia automatica por nombre (ver
// pgLookupSuggestion) puede resolver DESPUES del debounce mientras el
// usuario sigue escribiendo, disparando un re-render a mitad de tipear y
// dejando las teclas siguientes sin destino. withFocusPreserved envuelve
// esos renders para restaurar foco + cursor en el mismo campo logico
// (mismo class name especifico + mismo indice) despues de reconstruir el DOM.
//
// No hay jsdom en el proyecto (loadWizard corre wizard-doc.js en un sandbox
// de vm con un `document` minimo), asi que estos tests arman un DOM falso
// a mano: lo unico que withFocusPreserved necesita es document.activeElement
// (mutable, con foco real) y document.querySelectorAll filtrando por clase.
function makeFakeDom() {
  var state = { activeElement: null, registry: [] };
  function makeInput(className, value) {
    var el = { tagName: 'INPUT', className: className, value: value, selectionStart: value.length, selectionEnd: value.length };
    el.focus = function() { state.activeElement = el; };
    el.setSelectionRange = function(a, b) { el.selectionStart = a; el.selectionEnd = b; };
    return el;
  }
  var doc = {
    get activeElement() { return state.activeElement; },
    querySelectorAll: function(sel) {
      var cls = sel.replace(/^\./, '');
      return state.registry.filter(function(el) { return el.className.split(/\s+/).indexOf(cls) !== -1; });
    },
  };
  return { doc: doc, state: state, makeInput: makeInput };
}

test('withFocusPreserved restaura foco y cursor en el mismo campo logico despues de un render que reconstruye el DOM', () => {
  const w = loadWizard();
  const dom = makeFakeDom();
  w.document = dom.doc;

  dom.state.registry = [dom.makeInput('pg-input-nom', 'campoA'), dom.makeInput('pg-input-nom', 'existsX')];
  dom.state.registry[1].focus();
  dom.state.registry[1].setSelectionRange(7, 7); // cursor al final de "existsX", como si el usuario siguiera tipeando ahi

  var renderRan = false;
  w.withFocusPreserved(function() {
    renderRan = true;
    // Simula container.innerHTML = '' + reconstruccion: el nodo enfocado
    // deja de existir (el foco se pierde) y aparecen nodos NUEVOS con la
    // misma clase/orden pero distinta identidad -- igual que un re-render real.
    dom.state.activeElement = null;
    dom.state.registry = [dom.makeInput('pg-input-nom', 'campoA'), dom.makeInput('pg-input-nom', 'existsXY')];
  });

  assert.equal(renderRan, true);
  assert.equal(dom.doc.activeElement, dom.state.registry[1], 'el foco vuelve al input logicamente equivalente (misma clase, mismo indice), no queda en <body>');
  assert.equal(dom.doc.activeElement.value, 'existsXY');
  assert.equal(dom.doc.activeElement.selectionStart, 7, 'el cursor no salta al final ni al principio');
  assert.equal(dom.doc.activeElement.selectionEnd, 7);
});

test('withFocusPreserved no rompe si nada estaba enfocado antes del render', () => {
  const w = loadWizard();
  const dom = makeFakeDom();
  w.document = dom.doc;
  dom.state.registry = [dom.makeInput('pg-input-nom', 'campoA')];
  // activeElement queda null (nada enfocado, ej. el render lo dispara un fetch en background).
  var renderRan = false;
  assert.doesNotThrow(function() {
    w.withFocusPreserved(function() { renderRan = true; });
  });
  assert.equal(renderRan, true);
  assert.equal(dom.doc.activeElement, null);
});

test('withFocusPreserved usa la clase mas especifica cuando el input tiene varias clases', () => {
  const w = loadWizard();
  const dom = makeFakeDom();
  w.document = dom.doc;
  // Mismo patron que las plantillas reales: "sdtgen-field-input pg-input-elemnom".
  dom.state.registry = [dom.makeInput('sdtgen-field-input pg-input-elemnom', 'campoViejo')];
  dom.state.registry[0].focus();
  dom.state.registry[0].setSelectionRange(4, 4);

  w.withFocusPreserved(function() {
    dom.state.activeElement = null;
    dom.state.registry = [dom.makeInput('sdtgen-field-input pg-input-elemnom', 'campoNuevo')];
  });

  assert.equal(dom.doc.activeElement, dom.state.registry[0]);
  assert.equal(dom.doc.activeElement.selectionStart, 4);
});

// ── Orden de pasos y salteo de Conexión ──────────────────────
//
// El orden cambio: Accion paso a ir ANTES que Conexion, para que el wizard
// pueda saber si la base hace falta antes de exigirla. "Generar casos de
// prueba" con fuente Swagger no toca la base en ningun momento (verificado
// ruta por ruta en generar-collections/index.js), asi que ese paso se
// saltea.
//
// Estos tests son la red que cubre a las 5 herramientas: el mapeo de pasos
// es deterministico y no necesita base, asi que se puede verificar entero
// aca aunque los caminos que si usan Oracle no se puedan ejercitar.

function wizardConDom() {
  const w = loadWizard();
  w.document = makeDomStub();
  return w;
}

test('el panel 2 es Accion y el 3 es Conexion (el orden se invirtio)', () => {
  const w = wizardConDom();
  assert.equal(w.PASO_VERSION, 1);
  assert.equal(w.PASO_ACCION, 2);
  assert.equal(w.PASO_CONEXION, 3);
  assert.equal(w.panelId(1), 'p1');
  assert.equal(w.panelId(2), 'p3', 'el paso 2 tiene que mostrar el panel de Accion');
  assert.equal(w.panelId(3), 'p2', 'el paso 3 tiene que mostrar el panel de Conexion');
});

test('el mapeo de paneles de las 5 herramientas no cambio despues del paso 3', () => {
  const w = wizardConDom();
  const esperado = {
    collections: { 4: 'p4', 5: 'p4c' },
    scripts:     { 4: 'p4s', 5: 'p5s' },
    sdtgen:      { 4: 'p-sdtbase', 5: 'p-sdtedit', 6: 'p-sdtresult' },
    paramgen:    { 4: 'p-paramsvc', 5: 'p-paramedit', 6: 'p-paramresult' },
    doc:         { 4: 'p5', 5: 'p4', 6: 'p6' },
  };
  Object.keys(esperado).forEach(function (accion) {
    w.S.action = accion;
    Object.keys(esperado[accion]).forEach(function (paso) {
      assert.equal(w.panelId(Number(paso)), esperado[accion][paso],
                   accion + ' paso ' + paso);
    });
  });
  w.S.action = 'validate';
  assert.equal(w.panelId(4), 'p4v');
});

test('needsDbConnection: solo collections con Swagger puede prescindir de la base', () => {
  const w = wizardConDom();

  w.S.action = 'collections'; w.S.collectionSource = 'swagger';
  assert.equal(w.needsDbConnection(), false);

  w.S.collectionSource = 'database';
  assert.equal(w.needsDbConnection(), true);

  // Sin fuente elegida todavia, se asume que si: es lo seguro. Igual
  // actionReady() no deja avanzar hasta que se elija.
  w.S.collectionSource = null;
  assert.equal(w.needsDbConnection(), true);

  ['doc', 'scripts', 'validate', 'sdtgen', 'paramgen'].forEach(function (a) {
    w.S.action = a;
    w.S.collectionSource = 'swagger'; // no aplica, no tiene que influir
    assert.equal(w.needsDbConnection(), true, a + ' siempre necesita base');
  });
});

test('actionReady exige la fuente cuando la herramienta es collections', () => {
  const w = wizardConDom();
  // sectionVisible devuelve false con el stub (style.display no es 'none'
  // pero tampoco esta seteado)... se fuerza el caso puntual.
  w.document.getElementById = function (id) {
    if (id === 'apimode-section') return { style: { display: 'none' }, querySelectorAll: function () { return []; } };
    return stubEl();
  };

  w.S.action = 'collections';
  w.S.collectionSource = null;
  assert.equal(w.actionReady(), false, 'sin fuente no se puede avanzar');

  w.S.collectionSource = 'swagger';
  assert.equal(w.actionReady(), true);

  w.S.action = 'doc';
  w.S.collectionSource = null;
  assert.equal(w.actionReady(), true, 'las otras herramientas no piden fuente');
});

test('vizPos comprime el stepper cuando se saltea Conexion', () => {
  const w = wizardConDom();

  w.S.action = 'collections'; w.S.collectionSource = 'database';
  assert.equal(w.vizPos(4), 4, 'con base, el paso 4 es el cuarto punto');
  assert.equal(w.vizPos(5), 5);

  w.S.collectionSource = 'swagger';
  assert.equal(w.vizPos(2), 2, 'los pasos previos no se mueven');
  assert.equal(w.vizPos(3), 3);
  assert.equal(w.vizPos(4), 3, 'sin Conexion, el paso 4 pasa a ser el tercer punto');
  assert.equal(w.vizPos(5), 4);
});

test('vizPos de validate sigue colapsando a 2 puntos', () => {
  const w = wizardConDom();
  w.S.action = 'validate';
  assert.equal(w.vizPos(1), 1);
  assert.equal(w.vizPos(2), 1);
  assert.equal(w.vizPos(3), 1);
  assert.equal(w.vizPos(4), 2);
});

test('el stepper no deja puntos muertos: cada paso visitado tiene su posicion', () => {
  const w = wizardConDom();
  w.S.action = 'collections';

  // Con Swagger los pasos visitados son 1, 2, 4, 5.
  w.S.collectionSource = 'swagger';
  const conSwagger = [1, 2, 4, 5].map(function (p) { return w.vizPos(p); });
  assert.deepEqual(conSwagger, [1, 2, 3, 4], 'posiciones consecutivas, sin huecos');

  // Con base son 1, 2, 3, 4, 5.
  w.S.collectionSource = 'database';
  const conBase = [1, 2, 3, 4, 5].map(function (p) { return w.vizPos(p); });
  assert.deepEqual(conBase, [1, 2, 3, 4, 5]);
});

// ── Navegación: la ida y la vuelta tienen que saltear igual ──

function wizardNavegable() {
  const w = loadWizard();
  w.document = makeDomStub();
  // versionReady() y connReady() dependen de estado y de secciones visibles;
  // se fijan directo para aislar el transito de pasos.
  w.S.version = 'V4'; w.S.platform = 'oracle'; w.S.engine = 'oracle';
  w.document.getElementById = function (id) {
    if (id === 'apimode-section' || id === 'engine-section') {
      return { style: { display: 'none' }, querySelectorAll: function () { return []; } };
    }
    return stubEl();
  };
  return w;
}

test('collections + Swagger: del paso 2 salta al 4, sin pasar por Conexion', async () => {
  const w = wizardNavegable();
  w.S.action = 'collections';
  w.S.collectionSource = 'swagger';
  w.S.step = w.PASO_ACCION;

  await w.goNext();
  assert.equal(w.S.step, 4, 'tenia que saltear el paso 3 (Conexion)');
});

test('collections + base de datos: del paso 2 va al 3 (Conexion)', async () => {
  const w = wizardNavegable();
  w.S.action = 'collections';
  w.S.collectionSource = 'database';
  w.S.step = w.PASO_ACCION;

  await w.goNext();
  assert.equal(w.S.step, w.PASO_CONEXION);
});

test('las otras herramientas siguen pasando por Conexion', async () => {
  for (const accion of ['doc', 'scripts', 'validate', 'paramgen']) {
    const w = wizardNavegable();
    w.S.action = accion;
    w.S.step = w.PASO_ACCION;
    await w.goNext();
    assert.equal(w.S.step, w.PASO_CONEXION, accion + ' tiene que ir a Conexion');
  }
});

test('el paso 1 lleva a Accion, no a Conexion', async () => {
  const w = wizardNavegable();
  w.S.step = w.PASO_VERSION;
  await w.goNext();
  assert.equal(w.S.step, w.PASO_ACCION);
  assert.equal(w.panelId(w.S.step), 'p3', 'y muestra el panel de Accion');
});

test('Conexion sin prueba OK no deja avanzar', async () => {
  const w = wizardNavegable();
  w.S.action = 'doc';
  w.S.step = w.PASO_CONEXION;
  // _connOk arranca en false
  await w.goNext();
  assert.equal(w.S.step, w.PASO_CONEXION, 'se queda donde estaba');
});

test('volver desde el paso 4 saltea Conexion si la ida la salteo', () => {
  const w = wizardNavegable();
  w.S.action = 'collections';
  w.S.collectionSource = 'swagger';
  w.S.step = 4;

  w.goBack();
  assert.equal(w.S.step, w.PASO_ACCION,
               'no puede caer en un paso que nunca vio y que no necesita');
});

test('volver desde el paso 4 pasa por Conexion cuando si hace falta', () => {
  const w = wizardNavegable();
  w.S.action = 'collections';
  w.S.collectionSource = 'database';
  w.S.step = 4;

  w.goBack();
  assert.equal(w.S.step, w.PASO_CONEXION);
});

test('volver desde Conexion lleva a Accion, y desde Accion a Version', () => {
  const w = wizardNavegable();
  w.S.action = 'doc';

  w.S.step = w.PASO_CONEXION;
  w.goBack();
  assert.equal(w.S.step, w.PASO_ACCION);

  w.goBack();
  assert.equal(w.S.step, w.PASO_VERSION);
});

test('elegir la herramienta resetea la fuente: no se arrastra de una vuelta anterior', () => {
  const w = wizardNavegable();
  const el = { closest: function () { return { querySelectorAll: function () { return []; } }; },
               classList: { add: function () {}, remove: function () {} } };

  w.S.collectionSource = 'swagger';
  w.pick('action', 'collections', el);
  assert.equal(w.S.collectionSource, null,
               'cada eleccion de herramienta pide la fuente de nuevo');
});

test('elegir la fuente la baja al select que leen los managers del builder', () => {
  const w = wizardNavegable();
  let valorEnElSelect = null;
  let avisado = null;
  w.document.getElementById = function (id) {
    if (id === 'collection-source-select') {
      return { set value(v) { valorEnElSelect = v; }, get value() { return valorEnElSelect; } };
    }
    if (id === 'apimode-section') return { style: { display: 'none' }, querySelectorAll: function () { return []; } };
    return stubEl();
  };
  w.collectionUpdateServiceSource = function (v) { avisado = v; };

  const el = { closest: function () { return { querySelectorAll: function () { return []; } }; },
               classList: { add: function () {}, remove: function () {} } };
  w.pick('collectionSource', 'database', el);

  assert.equal(valorEnElSelect, 'database', 'el select oculto quedo sincronizado');
  assert.equal(avisado, 'database', 'y los managers se enteraron');
});

test('si los managers del builder no cargaron todavia, elegir la fuente no rompe', () => {
  const w = wizardNavegable();
  w.collectionUpdateServiceSource = undefined;
  const el = { closest: function () { return { querySelectorAll: function () { return []; } }; },
               classList: { add: function () {}, remove: function () {} } };
  assert.doesNotThrow(function () { w.pick('collectionSource', 'swagger', el); });
  assert.equal(w.S.collectionSource, 'swagger');
});

// ── Rótulos del stepper ──────────────────────────────────────
//
// Defecto real que aparecio al verificar en el navegador: los rotulos de los
// pasos 4 y 5 se escribian fijo en lb4/lb5, pero al saltear Conexion el paso
// 4 enciende el punto 3. Quedaba un punto en blanco activo y dos rotulos
// apuntando a pasos que ahi ya no estaban.

function wizardConRotulos() {
  const w = loadWizard();
  const lb = { lb1: '', lb2: '', lb3: '', lb4: '', lb5: '' };
  const dotsEl = {};
  w.document = {
    getElementById: function (id) {
      if (Object.prototype.hasOwnProperty.call(lb, id)) {
        return { get textContent() { return lb[id]; }, set textContent(v) { lb[id] = v; } };
      }
      if (/^d\d$/.test(id) || /^l\d$/.test(id) || /^dn\d$/.test(id)) {
        if (!dotsEl[id]) {
          dotsEl[id] = { style: {}, innerHTML: '', clases: new Set(),
            classList: {
              add: function () { [].forEach.call(arguments, c => dotsEl[id].clases.add(c)); },
              remove: function () { [].forEach.call(arguments, c => dotsEl[id].clases.delete(c)); },
              toggle: function (c, on) { on ? dotsEl[id].clases.add(c) : dotsEl[id].clases.delete(c); },
              contains: function (c) { return dotsEl[id].clases.has(c); },
            } };
        }
        return dotsEl[id];
      }
      return stubEl();
    },
    querySelectorAll: function () { return []; },
    querySelector: function () { return stubEl(); },
    addEventListener: function () {},
  };
  return { w, lb, dotsEl };
}

test('con Conexion: los rotulos 4 y 5 van en lb4 y lb5', () => {
  const { w, lb } = wizardConRotulos();
  w.S.action = 'collections';
  w.S.collectionSource = 'database';
  w.dots(4);

  assert.deepEqual([lb.lb1, lb.lb2, lb.lb3, lb.lb4, lb.lb5],
                   ['Versión', 'Acción', 'Conexión', 'API', 'Collections']);
});

test('sin Conexion: los rotulos se corren a lb3 y lb4, y lb5 queda vacio', () => {
  const { w, lb } = wizardConRotulos();
  w.S.action = 'collections';
  w.S.collectionSource = 'swagger';
  w.dots(4);

  assert.deepEqual([lb.lb1, lb.lb2, lb.lb3, lb.lb4, lb.lb5],
                   ['Versión', 'Acción', 'API', 'Collections', ''],
                   'los rotulos tienen que acompañar al punto que se enciende');
});

test('sin Conexion, el punto que se enciende en el paso 4 es el 3, y tiene rotulo', () => {
  const { w, lb, dotsEl } = wizardConRotulos();
  w.S.action = 'collections';
  w.S.collectionSource = 'swagger';
  w.dots(4);

  assert.ok(dotsEl.d3.clases.has('active'), 'el punto 3 tiene que estar activo');
  assert.equal(lb.lb3, 'API', 'y no puede ser un punto activo sin rotulo');
  assert.ok(!dotsEl.d4.clases.has('active'));
});

test('sin Conexion el camino tiene 4 puntos: el quinto se oculta', () => {
  const { w, dotsEl } = wizardConRotulos();
  w.S.action = 'collections';
  w.S.collectionSource = 'swagger';
  w.dots(2);

  assert.equal(dotsEl.d4.style.display, '', 'el cuarto punto existe');
  assert.equal(dotsEl.d5.style.display, 'none', 'el quinto no, no hay quinto paso');
});

test('cambiar de fuente reubica los rotulos, no deja el viejo colgado', () => {
  const { w, lb } = wizardConRotulos();
  w.S.action = 'collections';

  w.S.collectionSource = 'database';
  w.dots(2);
  assert.equal(lb.lb5, 'Collections');

  w.S.collectionSource = 'swagger';
  w.dots(2);
  assert.equal(lb.lb5, '', 'el rotulo viejo del quinto punto tiene que limpiarse');
  assert.equal(lb.lb4, 'Collections');
});

test('validate sigue mostrando 2 puntos y sus rotulos propios', () => {
  const { w, lb, dotsEl } = wizardConRotulos();
  w.S.action = 'validate';
  w.dots(4);

  assert.equal(lb.lb1, 'Ambiente');
  assert.equal(lb.lb2, 'Validar');
  assert.equal(dotsEl.d3.style.display, 'none');
  assert.ok(dotsEl.d2.clases.has('active'), 'el paso 4 de validate es el segundo punto');
});

test('las otras herramientas conservan sus rotulos de siempre', () => {
  const casos = {
    scripts: ['Servicios', 'Script'],
    sdtgen: ['SDT base', 'Editar'],
    paramgen: ['Servicio', 'Parámetros'],
    doc: ['Servicios', 'API'],
  };
  Object.keys(casos).forEach(function (accion) {
    const { w, lb } = wizardConRotulos();
    w.S.action = accion;
    w.dots(4);
    assert.deepEqual([lb.lb4, lb.lb5], casos[accion], accion);
    assert.equal(lb.lb3, 'Conexión', accion + ' sigue teniendo el paso de Conexion');
  });
});
