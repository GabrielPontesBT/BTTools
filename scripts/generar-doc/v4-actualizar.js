// ============================================================
// Actualiza la columna "Comentarios" en un MD ya generado
// consultando las descripciones actuales en BTI026 (SDTs) y
// BTI019 (parámetros de entrada/salida).
//
// Uso:
//   node actualizar_comentarios.js <archivo.md>
//   node actualizar_comentarios.js <archivo.md> --dry-run
// ============================================================

require('dotenv').config();
const oracledb = require('oracledb');
const fs = require('fs');

const DB_CONFIG = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

// ---------- parseo de tablas MD ----------

// Actualiza la columna Comentarios de una tabla markdown.
// descMap: Map<nombreCampo (lowercase), descripcion>
// Devuelve el bloque modificado y la cantidad de cambios.
function actualizarTablaConDescripciones(bloqueTabla, descMap) {
  const lineas = bloqueTabla.split('\n');
  let cambios = 0;

  const nuevasLineas = lineas.map((linea) => {
    // Saltar encabezados y separadores
    const lineaNorm = linea.replace(/\r$/, '');
    if (lineaNorm.startsWith(':---') || lineaNorm.startsWith('Nombre |')) return lineaNorm;

    // Fila de datos: Nombre | Tipo | Comentarios
    const partes = lineaNorm.split(' | ');
    if (partes.Length < 3) return lineaNorm;

    const nombre = partes[0].trim();
    const nuevaDesc = descMap.get(nombre.toLowerCase());

    if (nuevaDesc !== undefined) {
      const descActual = partes.slice(2).join(' | ').trim();
      if (descActual !== nuevaDesc) {
        cambios++;
        return `${partes[0]} | ${partes[1]} | ${nuevaDesc}`;
      }
    }

    return lineaNorm;
  });

  return { bloque: nuevasLineas.join('\n'), cambios };
}

// ---------- base de datos ----------

async function obtenerDescsSDT(conn, sdtNom) {
  const r = await conn.execute(
    `SELECT BTISDTELEMNOM, BTISDTELEMDSC
     FROM BTI026 WHERE BTISDTNOM = :1`,
    [sdtNom],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const map = new Map();
  for (const row of r.rows) {
    const desc = row.BTISDTELEMDSC ? row.BTISDTELEMDSC.trim() : '';
    map.set(row.BTISDTELEMNOM.toLowerCase(), desc);
  }
  return map;
}

// servicioCompleto: "PublicLoans.addIntercycleMember"
async function obtenerDescsParams(conn, servicioCompleto) {
  const dotIdx = servicioCompleto.lastIndexOf('.');
  if (dotIdx === -1) return { entrada: new Map(), salida: new Map() };
  const srvNom = servicioCompleto.slice(0, dotIdx);
  const mtdNom = servicioCompleto.slice(dotIdx + 1);

  const r = await conn.execute(
    `SELECT BTISRVPARNOM, BTISRVPARDSC, BTISRVPARDIR
     FROM BTI019 WHERE BTISRVNOM = :1 AND BTIMTDNOM = :2
     ORDER BY BTISRVPARPOSI`,
    [srvNom, mtdNom],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const entrada = new Map();
  const salida = new Map();
  for (const row of r.rows) {
    const desc = row.BTISRVPARDSC ? row.BTISRVPARDSC.trim() : '';
    const nombre = row.BTISRVPARNOM ? row.BTISRVPARNOM.trim() : '';
    if (row.BTISRVPARDIR === 'I') entrada.set(nombre.toLowerCase(), desc);
    else if (row.BTISRVPARDIR === 'O' || row.BTISRVPARDIR === 'R') salida.set(nombre.toLowerCase(), desc);
  }
  return { entrada, salida };
}

// ---------- procesado del MD ----------

// Extrae el nombre de la publicación del encabezado del MD.
// Ej: "**Nombre publicación:** PublicTermDeposit.getData" → "PublicTermDeposit.getData"
function extraerServicio(contenido) {
  const m = contenido.match(/\*\*Nombre publicaci[oó]n:\*\*\s*([^\r\n]+)/i);
  return m ? m[1].trim() : null;
}

// Devuelve todos los SDTs declarados en el bloque SDT del MD.
function extraerSDTs(contenido) {
  const sdts = [];
  const re = /^::: details (Sdts?\w+)/gm;
  let m;
  while ((m = re.exec(contenido)) !== null) {
    if (!sdts.includes(m[1])) sdts.push(m[1]);
  }
  return sdts;
}

// Reemplaza la tabla de un SDT específico en el contenido.
function reemplazarTablaSdt(contenido, sdtNom, descMap) {
  const escapado = sdtNom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `(::: details ${escapado}[\\s\\S]*?Los campos del tipo de dato estructurado ${escapado} son los siguientes:\\n\\n)(Nombre \\| Tipo \\| Comentarios\\n[^\\n]+\\n[\\s\\S]*?)(?=:::)`,
    'g'
  );

  let cambiosTotales = 0;
  const nuevoCont = contenido.replace(re, (_, preTabla, tablaBloque) => {
    // Normalizar a LF para el procesado
    const bloqueNorm = tablaBloque.replace(/\r\n/g, '\n');
    const { bloque, cambios } = actualizarTablaConDescripciones(bloqueNorm, descMap);
    cambiosTotales += cambios;
    return preTabla + bloque;
  });

  return { contenido: nuevoCont, cambios: cambiosTotales };
}

// Reemplaza la tabla de Datos de Entrada o Salida en el MD.
function reemplazarTablaParam(contenido, etiqueta, descMap) {
  const escapado = etiqueta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `(@tab ${escapado}\\n\\n)(Nombre \\| Tipo \\| Comentarios\\n[^\\n]+\\n[\\s\\S]*?)(?=@tab|:::)`,
    'g'
  );

  let cambiosTotales = 0;
  const nuevoCont = contenido.replace(re, (_, preTabla, tablaBloque) => {
    const bloqueNorm = tablaBloque.replace(/\r\n/g, '\n');
    const { bloque, cambios } = actualizarTablaConDescripciones(bloqueNorm, descMap);
    cambiosTotales += cambios;
    return preTabla + bloque;
  });

  return { contenido: nuevoCont, cambios: cambiosTotales };
}

