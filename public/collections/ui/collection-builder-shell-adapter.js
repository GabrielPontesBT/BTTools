(function bootstrapCollectionBuilderShellAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: funciones globales de los drawers del
   * builder (servicio, inspector), seleccion de catalogo y tabs del
   * inspector, invocadas por nombre desde el HTML del panel. Ver la nota de
   * arquitectura en shared/collection-utils-adapter.js.
   */

  global.collectionOpenServiceDrawer = function collectionOpenServiceDrawerAdapter() {
    global.collectionGetChainSuggestionManager().close();
    global.collectionGetBuilderShellManager().openServiceDrawer();
  };

  global.collectionOpenServiceDrawerForNextStep = function collectionOpenServiceDrawerForNextStepAdapter() {
    global.collectionGetBuilderShellManager().openServiceDrawerForNextStep();
  };

  global.collectionCloseServiceDrawer = function collectionCloseServiceDrawerAdapter() {
    global.collectionGetBuilderShellManager().closeServiceDrawer();
  };

  global.collectionCloseInspectorDrawer = function collectionCloseInspectorDrawerAdapter() {
    global.collectionGetBuilderShellManager().closeInspector();
  };

  global.collectionHandleBuilderBackdropClick = function collectionHandleBuilderBackdropClickAdapter() {
    global.collectionGetBuilderShellManager().handleBackdropClick();
    global.collectionGetChainSuggestionManager().close();
  };

  global.collectionToggleCatalogSelection = function collectionToggleCatalogSelectionAdapter(service, operationKey, checked) {
    global.collectionGetBuilderShellManager().toggleCatalogSelection(service, operationKey, checked);
  };

  global.collectionInsertCatalogOperation = async function collectionInsertCatalogOperationAdapter(service, operationKey) {
    return global.collectionGetBuilderShellManager().insertCatalogOperation(service, operationKey);
  };

  global.collectionAddSelectedCatalogOperations = async function collectionAddSelectedCatalogOperationsAdapter() {
    return global.collectionGetBuilderShellManager().addSelectedOperations();
  };

  global.collectionSyncBuilderShellState = function collectionSyncBuilderShellStateAdapter() {
    global.collectionGetBuilderShellManager().syncShellState();
  };

  global.collectionToggleServiceGroup = function collectionToggleServiceGroupAdapter(service) {
    global.collectionGetBuilderShellManager().toggleServiceGroup(service);
  };

  global.collectionSetInspectorTab = function collectionSetInspectorTabAdapter(tab) {
    global.collectionGetBuilderShellManager().setInspectorTab(tab);
  };

  global.collectionToggleInspectorInput = function collectionToggleInspectorInputAdapter(mappingKey) {
    global.collectionGetBuilderShellManager().toggleInspectorInput(mappingKey);
  };

  global.collectionToggleInspectorInputGroup = function collectionToggleInspectorInputGroupAdapter(groupKey) {
    // Grupo visual de entradas (campos de un mismo SDT/coleccion) — ver
    // renderInputsTab en collection-inspector-manager.js.
    global.collectionGetBuilderShellManager().toggleInspectorInputGroup(groupKey);
  };

  global.collectionToggleInspectorOutput = function collectionToggleInspectorOutputAdapter(sourceVarKey) {
    global.collectionGetBuilderShellManager().toggleInspectorOutput(sourceVarKey);
  };

  global.collectionSetOutputSearchTerm = function collectionSetOutputSearchTermAdapter(scopeKey, value) {
    global.collectionGetBuilderShellManager().setOutputSearchTerm(scopeKey, value);
  };

  global.collectionToggleSourcePicker = function collectionToggleSourcePickerAdapter(mappingKey) {
    global.collectionGetBuilderShellManager().toggleSourcePicker(mappingKey);
  };

  global.collectionToggleSourceGroup = function collectionToggleSourceGroupAdapter(mappingKey, groupLabel) {
    global.collectionGetBuilderShellManager().toggleSourceGroup(mappingKey, groupLabel);
  };

  global.collectionSelectInputSource = function collectionSelectInputSourceAdapter(mappingKey, value) {
    global.collectionGetBuilderShellManager().closeSourcePicker();
    global.collectionUpdateInputMapping(mappingKey, value);
  };

  global.collectionClearCatalogSelection = function collectionClearCatalogSelectionAdapter() {
    global.collectionGetBuilderShellManager().clearCatalogSelection();
    global.collectionGetServiceCatalogManager().renderServiceCatalog();
  };
})(window);
