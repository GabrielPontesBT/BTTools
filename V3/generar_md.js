// ============================================================
// Generador de archivos .md para documentacion Bantotal V3
// Uso: node generar_md.js PublicGeneral getMembers [Carpeta]
// ============================================================

require('dotenv').config();
const sql = require('mssql');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ── VALIDACION DE ENTORNO ─────────────────────────────────────
(function validarEntorno() {
  if (!fs.existsSync(__dirname + '/.env')) {
    console.error('\n❌  Falta el archivo .env en esta carpeta.');
    console.error('   Ejecuta "node setup.js" desde la raiz del proyecto para configurarlo,');
    console.error('   o copia .env.example y editalo con tus datos.\n');
    process.exit(1);
  }
  const BD  = ['DB_SERVER', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD'];
  const API = ['API_BASE_URL', 'API_AUTH_URL', 'API_USER', 'API_PASSWORD'];
  const usaEjecutar = process.argv.includes('--ejecutar');
  const faltantes = [
    ...BD.filter(k => !process.env[k]),
    ...(usaEjecutar ? API.filter(k => !process.env[k]) : [])
  ];
  if (faltantes.length) {
    console.error('\n❌  Faltan las siguientes variables en el archivo .env:\n');
    faltantes.forEach(k => console.error('   · ' + k));
    console.error('\n   Ejecuta "node setup.js" desde la raiz del proyecto o edita .env manualmente.\n');
    process.exit(1);
  }
})();

// ── INTERPRETACION DE ERRORES DE BD ──────────────────────────
function interpretarErrorBD(e) {
  const msg  = (e.message || '').toLowerCase();
  const code = e.code || '';
  if (code === 'ENOTFOUND' || msg.includes('getaddrinfo'))
    return `No se encontro el servidor "${process.env.DB_SERVER}". Verifica que DB_SERVER sea correcto en el archivo .env.`;
  if (code === 'ECONNREFUSED')
    return `Conexion rechazada en el puerto ${process.env.DB_PORT || 1433}. Verifica que SQL Server este activo y DB_PORT sea correcto.`;
  if (code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT' || msg.includes('timeout'))
    return `Timeout al conectar. El servidor no responde o un firewall bloquea el puerto ${process.env.DB_PORT || 1433}.`;
  if (code === 'ELOGIN' || msg.includes('login failed') || msg.includes('logon failed'))
    return `Credenciales incorrectas para "${process.env.DB_USER}". Verifica DB_USER y DB_PASSWORD en el archivo .env.`;
  if (msg.includes('cannot open database') || (msg.includes('database') && msg.includes('does not exist')))
    return `La base de datos "${process.env.DB_DATABASE}" no existe o el usuario no tiene acceso. Verifica DB_DATABASE en el archivo .env.`;
  return e.message;
}

// ── CONFIGURACION ─────────────────────────────────────────────
const DB_CONFIG = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    trustServerCertificate: true,
    encrypt: false
  }
};

// ── MAPEO DE TIPOS ────────────────────────────────────────────
const TIPO_MAP = { C: 'String', N: 'Integer', D: 'Date', B: 'Boolean', F: 'Decimal' };

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

// ── EJECUCION DE SERVICIOS ────────────────────────────────────

const API_BASE_URL = process.env.API_BASE_URL || '';
const API_AUTH_URL = process.env.API_AUTH_URL || '';
const API_USER     = process.env.API_USER     || 'INSTALADOR';
const API_PASSWORD = process.env.API_PASSWORD || '';

function httpPost(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const options = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method: 'POST',
      rejectUnauthorized: false,
      headers: { 'Content-Length': Buffer.byteLength(body), ...headers }
    };
    const req = lib.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function obtenerToken() {
  const authUrl = `${API_AUTH_URL}?Execute`;
  const body = JSON.stringify({
    Btinreq: { Canal: 'BTDIGITAL', Usuario: API_USER, Device: 'INSTALADOR', Requerimiento: '1', Token: '' },
    UserId: API_USER,
    UserPassword: API_PASSWORD
  });

  const response = await httpPost(authUrl, body, {
    'Content-Type': 'application/json',
    'cache-control': 'no-cache'
  });

  let parsed;
  try {
    parsed = JSON.parse(response);
  } catch {
    throw new Error(`Respuesta inesperada del auth: ${response.slice(0, 300)}`);
  }

  const token = parsed.SessionToken;
  if (!token) throw new Error('No se pudo obtener el token de sesión');
  return token;
}

