'use strict';

// ============================================================
// Mapeo de FORMA visual -> tokens del proyecto.
//
// Es el segundo pase de unificacion del front del builder de
// Collections ("Generar casos de prueba"). El primero
// (scripts/common/design-tokens/) unifico COLOR, font-size y
// espaciado, y dejo el archivo en 0 valores sueltos de esas tres
// dimensiones. Aun asi la herramienta se seguia viendo de otra
// aplicacion, porque el color no era lo unico que estaba afuera:
//
//   dimension            resto de la app        collections.css
//   -------------------  ---------------------  ------------------------
//   sombras              1 (la del modal)       49 con valor propio, 35 distintos
//   tinte de la sombra   rgba(18,20,24)         rgba(15,23,42) = slate-900
//                        (neutro)               de Tailwind, tinte AZUL
//   marcas ajenas        --                     rgba(79,70,229) indigo-600 y
//                                               rgba(109,94,252) violeta, en
//                                               8 sombras de la vista de ejecucion
//   radios distintos     7 (6/0.7em/10/12/14/   21 (5,7,8,9,10,11,12,14,16,
//                        20/50%)                18,20,22,24,999px...)
//   pills 999px          0                      39
//   font-weight maximo   700 (5 usos; el        800 (71 usos) y 900 (2)
//                        grueso es 600)
//   uppercase            2                      20, con 5 trackings distintos
//   alto de control      --ctrl-h: 40px         42 / 44 / 48px
//
// El color ya no delata nada; lo que delata es la FORMA. Un builder
// que flota sobre 49 sombras azuladas, con esquinas de 24px y
// tipografia en 800, al lado de una app plana de bordes de 1.5px,
// esquinas de 12px y tipografia en 600, se lee como otro producto
// aunque los grises sean identicos.
//
// Este archivo es la decision escrita: cada valor de forma tiene un
// destino elegido por ROL (control / superficie / pill / circulo),
// no por cercania numerica, y las excepciones estan justificadas.
// ============================================================

// -- Tokens que se AGREGAN a :root de styles.css --------------
//
// Seis. Igual que en el pase de color, van al :root compartido y no
// a collections.css, para que cualquier herramienta los pueda usar.
// Ninguno inventa un valor: los seis salen de medir lo que el resto
// de la app YA hace.
const TOKENS_NUEVOS = [
  {
    nombre: '--r-xs', valor: '6px',
    porque: 'Radio de micro-controles. Es el que ya usan .pinput, .param-f input, ' +
            '.sg-chk y .casing-opt en styles.css. Absorbe los 5/7/8/9px del builder.',
  },
  {
    nombre: '--r-ctrl', valor: '0.7em',
    porque: 'Radio de inputs, selects y botones. Mismo valor literal que .field input ' +
            'y .btn ya tienen escrito a mano 9 veces en styles.css: se le pone nombre ' +
            'en vez de repetirlo. Es em a proposito, como en el original.',
  },
  {
    nombre: '--r-pill', valor: '20px',
    porque: 'Radio de pills y badges. Es el de .btn-pill. Reemplaza los 39 ' +
            'border-radius:999px del builder, que eran la firma visual mas ajena que ' +
            'le quedaba. En un elemento de hasta 40px de alto sigue dando una pill ' +
            'completa, asi que la forma no cambia; lo que cambia es que deja de haber ' +
            'dos vocabularios de redondeo conviviendo.',
  },
  {
    nombre: '--shadow-sm', valor: '0 2px 8px rgba(18,20,24,.08)',
    porque: 'Elevacion 1: hover y elementos apoyados. Tinte neutro (#121418 = --text), ' +
            'el mismo que la unica sombra que ya existia en el proyecto.',
  },
  {
    nombre: '--shadow-md', valor: '0 8px 24px rgba(18,20,24,.10)',
    porque: 'Elevacion 2: popovers, drawers, paneles flotantes. Mismo tinte neutro.',
  },
  {
    nombre: '--ring', valor: '0 0 0 3px var(--red-l)',
    porque: 'Anillo de foco. El builder ya lo usaba con ese valor exacto en 6 lugares, ' +
            'escrito a mano cada vez. Se le pone nombre para que una herramienta nueva ' +
            'no tenga que redescubrirlo.',
  },
];

// Ya existian en :root y este pase los usa como destino.
const TOKENS_EXISTENTES = {
  '--r': '12px',
  '--shadow': '0 8px 40px rgba(18,20,24,.14)',
  '--ctrl-h': '40px',
};

