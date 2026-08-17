# Generar SDT — copiar un SDT existente como estructura no nativa

## Contexto

El wizard ya tiene un flujo "Generar Scripts" (`scripts/generar-scripts/index.js`) que, dado un servicio/método, resuelve los SDT referenciados (`sg_querySdtsBatch`, `setup.js:632-650`) y emite DELETE+INSERT para `BTI025`/`BTI026` (`sg_generateSdtScript`, `scripts/generar-scripts/index.js:73-114`). Ese flujo parte siempre de un servicio/método, nunca de un SDT elegido directamente, y nunca modifica los campos del SDT — los copia tal cual.

Gabriel quiere un flujo nuevo, independiente: elegir un SDT existente como base, editarlo (eliminar campos, reordenarlos) y generar una copia **no nativa** con nombre propio, lista para instalar vía DELETE+INSERT — con la opción de ejecutar ese script directo contra la conexión activa además de solo mostrarlo.

Las queries de lectura (`sg_queryBti025`, `sg_queryBti026`, ambas en `setup.js:598-630`) y la generación de script (`sg_generateSdtScript`) ya existen y son reutilizables sin modificar su firma. La versión selector (V3 SQL Server / V4 Oracle, `public/index.html:40-54`) y la pantalla de conexión (`public/index.html:56-108`) se reutilizan sin cambios — este flujo entra al wizard después de esos dos pasos, igual que "Generar Scripts".

## Diseño aprobado

**Nueva acción del wizard: `sdtgen`.**

Home (`p3`, `public/index.html:110-136`): nueva card "Generar SDT" — `onclick="pick('action','sdtgen',this)"`, ícono propio (ej. `&#128203;`), grid pasa de `1fr 1fr 1fr 1fr` a `repeat(5, 1fr)` o envuelve a una segunda fila (a decidir en implementación, es un detalle CSS).

Pasos del flujo `sdtgen` (steps 1-3 reutilizados sin cambios; 4-6 nuevos):

1. ¿Qué querés hacer? (`p3`) — sin cambios
2. Versión Bantotal (`p1`) — sin cambios, fija `S.platform`
3. Conexión a BD (`p2`) — sin cambios, reutiliza pool/test existente
4. **Elegir SDT base** (panel nuevo `p-sdtbase`)
5. **Editar copia** (panel nuevo `p-sdtedit`)
6. **Resultado / ejecutar** (panel nuevo `p-sdtresult`)

### Paso 4 — Elegir SDT base (`p-sdtbase`)

- Al entrar al panel (`show()`, bloque `step === 4 && S.action === 'sdtgen'`), dispara `GET /sdtgen/api/list` que trae **todos** los `BTISDTNom` de `BTI025` (`SELECT BTISDTNom FROM BTI025 ORDER BY BTISDTNom` en SQL Server; equivalente Oracle con `BTISDTNOM`/`ROWNUM` según convención ya usada en `sg_queryBti025`).
- Tabla simple (una columna, nombre del SDT) + input de búsqueda arriba que filtra client-side por substring (sin round-trip al servidor — la lista completa de nombres es liviana, un solo `SELECT` de una columna).
- Cada fila es clickeable; al hacer clic, guarda `S.sdtBase = nombre` y habilita "Siguiente".
- "Siguiente" dispara `GET /sdtgen/api/sdt?nom=<S.sdtBase>` que llama a `sg_queryBti025` + `sg_queryBti026` (reexportadas desde `setup.js`, ver "Cambios de código" abajo) y guarda el resultado (`{ bti025, bti026 }`) en `S.sdtBaseData` antes de avanzar a paso 5.

### Paso 5 — Editar copia (`p-sdtedit`)

