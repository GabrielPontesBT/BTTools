var collectionState = {
  format: null,
  target: null,
  services: [],
  collectionName: 'Bantotal SOAP Collection',
  scenarios: [],
  activeScenarioId: null,
  contextKey: null,
  nextScenarioId: 1
};

function collectionCreateScenario(name) {
  var ordinal = collectionState.nextScenarioId++;
  var id = 'scenario_' + ordinal;
  return {
    id: id,
    name: name || ('Caso de uso ' + ordinal),
    items: [],
    previewVariables: [],
    previewMappings: [],
    variableOverrides: {},
    repeatableOverrides: {}
  };
}

function collectionGetActiveScenario() {
  var activeId = collectionState.activeScenarioId;
  for (var i = 0; i < collectionState.scenarios.length; i++) {
    if (collectionState.scenarios[i].id === activeId) return collectionState.scenarios[i];
  }
  return collectionState.scenarios[0] || null;
}

function collectionEnsureScenario() {
  if (!collectionState.scenarios.length) {
    var scenario = collectionCreateScenario('Caso de uso 1');
    collectionState.scenarios.push(scenario);
    collectionState.activeScenarioId = scenario.id;
  }
  if (!collectionGetActiveScenario()) {
    collectionState.activeScenarioId = collectionState.scenarios[0].id;
  }
}

function collectionShowStatus(kind, text) {
  var el = document.getElementById('collection-status');
  if (!el) return;
  el.className = 'collection-status show ' + kind;
  el.textContent = text;
}

function collectionClearStatus() {
  var el = document.getElementById('collection-status');
  if (!el) return;
  el.className = 'collection-status';
  el.textContent = '';
}

function collectionPathSupported() {
  return collectionState.format === 'xml' && collectionState.target === 'postman';
}

function collectionResetResult() {
  var result = document.getElementById('collection-result');
  if (!result) return;
  result.className = 'collection-result';
  result.innerHTML = '';
}

function collectionResetExecution() {
  var result = document.getElementById('collection-execution');
  if (!result) return;
  result.className = 'collection-result';
  result.style.display = 'none';
  result.innerHTML = '';
}

function collectionContextKey() {
  if (typeof S === 'undefined') return '';
  try {
    return JSON.stringify({
      version: S.version || '',
      platform: S.platform || '',
      db: typeof getDb === 'function' ? getDb() : {},
      api: typeof getApi === 'function' ? getApi() : {}
    });
  } catch (e) {
    return '';
  }
}

function collectionResetLoadedData() {
  collectionState.services = [];
  collectionState.scenarios = [];
  collectionState.activeScenarioId = null;
  collectionState.nextScenarioId = 1;
  collectionEnsureScenario();

  var services = document.getElementById('collection-services');
  if (services) services.style.display = 'none';

  var svcSel = document.getElementById('col-sel-svc');
  if (svcSel) svcSel.innerHTML = '<option value="">-- Seleccionar --</option>';

  var mtdSel = document.getElementById('col-sel-mtd');
  if (mtdSel) mtdSel.innerHTML = '<option value="">-- Seleccionar --</option>';

  collectionRenderScenarios();
  collectionRenderItems();
  collectionRenderVariableEditor();
  collectionResetResult();
  collectionResetExecution();
}

function collectionRefreshContext() {
  var summary = document.getElementById('collection-env-summary');
  if (!summary) return;

  var nextKey = collectionContextKey();
  if (collectionState.contextKey && nextKey && nextKey !== collectionState.contextKey) {
    collectionResetLoadedData();
    collectionShowStatus('ok', 'Cambio el ambiente cargado. Vuelve a traer los servicios para esta collection.');
  }
  collectionState.contextKey = nextKey;

  if (typeof S === 'undefined' || typeof getDb !== 'function' || typeof getApi !== 'function') {
    summary.textContent = 'No se pudo leer la configuracion actual del wizard.';
    return;
  }
  if (!S.version || !S.platform) {
    summary.textContent = 'Completa primero version, plataforma, BD y API en el wizard principal.';
    return;
  }

  var db = getDb();
  var api = getApi();
  var dbLabel = S.platform === 'sqlserver'
    ? [db.DB_SERVER, db.DB_PORT, db.DB_DATABASE].filter(Boolean).join(' / ')
    : [db.DB_USER, db.DB_CONNECT_STRING].filter(Boolean).join(' @ ');
  var authLabel = S.version === 'V3'
    ? (api.API_AUTH_URL || 'sin API_AUTH_URL')
    : (api.API_AUTH_URL || 'Authenticate V4 por defecto');

  summary.textContent =
    'Version: ' + (S.version || '-') +
    ' | Plataforma: ' + (S.platform || '-') +
    ' | BD: ' + (dbLabel || 'sin datos completos') +
    ' | API: ' + ((api.API_BASE_URL || '').trim() || 'sin API_BASE_URL') +
    ' | Auth: ' + authLabel;
}

