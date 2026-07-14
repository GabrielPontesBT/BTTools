'use strict';

const { normalizeFieldName, lastPathSegment } = require('./field-normalizer');

/**
 * Intenta resolver un input usando un mapping explícito del escenario.
 */
function findExplicitMappingCandidate(mappingConfig, previousCatalog) {
  if (!mappingConfig || !mappingConfig.sourceVarKey) return null;

  for (var i = previousCatalog.length - 1; i >= 0; i--) {
    if (previousCatalog[i].sourceVarKey === mappingConfig.sourceVarKey) {
      return {
        candidate: previousCatalog[i],
        confidence: 1,
        matchSource: 'custom-mapping',
        explanation: 'Resolved from explicit mapping'
      };
    }
  }

  return null;
}

/**
 * Busca el mejor candidato automático entre respuestas anteriores.
 */
function findBestLinkedResponseCandidate(inputDescriptor, previousCatalog, thresholds) {
  var matches = [];
  var inputPath = String(inputDescriptor.pathLabel || inputDescriptor.key || '');
  var inputName = String(inputDescriptor.key || lastPathSegment(inputPath));
  var inputAlias = String(inputDescriptor.alias || '');
  var normalizedValues = uniqueCompact([
    normalizeFieldName(inputPath),
    normalizeFieldName(inputName),
    normalizeFieldName(inputAlias),
    normalizeFieldName(lastPathSegment(inputPath))
  ]);

  previousCatalog.forEach(function evaluateCandidate(candidate) {
    if (!isCompatibleType(inputDescriptor.type, candidate.dataType)) return;

    var candidateValues = uniqueCompact([
      normalizeFieldName(candidate.responsePath),
      normalizeFieldName(candidate.fieldName),
      normalizeFieldName(candidate.alias),
      normalizeFieldName(candidate.itemPathLabel || ''),
      normalizeFieldName(lastPathSegment(candidate.responsePath))
    ]);

    if (normalizeFieldName(inputPath) && normalizeFieldName(inputPath) === normalizeFieldName(candidate.responsePath)) {
      matches.push(makeMatch(candidate, 1, 'exact-path', 'Exact path match'));
      return;
    }

    if (normalizeFieldName(inputName) && normalizeFieldName(inputName) === normalizeFieldName(candidate.fieldName)) {
      matches.push(makeMatch(candidate, 0.99, 'exact-name', 'Exact field name match'));
      return;
    }

    if (candidate.alias && normalizeFieldName(inputName) === normalizeFieldName(candidate.alias)) {
      matches.push(makeMatch(candidate, 0.98, 'normalized-match', 'Matched output alias'));
      return;
    }

    if (hasIntersection(normalizedValues, candidateValues)) {
      matches.push(makeMatch(candidate, 0.95, 'normalized-match', 'Matched normalized field tokens'));
      return;
    }

    if (inputDescriptor.classification.semanticType &&
        inputDescriptor.classification.semanticType === candidate.semanticType &&
        inputDescriptor.classification.confidence >= (thresholds.semanticLinkThreshold || 0.95) &&
        candidate.semanticConfidence >= (thresholds.semanticLinkThreshold || 0.95)) {
      matches.push(makeMatch(candidate, 0.95, 'semantic-similarity', 'Matched semantic type with high confidence'));
    }
  });

  matches.sort(function sortMatches(a, b) {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return b.candidate.executionIndex - a.candidate.executionIndex;
  });

  if (!matches.length) return null;
  if (matches.length === 1) return matches[0];

  var best = matches[0];
  var sameScore = matches.filter(function keepSameScore(match) {
    return match.confidence === best.confidence;
  });

  if (sameScore.length > 1) {
    var distinctSources = Array.from(new Set(sameScore.map(function(match) { return match.candidate.sourceVarKey; })));
    if (distinctSources.length > 1) return null;
  }

  return best;
}

/**
 * Crea un objeto de match consistente para trazabilidad y debugging.
 */
function makeMatch(candidate, confidence, matchSource, explanation) {
  return {
    candidate: candidate,
    confidence: confidence,
    matchSource: matchSource,
    explanation: explanation
  };
}

/**
 * Verifica compatibilidad básica de tipos antes de enlazar automáticamente.
 */
function isCompatibleType(inputType, outputType) {
  var left = normalizeType(inputType);
  var right = normalizeType(outputType);
  if (!left || !right) return true;
  if (left === right) return true;
  if (left === 'number' && right === 'integer') return true;
  if (left === 'integer' && right === 'number') return true;
  return false;
}

/**
 * Agrupa tipos Swagger en una taxonomía chica y comparable.
 */
function normalizeType(value) {
  var raw = String(value || '').toLowerCase();
  if (!raw) return '';
  if (['int', 'integer', 'long', 'short'].indexOf(raw) >= 0) return 'integer';
  if (['decimal', 'double', 'float', 'number'].indexOf(raw) >= 0) return 'number';
  if (['bool', 'boolean'].indexOf(raw) >= 0) return 'boolean';
  if (raw.indexOf('date') >= 0) return 'date';
  if (raw === 'string') return 'string';
  return raw;
}

/**
 * Devuelve true si ambos conjuntos comparten al menos un valor no vacío.
 */
function hasIntersection(left, right) {
  for (var i = 0; i < left.length; i++) {
    if (right.indexOf(left[i]) >= 0) return true;
  }
  return false;
}

/**
 * Elimina duplicados y falsy para facilitar comparaciones.
 */
function uniqueCompact(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

module.exports = {
  findExplicitMappingCandidate,
  findBestLinkedResponseCandidate,
  normalizeType
};
