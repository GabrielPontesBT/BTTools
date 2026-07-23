(function bootstrapCollectionImportManager(global) {
  'use strict';

  /**
   * Variables de configuracion del wizard/ambiente (Btinreq, URLs base) que
   * nunca representan un encadenamiento real entre pasos. Se excluyen al
   * inferir mappings desde una collection importada para no intentar
   * "mapear" el canal o el token como si fueran la salida de un paso previo.
   */
  var INFRASTRUCTURE_VARIABLE_NAMES = [
    'channel', 'username', 'password', 'device', 'requirement', 'token',
    'base_url', 'public_api_url', 'api_base_url', 'auth_url', 'json_auth_url'
  ];

  /**
   * Reconstruye casos de uso (escenarios) en el canvas a partir de una
   * collection Postman generada previamente por esta misma app, en
   * cualquiera de los dos formatos soportados (JSON o XML/SOAP — ver
   * buildJsonPostmanCollection / buildXmlPostmanCollection en
   * scripts/generar-collections/index.js).
   *
   * Decision de diseño: en vez de reinterpretar la estructura de cada
   * request (tipos de dato, SDTs, descripciones — informacion que el
   * archivo exportado no conserva por completo), la importacion solo
   * identifica QUE operaciones se usaron y en que ORDEN, y reutiliza el
   * pipeline ya existente de agregar servicios (insertOperation /
   * hydrateOperationIfNeeded) para traer el detalle real y actualizado
   * desde el catalogo. Esto evita duplicar la logica de armado de schema
   * y evita reconstruir un paso con datos viejos si el ambiente cambio
   * desde que se genero el archivo.
   *
   * Por esto mismo requiere que el catalogo ya este cargado ("Cargar
   * servicios") contra el mismo ambiente antes de importar: sin eso no hay
   * con que emparejar las operaciones encontradas en el archivo.
   *
   * Los mappings ("Origen del valor"), alias y valores manuales se
   * restauran de dos formas posibles, en orden de preferencia:
   *  1. Si el archivo tiene el bloque `_bttoolsMeta` (lo agrega esta misma
   *     app al generar, ver buildBttoolsImportMetadata en
   *     scripts/generar-collections/index.js) se usa TAL CUAL — es una
   *     copia exacta de scenario.inputMappings/inputAliases/outputAliases/
   *     variableOverrides + inputOverrides por paso, sin adivinar nada.
   *  2. Si no esta presente (archivo generado antes de esta funcionalidad,
   *     o editado a mano), se cae a inferir los mappings por patron de
   *     nombre de variable (ver inferMappingsForGroup) — mejor esfuerzo,
   *     no reconstruye filtros de coleccion ni campos repetibles.
   */
  class CollectionImportManager {
    /**
     * Recibe callbacks del builder principal (mismo patron que el resto de
     * los managers de este modulo), para no depender de funciones globales.
     */
    constructor(options) {
      this.options = options || {};
    }

    /**
     * Abre el selector de archivos nativo (input file oculto, ver panel.html).
     */
    triggerFileDialog() {
      var input = document.getElementById('collection-import-file');
      if (input) input.click();
    }

    /**
     * Punto de entrada llamado por el input file al elegir un archivo. Lee
     * el texto con la File API del navegador (sin subirlo a ningun lado:
     * todo el parseo pasa en el cliente) y delega en importFromText.
     * Limpia el input siempre al final para poder re-elegir el mismo
     * archivo dos veces seguidas sin que el navegador ignore el cambio.
     */
    async handleFileSelected(file) {
      var input = document.getElementById('collection-import-file');
      if (!file) return;

      try {
        var text = await file.text();
        await this.importFromText(text);
      } catch (error) {
        this.options.showStatus('err', 'No se pudo leer el archivo: ' + (error && error.message ? error.message : error));
      } finally {
        if (input) input.value = '';
      }
    }

    /**
     * Orquesta la importacion completa: parsear y validar el archivo,
     * crear un escenario nuevo por cada carpeta (caso de uso) encontrada,
     * insertar sus pasos en orden reutilizando insertOperation, e inferir
     * los mappings de encadenamiento que se puedan reconocer con confianza.
     */
    async importFromText(rawText) {
      var state = this.options.getState();

      if (!state.services || !state.services.length) {
        this.options.showStatus('err', 'Primero carga los servicios del ambiente (Cargar servicios) antes de importar una collection.');
        return;
      }

      var parsed = this.parseCollectionDocument(rawText);
      if (!parsed.ok) {
        this.options.showStatus('err', parsed.message);
        return;
      }

      var summary = {
        scenariosCreated: 0,
        stepsInserted: 0,
        stepsSkippedExisting: 0,
        stepsSkippedUnmatched: 0,
        mappingsCreated: 0
      };

      // Secuencial a proposito: los pasos de origen Base de datos disparan
      // una consulta real al ambiente la primera vez que se usan
      // (hydrateOperationIfNeeded). Importar en paralelo abriria varias
      // conexiones simultaneas contra la base para un archivo grande; uno
      // por vez mantiene el mismo costo (y el mismo cuidado con ambientes
      // de produccion) que agregar cada servicio a mano desde el catalogo.
      for (var g = 0; g < parsed.scenarioGroups.length; g++) {
        var storedConfig = this.findStoredConfigForGroup(parsed.scenarioGroups[g], parsed.storedScenarioConfigs);
        await this.importScenarioGroup(parsed.scenarioGroups[g], storedConfig, summary);
      }

      this.options.renderScenarios();
      this.options.renderItems();
      this.options.renderVariableEditor();
      this.options.loadPreview();

      this.options.showStatus(summary.stepsInserted ? 'ok' : 'err', this.buildSummaryMessage(summary));
    }

    /**
     * Crea un escenario nuevo para un grupo (carpeta) del archivo importado
     * e inserta sus pasos, en el mismo orden en que aparecen en el archivo.
     */
    async importScenarioGroup(group, storedConfig, summary) {
      var state = this.options.getState();
      var scenario = this.options.createScenario(group.name);
      state.scenarios.push(scenario);
      state.activeScenarioId = scenario.id;
      summary.scenariosCreated++;

      var insertedSteps = [];

      for (var i = 0; i < group.steps.length; i++) {
        var descriptor = group.steps[i];
        var match = this.findCatalogOperation(descriptor.service, descriptor.method);

        if (!match) {
          summary.stepsSkippedUnmatched++;
          continue;
        }

        // insertOperation ya ignora duplicados en silencio (sin devolver
        // ninguna señal); se verifica antes para poder contarlo como
        // "omitido" en vez de perderlo del resumen final.
        var alreadyInScenario = scenario.items.some(function matchExisting(item) {
          return item.service === match.service && item.method === match.operation.methodName;
        });
        if (alreadyInScenario) {
          summary.stepsSkippedExisting++;
          continue;
        }

        await this.options.insertOperation(match.service, match.operation.operationKey, scenario.items.length);
        summary.stepsInserted++;

        var insertedItem = scenario.items[scenario.items.length - 1];
        if (insertedItem) insertedSteps.push({ item: insertedItem, descriptor: descriptor });
      }

      if (storedConfig) {
        this.applyStoredScenarioConfig(scenario, storedConfig, insertedSteps, summary);
      } else {
        this.inferMappingsForGroup(insertedSteps, summary);
      }
    }

    /**
     * Restaura de forma EXACTA la configuracion de un escenario guardada en
     * `_bttoolsMeta` al momento de generar la collection: no hay nada que
     * inferir, los objetos ya estan indexados con la misma clave
     * (operationKey + pathLabel) que usa scenario.inputMappings/inputAliases
     * en tiempo real, asi que alcanza con mezclarlos.
     *
     * A diferencia de inferMappingsForGroup, esto SI reconstruye filtros de
     * coleccion (filterField/filterValue) y valores manuales por paso,
     * porque son parte integra del objeto guardado.
     */
    applyStoredScenarioConfig(scenario, storedConfig, insertedSteps, summary) {
      var mappingCount = Object.keys(storedConfig.inputMappings || {}).length;

      scenario.inputMappings = Object.assign({}, scenario.inputMappings, storedConfig.inputMappings || {});
      scenario.inputAliases = Object.assign({}, scenario.inputAliases, storedConfig.inputAliases || {});
      scenario.outputAliases = Object.assign({}, scenario.outputAliases, storedConfig.outputAliases || {});
      scenario.variableOverrides = Object.assign({}, scenario.variableOverrides, storedConfig.variableOverrides || {});

      (storedConfig.stepInputOverrides || []).forEach(function restoreStepOverrides(overrides, index) {
        var inserted = insertedSteps[index];
        if (inserted && inserted.item && overrides && Object.keys(overrides).length) {
          inserted.item.inputOverrides = Object.assign({}, inserted.item.inputOverrides, overrides);
        }
      });

      summary.mappingsCreated += mappingCount;
    }

    /**
     * Parsea el texto crudo del archivo y valida que tenga forma de
     * collection Postman con al menos un paso importable. Nunca lanza: el
     * resultado siempre indica ok/false + un mensaje listo para mostrar.
     */
    parseCollectionDocument(rawText) {
      var json;
      try {
        json = JSON.parse(rawText);
      } catch (error) {
        return { ok: false, message: 'El archivo no es un JSON valido.' };
      }

      if (!json || typeof json !== 'object' || !json.info || !Array.isArray(json.item)) {
        return { ok: false, message: 'El archivo no tiene la forma de una collection Postman (falta info/item).' };
      }

      var scenarioGroups = this.extractScenarioGroups(json);
      if (!scenarioGroups.length) {
        return { ok: false, message: 'No se reconocio ningun paso importable en el archivo.' };
      }

      // Bloque propio embebido al generar (ver buildBttoolsImportMetadata en
      // el servidor). Puede faltar (archivo viejo o editado a mano): en ese
      // caso storedScenarioConfigs queda vacio y se usa el modo de
      // inferencia por patron de nombre (ver inferMappingsForGroup).
      var storedScenarioConfigs = (json._bttoolsMeta && Array.isArray(json._bttoolsMeta.scenarios))
        ? json._bttoolsMeta.scenarios
        : [];

      return { ok: true, scenarioGroups: scenarioGroups, storedScenarioConfigs: storedScenarioConfigs };
    }

    /**
     * Empareja un grupo (carpeta) recien parseado con su configuracion
     * guardada en `_bttoolsMeta`, por NOMBRE en vez de por indice: una
     * carpeta sin ningun paso reconocible se descarta en extractScenarioGroups,
     * lo que podria desalinear los indices si se matcheara posicionalmente.
     */
    findStoredConfigForGroup(group, storedScenarioConfigs) {
      if (!storedScenarioConfigs || !storedScenarioConfigs.length) return null;
      return storedScenarioConfigs.filter(function matchName(config) {
        return config && config.name === group.name;
      })[0] || null;
    }

    /**
     * Traduce las carpetas de la collection (una por caso de uso) en grupos
     * {name, steps[]}. Si el archivo no tiene carpetas (coleccion plana,
     * por ejemplo editada a mano), se trata toda la lista como un unico grupo.
     */
    extractScenarioGroups(json) {
      var hasFolders = json.item.some(function isFolder(entry) {
        return entry && Array.isArray(entry.item);
      });

      var rawGroups = hasFolders
        ? json.item.filter(function isFolder(entry) {
            return entry && Array.isArray(entry.item);
          }).map(function toGroup(folder) {
            return { name: folder.name || 'Importado', items: folder.item || [] };
          })
        : [{ name: (json.info && json.info.name) || 'Importado', items: json.item }];

      return rawGroups.map(function buildGroup(group) {
        return {
          name: group.name,
          steps: group.items.map(this.extractStepDescriptor, this).filter(Boolean)
        };
      }, this).filter(function keepNonEmpty(group) {
        return group.steps.length > 0;
      });
    }

    /**
     * Identifica servicio + metodo de un item de la collection sin asumir
     * un unico formato: primero intenta el nombre "N. Servicio.Metodo" (asi
     * nombra sus items el camino XML/SOAP — ver buildMethodRequestItem), y
     * si no matchea cae a leer la URL (asi se identifican los pasos del
     * camino JSON, tanto V4 REST como el experimental V3+?Metodo). Devuelve
     * null para "Authenticate" (no es una operacion de negocio) o para
     * cualquier item que no se pueda identificar.
     */
    extractStepDescriptor(item) {
      var name = String((item && item.name) || '').trim();
      if (!name || /authenticate/i.test(name)) return null;

      var nameMatch = /^\d+\.\s*([^.\s][^.]*)\.(.+)$/.exec(name);
      if (nameMatch) {
        return this.buildStepDescriptor(item, nameMatch[1].trim(), nameMatch[2].trim());
      }

      var rawUrl = String((item && item.request && item.request.url && item.request.url.raw) || '');

      var restMatch = /\/public\/([^/]+)\/v\d+\/([^/?]+)/i.exec(rawUrl);
      if (restMatch) {
        return this.buildStepDescriptor(item, restMatch[1], restMatch[2]);
      }

      var soapStyleMatch = /ardwsbt_([\s\S]+?)_v\d+\?(\w+)/i.exec(rawUrl);
      if (soapStyleMatch) {
        return this.buildStepDescriptor(item, soapStyleMatch[1], soapStyleMatch[2]);
      }

      return null;
    }

    /**
     * Empaqueta un paso reconocido junto con el texto crudo de su request,
     * necesario despues para inferir que variable se uso en cada campo.
     */
    buildStepDescriptor(item, service, method) {
      return {
        service: service,
        method: method,
        requestUrlRaw: String((item.request && item.request.url && item.request.url.raw) || ''),
        requestBodyRaw: String((item.request && item.request.body && item.request.body.raw) || '')
      };
    }

    /**
     * Busca, dentro del catalogo YA CARGADO, la operacion real que
     * corresponde a un servicio/metodo detectado en la collection.
     *
     * El nombre de servicio puede no coincidir exactamente: en V4 el
     * prefijo "Public" se recorta al armar la URL de la collection (ver
     * normalizeDatabaseServicePathName en el servidor). Ademas del match
     * exacto se intenta un match por sufijo (el nombre real del catalogo
     * TERMINA en el nombre detectado), sin distinguir mayusculas/minusculas.
     */
    findCatalogOperation(serviceGuess, methodGuess) {
      var state = this.options.getState();
      var services = state.services || [];
      var normalizedGuess = String(serviceGuess || '').trim().toLowerCase();

      var realServiceName = services.filter(function matchExact(name) {
        return String(name || '').trim().toLowerCase() === normalizedGuess;
      })[0] || services.filter(function matchSuffix(name) {
        return String(name || '').trim().toLowerCase().indexOf(normalizedGuess) >= 0;
      })[0];

      if (!realServiceName) return null;

      var operations = (state.serviceOperations && state.serviceOperations[realServiceName]) || [];
      var normalizedMethod = String(methodGuess || '').trim().toLowerCase();
      var operation = operations.filter(function matchMethod(candidate) {
        return String((candidate && candidate.methodName) || '').trim().toLowerCase() === normalizedMethod;
      })[0];

      return operation ? { service: realServiceName, operation: operation } : null;
    }

    /**
     * Recorre los pasos recien insertados de un escenario e intenta
     * reconstruir los mappings ("Origen del valor") que existian cuando se
     * genero la collection. Es deliberadamente conservador: si no se puede
     * identificar con certeza que variable corresponde a que campo, el
     * campo queda sin mapear — el usuario lo termina de configurar a mano,
     * igual que si hubiera agregado el servicio manualmente — en vez de
     * arriesgar un mapeo incorrecto.
     */
    inferMappingsForGroup(insertedSteps, summary) {
      var previewManager = this.options.getPreviewManager();

      for (var i = 0; i < insertedSteps.length; i++) {
        var current = insertedSteps[i];
        var priorSteps = insertedSteps.slice(0, i);

        (current.item.manualInputs || []).forEach(function inferForInput(manualInput) {
          var referencedVariable = this.extractReferencedVariable(manualInput, current.descriptor);
          if (!referencedVariable || referencedVariable === manualInput.key) return;
          if (INFRASTRUCTURE_VARIABLE_NAMES.indexOf(referencedVariable) >= 0) return;

          var sourceVarKey = this.findSourceForVariable(referencedVariable, priorSteps, previewManager);
          if (!sourceVarKey) return;

          var mappingKey = previewManager.buildInputMappingKey(current.item, manualInput);
          this.options.updateInputMapping(mappingKey, sourceVarKey);
          summary.mappingsCreated++;
        }, this);
      }
    }

    /**
     * Busca, entre los pasos anteriores YA insertados en este mismo
     * escenario, cual salida produce exactamente el nombre de variable
     * detectado (misma clave que arma buildOutputVarKey al exportar).
     */
    findSourceForVariable(variableName, priorSteps, previewManager) {
      for (var i = 0; i < priorSteps.length; i++) {
        var priorItem = priorSteps[i].item;
        var outputFields = priorItem.outputFields || [];
        for (var j = 0; j < outputFields.length; j++) {
          if (previewManager.buildOutputVarKey(priorItem, outputFields[j]) === variableName) {
            return variableName;
          }
        }
      }
      return '';
    }

    /**
     * Busca, en el texto crudo del request (URL o body) de un paso, la
     * variable Postman ({{variable}}) usada para un campo puntual. Se
     * busca por el ultimo segmento del pathLabel del campo (su nombre
     * "hoja"), ya que asi aparece literalmente como clave en el body JSON
     * o como tag en el XML, sin importar en que nivel de anidamiento este.
     *
     * Best-effort: si el patron no matchea (formato inesperado, campo
     * renombrado a mano, etc.) devuelve '' y el campo simplemente queda
     * sin mapear — nunca lanza ni bloquea el resto de la importacion.
     */
    extractReferencedVariable(manualInput, descriptor) {
      var leafName = String(manualInput.pathLabel || manualInput.key || '').split('.').pop();
      if (!leafName) return '';

      if (String(manualInput.location || '').toLowerCase() === 'query') {
        var queryKey = encodeURIComponent(String(manualInput.pathLabel || manualInput.key || ''));
        var queryPattern = new RegExp(this.escapeForRegExp(queryKey) + '=\\{\\{(\\w+)\\}\\}');
        var queryMatch = queryPattern.exec(descriptor.requestUrlRaw);
        return queryMatch ? queryMatch[1] : '';
      }

      var body = descriptor.requestBodyRaw;
      if (!body) return '';

      var escapedLeaf = this.escapeForRegExp(leafName);
      var jsonFieldPattern = new RegExp('"' + escapedLeaf + '"\\s*:\\s*"?\\{\\{(\\w+)\\}\\}"?');
      var xmlTagPattern = new RegExp('<[\\w:]*' + escapedLeaf + '>\\{\\{(\\w+)\\}\\}</[\\w:]*' + escapedLeaf + '>');

      var match = jsonFieldPattern.exec(body) || xmlTagPattern.exec(body);
      return match ? match[1] : '';
    }

    /**
     * Escapa caracteres especiales de regex antes de interpolar un valor
     * dinamico (nombre de campo) dentro de un `new RegExp(...)`.
     */
    escapeForRegExp(value) {
      return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Arma el mensaje final de estado con el detalle de lo importado.
     */
    buildSummaryMessage(summary) {
      if (!summary.stepsInserted) {
        return 'No se pudo importar ningun paso: revisa que el catalogo cargado corresponda al mismo ambiente usado para generar el archivo.';
      }

      var parts = [
        summary.scenariosCreated + ' escenario(s) creados',
        summary.stepsInserted + ' paso(s) importados'
      ];
      if (summary.stepsSkippedExisting) parts.push(summary.stepsSkippedExisting + ' ya existian');
      if (summary.stepsSkippedUnmatched) parts.push(summary.stepsSkippedUnmatched + ' sin match en el catalogo cargado');
      if (summary.mappingsCreated) parts.push(summary.mappingsCreated + ' mapping(s) reconstruidos');

      return parts.join(' · ') + '.';
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionImportManager = CollectionImportManager;
})(window);