function collectionToggleConfig() {
  var note = document.getElementById('collection-path-note');
  var config = document.getElementById('collection-config');
  var services = document.getElementById('collection-services');
  if (!note || !config || !services) return;

  if (!collectionState.format || !collectionState.target) {
    note.style.display = 'none';
    config.style.display = 'none';
    services.style.display = 'none';
    return;
  }

  note.style.display = 'block';
  if (collectionPathSupported()) {
    note.innerHTML = '<strong>Camino activo:</strong> XML + Postman. Se va a generar una collection SOAP usando la configuracion que ya cargaste en el wizard.';
    config.style.display = 'block';
    collectionRefreshContext();
  } else {
    note.innerHTML = '<strong>Camino preparado:</strong> ' + collectionState.format.toUpperCase() + ' + ' + collectionState.target + '. Ese flujo queda encaminado, pero por ahora el generador activo es XML + Postman.';
    config.style.display = 'none';
    services.style.display = 'none';
  }
}

function collectionPickChoice(kind, value, el) {
  collectionState[kind] = value;
  el.closest('.collection-mini-cards').querySelectorAll('.ccard').forEach(function(card) {
    card.classList.remove('sel');
  });
  el.classList.add('sel');
  collectionClearStatus();
  collectionResetResult();
  collectionResetExecution();
  collectionToggleConfig();
}

function collectionUpdateName(value) {
  collectionState.collectionName = value || 'Bantotal SOAP Collection';
}

function collectionSetActiveScenario(id) {
  collectionState.activeScenarioId = id;
  collectionRenderScenarios();
  collectionRenderItems();
  collectionRenderVariableEditor();
  collectionResetResult();
  collectionResetExecution();
}

function collectionAddScenario() {
  var scenario = collectionCreateScenario();
  collectionState.scenarios.push(scenario);
  collectionState.activeScenarioId = scenario.id;
  collectionRenderScenarios();
  collectionRenderItems();
  collectionRenderVariableEditor();
  collectionResetResult();
  collectionResetExecution();
}

function collectionRenameScenario(id, value) {
  for (var i = 0; i < collectionState.scenarios.length; i++) {
    if (collectionState.scenarios[i].id === id) {
      collectionState.scenarios[i].name = value || ('Caso de uso ' + (i + 1));
      break;
    }
  }
  collectionRenderScenarios();
}

function collectionRemoveScenario(id) {
  if (collectionState.scenarios.length <= 1) return;
  collectionState.scenarios = collectionState.scenarios.filter(function(scenario) {
    return scenario.id !== id;
  });
  if (!collectionState.scenarios.length) {
    collectionEnsureScenario();
  }
  if (!collectionGetActiveScenario()) {
    collectionState.activeScenarioId = collectionState.scenarios[0].id;
  }
  collectionRenderScenarios();
  collectionRenderItems();
  collectionRenderVariableEditor();
  collectionResetResult();
  collectionResetExecution();
}

