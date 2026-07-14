(function bootstrapCollectionsEntry(global, documentRef) {
  'use strict';

  /**
   * Entry point unico del modulo collections.
   * El index.html solo necesita incluir este archivo; desde aqui se cargan
   * en orden todas las piezas internas del feature.
   */
  var moduleScripts = [
    '/public/collections/shared/collection-utils.js',
    '/public/collections/services/collection-api-client.js',
    '/public/collections/services/collection-environment-manager.js',
    '/public/collections/core/collection-bootstrap-manager.js',
    '/public/collections/core/collection-state-store.js',
    '/public/collections/execution/collection-execution-mock-data-builder.js',
    '/public/collections/execution/collection-execution-view-renderer.js',
    '/public/collections/execution/collection-execution-center.js',
    '/public/collections/preview/collection-preview-manager.js',
    '/public/collections/scenarios/collection-flow-lifecycle-manager.js',
    '/public/collections/scenarios/collection-scenario-manager.js',
    '/public/collections/services/collection-service-catalog-manager.js',
    '/public/collections/ui/collection-feedback-manager.js',
    '/public/collections/ui/collection-request-data-manager.js',
    '/public/collections/ui/collection-result-manager.js',
    '/public/collections/ui/collection-studio-manager.js',
    '/public/collections/ui/collection-builder-shell-manager.js',
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
      console.error('No se pudo cargar el modulo collections:', moduleScripts[index]);
    };

    documentRef.body.appendChild(script);
  }

  loadScriptSequentially(0);
})(window, document);
