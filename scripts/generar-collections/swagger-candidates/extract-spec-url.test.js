const test = require('node:test');
const assert = require('node:assert/strict');

const E = require('./extract-spec-url');

// swagger-initializer.js tal como lo sirve el ambiente Bantotal medido
// (10.0.0.7:5101, swagger-ui-dist). Se copia literal, con el url: de
// fabrica incluido, porque el orden de precedencia entre esas dos claves
// es justamente lo que hay que garantizar.
const INITIALIZER_REAL = `window.onload = function() {
  //<editor-fold desc="Changeable Configuration Block">

  // the following lines will be replaced by docker/configurator, when it runs in a docker-container
  window.ui = SwaggerUIBundle({
    url: "https://petstore.swagger.io/v2/swagger.json",
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout" ,

  "configUrl" : "/api/publicapi/v1/api-docs/swagger-config",
  "defaultModelsExpandDepth" : "-1",
  "validatorUrl" : ""

  });

  //</editor-fold>
};`;

const ORIGEN = 'http://10.0.0.7:5101/api/publicapi/swagger-ui/swagger-initializer.js';

// ── El caso que costo tres vueltas encontrar ─────────────────

test('del initializer real saca configUrl, NO el url de petstore', () => {
  const r = E.extraerUrlDeTexto(INITIALIZER_REAL, ORIGEN);
  assert.ok(r, 'no extrajo nada');
  assert.equal(r.clave, 'configUrl');
  assert.equal(r.url, 'http://10.0.0.7:5101/api/publicapi/v1/api-docs/swagger-config');
});

test('el señuelo de petstore nunca se devuelve, ni siendo la unica url', () => {
  // Si esto fallara, la herramienta cargaria el spec de la tienda de
  // mascotas de ejemplo y generaria una collection completamente ajena SIN
  // dar error, que es peor que fallar.
  const soloSenuelo = 'SwaggerUIBundle({ url: "https://petstore.swagger.io/v2/swagger.json" })';
  assert.equal(E.extraerUrlDeTexto(soloSenuelo, ORIGEN), null);
});

test('esSenuelo reconoce las urls de fabrica de swagger-ui', () => {
  assert.equal(E.esSenuelo('https://petstore.swagger.io/v2/swagger.json'), true);
  assert.equal(E.esSenuelo('https://petstore3.swagger.io/api/v3/openapi.json'), true);
  assert.equal(E.esSenuelo('https://generator.swagger.io/api/swagger.json'), true);
  assert.equal(E.esSenuelo('http://10.0.0.7:5101/api/publicapi/v1/api-docs'), false);
  // Que no descarte por contener la palabra: un ambiente propio puede
  // llamarse petstore-interno sin ser el de swagger.io.
  assert.equal(E.esSenuelo('http://mi-host/petstore/v1/api-docs'), false);
});

// ── El regex de la clave ─────────────────────────────────────

test('la clave se reconoce con y sin comillas, y con espacios antes de los dos puntos', () => {
  const formas = [
    'configUrl: "/a/config"',
    '"configUrl": "/a/config"',
    "'configUrl' : '/a/config'",
    '"configUrl"   :   "/a/config"',
  ];
  formas.forEach(function (f) {
    const r = E.extraerUrlDeTexto(f, 'http://h/base/x.js');
    assert.ok(r, 'no reconocio la forma: ' + f);
    assert.equal(r.url, 'http://h/a/config', 'forma: ' + f);
  });
});

