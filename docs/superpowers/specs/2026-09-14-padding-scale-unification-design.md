# Unificación de la escala de padding

> **Estado: APROBADO — opción B, implementada.** Gabriel eligió la grilla de 4px. La implementación está en [scripts/common/design-padding/](../../../scripts/common/design-padding/README.md), con una desviación declarada: en vez de una escala nueva `--pad-1..7` en paralelo, se extendió `--sp-*` a 7 pasos, porque dos escalas idénticas con nombres distintos reproducen el problema que el pase resuelve. El resto del documento queda como estaba: es el registro de por qué se eligió B y qué se descartó.

## Contexto

Salió del cierre del pase de forma ([design-shape](../../../scripts/common/design-shape/README.md)). Cuando se midió qué le quedaba a `collections.css` para parecerse al resto del proyecto, el `padding` apareció como la única dimensión sin escala. Se dejó afuera de ese pase declarándolo así, y Gabriel pidió el spec.

El spec anterior de espaciado ([2026-07-01-spacing-scale-unification-design.md](2026-07-01-spacing-scale-unification-design.md)) ya lo había excluido, con esta razón escrita:

> **Fuera de alcance:** `padding` (ya tiene su propio criterio resuelto vía `--ctrl-h` para controles, y el padding de cards/botones es específico de cada componente, no espaciado entre bloques).

Ese argumento sigue siendo **medio cierto** y hay que tratarlo antes de proponer nada:

- **`--ctrl-h` resuelve controles: cierto a medias.** Con la altura fija, el padding vertical de un control no cambia nada visualmente. Pero eso aplica a **30 reglas**; las otras **246** con `padding` shorthand definen su alto con el padding. Y `--ctrl-h` nunca dijo nada del padding **horizontal**, que es la mitad del problema.
- **"Específico de cada componente": es la hipótesis que hay que verificar.** Si fuera cierta, cada valor sería una decisión y la dispersión sería irreducible. La medición de abajo dice que es cierta **en parte**, y ese matiz es lo que decide entre las opciones.

## La medición

Sobre las cuatro fuentes del front: `public/styles.css`, `public/collections.css`, `public/index.html`, `public/wizard-doc.js`.

| | |
|---|---|
| declaraciones de `padding` | **367** |
| componentes de valor (cada eje del shorthand por separado) | **613** |
| valores px distintos | **27** |
| declaraciones que ya usan un token | **2** de 367 |

Por forma del shorthand: 106 de un valor, 204 de dos, 47 de tres, 8 de cuatro. Las 2 restantes son `calc()` derivados del ancho de un nodo (`calc(var(--exec-node-width) / 2 - 9px)`): son geometría, no espaciado, y quedan fuera de cualquier opción.

### Hallazgo 1: no es un problema del builder

Esto es lo que cambia el planteo respecto de los dos pases anteriores. El de color y el de forma eran migraciones de **un archivo**, porque la divergencia estaba en un archivo. Acá no:

| | `styles.css` | `collections.css` |
|---|---|---|
| componentes | 118 | 399 |
| valores distintos | **23** | **25** |
| top-5 (% del archivo) | 10, 14, 12, 16, 8 | 10, 12, 14, 8, 16 |

Las dos distribuciones son **casi la misma**, y proporcionalmente `styles.css` es el archivo **más disperso** de los dos (23 valores en 118 componentes contra 25 en 399). El builder no diverge del resto acá: los dos tienen el mismo hábito.

**Consecuencia directa:** cualquier opción que migre toca **las 6 herramientas**, no una. Los dos pases anteriores sólo agregaron tokens al `:root` de `styles.css` y no cambiaron ninguna regla existente, así que Documentar, Scripts, Validar, SDT y Parametría quedaron pixel a pixel iguales. Acá eso no es posible.

### Hallazgo 2: hay una escala de facto, y casi no hay cola larga

| valor | componentes | acumulado |
|---|---|---|
| 10px | 94 | 15% |
| 12px | 88 | 30% |
| 14px | 85 | 44% |
| 8px | 54 | 52% |
| 16px | 49 | 60% |
| 4px | 33 | 66% |
| 9px | 28 | 70% |
| 18px | 27 | 75% |

**8 valores cubren el 75%.** Y los valores que aparecen 3 veces o menos son **5 valores distintos, 6 componentes: el 1%** (32, 34, 36, 40 y 44px, todos paddings de página o de modal).

Esto es cualitativamente distinto de lo que pasaba con el color, donde había 115 valores distintos con una cola larguísima y una paleta ajena (slate de Tailwind) debajo. Acá no hay una paleta ajena ni hay drift: hay una escala real que nadie escribió.

### Hallazgo 3: los dos valores más usados caen justo entre dos pasos

Es el problema técnico central.

