var collectionState = {
  format: 'json',
  target: 'postman',
  serviceSource: 'swagger',
  services: [],
  serviceOperations: {},
  swaggerUrl: '',
  swaggerResolvedUrl: '',
  swaggerBaseUrl: '',
  swaggerAuthUrl: '',
  collectionName: 'Bantotal JSON Collection',
  authContext: null,
  studioStage: 'setup',
  scenarios: [],
  activeScenarioId: null,
  contextKey: null,
  nextScenarioId: 1,
  nextNodeId: 1,
  builderUi: {
    serviceDrawerOpen: false,
    inspectorDrawerOpen: false,
    pendingInsertIndex: null,
    selectedCatalogOperations: []
  }
};

var collectionButtonsBound = false;
var collectionFlowResizeBound = false;
var collectionStudioUpgraded = false;
var collectionCanvasDragState = null;
var collectionConnectionDragState = null;
var collectionUtils = new window.BTCollectionModules.CollectionUtils({
  getDb: function() { return typeof getDb === 'function' ? getDb() : {}; },
  getApi: function() { return typeof getApi === 'function' ? getApi() : {}; }
});
var collectionApiClient = new window.BTCollectionModules.CollectionApiClient();
var collectionStore = new window.BTCollectionModules.CollectionStateStore(collectionState);
var collectionFeedbackManager = new window.BTCollectionModules.CollectionFeedbackManager();
var collectionStudioManager = null;
var collectionCanvasManager = null;
var collectionCanvasInteractionManager = null;
var collectionInspectorManager = null;
var collectionScenarioManager = null;
var collectionServiceCatalogManager = null;
var collectionPreviewManager = null;
var collectionExecutionCenter = null;
var collectionRequestDataManager = null;
var collectionEnvironmentManager = null;
var collectionBootstrapManager = null;
var collectionResultManager = null;
var collectionFlowLifecycleManager = null;
var collectionBuilderShellManager = null;

function collectionCreateScenario(name) {
  return collectionStore.createScenario(name);
}

function collectionEnsureItemNodeId(item) {
  return collectionStore.ensureItemNodeId(item);
}

function collectionDefaultNodeLayout(index) {
  return collectionStore.defaultNodeLayout(index);
}

function collectionEnsureItemLayout(item, index) {
  return collectionStore.ensureItemLayout(item, index);
}

function collectionEnsureScenarioConnections(scenario) {
  return collectionStore.ensureScenarioConnections(scenario);
}

function collectionGetActiveScenario() {
  return collectionStore.getActiveScenario();
}

function collectionEnsureScenario() {
  collectionStore.ensureScenario();
}

function collectionShowStatus(kind, text) {
  collectionFeedbackManager.showStatus(kind, text);
}

function collectionClearStatus() {
  collectionFeedbackManager.clearStatus();
}

function collectionGetStudioManager() {
  if (collectionStudioManager) return collectionStudioManager;
  collectionStudioManager = new window.BTCollectionModules.CollectionStudioManager(collectionState, {
    refreshContext: collectionRefreshContext,
    clearStatus: collectionClearStatus,
    resetResult: collectionResetResult,
    resetExecution: collectionResetExecution,
    toggleConfig: collectionToggleConfig
  });
  return collectionStudioManager;
}

function collectionGetExecutionCenter() {
  if (collectionExecutionCenter) return collectionExecutionCenter;
  collectionExecutionCenter = new window.BTCollectionModules.CollectionExecutionCenter({
    getState: function() { return collectionState; },
    getActiveScenario: collectionGetActiveScenario,
    getFormat: function() { return collectionState.format; },
    getVersion: function() { return typeof S !== 'undefined' ? S.version : ''; },
    getPlatform: function() { return typeof S !== 'undefined' ? S.platform : ''; },
    getDb: function() { return typeof getDb === 'function' ? getDb() : {}; },
    getApi: function() { return typeof getApi === 'function' ? getApi() : {}; },
    getAuthContext: function() { return collectionState.authContext; },
    getSwaggerBaseUrl: function() { return collectionState.swaggerBaseUrl; },
    getSwaggerAuthUrl: function() { return collectionState.swaggerAuthUrl; },
    executeFlowRequest: function(payload) { return collectionApiClient.executeFlow(payload); },
    isPathSupported: collectionPathSupported,
    refreshContext: collectionRefreshContext,
    syncInspectorInputs: collectionSyncInspectorInputs,
    showStatus: collectionShowStatus,
    escapeHtml: collectionEscapeHtml,
    ensureScenarioConnections: collectionEnsureScenarioConnections,
    buildConnectionLabel: collectionBuildCanvasLinkText
  });
  return collectionExecutionCenter;
}

function collectionGetScenarioManager() {
  if (collectionScenarioManager) return collectionScenarioManager;
  collectionScenarioManager = new window.BTCollectionModules.CollectionScenarioManager({
    getState: function() { return collectionState; },
    createScenario: collectionCreateScenario,
    ensureScenario: collectionEnsureScenario,
    getActiveScenario: collectionGetActiveScenario,
    renderItems: collectionRenderItems,
    renderVariableEditor: collectionRenderVariableEditor,
    resetResult: collectionResetResult,
    resetExecution: collectionResetExecution,
    escapeHtml: collectionEscapeHtml
  });
  return collectionScenarioManager;
}

function collectionGetServiceCatalogManager() {
  if (collectionServiceCatalogManager) return collectionServiceCatalogManager;
  collectionServiceCatalogManager = new window.BTCollectionModules.CollectionServiceCatalogManager({
    getState: function() { return collectionState; },
    getPlatform: function() { return typeof S !== 'undefined' ? S.platform : ''; },
    getVersion: function() { return typeof S !== 'undefined' ? S.version : ''; },
    getApi: function() { return typeof getApi === 'function' ? getApi() : {}; },
    refreshContext: collectionRefreshContext,
    pathSupported: collectionPathSupported,
    showStatus: collectionShowStatus,
    renderItems: collectionRenderItems,
    renderVariableEditor: collectionRenderVariableEditor,
    setStudioStage: collectionSetStudioStage,
    escapeHtml: collectionEscapeHtml
  });
  return collectionServiceCatalogManager;
}

