'use strict';

// electron-builder excluye automaticamente CUALQUIER carpeta "node_modules"
// de su resolucion de "files" (ver app-builder-lib/out/fileMatcher.js,
// inserta "!**/node_modules" antes de nuestros propios patrones), incluso
// cuando se la lista explicitamente. Esa exclusion esta pensada para que el
// empaquetador maneje el node_modules RAIZ via su propio arbol de
// dependencias, pero V3/ y V4/ son proyectos npm independientes (tienen su
// propio package.json, jamas resueltos desde la raiz) asi que ese mecanismo
// no los ve. Sin este hook, mssql y oracledb quedan afuera del .exe.
const fs = require('fs');
const path = require('path');

module.exports = async function afterPack(context) {
  const appDir = path.join(context.appOutDir, 'resources', 'app');
  for (const sub of ['V3', 'V4']) {
    const src = path.join(context.packager.projectDir, sub, 'node_modules');
    const dest = path.join(appDir, sub, 'node_modules');
    if (!fs.existsSync(src)) continue;
    console.log('[afterPack] copiando ' + sub + '/node_modules -> ' + dest);
    fs.cpSync(src, dest, { recursive: true });
  }
};
