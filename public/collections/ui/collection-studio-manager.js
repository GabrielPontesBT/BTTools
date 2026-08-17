(function bootstrapCollectionStudioManager(global) {
  'use strict';

  /**
   * Maneja el estado visual del "studio" de collections:
   * etapa actual, selección de formato/destino y sincronización de toolbar.
   */
  class CollectionStudioManager {
    /**
     * Recibe el estado compartido y un pequeño contrato de callbacks.
     * De esa forma esta clase no depende directamente de funciones globales.
     */
    constructor(state, callbacks) {
      this.state = state;
      this.callbacks = callbacks || {};
    }

    /**
     * Indica si el camino actualmente elegido está soportado por el builder.
     * El destino sigue siendo siempre Postman (no hay UI para elegir otro).
     * El formato puede ser JSON (V4, y V3 experimental) o XML/SOAP (V3, el
     * camino real probado contra un ambiente — ver [[project-v3-v4-protocol-conventions]]).
     */
    pathSupported() {
      var formatSupported = this.state.format === 'json' || this.state.format === 'xml';
      return formatSupported && this.state.target === 'postman';
    }

    /**
     * Traduce la clave técnica de una etapa a una etiqueta legible.
     */
    stageLabel(stage) {
      if (stage === 'define') return 'Definicion';
      if (stage === 'setup') return 'Catalogo';
      if (stage === 'builder') return 'Builder';
      return stage;
    }

    /**
     * Cambia la etapa activa del studio y vuelve a pintar la pantalla.
     */
    setStage(stage) {
      this.state.studioStage = stage;
      this.renderStage();
    }

    /**
     * Sincroniza los botones superiores para que reflejen el formato y destino elegidos.
     */
    syncToolbarChoices() {
      var pairs = [
        ['format', 'json', 'col-toolbar-format-json'],
        ['format', 'xml', 'col-toolbar-format-xml'],
        ['target', 'postman', 'col-toolbar-target-postman'],
        ['target', 'soap', 'col-toolbar-target-soap']
      ];

      pairs.forEach(function updateButtonState(pair) {
        var element = document.getElementById(pair[2]);
        if (!element) return;
        if (this.state[pair[0]] === pair[1]) element.classList.add('sel');
        else element.classList.remove('sel');
      }, this);
    }

    /**
     * Aplica una elección hecha desde la toolbar superior.
     * También dispara limpieza de mensajes y resultados viejos.
     */
    pickToolbarChoice(kind, value, element) {
      this.state[kind] = value;

      if (element && element.parentElement) {
        Array.prototype.forEach.call(element.parentElement.querySelectorAll('.collection-mode-btn'), function updateSiblingButtons(button) {
          if (button.dataset.kind === kind) button.classList.remove('sel');
        });
        element.classList.add('sel');
      }

      this.callbacks.clearStatus();
      this.callbacks.resetResult();
      this.callbacks.resetExecution();
      this.callbacks.toggleConfig();
    }

    /**
     * Repinta la visibilidad general de las etapas del studio.
     */
    renderStage() {
      var intro = document.getElementById('collection-studio-intro');
      var config = document.getElementById('collection-config');
      var services = document.getElementById('collection-services');
      var stageButtons = document.querySelectorAll('.collection-stage-btn');
      var shell = document.querySelector('.collection-shell-studio');
      var studioTitle = document.getElementById('collection-studio-title');
      var studioSubtitle = document.getElementById('collection-studio-subtitle');
      var stage = this.state.studioStage || 'setup';

      Array.prototype.forEach.call(stageButtons, function updateStageButton(button) {
        var isActive = button.dataset.stage === stage;
        button.classList.toggle('active', isActive);
      });

      if (shell) {
        shell.classList.remove('collection-studio-stage-define', 'collection-studio-stage-setup', 'collection-studio-stage-builder');
        shell.classList.add('collection-studio-stage-' + stage);
        shell.classList.toggle('collection-shell-studio-builder', stage === 'builder');
      }

      if (studioTitle) {
        studioTitle.textContent = 'Casos de uso';
      }

      if (studioSubtitle) {
        studioSubtitle.textContent = '';
        studioSubtitle.style.display = 'none';
      }

      if (intro) intro.style.display = stage === 'define' ? 'block' : 'none';
      if (config) config.style.display = stage === 'setup' ? 'block' : 'none';
      if (services) services.style.display = stage === 'builder' ? 'flex' : 'none';

      var summary = document.getElementById('collection-studio-summary');
      if (summary) {
        var formatText = this.state.format ? this.state.format.toUpperCase() : 'Sin formato';
        var targetText = this.state.target ? this.state.target : 'Sin destino';
        summary.textContent = 'Camino seleccionado: ' + formatText + ' + ' + targetText + '.';
      }

      if (stage === 'setup' && this.callbacks.refreshContext) {
        this.callbacks.refreshContext();
      }
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionStudioManager = CollectionStudioManager;
})(window);
