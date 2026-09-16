// Gate test de alcance del CSS del wizard.
//
// El builder de collections trae su propio "chrome": header chico, sidebar
// angosta y .wiz-bd casi sin padding (8vw -> 16px).
//
// Version 1 de estas reglas: `.wizard:has(.collection-shell-studio-builder)
// ...`, mirando SOLO la clase del shell. Bug: mientras el builder vivia
// detras de su propia pantalla de catalogo, tener la clase y estar en el
// builder eran lo mismo, pero dejaron de serlo cuando los servicios pasaron a
// cargarse en el paso de Ambiente (setStudioStage('builder') corria con el
// panel de Ambiente visible) -- se arreglo exigiendo tambien #p4c.active:
// `.wizard:has(#p4c.active .collection-shell-studio-builder) ...`.
//
// Version 2 del bug, mas sutil: ese `:has()` de DOS saltos (subir de .sdot/
// .wiz-sidebar hasta .wizard, bajar 5 niveles adentro de #p4c hasta la clase
// del shell) no siempre invalidaba el estilo del lado del sidebar cuando la
// clase interna cambiaba -- confirmado a mano en el navegador con
// Element.matches() devolviendo true pero el motor de estilos sin aplicar la
// regla, ni insertandola de nuevo con !important. Sintoma: un "reescala" que
// aparecia y desaparecia sin patron claro al entrar al canvas (el sidebar a
// veces se achicaba, a veces se quedaba en su tamano normal).
//
// La solucion ya no usa `:has()` para esto: syncCollectionBuilderShrinkClass
// (wizard-doc.js) evalua las dos condiciones en JS -- donde no hay ambiguedad
// de invalidacion posible -- y pone/saca una clase directo en .wizard
// (.wizard-collection-builder). La llaman show() (cambia el panel activo) y
// CollectionStudioManager.renderStage() (cambia el stage del studio).
//
// El test es sobre el texto del CSS/JS a proposito: es la unica forma barata
// y deterministica de cubrirlo (no hay navegador en la suite de gate).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ARCHIVOS = ['styles.css', 'collections.css'];

function leer(nombre) {
  return fs.readFileSync(path.join(__dirname, nombre), 'utf8');
}

test('el chrome compacto del builder no depende de un :has() que suba y baje entre hermanos', () => {
  ARCHIVOS.forEach(function (nombre) {
    var css = leer(nombre);
    assert.ok(css.indexOf('.wizard:has(#p4c.active .collection-shell-studio-builder)') < 0,
      nombre + ': volvio el :has() de dos saltos (.wizard:has(#p4c.active ' +
      '.collection-shell-studio-builder)) que resulto no invalidar de forma ' +
      'confiable el estilo de .sdot/.wiz-sidebar en el navegador real. Usar la ' +
      'clase .wizard-collection-builder (ver syncCollectionBuilderShrinkClass ' +
      'en wizard-doc.js) en vez de :has().');
  });
});

test('el chrome compacto del builder usa la clase directa en .wizard', () => {
  var css = leer('styles.css');
  // Alcanza con confirmar que los selectores clave del chrome compacto
  // (sidebar y pasos) ya cuelgan de la clase, no del :has().
  ['.wizard.wizard-collection-builder .sdot',
   '.wizard.wizard-collection-builder .wiz-sidebar',
   '.wizard.wizard-collection-builder .wiz-bd'].forEach(function (selector) {
    assert.ok(css.indexOf(selector) >= 0,
      'falta "' + selector + '" en styles.css -- el chrome compacto del builder ' +
      'depende de esta clase, puesta por syncCollectionBuilderShrinkClass.');
  });
});

test('syncCollectionBuilderShrinkClass existe y se llama desde los dos puntos que cambian sus condiciones', () => {
  var wizardDoc = fs.readFileSync(path.join(__dirname, 'wizard-doc.js'), 'utf8');
  assert.match(wizardDoc, /function syncCollectionBuilderShrinkClass\s*\(/,
    'wizard-doc.js tiene que definir syncCollectionBuilderShrinkClass: sin ella, ' +
    'nada pone/saca .wizard-collection-builder y el chrome compacto del builder ' +
    'deja de aplicar del todo.');
  assert.match(wizardDoc, /function show\(step\) \{[\s\S]*?syncCollectionBuilderShrinkClass\(\);/,
    'show() tiene que llamar a syncCollectionBuilderShrinkClass() al cambiar de ' +
    'panel -- si no, cambiar de paso no reevalua si #p4c sigue activo.');

  var studioManager = fs.readFileSync(
    path.join(__dirname, 'collections', 'ui', 'collection-studio-manager.js'), 'utf8');
  assert.match(studioManager, /collection-shell-studio-builder[\s\S]*?syncCollectionBuilderShrinkClass\(\)/,
    'renderStage() tiene que llamar a syncCollectionBuilderShrinkClass() al cambiar ' +
    'el stage del studio -- si no, entrar al builder sin cambiar de panel (el caso ' +
    'real que dispara "Cargar servicios") no actualiza la clase en .wizard.');
});

test('el panel de Ambiente conserva los margenes anchos del wizard', () => {
  const css = leer('styles.css');
  // La regla base: 8vw de aire a los costados en todo el wizard.
  //
  // Lo que importa es el 8vw horizontal, no el valor vertical: ese entro en la
  // escala de espaciado (var(--sp-7)) con el pase de padding y va a seguir
  // cambiando de nombre si la escala cambia. La expresion apunta al invariante.
  assert.match(css, /\.wiz-bd\{padding:\S+ 8vw/,
               'es el margen de lectura de todos los pasos; si cambia, cambia a proposito');
});
