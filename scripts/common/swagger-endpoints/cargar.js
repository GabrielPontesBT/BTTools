'use strict';

// ============================================================
// De donde sale el documento Swagger que usa el generador de doc.
//
// Tres origenes, en este orden:
//
//   1. Un archivo JSON local (el que el usuario pego o bajo a mano).
//   2. Una URL explicita.
//   3. La autodeteccion a partir de la URL de la API publica.
//
// Los tres terminan en el mismo indice (ver ./index.js). La descarga
// comparte los candidatos de rutas con el flujo de collections
// (swagger-candidates) para que un ambiente que anda en un flujo ande en el
// otro: si un sufijo aparece ahi, aparece aca.
// ============================================================

const fs = require('fs');
const http = require('http');
const https = require('https');

const { buildSwaggerCandidateUrls } = require('../../generar-collections/swagger-candidates');
const { indexarEndpoints, baseUrlDeDocumento } = require('./index');

// Un documento de 1.3 MB es normal (el ambiente medido pesa eso), pero un
// endpoint que devuelve un stream infinito no puede colgar la generacion.
const LIMITE_BYTES = 32 * 1024 * 1024;
const TIMEOUT_MS = 15000;

function esDocumentoSwagger(texto) {
  return /"(openapi|swagger)"\s*:/.test(String(texto || '').slice(0, 4096));
}

function bajar(url) {
  return new Promise(function (resolve) {
    let mod;
    let parsed;
    try {
      parsed = new URL(url);
      mod = parsed.protocol === 'https:' ? https : http;
    } catch (e) {
      resolve({ ok: false, status: 0, error: 'URL invalida: ' + url });
      return;
    }
    const req = mod.get(url, {
      timeout: TIMEOUT_MS,
      // Los ambientes usan certificados propios; el flujo de collections ya
      // afloja esto por el mismo motivo.
      rejectUnauthorized: false,
    }, function (res) {
      let texto = '';
      let excedido = false;
      res.on('data', function (c) {
        if (excedido) return;
        texto += c;
        if (texto.length > LIMITE_BYTES) { excedido = true; req.destroy(); }
      });
      res.on('end', function () {
        if (excedido) { resolve({ ok: false, status: res.statusCode, error: 'El documento supera los 32 MB' }); return; }
        resolve({ ok: res.statusCode === 200, status: res.statusCode, texto });
      });
    });
    req.on('error', function (e) { resolve({ ok: false, status: 0, error: e.message }); });
    req.on('timeout', function () { req.destroy(); resolve({ ok: false, status: 0, error: 'timeout' }); });
  });
}

/**
 * Descarga el documento probando las rutas candidatas, en orden.
 *
 * @param {string} urlExplicita  Lo que escribio el usuario (puede ser vacio).
 * @param {object} api           Config del ambiente (BASE_URL...).
 * @returns {Promise<{ok, doc?, url?, intentos: string[], message?}>}
 */
async function descargarDocumento(urlExplicita, api) {
  const candidatos = buildSwaggerCandidateUrls(urlExplicita, api, {
    incluirFallbackDeBaseUrl: !String(urlExplicita || '').trim(),
  });
  if (!candidatos.length) {
    return { ok: false, intentos: [], message: 'No hay ninguna URL para buscar el Swagger: completa la URL de la API publica o pega la URL del documento.' };
  }

  const intentos = [];
  for (const url of candidatos) {
    const r = await bajar(url);
    intentos.push(url + ' -> ' + (r.status ? 'HTTP ' + r.status : r.error));
    if (!r.ok || !esDocumentoSwagger(r.texto)) continue;
    try {
      return { ok: true, doc: JSON.parse(r.texto), url, intentos };
    } catch (e) {
      // Respondio algo que parece swagger pero no parsea: se sigue probando,
      // y si ninguno anda el detalle queda en los intentos.
      intentos[intentos.length - 1] += ' (JSON invalido)';
    }
  }
  return {
    ok: false,
    intentos,
    message: 'No se encontro el documento Swagger. Rutas probadas:\n  ' + intentos.join('\n  '),
  };
}

/**
 * Lee el documento de un archivo local ya guardado.
 */
function leerDocumento(rutaArchivo) {
  try {
    const doc = JSON.parse(fs.readFileSync(rutaArchivo, 'utf8'));
    if (!doc || !doc.paths) return { ok: false, message: 'El archivo no parece un Swagger: no tiene "paths".' };
    return { ok: true, doc };
  } catch (e) {
    return { ok: false, message: 'No se pudo leer ' + rutaArchivo + ': ' + e.message };
  }
}

/**
 * El indice de endpoints listo para usar, de donde este disponible.
 *
 * Devuelve siempre un objeto: sin swagger, `indice` queda en null y quien
 * llama sigue derivando la ruta del nombre. No se cae, porque la doc se
 * genera igual y la ruta derivada es correcta en la mayoria de los casos.
 *
 * @param {object} opciones
 * @param {string} [opciones.archivo]  JSON local (gana sobre todo lo demas).
 * @param {string} [opciones.url]      URL explicita del documento.
 * @param {object} [opciones.api]      Config del ambiente, para autodetectar.
 * @param {boolean} [opciones.autodetectar=true]
 */
async function cargarIndice(opciones) {
  const o = opciones || {};

  if (o.archivo && fs.existsSync(o.archivo)) {
    const r = leerDocumento(o.archivo);
    if (r.ok) {
      const indice = indexarEndpoints(r.doc);
      return { indice, origen: 'archivo', detalle: o.archivo, operaciones: indice.size, baseUrl: baseUrlDeDocumento(r.doc) };
    }
    return { indice: null, origen: 'ninguno', detalle: '', operaciones: 0, baseUrl: '', message: r.message };
  }

  const urlExplicita = String(o.url || '').trim();
  if (!urlExplicita && o.autodetectar === false) {
    return { indice: null, origen: 'ninguno', detalle: '', operaciones: 0, baseUrl: '' };
  }

  const r = await descargarDocumento(urlExplicita, o.api || {});
  if (!r.ok) return { indice: null, origen: 'ninguno', detalle: '', operaciones: 0, baseUrl: '', message: r.message };

  const indice = indexarEndpoints(r.doc);
  return { indice, origen: 'url', detalle: r.url, operaciones: indice.size, baseUrl: baseUrlDeDocumento(r.doc) };
}

module.exports = {
  SUFIJOS_LIMITE_BYTES: LIMITE_BYTES,
  esDocumentoSwagger,
  descargarDocumento,
  leerDocumento,
  cargarIndice,
};
