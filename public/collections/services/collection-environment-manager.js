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
      var wizardState = this.options.getWizardState ? this.options.getWizardState() : {};
      var swaggerField = document.getElementById('collection-swagger-field');
      var internaBaseField = document.getElementById('collection-interna-base-field');
      var loadButton = document.getElementById('btn-collection-load-services');
      var sourceSelect = document.getElementById('collection-source-select');

      if (swaggerField) swaggerField.style.display = source === 'swagger' ? 'block' : 'none';
      if (source === 'swagger') this.renderSwaggerUrlList();
      // La URL de la API interna (gateway REST distinto del de API publica,
      // ej. ':5107/api/platform' en vez de ':5101/api/publicapi') solo hace
      // falta cuando el catalogo viene de Base de datos y el ambiente es
      // "API interna" — con Swagger como origen, esa base ya sale del propio
      // documento (ver resolveSwaggerServerUrl en index.js).
      if (internaBaseField) internaBaseField.style.display = (source === 'database' && wizardState.apiMode === 'interna') ? 'block' : 'none';
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
      // "API interna" tambien expone algunos servicios solo por SOAP (mismos
      // servlets com.dlya.bantotal.ardwsbt_{Service}_v1 que V3, mismo Core),
      // asi que el selector de formato aplica igual que V3 en ese caso -- pero
      // SOLO cuando el catalogo viene de Base de datos: un Swagger describe
      // API REST/JSON por definicion, no hay eleccion posible ahi (elegir
      // "XML (SOAP)" con origen Swagger hacia que la ejecucion tomara la rama
      // SOAP de executeCollectionFlow contra operaciones que en realidad son
      // REST, rompiendo todo con errores como "Token is blank").
      var isV4Interna = wizardState.version === 'V4' && wizardState.apiMode === 'interna' && this.getSelectedSource() === 'database';
      var showFormatChoice = isV3 || isV4Interna;
      var formatField = document.getElementById('collection-format-field');
      var formatSelect = document.getElementById('collection-format-select');

      if (!showFormatChoice) {
        // Sin eleccion de formato (V4 publica): siempre JSON.
        state.format = 'json';
      } else if (!state.v3FormatInitialized) {
        state.format = 'xml';
        state.v3FormatInitialized = true;
      }

      if (formatField) formatField.style.display = showFormatChoice ? 'block' : 'none';
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

      // Solo se autocompleta mientras la lista este vacia -- una vez que el
      // usuario agrego (o borro) swaggers a mano, no le pisamos la eleccion.
      if (!Array.isArray(state.swaggerUrls)) state.swaggerUrls = [];
      if (!state.swaggerUrls.length) {
        var guessedSwaggerUrl = this.options.guessSwaggerUrl(api);
        if (guessedSwaggerUrl) state.swaggerUrls.push(guessedSwaggerUrl);
      }
      this.renderSwaggerUrlList();

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
     * Guarda la URL base del gateway REST de "API interna" (distinta de la
     * de "API publica" — ver loadServicesFromDatabase, que es donde se usa).
     */
    updateInternaBaseUrl(value) {
      this.options.getState().internaBaseUrl = String(value || '').trim();
    }

    /**
     * Guarda si se debe detectar y probar la autenticacion automaticamente al
     * cargar servicios (Session.userLogin/Authenticate detectado en el
     * swagger). Destildado, el usuario ajusta la autenticacion a mano
     * despues -- util cuando la deteccion le pega mal a un ambiente puntual.
     */
    updateAutoDetectAuth(checked) {
      this.options.getState().autoDetectAuth = checked !== false;
    }

    /**
     * Suma una URL Swagger a la lista del ambiente. Cada microservicio de un
     * ambiente real puede tener la suya propia (distinto host/puerto); ver
     * loadServicesFromSwagger, que carga todas juntas y arma un catalogo
     * combinado. Ignora vacios y duplicados exactos.
     */
    addSwaggerUrl(value) {
      var state = this.options.getState();
      if (!Array.isArray(state.swaggerUrls)) state.swaggerUrls = [];
      var url = String(value || '').trim();
      if (!url || state.swaggerUrls.indexOf(url) !== -1) return;
      state.swaggerUrls.push(url);
      this.renderSwaggerUrlList();
    }

    /**
     * Quita una URL Swagger de la lista por indice.
     */
    removeSwaggerUrl(index) {
      var state = this.options.getState();
      if (!Array.isArray(state.swaggerUrls)) return;
      state.swaggerUrls.splice(index, 1);
      this.renderSwaggerUrlList();
    }

    /**
     * Redibuja la lista de swaggers agregados con su boton de quitar. El
     * input de texto queda libre para escribir la siguiente URL a agregar.
     */
    renderSwaggerUrlList() {
      var container = document.getElementById('collection-swagger-url-list');
      if (!container) return;
      var state = this.options.getState();
      var urls = Array.isArray(state.swaggerUrls) ? state.swaggerUrls : [];
      var escapeHtml = this.options.escapeHtml || function(text) { return String(text == null ? '' : text); };

      if (!urls.length) {
        container.innerHTML = '<div class="collection-swagger-url-empty">Sin swaggers agregados todavia.</div>';
        return;
      }

      container.innerHTML = urls.map(function(url, index) {
        return '<div class="collection-swagger-url-row">' +
          '<span class="collection-swagger-url-text">' + escapeHtml(url) + '</span>' +
          '<button type="button" class="collection-swagger-url-remove" onclick="collectionRemoveSwaggerUrl(' + index + ')">Quitar</button>' +
          '</div>';
      }).join('');
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
      // Un ambiente puede tener varios swaggers (un microservicio por puerto
      // -- publicapi/loan/customer/etc, cada uno con su propio host) en vez
      // de un gateway unico. La lista se arma con addSwaggerUrl/
      // renderSwaggerUrlList; ver tambien extractSwaggerOperations en
      // index.js (cada operacion recuerda de que swagger salio).
      var swaggerUrls = (Array.isArray(state.swaggerUrls) ? state.swaggerUrls : [])
        .map(function(url) { return String(url || '').trim(); })
        .filter(Boolean);
      if (!swaggerUrls.length) {
        this.options.showStatus('err', 'Agrega al menos una ruta Swagger del ambiente.');
        return;
      }

      this.options.showStatus('ok', swaggerUrls.length > 1
        ? 'Cargando servicios desde ' + swaggerUrls.length + ' swaggers...'
        : 'Cargando servicios desde Swagger...');

      var autoDetectAuth = state.autoDetectAuth !== false;

      try {
        var swaggerData = await this.options.apiClient.loadSwaggerServices({
          swaggerUrls: swaggerUrls,
          api: this.options.getApi(),
          apiMode: wizardState.apiMode,
          autoDetectAuth: autoDetectAuth
        });
        if (!swaggerData.ok) throw new Error(swaggerData.message);

        state.services = swaggerData.services || [];
        state.serviceOperations = swaggerData.operationsByService || {};
        state.swaggerResolvedUrl = swaggerData.resolvedUrl || '';
        state.swaggerBaseUrl = swaggerData.baseUrl || '';
        state.swaggerAuthUrl = swaggerData.authUrl || '';
        // 'session-userlogin' para "API interna" (detectado en el swagger),
        // 'authenticate-execute' para "API publica" -- ver
        // findInternaAuthOperation en index.js. Determina el shape del
        // request/response tanto al ejecutar como al exportar la collection.
        state.swaggerAuthKind = swaggerData.authKind || null;

        var servicesPanel = document.getElementById('collection-services');
        if (servicesPanel) servicesPanel.style.display = 'block';

        // No todos los swaggers de la lista tienen por que responder bien
        // (ej. un microservicio caido) -- se avisa cuales fallaron, pero no
        // bloquea a los que si funcionaron.
        var failedSources = swaggerData.failedSources || [];
        var failedNote = failedSources.length
          ? (' (' + failedSources.length + ' de ' + swaggerUrls.length + ' no respondieron: ' + failedSources.map(function(f) { return f.swaggerUrl; }).join(', ') + ')')
          : '';

        // Con "Detectar autenticacion automaticamente" destildado, o si la
        // deteccion no encontro nada (swaggerData.authWarning), no se intenta
        // autenticar: el catalogo ya quedo cargado y el usuario ajusta la
        // autenticacion a mano despues (en la collection generada).
        if (!autoDetectAuth || !state.swaggerAuthUrl) {
          state.authContext = null;
          var skipNote = swaggerData.authWarning || 'Autenticacion no detectada automaticamente.';
          this.options.showStatus('ok', 'Swagger resuelto' + failedNote + '. ' + skipNote + ' Entrando al builder...', 'Servicios cargados');
        } else {
          // La autenticacion solo hace falta para ejecutar de verdad (Probar,
          // rellenar datos); el catalogo ya se resolvio leyendo el/los
          // Swagger, asi que una falla aca es una advertencia y no debe
          // bloquear el builder.
          this.options.showStatus('ok', 'Swagger resuelto' + failedNote + '. Validando autenticacion del ambiente...');
          try {
            var authData = await this.options.apiClient.testAuthentication({
              version: wizardState.version,
              api: this.options.getApi(),
              authUrl: state.swaggerAuthUrl,
              apiMode: wizardState.apiMode,
              authKind: state.swaggerAuthKind
            });
            if (authData.ok) {
              state.authContext = authData.authContext || null;
              // El esquema que realmente respondio manda sobre el detectado
              // en el swagger: "Probar autenticacion" prueba user-login y
              // Authenticate en orden, asi que su resultado es dato medido
              // y no inferencia (ver authCandidates en bantotal-urls).
              if (authData.authKind) state.swaggerAuthKind = authData.authKind;
              if (authData.authUrl) state.swaggerAuthUrl = authData.authUrl;
            }
            else this.options.showStatus('warn', (authData.message || 'No se pudo autenticar usando el Authenticate del Swagger.') + ' Los servicios ya estan cargados; podes revisar la autenticacion mas tarde.', 'Autenticacion pendiente');
          } catch (authError) {
            this.options.showStatus('warn', 'No se pudo validar la autenticacion del ambiente. Los servicios ya estan cargados; podes revisar la autenticacion mas tarde.', 'Autenticacion pendiente');
          }
        }

        this.options.filterServices();
        this.options.renderVariableEditor();
        this.options.setStudioStage('builder');
        if (state.authContext) this.options.showStatus('ok', 'Entrando al builder...' + failedNote, 'Servicios cargados correctamente');
      } catch (error) {
        this.options.showStatus('err', error.message || 'No se pudieron cargar los servicios.');
      }
    }

    /**
     * Carga servicios desde BTI014/BTI019 y los normaliza al mismo contrato del builder.
     */
    async loadServicesFromDatabase(wizardState, state) {
      var isInterna = wizardState.apiMode === 'interna';
      if (isInterna && !String(state.internaBaseUrl || '').trim()) {
        this.options.showStatus('err', 'Completa primero la URL de la API interna (el gateway REST de este ambiente, distinto del de API publica).');
        return;
      }

      this.options.showStatus('ok', 'Cargando servicios desde Base de datos...');

      try {
        var databaseData = await this.options.apiClient.loadDatabaseServices({
          version: wizardState.version,
          platform: wizardState.platform,
          apiMode: wizardState.apiMode,
          // El catalogo queda armado (httpMethod/path por item) segun el
          // formato ya elegido en el panel -- para "API interna" cambia si
          // es SOAP o REST (ver buildDatabaseOperations en index.js).
          format: state.format,
          db: this.options.getDb(),
          api: this.options.getApi()
        });
        if (!databaseData.ok) throw new Error(databaseData.message);

        state.services = databaseData.services || [];
        state.serviceOperations = databaseData.operationsByService || {};
        state.swaggerResolvedUrl = '';
        // Para "API interna" el catalogo viene de la base (BTCBS014/019/026)
        // pero la ruta real de ejecucion es un gateway distinto (ej.
        // ':5107/api/platform', sin el prefijo '/public/') que no se puede
        // inferir de ningun otro campo del wizard — el usuario lo escribe
        // en "URL de la API interna" (ver syncSourceUi/updateInternaBaseUrl).
        state.swaggerBaseUrl = isInterna
          ? String(state.internaBaseUrl || '').trim()
          : String((this.options.getApi().BASE_URL || '')).trim();
        if (isInterna) {
          // "API interna" no se autentica con Authenticate.Execute (eso es
          // de la API publica, resolveV4AuthUrl no sabe nada de interna) --
          // la autenticacion real es Session.userLogin por SOAP y ya se
          // resuelve sola al ejecutar (ver authenticateSessionInternaSoap en
          // index.js). Este chequeo previo no aplica aca: se salta en vez de
          // fallar con una URL armada para el mecanismo equivocado.
          state.swaggerAuthUrl = '';
          state.authContext = null;
        } else {
          state.swaggerAuthUrl = wizardState.version === 'V4'
            ? this.options.resolveV4AuthUrl(this.options.getApi())
            : String((this.options.getApi().API_AUTH_URL || '')).trim();

          this.options.showStatus('ok', 'Catalogo BTI resuelto. Validando autenticacion del ambiente...');

          // V4 va sin authUrl explicita a proposito: sin ella el backend
          // prueba el user-login y, si el ambiente no migro, degrada al
          // Authenticate viejo, y devuelve cual de los dos anduvo. Con una
          // URL explicita ese fallback se apaga.
          var authData = await this.options.apiClient.testAuthentication({
            version: wizardState.version,
            api: this.options.getApi(),
            authUrl: wizardState.version === 'V4' ? '' : state.swaggerAuthUrl
          });
          if (!authData.ok) throw new Error(authData.message || 'No se pudo autenticar usando la API publica del ambiente.');

          state.authContext = authData.authContext || null;
          if (authData.authKind) state.swaggerAuthKind = authData.authKind;
          if (authData.authUrl) state.swaggerAuthUrl = authData.authUrl;
        }

        var servicesPanel = document.getElementById('collection-services');
        if (servicesPanel) servicesPanel.style.display = 'block';

        this.options.filterServices();
        this.options.renderVariableEditor();
        this.options.setStudioStage('builder');
        this.options.showStatus('ok', (databaseData.warning || 'Servicios cargados desde Base de datos.') + ' Entrando al builder...', 'Servicios cargados');
      } catch (error) {
        this.options.showStatus('err', error.message || 'No se pudieron cargar los servicios desde Base de datos.');
      }
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionEnvironmentManager = CollectionEnvironmentManager;
})(window);
