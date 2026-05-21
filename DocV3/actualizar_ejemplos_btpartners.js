// ============================================================
// Actualiza solo las secciones de ejemplos en los .md de BTPARTNERS
// Uso:
//   node actualizar_ejemplos_btpartners.js [Metodo] [--ejecutar]
//   node actualizar_ejemplos_btpartners.js --workflow workflow_btpartners.json
// ============================================================

require('dotenv').config();
const sql  = require('mssql');
const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');

const DB_CONFIG = {
  server:   process.env.DB_SERVER,
  port:     parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options:  { trustServerCertificate: true, encrypt: false }
};

const TIPO_MAP = { C: 'String', N: 'Integer', D: 'Date', B: 'Boolean', F: 'Decimal' };
const BTPARTNERS_DIR = path.join(__dirname, 'BTPARTNERS');
const SERVICIO = 'BTPartners';

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

const API_BASE_URL = process.env.API_BASE_URL || '';
const API_AUTH_URL = process.env.API_AUTH_URL || '';
const API_USER     = process.env.API_USER     || 'INSTALADOR';
const API_PASSWORD = process.env.API_PASSWORD || '';

// ── HELPERS ───────────────────────────────────────────────────

function stripSdtPrefix(name) {
  if (!name) return name;
  if (name.startsWith('BT')) return 's' + name;
  if (name.startsWith('Sdts')) return name.slice(4);
  return name;
}

function valorEjemplo(tipo) {
  const t = (TIPO_MAP[tipo] || tipo || 'String').toLowerCase().split(' ')[0];
  if (t === 'boolean' || t === 'bool') return false;
  if (t === 'date') return '2026-01-01';
  if (t === 'datetime') return '2026-01-01T00:00:00';
  if (t === 'decimal' || t === 'float' || t === 'double') return 0.0;
  if (['integer', 'int', 'long', 'short'].includes(t)) return 0;
  return '';
}

function tipoDisplay(tipo, largo) {
  const t = TIPO_MAP[tipo] || (tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : 'String');
  if (largo && largo !== '0' && largo !== 0) return `${t} (length: ${largo})`;
  return t;
}

function generarTablaSdt(rows) {
  if (!rows || rows.length === 0) return '';
  const lines = ['Nombre | Tipo | Comentarios', ':--------- | :----------- | :-----------'];
  for (const r of rows) {
    const sdtRef = (r.BTISDTELEMSDT && r.BTISDTELEMSDT.trim()) ||
                   (r.BTISDTELEMTIPO && r.BTISDTELEMTIPO.match(/^(Sdt|BT)/) ? r.BTISDTELEMTIPO.trim() : null);
    let tipo;
    if (sdtRef) {
      const dn = stripSdtPrefix(sdtRef);
      tipo = `[${dn}](#${dn.toLowerCase()})`;
    } else {
      tipo = tipoDisplay(r.BTISDTELEMTIPO, r.BTISDTELEMLARGO);
    }
    lines.push(`${r.BTISDTELEMNOM} | ${tipo}|`);
  }
  return lines.join('\n');
}

function generarTablaParams(params, sdtCache) {
  const lines = ['Nombre | Tipo | Comentarios', ':--------- | :----------- | :-----------'];
  for (const r of params) {
    const itTipo = r.BTISRVPARITTIPO && r.BTISRVPARITTIPO.trim();
    const varSdt = r.BTISRVVARTIPO && r.BTISRVVARTIPO.match(/^(Sdt|BT)/) ? r.BTISRVVARTIPO.trim() : null;
    const sdtRef = itTipo || varSdt;
    let tipo;
    if (sdtRef) {
      const dn = stripSdtPrefix(sdtRef);
      tipo = `[${dn}](#${dn.toLowerCase()})`;
    } else if (r.BTISRVCATIT === 'C') {
      tipo = 'Collection';
    } else {
      tipo = tipoDisplay(r.BTISRVVARTIPO, r.BTISRVPARLARGO);
    }
    lines.push(`${r.BTISRVPARNOM} | ${tipo} | `);
  }
  return lines.join('\n');
}

