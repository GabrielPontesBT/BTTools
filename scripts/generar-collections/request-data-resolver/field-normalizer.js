'use strict';

/**
 * Elimina acentos y diacríticos para mejorar comparaciones español/inglés.
 */
function stripAccents(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Convierte cualquier nombre a una forma comparable y estable.
 */
function normalizeFieldName(value) {
  return tokenizeFieldName(value).join(' ');
}

/**
 * Parte un nombre en tokens interpretables soportando camelCase, snake_case,
 * kebab-case, espacios y textos mixtos en español/inglés.
 */
function tokenizeFieldName(value) {
  return stripAccents(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Devuelve el último segmento semántico de una ruta para comparaciones rápidas.
 */
function lastPathSegment(pathLabel) {
  var parts = String(pathLabel || '').split('.').filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '';
}

module.exports = {
  stripAccents,
  normalizeFieldName,
  tokenizeFieldName,
  lastPathSegment
};
