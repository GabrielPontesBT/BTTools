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

test('formato v4 legado: contra el archivo real V4/Loan-Parameters/getCapital.md', () => {
  const ruta = path.join(__dirname, '..', '..', 'V4', 'Loan-Parameters', 'getCapital.md');
  const md = fs.readFileSync(ruta, 'utf8');
  const ejemplos = leerEjemplosExistentes(md);
  assert.equal(ejemplos.formato, 'v4-legado');
  assert.deepEqual(ejemplos.valoresEntrada, { productGUID: 'bf0d7e10-dce6-4bd4-b866-9984556613ec' });
  assert.deepEqual(ejemplos.valoresSalida, { minimum: 2000, maximum: 200000, defaultValue: 2000 });
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