function generarSeccionSdt(entrada, salida, sdtCache) {
  const ordenados = [];
  const procesados = new Set();

  function agregarSdt(sdtNom) {
    if (procesados.has(sdtNom) || !sdtCache.has(sdtNom)) return;
    procesados.add(sdtNom);
    ordenados.push(sdtNom);
    for (const c of (sdtCache.get(sdtNom) || [])) {
      const ref = (c.BTISDTELEMSDT && c.BTISDTELEMSDT.trim()) ||
                  (c.BTISDTELEMTIPO && c.BTISDTELEMTIPO.match(/^(Sdt|BT)/) ? c.BTISDTELEMTIPO.trim() : null);
      if (ref) agregarSdt(ref);
    }
  }

  for (const p of [...entrada, ...salida]) {
    const ref = (p.BTISRVPARITTIPO && p.BTISRVPARITTIPO.trim()) ||
                (p.BTISRVVARTIPO && p.BTISRVVARTIPO.match(/^(Sdt|BT)/) ? p.BTISRVVARTIPO.trim() : null);
    if (ref) agregarSdt(ref);
  }

  if (ordenados.length === 0) return '';

  return ordenados.map(sdtNom => {
    const rows = sdtCache.get(sdtNom);
    if (!rows || !rows.length) return '';
    const dn = stripSdtPrefix(sdtNom);
    return `::: details ${dn}\n\n### ${dn}\n\n::: center\nLos campos del tipo de dato estructurado ${dn} son los siguientes:\n\n${generarTablaSdt(rows)}\n:::`;
  }).filter(Boolean).join('\n\n');
}

