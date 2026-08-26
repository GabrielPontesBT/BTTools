// ── Estado compartido ────────────────────────────────────────
// activeEnv = ambiente global activo (version/platform/motor/conexion), una
// vez establecido se usa para TODAS las herramientas sin volver a pedirlo.
// sdtEnv = conexion V4/Oracle especifica de Generar SDT, solo cuando el
// ambiente global activo no es V4/Oracle (ver sdtgenEnterOrCapture). No
// reemplaza a activeEnv salvo que el usuario lo confirme explicitamente.
var S = { step: 1, version: null, platform: null, action: null, engine: null, apiMode: 'publica', activeEnv: null, sdtEnv: null };
// Acciones que soportan trabajar contra la API Interna (tablas BTCBS);
// Documentar y Validar siguen siempre contra la API Publica (BTI).
var APIMODE_ACTIONS = new Set(['scripts', 'collections', 'sdtgen', 'paramgen']);
var _connOk = false, _connTimer = null;
var loadedEnv = null;
var ACTIVE_ENV_STORAGE_KEY = 'bt_active_environment';
var sdtEnvCaptureActive = false;
var _p2OrigTitle = null, _p2OrigSub = null;
var _pendingReconnectError = null;
(function keepAlive() {
  var es = new EventSource('/api/alive');
  es.onerror = function() { es.close(); setTimeout(keepAlive, 3000); };
})();
function parseConnectString(cs) { if (!cs) return { host: '', port: '1521', service: '' }; var c = cs.indexOf(':'), s = cs.indexOf('/'); if (c < 0 || s < 0) return { host: cs, port: '1521', service: '' }; return { host: cs.slice(0, c), port: cs.slice(c + 1, s), service: cs.slice(s + 1) }; }

// ── Estado flujo Doc ─────────────────────────────────────────
var items = [];
var allServices = [];
var paramFields = {};
var workflowData = {};
var docCacheKey = null;
var wfConfirmed = false;

// ── Estado flujo Scripts ─────────────────────────────────────
var sgServiceGroups = [];
var sgMultiData = null;
var sgServicesLoaded = false;

// ── Estado flujo Generar SDT ─────────────────────────────────
var sdtgenNames = [];
var sdtgenSelectedName = null;
var sdtgenBaseData = null; // { bti025, bti026 }
var sdtgenFields = []; // copia de trabajo de bti026, reordenada/filtrada
var sdtgenDragIdx = null;
var sdtgenExistingCopies = []; // copias no nativas ya creadas a partir del mismo SDT nativo

// ── Estado flujo Editar Parametria ────────────────────────────
var pgServicesLoaded = false;
var pgAllServices = [];
var pgSelectedService = null;
var pgSelectedMethod = null;
var pgSrvVer = '1';
var pgFields = []; // copia de trabajo de los parametros de BTI019/BTCBS019, en el orden en que se cargaron (no reordenable)
var pgOriginalCount = 0; // cantidad de parametros que tenia el metodo al cargar, para el UPDATE/INSERT/DELETE (ver generateParamsScript)
var pgSdtOptions = []; // catalogo { nom, version }[] para los combos "SDT" / "SDT del Ítem"
var pgTargetMode = 'method'; // 'method' = editar BTI019 (parametros); 'sdt' = editar BTI026 (campos de un SDT existente)
var pgSelectedSdtName = null;
var pgSdtFields = []; // copia de trabajo de los campos del SDT elegido, en el orden en que se cargaron (no reordenable, no se agregan campos nuevos)
var pgSdtOriginalCount = 0; // cantidad de campos que tenia el SDT al cargar, para el UPDATE/DELETE (ver generateFieldsScript)
var pgSdtDragIdx = null; // indice de la tarjeta que se esta arrastrando para reordenar (solo modo SDT: en modo metodo la posicion no se puede cambiar)

async function sdtgenLoadList() {
  var loading = document.getElementById('sdtgen-list-loading'), err = document.getElementById('sdtgen-list-err');
  if (err) err.className = 'cres';
  if (loading) loading.style.display = 'flex';
  // Cada (re)ingreso al paso 4 es un pedido fresco: una seleccion vieja no
  // tiene por que seguir siendo valida si se volvio atras y se cambio de
  // conexion/ambiente antes de volver a este paso.
  sdtgenSelectedName = null;
  var btnNext = document.getElementById('btn-next');
  if (btnNext) btnNext.disabled = true;
  try {
    var r = await fetch('/api/sdtgen/list', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), apiMode: S.apiMode }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    sdtgenNames = d.names || [];
    sdtgenRenderList(sdtgenNames);
  } catch(e) {
    if (err) { err.className = 'cres show err'; err.textContent = e.message; }
  }
  if (loading) loading.style.display = 'none';
}

function sdtgenRenderList(names) {
  var container = document.getElementById('sdtgen-list');
  container.innerHTML = '';
  names.forEach(function(nom) {
    var row = document.createElement('div');
    row.className = 'sdtgen-row' + (nom === sdtgenSelectedName ? ' sel' : '');
    row.textContent = nom;
    row.onclick = function() {
      sdtgenSelectedName = nom;
      container.querySelectorAll('.sdtgen-row').forEach(function(r) { r.classList.remove('sel'); });
      row.classList.add('sel');
      var btn = document.getElementById('btn-next');
      if (btn) btn.disabled = false;
    };
    container.appendChild(row);
  });
}

function sdtgenFilterList() {
  var q = v('sdtgen-search').toLowerCase();
  var filtered = q ? sdtgenNames.filter(function(n) { return n.toLowerCase().indexOf(q) !== -1; }) : sdtgenNames;
  sdtgenRenderList(filtered);
}

var SDTGEN_FIELD_NAME_RE = /^[A-Za-z][A-Za-z0-9_]{0,99}$/;
var SDTGEN_DIGITS_RE = /^\d{1,9}$/;
var SDTGEN_FORBIDDEN_TEXT_RE = /['";\\\r\n]/;

function sdtgenEscapeAttr(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Misma regla que valida el server (buildSdtCopy) - da feedback inmediato
// en el editor, pero la autoridad final sigue siendo el server.
function sdtgenValidateField(f) {
  if (!SDTGEN_FIELD_NAME_RE.test(f.elemnom || '')) return 'Nombre invalido: debe empezar con una letra y usar solo letras, numeros o guion bajo.';
  if (!SDTGEN_DIGITS_RE.test(f.elemlargo != null ? String(f.elemlargo) : '')) return 'Largo invalido: debe ser un numero entero (0 o mayor).';
  if (!SDTGEN_DIGITS_RE.test(f.elemdeci != null ? String(f.elemdeci) : '0')) return 'Decimales invalidos: debe ser un numero entero (0 o mayor).';
  if (SDTGEN_FORBIDDEN_TEXT_RE.test(f.elemdsc || '')) return 'Descripcion invalida: no puede tener comillas, punto y coma, barra invertida ni saltos de linea.';
  if (f.nomit && SDTGEN_FORBIDDEN_TEXT_RE.test(f.nomit)) return 'Nombre de iterador invalido: no puede tener comillas, punto y coma, barra invertida ni saltos de linea.';
  return null;
}

function sdtgenFieldsAllValid() {
  return sdtgenFields.every(function(f) { return !sdtgenValidateField(f); });
}

// Autocompletar por nombre: al escribir/renombrar un campo, busca ese mismo
// nombre en cualquier otro SDT y copia su largo+descripcion (ver
// suggestFieldShape en scripts/generar-sdt, que descarta los campos que
// todavia tienen los valores por defecto de "recien definido": largo=0 o
// descripcion=el propio nombre). Mismo patron de debounce que
// pgScheduleSuggestion en Editar Parametria.
var sdtgenSuggestTimers = new WeakMap(); // field -> timeout id del debounce
var sdtgenSuggestedNames = new WeakMap(); // field -> ultimo nombre ya consultado/aplicado

function sdtgenScheduleSuggestion(field) {
  clearTimeout(sdtgenSuggestTimers.get(field));
  var t = setTimeout(function() { sdtgenLookupSuggestion(field); }, 500);
  sdtgenSuggestTimers.set(field, t);
}

async function sdtgenLookupSuggestion(field) {
  var nombre = (field.elemnom || '').trim();
  if (!SDTGEN_FIELD_NAME_RE.test(nombre)) return;
  if (sdtgenSuggestedNames.get(field) === nombre) return;
  try {
    var r = await fetch('/api/sdtgen/suggest-field', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, apiMode: S.apiMode, nombre: nombre }) });
    var d = await r.json();
    if (!d.ok || !d.suggestion) return;
    // El usuario pudo seguir escribiendo mientras se esperaba la respuesta:
    // si el nombre ya cambio, esta sugerencia quedo vieja y no se aplica.
    if ((field.elemnom || '').trim() !== nombre) return;
    sdtgenSuggestedNames.set(field, nombre);
    field.elemlargo = d.suggestion.shape.largo;
    field.elemdsc = d.suggestion.shape.dsc;
    sdtgenRenderEditor();
    sdtgenFlashSuggestion(field);
  } catch(e) { /* la sugerencia es solo una ayuda, no bloquea el flujo si falla */ }
}

// El grid de sdtgen no tiene una columna libre para un badge (a diferencia
// de las tarjetas de Editar Parametria): se reusa la linea de error, en
// verde, unos segundos, y despues se recalcula el error real (si hay).
function sdtgenFlashSuggestion(field) {
  var idx = sdtgenFields.indexOf(field);
  if (idx < 0) return;
  var item = document.querySelectorAll('#sdtgen-fields .sdtgen-field-item')[idx];
  var err = item && item.querySelector('.sdtgen-field-err');
  if (!err) return;
  err.textContent = '✓ autocompletado';
  err.style.color = 'var(--green)';
  setTimeout(function() {
    err.style.color = '';
    err.textContent = sdtgenValidateField(field) || '';
  }, 2000);
}

async function sdtgenGoToEdit() {
  if (!sdtgenSelectedName) return;
  var btn = document.getElementById('btn-next');
  if (btn) { btn.innerHTML = '<span class="spin"></span>&nbsp;Cargando...'; btn.disabled = true; }
  try {
    var r = await fetch('/api/sdtgen/sdt', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, nom: sdtgenSelectedName, apiMode: S.apiMode }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    sdtgenBaseData = { bti025: d.bti025, bti026: d.bti026 };
    // Copia editable independiente del origen; origElemnom queda fijo para
    // que el server pueda ubicar el campo real aunque se le cambie el nombre.
    sdtgenFields = (d.bti026 || []).map(function(f) {
      return Object.assign({}, f, { origElemnom: f.elemnom, elemdeci: f.elemdeci || '0', nomit: f.nomit || '' });
    });
    setVal('sdtgen-new-name', '');
    document.getElementById('sdtgen-base-name').textContent = sdtgenSelectedName;
    show(5);
    sdtgenLoadExistingCopies(d.bti025 && d.bti025.nomint);
  } catch(e) {
    alert('Error: ' + e.message);
  }
  if (btn) { btn.innerHTML = 'Siguiente &#8594;'; btn.disabled = false; }
}

async function sdtgenLoadExistingCopies(nomint) {
  var wrap = document.getElementById('sdtgen-existing-wrap');
  sdtgenExistingCopies = [];
  if (wrap) wrap.style.display = 'none';
  if (!nomint) return;
  try {
    var r = await fetch('/api/sdtgen/existing-copies', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, nomint: nomint, apiMode: S.apiMode }) });
    var d = await r.json();
    if (!d.ok || !d.copies || !d.copies.length) return;
    sdtgenExistingCopies = d.copies;
    sdtgenRenderExistingCopies();
    if (wrap) wrap.style.display = '';
  } catch(e) { /* no bloquea el flujo si falla esta busqueda informativa */ }
}

function sdtgenRenderExistingCopies() {
  var container = document.getElementById('sdtgen-existing-list');
  container.innerHTML = '';
  sdtgenExistingCopies.forEach(function(copy) {
    var row = document.createElement('div');
    row.className = 'sdtgen-existing-item';

    var head = document.createElement('div');
    head.className = 'sdtgen-existing-head';
    head.innerHTML = '<span class="sdtgen-existing-caret">&#9656;</span>' +
      '<span class="sdtgen-existing-name">' + sdtgenEscapeAttr(copy.nom) + '</span>' +
      '<span class="sdtgen-existing-estado">' + sdtgenEscapeAttr(copy.estado) + '</span>';
    row.appendChild(head);

    var body = document.createElement('div');
    body.className = 'sdtgen-existing-body';
    body.style.display = 'none';
    row.appendChild(body);

    var loaded = false;
    head.onclick = function() {
      var isOpen = body.style.display !== 'none';
      if (isOpen) { body.style.display = 'none'; head.querySelector('.sdtgen-existing-caret').innerHTML = '&#9656;'; return; }
      body.style.display = '';
      head.querySelector('.sdtgen-existing-caret').innerHTML = '&#9662;';
      if (loaded) return;
      loaded = true;
      body.innerHTML = '<span class="sdtgen-existing-loading">Cargando campos...</span>';
      fetch('/api/sdtgen/sdt', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, nom: copy.nom, apiMode: S.apiMode }) })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (!d.ok) { body.innerHTML = '<span class="sdtgen-existing-loading">' + sdtgenEscapeAttr(d.message) + '</span>'; return; }
          var fields = d.bti026 || [];
          if (!fields.length) { body.innerHTML = '<span class="sdtgen-existing-loading">Sin campos.</span>'; return; }
          body.innerHTML = fields.map(function(f) {
            return '<div class="sdtgen-existing-field"><span>' + sdtgenEscapeAttr(f.elemnom) + '</span><span>' + sdtgenEscapeAttr(f.elemtipo) + '</span><span>' + sdtgenEscapeAttr(f.elemdsc) + '</span></div>';
          }).join('');
        })
        .catch(function(e) { body.innerHTML = '<span class="sdtgen-existing-loading">Error: ' + sdtgenEscapeAttr(e.message) + '</span>'; });
    };

    container.appendChild(row);
  });
}

function sdtgenFieldGridCols(showV4Extras) {
  return '24px 160px 70px 60px' + (showV4Extras ? ' 60px' : '') + ' minmax(160px,1fr)' + (showV4Extras ? ' 110px' : '') + ' 28px';
}

function sdtgenRenderEditor() {
  var container = document.getElementById('sdtgen-fields');
  container.innerHTML = '';
  var showV4Extras = S.version === 'V4';
  var gridCols = sdtgenFieldGridCols(showV4Extras);

  var header = document.createElement('div');
  header.className = 'sdtgen-fields-header';
  header.style.gridTemplateColumns = gridCols;
  header.innerHTML = '<span></span><span>Nombre</span><span>Tipo</span><span>Largo</span>' +
    (showV4Extras ? '<span>Decimales</span>' : '') +
    '<span>Descripción</span>' +
    (showV4Extras ? '<span>Iterador</span>' : '') +
    '<span></span>';
  container.appendChild(header);

  sdtgenFields.forEach(function(field, idx) {
    var item = document.createElement('div');
    item.className = 'sdtgen-field-item';
    item.style.gridTemplateColumns = gridCols;
    item.draggable = true;
    item.innerHTML = '<span class="sdtgen-drag-handle">&#9776;</span>' +
      '<input type="text" class="sdtgen-field-input sdtgen-field-input-nom" value="' + sdtgenEscapeAttr(field.elemnom) + '">' +
      '<span class="sdtgen-field-type">' + sdtgenEscapeAttr(field.elemtipo) + '</span>' +
      '<input type="text" class="sdtgen-field-input sdtgen-field-input-largo" value="' + sdtgenEscapeAttr(field.elemlargo) + '">' +
      (showV4Extras ? '<input type="text" class="sdtgen-field-input sdtgen-field-input-deci" value="' + sdtgenEscapeAttr(field.elemdeci) + '">' : '') +
      '<input type="text" class="sdtgen-field-input sdtgen-field-input-dsc" value="' + sdtgenEscapeAttr(field.elemdsc) + '">' +
      (showV4Extras ? '<input type="text" class="sdtgen-field-input sdtgen-field-input-nomit" value="' + sdtgenEscapeAttr(field.nomit) + '">' : '') +
      '<button type="button" class="sdtgen-field-rm" title="Quitar">&times;</button>' +
      '<div class="sdtgen-field-err"></div>';

    var err = item.querySelector('.sdtgen-field-err');
    function updateErr() {
      var msg = sdtgenValidateField(field);
      err.textContent = msg || '';
      item.classList.toggle('invalid', !!msg);
    }

    item.querySelector('.sdtgen-field-input-nom').addEventListener('input', function() { field.elemnom = this.value; updateErr(); sdtgenScheduleSuggestion(field); });
    item.querySelector('.sdtgen-field-input-largo').addEventListener('input', function() { field.elemlargo = this.value; updateErr(); });
    item.querySelector('.sdtgen-field-input-dsc').addEventListener('input', function() { field.elemdsc = this.value; updateErr(); });
    if (showV4Extras) {
      item.querySelector('.sdtgen-field-input-deci').addEventListener('input', function() { field.elemdeci = this.value; updateErr(); });
      item.querySelector('.sdtgen-field-input-nomit').addEventListener('input', function() { field.nomit = this.value; updateErr(); });
    }
    updateErr();

    item.querySelector('.sdtgen-field-rm').onclick = function() {
      sdtgenFields.splice(idx, 1);
      sdtgenRenderEditor();
    };
    item.addEventListener('dragstart', function(e) {
      if (e.target && e.target.tagName === 'INPUT') { e.preventDefault(); return; }
      sdtgenDragIdx = idx; item.classList.add('dragging');
    });
    item.addEventListener('dragend', function() { item.classList.remove('dragging'); });
    item.addEventListener('dragover', function(e) { e.preventDefault(); });
    item.addEventListener('drop', function(e) {
      e.preventDefault();
      if (sdtgenDragIdx === null || sdtgenDragIdx === idx) return;
      var moved = sdtgenFields.splice(sdtgenDragIdx, 1)[0];
      sdtgenFields.splice(idx, 0, moved);
      sdtgenDragIdx = null;
      sdtgenRenderEditor();
    });
    container.appendChild(item);
  });
}

function sdtgenGoToResult() {
  var nombre = v('sdtgen-new-name');
  var err = document.getElementById('sdtgen-name-err');
  if (!nombre) { err.className = 'cres show err'; err.textContent = 'Ingresá un nombre para la copia.'; return; }
  if (nombre === sdtgenSelectedName) { err.className = 'cres show err'; err.textContent = 'El nombre debe ser distinto al del SDT base.'; return; }
  if (sdtgenNames.indexOf(nombre) !== -1) { err.className = 'cres show err'; err.textContent = 'Ya existe un SDT con ese nombre. Elegí otro.'; return; }
  if (sdtgenFields.length === 0) { err.className = 'cres show err'; err.textContent = 'La copia necesita al menos un campo.'; return; }
  if (!sdtgenFieldsAllValid()) { err.className = 'cres show err'; err.textContent = 'Hay campos con datos invalidos, revisalos antes de continuar.'; return; }
  err.className = 'cres';
  show(6);
}

function sdtgenBuildEditedFields() {
  return sdtgenFields.map(function(f) {
    return { origElemnom: f.origElemnom, elemnom: f.elemnom, elemlargo: f.elemlargo, elemdsc: f.elemdsc, elemdeci: f.elemdeci, nomit: f.nomit };
  });
}

async function sdtgenDoGenerate() {
  var ta = document.getElementById('sdtgen-sql-out');
  ta.value = 'Generando...';
  try {
    var r = await fetch('/api/sdtgen/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      version: S.version,
      apiMode: S.apiMode,
      nuevoNombre: v('sdtgen-new-name'),
      sourceBti025: sdtgenBaseData.bti025,
      sourceBti026: sdtgenBaseData.bti026,
      editedFields: sdtgenBuildEditedFields()
    }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    ta.value = d.script || '';
  } catch(e) { ta.value = 'Error: ' + e.message; }
}

