// Gate test de alcance del CSS del wizard.
//
// El builder de collections trae su propio "chrome": header chico, sidebar
// angosta y .wiz-bd casi sin padding (8vw -> 16px). Esas reglas se escribieron
// como `.wizard:has(.collection-shell-studio-builder) ...`, o sea mirando SOLO
// la clase del shell, no que panel esta en pantalla.
//
// Mientras el builder vivia detras de su propia pantalla de catalogo, tener la
// clase y estar en el builder eran lo mismo. Dejaron de serlo cuando los
// servicios pasaron a cargarse en el paso de Ambiente: ahi
// setStudioStage('builder') corre con el panel de Ambiente visible, y ese paso
// se quedaba con el padding del builder. Se veia como un zoom repentino al
// tocar "Cargar servicios".
//
// El test es sobre el texto del CSS a proposito: es la unica forma barata y
// deterministica de cubrirlo (no hay navegador en la suite de gate), y el
// defecto es exactamente un selector mal alcanzado.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ARCHIVOS = ['styles.css', 'collections.css'];

function leer(nombre) {
  return fs.readFileSync(path.join(__dirname, nombre), 'utf8');
}

// Un selector por linea logica: alcanza con partir por "{" y quedarse con la
// parte de la izquierda de cada regla.
function selectores(css) {
  return css.split('{').map(function (bloque) {
    var lineas = bloque.split('\n');
    return lineas[lineas.length - 1].trim();
  });
}

test('el chrome compacto del builder solo aplica con el panel del builder activo', () => {
  ARCHIVOS.forEach(function (nombre) {
    selectores(leer(nombre)).forEach(function (selector) {
      if (selector.indexOf('.wizard:has(') < 0) return;
      if (selector.indexOf('.collection-shell-studio-builder') < 0) return;

      assert.ok(selector.indexOf('#p4c.active') >= 0,
        nombre + ': "' + selector + '" le pega al wizard entero por tener la clase en el shell.\n' +
        'Tiene que exigir tambien que el panel del builder sea el activo ' +
        '(#p4c.active .collection-shell-studio-builder): si no, el paso de Ambiente ' +
        'se lleva el padding del builder al cargar los servicios.');
    });
  });
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
