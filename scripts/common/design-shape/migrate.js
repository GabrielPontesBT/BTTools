#!/usr/bin/env node
'use strict';

// ============================================================
// Aplica shape-map.js a public/collections.css.
//
// Mismo camino que el pase de color (scripts/common/design-tokens/):
// reemplazo mecanico valor->token verificado por un script, en vez de
// edicion manual instancia por instancia. 47 sombras, 19 radios y 73
// font-weight a mano es donde se cometen errores de tipeo.
//
// Uso:
//   node scripts/common/design-shape/migrate.js --dry-run
//   node scripts/common/design-shape/migrate.js --aplicar
//
// Con --dry-run (default) no escribe nada: imprime que haria.
// La migracion es idempotente: correrla de nuevo no cambia nada.
// ============================================================

const fs = require('fs');
const path = require('path');
const M = require('./shape-map');

const RAIZ = path.join(__dirname, '..', '..', '..');
const ARCHIVO = 'public/collections.css';
const STYLES = 'public/styles.css';

// -- Parseo de reglas -----------------------------------------
//
// No hace falta un parser CSS completo: la expresion agarra siempre la
// regla mas interna, asi que las que estan dentro de un @media entran
// igual y el "@media (...)" de afuera nunca matchea (su cuerpo contiene
// llaves, y [^{}]* las excluye).
const RE_REGLA = /([^{}]+)\{([^{}]*)\}/g;

/**
 * Recorre el CSS regla por regla y deja que `transformar(selector, cuerpo)`
 * devuelva el cuerpo nuevo. Todo lo que no se toca se conserva byte a byte.
 */
function porRegla(css, transformar) {
  return css.replace(RE_REGLA, function (todo, selector, cuerpo) {
    const nuevo = transformar(selector, cuerpo);
    return nuevo === cuerpo ? todo : selector + '{' + nuevo + '}';
  });
}

// Los archivos del front estan guardados con CRLF. Si se escriben con LF, git
// marca las ~1500 lineas del archivo como modificadas y el diff de la
// migracion se vuelve ilegible justo cuando mas hay que revisarlo. Se
// normaliza a LF para procesar y se restaura el final de linea original.
function leer(ruta) {
  const crudo = fs.readFileSync(ruta, 'utf8');
  return { texto: crudo.replace(/\r\n/g, '\n'), crlf: crudo.indexOf('\r\n') >= 0 };
}

function escribir(ruta, texto, crlf) {
  fs.writeFileSync(ruta, crlf ? texto.replace(/\n/g, '\r\n') : texto, 'utf8');
}

// -- Los pases ------------------------------------------------

const cambios = {
  radio: 0, sombra: 0, peso: 0, tracking: 0, alto: 0, borde: 0, vars: 0, muertas: 0, rgba: 0,
};
const detalle = { radio: [], sombra: [], alto: [], borde: [], rgba: [], peso: [] };

function migrarRadio(selector, cuerpo) {
  return cuerpo.replace(/(border-radius\s*:\s*)([^;]+)/g, function (todo, pre, valor) {
    const destino = M.resolverRadio(valor, selector, cuerpo);
    if (!destino) return todo;
    cambios.radio++;
    detalle.radio.push(valor.trim() + ' -> ' + destino);
    return pre + destino;
  });
}

function migrarSombra(selector, cuerpo) {
  return cuerpo.replace(/(box-shadow\s*:\s*)([^;]+)/g, function (todo, pre, valor) {
    const destino = M.resolverSombra(valor, selector);
    if (!destino) return todo;
    cambios.sombra++;
    detalle.sombra.push(valor.trim() + '  ->  ' + destino + '   [' + selector.trim().split(',')[0].slice(0, 46) + ']');
    return pre + destino;
  });
}

function migrarPeso(selector, cuerpo) {
  return cuerpo.replace(/(font-weight\s*:\s*)(\d+)/g, function (todo, pre, peso) {
    const destino = M.resolverPeso(peso, selector);
    if (!destino) return todo;
    cambios.peso++;
    detalle.peso.push(peso + ' -> ' + destino + '   [' + selector.trim().split(',')[0].slice(0, 46) + ']');
    return pre + destino;
  });
}

// El tracking solo se unifica en las reglas que efectivamente ponen
// mayusculas: un letter-spacing en minuscula (el -2px del logo, el .01em de
// un titulo) es otra cosa y no entra en el spec del micro-label.
function migrarTracking(selector, cuerpo) {
  if (!/text-transform\s*:\s*uppercase/.test(cuerpo)) return cuerpo;
  return cuerpo.replace(/(letter-spacing\s*:\s*)([^;]+)/g, function (todo, pre, valor) {
    if (valor.trim() === M.TRACKING_MAYUSCULA) return todo;
    cambios.tracking++;
    return pre + M.TRACKING_MAYUSCULA;
  });
}

