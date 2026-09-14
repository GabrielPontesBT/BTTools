# design-shape

Segundo pase de unificacion visual del builder de Collections ("Generar casos de prueba"): **forma**, no color.

## Por que existe

El pase de [`design-tokens/`](../design-tokens/README.md) unifico color, `font-size` y espaciado, y dejo `collections.css` en **0 valores sueltos** de esas tres dimensiones. Aun asi la herramienta se seguia viendo de otra aplicacion.

Porque el color no era lo unico que estaba afuera:

| | resto de la app | `collections.css` (antes) |
|---|---|---|
| sombras | **1** (la del modal) | **49** declaraciones con valor propio, **35** valores distintos |
| tinte de la sombra | `rgba(18,20,24)` neutro | `rgba(15,23,42)` = **slate-900 de Tailwind**, tinte azul |
| marcas ajenas | — | `rgba(79,70,229)` indigo-600 y `rgba(109,94,252)` violeta, en 8 sombras de la vista de ejecucion |
| radios distintos | 7 | **21** (5, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 999px…) |
| `border-radius:999px` | 0 | **39** |
| `font-weight` maximo | 700, en 5 usos | **800** en 71 usos, **900** en 2 |
| `text-transform:uppercase` | 2 | **20**, con 5 trackings distintos |
| alto de control | `--ctrl-h: 40px` | 42 / 44 / 48px |

**El pase de color no podia ver nada de esto.** Su auditoria mide `#hex`; una sombra vive dentro de un `rgba()`, que no tiene hex. Por eso el archivo podia auditar "0 colores sueltos" y tener igual 49 sombras y 6 fondos con base slate.

El resultado era un builder que flotaba sobre 49 sombras azuladas, con esquinas de 24px y tipografia en 800, al lado de una app plana de bordes de 1.5px, esquinas de 12px y tipografia en 600. Se lee como otro producto aunque los grises sean identicos.

## Resultado

| | antes | despues |
|---|---|---|
| valores de sombra distintos | 35 | **3** tokens de elevacion (+ el anillo de foco) |
| sombras con tinte ajeno | 49 | **0** |
| radios distintos | 21 | **4 tokens** + `50%` + `0` |
| `font-weight` > 700 | 73 | **0** |
| trackings de mayuscula | 5 | **1** (`.04em`) |
| `rgba()` con tinte ajeno | 52 de 56 | **0** (los 4 que quedan son blanco puro) |
| custom properties declaradas y nunca usadas | 6 (en 5 breakpoints) | **0** |

Verificado en runtime sobre la app corriendo, recorriendo builder + drawer + inspector + vista de ejecucion: **0** sombras con tinte azul entre los 429 elementos presentes en el DOM, 3 valores de sombra renderizados (los tres neutros), y la distribucion de pesos (400 / 500 / 600 / 700) igual a la del resto de la app.

## Los 6 tokens que se agregaron

Van al `:root` compartido de `styles.css`, no a `collections.css`, para que cualquier herramienta los pueda usar. **Ninguno inventa un valor**: los seis salen de medir lo que el resto de la app ya hace.

| Token | Valor | De donde sale |
|---|---|---|
| `--r-xs` | `6px` | El radio que ya usan `.pinput`, `.param-f input`, `.sg-chk` y `.casing-opt`. Absorbe los 5/7/8/9px del builder |
| `--r-ctrl` | `0.7em` | El radio de `.field input` y `.btn`, escrito a mano 9 veces en `styles.css`. Se le pone nombre en vez de repetirlo |
| `--r-pill` | `20px` | El de `.btn-pill`. Reemplaza los 39 `999px`: en un elemento de hasta 40px de alto la pill sigue siendo completa, lo que desaparece es el segundo vocabulario de redondeo |
| `--shadow-sm` | `0 2px 8px rgba(18,20,24,.08)` | Elevacion 1: hover y estados. Tinte neutro, el mismo `#121418` de `--text` |
| `--shadow-md` | `0 8px 24px rgba(18,20,24,.10)` | Elevacion 2: popovers, drawers, capas flotantes |
| `--ring` | `0 0 0 3px var(--red-l)` | El anillo de foco que el builder ya usaba con ese valor exacto en 6 lugares, escrito a mano cada vez |

