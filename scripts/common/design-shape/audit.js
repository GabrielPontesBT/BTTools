'use strict';

// ============================================================
// Verifica que no queden valores de FORMA sueltos en el front
// del builder. Es el gate del pase de shape-map.js, igual que
// scripts/common/design-tokens/audit.js lo es del pase de color:
// sin esto la unificacion se desarma sola con el proximo cambio,
// porque escribir "border-radius:16px" es mas facil que buscar
// cual es el token.
//
// Se usa desde audit.test.js (gate) y desde la linea de comandos:
//   node scripts/common/design-shape/audit.js
// ============================================================

const fs = require('fs');
const path = require('path');
const M = require('./shape-map');

const RAIZ = path.join(__dirname, '..', '..', '..');

const ARCHIVOS_VIGILADOS = ['public/collections.css'];

const RE_REGLA = /([^{}]+)\{([^{}]*)\}/g;

function reglasDe(css) {
  const reglas = [];
  let m;
  const re = new RegExp(RE_REGLA.source, 'g');
  while ((m = re.exec(css))) {
    reglas.push({ selector: m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/\s+/g, ' '), cuerpo: m[2] });
  }
  return reglas;
}

function declaraciones(cuerpo, prop) {
  const re = new RegExp('(?:^|;)\\s*' + prop + '\\s*:\\s*([^;]+)', 'g');
  const out = [];
  let m;
  while ((m = re.exec(cuerpo))) out.push(m[1].trim());
  return out;
}

// Un radio valido es un token, un circulo, o cero. Un shorthand de varias
// esquinas vale si cada componente vale.
function radioValido(valor) {
  return String(valor).trim().split(/\s+/).every(function (p) {
    return /^var\(--[a-z0-9-]+\)$/.test(p) || p === '50%' || p === '0' || p === '0px';
  });
}

// Una sombra valida es apagarla, un token, o una combinacion de tokens.
// Se permite una inset que use un token de color: es un borde interior, no
// elevacion, y el color ya esta tokenizado.
function sombraValida(valor) {
  const v = String(valor).trim();
  if (v === 'none' || v === 'none !important') return true;
  if (/^inset\b/.test(v)) return !/#[0-9a-f]{3,8}\b|rgba?\(/i.test(v);
  return M.capasDe(v).every(function (capa) {
    return /^var\(--(shadow|shadow-sm|shadow-md|ring)\)$/.test(capa.trim());
  });
}

// El blanco y el negro puros quedan libres, igual que en el pase de color:
// no son un tinte de marca, son la ausencia de tinte.
function rgbaNeutro(valor) {
  const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(valor);
  if (!m) return true;
  const base = m[1] + ',' + m[2] + ',' + m[3];
  if (M.MAPA_RGBA[base]) return false;
  const r = Number(m[1]), g = Number(m[2]), b = Number(m[3]);
  // Un gris es neutro si los tres canales estan cerca. El tinte que se colaba
  // (slate-900 = 15,23,42) tiene 27 puntos de spread; los neutros del proyecto
  // (18,20,24) tienen 6.
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  if (spread <= 8) return true;
  // Un color de marca declarado como token tambien vale: --red (196,46,44) y
  // --warn (217,119,6) se usan como base de rgba en acentos.
  const marcas = ['196,46,44', '217,119,6', '5,150,105'];
  return marcas.indexOf(base) >= 0;
}

function auditar(rutaRel) {
  const abs = path.join(RAIZ, rutaRel);
  const src = fs.readFileSync(abs, 'utf8');
  const reglas = reglasDe(src);

  const radios = [];
  const sombras = [];
  const pesos = [];
  const altos = [];
  const trackings = [];

  reglas.forEach(function (r) {
    declaraciones(r.cuerpo, 'border-radius').forEach(function (v) {
      if (!radioValido(v)) radios.push(r.selector + ' -> ' + v);
    });
    declaraciones(r.cuerpo, 'box-shadow').forEach(function (v) {
      if (!sombraValida(v)) sombras.push(r.selector + ' -> ' + v);
    });
    declaraciones(r.cuerpo, 'font-weight').forEach(function (v) {
      if (Number(v) > 700) pesos.push(r.selector + ' -> ' + v);
    });
    if (M.esSelectorDeControl(r.selector)) {
      declaraciones(r.cuerpo, 'height').concat(declaraciones(r.cuerpo, 'min-height')).forEach(function (v) {
        if (M.ALTOS_A_TOKEN.indexOf(v) >= 0) altos.push(r.selector + ' -> ' + v);
      });
    }
    if (/text-transform\s*:\s*uppercase/.test(r.cuerpo)) {
      declaraciones(r.cuerpo, 'letter-spacing').forEach(function (v) {
        if (v !== M.TRACKING_MAYUSCULA) trackings.push(r.selector + ' -> ' + v);
      });
    }
  });

  // Las custom properties "-radius" tienen que estar en la misma escala.
  const varsRadio = [];
  [...src.matchAll(/(--[a-z0-9-]*-radius)\s*:\s*([^;}]+)/gi)].forEach(function (m) {
    if (M.RE_VAR_RADIO.test(m[1]) && !radioValido(m[2])) varsRadio.push(m[1] + ': ' + m[2].trim());
  });

  // rgba() con tinte ajeno, en cualquier propiedad (sombra, fondo, scrim).
  const tintes = [];
  [...src.matchAll(/rgba?\([^)]*\)/gi)].forEach(function (m) {
    if (!rgbaNeutro(m[0])) tintes.push(m[0]);
  });

  return {
    archivo: rutaRel,
    radios, sombras, pesos, altos, trackings, varsRadio, tintes,
    total: radios.length + sombras.length + pesos.length + altos.length +
           trackings.length + varsRadio.length + tintes.length,
  };
}

module.exports = { auditar, ARCHIVOS_VIGILADOS, radioValido, sombraValida, rgbaNeutro, reglasDe };

// -- CLI ------------------------------------------------------
if (require.main === module) {
  console.log('\n=== AUDITORIA DE FORMA ===\n');
  console.log('archivo'.padEnd(26) + 'radio'.padStart(7) + 'sombra'.padStart(8) +
              'peso'.padStart(6) + 'alto'.padStart(6) + 'track'.padStart(7) +
              'var-r'.padStart(7) + 'tinte'.padStart(7));
  console.log('-'.repeat(74));
  let fallo = false;
  ARCHIVOS_VIGILADOS.forEach(function (f) {
    const r = auditar(f);
    console.log(r.archivo.padEnd(26) + String(r.radios.length).padStart(7) +
                String(r.sombras.length).padStart(8) + String(r.pesos.length).padStart(6) +
                String(r.altos.length).padStart(6) + String(r.trackings.length).padStart(7) +
                String(r.varsRadio.length).padStart(7) + String(r.tintes.length).padStart(7));
    if (r.total) {
      fallo = true;
      const listar = function (titulo, lista) {
        if (!lista.length) return;
        console.log('    ' + titulo + ':');
        [...new Set(lista)].forEach(function (x) { console.log('      ' + x); });
      };
      listar('radios sueltos', r.radios);
      listar('sombras sueltas', r.sombras);
      listar('font-weight > 700', r.pesos);
      listar('alto de control fuera de --ctrl-h', r.altos);
      listar('tracking de mayuscula fuera de ' + M.TRACKING_MAYUSCULA, r.trackings);
      listar('vars -radius fuera de escala', r.varsRadio);
      listar('rgba() con tinte ajeno', r.tintes);
    }
  });
  console.log('');
  process.exit(fallo ? 1 : 0);
}
