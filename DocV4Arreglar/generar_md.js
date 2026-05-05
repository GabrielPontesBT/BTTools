// ============================================================
// Generador de archivos .md para documentacion Bantotal V4
// Uso: node generar_md.js PublicCASHManagement getServices
// ============================================================

const oracledb = require('oracledb');
const fs = require('fs');

// ── CONFIGURACION ─────────────────────────────────────────────
const DB_CONFIG = {
  user: 'btdesav23',
  password: 'Bantotal$2020',
  connectString: '10.0.0.4:1521/btv4db'
};

// ── MAPEO DE TIPOS ────────────────────────────────────────────
const TIPO_MAP = { C: 'String', N: 'Integer', D: 'Date', B: 'Boolean', F: 'Decimal' };

// Capitaliza primera letra para tipos de BTI026 (int -> Int, short -> Short, etc.)
function capitalizarTipo(tipo) {
  if (!tipo) return 'String';
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

function mapearTipo(tipo, largo, esColeccion) {
  if (esColeccion === 'C') return 'Collection';
  const t = TIPO_MAP[tipo] || capitalizarTipo(tipo);
  if (largo && largo !== '0' && largo !== 0) return `${t} $<(length: ${largo})>$`;
  return t;
}

// ── MAPEO DE VERBOS EN ESPAÑOL ────────────────────────────────
const TITULO_MAP = { 'get': 'Obtener', 'create': 'Crear', 'add': 'Agregar', 'update': 'Actualizar', 'delete': 'Eliminar', 'load': 'Cargar', 'process': 'Procesar', 'authorize': 'Autorizar', 'reject': 'Rechazar', 'stop': 'Detener', 'view': 'Ver', 'upload': 'Subir', 'enter': 'Ingresar', 'work': 'Trabajar', 'send': 'Enviar', 'set': 'Establecer', 'check': 'Verificar', 'validate': 'Validar', 'generate': 'Generar', 'calculate': 'Calcular', 'search': 'Buscar', 'list': 'Listar' };

function generarTabla(rows) {
  if (!rows || rows.length === 0) return 'No aplica.';
  const lines = ['Nombre | Tipo | Comentarios', ':--------- | :----------- | :-----------'];
  for (const r of rows) {
    const tipo = mapearTipo(r.BTISRVVARTIPO, r.BTISRVPARLARGO, r.BTISRVPARDSC);
    lines.push(`${r.BTISRVPARNOM} | ${tipo} | `);
  }
  return lines.join('\n');
}

function generarTablaSdt(rows) {
  if (!rows || rows.length === 0) return '';
  const lines = ['Nombre | Tipo | Comentarios', ':--------- | :----------- | :-----------'];
  for (const r of rows) {
    const tipo = mapearTipo(r.BTISDTELEMTIPO, r.BTISDTELEMLARGO, r.BTISRVPARDSC);
    lines.push(`${r.BTISDTELEMNOM} | ${tipo}|`);
  }
  return lines.join('\n');
}

async function generarMd(servicio, metodo, carpeta) {
  let conn;
  try {
    conn = await oracledb.getConnection(DB_CONFIG);
    console.log('✅ Conectado a Oracle');
  } catch (e) {
    console.error('❌ Error de conexión:', e.message);
    return;
  }

  try {
    // ── BTI014 - Info del metodo ──
    const r14 = await conn.execute(
      `SELECT BTIMTDDSC, BTIMTDPGMNOM FROM BTI014 WHERE BTISRVNOM = :1 AND BTIMTDNOM = :2`,
      [servicio, metodo],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (r14.rows.length === 0) {
      console.error(`❌ No se encontró '${servicio}.${metodo}' en BTI014`);
      return;
    }

    const descripcionRaw = r14.rows[0].BTIMTDDSC ? r14.rows[0].BTIMTDDSC.trim() : '';

    // ── Traducir descripción y generar título con Claude API ──
    let descripcion = '[Pendiente de completar]';
    let titulo = metodo.replace(/([A-Z])/g, ' $1').trim();

    const tituloMap = { 'get': 'Obtener', 'create': 'Crear', 'add': 'Agregar', 'update': 'Actualizar', 'delete': 'Eliminar', 'load': 'Cargar', 'process': 'Procesar', 'authorize': 'Autorizar', 'reject': 'Rechazar', 'stop': 'Detener', 'view': 'Ver', 'upload': 'Subir', 'enter': 'Ingresar', 'work': 'Trabajar' };
    const primeraPalabra = metodo.match(/^[a-z]+/)?.[0] || '';
    const resto = metodo.replace(/^[a-z]+/, '').replace(/([A-Z])/g, ' $1').trim();
    const verbEs = TITULO_MAP[primeraPalabra] || primeraPalabra.charAt(0).toUpperCase() + primeraPalabra.slice(1);
    titulo = `${verbEs} ${resto}`;
    descripcion = descripcionRaw || '[Pendiente de completar]';
    const programa    = r14.rows[0].BTIMTDPGMNOM || '';
    const progParts   = programa.split('.');
    // Formato: PublicAPI.BTCNPA0001 — penúltima parte con capitalización, última en mayúsculas
    const progFinal   = progParts.length >= 2
      ? (() => {
          const penultima = progParts[progParts.length - 2];
          const ultima    = progParts[progParts.length - 1].toUpperCase();
          // Capitalizar penultima: publicapi -> PublicAPI, btcnpa -> BTCNPA
          const penultimaFmt = penultima.toUpperCase().replace('PUBLICAPI', 'PublicAPI');
          return `${penultimaFmt}.${ultima}`;
        })()
      : 'Completar manualmente';
    const modulo = servicio.replace(/^Public/, '');

    // ── BTI019 - Parametros ──
    const r19 = await conn.execute(
      `SELECT BTISRVPARNOM, BTISRVVARTIPO, BTISRVPARDIR, BTISRVPARDSC, BTISRVPARLARGO, BTISRVCATIT, BTISRVPARITTIPO
       FROM BTI019 WHERE BTISRVNOM = :1 AND BTIMTDNOM = :2 ORDER BY BTISRVPARPOSI`,
      [servicio, metodo],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const entrada = r19.rows.filter(r => r.BTISRVPARDIR === 'I');
    const salida  = r19.rows.filter(r => (r.BTISRVPARDIR === 'O' || r.BTISRVPARDIR === 'R') && r.BTISRVPARNOM !== 'businessErrors');

    // ── BTI026 - SDTs (con soporte de anidados) ──
    let sdtSection = '';
    const sdtsConTipo = salida.filter(r => r.BTISRVCATIT === 'S' && r.BTISRVPARITTIPO && r.BTISRVPARNOM !== 'businessErrors');

    async function procesarSdt(sdtNomMd, sdtNomDB, procesados = new Set()) {
      if (procesados.has(sdtNomDB)) return;
      procesados.add(sdtNomDB);

      const r26 = await conn.execute(
        `SELECT BTISDTELEMNOM, BTISDTELEMTIPO, BTISDTELEMLARGO, BTISDTELEMCAT, BTISDTELEMDSC, BTISDTELEMSDT
         FROM BTI026 WHERE BTISDTNOM = :1 ORDER BY BTISDTELEMPOSI`,
        [sdtNomDB],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (r26.rows.length === 0) return;

      const tabla = generarTablaSdt(r26.rows);
      sdtSection += `
<!-- ABRE SDT -->
::: details ${sdtNomMd}

### ${sdtNomMd}

::: center
Los campos del tipo de dato estructurado ${sdtNomMd} son los siguientes:

${tabla}
:::
<!-- CIERRA SDT -->
`;

      for (const campo of r26.rows) {
        if (campo.BTISDTELEMCAT === 'C' && campo.BTISDTELEMSDT && campo.BTISDTELEMSDT.trim()) {
          await procesarSdt(campo.BTISDTELEMNOM, campo.BTISDTELEMSDT.trim(), procesados);
        }
      }
    }

    for (const param of sdtsConTipo) {
      await procesarSdt(param.BTISRVPARNOM, param.BTISRVPARITTIPO);
    }

    // ── URL ──
    const url = `http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_${servicio}_v1?${metodo}`;

    // ── Tablas ──
    const tablaEntrada = generarTabla(entrada);
    const tablaSalida  = generarTabla(salida);

    // ── Template MD ──
    const md = `---
title: ${titulo}
breadcrumb: false
pageInfo: false
toc: false
contributors: false
editLink: false
lastUpdated: false
prev: false
next: false
comment: false
footer: false
backtotop: false
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note ${descripcion}

**Nombre publicación:** ${servicio}.${metodo}

**Programa:** ${progFinal}

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

${tablaEntrada}

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Btinreq | Object | Datos de entrada requeridos para la invocación (Canal, Usuario, Device, Requerimiento, Token).

@tab Datos de Salida

${tablaSalida}

@tab Errores

Código | Descripción
:--------- | :-----------
Completar manualmente | Completar manualmente

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
\`\`\`json
curl -X POST \\
  '${url}' \\
  -H 'cache-control: no-cache' \\
  -H 'content-type: application/json' \\
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "TOKEN_AQUI"
  }
}'
\`\`\`
:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato
@tab JSON
\`\`\`json
{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "TOKEN_AQUI"
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-01",
    "Hora": "00:00:00",
    "Numero": "00000000",
    "Servicio": "${servicio}.${metodo}",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
\`\`\`
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**
${sdtSection}
`;

    const nombreArchivo = carpeta 
      ? `${carpeta}\\${servicio}.${metodo}.md`
      : `${servicio}.${metodo}.md`;
    fs.writeFileSync(nombreArchivo, md, 'utf8');
    console.log(`✅ Archivo generado: ${nombreArchivo}`);

  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await conn.close();
  }
}

// ── ENTRY POINT ───────────────────────────────────────────────
const [,, servicio, metodo, carpeta] = process.argv;
if (require.main === module) {
  if (!servicio || !metodo) {
    console.log('Uso: node generar_md.js <Servicio> <Metodo> [Carpeta]');
    console.log('Ejemplo: node generar_md.js PublicCASHManagement getServices "PUBLIC CASH MANAGEMENT"');
    process.exit(1);
  }

  if (carpeta) {
    const fs2 = require('fs');
    if (!fs2.existsSync(carpeta)) {
      fs2.mkdirSync(carpeta, { recursive: true });
    }
  }

  generarMd(servicio, metodo, carpeta);
}

module.exports = { generarMd };
