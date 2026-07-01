# Unificación de escala de espaciado (márgenes y gaps)

## Contexto

Gabriel pidió estandarizar los márgenes entre elementos, igual que ya se hizo con tipografía/color ([2026-07-01-design-tokens-unification-design.md](2026-07-01-design-tokens-unification-design.md)) y altura de controles ([2026-07-01-control-height-unification-design.md](2026-07-01-control-height-unification-design.md)). Un inventario de `margin`/`margin-top`/`margin-bottom`/`margin-left` y `gap` en `index.html`, `styles.css` y `wizard-doc.js` mostró valores sin criterio: 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20, 22, 23, 28px.

## Escala aprobada

5 pasos, redondeando cada valor existente a una grilla de 4px:

| Token | Valor | Consolida |
|---|---|---|
| `--sp-1` | 4px | 1, 2, 3, 4px |
| `--sp-2` | 8px | 5, 6, 7, 8px |
| `--sp-3` | 12px | 10, 12px |
| `--sp-4` | 16px | 14, 16px |
| `--sp-5` | 28px | 18, 20, 22, 23, 28px |

## Alcance

- Aplica a `margin`, `margin-top`, `margin-bottom`, `margin-left`, `margin-right` y `gap` en los 3 archivos (`index.html`, `styles.css`, `wizard-doc.js`).
- **Fuera de alcance:** `padding` (ya tiene su propio criterio resuelto vía `--ctrl-h` para controles, y el padding de cards/botones es específico de cada componente, no espaciado entre bloques).

## Mecánica

Mismo mecanismo que las migraciones previas: por cada valor catalogado, reemplazo global de `propiedad:Npx` por `propiedad:var(--sp-N)` en cada archivo, verificado con grep antes/después.

## Verificación

Grep final confirmando que no queda ningún valor de margen/gap catalogado suelto en los 3 archivos (fuera de la definición del token en `:root`), y revisión visual rápida de los 4 flujos para confirmar que no se rompió ningún espaciado visualmente.
