(function bootstrapCollectionExecutionMockDataBuilder(global) {
  'use strict';

  /**
   * Fabrica un dataset de ejecucion completamente mockeado a partir del flujo
   * actual del builder. La idea es desacoplar la UI del origen real de datos
   * para poder conectar el backend de ejecucion mas adelante sin rediseñar
   * el panel completo.
   */
  class CollectionExecutionMockDataBuilder {
    /**
     * Recibe todas las dependencias externas por inyeccion.
     * Esto mantiene la clase testeable y evita acoplarla a globals.
     */
    constructor(options) {
      this.options = options || {};
      // Se lleva un contador local para generar ids de corridas mock consistentes.
      this.runCounter = 1541;
    }

    /**
     * Construye una corrida completa lista para ser renderizada en el
     * Execution Mode.
     */
    buildRun(config) {
      var input = config || {};
      var scenario = input.scenario || null;
      var state = input.state || {};
      var items = scenario && Array.isArray(scenario.items) ? scenario.items : [];
      var startedAt = new Date();
      var authStep = this.buildAuthenticateStep(startedAt, state);
      var flowSteps = this.buildFlowSteps(items, scenario, state, startedAt);
      var executionConnections = this.buildExecutionConnections(items, scenario, flowSteps);
      var allTimelineEvents = this.buildTimeline(authStep, flowSteps, startedAt);
      var globalVariables = this.buildGlobalVariables(authStep, flowSteps);
      var summary = this.buildSummary(authStep, flowSteps, globalVariables);
      var selectedStepId = this.pickSelectedStepId(flowSteps);

      return {
        id: ++this.runCounter,
        status: summary.errorCount ? 'error' : 'success',
        statusLabel: summary.errorCount ? 'Con errores' : 'Completada',
        startedAt: startedAt.toISOString(),
        startedAtLabel: this.formatTime(startedAt),
        durationMs: summary.durationMs,
        durationLabel: this.formatDuration(summary.durationMs),
        stats: summary,
        authStep: authStep,
        steps: flowSteps,
        connections: executionConnections,
        timeline: allTimelineEvents,
        globalVariables: globalVariables,
        selectedStepId: selectedStepId,
        selectedTab: 'summary',
        serviceCatalog: this.buildServiceCatalog(state),
        scenarioName: scenario ? scenario.name : 'Caso de uso',
        flowLegend: [
          { key: 'idle', label: 'No ejecutado' },
          { key: 'running', label: 'Ejecutando' },
          { key: 'success', label: 'Exitoso' },
          { key: 'error', label: 'Con error' },
          { key: 'skipped', label: 'Saltado' }
        ]
      };
    }

    /**
     * Construye el paso sintético de Authenticate.
     * En esta primera version no entra al canvas principal, pero si alimenta
     * la timeline y las variables globales.
     */
    buildAuthenticateStep(startedAt, state) {
      var authContext = state && state.authContext ? state.authContext : {};
      var durationMs = 210;
      var happenedAt = new Date(startedAt.getTime());
      var variables = [
        {
          name: 'token',
          value: 'B240259FC0A0A579CBBA123B',
          type: 'string',
          source: 'Authenticate'
        },
        {
          name: 'channel',
          value: authContext.channel || 'BTDIGITAL',
          type: 'string',
          source: 'Authenticate'
        },
        {
          name: 'username',
          value: authContext.username || 'INSTALADOR',
          type: 'string',
          source: 'Authenticate'
        }
      ];

      return {
        id: 'auth',
        index: 0,
        name: 'Authenticate',
        service: 'Security',
        method: 'POST',
        httpMethod: 'POST',
        status: 'success',
        statusLabel: '200 OK',
        responseStatus: 200,
        durationMs: durationMs,
        durationLabel: this.formatDuration(durationMs),
        happenedAt: happenedAt.toISOString(),
        happenedAtLabel: this.formatTime(happenedAt),
        requestUrl: String(state && state.swaggerAuthUrl || 'http://10.0.0.5:5101/api/Authenticate/v1/Execute'),
        createdVariables: variables,
        requestHeaders: {
          Canal: authContext.channel || 'BTDIGITAL',
          Usuario: authContext.username || 'INSTALADOR',
          Device: authContext.device || 'INSTALADOR',
          Requerimiento: authContext.requirement || '1'
        },
        requestBody: {
          UserId: authContext.username || 'INSTALADOR',
          UserPassword: '********'
        },
        responseBody: {
          SessionToken: variables[0].value
        },
        logs: [
          'Se resolvio el contexto de autenticacion desde el ambiente actual.',
          'Se genero un token mock para la vista de ejecucion.'
        ]
      };
    }

    /**
     * Construye todos los pasos del flujo visibles en el canvas.
     * Cada paso obtiene estado, tiempos, variables y payloads mock consistentes.
     */
    buildFlowSteps(items, scenario, state, startedAt) {
      var self = this;
      var connections = scenario ? this.options.ensureScenarioConnections(scenario) : [];

      return items.map(function mapStep(item, index) {
        var stepStatus = self.buildStepStatus(index, items.length);
        var durationMs = self.buildStepDuration(index, stepStatus.key);
        var happenedAt = new Date(startedAt.getTime() + 1000 + (index * 320));
        var createdVariables = self.buildCreatedVariables(item, index, scenario);
        var requestUrl = self.buildRequestUrl(item, index, scenario, state);
        var requestHeaders = self.buildRequestHeaders(state);
        var requestBody = self.buildRequestBody(item, index, scenario);
        var responseBody = self.buildResponseBody(item, index, createdVariables, stepStatus.key);
        var previousConnection = connections[index - 1] || null;
        var connectionLabel = '';

        if (index > 0 && previousConnection && items[index - 1]) {
          connectionLabel = self.options.buildConnectionLabel(
            items[index - 1],
            index - 1,
            item,
            index,
            scenario
          );
        }

        return {
          id: 'step_' + (index + 1),
          nodeId: item.nodeId || ('node_mock_' + (index + 1)),
          index: index + 1,
          name: item.method || ('Paso ' + (index + 1)),
          service: item.service || 'Servicio',
          httpMethod: String(item.httpMethod || 'GET').toUpperCase(),
          summary: item.summary || item.path || 'Sin descripcion disponible.',
          path: item.path || '',
          status: stepStatus.key,
          statusLabel: stepStatus.label,
          responseStatus: stepStatus.httpStatus,
          durationMs: durationMs,
          durationLabel: self.formatDuration(durationMs),
          happenedAt: happenedAt.toISOString(),
          happenedAtLabel: self.formatTime(happenedAt),
          requestUrl: requestUrl,
          requestHeaders: requestHeaders,
          requestBody: requestBody,
          responseBody: responseBody,
          createdVariables: createdVariables,
          warnings: stepStatus.key === 'error' ? ['Business error detectado durante la corrida mock.'] : [],
          logs: self.buildStepLogs(item, index, stepStatus.key, requestUrl),
          connectionLabelFromPrevious: connectionLabel
        };
      });
    }

    /**
     * Traduce las conexiones del escenario a una estructura lista para el
     * canvas de ejecucion.
     */
    buildExecutionConnections(items, scenario, steps) {
      var rawConnections = scenario ? this.options.ensureScenarioConnections(scenario) : [];
      var indexByNodeId = {};

      items.forEach(function indexNode(item, index) {
        indexByNodeId[item.nodeId] = index;
      });

      return rawConnections.map(function mapConnection(connection) {
        var sourceIndex = indexByNodeId[connection.fromId];
        var targetIndex = indexByNodeId[connection.toId];
        if (typeof sourceIndex !== 'number' || typeof targetIndex !== 'number') return null;

        var sourceStep = steps[sourceIndex];
        var targetStep = steps[targetIndex];
        if (!sourceStep || !targetStep) return null;

        return {
          id: 'conn_' + sourceStep.id + '_' + targetStep.id,
          fromStepId: sourceStep.id,
          toStepId: targetStep.id,
          fromNodeId: connection.fromId,
          toNodeId: connection.toId,
          label: targetStep.connectionLabelFromPrevious || 'Flujo',
          status: targetStep.status === 'error' ? 'error' : (targetStep.status === 'success' ? 'success' : 'running')
        };
      }).filter(Boolean);
    }

    /**
     * Define el estado visual de cada paso mock.
     * Si hay tres o mas pasos, el ultimo cae en error para que la UI muestre
     * una corrida mas realista y util para diseño.
     */
    buildStepStatus(index, total) {
      if (total >= 3 && index === total - 1) {
        return {
          key: 'error',
          label: '404 Not Found',
          httpStatus: 404
        };
      }

      return {
        key: 'success',
        label: '200 OK',
        httpStatus: 200
      };
    }

    /**
     * Devuelve una duracion mock razonable por paso.
     */
    buildStepDuration(index, status) {
      if (status === 'error') return 83 + (index * 7);
      return 214 + (index * 104);
    }

    /**
     * Genera variables nuevas para un paso concreto.
     * Intenta usar las salidas descubiertas por Swagger para que la vista se
     * parezca a un caso real del ambiente.
     */
    buildCreatedVariables(item, index, scenario) {
      var outputs = this.pickPreviewOutputs(item, index, scenario);
      var selectedOutputs = outputs.slice(0, 3);
      var self = this;

      if (!selectedOutputs.length) {
        return [
          {
            name: this.safeName(item.method, 'resultId'),
            value: String(index + 1),
            type: 'integer',
            source: item.method || 'Paso'
          }
        ];
      }

      return selectedOutputs.map(function mapOutput(output, outputIndex) {
        return {
          name: output.alias || output.displayLabel || output.key || output.sourceVarKey,
          value: self.mockValueForOutput(output, index, outputIndex),
          type: self.normalizeType(output.type),
          source: item.method || 'Paso',
          sourceVarKey: output.sourceVarKey || ''
        };
      });
    }

    /**
     * Busca las salidas preview de un paso usando la misma convención de grupo
     * que ya utiliza el builder.
     */
    pickPreviewOutputs(item, index, scenario) {
      var previewOutputs = scenario && Array.isArray(scenario.previewOutputs) ? scenario.previewOutputs : [];
      var groupKey = String((item && item.service) || '') + '.' + String((item && item.method) || '') + '::' + index;

      return previewOutputs.filter(function keepOutputsFromCurrentStep(output) {
        return output.sourceGroupKey === groupKey;
      });
    }

    /**
     * Genera un valor mock coherente segun tipo y nombre de la salida.
     */
    mockValueForOutput(output, stepIndex, outputIndex) {
      var label = String(output && (output.pathLabel || output.key || output.displayLabel || output.sourceVarKey) || '').toLowerCase();
      var type = this.normalizeType(output && output.type);

      if (label.indexOf('guid') >= 0) {
        return this.buildGuid(stepIndex + 1, outputIndex + 1);
      }
      if (label.indexOf('name') >= 0 || label.indexOf('description') >= 0) {
        return 'Valor ' + (stepIndex + 1) + '.' + (outputIndex + 1);
      }
      if (type === 'integer' || type === 'number') {
        return String((stepIndex + 1) * (outputIndex + 2));
      }
      if (type === 'boolean') {
        return outputIndex % 2 === 0 ? 'true' : 'false';
      }

      return 'mock_' + (stepIndex + 1) + '_' + (outputIndex + 1);
    }

    /**
     * Crea la URL mock del paso.
     * No intenta resolver todo el mapping real; solo arma una vista legible
     * para que el Execution Mode luzca profesional en esta primera version.
     */
    buildRequestUrl(item, index, scenario, state) {
      var baseUrl = String(state && state.swaggerBaseUrl || 'http://10.0.0.5:5101/api').replace(/\/+$/g, '');
      var path = String(item && item.path || '/public/mock/v1/step').replace(/\{([^}]+)\}/g, function replacePathParam(_, name) {
        return encodeURIComponent(String(name || 'value') + '_' + (index + 1));
      });

      var queryParams = (item && Array.isArray(item.manualInputs) ? item.manualInputs : []).filter(function keepQueryInput(input) {
        return String(input.location || '').toLowerCase() === 'query';
      }).slice(0, 4).map(function mapQueryInput(input, inputIndex) {
        var paramName = input.pathLabel || input.key || ('param' + inputIndex);
        return encodeURIComponent(paramName) + '=' + encodeURIComponent(String(input.defaultValue || (input.key || 'value') + '_' + (index + 1)));
      });

      return baseUrl + path + (queryParams.length ? '?' + queryParams.join('&') : '');
    }

    /**
     * Construye headers mock estandarizados para todos los requests del flujo.
     */
    buildRequestHeaders(state) {
      var authContext = state && state.authContext ? state.authContext : {};
      return {
        Canal: authContext.channel || 'BTDIGITAL',
        Usuario: authContext.username || 'INSTALADOR',
        Device: authContext.device || 'INSTALADOR',
        Requerimiento: authContext.requirement || '1',
        Token: 'B240259FC0A0A579CBBA123B'
      };
    }

    /**
     * Genera un body/request mock lo mas legible posible segun el paso.
     */
    buildRequestBody(item, index, scenario) {
      var inputs = this.pickPreviewInputs(item, index, scenario).slice(0, 4);
      var body = {};
      var self = this;

      inputs.forEach(function assignInput(input, inputIndex) {
        body[input.pathLabel || input.key || ('input' + inputIndex)] = self.mockValueFromInput(input, index, inputIndex);
      });

      if (!Object.keys(body).length) {
        body.context = item.service || 'Service';
        body.operation = item.method || 'Method';
      }

      return body;
    }

    /**
     * Recupera las entradas preview del paso actual.
     */
    pickPreviewInputs(item, index, scenario) {
      var previewVariables = scenario && Array.isArray(scenario.previewVariables) ? scenario.previewVariables : [];
      var groupKey = String((item && item.service) || '') + '.' + String((item && item.method) || '') + '::' + index;

      return previewVariables.filter(function keepInputsFromCurrentStep(input) {
        return input.groupKey === groupKey && !input.repeatableGroupKey;
      });
    }

    /**
     * Produce un valor mock amigable segun la metadata del input.
     */
    mockValueFromInput(input, stepIndex, inputIndex) {
      var label = String(input && (input.pathLabel || input.key) || '').toLowerCase();
      var type = this.normalizeType(input && input.type);

      if (label.indexOf('guid') >= 0) {
        return this.buildGuid(stepIndex + 1, inputIndex + 1);
      }
      if (label.indexOf('date') >= 0) {
        return '2026-07-09';
      }
      if (type === 'integer' || type === 'number') {
        return (stepIndex + 1) * 2 + inputIndex;
      }
      if (type === 'boolean') {
        return inputIndex % 2 === 0;
      }

      return input.defaultValue || ((input.key || 'value') + '_' + (stepIndex + 1));
    }

    /**
     * Genera una respuesta mock simple y ordenada para el panel inferior.
     */
    buildResponseBody(item, index, createdVariables, status) {
      if (status === 'error') {
        return {
          BusinessErrors: {
            BusinessError: [
              {
                Code: 120060101,
                Description: 'El recurso mock no existe',
                Severity: 'E',
                Target: item.method || 'step'
              }
            ]
          }
        };
      }

      var response = {};

      createdVariables.forEach(function assignVariable(variable) {
        response[variable.name] = variable.value;
      });

      response.status = 'OK';
      response.step = index + 1;

      return response;
    }

    /**
     * Devuelve logs mock cortos y empresariales.
     */
    buildStepLogs(item, index, status, requestUrl) {
      var logs = [
        'Se preparo el request del paso ' + (index + 1) + '.',
        'Se resolvio la URL: ' + requestUrl
      ];

      if (status === 'error') {
        logs.push('El paso devolvio un BusinessError mock para validar la UX de errores.');
      } else {
        logs.push('El paso completo su corrida mock con estado exitoso.');
      }

      return logs;
    }

    /**
     * Arma la timeline cronologica del panel derecho.
     */
    buildTimeline(authStep, steps, startedAt) {
      var events = [];

      events.push({
        id: 'timeline_start',
        stepId: 'auth',
        timeLabel: this.formatTime(startedAt),
        title: 'Iniciando ejecucion',
        status: 'running',
        statusLabel: 'Preparando',
        durationLabel: '--'
      });

      events.push({
        id: 'timeline_auth',
        stepId: authStep.id,
        timeLabel: authStep.happenedAtLabel,
        title: authStep.name,
        status: authStep.status,
        statusLabel: authStep.statusLabel,
        durationLabel: authStep.durationLabel
      });

      steps.forEach(function appendStepEvent(step) {
        events.push({
          id: 'timeline_' + step.id,
          stepId: step.id,
          timeLabel: step.happenedAtLabel,
          title: step.name,
          status: step.status,
          statusLabel: step.statusLabel,
          durationLabel: step.durationLabel
        });
      });

      return events;
    }

    /**
     * Consolida variables globales combinando Authenticate y pasos del flujo.
     */
    buildGlobalVariables(authStep, steps) {
      var rows = [];

      (authStep.createdVariables || []).forEach(function appendAuthVariable(variable) {
        rows.push(variable);
      });

      steps.forEach(function appendStepVariables(step) {
        (step.createdVariables || []).forEach(function appendVariable(variable) {
          rows.push(variable);
        });
      });

      return rows;
    }

    /**
     * Resume la corrida completa en tarjetas superiores.
     */
    buildSummary(authStep, steps, globalVariables) {
      var successCount = steps.filter(function keepOk(step) { return step.status === 'success'; }).length + 1;
      var errorCount = steps.filter(function keepError(step) { return step.status === 'error'; }).length;
      var warningCount = steps.reduce(function countWarnings(total, step) {
        return total + ((step.warnings || []).length);
      }, 0);
      var durationMs = authStep.durationMs + steps.reduce(function sumDuration(total, step) {
        return total + (step.durationMs || 0);
      }, 0);

      return {
        totalSteps: steps.length + 1,
        successCount: successCount,
        errorCount: errorCount,
        requestCount: steps.length + 1,
        variableCount: globalVariables.length,
        warningCount: warningCount,
        durationMs: durationMs
      };
    }

    /**
     * Elige el paso seleccionado por defecto.
     * Se prioriza el error; si no hay, se toma el primer paso del flujo.
     */
    pickSelectedStepId(steps) {
      for (var i = 0; i < steps.length; i++) {
        if (steps[i].status === 'error') return steps[i].id;
      }
      return steps.length ? steps[0].id : 'auth';
    }

    /**
     * Construye un catalogo simplificado de servicios para la columna izquierda
     * dentro del modo ejecucion.
     */
    buildServiceCatalog(state) {
      var services = Array.isArray(state && state.services) ? state.services : [];
      var operationsByService = state && state.serviceOperations ? state.serviceOperations : {};

      return services.slice(0, 6).map(function mapService(service) {
        return {
          name: service,
          operations: (operationsByService[service] || []).slice(0, 6).map(function mapOperation(operation) {
            return {
              name: operation.methodName || 'Metodo',
              meta: String(operation.httpMethod || 'GET').toUpperCase() + ' | ' + (operation.summary || operation.path || 'Sin descripcion')
            };
          })
        };
      });
    }

    /**
     * Normaliza tipos para que toda la UI los vea de manera uniforme.
     */
    normalizeType(type) {
      var normalized = String(type || 'string').toLowerCase();
      if (normalized.indexOf('int') >= 0) return 'integer';
      if (normalized.indexOf('double') >= 0 || normalized.indexOf('decimal') >= 0 || normalized.indexOf('number') >= 0) return 'number';
      if (normalized.indexOf('bool') >= 0) return 'boolean';
      return 'string';
    }

    /**
     * Devuelve una hora corta legible.
     */
    formatTime(dateValue) {
      var date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return date.toLocaleTimeString('es-UY', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }

    /**
     * Devuelve una duracion resumida.
     */
    formatDuration(milliseconds) {
      return String(milliseconds || 0) + ' ms';
    }

    /**
     * Genera un GUID simple pero consistente para mocks.
     */
    buildGuid(stepNumber, itemNumber) {
      return '0000000' + stepNumber + '-000' + itemNumber + '-4000-8000-00000000000' + itemNumber;
    }

    /**
     * Sanitiza un nombre base para fallback de variables.
     */
    safeName(base, suffix) {
      return String(base || 'step').replace(/[^A-Za-z0-9]+/g, '') + suffix;
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionExecutionMockDataBuilder = CollectionExecutionMockDataBuilder;
})(window);
