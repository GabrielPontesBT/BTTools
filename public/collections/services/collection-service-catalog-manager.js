(function bootstrapCollectionServiceCatalogManager(global) {
  'use strict';

  /**
   * Encapsula la carga de Swagger y el catálogo visible de servicios/métodos.
   * También concentra la lógica de filtrado y poblamiento de selects.
   */
  class CollectionServiceCatalogManager {
    /**
     * Recibe callbacks y acceso al estado compartido del builder.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Pide al backend la definición Swagger, actualiza el estado y resuelve auth.
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

        // Se persiste la metadata Swagger dentro del estado principal del builder.
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
     * Aplica los filtros actuales al catálogo y sincroniza los selects legacy si existen.
     */
    filterServices() {
      var serviceFilterElement = document.getElementById('col-svc-filter');
      var methodFilterElement = document.getElementById('col-method-filter');
      var serviceFilter = ((serviceFilterElement && serviceFilterElement.value) || '').toLowerCase().trim();
      var methodFilter = ((methodFilterElement && methodFilterElement.value) || '').toLowerCase().trim();
      var serviceSelect = document.getElementById('col-sel-svc');
      var state = this.options.getState();

      if (serviceSelect) {
        var previousValue = serviceSelect.value;
        serviceSelect.innerHTML = '<option value="">-- Seleccionar --</option>';

        state.services.filter(function keepVisibleService(service) {
          if (serviceFilter && service.toLowerCase().indexOf(serviceFilter) < 0) return false;
          if (!methodFilter) return true;

          return (state.serviceOperations[service] || []).some(function matchMethod(operation) {
            var methodName = String(operation.methodName || '').toLowerCase();
            return methodName.indexOf(methodFilter) >= 0;
          });
        }).forEach(function appendServiceOption(service) {
          var option = document.createElement('option');
          option.value = service;
          option.textContent = service;
          if (service === previousValue) option.selected = true;
          serviceSelect.appendChild(option);
        });

        if (previousValue && serviceSelect.value !== previousValue) {
          var methodSelect = document.getElementById('col-sel-mtd');
          if (methodSelect) methodSelect.innerHTML = '<option value="">-- Seleccionar --</option>';
        }
      }

      this.options.renderItems();
    }

    /**
     * Carga los métodos de un servicio puntual en el select legacy.
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
     * Dibuja el catálogo lateral de servicios agrupado por módulo.
     */
    renderServiceCatalog() {
      var container = document.getElementById('collection-service-list');
      if (!container) return;

      var serviceFilter = ((document.getElementById('col-svc-filter') || {}).value || '').toLowerCase().trim();
      var methodFilter = ((document.getElementById('col-method-filter') || {}).value || '').toLowerCase().trim();
      var state = this.options.getState();

      var groups = state.services.map(function mapServiceToGroup(service) {
        if (serviceFilter && service.toLowerCase().indexOf(serviceFilter) < 0) {
          return { service: service, operations: [] };
        }

        var operations = (state.serviceOperations[service] || []).filter(function keepVisibleOperation(operation) {
          var methodName = String(operation.methodName || '').toLowerCase();
          var summary = String(operation.summary || operation.path || '').toLowerCase();
          if (methodFilter && methodName.indexOf(methodFilter) < 0 && summary.indexOf(methodFilter) < 0) return false;
          return true;
        });

        return { service: service, operations: operations };
      }).filter(function removeEmptyGroups(group) {
        return group.operations.length > 0;
      });

      if (!groups.length) {
        container.innerHTML = '<div class="collection-step-empty">Todavia no hay servicios cargados o el filtro no encontro resultados.</div>';
        return;
      }

      container.innerHTML = groups.map(function renderGroup(group) {
        return '<div class="collection-service-group">' +
          '<div class="collection-service-group-title">' + this.options.escapeHtml(group.service) + '</div>' +
          group.operations.map(function renderOperation(operation) {
            return '<div class="collection-service-card" draggable="true" onclick="collectionInsertOperation(' + "'" + this.options.escapeHtml(group.service) + "'" + ', ' + "'" + this.options.escapeHtml(operation.operationKey) + "'" + ')" ondragstart="collectionDragOperation(' + "'" + this.options.escapeHtml(group.service) + "'" + ', ' + "'" + this.options.escapeHtml(operation.operationKey) + "'" + ', event)">' +
              '<div class="collection-service-card-main">' +
                '<div class="collection-service-card-name">' + this.options.escapeHtml(operation.methodName) + '</div>' +
                '<div class="collection-service-card-meta">' + this.options.escapeHtml(String(operation.httpMethod || 'GET').toUpperCase() + ' | ' + (operation.summary || operation.path || 'Sin descripcion')) + '</div>' +
              '</div>' +
              '<span class="collection-service-card-tag">+</span>' +
            '</div>';
          }, this).join('') +
        '</div>';
      }, this).join('');
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionServiceCatalogManager = CollectionServiceCatalogManager;
})(window);
