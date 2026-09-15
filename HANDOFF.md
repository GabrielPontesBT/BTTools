# Handoff — Herramienta Bantotal (BTAPI)

Contexto completo del proyecto para quien lo continúa. Última actualización: 2026-09-11, branch `main`, commit `480fc27`.

Este documento explica **qué es**, **cómo se corre**, **cómo está organizado**, **por qué** está así, y **qué falta**. El `README.md` de la raíz está desactualizado (describe solo el generador de doc, cuando ya son 6 herramientas): leer este archivo primero.

---

## 1. Qué es

App de escritorio (Electron) + servidor HTTP local que asiste tareas de API Bantotal contra un ambiente real. No es un solo generador: es un wizard con **6 herramientas** que comparten un mismo "ambiente" (versión + motor de base + conexión + config de API).

| Herramienta | Qué hace | Código |
|---|---|---|
| **Documentar** (`doc`) | Genera los `.md` de documentación de servicios/métodos leyendo la base (BTI004/012/014/019/025/026) y, opcionalmente, llamando la API real para poner ejemplos verdaderos | `scripts/generar-doc/` |
| **Scripts** (`scripts`) | Genera los scripts SQL de parametría (BTI012/014/019/026, BTCBS012/… en API interna) para replicar un servicio en otro ambiente | `scripts/generar-scripts/` |
| **Validar doc** (`validate`) | Valida y auto-corrige (`--fix`) los `.md` generados: campos sin descripción, SDTs duplicados, placeholders, ejemplos mal formados | `scripts/validar-doc/` |
| **Casos de uso / Collections** (`collections`) | Builder visual de colecciones Postman: descubre servicios (Swagger o base), arma requests con datos realistas, sugiere cadenas entre servicios y las ejecuta en vivo | `scripts/generar-collections/` (motor) + `public/collections/` (UI) |
| **Generar SDT** (`sdtgen`) | Crea un SDT nuevo (BTI025/026) con autocompletado de largo y descripción por nombre de campo | `scripts/generar-sdt/` |
| **Editar parametría** (`paramgen`) | Edita parametría existente de un servicio (BTI019/BTCBS019) y reordena campos de un SDT (BTI026) | `scripts/editar-parametria/` |

Dos versiones de Bantotal soportadas, y son mundos distintos:

- **V3** → SQL Server, API **SOAP**, SDTs con prefijo `sBT`, sección `Erroresnegocio`.
- **V4** → Oracle (requiere Oracle Instant Client), API **REST/JSON**, SDTs `Sdt…`, sección `BusinessErrors`.

Y dentro de V4, dos modos de API que cambian tablas, autenticación y URLs:

- **API Pública** — un solo gateway (`/api/publicapi`), canal fijo `BTPUBLIC`, token JWT como `Bearer`.
- **API Interna** — varios microservicios, cada uno con su Swagger y su puerto (platform 5107, customer 5105, term-deposit, loan, liability, configuration…), canal del ambiente, token en el header `Token`.

---

## 2. Cómo correrlo

### Modo dev (lo que vas a usar el 99% del tiempo)

```bash
node setup.js
```

Abre en `http://localhost:3777` (o el puerto de `BTAPI_PORT`). No hay build step: el front es JS plano servido tal cual, así que un cambio en `public/` se ve recargando el navegador. Un cambio en `setup.js` o en `scripts/` necesita reiniciar el proceso.

### Modo app (Electron)

```bash
npm start
```

```bash
npm run dist
```

`electron/main.js` arranca `setup.js` **en el mismo proceso** y apunta la ventana al server local. En modo app la raíz de datos es `BTAPI_ROOT` (carpeta persistente de instalación), no el repo. `npm run dist` empaqueta a `dist/win-unpacked` con electron-builder (target `dir`, sin instalador).

### Para el usuario final

`iniciar.bat` — instala Node y las dependencias npm si faltan, y abre el navegador. Detecta si el server ya está levantado y no arranca una segunda instancia.

### Tests

```bash
npm test
```

**781 tests, todos pasando, ~3.4s.** `node --test` sobre `public/*.test.js` y `scripts/**/*.test.js`. Son gate tests: deterministas, sin red, sin base. Si algo te pide una conexión real para pasar, está mal escrito.

### Dependencias

No hay un solo `npm install`. Los drivers de base viven por versión:

```bash
cd V3 && npm install
```

```bash
cd V4 && npm install
```