// -- Lo que NO se toca, con su razon --------------------------
const EXCEPCIONES = {
  radio: {
    '0': 'Sin redondeo. Es una decision de layout (esquinas que se pegan a otra cosa), no un valor de escala.',
    '0px': 'Idem 0.',
    '50%': 'Circulo perfecto. Ya es la forma que usa el proyecto (.sdot, .ok-icon, .spin).',
    'inherit': 'Hereda del contenedor a proposito.',
  },
  sombra: {
    'none': 'Apagar la sombra es justamente lo que queremos; no hay nada que migrar.',
    'none !important': 'Idem, con prioridad.',
  },
  // El alto solo se toca en controles. Un cuadrado de 44x44 (el "mark" de marca,
  // el avatar de la vista de ejecucion) no es un control: forzarlo a 40 lo
  // deformaria porque su ancho seguiria en 44.
  alto: 'Solo se migran selectores de control (input/select/textarea/btn/trigger). ' +
        'Los cuadrados (mark, icono, rail) conservan su alto porque su ancho va atado.',
};

// -- Radio ----------------------------------------------------

// Un selector es "de control" si termina en algo que se tipea o se clickea.
// El radio de esos elementos tiene que ser el de .field input / .btn (0.7em);
// el de todo lo demas (cards, paneles, nodos, grupos) el de .ccard (12px).
const RE_CONTROL = /(input|select|textarea|btn|button|trigger|toggle|tab|search|stepper)$/i;

function esSelectorDeControl(selector) {
  // Se mira la ultima parte del selector: en ".collection-builder-actions .btn"
  // lo que se estiliza es el boton, no el contenedor.
  const primero = String(selector).split(',')[0].trim();
  const ultimo = primero.split(/[\s>]+/).filter(Boolean).pop() || '';
  // Se sacan pseudo-clases/elementos y atributos: ".collection-x-input:focus"
  // sigue siendo un input.
  const limpio = ultimo.replace(/::?[a-z-]+(\([^)]*\))?/gi, '').replace(/\[[^\]]*\]/g, '');
  return RE_CONTROL.test(limpio);
}

// Un elemento cuadrado con radio de pill es un circulo, y el proyecto los
// escribe como 50%. Mapearlo a --r-pill (20px) lo dejaria de ser circulo en
// cuanto midiera mas de 40px, que es justo lo que pasa con el icono vacio
// del canvas (72px) o el spinner de ejecucion (56px).
function esCuadrado(cuerpo) {
  const w = (String(cuerpo).match(/(?:^|;)\s*width:\s*([^;]+)/) || [])[1];
  const h = (String(cuerpo).match(/(?:^|;)\s*height:\s*([^;]+)/) || [])[1];
  if (!w || !h) return false;
  return w.trim() === h.trim();
}

/**
 * Destino de un border-radius. Devuelve el texto de reemplazo o null si
 * no hay que tocarlo.
 *
 * `valor` puede traer varios componentes ("16px 16px 0 0"): se resuelve
 * cada uno por separado para no perder la forma de las esquinas sueltas
 * (el head de un nodo redondea arriba y se pega abajo).
 */
