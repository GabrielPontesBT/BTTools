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
     * Dado el bloque API del wizard, resuelve la URL de login para V4.
     */
    resolveV4AuthUrl(api) {
      var publicBaseUrl = String((api && api.BASE_URL) || '').trim().replace(/\/+$/g, '');
      var apiBaseUrl = String((api && api.API_BASE_URL) || '').trim().replace(/\/+$/g, '');

      // La API publica dejo de usar Authenticate.Execute: ahora se autentica
      // con el user-login de session. La fuente de verdad es
      // scripts/common/bantotal-urls/index.js; aca se repite el literal
      // porque el front se sirve como scripts planos, sin require.
      // Igual esto es solo un fallback: cuando hay swagger, la URL de
      // autenticacion sale del documento (findPublicaAuthOperation /
      // findInternaAuthOperation), y "Probar autenticacion" degrada solo al
      // Authenticate viejo si el ambiente todavia no migro.
      if (publicBaseUrl) return publicBaseUrl + '/session/v1/user-login';
      if (apiBaseUrl) {
        var normalized = apiBaseUrl.replace(/\/api\/publicapi$/i, '');
        return normalized + '/api/publicapi/session/v1/user-login';
      }
      return 'sin URL de autenticacion';
    }

    /**
     * Intenta inferir la URL Swagger a partir de la configuración de API del ambiente.
     */
    guessSwaggerUrl(api) {
      var publicBaseUrl = String((api && api.BASE_URL) || '').trim().replace(/\/+$/g, '');
      if (!publicBaseUrl) return '';
      // swagger-ui vive ANIDADO bajo la URL publica completa (ej. .../api/publicapi
      // -> .../api/publicapi/swagger-ui/...), nunca como hermano reemplazando el
      // ultimo segmento — antes esto le sacaba el "/publicapi" por error.
      return publicBaseUrl + '/swagger-ui/index.html#/';
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionUtils = CollectionUtils;
})(window);