function collectionRenderScenarios() {
  var container = document.getElementById('collection-scenarios');
  if (!container) return;
  collectionEnsureScenario();
  var active = collectionGetActiveScenario();
  container.innerHTML = collectionState.scenarios.map(function(scenario, index) {
    var activeClass = active && active.id === scenario.id ? ' collection-scenario-card-active' : '';
    var disabledRemove = collectionState.scenarios.length <= 1 ? ' disabled' : '';
    return '<div class="collection-scenario-card' + activeClass + '">' +
      '<button type="button" class="collection-scenario-select" onclick="collectionSetActiveScenario(' + "'" + scenario.id + "'" + ')">' +
        '<span class="collection-scenario-kicker">Caso ' + (index + 1) + '</span>' +
        '<span class="collection-scenario-title">' + collectionEscapeHtml(scenario.name) + '</span>' +
        '<span class="collection-scenario-meta">' + (scenario.items || []).length + ' metodo(s)</span>' +
      '</button>' +
      '<div class="collection-scenario-actions">' +
        '<input class="collection-scenario-input" type="text" value="' + collectionEscapeHtml(scenario.name) + '" oninput="collectionRenameScenario(' + "'" + scenario.id + "'" + ', this.value)" placeholder="Nombre del caso de uso">' +
        '<button type="button" class="svc-rm" onclick="collectionRemoveScenario(' + "'" + scenario.id + "'" + ')"' + disabledRemove + '>&#10005;</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function collectionEscapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function collectionVariableValue(key, fallback) {
  var scenario = collectionGetActiveScenario();
  if (scenario && Object.prototype.hasOwnProperty.call(scenario.variableOverrides, key)) {
    return scenario.variableOverrides[key];
  }
  return fallback || '';
}

function collectionUpdateVar(key, value) {
  var scenario = collectionGetActiveScenario();
  if (!scenario) return;
  scenario.variableOverrides[key] = value;
}

function collectionEnsureRepeatableRows(paramName, fieldDefs) {
  var scenario = collectionGetActiveScenario();
  if (!scenario) return [];
  if (!scenario.repeatableOverrides[paramName] || !scenario.repeatableOverrides[paramName].length) {
    var row = {};
    (fieldDefs || []).forEach(function(field) {
      row[field.repeatableFieldName] = field.defaultValue || '';
    });
    scenario.repeatableOverrides[paramName] = [row];
  }
  return scenario.repeatableOverrides[paramName];
}

function collectionAddRepeatableRow(paramName, fieldsEncoded) {
  var fields = JSON.parse(decodeURIComponent(fieldsEncoded));
  var row = {};
  (fields || []).forEach(function(field) {
    row[field.repeatableFieldName] = field.defaultValue || '';
  });
  var scenario = collectionGetActiveScenario();
  if (!scenario) return;
  if (!scenario.repeatableOverrides[paramName]) scenario.repeatableOverrides[paramName] = [];
  scenario.repeatableOverrides[paramName].push(row);
  collectionRenderVariableEditor();
}

function collectionRemoveRepeatableRow(paramName, index) {
  var scenario = collectionGetActiveScenario();
  if (!scenario || !scenario.repeatableOverrides[paramName]) return;
  scenario.repeatableOverrides[paramName].splice(index, 1);
  if (!scenario.repeatableOverrides[paramName].length) delete scenario.repeatableOverrides[paramName];
  collectionRenderVariableEditor();
}

function collectionUpdateRepeatableVar(paramName, index, fieldName, value) {
  var scenario = collectionGetActiveScenario();
  if (!scenario) return;
  if (!scenario.repeatableOverrides[paramName]) scenario.repeatableOverrides[paramName] = [];
  if (!scenario.repeatableOverrides[paramName][index]) scenario.repeatableOverrides[paramName][index] = {};
  scenario.repeatableOverrides[paramName][index][fieldName] = value;
}

function collectionDomId(key) {
  return 'col_var_' + String(key || '').replace(/[^A-Za-z0-9_]/g, '_');
}

function collectionApplySuggestion(key, value) {
  var scenario = collectionGetActiveScenario();
  if (!scenario) return;
  scenario.variableOverrides[key] = value;
  var input = document.getElementById(collectionDomId(key));
  if (input) input.value = value;
}

function collectionApplySuggestionEncoded(keyEncoded, valueEncoded) {
  collectionApplySuggestion(decodeURIComponent(keyEncoded), decodeURIComponent(valueEncoded));
}

function collectionInferOperationKind(method) {
  var name = String(method || '').toLowerCase();
  return name.indexOf('get') === 0 || name.indexOf('view') === 0 || name.indexOf('list') === 0 ? 'query' : 'action';
}

function collectionOperationBadge(kind) {
  var op = String(kind || 'action').toLowerCase();
  var css = op === 'query' ? 'collection-badge collection-badge-query' : 'collection-badge collection-badge-action';
  var label = op === 'query' ? 'Consulta' : 'Ejecucion';
  return '<span class="' + css + '">' + label + '</span>';
}

function collectionRenderVariableEditor() {
  var wrap = document.getElementById('collection-vars-wrap');
  var container = document.getElementById('collection-vars');
  if (!wrap || !container) return;
  var scenario = collectionGetActiveScenario();

  if (!scenario || !scenario.items.length) {
    wrap.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  wrap.style.display = 'block';
  if (!scenario.previewVariables.length) {
    container.innerHTML = '<div class="collection-vars-empty">Este flujo no necesita variables manuales por ahora, o todavia no se pudo calcular la preview.</div>';
    return;
  }

  var groups = {};
  scenario.previewVariables.forEach(function(item) {
    var key = item.groupKey || 'general';
    if (!groups[key]) groups[key] = { title: item.groupTitle || 'Variables del flujo', items: [] };
    groups[key].items.push(item);
  });

  container.innerHTML = Object.keys(groups).map(function(groupKey) {
    var group = groups[groupKey];
    var repeatableMap = {};
    var scalarItems = [];
    group.items.forEach(function(item) {
      if (item.repeatableGroupKey && item.repeatableParamName) {
        if (!repeatableMap[item.repeatableGroupKey]) {
          repeatableMap[item.repeatableGroupKey] = {
            paramName: item.repeatableParamName,
            itemTag: item.repeatableItemTag,
            fields: []
          };
        }
        repeatableMap[item.repeatableGroupKey].fields.push(item);
      } else {
        scalarItems.push(item);
      }
    });

    var scalarRows = scalarItems.map(function(item) {
      var currentValue = collectionVariableValue(item.key, item.defaultValue || '');
      var domId = collectionDomId(item.key);
      var meta = [];
      if (item.pathLabel) meta.push('Campo: ' + item.pathLabel);
      if (item.type) meta.push('Tipo: ' + item.type);
      if (item.description) meta.push(item.description);
      var metaHtml = meta.length ? '<div class="collection-var-meta">' + collectionEscapeHtml(meta.join(' | ')) + '</div>' : '';
      var suggestions = Array.isArray(item.suggestions) ? item.suggestions : [];
      var datalistId = domId + '_list';
      var suggestionHtml = suggestions.length
        ? '<div class="collection-suggestions">' + suggestions.map(function(suggestion) {
            var label = collectionEscapeHtml(suggestion.value);
            var source = suggestion.source ? '<span>' + collectionEscapeHtml(suggestion.source) + '</span>' : '';
            return '<button type="button" class="collection-suggestion-chip" onclick="collectionApplySuggestionEncoded(' + "'" + encodeURIComponent(item.key) + "'" + ', ' + "'" + encodeURIComponent(suggestion.value) + "'" + ')">' + label + source + '</button>';
          }).join('') + '</div>' +
          '<datalist id="' + datalistId + '">' + suggestions.map(function(suggestion) {
            return '<option value="' + collectionEscapeHtml(suggestion.value) + '"></option>';
          }).join('') + '</datalist>'
        : '';

      if ((currentValue || '').indexOf('\n') >= 0 || String(currentValue).length > 90) {
        return '<div class="collection-var-row">' +
          '<div class="collection-var-head">' +
          '<div><div class="collection-var-name">' + collectionEscapeHtml(item.key) + '</div>' + metaHtml + '</div>' +
          '<span class="collection-var-badge">Collection var</span>' +
        '</div>' +
        suggestionHtml +
        '<textarea id="' + domId + '" class="collection-var-textarea" rows="4" oninput="collectionUpdateVar(' + "'" + collectionEscapeHtml(item.key) + "'" + ', this.value)">' + collectionEscapeHtml(currentValue) + '</textarea>' +
        '</div>';
      }

      return '<div class="collection-var-row">' +
        '<div class="collection-var-head">' +
          '<div><div class="collection-var-name">' + collectionEscapeHtml(item.key) + '</div>' + metaHtml + '</div>' +
          '<span class="collection-var-badge">Collection var</span>' +
        '</div>' +
        suggestionHtml +
        '<input id="' + domId + '" class="collection-var-input" type="text" list="' + datalistId + '" value="' + collectionEscapeHtml(currentValue) + '" oninput="collectionUpdateVar(' + "'" + collectionEscapeHtml(item.key) + "'" + ', this.value)">' +
      '</div>';
    }).join('');

    var repeatableRows = Object.keys(repeatableMap).map(function(repKey) {
      var rep = repeatableMap[repKey];
      var fields = rep.fields;
      var rows = collectionEnsureRepeatableRows(rep.paramName, fields);
      var encodedFields = encodeURIComponent(JSON.stringify(fields.map(function(field) {
        return {
          repeatableFieldName: field.repeatableFieldName,
          defaultValue: field.defaultValue || ''
        };
      })));
      var head = '<div class="collection-repeatable-head">' +
        '<div><strong>' + collectionEscapeHtml(rep.paramName) + '</strong><div class="collection-var-meta">Lista repetible ' + collectionEscapeHtml(rep.itemTag || '') + '</div></div>' +
        '<button type="button" class="btn btn-outline" style="padding:6px 10px;font-size:11px" onclick="collectionAddRepeatableRow(' + "'" + collectionEscapeHtml(rep.paramName) + "'" + ', ' + "'" + encodedFields + "'" + ')">+ Agregar fila</button>' +
      '</div>';
      var tableHead = '<div class="collection-repeatable-grid collection-repeatable-grid-head">' +
        fields.map(function(field) {
          return '<div>' + collectionEscapeHtml(field.repeatableFieldName) + '</div>';
        }).join('') +
        '<div></div></div>';
      var tableRows = rows.map(function(row, rowIndex) {
        var cols = fields.map(function(field) {
          var value = Object.prototype.hasOwnProperty.call(row, field.repeatableFieldName) ? row[field.repeatableFieldName] : (field.defaultValue || '');
          var suggestions = Array.isArray(field.suggestions) ? field.suggestions : [];
          var datalistId = collectionDomId(rep.paramName + '_' + rowIndex + '_' + field.repeatableFieldName) + '_list';
          return '<div>' +
            (suggestions.length ? '<datalist id="' + datalistId + '">' + suggestions.map(function(suggestion) {
              return '<option value="' + collectionEscapeHtml(suggestion.value) + '"></option>';
            }).join('') + '</datalist>' : '') +
            '<input class="collection-var-input" type="text" list="' + datalistId + '" value="' + collectionEscapeHtml(value) + '" oninput="collectionUpdateRepeatableVar(' + "'" + collectionEscapeHtml(rep.paramName) + "'" + ',' + rowIndex + ',' + "'" + collectionEscapeHtml(field.repeatableFieldName) + "'" + ', this.value)">' +
          '</div>';
        }).join('');
        return '<div class="collection-repeatable-grid">' + cols +
          '<div><button type="button" class="svc-rm" onclick="collectionRemoveRepeatableRow(' + "'" + collectionEscapeHtml(rep.paramName) + "'" + ',' + rowIndex + ')">&#10005;</button></div>' +
        '</div>';
      }).join('');
      return '<div class="collection-var-row"><div class="collection-repeatable-card">' + head + tableHead + tableRows + '</div></div>';
    }).join('');

    return '<div class="collection-var-group">' +
      '<div class="collection-var-group-title">' + collectionEscapeHtml(group.title) + '</div>' +
      scalarRows +
      repeatableRows +
    '</div>';
  }).join('');
}

async function collectionLoadPreview() {
  var scenario = collectionGetActiveScenario();
  if (!scenario || !scenario.items.length) {
    if (scenario) {
      scenario.previewVariables = [];
      scenario.previewMappings = [];
    }
    collectionRenderVariableEditor();
    return;
  }

  try {
    var r = await fetch('/api/collection/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: S.version,
        platform: S.platform,
        db: getDb(),
        api: getApi(),
        items: scenario.items
      })
    });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);
    scenario.previewVariables = d.variables || [];
    scenario.previewMappings = d.mappings || [];
    collectionRenderVariableEditor();
  } catch (e) {
    scenario.previewVariables = [];
    scenario.previewMappings = [];
    collectionRenderVariableEditor();
    collectionShowStatus('err', e.message || 'No se pudo preparar la preview de variables.');
  }
}

