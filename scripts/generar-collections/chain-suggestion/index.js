'use strict';

const { operationNodeId } = require('./graph-builder');
const { findPaths } = require('./path-finder');

/**
 * Punto de entrada unico del motor de sugerencia de cadenas.
 * Recibe el pool de operaciones ya acotado por alcance (lo decide el cliente)
 * y devuelve caminos posibles desde la operacion inicial, con mappings explicables.
 */
function suggestChains(request) {
  var operations = Array.isArray(request && request.operations) ? request.operations : [];
  var startService = String((request && request.startService) || '');
  var startOperationKey = String((request && request.startOperationKey) || '');

  var startOperation = operations.filter(function matchStart(operation) {
    return String(operation.service || '') === startService && String(operation.operationKey || '') === startOperationKey;
  })[0];

  if (!startOperation) {
    return { ok: false, message: 'No se encontro el metodo inicial dentro del alcance elegido.' };
  }

  var suggestions = findPaths(operations, startOperation, {
    maxDepth: request && request.maxDepth,
    maxResults: request && request.maxResults
  });

  return { ok: true, suggestions: suggestions };
}

module.exports = {
  suggestChains,
  operationNodeId
};
