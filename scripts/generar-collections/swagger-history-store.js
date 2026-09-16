'use strict';

// Historial de "ambientes Swagger" guardados desde el paso de Casos de
// prueba: nombre + lista de URLs Swagger + si se detecta autenticacion sola
// (checkbox "Detectar autenticacion automaticamente"). Mismo problema que
// resolvio scripts/common/secret-store para las conexiones de base: estas
// URLs son de ambientes Bantotal reales (hosts/puertos internos), asi que NO
// van en scripts/generar-collections/data -- esa carpeta esta en el repo y
// terminarian commiteadas. No llevan password, asi que no hace falta el
// cifrado del secret-store: un JSON plano en la misma carpeta de datos del
// usuario alcanza.

const fs = require('fs');
const path = require('path');
const { resolveSecretsDir } = require('../common/secret-store');

const FILE_NAME = 'swagger_history.json';

function createSwaggerHistoryStore(options) {
  const opts = options || {};
  const dir = opts.dir || resolveSecretsDir();
  const file = path.join(dir, FILE_NAME);

  function read() {
    try {
      if (!fs.existsSync(file)) return [];
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function write(list) {
    fs.mkdirSync(dir, { recursive: true });
    // Escritura atomica, mismo motivo que en secret-store/index.js: un corte
    // de luz a mitad de un writeFileSync deja el archivo truncado y se pierde
    // todo el historial guardado.
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(list, null, 2), 'utf8');
    fs.renameSync(tmp, file);
  }

  return { read, write, file, dir };
}

module.exports = { createSwaggerHistoryStore, FILE_NAME };
