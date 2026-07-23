(function bootstrapCollectionExecutionCenter(global) {
  'use strict';

  /**
   * Orquesta el nuevo Execution Mode.
   * Esta clase no contiene HTML complejo: delega dataset mock y renderizado
   * a mÃ³dulos especÃ­ficos para mantener una arquitectura empresarial.
   */
  class CollectionExecutionCenter {
    /**
     * Recibe todas las dependencias externas necesarias para operar.
     */
    constructor(options) {
      this.options = options || {};
      this.mockBuilder = new global.BTCollectionModules.CollectionExecutionMockDataBuilder({
        ensureScenarioConnections: this.options.ensureScenarioConnections,
        buildConnectionLabel: this.options.buildConnectionLabel
      });
      this.renderer = new global.BTCollectionModules.CollectionExecutionViewRenderer({
        escapeHtml: this.options.escapeHtml,
        isTimelineOpen: this.isTimelineOpen.bind(this),
        getZoomLevel: this.getZoomLevel.bind(this),
        isFlowExpanded: this.isFlowExpanded.bind(this)
      });
      this.executionState = {
        active: false,
        loading: false,
        run: null,
        playbackToken: 0,
        timelineOpen: false,
        zoomLevel: 1,
        flowExpanded: true
      };
      this.boundHandleTimelineKeydown = this.handleTimelineKeydown.bind(this);
    }

    /**
     * Cierra la linea de tiempo con Escape, como cualquier drawer superpuesto.
     */
    handleTimelineKeydown(event) {
      if (event.key === 'Escape') this.closeTimelineOpen();
    }

    /**
     * Limpia la corrida mock almacenada y devuelve la vista al estado base.
     */
    reset() {
      this.stopPlayback();
      this.executionState.active = false;
      this.executionState.loading = false;
      this.executionState.run = null;
      this.executionState.timelineOpen = false;
      this.executionState.zoomLevel = 1;
      this.syncTimelineKeydownListener();
      this.syncButtons(false);
      this.render();
    }

    /**
     * Cierra el modo ejecucion y vuelve al builder.
     */
    close() {
      this.stopPlayback();
      this.executionState.active = false;
      this.executionState.loading = false;
      this.executionState.timelineOpen = false;
      this.syncTimelineKeydownListener();
      this.render();
      this.syncButtons(false);
      this.options.showStatus('ok', 'Volviste al modo edicion del constructor.');
    }

    /**
     * Compatibilidad: en el nuevo enfoque minimizar equivale a cerrar la vista
     * de ejecucion y dejar el builder visible.
     */
    minimize() {
      this.close();
    }

    /**
     * Compatibilidad: restore vuelve a abrir la vista si ya existe una corrida.
     */
    restore() {
      if (!this.executionState.run) return;
      this.executionState.active = true;
      this.executionState.timelineOpen = false;
      this.render();
    }

    /**
     * Compatibilidad con el boton antiguo "Consola".
     * Ahora simplemente abre el Execution Mode actual.
     */
    open() {
      if (!this.executionState.run) {
        this.options.showStatus('err', 'Todavia no hay una ejecucion para mostrar.');
        return;
      }
      this.executionState.active = true;
      this.render();
    }

    /**
     * Se conserva por compatibilidad con markup previo.
     * Ya no existe backdrop modal real, por eso queda como no-op controlado.
     */
    handleBackdrop() {
      return;
    }

    /**
     * Se conserva por compatibilidad con adapters existentes.
     * El nuevo modo no consume HTML externo directo.
     */
    setHtml() {
      return;
    }

    /**
     * Se conserva por compatibilidad con adapters existentes.
     */
    buildPopupShell(content) {
      return String(content || '');
    }

    /**
     * Renderiza un estado breve de carga antes de la corrida final mock.
     */
    renderLoading() {
      this.executionState.active = true;
      this.executionState.loading = true;
      this.render();
    }

    /**
     * Toma un run ya armado y lo vuelve visible.
     */
    renderResult(data) {
      var wasActive = this.executionState.active;
      this.executionState.run = data || null;
      this.executionState.loading = false;
      this.executionState.active = !!data;

      if (data && !wasActive) {
        // En notebook la timeline arranca plegada; en pantallas grandes, visible.
        var isWideScreen = typeof window !== 'undefined' && window.innerWidth > 1440;
        this.executionState.timelineOpen = isWideScreen;
        // En notebook el flujo arranca colapsado (breadcrumb) para darle mas alto al inspector.
        this.executionState.flowExpanded = isWideScreen;
        this.executionState.zoomLevel = 1;
      }

      this.syncTimelineKeydownListener();
      this.render();

      if (data && !wasActive) this.centerSelectedNode();
    }

    /**
     * Centra el nodo seleccionado dentro del flujo al abrir una corrida nueva,
     * asi el paso relevante (error o ultimo ejecutado) queda visible sin que
     * el usuario tenga que buscarlo manualmente.
     */
    centerSelectedNode() {
      var run = this.executionState.run;
      if (!run) return;

      setTimeout(function scrollIntoView() {
        var node = document.querySelector('.collection-exec-node-selected');
        if (node && node.scrollIntoView) node.scrollIntoView({ block: 'center', inline: 'center' });
      }, 0);
    }

    /**
     * Entrada principal del boton Probar.
     * Ejecuta el flujo real contra el backend local y luego traduce el resultado
     * al mismo formato visual que ya consume el Execution Mode.
     */
    async executeFlow() {
      var scenario = null;
      var payload = null;
      var result = null;
      var run = null;

      if (!this.options.isPathSupported()) {
        this.options.showStatus('err', 'Por ahora solo esta disponible JSON + Postman.');
        return;
      }

      this.options.syncInspectorInputs();
      this.options.refreshContext();

      if (!this.options.getVersion()) {
        this.options.showStatus('err', 'Completa primero version y ambiente en el wizard principal.');
        return;
      }

      scenario = this.options.getActiveScenario();
      if (!scenario || !scenario.items || !scenario.items.length) {
        this.options.showStatus('err', 'Agrega al menos un metodo al caso de uso activo.');
        return;
      }

      this.syncButtons(true);
      this.options.showStatus('ok', 'Ejecutando flujo real contra el ambiente actual...');
      this.renderLoading();

      try {
        payload = this.buildExecutionPayload(scenario);
        result = await this.options.executeFlowRequest(payload);
        run = this.buildRunFromExecutionResult(result, scenario);
        this.preparePlaybackRun(run);
        this.renderResult(run);
        await this.playRun(run);
        this.syncButtons(false);
        this.options.showStatus(result && result.ok ? 'ok' : 'err', result && result.ok
          ? 'El flujo se ejecuto correctamente contra el ambiente.'
          : this.buildExecutionErrorMessage(result));
      } catch (error) {
        run = this.buildRunFromExecutionResult(error || {}, scenario);
        this.preparePlaybackRun(run);
        this.renderResult(run);
        await this.playRun(run);
        this.syncButtons(false);
        this.options.showStatus('err', error && error.message ? error.message : 'No se pudo ejecutar el flujo.');
      }
    }

    /**
     * Reejecuta la corrida completa manteniendo el mismo caso de uso activo.
     */
    async rerunFlow() {
      return this.executeFlow();
    }

    /**
     * Reejecuta desde el paso seleccionado.
     * Como los datos son mock, hoy reutiliza el mismo pipeline pero deja
     * seleccionado el paso actual en la corrida nueva.
     */
    async rerunFromSelectedStep() {
      var currentStepId = this.executionState.run ? this.executionState.run.selectedStepId : '';
      await this.executeFlow();
      if (currentStepId) this.selectStep(currentStepId);
    }

    /**
     * Exporta la corrida mock actual como JSON descargable.
     */
    exportRun() {
      if (!this.executionState.run) {
        this.options.showStatus('err', 'Todavia no hay una ejecucion para exportar.');
        return;
      }

      var blob = new Blob([JSON.stringify(this.executionState.run, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');

      link.href = url;
      link.download = 'bttools-execution-run-' + this.executionState.run.id + '.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.options.showStatus('ok', 'La corrida se exporto en JSON.');
    }

    /**
     * Selecciona un paso dentro de la corrida visible.
     */
    selectStep(stepId) {
      if (!this.executionState.run) return;
      this.executionState.run.selectedStepId = stepId;
      this.render();
    }

    /**
     * Cambia el tab activo del panel inferior.
     */
    setTab(tabKey) {
      if (!this.executionState.run) return;
      this.executionState.run.selectedTab = tabKey || 'details';
      this.render();
    }

    /**
     * Informa si el drawer de linea de tiempo esta visible.
     */
    isTimelineOpen() {
      return !!this.executionState.timelineOpen;
    }

    /**
     * Devuelve el nivel de zoom actual del flujo (1 = 100%).
     */
    getZoomLevel() {
      return this.executionState.zoomLevel || 1;
    }

    /**
     * Acerca el flujo un escalon, sin pasar el maximo permitido.
     */
    zoomIn() {
      this.executionState.zoomLevel = Math.min(1.5, Math.round((this.getZoomLevel() + 0.1) * 100) / 100);
      this.render();
    }

    /**
     * Aleja el flujo un escalon, sin bajar del minimo permitido.
     */
    zoomOut() {
      this.executionState.zoomLevel = Math.max(0.5, Math.round((this.getZoomLevel() - 0.1) * 100) / 100);
      this.render();
    }

    /**
     * Ajusta el zoom para que todas las filas del flujo entren en el area
     * visible, tanto a lo ancho como a lo alto (ahora puede haber mas de
     * una fila de tarjetas).
     */
    zoomToFit() {
      var stage = document.querySelector('.collection-exec-flow-stage');
      var rows = document.querySelector('.collection-exec-flow-rows');
      if (!stage || !rows) { this.executionState.zoomLevel = 1; this.render(); return; }

      var currentZoom = this.getZoomLevel();
      var naturalWidth = rows.scrollWidth / currentZoom;
      var naturalHeight = rows.scrollHeight / currentZoom;
      var availableWidth = stage.clientWidth - 8;
      var availableHeight = stage.clientHeight - 8;
      var fittedByWidth = naturalWidth > 0 ? availableWidth / naturalWidth : 1;
      var fittedByHeight = naturalHeight > 0 ? availableHeight / naturalHeight : 1;
      var fitted = Math.min(fittedByWidth, fittedByHeight);

      this.executionState.zoomLevel = Math.max(0.5, Math.min(1, Math.round(fitted * 100) / 100));
      this.render();
    }

    /**
     * Vuelve el zoom a 100% (se usa junto con "Centrar").
     */
    resetZoom() {
      this.executionState.zoomLevel = 1;
      this.render();
    }

    /**
     * Alterna el panel de linea de tiempo.
     * En desktop se comporta como panel contextual; en notebook queda listo
     * para ser tratado visualmente como drawer.
     */
    toggleTimelineOpen() {
      this.executionState.timelineOpen = !this.executionState.timelineOpen;
      this.syncTimelineKeydownListener();
      this.render();
    }

    /**
     * Cierra explicitamente la linea de tiempo contextual.
     */
    closeTimelineOpen() {
      this.executionState.timelineOpen = false;
      this.syncTimelineKeydownListener();
      this.render();
    }

    /**
     * Escucha Escape solo mientras la linea de tiempo esta abierta.
     */
    syncTimelineKeydownListener() {
      document.removeEventListener('keydown', this.boundHandleTimelineKeydown);
      if (this.executionState.timelineOpen) document.addEventListener('keydown', this.boundHandleTimelineKeydown);
    }

    /**
     * Informa si el flujo se muestra expandido (tarjetas) o colapsado (breadcrumb).
     */
    isFlowExpanded() {
      return !!this.executionState.flowExpanded;
    }

    /**
     * Alterna entre el flujo expandido (tarjetas + pan/zoom) y el breadcrumb compacto.
     */
    toggleFlowExpanded() {
      this.executionState.flowExpanded = !this.executionState.flowExpanded;
      this.render();
    }

    /**
     * Cancela una corrida en reproduccion sin perder los resultados parciales
     * ya visibles en el panel.
     */
    cancelExecution() {
      var run = this.executionState.run;

      this.stopPlayback();
      this.executionState.loading = false;

      if (!run) {
        this.render();
        this.syncButtons(false);
        this.options.showStatus('ok', 'La ejecucion se cancelo.');
        return;
      }

      if (run.authStep && run.authStep.status === 'running') {
        run.authStep.status = 'skipped';
        run.authStep.statusLabel = 'Cancelado';
        run.authStep.durationLabel = '--';
      }

      (run.steps || []).forEach(function markPendingOrRunning(step) {
        if (!step) return;
        if (step.status === 'running') {
          step.status = 'skipped';
          step.statusLabel = 'Cancelado';
          step.durationLabel = '--';
          return;
        }
        if (step.status === 'idle') {
          step.status = 'skipped';
          step.statusLabel = 'Saltado';
          step.durationLabel = '--';
        }
      });

      run.wasCancelled = true;
      run.status = 'skipped';
      run.statusLabel = 'Cancelada';
      this.refreshRunPresentation(run);
      this.render();
      this.syncButtons(false);
      this.options.showStatus('ok', 'La ejecucion se cancelo y se conservaron los resultados parciales.');
    }

    /**
     * Ejecuta una accion rapida disparada desde el menu de un nodo del flujo.
     */
    async handleNodeAction(actionKey, stepId) {
      var run = this.executionState.run;
      var step = null;

      if (!run) return;

      this.selectStep(stepId);
      step = this.findStepById(stepId);
      if (!step) return;

      if (actionKey === 'request') {
        this.setTab('request');
        return;
      }
      if (actionKey === 'response') {
        this.setTab('response');
        return;
      }
      if (actionKey === 'copy-url') {
        await this.copyText(step.requestUrl || '');
        this.options.showStatus('ok', 'La URL del paso se copio al portapapeles.');
        return;
      }
      if (actionKey === 'rerun-step') {
        await this.rerunFromSelectedStep();
      }
    }

    /**
     * Construye el payload exacto que espera el backend real de ejecucion.
     * Se reutiliza la misma estructura del escenario activo para no duplicar reglas.
     */
    buildExecutionPayload(scenario) {
      var safeScenario = scenario || {};
      return {
        format: this.options.getFormat ? this.options.getFormat() : 'json',
        target: 'postman',
        version: this.options.getVersion(),
        platform: this.options.getPlatform ? this.options.getPlatform() : '',
        db: this.options.getDb ? this.options.getDb() : {},
        api: this.options.getApi ? this.options.getApi() : {},
        authContext: this.options.getAuthContext ? this.options.getAuthContext() : null,
        swaggerBaseUrl: this.options.getSwaggerBaseUrl ? this.options.getSwaggerBaseUrl() : '',
        swaggerAuthUrl: this.options.getSwaggerAuthUrl ? this.options.getSwaggerAuthUrl() : '',
        items: Array.isArray(safeScenario.items) ? safeScenario.items : [],
        variableOverrides: safeScenario.variableOverrides || {},
        inputMappings: safeScenario.inputMappings || {},
        outputAliases: safeScenario.outputAliases || {},
        repeatableOverrides: safeScenario.repeatableOverrides || {}
      };
    }

    /**
     * Traduce la respuesta del backend real a la forma visual que ya usa el panel.
     * Se apoya en el builder mock solo como scaffold de layout y catalogos.
     */
    buildRunFromExecutionResult(result, scenario) {
      var baseRun = this.mockBuilder.buildRun({
        scenario: scenario,
        state: this.options.getState()
      });
      var rawSteps = Array.isArray(result && result.steps) ? result.steps : [];
      var split = this.splitExecutionSteps(rawSteps);
      var runtimeValues = result && result.runtimeValues ? result.runtimeValues : {};
      var hasFailure = !!(result && result.ok === false);
      var selectedStepId = '';
      var i = 0;

      baseRun.authStep = this.hydrateAuthStep(baseRun.authStep, split.authStep, runtimeValues, hasFailure);
      for (i = 0; i < baseRun.steps.length; i++) {
        baseRun.steps[i] = this.hydrateFlowStep(
          baseRun.steps[i],
          scenario && scenario.items ? scenario.items[i] : null,
          split.flowSteps[i],
          i,
          split.flowSteps.length,
          hasFailure,
          runtimeValues
        );
      }

      selectedStepId = this.pickSelectedExecutionStep(baseRun);
      baseRun.status = hasFailure ? 'error' : 'success';
      baseRun.statusLabel = hasFailure ? 'Con errores' : 'Completada';
      baseRun.selectedStepId = selectedStepId;
      // Con error se abre el paso que fallo; si todo salio bien se abre el
      // ultimo paso ejecutado. En ambos casos interesa ver la Response primero.
      baseRun.selectedTab = 'response';
      baseRun.runtimeValues = runtimeValues;
      return baseRun;
    }

    /**
     * Separa Authenticate del resto de los pasos devueltos por el backend.
     */
    splitExecutionSteps(stepRows) {
      var rows = Array.isArray(stepRows) ? stepRows : [];
      var authStep = null;
      var flowSteps = [];

      rows.forEach(function mapRow(step) {
        if (!step) return;
        if (step.index === 0 || String(step.name || '').toLowerCase() === 'authenticate') {
          authStep = step;
          return;
        }
        flowSteps.push(step);
      });

      return {
        authStep: authStep,
        flowSteps: flowSteps
      };
    }

    /**
     * Completa el paso de Authenticate con informacion real del backend.
     */
    hydrateAuthStep(baseStep, authStep, runtimeValues, hasFailure) {
      var step = Object.assign({}, baseStep || {});
      var format = this.options.getFormat ? this.options.getFormat() : 'json';
      var createdVariables = this.buildAuthCreatedVariables(runtimeValues || {});
      var parsedResponse = this.parseExecutionPayload(authStep && authStep.responseXml);
      var isOk = !!(authStep && authStep.ok);

      step.format = format;
      step.requestUrl = authStep && authStep.requestUrl ? authStep.requestUrl : step.requestUrl;
      step.responseStatus = authStep && authStep.responseStatus ? authStep.responseStatus : (isOk ? 200 : 0);
      step.status = isOk ? 'success' : (hasFailure ? 'error' : 'success');
      step.statusLabel = this.buildStepStatusLabel(authStep, step.status);
      step.requestBody = step.requestBody || (format === 'xml' ? '' : {});
      step.responseBody = parsedResponse;
      step.createdVariables = createdVariables;
      step.warnings = !isOk && authStep && authStep.error ? [authStep.error] : [];
      step.logs = this.buildExecutionLogs(authStep, step.status);
      return step;
    }

    /**
     * Completa cada paso del canvas con el resultado real o con estado saltado.
     */
    hydrateFlowStep(baseStep, item, backendStep, stepIndex, executedCount, hasFailure, runtimeValues) {
      var step = Object.assign({}, baseStep || {});
      var format = this.options.getFormat ? this.options.getFormat() : 'json';
      var parsedRequest = this.parseExecutionPayload(backendStep && backendStep.requestXml);
      var parsedResponse = this.parseExecutionPayload(backendStep && backendStep.responseXml);
      var wasExecuted = !!backendStep;
      var finalStatus = wasExecuted
        ? (backendStep.ok ? 'success' : 'error')
        : (hasFailure && stepIndex >= executedCount ? 'skipped' : 'idle');

      step.format = format;
      step.name = item && item.method ? item.method : step.name;
      step.service = item && item.service ? item.service : step.service;
      step.httpMethod = String(item && item.httpMethod || step.httpMethod || 'GET').toUpperCase();
      step.summary = item && (item.summary || item.path) ? (item.summary || item.path) : step.summary;
      step.requestUrl = backendStep && backendStep.requestUrl ? backendStep.requestUrl : step.requestUrl;
      step.responseStatus = backendStep && backendStep.responseStatus ? backendStep.responseStatus : step.responseStatus;
      step.requestHeaders = this.buildRequestHeaders(runtimeValues || {});
      step.requestBody = parsedRequest;
      step.responseBody = parsedResponse;
      step.createdVariables = this.buildStepCreatedVariables(backendStep, item);
      step.status = finalStatus;
      step.statusLabel = this.buildStepStatusLabel(backendStep, finalStatus);
      step.warnings = finalStatus === 'error' && backendStep && backendStep.error ? [backendStep.error] : [];
      step.logs = this.buildExecutionLogs(backendStep, finalStatus);
      return step;
    }

    /**
     * Genera las variables visibles iniciales que deja Authenticate.
     */
    buildAuthCreatedVariables(runtimeValues) {
      var rows = [];
      var orderedKeys = ['token', 'channel', 'username', 'device', 'requirement'];
      var self = this;

      orderedKeys.forEach(function appendKey(key) {
        if (!Object.prototype.hasOwnProperty.call(runtimeValues || {}, key)) return;
        if (runtimeValues[key] == null || runtimeValues[key] === '') return;
        rows.push({
          name: key,
          value: String(runtimeValues[key]),
          type: self.inferValueType(runtimeValues[key]),
          source: 'Authenticate'
        });
      });

      return rows;
    }

    /**
     * Traduce extractedValues del backend a la lista de variables creadas por paso.
     */
    buildStepCreatedVariables(backendStep, item) {
      var extracted = backendStep && backendStep.extractedValues ? backendStep.extractedValues : {};
      var keys = Object.keys(extracted || {});
      var self = this;

      return keys.map(function mapVariable(key) {
        return {
          name: key,
          value: String(extracted[key]),
          type: self.inferValueType(extracted[key], item, key),
          source: item && item.method ? item.method : (backendStep && backendStep.name ? backendStep.name : 'Paso')
        };
      });
    }

    /**
     * Reconstuye headers Bantotal legibles para el request mostrado en detalle.
     */
    buildRequestHeaders(runtimeValues) {
      return {
        Canal: String(runtimeValues && runtimeValues.channel || ''),
        Usuario: String(runtimeValues && runtimeValues.username || ''),
        Device: String(runtimeValues && runtimeValues.device || ''),
        Requerimiento: String(runtimeValues && runtimeValues.requirement || ''),
        Token: String(runtimeValues && runtimeValues.token || '')
      };
    }

    /**
     * Normaliza el payload textual (request/response crudo) que manda el backend
     * para un paso, segun el formato del camino activo (JSON o XML/SOAP).
     *
     * Cada formato tiene su propia funcion de parseo (parseJsonExecutionPayload /
     * parseXmlExecutionPayload) para que un ajuste pensado para uno no pueda
     * afectar por accidente al otro. El panel de ejecucion (collection-execution-
     * view-renderer.js) usa `step.format` para elegir, a su vez, como formatear
     * y mostrar lo que esta funcion devuelve.
     */
    parseExecutionPayload(rawValue) {
      var format = this.options.getFormat ? this.options.getFormat() : 'json';
      return format === 'xml'
        ? this.parseXmlExecutionPayload(rawValue)
        : this.parseJsonExecutionPayload(rawValue);
    }

    /**
     * XML/SOAP: el body que manda executeCollectionFlow ya es el XML real de
     * la request/response (ver authenticateSessionSoap/invokeSoapXml en
     * scripts/generar-collections/index.js). No hace falta parsearlo a objeto
     * para mostrarlo — el renderer lo indenta como texto XML tal cual.
     */
    parseXmlExecutionPayload(rawValue) {
      return String(rawValue == null ? '' : rawValue).trim();
    }

    /**
     * JSON: comportamiento historico sin cambios (solo se le puso nombre propio
     * al separarlo del XML). Si el texto no es JSON valido, se envuelve en
     * {raw: texto} para no perder informacion — esto es exclusivo del camino
     * JSON, el camino XML nunca pasa por esta funcion.
     */
    parseJsonExecutionPayload(rawValue) {
      var rawText = String(rawValue == null ? '' : rawValue).trim();
      if (!rawText) return {};
      try {
        return JSON.parse(rawText);
      } catch (_) {
        return { raw: rawText };
      }
    }

    /**
     * Resuelve el label visible del estado a partir del resultado real del backend.
     */
    buildStepStatusLabel(backendStep, finalStatus) {
      if (finalStatus === 'skipped') return 'Saltado';
      if (finalStatus === 'idle') return 'Pendiente';
      if (backendStep && backendStep.responseStatus) {
        if (finalStatus === 'success') return String(backendStep.responseStatus) + ' OK';
        return 'HTTP ' + String(backendStep.responseStatus);
      }
      if (finalStatus === 'success') return 'OK';
      if (backendStep && backendStep.error) return backendStep.error;
      return finalStatus === 'error' ? 'Con error' : 'Pendiente';
    }

    /**
     * Genera logs cortos y reales a partir de la respuesta del backend.
     */
    buildExecutionLogs(backendStep, finalStatus) {
      var logs = [];
      if (backendStep && backendStep.requestUrl) logs.push('Se ejecuto la URL: ' + backendStep.requestUrl);
      if (backendStep && backendStep.responseStatus) logs.push('El backend devolvio HTTP ' + backendStep.responseStatus + '.');
      if (finalStatus === 'error' && backendStep && backendStep.error) logs.push('Se detecto error de negocio o de transporte: ' + backendStep.error);
      if (finalStatus === 'success') logs.push('El paso finalizo correctamente contra el ambiente.');
      if (finalStatus === 'skipped') logs.push('El paso no llego a ejecutarse porque el flujo se detuvo antes.');
      return logs.length ? logs : ['Sin logs disponibles para este paso.'];
    }

    /**
     * Prioriza el primer error real; si no hay, deja seleccionado el ultimo
     * paso ejecutado (el mas reciente es el que mas contexto aporta).
     */
    pickSelectedExecutionStep(run) {
      var i = 0;
      if (!run) return 'auth';
      if (run.authStep && run.authStep.status === 'error') return run.authStep.id;
      for (i = 0; i < (run.steps || []).length; i++) {
        if (run.steps[i].status === 'error') return run.steps[i].id;
      }
      return this.pickLastStepId(run);
    }

    /**
     * Construye un mensaje de error legible para la barra superior.
     */
    buildExecutionErrorMessage(result) {
      if (result && result.message) return result.message;
      return 'La ejecucion termino con errores. Revisa el detalle del flujo.';
    }

    /**
     * Intenta inferir un tipo simple para mantener coherente la UI de variables.
     */
    inferValueType(value, item, key) {
      var text = String(value == null ? '' : value).trim();
      var normalizedKey = String(key || '').toLowerCase();
      if (/^(true|false)$/i.test(text)) return 'boolean';
      if (/^-?\d+$/.test(text)) return 'integer';
      if (/^-?\d+[\.,]\d+$/.test(text)) return 'number';
      if (normalizedKey.indexOf('guid') >= 0) return 'string';
      return 'string';
    }

/**
     * Vuelve a dibujar el Execution Mode o el builder segun el estado actual.
     */
    render() {
      var executionContainer = document.getElementById('collection-execution-mode');
      var builderContainer = document.getElementById('collection-builder-mode');
      var result = document.getElementById('collection-result');
      var shell = document.querySelector('.collection-shell-studio');

      if (!executionContainer || !builderContainer) return;

      if (!this.executionState.active) {
        executionContainer.style.display = 'none';
        executionContainer.innerHTML = '';
        builderContainer.style.display = '';
        if (shell) shell.classList.remove('collection-execution-active');
        if (result && !result.innerHTML) result.className = 'collection-result';
        return;
      }

      builderContainer.style.display = 'none';
      executionContainer.style.display = 'flex';
      if (shell) shell.classList.add('collection-execution-active');

      if (this.executionState.loading) {
        executionContainer.innerHTML =
          '<div class="collection-exec-loading">' +
            '<div class="collection-exec-loading-card">' +
              '<div class="collection-exec-loading-spinner"></div>' +
              '<div class="collection-exec-loading-title">Preparando Execution Mode</div>' +
              '<div class="collection-exec-loading-copy">Armando timeline, resumen, variables y vista del flujo a partir del caso activo.</div>' +
            '</div>' +
          '</div>';
        return;
      }

      executionContainer.innerHTML = this.renderer.render(this.executionState.run);
    }

    /**
     * Prepara una corrida recien construida para reproducirla de forma secuencial.
     * Se guarda el estado final y se reinicia la presentacion visible.
     */
    preparePlaybackRun(run) {
      var self = this;

      if (!run) return;

      this.decorateEntityForPlayback(run.authStep);
      (run.steps || []).forEach(function decorateStep(step) {
        self.decorateEntityForPlayback(step);
      });
      (run.connections || []).forEach(function decorateConnection(connection) {
        connection.finalStatus = connection.status || 'idle';
        connection.status = 'idle';
      });

      run.finalStatus = run.status || 'success';
      run.finalStatusLabel = run.statusLabel || 'Completada';
      run.finalDurationMs = run.durationMs || 0;
      run.finalDurationLabel = run.durationLabel || this.formatDuration(run.durationMs || 0);
      run.selectedStepId = run.authStep ? run.authStep.id : this.pickFirstStepId(run);
      run.selectedTab = run.finalStatus === 'error' ? 'response' : 'details';

      this.resetEntityPresentation(run.authStep);
      (run.steps || []).forEach(function resetStep(step) {
        self.resetEntityPresentation(step);
      });

      this.refreshRunPresentation(run);
    }

    /**
     * Copia el estado final de una entidad para poder animar sin perder
     * la informacion real que luego debe mostrarse al terminar.
     */
    decorateEntityForPlayback(entity) {
      if (!entity) return;
      entity.finalStatus = entity.status || 'idle';
      entity.finalStatusLabel = entity.statusLabel || 'Pendiente';
      entity.finalDurationMs = entity.durationMs || 0;
      entity.finalDurationLabel = entity.durationLabel || this.formatDuration(entity.durationMs || 0);
    }

    /**
     * Vuelve una entidad al estado inicial previo a la reproduccion visual.
     */
    resetEntityPresentation(entity) {
      if (!entity) return;
      entity.status = 'idle';
      entity.statusLabel = 'Pendiente';
      entity.durationLabel = '--';
    }

    /**
     * Ejecuta una reproduccion simple paso a paso.
     * Cada request pasa por amarillo y luego cierra en verde o rojo.
     */
    async playRun(run) {
      var token = ++this.executionState.playbackToken;
      var steps = [];
      var i = 0;

      if (!run) return;

      if (run.authStep) steps.push(run.authStep);
      steps = steps.concat(Array.isArray(run.steps) ? run.steps : []);

      for (i = 0; i < steps.length; i++) {
        if (this.wasPlaybackInterrupted(run, token)) return;

        this.activateStep(run, steps[i]);
        this.render();
        await this.delay(i === 0 ? 460 : 540);

        if (this.wasPlaybackInterrupted(run, token)) return;

        this.finalizeStep(run, steps[i]);

        if (steps[i].finalStatus === 'error') {
          this.markPendingStepsAsSkipped(run, i + 1, steps);
          this.refreshRunPresentation(run);
          this.render();
          return;
        }

        this.refreshRunPresentation(run);
        this.render();
        await this.delay(180);
      }

      this.refreshRunPresentation(run);
      this.render();
    }

    /**
     * Marca visualmente el paso que se esta ejecutando en este instante.
     */
    activateStep(run, step) {
      if (!run || !step) return;
      step.status = 'running';
      step.statusLabel = step.id === 'auth' ? 'Autenticando' : 'Ejecutando';
      run.selectedStepId = step.id;
      this.refreshRunPresentation(run);
    }

    /**
     * Restaura el estado final real de un paso una vez que termina su turno.
     */
    finalizeStep(run, step) {
      if (!run || !step) return;
      step.status = step.finalStatus;
      step.statusLabel = step.finalStatusLabel;
      step.durationLabel = step.finalDurationLabel;
      this.refreshRunPresentation(run);
    }

    /**
     * Si la corrida termina en error, todo lo pendiente queda marcado como saltado
     * para que la lectura del flujo sea mas clara.
     */
    markPendingStepsAsSkipped(run, startIndex, steps) {
      var stepList = Array.isArray(steps) ? steps : [];
      for (var i = startIndex; i < stepList.length; i++) {
        if (!stepList[i] || stepList[i].status !== 'idle') continue;
        stepList[i].status = 'skipped';
        stepList[i].statusLabel = 'Saltado';
        stepList[i].durationLabel = '--';
      }
    }

    /**
     * Recalcula resumen, timeline, variables globales y estados de conexiones
     * segun el estado visible actual de la reproduccion.
     */
    refreshRunPresentation(run) {
      if (!run) return;

      this.refreshConnectionStatuses(run);
      run.globalVariables = this.buildVisibleGlobalVariables(run);
      run.timeline = this.buildVisibleTimeline(run);
      run.stats = this.buildVisibleStats(run);
      run.durationMs = run.stats.durationMs;
      run.durationLabel = this.formatDuration(run.durationMs);

      if (this.hasVisibleStatus(run, 'running')) {
        run.status = 'running';
        run.statusLabel = 'Ejecutando';
        return;
      }

      if (run.wasCancelled) {
        run.status = 'skipped';
        run.statusLabel = 'Cancelada';
        return;
      }

      if (this.hasVisibleStatus(run, 'error')) {
        run.status = 'error';
        run.statusLabel = 'Con errores';
        return;
      }

      run.status = 'success';
      run.statusLabel = 'Completada';
    }

    /**
     * Ajusta el color de cada flecha segun el paso origen/destino que se vea activo.
     */
    refreshConnectionStatuses(run) {
      var stepsById = {};

      if (!run) return;

      (run.steps || []).forEach(function indexStep(step) {
        stepsById[step.id] = step;
      });
      if (run.authStep) stepsById[run.authStep.id] = run.authStep;

      (run.connections || []).forEach(function updateConnection(connection) {
        var source = stepsById[connection.fromStepId];
        var target = stepsById[connection.toStepId];

        if (!source || !target) {
          connection.status = 'idle';
          return;
        }

        if (target.status === 'running' || source.status === 'running') {
          connection.status = 'running';
          return;
        }

        if (target.status === 'error') {
          connection.status = 'error';
          return;
        }

        if (source.status === 'success' && target.status === 'success') {
          connection.status = 'success';
          return;
        }

        connection.status = target.status === 'skipped' ? 'skipped' : 'idle';
      });
    }

    /**
     * Devuelve solo las variables que ya existen segun el progreso actual.
     */
    buildVisibleGlobalVariables(run) {
      var rows = [];
      var appendVariables = function appendVariablesFromEntity(entity) {
        if (!entity) return;
        if (entity.status !== 'success' && entity.status !== 'error') return;
        (entity.createdVariables || []).forEach(function appendVariable(variable) {
          rows.push(variable);
        });
      };

      appendVariables(run.authStep);
      (run.steps || []).forEach(appendVariables);

      return rows;
    }

    /**
     * Reconstruye la linea de tiempo con el estado visible de cada evento.
     */
    buildVisibleTimeline(run) {
      var events = [];

      // La linea de tiempo se concentra en los pasos de negocio: el arranque
      // y el Authenticate son detalle tecnico, no aportan al diagnostico.
      (run.steps || []).forEach(function appendStep(step) {
        events.push(this.buildTimelineStepEvent(step));
      }, this);

      return events;
    }

    /**
     * Traduce un paso al formato visual de la linea de tiempo.
     */
    buildTimelineStepEvent(step) {
      return {
        id: 'timeline_' + step.id,
        stepId: step.id,
        timeLabel: step.happenedAtLabel,
        title: step.name,
        status: step.status,
        statusLabel: step.status === 'idle' ? 'Pendiente' : step.statusLabel,
        durationLabel: step.durationLabel
      };
    }

    /**
     * Recalcula los KPI superiores segun el avance visible.
     */
    buildVisibleStats(run) {
      var allSteps = [];
      var successCount = 0;
      var errorCount = 0;
      var warningCount = 0;
      var requestCount = 0;
      var durationMs = 0;

      if (run && run.authStep) allSteps.push(run.authStep);
      allSteps = allSteps.concat(Array.isArray(run && run.steps) ? run.steps : []);

      allSteps.forEach(function countStep(step) {
        if (step.status === 'success') successCount += 1;
        if (step.status === 'error') errorCount += 1;
        if (step.status === 'success' || step.status === 'error') {
          requestCount += 1;
          durationMs += step.finalDurationMs || step.durationMs || 0;
        }
        if (step.status === 'error') warningCount += (step.warnings || []).length;
      });

      return {
        totalSteps: allSteps.length,
        successCount: successCount,
        errorCount: errorCount,
        requestCount: requestCount,
        variableCount: (run.globalVariables || []).length,
        warningCount: warningCount,
        durationMs: durationMs
      };
    }

    /**
     * Responde si el run visible tiene algun paso en el estado consultado.
     */
    hasVisibleStatus(run, status) {
      var allSteps = [];
      if (run && run.authStep) allSteps.push(run.authStep);
      allSteps = allSteps.concat(Array.isArray(run && run.steps) ? run.steps : []);

      return allSteps.some(function matchStatus(step) {
        return step.status === status;
      });
    }

    /**
     * Devuelve el primer paso visible para fallbacks simples.
     */
    pickFirstStepId(run) {
      if (run && run.steps && run.steps.length) return run.steps[0].id;
      return 'auth';
    }

    /**
     * Devuelve el ultimo paso de negocio ejecutado (o Authenticate si todavia
     * no hay ninguno), para dejarlo seleccionado cuando la corrida fue exitosa.
     */
    pickLastStepId(run) {
      if (run && run.steps && run.steps.length) return run.steps[run.steps.length - 1].id;
      return run && run.authStep ? run.authStep.id : 'auth';
    }

    /**
     * Busca un paso del flujo o Authenticate por id.
     */
    findStepById(stepId) {
      var run = this.executionState.run;
      var steps = [];
      var i = 0;

      if (!run) return null;
      if (run.authStep && run.authStep.id === stepId) return run.authStep;

      steps = Array.isArray(run.steps) ? run.steps : [];
      for (i = 0; i < steps.length; i++) {
        if (steps[i].id === stepId) return steps[i];
      }
      return null;
    }

    /**
     * Copia texto usando la API del navegador cuando esta disponible.
     */
    async copyText(textValue) {
      if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(String(textValue || ''));
        return;
      }

      throw new Error('Clipboard no disponible');
    }

    /**
     * Cancela la reproduccion actual invalidando cualquier secuencia async pendiente.
     */
    stopPlayback() {
      this.executionState.playbackToken += 1;
    }

    /**
     * Detecta si una reproduccion quedo vieja por cierre, reset o nueva corrida.
     */
    wasPlaybackInterrupted(run, token) {
      return token !== this.executionState.playbackToken || this.executionState.run !== run;
    }

    /**
     * Actualiza el estado visual del boton principal mientras corre el mock.
     */
    syncButtons(isBusy) {
      var executeButton = document.getElementById('btn-collection-execute');
      var fillButton = document.getElementById('btn-collection-fill-data');
      var openButton = document.getElementById('btn-collection-open-console');

      if (executeButton) {
        executeButton.disabled = !!isBusy;
        executeButton.innerHTML = isBusy ? '<span class="spin dk"></span>&nbsp;Probando...' : 'Probar';
        executeButton.classList.toggle('btn-soft-disabled', executeButton.disabled);
      }
      if (fillButton) {
        fillButton.disabled = !!isBusy;
        fillButton.innerHTML = isBusy ? '<span class="spin dk"></span>&nbsp;Esperando...' : 'Rellenar datos';
        fillButton.classList.toggle('btn-soft-disabled', fillButton.disabled);
      }
      if (openButton) {
        openButton.disabled = !this.executionState.run && !isBusy;
        openButton.textContent = 'Ver ejecucion';
        openButton.classList.toggle('btn-soft-disabled', openButton.disabled);
      }
    }

    /**
     * Helper asincronico simple para dar sensacion de progresion durante el mock.
     */
    delay(milliseconds) {
      return new Promise(function wait(resolve) {
        setTimeout(resolve, milliseconds || 0);
      });
    }

    /**
     * Devuelve una duracion breve consistente con el resto del modulo.
     */
    formatDuration(milliseconds) {
      return String(milliseconds || 0) + ' ms';
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionExecutionCenter = CollectionExecutionCenter;
})(window);