- Input de texto libre para el nombre del nuevo SDT (`BTISDTNom` de la copia) — sin sugerencia automática, el usuario lo tipea. Validación mínima: no vacío, no igual al nombre del SDT base (evita colisión trivial).
- Debajo, lista de los campos de `S.sdtBaseData.bti026` en su orden original, cada fila:
  - Handle de drag-and-drop (vanilla `dragstart`/`dragover`/`drop` sobre `<li draggable="true">`, sin librerías — consistente con "vanilla by default").
  - Nombre del campo + tipo, solo lectura (no se edita tipo/largo/etc., solo presencia y orden).
  - Botón "Quitar" que remueve la fila de la lista en memoria (no borra nada en BD todavía — es edición local hasta generar el script).
- Un campo eliminado no puede reingresarse sin volver al paso 4 y re-elegir el SDT base (no hay "deshacer" ni papelera — mantiene el editor simple).
- Si un campo referencia un SDT anidado (`BTISDTELEMSDT` no vacío), se muestra igual en la lista, se puede reordenar/quitar como cualquier otro campo, pero **no se abre edición de sus propios campos** — el SDT anidado referenciado se copia tal cual bajo su nombre original (no se duplica ni renombra).
- "Siguiente" arma `S.sdtCopy = { nom: <nombre tipeado>, fields: <array reordenado/filtrado> }` y avanza a paso 6.

### Paso 6 — Resultado / ejecutar (`p-sdtresult`)

- Al entrar, dispara `POST /sdtgen/api/generate` con `{ platform, sdtBase, sdtCopy }`. El backend arma:
  - Metadata de la copia (`BTI025`): mismo namespace/estado/tipo que el original (`sg_queryBti025` ya trajo esos valores), forzando `BTISDTNativo = 'N'` y `BTISDTVersion = 1`, con `BTISDTNom` = el nuevo nombre.
  - Filas de `BTI026` de la copia: una por cada campo sobreviviente de `S.sdtCopy.fields`, en el nuevo orden, todas con `BTISDTNom` apuntando al nuevo nombre (columnas por V3/V4 igual que `V3_BTI026_COLS`/`V4_BTI026_COLS` en `scripts/generar-scripts/index.js:9-12`; el orden se refleja en `BTISDTELEMPOSI` para V4).
  - Reusa `sg_generateSdtScript`-equivalente para emitir texto DELETE+INSERT (DELETE por `BTISDTNom` del nuevo nombre antes de los INSERT, mismo patrón que el flujo de scripts existente).
- Textarea de solo lectura con el script generado (mismo look que `#sg-sql-out`, `public/index.html:291`), con botón "Copiar".
- Botón separado **"Ejecutar contra la conexión activa"**:
  - Al clickear, muestra un `confirm()` (o modal) explícito: "Esto va a ejecutar DELETE + INSERT contra la base conectada. ¿Confirmás?" — no ejecuta nada sin esa confirmación.
  - Si se confirma, `POST /sdtgen/api/execute` con el mismo payload que generó el script; el backend reusa el pool/conexión ya cacheado (`sg_getPool`/`sg_getOra`) y corre el DELETE y los INSERT dentro de una transacción (si el DELETE falla o algún INSERT falla, rollback completo — no debe quedar el SDT a medio insertar).
  - Muestra resultado (éxito con cantidad de filas insertadas, o el mensaje de error de la base) debajo del botón.

## Backend

