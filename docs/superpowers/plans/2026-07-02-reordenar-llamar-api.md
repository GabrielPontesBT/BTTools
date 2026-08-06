# Reordenar "Llamar a la API" antes del ambiente — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En el wizard "Documentar", mover la decisión "Llamar a la API" antes de la pantalla de credenciales de ambiente, de forma que esas credenciales solo se pidan si el usuario efectivamente va a ejecutar contra la API real, sin perder la validación de métodos bien parametrizados (que debe seguir corriendo siempre).

**Architecture:** App vanilla JS/HTML sin framework ni build step (`public/index.html` + `public/wizard-doc.js`, servidos por `setup.js` en `http://localhost:3777`). El wizard usa un objeto de estado global `S` y paneles `<div class="panel" id="pX">` que se muestran/ocultan con la clase `active`. Se reordena el mapeo paso→panel para la acción `doc` (selección de servicios pasa a paso 4, ambiente+API pasa a paso 5), se relocaliza markup HTML del panel de éxito al panel de ambiente, y se separa la validación de métodos (que debía quedar independiente del llamado a la API) en su propia función.

**Tech Stack:** JavaScript vanilla (ES5-ish, `var`, sin módulos), HTML plano, sin bundler ni test runner instalado en el repo.

## Global Constraints

- No se introduce ningún framework de testing (Jest/Mocha/jsdom) — el repo no tiene ninguno hoy y la spec no lo pide. La verificación determinística de cada tarea es `node --check public/wizard-doc.js` (sintaxis) + `grep` puntual sobre el archivo editado. La verificación de comportamiento es manual en el navegador (Task 7).
- Todo el código nuevo sigue el estilo existente del archivo: funciones declaradas con `function`, `var` (no `let`/`const` salvo que el bloque que se edita ya use algo distinto), strings con comillas simples, sin punto y coma faltante.
- No se modifica `setup.js` ni ningún script bajo `scripts/generar-doc/` — los endpoints `/api/save`, `/sg/api/validate`, `/api/generate` quedan intactos, solo cambia desde qué evento del frontend se llaman.
- No se toca la lógica de `toggleEjecutar()` para armar tarjetas de parámetros/workflow, solo se le agrega el toggle de un `display` adicional.
- No se agrega persistencia del estado del checkbox "Llamar a la API" entre sesiones — sigue arrancando desmarcado.
- Los flujos "Generar Scripts" (`p4s`/`p5s`), "Validar Documentos" (`p4v`) y "Collections" (`p4c`) no se tocan.
- Cada tarea termina con `git commit` propio (commits frecuentes).

---

### Task 1: Reorganizar el HTML de los paneles `p4`/`p6` (flujo Documentar)

**Files:**
- Modify: `public/index.html:137-262`

**Interfaces:**
- Produces: contenedor `#api-creds-wrap` (nuevo, envuelve los campos de credenciales de API, oculto por defecto) que las tareas siguientes usan para mostrar/ocultar credenciales según el toggle `#cb-ejecutar`.
- Produces: `#exec-toggle` y `#params-section` ahora viven dentro del panel `id="p4"` en vez de `id="p6"` — sin cambios de id, solo de ubicación.

- [ ] **Step 1: Verificar el estado actual (test que debe fallar)**

Correr:
```bash
grep -n 'id="api-creds-wrap"' public/index.html
grep -c 'id="exec-toggle"' public/index.html
grep -n 'panel" id="p6"' -A5 public/index.html | grep -c 'exec-toggle'
```
Esperado: la primera línea no imprime nada (el contenedor todavía no existe), la segunda imprime `1` (el toggle todavía está una sola vez, en `p6`), la tercera imprime `1` (todavía está dentro de `p6`).

- [ ] **Step 2: Reemplazar el panel `p4` completo**

Reemplazar el bloque exacto (líneas 137-206 de `public/index.html`):

