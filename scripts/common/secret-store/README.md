# secret-store

Donde vive el historial de conexiones a base (`db_history.json`) y como se guardan las passwords.

## Por que existe

`setup.js` guardaba el historial con:

```js
const DB_HISTORY_FILE = path.join(ROOT, 'db_history.json');
```

`ROOT` es `process.env.BTAPI_ROOT || __dirname`. Corriendo en modo dev (`node setup.js`, `npm start`) `BTAPI_ROOT` no esta seteada, asi que `ROOT` es la carpeta del repo. Resultado: **la app escribia passwords de bases Bantotal en texto plano adentro de git.**

El archivo quedo trackeado antes de que `.gitignore` lo cubriera, y `.gitignore` no aplica a archivos ya versionados. Se publico en un repo remoto con usuarios, passwords y connect strings de ambientes Oracle.

Este modulo cierra las dos puertas:

1. **El archivo sale del repo.** Va a la carpeta de datos del usuario, donde no se puede commitear ni por error.
2. **Las passwords se encriptan.** El archivo no es legible de un `cat`.

## Donde queda el archivo

| Plataforma | Ruta |
|---|---|
| Windows | `%APPDATA%\Herramienta Bantotal\db_history.json` |
| macOS | `~/Library/Application Support/Herramienta Bantotal/db_history.json` |
| Linux | `$XDG_CONFIG_HOME/herramienta-bantotal/db_history.json` |

`BTAPI_SECRETS_DIR` pisa la ruta. Lo usan los tests, y sirve para apuntar a un pendrive o a un perfil compartido.

## Como se encripta

**Windows: DPAPI (`CurrentUser`)**, via PowerShell. La clave la administra Windows y esta atada a la cuenta de usuario: el archivo copiado a otra maquina, subido a git o mandado por chat **no se puede abrir**. Es exactamente la amenaza que se materializo.

Se llega a DPAPI por PowerShell y no por un modulo nativo a proposito: cero dependencias nuevas y nada que recompilar por version de Electron. El precio son ~300ms por operacion, y de ahi sale una decision de diseño: se encripta **un solo blob** con todos los secretos, no campo por campo. Con 3 conexiones son hasta 6 campos, o sea ~2s por lectura.

**Otras plataformas: AES-256-GCM** con una clave local en la misma carpeta (modo `0600`). Es mas debil que DPAPI, porque la clave vive al lado del dato, y esta etiquetado como tal en el archivo (`alg: "aes-256-gcm-localkey"`). Igual cumple lo importante: el archivo esta fuera del repo y su contenido no es legible directo.

### Lo que esto NO resuelve

La app necesita la password en claro para conectarse a Oracle/SQL Server. Codigo corriendo como tu usuario en tu maquina siempre la va a poder recuperar. Para eso la unica respuesta real es no guardarla y pedirla en cada arranque, que es una decision de producto, no de este modulo.

Y encriptar no despublica el pasado: **una password que estuvo en un repo hay que rotarla.**

## Formato del archivo

```json
{
  "__format": "btapi-db-history/2",
  "entries": [
    {
      "id": "1786626429595",
      "label": "Desa",
      "platform": "oracle",
      "db": { "user": "usuario_fict", "password": "", "connectString": "host-ficticio:1521/basefict" },
      "api": { "publica": { "API_USER": "u", "API_PASSWORD": "" } }
    }
  ],
  "vault": { "__enc": "v1", "alg": "dpapi-currentuser", "data": "01000000d08c9d..." },
  "savedAt": "2026-09-07T13:40:00.000Z"
}
```

Lo que no es secreto queda en claro a proposito: se puede inspeccionar el archivo, y un `vault` corrupto no se lleva puesto el resto del historial. Los campos secretos quedan en `""` y no borrados, para que el shape que ve el frontend no cambie.

Campos que se consideran secretos (ver `secretPathsOf`):

- `db.password`
- `api.<modo>.API_PASSWORD`, para cada modo (`publica`, `interna`, ...)

Los secretos viajan en el vault con clave `<id de entrada>:<ruta>`, por id y no por indice, para que reordenar `entries` a mano no reasigne passwords a la conexion equivocada.

