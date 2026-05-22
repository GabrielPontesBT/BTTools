// Diagnóstico: encuentra productos/combos válidos para SimularPrestamo y SimularVehicular
require('dotenv').config();
const sql  = require('mssql');
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

const API_BASE_URL = process.env.API_BASE_URL || '';
const API_AUTH_URL = process.env.API_AUTH_URL || '';
const API_USER     = process.env.API_USER     || 'INSTALADOR';
const API_PASSWORD = process.env.API_PASSWORD || '';

const agent = new https.Agent({ rejectUnauthorized: false });

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const isHttps = u.protocol === 'https:';
    const options = {
      hostname: u.hostname,
      port: u.port || (isHttps ? 443 : 80),
      path: u.pathname + u.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'cache-control': 'no-cache' },
      ...(isHttps ? { agent } : {})
    };
    const lib = isHttps ? https : http;
    const req = lib.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

let cachedToken = null;
async function getToken() {
  if (cachedToken) return cachedToken;
  const body = JSON.stringify({
    Btinreq: { Canal: 'BTDIGITAL', Usuario: API_USER, Device: 'INSTALADOR', Requerimiento: '1', Token: '' },
    UserId: API_USER, UserPassword: API_PASSWORD
  });
  const resp = await httpPost(`${API_AUTH_URL}?Execute`, body);
  const parsed = JSON.parse(resp);
  cachedToken = parsed.SessionToken || null;
  return cachedToken;
}

// URL format: /servlet/com.dlya.bantotal.ardwsbt_BTPartners_v1?SimularPrestamo
async function callBT(metodo, params, token) {
  const [servicio, accion] = metodo.includes('.') ? metodo.split('.') : ['BTPartners', metodo];
  const url = `${API_BASE_URL}/servlet/com.dlya.bantotal.ardwsbt_${servicio}_v1?${accion}`;
  const body = JSON.stringify({
    Btinreq: { Canal: 'BTDIGITAL', Usuario: API_USER, Device: 'INSTALADOR', Requerimiento: '1', Token: token },
    ...params
  });
  const resp = await httpPost(url, body);
  try { return JSON.parse(resp); }
  catch(e) { return { _raw: resp.slice(0, 300) }; }
}

function errores(r) {
  const e = r?.Erroresnegocio;
  if (!e || (Array.isArray(e) && e.length === 0)) return '(ninguno)';
  const lista = Array.isArray(e) ? e : [e];
  return lista.map(x => `${x.Codigo}: ${x.Descripcion}`).join(' | ');
}

