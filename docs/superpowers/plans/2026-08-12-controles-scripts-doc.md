# Controles extra en "Generar Scripts" y "Documentación" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar tres inconsistencias de validación entre las herramientas "Generar Scripts" y "Documentar": comillas simples sin escapar en el SQL generado, falta de validación de campos SDT en Generar Scripts, y el check de "termina en punto" que hoy rechaza descripciones terminadas en `?`.

**Architecture:** Cambios puntuales en 2 módulos existentes, sin nueva infraestructura: `scripts/generar-scripts/index.js` (generación de SQL, testeado con `node:test` sin red/DB) y `public/wizard-doc.js` (validación client-side, testeado cargando el archivo real en un sandbox `vm`). Un tercer cambio equivalente en `setup.js` (validación server-side de Documentar) no tiene arnés de test — no exporta funciones y no hay `setup.test.js` — así que ese cambio se verifica manualmente contra el server real (ver Task 2).

**Tech Stack:** Node.js, `node:test` + `node:assert/strict`, sin dependencias nuevas.

## Global Constraints

- No se agrega chequeo de duplicados servicio+método (descartado explícitamente en el diseño).
- Los únicos finales válidos de descripción son `.` y `?` — no se agregan otros signos de puntuación.
- El escaping de comillas es `'` → `''` (estándar SQL, válido en T-SQL y PL/SQL) — no usar parametrización ni escaping por backslash.
- No tocar `enbtraV` en `insBti014` (viene de un enum controlado `S`/`N`/`NULL`, no es texto libre).
- No romper ningún test existente (`scripts/generar-scripts/index.test.js`, `public/wizard-doc.test.js`).

---

### Task 1: Escapear comillas simples en el SQL generado por Generar Scripts

**Files:**
- Modify: `scripts/generar-scripts/index.js:101-105` (`btcbs_sq`), `:128-133` (`sg_sq`), `:171-180` (`delBti019`, `delBti014`, `delBti004`, `insBti004`, `insBti014` dentro de `sg_generateScript`)
- Test: `scripts/generar-scripts/index.test.js`

**Interfaces:**
- Consumes: nada nuevo — `sg_sq(val, ver, nullable)` y `btcbs_sq(val, nullable)` ya existen y ya se exportan en `module.exports` (línea 280-289 de `index.js`).
- Produces: mismo contrato de `sg_sq`/`btcbs_sq`/`sg_generateScript` (mismos nombres, mismos parámetros, mismo tipo de retorno `string`). Las tasks 2 y 3 no dependen de este cambio.

- [ ] **Step 1: Escribir los tests que fallan para `sg_sq` y `btcbs_sq`**

Agregar al final de `scripts/generar-scripts/index.test.js` (antes de las dos últimas pruebas de `[object Object]`, o después — el orden no importa):

```js
test('sg_sq escapa comillas simples duplicandolas', () => {
  assert.equal(sg_sq("O'Connor", 'V4'), "'O''Connor'");
  assert.equal(sg_sq("Debe indicarse 'S' o 'N'.", 'V3'), "N'Debe indicarse ''S'' o ''N''.'");
});

test('btcbs_sq escapa comillas simples duplicandolas', () => {
  assert.equal(btcbs_sq("Debe indicarse 'S'.", false), "'Debe indicarse ''S''.'");
});
```

Agregar `sg_sq` y `btcbs_sq` al `require` del tope del archivo (ya existe la línea, hay que sumarlas):

