(function bootstrapCollectionStudioAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: expone en window las funciones del "studio"
   * (elegir formato/origen/destino, cambiar de etapa) que el HTML del panel
   * invoca por nombre desde atributos inline. Ver la nota de arquitectura en
   * shared/collection-utils-adapter.js sobre por que este archivo no exporta
   * una clase via BTCollectionModules como el resto de los modulos.
   */

  // Solo se usa dentro de upgradeStudioLayout, así que queda privado a este
  // archivo en vez de ser una var global suelta como en collections.js.
  var collectionStudioUpgraded = false;

  /**
   * Transforma el shell recien montado en el layout visual del "studio"
   * (marca, titulo compacto, bloques reetiquetados). Se ejecuta una sola vez
   * por carga de pagina — guardado por collectionStudioUpgraded.
   */
  global.collectionUpgradeStudioLayout = function collectionUpgradeStudioLayoutAdapter() {
    if (collectionStudioUpgraded) return;
    var shell = document.querySelector('#collection-mount .collection-shell') || document.querySelector('.collection-shell');
    if (!shell) return;
    collectionStudioUpgraded = true;
    shell.classList.add('collection-shell-studio');

    var existingTitle = shell.querySelector('.ptitle');
    var existingLead = shell.querySelector('.collection-lead');
    if (existingTitle) existingTitle.style.display = 'none';
    if (existingLead) existingLead.style.display = 'none';

    if (!shell.querySelector('.collection-studio-top')) {
      var top = document.createElement('div');
      top.className = 'collection-studio-top collection-studio-top-simple';
      top.innerHTML =
        '<div class="collection-studio-brand">' +
          '<div class="collection-studio-mark">C</div>' +
          '<div>' +
            '<div id="collection-studio-title" class="collection-studio-title">Casos de uso</div>' +
            '<div id="collection-studio-subtitle" class="collection-studio-subtitle"></div>' +
          '</div>' +
        '</div>';
      shell.insertBefore(top, shell.firstChild);
    }

    var config = document.getElementById('collection-config');
    if (config) {
      config.classList.remove('collection-block');
      config.classList.add('collection-studio-config');
      var summary = document.getElementById('collection-env-summary');
      if (summary) summary.className = 'collection-tech-content';
    }

    var services = document.getElementById('collection-services');
    if (services) {
      services.classList.remove('collection-block');
      services.classList.add('collection-studio-workspace');
    }

    global.collectionSyncToolbarChoices();
    global.collectionRenderStudioStage();
  };

  /**
   * Alterna la visibilidad de configuracion/servicios segun si el camino
   * elegido esta soportado, y refresca el contexto del ambiente si aplica.
   */
  global.collectionToggleConfig = function collectionToggleConfigAdapter() {
    var note = document.getElementById('collection-path-note');
    var config = document.getElementById('collection-config');
    var services = document.getElementById('collection-services');
    if (!note || !config || !services) return;
    note.style.display = 'none';
    if (!global.collectionPathSupported()) {
      config.style.display = 'none';
      services.style.display = 'none';
      return;
    }
    global.collectionRefreshContext();
    global.collectionRenderStudioStage();
  };

  /**
   * Aplica una eleccion hecha desde las mini-cards de Fuente/Formato/Destino.
   * Si cambia el origen de servicios, se limpia todo lo cargado antes de
   * pedir de nuevo el catalogo.
   */
  global.collectionPickChoice = function collectionPickChoiceAdapter(kind, value, el) {
    global.collectionState[kind] = value;
    var group = el && el.closest ? (el.closest('.collection-mini-cards') || el.closest('.collection-studio-actions')) : null;
    if (group) {
      Array.prototype.forEach.call(group.querySelectorAll('.ccard, .collection-mode-btn'), function(card) {
        card.classList.remove('sel');
      });
    }
    if (el) el.classList.add('sel');
    if (kind === 'serviceSource') {
      global.collectionResetLoadedData();
      if (typeof global.collectionUpdateServiceSource === 'function') global.collectionUpdateServiceSource(value);
    }
    global.collectionSyncToolbarChoices();
    global.collectionClearStatus();
    global.collectionResetResult();
    global.collectionResetExecution();
    global.collectionToggleConfig();
  };

  global.collectionPathSupported = function collectionPathSupportedAdapter() {
    return global.collectionGetStudioManager().pathSupported();
  };

  global.collectionStageLabel = function collectionStageLabelAdapter(stage) {
    return global.collectionGetStudioManager().stageLabel(stage);
  };

  global.collectionSetStudioStage = function collectionSetStudioStageAdapter(stage) {
    global.collectionGetStudioManager().setStage(stage);
  };

  global.collectionRenderStudioStage = function collectionRenderStudioStageAdapter() {
    global.collectionGetStudioManager().renderStage();
  };

  global.collectionSyncToolbarChoices = function collectionSyncToolbarChoicesAdapter() {
    global.collectionGetStudioManager().syncToolbarChoices();
  };

  global.collectionPickToolbarChoice = function collectionPickToolbarChoiceAdapter(kind, value, el) {
    global.collectionGetStudioManager().pickToolbarChoice(kind, value, el);
  };

  // Vuelve del canvas a la pantalla de Fuente/Ruta Swagger sin tocar nada del
  // escenario ya armado (servicios, casos de uso, mappings): solo cambia que
  // bloque de collection-config/collection-services esta visible (ver
  // CollectionStudioManager.renderStage()).
  global.collectionBackToSetup = function collectionBackToSetupAdapter() {
    global.collectionGetStudioManager().setStage('setup');
  };
})(window);
