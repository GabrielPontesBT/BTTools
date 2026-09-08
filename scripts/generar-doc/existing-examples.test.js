const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { leerEjemplosExistentes } = require('./existing-examples');

// Formato viejo de v4: un único @tab JSON, body y respuesta envueltos en
// Btinreq/Btoutreq/BusinessErrors (así generaba una version anterior del
// script, antes de separar cURL / JSON Body y limpiar el envelope).
function mdV4Legado({ requestJson, responseJson }) {
  return `---\ntitle: X\n---\n\n<!-- ABRE EJEMPLO DE INVOCACIÓN -->\n::: details Ejemplo de Invocación\n::: code-tabs #Formato\n@tab JSON\n\`\`\`json\n${requestJson}\n\`\`\`\n:::\n<!-- CIERRA EJEMPLO DE INVOCACIÓN -->\n\n<!-- ABRE EJEMPLO DE RESPUESTA -->\n::: details Ejemplo de Respuesta\n::: code-tabs #Formato\n@tab JSON\n\`\`\`json\n${responseJson}\n\`\`\`\n:::\n<!-- CIERRA EJEMPLO DE RESPUESTA -->\n`;
}

function mdV4({ curl = 'curl -X GET https://x', jsonBody = null, responseJson = '{\n  "id": 1\n}' } = {}) {
  const invocacionTabs = jsonBody
    ? `@tab cURL\n\`\`\`bash\n${curl}\n\`\`\`\n\n@tab JSON Body\n\`\`\`json\n${jsonBody}\n\`\`\``
    : `@tab cURL\n\`\`\`bash\n${curl}\n\`\`\``;
  return `---\ntitle: X\n---\n\n<!-- ABRE EJEMPLO DE INVOCACIÓN -->\n::: details Ejemplo de Invocación\n::: code-tabs #Formato\n\n${invocacionTabs}\n\n:::\n<!-- CIERRA EJEMPLO DE INVOCACIÓN -->\n\n<!-- ABRE EJEMPLO DE RESPUESTA -->\n::: details Ejemplo de Respuesta\n::: code-tabs #Formato\n\n@tab JSON\n\`\`\`json\n${responseJson}\n\`\`\`\n:::\n<!-- CIERRA EJEMPLO DE RESPUESTA -->\n`;
}

function mdV3({ requestXml = '<Btinreq/>', requestJson = '{}', responseXml = '<Resp/>', responseJson = '{}' } = {}) {
  return `---\ntitle: X\n---\n\n<!-- ABRE EJEMPLO DE INVOCACIÓN -->\n::: details Ejemplo de Invocación\n::: code-tabs #Formato\n@tab XML\n\`\`\`xml\n${requestXml}\n\`\`\`\n@tab JSON\n\`\`\`json\n${requestJson}\n\`\`\`\n:::\n<!-- CIERRA EJEMPLO DE INVOCACIÓN -->\n\n<!-- ABRE EJEMPLO DE RESPUESTA -->\n::: details Ejemplo de Respuesta\n::: code-tabs #Formato\n@tab XML\n\`\`\`xml\n${responseXml}\n\`\`\`\n@tab JSON\n\`\`\`json\n${responseJson}\n\`\`\`\n:::\n<!-- CIERRA EJEMPLO DE RESPUESTA -->\n`;
}

test('devuelve null si no hay contenido', () => {
  assert.equal(leerEjemplosExistentes(null), null);
  assert.equal(leerEjemplosExistentes(''), null);
});

test('devuelve null si el md no tiene secciones de ejemplos reconocibles', () => {
  assert.equal(leerEjemplosExistentes('# Documento sin ejemplos\n\nHola.'), null);
});

test('formato v4: extrae cURL, JSON Body y respuesta JSON', () => {
  const md = mdV4({ curl: 'curl -X POST https://api/x -d \'{"a":1}\'', jsonBody: '{\n  "a": 1\n}', responseJson: '{\n  "ok": true\n}' });
  const ejemplos = leerEjemplosExistentes(md);
  assert.equal(ejemplos.formato, 'v4-actual');
  assert.equal(ejemplos.curlCmd, 'curl -X POST https://api/x -d \'{"a":1}\'');
  assert.equal(ejemplos.requestJson, '{\n  "a": 1\n}');
  assert.equal(ejemplos.responseJson, '{\n  "ok": true\n}');
  assert.equal(ejemplos.requestXml, null);
  assert.equal(ejemplos.responseXml, null);
});

