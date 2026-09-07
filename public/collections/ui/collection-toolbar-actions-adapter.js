(function bootstrapCollectionToolbarActionsAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: las acciones de la barra del builder que no
   * son "ejecutar flujo" (esa vive en execution/collection-execution-adapter.js)
   * — completar datos, generar la collection y mostrar su resultado.
   * Invocadas por nombre desde el HTML del panel. Ver la nota de
   * arquitectura en shared/collection-utils-adapter.js.
   */

  global.collectionFillData = async function collectionFillDataAdapter() {
    return global.collectionGetRequestDataManager().fillData();
  };

  global.collectionRenderResult = function collectionRenderResultAdapter(data) {
    // El resumen final de generacion queda en un manager visual chico y reutilizable.
    global.collectionGetResultManager().renderResult(data);
  };

  /**
   * Unica funcion de este archivo con logica de negocio real (no pura
   * delegacion): valida el estado del builder, llama al backend a traves del
   * cliente HTTP comun y renderiza el resultado.
   */
  global.collectionGenerate = async function collectionGenerateAdapter() {
    // La generacion final sigue validando estado en el bootstrap, pero delega la llamada HTTP al cliente comun.
    if (!global.collectionPathSupported()) {
      global.collectionShowStatus('err', 'Por ahora solo esta disponible JSON + Postman.');
      return;
    }

    global.collectionSyncInspectorInputs();
    global.collectionRefreshContext();
    if (typeof S === 'undefined' || !S.version) {
      global.collectionShowStatus('err', 'Completa primero version y ambiente en el wizard principal.');
      return;
    }

    var scenarios = global.collectionState.scenarios.filter(function keepNonEmptyScenario(scenario) {
      return scenario.items && scenario.items.length;
    });
    if (!scenarios.length) {
      global.collectionShowStatus('err', 'Agrega al menos un metodo en algun caso de uso.');
      return;
    }

    var button = document.getElementById('btn-collection-generate');
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="spin"></span>&nbsp;Generando...';
    }

    global.collectionShowStatus('ok', 'Generando collection Postman (' + String(global.collectionState.format || 'json').toUpperCase() + ')...');
    global.collectionResetResult();

    try {
      var data = await global.collectionApiClient.generateCollection({
        format: global.collectionState.format,
        target: global.collectionState.target,
        version: S.version,
        platform: S.platform,
        apiMode: (typeof S !== 'undefined' ? S.apiMode : undefined),
        db: typeof getDb === 'function' ? getDb() : {},
        api: typeof getApi === 'function' ? getApi() : {},
        swaggerBaseUrl: global.collectionState.swaggerBaseUrl,
        swaggerAuthUrl: global.collectionState.swaggerAuthUrl,
        // Sin esto, buildJsonPostmanCollection no puede distinguir Session.userLogin
        // de Authenticate/Execute al armar el paso "0. Authenticate" exportado
        // (ver findInternaAuthOperation en index.js).
        swaggerAuthKind: global.collectionState.swaggerAuthKind,
        collectionName: global.collectionState.collectionName,
        scenarios: scenarios.map(function serializeScenario(scenario) {
          return {
            id: scenario.id,
            name: scenario.name,
            items: scenario.items,
            variableOverrides: scenario.variableOverrides,
            inputMappings: scenario.inputMappings,
            inputAliases: scenario.inputAliases,
            outputAliases: scenario.outputAliases,
            repeatableOverrides: scenario.repeatableOverrides,
            // Por sourceBaseUrl, que salida alimenta el header Token de ese
            // grupo (ver CollectionTokenSourceManager) -- para cuando distintos
            // swaggers/microservicios se autentican con tokens distintos.
            tokenSources: scenario.tokenSources || {}
          };
        })
      });

      if (!data.ok) throw new Error(data.message);

      global.collectionShowStatus('ok', 'Collection generada correctamente.');
      global.collectionRenderResult(data);
    } catch (error) {
      global.collectionShowStatus('err', error.message || 'No se pudo generar la collection.');
    }

    if (button) {
      button.disabled = false;
      button.innerHTML = 'Generar collection';
    }
  };
})(window);