async function collectionTestDb() {
  collectionRefreshContext();
  if (typeof S === 'undefined' || !S.platform) {
    collectionShowStatus('err', 'Completa primero la plataforma en el wizard principal.');
    return;
  }

  collectionShowStatus('ok', 'Probando conexion a la base de datos actual...');
  try {
    var r = await fetch('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: S.platform, db: getDb() })
    });
    var d = await r.json();
    collectionShowStatus(d.ok ? 'ok' : 'err', d.ok ? 'Conexion a BD exitosa.' : d.message);
  } catch (e) {
    collectionShowStatus('err', 'No se pudo probar la conexion a la base de datos.');
  }
}

async function collectionTestAuth() {
  collectionRefreshContext();
  if (typeof S === 'undefined' || !S.version) {
    collectionShowStatus('err', 'Completa primero la version en el wizard principal.');
    return;
  }

  collectionShowStatus('ok', 'Probando autenticacion SOAP del ambiente actual...');
  try {
    var r = await fetch('/api/test-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: S.version, api: getApi() })
    });
    var d = await r.json();
    collectionShowStatus(d.ok ? 'ok' : 'err', d.ok ? 'Autenticacion exitosa.' : d.message);
  } catch (e) {
    collectionShowStatus('err', 'No se pudo probar la autenticacion.');
  }
}

