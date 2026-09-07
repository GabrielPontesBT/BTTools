// ============================================================
// Cifrado de los secretos del historial de conexiones.
//
// En Windows usa DPAPI (CurrentUser), que es lo correcto para este
// caso: la clave la administra Windows y esta atada a la cuenta de
// usuario, asi que el archivo copiado a otra maquina, subido a git
// o mandado por chat NO se puede abrir. Es exactamente la amenaza
// que se materializo (ver README.md).
//
// Se llega a DPAPI por PowerShell y no por un modulo nativo a
// proposito: cero dependencias nuevas (regla de "vanilla por
// defecto" en CLAUDE.md) y nada que recompilar por version de
// Electron. El precio es ~300ms por operacion, y por eso
// vault-format.js encripta un solo blob y no campo por campo.
//
// Fuera de Windows cae a AES-256-GCM con una clave local en la
// misma carpeta (modo 0600). Es mas debil que DPAPI porque la
// clave vive al lado del dato, y esta etiquetado como tal en el
// archivo. Igual cumple lo importante: el archivo esta fuera del
// repo y su contenido no es legible de un cat.
//
// Lo que NINGUNA de las dos resuelve: la app necesita la password
// en claro para conectarse a Oracle/SQL Server, asi que codigo
// corriendo como tu usuario en tu maquina siempre la puede
// recuperar. Para eso la unica respuesta real es no guardarla y
// pedirla en cada arranque.
// ============================================================

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ENVELOPE_VERSION = 'v1';
const ALG_DPAPI = 'dpapi-currentuser';
const ALG_LOCALKEY = 'aes-256-gcm-localkey';

const IS_WINDOWS = process.platform === 'win32';

// ── DPAPI via PowerShell ─────────────────────────────────────
//
// El texto en claro entra y sale por stdin/stdout, nunca por la linea de
// comandos: los argumentos de un proceso son visibles para cualquier otro
// proceso del sistema (Get-Process, tasklist), stdin no.

// Las lineas se unen con \n y no con ';' porque un ';' entre el bloque
// try y el finally es un error de sintaxis en PowerShell
// ("Falta un bloque Catch o Finally").
const PS_ENCRYPT = [
  '$ErrorActionPreference = "Stop"',
  '$plain = [Console]::In.ReadToEnd()',
  '$secure = ConvertTo-SecureString -String $plain -AsPlainText -Force',
  '[Console]::Out.Write((ConvertFrom-SecureString -SecureString $secure))',
].join('\n');

const PS_DECRYPT = [
  '$ErrorActionPreference = "Stop"',
  '$enc = [Console]::In.ReadToEnd().Trim()',
  '$secure = ConvertTo-SecureString -String $enc',
  '$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)',
  'try { [Console]::Out.Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)) }',
  'finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }',
].join('\n');

function runPowerShell(script, input) {
  return execFileSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
    {
      input,
      encoding: 'utf8',
      windowsHide: true,
      // Un blob de secretos son unos pocos KB; 1MB es holgura de sobra y
      // evita que un archivo raro haga colgar el proceso.
      maxBuffer: 1024 * 1024,
    }
  );
}

function dpapiEncrypt(plaintext) {
  return runPowerShell(PS_ENCRYPT, plaintext).trim();
}

function dpapiDecrypt(payload) {
  return runPowerShell(PS_DECRYPT, payload);
}

// ── AES-256-GCM con clave local (no Windows) ─────────────────

function localKeyPath(dir) {
  return path.join(dir, 'secret.key');
}

function loadOrCreateLocalKey(dir) {
  const keyFile = localKeyPath(dir);
  if (fs.existsSync(keyFile)) {
    const key = Buffer.from(fs.readFileSync(keyFile, 'utf8').trim(), 'base64');
    if (key.length === 32) return key;
    // Clave corrupta o truncada: se regenera. Los secretos viejos quedan
    // ilegibles, pero es preferible a encriptar con una clave invalida.
  }
  const key = crypto.randomBytes(32);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(keyFile, key.toString('base64'), { encoding: 'utf8', mode: 0o600 });
  try { fs.chmodSync(keyFile, 0o600); } catch (e) { /* FS sin permisos POSIX */ }
  return key;
}

function localEncrypt(plaintext, dir) {
  const key = loadOrCreateLocalKey(dir);
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([c.update(plaintext, 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), body]).toString('base64');
}

function localDecrypt(payload, dir) {
  const key = loadOrCreateLocalKey(dir);
  const raw = Buffer.from(payload, 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const body = raw.subarray(28);
  const d = crypto.createDecipheriv('aes-256-gcm', key, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(body), d.final()]).toString('utf8');
}

// ── API publica ──────────────────────────────────────────────

// El algoritmo se guarda en el sobre y no se asume al desencriptar, para
// que un archivo escrito en Windows y abierto en otra plataforma (o al
// reves) falle con un error claro en vez de con basura.
//
// Si DPAPI no esta disponible (PowerShell bloqueado por politica de
// dominio, AppLocker, EDR: se vio EPERM en spawnSync) se cae a la clave
// local en vez de no guardar nada. Es una degradacion real y por eso
// queda registrada en el sobre y se avisa: mejor cifrado mas debil que
// perder el historial de conexiones, y mucho mejor que texto plano.
// opts.onDowngrade(err) se llama si hubo que degradar. opts.dpapiEncrypt
// existe para los tests: es la unica forma de ejercitar la rama de
// degradacion en una maquina donde PowerShell SI funciona.
function encrypt(plaintext, dir, opts) {
  const o = opts || {};
  const encDpapi = o.dpapiEncrypt || dpapiEncrypt;

  if (IS_WINDOWS) {
    try {
      return { __enc: ENVELOPE_VERSION, alg: ALG_DPAPI, data: encDpapi(plaintext) };
    } catch (e) {
      if (typeof o.onDowngrade === 'function') o.onDowngrade(e);
    }
  }
  return { __enc: ENVELOPE_VERSION, alg: ALG_LOCALKEY, data: localEncrypt(plaintext, dir) };
}

function decrypt(envelope, dir) {
  if (!isEnvelope(envelope)) throw new Error('Sobre de cifrado invalido');
  if (envelope.alg === ALG_DPAPI) {
    if (!IS_WINDOWS) {
      throw new Error('Los secretos se encriptaron con DPAPI de Windows y esta no es una maquina Windows');
    }
    return dpapiDecrypt(envelope.data);
  }
  if (envelope.alg === ALG_LOCALKEY) return localDecrypt(envelope.data, dir);
  throw new Error('Algoritmo de cifrado desconocido: ' + envelope.alg);
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
  ALG_DPAPI,
  ALG_LOCALKEY,
  IS_WINDOWS,
};
