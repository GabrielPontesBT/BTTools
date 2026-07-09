(function bootstrapCollectionInspectorManager(global) {
  'use strict';

  /**
   * Se ocupa de renderizar el panel derecho del builder.
   * El objetivo es mantener separada la lógica de "detalle del paso" del canvas.
   */
  class CollectionInspectorManager {
    /**
     * Recibe callbacks para evitar dependencia directa de funciones globales.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Renderiza por completo el inspector del paso seleccionado.
     * Si no hay paso seleccionado, muestra un estado vacío amigable.
     */
    renderInspector() {
      var container = document.getElementById('collection-step-config');
      if (!container) return;

      var inspectorState = this.options.captureInspectorState(container);
      var scenario = this.options.getActiveScenario();
      var selectedItem = this.options.getSelectedItem();

      if (!scenario || !selectedItem) {
        container.innerHTML = '<div class="collection-step-empty">Selecciona un paso del flujo para ver sus entradas, salidas y ajustes manuales.</div>';
        this.options.restoreInspectorState(container, inspectorState);
        return;
      }

      var selectedIndex = this.options.getSelectedItemIndex();
      var groupKey = selectedItem.service + '.' + selectedItem.method + '::' + selectedIndex;
      var scalarInputs = (scenario.previewVariables || []).filter(function keepSimpleInputs(input) {
        return input.groupKey === groupKey && !input.repeatableGroupKey;
      });
      var repeatableInputs = (scenario.previewVariables || []).filter(function keepRepeatableInputs(input) {
        return input.groupKey === groupKey && !!input.repeatableGroupKey;
      });
      var outputs = (scenario.previewOutputs || []).filter(function keepCurrentOutputs(output) {
        return output.sourceGroupKey === groupKey;
      });
      var executionUrl = this.options.buildSelectedItemExecutionUrl();

      container.innerHTML =
        '<div class="collection-config-section">' +
          '<div class="collection-config-title">Servicio seleccionado</div>' +
          '<div class="collection-config-service">' +
            '<div class="collection-config-service-badge">' + (selectedIndex + 1) + '</div>' +
            '<div class="collection-config-service-copy">' +
              '<div class="collection-config-service-name">' + this.options.escapeHtml(selectedItem.method) + '</div>' +
              '<div class="collection-config-service-meta">' + this.options.escapeHtml(selectedItem.service + ' | ' + String(selectedItem.httpMethod || 'GET').toUpperCase()) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="collection-config-section">' +
          '<div class="collection-config-title">Descripcion</div>' +
          '<div class="collection-config-item"><div class="collection-config-item-meta">' + this.options.escapeHtml(selectedItem.summary || selectedItem.path || 'Sin descripcion disponible en Swagger.') + '</div></div>' +
        '</div>' +
        '<div class="collection-config-section">' +
          '<div class="collection-config-title">URL de ejecucion</div>' +
          '<div class="collection-config-item">' +
            '<div class="collection-config-item-row">' +
              '<button type="button" class="btn btn-outline btn-sm" onclick="collectionSaveSelectedStepInputs()">Guardar entradas</button>' +
            '</div>' +
            '<div class="collection-config-item-row">' +
              '<div id="collection-step-url-preview" class="collection-config-url-preview">' + this.options.escapeHtml(executionUrl || 'Sin URL para mostrar.') + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="collection-config-section">' +
          '<div class="collection-config-title">Entradas</div>' +
          (scalarInputs.length ? scalarInputs.map(function renderInput(input) {
            return this.renderScalarInput(input, scenario);
          }, this).join('') : '<div class="collection-step-empty">Este paso no necesita variables manuales simples.</div>') +
        '</div>' +
        '<div class="collection-config-section">' +
          '<div class="collection-config-title">Salidas disponibles</div>' +
          (outputs.length ? outputs.map(function renderOutput(output) {
            return this.renderOutput(output);
          }, this).join('') : '<div class="collection-step-empty">Swagger no expuso salidas simples para este metodo.</div>') +
        '</div>' +
        (repeatableInputs.length
          ? '<div class="collection-config-section"><div class="collection-config-title">Listas y estructuras</div><div class="collection-step-empty">Este paso tiene ' + repeatableInputs.length + ' campo(s) complejos/repetibles. Los seguimos resolviendo con el motor actual, pero la edicion visual fina queda para la siguiente iteracion.</div></div>'
          : '');

      this.options.restoreInspectorState(container, inspectorState);
    }

    /**
     * Renderiza un input simple del inspector.
     * Incluye alias, mapeo automático/manual, filtro de listas y el valor final editable.
     */
    renderScalarInput(input, scenario) {
      var currentValue = this.options.selectedItemInputValue(input.key, input.defaultValue || '');
      var mappingKey = input.mappingKey || '';
      var mappingConfig = mappingKey ? this.options.inputMappingConfig(mappingKey) : null;
      var mappedSource = mappingConfig ? mappingConfig.sourceVarKey : '';
      var mappedOption = mappedSource ? this.options.findSourceOption(input, mappedSource) : null;
      var filterField = mappingConfig ? (mappingConfig.filterField || '') : '';
      var filterValue = mappingConfig ? (mappingConfig.filterValue || '') : '';

      if (mappingKey && mappingConfig && mappedOption && mappedOption.isCollectionItemOutput) {
        // Se persiste la metadata de colección para que luego el motor sepa cómo resolver listas.
        mappingConfig.collectionPathLabel = mappedOption.collectionPathLabel || '';
        mappingConfig.itemPathLabel = mappedOption.itemPathLabel || '';
        if (!scenario.inputMappings) scenario.inputMappings = {};
        scenario.inputMappings[mappingKey] = mappingConfig;
      }

      return '<div class="collection-config-item">' +
        '<div class="collection-config-item-name">' + this.options.escapeHtml(this.options.inputDisplayName(input)) + '</div>' +
        '<div class="collection-config-item-meta">' + this.options.escapeHtml((input.pathLabel || input.key) + (input.type ? ' | ' + input.type : '') + (input.description ? ' | ' + input.description : '')) + '</div>' +
        '<div class="collection-config-item-row"><input data-inspector-key="' + this.options.escapeHtml('input-alias:' + mappingKey) + '" class="collection-var-input" type="text" value="' + this.options.escapeHtml(input.alias || '') + '" placeholder="Nombre funcional para match" oninput="collectionUpdateInputAlias(' + "'" + this.options.escapeHtml(mappingKey) + "'" + ', this.value)"></div>' +
        (input.sourceOptions && input.sourceOptions.length
          ? '<div class="collection-config-item-row"><select data-inspector-key="' + this.options.escapeHtml('input-map:' + mappingKey) + '" class="collection-var-input" onchange="collectionUpdateInputMapping(' + "'" + this.options.escapeHtml(mappingKey) + "'" + ', this.value)"><option value=\"\">Completar a mano</option>' + input.sourceOptions.map(function buildSourceOption(option) {
              var selected = mappedSource === option.sourceVarKey ? ' selected' : '';
              return '<option value="' + this.options.escapeHtml(option.sourceVarKey) + '"' + selected + '>' + this.options.escapeHtml(this.options.outputDisplayName(option)) + '</option>';
            }, this).join('') + '</select></div>'
          : '') +
        (mappedOption && mappedOption.isCollectionItemOutput
          ? this.renderCollectionFilterBox(mappingKey, mappedOption, filterField, filterValue)
          : '') +
        '<div class="collection-config-item-row"><input id="' + this.options.escapeHtml(this.options.domId(input.key)) + '" data-inspector-key="' + this.options.escapeHtml('input-value:' + input.key) + '" data-collection-input-key="' + this.options.escapeHtml(input.key) + '" class="collection-var-input" type="text" value="' + this.options.escapeHtml(currentValue) + '" oninput="collectionUpdateVar(' + "'" + this.options.escapeHtml(input.key) + "'" + ', this.value)"' + (mappedSource ? ' disabled' : '') + '></div>' +
      '</div>';
    }

    /**
     * Renderiza el pequeño bloque que permite filtrar un item concreto dentro de una lista origen.
     */
    renderCollectionFilterBox(mappingKey, mappedOption, filterField, filterValue) {
      return '<div class="collection-config-filter-box">' +
        '<div class="collection-config-filter-title">Filtrar item de la lista origen</div>' +
        '<div class="collection-config-item-meta">La salida viene de una coleccion. Puedes elegir que registro tomar antes de pasarlo a este input.</div>' +
        '<div class="collection-config-filter-grid">' +
          '<select data-inspector-key="' + this.options.escapeHtml('input-filter-field:' + mappingKey) + '" class="collection-var-input" onchange="collectionUpdateInputMappingFilterField(' + "'" + this.options.escapeHtml(mappingKey) + "'" + ', this.value)"><option value=\"\">Sin filtro (primer item util)</option>' + (mappedOption.filterFieldOptions || []).map(function renderFilterOption(option) {
            var selected = filterField === option.value ? ' selected' : '';
            return '<option value="' + this.options.escapeHtml(option.value) + '"' + selected + '>' + this.options.escapeHtml(option.label) + '</option>';
          }, this).join('') + '</select>' +
          '<input data-inspector-key="' + this.options.escapeHtml('input-filter-value:' + mappingKey) + '" class="collection-var-input" type="text" placeholder="Valor esperado" value="' + this.options.escapeHtml(filterValue) + '" oninput="collectionUpdateInputMappingFilterValue(' + "'" + this.options.escapeHtml(mappingKey) + "'" + ', this.value)">' +
        '</div>' +
      '</div>';
    }

    /**
     * Renderiza una salida disponible del paso actual.
     * Permite renombrarla funcionalmente para mejorar el match entre pasos.
     */
    renderOutput(output) {
      return '<div class="collection-config-item">' +
        '<div class="collection-config-item-name">' + this.options.escapeHtml(this.options.outputDisplayName(output)) + '</div>' +
        '<div class="collection-config-item-meta">' + this.options.escapeHtml((output.pathLabel || output.displayLabel || output.sourceVarKey) + (output.type ? ' | ' + output.type : '')) + '</div>' +
        '<div class="collection-config-item-row"><input data-inspector-key="' + this.options.escapeHtml('output-alias:' + output.sourceVarKey) + '" class="collection-var-input" type="text" value="' + this.options.escapeHtml(output.alias || '') + '" placeholder="Renombre funcional" oninput="collectionUpdateOutputAlias(' + "'" + this.options.escapeHtml(output.sourceVarKey) + "'" + ', this.value)"></div>' +
        '<div class="collection-config-item-row"><span class="collection-config-output-tag">' + this.options.escapeHtml(output.sourceVarKey) + '</span></div>' +
      '</div>';
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionInspectorManager = CollectionInspectorManager;
})(window);