async function collectionLoadServices() {
  collectionRefreshContext();
  if (!collectionPathSupported()) {
    collectionShowStatus('err', 'Por ahora solo esta disponible el camino XML + Postman.');
    return;
  }
  if (typeof S === 'undefined' || !S.platform) {
    collectionShowStatus('err', 'Completa primero la plataforma en el wizard principal.');
    return;
  }

  collectionShowStatus('ok', 'Cargando servicios desde BTI014...');
  try {
    var r = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: S.platform, db: getDb() })
    });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);

    collectionState.services = d.services || [];
    document.getElementById('collection-services').style.display = 'block';

    var filter = document.getElementById('col-svc-filter');
    if (filter && !filter.value) filter.value = S.version === 'V3' ? 'BT' : 'Public';

    collectionFilterServices();
    collectionRenderVariableEditor();
    collectionShowStatus('ok', 'Servicios cargados. Ahora arma el flujo.');
  } catch (e) {
    collectionShowStatus('err', e.message || 'No se pudieron cargar los servicios.');
  }
}

function collectionFilterServices() {
  var filter = (document.getElementById('col-svc-filter').value || '').toLowerCase();
  var sel = document.getElementById('col-sel-svc');
  var prev = sel.value;
  sel.innerHTML = '<option value="">-- Seleccionar --</option>';

  collectionState.services.filter(function(service) {
    return !filter || service.toLowerCase().startsWith(filter);
  }).forEach(function(service) {
    var opt = document.createElement('option');
    opt.value = service;
    opt.textContent = service;
    if (service === prev) opt.selected = true;
    sel.appendChild(opt);
  });

  if (prev && sel.value !== prev) {
    document.getElementById('col-sel-mtd').innerHTML = '<option value="">-- Seleccionar --</option>';
  }
}

