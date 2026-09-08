// ============================================================
// Historial de conexiones a base: donde vive y como se guarda.
//
// Dos cambios respecto de lo que hacia setup.js:
//
// 1. El archivo YA NO vive en la carpeta del proyecto. Antes era
//    path.join(ROOT, 'db_history.json') y ROOT, en modo dev, es el
//    repo: la app escribia passwords de ambientes Bantotal adentro
//    de git y terminaron en un repo publico. Ahora vive en la
//    carpeta de datos del usuario (%APPDATA% en Windows), donde
//    estructuralmente no se puede commitear.
//
// 2. Las passwords se guardan encriptadas (ver cipher.js).
//
// read()/write() devuelven y aceptan exactamente el mismo shape que
// antes (array de entradas con db.password y api.<modo>.API_PASSWORD
// en claro), asi que las rutas de setup.js y el frontend no cambian.
// El cifrado y la separacion de secretos son invisibles hacia afuera.
// ============================================================

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const fmt = require('./vault-format');
const defaultCipher = require('./cipher');

const FILE_NAME = 'db_history.json';
const APP_DIR_NAME = 'Herramienta Bantotal';

// Carpeta de datos del usuario, por plataforma. BTAPI_SECRETS_DIR la
// pisa: lo usan los tests y sirve para apuntar a un pendrive o a un
// perfil compartido si alguien lo necesita.
function resolveSecretsDir(env, platform) {
  const e = env || process.env;
  const p = platform || process.platform;

  if (e.BTAPI_SECRETS_DIR) return e.BTAPI_SECRETS_DIR;

  if (p === 'win32') {
    const base = e.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    return path.join(base, APP_DIR_NAME);
  }
  if (p === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', APP_DIR_NAME);
  }
  const xdg = e.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(xdg, 'herramienta-bantotal');
}

function readJson(file) {
  try {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return undefined; // undefined = existe pero no se pudo parsear
  }
}

// Un archivo que no parsea NO se sobreescribe en silencio: se aparta con
// un nombre .corrupto para que el usuario pueda recuperar lo que habia.
function setAside(file, suffix) {
  try {
    const dest = file + '.' + suffix;
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    fs.renameSync(file, dest);
    return dest;
  } catch (e) {
    return null;
  }
}

function createSecretStore(options) {
  const opts = options || {};
  const dir = opts.dir || resolveSecretsDir();
  const file = path.join(dir, FILE_NAME);
  const legacyFile = opts.legacyFile || null;
  const cipher = opts.cipher || defaultCipher;
  const warn = opts.warn || function (msg) { console.warn(msg); };

  function read() {
    const parsed = readJson(file);

    if (parsed === undefined) {
      const moved = setAside(file, 'corrupto');
      warn('[secret-store] ' + FILE_NAME + ' no se pudo leer' +
           (moved ? '; se aparto en ' + moved : '') + '. Se arranca con historial vacio.');
      return [];
    }

    if (parsed === null) {
      // No hay archivo nuevo todavia: puede haber uno viejo en el repo.
      return migrateLegacy();
    }

    if (fmt.isLegacyShape(parsed)) {
      // El archivo nuevo quedo en formato viejo (alguien lo copio a mano).
      // Se acepta y se reescribe encriptado en la proxima escritura.
      warn('[secret-store] ' + file + ' esta en el formato viejo sin encriptar. Se migra al guardar.');
      return parsed;
    }

    if (!fmt.isCurrentShape(parsed)) {
      warn('[secret-store] formato desconocido en ' + file + ' (__format=' +
           String(parsed.__format) + '). Se arranca con historial vacio.');
      return [];
    }

    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    if (!cipher.isEnvelope(parsed.vault)) return entries;

    let secrets;
    try {
      secrets = JSON.parse(cipher.decrypt(parsed.vault, dir));
    } catch (e) {
      // Tipico: el archivo se copio de otra maquina o de otro usuario de
      // Windows, y DPAPI no lo puede abrir. Se devuelven las conexiones
      // sin password (la app las vuelve a pedir) en vez de no arrancar.
      warn('[secret-store] no se pudieron desencriptar las passwords guardadas (' +
           e.message + '). Las conexiones quedan sin password: hay que reingresarla.');
      return entries;
    }

    return fmt.mergeSecrets(entries, secrets);
  }

  function write(list) {
    const split = fmt.splitSecrets(list);
    const payload = {
      __format: fmt.FORMAT,
      // Nota para quien abra el archivo a mano y se pregunte donde estan
      // las passwords.
      __nota: 'Las passwords estan en "vault", encriptadas. Ver scripts/common/secret-store/README.md',
      entries: split.entries,
      vault: Object.keys(split.secrets).length
        ? cipher.encrypt(JSON.stringify(split.secrets), dir)
        : null,
      savedAt: new Date().toISOString(),
    };

    fs.mkdirSync(dir, { recursive: true });
    // Escritura atomica: un corte de luz a mitad de un writeFileSync deja
    // el archivo truncado y se pierde todo el historial.
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(tmp, file);
    try { fs.chmodSync(file, 0o600); } catch (e) { /* FS sin permisos POSIX */ }
  }

  // Trae el db_history.json viejo (texto plano, dentro del repo) a la
  // ubicacion nueva y encriptado. Se corre una sola vez: despues existe el
  // archivo nuevo y read() ya no pasa por aca. NO borra el viejo: eso lo
  // decide el usuario (esta trackeado en git y hay que destrackearlo).
  function migrateLegacy() {
    if (!legacyFile) return [];
    const legacy = readJson(legacyFile);
    if (legacy === null || legacy === undefined) return [];
    if (!fmt.isLegacyShape(legacy)) return [];
    if (!legacy.length) return [];

    try {
      write(legacy);
      warn('[secret-store] migradas ' + legacy.length + ' conexiones de ' + legacyFile +
           ' a ' + file + ' (encriptadas).');
    } catch (e) {
      warn('[secret-store] fallo la migracion de ' + legacyFile + ': ' + e.message);
    }
    return legacy;
  }

  // true si quedo un archivo viejo con passwords en claro dentro del repo.
  // setup.js lo usa para avisar en cada arranque hasta que se borre.
  function legacyLeftover() {
    if (!legacyFile) return null;
    const legacy = readJson(legacyFile);
    if (!Array.isArray(legacy)) return null;
    const conPassword = legacy.filter(function (entry) {
      return fmt.secretPathsOf(entry).some(function (p) {
        const v = fmt.getIn(entry, p);
        return typeof v === 'string' && v !== '';
      });
    }).length;
    return conPassword ? { file: legacyFile, conPassword } : null;
  }

  return { read, write, file, dir, legacyLeftover, migrateLegacy };
}

module.exports = { createSecretStore, resolveSecretsDir, FILE_NAME, APP_DIR_NAME };
