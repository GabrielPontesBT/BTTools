(function bootstrapCollectionFeedbackManager(global) {
  'use strict';

  /**
   * Administra los bloques de feedback visual del builder.
   * Su responsabilidad es chica y concreta: mostrar mensajes de estado
   * y limpiar el panel donde se informa la generación/exportación.
   */
  class CollectionFeedbackManager {
    /**
     * Muestra un mensaje de estado en la franja principal del builder.
     * `kind` define el color visual (`ok`, `err`, etc.).
     */
    showStatus(kind, text) {
      var statusElement = document.getElementById('collection-status');
      if (!statusElement) return;

      // Se actualiza la clase completa para que el CSS aplique el color correcto.
      statusElement.className = 'collection-status show ' + kind;
      statusElement.textContent = text;
    }

    /**
     * Oculta el mensaje de estado y deja el contenedor limpio.
     */
    clearStatus() {
      var statusElement = document.getElementById('collection-status');
      if (!statusElement) return;

      statusElement.className = 'collection-status';
      statusElement.textContent = '';
    }

    /**
     * Limpia el panel donde hoy se muestra el resultado de exportar la collection.
     * Se usa antes de recalcular una generación para no dejar información vieja.
     */
    resetResult() {
      var resultElement = document.getElementById('collection-result');
      if (!resultElement) return;

      resultElement.className = 'collection-result';
      resultElement.innerHTML = '';
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionFeedbackManager = CollectionFeedbackManager;
})(window);
