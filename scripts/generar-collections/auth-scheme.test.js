// Gate test del esquema de autenticacion de la API publica.
//
// Arquitectura dejo de usar Authenticate.Execute: la API publica se autentica
// con el user-login de session (canal BTPUBLIC, jwt) y el sessionToken viaja
// despues como "Authorization: Bearer". Los headers de canal/usuario/device/
// requerimiento dejaron de mandarse.
//
// Lo que se fija aca es lo que sale por el cable y lo que sale en el archivo:
// el modulo compartido (bantotal-urls) ya tiene sus tests unitarios, pero el
// bug caro no es el helper -- es que la ejecucion en vivo y la collection
// exportada no digan lo mismo. Por eso se levanta un servidor real y se le
// mira el request, en vez de mockear el http.

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { createCollectionFeature } = require('./index');

// ROOT propio por corrida: la collection generada se escribe en disco y no
// tiene por que ensuciar el output del repo.
function raizTemporal() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'btapi-auth-'));
}

function feature(root) {
  return createCollectionFeature({
    ROOT: root,
    queryServicesWithMethods: async () => ({ services: [], methodsByService: {} }),
    queryMethodSchema: async () => ({}),
  });
}

function llamarRuta(feat, url, body) {
  return new Promise((resolve, reject) => {
    const req = { method: 'POST', url };
    const helpers = { json: (status, payload) => resolve(payload), readBody: async () => body };
    feat.handleApi(req, {}, helpers).then((manejada) => {
      if (!manejada) reject(new Error('handleApi no tomo la ruta ' + url));
    }, reject);
  });
}

