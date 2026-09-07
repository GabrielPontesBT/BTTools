(function bootstrapCollectionCanvasInteractionAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: funciones globales de drag & drop, conexiones
   * y seleccion de nodos del canvas, invocadas por nombre desde el HTML del
   * panel. Ver la nota de arquitectura en shared/collection-utils-adapter.js.
   */

  global.collectionCanvasNodeClick = function collectionCanvasNodeClickAdapter(index) {
    // La seleccion de nodos vive ahora en el modulo especializado del canvas.
    global.collectionGetCanvasInteractionManager().canvasNodeClick(index);
  };

  global.collectionUpdateDraggedNode = function collectionUpdateDraggedNodeAdapter() {
    // Este adapter mantiene el nombre global mientras el manager nuevo redibuja el nodo.
    global.collectionGetCanvasInteractionManager().updateDraggedNode();
  };

  global.collectionHandleCanvasDragMove = function collectionHandleCanvasDragMoveAdapter(event) {
    // Encaminamos el movimiento del mouse al modulo que conoce el drag del canvas.
    global.collectionGetCanvasInteractionManager().handleCanvasDragMove(event);
  };

  global.collectionHandleCanvasDragEnd = function collectionHandleCanvasDragEndAdapter() {
    // Cerramos el drag del nodo desde el manager para refrescar dependencias visuales.
    global.collectionGetCanvasInteractionManager().handleCanvasDragEnd();
  };

  global.collectionBuildTemporaryConnectionPath = function collectionBuildTemporaryConnectionPathAdapter(anchorX, anchorY, pointerX, pointerY, dragEnd) {
    // La geometria temporal de la flecha se calcula en el modulo de interaccion.
    return global.collectionGetCanvasInteractionManager().buildTemporaryConnectionPath(anchorX, anchorY, pointerX, pointerY, dragEnd);
  };

  global.collectionHandleConnectionDragMove = function collectionHandleConnectionDragMoveAdapter(event) {
    // Redirigimos el drag de puntas de flecha al manager de interacciones.
    global.collectionGetCanvasInteractionManager().handleConnectionDragMove(event);
  };

  global.collectionHandleConnectionDragEnd = function collectionHandleConnectionDragEndAdapter(event) {
    // La reconexion final de flechas queda encapsulada en el modulo del canvas.
    global.collectionGetCanvasInteractionManager().handleConnectionDragEnd(event);
  };

  global.collectionStartConnectionDrag = function collectionStartConnectionDragAdapter(fromId, toId, dragEnd, event) {
    // Permite volver a editar una flecha existente sin acoplar el bootstrap al detalle del canvas.
    global.collectionGetCanvasInteractionManager().startConnectionDrag(fromId, toId, dragEnd, event);
  };

  global.collectionStartNewConnectionDrag = function collectionStartNewConnectionDragAdapter(nodeId, event) {
    // Inicia una flecha nueva desde un nodo concreto del flujo.
    global.collectionGetCanvasInteractionManager().startNewConnectionDrag(nodeId, event);
  };

  global.collectionStartNodeDrag = function collectionStartNodeDragAdapter(index, event) {
    // Encaminamos el drag de tarjetas del flujo al manager que conoce offsets y limites.
    global.collectionGetCanvasInteractionManager().startNodeDrag(index, event);
  };

  global.collectionConnectNodes = function collectionConnectNodesAdapter(fromId, toId) {
    // La creacion de conexiones y el reordenamiento asociado viven en el manager de canvas.
    global.collectionGetCanvasInteractionManager().connectNodes(fromId, toId);
  };

  global.collectionRemoveConnection = function collectionRemoveConnectionAdapter(fromId, toId) {
    // Eliminamos la flecha desde el modulo de interaccion para mantener consistente el flujo.
    global.collectionGetCanvasInteractionManager().removeConnection(fromId, toId);
  };

  global.collectionAllowCanvasDrop = function collectionAllowCanvasDropAdapter(event) {
    // El canvas acepta drops a traves del modulo especializado.
    global.collectionGetCanvasInteractionManager().allowCanvasDrop(event);
  };

  global.collectionCanvasDragEnter = function collectionCanvasDragEnterAdapter(event) {
    global.collectionGetCanvasInteractionManager().dragEnterCanvas(event);
  };

  global.collectionCanvasDragLeave = function collectionCanvasDragLeaveAdapter(event) {
    global.collectionGetCanvasInteractionManager().dragLeaveCanvas(event);
  };

  global.collectionDropOperation = function collectionDropOperationAdapter(insertIndex, event) {
    // El alta de un servicio soltado en el lienzo se centraliza en la capa de interaccion.
    global.collectionGetCanvasInteractionManager().dropOperation(insertIndex, event);
  };

  global.collectionDragOperation = function collectionDragOperationAdapter(service, operationKey, event) {
    // Serializamos el payload de drag desde el modulo nuevo para evitar logica duplicada.
    global.collectionGetCanvasInteractionManager().dragOperation(service, operationKey, event);
  };
})(window);
