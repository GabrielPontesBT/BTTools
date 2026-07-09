(function bootstrapCollectionEnvironmentManager(global) {
  'use strict';

  /**
   * Centraliza la lectura del ambiente actual, la prueba de credenciales
   * y la carga de servicios desde Swagger.
   */
  class CollectionEnvironmentManager {
    /**
     * Recibe estado, cliente HTTP y callbacks del builder principal.
     */
    constructor(options) {
      this.options = options || {};
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
     * Lee Swagger, resuelve base/auth y autentica automaticamente contra ese ambiente.
     */
    async loadServices() {
      this.refreshContext();

      var state = this.options.getState();
      var wizardState = this.options.getWizardState();

      if (!this.options.isPathSupported()) {
        this.options.showStatus('err', 'Por ahora solo esta disponible el camino JSON + Postman.');
        return;
      }
      if (!wizardState.platform) {
        this.options.showStatus('err', 'Completa primero la plataforma en el wizard principal.');
        return;
      }

      state.swaggerUrl = String(state.swaggerUrl || ((document.getElementById('collection-swagger-url') || {}).value || '')).trim();
      if (!state.swaggerUrl) {
        this.options.showStatus('err', 'Indica primero la ruta Swagger del ambiente.');
        return;
      }

      this.options.showStatus('ok', 'Leyendo Swagger del ambiente...');

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

        this.options.showStatus('ok', 'Swagger resuelto. Autenticando contra ese mismo ambiente...');

        var authData = await this.options.apiClient.testAuthentication({
          version: wizardState.version,
          api: this.options.getApi(),
          authUrl: state.swaggerAuthUrl
        });
        if (!authData.ok) throw new Error(authData.message || 'No se pudo autenticar usando el Authenticate del Swagger.');

        state.authContext = authData.authContext || null;

        this.options.filterServices();
        this.options.renderVariableEditor();
        this.options.setStudioStage('builder');
        this.options.showStatus('ok', 'Swagger cargado y autenticacion resuelta usando ese mismo Swagger. Ahora arma el flujo.');
      } catch (error) {
        this.options.showStatus('err', error.message || 'No se pudieron cargar los servicios.');
      }
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionEnvironmentManager = CollectionEnvironmentManager;
})(window);
