// ============================================================
// Convierte el formato "sg_" (generar-scripts, usado por
// /sg/api/validate) al formato de columnas Oracle que consume
// generarMd (scripts/generar-doc/v4.js) via su parametro
// `cachedData` - asi la generacion de doc no repite una consulta
// a la BD ya hecha durante la validacion previa.
// ============================================================

function sgToOracleBti014(detail) {
  return { BTIMTDDSC: detail.dsc || '', BTIMTDPGMNOM: detail.pgmnom || '' };
}

function sgToOracleBti019(params) {
  return params.map(p => ({
    BTISRVPARNOM:  p.nom    || '',
    BTISRVVARTIPO: p.tipo   || '',
    BTISRVPARDIR:  p.dir    || 'I',
    BTISRVPARDSC:  p.dsc    || '',
    BTISRVPARLARGO: p.largo || '0',
    BTISRVPARDECI:  p.deci  || '0',
    BTISRVCATIT:   p.catit  || 'B',
    BTISRVPARITTIPO: p.ittipo || '',
    BTISRVPARITNOM:  p.itnom  || '',
  }));
}

function sgToOracleBti026(sdts) {
  const result = {};
  for (const sdt of sdts) {
    result[sdt.nom] = (sdt.bti026 || []).map(f => ({
      BTISDTELEMNOM:   f.elemnom   || '',
      BTISDTELEMTIPO:  f.elemtipo  || '',
      BTISDTELEMLARGO: f.elemlargo || '0',
      BTISDTELEMDECI:  f.elemdeci  || '0',
      BTISDTELEMCAT:   f.elemcat   || '',
      BTISDTELEMDSC:   f.elemdsc   || '',
      BTISDTELEMSDT:   f.elemsdt   || '',
      // Nombre del item cuando el campo es coleccion (BTISDTELEMCAT==='C').
      // sg_queryBti026 ya lo trae como f.nomit - faltaba copiarlo aca, asi
      // que se perdia al pasar por esta cache y el generador de doc volvia
      // a caer al array suelto / nombre de campo pese a tener el fix
      // correcto en construirObjeto/nombreVisibleCampo, porque nunca veia
      // el dato (ver scripts/generar-doc/sdt-example.js y sdt-display-name.js).
      BTISDTELEMNOMIT: f.nomit     || '',
    }));
  }
  return result;
}

module.exports = { sgToOracleBti014, sgToOracleBti019, sgToOracleBti026 };
