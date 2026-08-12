# Controles extra en "Generar Scripts" y "Documentación" — Diseño

## Contexto

El wizard tiene dos herramientas relacionadas: **Documentar** (genera `.md`) y **Generar Scripts** (genera INSERT/DELETE SQL para instalar servicios en otra base). Ambas ya corren una validación de datos antes de permitir generar, pero con inconsistencias:

- **Generar Scripts no valida los campos de los SDT** que usa el método (Documentar sí lo hace vía `sg_validateSdts` en `setup.js`), pese a que el endpoint que alimenta Generar Scripts (`/sg/api/methods-full`) ya trae esos datos (`item.sdts`).
- **El script SQL generado no escapa comillas simples** dentro de texto libre (descripciones, nombres de programa, etc.). Si un dato real contiene un apóstrofe — algo frecuente en descripciones en español que citan un valor, ej. `"Debe indicarse 'S' o 'N'."` — el script generado queda roto.
- Los checks de "la descripción no termina en punto" no contemplan que una descripción termine en `?` (pregunta), lo cual hoy dispara una advertencia sobre texto correcto.

## Alcance

1. Extender la validación de Generar Scripts para que también revise los campos SDT (misma regla que Documentar).
2. Corregir el escaping de comillas simples en el script SQL generado, en ambos motores (SQL Server / Oracle) y en ambos modos de API (pública / interna).
3. Aceptar `.` o `?` como final válido de una descripción, en los tres lugares donde se chequea ese formato (Documentar server-side, Generar Scripts client-side, y la nueva validación SDT).

Fuera de alcance: chequeo de duplicados en la lista de servicios/métodos (se evaluó y se descartó para esta iteración).

## Diseño

### 1. Validación SDT en Generar Scripts

`validateItems(items, apiMode)` en `public/wizard-doc.js` recibe `items`, cada uno con `item.sdts` (array de `{nom, bti025, bti026}`) ya resuelto por `/sg/api/methods-full`. Se agrega:

```js
function validateSdtFields(allSdts) {
  // allSdts: sdts de todos los items, puede repetirse el mismo SDT entre grupos
  // dedupe por sdt.nom antes de validar
  // por cada bti026 (campo): mismo chequeo que sg_validateSdts en setup.js
  //   - elemdsc vacío -> warning 'BTISDTELEMDSC' "Descripción vacía."
  //   - no termina en '.' ni '?' -> warning 'BTISDTELEMDSC' "No termina con punto ni signo de pregunta."
  //   - podría estar en inglés -> warning 'BTISDTELEMDSC' "Podría estar en inglés."
  //   - tipo en {C,N,F} y elemlargo === 0 -> warning 'BTISDTELEMLARGO' "Largo es 0 para tipo X."
  // param: sdt.nom + '.' + elemnom
}
```

`validateItems` recolecta `item.sdts` de todos los items pasados, dedupea por nombre, llama `validateSdtFields`, y concatena sus warnings al resultado. Si `apiMode === 'interna'` sigue devolviendo `[]` (comportamiento actual, sin cambios).

`_FIELD_TABLE` en `wizard-doc.js` ya mapea `BTISDTELEMLARGO`/`BTISDTELEMDSC` a `BTI026`, así que `renderWarnings` no necesita cambios.

### 2. Escaping de comillas simples

`sg_sq(val, ver, nullable)` y `btcbs_sq(val, nullable)` en `scripts/generar-scripts/index.js`: antes de envolver en comillas, reemplazar cada `'` por `''` (escaping estándar SQL, funciona igual en T-SQL y PL/SQL).

Además, varias funciones de `sg_generateScript` interpolan campos a mano sin pasar por `sg_sq` (`insBti004`, `insBti014`, `delBti004`, `delBti014`, `delBti019`), lo que deja el fix de escaping sin efecto ahí. Se reescriben esas funciones para que **todo** valor de texto (`BTINom`, `BTISrvNom`, `BTISrvVer`, `BTIMtdNom`, `m.dsc`, `m.pgmnom`, `m.pgmmtd`, `m.fpath`, `m.nsbt`, `m.espggx`, `h.BTISrvDsc`, `h.BTISrvPgmName`) pase por `q()` (que ya es `sg_sq(val, ver)` en ese scope). `btcbs_generateScript`/`btcbs_generateSdtScript` ya usan `q()`/`btcbs_sq` de forma consistente — solo necesitan el fix de escaping en la función, sin tocar sus llamadas.

`enbtraV` (el único valor que hoy no es de texto libre en `insBti014`, ya viene de un enum controlado `S/N/NULL`) se deja igual.

### 3. Punto o signo de pregunta como final válido

Cambiar la condición `!dsc.endsWith('.')` por `!dsc.endsWith('.') && !dsc.endsWith('?')` en:

- `setup.js` → `sg_validateOne` (`BTIMTDDSC`, `BTISRVPARDSC`)
- `public/wizard-doc.js` → `validateItems` (`BTIMTDDSC`, `BTISRVPARDSC`)
- la nueva `validateSdtFields` (`BTISDTELEMDSC`)

Mensaje de advertencia actualizado a `"No termina con punto ni signo de pregunta."` en los tres lugares para que sea consistente.

## Testing

**`scripts/generar-scripts/index.test.js`** (Node test runner, sin red/DB — mismo patrón que ya existe):
- `sg_sq`/`btcbs_sq` escapan `'` como `''` en un valor simple.
- Script generado con `m.dsc` conteniendo `'` (ej. `"Debe indicarse 'S' o 'N'."`) produce SQL con comillas dobladas, para V3, V4-pública y V4-interna, en `insert`/`delete`/`both`.
- Mismo caso para `h.BTISrvDsc`, `h.BTISrvPgmName`, `m.pgmnom`, `m.fpath` (los campos que antes NO pasaban por `sg_sq`).
- Regresión: el test existente de `[object Object]` sigue pasando sin cambios (confirma que la reescritura de `insBti004`/`insBti014` no rompe el manejo de LOBs).

**`public/wizard-doc.test.js`**:
- `validateSdtFields`/`validateItems` con un SDT cuyo campo tiene descripción vacía → warning.
- Campo con descripción sin punto ni `?` → warning; con punto → sin warning; **terminando en `?` → sin warning** (caso nuevo).
- Campo tipo `C` con `elemlargo: '0'` → warning; tipo `C` con largo > 0 → sin warning.
- Mismo SDT presente en `sdts` de dos items distintos → advertencias no duplicadas.
- `apiMode: 'interna'` → sin advertencias de SDT (se mantiene el corte temprano existente).
- Caso existente de `BTIMTDDSC`/`BTISRVPARDSC` con descripción terminando en `?` → ya no debe advertir (regresión sobre el comportamiento nuevo del punto 3).

## Fuera de alcance / notas

- No se agrega chequeo de duplicados servicio+método en la lista (decisión explícita de esta iteración).
- No se toca la lógica de `DELETE` sobre nombres (`BTINom`/`BTISrvNom`/`BTIMtdNom`) más allá de hacerlos pasar por `sg_sq` — siguen siendo nombres internos de Bantotal, sin validación de formato adicional.