function sdtgenCopyScript() {
  var ta = document.getElementById('sdtgen-sql-out'); if (!ta.value.trim()) return;
  navigator.clipboard.writeText(ta.value).then(function() {
    var res = document.getElementById('sdtgen-exec-res');
    res.className = 'cres show ok'; res.textContent = 'Copiado al portapapeles ✓';
    setTimeout(function() { res.className = 'cres'; }, 2000);
  }).catch(function() { ta.select(); document.execCommand('copy'); });
}

async function sdtgenExecute() {
  if (!confirm('Esto va a ejecutar DELETE + INSERT contra la base conectada. ¿Confirmás?')) return;
  var res = document.getElementById('sdtgen-exec-res');
  res.className = 'cres show'; res.textContent = 'Ejecutando...';
  try {
    var r = await fetch('/api/sdtgen/execute', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      platform: S.platform, db: getDbSG(), version: S.version, apiMode: S.apiMode,
      nom: sdtgenSelectedName,
      nuevoNombre: v('sdtgen-new-name'),
      editedFields: sdtgenBuildEditedFields()
    }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    res.className = 'cres show ok'; res.textContent = 'Ejecutado correctamente (' + d.statementsRun + ' sentencias) ✓';
  } catch(e) {
    res.className = 'cres show err'; res.textContent = 'Error: ' + e.message;
  }
}

function sdtgenReset() {
  sdtgenSelectedName = null; sdtgenBaseData = null; sdtgenFields = [];
  sdtgenDragIdx = null; sdtgenExistingCopies = [];
  var existingWrap = document.getElementById('sdtgen-existing-wrap'); if (existingWrap) existingWrap.style.display = 'none';
  setVal('sdtgen-search', ''); setVal('sdtgen-new-name', '');
  document.getElementById('sdtgen-sql-out').value = '';
  var res = document.getElementById('sdtgen-exec-res'); if (res) res.className = 'cres';
  show(4); // show() ya recarga la lista siempre al entrar al paso 4
}

// ── Editar Parametria (BTI019/BTCBS019) ───────────────────────
// Valores reales de BTISRVPARDIR (Bantotal), no I/O/R genericos.
var PG_DIR_OPTIONS = [
  { v: 'H', l: 'Hidden' },
  { v: 'S', l: 'ErroresNegocio' },
  { v: 'R', l: 'BusinessErrors' },
  { v: 'I', l: 'In' },
  { v: 'B', l: 'InOut' },
  { v: 'O', l: 'Out' },
];
var PG_CAT_OPTIONS = [
  { v: 'B', l: 'Básico' },
  { v: 'C', l: 'Colección' },
  { v: 'S', l: 'SDT' },
];
// Categoria del item DENTRO de una Coleccion: solo Basico o SDT (no hay
// coleccion de colecciones).
var PG_CATIT_OPTIONS = [
  { v: 'B', l: 'Básico' },
  { v: 'S', l: 'SDT' },
];
var PG_NAME_RE = /^[A-Za-z][A-Za-z0-9_]{0,99}$/;
var PG_DIGITS_RE = /^\d{1,9}$/;
var PG_FORBIDDEN_TEXT_RE = /['";\\\r\n]/;

// Tipos basicos soportados: combo fijo, no texto libre (a diferencia del SDT
// de arriba, que sale de un catalogo abierto). boolean/double/datetime/date
// no tienen largo; solo double tiene decimales; ver pgLargoVisible/
// pgDecimalesVisible/pgValorVisible para donde se usa cada regla.
var PG_TIPO_OPTIONS = ['boolean', 'double', 'datetime', 'date', 'byte', 'int', 'long', 'short', 'string'];
var PG_TIPO_SIN_LARGO = new Set(['boolean', 'double', 'datetime', 'date']);

function pgLargoVisible(tipo) { return !PG_TIPO_SIN_LARGO.has(tipo); }
function pgDecimalesVisible(tipo) { return tipo === 'double'; }
// El valor por defecto solo se usa en un parametro Hidden (siempre se manda
// igual); para los tipos basicos sin largo (boolean/double/datetime/date)
// tampoco aplica, igual que el resto de esos campos.
function pgValorVisible(field) {
  if (field.dir !== 'H') return false;
  if (field.cat === 'B') return pgLargoVisible(field.tipo);
  return true;
}

// Direccion "BusinessErrors (R)" siempre es el mismo parametro: una
// coleccion fija de SdtsBTBusinessError que Bantotal usa para devolver
// errores de negocio. En vez de que cada quien la tipee a mano cada vez,
// elegir esta direccion autocompleta el resto de la fila con estos valores.
var PG_BUSINESS_ERRORS_SHAPE = {
  nom: 'businessErrors',
  tipo: 'Collection',
  ittipo: 'SdtsBTBusinessError',
  valor: '',
  sdtver: '1',
  cat: 'C',
  catit: 'S',
  largo: '0',
  lval: '',
  itnom: 'businessError',
  deci: '0',
  dsc: 'Listado de errores de negocio.',
};

function pgEscapeAttr(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Cualquier cambio de accion/version/motor/API invalida la seleccion de
// servicio/metodo y los parametros cargados en memoria (misma logica que
// sgInvalidateState para Generar Scripts): sin esto, volver atras y cambiar
// de conexion dejaba el paso 4 mostrando el servicio/metodo de otra corrida.
function pgInvalidateState() {
  pgServicesLoaded = false; pgAllServices = []; pgSelectedService = null; pgSelectedMethod = null; pgFields = []; pgOriginalCount = 0;
  pgSelectedSdtName = null; pgSdtFields = []; pgSdtOriginalCount = 0; pgSdtDragIdx = null;
  var svcSel = document.getElementById('pg-sel-svc'); if (svcSel) svcSel.innerHTML = '<option value="">-- Seleccionar --</option>';
  var mtdSel = document.getElementById('pg-sel-mtd'); if (mtdSel) mtdSel.innerHTML = '<option value="">-- Seleccionar --</option>';
  var sdtSearch = document.getElementById('pg-sdt-search'); if (sdtSearch) sdtSearch.value = '';
  var out = document.getElementById('pg-sql-out'); if (out) out.value = '';
  pgSetTargetMode('method');
}

// Alterna entre editar parametros de un metodo (BTI019) o campos de un SDT
// existente (BTI026): son dos tablas y dos editores distintos (ver
// pgRenderEditor/pgRenderSdtEditor), pero comparten el resto del flujo
// (conexion, resultado, ejecutar).
function pgSetTargetMode(mode) {
  pgTargetMode = mode;
  document.querySelectorAll('.pg-target-btn').forEach(function(b) { b.classList.toggle('sel', b.getAttribute('data-mode') === mode); });
  var methodPicker = document.getElementById('pg-method-picker'); if (methodPicker) methodPicker.style.display = mode === 'method' ? '' : 'none';
  var sdtPicker = document.getElementById('pg-sdt-picker'); if (sdtPicker) sdtPicker.style.display = mode === 'sdt' ? '' : 'none';
  pgSelectedService = null; pgSelectedMethod = null; pgSelectedSdtName = null;
  var sdtSearch = document.getElementById('pg-sdt-search'); if (sdtSearch) sdtSearch.value = '';
  refreshPgNextBtn();
}

// El value de un <input list> es el nombre tipeado tal cual: solo se
// considera "elegido" si matchea exacto un SDT real del catalogo (misma
// logica que pgSdtVersionByName para el combo "SDT" del editor de BTI019).
function pgOnSdtSearchInput() {
  var val = v('pg-sdt-search');
  pgSelectedSdtName = pgSdtOptions.some(function(s) { return s.nom === val; }) ? val : null;
  refreshPgNextBtn();
}

async function pgLoadServices() {
  var loading = document.getElementById('pg-svc-loading'), err = document.getElementById('pg-svc-err');
  if (err) err.className = 'cres';
  if (loading) loading.style.display = 'flex';
  pgSelectedService = null; pgSelectedMethod = null;
  refreshPgNextBtn();
  try {
    var r = await fetch('/sg/api/services', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, apiMode: S.apiMode }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    pgAllServices = d.services || [];
    pgServicesLoaded = true;
    var sel = document.getElementById('pg-sel-svc');
    sel.innerHTML = '<option value="">-- Seleccionar --</option>';
    pgAllServices.forEach(function(s) {
      var opt = document.createElement('option'); opt.value = s; opt.textContent = s; sel.appendChild(opt);
    });
    document.getElementById('pg-sel-mtd').innerHTML = '<option value="">-- Seleccionar --</option>';
  } catch(e) {
    if (err) { err.className = 'cres show err'; err.textContent = e.message; }
  }
  if (loading) loading.style.display = 'none';
}

async function pgLoadMethods(service) {
  pgSelectedService = service || null;
  pgSelectedMethod = null;
  refreshPgNextBtn();
  var sel = document.getElementById('pg-sel-mtd');
  sel.innerHTML = '<option value="">Cargando...</option>';
  if (!service) { sel.innerHTML = '<option value="">-- Seleccionar --</option>'; return; }
  try {
    var r = await fetch('/sg/api/methods', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, service: service, apiMode: S.apiMode }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    sel.innerHTML = '<option value="">-- Seleccionar --</option>';
    (d.methods || []).forEach(function(m) {
      var opt = document.createElement('option'); opt.value = m; opt.textContent = m; sel.appendChild(opt);
    });
  } catch(e) {
    sel.innerHTML = '<option value="">Error al cargar</option>';
  }
}

function pgOnMethodChange() {
  pgSelectedMethod = v('pg-sel-mtd') || null;
  refreshPgNextBtn();
}

function refreshPgNextBtn() {
  var btn = document.getElementById('btn-next');
  if (!btn || S.step !== 4 || S.action !== 'paramgen') return;
  btn.disabled = pgTargetMode === 'sdt' ? !pgSelectedSdtName : !pgSelectedMethod;
}

async function pgGoToEdit() {
  if (pgTargetMode === 'sdt') { await pgGoToSdtEdit(); return; }
  if (!pgSelectedService || !pgSelectedMethod) return;
  var btn = document.getElementById('btn-next');
  if (btn) { btn.innerHTML = '<span class="spin"></span>&nbsp;Cargando...'; btn.disabled = true; }
  try {
    var r = await fetch('/api/paramgen/params', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, apiMode: S.apiMode, service: pgSelectedService, method: pgSelectedMethod }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    pgSrvVer = d.srvver || '1';
    pgFields = (d.params || []).map(function(p) { return Object.assign({}, p); });
    pgOriginalCount = pgFields.length;
    document.getElementById('pg-mtd-name').textContent = pgSelectedService + ' / ' + pgSelectedMethod;
    document.getElementById('pg-edit-sub').textContent = 'Editá, agregá o quitá parámetros. El orden de carga define la posición (BTISRVPARPOSI) y no se puede cambiar.';
    // Se espera el catalogo de SDTs antes de mostrar el editor: si show(5)
    // dispara pgRenderEditor() antes de que resuelva, los campos "SDT"/"SDT
    // del Ítem" arman su datalist vacio (pgRenderEditor no se vuelve a llamar
    // solo porque el catalogo llegue despues).
    await pgLoadSdtOptions();
    show(5);
  } catch(e) {
    alert('Error: ' + e.message);
  }
  if (btn) { btn.innerHTML = 'Siguiente &#8594;'; btn.disabled = false; }
}

async function pgGoToSdtEdit() {
  if (!pgSelectedSdtName) return;
  var btn = document.getElementById('btn-next');
  if (btn) { btn.innerHTML = '<span class="spin"></span>&nbsp;Cargando...'; btn.disabled = true; }
  try {
    var r = await fetch('/api/paramgen/sdt-fields', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, apiMode: S.apiMode, nom: pgSelectedSdtName }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    pgSdtFields = (d.bti026 || []).map(function(f) { return Object.assign({}, f); });
    pgSdtOriginalCount = pgSdtFields.length;
    document.getElementById('pg-mtd-name').textContent = pgSelectedSdtName + (d.bti025 && d.bti025.version ? ' (v' + d.bti025.version + ')' : '');
    document.getElementById('pg-edit-sub').textContent = 'Editá, quitá o arrastrá para reordenar campos. Para agregar campos nuevos usá "Generar SDT".';
    await pgLoadSdtOptions();
    show(5);
  } catch(e) {
    alert('Error: ' + e.message);
  }
  if (btn) { btn.innerHTML = 'Siguiente &#8594;'; btn.disabled = false; }
}

// Catalogo de SDTs (nombre + version) para los campos "SDT" / "SDT del
// Ítem" (Categoría=SDT, o Categoría=Colección con Categoría del Ítem=SDT).
// Se muestran como <input list="pg-sdt-list"> (texto libre + datalist), no
// <select>: el datalist filtra nativamente a medida que se escribe, mucho
// mas comodo que scrollear un combo cuando hay cientos de SDTs.
async function pgLoadSdtOptions() {
  try {
    var r = await fetch('/api/paramgen/sdt-options', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, apiMode: S.apiMode }) });
    var d = await r.json();
    if (!d.ok) return;
    pgSdtOptions = d.sdts || [];
    var dl = document.getElementById('pg-sdt-list');
    if (dl) dl.innerHTML = pgSdtOptions.map(function(s) { return '<option value="' + pgEscapeAttr(s.nom) + '">'; }).join('');
  } catch(e) { /* si falla, el datalist de SDT queda vacio pero el resto del editor sigue andando */ }
}

// El value de un <input list> es el nombre tipeado tal cual (no hay forma de
// que el datalist "adjunte" la version): se busca la version correspondiente
// en el catalogo ya cargado. Si no matchea ningun SDT conocido (el usuario
// todavia esta escribiendo, o puso un nombre que no existe) devuelve '',
// y pgValidateField/buildParams lo marcan como "falta elegir un SDT".
function pgSdtVersionByName(nom) {
  var found = pgSdtOptions.find(function(s) { return s.nom === nom; });
  return found ? found.version : '';
}

// Misma idea que sdtgenValidateField: da feedback inmediato en el editor,
// pero la autoridad final es buildParams en el server (scripts/editar-parametria).
// Que campos son obligatorios depende de la categoria, mismo arbol que
// buildParams: B=tipo+largo/decimales propios, S=SDT+version, C=categoria
// del item + nombre del item + (tipo/largo/decimales del item, o SDT+version
// del item si el item es SDT).
function pgValidateField(f) {
  if (!PG_NAME_RE.test(f.nom || '')) return 'Nombre invalido: debe empezar con una letra y usar solo letras, numeros o guion bajo.';
  if (PG_FORBIDDEN_TEXT_RE.test(f.dsc || '')) return 'Descripcion invalida: no puede tener comillas, punto y coma, barra invertida ni saltos de linea.';
  // El valor por defecto solo se pide/valida cuando esta visible (dir=Hidden
  // y, si es Basico, un tipo con largo): un valor viejo en un campo oculto
  // no debe bloquear "Siguiente" con un error que el usuario no puede ver.
  if (pgValorVisible(f) && PG_FORBIDDEN_TEXT_RE.test(f.valor || '')) return 'Valor por defecto invalido: no puede tener comillas, punto y coma, barra invertida ni saltos de linea.';

  if (f.cat === 'S') {
    if (!(f.tipo || '').trim() || !(f.sdtver || '').trim()) return 'Elegí un SDT para este parámetro.';
    return null;
  }
  if (f.cat === 'C') {
    if (!PG_NAME_RE.test(f.itnom || '')) return 'Nombre de ítem invalido: debe empezar con una letra y usar solo letras, numeros o guion bajo.';
    if (f.catit === 'S') {
      if (!(f.ittipo || '').trim() || !(f.sdtver || '').trim()) return 'Elegí el SDT del ítem para este parámetro.';
    } else {
      if (!(f.ittipo || '').trim()) return 'El tipo del ítem no puede quedar vacío.';
      if (pgLargoVisible(f.ittipo) && !PG_DIGITS_RE.test(f.largo != null ? String(f.largo) : '')) return 'Largo del ítem invalido: debe ser un numero entero (0 o mayor).';
      if (pgDecimalesVisible(f.ittipo) && !PG_DIGITS_RE.test(f.deci != null ? String(f.deci) : '0')) return 'Decimales del ítem invalidos: debe ser un numero entero (0 o mayor).';
    }
    return null;
  }
  // Basico (default).
  if (!(f.tipo || '').trim()) return 'El tipo no puede quedar vacío.';
  if (pgLargoVisible(f.tipo) && !PG_DIGITS_RE.test(f.largo != null ? String(f.largo) : '')) return 'Largo invalido: debe ser un numero entero (0 o mayor).';
  if (pgDecimalesVisible(f.tipo) && !PG_DIGITS_RE.test(f.deci != null ? String(f.deci) : '0')) return 'Decimales invalidos: debe ser un numero entero (0 o mayor).';
  return null;
}

function pgFieldsAllValid() {
  return pgFields.length > 0 && pgFields.every(function(f) { return !pgValidateField(f); });
}

// Cambiar de categoria cambia por completo que campos aplican (ver
// pgDynamicFieldsHtml/buildParams), asi que se resetean los campos
// dependientes en vez de arrastrar valores que ya no tienen sentido.
function pgOnCatChange(field, newCat) {
  field.cat = newCat;
  field.tipo = '';
  field.sdtver = '';
  field.ittipo = '';
  field.itnom = '';
  field.catit = 'B';
  field.largo = '0';
  field.deci = '0';
}

// Igual que pgOnCatChange pero para el sub-selector "Categoría del Ítem"
// (solo existe con Categoría=Colección): el nombre del item (itnom) es
// independiente de si el item es Basico o SDT, asi que se preserva.
function pgOnCatitChange(field, newCatit) {
  field.catit = newCatit;
  field.ittipo = '';
  field.sdtver = '';
  field.largo = '0';
  field.deci = '0';
}

// El tipo elegido (Basico o Item) decide si largo/decimales siguen teniendo
// sentido; si dejan de aplicar se resetean a '0' en vez de arrastrar un
// valor viejo que ya no se muestra (y que igual viajaria al script si no se
// limpiara). pgOnTipoChange ademas puede afectar la visibilidad de "Valor
// por defecto" (depende de dir+tipo, ver pgValorVisible), asi que la limpia.
function pgOnTipoChange(field, newTipo) {
  field.tipo = newTipo;
  if (!pgLargoVisible(newTipo)) field.largo = '0';
  if (!pgDecimalesVisible(newTipo)) field.deci = '0';
  if (!pgValorVisible(field)) field.valor = '';
}

function pgOnItTipoChange(field, newTipo) {
  field.ittipo = newTipo;
  if (!pgLargoVisible(newTipo)) field.largo = '0';
  if (!pgDecimalesVisible(newTipo)) field.deci = '0';
}

function pgTipoOptionsHtml(selected) {
  var opts = PG_TIPO_OPTIONS.slice();
  // Un tipo legacy que no este en la lista fija no se pisa en silencio: se
  // agrega como opcion extra para que la fila siga mostrando el valor real
  // que tiene en la base hasta que alguien lo cambie a mano.
  if (selected && opts.indexOf(selected) === -1) opts = [selected].concat(opts);
  return opts.map(function(t) {
    return '<option value="' + pgEscapeAttr(t) + '"' + (t === selected ? ' selected' : '') + '>' + pgEscapeAttr(t) + '</option>';
  }).join('');
}

