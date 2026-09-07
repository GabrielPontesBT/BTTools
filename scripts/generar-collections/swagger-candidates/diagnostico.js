#!/usr/bin/env node
'use strict';

// ============================================================
// Diagnostico de lectura de Swagger.
//
// Existe porque "no se pudo leer el swagger" puede ser DNS, un
// puerto cerrado, un firewall que dropea, un 401, un 404, un
// certificado interno que no valida, o un endpoint que responde
// algo que no es un documento OpenAPI. Todos daban el mismo
// mensaje, asi que diagnosticarlo era a ciegas.
//
// Prueba exactamente las mismas URLs que prueba la herramienta
// (reusa buildSwaggerCandidateUrls) e imprime que paso con cada
// una, separando el caso del certificado: si una URL falla con
// validacion de certificado prendida pero anda con ella apagada,
// el problema es el cert interno y se dice explicitamente.
//
// Uso:
//   node scripts/generar-collections/swagger-candidates/diagnostico.js <url> [--base-url <url>]
//
// Ejemplos:
//   node ...\diagnostico.js http://10.0.0.7:5110/btv4core
//   node ...\diagnostico.js https://mi-ambiente/core --base-url https://mi-ambiente/publicapi
// ============================================================

const dns = require('dns');
const net = require('net');
const { buildSwaggerCandidateUrls } = require('./index');

const TIMEOUT_MS = 10000;

function parseArgs(argv) {
  const args = { url: '', baseUrl: '' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--base-url') { args.baseUrl = argv[++i] || ''; continue; }
    if (!args.url) args.url = argv[i];
  }
  return args;
}

function pedir(url, validarCert) {
  return new Promise((resolve) => {
    let parsed;
    try { parsed = new URL(url); } catch (e) { resolve({ ok: false, motivo: 'URL invalida' }); return; }

    const esHttps = parsed.protocol === 'https:';
    const mod = esHttps ? require('https') : require('http');
    const opciones = { method: 'GET' };
    if (esHttps) opciones.rejectUnauthorized = !!validarCert;

    const req = mod.request(parsed, opciones, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { body += c; if (body.length > 200000) req.destroy(); });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          resolve({ ok: false, motivo: 'HTTP ' + res.statusCode + ' ' + (res.statusMessage || '') });
          return;
        }
        const texto = body.trim();
        if (!texto) { resolve({ ok: false, motivo: 'respondio vacio' }); return; }
        if (texto[0] === '{') {
          let doc;
          try { doc = JSON.parse(texto); } catch (e) { resolve({ ok: false, motivo: 'JSON invalido' }); return; }
          if (doc.openapi || doc.swagger) {
            const paths = Object.keys(doc.paths || {}).length;
            resolve({ ok: true, motivo: 'DOCUMENTO SWAGGER (' + paths + ' paths, ' +
                                        (doc.openapi ? 'openapi ' + doc.openapi : 'swagger ' + doc.swagger) + ')' });
            return;
          }
          resolve({ ok: false, motivo: 'JSON sin campo "openapi" ni "swagger" (claves: ' +
                                       Object.keys(doc).slice(0, 5).join(', ') + ')' });
          return;
        }
        const esHtml = /^\s*<!doctype|^\s*<html/i.test(texto);
        resolve({ ok: false, motivo: esHtml ? 'devolvio HTML, no JSON (puede ser una pagina de login o el swagger-ui)'
                                            : 'no es JSON (empieza con "' + texto.slice(0, 20).replace(/\s+/g, ' ') + '")' });
      });
    });

    req.on('error', (e) => resolve({ ok: false, motivo: e.code ? e.code + ': ' + e.message : e.message }));
    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error('timeout de ' + (TIMEOUT_MS / 1000) + 's')));
    req.end();
  });
}

function resolverDns(host) {
  return new Promise((resolve) => {
    if (net.isIP(host)) { resolve('es una IP, no hace falta DNS'); return; }
    dns.lookup(host, (err, addr) => resolve(err ? 'FALLA: ' + err.code : 'resuelve a ' + addr));
  });
}

