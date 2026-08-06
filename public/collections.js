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
var collectionChainSuggestionManager = null;
var collectionImportManager = null;
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

function collectionShowStatus(kind, text, title) {
  collectionFeedbackManager.showStatus(kind, text, title);
}

function collectionClearStatus() {
  collectionFeedbackManager.clearStatus();
}

function collectionDismissToast(id) {
  collectionFeedbackManager.dismissToast(id);
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

function collectionGetChainSuggestionManager() {
  if (collectionChainSuggestionManager) return collectionChainSuggestionManager;
  collectionChainSuggestionManager = new window.BTCollectionModules.CollectionChainSuggestionManager({
    getState: function() { return collectionState; },
    getActiveScenario: collectionGetActiveScenario,
    getSelectedItem: collectionGetSelectedItem,
    getPreviewManager: collectionGetPreviewManager,
    apiClient: collectionApiClient,
    insertOperation: collectionInsertOperation,
    updateInputMapping: collectionUpdateInputMapping,
    selectItem: collectionCanvasNodeClick,
    showStatus: collectionShowStatus,
    escapeHtml: collectionEscapeHtml
  });
  return collectionChainSuggestionManager;
}

function collectionGetImportManager() {
  if (collectionImportManager) return collectionImportManager;
  collectionImportManager = new window.BTCollectionModules.CollectionImportManager({
    getState: function() { return collectionState; },
    createScenario: collectionCreateScenario,
    insertOperation: collectionInsertOperation,
    getPreviewManager: collectionGetPreviewManager,
    updateInputMapping: collectionUpdateInputMapping,
    showStatus: collectionShowStatus,
    renderScenarios: collectionRenderScenarios,
    renderItems: collectionRenderItems,
    renderVariableEditor: collectionRenderVariableEditor,
    loadPreview: collectionLoadPreview
  });
  return collectionImportManager;
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
    renderInspector: function() { return collectionGetInspectorManager().renderInspector(); },
    showStatus: collectionShowStatus
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
  // swagger-ui vive ANIDADO bajo la URL publica completa (ej. .../api/publicapi
  // -> .../api/publicapi/swagger-ui/...), nunca como hermano reemplazando el
  // ultimo segmento — antes esto le sacaba el "/publicapi" por error.
  return publicBaseUrl + '/swagger-ui/index.html#/';
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
        collectionEnsureItemNodeId(item);
        (item.manualInputs || []).forEach(function(input) {
          if (collectionIsAutoResolvedKey(input.key, input.pathLabel)) return;
          var mappingKey = collectionBuildInputMappingKey(item, input);
          var sourceOptions = availableOutputs.slice();
          var inputAlias = (scenario.inputAliases && scenario.inputAliases[mappingKey]) ? scenario.inputAliases[mappingKey] : '';
          scenario.previewVariables.push({
            key: input.key,
            pathLabel: input.pathLabel || input.key,
            type: input.type || '',
            description: input.description || '',
            defaultValue: input.defaultValue || '',
            suggestions: [],
            alias: inputAlias,
            mappingKey: mappingKey,
            sourceOptions: sourceOptions,
            groupKey: item.service + '.' + item.method + '::' + itemIndex,
            groupTitle: (itemIndex + 1) + '. ' + item.service + '.' + item.method,
            sourceNodeId: collectionGetConnectedSourceId(scenario, item)
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
            sourceNodeId: item.nodeId,
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
        var sourceNodeId = input.sourceNodeId || '';
        input.sourceOptions = (input.sourceOptions || []).map(function(option) {
          return outputsByKey[option.sourceVarKey] || option;
        }).filter(function(option) {
          if (!sourceNodeId) return true;
          return option.sourceNodeId === sourceNodeId;
        });
        if (!collectionInputMappingValue(input.mappingKey)) {
          var suggestedSource = collectionSuggestMappingForInput(input, input.sourceOptions || []);
          if (suggestedSource) {
            scenario.inputMappings[input.mappingKey] = suggestedSource;
            scenario.previewMappings.push({
              target: input.groupTitle || '',
              input: input.pathLabel || input.key,
              source: suggestedSource
            });
          }
        }
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
        apiMode: S.apiMode,
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
  var inspectorState = collectionCaptureInspectorState(container);
  var scenario = collectionGetActiveScenario();
  var selectedItem = collectionGetSelectedItem();
  if (!scenario || !selectedItem) {
    container.innerHTML = '<div class="collection-step-empty">Selecciona un paso del flujo para ver sus entradas, salidas y ajustes manuales.</div>';
    collectionRestoreInspectorState(container, inspectorState);
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
          '<div class="collection-config-item-name">' + collectionEscapeHtml(collectionInputDisplayName(input)) + '</div>' +
          '<div class="collection-config-item-meta">' + collectionEscapeHtml((input.pathLabel || input.key) + (input.type ? ' | ' + input.type : '') + (input.description ? ' | ' + input.description : '')) + '</div>' +
          '<div class="collection-config-item-row"><input data-inspector-key="' + collectionEscapeHtml('input-alias:' + mappingKey) + '" class="collection-var-input" type="text" value="' + collectionEscapeHtml(input.alias || '') + '" placeholder="Nombre funcional para match" oninput="collectionUpdateInputAlias(' + "'" + collectionEscapeHtml(mappingKey) + "'" + ', this.value)"></div>' +
          (input.sourceOptions && input.sourceOptions.length ? '<div class="collection-config-item-row"><select data-inspector-key="' + collectionEscapeHtml('input-map:' + mappingKey) + '" class="collection-var-input" onchange="collectionUpdateInputMapping(' + "'" + collectionEscapeHtml(mappingKey) + "'" + ', this.value)"><option value=\"\">Completar a mano</option>' + input.sourceOptions.map(function(option) {
            var selected = mappedSource === option.sourceVarKey ? ' selected' : '';
            return '<option value="' + collectionEscapeHtml(option.sourceVarKey) + '"' + selected + '>' + collectionEscapeHtml(collectionOutputDisplayName(option)) + '</option>';
          }).join('') + '</select></div>' : '') +
          (mappedOption && mappedOption.isCollectionItemOutput ? '<div class="collection-config-filter-box">' +
            '<div class="collection-config-filter-title">Filtrar item de la lista origen</div>' +
            '<div class="collection-config-item-meta">La salida viene de una coleccion. Puedes elegir que registro tomar antes de pasarlo a este input.</div>' +
            '<div class="collection-config-filter-grid">' +
              '<select data-inspector-key="' + collectionEscapeHtml('input-filter-field:' + mappingKey) + '" class="collection-var-input" onchange="collectionUpdateInputMappingFilterField(' + "'" + collectionEscapeHtml(mappingKey) + "'" + ', this.value)"><option value=\"\">Sin filtro (primer item util)</option>' + (mappedOption.filterFieldOptions || []).map(function(option) {
                var selected = filterField === option.value ? ' selected' : '';
                return '<option value="' + collectionEscapeHtml(option.value) + '"' + selected + '>' + collectionEscapeHtml(option.label) + '</option>';
              }).join('') + '</select>' +
              '<input data-inspector-key="' + collectionEscapeHtml('input-filter-value:' + mappingKey) + '" class="collection-var-input" type="text" placeholder="Valor esperado" value="' + collectionEscapeHtml(filterValue) + '" oninput="collectionUpdateInputMappingFilterValue(' + "'" + collectionEscapeHtml(mappingKey) + "'" + ', this.value)">' +
            '</div>' +
          '</div>' : '') +
          '<div class="collection-config-item-row"><input id="' + collectionEscapeHtml(collectionDomId(input.key)) + '" data-inspector-key="' + collectionEscapeHtml('input-value:' + input.key) + '" data-collection-input-key="' + collectionEscapeHtml(input.key) + '" class="collection-var-input" type="text" value="' + collectionEscapeHtml(currentValue) + '" oninput="collectionUpdateVar(' + "'" + collectionEscapeHtml(input.key) + "'" + ', this.value)"' + (mappedSource ? ' disabled' : '') + '></div>' +
        '</div>';
      }).join('') : '<div class="collection-step-empty">Este paso no necesita variables manuales simples.</div>') +
    '</div>' +
    '<div class="collection-config-section">' +
      '<div class="collection-config-title">Salidas disponibles</div>' +
      (outputs.length ? outputs.map(function(output) {
        return '<div class="collection-config-item">' +
          '<div class="collection-config-item-name">' + collectionEscapeHtml(collectionOutputDisplayName(output)) + '</div>' +
          '<div class="collection-config-item-meta">' + collectionEscapeHtml((output.pathLabel || output.displayLabel || output.sourceVarKey) + (output.type ? ' | ' + output.type : '')) + '</div>' +
          '<div class="collection-config-item-row"><input data-inspector-key="' + collectionEscapeHtml('output-alias:' + output.sourceVarKey) + '" class="collection-var-input" type="text" value="' + collectionEscapeHtml(output.alias || '') + '" placeholder="Renombre funcional" oninput="collectionUpdateOutputAlias(' + "'" + collectionEscapeHtml(output.sourceVarKey) + "'" + ', this.value)"></div>' +
          '<div class="collection-config-item-row"><span class="collection-config-output-tag">' + collectionEscapeHtml(output.sourceVarKey) + '</span></div>' +
        '</div>';
      }).join('') : '<div class="collection-step-empty">Swagger no expuso salidas simples para este metodo.</div>') +
    '</div>' +
    (repeatableInputs.length ? '<div class="collection-config-section"><div class="collection-config-title">Listas y estructuras</div><div class="collection-step-empty">Este paso tiene ' + repeatableInputs.length + ' campo(s) complejos/repetibles. Los seguimos resolviendo con el motor actual, pero la edicion visual fina queda para la siguiente iteracion.</div></div>' : '');
  collectionRestoreInspectorState(container, inspectorState);
}

function collectionRenderItems() {
  var container = document.getElementById('collection-chain');
  if (!container) return;
  var scenario = collectionGetActiveScenario();
  var items = scenario ? scenario.items : [];
  if (scenario) collectionEnsureScenarioConnections(scenario);
  var totalItems = collectionState.scenarios.reduce(function(total, current) {
    return total + ((current.items || []).length);
  }, 0);

  collectionRenderServiceCatalog();
  if (!items.length) {
    container.innerHTML = '<div class="collection-canvas-stage" ondragover="collectionAllowCanvasDrop(event)" ondrop="collectionDropOperation(0, event)"><div class="collection-canvas-empty">Arrastra un servicio desde la izquierda o haz clic sobre uno para empezar a construir la cadena.</div></div>';
  } else {
    var selectedIndex = collectionGetSelectedItemIndex();
    var blocks = [];
    var maxX = 0;
    var maxY = 0;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var layout = collectionEnsureItemLayout(item, i);
      var nodeId = collectionEnsureItemNodeId(item);
      maxX = Math.max(maxX, layout.x);
      maxY = Math.max(maxY, layout.y);
      var op = String(item.operationKind || collectionInferOperationKind(item.method)).toLowerCase();
      blocks.push(
        '<div id="collection-canvas-step-' + i + '" class="collection-canvas-step' + (selectedIndex === i ? ' collection-canvas-step-selected' : '') + '" style="left:' + layout.x + 'px;top:' + layout.y + 'px" onclick="collectionCanvasNodeClick(' + i + ')" onmousedown="collectionStartNodeDrag(' + i + ', event)">' +
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
            '<button class="collection-canvas-node-handle" title="Crear flecha desde este paso" onmousedown="collectionStartNewConnectionDrag(' + "'" + collectionEscapeHtml(nodeId) + "'" + ', event)" onclick="event.stopPropagation()" type="button">&#8595;</button>' +
            '<button class="svc-rm" onclick="event.stopPropagation(); collectionRemoveItem(' + i + ')">&#10005;</button>' +
          '</div>' +
        '</div>'
      );
    }
    var surfaceWidth = Math.max(980, maxX + 420);
    var surfaceHeight = Math.max(540, maxY + 220);
    container.innerHTML =
      '<div class="collection-canvas-stage" ondragover="collectionAllowCanvasDrop(event)" ondrop="collectionDropOperation(' + items.length + ', event)">' +
        '<svg id="collection-canvas-svg" class="collection-canvas-svg"></svg>' +
        '<div id="collection-canvas-surface" class="collection-canvas-surface" style="width:' + surfaceWidth + 'px;height:' + surfaceHeight + 'px">' +
          blocks.join('') +
        '</div>' +
      '</div>';
    setTimeout(collectionRenderCanvasConnections, 0);
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
  collectionEnsureScenarioConnections(scenario);
  var nodeId = collectionEnsureItemNodeId(item);
  var incoming = collectionFindIncomingConnection(scenario, nodeId);
  var outgoing = collectionFindOutgoingConnection(scenario, nodeId);
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

  scenario.connections = scenario.connections.filter(function(connection) {
    return connection.fromId !== nodeId && connection.toId !== nodeId;
  });
  if (incoming && outgoing && incoming.fromId !== outgoing.toId) {
    scenario.connections.push({ fromId: incoming.fromId, toId: outgoing.toId });
  }
  if (scenario.pendingConnectionFromId === nodeId) scenario.pendingConnectionFromId = '';
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
  var inline = document.getElementById('collection-execution-inline');
  var visibleResult = document.getElementById('collection-result');
  var modal = document.getElementById('collection-execution-modal');
  var dock = document.getElementById('collection-execution-dock');
  var title = document.getElementById('collection-execution-title');
  var openBtn = document.getElementById('btn-collection-open-console');
  if (!el) return;
  var scenario = collectionGetActiveScenario();
  var steps = Array.isArray(data.steps) ? data.steps : [];
  var runtimeValues = data.runtimeValues || {};
  var okCount = steps.filter(function(step) { return !!step.ok; }).length;
  var errCount = steps.filter(function(step) { return !step.ok; }).length;
  var finalVars = Object.keys(runtimeValues).length
    ? '<div class="collection-run-vars">' + Object.keys(runtimeValues).map(function(key) {
        return '<span class="collection-run-var"><strong>' + collectionEscapeHtml(key) + '</strong> ' + collectionEscapeHtml(runtimeValues[key]) + '</span>';
      }).join('') + '</div>'
    : '<p>Sin variables finales para mostrar.</p>';

  // Resume BusinessErrors al formato negocio esperado y deja el payload completo
  // accesible solo como detalle para que la consola siga siendo clara.
  function summarizeBusinessError(rawText) {
    if (!rawText) return null;
    try {
      var parsed = typeof rawText === 'string' ? JSON.parse(rawText) : rawText;
      var errors = parsed && parsed.BusinessErrors && parsed.BusinessErrors.BusinessError;
      var first = Array.isArray(errors) ? errors[0] : errors;
      if (!first) return null;
      return {
        code: first.Code || first.code || '',
        description: first.Description || first.description || 'Business error',
        severity: first.Severity || first.severity || ''
      };
    } catch (e) {
      return null;
    }
  }

  function prettyPayload(text) {
    if (!text) return '';
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch (e) {
      return String(text);
    }
  }

  var stepHtml = steps.map(function(step) {
    var extracted = step.extractedValues || {};
    var businessError = summarizeBusinessError(step.error || '');
    var extractedHtml = Object.keys(extracted).length
      ? '<div class="collection-run-vars">' + Object.keys(extracted).map(function(key) {
          return '<span class="collection-run-var"><strong>' + collectionEscapeHtml(key) + '</strong> ' + collectionEscapeHtml(extracted[key]) + '</span>';
        }).join('') + '</div>'
      : '';
    var requestBlock = step.requestXml
      ? '<details class="collection-run-toggle"><summary>Ver request</summary><div class="collection-run-pre">' + collectionEscapeHtml(prettyPayload(step.requestXml)) + '</div></details>'
      : '';
    var responseBlock = step.responseXml
      ? '<details class="collection-run-toggle"><summary>Ver response</summary><div class="collection-run-pre">' + collectionEscapeHtml(prettyPayload(step.responseXml)) + '</div></details>'
      : '';
    return '<div class="collection-run-step">' +
      '<div class="collection-run-head">' +
        '<div>' +
          '<div class="collection-run-title">' + collectionEscapeHtml(step.name || ('Paso ' + step.index)) + '</div>' +
          '<div class="collection-run-subtitle">Paso ' + collectionEscapeHtml(String(step.index || '')) + (step.responseStatus ? ' · HTTP ' + collectionEscapeHtml(String(step.responseStatus)) : '') + '</div>' +
        '</div>' +
        '<div class="' + (step.ok ? 'collection-run-ok' : 'collection-run-err') + '">' + (step.ok ? 'OK' : 'ERROR') + '</div>' +
      '</div>' +
      '<div class="collection-run-body">' +
        '<div class="collection-run-meta"><strong>URL:</strong> ' + collectionEscapeHtml(step.requestUrl || '-') + (step.soapAction ? ' | <strong>SOAPAction:</strong> ' + collectionEscapeHtml(step.soapAction) : '') + '</div>' +
        (businessError
          ? '<div class="collection-run-error"><div class="collection-run-error-icon">❌</div><div><div class="collection-run-error-title">Error de negocio ' + collectionEscapeHtml(String(businessError.code || '').trim() || '-') + '</div><div class="collection-run-error-text">' + collectionEscapeHtml(businessError.description || 'Sin descripcion.') + '</div></div></div>'
          : (step.error ? '<div class="collection-run-error"><div class="collection-run-error-icon">❌</div><div><div class="collection-run-error-title">Error de ejecucion</div><div class="collection-run-error-text">' + collectionEscapeHtml(step.error) + '</div></div></div>' : '')) +
        (extractedHtml ? '<div class="collection-run-section"><div class="collection-run-section-title">Valores detectados</div>' + extractedHtml + '</div>' : '') +
        requestBlock +
        responseBlock +
      '</div>' +
    '</div>';
  }).join('');
  var topBusinessError = !data.ok ? summarizeBusinessError(data.message || '') : null;
  var topError = !data.ok && data.message
    ? (topBusinessError
      ? '<div class="collection-run-error"><div class="collection-run-error-icon">❌</div><div><div class="collection-run-error-title">Error general ' + collectionEscapeHtml(String(topBusinessError.code || '').trim() || '-') + '</div><div class="collection-run-error-text">' + collectionEscapeHtml(topBusinessError.description || 'Sin descripcion.') + '</div></div></div>'
      : '<div class="collection-run-error"><div class="collection-run-error-icon">❌</div><div><div class="collection-run-error-title">Error general</div><div class="collection-run-error-text">' + collectionEscapeHtml(data.message) + '</div></div></div>')
    : '';

  if (title) title.textContent = scenario ? scenario.name : 'Ejecucion del flujo';
  var html =
    '<div class="collection-run-grid">' +
      '<div class="collection-run-card"><div class="collection-run-card-label">Estado</div><div class="collection-run-card-value-sm">' + (data.ok ? 'Flujo completado correctamente' : 'La ejecucion se detuvo en el primer error') + '</div></div>' +
      '<div class="collection-run-card"><div class="collection-run-card-label">Pasos OK</div><div class="collection-run-card-value">' + okCount + '</div></div>' +
      '<div class="collection-run-card"><div class="collection-run-card-label">Pasos con error</div><div class="collection-run-card-value">' + errCount + '</div></div>' +
      '<div class="collection-run-card"><div class="collection-run-card-label">Variables finales</div><div class="collection-run-card-value">' + Object.keys(runtimeValues).length + '</div></div>' +
    '</div>' +
    topError +
    stepHtml +
    '<div class="collection-run-section"><div class="collection-run-section-title">Variables finales</div>' +
    finalVars +
    '</div>';
  el.innerHTML = html;
  if (inline) {
    inline.innerHTML = html;
    inline.style.display = 'block';
  }
  if (visibleResult) {
    visibleResult.className = 'collection-result show';
    visibleResult.innerHTML = html;
  }
  if (modal) modal.style.display = 'flex';
  if (dock) dock.style.display = 'none';
  if (openBtn) {
    openBtn.style.display = '';
    openBtn.disabled = false;
  }
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
  collectionRenderExecutionLoading();

  try {
    var r = await fetch('/api/collection/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: collectionState.format,
        version: S.version,
        platform: S.platform,
        apiMode: S.apiMode,
        db: typeof getDb === 'function' ? getDb() : {},
        api: getApi(),
        authContext: collectionState.authContext,
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
        apiMode: S.apiMode,
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

function collectionRenderExecutionResult(data) {
  var title = document.getElementById('collection-execution-title');
  var openBtn = document.getElementById('btn-collection-open-console');
  var dock = document.getElementById('collection-execution-dock');
  var scenario = collectionGetActiveScenario();

  try {
    var steps = Array.isArray(data && data.steps) ? data.steps : [];
    var runtimeValues = data && data.runtimeValues ? data.runtimeValues : {};
    var okCount = steps.filter(function(step) { return !!step.ok; }).length;
    var errCount = steps.filter(function(step) { return !step.ok; }).length;

    function summarizeBusinessError(rawText) {
      if (!rawText) return null;
      try {
        var parsed = typeof rawText === 'string' ? JSON.parse(rawText) : rawText;
        var errors = parsed && parsed.BusinessErrors && parsed.BusinessErrors.BusinessError;
        var first = Array.isArray(errors) ? errors[0] : errors;
        if (!first) return null;
        return {
          code: first.Code || first.code || '',
          description: first.Description || first.description || 'Business error'
        };
      } catch (e) {
        return null;
      }
    }

    function prettyPayload(text) {
      if (!text) return '';
      try {
        return JSON.stringify(typeof text === 'string' ? JSON.parse(text) : text, null, 2);
      } catch (e) {
        return String(text);
      }
    }

    var finalVars = Object.keys(runtimeValues).length
      ? '<div class="collection-run-vars">' + Object.keys(runtimeValues).map(function(key) {
          return '<span class="collection-run-var"><strong>' + collectionEscapeHtml(key) + '</strong> ' + collectionEscapeHtml(runtimeValues[key]) + '</span>';
        }).join('') + '</div>'
      : '<p>Sin variables finales para mostrar.</p>';

    var stepHtml = steps.map(function(step) {
      var extracted = step && step.extractedValues ? step.extractedValues : {};
      var businessError = summarizeBusinessError(step && step.error ? step.error : '');
      var extractedHtml = Object.keys(extracted).length
        ? '<div class="collection-run-vars">' + Object.keys(extracted).map(function(key) {
            return '<span class="collection-run-var"><strong>' + collectionEscapeHtml(key) + '</strong> ' + collectionEscapeHtml(extracted[key]) + '</span>';
          }).join('') + '</div>'
        : '';
      var requestPayload = step.requestJson || step.requestXml || step.requestBody || step.request || '';
      var responsePayload = step.responseJson || step.responseXml || step.responseBody || step.response || '';
      var requestBlock = requestPayload
        ? '<details class="collection-run-toggle"><summary>Ver request</summary><div class="collection-run-pre">' + collectionEscapeHtml(prettyPayload(requestPayload)) + '</div></details>'
        : '';
      var responseBlock = responsePayload
        ? '<details class="collection-run-toggle"><summary>Ver response</summary><div class="collection-run-pre">' + collectionEscapeHtml(prettyPayload(responsePayload)) + '</div></details>'
        : '';
      var errorBlock = '';
      if (businessError) {
        errorBlock = '<div class="collection-run-error"><div class="collection-run-error-icon">X</div><div><div class="collection-run-error-title">Error de negocio ' + collectionEscapeHtml(String(businessError.code || '').trim() || '-') + '</div><div class="collection-run-error-text">' + collectionEscapeHtml(businessError.description || 'Sin descripcion.') + '</div></div></div>';
      } else if (step.error) {
        errorBlock = '<div class="collection-run-error"><div class="collection-run-error-icon">X</div><div><div class="collection-run-error-title">Error de ejecucion</div><div class="collection-run-error-text">' + collectionEscapeHtml(step.error) + '</div></div></div>';
      }

      return '<div class="collection-run-step">' +
        '<div class="collection-run-head">' +
          '<div>' +
            '<div class="collection-run-title">' + collectionEscapeHtml(step.name || ('Paso ' + step.index)) + '</div>' +
            '<div class="collection-run-subtitle">Paso ' + collectionEscapeHtml(String(step.index || '')) + (step.responseStatus ? ' · HTTP ' + collectionEscapeHtml(String(step.responseStatus)) : '') + '</div>' +
          '</div>' +
          '<div class="' + (step.ok ? 'collection-run-ok' : 'collection-run-err') + '">' + (step.ok ? 'OK' : 'ERROR') + '</div>' +
        '</div>' +
        '<div class="collection-run-body">' +
          '<div class="collection-run-meta"><strong>URL:</strong> ' + collectionEscapeHtml(step.requestUrl || '-') + (step.soapAction ? ' | <strong>SOAPAction:</strong> ' + collectionEscapeHtml(step.soapAction) : '') + '</div>' +
          errorBlock +
          (extractedHtml ? '<div class="collection-run-section"><div class="collection-run-section-title">Valores detectados</div>' + extractedHtml + '</div>' : '') +
          requestBlock +
          responseBlock +
        '</div>' +
      '</div>';
    }).join('');

    var topBusinessError = !data.ok ? summarizeBusinessError(data.message || '') : null;
    var topError = !data.ok && data.message
      ? (topBusinessError
        ? '<div class="collection-run-error"><div class="collection-run-error-icon">X</div><div><div class="collection-run-error-title">Error general ' + collectionEscapeHtml(String(topBusinessError.code || '').trim() || '-') + '</div><div class="collection-run-error-text">' + collectionEscapeHtml(topBusinessError.description || 'Sin descripcion.') + '</div></div></div>'
        : '<div class="collection-run-error"><div class="collection-run-error-icon">X</div><div><div class="collection-run-error-title">Error general</div><div class="collection-run-error-text">' + collectionEscapeHtml(data.message) + '</div></div></div>')
      : '';

    if (title) title.textContent = scenario ? scenario.name : 'Ejecucion del flujo';
    collectionSetExecutionHtml(
      '<div class="collection-run-grid">' +
        '<div class="collection-run-card"><div class="collection-run-card-label">Estado</div><div class="collection-run-card-value-sm">' + (data.ok ? 'Flujo completado correctamente' : 'La ejecucion se detuvo en el primer error') + '</div></div>' +
        '<div class="collection-run-card"><div class="collection-run-card-label">Pasos OK</div><div class="collection-run-card-value">' + okCount + '</div></div>' +
        '<div class="collection-run-card"><div class="collection-run-card-label">Pasos con error</div><div class="collection-run-card-value">' + errCount + '</div></div>' +
        '<div class="collection-run-card"><div class="collection-run-card-label">Variables finales</div><div class="collection-run-card-value">' + Object.keys(runtimeValues).length + '</div></div>' +
      '</div>' +
      topError +
      stepHtml +
      '<div class="collection-run-section"><div class="collection-run-section-title">Variables finales</div>' + finalVars + '</div>' +
      '<div class="collection-run-section"><div class="collection-run-section-title">JSON de ejecucion</div><div class="collection-run-pre">' + collectionEscapeHtml(JSON.stringify(data, null, 2)) + '</div></div>',
      data
    );
  } catch (error) {
    collectionSetExecutionHtml(
      '<div class="collection-run-error"><div class="collection-run-error-icon">X</div><div><div class="collection-run-error-title">No se pudo maquetar la consola</div><div class="collection-run-error-text">' + collectionEscapeHtml(error && error.message ? error.message : 'Sin detalle') + '</div></div></div>' +
      '<div class="collection-run-section"><div class="collection-run-section-title">JSON de ejecucion</div><div class="collection-run-pre">' + collectionEscapeHtml(JSON.stringify(data, null, 2)) + '</div></div>',
      data
    );
  }

  if (dock) dock.style.display = 'none';
  if (openBtn) {
    openBtn.style.display = '';
    openBtn.disabled = false;
  }
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
  collectionRenderExecutionLoading();

  try {
    var r = await fetch('/api/collection/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: collectionState.format,
        version: S.version,
        platform: S.platform,
        apiMode: S.apiMode,
        db: typeof getDb === 'function' ? getDb() : {},
        api: getApi(),
        authContext: collectionState.authContext,
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
    if (!d.ok) collectionShowStatus('err', d.message || 'La ejecucion del flujo fallo.');
    else collectionShowStatus('ok', 'Flujo ejecutado correctamente.');
    collectionRenderExecutionResult(d);
  } catch (e) {
    collectionShowStatus('err', e.message || 'No se pudo ejecutar el flujo.');
    collectionSetExecutionHtml(
      '<div class="collection-run-error"><div class="collection-run-error-icon">X</div><div><div class="collection-run-error-title">Error general</div><div class="collection-run-error-text">' + collectionEscapeHtml(e.message || 'No se pudo ejecutar el flujo.') + '</div></div></div>',
      { ok: false, message: e.message || 'No se pudo ejecutar el flujo.' }
    );
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = 'Probar flujo';
  }
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

collectionUpdateFormat = function collectionUpdateFormatAdapter(value) {
  // Formato (XML/JSON) solo elegible para V3; vive en el manager de ambiente
  // junto al resto de la sincronizacion de UI de "Cargar servicios".
  collectionGetEnvironmentManager().updateFormat(value);
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

// Vuelve del canvas a la pantalla de Fuente/Ruta Swagger sin tocar nada del
// escenario ya armado (servicios, casos de uso, mappings): solo cambia que
// bloque de collection-config/collection-services esta visible (ver
// CollectionStudioManager.renderStage()).
collectionBackToSetup = function collectionBackToSetupAdapter() {
  collectionGetStudioManager().setStage('setup');
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

collectionHandleExecutionNodeAction = async function collectionHandleExecutionNodeActionAdapter(actionKey, stepId) {
  return collectionGetExecutionCenter().handleNodeAction(actionKey, stepId);
};

collectionZoomInExecutionFlow = function collectionZoomInExecutionFlowAdapter() {
  collectionGetExecutionCenter().zoomIn();
};

collectionZoomOutExecutionFlow = function collectionZoomOutExecutionFlowAdapter() {
  collectionGetExecutionCenter().zoomOut();
};

// Zoom del canvas de construccion del flujo (no confundir con los de arriba,
// que son del panel de Ejecucion) — mismo patron, instancia separada.
collectionZoomInCanvas = function collectionZoomInCanvasAdapter() {
  collectionGetCanvasManager().zoomIn();
};

collectionZoomOutCanvas = function collectionZoomOutCanvasAdapter() {
  collectionGetCanvasManager().zoomOut();
};

collectionToggleCanvasCompact = function collectionToggleCanvasCompactAdapter() {
  collectionGetCanvasManager().toggleCompactNodes();
};

collectionToggleExecutionTimeline = function collectionToggleExecutionTimelineAdapter() {
  collectionGetExecutionCenter().toggleTimelineOpen();
};

collectionCloseExecutionTimeline = function collectionCloseExecutionTimelineAdapter() {
  collectionGetExecutionCenter().closeTimelineOpen();
};

collectionToggleExecutionFlowExpanded = function collectionToggleExecutionFlowExpandedAdapter() {
  collectionGetExecutionCenter().toggleFlowExpanded();
};

collectionStartExecPanelResize = function collectionStartExecPanelResizeAdapter(event) {
  collectionGetExecutionCenter().startPanelResize(event);
};

collectionCancelExecutionRun = function collectionCancelExecutionRunAdapter() {
  collectionGetExecutionCenter().cancelExecution();
};

collectionCopyExecutionCodeSource = function collectionCopyExecutionCodeSourceAdapter(buttonEl) {
  var wrap = buttonEl && buttonEl.parentElement;
  var source = wrap ? wrap.querySelector('.collection-exec-code-source') : null;
  if (!source || !navigator.clipboard) return;

  navigator.clipboard.writeText(source.value).then(function showCopied() {
    var originalLabel = buttonEl.textContent;
    buttonEl.textContent = 'Copiado';
    setTimeout(function restoreLabel() { buttonEl.textContent = originalLabel; }, 1500);
  }).catch(function ignoreCopyError() {});
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

  collectionShowStatus('ok', 'Generando collection Postman (' + String(collectionState.format || 'json').toUpperCase() + ')...');
  collectionResetResult();

  try {
    var data = await collectionApiClient.generateCollection({
      format: collectionState.format,
      target: collectionState.target,
      version: S.version,
      platform: S.platform,
      apiMode: (typeof S !== 'undefined' ? S.apiMode : undefined),
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
  collectionGetChainSuggestionManager().close();
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
  collectionGetChainSuggestionManager().close();
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

collectionToggleInspectorInputGroup = function collectionToggleInspectorInputGroupAdapter(groupKey) {
  // Grupo visual de entradas (campos de un mismo SDT/coleccion) — ver
  // renderInputsTab en collection-inspector-manager.js.
  collectionGetBuilderShellManager().toggleInspectorInputGroup(groupKey);
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

collectionTriggerImportCollection = function collectionTriggerImportCollectionAdapter() {
  collectionGetImportManager().triggerFileDialog();
};

collectionImportCollectionFile = function collectionImportCollectionFileAdapter(file) {
  collectionGetImportManager().handleFileSelected(file);
};

collectionOpenChainSuggestionDrawer = function collectionOpenChainSuggestionDrawerAdapter() {
  collectionGetChainSuggestionManager().open();
};

collectionCloseChainSuggestionDrawer = function collectionCloseChainSuggestionDrawerAdapter() {
  collectionGetChainSuggestionManager().close();
};

collectionSetSuggestStartMethod = function collectionSetSuggestStartMethodAdapter(value) {
  collectionGetChainSuggestionManager().setStartMethod(value);
};

collectionSetSuggestScope = function collectionSetSuggestScopeAdapter(scope) {
  collectionGetChainSuggestionManager().setScope(scope);
};

collectionRunChainSuggestionSearch = function collectionRunChainSuggestionSearchAdapter() {
  return collectionGetChainSuggestionManager().search();
};

collectionToggleChainSuggestion = function collectionToggleChainSuggestionAdapter(index) {
  collectionGetChainSuggestionManager().toggleExpand(index);
};

collectionConfirmChainSuggestion = function collectionConfirmChainSuggestionAdapter(index) {
  return collectionGetChainSuggestionManager().confirmInsert(index);
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