```js
const { sg_generateScript, sg_generateSdtScript, sn_num, sg_serviceNamePrefix, sg_serviceListQuery, sg_cellText, sg_sq, btcbs_sq } = require('./index.js');
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `node --test scripts/generar-scripts/index.test.js`
Expected: FAIL en los dos tests nuevos (las comillas internas no están escapadas todavía).

- [ ] **Step 3: Implementar el escaping en `sg_sq` y `btcbs_sq`**

En `scripts/generar-scripts/index.js`, reemplazar:

```js
function sg_sq(val, ver, nullable) {
  const s = sg_cellText(val);
  if (nullable && s.trim() === '') return 'NULL';
  if (ver === 'V3') return "N'" + s + "'";
  return s.trim() === '' ? "' '" : "'" + s + "'";
}
```

por:

```js
function sg_sq(val, ver, nullable) {
  const s = sg_cellText(val);
  if (nullable && s.trim() === '') return 'NULL';
  const esc = s.replace(/'/g, "''");
  if (ver === 'V3') return "N'" + esc + "'";
  return s.trim() === '' ? "' '" : "'" + esc + "'";
}
```

Y reemplazar:

```js
function btcbs_sq(val, nullable) {
  const s = sg_cellText(val);
  if (nullable && s.trim() === '') return 'NULL';
  return s.trim() === '' ? "' '" : "'" + s + "'";
}
```

por:

```js
function btcbs_sq(val, nullable) {
  const s = sg_cellText(val);
  if (nullable && s.trim() === '') return 'NULL';
  return s.trim() === '' ? "' '" : "'" + s.replace(/'/g, "''") + "'";
}
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `node --test scripts/generar-scripts/index.test.js`
Expected: PASS en los dos tests nuevos. El resto de los tests del archivo también debe seguir en PASS (esta función la usa todo el archivo).

- [ ] **Step 5: Escribir los tests que fallan para los campos que hoy NO pasan por `sg_sq`**

`insBti004`, `insBti014`, `delBti004`, `delBti014` y `delBti019` interpolan varios campos a mano (`BTINom`, `BTISrvNom`, `BTISrvVer`, `BTIMtdNom`, `m.dsc`, `m.pgmnom`, `m.fpath`, `h.BTISrvDsc`, `h.BTISrvPgmName`) sin pasar por `sg_sq`, así que el fix del Step 3 no los cubre todavía. Agregar a `scripts/generar-scripts/index.test.js`:

```js
function methodDataWithQuotes(version, apiMode) {
  return methodData({
    version: version,
    apiMode: apiMode,
    header: { BTINom: 'BTSERVICES', BTISrvNom: 'PublicCustomers', BTISrvVer: '1', BTIMtdNom: 'get', BTISrvDsc: "Servicio de 'clientes'.", BTISrvPgmName: 'CustomersWS' },
    method: { dsc: "Debe indicarse 'S' o 'N'.", nsbt: 'S', pgmnom: "Pgm'X", pgmmtd: 'execute', status: 'Validado', fpath: "C:\\ruta'con'comilla", enbtra: 'N', espggx: 'S' },
  });
}

test('sg_generateScript V3 escapa comillas en BTISrvDsc (BTI004) y en dsc/pgmnom/fpath (BTI014)', () => {
  const script = sg_generateScript(methodDataWithQuotes('V3', 'publica'), 'insert');
  assert.match(script, /INSERT INTO BTI004[^\n]*N'Servicio de ''clientes''\.'/);
  assert.match(script, /INSERT INTO BTI014[^\n]*N'Debe indicarse ''S'' o ''N''\.'/);
  assert.match(script, /N'Pgm''X'/);
  assert.match(script, /N'C:\\ruta''con''comilla'/);
});

test('sg_generateScript V4 publica escapa comillas en dsc (BTI014)', () => {
  const script = sg_generateScript(methodDataWithQuotes('V4', 'publica'), 'insert');
  assert.match(script, /'Debe indicarse ''S'' o ''N''\.'/);
});

test('sg_generateScript V4 interna (BTCBS) escapa comillas en dsc', () => {
  const script = sg_generateScript(methodDataWithQuotes('V4', 'interna'), 'insert');
  assert.match(script, /'Debe indicarse ''S'' o ''N''\.'/);
});
```

- [ ] **Step 6: Correr los tests y verificar que fallan**

Run: `node --test scripts/generar-scripts/index.test.js`
Expected: FAIL en los 3 tests nuevos del Step 5 (los campos siguen interpolados a mano, sin escaping).

- [ ] **Step 7: Reescribir `insBti004`, `insBti014`, `delBti004`, `delBti014`, `delBti019` para que pasen todo por `q()`**

Dentro de `sg_generateScript` (que ya define `const q = (v) => sg_sq(v, ver);` en la línea 170), reemplazar las 5 funciones:

```js
function delBti019() { if(ver==='V3')return["DELETE FROM BTI019 WHERE BTINom=N'"+BTINom+"' AND BTISrvNom=N'"+BTISrvNom+"' AND BTIMtdNom=N'"+BTIMtdNom+"';"]; return["DELETE FROM BTI019 WHERE BTINOM='"+BTINom+"' AND BTISRVNOM='"+BTISrvNom+"' AND BTIMTDNOM='"+BTIMtdNom+"';"]; }
  function delBti014() { if(ver==='V3')return["DELETE FROM BTI014 WHERE BTINom=N'"+BTINom+"' AND BTISrvNom=N'"+BTISrvNom+"' AND BTIMtdNom=N'"+BTIMtdNom+"';"]; return["DELETE FROM BTI014 WHERE BTINOM='"+BTINom+"' AND BTISRVNOM='"+BTISrvNom+"' AND BTIMTDNOM='"+BTIMtdNom+"';"]; }
  function delBti004() { return["DELETE FROM BTI004 WHERE BTINom=N'"+BTINom+"' AND BTISrvNom=N'"+BTISrvNom+"';"]; }
  function insBti004() { const cols=V3_BTI004_COLS.join(', '),dsc=h.BTISrvDsc||'',pgm=(h.BTISrvPgmName||'').trim()||' '; return['INSERT INTO BTI004 ('+cols+") VALUES(N'"+BTINom+"', N'"+BTISrvNom+"', N'"+BTISrvVer+"', N'"+dsc+"', N' ', 0, 0, 0, N'"+pgm+"', N'                    ', N' ');"]; }
  function insBti014() {
    const status=(m.status||'Validado').padEnd(20).slice(0,20), enbtra=m.enbtra||'N', enbtraV=enbtra==='NULL'?'NULL':(ver==='V3'?"N'"+enbtra+"'":"'"+enbtra+"'");
    if(ver==='V3'){const cols=V3_BTI014_COLS.join(', ');return['INSERT INTO BTI014 ('+cols+") VALUES(N'"+BTINom+"', N'"+BTISrvNom+"', N'"+BTISrvVer+"', N'"+BTIMtdNom+"', N'"+(m.dsc||'')+"', N'"+(m.nsbt||' ')+"', N'"+(m.pgmnom||'')+"', N'"+(m.pgmmtd||'execute')+"', N'"+status+"', N'"+(m.fpath||'')+"', "+enbtraV+", N'"+(m.espggx||'S')+"');"];}
    const cols=V4_BTI014_COLS.join(', '),dscV=(m.dsc||'').trim()?"'"+(m.dsc)+"'":"' '";
    return['INSERT INTO BTI014 ('+cols+") VALUES('"+BTINom+"', '"+BTISrvNom+"', '"+BTISrvVer+"', '"+BTIMtdNom+"', "+dscV+", '"+(m.nsbt||' ')+"', '"+(m.pgmnom||'')+"', '"+(m.pgmmtd||'execute')+"', '"+status+"', ' ', "+enbtraV+", '"+(m.espggx||'S')+"');"];
  }
```

por:

```js
function delBti019() { return["DELETE FROM BTI019 WHERE "+(ver==='V3'?'BTINom':'BTINOM')+"="+q(BTINom)+" AND "+(ver==='V3'?'BTISrvNom':'BTISRVNOM')+"="+q(BTISrvNom)+" AND "+(ver==='V3'?'BTIMtdNom':'BTIMTDNOM')+"="+q(BTIMtdNom)+";"]; }
  function delBti014() { return["DELETE FROM BTI014 WHERE "+(ver==='V3'?'BTINom':'BTINOM')+"="+q(BTINom)+" AND "+(ver==='V3'?'BTISrvNom':'BTISRVNOM')+"="+q(BTISrvNom)+" AND "+(ver==='V3'?'BTIMtdNom':'BTIMTDNOM')+"="+q(BTIMtdNom)+";"]; }
  function delBti004() { return["DELETE FROM BTI004 WHERE BTINom="+q(BTINom)+" AND BTISrvNom="+q(BTISrvNom)+";"]; }
  function insBti004() { const cols=V3_BTI004_COLS.join(', '),dsc=h.BTISrvDsc||'',pgm=(h.BTISrvPgmName||'').trim()||' '; return['INSERT INTO BTI004 ('+cols+') VALUES('+q(BTINom)+', '+q(BTISrvNom)+', '+q(BTISrvVer)+', '+q(dsc)+", N' ', 0, 0, 0, "+q(pgm)+", N'                    ', N' ');"]; }
  function insBti014() {
    const status=(m.status||'Validado').padEnd(20).slice(0,20), enbtra=m.enbtra||'N', enbtraV=enbtra==='NULL'?'NULL':(ver==='V3'?"N'"+enbtra+"'":"'"+enbtra+"'");
    if(ver==='V3'){const cols=V3_BTI014_COLS.join(', ');return['INSERT INTO BTI014 ('+cols+') VALUES('+q(BTINom)+', '+q(BTISrvNom)+', '+q(BTISrvVer)+', '+q(BTIMtdNom)+', '+q(m.dsc||'')+', '+q(m.nsbt||' ')+', '+q(m.pgmnom||'')+', '+q(m.pgmmtd||'execute')+', '+q(status)+', '+q(m.fpath||'')+', '+enbtraV+', '+q(m.espggx||'S')+');'];}
    const cols=V4_BTI014_COLS.join(', ');
    return['INSERT INTO BTI014 ('+cols+') VALUES('+q(BTINom)+', '+q(BTISrvNom)+', '+q(BTISrvVer)+', '+q(BTIMtdNom)+', '+q(m.dsc||'')+', '+q(m.nsbt||' ')+', '+q(m.pgmnom||'')+', '+q(m.pgmmtd||'execute')+', '+q(status)+", ' ', "+enbtraV+', '+q(m.espggx||'S')+');'];
  }
```

Nota: `q(BTINom)` para `ver==='V3'` devuelve `N'BTSERVICES'` (con prefijo `N`) y para `ver==='V4'` devuelve `'BTSERVICES'` (sin prefijo) — es exactamente lo que hacían las líneas originales por separado en cada rama `if(ver==='V3')`, así que el resultado generado no cambia excepto por el escaping nuevo.

- [ ] **Step 8: Correr los tests y verificar que pasan**

Run: `node --test scripts/generar-scripts/index.test.js`
Expected: PASS en todo el archivo (los 3 tests nuevos del Step 5 + los ~20 tests preexistentes, incluyendo los dos de `[object Object]` que ejercitan `insBti004`/`insBti014` con LOBs).

- [ ] **Step 9: Commit**

```bash
git add scripts/generar-scripts/index.js scripts/generar-scripts/index.test.js
git commit -m "fix(generar-scripts): escapar comillas simples en el SQL generado"
```

---

### Task 2: Aceptar "." o "?" como final válido de una descripción

**Files:**
- Modify: `setup.js:878-880` y `:887-889` (función `sg_validateOne`)
- Modify: `public/wizard-doc.js:359-361` y `:368-370` (función `validateItems`)
- Test: `public/wizard-doc.test.js`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: mismo contrato de `sg_validateOne(mtdNom, svcNom, method, params)` (retorna `Array<{service, method, field, param?, msg}>`) y de `validateItems(items, apiMode)` (mismo retorno). Task 3 va a escribir su validación SDT usando la misma regla `.`/`?` desde el principio, así que conviene resolver esta task primero para copiar el patrón exacto.

- [ ] **Step 1: Escribir los tests que fallan en `public/wizard-doc.test.js`**

Agregar:

```js
test('validateItems acepta descripcion de metodo o parametro terminada en signo de pregunta', () => {
  const { validateItems } = loadWizard();
  const it = item({
    method: { dsc: 'Método para saber si el cliente existe?' },
    params: [{ nom: 'id', dsc: '¿Es un cliente activo?', tipo: 'int', largo: '4' }],
  });
  const warns = validateItems([it], 'publica');
  assert.ok(!warns.some(function(w) { return /No termina con punto/.test(w.msg); }), JSON.stringify(warns));
});

test('validateItems sigue advirtiendo cuando la descripcion no termina ni en punto ni en signo de pregunta', () => {
  const { validateItems } = loadWizard();
  const it = item({ method: { dsc: 'Método para saber si el cliente existe' } });
  const warns = validateItems([it], 'publica');
  assert.ok(warns.some(function(w) { return w.field === 'BTIMTDDSC' && w.msg === 'No termina con punto ni signo de pregunta.'; }), JSON.stringify(warns));
});
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `node --test public/wizard-doc.test.js`
Expected: FAIL en el primer test nuevo (hoy `dsc.endsWith('.')` es `false` para una descripción que termina en `?`, así que dispara la advertencia incorrectamente). El segundo test debería pasar ya (verifica el mensaje viejo — va a fallar por el texto del mensaje una vez que lo cambiemos en el Step 3, lo cual es esperado: correrlo de nuevo en el Step 4).

- [ ] **Step 3: Aplicar el fix en `public/wizard-doc.js`**

Reemplazar (línea ~360):

```js
      if (!/^m[eé]todo para /i.test(dsc)) warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'No comienza con "Método para".' });
      if (!dsc.endsWith('.'))                          warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'No termina con punto.' });
      if (_VALIDATE_ENGLISH_RE.test(dsc))              warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'Podría estar en inglés.' });
