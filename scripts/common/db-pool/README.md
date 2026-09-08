# db-pool

Conexión a base única y compartida por toda la app.

## La regla

La herramienta se conecta **una vez** y se queda con esa conexión en memoria. Si el usuario quiere apuntar a otro ambiente, lo cambia en el paso de Conexión, y ese cambio (y solo ese) cierra la conexión vieja y abre la nueva.

## Por qué existía el problema

Había dos caminos de acceso a base, con dos ciclos de vida distintos:

| Camino | Herramientas | Ciclo de vida |
|---|---|---|
| `/sg/api/*` | Scripts, Parametría, Generar SDT, catálogo de Collections | Pool cacheado. Correcto. |
| `/api/*` | Documentar, y el schema por método de Collections | `new ConnectionPool()` + `connect()` + `close()` **en cada request** |

El segundo camino nunca se migró. No fue una regresión: `queryServices` abría y cerraba desde el commit que la creó (`864cd0c`). El costo se veía en los dos loops:

- `generar-collections/index.js` `loadSchemasForItems` llama `queryMethodSchema` una vez por item: una collection de 12 pasos abría **13** conexiones.
- `wizard-doc.js` `computeWorkflowUncovered` llama `/api/input-params` una vez por paso.

### Por qué no se había unificado antes

Dos shapes distintos para el mismo dato:

```js
// wizard-doc.js:1987  -> el camino /api/*
{ DB_SERVER, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD, DB_CONNECT_STRING }
// wizard-doc.js:1993  -> el camino /sg/api/*
{ server, port, database, user, password, connectString }
```

Los dos se arman con el **mismo** objeto de campos, uno al lado del otro. De ahí `normalizeDb`: los dos colapsan a una forma canónica con orden de claves fijo, y por lo tanto a **una** key de cache. Eso es lo que hace que Documentar y Collections compartan pool.

## Resultado medido

Contra un ambiente Oracle real (`10.0.0.4:1521/btv4db`), leyendo la traza del servidor:

| Escenario | Conexiones antes | Conexiones ahora |
|---|---|---|
| 20 requests mezclando los dos shapes, 5 endpoints | 20 | **1** |
| Collection de 12 pasos | 13 | **1** |
| Cambio de ambiente + 4 requests ahí | 5 | **1** (cierre + reconexión) |
| `/api/test` repetido | 1 por llamada | **0** (devuelve el pool cacheado) |

`/api/test` bajó a 3ms en el mejor caso: antes era un handshake TCP + login completo cada vez.

## Archivos

| Archivo | Qué hace |
|---|---|
| `index.js` | El módulo. Drivers inyectados vía `findModule`, cero dependencias del proyecto |
| `index.test.js` | 44 tests de la lógica de cacheo, con drivers falsos |
| `wiring.test.js` | 10 tests estructurales: leen `setup.js` y verifican que nadie esquive el pool |

## Uso

```js
const { createDbPool } = require('./scripts/common/db-pool');
const dbPool = createDbPool({ findModule: sg_findModule, log: console.log });

const { pool, mssql } = await dbPool.getPool(db);   // SQL Server: pool compartido
const { conn, oracledb } = await dbPool.getOra(db); // Oracle: conexión del pool
await conn.close();                                  // devuelve al pool, NO lo cierra
```

**Nunca** llamar `pool.close()` sobre el pool de SQL Server: es el compartido, y cerrarlo lo saca de circulación para toda la app. `wiring.test.js` lo frena.

## Decisiones que no son mecánicas

- **El default de `port` se aplica al normalizar, no al conectar.** Si un caller manda `port:'1433'` y otro lo omite, tienen que caer en la misma key. Aplicando el default recién en `connect()`, `''` y `1433` daban dos keys distintas, o sea dos pools contra la misma base.

- **`sqlKey` ignora `connectString` y `oraKey` ignora `server`/`database`.** Una entrada del historial puede arrastrar campos del otro motor. Si participaran de la key, la misma base daría dos pools.

- **El cierre del pool viejo va dentro de la promesa en vuelo, no antes.** Cerrando con un `await` previo a registrar el pending, un segundo pedido del mismo ambiente nuevo que llegara durante ese cierre encontraría todo en `null` y abriría un segundo pool.

- **Guard de identidad al instalar el pool.** Si mientras se conectaba entró un pedido de otro ambiente, el pool que terminó de conectarse ya no es el vigente: se cierra y el pedido perdedor falla. Es la falla segura: la herramienta puede apuntar a producción, así que un request cuyo ambiente cambió a mitad de camino tiene que reventar, no consultar la base equivocada.

- **`oracledb.createPool()` no valida nada.** Crea el pool aunque el usuario, la password o el servicio no existan; el error aparece recién en `getConnection()`. Sin validar, quedaba cacheado un pool muerto como "conexión activa" y la traza anunciaba un `Oracle conectado` falso (medido contra `10.0.0.4` con un servicio inexistente: `createPool` resolvía y recién `getConnection` tiraba `NJS-518`). Ahora se pide y devuelve una conexión de prueba antes de cachear: cuesta una adquisición por pool, no por request.

- **La traza nunca imprime la password.** `describir()` arma la descripción con usuario y host. Hay un test que lo verifica, porque esas líneas van a la consola y al log de Electron.

## Dos defectos que aparecieron construyéndolo

Los dos los encontró un test propio, no la app:

1. **Pools huérfanos con ambientes distintos en paralelo.** El que resolvía primero instalaba su pool, el siguiente lo pisaba, y el primero quedaba abierto contra la base sin que nadie lo referenciara. Lo arregló el guard de identidad.
2. **La traza mentía.** Ver el punto de `createPool` arriba. Este lo encontró la verificación contra la base real, no los fakes: los fakes fallaban en `createPool`, que es justamente lo que Oracle **no** hace.

## Tests

```bash
node --test scripts/common/db-pool/
```

54 tests, ~270ms, sin base ni drivers nativos.