// Arma el tramo de campos que depende de la categoria elegida (ver los 3
// combos posibles en el mock: Basico -> Tipo+Largo(+Decimales); SDT -> un
// solo campo "SDT"; Coleccion -> Categoría del Ítem + Nombre del Ítem, y
// despues el mismo patron Basico/SDT pero para el item). Largo/Decimales
// solo se agregan al HTML cuando aplican para el tipo elegido (ver
// pgLargoVisible/pgDecimalesVisible); "Valor por defecto" se decide aparte,
// en pgRenderEditor, porque depende tambien de la Direccion.
function pgDynamicFieldsHtml(field, showV4Extras) {
  if (field.cat === 'S') {
    return '<div class="pg-fgroup pg-fgroup-grow"><label class="pg-flabel">SDT</label>' +
      '<input type="text" class="sdtgen-field-input pg-input-sdt" list="pg-sdt-list" placeholder="Buscar SDT..." value="' + pgEscapeAttr(field.tipo) + '"></div>';
  }
  if (field.cat === 'C') {
    var catit = field.catit || 'B';
    var catitOpts = PG_CATIT_OPTIONS.map(function(o) {
      return '<option value="' + o.v + '"' + (catit === o.v ? ' selected' : '') + '>' + o.l + ' (' + o.v + ')</option>';
    }).join('');
    var html = '<div class="pg-fgroup"><label class="pg-flabel">Categoría del Ítem</label><select class="sdtgen-field-input pg-input-catit">' + catitOpts + '</select></div>' +
      '<div class="pg-fgroup"><label class="pg-flabel">Nombre del Ítem</label><input type="text" class="sdtgen-field-input pg-input-itnom" value="' + pgEscapeAttr(field.itnom) + '"></div>';
    if (catit === 'S') {
      html += '<div class="pg-fgroup pg-fgroup-grow"><label class="pg-flabel">SDT del Ítem</label>' +
        '<input type="text" class="sdtgen-field-input pg-input-sdtitem" list="pg-sdt-list" placeholder="Buscar SDT..." value="' + pgEscapeAttr(field.ittipo) + '"></div>';
    } else {
      html += '<div class="pg-fgroup"><label class="pg-flabel">Tipo del Ítem</label><select class="sdtgen-field-input pg-input-ittipo">' + pgTipoOptionsHtml(field.ittipo) + '</select></div>';
      if (pgLargoVisible(field.ittipo)) {
        html += '<div class="pg-fgroup"><label class="pg-flabel">Largo del Ítem</label><input type="text" class="sdtgen-field-input pg-input-largo" value="' + pgEscapeAttr(field.largo) + '"></div>';
      }
      if (showV4Extras && pgDecimalesVisible(field.ittipo)) {
        html += '<div class="pg-fgroup"><label class="pg-flabel">Decimales del Ítem</label><input type="text" class="sdtgen-field-input pg-input-deci" value="' + pgEscapeAttr(field.deci) + '"></div>';
      }
    }
    return html;
  }
  // Basico.
  var html = '<div class="pg-fgroup"><label class="pg-flabel">Tipo</label><select class="sdtgen-field-input pg-input-tipo">' + pgTipoOptionsHtml(field.tipo) + '</select></div>';
  if (pgLargoVisible(field.tipo)) {
    html += '<div class="pg-fgroup"><label class="pg-flabel">Largo</label><input type="text" class="sdtgen-field-input pg-input-largo" value="' + pgEscapeAttr(field.largo) + '"></div>';
  }
  if (showV4Extras && pgDecimalesVisible(field.tipo)) {
    html += '<div class="pg-fgroup"><label class="pg-flabel">Decimales</label><input type="text" class="sdtgen-field-input pg-input-deci" value="' + pgEscapeAttr(field.deci) + '"></div>';
  }
  return html;
}

// Conecta los listeners del tramo dinamico armado por pgDynamicFieldsHtml.
// Los selects que cambian la CATEGORIA (cat/catit) disparan un re-render
// completo de la fila (los campos que aplican cambian); el resto muta el
// campo en memoria sin re-renderizar.
function pgWireDynamicFields(card, field, showV4Extras, updateErr) {
  if (field.cat === 'S') {
    card.querySelector('.pg-input-sdt').addEventListener('input', function() {
      field.tipo = this.value;
      field.sdtver = pgSdtVersionByName(this.value);
      updateErr();
    });
    return;
  }
  if (field.cat === 'C') {
    card.querySelector('.pg-input-catit').addEventListener('change', function() {
      pgOnCatitChange(field, this.value);
      pgRenderEditor();
    });
    card.querySelector('.pg-input-itnom').addEventListener('input', function() { field.itnom = this.value; updateErr(); });
    if (field.catit === 'S') {
      card.querySelector('.pg-input-sdtitem').addEventListener('input', function() {
        field.ittipo = this.value;
        field.sdtver = pgSdtVersionByName(this.value);
        updateErr();
      });
    } else {
      card.querySelector('.pg-input-ittipo').addEventListener('change', function() {
        pgOnItTipoChange(field, this.value);
        pgRenderEditor();
      });
      var itLargoInput = card.querySelector('.pg-input-largo');
      if (itLargoInput) itLargoInput.addEventListener('input', function() { field.largo = this.value; updateErr(); });
      var itDeciInput = card.querySelector('.pg-input-deci');
      if (itDeciInput) itDeciInput.addEventListener('input', function() { field.deci = this.value; updateErr(); });
    }
    return;
  }
  // Basico.
  card.querySelector('.pg-input-tipo').addEventListener('change', function() {
    pgOnTipoChange(field, this.value);
    pgRenderEditor();
  });
  var largoInput = card.querySelector('.pg-input-largo');
  if (largoInput) largoInput.addEventListener('input', function() { field.largo = this.value; updateErr(); });
  var deciInput = card.querySelector('.pg-input-deci');
  if (deciInput) deciInput.addEventListener('input', function() { field.deci = this.value; updateErr(); });
}

// Cada parametro es una tarjeta con sus propios campos etiquetados (no una
// tabla de columnas fijas): la Categoría cambia que campos aplican, asi que
// una grilla de columnas compartida entre filas no tiene sentido aca (a
// diferencia del editor de campos de SDT).
function pgRenderEditor() {
  var addBtn = document.getElementById('pg-add-param-btn'); if (addBtn) addBtn.style.display = '';
  var container = document.getElementById('pg-fields');
  container.innerHTML = '';
  var showV4Extras = S.version === 'V4';

  pgFields.forEach(function(field, idx) {
    var card = document.createElement('div');
    card.className = 'pg-param-card';

    var dirOpts = PG_DIR_OPTIONS.map(function(o) {
      return '<option value="' + o.v + '"' + (field.dir === o.v ? ' selected' : '') + '>' + o.l + ' (' + o.v + ')</option>';
    }).join('');
    var catOpts = PG_CAT_OPTIONS.map(function(o) {
      return '<option value="' + o.v + '"' + (field.cat === o.v ? ' selected' : '') + '>' + o.l + ' (' + o.v + ')</option>';
    }).join('');

    card.innerHTML =
      '<div class="pg-param-top">' +
        '<div class="pg-fgroup pg-fgroup-grow"><label class="pg-flabel">Nombre</label><input type="text" class="sdtgen-field-input pg-input-nom" value="' + pgEscapeAttr(field.nom) + '"></div>' +
        '<span class="pg-suggest-badge" style="display:none">&#10003; autocompletado</span>' +
        '<button type="button" class="sdtgen-field-rm" title="Quitar">&times;</button>' +
      '</div>' +
      '<div class="pg-param-fields">' +
        '<div class="pg-fgroup"><label class="pg-flabel">Dirección</label><select class="sdtgen-field-input pg-input-dir">' + dirOpts + '</select></div>' +
        '<div class="pg-fgroup"><label class="pg-flabel">Categoría</label><select class="sdtgen-field-input pg-input-cat">' + catOpts + '</select></div>' +
        pgDynamicFieldsHtml(field, showV4Extras) +
        (pgValorVisible(field) ? '<div class="pg-fgroup pg-fgroup-grow"><label class="pg-flabel">Valor por defecto</label><input type="text" class="sdtgen-field-input pg-input-valor" value="' + pgEscapeAttr(field.valor) + '"></div>' : '') +
        (showV4Extras ? '<div class="pg-fgroup pg-fgroup-grow"><label class="pg-flabel">Descripción</label><input type="text" class="sdtgen-field-input pg-input-dsc" value="' + pgEscapeAttr(field.dsc) + '"></div>' : '') +
      '</div>' +
      '<div class="sdtgen-field-err"></div>';

    var err = card.querySelector('.sdtgen-field-err');
    function updateErr() {
      var msg = pgValidateField(field);
      err.textContent = msg || '';
      card.classList.toggle('invalid', !!msg);
    }

    card.querySelector('.pg-input-nom').addEventListener('input', function() { field.nom = this.value; updateErr(); pgScheduleSuggestion(field); });
    card.querySelector('.pg-input-dir').addEventListener('change', function() {
      field.dir = this.value;
      if (field.dir === 'R') {
        // BusinessErrors siempre es el mismo parametro: se autocompleta toda
        // la fila y se re-renderiza (cambia cat/catit, o sea que campos se ven).
        Object.assign(field, PG_BUSINESS_ERRORS_SHAPE);
        pgRenderEditor();
        pgFlashSuggestion(field);
        return;
      }
      // "Valor por defecto" depende de la Direccion (ver pgValorVisible): se
      // re-renderiza siempre para mostrarlo/ocultarlo, limpiando el valor si
      // deja de aplicar en vez de arrastrar uno viejo que ya no se ve.
      if (!pgValorVisible(field)) field.valor = '';
      pgRenderEditor();
    });
    card.querySelector('.pg-input-cat').addEventListener('change', function() {
      pgOnCatChange(field, this.value);
      pgRenderEditor();
    });
    var valorInput = card.querySelector('.pg-input-valor');
    if (valorInput) valorInput.addEventListener('input', function() { field.valor = this.value; updateErr(); });
    if (showV4Extras) card.querySelector('.pg-input-dsc').addEventListener('input', function() { field.dsc = this.value; updateErr(); });
    pgWireDynamicFields(card, field, showV4Extras, updateErr);
    updateErr();

    card.querySelector('.sdtgen-field-rm').onclick = function() {
      pgFields.splice(idx, 1);
      pgRenderEditor();
    };
    container.appendChild(card);
  });
}

// Autocompletar por nombre: al escribir un nombre de parametro que ya existe
// en cualquier otro servicio/metodo, se copian sus propiedades (tipo, largo,
// descripcion, etc. — ver SUGGEST_FIELDS en scripts/editar-parametria) para
// no redefinir "Cuit" o "FechaNacimiento" con datos ligeramente distintos
// cada vez. Debounced (500ms) para no pegarle al server en cada tecla, y con
// guarda contra loops: no vuelve a buscar el mismo nombre dos veces seguidas.
var pgSuggestTimers = new WeakMap(); // field -> timeout id del debounce
var pgSuggestedNames = new WeakMap(); // field -> ultimo nombre ya consultado/aplicado

function pgScheduleSuggestion(field) {
  clearTimeout(pgSuggestTimers.get(field));
  var t = setTimeout(function() { pgLookupSuggestion(field); }, 500);
  pgSuggestTimers.set(field, t);
}

async function pgLookupSuggestion(field) {
  var nombre = (field.nom || '').trim();
  if (!PG_NAME_RE.test(nombre)) return;
  if (pgSuggestedNames.get(field) === nombre) return;
  try {
    var r = await fetch('/api/paramgen/suggest', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, apiMode: S.apiMode, nombre: nombre }) });
    var d = await r.json();
    if (!d.ok || !d.suggestion) return;
    // El usuario pudo seguir escribiendo mientras se esperaba la respuesta:
    // si el nombre ya cambio, esta sugerencia quedo vieja y no se aplica.
    if ((field.nom || '').trim() !== nombre) return;
    pgSuggestedNames.set(field, nombre);
    Object.assign(field, d.suggestion.shape);
    pgRenderEditor();
    pgFlashSuggestion(field);
  } catch(e) { /* la sugerencia es solo una ayuda, no bloquea el flujo si falla */ }
}

function pgFlashSuggestion(field) {
  var idx = pgFields.indexOf(field);
  if (idx < 0) return;
  var card = document.querySelectorAll('.pg-param-card')[idx];
  var badge = card && card.querySelector('.pg-suggest-badge');
  if (!badge) return;
  badge.style.display = '';
  setTimeout(function() { badge.style.display = 'none'; }, 2500);
}

function pgAddParam() {
  pgFields.push({ nom: 'NuevoParametro', nomjava: 'param0', dir: 'I', tipo: 'string', ittipo: '', valor: '', sdtver: '', cat: 'B', catit: 'B', largo: '0', lval: '', itnom: '', deci: '0', dsc: '' });
  pgRenderEditor();
}

// ── Editor de campos de un SDT existente (BTI026/BTCBS026) ────
// Mucho mas simple que el editor de parametros: solo Nombre, Largo,
// Decimales, Descripcion e Iterador son editables (mismo criterio que
// buildSdtCopy en Generar SDT); el Tipo se muestra de solo lectura porque
// cambiarlo correctamente requeriria la misma logica en cascada de
// Categoria/SDT que tiene el editor de BTI019, y esta herramienta esta
// pensada para corregir datos (largo/descripcion), no para redefinir un
// campo. No hay boton de "agregar campo": la posicion 1..N ya identifica
// una fila real de la base (ver generateFieldsScript), asi que agregar uno
// nuevo significaria elegirle un tipo — eso sigue siendo trabajo de
// "Generar SDT".
function pgSdtFieldValidate(f) {
  if (!PG_NAME_RE.test(f.elemnom || '')) return 'Nombre invalido: debe empezar con una letra y usar solo letras, numeros o guion bajo.';
  if (!PG_DIGITS_RE.test(f.elemlargo != null ? String(f.elemlargo) : '')) return 'Largo invalido: debe ser un numero entero (0 o mayor).';
  if (!PG_DIGITS_RE.test(f.elemdeci != null ? String(f.elemdeci) : '0')) return 'Decimales invalidos: debe ser un numero entero (0 o mayor).';
  if (PG_FORBIDDEN_TEXT_RE.test(f.elemdsc || '')) return 'Descripcion invalida: no puede tener comillas, punto y coma, barra invertida ni saltos de linea.';
  if (f.nomit && PG_FORBIDDEN_TEXT_RE.test(f.nomit)) return 'Nombre de iterador invalido: no puede tener comillas, punto y coma, barra invertida ni saltos de linea.';
  return null;
}

function pgSdtFieldsAllValid() {
  return pgSdtFields.length > 0 && pgSdtFields.every(function(f) { return !pgSdtFieldValidate(f); });
}

function pgRenderSdtEditor() {
  var addBtn = document.getElementById('pg-add-param-btn'); if (addBtn) addBtn.style.display = 'none';
  var container = document.getElementById('pg-fields');
  container.innerHTML = '';
  var showV4Extras = S.version === 'V4';

  pgSdtFields.forEach(function(field, idx) {
    var card = document.createElement('div');
    card.className = 'pg-param-card';
    // El drag arranca SOLO desde el handle (ver listeners de mousedown/touchstart
    // mas abajo), no clickeando en cualquier parte de la tarjeta: si no, mover
    // el cursor por arriba de un input o una label podia disparar un drag sin
    // querer. draggable se prende/apaga alrededor de cada intento de arrastre.
    card.draggable = false;

    card.innerHTML =
      '<div class="pg-param-top">' +
        '<span class="sdtgen-drag-handle" title="Arrastrá para reordenar">&#9776;</span>' +
        '<div class="pg-fgroup pg-fgroup-pos"><label class="pg-flabel">Orden</label><input type="number" class="sdtgen-field-input pg-input-posi" min="1" max="' + pgSdtFields.length + '" value="' + (idx + 1) + '" title="Posición del campo: cambiala para reordenar sin arrastrar"></div>' +
        '<div class="pg-fgroup pg-fgroup-grow"><label class="pg-flabel">Nombre</label><input type="text" class="sdtgen-field-input pg-input-elemnom" value="' + pgEscapeAttr(field.elemnom) + '"></div>' +
        '<span class="pg-suggest-badge" style="display:none">&#10003; autocompletado</span>' +
        '<button type="button" class="sdtgen-field-rm" title="Quitar">&times;</button>' +
      '</div>' +
      '<div class="pg-param-fields">' +
        '<div class="pg-fgroup"><label class="pg-flabel">Tipo</label><input type="text" class="sdtgen-field-input" value="' + pgEscapeAttr(field.elemtipo) + '" disabled></div>' +
        '<div class="pg-fgroup"><label class="pg-flabel">Largo</label><input type="text" class="sdtgen-field-input pg-input-elemlargo" value="' + pgEscapeAttr(field.elemlargo) + '"></div>' +
        (showV4Extras ? '<div class="pg-fgroup"><label class="pg-flabel">Decimales</label><input type="text" class="sdtgen-field-input pg-input-elemdeci" value="' + pgEscapeAttr(field.elemdeci) + '"></div>' : '') +
        '<div class="pg-fgroup pg-fgroup-grow"><label class="pg-flabel">Descripción</label><input type="text" class="sdtgen-field-input pg-input-elemdsc" value="' + pgEscapeAttr(field.elemdsc) + '"></div>' +
        (showV4Extras ? '<div class="pg-fgroup"><label class="pg-flabel">Iterador</label><input type="text" class="sdtgen-field-input pg-input-nomit" value="' + pgEscapeAttr(field.nomit) + '"></div>' : '') +
      '</div>' +
      '<div class="sdtgen-field-err"></div>';

    var err = card.querySelector('.sdtgen-field-err');
    function updateErr() {
      var msg = pgSdtFieldValidate(field);
      err.textContent = msg || '';
      card.classList.toggle('invalid', !!msg);
    }

    card.querySelector('.pg-input-elemnom').addEventListener('input', function() { field.elemnom = this.value; updateErr(); pgScheduleSdtSuggestion(field); });
    card.querySelector('.pg-input-elemlargo').addEventListener('input', function() { field.elemlargo = this.value; updateErr(); });
    card.querySelector('.pg-input-elemdsc').addEventListener('input', function() { field.elemdsc = this.value; updateErr(); });
    if (showV4Extras) {
      card.querySelector('.pg-input-elemdeci').addEventListener('input', function() { field.elemdeci = this.value; updateErr(); });
      card.querySelector('.pg-input-nomit').addEventListener('input', function() { field.nomit = this.value; updateErr(); });
    }
    updateErr();

    card.querySelector('.sdtgen-field-rm').onclick = function() {
      pgSdtFields.splice(idx, 1);
      pgRenderSdtEditor();
    };
    // Reordenar tipeando la posicion: alternativa al drag-and-drop para
    // quien prefiera no arrastrar. Se confirma con Enter o al salir del
    // campo (blur), asi no reordena en cada tecla mientras se escribe.
    var posInput = card.querySelector('.pg-input-posi');
    function commitPosInput() {
      var target = parseInt(posInput.value, 10);
      if (!Number.isFinite(target)) { posInput.value = idx + 1; return; }
      var targetIdx = Math.min(Math.max(target, 1), pgSdtFields.length) - 1;
      if (targetIdx === idx) { posInput.value = idx + 1; return; }
      pgMoveSdtField(idx, targetIdx);
    }
    posInput.addEventListener('change', commitPosInput);
    posInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); posInput.blur(); } });
    posInput.addEventListener('click', function(e) { e.stopPropagation(); });
    // El drag arranca SOLO al apretar el handle (ver comentario en card.draggable
    // mas arriba): mousedown ahi prende draggable, mouseup/dragend lo apagan.
    // Asi el resto de la tarjeta (inputs, labels, el campo Orden) queda libre
    // para click/seleccionar texto sin disparar un drag por accidente.
    var handle = card.querySelector('.sdtgen-drag-handle');
    handle.addEventListener('mousedown', function() { card.draggable = true; });
    card.addEventListener('mouseup', function() { card.draggable = false; });
    card.addEventListener('dragstart', function(e) {
      pgSdtDragIdx = idx; card.classList.add('dragging');
    });
    card.addEventListener('dragend', function() { card.classList.remove('dragging'); card.draggable = false; });
    card.addEventListener('dragover', function(e) { e.preventDefault(); });
    card.addEventListener('drop', function(e) {
      e.preventDefault();
      if (pgSdtDragIdx === null || pgSdtDragIdx === idx) return;
      pgMoveSdtField(pgSdtDragIdx, idx);
      pgSdtDragIdx = null;
    });
    container.appendChild(card);
  });
}

function pgMoveSdtField(fromIdx, toIdx) {
  var moved = pgSdtFields.splice(fromIdx, 1)[0];
  pgSdtFields.splice(toIdx, 0, moved);
  pgRenderSdtEditor();
}

