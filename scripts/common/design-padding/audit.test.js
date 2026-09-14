const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { auditar, ARCHIVOS_VIGILADOS, componenteValido } = require('./audit');
const { migrarPadding, migrarPaddingEnVars, migrarFallbacks, necesitaRenombre } = require('./migrate');
const M = require('./pad-map');

const RAIZ = path.join(__dirname, '..', '..', '..');
const leer = function (rel) { return fs.readFileSync(path.join(RAIZ, rel), 'utf8'); };

// -- El gate --------------------------------------------------
//
// El padding tenia 27 valores distintos en 613 componentes repartidos por los
// 4 archivos del front. Sin un test, el proximo "padding:10px 14px" copiado de
// otra regla no lo frena nadie, y en este pase eso importa mas que en los dos
// anteriores: toca las 6 herramientas, no una.

ARCHIVOS_VIGILADOS.forEach(function (archivo) {
  test(archivo + ': todo padding esta en la escala', () => {
    const r = auditar(archivo);
    assert.deepEqual([...new Set(r.sueltos)], [],
      'La escala es --sp-1 a --sp-7 (4/8/12/16/20/24/28px). Si el valor reserva el hueco de un ' +
      'elemento absoluto, va a GEOMETRIA en pad-map.js con su razon.');
  });

  test(archivo + ': las custom properties de padding estan en la escala', () => {
    const r = auditar(archivo);
    assert.deepEqual([...new Set(r.enVars)], [],
      'Una var consumida como padding es un padding, aunque la expresion de declaraciones no la vea.');
  });

  test(archivo + ': ningun token de la escala se define a si mismo', () => {
    const r = auditar(archivo);
    assert.deepEqual(r.circulares, [],
      'Una referencia circular anula el token en tiempo de computo, sin error visible, ' +
      'y con el se caen todas las reglas que lo usan.');
  });
});

// -- La escala existe y es una grilla de 4px -------------------

test('los 7 pasos estan definidos en el :root de styles.css', () => {
  const root = (leer('public/styles.css').match(/:root\{[\s\S]*?\}/) || [''])[0];
  assert.ok(root, 'no se encontro el bloque :root');
  M.ESCALA.forEach(function (e) {
    assert.match(root, new RegExp(e.token.replace(/-/g, '\\-') + '\\s*:\\s*' + e.valor + 'px'),
      e.token + ' no esta definido con el valor ' + e.valor + 'px');
  });
});

test('la escala es una grilla de 4px sin huecos', () => {
  M.PASOS.forEach(function (v, i) {
    if (i === 0) { assert.equal(v, 4); return; }
    assert.equal(v - M.PASOS[i - 1], 4, 'el paso ' + v + ' rompe la grilla de 4px');
  });
});

test('el renombre de --sp-5 ya esta hecho y no vuelve a correr', () => {
  assert.equal(necesitaRenombre(leer('public/styles.css')), false,
    'si --sp-5 vuelve a valer 28px, la segunda corrida del pase renombraria los --sp-5 legitimos');
});

test('no queda ningun var(--sp-5) que quisiera decir 28px', () => {
  // --sp-5 paso de 28px a 20px. Los 24 usos viejos se renombraron a --sp-7 en
  // el mismo pase; este test es la red por si alguno se escribe de nuevo a mano
  // pensando en el valor viejo.
  const root = (leer('public/styles.css').match(/:root\{[\s\S]*?\}/) || [''])[0];
  assert.match(root, /--sp-5\s*:\s*20px/);
  assert.match(root, /--sp-7\s*:\s*28px/);
});

// -- Las reglas del mapeo -------------------------------------

test('resolverPaso: el paso mas cercano', () => {
  assert.equal(M.resolverPaso(9, 'vertical', '.x'), 8);
  assert.equal(M.resolverPaso(11, 'horizontal', '.x'), 12);
  assert.equal(M.resolverPaso(13, 'horizontal', '.x'), 12);
  assert.equal(M.resolverPaso(15, 'horizontal', '.x'), 16);
});

