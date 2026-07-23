(function bootstrapCollectionCanvasManager(global) {
  'use strict';

  var GENERIC_DESCRIPTIONS = ['', 'enter a description', 'sin descripcion', 'sin descripcion.', 'sin descripción'];

  /**
   * Filtra descripciones vacias o placeholders tecnicos (ej. "Enter a description")
   * para no mostrarlas tal cual en la tarjeta del nodo.
   */
  function describeCanvasItem(item) {
    var raw = String((item && (item.summary || item.path)) || '').trim();
    if (!raw || GENERIC_DESCRIPTIONS.indexOf(raw.toLowerCase()) >= 0) return '';
    return raw;
  }

  /**
   * Encapsula toda la construcciÃ³n visual del canvas de cadenas.
   * Este mÃ³dulo no decide reglas de negocio profundas: se apoya en callbacks
   * del builder principal para leer estado, mappings y acciones.
   */
  class CollectionCanvasManager {
    /**
     * Recibe un paquete de dependencias para no acoplarse al scope global.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Construye el texto que aparece sobre una flecha del canvas.
     * Resume quÃ© outputs del paso origen estÃ¡n siendo usados por el paso destino.
     */
    buildCanvasLinkText(sourceItem, sourceIndex, targetItem, targetIndex, scenario) {
      if (!scenario) return 'Flujo';

      var sourceGroupKey = this.options.buildCanvasGroupKey(sourceItem, sourceIndex);
      var targetGroupKey = this.options.buildCanvasGroupKey(targetItem, targetIndex);
      var outputsByKey = {};

      // Se indexan las salidas por su clave tÃ©cnica para poder resolver mappings rÃ¡pido.
      (scenario.previewOutputs || []).forEach(function indexOutput(output) {
        outputsByKey[output.sourceVarKey] = output;
      });

      var mappings = (scenario.previewVariables || []).filter(function keepTargetInputs(input) {
        if (input.groupKey !== targetGroupKey || !input.mappingKey) return false;

        var config = this.options.inputMappingConfig(input.mappingKey);
        if (!config || !config.sourceVarKey) return false;

        var sourceOption = outputsByKey[config.sourceVarKey];
        return sourceOption && sourceOption.sourceGroupKey === sourceGroupKey;
      }, this).map(function mapToFriendlyLabel(input) {
        var config = this.options.inputMappingConfig(input.mappingKey);
        var sourceOption = outputsByKey[config.sourceVarKey];
        return this.options.outputDisplayName(sourceOption) + ' -> ' + this.options.inputDisplayName(input);
      }, this);

      if (!mappings.length) return 'Flujo';
      if (mappings.length === 1) return mappings[0];
      if (mappings.length === 2) return mappings.join(' | ');
      return mappings[0] + ' | ' + mappings[1] + ' +' + (mappings.length - 2);
    }

    /**
     * Calcula una ruta ortogonal simple entre dos nodos del canvas.
     * Esto mantiene las flechas prolijas y mÃ¡s cercanas a un diagrama tipo MER.
     */
    buildOrthogonalCanvasPath(sourceElement, targetElement) {
      var sourceRect = {
        left: sourceElement.offsetLeft,
        top: sourceElement.offsetTop,
        width: sourceElement.offsetWidth,
        height: sourceElement.offsetHeight
      };
      var targetRect = {
        left: targetElement.offsetLeft,
        top: targetElement.offsetTop,
        width: targetElement.offsetWidth,
        height: targetElement.offsetHeight
      };

      var sourceCenterX = sourceRect.left + (sourceRect.width / 2);
      var sourceCenterY = sourceRect.top + (sourceRect.height / 2);
      var targetCenterX = targetRect.left + (targetRect.width / 2);
      var targetCenterY = targetRect.top + (targetRect.height / 2);

      // Se compara el desvÃ­o horizontal contra el vertical para elegir la mejor forma.
      var horizontalBias = Math.abs(targetCenterX - sourceCenterX) > Math.abs(targetCenterY - sourceCenterY);

      if (horizontalBias) {
        var startX = targetCenterX >= sourceCenterX ? (sourceRect.left + sourceRect.width) : sourceRect.left;
        var startY = sourceCenterY;
        var endX = targetCenterX >= sourceCenterX ? targetRect.left : (targetRect.left + targetRect.width);
        var endY = targetCenterY;
        var midX = startX + ((endX - startX) / 2);

        return {
          path: 'M ' + startX + ' ' + startY + ' L ' + midX + ' ' + startY + ' L ' + midX + ' ' + endY + ' L ' + endX + ' ' + endY,
          startX: startX,
          startY: startY,
          endX: endX,
          endY: endY,
          labelX: midX,
          labelY: startY + ((endY - startY) / 2)
        };
      }

      var startXVertical = sourceCenterX;
      var startYVertical = targetCenterY >= sourceCenterY ? (sourceRect.top + sourceRect.height) : sourceRect.top;
      var endXVertical = targetCenterX;
      var endYVertical = targetCenterY >= sourceCenterY ? targetRect.top : (targetRect.top + targetRect.height);
      var midY = startYVertical + ((endYVertical - startYVertical) / 2);

      return {
        path: 'M ' + startXVertical + ' ' + startYVertical + ' L ' + startXVertical + ' ' + midY + ' L ' + endXVertical + ' ' + midY + ' L ' + endXVertical + ' ' + endYVertical,
        startX: startXVertical,
        startY: startYVertical,
        endX: endXVertical,
        endY: endYVertical,
        labelX: startXVertical + ((endXVertical - startXVertical) / 2),
        labelY: midY
      };
    }

    /**
     * Renderiza todas las flechas del canvas dentro del SVG superpuesto.
     * TambiÃ©n agrega los handles de ediciÃ³n y el Ã­cono para borrar enlaces.
     */
    renderCanvasConnections() {
      var scenario = this.options.getActiveScenario();
      var surface = document.getElementById('collection-canvas-surface');
      var svg = document.getElementById('collection-canvas-svg');
      if (!scenario || !surface || !svg) return;

      var connections = this.options.ensureScenarioConnections(scenario);
      var stageWidth = surface.offsetWidth || 0;
      var stageHeight = surface.offsetHeight || 0;

      // El SVG toma exactamente el tamaÃ±o del Ã¡rea renderizada del canvas.
      svg.setAttribute('viewBox', '0 0 ' + stageWidth + ' ' + stageHeight);
      svg.setAttribute('width', String(stageWidth));
      svg.setAttribute('height', String(stageHeight));

      var rows = [
        '<defs><marker id="collection-canvas-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L8,3 z" fill="#7c3aed"></path></marker></defs>'
      ];

      for (var i = 0; i < connections.length; i++) {
        var sourceIndex = this.options.findItemIndexByNodeId(scenario, connections[i].fromId);
        var targetIndex = this.options.findItemIndexByNodeId(scenario, connections[i].toId);
        if (sourceIndex < 0 || targetIndex < 0) continue;

        var sourceElement = document.getElementById('collection-canvas-step-' + sourceIndex);
        var targetElement = document.getElementById('collection-canvas-step-' + targetIndex);
        if (!sourceElement || !targetElement) continue;

        var route = this.buildOrthogonalCanvasPath(sourceElement, targetElement);
        var label = this.buildCanvasLinkText(
          scenario.items[sourceIndex],
          sourceIndex,
          scenario.items[targetIndex],
          targetIndex,
          scenario
        );
        var labelWidth = Math.min(260, Math.max(92, (String(label || '').length * 6.2)));
        var removeX = route.labelX + (labelWidth / 2) + 12;
        var removeY = route.labelY;

        rows.push(
          '<path class="collection-canvas-link" marker-end="url(#collection-canvas-arrow)" d="' + route.path + '"></path>' +
          '<circle class="collection-canvas-link-handle" cx="' + route.startX + '" cy="' + route.startY + '" r="6" onmousedown="collectionStartConnectionDrag(' + "'" + this.options.escapeHtml(connections[i].fromId) + "'" + ',' + "'" + this.options.escapeHtml(connections[i].toId) + "'" + ',' + "'" + 'from' + "'" + ', event)"></circle>' +
          '<circle class="collection-canvas-link-handle" cx="' + route.endX + '" cy="' + route.endY + '" r="6" onmousedown="collectionStartConnectionDrag(' + "'" + this.options.escapeHtml(connections[i].fromId) + "'" + ',' + "'" + this.options.escapeHtml(connections[i].toId) + "'" + ',' + "'" + 'to' + "'" + ', event)"></circle>' +
          '<rect class="collection-canvas-link-label-bg" x="' + (route.labelX - (labelWidth / 2)) + '" y="' + (route.labelY - 12) + '" rx="10" ry="10" width="' + labelWidth + '" height="24"></rect>' +
          '<text class="collection-canvas-link-label" x="' + route.labelX + '" y="' + (route.labelY + 4) + '" text-anchor="middle">' + this.options.escapeHtml(label) + '</text>' +
          '<g class="collection-canvas-link-remove" onclick="collectionRemoveConnection(' + "'" + this.options.escapeHtml(connections[i].fromId) + "'" + ',' + "'" + this.options.escapeHtml(connections[i].toId) + "'" + ')">' +
            '<circle cx="' + removeX + '" cy="' + removeY + '" r="9"></circle>' +
            '<text x="' + removeX + '" y="' + (removeY + 3) + '" text-anchor="middle">x</text>' +
          '</g>'
        );
      }

      // Si el usuario estÃ¡ arrastrando una conexiÃ³n nueva, se dibuja la ruta temporal.
      if (this.options.getConnectionDragState() && this.options.getConnectionDragState().tempPath) {
        rows.push('<path class="collection-canvas-link collection-canvas-link-temp" d="' + this.options.getConnectionDragState().tempPath + '"></path>');
      }

      svg.innerHTML = rows.join('');
    }

    /**
     * Renderiza el contenido completo del canvas del caso activo.
     * Si no hay pasos, muestra el placeholder de arrastre.
     */
    renderItems() {
      var container = document.getElementById('collection-chain');
      if (!container) return;

      var scenario = this.options.getActiveScenario();
      var items = scenario ? scenario.items : [];
      if (scenario) this.options.ensureScenarioConnections(scenario);

      var totalItems = this.options.getState().scenarios.reduce(function countAllItems(total, current) {
        return total + ((current.items || []).length);
      }, 0);

      // El panel lateral de servicios siempre se refresca junto con el canvas principal.
      this.options.renderServiceCatalog();

      if (!items.length) {
        container.innerHTML = '<div class="collection-canvas-stage" ondragover="collectionAllowCanvasDrop(event)" ondragenter="collectionCanvasDragEnter(event)" ondragleave="collectionCanvasDragLeave(event)" ondrop="collectionDropOperation(0, event)"><div class="collection-canvas-empty"><div class="collection-canvas-empty-icon">⊞</div><div class="collection-canvas-empty-title">Todavia no agregaste servicios</div><div class="collection-canvas-empty-copy">Agrega un servicio para comenzar a construir la cadena.</div><button type="button" class="btn btn-outline" onclick="collectionOpenServiceDrawer()"><span class="collection-btn-icon">＋</span><span>Agregar servicio</span></button></div></div>';
      } else {
        var selectedIndex = this.options.getSelectedItemIndex();
        var blocks = [];
        var maxX = 0;
        var maxY = 0;

        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var layout = this.options.ensureItemLayout(item, i);
          var nodeId = this.options.ensureItemNodeId(item);
          maxX = Math.max(maxX, layout.x);
          maxY = Math.max(maxY, layout.y);

          var operationKind = String(item.operationKind || this.options.inferOperationKind(item.method)).toLowerCase();
          var canvasDesc = describeCanvasItem(item);

          blocks.push(
            '<div id="collection-canvas-step-' + i + '" class="collection-canvas-step' + (selectedIndex === i ? ' collection-canvas-step-selected' : '') + '" style="left:' + layout.x + 'px;top:' + layout.y + 'px" onclick="collectionCanvasNodeClick(' + i + ')" onmousedown="collectionStartNodeDrag(' + i + ', event)">' +
              '<div class="collection-canvas-step-head">' +
                '<div class="collection-canvas-step-index">' + (i + 1) + '</div>' +
                '<div class="collection-canvas-step-copy">' +
                  '<div class="collection-canvas-step-title" title="' + this.options.escapeHtml(item.method) + '">' + this.options.escapeHtml(item.method) + '</div>' +
                  (canvasDesc ? '<div class="collection-canvas-step-desc" title="' + this.options.escapeHtml(canvasDesc) + '">' + this.options.escapeHtml(canvasDesc) + '</div>' : '') +
                  '<div class="collection-canvas-step-meta">' +
                    '<span class="collection-canvas-chip">' + this.options.escapeHtml(item.service) + '</span>' +
                    '<span class="collection-canvas-chip">' + this.options.escapeHtml(String(item.httpMethod || 'GET').toUpperCase()) + '</span>' +
                    '<span class="collection-canvas-chip">' + this.options.escapeHtml(operationKind === 'query' ? 'Consulta' : 'Ejecucion') + '</span>' +
                  '</div>' +
                '</div>' +
                '<button class="collection-canvas-node-handle" title="Crear flecha desde este paso" onmousedown="collectionStartNewConnectionDrag(' + "'" + this.options.escapeHtml(nodeId) + "'" + ', event)" onclick="event.stopPropagation()" type="button">&#8595;</button>' +
                '<button class="svc-rm" onclick="event.stopPropagation(); collectionRemoveItem(' + i + ')">&#10005;</button>' +
              '</div>' +
            '</div>'
          );
        }

        var surfaceWidth = Math.max(980, maxX + 420);
        var surfaceHeight = Math.max(540, maxY + 220);

        container.innerHTML =
          '<div class="collection-canvas-stage" ondragover="collectionAllowCanvasDrop(event)" ondragenter="collectionCanvasDragEnter(event)" ondragleave="collectionCanvasDragLeave(event)" ondrop="collectionDropOperation(' + items.length + ', event)">' +
            '<svg id="collection-canvas-svg" class="collection-canvas-svg"></svg>' +
            '<div id="collection-canvas-surface" class="collection-canvas-surface" style="width:' + surfaceWidth + 'px;height:' + surfaceHeight + 'px">' +
              blocks.join('') +
            '</div>' +
          '</div>';

        // El render de flechas se difiere al siguiente tick para asegurar medidas finales del DOM.
        setTimeout(this.renderCanvasConnections.bind(this), 0);
      }

      // DespuÃ©s del canvas se refrescan inspector y botones de acciÃ³n.
      this.options.renderInspector();
      var generateButton = document.getElementById('btn-collection-generate');
      if (generateButton) generateButton.disabled = !totalItems || !this.options.pathSupported();
      var executeButton = document.getElementById('btn-collection-execute');
      if (executeButton) executeButton.disabled = !items.length || !this.options.pathSupported();
      var fillButton = document.getElementById('btn-collection-fill-data');
      if (fillButton) fillButton.disabled = !items.length || !this.options.pathSupported();
      var addServiceWrap = document.getElementById('collection-builder-add-service-wrap');
      if (addServiceWrap) addServiceWrap.style.display = items.length ? 'flex' : 'none';
      if (generateButton) generateButton.classList.toggle('btn-soft-disabled', generateButton.disabled);
      if (executeButton) executeButton.classList.toggle('btn-soft-disabled', executeButton.disabled);
      if (fillButton) fillButton.classList.toggle('btn-soft-disabled', fillButton.disabled);
      var openConsoleButton = document.getElementById('btn-collection-open-console');
      if (openConsoleButton) openConsoleButton.classList.toggle('btn-soft-disabled', openConsoleButton.disabled);
      if (typeof collectionSyncBuilderShellState === 'function') collectionSyncBuilderShellState();
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionCanvasManager = CollectionCanvasManager;
})(window);

