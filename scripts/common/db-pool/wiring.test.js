'use strict';

// ============================================================
// Gate estructural del cableado, no de la logica.
//
// index.test.js prueba que el pool cachea. Estos tests prueban que
// nadie lo esquiva: leen el codigo y verifican que la unica forma de
// llegar a la base sea a traves de scripts/common/db-pool.
//
// Mismo criterio que los guardias de secret-store contra el spawn de
// PowerShell: si alguien vuelve a meter un `new ConnectionPool()` en
// una ruta, lo frena el commit y no el usuario notando que la
// herramienta abre una conexion por request.
// ============================================================

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..', '..');
const SETUP = fs.readFileSync(path.join(ROOT, 'setup.js'), 'utf8');
const POOL_MODULE = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');

/** Lineas de codigo (sin comentarios de linea) que matchean un patron. */
function lineasQueMatchean(texto, re) {
  return texto.split('\n')
    .map(function (l, i) { return { n: i + 1, l: l }; })
    .filter(function (x) { return !/^\s*(\/\/|\*|\/\*)/.test(x.l); })
    .filter(function (x) { return re.test(x.l); });
}

test('setup.js no construye ningun ConnectionPool de mssql por su cuenta', () => {
  const hits = lineasQueMatchean(SETUP, /new\s+mssql\.ConnectionPool/);
  assert.deepStrictEqual(
    hits.map(function (h) { return h.n; }),
    [],
    'Toda conexion de SQL Server tiene que pedirse con sg_getPool(db). Lineas: ' +
      hits.map(function (h) { return h.n; }).join(', ')
  );
});

test('setup.js no llama oracledb.getConnection por su cuenta', () => {
  // createPool + pool.getConnection() es el camino correcto y vive en
  // el modulo. Un getConnection() directo sobre el driver abre una
  // conexion dedicada, fuera del pool.
  const hits = lineasQueMatchean(SETUP, /oracledb\.getConnection\s*\(/);
  assert.deepStrictEqual(
    hits.map(function (h) { return h.n; }),
    [],
    'Toda conexion de Oracle tiene que pedirse con sg_getOra(db). Lineas: ' +
      hits.map(function (h) { return h.n; }).join(', ')
  );
});

test('setup.js no cierra el pool compartido de SQL Server', () => {
  // `pool` en las rutas es el pool COMPARTIDO. Un pool.close() lo saca
  // de circulacion para el resto de la app: el proximo pedido de
  // cualquier herramienta reconecta.
  const hits = lineasQueMatchean(SETUP, /\bpool\.close\s*\(/);
  assert.deepStrictEqual(hits.map(function (h) { return h.n; }), [],
    'Cerrar el pool compartido lo invalida para toda la app. Lineas: ' +
      hits.map(function (h) { return h.n; }).join(', '));
});

test('setup.js no resuelve los drivers a mano: usa sg_findModule', () => {
  // Los path.join(ROOT,'V3','node_modules','mssql') de las 7 funciones
  // viejas se fueron con la unificacion. sg_findModule es el unico
  // resolvedor, y es el que aplica fetchAsString para los CLOB.
  // El literal del nombre del driver es lo que distingue el patron
  // viejo del resolvedor: sg_findModule arma los candidatos con la
  // variable `name`, mientras las 7 funciones viejas hardcodeaban
  // 'mssql' y 'oracledb' dentro del path.
  const hits = lineasQueMatchean(SETUP, /path\.join\(ROOT,\s*'V[34]',\s*'node_modules',\s*'(mssql|oracledb)'\)/);
  assert.deepStrictEqual(hits.map(function (h) { return h.n; }), [],
    'Resolver el driver a mano saltea sg_findModule (y con el, fetchAsString para CLOB). Lineas: ' +
      hits.map(function (h) { return h.n; }).join(', '));
});

test('setup.js sigue teniendo un unico holder de pools', () => {
  assert.match(SETUP, /const \{ createDbPool \} = require\('\.\/scripts\/common\/db-pool'\)/);
  assert.strictEqual((SETUP.match(/createDbPool\(/g) || []).length, 1,
    'un solo createDbPool por proceso: dos holders son dos conexiones');
});

test('los tres wrappers siguen existiendo con hoisting', () => {
  // Las funciones del flujo de documentar estan definidas mas arriba en
  // el archivo y llaman sg_getPool/sg_getOra por nombre. Si alguien los
  // pasa a `const`, quedan en TDZ para ese codigo.
  for (const nombre of ['sg_getPool', 'sg_getOra', 'sg_testConn']) {
    assert.match(SETUP, new RegExp('async function ' + nombre + '\\s*\\('),
      nombre + ' tiene que seguir siendo function declaration, no const');
  }
});

test('las funciones del flujo de documentar piden la conexion al pool', () => {
  // Las 5 que quedaron (testSqlServer/testOracle se fusionaron en
  // sg_testConn). Cada una tiene que tener sus dos ramas cableadas.
  const funciones = ['queryServices', 'queryServicesWithMethods', 'queryMethods', 'queryInputParams', 'queryMethodSchema'];
  for (const fn of funciones) {
    const ini = SETUP.indexOf('async function ' + fn + '(');
    assert.ok(ini > 0, fn + ' no existe mas en setup.js');
    // El cuerpo va hasta la proxima declaracion de funcion top-level.
    const resto = SETUP.slice(ini + 1);
    const sig = resto.search(/\nasync function |\nfunction |\nconst \w+Feature = /);
    const cuerpo = sig > 0 ? resto.slice(0, sig) : resto;
    assert.match(cuerpo, /await sg_getPool\(db\)/, fn + ': la rama de SQL Server no usa el pool');
    assert.match(cuerpo, /await sg_getOra\(db\)/, fn + ': la rama de Oracle no usa el pool');
  }
});

test('testSqlServer y testOracle no volvieron', () => {
  // Se fusionaron en sg_testConn. Si reaparecen es que alguien
  // reintrodujo el camino de conexion descartable.
  assert.doesNotMatch(SETUP, /function testSqlServer/);
  assert.doesNotMatch(SETUP, /function testOracle/);
  assert.match(SETUP, /await sg_testConn\(platform, db\)/);
});

test('la traza de conexion nunca imprime la password', () => {
  // describir() se usa en las lineas que van a la consola y al log de
  // Electron. Tiene que armar la descripcion con user/host, no con la
  // password.
  const ini = POOL_MODULE.indexOf('function describir(db)');
  const cuerpo = POOL_MODULE.slice(ini, POOL_MODULE.indexOf('\n}', ini));
  assert.ok(ini > 0, 'describir() no existe');
  assert.doesNotMatch(cuerpo, /password/, 'describir() no puede tocar la password');
});

test('el modulo del pool no depende de setup.js ni de rutas del proyecto', () => {
  // Es lo que lo hace testeable: drivers inyectados, cero require de
  // modulos del proyecto.
  const requires = POOL_MODULE.match(/require\([^)]*\)/g) || [];
  assert.deepStrictEqual(requires, [], 'el modulo tiene que ser autocontenido');
});
