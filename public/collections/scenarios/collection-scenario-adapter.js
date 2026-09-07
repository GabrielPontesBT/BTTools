(function bootstrapCollectionScenarioAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: funciones globales de alta/baja/renombre de
   * casos de uso, invocadas por nombre desde el HTML del panel. Ver la nota
   * de arquitectura en shared/collection-utils-adapter.js.
   */

  global.collectionAddScenario = function collectionAddScenarioAdapter() {
    global.collectionGetScenarioManager().addScenario();
  };

  global.collectionRenameScenario = function collectionRenameScenarioAdapter(id, value) {
    global.collectionGetScenarioManager().renameScenario(id, value);
  };

  global.collectionRemoveScenario = function collectionRemoveScenarioAdapter(id) {
    global.collectionGetScenarioManager().removeScenario(id);
  };

  global.collectionRenderScenarios = function collectionRenderScenariosAdapter() {
    global.collectionGetScenarioManager().renderScenarios();
  };
})(window);