function collectionGetPreviewManager() {
  if (collectionPreviewManager) return collectionPreviewManager;
  collectionPreviewManager = new window.BTCollectionModules.CollectionPreviewManager({
    getState: function() { return collectionState; },
    getActiveScenario: collectionGetActiveScenario,
    getSelectedItem: collectionGetSelectedItem,
    getVersion: function() { return typeof S !== 'undefined' ? S.version : ''; },
    getPlatform: function() { return typeof S !== 'undefined' ? S.platform : ''; },
    getDb: function() { return typeof getDb === 'function' ? getDb() : {}; },
    getApi: function() { return typeof getApi === 'function' ? getApi() : {}; },
    loadPreviewRequest: function(payload) { return collectionApiClient.loadPreview(payload); },
    ensureItemNodeId: collectionEnsureItemNodeId,
    getConnectedSourceId: collectionGetConnectedSourceId,
    isAutoResolvedKey: collectionIsAutoResolvedKey,
    renderVariableEditor: collectionRenderVariableEditor,
    showStatus: collectionShowStatus,
    pathSupported: collectionPathSupported
  });
  return collectionPreviewManager;
}

function collectionGetRequestDataManager() {
  if (collectionRequestDataManager) return collectionRequestDataManager;

  collectionRequestDataManager = new window.BTCollectionModules.CollectionRequestDataManager({
    apiClient: collectionApiClient,
    getState: function() { return collectionState; },
    getFormat: function() { return collectionState.format; },
    getTarget: function() { return collectionState.target; },
    getVersion: function() { return typeof S !== 'undefined' ? S.version : ''; },
    getPlatform: function() { return typeof S !== 'undefined' ? S.platform : ''; },
    getDb: function() { return typeof getDb === 'function' ? getDb() : {}; },
    getApi: function() { return typeof getApi === 'function' ? getApi() : {}; },
    getSwaggerBaseUrl: function() { return collectionState.swaggerBaseUrl; },
    getSwaggerAuthUrl: function() { return collectionState.swaggerAuthUrl; },
    getCollectionName: function() { return collectionState.collectionName; },
    pathSupported: collectionPathSupported,
    syncInspectorInputs: collectionSyncInspectorInputs,
    refreshContext: collectionRefreshContext,
    resetResult: collectionResetResult,
    resetExecution: collectionResetExecution,
    renderItems: collectionRenderItems,
    renderVariableEditor: collectionRenderVariableEditor,
    loadPreview: collectionLoadPreview,
    showStatus: collectionShowStatus
  });

  return collectionRequestDataManager;
}

function collectionGetEnvironmentManager() {
  if (collectionEnvironmentManager) return collectionEnvironmentManager;

  collectionEnvironmentManager = new window.BTCollectionModules.CollectionEnvironmentManager({
    apiClient: collectionApiClient,
    getState: function() { return collectionState; },
    getWizardState: function() { return typeof S !== 'undefined' ? S : {}; },
    getDb: function() { return typeof getDb === 'function' ? getDb() : {}; },
    getApi: function() { return typeof getApi === 'function' ? getApi() : {}; },
    contextKey: collectionContextKey,
    resolveV4AuthUrl: collectionResolveV4AuthUrl,
    guessSwaggerUrl: collectionGuessSwaggerUrl,
    isPathSupported: collectionPathSupported,
    resetLoadedData: collectionResetLoadedData,
    showStatus: collectionShowStatus,
    filterServices: collectionFilterServices,
    renderVariableEditor: collectionRenderVariableEditor,
    setStudioStage: collectionSetStudioStage
  });

  return collectionEnvironmentManager;
}

function collectionGetBootstrapManager() {
  if (collectionBootstrapManager) return collectionBootstrapManager;

  collectionBootstrapManager = new window.BTCollectionModules.CollectionBootstrapManager({
    apiClient: collectionApiClient,
    isButtonsBound: function() { return collectionButtonsBound; },
    setButtonsBound: function(value) { collectionButtonsBound = !!value; },
    isFlowResizeBound: function() { return collectionFlowResizeBound; },
    setFlowResizeBound: function(value) { collectionFlowResizeBound = !!value; },
    testDb: collectionTestDb,
    testAuth: collectionTestAuth,
    loadServices: collectionLoadServices,
    upgradeStudioLayout: collectionUpgradeStudioLayout,
    ensureScenario: collectionEnsureScenario,
    renderScenarios: collectionRenderScenarios,
    renderItems: collectionRenderItems,
    refreshContext: collectionRefreshContext,
    renderFlowConnections: collectionRenderFlowConnections,
    renderCanvasConnections: collectionRenderCanvasConnections,
    pickChoice: collectionPickChoice,
    escapeHtml: collectionEscapeHtml
  });

  return collectionBootstrapManager;
}

function collectionGetResultManager() {
  if (collectionResultManager) return collectionResultManager;

  collectionResultManager = new window.BTCollectionModules.CollectionResultManager({
    escapeHtml: collectionEscapeHtml
  });

  return collectionResultManager;
}

function collectionGetFlowLifecycleManager() {
  if (collectionFlowLifecycleManager) return collectionFlowLifecycleManager;

  collectionFlowLifecycleManager = new window.BTCollectionModules.CollectionFlowLifecycleManager({
    getState: function() { return collectionState; },
    getActiveScenario: collectionGetActiveScenario,
    getVersion: function() { return typeof S !== 'undefined' ? S.version : ''; },
    getPlatform: function() { return typeof S !== 'undefined' ? S.platform : ''; },
    getDb: function() { return typeof getDb === 'function' ? getDb() : {}; },
    apiClient: collectionApiClient,
    ensureScenarioConnections: collectionEnsureScenarioConnections,
    ensureItemNodeId: collectionEnsureItemNodeId,
    ensureItemLayout: collectionEnsureItemLayout,
    defaultNodeLayout: collectionDefaultNodeLayout,
    buildInputMappingKey: collectionBuildInputMappingKey,
    buildOutputVarKey: collectionBuildOutputVarKey,
    renderScenarios: collectionRenderScenarios,
    renderItems: collectionRenderItems,
    renderVariableEditor: collectionRenderVariableEditor,
    loadPreview: collectionLoadPreview,
    resetResult: collectionResetResult,
    resetExecution: collectionResetExecution
  });

  return collectionFlowLifecycleManager;
}

function collectionGetBuilderShellManager() {
  if (collectionBuilderShellManager) return collectionBuilderShellManager;
  collectionBuilderShellManager = new window.BTCollectionModules.CollectionBuilderShellManager({
    getState: function() { return collectionState; },
    getActiveScenario: collectionGetActiveScenario,
    getSelectedItem: collectionGetSelectedItem,
    insertOperation: collectionInsertOperation,
    renderItems: collectionRenderItems,
    renderServiceCatalog: function() { return collectionGetServiceCatalogManager().renderServiceCatalog(); },
    renderInspector: function() { return collectionGetInspectorManager().renderInspector(); }
  });
  return collectionBuilderShellManager;
}

