(function bootstrapCollectionInspectorManager(global) {
  'use strict';

  var GENERIC_SUMMARIES = ['', 'sin descripcion disponible en swagger.', 'sin descripcion.', 'sin descripcion', 'enter a description'];

  /**
   * Filtra descripciones vacias o placeholders sin valor real.
   */
  function describeStep(item) {
    var raw = String((item && (item.summary || item.path)) || '').trim();
    if (!raw || GENERIC_SUMMARIES.indexOf(raw.toLowerCase()) >= 0) return '';
    return raw;
  }

  /**
   * Se ocupa de renderizar el inspector lateral derecho: cabecera fija (en panel.html),
   * tabs, contenido con scroll propio y footer de estado, para un unico paso seleccionado.
   */
  class CollectionInspectorManager {
    /**
     * Recibe callbacks para evitar dependencia directa de funciones globales.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Renderiza por completo el inspector del paso seleccionado: tabs, contenido y footer.
     * Si no hay paso seleccionado, muestra un estado vacio amigable.
     */
    renderInspector() {
      var container = document.getElementById('collection-step-config');
      var tabsContainer = document.getElementById('collection-inspector-tabs');
      var footerContainer = document.getElementById('collection-inspector-footer');
      if (!container) return;

      var inspectorState = this.options.captureInspectorState(container);
      var scenario = this.options.getActiveScenario();
      var selectedItem = this.options.getSelectedItem();

      if (!scenario || !selectedItem) {
        if (tabsContainer) tabsContainer.innerHTML = '';
        if (footerContainer) footerContainer.innerHTML = '';
        container.innerHTML = '<div class="collection-step-empty">Selecciona un paso del flujo para ver sus entradas, salidas y ajustes manuales.</div>';
        this.options.restoreInspectorState(container, inspectorState);
        if (typeof collectionSyncBuilderShellState === 'function') collectionSyncBuilderShellState();
        return;
      }

      var shellManager = typeof collectionGetBuilderShellManager === 'function' ? collectionGetBuilderShellManager() : null;
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

      var activeTab = shellManager ? shellManager.getInspectorTab() : 'general';
      if (['general', 'inputs', 'outputs'].indexOf(activeTab) < 0) activeTab = 'general';

      if (tabsContainer) tabsContainer.innerHTML = this.renderTabs(activeTab, scalarInputs.length, outputs.length);

      if (activeTab === 'inputs') {
        container.innerHTML = this.renderInputsTab(scalarInputs, repeatableInputs, scenario, shellManager);
      } else if (activeTab === 'outputs') {
        container.innerHTML = this.renderOutputsTab(outputs, groupKey, shellManager);
      } else {
        container.innerHTML = this.renderGeneralTab(selectedItem);
      }

      if (footerContainer) footerContainer.innerHTML = this.renderFooter();

      this.options.restoreInspectorState(container, inspectorState);
      if (typeof collectionSyncBuilderShellState === 'function') collectionSyncBuilderShellState();
    }

    /**
     * Dibuja la barra de tabs (General / Entradas / Salidas) con contadores discretos.
     */
    renderTabs(activeTab, inputsCount, outputsCount) {
      var tabs = [
        { key: 'general', label: 'General' },
        { key: 'inputs', label: 'Entradas', count: inputsCount },
        { key: 'outputs', label: 'Salidas', count: outputsCount }
      ];

      return tabs.map(function renderTab(tab) {
        var isActive = tab.key === activeTab;
        return '<button type="button" class="collection-inspector-tab' + (isActive ? ' collection-inspector-tab-active' : '') +
          '" aria-selected="' + (isActive ? 'true' : 'false') + '" onclick="collectionSetInspectorTab(\'' + tab.key + '\')">' +
          '<span>' + tab.label + '</span>' +
          (typeof tab.count === 'number' ? '<span class="collection-inspector-tab-count">' + tab.count + '</span>' : '') +
        '</button>';
      }).join('');
    }

    /**
     * Tab General: descripcion breve y URL de ejecucion (solo lectura, con copiar).
     */
    renderGeneralTab(selectedItem) {
      var description = describeStep(selectedItem);
      var executionUrl = this.options.buildSelectedItemExecutionUrl();

      return '<div class="collection-inspector-field">' +
          '<label class="collection-inspector-label">Descripcion</label>' +
          (description
            ? '<textarea class="collection-inspector-textarea" rows="3" readonly>' + this.options.escapeHtml(description) + '</textarea>'
            : '<div class="collection-inspector-empty-inline">Sin descripcion disponible en Swagger.</div>') +
        '</div>' +
        '<div class="collection-inspector-field">' +
          '<label class="collection-inspector-label">URL de ejecucion</label>' +
          '<div class="collection-inspector-url-row" title="' + this.options.escapeHtml(executionUrl || '') + '">' +
            '<div id="collection-step-url-preview" class="collection-inspector-url">' + this.options.escapeHtml(executionUrl || 'Sin URL para mostrar.') + '</div>' +
            '<button type="button" class="collection-inspector-copy-btn" onclick="collectionCopyExecutionUrl(this)" ' + (executionUrl ? '' : 'disabled') + '>Copiar</button>' +
          '</div>' +
        '</div>';
    }

    /**
     * Tab Entradas: acordeon compacto, una entrada abierta a la vez.
     */
    renderInputsTab(scalarInputs, repeatableInputs, scenario, shellManager) {
      if (!scalarInputs.length) {
        return '<div class="collection-inspector-empty-state">Este paso no necesita variables manuales simples.</div>' +
          this.renderRepeatableNotice(repeatableInputs);
      }

      return scalarInputs.map(function renderRow(input) {
        return this.renderInputAccordionRow(input, scenario, shellManager);
      }, this).join('') + this.renderRepeatableNotice(repeatableInputs);
    }

    /**
     * Aviso compacto para listas/estructuras repetibles (motor actual, sin edicion visual fina todavia).
     */
    renderRepeatableNotice(repeatableInputs) {
      if (!repeatableInputs.length) return '';
      return '<div class="collection-inspector-notice">Este paso tiene ' + repeatableInputs.length + ' campo(s) complejos/repetibles. Se siguen resolviendo con el motor actual; la edicion visual fina queda para una proxima iteracion.</div>';
    }

    /**
     * Una fila-acordeon de entrada: cerrada muestra nombre + tipo, abierta expone origen del valor.
     */
    renderInputAccordionRow(input, scenario, shellManager) {
      var mappingKey = input.mappingKey || '';
      var isExpanded = !!(shellManager && shellManager.isInspectorInputExpanded(mappingKey));
      var mappingConfig = mappingKey ? this.options.inputMappingConfig(mappingKey) : null;
      var mappedSource = mappingConfig ? mappingConfig.sourceVarKey : '';
      var mappedOption = mappedSource ? this.options.findSourceOption(input, mappedSource) : null;
      var filterField = mappingConfig ? (mappingConfig.filterField || '') : '';
      var filterValue = mappingConfig ? (mappingConfig.filterValue || '') : '';
      var currentValue = this.options.selectedItemInputValue(input.key, input.defaultValue || '');
      var description = String(input.description || '').trim();

      if (mappingKey && mappingConfig && mappedOption && mappedOption.isCollectionItemOutput) {
        // Se persiste la metadata de coleccion para que el motor sepa como resolver listas.
        mappingConfig.collectionPathLabel = mappedOption.collectionPathLabel || '';
        mappingConfig.itemPathLabel = mappedOption.itemPathLabel || '';
        if (!scenario.inputMappings) scenario.inputMappings = {};
        scenario.inputMappings[mappingKey] = mappingConfig;
      }

      var escapedMappingKey = this.options.escapeHtml(mappingKey);

      return '<div class="collection-inspector-accordion' + (isExpanded ? ' collection-inspector-accordion-open' : '') + '">' +
        '<button type="button" class="collection-inspector-accordion-head" aria-expanded="' + (isExpanded ? 'true' : 'false') + '" onclick="collectionToggleInspectorInput(\'' + escapedMappingKey + '\')">' +
          '<span class="collection-inspector-accordion-title">' +
            '<span class="collection-inspector-accordion-name">' + this.options.escapeHtml(this.options.inputDisplayName(input)) + '</span>' +
            (input.type ? '<span class="collection-inspector-type-tag">' + this.options.escapeHtml(input.type) + '</span>' : '') +
          '</span>' +
          '<span class="collection-inspector-accordion-chevron" aria-hidden="true">&#9656;</span>' +
        '</button>' +
        (description ? '<div class="collection-inspector-accordion-summary">' + this.options.escapeHtml(description) + '</div>' : '') +
        (isExpanded ? '<div class="collection-inspector-accordion-body">' +
          '<div class="collection-inspector-field">' +
            '<label class="collection-inspector-label">Nombre funcional</label>' +
            '<input data-inspector-key="' + this.options.escapeHtml('input-alias:' + mappingKey) + '" class="collection-inspector-input" type="text" value="' + this.options.escapeHtml(input.alias || '') + '" placeholder="Nombre funcional para match" oninput="collectionUpdateInputAlias(\'' + escapedMappingKey + '\', this.value)">' +
          '</div>' +
          '<div class="collection-inspector-field">' +
            '<label class="collection-inspector-label">Origen del valor</label>' +
            this.renderSourcePicker(mappingKey, input.sourceOptions || [], mappedSource) +
          '</div>' +
          (mappedOption && mappedOption.isCollectionItemOutput ? this.renderCollectionFilterBox(mappingKey, mappedOption, filterField, filterValue) : '') +
          '<div class="collection-inspector-field">' +
            '<label class="collection-inspector-label">Valor</label>' +
            '<input id="' + this.options.escapeHtml(this.options.domId(input.key)) + '" data-inspector-key="' + this.options.escapeHtml('input-value:' + input.key) + '" data-collection-input-key="' + this.options.escapeHtml(input.key) + '" class="collection-inspector-input" type="text" value="' + this.options.escapeHtml(currentValue) + '" oninput="collectionUpdateVar(\'' + this.options.escapeHtml(input.key) + '\', this.value)"' + (mappedSource ? ' disabled' : '') + '>' +
          '</div>' +
        '</div>' : '') +
      '</div>';
    }

    /**
     * Dibuja el selector de "Origen del valor": un boton que despliega los pasos
     * anteriores colapsados (por defecto), para no tirar una lista gigante de una.
     */
    renderSourcePicker(mappingKey, sourceOptions, mappedSource) {
      var shellManager = typeof collectionGetBuilderShellManager === 'function' ? collectionGetBuilderShellManager() : null;
      var isOpen = !!(shellManager && shellManager.getOpenSourcePicker() === mappingKey);
      var escapedMappingKey = this.options.escapeHtml(mappingKey);
      var mappedOption = mappedSource ? this.options.findSourceOption({ sourceOptions: sourceOptions }, mappedSource) : null;
      var currentLabel = mappedOption ? this.options.outputDisplayName(mappedOption) : 'Valor manual';

      var groups = [];
      var groupsByLabel = {};
      sourceOptions.forEach(function bucketOption(option) {
        var label = option.sourceLabel || 'Otro paso';
        if (!groupsByLabel[label]) {
          groupsByLabel[label] = { label: label, options: [] };
          groups.push(groupsByLabel[label]);
        }
        groupsByLabel[label].options.push(option);
      });

      var html = '<div class="collection-inspector-source-picker">' +
        '<button type="button" data-inspector-key="' + this.options.escapeHtml('input-map-trigger:' + mappingKey) + '" class="collection-inspector-source-trigger" aria-expanded="' + (isOpen ? 'true' : 'false') + '" onclick="collectionToggleSourcePicker(\'' + escapedMappingKey + '\')">' +
          '<span class="collection-inspector-source-trigger-label">' + this.options.escapeHtml(currentLabel) + '</span>' +
          '<span class="collection-inspector-source-trigger-chevron" aria-hidden="true">&#9662;</span>' +
        '</button>';

      if (isOpen) {
        html += '<div class="collection-inspector-source-popover">' +
          '<button type="button" class="collection-inspector-source-option' + (!mappedSource ? ' collection-inspector-source-option-selected' : '') + '" onclick="collectionSelectInputSource(\'' + escapedMappingKey + '\', \'\')">Valor manual</button>';

        if (!groups.length) {
          html += '<div class="collection-inspector-source-empty">No hay pasos anteriores con salidas disponibles todavia.</div>';
        } else {
          html += groups.map(function renderGroup(group) {
            var groupExpanded = !!(shellManager && shellManager.isSourceGroupExpanded(mappingKey, group.label));
            var escapedGroupLabel = this.options.escapeHtml(group.label);

            return '<div class="collection-inspector-source-group' + (groupExpanded ? ' collection-inspector-source-group-open' : '') + '">' +
              '<button type="button" class="collection-inspector-source-group-head" aria-expanded="' + (groupExpanded ? 'true' : 'false') + '" onclick="collectionToggleSourceGroup(\'' + escapedMappingKey + '\', \'' + escapedGroupLabel + '\')">' +
                '<span class="collection-inspector-source-group-chevron" aria-hidden="true">&#9656;</span>' +
                '<span class="collection-inspector-source-group-name">' + escapedGroupLabel + '</span>' +
                '<span class="collection-inspector-source-group-count">' + group.options.length + '</span>' +
              '</button>' +
              (groupExpanded ? '<div class="collection-inspector-source-group-body">' +
                group.options.map(function renderOption(option) {
                  var isSelected = mappedSource === option.sourceVarKey;
                  return '<button type="button" class="collection-inspector-source-option' + (isSelected ? ' collection-inspector-source-option-selected' : '') + '" onclick="collectionSelectInputSource(\'' + escapedMappingKey + '\', \'' + this.options.escapeHtml(option.sourceVarKey) + '\')">' + this.options.escapeHtml(this.options.outputDisplayName(option)) + '</button>';
                }, this).join('') +
              '</div>' : '') +
            '</div>';
          }, this).join('');
        }

        html += '</div>';
      }

      html += '</div>';
      return html;
    }

    /**
     * Ayuda plegable para elegir un item concreto dentro de una lista origen.
     */
    renderCollectionFilterBox(mappingKey, mappedOption, filterField, filterValue) {
      var escapedMappingKey = this.options.escapeHtml(mappingKey);
      return '<details class="collection-inspector-help">' +
        '<summary>Elegir un elemento de una coleccion</summary>' +
        '<div class="collection-inspector-help-body">' +
          '<p>La salida viene de una coleccion. Elegi que registro tomar antes de pasarlo a este input.</p>' +
          '<div class="collection-inspector-filter-grid">' +
            '<select data-inspector-key="' + this.options.escapeHtml('input-filter-field:' + mappingKey) + '" class="collection-inspector-select" onchange="collectionUpdateInputMappingFilterField(\'' + escapedMappingKey + '\', this.value)"><option value="">Sin filtro (primer item util)</option>' +
              (mappedOption.filterFieldOptions || []).map(function renderFilterOption(option) {
                var selected = filterField === option.value ? ' selected' : '';
                return '<option value="' + this.options.escapeHtml(option.value) + '"' + selected + '>' + this.options.escapeHtml(option.label) + '</option>';
              }, this).join('') + '</select>' +
            '<input data-inspector-key="' + this.options.escapeHtml('input-filter-value:' + mappingKey) + '" class="collection-inspector-input" type="text" placeholder="Valor esperado" value="' + this.options.escapeHtml(filterValue) + '" oninput="collectionUpdateInputMappingFilterValue(\'' + escapedMappingKey + '\', this.value)">' +
          '</div>' +
        '</div>' +
      '</details>';
    }

    /**
     * Tab Salidas: buscador + filas compactas, una salida abierta a la vez.
     */
    renderOutputsTab(outputs, groupKey, shellManager) {
      var configuredCount = outputs.filter(function isConfigured(output) { return !!output.alias; }).length;
      var progressLine = outputs.length
        ? '<div class="collection-inspector-progress">' + configuredCount + ' de ' + outputs.length + ' salidas configuradas</div>'
        : '';

      if (!outputs.length) {
        return '<div class="collection-inspector-empty-state">Swagger no expuso salidas simples para este metodo.</div>';
      }

      var searchTerm = (shellManager ? shellManager.getOutputSearchTerm(groupKey) : '').toLowerCase().trim();
      var visibleOutputs = outputs.filter(function matchSearch(output) {
        if (!searchTerm) return true;
        var haystack = [output.pathLabel, output.displayLabel, output.sourceVarKey, output.alias].join(' ').toLowerCase();
        return haystack.indexOf(searchTerm) >= 0;
      });

      var listHtml = visibleOutputs.length
        ? visibleOutputs.map(function renderRow(output) { return this.renderOutputAccordionRow(output, shellManager); }, this).join('')
        : '<div class="collection-inspector-empty-state">No encontramos salidas con ese criterio.</div>';

      return '<div class="collection-inspector-output-search-wrap">' +
          '<span class="collection-inspector-search-icon">&#128269;</span>' +
          '<input type="text" class="collection-inspector-search-input" placeholder="Buscar salida..." value="' + this.options.escapeHtml(shellManager ? shellManager.getOutputSearchTerm(groupKey) : '') + '" oninput="collectionSetOutputSearchTerm(\'' + this.options.escapeHtml(groupKey) + '\', this.value)">' +
        '</div>' +
        progressLine +
        listHtml;
    }

    /**
     * Una fila-acordeon de salida: cerrada muestra nombre + tipo, abierta permite renombrarla.
     */
    renderOutputAccordionRow(output, shellManager) {
      var isExpanded = !!(shellManager && shellManager.isInspectorOutputExpanded(output.sourceVarKey));
      var escapedKey = this.options.escapeHtml(output.sourceVarKey);

      return '<div class="collection-inspector-accordion' + (isExpanded ? ' collection-inspector-accordion-open' : '') + '">' +
        '<button type="button" class="collection-inspector-accordion-head" aria-expanded="' + (isExpanded ? 'true' : 'false') + '" onclick="collectionToggleInspectorOutput(\'' + escapedKey + '\')">' +
          '<span class="collection-inspector-accordion-title">' +
            '<span class="collection-inspector-accordion-name">' + this.options.escapeHtml(this.options.outputDisplayName(output)) + '</span>' +
            (output.type ? '<span class="collection-inspector-type-tag">' + this.options.escapeHtml(output.type) + '</span>' : '') +
          '</span>' +
          '<span class="collection-inspector-accordion-chevron" aria-hidden="true">&#9656;</span>' +
        '</button>' +
        (isExpanded ? '<div class="collection-inspector-accordion-body">' +
          '<div class="collection-inspector-static-value">Ruta: ' + this.options.escapeHtml(output.pathLabel || output.displayLabel || output.sourceVarKey) + '</div>' +
          '<div class="collection-inspector-field">' +
            '<label class="collection-inspector-label">Nombre funcional</label>' +
            '<input data-inspector-key="' + this.options.escapeHtml('output-alias:' + output.sourceVarKey) + '" class="collection-inspector-input" type="text" value="' + this.options.escapeHtml(output.alias || '') + '" placeholder="Renombre funcional" oninput="collectionUpdateOutputAlias(\'' + escapedKey + '\', this.value)">' +
          '</div>' +
        '</div>' : '') +
      '</div>';
    }

    /**
     * Footer sticky: solo estado (autoguardado), sin botones que no aportan una accion distinta.
     */
    renderFooter() {
      return '<span class="collection-inspector-save-status collection-inspector-save-status-ok"><span class="collection-inspector-save-dot"></span>Guardado</span>';
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionInspectorManager = CollectionInspectorManager;
})(window);
