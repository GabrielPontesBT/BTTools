'use strict';

// ============================================================
// Mapeo de valores visuales sueltos -> tokens del proyecto.
//
// Los specs de docs/superpowers/specs/ (design-tokens,
// spacing-scale, control-height) definieron la escala unica y se
// aplicaron a index.html, styles.css y wizard-doc.js. Quedo
// afuera el front del builder de Collections, que creció aparte:
// public/collections.css tiene 127KB con 115 colores distintos
// (739 instancias), 287 font-size y 308 espaciados.
//
// El problema de fondo no es la cantidad: es que usa la paleta
// slate de Tailwind (#64748b, #94a3b8, #475569), que tiene tinte
// AZUL, mientras el proyecto usa grises NEUTROS (#636768,
// #c6c7c7). Ese cast frio es lo que hace que la herramienta se
// vea de otra aplicacion aunque el layout sea parecido.
//
// Este archivo es la decision de diseño escrita: cada color ajeno
// tiene un destino elegido por ROL (texto/fondo/borde), no por
// cercania de hex, y las excepciones estan justificadas.
// ============================================================

// ── Tokens que se AGREGAN a :root en styles.css ──────────────
//
// Cinco. El builder es una UI mas densa que el resto (canvas,
// inspector, drawers) y necesita niveles de gris que las otras
// herramientas no tenian. Se agregan al :root compartido, no a
// collections.css, para que cualquier herramienta los pueda usar.
// Todos NEUTROS, para eliminar el tinte azul.
const TOKENS_NUEVOS = [
  {
    nombre: '--text-2', valor: '#47494a', lum: 73,
    porque: 'Texto secundario. Llena el hueco entre --text (lum 20) y --muted (lum 103): ' +
            'el builder usaba dos niveles ahi (#334155 y #475569, 42 usos) que no existian como token.',
  },
  {
    nombre: '--muted-l', valor: '#9fa1a2', lum: 160,
    porque: 'Gris de hints, placeholders y estados deshabilitados. Mas claro que --muted. ' +
            'Reemplaza #94a3b8 (39 usos), que era el nivel mas claro de texto del builder.',
  },
  {
    nombre: '--border-l', valor: '#e3e4e4', lum: 228,
    porque: 'Borde suave. Los 7 bordes del builder van de lum 219 a 242, todos mas claros que ' +
            '--border (#c6c7c7, lum 199): mapearlos a --border los hubiera vuelto notablemente ' +
            'mas pesados. 90 usos.',
  },
  {
    nombre: '--surface', valor: '#fafafa', lum: 250,
    porque: 'Superficie sutil sobre el fondo de pagina, mas clara que --bg (#f2f2f2, lum 242). ' +
            'Reemplaza los 4 fondos casi-blancos del builder (55 usos). Distinto de --code-bg, ' +
            'que tiene el mismo tono pero significa "bloque de codigo".',
  },
  {
    nombre: '--red-d', valor: '#9e2423', lum: 65,
    porque: 'Rojo oscuro para enfasis y hover de texto. Mismo valor que el ya existente ' +
            '--blue-h (que pese al nombre guarda el rojo de marca oscuro): se agrega con nombre ' +
            'semanticamente correcto en vez de propagar esa confusion. 25 usos.',
  },
];

// ── Colores que NO se tocan, con su razon ────────────────────
const EXCEPCIONES = {
  '#ffffff': 'Blanco puro. No es un token ni tiene por que serlo: es el fondo de las superficies elevadas (105 usos).',
  '#fff': 'Blanco puro, forma corta. Mismo criterio que #ffffff.',
  '#000000': 'Negro puro. Solo aparece como base de rgba() en sombras, donde el token no aplica.',
  '#000': 'Negro puro, forma corta. Mismo criterio que #000000.',
  // Los tags de verbo HTTP distinguen GET/POST/PUT/DELETE: es una funcion
  // CATEGORICA, no una semantica de estado. Mismo criterio con el que el
  // spec de design-tokens exime a .vf-tag (indigo V4 / verde V3).
  '#1d4ed8': 'Categorico: tag de verbo HTTP. Misma excepcion que .vf-tag (V3/V4) en el spec.',
  '#4f46e5': 'Categorico: tag de version V4. Excepcion declarada en el spec.',
  '#eef2ff': 'Categorico: fondo del tag V4.',
  '#3730a3': 'Categorico: texto del tag V4.',
};