function collectionGetCanvasManager() {
  if (collectionCanvasManager) return collectionCanvasManager;
  collectionCanvasManager = new window.BTCollectionModules.CollectionCanvasManager({
    getState: function() { return collectionState; },
    getActiveScenario: collectionGetActiveScenario,
    ensureScenarioConnections: collectionEnsureScenarioConnections,
    findItemIndexByNodeId: collectionFindItemIndexByNodeId,
    buildCanvasGroupKey: collectionBuildCanvasGroupKey,
    inputMappingConfig: collectionInputMappingConfig,
    outputDisplayName: collectionOutputDisplayName,
    inputDisplayName: collectionInputDisplayName,
    ensureItemLayout: collectionEnsureItemLayout,
    ensureItemNodeId: collectionEnsureItemNodeId,
    inferOperationKind: collectionInferOperationKind,
    escapeHtml: collectionEscapeHtml,
    getSelectedItemIndex: collectionGetSelectedItemIndex,
    renderServiceCatalog: collectionRenderServiceCatalog,
    renderInspector: collectionRenderInspector,
    pathSupported: collectionPathSupported,
    getConnectionDragState: function() { return collectionConnectionDragState; }
  });
  return collectionCanvasManager;
}

function collectionGetCanvasInteractionManager() {
  if (collectionCanvasInteractionManager) return collectionCanvasInteractionManager;

  collectionCanvasInteractionManager = new window.BTCollectionModules.CollectionCanvasInteractionManager({
    getActiveScenario: collectionGetActiveScenario,
    getSelectedItem: collectionGetSelectedItem,
    setSelectedItem: collectionSetSelectedItem,
    openInspector: function() { collectionGetBuilderShellManager().openInspector(); },
    getCanvasDragState: function() { return collectionCanvasDragState; },
    setCanvasDragState: function(value) { collectionCanvasDragState = value; },
    getConnectionDragState: function() { return collectionConnectionDragState; },
    setConnectionDragState: function(value) { collectionConnectionDragState = value; },
    boundHandleCanvasDragMove: collectionHandleCanvasDragMove,
    boundHandleCanvasDragEnd: collectionHandleCanvasDragEnd,
    boundHandleConnectionDragMove: collectionHandleConnectionDragMove,
    boundHandleConnectionDragEnd: collectionHandleConnectionDragEnd,
    renderCanvasConnections: collectionRenderCanvasConnections,
    renderVariableEditor: collectionRenderVariableEditor,
    renderInspector: collectionRenderInspector,
    renderScenarios: collectionRenderScenarios,
    renderItems: collectionRenderItems,
    loadPreview: collectionLoadPreview,
    resetExecution: collectionResetExecution,
    showStatus: collectionShowStatus,
    ensureItemLayout: collectionEnsureItemLayout,
    ensureItemNodeId: collectionEnsureItemNodeId,
    ensureScenarioConnections: collectionEnsureScenarioConnections,
    findItemIndexByNodeId: collectionFindItemIndexByNodeId,
    rebuildItemsFromConnections: collectionRebuildItemsFromConnections,
    buildOrthogonalCanvasPath: collectionBuildOrthogonalCanvasPath,
    insertOperation: collectionInsertOperation
  });

  return collectionCanvasInteractionManager;
}

function collectionGetInspectorManager() {
  if (collectionInspectorManager) return collectionInspectorManager;
  collectionInspectorManager = new window.BTCollectionModules.CollectionInspectorManager({
    getActiveScenario: collectionGetActiveScenario,
    getSelectedItem: collectionGetSelectedItem,
    getSelectedItemIndex: collectionGetSelectedItemIndex,
    buildSelectedItemExecutionUrl: collectionBuildSelectedItemExecutionUrl,
    selectedItemInputValue: collectionSelectedItemInputValue,
    inputMappingConfig: collectionInputMappingConfig,
    findSourceOption: collectionFindSourceOption,
    inputDisplayName: collectionInputDisplayName,
    inputMetaLabel: collectionInputMetaLabel,
    outputDisplayName: collectionOutputDisplayName,
    escapeHtml: collectionEscapeHtml,
    domId: collectionDomId,
    captureInspectorState: collectionCaptureInspectorState,
    restoreInspectorState: collectionRestoreInspectorState
  });
  return collectionInspectorManager;
}

function collectionPathSupported() {
  return collectionGetStudioManager().pathSupported();
}

function collectionStageLabel(stage) {
  return collectionGetStudioManager().stageLabel(stage);
}

function collectionSetStudioStage(stage) {
  collectionGetStudioManager().setStage(stage);
}

function collectionRenderStudioStage() {
  collectionGetStudioManager().renderStage();
}

function collectionSyncToolbarChoices() {
  collectionGetStudioManager().syncToolbarChoices();
}

function collectionPickToolbarChoice(kind, value, el) {
  collectionGetStudioManager().pickToolbarChoice(kind, value, el);
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

  if (!shell.querySelector('.collection-studio-top')) {
    var top = document.createElement('div');
    top.className = 'collection-studio-top collection-studio-top-simple';
    top.innerHTML =
      '<div class="collection-studio-brand">' +
        '<div class="collection-studio-mark">C</div>' +
        '<div>' +
          '<div id="collection-studio-title" class="collection-studio-title">Casos de uso</div>' +
          '<div id="collection-studio-subtitle" class="collection-studio-subtitle"></div>' +
        '</div>' +
      '</div>';
    shell.insertBefore(top, shell.firstChild);
  }

  var config = document.getElementById('collection-config');
  if (config) {
    config.classList.remove('collection-block');
    config.classList.add('collection-studio-config');
    var summary = document.getElementById('collection-env-summary');
    if (summary) summary.className = 'collection-tech-content';
  }

  var services = document.getElementById('collection-services');
  if (services) {
    services.classList.remove('collection-block');
    services.classList.add('collection-studio-workspace');
  }

  collectionSyncToolbarChoices();
  collectionRenderStudioStage();
}

function collectionResetResult() {
  collectionFeedbackManager.resetResult();
}



// La consola se comporta como una ventana propia: cerrar limpia visibilidad,
// minimizar la manda a un "dock" flotante y restaurar la trae de vuelta.



// Mantiene sincronizadas todas las superficies de salida de la consola.




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

