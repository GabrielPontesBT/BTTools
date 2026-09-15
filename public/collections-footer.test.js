// Gate tests de la barra de acciones del builder dentro del footer del wizard.
//
// Collections era la unica de las 6 herramientas sin la barra de abajo: tenia
// sus botones arriba, en una segunda fila del encabezado, y el footer escondido.
// Ahora el panel muda ese nodo a #ft-r al montarse.
//
// Se testea la funcion y no el resultado visual porque los dos defectos que
// aparecieron implementandola fueron de LOGICA de ese movimiento, no de CSS:
//
//  1. Se mudaba la barra mientras el wizard todavia estaba en el paso de API
//     (el panel se monta ahi, al cargar los servicios). foot(4) pinta su boton
//     "Siguiente" con innerHTML y se llevaba puesta la barra recien mudada:
//     desaparecian todos los botones del builder, sin error en consola.
//  2. Al entrar al builder quedaba el "Siguiente" del paso anterior al lado de
//     la barra, porque el dock solo agregaba y nunca limpiaba el slot.
//
// Los modulos son IIFE de navegador (ver public/collections/CLAUDE.md), asi
// que se cargan tal cual en un sandbox de vm con los globals minimos.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const leer = function (rel) { return fs.readFileSync(path.join(RAIZ, rel), 'utf8'); };

// -- DOM minimo -----------------------------------------------
//
// Solo lo que usa la funcion: buscar por id y por clase, y mover un nodo entre
// dos padres. Nada de jsdom: la logica a cubrir es de 6 lineas.
function nodo(props) {
  const el = Object.assign({
    id: '', clase: '', children: [], parentElement: null, activo: false,
  }, props || {});
  el.classList = {
    contains: function (c) { return c === 'active' ? !!el.activo : el.clase.split(' ').indexOf(c) >= 0; },
  };
  el.appendChild = function (hijo) {
    if (hijo.parentElement) hijo.parentElement.removeChild(hijo);
    hijo.parentElement = el;
    el.children.push(hijo);
    return hijo;
  };
  el.removeChild = function (hijo) {
    const i = el.children.indexOf(hijo);
    if (i >= 0) el.children.splice(i, 1);
    hijo.parentElement = null;
    return hijo;
  };
  return el;
}

function escenario(opciones) {
  const o = opciones || {};
  const panel = nodo({ id: 'p4c', activo: o.panelActivo !== false });
  const slot = nodo({ id: 'ft-r' });
  const acciones = o.sinBarra ? null : nodo({ clase: 'collection-builder-actions' });
  const arriba = nodo({ clase: 'collection-builder-header' });
  if (acciones) arriba.appendChild(acciones);
  (o.sobrantes || []).forEach(function (s) { slot.appendChild(s); });

  const document = {
    getElementById: function (id) {
      if (id === 'p4c') return o.sinPanel ? null : panel;
      if (id === 'ft-r') return slot;
      return null;
    },
    querySelector: function (sel) {
      return sel === '.collection-builder-actions' ? acciones : null;
    },
  };

  const sandbox = { window: null, document: document };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(leer('public/collections/ui/collection-studio-adapter.js'), sandbox);

  return { sandbox: sandbox, panel: panel, slot: slot, acciones: acciones, arriba: arriba };
}

// -- La logica del dock ---------------------------------------

test('el adapter expone la funcion en window, como el resto de los adapters', () => {
  const e = escenario();
  assert.equal(typeof e.sandbox.collectionDockActionsInWizardFooter, 'function');
});

test('muda la barra al footer cuando el panel del builder esta activo', () => {
  const e = escenario();
  assert.equal(e.sandbox.collectionDockActionsInWizardFooter(), true);
  assert.equal(e.acciones.parentElement, e.slot);
  assert.equal(e.arriba.children.length, 0, 'ya no cuelga del encabezado');
});

test('NO la muda si el panel del builder todavia no es el activo', () => {
  // Es el defecto 1: el panel se monta en el paso de API, y foot(4) reescribe
  // #ft-r con innerHTML apenas pinta su "Siguiente". Mudarla antes de tiempo
  // la borra entera.
  const e = escenario({ panelActivo: false });
  assert.equal(e.sandbox.collectionDockActionsInWizardFooter(), false);
  assert.equal(e.acciones.parentElement, e.arriba, 'se queda donde estaba');
  assert.equal(e.slot.children.length, 0);
});

