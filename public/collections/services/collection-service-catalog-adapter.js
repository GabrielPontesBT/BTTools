(function bootstrapCollectionServiceCatalogAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: funciones globales del catalogo de servicios
   * (filtro, listado de metodos) que el HTML del panel invoca por nombre.
   * Ver la nota de arquitectura en shared/collection-utils-adapter.js.
   */

  global.collectionFilterServices = function collectionFilterServicesAdapter() {
    global.collectionGetServiceCatalogManager().filterServices();
  };

  global.collectionLoadMethods = function collectionLoadMethodsAdapter(service) {
    global.collectionGetServiceCatalogManager().loadMethods(service);
  };

  global.collectionRenderServiceCatalog = function collectionRenderServiceCatalogAdapter() {
    global.collectionGetServiceCatalogManager().renderServiceCatalog();
  };

  global.collectionClearServiceSearch = function collectionClearServiceSearchAdapter() {
    var searchInput = document.getElementById('collection-service-search');
    if (searchInput) searchInput.value = '';
    global.collectionGetServiceCatalogManager().renderServiceCatalog();
  };
})(window);
