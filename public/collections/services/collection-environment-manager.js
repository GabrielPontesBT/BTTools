(function bootstrapCollectionEnvironmentManager(global) {
  'use strict';

  /**
   * Centraliza la lectura del ambiente actual, la prueba de credenciales
   * y la carga de servicios desde Swagger o Base de datos.
   */
  class CollectionEnvironmentManager {
    /**
     * Recibe estado, cliente HTTP y callbacks del builder principal.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Devuelve el origen de servicios activo, usando Swagger por defecto.
     */
    getSelectedSource() {
      return String((this.options.getState().serviceSource || 'swagger')).toLowerCase() === 'database'
        ? 'database'
        : 'swagger';
    }

    /**
     * Sincroniza visibilidad y textos del paso Ambiente según el origen elegido.
     */
    syncSourceUi() {
      var source = this.getSelectedSource();
      var swaggerField = document.getElementById('collection-swagger-field');
      var loadButton = document.getElementById('btn-collection-load-services');
      var sourceSelect = document.getElementById('collection-source-select');

      if (swaggerField) swaggerField.style.display = source === 'swagger' ? 'block' : 'none';
      if (loadButton) loadButton.textContent = 'Cargar servicios';
      if (sourceSelect) sourceSelect.value = source;

      this.syncFormatUi();
    }

    /**
     * Sincroniza el selector de formato (XML/JSON), que solo tiene sentido
     * para V3 (V4 siempre genera JSON, sin eleccion posible en la UI).
     *
     * Por que XML por defecto en V3: la version SOAP/WSDL de los servlets de
     * V3 es la que quedo probada funcionando contra un ambiente real (ver
     * memoria del proyecto "V3 vs V4 protocol conventions"); JSON para V3
     * queda solo como opcion experimental, no como default.
     *
     * `state.v3FormatInitialized` evita pisarle la eleccion al usuario: el
     * default a 'xml' se aplica una sola vez por sesion la primera vez que
     * se detecta version V3, no en cada refresco de la pantalla.
     */
    syncFormatUi() {
      var state = this.options.getState();
      var wizardState = this.options.getWizardState ? this.options.getWizardState() : {};
      var isV3 = wizardState.version === 'V3';
      var formatField = document.getElementById('collection-format-field');
      var formatSelect = document.getElementById('collection-format-select');

      if (!isV3) {
        // V4 no tiene UI para elegir formato: siempre JSON.
        state.format = 'json';
      } else if (!state.v3FormatInitialized) {
        state.format = 'xml';
        state.v3FormatInitialized = true;
      }

      if (formatField) formatField.style.display = isV3 ? 'block' : 'none';
      if (formatSelect) formatSelect.value = state.format || 'xml';
    }

    /**
     * Guarda el formato elegido por el usuario para V3 (XML u JSON) y
     * refresca la UI. No tiene efecto para V4 (queda siempre en 'json').
     */
    updateFormat(value) {
      var state = this.options.getState();
      state.format = String(value || '').trim().toLowerCase() === 'json' ? 'json' : 'xml';
      state.v3FormatInitialized = true;
      this.syncSourceUi();
    }

    /**
     * Calcula y muestra un resumen del ambiente activo dentro del builder.
     * Si detecta cambio de contexto, limpia servicios y casos cargados.
     */
    refreshContext() {
      var summary = document.getElementById('collection-env-summary');
      if (!summary) return;

      var nextKey = this.options.contextKey();
      var state = this.options.getState();

      if (state.contextKey && nextKey && nextKey !== state.contextKey) {
        this.options.resetLoadedData();
        this.options.showStatus('ok', 'Cambio el ambiente cargado. Vuelve a traer los servicios para esta collection.');
      }
      state.contextKey = nextKey;

      if (!this.options.getWizardState || !this.options.getDb || !this.options.getApi) {
        summary.textContent = 'No se pudo leer la configuracion actual del wizard.';
        return;
      }

      var wizardState = this.options.getWizardState();
      if (!wizardState.version || !wizardState.platform) {
        summary.textContent = 'Completa primero version, plataforma, BD y API en el wizard principal.';
        return;
      }

      var db = this.options.getDb();
      var api = this.options.getApi();
      var dbLabel = wizardState.platform === 'sqlserver'
        ? [db.DB_SERVER, db.DB_PORT, db.DB_DATABASE].filter(Boolean).join(' / ')
        : [db.DB_USER, db.DB_CONNECT_STRING].filter(Boolean).join(' @ ');
      var authLabel = wizardState.version === 'V3'
        ? (api.API_AUTH_URL || 'sin API_AUTH_URL')
        : this.options.resolveV4AuthUrl(api);

      var swaggerInput = document.getElementById('collection-swagger-url');
      if (swaggerInput && !swaggerInput.value) {
        var guessedSwaggerUrl = state.swaggerUrl || this.options.guessSwaggerUrl(api);
        if (guessedSwaggerUrl) {
          swaggerInput.value = guessedSwaggerUrl;
          state.swaggerUrl = guessedSwaggerUrl;
        }
      }

      this.syncSourceUi();

      summary.textContent =
        'Version: ' + (wizardState.version || '-') +
        ' | Plataforma: ' + (wizardState.platform || '-') +
        ' | BD: ' + (dbLabel || 'sin datos completos') +
        ' | API publica: ' + ((api.BASE_URL || '').trim() || 'sin BASE_URL') +
        ' | Core: ' + ((api.API_BASE_URL || '').trim() || 'sin API_BASE_URL') +
        ' | Auth: ' + authLabel;
    }

    /**
     * Guarda la URL Swagger que el usuario escribe manualmente.
     */
    updateSwaggerUrl(value) {
      this.options.getState().swaggerUrl = String(value || '').trim();
    }

    /**
     * Guarda el origen de catálogo elegido por el usuario y refresca la UI local.
     */
    updateServiceSource(value) {
      var nextSource = String(value || '').trim().toLowerCase() === 'database'
        ? 'database'
        : 'swagger';
      var state = this.options.getState();
      if (String(state.serviceSource || 'swagger').toLowerCase() !== nextSource) {
        this.options.resetLoadedData();
      }
      state.serviceSource = nextSource;
      this.syncSourceUi();
    }

    /**
     * Prueba la conexion a base usando la configuracion del wizard principal.
     */
    async testDb() {
      this.refreshContext();

      var wizardState = this.options.getWizardState();
      if (!wizardState.platform) {
        this.options.showStatus('err', 'Completa primero la plataforma en el wizard principal.');
        return;
      }

      this.options.showStatus('ok', 'Probando conexion a la base de datos actual...');

      try {
        var data = await this.options.apiClient.testDatabase({
          platform: wizardState.platform,
          db: this.options.getDb()
        });

        this.options.showStatus(data.ok ? 'ok' : 'err', data.ok ? 'Conexion a BD exitosa.' : data.message);
      } catch (error) {
        this.options.showStatus('err', 'No se pudo probar la conexion a la base de datos.');
      }
    }

    /**
     * Prueba la autenticacion del ambiente y persiste el contexto devuelto.
     */
    async testAuth() {
      this.refreshContext();

      var wizardState = this.options.getWizardState();
      if (!wizardState.version) {
        this.options.showStatus('err', 'Completa primero la version en el wizard principal.');
        return;
      }

      this.options.showStatus('ok', 'Probando autenticacion del ambiente actual...');

      try {
        var data = await this.options.apiClient.testAuthentication({
          version: wizardState.version,
          api: this.options.getApi()
        });

        if (data.ok && data.authContext) {
          this.options.getState().authContext = data.authContext;
        }

        this.options.showStatus(data.ok ? 'ok' : 'err', data.ok ? 'Autenticacion exitosa.' : data.message);
      } catch (error) {
        this.options.showStatus('err', 'No se pudo probar la autenticacion.');
      }
    }

    /**
     * Lee servicios desde el origen activo y deja el builder listo para armar el flujo.
     */
    async loadServices() {
      this.refreshContext();

      var state = this.options.getState();
      var wizardState = this.options.getWizardState();

      if (!this.options.isPathSupported()) {
        this.options.showStatus('err', 'Por ahora solo esta disponible el destino Postman (formato JSON o XML).');
        return;
      }
      if (!wizardState.platform) {
        this.options.showStatus('err', 'Completa primero la plataforma en el wizard principal.');
        return;
      }

      if (this.getSelectedSource() === 'database') {
        return this.loadServicesFromDatabase(wizardState, state);
      }

      return this.loadServicesFromSwagger(wizardState, state);
    }

    /**
     * Mantiene el flujo actual de Swagger/OpenAPI como origen principal.
     */
    async loadServicesFromSwagger(wizardState, state) {
      state.swaggerUrl = String(state.swaggerUrl || ((document.getElementById('collection-swagger-url') || {}).value || '')).trim();
      if (!state.swaggerUrl) {
        this.options.showStatus('err', 'Indica primero la ruta Swagger del ambiente.');
        return;
      }

      this.options.showStatus('ok', 'Cargando servicios desde Swagger...');

      try {
        var swaggerData = await this.options.apiClient.loadSwaggerServices({
          swaggerUrl: state.swaggerUrl,
          api: this.options.getApi()
        });
        if (!swaggerData.ok) throw new Error(swaggerData.message);

        state.services = swaggerData.services || [];
        state.serviceOperations = swaggerData.operationsByService || {};
        state.swaggerResolvedUrl = swaggerData.resolvedUrl || '';
        state.swaggerBaseUrl = swaggerData.baseUrl || '';
        state.swaggerAuthUrl = swaggerData.authUrl || '';

        var servicesPanel = document.getElementById('collection-services');
        if (servicesPanel) servicesPanel.style.display = 'block';

        // La autenticacion solo hace falta para ejecutar de verdad (Probar,
        // rellenar datos); el catalogo ya se resolvio leyendo el Swagger, asi
        // que una falla aca es una advertencia y no debe bloquear el builder.
        this.options.showStatus('ok', 'Swagger resuelto. Validando autenticacion del ambiente...');
        try {
          var authData = await this.options.apiClient.testAuthentication({
            version: wizardState.version,
            api: this.options.getApi(),
            authUrl: state.swaggerAuthUrl
          });
          if (authData.ok) state.authContext = authData.authContext || null;
          else this.options.showStatus('err', (authData.message || 'No se pudo autenticar usando el Authenticate del Swagger.') + ' Los servicios ya estan cargados; podes revisar la autenticacion mas tarde.');
        } catch (authError) {
          this.options.showStatus('err', 'No se pudo validar la autenticacion del ambiente. Los servicios ya estan cargados; podes revisar la autenticacion mas tarde.');
        }

        this.options.filterServices();
        this.options.renderVariableEditor();
        this.options.setStudioStage('builder');
        if (state.authContext) this.options.showStatus('ok', 'Servicios cargados correctamente. Entrando al builder...');
      } catch (error) {
        this.options.showStatus('err', error.message || 'No se pudieron cargar los servicios.');
      }
    }

    /**
     * Carga servicios desde BTI014/BTI019 y los normaliza al mismo contrato del builder.
     */
    async loadServicesFromDatabase(wizardState, state) {
      this.options.showStatus('ok', 'Cargando servicios desde Base de datos...');

      try {
        var databaseData = await this.options.apiClient.loadDatabaseServices({
          version: wizardState.version,
          platform: wizardState.platform,
          db: this.options.getDb(),
          api: this.options.getApi()
        });
        if (!databaseData.ok) throw new Error(databaseData.message);

        state.services = databaseData.services || [];
        state.serviceOperations = databaseData.operationsByService || {};
        state.swaggerResolvedUrl = '';
        state.swaggerBaseUrl = String((this.options.getApi().BASE_URL || '')).trim();
        state.swaggerAuthUrl = wizardState.version === 'V4'
          ? this.options.resolveV4AuthUrl(this.options.getApi())
          : String((this.options.getApi().API_AUTH_URL || '')).trim();

        this.options.showStatus('ok', 'Catalogo BTI resuelto. Validando autenticacion del ambiente...');

        var authData = await this.options.apiClient.testAuthentication({
          version: wizardState.version,
          api: this.options.getApi(),
          authUrl: state.swaggerAuthUrl
        });
        if (!authData.ok) throw new Error(authData.message || 'No se pudo autenticar usando la API publica del ambiente.');

        state.authContext = authData.authContext || null;

        var servicesPanel = document.getElementById('collection-services');
        if (servicesPanel) servicesPanel.style.display = 'block';

        this.options.filterServices();
        this.options.renderVariableEditor();
        this.options.setStudioStage('builder');
        this.options.showStatus('ok', (databaseData.warning || 'Servicios cargados desde Base de datos.') + ' Entrando al builder...');
      } catch (error) {
        this.options.showStatus('err', error.message || 'No se pudieron cargar los servicios desde Base de datos.');
      }
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionEnvironmentManager = CollectionEnvironmentManager;
})(window);
