(function bootstrapCollectionExecutionCenter(global) {
  'use strict';

  /**
   * Orquesta toda la experiencia de ejecución del builder: estado visual,
   * popup auxiliar, fallback inline y llamada al endpoint `/api/collection/execute`.
   * La idea es que esta pieza evolucione hacia el Execution Center sin mezclar
   * responsabilidades con el resto del diseñador de cadenas.
   */
  class CollectionExecutionCenter {
    /**
     * Recibe todas las dependencias externas por inyección.
     * Esto permite reutilizar el módulo sin acoplarlo a variables globales duras.
     */
    constructor(options) {
      this.options = options || {};
      // Se conserva la referencia de la ventana popup para reusarla entre aperturas.
      this.popupWindow = null;
    }

    /**
     * Limpia todos los contenedores visuales relacionados con la ejecución.
     * También borra el último resultado cacheado para evitar datos viejos.
     */
    reset() {
      var body = document.getElementById('collection-execution');
      var inline = document.getElementById('collection-execution-inline');
      var result = document.getElementById('collection-result');
      var modal = document.getElementById('collection-execution-modal');
      var dock = document.getElementById('collection-execution-dock');
      var openButton = document.getElementById('btn-collection-open-console');
      var state = this.options.getState();

      // Se limpia el cuerpo principal del modal.
      if (body) body.innerHTML = '';
      if (inline) {
        // Se vacía y oculta el fallback inline dentro del builder.
        inline.innerHTML = '';
        inline.style.display = 'none';
      }
      if (result) {
        // Se reinicia el bloque de resultado visual para no mezclar ejecuciones.
        result.className = 'collection-result';
        result.innerHTML = '';
      }
      // Modal y dock quedan ocultos porque la ejecución vuelve a arrancar de cero.
      if (modal) modal.style.display = 'none';
      if (dock) dock.style.display = 'none';
      if (openButton) {
        // El botón se deja visible y habilitado para futuras aperturas.
        openButton.style.display = '';
        openButton.disabled = false;
      }

      // El estado comparte el último HTML y JSON renderizado para poder reabrir la vista.
      state.lastExecutionHtml = '';
      state.lastExecutionData = null;
    }

    /**
     * Permite cerrar la capa modal cuando el usuario hace clic sobre el fondo.
     */
    handleBackdrop(event) {
      if (!event || event.target.id !== 'collection-execution-modal') return;
      this.close();
    }

    /**
     * Cierra por completo la ventana de ejecución visible.
     */
    close() {
      var modal = document.getElementById('collection-execution-modal');
      var dock = document.getElementById('collection-execution-dock');
      if (modal) modal.style.display = 'none';
      if (dock) dock.style.display = 'none';
    }

    /**
     * Minimiza la ejecución dejando un acceso rápido flotante.
     */
    minimize() {
      var modal = document.getElementById('collection-execution-modal');
      var dock = document.getElementById('collection-execution-dock');
      if (modal) modal.style.display = 'none';
      if (dock) dock.style.display = 'block';
    }

    /**
     * Restaura la ejecución ya renderizada.
     * Si existe contenido, vuelve a mostrarse inline y en modal.
     */
    restore() {
      var inline = document.getElementById('collection-execution-inline');
      var dock = document.getElementById('collection-execution-dock');
      var modal = document.getElementById('collection-execution-modal');
      if (inline) {
        // Se vuelve a mostrar el panel dentro del builder.
        inline.style.display = 'block';
        if (typeof inline.scrollIntoView === 'function') {
          // Se lleva la vista hacia la consola para que el usuario no la tenga que buscar.
          inline.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      if (modal && inline && inline.innerHTML) modal.style.display = 'flex';
      if (dock) dock.style.display = 'none';
    }

    /**
     * Escribe el mismo HTML de ejecución en todas las superficies visibles.
     * Así modal, panel inline y caché interna siempre quedan sincronizados.
     */
    setHtml(html, data, options) {
      var settings = options || {};
      var safeHtml = String(html || '');
      var body = document.getElementById('collection-execution');
      var inline = document.getElementById('collection-execution-inline');
      var result = document.getElementById('collection-result');
      var modal = document.getElementById('collection-execution-modal');
      var dock = document.getElementById('collection-execution-dock');
      var state = this.options.getState();

      // Se cachea el último contenido para poder reabrirlo sin volver a ejecutar.
      state.lastExecutionHtml = safeHtml;
      state.lastExecutionData = data || null;

      // Se actualiza el cuerpo del modal.
      if (body) body.innerHTML = safeHtml;
      if (inline) {
        // Se actualiza también el panel inline dentro del builder.
        inline.innerHTML = safeHtml;
        inline.style.display = 'block';
      }
      if (result) {
        // Este bloque funciona como fallback visible aun si el popup no abre.
        result.className = 'collection-result show';
        result.innerHTML = safeHtml;
      }
      if (modal) modal.style.display = settings.showModal ? 'flex' : 'none';
      if (dock) dock.style.display = 'none';
    }

    /**
     * Abre el Execution Center.
     * Primero intenta popup, y si el navegador lo bloquea usa la vista embebida.
     */
    open() {
      var inline = document.getElementById('collection-execution-inline');
      var state = this.options.getState();
      var html = state.lastExecutionHtml || '';

      if (!html && state.lastExecutionData) {
        // Si no existe HTML previo, se arma una vista mínima desde el JSON cacheado.
        html = this.buildJsonSection(state.lastExecutionData);
      }
      if (!html) {
        // Si todavía no hubo ejecución, se muestra un mensaje amigable.
        html = '<div class="collection-run-section"><div class="collection-run-section-title">Execution Center</div><div class="collection-run-card"><div class="collection-run-card-value-sm">Todavia no hay una ejecucion para mostrar.</div></div></div>';
      }

      if (inline) {
        // Se renderiza inline para asegurar visibilidad aunque el popup falle.
        inline.innerHTML = html;
        inline.style.display = 'block';
        if (typeof inline.scrollIntoView === 'function') {
          inline.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      try {
        if (!this.popupWindow || this.popupWindow.closed) {
          // Se crea o recrea la ventana dedicada para reutilizarla entre aperturas.
          this.popupWindow = window.open('', 'bttools_execution_center', 'width=1280,height=860,resizable=yes,scrollbars=yes');
        }
        if (this.popupWindow) {
          // Se escribe el documento completo del popup en cada apertura para refrescarlo.
          this.popupWindow.document.open();
          this.popupWindow.document.write(this.buildPopupShell(html));
          this.popupWindow.document.close();
          this.popupWindow.focus();
          return;
        }
      } catch (error) {}

      // Si el popup falla o es bloqueado, se cae elegantemente al modo embebido.
      this.restore();
    }

    /**
     * Renderiza el estado intermedio de "ejecutando" antes de recibir respuesta del backend.
     */
    renderLoading() {
      var scenario = this.options.getActiveScenario();
      var title = document.getElementById('collection-execution-title');
      if (title) title.textContent = scenario ? scenario.name : 'Ejecucion del flujo';

      this.setHtml(
        '<div class="collection-run-grid">' +
          '<div class="collection-run-card"><div class="collection-run-card-label">Estado</div><div class="collection-run-card-value-sm">Ejecutando flujo desde la app...</div></div>' +
        '</div>' +
        '<div class="collection-run-section">' +
          '<div class="collection-run-section-title">Execution Center</div>' +
          '<div class="collection-run-card"><div class="collection-run-card-value-sm">Preparando autenticacion, headers y requests del caso activo.</div></div>' +
        '</div>',
        { loading: true },
        { showModal: false }
      );
    }

    /**
     * Transforma el resultado bruto de ejecución en una vista legible.
     * Esta versión actual todavía es una consola enriquecida y será la base del
     * futuro Execution Center visual.
     */
    renderResult(data) {
      var scenario = this.options.getActiveScenario();
      var title = document.getElementById('collection-execution-title');
      var openButton = document.getElementById('btn-collection-open-console');
      var dock = document.getElementById('collection-execution-dock');
      var escapeHtml = this.options.escapeHtml;

      try {
        // Se normaliza la estructura base para evitar chequeos repetidos más abajo.
        var steps = Array.isArray(data && data.steps) ? data.steps : [];
        var runtimeValues = data && data.runtimeValues ? data.runtimeValues : {};
        // Estas métricas alimentan el dashboard superior del resumen de ejecución.
        var okCount = steps.filter(function isOk(step) { return !!step.ok; }).length;
        var errCount = steps.filter(function isError(step) { return !step.ok; }).length;
        var finalVars = Object.keys(runtimeValues).length
          ? '<div class="collection-run-vars">' + Object.keys(runtimeValues).map(function buildVarChip(key) {
              return '<span class="collection-run-var"><strong>' + escapeHtml(key) + '</strong> ' + escapeHtml(runtimeValues[key]) + '</span>';
            }).join('') + '</div>'
          : '<p>Sin variables finales para mostrar.</p>';

        // Se convierte cada paso del backend en una tarjeta visual independiente.
        var stepHtml = steps.map(function renderStep(step) {
          var extracted = step && step.extractedValues ? step.extractedValues : {};
          var extractedHtml = Object.keys(extracted).length
            ? '<div class="collection-run-vars">' + Object.keys(extracted).map(function buildExtractedChip(key) {
                return '<span class="collection-run-var"><strong>' + escapeHtml(key) + '</strong> ' + escapeHtml(extracted[key]) + '</span>';
              }).join('') + '</div>'
            : '';
          var requestPayload = step.requestJson || step.requestXml || step.requestBody || step.request || '';
          var responsePayload = step.responseJson || step.responseXml || step.responseBody || step.response || '';
          var requestBlock = requestPayload
            ? '<details class="collection-run-toggle"><summary>Ver request</summary><div class="collection-run-pre">' + escapeHtml(this.prettyPayload(requestPayload)) + '</div></details>'
            : '';
          var responseBlock = responsePayload
            ? '<details class="collection-run-toggle"><summary>Ver response</summary><div class="collection-run-pre">' + escapeHtml(this.prettyPayload(responsePayload)) + '</div></details>'
            : '';
          var businessError = this.summarizeBusinessError(step && step.error ? step.error : '');
          var errorBlock = '';

          // Se prioriza el error de negocio resumido porque es el formato estándar de la empresa.
          if (businessError) {
            errorBlock = '<div class="collection-run-error"><div class="collection-run-error-icon">X</div><div><div class="collection-run-error-title">Error de negocio ' + escapeHtml(String(businessError.code || '').trim() || '-') + '</div><div class="collection-run-error-text">' + escapeHtml(businessError.description || 'Sin descripcion.') + '</div></div></div>';
          } else if (step.error) {
            errorBlock = '<div class="collection-run-error"><div class="collection-run-error-icon">X</div><div><div class="collection-run-error-title">Error de ejecucion</div><div class="collection-run-error-text">' + escapeHtml(step.error) + '</div></div></div>';
          }

          return '<div class="collection-run-step">' +
            '<div class="collection-run-head">' +
              '<div>' +
                '<div class="collection-run-title">' + escapeHtml(step.name || ('Paso ' + step.index)) + '</div>' +
                '<div class="collection-run-subtitle">Paso ' + escapeHtml(String(step.index || '')) + (step.responseStatus ? ' · HTTP ' + escapeHtml(String(step.responseStatus)) : '') + '</div>' +
              '</div>' +
              '<div class="' + (step.ok ? 'collection-run-ok' : 'collection-run-err') + '">' + (step.ok ? 'OK' : 'ERROR') + '</div>' +
            '</div>' +
            '<div class="collection-run-body">' +
              '<div class="collection-run-meta"><strong>URL:</strong> ' + escapeHtml(step.requestUrl || '-') + (step.soapAction ? ' | <strong>SOAPAction:</strong> ' + escapeHtml(step.soapAction) : '') + '</div>' +
              errorBlock +
              (extractedHtml ? '<div class="collection-run-section"><div class="collection-run-section-title">Valores detectados</div>' + extractedHtml + '</div>' : '') +
              requestBlock +
              responseBlock +
            '</div>' +
          '</div>';
        }, this).join('');

        // Se arma un error general arriba si el flujo completo terminó en fallo.
        var topBusinessError = !data.ok ? this.summarizeBusinessError(data.message || '') : null;
        var topError = !data.ok && data.message
          ? (topBusinessError
            ? '<div class="collection-run-error"><div class="collection-run-error-icon">X</div><div><div class="collection-run-error-title">Error general ' + escapeHtml(String(topBusinessError.code || '').trim() || '-') + '</div><div class="collection-run-error-text">' + escapeHtml(topBusinessError.description || 'Sin descripcion.') + '</div></div></div>'
            : '<div class="collection-run-error"><div class="collection-run-error-icon">X</div><div><div class="collection-run-error-title">Error general</div><div class="collection-run-error-text">' + escapeHtml(data.message) + '</div></div></div>')
          : '';

        if (title) title.textContent = scenario ? scenario.name : 'Ejecucion del flujo';
        // Todo el HTML final se centraliza en un solo punto de escritura.
        this.setHtml(
          '<div class="collection-run-grid">' +
            '<div class="collection-run-card"><div class="collection-run-card-label">Estado</div><div class="collection-run-card-value-sm">' + (data.ok ? 'Flujo completado correctamente' : 'La ejecucion se detuvo en el primer error') + '</div></div>' +
            '<div class="collection-run-card"><div class="collection-run-card-label">Pasos OK</div><div class="collection-run-card-value">' + okCount + '</div></div>' +
            '<div class="collection-run-card"><div class="collection-run-card-label">Pasos con error</div><div class="collection-run-card-value">' + errCount + '</div></div>' +
            '<div class="collection-run-card"><div class="collection-run-card-label">Variables finales</div><div class="collection-run-card-value">' + Object.keys(runtimeValues).length + '</div></div>' +
          '</div>' +
          topError +
          stepHtml +
          '<div class="collection-run-section"><div class="collection-run-section-title">Variables finales</div>' + finalVars + '</div>' +
          this.buildJsonSection(data),
          data,
          { showModal: false }
        );
      } catch (error) {
        // Si algo falla durante el render, se conserva al menos el JSON completo.
        this.setHtml(
          '<div class="collection-run-error"><div class="collection-run-error-icon">X</div><div><div class="collection-run-error-title">No se pudo maquetar el Execution Center</div><div class="collection-run-error-text">' + escapeHtml(error && error.message ? error.message : 'Sin detalle') + '</div></div></div>' +
          this.buildJsonSection(data),
          data,
          { showModal: false }
        );
      }

      // Al terminar el render se apaga el dock porque ya quedó la vista disponible.
      if (dock) dock.style.display = 'none';
      if (openButton) {
        openButton.style.display = '';
        openButton.disabled = false;
      }
    }

    /**
     * Ejecuta el flujo activo contra el backend.
     * Esta es la puerta de entrada principal del botón "Probar flujo".
     */
    async executeFlow() {
      if (!this.options.isPathSupported()) {
        this.options.showStatus('err', 'Por ahora solo esta disponible JSON + Postman.');
        return;
      }

      // Antes de ejecutar, se sincroniza lo que el usuario haya escrito en el inspector.
      this.options.syncInspectorInputs();
      this.options.refreshContext();

      if (!this.options.getVersion()) {
        this.options.showStatus('err', 'Completa primero version y ambiente en el wizard principal.');
        return;
      }

      var scenario = this.options.getActiveScenario();
      if (!scenario || !scenario.items.length) {
        this.options.showStatus('err', 'Agrega al menos un metodo al caso de uso activo.');
        return;
      }

      // Se bloquea el botón para evitar dobles clics mientras el backend está procesando.
      var button = document.getElementById('btn-collection-execute');
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="spin dk"></span>&nbsp;Probando...';
      }

      this.options.showStatus('ok', 'Ejecutando flujo JSON desde la app...');
      this.reset();
      this.renderLoading();

      try {
        // Se envía al backend todo lo necesario para reconstruir el flujo activo.
        var data = await this.options.executeFlowRequest({
          format: this.options.getFormat(),
          version: this.options.getVersion(),
          platform: this.options.getPlatform(),
          db: this.options.getDb(),
          api: this.options.getApi(),
          authContext: this.options.getAuthContext(),
          swaggerBaseUrl: this.options.getSwaggerBaseUrl(),
          swaggerAuthUrl: this.options.getSwaggerAuthUrl(),
          items: scenario.items,
          variableOverrides: scenario.variableOverrides,
          inputMappings: scenario.inputMappings,
          outputAliases: scenario.outputAliases,
          repeatableOverrides: scenario.repeatableOverrides
        });
        // El status superior y el render principal se actualizan con el mismo payload.
        if (!data.ok) this.options.showStatus('err', data.message || 'La ejecucion del flujo fallo.');
        else this.options.showStatus('ok', 'Flujo ejecutado correctamente.');
        this.renderResult(data);
      } catch (error) {
        // Cualquier excepción de red o parseo también se refleja en la UI de ejecución.
        this.options.showStatus('err', error.message || 'No se pudo ejecutar el flujo.');
        this.setHtml(
          '<div class="collection-run-error"><div class="collection-run-error-icon">X</div><div><div class="collection-run-error-title">Error general</div><div class="collection-run-error-text">' + this.options.escapeHtml(error.message || 'No se pudo ejecutar el flujo.') + '</div></div></div>',
          { ok: false, message: error.message || 'No se pudo ejecutar el flujo.' },
          { showModal: false }
        );
      }

      // Se restablece el botón al finalizar, sin importar si hubo éxito o error.
      if (button) {
        button.disabled = false;
        button.innerHTML = 'Probar flujo';
      }
    }

    /**
     * Intenta extraer el primer BusinessError del formato estándar de Bantotal.
     * Devuelve una versión resumida para mostrar algo limpio en la UI.
     */
    summarizeBusinessError(rawText) {
      if (!rawText) return null;
      try {
        var parsed = typeof rawText === 'string' ? JSON.parse(rawText) : rawText;
        var errors = parsed && parsed.BusinessErrors && parsed.BusinessErrors.BusinessError;
        var first = Array.isArray(errors) ? errors[0] : errors;
        if (!first) return null;
        return {
          code: first.Code || first.code || '',
          description: first.Description || first.description || 'Business error'
        };
      } catch (error) {
        return null;
      }
    }

    /**
     * Formatea cualquier payload a un texto legible.
     * Si llega JSON válido, lo pretty-print; si no, deja el contenido textual original.
     */
    prettyPayload(text) {
      if (!text) return '';
      try {
        return JSON.stringify(typeof text === 'string' ? JSON.parse(text) : text, null, 2);
      } catch (error) {
        return String(text);
      }
    }

    /**
     * Construye la sección de respaldo con el JSON completo de ejecución.
     * Sirve tanto para debugging como para fallback visual.
     */
    buildJsonSection(data) {
      return '<div class="collection-run-section"><div class="collection-run-section-title">JSON de ejecucion</div><div class="collection-run-pre">' +
        this.options.escapeHtml(JSON.stringify(data, null, 2)) +
        '</div></div>';
    }

    /**
     * Arma el documento HTML completo que se escribe dentro del popup.
     * Se mantiene separado para que la apertura de la ventana sea sencilla de seguir.
     */
    buildPopupShell(content) {
      return '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
        '<title>Execution Center</title>' +
        '<style>' +
          'body{margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Segoe UI,Arial,sans-serif}' +
          '.wrap{max-width:1180px;margin:0 auto}' +
          '.head{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:18px}' +
          '.title{font-size:28px;font-weight:800}' +
          '.sub{font-size:12px;color:#64748b;margin-top:6px}' +
          '.panel{background:#fff;border:1px solid #e5e7eb;border-radius:22px;box-shadow:0 20px 44px rgba(15,23,42,.10);padding:20px}' +
        '</style></head><body><div class="wrap"><div class="head"><div><div class="title">Execution Center</div><div class="sub">Salida del flujo ejecutado desde BTTools</div></div></div><div class="panel">' +
        content +
        '</div></div></body></html>';
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionExecutionCenter = CollectionExecutionCenter;
})(window);
