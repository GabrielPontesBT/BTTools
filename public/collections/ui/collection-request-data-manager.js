(function bootstrapCollectionRequestDataManager(global) {
  'use strict';

  /**
   * Coordina la acción `Rellenar datos` desde el frontend.
   * No resuelve semántica localmente: solo serializa el estado, llama al backend
   * y aplica el resultado sobre el builder actual.
   */
  class CollectionRequestDataManager {
    /**
     * Recibe accesos mínimos al estado y callbacks del builder.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Ejecuta el flujo de relleno sin disparar generación ni requests reales.
     */
    async fillData() {
      if (!this.options.pathSupported()) {
        this.options.showStatus('err', 'Por ahora solo se puede rellenar datos en JSON + Postman.');
        return;
      }

      var version = this.options.getVersion();
      if (!version) {
        this.options.showStatus('err', 'Completa primero version y ambiente en el wizard principal.');
        return;
      }

      var scenarios = this.buildScenarioPayloads();
      if (!scenarios.length) {
        this.options.showStatus('err', 'Agrega al menos un metodo antes de rellenar datos.');
        return;
      }

      var button = document.getElementById('btn-collection-fill-data');
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="spin"></span>&nbsp;Rellenando...';
      }

      this.options.syncInspectorInputs();
      this.options.refreshContext();
      this.options.resetResult();
      this.options.resetExecution();
      this.options.showStatus('ok', 'Analizando datos encadenados y campos vacios...');

      try {
        var response = await this.options.apiClient.fillRequestData({
          format: this.options.getFormat(),
          target: this.options.getTarget(),
          version: version,
          platform: this.options.getPlatform(),
          db: this.options.getDb(),
          api: this.options.getApi(),
          swaggerBaseUrl: this.options.getSwaggerBaseUrl(),
          swaggerAuthUrl: this.options.getSwaggerAuthUrl(),
          collectionName: this.options.getCollectionName(),
          scenarios: scenarios
        });

        if (!response.ok) throw new Error(response.message || 'No se pudieron rellenar los datos.');

        this.applyResolvedScenarios(response.scenarios || []);
        this.options.renderItems();
        await this.options.loadPreview();
        this.options.renderVariableEditor();
        this.options.showStatus('ok', this.buildSummaryMessage(response.summary, response.warnings));
      } catch (error) {
        this.options.showStatus('err', error.message || 'No se pudieron rellenar los datos.');
      }

      if (button) {
        button.disabled = false;
        button.textContent = 'Rellenar datos';
      }
    }

    /**
     * Serializa solo la información que el backend necesita para resolver inputs.
     */
    buildScenarioPayloads() {
      var state = this.options.getState();
      return (state.scenarios || []).filter(function keepNonEmptyScenario(scenario) {
        return scenario && Array.isArray(scenario.items) && scenario.items.length > 0;
      }).map(function serializeScenario(scenario) {
        return {
          id: scenario.id,
          name: scenario.name,
          items: scenario.items,
          variableOverrides: scenario.variableOverrides,
          inputMappings: scenario.inputMappings,
          inputAliases: scenario.inputAliases,
          outputAliases: scenario.outputAliases,
          repeatableOverrides: scenario.repeatableOverrides
        };
      });
    }

    /**
     * Aplica el resultado del backend sobre los escenarios actuales del builder.
     */
    applyResolvedScenarios(resolvedScenarios) {
      var state = this.options.getState();
      var scenariosById = {};
      (resolvedScenarios || []).forEach(function indexScenario(scenario) {
        scenariosById[scenario.id] = scenario;
      });

      state.scenarios = (state.scenarios || []).map(function mergeScenario(currentScenario) {
        var resolvedScenario = scenariosById[currentScenario.id];
        if (!resolvedScenario) return currentScenario;

        return Object.assign({}, currentScenario, {
          items: resolvedScenario.items || currentScenario.items,
          variableOverrides: resolvedScenario.variableOverrides || {},
          inputMappings: resolvedScenario.inputMappings || {},
          inputAliases: resolvedScenario.inputAliases || {},
          outputAliases: resolvedScenario.outputAliases || {},
          repeatableOverrides: resolvedScenario.repeatableOverrides || {},
          selectedItemIndex: typeof currentScenario.selectedItemIndex === 'number' ? currentScenario.selectedItemIndex : -1,
          previewVariables: currentScenario.previewVariables || [],
          previewOutputs: currentScenario.previewOutputs || [],
          previewMappings: currentScenario.previewMappings || []
        });
      });
    }

    /**
     * Construye un mensaje corto y legible con el resultado del relleno.
     */
    buildSummaryMessage(summary, warnings) {
      var safeSummary = summary || {};
      var pieces = [
        'Se completaron ' + String(safeSummary.completedCount || 0) + ' campos.',
        'Se vincularon ' + String(safeSummary.linkedCount || 0) + ' campos con servicios anteriores.',
        String(safeSummary.unresolvedCount || 0) + ' campos quedaron sin resolver.'
      ];

      if (Array.isArray(warnings) && warnings.length) {
        pieces.push('Hay ' + warnings.length + ' advertencia(s) para revisar.');
      }

      return pieces.join(' ');
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionRequestDataManager = CollectionRequestDataManager;
})(window);
