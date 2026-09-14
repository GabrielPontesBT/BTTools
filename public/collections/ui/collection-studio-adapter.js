(function bootstrapCollectionStudioAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: expone en window las funciones del "studio"
   * (elegir formato/origen/destino, cambiar de etapa) que el HTML del panel
   * invoca por nombre desde atributos inline. Ver la nota de arquitectura en
   * shared/collection-utils-adapter.js sobre por que este archivo no exporta
   * una clase via BTCollectionModules como el resto de los modulos.
   */

  // Solo se usa dentro de upgradeStudioLayout, así que queda privado a este
  // archivo en vez de ser una var global suelta como en collections.js.
  var collectionStudioUpgraded = false;

  /**
   * Transforma el shell recien montado en el layout visual del "studio"
   * (marca, titulo compacto, bloques reetiquetados). Se ejecuta una sola vez
   * por carga de pagina — guardado por collectionStudioUpgraded.
   */
  global.collectionUpgradeStudioLayout = function collectionUpgradeStudioLayoutAdapter() {
    if (collectionStudioUpgraded) return;
    var shell = document.querySelector('#collection-mount .collection-shell') || document.querySelector('.collection-shell');
    if (!shell) return;
    collectionStudioUpgraded = true;
    shell.classList.add('collection-shell-studio');

    var existingTitle = shell.querySelector('.ptitle');
    var existingLead = shell.querySelector('.collection-lead');
    if (existingTitle) existingTitle.style.display = 'none';
    if (existingLead) existingLead.style.display = 'none';

    if (!shell.querySelector('.collection-studio-top')) {
      var top = document.createElement('div');
      top.className = 'collection-studio-top collection-studio-top-simple';
      top.innerHTML =
        '<div class="collection-studio-brand">' +
          '<div class="collection-studio-mark">C</div>' +
          '<div>' +
            '<div id="collection-studio-title" class="collection-studio-title">Casos de uso</div>' +
            '<div id="collection-studio-subtitle" class="collection-studio-subtitle"></div>' +
          '</div>' +
        '</div>';
      shell.insertBefore(top, shell.firstChild);
    }

    var services = document.getElementById('collection-services');
    if (services) {
      services.classList.remove('collection-block');
      services.classList.add('collection-studio-workspace');
    }

    global.collectionSyncToolbarChoices();
    global.collectionRenderStudioStage();
    global.collectionDockActionsInWizardFooter();
  };

  /**
   * Muda la barra de acciones del builder al footer del wizard.
   *
   * Collections era la unica herramienta sin la barra de abajo: tenia sus
   * botones arriba, en una segunda fila del encabezado, y el footer escondido
   * (`.wizard:has(#p4c.active) .wiz-ft{display:none}`). Al lado de las otras
   * cinco herramientas eso se leia como otra aplicacion, que es el mismo
   * problema que los tres pases de unificacion venian arreglando en el CSS,
   * pero de layout.
   *
   * Se MUEVE el nodo en vez de duplicarlo: los botones se invocan por nombre
   * desde atributos inline (`onclick="collectionExecuteFlow()"`) y se
   * habilitan/deshabilitan por id desde varios managers. Con dos copias habria
   * que sincronizar el estado de las dos, y el primer `disabled` que se olvide
   * deja un boton mintiendo. Movido, todo ese codigo sigue funcionando sin
   * tocarlo: el id es unico y el onclick no depende de donde este el nodo.
   *
   * Arriba quedan solo los campos de contexto (Nombre, Cadena) y el menu de
   * casos de uso, que es lo que se edita, no lo que se ejecuta.
   */
  global.collectionDockActionsInWizardFooter = function collectionDockActionsInWizardFooterAdapter() {
    // Solo con el panel del builder activo. El footer es compartido: foot() lo
    // reescribe con innerHTML en cada paso, asi que mudar la barra mientras el
    // wizard todavia esta en el paso de API la borra en cuanto ese paso pinta
    // su boton "Siguiente". Y el panel se monta justamente ahi, al cargar los
    // servicios, no al entrar al builder.
    var panel = document.getElementById('p4c');
    if (!panel || !panel.classList.contains('active')) return false;

    var acciones = document.querySelector('.collection-builder-actions');
    var slot = document.getElementById('ft-r');
    if (!acciones || !slot) return false;

    // El slot puede traer el "Siguiente" que dejo el paso anterior. No se puede
    // limpiar con innerHTML='' porque eso se lleva la barra cuando ya esta
    // puesta (y con ella los nodos que el resto del builder busca por id), asi
    // que se sacan los hermanos uno por uno. Deja el pase idempotente: foot()
    // corre varias veces por paso.
    Array.prototype.slice.call(slot.children).forEach(function limpiarSobrante(nodo) {
      if (nodo !== acciones) slot.removeChild(nodo);
    });

    if (acciones.parentElement !== slot) slot.appendChild(acciones);
    return true;
  };

  /**
   * Alterna la visibilidad de configuracion/servicios segun si el camino
   * elegido esta soportado, y refresca el contexto del ambiente si aplica.
   */
  global.collectionToggleConfig = function collectionToggleConfigAdapter() {
    var note = document.getElementById('collection-path-note');
    var services = document.getElementById('collection-services');
    if (!note || !services) return;
    note.style.display = 'none';
    if (!global.collectionPathSupported()) {
      services.style.display = 'none';
      return;
    }
    global.collectionRefreshContext();
    global.collectionRenderStudioStage();
  };

  /**
   * Aplica una eleccion hecha desde las mini-cards de Fuente/Formato/Destino.
   * Si cambia el origen de servicios, se limpia todo lo cargado antes de
   * pedir de nuevo el catalogo.
   */
  global.collectionPickChoice = function collectionPickChoiceAdapter(kind, value, el) {
    global.collectionState[kind] = value;
    var group = el && el.closest ? (el.closest('.collection-mini-cards') || el.closest('.collection-studio-actions')) : null;
    if (group) {
      Array.prototype.forEach.call(group.querySelectorAll('.ccard, .collection-mode-btn'), function(card) {
        card.classList.remove('sel');
      });
    }
    if (el) el.classList.add('sel');
    if (kind === 'serviceSource') {
      global.collectionResetLoadedData();
      if (typeof global.collectionUpdateServiceSource === 'function') global.collectionUpdateServiceSource(value);
    }
    global.collectionSyncToolbarChoices();
    global.collectionClearStatus();
    global.collectionResetResult();
    global.collectionResetExecution();
    global.collectionToggleConfig();
  };

  global.collectionPathSupported = function collectionPathSupportedAdapter() {
    return global.collectionGetStudioManager().pathSupported();
  };

  global.collectionStageLabel = function collectionStageLabelAdapter(stage) {
    return global.collectionGetStudioManager().stageLabel(stage);
  };

  global.collectionSetStudioStage = function collectionSetStudioStageAdapter(stage) {
    global.collectionGetStudioManager().setStage(stage);
  };

  global.collectionRenderStudioStage = function collectionRenderStudioStageAdapter() {
    global.collectionGetStudioManager().renderStage();
  };

  global.collectionSyncToolbarChoices = function collectionSyncToolbarChoicesAdapter() {
    global.collectionGetStudioManager().syncToolbarChoices();
  };

  global.collectionPickToolbarChoice = function collectionPickToolbarChoiceAdapter(kind, value, el) {
    global.collectionGetStudioManager().pickToolbarChoice(kind, value, el);
  };

})(window);
