// Gate tests del wizard (front-end). wizard-doc.js es un script de navegador
// sin module.exports, asi que se carga tal cual en un sandbox de vm con los
// globals minimos que usa al cargar (EventSource para el keepAlive). Se testea
// el archivo que realmente se sirve, sin duplicar la logica.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadWizard() {
  const src = fs.readFileSync(path.join(__dirname, 'wizard-doc.js'), 'utf8');
  const sandbox = {
    EventSource: function() { this.close = function() {}; },
    setTimeout: function() {},
    clearTimeout: function() {},
    console: { log: function() {} },
    document: { getElementById: function() { return null; }, querySelectorAll: function() { return []; } },
    fetch: function() { return Promise.reject(new Error('sin red en los tests')); },
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'wizard-doc.js' });
  return sandbox;
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
test('validateItems con apiMode interna no devuelve ninguna advertencia', () => {
  const { validateItems } = loadWizard();
  assert.equal(validateItems([item()], 'interna').length, 0);
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
  });
  assert.equal(validateItems([ok], 'publica').length, 0);
});

test('el paso 2 solo habilita Siguiente cuando los bloques visibles estan elegidos', () => {
  const w = loadWizard();
  const visible = { 'engine-section': 'block', 'apimode-section': 'none' };
  w.document.getElementById = function(id) {
    if (visible[id] === undefined) return null;
    return { style: { display: visible[id] } };
  };
  w.S.version = null; w.S.engine = null; w.S.apiMode = null;
  assert.equal(w.step2Ready(), false, 'sin version no se puede avanzar');
  w.S.version = 'V4';
  assert.equal(w.step2Ready(), false, 'motor visible sin elegir bloquea');
  w.S.engine = 'oracle';
  assert.equal(w.step2Ready(), true, 'API oculta no bloquea');
  visible['apimode-section'] = 'block';
  assert.equal(w.step2Ready(), false, 'API visible sin elegir bloquea');
  w.S.apiMode = 'interna';
  assert.equal(w.step2Ready(), true);
});

test('step3Ready exige conexion probada, y ademas API elegida solo para Generar SDT', () => {
  const w = loadWizard();
  w._connOk = false; w.S.action = 'doc'; w.S.apiMode = null;
  assert.equal(w.step3Ready(), false, 'sin conexion probada nunca esta listo');

  w._connOk = true; w.S.action = 'doc';
  assert.equal(w.step3Ready(), true, 'doc no muestra el toggle, no lo exige');

  w._connOk = true; w.S.action = 'scripts'; w.S.apiMode = 'interna';
  assert.equal(w.step3Ready(), true, 'scripts ya eligio API en el paso de version');

  w._connOk = true; w.S.action = 'sdtgen'; w.S.apiMode = null;
  assert.equal(w.step3Ready(), false, 'sdtgen necesita elegir API en el paso de conexion');

  w.S.apiMode = 'publica';
  assert.equal(w.step3Ready(), true);

  w.S.apiMode = 'interna';
  assert.equal(w.step3Ready(), true);
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

test('pickConnApiMode setea S.apiMode y marca la tarjeta clickeada', () => {
  const w = loadWizard();
  var marked = [];
  var cardPublica = { classList: { add: function(c) { marked.push(['pub', 'add', c]); }, remove: function(c) { marked.push(['pub', 'rm', c]); } } };
  var cardInterna = { classList: { add: function(c) { marked.push(['int', 'add', c]); }, remove: function(c) { marked.push(['int', 'rm', c]); } } };
  var clicked = { closest: function() { return { querySelectorAll: function() { return [cardPublica, cardInterna]; } }; }, classList: cardInterna.classList };
  w.document.getElementById = function(id) { return id === 'btn-next' ? { disabled: true } : null; };
  w.S.step = 3;
  w.pickConnApiMode('interna', clicked);
  assert.equal(w.S.apiMode, 'interna');
  assert.ok(marked.some(m => m[0] === 'int' && m[1] === 'add' && m[2] === 'sel'));
});

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
  const it = item({ sdts: [sdtItem({ elemdsc: '' })] });
  assert.equal(validateItems([it], 'interna').length, 0);
});
