(function bootstrapCollectionApiClient(global) {
  'use strict';

  /**
   * Encapsula todas las llamadas HTTP del feature collections.
   * La idea es que el resto de los modulos no conozca rutas `/api/...`
   * ni detalles repetidos de `fetch`, headers o parseo JSON.
   */
  class CollectionApiClient {
    /**
     * El constructor recibe un `fetch` opcional para facilitar pruebas futuras.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Devuelve la implementacion de `fetch` disponible en el runtime actual.
     */
    getFetch() {
      return this.options.fetchFn || global.fetch.bind(global);
    }

    /**
     * Ejecuta un POST JSON y devuelve siempre el body parseado como objeto.
     */
    async postJson(url, payload) {
      var response = await this.getFetch()(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {})
      });

      return response.json();
    }

    /**
     * Pide al backend la vista HTML del panel de collections.
     */
    async loadPanel() {
      var response = await this.getFetch()('/api/collection/panel');
      if (!response.ok) throw new Error('No se pudo cargar el panel.');
      return response.text();
    }

    /**
     * Solicita la preview legacy de variables cuando el flujo no se resuelve localmente.
     */
    async loadPreview(payload) {
      return this.postJson('/api/collection/preview', payload);
    }

    /**
     * Prueba la conectividad de base de datos del ambiente actual.
     */
    async testDatabase(payload) {
      return this.postJson('/api/test', payload);
    }

    /**
     * Pide token al Authenticate configurado para el ambiente activo.
     */
    async testAuthentication(payload) {
      return this.postJson('/api/test-auth', payload);
    }

    /**
     * Resuelve Swagger/OpenAPI y devuelve servicios normalizados para el builder.
     */
    async loadSwaggerServices(payload) {
      return this.postJson('/api/collection/swagger/load', payload);
    }

    /**
     * Resuelve servicios y metadata desde BTI014/BTI019 para usar base de datos como origen.
     */
    async loadDatabaseServices(payload) {
      return this.postJson('/api/collection/database/load', payload);
    }

    /**
     * Trae los ambientes Swagger guardados (nombre + lista de URLs).
     */
    async listSwaggerHistory() {
      return this.postJson('/api/collection/swagger-history', { action: 'list' });
    }

    /**
     * Guarda (o actualiza, si el set de URLs ya existia) un ambiente Swagger con nombre.
     */
    async saveSwaggerHistory(payload) {
      return this.postJson('/api/collection/swagger-history', Object.assign({ action: 'save' }, payload));
    }

    /**
     * Elimina un ambiente Swagger guardado por id.
     */
    async deleteSwaggerHistory(id) {
      return this.postJson('/api/collection/swagger-history', { action: 'delete', id: id });
    }

    /**
     * Pide el detalle completo de un metodo puntual cuando el origen es Base de datos.
     */
    async loadDatabaseOperation(payload) {
      return this.postJson('/api/collection/database/operation', payload);
    }

    /**
     * Ejecuta un flujo armado en el builder contra el backend local.
     */
    async executeFlow(payload) {
      return this.postJson('/api/collection/execute', payload);
    }

    /**
     * Genera el archivo Postman final listo para descargar.
     */
    async generateCollection(payload) {
      return this.postJson('/api/collection/generate', payload);
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionApiClient = CollectionApiClient;
})(window);