test('limpia lo que dejo el paso anterior en el slot', () => {
  // Es el defecto 2: quedaba el boton "Siguiente" del paso de API al lado de
  // la barra del builder.
  const siguiente = nodo({ id: 'btn-next' });
  const e = escenario({ sobrantes: [siguiente] });

  assert.equal(e.sandbox.collectionDockActionsInWizardFooter(), true);
  assert.equal(e.slot.children.length, 1);
  assert.equal(e.slot.children[0], e.acciones);
  assert.equal(siguiente.parentElement, null);
});

test('es idempotente: foot() puede correr varias veces por paso', () => {
  const e = escenario();
  e.sandbox.collectionDockActionsInWizardFooter();
  e.sandbox.collectionDockActionsInWizardFooter();
  e.sandbox.collectionDockActionsInWizardFooter();
  assert.equal(e.slot.children.length, 1, 'no duplica ni vacia');
  assert.equal(e.slot.children[0], e.acciones);
});

test('devuelve false si el panel todavia no monto, para que foot() vacie el slot', () => {
  const e = escenario({ sinBarra: true });
  assert.equal(e.sandbox.collectionDockActionsInWizardFooter(), false);
});

test('no explota si el footer no existe (otras pantallas del wizard)', () => {
  const e = escenario({ sinPanel: true });
  assert.equal(e.sandbox.collectionDockActionsInWizardFooter(), false);
});

// -- El resto del cableado ------------------------------------

test('foot() no vacia el slot cuando logro mudar la barra', () => {
  const js = leer('public/wizard-doc.js');
  // show() tiene su propia rama con la misma condicion, asi que primero se
  // acota a foot().
  const desde = js.indexOf('function foot(step)');
  assert.ok(desde > 0, 'no encontre foot()');
  const cuerpo = js.slice(desde, js.indexOf('\nfunction ', desde + 10));
  const bloque = /step === 5 && S\.action === 'collections'\)\s*\{([\s\S]*?)\}\s*else/.exec(cuerpo);
  assert.ok(bloque, 'no encontre la rama de collections en foot()');
  assert.match(bloque[1], /collectionDockActionsInWizardFooter\(\)/,
    'la rama tiene que intentar el dock');
  assert.match(bloque[1], /if\s*\(!\(/,
    'y solo vaciar el slot si el dock no pudo: vaciarlo siempre borra la barra');
});

test('el footer ya no se esconde en el panel de collections', () => {
  const css = leer('public/styles.css');
  assert.doesNotMatch(css, /#p4c\.active\)\s*\.wiz-ft\{display:none\}/,
    'era lo que dejaba a collections sin la barra de abajo de las otras 5 herramientas');
});

test('el panel tiene una sola barra de acciones y ya no el volver duplicado', () => {
  const html = leer('scripts/generar-collections/panel.html');
  assert.equal((html.match(/collection-builder-actions/g) || []).length, 1,
    'si hubiera dos, mudar una dejaria la otra con los mismos ids');
  assert.doesNotMatch(html, /btn-collection-setup-back/,
    'llamaba a goBack(), igual que el "Volver" del footer: era el mismo boton dos veces');
});

test('lo que se edita queda arriba y lo que se ejecuta abajo', () => {
  const html = leer('scripts/generar-collections/panel.html');
  const arriba = html.slice(0, html.indexOf('collection-builder-actions'));
  assert.match(arriba, /id="collection-name"/, 'Nombre');
  assert.match(arriba, /id="collection-scenario-name"/, 'Cadena');
  assert.match(arriba, /collection-scenario-menu/, 'el menu de casos de uso');

  const abajo = html.slice(html.indexOf('collection-builder-actions'));
  ['btn-collection-add-service-top', 'btn-collection-execute',
   'btn-collection-generate'].forEach(function (id) {
    assert.match(abajo, new RegExp('id="' + id + '"'), id + ' tiene que estar en la barra');
  });
});

test('el modo ejecucion alcanza la barra desde el footer', () => {
  // .collection-execution-active vive en el shell del panel; con la barra
  // mudada al footer, un selector descendiente de esa clase ya no la alcanza.
  // El menu que el modo ejecucion agrega tiene que anclarse desde .wizard,
  // que es el ancestro comun. (El boton separado "Volver al builder" que
  // existia antes se saco: goBack(), en wizard-doc.js, ya cierra el modo
  // ejecucion cuando esta activo.)
  const css = leer('public/collections.css');
  assert.match(css, /\.wizard:has\(\.collection-execution-active\)[^{]*#collection-exec-header-menu-slot/,
    'collection-exec-header-menu-slot quedaria invisible en modo ejecucion');
});
