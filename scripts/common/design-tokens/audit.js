'use strict';

// ============================================================
// Verifica que los archivos del front usen los tokens en vez de
// valores sueltos. Es el "script de comprobacion" que pide el
// spec de design-tokens, y el gate que evita que la unificacion
// se desarme sola con el proximo cambio.
//
// Se usa desde audit.test.js (gate) y desde la linea de comandos:
//   node scripts/common/design-tokens/audit.js
// ============================================================

const fs = require('fs');
const path = require('path');
const M = require('./token-map');

const RAIZ = path.join(__dirname, '..', '..', '..');

// Blanco y negro no son tokens ni tienen por que serlo.
const NEUTROS_LIBRES = new Set(['#ffffff', '#fff', '#000000', '#000']);

// Los hex de un archivo, con la propiedad en la que aparecen.
// Se excluyen las entidades HTML numericas (&#128273; es un emoji, no un
// color) y el bloque :root, que es donde los valores tienen que estar.
function hexesDe(src, esCss) {
  const sinRoot = esCss ? src.replace(/:root\{[\s\S]*?\}/g, '') : src;
  const sinEntidades = sinRoot.replace(/&#\d+;?/g, '');
  return [...sinEntidades.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)]
    .map(function (m) { return M.normalizarHex(m[0]); });
}

function auditar(rutaRel) {
  const abs = path.join(RAIZ, rutaRel);
  const src = fs.readFileSync(abs, 'utf8');
  const esCss = rutaRel.endsWith('.css');

  // ── colores ──
  const hexes = hexesDe(src, esCss);
  const coloresMalos = hexes.filter(function (h) {
    if (NEUTROS_LIBRES.has(h)) return false;
    if (M.EXCEPCIONES[h]) return false;
    // Un valor que coincide con un token igual cuenta como desvio: tendria
    // que estar escrito como var(--token), no como el hex.
    return true;
  });

  // ── font-size ──
  const fs_ = [...src.matchAll(/font-size:\s*(\d+)px/gi)].map(function (m) { return Number(m[1]); });
  const fsMalos = fs_.filter(function (n) { return !M.FONT_SIZE_EXENTOS.includes(n); });

  // ── margin y gap de un solo valor ──
  const sp = [...src.matchAll(/\b(?:margin|margin-top|margin-bottom|margin-left|margin-right|gap|row-gap|column-gap):\s*(\d+)px(?=\s*[;}"'])/gi)]
    .map(function (m) { return Number(m[1]); });
  const spMalos = sp.filter(function (n) { return !M.ESPACIADO_EXENTOS.includes(n); });

  return {
    archivo: rutaRel,
    kb: Math.round(src.length / 1024),
    usosVar: (src.match(/var\(--/g) || []).length,
    colores: { total: hexes.length, malos: coloresMalos.length, valores: contar(coloresMalos) },
    fontSize: { total: fs_.length, malos: fsMalos.length, valores: contar(fsMalos) },
    espaciado: { total: sp.length, malos: spMalos.length, valores: contar(spMalos) },
    tokensNoDefinidos: tokensUsadosSinDefinir(src),
  };
}

function contar(lista) {
  const c = {};
  lista.forEach(function (v) { c[v] = (c[v] || 0) + 1; });
  return Object.entries(c).sort(function (a, b) { return b[1] - a[1]; });
}

// Un var(--x) SIN fallback que no esta definido en ningun lado se renderiza
// como nada: bug silencioso, y es el riesgo concreto de una migracion masiva
// a tokens. Un var(--x, algo) no se marca: el fallback lo cubre, y esa es la
// forma correcta de usar una variable que se setea en runtime desde JS
// (ej. --exec-flow-col, que collection-execution-center.js define con
// style.setProperty al redimensionar la columna del flow).
function tokensUsadosSinDefinir(src) {
  const styles = fs.readFileSync(path.join(RAIZ, 'public', 'styles.css'), 'utf8');
  const root = (styles.match(/:root\{[\s\S]*?\}/) || [''])[0];
  const definidos = new Set([...root.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map(function (m) { return m[1]; }));
  // Las variables locales de componente (declaradas en cualquier selector
  // del propio archivo) tambien son validas.
  [...src.matchAll(/(--[a-z0-9-]+)\s*:/gi)].forEach(function (m) { definidos.add(m[1]); });

  // Solo los usos sin coma antes del parentesis de cierre, o sea sin fallback.
  const sinFallback = [...src.matchAll(/var\((--[a-z0-9-]+)\s*\)/gi)].map(function (m) { return m[1]; });
  return [...new Set(sinFallback.filter(function (u) { return !definidos.has(u); }))];
}

const ARCHIVOS_VIGILADOS = [
  'public/collections.css',
  'scripts/generar-collections/panel.html',
];

module.exports = { auditar, ARCHIVOS_VIGILADOS };

// ── CLI ──────────────────────────────────────────────────────
if (require.main === module) {
  console.log('\n=== AUDITORIA DE TOKENS ===\n');
  console.log('archivo'.padEnd(42) + 'KB'.padStart(5) + 'var()'.padStart(7) +
              'fs'.padStart(8) + 'color'.padStart(10) + 'espacio'.padStart(9));
  console.log('-'.repeat(81));
  let fallo = false;
  ARCHIVOS_VIGILADOS.forEach(function (f) {
    const r = auditar(f);
    console.log(r.archivo.padEnd(42) + String(r.kb).padStart(5) + String(r.usosVar).padStart(7) +
                String(r.fontSize.malos).padStart(8) + String(r.colores.malos).padStart(10) +
                String(r.espaciado.malos).padStart(9));
    if (r.colores.malos || r.fontSize.malos || r.espaciado.malos || r.tokensNoDefinidos.length) {
      fallo = true;
      if (r.colores.malos) console.log('    colores sueltos: ' + r.colores.valores.map(function (e) { return e[0] + ' x' + e[1]; }).join(', '));
      if (r.fontSize.malos) console.log('    font-size sueltos: ' + r.fontSize.valores.map(function (e) { return e[0] + 'px x' + e[1]; }).join(', '));
      if (r.espaciado.malos) console.log('    espaciados sueltos: ' + r.espaciado.valores.map(function (e) { return e[0] + 'px x' + e[1]; }).join(', '));
      if (r.tokensNoDefinidos.length) console.log('    TOKENS NO DEFINIDOS: ' + r.tokensNoDefinidos.join(', '));
    }
  });
  console.log('');
  process.exit(fallo ? 1 : 0);
}
