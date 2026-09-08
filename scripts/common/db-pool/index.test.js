'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { EventEmitter } = require('node:events');

const { createDbPool, normalizeDb, sqlKey, oraKey, SQLSERVER_DEFAULT_PORT } = require('./index');

// ── Drivers falsos ──────────────────────────────────────────
// Cuentan cuantas veces se abrio una conexion de verdad. Es la unica
// metrica que interesa: el bug que se arreglo era "una conexion por
// request", asi que los tests miden conexiones, no queries.

function fakeMssql() {
  const abiertos = [];
  class ConnectionPool extends EventEmitter {
    constructor(cfg) {
      super();
      this.config = cfg;
      this.connected = false;
      this.closed = false;
      abiertos.push(this);
    }
    async connect() { this.connected = true; return this; }
    async close() { this.connected = false; this.closed = true; }
    request() { return { input() { return this; }, async query() { return { recordset: [] }; } }; }
  }
  return { mod: { ConnectionPool }, abiertos };
}

function fakeOracle(opciones) {
  const o = opciones || {};
  const abiertos = [];
  function crearPool() {
    const pool = new EventEmitter();
    pool.closed = false;
    pool.conexionesEntregadas = 0;
    pool.getConnection = async function () {
      if (o.getConnectionFalla) throw new Error('pool caido');
      pool.conexionesEntregadas++;
      return {
        closed: false,
        async close() { this.closed = true; },
        async execute() { return { rows: [] }; },
      };
    };
    pool.close = async function () { pool.closed = true; };
    abiertos.push(pool);
    return pool;
  }
  return {
    mod: {
      CLOB: 'CLOB',
      OUT_FORMAT_OBJECT: 4002,
      async createPool() { return crearPool(); },
    },
    abiertos,
  };
}

function armar(opciones) {
  const o = opciones || {};
  const sql = fakeMssql();
  const ora = fakeOracle(o.oracle);
  const avisos = [];
  const pool = createDbPool({
    findModule: function (name) {
      if (name === 'mssql') return sql.mod;
      if (name === 'oracledb') return ora.mod;
      throw new Error('modulo inesperado: ' + name);
    },
    log: function (msg, err) { avisos.push({ msg, err }); },
  });
  return { pool, sql, ora, avisos };
}

// Los dos shapes reales que produce el front (wizard-doc.js
// shapeDbApi y shapeDbSG) para la MISMA conexion.
const SS_VIEJO = { DB_SERVER: 'srv1', DB_PORT: '1433', DB_DATABASE: 'btv3', DB_USER: 'sa', DB_PASSWORD: 'p1' };
const SS_NUEVO = { server: 'srv1', port: '1433', database: 'btv3', user: 'sa', password: 'p1' };
const ORA_VIEJO = { DB_USER: 'bt', DB_PASSWORD: 'p2', DB_CONNECT_STRING: '10.0.0.7:1521/orcl' };
const ORA_NUEVO = { user: 'bt', password: 'p2', connectString: '10.0.0.7:1521/orcl' };

// ── normalizeDb ─────────────────────────────────────────────

test('normalizeDb: los dos shapes de la misma conexion dan el mismo objeto', () => {
  assert.deepStrictEqual(normalizeDb(SS_VIEJO), normalizeDb(SS_NUEVO));
  assert.deepStrictEqual(normalizeDb(ORA_VIEJO), normalizeDb(ORA_NUEVO));
});

test('normalizeDb: el orden de claves es fijo, asi que el JSON es canonico', () => {
  // Es lo que hace que la key de cache sea estable. Si alguien
  // reordena el objeto literal del modulo, esto falla.
  assert.strictEqual(
    JSON.stringify(normalizeDb(SS_NUEVO)),
    JSON.stringify(normalizeDb({ password: 'p1', user: 'sa', database: 'btv3', port: '1433', server: 'srv1' }))
  );
});

test('normalizeDb: port se normaliza a numero, asi "1433" y 1433 no parten el pool', () => {
  assert.strictEqual(normalizeDb({ port: '1433' }).port, 1433);
  assert.strictEqual(normalizeDb({ port: 1433 }).port, 1433);
  assert.strictEqual(sqlKey({ ...SS_NUEVO, port: 1433 }), sqlKey({ ...SS_NUEVO, port: '1433' }));
});

