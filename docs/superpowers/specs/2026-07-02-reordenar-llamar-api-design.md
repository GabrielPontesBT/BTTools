# Reordenar "Llamar a la API" antes de la pantalla de ambiente

## Contexto

En el flujo "Documentar" del wizard, la pantalla "Configuración del ambiente Bantotal" (panel `p4`, hoy paso 4) pide URLs y credenciales de la API antes de saber si el usuario va a ejecutar un caso real. Más adelante, en la pantalla de éxito (panel `p6`, paso 6), aparece el toggle "Llamar a la API" que decide si se ejecuta contra la API real.

Investigando `scripts/generar-doc/v3.js:22-26` y `v4.js:29-34` se confirmó que las credenciales de API (`BASE_URL`, `API_USER`, `API_PASSWORD`, `API_AUTH_URL`, etc.) solo se validan como obligatorias cuando se pasa `--ejecutar`. Sin ese flag no se usan para nada en la generación (incluso `BASE_URL` queda como código muerto en el `.md` de V3, `v3.js:494`). Es decir: pedir esos datos cuando el usuario no va a llamar a la API real es innecesario.

El panel `p4` en realidad mezcla dos cosas independientes:

1. **URLs y credenciales de la API** — solo relevantes si se va a llamar a la API real.
2. **"Documentar errores posibles"** (checkbox + ruta a modelos KB) — feature aparte que invoca al Documentador de Errores en Python, no depende de si se llama a la API real.

Además, el toggle "Llamar a la API" arma tarjetas de parámetros por servicio (`toggleEjecutar()`, `wizard-doc.js:913`), lo cual requiere que los servicios ya estén seleccionados (paso 5 actual, panel `p5`). Por eso el toggle no puede ir *antes* de la selección de servicios sin reescribir esa lógica.

Por último, `saveEnv()` (disparado hoy por "Guardar y finalizar" al final de la selección de servicios) hace dos cosas hoy mezcladas: valida que los métodos elegidos estén bien parametrizados (`/sg/api/validate`, warnings en `doc-val-block`) y guarda las credenciales (`/api/save`). Esa validación es independiente de si se llama a la API real — debe seguir ejecutándose siempre, apenas se eligen los servicios.

## Diseño aprobado

**Nuevo orden de pasos (flujo "doc"):**

1. ¿Qué querés hacer? (`p3`)
2. Versión Bantotal (`p1`)
3. Conexión a BD (`p2`)
4. Selección de servicios (`p5`) — sin cambios de contenido, pero ahora es el paso 4
5. Ambiente + "Llamar a la API" (`p4`) — reestructurado, ahora es el paso 5
6. Éxito / Generar documentación (`p6`) — pierde el toggle, que ya se decidió antes

**Paso 4 (`p5`, selección de servicios):**

- El botón "Siguiente" reemplaza a "Guardar y finalizar" en este paso. Queda deshabilitado hasta agregar al menos un servicio/método (misma gating que hoy tiene "Guardar y finalizar").
- Al hacer clic en "Siguiente" corre `validateDocItems()`: llama a `/sg/api/validate` (igual que hoy) y muestra warnings en `doc-val-block` (que ya vive físicamente en este panel). Si hay warnings o error, bloquea el avance — el usuario se queda en este paso. Si está OK, avanza al paso 5.
- Esta validación corre **siempre**, sin importar si después se activa "Llamar a la API" — es una propiedad de los servicios elegidos, no de la ejecución real.

**Paso 5 (`p4`, ambiente):**

- Arriba: el toggle **"Llamar a la API"** (se trae desde `p6`), desmarcado por defecto.
  - Desmarcado: los campos de URL/credenciales (`a-api`, `a-base`, `a-auth`, usuario, contraseña, canal, device, requerimiento) y "Probar autenticación" quedan **ocultos** dentro de un contenedor nuevo `#api-creds-wrap` (`display:none` por defecto).
  - Marcado: se muestra `#api-creds-wrap` (precargado desde `.env` vía `fillApiFields()`, sin cambios ahí) + las tarjetas de parámetros por servicio (`params-section`, reutilizando `toggleEjecutar()` tal cual, que ya depende de `items` — disponible porque el paso 4 ya ocurrió).
- Abajo, **siempre visible**: la sección "Documentar errores posibles" (checkbox + ruta KB) — independiente del toggle.
- El botón "Guardar y finalizar" vive en este paso y ahora solo hace `/api/save` (credenciales + conexión) y `show(6)` — ya no valida los métodos (eso se movió al paso 4).

**Paso 6 (`p6`, éxito):** sin el toggle ni la explicación asociada (ya se decidió antes); mantiene el botón "Generar documentación ahora", que sigue leyendo `#cb-ejecutar` por id (el elemento existe en el DOM aunque esté en otro panel — los paneles no se destruyen, solo se ocultan con la clase `active`).

