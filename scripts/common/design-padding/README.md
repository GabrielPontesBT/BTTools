# design-padding

Tercer pase de unificacion visual: **padding**. Implementa la opcion B del spec [2026-09-14-padding-scale-unification-design.md](../../../docs/superpowers/specs/2026-09-14-padding-scale-unification-design.md), que Gabriel aprobo.

## Por que es distinto de los dos pases anteriores

Los pases de [color](../design-tokens/README.md) y [forma](../design-shape/README.md) migraban **un archivo**, porque la divergencia estaba en un archivo: el builder de Collections. Este no.

| | `styles.css` | `collections.css` |
|---|---|---|
| componentes de padding | 118 | 399 |
| valores px distintos | **23** | **25** |

Proporcionalmente `styles.css` era el archivo **mas disperso** de los dos. El padding no era un problema del builder: era una dispersion de toda la app. Por eso este pase toca **las 6 herramientas**, y por eso la verificacion que manda no es el script.

## La escala

```
--sp-1:4   --sp-2:8   --sp-3:12   --sp-4:16   --sp-5:20   --sp-6:24   --sp-7:28
```

**Desviacion del spec, declarada.** El spec proponia `--pad-1..7` en paralelo a `--sp-1..5`. Se implemento **extendiendo `--sp-*`**: tener `--sp-3:12px` y `--pad-3:12px` a la vez es la misma escala escrita dos veces, y al escribir un componente nuevo volves a tener que elegir entre dos vocabularios — exactamente el problema que el pase viene a resolver. Ahora hay una sola escala, continua, de 4 en 4, para `margin`, `gap` y `padding`.

La extension costo un renombre mecanico: `--sp-5` valia 28px y ahora vale 20px, asi que los **24 usos** existentes de `var(--sp-5)` pasaron a `var(--sp-7)` antes de redefinir el `:root`. El renombre es condicional (solo corre mientras el `:root` tenga la forma vieja), que es lo que mantiene el pase idempotente.

## Resultado

| | antes | despues |
|---|---|---|
| valores px distintos | **27** | **0** (7 tokens) |
| componentes en la escala | 246 de 613 | **613 de 613** |
| declaraciones de padding con token | 2 de 367 | **todas menos 8** |
| componentes que se movieron | — | **356** |

Los 8 que quedan como px literal son las exenciones de geometria, declaradas con su razon.

## Archivos

| Archivo | Que hace |
|---|---|
| `pad-map.js` | **La decision escrita.** La escala, como se rompen los empates, los dos valores que van por rol y las 6 exenciones con su razon |
| `migrate.js` | Aplica el mapeo sobre los 4 archivos. `--dry-run` (default) no escribe |
| `audit.js` | El verificador. Tambien CLI |
| `audit.test.js` | El gate. 34 tests |

## Uso

```bash
node scripts/common/design-padding/audit.js
```

```bash
node scripts/common/design-padding/migrate.js --dry-run
```

```bash
node scripts/common/design-padding/migrate.js --aplicar
```

## Decisiones que no son mecanicas

### Los empates se rompen por frecuencia

Un valor a mitad de camino entre dos pasos no lo decide el redondeo. Se elige el paso que el proyecto **ya usa mas**, que es minimizar cuanto se mueve el resultado:

| valor | empata entre | componentes de cada paso | gana |
|---|---|---|---|
| 6px | 4 y 8 | 33 vs 54 | **8** |
| 18px | 16 y 20 | 49 vs 17 | **16** |
| 22px | 20 y 24 | 17 vs 7 | **20** |

### 10px y 14px van por rol, no por frecuencia

Son los dos valores mas usados del front (94 y 85 componentes, el **29%** del total). Romperlos por frecuencia los mandaria a los dos a 12px, junto con el propio 12px: **267 componentes, el 44%, con el mismo padding**. Eso aplana la jerarquia entre una fila y una card, que es informacion real.

Van por rol, igual que el pase de color resolvia un hex por rol y no por cercania:

| valor | eje | rol | destino |
|---|---|---|---|
| 10px | vertical | control, fila | **8px** |
| 10px | vertical | resto | **12px** |
| 10px | horizontal | todos | **12px** |
| 14px | vertical | todos | **12px** |
| 14px | horizontal | todos | **16px** |