```html
    <!-- Paso 4: API (flujo doc) -->
    <div class="panel" id="p4">
      <div class="ptitle">Configuración del ambiente Bantotal</div>
      <div class="psub">URLs y credenciales para llamar a la API real al generar la documentación.</div>

      <div class="field" id="a-api-wrap">
        <label>URL de la API</label>
        <input type="text" id="a-api" placeholder="ej: http://10.0.0.7:5110/btv4core" oninput="onApiUrlInput()">
        <div class="hint" id="a-api-hint"></div>
      </div>
      <div class="field" id="a-base-wrap">
        <label id="a-base-label">URL de la API publica</label>
        <input type="text" id="a-base" placeholder="ej: http://10.0.0.7:5101/api/publicapi" oninput="_setApiHints(v('a-api'), v('a-base'))">
        <div class="hint" id="a-base-hint"></div>
      </div>
      <div id="a-auth-wrap">
        <div class="field">
          <label>URL de autenticacion</label>
          <input type="text" id="a-auth" placeholder="">
          <div class="hint">Endpoint de login. Se completa automáticamente al ingresar la URL de la API.</div>
        </div>
      </div>
      <div class="frow">
        <div class="field">
          <label>Usuario API</label>
          <input type="text" id="a-user" placeholder="ej: INSTALADOR">
        </div>
        <div class="field">
          <label>Contraseña API</label>
          <div class="pw">
            <input type="password" id="a-pass" placeholder="Contraseña">
            <button class="pw-btn" onclick="togglePw('a-pass',this)">&#128065;</button>
          </div>
        </div>
      </div>
      <div class="frow" style="grid-template-columns:1fr 1fr 160px">
        <div class="field">
          <label>Canal</label>
          <input type="text" id="a-canal" placeholder="ej: BTDIGITAL">
        </div>
        <div class="field">
          <label>Device</label>
          <input type="text" id="a-device" placeholder="ej: INSTALADOR">
        </div>
        <div class="field">
          <label>Requerimiento</label>
          <input type="text" id="a-requerimiento" placeholder="ej: 1">
        </div>
      </div>
      <div id="ares" class="cres" style="margin-bottom:0"></div>
      <button class="btn btn-outline" id="btn-test-api" onclick="testAuth()" style="margin-top:var(--sp-1);width:100%">Probar autenticación</button>

      <div style="border-top:1px solid var(--border);margin-top:var(--sp-5);padding-top:14px">
        <label style="display:flex;align-items:center;gap:var(--sp-2);cursor:pointer;font-weight:600;font-size:var(--fs-sm)">
          <input type="checkbox" id="cb-doc-errores" onchange="toggleDocErrores()" style="width:15px;height:15px;cursor:pointer">
          Documentar errores posibles
        </label>
        <p style="margin-top:var(--sp-1);margin-left:var(--sp-5);font-size:var(--fs-sm);color:var(--muted)">
          Llama al Documentador de Errores para incluir la tabla de errores en cada .md generado.
          Requiere Python y los archivos KB del modelo GeneXus.
        </p>
        <div id="doc-errores-fields" style="display:none;margin-top:var(--sp-3)">
          <div class="field">
            <label>Ruta a los modelos KB</label>
            <input type="text" id="doc-errores-modelos" placeholder="ej: C:\\1 - MODELOS\\V4">
            <div class="hint">Carpeta raíz con los modelos GeneXus (contiene subcarpetas con kb.data)</div>
          </div>
        </div>
      </div>
    </div>
```

por:

```html
    <!-- Paso 5: Ambiente + Llamar a la API (flujo doc) -->
    <div class="panel" id="p4">
      <div class="ptitle">Configuración del ambiente Bantotal</div>
      <div class="psub">Decidí si vas a llamar a la API real y, si es así, completá las credenciales.</div>

      <div class="exec-toggle" id="exec-toggle">
        <label class="exec-lbl">
          <input type="checkbox" id="cb-ejecutar" onchange="toggleEjecutar()" style="width:16px;height:16px;cursor:pointer">
          Llamar a la API
        </label>
        <p class="exec-sub">Ejecuta cada método contra la API de Bantotal y adjunta la respuesta real en el documento.</p>
      </div>

      <div id="api-creds-wrap" style="display:none">
        <div class="field" id="a-api-wrap">
          <label>URL de la API</label>
          <input type="text" id="a-api" placeholder="ej: http://10.0.0.7:5110/btv4core" oninput="onApiUrlInput()">
          <div class="hint" id="a-api-hint"></div>
        </div>
        <div class="field" id="a-base-wrap">
          <label id="a-base-label">URL de la API publica</label>
          <input type="text" id="a-base" placeholder="ej: http://10.0.0.7:5101/api/publicapi" oninput="_setApiHints(v('a-api'), v('a-base'))">
          <div class="hint" id="a-base-hint"></div>
        </div>
        <div id="a-auth-wrap">
          <div class="field">
            <label>URL de autenticacion</label>
            <input type="text" id="a-auth" placeholder="">
            <div class="hint">Endpoint de login. Se completa automáticamente al ingresar la URL de la API.</div>
          </div>
        </div>
        <div class="frow">
          <div class="field">
            <label>Usuario API</label>
            <input type="text" id="a-user" placeholder="ej: INSTALADOR">
          </div>
          <div class="field">
            <label>Contraseña API</label>
            <div class="pw">
              <input type="password" id="a-pass" placeholder="Contraseña">
              <button class="pw-btn" onclick="togglePw('a-pass',this)">&#128065;</button>
            </div>
          </div>
        </div>
        <div class="frow" style="grid-template-columns:1fr 1fr 160px">
          <div class="field">
            <label>Canal</label>
            <input type="text" id="a-canal" placeholder="ej: BTDIGITAL">
          </div>
          <div class="field">
            <label>Device</label>
            <input type="text" id="a-device" placeholder="ej: INSTALADOR">
          </div>
          <div class="field">
            <label>Requerimiento</label>
            <input type="text" id="a-requerimiento" placeholder="ej: 1">
          </div>
        </div>
        <div id="ares" class="cres" style="margin-bottom:0"></div>
        <button class="btn btn-outline" id="btn-test-api" onclick="testAuth()" style="margin-top:var(--sp-1);width:100%">Probar autenticación</button>
      </div>

      <div id="params-section" style="display:none;margin-bottom:var(--sp-4)"></div>

      <div style="border-top:1px solid var(--border);margin-top:var(--sp-5);padding-top:14px">
        <label style="display:flex;align-items:center;gap:var(--sp-2);cursor:pointer;font-weight:600;font-size:var(--fs-sm)">
          <input type="checkbox" id="cb-doc-errores" onchange="toggleDocErrores()" style="width:15px;height:15px;cursor:pointer">
          Documentar errores posibles
        </label>
        <p style="margin-top:var(--sp-1);margin-left:var(--sp-5);font-size:var(--fs-sm);color:var(--muted)">
          Llama al Documentador de Errores para incluir la tabla de errores en cada .md generado.
          Requiere Python y los archivos KB del modelo GeneXus.
        </p>
        <div id="doc-errores-fields" style="display:none;margin-top:var(--sp-3)">
          <div class="field">
            <label>Ruta a los modelos KB</label>
            <input type="text" id="doc-errores-modelos" placeholder="ej: C:\\1 - MODELOS\\V4">
            <div class="hint">Carpeta raíz con los modelos GeneXus (contiene subcarpetas con kb.data)</div>
          </div>
        </div>
      </div>
    </div>
```

