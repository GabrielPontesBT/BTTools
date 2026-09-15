const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { auditar, ARCHIVOS_VIGILADOS, radioValido, sombraValida, rgbaNeutro } = require('./audit');
const { migrarCss, agregarTokensNuevos } = require('./migrate');
const M = require('./shape-map');

const RAIZ = path.join(__dirname, '..', '..', '..');

// -- El gate --------------------------------------------------
//
// Lo que evita que el segundo pase de unificacion se desarme solo. El builder
// tenia 47 sombras (35 valores distintos, todas con tinte slate), 19 radios,
// 71 font-weight:800 y 7 trackings de mayuscula. Sin un test, el proximo
// "border-radius:16px" escrito a mano no lo frena nadie.

ARCHIVOS_VIGILADOS.forEach(function (archivo) {
  test(archivo + ': todo border-radius es un token, 50% o 0', () => {
    const r = auditar(archivo);
    assert.deepEqual(r.radios, [],
      'La escala es --r-xs (6px), --r-ctrl (10px), --r (12px) y --r-pill (20px). ' +
      'Un circulo se escribe 50%, como .sdot y .ok-icon.');
  });

  test(archivo + ': toda sombra es un token de elevacion', () => {
    const r = auditar(archivo);
    assert.deepEqual(r.sombras, [],
      'La escala es --shadow-sm, --shadow-md y --shadow, mas --ring para el foco. ' +
      'Si el elemento no flota, lleva borde y box-shadow:none, como el resto de la app.');
  });

  test(archivo + ': ningun font-weight pasa de 700', () => {
    const r = auditar(archivo);
    assert.deepEqual(r.pesos, [],
      '700 es el maximo del proyecto y esta reservado para titulos y badges. ' +
      '600 es el peso de trabajo, 500 el de .btn y .field label.');
  });

  test(archivo + ': ningun control queda fuera de --ctrl-h', () => {
    const r = auditar(archivo);
    assert.deepEqual(r.altos, [],
      'Inputs, selects y botones miden --ctrl-h (40px) en todas las herramientas.');
  });

  test(archivo + ': las mayusculas usan el tracking del proyecto', () => {
    const r = auditar(archivo);
    assert.deepEqual(r.trackings, [],
      'El micro-label en mayuscula del proyecto (.ccard-badge, .pg-flabel) es ' +
      M.TRACKING_MAYUSCULA + '.');
  });

  test(archivo + ': las custom properties -radius estan en la escala', () => {
    const r = auditar(archivo);
    assert.deepEqual(r.varsRadio, [],
      'Una var que guarda un radio tiene que apuntar a un token, no a un px suelto.');
  });

  test(archivo + ': ningun rgba() tiene tinte ajeno', () => {
    const r = auditar(archivo);
    assert.deepEqual([...new Set(r.tintes)], [],
      'El pase de color mide hex, asi que un rgba() se le escapa entero. ' +
      'La base tiene que ser neutra (18,20,24), blanca, negra o un color de marca.');
  });
});

// -- Los tokens nuevos existen de verdad ----------------------

