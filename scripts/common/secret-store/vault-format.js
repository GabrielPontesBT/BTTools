// ============================================================
// Formato en disco del historial de conexiones (db_history.json).
//
// El formato viejo (v1) era un array de entradas con las passwords
// en texto plano. Eso se filtro a un repo publico: el archivo se
// escribia dentro de la carpeta del proyecto (setup.js usaba
// path.join(ROOT, ...)), y quedo trackeado en git antes de que
// .gitignore lo cubriera. Ver secret-store/README.md.
//
// v2 separa secretos de no-secretos: todo lo que no es password
// queda en claro (se puede inspeccionar el archivo, y un blob
// corrupto no se lleva puesto el resto del historial) y las
// passwords van juntas en UN solo blob encriptado.
//
// Un solo blob y no campo por campo porque cada operacion de DPAPI
// cuesta un proceso de PowerShell (~300ms): con 3 conexiones son
// hasta 6 campos, o sea ~2s por lectura. Un blob = una llamada.
// ============================================================

'use strict';

const FORMAT = 'btapi-db-history/2';

// Campos secretos dentro de una entrada del historial. Se calcula por
// entrada en vez de ser una lista fija porque `api` tiene una clave por
// modo (publica/interna, ver la accion 'save-api' en setup.js) y esos
// modos no se conocen de antemano.
function secretPathsOf(entry) {
  const paths = [];
  if (!entry || typeof entry !== 'object') return paths;

  if (entry.db && typeof entry.db === 'object' && 'password' in entry.db) {
    paths.push(['db', 'password']);
  }

  if (entry.api && typeof entry.api === 'object') {
    Object.keys(entry.api).forEach(function (mode) {
      const cfg = entry.api[mode];
      if (cfg && typeof cfg === 'object' && 'API_PASSWORD' in cfg) {
        paths.push(['api', mode, 'API_PASSWORD']);
      }
    });
  }

  return paths;
}

// Clave con la que un secreto viaja dentro del blob. Va por id de entrada
// y no por indice para que reordenar `entries` a mano no reasigne
// passwords a la conexion equivocada. Los id son timestamps (solo
// digitos), asi que ':' no aparece nunca en ellos.
function secretKey(entry, index, path) {
  const id = entry && entry.id != null ? String(entry.id) : 'idx' + index;
  return id + ':' + path.join('.');
}

function getIn(obj, path) {
  let cur = obj;
  for (const key of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[key];
  }
  return cur;
}

function setIn(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (cur[path[i]] == null || typeof cur[path[i]] !== 'object') cur[path[i]] = {};
    cur = cur[path[i]];
  }
  cur[path[path.length - 1]] = value;
}

// Separa una lista de entradas en (a) las entradas sin passwords y (b) el
// mapa de secretos a encriptar. Los campos secretos NO se borran de la
// entrada: se dejan en '' para que el shape que ve el frontend no cambie
// (wizard-doc.js hace entry.db.password directo) y para que sea evidente
// al mirar el archivo que ahi habia algo.
function splitSecrets(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const redacted = JSON.parse(JSON.stringify(list));
  const secrets = {};

  redacted.forEach(function (entry, index) {
    secretPathsOf(entry).forEach(function (path) {
      const value = getIn(entry, path);
      // Solo se guardan strings no vacios: un '' en el archivo viejo era
      // "no hay password", no un secreto que valga la pena encriptar.
      if (typeof value === 'string' && value !== '') {
        secrets[secretKey(entry, index, path)] = value;
      }
      setIn(entry, path, '');
    });
  });

  return { entries: redacted, secrets };
}

// Vuelve a meter los secretos en las entradas. Es el inverso exacto de
// splitSecrets. Un secreto que falta (blob viejo, entrada agregada a mano)
// deja el campo en '' en vez de romper: la app pide la password de nuevo,
// que es mejor que no arrancar.
function mergeSecrets(entries, secrets) {
  const list = Array.isArray(entries) ? entries : [];
  const map = secrets && typeof secrets === 'object' ? secrets : {};
  const merged = JSON.parse(JSON.stringify(list));

  merged.forEach(function (entry, index) {
    secretPathsOf(entry).forEach(function (path) {
      const key = secretKey(entry, index, path);
      if (typeof map[key] === 'string') setIn(entry, path, map[key]);
    });
  });

  return merged;
}

// El archivo v1 era un array pelado. Cualquier cosa que no sea un objeto
// con __format es v1 (o basura, y readDbHistory ya devuelve [] ante basura).
function isLegacyShape(parsed) {
  return Array.isArray(parsed);
}

function isCurrentShape(parsed) {
  return !!parsed && !Array.isArray(parsed) && typeof parsed === 'object' &&
         parsed.__format === FORMAT;
}

module.exports = {
  FORMAT,
  secretPathsOf,
  secretKey,
  splitSecrets,
  mergeSecrets,
  isLegacyShape,
  isCurrentShape,
  getIn,
  setIn,
};
