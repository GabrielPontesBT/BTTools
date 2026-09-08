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

La clave de cifrado vive al lado, en `secret.key` (modo `0600`).

## Como se encripta

**AES-256-GCM con una clave local.** La clave se genera la primera vez y se reusa. El payload es `iv(12) | authTag(16) | ciphertext`, en base64.

GCM es autenticado: un archivo manipulado falla al abrirse en vez de devolver basura silenciosa.

### Por que no DPAPI

La primera version usaba **DPAPI de Windows** (`CurrentUser`), que es criptograficamente mejor: la clave la administra Windows y esta atada a la cuenta de usuario, asi que el archivo copiado a otra maquina no se puede abrir.

A DPAPI se llega ejecutando PowerShell (la alternativa era un modulo nativo que hay que recompilar por cada version de Electron). **Ese spawn resulto inviable en las maquinas donde corre la herramienta:** Kaspersky Adaptive Anomaly Control lo bloquea con la regla *"Start of PowerShell from the JScript script"*.

No es un falso positivo puntual, es la politica del endpoint, y esta bien puesta: un interprete de scripts lanzando PowerShell es un patron clasico de malware. La herramienta disparaba ese bloqueo **cada vez que se guardaba una conexion** — incluso al autenticar bien, porque el exito de "Probar autenticacion" guarda la config de API (`saveApiToActiveEntry` → `writeDbHistory` → cifrado).

### Que se gana y que se pierde con el cambio

**Se pierde:** la clave vive al lado del dato. Alguien que se lleve la carpeta entera (`db_history.json` + `secret.key`) puede desencriptar. Con DPAPI eso no pasaba.

**Se conserva lo que motivo todo esto:** el archivo esta fuera del repo, asi que no se puede commitear ni por error, y su contenido no es legible directo. La falla original fue publicar credenciales en un repo, no que alguien copiara la carpeta.

**Efecto lateral bueno:** las operaciones pasaron de ~1s (arranque de PowerShell) a decimas de milisegundo. La suite del modulo bajo de ~2.3s a ~290ms.

### Lo que esto NO resuelve

La app necesita la password en claro para conectarse a Oracle/SQL Server. Codigo corriendo como tu usuario en tu maquina siempre la va a poder recuperar. Para eso la unica respuesta real es no guardarla y pedirla en cada arranque, que es una decision de producto.

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
  "vault": { "__enc": "v1", "alg": "aes-256-gcm-localkey", "data": "base64..." },
  "savedAt": "2026-09-08T12:00:00.000Z"
}
```

Lo que no es secreto queda en claro a proposito: se puede inspeccionar el archivo, y un `vault` corrupto no se lleva puesto el resto del historial. Los campos secretos quedan en `""` y no borrados, para que el shape que ve el frontend no cambie.

Campos que se consideran secretos (ver `secretPathsOf`):

- `db.password`
- `api.<modo>.API_PASSWORD`, para cada modo (`publica`, `interna`, ...)

Los secretos viajan en el vault con clave `<id de entrada>:<ruta>`, por id y no por indice, para que reordenar `entries` a mano no reasigne passwords a la conexion equivocada.

## Migraciones

**Del `db_history.json` viejo (texto plano, en el repo).** La primera vez que se lee y no existe el archivo nuevo, se copia encriptado a la ubicacion nueva y se avisa por consola. Corre una sola vez.

**No borra el viejo.** Esta trackeado en git, hay que destrackearlo, y borrar archivos del usuario sin permiso no corresponde. `setup.js` avisa en cada arranque mientras queden passwords ahi:

```
git rm --cached db_history.json
del db_history.json
```

**De un vault DPAPI (`alg: "dpapi-currentuser"`).** Ya no se puede abrir: abrirlo requeriria PowerShell, que es lo que se saco. `decrypt` lo reconoce y da un mensaje que dice que hay que reingresar las passwords una vez; el resto de los datos de conexion se conservan.

## Comportamiento ante archivos rotos

Ninguno de estos casos deja la app sin arrancar:

| Caso | Que hace |
|---|---|
| Archivo no parsea | Lo aparta como `.corrupto` (no lo pisa en silencio) y arranca con historial vacio |
| Falta `secret.key` | Devuelve las conexiones **sin password** y el error dice que hay que copiar tambien la clave, o reingresarlas |
| Vault DPAPI de la version anterior | Igual: conexiones sin password, con un mensaje que explica por que |
| Payload o authTag manipulado | Falla al abrirse (GCM lo detecta), no devuelve basura |
| `__format` desconocido | Arranca vacio y avisa, no interpreta a la fuerza |
| Archivo nuevo en formato viejo (copiado a mano) | Lo lee igual y lo reescribe encriptado en el proximo guardado |
| Falta un secreto en el vault | Ese campo queda en `""`, el resto de la entrada sobrevive |
| Clave truncada o corrupta | Se regenera (los secretos viejos quedan ilegibles) en vez de cifrar con una clave invalida |

Las escrituras son atomicas (`.tmp` + `rename`): un corte a mitad de un `writeFileSync` truncaba el archivo y se perdia todo el historial.

`decrypt` **no** crea la clave si falta. Generar una nueva no arregla nada y esconderia el problema real: el archivo se copio sin su clave.

## Tests

```bash
node --test "scripts/common/secret-store/*.test.js"
```

55 tests, ~290ms. Todos deterministicos, sin I/O de red ni procesos externos.

| Archivo | Que cubre |
|---|---|
| `vault-format.test.js` | Funciones puras: deteccion de secretos, split/merge, round-trip, reordenamiento, formatos |
| `index.test.js` | Archivo: rutas por plataforma, migracion, corrupcion, atomicidad, fallo de descifrado. Cipher inyectado |
| `cipher.test.js` | Cifrado: round-trip, iv aleatorio, manejo de la clave, integridad GCM, sobres viejos de DPAPI |

Dos tests son guardias contra la regresion que motivo el cambio: verifican que `cipher.js` y `index.js` **no importen `child_process` ni nombren `powershell` como ejecutable**. Si alguien vuelve a meter un spawn, el gate lo frena antes de que Kaspersky lo frene en la maquina del usuario.

Ningun test usa credenciales reales: son todas ficticias. Meter una password de verdad en un test es la misma falla que este modulo existe para arreglar.

No hay suite de evals porque no hay nada latente aca: es cifrado y I/O, mismo input mismo output. Los gate tests son la historia completa.

## Donde puede romper

Lo honesto sobre los limites:

- **La carpeta se copia sin `secret.key`.** Las conexiones aparecen sin password y hay que reingresarlas. Es el comportamiento buscado.
- **Perfil de Windows roaming.** `%APPDATA%` sincroniza entre maquinas, y ahora `secret.key` viaja con el archivo, asi que el historial **si** se puede abrir en la otra maquina. Con DPAPI no se podia. Es mas comodo y menos seguro a la vez.
- **Otro usuario de la misma maquina.** `secret.key` es `0600`, asi que no la lee. Un administrador si.
- **Password con caracteres raros.** Cubierto por tests (`$`, `;`, comillas, acentos, CJK, saltos de linea).
- **Passwords visibles en el frontend.** `/sg/api/db-history` con `action: 'list'` devuelve las passwords en claro al browser, porque el wizard prellena el formulario con ellas. Es aceptable mientras el server escuche solo en `127.0.0.1`. **Si alguien lo hace escuchar en `0.0.0.0`, cualquiera en la red LAN puede pedir ese endpoint y recibir todas las passwords guardadas.**
