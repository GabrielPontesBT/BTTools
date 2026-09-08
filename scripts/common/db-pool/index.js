'use strict';

// ============================================================
// Pool de conexiones a base, unico y compartido por toda la app.
//
// La regla del producto: la herramienta se conecta UNA vez y se
// queda con esa conexion en memoria. Si el usuario quiere apuntar a
// otro ambiente, lo cambia en el paso de Conexion, y ese cambio (y
// solo ese) tira la conexion vieja y abre la nueva.
//
// Por que existe este modulo en vez de dejar todo en setup.js:
// setup.js arranca un servidor HTTP al cargarse, asi que no se puede
// requerir desde un test. La logica de cacheo es justamente la que
// hay que poder verificar sin una base real, asi que vive aca, con
// los drivers inyectados (`findModule`), y setup.js la cablea.
//
// ── El problema que resuelve ──
//
// Habia DOS caminos de acceso a base, con dos ciclos de vida:
//
//   /sg/api/*  (scripts, parametria, generar-sdt, catalogo de
//              collections) -> pool cacheado. Correcto.
//   /api/*     (documentar, y el schema por metodo de collections)
//              -> `new ConnectionPool()` + `connect()` + `close()`
//              en CADA request.
//
// El segundo camino nunca se migro. No era una regresion: nacio asi
// (queryServices abre y cierra desde el commit que la creo). El costo
// real se veia en los dos loops: armar una collection de 12 pasos
// abria 13 conexiones, y computeWorkflowUncovered una por paso.
//
// ── Por que no se habia unificado antes ──
//
// Dos shapes distintos para el mismo dato. El camino viejo lee
// DB_SERVER/DB_USER/DB_PASSWORD/DB_CONNECT_STRING; el pool lee
// server/user/password/connectString. El front tiene los dos
// constructores uno al lado del otro (wizard-doc.js shapeDbApi y
// shapeDbSG), alimentados por el MISMO objeto de campos.
//
// De ahi `normalizeDb`: los dos shapes colapsan a una sola forma
// canonica, con orden de claves fijo, y por lo tanto a UNA sola key
// de cache. Es lo que hace que documentar y collections compartan
// pool en vez de tener uno cada uno.
// ============================================================

// Puerto por defecto de SQL Server. Se aplica al normalizar, no al
// conectar, a proposito: si un caller manda port:'1433' y otro lo
// omite, tienen que caer en la MISMA key. Aplicar el default recien
// en connect() dejaria '' y 1433 como dos keys distintas, o sea dos
// pools contra la misma base.
const SQLSERVER_DEFAULT_PORT = 1433;

// Timeout de conexion del camino viejo, que era el mas corto de los
// dos (8s contra el default de mssql). Se conserva: un ambiente que
// no responde tiene que fallar rapido, el usuario esta esperando.
const CONNECT_TIMEOUT_MS = 8000;

const POOL_LIMITS_SQL = { max: 5, min: 1, idleTimeoutMillis: 30000 };
const POOL_LIMITS_ORA = { poolMin: 1, poolMax: 5, poolIncrement: 1, poolTimeout: 60 };

/**
 * Primer valor no vacio, como string. `nuevo` (shape lowercase) gana
 * sobre `viejo` (shape DB_*) cuando vienen los dos: el shape nuevo es
 * el que usan las rutas activas.
 *
 * Ojo con el `!== ''`: una password vacia es un valor legitimo, pero
 * si el shape nuevo la trae vacia y el viejo la trae con contenido,
 * queremos la que tiene contenido. Un objeto mezclado no deberia
 * existir; esto es solo para no romper si aparece.
 */
function primerValor(nuevo, viejo) {
  if (nuevo !== undefined && nuevo !== null && nuevo !== '') return String(nuevo);
  if (viejo !== undefined && viejo !== null) return String(viejo);
  return '';
}

/**
 * Lleva cualquiera de los dos shapes historicos a una forma canonica.
 *
 * El orden de las claves es FIJO y es parte del contrato: la key de
 * cache es el JSON.stringify de este objeto, y JSON.stringify respeta
 * el orden de insercion. Reordenar estas seis lineas partiria el pool
 * en dos sin que ningun test de conexion falle, asi que no se toca
 * sin actualizar los tests de key.
 */
