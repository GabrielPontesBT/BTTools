'use strict';

const { normalizeType } = require('./variable-linker');

/**
 * Valida un valor generado antes de dejarlo en la request final.
 */
function validateGeneratedValue(inputDescriptor, value) {
  if (value === undefined || value === null || value === '') {
    return { ok: false, reason: 'Generated value is empty' };
  }

  var normalizedType = normalizeType(inputDescriptor && inputDescriptor.type);
  if (normalizedType === 'integer' && !isFiniteNumber(value, true)) {
    return { ok: false, reason: 'Expected integer value' };
  }
  if (normalizedType === 'number' && !isFiniteNumber(value, false)) {
    return { ok: false, reason: 'Expected numeric value' };
  }
  if (normalizedType === 'boolean' && typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
    return { ok: false, reason: 'Expected boolean value' };
  }
  if (normalizedType === 'date' && !/^\d{4}-\d{2}-\d{2}/.test(String(value))) {
    return { ok: false, reason: 'Expected ISO-like date value' };
  }

  if (Array.isArray(inputDescriptor && inputDescriptor.enumValues) && inputDescriptor.enumValues.length) {
    var asString = String(value);
    var allowed = inputDescriptor.enumValues.map(function(entry) { return String(entry); });
    if (allowed.indexOf(asString) < 0) {
      return { ok: false, reason: 'Generated value is not part of enum values' };
    }
  }

  return { ok: true, value: value };
}

/**
 * Revisa si un dato es numérico y opcionalmente entero.
 */
function isFiniteNumber(value, mustBeInteger) {
  if (typeof value === 'number') {
    return Number.isFinite(value) && (!mustBeInteger || Number.isInteger(value));
  }
  if (String(value).trim() === '') return false;
  var cast = Number(value);
  return Number.isFinite(cast) && (!mustBeInteger || Number.isInteger(cast));
}

module.exports = {
  validateGeneratedValue
};
