// ============================================================
// Generador masivo de archivos .md para documentacion Bantotal V4
// Uso: node generar_todos.js <Servicio> <Carpeta>
// Ejemplo: node generar_todos.js PublicGeneral "PUBLIC GENERAL V4"
// ============================================================

const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');
const { generarMd } = require('./generar_md.js');

const DB_CONFIG = {
  user: 'btdesav23',
  password: 'Bantotal$2020',
  connectString: '10.0.0.4:1521/btv4db'
};

async function generarTodos(servicio, carpeta) {
  // Crear carpeta si no existe
  if (!fs.existsSync(carpeta)) {
    fs.mkdirSync(carpeta, { recursive: true });
  }

  let conn;
  try {
    conn = await oracledb.getConnection(DB_CONFIG);
    console.log('✅ Conectado a Oracle');
  } catch (e) {
    console.error('❌ Error de conexión:', e.message);
    return;
  }

  try {
    const result = await conn.execute(
      `SELECT BTIMTDNOM FROM BTI014 WHERE BTISRVNOM = :1 ORDER BY BTIMTDNOM`,
      [servicio],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      console.error(`❌ No se encontró el servicio '${servicio}' en BTI014`);
      return;
    }

    console.log(`📋 Se encontraron ${result.rows.length} métodos para ${servicio}`);
    console.log('─'.repeat(50));

    let ok = 0;
    let error = 0;

    for (const row of result.rows) {
      const metodo = row.BTIMTDNOM;
      try {
        console.log(`⚙️  Generando: ${servicio}.${metodo}...`);
        await generarMd(servicio, metodo, carpeta);
        ok++;
      } catch (e) {
        console.error(`❌ Error generando ${metodo}: ${e.message}`);
        error++;
      }
    }

    console.log('─'.repeat(50));
    console.log(`✅ Generados: ${ok} | ❌ Errores: ${error}`);

  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await conn.close();
  }
}

const [,, servicio, carpeta] = process.argv;
if (!servicio || !carpeta) {
  console.log('Uso: node generar_todos.js <Servicio> <Carpeta>');
  console.log('Ejemplo: node generar_todos.js PublicGeneral "PUBLIC GENERAL V4"');
  process.exit(1);
}

generarTodos(servicio, carpeta);