```
--sp-*  actual:   4        8        12        16                    28
datos:                  8  9  10  11  12  13  14  15  16  18
                           ^^^^              ^^^^
                           94 comp.          85 comp.
```

- **10px** (94 componentes) está a 2px de `--sp-2` (8) **y** a 2px de `--sp-3` (12).
- **14px** (85 componentes) está a 2px de `--sp-3` (12) **y** a 2px de `--sp-4` (16).

Redondear no decide: hay empate exacto en el 29% de los componentes. Quien migre tiene que **elegir**, y esa elección es justamente el trabajo de diseño que esta escala no tiene resuelto.

### Hallazgo 4: los roles agrupan, pero se pisan en el medio

Clasificando cada regla con `padding` por el rol del selector:

| rol | reglas | vertical típico | horizontal típico |
|---|---|---|---|
| micro (chip, badge, tag, pill) | 23 | **1-5px** | **4-9px** |
| control (input, select, btn) | 34 | 8-11px | 9-16px |
| fila (row, item, option) | 26 | 6-12px | 9-16px |
| contenedor (card, panel, drawer) | 95 | 6-18px | 8-18px |

El rol **micro** tiene banda propia y limpia. Los otros tres se superponen casi por completo en 8-16px. O sea: el rol explica los extremos, no el centro. Una escala puramente por rol no reduce el vocabulario por sí sola; lo que cambia es **cómo se elige** al escribir un componente nuevo, que es otro beneficio (y no menor).

## Las opciones

Costo medido sobre los 613 componentes, con el empate de 10/14 resuelto hacia arriba:

| | pasos | se mueven | desvío medio | peor caso |
|---|---|---|---|---|
| **A** grilla de 2px | 11 | **131** (21%) | 1.6px | 16px |
| **B** grilla de 4px (4/8/12/16/20/24/28) | 7 | **357** (58%) | 1.9px | 16px |
| **C** por rol | ~5 pares | depende del mapeo | — | — |
| **D** congelar y auditar, sin migrar | — | **0** | 0 | 0 |

---

### Opción A — grilla de 2px (11 pasos)

`2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28`

- **A favor:** el más barato. Sólo se mueve el 21%, y ningún valor popular se toca (10, 12, 14 y 16 son pasos de la escala).
- **En contra:** **no es una escala, es el status quo con nombres.** Once pasos con vecinos a 2px no le dicen a nadie cuál elegir; al escribir un componente nuevo seguís midiendo a ojo. El beneficio real se reduce a poder poner un gate que frene valores nuevos.

### Opción B — grilla de 4px completa (7 pasos)

`--pad-1:4 --pad-2:8 --pad-3:12 --pad-4:16 --pad-5:20 --pad-6:24 --pad-7:28`

Con el empate de 10px y 14px resuelto **por rol**, no por redondeo, siguiendo el precedente que ya usa `token-map.js` ("cada valor tiene un destino elegido por ROL, no por cercanía"):

| valor | destino | por qué |
|---|---|---|
| 10px vertical en control / fila | 8px | el alto de fila lo fija `--ctrl-h` o el contenido; bajar aprieta menos de lo que 12 estira |
| 10px horizontal | 12px | el respiro lateral de un control es lo que se lee como "apretado"; 8px lo aprieta |
| 14px vertical | 12px | mantiene la altura de card cerca de la actual |
| 14px horizontal | 16px | alinea con el padding de contenedor, que ya domina en 16 |
| 9, 11px | 8, 12px | redondeo directo, sin empate |
| 18px | 16px | el paso 20 existe para el que sí necesita más |

- **A favor:** la única que reduce el vocabulario de verdad: **27 → 7**. Después de esto, un componente nuevo tiene 7 opciones y ninguna excusa. El desvío es **≤2px en el 97%** de lo que se mueve (347 de 357); los 10 restantes son paddings de página y de modal (32-44px → 28px), donde 16px de diferencia se nota pero son 10 lugares para mirar a ojo, no 357.
- **En contra:** **el 58% de los componentes se mueve, en las 6 herramientas**, por un beneficio que hoy no se ve. Exige una pasada visual completa de los 6 flujos, no un grep. Es la opción con el commit más grande del proyecto.

### Opción C — por rol, como el pase de color

Pares x/y por rol, no números sueltos:

```
--pad-micro:  3px 8px      chips, badges, tags
--pad-ctrl:   0 12px       inputs, selects, botones (el alto lo pone --ctrl-h)
--pad-fila:   10px 14px    filas de lista, items de catálogo
--pad-card:   14px 16px    cards, paneles, drawers
--pad-seccion:28px         padding de página y de modal
```

