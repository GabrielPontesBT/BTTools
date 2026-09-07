(function bootstrapCollectionFlowLifecycleAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: funciones globales del ciclo de vida del
   * flujo (paso/escenario activo, conexiones, alta/baja de pasos) invocadas
   * por nombre desde el HTML del panel. Ver la nota de arquitectura en
   * shared/collection-utils-adapter.js.
   */

  global.collectionUpdateName = function collectionUpdateNameAdapter(value) {
    // El nombre exportado de la collection pasa por el lifecycle manager del flujo.
    global.collectionGetFlowLifecycleManager().updateCollectionName(value);
  };

  global.collectionRenameActiveScenario = function collectionRenameActiveScenarioAdapter(value) {
    // Renombrar el caso activo ahora queda encapsulado fuera del coordinador principal.
    global.collectionGetFlowLifecycleManager().renameActiveScenario(value);
  };

  global.collectionGetSelectedItemIndex = function collectionGetSelectedItemIndexAdapter() {
    // La seleccion valida del paso activo se resuelve desde el manager de ciclo de vida.
    return global.collectionGetFlowLifecycleManager().getSelectedItemIndex();
  };

  global.collectionGetSelectedItem = function collectionGetSelectedItemAdapter() {
    // El paso activo ya no se calcula manualmente en el bootstrap.
    return global.collectionGetFlowLifecycleManager().getSelectedItem();
  };

  global.collectionSetSelectedItem = function collectionSetSelectedItemAdapter(index) {
    // Centralizamos el cambio de paso activo para refrescar siempre las mismas vistas.
    global.collectionGetFlowLifecycleManager().setSelectedItem(index);
  };

  global.collectionSetActiveScenario = function collectionSetActiveScenarioAdapter(id) {
    // El cambio de escenario activo ahora sigue un ciclo de refresco consistente.
    global.collectionGetFlowLifecycleManager().setActiveScenario(id);
  };

  global.collectionBuildCanvasGroupKey = function collectionBuildCanvasGroupKeyAdapter(item, index) {
    // La clave grupal del canvas se mantiene en el manager del flujo.
    return global.collectionGetFlowLifecycleManager().buildCanvasGroupKey(item, index);
  };

  global.collectionFindItemIndexByNodeId = function collectionFindItemIndexByNodeIdAdapter(scenario, nodeId) {
    // Resolver nodos a indices queda centralizado para canvas y conexiones.
    return global.collectionGetFlowLifecycleManager().findItemIndexByNodeId(scenario, nodeId);
  };

  global.collectionFindOutgoingConnection = function collectionFindOutgoingConnectionAdapter(scenario, fromId) {
    // La busqueda de conexiones salientes se concentra en el lifecycle manager.
    return global.collectionGetFlowLifecycleManager().findOutgoingConnection(scenario, fromId);
  };

  global.collectionFindIncomingConnection = function collectionFindIncomingConnectionAdapter(scenario, toId) {
    // La busqueda de conexiones entrantes se concentra en el lifecycle manager.
    return global.collectionGetFlowLifecycleManager().findIncomingConnection(scenario, toId);
  };

  global.collectionRebuildItemsFromConnections = function collectionRebuildItemsFromConnectionsAdapter(scenario, selectedItem) {
    // El reordenamiento del flujo segun flechas ya no vive directamente en collections.js.
    return global.collectionGetFlowLifecycleManager().rebuildItemsFromConnections(scenario, selectedItem);
  };

  global.collectionGetConnectedSourceId = function collectionGetConnectedSourceIdAdapter(scenario, item) {
    // Obtener el origen conectado de un paso se delega al manager del flujo.
    return global.collectionGetFlowLifecycleManager().getConnectedSourceId(scenario, item);
  };

  global.collectionInputAliasValue = function collectionInputAliasValueAdapter(mappingKey) {
    // Los aliases funcionales de inputs quedan gobernados por el lifecycle manager.
    return global.collectionGetFlowLifecycleManager().inputAliasValue(mappingKey);
  };

  global.collectionUpdateInputAlias = function collectionUpdateInputAliasAdapter(mappingKey, value) {
    // Actualizar aliases funcionales ahora dispara preview desde el manager del flujo.
    global.collectionGetFlowLifecycleManager().updateInputAlias(mappingKey, value);
  };

  global.collectionInputDisplayName = function collectionInputDisplayNameAdapter(input) {
    // El label visible del input se calcula en el manager que conoce aliases.
    return global.collectionGetFlowLifecycleManager().inputDisplayName(input);
  };

  global.collectionInputMetaLabel = function collectionInputMetaLabelAdapter(input) {
    return global.collectionGetFlowLifecycleManager().inputMetaLabel(input);
  };

  global.collectionSetPendingConnection = function collectionSetPendingConnectionAdapter(nodeId) {
    // El nodo origen pendiente de una flecha se mantiene fuera del bootstrap.
    global.collectionGetFlowLifecycleManager().setPendingConnection(nodeId);
  };

  global.collectionInsertOperation = async function collectionInsertOperationAdapter(service, operationKey, insertIndex) {
    // El alta de pasos en el flujo queda centralizada en el lifecycle manager.
    return global.collectionGetFlowLifecycleManager().insertOperation(service, operationKey, insertIndex);
  };

  global.collectionClearItemState = function collectionClearItemStateAdapter(scenario, item) {
    // Limpiar mappings y conexiones de un paso queda encapsulado en el manager del flujo.
    global.collectionGetFlowLifecycleManager().clearItemState(scenario, item);
  };

  global.collectionRemoveItem = function collectionRemoveItemAdapter(index) {
    // La baja de pasos ahora usa un ciclo unico de limpieza y refresco.
    global.collectionGetFlowLifecycleManager().removeItem(index);
  };
})(window);