- [ ] **Step 3: Actualizar el comentario del panel `p5` (selección de servicios)**

Reemplazar:
```html
    <!-- Paso 5: Seleccion de servicios -->
    <div class="panel" id="p5">
```
por:
```html
    <!-- Paso 4: Seleccion de servicios (flujo doc) -->
    <div class="panel" id="p5">
```

- [ ] **Step 4: Quitar `exec-toggle` y `params-section` del panel `p6`**

Reemplazar el bloque exacto:
```html
    <!-- Paso 6: Éxito (flujo doc) -->
    <div class="panel" id="p6">
      <div class="ok-panel">
        <div class="ok-icon">&#10003;</div>
        <h2>Configuración guardada!</h2>
        <div class="exec-toggle" id="exec-toggle" style="display:none">
          <label class="exec-lbl">
            <input type="checkbox" id="cb-ejecutar" onchange="toggleEjecutar()" style="width:16px;height:16px;cursor:pointer">
            Llamar a la API
          </label>
          <p class="exec-sub">Ejecuta cada método contra la API de Bantotal y adjunta la respuesta real en el documento.</p>
        </div>
        <div id="params-section" style="display:none;margin-bottom:var(--sp-4)"></div>
        <button class="btn btn-primary" id="btn-generate" onclick="generateDocs()" style="margin-bottom:var(--sp-4)">Generar documentación ahora</button>
```
por:
```html
    <!-- Paso 6: Éxito (flujo doc) -->
    <div class="panel" id="p6">
      <div class="ok-panel">
        <div class="ok-icon">&#10003;</div>
        <h2>Configuración guardada!</h2>
        <button class="btn btn-primary" id="btn-generate" onclick="generateDocs()" style="margin-bottom:var(--sp-4)">Generar documentación ahora</button>
```

- [ ] **Step 5: Verificar (test que debe pasar)**

```bash
grep -c 'id="api-creds-wrap"' public/index.html
grep -c 'id="exec-toggle"' public/index.html
grep -n 'panel" id="p4"' -A5 public/index.html | grep -c 'exec-toggle'
grep -n 'panel" id="p6"' -A6 public/index.html | grep -c 'exec-toggle\|params-section'
```
Esperado: `1`, `1`, `1`, `0` (el toggle y `params-section` ya no están en `p6`).

- [ ] **Step 6: Commit**

```bash
git add public/index.html
git commit -m "Move Llamar a la API toggle and creds into panel p4"
```

---

### Task 2: Intercambiar el mapeo de pasos para el flujo `doc` en `panelId()` y `show()`

**Files:**
- Modify: `public/wizard-doc.js:177-215`

**Interfaces:**
- Consumes: `#api-creds-wrap` de Task 1.
- Produces: para `S.action === 'doc'`, paso 4 → panel `p5` (servicios), paso 5 → panel `p4` (ambiente), paso 6 → panel `p6` (éxito). Las tareas siguientes asumen este mapeo.

- [ ] **Step 1: Verificar el estado actual (test que debe fallar)**

```bash
grep -c "if (step === 4) return 'p5';" public/wizard-doc.js
```
Esperado: `0` (todavía no existe).

- [ ] **Step 2: Reemplazar `panelId()`**

Reemplazar:
```js
function panelId(step) {
  if (step === 1) return 'p3'; // acción
  if (step === 2) return 'p1'; // versión
  if (step === 3) return 'p2'; // conexión
  if (S.action === 'validate') return 'p4v';
  if (S.action === 'collections') return 'p4c';
  if (S.action === 'scripts') return step === 4 ? 'p4s' : 'p5s';
  return 'p' + step; // doc: p4, p5, p6
}
```
por:
```js
function panelId(step) {
  if (step === 1) return 'p3'; // acción
  if (step === 2) return 'p1'; // versión
  if (step === 3) return 'p2'; // conexión
  if (S.action === 'validate') return 'p4v';
  if (S.action === 'collections') return 'p4c';
  if (S.action === 'scripts') return step === 4 ? 'p4s' : 'p5s';
  if (S.action === 'doc') {
    if (step === 4) return 'p5'; // selección de servicios
    if (step === 5) return 'p4'; // ambiente + llamar a la API
    return 'p6'; // éxito
  }
  return 'p' + step;
}
```

- [ ] **Step 3: Intercambiar los bloques de `show()` para el flujo doc**

