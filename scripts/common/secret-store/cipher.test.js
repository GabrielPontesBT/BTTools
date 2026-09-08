const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const cipher = require('./cipher');

function carpetaTemp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'btapi-cipher-'));
}

// Valores ficticios, con los caracteres que mas rompen: '$' y ';' (que
// eran veneno cuando esto pasaba por la linea de comandos de PowerShell),
// comillas, acentos, CJK y saltos de linea.
const RAROS = 'Con$igna;2020 "dobles" \'simples\' ñ á ü € 中文\nsalto\ttab';

// ── La regla que motivo saca DPAPI ───────────────────────────
//
// Kaspersky Adaptive Anomaly Control bloquea "Start of PowerShell from the
// JScript script". La version anterior de este modulo llegaba a DPAPI
// ejecutando PowerShell, asi que cada guardado de una conexion disparaba
// ese bloqueo. Este test es el que evita que vuelva a entrar.

test('el modulo no ejecuta PowerShell ni ningun proceso externo', () => {
  const src = fs.readFileSync(path.join(__dirname, 'cipher.js'), 'utf8');
  const codigo = src
    .split('\n')
    .filter(function (l) { return !/^\s*(\/\/|\*|\/\*)/.test(l); })
    .join('\n');

  // Lo que dispara la regla de Kaspersky es LANZAR un proceso, no nombrarlo:
  // el mensaje de error del sobre viejo menciona PowerShell a proposito, para
  // explicar por que ya no se puede abrir.
  assert.ok(!/child_process|execFileSync|execSync|spawnSync|spawn\s*\(/.test(codigo),
    'no debe lanzar procesos externos: es justo el patron que el antivirus corta ' +
    '("Start of PowerShell from the JScript script")');
  assert.ok(!/['"`][^'"`]*powershell(\.exe)?['"`]/i.test(codigo),
    'aparecio powershell como nombre de ejecutable, o sea alguien lo volvio a invocar');
});

test('el store tampoco lanza procesos externos', () => {
  const src = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');
  assert.ok(!/child_process|powershell/i.test(src));
});

// ── Round-trip ───────────────────────────────────────────────

test('round-trip de un blob de secretos', () => {
  const dir = carpetaTemp();
  const secretos = JSON.stringify({
    '1:db.password': RAROS,
    '1:api.publica.API_PASSWORD': 'otra-ficticia',
    '2:db.password': '',
  });

  const sobre = cipher.encrypt(secretos, dir);

  assert.equal(sobre.alg, cipher.ALG_LOCALKEY);
  assert.equal(sobre.__enc, 'v1');
  assert.ok(!sobre.data.includes(RAROS), 'el cifrado no filtra el claro');
  assert.ok(!sobre.data.includes('otra-ficticia'));
  assert.equal(cipher.decrypt(sobre, dir), secretos, 'vuelve identico');
});

test('dos cifrados del mismo texto dan payloads distintos (iv aleatorio)', () => {
  const dir = carpetaTemp();
  const a = cipher.encrypt('mismo texto', dir);
  const b = cipher.encrypt('mismo texto', dir);
  assert.notEqual(a.data, b.data, 'un iv fijo permitiria comparar secretos entre si');
  assert.equal(cipher.decrypt(a, dir), 'mismo texto');
  assert.equal(cipher.decrypt(b, dir), 'mismo texto');
});

test('un texto vacio tambien hace round-trip', () => {
  const dir = carpetaTemp();
  assert.equal(cipher.decrypt(cipher.encrypt('', dir), dir), '');
});

// ── La clave local ───────────────────────────────────────────

test('la clave se crea con 32 bytes y se reusa entre cifrados', () => {
  const dir = carpetaTemp();
  const a = cipher.encrypt('x', dir);
  const claveDespuesDelPrimero = fs.readFileSync(cipher.localKeyPath(dir), 'utf8');

  cipher.encrypt('y', dir);
  const claveDespuesDelSegundo = fs.readFileSync(cipher.localKeyPath(dir), 'utf8');

  assert.equal(claveDespuesDelPrimero, claveDespuesDelSegundo, 'no puede regenerarse');
  assert.equal(Buffer.from(claveDespuesDelPrimero.trim(), 'base64').length, 32);
  assert.equal(cipher.decrypt(a, dir), 'x', 'y el primer sobre sigue abriendose');
});

test('una clave truncada se regenera en vez de cifrar con algo invalido', () => {
  const dir = carpetaTemp();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(cipher.localKeyPath(dir), 'muycorta', 'utf8');

  const sobre = cipher.encrypt('dato', dir);
  assert.equal(Buffer.from(fs.readFileSync(cipher.localKeyPath(dir), 'utf8').trim(), 'base64').length, 32);
  assert.equal(cipher.decrypt(sobre, dir), 'dato');
});

test('desencriptar sin la clave falla con un mensaje que dice que hacer', () => {
  const dir = carpetaTemp();
  const sobre = cipher.encrypt('dato', dir);
  fs.unlinkSync(cipher.localKeyPath(dir));

  assert.throws(() => cipher.decrypt(sobre, dir), /Falta la clave de cifrado/);
  // Y no la vuelve a crear: generar una clave nueva no arregla nada y
  // esconderia que el archivo se copio sin su clave.
  assert.equal(fs.existsSync(cipher.localKeyPath(dir)), false,
               'decrypt no debe crear la clave');
});

test('con la clave de otra carpeta no se puede abrir el sobre', () => {
  const dirA = carpetaTemp();
  const dirB = carpetaTemp();
  const sobre = cipher.encrypt('secreto', dirA);
  cipher.encrypt('otra cosa', dirB); // genera una clave distinta en B

  assert.throws(() => cipher.decrypt(sobre, dirB), /unable to authenticate|auth/i);
});

// ── Integridad ───────────────────────────────────────────────

test('un payload manipulado falla, no devuelve basura', () => {
  const dir = carpetaTemp();
  const sobre = cipher.encrypt('secreto', dir);
  const raw = Buffer.from(sobre.data, 'base64');
  raw[raw.length - 1] ^= 0x01; // se voltea un bit del cuerpo

  assert.throws(
    () => cipher.decrypt({ __enc: 'v1', alg: cipher.ALG_LOCALKEY, data: raw.toString('base64') }, dir),
    /auth/i
  );
});

test('un authTag manipulado tambien falla', () => {
  const dir = carpetaTemp();
  const sobre = cipher.encrypt('secreto', dir);
  const raw = Buffer.from(sobre.data, 'base64');
  raw[13] ^= 0x01; // dentro del tag (bytes 12..27)

  assert.throws(
    () => cipher.decrypt({ __enc: 'v1', alg: cipher.ALG_LOCALKEY, data: raw.toString('base64') }, dir),
    /auth/i
  );
});

// ── Sobres viejos y sobres invalidos ─────────────────────────

test('un sobre de DPAPI da un mensaje que explica que reingresar las passwords', () => {
  // Los historiales cifrados por la version anterior ya no se pueden abrir:
  // abrirlos requeriria PowerShell, que es lo que se saco. El mensaje tiene
  // que decir que hacer, no tirar un error de cifrado generico.
  const err = (() => {
    try {
      cipher.decrypt({ __enc: 'v1', alg: cipher.ALG_DPAPI_HISTORICO, data: 'abc' }, carpetaTemp());
      return null;
    } catch (e) { return e; }
  })();

  assert.ok(err, 'tenia que fallar');
  assert.match(err.message, /DPAPI/);
  assert.match(err.message, /volver a ingresar las passwords/i);
  assert.match(err.message, /datos de conexion se\s+conservan/i);
});

test('decrypt rechaza sobres invalidos y algoritmos desconocidos', () => {
  const dir = carpetaTemp();
  assert.throws(() => cipher.decrypt(null, dir), /Sobre de cifrado invalido/);
  assert.throws(() => cipher.decrypt('texto', dir), /Sobre de cifrado invalido/);
  assert.throws(() => cipher.decrypt({ __enc: 'v2', alg: cipher.ALG_LOCALKEY, data: 'x' }, dir),
                /Sobre de cifrado invalido/);
  assert.throws(() => cipher.decrypt({ __enc: 'v1', alg: 'inventado', data: 'x' }, dir),
                /Algoritmo de cifrado desconocido: inventado/);
});

test('isEnvelope solo acepta sobres bien formados', () => {
  assert.equal(cipher.isEnvelope({ __enc: 'v1', alg: 'x', data: 'abc' }), true);
  assert.equal(cipher.isEnvelope({ __enc: 'v2', alg: 'x', data: 'abc' }), false);
  assert.equal(cipher.isEnvelope({ __enc: 'v1', alg: 'x' }), false, 'sin data');
  assert.equal(cipher.isEnvelope('texto'), false);
  assert.equal(cipher.isEnvelope(null), false);
  assert.equal(cipher.isEnvelope([]), false);
});

// ── Presupuesto de tiempo ────────────────────────────────────

test('cifrar y desencifrar es rapido: ya no hay proceso externo de por medio', () => {
  const dir = carpetaTemp();
  const inicio = Date.now();
  for (let i = 0; i < 50; i++) {
    cipher.decrypt(cipher.encrypt('dato ' + i, dir), dir);
  }
  const ms = Date.now() - inicio;
  // Con PowerShell cada operacion costaba ~1s: 100 operaciones eran ~100s.
  assert.ok(ms < 500, '100 operaciones tardaron ' + ms + 'ms, deberian ser decenas');
});
