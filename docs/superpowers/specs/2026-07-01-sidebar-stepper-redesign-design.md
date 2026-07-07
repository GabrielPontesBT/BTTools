# Rediseño de layout: stepper vertical estilo Bantotal SGR

## Contexto

El front actual (`public/index.html` + `public/styles.css`) es un wizard de una sola columna: header rojo con logo grande y una barra de pasos horizontal (`.wiz-hd-steps` / `.steps-bar`), cuerpo con los paneles de cada paso, y footer full-width con los botones "Volver / Siguiente".

Gabriel pidió replicar el estilo visual de una captura de Bantotal SGR (top bar blanca + sidebar vertical a la izquierda), pero como esta herramienta no tiene secciones de navegación reales, la columna izquierda debe mostrar la barra de progreso de pasos del wizard (hoy horizontal) en vez de un menú de navegación.

## Diseño aprobado

### Layout general

Dos filas × dos columnas:

```
┌─────────────────────────────────────────┐
│  wiz-hd (blanco, logo + título)          │
├───────────┬───────────────────────────────┤
│           │                               │
│  stepper  │      wiz-bd (paneles)         │
│  vertical │                               │
│  (col.    │                               │
│  izq.)    ├───────────────────────────────┤
│           │  wiz-ft (Volver / Siguiente)  │
└───────────┴───────────────────────────────┘
```

- El stepper vertical ocupa toda la altura disponible debajo del top bar (misma altura que contenido + footer juntos).
- El footer con los botones queda solo debajo del contenido, no debajo del stepper.

### 1. Top bar (`.wiz-hd`)

- Fondo blanco (no rojo), borde inferior 1px `var(--border)`.
- Logo achicado (~40px de alto, hoy 100px) + título fijo "Herramienta Bantotal" al lado.
- Se elimina el fondo rojo grande y el padding vertical extra que hoy sostenía la barra horizontal.

### 2. Columna izquierda / stepper vertical (`.wiz-sidebar`, nueva)

- Ancho fijo ~110px, fondo blanco, borde derecho 1px `var(--border)`.
- Contiene el mismo stepper de hoy (`.sdot` numerados conectados por `.sline`), rotado a orientación vertical: círculo → línea vertical → círculo → línea vertical...
- Estados `active` / `done` se mantienen sin cambios de lógica, solo cambia CSS (flex-direction column) y el markup se mueve del header a esta columna.
- Etiquetas de paso (`.sdot-lb`) se ubican al costado o debajo del círculo según espacio disponible.

### 3. Contenido (`.wiz-bd`)

- Mismos paneles de hoy, mismo padding y ancho máximo de contenido.
- Pasa a vivir a la derecha del stepper en vez de ocupar todo el ancho de la pantalla.

### 4. Footer (`.wiz-ft`)

- Mismos botones y comportamiento (`goBack()`, `goNext()`).
- Se reubica para ocupar solo el ancho de la columna de contenido (no se extiende debajo del stepper).

## Fuera de alcance

- No se replican las pestañas de navegación de la captura (Requerimientos, Conocimiento Bantotal, Gestión, HUB, FLY, Asistentes) — no aplican a esta herramienta.
- No se cambia la lógica de `public/wizard-doc.js` (`goNext`, `goBack`, `pick`, activación de `.sdot`/`.sline`/`.panel`). Solo cambia el HTML/CSS alrededor.
- No se agrega responsividad para mobile (herramienta interna, uso de escritorio).

## Archivos afectados

- `public/index.html`: mover el markup del steps-bar del header a una nueva `div.wiz-sidebar`; reestructurar el layout en 2 columnas × 2 filas.
- `public/styles.css`: nueva top bar blanca, nuevo grid/flex de layout, `.sdot`/`.sline` rotados a vertical, footer acotado a la columna de contenido.

## Verificación

Levantar `node setup.js` (puerto 3777) y revisar visualmente los 3 flujos (Documentar, Validar Documentos, Generar Scripts) confirmando que el stepper vertical avanza igual que hoy y no rompe checkboxes, validaciones ni generación de docs.
