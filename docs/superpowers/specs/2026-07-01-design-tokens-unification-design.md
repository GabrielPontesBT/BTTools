# Unificación de tokens visuales (tamaños de letra y colores)

## Contexto

El front (`public/index.html`, `public/styles.css`, `public/wizard-doc.js`) creció herramienta por herramienta (Documentar, Generar Scripts, Validar Documentos, Generar Casos de Prueba) y cada una fue acumulando sus propios valores de `font-size` y color hardcodeados en vez de reusar variables. Un inventario (`grep` de `font-size:Npx` y colores hex) sobre los 3 archivos mostró:

- Tamaños de letra dispersos: 10, 11, 12, 13, 14, 15, 16, 17, 18, 22, 25, 28, 34, 36, 56px sin jerarquía documentada.
- Colores hex sueltos que duplican semántica ya cubierta por variables existentes: 4 ambers distintos para "warning" (`#92400e`, `#78350f`, `#9a3412`, `#b45309`), 3 verdes para "success" (`#16a34a`, `#166534`, `#dcfce7`), un rojo alternativo (`#dc2626`) y dos grises secundarios (`#6b7280`, `#9ca3af`).
- Gran parte de esto vive en `style="..."` inline, tanto estático en `index.html` como generado dinámicamente en template strings de `wizard-doc.js` (~100 instancias).

Esto hace que cada panel/herramienta se vea como si perteneciera a una app distinta. El pedido es definir un criterio único (tokens) y aplicarlo a **todo** el código existente, no solo documentarlo.

Nota de contexto: Gabriel ya había subido a mano el body text base de 13/14px a 15px en varias reglas de `styles.css` antes de este trabajo — la escala definida abajo parte de ese piso ya establecido, no lo revierte.

## Escala de tamaños de letra aprobada

6 pasos (se descartó un séptimo escalón de 10px por ser demasiado chico para texto real; los 10px existentes se funden en el escalón de 12px):

| Token | Valor | Uso |
|---|---|---|
| `--fs-sm` | 12px | badges/tags, hints, código inline, botones chicos |
| `--fs-md` | 14px | UI compacta: checkboxes de lista, labels secundarias |
| `--fs-base` | 15px | default de body/UI: inputs, labels, botones, párrafos |
| `--fs-lg` | 16px | subtítulos, títulos de modal |
| `--fs-xl` | 22px | encabezados de sección (ej. "Configuración guardada!") |
| `--fs-2xl` | 28px | títulos grandes de card (V3/V4, Documentar/Scripts/Validar/Casos) |

Los tamaños de ícono decorativo puntuales (34px `.ok-icon`, 36px `.act-icon`, 56px emoji de "Próximamente") quedan como valores de un solo componente, sin tokenizar, porque son de uso único y no forman parte de una jerarquía de texto.

## Colores semánticos aprobados

Se agregan los tokens que faltan a `:root` y se reusan los existentes donde ya cubren el caso:

| Token | Valor | Reemplaza |
|---|---|---|
| `--warn-d` (nuevo) | `#92400e` | `#92400e`, `#78350f`, `#9a3412`, `#b45309` |
| `--muted` (existente) | `#636768` | `#6b7280`, `#9ca3af` |
| `--green` / `--green-l` (existentes) | — | `#16a34a`, `#166534`, `#dcfce7` |
| `--red` (existente) | `#c42e2c` | `#dc2626` |
| `--code-bg` (nuevo) | `#f8fafc` | fondos repetidos de bloques de código/output |
| `--code-text` (nuevo) | `#1e293b` | texto de bloques de código |

**Excepción documentada:** las etiquetas de versión (`.vf-tag`, índigo para V4 / verde para V3) mantienen sus colores propios porque cumplen una función categórica (distinguir V3 de V4), no una semántica de estado (éxito/error/warning). No se tocan.

## Convención de font-weight

No se agregan tokens nuevos — 400/500/600/700 ya es una escala razonable. Se documenta la convención de uso para que futuras herramientas la sigan:

- `400`: texto de párrafo / descripciones.
- `500`: labels de formulario, botones, énfasis liviano.
- `600`: títulos de sección, encabezados de card, énfasis fuerte.
- `700`: números grandes (dígitos del stepper) y títulos hero.

## Mecánica de aplicación

1. **`styles.css`**: agregar los tokens nuevos al bloque `:root`. Reemplazar cada `font-size:Npx` de los ~40 selectores por el token del escalón correspondiente, y cada hex suelto catalogado arriba por su variable. Sin cambios de layout — solo valores.
2. **`index.html`**: mismo reemplazo en los ~20 `style="..."` inline. Los 4 títulos de acción (Documentar/Generar Scripts/Validar Documentos/Generar Casos de Prueba), hoy en `font-size:17px` inline, pasan a `--fs-2xl` para igualar `.ccard-title` (28px) — son el mismo tipo de elemento (título grande de card) y hoy tienen dos tamaños distintos, que es exactamente la inconsistencia reportada.
3. **`wizard-doc.js`**: mismo criterio dentro de los template strings (~100 instancias en un archivo de 1578 líneas). Reemplazo mecánico valor→token, verificado con un script de comprobación (grep de valores catalogados = 0 al final) en vez de edición manual instancia por instancia, para no introducir errores de tipeo en HTML generado dinámicamente.
4. No cambia ningún comportamiento ni estructura — es un cambio puramente de valores visuales. Alto volumen de líneas tocadas, riesgo funcional nulo.

## Fuera de alcance

- No se tocan tamaños de ícono decorativo de un solo uso (34px, 36px, 56px).
- No se tocan los colores categóricos de `.vf-tag` (V3/V4).
- No se agregan tokens de font-weight nuevos, solo convención documentada.
- No se cambia layout, estructura HTML ni lógica de `wizard-doc.js`.

## Verificación

1. Grep final sobre los 3 archivos confirmando que ningún valor catalogado (tamaños sueltos ni hex sueltos) sigue presente fuera de los casos declarados como excepción/fuera de alcance.
2. Levantar el servidor (`node setup.js`, puerto 3777) y revisar visualmente los 4 flujos (Documentar, Generar Scripts, Validar Documentos, Generar Casos de Prueba) más el modal de resolución de casing, comparando antes/después para confirmar que no se rompió ningún layout ni legibilidad.