Reemplazar:
```js
  if (step === 4 && S.action === 'validate') { loadValidateFolders(); }
  if (step === 4 && S.action === 'doc') {
    var isV4 = S.version === 'V4';
    document.getElementById('a-auth-wrap').style.display = isV4 ? 'none' : 'block';
    document.getElementById('a-api-wrap').style.display  = isV4 ? 'none' : 'block';
    var lbl = document.getElementById('a-base-label');
    if (lbl) lbl.innerHTML = isV4
      ? 'URL de la API <span style="color:var(--muted);font-weight:400;font-size:var(--fs-sm)">(ej: http://10.0.0.7:5101/api/publicapi)</span>'
      : 'URL publica <span style="color:var(--muted);font-weight:400;font-size:var(--fs-sm)">(para los ejemplos de la documentacion)</span>';
    fillApiFields();
  }
  if (step === 5 && S.action === 'doc') { if (!allServices.length) loadServices(); else renderList(); }
  if (step === 4 && S.action === 'scripts' && !sgServicesLoaded) sgLoadServices();
```
por:
```js
  if (step === 4 && S.action === 'validate') { loadValidateFolders(); }
  if (step === 4 && S.action === 'doc') { if (!allServices.length) loadServices(); else renderList(); }
  if (step === 5 && S.action === 'doc') {
    var isV4 = S.version === 'V4';
    document.getElementById('a-auth-wrap').style.display = isV4 ? 'none' : 'block';
    document.getElementById('a-api-wrap').style.display  = isV4 ? 'none' : 'block';
    var lbl = document.getElementById('a-base-label');
    if (lbl) lbl.innerHTML = isV4
      ? 'URL de la API <span style="color:var(--muted);font-weight:400;font-size:var(--fs-sm)">(ej: http://10.0.0.7:5101/api/publicapi)</span>'
      : 'URL publica <span style="color:var(--muted);font-weight:400;font-size:var(--fs-sm)">(para los ejemplos de la documentacion)</span>';
    fillApiFields();
  }
  if (step === 4 && S.action === 'scripts' && !sgServicesLoaded) sgLoadServices();
```

- [ ] **Step 4: Verificar sintaxis y contenido (test que debe pasar)**

```bash
node --check public/wizard-doc.js && echo SYNTAX_OK
grep -c "if (step === 4) return 'p5';" public/wizard-doc.js
grep -c "if (step === 5 && S.action === 'doc') {" public/wizard-doc.js
```
Esperado: `SYNTAX_OK`, `1`, `1`.

- [ ] **Step 5: Commit**

```bash
git add public/wizard-doc.js
git commit -m "Swap step-to-panel mapping for doc flow: services before ambiente"
```

---

### Task 3: Actualizar `foot()` y la gating del botón de selección de servicios

**Files:**
- Modify: `public/wizard-doc.js:217-241` (función `foot`)
- Modify: `public/wizard-doc.js:601-620` (funciones `addItem`, `removeItem`)

**Interfaces:**
- Consumes: mapeo de pasos de Task 2 (`panelId`, `show`), array global `items` (ya existente).
- Produces: en el paso 4 (doc) el footer muestra un botón `id="btn-next"` gateado por `items.length`; en el paso 5 (doc) muestra `id="btn-save"` sin gating propio (la gating de datos ya ocurrió en el paso 4). Task 4 consume estos ids sin cambios adicionales.

- [ ] **Step 1: Verificar el estado actual (test que debe fallar)**

```bash
grep -c "step === 4 && S.action === 'doc'" public/wizard-doc.js
```
Esperado: `1` (solo aparece una vez, dentro de `show()` de la Task 2 — todavía no en `foot()`).

- [ ] **Step 2: Reemplazar `foot()`**

Reemplazar:
```js
function foot(step) {
  var back = document.getElementById('btn-back');
  back.style.display = step > 1 ? 'flex' : 'none';
  var ftr = document.getElementById('ft-r');
  if (step === 1) { // acción
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (S.action ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 2) { // versión
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (S.version ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 3) { // conexión
    ftr.innerHTML = '<button class="btn btn-outline" id="btn-test" onclick="testConn()">Probar conexión</button>&nbsp;&nbsp;' +
      '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (_connOk ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 4 && (S.action === 'validate' || S.action === 'collections')) {
    ftr.innerHTML = '';
  } else if (step === 4 && S.action === 'scripts') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()" disabled>Generar script &#8594;</button>';
  } else if (step === 5 && S.action === 'doc') {
    ftr.innerHTML = '<button class="btn btn-success" id="btn-save" onclick="saveEnv()" disabled>Guardar y finalizar &#10003;</button>';
  } else if (step === 5 && S.action === 'scripts') {
    ftr.innerHTML = '<button class="btn btn-ghost" onclick="sgReset()">&#8635; Nuevo script</button>';
  } else if (step === 6) {
    ftr.innerHTML = '';
  } else {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()">Siguiente &#8594;</button>';
  }
}
```
por:
```js
function foot(step) {
  var back = document.getElementById('btn-back');
  back.style.display = step > 1 ? 'flex' : 'none';
  var ftr = document.getElementById('ft-r');
  if (step === 1) { // acción
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (S.action ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 2) { // versión
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (S.version ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 3) { // conexión
    ftr.innerHTML = '<button class="btn btn-outline" id="btn-test" onclick="testConn()">Probar conexión</button>&nbsp;&nbsp;' +
      '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (_connOk ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 4 && (S.action === 'validate' || S.action === 'collections')) {
    ftr.innerHTML = '';
  } else if (step === 4 && S.action === 'scripts') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()" disabled>Generar script &#8594;</button>';
  } else if (step === 4 && S.action === 'doc') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (items.length ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 5 && S.action === 'doc') {
    ftr.innerHTML = '<button class="btn btn-success" id="btn-save" onclick="saveEnv()">Guardar y finalizar &#10003;</button>';
  } else if (step === 5 && S.action === 'scripts') {
    ftr.innerHTML = '<button class="btn btn-ghost" onclick="sgReset()">&#8635; Nuevo script</button>';
  } else if (step === 6) {
    ftr.innerHTML = '';
  } else {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()">Siguiente &#8594;</button>';
  }
}
```

- [ ] **Step 3: Cambiar la gating de `addItem`/`removeItem` de `btn-save` a `btn-next`**

