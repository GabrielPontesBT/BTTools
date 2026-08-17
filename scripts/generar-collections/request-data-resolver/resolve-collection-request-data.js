'use strict';

const { FIELD_VALUE_SOURCES } = require('./resolution-types');
const { DEFAULT_RESOLVER_CONFIG } = require('./resolver-config');
const { RuleBasedSemanticFieldClassifier } = require('./semantic-field-classifier');
const { createPreviousResponseCatalog, buildOutputVarKey, sanitizeVariableKey } = require('./response-field-catalog');
const { findExplicitMappingCandidate, findBestLinkedResponseCandidate } = require('./variable-linker');
const { createBusinessDataContext, buildGeneratorRegistry, generateValueForSemanticType } = require('./business-value-generators');
const { validateGeneratedValue } = require('./generated-value-validator');

/**
 * API pública única del dominio request-data-resolver.
 * Recibe la collection actual, aplica la estrategia de resolución y devuelve
 * una nueva estructura junto con trazabilidad completa.
 */
function resolveCollectionRequestData(collection, options) {
  var executionOptions = options || {};
  var mode = executionOptions.mode || 'preview';
  var config = mergeResolverConfig(DEFAULT_RESOLVER_CONFIG, executionOptions.config || {});
  var classifier = executionOptions.classifier || new RuleBasedSemanticFieldClassifier(config);
  var generatorRegistry = executionOptions.generatorRegistry || buildGeneratorRegistry();
  var scenarios = cloneScenarioPayloads(collection);
  var result = createEmptyResult(mode, config);

  scenarios.forEach(function resolveScenario(scenario) {
    var scenarioResolution = resolveScenarioData(scenario, mode, config, classifier, generatorRegistry, result);
    result.scenarios.push(scenarioResolution);
  });

  result.resolvedCollection = {
    scenarios: result.scenarios
  };
  result.summary = buildSummary(result);
  return result;
}

/**
 * Crea la estructura base donde se van acumulando hallazgos y advertencias.
 */
function createEmptyResult(mode, config) {
  return {
    mode: mode,
    config: config,
    scenarios: [],
    linkedFields: [],
    generatedFields: [],
    preservedFields: [],
    unresolvedFields: [],
    warnings: [],
    resolvedCollection: null,
    summary: null
  };
}

/**
 * Resuelve todos los inputs de un escenario respetando el orden de servicios.
 */
function resolveScenarioData(scenario, mode, config, classifier, generatorRegistry, result) {
  var nextScenario = deepCloneScenario(scenario);
  var sharedBusinessContext = createBusinessDataContext(config);

  nextScenario.items.forEach(function resolveItem(item, itemIndex) {
    if (!item.inputOverrides || typeof item.inputOverrides !== 'object') item.inputOverrides = {};
    if (!item.requestDataResolution || typeof item.requestDataResolution !== 'object') item.requestDataResolution = {};

    var previousCatalog = createPreviousResponseCatalog(nextScenario, itemIndex, classifier);
    var manualInputs = Array.isArray(item.manualInputs) ? item.manualInputs : [];

    manualInputs.forEach(function resolveInput(input) {
      var inputDescriptor = buildInputDescriptor(nextScenario, item, input, itemIndex, classifier);
      var resolution = resolveInputDescriptor({
        mode: mode,
        scenario: nextScenario,
        item: item,
        input: input,
        inputDescriptor: inputDescriptor,
        previousCatalog: previousCatalog,
        config: config,
        classifier: classifier,
        generatorRegistry: generatorRegistry,
        businessContext: sharedBusinessContext,
        result: result
      });

      applyResolution(nextScenario, item, input, inputDescriptor, resolution, result);
    });
  });

  return nextScenario;
}

/**
 * Prepara toda la metadata útil de un input antes de intentar resolverlo.
 */
function buildInputDescriptor(scenario, item, input, itemIndex, classifier) {
  var mappingKey = buildInputMappingKey(item, input);
  var alias = scenario && scenario.inputAliases && scenario.inputAliases[mappingKey]
    ? String(scenario.inputAliases[mappingKey])
    : '';
  var fieldPath = String(input.pathLabel || input.key || '');
  var parentPath = fieldPath.split('.').filter(Boolean);

  return {
    key: String(input.key || ''),
    pathLabel: fieldPath,
    type: String(input.type || ''),
    format: String(input.format || ''),
    description: String(input.description || ''),
    defaultValue: input.defaultValue,
    enumValues: Array.isArray(input.enumValues) ? input.enumValues.slice() : [],
    location: String(input.location || ''),
    alias: alias,
    mappingKey: mappingKey,
    executionIndex: itemIndex,
    classification: classifier.classify({
      fieldName: input.key,
      fieldPath: fieldPath,
      alias: alias,
      description: input.description || '',
      dataType: input.type || '',
      format: input.format || '',
      enumValues: input.enumValues || [],
      parentFieldName: parentPath.length > 1 ? parentPath[parentPath.length - 2] : '',
      ancestorNames: parentPath.slice(0, -1)
    })
  };
}

