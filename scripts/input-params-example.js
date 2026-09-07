// ============================================================
// Arma el JSON de ejemplo que precarga el textarea de un parametro
// complejo en el wizard (ver /api/input-params en setup.js). Un
// campo que es coleccion se envuelve en un objeto con el nombre de
// su item como unica clave (ej. occupations -> {"occupation":[...]}),
// nunca un array suelto - asi es como el exposer REST real serializa
// las listas. Mismo criterio que scripts/generar-doc/sdt-example.js,
// pero sobre filas ya mapeadas a {name, type, cat, sdt, itemName}
// (ver mapBti026Row) en vez de las columnas BTISDTELEM* crudas.
// ============================================================

function valorEjemploSetup(tipo) {
  const t = (tipo || '').toUpperCase();
  if (t === 'N') return 0;
  if (t === 'D') return '2026-01-01';
  if (t === 'B') return false;
  if (t === 'F') return 0.0;
  return '';
}

// Sin nombre de item conocido, cae a array suelto.
function wrapColeccion(valor, itemName) {
  return itemName ? { [itemName]: [valor] } : [valor];
}

function mapBti026Row(row) {
  const sdt = (row.BTISDTELEMSDT && row.BTISDTELEMSDT.trim()) ||
              (row.BTISDTELEMTIPO && row.BTISDTELEMTIPO.trim().startsWith('Sdt') ? row.BTISDTELEMTIPO.trim() : '');
  return { name: (row.BTISDTELEMNOM || '').trim(), type: (row.BTISDTELEMTIPO || '').trim(),
           cat: (row.BTISDTELEMCAT || '').trim(), sdt, itemName: (row.BTISDTELEMNOMIT || '').trim() };
}

async function buildSdtObj(queryFn, sdtType, cache, visited) {
  if (!sdtType || visited.has(sdtType)) return {};
  const vis = new Set(visited);
  vis.add(sdtType);
  if (!cache.has(sdtType)) cache.set(sdtType, await queryFn(sdtType));
  const fields = cache.get(sdtType);
  const obj = {};
  for (const f of fields) {
    if (f.sdt) {
      const nested = await buildSdtObj(queryFn, f.sdt, cache, vis);
      obj[f.name] = f.cat === 'C' ? wrapColeccion(nested, f.itemName) : nested;
    } else if (f.cat === 'C') {
      obj[f.name] = f.itemName ? { [f.itemName]: [] } : [];
    } else {
      obj[f.name] = valorEjemploSetup(f.type);
    }
  }
  return obj;
}

module.exports = { valorEjemploSetup, wrapColeccion, mapBti026Row, buildSdtObj };