test('normalizeDb: el default de port se aplica al normalizar, no al conectar', () => {
  // Un caller que omite port y otro que manda 1433 tienen que caer en
  // la misma key. Si el default se aplicara recien en connect(),
  // serian dos pools contra la misma base.
  assert.strictEqual(normalizeDb({}).port, SQLSERVER_DEFAULT_PORT);
  assert.strictEqual(sqlKey({ server: 'srv1', database: 'btv3', user: 'sa', password: 'p1' }), sqlKey(SS_NUEVO));
});

test('normalizeDb: port invalido o vacio cae al default en vez de NaN', () => {
  assert.strictEqual(normalizeDb({ port: '' }).port, SQLSERVER_DEFAULT_PORT);
  assert.strictEqual(normalizeDb({ port: 'abc' }).port, SQLSERVER_DEFAULT_PORT);
  assert.strictEqual(normalizeDb({ port: 0 }).port, SQLSERVER_DEFAULT_PORT);
  assert.strictEqual(normalizeDb({ port: -1 }).port, SQLSERVER_DEFAULT_PORT);
});

test('normalizeDb: una password vacia es un valor valido, no un faltante', () => {
  assert.strictEqual(normalizeDb({ user: 'sa', password: '' }).password, '');
});

test('normalizeDb: tolera null/undefined sin explotar', () => {
  assert.strictEqual(normalizeDb(null).server, '');
  assert.strictEqual(normalizeDb(undefined).user, '');
});

test('sqlKey ignora connectString y oraKey ignora server/database', () => {
  // Una entrada del historial puede arrastrar campos del otro motor.
  // Si participaran de la key, la misma base daria dos pools.
  assert.strictEqual(sqlKey(SS_NUEVO), sqlKey({ ...SS_NUEVO, connectString: 'sobra:1521/x' }));
  assert.strictEqual(oraKey(ORA_NUEVO), oraKey({ ...ORA_NUEVO, server: 'sobra', database: 'sobra' }));
});

test('sqlKey y oraKey separan namespaces: la misma credencial no colisiona', () => {
  assert.notStrictEqual(sqlKey(SS_NUEVO), oraKey(ORA_NUEVO));
});

// ── SQL Server: reuso ───────────────────────────────────────

test('SQL Server: N pedidos con la misma conexion abren UN solo pool', async () => {
  const { pool, sql } = armar();
  for (let i = 0; i < 10; i++) await pool.getPool(SS_NUEVO);
  assert.strictEqual(sql.abiertos.length, 1);
  assert.strictEqual(pool.stats().sqlCreated, 1);
  assert.strictEqual(pool.stats().sqlReused, 9);
});

test('SQL Server: el shape viejo y el nuevo comparten el pool', async () => {
  // El caso concreto: documentar manda DB_* y collections manda
  // lowercase. Antes de unificar eran dos conexiones distintas.
  const { pool, sql } = armar();
  await pool.getPool(SS_VIEJO);
  await pool.getPool(SS_NUEVO);
  await pool.getPool(SS_VIEJO);
  assert.strictEqual(sql.abiertos.length, 1);
  assert.strictEqual(pool.stats().sqlCreated, 1);
});

test('SQL Server: cambiar de ambiente cierra el pool viejo y abre uno nuevo', async () => {
  const { pool, sql } = armar();
  await pool.getPool(SS_NUEVO);
  await pool.getPool({ ...SS_NUEVO, database: 'btv4' });
  assert.strictEqual(sql.abiertos.length, 2);
  assert.strictEqual(sql.abiertos[0].closed, true, 'el pool viejo tiene que quedar cerrado');
  assert.strictEqual(sql.abiertos[1].connected, true);
  assert.strictEqual(pool.stats().sqlInvalidated, 1);
});

test('SQL Server: cambiar solo la password tambien reconecta', async () => {
  const { pool, sql } = armar();
  await pool.getPool(SS_NUEVO);
  await pool.getPool({ ...SS_NUEVO, password: 'otra' });
  assert.strictEqual(sql.abiertos.length, 2);
});

