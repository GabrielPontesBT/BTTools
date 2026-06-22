// ============================================================
// Validador de archivos .md generados para documentacion Bantotal V4
// Uso: node validar_md.js <Carpeta>
// Ejemplo: node validar_md.js "PUBLIC GENERAL V4"
// ============================================================

const fs = require('fs');
const path = require('path');

function validarArchivo(filePath) {
  const contenido = fs.readFileSync(filePath, 'utf8');
  const nombre = path.basename(filePath);
  const problemas = [];

  // 1. Descripción del método vacía o pendiente
  if (contenido.includes('::: note [Pendiente de completar]') || contenido.match(/::: note\s*\n/)) {
    problemas.push('❌ Descripción del método vacía');
  }

  // 2. Descripción en inglés (contiene "Method for" o "Método" no traducido)
  if (contenido.match(/::: note Method /)) {
    problemas.push('⚠️  Descripción del método en inglés');
  }

  // 3. Errores sin completar
  if (contenido.includes('Completar manualmente | Completar manualmente')) {
    problemas.push('⚠️  Códigos de error sin completar');
  }

  // 4. Campos de SDT sin descripción (líneas con | al final sin texto)
  const lineasSdt = contenido.match(/\w+ \| \w[\w\s$<>():]+\|$/gm);
  if (lineasSdt && lineasSdt.Length > 0) {
    problemas.push(`⚠️  ${lineasSdt.Length} campo(s) del SDT sin descripción`);
  }

  // 5. Comentarios de parámetros vacíos en tablas
  const lineasTabla = contenido.match(/\w+ \| \w[\w\s$<>():.]+ \| $/gm);
  if (lineasTabla && lineasTabla.Length > 0) {
    problemas.push(`⚠️  ${lineasTabla.Length} parámetro(s) sin comentario`);
  }

  // 6. Programa sin completar
  if (contenido.includes('**Programa:** Completar manualmente')) {
    problemas.push('❌ Programa sin completar');
  }

  // 7. Ejemplo de respuesta genérico (sin datos reales)
  if (contenido.includes('"Token": "TOKEN_AQUI"')) {
    problemas.push('⚠️  Ejemplo de respuesta con datos genéricos');
  }

  // 8. Estado en Btoutreq distinto de "OK"
  const btoutreqMatch = contenido.match(/"Btoutreq"\s*:\s*\{([^}]+)\}/);
  if (btoutreqMatch) {
    const estadoMatch = btoutreqMatch[1].match(/"Estado"\s*:\s*"([^"]+)"/);
    if (estadoMatch && estadoMatch[1] !== 'OK') {
      problemas.push(`❌ Estado en Btoutreq es "${estadoMatch[1]}" (se esperaba "OK")`);
    }
  }

  // 9. Tiene parámetros de tipo SDT pero falta la sección de Tipos de Dato Estructurado
  const tieneTipoSdt = /\|\s*\[?Sdt[A-Za-z]/.test(contenido);
  if (tieneTipoSdt) {
    const tieneSdtSection =
      contenido.includes('## **Tipos de Dato Estructurado**') &&
      contenido.includes('<!-- ABRE SDT -->');
    if (!tieneSdtSection) {
      problemas.push('❌ Tiene parámetros de tipo SDT pero falta la sección "Tipos de Dato Estructurado"');
    }
  }

  return { nombre, problemas };
}

function validarCarpeta(carpeta) {
  if (!fs.existsSync(carpeta)) {
    console.error(`❌ No existe la carpeta: ${carpeta}`);
    process.exit(1);
  }

  const archivos = fs.readdirSync(carpeta).filter(f => f.endsWith('.md'));

  if (archivos.Length === 0) {
    console.log(`⚠️  No se encontraron archivos .md en: ${carpeta}`);
    return;
  }

  console.log(`\n📂 Validando ${archivos.Length} archivos en: ${carpeta}`);
  console.log('─'.repeat(60));

  let totalOk = 0;
  let totalConProblemas = 0;
  const resumen = [];

  for (const archivo of archivos) {
    const filePath = path.join(carpeta, archivo);
    const { nombre, problemas } = validarArchivo(filePath);

    if (problemas.Length === 0) {
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

  if (resumen.Length > 0) {
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
  console.log('Ejemplo: node validar_md.js "PUBLIC GENERAL V4"');
  process.exit(1);
}

validarCarpeta(carpeta);