test('el regex viejo /configUrl:/ era el que fallaba con la forma real', () => {
  // Documenta el defecto: la forma que sirve el ambiente real tiene la
  // clave entre comillas y un espacio antes de los dos puntos.
  assert.equal(/configUrl:\s*["']/.test('"configUrl" : "/a/config"'), false,
               'si esto pasa a ser true, el regex viejo andaba y este comentario sobra');
  assert.ok(E.extraerUrlDeTexto('"configUrl" : "/a/config"', 'http://h/x.js'));
});

// ── Precedencia ──────────────────────────────────────────────

test('configUrl gana sobre urls[] y sobre url', () => {
  const t = 'urls: [{url: "/de-la-lista"}], url: "/suelto", "configUrl": "/el-config"';
  assert.equal(E.extraerUrlDeTexto(t, 'http://h/x').url, 'http://h/el-config');
});

test('sin configUrl, urls[0] gana sobre el url suelto', () => {
  const t = 'url: "/suelto", urls: [{name:"v1", url: "/de-la-lista"}]';
  const r = E.extraerUrlDeTexto(t, 'http://h/x');
  assert.equal(r.clave, 'urls[0].url');
  assert.equal(r.url, 'http://h/de-la-lista');
});

test('con solo el url suelto y no siendo señuelo, lo usa', () => {
  const r = E.extraerUrlDeTexto('url: "/api/v1/openapi.json"', 'http://h/x');
  assert.equal(r.clave, 'url');
  assert.equal(r.url, 'http://h/api/v1/openapi.json');
});

// ── Rutas del initializer ────────────────────────────────────

test('urlsDeInitializer deriva las rutas relativas a la pagina del swagger-ui', () => {
  const rutas = E.urlsDeInitializer('http://10.0.0.7:5101/api/publicapi/swagger-ui/index.html');
  assert.deepEqual(rutas, [
    'http://10.0.0.7:5101/api/publicapi/swagger-ui/swagger-initializer.js',
    'http://10.0.0.7:5101/api/publicapi/swagger-ui/swagger-ui-init.js',
  ]);
});

test('urlsDeInitializer con una url sin archivo final no inventa rutas raras', () => {
  const rutas = E.urlsDeInitializer('http://h/swagger-ui/');
  assert.deepEqual(rutas, ['http://h/swagger-ui/swagger-initializer.js', 'http://h/swagger-ui/swagger-ui-init.js']);
  assert.deepEqual(E.urlsDeInitializer(''), []);
  assert.deepEqual(E.urlsDeInitializer(null), []);
});

// ── swagger-config ───────────────────────────────────────────

test('del swagger-config real saca la url del documento', () => {
  // Respuesta literal del ambiente medido.
  const config = '{"configUrl":"/api/publicapi/v1/api-docs/swagger-config","defaultModelsExpandDepth":"-1",' +
                 '"oauth2RedirectUrl":"http://10.0.0.7:5101/api/publicapi/swagger-ui/oauth2-redirect.html",' +
                 '"url":"/api/publicapi/v1/api-docs","validatorUrl":""}';
  const r = E.extraerUrlDeConfigJson(config, 'http://10.0.0.7:5101/api/publicapi/v1/api-docs/swagger-config');
  assert.equal(r.url, 'http://10.0.0.7:5101/api/publicapi/v1/api-docs');
});

test('el swagger-config con lista de urls toma la primera que no sea señuelo', () => {
  const config = JSON.stringify({ urls: [
    { name: 'demo', url: 'https://petstore.swagger.io/v2/swagger.json' },
    { name: 'real', url: '/api/v1/api-docs' },
  ] });
  const r = E.extraerUrlDeConfigJson(config, 'http://h/cfg');
  assert.equal(r.url, 'http://h/api/v1/api-docs');
});

test('extraerUrlDeConfigJson tolera JSON invalido y objetos sin url', () => {
  assert.equal(E.extraerUrlDeConfigJson('no soy json', 'http://h/x'), null);
  assert.equal(E.extraerUrlDeConfigJson('{"otra":"cosa"}', 'http://h/x'), null);
  assert.equal(E.extraerUrlDeConfigJson('null', 'http://h/x'), null);
  assert.equal(E.extraerUrlDeConfigJson('[]', 'http://h/x'), null);
});

// ── Deteccion del documento ──────────────────────────────────

test('esDocumentoOpenApi reconoce openapi 3 y swagger 2, y rechaza el resto', () => {
  assert.equal(E.esDocumentoOpenApi({ openapi: '3.1.0', paths: {} }), true);
  assert.equal(E.esDocumentoOpenApi({ swagger: '2.0', paths: {} }), true);
  assert.equal(E.esDocumentoOpenApi({ url: '/algo' }), false);
  assert.equal(E.esDocumentoOpenApi(null), false);
  assert.equal(E.esDocumentoOpenApi('texto'), false);
});

// ── Robustez de la resolucion relativa ───────────────────────

test('una url absoluta en el config se respeta tal cual', () => {
  const r = E.extraerUrlDeTexto('"configUrl": "http://otro-host:8080/v3/api-docs"', 'http://h/x.js');
  assert.equal(r.url, 'http://otro-host:8080/v3/api-docs');
});

test('una url relativa se resuelve contra el origen, no contra la raiz', () => {
  const r = E.extraerUrlDeTexto('"configUrl": "swagger-config"', 'http://h/api/swagger-ui/init.js');
  assert.equal(r.url, 'http://h/api/swagger-ui/swagger-config');
});

test('un texto sin ninguna url devuelve null en vez de romper', () => {
  assert.equal(E.extraerUrlDeTexto('<html><body>nada</body></html>', 'http://h/x'), null);
  assert.equal(E.extraerUrlDeTexto('', 'http://h/x'), null);
  assert.equal(E.extraerUrlDeTexto(null, 'http://h/x'), null);
});
