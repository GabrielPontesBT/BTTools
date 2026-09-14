'use strict';

// ============================================================
// Mapeo de PADDING -> la escala de espaciado del proyecto.
//
// Tercer pase de unificacion visual, y el primero que NO es del
// builder de Collections: el padding es el unico caso donde los
// dos archivos divergen igual, y styles.css es el mas disperso
// de los dos.
//
//   archivo             componentes   valores distintos
//   ------------------  -----------   -----------------
//   styles.css                  118          23
//   collections.css             399          25
//
// La decision y las 4 opciones que se evaluaron estan en
// docs/superpowers/specs/2026-09-14-padding-scale-unification-design.md
// Gabriel eligio la opcion B: grilla de 4px, 7 pasos.
// ============================================================

// -- La escala -------------------------------------------------
//
// DESVIACION DEL SPEC, declarada: el spec proponia una escala nueva
// --pad-1..7 en paralelo a --sp-1..5. Se implementa en cambio
// EXTENDIENDO --sp-*, porque tener --sp-3:12px y --pad-3:12px al mismo
// tiempo es la misma escala escrita dos veces, y al escribir un
// componente nuevo volves a tener que elegir entre dos vocabularios:
// exactamente el problema que el pase viene a resolver.
//
// La extension cuesta un renombre mecanico: --sp-5 valia 28px y ahora
// vale 20px, asi que los 24 usos existentes de var(--sp-5) pasan a
// var(--sp-7) ANTES de redefinir el :root. Queda una sola escala,
// continua, de 4 en 4, para margin, gap y padding.
const ESCALA = [
  { token: '--sp-1', valor: 4 },
  { token: '--sp-2', valor: 8 },
  { token: '--sp-3', valor: 12 },
  { token: '--sp-4', valor: 16 },
  { token: '--sp-5', valor: 20 },  // nuevo
  { token: '--sp-6', valor: 24 },  // nuevo
  { token: '--sp-7', valor: 28 },  // era --sp-5
];

const PASOS = ESCALA.map(function (e) { return e.valor; });
const TOKEN_DE = ESCALA.reduce(function (a, e) { a[e.valor] = e.token; return a; }, {});

// El renombre previo. Es condicional (ver migrate.js): solo corre mientras
// el :root siga teniendo la forma vieja, para que el pase sea idempotente.
const RENOMBRE = { de: '--sp-5', a: '--sp-7', valorViejo: '28px' };

// -- Como se elige el paso -------------------------------------
//
// Regla general: el paso mas cercano. Los empates (un valor exactamente a
// mitad de camino entre dos pasos) se rompen por FRECUENCIA: gana el paso
// que el proyecto ya usa mas. No es una preferencia estetica, es minimizar
// cuanto se mueve el resultado respecto de lo que ya habia.
//
//   valor  empate entre   componentes de cada paso   gana
//   6px    4 y 8          33 vs 54                   8
//   18px   16 y 20        49 vs 17                   16
//   22px   20 y 24        17 vs 7                    20
//
// 10px y 14px tambien empatan, pero son los dos valores mas usados de todo
// el front (94 y 85 componentes, el 29% del total) y romperlos por
// frecuencia los colapsaria a los dos en 12px junto con el propio 12px:
// 267 componentes, el 44%, con el mismo padding. Eso aplana la jerarquia
// entre una fila y una card, que es informacion real. Van por ROL, igual
// que el pase de color resolvia un hex por rol y no por cercania.
const FRECUENCIA = { 4: 33, 8: 54, 12: 88, 16: 49, 20: 17, 24: 7, 28: 8 };

// -- Los dos valores que van por rol ---------------------------
//
// Resultado: una fila queda en 8/12 y un contenedor en 12/16. La jerarquia
// "fila mas apretada que card" sobrevive al pase, que es justo lo que se
// pierde si se redondea por numero.
const POR_ROL = {
  10: { vertical: { control: 8, fila: 8, defecto: 12 }, horizontal: { defecto: 12 } },
  14: { vertical: { defecto: 12 }, horizontal: { defecto: 16 } },
};

const ROLES = [
  [/(input|select|textarea|btn|button|trigger|stepper|search)$/i, 'control'],
  [/(chip|badge|tag|pill|count|dot|close|remove)$/i, 'micro'],
  [/(row|item|option|line|cell|mtd|step)$/i, 'fila'],
];

/** El rol del componente que estiliza un selector. */
function rolDe(selector) {
  const primero = String(selector || '').split(',')[0].trim();
  const ultimo = primero.split(/[\s>+~]+/).filter(Boolean).pop() || '';
  const limpio = ultimo.replace(/::?[a-z-]+(\([^)]*\))?/gi, '').replace(/\[[^\]]*\]/g, '');
  const clase = limpio.split('.').filter(Boolean)[0] || limpio;
  for (const [re, nombre] of ROLES) if (re.test(clase)) return nombre;
  return 'defecto';
}

