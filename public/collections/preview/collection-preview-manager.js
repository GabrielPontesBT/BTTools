(function bootstrapCollectionPreviewManager(global) {
  'use strict';

  /**
   * Reúne toda la lógica de preview de variables, salidas y sugerencias de mapping.
   * Esta capa prepara la información que luego consumen canvas, inspector y ejecución.
   */
  class CollectionPreviewManager {
    /**
     * Recibe acceso al estado compartido y callbacks del builder principal.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Devuelve el valor de una variable manual del escenario activo.
     */
    variableValue(key, fallback) {
      var scenario = this.options.getActiveScenario();
      if (scenario && Object.prototype.hasOwnProperty.call(scenario.variableOverrides, key)) {
        return scenario.variableOverrides[key];
      }
      return fallback || '';
    }

    /**
     * Devuelve el valor vigente de un input del paso seleccionado.
     * Si el paso tiene override propio, prevalece sobre el override general del escenario.
     */
    selectedItemInputValue(key, fallback) {
      var item = this.options.getSelectedItem();
      if (item && item.inputOverrides && Object.prototype.hasOwnProperty.call(item.inputOverrides, key)) {
        return item.inputOverrides[key];
      }
      return this.variableValue(key, fallback);
    }

    /**
     * Actualiza manualmente el valor de una variable en el escenario y en el paso actual.
     */
    updateVar(key, value) {
      var scenario = this.options.getActiveScenario();
      if (!scenario) return;

      scenario.variableOverrides[key] = value;

      var item = this.options.getSelectedItem();
      if (item) {
        if (!item.inputOverrides) item.inputOverrides = {};
        item.inputOverrides[key] = value;
      }
    }

    /**
     * Sincroniza los inputs visibles del inspector con el estado en memoria.
     * Esto evita que el usuario escriba algo y la preview use valores viejos.
     */
    syncInspectorInputs() {
      var scenario = this.options.getActiveScenario();
      if (!scenario) return;

      var item = this.options.getSelectedItem();
      var inputs = document.querySelectorAll('[data-collection-input-key]');

      Array.prototype.forEach.call(inputs, function syncInputValue(input) {
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

    /**
     * Construye una URL de ejecución "preview" para el paso seleccionado.
     */
    buildSelectedItemExecutionUrl() {
      var item = this.options.getSelectedItem();
      if (!item) return '';

      var scenario = this.options.getActiveScenario();
      var runtimeValues = Object.assign({}, (scenario && scenario.variableOverrides) || {});

      if (item.inputOverrides) {
        Object.keys(item.inputOverrides).forEach(function mergeInputOverride(key) {
          runtimeValues[key] = item.inputOverrides[key];
        });
      }

      var baseUrl = String(this.options.getState().swaggerBaseUrl || '').replace(/\/+$/g, '');
      var replacedPath = String(item.path || '').replace(/\{([^}]+)\}/g, function replacePathToken(_, name) {
        var key = String(name || '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'value';
        var value = Object.prototype.hasOwnProperty.call(runtimeValues, key) ? runtimeValues[key] : '';
        return encodeURIComponent(String(value));
      });

      var queryParams = (item.manualInputs || []).filter(function keepQueryParam(input) {
        return String(input.location || '').toLowerCase() === 'query';
      });

      var queryString = queryParams.map(function buildQueryPair(input) {
        var value = Object.prototype.hasOwnProperty.call(runtimeValues, input.key)
          ? runtimeValues[input.key]
          : (input.defaultValue || '');
        return encodeURIComponent(input.pathLabel || input.key) + '=' + encodeURIComponent(String(value));
      }).join('&');

      return baseUrl + replacedPath + (queryString ? '?' + queryString : '');
    }

    /**
     * Fuerza guardar las entradas visibles del paso y actualiza la URL preview.
     */
    saveSelectedStepInputs() {
      this.syncInspectorInputs();

      var previewElement = document.getElementById('collection-step-url-preview');
      if (previewElement) {
        previewElement.textContent = this.buildSelectedItemExecutionUrl() || 'Sin URL para mostrar.';
      }

      this.options.showStatus('ok', 'Entradas del paso guardadas.');
    }

    /**
     * Normaliza la estructura de un mapping guardado.
     */
    normalizeMappingConfig(mapping) {
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

    /**
     * Lee la configuración normalizada de un mapping de input.
     */
    inputMappingConfig(mappingKey) {
      var scenario = this.options.getActiveScenario();
      if (!scenario || !scenario.inputMappings) return null;
      return this.normalizeMappingConfig(scenario.inputMappings[mappingKey]);
    }

    /**
     * Devuelve solo la sourceVarKey de un mapping ya normalizado.
     */
    inputMappingValue(mappingKey) {
      var mapping = this.inputMappingConfig(mappingKey);
      return mapping ? mapping.sourceVarKey : '';
    }

    /**
     * Actualiza la variable origen elegida para un input.
     */
    updateInputMapping(mappingKey, value) {
      var scenario = this.options.getActiveScenario();
      if (!scenario) return;
      if (!scenario.inputMappings) scenario.inputMappings = {};

      if (value) {
        var current = this.normalizeMappingConfig(scenario.inputMappings[mappingKey]) || {};
        var next = { sourceVarKey: value };

        // Si el origen no cambió, se conserva la metadata auxiliar del filtro.
        if (current.sourceVarKey === value) {
          if (current.filterField) next.filterField = current.filterField;
          if (current.filterValue) next.filterValue = current.filterValue;
          if (current.collectionPathLabel) next.collectionPathLabel = current.collectionPathLabel;
          if (current.itemPathLabel) next.itemPathLabel = current.itemPathLabel;
        }

        scenario.inputMappings[mappingKey] = next;
      } else {
        delete scenario.inputMappings[mappingKey];
      }

      this.options.renderVariableEditor();
    }

    /**
     * Actualiza el campo usado para filtrar una salida de colección.
     */
    updateInputMappingFilterField(mappingKey, value) {
      var scenario = this.options.getActiveScenario();
      if (!scenario || !scenario.inputMappings) return;

      var current = this.normalizeMappingConfig(scenario.inputMappings[mappingKey]);
      if (!current || !current.sourceVarKey) return;

      if (value) current.filterField = value;
      else delete current.filterField;

      scenario.inputMappings[mappingKey] = current;
      this.options.renderVariableEditor();
    }

    /**
     * Actualiza el valor esperado del filtro aplicado sobre una salida de colección.
     */
    updateInputMappingFilterValue(mappingKey, value) {
      var scenario = this.options.getActiveScenario();
      if (!scenario || !scenario.inputMappings) return;

      var current = this.normalizeMappingConfig(scenario.inputMappings[mappingKey]);
      if (!current || !current.sourceVarKey) return;

      if (value) current.filterValue = value;
      else delete current.filterValue;

      scenario.inputMappings[mappingKey] = current;
      this.options.renderVariableEditor();
    }

    /**
     * Cambia el alias visible de una salida para hacer el match más semántico.
     */
    updateOutputAlias(sourceVarKey, value) {
      var scenario = this.options.getActiveScenario();
      if (!scenario) return;
      if (!scenario.outputAliases) scenario.outputAliases = {};

      var trimmed = String(value || '').trim();
      if (trimmed) scenario.outputAliases[sourceVarKey] = trimmed;
      else delete scenario.outputAliases[sourceVarKey];

      this.loadPreview();
    }

    /**
     * Resuelve el nombre legible que se muestra para una salida.
     */
    outputDisplayName(output) {
      return output.alias || output.displayLabel || output.sourceVarKey;
    }

    /**
     * Intenta detectar si una salida proviene de una colección tipo `algo.item.campo`.
     */
    splitCollectionOutputPath(pathLabel) {
      var parts = String(pathLabel || '').split('.').filter(Boolean);
      var itemIndex = parts.indexOf('item');
      if (itemIndex <= 0 || itemIndex >= parts.length - 1) return null;

      return {
        collectionPathLabel: parts.slice(0, itemIndex).join('.'),
        itemPathLabel: parts.slice(itemIndex + 1).join('.')
      };
    }

    /**
     * Enriquece la metadata de salidas que pertenecen a colecciones.
     */
    decoratePreviewOutputs(outputs) {
      var groups = {};

      (outputs || []).forEach(function markCollectionOutput(output) {
        var split = this.splitCollectionOutputPath(output.pathLabel || '');
        if (!split) return;

        output.collectionPathLabel = split.collectionPathLabel;
        output.itemPathLabel = split.itemPathLabel;
        output.isCollectionItemOutput = true;

        var groupKey = (output.sourceGroupKey || '') + '::' + split.collectionPathLabel;
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(output);
      }, this);

      (outputs || []).forEach(function attachFilterOptions(output) {
        if (!output.isCollectionItemOutput) return;

        var key = (output.sourceGroupKey || '') + '::' + (output.collectionPathLabel || '');
        output.filterFieldOptions = (groups[key] || []).map(function buildFilterOption(option) {
          return {
            value: option.itemPathLabel || option.key || option.pathLabel,
            label: option.itemPathLabel || option.displayLabel || option.key || option.pathLabel
          };
        });
      });

      return outputs || [];
    }

    /**
     * Busca una salida concreta dentro de las opciones disponibles de un input.
     */
    findSourceOption(input, sourceVarKey) {
      var options = (input && input.sourceOptions) || [];
      for (var i = 0; i < options.length; i++) {
        if (options[i].sourceVarKey === sourceVarKey) return options[i];
      }
      return null;
    }

    /**
     * Lee el campo de filtro actualmente configurado.
     */
    inputMappingFilterField(mappingKey) {
      var mapping = this.inputMappingConfig(mappingKey);
      return mapping && mapping.filterField ? mapping.filterField : '';
    }

    /**
     * Lee el valor de filtro actualmente configurado.
     */
    inputMappingFilterValue(mappingKey) {
      var mapping = this.inputMappingConfig(mappingKey);
      return mapping && mapping.filterValue ? mapping.filterValue : '';
    }

    /**
     * Normaliza un texto para comparar nombres ignorando formato.
     */
    normalizeToken(value) {
      return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    }

    /**
     * Construye la clave técnica única de una salida del flujo.
     */
    buildOutputVarKey(item, outputField) {
      return String((item && item.service) || '') + '_' +
        String((item && item.method) || '') + '_' +
        String(((outputField && outputField.pathLabel) || (outputField && outputField.key) || 'output')).replace(/[^A-Za-z0-9]+/g, '_');
    }

    /**
     * Construye la clave técnica única de un input mapeable.
     */
    buildInputMappingKey(item, input) {
      return String((item && item.operationKey) || ((item && item.service) || '') + '::' + ((item && item.method) || '')) +
        '::' + String((input && (input.pathLabel || input.key)) || '');
    }

    /**
     * Sugiere automáticamente la mejor salida candidata para un input.
     */
    suggestMappingForInput(input, sourceOptions) {
      var normalizedCandidates = [
        this.normalizeToken((input && input.alias) || ''),
        this.normalizeToken((input && (input.pathLabel || input.key)) || ''),
        this.normalizeToken((input && input.key) || '')
      ].filter(Boolean);

      if (!normalizedCandidates.length) return '';

      function matches(value) {
        var normalized = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
        if (!normalized) return false;
        for (var i = 0; i < normalizedCandidates.length; i++) {
          if (normalizedCandidates[i] === normalized) return true;
        }
        return false;
      }

      for (var i = sourceOptions.length - 1; i >= 0; i--) {
        var option = sourceOptions[i];
        if (matches(option.alias)) return option.sourceVarKey;
        if (matches(this.outputDisplayName(option))) return option.sourceVarKey;
        if (matches(option.pathLabel)) return option.sourceVarKey;
        if (matches(option.key)) return option.sourceVarKey;
      }

      return '';
    }

    /**
     * Carga o recalcula la preview completa del flujo activo.
     */
    async loadPreview() {
      var scenario = this.options.getActiveScenario();
      if (!scenario || !scenario.items.length) {
        if (scenario) {
          scenario.previewVariables = [];
          scenario.previewOutputs = [];
          scenario.previewMappings = [];
        }
        this.options.renderVariableEditor();
        return;
      }

      if (this.options.pathSupported()) {
        scenario.previewVariables = [];
        scenario.previewOutputs = [];
        scenario.previewMappings = [];

        var availableOutputs = [];

        scenario.items.forEach(function collectPreviewMetadata(item, itemIndex) {
          this.options.ensureItemNodeId(item);

          (item.manualInputs || []).forEach(function registerManualInput(input) {
            if (this.options.isAutoResolvedKey(input.key, input.pathLabel)) return;

            var mappingKey = this.buildInputMappingKey(item, input);
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
              sourceNodeId: this.options.getConnectedSourceId(scenario, item)
            });
          }, this);

          (item.outputFields || []).forEach(function registerOutput(outputField) {
            var sourceVarKey = this.buildOutputVarKey(item, outputField);
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
          }, this);
        }, this);

        scenario.previewOutputs = this.decoratePreviewOutputs(scenario.previewOutputs || []);

        var outputsByKey = {};
        (scenario.previewOutputs || []).forEach(function indexPreviewOutput(output) {
          outputsByKey[output.sourceVarKey] = output;
        });

        (scenario.previewVariables || []).forEach(function resolveInputMappings(input) {
          // Cualquier paso anterior en el orden de ejecucion puede usarse como origen,
          // no solo el conectado por una flecha directa (asi funciona el chaining real de Postman).
          input.sourceOptions = (input.sourceOptions || []).map(function refreshSourceOption(option) {
            return outputsByKey[option.sourceVarKey] || option;
          });

          if (!this.inputMappingValue(input.mappingKey)) {
            var suggestedSource = this.suggestMappingForInput(input, input.sourceOptions || []);
            if (suggestedSource) {
              scenario.inputMappings[input.mappingKey] = suggestedSource;
              scenario.previewMappings.push({
                target: input.groupTitle || '',
                input: input.pathLabel || input.key,
                source: suggestedSource
              });
            }
          }

          var currentMapping = input.mappingKey ? this.inputMappingConfig(input.mappingKey) : null;
          var selectedOption = currentMapping ? this.findSourceOption(input, currentMapping.sourceVarKey) : null;
          if (currentMapping && selectedOption && selectedOption.isCollectionItemOutput) {
            currentMapping.collectionPathLabel = selectedOption.collectionPathLabel || '';
            currentMapping.itemPathLabel = selectedOption.itemPathLabel || '';
            scenario.inputMappings[input.mappingKey] = currentMapping;
          }
        }, this);

        this.options.renderVariableEditor();
        return;
      }

      try {
        var data = await this.options.loadPreviewRequest({
          version: this.options.getVersion(),
          platform: this.options.getPlatform(),
          db: this.options.getDb(),
          api: this.options.getApi(),
          items: scenario.items
        });
        if (!data.ok) throw new Error(data.message);

        scenario.previewVariables = data.variables || [];
        scenario.previewMappings = data.mappings || [];
        this.options.renderVariableEditor();
      } catch (error) {
        scenario.previewVariables = [];
        scenario.previewMappings = [];
        this.options.renderVariableEditor();
        this.options.showStatus('err', error.message || 'No se pudo preparar la preview de variables.');
      }
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionPreviewManager = CollectionPreviewManager;
})(window);