test('SQL Server: dos pedidos concurrentes con cache frio abren UN pool', async () => {
  // Sin la dedup de la promesa en vuelo, los dos entran al camino de
  // creacion y el segundo deja huerfano al primero.
  const { pool, sql } = armar();
  const [a, b] = await Promise.all([pool.getPool(SS_NUEVO), pool.getPool(SS_VIEJO)]);
  assert.strictEqual(sql.abiertos.length, 1);
  assert.strictEqual(a.pool, b.pool);
});

test('SQL Server: si el pool perdio la conexion se reemplaza', async () => {
  const { pool, sql } = armar();
  const { pool: p1 } = await pool.getPool(SS_NUEVO);
  p1.connected = false;
  await pool.getPool(SS_NUEVO);
  assert.strictEqual(sql.abiertos.length, 2);
});

test('SQL Server: el error asincronico del pool invalida el cache en vez de matar el proceso', async () => {
  const { pool, sql, avisos } = armar();
  const { pool: p1 } = await pool.getPool(SS_NUEVO);
  // Con listener puesto, emitir 'error' no tira el proceso.
  p1.emit('error', new Error('ECONNRESET'));
  const errores = avisos.filter(function (a) { return a.err; });
  assert.strictEqual(errores.length, 1);
  assert.match(errores[0].msg, /SQL Server/);
  assert.strictEqual(errores[0].err.message, 'ECONNRESET');
  await pool.getPool(SS_NUEVO);
  assert.strictEqual(sql.abiertos.length, 2, 'el proximo pedido reconecta');
});

test('SQL Server: un fallo de conexion no se cachea, el proximo pedido reintenta', async () => {
  const sql = fakeMssql();
  let fallar = true;
  class Rota extends sql.mod.ConnectionPool {
    async connect() { if (fallar) throw new Error('login failed'); return super.connect(); }
  }
  const pool = createDbPool({ findModule: () => ({ ConnectionPool: Rota }) });
  await assert.rejects(() => pool.getPool(SS_NUEVO), /login failed/);
  fallar = false;
  const res = await pool.getPool(SS_NUEVO);
  assert.strictEqual(res.pool.connected, true);
});

test('SQL Server: el pool se crea con trustServerCertificate y timeout de 8s', async () => {
  const { pool, sql } = armar();
  await pool.getPool(SS_NUEVO);
  const cfg = sql.abiertos[0].config;
  assert.strictEqual(cfg.options.trustServerCertificate, true);
  assert.strictEqual(cfg.connectionTimeout, 8000);
  assert.strictEqual(cfg.port, 1433, 'port llega como numero al driver');
  assert.strictEqual(cfg.server, 'srv1');
});

// ── Oracle: reuso ───────────────────────────────────────────

test('Oracle: N pedidos con la misma conexion abren UN solo pool', async () => {
  const { pool, ora } = armar();
  for (let i = 0; i < 10; i++) {
    const { conn } = await pool.getOra(ORA_NUEVO);
    await conn.close();
  }
  assert.strictEqual(ora.abiertos.length, 1);
  assert.strictEqual(pool.stats().oraCreated, 1);
  // 11 = 1 de validacion al crear el pool + las 10 de los requests.
  // Ver "createPool de Oracle no valida credenciales" mas abajo.
  assert.strictEqual(ora.abiertos[0].conexionesEntregadas, 11, 'las 10 salieron del mismo pool');
});

test('Oracle: el shape viejo y el nuevo comparten el pool', async () => {
  const { pool, ora } = armar();
  const a = await pool.getOra(ORA_VIEJO); await a.conn.close();
  const b = await pool.getOra(ORA_NUEVO); await b.conn.close();
  assert.strictEqual(ora.abiertos.length, 1);
});

test('Oracle: conn.close() devuelve la conexion al pool, no lo cierra', async () => {
  // Es la razon por la que las funciones migradas conservan su
  // conn.close() sin cambios.
  const { pool, ora } = armar();
  const { conn } = await pool.getOra(ORA_NUEVO);
  await conn.close();
  assert.strictEqual(conn.closed, true);
  assert.strictEqual(ora.abiertos[0].closed, false, 'el pool sigue vivo');
});

