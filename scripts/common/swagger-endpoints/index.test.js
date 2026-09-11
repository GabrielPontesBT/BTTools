// Gate test de la resolucion de endpoints desde el Swagger.
//
// El bug que origina esto: los ambientes pasaron a kebab-case
// (/public/saving-accounts/v1/additional-information) y el generador de doc
// armaba /public/SavingAccounts/v1/additionalInformation, asi que TODAS las
// llamadas daban 404.
//
// Las formas de aca salen del swagger de un ambiente real
// (10.0.0.7:5101/api/publicapi/v1/api-docs, 175 paths / 192 operaciones):
// tags en kebab con prefijo "public-", operationId igual al nombre del metodo
// de la base, y sufijos _N en los operationId repetidos entre servicios.

const test = require('node:test');
const assert = require('node:assert/strict');

const SE = require('./index');

// Recorte del swagger real, con los casos que importan.
const DOC = {
  openapi: '3.0.1',
  paths: {
    '/public/saving-accounts/v1/product': {
      put: { tags: ['public-saving-accounts'], operationId: 'updateProduct' },
    },
    '/public/persons/v1/texts': {
      get: { tags: ['public-persons'], operationId: 'getTexts' },
      put: { tags: ['public-persons'], operationId: 'updateTexts' },
    },
    '/public/persons/v1/additional-information': {
      get: { tags: ['public-persons'], operationId: 'getAdditionalInformation' },
      delete: { tags: ['public-persons'], operationId: 'deleteAdditionalInformation' },
    },
    // Mismo nombre de metodo que en persons: springdoc lo desambigua con _1.
    '/public/customers/v1/texts': {
      get: { tags: ['public-customers'], operationId: 'getTexts_1' },
    },
    '/public/group-loans/v1/saving-account': {
      put: { tags: ['public-group-loans'], operationId: 'updateSavingAccount' },
    },
    // Tag en camelCase, como viene PublicCashManagement en el ambiente real.
    '/public/cash-management/v1/close': {
      post: { tags: ['PublicCashManagement'], operationId: 'close' },
    },
    // Operacion sin tags: el servicio se saca del propio path.
    '/public/general/v1/system-date': {
      get: { operationId: 'getSystemDate' },
    },
    // Sin operationId: el metodo se saca del ultimo segmento.
    '/public/general/v1/countries': {
      get: { tags: ['public-general'] },
    },
  },
};

const INDICE = SE.indexarEndpoints(DOC);

// ── Normalizacion ──────────────────────────────────────────────────────────

test('aKebab parte camelCase sin romper siglas', () => {
  assert.equal(SE.aKebab('additionalInformation'), 'additional-information');
  assert.equal(SE.aKebab('SavingAccounts'), 'saving-accounts');
  assert.equal(SE.aKebab('guid'), 'guid');
  assert.equal(SE.aKebab('GUID'), 'guid');
  assert.equal(SE.aKebab('getGUIDValue'), 'get-guid-value');
  assert.equal(SE.aKebab(''), '');
});

test('servicioEnRuta saca el prefijo Public y pasa a kebab', () => {
  assert.equal(SE.servicioEnRuta('PublicSavingAccounts'), 'saving-accounts');
  assert.equal(SE.servicioEnRuta('PublicPersons'), 'persons');
  assert.equal(SE.servicioEnRuta('GroupLoans'), 'group-loans');
});

test('la clave iguala las tres formas del mismo servicio', () => {
  const esperada = SE.claveEndpoint('PublicPersons', 'getTexts');
  assert.equal(SE.claveEndpoint('public-persons', 'getTexts'), esperada);
  assert.equal(SE.claveEndpoint('persons', 'getTexts'), esperada);
  assert.equal(SE.claveEndpoint('Public_Persons', 'gettexts'), esperada);
});

test('el sufijo _N de springdoc no cuenta como parte del nombre', () => {
  assert.equal(SE.sinSufijoDeDuplicado('getTexts_1'), 'getTexts');
  assert.equal(SE.sinSufijoDeDuplicado('getTexts'), 'getTexts');
  // Un nombre que termina en numero sin guion bajo no se toca.
  assert.equal(SE.sinSufijoDeDuplicado('getSaldo2'), 'getSaldo2');
});

// ── Indexado ───────────────────────────────────────────────────────────────

test('indexa una operacion por verbo, no una por path', () => {
  // 8 paths, pero /texts y /additional-information tienen dos verbos cada uno:
  // son metodos distintos de la base y cada uno necesita su entrada.
  assert.equal(INDICE.size, 10);
});

test('dos verbos sobre el mismo path no se pisan entre si', () => {
  const get = SE.resolverEndpoint(INDICE, 'PublicPersons', 'getTexts');
  const put = SE.resolverEndpoint(INDICE, 'PublicPersons', 'updateTexts');
  assert.equal(get.httpMethod, 'GET');
  assert.equal(put.httpMethod, 'PUT');
  assert.equal(get.path, put.path);
});

// ── La raiz de la API que declara el documento ─────────────────────────────
//
// El ambiente medido declara servers[0].url = "http://10.0.0.7:5101/api/
// publicapi", que es exactamente lo que el usuario escribia a mano en "URL de
// la API publica". Teniendo el swagger, ese campo se completa solo.