async function main() {
  const pool = await sql.connect(DB_CONFIG);
  const token = await getToken();
  if (!token) { console.log('ERROR: no token'); process.exit(1); }
  console.log('Token OK:', token.slice(0,8) + '...\n');

  // 1) Ver todos los productos en ARPROD
  console.log('=== ARPROD - Todos los productos ===');
  const prods = await pool.request().query(`SELECT * FROM ARPROD ORDER BY ProdCod`);
  for (const r of prods.recordset) console.log(`  ProdCod=${r.ProdCod} | ${r.ProdDsc} | TpoAltaC=${r.TpoAltaC}`);

  // 2) Ver BTSSIM1 - simulaciones históricas (productos que funcionan)
  console.log('\n=== BTSSIM1 - Simulaciones históricas ===');
  const sim1 = await pool.request().query(`SELECT TOP 10 * FROM BTSSIM1 ORDER BY BTSSIM1Id DESC`);
  for (const r of sim1.recordset) {
    // Extraer productoUId y clienteUId del XML params
    const prodMatch = (r.BTSSIM1XPI || '').match(/<Nombre>ID_PRODUCTO<\/Nombre>\s*<Valor>(\d+)<\/Valor>/);
    const cliMatch  = (r.BTSSIM1XPI || '').match(/<Nombre>ID_CLIENTE<\/Nombre>\s*<Valor>(\d+)<\/Valor>/);
    const montoMatch = (r.BTSSIM1XPI || '').match(/<Nombre>MONTO<\/Nombre>\s*<Valor>([\d.]+)<\/Valor>/);
    const plazoMatch = (r.BTSSIM1XPI || '').match(/<Nombre>PLAZO<\/Nombre>\s*<Valor>(\d+)<\/Valor>/);
    console.log(`  Id=${r.BTSSIM1Id} Tpo=${r.BTSSIM1Tpo} Sts=${r.BTSSIM1Sts} Tas=${r.BTSSIM1Tas} Cta=${r.BTSSIM1Cta}`);
    if (prodMatch) console.log(`    → PRODUCTO=${prodMatch[1]} CLIENTE=${cliMatch?.[1]} MONTO=${montoMatch?.[1]} PLAZO=${plazoMatch?.[1]}`);
  }

  // 3) Ver BTSIM00 - simulaciones BTPartners
  console.log('\n=== Tablas BTSIM* y BTPart* ===');
  const tabs = await pool.request().query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME LIKE 'BTSIM%' OR TABLE_NAME LIKE 'BTPART%' OR TABLE_NAME LIKE 'BTPN%'
    ORDER BY TABLE_NAME
  `);
  console.log('  Tablas:', tabs.recordset.map(r => r.TABLE_NAME).join(', '));

  for (const t of tabs.recordset.slice(0, 5)) {
    try {
      const cols = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='${t.TABLE_NAME}' ORDER BY ORDINAL_POSITION`);
      const data = await pool.request().query(`SELECT TOP 3 * FROM ${t.TABLE_NAME}`);
      console.log(`\n  ${t.TABLE_NAME} cols:`, cols.recordset.map(r => r.COLUMN_NAME).join(', '));
      for (const r of data.recordset) console.log('   ', JSON.stringify(r));
    } catch(e) { console.log(`  Error ${t.TABLE_NAME}:`, e.message); }
  }

  // 4) Obtener partnerUId desde la API
  console.log('\n=== ObtenerPartners ===');
  const rPart = await callBT('BTPartners.ObtenerPartners', {}, token);
  console.log('  Estado:', rPart?.Btoutreq?.Estado);
  const partners = Array.isArray(rPart?.sdtPartners) ? rPart.sdtPartners : [rPart?.sdtPartners].filter(Boolean);
  for (const p of partners.slice(0,5)) console.log(`  partnerUId=${p?.partnerUId} nombre="${p?.nombre}" nivel="${p?.nivel}"`);
  const partnerUId = partners[0]?.partnerUId || 1;

  // 5) ObtenerProductos para ver qué devuelve la API
  console.log('\n=== ObtenerProductos (partnerUId=' + partnerUId + ') ===');
  const rProd = await callBT('BTPartners.ObtenerProductos', {
    sdtPartner: { partnerUId, vendedorUId: 0, puntoVentaUId: 0 },
    sdtVehiculo: { estadoId: 1, versionUId: 1 }
  }, token);
  console.log('  Estado:', rProd?.Btoutreq?.Estado);
  const apiProds = Array.isArray(rProd?.sdtProductos) ? rProd.sdtProductos : [rProd?.sdtProductos].filter(Boolean);
  for (const p of apiProds) console.log(`  productoUId=${p?.productoUId} nombre="${p?.nombre}"`);

  // 6) Test SimularPrestamo con producto 103, cliente 370 (de BTSSIM1)
  console.log('\n=== TEST SimularPrestamo (prod=103, cliente=370, tasa=5) ===');
  const r103 = await callBT('BTPartners.SimularPrestamo', {
    sdtPartner: { partnerUId, vendedorUId: 0, puntoVentaUId: 0 },
    clienteUId: 370,
    sdtSimulacionInput: {
      productoUId: 103, monto: 2, cantidadCuotas: 5,
      tasa: 5, plazo: 5, pizarra: 0, diaPago: 15,
      fechaValor: "2026-05-15", fechaPrimerPago: "2026-06-15",
      actividad: 0, operacionUId: 0
    }
  }, token);
  console.log('  Estado:', r103?.Btoutreq?.Estado);
  console.log('  Errores:', errores(r103));
  if (r103?.sdtSimulacionOutput) console.log('  operacionUId:', r103.sdtSimulacionOutput.operacionUId);

  // 7) Test SimularPrestamo con producto 103, cliente 202 (el cliente del workflow)
  console.log('\n=== TEST SimularPrestamo (prod=103, cliente=202, tasa=5, monto=10000) ===');
  const r103b = await callBT('BTPartners.SimularPrestamo', {
    sdtPartner: { partnerUId, vendedorUId: 0, puntoVentaUId: 0 },
    clienteUId: 202,
    sdtSimulacionInput: {
      productoUId: 103, monto: 10000, cantidadCuotas: 12,
      tasa: 5, plazo: 360, pizarra: 0, diaPago: 15,
      fechaValor: "2026-05-15", fechaPrimerPago: "2026-06-15",
      actividad: 0, operacionUId: 0
    }
  }, token);
  console.log('  Estado:', r103b?.Btoutreq?.Estado);
  console.log('  Errores:', errores(r103b));
  if (r103b?.sdtSimulacionOutput) console.log('  operacionUId:', r103b.sdtSimulacionOutput.operacionUId);

  // 8) Test SimularPrestamo con producto 200, cliente 202, tasa=5 (el original que falla)
  console.log('\n=== TEST SimularPrestamo (prod=200, cliente=202, tasa=5) ===');
  const r200 = await callBT('BTPartners.SimularPrestamo', {
    sdtPartner: { partnerUId, vendedorUId: 0, puntoVentaUId: 0 },
    clienteUId: 202,
    sdtSimulacionInput: {
      productoUId: 200, monto: 10000, cantidadCuotas: 12,
      tasa: 5, plazo: 360, pizarra: 0, diaPago: 15,
      fechaValor: "2026-05-15", fechaPrimerPago: "2026-06-15",
      actividad: 0, operacionUId: 0
    }
  }, token);
  console.log('  Estado:', r200?.Btoutreq?.Estado);
  console.log('  Errores:', errores(r200));

  // 9) Test SimularOfertas con producto 103
  console.log('\n=== TEST SimularOfertas (prod=103, cliente=370) ===');
  const rOf = await callBT('BTPartners.SimularOfertas', {
    sdtPartner: { partnerUId, vendedorUId: 0, puntoVentaUId: 0 },
    clienteUId: 370,
    sdtOfertaInput: {
      monto: 2, cuotas: 5, productoUId: 103, tasa: 5,
      pizzarra: 0, diaPago: 15,
      fechaValor: "2026-05-15", fechaPrimerPago: "2026-06-15"
    }
  }, token);
  console.log('  Estado:', rOf?.Btoutreq?.Estado);
  console.log('  Errores:', errores(rOf));
  console.log('  simulacionId:', rOf?.simulacionId);

  await pool.close();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
