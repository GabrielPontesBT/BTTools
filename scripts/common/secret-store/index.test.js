const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { createSecretStore, resolveSecretsDir, APP_DIR_NAME } = require('./index');

// Cipher falso: reversible, sin PowerShell ni AES. Los tests de este archivo
// prueban la logica de archivo (rutas, migracion, corrupcion, atomicidad),
// no la criptografia -- eso lo cubre cipher.test.js con DPAPI de verdad.
// Inyectarlo mantiene esta suite en el presupuesto de gate test (<2s).
function cipherFalso(opts) {
  const o = opts || {};
  return {
    encrypt(plaintext) {
      if (o.fallaAlEncriptar) throw new Error('boom encrypt');
      return { __enc: 'v1', alg: 'fake', data: Buffer.from(plaintext, 'utf8').toString('base64') };
    },
    decrypt(envelope) {
      if (o.fallaAlDesencriptar) throw new Error('DPAPI no puede abrir esto');
      return Buffer.from(envelope.data, 'base64').toString('utf8');
    },
    isEnvelope(v) {
      return !!v && typeof v === 'object' && v.__enc === 'v1' && typeof v.data === 'string';
    },
  };
}

function carpetaTemp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'btapi-secret-store-'));
}

function entradas() {
  return [
    {
      id: '1', key: 'V4|ora|h|u', version: 'V4', platform: 'oracle', label: 'Desa',
      db: { user: 'u', password: 'pw-db', connectString: 'h:1521/s' },
      api: { publica: { API_USER: 'a', API_PASSWORD: 'pw-api' } },
    },
    {
      id: '2', platform: 'sqlserver', label: 'Otra',
      db: { server: 's', port: '1433', database: 'd', user: 'u2', password: 'pw-ss' },
      api: {},
    },
  ];
}

// Cada test arma su propio store con carpeta temporal propia, asi que no
// hay orden ni estado compartido entre tests.
function store(opts) {
  const o = opts || {};
  const dir = o.dir || carpetaTemp();
  const avisos = [];
  const s = createSecretStore({
    dir,
    legacyFile: o.legacyFile,
    cipher: o.cipher || cipherFalso(o.cipherOpts),
    warn(msg) { avisos.push(msg); },
  });
  return { s, dir, avisos };
}

test('write y read hacen round-trip completo de las passwords', () => {
  const { s } = store();
  s.write(entradas());
  assert.deepEqual(s.read(), entradas());
});

test('el archivo en disco NO tiene las passwords en texto plano', () => {
  const { s } = store();
  s.write(entradas());
  const crudo = fs.readFileSync(s.file, 'utf8');

  assert.ok(!crudo.includes('pw-db'), 'la password de base no aparece en claro');
  assert.ok(!crudo.includes('pw-api'), 'la password de api no aparece en claro');
  assert.ok(!crudo.includes('pw-ss'), 'la password de sqlserver no aparece en claro');
  assert.ok(crudo.includes('"u"'), 'el usuario si queda en claro, no es secreto');
  assert.ok(crudo.includes('Desa'), 'el label queda en claro');
});

test('read sin archivo y sin legacy devuelve lista vacia', () => {
  const { s } = store();
  assert.deepEqual(s.read(), []);
});

test('write sin secretos deja vault en null y read lo tolera', () => {
  const { s } = store();
  s.write([{ id: '9', platform: 'oracle', db: { user: 'u', connectString: 'c' } }]);
  const parsed = JSON.parse(fs.readFileSync(s.file, 'utf8'));
  assert.equal(parsed.vault, null);
  assert.deepEqual(s.read(), [{ id: '9', platform: 'oracle', db: { user: 'u', connectString: 'c' } }]);
});

test('write es atomico: no queda el .tmp dando vueltas', () => {
  const { s, dir } = store();
  s.write(entradas());
  const sobrantes = fs.readdirSync(dir).filter(f => f.endsWith('.tmp'));
  assert.deepEqual(sobrantes, []);
});

test('write dos veces reemplaza, no acumula', () => {
  const { s } = store();
  s.write(entradas());
  s.write([entradas()[0]]);
  assert.equal(s.read().length, 1);
});

// ── Migracion del archivo viejo ──────────────────────────────