/**
 * Ejecuta la prioridad completa de resolución para un input puntual.
 */
function resolveInputDescriptor(context) {
  var existingMapping = normalizeInputMappingConfig(context.scenario.inputMappings[context.inputDescriptor.mappingKey]);
  var explicitCandidate = findExplicitMappingCandidate(existingMapping, context.previousCatalog);
  if (explicitCandidate) {
    return buildLinkedResolution(explicitCandidate, existingMapping, FIELD_VALUE_SOURCES.EXPLICIT_MAPPING);
  }
  if (existingMapping && existingMapping.sourceVarKey) {
    context.result.warnings.push({
      fieldPath: context.inputDescriptor.pathLabel,
      reason: 'Explicit mapping points to a source that is not available in previous services.'
    });
  }

  var manualValue = readCurrentManualValue(context.scenario, context.item, context.inputDescriptor.key);
  var shouldPreserveManual = context.mode === 'preview' && context.config.fillOnlyEmptyFields && hasUsableValue(manualValue);
  if (shouldPreserveManual) {
    return buildValueResolution(FIELD_VALUE_SOURCES.MANUAL, manualValue, 'Preview mode preserves non-empty manual values.');
  }

  var automaticLink = findBestLinkedResponseCandidate(context.inputDescriptor, context.previousCatalog, context.config);
  if (automaticLink) {
    return buildLinkedResolution(automaticLink, existingMapping, FIELD_VALUE_SOURCES.LINKED_RESPONSE);
  }

  if (hasUsableValue(manualValue)) {
    return buildValueResolution(FIELD_VALUE_SOURCES.MANUAL, manualValue, 'Manual value already present.');
  }

  if (hasUsableValue(context.inputDescriptor.defaultValue)) {
    return buildValueResolution(FIELD_VALUE_SOURCES.FIXED, context.inputDescriptor.defaultValue, 'Using fixed/default value from request metadata.');
  }

  if (context.inputDescriptor.enumValues.length) {
    return buildValueResolution(FIELD_VALUE_SOURCES.ENUM, context.inputDescriptor.enumValues[0], 'Using first available enum/catalog value.');
  }

  var semanticType = resolveCustomSemanticType(context.config, context.inputDescriptor) || context.inputDescriptor.classification.semanticType;
  var threshold = context.mode === 'collection-generation'
    ? context.config.collectionGenerationThreshold
    : context.config.manualFillThreshold;
  if (semanticType &&
      !context.inputDescriptor.classification.isTechnicalIdentifier &&
      context.inputDescriptor.classification.confidence >= threshold) {
    var generatedValue = generateValueForSemanticType(semanticType, context.businessContext, context.generatorRegistry);
    var validation = validateGeneratedValue(context.inputDescriptor, generatedValue);
    if (validation.ok) {
      return buildValueResolution(FIELD_VALUE_SOURCES.GENERATED, validation.value, context.inputDescriptor.classification.explanation, {
        semanticType: semanticType,
        confidence: context.inputDescriptor.classification.confidence
      });
    }
    context.result.warnings.push({
      fieldPath: context.inputDescriptor.pathLabel,
      reason: validation.reason || 'Generated value is not valid for this field.'
    });
  }

  return {
    source: FIELD_VALUE_SOURCES.UNRESOLVED,
    value: null,
    reason: context.inputDescriptor.classification.isTechnicalIdentifier
      ? 'Technical identifier without a valid previous source.'
      : 'No previous source or safe generator was found.',
    metadata: {
      semanticType: semanticType || null,
      confidence: context.inputDescriptor.classification.confidence || 0
    }
  };
}

/**
 * Aplica la resolución calculada sobre el escenario clonado y actualiza trazabilidad.
 */
