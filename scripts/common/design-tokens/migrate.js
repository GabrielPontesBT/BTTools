#!/usr/bin/env node
'use strict';

// ============================================================
// Aplica token-map.js a los archivos del front.
//
// El spec de design-tokens pide explicitamente este camino:
// "Reemplazo mecanico valor->token, verificado con un script de
// comprobacion en vez de edicion manual instancia por instancia,
// para no introducir errores de tipeo".
//
// Uso:
//   node scripts/common/design-tokens/migrate.js --dry-run
//   node scripts/common/design-tokens/migrate.js --aplicar
//
// Con --dry-run (default) no escribe nada: imprime que haria.
// Imprime siempre, aparte, todo lo que resolvio por heuristica,
// que es la parte del mapeo que hay que revisar a ojo.
// ============================================================

const fs = require('fs');
const path = require('path');
const M = require('./token-map');

const RAIZ = path.join(__dirname, '..', '..', '..');

const ARCHIVOS = [
  'public/collections.css',
  'scripts/generar-collections/panel.html',
];

const aplicar = process.argv.includes('--aplicar');

// Rol de una propiedad CSS, para elegir el token correcto.
function rolDe(prop) {
  const p = String(prop).toLowerCase();
  if (p === 'color') return 'texto';
  if (/background/.test(p)) return 'fondo';
  if (/^border(?!-radius)/.test(p) || /-color$/.test(p)) return 'borde';
  if (/shadow/.test(p)) return 'sombra';
  if (/^(fill|stroke)$/.test(p)) return 'svg';
  return 'texto';
}

const heuristicos = [];
const sinResolver = [];

// ── Colores ──────────────────────────────────────────────────
//
// Se reemplaza dentro de cada declaracion completa, no con un replace
// global del hex: el mismo color puede ir a distinto token segun el rol
// (ej. #fecdd3 es --red en borde y --red-l en fondo).
function migrarColores(src, archivo) {
  let cambios = 0;

  const out = src.replace(
    /([a-zA-Z-]+)(\s*:\s*)([^;{}]*?)(?=[;}])/g,
    function (todo, prop, sep, valor) {
      if (!/#[0-9a-fA-F]{3,6}/.test(valor)) return todo;
      const rol = rolDe(prop);

      const nuevoValor = valor.replace(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g, function (hex) {
        const r = M.resolverColor(hex, rol);
        if (!r) { sinResolver.push({ archivo, prop, hex }); return hex; }
        if (!r.token) return hex; // excepcion
        if (r.via === 'heuristico') heuristicos.push({ archivo, prop, rol, hex, token: r.token });
        cambios++;
        return 'var(' + r.token + ')';
      });

      return prop + sep + nuevoValor;
    }
  );

  return { out, cambios };
}

// Un hex que estaba como fallback de un var() se convierte tambien, y si el
// fallback apuntaba al mismo token queda var(--x,var(--x)). Es CSS valido
// pero redundante, asi que se colapsa. Caso real:
// var(--red-l,#fdf3f3) -> var(--red-l,var(--red-l)) -> var(--red-l)
function colapsarFallbacksRedundantes(src) {
  let cambios = 0;
  const out = src.replace(/var\((--[a-z0-9-]+),\s*var\(\1\)\)/gi, function (todo, token) {
    cambios++;
    return 'var(' + token + ')';
  });
  return { out, cambios };
}

// ── font-size ────────────────────────────────────────────────
function migrarFontSize(src) {
  let cambios = 0;
  const out = src.replace(/font-size:(\s*)(\d+)px/gi, function (todo, esp, n) {
    const v = Number(n);
    if (M.FONT_SIZE_EXENTOS.includes(v)) return todo;
    const token = M.MAPA_FONT_SIZE[v];
    if (!token) return todo;
    cambios++;
    return 'font-size:' + esp + 'var(' + token + ')';
  });
  return { out, cambios };
}