test('Oracle: cambiar de ambiente cierra el pool viejo', async () => {
  const { pool, ora } = armar();
  const a = await pool.getOra(ORA_NUEVO); await a.conn.close();
  const b = await pool.getOra({ ...ORA_NUEVO, connectString: '10.0.0.9:1521/otro' }); await b.conn.close();
  assert.strictEqual(ora.abiertos.length, 2);
  assert.strictEqual(ora.abiertos[0].closed, true);
  assert.strictEqual(pool.stats().oraInvalidated, 1);
});

test('Oracle: si el pool ya no entrega conexiones se descarta y se abre otro', async () => {
  const sql = fakeMssql();
  let falla = false;
  const abiertos = [];
  const mod = {
    CLOB: 'CLOB',
    OUT_FORMAT_OBJECT: 4002,
    async createPool() {
      const p = new EventEmitter();
      p.closed = false;
      p.getConnection = async function () {
        if (falla && abiertos.indexOf(p) === 0) throw new Error('ORA-01012 not logged on');
        return { async close() {}, async execute() { return { rows: [] }; } };
      };
      p.close = async function () { p.closed = true; };
      abiertos.push(p);
      return p;
    },
  };
  const pool = createDbPool({ findModule: (n) => (n === 'mssql' ? sql.mod : mod) });
  const a = await pool.getOra(ORA_NUEVO); await a.conn.close();
  falla = true;
  const b = await pool.getOra(ORA_NUEVO); await b.conn.close();
  assert.strictEqual(abiertos.length, 2);
  assert.strictEqual(abiertos[0].closed, true);
});

test('Oracle: dos pedidos concurrentes con cache frio abren UN pool', async () => {
  const { pool, ora } = armar();
  const [a, b] = await Promise.all([pool.getOra(ORA_NUEVO), pool.getOra(ORA_VIEJO)]);
  await a.conn.close(); await b.conn.close();
  assert.strictEqual(ora.abiertos.length, 1);
});

test('Oracle: el error asincronico del pool invalida el cache', async () => {
  const { pool, ora, avisos } = armar();
  const a = await pool.getOra(ORA_NUEVO); await a.conn.close();
  ora.abiertos[0].emit('error', new Error('ORA-03113'));
  const errores = avisos.filter(function (a) { return a.err; });
  assert.strictEqual(errores.length, 1);
  assert.match(errores[0].msg, /Oracle/);
  const b = await pool.getOra(ORA_NUEVO); await b.conn.close();
  assert.strictEqual(ora.abiertos.length, 2);
});

test('Oracle: un fallo de createPool no se cachea', async () => {
  let fallar = true;
  const abiertos = [];
  const mod = {
    async createPool() {
      if (fallar) throw new Error('ORA-12541 no listener');
      const p = new EventEmitter();
      p.getConnection = async () => ({ async close() {} });
      p.close = async () => {};
      abiertos.push(p);
      return p;
    },
  };
  const pool = createDbPool({ findModule: () => mod });
  await assert.rejects(() => pool.getOra(ORA_NUEVO), /ORA-12541/);
  fallar = false;
  const { conn } = await pool.getOra(ORA_NUEVO);
  await conn.close();
  assert.strictEqual(abiertos.length, 1);
});

test('Oracle: el pool se crea con los limites esperados', async () => {
  let cfg = null;
  const mod = {
    async createPool(c) {
      cfg = c;
      const p = new EventEmitter();
      p.getConnection = async () => ({ async close() {} });
      p.close = async () => {};
      return p;
    },
  };
  const pool = createDbPool({ findModule: () => mod });
  const { conn } = await pool.getOra(ORA_NUEVO);
  await conn.close();
  assert.strictEqual(cfg.user, 'bt');
  assert.strictEqual(cfg.connectString, '10.0.0.7:1521/orcl');
  assert.strictEqual(cfg.poolMin, 1);
  assert.strictEqual(cfg.poolMax, 5);
});

// ── El escenario del bug ────────────────────────────────────

