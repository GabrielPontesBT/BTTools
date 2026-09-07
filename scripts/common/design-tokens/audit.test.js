const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { auditar, ARCHIVOS_VIGILADOS } = require('./audit');
const M = require('./token-map');

const RAIZ = path.join(__dirname, '..', '..', '..');

// ── El gate ──────────────────────────────────────────────────
//
// Esto es lo que evita que la unificacion se desarme sola. El front del
// builder de Collections tenia 115 colores distintos, 143 font-size fuera
// de escala y 171 espaciados fuera de escala; sin un test, el proximo
// cambio que agregue un #64748b a mano no lo frena nadie.

ARCHIVOS_VIGILADOS.forEach(function (archivo) {
  test(archivo + ': sin colores hardcodeados fuera de los tokens', () => {
    const r = auditar(archivo);
    assert.equal(r.colores.malos, 0,
      'colores sueltos: ' + r.colores.valores.map(function (e) { return e[0] + ' x' + e[1]; }).join(', ') +
      '\n  Usa var(--token). Si es un caso legitimo, agregalo a EXCEPCIONES en token-map.js con su razon.');
  });

  test(archivo + ': sin font-size fuera de la escala', () => {
    const r = auditar(archivo);
    assert.equal(r.fontSize.malos, 0,
      'font-size sueltos: ' + r.fontSize.valores.map(function (e) { return e[0] + 'px x' + e[1]; }).join(', ') +
      '\n  La escala es --fs-sm/md/base/lg/xl/2xl. Iconos decorativos de un solo uso: FONT_SIZE_EXENTOS.');
  });

  test(archivo + ': sin margin ni gap fuera de la escala', () => {
    const r = auditar(archivo);
    assert.equal(r.espaciado.malos, 0,
      'espaciados sueltos: ' + r.espaciado.valores.map(function (e) { return e[0] + 'px x' + e[1]; }).join(', ') +
      '\n  La escala es --sp-1 a --sp-5 (4/8/12/16/28px).');
  });

  test(archivo + ': todo var() sin fallback apunta a un token que existe', () => {
    const r = auditar(archivo);
    assert.deepEqual(r.tokensNoDefinidos, [],
      'un var(--x) sin fallback que no existe se renderiza como nada, sin error visible');
  });
});

// ── Los tokens nuevos existen de verdad ──────────────────────

test('los 5 tokens nuevos estan definidos en el :root de styles.css', () => {
  const styles = fs.readFileSync(path.join(RAIZ, 'public', 'styles.css'), 'utf8');
  const root = (styles.match(/:root\{[\s\S]*?\}/) || [''])[0];
  assert.ok(root, 'no se encontro el bloque :root');

  M.TOKENS_NUEVOS.forEach(function (t) {
    assert.match(root, new RegExp(t.nombre + '\\s*:\\s*' + t.valor.replace('#', '#')),
                 t.nombre + ' no esta definido con el valor ' + t.valor);
  });
});

test('los tokens nuevos son grises neutros, no slate con tinte azul', () => {
  // El problema de fondo era el cast frio: la paleta slate de Tailwind tiene
  // el azul bastante por encima del rojo (#64748b: r100 b139, +39). Los
  // grises del proyecto son casi neutros. Si alguien "corrige" un token
  // nuevo a un valor de Tailwind, esto lo frena.
  M.TOKENS_NUEVOS.filter(function (t) { return /text-2|muted-l|border-l|surface/.test(t.nombre); })
    .forEach(function (t) {
      const r = parseInt(t.valor.slice(1, 3), 16);
      const b = parseInt(t.valor.slice(5, 7), 16);
      assert.ok(Math.abs(b - r) <= 8,
                t.nombre + ' (' + t.valor + ') tiene tinte: r=' + r + ' b=' + b +
                '. Los grises del proyecto son neutros.');
    });
});

test('cada token nuevo tiene escrita su razon', () => {
  M.TOKENS_NUEVOS.forEach(function (t) {
    assert.ok(t.porque && t.porque.length > 40,
              t.nombre + ' no explica por que existe; sin eso el proximo que lo vea lo borra');
  });
});

// ── El mapa es coherente ─────────────────────────────────────

test('todo destino del mapa explicito es un token que existe', () => {
  const validos = new Set(M.TOKENS_EXISTENTES.concat(M.TOKENS_NUEVOS.map(function (t) { return t.nombre; })));
  Object.entries(M.MAPA_EXPLICITO).forEach(function ([hex, destino]) {
    const destinos = typeof destino === 'string' ? [destino] : Object.values(destino);
    destinos.forEach(function (d) {
      assert.ok(validos.has(d), hex + ' apunta a ' + d + ', que no es un token definido');
    });
  });
});

