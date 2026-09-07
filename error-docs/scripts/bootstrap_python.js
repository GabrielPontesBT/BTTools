#!/usr/bin/env node
// Descarga el Python portable (standalone, sin dependencias del sistema) usado por
// simulate_program_flow.py y lo deja en error-docs/python-embed/python/python.exe.
// Se puede volver a correr en cualquier momento: si ya existe, no hace nada.

const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');

const RELEASE_TAG = '20260825';
const ASSET_NAME = 'cpython-3.10.21+20260825-x86_64-pc-windows-msvc-install_only.tar.gz';
const DOWNLOAD_URL = `https://github.com/astral-sh/python-build-standalone/releases/download/${RELEASE_TAG}/${encodeURIComponent(ASSET_NAME)}`;

const EMBED_DIR = path.join(__dirname, '..', 'python-embed');
const EXE_PATH = path.join(EMBED_DIR, 'python', 'python.exe');
const TARBALL_PATH = path.join(EMBED_DIR, 'python-embed.tar.gz');

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        return resolve(download(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${res.statusCode} descargando ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', (err) => {
      try { fs.unlinkSync(destPath); } catch {}
      reject(err);
    });
  });
}

async function main() {
  if (fs.existsSync(EXE_PATH)) {
    console.log(`✅ Python embebido ya presente: ${EXE_PATH}`);
    return;
  }

  fs.mkdirSync(EMBED_DIR, { recursive: true });

  console.log(`⏳ Descargando ${ASSET_NAME}...`);
  await download(DOWNLOAD_URL, TARBALL_PATH);
  console.log(`✅ Descarga completa (${(fs.statSync(TARBALL_PATH).size / 1024 / 1024).toFixed(1)} MB)`);

  console.log('⏳ Extrayendo...');
  const tarResult = spawnSync('tar', ['-xzf', TARBALL_PATH, '-C', EMBED_DIR], { encoding: 'utf8' });
  if (tarResult.status !== 0) {
    throw new Error(`Fallo al extraer con tar: ${tarResult.stderr || tarResult.error}`);
  }
  fs.unlinkSync(TARBALL_PATH);

  if (!fs.existsSync(EXE_PATH)) {
    throw new Error(`Extracción terminó pero no se encontró ${EXE_PATH}`);
  }

  const check = spawnSync(EXE_PATH, ['--version'], { encoding: 'utf8' });
  console.log(`✅ Python embebido listo: ${check.stdout.trim() || check.stderr.trim()} en ${EXE_PATH}`);
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