async function collectionLoadMethods(service) {
  var sel = document.getElementById('col-sel-mtd');
  sel.innerHTML = '<option value="">Cargando...</option>';
  if (!service) {
    sel.innerHTML = '<option value="">-- Seleccionar --</option>';
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

    sel.innerHTML = '<option value="">-- Seleccionar --</option>';
    d.methods.forEach(function(method) {
      var opt = document.createElement('option');
      opt.value = method;
      opt.textContent = method;
      sel.appendChild(opt);
    });
  } catch (e) {
    sel.innerHTML = '<option value="">Error al cargar</option>';
  }
}

function collectionRenderItems() {
  var container = document.getElementById('collection-chain');
  if (!container) return;
  var scenario = collectionGetActiveScenario();
  var items = scenario ? scenario.items : [];
  var totalItems = collectionState.scenarios.reduce(function(total, current) {
    return total + ((current.items || []).length);
  }, 0);

  if (!items.length) {
    container.innerHTML = '<div class="collection-inline-note">Todavia no agregaste metodos al flujo.</div>';
  } else {
    var rows = items.map(function(item, index) {
      var op = String(item.operationKind || collectionInferOperationKind(item.method)).toLowerCase();
      return '<div class="svc-wrap">' +
        '<div class="collection-chain-row">' +
          '<div>' +
            '<div class="collection-chain-title"><strong>' + (index + 1) + '. ' + item.service + '.' + item.method + '</strong>' + collectionOperationBadge(op) + '</div>' +
            '<div class="collection-chain-meta">Se generara como request SOAP en la collection. El transporte real sigue siendo POST.</div>' +
          '</div>' +
          '<button class="svc-rm" onclick="collectionRemoveItem(' + index + ')">&#10005;</button>' +
        '</div>' +
      '</div>';
    }).join('');
    container.innerHTML = rows;
  }

  var btn = document.getElementById('btn-collection-generate');
  if (btn) btn.disabled = !totalItems || !collectionPathSupported();
  var execBtn = document.getElementById('btn-collection-execute');
  if (execBtn) execBtn.disabled = !items.length || !collectionPathSupported();
}