Reemplazar:
```js
function addItem() {
  var svc = document.getElementById('sel-svc').value;
  var mtd = document.getElementById('sel-mtd').value;
  if (!svc || !mtd) return;
  var dup = items.some(function(it) { return it.service === svc && it.method === mtd; });
  if (dup) return;
  items.push({ service: svc, method: mtd });
  renderList();
  var btn = document.getElementById('btn-save');
  if (btn) btn.disabled = false;
}

function removeItem(idx) {
  items.splice(idx, 1);
  renderList();
  if (items.length === 0) {
    var btn = document.getElementById('btn-save');
    if (btn) btn.disabled = true;
  }
}
```
por:
```js
function addItem() {
  var svc = document.getElementById('sel-svc').value;
  var mtd = document.getElementById('sel-mtd').value;
  if (!svc || !mtd) return;
  var dup = items.some(function(it) { return it.service === svc && it.method === mtd; });
  if (dup) return;
  items.push({ service: svc, method: mtd });
  renderList();
  var btn = document.getElementById('btn-next');
  if (btn) btn.disabled = false;
}

function removeItem(idx) {
  items.splice(idx, 1);
  renderList();
  if (items.length === 0) {
    var btn = document.getElementById('btn-next');
    if (btn) btn.disabled = true;
  }
}
```

- [ ] **Step 4: Verificar (test que debe pasar)**

```bash
node --check public/wizard-doc.js && echo SYNTAX_OK
grep -c "step === 4 && S.action === 'doc'" public/wizard-doc.js
grep -A9 "function addItem" public/wizard-doc.js | grep -c "btn-next"
```
Esperado: `SYNTAX_OK`, `2` (una en `show()`, una nueva en `foot()`), `1`.

- [ ] **Step 5: Commit**

```bash
git add public/wizard-doc.js
git commit -m "Move doc-items gating from Guardar y finalizar to Siguiente"
```

---

### Task 4: Separar la validación de métodos (`validateDocItems`) de `saveEnv`

**Files:**
- Modify: `public/wizard-doc.js:243-259` (función `goNext`)
- Modify: `public/wizard-doc.js:666-729` (función `saveEnv`, se reemplaza por dos funciones)

**Interfaces:**
- Consumes: `items`, `getDbSG()`, `getDb()`, `getApi()`, `renderWarnings()`, `docCacheKey` (ya existentes); botones `#btn-next` (paso 4 doc) y `#btn-save` (paso 5 doc) de Task 3.
- Produces: `validateDocItems()` — valida los métodos elegidos vía `/sg/api/validate` y, si está todo OK, avanza a `show(5)`. Se ejecuta siempre, sin importar el estado del toggle "Llamar a la API". `saveEnv()` — ahora solo hace `POST /api/save` y `show(6)`.

- [ ] **Step 1: Verificar el estado actual (test que debe fallar)**

```bash
grep -c "async function validateDocItems" public/wizard-doc.js
```
Esperado: `0`.

- [ ] **Step 2: Agregar la llamada a `validateDocItems()` en `goNext()`**

Reemplazar:
```js
function goNext() {
  var s = S.step;
  if (s === 1 && !S.action) return;
  if (s === 1 && (S.action === 'validate' || S.action === 'collections')) { show(4); return; } // saltar versión y conexión
  if (s === 1) { show(2); return; }
  if (s === 2 && !S.version) return;
  if (s === 2) { show(3); return; }
  if (s === 3 && !_connOk) return;
  if (s === 3) { show(4); return; }
  if (s === 4 && S.action === 'scripts') {
    var grps = sgServiceGroups.filter(function(g) { return g.selected.size > 0; });
    if (!grps.length) { alert('Seleccioná al menos un método.'); return; }
    sgFetchAndShowOutput(grps);
    return;
  }
  if (s < 6) show(s + 1);
}
```
por:
```js
async function goNext() {
  var s = S.step;
  if (s === 1 && !S.action) return;
  if (s === 1 && (S.action === 'validate' || S.action === 'collections')) { show(4); return; } // saltar versión y conexión
  if (s === 1) { show(2); return; }
  if (s === 2 && !S.version) return;
  if (s === 2) { show(3); return; }
  if (s === 3 && !_connOk) return;
  if (s === 3) { show(4); return; }
  if (s === 4 && S.action === 'scripts') {
    var grps = sgServiceGroups.filter(function(g) { return g.selected.size > 0; });
    if (!grps.length) { alert('Seleccioná al menos un método.'); return; }
    sgFetchAndShowOutput(grps);
    return;
  }
  if (s === 4 && S.action === 'doc') { await validateDocItems(); return; }
  if (s < 6) show(s + 1);
}
```

- [ ] **Step 3: Reemplazar `saveEnv()` por `validateDocItems()` + `saveEnv()` reducido**