function migrarAlto(selector, cuerpo) {
  if (!M.esSelectorDeControl(selector)) return cuerpo;
  return cuerpo.replace(/(^|;)(\s*(?:min-)?height\s*:\s*)([^;]+)/g, function (todo, sep, pre, valor) {
    if (!M.ALTOS_A_TOKEN.includes(valor.trim())) return todo;
    cambios.alto++;
    detalle.alto.push(selector.trim() + ': ' + valor.trim() + ' -> var(--ctrl-h)');
    return sep + pre + 'var(--ctrl-h)';
  });
}

// Dos reglas distintas sobre el mismo shorthand:
//
// 1. Los inputs de la lista explicita de shape-map.js van a 1.5px + --border,
//    el borde con el que el proyecto marca un campo editable (.field input).
// 2. Cualquier otra CAJA sube de 1px a 1.5px y conserva su tono. Los
//    border-top/bottom/left/right no entran: son separadores, y ahi los dos
//    archivos ya coinciden en 1px.
function migrarBordeDeInput(selector, cuerpo) {
  const normalizado = selector.trim().replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ');
  const esInput = M.INPUTS.includes(normalizado);

  return cuerpo.replace(/(^|;)(\s*border\s*:\s*)([\d.]+px)(\s+[a-z]+\s+)([^;]+)/g,
    function (todo, sep, pre, ancho, estilo, color) {
      if (ancho !== M.BORDE_CAJA.de) return todo;
      cambios.borde++;
      const destino = esInput ? 'var(--border)' : color;
      detalle.borde.push(normalizado.split(',')[0].slice(0, 52) +
        (esInput ? '   (input: tambien el tono)' : ''));
      return sep + pre + M.BORDE_CAJA.a + estilo + destino;
    });
}

// El tinte de los rgba() se neutraliza en TODO el archivo, no solo en las
// sombras: los scrims y los degrades de fondo tenian la misma base slate.
function migrarRgba(css) {
  // resolverRgba ya recorre todos los rgba() del texto que recibe, asi que se
  // le pasa el archivo entero; lo que se cuenta aca es cuantos cambio.
  const antes = css.match(/rgba?\([^)]*\)/gi) || [];
  const out = M.resolverRgba(css);
  if (!out) return css;
  const despues = out.match(/rgba?\([^)]*\)/gi) || [];
  antes.forEach(function (v, i) {
    if (despues[i] !== v) {
      cambios.rgba++;
      detalle.rgba.push(v + ' -> ' + despues[i]);
    }
  });
  return out;
}

// -- Variables del builder ------------------------------------

// Toda custom property "--algo-radius" guarda un radio y va a la misma escala.
// Se resuelve con la regla de los literales, pero SIN selector: una variable no
// tiene rol de control, asi que cae siempre en el radio de superficie (--r).
function migrarVarsDeRadio(css) {
  return css.replace(/(--[a-z0-9-]*-radius\s*:\s*)([^;}]+)/gi, function (todo, pre, valor) {
    const nombre = pre.split(':')[0].trim();
    if (!M.RE_VAR_RADIO.test(nombre)) return todo;
    const destino = M.resolverRadio(valor, '', '');
    if (!destino) return todo;
    cambios.vars++;
    detalle.radio.push(nombre + ': ' + valor.trim() + ' -> ' + destino);
    return pre + destino;
  });
}

function reanclarVars(css) {
  let out = css;
  Object.keys(M.VARS_REANCLADAS).forEach(function (nombre) {
    const regla = M.VARS_REANCLADAS[nombre];
    regla.de.forEach(function (valor) {
      const re = new RegExp('(' + nombre + '\\s*:\\s*)' + valor.replace('.', '\\.') + '\\b', 'g');
      out = out.replace(re, function (todo, pre) {
        cambios.vars++;
        return pre + regla.a;
      });
    });
  });
  return out;
}

// Borra la declaracion y, si quedo, el salto de linea y la indentacion que
// la precedian. Sin eso el bloque queda con lineas en blanco sueltas.
function borrarVarsMuertas(css) {
  let out = css;
  M.VARS_MUERTAS.forEach(function (nombre) {
    const re = new RegExp('\\n?[ \\t]*' + nombre + '\\s*:[^;}]*;?', 'g');
    out = out.replace(re, function () { cambios.muertas++; return ''; });
  });
  return out;
}

// -- Tokens nuevos en :root -----------------------------------

