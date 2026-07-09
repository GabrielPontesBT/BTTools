(function bootstrapCollectionScenarioManager(global) {
  'use strict';

  /**
   * Encapsula las operaciones de alto nivel sobre escenarios.
   * La meta es que el builder principal no manipule arrays e ids manualmente
   * cada vez que agrega, cambia o elimina un caso de uso.
   */
  class CollectionScenarioManager {
    /**
     * Recibe el estado compartido y los callbacks necesarios para repintar la UI.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Crea un escenario nuevo, lo vuelve activo y refresca la pantalla.
     */
    addScenario() {
      var scenario = this.options.createScenario();
      var state = this.options.getState();

      state.scenarios.push(scenario);
      state.activeScenarioId = scenario.id;

      this.refreshScenarioWorkspace();
    }

    /**
     * Cambia el nombre de un escenario existente.
     */
    renameScenario(id, value) {
      var state = this.options.getState();

      for (var i = 0; i < state.scenarios.length; i++) {
        if (state.scenarios[i].id === id) {
          state.scenarios[i].name = value || ('Caso de uso ' + (i + 1));
          break;
        }
      }

      this.renderScenarios();
    }

    /**
     * Elimina un escenario si existe más de uno.
     * Nunca deja al builder sin un caso de uso base.
     */
    removeScenario(id) {
      var state = this.options.getState();
      if (state.scenarios.length <= 1) return;

      state.scenarios = state.scenarios.filter(function keepRemainingScenario(scenario) {
        return scenario.id !== id;
      });

      if (!state.scenarios.length) {
        this.options.ensureScenario();
      }

      if (!this.options.getActiveScenario()) {
        state.activeScenarioId = state.scenarios[0].id;
      }

      this.refreshScenarioWorkspace();
    }

    /**
     * Renderiza las tarjetas de casos de uso en la parte superior.
     */
    renderScenarios() {
      var container = document.getElementById('collection-scenarios');
      this.options.ensureScenario();

      var state = this.options.getState();
      var activeScenario = this.options.getActiveScenario();
      var scenarioNameInput = document.getElementById('collection-scenario-name');

      if (scenarioNameInput && activeScenario && scenarioNameInput !== document.activeElement) {
        scenarioNameInput.value = activeScenario.name || '';
      }

      if (!container) return;

      container.innerHTML = state.scenarios.map(function renderScenarioCard(scenario, index) {
        var activeClass = activeScenario && activeScenario.id === scenario.id ? ' collection-scenario-card-active' : '';
        var disabledRemove = state.scenarios.length <= 1 ? ' disabled' : '';

        return '<div class="collection-scenario-card' + activeClass + '">' +
          '<button type="button" class="collection-scenario-select" onclick="collectionSetActiveScenario(' + "'" + scenario.id + "'" + ')">' +
            '<span class="collection-scenario-kicker">Caso ' + (index + 1) + '</span>' +
            '<span class="collection-scenario-title">' + this.options.escapeHtml(scenario.name) + '</span>' +
            '<span class="collection-scenario-meta">' + (scenario.items || []).length + ' metodo(s)</span>' +
          '</button>' +
          '<div class="collection-scenario-actions">' +
            '<input class="collection-scenario-input" type="text" value="' + this.options.escapeHtml(scenario.name) + '" oninput="collectionRenameScenario(' + "'" + scenario.id + "'" + ', this.value)" placeholder="Nombre del caso de uso">' +
            '<button type="button" class="svc-rm" onclick="collectionRemoveScenario(' + "'" + scenario.id + "'" + ')"' + disabledRemove + '>&#10005;</button>' +
          '</div>' +
        '</div>';
      }, this).join('');
    }

    /**
     * Centraliza el refresco completo cuando cambia la estructura de escenarios.
     */
    refreshScenarioWorkspace() {
      this.renderScenarios();
      this.options.renderItems();
      this.options.renderVariableEditor();
      this.options.resetResult();
      this.options.resetExecution();
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionScenarioManager = CollectionScenarioManager;
})(window);
