(function bootstrapCollectionTokenSourceManager(global) {
  'use strict';

  /**
   * Maneja el panel "Fuentes de token": por cada grupo de servicios que
   * comparten el mismo sourceBaseUrl (un swagger/microservicio distinto
   * puede autenticarse con un token propio -- ver extractSwaggerOperations
   * en index.js), deja elegir que salida de que paso alimenta su header
   * Token. Sin seleccion, el grupo sigue usando el token del Authenticate
   * automatico (comportamiento historico, sin cambios).
   */
  class CollectionTokenSourceManager {
    /**
     * Recibe callbacks del builder principal para no depender de globals sueltos.
     */
    constructor(options) {
      this.options = options || {};
      this.state = { open: false };
    }

    /**
     * Junta, en orden de aparicion, cada sourceBaseUrl distinto presente en
     * el escenario activo -- son los grupos que se pueden autenticar por
     * separado. Items sin sourceBaseUrl (ej. origen Base de datos) no forman
     * grupo: ya usan el mecanismo historico unico.
     */
    getGroups() {
      var scenario = this.options.getActiveScenario();
      if (!scenario) return [];

      var seen = {};
      var groups = [];
      (scenario.items || []).forEach(function collectGroup(item) {
        var baseUrl = item.sourceBaseUrl || '';
        if (!baseUrl || seen[baseUrl]) return;
        seen[baseUrl] = true;
        groups.push({
          baseUrl: baseUrl,
          tokenSourceKey: (scenario.tokenSources && scenario.tokenSources[baseUrl]) || ''
        });
      });
      return groups;
    }

    /**
     * Abre el panel, refrescando primero la lista de salidas disponibles
     * (misma fuente que ya usa el resto del chaining -- ver
     * CollectionPreviewManager.loadPreview/previewOutputs).
     */
    async open() {
      if (typeof collectionCloseServiceDrawer === 'function') collectionCloseServiceDrawer();
      if (typeof collectionCloseChainSuggestionDrawer === 'function') collectionCloseChainSuggestionDrawer();
      await this.options.getPreviewManager().loadPreview();

      this.state.open = true;

      var workspace = document.getElementById('collection-builder-workspace');
      if (workspace) workspace.classList.add('collection-builder-token-sources-open');
      var backdrop = document.getElementById('collection-builder-backdrop');
      if (backdrop) backdrop.classList.add('show');

      this.render();
    }

    /**
     * Cierra el panel sin perder la configuracion elegida.
     */
    close() {
      if (!this.state.open) return;
      this.state.open = false;

      var workspace = document.getElementById('collection-builder-workspace');
      var otherDrawerOpen = workspace && (
        workspace.classList.contains('collection-builder-service-open') ||
        workspace.classList.contains('collection-builder-inspector-open') ||
        workspace.classList.contains('collection-builder-suggestion-open')
      );
      if (workspace) workspace.classList.remove('collection-builder-token-sources-open');

      var backdrop = document.getElementById('collection-builder-backdrop');
      if (backdrop && !otherDrawerOpen) backdrop.classList.remove('show');

      this.render();
    }

    /**
     * Guarda, para un grupo (sourceBaseUrl), que salida alimenta su Token.
     * Valor vacio = volver al Authenticate automatico.
     */
    setTokenSource(baseUrl, varKey) {
      var scenario = this.options.getActiveScenario();
      if (!scenario) return;
      if (!scenario.tokenSources) scenario.tokenSources = {};

      var trimmedKey = String(varKey || '').trim();
      if (trimmedKey) scenario.tokenSources[baseUrl] = trimmedKey;
      else delete scenario.tokenSources[baseUrl];

      this.render();
    }

    /**
     * Repinta el panel completo: cabecera fija en panel.html, este metodo
     * solo llena el body con un selector por grupo.
     */
    render() {
      var body = document.getElementById('collection-token-sources-body');
      if (!body) return;

      var groups = this.getGroups();
      if (!groups.length) {
        body.innerHTML = '<div class="collection-suggest-status">Agrega servicios al flujo para configurar sus fuentes de token.</div>';
        return;
      }

      var scenario = this.options.getActiveScenario();
      var outputs = (scenario && scenario.previewOutputs) || [];
      var escapeHtml = this.options.escapeHtml;

      body.innerHTML = groups.map(function renderGroupRow(group) {
        var options = '<option value="">Automatico (Authenticate)</option>' +
          outputs.map(function renderOutputOption(output) {
            var selected = output.sourceVarKey === group.tokenSourceKey ? ' selected' : '';
            var label = output.sourceLabel + ' → ' + (output.pathLabel || output.key || output.sourceVarKey);
            return '<option value="' + escapeHtml(output.sourceVarKey) + '"' + selected + '>' + escapeHtml(label) + '</option>';
          }).join('');

        return '<div class="collection-suggest-field">' +
            '<label class="collection-suggest-label" title="' + escapeHtml(group.baseUrl) + '">' + escapeHtml(group.baseUrl) + '</label>' +
            '<select class="collection-suggest-select" onchange="collectionSetTokenSource(\'' + escapeHtml(group.baseUrl) + '\', this.value)">' +
              options +
            '</select>' +
          '</div>';
      }).join('');
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionTokenSourceManager = CollectionTokenSourceManager;
})(window);