test('ningun color esta a la vez en el mapa y en las excepciones', () => {
  Object.keys(M.MAPA_EXPLICITO).forEach(function (hex) {
    assert.ok(!M.EXCEPCIONES[hex], hex + ' esta mapeado y exceptuado al mismo tiempo');
  });
});

test('toda excepcion tiene escrita su razon', () => {
  Object.entries(M.EXCEPCIONES).forEach(function ([hex, razon]) {
    assert.ok(razon && razon.length > 10, hex + ' es excepcion sin justificar');
  });
});

test('las escalas de font-size y espaciado apuntan solo a sus tokens', () => {
  Object.values(M.MAPA_FONT_SIZE).forEach(function (t) {
    assert.match(t, /^--fs-(sm|md|base|lg|xl|2xl)$/, t + ' no es un token de la escala tipografica');
  });
  Object.values(M.MAPA_ESPACIADO).forEach(function (t) {
    assert.match(t, /^--sp-[1-5]$/, t + ' no es un token de la escala de espaciado');
  });
});

// ── La heuristica, que es la parte que puede meter la pata ───

test('la heuristica no confunde ambar con rojo', () => {
  // Caso real que aparecio en la migracion: #d97706 ES --warn, y la primera
  // version de la heuristica lo mandaba a --red porque en el naranja
  // tambien r > g > b.
  assert.equal(M.clasificarPorLuminancia('#d97706', 'fondo'), '--warn');
  assert.equal(M.clasificarPorLuminancia('#c2410c', 'texto'), '--warn-d');
  assert.equal(M.clasificarPorLuminancia('#fcd34d', 'fondo'), '--warn');
  // Y que un rojo de verdad siga siendo rojo.
  assert.equal(M.clasificarPorLuminancia('#dc2626', 'texto'), '--red');
  assert.equal(M.clasificarPorLuminancia('#991b1b', 'texto'), '--red-d');
});

test('la heuristica nunca manda un color de texto oscuro a un fondo', () => {
  // Un azul saturado usado como background mapeado a --text-2 dejaria un
  // bloque oscuro donde habia uno claro, o texto blanco sobre casi blanco.
  ['#3b82f6', '#6d5efc', '#4338ca', '#5b21b6'].forEach(function (c) {
    const destino = M.clasificarPorLuminancia(c, 'fondo');
    assert.ok(!/--text/.test(destino), c + ' como fondo fue a ' + destino);
  });
});

test('la heuristica respeta el rol: el mismo gris va distinto en borde y en texto', () => {
  const gris = '#e5e7eb';
  assert.equal(M.clasificarPorLuminancia(gris, 'borde'), '--border-l');
  assert.notEqual(M.clasificarPorLuminancia(gris, 'texto'), '--border');
});

test('resolverColor prioriza el mapa explicito sobre la heuristica', () => {
  const r = M.resolverColor('#64748b', 'texto');
  assert.equal(r.token, '--muted');
  assert.equal(r.via, 'explicito');
});

test('resolverColor devuelve la excepcion sin token para los categoricos', () => {
  const r = M.resolverColor('#1d4ed8', 'texto');
  assert.equal(r.token, null);
  assert.equal(r.via, 'excepcion');
  assert.match(r.razon, /[Cc]ategorico/);
});

test('resolverColor usa el rol cuando el mapa define uno por rol', () => {
  // #c6c7c7 es exactamente --border, pero como color de texto es ilegible:
  // corresponde el gris de hint.
  assert.equal(M.resolverColor('#c6c7c7', 'borde').token, '--border');
  assert.equal(M.resolverColor('#c6c7c7', 'texto').token, '--muted-l');
});

// ── La migracion no rompio el CSS ────────────────────────────

test('collections.css sigue con las llaves balanceadas', () => {
  const s = fs.readFileSync(path.join(RAIZ, 'public', 'collections.css'), 'utf8');
  const abre = (s.match(/\{/g) || []).length;
  const cierra = (s.match(/\}/g) || []).length;
  assert.equal(abre, cierra, 'llaves desbalanceadas: ' + abre + ' vs ' + cierra);
});

test('no quedaron var() malformadas de la migracion', () => {
  const s = fs.readFileSync(path.join(RAIZ, 'public', 'collections.css'), 'utf8');
  assert.equal((s.match(/var\(var\(/g) || []).length, 0, 'hay var(var(');
  assert.equal((s.match(/var\(#/g) || []).length, 0, 'hay var(#hex');
  assert.equal((s.match(/var\((--[a-z0-9-]+),\s*var\(\1\)\)/gi) || []).length, 0,
               'hay var(--x,var(--x)): fallback redundante que dejo la migracion');
});