- **A favor:** es la única que ataca la causa. El problema no es que haya 27 números, es que **no hay forma de saber cuál te toca**. Con esto, un componente nuevo declara qué es y hereda su padding. Es exactamente lo que hizo el pase de color al mapear por rol en vez de por cercanía de hex, y por eso ese pase aguantó.
- **En contra:** los roles se pisan en 8-16px (hallazgo 4), así que la clasificación de las 98 reglas del cubo "otro" hay que hacerla **a mano, mirando el selector**. No es un reemplazo mecánico verificable por script como los dos pases anteriores: es la opción con más trabajo de diseño y la única donde un script no puede probar que el resultado es correcto.

### Opción D — congelar y auditar, sin migrar

No se toca ningún valor existente. Se agrega el gate:

- `scripts/common/design-shape/audit.js` (o un módulo propio) falla si aparece un `padding` con un valor **fuera** de la escala de facto ya medida: `4, 8, 9, 10, 12, 14, 16, 18, 20, 24, 28`.
- Los 6 valores del 1% de cola larga (32, 34, 36, 40, 44) entran como excepciones declaradas con su razón, igual que `FONT_SIZE_EXENTOS`.

- **A favor:** **riesgo visual cero** y el drift se detiene hoy. Captura la mayor parte del valor futuro sin tocar una línea de CSS renderizado. Es lo que hace un código maduro con una deuda que no duele.
- **En contra:** congela una lista de 11 valores que no es una escala. La deuda no crece, pero tampoco baja, y el que escriba un componente nuevo sigue sin saber cuál elegir (sólo sabe cuáles NO puede usar).

## Recomendación

**D ahora, C cuando haya una razón visual para abrir el CSS de las 6 herramientas.**

El razonamiento, en orden:

1. **Esto no es lo que Gabriel vio.** El reclamo era que "Generar casos de prueba" se veía de otra aplicación, y eso era color (pase 1) y forma (pase 2). El padding **no diverge**: los dos archivos tienen la misma distribución, y `styles.css` es el más disperso de los dos. Migrarlo no acerca el builder al resto, porque ya está igual de lejos que el resto de sí mismo.
2. **B es la única que reduce el vocabulario de verdad, y cuesta mover el 58% de los componentes de las 6 herramientas** por un beneficio invisible hoy. Eso no es una migración mecánica: es un rediseño de densidad de toda la app disfrazado de reemplazo de tokens.
3. **A es una trampa.** Es barata porque no cambia casi nada, y no cambia casi nada porque no decide nada. Once pasos a 2px no son una escala.
4. **D compra el 80% del valor —que se detenga el drift— a costo cero**, y deja la puerta abierta a C.
5. **C es la respuesta correcta a largo plazo**, pero conviene hacerla cuando ya haya que abrir esas reglas por otro motivo, y sabiendo que las 98 reglas del cubo "otro" se clasifican a mano.

Si la prioridad es que el CSS quede formalmente cerrado en las tres dimensiones (color, forma, espaciado), entonces es **B**, y hay que presupuestar la pasada visual de los 6 flujos como parte del trabajo, no como verificación al final.

## Alcance, si se aprueba B o C

- `public/styles.css`, `public/collections.css`, `public/index.html`, `public/wizard-doc.js`.
- **Fuera de alcance:** los `padding` con `var()` ya resueltos (15 declaraciones) y los 5 valores de cola larga de padding de página, que entran como excepción declarada.
- **No se toca `--ctrl-h`.** El alto de los controles ya está resuelto por su propio spec y este cambio no lo pisa: en las 30 reglas que fijan altura, el padding vertical es inerte.

## Mecánica, si se aprueba

La misma de los dos pases anteriores, que ya está probada:

1. `shape-map.js` equivalente con el mapeo escrito y las excepciones justificadas.
2. `migrate.js` con `--dry-run` por defecto e idempotente, conservando CRLF.
3. `audit.js` + `audit.test.js` como gate en el mismo commit.

La diferencia con los pases anteriores, y hay que decirla: acá el script **no alcanza para verificar**. En color y forma el resultado correcto era demostrable (0 valores fuera de token). Acá el script demuestra que los valores están en la escala, pero no que la app siga viéndose bien: 357 componentes moviéndose necesitan ojos sobre los 6 flujos.

## Verificación, si se aprueba

1. Auditoría en verde sobre los 4 archivos.
2. Test de idempotencia de la migración.
3. **Pasada visual de los 6 flujos** (Ambiente, Documentar, Scripts, Validar, Casos de prueba, SDT, Parametría), comparando captura antes/después de cada paso. Esta es la verificación que manda, no la del script.
4. Chequeo en runtime de desbordes (`scrollWidth > clientWidth` sobre elementos sin `overflow` ni `ellipsis`), con el mismo método que se usó para validar la escalera tipográfica del builder: comparar el DOM con los valores viejos y los nuevos para separar desbordes nuevos de preexistentes.
