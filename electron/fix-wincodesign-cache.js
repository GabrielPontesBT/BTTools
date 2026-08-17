'use strict';

// electron-builder (via su binario nativo app-builder.exe) necesita el
// paquete "winCodeSign" para poder editar el icono/metadata del .exe con
// rcedit, incluso en builds de Windows sin firma. Ese paquete trae, ademas
// de las herramientas de Windows que si usamos, un puñado de symlinks de
// macOS (darwin/10.12/lib/lib{crypto,ssl}.dylib -> lib{crypto,ssl}.1.0.0.dylib)
// que Windows no deja crear sin el privilegio SeCreateSymbolicLinkPrivilege
// (Modo desarrollador activado, o ejecutar como admin en una maquina donde
// esa politica no este restringida por GPO). En un equipo corporativo donde
// ninguna de esas dos vias esta disponible, la extraccion falla siempre y
// electron-builder queda reintentando la descarga sin avanzar.
//
// Como esos 2 archivos son irrelevantes para un build de Windows (nada en
// el pipeline de firmado/edición de recursos en win32 los toca), este script
// arma la carpeta de cache ya "completa" a mano: descarga el .7z oficial,
// lo extrae ignorando el error puntual de esos 2 symlinks, y los reemplaza
// por una copia plana (no symlink) del archivo versionado real. Es
// idempotente: si la carpeta final ya existe, no hace nada.

const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');
const { spawnSync } = require('child_process');

const VERSION = '2.6.0';
const DIR_NAME = 'winCodeSign-' + VERSION;
const URL = 'https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-' + VERSION + '/' + DIR_NAME + '.7z';
const CACHE_ROOT = path.join(os.homedir(), 'AppData', 'Local', 'electron-builder', 'Cache', 'winCodeSign');
const DEST_DIR = path.join(CACHE_ROOT, DIR_NAME);

function alreadyFixed() {
  const lib = path.join(DEST_DIR, 'darwin', '10.12', 'lib');
  return ['libcrypto.dylib', 'libssl.dylib'].every((f) => {
    try { return fs.statSync(path.join(lib, f)).size > 0; } catch (e) { return false; }
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        return reject(new Error('HTTP ' + res.statusCode + ' descargando ' + url));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function main() {
  if (alreadyFixed()) {
    console.log('[fix-wincodesign-cache] cache ya lista en ' + DEST_DIR);
    return;
  }

  console.log('[fix-wincodesign-cache] preparando cache de winCodeSign (workaround symlinks Windows)...');
  fs.mkdirSync(CACHE_ROOT, { recursive: true });
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wincodesign-'));
  const archivePath = path.join(tmpDir, DIR_NAME + '.7z');

  await download(URL, archivePath);

  const path7za = require('7zip-bin').path7za;
  const extractDir = path.join(tmpDir, 'extracted');
  fs.mkdirSync(extractDir, { recursive: true });
  // Se ignora el exit code: los unicos items que fallan son los 2 symlinks
  // de macOS, todo el resto de la extraccion (lo que realmente usamos:
  // rcedit-*.exe, windows-6, windows-10) se completa igual.
  spawnSync(path7za, ['x', '-snld', '-bd', '-y', archivePath, '-o' + extractDir]);

  const libDir = path.join(extractDir, 'darwin', '10.12', 'lib');
  for (const name of ['libcrypto', 'libssl']) {
    const real = path.join(libDir, name + '.1.0.0.dylib');
    const brokenLink = path.join(libDir, name + '.dylib');
    if (fs.existsSync(real)) fs.copyFileSync(real, brokenLink);
  }

  if (fs.existsSync(DEST_DIR)) fs.rmSync(DEST_DIR, { recursive: true, force: true });
  fs.renameSync(extractDir, DEST_DIR);
  fs.rmSync(tmpDir, { recursive: true, force: true });

  if (!alreadyFixed()) throw new Error('No se pudo completar la cache de winCodeSign');
  console.log('[fix-wincodesign-cache] listo: ' + DEST_DIR);
}

main().catch((e) => {
  console.error('[fix-wincodesign-cache] ' + e.message);
  process.exit(1);
});