// Mismo mecanismo de autocompletar por nombre que el editor de BTI019
// (pgScheduleSuggestion), pero reutilizando el endpoint de Generar SDT
// (/api/sdtgen/suggest-field): busca el nombre en CUALQUIER SDT y copia
// largo+descripcion si encuentra una definicion que no sea el default de
// "recien definido" (ver suggestFieldShape en scripts/generar-sdt).
var pgSdtSuggestTimers = new WeakMap();
var pgSdtSuggestedNames = new WeakMap();

function pgScheduleSdtSuggestion(field) {
  clearTimeout(pgSdtSuggestTimers.get(field));
  var t = setTimeout(function() { pgLookupSdtSuggestion(field); }, 500);
  pgSdtSuggestTimers.set(field, t);
}

async function pgLookupSdtSuggestion(field) {
  var nombre = (field.elemnom || '').trim();
  if (!PG_NAME_RE.test(nombre)) return;
  if (pgSdtSuggestedNames.get(field) === nombre) return;
  try {
    var r = await fetch('/api/sdtgen/suggest-field', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, apiMode: S.apiMode, nombre: nombre }) });
    var d = await r.json();
    if (!d.ok || !d.suggestion) return;
    if ((field.elemnom || '').trim() !== nombre) return;
    pgSdtSuggestedNames.set(field, nombre);
    field.elemlargo = d.suggestion.shape.largo;
    field.elemdsc = d.suggestion.shape.dsc;
    pgRenderSdtEditor();
    pgFlashSdtSuggestion(field);
  } catch(e) { /* la sugerencia es solo una ayuda, no bloquea el flujo si falla */ }
}

function pgFlashSdtSuggestion(field) {
  var idx = pgSdtFields.indexOf(field);
  if (idx < 0) return;
  var card = document.querySelectorAll('#pg-fields .pg-param-card')[idx];
  var badge = card && card.querySelector('.pg-suggest-badge');
  if (!badge) return;
  badge.style.display = '';
  setTimeout(function() { badge.style.display = 'none'; }, 2500);
}

function pgGoToResult() {
  var err = document.getElementById('pg-edit-err');
  if (pgTargetMode === 'sdt') {
    if (!pgSdtFields.length) { err.className = 'cres show err'; err.textContent = 'Tiene que quedar al menos un campo.'; return; }
    if (!pgSdtFieldsAllValid()) { err.className = 'cres show err'; err.textContent = 'Hay campos con datos invalidos, revisalos antes de continuar.'; return; }
    err.className = 'cres';
    show(6);
    return;
  }
  if (!pgFields.length) { err.className = 'cres show err'; err.textContent = 'Tiene que quedar al menos un parametro.'; return; }
  if (!pgFieldsAllValid()) { err.className = 'cres show err'; err.textContent = 'Hay parametros con datos invalidos, revisalos antes de continuar.'; return; }
  err.className = 'cres';
  show(6);
}

async function pgDoGenerate() {
  var ta = document.getElementById('pg-sql-out');
  ta.value = 'Generando...';
  try {
    var r = await fetch('/api/paramgen/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      version: S.version, apiMode: S.apiMode, service: pgSelectedService, srvver: pgSrvVer, method: pgSelectedMethod, params: pgFields, oldCount: pgOriginalCount
    }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    ta.value = d.script || '';
  } catch(e) { ta.value = 'Error: ' + e.message; }
}

async function pgDoGenerateSdtFields() {
  var ta = document.getElementById('pg-sql-out');
  ta.value = 'Generando...';
  try {
    var r = await fetch('/api/paramgen/generate-fields', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      version: S.version, apiMode: S.apiMode, sdtNom: pgSelectedSdtName, editedFields: pgSdtFields, oldCount: pgSdtOriginalCount
    }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    ta.value = d.script || '';
  } catch(e) { ta.value = 'Error: ' + e.message; }
}

function pgCopyScript() {
  var ta = document.getElementById('pg-sql-out'); if (!ta.value.trim()) return;
  navigator.clipboard.writeText(ta.value).then(function() {
    var res = document.getElementById('pg-exec-res');
    res.className = 'cres show ok'; res.textContent = 'Copiado al portapapeles ✓';
    setTimeout(function() { res.className = 'cres'; }, 2000);
  }).catch(function() { ta.select(); document.execCommand('copy'); });
}

async function pgExecute() {
  if (pgTargetMode === 'sdt') { await pgExecuteSdtFields(); return; }
  if (!confirm('Esto va a actualizar los parámetros de ' + pgSelectedService + ' / ' + pgSelectedMethod + ' (UPDATE de los existentes, INSERT de los nuevos, DELETE de los que se quitaron) contra la base conectada. ¿Confirmás?')) return;
  var res = document.getElementById('pg-exec-res');
  res.className = 'cres show'; res.textContent = 'Ejecutando...';
  try {
    var r = await fetch('/api/paramgen/execute', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      platform: S.platform, db: getDbSG(), version: S.version, apiMode: S.apiMode,
      service: pgSelectedService, srvver: pgSrvVer, method: pgSelectedMethod, params: pgFields
    }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    res.className = 'cres show ok'; res.textContent = 'Ejecutado correctamente (' + d.statementsRun + ' sentencias) ✓';
  } catch(e) {
    res.className = 'cres show err'; res.textContent = 'Error: ' + e.message;
  }
}

async function pgExecuteSdtFields() {
  if (!confirm('Esto va a actualizar los campos del SDT ' + pgSelectedSdtName + ' (UPDATE de los existentes, DELETE de los que se quitaron) contra la base conectada. ¿Confirmás?')) return;
  var res = document.getElementById('pg-exec-res');
  res.className = 'cres show'; res.textContent = 'Ejecutando...';
  try {
    var r = await fetch('/api/paramgen/execute-fields', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      platform: S.platform, db: getDbSG(), version: S.version, apiMode: S.apiMode,
      sdtNom: pgSelectedSdtName, editedFields: pgSdtFields
    }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    res.className = 'cres show ok'; res.textContent = 'Ejecutado correctamente (' + d.statementsRun + ' sentencias) ✓';
  } catch(e) {
    res.className = 'cres show err'; res.textContent = 'Error: ' + e.message;
  }
}

function pgReset() {
  pgSelectedService = null; pgSelectedMethod = null; pgFields = []; pgOriginalCount = 0; pgServicesLoaded = false;
  pgSelectedSdtName = null; pgSdtFields = []; pgSdtOriginalCount = 0; pgSdtDragIdx = null;
  var svcSel = document.getElementById('pg-sel-svc'); if (svcSel) svcSel.innerHTML = '<option value="">-- Seleccionar --</option>';
  var mtdSel = document.getElementById('pg-sel-mtd'); if (mtdSel) mtdSel.innerHTML = '<option value="">-- Seleccionar --</option>';
  var sdtSearch = document.getElementById('pg-sdt-search'); if (sdtSearch) sdtSearch.value = '';
  document.getElementById('pg-sql-out').value = '';
  var res = document.getElementById('pg-exec-res'); if (res) res.className = 'cres';
  pgSetTargetMode(pgTargetMode); // conserva el modo actual, solo refresca los pickers visibles
  show(4); // show() ya recarga la lista de servicios/catalogo de SDT siempre al entrar al paso 4
}

// ── Historial de conexiones ───────────────────────────────────
var _dbHistory = [];
// Entrada del historial que corresponde a la conexion activa (elegida del
// dropdown o guardada por una prueba exitosa). Cada entrada guarda su propia
// config de API por apiMode (publica/interna, ver fillApiFields/testAuth):
// misma BD, pero pagina Swagger y credenciales distintas segun que API se
// use, asi que no alcanza con atarlo solo a la BD.
var _activeDbHistEntry = null;

// ── Validaciones ──────────────────────────────────────────────
var _VALIDATE_ENGLISH_RE = /\b(the|this|that|these|those|is|are|was|were|has|have|had|get|gets|set|sets|update|updates|create|creates|delete|deletes|return|returns|method|service|parameter|value|field|list|object|type|name|code|date|amount|flag|allow|allows|perform|performs|retrieve|retrieves)\b/i;
var _VALIDATE_LARGO_TYPES = new Set(['long','int','double','byte','short','string']);
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

// Sin ninguna fila en BTCBS012 (interna) / BTI012 (publica) el metodo no
// queda expuesto por ningun canal, aunque BTCBS014/019 o BTI014/019 esten
// completos: es un error funcional, no una cuestion de estilo de
// documentacion, asi que se chequea siempre en los dos modos (a diferencia
// del resto de validateItems, que es especifico de la API Publica).
function validateChannels(items, apiMode) {
  var interna = apiMode === 'interna';
  var field = interna ? 'BSSRVENAB' : 'BTISRVHAB';
  var tabla = interna ? 'BTCBS012' : 'BTI012';
  var warns = [];
  (items || []).forEach(function(item) {
    var svc = (item.header && item.header.BTISrvNom) || item.service || '?';
    var mtd = (item.header && item.header.BTIMtdNom) || item.method_name || '?';
    if (!(item.channels || []).length) {
      warns.push({ service: svc, method: mtd, field: field, msg: 'No se encontró ningún canal en ' + tabla + ': sin ese registro el método no funciona.' });
    }
  });
  return warns;
}

// Los controles de descripcion/largo/decimales son el estandar de la API
// Publica (de ahi sale la documentacion). La API Interna (tablas BTCBS) no
// los tiene que cumplir, asi que no se valida nada de eso, pero si se
// chequean los canales (BTCBS012, ver validateChannels).
function validateItems(items, apiMode) {
  if (apiMode === 'interna') return validateChannels(items, apiMode);
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
  warns = warns.concat(validateChannels(items, apiMode));
  return warns;
}

var _FIELD_TABLE = {
  BTIMTDDSC:       'BTI014',
  BTISRVPARDSC:    'BTI019',
  BTISRVPARLARGO:  'BTI019',
  BTISRVPARDECI:   'BTI019',
  BTISRVHAB:       'BTI012',
  BTISDTELEMLARGO: 'BTI026',
  BTISDTELEMDSC:   'BTI026',
  BSSRVENAB:       'BTCBS012'
};

function renderWarnings(containerId, warnings) {
  var el = document.getElementById(containerId); if (!el) return;
  if (!warnings || !warnings.length) { el.innerHTML = ''; el.style.display = 'none'; return; }
  var n = warnings.length;
  var html = '<div style="background:var(--warn-l);border:1px solid var(--warn);border-radius:8px;padding:14px 16px">' +
    '<div style="font-weight:600;font-size:var(--fs-sm);color:var(--warn-d);margin-bottom:var(--sp-3)">&#9888; ' + n + ' advertencia' + (n > 1 ? 's' : '') + ' encontrada' + (n > 1 ? 's' : '') + '</div>' +
    '<ul style="margin:0;padding-left:18px;font-size:var(--fs-sm);color:var(--warn-d);line-height:1.9">';
  warnings.forEach(function(w) {
    var tabla = _FIELD_TABLE[w.field] || '?';
    var loc = w.service ? (w.service + ' &rsaquo; ' + w.method) : w.method;
    if (w.param) loc += ' &rsaquo; ' + w.param;
    html += '<li>' +
      '<span style="background:var(--warn-l);color:var(--warn-d);font-weight:600;font-size:var(--fs-sm);padding:1px 5px;border-radius:3px;margin-right:var(--sp-1)">' + tabla + '</span>' +
      '<code style="background:rgba(0,0,0,.06);padding:1px 5px;border-radius:3px;font-size:var(--fs-sm)">' + w.field + '</code> ' +
      '<span style="color:var(--warn-d);font-weight:500"> [' + loc + ']</span> ' + w.msg + '</li>';
  });
  html += '</ul></div>';
  el.innerHTML = html; el.style.display = '';
}

// ── Utilidades ────────────────────────────────────────────────
function v(id)  { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
function vp(id) { var el = document.getElementById(id); return el ? el.value : ''; }
function setVal(id, val) { var el = document.getElementById(id); if (el && val != null) el.value = val; }

function togglePw(id, btn) {
  var inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.innerHTML = inp.type === 'password' ? '&#128065;' : '&#128584;';
}

function toFolderName(s) {
  return s.replace(/^Public/,'').replace(/([A-Z]+)([A-Z][a-z])/g,'$1-$2').replace(/([a-z\d])([A-Z])/g,'$1-$2');
}

// getDb()/getDbSG(): usados por TODAS las herramientas (doc, scripts, sdtgen,
// paramgen, collections) para armar el body de sus llamadas al server. Leen
// del ambiente activo (S.activeEnv / S.sdtEnv), no del DOM: los inputs de
// conexion solo existen dentro del paso "Conexión" (p2), que ya no se vuelve
// a mostrar salvo que el usuario elija cambiar de ambiente explicitamente.
function getDb() { return shapeDbApi(S.platform, effectiveFields()); }
function getDbSG() { return shapeDbSG(S.platform, effectiveFields()); }

// domDbShape()/domDbShapeSG(): variante que SI lee en vivo del DOM. Se usa
// unicamente dentro del paso de Conexión (testConn/runAutoConnTest,
// saveDbHistEntry) mientras el usuario todavia esta tipeando/probando una
// conexion que no fue confirmada como ambiente activo.
function domDbShape() { return shapeDbApi(S.platform, readFieldsFromDom(S.platform)); }
function domDbShapeSG() { return shapeDbSG(S.platform, readFieldsFromDom(S.platform)); }

function getApi() {
  return { BASE_URL: v('a-base'), API_BASE_URL: v('a-api'), API_AUTH_URL: v('a-auth'), API_USER: v('a-user'), API_PASSWORD: vp('a-pass'), API_CANAL: v('a-canal'), API_DEVICE: v('a-device'), API_REQUERIMIENTO: v('a-requerimiento'), DOC_ERRORES_MODELOS: v('doc-errores-modelos') };
}

// ── Navegación del wizard ─────────────────────────────────────

// Cualquier eleccion en los pasos 1-2 (accion/version/motor/API) es un
// cambio de "ambiente": la lista de servicios y el script ya generado por
// Generar Scripts quedan invalidos aunque la conexion a la base sea la
// misma (ese otro caso, cambiar los datos de conexion, ya lo cubre el
// reset de runAutoConnTest). Sin esto, volver atras y tocar version/API
// dejaba el paso 4 mostrando la lista/seleccion de la corrida anterior.
function sgInvalidateState() {
  sgServiceGroups = []; sgMultiData = null; sgServicesLoaded = false; allServices = [];
  var grp = document.getElementById('sg-service-groups'); if (grp) grp.innerHTML = '';
  var sel = document.getElementById('sg-sel-svc'); if (sel) sel.innerHTML = '<option value="">-- Seleccioná un servicio --</option>';
  var out = document.getElementById('sg-sql-out'); if (out) out.value = '';
}

// El ambiente (version/motor/conexion) ahora se elige una sola vez, al
// principio, y queda activo para todas las herramientas (S.activeEnv). Elegir
// una accion ya NO reinicia version/motor: solo Generar SDT puede llegar a
// pedir una conexion V4/Oracle aparte si el ambiente activo no lo es (ver
// sdtgenEnterOrCapture), sin tocar el ambiente global salvo confirmacion.
function pick(key, val, el) {
  sgInvalidateState();
  pgInvalidateState();
  S[key] = val;
  el.closest('.cards').querySelectorAll('.ccard').forEach(function(c) { c.classList.remove('sel'); });
  el.classList.add('sel');
  if (key === 'version') {
    S.platform = val === 'V3' ? 'sqlserver' : 'oracle';
    tryLoadEnv(val);
    toggleEngineSection(val === 'V4');
  }
  if (key === 'action') {
    updateStepLabels(val);
    // Cada eleccion de herramienta es un pedido fresco de apiMode (si aplica)
    // y descarta cualquier conexion especifica de Generar SDT de una vuelta
    // anterior, para no arrastrar credenciales viejas.
    S.sdtEnv = null;
    toggleApiModeSection(APIMODE_ACTIONS.has(val));
  }
  refreshNextBtn();
}

function toggleEngineSection(show) {
  var sec = document.getElementById('engine-section');
  if (!sec) return;
  sec.style.display = show ? 'block' : 'none';
  sec.querySelectorAll('.ccard').forEach(function(c) { c.classList.remove('sel'); });
  // Aparece sin nada marcado: el motor se elige a mano. V3 no pregunta motor,
  // queda en null.
  S.engine = null;
}

function toggleApiModeSection(show) {
  var sec = document.getElementById('apimode-section');
  if (!sec) return;
  sec.style.display = show ? 'block' : 'none';
  sec.querySelectorAll('.ccard').forEach(function(c) { c.classList.remove('sel'); });
  // Mientras la seccion esta visible no hay default: hay que elegir.
  S.apiMode = show ? null : 'publica';
}

function sectionVisible(id) {
  var sec = document.getElementById(id);
  return !!sec && sec.style.display !== 'none';
}

// Paso 1 (Versión): version -> motor.
function versionReady() {
  if (!S.version) return false;
  if (sectionVisible('engine-section') && !S.engine) return false;
  return true;
}

// Paso 3 (Acción): accion -> API (si la herramienta la pide).
function actionReady() {
  if (!S.action) return false;
  if (sectionVisible('apimode-section') && !S.apiMode) return false;
  return true;
}

function refreshNextBtn() {
  var nb = document.getElementById('btn-next');
  if (!nb) return;
  if (S.step === 1) nb.disabled = !versionReady();
  else if (S.step === 3) nb.disabled = !actionReady();
  else nb.disabled = false;
}

function updateStepLabels(action) {
  var lb4 = document.getElementById('lb4'), lb5 = document.getElementById('lb5');
  if (action === 'scripts') {
    if (lb4) lb4.textContent = 'Servicios';
    if (lb5) lb5.textContent = 'Script';
  } else if (action === 'collections') {
    if (lb4) lb4.textContent = 'API';
    if (lb5) lb5.textContent = 'Collections';
  } else if (action === 'sdtgen') {
    if (lb4) lb4.textContent = 'SDT base';
    if (lb5) lb5.textContent = 'Editar';
  } else if (action === 'paramgen') {
    if (lb4) lb4.textContent = 'Servicio';
    if (lb5) lb5.textContent = 'Parámetros';
  } else {
    // doc: paso de servicios va antes que el de ambiente (ver panelId)
    if (lb4) lb4.textContent = 'Servicios';
    if (lb5) lb5.textContent = 'API';
  }
}

function vizPos(step) {
  if (S.action === 'validate') {
    return step <= 3 ? 1 : 2; // ambiente+accion→1, panel→2
  }
  return step; // doc/scripts: 1-5 direct (step 6 success has no active dot)
}

function dots(step) {
  var pos = vizPos(step);
  var isSingle = S.action === 'validate';

  // Para validate el flujo se resume a 2 pasos visuales: elegir (ambiente +
  // accion) y validar. Para el resto, d1/d2/d3 muestran su rotulo real.
  var lb1 = document.getElementById('lb1');
  if (lb1) lb1.textContent = isSingle ? 'Ambiente' : 'Versión';
  var lb2 = document.getElementById('lb2');
  if (lb2) lb2.textContent = isSingle ? 'Validar' : 'Conexión';
  ['d3','d4','d5','l2','l3','l4'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = isSingle ? 'none' : '';
  });

  var maxDot = isSingle ? 2 : 5;
  [1,2,3,4,5].forEach(function(i) {
    var d = document.getElementById('d' + i);
    if (!d) return;
    d.classList.remove('active','done');
    if (i <= maxDot) {
      if (i < pos) d.classList.add('done');
      else if (i === pos) d.classList.add('active');
      document.getElementById('dn' + i).innerHTML = i < pos ? '&#10003;' : String(i);
    }
    if (i < 5) document.getElementById('l' + i).classList.toggle('done', i < pos);
  });
}