Reemplazar el bloque exacto (función `saveEnv` completa):
```js
async function saveEnv() {
  var btn = document.getElementById('btn-save');
  var valEl = document.getElementById('doc-val-block');
  if (valEl) { valEl.innerHTML = ''; valEl.style.display = 'none'; }

  var docItems = items.filter(function(it) { return it.method; }).map(function(it) { return { service: it.service, method: it.method }; });
  if (docItems.length) {
    btn.innerHTML = '<span class="spin"></span>&nbsp;Validando...';
    btn.disabled = true;
    try {
      var rv = await fetch('/sg/api/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, items: docItems }) });
      var dv = await rv.json();
      docCacheKey = dv.cacheKey || null;
      if (dv.ok && dv.warnings && dv.warnings.length) {
        renderWarnings('doc-val-block', dv.warnings);
        btn.innerHTML = 'Guardar y finalizar &#10003;';
        btn.disabled = false;
        return;
      }
      if (!dv.ok) {
        if (valEl) { valEl.innerHTML = '<div style="background:var(--warn-l);border:1px solid var(--warn);border-radius:8px;padding:12px 16px;font-size:var(--fs-sm);color:var(--warn-d)">&#9888; No se pudo validar: ' + (dv.message || 'error desconocido') + '</div>'; valEl.style.display = ''; }
        btn.innerHTML = 'Guardar y finalizar &#10003;';
        btn.disabled = false;
        return;
      }
    } catch(e) {
      if (valEl) { valEl.innerHTML = '<div style="background:var(--warn-l);border:1px solid var(--warn);border-radius:8px;padding:12px 16px;font-size:var(--fs-sm);color:var(--warn-d)">&#9888; Error al validar: ' + e.message + '</div>'; valEl.style.display = ''; }
      btn.innerHTML = 'Guardar y finalizar &#10003;';
      btn.disabled = false;
      return;
    }
  }

  btn.innerHTML = '<span class="spin"></span>&nbsp;Guardando...';
  btn.disabled = true;
  try {
    var r = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: S.version, platform: S.platform, db: getDb(), api: getApi() })
    });
    var d = await r.json();
    if (d.ok) {
      show(6);
      var et = document.getElementById('exec-toggle');
      if (et) { et.style.display = 'block'; }
      var cbEjSave = document.getElementById('cb-ejecutar');
      if (cbEjSave) cbEjSave.checked = false;
      var ps = document.getElementById('params-section');
      if (ps) ps.style.display = 'none';
      paramFields = {};
      workflowData = {};
      wfConfirmed = false;
    } else {
      alert('Error al guardar: ' + d.message);
      btn.innerHTML = 'Guardar y finalizar &#10003;';
      btn.disabled = false;
    }
  } catch (e) {
    alert('Error inesperado: ' + e.message);
    btn.innerHTML = 'Guardar y finalizar &#10003;';
    btn.disabled = false;
  }
}
```
por:
```js
async function validateDocItems() {
  var btn = document.getElementById('btn-next');
  var valEl = document.getElementById('doc-val-block');
  if (valEl) { valEl.innerHTML = ''; valEl.style.display = 'none'; }

  var docItems = items.filter(function(it) { return it.method; }).map(function(it) { return { service: it.service, method: it.method }; });
  if (!docItems.length) { show(5); return; }

  btn.innerHTML = '<span class="spin"></span>&nbsp;Validando...';
  btn.disabled = true;
  try {
    var rv = await fetch('/sg/api/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, items: docItems }) });
    var dv = await rv.json();
    docCacheKey = dv.cacheKey || null;
    if (dv.ok && dv.warnings && dv.warnings.length) {
      renderWarnings('doc-val-block', dv.warnings);
      btn.innerHTML = 'Siguiente &#8594;';
      btn.disabled = false;
      return;
    }
    if (!dv.ok) {
      if (valEl) { valEl.innerHTML = '<div style="background:var(--warn-l);border:1px solid var(--warn);border-radius:8px;padding:12px 16px;font-size:var(--fs-sm);color:var(--warn-d)">&#9888; No se pudo validar: ' + (dv.message || 'error desconocido') + '</div>'; valEl.style.display = ''; }
      btn.innerHTML = 'Siguiente &#8594;';
      btn.disabled = false;
      return;
    }
  } catch(e) {
    if (valEl) { valEl.innerHTML = '<div style="background:var(--warn-l);border:1px solid var(--warn);border-radius:8px;padding:12px 16px;font-size:var(--fs-sm);color:var(--warn-d)">&#9888; Error al validar: ' + e.message + '</div>'; valEl.style.display = ''; }
    btn.innerHTML = 'Siguiente &#8594;';
    btn.disabled = false;
    return;
  }

  btn.innerHTML = 'Siguiente &#8594;';
  btn.disabled = false;
  show(5);
}

async function saveEnv() {
  var btn = document.getElementById('btn-save');
  btn.innerHTML = '<span class="spin"></span>&nbsp;Guardando...';
  btn.disabled = true;
  try {
    var r = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: S.version, platform: S.platform, db: getDb(), api: getApi() })
    });
    var d = await r.json();
    if (d.ok) {
      show(6);
    } else {
      alert('Error al guardar: ' + d.message);
      btn.innerHTML = 'Guardar y finalizar &#10003;';
      btn.disabled = false;
    }
  } catch (e) {
    alert('Error inesperado: ' + e.message);
    btn.innerHTML = 'Guardar y finalizar &#10003;';
    btn.disabled = false;
  }
}
```

- [ ] **Step 4: Verificar (test que debe pasar)**

```bash
node --check public/wizard-doc.js && echo SYNTAX_OK
grep -c "async function validateDocItems" public/wizard-doc.js
grep -c "async function saveEnv" public/wizard-doc.js
grep -c "await validateDocItems()" public/wizard-doc.js
grep -c "var et = document.getElementById('exec-toggle')" public/wizard-doc.js
```
Esperado: `SYNTAX_OK`, `1`, `1`, `1`, `0` (el reset del toggle post-guardado ya no existe, porque el toggle ya no vive en `p6`).

- [ ] **Step 5: Commit**

```bash
git add public/wizard-doc.js
git commit -m "Split saveEnv into validateDocItems (always runs) and saveEnv (creds only)"
```

---

### Task 5: Cablear `#api-creds-wrap` en `toggleEjecutar()` y corregir `resetParaOtroServicio()`

