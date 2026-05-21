require('dotenv').config();
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    trustServerCertificate: true,
    encrypt: false,
  },
};

const BTPARTNERS_DIR = path.join(__dirname, 'BTPARTNERS');

const METODOS_ACTIVOS = new Set([
  'ObtenerTiposDePartner',
  'ObtenerNiveles',
  'CrearPartner',
  'ActualizarPartner',
  'EliminarPartner',
  'CrearPuntoVenta',
  'ActualizarPuntoVenta',
  'EliminarPuntoVenta',
  'CrearVendedor',
  'ActualizarVendedor',
  'EliminarVendedor',
]);

async function main() {
  let pool;
  try {
    pool = await sql.connect(config);

    const result = await pool.request().query(`
      SELECT BTIMtdNom, BTIMtdPgmNom
      FROM BTI014
      WHERE BTINom = 'BTSERVICES'
        AND BTIMtdPgmNom LIKE 'rbtpn%'
    `);

    const programaMap = {};
    for (const row of result.recordset) {
      programaMap[row.BTIMtdNom] = row.BTIMtdPgmNom.toUpperCase();
    }

    console.log(`Programas cargados desde BD: ${Object.keys(programaMap).length}`);

    const mdFiles = fs.readdirSync(BTPARTNERS_DIR)
      .filter(f => f.endsWith('.md'))
      .filter(f => METODOS_ACTIVOS.has(f.replace('.md', '')));
    let updated = 0;
    let notFound = [];

    for (const file of mdFiles) {
      const metodNom = file.replace('.md', '');
      const programa = programaMap[metodNom];

      const filePath = path.join(BTPARTNERS_DIR, file);
      let content = fs.readFileSync(filePath, 'utf8');

      if (programa) {
        const newContent = content.replace(
          /\*\*Programa:\*\* .+/,
          `**Programa:** ${programa}`
        );
        if (newContent !== content) {
          fs.writeFileSync(filePath, newContent, 'utf8');
          console.log(`✔ ${file} -> ${programa}`);
          updated++;
        } else {
          console.log(`~ ${file} (sin cambios)`);
        }
      } else {
        notFound.push(`${file} (método: ${metodNom})`);
      }
    }

    console.log(`\nActualizados: ${updated}/${mdFiles.length}`);
    if (notFound.length > 0) {
      console.log(`\nSin programa en BD:`);
      notFound.forEach(f => console.log(`  - ${f}`));
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (pool) await pool.close();
  }
}

main();
