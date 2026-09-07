'use strict';

const { WebContentsView, ipcMain } = require('electron');
const path = require('path');

const TAB_BAR_HEIGHT = 40;

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

  function attachShortcuts(webContents) {
    webContents.on('before-input-event', (event, input) => {
      if (input.type !== 'keyDown') return;
      const ctrl = input.control || input.meta;
      if (!ctrl) return;
      const key = input.key.toLowerCase();
      if (key === 't') { event.preventDefault(); newTab(); }
      else if (key === 'w') { event.preventDefault(); if (activeId !== null) closeTab(activeId); }
      else if (key === 'tab') { event.preventDefault(); cycleTab(input.shift ? -1 : 1); }
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

module.exports = { createTabManager };
