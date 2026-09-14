// Gate test de los atajos de teclado de la ventana.
//
// main.js hace Menu.setApplicationMenu(null) para sacar la barra de menu, y eso
// se lleva puestos los aceleradores por defecto de Electron. Los atajos de esta
// tabla son los unicos que quedan: si uno deja de matchear no tira ningun
// error, simplemente no pasa nada al apretar la tecla.
//
// shortcutFor es pura (recibe el input de before-input-event), asi que se
// testea sin levantar Electron. `tabs.js` requiere 'electron' arriba de todo,
// que no existe fuera de la app: se stubea el require antes de cargarlo.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const Module = require('module');

function loadTabs() {
  const originalResolve = Module._resolveFilename;
  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === 'electron') return { WebContentsView: function () {}, ipcMain: { on: function () {} } };
    return originalLoad.call(this, request, parent, isMain);
  };
  try {
    const ruta = path.join(__dirname, 'tabs.js');
    delete require.cache[ruta];
    return require(ruta);
  } finally {
    Module._load = originalLoad;
    Module._resolveFilename = originalResolve;
  }
}

const { shortcutFor } = loadTabs();

function tecla(key, extra) {
  return Object.assign({ type: 'keyDown', key: key, control: false, meta: false, shift: false }, extra || {});
}

test('recargar la ventana: F5 y Ctrl+R', () => {
  // Es el atajo que devuelve el modo "editar y ver": el front se sirve leyendo
  // del disco en cada request, asi que recargar alcanza.
  assert.equal(shortcutFor(tecla('F5')), 'reload', 'F5 no lleva modificador');
  assert.equal(shortcutFor(tecla('r', { control: true })), 'reload');
  assert.equal(shortcutFor(tecla('r', { meta: true })), 'reload', 'Cmd+R en Mac');
  assert.equal(shortcutFor(tecla('r')), null, 'una "r" suelta se escribe, no recarga');
});

test('devtools: F12 y Ctrl+Shift+I', () => {
  assert.equal(shortcutFor(tecla('F12')), 'devtools');
  assert.equal(shortcutFor(tecla('i', { control: true, shift: true })), 'devtools');
  assert.equal(shortcutFor(tecla('i', { control: true })), null, 'sin Shift no es el atajo');
});

test('las pestañas siguen respondiendo a Ctrl+T / Ctrl+W / Ctrl+Tab', () => {
  assert.equal(shortcutFor(tecla('t', { control: true })), 'new-tab');
  assert.equal(shortcutFor(tecla('w', { control: true })), 'close-tab');
  assert.equal(shortcutFor(tecla('Tab', { control: true })), 'next-tab');
  assert.equal(shortcutFor(tecla('Tab', { control: true, shift: true })), 'prev-tab');
});

test('solo keyDown, y una tecla cualquiera no dispara nada', () => {
  assert.equal(shortcutFor(tecla('F5', { type: 'keyUp' })), null, 'si no, la accion corre dos veces');
  assert.equal(shortcutFor(tecla('a', { control: true })), null);
  assert.equal(shortcutFor(null), null);
});
