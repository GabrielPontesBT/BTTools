(function bootstrapCollectionExecutionViewRenderer(global) {
  'use strict';

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

      return '' +
        '<div class="collection-exec-shell collection-exec-shell-redesign">' +
          this.renderHeader(run) +
          this.renderMetrics(run) +
          '<div class="collection-exec-main-layout">' +
            '<div class="collection-exec-main-column">' +
              this.renderFlowPanel(run) +
              this.renderInspector(run) +
            '</div>' +
            this.renderTimelinePanel(run) +
          '</div>' +
        '</div>';
    }

    /**
     * Dibuja una cabecera compacta solo con informacion y acciones
     * propias de la corrida actual.
     */
    renderHeader(run) {
      var statusClass = 'collection-exec-header-line';
      if (run.status === 'error') statusClass += ' collection-exec-header-line-error';
      if (run.status === 'success') statusClass += ' collection-exec-header-line-success';
      if (run.status === 'running') statusClass += ' collection-exec-header-line-running';

      return '' +
        '<section class="collection-exec-header-simple">' +
          '<div class="collection-exec-header-simple-copy">' +
            '<div class="collection-exec-header-title">Ejecucion #' + this.escape(run.id) + '</div>' +
            '<div class="collection-exec-header-meta">' +
              '<span class="' + statusClass + '">' +
                this.escape(run.statusLabel || 'Sin estado') +
                '<span class="collection-exec-inline-separator">&middot;</span>' +
                this.escape(run.durationLabel || '--') +
                '<span class="collection-exec-inline-separator">&middot;</span>' +
                this.escape(((run.stats && run.stats.totalSteps) || 0) + ' pasos') +
              '</span>' +
            '</div>' +
          '</div>' +
          '<div class="collection-exec-header-simple-actions">' +
            (run.status === 'running'
              ? '<button type="button" class="btn btn-outline" onclick="collectionCancelExecutionRun()">Cancelar ejecucion</button>'
              : '<button type="button" class="btn btn-outline" onclick="collectionRerunExecutionFlow()">Reejecutar</button>') +
            this.renderHeaderMenu(run) +
          '</div>' +
        '</section>';
    }

    /**
     * Agrupa acciones globales de la corrida para evitar una barra
     * sobrecargada de botones con igual prioridad visual.
     */
    renderHeaderMenu(run) {
      return '' +
        '<details class="collection-exec-menu">' +
          '<summary class="collection-exec-menu-trigger" onclick="event.stopPropagation()">&#8942;</summary>' +
          '<div class="collection-exec-menu-popover" onclick="event.stopPropagation()">' +
            '<button type="button" class="collection-exec-menu-item" onclick="collectionExportExecutionRun()">Exportar ejecucion</button>' +
            '<button type="button" class="collection-exec-menu-item" onclick="navigator.clipboard && navigator.clipboard.writeText(' + "'" + this.escape(String(run.id || '')) + "'" + ')">Copiar identificador</button>' +
            '<button type="button" class="collection-exec-menu-item" onclick="collectionCloseExecutionMode()">Volver al Builder</button>' +
          '</div>' +
        '</details>';
    }

    /**
     * Resume la corrida con solo tres metricas primarias.
     */
    renderMetrics(run) {
      var stats = run.stats || {};
      var metrics = [
        { label: 'Pasos totales', value: stats.totalSteps || 0, tone: 'neutral', icon: '[]' },
        { label: 'Correctos', value: stats.successCount || 0, tone: 'success', icon: 'OK' },
        { label: 'Con error', value: stats.errorCount || 0, tone: (stats.errorCount || 0) > 0 ? 'error' : 'neutral', icon: 'X' }
      ];

      return '' +
        '<section class="collection-exec-metrics-strip">' +
          metrics.map(function renderMetric(metric) {
            return '' +
              '<div class="collection-exec-metric-card collection-exec-metric-card-' + this.escape(metric.tone) + '">' +
                '<div class="collection-exec-metric-icon">' + this.escape(metric.icon) + '</div>' +
                '<div class="collection-exec-metric-copy">' +
                  '<div class="collection-exec-metric-value">' + this.escape(metric.value) + '</div>' +
                  '<div class="collection-exec-metric-label">' + this.escape(metric.label) + '</div>' +
                '</div>' +
              '</div>';
          }, this).join('') +
        '</section>';
    }

    /**
     * Renderiza el canvas del flujo como protagonista visual de la pantalla.
     */
    renderFlowPanel(run) {
      var steps = this.buildFlowSteps(run);

      return '' +
        '<section class="collection-exec-panel collection-exec-flow-panel">' +
          '<div class="collection-exec-panel-head collection-exec-panel-head-flow">' +
            '<div class="collection-exec-panel-title">Flujo de ejecucion</div>' +
            '<div class="collection-exec-panel-tools">' +
              '<button type="button" class="collection-exec-tool-btn" onclick="collectionCenterExecutionFlow()">Centrar flujo</button>' +
              '<button type="button" class="collection-exec-tool-btn collection-exec-tool-btn-timeline" onclick="collectionToggleExecutionTimeline()">Linea de tiempo</button>' +
            '</div>' +
          '</div>' +
          '<div class="collection-exec-flow-stage collection-exec-flow-stage-linear">' +
            '<div class="collection-exec-flow-track">' +
              steps.map(function renderStep(step, index) {
                var connector = index < (steps.length - 1)
                  ? '<div class="collection-exec-flow-arrow" aria-hidden="true">&rarr;</div>'
                  : '';
                return this.renderExecutionNode(step, run.selectedStepId === step.id) + connector;
              }, this).join('') +
            '</div>' +
          '</div>' +
        '</section>';
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
        return '<section class="collection-exec-panel"><div class="collection-step-empty">Selecciona un paso de la ejecucion para ver su detalle.</div></section>';
      }

      return '' +
        '<section class="collection-exec-panel collection-exec-detail-panel">' +
          '<div class="collection-exec-detail-head-simple">' +
            '<div class="collection-exec-detail-head-copy">' +
              '<div class="collection-exec-detail-title">Paso ' + this.escape(step.index) + ' &middot; ' + this.escape(step.name) + '</div>' +
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
        this.renderKeyValueAccordion('Query params', urlInfo.queryRows, true),
        this.renderKeyValueAccordion('Headers', this.objectToRows(step.requestHeaders), true),
        this.renderCodeAccordion('Body', step.requestBody, true)
      ].filter(Boolean).join('');
      var previewBlock = this.hasContent(step.requestBody)
        ? this.renderPrimaryCodeViewer('Body del request', step.requestBody)
        : this.renderPrimaryTextViewer('URL ejecutada', step.requestUrl || 'Sin URL disponible');

      return '' +
        '<div class="collection-exec-tab-panel">' +
          this.renderInfoCard([
            this.renderInfoRow('Metodo', step.httpMethod || '-'),
            this.renderInfoRow('URL', step.requestUrl || '-')
          ]) +
          previewBlock +
          '<div class="collection-exec-accordion-stack">' +
            (sections || '<div class="collection-step-empty">Este paso no genero datos de request visibles.</div>') +
          '</div>' +
        '</div>';
    }

    /**
     * Muestra la respuesta priorizando estado, duracion y body.
     */
    renderResponseTab(step) {
      var sections = [
        this.renderCodeAccordion('Body', step.responseBody, true),
        this.renderKeyValueAccordion('Headers', this.objectToRows(step.responseHeaders), true)
      ].filter(Boolean).join('');
      var previewBlock = this.hasContent(step.responseBody)
        ? this.renderPrimaryCodeViewer('Body de la response', step.responseBody)
        : this.renderPrimaryTextViewer('Resultado', 'Este paso no devolvio un body visible.');

      return '' +
        '<div class="collection-exec-tab-panel">' +
          this.renderInfoCard([
            this.renderInfoRow('Estado', step.statusLabel || '-'),
            this.renderInfoRow('Tiempo de respuesta', step.durationLabel || '--')
          ]) +
          previewBlock +
          '<div class="collection-exec-accordion-stack">' +
            (sections || '<div class="collection-step-empty">Este paso no devolvio datos de response visibles.</div>') +
          '</div>' +
        '</div>';
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
            this.renderListAccordion('Logs', step.logs, false) +
            this.renderListAccordion('Warnings', step.warnings, false) +
          '</div>' +
        '</div>';
    }

    /**
     * Dibuja una tarjeta simple de informacion para resumenes cortos.
     */
    renderInfoCard(rowsHtml) {
      return '' +
        '<div class="collection-exec-info-card">' +
          '<div class="collection-exec-info-list">' + rowsHtml.join('') + '</div>' +
        '</div>';
    }

    /**
     * Muestra un visor principal de codigo para que request/response
     * vuelvan a tener protagonismo inmediato.
     */
    renderPrimaryCodeViewer(title, payload) {
      return '' +
        '<section class="collection-exec-primary-viewer">' +
          '<div class="collection-exec-primary-viewer-title">' + this.escape(title) + '</div>' +
          '<pre class="collection-exec-code collection-exec-code-primary">' + this.escape(this.formatPayload(payload)) + '</pre>' +
        '</section>';
    }

    /**
     * Muestra un visor textual principal cuando no hay body pero igualmente
     * conviene mostrar algo central y no solo accordions.
     */
    renderPrimaryTextViewer(title, textValue) {
      return '' +
        '<section class="collection-exec-primary-viewer">' +
          '<div class="collection-exec-primary-viewer-title">' + this.escape(title) + '</div>' +
          '<div class="collection-exec-primary-text">' + this.escape(textValue) + '</div>' +
        '</section>';
    }

    /**
     * Dibuja una fila label/valor dentro de una tarjeta compacta.
     */
    renderInfoRow(label, value) {
      return '' +
        '<div class="collection-exec-info-row">' +
          '<div class="collection-exec-info-label">' + this.escape(label) + '</div>' +
          '<div class="collection-exec-info-value">' + this.escape(value) + '</div>' +
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
    renderCodeAccordion(title, payload, openByDefault) {
      if (!this.hasContent(payload)) return '';

      return '' +
        '<details class="collection-exec-accordion"' + (openByDefault ? ' open' : '') + '>' +
          '<summary class="collection-exec-accordion-trigger">' +
            '<span>' + this.escape(title) + '</span>' +
            '<span class="collection-exec-accordion-chevron">v</span>' +
          '</summary>' +
          '<div class="collection-exec-accordion-body">' +
            '<pre class="collection-exec-code">' + this.escape(this.formatPayload(payload)) + '</pre>' +
          '</div>' +
        '</details>';
    }

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
      var open = this.options.isTimelineOpen ? this.options.isTimelineOpen() : false;
      var timelineRows = (run.timeline || []).map(function renderEvent(event) {
        return this.renderTimelineEvent(run, event);
      }, this).join('');

      return '' +
        '<aside class="collection-exec-timeline-drawer' + (open ? ' collection-exec-timeline-drawer-open' : '') + '">' +
          '<section class="collection-exec-side-panel collection-exec-side-panel-timeline">' +
            '<div class="collection-exec-timeline-head">' +
              '<div class="collection-exec-panel-title">Linea de tiempo</div>' +
              '<button type="button" class="collection-exec-timeline-close" onclick="collectionCloseExecutionTimeline()">&times;</button>' +
            '</div>' +
            '<div class="collection-exec-timeline collection-exec-scroll-list collection-exec-scroll-list-timeline">' +
              timelineRows +
            '</div>' +
          '</section>' +
        '</aside>' +
        '<button type="button" class="collection-exec-timeline-backdrop' + (open ? ' show' : '') + '" onclick="collectionCloseExecutionTimeline()"></button>';
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
     */
    formatPayload(payload) {
      if (typeof payload === 'string') return payload;
      return JSON.stringify(payload == null ? {} : payload, null, 2);
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