**Files:**
- Modify: `public/wizard-doc.js:913-917` (inicio de `toggleEjecutar`)
- Modify: `public/wizard-doc.js:1113-1131` (función `resetParaOtroServicio`)

**Interfaces:**
- Consumes: `#api-creds-wrap` de Task 1, mapeo de pasos de Task 2 (paso 4 = servicios).
- Produces: al tildar/destildar `#cb-ejecutar`, `#api-creds-wrap` se muestra/oculta junto con `#params-section` (comportamiento ya existente, ahora extendido). "← Documentar otro servicio" vuelve al paso correcto (servicios, ahora paso 4) y deja las credenciales ocultas otra vez.

- [ ] **Step 1: Verificar el estado actual (test que debe fallar)**

```bash
grep -c "var credsWrap = document.getElementById('api-creds-wrap')" public/wizard-doc.js
```
Esperado: `0`.

- [ ] **Step 2: Editar el inicio de `toggleEjecutar()`**

Reemplazar:
```js
async function toggleEjecutar() {
  var enabled = document.getElementById('cb-ejecutar').checked;
  var section = document.getElementById('params-section');
  if (!enabled) { section.style.display = 'none'; paramFields = {}; workflowData = {}; wfConfirmed = false; return; }
  section.style.display = 'block';
```
por:
```js
async function toggleEjecutar() {
  var enabled = document.getElementById('cb-ejecutar').checked;
  var credsWrap = document.getElementById('api-creds-wrap');
  if (credsWrap) credsWrap.style.display = enabled ? 'block' : 'none';
  var section = document.getElementById('params-section');
  if (!enabled) { section.style.display = 'none'; paramFields = {}; workflowData = {}; wfConfirmed = false; return; }
  section.style.display = 'block';
```

- [ ] **Step 3: Editar `resetParaOtroServicio()`**

Reemplazar:
```js
function resetParaOtroServicio() {
  items = [];
  paramFields = {};
  workflowData = {};
  wfConfirmed = false;
  var genLog = document.getElementById('gen-log');
  if (genLog) { genLog.style.display = 'none'; genLog.innerHTML = ''; }
  var postActs = document.getElementById('post-gen-actions');
  if (postActs) postActs.style.display = 'none';
  var cbEj = document.getElementById('cb-ejecutar');
  if (cbEj) cbEj.checked = false;
  var ps = document.getElementById('params-section');
  if (ps) { ps.style.display = 'none'; ps.innerHTML = ''; }
  var hint = document.getElementById('gen-hint');
  if (hint) hint.style.display = 'none';
  var btn = document.getElementById('btn-generate');
  if (btn) { btn.style.display = 'block'; btn.disabled = false; btn.innerHTML = 'Generar documentacion ahora'; }
  show(5);
}
```
por:
```js
function resetParaOtroServicio() {
  items = [];
  paramFields = {};
  workflowData = {};
  wfConfirmed = false;
  var genLog = document.getElementById('gen-log');
  if (genLog) { genLog.style.display = 'none'; genLog.innerHTML = ''; }
  var postActs = document.getElementById('post-gen-actions');
  if (postActs) postActs.style.display = 'none';
  var cbEj = document.getElementById('cb-ejecutar');
  if (cbEj) cbEj.checked = false;
  var credsWrap = document.getElementById('api-creds-wrap');
  if (credsWrap) credsWrap.style.display = 'none';
  var ps = document.getElementById('params-section');
  if (ps) { ps.style.display = 'none'; ps.innerHTML = ''; }
  var hint = document.getElementById('gen-hint');
  if (hint) hint.style.display = 'none';
  var btn = document.getElementById('btn-generate');
  if (btn) { btn.style.display = 'block'; btn.disabled = false; btn.innerHTML = 'Generar documentacion ahora'; }
  show(4);
}
```

- [ ] **Step 4: Verificar (test que debe pasar)**

```bash
node --check public/wizard-doc.js && echo SYNTAX_OK
grep -c "var credsWrap = document.getElementById('api-creds-wrap')" public/wizard-doc.js
grep -A20 "function resetParaOtroServicio" public/wizard-doc.js | grep -c "show(4);"
```
Esperado: `SYNTAX_OK`, `2` (una en `toggleEjecutar`, una en `resetParaOtroServicio`), `1`.

- [ ] **Step 5: Commit**

```bash
git add public/wizard-doc.js
git commit -m "Wire api-creds-wrap visibility to Llamar a la API toggle"
```

---

### Task 6: Verificación manual end-to-end en el navegador

**Files:** ninguno (solo verificación, sin cambios de código)

**Interfaces:**
- Consumes: todo lo producido en Tasks 1-5.

Esta tarea no requiere una base de datos Bantotal real: se usa `preview_eval` para simular la selección de servicios sin depender de una conexión real, ya que el objetivo es validar la lógica de reordenamiento del frontend (fuera de alcance según la spec: los endpoints de backend no cambian).

- [ ] **Step 1: Levantar el servidor**

Si no existe, crear `.claude/launch.json` en la raíz del repo con:
```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "wizard",
      "runtimeExecutable": "node",
      "runtimeArgs": ["setup.js"],
      "port": 3777
    }
  ]
}
```
Usar la herramienta de preview para arrancar el servidor `wizard` y confirmar que no hay errores en `preview_logs`.

- [ ] **Step 2: Navegar al wizard y elegir "Documentar" + versión**

Con `preview_snapshot`, hacer clic en la tarjeta "Documentar" y luego en la tarjeta de una versión (V4, por ser el caso más simple). Confirmar con `preview_snapshot` que se llega al paso de conexión a BD.

