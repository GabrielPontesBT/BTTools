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
    state.studioStage = global.collectionPathSupported() ? 'setup' : 'define';
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

  global.collectionUpdateServiceSource = function collectionUpdateServiceSourceAdapter(value) {
    // El origen del catalogo vive en el manager de ambiente para mantener la UI y la carga alineadas.
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
})(window);
