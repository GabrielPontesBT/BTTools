// ============================================================
// Generador masivo de archivos .md para documentacion Bantotal V4
// Uso: node generar_todos.js <Servicio> <Carpeta>
// Ejemplo: node generar_todos.js PublicGeneral "PUBLIC GENERAL V4"
// ============================================================

require('dotenv').config();
const oracledb = require('oracledb');
const fs = require('fs');
const { generarMd } = require('./v4.js');

const toFolderName = s => s
  .replace(/^Public/, '')
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
  .replace(/([a-z\d])([A-Z])/g, '$1-$2');

const DB_CONFIG = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

async function generarTodos(servicio, carpeta) {
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

    if (result.rows.Length === 0) {
      console.error(`❌ No se encontró el servicio '${servicio}' en BTI014`);
      return;
    }

    console.log(`📋 Se encontraron ${result.rows.Length} métodos para ${servicio}`);
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
if (!servicio) {
  console.log('Uso: node generar_todos.js <Servicio> [Carpeta]');
  console.log('Ejemplo: node generar_todos.js PublicSavingAccounts');
  process.exit(1);
}

const dir = carpeta || toFolderName(servicio);
generarTodos(servicio, dir);