function applyResolution(scenario, item, input, inputDescriptor, resolution, result) {
  var mappingKey = inputDescriptor.mappingKey;
  item.requestDataResolution[mappingKey] = {
    source: resolution.source,
    reason: resolution.reason,
    semanticType: resolution.metadata && resolution.metadata.semanticType || null,
    confidence: resolution.metadata && resolution.metadata.confidence || 0
  };

  if (resolution.source === FIELD_VALUE_SOURCES.EXPLICIT_MAPPING || resolution.source === FIELD_VALUE_SOURCES.LINKED_RESPONSE) {
    scenario.inputMappings[mappingKey] = buildStoredMappingConfig(scenario.inputMappings[mappingKey], resolution.linkedFrom);
    result.linkedFields.push({
      fieldPath: inputDescriptor.pathLabel,
      value: '{{' + resolution.linkedFrom.runtimeKey + '}}',
      linkedFrom: {
        serviceId: resolution.linkedFrom.serviceId,
        serviceName: resolution.linkedFrom.serviceName,
        responsePath: resolution.linkedFrom.responsePath
      },
      source: resolution.source
    });
    return;
  }

  if (resolution.source === FIELD_VALUE_SOURCES.MANUAL || resolution.source === FIELD_VALUE_SOURCES.FIXED || resolution.source === FIELD_VALUE_SOURCES.ENUM || resolution.source === FIELD_VALUE_SOURCES.GENERATED) {
    item.inputOverrides[inputDescriptor.key] = resolution.value;
    result[(resolution.source === FIELD_VALUE_SOURCES.GENERATED) ? 'generatedFields' : 'preservedFields'].push({
      fieldPath: inputDescriptor.pathLabel,
      value: resolution.value,
      source: resolution.source,
      semanticType: resolution.metadata && resolution.metadata.semanticType || null,
      confidence: resolution.metadata && resolution.metadata.confidence || 0
    });
    return;
  }

  result.unresolvedFields.push({
    fieldPath: inputDescriptor.pathLabel,
    reason: resolution.reason,
    semanticType: resolution.metadata && resolution.metadata.semanticType || null
  });
}

/**
 * Devuelve el valor manual vigente, priorizando el override del item sobre el general.
 */
function readCurrentManualValue(scenario, item, key) {
  if (item && item.inputOverrides && Object.prototype.hasOwnProperty.call(item.inputOverrides, key)) {
    return item.inputOverrides[key];
  }
  if (scenario && scenario.variableOverrides && Object.prototype.hasOwnProperty.call(scenario.variableOverrides, key)) {
    return scenario.variableOverrides[key];
  }
  return undefined;
}

/**
 * Devuelve true cuando el valor existe y no es cadena vacía.
 */
function hasUsableValue(value) {
  return value !== undefined && value !== null && String(value) !== '';
}

/**
 * Construye un resultado orientado a linking desde respuestas previas.
 */
function buildLinkedResolution(match, previousMapping, source) {
  var linkedField = match.candidate;
  return {
    source: source,
    value: '{{' + linkedField.sourceVarKey + '}}',
    reason: match.explanation,
    linkedFrom: {
      serviceId: linkedField.serviceId,
      serviceName: linkedField.serviceName,
      responsePath: linkedField.responsePath,
      runtimeKey: buildRuntimeKey(previousMapping, linkedField)
    },
    metadata: {
      semanticType: linkedField.semanticType || null,
      confidence: match.confidence,
      matchSource: match.matchSource
    }
  };
}

/**
 * Construye un resultado simple basado en un valor concreto preservado o generado.
 */
function buildValueResolution(source, value, reason, metadata) {
  return {
    source: source,
    value: value,
    reason: reason,
    metadata: metadata || {}
  };
}

/**
 * Reusa la convención actual del runtime cuando existe filtro de colección.
 */
function buildRuntimeKey(mappingConfig, linkedField) {
  var normalized = normalizeInputMappingConfig(mappingConfig);
  if (!normalized || !normalized.sourceVarKey) return linkedField.sourceVarKey;
  var effectiveFilterField = normalized.filterField || (normalized.filterValue ? normalized.itemPathLabel : '');
  if (!effectiveFilterField || !normalized.filterValue) return normalized.sourceVarKey;
  return sanitizeVariableKey(normalized.sourceVarKey + '__filter__' + effectiveFilterField + '__' + normalized.filterValue);
}

/**
 * Replica el formato persistido de mappings del builder actual.
 */
