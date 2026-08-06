'use strict';

const { normalizeFieldName, lastPathSegment } = require('./field-normalizer');

/**
 * Replica la clave técnica usada por el builder para salidas exportables.
 */
function buildOutputVarKey(item, outputField) {
  return sanitizeVariableKey(String((item && item.service) || '') + '_' +
    String((item && item.method) || '') + '_' +
    String(((outputField && outputField.pathLabel) || (outputField && outputField.key) || 'output')).replace(/[^A-Za-z0-9]+/g, '_'));
}

/**
 * Sanitiza una clave para uso interno en runtime o variables Postman.
 */
function sanitizeVariableKey(value) {
  return String(value || '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'value';
}

/**
 * Crea el catálogo acumulado de respuestas disponibles antes de un paso dado.
 */
function createPreviousResponseCatalog(scenario, limitIndex, classifier) {
  var catalog = [];
  var items = Array.isArray(scenario && scenario.items) ? scenario.items : [];
  var outputAliases = scenario && scenario.outputAliases ? scenario.outputAliases : {};

  for (var itemIndex = 0; itemIndex < items.length; itemIndex++) {
    if (itemIndex >= limitIndex) break;

    var item = items[itemIndex];
    var outputFields = Array.isArray(item && item.outputFields) ? item.outputFields : [];
    for (var outputIndex = 0; outputIndex < outputFields.length; outputIndex++) {
      catalog.push(buildCatalogEntry(item, itemIndex, outputFields[outputIndex], outputAliases, classifier));
    }
  }

  return catalog;
}

/**
 * Traduce una salida Swagger a un registro rico en metadata para linking.
 */
function buildCatalogEntry(item, itemIndex, outputField, outputAliases, classifier) {
  var fieldPath = String((outputField && outputField.pathLabel) || (outputField && outputField.key) || '');
  var fieldName = String((outputField && outputField.key) || lastPathSegment(fieldPath) || '');
  var sourceVarKey = buildOutputVarKey(item, outputField);
  var alias = outputAliases && outputAliases[sourceVarKey] ? String(outputAliases[sourceVarKey]) : '';
  var classification = classifier.classify({
    fieldName: fieldName,
    fieldPath: fieldPath,
    alias: alias,
    description: outputField && outputField.description || '',
    dataType: outputField && outputField.type || ''
  });

  return {
    serviceId: String((item && item.operationKey) || sourceVarKey),
    serviceName: String((item && item.method) || ''),
    executionIndex: itemIndex,
    responsePath: fieldPath,
    fieldName: fieldName,
    normalizedName: normalizeFieldName(fieldName),
    normalizedPath: normalizeFieldName(fieldPath),
    dataType: String((outputField && outputField.type) || ''),
    semanticType: classification.semanticType,
    semanticConfidence: classification.confidence,
    alias: alias,
    sourceVarKey: sourceVarKey,
    description: outputField && outputField.description || '',
    isCollectionItemOutput: fieldPath.indexOf('.item.') >= 0,
    collectionPathLabel: splitCollectionPath(fieldPath).collectionPathLabel,
    itemPathLabel: splitCollectionPath(fieldPath).itemPathLabel
  };
}

/**
 * Separa una ruta de colección tipo `groups.group.item.name` en colección e item.
 */
function splitCollectionPath(pathLabel) {
  var parts = String(pathLabel || '').split('.').filter(Boolean);
  var itemIndex = parts.indexOf('item');
  if (itemIndex <= 0 || itemIndex >= parts.length - 1) {
    return {
      collectionPathLabel: '',
      itemPathLabel: ''
    };
  }

  return {
    collectionPathLabel: parts.slice(0, itemIndex).join('.'),
    itemPathLabel: parts.slice(itemIndex + 1).join('.')
  };
}

module.exports = {
  buildOutputVarKey,
  createPreviousResponseCatalog,
  splitCollectionPath,
  sanitizeVariableKey
};
