// ============================================================
// Generador de sección "Tipos de Dato Estructurado" para un SDT dado
// Uso:   node generar_sdt.js <NombreSDT>
//        node generar_sdt.js <NombreSDT> <archivo.md>
// Ejemplos:
//   node generar_sdt.js SdtsBTPEWNaturalPerson
//   node generar_sdt.js SdtsBTPEWNaturalPerson PublicPersons/get.md
// ============================================================

require('dotenv').config();
const oracledb = require('oracledb');
const fs = require('fs');

const DB_CONFIG = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

const TIPO_MAP = { C: 'String', N: 'Integer', D: 'Date', B: 'Boolean', F: 'Decimal' };

function capitalizarTipo(tipo) {
  if (!tipo) return 'String';
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

function mapearTipo(tipo, largo, esColeccion) {
  if (esColeccion === 'C') return 'Collection';
  const t = TIPO_MAP[tipo] || capitalizarTipo(tipo);
  if (largo && largo !== '0' && largo !== 0) return `${t} $<(Length: ${largo})>$`;
  return t;
}

function sortSdtFields(rows) {
  return [...rows].sort((a, b) => {
    const nameA = a.BTISDTELEMNOM;
    const nameB = b.BTISDTELEMNOM;
    const nA = nameA.toLowerCase();
    const nB = nameB.toLowerCase();

    if (nA === 'id' && (nB === 'description' || nB === 'descripcion')) return -1;
    if (nB === 'id' && (nA === 'description' || nA === 'descripcion')) return 1;

    if (nameA.endsWith('Id') && nameB.endsWith('Description') &&
        nameA.slice(0, -2) === nameB.slice(0, -11)) return -1;
    if (nameA.endsWith('Description') && nameB.endsWith('Id') &&
        nameA.slice(0, -11) === nameB.slice(0, -2)) return 1;

    return nameA.localeCompare(nameB);
  });
}

function generarTablaSdt(rows) {
  const lines = ['Nombre | Tipo | Comentarios', ':--------- | :----------- | :-----------'];
  for (const r of rows) {
    let tipo;
    const sdtRef = r.BTISDTELEMSDT && r.BTISDTELEMSDT.trim();
    if (sdtRef) {
      tipo = `[${sdtRef}](#${sdtRef.toLowerCase()})`;
    } else if (r.BTISDTELEMTIPO && r.BTISDTELEMTIPO.startsWith('Sdt')) {
      const sdtName = r.BTISDTELEMTIPO.trim();
      tipo = `[${sdtName}](#${sdtName.toLowerCase()})`;
    } else {
      tipo = mapearTipo(r.BTISDTELEMTIPO, r.BTISDTELEMLARGO, r.BTISDTELEMCAT);
    }
    lines.push(`${r.BTISDTELEMNOM} | ${tipo} | ${r.BTISDTELEMDSC ? r.BTISDTELEMDSC.trim() : ''}`);
  }
  return lines.join('\n');
}

async function generarSeccionSdt(sdtRaiz) {
  let conn;
  try {
    conn = await oracledb.getConnection(DB_CONFIG);
  } catch (e) {
    console.error('❌ Error de conexión:', e.message);
    process.exit(1);
  }

  const sdtCache = new Map();

  async function fetchSdtCache(sdtNomDB, visitados = new Set()) {
    if (visitados.has(sdtNomDB) || sdtCache.has(sdtNomDB)) return;
    visitados.add(sdtNomDB);
    const r26 = await conn.execute(
      `SELECT BTISDTELEMNOM, BTISDTELEMTIPO, BTISDTELEMLARGO, BTISDTELEMCAT, BTISDTELEMDSC, BTISDTELEMSDT
       FROM BTI026 WHERE BTISDTNOM = :1 ORDER BY BTISDTELEMNOM`,
      [sdtNomDB],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (r26.rows.Length === 0) return;
    sdtCache.set(sdtNomDB, sortSdtFields(r26.rows));
    for (const campo of r26.rows) {
      const nestedSdt = (campo.BTISDTELEMSDT && campo.BTISDTELEMSDT.trim()) ||
                        (campo.BTISDTELEMTIPO && campo.BTISDTELEMTIPO.startsWith('Sdt') ? campo.BTISDTELEMTIPO.trim() : null);
      if (nestedSdt) await fetchSdtCache(nestedSdt, visitados);
    }
  }

  let sdtSection = '';

  async function procesarSdt(sdtNomDB, procesados = new Set()) {
    if (procesados.has(sdtNomDB)) return;
    procesados.add(sdtNomDB);
    await fetchSdtCache(sdtNomDB);
    const rows = sdtCache.get(sdtNomDB);
    if (!rows || rows.Length === 0) {
      console.error(`⚠️  SDT '${sdtNomDB}' no encontrado en BTI026`);
      return;
    }
    const tabla = generarTablaSdt(rows);
    sdtSection += `
::: details ${sdtNomDB}

### ${sdtNomDB}

::: center
Los campos del tipo de dato estructurado ${sdtNomDB} son los siguientes:

${tabla}
:::
`;
    for (const campo of rows) {
      const nestedSdt = (campo.BTISDTELEMSDT && campo.BTISDTELEMSDT.trim()) ||
                        (campo.BTISDTELEMTIPO && campo.BTISDTELEMTIPO.startsWith('Sdt') ? campo.BTISDTELEMTIPO.trim() : null);
      if (nestedSdt) await procesarSdt(nestedSdt, procesados);
    }
  }

  try {
    await procesarSdt(sdtRaiz);
  } finally {
    await conn.close();
  }

  if (!sdtSection.trim()) return null;

  return `\n## **Tipos de Dato Estructurado**\n\n<!-- ABRE SDT -->\n${sdtSection.trim()}\n<!-- CIERRA SDT -->\n`;
}

(async () => {
  const [,, sdtNom, archivoMd] = process.argv;

  if (!sdtNom) {
    console.log('Uso:');
    console.log('  node generar_sdt.js <NombreSDT>');
    console.log('  node generar_sdt.js <NombreSDT> <archivo.md>');
    console.log('Ejemplos:');
    console.log('  node generar_sdt.js SdtsBTPEWNaturalPerson');
    console.log('  node generar_sdt.js SdtsBTPEWNaturalPerson PublicPersons/get.md');
    process.exit(1);
  }

  console.error(`🔍 Consultando SDT: ${sdtNom}...`);
  const seccion = await generarSeccionSdt(sdtNom);

  if (!seccion) {
    console.error(`❌ No se encontró el SDT '${sdtNom}' en BTI026`);
    process.exit(1);
  }

  if (archivoMd) {
    if (!fs.existsSync(archivoMd)) {
      console.error(`❌ Archivo no encontrado: ${archivoMd}`);
      process.exit(1);
    }
    let contenido = fs.readFileSync(archivoMd, 'utf8');
    if (contenido.includes('## **Tipos de Dato Estructurado**')) {
      contenido = contenido.replace(
        /\n## \*\*Tipos de Dato Estructurado\*\*[\s\S]*/,
        seccion
      );
      console.error(`✏️  Sección SDT reemplazada en: ${archivoMd}`);
    } else {
      contenido = contenido.trimEnd() + seccion;
      console.error(`✅ Sección SDT agregada a: ${archivoMd}`);
    }
    fs.writeFileSync(archivoMd, contenido, 'utf8');
  } else {
    process.stdout.write(seccion);
  }
})();
