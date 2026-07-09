(function bootstrapCollectionBootstrapManager(global) {
  'use strict';

  /**
   * Orquesta el montaje inicial del panel de collections y el binding
   * de eventos base del feature dentro del wizard principal.
   */
  class CollectionBootstrapManager {
    /**
     * Recibe cliente HTTP, flags de bootstrap y callbacks del coordinador principal.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Conecta los botones del bloque de ambiente una sola vez.
     */
    bindButtons() {
      if (this.options.isButtonsBound()) return;

      var buttonTestDb = document.getElementById('btn-collection-test-db');
      var buttonTestAuth = document.getElementById('btn-collection-test-auth');
      var buttonLoadServices = document.getElementById('btn-collection-load-services');
      if (!buttonTestDb || !buttonTestAuth || !buttonLoadServices) return;

      buttonTestDb.addEventListener('click', this.handleTestDbClick.bind(this));
      buttonTestAuth.addEventListener('click', this.handleTestAuthClick.bind(this));
      buttonLoadServices.addEventListener('click', this.handleLoadServicesClick.bind(this));

      this.options.setButtonsBound(true);
    }

    /**
     * Wrapper del click de prueba de BD.
     */
    handleTestDbClick(event) {
      event.preventDefault();
      this.options.testDb();
    }

    /**
     * Wrapper del click de prueba de autenticacion.
     */
    handleTestAuthClick(event) {
      event.preventDefault();
      this.options.testAuth();
    }

    /**
     * Wrapper del click que inicia la lectura de Swagger.
     */
    handleLoadServicesClick(event) {
      event.preventDefault();
      this.options.loadServices();
    }

    /**
     * Pide el HTML del panel, lo inserta y deja listo el builder.
     */
    async mountPanel() {
      var mount = document.getElementById('collection-mount');
      if (!mount) return;

      try {
        mount.innerHTML = await this.options.apiClient.loadPanel();

        var mountedPanel = mount.querySelector('.panel');
        if (mountedPanel && mountedPanel.parentElement === mount) {
          mount.innerHTML = mountedPanel.innerHTML;
        }

        this.options.upgradeStudioLayout();
        this.options.ensureScenario();
        this.bindButtons();
        this.bindResize();
        this.options.renderScenarios();
        this.options.renderItems();
        this.pickDefaultChoices();
        this.options.refreshContext();
      } catch (error) {
        mount.innerHTML = '<div class="collection-block"><div class="collection-status show err">No se pudo cargar el builder de collections. ' + this.options.escapeHtml(error.message || '') + '</div></div>';
      }
    }

    /**
     * Registra el resize global una sola vez para recalcular flechas y canvas.
     */
    bindResize() {
      if (this.options.isFlowResizeBound()) return;

      window.addEventListener('resize', this.handleResize.bind(this));
      this.options.setFlowResizeBound(true);
    }

    /**
     * Refresca los enlaces visuales al cambiar el tamaño de la ventana.
     */
    handleResize() {
      this.options.renderFlowConnections();
      this.options.renderCanvasConnections();
    }

    /**
     * Aplica el camino por defecto del feature para no exigir clics extra.
     */
    pickDefaultChoices() {
      var jsonButton = document.getElementById('col-toolbar-format-json') || document.getElementById('col-format-json');
      if (jsonButton) this.options.pickChoice('format', 'json', jsonButton);

      var postmanButton = document.getElementById('col-toolbar-target-postman') || document.getElementById('col-target-postman');
      if (postmanButton) this.options.pickChoice('target', 'postman', postmanButton);
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionBootstrapManager = CollectionBootstrapManager;
})(window);