test('el loop de collections: 12 metodos abren UNA conexion, no 13', async () => {
  // loadSchemasForItems (generar-collections/index.js) llama
  // queryMethodSchema una vez por item. Antes de unificar, cada
  // llamada abria y cerraba su propia conexion.
  const { pool, ora } = armar();
  const catalogo = await pool.getOra(ORA_NUEVO); await catalogo.conn.close();
  for (let i = 0; i < 12; i++) {
    const { conn } = await pool.getOra(ORA_NUEVO);
    await conn.close();
  }
  assert.strictEqual(ora.abiertos.length, 1);
  assert.strictEqual(pool.stats().oraCreated, 1);
});

test('flujo real: test de conexion, despues documentar, despues collections, un solo pool', async () => {
  const { pool, ora } = armar();
  await pool.testConn('oracle', ORA_NUEVO);          // paso de Conexion
  const s = await pool.getOra(ORA_VIEJO);  await s.conn.close();  // /api/services
  const m = await pool.getOra(ORA_VIEJO);  await m.conn.close();  // /api/methods
  const p = await pool.getOra(ORA_VIEJO);  await p.conn.close();  // /api/input-params
  const c = await pool.getOra(ORA_NUEVO);  await c.conn.close();  // /sg/api/services
  assert.strictEqual(ora.abiertos.length, 1);
  assert.strictEqual(pool.stats().oraCreated, 1);
  assert.strictEqual(pool.stats().oraReused, 4);
});

test('cambiar de ambiente a mitad de sesion reconecta una sola vez', async () => {
  const { pool, ora } = armar();
  for (let i = 0; i < 5; i++) { const r = await pool.getOra(ORA_NUEVO); await r.conn.close(); }
  const otro = { ...ORA_NUEVO, connectString: '10.0.0.9:1521/prod' };
  for (let i = 0; i < 5; i++) { const r = await pool.getOra(otro); await r.conn.close(); }
  assert.strictEqual(ora.abiertos.length, 2, 'una reconexion, no cinco');
});

test('testConn de SQL Server deja el pool listo para el resto de la sesion', async () => {
  const { pool, sql } = armar();
  await pool.testConn('sqlserver', SS_NUEVO);
  await pool.getPool(SS_VIEJO);
  assert.strictEqual(sql.abiertos.length, 1);
});

test('los dos motores conviven sin pisarse', async () => {
  const { pool, sql, ora } = armar();
  await pool.getPool(SS_NUEVO);
  const r = await pool.getOra(ORA_NUEVO); await r.conn.close();
  await pool.getPool(SS_NUEVO);
  assert.strictEqual(sql.abiertos.length, 1);
  assert.strictEqual(ora.abiertos.length, 1);
  assert.strictEqual(sql.abiertos[0].closed, false);
});

test('reset suelta las dos conexiones', async () => {
  const { pool, sql, ora } = armar();
  await pool.getPool(SS_NUEVO);
  const r = await pool.getOra(ORA_NUEVO); await r.conn.close();
  await pool.reset();
  assert.strictEqual(sql.abiertos[0].closed, true);
  assert.strictEqual(ora.abiertos[0].closed, true);
  assert.deepStrictEqual(pool.activeKeys(), { sql: '', ora: '' });
});

test('activeKeys expone que conexion esta viva, para diagnostico', async () => {
  const { pool } = armar();
  await pool.getPool(SS_NUEVO);
  assert.strictEqual(pool.activeKeys().sql, sqlKey(SS_VIEJO));
  assert.strictEqual(pool.activeKeys().ora, '');
});

test('createDbPool exige findModule', () => {
  assert.throws(() => createDbPool({}), /findModule/);
  assert.throws(() => createDbPool(), /findModule/);
});

test('dos holders no comparten estado (aislamiento entre tests y sesiones)', async () => {
  const a = armar();
  const b = armar();
  await a.pool.getPool(SS_NUEVO);
  assert.strictEqual(b.sql.abiertos.length, 0);
  assert.strictEqual(b.pool.stats().sqlCreated, 0);
});