test('migra el db_history.json viejo en claro a la ubicacion nueva encriptada', () => {
  const dirLegacy = carpetaTemp();
  const legacyFile = path.join(dirLegacy, 'db_history.json');
  fs.writeFileSync(legacyFile, JSON.stringify(entradas(), null, 2), 'utf8');

  const { s, avisos } = store({ legacyFile });

  assert.deepEqual(s.read(), entradas(), 'las conexiones se conservan enteras');
  assert.ok(fs.existsSync(s.file), 'quedo escrito el archivo nuevo');
  const crudo = fs.readFileSync(s.file, 'utf8');
  assert.ok(!crudo.includes('pw-db'), 'y ya esta encriptado');
  assert.ok(avisos.some(a => a.includes('migradas 2 conexiones')), 'avisa que migro');
});

test('la migracion NO borra el archivo viejo: eso lo decide el usuario', () => {
  const dirLegacy = carpetaTemp();
  const legacyFile = path.join(dirLegacy, 'db_history.json');
  fs.writeFileSync(legacyFile, JSON.stringify(entradas(), null, 2), 'utf8');

  const { s } = store({ legacyFile });
  s.read();
  assert.ok(fs.existsSync(legacyFile), 'el viejo sigue ahi');
});

test('la migracion corre una sola vez: despues lee el archivo nuevo', () => {
  const dirLegacy = carpetaTemp();
  const legacyFile = path.join(dirLegacy, 'db_history.json');
  fs.writeFileSync(legacyFile, JSON.stringify(entradas(), null, 2), 'utf8');

  const { s, avisos } = store({ legacyFile });
  s.read();
  const avisosDespuesDe1 = avisos.length;

  // Se cambia el archivo viejo: si la migracion volviera a correr, este
  // cambio se colaria al historial.
  fs.writeFileSync(legacyFile, JSON.stringify([{ id: 'X', db: { user: 'intruso', password: 'p' } }]), 'utf8');

  assert.deepEqual(s.read(), entradas(), 'sigue leyendo lo migrado, no el viejo');
  assert.equal(avisos.length, avisosDespuesDe1, 'no vuelve a avisar de migracion');
});

test('un legacy vacio o inexistente no dispara migracion', () => {
  const dirLegacy = carpetaTemp();
  const vacio = path.join(dirLegacy, 'db_history.json');
  fs.writeFileSync(vacio, '[]', 'utf8');

  const a = store({ legacyFile: vacio });
  assert.deepEqual(a.s.read(), []);
  assert.ok(!fs.existsSync(a.s.file), 'no escribe un archivo nuevo por nada');

  const b = store({ legacyFile: path.join(dirLegacy, 'no-existe.json') });
  assert.deepEqual(b.s.read(), []);
});

test('legacyLeftover detecta el archivo viejo con passwords y cuenta cuantas', () => {
  const dirLegacy = carpetaTemp();
  const legacyFile = path.join(dirLegacy, 'db_history.json');
  fs.writeFileSync(legacyFile, JSON.stringify(entradas()), 'utf8');

  const { s } = store({ legacyFile });
  assert.deepEqual(s.legacyLeftover(), { file: legacyFile, conPassword: 2 });
});

test('legacyLeftover devuelve null si el viejo ya no tiene passwords', () => {
  const dirLegacy = carpetaTemp();
  const legacyFile = path.join(dirLegacy, 'db_history.json');
  const sinPass = entradas().map(e => Object.assign({}, e, {
    db: Object.assign({}, e.db, { password: '' }),
    api: { publica: { API_USER: 'a', API_PASSWORD: '' } },
  }));
  fs.writeFileSync(legacyFile, JSON.stringify(sinPass), 'utf8');

  const { s } = store({ legacyFile });
  assert.equal(s.legacyLeftover(), null);
});

test('legacyLeftover devuelve null si no hay archivo viejo ni ruta configurada', () => {
  const dirLegacy = carpetaTemp();
  assert.equal(store({ legacyFile: path.join(dirLegacy, 'nada.json') }).s.legacyLeftover(), null);
  assert.equal(store().s.legacyLeftover(), null);
});

// ── Casos de archivo roto ────────────────────────────────────

