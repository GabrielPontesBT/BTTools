'use strict';

const { tokenizeFieldName } = require('../request-data-resolver/field-normalizer');

/**
 * Tokens que identifican operaciones potencialmente destructivas o irreversibles.
 * Vive acá para no repartir esta lista en distintos componentes.
 */
const DESTRUCTIVE_TOKENS = [
  'delete', 'remove', 'cancel', 'close', 'reverse', 'revert', 'void',
  'terminate', 'discard', 'eliminar', 'cancelar', 'cerrar', 'anular', 'revertir'
];

/**
 * Indica si una operacion del catalogo es potencialmente destructiva.
 * Se apoya en el mismo tokenizador que usa el matcher, para no duplicar reglas de texto.
 */
function isDestructiveOperation(operation) {
  var httpMethod = String((operation && operation.httpMethod) || '').toUpperCase();
  if (httpMethod === 'DELETE') {
    return { isDestructive: true, reason: 'Metodo HTTP DELETE' };
  }

  var tokens = tokenizeFieldName((operation && operation.method) || '');
  for (var i = 0; i < tokens.length; i++) {
    if (DESTRUCTIVE_TOKENS.indexOf(tokens[i]) >= 0) {
      return { isDestructive: true, reason: 'El nombre del metodo sugiere una accion irreversible (' + tokens[i] + ')' };
    }
  }

  return { isDestructive: false, reason: '' };
}

module.exports = {
  DESTRUCTIVE_TOKENS,
  isDestructiveOperation
};
