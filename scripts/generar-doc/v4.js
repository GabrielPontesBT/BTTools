// ============================================================
// Generador de archivos .md para documentacion Bantotal V4
// Uso: node generar_md.js PublicCASHManagement getServices
// ============================================================

require('./_node-modules')(module, 'V4');
require('dotenv').config();
const oracledb = require('oracledb');
const fs = require('fs');
const http = require('http');
const xml2js = require('xml2js');
const { spawnSync } = require('child_process');
const os = require('os');
const path = require('path');

const toFolderName = s => s
  .replace(/^Public/, '')
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
  .replace(/([a-z\d])([A-Z])/g, '$1-$2');

// ── VALIDACION DE ENTORNO ─────────────────────────────────────
(function validarEntorno() {
  if (!fs.existsSync(path.join(process.cwd(), '.env'))) {
    console.error('\n❌  Falta el archivo .env en esta carpeta.');
    console.error('   Ejecuta "node setup.js" desde la raiz del proyecto para configurarlo,');
    console.error('   o copia .env.example y editalo con tus datos.\n');
    process.exit(1);
  }
  const BD  = ['DB_USER', 'DB_PASSWORD', 'DB_CONNECT_STRING'];
  const API = ['BASE_URL', 'API_USER', 'API_PASSWORD'];
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
  const msg = e.message || '';
  if (msg.includes('ORA-01017'))
    return `Credenciales incorrectas para "${process.env.DB_USER}". Verifica DB_USER y DB_PASSWORD en el archivo .env.`;
  if (msg.includes('ORA-12541'))
    return `No hay listener en el servidor Oracle. Verifica que el servicio este activo en DB_CONNECT_STRING: "${process.env.DB_CONNECT_STRING}".`;
  if (msg.includes('ORA-12154'))
    return `No se pudo resolver el connect string "${process.env.DB_CONNECT_STRING}". Verifica el formato host:puerto/servicio en el archivo .env.`;
  if (msg.includes('ORA-12170') || msg.includes('ORA-12535'))
    return `Timeout al conectar con Oracle. El servidor no responde o un firewall bloquea el puerto.`;
  if (msg.includes('ORA-12514'))
    return `El servicio Oracle no existe. Verifica el nombre del servicio en DB_CONNECT_STRING: "${process.env.DB_CONNECT_STRING}".`;
  if (msg.includes('DPI-1047'))
    return `Oracle Instant Client no esta instalado o no se encuentra en el PATH del sistema.\n   Descargalo en: https://www.oracle.com/database/technologies/instant-client.html`;
  return msg;
}

// ── CONFIGURACION ─────────────────────────────────────────────
const DB_CONFIG = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

// ── MAPEO DE TIPOS ────────────────────────────────────────────
const TIPO_MAP = { C: 'String', N: 'Integer', D: 'Date', B: 'Boolean', F: 'Decimal' };

function capitalizarTipo(tipo) {
  if (!tipo) return 'String';
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

function mapearTipo(tipo, largo, esColeccion, deci) {
  if (esColeccion === 'C') return 'Collection';
  const t = TIPO_MAP[tipo] || capitalizarTipo(tipo);
  if (largo && largo !== '0' && largo !== 0) {
    const lenStr = (deci && deci !== '0' && deci !== 0) ? `${largo}.${deci}` : `${largo}`;
    return `${t} $<(Length: ${lenStr})>$`;
  }
  return t;
}

// ── TRADUCCION DE TÍTULOS ─────────────────────────────────────
const TITULO_MAP = { 'get': 'Obtener', 'create': 'Crear', 'add': 'Agregar', 'update': 'Actualizar', 'delete': 'Eliminar', 'load': 'Cargar', 'process': 'Procesar', 'authorize': 'Autorizar', 'reject': 'Rechazar', 'stop': 'Detener', 'view': 'Ver', 'upload': 'Subir', 'enter': 'Ingresar', 'work': 'Trabajar', 'send': 'Enviar', 'set': 'Establecer', 'check': 'Verificar', 'validate': 'Validar', 'generate': 'Generar', 'calculate': 'Calcular', 'search': 'Buscar', 'list': 'Listar' };

const PALABRAS_MAP = {
  'additional': 'Adicional', 'information': 'Información', 'data': 'Datos',
  'account': 'Cuenta', 'accounts': 'Cuentas',
  'balance': 'Saldo', 'balances': 'Saldos',
  'customer': 'Cliente', 'customers': 'Clientes',
  'member': 'Miembro', 'members': 'Miembros',
  'partner': 'Contraparte', 'partners': 'Contrapartes',
  'counterparty': 'Contraparte', 'counterparties': 'Contrapartes',
  'person': 'Persona', 'persons': 'Personas',
  'loan': 'Préstamo', 'loans': 'Préstamos',
  'deposit': 'Depósito', 'deposits': 'Depósitos',
  'payment': 'Pago', 'payments': 'Pagos',
  'transfer': 'Transferencia', 'transfers': 'Transferencias',
  'transaction': 'Transacción', 'transactions': 'Transacciones',
  'card': 'Tarjeta', 'cards': 'Tarjetas',
  'service': 'Servicio', 'services': 'Servicios',
  'product': 'Producto', 'products': 'Productos',
  'type': 'Tipo', 'types': 'Tipos',
  'status': 'Estado', 'statuses': 'Estados',
  'code': 'Código', 'codes': 'Códigos',
  'number': 'Número', 'numbers': 'Números',
  'name': 'Nombre', 'names': 'Nombres',
  'date': 'Fecha', 'dates': 'Fechas',
  'amount': 'Monto', 'amounts': 'Montos',
  'detail': 'Detalle', 'details': 'Detalles',
  'summary': 'Resumen', 'history': 'Historial',
  'list': 'Lista', 'report': 'Reporte', 'reports': 'Reportes',
  'movement': 'Movimiento', 'movements': 'Movimientos',
  'statement': 'Extracto', 'statements': 'Extractos',
  'installment': 'Cuota', 'installments': 'Cuotas',
  'amortization': 'Amortización', 'amortizations': 'Amortizaciones',
  'disbursement': 'Desembolso', 'disbursements': 'Desembolsos',
  'collateral': 'Garantía', 'collaterals': 'Garantías',
  'guarantee': 'Garantía', 'guarantees': 'Garantías',
  'insurance': 'Seguro', 'insurances': 'Seguros',
  'rate': 'Tasa', 'rates': 'Tasas',
  'interest': 'Interés', 'fee': 'Comisión', 'fees': 'Comisiones',
  'charge': 'Cargo', 'charges': 'Cargos',
  'credit': 'Crédito', 'credits': 'Créditos',
  'debit': 'Débito', 'debits': 'Débitos',
  'currency': 'Moneda', 'currencies': 'Monedas',
  'exchange': 'Cambio', 'branch': 'Sucursal', 'branches': 'Sucursales',
  'portfolio': 'Cartera', 'portfolios': 'Carteras',
  'position': 'Posición', 'positions': 'Posiciones',
  'operation': 'Operación', 'operations': 'Operaciones',
  'simulation': 'Simulación', 'simulations': 'Simulaciones',
  'calculation': 'Cálculo', 'calculations': 'Cálculos',
  'classification': 'Clasificación', 'classifications': 'Clasificaciones',
  'segment': 'Segmento', 'segments': 'Segmentos',
  'category': 'Categoría', 'categories': 'Categorías',
  'configuration': 'Configuración', 'setting': 'Configuración', 'settings': 'Configuraciones',
  'record': 'Registro', 'records': 'Registros',
  'approval': 'Aprobación', 'approvals': 'Aprobaciones',
  'authorization': 'Autorización', 'authorizations': 'Autorizaciones',
  'notification': 'Notificación', 'notifications': 'Notificaciones',
  'document': 'Documento', 'documents': 'Documentos',
  'certificate': 'Certificado', 'certificates': 'Certificados',
  'contract': 'Contrato', 'contracts': 'Contratos',
  'risk': 'Riesgo', 'risks': 'Riesgos',
  'rating': 'Calificación', 'ratings': 'Calificaciones',
  'address': 'Dirección', 'addresses': 'Direcciones',
  'contact': 'Contacto', 'contacts': 'Contactos',
  'note': 'Nota', 'notes': 'Notas',
  'comment': 'Comentario', 'comments': 'Comentarios',
  'value': 'Valor', 'values': 'Valores',
  'parameter': 'Parámetro', 'parameters': 'Parámetros',
  'result': 'Resultado', 'results': 'Resultados',
  'order': 'Orden', 'orders': 'Órdenes',
  'schedule': 'Cronograma', 'schedules': 'Cronogramas',
  'term': 'Plazo', 'terms': 'Plazos',
  'period': 'Período', 'periods': 'Períodos',
  'limit': 'Límite', 'limits': 'Límites',
  'quota': 'Cuota', 'quotas': 'Cuotas',
  'available': 'Disponible', 'active': 'Activo', 'inactive': 'Inactivo',
  'current': 'Actual', 'pending': 'Pendiente', 'blocked': 'Bloqueado',
  'all': 'Todos', 'main': 'Principal', 'primary': 'Primario',
  'by': 'Por', 'from': 'De', 'with': 'Con', 'without': 'Sin',
  'new': 'Nuevo', 'old': 'Antiguo', 'total': 'Total',
  'cash': 'Efectivo', 'management': 'Gestión', 'hub': 'Hub',
  'general': 'General', 'public': 'Público', 'global': 'Global',
};

// Palabras en inglés que son adjetivos y deben ir DESPUÉS del sustantivo en español
const ADJETIVOS = new Set([
  'additional', 'extra', 'new', 'old', 'active', 'inactive', 'current',
  'pending', 'blocked', 'available', 'main', 'primary', 'all', 'total',
  'general', 'global', 'public', 'by', 'from', 'with', 'without',
]);

function generarTitulo(metodo) {
  const primeraPalabra = metodo.match(/^[a-z]+/)?.[0] || '';
  const verbEs = TITULO_MAP[primeraPalabra] || primeraPalabra.charAt(0).toUpperCase() + primeraPalabra.slice(1);
  const palabras = metodo.replace(/^[a-z]+/, '').replace(/([A-Z])/g, ' $1').trim().toLowerCase().split(' ').filter(Boolean);
  const sustantivos = palabras.filter(p => !ADJETIVOS.has(p)).map(p => PALABRAS_MAP[p] || (p.charAt(0).toUpperCase() + p.slice(1)));
  const adjetivos   = palabras.filter(p =>  ADJETIVOS.has(p)).map(p => PALABRAS_MAP[p] || (p.charAt(0).toUpperCase() + p.slice(1)));
  return [verbEs, ...sustantivos, ...adjetivos].join(' ');
}

// ── MAPEO DE SEGMENTOS DE MÓDULO ──────────────────────────────
const MODULO_PARTS_MAP = {
  'cashmanagement': 'CashManagement',
  'productshub': 'ProductsHub',
  'savingsaccounts': 'SavingsAccounts',
};

function extraerModulo(programa) {
  if (!programa) return 'Completar manualmente';
  const partes = programa.split('.');
  const idxBantotal = partes.indexOf('bantotal');
  if (idxBantotal === -1) return 'Completar manualmente';
  const moduleParts = partes
    .slice(idxBantotal + 1, -1)
    .filter(p => p !== 'publicapi');
  if (moduleParts.length === 0) return 'Completar manualmente';
  return moduleParts
    .map(p => MODULO_PARTS_MAP[p] || (p.charAt(0).toUpperCase() + p.slice(1)))
    .join('.');
}

function generarTabla(rows) {
  if (!rows || rows.length === 0) return 'No aplica.';
  const lines = ['Nombre | Tipo | Comentarios', ':--------- | :--------- | :---------'];
  for (const r of rows) {
    const parittipo = (r.BTISRVPARITTIPO || '').trim();
    const vartipo   = (r.BTISRVVARTIPO   || '').trim();
    const sdtNombre = (parittipo && parittipo.startsWith('Sdt'))
      ? parittipo
      : (vartipo && vartipo.startsWith('Sdt') ? vartipo : null);
    const tipo = sdtNombre
      ? `[${sdtNombre}](#${sdtNombre.toLowerCase()})`
      : mapearTipo(r.BTISRVVARTIPO, r.BTISRVPARLARGO, r.BTISRVCATIT, r.BTISRVPARDECI);
    lines.push(`${r.BTISRVPARNOM} | ${tipo} | ${r.BTISRVPARDSC ? r.BTISRVPARDSC.trim() : ''}`);
  }
  return lines.join('\n');
}

const SDT_TIPOS_CON_LARGO = new Set(['C', 'N', 'F']);

function generarTablaSdt(rows, sdtNombre) {
  if (!rows || rows.length === 0) return '';
  const lines = ['Nombre | Tipo | Comentarios', ':--------- | :--------- | :---------'];
  for (const r of rows) {
    let tipo;
    const sdtRef = r.BTISDTELEMSDT && r.BTISDTELEMSDT.trim();
    if (sdtRef) {
      tipo = `[${sdtRef}](#${sdtRef.toLowerCase()})`;
    } else if (r.BTISDTELEMTIPO && r.BTISDTELEMTIPO.startsWith('Sdt')) {
      const sdtName = r.BTISDTELEMTIPO.trim();
      tipo = `[${sdtName}](#${sdtName.toLowerCase()})`;
    } else {
      tipo = mapearTipo(r.BTISDTELEMTIPO, r.BTISDTELEMLARGO, r.BTISDTELEMCAT, r.BTISDTELEMDECI);
      const tipoRaw = (r.BTISDTELEMTIPO || '').toUpperCase();
      const largo   = parseInt(r.BTISDTELEMLARGO || '0');
      if (SDT_TIPOS_CON_LARGO.has(tipoRaw) && largo === 0) {
        console.warn(`  ⚠️  BTI026 [${sdtNombre || '?'}] ${r.BTISDTELEMNOM}: largo es 0 para tipo ${tipo}.`);
      }
    }
    lines.push(`${r.BTISDTELEMNOM} | ${tipo} | ${r.BTISDTELEMDSC ? r.BTISDTELEMDSC.trim() : ''}`);
  }
  return lines.join('\n');
}

// ── EJECUCION DE SERVICIOS ────────────────────────────────────

const PUBLIC_BASE_URL  = process.env.BASE_URL          || '';
const API_USER         = process.env.API_USER          || 'INSTALADOR';
const API_PASSWORD     = process.env.API_PASSWORD      || 'Bantotal2015';
const API_CANAL        = process.env.API_CANAL         || 'BTDIGITAL';
const API_DEVICE       = process.env.API_DEVICE        || 'INSTALADOR';
const API_REQUERIMIENTO = process.env.API_REQUERIMIENTO || '1';

async function parsearRespuestaSoap(xmlString) {
  try {
    const result = await xml2js.parseStringPromise(xmlString, {
      explicitArray: false,
      ignoreAttrs: true,
      tagNameProcessors: [xml2js.processors.stripPrefix]
    });

    const body = result?.Envelope?.Body;
    if (!body) return null;

    const responseKey = Object.keys(body)[0];
    if (!responseKey) return null;

    const content = body[responseKey];

    // Normalizar BusinessErrors siempre como { BusinessError: [] }
    if (content.BusinessErrors?.BusinessError) {
      const be = content.BusinessErrors.BusinessError;
      content.BusinessErrors = {
        BusinessError: (Array.isArray(be) ? be : [be]).map(e => ({
          Code: parseInt(e.Code) || e.Code,
          Severity: e.Severity || '',
          Target: e.Target || '',
          Description: e.Description || ''
        }))
      };
    } else {
      content.BusinessErrors = { BusinessError: [] };
    }

    // Normalizar Btoutreq.Numero a número
    if (content.Btoutreq?.Numero) {
      content.Btoutreq.Numero = parseInt(content.Btoutreq.Numero) || content.Btoutreq.Numero;
    }

    return content;
  } catch {
    return null;
  }
}

function httpRequest(method, url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const h = { ...headers };
    if (body) h['Content-Length'] = Buffer.byteLength(body);
    const options = {
      hostname: u.hostname,
      port: u.port || 80,
      path: u.pathname + u.search,
      method,
      headers: h
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function httpPost(url, body, headers = {}) {
  return httpRequest('POST', url, body, headers);
}

async function obtenerToken() {
  const body = JSON.stringify({ UserId: API_USER, UserPassword: API_PASSWORD });

  const response = await httpPost(`${PUBLIC_BASE_URL}/Authenticate/v1/Execute`, body, {
    'Content-Type': 'application/json',
    'cache-control': 'no-cache',
    Canal:          API_CANAL,
    Device:         API_DEVICE,
    Usuario:        API_USER,
    Requerimiento:  API_REQUERIMIENTO,
    Token:          '',
    'idempotency-key': '1'
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

async function llamarServicio(url, payload, token, method = 'POST') {
  const btHeaders = {
    'cache-control': 'no-cache',
    Canal:          API_CANAL,
    Device:         API_DEVICE,
    Usuario:        API_USER,
    Requerimiento:  API_REQUERIMIENTO,
    Token:          token,
    'idempotency-key': '1'
  };
  let finalUrl = url;
  let body = null;
  if (method === 'GET') {
    const qs = Object.entries(payload || {}).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(typeof v === 'object' ? JSON.stringify(v) : v)}`).join('&');
    if (qs) finalUrl = url + '?' + qs;
  } else {
    body = JSON.stringify(payload);
    btHeaders['Content-Type'] = 'application/json';
  }
  const response = await httpRequest(method, finalUrl, body, btHeaders);
  const trimmed = response.trim();
  if (trimmed === '') return null;
  if (!trimmed.startsWith('{')) {
    if (trimmed.startsWith('<')) {
      const convertido = await parsearRespuestaSoap(trimmed);
      if (convertido) return convertido;
    }
    throw new Error(`Respuesta inesperada del servidor: ${response.slice(0, 300)}`);
  }
  return JSON.parse(response);
}

function esSessionInvalida(resultado) {
  const errores = resultado.BusinessErrors || resultado.Erroresnegocio || '';
  if (typeof errores === 'string') return /sesi[oó]n\s*inv[aá]lida/i.test(errores);
  const lista = errores?.BTErrorNegocio;
  if (Array.isArray(lista)) return lista.some(e => /sesi[oó]n\s*inv[aá]lida/i.test(e.Descripcion || ''));
  return false;
}

async function ejecutarServicio(url, payload, method = 'POST') {
  if (!cachedToken) cachedToken = await obtenerToken();
  const resultado = await llamarServicio(url, payload, cachedToken, method);
  if (resultado !== null && esSessionInvalida(resultado)) {
    process.stdout.write('🔄 ');
    cachedToken = await obtenerToken();
    return llamarServicio(url, payload, cachedToken, method);
  }
  return resultado;
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

    // XxxId antes que XxxDescription (mismo prefijo)
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
      const itemNom = r.BTISRVPARITNOM ? r.BTISRVPARITNOM.trim() : null;
      if (sdtCache.has(sdtNom)) {
        const itemObj = construirObjeto(sdtNom, sdtCache);
        obj[r.BTISRVPARNOM] = itemNom ? { [itemNom]: [itemObj] } : [itemObj];
      } else if (sdtNom.startsWith('Sdt')) {
        obj[r.BTISRVPARNOM] = itemNom ? { [itemNom]: [{}] } : [{}];
      } else {
        // BTISRVPARITTIPO contiene un tipo primitivo, no un SDT real
        obj[r.BTISRVPARNOM] = valorEjemplo(r.BTISRVVARTIPO);
      }
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

const GET_PREFIXES    = ['get', 'list', 'search', 'find', 'fetch', 'obtain', 'retrieve', 'check', 'validate'];
const DELETE_PREFIXES = ['delete', 'remove', 'cancel', 'drop', 'deactivate', 'unregister'];
const PUT_PREFIXES    = ['update', 'set', 'modify', 'edit', 'change', 'replace', 'patch'];

function inferirMetodoHttp(metodo) {
  const lower = metodo.toLowerCase();
  if (GET_PREFIXES.some(p => lower.startsWith(p)))    return 'GET';
  if (DELETE_PREFIXES.some(p => lower.startsWith(p))) return 'DELETE';
  if (PUT_PREFIXES.some(p => lower.startsWith(p)))    return 'PUT';
  return 'POST';
}

function buildCurlCmd(httpMethod, url, payload, headers = {}) {
  const headerLines = Object.entries(headers).map(([k, v]) => `  -H '${k}: ${v}' \\`);
  const hasParams = Object.keys(payload).length > 0;
  let finalUrl = url;
  let bodyLines = [];
  if (httpMethod === 'GET') {
    if (hasParams) {
      const qs = Object.entries(payload).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(typeof v === 'object' ? JSON.stringify(v) : v)}`).join('&');
      finalUrl = `${url}?${qs}`;
    }
    const lines = [`curl -X GET \\`, `  '${finalUrl}' \\`, ...headerLines];
    lines[lines.length - 1] = lines[lines.length - 1].replace(/ \\$/, '');
    return lines.join('\n');
  }
  const json = JSON.stringify(payload, null, 2);
  const lines = [
    `curl -X ${httpMethod} \\`,
    `  '${finalUrl}' \\`,
    ...headerLines,
    ...(hasParams
      ? [`  -H 'Content-Type: application/json' \\`, `  -d '${json}'`]
      : [`  -H 'Content-Type: application/json'`])
  ];
  return lines.join('\n');
}

function _ts(label, t0) {
  const ms = Date.now() - t0;
  console.log(`  ⏱  ${label}: ${ms}ms`);
  return Date.now();
}

function buildCurlCmdPlaceholder(httpMethod, endpointPath, queryParams, bodyParams) {
  const hasQuery = Object.keys(queryParams).length > 0;
  const hasBody  = Object.keys(bodyParams).length > 0;

  let finalUrl = `{{baseUrl}}${endpointPath}`;
  if (hasQuery) {
    const qs = Object.entries(queryParams)
      .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('&');
    finalUrl += `?${qs}`;
  }

  const headerLines = [
    `  -H 'Device: {{device}}' \\`,
    `  -H 'Usuario: {{usuario}}' \\`,
    `  -H 'Requerimiento: {{requerimiento}}' \\`,
    `  -H 'Canal: {{canal}}' \\`,
    `  -H 'Token: {{token}}' \\`,
  ];

  if (hasBody) {
    const json = JSON.stringify(bodyParams, null, 2);
    return [
      `curl -X ${httpMethod} \\`,
      `  '${finalUrl}' \\`,
      ...headerLines,
      `  -H 'Content-Type: application/json' \\`,
      `  -d '${json}'`
    ].join('\n');
  }

  const lines = [`curl -X ${httpMethod} \\`, `  '${finalUrl}' \\`, ...headerLines];
  lines[lines.length - 1] = lines[lines.length - 1].replace(/ \\$/, '');
  return lines.join('\n');
}

async function generarMd(servicio, metodo, carpeta, ejecutar = false, inputParams = null, cachedData = null) {
  const t0 = Date.now();
  console.log(`\n🔧 Generando ${servicio}.${metodo}${cachedData ? ' (desde caché)' : ''}`);

  // ── Datos de BTI014 / BTI019 / BTI026 ────────────────────────
  // Si hay datos en caché los usa directamente sin conectar a Oracle.
  let conn = null;
  let r14rows, r19rows;
  const sdtCache = new Map();

  if (cachedData) {
    r14rows = [cachedData.bti014];
    r19rows = cachedData.bti019 || [];
    for (const [nom, fields] of Object.entries(cachedData.sdt || {})) {
      sdtCache.set(nom, sortSdtFields(fields));
    }
    console.log(`  📦 SDTs en caché: ${sdtCache.size}`);
  } else {
    try {
      conn = await oracledb.getConnection(DB_CONFIG);
      _ts('Conexión Oracle', t0);
    } catch (e) {
      console.error('❌ Error de conexión:', e.message);
      return;
    }
  }

  const tConn = Date.now();
  try {
    // ── BTI014 - Info del metodo ──
    if (!cachedData) {
      const r14 = await conn.execute(
        `SELECT BTIMTDDSC, BTIMTDPGMNOM FROM BTI014 WHERE BTISRVNOM = :1 AND BTIMTDNOM = :2`,
        [servicio, metodo],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      _ts('BTI014', tConn);
      if (r14.rows.length === 0) {
        console.error(`❌ No se encontró '${servicio}.${metodo}' en BTI014`);
        return;
      }
      r14rows = r14.rows;
    }

    if (r14rows.length === 0) {
      console.error(`❌ No se encontró '${servicio}.${metodo}' en BTI014`);
      return;
    }

    const descripcionRaw = r14rows[0].BTIMTDDSC ? r14rows[0].BTIMTDDSC.trim() : '';

    const titulo = metodo.replace(/([A-Z])/g, ' $1').trim().replace(/^[a-z]/, c => c.toUpperCase());
    const descripcion = descripcionRaw || '[Pendiente de completar]';
    const programa = r14rows[0].BTIMTDPGMNOM || '';
    const progParts = programa.split('.');
    const progFinal = progParts.length >= 2
      ? (() => {
          const penultima = progParts[progParts.length - 2];
          const ultimaRaw = progParts[progParts.length - 1].toUpperCase();
          const ultima = ultimaRaw.startsWith('A') ? ultimaRaw.slice(1) : ultimaRaw;
          const penultimaFmt = penultima.toUpperCase().replace('PUBLICAPI', 'PublicAPI');
          return `${penultimaFmt}.${ultima}`;
        })()
      : 'Completar manualmente';
    const progNombreKB = progParts.length > 0 ? progParts[progParts.length - 1].toUpperCase() : '';

    // ── BTI019 - Parametros ──
    if (!cachedData) {
      const tBti014 = Date.now();
      const r19 = await conn.execute(
        `SELECT BTISRVPARNOM, BTISRVVARTIPO, BTISRVPARDIR, BTISRVPARDSC, BTISRVPARLARGO, BTISRVPARDECI, BTISRVCATIT, BTISRVPARITTIPO, BTISRVPARITNOM
         FROM BTI019 WHERE BTISRVNOM = :1 AND BTIMTDNOM = :2 ORDER BY BTISRVPARPOSI`,
        [servicio, metodo],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      _ts('BTI019', tBti014);
      r19rows = r19.rows;
    }

    const entrada = r19rows.filter(r => r.BTISRVPARDIR === 'I');
    const salida  = r19rows.filter(r => (r.BTISRVPARDIR === 'O' || r.BTISRVPARDIR === 'R') && r.BTISRVPARNOM !== 'businessErrors');

    // ── BTI026 - SDTs (con soporte de anidados) ──
    let sdtSection = '';
    const sdtsConTipo = [...entrada, ...salida].filter(r =>
      r.BTISRVPARNOM !== 'businessErrors' &&
      ((r.BTISRVCATIT === 'S' && r.BTISRVPARITTIPO) ||
       (r.BTISRVVARTIPO && r.BTISRVVARTIPO.startsWith('Sdt')))
    );

    const tSdtStart = Date.now();
    if (!cachedData) console.log(`  📦 SDTs a resolver: ${sdtsConTipo.length}`);
    async function fetchSdtCache(sdtNomDB, visitados = new Set()) {
      if (cachedData || visitados.has(sdtNomDB) || sdtCache.has(sdtNomDB)) return;
      visitados.add(sdtNomDB);
      const tq = Date.now();
      const r26 = await conn.execute(
        `SELECT BTISDTELEMNOM, BTISDTELEMTIPO, BTISDTELEMLARGO, BTISDTELEMDECI, BTISDTELEMCAT, BTISDTELEMDSC, BTISDTELEMSDT
         FROM BTI026 WHERE BTISDTNOM = :1 ORDER BY BTISDTELEMNOM`,
        [sdtNomDB],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      _ts(`  BTI026(${sdtNomDB})`, tq);
      if (r26.rows.length === 0) return;
      sdtCache.set(sdtNomDB, sortSdtFields(r26.rows));
      for (const campo of r26.rows) {
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
      const tabla = generarTablaSdt(rows, sdtNomDB);
      sdtSection += `
::: details ${sdtNomDB}

### ${sdtNomDB}

::: center
Los campos del tipo de dato estructurado ${sdtNomDB} son los siguientes:

${tabla}
:::
`;
      for (const campo of rows) {
        const nestedSdt = (campo.BTISDTELEMSDT && campo.BTISDTELEMSDT.trim()) ||
                          (campo.BTISDTELEMTIPO && campo.BTISDTELEMTIPO.startsWith('Sdt') ? campo.BTISDTELEMTIPO.trim() : null);
        if (nestedSdt) await procesarSdt(campo.BTISDTELEMNOM, nestedSdt, procesados);
      }
    }

    for (const param of sdtsConTipo) {
      const sdtNomDB = (param.BTISRVPARITTIPO && param.BTISRVPARITTIPO.trim()) || param.BTISRVVARTIPO;
      await procesarSdt(param.BTISRVPARNOM, sdtNomDB);
    }
    _ts(`SDTs total (${sdtCache.size} tipos resueltos)`, tSdtStart);

    // ── URL y método HTTP ──
    const httpMethod    = inferirMetodoHttp(metodo);
    const serviceSuffix = servicio.replace(/^Public/, '');
    const endpointBasePath = `/public/${serviceSuffix}/v1/${metodo}`;
    const url              = `${process.env.BASE_URL || ''}${endpointBasePath}`;

    // ── Headers de autenticación (van en HTTP, no en el body) ──
    const authHeaders = {
      Device:         API_DEVICE,
      Usuario:        API_USER,
      Requerimiento:  API_REQUERIMIENTO,
      Canal:          API_CANAL,
      Token:          '23B342928917607ECECF65BD'
    };

    // ── Ejemplos JSON (body sin Btinreq) ──
    const entradaNombres = new Set(entrada.map(r => r.BTISRVPARNOM));
    const filteredParams = inputParams
      ? Object.fromEntries(Object.entries(inputParams).filter(([k]) => entradaNombres.has(k)))
      : {};
    const requestPayload  = { ...construirJsonParams(entrada, sdtCache), ...filteredParams };
    const salidaPayload   = construirJsonParams(salida, sdtCache);
    const responsePayload = Object.keys(salidaPayload).length > 0 ? salidaPayload : {};

    const endpointPath = endpointBasePath;

    const exPayloadQuery = construirJsonParams(entradaQuery, sdtCache);
    const exPayloadBody  = construirJsonParams(entradaBody, sdtCache);
    let jsonEjemplo  = Object.keys(exPayloadBody).length > 0 ? JSON.stringify(exPayloadBody, null, 2) : null;
    let curlCmd      = buildCurlCmdPlaceholder(httpMethod, endpointPath, exPayloadQuery, exPayloadBody);
    let responseJson = JSON.stringify(responsePayload, null, 2);

    let realResponse = null;
    if (ejecutar) {
      try {
        process.stdout.write(`  🌐 Ejecutando ${servicio}.${metodo}... `);
        const serviceSuffixExec = servicio.replace(/^Public/, '');
        const respuestaReal = await ejecutarServicio(
          `${PUBLIC_BASE_URL}/public/${serviceSuffixExec}/v1/${metodo}`,
          requestPayload,
          httpMethod
        );
        if (respuestaReal !== null) {
          // Limpiar envelope de la respuesta antes de mostrarla
          const { Btinreq: _bi, Btoutreq: _bo, BusinessErrors: _be, ...cleanResp } = respuestaReal;
          responseJson = JSON.stringify(Object.keys(cleanResp).length > 0 ? cleanResp : respuestaReal, null, 2);
        }
        realResponse = respuestaReal ?? {};
        console.log('✅');
      } catch (e) {
        console.log(`⚠️  ${e.message} — usando valores de ejemplo`);
      }
    }

    // ── Split entrada: GUID → query string, resto → body ──
    const esGuid       = r => (r.BTISRVPARNOM || '').toUpperCase().includes('GUID');
    const usaQueryAll  = httpMethod === 'GET' || httpMethod === 'DELETE';
    const entradaQuery = usaQueryAll ? entrada : entrada.filter(esGuid);
    const entradaBody  = usaQueryAll ? []      : entrada.filter(r => !esGuid(r));

    // ── Tablas ──
    const tablaEntrada = generarTabla(entrada);
    const tablaSalida  = generarTabla(salida);

    // ── Errores posibles (Documentador de Errores) ──
    let tablaErrores = `Código | Descripción\n:--------- | :---------\nCompletar manualmente | Completar manualmente`;
    const _docModelos = process.env.DOC_ERRORES_MODELOS;
    const scriptFile = path.join(process.cwd(), '..', 'error-docs', 'scripts', 'simulate_program_flow.py');
    if (_docModelos && progNombreKB && fs.existsSync(scriptFile)) {
      const progNombreScript = progNombreKB.startsWith('A') ? progNombreKB.slice(1) : progNombreKB;
      console.log(`⏳ Documentando errores para ${progNombreScript}...`);
      const tPy = Date.now();
      const tmpFile = `${os.tmpdir()}\\errores_${progNombreScript}_${Date.now()}.md`;
      const result = spawnSync('python', [scriptFile, progNombreScript, '--models', _docModelos, '--errors-md', tmpFile], {
        encoding: 'utf8',
        timeout: 180000,
      });
      _ts('Script Python errores', tPy);
      if (result.status === 0 && fs.existsSync(tmpFile)) {
        const raw = fs.readFileSync(tmpFile, 'utf8').replace(/^﻿/, '').trim();
        const dataLines = raw.split('\n').filter(l => l.trim()).slice(2);
        if (dataLines.length > 0) {
          const errRows = dataLines.map(line => {
            const parts = line.replace(/^\| /, '').replace(/ \|$/, '').split(' | ');
            return parts.length >= 2 ? `${parts[0].trim()} | ${parts[1].trim()}` : line.trim();
          });
          tablaErrores = `Código | Descripción\n:--------- | :---------\n${errRows.join('\n')}`;
          console.log(`✅ Errores documentados: ${dataLines.length} error(es) para ${progNombreScript}`);
        } else {
          tablaErrores = 'No aplica.';
          console.log(`ℹ️  Sin errores detectados para ${progNombreScript}`);
        }
        try { fs.unlinkSync(tmpFile); } catch {}
      } else {
        const errMsg = (result.stderr || '').slice(0, 200);
        console.warn(`⚠️  No se pudo documentar errores para ${progNombreScript}: ${errMsg}`);
      }
    }

    // ── Template MD ──
    const usaQueryParams   = httpMethod === 'GET' || httpMethod === 'DELETE';
    const tablaQueryParams = generarTabla(entradaQuery);
    const tablaBody        = generarTabla(entradaBody);

    const invocacionTabs = jsonEjemplo
      ? `@tab cURL\n\`\`\`bash\n${curlCmd}\n\`\`\`\n\n@tab JSON Body\n\`\`\`json\n${jsonEjemplo}\n\`\`\``
      : `@tab cURL\n\`\`\`bash\n${curlCmd}\n\`\`\``;

    const md = `---
title: ${titulo}
type: ${httpMethod}
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
${descripcion}

**Nombre publicación:** ${servicio}.${metodo}

**Programa:** ${progFinal}

**Alcance:** Global

**Endpoint:** ${endpointPath}
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

${tablaQueryParams}

@tab Body

${tablaBody}

@tab Datos de Salida

${tablaSalida}

@tab Errores

${tablaErrores}

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

${invocacionTabs}

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

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
    console.log(`  ⏱  TOTAL: ${Date.now() - t0}ms`);

    return realResponse;

  } catch (e) {
    console.error('❌ Error:', e.message);
    return null;
  } finally {
    if (conn) await conn.close();
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

  const dir = folder || toFolderName(servicio);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (
        source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
        target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  let context = {}; // campos acumulados de pasos anteriores
  let ok = 0, errores = 0;

  console.log(`🔄 Iniciando workflow para ${servicio} (${steps.length} pasos)`);
  console.log('─'.repeat(50));

  for (const step of steps) {
    const { method, params: stepParams = {}, extract = [] } = step;
    if (!method) { console.error('❌ Paso sin "method", saltando'); errores++; continue; }

    const mergedParams = deepMerge(context, stepParams);
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
        } else if (typeof entry === 'object' && entry.path && entry.where && entry.field && entry.as) {
          // Formato con filtro: busca el ítem del array que matchea "where" y extrae "field"
          const arr = resolvePath(response, entry.path);
          if (Array.isArray(arr)) {
            const item = arr.find(i =>
              Object.entries(entry.where).every(([k, v]) => String(i[k]) === String(v))
            );
            if (item !== undefined && item[entry.field] !== undefined) {
              context[entry.as] = item[entry.field];
              console.log(`  📎 Extraído: ${entry.as} = ${JSON.stringify(item[entry.field])} (donde ${JSON.stringify(entry.where)})`);
            } else {
              console.log(`  ⚠️  No se encontró ítem con ${JSON.stringify(entry.where)} en "${entry.path}"`);
            }
          } else {
            console.log(`  ⚠️  "${entry.path}" no es un array`);
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

    // Propagar stepParams al contexto para que fluyan a los pasos siguientes
    for (const [k, v] of Object.entries(stepParams)) {
      if (context[k] === undefined) context[k] = v;
    }

    response !== null ? ok++ : errores++;
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`✅ Completados: ${ok} | ❌ Errores: ${errores}`);
}

// ── ENTRY POINT ───────────────────────────────────────────────
if (require.main === module) {
  const rawArgs = process.argv.slice(2);

  // Extraer flags con valor
  function getFlagValue(flag) {
    const idx = rawArgs.indexOf(flag);
    if (idx !== -1 && rawArgs[idx + 1] && !rawArgs[idx + 1].startsWith('--')) return rawArgs[idx + 1];
    return null;
  }

  const ejecutar     = rawArgs.includes('--ejecutar');
  const workflowFile = getFlagValue('--workflow');
  const paramsValue  = getFlagValue('--params');
  const cacheFile    = getFlagValue('--cache-file');

  // Modo workflow
  if (workflowFile) {
    ejecutarWorkflow(workflowFile);
    return;
  }

  // Índices a ignorar al armar args posicionales
  const skipIdx = new Set();
  rawArgs.forEach((a, i) => {
    if (a === '--params' || a === '--workflow' || a === '--cache-file') { skipIdx.add(i); skipIdx.add(i + 1); }
    else if (a.startsWith('--')) skipIdx.add(i);
  });
  const args = rawArgs.filter((_, i) => !skipIdx.has(i));
  const [servicio, metodo, carpeta] = args;

  if (!servicio) {
    console.log('Uso:');
    console.log('  node generar_md.js <Servicio> [Metodo] [--ejecutar] [--params archivo.json]');
    console.log('  node generar_md.js --workflow workflow.json');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node generar_md.js PublicSavingAccounts getDetailedData');
    console.log('  node generar_md.js PublicSavingAccounts --ejecutar --params params.json');
    console.log('  node generar_md.js --workflow workflow.json');
    process.exit(1);
  }

  // Cargar params si se pasaron
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

  // Cargar datos de caché si se pasaron (evita conexión Oracle)
  let cachedData = null;
  if (cacheFile) {
    try {
      cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    } catch (e) {
      console.warn(`⚠️  No se pudo leer --cache-file, se usará Oracle: ${e.message}`);
    }
  }

  const dir = carpeta || toFolderName(servicio);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (metodo) {
    generarMd(servicio, metodo, dir, ejecutar, inputParams, cachedData);
  } else {
    (async () => {
      let conn;
      try {
        conn = await oracledb.getConnection(DB_CONFIG);
      } catch (e) {
        console.error('\n❌  Error de conexion a Oracle:\n   ' + interpretarErrorBD(e) + '\n');
        process.exit(1);
      }
      let metodos = [];
      try {
        const result = await conn.execute(
          `SELECT BTIMTDNOM FROM BTI014 WHERE BTISRVNOM = :1 ORDER BY BTIMTDNOM`,
          [servicio],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (result.rows.length === 0) {
          console.error(`❌ No se encontró el servicio '${servicio}' en BTI014`);
          process.exit(1);
        }
        metodos = result.rows.map(r => r.BTIMTDNOM);
        console.log(`📋 Se encontraron ${metodos.length} métodos para ${servicio}`);
      } finally {
        await conn.close();
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