- [ ] **Step 3: Saltar la conexión real a BD e inyectar servicios de prueba**

Usar `preview_eval` para simular que la conexión ya fue validada y avanzar directo a selección de servicios sin depender de una BD real:
```js
S.action = 'doc'; S.version = 'V4'; S.platform = 'oracle'; _connOk = true; show(4);
document.getElementById('svc-list') ? 'p5 visible' : 'p5 missing';
```
Confirmar con `preview_inspect` sobre `#p5` que tiene la clase `active`, y sobre `#p4` que NO la tiene.

- [ ] **Step 4: Confirmar gating de "Siguiente" en selección de servicios**

Con `preview_inspect` sobre `#btn-next`, confirmar `disabled: true` (no hay items todavía). Luego con `preview_eval`:
```js
items.push({ service: 'PublicCustomers', method: 'getCustomer' });
renderList();
document.getElementById('btn-next').disabled = false; // addItem ya haría esto en un flujo real
```
Confirmar con `preview_inspect` sobre `#btn-next` que ahora `disabled: false`.

- [ ] **Step 5: Confirmar que la validación de métodos mal parametrizados sigue bloqueando el avance**

No hay BD real disponible en este entorno, así que se simula la respuesta del endpoint `/sg/api/validate` con un `fetch` mockeado en vez de saltear la validación — esto prueba el comportamiento real de `validateDocItems()` (Task 4), no un atajo. Con `preview_eval`:
```js
window.__realFetch = window.fetch;
window.fetch = function(url, opts) {
  if (url === '/sg/api/validate') {
    return Promise.resolve({ json: function() { return Promise.resolve({ ok: true, warnings: [{ service: 'PublicCustomers', method: 'getCustomer', field: 'BTIMTDDSC', msg: 'Descripción vacía.' }], cacheKey: 'fake' }); } });
  }
  return window.__realFetch(url, opts);
};
goNext();
```
Esperar ~500ms (la llamada es async) y confirmar con `preview_inspect`:
- `#p5` sigue con la clase `active` (NO avanzó al panel de ambiente).
- `#doc-val-block` es visible y contiene el texto "Descripción vacía." (vía `preview_snapshot`).
- `#btn-next` vuelve a `disabled: false` con texto "Siguiente →" (no se queda trabado en "Validando...").

- [ ] **Step 6: Confirmar que sin warnings la validación deja avanzar al panel de ambiente**

Con `preview_eval`, cambiar el mock para devolver `ok:true` sin warnings y reintentar:
```js
window.fetch = function(url, opts) {
  if (url === '/sg/api/validate') {
    return Promise.resolve({ json: function() { return Promise.resolve({ ok: true, warnings: [], cacheKey: 'fake' }); } });
  }
  return window.__realFetch(url, opts);
};
goNext();
```
Esperar ~500ms y confirmar con `preview_inspect` que `#p4` tiene la clase `active` y `#p5` no (avanzó al panel de ambiente). Restaurar el fetch real:
```js
window.fetch = window.__realFetch;
```

- [ ] **Step 7: Confirmar estado por defecto del toggle "Llamar a la API"**

Con `preview_inspect` sobre `#cb-ejecutar`, confirmar que no está tildado. Con `preview_inspect` sobre `#api-creds-wrap`, confirmar `display: none`. Con `preview_inspect` sobre el contenedor del bloque "Documentar errores posibles" (el `div` con `border-top` que envuelve `#cb-doc-errores`), confirmar que el bloque en sí es visible (no tiene `display:none`, solo el sub-campo `#doc-errores-fields` queda oculto hasta tildar ese checkbox aparte).

- [ ] **Step 8: Activar el toggle y confirmar que aparecen las credenciales**

Con `preview_click` sobre `#cb-ejecutar`. Con `preview_inspect` sobre `#api-creds-wrap`, confirmar `display: block`. Con `preview_snapshot`, confirmar que los campos "URL de la API publica", "Usuario API", "Contraseña API", "Canal", "Device", "Requerimiento" y el botón "Probar autenticación" son visibles.

- [ ] **Step 9: Desactivar el toggle y confirmar que las credenciales vuelven a ocultarse**

Con `preview_click` sobre `#cb-ejecutar` de nuevo. Con `preview_inspect` sobre `#api-creds-wrap`, confirmar `display: none`.

- [ ] **Step 10: Confirmar que "Documentar otro servicio" vuelve al paso correcto**

Con `preview_eval`:
```js
resetParaOtroServicio();
document.getElementById('p5').classList.contains('active');
```
Esperado: `true`. Con `preview_inspect` sobre `#api-creds-wrap`, confirmar `display: none`, y sobre `#cb-ejecutar`, confirmar que no está tildado.

- [ ] **Step 11: Repetir Steps 2-9 en V3**

Repetir el flujo eligiendo la versión V3 en vez de V4 (`S.version = 'V3'; S.platform = 'sqlserver';`). Confirmar adicionalmente con `preview_inspect` sobre `#a-auth-wrap` y `#a-api-wrap` que son visibles dentro de `#api-creds-wrap` cuando el toggle está activo (en V4 quedan ocultos por la lógica existente de `show()`, sin cambios de esta spec).

- [ ] **Step 12: Capturar evidencia y reportar**

Tomar un `preview_screenshot` del panel de ambiente con el toggle activo (mostrando credenciales + "Documentar errores posibles") y otro con el toggle inactivo (mostrando solo "Documentar errores posibles"). Adjuntar ambos al reporte de la tarea como evidencia de que el reordenamiento funciona.

No requiere commit (no hay cambios de código en esta tarea).