function probarTcp(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const cerrar = (msg) => { socket.destroy(); resolve(msg); };
    socket.setTimeout(5000);
    socket.on('connect', () => cerrar('abierto'));
    socket.on('timeout', () => cerrar('TIMEOUT (firewall dropeando, o host inalcanzable)'));
    socket.on('error', (e) => cerrar('FALLA: ' + (e.code || e.message)));
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.url && !args.baseUrl) {
    console.error('\nUso: node diagnostico.js <url-del-swagger> [--base-url <url-base-del-ambiente>]\n');
    console.error('Ejemplo: node diagnostico.js http://10.0.0.7:5110/btv4core\n');
    process.exit(2);
  }

  const api = args.baseUrl ? { BASE_URL: args.baseUrl } : {};
  const candidatos = buildSwaggerCandidateUrls(args.url, api);

  console.log('\n=== DIAGNOSTICO DE LECTURA DE SWAGGER ===\n');
  console.log('URL ingresada : ' + (args.url || '(vacia)'));
  console.log('BASE_URL      : ' + (args.baseUrl || '(no configurada)'));
  console.log('Candidatos    : ' + candidatos.length);

  if (!candidatos.length) {
    console.log('\nNo hay ninguna ruta para probar. Pasa una URL, o --base-url.\n');
    process.exit(1);
  }

  // Conectividad basica, una vez por host:puerto, antes de probar rutas:
  // si el puerto esta cerrado, los 6 candidatos van a fallar por lo mismo.
  const hosts = new Map();
  candidatos.forEach((u) => {
    try {
      const p = new URL(u);
      const puerto = p.port || (p.protocol === 'https:' ? 443 : 80);
      hosts.set(p.hostname + ':' + puerto, { host: p.hostname, port: Number(puerto) });
    } catch (e) { /* candidato invalido, se ve mas abajo */ }
  });

  console.log('\n--- Conectividad ---');
  for (const [etiqueta, { host, port }] of hosts) {
    const nombre = await resolverDns(host);
    const tcp = await probarTcp(host, port);
    console.log('  ' + etiqueta);
    console.log('    DNS : ' + nombre);
    console.log('    TCP : ' + tcp);
  }

  console.log('\n--- Rutas probadas, en orden ---');
  let encontrado = null;
  const problemasDeCert = [];

  for (const url of candidatos) {
    const r = await pedir(url, false);
    const marca = r.ok ? 'OK   ' : 'falla';
    console.log('  [' + marca + '] ' + url);
    console.log('            ' + r.motivo);

    // Si anduvo sin validar el cert, se prueba validando para saber si el
    // certificado del ambiente es el problema de fondo.
    if (url.startsWith('https:')) {
      const conValidacion = await pedir(url, true);
      if (r.ok && !conValidacion.ok) {
        problemasDeCert.push({ url, motivo: conValidacion.motivo });
        console.log('            (con validacion de certificado: ' + conValidacion.motivo + ')');
      }
    }

    if (r.ok && !encontrado) encontrado = url;
  }

  console.log('\n--- Veredicto ---');
  if (encontrado) {
    console.log('  Se encontro el documento en:');
    console.log('    ' + encontrado);
    console.log('  Pega ESA url en el campo Swagger de la herramienta y va a andar al primer intento.');
  } else {
    console.log('  Ninguna de las ' + candidatos.length + ' rutas devolvio un documento Swagger.');
    console.log('  Mira la columna de motivos arriba:');
    console.log('    - todos "ECONNREFUSED"      -> el puerto esta cerrado o el servicio no esta levantado');
    console.log('    - todos "TIMEOUT"           -> un firewall esta dropeando; hace falta VPN o una regla');
    console.log('    - todos "ENOTFOUND"         -> el nombre de host no resuelve');
    console.log('    - "HTTP 401" o "HTTP 403"   -> el swagger pide autenticacion');
    console.log('    - "HTTP 404" en todas       -> el documento esta en otra ruta: buscala en el navegador');
    console.log('    - "devolvio HTML"           -> pegaste la pagina del swagger-ui, no el JSON');
    console.log('    - errores con CERT o SSL    -> certificado interno (la herramienta ya no valida cert)');
  }

  if (problemasDeCert.length) {
    console.log('\n  Nota sobre certificados: ' + problemasDeCert.length + ' ruta(s) andan solo si NO se');
    console.log('  valida el certificado (' + problemasDeCert[0].motivo + ').');
    console.log('  La herramienta ya no lo valida, igual que el resto del proyecto, asi que esto');
    console.log('  no te va a bloquear. Se informa para que sepas que el ambiente usa cert interno.');
  }

  console.log('');
  process.exit(encontrado ? 0 : 1);
}

main().catch((e) => {
  console.error('\nEl diagnostico se cayo: ' + e.message + '\n');
  process.exit(3);
});