Los destinos que ya existian: `--r` (12px, el de `.ccard`), `--shadow` (la del modal) y `--ctrl-h` (40px).

## Archivos

| Archivo | Que hace |
|---|---|
| `shape-map.js` | **La decision de diseño escrita.** Cada valor tiene un destino elegido por ROL, con las excepciones justificadas |
| `migrate.js` | Aplica el mapeo. `--dry-run` (default) no escribe |
| `audit.js` | El verificador. Tambien CLI |
| `audit.test.js` | El gate. 36 tests |

## Uso

```bash
node scripts/common/design-shape/audit.js
```

```bash
node scripts/common/design-shape/migrate.js --dry-run
```

```bash
node scripts/common/design-shape/migrate.js --aplicar
```

La migracion es **idempotente**: correrla de nuevo no cambia nada, y hay un test que lo verifica.

## Decisiones que no son mecanicas

### La sombra se decide por rol, no por desenfoque

Fue la decision central. La primera version mapeaba por desenfoque (≤20px → `sm`, ≤40px → `md`), y el resultado dejaba 30 elementos flotando: en el builder el desenfoque **no significaba nada**, un panel fijo de layout y un popover tenian la misma sombra de 34px.

El criterio bueno sale de mirar como separa superficies el resto de la app: `.svc-wrap`, `.gen-log`, `.param-card`, `.sg-svc-group` y `.sdtgen-fields` son todos **borde y cero sombra**. La unica sombra del proyecto es la del modal. Asi que:

- **Capa flotante** (popover, dialog, drawer, dock, menu, consola) → `--shadow-md`.
- **Estado** (`:hover`, `:focus`, `.active`, `-selected`, `-running`) y botones chicos que flotan sobre contenido que scrollea → `--shadow-sm`. Ahi la sombra **significa algo** en vez de ser decoracion permanente.
- **Estructura** (paneles, cards, nodos, headers, sidebars) → `none`. Los 16 elementos que perdieron la sombra ya tenian `border:1px solid var(--border-l)`: no quedan sin separacion, quedan separados como el resto de la app.
- **El dialogo de ejecucion** se queda con `--shadow`, la del modal: es la unica capa realmente modal del builder.

### El 999px se resuelve por la forma del elemento, no por el valor

Un `border-radius:999px` sobre un cuadrado es un **circulo**, y el proyecto los escribe `50%` (`.sdot`, `.ok-icon`). Mandarlos todos a `--r-pill` (20px) dejaba de ser circulo el icono del canvas vacio (72px) y el spinner de ejecucion (56px). El mapeo mira `width === height` en la regla: 11 de los 39 eran circulos.

### El peso se reparte contra la escala real del proyecto

Colapsar 800 y 900 a 700 arregla el exceso pero deja 149 elementos en el peso que la app reserva para cinco cosas (`.wiz-hd-title`, `.ccard-title`, `.ccard-badge`, `.sdot`, `.pg-flabel`). Asi que despues del colapso se reparte por rol:

- lo que se clickea (`-btn`, `-trigger`, `-toggle`, `-menu-item`) y los `<label>` → **500**, el peso de `.btn` y `.field label`;
- encabezados, contadores y metadatos (`-label`, `-count`, `-meta`, `-key`, `-ms`, `-tab`, `h3`, `summary`…) → **600**, el peso de trabajo de la app;
- titulos, nombres y badges → **700**.

El rol lo da el **componente**, no el modificador: `.collection-exec-tab.active` sigue siendo un tab.

### El alto solo se toca en controles

`--ctrl-h:40px` aplica a inputs, selects y botones. Un cuadrado de 44×44 (el "mark" de marca, el avatar de la vista de ejecucion) **no** es un control: forzarlo a 40 lo deformaria porque su ancho seguiria en 44. El mapeo mira la ultima parte del selector.