Resultado: una fila queda en 8/12 y un contenedor en 12/16. Hay un test que verifica que esa jerarquia sobreviva.

### Hay padding que no es espaciado, es geometria

Es la parte que un reemplazo mecanico rompe si nadie la declara. Seis reglas reservan el hueco de un elemento en `position:absolute` que se superpone al contenido:

| regla | que reserva |
|---|---|
| `.pw input` | el ojito de la password (`.pw-btn`, `absolute;right:9px`) |
| `.collection-inspector-search-input` | la lupa del inspector (`absolute;left:10px`) |
| `.collection-service-search-input` | la lupa del catalogo (`absolute;left:28px`) |
| `.collection-service-search-wrap` | **todo el eje**: el `left:28px` de la lupa se mide desde este wrap |
| `.collection-exec-code` | la barra flotante (meta + Copiar) sobre el bloque de codigo |
| `.steps-bar` | el riel del stepper, y su escalera responsive propia (30/24/22/20px) |

Cambiarlos **no mueve** el elemento absoluto — sus offsets se miden contra el padding box, no contra el contenido. Lo que hace es que el icono le pise el texto al usuario.

La exencion es del **valor** acoplado, no de toda la regla: en `padding:0 10px 0 30px` el unico valor atado al icono es el 30, y el 10 es espaciado comun que si entra en la escala.

Los 6 casos salieron de cruzar todas las reglas con padding asimetrico contra todos los `position:absolute` con offset en px de los 4 archivos, no de mirar a ojo.

## El defecto que aparecio migrando

Esta cubierto por dos tests, y vale la pena contarlo porque es la clase de bug que un pase mecanico produce y que ningun test de "esta en la escala" hubiera visto.

**La escala se redefinio a si misma.** Los tokens `--sp-*` tambien se consumen dentro de declaraciones de padding — son, justamente, el destino del pase. El sub-pase que migra custom properties los tomo como "una var con un px adentro" y reescribio su propia definicion:

```css
--sp-1:var(--sp-1);--sp-2:var(--sp-2); ...
```

CSS descarta una referencia circular en tiempo de computo, **sin error visible**. Los siete tokens quedaron vacios y con ellos se cayo *toda* regla que usara cualquier token: colores, tamaños, radios, sombras, espaciado, en las 6 herramientas y a la vez. La app quedo sin estilos y el CSS seguia parseando 232 reglas sin una sola queja en consola.

Lo agarro la verificacion en runtime, no el script: la huella del DOM paso de 121 elementos con padding a 3. El script decia que todo estaba en la escala, y tenia razon.

El audit ahora falla explicitamente si encuentra un token circular.

## La verificacion

El script **no alcanza** en este pase, y el spec ya lo decia. En color y forma el resultado correcto era demostrable (0 valores fuera de token). Aca eso es necesario pero no suficiente: 356 componentes moviendose necesitan ojos.

Lo que se hizo:

1. **Huella del DOM antes y despues**, sobre los 15 paneles del wizard forzados visibles: 121 elementos con padding, comparando padding computado y rectangulo de cada uno. De los 39 comparables (excluyendo los que cambian por estado, no por CSS): 17 sin cambio, 13 crecieron 4px, 3 se achicaron 2-4px y 6 se achicaron 16px (las tarjetas de accion, 36px → 28px, que era el cambio mas grande previsto).
2. **Desbordes**, comparando el DOM con la escala nueva y con la vieja aplicada en memoria: 1 en los dos casos, o sea **0 desbordes nuevos**.
3. **Las exenciones, medidas en runtime**: en el buscador del catalogo el icono termina en 32px y el texto arranca en 34px. El hueco sobrevivio.
4. **Capturas** de los 6 flujos: Ambiente, Accion, API, Scripts, SDT, Parametria, Validar y el builder de Collections con catalogo e inspector abiertos.

## Lo que queda fuera

- **Los `calc()` derivados de un ancho** (`padding-right:calc(var(--exec-node-width)/2 - 9px)`): son geometria de un conector, no espaciado.
- **`--exec-node-width`**, por lo mismo: se consume dentro de un padding pero es un ancho.
- **Los `padding:0`**: cero no es un paso de ninguna escala.