function resolverRadio(valor, selector, cuerpo) {
  const v = String(valor).trim();
  if (EXCEPCIONES.radio[v]) return null;
  if (/^var\(/.test(v)) return null; // ya es token (o una var del builder, que se migra aparte)

  const partes = v.split(/\s+/);
  let cambio = false;
  const salida = partes.map(function (p) {
    if (p === '0' || p === '0px' || p === '50%') return p;
    if (p === '999px' || p === '9999px') {
      cambio = true;
      return esCuadrado(cuerpo) ? '50%' : 'var(--r-pill)';
    }
    const px = /^(\d+(?:\.\d+)?)px$/.exec(p);
    if (!px) return p;
    const n = Number(px[1]);
    cambio = true;
    if (n <= 9) return 'var(--r-xs)';
    return esSelectorDeControl(selector) ? 'var(--r-ctrl)' : 'var(--r)';
  }).join(' ');

  return cambio && salida !== v ? salida : null;
}

// -- Sombra ---------------------------------------------------

// Corta por comas de primer nivel: una sombra de dos capas es
// "0 0 0 3px X, 0 20px 38px Y", y las comas de rgba() no cuentan.
function capasDe(valor) {
  const capas = [];
  let nivel = 0;
  let actual = '';
  for (const ch of String(valor)) {
    if (ch === '(') nivel++;
    if (ch === ')') nivel--;
    if (ch === ',' && nivel === 0) { capas.push(actual.trim()); actual = ''; continue; }
    actual += ch;
  }
  if (actual.trim()) capas.push(actual.trim());
  return capas;
}

/**
 * Las longitudes de una capa de sombra, en orden (offset-x, offset-y, blur,
 * spread). Se saca primero el color, que puede traer sus propios numeros
 * dentro de rgba(). El "0" pelado cuenta como longitud: "0 18px 34px rgba(...)"
 * tiene blur 34, y buscar solo tokens terminados en px lo dejaba en 2 valores
 * y la sombra sin migrar -- era el bug que dejaba 37 de las 47 sin tocar.
 */
function longitudesDe(capa) {
  return String(capa)
    .replace(/(?:rgba?|hsla?|var|color-mix)\([^)]*\)/gi, ' ')
    .replace(/#[0-9a-fA-F]{3,8}\b/g, ' ')
    .replace(/\b(?:inset)\b/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(function (t) { return /^-?[\d.]+(?:px|em|rem)?$/.test(t); });
}

// Que es lo que de verdad flota.
//
// El criterio NO es el desenfoque: en el builder el desenfoque no significaba
// nada (un panel fijo de layout y un popover tenian la misma sombra de 34px).
// El criterio es el ROL, y sale de mirar como separa superficies el resto de
// la app: .svc-wrap, .gen-log, .param-card, .sg-svc-group y .sdtgen-fields son
// todos borde y cero sombra. La unica sombra del proyecto es la del modal.
//
// Asi que solo llevan elevacion las dos cosas que de verdad estan por encima
// de la pagina:
const RE_FLOTANTE = /(popover|dialog|drawer|dock|menu|tooltip|pending-pill|loading-card|inline-console|side-panel-timeline)/i;
// ...y los estados, donde la sombra pasa a significar algo (esto esta activo)
// en vez de ser decoracion permanente.
const RE_ESTADO = /(:hover|:focus|\.active|-selected|-running|aria-expanded="true")/i;
// Botones chicos que flotan sobre contenido que scrollea: necesitan despegarse
// del texto que les pasa por debajo, pero no son una capa.
const RE_BOTON_FLOTANTE = /(-tool-btn|-icon-btn|-action-btn|-menu-trigger|-response-meta)/i;

/**
 * Destino de un box-shadow. Devuelve el texto de reemplazo o null.
 *
 * Un anillo (0 0 0 Npx) nunca es elevacion: es foco o seleccion, y va a
 * --ring pase lo que pase con el resto de las capas.
 */
function resolverSombra(valor, selector) {
  const v = String(valor).trim();
  if (EXCEPCIONES.sombra[v]) return null;
  if (/^inset\b/.test(v)) return null; // sombra interior: no es elevacion

  const sel = String(selector || '');
  let elevacion;
  if (RE_ESTADO.test(sel) || RE_BOTON_FLOTANTE.test(sel)) elevacion = 'var(--shadow-sm)';
  else if (RE_FLOTANTE.test(sel)) elevacion = 'var(--shadow-md)';
  else elevacion = null; // estructura: se apoya en su borde, como el resto de la app

  const capas = capasDe(v).map(function (capa) {
    if (/^var\(--ring\)$/.test(capa)) return 'var(--ring)';
    // Anillo: offset 0, blur 0, solo spread.
    if (/^0\s+0\s+0\s+\d+px\b/.test(capa)) return 'var(--ring)';
    if (/^var\(--shadow(-sm|-md)?\)$/.test(capa)) return elevacion;
    if (longitudesDe(capa).length < 3) return capa; // no parece una sombra: se deja
    return elevacion;
  }).filter(Boolean);

  // El dialogo de ejecucion es la unica capa realmente modal del builder y se
  // queda con la sombra del modal del proyecto, que es la que ya existia.
  const salida = /execution-dialog/.test(sel)
    ? [...new Set(capas.map(function (c) { return c === 'var(--shadow-md)' ? 'var(--shadow)' : c; }))].join(',')
    : [...new Set(capas)].join(',');

  const final = salida || 'none';
  return final !== v ? final : null;
}

// -- Tinte de los rgba() --------------------------------------
//
// El pase de color mide y migra HEX. Un rgba() no tiene hex, asi que le paso
// por al lado entero: por eso collections.css podia auditar "0 colores
// sueltos" y seguir teniendo 49 sombras y 6 fondos con la base slate-900 de
// Tailwind. Aca se neutraliza la BASE del rgba y se conserva el alfa, que es
// una decision de opacidad de cada lugar y no de paleta.
//
// El blanco y el negro puros no entran: no son tokens ni tienen por que serlo
// (mismo criterio que NEUTROS_LIBRES en el pase de color).
const MAPA_RGBA = {
  '15,23,42': { a: '18,20,24', porque: 'slate-900 de Tailwind -> --text. Es el tinte azul de las 49 sombras y de los 4 scrims.' },
  '248,250,252': { a: '250,250,250', porque: 'slate-50 -> --surface.' },
  '225,29,72': { a: '196,46,44', porque: 'rose-600 -> --red. Es el degrade del fondo del canvas de flujo.' },
  '220,38,38': { a: '196,46,44', porque: 'red-600 de Tailwind -> --red de marca. Parecidos pero no iguales.' },
  '79,70,229': { a: '18,20,24', porque: 'indigo-600 -> neutro. Era el brillo de la marca de la vista de ejecucion: otra identidad, no otro gris.' },
  '109,94,252': { a: '18,20,24', porque: 'violeta -> neutro. Mismo caso que el indigo.' },
  '245,158,11': { a: '217,119,6', porque: 'amber-500 -> --warn. El estado "en curso" ya tiene borde y fondo ambar; el tono tiene que ser el mismo.' },
};

/**
 * Neutraliza el tinte de un rgba()/rgb(). Devuelve el texto nuevo o null.
 */
function resolverRgba(valor) {
  let cambio = false;
  const out = String(valor).replace(/rgba?\(\s*(\d+\s*,\s*\d+\s*,\s*\d+)\s*(,[^)]*)?\)/gi,
    function (todo, base, alfa) {
      const clave = base.replace(/\s+/g, '');
      const destino = MAPA_RGBA[clave];
      if (!destino) return todo;
      cambio = true;
      return (alfa ? 'rgba(' : 'rgb(') + destino.a + (alfa || '') + ')';
    });
  return cambio ? out : null;
}

// -- Peso tipografico -----------------------------------------
//
// La escala del proyecto, medida sobre styles.css:
//
//   700  titulos y badges, y nada mas: .wiz-hd-title, .ccard-title,
//        .ccard-badge, .sdot, .pg-flabel. Cinco usos en toda la app.
//   600  el peso de trabajo: encabezados de card, nombres de grupo,
//        headers de tabla, h3 de modal. 18 usos.
//   500  lo que se toca: .btn y .field label.
//
// El builder tenia 800 en 71 selectores, 900 en 2 y 700 en 76: todo un
// escalon (o dos) por encima. Colapsarlo solo a 700 arregla el exceso pero
// deja 149 elementos al peso que la app reserva para cinco cosas, asi que
// despues del colapso se reparte por ROL contra esa escala.
const MAPA_PESO = { '800': '700', '900': '700' };

// Lo que se clickea va al peso de .btn.
// "label" a secas es el elemento <label>, que en la app es .field label (500).
const PESO_ACCION = /(-btn|^btn|-trigger|-stepper|-toggle|-remove|-clear-search|-clear-selection|-menu-item|^label)$/i;
// Encabezados, metadatos y micro-datos: el peso de trabajo de la app.
const PESO_ESTRUCTURA = /(-label|-count|-meta|-key|-ms|-time|-duration|-http|-value|-tab|-status|-head|-option|-type|-verb|-percent|-eyebrow|-kicker|-summary|^summary|^h3|^h4)$/i;

/**
 * La ultima clase relevante de un selector, para decidir el rol.
 *
 * De ".collection-exec-tab.active" interesa "collection-exec-tab": el rol lo
 * da el componente, no el modificador de estado que viene pegado atras.
 */
function roleDe(selector) {
  const primero = String(selector).split(',')[0].trim();
  const ultimo = primero.split(/[\s>+~]+/).filter(Boolean).pop() || '';
  const limpio = ultimo.replace(/::?[a-z-]+(\([^)]*\))?/gi, '').replace(/\[[^\]]*\]/g, '');
  // Un compuesto ".a.b" se queda con ".a"; un elemento suelto (h3, summary,
  // label) no tiene punto y se devuelve tal cual.
  const clases = limpio.split('.').filter(Boolean);
  return clases.length ? clases[0] : limpio;
}

