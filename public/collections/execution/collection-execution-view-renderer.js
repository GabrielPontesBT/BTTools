(function bootstrapCollectionExecutionViewRenderer(global) {
  'use strict';

  /**
   * Agrupa los pasos en filas de a lo sumo perRow y alterna la direccion de
   * lectura (zig-zag) para que una cadena larga no dependa de una unica fila
   * horizontal infinita. Es una funcion pura, sin dependencias del DOM, para
   * poder ajustar el algoritmo de layout sin tocar el renderizado.
   */
  function computeFlowRows(steps, perRow) {
    var list = Array.isArray(steps) ? steps : [];
    var size = perRow > 0 ? perRow : 3;
    var rows = [];

    for (var i = 0; i < list.length; i += size) {
      rows.push({
        reversed: (rows.length % 2) === 1,
        steps: list.slice(i, i + size)
      });
    }

    return rows;
  }

  /**
   * Renderiza la experiencia visual del panel de ejecucion.
   * La logica de requests, playback y estados vive en el coordinador;
   * este renderer solo transforma un run ya armado en HTML.
   */
  class CollectionExecutionViewRenderer {
    /**
     * Recibe helpers externos para escapar HTML y consultar pequenas
     * porciones del estado sin acoplarse al centro de ejecucion.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Construye la pagina completa de ejecucion usando una jerarquia
     * enfocada en cabecera, metricas, flujo, timeline e inspector.
     */
    render(run) {
      if (!run) {
        return '<div class="collection-step-empty">Todavia no hay una ejecucion para mostrar.</div>';
      }

      var timelineOpen = this.options.isTimelineOpen ? this.options.isTimelineOpen() : false;
      var flowExpanded = this.options.isFlowExpanded ? this.options.isFlowExpanded() : true;
      var layoutClass = 'collection-exec-main-layout' +
        (timelineOpen ? ' collection-exec-main-layout-with-timeline' : '') +
        (flowExpanded ? '' : ' collection-exec-main-layout-flow-collapsed');

      return '' +
        '<div class="collection-exec-shell collection-exec-shell-redesign">' +
          this.renderHeader(run) +
          '<div class="' + layoutClass + '">' +
            this.renderFlowPanel(run, timelineOpen, flowExpanded) +
            this.renderInspector(run) +
            (timelineOpen ? this.renderTimelinePanel(run) : '') +
          '</div>' +
        '</div>';
    }

    /**
     * Dibuja una cabecera compacta solo con informacion y acciones
     * propias de la corrida actual. Titulo y metricas van en una sola linea
     * para no gastar una fila entera solo en estado.
     */
    renderHeader(run) {
      var statusClass = 'collection-exec-header-line';
      if (run.status === 'error') statusClass += ' collection-exec-header-line-error';
      if (run.status === 'success') statusClass += ' collection-exec-header-line-success';
      if (run.status === 'running') statusClass += ' collection-exec-header-line-running';

      var stats = run.stats || {};
      var metaParts = [
        run.statusLabel || 'Sin estado',
        run.durationLabel || '--',
        (stats.totalSteps || 0) + ' pasos',
        (stats.successCount || 0) + ' correcto' + (stats.successCount === 1 ? '' : 's'),
        (stats.errorCount || 0) + ' error' + (stats.errorCount === 1 ? '' : 'es')
      ];

      return '' +
        '<section class="collection-exec-header-simple">' +
          '<button type="button" class="collection-exec-back-link" onclick="collectionCloseExecutionMode()">' +
            '<span aria-hidden="true">&#8592;</span><span>Volver</span>' +
          '</button>' +
          '<div class="collection-exec-header-simple-copy">' +
            '<span class="collection-exec-header-title">Ejecucion #' + this.escape(run.id) + '</span>' +
            '<span class="collection-exec-inline-separator">&middot;</span>' +
            '<span class="' + statusClass + '">' +
              metaParts.map(function escapePart(part) { return this.escape(part); }, this).join('<span class="collection-exec-inline-separator">&middot;</span>') +
            '</span>' +
          '</div>' +
          '<div class="collection-exec-header-simple-actions">' +
            (run.status === 'running'
              ? '<button type="button" class="btn btn-outline" onclick="collectionCancelExecutionRun()">Cancelar ejecucion</button>'
              : '') +
            this.renderHeaderMenu(run) +
          '</div>' +
        '</section>';
    }

    /**
     * Agrupa acciones globales de la corrida (incluida la reejecucion) para
     * evitar una barra sobrecargada de botones con igual prioridad visual.
     */
    renderHeaderMenu(run) {
      return '' +
        '<details class="collection-exec-menu">' +
          '<summary class="collection-exec-menu-trigger" onclick="event.stopPropagation()">&#8942;</summary>' +
          '<div class="collection-exec-menu-popover" onclick="event.stopPropagation()">' +
            (run.status !== 'running' ? '<button type="button" class="collection-exec-menu-item" onclick="collectionRerunExecutionFlow()">Reejecutar flujo</button>' : '') +
            (run.status !== 'running' ? '<button type="button" class="collection-exec-menu-item" onclick="collectionRerunExecutionFromSelectedStep()">Reejecutar desde el paso seleccionado</button>' : '') +
            '<button type="button" class="collection-exec-menu-item" onclick="collectionExportExecutionRun()">Exportar ejecucion</button>' +
            '<button type="button" class="collection-exec-menu-item" onclick="navigator.clipboard && navigator.clipboard.writeText(' + "'" + this.escape(String(run.id || '')) + "'" + ')">Copiar identificador</button>' +
            '<button type="button" class="collection-exec-menu-item" onclick="collectionCloseExecutionMode()">Volver al Builder</button>' +
          '</div>' +
        '</details>';
    }

    /**
     * Renderiza el flujo de ejecucion. La cabecera (titulo + controles) es la
     * misma en ambos modos; solo cambia el cuerpo: tarjetas en grilla (max. 3
     * por fila, zig-zag) cuando esta expandido, o una lista compacta cuando
     * esta colapsado (deja mas ancho/alto disponible sin perder navegacion).
     */
    renderFlowPanel(run, timelineOpen, flowExpanded) {
      var steps = this.buildFlowSteps(run);
      var zoomLevel = this.options.getZoomLevel ? this.options.getZoomLevel() : 1;
      var zoomPercent = Math.round(zoomLevel * 100);

      return '' +
        '<section class="collection-exec-panel collection-exec-flow-panel">' +
          '<div class="collection-exec-panel-head collection-exec-panel-head-flow">' +
            '<div class="collection-exec-panel-title">Flujo de ejecucion</div>' +
            '<div class="collection-exec-panel-tools">' +
              (flowExpanded ? this.renderFlowToolsMenu(zoomPercent) : '') +
              (timelineOpen ? '' : '<button type="button" class="collection-exec-tool-btn collection-exec-tool-btn-timeline" onclick="collectionToggleExecutionTimeline()">Linea de tiempo</button>') +
              '<button type="button" class="collection-exec-tool-btn" onclick="collectionToggleExecutionFlowExpanded()">' + (flowExpanded ? 'Colapsar' : 'Expandir') + '</button>' +
            '</div>' +
          '</div>' +
          (flowExpanded ? this.renderFlowGrid(run, steps, zoomLevel) : this.renderFlowBreadcrumbList(run, steps)) +
        '</section>';
    }

    /**
     * Organiza los pasos en filas de a lo sumo tres, alternando la direccion
     * (zig-zag) para que el orden de ejecucion se siga leyendo con claridad
     * sin depender de una unica fila horizontal infinita.
     */
    renderFlowGrid(run, steps, zoomLevel) {
      var rows = computeFlowRows(steps, 3);

      return '' +
        '<div class="collection-exec-flow-stage collection-exec-flow-stage-linear">' +
          '<div class="collection-exec-flow-rows" style="transform:scale(' + zoomLevel + ')">' +
            rows.map(function renderRow(row, rowIndex) {
              var rowClass = 'collection-exec-flow-row' + (row.reversed ? ' collection-exec-flow-row-reversed' : '');
              var rowHtml = '' +
                '<div class="' + rowClass + '">' +
                  row.steps.map(function renderStep(step, colIndex) {
                    var isLastInRow = colIndex === row.steps.length - 1;
                    var connector = (!isLastInRow)
                      ? '<div class="collection-exec-flow-arrow" aria-hidden="true">' + (row.reversed ? '&larr;' : '&rarr;') + '</div>'
                      : '';
                    return this.renderExecutionNode(step, run.selectedStepId === step.id) + connector;
                  }, this).join('') +
                '</div>';

              var connectorHtml = '';
              if (rowIndex < rows.length - 1) {
                var side = row.reversed ? 'left' : 'right';
                connectorHtml = '<div class="collection-exec-flow-row-connector collection-exec-flow-row-connector-' + side + '" aria-hidden="true">&darr;</div>';
              }
              return rowHtml + connectorHtml;
            }, this).join('') +
          '</div>' +
        '</div>';
    }

    /**
     * Vista compacta del flujo (modo colapsado): lista vertical con indice,
     * estado y nombre, sin metodo/duracion (eso ya se ve en el inspector).
     */
    renderFlowBreadcrumbList(run, steps) {
      return '' +
        '<div class="collection-exec-flow-stage collection-exec-flow-breadcrumb-stage">' +
          '<div class="collection-exec-flow-breadcrumb">' +
            steps.map(function renderCrumb(step, index) {
              var connector = index < (steps.length - 1) ? '<span class="collection-exec-flow-breadcrumb-arrow" aria-hidden="true">&darr;</span>' : '';
              return this.renderFlowBreadcrumbItem(step, run.selectedStepId === step.id) + connector;
            }, this).join('') +
          '</div>' +
        '</div>';
    }

    /**
     * Agrupa Ajustar/Centrar/zoom en un menu: son controles de navegacion del
     * canvas, no necesitan ocupar espacio fijo en la barra de herramientas.
     */
    renderFlowToolsMenu(zoomPercent) {
      return '' +
        '<details class="collection-exec-menu">' +
          '<summary class="collection-exec-tool-btn" onclick="event.stopPropagation()">Zoom ' + zoomPercent + '%</summary>' +
          '<div class="collection-exec-menu-popover" onclick="event.stopPropagation()">' +
            '<button type="button" class="collection-exec-menu-item" onclick="collectionZoomToFitExecutionFlow()">Ajustar al ancho</button>' +
            '<button type="button" class="collection-exec-menu-item" onclick="collectionCenterExecutionFlow()">Centrar</button>' +
            '<button type="button" class="collection-exec-menu-item" onclick="collectionZoomOutExecutionFlow()">Alejar (&minus;)</button>' +
            '<button type="button" class="collection-exec-menu-item" onclick="collectionZoomInExecutionFlow()">Acercar (+)</button>' +
          '</div>' +
        '</details>';
    }

    /**
     * Item compacto del breadcrumb de flujo colapsado: indice, icono de estado
     * y nombre, sin metodo/duracion (eso ya se ve en el inspector).
     */
    renderFlowBreadcrumbItem(step, selected) {
      var selectedClass = selected ? ' collection-exec-flow-breadcrumb-item-selected' : '';
      return '' +
        '<button type="button" class="collection-exec-flow-breadcrumb-item collection-exec-flow-breadcrumb-item-' + this.escape(step.status || 'idle') + selectedClass + '" onclick="collectionSelectExecutionStep(' + "'" + this.escape(step.id) + "'" + ')">' +
          '<span class="collection-exec-flow-breadcrumb-index">' + this.escape(step.index) + '</span>' +
          '<span class="collection-exec-flow-breadcrumb-name">' + this.escape(step.name) + '</span>' +
        '</button>';
    }

    /**
     * Une Authenticate y los pasos de negocio en el orden real de ejecucion.
     */
    buildFlowSteps(run) {
      var rows = [];
      if (run && run.authStep) rows.push(run.authStep);
      return rows.concat(Array.isArray(run && run.steps) ? run.steps : []);
    }

    /**
     * Dibuja una tarjeta compacta por paso evitando repetir el mismo estado
     * en demasiados lugares a la vez.
     */
    renderExecutionNode(step, selected) {
      var selectedClass = selected ? ' collection-exec-node-selected' : '';

      return '' +
        '<article class="collection-exec-node collection-exec-node-' + this.escape(step.status || 'idle') + selectedClass + '">' +
          '<button type="button" class="collection-exec-node-main" onclick="collectionSelectExecutionStep(' + "'" + this.escape(step.id) + "'" + ')">' +
            '<div class="collection-exec-node-head">' +
              '<div class="collection-exec-node-index">' + this.escape(step.index) + '</div>' +
              '<div class="collection-exec-node-copy">' +
                '<div class="collection-exec-node-title">' + this.escape(step.name) + '</div>' +
                '<div class="collection-exec-node-summary">' +
                  '<span>' + this.escape(step.httpMethod || '-') + '</span>' +
                  '<span>&middot;</span>' +
                  '<span>' + this.escape(step.statusLabel || '-') + '</span>' +
                  '<span>&middot;</span>' +
                  '<span>' + this.escape(step.durationLabel || '--') + '</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</button>' +
          this.renderStepMenu(step) +
        '</article>';
    }

    /**
     * Agrupa acciones contextuales del nodo para no dejar botones fijos
     * dentro del flujo.
     */
    renderStepMenu(step) {
      return '' +
        '<details class="collection-exec-node-menu">' +
          '<summary class="collection-exec-node-menu-trigger" onclick="event.stopPropagation()">&#8942;</summary>' +
          '<div class="collection-exec-node-menu-popover" onclick="event.stopPropagation()">' +
            '<button type="button" class="collection-exec-node-menu-item" onclick="collectionHandleExecutionNodeAction(' + "'request'" + ',' + "'" + this.escape(step.id) + "'" + ')">Ver request</button>' +
            '<button type="button" class="collection-exec-node-menu-item" onclick="collectionHandleExecutionNodeAction(' + "'response'" + ',' + "'" + this.escape(step.id) + "'" + ')">Ver response</button>' +
            '<button type="button" class="collection-exec-node-menu-item" onclick="collectionHandleExecutionNodeAction(' + "'copy-url'" + ',' + "'" + this.escape(step.id) + "'" + ')">Copiar URL</button>' +
            '<button type="button" class="collection-exec-node-menu-item" onclick="collectionRerunExecutionFromSelectedStep()">Reejecutar desde aqui</button>' +
          '</div>' +
        '</details>';
    }

    /**
     * Renderiza el inspector del paso seleccionado usando una sola cabecera
     * y una sola pestaña visible por vez.
     */
    renderInspector(run) {
      var step = this.findSelectedStep(run);
      if (!step) {
        return '' +
          '<section class="collection-exec-panel collection-exec-detail-panel">' +
            '<div class="collection-step-empty">' +
              '<div class="collection-exec-empty-title">Seleccioná un paso del flujo</div>' +
              '<div>Podrás revisar su Request, Response y detalles.</div>' +
            '</div>' +
          '</section>';
      }

      return '' +
        '<section class="collection-exec-panel collection-exec-detail-panel">' +
          '<div class="collection-exec-detail-head-simple">' +
            '<div class="collection-exec-detail-head-copy">' +
              '<div class="collection-exec-detail-title">' + this.escape(step.name) + '</div>' +
              '<div class="collection-exec-detail-subline">' + this.escape(step.statusLabel || '-') + ' &middot; ' + this.escape(step.durationLabel || '--') + '</div>' +
            '</div>' +
            '<div class="collection-exec-detail-head-actions">' +
              this.renderStepHeaderMenu(step) +
            '</div>' +
          '</div>' +
          this.renderTabs(run) +
          '<div class="collection-exec-detail-body collection-exec-detail-body-single">' +
            this.renderTabContent(run, step) +
          '</div>' +
        '</section>';
    }

    /**
     * Replica en el encabezado del inspector las mismas acciones del nodo,
     * manteniendo una experiencia consistente.
     */
    renderStepHeaderMenu(step) {
      return '' +
        '<details class="collection-exec-menu">' +
          '<summary class="collection-exec-menu-trigger" onclick="event.stopPropagation()">&#8942;</summary>' +
          '<div class="collection-exec-menu-popover" onclick="event.stopPropagation()">' +
            '<button type="button" class="collection-exec-menu-item" onclick="collectionHandleExecutionNodeAction(' + "'request'" + ',' + "'" + this.escape(step.id) + "'" + ')">Ver request</button>' +
            '<button type="button" class="collection-exec-menu-item" onclick="collectionHandleExecutionNodeAction(' + "'response'" + ',' + "'" + this.escape(step.id) + "'" + ')">Ver response</button>' +
            '<button type="button" class="collection-exec-menu-item" onclick="collectionHandleExecutionNodeAction(' + "'copy-url'" + ',' + "'" + this.escape(step.id) + "'" + ')">Copiar URL</button>' +
            '<button type="button" class="collection-exec-menu-item" onclick="collectionRerunExecutionFromSelectedStep()">Reejecutar desde aqui</button>' +
          '</div>' +
        '</details>';
    }

    /**
     * Limita el diagnostico a Request, Response y Detalles.
     */
    renderTabs(run) {
      var tabs = [
        { key: 'request', label: 'Request' },
        { key: 'response', label: 'Response' },
        { key: 'details', label: 'Detalles' }
      ];

      return '' +
        '<div class="collection-exec-tabs collection-exec-tabs-simple">' +
          tabs.map(function renderTab(tab) {
            var active = run.selectedTab === tab.key ? ' active' : '';
            return '<button type="button" class="collection-exec-tab' + active + '" onclick="collectionSetExecutionTab(' + "'" + this.escape(tab.key) + "'" + ')">' + this.escape(tab.label) + '</button>';
          }, this).join('') +
        '</div>';
    }

    /**
     * Resuelve el contenido visible de la pestaña activa.
     */
    renderTabContent(run, step) {
      if (run.selectedTab === 'request') return this.renderRequestTab(step);
      if (run.selectedTab === 'response') return this.renderResponseTab(step);
      return this.renderDetailsTab(step);
    }

    /**
     * Muestra el request con resumen compacto y secciones bajo demanda.
     */
    renderRequestTab(step) {
      var urlInfo = this.parseUrl(step.requestUrl || '');
      var sections = [
        this.renderKeyValueAccordion('Query params', urlInfo.queryRows, false),
        this.renderKeyValueAccordion('Headers', this.objectToRows(step.requestHeaders), false)
      ].filter(Boolean).join('');
      var hasBody = this.hasContent(step.requestBody);
      var format = step.format || 'json';

      return '' +
        '<div class="collection-exec-response-view">' +
          '<div class="collection-exec-response-toolbar collection-exec-response-toolbar-slim">' +
            '<span class="collection-exec-response-meta collection-exec-response-url" title="' + this.escape(step.requestUrl || '') + '">' + this.escape(step.httpMethod || '-') + ' &middot; ' + this.escape(step.requestUrl || 'Sin URL disponible') + '</span>' +
            (hasBody ? this.renderCodeToolbarActions(step.requestBody, format) : '') +
          '</div>' +
          '<div class="collection-exec-response-body">' +
            (hasBody ? this.renderCodeViewer(step.requestBody, format) : '<div class="collection-step-empty">Este paso no genero un body de request visible.</div>') +
          '</div>' +
          (sections ? '<div class="collection-exec-accordion-stack">' + sections + '</div>' : '') +
        '</div>';
    }

    /**
     * Muestra la respuesta priorizando estado, duracion y body: el body es
     * lo mas importante para diagnosticar, asi que ocupa casi todo el alto.
     */
    renderResponseTab(step) {
      var hasBody = this.hasContent(step.responseBody);
      var format = step.format || 'json';

      return '' +
        '<div class="collection-exec-response-view">' +
          (hasBody
            ? '<div class="collection-exec-response-toolbar collection-exec-response-toolbar-slim">' +
                '<span class="collection-exec-response-meta">' + this.escape(this.byteSizeLabel(step.responseBody, format)) + '</span>' +
                this.renderCodeToolbarActions(step.responseBody, format) +
              '</div>'
            : '') +
          '<div class="collection-exec-response-body">' +
            (hasBody ? this.renderCodeViewer(step.responseBody, format) : '<div class="collection-step-empty">Este paso no devolvio un body visible.</div>') +
          '</div>' +
        '</div>';
    }

    /**
     * Acciones compactas del visor de codigo: copiar el payload real (no el
     * texto renderizado, que ya tiene numeros de linea mezclados).
     * `format` decide si el texto copiado se formatea como JSON o como XML
     * (ver formatPayload).
     */
    renderCodeToolbarActions(payload, format) {
      return '' +
        '<div class="collection-exec-response-actions">' +
          '<button type="button" class="collection-exec-tool-btn" onclick="collectionCopyExecutionCodeSource(this)">Copiar</button>' +
          '<textarea class="collection-exec-code-source" tabindex="-1" aria-hidden="true">' + this.escape(this.formatPayload(payload, format)) + '</textarea>' +
        '</div>';
    }

    /**
     * Visor de codigo con numeracion de linea y scroll interno propio.
     */
    renderCodeViewer(payload, format) {
      var text = this.formatPayload(payload, format);
      var lines = text.split('\n');

      return '' +
        '<pre class="collection-exec-code collection-exec-code-primary"><code>' +
          lines.map(function renderLine(line, index) {
            return '<span class="collection-exec-code-line"><span class="collection-exec-code-line-number">' + (index + 1) + '</span><span class="collection-exec-code-line-text">' + this.escape(line) + '</span></span>';
          }, this).join('\n') +
        '</code></pre>';
    }

    /**
     * Calcula un tamano legible (KB) para el body mostrado.
     */
    byteSizeLabel(payload, format) {
      var text = this.formatPayload(payload, format);
      var bytes = typeof Blob !== 'undefined' ? new Blob([text]).size : text.length;
      if (bytes < 1024) return bytes + ' B';
      return (bytes / 1024).toFixed(2) + ' KB';
    }

    /**
     * Agrupa la informacion secundaria en accordions para no competir
     * con request y response.
     */
    renderDetailsTab(step) {
      return '' +
        '<div class="collection-exec-tab-panel">' +
          '<div class="collection-exec-accordion-stack">' +
            this.renderKeyValueAccordion('Informacion general', [
              { label: 'Servicio', value: step.service || '-' },
              { label: 'Metodo HTTP', value: step.httpMethod || '-' },
              { label: 'Estado', value: step.statusLabel || '-' },
              { label: 'Ejecutado en', value: step.happenedAtLabel || '-' },
              { label: 'Paso', value: String(step.index || '-') }
            ], true) +
            this.renderKeyValueAccordion('Variables creadas', this.variablesToRows(step.createdVariables), false) +
            (step.connectionLabelFromPrevious ? this.renderKeyValueAccordion('Mappings', [
              { label: 'Origen', value: step.connectionLabelFromPrevious }
            ], false) : '') +
            this.renderListAccordion('Logs', step.logs, false) +
            this.renderListAccordion('Warnings', step.warnings, false) +
          '</div>' +
        '</div>';
    }

    /**
     * Renderiza un accordion de pares clave/valor y oculta bloques vacios.
     */
    renderKeyValueAccordion(title, rows, openByDefault) {
      var list = Array.isArray(rows) ? rows : [];
      if (!list.length) return '';

      return '' +
        '<details class="collection-exec-accordion"' + (openByDefault ? ' open' : '') + '>' +
          '<summary class="collection-exec-accordion-trigger">' +
            '<span>' + this.escape(title) + '</span>' +
            '<span class="collection-exec-accordion-chevron">v</span>' +
          '</summary>' +
          '<div class="collection-exec-accordion-body">' +
            '<div class="collection-exec-kv-list">' +
              list.map(function renderRow(row) {
                return '' +
                  '<div class="collection-exec-kv-row">' +
                    '<div class="collection-exec-kv-key">' + this.escape(row.label) + '</div>' +
                    '<div class="collection-exec-kv-value">' + this.escape(row.value) + '</div>' +
                  '</div>';
              }, this).join('') +
            '</div>' +
          '</div>' +
        '</details>';
    }

    /**
     * Renderiza un bloque de codigo con scroll interno para body request/response.
     */
    /**
     * Renderiza listas simples para logs y warnings.
     */
    renderListAccordion(title, rows, openByDefault) {
      var list = Array.isArray(rows) ? rows.filter(Boolean) : [];
      if (!list.length) return '';

      return '' +
        '<details class="collection-exec-accordion"' + (openByDefault ? ' open' : '') + '>' +
          '<summary class="collection-exec-accordion-trigger">' +
            '<span>' + this.escape(title) + '</span>' +
            '<span class="collection-exec-accordion-chevron">v</span>' +
          '</summary>' +
          '<div class="collection-exec-accordion-body">' +
            '<div class="collection-exec-list-block">' +
              list.map(function renderItem(item) {
                return '<div class="collection-exec-list-row">' + this.escape(item) + '</div>';
              }, this).join('') +
            '</div>' +
          '</div>' +
        '</details>';
    }

    /**
     * Construye la linea de tiempo como panel lateral en desktop y drawer
     * contextual en notebook.
     */
    renderTimelinePanel(run) {
      var timelineRows = (run.timeline || []).map(function renderEvent(event) {
        return this.renderTimelineEvent(run, event);
      }, this).join('');

      return '' +
        '<aside class="collection-exec-timeline-drawer collection-exec-timeline-drawer-open">' +
          '<section class="collection-exec-side-panel collection-exec-side-panel-timeline">' +
            '<div class="collection-exec-timeline-head">' +
              '<div class="collection-exec-panel-title">Linea de tiempo</div>' +
              '<button type="button" class="collection-exec-timeline-close" onclick="collectionCloseExecutionTimeline()" aria-label="Plegar linea de tiempo">&times;</button>' +
            '</div>' +
            '<div class="collection-exec-timeline collection-exec-scroll-list collection-exec-scroll-list-timeline">' +
              (timelineRows || '<div class="collection-step-empty">Todavia no hay eventos.</div>') +
            '</div>' +
          '</section>' +
        '</aside>' +
        '<button type="button" class="collection-exec-timeline-backdrop show" onclick="collectionCloseExecutionTimeline()"></button>';
    }

    /**
     * Dibuja un evento de timeline con formato compacto y alineacion clara.
     */
    renderTimelineEvent(run, event) {
      var active = event.stepId && event.stepId === run.selectedStepId ? ' active' : '';
      var tagName = event.stepId ? 'button' : 'div';
      var attributes = event.stepId
        ? ' type="button" onclick="collectionSelectExecutionStep(' + "'" + this.escape(event.stepId) + "'" + ')"'
        : '';

      return '' +
        '<' + tagName + ' class="collection-exec-timeline-item' + active + '"' + attributes + '>' +
          '<div class="collection-exec-timeline-time">' + this.escape(event.timeLabel || '--:--:--') + '</div>' +
          '<div class="collection-exec-timeline-body">' +
            '<div class="collection-exec-timeline-rail collection-exec-timeline-rail-' + this.escape(event.status || 'idle') + '"></div>' +
            '<div class="collection-exec-timeline-icon collection-exec-timeline-icon-' + this.escape(event.status || 'idle') + '">' + this.escape(this.statusIcon(event.status)) + '</div>' +
            '<div class="collection-exec-timeline-copy">' +
              '<div class="collection-exec-timeline-title">' + this.escape(event.title || '-') + '</div>' +
              '<div class="collection-exec-timeline-meta">' + this.escape(event.statusLabel || '-') + '</div>' +
            '</div>' +
            '<div class="collection-exec-timeline-ms">' + this.escape(event.durationLabel || '--') + '</div>' +
          '</div>' +
        '</' + tagName + '>';
    }

    /**
     * Busca el paso actualmente seleccionado.
     * Si la seleccion no existe, cae al primer paso visible.
     */
    findSelectedStep(run) {
      if (run && run.selectedStepId === 'auth' && run.authStep) {
        return run.authStep;
      }

      var steps = Array.isArray(run && run.steps) ? run.steps : [];
      for (var i = 0; i < steps.length; i++) {
        if (steps[i].id === run.selectedStepId) return steps[i];
      }

      return run && run.authStep ? run.authStep : (steps.length ? steps[0] : null);
    }

    /**
     * Convierte un objeto simple en filas label/valor sin valores vacios.
     */
    objectToRows(objectValue) {
      var value = objectValue && typeof objectValue === 'object' ? objectValue : {};
      return Object.keys(value).filter(function keepKey(key) {
        return value[key] != null && value[key] !== '';
      }).map(function mapKey(key) {
        return {
          label: key,
          value: typeof value[key] === 'string' ? value[key] : JSON.stringify(value[key])
        };
      });
    }

    /**
     * Traduce variables creadas a filas simples para el accordion de detalles.
     */
    variablesToRows(variables) {
      var rows = Array.isArray(variables) ? variables : [];
      return rows.map(function mapVariable(variable) {
        return {
          label: variable.name + (variable.type ? ' (' + variable.type + ')' : ''),
          value: variable.value
        };
      });
    }

    /**
     * Separa query params de una URL para inspeccionarlos en el request.
     */
    parseUrl(rawUrl) {
      var urlText = String(rawUrl || '');
      var queryIndex = urlText.indexOf('?');
      var queryText = queryIndex >= 0 ? urlText.slice(queryIndex + 1) : '';

      return {
        queryRows: queryText
          ? queryText.split('&').filter(Boolean).map(function mapPair(chunk) {
              var pieces = chunk.split('=');
              return {
                label: decodeURIComponent(String(pieces[0] || '')),
                value: decodeURIComponent(String(pieces.slice(1).join('=') || ''))
              };
            })
          : []
      };
    }

    /**
     * Determina si un payload tiene contenido visible para el usuario.
     */
    hasContent(payload) {
      if (payload == null) return false;
      if (typeof payload === 'string') return payload.trim().length > 0;
      if (Array.isArray(payload)) return payload.length > 0;
      if (typeof payload === 'object') return Object.keys(payload).length > 0;
      return true;
    }

    /**
     * Serializa cualquier payload en un formato legible para el bloque de codigo.
     *
     * Despacha segun `format` ('json' por defecto, o 'xml' para el camino
     * SOAP de V3) a una funcion dedicada por formato. Mantenerlas separadas
     * evita que un ajuste de formato pensado para XML termine, por accidente,
     * cambiando como se ve un JSON (y viceversa) — ver formatJsonPayload /
     * formatXmlPayload mas abajo.
     */
    formatPayload(payload, format) {
      if (format === 'xml') return this.formatXmlPayload(payload);
      return this.formatJsonPayload(payload);
    }

    /**
     * JSON: comportamiento historico, sin cambios de fondo (solo se le puso
     * nombre propio al separarlo de XML). Si el payload es un string que no es
     * JSON valido, se devuelve tal cual; si es un objeto, se pretty-printea.
     */
    formatJsonPayload(payload) {
      if (typeof payload === 'string') {
        var trimmed = payload.trim();
        if (!trimmed) return payload;

        try {
          return JSON.stringify(JSON.parse(trimmed), null, 2);
        } catch (error) {
          return payload;
        }
      }

      return JSON.stringify(payload == null ? {} : payload, null, 2);
    }

    /**
     * XML/SOAP: el payload que llega aca ya es el texto XML real devuelto por
     * el servidor (ver parseXmlExecutionPayload en collection-execution-center.js),
     * nunca un objeto — a diferencia del camino JSON. Si el servidor ya mando
     * el XML con saltos de linea lo dejamos tal cual (no arriesgamos arruinar
     * un formato que ya es legible); si vino todo en una sola linea (comun en
     * respuestas SOAP reales), lo indentamos para que se pueda leer.
     */
    formatXmlPayload(payload) {
      var raw = String(payload == null ? '' : payload);
      var trimmed = raw.trim();
      if (!trimmed) return raw;
      if (/\r?\n/.test(trimmed)) return raw;
      return this.indentXml(trimmed);
    }

    /**
     * Indentador de XML minimo y sin dependencias: separa por "><" y lleva un
     * contador de profundidad segun sea tag de apertura, cierre, autocontenido
     * o un elemento hoja completo en una sola linea (`<Tag>valor</Tag>`, el
     * caso mas comun en las respuestas SOAP reales). No es un parser XML
     * completo — no hace falta, porque este resultado solo se usa para
     * MOSTRAR el XML, nunca para interpretarlo.
     */
    indentXml(xml) {
      var STEP = '  ';
      var depth = 0;
      var lines = xml.replace(/></g, '>\n<').split('\n');

      return lines.map(function renderIndentedLine(line) {
        var trimmedLine = line.trim();
        var kind = this.classifyXmlLine(trimmedLine);

        if (kind === 'closing' && depth > 0) depth--;
        var renderedLine = new Array(depth + 1).join(STEP) + trimmedLine;
        if (kind === 'opening') depth++;
        return renderedLine;
      }, this).join('\n');
    }

    /**
     * Clasifica una linea de XML (ya recortada) para el indentador de arriba:
     * 'opening' | 'closing' | 'neutral'.
     *
     * El caso que hay que distinguir con cuidado es el elemento hoja completo
     * en una sola linea (`<Tag>valor</Tag>`, o vacio `<Tag></Tag>`): tiene una
     * apertura Y un cierre, asi que NO debe cambiar la profundidad (si se
     * clasificara como 'opening' sin mas, el indentador nunca la compensaria
     * con su propio cierre y toda la indentacion de ahi en mas quedaria
     * corrida — ese fue exactamente el bug de la primera version de esto).
     */
    classifyXmlLine(line) {
      if (/^<\?/.test(line) || /^<!/.test(line)) return 'neutral';
      if (/\/>$/.test(line)) return 'neutral';

      var tagNameMatch = line.match(/^<([A-Za-z_][\w:.-]*)/);
      if (tagNameMatch) {
        var escapedName = this.escapeRegExpLiteral(tagNameMatch[1]);
        var fullLeafPattern = new RegExp('^<' + escapedName + '(?:[^>]*)>[\\s\\S]*</' + escapedName + '>$');
        if (fullLeafPattern.test(line)) return 'neutral';
      }

      if (/^<\//.test(line)) return 'closing';
      if (/^</.test(line)) return 'opening';
      return 'neutral';
    }

    /**
     * Escapa caracteres especiales de regex en un nombre de tag XML (puede
     * traer '.' o ':', como `BTPartners.ObtenerPartnersResponse`) antes de
     * usarlo dentro de un `new RegExp(...)` armado dinamicamente.
     */
    escapeRegExpLiteral(value) {
      return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Traduce estados internos a etiquetas cortas reutilizables.
     */
    statusIcon(status) {
      if (status === 'success') return 'OK';
      if (status === 'error') return 'X';
      if (status === 'running') return '...';
      if (status === 'skipped') return '--';
      return '*';
    }

    /**
     * Escapa cualquier valor antes de insertarlo en HTML.
     */
    escape(value) {
      return this.options.escapeHtml(value == null ? '' : value);
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionExecutionViewRenderer = CollectionExecutionViewRenderer;
})(window);
