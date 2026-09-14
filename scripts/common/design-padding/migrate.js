#!/usr/bin/env node
'use strict';

// ============================================================
// Aplica pad-map.js a los 4 archivos del front.
//
// Uso:
//   node scripts/common/design-padding/migrate.js --dry-run
//   node scripts/common/design-padding/migrate.js --aplicar
//
// A diferencia de los dos pases anteriores, este toca las 6
// herramientas: el padding no era una divergencia del builder, era
// una dispersion de toda la app. Por eso la verificacion que manda
// no es este script sino la pasada visual de los 6 flujos, y por
// eso el spec la presupuesto como parte del trabajo.
// ============================================================

const fs = require('fs');
const path = require('path');
const M = require('./pad-map');

const RAIZ = path.join(__dirname, '..', '..', '..');
const STYLES = 'public/styles.css';
const ARCHIVOS = [STYLES, 'public/collections.css', 'public/index.html', 'public/wizard-doc.js'];

// Los archivos del front estan en CRLF. Escribirlos en LF marca cada linea
// como modificada y vuelve ilegible el diff justo cuando mas hay que
// revisarlo (mismo cuidado que en design-shape).
function leer(ruta) {
  const crudo = fs.readFileSync(ruta, 'utf8');
  return { texto: crudo.replace(/\r\n/g, '\n'), crlf: crudo.indexOf('\r\n') >= 0 };
}
function escribir(ruta, texto, crlf) {
  fs.writeFileSync(ruta, crlf ? texto.replace(/\n/g, '\r\n') : texto, 'utf8');
}

const cambios = { renombre: 0, root: 0, componentes: 0, exentos: 0, quietos: 0 };
const detalle = { movidos: [], exentos: [], grandes: [] };

// -- 1. Renombre de --sp-5 -------------------------------------
//
// --sp-5 valia 28px y en la escala nueva vale 20px. Los usos existentes
// apuntan al 28, asi que pasan a --sp-7 ANTES de redefinir el :root.
//
// El renombre es CONDICIONAL: solo corre mientras styles.css todavia declare
// "--sp-5:28px". Sin esa guarda el pase no seria idempotente -- en la segunda
// corrida se llevaria por delante los --sp-5 legitimos que ahora valen 20px.
function necesitaRenombre(styles) {
  return new RegExp(M.RENOMBRE.de + '\\s*:\\s*' + M.RENOMBRE.valorViejo).test(styles);
}

function renombrarUsos(src) {
  return src.replace(new RegExp('var\\(' + M.RENOMBRE.de + '\\)', 'g'), function () {
    cambios.renombre++;
    return 'var(' + M.RENOMBRE.a + ')';
  });
}

function redefinirRoot(styles) {
  const viejo = '--sp-1:4px;--sp-2:8px;--sp-3:12px;--sp-4:16px;--sp-5:28px';
  if (styles.indexOf(viejo) < 0) {
    throw new Error('No encontre el bloque de spacing en :root de styles.css con la forma esperada');
  }
  const nuevo = M.ESCALA.map(function (e) { return e.token + ':' + e.valor + 'px'; }).join(';');
  cambios.root = 2; // --sp-6 y --sp-7 nuevos; --sp-5 cambia de valor
  return styles.replace(viejo, nuevo);
}

// -- 2. El padding ---------------------------------------------

// Que eje ocupa cada componente de un shorthand, segun cuantos valores tenga.
// padding:a         -> a es los cuatro
// padding:a b       -> a vertical, b horizontal
// padding:a b c     -> a y c vertical, b horizontal
// padding:a b c d   -> a y c vertical, b y d horizontal
function ejesDe(cantidad) {
  if (cantidad === 1) return ['ambos'];
  if (cantidad === 2) return ['vertical', 'horizontal'];
  if (cantidad === 3) return ['vertical', 'horizontal', 'vertical'];
  return ['vertical', 'horizontal', 'vertical', 'horizontal'];
}

function ejeDeLonghand(prop) {
  if (/-(top|bottom|block)/.test(prop)) return 'vertical';
  if (/-(left|right|inline)/.test(prop)) return 'horizontal';
  return 'ambos';
}

/**
 * Migra una declaracion de padding. Devuelve el valor nuevo, o el mismo si
 * no cambia. Cualquier componente que no sea un px pelado (0, auto, %, vw,
 * calc(), var()) se conserva tal cual: no es un valor de la escala.
 */
