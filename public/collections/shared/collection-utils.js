(function bootstrapCollectionUtils(global) {
  'use strict';

  /**
   * Reúne helpers puros y reutilizables del módulo collections.
   * Este archivo no debe depender del DOM salvo para leer funciones externas
   * opcionales que le inyecten desde el bootstrap principal.
   */
  class CollectionUtils {
    /**
     * Recibe callbacks opcionales para resolver contexto externo del wizard.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Escapa caracteres HTML para evitar romper atributos o renderizar contenido inseguro.
     */
    escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    /**
     * Normaliza texto para comparar nombres ignorando espacios, guiones y casing.
     */
    normalizeToken(value) {
      return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    }

    /**
     * Genera ids seguros para usar en el DOM a partir de una clave técnica.
     */
    domId(key) {
      return 'col_var_' + String(key || '').replace(/[^A-Za-z0-9_]/g, '_');
    }

    /**
     * Genera ids de nodos/puertos del diagrama de flujo.
     */
    flowId(prefix, value) {
      return prefix + '_' + String(value || '').replace(/[^A-Za-z0-9_]/g, '_');
    }

    /**
     * Construye una clave serializada del ambiente actual para detectar cambios de contexto.
     */
    contextKey() {
      if (typeof global.S === 'undefined') return '';
      try {
        return JSON.stringify({
          version: global.S.version || '',
          platform: global.S.platform || '',
          db: this.options.getDb ? this.options.getDb() : {},
          api: this.options.getApi ? this.options.getApi() : {}
        });
      } catch (error) {
        return '';
      }
    }

    /**
     * Dado el bloque API del wizard, resuelve la URL de Authenticate para V4.
     */
    resolveV4AuthUrl(api) {
      var publicBaseUrl = String((api && api.BASE_URL) || '').trim().replace(/\/+$/g, '');
      var apiBaseUrl = String((api && api.API_BASE_URL) || '').trim().replace(/\/+$/g, '');

      if (publicBaseUrl) return publicBaseUrl + '/Authenticate/v1/Execute';
      if (apiBaseUrl) {
        var normalized = apiBaseUrl.replace(/\/api\/publicapi$/i, '');
        return normalized + '/api/publicapi/Authenticate/v1/Execute';
      }
      return 'sin URL de autenticacion';
    }

    /**
     * Intenta inferir la URL Swagger a partir de la configuración de API del ambiente.
     */
    guessSwaggerUrl(api) {
      var publicBaseUrl = String((api && api.BASE_URL) || '').trim().replace(/\/+$/g, '');
      if (!publicBaseUrl) return '';
      if (/\/api\/publicapi$/i.test(publicBaseUrl)) {
        return publicBaseUrl.replace(/\/api\/publicapi$/i, '/api/swagger-ui/index.html#/');
      }
      return publicBaseUrl.replace(/\/+$/g, '') + '/swagger-ui/index.html#/';
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionUtils = CollectionUtils;
})(window);