function agregarTokensNuevos(src) {
  const faltan = M.TOKENS_NUEVOS.filter(function (t) {
    return !new RegExp('(^|[;{\\s])' + t.nombre + '\\s*:').test(src);
  });
  if (!faltan.length) return { out: src, cambios: 0 };

  // Se anclan al bloque que agrego el pase de color, para que los dos pases
  // de unificacion queden juntos y se lean como lo que son: la misma decision.
  const marca = '--text-2:#47494a;--muted-l:#9fa1a2;--border-l:#e3e4e4;--surface:#fafafa;--red-d:#9e2423';
  if (src.indexOf(marca) < 0) {
    throw new Error('No encontre el bloque de tokens del pase de color en :root de styles.css');
  }
  const comentario =
    ';\n  /* Segundo pase de unificacion del builder: FORMA (radio, elevacion, foco).\n' +
    '     El pase de color dejo el archivo en 0 valores sueltos y la herramienta\n' +
    '     seguia viendose de otra app, porque tenia 47 sombras con tinte slate y\n' +
    '     19 radios distintos. El porque de cada token esta en\n' +
    '     scripts/common/design-shape/shape-map.js */\n  ';
  const bloque = faltan.map(function (t) { return t.nombre + ':' + t.valor; }).join(';');
  const out = src.replace(marca, marca + comentario + bloque);
  return { out, cambios: faltan.length };
}

// -- Main -----------------------------------------------------

function migrarCss(css) {
  let out = css;
  out = porRegla(out, function (selector, cuerpo) {
    let c = cuerpo;
    c = migrarRadio(selector, c);
    c = migrarSombra(selector, c);
    c = migrarPeso(selector, c);
    c = migrarTracking(selector, c);
    c = migrarAlto(selector, c);
    c = migrarBordeDeInput(selector, c);
    return c;
  });
  out = migrarRgba(out);
  out = migrarVarsDeRadio(out);
  out = reanclarVars(out);
  out = borrarVarsMuertas(out);
  return out;
}

module.exports = { migrarCss, agregarTokensNuevos, cambios };

// -- CLI ------------------------------------------------------
if (require.main === module) {
  const aplicar = process.argv.includes('--aplicar');

  console.log('\n=== MIGRACION DE FORMA A TOKENS ===');
  console.log(aplicar ? 'modo: APLICAR (escribe los archivos)\n' : 'modo: dry-run (no escribe nada)\n');

  const rutaStyles = path.join(RAIZ, STYLES);
  const styles = leer(rutaStyles);
  const conTokens = agregarTokensNuevos(styles.texto);
  console.log(STYLES);
  console.log('  tokens nuevos agregados a :root: ' + conTokens.cambios);
  M.TOKENS_NUEVOS.forEach(function (t) {
    console.log('    ' + t.nombre.padEnd(12) + t.valor);
  });
  if (aplicar && conTokens.cambios) escribir(rutaStyles, conTokens.out, styles.crlf);

  const ruta = path.join(RAIZ, ARCHIVO);
  const antes = leer(ruta);
  const despues = migrarCss(antes.texto);

  console.log('\n' + ARCHIVO);
  console.log('  border-radius -> token : ' + cambios.radio);
  console.log('  box-shadow    -> token : ' + cambios.sombra);
  console.log('  font-weight por rol     : ' + cambios.peso);
  console.log('  tracking de mayusculas : ' + cambios.tracking);
  console.log('  alto de control        : ' + cambios.alto);
  console.log('  borde de input         : ' + cambios.borde);
  console.log('  tinte de rgba()        : ' + cambios.rgba);
  console.log('  vars del builder re-ancladas: ' + cambios.vars);
  console.log('  declaraciones muertas borradas: ' + cambios.muertas);

  if (detalle.alto.length) {
    console.log('\n  --- alto de control ---');
    detalle.alto.forEach(function (d) { console.log('    ' + d); });
  }
  if (detalle.borde.length) {
    console.log('\n  --- borde de input ---');
    detalle.borde.forEach(function (d) { console.log('    ' + d); });
  }

  const resumen = function (lista) {
    const c = {};
    lista.forEach(function (d) { c[d] = (c[d] || 0) + 1; });
    return Object.entries(c).sort(function (a, b) { return b[1] - a[1]; });
  };
  console.log('\n  --- radios ---');
  resumen(detalle.radio).forEach(function (e) { console.log('    x' + String(e[1]).padStart(3) + '  ' + e[0]); });
  console.log('\n  --- sombras ---');
  resumen(detalle.sombra).forEach(function (e) { console.log('    x' + String(e[1]).padStart(3) + '  ' + e[0]); });

  if (aplicar) escribir(ruta, despues, antes.crlf);

  console.log('');
  if (!aplicar) console.log('Para aplicar: node scripts/common/design-shape/migrate.js --aplicar\n');
}
