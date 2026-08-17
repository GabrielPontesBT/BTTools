(function bootstrapCollectionChainSuggestionManager(global) {
  'use strict';

  var CONFIDENCE_LABELS = { high: 'Alta confianza', medium: 'Confianza media', review: 'Requiere revision' };
  var MATCH_SOURCE_LABELS = {
    'exact-path': 'Coincidencia exacta de ruta',
    'exact-name': 'Coincidencia exacta de nombre',
    'normalized-match': 'Nombre normalizado equivalente',
    'semantic-similarity': 'Tipo de dato semanticamente compatible'
  };

  /**
   * Maneja el panel "Sugerir cadena": arma el pool de operaciones segun el alcance elegido,
   * pide sugerencias al backend (que reutiliza el matcher de request-data-resolver) y las
   * muestra en tarjetas compactas. No decide nada de matching/scoring aca: eso vive en el motor.
   */
  class CollectionChainSuggestionManager {
    /**
     * Recibe callbacks del builder principal para no depender de globals sueltos.
     */
    constructor(options) {
      this.options = options || {};
      this.state = {
        open: false,
        scope: 'service',
        startService: '',
        startOperationKey: '',
        loading: false,
        error: '',
        suggestions: null,
        expandedIndex: -1
      };
    }

    /**
     * Devuelve todas las operaciones del catalogo, aplanadas a un contrato simple.
     */
    getAllOperations() {
      var state = this.options.getState();
      var operations = [];

      (state.services || []).forEach(function collectService(service) {
        (state.serviceOperations[service] || []).forEach(function collectOperation(operation) {
          operations.push({
            service: service,
            method: operation.methodName,
            operationKey: operation.operationKey,
            httpMethod: operation.httpMethod || 'GET',
            manualInputs: operation.manualInputs || [],
            outputFields: operation.outputFields || []
          });
        });
      });

      return operations;
    }

    /**
     * Arma el pool de operaciones candidatas segun el alcance elegido por el usuario.
     */
    buildOperationPool() {
      var allOperations = this.getAllOperations();

      if (this.state.scope === 'service') {
        return allOperations.filter(function keepSameService(operation) {
          return operation.service === this.state.startService;
        }, this);
      }

      if (this.state.scope === 'collection') {
        var scenario = this.options.getActiveScenario();
        var items = scenario ? scenario.items : [];
        var included = {};
        items.forEach(function markIncluded(item) {
          included[item.service + '::' + item.method] = true;
        });

        var pool = allOperations.filter(function keepIncluded(operation) {
          return !!included[operation.service + '::' + operation.method];
        });

        var startIncluded = pool.some(function matchStart(operation) {
          return operation.service === this.state.startService && operation.operationKey === this.state.startOperationKey;
        }, this);
        if (!startIncluded) {
          var startOperation = allOperations.filter(function matchStart(operation) {
            return operation.service === this.state.startService && operation.operationKey === this.state.startOperationKey;
          }, this)[0];
          if (startOperation) pool.push(startOperation);
        }

        return pool;
      }

      return allOperations;
    }

    /**
     * Cuenta cuantas operaciones caerian en cada alcance, para mostrarlo junto a cada opcion.
     */
    countForScope(scope) {
      var allOperations = this.getAllOperations();

      if (scope === 'service') {
        return allOperations.filter(function(op) { return op.service === this.state.startService; }, this).length;
      }

      if (scope === 'collection') {
        var scenario = this.options.getActiveScenario();
        var items = scenario ? scenario.items : [];
        var seen = {};
        items.forEach(function(item) { seen[item.service + '::' + item.method] = true; });
        return Object.keys(seen).length;
      }

      return allOperations.length;
    }

    /**
     * Abre el panel, tomando el paso seleccionado en el canvas como metodo inicial por defecto.
     */
    open() {
      if (typeof collectionCloseServiceDrawer === 'function') collectionCloseServiceDrawer();

      var selectedItem = this.options.getSelectedItem();
      if (selectedItem) {
        this.state.startService = selectedItem.service;
        this.state.startOperationKey = selectedItem.operationKey;
      } else if (!this.state.startService) {
        var first = this.getAllOperations()[0];
        if (first) {
          this.state.startService = first.service;
          this.state.startOperationKey = first.operationKey;
        }
      }

      this.state.open = true;
      this.state.suggestions = null;
      this.state.error = '';
      this.state.expandedIndex = -1;

      var workspace = document.getElementById('collection-builder-workspace');
      if (workspace) workspace.classList.add('collection-builder-suggestion-open');
      var backdrop = document.getElementById('collection-builder-backdrop');
      if (backdrop) backdrop.classList.add('show');

      this.render();
    }

    /**
     * Cierra el panel sin perder el estado de busqueda (por si el usuario lo vuelve a abrir).
     */
    close() {
      if (!this.state.open) return;
      this.state.open = false;

      var workspace = document.getElementById('collection-builder-workspace');
      var otherDrawerOpen = workspace && (workspace.classList.contains('collection-builder-service-open') || workspace.classList.contains('collection-builder-inspector-open'));
      if (workspace) workspace.classList.remove('collection-builder-suggestion-open');

      var backdrop = document.getElementById('collection-builder-backdrop');
      if (backdrop && !otherDrawerOpen) backdrop.classList.remove('show');

      this.render();
    }

    /**
     * Cambia el metodo inicial elegido (llega como "servicio::operationKey").
     */
    setStartMethod(value) {
      var parts = String(value || '').split('::');
      this.state.startService = parts[0] || '';
      this.state.startOperationKey = parts.slice(1).join('::') || '';
      this.state.suggestions = null;
      this.state.error = '';
      this.render();
    }

    /**
     * Cambia el alcance de busqueda (servicio actual / coleccion actual / todos).
     */
    setScope(scope) {
      this.state.scope = scope;
      this.state.suggestions = null;
      this.state.error = '';
      this.render();
    }

    /**
     * Pide sugerencias al backend con el pool ya acotado por alcance.
     */
    async search() {
      if (!this.state.startService || !this.state.startOperationKey) return;

      this.state.loading = true;
      this.state.error = '';
      this.state.suggestions = null;
      this.state.expandedIndex = -1;
      this.render();

      try {
        var pool = this.buildOperationPool();
        var response = await this.options.apiClient.suggestChains({
          startService: this.state.startService,
          startOperationKey: this.state.startOperationKey,
          operations: pool,
          maxDepth: 5,
          maxResults: 10
        });

        if (!response.ok) throw new Error(response.message || 'No se pudieron generar sugerencias.');

        this.state.suggestions = response.suggestions || [];
      } catch (error) {
        this.state.error = error.message || 'No se pudieron generar sugerencias.';
      } finally {
        this.state.loading = false;
        this.render();
      }
    }

    /**
     * Expande o colapsa la vista detallada de una sugerencia (una a la vez).
     */
    toggleExpand(index) {
      this.state.expandedIndex = this.state.expandedIndex === index ? -1 : index;
      this.render();
    }

    /**
     * Inserta los pasos de una sugerencia confirmada, reutilizando insertOperation tal cual,
     * y crea unicamente los mappings de alta confianza.
     */
    async confirmInsert(index) {
      var suggestion = this.state.suggestions ? this.state.suggestions[index] : null;
      if (!suggestion) return;

      var scenario = this.options.getActiveScenario();
      if (!scenario) return;

      var insertedCount = 0;
      var skippedCount = 0;

      for (var i = 0; i < suggestion.steps.length; i++) {
        var step = suggestion.steps[i];
        var alreadyExists = scenario.items.some(function matchExisting(item) {
          return item.service === step.service && item.method === step.method;
        });

        if (alreadyExists) { skippedCount++; continue; }

        await this.options.insertOperation(step.service, step.operationKey, scenario.items.length);
        insertedCount++;
      }

      var previewManager = this.options.getPreviewManager();
      var mappingsCreated = 0;

      suggestion.connections.forEach(function applyHighConfidenceMapping(connection) {
        if (connection.tier !== 'high') return;

        var targetStep = suggestion.steps[connection.toStepIndex];
        var pseudoItem = { operationKey: targetStep.operationKey, service: targetStep.service, method: targetStep.method };
        var mappingKey = previewManager.buildInputMappingKey(pseudoItem, connection.targetInput);
        this.options.updateInputMapping(mappingKey, connection.sourceVarKey);
        mappingsCreated++;
      }, this);

      var pendingCount = suggestion.manualInputs.length;

      this.close();
      this.options.showStatus('ok', insertedCount + ' paso(s) agregados' + (skippedCount ? ' (' + skippedCount + ' ya estaban en la cadena)' : '') + ' · ' + mappingsCreated + ' mapping(s) creados · ' + pendingCount + ' campo(s) requieren configuracion.');

      var firstPending = suggestion.manualInputs[0];
      if (firstPending) {
        var targetStep = suggestion.steps[firstPending.stepIndex];
        var scenarioIndex = scenario.items.findIndex(function matchStep(item) {
          return item.service === targetStep.service && item.method === targetStep.method;
        });
        if (scenarioIndex >= 0 && this.options.selectItem) this.options.selectItem(scenarioIndex);
      }
    }

    /**
     * Repinta el panel completo: cabecera fija en panel.html, este metodo solo llena el body.
     */
    render() {
      var body = document.getElementById('collection-chain-suggestion-body');
      if (!body) return;

      body.innerHTML = this.renderConfigForm() + this.renderResultsArea();
    }

    /**
     * Dibuja el formulario de configuracion: metodo inicial y alcance de busqueda.
     */
    renderConfigForm() {
      var allOperations = this.getAllOperations();
      var scopes = [
        { key: 'service', label: 'Servicio actual' + (this.state.startService ? ' (' + this.options.escapeHtml(this.state.startService) + ')' : '') },
        { key: 'collection', label: 'Servicios de la coleccion' },
        { key: 'all', label: 'Todos los servicios' }
      ];

      return '<div class="collection-suggest-field">' +
          '<label class="collection-suggest-label">1. Metodo inicial</label>' +
          '<select class="collection-suggest-select" onchange="collectionSetSuggestStartMethod(this.value)">' +
            this.renderStartMethodOptions(allOperations) +
          '</select>' +
        '</div>' +
        '<div class="collection-suggest-field">' +
          '<label class="collection-suggest-label">2. Buscar en</label>' +
          '<div class="collection-suggest-scope-list">' +
            scopes.map(function renderScopeOption(scope) {
              var checked = this.state.scope === scope.key;
              return '<label class="collection-suggest-scope-option' + (checked ? ' collection-suggest-scope-option-selected' : '') + '">' +
                '<input type="radio" name="collection-suggest-scope" value="' + scope.key + '"' + (checked ? ' checked' : '') + ' onchange="collectionSetSuggestScope(\'' + scope.key + '\')">' +
                '<span>' + this.options.escapeHtml(scope.label) + '</span>' +
                '<span class="collection-suggest-scope-count">' + this.countForScope(scope.key) + '</span>' +
              '</label>';
            }, this).join('') +
          '</div>' +
        '</div>' +
        '<button type="button" class="btn btn-primary collection-suggest-search-btn" onclick="collectionRunChainSuggestionSearch()"' + (this.state.loading ? ' disabled' : '') + '>' +
          (this.state.loading ? 'Analizando servicios...' : 'Buscar sugerencias') +
        '</button>';
    }

    /**
     * Agrupa las operaciones por servicio para el select de metodo inicial.
     */
    renderStartMethodOptions(allOperations) {
      var groups = [];
      var groupsByService = {};

      allOperations.forEach(function bucketOperation(operation) {
        if (!groupsByService[operation.service]) {
          groupsByService[operation.service] = { service: operation.service, operations: [] };
          groups.push(groupsByService[operation.service]);
        }
        groupsByService[operation.service].operations.push(operation);
      });

      return groups.map(function renderGroup(group) {
        return '<optgroup label="' + this.options.escapeHtml(group.service) + '">' +
          group.operations.map(function renderOption(operation) {
            var value = operation.service + '::' + operation.operationKey;
            var selected = (operation.service === this.state.startService && operation.operationKey === this.state.startOperationKey) ? ' selected' : '';
            return '<option value="' + this.options.escapeHtml(value) + '"' + selected + '>' + this.options.escapeHtml(operation.method) + ' · ' + this.options.escapeHtml(operation.httpMethod) + '</option>';
          }, this).join('') +
        '</optgroup>';
      }, this).join('');
    }

    /**
     * Dibuja el area de resultados: estados de carga/error/vacio o la lista de tarjetas.
     */
    renderResultsArea() {
      if (this.state.loading) {
        return '<div class="collection-suggest-status">Analizando servicios...</div>';
      }

      if (this.state.error) {
        return '<div class="collection-suggest-status collection-suggest-status-error">' + this.options.escapeHtml(this.state.error) + '</div>';
      }

      if (this.state.suggestions === null) {
        return '';
      }

      if (!this.state.suggestions.length) {
        return '<div class="collection-suggest-status">No se encontraron caminos compatibles desde este metodo.</div>';
      }

      return '<div class="collection-suggest-results-head">Sugerencias encontradas (' + this.state.suggestions.length + ')</div>' +
        this.state.suggestions.map(function renderCard(suggestion, index) {
          return this.renderSuggestionCard(suggestion, index);
        }, this).join('');
    }

    /**
     * Tarjeta compacta de una sugerencia, con su vista detallada opcional debajo.
     */
    renderSuggestionCard(suggestion, index) {
      var isExpanded = this.state.expandedIndex === index;
      var autoConnections = suggestion.connections.filter(function(c) { return c.tier === 'high'; }).length;

      return '<div class="collection-suggest-card collection-suggest-card-' + suggestion.confidence + (isExpanded ? ' collection-suggest-card-open' : '') + '">' +
        '<button type="button" class="collection-suggest-card-head" aria-expanded="' + (isExpanded ? 'true' : 'false') + '" onclick="collectionToggleChainSuggestion(' + index + ')">' +
          '<span class="collection-suggest-card-title">Sugerencia ' + (index + 1) + '</span>' +
          '<span class="collection-suggest-confidence-badge collection-suggest-confidence-' + suggestion.confidence + '">' + CONFIDENCE_LABELS[suggestion.confidence] + '</span>' +
        '</button>' +
        '<div class="collection-suggest-chain-preview">' +
          suggestion.steps.map(function renderStepChip(step, stepIndex) {
            return (stepIndex ? '<span class="collection-suggest-chain-arrow">&#8594;</span>' : '') +
              '<span class="collection-suggest-chain-step"><strong>' + this.options.escapeHtml(step.method) + '</strong><span class="collection-suggest-chain-verb">' + this.options.escapeHtml(step.httpMethod) + '</span></span>';
          }, this).join('') +
        '</div>' +
        '<div class="collection-suggest-card-footer">' +
          autoConnections + ' conexion(es) automatica(s) · ' + suggestion.manualInputs.length + ' campo(s) manuales' +
        '</div>' +
        (isExpanded ? this.renderSuggestionDetail(suggestion, index) : '') +
      '</div>';
    }

    /**
     * Vista detallada: paso a paso, que se conecto de donde y que queda manual.
     */
    renderSuggestionDetail(suggestion, index) {
      var html = '<div class="collection-suggest-detail">';

      if (suggestion.warnings.length) {
        html += suggestion.warnings.map(function renderWarning(warning) {
          return '<div class="collection-suggest-warning">' + this.options.escapeHtml(warning) + '</div>';
        }, this).join('');
      }

      suggestion.steps.forEach(function renderStepDetail(step, stepIndex) {
        var stepConnections = suggestion.connections.filter(function(c) { return c.toStepIndex === stepIndex; });
        var stepManualInputs = suggestion.manualInputs.filter(function(m) { return m.stepIndex === stepIndex; });

        html += '<div class="collection-suggest-detail-step">' +
          '<div class="collection-suggest-detail-step-title">Paso ' + (stepIndex + 1) + ' · ' + this.options.escapeHtml(step.method) + '</div>';

        if (stepIndex === 0) {
          html += '<div class="collection-suggest-detail-note">Metodo inicial.</div>';
        }

        if (stepConnections.length) {
          html += '<div class="collection-suggest-detail-label">Entradas conectadas</div>' +
            stepConnections.map(function renderConnection(connection) {
              var fromStep = suggestion.steps[connection.fromStepIndex];
              var matchLabel = MATCH_SOURCE_LABELS[connection.matchSource] || connection.explanation;
              return '<div class="collection-suggest-detail-connection' + (connection.tier !== 'high' ? ' collection-suggest-detail-connection-pending' : '') + '">' +
                '<div class="collection-suggest-detail-connection-fields">' + this.options.escapeHtml(connection.targetField.pathLabel) + ' &larr; ' + this.options.escapeHtml(fromStep.method) + '.' + this.options.escapeHtml(connection.sourceField.pathLabel) + '</div>' +
                '<div class="collection-suggest-detail-connection-reason">' + this.options.escapeHtml(matchLabel) + (connection.isCollectionSource ? ' · es una coleccion, vas a elegir el elemento despues de agregar' : '') + '</div>' +
              '</div>';
            }, this).join('');
        }

        if (stepManualInputs.length) {
          html += '<div class="collection-suggest-detail-label">Entradas manuales</div>' +
            '<div class="collection-suggest-detail-manual-list">' +
              stepManualInputs.map(function renderManual(manualInput) {
                return '<span class="collection-suggest-detail-manual-chip">' + this.options.escapeHtml(manualInput.pathLabel) + '</span>';
              }, this).join('') +
            '</div>';
        }

        html += '</div>';
      }, this);

      html += '<button type="button" class="btn btn-primary collection-suggest-add-btn" onclick="collectionConfirmChainSuggestion(' + index + ')">Agregar al canvas</button>';
      html += '</div>';

      return html;
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionChainSuggestionManager = CollectionChainSuggestionManager;
})(window);