// ── Mapeo explicito, por color y por rol ─────────────────────
//
// La clave es el hex; el valor puede ser un token unico (aplica a
// cualquier rol) o un objeto por rol.
const MAPA_EXPLICITO = {
  // Valores que YA son tokens del proyecto pero estaban escritos como hex
  // literal. Van primero para que nunca los agarre la heuristica.
  '#121418': '--text',
  '#636768': '--muted',
  // Como borde es exactamente --border; como texto, ese tono es demasiado
  // claro para leerse y corresponde al gris de hint.
  '#c6c7c7': { borde: '--border', svg: '--border', texto: '--muted-l', fondo: '--border' },
  '#f2f2f2': '--bg',
  '#c42e2c': '--red',
  '#9e2423': '--red-d',
  '#fdf3f3': '--red-l',
  '#059669': '--green',
  '#d97706': '--warn',
  '#1e293b': '--code-text',

  // Texto: 5 niveles del builder -> 4 del proyecto
  '#111827': '--text',
  '#0f172a': '--text',
  '#1f2937': '--text-2',
  '#334155': '--text-2',
  '#475569': '--text-2',
  '#64748b': '--muted',
  '#6b7280': '--muted',
  '#94a3b8': '--muted-l',
  '#9ca3af': '--muted-l',

  // Bordes: todos mas claros que --border, van al nuevo --border-l.
  // #cbd5e1 (lum 211) es el unico cercano a --border y se mantiene ahi.
  '#cbd5e1': { borde: '--border', fondo: '--border-l', svg: '--border' },
  '#e5e7eb': '--border-l',
  '#e2e8f0': '--border-l',
  '#d9dce7': '--border-l',
  '#d7dbe6': '--border-l',
  '#d9e0eb': '--border-l',
  '#eef2f7': '--border-l',
  '#f1f2f4': '--border-l',

  // Fondos casi-blancos -> --surface. #f8fafc coincide en valor con
  // --code-bg, pero aca no significa "codigo": va a --surface.
  '#f8fafc': '--surface',
  '#fafafa': '--surface',
  '#f8faff': '--surface',
  '#f4f5f7': '--surface',
  '#f5f5f5': '--surface',
  '#f1f5f9': '--surface',

  // Rojos. El proyecto tiene --red (#c42e2c), --red-l y ahora --red-d.
  '#dc2626': '--red',
  '#ef4444': '--red',
  '#e11d48': '--red',
  '#d33a32': '--red',
  '#b91c1c': '--red-d',
  '#be123c': '--red-d',
  '#9f1239': '--red-d',
  '#fff1f2': '--red-l',
  '#fef2f2': '--red-l',
  '#ffe4e6': '--red-l',
  // #fecdd3 (lum 220) es mucho mas oscuro que --red-l (lum 246): se usa
  // como borde de estado error, asi que va a --red en borde y --red-l en fondo.
  '#fecdd3': { borde: '--red', svg: '--red', fondo: '--red-l' },

  // Verdes
  '#22c55e': '--green',
  '#16a34a': '--green',
  '#15803d': '--green',
  '#166534': '--green',
  '#047857': '--green',
  '#ecfdf3': '--green-l',
  '#dcfce7': '--green-l',

  // Ambar
  '#f59e0b': '--warn',
  '#b45309': '--warn-d',
  '#92400e': '--warn-d',
  '#78350f': '--warn-d',
  '#9a3412': '--warn-d',
  '#fffbeb': '--warn-l',

  // Naranjas y amarillos: son familia ambar, no roja. Sin esto la
  // heuristica los mandaba a --red, porque en naranja tambien r > g > b.
  '#c2410c': '--warn-d',
  '#fff7ed': '--warn-l',
  '#fff7d6': '--warn-l',
  '#fcd34d': '--warn',
  '#fde68a': '--warn-l',
  '#fef3c7': '--warn-l',

  // Rojos claros de estado que la heuristica confundia con grises de borde.
  '#fee2e2': '--red-l',
  '#fecaca': '--red',
  '#fda4af': '--red',
  '#f87171': '--red',
  '#f3c9c8': '--red',
  '#f0bcbc': '--red',
  '#fff5f5': '--red-l',
  '#fff7f7': '--red-l',
  '#991b1b': '--red-d',
  '#881337': '--red-d',

  // Verdes claros que coinciden en valor con tokens que ya existen.
  '#ecfdf5': '--green-l',
  '#065f46': '--green',

  // Azules ajenos a la paleta. El proyecto no tiene azul a proposito:
  // --blue guarda el rojo de marca desde el rebrand.
  //
  // #2563eb es el estado "en curso" del timeline de ejecucion. El proyecto
  // no tiene token de "info", y agregar un azul de verdad iria contra la
  // direccion de marca, asi que el estado en curso pasa a ambar: ambar en
  // progreso, verde exito, rojo error. Es una convencion coherente y no
  // agrega paleta. Si se prefiere azul, es un token nuevo y una decision
  // de marca, no de este cambio.
  '#2563eb': '--warn',
  '#3b82f6': '--warn', // rail del timeline en estado "en curso"
  '#60a5fa': '--warn', // borde e indice del nodo en estado "en curso"
  '#eff6ff': '--warn-l',

  // Acento indigo/violeta del builder. Se decidio caso por caso mirando el
  // selector, no por tono, porque cada uno cumple una funcion distinta:
  //
  // - Bordes de hover (menu, action-btn, drawer-close) -> --border. Los
  //   bordes por defecto quedaron en --border-l, asi que --border ya se lee
  //   como cambio de estado sin meter color de marca en cada hover.
  // - Texto de accion y del boton AI -> --red-d. Son acentos accionables y
  //   el lenguaje de acento de esta app es el rojo de marca.
  // - El borde del nodo "auth" y el badge "query" son CATEGORICOS (tipo de
  //   nodo / tipo de badge): se conserva la distincion pero en ambar, porque
  //   el default de los nodos ya es rojo palido y el azul era justamente lo
  //   que hacia ver esto como otra app.
  // - El icono de la stat card "violet" se neutraliza a --text-2: convive
  //   con las cards de error (rojo) y exito (verde), asi que tiene que
  //   distinguirse de ambas sin inventar un color nuevo.
  '#5546ec': { texto: '--muted', borde: '--border', fondo: '--red-d' },
  '#6d5efc': { borde: '--border', fondo: '--red', texto: '--red-d' },
  '#c7d2fe': '--border',
  '#bfdbfe': '--warn',
  '#dbeafe': '--warn-l',
  '#ddd6fe': '--red-l',
  '#c4b5fd': '--red',
  '#4338ca': '--red-d',
  '#5b21b6': '--red-d',
  '#4c1d95': '--red-d',
  '#6d28d9': '--text-2',
  '#f5f3ff': '--surface',

  // Fondos casi blancos pero con tinte: la saturacion es demasiado baja
  // para que la heuristica los detecte como color, y terminaban en
  // --surface, perdiendo la señal de estado.
  '#f4fff7': '--green-l',
  '#f6fff8': '--green-l',
  '#fffdf4': '--warn-l',
  '#fff6d8': '--warn-l',
  '#fff6f6': '--red-l',
  '#fffefe': '--surface',
};

