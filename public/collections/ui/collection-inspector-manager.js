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
   * Separa el prefijo tecnico (metodo + ubicacion: body/query/path/header)
   * de un pathLabel crudo y devuelve solo los segmentos reales del SDT/
   * parametro (ej. "simulate.body.simulationInput.branchId" -> ["simulationInput","branchId"]).
   * Misma idea que simplifyInputReference en collection-flow-lifecycle-manager.js;
   * se reimplementa acá en vez de reusarla para no acoplar este archivo al
   * wiring de collections.js (que hoy solo expone inputDisplayName/
   * outputDisplayName, ya resueltos con alias, no el path estructural puro
   * que necesita el armado del arbol de grupos).
   */
  function structuralPathSegments(rawPath) {
    var text = String(rawPath || '');
    var markers = ['.body.', '.query.', '.path.', '.header.'];
    for (var i = 0; i < markers.length; i++) {
      var position = text.indexOf(markers[i]);
      if (position >= 0) {
        text = text.slice(position + markers[i].length);
        break;
      }
    }
    return text ? text.split('.') : [];
  }

  /**
   * Arma el arbol real de un conjunto de campos (inputs o salidas, ambos
   * tienen la misma forma {pathLabel|key, alias?}) a partir de su path
   * tecnico: cada segmento que es un SDT anidado abre un grupo desplegable
   * propio (ej. "simulationInput" y, adentro, "fees"). Los segmentos "item"
   * que buildSwaggerBodyTemplate/collectSwaggerOutputFields insertan en
   * index.js para marcar "esto es un elemento de un array" nunca abren
   * grupo propio ni se muestran. Un array tampoco abre grupo propio (hoy
   * solo se edita/lee una fila asumida por array, ver renderRepeatableNotice,
   * que no cambia) — su nombre queda "pendiente" y se une con lo que sigue:
   * si es el campo final, se ve como "fee.feeId" (en vez de "fee.item.feeId");
   * si en cambio sigue habiendo otro SDT anidado (ej. la salida real de
   * "simulate" tiene installments.Installment[].fees.fee[], un array adentro
   * de otro array), ese SDT abre su propio grupo igual que cualquier otro y
   * el nombre del array pendiente se descarta (ya no hace falta para
   * distinguir nada, el propio grupo alcanza). `getAlias` gana sobre el
   * label calculado cuando el campo tiene un alias funcional definido — la
   * agrupacion en si sigue siendo puramente visual, no toca
   * mappingKey/key/pathLabel de ningun campo.
   */
  function buildFieldGroupTree(fields, getPath, getAlias) {
    var root = { path: '', children: {}, order: [], leaves: [] };

    fields.forEach(function bucketField(field) {
      var segments = structuralPathSegments(getPath(field));
      var alias = getAlias ? getAlias(field) : '';

      if (!segments.length) {
        root.leaves.push({ field: field, label: alias || String((field && (field.key || field.pathLabel)) || '') });
        return;
      }

      var node = root;
      var pendingArrayName = '';

      for (var i = 0; i < segments.length; i++) {
        var segment = segments[i];
        if (segment === 'item') continue;

        var isLastSegment = i === segments.length - 1;
        var isArrayName = segments[i + 1] === 'item';

        if (isLastSegment) {
          var label = pendingArrayName ? pendingArrayName + '.' + segment : segment;
          node.leaves.push({ field: field, label: alias || label });
          return;
        }

        if (isArrayName) {
          pendingArrayName = segment;
          continue;
        }

        if (!node.children[segment]) {
          node.children[segment] = {
            path: node.path ? node.path + '.' + segment : segment,
            children: {},
            order: [],
            leaves: []
          };
          node.order.push(segment);
        }
        node = node.children[segment];
        pendingArrayName = '';
      }
    });

    return root;
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
     * Tab Entradas: acordeon compacto para las hojas (una a la vez, ver
     * renderInputAccordionRow); los grupos (ver buildFieldGroupTree) pueden
     * estar varios abiertos a la vez y se anidan tantos niveles como el SDT
     * real tenga — ej. "simulationInput" y, adentro, "fees" — en vez de un
     * unico nivel plano. Esto es PURAMENTE visual: el arbol solo decide como
     * se dibuja; el mappingKey/input.key de cada campo (y por lo tanto la
     * asignacion de valor, el mapeo a otra salida, etc.) sigue siendo
     * exactamente el mismo que sin agrupar — ver renderInputAccordionRow,
     * que no cambio esa parte de su logica.
     */
    renderInputsTab(scalarInputs, repeatableInputs, scenario, shellManager) {
      if (!scalarInputs.length) {
        return '<div class="collection-inspector-empty-state">Este paso no necesita variables manuales simples.</div>' +
          this.renderRepeatableNotice(repeatableInputs);
      }

      var self = this;
      var tree = buildFieldGroupTree(
        scalarInputs,
        function(input) { return input.pathLabel || input.key; },
        function(input) { return input.alias || ''; }
      );

      return this.renderGroupTree(tree, 'in', shellManager, function renderLeaf(leaf) {
        return self.renderInputAccordionRow(leaf.field, scenario, shellManager, leaf.label);
      }) + this.renderRepeatableNotice(repeatableInputs);
    }

    /**
     * Recorre un nodo del arbol (ver buildFieldGroupTree): un acordeon
     * exterior por cada grupo hijo (recursivo — un SDT puede tener otro SDT
     * anidado adentro) y renderLeaf() para cada campo final de ese nivel.
     * Reusa el mismo mecanismo de persistencia de "abierto/cerrado" que ya
     * existia solo para el primer nivel de inputs
     * (isInspectorInputGroupExpanded/collectionToggleInspectorInputGroup) en
     * vez de duplicarlo — es solo un Set de claves de texto arbitrarias, no
     * tiene nada especifico de inputs. `namespace` ("in"/"out") + el path
     * completo del grupo evita que dos grupos con el mismo nombre (ej.
     * "fees" en Entradas y en Salidas, o en dos operaciones distintas)
     * compartan estado expandido/colapsado entre si.
     */
    renderGroupTree(node, namespace, shellManager, renderLeaf) {
      var self = this;
      var html = '';

      node.order.forEach(function renderChildGroup(segment) {
        var child = node.children[segment];
        var groupKey = namespace + ':' + child.path;
        var isExpanded = !!(shellManager && shellManager.isInspectorInputGroupExpanded(groupKey));
        var escapedGroupKey = self.options.escapeHtml(groupKey);
        var escapedSegment = self.options.escapeHtml(segment);

        html += '<div class="collection-inspector-accordion collection-inspector-input-group' + (isExpanded ? ' collection-inspector-accordion-open' : '') + '">' +
          '<button type="button" class="collection-inspector-accordion-head" aria-expanded="' + (isExpanded ? 'true' : 'false') + '" onclick="collectionToggleInspectorInputGroup(\'' + escapedGroupKey + '\')">' +
            '<span class="collection-inspector-accordion-title">' +
              '<span class="collection-inspector-accordion-name" title="' + escapedSegment + '">' + escapedSegment + '</span>' +
            '</span>' +
            '<span class="collection-inspector-accordion-chevron" aria-hidden="true">&#9656;</span>' +
          '</button>' +
          (isExpanded ? '<div class="collection-inspector-input-group-children">' +
            self.renderGroupTree(child, namespace, shellManager, renderLeaf) +
          '</div>' : '') +
        '</div>';
      });

      node.leaves.forEach(function renderLeafRow(leaf) {
        html += renderLeaf(leaf);
      });

      return html;
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
     *
     * `label` ya viene calculado por buildFieldGroupTree (el path real
     * dentro de su grupo, ej. "fee.feeId", o el alias si el usuario definio
     * uno) — esta fila solo lo muestra, no decide nada de agrupamiento. No
     * afecta mappingKey, input.key, ni ningun otro dato usado para asignar o
     * mapear el valor — todo eso sigue leyendo del `input` real, sin cambios.
     */
    renderInputAccordionRow(input, scenario, shellManager, label) {
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

      var escapedRowLabel = this.options.escapeHtml(label);

      return '<div class="collection-inspector-accordion' + (isExpanded ? ' collection-inspector-accordion-open' : '') + '">' +
        '<button type="button" class="collection-inspector-accordion-head" aria-expanded="' + (isExpanded ? 'true' : 'false') + '" onclick="collectionToggleInspectorInput(\'' + escapedMappingKey + '\')">' +
          '<span class="collection-inspector-accordion-title">' +
            '<span class="collection-inspector-accordion-name" title="' + escapedRowLabel + '">' + escapedRowLabel + '</span>' +
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
          // Secciones colapsables en vez de scroll continuo: "Origen del valor"
          // arranca abierta (es la config principal), "Filtro" tambien cuando
          // aplica (solo se ve si el origen mapeado es una coleccion), y
          // "Salidas disponibles" arranca cerrada (es solo consulta rapida de
          // que hay para elegir, no una accion que se use en cada visita).
          this.renderConfigSubsection('Origen del valor', this.renderSourcePicker(mappingKey, input.sourceOptions || [], mappedSource), true) +
          (mappedOption && mappedOption.isCollectionItemOutput
            ? this.renderConfigSubsection('Filtro de coleccion', this.renderCollectionFilterBoxBody(mappingKey, mappedOption, filterField, filterValue), true)
            : '') +
          ((input.sourceOptions || []).length
            ? this.renderConfigSubsection('Salidas disponibles', this.renderAvailableSourcesSummary(input.sourceOptions), false)
            : '') +
          '<div class="collection-inspector-field">' +
            '<label class="collection-inspector-label">Valor</label>' +
            '<input id="' + this.options.escapeHtml(this.options.domId(input.key)) + '" data-inspector-key="' + this.options.escapeHtml('input-value:' + input.key) + '" data-collection-input-key="' + this.options.escapeHtml(input.key) + '" class="collection-inspector-input" type="text" value="' + this.options.escapeHtml(currentValue) + '" oninput="collectionUpdateVar(\'' + this.options.escapeHtml(input.key) + '\', this.value)"' + (mappedSource ? ' disabled' : '') + '>' +
          '</div>' +
        '</div>' : '') +
      '</div>';
    }

    /**
     * Envuelve contenido del panel "Configurar paso" en un <details> chico,
     * visualmente consistente entre secciones, para agrupar en acordeones
     * en vez de un solo bloque largo. `openByDefault` controla si arranca
     * expandida (secciones de configuracion activa) o cerrada (referencias
     * de solo consulta, como "Salidas disponibles").
     */
    renderConfigSubsection(title, bodyHtml, openByDefault) {
      return '<details class="collection-inspector-subsection"' + (openByDefault ? ' open' : '') + '>' +
        '<summary class="collection-inspector-subsection-head">' + this.options.escapeHtml(title) + '</summary>' +
        '<div class="collection-inspector-subsection-body">' + bodyHtml + '</div>' +
      '</details>';
    }

    /**
     * Lista de solo lectura de las salidas de pasos anteriores disponibles
     * para mapear en este input, agrupadas por paso de origen — para poder
     * consultar "que hay para elegir" sin necesidad de abrir el selector de
     * "Origen del valor" (que ademas cambia la seleccion actual al tocarlo).
     */
    renderAvailableSourcesSummary(sourceOptions) {
      if (!sourceOptions || !sourceOptions.length) {
        return '<div class="collection-inspector-static-value">Todavia no hay salidas de pasos anteriores disponibles.</div>';
      }

      var order = [];
      var groupsByLabel = {};
      sourceOptions.forEach(function bucketOption(option) {
        var label = option.sourceLabel || 'Otro paso';
        if (!groupsByLabel[label]) { groupsByLabel[label] = []; order.push(label); }
        groupsByLabel[label].push(option);
      });

      return order.map(function renderGroup(label) {
        return '<div class="collection-inspector-source-summary-group">' +
          '<div class="collection-inspector-source-summary-title">' + this.options.escapeHtml(label) + '</div>' +
          groupsByLabel[label].map(function renderItem(option) {
            var name = this.options.outputDisplayName(option);
            return '<div class="collection-inspector-source-summary-item" title="' + this.options.escapeHtml(name) + '">' + this.options.escapeHtml(name) + '</div>';
          }, this).join('') +
        '</div>';
      }, this).join('');
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
          '<span class="collection-inspector-source-trigger-label" title="' + this.options.escapeHtml(currentLabel) + '">' + this.options.escapeHtml(currentLabel) + '</span>' +
          '<span class="collection-inspector-source-trigger-chevron" aria-hidden="true">&#9662;</span>' +
        '</button>';

      if (isOpen) {
        html += '<div class="collection-inspector-source-popover">' +
          '<button type="button" class="collection-inspector-source-option' + (!mappedSource ? ' collection-inspector-source-option-selected' : '') + '" title="Valor manual" onclick="collectionSelectInputSource(\'' + escapedMappingKey + '\', \'\')">Valor manual</button>';

        if (!groups.length) {
          html += '<div class="collection-inspector-source-empty">No hay pasos anteriores con salidas disponibles todavia.</div>';
        } else {
          html += groups.map(function renderGroup(group) {
            var groupExpanded = !!(shellManager && shellManager.isSourceGroupExpanded(mappingKey, group.label));
            var escapedGroupLabel = this.options.escapeHtml(group.label);

            return '<div class="collection-inspector-source-group' + (groupExpanded ? ' collection-inspector-source-group-open' : '') + '">' +
              '<button type="button" class="collection-inspector-source-group-head" aria-expanded="' + (groupExpanded ? 'true' : 'false') + '" onclick="collectionToggleSourceGroup(\'' + escapedMappingKey + '\', \'' + escapedGroupLabel + '\')">' +
                '<span class="collection-inspector-source-group-chevron" aria-hidden="true">&#9656;</span>' +
                '<span class="collection-inspector-source-group-name" title="' + escapedGroupLabel + '">' + escapedGroupLabel + '</span>' +
                '<span class="collection-inspector-source-group-count">' + group.options.length + '</span>' +
              '</button>' +
              (groupExpanded ? '<div class="collection-inspector-source-group-body">' +
                group.options.map(function renderOption(option) {
                  var isSelected = mappedSource === option.sourceVarKey;
                  var escapedOptionName = this.options.escapeHtml(this.options.outputDisplayName(option));
                  return '<button type="button" class="collection-inspector-source-option' + (isSelected ? ' collection-inspector-source-option-selected' : '') + '" title="' + escapedOptionName + '" onclick="collectionSelectInputSource(\'' + escapedMappingKey + '\', \'' + this.options.escapeHtml(option.sourceVarKey) + '\')">' + escapedOptionName + '</button>';
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
     * Contenido del filtro de coleccion (sin envoltorio propio): el
     * envoltorio colapsable lo pone renderConfigSubsection desde el
     * llamador, para que "Filtro de coleccion" luzca igual que las otras
     * secciones del panel en vez de un <details> anidado aparte.
     */
    renderCollectionFilterBoxBody(mappingKey, mappedOption, filterField, filterValue) {
      var escapedMappingKey = this.options.escapeHtml(mappingKey);
      return '<p class="collection-inspector-subsection-hint">La salida viene de una coleccion. Elegi que registro tomar antes de pasarlo a este input.</p>' +
        '<div class="collection-inspector-filter-grid">' +
          '<select data-inspector-key="' + this.options.escapeHtml('input-filter-field:' + mappingKey) + '" class="collection-inspector-select" onchange="collectionUpdateInputMappingFilterField(\'' + escapedMappingKey + '\', this.value)"><option value="">Sin filtro (primer item util)</option>' +
            (mappedOption.filterFieldOptions || []).map(function renderFilterOption(option) {
              var selected = filterField === option.value ? ' selected' : '';
              return '<option value="' + this.options.escapeHtml(option.value) + '"' + selected + '>' + this.options.escapeHtml(option.label) + '</option>';
            }, this).join('') + '</select>' +
          '<input data-inspector-key="' + this.options.escapeHtml('input-filter-value:' + mappingKey) + '" class="collection-inspector-input" type="text" placeholder="Valor esperado" value="' + this.options.escapeHtml(filterValue) + '" oninput="collectionUpdateInputMappingFilterValue(\'' + escapedMappingKey + '\', this.value)">' +
        '</div>';
    }

    /**
     * Tab Salidas: buscador + arbol de acordeones, mismo criterio que
     * Entradas (ver renderInputsTab/buildFieldGroupTree). La salida de
     * "simulate" no son 123 campos sueltos: es UN sdt ("simulationOutput")
     * con 123 campos adentro, asi que se muestra igual que un input —
     * desplegable, un nivel por SDT anidado — aunque conceptualmente sea
     * una salida en vez de una entrada.
     */
    renderOutputsTab(outputs, groupKey, shellManager) {
      var configuredCount = outputs.filter(function isConfigured(output) { return !!output.alias; }).length;
      var progressLine = outputs.length
        ? '<div class="collection-inspector-progress">' + configuredCount + ' de ' + outputs.length + ' salidas configuradas</div>'
        : '';

      if (!outputs.length) {
        return '<div class="collection-inspector-empty-state">Swagger no expuso salidas simples para este metodo.</div>';
      }

      var self = this;
      var searchTerm = (shellManager ? shellManager.getOutputSearchTerm(groupKey) : '').toLowerCase().trim();
      var visibleOutputs = outputs.filter(function matchSearch(output) {
        if (!searchTerm) return true;
        var haystack = [output.pathLabel, output.displayLabel, output.sourceVarKey, output.alias].join(' ').toLowerCase();
        return haystack.indexOf(searchTerm) >= 0;
      });

      var listHtml;
      if (!visibleOutputs.length) {
        listHtml = '<div class="collection-inspector-empty-state">No encontramos salidas con ese criterio.</div>';
      } else {
        var tree = buildFieldGroupTree(
          visibleOutputs,
          function(output) { return output.pathLabel || output.displayLabel || output.sourceVarKey; },
          function(output) { return output.alias || ''; }
        );
        listHtml = this.renderGroupTree(tree, 'out', shellManager, function renderLeaf(leaf) {
          return self.renderOutputAccordionRow(leaf.field, shellManager, leaf.label);
        });
      }

      return '<div class="collection-inspector-output-search-wrap">' +
          '<span class="collection-inspector-search-icon">&#128269;</span>' +
          '<input type="text" class="collection-inspector-search-input" placeholder="Buscar salida..." value="' + this.options.escapeHtml(shellManager ? shellManager.getOutputSearchTerm(groupKey) : '') + '" oninput="collectionSetOutputSearchTerm(\'' + this.options.escapeHtml(groupKey) + '\', this.value)">' +
        '</div>' +
        progressLine +
        listHtml;
    }

    /**
     * Una fila-acordeon de salida: cerrada muestra nombre + tipo, abierta permite renombrarla.
     *
     * `label` ya viene calculado por buildFieldGroupTree (el path real
     * dentro de su grupo, ej. "fee.feeId", o el alias si el usuario definio
     * uno) — igual que renderInputAccordionRow, esta fila solo lo muestra.
     */
    renderOutputAccordionRow(output, shellManager, label) {
      var isExpanded = !!(shellManager && shellManager.isInspectorOutputExpanded(output.sourceVarKey));
      var escapedKey = this.options.escapeHtml(output.sourceVarKey);
      var escapedOutputName = this.options.escapeHtml(label);

      return '<div class="collection-inspector-accordion' + (isExpanded ? ' collection-inspector-accordion-open' : '') + '">' +
        '<button type="button" class="collection-inspector-accordion-head" aria-expanded="' + (isExpanded ? 'true' : 'false') + '" onclick="collectionToggleInspectorOutput(\'' + escapedKey + '\')">' +
          '<span class="collection-inspector-accordion-title">' +
            '<span class="collection-inspector-accordion-name" title="' + escapedOutputName + '">' + escapedOutputName + '</span>' +
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
    /**
     * Indicador de guardado: vive arriba del panel (ver panel.html, junto al
     * titulo), con icono + texto en vez de solo un punto de color, para que
     * se note sin depender unicamente del color.
     */
    renderFooter() {
      return '<span class="collection-inspector-save-status collection-inspector-save-status-ok">' +
        '<span class="collection-inspector-save-icon" aria-hidden="true">&#10003;</span>Guardado' +
      '</span>';
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionInspectorManager = CollectionInspectorManager;
})(window);