V3 trae `mssql`; V4 trae `oracledb` y `xml2js`. La raíz solo tiene `electron` y `electron-builder` (devDependencies). `scripts/` no tiene `package.json` propio: resuelve `xml2js` a mano contra `V4/node_modules` (ver `loadXml2js()` en `scripts/generar-collections/index.js`).

---

## 3. Arquitectura

```
setup.js                    servidor HTTP (node:http crudo, sin Express) — ~2100 líneas, es el router
public/                     front del wizard (JS plano, sin bundler)
  index.html                shell del wizard: stepper + paneles p2..p5
  wizard-doc.js             lógica del wizard (~4200 líneas)
  collections/              cliente del builder de Casos de uso (ver su CLAUDE.md)
scripts/
  common/                   módulos compartidos entre herramientas
    db-pool/                una sola conexión a base para toda la app
    secret-store/           historial de conexiones + cifrado de passwords
    swagger-endpoints/      resuelve ruta y verbo HTTP de cada método desde el Swagger
    bantotal-urls/          construcción de URLs y esquemas de auth por modo de API
    design-tokens/          auditoría y migración de color/tipografía/espaciado CSS
    design-shape/           ídem para la forma: radios, sombras, peso, alto de control
    design-padding/         ídem para el padding: escala --sp-1..7 (grilla de 4px)
    post-process/           scripts Python de post-proceso de los .md
  generar-doc/              generador de documentación (v3.js, v4.js, workflow-*.js)
  generar-collections/      motor de collections (ver su CLAUDE.md)
  generar-scripts/ generar-sdt/ editar-parametria/ validar-doc/
V3/ V4/                     driver + .env + los .md generados, una carpeta por servicio
electron/                   empaquetado y ventana
error-docs/                 herramienta aparte: scripts Python que leen la KB de GeneXus
docs/superpowers/           specs y planes de diseño de features ya implementadas
```

### Las dos capas de API del server

`setup.js` tiene **dos familias de rutas** y la distinción importa:

- `/api/*` — rutas del wizard de Documentar y del schema por método de Collections.
- `/sg/api/*` — rutas de Scripts, Parametría, Generar SDT y el catálogo de Collections. Dispatch por `route` string en un solo bloque ([setup.js:1774](setup.js:1774)).

Nacieron separadas y con **shapes de datos distintos para el mismo objeto de conexión** (`DB_SERVER/DB_USER/…` vs `server/user/…`). `scripts/common/db-pool/` es lo que las unificó: `normalizeDb` colapsa las dos formas a una clave de cache canónica, y por eso hoy Documentar y Collections **comparten pool**. Antes una collection de 12 pasos abría 13 conexiones. Leer [scripts/common/db-pool/README.md](scripts/common/db-pool/README.md) antes de tocar cualquier acceso a base.

### Reglas de arquitectura por carpeta

Hay `CLAUDE.md` propios con reglas vinculantes en:

- [scripts/generar-collections/CLAUDE.md](scripts/generar-collections/CLAUDE.md) — el motor. Regla clave: `index.js` ya tiene ~3900 líneas y **no debe crecer**. Lógica nueva separable va a carpeta hermana (`request-data-resolver/`, `swagger-candidates/`).
- [public/collections/CLAUDE.md](public/collections/CLAUDE.md) — el cliente. IIFE + `'use strict'`, sin ES modules. `collections-entry.js` inyecta los módulos en orden fijo de dependencias: un archivo nuevo se agrega **ahí**, en la posición correcta. Los `collection-*-adapter.js` asignan funciones directo sobre `global` porque el HTML generado las invoca por nombre desde atributos inline.
- [.claude/CLAUDE.md](.claude/CLAUDE.md) — reglas de trabajo generales: tests en el mismo commit, vanilla por defecto, servicios independientes, protocolo de estado al cerrar tarea.

---

## 4. Decisiones que no son obvias (leer antes de "arreglar" algo)

**Las rutas de los endpoints salen del Swagger, no del nombre del método.** Los ambientes V4 pasaron a kebab-case (`/public/saving-accounts/v1/additional-information`) y el generador armaba camelCase: 404 en todo. Hoy ruta y verbo HTTP se resuelven contra el Swagger del ambiente, con match **exacto**: `operationId` = nombre del método en base, `tag` = servicio. Detalle que costaba 28 métodos: springdoc desambigua operationIds repetidos con sufijo `_N` (`getTexts_1`), hay que sacarlo antes de comparar. Sin Swagger sigue funcionando derivando del nombre, ya en kebab-case, y avisa por consola cada método no encontrado. Contra el ambiente real (192 operaciones) resuelve 147 de 148; el único suelto es el `Authenticate` viejo, que ya no se usa.