// ── margin y gap ─────────────────────────────────────────────
//
// Solo valores de un componente (un unico valor). Los shorthand de varios
// valores (margin:8px 12px) se dejan: mezclarlos con var() en un shorthand
// es donde es mas facil romper algo, y el spec limita el alcance a
// espaciado entre bloques.
function migrarEspaciado(src) {
  let cambios = 0;
  // El fin del valor puede ser ';' o '}' en CSS, pero tambien la comilla que
  // cierra un style="..." en HTML. Sin incluirla, los estilos inline del
  // panel quedaban sin convertir.
  const out = src.replace(
    /\b(margin|margin-top|margin-bottom|margin-left|margin-right|gap|row-gap|column-gap):(\s*)(\d+)px(?=\s*(?:[;}"']|$))/gim,
    function (todo, prop, esp, n) {
      const v = Number(n);
      if (M.ESPACIADO_EXENTOS.includes(v)) return todo;
      const token = M.MAPA_ESPACIADO[v];
      if (!token) return todo;
      cambios++;
      return prop + ':' + esp + 'var(' + token + ')';
    }
  );
  return { out, cambios };
}

// ── Tokens nuevos en :root ───────────────────────────────────
function agregarTokensNuevos(src) {
  const faltan = M.TOKENS_NUEVOS.filter(function (t) {
    return !new RegExp('(^|[;{\\s])' + t.nombre + '\\s*:').test(src);
  });
  if (!faltan.length) return { out: src, cambios: 0 };

  const bloque = faltan.map(function (t) { return t.nombre + ':' + t.valor; }).join(';');
  const marca = '--sp-1:4px;--sp-2:8px;--sp-3:12px;--sp-4:16px;--sp-5:28px';
  if (src.indexOf(marca) < 0) {
    throw new Error('No encontre el bloque de spacing en :root de styles.css para anclar los tokens nuevos');
  }
  const comentario =
    '\n  /* Agregados para unificar el front del builder de Collections, que usaba\n' +
    '     la paleta slate de Tailwind (con tinte azul) en vez de los grises\n' +
    '     neutros del proyecto. El porque de cada uno esta en\n' +
    '     scripts/common/design-tokens/token-map.js */\n  ';
  const out = src.replace(marca, marca + ';' + comentario + bloque);
  return { out, cambios: faltan.length };
}

// ── Main ─────────────────────────────────────────────────────

console.log('\n=== MIGRACION A TOKENS ===');
console.log(aplicar ? 'modo: APLICAR (escribe los archivos)\n' : 'modo: dry-run (no escribe nada)\n');

// 1. styles.css: solo se le agregan los tokens nuevos.
const rutaStyles = path.join(RAIZ, 'public', 'styles.css');
const styles = fs.readFileSync(rutaStyles, 'utf8');
const conTokens = agregarTokensNuevos(styles);
console.log('public/styles.css');
console.log('  tokens nuevos agregados a :root: ' + conTokens.cambios);
M.TOKENS_NUEVOS.forEach(function (t) {
  console.log('    ' + t.nombre.padEnd(11) + t.valor + '  (lum ' + t.lum + ')');
});
if (aplicar && conTokens.cambios) fs.writeFileSync(rutaStyles, conTokens.out, 'utf8');

// 2. Los archivos del builder.
let totalColor = 0, totalFs = 0, totalSp = 0;
ARCHIVOS.forEach(function (rel) {
  const ruta = path.join(RAIZ, rel);
  let src = fs.readFileSync(ruta, 'utf8');

  const c = migrarColores(src, rel); src = c.out;
  const k = colapsarFallbacksRedundantes(src); src = k.out;
  const f = migrarFontSize(src);     src = f.out;
  const s = migrarEspaciado(src);    src = s.out;

  totalColor += c.cambios; totalFs += f.cambios; totalSp += s.cambios;

  console.log('\n' + rel);
  console.log('  colores    -> token: ' + c.cambios);
  console.log('  font-size  -> token: ' + f.cambios);
  console.log('  espaciados -> token: ' + s.cambios);
  if (k.cambios) console.log('  fallbacks redundantes colapsados: ' + k.cambios);

  if (aplicar) fs.writeFileSync(ruta, src, 'utf8');
});

console.log('\n--- TOTALES ---');
console.log('  colores: ' + totalColor + ' | font-size: ' + totalFs + ' | espaciado: ' + totalSp);

// Lo resuelto por heuristica se lista completo: es la parte a revisar.
const porHeuristica = {};
heuristicos.forEach(function (h) {
  const k = h.hex + ' (' + h.rol + ') -> ' + h.token;
  porHeuristica[k] = (porHeuristica[k] || 0) + 1;
});
const claves = Object.keys(porHeuristica).sort(function (a, b) { return porHeuristica[b] - porHeuristica[a]; });
console.log('\n--- resueltos por heuristica (' + heuristicos.length + ' instancias, ' + claves.length + ' casos) ---');
console.log('    Estos NO estan en el mapa explicito: revisar que el destino tenga sentido.');
claves.forEach(function (k) { console.log('    x' + String(porHeuristica[k]).padStart(3) + '  ' + k); });

if (sinResolver.length) {
  console.log('\n--- SIN RESOLVER (' + sinResolver.length + ') ---');
  [...new Set(sinResolver.map(function (s) { return s.hex; }))].forEach(function (h) { console.log('    ' + h); });
}

console.log('');
if (!aplicar) console.log('Para aplicar: node scripts/common/design-tokens/migrate.js --aplicar\n');
