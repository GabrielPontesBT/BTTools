(function bootstrapCollectionFeedbackManager(global) {
  'use strict';

  // Metadata por tipo de aviso.
  var AVISO_META = {
    ok:   { titulo: 'Listo',        clase: 'ok',   autoDismissMs: 4200 },
    err:  { titulo: 'Error',        clase: 'err',  autoDismissMs: null },
    warn: { titulo: 'Advertencia',  clase: 'warn', autoDismissMs: null },
    info: { titulo: 'Informacion',  clase: 'info', autoDismissMs: 4200 }
  };

  var ID_CONTENEDOR = 'collection-status';

  /**
   * Administra el feedback visual del builder.
   *
   * Antes esto mostraba tarjetas flotantes ("toast") apiladas en la esquina
   * superior derecha. Se cambio por el bloque inline `.cres`, que es el
   * patron que usa el resto de las herramientas del proyecto (ver
   * .cres/.cres.ok/.cres.err en styles.css, y el uso en wizard-doc.js para
   * el resultado de probar una conexion). Dos razones:
   *
   * 1. Consistencia: era la unica herramienta con avisos flotantes.
   * 2. Los toast truncaban el mensaje y eso impedia diagnosticar. La pila
   *    media 300px de ancho y .collection-toast-text tenia
   *    -webkit-line-clamp:3, asi que un error de varias lineas se cortaba
   *    con puntos suspensivos. Un error real de lectura de Swagger lista
   *    cada ruta probada y su motivo: sin poder leerlo completo, el mensaje
   *    no sirve para nada.
   *
   * El bloque inline no trunca: respeta los saltos de linea (white-space:
   * pre-wrap en .cres) y crece con el contenido.
   *
   * La API (showStatus/dismissToast/clearStatus/resetResult) no cambio:
   * hay 65 llamadas a showStatus repartidas por el builder.
   */
  class CollectionFeedbackManager {
    constructor() {
      this.timer = null;
    }

    contenedor() {
      return document.getElementById(ID_CONTENEDOR);
    }

    /**
     * Muestra un aviso. `kind`: 'ok' | 'err' | 'warn' | 'info'.
     * `title` es opcional; si no viene, usa el titulo generico del tipo.
     *
     * A diferencia de la version con toast, esto REEMPLAZA el aviso
     * anterior en vez de apilar. Es lo que hace el resto de las
     * herramientas, y evita el problema de la pila: con avisos que no se
     * autodescartan (err y warn), tres errores seguidos tapaban la pantalla.
     */
    showStatus(kind, text, title) {
      var el = this.contenedor();
      if (!el) return;

      var meta = AVISO_META[kind] || AVISO_META.info;
      var texto = String(text == null ? '' : text);

      if (this.timer) { clearTimeout(this.timer); this.timer = null; }

      el.className = 'cres show ' + meta.clase;
      el.setAttribute('role', meta.clase === 'err' ? 'alert' : 'status');
      el.innerHTML =
        '<span class="cres-body">' +
          '<strong class="cres-title">' + collectionEscapeHtml(title || meta.titulo) + '</strong>' +
          '<span class="cres-text">' + collectionEscapeHtml(texto) + '</span>' +
        '</span>' +
        '<button type="button" class="cres-close" aria-label="Cerrar aviso">&times;</button>';

      var self = this;
      var cerrar = el.querySelector('.cres-close');
      if (cerrar) cerrar.onclick = function () { self.clearStatus(); };

      // Los avisos de error y advertencia no se autodescartan: son mas
      // importantes de leer que de sacar del camino.
      if (meta.autoDismissMs) {
        this.timer = setTimeout(function () { self.clearStatus(); }, meta.autoDismissMs);
      }

      // Si el aviso quedo fuera de la vista (el builder puede scrollear
      // bastante), se lo trae. Sin esto, un error al final de una operacion
      // larga se muestra donde el usuario no lo ve, que era otra forma del
      // mismo problema: el mensaje existe pero no se lee.
      if (typeof el.scrollIntoView === 'function') {
        var rect = el.getBoundingClientRect();
        var visible = rect.top >= 0 && rect.bottom <= (window.innerHeight || 0);
        if (!visible) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }

    /**
     * Se mantiene por compatibilidad: la version con toast cerraba un aviso
     * puntual por id, y `collectionDismissToast` sigue expuesto en
     * collection-manager-registry.js. Con un solo bloque inline, cerrar
     * cualquier aviso es cerrar el aviso.
     */
    dismissToast(id) {
      void id;
      this.clearStatus();
    }

    /**
     * Oculta el aviso visible. Se usa cuando el contexto cambia de golpe
     * (ej. el usuario cambia de Fuente/Formato) y el feedback viejo ya no
     * aplica.
     */
    clearStatus() {
      if (this.timer) { clearTimeout(this.timer); this.timer = null; }
      var el = this.contenedor();
      if (!el) return;
      el.className = 'cres';
      el.removeAttribute('role');
      el.innerHTML = '';
    }

    /**
     * Limpia el panel donde se muestra el resultado de exportar la
     * collection. Se usa antes de recalcular una generación para no dejar
     * información vieja.
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
