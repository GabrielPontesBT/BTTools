(function bootstrapCollectionCanvasAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: funciones globales que redibujan el canvas
   * del flujo y, en consecuencia, el inspector/editor de variables asociado
   * (siempre se refrescan juntos). Invocadas por nombre desde el HTML del
   * panel. Ver la nota de arquitectura en shared/collection-utils-adapter.js.
   */

  /**
   * Clasifica un metodo como "consulta" o "ejecucion" segun su nombre, para
   * el badge visual del canvas (ver CollectionCanvasManager).
   */
  global.collectionInferOperationKind = function collectionInferOperationKind(method) {
    var name = String(method || '').toLowerCase();
    return name.indexOf('get') === 0 || name.indexOf('view') === 0 || name.indexOf('list') === 0 ? 'query' : 'action';
  };

  /**
   * El editor de variables "clasico" (tarjetas de flujo con puertos) quedo
   * reemplazado por el Canvas + Inspector actual: esta funcion ya solo
   * esconde esos contenedores viejos (collection-flow-wrap/collection-vars-wrap,
   * que panel.html deja vacios) y delega el refresco real al inspector.
   */
  global.collectionRenderVariableEditor = function collectionRenderVariableEditor() {
    var flowWrap = document.getElementById('collection-flow-wrap');
    var wrap = document.getElementById('collection-vars-wrap');
    var container = document.getElementById('collection-vars');
    if (!wrap || !container) return;
    var scenario = global.collectionGetActiveScenario();

    if (!scenario || !scenario.items.length) {
      if (flowWrap) flowWrap.style.display = 'none';
      wrap.style.display = 'none';
      container.innerHTML = '';
      global.collectionRenderInspector();
      return;
    }
    if (flowWrap) flowWrap.style.display = 'none';
    wrap.style.display = 'none';
    container.innerHTML = '';
    global.collectionRenderInspector();
  };

  /**
   * Guarda foco/scroll/seleccion de texto del inspector antes de reescribir
   * su HTML, para que restoreInspectorState los pueda reponer despues y el
   * usuario no pierda el cursor a mitad de escribir en cada re-render.
   */
  global.collectionCaptureInspectorState = function collectionCaptureInspectorState(container) {
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
  };

  global.collectionRestoreInspectorState = function collectionRestoreInspectorState(container, state) {
    if (!container || !state) return;
    container.scrollTop = state.scrollTop || 0;
    if (!state.fieldKey) return;
    var selector = '[data-inspector-key="' + global.collectionEscapeHtml(state.fieldKey) + '"]';
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
  };

  global.collectionZoomInCanvas = function collectionZoomInCanvasAdapter() {
    global.collectionGetCanvasManager().zoomIn();
  };

  global.collectionZoomOutCanvas = function collectionZoomOutCanvasAdapter() {
    global.collectionGetCanvasManager().zoomOut();
  };

  global.collectionToggleCanvasCompact = function collectionToggleCanvasCompactAdapter() {
    global.collectionGetCanvasManager().toggleCompactNodes();
  };

  global.collectionBuildCanvasLinkText = function collectionBuildCanvasLinkTextAdapter(sourceItem, sourceIndex, targetItem, targetIndex, scenario) {
    return global.collectionGetCanvasManager().buildCanvasLinkText(sourceItem, sourceIndex, targetItem, targetIndex, scenario);
  };

  global.collectionBuildOrthogonalCanvasPath = function collectionBuildOrthogonalCanvasPathAdapter(sourceElement, targetElement) {
    return global.collectionGetCanvasManager().buildOrthogonalCanvasPath(sourceElement, targetElement);
  };

  global.collectionRenderCanvasConnections = function collectionRenderCanvasConnectionsAdapter() {
    global.collectionGetCanvasManager().renderCanvasConnections();
  };

  global.collectionRenderInspector = function collectionRenderInspectorAdapter() {
    global.collectionGetInspectorManager().renderInspector();
  };

  global.collectionRenderItems = function collectionRenderItemsAdapter() {
    global.collectionGetCanvasManager().renderItems();
  };
})(window);
