(function bootstrapCollectionFlowLifecycleManager(global) {
  'use strict';

  /**
   * Encapsula el ciclo de vida del flujo activo:
   * seleccion de escenarios, seleccion de pasos, insercion y eliminacion
   * de operaciones y utilidades de conexiones asociadas.
   */
  class CollectionFlowLifecycleManager {
    /**
     * Recibe estado y callbacks del coordinador para mantener el modulo desacoplado.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Actualiza el nombre visible de la collection exportada.
     */
    updateCollectionName(value) {
      this.options.getState().collectionName = value || 'Bantotal JSON Collection';
    }

    /**
     * Renombra el caso de uso activo y refresca los paneles vinculados.
     */
    renameActiveScenario(value) {
      var scenario = this.options.getActiveScenario();
      if (!scenario) return;

      scenario.name = value || 'Caso de uso';
      this.options.renderScenarios();
      this.options.renderItems();
    }

    /**
     * Devuelve el indice seleccionado asegurando que siempre sea valido.
     */
    getSelectedItemIndex() {
      var scenario = this.options.getActiveScenario();
      if (!scenario) return -1;
      if (!scenario.items.length) return -1;

      if (typeof scenario.selectedItemIndex !== 'number' || scenario.selectedItemIndex < 0 || scenario.selectedItemIndex >= scenario.items.length) {
        scenario.selectedItemIndex = 0;
      }

      return scenario.selectedItemIndex;
    }

    /**
     * Devuelve el paso actualmente seleccionado dentro del caso activo.
     */
    getSelectedItem() {
      var scenario = this.options.getActiveScenario();
      var index = this.getSelectedItemIndex();
      if (!scenario || index < 0) return null;
      return scenario.items[index] || null;
    }

    /**
     * Cambia el paso seleccionado y refresca las vistas relacionadas.
     */
    setSelectedItem(index) {
      var scenario = this.options.getActiveScenario();
      if (!scenario) return;

      scenario.selectedItemIndex = index;
      this.options.renderItems();
      this.options.renderVariableEditor();
      this.options.resetExecution();
    }

    /**
     * Cambia el escenario activo y limpia resultados dependientes del anterior.
     */
    setActiveScenario(id) {
      this.options.getState().activeScenarioId = id;
      this.options.renderScenarios();
      this.options.renderItems();
      this.options.renderVariableEditor();
      this.options.resetResult();
      this.options.resetExecution();
    }

    /**
     * Construye una clave estable para agrupar inputs/outputs por paso.
     */
    buildCanvasGroupKey(item, index) {
      return item.service + '.' + item.method + '::' + index;
    }

    /**
     * Busca el indice de un paso a partir del nodeId visual del canvas.
     */
    findItemIndexByNodeId(scenario, nodeId) {
      if (!scenario || !Array.isArray(scenario.items)) return -1;

      for (var index = 0; index < scenario.items.length; index++) {
        if (this.options.ensureItemNodeId(scenario.items[index]) === nodeId) return index;
      }

      return -1;
    }

    /**
     * Devuelve la conexion saliente de un nodo si existe.
     */
    findOutgoingConnection(scenario, fromId) {
      var connections = this.options.ensureScenarioConnections(scenario);

      for (var index = 0; index < connections.length; index++) {
        if (connections[index].fromId === fromId) return connections[index];
      }

      return null;
    }

    /**
     * Devuelve la conexion entrante de un nodo si existe.
     */
    findIncomingConnection(scenario, toId) {
      var connections = this.options.ensureScenarioConnections(scenario);

      for (var index = 0; index < connections.length; index++) {
        if (connections[index].toId === toId) return connections[index];
      }

      return null;
    }

    /**
     * Reordena los pasos segun el grafo de conexiones actual.
     * Esto permite que el orden del flujo siga el enlace visual entre nodos.
     */
    rebuildItemsFromConnections(scenario, selectedItem) {
      if (!scenario || !Array.isArray(scenario.items) || scenario.items.length < 2) {
        if (scenario && selectedItem) scenario.selectedItemIndex = scenario.items.indexOf(selectedItem);
        return false;
      }

      var before = scenario.items.slice();
      var connections = this.options.ensureScenarioConnections(scenario);
      if (!connections.length) {
        if (selectedItem) scenario.selectedItemIndex = scenario.items.indexOf(selectedItem);
        return false;
      }

      var itemById = {};
      var incoming = {};
      var outgoing = {};

      scenario.items.forEach(function indexItem(item) {
        var nodeId = this.options.ensureItemNodeId(item);
        itemById[nodeId] = item;
      }, this);

      connections.forEach(function indexConnection(connection) {
        incoming[connection.toId] = connection.fromId;
        outgoing[connection.fromId] = connection.toId;
      });

      var ordered = [];
      var visited = {};

      scenario.items.forEach(function walkRoots(item) {
        var nodeId = this.options.ensureItemNodeId(item);
        if (incoming[nodeId]) return;

        var currentId = nodeId;
        while (currentId && itemById[currentId] && !visited[currentId]) {
          visited[currentId] = true;
          ordered.push(itemById[currentId]);
          currentId = outgoing[currentId] || '';
        }
      }, this);

      scenario.items.forEach(function appendOrphans(item) {
        var nodeId = this.options.ensureItemNodeId(item);
        if (!visited[nodeId]) {
          visited[nodeId] = true;
          ordered.push(item);
        }
      }, this);

      scenario.items = ordered;
      if (selectedItem) scenario.selectedItemIndex = scenario.items.indexOf(selectedItem);

      for (var index = 0; index < before.length; index++) {
        if (before[index] !== scenario.items[index]) return true;
      }

      return false;
    }

    /**
     * Dado un paso, devuelve el nodeId del paso origen conectado a el.
     */
    getConnectedSourceId(scenario, item) {
      if (!scenario || !item) return '';

      var nodeId = this.options.ensureItemNodeId(item);
      var incoming = this.findIncomingConnection(scenario, nodeId);
      return incoming ? incoming.fromId : '';
    }

    /**
     * Devuelve el alias funcional configurado para un input.
     */
    inputAliasValue(mappingKey) {
      var scenario = this.options.getActiveScenario();
      if (!scenario || !scenario.inputAliases) return '';
      return scenario.inputAliases[mappingKey] || '';
    }

    /**
     * Actualiza el alias funcional de un input y recalcula preview.
     */
    updateInputAlias(mappingKey, value) {
      var scenario = this.options.getActiveScenario();
      if (!scenario) return;

      if (!scenario.inputAliases) scenario.inputAliases = {};

      var trimmed = String(value || '').trim();
      if (trimmed) scenario.inputAliases[mappingKey] = trimmed;
      else delete scenario.inputAliases[mappingKey];

      this.options.loadPreview();
    }

    /**
     * Limpia prefijos técnicos del path para que el usuario vea el parámetro real.
     */
    simplifyInputReference(value) {
      var text = String(value || '');
      if (!text) return '';

      var dotMarkers = ['.body.', '.query.', '.path.', '.header.'];
      for (var index = 0; index < dotMarkers.length; index++) {
        var dotPosition = text.indexOf(dotMarkers[index]);
        if (dotPosition >= 0) return text.slice(dotPosition + dotMarkers[index].length);
      }

      var underscoreMarkers = ['_body_', '_query_', '_path_', '_header_'];
      for (var markerIndex = 0; markerIndex < underscoreMarkers.length; markerIndex++) {
        var underscorePosition = text.indexOf(underscoreMarkers[markerIndex]);
        if (underscorePosition >= 0) return text.slice(underscorePosition + underscoreMarkers[markerIndex].length).replace(/_/g, '.');
      }

      return text;
    }

    /**
     * Resuelve el label visible de un input considerando alias funcional.
     */
    inputDisplayName(input) {
      if (input.alias) return input.alias;
      return this.simplifyInputReference((input && (input.pathLabel || input.key)) || '') || String((input && input.key) || '');
    }

    /**
     * Devuelve una línea técnica corta para el subtítulo del input.
     */
    inputMetaLabel(input) {
      var base = this.simplifyInputReference((input && (input.pathLabel || input.key)) || '') || String((input && input.key) || '');
      return base;
    }

    /**
     * Marca o desmarca un nodo como origen pendiente de una nueva conexion.
     */
    setPendingConnection(nodeId) {
      var scenario = this.options.getActiveScenario();
      if (!scenario) return;

      this.options.ensureScenarioConnections(scenario);
      scenario.pendingConnectionFromId = scenario.pendingConnectionFromId === nodeId ? '' : nodeId;
      this.options.renderItems();
    }

    /**
     * Busca una operacion dentro del catalogo cargado para el servicio dado.
     */
    findOperationByKey(service, operationKey) {
      var operations = this.options.getState().serviceOperations[service] || [];

      for (var index = 0; index < operations.length; index++) {
        if ((operations[index].operationKey || '') === operationKey) return operations[index];
      }

      return null;
    }

    /**
     * Si la operacion viene del origen Base de datos en modo liviano,
     * pide su schema completo justo antes de insertarla en el flujo.
     */
    async hydrateOperationIfNeeded(service, operation) {
      if (!operation || !operation.needsHydration) return operation;
      if (!this.options.apiClient || typeof this.options.apiClient.loadDatabaseOperation !== 'function') return operation;

      var response = await this.options.apiClient.loadDatabaseOperation({
        version: this.options.getVersion ? this.options.getVersion() : '',
        platform: this.options.getPlatform ? this.options.getPlatform() : '',
        db: this.options.getDb ? this.options.getDb() : {},
        service: service,
        method: operation.methodName
      });

      if (!response || !response.ok || !response.operation) {
        throw new Error((response && response.message) || 'No se pudo cargar el detalle del metodo desde Base de datos.');
      }

      var operations = this.options.getState().serviceOperations[service] || [];
      for (var index = 0; index < operations.length; index++) {
        if ((operations[index].operationKey || '') === (operation.operationKey || '')) {
          operations[index] = response.operation;
          break;
        }
      }

      return response.operation;
    }

    /**
     * Inserta una operacion en el flujo activo y recompone conexiones adyacentes.
     */
    async insertOperation(service, operationKey, insertIndex) {
      var scenario = this.options.getActiveScenario();
      var selectedOperation = this.findOperationByKey(service, operationKey);
      if (!scenario || !selectedOperation) return;

      selectedOperation = await this.hydrateOperationIfNeeded(service, selectedOperation);

      this.options.ensureScenarioConnections(scenario);

      var method = selectedOperation.methodName;
      var operationKind = String(selectedOperation.httpMethod || '').toLowerCase() === 'get' ? 'query' : 'action';
      var safeIndex = typeof insertIndex === 'number' && insertIndex >= 0 ? insertIndex : scenario.items.length;
      if (safeIndex > scenario.items.length) safeIndex = scenario.items.length;

      var previousItem = safeIndex > 0 ? scenario.items[safeIndex - 1] : null;
      var nextItem = safeIndex < scenario.items.length ? scenario.items[safeIndex] : null;
      var exists = scenario.items.some(function alreadyExists(item) {
        return item.service === service && item.method === method;
      });
      if (exists) return;

      var newItem = {
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
        outputFields: selectedOperation.outputFields || [],
        layout: this.options.defaultNodeLayout(safeIndex)
      };

      this.options.ensureItemNodeId(newItem);
      scenario.items.splice(safeIndex, 0, newItem);

      if (previousItem) {
        var previousId = this.options.ensureItemNodeId(previousItem);
        var nextId = nextItem ? this.options.ensureItemNodeId(nextItem) : '';

        scenario.connections = scenario.connections.filter(function removeDirectBypass(connection) {
          return !(nextId && connection.fromId === previousId && connection.toId === nextId);
        });
        scenario.connections.push({ fromId: previousId, toId: newItem.nodeId });

        if (nextId) {
          scenario.connections.push({ fromId: newItem.nodeId, toId: nextId });
        }
      } else if (nextItem) {
        scenario.connections.push({ fromId: newItem.nodeId, toId: this.options.ensureItemNodeId(nextItem) });
      }

      if (scenario.connections.length) scenario.connectionsTouched = true;

      for (var index = 0; index < scenario.items.length; index++) {
        this.options.ensureItemLayout(scenario.items[index], index);
      }

      scenario.selectedItemIndex = safeIndex;
      this.options.renderScenarios();
      this.options.renderItems();
      this.options.loadPreview();
      this.options.resetResult();
      this.options.resetExecution();
    }

    /**
     * Limpia mappings, overrides y conexiones de un paso antes de quitarlo.
     */
    clearItemState(scenario, item) {
      if (!scenario || !item) return;

      this.options.ensureScenarioConnections(scenario);

      var nodeId = this.options.ensureItemNodeId(item);
      var incoming = this.findIncomingConnection(scenario, nodeId);
      var outgoing = this.findOutgoingConnection(scenario, nodeId);
      var manualInputs = Array.isArray(item.manualInputs) ? item.manualInputs : [];

      manualInputs.forEach(function cleanupInput(input) {
        var key = input && input.key ? input.key : '';
        if (key && scenario.variableOverrides && Object.prototype.hasOwnProperty.call(scenario.variableOverrides, key)) {
          delete scenario.variableOverrides[key];
        }
        if (key && scenario.repeatableOverrides && Object.prototype.hasOwnProperty.call(scenario.repeatableOverrides, key)) {
          delete scenario.repeatableOverrides[key];
        }

        var mappingKey = this.options.buildInputMappingKey(item, input);
        if (mappingKey && scenario.inputMappings && Object.prototype.hasOwnProperty.call(scenario.inputMappings, mappingKey)) {
          delete scenario.inputMappings[mappingKey];
        }
      }, this);

      var outputs = Array.isArray(item.outputFields) ? item.outputFields : [];
      outputs.forEach(function cleanupOutput(output) {
        var sourceVarKey = this.options.buildOutputVarKey(item, output);
        if (sourceVarKey && scenario.outputAliases && Object.prototype.hasOwnProperty.call(scenario.outputAliases, sourceVarKey)) {
          delete scenario.outputAliases[sourceVarKey];
        }
      }, this);

      scenario.connections = scenario.connections.filter(function removeNodeConnections(connection) {
        return connection.fromId !== nodeId && connection.toId !== nodeId;
      });

      if (incoming && outgoing && incoming.fromId !== outgoing.toId) {
        scenario.connections.push({ fromId: incoming.fromId, toId: outgoing.toId });
      }

      if (scenario.pendingConnectionFromId === nodeId) scenario.pendingConnectionFromId = '';
      item.inputOverrides = {};
    }

    /**
     * Elimina un paso del flujo activo y actualiza estado derivado.
     */
    removeItem(index) {
      var scenario = this.options.getActiveScenario();
      if (!scenario) return;

      var item = scenario.items[index];
      this.clearItemState(scenario, item);
      scenario.items.splice(index, 1);

      if (!scenario.items.length) scenario.selectedItemIndex = -1;
      else if (scenario.selectedItemIndex >= scenario.items.length) scenario.selectedItemIndex = scenario.items.length - 1;

      this.options.renderScenarios();
      this.options.renderItems();
      this.options.loadPreview();
      this.options.resetResult();
      this.options.resetExecution();
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionFlowLifecycleManager = CollectionFlowLifecycleManager;
})(window);