/**
 * Destino de un font-weight. Devuelve el numero nuevo o null.
 */
function resolverPeso(peso, selector) {
  const p = String(peso).trim();
  const colapsado = MAPA_PESO[p] || p;
  if (colapsado !== '700') return colapsado !== p ? colapsado : null;

  const rol = roleDe(selector);
  let destino = '700';
  if (PESO_ACCION.test(rol)) destino = '500';
  else if (PESO_ESTRUCTURA.test(rol)) destino = '600';
  return destino !== p ? destino : null;
}

// -- Tracking de las mayusculas -------------------------------
//
// El proyecto tiene exactamente un spec de micro-label en mayuscula
// (.ccard-badge y .pg-flabel): letter-spacing .04em. El builder usaba
// .03/.04/.05/.06/.08em segun el selector, sin criterio. Se unifican al del
// proyecto. Las mayusculas en si NO se sacan: son un patron que la app ya tiene.
const TRACKING_MAYUSCULA = '.04em';

// -- Alto de control ------------------------------------------
//
// --ctrl-h:40px es el token del spec control-height-unification. El builder
// tiene 42 (base), 44 y 48. Los tres van al token. La escala compacta de
// pantallas chicas (36/34/32/30) NO se toca: es densidad buscada, y el README
// del pase de color ya declaro que colapsarla es otra decision de diseño.
// Si se toca el escalon de <=1920px, porque en la practica ES el que corre
// (cualquier monitor de 1920 o menos entra ahi) y dejaba el builder en 38.
const ALTOS_A_TOKEN = ['42px', '44px', '48px'];

