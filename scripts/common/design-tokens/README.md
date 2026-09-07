# design-tokens

Migracion y verificacion de los tokens visuales del front.

## Por que existe

Los specs de `docs/superpowers/specs/` (`design-tokens-unification`, `spacing-scale-unification`) definieron una escala unica de colores, tamanos de letra y espaciado, y se aplicaron a `public/index.html`, `public/styles.css` y `public/wizard-doc.js`.

Quedo afuera el front del builder de Collections ("Generar casos de prueba"), que crecio aparte. Al medirlo:

| | `styles.css` (el estandar) | `collections.css` |
|---|---|---|
| tamano | 22 KB | 127 KB |
| usos de `var(--token)` | 267 | 202 |
| `font-size` fuera de escala | 10 de 15 | **143 de 287** |
| colores fuera de token | 29 de 46 | **672 de 739** |
| espaciados fuera de escala | 6 de 9 | **171 de 308** |

115 colores distintos contra los 14 del proyecto.

Pero el problema de fondo no era la cantidad: **`collections.css` usaba la paleta slate de Tailwind** (`#64748b`, `#94a3b8`, `#475569`), que tiene tinte **azul**, mientras el resto de la app usa grises **neutros** (`#636768`, `#c6c7c7`). Ese cast frio es lo que hacia que la herramienta se viera de otra aplicacion aunque el layout fuera parecido.

## Resultado

| | antes | despues |
|---|---|---|
| usos de `var(--token)` | 202 | **1424** |
| `font-size` fuera de escala | 143 | **0** |
| colores fuera de token | 672 | **0** |
| espaciados fuera de escala | 171 | **0** |

Verificado en runtime sobre la app corriendo: los 5 tokens nuevos resuelven, **0** colores slate quedan renderizados en los 109 elementos del builder presentes en el DOM, **0** propiedades sin resolver y **0** elementos de bajo contraste entre los 91 con texto.

## Los 5 tokens que se agregaron

Van al `:root` compartido de `styles.css`, no a `collections.css`, para que cualquier herramienta los pueda usar. Todos **neutros**, para eliminar el tinte azul.

| Token | Valor | Lum | Por que |
|---|---|---|---|
| `--text-2` | `#47494a` | 73 | Texto secundario. Llenaba el hueco entre `--text` (20) y `--muted` (103): el builder usaba dos niveles ahi que no existian como token |
| `--muted-l` | `#9fa1a2` | 160 | Hints, placeholders, deshabilitados. Mas claro que `--muted` |
| `--border-l` | `#e3e4e4` | 228 | Borde suave. Los 7 bordes del builder iban de 219 a 242, todos mas claros que `--border` (199): mandarlos a `--border` los hubiera vuelto notablemente mas pesados |
| `--surface` | `#fafafa` | 250 | Superficie sutil sobre el fondo de pagina, mas clara que `--bg` (242) |
| `--red-d` | `#9e2423` | 65 | Rojo oscuro de enfasis y hover. Mismo valor que el ya existente `--blue-h`, que pese al nombre guarda el rojo de marca oscuro desde el rebrand: se agrego con nombre correcto en vez de propagar esa confusion |

## Archivos

| Archivo | Que hace |
|---|---|
| `token-map.js` | **La decision de diseno escrita.** Cada color ajeno tiene un destino elegido por ROL (texto/fondo/borde), no por cercania de hex. Incluye las excepciones justificadas y la heuristica para la cola larga |
| `migrate.js` | Aplica el mapeo. `--dry-run` (default) no escribe |
| `audit.js` | Verifica que no queden valores sueltos. Tambien CLI |
| `audit.test.js` | El gate. 23 tests |

## Uso

```bash
node scripts/common/design-tokens/audit.js
node scripts/common/design-tokens/migrate.js --dry-run
node scripts/common/design-tokens/migrate.js --aplicar
```

La migracion es **idempotente**: correrla de nuevo no cambia nada.

## Decisiones que no son mecanicas

Lo que hubo que decidir mirando el selector, no el tono:

- **Los tags de verbo HTTP (`#1d4ed8`) no se tocan.** Distinguen GET/POST/PUT: es una funcion **categorica**, no una semantica de estado. Mismo criterio con el que el spec exime a `.vf-tag` (indigo V4 / verde V3).
- **Los estados "en curso" (`#2563eb`, `#3b82f6`, `#60a5fa`) pasaron a ambar.** El proyecto no tiene token de "info", y agregar un azul de verdad iria contra la direccion de marca. Queda: ambar en progreso, verde exito, rojo error. Si se prefiere azul, es un token nuevo y una decision de marca.
- **El borde del nodo "auth" y el badge "query" son categoricos** y conservan su distincion, pero en ambar: el default de los nodos ya es rojo palido, y el azul era justamente lo que hacia ver esto como otra app.
- **Los bordes de hover van a `--border`,** no al rojo de marca. Los bordes por defecto quedaron en `--border-l`, asi que `--border` ya se lee como cambio de estado sin meter color de marca en cada hover.
- **El icono de la stat card "violet" se neutralizo a `--text-2`:** convive con las cards de error (rojo) y exito (verde), asi que tiene que distinguirse de ambas sin inventar color.
- **El texto de accion y del boton AI van a `--red-d`.** Son acentos accionables, y el lenguaje de acento de esta app es el rojo de marca.

## Dos defectos que aparecieron migrando

Los dos estan cubiertos por tests:

1. **Ambar clasificado como rojo.** La primera version de la heuristica mandaba `#d97706` a `--red`, y `#d97706` **es** `--warn`. En el naranja tambien `r > g > b`; lo que los separa es cuanto se despega el verde del azul. Sin ese ajuste, todos los ambares se volvian rojos.
2. **Fallback de `var()` pisado.** `var(--red-l,#fdf3f3)` quedaba como `var(--red-l,var(--red-l))`. CSS valido pero redundante; el migrador ahora lo colapsa.

## Lo que queda fuera, y por que

- **Altura de control y radios.** El input del builder mide 44px y el del resto 40px (`--ctrl-h`); los radios son 12px contra 10.5px. Es el dominio del spec `control-height-unification`, no del de tokens. El builder tiene **5** alturas distintas (30/34/36/38/42px) que son variantes de tamano: colapsarlas a una sola rompe las compactas, y eso es una decision de diseno, no un reemplazo mecanico.
- **`public/styles.css` y `public/index.html` no quedan en cero.** Ya estaban migrados por su spec, con sus propias excepciones declaradas. Este cambio solo les **agrega** los 5 tokens al `:root`, sin tocar ningun valor existente.
- **Los 40 JS de `public/collections/`** casi no generan estilos inline (1 color, 1 font-size, 1 espaciado en total), asi que no valia la pena incluirlos en el migrador.