```

por:

```js
      if (!/^m[eé]todo para /i.test(dsc)) warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'No comienza con "Método para".' });
      if (!dsc.endsWith('.') && !dsc.endsWith('?'))    warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'No termina con punto ni signo de pregunta.' });
      if (_VALIDATE_ENGLISH_RE.test(dsc))              warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'Podría estar en inglés.' });
```

Y reemplazar (línea ~369):

```js
        if (!pdsc.endsWith('.'))                          warns.push({ service: svc, method: mtd, field: 'BTISRVPARDSC', param: pnom, msg: 'No termina con punto.' });
        if (_VALIDATE_ENGLISH_RE.test(pdsc))              warns.push({ service: svc, method: mtd, field: 'BTISRVPARDSC', param: pnom, msg: 'Podría estar en inglés.' });
```

por:

```js
        if (!pdsc.endsWith('.') && !pdsc.endsWith('?'))   warns.push({ service: svc, method: mtd, field: 'BTISRVPARDSC', param: pnom, msg: 'No termina con punto ni signo de pregunta.' });
        if (_VALIDATE_ENGLISH_RE.test(pdsc))              warns.push({ service: svc, method: mtd, field: 'BTISRVPARDSC', param: pnom, msg: 'Podría estar en inglés.' });
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `node --test public/wizard-doc.test.js`
Expected: PASS en los 2 tests nuevos y en todos los preexistentes (revisar en particular `validateItems con apiMode publica sigue advirtiendo lo mismo que antes`, que ahora debe esperar el mensaje `'BTIMTDDSC: No termina con punto ni signo de pregunta.'` en vez de `'BTIMTDDSC: No termina con punto.'` — si falla por el texto del mensaje, actualizar la aserción en ese test existente para que coincida con el mensaje nuevo).

