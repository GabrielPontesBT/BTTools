// ============================================================
// Validador de archivos .md generados para documentacion Bantotal V3
// Uso: node validar_md.js <Carpeta>
// Ejemplo: node validar_md.js "PUBLIC GENERAL"
// ============================================================

const fs = require('fs');
const path = require('path');

function validarArchivo(filePath) {
  const contenido = fs.readFileSync(filePath, 'utf8');
  const nombre = path.basename(filePath);
  const problemas = [];

  if (contenido.includes('::: note [Pendiente de completar]') || contenido.match(/::: note\s*\n/)) {
    problemas.push('❌ Descripción del método vacía');
  }

  if (contenido.match(/::: note Method /)) {
    problemas.push('⚠️  Descripción del método en inglés');
  }

  if (contenido.includes('Completar manualmente | Completar manualmente')) {
    problemas.push('⚠️  Códigos de error sin completar');
  }

  const lineasSdt = contenido.match(/\w+ \| \w[\w\s$<>():]+\|$/gm);
  if (lineasSdt && lineasSdt.length > 0) {
    problemas.push(`⚠️  ${lineasSdt.length} campo(s) del SDT sin descripción`);
  }

  const lineasTabla = contenido.match(/\w+ \| \w[\w\s$<>():.]+ \| $/gm);
  if (lineasTabla && lineasTabla.length > 0) {
    problemas.push(`⚠️  ${lineasTabla.length} parámetro(s) sin comentario`);
  }

  if (contenido.includes('**Programa:** Completar manualmente')) {
    problemas.push('❌ Programa sin completar');
  }

  if (contenido.includes('"Token": "TOKEN_AQUI"')) {
    problemas.push('⚠️  Ejemplo de respuesta con datos genéricos');
  }

  return { nombre, problemas };
}

function validarCarpeta(carpeta) {
  if (!fs.existsSync(carpeta)) {
    console.error(`❌ No existe la carpeta: ${carpeta}`);
    process.exit(1);
  }

  const archivos = fs.readdirSync(carpeta).filter(f => f.endsWith('.md'));

  if (archivos.length === 0) {
    console.log(`⚠️  No se encontraron archivos .md en: ${carpeta}`);
    return;
  }

  console.log(`\n📂 Validando ${archivos.length} archivos en: ${carpeta}`);
  console.log('─'.repeat(60));

  let totalOk = 0;
  let totalConProblemas = 0;
  const resumen = [];

  for (const archivo of archivos) {
    const filePath = path.join(carpeta, archivo);
    const { nombre, problemas } = validarArchivo(filePath);

    if (problemas.length === 0) {
      console.log(`✅ ${nombre}`);
      totalOk++;
    } else {
      console.log(`\n📄 ${nombre}`);
      for (const p of problemas) {
        console.log(`   ${p}`);
      }
      totalConProblemas++;
      resumen.push({ nombre, problemas });
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`✅ Sin problemas: ${totalOk} | ⚠️  Con problemas: ${totalConProblemas}`);

  if (resumen.length > 0) {
    console.log('\n📋 RESUMEN DE PENDIENTES:');
    console.log('─'.repeat(60));
    for (const { nombre, problemas } of resumen) {
      console.log(`\n${nombre}:`);
      for (const p of problemas) {
        console.log(`  ${p}`);
      }
    }
  }
}

const [,, carpeta] = process.argv;
if (!carpeta) {
  console.log('Uso: node validar_md.js <Carpeta>');
  console.log('Ejemplo: node validar_md.js "PUBLIC GENERAL"');
  process.exit(1);
}

validarCarpeta(carpeta);
