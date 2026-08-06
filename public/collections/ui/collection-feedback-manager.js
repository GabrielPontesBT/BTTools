(function bootstrapCollectionFeedbackManager(global) {
  'use strict';

  // Metadata visual por tipo de aviso. `autoDismissMs: null` = permanece
  // visible hasta que el usuario lo cierra a mano (errores y advertencias:
  // son mas importantes de leer que para dejarlos desaparecer solos).
  var TOAST_META = {
    ok:   { title: 'Listo',         icon: '&#10003;', autoDismissMs: 4200 },
    err:  { title: 'Error',         icon: '&#10005;', autoDismissMs: null },
    warn: { title: 'Advertencia',   icon: '&#9888;',  autoDismissMs: null },
    info: { title: 'Informacion',  icon: '&#8505;',  autoDismissMs: 4200 }
  };

  /**
   * Administra los bloques de feedback visual del builder.
   * Los avisos se muestran como notificaciones flotantes ("toast") apiladas
   * en la esquina superior derecha de la pantalla — nunca como un banner de
   * ancho completo que tape o desplace la barra de acciones. Cada llamada a
   * showStatus() agrega una tarjeta nueva a la pila; no reemplaza avisos
   * anteriores que el usuario todavia no cerro o que no llegaron a
   * autodescartarse.
   */
  class CollectionFeedbackManager {
    constructor() {
      this.toastSeq = 0;
      this.toastTimers = {};
    }

    /**
     * Agrega una notificacion a la pila.
     * `kind`: 'ok' | 'err' | 'warn' | 'info' (define color, icono y si se
     * autodescarta). `title` es opcional: si no se pasa, usa el titulo
     * generico del tipo (ver TOAST_META). `text` es la descripcion (una
     * linea) del aviso.
     */
    showStatus(kind, text, title) {
      var stack = document.getElementById('collection-toast-stack');
      if (!stack) return;

      stack.style.top = this.computeStackTop() + 'px';

      var meta = TOAST_META[kind] || TOAST_META.info;
      var safeKind = TOAST_META[kind] ? kind : 'info';
      var id = 'collection-toast-' + (++this.toastSeq);

      var toast = document.createElement('div');
      toast.id = id;
      toast.className = 'collection-toast collection-toast-' + safeKind;
      toast.setAttribute('role', safeKind === 'err' ? 'alert' : 'status');
      toast.innerHTML =
        '<span class="collection-toast-icon" aria-hidden="true">' + meta.icon + '</span>' +
        '<span class="collection-toast-body">' +
          '<span class="collection-toast-title">' + collectionEscapeHtml(title || meta.title) + '</span>' +
          '<span class="collection-toast-text">' + collectionEscapeHtml(text || '') + '</span>' +
        '</span>' +
        '<button type="button" class="collection-status-close" onclick="collectionDismissToast(' + "'" + id + "'" + ')" aria-label="Cerrar aviso">&times;</button>';

      // La mas nueva arriba: se inserta como primer hijo, no al final.
      stack.insertBefore(toast, stack.firstChild);

      if (meta.autoDismissMs) {
        this.toastTimers[id] = setTimeout(this.dismissToast.bind(this, id), meta.autoDismissMs);
      }
    }

    /**
     * Calcula, en cada aviso nuevo, la distancia minima al borde superior de
     * la pantalla para que la pila nunca tape la barra de acciones (Nombre/
     * Cadena/Probar/Generar collection). Esa barra (.collection-builder-top)
     * solo existe una vez que el builder esta en la etapa "builder" y puede
     * ocupar mas de una fila (envuelve en pantallas angostas), asi que un
     * numero fijo en CSS no alcanza — se mide su borde inferior real y se
     * flota justo debajo. Si todavia no existe (etapa "setup"/"define") usa
     * un margen chico fijo, que es seguro porque ahi no hay barra de acciones.
     */
    computeStackTop() {
      var DEFAULT_TOP = 16;
      var header = document.querySelector('.collection-builder-top');
      if (!header) return DEFAULT_TOP;

      var rect = header.getBoundingClientRect();
      if (!rect.height) return DEFAULT_TOP;

      return Math.max(DEFAULT_TOP, Math.round(rect.bottom) + 12);
    }

    /**
     * Cierra una notificacion puntual (por su id) con una animacion breve de
     * salida antes de sacarla del DOM. Cancela su timer de autodescarte si
     * todavia estaba pendiente (ej. el usuario la cerro a mano antes de tiempo).
     */
    dismissToast(id) {
      var toast = document.getElementById(id);
      if (!toast) return;

      if (this.toastTimers[id]) {
        clearTimeout(this.toastTimers[id]);
        delete this.toastTimers[id];
      }

      toast.classList.add('collection-toast-leaving');
      setTimeout(function removeToastNode() {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 180);
    }

    /**
     * Descarta de inmediato todas las notificaciones visibles (sin esperar
     * la animacion de salida). Se usa cuando el contexto cambia de golpe
     * (ej. el usuario cambia de Fuente/Formato) y el feedback viejo ya no aplica.
     */
    clearStatus() {
      var stack = document.getElementById('collection-toast-stack');
      if (!stack) return;

      Object.keys(this.toastTimers).forEach(function cancelTimer(id) {
        clearTimeout(this.toastTimers[id]);
      }, this);
      this.toastTimers = {};
      stack.innerHTML = '';
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