test('saca la raiz de la API de servers[0].url', () => {
  assert.equal(
    SE.baseUrlDeDocumento({ servers: [{ url: 'http://10.0.0.7:5101/api/publicapi' }] }),
    'http://10.0.0.7:5101/api/publicapi');
});

test('le saca la barra final, que si no duplica la barra al pegar el path', () => {
  assert.equal(SE.baseUrlDeDocumento({ servers: [{ url: 'http://h:5101/api/publicapi/' }] }),
               'http://h:5101/api/publicapi');
});

test('una url relativa o con plantilla no sirve como raiz', () => {
  // Sin host no se puede armar la llamada: mejor vacio que una URL rota.
  assert.equal(SE.baseUrlDeDocumento({ servers: [{ url: '/api/publicapi' }] }), '');
  assert.equal(SE.baseUrlDeDocumento({ servers: [{ url: 'http://{host}/api' }] }), '');
  // Y si la primera no sirve, se sigue con la siguiente.
  assert.equal(
    SE.baseUrlDeDocumento({ servers: [{ url: '/api' }, { url: 'https://real:8443/api' }] }),
    'https://real:8443/api');
});

test('sin servers devuelve vacio, no rompe', () => {
  assert.equal(SE.baseUrlDeDocumento({}), '');
  assert.equal(SE.baseUrlDeDocumento(null), '');
  assert.equal(SE.baseUrlDeDocumento({ servers: [] }), '');
});

// ── Resolucion ─────────────────────────────────────────────────────────────

test('resuelve la ruta real en kebab-case, que es el bug que origina todo esto', () => {
  const r = SE.resolverEndpoint(INDICE, 'PublicPersons', 'getAdditionalInformation', 'additionalInformation');
  assert.equal(r.path, '/public/persons/v1/additional-information');
  assert.equal(r.httpMethod, 'GET');
  assert.equal(r.fuente, 'swagger');
});

test('el verbo sale del swagger, no del prefijo del nombre', () => {
  // "updateProduct" por prefijo seria PUT y coincide; el caso que importa es
  // que el dato venga del documento y no de la heuristica.
  const r = SE.resolverEndpoint(INDICE, 'PublicSavingAccounts', 'updateProduct', 'product');
  assert.equal(r.path, '/public/saving-accounts/v1/product');
  assert.equal(r.httpMethod, 'PUT');
});

test('el mismo metodo en dos servicios no se confunde (getTexts_1)', () => {
  const persons = SE.resolverEndpoint(INDICE, 'PublicPersons', 'getTexts', 'texts');
  const customers = SE.resolverEndpoint(INDICE, 'PublicCustomers', 'getTexts', 'texts');
  assert.equal(persons.path, '/public/persons/v1/texts');
  assert.equal(customers.path, '/public/customers/v1/texts');
  assert.equal(customers.fuente, 'swagger', 'el sufijo _1 no puede dejarlo afuera');
});

test('un tag en camelCase matchea igual que uno en kebab', () => {
  const r = SE.resolverEndpoint(INDICE, 'PublicCashManagement', 'close', 'close');
  assert.equal(r.path, '/public/cash-management/v1/close');
  assert.equal(r.fuente, 'swagger');
});

test('una operacion sin tags se ubica por el servicio del path', () => {
  const r = SE.resolverEndpoint(INDICE, 'PublicGeneral', 'getSystemDate', 'systemDate');
  assert.equal(r.path, '/public/general/v1/system-date');
  assert.equal(r.fuente, 'swagger');
});

test('una operacion sin operationId se ubica por el ultimo segmento', () => {
  const r = SE.resolverEndpoint(INDICE, 'PublicGeneral', 'getCountries', 'countries');
  assert.equal(r.path, '/public/general/v1/countries');
  assert.equal(r.fuente, 'swagger');
});

// ── Fallback ───────────────────────────────────────────────────────────────

test('sin swagger la ruta se deriva, pero en kebab-case', () => {
  const r = SE.resolverEndpoint(null, 'PublicSavingAccounts', 'getAdditionalInformation', 'additionalInformation');
  assert.equal(r.path, '/public/saving-accounts/v1/additional-information');
  assert.equal(r.fuente, 'derivado');
  assert.equal(r.httpMethod, '', 'el verbo lo decide quien llama, como antes');
});

test('la ruta derivada NO vuelve al camelCase viejo', () => {
  const r = SE.resolverEndpoint(null, 'PublicSavingAccounts', 'getAdditionalInformation', 'additionalInformation');
  assert.doesNotMatch(r.path, /[A-Z]/, 'esa forma devuelve 404 en los ambientes actuales');
});

test('un metodo que no esta en el swagger cae al derivado y lo dice', () => {
  const r = SE.resolverEndpoint(INDICE, 'PublicPersons', 'getInventado', 'inventado');
  assert.equal(r.path, '/public/persons/v1/inventado');
  assert.equal(r.fuente, 'derivado');
});

test('un documento vacio o roto no rompe: se comporta como sin swagger', () => {
  assert.equal(SE.indexarEndpoints(null).size, 0);
  assert.equal(SE.indexarEndpoints({}).size, 0);
  assert.equal(SE.indexarEndpoints({ paths: {} }).size, 0);
  const r = SE.resolverEndpoint(SE.indexarEndpoints({}), 'PublicPersons', 'getTexts', 'texts');
  assert.equal(r.fuente, 'derivado');
});