let cachedToken = null;

async function llamarServicio(url, payload, token) {
  const body = JSON.stringify({ ...payload, Btinreq: { ...payload.Btinreq, Token: token } });
  const response = await httpPost(url, body, {
    'Content-Type': 'application/json',
    'cache-control': 'no-cache'
  });
  if (!response.trimStart().startsWith('{')) {
    throw new Error(`Respuesta inesperada del servidor: ${response.slice(0, 300)}`);
  }
  return JSON.parse(response);
}

function esSessionInvalida(resultado) {
  const errores = resultado.BusinessErrors || resultado.Erroresnegocio || '';
  if (typeof errores === 'string') return /sesi[oó]n\s*inv[aá]lida/i.test(errores);
  if (Array.isArray(errores)) return errores.some(e => /sesi[oó]n\s*inv[aá]lida/i.test(e.Descripcion || ''));
  const lista = errores?.BTErrorNegocio;
  if (Array.isArray(lista)) return lista.some(e => /sesi[oó]n\s*inv[aá]lida/i.test(e.Descripcion || ''));
  return false;
}

async function ejecutarServicio(url, payload) {
  if (!cachedToken) cachedToken = await obtenerToken();
  const resultado = await llamarServicio(url, payload, cachedToken);
  if (esSessionInvalida(resultado)) {
    process.stdout.write('🔄 ');
    cachedToken = await obtenerToken();
    return llamarServicio(url, payload, cachedToken);
  }
  return resultado;
}

function stripSdtPrefix(name) {
  if (!name) return name;
  return name.replace(/^Sdt/, '');
}

function generarTabla(rows) {
  if (!rows || rows.length === 0) return 'No aplica.';
  const lines = ['Nombre | Tipo | Comentarios', ':--------- | :----------- | :-----------'];
  for (const r of rows) {
    let tipo;
    const itTipo = r.BTISRVPARITTIPO && r.BTISRVPARITTIPO.trim();
    if (itTipo) {
      const displayName = stripSdtPrefix(itTipo);
      tipo = `[${displayName}](#${displayName.toLowerCase()})`;
    } else if (r.BTISRVVARTIPO && r.BTISRVVARTIPO.startsWith('Sdt')) {
      const displayName = stripSdtPrefix(r.BTISRVVARTIPO.trim());
      tipo = `[${displayName}](#${displayName.toLowerCase()})`;
    } else {
      tipo = mapearTipo(r.BTISRVVARTIPO, r.BTISRVPARLARGO, r.BTISRVCATIT === 'C' ? null : r.BTISRVCATIT);
    }
    lines.push(`${r.BTISRVPARNOM} | ${tipo} | `);
  }
  return lines.join('\n');
}

function generarTablaSdt(rows) {
  if (!rows || rows.length === 0) return '';
  const lines = ['Nombre | Tipo | Comentarios', ':--------- | :----------- | :-----------'];
  for (const r of rows) {
    let tipo;
    const sdtRef = (r.BTISDTELEMSDT && r.BTISDTELEMSDT.trim()) ||
                   (r.BTISDTELEMTIPO && r.BTISDTELEMTIPO.startsWith('Sdt') ? r.BTISDTELEMTIPO.trim() : null);
    if (sdtRef) {
      const displayName = stripSdtPrefix(sdtRef);
      tipo = `[${displayName}](#${displayName.toLowerCase()})`;
    } else {
      tipo = mapearTipo(r.BTISDTELEMTIPO, r.BTISDTELEMLARGO, r.BTISDTELEMCAT === 'C' ? null : r.BTISDTELEMCAT);
    }
    lines.push(`${r.BTISDTELEMNOM} | ${tipo} | ${r.BTISDTELEMDSC ? r.BTISDTELEMDSC.trim() : ''}`);
  }
  return lines.join('\n');
}

