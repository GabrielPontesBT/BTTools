'use strict';

const { createPreviousResponseCatalog } = require('../request-data-resolver/response-field-catalog');
const { findBestLinkedResponseCandidate } = require('../request-data-resolver/variable-linker');

const SEMANTIC_LINK_THRESHOLD = 0.95;

/**
 * Identificador unico y estable de una operacion dentro del grafo de sugerencias.
 */
function operationNodeId(operation) {
  return String((operation && operation.service) || '') + '::' + String((operation && operation.operationKey) || (operation && operation.method) || '');
}

/**
 * Arma el catalogo acumulado de salidas de los pasos ya recorridos, reutilizando
 * tal cual `createPreviousResponseCatalog` de request-data-resolver (sin modificarla).
 * Cada operacion del `path` se trata como si fuera un paso ya ejecutado del escenario.
 */
function buildAccumulatedCatalog(path, classifier) {
  var pseudoScenario = { items: path, outputAliases: {} };
  return createPreviousResponseCatalog(pseudoScenario, path.length, classifier);
}

/**
 * Traduce un input del catalogo (manualInputs) al contrato que espera el matcher existente,
 * clasificandolo con el mismo clasificador semantico que usa "Rellenar datos".
 */
function buildInputDescriptor(input, classifier) {
  var pathLabel = String((input && input.pathLabel) || (input && input.key) || '');
  var key = String((input && input.key) || '');
  var type = String((input && input.type) || '');
  var description = String((input && input.description) || '');

  return {
    key: key,
    pathLabel: pathLabel,
    alias: '',
    type: type,
    description: description,
    classification: classifier.classify({
      fieldName: key || pathLabel,
      fieldPath: pathLabel,
      description: description,
      dataType: type
    })
  };
}

/**
 * Evalua las entradas de una operacion destino contra un catalogo de salidas ya acumulado,
 * usando `findBestLinkedResponseCandidate` sin modificarlo. Devuelve solo conexiones reales
 * (el matcher es conservador: sin match, no hay conexion, nunca se inventa una).
 */
function findConnectionsForOperation(targetOperation, accumulatedCatalog, classifier) {
  if (!accumulatedCatalog.length) return [];

  var manualInputs = Array.isArray(targetOperation.manualInputs) ? targetOperation.manualInputs : [];
  var connections = [];

  manualInputs.forEach(function evaluateInput(input) {
    var descriptor = buildInputDescriptor(input, classifier);
    var match = findBestLinkedResponseCandidate(descriptor, accumulatedCatalog, { semanticLinkThreshold: SEMANTIC_LINK_THRESHOLD });
    if (!match) return;

    var candidate = match.candidate;
    var isIdentifier = !!(descriptor.classification && descriptor.classification.isTechnicalIdentifier);

    connections.push({
      targetInput: { key: input.key, pathLabel: input.pathLabel, type: input.type },
      fromStepIndex: candidate.executionIndex,
      sourceField: { pathLabel: candidate.responsePath, type: candidate.dataType },
      targetField: { pathLabel: descriptor.pathLabel, type: descriptor.type },
      sourceVarKey: candidate.sourceVarKey,
      isCollectionSource: !!candidate.isCollectionItemOutput,
      isTechnicalIdentifier: isIdentifier,
      tier: candidate.isCollectionItemOutput ? 'medium' : 'high',
      matchSource: match.matchSource,
      explanation: match.explanation
    });
  });

  return connections;
}

module.exports = {
  operationNodeId,
  buildAccumulatedCatalog,
  buildInputDescriptor,
  findConnectionsForOperation
};
