# scripts/generar-collections/ — Reglas de arquitectura

> Reglas específicas del feature Collections ("Casos de uso") para esta
> carpeta. Se actualizan acá cada vez que surge una regla nueva — no se
> repiten en el chat en cada sesión.

## Qué es esta carpeta

Motor backend (Node, CommonJS) que genera las colecciones Postman de "Casos de
uso": descubre servicios (Swagger o base de datos), arma los requests,
resuelve datos realistas para los campos y sugiere cadenas entre servicios.
`index.js` expone `createCollectionFeature(deps)`, el punto de composición que
usa `setup.js` — recibe `ROOT` y las funciones de consulta a BD por inyección
de dependencias.

## 1. Arquitectura profesional y comentarios

- Mismo criterio que el resto del proyecto: cada función no trivial explica su
  rol, y toda decisión no obvia queda anotada donde ocurre. Ejemplo real ya en
  el código (`index.js`, `loadXml2js()`): explica por qué busca el paquete en
  `V4/node_modules` en vez de tener uno propio, y qué hacer si falta.
- Priorizar el **por qué** de reglas de negocio Bantotal y de las
  particularidades de cada pipeline de request (ver punto 3) por sobre el qué,
  que ya se lee en el nombre de la función.

## 2. Carpetas por responsabilidad

Seguir el patrón que ya existe — la lógica nueva y separable se extrae a una
carpeta hermana, no se acumula en `index.js`:

| Carpeta/archivo | Responsabilidad |
|---|---|
| `request-data-resolver/` | Resuelve valores realistas para los campos de un request (clasificación semántica, generación de valores, catálogo de campos de respuesta) |
| `chain-suggestion/` | Sugiere cadenas de llamadas entre servicios (grafo, path-finder, reglas de seguridad) |
| `swagger-candidates/` | Qué URLs probar para encontrar el documento Swagger/OpenAPI de un ambiente, y en qué orden. Función pura, sin I/O — el fetch queda en `index.js` |
| `data/` | Datos estáticos de referencia (ej. `successful-values.json`) |
| `docs/` | Notas de diseño (mockups, decisiones) — no código |
| `output/` | Colecciones generadas (artefactos de salida, no fuente — no es lugar para lógica) |
| `index.js` | Composición/orquestación de las pipelines y rutas — no debería seguir creciendo con lógica nueva |
| `panel.html` | Shell HTML del wizard standalone de generación, servido tal cual desde `index.js` (`loadAsset` + `GET /api/collection/panel`) — sin CSS/JS propios embebidos |

## 3. Ningún archivo sobrecargado

- `index.js` ya concentra ~3200 líneas y varias pipelines de armado de request
  (SOAP legacy, JSON Postman de "Casos de uso", y los helpers compartidos
  entre ambas). No sumar responsabilidades nuevas ahí.
- Toda lógica nueva que sea separable se extrae a una carpeta hermana nueva en
  el mismo cambio que la necesita — mismo criterio que ya se aplicó con
  `request-data-resolver/` y `chain-suggestion/`. No se espera a que el
  archivo sea "un problema" para recién ahí dividirlo.
- Antes de agregar una función a `index.js`, preguntarse: ¿pertenece a una
  pipeline existente, a un módulo hermano, o es un dominio nuevo que merece su
  propia carpeta?

## 4. Que se entienda dónde se resuelve cada cosa

- Nombre de archivo autoexplicativo por dominio + rol, como ya hacen
  `resolver-config.js`, `field-normalizer.js`, `graph-builder.js`,
  `path-finder.js`.
- La UI del builder en sí (canvas, inspector, etc.) **no vive acá** — vive en
  `public/collections/` (ver su `CLAUDE.md`). Esta carpeta es el
  motor/servidor; esa es el cliente.

## 5. Dependencias npm nuevas

Esta carpeta no tiene `package.json` propio. Hoy sólo depende puntualmente de
`xml2js`, resuelto a mano contra `V4/node_modules/xml2js` (ver `loadXml2js()`
en `index.js`), con chequeo explícito y error claro si falta. Cualquier
dependencia nueva termina instalándose en el `package.json` de `V4/` (o en el
de la raíz, si alguna vez existe uno) — documentar siempre en el README de esa
misma carpeta (raíz o `V4/`) qué se instaló, versión y por qué, en el mismo
cambio que la agrega.
