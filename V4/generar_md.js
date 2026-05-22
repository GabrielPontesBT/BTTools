// ============================================================
// Generador de archivos .md para documentacion Bantotal V4
// Uso: node generar_md.js PublicCASHManagement getServices
// ============================================================

require('dotenv').config();
const oracledb = require('oracledb');
const fs = require('fs');
const http = require('http');
const xml2js = require('xml2js');

// ── VALIDACION DE ENTORNO ─────────────────────────────────────
(function validarEntorno() {
  if (!fs.existsSync(__dirname + '/.env')) {
    console.error('\n❌  Falta el archivo .env en esta carpeta.');
    console.error('   Ejecuta "node setup.js" desde la raiz del proyecto para configurarlo,');
    console.error('   o copia .env.example y editalo con tus datos.\n');
    process.exit(1);
  }
  const BD  = ['DB_USER', 'DB_PASSWORD', 'DB_CONNECT_STRING'];
  const API = ['API_BASE_URL', 'API_USER', 'API_PASSWORD'];
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

function mapearTipo(tipo, largo, esColeccion) {
  if (esColeccion === 'C') return 'Collection';
  const t = TIPO_MAP[tipo] || capitalizarTipo(tipo);
  if (largo && largo !== '0' && largo !== 0) return `${t} $<(length: ${largo})>$`;
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
  const lines = ['Nombre | Tipo | Comentarios', ':--------- | :----------- | :-----------'];
  for (const r of rows) {
    const sdtNombre = (r.BTISRVCATIT === 'S' && r.BTISRVPARITTIPO)
      ? r.BTISRVPARITTIPO.trim()
      : (r.BTISRVVARTIPO && r.BTISRVVARTIPO.startsWith('Sdt') ? r.BTISRVVARTIPO.trim() : null);
    const tipo = sdtNombre
      ? `[${sdtNombre}](#${sdtNombre.toLowerCase()})`
      : mapearTipo(r.BTISRVVARTIPO, r.BTISRVPARLARGO, r.BTISRVCATIT);
    lines.push(`${r.BTISRVPARNOM} | ${tipo} | ${r.BTISRVPARDSC ? r.BTISRVPARDSC.trim() : ''}`);
  }
  return lines.join('\n');
}

function generarTablaSdt(rows) {
  if (!rows || rows.length === 0) return '';
  const lines = ['Nombre | Tipo | Comentarios', ':--------- | :----------- | :-----------'];
  for (const r of rows) {
    let tipo;
    const sdtRef = r.BTISDTELEMSDT && r.BTISDTELEMSDT.trim();
    if (sdtRef) {
      tipo = `[${sdtRef}](#${sdtRef.toLowerCase()})`;
    } else if (r.BTISDTELEMTIPO && r.BTISDTELEMTIPO.startsWith('Sdt')) {
      const sdtName = r.BTISDTELEMTIPO.trim();
      tipo = `[${sdtName}](#${sdtName.toLowerCase()})`;
    } else {
      tipo = mapearTipo(r.BTISDTELEMTIPO, r.BTISDTELEMLARGO, r.BTISDTELEMCAT);
    }
    lines.push(`${r.BTISDTELEMNOM} | ${tipo} | ${r.BTISDTELEMDSC ? r.BTISDTELEMDSC.trim() : ''}`);
  }
  return lines.join('\n');
}

// ── EJECUCION DE SERVICIOS ────────────────────────────────────

const API_BASE_URL  = process.env.API_BASE_URL  || 'http://10.0.0.5:8445/btv4core';
const API_AUTH_URL  = process.env.API_AUTH_URL  || 'http://10.0.0.5:8445/btv4core/servlet/com.dlya.bantotal.ardwsbt_Authenticate';
const API_USER      = process.env.API_USER      || 'INSTALADOR';
const API_PASSWORD  = process.env.API_PASSWORD  || 'Bantotal2015';

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

function httpPost(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      port: u.port || 80,
      path: u.pathname + u.search,
      method: 'POST',
      headers: { 'Content-Length': Buffer.byteLength(body), ...headers }
    };
    const req = http.request(options, res => {
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
  const body = JSON.stringify({
    Btinreq: { Canal: 'BTDIGITAL', Usuario: API_USER, Device: 'INSTALADOR', Requerimiento: '1', Token: '' },
    UserId: API_USER,
    UserPassword: API_PASSWORD
  });

  const response = await httpPost(`${API_BASE_URL}/servlet/com.dlya.bantotal.ardwsbt_Authenticate?Execute`, body, {
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

async function ejecutarServicio(url, payload) {
  if (!cachedToken) cachedToken = await obtenerToken();
  const resultado = await llamarServicio(url, payload, cachedToken);
  if (resultado !== null && esSessionInvalida(resultado)) {
    process.stdout.write('🔄 ');
    cachedToken = await obtenerToken();
    return llamarServicio(url, payload, cachedToken);
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

function formatCurl(url, payload) {
  const lines = JSON.stringify(payload, null, 2).split('\n');
  return [
    `{`,
    ...lines.slice(1, -1),
    `${lines[lines.length - 1]}'`
  ].join('\n');
}

async function generarMd(servicio, metodo, carpeta, ejecutar = false, inputParams = null) {
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

    const titulo = metodo.replace(/([A-Z])/g, ' $1').trim().replace(/^[a-z]/, c => c.toUpperCase());
    const descripcion = descripcionRaw || '[Pendiente de completar]';
    const programa = r14.rows[0].BTIMTDPGMNOM || '';
    const progParts = programa.split('.');
    const progFinal = progParts.length >= 2
      ? (() => {
          const penultima = progParts[progParts.length - 2];
          const ultima = progParts[progParts.length - 1].toUpperCase();
          const penultimaFmt = penultima.toUpperCase().replace('PUBLICAPI', 'PublicAPI');
          return `${penultimaFmt}.${ultima}`;
        })()
      : 'Completar manualmente';

    // ── BTI019 - Parametros ──
    const r19 = await conn.execute(
      `SELECT BTISRVPARNOM, BTISRVVARTIPO, BTISRVPARDIR, BTISRVPARDSC, BTISRVPARLARGO, BTISRVCATIT, BTISRVPARITTIPO, BTISRVPARITNOM
       FROM BTI019 WHERE BTISRVNOM = :1 AND BTIMTDNOM = :2 ORDER BY BTISRVPARPOSI`,
      [servicio, metodo],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const entrada = r19.rows.filter(r => r.BTISRVPARDIR === 'I');
    const salida  = r19.rows.filter(r => (r.BTISRVPARDIR === 'O' || r.BTISRVPARDIR === 'R') && r.BTISRVPARNOM !== 'businessErrors');

    // ── BTI026 - SDTs (con soporte de anidados) ──
    let sdtSection = '';
    const sdtCache = new Map();
    const sdtsConTipo = [...entrada, ...salida].filter(r =>
      r.BTISRVPARNOM !== 'businessErrors' &&
      ((r.BTISRVCATIT === 'S' && r.BTISRVPARITTIPO) ||
       (r.BTISRVVARTIPO && r.BTISRVVARTIPO.startsWith('Sdt')))
    );

    async function fetchSdtCache(sdtNomDB, visitados = new Set()) {
      if (visitados.has(sdtNomDB) || sdtCache.has(sdtNomDB)) return;
      visitados.add(sdtNomDB);
      const r26 = await conn.execute(
        `SELECT BTISDTELEMNOM, BTISDTELEMTIPO, BTISDTELEMLARGO, BTISDTELEMCAT, BTISDTELEMDSC, BTISDTELEMSDT
         FROM BTI026 WHERE BTISDTNOM = :1 ORDER BY BTISDTELEMNOM`,
        [sdtNomDB],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
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
      const tabla = generarTablaSdt(rows);
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
      Btoutreq: { Estado: 'OK', Fecha: '2026-01-01', Hora: '00:00:00', Numero: '00000000', Servicio: `${servicio}.${metodo}`, Requerimiento: '1', Canal: 'BTDIGITAL' }
    };
    let curlEjemplo  = formatCurl(url, requestPayload);
    let responseJson = JSON.stringify(responsePayload, null, 2);

    let realResponse = null;
    let bodyVacio = false;
    if (ejecutar) {
      try {
        process.stdout.write(`  🌐 Ejecutando ${servicio}.${metodo}... `);
        const respuestaReal = await ejecutarServicio(
          `${API_BASE_URL}/servlet/com.dlya.bantotal.ardwsbt_${servicio}_v1?${metodo}`,
          requestPayload
        );
        if (respuestaReal !== null) {
          responseJson = JSON.stringify(respuestaReal, null, 2);
        } else {
          bodyVacio = true;
        }
        realResponse = respuestaReal ?? {};
        console.log('✅');
      } catch (e) {
        console.log(`⚠️  ${e.message} — usando valores de ejemplo`);
      }
      if (cachedToken) {
        curlEjemplo = formatCurl(url, { ...requestPayload, Btinreq: { ...requestPayload.Btinreq, Token: cachedToken } });
        if (bodyVacio) {
          // Operación de escritura exitosa sin body: generar respuesta limpia
          responseJson = JSON.stringify({
            Btinreq: { ...btinreq, Token: cachedToken },
            BusinessErrors: { BusinessError: [] },
            Btoutreq: {
              Estado: 'OK',
              Fecha: '',
              Hora: '',
              Numero: 0,
              Servicio: `${servicio}.${metodo}`,
              Requerimiento: '1',
              Canal: 'BTDIGITAL'
            }
          }, null, 2);
        } else {
          // Actualizar token en la respuesta real o en el template de fallback
          try {
            const respObj = JSON.parse(responseJson);
            if (respObj.Btinreq) {
              respObj.Btinreq.Token = cachedToken;
              responseJson = JSON.stringify(respObj, null, 2);
            }
          } catch {}
        }
      }
    }

    // ── Tablas ──
    const tablaEntrada = generarTabla(entrada);
    const tablaSalida  = generarTabla(salida);

    // ── Template MD ──
    const md = `---
title: ${titulo}
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note ${descripcion}

**Nombre publicación:** ${servicio}.${metodo}

**Módulo:** ${extraerModulo(programa)}

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
Completar manualmente | Completar manualmente | Completar manualmente 

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
${curlEjemplo}
\`\`\`
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

    return realResponse;

  } catch (e) {
    console.error('❌ Error:', e.message);
    return null;
  } finally {
    await conn.close();
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

  const ejecutar    = rawArgs.includes('--ejecutar');
  const workflowFile = getFlagValue('--workflow');
  const paramsValue  = getFlagValue('--params');

  // Modo workflow
  if (workflowFile) {
    ejecutarWorkflow(workflowFile);
    return;
  }

  // Índices a ignorar al armar args posicionales
  const skipIdx = new Set();
  rawArgs.forEach((a, i) => {
    if (a === '--params' || a === '--workflow') { skipIdx.add(i); skipIdx.add(i + 1); }
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

  const dir = carpeta || servicio;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (metodo) {
    generarMd(servicio, metodo, dir, ejecutar, inputParams);
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