function construirObjeto(sdtNom, sdtCache, visitados = new Set()) {
  if (visitados.has(sdtNom)) return {};
  visitados.add(sdtNom);
  const campos = sdtCache.get(sdtNom);
  if (!campos) return {};
  const obj = {};
  for (const c of campos) {
    const sdtRef = (c.BTISDTELEMSDT && c.BTISDTELEMSDT.trim()) ||
                   (c.BTISDTELEMTIPO && c.BTISDTELEMTIPO.match(/^(Sdt|BT)/) ? c.BTISDTELEMTIPO.trim() : null);
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
    } else if (r.BTISRVVARTIPO && r.BTISRVVARTIPO.match(/^(Sdt|BT)/)) {
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

// ── XML BUILDERS ──────────────────────────────────────────────

function buildSdtXml(sdtNom, sdtCache, prefix, indent, visited = new Set()) {
  if (visited.has(sdtNom)) return '';
  const vis = new Set(visited);
  vis.add(sdtNom);
  const fields = sdtCache.get(sdtNom) || [];
  return fields.map(f => {
    const sdtRef = (f.BTISDTELEMSDT && f.BTISDTELEMSDT.trim()) ||
                   (f.BTISDTELEMTIPO && f.BTISDTELEMTIPO.match(/^(Sdt|BT)/) ? f.BTISDTELEMTIPO.trim() : null);
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
    const varSdt = r.BTISRVVARTIPO && r.BTISRVVARTIPO.match(/^(Sdt|BT)/) ? r.BTISRVVARTIPO.trim() : null;
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

function buildRequestXml(metodo, entrada, sdtCache, token = '673543DE2A22DFAC951F9E41') {
  const parms = buildParamsXml(entrada, sdtCache, 'bts:', '         ');
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bts="http://uy.com.dlya.bantotal/BTSOA/">
   <soapenv:Header/>
   <soapenv:Body>
      <bts:${SERVICIO}.${metodo}>
         <bts:Btinreq>
            <bts:Device>INSTALADOR</bts:Device>
            <bts:Usuario>INSTALADOR</bts:Usuario>
            <bts:Requerimiento></bts:Requerimiento>
            <bts:Canal>BTDIGITAL</bts:Canal>
            <bts:Token>${token}</bts:Token>
         </bts:Btinreq>
${parms}
      </bts:${SERVICIO}.${metodo}>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function buildResponseXml(metodo, salida, sdtCache) {
  const parms = buildParamsXml(salida, sdtCache, '', '         ');
  return `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
   <SOAP-ENV:Body>
      <${SERVICIO}.${metodo}Response xmlns="http://uy.com.dlya.bantotal/BTSOA/">
         <Btinreq>
            <Device>INSTALADOR</Device>
            <Usuario>INSTALADOR</Usuario>
            <Requerimiento/>
            <Canal>BTDIGITAL</Canal>
            <Token>673543DE2A22DFAC951F9E41</Token>
         </Btinreq>
${parms}
         <Erroresnegocio/>
         <Btoutreq>
            <Numero>00000000</Numero>
            <Estado>OK</Estado>
            <Servicio>${SERVICIO}.${metodo}</Servicio>
            <Requerimiento/>
            <Fecha>2026-01-01</Fecha>
            <Canal>BTDIGITAL</Canal>
            <Hora>00:00:00</Hora>
         </Btoutreq>
      </${SERVICIO}.${metodo}Response>
   </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

// ── XML BUILDERS FROM REAL JSON ──────────────────────────────

function jsonToXml(val, tagName, prefix, indent) {
  if (Array.isArray(val)) {
    if (val.length === 0) return `${indent}<${prefix}${tagName}/>`;
    const itemTag = singularizar(tagName);
    return val.map(item => jsonToXml(item, itemTag, prefix, indent)).join('\n');
  }
  if (val !== null && typeof val === 'object') {
    const entries = Object.entries(val);
    if (entries.length === 0) return `${indent}<${prefix}${tagName}/>`;
    const inner = entries.map(([k, v]) => jsonToXml(v, k, prefix, indent + '   ')).join('\n');
    return `${indent}<${prefix}${tagName}>\n${inner}\n${indent}</${prefix}${tagName}>`;
  }
  const str = String(val ?? '');
  if (str === '' || val === false) return `${indent}<${prefix}${tagName}/>`;
  return `${indent}<${prefix}${tagName}>${val}</${prefix}${tagName}>`;
}

function buildRequestXmlFromJson(metodo, payload) {
  const token  = payload.Btinreq?.Token || '';
  const params = Object.entries(payload)
    .filter(([k]) => k !== 'Btinreq')
    .map(([k, v]) => jsonToXml(v, k, 'bts:', '         '))
    .join('\n');
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bts="http://uy.com.dlya.bantotal/BTSOA/">
   <soapenv:Header/>
   <soapenv:Body>
      <bts:${SERVICIO}.${metodo}>
         <bts:Btinreq>
            <bts:Device>INSTALADOR</bts:Device>
            <bts:Usuario>INSTALADOR</bts:Usuario>
            <bts:Requerimiento></bts:Requerimiento>
            <bts:Canal>BTDIGITAL</bts:Canal>
            <bts:Token>${token}</bts:Token>
         </bts:Btinreq>
${params}
      </bts:${SERVICIO}.${metodo}>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function buildResponseXmlFromJson(metodo, response) {
  const outreq  = response.Btoutreq || {};
  const errores = response.Erroresnegocio;
  const params  = Object.entries(response)
    .filter(([k]) => !['Btinreq', 'Btoutreq', 'Erroresnegocio', 'BusinessErrors', '_xmlns'].includes(k))
    .map(([k, v]) => jsonToXml(v, k, '', '         '))
    .join('\n');
  const errXml  = Array.isArray(errores) && errores.length > 0
    ? `<Erroresnegocio>\n${errores.map(e =>
        `            <BTErrorNegocio>\n               <Severidad>${e.Severidad || ''}</Severidad>\n               <Codigo>${e.Codigo || ''}</Codigo>\n               <Descripcion>${e.Descripcion || ''}</Descripcion>\n            </BTErrorNegocio>`
      ).join('\n')}\n         </Erroresnegocio>`
    : '<Erroresnegocio/>';
  return `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
   <SOAP-ENV:Body>
      <${SERVICIO}.${metodo}Response xmlns="http://uy.com.dlya.bantotal/BTSOA/">
         <Btinreq>
            <Device>INSTALADOR</Device>
            <Usuario>INSTALADOR</Usuario>
            <Requerimiento>${outreq.Requerimiento || ''}</Requerimiento>
            <Canal>BTDIGITAL</Canal>
            <Token>${response.Btinreq?.Token || ''}</Token>
         </Btinreq>
${params}
         ${errXml}
         <Btoutreq>
            <Numero>${outreq.Numero || '00000000'}</Numero>
            <Estado>${outreq.Estado || 'OK'}</Estado>
            <Servicio>${SERVICIO}.${metodo}</Servicio>
            <Requerimiento>${outreq.Requerimiento || ''}</Requerimiento>
            <Fecha>${outreq.Fecha || '2026-01-01'}</Fecha>
            <Canal>BTDIGITAL</Canal>
            <Hora>${outreq.Hora || '00:00:00'}</Hora>
         </Btoutreq>
      </${SERVICIO}.${metodo}Response>
   </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
        target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function resolvePath(obj, pathStr) {
  return pathStr.split(/[\.\[\]]+/).filter(Boolean).reduce((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[isNaN(key) ? key : parseInt(key)];
  }, obj);
}

// Soporta "a.b.c" para asignar valores anidados en el contexto
function setPath(obj, pathStr, value) {
  const keys = pathStr.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] === undefined || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

// ── HTTP / AUTH ───────────────────────────────────────────────

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

let cachedToken = null;

async function obtenerToken() {
  const body = JSON.stringify({
    Btinreq: { Canal: 'BTDIGITAL', Usuario: API_USER, Device: 'INSTALADOR', Requerimiento: '1', Token: '' },
    UserId: API_USER,
    UserPassword: API_PASSWORD
  });
  const response = await httpPost(`${API_BASE_URL}/servlet/com.dlya.bantotal.ardwsbt_Authenticate_v1?Execute`, body, {
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

async function llamarServicio(url, payload, token) {
  const body = JSON.stringify({ ...payload, Btinreq: { ...payload.Btinreq, Token: token } });
  const response = await httpPost(url, body, {
    'Content-Type': 'application/json',
    'cache-control': 'no-cache'
  });
  if (!response.trimStart().startsWith('{')) throw new Error(`Respuesta inesperada: ${response.slice(0, 200)}`);
  return JSON.parse(response);
}

function esSessionInvalida(r) {
  const e = r.BusinessErrors || r.Erroresnegocio || '';
  if (typeof e === 'string') return /sesi[oó]n\s*inv[aá]lida/i.test(e);
  const lista = e?.BTErrorNegocio;
  if (Array.isArray(lista)) return lista.some(x => /sesi[oó]n\s*inv[aá]lida/i.test(x.Descripcion || ''));
  return false;
}

async function ejecutarServicio(url, payload) {
  if (!cachedToken) cachedToken = await obtenerToken();
  const result = await llamarServicio(url, payload, cachedToken);
  if (result !== null && esSessionInvalida(result)) {
    process.stdout.write('🔄 ');
    cachedToken = await obtenerToken();
    return llamarServicio(url, payload, cachedToken);
  }
  return result;
}

// ── REEMPLAZO DE SECCIONES EN EL .md ─────────────────────────

function reemplazarSeccion(contenido, abre, cierra, nuevoBloque) {
  const regex = new RegExp(`${abre}[\\s\\S]*?${cierra}`, 'm');
  return contenido.replace(regex, `${abre}\n${nuevoBloque}\n${cierra}`);
}

// ── PROCESO DE UN METODO ──────────────────────────────────────

function singularizar(nombre) {
  if (nombre.endsWith('ies')) return nombre.slice(0, -3) + 'y';
  if (/(?:ch|sh|x|z)es$/.test(nombre)) return nombre.slice(0, -2);
  if (nombre.endsWith('s') && !nombre.endsWith('ss')) return nombre.slice(0, -1);
  return nombre;
}

function formatearTitulo(metodo) {
  return metodo.replace(/([A-Z])/g, ' $1').trim();
}

async function actualizarMetodo(pool, metodo, filePath, ejecutar, inputParams = null) {
  const r14 = await pool.request()
    .input('mtd', sql.VarChar(100), metodo)
    .query(`SELECT BTIMtdPgmNom FROM BTI014 WHERE BTIMtdNom = @mtd AND BTINom = 'BTSERVICES' AND BTIMtdPgmNom LIKE 'rbtpn%'`);
  const programa = r14.recordset[0]?.BTIMtdPgmNom?.trim().toUpperCase() || '';

  const r19 = await pool.request()
    .input('srv', sql.VarChar(100), SERVICIO)
    .input('mtd', sql.VarChar(100), metodo)
    .query(`SELECT BTISRVPARNOM, BTISRVVARTIPO, BTISRVPARDIR, BTISRVPARLARGO, BTISRVCATIT, BTISRVPARITTIPO
            FROM BTI019 WHERE BTISRVNOM = @srv AND BTIMTDNOM = @mtd ORDER BY BTISRVPARPOSI`);

  const entrada = r19.recordset.filter(r => r.BTISRVPARDIR === 'I');
  const salida  = r19.recordset.filter(r => (r.BTISRVPARDIR === 'O' || r.BTISRVPARDIR === 'R') && r.BTISRVPARNOM !== 'businessErrors');

  const sdtCache = new Map();
  async function fetchSdt(sdtNom, visitados = new Set()) {
    if (visitados.has(sdtNom) || sdtCache.has(sdtNom)) return;
    visitados.add(sdtNom);
    const r26 = await pool.request()
      .input('sdt', sql.VarChar(100), sdtNom)
      .query(`SELECT BTISDTELEMNOM, BTISDTELEMTIPO, BTISDTELEMLARGO, BTISDTELEMCAT, BTISDTELEMSDT
              FROM BTI026 WHERE BTISDTNOM = @sdt ORDER BY BTISDTELEMNOM`);
    if (!r26.recordset.length) return;
    sdtCache.set(sdtNom, r26.recordset);
    for (const c of r26.recordset) {
      const ref = (c.BTISDTELEMSDT && c.BTISDTELEMSDT.trim()) ||
                  (c.BTISDTELEMTIPO && c.BTISDTELEMTIPO.match(/^(Sdt|BT)/) ? c.BTISDTELEMTIPO.trim() : null);
      if (ref) await fetchSdt(ref, visitados);
    }
  }

  for (const p of [...entrada, ...salida]) {
    const ref = (p.BTISRVPARITTIPO && p.BTISRVPARITTIPO.trim()) ||
                (p.BTISRVVARTIPO && p.BTISRVVARTIPO.match(/^(Sdt|BT)/) ? p.BTISRVVARTIPO.trim() : null);
    if (ref) await fetchSdt(ref);
  }

  const btinreq = { Canal: 'BTDIGITAL', Usuario: 'INSTALADOR', Device: 'INSTALADOR', Requerimiento: '1', Token: '673543DE2A22DFAC951F9E41' };
  const entradaNombres = new Set(entrada.map(r => r.BTISRVPARNOM.toLowerCase()));
  const filteredParams = inputParams
    ? Object.fromEntries(Object.entries(inputParams).filter(([k]) => entradaNombres.has(k.toLowerCase())))
    : {};
  const requestPayload  = { Btinreq: btinreq, ...construirJsonParams(entrada, sdtCache), ...filteredParams };
  const responsePayload = {
    Btinreq: btinreq,
    ...construirJsonParams(salida, sdtCache),
    BusinessErrors: '',
    Btoutreq: { Estado: 'OK', Fecha: '2026-01-01', Hora: '00:00:00', Numero: '00000000', Servicio: `${SERVICIO}.${metodo}`, Requerimiento: '1', Canal: 'BTDIGITAL' },
    _xmlns: 'http://uy.com.dlya.bantotal/BTSOA/'
  };

  let requestJson        = JSON.stringify(requestPayload, null, 2);
  let responseJson       = JSON.stringify(responsePayload, null, 2);
  let realResponse       = null;
  let xmlToken           = '673543DE2A22DFAC951F9E41';
  let realRequestPayload = null;
  let respuestaReal      = null;

  if (ejecutar) {
    try {
      process.stdout.write(`  🌐 Llamando API... `);
      const execUrl = `${API_BASE_URL}/servlet/com.dlya.bantotal.ardwsbt_${SERVICIO}_v1?${metodo}`;
      const respuesta = await ejecutarServicio(execUrl, requestPayload);

      const esError = respuesta.Btoutreq?.Estado === 'NEG_ERROR' ||
        (Array.isArray(respuesta.Erroresnegocio) && respuesta.Erroresnegocio.some(e => e.Severidad === 'E'));

      // Siempre guardamos la respuesta real en el .md (aunque sea error de negocio)
      realResponse       = esError ? null : respuesta;  // null = no extraer del contexto del workflow
      xmlToken           = cachedToken;
      respuestaReal      = respuesta;
      realRequestPayload = { ...requestPayload, Btinreq: { ...requestPayload.Btinreq, Token: cachedToken } };
      responseJson       = JSON.stringify(respuesta, null, 2);
      requestJson        = JSON.stringify(realRequestPayload, null, 2);
      const estado = respuesta.Btoutreq?.Estado || '?';
      console.log(esError ? `⚠️  ${estado}` : '✅');
    } catch (e) {
      console.log(`⚠️  ${e.message} — usando valores de ejemplo`);
    }
  }

  const requestXml  = realRequestPayload
    ? buildRequestXmlFromJson(metodo, realRequestPayload)
    : buildRequestXml(metodo, entrada, sdtCache, xmlToken);
  const responseXml = respuestaReal
    ? buildResponseXmlFromJson(metodo, respuestaReal)
    : buildResponseXml(metodo, salida, sdtCache);

  const bloqueInvocacion = `::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab XML
\`\`\`xml
${requestXml}
\`\`\`
@tab JSON
\`\`\`json
${requestJson}
\`\`\`
:::`;

  const bloqueRespuesta = `::: details Ejemplo de Respuesta
::: code-tabs #Formato
@tab XML
\`\`\`xml
${responseXml}
\`\`\`
@tab JSON
\`\`\`json
${responseJson}
\`\`\`
:::`;

  const sdtContent = generarSeccionSdt(entrada, salida, sdtCache);
  const bloqueSDT = sdtContent
    ? `## **Tipos de Dato Estructurado**\n\n<!-- ABRE SDT -->\n${sdtContent}\n<!-- CIERRA SDT -->`
    : `## **Tipos de Dato Estructurado**`;

  const tablaEntrada = generarTablaParams(entrada, sdtCache);
  const tablaSalida  = generarTablaParams(salida, sdtCache);
  const bloqueTabla  = `::: tabs #Datos\n\n@tab Datos de Entrada\n\n${tablaEntrada}\n\n@tab Datos de Salida\n\n${tablaSalida}\n\n@tab Errores\n\nCódigo | Descripción\n:--------- | :-----------\nCompletar manualmente | Completar manualmente\n\n:::`;

  if (!fs.existsSync(BTPARTNERS_DIR)) fs.mkdirSync(BTPARTNERS_DIR, { recursive: true });

  if (!fs.existsSync(filePath)) {
    const titulo = formatearTitulo(metodo);
    const esqueleto = `---
title:  ${titulo}
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
::: note Método ${titulo} de Partner.

**Nombre publicación:** ${SERVICIO}.${metodo}

**Programa:** ${programa}

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------

@tab Errores

Código | Descripción
:--------- | :-----------
Completar manualmente | Completar manualmente

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**
`;
    fs.writeFileSync(filePath, esqueleto, 'utf8');
  }

  let contenido = fs.readFileSync(filePath, 'utf8');
  contenido = reemplazarSeccion(contenido,
    '<!-- ABRE TABLA DE DATOS -->',
    '<!-- CIERRA TABLA DE DATOS -->',
    bloqueTabla
  );
  contenido = reemplazarSeccion(contenido,
    '<!-- ABRE EJEMPLO DE INVOCACIÓN -->',
    '<!-- CIERRA EJEMPLO DE INVOCACIÓN -->',
    bloqueInvocacion
  );
  contenido = reemplazarSeccion(contenido,
    '<!-- ABRE EJEMPLO DE RESPUESTA -->',
    '<!-- CIERRA EJEMPLO DE RESPUESTA -->',
    bloqueRespuesta
  );
  // Reemplaza todo desde ## **Tipos de Dato Estructurado** hasta el final
  contenido = contenido.replace(/## \*\*Tipos de Dato Estructurado\*\*[\s\S]*$/, bloqueSDT + '\n');
  fs.writeFileSync(filePath, contenido, 'utf8');

  return realResponse;
}

// ── MODO WORKFLOW ─────────────────────────────────────────────

async function ejecutarWorkflow(pool, workflowFile) {
  let workflow;
  try {
    workflow = JSON.parse(fs.readFileSync(workflowFile, 'utf8'));
  } catch (e) {
    console.error(`❌ No se pudo leer el workflow: ${e.message}`);
    process.exit(1);
  }

  const { steps, discovery = [] } = workflow;
  if (!Array.isArray(steps) || steps.length === 0) {
    console.error('❌ El workflow debe tener "steps"');
    process.exit(1);
  }

  let context = {};
  let ok = 0, errores = 0;

  if (discovery.length > 0) {
    console.log('🔍 Fase de descubrimiento...');
    for (const entry of discovery) {
      if (!entry.as || !entry.query) continue;
      try {
        const result = await pool.request().query(entry.query);
        if (result.recordset.length > 0) {
          const value = Object.values(result.recordset[0])[0];
          setPath(context, entry.as, value);
          console.log(`  ✅ ${entry.as} = ${JSON.stringify(value)}`);
        } else {
          console.log(`  ⚠️  ${entry.as}: query sin resultados — revisá la consulta`);
        }
      } catch (e) {
        console.log(`  ❌ ${entry.as}: ${e.message}`);
      }
    }
    console.log('─'.repeat(50));
  }

  console.log(`🔄 Workflow: ${steps.length} pasos`);
  console.log('─'.repeat(50));

  for (const step of steps) {
    const { method, params: stepParams = {}, extract = [] } = step;
    if (!method) { console.error('❌ Paso sin "method", saltando'); errores++; continue; }

    const mergedParams = deepMerge(context, stepParams);
    const filePath = path.join(BTPARTNERS_DIR, `${method}.md`);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${SERVICIO}.${method} → archivo no encontrado, saltando`);
      errores++;
      continue;
    }

    process.stdout.write(`▶ ${SERVICIO}.${method}...`);

    try {
      const response = await actualizarMetodo(pool, method, filePath, true, mergedParams);

      if (response && extract.length > 0) {
        for (const entry of extract) {
          if (typeof entry === 'string') {
            if (response[entry] !== undefined) {
              context[entry] = response[entry];
              console.log(`  📎 Extraído: ${entry} = ${JSON.stringify(response[entry])}`);
            }
          } else if (typeof entry === 'object' && entry.path && entry.as) {
            const value = resolvePath(response, entry.path);
            if (value !== undefined) {
              setPath(context, entry.as, value);
              console.log(`  📎 Extraído: ${entry.as} = ${JSON.stringify(value)}`);
            } else {
              console.log(`  ⚠️  Ruta "${entry.path}" no encontrada en la respuesta`);
            }
          }
        }
      }

      console.log(`  ✔ actualizado`);
      ok++;
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
      errores++;
    }
  }

  console.log('─'.repeat(50));
  console.log(`✅ Actualizados: ${ok} | ❌ Errores: ${errores}`);
}

// ── ENTRY POINT ───────────────────────────────────────────────

(async () => {
  const rawArgs   = process.argv.slice(2);
  const ejecutar  = rawArgs.includes('--ejecutar');
  const wfIdx     = rawArgs.indexOf('--workflow');
  const workflowFile = wfIdx !== -1 ? rawArgs[wfIdx + 1] : null;
  const metodoArg = rawArgs.filter(a => !a.startsWith('--') && a !== (workflowFile || ''))[0];

  let pool;
  try {
    pool = await new sql.ConnectionPool(DB_CONFIG).connect();
    console.log('✅ Conectado a SQL Server');
  } catch (e) {
    console.error('❌ Error de conexión:', e.message);
    process.exit(1);
  }

  // Modo workflow
  if (workflowFile) {
    await ejecutarWorkflow(pool, workflowFile);
    await pool.close();
    return;
  }

  // Modo normal (todos o uno)
  const metodos = metodoArg
    ? (METODOS_ACTIVOS.has(metodoArg) ? [metodoArg] : [])
    : [...METODOS_ACTIVOS];

  if (metodos.length === 0) {
    console.error(`❌ Método no reconocido: ${metodoArg}`);
    await pool.close();
    process.exit(1);
  }

  console.log(`📋 Procesando ${metodos.length} método(s)${ejecutar ? ' (con llamada real a la API)' : ''}...`);
  console.log('─'.repeat(50));

  let ok = 0, errores = 0;
  for (const metodo of metodos) {
    const filePath = path.join(BTPARTNERS_DIR, `${metodo}.md`);
    process.stdout.write(`▶ ${SERVICIO}.${metodo}...`);
    try {
      await actualizarMetodo(pool, metodo, filePath, ejecutar);
      console.log(` ✔ actualizado`);
      ok++;
    } catch (e) {
      console.log(` ❌ ${e.message}`);
      errores++;
    }
  }

  await pool.close();
  console.log('─'.repeat(50));
  console.log(`✅ Actualizados: ${ok} | ❌ Errores: ${errores}`);
})();