// ── ORDENAMIENTO DE CAMPOS SDT ────────────────────────────────

function sortSdtFields(rows) {
  return [...rows].sort((a, b) => {
    const nameA = a.BTISDTELEMNOM;
    const nameB = b.BTISDTELEMNOM;
    const nA = nameA.toLowerCase();
    const nB = nameB.toLowerCase();

    // "id" siempre antes que "description" / "descripcion"
    if (nA === 'id' && (nB === 'description' || nB === 'descripcion')) return -1;
    if (nB === 'id' && (nA === 'description' || nA === 'descripcion')) return 1;

    if (nameA.endsWith('Id') && nameB.endsWith('Description') &&
        nameA.slice(0, -2) === nameB.slice(0, -11)) return -1;
    if (nameA.endsWith('Description') && nameB.endsWith('Id') &&
        nameA.slice(0, -11) === nameB.slice(0, -2)) return 1;
    return nameA.localeCompare(nameB);
  });
}

// ── GENERACION DE JSON DE EJEMPLO ────────────────────────────

function valorEjemplo(tipo) {
  const t = (TIPO_MAP[tipo] || tipo || 'String').toLowerCase().split(' ')[0];
  if (t === 'boolean' || t === 'bool') return false;
  if (t === 'date') return '2026-01-01';
  if (t === 'datetime') return '2026-01-01T00:00:00';
  if (t === 'decimal' || t === 'float' || t === 'double') return 0.0;
  if (['integer', 'int', 'long', 'short'].includes(t)) return 0;
  return '';
}

function construirObjeto(sdtNom, sdtCache, visitados = new Set()) {
  if (visitados.has(sdtNom)) return {};
  visitados.add(sdtNom);
  const campos = sdtCache.get(sdtNom);
  if (!campos) return {};
  const obj = {};
  for (const c of campos) {
    const sdtRef = (c.BTISDTELEMSDT && c.BTISDTELEMSDT.trim()) ||
                   (c.BTISDTELEMTIPO && c.BTISDTELEMTIPO.startsWith('Sdt') ? c.BTISDTELEMTIPO.trim() : null);
    if (sdtRef && sdtCache.has(sdtRef)) {
      const nested = construirObjeto(sdtRef, sdtCache, new Set(visitados));
      obj[c.BTISDTELEMNOM] = c.BTISDTELEMCAT === 'C' ? [nested] : nested;
    } else if (c.BTISDTELEMCAT === 'C') {
      obj[c.BTISDTELEMNOM] = [];
    } else {
      obj[c.BTISDTELEMNOM] = valorEjemplo(c.BTISDTELEMTIPO);
    }
  }
  return obj;
}

function construirJsonParams(params, sdtCache) {
  const obj = {};
  for (const r of params) {
    if (r.BTISRVCATIT === 'S' && r.BTISRVPARITTIPO) {
      const sdtNom = r.BTISRVPARITTIPO.trim();
      obj[r.BTISRVPARNOM] = sdtCache.has(sdtNom) ? [construirObjeto(sdtNom, sdtCache)] : [{}];
    } else if (r.BTISRVVARTIPO && r.BTISRVVARTIPO.startsWith('Sdt')) {
      const sdtNom = r.BTISRVVARTIPO.trim();
      obj[r.BTISRVPARNOM] = sdtCache.has(sdtNom) ? construirObjeto(sdtNom, sdtCache) : {};
    } else if (r.BTISRVCATIT === 'C') {
      obj[r.BTISRVPARNOM] = [];
    } else {
      obj[r.BTISRVPARNOM] = valorEjemplo(r.BTISRVVARTIPO);
    }
  }
  return obj;
}