function normalizeDb(db) {
  const d = db || {};
  const portRaw = primerValor(d.port, d.DB_PORT);
  const port = Number(portRaw);
  return {
    server: primerValor(d.server, d.DB_SERVER),
    port: Number.isFinite(port) && port > 0 ? port : SQLSERVER_DEFAULT_PORT,
    database: primerValor(d.database, d.DB_DATABASE),
    user: primerValor(d.user, d.DB_USER),
    password: primerValor(d.password, d.DB_PASSWORD),
    connectString: primerValor(d.connectString, d.DB_CONNECT_STRING),
  };
}

/**
 * Key de cache de SQL Server: solo los campos que definen la conexion.
 *
 * No se usa el objeto canonico completo porque arrastra
 * `connectString`, que para SQL Server no significa nada. Si una
 * entrada del historial trae un connectString viejo de cuando el
 * ambiente era Oracle, el objeto completo daria una key distinta para
 * la misma base de SQL Server, o sea dos pools.
 */
function sqlKey(db) {
  const c = normalizeDb(db);
  return JSON.stringify({ server: c.server, port: c.port, database: c.database, user: c.user, password: c.password });
}

/** Idem para Oracle: server/port/database no participan (van dentro del connectString). */
function oraKey(db) {
  const c = normalizeDb(db);
  return JSON.stringify({ user: c.user, password: c.password, connectString: c.connectString });
}

/**
 * Descripcion legible de a donde apunta una conexion, para la traza.
 * NUNCA incluye la password: estas lineas van a la consola y al log de
 * Electron.
 */
function describir(db) {
  const c = normalizeDb(db);
  if (c.connectString) return c.user + '@' + c.connectString;
  return c.user + '@' + c.server + ':' + c.port + '/' + c.database;
}

/**
 * Crea el holder de pools. Uno por proceso en produccion (setup.js);
 * uno por test, para que no se pisen entre si.
 *
 * options.findModule(name) -> el driver ('mssql' | 'oracledb'). Se
 * inyecta para que los tests corran sin base y sin drivers nativos.
 * options.log(msg, err) -> opcional, para los avisos de invalidacion.
 */
