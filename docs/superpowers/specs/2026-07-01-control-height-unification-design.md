# Unificación de altura de inputs, selects y botones

## Contexto

Gabriel reportó (con 2 capturas) que pares de campo+botón se ven desalineados en altura: el select de historial de conexiones vs. el botón "Eliminar", y el select de servicio vs. el botón "+ Agregar". Investigando el código se confirmó que conviven 3 sistemas de altura distintos sin ningún criterio compartido:

1. `db-hist-sel` / `db-hist-del`: `height:36px` puesto a mano en cada uno, radio 6px, fuente `--fs-sm`.
2. `.field input, .field select` (la mayoría del formulario): sin altura fija, `padding:11px 14px`, fuente `--fs-base` (15px) → altura natural ~43-45px.
3. `.btn` (botones): sin altura fija, `padding:10px 15px`, fuente `--fs-base` → altura natural algo menor que (2). Algunos botones además tienen un `padding` inline propio (ej. `sgAddServiceToList` con `padding:9px 16px`), rompiendo incluso la consistencia dentro de esta misma categoría.

Es la misma clase de problema que la unificación de tipografía/color ya resuelta ([2026-07-01-design-tokens-unification-design.md](2026-07-01-design-tokens-unification-design.md)), ahora aplicado a la dimensión de altura de controles.

## Diseño aprobado

**Token nuevo:** `--ctrl-h: 40px` — altura estándar única para todo input de texto de una línea, `<select>` y `<button>` de la app.

**Mecánica:**

- Se agrega `--ctrl-h:40px` al bloque `:root` de `styles.css`.
- Se agrega `height:var(--ctrl-h)` a las reglas base `.field input, .field select` y `.btn`. Como el proyecto ya tiene `box-sizing:border-box` global (`styles.css:1`), la altura queda fija sin importar el padding interno de cada uno — esto resuelve automáticamente el caso del botón "+ Agregar" (`sgAddServiceToList`, que tiene `padding:9px 16px` inline) sin tocar esa línea.
- Se corrigen 3 excepciones que no heredan las reglas de clase y por eso necesitan edición puntual:
  - `db-hist-sel` (select, `index.html`): `height:36px` inline → `height:var(--ctrl-h)`.
  - `db-hist-del` (botón "Eliminar", `index.html`): `height:36px` inline → `height:var(--ctrl-h)`.
  - `val-path` (input de "Validar Documentos", `index.html`): no tiene altura fija hoy (solo padding propio) → se le agrega `height:var(--ctrl-h)`.

## Fuera de alcance

- Checkboxes (`cb-doc-errores`, `cb-ejecutar`, 15-16px) — no son parte del problema reportado (no son pares campo+botón).
- `<textarea>` — altura variable/multilínea por diseño, no se le fuerza una altura fija.
- Botones/inputs pequeños que no forman un par visual campo+botón (íconos de remove como `.svc-rm`/`.pin-rm`, `.btn-pill`, `.pinput` de parámetros de workflow) — no están en el flujo reportado por Gabriel.
- No se toca el padding horizontal de ningún control (11px14px en fields, 10px15px en botones) — el reclamo es específicamente de altura, no de ancho/espaciado horizontal.

## Verificación

1. Grep de `height:36px` y `height:` sueltos en `index.html`/`styles.css` confirmando que solo quedan los checkboxes (15px/16px) y las definiciones del propio token en `:root`.
2. Levantar el servidor y comparar visualmente las 2 capturas reportadas (historial de conexiones + Eliminar; selector de servicio + Agregar) más cualquier otro par input+botón visible en los 4 flujos, confirmando que ahora tienen la misma altura.