function panelId(step) {
  if (step === 1) return 'p1'; // versión
  if (step === 2) return 'p2'; // conexión
  if (step === 3) return 'p3'; // acción
  if (S.action === 'validate') return 'p4v';
  if (S.action === 'collections') return step === 4 ? 'p4' : 'p4c';
  if (S.action === 'scripts') return step === 4 ? 'p4s' : 'p5s';
  if (S.action === 'sdtgen') return step === 4 ? 'p-sdtbase' : step === 5 ? 'p-sdtedit' : 'p-sdtresult';
  if (S.action === 'paramgen') return step === 4 ? 'p-paramsvc' : step === 5 ? 'p-paramedit' : 'p-paramresult';
  if (S.action === 'doc') {
    if (step === 4) return 'p5'; // selección de servicios
    if (step === 5) return 'p4'; // ambiente + llamar a la API
    return 'p6'; // éxito
  }
  return 'p' + step;
}

function show(step) {
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  var pid = panelId(step);
  var panel = document.getElementById(pid);
  if (panel) panel.classList.add('active');
  S.step = step;
  dots(step);
  foot(step);
  if (step === 1) { // versión + motor
    markVersionCardsFromS();
  }
  if (step === 2) { // conexión — ya NO se limpia automaticamente: los campos
    // reflejan lo que ya haya (ambiente activo si se esta editando, o lo que
    // el usuario ya tipeo si volvio de otro paso). Solo se limpian de forma
    // explicita (primer uso nunca tocado, o conexion especifica de sdtgen).
    document.getElementById('sql-fields').style.display = S.platform === 'sqlserver' ? 'block' : 'none';
    document.getElementById('ora-fields').style.display  = S.platform === 'oracle'    ? 'block' : 'none';
    loadDbHistory();
    setTimeout(setupConnWatchers, 0);
    if (_pendingReconnectError) {
      var res = document.getElementById('cres');
      if (res) { res.className = 'cres show err'; res.textContent = _pendingReconnectError; }
      _pendingReconnectError = null;
    }
  }
  if (step === 4 && S.action === 'validate') { loadValidateFolders(); }
  if (step === 4 && S.action === 'doc') { if (!allServices.length) loadServices(); else renderList(); }
  // Panel de ambiente + API ('p4'): en collections vive en el paso 4, en doc
  // (tras el reorden servicios-antes-que-ambiente) vive en el paso 5.
  if ((step === 4 && S.action === 'collections') || (step === 5 && S.action === 'doc')) {
      var isV4 = S.version === 'V4';
      var isCollections = S.action === 'collections';
      document.getElementById('a-auth-wrap').style.display = isV4 ? 'none' : 'block';
      document.getElementById('a-api-wrap').style.display  = (isV4 && !isCollections) ? 'none' : 'block';
      var lbl = document.getElementById('a-base-label');
      if (lbl) {
        if (isCollections && isV4) {
          lbl.innerHTML = 'URL publica <span style="color:var(--muted);font-weight:400;font-size:var(--fs-sm)">(ej: http://10.0.0.7:5101/api/publicapi)</span>';
        } else if (isV4) {
          lbl.innerHTML = 'URL de la API <span style="color:var(--muted);font-weight:400;font-size:var(--fs-sm)">(ej: http://10.0.0.7:5101/api/publicapi)</span>';
        } else {
          lbl.innerHTML = 'URL publica <span style="color:var(--muted);font-weight:400;font-size:var(--fs-sm)">(para los ejemplos de la documentacion)</span>';
        }
      }
      fillApiFields();
  }
  if (step === 5 && S.action === 'collections') {
    if (typeof collectionRefreshContext === 'function') collectionRefreshContext();
    if (typeof collectionToggleConfig === 'function') collectionToggleConfig();
  }
  if (step === 4 && S.action === 'scripts' && !sgServicesLoaded) sgLoadServices();
  // Siempre se recarga (no solo la primera vez): si el usuario vuelve atras
  // y cambia de conexion/ambiente, la lista vieja en memoria quedaria stale.
  if (step === 4 && S.action === 'sdtgen') sdtgenLoadList();
  if (step === 5 && S.action === 'sdtgen') sdtgenRenderEditor();
  if (step === 6 && S.action === 'sdtgen') sdtgenDoGenerate();
  if (step === 4 && S.action === 'paramgen') {
    if (!pgServicesLoaded) pgLoadServices();
    pgLoadSdtOptions(); // catalogo de SDT: lo necesita tanto el buscador (modo SDT) como los campos "SDT"/"SDT del Ítem" (modo metodo)
  }
  if (step === 5 && S.action === 'paramgen') { pgTargetMode === 'sdt' ? pgRenderSdtEditor() : pgRenderEditor(); }
  if (step === 6 && S.action === 'paramgen') {
    var sub = document.getElementById('pg-result-sub');
    if (pgTargetMode === 'sdt') {
      if (sub) sub.textContent = 'Copiá el script o ejecutalo directo contra la conexión activa (UPDATE de los campos existentes y DELETE de los que se quitaron, sobre BTI026).';
      pgDoGenerateSdtFields();
    } else {
      if (sub) sub.textContent = 'Copiá el script o ejecutalo directo contra la conexión activa (UPDATE de los parámetros existentes, INSERT de los nuevos y DELETE de los que se quitaron, sobre BTI019).';
      pgDoGenerate();
    }
  }
}

function foot(step) {
  var back = document.getElementById('btn-back');
  back.style.display = step > 1 ? 'flex' : 'none';
  var ftr = document.getElementById('ft-r');
  if (step === 1) { // versión
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (versionReady() ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 2) { // conexión
    ftr.innerHTML = '<button class="btn btn-outline" id="btn-test" onclick="testConn()">Probar conexión</button>&nbsp;&nbsp;' +
      '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (connReady() ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 3) { // acción
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (actionReady() ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 4 && S.action === 'validate') {
    ftr.innerHTML = '';
  } else if (step === 5 && S.action === 'collections') {
    ftr.innerHTML = '';
  } else if (step === 4 && S.action === 'scripts') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()" disabled>Generar script &#8594;</button>';
  } else if (step === 4 && S.action === 'doc') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (items.length ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 4 && S.action === 'sdtgen') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (sdtgenSelectedName ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 5 && S.action === 'doc') {
    ftr.innerHTML = '<button class="btn btn-success" id="btn-save" onclick="saveEnv()">Guardar y finalizar &#10003;</button>';
  } else if (step === 5 && S.action === 'scripts') {
    ftr.innerHTML = '<button class="btn btn-ghost" onclick="sgReset()">&#8635; Nuevo script</button>';
  } else if (step === 5 && S.action === 'sdtgen') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()">Siguiente &#8594;</button>';
  } else if (step === 6 && S.action === 'sdtgen') {
    ftr.innerHTML = '<button class="btn btn-ghost" onclick="sdtgenReset()">&#8635; Nueva copia</button>';
  } else if (step === 4 && S.action === 'paramgen') {
    var pgReady = pgTargetMode === 'sdt' ? !!pgSelectedSdtName : !!pgSelectedMethod;
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()"' + (pgReady ? '' : ' disabled') + '>Siguiente &#8594;</button>';
  } else if (step === 5 && S.action === 'paramgen') {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()">Siguiente &#8594;</button>';
  } else if (step === 6 && S.action === 'paramgen') {
    ftr.innerHTML = '<button class="btn btn-ghost" onclick="pgReset()">&#8635; ' + (pgTargetMode === 'sdt' ? 'Editar otro SDT' : 'Editar otro método') + '</button>';
  } else if (step === 6) {
    ftr.innerHTML = '';
  } else {
    ftr.innerHTML = '<button class="btn btn-primary" id="btn-next" onclick="goNext()">Siguiente &#8594;</button>';
  }
}

async function goNext() {
  if (sdtEnvCaptureActive) { sdtEnvCaptureNext(); return; }
  var s = S.step;
  if (s === 1) { if (!versionReady()) return; show(2); return; }
  if (s === 2) { if (!connReady()) return; show(3); return; }
  if (s === 3) {
    if (!actionReady()) return;
    if (S.action === 'sdtgen') { sdtgenEnterOrCapture(); return; }
    show(4);
    return;
  }
  if (s === 4 && S.action === 'collections') { show(5); return; }
  if (s === 4 && S.action === 'scripts') {
    var grps = sgServiceGroups.filter(function(g) { return g.selected.size > 0; });
    if (!grps.length) { alert('Seleccioná al menos un método.'); return; }
    sgFetchAndShowOutput(grps);
    return;
  }
  if (s === 4 && S.action === 'doc') { await validateDocItems(); return; }
  if (s === 4 && S.action === 'sdtgen') { sdtgenGoToEdit(); return; }
  if (s === 5 && S.action === 'sdtgen') { sdtgenGoToResult(); return; }
  if (s === 4 && S.action === 'paramgen') { pgGoToEdit(); return; }
  if (s === 5 && S.action === 'paramgen') { pgGoToResult(); return; }
  if (s < 6) show(s + 1);
}

function goBack() {
  if (sdtEnvCaptureActive) { sdtEnvCaptureCancel(); return; }
  var s = S.step;
  if (s > 1) show(s - 1);
}

// ── Conexión (paso 2) ──────────────────────────────────────────

async function tryLoadEnv(version) {
  loadedEnv = null;
  try {
    var r = await fetch('/api/load-env', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ version: version }) });
    var d = await r.json();
    if (!d.ok) return;
    // La respuesta puede llegar despues de que el usuario cambio (o limpio) la
    // version elegida: en ese caso el resultado ya no aplica.
    if (S.version !== version) return;
    loadedEnv = d.data;
    if (d.data.DB_CONNECT_STRING) S.platform = 'oracle';
    else if (d.data.DB_SERVER) S.platform = 'sqlserver';
  } catch(e) {}
}

function clearDbFields() {
  _activeDbHistEntry = null;
  setVal('db-conn-name', '');
  setVal('db-server', ''); setVal('db-port', '1433'); setVal('db-name', '');
  setVal('db-user-s', ''); setVal('db-pass-s', '');
  setVal('db-host', ''); setVal('db-port-o', '1521'); setVal('db-service', '');
  setVal('db-user-o', ''); setVal('db-pass-o', '');
}

// Forma "cruda" de los campos de conexion, tal cual se tipean en el DOM
// (independiente de la forma que despues arman getDb()/getDbSG() para cada
// endpoint). Es lo que se guarda en S.activeEnv/S.sdtEnv y en localStorage.
function readFieldsFromDom(platform) {
  if (platform === 'sqlserver') {
    return { server: v('db-server'), port: v('db-port') || '1433', database: v('db-name'), user: v('db-user-s'), password: vp('db-pass-s') };
  }
  return { host: v('db-host'), port: v('db-port-o') || '1521', service: v('db-service'), user: v('db-user-o'), password: vp('db-pass-o') };
}

function applyFieldsToDom(platform, f) {
  f = f || {};
  if (platform === 'sqlserver') {
    setVal('db-server', f.server || ''); setVal('db-port', f.port || '1433'); setVal('db-name', f.database || '');
    setVal('db-user-s', f.user || ''); setVal('db-pass-s', f.password || '');
  } else {
    setVal('db-host', f.host || ''); setVal('db-port-o', f.port || '1521'); setVal('db-service', f.service || '');
    setVal('db-user-o', f.user || ''); setVal('db-pass-o', f.password || '');
  }
}

// ── Ambiente activo (persistencia + shapes para los endpoints) ────────────

function saveActiveEnvToStorage() {
  try { localStorage.setItem(ACTIVE_ENV_STORAGE_KEY, JSON.stringify(S.activeEnv)); } catch (e) {}
}

function loadActiveEnvFromStorage() {
  try { return JSON.parse(localStorage.getItem(ACTIVE_ENV_STORAGE_KEY) || 'null'); } catch (e) { return null; }
}

// Campos "efectivos" para la conexion actual: la de Generar SDT si esta
// activa una conexion especifica para esa herramienta (S.sdtEnv, ver
// sdtgenEnterOrCapture), o si no el ambiente global activo.
function effectiveFields() {
  if (S.action === 'sdtgen' && S.sdtEnv) return S.sdtEnv.fields || {};
  return (S.activeEnv && S.activeEnv.fields) || {};
}

function shapeDbApi(platform, f) {
  f = f || {};
  if (platform === 'sqlserver') return { DB_SERVER: f.server || '', DB_PORT: f.port || '1433', DB_DATABASE: f.database || '', DB_USER: f.user || '', DB_PASSWORD: f.password || '' };
  return { DB_USER: f.user || '', DB_PASSWORD: f.password || '', DB_CONNECT_STRING: (f.host || '') + ':' + (f.port || '1521') + '/' + (f.service || '') };
}

function shapeDbSG(platform, f) {
  f = f || {};
  if (platform === 'sqlserver') return { server: f.server || '', port: f.port || '1433', database: f.database || '', user: f.user || '', password: f.password || '' };
  return { user: f.user || '', password: f.password || '', connectString: (f.host || '') + ':' + (f.port || '1521') + '/' + (f.service || '') };
}

function fillDbFields() {
  if (!loadedEnv) return;
  if (S.platform === 'sqlserver') {
    setVal('db-server', loadedEnv.DB_SERVER);
    setVal('db-port', loadedEnv.DB_PORT || '1433');
    setVal('db-name', loadedEnv.DB_DATABASE);
    setVal('db-user-s', loadedEnv.DB_USER);
    setVal('db-pass-s', loadedEnv.DB_PASSWORD);
  } else {
    var _cs = parseConnectString(loadedEnv.DB_CONNECT_STRING);
    setVal('db-host', _cs.host); setVal('db-port-o', _cs.port); setVal('db-service', _cs.service);
    setVal('db-user-o', loadedEnv.DB_USER);
    setVal('db-pass-o', loadedEnv.DB_PASSWORD);
  }
  scheduleConnTest();
}

var _lastAutoBase = '';
var _lastAutoAuth = '';

function _rtrim(s) { s = s || ''; return s.charAt(s.length - 1) === '/' ? s.slice(0, -1) : s; }

function onApiUrlInput() {
  var apiUrl = _rtrim((v('a-api') || '').trim());
  if (!apiUrl) { _setApiHints('', ''); return; }
  if (S.version === 'V3') {
    var curAuth = v('a-auth');
    var autoAuth = apiUrl + '/servlet/com.dlya.bantotal.ardwsbt_Authenticate_v1';
    if (!curAuth || curAuth === _lastAutoAuth) { setVal('a-auth', autoAuth); _lastAutoAuth = autoAuth; }
  }
  _setApiHints(apiUrl, v('a-base'));
}

function _setApiHints(apiUrl, baseUrl) {
  var hapi  = document.getElementById('a-api-hint');
  var hbase = document.getElementById('a-base-hint');
  var a = _rtrim(apiUrl  || '');
  var b = _rtrim(baseUrl || '');
  if (S.version === 'V4') {
    if (hapi) hapi.textContent = '';
    if (hbase) hbase.textContent = b
      ? 'Autenticacion: ' + b + '/Authenticate/v1/Execute  |  Servicios: ' + b + '/public/{Servicio}/v1/{Metodo}'
      : '';
  } else {
    if (hapi) hapi.textContent = a ? 'Ej de llamada: ' + a + '/servlet/com.dlya.bantotal.ardwsbt_{Servicio}?{Metodo}' : '';
    if (hbase) hbase.textContent = b
      ? 'Ej en docs: ' + b + '/btdeveloper/servlet/com.dlya.bantotal.odwsbt_{Servicio}_v1?{Metodo}'
      : '';
  }
}

// La config de API se busca primero en la conexion activa del historial
// (atada a la BD + al apiMode: publica e interna apuntan a Swagger/paginas
// distintas), y si esa conexion todavia no tiene nada guardado para este
// apiMode, cae al .env legado por version (loadedEnv, comportamiento previo).
function _apiFieldsSource() {
  var mode = S.apiMode || 'publica';
  if (_activeDbHistEntry && _activeDbHistEntry.api && _activeDbHistEntry.api[mode]) return _activeDbHistEntry.api[mode];
  return loadedEnv || {};
}

function fillApiFields() {
  var src = _apiFieldsSource();
  // setVal no toca el campo si el valor es null/undefined (ver su
  // definicion), asi que hay que pasar '' explicito para limpiarlo cuando
  // la fuente no tiene el dato — si no, queda el valor viejo pegado.
  setVal('a-base', src.BASE_URL || '');
  setVal('a-api',  src.API_BASE_URL || '');
  setVal('a-auth', src.API_AUTH_URL || '');
  setVal('a-user', src.API_USER || '');
  setVal('a-pass', src.API_PASSWORD || '');
  setVal('a-canal',        src.API_CANAL || '');
  setVal('a-device',       src.API_DEVICE || '');
  setVal('a-requerimiento',src.API_REQUERIMIENTO || '');
  _lastAutoBase = src.BASE_URL || '';
  _lastAutoAuth = src.API_AUTH_URL || '';
  var cb = document.getElementById('cb-doc-errores');
  if (src.DOC_ERRORES_MODELOS) {
    if (cb) { cb.checked = true; toggleDocErrores(); }
    setVal('doc-errores-modelos', src.DOC_ERRORES_MODELOS);
  } else {
    if (cb) { cb.checked = false; toggleDocErrores(); }
    setVal('doc-errores-modelos', '');
  }
  _setApiHints(src.API_BASE_URL || '', src.BASE_URL || '');
}

function allConnFilled() {
  if (S.platform === 'sqlserver') return !!(v('db-server') && v('db-name') && v('db-user-s') && vp('db-pass-s'));
  return !!(v('db-host') && v('db-user-o') && vp('db-pass-o') && v('db-service'));
}

function setupConnWatchers() {
  var ids = S.platform === 'sqlserver' ? ['db-server','db-port','db-name','db-user-s','db-pass-s'] : ['db-host','db-port-o','db-user-o','db-pass-o','db-service'];
  ids.forEach(function(id) {
    var el = document.getElementById(id); if (!el) return;
    el.removeEventListener('input', scheduleConnTest);
    el.addEventListener('input', scheduleConnTest);
  });
  if (allConnFilled()) scheduleConnTest();
}

function scheduleConnTest() {
  var res = document.getElementById('cres'); if (res) res.className = 'cres';
  _connOk = false; updateConnBtn();
  if (!allConnFilled()) return;
  clearTimeout(_connTimer); _connTimer = setTimeout(runAutoConnTest, 700);
}

// ── Historial de conexiones ───────────────────────────────────

async function loadDbHistory() {
  var err = document.getElementById('db-hist-err');
  if (err) { err.className = 'cres'; err.textContent = ''; }
  try {
    var r = await fetch('/sg/api/db-history', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action: 'list' }) });
    var d = await r.json();
    if (d.ok) {
      _dbHistory = d.history || [];
      renderDbHistory();
    } else if (err) {
      err.className = 'cres show err';
      err.textContent = 'No se pudieron cargar las conexiones guardadas: ' + (d.message || 'error desconocido');
    }
  } catch(e) {
    if (err) { err.className = 'cres show err'; err.textContent = 'No se pudo conectar con el servidor para cargar las conexiones guardadas.'; }
  }
}

function renderDbHistory() {
  var wrap = document.getElementById('db-hist-wrap');
  var sel = document.getElementById('db-hist-sel');
  if (!sel || !wrap) return;
  var filtered = _dbHistory.filter(function(e) { return e.version === S.version; });
  sel.innerHTML = '<option value="">-- Nueva conexión --</option>';
  filtered.forEach(function(e) {
    var opt = document.createElement('option'); opt.value = e.id; opt.textContent = e.label; sel.appendChild(opt);
  });
  wrap.style.display = filtered.length ? '' : 'none';
  var del = document.getElementById('db-hist-del'); if (del) del.disabled = true;
}

