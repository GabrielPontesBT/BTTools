'use strict';

const { RuleBasedSemanticFieldClassifier } = require('../request-data-resolver/semantic-field-classifier');
const { operationNodeId, buildAccumulatedCatalog, buildInputDescriptor, findConnectionsForOperation } = require('./graph-builder');
const { isDestructiveOperation } = require('./safety-rules');

const CONFIDENCE_RANK = { high: 0, medium: 1, review: 2 };

// Techo duro de nodos explorados para no combinar sin limite en catalogos grandes.
const MAX_EXPLORED_NODES = 2000;
// Ancho de "beam": en cada nivel solo seguimos los mejores candidatos, no todos.
const BEAM_WIDTH = 6;

function clampNumber(value, min, max, fallback) {
  var parsed = Number(value);
  if (!isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

/**
 * Suma un puntaje simple y explicable para ordenar sugerencias de igual confianza.
 * Prioriza identificadores tecnicos y coincidencias mas fuertes; penaliza colecciones
 * sin resolver y cadenas mas largas a igual calidad de conexion.
 */
function scoreConnections(connections, pathLength) {
  var score = 0;

  connections.forEach(function addConnectionScore(connection) {
    score += connection.isTechnicalIdentifier ? 20 : 5;

    if (connection.matchSource === 'exact-path' || connection.matchSource === 'exact-name') score += 15;
    else if (connection.matchSource === 'normalized-match') score += 10;
    else if (connection.matchSource === 'semantic-similarity') score += 8;

    if (connection.isCollectionSource) score -= 10;
  });

  return score - pathLength;
}

/**
 * Reconstruye, para un camino ya completo, todas las conexiones paso a paso,
 * las entradas manuales que quedan pendientes y el nivel de confianza global.
 */
function buildSuggestion(path, classifier) {
  var allConnections = [];
  var manualInputsPending = [];
  var warnings = [];
  var hasCollectionPending = false;
  var hasUnresolvedIdentifier = false;
  var hasDestructiveStep = false;

  for (var stepIndex = 1; stepIndex < path.length; stepIndex++) {
    var priorSteps = path.slice(0, stepIndex);
    var accumulatedCatalog = buildAccumulatedCatalog(priorSteps, classifier);
    var stepConnections = findConnectionsForOperation(path[stepIndex], accumulatedCatalog, classifier);
    var connectedInputKeys = {};

    stepConnections.forEach(function collectConnection(connection) {
      allConnections.push(Object.assign({ toStepIndex: stepIndex }, connection));
      // Solo las conexiones de alta confianza cuentan como "ya resueltas": una salida de
      // coleccion se muestra y se explica, pero sigue pendiente hasta que el usuario
      // elija el elemento (nunca se auto-mapea ni se cuenta como resuelta).
      if (connection.tier === 'high') {
        connectedInputKeys[connection.targetInput.key || connection.targetInput.pathLabel] = true;
      } else {
        hasCollectionPending = true;
      }
    });

    var manualInputs = Array.isArray(path[stepIndex].manualInputs) ? path[stepIndex].manualInputs : [];
    manualInputs.forEach(function checkPendingInput(input) {
      var inputKey = input.key || input.pathLabel;
      if (connectedInputKeys[inputKey]) return;

      manualInputsPending.push({ stepIndex: stepIndex, key: input.key, pathLabel: input.pathLabel, type: input.type });

      var descriptor = buildInputDescriptor(input, classifier);
      if (descriptor.classification && descriptor.classification.isTechnicalIdentifier) hasUnresolvedIdentifier = true;
    });

    var destructive = isDestructiveOperation(path[stepIndex]);
    if (destructive.isDestructive) {
      hasDestructiveStep = true;
      warnings.push('"' + path[stepIndex].method + '" ' + destructive.reason + '. Revisa antes de agregarlo.');
    }
  }

  if (!allConnections.length) return null;

  var confidence = 'high';
  if (hasDestructiveStep) confidence = 'review';
  else if (hasCollectionPending || hasUnresolvedIdentifier) confidence = 'medium';

  if (hasCollectionPending) {
    warnings.push('Alguna salida usada es una coleccion: vas a tener que elegir que elemento usar antes de confirmar.');
  }

  return {
    steps: path.map(function toStepSummary(operation) {
      return { service: operation.service, method: operation.method, operationKey: operation.operationKey, httpMethod: operation.httpMethod };
    }),
    connections: allConnections,
    manualInputs: manualInputsPending,
    warnings: warnings,
    confidence: confidence,
    score: scoreConnections(allConnections, path.length)
  };
}

function compareSuggestions(a, b) {
  if (CONFIDENCE_RANK[a.confidence] !== CONFIDENCE_RANK[b.confidence]) {
    return CONFIDENCE_RANK[a.confidence] - CONFIDENCE_RANK[b.confidence];
  }
  if (b.score !== a.score) return b.score - a.score;
  return a.steps.length - b.steps.length;
}

/**
 * Busca caminos posibles desde `startOperation` sobre el resto de `operations`.
 * DFS acotado: sin ciclos (un nodo no se repite dentro de un mismo camino), con techo
 * duro de nodos explorados y un "beam" por nivel para no combinar sin limite.
 */
function findPaths(operations, startOperation, options) {
  var maxDepth = clampNumber(options && options.maxDepth, 1, 5, 5);
  var maxResults = clampNumber(options && options.maxResults, 1, 10, 10);
  var classifier = new RuleBasedSemanticFieldClassifier();

  var startId = operationNodeId(startOperation);
  var pool = (operations || []).filter(function excludeStart(operation) {
    return operationNodeId(operation) !== startId;
  });

  var explored = 0;
  var results = [];

  function extend(path, visitedIds) {
    if (explored >= MAX_EXPLORED_NODES) return;
    explored++;

    if (path.length >= 2) {
      var suggestion = buildSuggestion(path, classifier);
      if (suggestion) results.push(suggestion);
    }

    if (path.length >= maxDepth) return;

    var accumulatedCatalog = buildAccumulatedCatalog(path, classifier);

    var candidates = [];
    pool.forEach(function evaluateCandidate(candidateOperation) {
      var candidateId = operationNodeId(candidateOperation);
      if (visitedIds[candidateId]) return;

      var connections = findConnectionsForOperation(candidateOperation, accumulatedCatalog, classifier);
      if (!connections.length) return;

      candidates.push({ operation: candidateOperation, id: candidateId, connections: connections });
    });

    // Beam: solo seguimos los mejores candidatos de este nivel, no todos.
    candidates.sort(function rankCandidate(a, b) {
      return scoreConnections(b.connections, path.length + 1) - scoreConnections(a.connections, path.length + 1);
    });

    candidates.slice(0, BEAM_WIDTH).forEach(function expandCandidate(candidate) {
      if (explored >= MAX_EXPLORED_NODES) return;

      var nextVisited = Object.assign({}, visitedIds, [candidate.id].reduce(function(acc, id) { acc[id] = true; return acc; }, {}));
      extend(path.concat([candidate.operation]), nextVisited);
    });
  }

  var initialVisited = {};
  initialVisited[startId] = true;
  extend([startOperation], initialVisited);

  results.sort(compareSuggestions);
  return results.slice(0, maxResults);
}

module.exports = {
  findPaths
};