## Migracion

La primera vez que se lee y no existe el archivo nuevo, se busca el `db_history.json` viejo (en el repo), se copia encriptado a la ubicacion nueva y se avisa por consola. Corre una sola vez.

**No borra el viejo.** Esta trackeado en git, hay que destrackearlo, y borrar archivos del usuario sin permiso no corresponde. `setup.js` avisa en cada arranque mientras queden passwords ahi:

```
git rm --cached db_history.json
del db_history.json
```

## Comportamiento ante archivos rotos

Ninguno de estos casos deja la app sin arrancar:

| Caso | Que hace |
|---|---|
| Archivo no parsea | Lo aparta como `.corrupto` (no lo pisa en silencio) y arranca con historial vacio |
| No se puede desencriptar (otra maquina, otro usuario de Windows) | Devuelve las conexiones **sin password**: la app las vuelve a pedir |
| `__format` desconocido | Arranca vacio y avisa, no interpreta a la fuerza |
| Archivo nuevo en formato viejo (copiado a mano) | Lo lee igual y lo reescribe encriptado en el proximo guardado |
| Falta un secreto en el vault | Ese campo queda en `""`, el resto de la entrada sobrevive |

Las escrituras son atomicas (`.tmp` + `rename`): un corte a mitad de un `writeFileSync` truncaba el archivo y se perdia todo el historial.

## Tests

```bash
node --test "scripts/common/secret-store/*.test.js"
```

49 tests, ~2.3s (1 se saltea: aplica solo fuera de Windows).

| Archivo | Que cubre | Costo |
|---|---|---|
| `vault-format.test.js` | Funciones puras: deteccion de secretos, split/merge, round-trip, reordenamiento, formatos | Sin I/O, ~240ms |
| `index.test.js` | Archivo: rutas por plataforma, migracion, corrupcion, atomicidad, fallo de descifrado. Cipher inyectado | Temp dirs, ~310ms |
| `cipher.test.js` | Cifrado real: un round-trip DPAPI de verdad, la degradacion a clave local, y deteccion de manipulacion | ~2s (spawns de PowerShell) |

Ningun test usa credenciales reales: son todas ficticias. Meter una password de verdad en un test es la misma falla que este modulo existe para arreglar.

El test de DPAPI **no se puede reemplazar por un mock**: el unico bug que aparecio durante el desarrollo (un `;` entre `try` y `finally`, error de sintaxis de PowerShell) solo se ve ejecutando PowerShell de verdad. Es el unico test lento del modulo y hace un solo round-trip a proposito.

No hay suite de evals porque no hay nada latente aca: es cifrado y I/O, mismo input mismo output. Los gate tests son la historia completa.

## Donde puede romper

Lo honesto sobre los limites:

- **PowerShell no disponible o bloqueado por politica** (AppLocker, EDR, sandbox: se vio `spawnSync powershell.exe EPERM`). Al **guardar**, degrada a la clave local, lo avisa por consola y lo registra en el sobre: cifrado mas debil, pero el historial se guarda. Al **leer** un vault que ya estaba en DPAPI, no hay nada que hacer: las conexiones aparecen sin password y hay que reingresarla.
- **El usuario cambia de cuenta de Windows o de maquina.** DPAPI no puede abrir el vault. Las conexiones aparecen sin password y hay que reingresarla. Es el comportamiento buscado, no un bug.
- **Perfil de Windows roaming.** `%APPDATA%` sincroniza entre maquinas, pero el vault DPAPI no se puede abrir en la otra: mismo caso que arriba.
- **Password con caracteres raros.** Cubierto por tests (`$`, comillas, `;`, acentos, CJK, saltos de linea) porque el claro viaja por stdin, nunca por la linea de comandos.
- **Passwords visibles en el frontend.** `/sg/api/db-history` con `action: 'list'` devuelve las passwords en claro al browser, porque el wizard prellena el formulario con ellas. Es aceptable mientras el server escuche solo en `127.0.0.1`. **Si alguien lo hace escuchar en `0.0.0.0`, cualquiera en la red LAN puede pedir ese endpoint y recibir todas las passwords guardadas.**