test('formato v4 sin body (GET sin params): no rompe, solo falta el JSON Body', () => {
  const md = mdV4({ curl: 'curl -X GET https://api/x', jsonBody: null, responseJson: '{}' });
  const ejemplos = leerEjemplosExistentes(md);
  assert.equal(ejemplos.curlCmd, 'curl -X GET https://api/x');
  assert.equal(ejemplos.requestJson, null);
});

test('formato v3: extrae XML y JSON de invocación y respuesta por separado', () => {
  const md = mdV3({
    requestXml: '<Btinreq><Token>REAL123</Token></Btinreq>',
    requestJson: '{\n  "Btinreq": { "Token": "REAL123" }\n}',
    responseXml: '<Resp><Id>42</Id></Resp>',
    responseJson: '{\n  "Id": 42\n}',
  });
  const ejemplos = leerEjemplosExistentes(md);
  assert.equal(ejemplos.formato, 'v3-actual');
  assert.equal(ejemplos.requestXml, '<Btinreq><Token>REAL123</Token></Btinreq>');
  assert.equal(ejemplos.requestJson, '{\n  "Btinreq": { "Token": "REAL123" }\n}');
  assert.equal(ejemplos.responseXml, '<Resp><Id>42</Id></Resp>');
  assert.equal(ejemplos.responseJson, '{\n  "Id": 42\n}');
});

test('no confunde el JSON de respuesta con el de invocación (secciones separadas)', () => {
  const md = mdV3({ requestJson: '{\n  "req": 1\n}', responseJson: '{\n  "resp": 2\n}' });
  const ejemplos = leerEjemplosExistentes(md);
  assert.equal(ejemplos.requestJson, '{\n  "req": 1\n}');
  assert.equal(ejemplos.responseJson, '{\n  "resp": 2\n}');
});

test('formato v4 legado (sin cURL, un solo @tab JSON con Btinreq): migra en vez de preservar', () => {
  const md = mdV4Legado({
    requestJson: '{\n  "Btinreq": { "Token": "X" },\n  "productGUID": "bf0d7e10-dce6-4bd4-b866-9984556613ec"\n}',
    responseJson: '{\n  "Btinreq": { "Token": "X" },\n  "minimum": 2000,\n  "maximum": 200000,\n  "BusinessErrors": { "BusinessError": [] },\n  "Btoutreq": { "Estado": "OK" }\n}',
  });
  const ejemplos = leerEjemplosExistentes(md);
  assert.equal(ejemplos.formato, 'v4-legado');
  assert.equal(ejemplos.curlCmd, undefined);
  assert.deepEqual(ejemplos.valoresEntrada, { productGUID: 'bf0d7e10-dce6-4bd4-b866-9984556613ec' });
  assert.deepEqual(ejemplos.valoresSalida, { minimum: 2000, maximum: 200000 });
});

test('formato v4 legado: tolera la comilla suelta al final del JSON que dejaba el generador viejo', () => {
  const md = mdV4Legado({
    requestJson: '{\n  "Btinreq": { "Token": "X" },\n  "productGUID": "abc"\n}\'',
    responseJson: '{\n  "Btinreq": { "Token": "X" },\n  "minimum": 5\n}',
  });
  const ejemplos = leerEjemplosExistentes(md);
  assert.equal(ejemplos.formato, 'v4-legado');
  assert.deepEqual(ejemplos.valoresEntrada, { productGUID: 'abc' });
});

// ── Contra el corpus real, no contra un fixture ──────────────
//
// Este test apuntaba a V4/Loan-Parameters/getCapital.md, un archivo que ya
// no existe: el metodo paso a llamarse getCapitalRange y su .md se
// regenero en formato v4-actual (tiene tab cURL). O sea que se rompio por
// dos motivos a la vez, y ninguno era un bug del parser.
//
// De ahi la forma nueva. El primer test recorre lo que el corpus tenga en
// ese momento en vez de nombrar un archivo, asi que un rename o una
// regeneracion no lo rompen. El segundo si fija valores exactos, para lo
// cual hace falta nombrar uno, pero explica en el mensaje de error que la
// causa mas probable es esta misma.

const RAIZ_CORPUS = path.join(__dirname, '..', '..');
const CLAVES_ENVELOPE = ['Btinreq', 'Btoutreq', 'BusinessErrors', '_xmlns'];

/** Todos los .md de V3/V4 que hoy siguen en formato v4-legado. */
function mdsLegadoDelCorpus() {
  const encontrados = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!e.name.endsWith('.md')) continue;
      const ejemplos = leerEjemplosExistentes(fs.readFileSync(p, 'utf8'));
      if (ejemplos && ejemplos.formato === 'v4-legado') encontrados.push({ ruta: p, ejemplos });
    }
  }
  for (const v of ['V3', 'V4']) walk(path.join(RAIZ_CORPUS, v));
  return encontrados;
}