function collectionToggleConfig() {
  var note = document.getElementById('collection-path-note');
  var config = document.getElementById('collection-config');
  var services = document.getElementById('collection-services');
  if (!note || !config || !services) return;
  note.style.display = 'none';
  if (!collectionPathSupported()) {
    config.style.display = 'none';
    services.style.display = 'none';
    return;
  }
  collectionRefreshContext();
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
  if (kind === 'serviceSource') {
    collectionResetLoadedData();
    if (typeof collectionUpdateServiceSource === 'function') collectionUpdateServiceSource(value);
  }
  collectionSyncToolbarChoices();
  collectionClearStatus();
  collectionResetResult();
  collectionResetExecution();
  collectionToggleConfig();
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
    if (input.disabled) return;
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
  var normalizedCandidates = [
    collectionNormalizeToken((input && input.alias) || ''),
    collectionNormalizeToken((input && (input.pathLabel || input.key)) || ''),
    collectionNormalizeToken((input && input.key) || '')
  ].filter(Boolean);
  if (!normalizedCandidates.length) return '';
  function matches(value) {
    var normalized = collectionNormalizeToken(value);
    if (!normalized) return false;
    for (var i = 0; i < normalizedCandidates.length; i++) {
      if (normalizedCandidates[i] === normalized) return true;
    }
    return false;
  }
  for (var i = sourceOptions.length - 1; i >= 0; i--) {
    var option = sourceOptions[i];
    if (matches(option.alias)) return option.sourceVarKey;
    if (matches(collectionOutputDisplayName(option))) return option.sourceVarKey;
    if (matches(option.pathLabel)) return option.sourceVarKey;
    if (matches(option.key)) return option.sourceVarKey;
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
      '<text class="collection-flow-link-label" x="' + midX + '" y="' + (midY + 4) + '" text-anchor="middle">' + collectionEscapeHtml(collectionOutputDisplayName(option || { sourceVarKey: sourceVarKey })) + ' â†’ ' + collectionEscapeHtml(input.key) + '</text>'
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

function collectionCaptureInspectorState(container) {
  if (!container) return null;
  var state = { scrollTop: container.scrollTop || 0, fieldKey: '', selectionStart: null, selectionEnd: null };
  var active = document.activeElement;
  if (!active || !container.contains(active)) return state;
  state.fieldKey = active.getAttribute('data-inspector-key') || active.id || '';
  if (typeof active.selectionStart === 'number' && typeof active.selectionEnd === 'number') {
    state.selectionStart = active.selectionStart;
    state.selectionEnd = active.selectionEnd;
  }
  return state;
}

function collectionRestoreInspectorState(container, state) {
  if (!container || !state) return;
  container.scrollTop = state.scrollTop || 0;
  if (!state.fieldKey) return;
  var selector = '[data-inspector-key="' + collectionEscapeHtml(state.fieldKey) + '"]';
  var field = container.querySelector(selector);
  if (!field && state.fieldKey) {
    field = document.getElementById(state.fieldKey);
  }
  if (!field || typeof field.focus !== 'function') return;
  field.focus();
  if (typeof state.selectionStart === 'number' && typeof field.setSelectionRange === 'function') {
    try {
      field.setSelectionRange(state.selectionStart, state.selectionEnd == null ? state.selectionStart : state.selectionEnd);
    } catch (error) {}
  }
}






function collectionAddItem() {
  var serviceSel = document.getElementById('col-sel-svc');
  var methodSel = document.getElementById('col-sel-mtd');
  if (!serviceSel || !methodSel) return;
  if (!serviceSel.value || !methodSel.value) return;
  collectionInsertOperation(serviceSel.value, methodSel.value);
}



// Adaptador de compatibilidad: desde aca delegamos la experiencia de ejecucion
// al modulo especializado sin romper la API global que ya consume el builder.
collectionRefreshContext = function collectionRefreshContextAdapter() {
  // La sincronizacion del ambiente vive en un manager dedicado para separar UI de contexto.
  collectionGetEnvironmentManager().refreshContext();
};

collectionUpdateSwaggerUrl = function collectionUpdateSwaggerUrlAdapter(value) {
  // Guardamos la URL Swagger desde un unico punto del modulo de ambiente.
  collectionGetEnvironmentManager().updateSwaggerUrl(value);
};

collectionUpdateServiceSource = function collectionUpdateServiceSourceAdapter(value) {
  // El origen del catalogo vive en el manager de ambiente para mantener la UI y la carga alineadas.
  collectionGetEnvironmentManager().updateServiceSource(value);
};

collectionTestDb = async function collectionTestDbAdapter() {
  // La prueba de base ahora entra por la capa de ambiente y servicios.
  return collectionGetEnvironmentManager().testDb();
};

collectionTestAuth = async function collectionTestAuthAdapter() {
  // La prueba de autenticacion queda encapsulada fuera del bootstrap principal.
  return collectionGetEnvironmentManager().testAuth();
};

collectionLoadServices = async function collectionLoadServicesEnvironmentAdapter() {
  // La carga de Swagger y el authenticate posterior quedan centralizados en el manager de ambiente.
  return collectionGetEnvironmentManager().loadServices();
};

collectionBindButtons = function collectionBindButtonsAdapter() {
  // El binding inicial del panel queda centralizado en un bootstrap manager dedicado.
  collectionGetBootstrapManager().bindButtons();
};

collectionEscapeHtml = function collectionEscapeHtmlAdapter(value) {
  // Delegamos el escape HTML a la utilidad compartida para tener una sola implementacion.
  return collectionUtils.escapeHtml(value);
};

collectionNormalizeToken = function collectionNormalizeTokenSharedAdapter(value) {
  // Centralizamos la normalizacion para que preview, matching y filtros comparen igual.
  return collectionUtils.normalizeToken(value);
};

collectionDomId = function collectionDomIdAdapter(key) {
  // Generamos ids seguros para el DOM desde el helper puro compartido.
  return collectionUtils.domId(key);
};

collectionFlowId = function collectionFlowIdAdapter(prefix, value) {
  // Reutilizamos el helper de ids del canvas para no duplicar reglas de sanitizacion.
  return collectionUtils.flowId(prefix, value);
};

collectionContextKey = function collectionContextKeyAdapter() {
  // Esta clave resume el ambiente actual y sirve para invalidar estado cacheado.
  return collectionUtils.contextKey();
};

collectionResolveV4AuthUrl = function collectionResolveV4AuthUrlAdapter(api) {
  // La resolucion de Authenticate queda encapsulada en utilidades compartidas.
  return collectionUtils.resolveV4AuthUrl(api);
};

collectionGuessSwaggerUrl = function collectionGuessSwaggerUrlAdapter(api) {
  // La inferencia de Swagger se unifica para que todo el builder use la misma regla.
  return collectionUtils.guessSwaggerUrl(api);
};

collectionUpdateName = function collectionUpdateNameAdapter(value) {
  // El nombre exportado de la collection pasa por el lifecycle manager del flujo.
  collectionGetFlowLifecycleManager().updateCollectionName(value);
};

collectionRenameActiveScenario = function collectionRenameActiveScenarioAdapter(value) {
  // Renombrar el caso activo ahora queda encapsulado fuera del coordinador principal.
  collectionGetFlowLifecycleManager().renameActiveScenario(value);
};

collectionGetSelectedItemIndex = function collectionGetSelectedItemIndexAdapter() {
  // La seleccion valida del paso activo se resuelve desde el manager de ciclo de vida.
  return collectionGetFlowLifecycleManager().getSelectedItemIndex();
};

collectionGetSelectedItem = function collectionGetSelectedItemAdapter() {
  // El paso activo ya no se calcula manualmente en el bootstrap.
  return collectionGetFlowLifecycleManager().getSelectedItem();
};

collectionSetSelectedItem = function collectionSetSelectedItemAdapter(index) {
  // Centralizamos el cambio de paso activo para refrescar siempre las mismas vistas.
  collectionGetFlowLifecycleManager().setSelectedItem(index);
};

collectionSetActiveScenario = function collectionSetActiveScenarioAdapter(id) {
  // El cambio de escenario activo ahora sigue un ciclo de refresco consistente.
  collectionGetFlowLifecycleManager().setActiveScenario(id);
};

collectionBuildCanvasGroupKey = function collectionBuildCanvasGroupKeyAdapter(item, index) {
  // La clave grupal del canvas se mantiene en el manager del flujo.
  return collectionGetFlowLifecycleManager().buildCanvasGroupKey(item, index);
};

collectionFindItemIndexByNodeId = function collectionFindItemIndexByNodeIdAdapter(scenario, nodeId) {
  // Resolver nodos a indices queda centralizado para canvas y conexiones.
  return collectionGetFlowLifecycleManager().findItemIndexByNodeId(scenario, nodeId);
};

collectionFindOutgoingConnection = function collectionFindOutgoingConnectionAdapter(scenario, fromId) {
  // La busqueda de conexiones salientes se concentra en el lifecycle manager.
  return collectionGetFlowLifecycleManager().findOutgoingConnection(scenario, fromId);
};

collectionFindIncomingConnection = function collectionFindIncomingConnectionAdapter(scenario, toId) {
  // La busqueda de conexiones entrantes se concentra en el lifecycle manager.
  return collectionGetFlowLifecycleManager().findIncomingConnection(scenario, toId);
};

collectionRebuildItemsFromConnections = function collectionRebuildItemsFromConnectionsAdapter(scenario, selectedItem) {
  // El reordenamiento del flujo segun flechas ya no vive directamente en collections.js.
  return collectionGetFlowLifecycleManager().rebuildItemsFromConnections(scenario, selectedItem);
};

collectionGetConnectedSourceId = function collectionGetConnectedSourceIdAdapter(scenario, item) {
  // Obtener el origen conectado de un paso se delega al manager del flujo.
  return collectionGetFlowLifecycleManager().getConnectedSourceId(scenario, item);
};

collectionInputAliasValue = function collectionInputAliasValueAdapter(mappingKey) {
  // Los aliases funcionales de inputs quedan gobernados por el lifecycle manager.
  return collectionGetFlowLifecycleManager().inputAliasValue(mappingKey);
};

collectionUpdateInputAlias = function collectionUpdateInputAliasAdapter(mappingKey, value) {
  // Actualizar aliases funcionales ahora dispara preview desde el manager del flujo.
  collectionGetFlowLifecycleManager().updateInputAlias(mappingKey, value);
};

collectionInputDisplayName = function collectionInputDisplayNameAdapter(input) {
  // El label visible del input se calcula en el manager que conoce aliases.
  return collectionGetFlowLifecycleManager().inputDisplayName(input);
};

collectionInputMetaLabel = function collectionInputMetaLabelAdapter(input) {
  return collectionGetFlowLifecycleManager().inputMetaLabel(input);
};

collectionSetPendingConnection = function collectionSetPendingConnectionAdapter(nodeId) {
  // El nodo origen pendiente de una flecha se mantiene fuera del bootstrap.
  collectionGetFlowLifecycleManager().setPendingConnection(nodeId);
};

collectionInsertOperation = async function collectionInsertOperationAdapter(service, operationKey, insertIndex) {
  // El alta de pasos en el flujo queda centralizada en el lifecycle manager.
  return collectionGetFlowLifecycleManager().insertOperation(service, operationKey, insertIndex);
};

collectionClearItemState = function collectionClearItemStateAdapter(scenario, item) {
  // Limpiar mappings y conexiones de un paso queda encapsulado en el manager del flujo.
  collectionGetFlowLifecycleManager().clearItemState(scenario, item);
};

collectionRemoveItem = function collectionRemoveItemAdapter(index) {
  // La baja de pasos ahora usa un ciclo unico de limpieza y refresco.
  collectionGetFlowLifecycleManager().removeItem(index);
};

collectionResetExecution = function collectionResetExecutionAdapter() {
  collectionGetExecutionCenter().reset();
};

collectionHandleExecutionBackdrop = function collectionHandleExecutionBackdropAdapter(event) {
  collectionGetExecutionCenter().handleBackdrop(event);
};

collectionCloseExecutionConsole = function collectionCloseExecutionConsoleAdapter() {
  collectionGetExecutionCenter().close();
};

collectionMinimizeExecutionConsole = function collectionMinimizeExecutionConsoleAdapter() {
  collectionGetExecutionCenter().minimize();
};

collectionRestoreExecutionConsole = function collectionRestoreExecutionConsoleAdapter() {
  collectionGetExecutionCenter().restore();
};

collectionSetExecutionHtml = function collectionSetExecutionHtmlAdapter(html, data) {
  collectionGetExecutionCenter().setHtml(html, data, { showModal: false });
};

collectionBuildExecutionPopupShell = function collectionBuildExecutionPopupShellAdapter(content) {
  return collectionGetExecutionCenter().buildPopupShell(content);
};

collectionOpenExecutionConsole = function collectionOpenExecutionConsoleAdapter() {
  collectionGetExecutionCenter().open();
};

collectionRenderExecutionLoading = function collectionRenderExecutionLoadingAdapter() {
  collectionGetExecutionCenter().renderLoading();
};

collectionRenderExecutionResult = function collectionRenderExecutionResultAdapter(data) {
  collectionGetExecutionCenter().renderResult(data);
};

collectionCloseExecutionMode = function collectionCloseExecutionModeAdapter() {
  collectionGetExecutionCenter().close();
};

collectionSelectExecutionStep = function collectionSelectExecutionStepAdapter(stepId) {
  collectionGetExecutionCenter().selectStep(stepId);
};

collectionSetExecutionTab = function collectionSetExecutionTabAdapter(tabKey) {
  collectionGetExecutionCenter().setTab(tabKey);
};

collectionRerunExecutionFlow = async function collectionRerunExecutionFlowAdapter() {
  return collectionGetExecutionCenter().rerunFlow();
};

collectionRerunExecutionFromSelectedStep = async function collectionRerunExecutionFromSelectedStepAdapter() {
  return collectionGetExecutionCenter().rerunFromSelectedStep();
};

collectionExportExecutionRun = function collectionExportExecutionRunAdapter() {
  collectionGetExecutionCenter().exportRun();
};

collectionUpdateExecutionServiceFilter = function collectionUpdateExecutionServiceFilterAdapter(value) {
  collectionGetExecutionCenter().updateServiceFilter(value);
};

collectionUpdateExecutionMethodFilter = function collectionUpdateExecutionMethodFilterAdapter(value) {
  collectionGetExecutionCenter().updateMethodFilter(value);
};

collectionUpdateExecutionVariableFilter = function collectionUpdateExecutionVariableFilterAdapter(value) {
  collectionGetExecutionCenter().updateVariablesFilter(value);
};

collectionToggleExecutionLeftPanel = function collectionToggleExecutionLeftPanelAdapter() {
  collectionGetExecutionCenter().toggleLeftPanelCollapsed();
};

collectionHandleExecutionNodeAction = async function collectionHandleExecutionNodeActionAdapter(actionKey, stepId) {
  return collectionGetExecutionCenter().handleNodeAction(actionKey, stepId);
};

collectionCenterExecutionFlow = function collectionCenterExecutionFlowAdapter() {
  var stage = document.querySelector('.collection-exec-flow-stage');
  if (!stage) return;
  stage.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
};

collectionToggleExecutionTimeline = function collectionToggleExecutionTimelineAdapter() {
  collectionGetExecutionCenter().toggleTimelineOpen();
};

collectionCloseExecutionTimeline = function collectionCloseExecutionTimelineAdapter() {
  collectionGetExecutionCenter().closeTimelineOpen();
};

collectionCancelExecutionRun = function collectionCancelExecutionRunAdapter() {
  collectionGetExecutionCenter().cancelExecution();
};

collectionRenderResult = function collectionRenderResultAdapter(data) {
  // El resumen final de generacion queda en un manager visual chico y reutilizable.
  collectionGetResultManager().renderResult(data);
};

collectionExecuteFlow = async function collectionExecuteFlowAdapter() {
  return collectionGetExecutionCenter().executeFlow();
};

collectionBuildCanvasLinkText = function collectionBuildCanvasLinkTextAdapter(sourceItem, sourceIndex, targetItem, targetIndex, scenario) {
  return collectionGetCanvasManager().buildCanvasLinkText(sourceItem, sourceIndex, targetItem, targetIndex, scenario);
};

collectionBuildOrthogonalCanvasPath = function collectionBuildOrthogonalCanvasPathAdapter(sourceElement, targetElement) {
  return collectionGetCanvasManager().buildOrthogonalCanvasPath(sourceElement, targetElement);
};

collectionRenderCanvasConnections = function collectionRenderCanvasConnectionsAdapter() {
  collectionGetCanvasManager().renderCanvasConnections();
};

collectionRenderInspector = function collectionRenderInspectorAdapter() {
  collectionGetInspectorManager().renderInspector();
};

collectionRenderItems = function collectionRenderItemsAdapter() {
  collectionGetCanvasManager().renderItems();
};

collectionCanvasNodeClick = function collectionCanvasNodeClickAdapter(index) {
  // La seleccion de nodos vive ahora en el modulo especializado del canvas.
  collectionGetCanvasInteractionManager().canvasNodeClick(index);
};

collectionUpdateDraggedNode = function collectionUpdateDraggedNodeAdapter() {
  // Este adapter mantiene el nombre global mientras el manager nuevo redibuja el nodo.
  collectionGetCanvasInteractionManager().updateDraggedNode();
};

collectionHandleCanvasDragMove = function collectionHandleCanvasDragMoveAdapter(event) {
  // Encaminamos el movimiento del mouse al modulo que conoce el drag del canvas.
  collectionGetCanvasInteractionManager().handleCanvasDragMove(event);
};

collectionHandleCanvasDragEnd = function collectionHandleCanvasDragEndAdapter() {
  // Cerramos el drag del nodo desde el manager para refrescar dependencias visuales.
  collectionGetCanvasInteractionManager().handleCanvasDragEnd();
};

collectionBuildTemporaryConnectionPath = function collectionBuildTemporaryConnectionPathAdapter(anchorX, anchorY, pointerX, pointerY, dragEnd) {
  // La geometria temporal de la flecha se calcula en el modulo de interaccion.
  return collectionGetCanvasInteractionManager().buildTemporaryConnectionPath(anchorX, anchorY, pointerX, pointerY, dragEnd);
};

collectionHandleConnectionDragMove = function collectionHandleConnectionDragMoveAdapter(event) {
  // Redirigimos el drag de puntas de flecha al manager de interacciones.
  collectionGetCanvasInteractionManager().handleConnectionDragMove(event);
};

collectionHandleConnectionDragEnd = function collectionHandleConnectionDragEndAdapter(event) {
  // La reconexion final de flechas queda encapsulada en el modulo del canvas.
  collectionGetCanvasInteractionManager().handleConnectionDragEnd(event);
};

collectionStartConnectionDrag = function collectionStartConnectionDragAdapter(fromId, toId, dragEnd, event) {
  // Permite volver a editar una flecha existente sin acoplar el bootstrap al detalle del canvas.
  collectionGetCanvasInteractionManager().startConnectionDrag(fromId, toId, dragEnd, event);
};

collectionStartNewConnectionDrag = function collectionStartNewConnectionDragAdapter(nodeId, event) {
  // Inicia una flecha nueva desde un nodo concreto del flujo.
  collectionGetCanvasInteractionManager().startNewConnectionDrag(nodeId, event);
};

collectionStartNodeDrag = function collectionStartNodeDragAdapter(index, event) {
  // Encaminamos el drag de tarjetas del flujo al manager que conoce offsets y limites.
  collectionGetCanvasInteractionManager().startNodeDrag(index, event);
};

collectionConnectNodes = function collectionConnectNodesAdapter(fromId, toId) {
  // La creacion de conexiones y el reordenamiento asociado viven en el manager de canvas.
  collectionGetCanvasInteractionManager().connectNodes(fromId, toId);
};

collectionRemoveConnection = function collectionRemoveConnectionAdapter(fromId, toId) {
  // Eliminamos la flecha desde el modulo de interaccion para mantener consistente el flujo.
  collectionGetCanvasInteractionManager().removeConnection(fromId, toId);
};

collectionAllowCanvasDrop = function collectionAllowCanvasDropAdapter(event) {
  // El canvas acepta drops a traves del modulo especializado.
  collectionGetCanvasInteractionManager().allowCanvasDrop(event);
};

collectionCanvasDragEnter = function collectionCanvasDragEnterAdapter(event) {
  collectionGetCanvasInteractionManager().dragEnterCanvas(event);
};

collectionCanvasDragLeave = function collectionCanvasDragLeaveAdapter(event) {
  collectionGetCanvasInteractionManager().dragLeaveCanvas(event);
};

collectionDropOperation = function collectionDropOperationAdapter(insertIndex, event) {
  // El alta de un servicio soltado en el lienzo se centraliza en la capa de interaccion.
  collectionGetCanvasInteractionManager().dropOperation(insertIndex, event);
};

collectionDragOperation = function collectionDragOperationAdapter(service, operationKey, event) {
  // Serializamos el payload de drag desde el modulo nuevo para evitar logica duplicada.
  collectionGetCanvasInteractionManager().dragOperation(service, operationKey, event);
};

collectionAddScenario = function collectionAddScenarioAdapter() {
  collectionGetScenarioManager().addScenario();
};

collectionRenameScenario = function collectionRenameScenarioAdapter(id, value) {
  collectionGetScenarioManager().renameScenario(id, value);
};

collectionRemoveScenario = function collectionRemoveScenarioAdapter(id) {
  collectionGetScenarioManager().removeScenario(id);
};

collectionRenderScenarios = function collectionRenderScenariosAdapter() {
  collectionGetScenarioManager().renderScenarios();
};

collectionVariableValue = function collectionVariableValueAdapter(key, fallback) {
  return collectionGetPreviewManager().variableValue(key, fallback);
};

collectionSelectedItemInputValue = function collectionSelectedItemInputValueAdapter(key, fallback) {
  return collectionGetPreviewManager().selectedItemInputValue(key, fallback);
};

collectionUpdateVar = function collectionUpdateVarAdapter(key, value) {
  collectionGetPreviewManager().updateVar(key, value);
};

collectionSyncInspectorInputs = function collectionSyncInspectorInputsAdapter() {
  collectionGetPreviewManager().syncInspectorInputs();
};

collectionBuildSelectedItemExecutionUrl = function collectionBuildSelectedItemExecutionUrlAdapter() {
  return collectionGetPreviewManager().buildSelectedItemExecutionUrl();
};

collectionSaveSelectedStepInputs = function collectionSaveSelectedStepInputsAdapter() {
  collectionGetPreviewManager().saveSelectedStepInputs();
};

collectionNormalizeMappingConfig = function collectionNormalizeMappingConfigAdapter(mapping) {
  return collectionGetPreviewManager().normalizeMappingConfig(mapping);
};

collectionInputMappingConfig = function collectionInputMappingConfigAdapter(mappingKey) {
  return collectionGetPreviewManager().inputMappingConfig(mappingKey);
};

collectionInputMappingValue = function collectionInputMappingValueAdapter(mappingKey) {
  return collectionGetPreviewManager().inputMappingValue(mappingKey);
};

collectionUpdateInputMapping = function collectionUpdateInputMappingAdapter(mappingKey, value) {
  collectionGetPreviewManager().updateInputMapping(mappingKey, value);
};

collectionUpdateInputMappingFilterField = function collectionUpdateInputMappingFilterFieldAdapter(mappingKey, value) {
  collectionGetPreviewManager().updateInputMappingFilterField(mappingKey, value);
};

collectionUpdateInputMappingFilterValue = function collectionUpdateInputMappingFilterValueAdapter(mappingKey, value) {
  collectionGetPreviewManager().updateInputMappingFilterValue(mappingKey, value);
};

collectionUpdateOutputAlias = function collectionUpdateOutputAliasAdapter(sourceVarKey, value) {
  collectionGetPreviewManager().updateOutputAlias(sourceVarKey, value);
};

collectionOutputDisplayName = function collectionOutputDisplayNameAdapter(output) {
  return collectionGetPreviewManager().outputDisplayName(output);
};

collectionSplitCollectionOutputPath = function collectionSplitCollectionOutputPathAdapter(pathLabel) {
  return collectionGetPreviewManager().splitCollectionOutputPath(pathLabel);
};

collectionDecoratePreviewOutputs = function collectionDecoratePreviewOutputsAdapter(outputs) {
  return collectionGetPreviewManager().decoratePreviewOutputs(outputs);
};

collectionFindSourceOption = function collectionFindSourceOptionAdapter(input, sourceVarKey) {
  return collectionGetPreviewManager().findSourceOption(input, sourceVarKey);
};

collectionInputMappingFilterField = function collectionInputMappingFilterFieldAdapter(mappingKey) {
  return collectionGetPreviewManager().inputMappingFilterField(mappingKey);
};

collectionInputMappingFilterValue = function collectionInputMappingFilterValueAdapter(mappingKey) {
  return collectionGetPreviewManager().inputMappingFilterValue(mappingKey);
};

collectionNormalizeToken = function collectionNormalizeTokenFinalAdapter(value) {
  // La ultima reasignacion tambien apunta al helper puro para evitar ambiguedades.
  return collectionUtils.normalizeToken(value);
};

collectionBuildOutputVarKey = function collectionBuildOutputVarKeyAdapter(item, outputField) {
  return collectionGetPreviewManager().buildOutputVarKey(item, outputField);
};

collectionBuildInputMappingKey = function collectionBuildInputMappingKeyAdapter(item, input) {
  return collectionGetPreviewManager().buildInputMappingKey(item, input);
};

collectionSuggestMappingForInput = function collectionSuggestMappingForInputAdapter(input, sourceOptions) {
  return collectionGetPreviewManager().suggestMappingForInput(input, sourceOptions);
};

collectionLoadPreview = async function collectionLoadPreviewAdapter() {
  return collectionGetPreviewManager().loadPreview();
};

collectionFillData = async function collectionFillDataAdapter() {
  return collectionGetRequestDataManager().fillData();
};


collectionFilterServices = function collectionFilterServicesAdapter() {
  collectionGetServiceCatalogManager().filterServices();
};

collectionLoadMethods = function collectionLoadMethodsAdapter(service) {
  collectionGetServiceCatalogManager().loadMethods(service);
};

collectionRenderServiceCatalog = function collectionRenderServiceCatalogAdapter() {
  collectionGetServiceCatalogManager().renderServiceCatalog();
};

collectionGenerate = async function collectionGenerateAdapter() {
  // La generacion final sigue validando estado en el bootstrap, pero delega la llamada HTTP al cliente comun.
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

  var scenarios = collectionState.scenarios.filter(function keepNonEmptyScenario(scenario) {
    return scenario.items && scenario.items.length;
  });
  if (!scenarios.length) {
    collectionShowStatus('err', 'Agrega al menos un metodo en algun caso de uso.');
    return;
  }

  var button = document.getElementById('btn-collection-generate');
  if (button) {
    button.disabled = true;
    button.innerHTML = '<span class="spin"></span>&nbsp;Generando...';
  }

  collectionShowStatus('ok', 'Generando collection Postman JSON...');
  collectionResetResult();

  try {
    var data = await collectionApiClient.generateCollection({
      format: collectionState.format,
      target: collectionState.target,
      version: S.version,
      platform: S.platform,
      db: typeof getDb === 'function' ? getDb() : {},
      api: typeof getApi === 'function' ? getApi() : {},
      swaggerBaseUrl: collectionState.swaggerBaseUrl,
      swaggerAuthUrl: collectionState.swaggerAuthUrl,
      collectionName: collectionState.collectionName,
      scenarios: scenarios.map(function serializeScenario(scenario) {
        return {
          id: scenario.id,
          name: scenario.name,
          items: scenario.items,
          variableOverrides: scenario.variableOverrides,
          inputMappings: scenario.inputMappings,
          inputAliases: scenario.inputAliases,
          outputAliases: scenario.outputAliases,
          repeatableOverrides: scenario.repeatableOverrides
        };
      })
    });

    if (!data.ok) throw new Error(data.message);

    collectionShowStatus('ok', 'Collection generada correctamente.');
    collectionRenderResult(data);
  } catch (error) {
    collectionShowStatus('err', error.message || 'No se pudo generar la collection.');
  }

  if (button) {
    button.disabled = false;
    button.innerHTML = 'Generar collection';
  }
};

async function collectionMountPanel() {
  // El montaje del panel se delega al manager de bootstrap para reducir responsabilidad del coordinador.
  return collectionGetBootstrapManager().mountPanel();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', collectionMountPanel);
} else {
  collectionMountPanel();
}











collectionOpenServiceDrawer = function collectionOpenServiceDrawerAdapter() {
  collectionGetBuilderShellManager().openServiceDrawer();
};

collectionOpenServiceDrawerForNextStep = function collectionOpenServiceDrawerForNextStepAdapter() {
  collectionGetBuilderShellManager().openServiceDrawerForNextStep();
};

collectionCloseServiceDrawer = function collectionCloseServiceDrawerAdapter() {
  collectionGetBuilderShellManager().closeServiceDrawer();
};

collectionCloseInspectorDrawer = function collectionCloseInspectorDrawerAdapter() {
  collectionGetBuilderShellManager().closeInspector();
};

collectionHandleBuilderBackdropClick = function collectionHandleBuilderBackdropClickAdapter() {
  collectionGetBuilderShellManager().handleBackdropClick();
};

collectionToggleCatalogSelection = function collectionToggleCatalogSelectionAdapter(service, operationKey, checked) {
  collectionGetBuilderShellManager().toggleCatalogSelection(service, operationKey, checked);
};

collectionInsertCatalogOperation = async function collectionInsertCatalogOperationAdapter(service, operationKey) {
  return collectionGetBuilderShellManager().insertCatalogOperation(service, operationKey);
};

collectionAddSelectedCatalogOperations = async function collectionAddSelectedCatalogOperationsAdapter() {
  return collectionGetBuilderShellManager().addSelectedOperations();
};

collectionSyncBuilderShellState = function collectionSyncBuilderShellStateAdapter() {
  collectionGetBuilderShellManager().syncShellState();
};

collectionToggleServiceGroup = function collectionToggleServiceGroupAdapter(service) {
  collectionGetBuilderShellManager().toggleServiceGroup(service);
};

collectionSetInspectorTab = function collectionSetInspectorTabAdapter(tab) {
  collectionGetBuilderShellManager().setInspectorTab(tab);
};

collectionToggleInspectorInput = function collectionToggleInspectorInputAdapter(mappingKey) {
  collectionGetBuilderShellManager().toggleInspectorInput(mappingKey);
};

collectionToggleInspectorOutput = function collectionToggleInspectorOutputAdapter(sourceVarKey) {
  collectionGetBuilderShellManager().toggleInspectorOutput(sourceVarKey);
};

collectionSetOutputSearchTerm = function collectionSetOutputSearchTermAdapter(scopeKey, value) {
  collectionGetBuilderShellManager().setOutputSearchTerm(scopeKey, value);
};

collectionToggleSourcePicker = function collectionToggleSourcePickerAdapter(mappingKey) {
  collectionGetBuilderShellManager().toggleSourcePicker(mappingKey);
};

collectionToggleSourceGroup = function collectionToggleSourceGroupAdapter(mappingKey, groupLabel) {
  collectionGetBuilderShellManager().toggleSourceGroup(mappingKey, groupLabel);
};

collectionSelectInputSource = function collectionSelectInputSourceAdapter(mappingKey, value) {
  collectionGetBuilderShellManager().closeSourcePicker();
  collectionUpdateInputMapping(mappingKey, value);
};

collectionCopyExecutionUrl = function collectionCopyExecutionUrlAdapter(button) {
  var urlElement = document.getElementById('collection-step-url-preview');
  var url = urlElement ? urlElement.textContent : '';
  if (!url || !navigator.clipboard) return;

  navigator.clipboard.writeText(url).then(function showCopied() {
    if (!button) return;
    var originalLabel = button.textContent;
    button.textContent = 'Copiado';
    setTimeout(function restoreLabel() { button.textContent = originalLabel; }, 1500);
  }).catch(function ignoreCopyError() {});
};

collectionClearCatalogSelection = function collectionClearCatalogSelectionAdapter() {
  collectionGetBuilderShellManager().clearCatalogSelection();
  collectionGetServiceCatalogManager().renderServiceCatalog();
};

collectionClearServiceSearch = function collectionClearServiceSearchAdapter() {
  var searchInput = document.getElementById('collection-service-search');
  if (searchInput) searchInput.value = '';
  collectionGetServiceCatalogManager().renderServiceCatalog();
};