- [ ] **Step 5: Aplicar el mismo fix en `setup.js` (sin test automático — ver nota abajo)**

En `setup.js`, dentro de `sg_validateOne`, reemplazar (línea ~879):

```js
    if (!/^m[eé]todo para /i.test(dsc)) w.push({ service: svcNom, method: mtdNom, field: 'BTIMTDDSC', msg: 'No comienza con "Método para".' });
    if (!dsc.endsWith('.'))             w.push({ service: svcNom, method: mtdNom, field: 'BTIMTDDSC', msg: 'No termina con punto.' });
    if (VALIDATE_ENGLISH_RE.test(dsc)) w.push({ service: svcNom, method: mtdNom, field: 'BTIMTDDSC', msg: 'Podría estar en inglés.' });
```

por:

```js
    if (!/^m[eé]todo para /i.test(dsc)) w.push({ service: svcNom, method: mtdNom, field: 'BTIMTDDSC', msg: 'No comienza con "Método para".' });
    if (!dsc.endsWith('.') && !dsc.endsWith('?')) w.push({ service: svcNom, method: mtdNom, field: 'BTIMTDDSC', msg: 'No termina con punto ni signo de pregunta.' });
    if (VALIDATE_ENGLISH_RE.test(dsc)) w.push({ service: svcNom, method: mtdNom, field: 'BTIMTDDSC', msg: 'Podría estar en inglés.' });
```

