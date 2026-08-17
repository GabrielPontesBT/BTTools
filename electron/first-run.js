'use strict';

// El .exe portable se autoextrae a una carpeta temporal distinta en cada
// arranque (asi funciona el target "portable" de NSIS), asi que cualquier
// cosa que la app escriba junto a si misma (.env, db_history.json,
// documentacion generada) se perderia al cerrarla. Este modulo resuelve una
// carpeta persistente elegida por el usuario la primera vez, copia ahi el
// contenido necesario de la app empaquetada, y la reutiliza en arranques
// siguientes. electron/main.js pasa esa ruta a setup.js via BTAPI_ROOT.

const { app, dialog, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

// Carpeta de la app tal como quedo empaquetada (o el repo en modo dev):
// contiene setup.js, public/, scripts/, V3/, V4/. electron/first-run.js
// vive un nivel mas adentro (electron/), de ahi el '..'.
const SOURCE_DIR = path.join(__dirname, '..');

// Lo unico que necesita el server para funcionar. Se deja afuera "electron"
// (el proceso principal ya corre desde SOURCE_DIR, no hace falta copiarlo)
// y "package.json"/"icon.ico" (metadata de empaquetado, no de runtime).
const PAYLOAD_ENTRIES = ['setup.js', 'public', 'scripts', 'V3', 'V4'];

// Al actualizar (nueva version de la app), se refresca el codigo pero no se
// pisa lo que el usuario ya configuro o genero en la carpeta instalada.
const PRESERVE_ON_UPDATE = [
  path.join('V3', '.env'),
  path.join('V4', '.env'),
  path.join('scripts', 'generar-collections', 'output'),
];

function markerPath() {
  return path.join(app.getPath('userData'), 'install-location.json');
}

function readMarker() {
  try { return JSON.parse(fs.readFileSync(markerPath(), 'utf8')); } catch (e) { return null; }
}

function writeMarker(installDir) {
  fs.mkdirSync(path.dirname(markerPath()), { recursive: true });
  fs.writeFileSync(markerPath(), JSON.stringify({ installDir, version: app.getVersion() }, null, 2), 'utf8');
}

function isValidInstall(installDir) {
  return !!installDir && fs.existsSync(path.join(installDir, 'setup.js'));
}

async function pickInstallDir() {
  const defaultPath = path.join(app.getPath('documents'), 'Herramienta Bantotal');
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await dialog.showOpenDialog({
      title: 'Elegi donde instalar Herramienta Bantotal',
      message: 'Se va a instalar en la carpeta elegida. La proxima vez se va a abrir directamente desde ahi.',
      defaultPath,
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: 'Instalar aca',
    });
    if (!result.canceled && result.filePaths[0]) return result.filePaths[0];
  }
  // El usuario cancelo dos veces: seguimos igual con una carpeta por
  // defecto en vez de dejar la app sin arrancar.
  return defaultPath;
}

function copyPayload(destDir, { preserveExisting }) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of PAYLOAD_ENTRIES) {
    const src = path.join(SOURCE_DIR, entry);
    const dest = path.join(destDir, entry);
    if (!fs.existsSync(src)) continue;
    fs.cpSync(src, dest, {
      recursive: true,
      force: true,
      filter: (srcPath) => {
        if (!preserveExisting) return true;
        const rel = path.relative(SOURCE_DIR, srcPath);
        const isPreserved = PRESERVE_ON_UPDATE.some((p) => rel === p || rel.startsWith(p + path.sep));
        // Ya instalado antes: no pisar lo que el usuario configuro/genero
        // si ya existe en destino; si todavia no existe, se copia igual.
        return !isPreserved || !fs.existsSync(path.join(destDir, rel));
      },
    });
  }
}

function showSplash(message) {
  const win = new BrowserWindow({
    width: 420,
    height: 180,
    frame: false,
    resizable: false,
    show: false,
    backgroundColor: '#101828',
  });
  const html = `<!doctype html><html><body style="margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#101828;color:#e5e7eb;font-family:Segoe UI,Arial,sans-serif;">
    <div style="width:32px;height:32px;border:3px solid #374151;border-top-color:#60a5fa;border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:16px;"></div>
    <div style="font-size:14px;">${message}</div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  </body></html>`;
  win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  win.once('ready-to-show', () => win.show());
  return win;
}

async function ensureInstall() {
  const marker = readMarker();

  if (marker && isValidInstall(marker.installDir) && marker.version === app.getVersion()) {
    return marker.installDir; // camino rapido: ya instalado y actualizado
  }

  const isUpdate = marker && isValidInstall(marker.installDir);
  const installDir = isUpdate ? marker.installDir : await pickInstallDir();

  const splash = showSplash(isUpdate ? 'Actualizando Herramienta Bantotal...' : 'Instalando Herramienta Bantotal...');
  try {
    copyPayload(installDir, { preserveExisting: isUpdate });
    writeMarker(installDir);
  } finally {
    splash.close();
  }

  return installDir;
}

module.exports = { ensureInstall };
