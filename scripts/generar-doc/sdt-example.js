// ============================================================
// Arma el objeto JSON de ejemplo de un SDT (BTI026) para el body
// documentado. Un campo que es colección se envuelve en un objeto
// con el nombre del item (BTISDTELEMNOMIT) como única clave - así
// es como el exposer REST real serializa las listas (ej. contacts
// -> {"contact": [...]}), nunca un array suelto. Mismo criterio
// que el nivel superior (BTI019/BTISRVPARITNOM, ver
// construirJsonParams en v4.js).
// ============================================================

const TIPO_MAP = { C: 'String', N: 'Integer', D: 'Date', B: 'Boolean', F: 'Decimal' };

function valorEjemplo(tipo) {
  const t = (TIPO_MAP[tipo] || tipo || 'String').toLowerCase().split(' ')[0];
  if (t === 'boolean' || t === 'bool') return false;
  if (t === 'date') return '2026-01-01';
  if (t === 'datetime') return '2026-01-01T00:00:00';
  if (t === 'decimal' || t === 'float' || t === 'double') return 0.0;
  if (['integer', 'int', 'long', 'short'].includes(t)) return 0;
  return '';
}

function construirObjeto(sdtNom, sdtCache, visitados = new Set()) {
  if (visitados.has(sdtNom)) return {};
  visitados.add(sdtNom);
  const campos = sdtCache.get(sdtNom);
  if (!campos) return {};
  const obj = {};
  for (const c of campos) {
    const sdtRef = (c.BTISDTELEMSDT && c.BTISDTELEMSDT.trim()) ||
                   (c.BTISDTELEMTIPO && c.BTISDTELEMTIPO.startsWith('Sdt') ? c.BTISDTELEMTIPO.trim() : null);
    const esColeccion = c.BTISDTELEMCAT === 'C';
    const itemNom = (c.BTISDTELEMNOMIT || '').trim();
    if (sdtRef && sdtCache.has(sdtRef)) {
      const nested = construirObjeto(sdtRef, sdtCache, new Set(visitados));
      obj[c.BTISDTELEMNOM] = esColeccion
        ? (itemNom ? { [itemNom]: [nested] } : [nested])
        : nested;
    } else if (esColeccion) {
      obj[c.BTISDTELEMNOM] = itemNom ? { [itemNom]: [] } : [];
    } else {
      obj[c.BTISDTELEMNOM] = valorEjemplo(c.BTISDTELEMTIPO);
    }
  }
  return obj;
}

module.exports = { TIPO_MAP, valorEjemplo, construirObjeto };