Y reemplazar (línea ~888):

```js
        if (!pdsc.endsWith('.'))             w.push({ service: svcNom, method: mtdNom, field: 'BTISRVPARDSC', param: pnom, msg: 'No termina con punto.' });
        if (VALIDATE_ENGLISH_RE.test(pdsc)) w.push({ service: svcNom, method: mtdNom, field: 'BTISRVPARDSC', param: pnom, msg: 'Podría estar en inglés.' });
```

por:

```js
        if (!pdsc.endsWith('.') && !pdsc.endsWith('?')) w.push({ service: svcNom, method: mtdNom, field: 'BTISRVPARDSC', param: pnom, msg: 'No termina con punto ni signo de pregunta.' });
        if (VALIDATE_ENGLISH_RE.test(pdsc)) w.push({ service: svcNom, method: mtdNom, field: 'BTISRVPARDSC', param: pnom, msg: 'Podría estar en inglés.' });
```

**Nota sobre testing de este step:** `setup.js` no exporta `sg_validateOne` y no existe `setup.test.js` — es el servidor completo, sin arnés de tests unitarios hoy. Crear ese arnés (exportar funciones, mockear DB) es un cambio de infraestructura que no forma parte del alcance acordado. La verificación de este step es manual (Step 6).

- [ ] **Step 6: Verificar manualmente contra el server real**