**Nuevo módulo `scripts/generar-sdt/index.js`**, mismo patrón que `scripts/generar-collections/index.js`: exporta `createSdtGenFeature(deps)` con:
- `deps` inyectadas: `queryBti025(db, platform, nom)`, `queryBti026(db, platform, nom)`, `getPool(db)`/`getOra(db)` (reexportadas desde `setup.js`, no reimplementadas — evita duplicar la lógica de conexión ya arreglada en los fixes recientes de BTI004/BTI026 V4).
- `listSdtNames(db, platform)` — nueva función, `SELECT BTISDTNom FROM BTI025 ORDER BY BTISDTNom` (SQL Server) / equivalente Oracle.
- `buildSdtCopy({ bti025, bti026 }, nuevoNombre, fieldsOrdenados, platform)` — función pura, sin I/O: devuelve `{ bti025Copy, bti026Copy }` con `Nativo='N'`, `Version=1`, nombre nuevo, filas filtradas/reordenadas. Testeable sin DB.
- `generateSdtScript(bti025Copy, bti026Copy, platform)` — reusa/extiende `sg_generateSdtScript` ya existente en `scripts/generar-scripts/index.js` (se exporta desde ahí o se factoriza a un módulo compartido `scripts/shared/sdt-script.js` si `generar-scripts` también lo necesita — a decidir en el plan de implementación, pero sin duplicar el algoritmo de columnas/quoting).
- `handleApi(req, res, helpers)` — rutas bajo `/sdtgen/api/`: `list`, `sdt` (GET con querystring `nom`), `generate` (POST), `execute` (POST).

**Wiring en `setup.js`**: junto a `collectionFeature` (`setup.js:876-879`, `921-923`), instanciar `sdtGenFeature` y despachar `/sdtgen/api/` igual que `/collections/api/` hoy.

## Frontend (`public/wizard-doc.js`, `public/index.html`)

- `pick()`/`updateStepLabels()` (`wizard-doc.js:125-150`): nueva rama para `S.action === 'sdtgen'`.
- `panelId()` (`wizard-doc.js:185-193`): pasos 4/5/6 → `p-sdtbase`/`p-sdtedit`/`p-sdtresult` cuando `S.action === 'sdtgen'`.
- `show()`/`foot()`/`goNext()`/`goBack()` (`wizard-doc.js:195-290`): nuevos bloques `if (... && S.action === 'sdtgen')` siguiendo el patrón ya usado para `scripts`/`collections`.
- Tres paneles nuevos en `public/index.html`, ubicados junto a los paneles `p4s`/`p5s` del flujo de scripts (patrón más cercano).
- Estado nuevo en `S`: `sdtBase`, `sdtBaseData`, `sdtCopy`.

## Manejo de errores

- `listSdtNames`/`queryBti025`/`queryBti026` fallan igual que hoy (conexión caída, tabla vacía) — se muestra el mismo tipo de mensaje de error que ya usa el flujo de scripts (no se inventa un mecanismo nuevo).
- Nombre de copia vacío o igual al original: bloquea "Siguiente" en el paso 5 con mensaje inline, no llega a pegarle al backend.
- `execute` corre en transacción explícita; cualquier fallo hace rollback y el mensaje de error de la base se muestra tal cual (no se reintenta automáticamente).

## Testing

`scripts/generar-sdt/index.test.js` (`node:test` + `node:assert/strict`, mismo patrón que `scripts/validar-doc/index.test.js`):
- `buildSdtCopy`: fuerza `Nativo='N'`/`Version=1`, nombre nuevo propagado a todas las filas de `bti026Copy`, respeta el orden de `fieldsOrdenados`, excluye los campos no presentes en `fieldsOrdenados`.
- `buildSdtCopy` con un campo que referencia un SDT anidado: el campo se copia con su `BTISDTELEMSDT` original intacto (no se renombra el SDT anidado).
- `generateSdtScript`: genera DELETE antes que los INSERT, columnas correctas para V3 vs V4 (reutilizando fixtures del test existente de `generar-scripts` si aplica).
- `listSdtNames`/`handleApi`: tests de contrato con un pool/conexión mockeada (igual que se mockea en tests existentes del proyecto, si los hay para `setup.js`; si no existen, mock mínimo inline).

## Fuera de alcance

- Edición recursiva de SDTs anidados (se copian tal cual, sin abrir su propio editor).
- Selector de versión V2/V2R2/V2R3 (no existe en el proyecto; se reutiliza el selector V3/V4 existente).
- Sugerencia automática de nombre para la copia (el usuario lo tipea manualmente).
- Deshacer/papelera de campos eliminados en el editor (hay que re-elegir el SDT base para recuperarlos).
