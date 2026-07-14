(function bootstrapCollectionResultManager(global) {
  'use strict';

  /**
   * Renderiza el resultado final de la generacion de collections.
   * Se mantiene separado del bootstrap para que la composicion HTML
   * no siga creciendo dentro de collections.js.
   */
  class CollectionResultManager {
    /**
     * Recibe helpers externos por inyeccion para evitar acoplamiento global.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Dibuja la tarjeta de resultado con descarga y resumen de auto-matching.
     */
    renderResult(data) {
      var result = document.getElementById('collection-result');
      if (!result) return;

      var mappings = data && data.mappings ? data.mappings : [];
      var mapHtml = mappings.length
        ? '<div class="collection-maps">' + mappings.map(function renderMap(map) {
            var label = (map.scenario ? map.scenario + ' / ' : '') + map.target + ' / ' + map.input;
            return '<div class="collection-map"><strong>' + label + '</strong><span>' + map.source + '</span></div>';
          }).join('') + '</div>'
        : '<p>No se detectaron variables top-level para machear automaticamente en esta primera version.</p>';

      result.className = 'collection-result show';
      result.innerHTML =
        '<h4>Collection generada</h4>' +
        '<p>Se genero una collection Postman con <strong>' + this.options.escapeHtml(data.requestCount) + '</strong> requests repartidos en <strong>' + this.options.escapeHtml(data.scenarioCount || 1) + '</strong> caso(s) de uso. Cada carpeta incluye Authenticate y los requests JSON descubiertos desde Swagger.</p>' +
        '<div class="collection-actions" style="margin-bottom:12px">' +
          '<a class="btn btn-primary" href="' + this.options.escapeHtml(data.downloadUrl || '#') + '">&#8595; Descargar ' + this.options.escapeHtml(data.fileName || 'collection.postman_collection.json') + '</a>' +
        '</div>' +
        '<h4>Auto-matching detectado</h4>' +
        mapHtml;
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionResultManager = CollectionResultManager;
})(window);