1. Arrancar el server: `node setup.js`
2. Abrir el wizard, ir a **Documentar**, elegir un método real cuya descripción en la base termine en `?` (o, si no hay ninguno a mano, cualquier método y observar el bloque de advertencias antes/después del cambio).
3. Confirmar que una descripción terminada en `?` ya no aparece listada como advertencia `BTIMTDDSC`/`BTISRVPARDSC` de "no termina con punto", y que una descripción que no termina en `.` ni en `?` sigue apareciendo con el mensaje nuevo `"No termina con punto ni signo de pregunta."`.

- [ ] **Step 7: Commit**

```bash
git add setup.js public/wizard-doc.js public/wizard-doc.test.js
git commit -m "fix(validacion): aceptar signo de pregunta como final valido de descripcion"
```

---

### Task 3: Validar campos SDT en Generar Scripts

**Files:**
- Modify: `public/wizard-doc.js` (agregar `validateSdtFields`, extender `validateItems` — funciones ya cubiertas en el rango `:340-378`)
- Test: `public/wizard-doc.test.js`

**Interfaces:**
- Consumes: `_VALIDATE_ENGLISH_RE` (ya existe en `wizard-doc.js:340`), la regla `.`/`?` establecida en la Task 2, y la forma de `item.sdts` que ya devuelve `/sg/api/methods-full` ([setup.js:1660](../../../setup.js), sin cambios en este plan): `Array<{ nom: string, bti025: object|null, bti026: Array<{elemnom, elemtipo, elemlargo, elemdsc, ...}> }>`.
- Produces: `validateSdtFields(allSdts)` → `Array<{method, field: 'BTISDTELEMDSC'|'BTISDTELEMLARGO', param, msg}>` (nueva función, top-level en `wizard-doc.js`, visible como global en el sandbox de test igual que `validateItems`). `validateItems` sigue con la misma firma `(items, apiMode)`.

- [ ] **Step 1: Escribir los tests que fallan**

Agregar a `public/wizard-doc.test.js` un helper y los casos de SDT:

```js
function sdtItem(elemOverrides) {
  return {
    nom: 'SdtDatosCliente',
    bti026: [Object.assign({ elemnom: 'nombre', elemtipo: 'C', elemlargo: '100', elemdsc: 'Nombre del cliente.' }, elemOverrides || {})],
  };
}

test('validateItems detecta descripcion vacia en un campo SDT', () => {
  const { validateItems } = loadWizard();
  const it = item({ sdts: [sdtItem({ elemdsc: '' })] });
  const warns = validateItems([it], 'publica');
  assert.ok(warns.some(function(w) { return w.field === 'BTISDTELEMDSC' && w.msg === 'Descripción vacía.'; }), JSON.stringify(warns));
});

test('validateItems acepta descripcion de campo SDT terminada en ? o en punto, advierte si no termina en ninguno', () => {
  const { validateItems } = loadWizard();
  const conPregunta = item({ sdts: [sdtItem({ elemdsc: '¿Incluye datos personales?' })] });
  const conPunto = item({ sdts: [sdtItem({ elemdsc: 'Incluye datos personales.' })] });
  const sinNinguno = item({ sdts: [sdtItem({ elemdsc: 'Incluye datos personales' })] });
  assert.equal(validateItems([conPregunta], 'publica').filter(function(w) { return w.field === 'BTISDTELEMDSC'; }).length, 0);
  assert.equal(validateItems([conPunto], 'publica').filter(function(w) { return w.field === 'BTISDTELEMDSC'; }).length, 0);
  assert.ok(validateItems([sinNinguno], 'publica').some(function(w) { return w.field === 'BTISDTELEMDSC' && /No termina con punto/.test(w.msg); }));
});

test('validateItems detecta largo 0 en campo SDT de tipo C/N/F', () => {
  const { validateItems } = loadWizard();
  const it = item({ sdts: [sdtItem({ elemtipo: 'C', elemlargo: '0' })] });
  const warns = validateItems([it], 'publica');
  assert.ok(warns.some(function(w) { return w.field === 'BTISDTELEMLARGO'; }), JSON.stringify(warns));
});

test('validateItems no advierte largo 0 en campo SDT de tipo distinto a C/N/F', () => {
  const { validateItems } = loadWizard();
  const it = item({ sdts: [sdtItem({ elemtipo: 'B', elemlargo: '0' })] });
  const warns = validateItems([it], 'publica');
  assert.equal(warns.filter(function(w) { return w.field === 'BTISDTELEMLARGO'; }).length, 0);
});

test('validateItems no duplica advertencias cuando el mismo SDT aparece en dos items', () => {
  const { validateItems } = loadWizard();
  const sdt = sdtItem({ elemdsc: '' });
  const it1 = item({ sdts: [sdt] });
  const it2 = item({ header: { BTISrvNom: 'Otro', BTIMtdNom: 'otroMetodo' }, sdts: [sdt] });
  const warns = validateItems([it1, it2], 'publica');
  assert.equal(warns.filter(function(w) { return w.field === 'BTISDTELEMDSC' && w.param === 'SdtDatosCliente.nombre'; }).length, 1);
});

test('validateItems con apiMode interna no valida SDT', () => {
  const { validateItems } = loadWizard();
  const it = item({ sdts: [sdtItem({ elemdsc: '' })] });
  assert.equal(validateItems([it], 'interna').length, 0);
});
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `node --test public/wizard-doc.test.js`
Expected: FAIL en los 6 tests nuevos (`validateSdtFields` no existe todavía, `item.sdts` se ignora en `validateItems`).

- [ ] **Step 3: Implementar `validateSdtFields` y conectarla en `validateItems`**

En `public/wizard-doc.js`, agregar debajo de la línea donde está `_VALIDATE_LARGO_TYPES` (línea 341):

```js
var _VALIDATE_SDT_LARGO_TYPES = new Set(['C', 'N', 'F']);

