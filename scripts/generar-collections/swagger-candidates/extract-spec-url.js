'use strict';

// ============================================================
// De donde sacar la URL del documento OpenAPI cuando lo que se
// tiene es la pagina del swagger-ui y no el JSON.
//
// Caso real que motivo el modulo, medido contra un ambiente
// Bantotal (10.0.0.7:5101, springdoc + swagger-ui-dist):
//
//   1. /api/publicapi/swagger-ui/index.html
//        -> HTML sin ninguna URL adentro. En swagger-ui-dist 4+
//           el index.html ya no lleva la config: solo carga
//           ./swagger-initializer.js.
//   2. /api/publicapi/swagger-ui/swagger-initializer.js
//        -> "configUrl" : "/api/publicapi/v1/api-docs/swagger-config"
//   3. /api/publicapi/v1/api-docs/swagger-config
//        -> {"url":"/api/publicapi/v1/api-docs", ...}
//   4. /api/publicapi/v1/api-docs
//        -> el documento OpenAPI 3.1 de verdad
//
// Tres cosas hacian fallar esa cadena:
//
// a) No se seguia swagger-initializer.js, asi que el paso 2 no
//    pasaba nunca.
// b) El regex de configUrl era /configUrl:/, y el archivo real
//    dice "configUrl" : con la clave entre comillas y un espacio
//    antes de los dos puntos.
// c) EL PELIGROSO: swagger-initializer.js viene de fabrica con
//    url: "https://petstore.swagger.io/v2/swagger.json". Si se
//    hubiera arreglado (a) sin cuidar el orden, la herramienta
//    habria cargado el spec de la tienda de mascotas de ejemplo
//    y generado una collection completamente ajena SIN dar
//    error, que es peor que fallar.
// ============================================================

// URLs que trae swagger-ui de fabrica y nunca son el spec del ambiente.
// Se descartan explicitamente: acertarle a una de estas es peor que no
// encontrar nada, porque el resultado parece valido.
const URLS_SENUELO = [
  /(^|\/\/)petstore\.swagger\.io\//i,
  /(^|\/\/)generator\.swagger\.io\//i,
  /(^|\/\/)petstore3\.swagger\.io\//i,
];

function esSenuelo(url) {
  const u = String(url || '');
  return URLS_SENUELO.some(function (r) { return r.test(u); });
}

// Clave de config en JS o JSON, con o sin comillas y con espacios
// arbitrarios antes de los dos puntos. Esto es lo que hacia que
// "configUrl" : "..." no matcheara.
function regexClave(clave) {
  return new RegExp('["\']?' + clave + '["\']?\\s*:\\s*["\']([^"\']+)["\']', 'i');
}

function absoluta(url, base) {
  try { return new URL(url, base).toString(); } catch (e) { return ''; }
}

// Rutas donde puede vivir el initializer, relativas a la pagina del
// swagger-ui. swagger-ui-dist usa swagger-initializer.js; algunos
// springdoc viejos generan swagger-ui-init.js.
function urlsDeInitializer(paginaSwaggerUi) {
  const base = String(paginaSwaggerUi || '').replace(/[^/]*$/, '');
  if (!base) return [];
  return [base + 'swagger-initializer.js', base + 'swagger-ui-init.js'];
}

// Extrae la URL del spec (o del config) de un texto JS/HTML.
// Devuelve {url, clave} para que quien llama sepa si lo que obtuvo es el
// documento o un configUrl que todavia hay que seguir.
//
// El orden importa y no es alfabetico: configUrl primero, porque cuando
// existe es la fuente de verdad y conviven en el mismo archivo con el
// url: de fabrica que apunta a petstore.
function extraerUrlDeTexto(texto, urlOrigen) {
  const t = String(texto || '');

  const config = t.match(regexClave('configUrl'));
  if (config && config[1] && !esSenuelo(config[1])) {
    const abs = absoluta(config[1], urlOrigen);
    if (abs) return { url: abs, clave: 'configUrl' };
  }

  // urls: [{url: "..."}] antes que url: suelto, porque cuando existe la
  // lista el url: suelto suele ser el de fabrica.
  const lista = t.match(/urls\s*:\s*\[\s*\{[^}]*["']?url["']?\s*:\s*["']([^"']+)["']/i);
  if (lista && lista[1] && !esSenuelo(lista[1])) {
    const abs = absoluta(lista[1], urlOrigen);
    if (abs) return { url: abs, clave: 'urls[0].url' };
  }

  const directo = t.match(regexClave('url'));
  if (directo && directo[1] && !esSenuelo(directo[1])) {
    const abs = absoluta(directo[1], urlOrigen);
    if (abs) return { url: abs, clave: 'url' };
  }

  return null;
}

// El JSON de swagger-config: {"url": "...", ...} o {"urls":[{"url":...}]}.
function extraerUrlDeConfigJson(texto, urlOrigen) {
  let parsed;
  try { parsed = JSON.parse(texto); } catch (e) { return null; }
  if (!parsed || typeof parsed !== 'object') return null;

  if (typeof parsed.url === 'string' && parsed.url && !esSenuelo(parsed.url)) {
    const abs = absoluta(parsed.url, urlOrigen);
    if (abs) return { url: abs, clave: 'url' };
  }
  if (Array.isArray(parsed.urls)) {
    const primera = parsed.urls.find(function (u) {
      return u && typeof u.url === 'string' && u.url && !esSenuelo(u.url);
    });
    if (primera) {
      const abs = absoluta(primera.url, urlOrigen);
      if (abs) return { url: abs, clave: 'urls[0].url' };
    }
  }
  return null;
}

function esDocumentoOpenApi(valor) {
  // Booleano y no el valor de la version: quien llama lo usa en un if, pero
  // devolver '3.1.0' hacia que un assert de igualdad estricta contra true
  // fallara sin que el comportamiento estuviera mal.
  return !!(valor && typeof valor === 'object' && (valor.openapi || valor.swagger));
}

module.exports = {
  URLS_SENUELO,
  esSenuelo,
  urlsDeInitializer,
  extraerUrlDeTexto,
  extraerUrlDeConfigJson,
  esDocumentoOpenApi,
};
