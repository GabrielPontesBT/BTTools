# public/collections/ — Reglas de arquitectura

> Reglas específicas del feature Collections ("Casos de uso") para esta carpeta.
> Se actualizan acá cada vez que surge una regla nueva — no se repiten en el chat
> en cada sesión.

## Qué es esta carpeta

Código de cliente (browser, JS plano, sin bundler ni build step) del builder de
"Casos de uso". `collections-entry.js` es el único punto de entrada: inyecta el
resto de los módulos como `<script>` en un orden fijo de dependencias (array
`moduleScripts`). Un archivo nuevo se agrega ahí, en el lugar correcto según de
qué depende.

## 1. Arquitectura profesional y comentarios

- Comentar toda lógica que no sea trivial explicando el **por qué**, no el qué
  (el nombre de función ya dice el qué). Ejemplo real a seguir, de
  `core/collection-state-store.js`:
  > "No clona nada: trabaja sobre el mismo objeto para que toda la UI vea los
  > cambios en tiempo real."
- Mantener el patrón ya usado en todos los módulos: `'use strict'` + IIFE
  `(function bootstrapXxxManager(global) { ... })(window)`. No mezclar con
  `import`/`export` de ES modules sin adaptar también `collections-entry.js`.
- Si un bloque es tan obvio que comentarlo sería ruido, no lleva comentario. Si
  hay que pensarlo dos veces para entenderlo, lleva comentario.
- Excepción real al primer punto: los archivos `collection-<dominio>-adapter.js`
  (ver sección 4) no exportan una clase vía `BTCollectionModules` — el HTML que
  generan los managers invoca por nombre funciones sueltas desde atributos
  inline (`onclick="collectionFoo()"`, `oninput=...`), y no hay bundler que
  resuelva otra cosa. Siguen usando IIFE + `'use strict'`, pero asignan cada
  función directo sobre `global` (`global.collectionFoo = function
  collectionFooAdapter() {...};`) en vez de exportar una clase. Ojo: dentro de
  la IIFE, un `function collectionFoo() {}` como statement queda scopeado a la
  IIFE y no llega a `window` — hay que usar siempre la forma `global.collectionFoo
  = function ...` para que el nombre sea alcanzable desde el HTML.

## 2. Carpetas por responsabilidad

Usar siempre las carpetas que ya existen — no crear una nueva sin una
responsabilidad real que no encaje en ninguna de éstas:

| Carpeta | Responsabilidad |
|---|---|
| `core/` | Estado central del builder y arranque (state store, bootstrap) |
| `services/` | Integración con el backend/API y catálogo de servicios (api-client, environment, catálogo, sugerencia de cadenas, import) |
| `scenarios/` | Modelo de "casos de uso"/cadenas y su ciclo de vida |
| `ui/` | Todo lo que renderiza o interactúa con el DOM (canvas, inspector, shell, feedback, resultados, datos de request) |
| `execution/` | Vista de ejecución/diagnóstico (mock data, renderer, center) |
| `preview/` | Preview de la colección generada |
| `shared/` | Utilidades genéricas, sin estado ni conocimiento de dominio |

Si un archivo nuevo no calza claramente en ninguna, es señal de pensar mejor la
responsabilidad antes de escribir código — nunca de crear una carpeta "utils2"
o dejarlo suelto en la raíz de `collections/`.

## 3. Ningún archivo sobrecargado

- Hoy los archivos van de ~50 a ~1260 líneas (`execution/collection-execution-center.js`).
  Ese tamaño es aceptable mientras el archivo siga teniendo una sola
  responsabilidad clara.
- En el momento en que un archivo empieza a mezclar responsabilidades (ej.: un
  manager de UI que también arma payloads de red, o uno de ejecución que
  también manipula el DOM directamente), se separa ahí mismo en un archivo
  nuevo dentro de la carpeta que corresponda. No se posterga para "después".
- Señal de alerta: si ya no se puede describir el archivo en una sola frase, o
  un cambio puntual obliga a leer todo el archivo para saber si rompe algo no
  relacionado.

## 4. Que se entienda dónde se resuelve cada cosa

- Nombrar los archivos como ya se hace: `collection-<dominio>-manager.js`. Nada
  de `helpers.js`, `misc.js`, `utils2.js`.
- La generación real de la colección Postman (JSON/XML, las pipelines de
  request) **no vive acá** — vive en `scripts/generar-collections/` (ver su
  `CLAUDE.md`). Esta carpeta es sólo el cliente que arma la UI y consume esa
  API; un cambio en cómo se construye el request final va del otro lado.

## 5. Dependencias npm nuevas

Esta carpeta no tiene `package.json` propio — los scripts se sirven tal cual
al navegador, sin build step. Si algún cambio necesita una librería de
terceros para el cliente (ej. un vendor script), documentar en el README
correspondiente (raíz o `V4/`, según dónde quede instalada) qué se agregó y
por qué. Nunca agregar una dependencia sin dejar esa documentación.