function validateSdtFields(allSdts) {
  var warns = [];
  var seen = new Set();
  (allSdts || []).forEach(function(sdt) {
    if (!sdt || !sdt.nom || seen.has(sdt.nom)) return;
    seen.add(sdt.nom);
    (sdt.bti026 || []).forEach(function(f) {
      var campo = sdt.nom + '.' + f.elemnom;
      var dsc = (f.elemdsc || '').trim();
      if (!dsc) {
        warns.push({ method: sdt.nom, field: 'BTISDTELEMDSC', param: campo, msg: 'Descripción vacía.' });
      } else {
        if (!dsc.endsWith('.') && !dsc.endsWith('?')) warns.push({ method: sdt.nom, field: 'BTISDTELEMDSC', param: campo, msg: 'No termina con punto ni signo de pregunta.' });
        if (_VALIDATE_ENGLISH_RE.test(dsc))           warns.push({ method: sdt.nom, field: 'BTISDTELEMDSC', param: campo, msg: 'Podría estar en inglés.' });
      }
      var tipoRaw = (f.elemtipo || '').toUpperCase();
      if (_VALIDATE_SDT_LARGO_TYPES.has(tipoRaw) && parseInt(f.elemlargo || '0') === 0) {
        warns.push({ method: sdt.nom, field: 'BTISDTELEMLARGO', param: campo, msg: 'Largo es 0 para tipo ' + f.elemtipo + '.' });
      }
    });
  });
  return warns;
}
```

Y modificar `validateItems` (línea 346) para recolectar `item.sdts` de cada item y concatenar `validateSdtFields`:

```js
function validateItems(items, apiMode) {
  if (apiMode === 'interna') return [];
  var warns = [];
  var allSdts = [];
  (items || []).forEach(function(item) {
    var svc = (item.header && item.header.BTISrvNom) || item.service || '?';
    var mtd = (item.header && item.header.BTIMtdNom) || item.method_name || '?';
    var m   = (item.header ? item.method : null) || {};
    if (typeof m === 'string') m = {};
    var params = item.params || [];
    var dsc = (m.dsc || '').trim();
    if (!dsc) {
      warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'Descripción vacía.' });
    } else {
      if (!/^m[eé]todo para /i.test(dsc)) warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'No comienza con "Método para".' });
      if (!dsc.endsWith('.') && !dsc.endsWith('?'))    warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'No termina con punto ni signo de pregunta.' });
      if (_VALIDATE_ENGLISH_RE.test(dsc))              warns.push({ service: svc, method: mtd, field: 'BTIMTDDSC', msg: 'Podría estar en inglés.' });
    }
    params.forEach(function(p) {
      var pnom = p.nom || '?', tipo = (p.tipo || '').toLowerCase().trim();
      var pdsc = p.dsc !== undefined ? (p.dsc || '').trim() : undefined;
      if (pdsc !== undefined) {
        if (!pdsc) warns.push({ service: svc, method: mtd, field: 'BTISRVPARDSC', param: pnom, msg: 'Descripción vacía.' });
        else {
          if (!pdsc.endsWith('.') && !pdsc.endsWith('?'))   warns.push({ service: svc, method: mtd, field: 'BTISRVPARDSC', param: pnom, msg: 'No termina con punto ni signo de pregunta.' });
          if (_VALIDATE_ENGLISH_RE.test(pdsc))              warns.push({ service: svc, method: mtd, field: 'BTISRVPARDSC', param: pnom, msg: 'Podría estar en inglés.' });
        }
      }
      if (_VALIDATE_LARGO_TYPES.has(tipo) && parseInt(p.largo || '0') === 0) warns.push({ service: svc, method: mtd, field: 'BTISRVPARLARGO', param: pnom, msg: 'Largo es 0 para tipo ' + p.tipo + '.' });
      if (tipo === 'double' && parseInt(p.deci || '0') === 0)                warns.push({ service: svc, method: mtd, field: 'BTISRVPARDECI',  param: pnom, msg: 'Decimales son 0 para tipo double.' });
    });
    (item.sdts || []).forEach(function(sdt) { allSdts.push(sdt); });
  });
  warns = warns.concat(validateSdtFields(allSdts));
  return warns;
}
```

(Esta versión completa reemplaza la función existente — ya incluye el fix `.`/`?` de la Task 2, que a esta altura del plan ya está aplicado; si se ejecuta esta task de forma aislada sin haber hecho la Task 2, el diff va a tocar esas mismas líneas.)

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `node --test public/wizard-doc.test.js`
Expected: PASS en los 6 tests nuevos y en todos los preexistentes del archivo.

- [ ] **Step 5: Verificar manualmente en el wizard real**

1. Arrancar el server: `node setup.js`
2. Ir a **Generar Scripts**, elegir un servicio/método real que use al menos un SDT.
3. Confirmar que si ese SDT tiene algún campo con descripción vacía o `largo=0` en un tipo `C/N/F`, aparece la advertencia `BTISDTELEMDSC`/`BTISDTELEMLARGO` en el bloque de advertencias antes de poder generar el script — antes de este cambio, esas advertencias no aparecían en este flujo.

- [ ] **Step 6: Commit**

```bash
git add public/wizard-doc.js public/wizard-doc.test.js
git commit -m "feat(generar-scripts): validar campos SDT igual que en Documentar"
```

---

## Self-Review

**Spec coverage:**
1. Validación SDT en Generar Scripts → Task 3. ✓
2. Escaping de comillas → Task 1. ✓
3. `.`/`?` como final válido → Task 2 (server + client) y horneado en la implementación nueva de Task 3. ✓
4. Fuera de alcance (duplicados) → no se creó ninguna task. ✓

**Placeholder scan:** sin `TBD`/`TODO`; todos los steps de código tienen el bloque completo a pegar, no descripciones sueltas.

**Type consistency:** `validateSdtFields(allSdts)` devuelve `Array<{method, field, param, msg}>` en Task 3 Step 3, y los tests de Task 3 Step 1 leen exactamente esos nombres de campo (`field`, `param`, `msg`) — consistente con el shape que ya usa `validateItems`/`renderWarnings` (`_FIELD_TABLE` en `wizard-doc.js` ya mapea `BTISDTELEMLARGO`/`BTISDTELEMDSC` a `BTI026`, sin cambios necesarios ahí).