// ── Escala de tipografia y espaciado ─────────────────────────

const MAPA_FONT_SIZE = {
  9: '--fs-sm', 10: '--fs-sm', 11: '--fs-sm', 12: '--fs-sm',
  13: '--fs-md', 14: '--fs-md',
  15: '--fs-base',
  16: '--fs-lg', 17: '--fs-lg', 18: '--fs-lg', 19: '--fs-lg', 20: '--fs-lg',
  22: '--fs-xl', 26: '--fs-xl',
  28: '--fs-2xl', 32: '--fs-2xl',
};

// Los iconos decorativos de un solo uso quedan fuera de escala por spec.
const FONT_SIZE_EXENTOS = [34, 36, 56];

const MAPA_ESPACIADO = {
  1: '--sp-1', 2: '--sp-1', 3: '--sp-1', 4: '--sp-1',
  5: '--sp-2', 6: '--sp-2', 7: '--sp-2', 8: '--sp-2',
  9: '--sp-3', 10: '--sp-3', 11: '--sp-3', 12: '--sp-3',
  13: '--sp-4', 14: '--sp-4', 15: '--sp-4', 16: '--sp-4',
  18: '--sp-5', 20: '--sp-5', 22: '--sp-5', 23: '--sp-5', 24: '--sp-5', 28: '--sp-5',
};

// Espaciados grandes que no entran en la escala de 5 pasos: son separaciones
// de bloques de layout, no espaciado de componentes. La escala llega a 28px.
const ESPACIADO_EXENTOS = [0, 32, 40, 42, 48, 56, 64];

