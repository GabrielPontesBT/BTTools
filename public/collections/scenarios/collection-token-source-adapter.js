(function bootstrapCollectionTokenSourceAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: funciones globales del drawer "Fuentes de
   * token" que el HTML del panel invoca por nombre. Ver la nota de
   * arquitectura en shared/collection-utils-adapter.js.
   */

  global.collectionOpenTokenSourcesDrawer = function collectionOpenTokenSourcesDrawerAdapter() {
    return global.collectionGetTokenSourceManager().open();
  };

  global.collectionCloseTokenSourcesDrawer = function collectionCloseTokenSourcesDrawerAdapter() {
    global.collectionGetTokenSourceManager().close();
  };

  global.collectionSetTokenSource = function collectionSetTokenSourceAdapter(baseUrl, varKey) {
    global.collectionGetTokenSourceManager().setTokenSource(baseUrl, varKey);
  };
})(window);