function loadDbHistEntry() {
  var sel = document.getElementById('db-hist-sel'); if (!sel) return;
  var del = document.getElementById('db-hist-del'); if (del) del.disabled = !sel.value;
  if (!sel.value) { _activeDbHistEntry = null; setVal('db-conn-name', ''); return; }
  var entry = _dbHistory.find(function(e) { return e.id === sel.value; }); if (!entry) return;
  _activeDbHistEntry = entry;
  setVal('db-conn-name', entry.label || '');
  if (entry.platform === 'sqlserver') {
    setVal('db-server', entry.db.server || ''); setVal('db-port', entry.db.port || '1433');
    setVal('db-name', entry.db.database || ''); setVal('db-user-s', entry.db.user || '');
    setVal('db-pass-s', entry.db.password || '');
  } else {
    var _cs2 = parseConnectString(entry.db.connectString || '');
    setVal('db-host', _cs2.host); setVal('db-port-o', _cs2.port); setVal('db-service', _cs2.service);
    setVal('db-user-o', entry.db.user || ''); setVal('db-pass-o', entry.db.password || '');
  }
  scheduleConnTest();
}

async function deleteDbHistEntry() {
  var sel = document.getElementById('db-hist-sel'); if (!sel || !sel.value) return;
  var id = sel.value;
  try {
    await fetch('/sg/api/db-history', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action: 'delete', id: id }) });
    _dbHistory = _dbHistory.filter(function(e) { return e.id !== id; });
    renderDbHistory();
  } catch(e) {}
}

async function saveDbHistEntry() {
  if (!allConnFilled()) return;
  var db = domDbShapeSG();
  var customName = v('db-conn-name');
  var autoLabel = S.platform === 'sqlserver'
    ? (v('db-name') || v('db-server')) + ' · ' + (v('db-server') || '') + ' (SQL Server)'
    : v('db-host') + ':' + (v('db-port-o')||'1521') + '/' + v('db-service') + ' (Oracle)';
  var label = customName || autoLabel;
  try {
    var r = await fetch('/sg/api/db-history', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action: 'save', version: S.version, platform: S.platform, label: label, db: db }) });
    var d = await r.json();
    if (d.ok) {
      await loadDbHistory();
      var sel = document.getElementById('db-hist-sel'); if (sel && d.id) { sel.value = d.id; var del = document.getElementById('db-hist-del'); if (del) del.disabled = false; }
      if (d.id) _activeDbHistEntry = _dbHistory.find(function(e) { return e.id === d.id; }) || null;
    }
  } catch(e) {}
}

async function saveConnName() {
  if (!allConnFilled()) { showConnNameRes('Completá los datos de conexión primero.', false); return; }
  var fb = document.getElementById('conn-name-res');
  if (fb) { fb.style.display = ''; fb.style.color = 'var(--muted)'; fb.textContent = 'Guardando...'; }
  await saveDbHistEntry();
  showConnNameRes('Nombre guardado.', true);
}

function showConnNameRes(msg, ok) {
  var fb = document.getElementById('conn-name-res');
  if (!fb) return;
  fb.style.display = '';
  fb.style.color = ok ? 'var(--success)' : 'var(--danger)';
  fb.textContent = msg;
  setTimeout(function() { if (fb) fb.style.display = 'none'; }, 2500);
}

async function runAutoConnTest() {
  var res = document.getElementById('cres'); if (!res) return;
  res.className = 'cres show'; res.style.color = 'var(--muted)';
  res.innerHTML = '<span class="spin dk"></span>&nbsp;Conectando...';
  try {
    var r = await fetch('/api/test', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: domDbShape() }) });
    var d = await r.json(); res.style.color = '';
    res.className = 'cres show ' + (d.ok ? 'ok' : 'err');
    res.textContent = d.ok ? 'Conexión exitosa ✓' : d.message;
    _connOk = d.ok;
    if (d.ok) {
      sgServiceGroups = []; allServices = []; sgServicesLoaded = false;
      saveDbHistEntry();
      // La conexion de Generar SDT (cuando el ambiente global no es V4/Oracle)
      // es un caso aparte: no se confirma sola como ambiente global, eso lo
      // decide el usuario en sdtEnvCaptureNext() via confirm().
      if (!sdtEnvCaptureActive) commitActiveEnv();
    }
  } catch(e) { res.style.color = ''; res.className = 'cres show err'; res.textContent = 'No se pudo conectar'; _connOk = false; }
  updateConnBtn();
}

async function testConn() {
  var btn = document.getElementById('btn-test');
  if (btn) { btn.innerHTML = '<span class="spin"></span>&nbsp;Probando...'; btn.disabled = true; }
  await runAutoConnTest();
  if (btn) { btn.innerHTML = 'Probar conexión'; btn.disabled = false; }
}

// El paso de conexion se completa con la prueba OK (el toggle de API de
// Generar SDT ahora se elige en el paso de Acción, no acá).
function connReady() {
  return _connOk;
}

function updateConnBtn() {
  if (sdtEnvCaptureActive || S.step === 2) {
    var btn = document.getElementById('btn-next');
    if (btn) btn.disabled = !_connOk;
  }
}

// Confirma los datos tipeados en el paso de Conexión como el ambiente activo
// global: a partir de aca todas las herramientas usan esta conexion sin
// volver a pedirla (ver getDb()/getDbSG() / effectiveFields()).
function commitActiveEnv() {
  S.activeEnv = {
    version: S.version,
    platform: S.platform,
    engine: S.engine,
    connName: v('db-conn-name') || (_activeDbHistEntry && _activeDbHistEntry.label) || '',
    fields: readFieldsFromDom(S.platform)
  };
  saveActiveEnvToStorage();
  renderEnvChip();
}

// ── Chip de ambiente activo (navbar) ──────────────────────────

function renderEnvChip() {
  var chip = document.getElementById('env-chip');
  if (!chip) return;
  if (!S.activeEnv) { chip.style.display = 'none'; return; }
  var e = S.activeEnv;
  var host = e.platform === 'sqlserver' ? (e.fields.server || '') : (e.fields.host || '');
  var label = (e.connName && e.connName.trim()) || host;
  var txt = chip.querySelector('.env-chip-txt');
  if (txt) txt.textContent = e.version + ' · ' + (e.platform === 'sqlserver' ? 'SQL Server' : 'Oracle') + (label ? ' · ' + label : '');
  chip.style.display = 'flex';
}

// Marca las tarjetas de version/motor del paso 1 segun S.version/S.engine
// (usado al reabrir ese paso: reconexion automatica fallida o cambio de
// ambiente explicito desde el chip del navbar).
function markVersionCardsFromS() {
  var p1 = document.getElementById('p1');
  if (!p1) return;
  p1.querySelectorAll('.ccard').forEach(function(c) { c.classList.remove('sel'); });
  if (!S.version) { var engSec = document.getElementById('engine-section'); if (engSec) engSec.style.display = 'none'; return; }
  var verCard = p1.querySelector('.ccard[onclick="pick(\'version\',\'' + S.version + '\',this)"]');
  if (verCard) verCard.classList.add('sel');
  var engSec = document.getElementById('engine-section');
  if (S.version === 'V4') {
    if (engSec) engSec.style.display = 'block';
    if (S.engine) {
      var engCard = document.getElementById('engine-' + S.engine);
      if (engCard) engCard.classList.add('sel');
    }
  } else if (engSec) {
    engSec.style.display = 'none';
  }
}

// Reabre el paso de Ambiente (version + conexión) para cambiarlo, con los
// valores del ambiente activo precargados para editar. No se pierde nada de
// forma destructiva: si hay una herramienta en curso se confirma antes.
function openEnvSwitcher() {
  if (S.action && !confirm('Vas a cambiar de ambiente. Esto reinicia la herramienta que tenías abierta (la conexión y el ambiente elegidos se mantienen hasta que confirmes uno nuevo). ¿Continuar?')) return;
  if (sdtEnvCaptureActive) sdtEnvCaptureExit(); // no dejar la conexion especial de sdtgen a medio armar
  S.action = null;
  S.sdtEnv = null;
  sgInvalidateState();
  pgInvalidateState();
  if (S.activeEnv) {
    S.version = S.activeEnv.version;
    S.platform = S.activeEnv.platform;
    S.engine = S.activeEnv.engine;
    applyFieldsToDom(S.platform, S.activeEnv.fields);
    setVal('db-conn-name', S.activeEnv.connName || '');
  }
  show(1);
}

// ── Reconexión automática al último ambiente activo (localStorage) ───────

function findMatchingHistEntry(saved) {
  if (!saved || !_dbHistory) return null;
  return _dbHistory.find(function(e) {
    if (e.version !== saved.version || e.platform !== saved.platform) return false;
    var f = saved.fields || {}, d = e.db || {};
    if (saved.platform === 'sqlserver') return d.server === f.server && d.database === f.database && d.user === f.user;
    var cs = (f.host || '') + ':' + (f.port || '1521') + '/' + (f.service || '');
    return (d.connectString || '') === cs && d.user === f.user;
  }) || null;
}

async function initWizard() {
  var saved = loadActiveEnvFromStorage();
  if (!saved || !saved.fields || !saved.version || !saved.platform) { show(1); return; }
  var testResult;
  try {
    var r = await fetch('/api/test', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: saved.platform, db: shapeDbApi(saved.platform, saved.fields) }) });
    testResult = await r.json();
  } catch (e) {
    testResult = { ok: false, message: 'No se pudo conectar con el servidor para validar el último ambiente guardado.' };
  }
  S.version = saved.version; S.platform = saved.platform; S.engine = saved.engine;
  applyFieldsToDom(saved.platform, saved.fields);
  setVal('db-conn-name', saved.connName || '');
  if (testResult.ok) {
    _connOk = true;
    S.activeEnv = saved;
    try { await loadDbHistory(); var m = findMatchingHistEntry(saved); if (m) _activeDbHistEntry = m; } catch (e) {}
    renderEnvChip();
    show(3); // ambiente ya activo: directo a elegir herramienta
  } else {
    _connOk = false;
    _pendingReconnectError = 'No se pudo reconectar automáticamente al último ambiente activo: ' + (testResult.message || 'error desconocido') + '. Revisá los datos.';
    show(2); // ir directo a Conexión: ahí vive el banner de error y los campos a corregir
  }
}

// Guard: en el sandbox de los gate tests (wizard-doc.test.js) `document` es un
// mock minimo sin addEventListener; evita que cargar el archivo reviente ahi.
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('DOMContentLoaded', initWizard);
}

// ── Generar SDT: conexión V4/Oracle dedicada (si el ambiente global no lo es)

// Al elegir Generar SDT: si el ambiente activo global ya es V4/Oracle, se usa
// directo (S.sdtEnv queda null → effectiveFields() cae al ambiente global).
// Si no, se pide una conexión V4/Oracle aparte SOLO para esta herramienta,
// sin tocar el ambiente global salvo que el usuario lo confirme al final.
function sdtgenEnterOrCapture() {
  if (S.activeEnv && S.activeEnv.platform === 'oracle') {
    S.sdtEnv = null;
    S.version = 'V4'; S.platform = 'oracle'; S.engine = 'oracle';
    show(4);
    return;
  }
  S.version = 'V4'; S.platform = 'oracle'; S.engine = 'oracle';
  sdtEnvCaptureActive = true;
  clearDbFields();
  tryLoadEnv('V4');
  document.getElementById('sql-fields').style.display = 'none';
  document.getElementById('ora-fields').style.display = 'block';
  var t = document.querySelector('#p2 .ptitle'), sub = document.querySelector('#p2 .psub');
  if (t && _p2OrigTitle === null) _p2OrigTitle = t.textContent;
  if (sub && _p2OrigSub === null) _p2OrigSub = sub.textContent;
  if (t) t.textContent = 'Conexión para Generar SDT (V4 / Oracle)';
  if (sub) sub.textContent = 'Generar SDT solo trabaja contra V4/Oracle y tu ambiente activo es distinto. Conectate acá solo para esta herramienta — no se reemplaza tu ambiente global salvo que lo confirmes.';
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('p2').classList.add('active');
  _connOk = false;
  var res = document.getElementById('cres'); if (res) res.className = 'cres';
  loadDbHistory();
  setTimeout(setupConnWatchers, 0);
  document.getElementById('btn-back').style.display = 'flex';
  var ftr = document.getElementById('ft-r');
  ftr.innerHTML = '<button class="btn btn-outline" id="btn-test" onclick="testConn()">Probar conexión</button>&nbsp;&nbsp;' +
    '<button class="btn btn-primary" id="btn-next" onclick="goNext()" disabled>Usar esta conexión &#8594;</button>';
}

function sdtEnvCaptureNext() {
  if (!_connOk) return;
  S.sdtEnv = { version: 'V4', platform: 'oracle', engine: 'oracle', connName: v('db-conn-name') || '', fields: readFieldsFromDom('oracle') };
  var promote = confirm('¿Usar esta conexión también como ambiente global (se va a usar en todas las herramientas)?');
  if (promote) {
    S.activeEnv = Object.assign({}, S.sdtEnv);
    S.sdtEnv = null;
    saveActiveEnvToStorage();
    renderEnvChip();
  }
  sdtEnvCaptureExit();
  show(4);
}

function sdtEnvCaptureCancel() {
  S.action = null;
  sdtEnvCaptureExit();
  show(3);
}

function sdtEnvCaptureExit() {
  sdtEnvCaptureActive = false;
  var t = document.querySelector('#p2 .ptitle'), sub = document.querySelector('#p2 .psub');
  if (t && _p2OrigTitle !== null) { t.textContent = _p2OrigTitle; }
  if (sub && _p2OrigSub !== null) { sub.textContent = _p2OrigSub; }
}

// ── Paso 4 Doc: API ────────────────────────────────────────────

function toggleDocErrores() {
  var cb = document.getElementById('cb-doc-errores');
  var fields = document.getElementById('doc-errores-fields');
  if (fields) fields.style.display = cb && cb.checked ? 'block' : 'none';
}

async function testAuth() {
  var btn = document.getElementById('btn-test-api');
  var res = document.getElementById('ares');
  btn.innerHTML = '<span class="spin dk"></span>&nbsp;Probando...';
  btn.disabled = true;
  res.className = 'cres';
  try {
    var r = await fetch('/api/test-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: S.version, api: getApi() })
    });
    var d = await r.json();
    res.className = 'cres show ' + (d.ok ? 'ok' : 'err');
    res.textContent = d.ok ? 'Autenticacion exitosa — token obtenido correctamente' : ('Error: ' + d.message);
    if (d.ok) await saveApiToActiveEntry();
  } catch(e) {
    res.className = 'cres show err';
    res.textContent = 'Error al conectar con el servidor de setup';
  }
  btn.innerHTML = 'Probar autenticacion';
  btn.disabled = false;
}

// Ata la config de API recien probada a la conexion activa (misma logica
// que el auto-guardado de datos de conexion en runAutoConnTest), separada
// por apiMode. Si por algun motivo no hay conexion activa (no deberia
// pasar: se llega a este paso siempre despues de conectar), no hay contra
// que atarla y no se guarda nada.
async function saveApiToActiveEntry() {
  if (!_activeDbHistEntry) return;
  var mode = S.apiMode || 'publica';
  var api = getApi();
  try {
    await fetch('/sg/api/db-history', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action: 'save-api', id: _activeDbHistEntry.id, apiMode: mode, api: api }) });
    _activeDbHistEntry.api = Object.assign({}, _activeDbHistEntry.api || {}, { [mode]: api });
  } catch(e) {}
}


async function loadServices() {
  var area = document.getElementById('svc-load-area');
  var err  = document.getElementById('svc-err');
  err.className = 'cres';
  area.innerHTML = '<div style="font-size:var(--fs-sm);color:var(--muted);padding:4px 0"><span class="spin dk"></span>&nbsp;Cargando servicios...</div>';
  document.getElementById('svc-picker').style.display = 'none';
  try {
    var r = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: S.platform, db: getDb() })
    });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    allServices = d.services;
    var filterEl = document.getElementById('svc-filter');
    if (filterEl && !filterEl.value) filterEl.value = S.version === 'V3' ? 'BT' : 'Public';
    filterServices();
    document.getElementById('svc-picker').style.display = 'block';
    area.innerHTML = '';
  } catch(e) {
    area.innerHTML = '';
    err.className = 'cres show err';
    err.textContent = e.message;
  }
}

function filterServices() {
  var filter = (document.getElementById('svc-filter').value || '').toLowerCase();
  var sel = document.getElementById('sel-svc');
  var prev = sel.value;
  sel.innerHTML = '<option value="">-- Seleccionar --</option>';
  allServices.filter(function(s) {
    return !filter || s.toLowerCase().startsWith(filter);
  }).forEach(function(s) {
    var opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    if (s === prev) opt.selected = true;
    sel.appendChild(opt);
  });
  if (prev && sel.value !== prev) {
    document.getElementById('sel-mtd').innerHTML = '<option value="">-- Seleccionar --</option>';
  }
}

async function loadMethods(service) {
  var sel = document.getElementById('sel-mtd');
  sel.innerHTML = '<option value="">Cargando...</option>';
  if (!service) {
    sel.innerHTML = '<option value="">-- Seleccionar metodo --</option>';
    return;
  }
  try {
    var r = await fetch('/api/methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: S.platform, db: getDb(), service: service })
    });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    sel.innerHTML = '<option value="__all__">Todos los metodos (' + d.methods.length + ')</option>';
    d.methods.forEach(function(m) {
      var opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      sel.appendChild(opt);
    });
    sel.value = '__all__';
  } catch(e) {
    sel.innerHTML = '<option value="">Error al cargar</option>';
  }
}

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

async function renderList() {
  var el = document.getElementById('svc-list');
  if (!items.length) { el.innerHTML = ''; return; }
  var rows = items.map(function(item, i) {
    var label = item.method === '__all__' ? 'Todos los metodos' : item.method;
    var border = i > 0 ? 'border-top:1px solid var(--border)' : '';
    var badge = item.method !== '__all__'
      ? '<div id="svc-badge-' + i + '" style="font-size:var(--fs-sm);margin-top:var(--sp-1)"><span class="spin dk"></span></div>'
      : '';
    return '<div class="svc-row" style="' + border + '">' +
      '<span><strong>' + item.service + '</strong><span class="svc-mtd">/ ' + label + '</span>' + badge + '</span>' +
      '<button class="svc-rm" onclick="removeItem(' + i + ')">&#10005;</button>' +
      '</div>';
  });
  el.innerHTML = '<div class="svc-wrap">' + rows.join('') + '</div>';

  var checkItems = items
    .map(function(item, i) { return { i: i, service: item.service, method: item.method }; })
    .filter(function(x) { return x.method !== '__all__'; });
  if (!checkItems.length || !S || !S.version) return;

  try {
    var r = await fetch('/api/check-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: S.version, items: checkItems.map(function(x) { return { service: x.service, method: x.method }; }) })
    });
    var d = await r.json();
    if (!d.ok) return;
    d.results.forEach(function(res, ri) {
      var idx = checkItems[ri].i;
      var badgeEl = document.getElementById('svc-badge-' + idx);
      if (!badgeEl) return;
      if (res.exists) {
        var dt = new Date(res.mtime);
        var fmt = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        badgeEl.innerHTML = '<span style="color:var(--green);font-weight:500">&#10003; Generado</span> <span style="color:var(--muted)">' + fmt + '</span>';
      } else {
        badgeEl.innerHTML = '<span style="color:var(--muted)">&#9679; No generado aun</span>';
      }
    });
  } catch(e) {}
}

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