// Variables del builder cuyo valor se re-ancla al token del proyecto.
const VARS_REANCLADAS = {
  '--builder-control-height': { de: ['42px', '38px'], a: 'var(--ctrl-h)' },
  '--builder-button-height': { de: ['42px', '38px'], a: 'var(--ctrl-h)' },
};

// Cualquier custom property que termine en "-radius" guarda un radio y entra
// en la misma escala. Se resuelve con la misma regla que un border-radius
// literal, en vez de listar los nombres a mano: si manana aparece un
// --foo-radius nuevo con 26px, el pase lo agarra igual.
// (--builder-mark-radius, --builder-workspace-radius y --exec-radius eran los
// tres que existian; el ultimo era el que dejaba dos paneles en 22px despues
// de migrar todos los literales.)
const RE_VAR_RADIO = /^--[a-z0-9-]*-radius$/i;

// Variables del builder declaradas en los escalones responsive y usadas en 0
// lugares. Se borran: son lineas que mienten sobre lo que la UI hace
// (--builder-title-size:36px sugiere un titulo de 36px que no existe).
const VARS_MUERTAS = [
  '--builder-page-padding',
  '--builder-gap-lg',
  '--builder-title-size',
  '--builder-subtitle-size',
  '--builder-toolbar-padding',
  '--builder-toolbar-radius',
];

// -- Borde de los inputs --------------------------------------
//
// .field input en styles.css es 1.5px solid var(--border). Los inputs del
// builder son 1px solid var(--border-l): mas finos y mas claros, que es justo
// lo que hace que un campo del builder al lado de uno del wizard se vea de
// otro formulario. Solo se tocan los INPUTS, no los bordes de paneles y cards:
// el pase de color eligio --border-l para esos a proposito (ver token-map.js),
// y subirlos a --border los volveria pesados.
const INPUTS = [
  '.collection-studio-config-main input',
  '.collection-builder-field-inline input',
  '.collection-service-search-input',
  '.collection-inspector-search-input',
  '.collection-suggest-select',
  '.collection-var-input,.collection-var-textarea',
  '.collection-inspector-input',
  '.collection-inspector-textarea',
];

module.exports = {
  TOKENS_NUEVOS,
  TOKENS_EXISTENTES,
  EXCEPCIONES,
  MAPA_PESO,
  PESO_ACCION,
  PESO_ESTRUCTURA,
  roleDe,
  resolverPeso,
  TRACKING_MAYUSCULA,
  ALTOS_A_TOKEN,
  VARS_REANCLADAS,
  RE_VAR_RADIO,
  VARS_MUERTAS,
  INPUTS,
  RE_CONTROL,
  esSelectorDeControl,
  esCuadrado,
  capasDe,
  longitudesDe,
  MAPA_RGBA,
  resolverRgba,
  resolverRadio,
  resolverSombra,
};