function collectionAddItem() {
  var scenario = collectionGetActiveScenario();
  var service = document.getElementById('col-sel-svc').value;
  var method = document.getElementById('col-sel-mtd').value;
  var operationKind = collectionInferOperationKind(method);
  if (!scenario || !service || !method) return;

  var exists = scenario.items.some(function(item) {
    return item.service === service && item.method === method;
  });
  if (exists) return;

  scenario.items.push({ service: service, method: method, operationKind: operationKind });
  collectionRenderScenarios();
  collectionRenderItems();
  collectionLoadPreview();
  collectionResetResult();
  collectionResetExecution();
}

function collectionRemoveItem(index) {
  var scenario = collectionGetActiveScenario();
  if (!scenario) return;
  scenario.items.splice(index, 1);
  collectionRenderScenarios();
  collectionRenderItems();
  collectionLoadPreview();
  collectionResetResult();
  collectionResetExecution();
}

function collectionRenderExecutionResult(data) {
  var el = document.getElementById('collection-execution');
  if (!el) return;
  var scenario = collectionGetActiveScenario();
  var steps = Array.isArray(data.steps) ? data.steps : [];
  var runtimeValues = data.runtimeValues || {};
  var finalVars = Object.keys(runtimeValues).length
    ? '<div class="collection-run-vars">' + Object.keys(runtimeValues).map(function(key) {
        return '<span class="collection-run-var"><strong>' + collectionEscapeHtml(key) + '</strong> ' + collectionEscapeHtml(runtimeValues[key]) + '</span>';
      }).join('') + '</div>'
    : '<p>Sin variables finales para mostrar.</p>';

  var stepHtml = steps.map(function(step) {
    var extracted = step.extractedValues || {};
    var extractedHtml = Object.keys(extracted).length
      ? '<div class="collection-run-vars">' + Object.keys(extracted).map(function(key) {
          return '<span class="collection-run-var"><strong>' + collectionEscapeHtml(key) + '</strong> ' + collectionEscapeHtml(extracted[key]) + '</span>';
        }).join('') + '</div>'
      : '';
    var requestXml = step.requestXml ? '<div class="collection-run-pre">' + collectionEscapeHtml(step.requestXml) + '</div>' : '';
    var responseXml = step.responseXml ? '<div class="collection-run-pre">' + collectionEscapeHtml(step.responseXml) + '</div>' : '';
    return '<div class="collection-run-step">' +
      '<div class="collection-run-head">' +
        '<div class="collection-run-title">' + collectionEscapeHtml(step.name || ('Paso ' + step.index)) + '</div>' +
        '<div class="' + (step.ok ? 'collection-run-ok' : 'collection-run-err') + '">' + (step.ok ? 'OK' : 'ERROR') + '</div>' +
      '</div>' +
      '<div class="collection-run-body">' +
        '<div class="collection-run-meta">URL: ' + collectionEscapeHtml(step.requestUrl || '-') + (step.responseStatus ? ' | HTTP: ' + collectionEscapeHtml(step.responseStatus) : '') + (step.soapAction ? ' | SOAPAction: ' + collectionEscapeHtml(step.soapAction) : '') + '</div>' +
        (step.error ? '<div class="collection-status show err" style="margin-top:0">Error: ' + collectionEscapeHtml(step.error) + '</div>' : '') +
        extractedHtml +
        requestXml +
        responseXml +
      '</div>' +
    '</div>';
  }).join('');
  var topError = !data.ok && data.message
    ? '<div class="collection-status show err" style="margin-bottom:10px">Error general: ' + collectionEscapeHtml(data.message) + '</div>'
    : '';

  el.className = 'collection-result show';
  el.style.display = 'block';
  el.innerHTML =
    '<h4>Ventana de ejecucion' + (scenario ? ' - ' + collectionEscapeHtml(scenario.name) : '') + '</h4>' +
    '<p>' + (data.ok ? 'El flujo se ejecuto correctamente. Los valores usados y devueltos quedaron disponibles para el historial confiable.' : 'La ejecucion se detuvo en el primer error. No se guardaron valores como historial.') + '</p>' +
    topError +
    stepHtml +
    '<h4 style="margin-top:12px">Variables finales</h4>' +
    finalVars;
}