function migrarDeclaracion(prop, valor, selector, archivo) {
  const partes = valor.trim().split(/\s+/);
  const ejes = /^padding$/.test(prop) ? ejesDe(partes.length) : partes.map(function () { return ejeDeLonghand(prop); });

  return partes.map(function (p, i) {
    const m = /^(\d+)px$/.exec(p);
    if (!m) return p;
    const v = Number(m[1]);
    if (v === 0) return p;

    const eje = ejes[i] === 'ambos' ? 'horizontal' : ejes[i];

    const exento = M.exencionDe(selector, eje, v) ||
      (ejes[i] === 'ambos' ? M.exencionDe(selector, 'vertical', v) : null);
    if (exento) {
      cambios.exentos++;
      detalle.exentos.push(selector.slice(0, 44) + '  ' + prop + ': ' + p);
      return p;
    }

    const paso = M.resolverPaso(v, eje, selector);
    // Un valor que YA esta en la escala igual se escribe como token: si queda
    // como literal, el archivo audita limpio y sigue teniendo 252 paddings en
    // px sueltos, que es de donde sale el proximo valor a ojo.
    if (paso === v) { cambios.quietos++; return 'var(' + M.TOKEN_DE[paso] + ')'; }

    cambios.componentes++;
    const linea = v + 'px -> ' + paso + 'px (' + eje + ')';
    detalle.movidos.push(linea);
    if (Math.abs(paso - v) > 2) {
      detalle.grandes.push(archivo.replace('public/', '') + '  ' + selector.slice(0, 44) + '  ' + prop + ': ' + v + 'px -> ' + paso + 'px');
    }
    return 'var(' + M.TOKEN_DE[paso] + ')';
  }).join(' ');
}

// El padding aparece en reglas CSS y tambien en atributos style="..." del HTML
// y en template strings del JS. Por eso el corte del valor acepta ; } " ' ` y
// fin de linea, no solo los dos primeros.
const RE_DECL = /(padding(?:-top|-bottom|-left|-right|-block|-inline)?)(\s*:\s*)([^;}"'`\n]+)/g;

// Selector de la regla CSS en la que cae una posicion del archivo. En HTML/JS
// (style inline) no hay selector, y ahi ninguna exencion ni regla por rol
// aplica: son estilos sueltos, se resuelven por numero.
function selectorEn(src, pos) {
  const abre = src.lastIndexOf('{', pos);
  if (abre < 0) return '';
  const cierraAntes = src.lastIndexOf('}', pos);
  if (cierraAntes > abre) return '';
  const inicio = Math.max(src.lastIndexOf('}', abre), src.lastIndexOf('{', abre - 1)) + 1;
  return src.slice(inicio, abre).replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/\s+/g, ' ');
}

function migrarPadding(src, archivo) {
  return src.replace(RE_DECL, function (todo, prop, sep, valor, offset) {
    if (/var\(|calc\(|%|vw|vh|em|rem|auto|inherit|initial/.test(valor)) {
      // Puede tener un px pelado mezclado (padding:28px 8vw var(--sp-5)): se
      // migran los componentes px y se dejan los otros intactos.
      if (!/\b\d+px\b/.test(valor)) return todo;
    }
    const selector = /\.css$/.test(archivo) ? selectorEn(src, offset) : '';
    const nuevo = migrarDeclaracion(prop, valor, selector, archivo);
    return nuevo === valor.trim() ? todo : prop + sep + nuevo;
  });
}

// -- 2b. El fallback de un var() dentro de un padding ----------
//
// `padding:0 var(--builder-control-padding-x,12px)`: el 12px solo se usa si la
// var no esta definida, asi que casi nunca se renderiza. Pero es un valor de
// padding escrito en el archivo, y si queda fuera de la escala es de donde sale
// el proximo valor copiado a ojo. Entra por el eje que le corresponde a la
// posicion, igual que cualquier otro componente.
function migrarFallbacks(src) {
  return src.replace(/(padding[a-z-]*\s*:\s*)([^;}"'`\n]+)/g, function (todo, pre, valor) {
    if (!/var\([^)]*,\s*\d+px\s*\)/.test(valor)) return todo;
    const nuevo = valor.replace(/var\((--[a-z0-9-]+)\s*,\s*(\d+)px\s*\)/g, function (v, nombre, n) {
      const eje = M.RE_VAR_VERTICAL.test(nombre) ? 'vertical' : 'horizontal';
      const paso = M.resolverPaso(Number(n), eje, '');
      if (paso === Number(n)) { cambios.quietos++; } else {
        cambios.componentes++;
        detalle.movidos.push(n + 'px -> ' + paso + 'px (' + eje + ', fallback de var)');
      }
      return 'var(' + nombre + ',var(' + M.TOKEN_DE[paso] + '))';
    });
    return nuevo === valor ? todo : pre + nuevo;
  });
}

// -- 3. Padding escondido en una custom property ---------------
//
// Mismo punto ciego que tenia la escala tipografica. Ver pad-map.js.
function migrarPaddingEnVars(src) {
  const usadas = M.varsUsadasComoPadding(src);
  return src.replace(/(--[a-z0-9-]+)(\s*:\s*)(\d+)px(?=\s*[;}])/g, function (todo, nombre, sep, n) {
    if (!usadas.has(nombre)) return todo;
    if (M.esTokenDeEscala(nombre)) return todo; // nunca redefinir la escala sobre si misma
    if (M.VARS_EXENTAS[nombre]) { cambios.exentos++; detalle.exentos.push(nombre + ': ' + n + 'px'); return todo; }
    const eje = M.RE_VAR_VERTICAL.test(nombre) ? 'vertical' : 'horizontal';
    const v = Number(n);
    const paso = M.resolverPaso(v, eje, '');
    if (paso === v) { cambios.quietos++; return nombre + sep + 'var(' + M.TOKEN_DE[paso] + ')'; }
    cambios.componentes++;
    detalle.movidos.push(v + 'px -> ' + paso + 'px (' + eje + ', en var)');
    if (Math.abs(paso - v) > 2) detalle.grandes.push('  ' + nombre + ': ' + v + 'px -> ' + paso + 'px');
    return nombre + sep + 'var(' + M.TOKEN_DE[paso] + ')';
  });
}