function buildSdtXml(sdtNom, sdtCache, prefix, indent, visited = new Set()) {
  if (visited.has(sdtNom)) return '';
  const vis = new Set(visited);
  vis.add(sdtNom);
  const fields = sdtCache.get(sdtNom) || [];
  return fields.map(f => {
    const sdtRef = (f.BTISDTELEMSDT && f.BTISDTELEMSDT.trim()) ||
                   (f.BTISDTELEMTIPO && f.BTISDTELEMTIPO.startsWith('Sdt') ? f.BTISDTELEMTIPO.trim() : null);
    if (sdtRef && sdtCache.has(sdtRef)) {
      const inner = buildSdtXml(sdtRef, sdtCache, prefix, indent + '   ', vis);
      if (f.BTISDTELEMCAT === 'C') {
        const itemTag = `${prefix}${stripSdtPrefix(sdtRef)}`;
        return `${indent}<${prefix}${f.BTISDTELEMNOM}>\n${indent}   <${itemTag}>\n${inner}\n${indent}   </${itemTag}>\n${indent}</${prefix}${f.BTISDTELEMNOM}>`;
      }
      return inner
        ? `${indent}<${prefix}${f.BTISDTELEMNOM}>\n${inner}\n${indent}</${prefix}${f.BTISDTELEMNOM}>`
        : `${indent}<${prefix}${f.BTISDTELEMNOM}/>`;
    }
    if (f.BTISDTELEMCAT === 'C') return `${indent}<${prefix}${f.BTISDTELEMNOM}/>`;
    const val = valorEjemplo(f.BTISDTELEMTIPO);
    return (val === '' || val === false)
      ? `${indent}<${prefix}${f.BTISDTELEMNOM}/>`
      : `${indent}<${prefix}${f.BTISDTELEMNOM}>${val}</${prefix}${f.BTISDTELEMNOM}>`;
  }).join('\n');
}

function buildParamsXml(params, sdtCache, prefix, indent) {
  return params.map(r => {
    const itTipo = r.BTISRVPARITTIPO && r.BTISRVPARITTIPO.trim();
    const varSdt = r.BTISRVVARTIPO && r.BTISRVVARTIPO.startsWith('Sdt') ? r.BTISRVVARTIPO.trim() : null;
    const sdtRef = itTipo || varSdt;
    if (sdtRef && sdtCache.has(sdtRef)) {
      const inner = buildSdtXml(sdtRef, sdtCache, prefix, indent + '   ');
      if (r.BTISRVCATIT === 'C') {
        const itemTag = `${prefix}${stripSdtPrefix(sdtRef)}`;
        return `${indent}<${prefix}${r.BTISRVPARNOM}>\n${indent}   <${itemTag}>\n${inner}\n${indent}   </${itemTag}>\n${indent}</${prefix}${r.BTISRVPARNOM}>`;
      }
      return inner
        ? `${indent}<${prefix}${r.BTISRVPARNOM}>\n${inner}\n${indent}</${prefix}${r.BTISRVPARNOM}>`
        : `${indent}<${prefix}${r.BTISRVPARNOM}/>`;
    }
    if (r.BTISRVCATIT === 'C') return `${indent}<${prefix}${r.BTISRVPARNOM}/>`;
    const val = valorEjemplo(r.BTISRVVARTIPO);
    return (val === '' || val === false)
      ? `${indent}<${prefix}${r.BTISRVPARNOM}/>`
      : `${indent}<${prefix}${r.BTISRVPARNOM}>${val}</${prefix}${r.BTISRVPARNOM}>`;
  }).join('\n');
}

