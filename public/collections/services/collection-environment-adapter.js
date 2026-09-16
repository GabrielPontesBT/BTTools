(function bootstrapCollectionEnvironmentAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: funciones globales del ambiente/origen de
   * servicios (Swagger, formato, autenticacion) que el HTML del panel invoca
   * por nombre. Ver la nota de arquitectura en shared/collection-utils-adapter.js.
   */

  /**
   * Limpia todo lo cargado de un origen anterior (servicios, Swagger
   * resuelto, escenarios) antes de que el usuario elija uno nuevo. Los
   * selects col-sel-svc/col-sel-mtd son de una UI manual que ya no se
   * renderiza, pero el guard `if (svcSel)`/`if (mtdSel)` los deja como no-op
   * seguro en vez de un error si algun dia vuelven a existir.
   */
  global.collectionResetLoadedData = function collectionResetLoadedDataAdapter() {
    var state = global.collectionState;
    state.services = [];
    state.serviceOperations = {};
    state.swaggerResolvedUrl = '';
    state.swaggerBaseUrl = '';
    state.swaggerAuthUrl = '';
    state.studioStage = 'define';
    state.scenarios = [];
    state.activeScenarioId = null;
    state.nextScenarioId = 1;
    global.collectionEnsureScenario();

    var services = document.getElementById('collection-services');
    if (services) services.style.display = 'none';

    var svcSel = document.getElementById('col-sel-svc');
    if (svcSel) svcSel.innerHTML = '<option value="">-- Seleccionar --</option>';

    var mtdSel = document.getElementById('col-sel-mtd');
    if (mtdSel) mtdSel.innerHTML = '<option value="">-- Seleccionar --</option>';

    global.collectionRenderScenarios();
    global.collectionRenderItems();
    global.collectionRenderVariableEditor();
    global.collectionResetResult();
    global.collectionResetExecution();
  };

  global.collectionRefreshContext = function collectionRefreshContextAdapter() {
    // La sincronizacion del ambiente vive en un manager dedicado para separar UI de contexto.
    global.collectionGetEnvironmentManager().refreshContext();
  };

  global.collectionAddSwaggerUrl = function collectionAddSwaggerUrlAdapter() {
    // Toma el valor tipeado en el input y lo suma a la lista de swaggers del
    // ambiente (un microservicio puede tener el suyo propio); ver
    // CollectionEnvironmentManager.addSwaggerUrl.
    var input = document.getElementById('collection-swagger-url');
    if (!input) return;
    global.collectionGetEnvironmentManager().addSwaggerUrl(input.value);
    input.value = '';
    input.focus();
  };

  global.collectionRemoveSwaggerUrl = function collectionRemoveSwaggerUrlAdapter(index) {
    global.collectionGetEnvironmentManager().removeSwaggerUrl(index);
  };

  global.collectionUpdateAutoDetectAuth = function collectionUpdateAutoDetectAuthAdapter(checked) {
    // Checkbox "Detectar autenticacion automaticamente" -- ver
    // CollectionEnvironmentManager.updateAutoDetectAuth.
    global.collectionGetEnvironmentManager().updateAutoDetectAuth(checked);
  };

  global.collectionUpdateInternaBaseUrl = function collectionUpdateInternaBaseUrlAdapter(value) {
    // Guardamos la URL del gateway de "API interna" desde el manager de ambiente.
    global.collectionGetEnvironmentManager().updateInternaBaseUrl(value);
  };

  // Lo llama wizard-doc.js (applyCollectionSource) cuando cambia la version
  // del ambiente. El usuario ya no elige el origen: V4 siempre lee el Swagger,
  // y V3 (SOAP, sin documento OpenAPI) siempre lee la base.
  global.collectionUpdateServiceSource = function collectionUpdateServiceSourceAdapter(value) {
    global.collectionGetEnvironmentManager().updateServiceSource(value);
  };

  global.collectionUpdateFormat = function collectionUpdateFormatAdapter(value) {
    // Formato (XML/JSON) elegible para V3 y para V4 en modo "API interna";
    // vive en el manager de ambiente junto al resto de la sincronizacion de
    // UI de "Cargar servicios".
    global.collectionGetEnvironmentManager().updateFormat(value);
  };

  global.collectionTestDb = async function collectionTestDbAdapter() {
    // La prueba de base ahora entra por la capa de ambiente y servicios.
    return global.collectionGetEnvironmentManager().testDb();
  };

  global.collectionTestAuth = async function collectionTestAuthAdapter() {
    // La prueba de autenticacion queda encapsulada fuera del bootstrap principal.
    return global.collectionGetEnvironmentManager().testAuth();
  };

  global.collectionLoadServices = async function collectionLoadServicesEnvironmentAdapter() {
    // La carga de Swagger y el authenticate posterior quedan centralizados en el manager de ambiente.
    return global.collectionGetEnvironmentManager().loadServices();
  };

  /**
   * Desplegable "Ambientes Swagger guardados": carga la lista de URLs y el
   * checkbox del ambiente elegido. Ver CollectionEnvironmentManager.loadSwaggerHistEntry.
   */
  global.collectionLoadSwaggerHistEntry = function collectionLoadSwaggerHistEntryAdapter() {
    global.collectionGetEnvironmentManager().loadSwaggerHistEntry();
  };

  global.collectionDeleteSwaggerHistEntry = async function collectionDeleteSwaggerHistEntryAdapter() {
    return global.collectionGetEnvironmentManager().deleteSwaggerHistEntry();
  };

  /**
   * Boton "Guardar nombre" junto al campo de nombre del ambiente Swagger.
   * Mismo patron de feedback inline que saveConnName() en wizard-doc.js.
   */
  global.collectionSaveSwaggerHistName = async function collectionSaveSwaggerHistNameAdapter() {
    var fb = document.getElementById('collection-swagger-hist-name-res');
    if (fb) {
      fb.style.display = '';
      fb.style.color = 'var(--muted)';
      fb.textContent = 'Guardando...';
    }
    var data = await global.collectionGetEnvironmentManager().saveSwaggerHistEntry();
    if (fb) {
      fb.style.display = '';
      fb.style.color = data.ok ? 'var(--success)' : 'var(--danger)';
      fb.textContent = data.ok ? 'Nombre guardado.' : (data.message || 'No se pudo guardar el ambiente Swagger.');
      if (data.ok) setTimeout(function() { fb.style.display = 'none'; }, 2500);
    }
  };
})(window);
