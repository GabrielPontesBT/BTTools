'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tabsAPI', {
  newTab: () => ipcRenderer.send('tabs:new'),
  closeTab: (id) => ipcRenderer.send('tabs:close', id),
  switchTab: (id) => ipcRenderer.send('tabs:switch', id),
  onUpdate: (cb) => ipcRenderer.on('tabs:update', (_e, data) => cb(data)),
});