function buildRequestXml(servicio, metodo, entrada, sdtCache, token = 'TOKEN_AQUI') {
  const parms = buildParamsXml(entrada, sdtCache, 'bts:', '         ');
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bts="http://uy.com.dlya.bantotal/BTSOA/">
   <soapenv:Header/>
   <soapenv:Body>
      <bts:${servicio}.${metodo}>
         <bts:Btinreq>
            <bts:Device>INSTALADOR</bts:Device>
            <bts:Usuario>INSTALADOR</bts:Usuario>
            <bts:Requerimiento></bts:Requerimiento>
            <bts:Canal>BTDIGITAL</bts:Canal>
            <bts:Token>${token}</bts:Token>
         </bts:Btinreq>
${parms}
      </bts:${servicio}.${metodo}>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function buildResponseXml(servicio, metodo, salida, sdtCache) {
  const parms = buildParamsXml(salida, sdtCache, '', '         ');
  return `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
   <SOAP-ENV:Body>
      <${servicio}.${metodo}Response xmlns="http://uy.com.dlya.bantotal/BTSOA/">
         <Btinreq>
            <Device>INSTALADOR</Device>
            <Usuario>INSTALADOR</Usuario>
            <Requerimiento/>
            <Canal>BTDIGITAL</Canal>
            <Token>TOKEN_AQUI</Token>
         </Btinreq>
${parms}
         <Erroresnegocio/>
         <Btoutreq>
            <Numero>00000000</Numero>
            <Estado>OK</Estado>
            <Servicio>${servicio}.${metodo}</Servicio>
            <Requerimiento/>
            <Fecha>2026-01-01</Fecha>
            <Canal>BTDIGITAL</Canal>
            <Hora>00:00:00</Hora>
         </Btoutreq>
      </${servicio}.${metodo}Response>
   </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

async function generarMd(servicio, metodo, carpeta, ejecutar = false, inputParams = null) {
  let pool;
  try {
    pool = await new sql.ConnectionPool(DB_CONFIG).connect();
    console.log('✅ Conectado a SQL Server');
  } catch (e) {
    console.error('❌ Error de conexión:', e.message);
    return null;
  }

  try {
    // ── BTI014 - Info del metodo ──
    const r14 = await pool.request()
      .input('servicio', sql.VarChar(100), servicio)
      .input('metodo', sql.VarChar(100), metodo)
      .query('SELECT BTIMTDDSC, BTIMTDPGMNOM FROM BTI014 WHERE BTISRVNOM = @servicio AND BTIMTDNOM = @metodo');

    if (r14.recordset.length === 0) {
      console.error(`❌ No se encontró '${servicio}.${metodo}' en BTI014`);
      return null;
    }

    const descripcionRaw = r14.recordset[0].BTIMTDDSC ? r14.recordset[0].BTIMTDDSC.trim() : '';

    const primeraPalabra = metodo.match(/^[a-z]+/)?.[0] || '';
    const resto = metodo.replace(/^[a-z]+/, '').replace(/([A-Z])/g, ' $1').trim();
    const verbEs = TITULO_MAP[primeraPalabra] || primeraPalabra.charAt(0).toUpperCase() + primeraPalabra.slice(1);
    const titulo = `${verbEs} ${resto}`;
    const descripcion = descripcionRaw || '[Pendiente de completar]';
    const programa = r14.recordset[0].BTIMTDPGMNOM || '';
    const progFinal = programa ? programa.toUpperCase() : 'Completar manualmente';

    // ── BTI019 - Parametros ──
    const r19 = await pool.request()
      .input('servicio', sql.VarChar(100), servicio)
      .input('metodo', sql.VarChar(100), metodo)
      .query(`SELECT BTISRVPARNOM, BTISRVVARTIPO, BTISRVPARDIR, BTISRVPARLARGO, BTISRVCATIT, BTISRVPARITTIPO
              FROM BTI019 WHERE BTISRVNOM = @servicio AND BTIMTDNOM = @metodo ORDER BY BTISRVPARPOSI`);

    const entrada = r19.recordset.filter(r => r.BTISRVPARDIR === 'I');
    const salida  = r19.recordset.filter(r => (r.BTISRVPARDIR === 'O' || r.BTISRVPARDIR === 'R') && r.BTISRVPARNOM !== 'businessErrors');

    // ── BTI026 - SDTs (con soporte de anidados) ──
    let sdtSection = '';
    const sdtCache = new Map();
    const sdtsConTipo = salida.filter(r =>
      r.BTISRVPARNOM !== 'businessErrors' &&
      ((r.BTISRVCATIT === 'S' && r.BTISRVPARITTIPO) ||
       (r.BTISRVVARTIPO && r.BTISRVVARTIPO.startsWith('Sdt')))
    );

    async function fetchSdtCache(sdtNomDB, visitados = new Set()) {
      if (visitados.has(sdtNomDB) || sdtCache.has(sdtNomDB)) return;
      visitados.add(sdtNomDB);
      const r26 = await pool.request()
        .input('sdtNom', sql.VarChar(100), sdtNomDB)
        .query(`SELECT BTISDTELEMNOM, BTISDTELEMTIPO, BTISDTELEMLARGO, BTISDTELEMCAT, BTISDTELEMDSC, BTISDTELEMSDT
                FROM BTI026 WHERE BTISDTNOM = @sdtNom ORDER BY BTISDTELEMNOM`);
      if (r26.recordset.length === 0) return;
      sdtCache.set(sdtNomDB, sortSdtFields(r26.recordset));
      for (const campo of r26.recordset) {
        const nestedSdt = (campo.BTISDTELEMSDT && campo.BTISDTELEMSDT.trim()) ||
                          (campo.BTISDTELEMTIPO && campo.BTISDTELEMTIPO.startsWith('Sdt') ? campo.BTISDTELEMTIPO.trim() : null);
        if (nestedSdt) await fetchSdtCache(nestedSdt, visitados);
      }
    }

    async function procesarSdt(sdtNomMd, sdtNomDB, procesados = new Set()) {
      if (procesados.has(sdtNomDB)) return;
      procesados.add(sdtNomDB);
      await fetchSdtCache(sdtNomDB);
      const rows = sdtCache.get(sdtNomDB);
      if (!rows || rows.length === 0) return;
      const tabla = generarTablaSdt(rows);
      const sdtDisplayName = stripSdtPrefix(sdtNomDB);
      sdtSection += `
::: details ${sdtDisplayName}

### ${sdtDisplayName}

::: center
Los campos del tipo de dato estructurado ${sdtDisplayName} son los siguientes:

${tabla}
:::
`;
      for (const campo of rows) {
        const nestedSdt = (campo.BTISDTELEMSDT && campo.BTISDTELEMSDT.trim()) ||
                          (campo.BTISDTELEMTIPO && campo.BTISDTELEMTIPO.startsWith('Sdt') ? campo.BTISDTELEMTIPO.trim() : null);
        if (nestedSdt) await procesarSdt(campo.BTISDTELEMNOM, nestedSdt, procesados);
      }
    }

    const procesados = new Set();

    const sdtsEntrada = entrada.filter(r =>
      (r.BTISRVCATIT === 'S' && r.BTISRVPARITTIPO) ||
      (r.BTISRVCATIT === 'C' && r.BTISRVPARITTIPO) ||
      (r.BTISRVVARTIPO && r.BTISRVVARTIPO.startsWith('Sdt'))
    );
    for (const param of sdtsEntrada) {
      const sdtNomDB = (param.BTISRVPARITTIPO && param.BTISRVPARITTIPO.trim()) ||
                       (param.BTISRVVARTIPO && param.BTISRVVARTIPO.startsWith('Sdt') ? param.BTISRVVARTIPO.trim() : null);
      if (sdtNomDB) await procesarSdt(param.BTISRVPARNOM, sdtNomDB, procesados);
    }

    for (const param of sdtsConTipo) {
      const sdtNomDB = (param.BTISRVPARITTIPO && param.BTISRVPARITTIPO.trim()) || param.BTISRVVARTIPO;
      await procesarSdt(param.BTISRVPARNOM, sdtNomDB, procesados);
    }

    // ── URL ──
    const url = `${process.env.BASE_URL}/btdeveloper/servlet/com.dlya.bantotal.odwsbt_${servicio}_v1?${metodo}`;

    // ── Ejemplos JSON ──
    const btinreq = { Canal: 'BTDIGITAL', Usuario: 'INSTALADOR', Device: 'INSTALADOR', Requerimiento: '1', Token: 'TOKEN_AQUI' };
    const entradaNombres = new Set(entrada.map(r => r.BTISRVPARNOM));
    const filteredParams = inputParams
      ? Object.fromEntries(Object.entries(inputParams).filter(([k]) => entradaNombres.has(k)))
      : {};
    const requestPayload  = { Btinreq: btinreq, ...construirJsonParams(entrada, sdtCache), ...filteredParams };
    const responsePayload = {
      Btinreq: btinreq,
      ...construirJsonParams(salida, sdtCache),
      BusinessErrors: '',
      Btoutreq: { Estado: 'OK', Fecha: '2026-01-01', Hora: '00:00:00', Numero: '00000000', Servicio: `${servicio}.${metodo}`, Requerimiento: '1', Canal: 'BTDIGITAL' },
      _xmlns: 'http://uy.com.dlya.bantotal/BTSOA/'
    };
    let requestJson  = JSON.stringify(requestPayload, null, 2);
    let responseJson = JSON.stringify(responsePayload, null, 2);

    let realResponse = null;
    if (ejecutar) {
      try {
        process.stdout.write(`  🌐 Ejecutando ${servicio}.${metodo}... `);
        const execUrl = `${API_BASE_URL}/servlet/com.dlya.bantotal.ardwsbt_${servicio}_v1?${metodo}`;
        const respuestaReal = await ejecutarServicio(execUrl, requestPayload);
        responseJson = JSON.stringify(respuestaReal, null, 2);
        requestJson  = JSON.stringify({ ...requestPayload, Btinreq: { ...requestPayload.Btinreq, Token: cachedToken } }, null, 2);
        realResponse = respuestaReal;
        console.log('✅');
      } catch (e) {
        console.log(`⚠️  ${e.message} — usando valores de ejemplo`);
      }
    }

    const xmlToken   = (ejecutar && cachedToken) ? cachedToken : 'TOKEN_AQUI';
    const requestXml  = buildRequestXml(servicio, metodo, entrada, sdtCache, xmlToken);
    const responseXml = buildResponseXml(servicio, metodo, salida, sdtCache);

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
@tab XML
\`\`\`xml
${requestXml}
\`\`\`
@tab JSON
\`\`\`json
${requestJson}
\`\`\`
:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato
@tab XML
\`\`\`xml
${responseXml}
\`\`\`
@tab JSON
\`\`\`json
${responseJson}
\`\`\`
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

${sdtSection ? `## **Tipos de Dato Estructurado**\n\n<!-- ABRE SDT -->\n${sdtSection.trim()}\n<!-- CIERRA SDT -->` : ''}
`;

    const nombreArchivo = `${carpeta}\\${metodo}.md`;
    fs.writeFileSync(nombreArchivo, md, 'utf8');
    console.log(`✅ Archivo generado: ${nombreArchivo}`);

    return realResponse;

  } catch (e) {
    console.error('❌ Error:', e.message);
    return null;
  } finally {
    await pool.close();
  }
}

// ── WORKFLOW ──────────────────────────────────────────────────

function resolvePath(obj, path) {
  return path.split(/[\.\[\]]+/).filter(Boolean).reduce((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[isNaN(key) ? key : parseInt(key)];
  }, obj);
}

async function ejecutarWorkflow(workflowFile) {
  let workflow;
  try {
    workflow = JSON.parse(fs.readFileSync(workflowFile, 'utf8'));
  } catch (e) {
    console.error(`❌ No se pudo leer el workflow: ${e.message}`);
    process.exit(1);
  }

  const { service: servicio, steps, folder } = workflow;
  if (!servicio || !Array.isArray(steps) || steps.length === 0) {
    console.error('❌ El workflow debe tener "service" y "steps"');
    process.exit(1);
  }

  const dir = folder || servicio;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let context = {};
  let ok = 0, errores = 0;

  console.log(`🔄 Iniciando workflow para ${servicio} (${steps.length} pasos)`);
  console.log('─'.repeat(50));

  for (const step of steps) {
    const { method, params: stepParams = {}, extract = [] } = step;
    if (!method) { console.error('❌ Paso sin "method", saltando'); errores++; continue; }

    const mergedParams = { ...context, ...stepParams };
    console.log(`\n▶ ${servicio}.${method}`);
    if (Object.keys(mergedParams).length > 0) {
      console.log(`  📋 Params: ${JSON.stringify(mergedParams)}`);
    }

    const response = await generarMd(servicio, method, dir, true, mergedParams);

    if (response && extract.length > 0) {
      for (const entry of extract) {
        if (typeof entry === 'string') {
          if (response[entry] !== undefined) {
            context[entry] = response[entry];
            console.log(`  📎 Extraído: ${entry} = ${JSON.stringify(response[entry])}`);
          } else {
            console.log(`  ⚠️  Campo "${entry}" no encontrado en la respuesta`);
          }
        } else if (typeof entry === 'object' && entry.path && entry.as) {
          const value = resolvePath(response, entry.path);
          if (value !== undefined) {
            context[entry.as] = value;
            console.log(`  📎 Extraído: ${entry.as} = ${JSON.stringify(value)} (desde ${entry.path})`);
          } else {
            console.log(`  ⚠️  Ruta "${entry.path}" no encontrada en la respuesta`);
          }
        }
      }
    }

    response !== null ? ok++ : errores++;
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`✅ Completados: ${ok} | ❌ Errores: ${errores}`);
}

// ── ENTRY POINT ───────────────────────────────────────────────
if (require.main === module) {
  const rawArgs = process.argv.slice(2);

  function getFlagValue(flag) {
    const idx = rawArgs.indexOf(flag);
    if (idx !== -1 && rawArgs[idx + 1] && !rawArgs[idx + 1].startsWith('--')) return rawArgs[idx + 1];
    return null;
  }

  const ejecutar     = rawArgs.includes('--ejecutar');
  const workflowFile = getFlagValue('--workflow');
  const paramsValue  = getFlagValue('--params');

  if (workflowFile) {
    ejecutarWorkflow(workflowFile);
    return;
  }

  const skipIdx = new Set();
  rawArgs.forEach((a, i) => {
    if (a === '--params' || a === '--workflow') { skipIdx.add(i); skipIdx.add(i + 1); }
    else if (a.startsWith('--')) skipIdx.add(i);
  });
  const args = rawArgs.filter((_, i) => !skipIdx.has(i));
  const [servicio, metodo, carpeta] = args;

  if (!servicio) {
    console.log('Uso:');
    console.log('  node generar_md.js <Servicio> [Metodo] [Carpeta] [--ejecutar] [--params archivo.json]');
    console.log('  node generar_md.js --workflow workflow.json');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node generar_md.js PublicGeneral getMembers');
    console.log('  node generar_md.js PublicGeneral getMembers --ejecutar');
    console.log('  node generar_md.js PublicGeneral --ejecutar --params params.json');
    console.log('  node generar_md.js --workflow workflow.json');
    process.exit(1);
  }

  let inputParams = null;
  if (paramsValue) {
    try {
      inputParams = fs.existsSync(paramsValue)
        ? JSON.parse(fs.readFileSync(paramsValue, 'utf8'))
        : JSON.parse(paramsValue);
      console.log(`📂 Params cargados desde: ${paramsValue}`);
    } catch (e) {
      console.error(`❌ No se pudo leer --params: ${e.message}`);
      process.exit(1);
    }
  }

  const dir = carpeta || servicio;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (metodo) {
    generarMd(servicio, metodo, dir, ejecutar, inputParams);
  } else {
    (async () => {
      let pool;
      try {
        pool = await new sql.ConnectionPool(DB_CONFIG).connect();
      } catch (e) {
        console.error('\n❌  Error de conexion a SQL Server:\n   ' + interpretarErrorBD(e) + '\n');
        process.exit(1);
      }
      let metodos = [];
      try {
        const result = await pool.request()
          .input('servicio', sql.VarChar(100), servicio)
          .query('SELECT BTIMTDNOM FROM BTI014 WHERE BTISRVNOM = @servicio ORDER BY BTIMTDNOM');
        if (result.recordset.length === 0) {
          console.error(`❌ No se encontró el servicio '${servicio}' en BTI014`);
          process.exit(1);
        }
        metodos = result.recordset.map(r => r.BTIMTDNOM);
        console.log(`📋 Se encontraron ${metodos.length} métodos para ${servicio}`);
      } finally {
        await pool.close();
      }
      console.log('─'.repeat(50));
      let ok = 0, errores = 0;
      for (const m of metodos) {
        try {
          console.log(`⚙️  Generando: ${servicio}.${m}...`);
          await generarMd(servicio, m, dir, ejecutar, inputParams);
          ok++;
        } catch (e) {
          console.error(`❌ Error generando ${m}: ${e.message}`);
          errores++;
        }
      }
      console.log('─'.repeat(50));
      console.log(`✅ Generados: ${ok} | ❌ Errores: ${errores}`);
    })();
  }
}

module.exports = { generarMd };