test('formato v4 legado: todos los .md legado del corpus salen sin envelope', () => {
  // Recorre lo que haya. Si algun dia el corpus queda todo migrado la lista
  // da vacia y el test pasa sin afirmar nada, que es correcto: el parser ya
  // esta cubierto por los fixtures de arriba. Lo que este test agrega es
  // que ningun archivo REAL lo haga fallar.
  const legados = mdsLegadoDelCorpus();

  for (const { ruta, ejemplos } of legados) {
    const rel = path.relative(RAIZ_CORPUS, ruta);
    assert.equal(ejemplos.formato, 'v4-legado', rel);
    // El envelope tiene que quedar afuera de los dos lados.
    for (const clave of CLAVES_ENVELOPE) {
      assert.ok(!(clave in ejemplos.valoresEntrada), rel + ': ' + clave + ' quedo en la entrada');
      assert.ok(!(clave in ejemplos.valoresSalida), rel + ': ' + clave + ' quedo en la salida');
    }
    // Legado es justamente el que no trae cURL: si trajera, seria v4-actual.
    assert.equal(ejemplos.curlCmd, undefined, rel + ': un legado no puede traer cURL');
    // Y algo tiene que haber salido, o no seria legado (ver el `tieneValores`
    // de leerEjemplosExistentes).
    const hayValores = Object.keys(ejemplos.valoresEntrada).length > 0
                    || Object.keys(ejemplos.valoresSalida).length > 0;
    assert.ok(hayValores, rel + ': se detecto legado sin ningun valor');
  }
});

test('formato v4 legado: valores exactos de V4/Saving-Accounts/getCancellationReasons.md', () => {
  // Se eligio este archivo porque esta trackeado en git (el anterior no lo
  // estaba, asi que el test fallaba en cualquier checkout limpio) y porque
  // tiene valores de entrada Y de salida, chicos y legibles.
  const rel = path.join('V4', 'Saving-Accounts', 'getCancellationReasons.md');
  const ruta = path.join(RAIZ_CORPUS, rel);
  assert.ok(fs.existsSync(ruta),
    rel + ' no existe. Si el metodo se renombro o el .md se regenero en formato ' +
    'v4-actual, hay que apuntar este test a otro archivo legado: los que quedan ' +
    'los lista mdsLegadoDelCorpus().');

  const ejemplos = leerEjemplosExistentes(fs.readFileSync(ruta, 'utf8'));
  assert.equal(ejemplos.formato, 'v4-legado',
    rel + ' ya no esta en formato legado (¿se regenero?). Ver el mensaje de arriba.');
  assert.deepEqual(ejemplos.valoresEntrada, { cancellationOriginId: 1 });
  assert.deepEqual(ejemplos.valoresSalida, {
    cancellationReasons: {
      cancellationReason: [
        { id: 1, description: 'CAMBIO DE INSTITUCIÓN' },
        { id: 2, description: 'CUENTA EN DESUSO' },
        { id: 3, description: 'OTROS' },
      ],
    },
  });
});

test('formato v4 actual: no se confunde con legado (tiene tab cURL)', () => {
  const ruta = path.join(__dirname, '..', '..', 'V4', 'General', 'getAdministrativeLevels.md');
  const md = fs.readFileSync(ruta, 'utf8');
  const ejemplos = leerEjemplosExistentes(md);
  assert.equal(ejemplos.formato, 'v4-actual');
  assert.ok(ejemplos.curlCmd.includes('administrativeLevels'));
});

test('CRLF (como lo deja `git checkout` en Windows) no rompe la deteccion de formato', () => {
  // Sin normalizar CRLF->LF, los `\n` literales de extraerTab no matchean
  // y esto devolvia null siempre en un checkout de Windows - la migracion
  // quedaba deshabilitada en silencio, sin ningun error visible.
  const md = mdV4({ curl: 'curl -X POST https://api/x -d \'{"a":1}\'', jsonBody: '{\n  "a": 1\n}', responseJson: '{\n  "ok": true\n}' })
    .replace(/\n/g, '\r\n');
  const ejemplos = leerEjemplosExistentes(md);
  assert.equal(ejemplos.formato, 'v4-actual');
  assert.equal(ejemplos.curlCmd, 'curl -X POST https://api/x -d \'{"a":1}\'');
  assert.equal(ejemplos.requestJson, '{\n  "a": 1\n}');
});
