'use strict';

const { WebContentsView, ipcMain } = require('electron');
const path = require('path');

const TAB_BAR_HEIGHT = 40;

/**
 * Que accion pide una tecla, o null si ninguna.
 *
 * Pura y exportada a proposito: es una tabla de equivalencias, no logica de
 * ventanas, y es justo lo que se rompe en silencio (un atajo que deja de
 * disparar no tira ningun error). `input` es el objeto de before-input-event
 * de Electron.
 */
function shortcutFor(input) {
  if (!input || input.type !== 'keyDown') return null;
  const ctrl = !!(input.control || input.meta);
  const key = String(input.key || '').toLowerCase();

  // Recargar y devtools no piden Ctrl: F5 y F12 son las formas de siempre.
  if (key === 'f5' || (ctrl && key === 'r')) return 'reload';
  if (key === 'f12' || (ctrl && input.shift && key === 'i')) return 'devtools';

  if (!ctrl) return null;
  if (key === 't') return 'new-tab';
  if (key === 'w') return 'close-tab';
  if (key === 'tab') return input.shift ? 'prev-tab' : 'next-tab';
  return null;
}

const CONTENT_WEB_PREFERENCES = {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
};

/**
 * Gestiona pestañas dentro de una sola BrowserWindow usando WebContentsView.
 * Cada pestaña carga la app desde cero (misma URL), asi el estado global de
 * wizard-doc.js/collections.js queda 100% aislado por pestaña sin refactor.
 *
 * onFirstPaint (opcional): la BrowserWindow se crea con show:false para
 * evitar el flash de una ventana vacia, pero como todo el contenido vive en
 * WebContentsView hijos (no en el webContents propio de la ventana), el
 * evento 'ready-to-show' de la ventana NUNCA dispara -- deja la ventana
 * invisible para siempre. Se avisa aca, cuando la PRIMERA pestaña de
 * contenido termina de pintar, para que quien crea la ventana la muestre.
 */
function createTabManager(win, serverUrl, onFirstPaint) {
  const tabs = []; // { id, view }
  let activeId = null;
  let nextId = 1;
  let firstPaintNotified = false;

  const chromeView = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'chrome', 'tabbar-preload.js'),
    },
  });
  win.contentView.addChildView(chromeView);
  chromeView.webContents.loadFile(path.join(__dirname, 'chrome', 'tabbar.html'));
  attachShortcuts(chromeView.webContents);

  function layout() {
    const [w, h] = win.getContentSize();
    chromeView.setBounds({ x: 0, y: 0, width: w, height: TAB_BAR_HEIGHT });
    const active = tabs.find((t) => t.id === activeId);
    if (active) {
      active.view.setBounds({ x: 0, y: TAB_BAR_HEIGHT, width: w, height: Math.max(0, h - TAB_BAR_HEIGHT) });
    }
  }

  function broadcastState() {
    if (chromeView.webContents.isDestroyed()) return;
    chromeView.webContents.send('tabs:update', {
      tabs: tabs.map((t) => ({ id: t.id, title: t.title })),
      activeId,
    });
  }

  function notifyFirstPaint() {
    if (firstPaintNotified) return;
    firstPaintNotified = true;
    if (onFirstPaint) onFirstPaint();
  }

  function newTab() {
    const id = nextId++;
    const view = new WebContentsView({ webPreferences: CONTENT_WEB_PREFERENCES });
    // did-fail-load tambien dispara el aviso: si el server local todavia no
    // esta arriba o la carga falla por otro motivo, la ventana igual se
    // muestra (con la pantalla de error de Chromium) en vez de quedar
    // invisible para siempre esperando un evento que nunca va a llegar.
    view.webContents.once('did-finish-load', notifyFirstPaint);
    view.webContents.once('did-fail-load', notifyFirstPaint);
    view.webContents.loadURL(serverUrl);
    attachShortcuts(view.webContents);
    tabs.push({ id, view, title: 'Pestaña ' + id });
    switchTab(id);
    return id;
  }

  function switchTab(id) {
    const tab = tabs.find((t) => t.id === id);
    if (!tab || activeId === id) return;
    if (activeId !== null) {
      const prev = tabs.find((t) => t.id === activeId);
      if (prev) win.contentView.removeChildView(prev.view);
    }
    win.contentView.addChildView(tab.view);
    activeId = id;
    layout();
    broadcastState();
  }

  function closeTab(id) {
    const idx = tabs.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const [tab] = tabs.splice(idx, 1);
    const wasActive = activeId === id;
    if (wasActive) win.contentView.removeChildView(tab.view);
    if (!tab.view.webContents.isDestroyed()) {
      try { tab.view.webContents.close(); } catch (_) { /* best effort */ }
    }

    if (tabs.length === 0) {
      win.close();
      return;
    }

    if (wasActive) {
      activeId = null;
      switchTab(tabs[Math.max(0, idx - 1)].id);
    } else {
      broadcastState();
    }
  }

  function cycleTab(dir) {
    if (tabs.length < 2) return;
    const idx = tabs.findIndex((t) => t.id === activeId);
    const nextIdx = (idx + dir + tabs.length) % tabs.length;
    switchTab(tabs[nextIdx].id);
  }

  /**
   * El webContents de la pestaña activa, que es sobre la que operan los
   * atajos de recarga y devtools. No alcanza con el que recibe la tecla: si
   * el foco esta en la barra de pestañas, recargar esa vista no recarga la
   * app.
   */
  function activeWebContents() {
    const active = tabs.find((t) => t.id === activeId);
    return active && !active.view.webContents.isDestroyed() ? active.view.webContents : null;
  }

  /**
   * Recargar y devtools existen porque main.js hace
   * Menu.setApplicationMenu(null) para sacar la barra de menu, y eso se lleva
   * puestos los aceleradores por defecto de Electron: la app quedaba sin forma
   * de recargar la ventana. El front se sirve leyendo del disco en cada
   * request (serveStatic en setup.js), asi que recargar alcanza para ver un
   * cambio en public/ sin reiniciar nada.
   */
  function attachShortcuts(webContents) {
    webContents.on('before-input-event', (event, input) => {
      const accion = shortcutFor(input);
      if (!accion) return;
      event.preventDefault();

      if (accion === 'new-tab') { newTab(); return; }
      if (accion === 'close-tab') { if (activeId !== null) closeTab(activeId); return; }
      if (accion === 'next-tab') { cycleTab(1); return; }
      if (accion === 'prev-tab') { cycleTab(-1); return; }

      const wc = activeWebContents();
      if (!wc) return;
      if (accion === 'reload') wc.reloadIgnoringCache();
      else if (accion === 'devtools') wc.toggleDevTools();
    });
  }

  ipcMain.on('tabs:new', () => newTab());
  ipcMain.on('tabs:close', (_e, id) => closeTab(id));
  ipcMain.on('tabs:switch', (_e, id) => switchTab(id));

  win.on('resize', layout);
  win.on('closed', () => {
    ipcMain.removeAllListeners('tabs:new');
    ipcMain.removeAllListeners('tabs:close');
    ipcMain.removeAllListeners('tabs:switch');
  });

  newTab();

  return { newTab, closeTab, switchTab };
}

module.exports = { createTabManager, shortcutFor };
