(function bootstrapCollectionCanvasInteractionManager(global) {
  'use strict';

  /**
   * Maneja las interacciones del canvas: drag de nodos y edición de conexiones.
   * Mantiene aislada la parte más imperativa y sensible de la UI.
   */
  class CollectionCanvasInteractionManager {
    /**
     * Recibe accesos al estado y a las operaciones de negocio del flujo.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Selecciona un nodo del canvas al hacer clic sobre él.
     */
    canvasNodeClick(index) {
      var scenario = this.options.getActiveScenario();
      if (!scenario || !scenario.items[index]) return;
      this.options.setSelectedItem(index);
      if (this.options.openInspector) this.options.openInspector();
    }

    /**
     * Redibuja la posición visible del nodo que se está arrastrando.
     */
    updateDraggedNode() {
      var dragState = this.options.getCanvasDragState();
      if (!dragState) return;

      var item = dragState.item;
      var index = dragState.index;
      var node = document.getElementById('collection-canvas-step-' + index);
      if (!item || !node || !item.layout) return;

      node.style.left = item.layout.x + 'px';
      node.style.top = item.layout.y + 'px';
      this.options.renderCanvasConnections();
    }

    /**
     * Calcula la nueva posición del nodo mientras el mouse se mueve.
     */
    handleCanvasDragMove(event) {
      var dragState = this.options.getCanvasDragState();
      if (!dragState) return;

      var surface = document.getElementById('collection-canvas-surface');
      if (!surface) return;

      var rect = surface.getBoundingClientRect();
      var nodeWidth = dragState.nodeWidth || 360;
      var nodeHeight = dragState.nodeHeight || 118;
      var nextX = event.clientX - rect.left - dragState.offsetX;
      var nextY = event.clientY - rect.top - dragState.offsetY;
      var maxX = Math.max(0, surface.offsetWidth - nodeWidth - 8);
      var maxY = Math.max(0, surface.offsetHeight - nodeHeight - 8);

      dragState.item.layout.x = Math.max(8, Math.min(maxX, nextX));
      dragState.item.layout.y = Math.max(8, Math.min(maxY, nextY));

      this.updateDraggedNode();
    }

    /**
     * Finaliza el drag de un nodo y refresca los paneles dependientes.
     */
    handleCanvasDragEnd() {
      if (!this.options.getCanvasDragState()) return;

      this.options.setCanvasDragState(null);
      document.removeEventListener('mousemove', this.options.boundHandleCanvasDragMove);
      document.removeEventListener('mouseup', this.options.boundHandleCanvasDragEnd);

      this.options.renderCanvasConnections();
      this.options.renderVariableEditor();
      this.options.resetExecution();
    }

    /**
     * Genera la ruta temporal que se muestra mientras el usuario arrastra una conexión.
     */
    buildTemporaryConnectionPath(anchorX, anchorY, pointerX, pointerY, dragEnd) {
      var horizontalBias = Math.abs(pointerX - anchorX) > Math.abs(pointerY - anchorY);

      if (horizontalBias) {
        var midX = anchorX + ((pointerX - anchorX) / 2);
        if (dragEnd === 'from') {
          return 'M ' + pointerX + ' ' + pointerY + ' L ' + midX + ' ' + pointerY + ' L ' + midX + ' ' + anchorY + ' L ' + anchorX + ' ' + anchorY;
        }
        return 'M ' + anchorX + ' ' + anchorY + ' L ' + midX + ' ' + anchorY + ' L ' + midX + ' ' + pointerY + ' L ' + pointerX + ' ' + pointerY;
      }

      var midY = anchorY + ((pointerY - anchorY) / 2);
      if (dragEnd === 'from') {
        return 'M ' + pointerX + ' ' + pointerY + ' L ' + pointerX + ' ' + midY + ' L ' + anchorX + ' ' + midY + ' L ' + anchorX + ' ' + anchorY;
      }
      return 'M ' + anchorX + ' ' + anchorY + ' L ' + anchorX + ' ' + midY + ' L ' + pointerX + ' ' + midY + ' L ' + pointerX + ' ' + pointerY;
    }

    /**
     * Actualiza la línea temporal de una conexión mientras se arrastra.
     */
    handleConnectionDragMove(event) {
      var dragState = this.options.getConnectionDragState();
      if (!dragState) return;

      var surface = document.getElementById('collection-canvas-surface');
      if (!surface) return;

      var rect = surface.getBoundingClientRect();
      var pointerX = event.clientX - rect.left;
      var pointerY = event.clientY - rect.top;

      dragState.tempPath = this.buildTemporaryConnectionPath(
        dragState.anchorX,
        dragState.anchorY,
        pointerX,
        pointerY,
        dragState.dragEnd
      );

      this.options.renderCanvasConnections();
    }

    /**
     * Finaliza el drag de una conexión y, si cayó sobre otro nodo, crea el enlace.
     */
    handleConnectionDragEnd(event) {
      var drag = this.options.getConnectionDragState();
      if (!drag) return;

      var scenario = this.options.getActiveScenario();
      this.options.setConnectionDragState(null);
      document.removeEventListener('mousemove', this.options.boundHandleConnectionDragMove);
      document.removeEventListener('mouseup', this.options.boundHandleConnectionDragEnd);

      var nodeElement = null;
      if (event && document.elementsFromPoint) {
        var stack = document.elementsFromPoint(event.clientX, event.clientY) || [];
        for (var i = 0; i < stack.length; i++) {
          if (stack[i] && stack[i].closest) {
            var candidate = stack[i].closest('.collection-canvas-step');
            if (candidate) {
              nodeElement = candidate;
              break;
            }
          }
        }
      } else {
        var targetElement = event && document.elementFromPoint ? document.elementFromPoint(event.clientX, event.clientY) : null;
        nodeElement = targetElement && targetElement.closest ? targetElement.closest('.collection-canvas-step') : null;
      }

      if (scenario && nodeElement && nodeElement.id) {
        var indexText = nodeElement.id.replace('collection-canvas-step-', '');
        var nodeIndex = parseInt(indexText, 10);
        if (!isNaN(nodeIndex) && scenario.items[nodeIndex]) {
          var targetNodeId = this.options.ensureItemNodeId(scenario.items[nodeIndex]);
          if (drag.dragEnd === 'from') this.connectNodes(targetNodeId, drag.fixedNodeId);
          else this.connectNodes(drag.fixedNodeId, targetNodeId);
          return;
        }
      }

      this.options.renderCanvasConnections();
    }

    /**
     * Inicia el drag desde uno de los extremos de una conexión ya existente.
     */
    startConnectionDrag(fromId, toId, dragEnd, event) {
      if (!event) return;

      var scenario = this.options.getActiveScenario();
      if (!scenario) return;

      var fromIndex = this.options.findItemIndexByNodeId(scenario, fromId);
      var toIndex = this.options.findItemIndexByNodeId(scenario, toId);
      if (fromIndex < 0 || toIndex < 0) return;

      var fromElement = document.getElementById('collection-canvas-step-' + fromIndex);
      var toElement = document.getElementById('collection-canvas-step-' + toIndex);
      if (!fromElement || !toElement) return;

      var route = this.options.buildOrthogonalCanvasPath(fromElement, toElement);
      this.options.setConnectionDragState({
        fromId: fromId,
        toId: toId,
        dragEnd: dragEnd,
        fixedNodeId: dragEnd === 'from' ? toId : fromId,
        anchorX: dragEnd === 'from' ? route.endX : route.startX,
        anchorY: dragEnd === 'from' ? route.endY : route.startY,
        tempPath: ''
      });

      document.addEventListener('mousemove', this.options.boundHandleConnectionDragMove);
      document.addEventListener('mouseup', this.options.boundHandleConnectionDragEnd);
      event.preventDefault();
      event.stopPropagation();
    }

    /**
     * Inicia una conexión nueva desde un nodo hacia otro.
     */
    startNewConnectionDrag(nodeId, event) {
      if (!event) return;

      var scenario = this.options.getActiveScenario();
      if (!scenario || !nodeId) return;

      var index = this.options.findItemIndexByNodeId(scenario, nodeId);
      if (index < 0) return;

      var node = document.getElementById('collection-canvas-step-' + index);
      if (!node) return;

      this.options.setSelectedItem(index);

      var anchorX = node.offsetLeft + (node.offsetWidth / 2);
      var anchorY = node.offsetTop + node.offsetHeight;

      this.options.setConnectionDragState({
        fromId: nodeId,
        toId: '',
        dragEnd: 'to',
        fixedNodeId: nodeId,
        anchorX: anchorX,
        anchorY: anchorY,
        tempPath: ''
      });

      document.addEventListener('mousemove', this.options.boundHandleConnectionDragMove);
      document.addEventListener('mouseup', this.options.boundHandleConnectionDragEnd);
      event.preventDefault();
      event.stopPropagation();
    }

    /**
     * Inicia el drag de un nodo del canvas.
     */
    startNodeDrag(index, event) {
      if (!event || event.button !== 0) return;
      if (event.target && event.target.closest && (event.target.closest('.svc-rm') || event.target.closest('.collection-canvas-node-handle'))) return;

      var scenario = this.options.getActiveScenario();
      if (!scenario || !scenario.items[index]) return;

      var node = document.getElementById('collection-canvas-step-' + index);
      if (!node) return;

      var item = scenario.items[index];
      this.options.ensureItemLayout(item, index);
      scenario.selectedItemIndex = index;
      if (this.options.openInspector) this.options.openInspector();
      this.options.renderInspector();

      var rect = node.getBoundingClientRect();
      this.options.setCanvasDragState({
        index: index,
        item: item,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        nodeWidth: rect.width,
        nodeHeight: rect.height
      });

      document.addEventListener('mousemove', this.options.boundHandleCanvasDragMove);
      document.addEventListener('mouseup', this.options.boundHandleCanvasDragEnd);
      event.preventDefault();
    }

    /**
     * Agrega o reemplaza una conexión entre dos nodos del flujo.
     */
    connectNodes(fromId, toId) {
      var scenario = this.options.getActiveScenario();
      if (!scenario || !fromId || !toId || fromId === toId) return;

      var sourceIndex = this.options.findItemIndexByNodeId(scenario, fromId);
      var targetIndex = this.options.findItemIndexByNodeId(scenario, toId);
      if (sourceIndex < 0 || targetIndex < 0) return;

      var connections = this.options.ensureScenarioConnections(scenario);
      scenario.connections = connections.filter(function keepCompatibleConnection(connection) {
        if (connection.fromId === fromId) return false;
        if (connection.toId === toId) return false;
        if (connection.fromId === toId && connection.toId === fromId) return false;
        return true;
      });

      scenario.connections.push({ fromId: fromId, toId: toId });
      scenario.connectionsTouched = true;
      scenario.pendingConnectionFromId = '';

      var selectedItem = scenario.items[targetIndex];
      this.options.rebuildItemsFromConnections(scenario, selectedItem);
      this.options.renderScenarios();
      this.options.renderItems();
      this.options.loadPreview();
      this.options.resetExecution();
      this.options.showStatus('ok', 'Flecha creada y mappings sugeridos actualizados.');
    }

    /**
     * Elimina una conexión existente del flujo.
     */
    removeConnection(fromId, toId) {
      var scenario = this.options.getActiveScenario();
      if (!scenario) return;

      this.options.ensureScenarioConnections(scenario);
      scenario.connections = scenario.connections.filter(function removeExactConnection(connection) {
        return !(connection.fromId === fromId && connection.toId === toId);
      });
      scenario.connectionsTouched = true;
      scenario.pendingConnectionFromId = '';

      this.options.rebuildItemsFromConnections(scenario, this.options.getSelectedItem());
      this.options.renderScenarios();
      this.options.renderItems();
      this.options.loadPreview();
      this.options.resetExecution();
      this.options.showStatus('ok', 'Flecha removida.');
    }

    /**
     * Permite que el canvas acepte un drop de servicio.
     */
    allowCanvasDrop(event) {
      if (event) event.preventDefault();
    }

    /**
     * Resalta el canvas mientras un servicio se arrastra por encima.
     */
    dragEnterCanvas(event) {
      if (event && event.currentTarget) event.currentTarget.classList.add('collection-canvas-stage-dragover');
    }

    /**
     * Quita el resaltado al salir del canvas (ignora pasajes entre hijos internos).
     */
    dragLeaveCanvas(event) {
      if (!event || !event.currentTarget) return;
      if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget)) return;
      event.currentTarget.classList.remove('collection-canvas-stage-dragover');
    }

    /**
     * Muestra un indicador breve mientras se resuelve el alta (puede tardar si
     * el servicio todavia necesita hidratarse desde Base de datos).
     */
    showPendingInsertPill(stage) {
      if (!stage) return null;
      var pill = document.createElement('div');
      pill.className = 'collection-canvas-pending-pill';
      pill.textContent = 'Agregando servicio...';
      stage.appendChild(pill);
      return pill;
    }

    /**
     * Inserta un servicio en el flujo a partir del payload del drag.
     */
    async dropOperation(insertIndex, event) {
      if (!event) return;
      event.preventDefault();

      var stage = event.currentTarget;
      if (stage) stage.classList.remove('collection-canvas-stage-dragover');

      var payload;
      try {
        payload = JSON.parse(event.dataTransfer.getData('text/plain') || '{}');
      } catch (error) {
        return;
      }
      if (!payload.service || !payload.operationKey) return;

      var pill = this.showPendingInsertPill(stage);
      try {
        await this.options.insertOperation(payload.service, payload.operationKey, insertIndex);
      } catch (error) {
        if (this.options.showStatus) this.options.showStatus('err', (error && error.message) || 'No se pudo agregar el servicio al flujo.');
      } finally {
        if (pill && pill.parentElement) pill.remove();
      }
    }

    /**
     * Serializa al drag payload mínimo necesario para insertar una operación.
     */
    dragOperation(service, operationKey, event) {
      if (!event || !event.dataTransfer) return;
      event.dataTransfer.setData('text/plain', JSON.stringify({ service: service, operationKey: operationKey }));
      event.dataTransfer.effectAllowed = 'copy';
      if (event.dataTransfer.setDragImage && event.target) {
        var card = event.target.closest ? event.target.closest('.collection-service-card') : null;
        if (card) event.dataTransfer.setDragImage(card, 14, 14);
      }
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionCanvasInteractionManager = CollectionCanvasInteractionManager;
})(window);