**El Swagger se consigue de tres formas, en ese orden:** JSON pegado a mano (se guarda en `<version>/swagger.json`, ignorado por git), URL explícita, o autodetección desde la URL de la API pública. La autodetección probaba solo la raíz y el ambiente publica el documento **adentro** de `/publicapi` (`<BASE_URL>/v1/api-docs`): daban 404 las ocho rutas con un Swagger que estaba ahí. El Swagger también trae la URL de la API pública en `servers[0].url`: detectar completa ese campo si está vacío (no pisa lo que el usuario escribió), y `BASE_URL` dejó de ser obligatoria.

**Autenticación: los dos modos comparten payload, difieren en dos cosas.** `buildAuthPayload` manda el mismo body `{user, userPassword, jwt}` + `Canal` + `Device`, y **ningún** header `Token`, `Usuario` ni `Requerimiento` — mandar `Token` vacío hacía que session contestara `401 Token is blank`. Las dos diferencias, documentadas donde ocurren: la pública va siempre por canal `BTPUBLIC` (lo fija arquitectura), la interna usa el canal del ambiente; el token de negocio viaja `Bearer` en la pública y en el header `Token` en la interna. El `user-login` además necesita el header `Device`. La detección de "API interna" exigía el camelCase `/Session/v1/userLogin` con un regex propio y fallaba contra ambientes que publican kebab: usar `esPathSessionLogin`, que acepta las dos formas.

**Con varios Swaggers internos, el login sale del de plataforma.** Todos los microservicios exponen `/Session/v1/userLogin`, todos devuelven token válido y ese token sirve en los demás: un solo login alcanza para todo el flujo. Se prefiere el de plataforma solo por claridad de lo que muestra el wizard; si no está en la lista, sirve cualquiera. Un microservicio caído no bloquea a los demás ni deja sin resolver la autenticación.

**No hay DPAPI.** La primera versión de `secret-store` cifraba con DPAPI de Windows, que es mejor criptográficamente, pero se llega por un spawn de PowerShell y **Kaspersky Adaptive Anomaly Control lo bloquea** ("Start of PowerShell from the JScript script") en las máquinas donde corre la herramienta. Hoy es AES-256-GCM con clave local en `secret.key` (modo `0600`), payload `iv(12) | authTag(16) | ciphertext` en base64. GCM es autenticado: un archivo manipulado falla al abrirse en vez de devolver basura silenciosa.

