// ============================================================
// Adapta valores reales capturados en un .md de formato viejo
// (ver existing-examples.js, formato 'v4-legado') a la estructura
// actual: nombres de campo case-insensitive (el viejo formato a
// veces usaba PascalCase donde el esquema actual usa camelCase) y
// colecciones re-envueltas con el nombre de item actual en vez de
// como estuvieran envueltas antes (bare array, o con el nombre
// interno de la SDT como wrapper - ambos formatos previos).
// ============================================================

function esSdt(tipo) {
  return !!tipo && tipo.trim().startsWith('Sdt');
}

// Normaliza una fila de BTI026 (campo dentro de un SDT) al shape comun
// {name, esColeccion, itemName, sdtRef} que usa adaptarValorSdt.
function normalizarCampoBti026(row) {
  const sdtRef = (row.BTISDTELEMSDT && row.BTISDTELEMSDT.trim()) ||
                 (esSdt(row.BTISDTELEMTIPO) ? row.BTISDTELEMTIPO.trim() : null);
  return {
    name: row.BTISDTELEMNOM,
    esColeccion: (row.BTISDTELEMCAT || '').trim() === 'C',
    itemName: (row.BTISDTELEMNOMIT || '').trim(),
    sdtRef,
  };
}

// Normaliza una fila de BTI019 (parametro de entrada/salida del metodo)
// al mismo shape comun.
function normalizarParamBti019(row) {
  const parittipo = (row.BTISRVPARITTIPO || '').trim();
  const vartipo = (row.BTISRVVARTIPO || '').trim();
  if (esSdt(parittipo)) {
    return { name: row.BTISRVPARNOM, esColeccion: true, itemName: (row.BTISRVPARITNOM || '').trim(), sdtRef: parittipo };
  }
  if (esSdt(vartipo)) {
    return { name: row.BTISRVPARNOM, esColeccion: false, itemName: '', sdtRef: vartipo };
  }
  return { name: row.BTISRVPARNOM, esColeccion: false, itemName: '', sdtRef: null };
}

// Busca el valor de `nombre` dentro de un objeto plano sin importar
// mayusculas/minusculas. undefined si no existe o `obj` no es un objeto.
function buscarValorCI(obj, nombre) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined;
  const clave = nombre.toLowerCase();
  for (const k of Object.keys(obj)) {
    if (k.toLowerCase() === clave) return obj[k];
  }
  return undefined;
}

// Extrae el array de items de una coleccion sin importar como la envolvia
// el formato viejo: array suelto, {nombreDeItemViejo:[...]}, o el nombre
// interno de la SDT como wrapper (el formato mas viejo de todos).
function extraerArrayColeccion(valor) {
  if (Array.isArray(valor)) return valor;
  if (valor && typeof valor === 'object') {
    for (const v of Object.values(valor)) {
      if (Array.isArray(v)) return v;
    }
  }
  return null;
}

function adaptarColeccion(valorViejo, campo, sdtCache) {
  const items = extraerArrayColeccion(valorViejo);
  if (!items) return undefined;
  const itemsAdaptados = campo.sdtRef ? items.map(it => adaptarValorSdt(it, campo.sdtRef, sdtCache)) : items;
  return campo.itemName ? { [campo.itemName]: itemsAdaptados } : itemsAdaptados;
}

// Adapta el valor real de UN campo anidado (BTI026) dentro de un SDT.
// Sin metadata para `sdtNomDB` en `sdtCache`, devuelve el valor tal cual:
// no hay con que adaptarlo, mejor preservarlo a perderlo.
function adaptarValorSdt(valorViejo, sdtNomDB, sdtCache) {
  if (valorViejo == null) return valorViejo;
  const campos = sdtCache.get(sdtNomDB);
  if (!campos) return valorViejo;
  const resultado = {};
  for (const row of campos) {
    const campo = normalizarCampoBti026(row);
    const valorCampoViejo = buscarValorCI(valorViejo, campo.name);
    if (valorCampoViejo === undefined) continue;
    if (campo.esColeccion) {
      const adaptado = adaptarColeccion(valorCampoViejo, campo, sdtCache);
      if (adaptado !== undefined) resultado[campo.name] = adaptado;
    } else if (campo.sdtRef) {
      resultado[campo.name] = adaptarValorSdt(valorCampoViejo, campo.sdtRef, sdtCache);
    } else {
      resultado[campo.name] = valorCampoViejo;
    }
  }
  return resultado;
}

// Adapta los valores reales de nivel superior (entrada o salida de BTI019)
// migrados de un .md en formato viejo a los nombres/estructura actuales.
function adaptarValoresTopLevel(valoresViejo, paramsBti019, sdtCache) {
  const resultado = {};
  for (const row of paramsBti019) {
    const campo = normalizarParamBti019(row);
    const valorViejo = buscarValorCI(valoresViejo, campo.name);
    if (valorViejo === undefined) continue;
    if (campo.esColeccion) {
      const adaptado = adaptarColeccion(valorViejo, campo, sdtCache);
      if (adaptado !== undefined) resultado[campo.name] = adaptado;
    } else if (campo.sdtRef) {
      resultado[campo.name] = adaptarValorSdt(valorViejo, campo.sdtRef, sdtCache);
    } else {
      resultado[campo.name] = valorViejo;
    }
  }
  return resultado;
}

module.exports = { adaptarValoresTopLevel, adaptarValorSdt, buscarValorCI, extraerArrayColeccion };