test('un archivo corrupto se aparta en .corrupto y no se pierde', () => {
  const { s, avisos } = store();
  fs.mkdirSync(s.dir, { recursive: true });
  fs.writeFileSync(s.file, '{ esto no es json', 'utf8');

  assert.deepEqual(s.read(), [], 'arranca vacio en vez de romper');
  assert.ok(fs.existsSync(s.file + '.corrupto'), 'el contenido original quedo a mano');
  assert.equal(fs.readFileSync(s.file + '.corrupto', 'utf8'), '{ esto no es json');
  assert.ok(avisos.some(a => a.includes('no se pudo leer')));
});

test('si no se puede desencriptar, devuelve las conexiones sin password en vez de romper', () => {
  const dir = carpetaTemp();
  store({ dir }).s.write(entradas());

  const { s, avisos } = store({ dir, cipherOpts: { fallaAlDesencriptar: true } });
  const leidas = s.read();

  assert.equal(leidas.length, 2, 'las conexiones siguen ahi');
  assert.equal(leidas[0].db.user, 'u', 'con todo lo que no es secreto');
  assert.equal(leidas[0].db.password, '', 'pero sin password: hay que reingresarla');
  assert.ok(avisos.some(a => a.includes('no se pudieron desencriptar')));
});

test('un __format desconocido no se interpreta a la fuerza', () => {
  const { s, avisos } = store();
  fs.mkdirSync(s.dir, { recursive: true });
  fs.writeFileSync(s.file, JSON.stringify({ __format: 'btapi-db-history/99', entries: [{ id: 'x' }] }), 'utf8');

  assert.deepEqual(s.read(), []);
  assert.ok(avisos.some(a => a.includes('formato desconocido')));
});

test('un archivo nuevo que quedo en formato viejo se lee igual y avisa', () => {
  const { s, avisos } = store();
  fs.mkdirSync(s.dir, { recursive: true });
  fs.writeFileSync(s.file, JSON.stringify(entradas()), 'utf8');

  assert.deepEqual(s.read(), entradas(), 'no se pierde el historial');
  assert.ok(avisos.some(a => a.includes('formato viejo sin encriptar')));
});

// ── Resolucion de rutas ──────────────────────────────────────

test('BTAPI_SECRETS_DIR pisa la ruta por plataforma', () => {
  assert.equal(resolveSecretsDir({ BTAPI_SECRETS_DIR: 'D:/ruta/propia' }, 'win32'), 'D:/ruta/propia');
  assert.equal(resolveSecretsDir({ BTAPI_SECRETS_DIR: '/tmp/x' }, 'linux'), '/tmp/x');
});

test('en Windows la carpeta cuelga de APPDATA, fuera del repo', () => {
  const dir = resolveSecretsDir({ APPDATA: 'C:\\Users\\x\\AppData\\Roaming' }, 'win32');
  assert.equal(dir, path.join('C:\\Users\\x\\AppData\\Roaming', APP_DIR_NAME));
});

test('en Windows sin APPDATA cae al perfil del usuario, nunca al cwd', () => {
  const dir = resolveSecretsDir({}, 'win32');
  assert.ok(dir.includes('AppData'), dir);
  assert.notEqual(path.resolve(dir), path.resolve(process.cwd()));
});

test('en linux respeta XDG_CONFIG_HOME', () => {
  assert.equal(resolveSecretsDir({ XDG_CONFIG_HOME: '/home/x/.config' }, 'linux'),
               path.join('/home/x/.config', 'herramienta-bantotal'));
});

test('en mac usa Application Support', () => {
  const dir = resolveSecretsDir({}, 'darwin');
  assert.ok(dir.includes(path.join('Library', 'Application Support')), dir);
});

test('la ruta resuelta nunca cae dentro del repo (la falla original)', () => {
  const repo = path.resolve(__dirname, '..', '..', '..');
  ['win32', 'darwin', 'linux'].forEach(function (plat) {
    const dir = path.resolve(resolveSecretsDir({ APPDATA: 'C:\\Users\\x\\AppData\\Roaming' }, plat));
    assert.ok(!dir.startsWith(repo), plat + ' resolvio dentro del repo: ' + dir);
  });
});
