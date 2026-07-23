(function bootstrapCollectionBuilderShellManager(global) {
  'use strict';

  /**
   * Orquesta el shell visual del builder: drawers, modo de insercion
   * y seleccion multiple del catalogo de servicios.
   */
  class CollectionBuilderShellManager {
    /**
     * Recibe acceso al estado y a callbacks del coordinador principal.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Garantiza que exista el sub-estado de UI usado por el builder.
     */
    ensureUiState() {
      var state = this.options.getState();
      if (!state.builderUi) {
        state.builderUi = {
          serviceDrawerOpen: false,
          inspectorDrawerOpen: false,
          pendingInsertIndex: null,
          selectedCatalogOperations: [],
          collapsedServiceGroups: [],
          inspectorTab: 'general',
          expandedInspectorInput: '',
          expandedInspectorInputGroups: [],
          expandedInspectorOutput: '',
          outputSearchTerm: '',
          outputSearchScopeKey: '',
          openSourcePicker: '',
          expandedSourceGroups: []
        };
      }

      if (!Array.isArray(state.builderUi.selectedCatalogOperations)) {
        state.builderUi.selectedCatalogOperations = [];
      }

      if (!Array.isArray(state.builderUi.collapsedServiceGroups)) {
        state.builderUi.collapsedServiceGroups = [];
      }

      if (!Array.isArray(state.builderUi.expandedSourceGroups)) {
        state.builderUi.expandedSourceGroups = [];
      }

      if (!Array.isArray(state.builderUi.expandedInspectorInputGroups)) {
        state.builderUi.expandedInspectorInputGroups = [];
      }

      if (!state.builderUi.inspectorTab) state.builderUi.inspectorTab = 'general';

      return state.builderUi;
    }

    /**
     * Devuelve el mappingKey del picker de origen actualmente abierto (uno a la vez).
     */
    getOpenSourcePicker() {
      return this.ensureUiState().openSourcePicker;
    }

    /**
     * Abre o cierra el picker de origen de un input concreto.
     */
    toggleSourcePicker(mappingKey) {
      var uiState = this.ensureUiState();
      uiState.openSourcePicker = uiState.openSourcePicker === mappingKey ? '' : mappingKey;
      this.options.renderInspector();
    }

    /**
     * Cierra cualquier picker de origen abierto (sin repintar; el caller ya repinta).
     */
    closeSourcePicker() {
      this.ensureUiState().openSourcePicker = '';
    }

    /**
     * Indica si el grupo (paso origen) de un picker esta expandido.
     */
    isSourceGroupExpanded(mappingKey, groupLabel) {
      return this.ensureUiState().expandedSourceGroups.indexOf(mappingKey + '::' + groupLabel) >= 0;
    }

    /**
     * Expande o colapsa un grupo (paso origen) dentro del picker de un input.
     */
    toggleSourceGroup(mappingKey, groupLabel) {
      var uiState = this.ensureUiState();
      var key = mappingKey + '::' + groupLabel;
      var index = uiState.expandedSourceGroups.indexOf(key);

      if (index >= 0) uiState.expandedSourceGroups.splice(index, 1);
      else uiState.expandedSourceGroups.push(key);

      this.options.renderInspector();
    }

    /**
     * Devuelve la pestana activa del inspector de pasos.
     */
    getInspectorTab() {
      return this.ensureUiState().inspectorTab;
    }

    /**
     * Cambia la pestana activa del inspector (General/Entradas/Salidas).
     */
    setInspectorTab(tab) {
      this.ensureUiState().inspectorTab = tab;
      this.options.renderInspector();
    }

    /**
     * Indica si una entrada concreta esta expandida en el acordeon del inspector.
     */
    isInspectorInputExpanded(mappingKey) {
      return this.ensureUiState().expandedInspectorInput === mappingKey;
    }

    /**
     * Expande o colapsa una entrada; solo una entrada queda abierta a la vez.
     */
    toggleInspectorInput(mappingKey) {
      var uiState = this.ensureUiState();
      uiState.expandedInspectorInput = uiState.expandedInspectorInput === mappingKey ? '' : mappingKey;
      this.options.renderInspector();
    }

    /**
     * Indica si un GRUPO de entradas (los campos de un mismo SDT/coleccion,
     * agrupados solo a nivel visual en collection-inspector-manager.js) esta
     * expandido. A diferencia de isInspectorInputExpanded (una sola entrada
     * abierta a la vez, porque son alternativas), varios grupos pueden estar
     * abiertos en simultaneo: agrupan campos relacionados, no compiten entre si.
     */
    isInspectorInputGroupExpanded(groupKey) {
      return this.ensureUiState().expandedInspectorInputGroups.indexOf(groupKey) >= 0;
    }

    /**
     * Expande o colapsa un grupo de entradas por su clave (el segmento raiz
     * del path, ej. "sdtPartner").
     */
    toggleInspectorInputGroup(groupKey) {
      var uiState = this.ensureUiState();
      var list = uiState.expandedInspectorInputGroups;
      var index = list.indexOf(groupKey);
      if (index >= 0) list.splice(index, 1);
      else list.push(groupKey);
      this.options.renderInspector();
    }

    /**
     * Indica si una salida concreta esta expandida en el acordeon del inspector.
     */
    isInspectorOutputExpanded(sourceVarKey) {
      return this.ensureUiState().expandedInspectorOutput === sourceVarKey;
    }

    /**
     * Expande o colapsa una salida; solo una salida queda abierta a la vez.
     */
    toggleInspectorOutput(sourceVarKey) {
      var uiState = this.ensureUiState();
      uiState.expandedInspectorOutput = uiState.expandedInspectorOutput === sourceVarKey ? '' : sourceVarKey;
      this.options.renderInspector();
    }

    /**
     * Devuelve el termino de busqueda de salidas, acotado al paso actualmente inspeccionado.
     */
    getOutputSearchTerm(scopeKey) {
      var uiState = this.ensureUiState();
      if (uiState.outputSearchScopeKey !== scopeKey) {
        uiState.outputSearchScopeKey = scopeKey;
        uiState.outputSearchTerm = '';
      }
      return uiState.outputSearchTerm;
    }

    /**
     * Actualiza el termino de busqueda de salidas y repinta el inspector.
     */
    setOutputSearchTerm(scopeKey, value) {
      var uiState = this.ensureUiState();
      uiState.outputSearchScopeKey = scopeKey;
      uiState.outputSearchTerm = value;
      this.options.renderInspector();
    }

    /**
     * Indica si el usuario colapso manualmente el grupo de un servicio.
     */
    isServiceGroupCollapsed(service) {
      return this.ensureUiState().collapsedServiceGroups.indexOf(service) >= 0;
    }

    /**
     * Colapsa o expande el acordeon de un servicio en el selector de metodos.
     */
    toggleServiceGroup(service) {
      var uiState = this.ensureUiState();
      var index = uiState.collapsedServiceGroups.indexOf(service);

      if (index >= 0) uiState.collapsedServiceGroups.splice(index, 1);
      else uiState.collapsedServiceGroups.push(service);

      this.options.renderServiceCatalog();
    }

    /**
     * Devuelve el indice donde se insertara el proximo paso.
     */
    resolveInsertIndex() {
      var uiState = this.ensureUiState();
      var scenario = this.options.getActiveScenario();
      if (!scenario) return null;

      if (typeof uiState.pendingInsertIndex === 'number' && uiState.pendingInsertIndex >= 0) {
        return Math.min(uiState.pendingInsertIndex, scenario.items.length);
      }

      return scenario.items.length;
    }

    /**
     * Limpia la seleccion multiple del catalogo.
     */
    clearCatalogSelection() {
      this.ensureUiState().selectedCatalogOperations = [];
    }

    /**
     * Devuelve cuantas operaciones quedaron marcadas en el catalogo.
     */
    getCatalogSelectionCount() {
      return this.ensureUiState().selectedCatalogOperations.length;
    }

    /**
     * Indica si una operacion concreta esta seleccionada en el catalogo.
     */
    isCatalogOperationSelected(service, operationKey) {
      return this.ensureUiState().selectedCatalogOperations.some(function matchSelection(entry) {
        return entry && entry.service === service && entry.operationKey === operationKey;
      });
    }

    /**
     * Marca o desmarca una operacion del catalogo sin agregarla aun al flujo.
     */
    toggleCatalogSelection(service, operationKey, checked) {
      var uiState = this.ensureUiState();
      var nextChecked = !!checked;

      uiState.selectedCatalogOperations = uiState.selectedCatalogOperations.filter(function keepOthers(entry) {
        return !(entry && entry.service === service && entry.operationKey === operationKey);
      });

      if (nextChecked) {
        uiState.selectedCatalogOperations.push({ service: service, operationKey: operationKey });
      }

      this.syncShellState();
      this.options.renderServiceCatalog();
    }

    /**
     * Abre el drawer izquierdo para agregar servicios al final del flujo.
     */
    openServiceDrawer() {
      var uiState = this.ensureUiState();
      uiState.serviceDrawerOpen = true;
      uiState.pendingInsertIndex = null;
      this.syncShellState();
      this.options.renderServiceCatalog();
    }

    /**
     * Abre el drawer izquierdo indicando que el alta va despues del paso seleccionado.
     */
    openServiceDrawerForNextStep() {
      var uiState = this.ensureUiState();
      var scenario = this.options.getActiveScenario();
      var nextIndex = scenario ? scenario.items.length : null;

      if (scenario && typeof scenario.selectedItemIndex === 'number' && scenario.selectedItemIndex >= 0) {
        nextIndex = scenario.selectedItemIndex + 1;
      }

      uiState.serviceDrawerOpen = true;
      uiState.pendingInsertIndex = nextIndex;
      this.syncShellState();
      this.options.renderServiceCatalog();
    }

    /**
     * Cierra el drawer izquierdo y olvida el modo de insercion pendiente.
     */
    closeServiceDrawer() {
      var uiState = this.ensureUiState();
      uiState.serviceDrawerOpen = false;
      uiState.pendingInsertIndex = null;
      this.syncShellState();
    }

    /**
     * Abre el drawer derecho cuando el usuario selecciona un paso.
     */
    openInspector() {
      this.ensureUiState().inspectorDrawerOpen = true;
      this.syncShellState();
    }

    /**
     * Cierra manualmente el drawer derecho del inspector.
     */
    closeInspector() {
      this.ensureUiState().inspectorDrawerOpen = false;
      this.syncShellState();
    }

    /**
     * Si el usuario toca el backdrop, se cierran los drawers abiertos.
     */
    handleBackdropClick() {
      var uiState = this.ensureUiState();
      uiState.serviceDrawerOpen = false;
      uiState.inspectorDrawerOpen = false;
      uiState.pendingInsertIndex = null;
      this.syncShellState();
    }

    /**
     * Agrega una sola operacion desde el catalogo al flujo activo.
     */
    async insertCatalogOperation(service, operationKey) {
      var insertIndex = this.resolveInsertIndex();
      try {
        await this.options.insertOperation(service, operationKey, insertIndex);
      } catch (error) {
        if (typeof this.options.showStatus === 'function') {
          this.options.showStatus('err', error.message || 'No se pudo agregar el servicio al flujo.');
        }
        return;
      }
      this.clearCatalogSelection();
      this.closeServiceDrawer();
      this.openInspector();
    }

    /**
     * Agrega en lote todas las operaciones tildadas en el catalogo.
     */
    async addSelectedOperations() {
      var uiState = this.ensureUiState();
      var insertIndex = this.resolveInsertIndex();
      var selections = uiState.selectedCatalogOperations.slice();

      if (!selections.length) return;

      try {
        for (var index = 0; index < selections.length; index++) {
          var entry = selections[index];
          await this.options.insertOperation(entry.service, entry.operationKey, insertIndex);
          if (typeof insertIndex === 'number') insertIndex += 1;
        }
      } catch (error) {
        if (typeof this.options.showStatus === 'function') {
          this.options.showStatus('err', error.message || 'No se pudo agregar el servicio al flujo.');
        }
        return;
      }

      this.clearCatalogSelection();
      this.closeServiceDrawer();
      this.openInspector();
    }

    /**
     * Devuelve un texto humano para explicar donde quedaran los nuevos pasos.
     */
    buildInsertTargetLabel() {
      var scenario = this.options.getActiveScenario();
      var insertIndex = this.resolveInsertIndex();

      if (!scenario || !scenario.items.length || typeof insertIndex !== 'number') {
        return 'Los nuevos pasos se agregaran al final de la cadena.';
      }

      if (insertIndex <= 0) return 'Los nuevos pasos se agregaran al inicio de la cadena.';
      if (insertIndex >= scenario.items.length) return 'Los nuevos pasos se agregaran al final de la cadena.';

      var previousItem = scenario.items[insertIndex - 1];
      return 'Los nuevos pasos se agregaran despues de ' + String((previousItem && previousItem.method) || 'este paso') + '.';
    }

    /**
     * Sincroniza clases, labels y visibilidad del shell del builder.
     */
    syncShellState() {
      var uiState = this.ensureUiState();
      var workspace = document.getElementById('collection-builder-workspace');
      var selectedItem = this.options.getSelectedItem();
      var hasSelection = !!selectedItem;

      if (!hasSelection) {
        uiState.inspectorDrawerOpen = false;
      }

      if (workspace) {
        workspace.classList.toggle('collection-builder-service-open', !!uiState.serviceDrawerOpen);
        workspace.classList.toggle('collection-builder-inspector-open', !!uiState.inspectorDrawerOpen && hasSelection);
        workspace.classList.toggle('collection-builder-has-selection', hasSelection);
      }

      var backdrop = document.getElementById('collection-builder-backdrop');
      if (backdrop) {
        var showBackdrop = !!uiState.serviceDrawerOpen || (!!uiState.inspectorDrawerOpen && hasSelection);
        backdrop.classList.toggle('show', showBackdrop);
      }

      var selectionCount = document.getElementById('collection-builder-selection-count');
      if (selectionCount) {
        var count = this.getCatalogSelectionCount();
        selectionCount.textContent = count + ' seleccionado' + (count === 1 ? '' : 's');
      }

      var serviceTarget = document.getElementById('collection-builder-service-target');
      if (serviceTarget) {
        serviceTarget.textContent = this.buildInsertTargetLabel();
      }

      var addSelectedButton = document.getElementById('btn-collection-add-selected');
      if (addSelectedButton) {
        addSelectedButton.disabled = this.getCatalogSelectionCount() === 0;
      }

      var inspectorTitle = document.getElementById('collection-builder-inspector-title');
      if (inspectorTitle) {
        inspectorTitle.textContent = hasSelection ? String(selectedItem.method || 'Paso') : 'Configurar paso';
      }

      var inspectorMeta = document.getElementById('collection-builder-inspector-meta');
      if (inspectorMeta) {
        inspectorMeta.textContent = hasSelection
          ? String(selectedItem.service || '') + ' | ' + String((selectedItem.httpMethod || 'GET')).toUpperCase()
          : 'Selecciona un paso del flujo para ver su configuracion.';
      }
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionBuilderShellManager = CollectionBuilderShellManager;
})(window);
