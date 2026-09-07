(function bootstrapCollectionManagerRegistry(global) {
  'use strict';

  /**
   * Raiz de composicion del builder de Collections: guarda el estado
   * compartido y construye/memoiza cada manager especializado con sus
   * dependencias ya resueltas. Este archivo debe cargarse ULTIMO (ver
   * collections-entry.js) porque las factories de abajo capturan por nombre
   * funciones que viven en los demas archivos *-adapter.js — para cuando se
   * invocan (recien al montar el panel, al final de este archivo), todos esos
   * nombres ya existen en window sin importar en que archivo quedaron.
   *
   * Como el resto de los modulos, usa IIFE + 'use strict'. A diferencia de
   * ellos, expone muchos nombres sueltos en `global` (no una sola clase via
   * BTCollectionModules) porque el HTML que generan los managers los invoca
   * por nombre desde atributos inline (onclick=...) — no hay bundler que
   * resuelva otra cosa.
   */

  // Estado central del builder: toda la UI opera sobre este mismo objeto (no
  // se clona), asi los cambios se ven en tiempo real en cualquier panel.
  global.collectionState = {
    format: 'json',
    target: 'postman',
    serviceSource: 'swagger',
    services: [],
    serviceOperations: {},
    // Lista de rutas Swagger del ambiente (un microservicio puede tener el
    // suyo propio, cada uno en su propio host/puerto -- ver
    // loadServicesFromSwagger).
    swaggerUrls: [],
    swaggerResolvedUrl: '',
    swaggerBaseUrl: '',
    swaggerAuthUrl: '',
    // 'session-userlogin' | 'authenticate-execute' | null -- que mecanismo de
    // autenticacion se detecto en el swagger (ver findInternaAuthOperation en
    // index.js). Determina el shape del request/response de auth tanto al
    // ejecutar como al exportar la collection.
    swaggerAuthKind: null,
    // Si esta en false, se saltea la deteccion/prueba automatica de
    // autenticacion al cargar servicios -- el usuario la ajusta a mano
    // despues (ver checkbox "Detectar autenticacion automaticamente").
    autoDetectAuth: true,
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

  // Flags y estado de drag privados: solo los leen/escriben las factories de
  // este mismo archivo (via los callbacks que le pasan a cada manager), asi
  // que no necesitan vivir en window como el resto de los nombres de aca.
  var collectionButtonsBound = false;
  var collectionFlowResizeBound = false;
  var collectionCanvasDragState = null;
  var collectionConnectionDragState = null;

  // Instancias compartidas. collectionStore/collectionFeedbackManager quedan
  // privadas (solo las usan los delegadores de mas abajo, en este archivo);
  // collectionUtils/collectionApiClient si se exponen porque otros archivos
  // *-adapter.js las llaman directo por nombre.
  global.collectionUtils = new window.BTCollectionModules.CollectionUtils({
    getDb: function() { return typeof getDb === 'function' ? getDb() : {}; },
    getApi: function() { return typeof getApi === 'function' ? getApi() : {}; }
  });
  global.collectionApiClient = new window.BTCollectionModules.CollectionApiClient();
  var collectionStore = new window.BTCollectionModules.CollectionStateStore(global.collectionState);
  var collectionFeedbackManager = new window.BTCollectionModules.CollectionFeedbackManager();

  // Singletons perezosos de cada manager especializado. Quedan privados: solo
  // los tocan sus propias factories de abajo (patron clasico backing-var +
  // getter publico).
  var collectionStudioManager = null;
  var collectionCanvasManager = null;
  var collectionCanvasInteractionManager = null;
  var collectionInspectorManager = null;
  var collectionScenarioManager = null;
  var collectionServiceCatalogManager = null;
  var collectionChainSuggestionManager = null;
  var collectionTokenSourceManager = null;
  var collectionImportManager = null;
  var collectionPreviewManager = null;
  var collectionExecutionCenter = null;
  var collectionRequestDataManager = null;
  var collectionEnvironmentManager = null;
  var collectionBootstrapManager = null;
  var collectionResultManager = null;
  var collectionFlowLifecycleManager = null;
  var collectionBuilderShellManager = null;

  global.collectionCreateScenario = function collectionCreateScenario(name) {
    return collectionStore.createScenario(name);
  };

  global.collectionEnsureItemNodeId = function collectionEnsureItemNodeId(item) {
    return collectionStore.ensureItemNodeId(item);
  };

  global.collectionDefaultNodeLayout = function collectionDefaultNodeLayout(index) {
    return collectionStore.defaultNodeLayout(index);
  };

  global.collectionEnsureItemLayout = function collectionEnsureItemLayout(item, index) {
    return collectionStore.ensureItemLayout(item, index);
  };

  global.collectionEnsureScenarioConnections = function collectionEnsureScenarioConnections(scenario) {
    return collectionStore.ensureScenarioConnections(scenario);
  };

  global.collectionGetActiveScenario = function collectionGetActiveScenario() {
    return collectionStore.getActiveScenario();
  };

  global.collectionEnsureScenario = function collectionEnsureScenario() {
    collectionStore.ensureScenario();
  };

  global.collectionShowStatus = function collectionShowStatus(kind, text, title) {
    collectionFeedbackManager.showStatus(kind, text, title);
  };

  global.collectionClearStatus = function collectionClearStatus() {
    collectionFeedbackManager.clearStatus();
  };

  global.collectionDismissToast = function collectionDismissToast(id) {
    collectionFeedbackManager.dismissToast(id);
  };

  global.collectionResetResult = function collectionResetResult() {
    collectionFeedbackManager.resetResult();
  };

  global.collectionGetStudioManager = function collectionGetStudioManager() {
    if (collectionStudioManager) return collectionStudioManager;
    collectionStudioManager = new window.BTCollectionModules.CollectionStudioManager(global.collectionState, {
      refreshContext: global.collectionRefreshContext,
      clearStatus: global.collectionClearStatus,
      resetResult: global.collectionResetResult,
      resetExecution: global.collectionResetExecution,
      toggleConfig: global.collectionToggleConfig
    });
    return collectionStudioManager;
  };

  global.collectionGetExecutionCenter = function collectionGetExecutionCenter() {
    if (collectionExecutionCenter) return collectionExecutionCenter;
    collectionExecutionCenter = new window.BTCollectionModules.CollectionExecutionCenter({
      getState: function() { return global.collectionState; },
      getActiveScenario: global.collectionGetActiveScenario,
      getFormat: function() { return global.collectionState.format; },
      getVersion: function() { return typeof S !== 'undefined' ? S.version : ''; },
      getPlatform: function() { return typeof S !== 'undefined' ? S.platform : ''; },
      getApiMode: function() { return typeof S !== 'undefined' ? S.apiMode : ''; },
      getDb: function() { return typeof getDb === 'function' ? getDb() : {}; },
      getApi: function() { return typeof getApi === 'function' ? getApi() : {}; },
      getAuthContext: function() { return global.collectionState.authContext; },
      getSwaggerBaseUrl: function() { return global.collectionState.swaggerBaseUrl; },
      getSwaggerAuthUrl: function() { return global.collectionState.swaggerAuthUrl; },
      getSwaggerAuthKind: function() { return global.collectionState.swaggerAuthKind; },
      executeFlowRequest: function(payload) { return global.collectionApiClient.executeFlow(payload); },
      isPathSupported: global.collectionPathSupported,
      refreshContext: global.collectionRefreshContext,
      syncInspectorInputs: global.collectionSyncInspectorInputs,
      showStatus: global.collectionShowStatus,
      escapeHtml: global.collectionEscapeHtml,
      ensureScenarioConnections: global.collectionEnsureScenarioConnections,
      buildConnectionLabel: global.collectionBuildCanvasLinkText
    });
    return collectionExecutionCenter;
  };

  global.collectionGetScenarioManager = function collectionGetScenarioManager() {
    if (collectionScenarioManager) return collectionScenarioManager;
    collectionScenarioManager = new window.BTCollectionModules.CollectionScenarioManager({
      getState: function() { return global.collectionState; },
      createScenario: global.collectionCreateScenario,
      ensureScenario: global.collectionEnsureScenario,
      getActiveScenario: global.collectionGetActiveScenario,
      renderItems: global.collectionRenderItems,
      renderVariableEditor: global.collectionRenderVariableEditor,
      resetResult: global.collectionResetResult,
      resetExecution: global.collectionResetExecution,
      escapeHtml: global.collectionEscapeHtml
    });
    return collectionScenarioManager;
  };

  global.collectionGetServiceCatalogManager = function collectionGetServiceCatalogManager() {
    if (collectionServiceCatalogManager) return collectionServiceCatalogManager;
    collectionServiceCatalogManager = new window.BTCollectionModules.CollectionServiceCatalogManager({
      getState: function() { return global.collectionState; },
      getPlatform: function() { return typeof S !== 'undefined' ? S.platform : ''; },
      getVersion: function() { return typeof S !== 'undefined' ? S.version : ''; },
      getApi: function() { return typeof getApi === 'function' ? getApi() : {}; },
      refreshContext: global.collectionRefreshContext,
      pathSupported: global.collectionPathSupported,
      showStatus: global.collectionShowStatus,
      renderItems: global.collectionRenderItems,
      renderVariableEditor: global.collectionRenderVariableEditor,
      setStudioStage: global.collectionSetStudioStage,
      escapeHtml: global.collectionEscapeHtml
    });
    return collectionServiceCatalogManager;
  };

  global.collectionGetChainSuggestionManager = function collectionGetChainSuggestionManager() {
    if (collectionChainSuggestionManager) return collectionChainSuggestionManager;
    collectionChainSuggestionManager = new window.BTCollectionModules.CollectionChainSuggestionManager({
      getState: function() { return global.collectionState; },
      getActiveScenario: global.collectionGetActiveScenario,
      getSelectedItem: global.collectionGetSelectedItem,
      getPreviewManager: global.collectionGetPreviewManager,
      apiClient: global.collectionApiClient,
      insertOperation: global.collectionInsertOperation,
      updateInputMapping: global.collectionUpdateInputMapping,
      selectItem: global.collectionCanvasNodeClick,
      showStatus: global.collectionShowStatus,
      escapeHtml: global.collectionEscapeHtml
    });
    return collectionChainSuggestionManager;
  };

  global.collectionGetTokenSourceManager = function collectionGetTokenSourceManager() {
    if (collectionTokenSourceManager) return collectionTokenSourceManager;
    collectionTokenSourceManager = new window.BTCollectionModules.CollectionTokenSourceManager({
      getActiveScenario: global.collectionGetActiveScenario,
      getPreviewManager: global.collectionGetPreviewManager,
      escapeHtml: global.collectionEscapeHtml
    });
    return collectionTokenSourceManager;
  };

  global.collectionGetImportManager = function collectionGetImportManager() {
    if (collectionImportManager) return collectionImportManager;
    collectionImportManager = new window.BTCollectionModules.CollectionImportManager({
      getState: function() { return global.collectionState; },
      createScenario: global.collectionCreateScenario,
      insertOperation: global.collectionInsertOperation,
      getPreviewManager: global.collectionGetPreviewManager,
      updateInputMapping: global.collectionUpdateInputMapping,
      showStatus: global.collectionShowStatus,
      renderScenarios: global.collectionRenderScenarios,
      renderItems: global.collectionRenderItems,
      renderVariableEditor: global.collectionRenderVariableEditor,
      loadPreview: global.collectionLoadPreview
    });
    return collectionImportManager;
  };

  global.collectionGetPreviewManager = function collectionGetPreviewManager() {
    if (collectionPreviewManager) return collectionPreviewManager;
    collectionPreviewManager = new window.BTCollectionModules.CollectionPreviewManager({
      getState: function() { return global.collectionState; },
      getActiveScenario: global.collectionGetActiveScenario,
      getSelectedItem: global.collectionGetSelectedItem,
      getVersion: function() { return typeof S !== 'undefined' ? S.version : ''; },
      getPlatform: function() { return typeof S !== 'undefined' ? S.platform : ''; },
      getDb: function() { return typeof getDb === 'function' ? getDb() : {}; },
      getApi: function() { return typeof getApi === 'function' ? getApi() : {}; },
      loadPreviewRequest: function(payload) { return global.collectionApiClient.loadPreview(payload); },
      ensureItemNodeId: global.collectionEnsureItemNodeId,
      getConnectedSourceId: global.collectionGetConnectedSourceId,
      isAutoResolvedKey: global.collectionIsAutoResolvedKey,
      renderVariableEditor: global.collectionRenderVariableEditor,
      showStatus: global.collectionShowStatus,
      pathSupported: global.collectionPathSupported
    });
    return collectionPreviewManager;
  };

  global.collectionGetRequestDataManager = function collectionGetRequestDataManager() {
    if (collectionRequestDataManager) return collectionRequestDataManager;

    collectionRequestDataManager = new window.BTCollectionModules.CollectionRequestDataManager({
      apiClient: global.collectionApiClient,
      getState: function() { return global.collectionState; },
      getFormat: function() { return global.collectionState.format; },
      getTarget: function() { return global.collectionState.target; },
      getVersion: function() { return typeof S !== 'undefined' ? S.version : ''; },
      getPlatform: function() { return typeof S !== 'undefined' ? S.platform : ''; },
      getApiMode: function() { return typeof S !== 'undefined' ? S.apiMode : ''; },
      getDb: function() { return typeof getDb === 'function' ? getDb() : {}; },
      getApi: function() { return typeof getApi === 'function' ? getApi() : {}; },
      getSwaggerBaseUrl: function() { return global.collectionState.swaggerBaseUrl; },
      getSwaggerAuthUrl: function() { return global.collectionState.swaggerAuthUrl; },
      getSwaggerAuthKind: function() { return global.collectionState.swaggerAuthKind; },
      getCollectionName: function() { return global.collectionState.collectionName; },
      pathSupported: global.collectionPathSupported,
      syncInspectorInputs: global.collectionSyncInspectorInputs,
      refreshContext: global.collectionRefreshContext,
      resetResult: global.collectionResetResult,
      resetExecution: global.collectionResetExecution,
      renderItems: global.collectionRenderItems,
      renderVariableEditor: global.collectionRenderVariableEditor,
      loadPreview: global.collectionLoadPreview,
      showStatus: global.collectionShowStatus
    });

    return collectionRequestDataManager;
  };

  global.collectionGetEnvironmentManager = function collectionGetEnvironmentManager() {
    if (collectionEnvironmentManager) return collectionEnvironmentManager;

    collectionEnvironmentManager = new window.BTCollectionModules.CollectionEnvironmentManager({
      apiClient: global.collectionApiClient,
      getState: function() { return global.collectionState; },
      getWizardState: function() { return typeof S !== 'undefined' ? S : {}; },
      getDb: function() { return typeof getDb === 'function' ? getDb() : {}; },
      getApi: function() { return typeof getApi === 'function' ? getApi() : {}; },
      contextKey: global.collectionContextKey,
      resolveV4AuthUrl: global.collectionResolveV4AuthUrl,
      guessSwaggerUrl: global.collectionGuessSwaggerUrl,
      isPathSupported: global.collectionPathSupported,
      resetLoadedData: global.collectionResetLoadedData,
      showStatus: global.collectionShowStatus,
      filterServices: global.collectionFilterServices,
      renderVariableEditor: global.collectionRenderVariableEditor,
      setStudioStage: global.collectionSetStudioStage,
      escapeHtml: global.collectionEscapeHtml
    });

    return collectionEnvironmentManager;
  };

  global.collectionGetBootstrapManager = function collectionGetBootstrapManager() {
    if (collectionBootstrapManager) return collectionBootstrapManager;

    collectionBootstrapManager = new window.BTCollectionModules.CollectionBootstrapManager({
      apiClient: global.collectionApiClient,
      isButtonsBound: function() { return collectionButtonsBound; },
      setButtonsBound: function(value) { collectionButtonsBound = !!value; },
      isFlowResizeBound: function() { return collectionFlowResizeBound; },
      setFlowResizeBound: function(value) { collectionFlowResizeBound = !!value; },
      testDb: global.collectionTestDb,
      testAuth: global.collectionTestAuth,
      loadServices: global.collectionLoadServices,
      upgradeStudioLayout: global.collectionUpgradeStudioLayout,
      ensureScenario: global.collectionEnsureScenario,
      renderScenarios: global.collectionRenderScenarios,
      renderItems: global.collectionRenderItems,
      refreshContext: global.collectionRefreshContext,
      renderFlowConnections: global.collectionRenderFlowConnections,
      renderCanvasConnections: global.collectionRenderCanvasConnections,
      pickChoice: global.collectionPickChoice,
      escapeHtml: global.collectionEscapeHtml
    });

    return collectionBootstrapManager;
  };

  global.collectionGetResultManager = function collectionGetResultManager() {
    if (collectionResultManager) return collectionResultManager;

    collectionResultManager = new window.BTCollectionModules.CollectionResultManager({
      escapeHtml: global.collectionEscapeHtml
    });

    return collectionResultManager;
  };

  global.collectionGetFlowLifecycleManager = function collectionGetFlowLifecycleManager() {
    if (collectionFlowLifecycleManager) return collectionFlowLifecycleManager;

    collectionFlowLifecycleManager = new window.BTCollectionModules.CollectionFlowLifecycleManager({
      getState: function() { return global.collectionState; },
      getActiveScenario: global.collectionGetActiveScenario,
      getVersion: function() { return typeof S !== 'undefined' ? S.version : ''; },
      getPlatform: function() { return typeof S !== 'undefined' ? S.platform : ''; },
      getApiMode: function() { return typeof S !== 'undefined' ? S.apiMode : ''; },
      getDb: function() { return typeof getDb === 'function' ? getDb() : {}; },
      apiClient: global.collectionApiClient,
      ensureScenarioConnections: global.collectionEnsureScenarioConnections,
      ensureItemNodeId: global.collectionEnsureItemNodeId,
      ensureItemLayout: global.collectionEnsureItemLayout,
      defaultNodeLayout: global.collectionDefaultNodeLayout,
      buildInputMappingKey: global.collectionBuildInputMappingKey,
      buildOutputVarKey: global.collectionBuildOutputVarKey,
      renderScenarios: global.collectionRenderScenarios,
      renderItems: global.collectionRenderItems,
      renderVariableEditor: global.collectionRenderVariableEditor,
      loadPreview: global.collectionLoadPreview,
      resetResult: global.collectionResetResult,
      resetExecution: global.collectionResetExecution
    });

    return collectionFlowLifecycleManager;
  };

  global.collectionGetBuilderShellManager = function collectionGetBuilderShellManager() {
    if (collectionBuilderShellManager) return collectionBuilderShellManager;
    collectionBuilderShellManager = new window.BTCollectionModules.CollectionBuilderShellManager({
      getState: function() { return global.collectionState; },
      getActiveScenario: global.collectionGetActiveScenario,
      getSelectedItem: global.collectionGetSelectedItem,
      insertOperation: global.collectionInsertOperation,
      renderItems: global.collectionRenderItems,
      renderServiceCatalog: function() { return global.collectionGetServiceCatalogManager().renderServiceCatalog(); },
      renderInspector: function() { return global.collectionGetInspectorManager().renderInspector(); },
      showStatus: global.collectionShowStatus
    });
    return collectionBuilderShellManager;
  };

  global.collectionGetCanvasManager = function collectionGetCanvasManager() {
    if (collectionCanvasManager) return collectionCanvasManager;
    collectionCanvasManager = new window.BTCollectionModules.CollectionCanvasManager({
      getState: function() { return global.collectionState; },
      getActiveScenario: global.collectionGetActiveScenario,
      ensureScenarioConnections: global.collectionEnsureScenarioConnections,
      findItemIndexByNodeId: global.collectionFindItemIndexByNodeId,
      buildCanvasGroupKey: global.collectionBuildCanvasGroupKey,
      inputMappingConfig: global.collectionInputMappingConfig,
      outputDisplayName: global.collectionOutputDisplayName,
      inputDisplayName: global.collectionInputDisplayName,
      ensureItemLayout: global.collectionEnsureItemLayout,
      ensureItemNodeId: global.collectionEnsureItemNodeId,
      inferOperationKind: global.collectionInferOperationKind,
      escapeHtml: global.collectionEscapeHtml,
      getSelectedItemIndex: global.collectionGetSelectedItemIndex,
      renderServiceCatalog: global.collectionRenderServiceCatalog,
      renderInspector: global.collectionRenderInspector,
      pathSupported: global.collectionPathSupported,
      getConnectionDragState: function() { return collectionConnectionDragState; }
    });
    return collectionCanvasManager;
  };

  global.collectionGetCanvasInteractionManager = function collectionGetCanvasInteractionManager() {
    if (collectionCanvasInteractionManager) return collectionCanvasInteractionManager;

    collectionCanvasInteractionManager = new window.BTCollectionModules.CollectionCanvasInteractionManager({
      getActiveScenario: global.collectionGetActiveScenario,
      getSelectedItem: global.collectionGetSelectedItem,
      setSelectedItem: global.collectionSetSelectedItem,
      openInspector: function() { global.collectionGetBuilderShellManager().openInspector(); },
      getCanvasDragState: function() { return collectionCanvasDragState; },
      setCanvasDragState: function(value) { collectionCanvasDragState = value; },
      getConnectionDragState: function() { return collectionConnectionDragState; },
      setConnectionDragState: function(value) { collectionConnectionDragState = value; },
      boundHandleCanvasDragMove: global.collectionHandleCanvasDragMove,
      boundHandleCanvasDragEnd: global.collectionHandleCanvasDragEnd,
      boundHandleConnectionDragMove: global.collectionHandleConnectionDragMove,
      boundHandleConnectionDragEnd: global.collectionHandleConnectionDragEnd,
      renderCanvasConnections: global.collectionRenderCanvasConnections,
      renderVariableEditor: global.collectionRenderVariableEditor,
      renderInspector: global.collectionRenderInspector,
      renderScenarios: global.collectionRenderScenarios,
      renderItems: global.collectionRenderItems,
      loadPreview: global.collectionLoadPreview,
      resetExecution: global.collectionResetExecution,
      showStatus: global.collectionShowStatus,
      ensureItemLayout: global.collectionEnsureItemLayout,
      ensureItemNodeId: global.collectionEnsureItemNodeId,
      ensureScenarioConnections: global.collectionEnsureScenarioConnections,
      findItemIndexByNodeId: global.collectionFindItemIndexByNodeId,
      rebuildItemsFromConnections: global.collectionRebuildItemsFromConnections,
      buildOrthogonalCanvasPath: global.collectionBuildOrthogonalCanvasPath,
      insertOperation: global.collectionInsertOperation
    });

    return collectionCanvasInteractionManager;
  };

  global.collectionGetInspectorManager = function collectionGetInspectorManager() {
    if (collectionInspectorManager) return collectionInspectorManager;
    collectionInspectorManager = new window.BTCollectionModules.CollectionInspectorManager({
      getActiveScenario: global.collectionGetActiveScenario,
      getSelectedItem: global.collectionGetSelectedItem,
      getSelectedItemIndex: global.collectionGetSelectedItemIndex,
      buildSelectedItemExecutionUrl: global.collectionBuildSelectedItemExecutionUrl,
      selectedItemInputValue: global.collectionSelectedItemInputValue,
      inputMappingConfig: global.collectionInputMappingConfig,
      findSourceOption: global.collectionFindSourceOption,
      inputDisplayName: global.collectionInputDisplayName,
      inputMetaLabel: global.collectionInputMetaLabel,
      outputDisplayName: global.collectionOutputDisplayName,
      escapeHtml: global.collectionEscapeHtml,
      domId: global.collectionDomId,
      captureInspectorState: global.collectionCaptureInspectorState,
      restoreInspectorState: global.collectionRestoreInspectorState
    });
    return collectionInspectorManager;
  };

  /**
   * Callback de resize del bootstrap: recalcula las flechas del "Flow
   * Designer" viejo. Hoy es un no-op permanente (#collection-flow-stage y
   * #collection-flow-svg ya no los genera nada — ese diseño de tarjetas con
   * puertos quedo reemplazado por el Canvas), pero se mantiene porque
   * collectionGetBootstrapManager() todavia lo pasa como dependencia fija.
   */
  global.collectionRenderFlowConnections = function collectionRenderFlowConnections() {
    var stage = document.getElementById('collection-flow-stage');
    var svg = document.getElementById('collection-flow-svg');
    var scenario = global.collectionGetActiveScenario();
    if (!stage || !svg || !scenario) return;
    svg.setAttribute('width', String(stage.scrollWidth || stage.clientWidth || 0));
    svg.setAttribute('height', String(stage.scrollHeight || stage.clientHeight || 0));
    svg.setAttribute('viewBox', '0 0 ' + String(stage.scrollWidth || stage.clientWidth || 0) + ' ' + String(stage.scrollHeight || stage.clientHeight || 0));
    var rows = [];
    (scenario.previewVariables || []).forEach(function(input) {
      if (!input.mappingKey) return;
      var sourceVarKey = global.collectionInputMappingValue(input.mappingKey);
      if (!sourceVarKey) return;
      var sourceEl = document.getElementById(global.collectionFlowId('flow_out', sourceVarKey));
      var targetEl = document.getElementById(global.collectionFlowId('flow_in', input.mappingKey));
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
      var suggested = global.collectionSuggestMappingForInput(input, input.sourceOptions || []);
      var manualClass = suggested && suggested === sourceVarKey ? ' collection-flow-link-auto' : ' collection-flow-link-manual';
      rows.push(
        '<path class="collection-flow-link' + manualClass + '" d="M ' + x1 + ' ' + y1 + ' C ' + (x1 + delta) + ' ' + y1 + ', ' + (x2 - delta) + ' ' + y2 + ', ' + x2 + ' ' + y2 + '"></path>' +
        '<rect class="collection-flow-link-label-bg" x="' + (midX - 56) + '" y="' + (midY - 11) + '" rx="8" ry="8" width="112" height="22"></rect>' +
        '<text class="collection-flow-link-label" x="' + midX + '" y="' + (midY + 4) + '" text-anchor="middle">' + global.collectionEscapeHtml(global.collectionOutputDisplayName(option || { sourceVarKey: sourceVarKey })) + ' → ' + global.collectionEscapeHtml(input.key) + '</text>'
      );
    });
    svg.innerHTML = rows.join('');
  };

  /**
   * Pide el HTML del panel al backend, lo monta y deja el builder listo para
   * usarse. Es el disparador real de arranque de todo el feature — por eso
   * tiene que ser lo ultimo que corre, una vez que cada modulo *-adapter.js
   * ya asigno sus funciones en window.
   */
  global.collectionMountPanel = async function collectionMountPanel() {
    return global.collectionGetBootstrapManager().mountPanel();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', global.collectionMountPanel);
  } else {
    global.collectionMountPanel();
  }
})(window);
