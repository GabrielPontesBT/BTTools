const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const cipher = require('./cipher');

function carpetaTemp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'btapi-cipher-'));
}

// Password ficticia, con la forma de las reales que maneja la herramienta:
// lo que importa es el '$', que es el caracter que rompe si el texto en
// claro viaja por la linea de comandos de PowerShell en vez de por stdin.
// Ficticia a proposito: meter una password real en un test es la misma
// falla que este modulo existe para arreglar.
const PASSWORD_CON_DOLAR = 'Ficticia$2026';

test('isEnvelope solo acepta sobres bien formados', () => {
  assert.equal(cipher.isEnvelope({ __enc: 'v1', alg: 'x', data: 'abc' }), true);
  assert.equal(cipher.isEnvelope({ __enc: 'v2', alg: 'x', data: 'abc' }), false);
  assert.equal(cipher.isEnvelope({ __enc: 'v1', alg: 'x' }), false, 'sin data');
  assert.equal(cipher.isEnvelope('texto'), false);
  assert.equal(cipher.isEnvelope(null), false);
  assert.equal(cipher.isEnvelope([]), false);
});

test('decrypt rechaza un sobre invalido con mensaje claro', () => {
  assert.throws(() => cipher.decrypt(null, carpetaTemp()), /Sobre de cifrado invalido/);
  assert.throws(() => cipher.decrypt({ __enc: 'v1', alg: 'inventado', data: 'x' }, carpetaTemp()),
                /Algoritmo de cifrado desconocido: inventado/);
});

// ── DPAPI (solo Windows) ─────────────────────────────────────
//
// Cada llamada spawnea PowerShell (~1s de arranque), asi que este es el
// unico test lento del modulo y hace UN solo round-trip: encriptar +
// desencriptar son las 2 llamadas minimas para probar que DPAPI de verdad
// funciona. Todo lo demas se asserta sobre ese mismo par, sin spawns
// extra, para no pasarse del presupuesto de gate test.
//
// No se puede reemplazar por un mock: el bug que este test encontro
// (';' entre try y finally, error de sintaxis de PowerShell) solo aparece
// ejecutando PowerShell de verdad.

test('DPAPI: round-trip real de un blob de secretos', { skip: !cipher.IS_WINDOWS && 'requiere Windows' }, () => {
  const dir = carpetaTemp();
  const secretos = JSON.stringify({
    '1:db.password': PASSWORD_CON_DOLAR,
    '1:api.publica.API_PASSWORD': 'ficticia-api-pw',
    '2:db.password': 'con espacios y "comillas" y \'simples\' y ; punto y coma',
  });

  const degradaciones = [];
  const sobre = cipher.encrypt(secretos, dir, { onDowngrade(e) { degradaciones.push(e); } });

  assert.deepEqual(degradaciones, [], 'con DPAPI disponible no degrada ni avisa');
  assert.equal(sobre.alg, cipher.ALG_DPAPI);
  assert.equal(sobre.__enc, 'v1');
  assert.ok(sobre.data.length > 0);
  assert.ok(!sobre.data.includes(PASSWORD_CON_DOLAR), 'el cifrado no filtra el claro');
  assert.ok(!sobre.data.includes('ficticia-api-pw'));
  assert.ok(!fs.existsSync(cipher.localKeyPath(dir)), 'DPAPI no escribe ninguna clave en disco');
  assert.equal(cipher.decrypt(sobre, dir), secretos, 'vuelve identico');
});

// ── AES-256-GCM con clave local ──────────────────────────────
//
// Se testea en toda plataforma (no solo en la que lo usa por defecto)
// llamando a las funciones internas via el camino de sobre 'localkey'.

// encrypt() elige DPAPI cuando corre en Windows, asi que para ejercitar la
// rama de clave local en cualquier plataforma se arma el sobre a mano con
// la misma clave y el mismo layout (iv|tag|body) que usa cipher.js.
function sobreLocalKey(dir, claro) {
  const crypto = require('crypto');
  const key = crypto.randomBytes(32);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(cipher.localKeyPath(dir), key.toString('base64'), 'utf8');

  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([c.update(claro, 'utf8'), c.final()]);
  return {
    sobre: { __enc: 'v1', alg: cipher.ALG_LOCALKEY, data: Buffer.concat([iv, c.getAuthTag(), body]).toString('base64') },
    raw: Buffer.concat([iv, c.getAuthTag(), body]),
  };
}

