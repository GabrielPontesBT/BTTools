// Gate tests del paso de Ambiente de "Generar casos de prueba".
//
// Cubren las dos piezas que cambiaron al fusionar las dos pantallas
// (credenciales / ruta Swagger) en un solo paso del wizard:
//
//  1. renderDetected: lo que el Swagger dejo resuelto (raiz de la API, login,
//     cuantas operaciones) se muestra como texto en vez de pedirse tipeado en
//     dos campos de URL casi identicos.
//  2. El contenedor de avisos: el feedback de "Cargar servicios" tiene que
//     escribirse en el panel que el usuario esta mirando, que ya no es el del
//     builder.
//
// Los modulos son IIFE de navegador (ver public/collections/CLAUDE.md), asi
// que se cargan tal cual en un sandbox de vm con los globals minimos.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// DOM minimo: solo getElementById sobre un mapa de elementos creados a demanda.
function makeDom(elementos) {
  const els = elementos || {};
  return {
    els,
    getElementById: function (id) {
      if (!els[id]) {
        els[id] = {
          style: {}, className: '', innerHTML: '', textContent: '',
          setAttribute: function () {}, removeAttribute: function () {},
          querySelector: function () { return null; },
        };
      }
      return els[id];
    },
  };
}

function cargarModulo(relativo, sandboxExtra) {
  const src = fs.readFileSync(path.join(__dirname, relativo), 'utf8');
  const sandbox = Object.assign({
    document: makeDom(),
    setTimeout: function () {}, clearTimeout: function () {},
  }, sandboxExtra || {});
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: relativo });
  return sandbox;
}

function escapeHtml(text) {
  return String(text == null ? '' : text).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

function managerDeAmbiente(state) {
  const sandbox = cargarModulo('collections/services/collection-environment-manager.js');
  const Manager = sandbox.BTCollectionModules.CollectionEnvironmentManager;
  const manager = new Manager({
    getState: function () { return state; },
    escapeHtml: escapeHtml,
  });
  return { manager, dom: sandbox.document };
}

// ── renderDetected ───────────────────────────────────────────

test('renderDetected no muestra nada mientras no haya catalogo cargado', () => {
  const { manager, dom } = managerDeAmbiente({ services: [] });
  manager.renderDetected();

  const box = dom.getElementById('collection-env-detected');
  assert.equal(box.style.display, 'none');
  assert.equal(box.innerHTML, '');
});

test('renderDetected muestra la raiz de la API y el login que salieron del Swagger', () => {
  const { manager, dom } = managerDeAmbiente({
    services: ['Loans', 'Customers'],
    serviceOperations: { Loans: [{}, {}, {}], Customers: [{}] },
    swaggerBaseUrl: 'http://10.0.0.7:5101/api/publicapi',
    swaggerAuthUrl: 'http://10.0.0.7:5101/api/publicapi/session/v1/user-login',
    swaggerResolvedUrl: 'http://10.0.0.7:5101/api/publicapi/v1/api-docs',
  });
  manager.renderDetected();

  const html = dom.getElementById('collection-env-detected').innerHTML;
  assert.equal(dom.getElementById('collection-env-detected').style.display, 'block');
  assert.match(html, /2 servicios, 4 operaciones/);
  assert.match(html, /http:\/\/10\.0\.0\.7:5101\/api\/publicapi</, 'la raiz de la API, ya resuelta');
  assert.match(html, /session\/v1\/user-login/, 'y contra donde se autentica');
  assert.match(html, /v1\/api-docs/, 'mas el documento del que salio todo');
});

test('renderDetected dice que falta, en vez de mostrar un vacio', () => {
  const { manager, dom } = managerDeAmbiente({
    services: ['Loans'],
    serviceOperations: { Loans: [{}] },
    swaggerBaseUrl: '',
    swaggerAuthUrl: '',
  });
  manager.renderDetected();

  const html = dom.getElementById('collection-env-detected').innerHTML;
  assert.match(html, /sin resolver/);
  assert.match(html, /no detectado/, 'un login no detectado es justo lo que hay que ver antes de seguir');
});

// ── Contenedor de avisos ─────────────────────────────────────

function managerDeFeedback() {
  const sandbox = cargarModulo('collections/ui/collection-feedback-manager.js', {
    collectionEscapeHtml: escapeHtml,
  });
  const Manager = sandbox.BTCollectionModules.CollectionFeedbackManager;
  return { manager: new Manager(), dom: sandbox.document };
}

test('mientras se ve el paso de Ambiente, los avisos van a su propio bloque', () => {
  const { manager, dom } = managerDeFeedback();
  dom.getElementById('collection-catalog-section').style.display = 'block';

  manager.showStatus('err', 'No se pudo leer el swagger.');

  assert.match(dom.getElementById('collection-env-status').innerHTML, /No se pudo leer el swagger/,
               'el error de cargar servicios tiene que verse donde esta el usuario');
  assert.equal(dom.getElementById('collection-status').innerHTML, '',
               'y no en el panel del builder, que en ese momento no se ve');
});

test('en el builder, los avisos siguen yendo al bloque de siempre', () => {
  const { manager, dom } = managerDeFeedback();
  dom.getElementById('collection-catalog-section').style.display = 'none';

  manager.showStatus('ok', 'Collection generada.');

  assert.match(dom.getElementById('collection-status').innerHTML, /Collection generada/);
  assert.equal(dom.getElementById('collection-env-status').innerHTML, '');
});
