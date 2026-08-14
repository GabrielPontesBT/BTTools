'use strict';

process.env.BTAPI_ELECTRON = '1';

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const http = require('http');

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
    width: 1320,
    height: 880,
    minWidth: 980,
    minHeight: 640,
    show: false,
    icon: path.join(__dirname, '..', 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.once('ready-to-show', () => win.show());
  win.loadURL(SERVER_URL);
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  require('../setup.js'); // arranca el server http en el mismo proceso (puerto 3777)
  waitForServer(createWindow);
});

app.on('window-all-closed', () => app.quit());
