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
    api: { BASE_URL: amb.raiz, API_USER: 'INSTALADOR', API_PASSWORD: 'Bantotal2015' },
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
    assert.deepEqual(JSON.parse(login.body), {
      user: 'INSTALADOR', userPassword: 'Bantotal2015', jwt: true,
    });
    // El login no lleva device/requerimiento/token: eso era del esquema viejo.
    assert.equal(login.headers.device, undefined);
    assert.equal(login.headers.requerimiento, undefined);
    assert.equal(login.headers.token, undefined);
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