function createDbPool(options) {
  const opts = options || {};
  const findModule = opts.findModule;
  const log = typeof opts.log === 'function' ? opts.log : function () {};
  if (typeof findModule !== 'function') {
    throw new Error('createDbPool requiere options.findModule(name)');
  }

  // Contadores para test y diagnostico. `reused` es la metrica que
  // importa: si sube mientras `created` se queda quieto, el cache
  // esta haciendo su trabajo.
  const stats = {
    sqlCreated: 0, sqlReused: 0, sqlInvalidated: 0,
    oraCreated: 0, oraReused: 0, oraInvalidated: 0,
  };

  // `pending` guarda la promesa de conexion en vuelo. Sin esto, dos
  // requests que llegan con el cache frio (el front dispara el
  // catalogo y el test de conexion casi juntos) entran los dos al
  // camino de creacion, abren dos pools, y el segundo sobreescribe la
  // referencia del primero: pool huerfano contra el ambiente, que es
  // exactamente lo que este modulo existe para no hacer.
  const sql = { pool: null, key: '', pending: null, pendingKey: '' };
  const ora = { pool: null, key: '', pending: null, pendingKey: '' };

  async function cerrarSilencioso(fn) {
    try { await fn(); } catch (e) { /* cerrar un pool ya roto no aporta nada */ }
  }

  // ── SQL Server ──────────────────────────────────────────────

  async function crearPoolSql(db, key) {
    const mssql = findModule('mssql');
    const c = normalizeDb(db);
    const pool = new mssql.ConnectionPool({
      server: c.server,
      port: c.port,
      database: c.database,
      user: c.user,
      password: c.password,
      options: { trustServerCertificate: true },
      connectionTimeout: CONNECT_TIMEOUT_MS,
      pool: POOL_LIMITS_SQL,
    });
    // mssql (tedious) emite 'error' en el pool cuando la conexion se
    // corta de forma asincronica, fuera de cualquier request en curso
    // (un corte de VPN mientras el usuario edita parametria sin pedir
    // nada). Un 'error' sin listener sobre un EventEmitter mata el
    // proceso entero, asi que el listener no es opcional: sin el, un
    // corte de red cierra la herramienta.
    pool.on('error', function (err) {
      log('[db-pool] Error asincronico en el pool de SQL Server, se invalida para reconectar en el proximo pedido', err);
      if (sql.pool === pool) { sql.pool = null; sql.key = ''; stats.sqlInvalidated++; }
    });
    await pool.connect();
    return { pool, mssql };
  }

  async function getPool(db) {
    const mssql = findModule('mssql');
    const key = sqlKey(db);

    if (sql.pool && sql.key === key && sql.pool.connected) {
      stats.sqlReused++;
      return { pool: sql.pool, mssql };
    }
    // Misma conexion pedida y ya hay una creacion en vuelo: se espera
    // esa en vez de abrir otra.
    if (sql.pending && sql.pendingKey === key) {
      stats.sqlReused++;
      return sql.pending;
    }

    // El cierre del pool viejo va DENTRO del pending, no antes.
    //
    // Si se cerrara aca con un `await` previo a registrar el pending,
    // un segundo pedido del mismo ambiente nuevo que llegue durante ese
    // cierre encontraria pool y pending en null, entraria tambien al
    // camino de creacion, y quedarian dos pools con el segundo pisando
    // la referencia del primero. Registrando el pending primero (sin
    // ningun await en el medio, que es lo que lo hace atomico) ese
    // segundo pedido cae en la rama de reuso de arriba.
    stats.sqlCreated++;
    sql.pendingKey = key;
    const mio = (async function () {
      if (sql.pool) {
        const viejo = sql.pool;
        sql.pool = null; sql.key = '';
        stats.sqlInvalidated++;
        log('[db-pool] Cambio de ambiente: se cierra la conexion de SQL Server anterior.');
        await cerrarSilencioso(function () { return viejo.close(); });
      }
      return crearPoolSql(db, key);
    })().then(
      function (res) {
        // Guard de identidad: si mientras se conectaba entro un pedido
        // de OTRO ambiente, este pool ya no es el vigente. Sin el
        // guard se instalaba igual y dejaba huerfano al que ya estaba
        // cacheado: dos conexiones abiertas contra la base y una sola
        // referenciada.
        //
        // El pedido perdedor falla en vez de recibir un pool que apunta
        // a un ambiente que ya no es el activo: es la falla segura para
        // una herramienta que puede apuntar a produccion.
        if (sql.pending !== mio) {
          cerrarSilencioso(function () { return res.pool.close(); });
          throw new Error('El ambiente cambio mientras se conectaba a SQL Server. Reintenta la operacion.');
        }
        sql.pool = res.pool; sql.key = key;
        sql.pending = null; sql.pendingKey = '';
        // Traza: en la consola tiene que verse UNA linea de conexion por
        // ambiente y por sesion. Si aparecen varias sin que el usuario
        // haya cambiado de ambiente, el cache no esta funcionando.
        log('[db-pool] SQL Server conectado (' + describir(db) + '). Queda en memoria hasta que se cambie de ambiente.');
        return res;
      },
      function (err) {
        // No se cachea un fallo: el proximo pedido reintenta desde cero.
        if (sql.pending === mio) { sql.pending = null; sql.pendingKey = ''; }
        throw err;
      }
    );
    sql.pending = mio;
    return mio;
  }

  // ── Oracle ──────────────────────────────────────────────────

  async function crearPoolOra(db) {
    const oracledb = findModule('oracledb');
    const c = normalizeDb(db);
    const pool = await oracledb.createPool(Object.assign({
      user: c.user,
      password: c.password,
      connectString: c.connectString,
    }, POOL_LIMITS_ORA));
    // Mismo motivo que en SQL Server: sin este listener un 'error'
    // asincronico del pool mata el proceso.
    if (typeof pool.on === 'function') {
      pool.on('error', function (err) {
        log('[db-pool] Error asincronico en el pool de Oracle, se invalida para reconectar en el proximo pedido', err);
        if (ora.pool === pool) { ora.pool = null; ora.key = ''; stats.oraInvalidated++; }
      });
    }

    // oracledb.createPool() NO valida nada: crea el pool aunque el
    // usuario, la password o el servicio no existan, y el error recien
    // aparece al pedir la primera conexion. Sin esta validacion se
    // cacheaba como "conexion activa" un pool muerto y la traza
    // anunciaba un "Oracle conectado" que era mentira (medido contra
    // 10.0.0.4 con un servicio inexistente: createPool resolvia y
    // recien getConnection tiraba NJS-518).
    //
    // La conexion de prueba se devuelve al pool enseguida, asi que el
    // costo es una adquisicion por creacion de pool, no por request.
    try {
      const prueba = await pool.getConnection();
      await prueba.close();
    } catch (e) {
      // El pool ya existe aunque no sirva: hay que cerrarlo o queda
      // colgado contra el ambiente sin que nadie lo referencie.
      await cerrarSilencioso(function () { return pool.close(0); });
      throw e;
    }

    return { pool, oracledb };
  }

  /**
   * Devuelve una conexion del pool de Oracle. El caller la tiene que
   * cerrar con `conn.close()`: en una conexion pooleada eso la
   * DEVUELVE al pool, no la destruye. Por eso las funciones migradas
   * conservan su `conn.close()` tal cual estaba.
   */
  async function getOra(db) {
    const oracledb = findModule('oracledb');
    const key = oraKey(db);

    if (ora.pool && ora.key === key) {
      try {
        const conn = await ora.pool.getConnection();
        stats.oraReused++;
        return { conn, oracledb };
      } catch (e) {
        // El pool existe pero ya no entrega conexiones (ambiente
        // reiniciado, sesion matada). Se descarta y se cae al camino
        // de creacion de abajo.
        const roto = ora.pool;
        ora.pool = null; ora.key = '';
        stats.oraInvalidated++;
        await cerrarSilencioso(function () { return roto.close(0); });
      }
    }

    if (ora.pending && ora.pendingKey === key) {
      const res = await ora.pending;
      const conn = await res.pool.getConnection();
      stats.oraReused++;
      return { conn, oracledb: res.oracledb };
    }

    // Igual que en SQL Server: el cierre del pool viejo va DENTRO del
    // pending, para que un segundo pedido del ambiente nuevo que
    // llegue durante ese cierre encuentre el pending y lo espere en
    // vez de abrir un segundo pool.
    stats.oraCreated++;
    ora.pendingKey = key;
    const mio = (async function () {
      if (ora.pool) {
        const viejo = ora.pool;
        ora.pool = null; ora.key = '';
        stats.oraInvalidated++;
        log('[db-pool] Cambio de ambiente: se cierra la conexion de Oracle anterior.');
        await cerrarSilencioso(function () { return viejo.close(0); });
      }
      return crearPoolOra(db);
    })().then(
      function (res) {
        // Mismo guard de identidad que en SQL Server: ver el comentario
        // largo alla.
        if (ora.pending !== mio) {
          cerrarSilencioso(function () { return res.pool.close(0); });
          throw new Error('El ambiente cambio mientras se conectaba a Oracle. Reintenta la operacion.');
        }
        ora.pool = res.pool; ora.key = key;
        ora.pending = null; ora.pendingKey = '';
        log('[db-pool] Oracle conectado (' + describir(db) + '). Queda en memoria hasta que se cambie de ambiente.');
        return res;
      },
      function (err) {
        if (ora.pending === mio) { ora.pending = null; ora.pendingKey = ''; }
        throw err;
      }
    );
    ora.pending = mio;

    const res = await mio;
    const conn = await res.pool.getConnection();
    return { conn, oracledb: res.oracledb };
  }

  /**
   * Prueba la conexion del paso de Conexion. Es el momento en que se
   * abre el pool: todo lo que venga despues lo reusa.
   */
  async function testConn(platform, db) {
    if (platform === 'sqlserver') { await getPool(db); return; }
    const { conn } = await getOra(db);
    await conn.close();
  }

  /** Suelta las dos conexiones. Solo para tests y apagado ordenado. */
  async function reset() {
    if (sql.pool) { const p = sql.pool; sql.pool = null; sql.key = ''; await cerrarSilencioso(function () { return p.close(); }); }
    if (ora.pool) { const p = ora.pool; ora.pool = null; ora.key = ''; await cerrarSilencioso(function () { return p.close(0); }); }
    sql.pending = null; sql.pendingKey = '';
    ora.pending = null; ora.pendingKey = '';
  }

  return {
    getPool,
    getOra,
    testConn,
    reset,
    normalizeDb,
    sqlKey,
    oraKey,
    stats: function () { return Object.assign({}, stats); },
    // Solo para diagnostico: que conexion esta viva ahora mismo.
    activeKeys: function () { return { sql: sql.key, ora: ora.key }; },
  };
}

module.exports = {
  createDbPool,
  normalizeDb,
  sqlKey,
  oraKey,
  SQLSERVER_DEFAULT_PORT,
  CONNECT_TIMEOUT_MS,
};
