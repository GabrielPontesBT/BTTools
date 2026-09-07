'use strict';

process.env.BTAPI_ELECTRON = '1';

const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const http = require('http');
const { ensureInstall } = require('./first-run');
const { createTabManager } = require('./tabs');

const PORT = 3777;
const SERVER_URL = 'http://127.0.0.1:' + PORT;

function waitForServer(onReady) {
  const tryOnce = () => {
    const req = http.get(SERVER_URL, (res) => {
      res.resume();
      onReady();
    });
    req.on('error', () => setTimeout(tryOnce, 200));
    req.setTimeout(2000, () => { req.destroy(); });
  };
  tryOnce();
}

function createWindow() {
  const win = new BrowserWindow({
    title: 'Herramienta Bantotal',
    width: 1320,
    height: 880,
    minWidth: 980,
    minHeight: 640,
    show: false,
    icon: path.join(__dirname, '..', 'icon.ico'),
    autoHideMenuBar: true,
  });
  createTabManager(win, SERVER_URL, () => win.show());
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  try {
    process.env.BTAPI_ROOT = await ensureInstall();
  } catch (e) {
    dialog.showErrorBox('Herramienta Bantotal', 'No se pudo preparar la carpeta de instalacion:\n' + e.message);
    app.quit();
    return;
  }
  require('../setup.js'); // arranca el server http en el mismo proceso (puerto 3777), usando BTAPI_ROOT como raiz
  waitForServer(createWindow);
});

app.on('window-all-closed', () => app.quit());