async function collectionExecuteFlow() {
  if (!collectionPathSupported()) {
    collectionShowStatus('err', 'Por ahora solo esta disponible XML + Postman.');
    return;
  }
  collectionRefreshContext();
  if (typeof S === 'undefined' || !S.version || !S.platform) {
    collectionShowStatus('err', 'Completa primero version, plataforma, BD y API en el wizard principal.');
    return;
  }
  var scenario = collectionGetActiveScenario();
  if (!scenario || !scenario.items.length) {
    collectionShowStatus('err', 'Agrega al menos un metodo al caso de uso activo.');
    return;
  }

  var btn = document.getElementById('btn-collection-execute');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spin dk"></span>&nbsp;Probando...';
  }
  collectionShowStatus('ok', 'Ejecutando flujo SOAP desde la app...');
  collectionResetExecution();

  try {
    var r = await fetch('/api/collection/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: S.version,
        platform: S.platform,
        db: getDb(),
        api: getApi(),
        items: scenario.items,
        variableOverrides: scenario.variableOverrides,
        repeatableOverrides: scenario.repeatableOverrides
      })
    });
    var d = await r.json();
    if (!d.ok) {
      collectionShowStatus('err', d.message || 'La ejecucion del flujo fallo.');
      collectionRenderExecutionResult(d);
    } else {
      collectionShowStatus('ok', 'Flujo ejecutado correctamente.');
      collectionRenderExecutionResult(d);
    }
  } catch (e) {
    collectionShowStatus('err', e.message || 'No se pudo ejecutar el flujo.');
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = 'Probar flujo';
  }
}

function collectionRenderResult(data) {
  var result = document.getElementById('collection-result');
  if (!result) return;

  var mappings = data.mappings || [];
  var mapHtml = mappings.length
    ? '<div class="collection-maps">' + mappings.map(function(map) {
        var label = (map.scenario ? map.scenario + ' / ' : '') + map.target + ' / ' + map.input;
        return '<div class="collection-map"><strong>' + label + '</strong><span>' + map.source + '</span></div>';
      }).join('') + '</div>'
    : '<p>No se detectaron variables top-level para machear automaticamente en esta primera version.</p>';

  result.className = 'collection-result show';
  result.innerHTML =
    '<h4>Collection generada</h4>' +
    '<p>Se genero una collection Postman con <strong>' + data.requestCount + '</strong> requests repartidos en <strong>' + (data.scenarioCount || 1) + '</strong> caso(s) de uso. Cada carpeta incluye Authenticate, bodies XML y captura automatica de variables top-level.</p>' +
    '<div class="collection-actions" style="margin-bottom:12px">' +
      '<a class="btn btn-primary" href="' + data.downloadUrl + '">&#8595; Descargar ' + data.fileName + '</a>' +
    '</div>' +
    '<h4>Auto-matching detectado</h4>' +
    mapHtml;
}

async function collectionGenerate() {
  if (!collectionPathSupported()) {
    collectionShowStatus('err', 'Por ahora solo esta disponible XML + Postman.');
    return;
  }

  collectionRefreshContext();
  if (typeof S === 'undefined' || !S.version || !S.platform) {
    collectionShowStatus('err', 'Completa primero version, plataforma, BD y API en el wizard principal.');
    return;
  }
  var scenarios = collectionState.scenarios.filter(function(scenario) {
    return scenario.items && scenario.items.length;
  });
  if (!scenarios.length) {
    collectionShowStatus('err', 'Agrega al menos un metodo en algun caso de uso.');
    return;
  }

  var btn = document.getElementById('btn-collection-generate');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spin"></span>&nbsp;Generando...';
  }
  collectionShowStatus('ok', 'Generando collection Postman SOAP...');
  collectionResetResult();

  try {
    var r = await fetch('/api/collection/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: collectionState.format,
        target: collectionState.target,
        version: S.version,
        platform: S.platform,
        db: getDb(),
        api: getApi(),
        collectionName: collectionState.collectionName,
        scenarios: scenarios.map(function(scenario) {
          return {
            id: scenario.id,
            name: scenario.name,
            items: scenario.items,
            variableOverrides: scenario.variableOverrides,
            repeatableOverrides: scenario.repeatableOverrides
          };
        })
      })
    });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);

    collectionShowStatus('ok', 'Collection generada correctamente.');
    collectionRenderResult(d);
  } catch (e) {
    collectionShowStatus('err', e.message || 'No se pudo generar la collection.');
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = 'Generar collection';
  }
}

collectionEnsureScenario();
collectionRenderScenarios();
collectionRenderItems();
collectionRefreshContext();