function buildWorkflowCard(service, workflow, uncovered) {
  var steps = workflow.steps || [];
  var total = steps.length;

  // Deduplicate all uncovered params across steps into one global list
  var globalParams = [];
  var seenGlobal = new Set();
  if (uncovered) {
    uncovered.forEach(function(stepUnc) {
      (stepUnc || []).forEach(function(p) {
        if (!seenGlobal.has(p.name)) { seenGlobal.add(p.name); globalParams.push(p); }
      });
    });
  }

  var html = '<div class="param-card">';
  html += '<div class="param-card-hd" style="display:flex;justify-content:space-between;align-items:center">';
  html += '<span>' + service + ' &mdash; ' + total + ' pasos</span>';
  html += '<span style="font-size:var(--fs-sm);font-weight:400;color:var(--muted)">Arrastra para reordenar</span>';
  html += '</div>';

  // Global params block (only shown after confirming order)
  if (globalParams.length) {
    html += '<div class="wf-global-params" ondragstart="return false">';
    html += '<div style="font-size:var(--fs-sm);font-weight:600;color:var(--blue);margin-bottom:var(--sp-2)">Parametros de entrada del workflow:</div>';
    globalParams.forEach(function(p) {
      var fid = 'wfg-' + service + '-' + p.name;
      html += '<div style="display:flex;align-items:flex-start;gap:var(--sp-2);margin-bottom:var(--sp-2)">';
      html += '<label style="min-width:130px;font-size:var(--fs-sm);font-weight:500;flex-shrink:0;padding-top:5px">' + p.name;
      if (p.type) html += '<div style="font-size:var(--fs-sm);font-weight:400;color:var(--muted)">' + p.type + '</div>';
      html += '</label>';
      if (p.isComplex) {
        var lines = p.example ? Math.min(p.example.split('\\n').length, 12) : 3;
        var exVal = p.example ? p.example.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : (p.itemType ? '[]' : '{}');
        html += '<textarea id="' + fid + '" rows="' + lines + '" data-example="' + exVal + '" style="flex:1;padding:5px 8px;border:1.5px solid var(--border);border-radius:6px;font-size:var(--fs-sm);font-family:Consolas,monospace;resize:vertical;outline:none">' + exVal + '</textarea>';
      } else {
        html += '<input type="text" id="' + fid + '" placeholder="Ingresar valor..." style="flex:1;padding:5px 8px;border:1.5px solid var(--border);border-radius:6px;font-size:var(--fs-sm);font-family:inherit;outline:none">';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  html += '<div class="param-card-bd" style="padding:0" id="wf-bd-' + service + '">';
  if (!total) {
    html += '<p style="font-size:var(--fs-sm);color:var(--muted);padding:10px 12px">Sin metodos detectados.</p>';
  } else {
    steps.forEach(function(step, idx) {
      var extracts = (step.extract || []).map(function(e) { return typeof e === 'string' ? e : (e.as || ''); }).filter(Boolean);
      html += '<div class="wf-step" draggable="true" data-svc="' + service + '" data-idx="' + idx + '"' +
        ' ondragstart="wfDragStart(this)" ondragend="wfDragEnd(this)"' +
        ' ondragover="wfDragOver(event)" ondragenter="wfDragEnter(this)" ondragleave="wfDragLeave(this)" ondrop="wfDrop(event,this)"' +
        ' style="' + (idx > 0 ? 'border-top:1px solid var(--border)' : '') + '">';
      html += '<div class="wf-step-hd">';
      html += '<span class="wf-handle">&#9776;</span>';
      html += '<span style="font-size:var(--fs-sm);font-weight:700;color:var(--muted);min-width:18px;text-align:right">' + (idx + 1) + '</span>';
      html += '<div style="flex:1">';
      html += '<span style="font-size:var(--fs-sm);font-weight:600">' + step.method + '</span>';
      if (extracts.length) {
        html += '<div style="font-size:var(--fs-sm);color:var(--green);margin-top:var(--sp-1)">Extrae: ' + extracts.join(', ') + '</div>';
      }
      html += '</div>';
      html += '</div>';
      html += '</div>';
    });
  }
  html += '</div></div>';
  return html;
}

var wfDragSrc = null;

function wfDragStart(el) {
  wfDragSrc = el;
  el.classList.add('wf-dragging');
}

function wfDragEnd(el) {
  el.classList.remove('wf-dragging');
  document.querySelectorAll('.wf-step').forEach(function(s) { s.classList.remove('wf-over'); });
  wfDragSrc = null;
}

function wfDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function wfDragEnter(el) {
  if (wfDragSrc && wfDragSrc !== el && wfDragSrc.dataset.svc === el.dataset.svc) {
    el.classList.add('wf-over');
  }
}

function wfDragLeave(el) {
  el.classList.remove('wf-over');
}

async function wfDrop(e, el) {
  e.preventDefault();
  el.classList.remove('wf-over');
  if (!wfDragSrc || wfDragSrc === el) return;
  var svc = wfDragSrc.dataset.svc;
  if (el.dataset.svc !== svc) return;
  var fromIdx = parseInt(wfDragSrc.dataset.idx);
  var toIdx   = parseInt(el.dataset.idx);
  if (isNaN(fromIdx) || isNaN(toIdx)) return;
  var savedVals = {};
  if (wfConfirmed) {
    document.querySelectorAll('[id^="wfg-"]').forEach(function(inp) {
      if (inp.value) savedVals[inp.id] = inp.value;
    });
  }
  var steps = workflowData[svc].workflow.steps;
  var moved = steps.splice(fromIdx, 1)[0];
  steps.splice(toIdx, 0, moved);
  if (wfConfirmed) {
    workflowData[svc].uncovered = await computeWorkflowUncovered(svc, steps);
  }
  var html = '';
  items.forEach(function(it) {
    if (it.method === '__all__' && workflowData[it.service]) {
      html += buildWorkflowCard(it.service, workflowData[it.service].workflow, wfConfirmed ? workflowData[it.service].uncovered : null);
    }
  });
  if (!wfConfirmed) {
    html += '<button class="btn btn-outline" id="btn-confirm-wf" onclick="confirmWorkflowOrder()" style="margin-top:var(--sp-3);width:100%">Confirmar orden &#10003;</button>';
  }
  document.getElementById('params-section').innerHTML = html;
  if (wfConfirmed) {
    Object.keys(savedVals).forEach(function(id) {
      var inp = document.getElementById(id);
      if (inp) inp.value = savedVals[id];
    });
  }
}

async function confirmWorkflowOrder() {
  var btn = document.getElementById('btn-confirm-wf');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spin dk"></span>&nbsp;Analizando parametros...'; }
  for (var wi = 0; wi < items.length; wi++) {
    var wfItem = items[wi];
    if (wfItem.method !== '__all__' || !workflowData[wfItem.service]) continue;
    var uncWf = await computeWorkflowUncovered(wfItem.service, workflowData[wfItem.service].workflow.steps);
    workflowData[wfItem.service].uncovered = uncWf;
  }
  wfConfirmed = true;
  var html = '';
  items.forEach(function(it) {
    if (it.method === '__all__' && workflowData[it.service]) {
      html += buildWorkflowCard(it.service, workflowData[it.service].workflow, workflowData[it.service].uncovered);
    }
  });
  document.getElementById('params-section').innerHTML = html;
}

async function computeWorkflowUncovered(service, steps) {
  var available = new Set();
  var result = [];
  for (var i = 0; i < steps.length; i++) {
    var step = steps[i];
    var uncovered = [];
    try {
      var rp = await fetch('/api/input-params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: S.platform, db: getDb(), service: service, method: step.method })
      });
      var dp = await rp.json();
      if (dp.ok) {
        uncovered = dp.params.filter(function(p) { return !available.has(p.name); });
      }
    } catch(e) {}
    result.push(uncovered);
    if (step.extract) {
      step.extract.forEach(function(e) { available.add(typeof e === 'string' ? e : e.as); });
    }
    uncovered.forEach(function(p) { available.add(p.name); });
  }
  return result;
}

async function toggleEjecutar() {
  var enabled = document.getElementById('cb-ejecutar').checked;
  var credsWrap = document.getElementById('api-creds-wrap');
  if (credsWrap) credsWrap.style.display = enabled ? 'block' : 'none';
  var section = document.getElementById('params-section');
  if (!enabled) { section.style.display = 'none'; paramFields = {}; workflowData = {}; wfConfirmed = false; return; }
  section.style.display = 'block';
  paramFields = {};
  workflowData = {};

  var hasAll  = items.some(function(it) { return it.method === '__all__'; });
  var hasSpec = items.some(function(it) { return it.method !== '__all__'; });

  if (hasAll && hasSpec) {
    section.innerHTML = '<div class="cres show err">No se puede combinar "Todos los metodos" con metodos especificos cuando la API real esta activada. Volve al paso 5 y ajusta la seleccion.</div>';
    return;
  }

  if (hasAll) {
    section.innerHTML = '<div style="padding:6px 0;font-size:var(--fs-sm);color:var(--muted)"><span class="spin dk"></span>&nbsp;Analizando dependencias...</div>';
    var wfHtml = '';
    for (var wi = 0; wi < items.length; wi++) {
      var wfItem = items[wi];
      try {
        var wfR = await fetch('/api/analyze-workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: S.version, service: wfItem.service })
        });
        var wfD = await wfR.json();
        if (!wfD.ok) throw new Error(wfD.message || 'Error al analizar');
        workflowData[wfItem.service] = wfD;
        wfHtml += buildWorkflowCard(wfItem.service, wfD.workflow, null);
      } catch(wfE) {
        wfHtml += '<div class="param-card"><div class="param-card-hd">' + wfItem.service + '</div>' +
          '<div class="param-card-bd" style="font-size:var(--fs-sm);color:var(--red)">Error: ' + wfE.message + '</div></div>';
      }
    }
    if (wfHtml) {
      wfHtml += '<button class="btn btn-outline" id="btn-confirm-wf" onclick="confirmWorkflowOrder()" style="margin-top:var(--sp-3);width:100%">Confirmar orden &#10003;</button>';
    }
    section.innerHTML = wfHtml || '<div style="padding:6px 0;font-size:var(--fs-sm);color:var(--muted)">No hay servicios para analizar.</div>';
    return;
  }

  // Modo parametros individuales
  section.innerHTML = '<div style="padding:6px 0;font-size:var(--fs-sm);color:var(--muted)"><span class="spin dk"></span>&nbsp;Cargando parametros...</div>';
  var html = '';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    try {
      var rp = await fetch('/api/input-params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: S.platform, db: getDb(), service: item.service, method: item.method })
      });
      var dp = await rp.json();
      if (!dp.ok) throw new Error(dp.message || 'Error al consultar BD');
      if (!dp.params.length) {
        html += '<div class="param-card"><div class="param-card-hd">' + item.service + ' / ' + item.method + '</div>' +
          '<div class="param-card-bd" style="font-size:var(--fs-sm);color:var(--muted)">Sin parametros de entrada.</div></div>';
        continue;
      }
      paramFields[i] = dp.params.map(function(p) { return { name: p.name, id: 'pf-' + i + '-' + p.name, isComplex: !!p.isComplex }; });
      html += '<div class="param-card"><div class="param-card-hd">' + item.service + ' / ' + item.method + '</div><div class="param-card-bd">';
      dp.params.forEach(function(p) {
        var fid = 'pf-' + i + '-' + p.name;
        html += '<div class="param-f">';
        html += '<label>' + p.name;
        if (p.type) html += ' <span style="font-weight:400;color:var(--muted)">(' + p.type + ')</span>';
        html += '</label>';
        if (p.isComplex) {
          var lines = p.example ? Math.min(p.example.split('\\n').length, 12) : 3;
          var exVal = p.example ? p.example.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : (p.itemType ? '[]' : '{}');
          html += '<textarea id="' + fid + '" rows="' + lines + '" data-example="' + exVal + '" style="width:100%;padding:7px 10px;border:1.5px solid var(--border);border-radius:6px;font-size:var(--fs-sm);font-family:Consolas,monospace;resize:vertical;outline:none">' + exVal + '</textarea>';
        } else {
          html += '<input type="text" id="' + fid + '" placeholder="' + (p.type || 'Varchar') + '">';
        }
        html += '</div>';
      });
      html += '</div></div>';
    } catch(ep) {
      html += '<div class="param-card"><div class="param-card-hd">' + item.service + ' / ' + item.method + '</div>' +
        '<div class="param-card-bd" style="font-size:var(--fs-sm);color:var(--red)">Error: ' + ep.message + '</div></div>';
    }
  }
  section.innerHTML = html || '<div style="padding:6px 0;font-size:var(--fs-sm);color:var(--muted)">No hay parametros de entrada para los servicios seleccionados.</div>';
}

async function generateDocs() {
  var unchanged = [];
  document.querySelectorAll('textarea[data-example]').forEach(function(el) {
    if (el.value.trim() === el.getAttribute('data-example').trim()) unchanged.push(el.id);
  });
  if (unchanged.length > 0) {
    if (!confirm('Hay ' + unchanged.length + ' campo(s) SDT con valores de ejemplo sin modificar.\\nEstos valores son solo estructurales y pueden no ser validos para la API.\\n\\n¿Continuar de todas formas?')) return;
  }

  var btn = document.getElementById('btn-generate');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span>&nbsp;Generando...';
  document.getElementById('gen-hint').style.display = 'none';

  var log = document.getElementById('gen-log');
  log.style.display = 'block';
  log.innerHTML = items.map(function(item, i) {
    var label = item.method === '__all__' ? 'Todos los metodos' : item.method;
    return '<div class="gen-row" id="gen-row-' + i + '">' +
      '<span class="gen-ic" id="gen-ic-' + i + '"><span class="spin dk"></span></span>' +
      '<div class="gen-lbl" id="gen-lbl-' + i + '"><strong>' + item.service + '</strong> / ' + label +
        '<div class="gen-out" id="gen-out-' + i + '"></div>' +
      '</div>' +
      '</div>';
  }).join('');

  var cbEj = document.getElementById('cb-ejecutar');
  var ejecutar = cbEj ? cbEj.checked : false;
  var paramValues = {};
  var wfOverrides = {};
  if (ejecutar) {
    items.forEach(function(item, i) {
      if (item.method === '__all__') {
        if (workflowData[item.service]) {
          var wfCopy = JSON.parse(JSON.stringify(workflowData[item.service].workflow));
          var wfUnc = workflowData[item.service].uncovered || [];
          // Read each global param once from wfg- fields
          var globalVals = {};
          var seenG = new Set();
          wfUnc.forEach(function(stepUnc) {
            (stepUnc || []).forEach(function(p) {
              if (seenG.has(p.name)) return;
              seenG.add(p.name);
              var inp = document.getElementById('wfg-' + item.service + '-' + p.name);
              var raw = inp ? inp.value.trim() : '';
              if (!raw) return;
              if (p.isComplex) {
                try { globalVals[p.name] = JSON.parse(raw); } catch(e) { globalVals[p.name] = raw; }
              } else {
                globalVals[p.name] = raw;
              }
            });
          });
          // Inject into each step that needs the param
          wfCopy.steps.forEach(function(wfStep, wfIdx) {
            (wfUnc[wfIdx] || []).forEach(function(p) {
              if (globalVals[p.name] !== undefined) {
                wfStep.params = wfStep.params || {};
                wfStep.params[p.name] = globalVals[p.name];
              }
            });
          });
          wfOverrides[item.service] = wfCopy;
        }
      } else {
        if (!paramFields[i] || !paramFields[i].length) return;
        var vals = {};
        paramFields[i].forEach(function(f) {
          var el = document.getElementById(f.id);
          var raw = el ? el.value.trim() : '';
          if (!raw) return;
          if (f.isComplex) {
            try { vals[f.name] = JSON.parse(raw); } catch(e) { vals[f.name] = raw; }
          } else {
            vals[f.name] = raw;
          }
        });
        if (Object.keys(vals).length) paramValues[i] = vals;
      }
    });
  }

  try {
    var response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: S.version, items: items, ejecutar: ejecutar, paramValues: paramValues, wfOverrides: wfOverrides, cacheKey: docCacheKey })
    });
    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    var buf = '';
    while (true) {
      var chunk = await reader.read();
      if (chunk.done) break;
      buf += decoder.decode(chunk.value, { stream: true });
      var parts = buf.split('\n\n');
      buf = parts.pop();
      parts.forEach(function(part) {
        if (!part.startsWith('data: ')) return;
        try { handleGenEvent(JSON.parse(part.slice(6))); } catch(e) {}
      });
    }
  } catch(e) {
    log.innerHTML += '<div style="padding:10px 13px;font-size:var(--fs-sm);color:var(--red)">Error: ' + e.message + '</div>';
  }

  btn.innerHTML = 'Generar documentacion';
  btn.disabled = false;
  document.getElementById('gen-hint').style.display = 'block';
  document.getElementById('post-gen-actions').style.display = 'block';
  renderList();
}

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

function handleGenEvent(ev) {
  if (ev.type === 'result') {
    var item = items[ev.index];
    var ic  = document.getElementById('gen-ic-'  + ev.index);
    var row = document.getElementById('gen-row-' + ev.index);
    var out = document.getElementById('gen-out-' + ev.index);
    var lbl = document.getElementById('gen-lbl-' + ev.index);
    if (!ic) return;
    if (ev.code === 0) {
      ic.innerHTML = '<span style="color:var(--green)">&#10003;</span>';
      if (lbl && item) {
        if (item.method !== '__all__') {
          var fp = S.version + '/' + toFolderName(item.service) + '/' + item.method + '.md';
          lbl.insertAdjacentHTML('beforeend',
            '<br><a href="/files/' + encodeURIComponent(fp) + '" download' +
            ' style="font-size:var(--fs-sm);color:var(--blue);text-decoration:none">&#8595; Descargar .md</a>');
        } else {
          var folder = S.version + '/' + toFolderName(item.service);
          lbl.insertAdjacentHTML('beforeend',
            '<br><button data-folder="' + folder + '" onclick="openFolder(this.dataset.folder)"' +
            ' style="background:none;border:none;cursor:pointer;font-size:var(--fs-sm);color:var(--blue);padding:0">&#128193; Abrir carpeta</button>');
        }
      }
    } else {
      ic.innerHTML = '<span style="color:var(--red)">&#10005;</span>';
      if (row) row.classList.add('has-err');
      if (out && ev.output) out.textContent = ev.output.trim().slice(-400);
    }
  }
}

async function openFolder(folder) {
  try {
    await fetch('/api/open-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: folder })
    });
  } catch(e) {}
}

// ── Flujo Scripts: funciones ───────────────────────────────────

async function sgLoadServices() {
  var loading = document.getElementById('sg-svc-loading'), err = document.getElementById('sg-svc-err');
  if (err) err.className = 'cres';
  if (loading) loading.style.display = 'flex';
  try {
    var r = await fetch('/sg/api/services', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, apiMode: S.apiMode }) });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    var sel = document.getElementById('sg-sel-svc');
    sel.innerHTML = '<option value="">-- Seleccioná un servicio --</option>';
    d.services.forEach(function(s) { var o = document.createElement('option'); o.value = s; o.textContent = s; sel.appendChild(o); });
    sgServicesLoaded = true;
  } catch(e) {
    if (err) { err.className = 'cres show err'; err.textContent = e.message; }
  }
  if (loading) loading.style.display = 'none';
}

async function sgAddServiceToList() {
  var svc = document.getElementById('sg-sel-svc').value; if (!svc) return;
  var err = document.getElementById('sg-svc-err');
  if (sgServiceGroups.find(function(g) { return g.name === svc; })) {
    err.className = 'cres show err'; err.textContent = 'Ese servicio ya fue agregado.';
    setTimeout(function() { err.className = 'cres'; }, 2500); return;
  }
  err.className = 'cres';
  var container = document.getElementById('sg-service-groups');
  var div = document.createElement('div'); div.className = 'sg-svc-group';
  div.innerHTML = '<div class="sg-svc-group-hd"><span class="sg-svc-group-name">'+svc+'</span><span style="font-size:var(--fs-sm);color:var(--muted);display:flex;align-items:center;gap:var(--sp-2)"><span class="spin dk"></span> Cargando...</span></div>';
  container.appendChild(div);
  try {
    var results = await Promise.all([
      fetch('/sg/api/methods', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, service: svc, apiMode: S.apiMode }) }),
      fetch('/sg/api/service-versions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, service: svc, apiMode: S.apiMode }) }),
    ]);
    var dm = await results[0].json(), dv = await results[1].json();
    if (!dm.ok) throw new Error(dm.message);
    var versions = (dv.ok && dv.versions && dv.versions.length) ? dv.versions : ['1'];
    var group = { name: svc, version: versions[0], versions: versions, methods: dm.methods, selected: new Set(), el: div };
    sgServiceGroups.push(group);
    sgRenderServiceGroup(div, group, sgServiceGroups.length - 1);
  } catch(e) {
    div.remove();
    err.className = 'cres show err'; err.textContent = 'Error al cargar '+svc+': '+e.message;
  }
  sgUpdateNextBtn();
}