/**
 * El paso de la escala que le toca a un valor.
 *
 * `eje` es 'vertical' u 'horizontal'; `selector` solo se usa para los dos
 * valores que van por rol.
 */
function resolverPaso(px, eje, selector) {
  const v = Number(px);
  if (!Number.isFinite(v)) return null;

  const porRol = POR_ROL[v];
  if (porRol && porRol[eje]) {
    const tabla = porRol[eje];
    const rol = rolDe(selector);
    return tabla[rol] !== undefined ? tabla[rol] : tabla.defecto;
  }

  // Paso mas cercano; a igual distancia, el mas usado por el proyecto.
  return PASOS.reduce(function (mejor, paso) {
    const dm = Math.abs(mejor - v), dp = Math.abs(paso - v);
    if (dp < dm) return paso;
    if (dp > dm) return mejor;
    return FRECUENCIA[paso] > FRECUENCIA[mejor] ? paso : mejor;
  });
}

// -- Lo que NO se toca -----------------------------------------
//
// Es la parte que un reemplazo mecanico rompe si nadie la declara: hay
// padding que no es espaciado, es GEOMETRIA. Reserva el hueco para un
// elemento en position:absolute que se superpone al contenido. Cambiarlo
// no mueve el elemento absoluto (sus offsets se miden contra el padding
// box, no contra el contenido): lo que hace es que el icono le pise el
// texto al usuario.
//
// Los 6 casos salieron de cruzar todas las reglas con padding asimetrico
// contra todos los `position:absolute` con offset en px de los 4 archivos.
// `valores` acota la exencion a los px que de verdad son geometria. Sin eso la
// exencion se come tambien el padding normal de la misma regla: en
// `padding:0 10px 0 30px` el unico valor acoplado al icono es el 30, y el 10 es
// espaciado comun que si tiene que entrar en la escala. Cuando el acople es de
// todo el eje (el riel del stepper, el wrap de la lupa) se omite `valores`.
const GEOMETRIA = {
  '.pw input': {
    ejes: ['horizontal'], valores: [36],
    porque: 'padding-right:36px reserva el hueco del ojito .pw-btn (position:absolute;right:9px). ' +
            'A 28px el boton queda encima del texto de la password.',
  },
  '.collection-inspector-search-input': {
    ejes: ['horizontal'], valores: [30],
    porque: 'padding-left:30px reserva el hueco de .collection-inspector-search-icon (absolute;left:10px).',
  },
  '.collection-service-search-input': {
    ejes: ['horizontal'], valores: [34],
    porque: 'padding-left:34px reserva el hueco de .collection-service-search-icon (absolute;left:28px).',
  },
  '.collection-exec-code': {
    ejes: ['vertical'], valores: [44],
    porque: 'padding-top:44px reserva el hueco de la barra flotante (meta + Copiar) que se superpone ' +
            'al bloque de codigo. Lo dice el comentario que ya esta escrito arriba de la regla.',
  },
  '.collection-service-search-wrap': {
    ejes: ['horizontal'],
    porque: 'El icono de lupa se posiciona con left:28px medido desde ESTE wrap, asi que su padding ' +
            'horizontal define donde cae el icono respecto del input. Es geometria acoplada, no ' +
            'espaciado, y en los 3 breakpoints (16/14/12px) por igual.',
  },
  '.steps-bar': {
    ejes: ['horizontal'],
    porque: 'padding-left posiciona el riel del stepper dentro de .wiz-sidebar; no es espaciado interno. ' +
            'Ademas tiene escalera responsive propia (30/24/22/20px) que la grilla de 4px colapsaria ' +
            'a 28/24/20/20, perdiendo un escalon.',
  },
};

// -- El piso de 4px es demasiado grueso para un badge ----------
//
// Reportado por Gabriel mirando los badges "PRÓXIMAMENTE" del paso de Accion:
// pasaron de 2px a 4px de padding vertical y se leen como chips en vez de como
// tags. Tiene razon, y no es un caso puntual: es el limite de la opcion B que
// el propio spec habia anticipado en el hallazgo 4, donde el rol "micro" tenia
// banda propia (1-5px vertical) contra los 6-18px de todo lo demas.
//
// Un badge no es una caja con contenido adentro: es una forma que ABRAZA su
// texto. Duplicarle el padding vertical no le da aire, le cambia la silueta.
// El paso mas chico de la escala (4px) no puede expresar eso.
//
// La solucion es un token propio, FUERA de la escala numerada. --sp-1..7
// sigue siendo una grilla de 4px limpia (hay un test que lo verifica) y
// --sp-micro es el sub-paso declarado para esta familia, con su razon escrita.
// Poner 2px a mano en 10 reglas seria el mismo valor suelto que este pase vino
// a sacar.
//
// Solo el eje VERTICAL. El horizontal de un badge (7-9px, ahora --sp-2) nunca
// fue el problema: ahi 8px separa el texto del borde redondeado igual que antes.
//
// Los 10 selectores son los badge-like cuyo vertical estaba por debajo del
// piso. Los que ya estaban en 4px o mas (.btn-pill, .collection-var-badge,
// .collection-canvas-chip, .collection-exec-node-chip, .collection-exec-status-pill,
// .collection-suggestion-chip) no entran: para esos la escala nunca los movio.
const PISO_MICRO = {
  token: '--sp-micro',
  valor: 2,
  porque: 'Un badge abraza su texto. El paso mas chico de la escala (4px) le cambia la silueta ' +
          'a chip. Va fuera de --sp-1..7 para no romper la grilla de 4px.',
  selectores: [
    '.ccard-badge',
    '.vf-tag',
    '.collection-badge',
    '.collection-scenario-row-count',
    '.collection-inspector-type-tag',
    '.collection-inspector-source-group-count',
    '.collection-suggest-scope-count',
    '.collection-suggest-confidence-badge',
    '.collection-suggest-detail-manual-chip',
    '.collection-service-group-count',
  ],
};