test('resolverPaso: los empates se rompen por frecuencia, no a ojo', () => {
  // 6 esta a 2px de 4 y de 8; el proyecto usa 8 en 54 componentes y 4 en 33.
  assert.equal(M.resolverPaso(6, 'vertical', '.x'), 8);
  // 18 esta a 2px de 16 y de 20; 16 gana 49 a 17.
  assert.equal(M.resolverPaso(18, 'vertical', '.x'), 16);
  // 22 esta a 2px de 20 y de 24; 20 gana 17 a 7.
  assert.equal(M.resolverPaso(22, 'horizontal', '.x'), 20);
});

test('resolverPaso: 10 y 14 van por rol, para no aplanar la jerarquia', () => {
  // Si 10 y 14 se rompieran por frecuencia, los dos caerian en 12 junto con el
  // propio 12: 267 componentes (el 44%) con el mismo padding, y una fila
  // pasaria a tener el mismo aire que una card.
  assert.equal(M.resolverPaso(10, 'vertical', '.collection-service-card'), 12);
  assert.equal(M.resolverPaso(10, 'vertical', '.sg-mtd-item'), 8);
  assert.equal(M.resolverPaso(10, 'vertical', '.field input'), 8);
  assert.equal(M.resolverPaso(10, 'horizontal', '.sg-mtd-item'), 12);
  assert.equal(M.resolverPaso(14, 'vertical', '.collection-run-card'), 12);
  assert.equal(M.resolverPaso(14, 'horizontal', '.collection-run-card'), 16);
});

test('la jerarquia fila/contenedor sobrevive al pase', () => {
  const fila = [M.resolverPaso(10, 'vertical', '.x-row'), M.resolverPaso(10, 'horizontal', '.x-row')];
  const card = [M.resolverPaso(14, 'vertical', '.x-card'), M.resolverPaso(14, 'horizontal', '.x-card')];
  assert.ok(fila[0] < card[0], 'una fila tiene que quedar mas apretada en vertical que una card');
  assert.ok(fila[1] < card[1], 'y tambien en horizontal');
});

test('rolDe mira el ultimo componente del selector', () => {
  assert.equal(M.rolDe('.collection-catalog-actions .btn'), 'control');
  assert.equal(M.rolDe('.sg-mtd-item'), 'fila');
  assert.equal(M.rolDe('.collection-service-card-tag'), 'micro');
  assert.equal(M.rolDe('.collection-run-card'), 'defecto');
});

// -- Las exenciones de geometria ------------------------------
//
// Es la parte que un reemplazo mecanico rompe si nadie la declara: padding que
// reserva el hueco de un elemento en position:absolute. Cambiarlo no mueve el
// elemento absoluto, hace que le pise el texto al usuario.

test('el hueco reservado para un elemento absoluto no se toca', () => {
  assert.ok(M.exencionDe('.pw input', 'horizontal', 36), 'el ojito de la password');
  assert.ok(M.exencionDe('.collection-service-search-input', 'horizontal', 34), 'la lupa del catalogo');
  assert.ok(M.exencionDe('.collection-exec-code', 'vertical', 44), 'la barra flotante del bloque de codigo');
});

test('la exencion es del valor acoplado, no de toda la regla', () => {
  // En `padding:0 10px 0 30px` el unico valor atado al icono es el 30. El 10 es
  // espaciado comun y tiene que entrar en la escala igual que cualquier otro.
  assert.ok(M.exencionDe('.collection-inspector-search-input', 'horizontal', 30));
  assert.equal(M.exencionDe('.collection-inspector-search-input', 'horizontal', 10), null);
});

test('cada exencion explica por que existe', () => {
  Object.entries(M.GEOMETRIA).forEach(function (e) {
    assert.ok(e[1].porque && e[1].porque.length > 40,
      e[0] + ' no tiene justificacion escrita');
    assert.ok(Array.isArray(e[1].ejes) && e[1].ejes.length, e[0] + ' no declara el eje');
  });
});

