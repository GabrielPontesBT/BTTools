(function bootstrapCollectionServiceCatalogManager(global) {
  'use strict';

  var GENERIC_DESCRIPTIONS = ['', 'enter a description', 'sin descripcion', 'sin descripcion.', 'sin descripción'];

  /**
   * Filtra descripciones vacias o placeholders tecnicos (ej. "Enter a description").
   */
  function describeOperation(operation) {
    var raw = String((operation && (operation.summary || operation.path)) || '').trim();
    if (!raw || GENERIC_DESCRIPTIONS.indexOf(raw.toLowerCase()) >= 0) return '';
    return raw;
  }

  /**
   * Devuelve el sufijo de clase CSS para el badge de verbo HTTP.
   */
  function httpMethodBadgeClass(verb) {
    switch (String(verb || '').toUpperCase()) {
      case 'GET': return 'get';
      case 'POST': return 'post';
      case 'PUT': return 'put';
      case 'PATCH': return 'patch';
      case 'DELETE': return 'delete';
      default: return 'default';
    }
  }

  /**
   * Encapsula la carga de Swagger y el catalogo visible de servicios/metodos.
   * Tambien concentra la logica de filtrado y poblamiento de selects.
   */
  class CollectionServiceCatalogManager {
    /**
     * Recibe callbacks y acceso al estado compartido del builder.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Pide al backend la definicion Swagger, actualiza el estado y resuelve auth.
     */
    async loadServices() {
      this.options.refreshContext();

      if (!this.options.pathSupported()) {
        this.options.showStatus('err', 'Por ahora solo esta disponible el camino JSON + Postman.');
        return;
      }
      if (!this.options.getPlatform()) {
        this.options.showStatus('err', 'Completa primero la plataforma en el wizard principal.');
        return;
      }

      var state = this.options.getState();
      state.swaggerUrl = String(state.swaggerUrl || ((document.getElementById('collection-swagger-url') || {}).value || '')).trim();
      if (!state.swaggerUrl) {
        this.options.showStatus('err', 'Indica primero la ruta Swagger del ambiente.');
        return;
      }

      this.options.showStatus('ok', 'Leyendo Swagger del ambiente...');

      try {
        var response = await fetch('/api/collection/swagger/load', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            swaggerUrl: state.swaggerUrl,
            api: this.options.getApi()
          })
        });
        var data = await response.json();
        if (!data.ok) throw new Error(data.message);

        state.services = data.services || [];
        state.serviceOperations = data.operationsByService || {};
        state.swaggerResolvedUrl = data.resolvedUrl || '';
        state.swaggerBaseUrl = data.baseUrl || '';
        state.swaggerAuthUrl = data.authUrl || '';

        var servicesPanel = document.getElementById('collection-services');
        if (servicesPanel) servicesPanel.style.display = 'block';

        this.options.showStatus('ok', 'Swagger resuelto. Autenticando contra ese mismo ambiente...');
        var authResponse = await fetch('/api/test-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version: this.options.getVersion(),
            api: this.options.getApi(),
            authUrl: state.swaggerAuthUrl
          })
        });
        var authData = await authResponse.json();
        if (!authData.ok) throw new Error(authData.message || 'No se pudo autenticar usando el Authenticate del Swagger.');

        state.authContext = authData.authContext || null;

        this.filterServices();
        this.options.renderVariableEditor();
        this.options.setStudioStage('builder');
        this.options.showStatus('ok', 'Swagger cargado y autenticacion resuelta usando ese mismo Swagger. Ahora arma el flujo.');
      } catch (error) {
        this.options.showStatus('err', error.message || 'No se pudieron cargar los servicios.');
      }
    }

    /**
     * Dispara un repintado del catalogo cuando cambia el termino de busqueda.
     * El repintado real del drawer ocurre dentro de renderItems (ver collection-canvas-manager).
     */
    filterServices() {
      this.options.renderItems();
    }

    /**
     * Carga los metodos de un servicio puntual en el select legacy.
     */
    loadMethods(service) {
      var methodSelect = document.getElementById('col-sel-mtd');
      if (!methodSelect) return;

      methodSelect.innerHTML = '<option value="">Cargando...</option>';
      if (!service) {
        methodSelect.innerHTML = '<option value="">-- Seleccionar --</option>';
        return;
      }

      methodSelect.innerHTML = '<option value="">-- Seleccionar --</option>';
      (this.options.getState().serviceOperations[service] || []).forEach(function appendMethodOption(operation, index) {
        var option = document.createElement('option');
        option.value = operation.operationKey || (service + '::' + operation.methodName + '::' + index);
        option.textContent = operation.methodName + ' [' + String(operation.httpMethod || 'GET').toUpperCase() + ']';
        methodSelect.appendChild(option);
      });
    }

    /**
     * Dibuja el catalogo del drawer izquierdo agrupado por servicio.
     */
    renderServiceCatalog() {
      var container = document.getElementById('collection-service-list');
      if (!container) return;

      var state = this.options.getState();
      var shellManager = typeof collectionGetBuilderShellManager === 'function' ? collectionGetBuilderShellManager() : null;

      if (!state.services.length) {
        container.innerHTML = '<div class="collection-service-empty-state">No hay servicios disponibles.</div>';
        if (typeof collectionSyncBuilderShellState === 'function') collectionSyncBuilderShellState();
        return;
      }

      var searchTerm = ((document.getElementById('collection-service-search') || {}).value || '').toLowerCase().trim();

      var groups = state.services.map(function mapServiceToGroup(service) {
        var operations = (state.serviceOperations[service] || []).filter(function keepVisibleOperation(operation) {
          if (!searchTerm) return true;
          var haystack = [service, operation.methodName, operation.httpMethod, operation.summary, operation.path]
            .join(' ').toLowerCase();
          return haystack.indexOf(searchTerm) >= 0;
        });
        return { service: service, operations: operations };
      }).filter(function removeEmptyGroups(group) {
        return group.operations.length > 0;
      });

      if (!groups.length) {
        container.innerHTML = '<div class="collection-service-empty-state">' +
          'No encontramos servicios o metodos con ese criterio.' +
          '<button type="button" class="collection-service-clear-search" onclick="collectionClearServiceSearch()">Limpiar busqueda</button>' +
        '</div>';
        if (typeof collectionSyncBuilderShellState === 'function') collectionSyncBuilderShellState();
        return;
      }

      var isSearching = !!searchTerm;
      var selectionCount = shellManager ? shellManager.getCatalogSelectionCount() : 0;

      container.innerHTML = '<div class="collection-service-drawer-scroll">' + groups.map(function renderGroup(group) {
        var escapedService = this.options.escapeHtml(group.service);
        var isCollapsed = !isSearching && !!(shellManager && shellManager.isServiceGroupCollapsed(group.service));

        return '<div class="collection-service-group' + (isCollapsed ? ' collection-service-group-collapsed' : '') + '">' +
          '<button type="button" class="collection-service-group-title" aria-expanded="' + (isCollapsed ? 'false' : 'true') + '" onclick="collectionToggleServiceGroup(\'' + escapedService + '\')">' +
            '<span class="collection-service-group-chevron" aria-hidden="true">&#9656;</span>' +
            '<span class="collection-service-group-name">' + escapedService + '</span>' +
            '<span class="collection-service-group-count">' + group.operations.length + '</span>' +
          '</button>' +
          '<div class="collection-service-group-body">' +
            group.operations.map(function renderOperation(operation) {
              var isSelected = !!(shellManager && shellManager.isCatalogOperationSelected(group.service, operation.operationKey));
              var escapedOperationKey = this.options.escapeHtml(operation.operationKey);
              var verb = String(operation.httpMethod || 'GET').toUpperCase();
              var description = describeOperation(operation);

              return '<div class="collection-service-card' + (isSelected ? ' collection-service-card-selected' : '') + '" onclick="collectionInsertCatalogOperation(\'' + escapedService + '\', \'' + escapedOperationKey + '\')">' +
                '<label class="collection-service-card-check" onclick="event.stopPropagation()">' +
                  '<input type="checkbox" ' + (isSelected ? 'checked ' : '') + 'onchange="collectionToggleCatalogSelection(\'' + escapedService + '\', \'' + escapedOperationKey + '\', this.checked)">' +
                  '<span></span>' +
                '</label>' +
                '<div class="collection-service-card-main">' +
                  '<div class="collection-service-card-name">' + this.options.escapeHtml(operation.methodName) + '</div>' +
                  (description ? '<div class="collection-service-card-meta">' + this.options.escapeHtml(description) + '</div>' : '') +
                '</div>' +
                '<span class="collection-service-card-tag collection-service-card-tag-' + httpMethodBadgeClass(verb) + '">' + verb + '</span>' +
                '<span class="collection-service-drag-handle" draggable="true" title="Arrastrar al flujo" onclick="event.stopPropagation()" ondragstart="collectionDragOperation(\'' + escapedService + '\', \'' + escapedOperationKey + '\', event)">&#8942;&#8942;</span>' +
              '</div>';
            }, this).join('') +
          '</div>' +
        '</div>';
      }, this).join('') + '</div>' +
      '<div class="collection-service-drawer-footer">' +
        '<div id="collection-builder-selection-count" class="collection-service-selection-count">' + selectionCount + ' seleccionado' + (selectionCount === 1 ? '' : 's') + '</div>' +
        '<div class="collection-service-drawer-actions">' +
          (selectionCount ? '<button type="button" class="collection-service-clear-selection" onclick="collectionClearCatalogSelection()">Limpiar</button>' : '') +
          '<button type="button" class="btn btn-primary" id="btn-collection-add-selected" onclick="collectionAddSelectedCatalogOperations()" disabled>Agregar al flujo</button>' +
        '</div>' +
      '</div>';

      if (typeof collectionSyncBuilderShellState === 'function') collectionSyncBuilderShellState();
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionServiceCatalogManager = CollectionServiceCatalogManager;
})(window);
