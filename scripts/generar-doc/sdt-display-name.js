// ============================================================
// Nombre "visible" para un campo de tipo SDT o colección de SDT:
// el nombre interno del SDT (BTISRVPARITTIPO/BTISRVVARTIPO,
// BTISDTELEMSDT/BTISDTELEMTIPO) es información interna y no debe
// aparecer en la documentación. En su lugar:
// - Colección de SDT (BTISRVPARITTIPO es un SDT): se muestra el
//   nombre del item (BTISRVPARITNOM), o el del parámetro si no
//   hay item nombrado.
// - SDT simple (BTISRVVARTIPO es un SDT, sin item): se muestra el
//   nombre del parámetro.
// - Campo anidado dentro de un SDT (BTI026) que a su vez es SDT o
//   colección: no tiene concepto de "item" propio en el schema,
//   se muestra el nombre del campo.
// El nombre visible se usa tanto para el link en la columna Tipo
// como para el título de la sección de detalle del SDT, así el
// anchor siempre coincide.
// ============================================================

function esSdt(tipo) {
  return !!tipo && tipo.trim().startsWith('Sdt');
}

// Para una fila de parámetro de servicio (BTI019: entrada/salida).
function nombreVisibleParam(row) {
  const parittipo = (row.BTISRVPARITTIPO || '').trim();
  const vartipo = (row.BTISRVVARTIPO || '').trim();

  if (esSdt(parittipo)) {
    const itemNom = (row.BTISRVPARITNOM || '').trim();
    return { esSdt: true, esColeccion: true, nombre: itemNom || row.BTISRVPARNOM, sdtNomDB: parittipo };
  }
  if (esSdt(vartipo)) {
    return { esSdt: true, esColeccion: false, nombre: row.BTISRVPARNOM, sdtNomDB: vartipo };
  }
  return { esSdt: false };
}

// Para una fila de campo dentro de un SDT (BTI026), que puede a su vez
// referenciar otro SDT (anidado, simple o colección).
function nombreVisibleCampo(row) {
  const sdtRef = (row.BTISDTELEMSDT || '').trim();
  const tipo = (row.BTISDTELEMTIPO || '').trim();

  if (sdtRef) return { esSdt: true, nombre: row.BTISDTELEMNOM, sdtNomDB: sdtRef };
  if (esSdt(tipo)) return { esSdt: true, nombre: row.BTISDTELEMNOM, sdtNomDB: tipo };
  return { esSdt: false };
}

module.exports = { nombreVisibleParam, nombreVisibleCampo };
