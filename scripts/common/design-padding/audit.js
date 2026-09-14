'use strict';

// ============================================================
// Verifica que no quede padding fuera de la escala en el front.
//
// Gate del pase de pad-map.js. A diferencia de los dos pases
// anteriores, este vigila los CUATRO archivos del front: el
// padding no era una divergencia del builder, era una dispersion
// de toda la app (styles.css tenia 23 valores distintos en 118
// componentes, mas disperso que collections.css).
//
// Se usa desde audit.test.js y desde la linea de comandos:
//   node scripts/common/design-padding/audit.js
// ============================================================

const fs = require('fs');
const path = require('path');
const M = require('./pad-map');

const RAIZ = path.join(__dirname, '..', '..', '..');

const ARCHIVOS_VIGILADOS = [
  'public/styles.css',
  'public/collections.css',
  'public/index.html',
  'public/wizard-doc.js',
];

const RE_DECL = /(padding(?:-top|-bottom|-left|-right|-block|-inline)?)\s*:\s*([^;}"'`\n]+)/g;

// Un componente valido es un token de la escala, un cero, o una unidad que no
// es px (%, vw, em, auto, calc). Un px pelado es lo que este gate persigue.
function componenteValido(p) {
  if (/^var\(--sp-[1-7]\)$/.test(p)) return true;
  if (p === 'var(' + M.PISO_MICRO.token + ')') return true;
  if (p === '0' || p === '0px') return true;
  if (!/\d+px/.test(p)) return true;
  return false;
}

// El primer componente de un padding es siempre el vertical (sea `a`, `a b`,
// `a b c` o `a b c d`), asi que alcanza con mirarlo para saber si un badge
// conserva su sub-paso.
function verticalDe(prop, valor) {
  if (/-(left|right|inline)/.test(prop)) return null;
  return valor.trim().split(/\s+/)[0];
}

function auditar(rutaRel) {
  const abs = path.join(RAIZ, rutaRel);
  const src = fs.readFileSync(abs, 'utf8');
  const esCss = rutaRel.endsWith('.css');

  const sueltos = [];
  const badges = [];
  let m;
  const re = new RegExp(RE_DECL.source, 'g');
  while ((m = re.exec(src))) {
    const prop = m[1];
    const valor = m[2].trim();
    const selector = esCss ? selectorEn(src, m.index) : '';

    // Un fallback de var() cuenta como componente propio: var(--x,12px) tiene
    // un 12px escrito en el archivo aunque casi nunca se renderice.
    const fallbacks = [...valor.matchAll(/var\([^,)]+,\s*(\d+px)\s*\)/g)].map(function (f) { return f[1]; });
    const sinVars = valor.replace(/var\([^)]*\)/g, ' ').replace(/calc\([^)]*\)/g, ' ');
    const componentes = sinVars.trim().split(/\s+/).filter(Boolean).concat(fallbacks);

    componentes.forEach(function (p) {
      if (componenteValido(p)) return;
      const px = Number((/^(\d+)px$/.exec(p) || [])[1]);
      if (Number.isFinite(px) && M.exencionDe(selector, 'horizontal', px)) return;
      if (Number.isFinite(px) && M.exencionDe(selector, 'vertical', px)) return;
      sueltos.push((selector || '(inline)').slice(0, 44) + '  ' + prop + ': ' + valor);
    });

    // Los badge-like tienen que conservar el sub-paso vertical: si alguno
    // vuelve a --sp-1, el badge se hincha de nuevo y eso ya fue un reporte.
    if (M.usaPisoMicro(selector)) {
      const v = verticalDe(prop, valor);
      if (v && v !== 'var(' + M.PISO_MICRO.token + ')' && v !== '0' && v !== '0px') {
        badges.push(selector + '  ' + prop + ': ' + valor);
      }
    }
  }

  // Las custom properties consumidas como padding tienen que estar en la escala
  // tambien: es el mismo punto ciego que tenia la escala tipografica.
  const enVars = [];
  const usadas = M.varsUsadasComoPadding(src);
  [...src.matchAll(/(--[a-z0-9-]+)\s*:\s*(\d+)px(?=\s*[;}])/g)].forEach(function (v) {
    if (!usadas.has(v[1])) return;
    if (M.esTokenDeEscala(v[1])) return;
    if (M.VARS_EXENTAS[v[1]]) return;
    enVars.push(v[1] + ': ' + v[2] + 'px');
  });

  // Una escala que se define a si misma se anula entera y en silencio.
  const circulares = [];
  M.ESCALA.forEach(function (e) {
    const re2 = new RegExp(e.token + '\\s*:\\s*var\\(' + e.token + '\\)');
    if (re2.test(src)) circulares.push(e.token);
  });

  return { archivo: rutaRel, sueltos, enVars, circulares, badges,
           total: sueltos.length + enVars.length + circulares.length + badges.length };
}

function selectorEn(src, pos) {
  const abre = src.lastIndexOf('{', pos);
  if (abre < 0) return '';
  if (src.lastIndexOf('}', pos) > abre) return '';
  const inicio = Math.max(src.lastIndexOf('}', abre), src.lastIndexOf('{', abre - 1)) + 1;
  return src.slice(inicio, abre).replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/\s+/g, ' ');
}

module.exports = { auditar, ARCHIVOS_VIGILADOS, componenteValido, selectorEn };

// -- CLI -------------------------------------------------------
if (require.main === module) {
  console.log('\n=== AUDITORIA DE PADDING ===\n');
  console.log('archivo'.padEnd(26) + 'sueltos'.padStart(9) + 'en vars'.padStart(9) + 'circular'.padStart(10) + 'badges'.padStart(8));
  console.log('-'.repeat(62));
  let fallo = false;
  ARCHIVOS_VIGILADOS.forEach(function (f) {
    const r = auditar(f);
    console.log(r.archivo.padEnd(26) + String(r.sueltos.length).padStart(9) +
                String(r.enVars.length).padStart(9) + String(r.circulares.length).padStart(10) + String(r.badges.length).padStart(8));
    if (r.total) {
      fallo = true;
      if (r.sueltos.length) {
        console.log('    padding fuera de la escala:');
        [...new Set(r.sueltos)].forEach(function (x) { console.log('      ' + x); });
      }
      if (r.enVars.length) {
        console.log('    custom properties de padding fuera de la escala:');
        [...new Set(r.enVars)].forEach(function (x) { console.log('      ' + x); });
      }
      if (r.circulares.length) {
        console.log('    TOKENS CIRCULARES (anulan la escala entera): ' + r.circulares.join(', '));
      }
      if (r.badges.length) {
        console.log('    badges sin el sub-paso vertical (se hinchan a 4px):');
        [...new Set(r.badges)].forEach(function (x) { console.log('      ' + x); });
      }
    }
  });
  console.log('');
  process.exit(fallo ? 1 : 0);
}
