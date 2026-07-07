var collectionState = {
  format: null,
  target: null,
  services: [],
  serviceOperations: {},
  swaggerUrl: '',
  swaggerResolvedUrl: '',
  swaggerBaseUrl: '',
  swaggerAuthUrl: '',
  collectionName: 'Bantotal JSON Collection',
  authContext: null,
  studioStage: 'define',
  scenarios: [],
  activeScenarioId: null,
  contextKey: null,
  nextScenarioId: 1
};

var collectionButtonsBound = false;
var collectionFlowResizeBound = false;
var collectionStudioUpgraded = false;

function collectionCreateScenario(name) {
  var ordinal = collectionState.nextScenarioId++;
  var id = 'scenario_' + ordinal;
  return {
    id: id,
    name: name || ('Caso de uso ' + ordinal),
    items: [],
    selectedItemIndex: -1,
    previewVariables: [],
    previewOutputs: [],
    previewMappings: [],
    variableOverrides: {},
    inputMappings: {},
    outputAliases: {},
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
  return collectionState.format === 'json' && collectionState.target === 'postman';
}

function collectionStageLabel(stage) {
  if (stage === 'define') return 'Definicion';
  if (stage === 'setup') return 'Ambiente';
  if (stage === 'builder') return 'Builder';
  return stage;
}

function collectionSetStudioStage(stage) {
  collectionState.studioStage = stage;
  collectionRenderStudioStage();
}

function collectionRenderStudioStage() {
  var intro = document.getElementById('collection-studio-intro');
  var config = document.getElementById('collection-config');
  var services = document.getElementById('collection-services');
  var stageButtons = document.querySelectorAll('.collection-stage-btn');
  var shell = document.querySelector('.collection-shell-studio');
  var stage = collectionState.studioStage || 'define';
  Array.prototype.forEach.call(stageButtons, function(button) {
    var isActive = button.dataset.stage === stage;
    button.classList.toggle('active', isActive);
  });

  if (shell) {
    shell.classList.toggle('collection-shell-studio-builder', stage === 'builder');
  }

  if (intro) intro.style.display = stage === 'define' ? 'block' : 'none';
  if (config) config.style.display = stage === 'setup' ? 'block' : 'none';
  if (services) services.style.display = stage === 'builder' ? 'block' : 'none';

  var summary = document.getElementById('collection-studio-summary');
  if (summary) {
    var formatText = collectionState.format ? collectionState.format.toUpperCase() : 'Sin formato';
    var targetText = collectionState.target ? collectionState.target : 'Sin destino';
    summary.textContent = 'Camino seleccionado: ' + formatText + ' + ' + targetText + '.';
  }

  var defineContinue = document.getElementById('collection-stage-continue');
  if (defineContinue) defineContinue.disabled = !collectionPathSupported();

  if (stage === 'setup') collectionRefreshContext();
}

function collectionSyncToolbarChoices() {
  var pairs = [
    ['format', 'json', 'col-toolbar-format-json'],
    ['format', 'xml', 'col-toolbar-format-xml'],
    ['target', 'postman', 'col-toolbar-target-postman'],
    ['target', 'soap', 'col-toolbar-target-soap']
  ];
  pairs.forEach(function(pair) {
    var el = document.getElementById(pair[2]);
    if (!el) return;
    if (collectionState[pair[0]] === pair[1]) el.classList.add('sel');
    else el.classList.remove('sel');
  });
}

function collectionPickToolbarChoice(kind, value, el) {
  collectionState[kind] = value;
  if (el && el.parentElement) {
    Array.prototype.forEach.call(el.parentElement.querySelectorAll('.collection-mode-btn'), function(button) {
      if (button.dataset.kind === kind) button.classList.remove('sel');
    });
    el.classList.add('sel');
  }
  collectionClearStatus();
  collectionResetResult();
  collectionResetExecution();
  collectionToggleConfig();
}

function collectionUpgradeStudioLayout() {
  if (collectionStudioUpgraded) return;
  var shell = document.querySelector('#collection-mount .collection-shell') || document.querySelector('.collection-shell');
  if (!shell) return;
  collectionStudioUpgraded = true;
  shell.classList.add('collection-shell-studio');

  var existingTitle = shell.querySelector('.ptitle');
  var existingLead = shell.querySelector('.collection-lead');
  if (existingTitle) existingTitle.style.display = 'none';
  if (existingLead) existingLead.style.display = 'none';

  var formatCard = document.getElementById('col-format-json');
  var targetCard = document.getElementById('col-target-postman');
  var formatBlock = formatCard ? formatCard.closest('.collection-block') : null;
  var targetBlock = targetCard ? targetCard.closest('.collection-block') : null;
  if (formatBlock) formatBlock.style.display = 'none';
  if (targetBlock) targetBlock.style.display = 'none';

  var top = document.createElement('div');
  top.className = 'collection-studio-top';
  top.innerHTML =
    '<div class="collection-studio-brand">' +
      '<div class="collection-studio-mark">C</div>' +
      '<div>' +
        '<div class="collection-studio-title">Constructor de Cadenas</div>' +
        '<div class="collection-studio-subtitle">Genera casos de prueba JSON a partir de Swagger y arma cadenas visuales listas para exportar a Postman.</div>' +
      '</div>' +
    '</div>' +
    '<div class="collection-studio-actions">' +
      '<button type="button" class="collection-mode-btn collection-mode-btn-soon" id="col-toolbar-format-xml" data-kind="format" onclick="collectionPickToolbarChoice(' + "'" + 'format' + "'" + ',' + "'" + 'xml' + "'" + ', this)">XML</button>' +
      '<button type="button" class="collection-mode-btn" id="col-toolbar-format-json" data-kind="format" onclick="collectionPickToolbarChoice(' + "'" + 'format' + "'" + ',' + "'" + 'json' + "'" + ', this)">JSON</button>' +
      '<button type="button" class="collection-mode-btn" id="col-toolbar-target-postman" data-kind="target" onclick="collectionPickToolbarChoice(' + "'" + 'target' + "'" + ',' + "'" + 'postman' + "'" + ', this)">Postman</button>' +
      '<button type="button" class="collection-mode-btn collection-mode-btn-soon" id="col-toolbar-target-soap" data-kind="target" onclick="collectionPickToolbarChoice(' + "'" + 'target' + "'" + ',' + "'" + 'soap' + "'" + ', this)">SOAP</button>' +
    '</div>';
  shell.insertBefore(top, shell.firstChild);

  var stageBar = document.createElement('div');
  stageBar.className = 'collection-stagebar';
  stageBar.innerHTML =
    '<button type="button" class="collection-stage-btn active" data-stage="define" onclick="collectionSetStudioStage(' + "'" + 'define' + "'" + ')">1. Definicion</button>' +
    '<button type="button" class="collection-stage-btn" data-stage="setup" onclick="collectionSetStudioStage(' + "'" + 'setup' + "'" + ')">2. Ambiente</button>' +
    '<button type="button" class="collection-stage-btn" data-stage="builder" onclick="collectionSetStudioStage(' + "'" + 'builder' + "'" + ')">3. Builder</button>';
  shell.insertBefore(stageBar, top.nextSibling);

  var intro = document.createElement('div');
  intro.id = 'collection-studio-intro';
  intro.className = 'collection-studio-intro';
  intro.innerHTML =
    '<div class="collection-studio-intro-card">' +
      '<div class="collection-studio-intro-kicker">Paso 1</div>' +
      '<div class="collection-studio-intro-title">Defini el camino de trabajo</div>' +
      '<div class="collection-studio-intro-copy">Elegí el formato y el destino desde la barra superior. Cuando confirmes este paso te llevamos a la configuración del ambiente y Swagger.</div>' +
      '<div id="collection-studio-summary" class="collection-studio-summary">Camino seleccionado: Sin formato + Sin destino.</div>' +
      '<div class="collection-studio-intro-actions">' +
        '<button type="button" class="btn btn-primary" id="collection-stage-continue" onclick="collectionSetStudioStage(' + "'" + 'setup' + "'" + ')" disabled>Confirmar y seguir</button>' +
      '</div>' +
    '</div>';
  shell.insertBefore(intro, document.getElementById('collection-config'));

  var config = document.getElementById('collection-config');
  if (config) {
    config.classList.remove('collection-block');
    config.classList.add('collection-studio-config');
    var h3 = config.querySelector('h3');
    if (h3) h3.style.display = 'none';
    var field = config.querySelector('.field');
    var actions = config.querySelector('.collection-actions');
    var summary = document.getElementById('collection-env-summary');
    if (field && actions && !config.querySelector('.collection-studio-config-row')) {
      var row = document.createElement('div');
      row.className = 'collection-studio-config-row';
      var main = document.createElement('div');
      main.className = 'collection-studio-config-main';
      main.appendChild(field);
      var toolbar = document.createElement('div');
      toolbar.className = 'collection-studio-toolbar';
      toolbar.appendChild(actions);
      row.appendChild(main);
      row.appendChild(toolbar);
      config.insertBefore(row, summary || config.firstChild);
    }
    if (summary) summary.className = 'collection-studio-env';
    var nav = document.createElement('div');
    nav.className = 'collection-stage-footer';
    nav.innerHTML =
      '<button type="button" class="btn btn-ghost" onclick="collectionSetStudioStage(' + "'" + 'define' + "'" + ')">&#8592; Volver</button>' +
      '<button type="button" class="btn btn-primary" onclick="collectionLoadServices()">Autenticar y seguir al builder</button>';
    config.appendChild(nav);
  }

  var services = document.getElementById('collection-services');
  if (services) {
    services.classList.remove('collection-block');
    services.classList.add('collection-studio-workspace');
    var footer = document.createElement('div');
    footer.className = 'collection-stage-footer';
    footer.innerHTML =
      '<button type="button" class="btn btn-ghost" onclick="collectionSetStudioStage(' + "'" + 'setup' + "'" + ')">&#8592; Volver al ambiente</button>';
    services.appendChild(footer);
  }

  collectionSyncToolbarChoices();
  collectionRenderStudioStage();
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

function collectionResolveV4AuthUrl(api) {
  var publicBaseUrl = String((api && api.BASE_URL) || '').trim().replace(/\/+$/g, '');
  var apiBaseUrl = String((api && api.API_BASE_URL) || '').trim().replace(/\/+$/g, '');
  if (publicBaseUrl) return publicBaseUrl + '/Authenticate/v1/Execute';
  if (apiBaseUrl) {
    var normalized = apiBaseUrl.replace(/\/api\/publicapi$/i, '');
    return normalized + '/api/publicapi/Authenticate/v1/Execute';
  }
  return 'sin URL de autenticacion';
}

function collectionResetLoadedData() {
  collectionState.services = [];
  collectionState.serviceOperations = {};
  collectionState.swaggerResolvedUrl = '';
  collectionState.swaggerBaseUrl = '';
  collectionState.swaggerAuthUrl = '';
  collectionState.studioStage = collectionPathSupported() ? 'setup' : 'define';
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

function collectionGuessSwaggerUrl(api) {
  var publicBaseUrl = String((api && api.BASE_URL) || '').trim().replace(/\/+$/g, '');
  if (!publicBaseUrl) return '';
  if (/\/api\/publicapi$/i.test(publicBaseUrl)) {
    return publicBaseUrl.replace(/\/api\/publicapi$/i, '/api/swagger-ui/index.html#/');
  }
  return publicBaseUrl.replace(/\/+$/g, '') + '/swagger-ui/index.html#/';
}

function collectionUpdateSwaggerUrl(value) {
  collectionState.swaggerUrl = String(value || '').trim();
}

function collectionIsAutoResolvedKey(key, pathLabel) {
  var normalized = String(pathLabel || key || '').trim().toLowerCase();
  return [
    'device',
    'usuario',
    'user',
    'userid',
    'username',
    'requerimiento',
    'requirement',
    'canal',
    'channel',
    'token',
    'authorization',
    'idempotency-key',
    'content-type'
  ].indexOf(normalized) >= 0;
}

function collectionBindButtons() {
  if (collectionButtonsBound) return;
  var btnDb = document.getElementById('btn-collection-test-db');
  var btnAuth = document.getElementById('btn-collection-test-auth');
  var btnServices = document.getElementById('btn-collection-load-services');
  if (!btnDb || !btnAuth || !btnServices) return;

  btnDb.addEventListener('click', function(event) {
    event.preventDefault();
    collectionTestDb();
  });
  btnAuth.addEventListener('click', function(event) {
    event.preventDefault();
    collectionTestAuth();
  });
  btnServices.addEventListener('click', function(event) {
    event.preventDefault();
    collectionLoadServices();
  });
  collectionButtonsBound = true;
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
    : collectionResolveV4AuthUrl(api);
  var swaggerInput = document.getElementById('collection-swagger-url');
  if (swaggerInput && !swaggerInput.value) {
    var guessedSwaggerUrl = collectionState.swaggerUrl || collectionGuessSwaggerUrl(api);
    if (guessedSwaggerUrl) {
      swaggerInput.value = guessedSwaggerUrl;
      collectionState.swaggerUrl = guessedSwaggerUrl;
    }
  }

  summary.textContent =
    'Version: ' + (S.version || '-') +
    ' | Plataforma: ' + (S.platform || '-') +
    ' | BD: ' + (dbLabel || 'sin datos completos') +
    ' | API publica: ' + ((api.BASE_URL || '').trim() || 'sin BASE_URL') +
    ' | Core: ' + ((api.API_BASE_URL || '').trim() || 'sin API_BASE_URL') +
    ' | Auth: ' + authLabel;
}

function collectionToggleConfig() {
  var note = document.getElementById('collection-path-note');
  var config = document.getElementById('collection-config');
  var services = document.getElementById('collection-services');
  if (!note || !config || !services) return;
  collectionSyncToolbarChoices();

  if (!collectionState.format || !collectionState.target) {
    note.style.display = 'none';
    config.style.display = 'none';
    services.style.display = 'none';
    collectionSetStudioStage('define');
    return;
  }

  note.style.display = 'block';
  if (collectionPathSupported()) {
    note.innerHTML = '<strong>Camino activo:</strong> JSON + Postman. Se va a generar una collection REST tomando endpoints, parametros y estructuras desde Swagger.';
    if (collectionState.studioStage === 'define') {
      config.style.display = 'none';
      services.style.display = 'none';
    }
    collectionRefreshContext();
  } else {
    note.innerHTML = '<strong>Camino preparado:</strong> ' + collectionState.format.toUpperCase() + ' + ' + collectionState.target + '. Ese flujo queda encaminado, pero por ahora el generador activo es JSON + Postman.';
    config.style.display = 'none';
    services.style.display = 'none';
  }
  collectionRenderStudioStage();
}

function collectionPickChoice(kind, value, el) {
  collectionState[kind] = value;
  var group = el && el.closest ? (el.closest('.collection-mini-cards') || el.closest('.collection-studio-actions')) : null;
  if (group) {
    Array.prototype.forEach.call(group.querySelectorAll('.ccard, .collection-mode-btn'), function(card) {
      card.classList.remove('sel');
    });
  }
  if (el) el.classList.add('sel');
  collectionSyncToolbarChoices();
  collectionClearStatus();
  collectionResetResult();
  collectionResetExecution();
  collectionToggleConfig();
}

function collectionUpdateName(value) {
  collectionState.collectionName = value || 'Bantotal JSON Collection';
}

function collectionRenameActiveScenario(value) {
  var scenario = collectionGetActiveScenario();
  if (!scenario) return;
  scenario.name = value || 'Caso de uso';
  collectionRenderScenarios();
  collectionRenderItems();
}

function collectionGetSelectedItemIndex() {
  var scenario = collectionGetActiveScenario();
  if (!scenario) return -1;
  if (!scenario.items.length) return -1;
  if (typeof scenario.selectedItemIndex !== 'number' || scenario.selectedItemIndex < 0 || scenario.selectedItemIndex >= scenario.items.length) {
    scenario.selectedItemIndex = 0;
  }
  return scenario.selectedItemIndex;
}

function collectionGetSelectedItem() {
  var scenario = collectionGetActiveScenario();
  var index = collectionGetSelectedItemIndex();
  if (!scenario || index < 0) return null;
  return scenario.items[index] || null;
}

function collectionSetSelectedItem(index) {
  var scenario = collectionGetActiveScenario();
  if (!scenario) return;
  scenario.selectedItemIndex = index;
  collectionRenderItems();
  collectionRenderVariableEditor();
  collectionResetExecution();
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
  collectionEnsureScenario();
  var active = collectionGetActiveScenario();
  var scenarioNameInput = document.getElementById('collection-scenario-name');
  if (scenarioNameInput && active && scenarioNameInput !== document.activeElement) {
    scenarioNameInput.value = active.name || '';
  }
  if (!container) return;
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

function collectionSelectedItemInputValue(key, fallback) {
  var item = collectionGetSelectedItem();
  if (item && item.inputOverrides && Object.prototype.hasOwnProperty.call(item.inputOverrides, key)) {
    return item.inputOverrides[key];
  }
  return collectionVariableValue(key, fallback);
}

function collectionUpdateVar(key, value) {
  var scenario = collectionGetActiveScenario();
  if (!scenario) return;
  scenario.variableOverrides[key] = value;
  var item = collectionGetSelectedItem();
  if (item) {
    if (!item.inputOverrides) item.inputOverrides = {};
    item.inputOverrides[key] = value;
  }
}

function collectionSyncInspectorInputs() {
  var scenario = collectionGetActiveScenario();
  if (!scenario) return;
  var item = collectionGetSelectedItem();
  var inputs = document.querySelectorAll('[data-collection-input-key]');
  Array.prototype.forEach.call(inputs, function(input) {
    var key = input.getAttribute('data-collection-input-key');
    if (!key) return;
    scenario.variableOverrides[key] = input.value;
    if (item) {
      if (!item.inputOverrides) item.inputOverrides = {};
      item.inputOverrides[key] = input.value;
    }
  });
}

function collectionBuildSelectedItemExecutionUrl() {
  var item = collectionGetSelectedItem();
  if (!item) return '';
  var scenario = collectionGetActiveScenario();
  var runtimeValues = Object.assign({}, (scenario && scenario.variableOverrides) || {});
  if (item.inputOverrides) {
    Object.keys(item.inputOverrides).forEach(function(key) {
      runtimeValues[key] = item.inputOverrides[key];
    });
  }
  var baseUrl = String(collectionState.swaggerBaseUrl || '').replace(/\/+$/g, '');
  var replacedPath = String(item.path || '').replace(/\{([^}]+)\}/g, function(_, name) {
    var key = String(name || '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'value';
    var value = Object.prototype.hasOwnProperty.call(runtimeValues, key) ? runtimeValues[key] : '';
    return encodeURIComponent(String(value));
  });
  var queryParams = (item.manualInputs || []).filter(function(input) {
    return String(input.location || '').toLowerCase() === 'query';
  });
  var qs = queryParams.map(function(input) {
    var value = Object.prototype.hasOwnProperty.call(runtimeValues, input.key)
      ? runtimeValues[input.key]
      : (input.defaultValue || '');
    return encodeURIComponent(input.pathLabel || input.key) + '=' + encodeURIComponent(String(value));
  }).join('&');
  return baseUrl + replacedPath + (qs ? '?' + qs : '');
}

function collectionSaveSelectedStepInputs() {
  collectionSyncInspectorInputs();
  var preview = document.getElementById('collection-step-url-preview');
  if (preview) {
    preview.textContent = collectionBuildSelectedItemExecutionUrl() || 'Sin URL para mostrar.';
  }
  collectionShowStatus('ok', 'Entradas del paso guardadas.');
}

function collectionNormalizeMappingConfig(mapping) {
  if (!mapping) return null;
  if (typeof mapping === 'string') return { sourceVarKey: mapping };
  if (typeof mapping !== 'object') return null;
  if (!mapping.sourceVarKey) return null;
  return {
    sourceVarKey: String(mapping.sourceVarKey || ''),
    filterField: String(mapping.filterField || ''),
    filterValue: String(mapping.filterValue || ''),
    collectionPathLabel: String(mapping.collectionPathLabel || ''),
    itemPathLabel: String(mapping.itemPathLabel || '')
  };
}

function collectionInputMappingConfig(mappingKey) {
  var scenario = collectionGetActiveScenario();
  if (!scenario || !scenario.inputMappings) return null;
  return collectionNormalizeMappingConfig(scenario.inputMappings[mappingKey]);
}

function collectionInputMappingValue(mappingKey) {
  var mapping = collectionInputMappingConfig(mappingKey);
  return mapping ? mapping.sourceVarKey : '';
}

function collectionUpdateInputMapping(mappingKey, value) {
  var scenario = collectionGetActiveScenario();
  if (!scenario) return;
  if (!scenario.inputMappings) scenario.inputMappings = {};
  if (value) {
    var current = collectionNormalizeMappingConfig(scenario.inputMappings[mappingKey]) || {};
    var next = { sourceVarKey: value };
    if (current.sourceVarKey === value) {
      if (current.filterField) next.filterField = current.filterField;
      if (current.filterValue) next.filterValue = current.filterValue;
      if (current.collectionPathLabel) next.collectionPathLabel = current.collectionPathLabel;
      if (current.itemPathLabel) next.itemPathLabel = current.itemPathLabel;
    }
    scenario.inputMappings[mappingKey] = next;
  } else delete scenario.inputMappings[mappingKey];
  collectionRenderVariableEditor();
}

function collectionUpdateInputMappingFilterField(mappingKey, value) {
  var scenario = collectionGetActiveScenario();
  if (!scenario || !scenario.inputMappings) return;
  var current = collectionNormalizeMappingConfig(scenario.inputMappings[mappingKey]);
  if (!current || !current.sourceVarKey) return;
  if (value) current.filterField = value;
  else delete current.filterField;
  scenario.inputMappings[mappingKey] = current;
  collectionRenderVariableEditor();
}

function collectionUpdateInputMappingFilterValue(mappingKey, value) {
  var scenario = collectionGetActiveScenario();
  if (!scenario || !scenario.inputMappings) return;
  var current = collectionNormalizeMappingConfig(scenario.inputMappings[mappingKey]);
  if (!current || !current.sourceVarKey) return;
  if (value) current.filterValue = value;
  else delete current.filterValue;
  scenario.inputMappings[mappingKey] = current;
  collectionRenderVariableEditor();
}

function collectionUpdateOutputAlias(sourceVarKey, value) {
  var scenario = collectionGetActiveScenario();
  if (!scenario) return;
  if (!scenario.outputAliases) scenario.outputAliases = {};
  var trimmed = String(value || '').trim();
  if (trimmed) scenario.outputAliases[sourceVarKey] = trimmed;
  else delete scenario.outputAliases[sourceVarKey];
  collectionLoadPreview();
}

function collectionOutputDisplayName(output) {
  return output.alias || output.displayLabel || output.sourceVarKey;
}

function collectionSplitCollectionOutputPath(pathLabel) {
  var parts = String(pathLabel || '').split('.').filter(Boolean);
  var itemIndex = parts.indexOf('item');
  if (itemIndex <= 0 || itemIndex >= parts.length - 1) return null;
  return {
    collectionPathLabel: parts.slice(0, itemIndex).join('.'),
    itemPathLabel: parts.slice(itemIndex + 1).join('.')
  };
}

function collectionDecoratePreviewOutputs(outputs) {
  var groups = {};
  (outputs || []).forEach(function(output) {
    var split = collectionSplitCollectionOutputPath(output.pathLabel || '');
    if (!split) return;
    output.collectionPathLabel = split.collectionPathLabel;
    output.itemPathLabel = split.itemPathLabel;
    output.isCollectionItemOutput = true;
    var groupKey = (output.sourceGroupKey || '') + '::' + split.collectionPathLabel;
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(output);
  });
  (outputs || []).forEach(function(output) {
    if (!output.isCollectionItemOutput) return;
    var key = (output.sourceGroupKey || '') + '::' + (output.collectionPathLabel || '');
    output.filterFieldOptions = (groups[key] || []).map(function(option) {
      return {
        value: option.itemPathLabel || option.key || option.pathLabel,
        label: option.itemPathLabel || option.displayLabel || option.key || option.pathLabel
      };
    });
  });
  return outputs || [];
}

function collectionFindSourceOption(input, sourceVarKey) {
  var options = (input && input.sourceOptions) || [];
  for (var i = 0; i < options.length; i++) {
    if (options[i].sourceVarKey === sourceVarKey) return options[i];
  }
  return null;
}

function collectionInputMappingFilterField(mappingKey) {
  var mapping = collectionInputMappingConfig(mappingKey);
  return mapping && mapping.filterField ? mapping.filterField : '';
}

function collectionInputMappingFilterValue(mappingKey) {
  var mapping = collectionInputMappingConfig(mappingKey);
  return mapping && mapping.filterValue ? mapping.filterValue : '';
}

function collectionNormalizeToken(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function collectionBuildOutputVarKey(item, outputField) {
  return String((item && item.service) || '') + '_' +
    String((item && item.method) || '') + '_' +
    String(((outputField && outputField.pathLabel) || (outputField && outputField.key) || 'output')).replace(/[^A-Za-z0-9]+/g, '_');
}

function collectionBuildInputMappingKey(item, input) {
  return String((item && item.operationKey) || ((item && item.service) || '') + '::' + ((item && item.method) || '')) +
    '::' + String((input && (input.pathLabel || input.key)) || '');
}

function collectionSuggestMappingForInput(input, sourceOptions) {
  var normalizedInput = collectionNormalizeToken((input && (input.pathLabel || input.key)) || '');
  if (!normalizedInput) return '';
  for (var i = sourceOptions.length - 1; i >= 0; i--) {
    var option = sourceOptions[i];
    if (collectionNormalizeToken(option.pathLabel) === normalizedInput) return option.sourceVarKey;
    if (collectionNormalizeToken(option.key) === normalizedInput) return option.sourceVarKey;
  }
  return '';
}

function collectionFlowId(prefix, value) {
  return prefix + '_' + String(value || '').replace(/[^A-Za-z0-9_]/g, '_');
}

function collectionRenderFlowConnections() {
  var stage = document.getElementById('collection-flow-stage');
  var svg = document.getElementById('collection-flow-svg');
  var scenario = collectionGetActiveScenario();
  if (!stage || !svg || !scenario) return;
  svg.setAttribute('width', String(stage.scrollWidth || stage.clientWidth || 0));
  svg.setAttribute('height', String(stage.scrollHeight || stage.clientHeight || 0));
  svg.setAttribute('viewBox', '0 0 ' + String(stage.scrollWidth || stage.clientWidth || 0) + ' ' + String(stage.scrollHeight || stage.clientHeight || 0));
  var rows = [];
  (scenario.previewVariables || []).forEach(function(input) {
    if (!input.mappingKey) return;
    var sourceVarKey = collectionInputMappingValue(input.mappingKey);
    if (!sourceVarKey) return;
    var sourceEl = document.getElementById(collectionFlowId('flow_out', sourceVarKey));
    var targetEl = document.getElementById(collectionFlowId('flow_in', input.mappingKey));
    if (!sourceEl || !targetEl) return;
    var sourceRect = sourceEl.getBoundingClientRect();
    var targetRect = targetEl.getBoundingClientRect();
    var stageRect = stage.getBoundingClientRect();
    var x1 = sourceRect.right - stageRect.left + stage.scrollLeft;
    var y1 = sourceRect.top - stageRect.top + (sourceRect.height / 2) + stage.scrollTop;
    var x2 = targetRect.left - stageRect.left + stage.scrollLeft;
    var y2 = targetRect.top - stageRect.top + (targetRect.height / 2) + stage.scrollTop;
    var delta = Math.max(44, Math.abs(x2 - x1) / 2);
    var midX = x1 + ((x2 - x1) / 2);
    var midY = y1 + ((y2 - y1) / 2);
    var option = null;
    for (var i = 0; i < (input.sourceOptions || []).length; i++) {
      if (input.sourceOptions[i].sourceVarKey === sourceVarKey) {
        option = input.sourceOptions[i];
        break;
      }
    }
    var suggested = collectionSuggestMappingForInput(input, input.sourceOptions || []);
    var manualClass = suggested && suggested === sourceVarKey ? ' collection-flow-link-auto' : ' collection-flow-link-manual';
    rows.push(
      '<path class="collection-flow-link' + manualClass + '" d="M ' + x1 + ' ' + y1 + ' C ' + (x1 + delta) + ' ' + y1 + ', ' + (x2 - delta) + ' ' + y2 + ', ' + x2 + ' ' + y2 + '"></path>' +
      '<rect class="collection-flow-link-label-bg" x="' + (midX - 56) + '" y="' + (midY - 11) + '" rx="8" ry="8" width="112" height="22"></rect>' +
      '<text class="collection-flow-link-label" x="' + midX + '" y="' + (midY + 4) + '" text-anchor="middle">' + collectionEscapeHtml(collectionOutputDisplayName(option || { sourceVarKey: sourceVarKey })) + ' → ' + collectionEscapeHtml(input.key) + '</text>'
    );
  });
  svg.innerHTML = rows.join('');
}

function collectionRenderFlowDesigner() {
  var wrap = document.getElementById('collection-flow-wrap');
  var container = document.getElementById('collection-flow');
  var scenario = collectionGetActiveScenario();
  if (!wrap || !container) return;

  if (!scenario || !scenario.items.length) {
    wrap.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  wrap.style.display = 'block';
  var authContext = collectionState.authContext || {};
  var authOutputs = [
    { sourceVarKey: 'token', displayLabel: 'token', alias: '', pathLabel: 'SessionToken', description: 'Token de sesion resuelto automaticamente por la app.' },
    { sourceVarKey: 'channel', displayLabel: 'channel', alias: '', pathLabel: 'Canal', description: 'Canal del ambiente ya cargado en el wizard.' },
    { sourceVarKey: 'username', displayLabel: 'username', alias: '', pathLabel: 'Usuario', description: 'Usuario del ambiente ya cargado en el wizard.' }
  ];

  var nodes = [
    '<div class="collection-flow-node collection-flow-node-auth">' +
      '<div class="collection-flow-node-head">' +
        '<div class="collection-flow-kicker">Autenticacion</div>' +
        '<div class="collection-flow-title">Authenticate</div>' +
        '<div class="collection-flow-subtitle">La app resuelve esta autenticacion una sola vez y reutiliza el contexto en el flujo.</div>' +
      '</div>' +
      '<div class="collection-flow-node-body">' +
        '<div class="collection-flow-col">' +
          '<div class="collection-flow-col-title">Contexto</div>' +
          '<div class="collection-flow-list">' +
            '<div class="collection-flow-port collection-flow-port-in"><div class="collection-flow-port-name">Canal / Usuario</div><div class="collection-flow-port-meta">' + collectionEscapeHtml((authContext.channel || 'wizard') + ' | ' + (authContext.username || 'wizard')) + '</div></div>' +
            '<div class="collection-flow-port collection-flow-port-in"><div class="collection-flow-port-name">Device / Req.</div><div class="collection-flow-port-meta">' + collectionEscapeHtml((authContext.device || 'wizard') + ' | ' + (authContext.requirement || 'wizard')) + '</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="collection-flow-col">' +
          '<div class="collection-flow-col-title">Outputs</div>' +
          '<div class="collection-flow-list">' +
            authOutputs.map(function(output) {
              return '<div class="collection-flow-port collection-flow-port-out" id="' + collectionFlowId('flow_out', output.sourceVarKey) + '">' +
                '<div class="collection-flow-port-name">' + collectionEscapeHtml(output.displayLabel) + '</div>' +
                '<div class="collection-flow-port-meta">' + collectionEscapeHtml(output.description) + '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="collection-flow-footer">Este bloque todavia no se conecta campo a campo con Swagger porque esos headers quedan resueltos a nivel de ejecucion.</div>' +
    '</div>'
  ];

  scenario.items.forEach(function(item, itemIndex) {
    var groupKey = item.service + '.' + item.method + '::' + itemIndex;
    var scalarInputs = (scenario.previewVariables || []).filter(function(input) {
      return input.groupKey === groupKey && !input.repeatableGroupKey;
    });
    var repeatableInputs = (scenario.previewVariables || []).filter(function(input) {
      return input.groupKey === groupKey && !!input.repeatableGroupKey;
    });
    var outputs = (scenario.previewOutputs || []).filter(function(output) {
      return output.sourceGroupKey === groupKey;
    });
    nodes.push(
      '<div class="collection-flow-node">' +
        '<div class="collection-flow-node-head">' +
          '<div class="collection-flow-kicker">Paso ' + (itemIndex + 1) + '</div>' +
          '<div class="collection-flow-title">' + collectionEscapeHtml(item.method) + '</div>' +
          '<div class="collection-flow-subtitle">' + collectionEscapeHtml(String(item.httpMethod || 'GET').toUpperCase() + ' ' + (item.path || '')) + '</div>' +
        '</div>' +
        '<div class="collection-flow-node-body">' +
          '<div class="collection-flow-col">' +
            '<div class="collection-flow-col-title">Inputs</div>' +
            '<div class="collection-flow-list">' +
              (scalarInputs.length ? scalarInputs.map(function(input) {
                var mappedSource = input.mappingKey ? collectionInputMappingValue(input.mappingKey) : '';
                return '<div class="collection-flow-port collection-flow-port-in" id="' + collectionFlowId('flow_in', input.mappingKey) + '">' +
                  '<div class="collection-flow-port-name">' + collectionEscapeHtml(input.key) + '</div>' +
                  '<div class="collection-flow-port-meta">' + collectionEscapeHtml((input.pathLabel || input.key) + (input.type ? ' | ' + input.type : '')) + '</div>' +
                  (input.sourceOptions && input.sourceOptions.length
                    ? '<select class="collection-var-input collection-flow-select" onchange="collectionUpdateInputMapping(' + "'" + collectionEscapeHtml(input.mappingKey) + "'" + ', this.value)">' +
                        '<option value="">Completar a mano</option>' +
                        input.sourceOptions.map(function(option) {
                          var selected = mappedSource === option.sourceVarKey ? ' selected' : '';
                          return '<option value="' + collectionEscapeHtml(option.sourceVarKey) + '"' + selected + '>' + collectionEscapeHtml(collectionOutputDisplayName(option)) + '</option>';
                        }).join('') +
                      '</select>'
                    : '<div class="collection-flow-manual">Manual</div>') +
                  (mappedSource ? '<div class="collection-flow-port-note">Entrada resuelta desde una salida previa del flujo.</div>' : '') +
                '</div>';
              }).join('') : '<div class="collection-flow-empty">Este metodo no necesita inputs manuales visibles en Swagger.</div>') +
            '</div>' +
          '</div>' +
          '<div class="collection-flow-col">' +
            '<div class="collection-flow-col-title">Outputs</div>' +
            '<div class="collection-flow-list">' +
              (outputs.length ? outputs.map(function(output) {
                return '<div class="collection-flow-port collection-flow-port-out" id="' + collectionFlowId('flow_out', output.sourceVarKey) + '">' +
                  '<div class="collection-flow-port-name">' + collectionEscapeHtml(collectionOutputDisplayName(output)) + '</div>' +
                  '<div class="collection-flow-port-meta">' + collectionEscapeHtml((output.pathLabel || output.displayLabel || output.sourceVarKey) + (output.type ? ' | ' + output.type : '')) + '</div>' +
                  '<input class="collection-var-input collection-flow-alias" type="text" value="' + collectionEscapeHtml(output.alias || '') + '" placeholder="Renombre funcional" oninput="collectionUpdateOutputAlias(' + "'" + collectionEscapeHtml(output.sourceVarKey) + "'" + ', this.value)">' +
                '</div>';
              }).join('') : '<div class="collection-flow-empty">Todavia no se detectaron salidas exportables en la respuesta Swagger de este metodo.</div>') +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="collection-flow-footer">' +
          (repeatableInputs.length ? ('Tiene ' + repeatableInputs.length + ' campo(s) de listas/estructuras complejas que por ahora siguen editandose abajo en detalle.') : 'Los detalles finos del request siguen disponibles abajo en el editor de variables.') +
        '</div>' +
      '</div>'
    );
  });

  container.innerHTML =
    '<div id="collection-flow-stage" class="collection-flow-stage">' +
      '<svg id="collection-flow-svg" class="collection-flow-svg"></svg>' +
      '<div class="collection-flow-lane">' + nodes.join('') + '</div>' +
    '</div>' +
    '<div class="collection-flow-legend">' +
      '<span class="collection-flow-legend-item"><span class="collection-flow-legend-dot"></span> Match del flujo</span>' +
      '<span class="collection-flow-legend-item"><span class="collection-flow-legend-dot auth"></span> Autenticacion/contexto</span>' +
    '</div>';

  var stage = document.getElementById('collection-flow-stage');
  if (stage) stage.onscroll = collectionRenderFlowConnections;
  setTimeout(collectionRenderFlowConnections, 0);
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

function collectionFindOperationByKey(service, operationKey) {
  var operations = collectionState.serviceOperations[service] || [];
  for (var i = 0; i < operations.length; i++) {
    if ((operations[i].operationKey || '') === operationKey) return operations[i];
  }
  return null;
}

function collectionInsertOperation(service, operationKey, insertIndex) {
  var scenario = collectionGetActiveScenario();
  var selectedOperation = collectionFindOperationByKey(service, operationKey);
  if (!scenario || !selectedOperation) return;
  var method = selectedOperation.methodName;
  var operationKind = String(selectedOperation.httpMethod || '').toLowerCase() === 'get' ? 'query' : 'action';
  var exists = scenario.items.some(function(item) {
    return item.service === service && item.method === method;
  });
  if (exists) return;
  var nextItem = {
    service: service,
    method: method,
    operationKind: operationKind,
    httpMethod: selectedOperation.httpMethod,
    path: selectedOperation.path,
    summary: selectedOperation.summary || '',
    operationKey: selectedOperation.operationKey,
    manualInputs: selectedOperation.manualInputs || [],
    inputOverrides: {},
    bodyTemplate: selectedOperation.bodyTemplate || null,
    outputFields: selectedOperation.outputFields || []
  };
  var safeIndex = typeof insertIndex === 'number' && insertIndex >= 0 ? insertIndex : scenario.items.length;
  if (safeIndex > scenario.items.length) safeIndex = scenario.items.length;
  scenario.items.splice(safeIndex, 0, nextItem);
  scenario.selectedItemIndex = safeIndex;
  collectionRenderScenarios();
  collectionRenderItems();
  collectionLoadPreview();
  collectionResetResult();
  collectionResetExecution();
}

function collectionDragOperation(service, operationKey, event) {
  if (!event || !event.dataTransfer) return;
  event.dataTransfer.setData('text/plain', JSON.stringify({ service: service, operationKey: operationKey }));
  event.dataTransfer.effectAllowed = 'copy';
}

function collectionAllowCanvasDrop(event) {
  if (event) event.preventDefault();
}

function collectionDropOperation(insertIndex, event) {
  if (!event) return;
  event.preventDefault();
  try {
    var payload = JSON.parse(event.dataTransfer.getData('text/plain') || '{}');
    if (payload.service && payload.operationKey) {
      collectionInsertOperation(payload.service, payload.operationKey, insertIndex);
    }
  } catch (e) {}
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
  var flowWrap = document.getElementById('collection-flow-wrap');
  var wrap = document.getElementById('collection-vars-wrap');
  var container = document.getElementById('collection-vars');
  if (!wrap || !container) return;
  var scenario = collectionGetActiveScenario();

  if (!scenario || !scenario.items.length) {
    if (flowWrap) flowWrap.style.display = 'none';
    wrap.style.display = 'none';
    container.innerHTML = '';
    collectionRenderInspector();
    return;
  }
  if (flowWrap) flowWrap.style.display = 'none';
  wrap.style.display = 'none';
  container.innerHTML = '';
  collectionRenderInspector();
}

async function collectionLoadPreview() {
  var scenario = collectionGetActiveScenario();
  if (!scenario || !scenario.items.length) {
    if (scenario) {
      scenario.previewVariables = [];
      scenario.previewOutputs = [];
      scenario.previewMappings = [];
    }
    collectionRenderVariableEditor();
    return;
  }

  if (collectionPathSupported()) {
    scenario.previewVariables = [];
    scenario.previewOutputs = [];
    scenario.previewMappings = [];
    var availableOutputs = [];
    scenario.items.forEach(function(item, itemIndex) {
      (item.manualInputs || []).forEach(function(input) {
        if (collectionIsAutoResolvedKey(input.key, input.pathLabel)) return;
        var mappingKey = collectionBuildInputMappingKey(item, input);
        var sourceOptions = availableOutputs.slice();
        if (!collectionInputMappingValue(mappingKey)) {
          var suggestedSource = collectionSuggestMappingForInput(input, sourceOptions);
          if (suggestedSource) {
            scenario.inputMappings[mappingKey] = suggestedSource;
            scenario.previewMappings.push({
              target: item.service + '.' + item.method,
              input: input.pathLabel || input.key,
              source: suggestedSource
            });
          }
        }
        scenario.previewVariables.push({
          key: input.key,
          pathLabel: input.pathLabel || input.key,
          type: input.type || '',
          description: input.description || '',
          defaultValue: input.defaultValue || '',
          suggestions: [],
          mappingKey: mappingKey,
          sourceOptions: sourceOptions,
          groupKey: item.service + '.' + item.method + '::' + itemIndex,
          groupTitle: (itemIndex + 1) + '. ' + item.service + '.' + item.method
        });
      });
      (item.outputFields || []).forEach(function(outputField) {
        var sourceVarKey = collectionBuildOutputVarKey(item, outputField);
        var output = {
          key: outputField.key || '',
          pathLabel: outputField.pathLabel || outputField.key || '',
          type: outputField.type || '',
          description: outputField.description || '',
          sourceVarKey: sourceVarKey,
          sourceGroupKey: item.service + '.' + item.method + '::' + itemIndex,
          sourceLabel: (itemIndex + 1) + '. ' + item.service + '.' + item.method,
          displayLabel: outputField.key || outputField.pathLabel || sourceVarKey,
          alias: scenario.outputAliases[sourceVarKey] || ''
        };
        availableOutputs.push(output);
        scenario.previewOutputs.push(output);
      });
    });
    scenario.previewOutputs = collectionDecoratePreviewOutputs(scenario.previewOutputs || []);
    var outputsByKey = {};
    (scenario.previewOutputs || []).forEach(function(output) {
      outputsByKey[output.sourceVarKey] = output;
    });
    (scenario.previewVariables || []).forEach(function(input) {
      input.sourceOptions = (input.sourceOptions || []).map(function(option) {
        return outputsByKey[option.sourceVarKey] || option;
      });
      var currentMapping = input.mappingKey ? collectionInputMappingConfig(input.mappingKey) : null;
      var selectedOption = currentMapping ? collectionFindSourceOption(input, currentMapping.sourceVarKey) : null;
      if (currentMapping && selectedOption && selectedOption.isCollectionItemOutput) {
        currentMapping.collectionPathLabel = selectedOption.collectionPathLabel || '';
        currentMapping.itemPathLabel = selectedOption.itemPathLabel || '';
        scenario.inputMappings[input.mappingKey] = currentMapping;
      }
    });
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

  collectionShowStatus('ok', 'Probando autenticacion del ambiente actual...');
  try {
    var r = await fetch('/api/test-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: S.version, api: getApi() })
    });
    var d = await r.json();
    if (d.ok && d.authContext) {
      collectionState.authContext = d.authContext;
    }
    collectionShowStatus(d.ok ? 'ok' : 'err', d.ok ? 'Autenticacion exitosa.' : d.message);
  } catch (e) {
    collectionShowStatus('err', 'No se pudo probar la autenticacion.');
  }
}

async function collectionLoadServices() {
  collectionRefreshContext();
  if (!collectionPathSupported()) {
    collectionShowStatus('err', 'Por ahora solo esta disponible el camino JSON + Postman.');
    return;
  }
  if (typeof S === 'undefined' || !S.platform) {
    collectionShowStatus('err', 'Completa primero la plataforma en el wizard principal.');
    return;
  }

  collectionState.swaggerUrl = String(collectionState.swaggerUrl || ((document.getElementById('collection-swagger-url') || {}).value || '')).trim();
  if (!collectionState.swaggerUrl) {
    collectionShowStatus('err', 'Indica primero la ruta Swagger del ambiente.');
    return;
  }

  collectionShowStatus('ok', 'Leyendo Swagger del ambiente...');
  try {
    var r = await fetch('/api/collection/swagger/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ swaggerUrl: collectionState.swaggerUrl, api: getApi() })
    });
    var d = await r.json();
    if (!d.ok) throw new Error(d.message);

    collectionState.services = d.services || [];
    collectionState.serviceOperations = d.operationsByService || {};
    collectionState.swaggerResolvedUrl = d.resolvedUrl || '';
    collectionState.swaggerBaseUrl = d.baseUrl || '';
    collectionState.swaggerAuthUrl = d.authUrl || '';
    document.getElementById('collection-services').style.display = 'block';

    collectionShowStatus('ok', 'Swagger resuelto. Autenticando contra ese mismo ambiente...');
    var authResponse = await fetch('/api/test-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: S.version, api: getApi(), authUrl: collectionState.swaggerAuthUrl })
    });
    var authData = await authResponse.json();
    if (!authData.ok) throw new Error(authData.message || 'No se pudo autenticar usando el Authenticate del Swagger.');
    collectionState.authContext = authData.authContext || null;

    collectionFilterServices();
    collectionRenderVariableEditor();
    collectionSetStudioStage('builder');
    collectionShowStatus('ok', 'Swagger cargado y autenticacion resuelta usando ese mismo Swagger. Ahora arma el flujo.');
  } catch (e) {
    collectionShowStatus('err', e.message || 'No se pudieron cargar los servicios.');
  }
}

function collectionFilterServices() {
  var serviceFilterEl = document.getElementById('col-svc-filter');
  var methodFilterEl = document.getElementById('col-method-filter');
  var serviceFilter = ((serviceFilterEl && serviceFilterEl.value) || '').toLowerCase().trim();
  var methodFilter = ((methodFilterEl && methodFilterEl.value) || '').toLowerCase().trim();
  var sel = document.getElementById('col-sel-svc');
  if (sel) {
    var prev = sel.value;
    sel.innerHTML = '<option value="">-- Seleccionar --</option>';
    collectionState.services.filter(function(service) {
      if (serviceFilter && service.toLowerCase().indexOf(serviceFilter) < 0) return false;
      if (!methodFilter) return true;
      return (collectionState.serviceOperations[service] || []).some(function(operation) {
        var methodName = String(operation.methodName || '').toLowerCase();
        return methodName.indexOf(methodFilter) >= 0;
      });
    }).forEach(function(service) {
      var opt = document.createElement('option');
      opt.value = service;
      opt.textContent = service;
      if (service === prev) opt.selected = true;
      sel.appendChild(opt);
    });
    if (prev && sel.value !== prev) {
      var methodSel = document.getElementById('col-sel-mtd');
      if (methodSel) methodSel.innerHTML = '<option value="">-- Seleccionar --</option>';
    }
  }
  collectionRenderItems();
}

async function collectionLoadMethods(service) {
  var sel = document.getElementById('col-sel-mtd');
  if (!sel) return;
  sel.innerHTML = '<option value="">Cargando...</option>';
  if (!service) {
    sel.innerHTML = '<option value="">-- Seleccionar --</option>';
    return;
  }

  sel.innerHTML = '<option value="">-- Seleccionar --</option>';
  (collectionState.serviceOperations[service] || []).forEach(function(operation, index) {
    var opt = document.createElement('option');
    opt.value = operation.operationKey || (service + '::' + operation.methodName + '::' + index);
    opt.textContent = operation.methodName + ' [' + String(operation.httpMethod || 'GET').toUpperCase() + ']';
    sel.appendChild(opt);
  });
}

function collectionRenderServiceCatalog() {
  var container = document.getElementById('collection-service-list');
  if (!container) return;
  var serviceFilter = ((document.getElementById('col-svc-filter') || {}).value || '').toLowerCase().trim();
  var methodFilter = ((document.getElementById('col-method-filter') || {}).value || '').toLowerCase().trim();
  var groups = collectionState.services.map(function(service) {
    if (serviceFilter && service.toLowerCase().indexOf(serviceFilter) < 0) {
      return { service: service, operations: [] };
    }
    var operations = (collectionState.serviceOperations[service] || []).filter(function(operation) {
      var methodName = String(operation.methodName || '').toLowerCase();
      var summary = String(operation.summary || operation.path || '').toLowerCase();
      if (methodFilter && methodName.indexOf(methodFilter) < 0 && summary.indexOf(methodFilter) < 0) return false;
      return true;
    });
    return { service: service, operations: operations };
  }).filter(function(group) {
    return group.operations.length > 0;
  });

  if (!groups.length) {
    container.innerHTML = '<div class="collection-step-empty">Todavia no hay servicios cargados o el filtro no encontro resultados.</div>';
    return;
  }

  container.innerHTML = groups.map(function(group) {
    return '<div class="collection-service-group">' +
      '<div class="collection-service-group-title">' + collectionEscapeHtml(group.service) + '</div>' +
      group.operations.map(function(operation) {
        return '<div class="collection-service-card" draggable="true" onclick="collectionInsertOperation(' + "'" + collectionEscapeHtml(group.service) + "'" + ', ' + "'" + collectionEscapeHtml(operation.operationKey) + "'" + ')" ondragstart="collectionDragOperation(' + "'" + collectionEscapeHtml(group.service) + "'" + ', ' + "'" + collectionEscapeHtml(operation.operationKey) + "'" + ', event)">' +
          '<div class="collection-service-card-main">' +
            '<div class="collection-service-card-name">' + collectionEscapeHtml(operation.methodName) + '</div>' +
            '<div class="collection-service-card-meta">' + collectionEscapeHtml(String(operation.httpMethod || 'GET').toUpperCase() + ' | ' + (operation.summary || operation.path || 'Sin descripcion')) + '</div>' +
          '</div>' +
          '<span class="collection-service-card-tag">+</span>' +
        '</div>';
      }).join('') +
    '</div>';
  }).join('');
}

function collectionRenderInspector() {
  var container = document.getElementById('collection-step-config');
  if (!container) return;
  var scenario = collectionGetActiveScenario();
  var selectedItem = collectionGetSelectedItem();
  if (!scenario || !selectedItem) {
    container.innerHTML = '<div class="collection-step-empty">Selecciona un paso del flujo para ver sus entradas, salidas y ajustes manuales.</div>';
    return;
  }
  var selectedIndex = collectionGetSelectedItemIndex();
  var groupKey = selectedItem.service + '.' + selectedItem.method + '::' + selectedIndex;
  var scalarInputs = (scenario.previewVariables || []).filter(function(input) {
    return input.groupKey === groupKey && !input.repeatableGroupKey;
  });
  var repeatableInputs = (scenario.previewVariables || []).filter(function(input) {
    return input.groupKey === groupKey && !!input.repeatableGroupKey;
  });
  var outputs = (scenario.previewOutputs || []).filter(function(output) {
    return output.sourceGroupKey === groupKey;
  });
  var executionUrl = collectionBuildSelectedItemExecutionUrl();

  container.innerHTML =
    '<div class="collection-config-section">' +
      '<div class="collection-config-title">Servicio seleccionado</div>' +
      '<div class="collection-config-service">' +
        '<div class="collection-config-service-badge">' + (selectedIndex + 1) + '</div>' +
        '<div class="collection-config-service-copy">' +
          '<div class="collection-config-service-name">' + collectionEscapeHtml(selectedItem.method) + '</div>' +
          '<div class="collection-config-service-meta">' + collectionEscapeHtml(selectedItem.service + ' | ' + String(selectedItem.httpMethod || 'GET').toUpperCase()) + '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="collection-config-section">' +
      '<div class="collection-config-title">Descripcion</div>' +
      '<div class="collection-config-item"><div class="collection-config-item-meta">' + collectionEscapeHtml(selectedItem.summary || selectedItem.path || 'Sin descripcion disponible en Swagger.') + '</div></div>' +
    '</div>' +
    '<div class="collection-config-section">' +
      '<div class="collection-config-title">URL de ejecucion</div>' +
      '<div class="collection-config-item">' +
        '<div class="collection-config-item-row">' +
          '<button type="button" class="btn btn-outline btn-sm" onclick="collectionSaveSelectedStepInputs()">Guardar entradas</button>' +
        '</div>' +
        '<div class="collection-config-item-row">' +
          '<div id="collection-step-url-preview" class="collection-config-url-preview">' + collectionEscapeHtml(executionUrl || 'Sin URL para mostrar.') + '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="collection-config-section">' +
      '<div class="collection-config-title">Entradas</div>' +
      (scalarInputs.length ? scalarInputs.map(function(input) {
        var currentValue = collectionSelectedItemInputValue(input.key, input.defaultValue || '');
        var mappingKey = input.mappingKey || '';
        var mappingConfig = mappingKey ? collectionInputMappingConfig(mappingKey) : null;
        var mappedSource = mappingConfig ? mappingConfig.sourceVarKey : '';
        var mappedOption = mappedSource ? collectionFindSourceOption(input, mappedSource) : null;
        var filterField = mappingConfig ? (mappingConfig.filterField || '') : '';
        var filterValue = mappingConfig ? (mappingConfig.filterValue || '') : '';
        if (mappingKey && mappingConfig && mappedOption && mappedOption.isCollectionItemOutput) {
          mappingConfig.collectionPathLabel = mappedOption.collectionPathLabel || '';
          mappingConfig.itemPathLabel = mappedOption.itemPathLabel || '';
          if (!scenario.inputMappings) scenario.inputMappings = {};
          scenario.inputMappings[mappingKey] = mappingConfig;
        }
        return '<div class="collection-config-item">' +
          '<div class="collection-config-item-name">' + collectionEscapeHtml(input.key) + '</div>' +
          '<div class="collection-config-item-meta">' + collectionEscapeHtml((input.pathLabel || input.key) + (input.type ? ' | ' + input.type : '') + (input.description ? ' | ' + input.description : '')) + '</div>' +
          (input.sourceOptions && input.sourceOptions.length ? '<div class="collection-config-item-row"><select class="collection-var-input" onchange="collectionUpdateInputMapping(' + "'" + collectionEscapeHtml(mappingKey) + "'" + ', this.value)"><option value=\"\">Completar a mano</option>' + input.sourceOptions.map(function(option) {
            var selected = mappedSource === option.sourceVarKey ? ' selected' : '';
            return '<option value="' + collectionEscapeHtml(option.sourceVarKey) + '"' + selected + '>' + collectionEscapeHtml(collectionOutputDisplayName(option)) + '</option>';
          }).join('') + '</select></div>' : '') +
          (mappedOption && mappedOption.isCollectionItemOutput ? '<div class="collection-config-filter-box">' +
            '<div class="collection-config-filter-title">Filtrar item de la lista origen</div>' +
            '<div class="collection-config-item-meta">La salida viene de una coleccion. Puedes elegir que registro tomar antes de pasarlo a este input.</div>' +
            '<div class="collection-config-filter-grid">' +
              '<select class="collection-var-input" onchange="collectionUpdateInputMappingFilterField(' + "'" + collectionEscapeHtml(mappingKey) + "'" + ', this.value)"><option value=\"\">Sin filtro (primer item util)</option>' + (mappedOption.filterFieldOptions || []).map(function(option) {
                var selected = filterField === option.value ? ' selected' : '';
                return '<option value="' + collectionEscapeHtml(option.value) + '"' + selected + '>' + collectionEscapeHtml(option.label) + '</option>';
              }).join('') + '</select>' +
              '<input class="collection-var-input" type="text" placeholder="Valor esperado" value="' + collectionEscapeHtml(filterValue) + '" oninput="collectionUpdateInputMappingFilterValue(' + "'" + collectionEscapeHtml(mappingKey) + "'" + ', this.value)">' +
            '</div>' +
          '</div>' : '') +
          '<div class="collection-config-item-row"><input id="' + collectionEscapeHtml(collectionDomId(input.key)) + '" data-collection-input-key="' + collectionEscapeHtml(input.key) + '" class="collection-var-input" type="text" value="' + collectionEscapeHtml(currentValue) + '" oninput="collectionUpdateVar(' + "'" + collectionEscapeHtml(input.key) + "'" + ', this.value)"' + (mappedSource ? ' disabled' : '') + '></div>' +
        '</div>';
      }).join('') : '<div class="collection-step-empty">Este paso no necesita variables manuales simples.</div>') +
    '</div>' +
    '<div class="collection-config-section">' +
      '<div class="collection-config-title">Salidas disponibles</div>' +
      (outputs.length ? outputs.map(function(output) {
        return '<div class="collection-config-item">' +
          '<div class="collection-config-item-name">' + collectionEscapeHtml(collectionOutputDisplayName(output)) + '</div>' +
          '<div class="collection-config-item-meta">' + collectionEscapeHtml((output.pathLabel || output.displayLabel || output.sourceVarKey) + (output.type ? ' | ' + output.type : '')) + '</div>' +
          '<div class="collection-config-item-row"><input class="collection-var-input" type="text" value="' + collectionEscapeHtml(output.alias || '') + '" placeholder="Renombre funcional" oninput="collectionUpdateOutputAlias(' + "'" + collectionEscapeHtml(output.sourceVarKey) + "'" + ', this.value)"></div>' +
          '<div class="collection-config-item-row"><span class="collection-config-output-tag">' + collectionEscapeHtml(output.sourceVarKey) + '</span></div>' +
        '</div>';
      }).join('') : '<div class="collection-step-empty">Swagger no expuso salidas simples para este metodo.</div>') +
    '</div>' +
    (repeatableInputs.length ? '<div class="collection-config-section"><div class="collection-config-title">Listas y estructuras</div><div class="collection-step-empty">Este paso tiene ' + repeatableInputs.length + ' campo(s) complejos/repetibles. Los seguimos resolviendo con el motor actual, pero la edicion visual fina queda para la siguiente iteracion.</div></div>' : '');
}

function collectionRenderItems() {
  var container = document.getElementById('collection-chain');
  if (!container) return;
  var scenario = collectionGetActiveScenario();
  var items = scenario ? scenario.items : [];
  var totalItems = collectionState.scenarios.reduce(function(total, current) {
    return total + ((current.items || []).length);
  }, 0);

  collectionRenderServiceCatalog();
  if (!items.length) {
    container.innerHTML = '<div class="collection-canvas-stage" ondragover="collectionAllowCanvasDrop(event)" ondrop="collectionDropOperation(0, event)"><div class="collection-canvas-empty">Arrastra un servicio desde la izquierda o haz clic sobre uno para empezar a construir la cadena.</div></div>';
  } else {
    var selectedIndex = collectionGetSelectedItemIndex();
    var blocks = [];
    for (var i = 0; i < items.length; i++) {
      if (i === 0) {
        blocks.push('<button type="button" class="collection-canvas-slot" ondragover="collectionAllowCanvasDrop(event)" ondrop="collectionDropOperation(0, event)" onclick="collectionSetSelectedItem(0)">+</button>');
      }
      var item = items[i];
      var op = String(item.operationKind || collectionInferOperationKind(item.method)).toLowerCase();
      blocks.push(
        '<div class="collection-canvas-step' + (selectedIndex === i ? ' collection-canvas-step-selected' : '') + '" onclick="collectionSetSelectedItem(' + i + ')">' +
          '<div class="collection-canvas-step-head">' +
            '<div class="collection-canvas-step-index">' + (i + 1) + '</div>' +
            '<div class="collection-canvas-step-copy">' +
              '<div class="collection-canvas-step-title">' + collectionEscapeHtml(item.method) + '</div>' +
              '<div class="collection-canvas-step-desc">' + collectionEscapeHtml(item.summary || item.path || 'Sin descripcion.') + '</div>' +
              '<div class="collection-canvas-step-meta">' +
                '<span class="collection-canvas-chip">' + collectionEscapeHtml(item.service) + '</span>' +
                '<span class="collection-canvas-chip">' + collectionEscapeHtml(String(item.httpMethod || 'GET').toUpperCase()) + '</span>' +
                '<span class="collection-canvas-chip">' + collectionEscapeHtml(op === 'query' ? 'Consulta' : 'Ejecucion') + '</span>' +
              '</div>' +
            '</div>' +
            '<button class="svc-rm" onclick="event.stopPropagation(); collectionRemoveItem(' + i + ')">&#10005;</button>' +
          '</div>' +
        '</div>'
      );
      blocks.push('<button type="button" class="collection-canvas-slot" ondragover="collectionAllowCanvasDrop(event)" ondrop="collectionDropOperation(' + (i + 1) + ', event)" onclick="collectionSetSelectedItem(' + i + ')">+</button>');
    }
    container.innerHTML = '<div class="collection-canvas-stage">' + blocks.join('') + '</div>';
  }

  collectionRenderInspector();
  var btn = document.getElementById('btn-collection-generate');
  if (btn) btn.disabled = !totalItems || !collectionPathSupported();
  var execBtn = document.getElementById('btn-collection-execute');
  if (execBtn) execBtn.disabled = !items.length || !collectionPathSupported();
}

function collectionAddItem() {
  var serviceSel = document.getElementById('col-sel-svc');
  var methodSel = document.getElementById('col-sel-mtd');
  if (!serviceSel || !methodSel) return;
  if (!serviceSel.value || !methodSel.value) return;
  collectionInsertOperation(serviceSel.value, methodSel.value);
}

function collectionClearItemState(scenario, item) {
  if (!scenario || !item) return;
  var manualInputs = Array.isArray(item.manualInputs) ? item.manualInputs : [];
  manualInputs.forEach(function(input) {
    var key = input && input.key ? input.key : '';
    if (key && scenario.variableOverrides && Object.prototype.hasOwnProperty.call(scenario.variableOverrides, key)) {
      delete scenario.variableOverrides[key];
    }
    if (key && scenario.repeatableOverrides && Object.prototype.hasOwnProperty.call(scenario.repeatableOverrides, key)) {
      delete scenario.repeatableOverrides[key];
    }
    var mappingKey = collectionBuildInputMappingKey(item, input);
    if (mappingKey && scenario.inputMappings && Object.prototype.hasOwnProperty.call(scenario.inputMappings, mappingKey)) {
      delete scenario.inputMappings[mappingKey];
    }
  });

  var outputs = Array.isArray(item.outputFields) ? item.outputFields : [];
  outputs.forEach(function(output) {
    var sourceVarKey = collectionBuildOutputVarKey(item, output);
    if (sourceVarKey && scenario.outputAliases && Object.prototype.hasOwnProperty.call(scenario.outputAliases, sourceVarKey)) {
      delete scenario.outputAliases[sourceVarKey];
    }
  });

  item.inputOverrides = {};
}

function collectionRemoveItem(index) {
  var scenario = collectionGetActiveScenario();
  if (!scenario) return;
  var item = scenario.items[index];
  collectionClearItemState(scenario, item);
  scenario.items.splice(index, 1);
  if (!scenario.items.length) scenario.selectedItemIndex = -1;
  else if (scenario.selectedItemIndex >= scenario.items.length) scenario.selectedItemIndex = scenario.items.length - 1;
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
    collectionShowStatus('err', 'Por ahora solo esta disponible JSON + Postman.');
    return;
  }
  collectionSyncInspectorInputs();
  collectionRefreshContext();
  if (typeof S === 'undefined' || !S.version) {
    collectionShowStatus('err', 'Completa primero version y ambiente en el wizard principal.');
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
  collectionShowStatus('ok', 'Ejecutando flujo JSON desde la app...');
  collectionResetExecution();

  try {
    var r = await fetch('/api/collection/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: collectionState.format,
        version: S.version,
        platform: S.platform,
        db: typeof getDb === 'function' ? getDb() : {},
        api: getApi(),
        swaggerBaseUrl: collectionState.swaggerBaseUrl,
        swaggerAuthUrl: collectionState.swaggerAuthUrl,
        items: scenario.items,
        variableOverrides: scenario.variableOverrides,
        inputMappings: scenario.inputMappings,
        outputAliases: scenario.outputAliases,
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
    '<p>Se genero una collection Postman con <strong>' + data.requestCount + '</strong> requests repartidos en <strong>' + (data.scenarioCount || 1) + '</strong> caso(s) de uso. Cada carpeta incluye Authenticate y los requests JSON descubiertos desde Swagger.</p>' +
    '<div class="collection-actions" style="margin-bottom:12px">' +
      '<a class="btn btn-primary" href="' + data.downloadUrl + '">&#8595; Descargar ' + data.fileName + '</a>' +
    '</div>' +
    '<h4>Auto-matching detectado</h4>' +
    mapHtml;
}

async function collectionGenerate() {
  if (!collectionPathSupported()) {
    collectionShowStatus('err', 'Por ahora solo esta disponible JSON + Postman.');
    return;
  }

  collectionSyncInspectorInputs();
  collectionRefreshContext();
  if (typeof S === 'undefined' || !S.version) {
    collectionShowStatus('err', 'Completa primero version y ambiente en el wizard principal.');
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
  collectionShowStatus('ok', 'Generando collection Postman JSON...');
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
        swaggerBaseUrl: collectionState.swaggerBaseUrl,
        swaggerAuthUrl: collectionState.swaggerAuthUrl,
        collectionName: collectionState.collectionName,
        scenarios: scenarios.map(function(scenario) {
          return {
            id: scenario.id,
            name: scenario.name,
            items: scenario.items,
            variableOverrides: scenario.variableOverrides,
            inputMappings: scenario.inputMappings,
            outputAliases: scenario.outputAliases,
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

async function collectionMountPanel() {
  var mount = document.getElementById('collection-mount');
  if (!mount) return;
  try {
    var response = await fetch('/api/collection/panel');
    if (!response.ok) throw new Error('No se pudo cargar el panel.');
    mount.innerHTML = await response.text();
    var mountedPanel = mount.querySelector('.panel');
    if (mountedPanel && mountedPanel.parentElement === mount) {
      mount.innerHTML = mountedPanel.innerHTML;
    }
    collectionUpgradeStudioLayout();
    collectionEnsureScenario();
    collectionBindButtons();
    if (!collectionFlowResizeBound) {
      window.addEventListener('resize', collectionRenderFlowConnections);
      collectionFlowResizeBound = true;
    }
    collectionRenderScenarios();
    collectionRenderItems();
    var jsonButton = document.getElementById('col-toolbar-format-json') || document.getElementById('col-format-json');
    if (jsonButton) collectionPickChoice('format', 'json', jsonButton);
    var postmanButton = document.getElementById('col-toolbar-target-postman') || document.getElementById('col-target-postman');
    if (postmanButton) collectionPickChoice('target', 'postman', postmanButton);
    collectionRefreshContext();
  } catch (e) {
    mount.innerHTML = '<div class="collection-block"><div class="collection-status show err">No se pudo cargar el builder de collections. ' + collectionEscapeHtml(e.message || '') + '</div></div>';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', collectionMountPanel);
} else {
  collectionMountPanel();
}