// -- La escala nunca se redefine a si misma -------------------
//
// El defecto que aparecio migrando: las vars de la escala tambien se consumen
// dentro de declaraciones de padding (son el destino del pase), asi que el pase
// de custom properties reescribia --sp-1:4px como --sp-1:var(--sp-1). CSS
// descarta la referencia circular en tiempo de computo y los SIETE tokens
// quedan vacios: no se cae una regla, se caen todas las que usan cualquier
// token, en las 6 herramientas y a la vez.

test('migrarPaddingEnVars no toca la definicion de la escala', () => {
  const css = ':root{--sp-1:4px;--sp-3:12px}\n.x{padding:var(--sp-1) var(--sp-3)}';
  assert.equal(migrarPaddingEnVars(css), css);
});

test('esTokenDeEscala reconoce los 7 y solo los 7', () => {
  M.ESCALA.forEach(function (e) { assert.equal(M.esTokenDeEscala(e.token), true, e.token); });
  assert.equal(M.esTokenDeEscala('--sp-8'), false);
  assert.equal(M.esTokenDeEscala('--builder-node-padding'), false);
});

test('una var que no es padding no entra aunque la consuma un padding', () => {
  // --exec-node-width aparece en padding-right:calc(var(--exec-node-width)/2 - 9px).
  // Meterla en la escala le cambiaria el ancho a los nodos del diagrama.
  const css = '.x{--exec-node-width:215px}\n.y{padding-right:calc(var(--exec-node-width) / 2 - 9px)}';
  assert.equal(migrarPaddingEnVars(css), css);
});

// -- Mecanica del reemplazo -----------------------------------

test('cada componente del shorthand se resuelve por su eje', () => {
  // padding:a b c -> a y c vertical, b horizontal
  const out = migrarPadding('.collection-run-card{padding:14px 14px 14px}', 'public/collections.css');
  assert.match(out, /padding:var\(--sp-3\) var\(--sp-4\) var\(--sp-3\)/);
});

test('lo que no es un px pelado se conserva', () => {
  const out = migrarPadding('.wiz-bd{padding:28px 8vw var(--sp-7)}', 'public/styles.css');
  assert.match(out, /8vw/, 'el vw no es un valor de la escala');
  assert.match(out, /var\(--sp-7\) 8vw var\(--sp-7\)/);
});

test('el cero se queda en cero', () => {
  const out = migrarPadding('.x{padding:0 10px}', 'public/collections.css');
  assert.match(out, /padding:0 var\(--sp-3\)/);
});

test('un valor que ya esta en la escala igual se escribe como token', () => {
  // Si queda como literal el archivo audita limpio y sigue teniendo paddings en
  // px sueltos, que es de donde sale el proximo valor copiado a ojo.
  const out = migrarPadding('.x{padding:12px 16px}', 'public/collections.css');
  assert.match(out, /padding:var\(--sp-3\) var\(--sp-4\)/);
});

test('el fallback de un var() tambien entra en la escala', () => {
  const out = migrarFallbacks('.x{padding:0 var(--builder-button-padding-x,14px)}');
  assert.match(out, /var\(--builder-button-padding-x,var\(--sp-4\)\)/);
});

test('componenteValido acepta la escala y rechaza un px suelto', () => {
  assert.equal(componenteValido('var(--sp-3)'), true);
  assert.equal(componenteValido('0'), true);
  assert.equal(componenteValido('8vw'), true);
  assert.equal(componenteValido('10px'), false);
});

// -- El pase es idempotente -----------------------------------

test('correr la migracion sobre los archivos ya migrados no cambia nada', () => {
  ARCHIVOS_VIGILADOS.forEach(function (rel) {
    const src = leer(rel).replace(/\r\n/g, '\n');
    let out = migrarPadding(src, rel);
    out = migrarFallbacks(out);
    out = migrarPaddingEnVars(out);
    assert.equal(out, src, rel + ' cambia al re-migrar: el pase no es idempotente');
  });
});
