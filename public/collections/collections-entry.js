(function bootstrapCollectionsEntry(global, documentRef) {
  'use strict';

  /**
   * Entry point único del módulo collections.
   * El `index.html` solo necesita incluir este archivo; desde aquí se cargan
   * en orden todas las piezas internas del feature.
   */
  var moduleScripts = [
    '/public/collections/shared/collection-utils.js',
    '/public/collections/services/collection-api-client.js',
    '/public/collections/services/collection-environment-manager.js',
    '/public/collections/core/collection-bootstrap-manager.js',
    '/public/collections/core/collection-state-store.js',
    '/public/collections/execution/collection-execution-center.js',
    '/public/collections/preview/collection-preview-manager.js',
    '/public/collections/scenarios/collection-scenario-manager.js',
    '/public/collections/services/collection-service-catalog-manager.js',
    '/public/collections/ui/collection-feedback-manager.js',
    '/public/collections/ui/collection-studio-manager.js',
    '/public/collections/ui/collection-canvas-manager.js',
    '/public/collections/ui/collection-canvas-interaction-manager.js',
    '/public/collections/ui/collection-inspector-manager.js',
    '/public/collections.js'
  ];

  /**
   * Carga un script por vez para respetar el orden de dependencias.
   */
  function loadScriptSequentially(index) {
    if (index >= moduleScripts.length) return;

    var script = documentRef.createElement('script');
    script.src = moduleScripts[index];
    script.onload = function handleScriptLoaded() {
      loadScriptSequentially(index + 1);
    };
    script.onerror = function handleScriptLoadError() {
      console.error('No se pudo cargar el módulo collections:', moduleScripts[index]);
    };

    documentRef.body.appendChild(script);
  }

  loadScriptSequentially(0);
})(window, document);
