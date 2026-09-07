(function bootstrapCollectionImportAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: funciones globales para importar una
   * collection existente, invocadas por nombre desde el HTML del panel. Ver
   * la nota de arquitectura en shared/collection-utils-adapter.js.
   */

  global.collectionTriggerImportCollection = function collectionTriggerImportCollectionAdapter() {
    global.collectionGetImportManager().triggerFileDialog();
  };

  global.collectionImportCollectionFile = function collectionImportCollectionFileAdapter(file) {
    global.collectionGetImportManager().handleFileSelected(file);
  };
})(window);