test('clave local: round-trip con caracteres raros', () => {
  const dir = carpetaTemp();
  const claro = JSON.stringify({ a: PASSWORD_CON_DOLAR, b: 'ñ á ü € 中文 \n\t salto' });

  if (!cipher.IS_WINDOWS) {
    const s = cipher.encrypt(claro, dir);
    assert.equal(s.alg, cipher.ALG_LOCALKEY, 'fuera de Windows encrypt usa clave local');
    assert.equal(cipher.decrypt(s, dir), claro);
    return;
  }

  assert.equal(cipher.decrypt(sobreLocalKey(dir, claro).sobre, dir), claro);
});

test('clave local: la clave en disco es de 32 bytes', () => {
  const dir = carpetaTemp();
  const { sobre } = sobreLocalKey(dir, 'x');
  assert.equal(cipher.decrypt(sobre, dir), 'x');
  assert.equal(Buffer.from(fs.readFileSync(cipher.localKeyPath(dir), 'utf8').trim(), 'base64').length, 32);
});

test('clave local: un payload manipulado falla, no devuelve basura', () => {
  const dir = carpetaTemp();
  const { raw } = sobreLocalKey(dir, 'secreto');

  // Se voltea un bit del cuerpo: GCM lo tiene que detectar.
  raw[raw.length - 1] ^= 0x01;

  assert.throws(
    () => cipher.decrypt({ __enc: 'v1', alg: cipher.ALG_LOCALKEY, data: raw.toString('base64') }, dir),
    /auth/i
  );
});

// ── Degradacion cuando DPAPI no esta disponible ──────────────
//
// Caso real, visto durante el desarrollo: `spawnSync powershell.exe EPERM`
// cuando el proceso corre bajo una politica que bloquea PowerShell
// (AppLocker, EDR, sandbox). Antes de este fallback la app no guardaba
// nada; ahora guarda con clave local y lo dice.

test('sin DPAPI, encrypt cae a clave local, avisa, y lo guardado se puede leer', { skip: !cipher.IS_WINDOWS && 'la rama de degradacion solo existe en Windows' }, () => {
  const dir = carpetaTemp();
  const claro = JSON.stringify({ '1:db.password': 'Ficticia$2026' });
  const avisos = [];

  const sobre = cipher.encrypt(claro, dir, {
    // Reproduce el error real: spawnSync powershell.exe EPERM.
    dpapiEncrypt() { throw new Error('spawnSync powershell.exe EPERM'); },
    onDowngrade(e) { avisos.push(e.message); },
  });

  assert.equal(sobre.alg, cipher.ALG_LOCALKEY, 'degrado a clave local');
  assert.deepEqual(avisos, ['spawnSync powershell.exe EPERM'], 'y lo dijo');
  assert.ok(!sobre.data.includes('Ficticia$2026'), 'sigue estando encriptado');
  assert.equal(cipher.decrypt(sobre, dir), claro, 'y se puede volver a leer');
  assert.ok(fs.existsSync(cipher.localKeyPath(dir)), 'escribio la clave local');
});

test('un sobre localkey se sigue pudiendo abrir aunque DPAPI ande', () => {
  const dir = carpetaTemp();
  const { sobre } = sobreLocalKey(dir, 'guardado-cuando-no-habia-dpapi');
  assert.equal(cipher.decrypt(sobre, dir), 'guardado-cuando-no-habia-dpapi',
               'el alg del sobre manda, no la capacidad de la maquina');
});

test('un sobre DPAPI no se puede abrir fuera de Windows: error explicito', { skip: cipher.IS_WINDOWS && 'este caso solo aplica fuera de Windows' }, () => {
  assert.throws(
    () => cipher.decrypt({ __enc: 'v1', alg: cipher.ALG_DPAPI, data: 'abc' }, carpetaTemp()),
    /no es una maquina Windows/
  );
});