function migrarArchivo(texto, archivo, conRenombre) {
  let out = texto;
  if (conRenombre) out = renombrarUsos(out);
  out = migrarPadding(out, archivo);
  out = migrarFallbacks(out);
  out = migrarPaddingEnVars(out);
  return out;
}

module.exports = { migrarArchivo, migrarPadding, migrarFallbacks, migrarPaddingEnVars, renombrarUsos, redefinirRoot, necesitaRenombre, cambios, detalle, selectorEn };

// -- CLI -------------------------------------------------------
if (require.main === module) {
  const aplicar = process.argv.includes('--aplicar');
  console.log('\n=== MIGRACION DE PADDING A LA ESCALA ===');
  console.log(aplicar ? 'modo: APLICAR (escribe los archivos)\n' : 'modo: dry-run (no escribe nada)\n');

  const styles = leer(path.join(RAIZ, STYLES));
  const renombrar = necesitaRenombre(styles.texto);
  console.log('escala destino: ' + M.ESCALA.map(function (e) { return e.token + '=' + e.valor; }).join('  '));
  console.log('renombre --sp-5 -> --sp-7: ' + (renombrar ? 'SI (el :root todavia tiene la forma vieja)' : 'ya hecho'));
  console.log('');

  const salidas = {};
  ARCHIVOS.forEach(function (rel) {
    const f = leer(path.join(RAIZ, rel));
    const antes = { r: cambios.renombre, c: cambios.componentes, e: cambios.exentos, q: cambios.quietos };
    let out = migrarArchivo(f.texto, rel, renombrar);
    if (rel === STYLES && renombrar) out = redefinirRoot(out);
    salidas[rel] = { out, crlf: f.crlf };
    console.log(rel.padEnd(24) +
      'mueve:' + String(cambios.componentes - antes.c).padStart(4) +
      '  ya en escala:' + String(cambios.quietos - antes.q).padStart(4) +
      '  exentos:' + String(cambios.exentos - antes.e).padStart(3) +
      '  renombres:' + String(cambios.renombre - antes.r).padStart(3));
  });

  console.log('\n--- TOTALES ---');
  console.log('  componentes movidos : ' + cambios.componentes);
  console.log('  ya estaban en escala: ' + cambios.quietos);
  console.log('  exentos (geometria) : ' + cambios.exentos);
  console.log('  var(--sp-5)->(--sp-7): ' + cambios.renombre);

  const resumen = function (lista) {
    const c = {};
    lista.forEach(function (d) { c[d] = (c[d] || 0) + 1; });
    return Object.entries(c).sort(function (a, b) { return b[1] - a[1]; });
  };
  console.log('\n--- que se movio ---');
  resumen(detalle.movidos).forEach(function (e) { console.log('    x' + String(e[1]).padStart(3) + '  ' + e[0]); });

  if (detalle.grandes.length) {
    console.log('\n--- los que se mueven mas de 2px (mirar a ojo) ---');
    [...new Set(detalle.grandes)].forEach(function (d) { console.log('    ' + d); });
  }
  if (detalle.exentos.length) {
    console.log('\n--- exentos por geometria ---');
    [...new Set(detalle.exentos)].forEach(function (d) { console.log('    ' + d); });
  }

  if (aplicar) {
    ARCHIVOS.forEach(function (rel) {
      escribir(path.join(RAIZ, rel), salidas[rel].out, salidas[rel].crlf);
    });
    console.log('\nescritos los ' + ARCHIVOS.length + ' archivos.');
  } else {
    console.log('\nPara aplicar: node scripts/common/design-padding/migrate.js --aplicar\n');
  }
}