function buildStoredMappingConfig(previousMapping, linkedFrom) {
  var normalized = normalizeInputMappingConfig(previousMapping) || {};
  normalized.sourceVarKey = linkedFrom.runtimeKey === linkedFrom.responsePath ? linkedFrom.runtimeKey : linkedFrom.runtimeKey;
  if (!normalized.sourceVarKey) normalized.sourceVarKey = linkedFrom.runtimeKey;
  return normalized;
}

/**
 * Normaliza la estructura de mapping del escenario para usarla de forma segura.
 */
function normalizeInputMappingConfig(mapping) {
  if (!mapping) return null;
  if (typeof mapping === 'string') return { sourceVarKey: mapping };
  if (typeof mapping !== 'object' || !mapping.sourceVarKey) return null;
  return {
    sourceVarKey: String(mapping.sourceVarKey || ''),
    filterField: String(mapping.filterField || ''),
    filterValue: String(mapping.filterValue || ''),
    collectionPathLabel: String(mapping.collectionPathLabel || ''),
    itemPathLabel: String(mapping.itemPathLabel || '')
  };
}

/**
 * Permite forzar tipos semánticos específicos desde configuración del proyecto.
 */
function resolveCustomSemanticType(config, inputDescriptor) {
  var customMappings = config && config.customMappings ? config.customMappings : {};
  return customMappings[inputDescriptor.pathLabel] || customMappings[inputDescriptor.key] || customMappings[inputDescriptor.alias] || null;
}

/**
 * Replica la clave técnica usada por el preview manager del frontend.
 */
function buildInputMappingKey(item, input) {
  return String((item && item.operationKey) || ((item && item.service) || '') + '::' + ((item && item.method) || '')) +
    '::' + String((input && (input.pathLabel || input.key)) || '');
}

/**
 * Clona el payload soportando tanto escenarios nuevos como formato legacy.
 */
function cloneScenarioPayloads(source) {
  if (Array.isArray(source && source.scenarios) && source.scenarios.length) {
    return source.scenarios.map(function cloneScenario(scenario, index) {
      return deepCloneScenario({
        id: scenario.id || ('scenario_' + index),
        name: scenario.name || ('Caso de uso ' + (index + 1)),
        items: Array.isArray(scenario.items) ? scenario.items : [],
        variableOverrides: scenario.variableOverrides || {},
        inputMappings: scenario.inputMappings || {},
        inputAliases: scenario.inputAliases || {},
        outputAliases: scenario.outputAliases || {},
        repeatableOverrides: scenario.repeatableOverrides || {}
      });
    }).filter(function keepNonEmptyScenario(scenario) {
      return Array.isArray(scenario.items) && scenario.items.length > 0;
    });
  }

  return [deepCloneScenario({
    id: 'scenario_0',
    name: 'Flujo generado',
    items: Array.isArray(source && source.items) ? source.items : [],
    variableOverrides: source && source.variableOverrides || {},
    inputMappings: source && source.inputMappings || {},
    inputAliases: source && source.inputAliases || {},
    outputAliases: source && source.outputAliases || {},
    repeatableOverrides: source && source.repeatableOverrides || {}
  })].filter(function keepLegacyScenario(scenario) {
    return Array.isArray(scenario.items) && scenario.items.length > 0;
  });
}

/**
 * Crea un clon profundo suficiente para datos JSON del builder.
 */
function deepCloneScenario(scenario) {
  return JSON.parse(JSON.stringify(scenario || {}));
}

/**
 * Fusiona configuración sin perder objetos anidados chicos.
 */
function mergeResolverConfig(baseConfig, overrideConfig) {
  var result = deepCloneScenario(baseConfig);
  Object.keys(overrideConfig || {}).forEach(function mergeKey(key) {
    if (isPlainObject(result[key]) && isPlainObject(overrideConfig[key])) {
      result[key] = mergeResolverConfig(result[key], overrideConfig[key]);
    } else {
      result[key] = overrideConfig[key];
    }
  });
  return result;
}

/**
 * Distingue objetos planos de arrays u otros tipos para merges seguros.
 */
function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Resume el resultado con contadores listos para UI o logs.
 */
function buildSummary(result) {
  return {
    linkedCount: result.linkedFields.length,
    generatedCount: result.generatedFields.length,
    preservedCount: result.preservedFields.length,
    unresolvedCount: result.unresolvedFields.length,
    warningCount: result.warnings.length,
    completedCount: result.linkedFields.length + result.generatedFields.length + result.preservedFields.length
  };
}

module.exports = {
  resolveCollectionRequestData,
  buildInputMappingKey,
  normalizeInputMappingConfig
};
