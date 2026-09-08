// ============================================================
// Cifrado de los secretos del historial de conexiones.
//
// AES-256-GCM con una clave local, guardada al lado del archivo
// de datos con permisos restringidos al usuario.
//
// ── Por que NO se usa DPAPI ──
//
// La primera version usaba DPAPI de Windows (CurrentUser), que es
// criptograficamente mejor: la clave la administra Windows y esta
// atada a la cuenta, asi que el archivo copiado a otra maquina no
// se puede abrir. A DPAPI se llega ejecutando PowerShell, porque la
// alternativa era un modulo nativo que hay que recompilar por cada
// version de Electron.
//
// Ese spawn de PowerShell resulto inviable en las maquinas donde
// corre la herramienta: Kaspersky Adaptive Anomaly Control lo
// bloquea con la regla "Start of PowerShell from the JScript
// script". No es un falso positivo puntual, es la politica del
// endpoint: un interprete de scripts lanzando PowerShell es un
// patron clasico de malware, y bloquearlo esta bien. La herramienta
// disparaba ese bloqueo cada vez que se guardaba una conexion.
//
// ── Que se gana y que se pierde ──
//
// Se pierde: la clave vive al lado del dato. Alguien que se lleve
// la carpeta entera (db_history.json + secret.key) puede
// desencriptar. Con DPAPI eso no pasaba.
//
// Se conserva lo que motivo todo esto: el archivo esta FUERA del
// repo, asi que no se puede commitear ni por error, y su contenido
// no es legible de un `cat`. La falla original fue publicar
// credenciales en un repo, no que alguien copiara la carpeta.
//
// Lo que ninguna de las dos opciones resuelve: la app necesita la
// password en claro para conectarse a Oracle/SQL Server, asi que
// codigo corriendo como el usuario siempre la puede recuperar. Para
// eso la unica respuesta real es no guardarla y pedirla en cada
// arranque, que es una decision de producto.
// ============================================================

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ENVELOPE_VERSION = 'v1';
const ALG_LOCALKEY = 'aes-256-gcm-localkey';

// Sobres escritos por la version que usaba DPAPI. Ya no se pueden abrir
// (haria falta PowerShell), pero se reconocen para poder dar un mensaje
// que diga que hacer en vez de un error de cifrado generico.
const ALG_DPAPI_HISTORICO = 'dpapi-currentuser';

// Layout del payload: iv(12) | authTag(16) | ciphertext
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

function localKeyPath(dir) {
  return path.join(dir, 'secret.key');
}

// La clave se crea la primera vez y se reusa. 0600 para que otros usuarios
// de la maquina no la lean; en filesystems sin permisos POSIX el chmod es
// un no-op y se acepta, porque igual el archivo esta en el perfil del
// usuario.
function loadOrCreateLocalKey(dir) {
  const keyFile = localKeyPath(dir);
  if (fs.existsSync(keyFile)) {
    const key = Buffer.from(fs.readFileSync(keyFile, 'utf8').trim(), 'base64');
    if (key.length === KEY_BYTES) return key;
    // Clave corrupta o truncada: se regenera. Los secretos viejos quedan
    // ilegibles, pero es preferible a cifrar con una clave invalida.
  }
  const key = crypto.randomBytes(KEY_BYTES);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(keyFile, key.toString('base64'), { encoding: 'utf8', mode: 0o600 });
  try { fs.chmodSync(keyFile, 0o600); } catch (e) { /* FS sin permisos POSIX */ }
  return key;
}

// Solo lee: no crea la clave si no existe. Desencriptar sin clave no puede
// "arreglarse" generando una nueva, y crearla ahi enmascaraba el problema
// real (el archivo se copio sin su clave).
function loadLocalKey(dir) {
  const keyFile = localKeyPath(dir);
  if (!fs.existsSync(keyFile)) return null;
  const key = Buffer.from(fs.readFileSync(keyFile, 'utf8').trim(), 'base64');
  return key.length === KEY_BYTES ? key : null;
}

function encrypt(plaintext, dir) {
  const key = loadOrCreateLocalKey(dir);
  const iv = crypto.randomBytes(IV_BYTES);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([c.update(String(plaintext), 'utf8'), c.final()]);
  return {
    __enc: ENVELOPE_VERSION,
    alg: ALG_LOCALKEY,
    data: Buffer.concat([iv, c.getAuthTag(), body]).toString('base64'),
  };
}

function decrypt(envelope, dir) {
  if (!isEnvelope(envelope)) throw new Error('Sobre de cifrado invalido');

  if (envelope.alg === ALG_DPAPI_HISTORICO) {
    throw new Error(
      'Este historial se cifro con DPAPI de Windows, que ya no se usa porque ' +
      'requeria ejecutar PowerShell y el antivirus lo bloquea. Hay que volver a ' +
      'ingresar las passwords una vez; el resto de los datos de conexion se ' +
      'conservan.'
    );
  }
  if (envelope.alg !== ALG_LOCALKEY) {
    throw new Error('Algoritmo de cifrado desconocido: ' + envelope.alg);
  }

  const key = loadLocalKey(dir);
  if (!key) {
    throw new Error('Falta la clave de cifrado (' + localKeyPath(dir) + '). ' +
                    'Si el archivo de conexiones se copio de otra carpeta, hay que ' +
                    'copiar tambien secret.key, o volver a ingresar las passwords.');
  }

  const raw = Buffer.from(envelope.data, 'base64');
  const iv = raw.subarray(0, IV_BYTES);
  const tag = raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const body = raw.subarray(IV_BYTES + TAG_BYTES);
  const d = crypto.createDecipheriv('aes-256-gcm', key, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(body), d.final()]).toString('utf8');
}

function isEnvelope(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
         value.__enc === ENVELOPE_VERSION && typeof value.data === 'string';
}

module.exports = {
  encrypt,
  decrypt,
  isEnvelope,
  localKeyPath,
  ENVELOPE_VERSION,
  ALG_LOCALKEY,
  ALG_DPAPI_HISTORICO,
};
