const test = require('node:test');
const assert = require('node:assert/strict');

const { leerEjemplosExistentes } = require('./existing-examples');

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