// ---------- procesado de un archivo ----------

async function procesarArchivo(conn, archivoMd, dryRun) {
  let contenido = fs.readFileSync(archivoMd, 'utf8');
  contenido = contenido.replace(/\r\n/g, '\n');

  const servicio = extraerServicio(contenido);
  const sdts = extraerSDTs(contenido);

  console.error(`📄 ${archivoMd}`);

  let cambiosTotales = 0;

  // --- Actualizar SDTs ---
  for (const sdtNom of sdts) {
    const descMap = await obtenerDescsSDT(conn, sdtNom);
    if (descMap.size === 0) continue;
    const { contenido: nuevo, cambios } = reemplazarTablaSdt(contenido, sdtNom, descMap);
    contenido = nuevo;
    cambiosTotales += cambios;
    if (cambios > 0) console.error(`  ✏️  ${sdtNom}: ${cambios} campo(s)`);
  }

  // --- Actualizar parámetros de entrada/salida ---
  if (servicio) {
    const { entrada, salida } = await obtenerDescsParams(conn, servicio);

    if (entrada.size > 0) {
      const { contenido: nuevo, cambios } = reemplazarTablaParam(contenido, 'Datos de Entrada', entrada);
      contenido = nuevo;
      cambiosTotales += cambios;
      if (cambios > 0) console.error(`  ✏️  Datos de Entrada: ${cambios} campo(s)`);
    }

    if (salida.size > 0) {
      const { contenido: nuevo, cambios } = reemplazarTablaParam(contenido, 'Datos de Salida', salida);
      contenido = nuevo;
      cambiosTotales += cambios;
      if (cambios > 0) console.error(`  ✏️  Datos de Salida: ${cambios} campo(s)`);
    }
  }

  if (cambiosTotales === 0) {
    console.error(`  ✅ Sin cambios`);
    return 0;
  }

  if (!dryRun) {
    fs.writeFileSync(archivoMd, contenido, 'utf8');
  }

  return cambiosTotales;
}

// Devuelve todos los .md de una carpeta (recursivo)
function listarMds(ruta) {
  const stat = fs.statSync(ruta);
  if (stat.isFile()) return ruta.endsWith('.md') ? [ruta] : [];
  return fs.readdirSync(ruta).flatMap((nombre) =>
    listarMds(`${ruta}/${nombre}`)
  );
}

// ---------- main ----------

(async () => {
  const args = process.argv.slice(2);
  const objetivo = args.find((a) => !a.startsWith('--'));
  const dryRun = args.includes('--dry-run');

  if (!objetivo) {
    console.log('Uso:');
    console.log('  node actualizar_comentarios.js <archivo.md>');
    console.log('  node actualizar_comentarios.js <carpeta/>');
    console.log('  node actualizar_comentarios.js <archivo.md|carpeta/> --dry-run');
    process.exit(1);
  }

  if (!fs.existsSync(objetivo)) {
    console.error(`❌ No encontrado: ${objetivo}`);
    process.exit(1);
  }

  const archivos = listarMds(objetivo);
  if (archivos.Length === 0) {
    console.error('⚠️  No se encontraron archivos .md');
    process.exit(0);
  }

  if (dryRun) console.error('🔎 Modo dry-run — no se escribirá nada\n');

  let conn;
  try {
    conn = await oracledb.getConnection(DB_CONFIG);
  } catch (e) {
    console.error('❌ Error de conexión:', e.message);
    process.exit(1);
  }

  let totalCambios = 0;
  let archivosModificados = 0;

  try {
    for (const archivo of archivos) {
      const cambios = await procesarArchivo(conn, archivo, dryRun);
      if (cambios > 0) {
        totalCambios += cambios;
        archivosModificados++;
      }
    }
  } finally {
    await conn.close();
  }

  const accion = dryRun ? 'se habrían actualizado' : 'actualizados';
  console.error(`\n✅ ${totalCambios} campo(s) ${accion} en ${archivosModificados}/${archivos.Length} archivo(s)`);
})();