// Tokens que ya existian en :root antes de este cambio.
const TOKENS_EXISTENTES = [
  '--blue', '--blue-h', '--blue-l', '--green', '--green-l', '--red', '--red-l',
  '--warn', '--warn-l', '--text', '--muted', '--border', '--bg', '--r', '--shadow',
  '--warn-d', '--code-bg', '--code-text',
  '--fs-sm', '--fs-md', '--fs-base', '--fs-lg', '--fs-xl', '--fs-2xl',
  '--ctrl-h', '--sp-1', '--sp-2', '--sp-3', '--sp-4', '--sp-5',
];

function normalizarHex(hex) {
  const h = String(hex || '').toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(h)) return '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  return h;
}

function luminancia(hex) {
  const h = normalizarHex(hex);
  if (!/^#[0-9a-f]{6}$/.test(h)) return null;
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

// Para la cola larga de colores con pocos usos que no estan en el mapa
// explicito: se clasifica por saturacion y luminancia, dentro del rol.
// Es la unica parte heuristica, y el migrador imprime todo lo que resuelve
// asi para poder revisarlo.
function clasificarPorLuminancia(hex, rol) {
  const h = normalizarHex(hex);
  if (!/^#[0-9a-f]{6}$/.test(h)) return null;
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const saturacion = max === 0 ? 0 : (max - min) / max;
  const lum = luminancia(h);

  // Con saturacion apreciable no es un gris: se decide por matiz dominante.
  if (saturacion > 0.25) {
    // Ambar y naranja tambien tienen r > g > b, igual que el rojo. Lo que
    // los separa es cuanto se despega el verde del azul: en un rojo puro
    // g y b son parecidos, en un ambar el verde sube bastante. Sin esta
    // distincion, #d97706 (que ES --warn) terminaba en --red.
    const esAmbar = r > b && (g - b) > 28;
    if (esAmbar) return lum > 210 ? '--warn-l' : lum < 110 ? '--warn-d' : '--warn';

    const esRojo = r > g && r > b;
    const esVerde = g > r && g > b;
    if (esRojo) return lum > 200 ? '--red-l' : lum < 80 ? '--red-d' : '--red';
    if (esVerde) return lum > 200 ? '--green-l' : '--green';
    // Azules y violetas: el proyecto no tiene azul. En fondo van a
    // superficie; en texto o borde, al gris secundario (nunca --text-2
    // como fondo, que quedaria un bloque oscuro donde habia uno claro).
    if (rol === 'fondo') return lum > 200 ? '--surface' : '--bg';
    return lum > 200 ? '--border-l' : '--text-2';
  }

  // Gris. El destino depende del rol.
  if (rol === 'borde') return lum > 215 ? '--border-l' : '--border';
  if (rol === 'fondo') return lum > 246 ? '--surface' : lum > 215 ? '--bg' : lum > 120 ? '--border' : '--text-2';
  // texto y svg
  if (lum < 45) return '--text';
  if (lum < 95) return '--text-2';
  if (lum < 135) return '--muted';
  if (lum < 195) return '--muted-l';
  return '--border-l';
}

// Resuelve el token destino de un color en un rol dado.
// Devuelve {token, via} o null si es excepcion.
function resolverColor(hex, rol) {
  const h = normalizarHex(hex);
  if (EXCEPCIONES[h] || EXCEPCIONES[String(hex).toLowerCase()]) {
    return { token: null, via: 'excepcion', razon: EXCEPCIONES[h] || EXCEPCIONES[String(hex).toLowerCase()] };
  }
  const explicito = MAPA_EXPLICITO[h];
  if (typeof explicito === 'string') return { token: explicito, via: 'explicito' };
  if (explicito && typeof explicito === 'object') {
    if (explicito[rol]) return { token: explicito[rol], via: 'explicito-por-rol' };
    // Rol no contemplado en el objeto: se cae a la heuristica.
  }
  const heuristico = clasificarPorLuminancia(h, rol);
  return heuristico ? { token: heuristico, via: 'heuristico' } : null;
}

module.exports = {
  TOKENS_NUEVOS,
  TOKENS_EXISTENTES,
  EXCEPCIONES,
  MAPA_EXPLICITO,
  MAPA_FONT_SIZE,
  FONT_SIZE_EXENTOS,
  MAPA_ESPACIADO,
  ESPACIADO_EXENTOS,
  normalizarHex,
  luminancia,
  clasificarPorLuminancia,
  resolverColor,
};