// ── La carrera del cambio de ambiente ───────────────────────
// Dos pedidos del ambiente NUEVO que llegan mientras se esta cerrando
// el pool del ambiente viejo. Si el cierre se hiciera antes de
// registrar la promesa en vuelo, el segundo pedido encontraria todo en
// null y abriria un segundo pool.

test('SQL Server: cambio de ambiente con dos pedidos concurrentes abre UN pool nuevo', async () => {
  const abiertos = [];
  let resolverCierre = null;
  class Lenta extends EventEmitter {
    constructor(cfg) { super(); this.config = cfg; this.connected = false; abiertos.push(this); }
    async connect() { this.connected = true; return this; }
    // El cierre queda colgado hasta que el test lo suelte: es la
    // ventana exacta en la que entraba el segundo pedido.
    close() { this.connected = false; this.closed = true; return new Promise(function (r) { resolverCierre = r; }); }
    request() { return { input() { return this; }, async query() { return { recordset: [] }; } }; }
  }
  const pool = createDbPool({ findModule: () => ({ ConnectionPool: Lenta }) });

  await pool.getPool(SS_NUEVO);
  assert.strictEqual(abiertos.length, 1);

  const otro = { ...SS_NUEVO, database: 'btv4' };
  const p1 = pool.getPool(otro);
  const p2 = pool.getPool(otro);          // llega durante el cierre del viejo
  await new Promise((r) => setImmediate(r));
  assert.ok(resolverCierre, 'el cierre del pool viejo tiene que estar en curso');
  resolverCierre();

  const [a, b] = await Promise.all([p1, p2]);
  assert.strictEqual(abiertos.length, 2, 'un solo pool nuevo, no dos');
  assert.strictEqual(a.pool, b.pool);
  assert.strictEqual(pool.stats().sqlCreated, 2);
});

test('Oracle: cambio de ambiente con dos pedidos concurrentes abre UN pool nuevo', async () => {
  const abiertos = [];
  let resolverCierre = null;
  const mod = {
    async createPool() {
      const p = new EventEmitter();
      p.getConnection = async () => ({ async close() {} });
      p.close = function () { p.closed = true; return new Promise(function (r) { resolverCierre = r; }); };
      abiertos.push(p);
      return p;
    },
  };
  const pool = createDbPool({ findModule: () => mod });

  const primera = await pool.getOra(ORA_NUEVO); await primera.conn.close();
  const otro = { ...ORA_NUEVO, connectString: '10.0.0.9:1521/prod' };
  const p1 = pool.getOra(otro);
  const p2 = pool.getOra(otro);
  await new Promise((r) => setImmediate(r));
  assert.ok(resolverCierre, 'el cierre del pool viejo tiene que estar en curso');
  resolverCierre();

  const [a, b] = await Promise.all([p1, p2]);
  await a.conn.close(); await b.conn.close();
  assert.strictEqual(abiertos.length, 2, 'un solo pool nuevo, no dos');
  assert.strictEqual(pool.stats().oraCreated, 2);
});

test('SQL Server: tres pedidos de ambientes DISTINTOS en paralelo no dejan pools huerfanos', async () => {
  // El ultimo que gana es el que queda cacheado; los otros dos tienen
  // que quedar cerrados, no colgados contra el ambiente.
  // allSettled y no all: los dos perdedores rechazan a proposito (ver
  // el test de abajo). Lo que se mide aca es que no quede ninguna
  // conexion abierta sin referenciar.
  const { pool, sql } = armar();
  await Promise.allSettled([
    pool.getPool({ ...SS_NUEVO, database: 'a' }),
    pool.getPool({ ...SS_NUEVO, database: 'b' }),
    pool.getPool({ ...SS_NUEVO, database: 'c' }),
  ]);
  const vivos = sql.abiertos.filter(function (p) { return !p.closed; });
  assert.strictEqual(vivos.length, 1, 'queda una sola conexion viva, no tres');
  assert.strictEqual(pool.activeKeys().sql, sqlKey({ ...SS_NUEVO, database: vivos[0].config.database }));
});

