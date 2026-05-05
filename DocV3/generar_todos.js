// ============================================================
// Generador masivo de archivos .md para documentacion Bantotal V3
// Uso: node generar_todos.js <Servicio> <Carpeta>
// Ejemplo: node generar_todos.js PublicGeneral "PUBLIC GENERAL"
// ============================================================

const sql = require('mssql');
const fs = require('fs');
const { generarMd } = require('./generar_md.js');

// TODO: completar con los datos reales del servidor V3
const DB_CONFIG = {
  server: 'SQLSERVER1',
  port: 1433,
  database: 'ProductoGx16',
  user: 'productogx16',
  password: 'prodGx16',
  options: {
    trustServerCertificate: true,
    encrypt: false
  }
};

async function generarTodos(servicio, carpeta) {
  if (!fs.existsSync(carpeta)) {
    fs.mkdirSync(carpeta, { recursive: true });
  }

  // Abre conexion solo para listar los metodos, luego cada generarMd abre la suya
  const pool = new sql.ConnectionPool(DB_CONFIG);
  try {
    await pool.connect();
    console.log('✅ Conectado a SQL Server');
  } catch (e) {
    console.error('❌ Error de conexión:', e.message);
    return;
  }

  let metodos = [];
  try {
    const result = await pool.request()
      .input('servicio', sql.VarChar(100), servicio)
      .query('SELECT BTIMTDNOM FROM BTI014 WHERE BTISRVNOM = @servicio ORDER BY BTIMTDNOM');

    if (result.recordset.length === 0) {
      console.error(`❌ No se encontró el servicio '${servicio}' en BTI014`);
      await pool.close();
      return;
    }

    metodos = result.recordset;
    console.log(`📋 Se encontraron ${metodos.length} métodos para ${servicio}`);
    console.log('─'.repeat(50));
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await pool.close();
  }

  let ok = 0;
  let error = 0;

  for (const row of metodos) {
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
}

const [,, servicio, carpeta] = process.argv;
if (!servicio || !carpeta) {
  console.log('Uso: node generar_todos.js <Servicio> <Carpeta>');
  console.log('Ejemplo: node generar_todos.js PublicGeneral "PUBLIC GENERAL"');
  process.exit(1);
}

generarTodos(servicio, carpeta);