function sgRenderServiceGroup(el, group, idx) {
  el.innerHTML = '';
  var hd = document.createElement('div'); hd.className = 'sg-svc-group-hd';
  var left = document.createElement('div'); left.style.cssText = 'display:flex;align-items:center;gap:var(--sp-3)';
  var nameSpan = document.createElement('span'); nameSpan.className = 'sg-svc-group-name'; nameSpan.textContent = group.name; left.appendChild(nameSpan);
  if (group.versions.length > 1) {
    var verSel = document.createElement('select'); verSel.className = 'pinput'; verSel.style.cssText = 'width:60px;font-size:var(--fs-sm)';
    group.versions.forEach(function(ver) { var opt = document.createElement('option'); opt.value = ver; opt.textContent = ver; if (ver === group.version) opt.selected = true; verSel.appendChild(opt); });
    verSel.addEventListener('change', (function(i) { return function() { sgServiceGroups[i].version = this.value; }; })(idx));
    left.appendChild(verSel);
  } else {
    var verSpan = document.createElement('span'); verSpan.style.cssText = 'font-size:var(--fs-sm);color:var(--muted)'; verSpan.textContent = 'Ver. '+group.version; left.appendChild(verSpan);
  }
  var right = document.createElement('div'); right.style.cssText = 'display:flex;align-items:center;gap:var(--sp-2)';
  var allBtn = document.createElement('button'); allBtn.className = 'btn-pill'; allBtn.textContent = '✓ Todos';
  allBtn.addEventListener('click', (function(i) { return function() { sgSelectAllInGroup(i, true); }; })(idx));
  var noneBtn = document.createElement('button'); noneBtn.className = 'btn-pill'; noneBtn.textContent = '✗ Ninguno';
  noneBtn.addEventListener('click', (function(i) { return function() { sgSelectAllInGroup(i, false); }; })(idx));
  var rmBtn = document.createElement('button'); rmBtn.className = 'pin-rm'; rmBtn.style.fontSize = '18px'; rmBtn.textContent = '×';
  rmBtn.addEventListener('click', (function(i) { return function() { sgRemoveServiceGroup(i); }; })(idx));
  right.appendChild(allBtn); right.appendChild(noneBtn); right.appendChild(rmBtn);
  hd.appendChild(left); hd.appendChild(right); el.appendChild(hd);
  var searchWrap = document.createElement('div'); searchWrap.className = 'sg-search-wrap';
  var searchInput = document.createElement('input'); searchInput.type = 'text'; searchInput.placeholder = 'Buscar método...'; searchInput.className = 'pinput'; searchInput.style.cssText = 'width:100%;font-size:var(--fs-sm)';
  searchWrap.appendChild(searchInput); el.appendChild(searchWrap);
  var bd = document.createElement('div'); bd.className = 'sg-svc-group-bd';
  searchInput.addEventListener('input', function() { var q = this.value.toLowerCase(); bd.querySelectorAll('.sg-mtd-item').forEach(function(item) { var lbl = item.querySelector('.sg-chk-lbl'); item.style.display = (!q || lbl.textContent.toLowerCase().indexOf(q) !== -1) ? '' : 'none'; }); });
  if (!group.methods.length) { var empty = document.createElement('div'); empty.style.cssText = 'padding:13px 16px;font-size:var(--fs-sm);color:var(--muted)'; empty.textContent = 'Sin métodos'; bd.appendChild(empty); }
  else { group.methods.forEach(function(method) { bd.appendChild(sgBuildMethodCheckbox(group, idx, method)); }); }
  el.appendChild(bd);
}

function sgBuildMethodCheckbox(group, idx, method) {
  var label = document.createElement('label'); label.className = 'sg-mtd-item';
  var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = group.selected.has(method);
  cb.addEventListener('change', (function(i, m) { return function() { if (this.checked) sgServiceGroups[i].selected.add(m); else sgServiceGroups[i].selected.delete(m); sgUpdateNextBtn(); }; })(idx, method));
  var box = document.createElement('span'); box.className = 'sg-chk';
  var lbl = document.createElement('span'); lbl.className = 'sg-chk-lbl'; lbl.textContent = method;
  label.appendChild(cb); label.appendChild(box); label.appendChild(lbl); return label;
}

function sgSelectAllInGroup(idx, val) {
  var group = sgServiceGroups[idx];
  if (val) { group.methods.forEach(function(m) { group.selected.add(m); }); } else { group.selected.clear(); }
  var bd = group.el.querySelector('.sg-svc-group-bd'); bd.innerHTML = '';
  group.methods.forEach(function(method) { bd.appendChild(sgBuildMethodCheckbox(group, idx, method)); });
  sgUpdateNextBtn();
}

function sgRemoveServiceGroup(idx) {
  if (sgServiceGroups[idx].el) sgServiceGroups[idx].el.remove();
  sgServiceGroups.splice(idx, 1);
  var container = document.getElementById('sg-service-groups'); container.innerHTML = '';
  sgServiceGroups.forEach(function(g, i) { var div = document.createElement('div'); div.className = 'sg-svc-group'; g.el = div; container.appendChild(div); sgRenderServiceGroup(div, g, i); });
  sgUpdateNextBtn();
}

function sgUpdateNextBtn() {
  var has = sgServiceGroups.some(function(g) { return g.selected.size > 0; });
  var btn = document.getElementById('btn-next');
  if (btn && S.step === 4 && S.action === 'scripts') btn.disabled = !has;
}

async function sgFetchAndShowOutput(groups) {
  var btn = document.getElementById('btn-next');
  if (btn) { btn.innerHTML = '<span class="spin"></span>&nbsp;Generando...'; btn.disabled = true; }
  try {
    var allItems = [];
    await Promise.all(groups.map(async function(group) {
      var methods = Array.from(group.selected);
      var r = await fetch('/sg/api/methods-full', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: S.platform, db: getDbSG(), version: S.version, service: group.name, srvver: group.version, methods: methods, apiMode: S.apiMode }) });
      var d = await r.json(); if (!d.ok) throw new Error(d.message);
      d.items.forEach(function(item) { allItems.push(item); });
    }));
    var warnings = validateItems(allItems, S.apiMode);
    console.log('[SG] validateItems result:', warnings.length, 'warnings', warnings);
    var valEl = document.getElementById('sg-val-block');
    if (warnings.length) {
      if (valEl) renderWarnings('sg-val-block', warnings);
      if (btn) { btn.innerHTML = 'Generar script &#8594;'; btn.disabled = false; sgUpdateNextBtn(); }
      return;
    }
    if (valEl) { valEl.innerHTML = ''; valEl.style.display = 'none'; }
    sgMultiData = allItems;
    var svcs = allItems.reduce(function(a,it){ if(a.indexOf(it.header.BTISrvNom)<0)a.push(it.header.BTISrvNom); return a; },[]);
    document.getElementById('sg-out-title').textContent = 'Script — ' + svcs.join(', ');
    document.getElementById('sg-out-sub').textContent = allItems.length + ' método' + (allItems.length>1?'s':'');
    show(5);
    sgDoGenerate('both');
  } catch(e) {
    alert('Error: ' + e.message);
    if (btn) { btn.innerHTML = 'Generar script &#8594;'; btn.disabled = false; sgUpdateNextBtn(); }
  }
}

async function sgDoGenerate(mode) {
  if (!sgMultiData || !sgMultiData.length) return;
  try {
    var r = await fetch('/sg/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: sgMultiData, mode: mode }) });
    var d = await r.json();
    document.getElementById('sg-sql-out').value = d.script || '';
  } catch(e) { document.getElementById('sg-sql-out').value = 'Error: ' + e.message; }
}

function sgGenerate(mode) { sgDoGenerate(mode); }

function sgCopyScript() {
  var ta = document.getElementById('sg-sql-out'); if (!ta.value.trim()) return;
  navigator.clipboard.writeText(ta.value).then(function() {
    var res = document.getElementById('sg-copy-res');
    res.className = 'cres show ok'; res.textContent = 'Copiado al portapapeles ✓';
    setTimeout(function() { res.className = 'cres'; }, 2000);
  }).catch(function() { ta.select(); document.execCommand('copy'); });
}

function sgScriptFileName() {
  var svcs = (sgMultiData || []).reduce(function(a, it) { if (a.indexOf(it.header.BTISrvNom) < 0) a.push(it.header.BTISrvNom); return a; }, []);
  var name = svcs.join('_').replace(/[^a-zA-Z0-9_-]/g, '_');
  return name ? 'script_' + name + '.sql' : 'script.sql';
}

function sgDownloadScriptFallback(text, fileName) {
  var blob = new Blob([text], { type: 'text/plain' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function sgDownloadScript() {
  var ta = document.getElementById('sg-sql-out'); if (!ta.value.trim()) return;
  var text = ta.value, fileName = sgScriptFileName();
  if (typeof window.showSaveFilePicker !== 'function') { sgDownloadScriptFallback(text, fileName); return; }
  try {
    var handle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [{ description: 'Script SQL', accept: { 'text/plain': ['.sql'] } }],
    });
    var writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    sgDownloadScriptFallback(text, fileName);
  }
}

function sgReset() {
  sgServiceGroups = []; sgMultiData = null; sgServicesLoaded = false;
  document.getElementById('sg-service-groups').innerHTML = '';
  document.getElementById('sg-sel-svc').innerHTML = '<option value="">-- Seleccioná un servicio --</option>';
  document.getElementById('sg-sql-out').value = '';
  show(4); sgLoadServices();
}

// ── Validar Documentos ──────────────────────────────────────────────

var _VAL_HISTORY_KEY = 'val_path_history';

function loadValidateFolders() {
  var inp = document.getElementById('val-path');
  if (!inp) return;
  var last = _valGetHistory()[0];
  if (last && !inp.value) inp.value = last;
  onValPathInput();
}

function _valGetHistory() {
  try { return JSON.parse(localStorage.getItem(_VAL_HISTORY_KEY) || '[]'); } catch(e) { return []; }
}

function _valSavePath(p) {
  if (!p) return;
  var h = _valGetHistory().filter(function(x) { return x !== p; });
  h.unshift(p);
  localStorage.setItem(_VAL_HISTORY_KEY, JSON.stringify(h.slice(0, 8)));
}

function onValPathInput() {
  var inp = document.getElementById('val-path');
  var btn = document.getElementById('btn-run-validate');
  var hasPath = inp && inp.value.trim().length > 0;
  if (btn) btn.disabled = !hasPath;
}

// Renderiza la lista de archivos con checkboxes
function _valRenderResults(results, basePath) {
  var out = document.getElementById('val-output');
  if (!out) return;
  if (!results || results.length === 0) { out.style.display = 'none'; return; }

  var html = '';
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    var tieneErrores = r.problemas.length > 0;
    var tag = r.version === 'v4' ? '<span class="vf-tag">V4</span>' : (r.version === 'v3' ? '<span class="vf-tag" style="background:#dcfce7;color:#166534">V3</span>' : '');
    if (!tieneErrores) {
      html += '<div class="vf-item ok">✅ ' + _escHtml(r.relPath) + tag + '</div>';
    } else {
      var errHtml = r.problemas.map(function(p) { return '<div>' + _escHtml(p) + '</div>'; }).join('');
      html += '<div class="vf-item err expanded" data-abs="' + _escHtml(r.absPath) + '">'
        + '<input type="checkbox" class="val-file-cb" value="' + _escHtml(r.absPath) + '" onchange="updateFixBar()">'
        + '<div style="flex:1;min-width:0">'
        + '<div class="vf-name" onclick="this.closest(\'.vf-item\').classList.toggle(\'expanded\')">'
        + '📄 ' + _escHtml(r.relPath) + tag
        + ' <span style="font-size:var(--fs-sm);color:var(--muted)">(' + r.problemas.length + ' problema' + (r.problemas.length > 1 ? 's' : '') + ') ▸</span>'
        + '</div>'
        + '<div class="vf-errors">' + errHtml + '</div>'
        + '</div></div>';
    }
  }
  out.innerHTML = html;
  out.style.display = 'block';
}

function _escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function updateFixBar() {
  var bar = document.getElementById('val-fix-bar');
  var btn = document.getElementById('btn-fix-selected');
  var cbs = document.querySelectorAll('.val-file-cb:checked');
  if (!bar || !btn) return;
  var n = cbs.length;
  btn.disabled = n === 0;
  btn.textContent = '⚙ Corregir seleccionados (' + n + ')';
  bar.style.display = 'flex';
}

function valSelectAll(checked) {
  document.querySelectorAll('.val-file-cb').forEach(function(cb) { cb.checked = checked; });
  updateFixBar();
}

async function runValidation() {
  var inp = document.getElementById('val-path');
  var folder = inp ? inp.value.trim() : '';
  if (!folder) return;
  _valSavePath(folder);
  var res = document.getElementById('val-res');
  var out = document.getElementById('val-output');
  var btn = document.getElementById('btn-run-validate');
  var bar = document.getElementById('val-fix-bar');
  var fixOut = document.getElementById('fix-output');
  var fixRes = document.getElementById('fix-res');

  if (res) { res.className = 'cres show'; res.textContent = 'Validando...'; }
  if (out) { out.style.display = 'none'; out.innerHTML = ''; }
  if (bar) bar.style.display = 'none';
  if (fixOut) { fixOut.style.display = 'none'; fixOut.textContent = ''; }
  if (fixRes) fixRes.className = 'cres';
  if (btn) btn.disabled = true;

  try {
    var r = await fetch('/api/validate-md', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ docPath: folder }) });
    var d = await r.json();
    if (res) res.className = 'cres';
    if (d.results) {
      _valRenderResults(d.results, folder);
      var hayErrores = d.results.some(function(r) { return r.problemas.length > 0; });
      if (hayErrores) {
        if (bar) bar.style.display = 'flex';
        updateFixBar();
      }
    } else if (d.output) {
      // fallback texto plano
      out.textContent = d.output;
      out.style.display = 'block';
    }
  } catch (e) {
    if (res) { res.className = 'cres show err'; res.textContent = 'Error: ' + e.message; }
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ── Diálogo de resolución de casing ──────────────────────────

var _casingResolve = null;

function showCasingDialog(conflicts) {
  return new Promise(function(resolve) {
    _casingResolve = resolve;
    var list = document.getElementById('casing-conflicts-list');
    if (!list) { resolve(null); return; }

    // Agrupar por archivo
    var byFile = {};
    conflicts.forEach(function(c) {
      if (!byFile[c.file]) byFile[c.file] = [];
      byFile[c.file].push(...c.conflictos);
    });

    list.innerHTML = Object.entries(byFile).map(function(_ref, fi) {
      var file = _ref[0], items = _ref[1];
      var shortName = file.replace(/\\/g, '/').split('/').pop();
      var rows = items.map(function(item, ii) {
        var key = 'c_' + fi + '_' + ii;
        var pathAttr = _escHtml(JSON.stringify(item.path || [item.sdtKey || item.sdt]));
        return '<div class="casing-item">' +
          '<div class="casing-item-label">Campo <code>' + _escHtml(item.campo) + '</code> del SDT <code>' + _escHtml(item.sdt) + '</code></div>' +
          '<div class="casing-opts">' +
            '<label class="casing-opt">' +
              '<input type="radio" name="' + key + '" value="doc" data-file="' + _escHtml(file) + '" data-sdt="' + _escHtml(item.sdt) + '" data-sdtkey="' + _escHtml(item.sdtKey||item.sdt) + '" data-path="' + pathAttr + '" data-campo="' + _escHtml(item.campo) + '" data-doc="' + _escHtml(item.enDoc) + '" data-ej="' + _escHtml(item.enEjemplo) + '">' +
              'Usar <code>' + _escHtml(item.enDoc) + '</code> (documentación) — se corrige el ejemplo' +
            '</label>' +
            '<label class="casing-opt">' +
              '<input type="radio" name="' + key + '" value="ejemplo" data-file="' + _escHtml(file) + '" data-sdt="' + _escHtml(item.sdt) + '" data-sdtkey="' + _escHtml(item.sdtKey||item.sdt) + '" data-path="' + pathAttr + '" data-campo="' + _escHtml(item.campo) + '" data-doc="' + _escHtml(item.enDoc) + '" data-ej="' + _escHtml(item.enEjemplo) + '">' +
              'Usar <code>' + _escHtml(item.enEjemplo) + '</code> (ejemplo) — se corrige la documentación' +
            '</label>' +
          '</div>' +
        '</div>';
      }).join('');
      return '<div class="casing-group"><div class="casing-group-hd">' + _escHtml(shortName) + '</div>' + rows + '</div>';
    }).join('');

    document.getElementById('casing-overlay').classList.add('show');
  });
}

function confirmCasingDialog() {
  // Recolectar elecciones
  var radios = document.querySelectorAll('#casing-conflicts-list input[type=radio]:checked');
  var byFile = {};
  radios.forEach(function(r) {
    var f = r.dataset.file;
    if (!byFile[f]) byFile[f] = [];
    var path = null;
    try { path = JSON.parse(r.dataset.path); } catch (e) { path = [r.dataset.sdtkey]; }
    byFile[f].push({ sdt: r.dataset.sdt, sdtKey: r.dataset.sdtkey, path: path, campo: r.dataset.campo, choice: r.value, enDoc: r.dataset.doc, enEjemplo: r.dataset.ej });
  });
  document.getElementById('casing-overlay').classList.remove('show');
  if (_casingResolve) { _casingResolve(byFile); _casingResolve = null; }
}

function cancelCasingDialog() {
  document.getElementById('casing-overlay').classList.remove('show');
  if (_casingResolve) { _casingResolve(null); _casingResolve = null; }
}

// ─────────────────────────────────────────────────────────────

async function fixSelected() {
  var cbs = document.querySelectorAll('.val-file-cb:checked');
  var files = Array.from(cbs).map(function(cb) { return cb.value; });
  if (files.length === 0) return;

  var btn = document.getElementById('btn-fix-selected');
  var fixOut = document.getElementById('fix-output');
  var fixRes = document.getElementById('fix-res');

  if (fixOut) { fixOut.style.display = 'none'; fixOut.textContent = ''; }
  if (btn) btn.disabled = true;

  try {
    // Paso 1: detectar conflictos de casing
    if (fixRes) { fixRes.className = 'cres show'; fixRes.textContent = 'Detectando conflictos de casing...'; }
    var dr = await fetch('/api/detect-casing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files: files }) });
    var dd = dr.ok ? await dr.json() : { conflicts: [] };

    if (dd.conflicts && dd.conflicts.length > 0) {
      // Paso 2: mostrar diálogo y esperar elecciones
      if (fixRes) { fixRes.className = 'cres'; }
      var choices = await showCasingDialog(dd.conflicts);

      if (choices && Object.keys(choices).length > 0) {
        // Paso 3: aplicar elecciones
        if (fixRes) { fixRes.className = 'cres show'; fixRes.textContent = 'Aplicando correcciones de casing...'; }
        var choicesList = Object.entries(choices).map(function(_ref) { return { file: _ref[0], decisions: _ref[1] }; });
        await fetch('/api/apply-casing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ choices: choicesList }) });
      }
    }

    // Paso 4: correcciones generales
    if (fixRes) { fixRes.className = 'cres show'; fixRes.textContent = 'Corrigiendo ' + files.length + ' archivo(s)...'; }
    var r = await fetch('/api/fix-md', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files: files }) });
    var d = await r.json();
    if (fixRes) fixRes.className = 'cres';
    if (fixOut && d.output) { fixOut.textContent = d.output; fixOut.style.display = 'block'; }
    await runValidation();
  } catch (e) {
    if (fixRes) { fixRes.className = 'cres show err'; fixRes.textContent = 'Error: ' + e.message; }
  } finally {
    if (btn) btn.disabled = false;
  }
}