La escalera responsive compacta del builder (36/34/32/30px en pantallas chicas) **no se toca**: es densidad buscada. Si se re-anclo el escalon de `≤1920px`, que dejaba el builder en 38px, porque en la practica **es el que corre** (cualquier monitor de 1920 o menos entra ahi) y era el que se veia al lado del resto de la app.

### El borde: sube el grosor de las cajas, no el tono

Dos cosas distintas que se confunden facil.

**El grosor.** Medido sobre `styles.css`, el proyecto dibuja una caja con `border:1.5px` (19 usos) y 2px cuando va enfatizada (`.ccard`, `.sdot`, `.sg-chk`). El builder tenia **81 cajas en 1px**: al lado de un `.svc-wrap` o un `.param-card` del wizard se leen de otro grosor. Las 81 suben a 1.5px. En un monitor al 100% las dos redondean al mismo pixel fisico y no se nota; a partir del 125-150% de escalado de Windows, que es donde suele estar un portatil, si.

**El tono no se toca**: se queda en `--border-l`. El pase de color lo eligio a proposito para los paneles del builder (ver `token-map.js`), porque sus 7 bordes iban de luminancia 219 a 242 y mandarlos a `--border` (199) los hubiera vuelto notablemente mas pesados. La unica excepcion son los **5 inputs**, que van a `1.5px solid var(--border)` completo: un campo editable tiene que leerse como editable, y ese es el borde con el que el proyecto lo marca (`.field input`).

**Los separadores no entran.** `border-top` / `border-bottom` / `border-left` / `border-right` dibujan la linea entre dos filas, no una caja, y ahi los dos archivos ya coincidian en 1px (16 usos en `styles.css`, 31 en `collections.css`). Hay un test que verifica que sigan asi.

### Las mayusculas se quedan, el tracking se unifica

`text-transform:uppercase` en un micro-label **es** un patron del proyecto (`.ccard-badge`, `.pg-flabel`). Lo que no era patron eran los 5 trackings distintos (.03/.04/.05/.06/.08em). Todos van al del proyecto: `.04em`.

## Dos defectos que aparecieron migrando

Los dos estan cubiertos por tests:

1. **39 de las 49 sombras quedaban sin migrar** (el dry-run cantaba 10 y solo migraba los anillos de foco). El parser buscaba longitudes como tokens terminados en `px`, y `0 18px 34px rgba(...)` empieza con un `0` pelado: contaba 2 longitudes, decidia que no parecia una sombra y la dejaba intacta. `longitudesDe()` ahora acepta el `0` sin unidad.
2. **El archivo entero aparecia modificado en `git diff`.** Los archivos del front estan guardados con CRLF y el script escribia LF: git marcaba las ~1500 lineas como cambiadas y el diff de la migracion quedaba ilegible justo cuando mas hay que revisarlo. `leer()`/`escribir()` conservan el final de linea original.

## Lo que queda fuera, y por que

- **El escalonado de tamaños de letra del builder.** Lo cierra el pase de color, que es el dueño de la escala tipografica: ver el punto "font-size escondido en una custom property" en [`design-tokens/`](../design-tokens/README.md).
- **El `padding`.** Es la unica dimension donde el builder NO diverge: `styles.css` tiene 45 shorthands distintos en 25KB y `collections.css` 123 en 130KB, proporcionalmente lo mismo, y el proyecto mismo escribe `padding:11px`, `padding:9px 14px` y `padding:10px 15px` fuera de la escala `--sp-*`. Meter el builder en una escala que el resto no cumple lo haria divergir, no converger.
- **`public/styles.css`.** Este pase solo le **agrega** los 6 tokens al `:root`; no cambia ninguna regla existente, asi que las otras 5 herramientas quedan pixel a pixel iguales.
- **`scripts/generar-collections/panel.html`.** No declara ni un `border-radius`, `box-shadow` ni `font-weight`: es solo estructura.