/** Si el padding vertical de un selector usa el sub-paso de badge. */
function usaPisoMicro(selector) {
  const normalizado = String(selector || '').trim().replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ');
  return PISO_MICRO.selectores.indexOf(normalizado) >= 0;
}

// -- Padding escondido en una custom property ------------------
//
// Mismo punto ciego que tenia la escala tipografica: el builder declara su
// escalera de densidad como variables (--builder-node-padding:14px) y despues
// las consume con `padding:var(...)`. El valor es un padding escrito donde la
// expresion de declaraciones no lo busca, asi que sin este pase el archivo
// auditaria limpio y renderizaria igual 9, 11, 13, 14, 15 y 18px.
//
// Se resuelven por el eje HORIZONTAL, porque casi todas alimentan un shorthand
// que cubre los dos ejes y ahi crecer es la direccion segura: el padding
// horizontal es el que separa el texto del borde. Las que el nombre marca como
// verticales (-pt, -pb) van por vertical.
const RE_VAR_VERTICAL = /-(pt|pb|py)$/i;

// Una var consumida dentro de un padding que NO es un padding.
const VARS_EXENTAS = {
  '--exec-node-width': 'Es un ANCHO de nodo. Aparece porque una regla centra un conector con ' +
                       'padding-right:calc(var(--exec-node-width)/2 - 9px). Meterlo en la escala ' +
                       'de espaciado le cambiaria el ancho a los nodos del diagrama.',
};

// Los tokens de la escala TAMBIEN se consumen dentro de declaraciones de
// padding -- son, justamente, el destino de este pase. Si el pase de vars los
// trata como "una var con un px adentro", reescribe su propia definicion a
// --sp-1:var(--sp-1), que es una referencia circular: CSS la descarta en tiempo
// de computo y los SIETE tokens quedan vacios. Eso no rompe una regla: rompe
// todas las que usan cualquier token, en las 6 herramientas y a la vez.
// --sp-micro entra en la lista aunque no sea un paso de la grilla: tambien se
// consume dentro de declaraciones de padding, asi que sin el el pase de vars lo
// tomaria como "una var con un px adentro" y lo reescribiria a var(--sp-1), o
// sea 4px, deshaciendo en cada corrida lo que la corrida anterior arreglo. Es
// la misma trampa que la referencia circular de --sp-1..7, con otra cara: aca
// no se anula nada, simplemente el pase deja de ser idempotente.
const TOKENS_DE_ESCALA = new Set(ESCALA.map(function (e) { return e.token; }).concat([PISO_MICRO.token]));

/** Si un nombre es uno de los tokens de la escala (nunca se redefine). */
function esTokenDeEscala(nombre) {
  return TOKENS_DE_ESCALA.has(String(nombre));
}

/** Si una custom property se consume como padding en el archivo. */
function varsUsadasComoPadding(src) {
  const usadas = new Set();
  [...String(src).matchAll(/padding[a-z-]*\s*:\s*([^;}]+)/g)].forEach(function (m) {
    [...m[1].matchAll(/var\((--[a-z0-9-]+)/g)].forEach(function (v) { usadas.add(v[1]); });
  });
  return usadas;
}

/** Si un selector tiene su padding exento en ese eje, y por que. */
function exencionDe(selector, eje, px) {
  const normalizado = String(selector || '').trim().replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ');
  const e = GEOMETRIA[normalizado];
  if (!e) return null;
  if (e.ejes.indexOf(eje) < 0) return null;
  if (e.valores && e.valores.indexOf(Number(px)) < 0) return null;
  return e;
}

module.exports = {
  ESCALA, PASOS, TOKEN_DE, RENOMBRE,
  FRECUENCIA, POR_ROL, ROLES, GEOMETRIA,
  PISO_MICRO, usaPisoMicro,
  RE_VAR_VERTICAL, VARS_EXENTAS, TOKENS_DE_ESCALA, esTokenDeEscala, varsUsadasComoPadding,
  rolDe, resolverPaso, exencionDe,
};
