const test = require('node:test');
const assert = require('node:assert/strict');

const { buildSwaggerCandidateUrls, SUFIJOS_SWAGGER } = require('./index');

const BASE = 'http://10.0.0.7:5110/btv4core';

test('una url que ya apunta al documento se pide tal cual, sin sufijos al aire', () => {
  assert.deepEqual(buildSwaggerCandidateUrls(BASE + '/v3/api-docs', {}), [BASE + '/v3/api-docs']);
  assert.deepEqual(buildSwaggerCandidateUrls(BASE + '/swagger.json', {}), [BASE + '/swagger.json']);
  assert.deepEqual(buildSwaggerCandidateUrls(BASE + '/api-docs', {}), [BASE + '/api-docs']);
});

test('reconoce el documento aunque lleve query string', () => {
  assert.deepEqual(buildSwaggerCandidateUrls(BASE + '/v3/api-docs?group=public', {}),
                   [BASE + '/v3/api-docs?group=public']);
});

// El defecto que mas probablemente rompio en uso real: el placeholder del
// wizard sugiere una URL base, y antes se pedia tal cual, daba 404 y cortaba.
test('una url base pelada se prueba con todos los sufijos conocidos', () => {
  const c = buildSwaggerCandidateUrls(BASE, {});
  assert.equal(c[0], BASE, 'primero la url tal cual, por si el usuario sabe la ruta');
  SUFIJOS_SWAGGER.forEach(function (s) {
    assert.ok(c.includes(BASE + s), 'falta el candidato ' + s);
  });
  assert.ok(c.includes(BASE + '/swagger-ui/index.html'));
});

test('la barra final no genera candidatos con doble barra', () => {
  const c = buildSwaggerCandidateUrls(BASE + '/', {});
  assert.ok(!c.some(u => /[^:]\/\//.test(u)), 'hay una url con doble barra: ' + c.join(' '));
  assert.ok(c.includes(BASE + '/v3/api-docs'));
});

test('una url de swagger-ui deriva la base y prueba los sufijos', () => {
  const c = buildSwaggerCandidateUrls(BASE + '/swagger-ui/index.html', {});
  assert.equal(c[0], BASE + '/swagger-ui/index.html');
  SUFIJOS_SWAGGER.forEach(function (s) { assert.ok(c.includes(BASE + s), 'falta ' + s); });
});

test('swagger-ui con fragmento: el # se descarta antes de derivar', () => {
  const c = buildSwaggerCandidateUrls(BASE + '/swagger-ui/index.html#/Customers', {});
  assert.ok(c.includes(BASE + '/v3/api-docs'));
  assert.ok(!c.some(u => u.includes('#')), 'quedo un candidato con fragmento');
});

// ── Fallback por BASE_URL ────────────────────────────────────

test('sin url pero con BASE_URL, saca los candidatos de ahi', () => {
  const c = buildSwaggerCandidateUrls('', { BASE_URL: BASE + '/publicapi' });
  assert.ok(c.length > 0, 'no puede quedar vacio: es el caso de autodescubrir');
  SUFIJOS_SWAGGER.forEach(function (s) { assert.ok(c.includes(BASE + s), 'falta ' + s); });
});

// Antes se probaba SOLO la raiz sin /publicapi, y ese era el bug: el ambiente
// medido (10.0.0.7:5101) publica el documento en
// <BASE_URL>/v1/api-docs, o sea DENTRO de /api/publicapi. Con el recorte
// unicamente, las ocho rutas daban 404 y el descubrimiento fallaba con un
// swagger que estaba ahi. Ahora se prueban las dos formas.
test('BASE_URL se prueba tal cual y tambien sin el sufijo /publicapi', () => {
  const c = buildSwaggerCandidateUrls('', { BASE_URL: BASE + '/publicapi' });
  assert.ok(c.includes(BASE + '/publicapi/v3/api-docs'), 'falta la forma con /publicapi');
  assert.ok(c.includes(BASE + '/v3/api-docs'), 'falta la forma sin /publicapi');
  // La forma con /publicapi va primero: es donde esta en los ambientes de hoy.
  assert.ok(c.indexOf(BASE + '/publicapi/v3/api-docs') < c.indexOf(BASE + '/v3/api-docs'));
});

// El defecto de las operaciones duplicadas: con multi-swagger, una fuente
// caida no debe resolver al swagger de BASE_URL.
test('con incluirFallbackDeBaseUrl:false, una url explicita NO cae a BASE_URL', () => {
  const caida = 'http://10.0.0.9:5111/term-deposit';
  const c = buildSwaggerCandidateUrls(caida, { BASE_URL: BASE + '/publicapi' },
                                      { incluirFallbackDeBaseUrl: false });

  assert.ok(c.every(u => u.startsWith(caida)),
            'se colo un candidato de otro host: ' + c.filter(u => !u.startsWith(caida)).join(' '));
  assert.ok(!c.includes(BASE + '/v3/api-docs'), 'no debe ofrecer el swagger principal');
});

test('por defecto el fallback esta prendido, para no cambiar el camino de un swagger solo', () => {
  const c = buildSwaggerCandidateUrls(BASE + '/v3/api-docs', { BASE_URL: 'http://otro:1/publicapi' });
  assert.ok(c.includes('http://otro:1/v3/api-docs'), 'el fallback tiene que seguir estando');
});

test('sin url y sin BASE_URL devuelve lista vacia, no candidatos inventados', () => {
  assert.deepEqual(buildSwaggerCandidateUrls('', {}), []);
  assert.deepEqual(buildSwaggerCandidateUrls(null, null), []);
  assert.deepEqual(buildSwaggerCandidateUrls(undefined, undefined), []);
});

test('no repite candidatos cuando la url y BASE_URL apuntan al mismo lugar', () => {
  const c = buildSwaggerCandidateUrls(BASE, { BASE_URL: BASE + '/publicapi' });
  assert.equal(new Set(c).size, c.length, 'hay duplicados: ' + c.join(' '));
});

test('espacios alrededor de la url no generan candidatos rotos', () => {
  const c = buildSwaggerCandidateUrls('   ' + BASE + '   ', {});
  assert.equal(c[0], BASE);
  assert.ok(c.includes(BASE + '/v3/api-docs'));
});

test('el orden pone /v3/api-docs antes que los demas sufijos', () => {
  const c = buildSwaggerCandidateUrls(BASE, {});
  const iApiDocs = c.indexOf(BASE + '/v3/api-docs');
  const iSwaggerJson = c.indexOf(BASE + '/swagger.json');
  assert.ok(iApiDocs >= 0 && iApiDocs < iSwaggerJson,
            'springdoc es el caso mas comun, va primero');
});