**`db_history.json` salió del repo.** Estaba trackeado y se publicó con usuarios, passwords y connect strings de ambientes Oracle reales en texto plano. Ahora vive en la carpeta de datos del usuario (`%APPDATA%\Herramienta Bantotal\`), con las passwords cifradas. `BTAPI_SECRETS_DIR` pisa la ruta (lo usan los tests). Ver [scripts/common/secret-store/README.md](scripts/common/secret-store/README.md).

**`successful-values.json` filtra claves sensibles.** Está versionado y guardaba todos los valores de runtime de una ejecución, incluido `token`: se llevó dos JWT reales. Se filtran `token`, `password`, `authorization` y compuestas (`sessionToken`, `refreshToken`) comparando normalizado, porque tampoco servían como sugerencia (vencen).

**El ambiente se elige al abrir y dura toda la sesión.** Versión, motor y conexión son un solo paso. Con ambiente activo, ninguna herramienta vuelve a pedir la conexión. Cambiar de ambiente invalida los cachés de servicios y scripts.

**El validador se abstiene a propósito en algunos casos.** Un nombre de campo como `clienteUId*` (typo de "requerido" pegado en la tabla del SDT) no es insertable en un ejemplo: escribirlo produciría XML inválido o una key JSON basura. `esNombreCampoValido` lo rechaza y deja el problema "documentado pero ausente" para corrección manual ([scripts/validar-doc/index.js:24](scripts/validar-doc/index.js:24)).

**Al regenerar sin llamar a la API, los ejemplos reales se preservan** — y si están en el formato viejo de V4, se **migran**, no se dejan tal cual (`scripts/generar-doc/migrate-legacy-value.js`).

---

## 5. Estado actual

- **Tests:** 781, verde. Corrí `npm test` al escribir este documento.
- **Verificado de punta a punta** contra el ambiente real (Oracle `10.0.0.4:1521/btv4db`, gateways `10.0.0.7:5101` público y `:5107` interno): detección de Swagger, login y llamada de negocio real en los dos modos (`getSystemDate` devuelve `2028-04-27` por los dos caminos), 6 de 8 Swaggers internos cargando (5108 treasury-cash y 5109 cash-management no están levantados), 62 servicios y 2644 operaciones.
- **Working tree sucio:** `V4/General/getCountries.md` y `V4/General/getDocumentTypes.md` tienen cambios sin commitear. Son `.md` generados (salida, no fuente): decidir si se commitean o se descartan.
- 188 commits en `main`. Los mensajes son largos y explican el *por qué* y la medición: `git log` es documentación real, usalo.

---

## 6. Lo que hay que arreglar / lo que falta

Ordenado por lo que atacaría primero.

1. **`V3/README.md` y `V4/README.md` tienen credenciales reales en los ejemplos** (`DB_PASSWORD=Bantotal$2020`, usuario `btdesav23`, `API_PASSWORD=Bantotal2015`, IPs internas). Están trackeados en git. Reemplazar por placeholders y rotar lo que siga siendo válido.
2. **`README.md` de la raíz está desactualizado.** Describe un wizard de 6 pasos que ya no existe así y solo la herramienta de documentación. No menciona Electron, ni Collections, ni las otras 4 herramientas.
3. **`scripts/generar-collections/output/` tiene ~50 colecciones de prueba versionadas** con nombres tipo `bantotal-json-collection92-json-postman-1783456468964`. La carpeta ya está en `.gitignore`, pero los archivos viejos siguen trackeados. Limpiar del índice.
4. **`db_history.json` en la raíz del repo es residuo** del esquema viejo. Verificar que no tenga nada sensible y sacarlo del índice.
5. **`error-docs/scripts/__pycache__/` está versionado.** Agregar al `.gitignore`.
6. **`scripts/generar-collections/index.js` (~3900 líneas) y `public/wizard-doc.js` (~4200 líneas) son los dos archivos que van a doler.** El `CLAUDE.md` de collections ya prohíbe que `index.js` siga creciendo: cualquier feature nuevo ahí va a carpeta hermana. `wizard-doc.js` no tiene esa regla escrita todavía y la necesita.
7. **`V4/VersionCorregida.zip` versionado** — binario en el repo, sacar.
8. **V3 quedó atrás.** Todo el trabajo reciente (Swagger, auth, los dos modos de API, collections) es V4. V3 sigue funcionando en SOAP pero no recibió nada de eso, y el Swagger es V4-only por diseño (V3 no tiene).
9. **Motores de base deshabilitados en el wizard:** Java SQL, AS/400 y PostgreSQL están como tarjetas visibles pero `ccard-disabled` ([public/index.html:75](public/index.html:75)). Si alguno se necesita, el trabajo es en `dbPool.testConn` + las queries por plataforma.

---

## 7. Cómo trabajar acá

Lo que espera el proyecto de cada cambio (está en `.claude/CLAUDE.md`, resumido):

- **Tests en el mismo commit.** No "después". Un fix trae el test que lo hubiera cachado.
- **Mensajes de commit que expliquen el por qué y la medición**, no el qué. Mirá `git log -5` para el tono: qué estaba roto, contra qué ambiente se midió, qué tests se agregaron, qué se verificó a mano.
- **Comentarios sobre el por qué**, no el qué. Las reglas de negocio Bantotal y las rarezas de cada pipeline se anotan donde ocurren.
- **Vanilla.** Sin frameworks, sin bundler, sin abstracciones para reuso hipotético. Es una decisión, no deuda.
- **Cada herramienta es independiente.** Dos personas pueden trabajar en `scripts/generar-doc/` y `scripts/generar-collections/` sin pisarse. Si un cambio obliga a tocar las dos, es un cambio de contrato y se declara como tal.
- **Antes de tocar acceso a base:** `scripts/common/db-pool/README.md`.
- **Antes de tocar el historial de conexiones o cualquier credencial:** `scripts/common/secret-store/README.md`.
- **Antes de tocar Collections:** los dos `CLAUDE.md`, motor y cliente.
- **Specs de diseño de features ya hechas:** `docs/superpowers/specs/` y `docs/superpowers/plans/`. Cubren design tokens, reordenar/llamar API, generar SDT y controles de scripts.

Primer paso sugerido: `node setup.js`, entrar con un ambiente V4 real, y recorrer las 6 herramientas de punta a punta. La app explica bastante de sí misma; lo que no se entiende ahí está en el `git log` del área.
