// ============================================================
// Recorte del verbo implícito en el nombre de método (get/update/
// modify/delete/fetch) para mostrar un nombre más corto en la
// documentación generada. El tipo de operación ya se infiere via
// inferirMetodoHttp(), así que repetirlo en el nombre es redundante.
// Usado por v3.js y v4.js (SOAP y REST respectivamente).
// ============================================================

const METHOD_PREFIXES = ['update', 'modify', 'delete', 'fetch', 'get'];

// Solo recorta si el prefijo coincide y el resto arranca con mayúscula
// (limite real de camelCase, ej. "getAddress" -> "Address"). Evita
// falsos positivos como "getter" (sin límite de palabra después de "get").
function stripMethodPrefix(metodo) {
  for (const prefix of METHOD_PREFIXES) {
    if (
      metodo.length > prefix.length &&
      metodo.slice(0, prefix.length).toLowerCase() === prefix &&
      /^[A-Z]/.test(metodo[prefix.length])
    ) {
      return metodo.slice(prefix.length);
    }
  }
  return metodo;
}

// Separa camelCase en palabras sin partir siglas (GUID, no G U I D).
function splitCamelWords(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}

// Título para el front-matter del .md: getBranches -> "Branches".
function tituloDesdeMetodo(metodo) {
  const resto = splitCamelWords(stripMethodPrefix(metodo)).trim();
  return resto.replace(/^[a-z]/, c => c.toUpperCase());
}

// Nombre corto en minúsculas para "Nombre publicación" / endpoint:
// getAddress -> "address", getGUID -> "guid" (sigla completa, no "gUID").
function nombreCortoMetodo(metodo) {
  const resto = stripMethodPrefix(metodo);
  if (resto === metodo) return metodo;
  if (/^[A-Z]+$/.test(resto)) return resto.toLowerCase();
  return resto.charAt(0).toLowerCase() + resto.slice(1);
}

module.exports = { METHOD_PREFIXES, stripMethodPrefix, tituloDesdeMetodo, nombreCortoMetodo };