// Ambiente falso: responde el user-login y un endpoint de negocio, y guarda
// cada request recibido (url + headers + body) para poder afirmar sobre el.
function servidorAmbiente(opciones) {
  const o = opciones || {};
  const recibidos = [];
  const server = http.createServer((req, res) => {
    let cuerpo = '';
    req.on('data', (c) => { cuerpo += c; });
    req.on('end', () => {
      recibidos.push({ url: req.url, headers: req.headers, body: cuerpo });
      res.setHeader('Content-Type', 'application/json');
      if (/\/session\/v1\/user-login$/.test(req.url)) {
        if (o.sinSessionLogin) { res.writeHead(404); res.end('{}'); return; }
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, sessionToken: 'jwt.abc', userCode: 5488 }));
        return;
      }
      // El gateway de "API interna" expone el login en camelCase
      // (/Session/v1/userLogin), no en el kebab de la API publica.
      if (/\/Session\/v1\/userLogin$/.test(req.url)) {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, sessionToken: 'jwt.interna', userCode: 5488 }));
        return;
      }
      if (/\/authenticate\/v1\/execute$/i.test(req.url)) {
        res.writeHead(200);
        res.end(JSON.stringify({ SessionToken: 'TOKEN-VIEJO' }));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify({ Guid: 'g-1' }));
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({
        raiz: 'http://127.0.0.1:' + server.address().port,
        recibidos,
        cerrar: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

function itemNegocio() {
  return {
    service: 'Persons',
    method: 'getGUID',
    path: '/public/persons/v1/guid',
    httpMethod: 'GET',
    manualInputs: [],
    outputFields: [],
  };
}

function bodyEjecucion(amb, extra) {
  return Object.assign({
    format: 'json',
    version: 'V4',
    apiMode: 'publica',
    api: { BASE_URL: amb.raiz, API_USER: 'INSTALADOR', API_PASSWORD: 'Bantotal2015', API_DEVICE: 'GP' },
    swaggerBaseUrl: amb.raiz,
    items: [itemNegocio()],
    variableOverrides: {},
  }, extra || {});
}

// ── Ejecucion en vivo ─────────────────────────────────────────────────────

test('el login publico pega a session/user-login con canal BTPUBLIC y jwt:true', async () => {
  const amb = await servidorAmbiente();
  try {
    const r = await llamarRuta(feature(raizTemporal()), '/api/collection/execute', bodyEjecucion(amb, {
      swaggerAuthUrl: amb.raiz + '/session/v1/user-login',
    }));
    assert.equal(r.ok, true, r.message);

    const login = amb.recibidos[0];
    assert.match(login.url, /\/session\/v1\/user-login$/);
    assert.equal(login.headers.canal, 'BTPUBLIC');
    // Device va: sin el, el ambiente real devuelve "API internal error".
    assert.equal(login.headers.device, 'GP');
    assert.deepEqual(JSON.parse(login.body), {
      user: 'INSTALADOR', userPassword: 'Bantotal2015', jwt: true,
    });
    // Token NO va ni vacio: con el header Token el servicio de session
    // contesta 401 "Token is blank". Usuario/Requerimiento no cambian nada.
    assert.equal(login.headers.token, undefined);
    assert.equal(login.headers.usuario, undefined);
    assert.equal(login.headers.requerimiento, undefined);
  } finally { await amb.cerrar(); }
});

test('el request de negocio viaja con Authorization: Bearer y sin headers de canal', async () => {
  const amb = await servidorAmbiente();
  try {
    const r = await llamarRuta(feature(raizTemporal()), '/api/collection/execute', bodyEjecucion(amb, {
      swaggerAuthUrl: amb.raiz + '/session/v1/user-login',
    }));
    assert.equal(r.ok, true, r.message);

    const negocio = amb.recibidos[1];
    assert.match(negocio.url, /\/public\/persons\/v1\/guid/);
    assert.equal(negocio.headers.authorization, 'Bearer jwt.abc');
    assert.equal(negocio.headers.canal, undefined);
    assert.equal(negocio.headers.usuario, undefined);
    assert.equal(negocio.headers.token, undefined);
  } finally { await amb.cerrar(); }
});

test('el ambiente sin migrar sigue andando: Authenticate viejo y header Token', async () => {
  const amb = await servidorAmbiente();
  try {
    const r = await llamarRuta(feature(raizTemporal()), '/api/collection/execute', bodyEjecucion(amb, {
      // Lo que dejaria "Probar autenticacion" en un ambiente sin migrar.
      swaggerAuthKind: 'authenticate-execute',
      swaggerAuthUrl: amb.raiz + '/authenticate/v1/execute',
    }));
    assert.equal(r.ok, true, r.message);

    const negocio = amb.recibidos[1];
    assert.equal(negocio.headers.token, 'TOKEN-VIEJO');
    assert.equal(negocio.headers.canal, 'BTDIGITAL');
    assert.equal(negocio.headers.authorization, undefined);
  } finally { await amb.cerrar(); }
});

// ── Collection exportada ──────────────────────────────────────────────────

function bodyGeneracion(amb, extra) {
  return Object.assign({
    format: 'json',
    target: 'postman',
    version: 'V4',
    apiMode: 'publica',
    collectionName: 'test-auth-scheme',
    api: { BASE_URL: amb.raiz, API_USER: 'INSTALADOR', API_PASSWORD: 'Bantotal2015' },
    swaggerBaseUrl: amb.raiz,
    swaggerAuthUrl: amb.raiz + '/session/v1/user-login',
    scenarios: [{ name: 'Caso', items: [itemNegocio()], variableOverrides: {} }],
  }, extra || {});
}

async function generar(root, body) {
  const r = await llamarRuta(feature(root), '/api/collection/generate', body);
  assert.equal(r.ok, true, r.message);
  const file = path.join(root, 'scripts', 'generar-collections', 'output', r.fileName);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function headerDe(request, nombre) {
  const found = (request.header || []).find(function (h) {
    return String(h.key).toLowerCase() === nombre.toLowerCase();
  });
  return found ? found.value : undefined;
}

test('la collection exportada arranca con el user-login y no con Authenticate', async () => {
  const amb = await servidorAmbiente();
  try {
    const col = await generar(raizTemporal(), bodyGeneracion(amb));
    const auth = col.item[0].item[0];
    assert.match(auth.name, /user-login/);
    assert.equal(headerDe(auth.request, 'Canal'), 'BTPUBLIC');
    assert.equal(headerDe(auth.request, 'Device'), '{{device}}');
    assert.equal(headerDe(auth.request, 'Token'), undefined, 'con Token el login da 401');
    assert.deepEqual(JSON.parse(auth.request.body.raw), {
      user: '{{username}}', userPassword: '{{password}}', jwt: true,
    });
  } finally { await amb.cerrar(); }
});

test('los requests exportados llevan Authorization: Bearer {{token}} y ningun header de canal', async () => {
  const amb = await servidorAmbiente();
  try {
    const col = await generar(raizTemporal(), bodyGeneracion(amb));
    const negocio = col.item[0].item[1];
    assert.equal(headerDe(negocio.request, 'Authorization'), 'Bearer {{token}}');
    ['Canal', 'Usuario', 'Device', 'Requerimiento', 'Token'].forEach(function (h) {
      assert.equal(headerDe(negocio.request, h), undefined, 'sobra el header ' + h);
    });
  } finally { await amb.cerrar(); }
});

test('la variable channel de la collection queda en BTPUBLIC', async () => {
  const amb = await servidorAmbiente();
  try {
    const col = await generar(raizTemporal(), bodyGeneracion(amb));
    const channel = col.variable.find(function (v) { return v.key === 'channel'; });
    assert.equal(channel.value, 'BTPUBLIC');
  } finally { await amb.cerrar(); }
});

test('con el esquema viejo la collection exportada no cambia', async () => {
  const amb = await servidorAmbiente();
  try {
    const col = await generar(raizTemporal(), bodyGeneracion(amb, {
      swaggerAuthKind: 'authenticate-execute',
      swaggerAuthUrl: amb.raiz + '/authenticate/v1/execute',
    }));
    const auth = col.item[0].item[0];
    assert.equal(auth.name, '0. Authenticate');
    const negocio = col.item[0].item[1];
    assert.equal(headerDe(negocio.request, 'Token'), '{{token}}');
    assert.equal(headerDe(negocio.request, 'Authorization'), undefined);
  } finally { await amb.cerrar(); }
});

// ── API interna ───────────────────────────────────────────────────────────
//
// El gateway interno (medido en 10.0.0.7:5107/api/platform) usa el mismo
// user-login que la publica, con dos diferencias: el path va en camelCase
// (/Session/v1/userLogin) y el canal sale del ambiente, no es BTPUBLIC fijo.
// El token de negocio sigue viajando en el header Token, porque los endpoints
// internos declaran esos cinco headers en su propio swagger.
//
// Lo que rompia la interna era lo mismo que rompia la publica: se mandaba un
// header Token vacio en el login y el servicio contestaba 401 "Token is blank".

function bodyInterna(amb, extra) {
  return Object.assign(bodyEjecucion(amb), {
    apiMode: 'interna',
    swaggerAuthKind: 'session-userlogin',
    swaggerAuthUrl: amb.raiz + '/Session/v1/userLogin',
    api: {
      BASE_URL: amb.raiz, API_USER: 'INSTALADOR', API_PASSWORD: 'Bantotal2015',
      API_CANAL: 'BTINTERNO', API_DEVICE: 'GP', API_REQUERIMIENTO: '1',
    },
  }, extra || {});
}

test('el login interno NO manda Token: eso es lo que devolvia 401', async () => {
  const amb = await servidorAmbiente();
  try {
    const r = await llamarRuta(feature(raizTemporal()), '/api/collection/execute', bodyInterna(amb));
    assert.equal(r.ok, true, r.message);

    const login = amb.recibidos[0];
    assert.match(login.url, /\/Session\/v1\/userLogin$/);
    assert.equal(login.headers.token, undefined, 'con Token vacio el servicio contesta 401');
    assert.equal(login.headers.usuario, undefined);
    assert.equal(login.headers.requerimiento, undefined);
    assert.deepEqual(JSON.parse(login.body), {
      user: 'INSTALADOR', userPassword: 'Bantotal2015', jwt: true,
    });
  } finally { await amb.cerrar(); }
});

test('el login interno usa el canal del ambiente, no el BTPUBLIC de la publica', async () => {
  const amb = await servidorAmbiente();
  try {
    await llamarRuta(feature(raizTemporal()), '/api/collection/execute', bodyInterna(amb));
    const login = amb.recibidos[0];
    assert.equal(login.headers.canal, 'BTINTERNO');
    assert.equal(login.headers.device, 'GP');
  } finally { await amb.cerrar(); }
});

test('el request de negocio interno sigue llevando el header Token, no Bearer', async () => {
  const amb = await servidorAmbiente();
  try {
    await llamarRuta(feature(raizTemporal()), '/api/collection/execute', bodyInterna(amb));
    const negocio = amb.recibidos[1];
    assert.equal(negocio.headers.token, 'jwt.interna');
    assert.equal(negocio.headers.canal, 'BTINTERNO');
    assert.equal(negocio.headers.authorization, undefined,
                 'los endpoints internos declaran los headers de canal en su swagger');
  } finally { await amb.cerrar(); }
});

test('la collection interna exportada tampoco lleva Token en el login', async () => {
  const amb = await servidorAmbiente();
  try {
    const col = await generar(raizTemporal(), Object.assign(bodyGeneracion(amb), {
      apiMode: 'interna',
      swaggerAuthKind: 'session-userlogin',
      swaggerAuthUrl: amb.raiz + '/Session/v1/userLogin',
    }));
    const auth = col.item[0].item[0];
    assert.match(auth.name, /Session\.userLogin/);
    assert.equal(headerDe(auth.request, 'Canal'), '{{channel}}');
    assert.equal(headerDe(auth.request, 'Device'), '{{device}}');
    assert.equal(headerDe(auth.request, 'Token'), undefined, 'con Token el login da 401');
    assert.equal(headerDe(auth.request, 'Usuario'), undefined);
  } finally { await amb.cerrar(); }
});

// ── El historial de valores no guarda credenciales ────────────────────────
//
// successful-values.json esta versionado. Una corrida real llego a dejar ahi
// el jwt de sesion y se fue en un commit: el token es un valor de runtime
// como cualquier otro, y el historial guardaba todos.

test('el historial de sugerencias NO guarda el token ni la password', async () => {
  const amb = await servidorAmbiente();
  const root = raizTemporal();
  try {
    const r = await llamarRuta(feature(root), '/api/collection/execute', bodyEjecucion(amb, {
      swaggerAuthUrl: amb.raiz + '/session/v1/user-login',
    }));
    assert.equal(r.ok, true, r.message);

    const archivo = path.join(root, 'scripts', 'generar-collections', 'data', 'successful-values.json');
    const guardado = fs.existsSync(archivo) ? fs.readFileSync(archivo, 'utf8') : '{}';
    assert.doesNotMatch(guardado, /jwt\.abc/, 'se guardo el token de sesion');
    assert.doesNotMatch(guardado, /Bantotal2015/, 'se guardo la password');
    assert.doesNotMatch(guardado, /"token"/i);
    // Y lo que si sirve como sugerencia se sigue guardando.
    assert.match(guardado, /username|channel|device/);
  } finally { await amb.cerrar(); }
});