test('los 6 tokens de forma estan definidos en el :root de styles.css', () => {
  const styles = fs.readFileSync(path.join(RAIZ, 'public', 'styles.css'), 'utf8');
  const root = (styles.match(/:root\{[\s\S]*?\}/) || [''])[0];
  assert.ok(root, 'no se encontro el bloque :root');

  M.TOKENS_NUEVOS.forEach(function (t) {
    const re = new RegExp(t.nombre.replace(/-/g, '\\-') + '\\s*:\\s*' + t.valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    assert.match(root, re, t.nombre + ' no esta definido con el valor ' + t.valor);
  });
});

test('los tokens de sombra son neutros, no slate con tinte azul', () => {
  M.TOKENS_NUEVOS.filter(function (t) { return /shadow/.test(t.nombre); }).forEach(function (t) {
    assert.ok(rgbaNeutro(t.valor), t.nombre + ' tiene tinte: ' + t.valor);
  });
});

test('cada token nuevo explica por que existe', () => {
  M.TOKENS_NUEVOS.forEach(function (t) {
    assert.ok(t.porque && t.porque.length > 40,
      t.nombre + ' no tiene justificacion escrita; el mapeo es una decision de diseño, no un reemplazo mecanico');
  });
});

// -- La migracion es idempotente ------------------------------
//
// Es la propiedad que hace que el script se pueda correr de nuevo sin miedo
// despues de cualquier cambio en collections.css.

test('correr la migracion sobre el archivo ya migrado no cambia nada', () => {
  const css = fs.readFileSync(path.join(RAIZ, 'public', 'collections.css'), 'utf8').replace(/\r\n/g, '\n');
  assert.equal(migrarCss(css), css);
});

test('agregar los tokens sobre un :root que ya los tiene no cambia nada', () => {
  const styles = fs.readFileSync(path.join(RAIZ, 'public', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');
  const r = agregarTokensNuevos(styles);
  assert.equal(r.cambios, 0);
  assert.equal(r.out, styles);
});

// -- Las reglas del mapeo -------------------------------------

test('resolverRadio: 999px da circulo si el elemento es cuadrado y pill si no', () => {
  assert.equal(M.resolverRadio('999px', '.x-dot', 'width:10px;height:10px'), '50%');
  assert.equal(M.resolverRadio('999px', '.x-badge', 'padding:2px 7px'), 'var(--r-pill)');
});

test('resolverRadio: un cuadrado grande sigue siendo circulo, que es el caso que rompia', () => {
  // El icono del canvas vacio mide 72px. Con --r-pill (20px) dejaria de ser
  // un circulo; por eso el criterio es la forma del elemento, no el valor.
  assert.equal(M.resolverRadio('999px', '.x-empty-icon', 'width:72px;height:72px'), '50%');
});

test('resolverRadio: el rol decide entre radio de control y radio de superficie', () => {
  assert.equal(M.resolverRadio('12px', '.x-input', ''), 'var(--r-ctrl)');
  assert.equal(M.resolverRadio('12px', '.x-card', ''), 'var(--r)');
  assert.equal(M.resolverRadio('24px', '.x-panel', ''), 'var(--r)');
  assert.equal(M.resolverRadio('8px', '.x-tag', ''), 'var(--r-xs)');
});

test('resolverRadio: un shorthand de esquinas conserva las que van en 0', () => {
  assert.equal(M.resolverRadio('16px 16px 0 0', '.x-head', ''), 'var(--r) var(--r) 0 0');
});

test('resolverRadio: no toca lo que ya es token, circulo o cero', () => {
  assert.equal(M.resolverRadio('var(--r)', '.x', ''), null);
  assert.equal(M.resolverRadio('50%', '.x', ''), null);
  assert.equal(M.resolverRadio('0', '.x', ''), null);
});

test('longitudesDe cuenta el 0 pelado como longitud', () => {
  // "0 18px 34px rgba(...)" tiene blur 34. Buscar solo tokens terminados en px
  // devolvia 2 valores y dejaba la sombra sin migrar: era el bug que dejaba
  // 37 de las 47 sombras intactas.
  assert.deepEqual(M.longitudesDe('0 18px 34px rgba(15,23,42,.06)'), ['0', '18px', '34px']);
});

test('resolverSombra: lo que no flota se queda sin sombra y se apoya en su borde', () => {
  assert.equal(M.resolverSombra('0 18px 34px rgba(15,23,42,.06)', '.collection-exec-header'), 'none');
  assert.equal(M.resolverSombra('0 14px 26px rgba(15,23,42,.08)', '.collection-exec-node'), 'none');
});

test('resolverSombra: lo que flota de verdad conserva elevacion', () => {
  assert.equal(M.resolverSombra('0 18px 34px rgba(15,23,42,.14)', '.collection-builder-menu-popover'), 'var(--shadow-md)');
  assert.equal(M.resolverSombra('0 22px 40px rgba(15,23,42,.14)', '.collection-builder-service-drawer'), 'var(--shadow-md)');
});

test('resolverSombra: un estado si lleva sombra, porque ahi significa algo', () => {
  assert.equal(M.resolverSombra('0 10px 20px rgba(15,23,42,.06)', '.collection-service-card:hover'), 'var(--shadow-sm)');
  assert.equal(M.resolverSombra('0 20px 38px rgba(15,23,42,.10)', '.collection-canvas-step:hover'), 'var(--shadow-sm)');
});

test('resolverSombra: un anillo nunca es elevacion, es foco', () => {
  assert.equal(M.resolverSombra('0 0 0 3px var(--red-l)', '.x-input:focus'), 'var(--ring)');
  assert.equal(
    M.resolverSombra('0 0 0 3px rgba(109,94,252,.14),0 20px 34px rgba(79,70,229,.18)', '.collection-exec-node-selected'),
    'var(--ring),var(--shadow-sm)');
});

test('resolverSombra: el dialogo modal se queda con la sombra que el proyecto ya tenia', () => {
  assert.equal(M.resolverSombra('0 36px 90px rgba(15,23,42,.24)', '.collection-execution-dialog'), 'var(--shadow)');
});

test('resolverSombra: none no se toca', () => {
  assert.equal(M.resolverSombra('none', '.x'), null);
  assert.equal(M.resolverSombra('none !important', '.x'), null);
});

test('resolverPeso: 800 y 900 colapsan a 700 y despues se reparten por rol', () => {
  assert.equal(M.resolverPeso('800', '.collection-exec-card-title'), '700');
  assert.equal(M.resolverPeso('900', '.collection-x-title'), '700');
  assert.equal(M.resolverPeso('800', '.collection-x-btn'), '500');
  assert.equal(M.resolverPeso('800', '.collection-x-count'), '600');
});

test('resolverPeso: un <label> pesa lo que .field label', () => {
  assert.equal(M.resolverPeso('700', '.collection-studio-config-main label'), '500');
  assert.equal(M.resolverPeso('700', '.collection-builder-sidebar .field label'), '500');
});

test('resolverPeso: el modificador de estado no cambia el rol del componente', () => {
  // ".collection-exec-tab.active" sigue siendo un tab, no un componente "active".
  assert.equal(M.resolverPeso('700', '.collection-exec-tab.active'), '600');
});

test('resolverPeso: lo que ya esta en la escala no se toca', () => {
  assert.equal(M.resolverPeso('600', '.x-title'), null);
  assert.equal(M.resolverPeso('500', '.x-btn'), null);
  assert.equal(M.resolverPeso('400', '.x'), null);
});

test('resolverRgba: neutraliza la base y conserva el alfa', () => {
  assert.equal(M.resolverRgba('rgba(15,23,42,.42)'), 'rgba(18,20,24,.42)');
  assert.equal(M.resolverRgba('rgba(79,70,229,.18)'), 'rgba(18,20,24,.18)');
  assert.equal(M.resolverRgba('rgba(245,158,11,.22)'), 'rgba(217,119,6,.22)');
});

test('resolverRgba: el blanco y el negro no son un tinte y no se tocan', () => {
  assert.equal(M.resolverRgba('rgba(255,255,255,.88)'), null);
  assert.equal(M.resolverRgba('rgba(0,0,0,.45)'), null);
});

test('esSelectorDeControl: mira el ultimo elemento, no el contenedor', () => {
  assert.equal(M.esSelectorDeControl('.collection-catalog-actions .btn'), true);
  assert.equal(M.esSelectorDeControl('.collection-x-input:focus'), true);
  assert.equal(M.esSelectorDeControl('.collection-x-card'), false);
  // Un cuadrado de marca no es un control aunque viva en una barra de botones.
  assert.equal(M.esSelectorDeControl('.collection-studio-mark'), false);
});

// -- Los validadores del audit --------------------------------

test('radioValido acepta la escala y rechaza un px suelto', () => {
  assert.equal(radioValido('var(--r)'), true);
  assert.equal(radioValido('var(--r) var(--r) 0 0'), true);
  assert.equal(radioValido('50%'), true);
  assert.equal(radioValido('16px'), false);
  assert.equal(radioValido('999px'), false);
});

test('sombraValida rechaza una sombra escrita a mano', () => {
  assert.equal(sombraValida('none'), true);
  assert.equal(sombraValida('var(--shadow-md)'), true);
  assert.equal(sombraValida('var(--ring),var(--shadow-sm)'), true);
  assert.equal(sombraValida('0 18px 34px rgba(18,20,24,.06)'), false);
});

test('rgbaNeutro detecta el tinte slate aunque el gris parezca oscuro', () => {
  assert.equal(rgbaNeutro('rgba(18,20,24,.14)'), true);
  assert.equal(rgbaNeutro('rgba(255,255,255,.9)'), true);
  assert.equal(rgbaNeutro('rgba(15,23,42,.06)'), false);
  assert.equal(rgbaNeutro('rgba(109,94,252,.10)'), false);
});

// -- Las variables muertas no vuelven -------------------------

test('las custom properties del builder que no usa nadie siguen borradas', () => {
  const css = fs.readFileSync(path.join(RAIZ, 'public', 'collections.css'), 'utf8');
  M.VARS_MUERTAS.forEach(function (v) {
    assert.equal(css.indexOf(v), -1, v + ' volvio a aparecer; estaba declarada en 5 breakpoints y usada en 0');
  });
});

test('toda custom property --builder-* declarada se usa en algun lado', () => {
  const css = fs.readFileSync(path.join(RAIZ, 'public', 'collections.css'), 'utf8');
  const declaradas = [...new Set([...css.matchAll(/(--builder-[a-z0-9-]+)\s*:/g)].map(function (m) { return m[1]; }))];
  const sinUso = declaradas.filter(function (v) { return css.split('var(' + v).length === 1; });
  assert.deepEqual(sinUso, [], 'variables declaradas y nunca usadas: mienten sobre lo que la UI hace');
});

// -- El ancho del borde de las cajas --------------------------
//
// El proyecto dibuja una caja con `border:1.5px` (19 usos en styles.css) y
// 2px cuando va enfatizada (.ccard, .sdot, .sg-chk). El builder tenia 81 cajas
// en 1px: al lado de un .svc-wrap o un .param-card del wizard se leian de otro
// grosor. Los border-top/bottom/left/right son separadores y siguen en 1px,
// que es lo que hacen los dos archivos.

test('public/collections.css: ninguna caja queda con borde de 1px', () => {
  const r = auditar('public/collections.css');
  assert.deepEqual(r.bordes, [],
    'El shorthand border: dibuja una caja y el proyecto la dibuja en 1.5px. ' +
    'Un separador se escribe border-top/bottom/left/right, que sigue en 1px.');
});

test('el separador de fila sigue en 1px, como en styles.css', () => {
  const css = fs.readFileSync(path.join(RAIZ, 'public', 'collections.css'), 'utf8');
  assert.ok((css.match(/border-(?:top|bottom|left|right):\s*1px/g) || []).length > 20,
    'subir los separadores a 1.5px no era parte del cambio: los dos archivos ya coincidian');
});
