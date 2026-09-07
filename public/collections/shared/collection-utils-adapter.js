(function bootstrapCollectionUtilsAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: expone en window las funciones sueltas que el
   * HTML generado por los managers invoca por nombre desde atributos inline
   * (onclick=..., oninput=...). No hay bundler ni delegacion de eventos, asi
   * que estos nombres tienen que existir como globales reales; por eso este
   * archivo no exporta una clase via BTCollectionModules como el resto de los
   * modulos, sino que asigna cada funcion directamente sobre `global`.
   *
   * Toda la logica real vive en CollectionUtils (shared/collection-utils.js);
   * acá solo se resuelve el nombre estable que el resto del builder ya conoce.
   */

  global.collectionEscapeHtml = function collectionEscapeHtmlAdapter(value) {
    // Delegamos el escape HTML a la utilidad compartida para tener una sola implementacion.
    return global.collectionUtils.escapeHtml(value);
  };

  global.collectionNormalizeToken = function collectionNormalizeTokenAdapter(value) {
    // Centralizamos la normalizacion para que preview, matching y filtros comparen igual.
    return global.collectionUtils.normalizeToken(value);
  };

  global.collectionDomId = function collectionDomIdAdapter(key) {
    // Generamos ids seguros para el DOM desde el helper puro compartido.
    return global.collectionUtils.domId(key);
  };

  global.collectionFlowId = function collectionFlowIdAdapter(prefix, value) {
    // Reutilizamos el helper de ids del canvas para no duplicar reglas de sanitizacion.
    return global.collectionUtils.flowId(prefix, value);
  };

  global.collectionContextKey = function collectionContextKeyAdapter() {
    // Esta clave resume el ambiente actual y sirve para invalidar estado cacheado.
    return global.collectionUtils.contextKey();
  };

  global.collectionResolveV4AuthUrl = function collectionResolveV4AuthUrlAdapter(api) {
    // La resolucion de Authenticate queda encapsulada en utilidades compartidas.
    return global.collectionUtils.resolveV4AuthUrl(api);
  };

  global.collectionGuessSwaggerUrl = function collectionGuessSwaggerUrlAdapter(api) {
    // La inferencia de Swagger se unifica para que todo el builder use la misma regla.
    return global.collectionUtils.guessSwaggerUrl(api);
  };
})(window);
