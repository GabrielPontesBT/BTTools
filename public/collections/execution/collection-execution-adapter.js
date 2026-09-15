(function bootstrapCollectionExecutionAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: funciones globales de la consola de
   * ejecucion (abrir/cerrar/minimizar, tabs, timeline, zoom, rerun),
   * invocadas por nombre desde el HTML del panel. Ver la nota de
   * arquitectura en shared/collection-utils-adapter.js.
   */

  global.collectionResetExecution = function collectionResetExecutionAdapter() {
    global.collectionGetExecutionCenter().reset();
  };

  global.collectionHandleExecutionBackdrop = function collectionHandleExecutionBackdropAdapter(event) {
    global.collectionGetExecutionCenter().handleBackdrop(event);
  };

  global.collectionCloseExecutionConsole = function collectionCloseExecutionConsoleAdapter() {
    global.collectionGetExecutionCenter().close();
  };

  global.collectionMinimizeExecutionConsole = function collectionMinimizeExecutionConsoleAdapter() {
    global.collectionGetExecutionCenter().minimize();
  };

  global.collectionRestoreExecutionConsole = function collectionRestoreExecutionConsoleAdapter() {
    global.collectionGetExecutionCenter().restore();
  };

  global.collectionSetExecutionHtml = function collectionSetExecutionHtmlAdapter(html, data) {
    global.collectionGetExecutionCenter().setHtml(html, data, { showModal: false });
  };

  global.collectionBuildExecutionPopupShell = function collectionBuildExecutionPopupShellAdapter(content) {
    return global.collectionGetExecutionCenter().buildPopupShell(content);
  };

  global.collectionOpenExecutionConsole = function collectionOpenExecutionConsoleAdapter() {
    global.collectionGetExecutionCenter().open();
  };

  global.collectionRenderExecutionLoading = function collectionRenderExecutionLoadingAdapter() {
    global.collectionGetExecutionCenter().renderLoading();
  };

  global.collectionRenderExecutionResult = function collectionRenderExecutionResultAdapter(data) {
    global.collectionGetExecutionCenter().renderResult(data);
  };

  global.collectionCloseExecutionMode = function collectionCloseExecutionModeAdapter() {
    global.collectionGetExecutionCenter().close();
  };

  /**
   * Le permite a goBack() (wizard-doc.js) saber si el "Volver" generico del
   * wizard tiene que cerrar el modo ejecucion en vez de navegar de paso --
   * ver la nota en goBack() sobre por que los dos viven en el mismo paso del
   * wizard ('p4c'). Lee el estado real en vez de inspeccionar el DOM
   * (`.collection-execution-active`) porque wizard-doc.js no tiene por que
   * conocer esa clase, y porque un querySelector generico es fragil de
   * testear (un stub de test que siempre devuelve un elemento truthy no
   * distingue selectores).
   */
  global.collectionIsExecutionModeActive = function collectionIsExecutionModeActiveAdapter() {
    var center = global.collectionGetExecutionCenter();
    return !!(center && center.executionState && center.executionState.active);
  };

  global.collectionSelectExecutionStep = function collectionSelectExecutionStepAdapter(stepId) {
    global.collectionGetExecutionCenter().selectStep(stepId);
  };

  global.collectionSetExecutionTab = function collectionSetExecutionTabAdapter(tabKey) {
    global.collectionGetExecutionCenter().setTab(tabKey);
  };

  global.collectionRerunExecutionFlow = async function collectionRerunExecutionFlowAdapter() {
    return global.collectionGetExecutionCenter().rerunFlow();
  };

  global.collectionRerunExecutionFromSelectedStep = async function collectionRerunExecutionFromSelectedStepAdapter() {
    return global.collectionGetExecutionCenter().rerunFromSelectedStep();
  };

  global.collectionExportExecutionRun = function collectionExportExecutionRunAdapter() {
    global.collectionGetExecutionCenter().exportRun();
  };

  global.collectionHandleExecutionNodeAction = async function collectionHandleExecutionNodeActionAdapter(actionKey, stepId) {
    return global.collectionGetExecutionCenter().handleNodeAction(actionKey, stepId);
  };

  global.collectionZoomInExecutionFlow = function collectionZoomInExecutionFlowAdapter() {
    global.collectionGetExecutionCenter().zoomIn();
  };

  global.collectionZoomOutExecutionFlow = function collectionZoomOutExecutionFlowAdapter() {
    global.collectionGetExecutionCenter().zoomOut();
  };

  global.collectionToggleExecutionTimeline = function collectionToggleExecutionTimelineAdapter() {
    global.collectionGetExecutionCenter().toggleTimelineOpen();
  };

  global.collectionCloseExecutionTimeline = function collectionCloseExecutionTimelineAdapter() {
    global.collectionGetExecutionCenter().closeTimelineOpen();
  };

  global.collectionToggleExecutionFlowExpanded = function collectionToggleExecutionFlowExpandedAdapter() {
    global.collectionGetExecutionCenter().toggleFlowExpanded();
  };

  global.collectionStartExecPanelResize = function collectionStartExecPanelResizeAdapter(event) {
    global.collectionGetExecutionCenter().startPanelResize(event);
  };

  global.collectionCancelExecutionRun = function collectionCancelExecutionRunAdapter() {
    global.collectionGetExecutionCenter().cancelExecution();
  };

  /**
   * Unica funcion de este archivo con logica propia (no delegacion): copia
   * al portapapeles el codigo fuente mostrado en el panel de ejecucion.
   */
  global.collectionCopyExecutionCodeSource = function collectionCopyExecutionCodeSourceAdapter(buttonEl) {
    var wrap = buttonEl && buttonEl.parentElement;
    var source = wrap ? wrap.querySelector('.collection-exec-code-source') : null;
    if (!source || !navigator.clipboard) return;

    navigator.clipboard.writeText(source.value).then(function showCopied() {
      var originalLabel = buttonEl.textContent;
      buttonEl.textContent = 'Copiado';
      setTimeout(function restoreLabel() { buttonEl.textContent = originalLabel; }, 1500);
    }).catch(function ignoreCopyError() {});
  };

  global.collectionExecuteFlow = async function collectionExecuteFlowAdapter() {
    return global.collectionGetExecutionCenter().executeFlow();
  };
})(window);
