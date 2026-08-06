'use strict';

/**
 * Enum central con los orígenes posibles de un valor resuelto.
 * Se exporta por separado para que tests, UI y backend hablen el mismo idioma.
 */
const FIELD_VALUE_SOURCES = {
  EXPLICIT_MAPPING: 'explicit-mapping',
  LINKED_RESPONSE: 'linked-response',
  MANUAL: 'manual',
  FIXED: 'fixed',
  ENUM: 'enum',
  GENERATED: 'generated',
  UNRESOLVED: 'unresolved'
};

module.exports = {
  FIELD_VALUE_SOURCES
};