**Cambios de código (`public/wizard-doc.js`):**

- `panelId()`: mapeo explícito para `S.action === 'doc'` — paso 4 → `p5`, paso 5 → `p4`, paso 6 → `p6`.
- `show()`: intercambiar los bloques `if (step === 4/5 && S.action === 'doc')` — el que hoy prepara el panel de ambiente (`isV4`, `fillApiFields()`) pasa a disparar en paso 5; el que carga servicios pasa a disparar en paso 4.
- `foot()`: paso 4 doc → botón "Siguiente" gateado por `items.length`; paso 5 doc → botón "Guardar y finalizar" (sin `disabled` por defecto).
- `addItem()` / `removeItem()`: la gating del botón pasa de `btn-save` a `btn-next` (mismo mecanismo, nuevo id porque cambia qué botón vive en ese paso).
- Nueva función `validateDocItems()`: contiene la lógica de validación que hoy está al principio de `saveEnv()` (líneas 671-697), disparada desde `goNext()` cuando `s === 4 && S.action === 'doc'`.
- `saveEnv()`: se reduce a la parte de `/api/save` + `show(6)` (líneas 699-728 actuales); se elimina el reset del toggle/params-section post-guardado (líneas 709-718) porque el toggle ya no vive en `p6` y su estado no necesita resetearse al pasar de paso.
- `toggleEjecutar()`: agregar el toggle de `display` de `#api-creds-wrap` junto al de `#params-section` existente.
- `resetParaOtroServicio()`: `show(5)` → `show(4)` (vuelve a selección de servicios, que ahora es el paso 4); agregar reset de `#api-creds-wrap` a `display:none` junto al reset existente de `cb-ejecutar`.

**Cambios de HTML (`public/index.html`):**

- Mover el bloque `#exec-toggle` (líneas 247-253) de `p6` a la parte superior de `p4`.
- Envolver los campos `a-api-wrap`, `a-base-wrap`, `a-auth-wrap`, el `frow` de usuario/contraseña, el `frow` de canal/device/requerimiento, `#ares` y el botón "Probar autenticación" en un nuevo `<div id="api-creds-wrap" style="display:none">`.
- Mover `#params-section` de `p6` a `p4`, debajo de `api-creds-wrap`.
- El bloque "Documentar errores posibles" (líneas 189-205) queda al final de `p4`, fuera de `api-creds-wrap`, sin cambios en su contenido.
- `p6` queda solo con `ok-icon`, título, botón "Generar documentación ahora", `gen-log`, hint y `post-gen-actions`.

## Fuera de alcance

- No se toca la lógica de `/sg/api/validate` ni `/api/save` en el backend (`setup.js`) — solo se reordena desde qué evento del frontend se disparan.
- No se toca el comportamiento de "Documentar errores posibles" ni su feature Python asociada.
- No se cambia la lógica de `toggleEjecutar()` para armar tarjetas de parámetros/workflow — se reutiliza tal cual, solo se relocaliza el HTML donde renderiza.
- No se agrega persistencia del estado del toggle "Llamar a la API" entre sesiones (sigue arrancando desmarcado cada vez, igual que hoy).
- No aplica a los flujos "Generar Scripts", "Validar Documentos" ni "Collections" — usan paneles propios (`p4s`/`p5s`, `p4v`, `p4c`) no afectados por este cambio.

## Verificación

1. Flujo V4 con "Llamar a la API" **desmarcado**: confirmar que nunca se piden URL/credenciales, que "Documentar errores posibles" sigue disponible, y que la documentación se genera igual que hoy sin ejecución real.
2. Flujo V4 con "Llamar a la API" **marcado**: confirmar que aparecen los campos de credenciales (precargados si había `.env` previo), las tarjetas de parámetros por servicio, "Probar autenticación" funciona, y la generación ejecuta contra la API real.
3. Repetir 1 y 2 en V3 (donde además se muestran `a-api-wrap`/`a-auth-wrap`, ocultos en V4).
4. Seleccionar un método con parámetros mal configurados en la BD y confirmar que la advertencia de `validateDocItems()` aparece al hacer clic en "Siguiente" desde selección de servicios — **antes** de llegar a la pantalla de ambiente — y bloquea el avance en ambos casos (con y sin intención de llamar a la API).
5. Probar "← Volver" desde el panel de ambiente hacia selección de servicios y de nuevo hacia adelante, confirmando que el estado de servicios elegidos y el toggle no se corrompen.
6. Probar "← Documentar otro servicio" desde la pantalla de éxito, confirmando que vuelve a selección de servicios (paso 4) con `api-creds-wrap` oculto y el toggle desmarcado.