test('el pedido que pierde la carrera falla en vez de recibir un pool de otro ambiente', async () => {
  // Falla segura: la herramienta puede apuntar a produccion, asi que
  // un pedido cuyo ambiente se cambio a mitad de camino tiene que
  // reventar, no consultar la base equivocada.
  const { pool } = armar();
  const rs = await Promise.allSettled([
    pool.getPool({ ...SS_NUEVO, database: 'a' }),
    pool.getPool({ ...SS_NUEVO, database: 'b' }),
  ]);
  const ok = rs.filter(function (r) { return r.status === 'fulfilled'; });
  const err = rs.filter(function (r) { return r.status === 'rejected'; });
  assert.strictEqual(ok.length, 1);
  assert.strictEqual(err.length, 1);
  assert.match(err[0].reason.message, /El ambiente cambio mientras se conectaba/);
});

// ── createPool de Oracle no valida credenciales ─────────────
// Medido contra un ambiente real: con un servicio inexistente,
// oracledb.createPool() RESUELVE y el error (NJS-518) aparece recien
// en getConnection(). Sin validar, quedaba cacheado un pool muerto
// como "conexion activa" y la traza anunciaba un conectado falso.

function fakeOracleQueFallaAlConectar() {
  const abiertos = [];
  return {
    abiertos,
    mod: {
      async createPool() {
        const p = new EventEmitter();
        p.closed = false;
        p.getConnection = async function () { throw new Error('NJS-518: service not registered'); };
        p.close = async function () { p.closed = true; };
        abiertos.push(p);
        return p;
      },
    },
  };
}

test('Oracle: un pool que no entrega conexiones no se cachea ni se anuncia como conectado', async () => {
  const f = fakeOracleQueFallaAlConectar();
  const avisos = [];
  const pool = createDbPool({ findModule: () => f.mod, log: (msg) => avisos.push(msg) });

  await assert.rejects(() => pool.getOra(ORA_NUEVO), /NJS-518/);
  assert.strictEqual(pool.activeKeys().ora, '', 'no puede quedar cacheado');
  assert.strictEqual(avisos.filter((m) => /conectado/.test(m)).length, 0, 'no puede decir "conectado"');
});

test('Oracle: el pool que no sirve se cierra en vez de quedar colgado', async () => {
  const f = fakeOracleQueFallaAlConectar();
  const pool = createDbPool({ findModule: () => f.mod });
  await assert.rejects(() => pool.getOra(ORA_NUEVO), /NJS-518/);
  assert.strictEqual(f.abiertos.length, 1);
  assert.strictEqual(f.abiertos[0].closed, true, 'el pool invalido tiene que quedar cerrado');
});

test('Oracle: un fallo de conexion no deja el ambiente anterior roto de forma silenciosa', async () => {
  // Cambiar a un ambiente que no anda cierra el anterior (es un cambio
  // deliberado del usuario) y no cachea nada. El proximo pedido del
  // ambiente bueno reconecta solo.
  let fallar = false;
  const abiertos = [];
  const mod = {
    async createPool() {
      const p = new EventEmitter();
      p.closed = false;
      p.getConnection = async function () {
        if (fallar) throw new Error('ORA-01017 invalid username/password');
        return { async close() {} };
      };
      p.close = async function () { p.closed = true; };
      abiertos.push(p);
      return p;
    },
  };
  const pool = createDbPool({ findModule: () => mod });

  const a = await pool.getOra(ORA_NUEVO); await a.conn.close();
  fallar = true;
  await assert.rejects(() => pool.getOra({ ...ORA_NUEVO, user: 'malo' }), /ORA-01017/);
  assert.strictEqual(pool.activeKeys().ora, '');
  fallar = false;
  const b = await pool.getOra(ORA_NUEVO); await b.conn.close();
  assert.strictEqual(pool.activeKeys().ora, oraKey(ORA_NUEVO), 'el ambiente bueno vuelve solo');
});

test('Oracle: la validacion cuesta una adquisicion por pool, no por request', async () => {
  const { pool, ora } = armar();
  for (let i = 0; i < 5; i++) { const r = await pool.getOra(ORA_NUEVO); await r.conn.close(); }
  // 1 de validacion + 5 de los requests.
  assert.strictEqual(ora.abiertos[0].conexionesEntregadas, 6);
});
