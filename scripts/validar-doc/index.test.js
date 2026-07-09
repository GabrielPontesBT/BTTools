const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  detectarSdtsAnidados, fixarSdtsAnidados, fixarArchivo, validarArchivo,
  detectarConflictosCasingArchivo, aplicarEleccionesCasing,
  parsearJsonEjemplo, parsearXmlEjemplo, obtenerDefaultPorTipo, esNombreCampoValido
} = require('./index.js');

function tmpFile(nombre, contenido) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'validar-doc-test-'));
  const filePath = path.join(dir, nombre);
  fs.writeFileSync(filePath, contenido, 'utf8');
  return filePath;
}

// ── obtenerDefaultPorTipo: valor vacío por tipo, no "REVISAR" ──
//
// El fixer completa campos faltantes con un valor vacío acorde al tipo
// documentado, en vez del placeholder "REVISAR": 0 para numéricos, false para
// booleanos, "" para el resto (String, Date, y tipos con typo/no reconocidos).

test('obtenerDefaultPorTipo devuelve 0 para tipos numéricos (case-insensitive)', () => {
  for (const tipo of ['Double', 'double', 'Int', 'int', 'Long', 'long', 'Short', 'Byte', 'Decimal', 'Numerico']) {
    assert.equal(obtenerDefaultPorTipo(tipo), 0, `tipo ${tipo} debería dar 0`);
  }
});

test('obtenerDefaultPorTipo devuelve false para tipos booleanos', () => {
  assert.equal(obtenerDefaultPorTipo('Boolean'), false);
  assert.equal(obtenerDefaultPorTipo('boolean'), false);
});

test('obtenerDefaultPorTipo devuelve "" para String, Date y tipos no reconocidos/con typo', () => {
  for (const tipo of ['String', 'Date', 'DateTime', 'Sting', 'Duble', 'Character', '', undefined]) {
    assert.equal(obtenerDefaultPorTipo(tipo), '', `tipo ${JSON.stringify(tipo)} debería dar ""`);
  }
});

// ── esNombreCampoValido / regex de nombres de campo no escapados ──
//
// Reproduce el caso real reportado: la tabla SDT de sBTSimulacionLibreAmortizacion
// documenta un campo como "clienteUId*" (el "*" de "requerido" quedó pegado al
// nombre por error). Antes de este fix, ese "*" viajaba sin escapar a un
// new RegExp(...) — como cuantificador regex, "d*" matcheaba el tag real
// <clienteUId> (0+ "d"), lo que disparaba un rename espurio a <clienteUId*> y,
// en corridas repetidas de --fix, insertaba copias duplicadas. El fix real es
// doble: (1) escapar todo nombre de campo antes de meterlo en un RegExp, y
// (2) nunca auto-insertar un campo nuevo cuyo nombre documentado no sea un
// identificador válido — en ese caso el problema queda para corrección manual
// de la doc en vez de escribir un tag/key basura.

test('esNombreCampoValido acepta identificadores Bantotal normales y rechaza nombres con typo/caracteres especiales', () => {
  for (const nombre of ['clienteUId', 'cliente_UId', '_privado', 'a1', 'ABC123']) {
    assert.equal(esNombreCampoValido(nombre), true, `"${nombre}" debería ser válido`);
  }
  for (const nombre of ['clienteUId*', '1campo', 'cliente Id', 'campo.anidado', 'campo-guion', '', undefined, null]) {
    assert.equal(esNombreCampoValido(nombre), false, `"${nombre}" debería ser inválido`);
  }
});

function mdConCampoSdtNombreInvalido() {
  return [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'sdtSimulacion | [sBTSimulacion](#sbtsimulacion) | Datos de simulación.',
    '',
    '@tab Datos de Salida',
    '',
    'No aplica.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope>',
    '   <soapenv:Body>',
    '      <bts:Test.Metodo>',
    '         <bts:Btinreq>',
    '            <bts:Canal>BTDIGITAL</bts:Canal>',
    '         </bts:Btinreq>',
    '         <bts:sdtSimulacion>',
    '            <bts:clienteUId>3</bts:clienteUId>',
    '         </bts:sdtSimulacion>',
    '      </bts:Test.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    '  "sdtSimulacion": { "clienteUId": 3 }',
    '}',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    '  "Erroresnegocio": {},',
    '  "Btoutreq": { "Estado": "OK" }',
    '}',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    '',
    '::: details sBTSimulacion',
    '',
    '### sBTSimulacion',
    '',
    '::: center',
    'Los campos del tipo de dato estructurado sBTSimulacion son los siguientes:',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'clienteUId* | Long | Identificador único de cliente.',
    ':::',
    ''
  ].join('\n');
}

test('fixarArchivo no corrompe el tag XML real cuando el nombre documentado tiene un typo con "*" (regex especial sin escapar)', () => {
  const filePath = tmpFile('nombre-invalido-xml.md', mdConCampoSdtNombreInvalido());
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const xmlInv = parsearXmlEjemplo(contenido, 'Invocación');
  assert.match(xmlInv, /<bts:clienteUId>3<\/bts:clienteUId>/, `el tag real no debería cambiar: ${xmlInv}`);
  assert.doesNotMatch(xmlInv, /clienteUId\*/, `no debería aparecer un tag con "*" en el XML: ${xmlInv}`);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo no inserta una key JSON con nombre inválido ("clienteUId*") — deja el problema para corrección manual', () => {
  const filePath = tmpFile('nombre-invalido-json.md', mdConCampoSdtNombreInvalido());
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const jsonInv = parsearJsonEjemplo(contenido, 'Invocación').data;
  assert.ok(!('clienteUId*' in jsonInv.sdtSimulacion), `no debería insertar la key inválida: ${JSON.stringify(jsonInv)}`);
  assert.equal(jsonInv.sdtSimulacion.clienteUId, 3, 'el valor real no debería tocarse');

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo es idempotente ante un nombre documentado inválido — correr --fix dos veces no acumula duplicados', () => {
  const filePath = tmpFile('nombre-invalido-idempotente.md', mdConCampoSdtNombreInvalido());
  fixarArchivo(filePath);
  const primeraPasada = fs.readFileSync(filePath, 'utf8');
  fixarArchivo(filePath);
  const segundaPasada = fs.readFileSync(filePath, 'utf8');

  assert.equal(segundaPasada, primeraPasada, 'una segunda corrida de --fix no debería cambiar nada más');
  assert.equal((segundaPasada.match(/clienteUId/g) || []).length, (primeraPasada.match(/clienteUId/g) || []).length);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('validarArchivo sigue reportando el campo con nombre inválido como "documentado pero ausente" tras --fix (no se corrige solo, y no debe)', () => {
  const filePath = tmpFile('nombre-invalido-sigue-flagged.md', mdConCampoSdtNombreInvalido());
  fixarArchivo(filePath);
  const { problemas } = validarArchivo(filePath);
  assert.ok(
    problemas.some(p => p.includes('clienteUId*') && p.includes('documentado pero ausente')),
    `debería seguir reportando el campo con typo como ausente: ${JSON.stringify(problemas)}`
  );

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// Reproduce el caso reportado: sBTProductosDepositoAPlazo con sBTDatoExtendido y
// sBTDatoLista definidos dentro del mismo bloque ::: details, como último bloque
// del archivo y seguido del comentario de cierre real "<!-- CIERRA SDT -->".
const MD_ANIDADO_ULTIMO_BLOQUE = [
  '## **Tipos de Dato Estructurado**',
  '',
  '<!-- ABRE SDT -->',
  '::: details sBTProductosDepositoAPlazo',
  '',
  '### sBTProductosDepositoAPlazo',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTProductosDepositoAPlazo son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :----------- | :-----------',
  'Campo1 | String | Comentario.',
  'DatoExtendido | [sBTDatoExtendido](#sbtdatoextendido) | Dato extendido.',
  'DatoLista | [sBTDatoLista](#sbtdatolista) | Dato lista.',
  ':::',
  '',
  '### sBTDatoExtendido',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTDatoExtendido son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :----------- | :-----------',
  'CampoA | String | Comentario A.',
  ':::',
  '',
  '### sBTDatoLista',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTDatoLista son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :----------- | :-----------',
  'CampoB | String | Comentario B.',
  ':::',
  '<!-- CIERRA SDT -->',
  ''
].join('\n');

// Mismo defecto pero el bloque anidado NO es el último del archivo (le sigue
// otro ::: details independiente) — el caso que ya funcionaba antes del fix.
const MD_ANIDADO_BLOQUE_INTERMEDIO = [
  '## **Tipos de Dato Estructurado**',
  '',
  '<!-- ABRE SDT -->',
  '::: details sBTProductosDepositoAPlazo',
  '',
  '### sBTProductosDepositoAPlazo',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTProductosDepositoAPlazo son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :----------- | :-----------',
  'Campo1 | String | Comentario.',
  'DatoExtendido | [sBTDatoExtendido](#sbtdatoextendido) | Dato extendido.',
  ':::',
  '',
  '### sBTDatoExtendido',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTDatoExtendido son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :----------- | :-----------',
  'CampoA | String | Comentario A.',
  ':::',
  '',
  '::: details sBTOtroIndependiente',
  '',
  '### sBTOtroIndependiente',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTOtroIndependiente son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :----------- | :-----------',
  'CampoZ | String | Comentario Z.',
  ':::',
  '<!-- CIERRA SDT -->',
  ''
].join('\n');

const MD_SDT_VALIDO = [
  '## **Tipos de Dato Estructurado**',
  '',
  '<!-- ABRE SDT -->',
  '::: details SdtsBTPAWCustomField',
  '',
  '### SdtsBTPAWCustomField',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado SdtsBTPAWCustomField son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :----------- | :-----------',
  'Id | String $<(Length: 30)>$ | Identificador.',
  ':::',
  '<!-- CIERRA SDT -->',
  ''
].join('\n');

test('detectarSdtsAnidados detecta el error exacto reportado (SDTs anidados en el último bloque)', () => {
  const problemas = detectarSdtsAnidados(MD_ANIDADO_ULTIMO_BLOQUE);
  assert.equal(problemas.length, 1);
  assert.match(problemas[0], /Bloque "::: details sBTProductosDepositoAPlazo" contiene SDT\(s\) anidado\(s\): sBTDatoExtendido, sBTDatoLista/);
});

test('detectarSdtsAnidados no marca falso positivo en un SDT válido', () => {
  assert.deepEqual(detectarSdtsAnidados(MD_SDT_VALIDO), []);
});

test('fixarSdtsAnidados separa cada SDT en su propio bloque ::: details (bloque anidado es el último del archivo)', () => {
  const { resultado, cambios } = fixarSdtsAnidados(MD_ANIDADO_ULTIMO_BLOQUE);
  assert.equal(cambios, 1);

  const bloques = [...resultado.matchAll(/^::: details (\w+)/gm)].map(m => m[1]);
  assert.deepEqual(bloques, ['sBTProductosDepositoAPlazo', 'sBTDatoExtendido', 'sBTDatoLista']);

  // Regresión del bug: no debe quedar un ':::' sobrante después del comentario de cierre.
  assert.equal((resultado.match(/^:::\s*$/gm) || []).length, 3);
  assert.match(resultado, /:::\r?\n\r?\n<!-- CIERRA SDT -->\r?\n*$/);

  // El resultado ya no debe disparar el detector.
  assert.deepEqual(detectarSdtsAnidados(resultado), []);
});

test('fixarSdtsAnidados separa correctamente cuando el bloque anidado no es el último del archivo', () => {
  const { resultado, cambios } = fixarSdtsAnidados(MD_ANIDADO_BLOQUE_INTERMEDIO);
  assert.equal(cambios, 1);

  const bloques = [...resultado.matchAll(/^::: details (\w+)/gm)].map(m => m[1]);
  assert.deepEqual(bloques, ['sBTProductosDepositoAPlazo', 'sBTDatoExtendido', 'sBTOtroIndependiente']);
  assert.deepEqual(detectarSdtsAnidados(resultado), []);
});

test('fixarSdtsAnidados es un no-op sobre un documento sin SDTs anidados', () => {
  const { resultado, cambios } = fixarSdtsAnidados(MD_SDT_VALIDO);
  assert.equal(cambios, 0);
  assert.equal(resultado, MD_SDT_VALIDO);
});

test('fixarArchivo (el mismo camino que usa el botón "Corregir seleccionados" vía --fix) corrige el SDT anidado', () => {
  const filePath = tmpFile('nested-sdt.md', MD_ANIDADO_ULTIMO_BLOQUE);
  const cambios = fixarArchivo(filePath);
  assert.ok(cambios > 0);

  const { problemas } = validarArchivo(filePath);
  assert.ok(!problemas.some(p => p.includes('anidado')), `no debería quedar error de SDT anidado, pero se encontró: ${JSON.stringify(problemas)}`);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── Conflictos de casing (documentación vs ejemplo JSON) ─────────

function mdConCasing(jsonInvocacion, sdtBlocks) {
  return [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :----------- | :-----------',
    'Producto | [sBTProductosDepositoAPlazo](#sbtproductosdepositoaplazo) | Producto.',
    '',
    '@tab Datos de Salida',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :----------- | :-----------',
    '',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '@tab JSON',
    '```json',
    JSON.stringify(jsonInvocacion, null, 2),
    '```',
    ':::',
    '<!-- CIERRA EJEMPLO DE INVOCACIÓN -->',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '@tab JSON',
    '```json',
    '{}',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    '',
    '<!-- ABRE SDT -->',
    sdtBlocks,
    '<!-- CIERRA SDT -->'
  ].join('\n');
}

function sdtBlock(nombre, filas) {
  return [
    `::: details ${nombre}`,
    '',
    `### ${nombre}`,
    '',
    '::: center',
    `Los campos del tipo de dato estructurado ${nombre} son los siguientes:`,
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :----------- | :-----------',
    ...filas,
    ':::',
    ''
  ].join('\n');
}

const MD_CASING_1_NIVEL = mdConCasing(
  { Producto: { campo1: 'x' } },
  sdtBlock('sBTProductosDepositoAPlazo', ['Campo1 | String | Comentario.'])
);

const MD_CASING_2_NIVELES = mdConCasing(
  { Producto: { Campo1: 'x', DatoExtendido: { campoa: 'y' } } },
  sdtBlock('sBTProductosDepositoAPlazo', [
    'Campo1 | String | Comentario.',
    'DatoExtendido | [sBTDatoExtendido](#sbtdatoextendido) | Dato extendido.'
  ]) + sdtBlock('sBTDatoExtendido', ['CampoA | String | Comentario A.'])
);

const MD_CASING_3_NIVELES = mdConCasing(
  { Producto: { Campo1: 'x', DatoExtendido: { CampoA: 'y', DatoProfundo: { campob: 'z' } } } },
  sdtBlock('sBTProductosDepositoAPlazo', [
    'Campo1 | String | Comentario.',
    'DatoExtendido | [sBTDatoExtendido](#sbtdatoextendido) | Dato extendido.'
  ]) + sdtBlock('sBTDatoExtendido', [
    'CampoA | String | Comentario A.',
    'DatoProfundo | [sBTDatoProfundo](#sbtdatoprofundo) | Dato profundo.'
  ]) + sdtBlock('sBTDatoProfundo', ['CampoB | String | Comentario B.'])
);

// SDT que se referencia a sí mismo (estructura recursiva real, p.ej. un árbol) —
// no debe colgar el detector en loop infinito.
const MD_CASING_AUTORREFERENCIA = mdConCasing(
  { Producto: { Campo1: 'x', Hijo: { Campo1: 'y', Hijo: {} } } },
  sdtBlock('sBTProductosDepositoAPlazo', [
    'Campo1 | String | Comentario.',
    'Hijo | [sBTProductosDepositoAPlazo](#sbtproductosdepositoaplazo) | Referencia a sí mismo.'
  ])
);

test('detectarConflictosCasingArchivo detecta conflicto de casing en el primer nivel (regresión)', () => {
  const conflictos = detectarConflictosCasingArchivo(MD_CASING_1_NIVEL);
  assert.equal(conflictos.length, 1);
  assert.equal(conflictos[0].sdt, 'sBTProductosDepositoAPlazo');
  assert.equal(conflictos[0].campo, 'Campo1');
  assert.equal(conflictos[0].enDoc, 'Campo1');
  assert.equal(conflictos[0].enEjemplo, 'campo1');
});

test('detectarConflictosCasingArchivo detecta conflicto de casing en un SDT anidado dentro de otro SDT (2 niveles)', () => {
  const conflictos = detectarConflictosCasingArchivo(MD_CASING_2_NIVELES);
  assert.equal(conflictos.length, 1);
  assert.equal(conflictos[0].sdt, 'sBTDatoExtendido');
  assert.equal(conflictos[0].campo, 'CampoA');
  assert.equal(conflictos[0].enDoc, 'CampoA');
  assert.equal(conflictos[0].enEjemplo, 'campoa');
});

test('detectarConflictosCasingArchivo detecta conflicto de casing a 3 niveles de profundidad', () => {
  const conflictos = detectarConflictosCasingArchivo(MD_CASING_3_NIVELES);
  assert.equal(conflictos.length, 1);
  assert.equal(conflictos[0].sdt, 'sBTDatoProfundo');
  assert.equal(conflictos[0].campo, 'CampoB');
  assert.equal(conflictos[0].enEjemplo, 'campob');
});

test('detectarConflictosCasingArchivo no cuelga con un SDT que se referencia a sí mismo', () => {
  const conflictos = detectarConflictosCasingArchivo(MD_CASING_AUTORREFERENCIA);
  assert.deepEqual(conflictos, []);
});

test('aplicarEleccionesCasing con choice="doc" renombra el campo en el JSON aunque esté anidado a 2 niveles', () => {
  const filePath = tmpFile('casing-doc-2niveles.md', MD_CASING_2_NIVELES);
  const conflictos = detectarConflictosCasingArchivo(fs.readFileSync(filePath, 'utf8'));
  const decision = { sdt: conflictos[0].sdt, sdtKey: conflictos[0].sdtKey, path: conflictos[0].path, campo: conflictos[0].campo, choice: 'doc', enDoc: conflictos[0].enDoc, enEjemplo: conflictos[0].enEjemplo };

  const cambios = aplicarEleccionesCasing(filePath, [decision]);
  assert.ok(cambios > 0);

  const contenidoFinal = fs.readFileSync(filePath, 'utf8');
  assert.match(contenidoFinal, /"CampoA":\s*"y"/);
  assert.doesNotMatch(contenidoFinal, /"campoa":/);
  assert.deepEqual(detectarConflictosCasingArchivo(contenidoFinal), []);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('aplicarEleccionesCasing con choice="ejemplo" renombra el campo en la tabla del SDT anidado a 2 niveles', () => {
  const filePath = tmpFile('casing-ejemplo-2niveles.md', MD_CASING_2_NIVELES);
  const conflictos = detectarConflictosCasingArchivo(fs.readFileSync(filePath, 'utf8'));
  const decision = { sdt: conflictos[0].sdt, sdtKey: conflictos[0].sdtKey, path: conflictos[0].path, campo: conflictos[0].campo, choice: 'ejemplo', enDoc: conflictos[0].enDoc, enEjemplo: conflictos[0].enEjemplo };

  const cambios = aplicarEleccionesCasing(filePath, [decision]);
  assert.ok(cambios > 0);

  const contenidoFinal = fs.readFileSync(filePath, 'utf8');
  assert.deepEqual(detectarConflictosCasingArchivo(contenidoFinal), []);
  // La tabla del SDT sBTDatoExtendido ahora debe listar "campoa" en vez de "CampoA"
  const bloqueSdt = contenidoFinal.slice(contenidoFinal.indexOf('::: details sBTDatoExtendido'));
  assert.match(bloqueSdt, /^campoa \| String/m);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('detectarConflictosCasingArchivo reporta conflictos en distintos niveles a la vez sin mezclarlos', () => {
  const md = mdConCasing(
    { Producto: { campo1: 'x', DatoExtendido: { campoa: 'y' } } },
    sdtBlock('sBTProductosDepositoAPlazo', [
      'Campo1 | String | Comentario.',
      'DatoExtendido | [sBTDatoExtendido](#sbtdatoextendido) | Dato extendido.'
    ]) + sdtBlock('sBTDatoExtendido', ['CampoA | String | Comentario A.'])
  );

  const conflictos = detectarConflictosCasingArchivo(md);
  assert.equal(conflictos.length, 2);
  const porSdt = Object.fromEntries(conflictos.map(c => [c.sdt, c]));
  assert.equal(porSdt['sBTProductosDepositoAPlazo'].enEjemplo, 'campo1');
  assert.deepEqual(porSdt['sBTProductosDepositoAPlazo'].path, ['Producto']);
  assert.equal(porSdt['sBTDatoExtendido'].enEjemplo, 'campoa');
  assert.deepEqual(porSdt['sBTDatoExtendido'].path, ['Producto', 'DatoExtendido']);
});

test('aplicarEleccionesCasing acepta decisiones sin "path" (compatibilidad hacia atrás) para conflictos de 1 nivel', () => {
  const filePath = tmpFile('casing-legacy.md', MD_CASING_1_NIVEL);
  const conflictos = detectarConflictosCasingArchivo(fs.readFileSync(filePath, 'utf8'));
  // Decisión "vieja": sin campo path, como se guardaba antes de este cambio.
  const decision = { sdt: conflictos[0].sdt, sdtKey: conflictos[0].sdtKey, campo: conflictos[0].campo, choice: 'doc', enDoc: conflictos[0].enDoc, enEjemplo: conflictos[0].enEjemplo };

  const cambios = aplicarEleccionesCasing(filePath, [decision]);
  assert.ok(cambios > 0);
  assert.deepEqual(detectarConflictosCasingArchivo(fs.readFileSync(filePath, 'utf8')), []);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── Campo SDT documentado ausente en un ARRAY de items (patrón lista Bantotal) ──
//
// Reproduce el caso real: "Datos de Salida" documenta un campo (ej. sdtProductos)
// tipado como SDT, cuyo ejemplo es una LISTA de varios items del mismo tipo SDT
// (JSON: { "sdtProductos": { "sBTProducto": [ {...}, {...}, {...} ] } }, XML:
// <sdtProductos><sBTProducto>...</sBTProducto><sBTProducto>...</sBTProducto>...).
// Si el SDT tiene un campo documentado que falta en el ejemplo, la corrección debe
// agregarlo a TODOS los items, no solo al primero — y la validación debe detectar
// cuando falta en algunos items aunque esté presente en otros.

const MD_ARRAY_SDT_SIN_CAMPO = [
  '---',
  'title: Test',
  '---',
  '',
  '::: tabs #Datos',
  '',
  '@tab Datos de Entrada',
  '',
  'No aplica.',
  '',
  '@tab Datos de Salida',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :--------- | :---------',
  'sdtProductos | [sBTProducto](#sbtproducto) | Listado de productos.',
  '',
  '@tab Errores',
  '',
  'No aplica.',
  ':::',
  '',
  '::: details Ejemplo de Invocación',
  '::: code-tabs #Formato',
  '',
  '@tab XML',
  '```xml',
  '<soapenv:Envelope>',
  '   <soapenv:Body>',
  '      <bts:Test.Metodo>',
  '         <bts:Btinreq>',
  '            <bts:Canal>BTDIGITAL</bts:Canal>',
  '         </bts:Btinreq>',
  '      </bts:Test.Metodo>',
  '   </soapenv:Body>',
  '</soapenv:Envelope>',
  '```',
  '',
  '@tab JSON',
  '```json',
  '{',
  '  "Btinreq": { "Canal": "BTDIGITAL" }',
  '}',
  '```',
  ':::',
  '',
  '::: details Ejemplo de Respuesta',
  '::: code-tabs #Formato',
  '',
  '@tab XML',
  '```xml',
  '<SOAP-ENV:Envelope>',
  '   <SOAP-ENV:Body>',
  '      <Test.MetodoResponse>',
  '         <Btinreq>',
  '            <Canal>BTDIGITAL</Canal>',
  '         </Btinreq>',
  '         <sdtProductos>',
  '            <sBTProducto>',
  '               <productoUId>12</productoUId>',
  '               <nombre>Producto A</nombre>',
  '            </sBTProducto>',
  '            <sBTProducto>',
  '               <productoUId>13</productoUId>',
  '               <nombre>Producto B</nombre>',
  '            </sBTProducto>',
  '            <sBTProducto>',
  '               <productoUId>14</productoUId>',
  '               <nombre>Producto C</nombre>',
  '            </sBTProducto>',
  '         </sdtProductos>',
  '         <Erroresnegocio></Erroresnegocio>',
  '         <Btoutreq>',
  '            <Estado>OK</Estado>',
  '         </Btoutreq>',
  '      </Test.MetodoResponse>',
  '   </SOAP-ENV:Body>',
  '</SOAP-ENV:Envelope>',
  '```',
  '',
  '@tab JSON',
  '```json',
  '{',
  '  "Btinreq": { "Canal": "BTDIGITAL" },',
  '  "sdtProductos": {',
  '    "sBTProducto": [',
  '      { "productoUId": "12", "nombre": "Producto A" },',
  '      { "productoUId": "13", "nombre": "Producto B" },',
  '      { "productoUId": "14", "nombre": "Producto C" }',
  '    ]',
  '  },',
  '  "Erroresnegocio": {},',
  '  "Btoutreq": { "Estado": "OK" }',
  '}',
  '```',
  ':::',
  '',
  '## **Tipos de Dato Estructurado**',
  '',
  '::: details sBTProducto',
  '',
  '### sBTProducto',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTProducto son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :--------- | :---------',
  'nombre | String | Nombre.',
  'otrosConceptos | String | Otros conceptos.',
  'productoUId | Long | Identificador.',
  ':::',
  ''
].join('\n');

test('validarArchivo detecta el campo SDT ausente en el ejemplo (array de items, ninguno lo tiene)', () => {
  const filePath = tmpFile('array-sdt-sin-campo.md', MD_ARRAY_SDT_SIN_CAMPO);
  const { problemas } = validarArchivo(filePath);
  assert.ok(problemas.some(p => p.includes('SDT "sBTProducto.otrosConceptos" documentado pero ausente en el ejemplo JSON')));
  assert.ok(problemas.some(p => p.includes('SDT "sBTProducto.otrosConceptos" documentado pero ausente en el ejemplo XML')));
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo agrega el campo faltante a TODOS los items del array en el JSON, no solo al primero', () => {
  const filePath = tmpFile('array-sdt-fix.md', MD_ARRAY_SDT_SIN_CAMPO);
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const res = parsearJsonEjemplo(contenido, 'Respuesta').data;
  const items = res.sdtProductos.sBTProducto;
  assert.equal(items.length, 3);
  for (const item of items) {
    assert.equal(item.otrosConceptos, '', `falta otrosConceptos en el item ${JSON.stringify(item)}`);
  }

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo agrega el campo faltante dentro de CADA <sBTProducto> del XML, no como hermano fuera de la lista', () => {
  const filePath = tmpFile('array-sdt-fix-xml.md', MD_ARRAY_SDT_SIN_CAMPO);
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const xmlResp = parsearXmlEjemplo(contenido, 'Respuesta');
  const bloques = [...xmlResp.matchAll(/<sBTProducto>([\s\S]*?)<\/sBTProducto>/g)];
  assert.equal(bloques.length, 3);
  for (const b of bloques) {
    assert.match(b[1], /<otrosConceptos><\/otrosConceptos>/, `falta <otrosConceptos> dentro de <sBTProducto>: ${b[1]}`);
  }
  // No debe quedar un <otrosConceptos> suelto como hermano de la lista, fuera de cualquier <sBTProducto>
  const fueraDeItems = xmlResp.replace(/<sBTProducto>[\s\S]*?<\/sBTProducto>/g, '');
  assert.doesNotMatch(fueraDeItems, /<otrosConceptos>/);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('validarArchivo ya no queda "sin problemas" tras corregir — no reporta más el campo SDT como ausente', () => {
  const filePath = tmpFile('array-sdt-post-fix.md', MD_ARRAY_SDT_SIN_CAMPO);
  fixarArchivo(filePath);
  const { problemas } = validarArchivo(filePath);
  assert.ok(!problemas.some(p => p.includes('sBTProducto.otrosConceptos')), `no debería quedar el campo como ausente: ${JSON.stringify(problemas)}`);
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('validarArchivo detecta cuando el campo SDT está en ALGUNOS items del array pero no en todos (antes era invisible)', () => {
  // Simula el estado que producía el bug: solo el primer item tiene el campo.
  const mdParcial = MD_ARRAY_SDT_SIN_CAMPO
    .replace('"productoUId": "12", "nombre": "Producto A" }', '"productoUId": "12", "nombre": "Producto A", "otrosConceptos": "REVISAR" }')
    .replace('<nombre>Producto A</nombre>\n            </sBTProducto>', '<nombre>Producto A</nombre>\n               <otrosConceptos>REVISAR</otrosConceptos>\n            </sBTProducto>');

  const filePath = tmpFile('array-sdt-parcial.md', mdParcial);
  const { problemas } = validarArchivo(filePath);
  assert.ok(
    problemas.some(p => p.includes('sBTProducto.otrosConceptos') && /2 de 3/.test(p)),
    `debería reportar que falta en 2 de 3 items: ${JSON.stringify(problemas)}`
  );
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── Campo SDT faltante que es en sí mismo OTRO SDT (colección anidada) ──
//
// Reproduce el caso real reportado en ObtenerProductos.md: el SDT sBTProducto
// documenta un campo "otrosConceptos" cuyo TIPO es otro SDT (sBTConcepto), no un
// tipo simple. Cuando ese campo falta en el ejemplo, insertar un valor vacío como
// string plano es incorrecto — hay que insertar un objeto/tag con los propios
// sub-campos de sBTConcepto (concepto, texto, valor), cada uno con su default vacío.

function mdConSdtAnidadoEnCampo(sdtProductoEsLista) {
  const jsonProducto = sdtProductoEsLista
    ? [
        '  "sdtProductos": {',
        '    "sBTProducto": [',
        '      { "productoUId": "12", "nombre": "Producto A" },',
        '      { "productoUId": "13", "nombre": "Producto B" }',
        '    ]',
        '  },'
      ].join('\n')
    : '  "producto": { "productoUId": "12", "nombre": "Producto A" },';

  const xmlProducto = sdtProductoEsLista
    ? [
        '         <sdtProductos>',
        '            <sBTProducto>',
        '               <productoUId>12</productoUId>',
        '               <nombre>Producto A</nombre>',
        '            </sBTProducto>',
        '            <sBTProducto>',
        '               <productoUId>13</productoUId>',
        '               <nombre>Producto B</nombre>',
        '            </sBTProducto>',
        '         </sdtProductos>'
      ].join('\n')
    : [
        '         <producto>',
        '            <productoUId>12</productoUId>',
        '            <nombre>Producto A</nombre>',
        '         </producto>'
      ].join('\n');

  const filaTabla = sdtProductoEsLista
    ? 'sdtProductos | [sBTProducto](#sbtproducto) | Listado de productos.'
    : 'producto | [sBTProducto](#sbtproducto) | Un producto.';

  return [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'No aplica.',
    '',
    '@tab Datos de Salida',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    filaTabla,
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope>',
    '   <soapenv:Body>',
    '      <bts:Test.Metodo>',
    '         <bts:Btinreq>',
    '            <bts:Canal>BTDIGITAL</bts:Canal>',
    '         </bts:Btinreq>',
    '      </bts:Test.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" }',
    '}',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    xmlProducto,
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    jsonProducto,
    '  "Erroresnegocio": {},',
    '  "Btoutreq": { "Estado": "OK" }',
    '}',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    '',
    '::: details sBTProducto',
    '',
    '### sBTProducto',
    '',
    '::: center',
    'Los campos del tipo de dato estructurado sBTProducto son los siguientes:',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'nombre | String | Nombre.',
    'otrosConceptos | [sBTConcepto](#sbtconcepto) | Datos de otros conceptos.',
    'productoUId | Long | Identificador.',
    ':::',
    '',
    '::: details sBTConcepto',
    '',
    '### sBTConcepto',
    '',
    '::: center',
    'Los campos del tipo de dato estructurado sBTConcepto son los siguientes:',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'concepto | String | Concepto.',
    'texto | String | Texto.',
    'valor | Double | Importe.',
    ':::',
    ''
  ].join('\n');
}

const MD_SDT_ANIDADO_SIN_CAMPO_SIMPLE = mdConSdtAnidadoEnCampo(false);
const MD_SDT_ANIDADO_SIN_CAMPO_LISTA = mdConSdtAnidadoEnCampo(true);

test('fixarArchivo agrega un campo SDT anidado (objeto único) como OBJETO con sus propios sub-campos, no como string plano', () => {
  const filePath = tmpFile('sdt-anidado-simple.md', MD_SDT_ANIDADO_SIN_CAMPO_SIMPLE);
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const res = parsearJsonEjemplo(contenido, 'Respuesta').data;
  const otrosConceptos = res.producto.otrosConceptos;
  assert.equal(typeof otrosConceptos, 'object', `otrosConceptos debería ser un objeto, no ${JSON.stringify(otrosConceptos)}`);
  assert.equal(otrosConceptos.concepto, '');
  assert.equal(otrosConceptos.texto, '');
  assert.equal(otrosConceptos.valor, 0);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo agrega el mismo campo SDT anidado dentro de <producto> en el XML, con sus propios sub-tags', () => {
  const filePath = tmpFile('sdt-anidado-simple-xml.md', MD_SDT_ANIDADO_SIN_CAMPO_SIMPLE);
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const xmlResp = parsearXmlEjemplo(contenido, 'Respuesta');
  const contenedor = xmlResp.match(/<otrosConceptos>([\s\S]*?)<\/otrosConceptos>/);
  assert.ok(contenedor, `debería existir <otrosConceptos> con contenido: ${xmlResp}`);
  assert.match(contenedor[1], /<concepto><\/concepto>/);
  assert.match(contenedor[1], /<texto><\/texto>/);
  assert.match(contenedor[1], /<valor>0<\/valor>/);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo agrega el campo SDT anidado como OBJETO en CADA item de una lista, no como string plano', () => {
  const filePath = tmpFile('sdt-anidado-lista.md', MD_SDT_ANIDADO_SIN_CAMPO_LISTA);
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const res = parsearJsonEjemplo(contenido, 'Respuesta').data;
  const items = res.sdtProductos.sBTProducto;
  assert.equal(items.length, 2);
  for (const item of items) {
    assert.equal(typeof item.otrosConceptos, 'object', `otrosConceptos debería ser objeto en ${JSON.stringify(item)}`);
    assert.equal(item.otrosConceptos.concepto, '');
    assert.equal(item.otrosConceptos.texto, '');
    assert.equal(item.otrosConceptos.valor, 0);
  }

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo agrega el campo SDT anidado dentro de CADA <sBTProducto> del XML, con sus propios sub-tags', () => {
  const filePath = tmpFile('sdt-anidado-lista-xml.md', MD_SDT_ANIDADO_SIN_CAMPO_LISTA);
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const xmlResp = parsearXmlEjemplo(contenido, 'Respuesta');
  const bloques = [...xmlResp.matchAll(/<sBTProducto>([\s\S]*?)<\/sBTProducto>/g)];
  assert.equal(bloques.length, 2);
  for (const b of bloques) {
    const contenedor = b[1].match(/<otrosConceptos>([\s\S]*?)<\/otrosConceptos>/);
    assert.ok(contenedor, `falta <otrosConceptos> en item: ${b[1]}`);
    assert.match(contenedor[1], /<concepto><\/concepto>/);
    assert.match(contenedor[1], /<texto><\/texto>/);
    assert.match(contenedor[1], /<valor>0<\/valor>/);
  }

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo no cuelga cuando un SDT anidado se referencia a sí mismo (auto-referencia)', () => {
  const mdAutorreferencia = MD_SDT_ANIDADO_SIN_CAMPO_SIMPLE.replace(
    '::: details sBTConcepto\n\n### sBTConcepto\n\n::: center\nLos campos del tipo de dato estructurado sBTConcepto son los siguientes:\n\nNombre | Tipo | Comentarios\n:--------- | :--------- | :---------\nconcepto | String | Concepto.\ntexto | String | Texto.\nvalor | Double | Importe.\n:::',
    '::: details sBTConcepto\n\n### sBTConcepto\n\n::: center\nLos campos del tipo de dato estructurado sBTConcepto son los siguientes:\n\nNombre | Tipo | Comentarios\n:--------- | :--------- | :---------\nconcepto | String | Concepto.\nhijo | [sBTConcepto](#sbtconcepto) | Referencia a sí mismo.\n:::'
  );
  const filePath = tmpFile('sdt-autorreferencia.md', mdAutorreferencia);

  assert.doesNotThrow(() => fixarArchivo(filePath));

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── Lista vacía en el ejemplo: no hay item al cual agregarle el campo ──
//
// Reproduce el caso real reportado en ObtenerPlazo.md: sdtListaValores documenta
// un SDT lista (sBTValor, campo único "valor") pero el ejemplo trae la lista
// vacía — JSON: { "sBTValor": [] }, XML: <sdtListaValores></sdtListaValores>.
// itemsDeContenedorJson devuelve [] para una lista vacía, así que el loop de
// inserción de campos no tiene ningún item sobre el cual escribir — el campo
// "ausente" nunca se corrige sin importar cuántas veces se corra --fix. El fix
// sintetiza un item vacío {} en la lista antes de normalizar, para que el
// campo documentado tenga dónde insertarse.

const MD_LISTA_VACIA = [
  '---',
  'title: Test',
  '---',
  '',
  '::: tabs #Datos',
  '',
  '@tab Datos de Entrada',
  '',
  'No aplica.',
  '',
  '@tab Datos de Salida',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :--------- | :---------',
  'sdtListaValores | [sBTValor](#sbtvalor) | Listado de valores posibles.',
  '',
  '@tab Errores',
  '',
  'No aplica.',
  ':::',
  '',
  '::: details Ejemplo de Invocación',
  '::: code-tabs #Formato',
  '',
  '@tab XML',
  '```xml',
  '<soapenv:Envelope>',
  '   <soapenv:Body>',
  '      <bts:Test.Metodo>',
  '         <bts:Btinreq>',
  '            <bts:Canal>BTDIGITAL</bts:Canal>',
  '         </bts:Btinreq>',
  '      </bts:Test.Metodo>',
  '   </soapenv:Body>',
  '</soapenv:Envelope>',
  '```',
  '',
  '@tab JSON',
  '```json',
  '{',
  '  "Btinreq": { "Canal": "BTDIGITAL" }',
  '}',
  '```',
  ':::',
  '',
  '::: details Ejemplo de Respuesta',
  '::: code-tabs #Formato',
  '',
  '@tab XML',
  '```xml',
  '<SOAP-ENV:Envelope>',
  '   <SOAP-ENV:Body>',
  '      <Test.MetodoResponse>',
  '         <Btinreq>',
  '            <Canal>BTDIGITAL</Canal>',
  '         </Btinreq>',
  '         <sdtListaValores></sdtListaValores>',
  '         <Erroresnegocio></Erroresnegocio>',
  '         <Btoutreq>',
  '            <Estado>OK</Estado>',
  '         </Btoutreq>',
  '      </Test.MetodoResponse>',
  '   </SOAP-ENV:Body>',
  '</SOAP-ENV:Envelope>',
  '```',
  '',
  '@tab JSON',
  '```json',
  '{',
  '  "Btinreq": { "Canal": "BTDIGITAL" },',
  '  "sdtListaValores": { "sBTValor": [] },',
  '  "Erroresnegocio": {},',
  '  "Btoutreq": { "Estado": "OK" }',
  '}',
  '```',
  ':::',
  '',
  '## **Tipos de Dato Estructurado**',
  '',
  '::: details sBTValor',
  '',
  '### sBTValor',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTValor son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :--------- | :---------',
  'valor | Long | Valor de plazo de cuotas.',
  ':::',
  ''
].join('\n');

test('fixarArchivo sintetiza un item cuando la lista del ejemplo JSON está vacía, en vez de no hacer nada', () => {
  const filePath = tmpFile('lista-vacia.md', MD_LISTA_VACIA);
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const jsonResp = parsearJsonEjemplo(contenido, 'Respuesta').data;
  const items = jsonResp.sdtListaValores.sBTValor;
  assert.equal(items.length, 1, `debería sintetizar exactamente 1 item, no ${items.length}`);
  assert.equal(items[0].valor, 0);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo también completa el XML (contenedor vacío) usando el valor ya sintetizado en el JSON', () => {
  const filePath = tmpFile('lista-vacia-xml.md', MD_LISTA_VACIA);
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const xmlResp = parsearXmlEjemplo(contenido, 'Respuesta');
  assert.match(xmlResp, /<sdtListaValores>\s*<valor>0<\/valor>\s*<\/sdtListaValores>/, `debería insertar <valor> dentro del contenedor: ${xmlResp}`);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('validarArchivo ya no reporta "sBTValor.valor ausente" tras --fix sobre una lista originalmente vacía', () => {
  const filePath = tmpFile('lista-vacia-post-fix.md', MD_LISTA_VACIA);
  fixarArchivo(filePath);
  const { problemas } = validarArchivo(filePath);
  assert.deepEqual(problemas, [], `no debería quedar ningún problema: ${JSON.stringify(problemas)}`);
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo sobre una lista vacía es idempotente — correr --fix dos veces no agrega un segundo item', () => {
  const filePath = tmpFile('lista-vacia-idempotente.md', MD_LISTA_VACIA);
  fixarArchivo(filePath);
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');
  const jsonResp = parsearJsonEjemplo(contenido, 'Respuesta').data;
  assert.equal(jsonResp.sdtListaValores.sBTValor.length, 1, 'no debería acumular items en corridas repetidas');
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── El ejemplo usa el nombre del TIPO SDT en vez del nombre del parámetro ──
//
// Reproduce el caso real reportado en ObtenerHobby.md: "sdtHobby" está
// documentado como parámetro (tipo [sBTHobby]), pero el ejemplo de respuesta
// tiene la clave/tag "sBTHobby" directamente en la raíz — el nombre del TIPO
// reemplazando por completo al nombre del parámetro. Antes, el fixer detectaba
// esto pero solo corregía los campos internos bajo el nombre equivocado, sin
// renombrar — el error "aparece como sBTHobby" quedaba para siempre. El fix
// renombra la clave/tag preservando los valores reales.
//
// También cubre la variante real encontrada en V2R2/V2R3: el ejemplo usa
// "SdtsBTHobby" (prefijo "Sdt" pegado al nombre del tipo) en vez de "sBTHobby"
// a secas. La primera versión de este fix no reconocía esa variante y
// terminaba insertando una clave nueva con valores por defecto en vez de
// renombrar/fusionar la real — dejando los datos reales huérfanos bajo la
// clave vieja. esNombreAltSdt cubre ambas formas.

function mdConNombreDeTipoEnVezDeParametro(claveEnEjemplo) {
  return [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'No aplica.',
    '',
    '@tab Datos de Salida',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'sdtHobby | [sBTHobby](#sbthobby) | Datos del hobby.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope>',
    '   <soapenv:Body>',
    '      <bts:Test.Metodo>',
    '         <bts:Btinreq>',
    '            <bts:Canal>BTDIGITAL</bts:Canal>',
    '         </bts:Btinreq>',
    '      </bts:Test.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" }',
    '}',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    `         <${claveEnEjemplo}>`,
    '            <codigo>24</codigo>',
    '            <descripcion>Football</descripcion>',
    `         </${claveEnEjemplo}>`,
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    `  "${claveEnEjemplo}": { "codigo": 24, "descripcion": "Football" },`,
    '  "Erroresnegocio": {},',
    '  "Btoutreq": { "Estado": "OK" }',
    '}',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    '',
    '::: details sBTHobby',
    '',
    '### sBTHobby',
    '',
    '::: center',
    'Los campos del tipo de dato estructurado sBTHobby son los siguientes:',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'codigo | Long | Código del hobby.',
    'descripcion | String | Descripción del hobby.',
    ':::',
    ''
  ].join('\n');
}

for (const claveEnEjemplo of ['sBTHobby', 'SdtsBTHobby']) {
  test(`fixarArchivo renombra "${claveEnEjemplo}" a "sdtHobby" en JSON preservando los valores reales`, () => {
    const filePath = tmpFile(`tipo-en-vez-de-param-json-${claveEnEjemplo}.md`, mdConNombreDeTipoEnVezDeParametro(claveEnEjemplo));
    fixarArchivo(filePath);
    const contenido = fs.readFileSync(filePath, 'utf8');

    const jsonResp = parsearJsonEjemplo(contenido, 'Respuesta').data;
    assert.ok(!(claveEnEjemplo in jsonResp), `no debería quedar la clave vieja "${claveEnEjemplo}": ${JSON.stringify(jsonResp)}`);
    assert.ok('sdtHobby' in jsonResp, `debería existir "sdtHobby": ${JSON.stringify(jsonResp)}`);
    assert.equal(jsonResp.sdtHobby.codigo, 24, 'no debería perder el valor real al renombrar');
    assert.equal(jsonResp.sdtHobby.descripcion, 'Football', 'no debería perder el valor real al renombrar');

    fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
  });

  test(`fixarArchivo renombra <${claveEnEjemplo}> a <sdtHobby> en XML preservando los valores reales`, () => {
    const filePath = tmpFile(`tipo-en-vez-de-param-xml-${claveEnEjemplo}.md`, mdConNombreDeTipoEnVezDeParametro(claveEnEjemplo));
    fixarArchivo(filePath);
    const contenido = fs.readFileSync(filePath, 'utf8');

    const xmlResp = parsearXmlEjemplo(contenido, 'Respuesta');
    assert.doesNotMatch(xmlResp, new RegExp(`<${claveEnEjemplo}>`, 'i'), `no debería quedar el tag viejo: ${xmlResp}`);
    assert.match(xmlResp, /<sdtHobby>\s*<codigo>24<\/codigo>\s*<descripcion>Football<\/descripcion>\s*<\/sdtHobby>/, `debería renombrar preservando los valores: ${xmlResp}`);

    fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
  });

  test(`validarArchivo queda sin problemas tras --fix cuando el ejemplo usaba "${claveEnEjemplo}"`, () => {
    const filePath = tmpFile(`tipo-en-vez-de-param-validar-${claveEnEjemplo}.md`, mdConNombreDeTipoEnVezDeParametro(claveEnEjemplo));
    fixarArchivo(filePath);
    const { problemas } = validarArchivo(filePath);
    assert.deepEqual(problemas, [], `no debería quedar ningún problema: ${JSON.stringify(problemas)}`);
    fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
  });

  test(`fixarArchivo es idempotente sobre "${claveEnEjemplo}" — correr --fix dos veces no crea una clave/tag duplicado`, () => {
    const filePath = tmpFile(`tipo-en-vez-de-param-idempotente-${claveEnEjemplo}.md`, mdConNombreDeTipoEnVezDeParametro(claveEnEjemplo));
    fixarArchivo(filePath);
    const primeraPasada = fs.readFileSync(filePath, 'utf8');
    fixarArchivo(filePath);
    const segundaPasada = fs.readFileSync(filePath, 'utf8');
    assert.equal(segundaPasada, primeraPasada, 'una segunda corrida de --fix no debería cambiar nada más');
    fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
  });
}

// ── Tercera variante de nombre "adivinado": "sdt" + tipo sin el prefijo "sBT" ──
//
// Reproduce el caso real en SimularAmortizableSinCliente.md: el parámetro
// documentado es "sdtSimulacion" (tipo [sBTSimulacionPrestamo]), pero el
// ejemplo usa la key "sdtSimulacionPrestamo" — ni el nombre del tipo a secas
// ("sBTSimulacionPrestamo") ni "Sdt"+tipo ("SdtsBTSimulacionPrestamo"), sino
// "sdt" + el tipo con el prefijo "sBT" pelado. Antes de que esNombreAltSdt
// reconociera esta variante, el fixer no la vinculaba con el parámetro real —
// insertaba una copia nueva de "sdtSimulacion" con valores por defecto,
// dejando los datos reales huérfanos bajo "sdtSimulacionPrestamo" (el mismo
// bug de duplicación ya visto con "SdtsBTHobby", pero con otra forma del nombre).

function mdConTipoSinPrefijoComoParametro() {
  return [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'No aplica.',
    '',
    '@tab Datos de Salida',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'sdtSimulacion | [sBTSimulacionPrestamo](#sbtsimulacionprestamo) | Datos del préstamo simulado.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope>',
    '   <soapenv:Body>',
    '      <bts:Test.Metodo>',
    '         <bts:Btinreq>',
    '            <bts:Canal>BTDIGITAL</bts:Canal>',
    '         </bts:Btinreq>',
    '      </bts:Test.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" }',
    '}',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <sdtSimulacion>',
    '            <capital>1000</capital>',
    '         </sdtSimulacion>',
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    '  "sdtSimulacionPrestamo": { "capital": 1000 },',
    '  "Erroresnegocio": {},',
    '  "Btoutreq": { "Estado": "OK" }',
    '}',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    '',
    '::: details sBTSimulacionPrestamo',
    '',
    '### sBTSimulacionPrestamo',
    '',
    '::: center',
    'Los campos del tipo de dato estructurado sBTSimulacionPrestamo son los siguientes:',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'capital | Long | Capital.',
    ':::',
    ''
  ].join('\n');
}

test('fixarArchivo renombra "sdtSimulacionPrestamo" (= "sdt" + tipo sin el prefijo sBT) a "sdtSimulacion" en JSON, preservando los valores reales', () => {
  const filePath = tmpFile('tipo-sin-prefijo-json.md', mdConTipoSinPrefijoComoParametro());
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const jsonResp = parsearJsonEjemplo(contenido, 'Respuesta').data;
  assert.ok(!('sdtSimulacionPrestamo' in jsonResp), `no debería quedar la clave vieja: ${JSON.stringify(jsonResp)}`);
  assert.ok(!('sdtSimulacion' in jsonResp) || jsonResp.sdtSimulacion.capital === 1000, `no debería crear un duplicado con valores por defecto en vez de renombrar: ${JSON.stringify(jsonResp)}`);
  assert.equal(jsonResp.sdtSimulacion.capital, 1000, 'no debería perder el valor real al renombrar');

  const despues = validarArchivo(filePath).problemas;
  assert.deepEqual(despues, [], `no debería quedar ningún problema: ${JSON.stringify(despues)}`);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo NO renombra cuando el tag del tipo SDT aparece más de una vez (patrón lista válido, no un objeto único mal etiquetado)', () => {
  const md = [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'No aplica.',
    '',
    '@tab Datos de Salida',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'sdtHobbies | [sBTHobby](#sbthobby) | Listado de hobbies.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope>',
    '   <soapenv:Body>',
    '      <bts:Test.Metodo>',
    '         <bts:Btinreq>',
    '            <bts:Canal>BTDIGITAL</bts:Canal>',
    '         </bts:Btinreq>',
    '      </bts:Test.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" }',
    '}',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <sBTHobby>',
    '            <codigo>24</codigo>',
    '            <descripcion>Football</descripcion>',
    '         </sBTHobby>',
    '         <sBTHobby>',
    '            <codigo>31</codigo>',
    '            <descripcion>Tenis</descripcion>',
    '         </sBTHobby>',
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    '  "Erroresnegocio": {},',
    '  "Btoutreq": { "Estado": "OK" }',
    '}',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    '',
    '::: details sBTHobby',
    '',
    '### sBTHobby',
    '',
    '::: center',
    'Los campos del tipo de dato estructurado sBTHobby son los siguientes:',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'codigo | Long | Código del hobby.',
    'descripcion | String | Descripción del hobby.',
    ':::',
    ''
  ].join('\n');

  const filePath = tmpFile('tipo-repetido-no-renombrar.md', md);
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const xmlResp = parsearXmlEjemplo(contenido, 'Respuesta');
  const ocurrencias = (xmlResp.match(/<sBTHobby>/g) || []).length;
  assert.equal(ocurrencias, 2, `no debería tocar el patrón lista de 2 items: ${xmlResp}`);
  assert.doesNotMatch(xmlResp, /<sdtHobbies>/i, `no debería inventar un wrapper <sdtHobbies>: ${xmlResp}`);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── Reparación de errores de sintaxis JSON en los ejemplos ──
//
// Reproduce el caso real reportado en V3R1/Préstamos: varios métodos tienen el
// ejemplo de respuesta con errores de sintaxis puntuales (coma faltante entre
// propiedades, llave de cierre faltante al final del ejemplo, o un valor
// faltante antes de una coma como "Erroresnegocio":,). Antes, JSON.parse fallaba
// y TODO el pipeline de fixarJsonSeccion se abortaba de entrada (json=null) — el
// error quedaba "documentado pero ausente" para siempre, sin importar cuántas
// veces se corriera --fix, porque nunca había un objeto sobre el cual operar.

function mdConJsonRoto(jsonRespuestaRoto) {
  return [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'No aplica.',
    '',
    '@tab Datos de Salida',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'estado | String | Estado.',
    'monto | Double | Monto.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope>',
    '   <soapenv:Body>',
    '      <bts:Test.Metodo>',
    '         <bts:Btinreq>',
    '            <bts:Canal>BTDIGITAL</bts:Canal>',
    '         </bts:Btinreq>',
    '      </bts:Test.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" }',
    '}',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <estado>OK</estado>',
    '         <monto>100</monto>',
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    jsonRespuestaRoto,
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    ''
  ].join('\n');
}

test('fixarArchivo repara una coma faltante entre dos propiedades hermanas en el JSON', () => {
  const jsonRoto = [
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    '  "estado": "OK"',
    '  "monto": 100,',
    '  "Erroresnegocio": {},',
    '  "Btoutreq": { "Estado": "OK" }',
    '}'
  ].join('\n');
  const filePath = tmpFile('json-roto-coma.md', mdConJsonRoto(jsonRoto));

  const antes = validarArchivo(filePath).problemas;
  assert.ok(antes.some(p => p.includes('JSON inválido')), `debería detectar el JSON roto antes de fixar: ${JSON.stringify(antes)}`);

  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');
  const jsonResp = parsearJsonEjemplo(contenido, 'Respuesta').data;
  assert.equal(jsonResp.estado, 'OK');
  assert.equal(jsonResp.monto, 100);

  const despues = validarArchivo(filePath).problemas;
  assert.ok(!despues.some(p => p.includes('JSON inválido')), `no debería seguir reportando JSON inválido: ${JSON.stringify(despues)}`);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo repara una llave de cierre faltante al final de un JSON truncado', () => {
  const jsonRoto = [
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    '  "estado": "OK",',
    '  "monto": 100,',
    '  "Erroresnegocio": {},',
    '  "Btoutreq": { "Estado": "OK" }',
    // falta la llave de cierre del objeto raíz
  ].join('\n');
  const filePath = tmpFile('json-roto-llave.md', mdConJsonRoto(jsonRoto));

  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');
  const jsonResp = parsearJsonEjemplo(contenido, 'Respuesta').data;
  assert.equal(jsonResp.estado, 'OK');
  assert.equal(jsonResp.monto, 100);

  const despues = validarArchivo(filePath).problemas;
  assert.ok(!despues.some(p => p.includes('JSON inválido')), `no debería seguir reportando JSON inválido: ${JSON.stringify(despues)}`);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo repara un valor faltante antes de una coma (ej: "Erroresnegocio":,)', () => {
  const jsonRoto = [
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    '  "estado": "OK",',
    '  "monto": 100,',
    '  "Erroresnegocio":,',
    '  "Btoutreq": { "Estado": "OK" }',
    '}'
  ].join('\n');
  const filePath = tmpFile('json-roto-sinvalor.md', mdConJsonRoto(jsonRoto));

  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');
  const jsonResp = parsearJsonEjemplo(contenido, 'Respuesta').data;
  assert.deepEqual(jsonResp.Erroresnegocio, {});

  const despues = validarArchivo(filePath).problemas;
  assert.ok(!despues.some(p => p.includes('JSON inválido')), `no debería seguir reportando JSON inválido: ${JSON.stringify(despues)}`);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo reparando el JSON es idempotente — correr --fix dos veces converge (0 cambios en la 2da)', () => {
  const jsonRoto = [
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    '  "estado": "OK"',
    '  "monto": 100,',
    '  "Erroresnegocio":,',
    '  "Btoutreq": { "Estado": "OK" }',
    '}'
  ].join('\n');
  const filePath = tmpFile('json-roto-idempotente.md', mdConJsonRoto(jsonRoto));

  fixarArchivo(filePath);
  const primeraPasada = fs.readFileSync(filePath, 'utf8');
  const cambios2 = fixarArchivo(filePath);
  const segundaPasada = fs.readFileSync(filePath, 'utf8');

  assert.equal(cambios2, 0, 'la segunda corrida no debería reportar cambios');
  assert.equal(segundaPasada, primeraPasada, 'una segunda corrida de --fix no debería cambiar nada más');

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── Guard: no corromper un archivo cuyos bloques SDT ya están rotos de origen ──
//
// Reproduce el caso real en Simular/Resimular*.md: un bloque "::: details
// sBTConcepto" que en realidad documenta OTRO SDT (el título no coincide con
// ninguna declaración "Los campos..." dentro del bloque), con dos declaraciones
// sin heading propio que colapsan al mismo punto de corte. fixarSdtsAnidados no
// logra separar esto limpiamente — detectarSdtsAnidados lo sigue reportando
// después del "fix" — y aplicar el resultado igual duplicaba contenido en cada
// corrida de --fix sin converger nunca. fixarArchivo ahora descarta el cambio
// cuando el split no resuelve el anidamiento, en vez de aplicar un resultado a
// medio convertir.

test('fixarArchivo no corrompe (ni crece sin parar) un bloque SDT mal titulado de origen que fixarSdtsAnidados no puede separar limpiamente', () => {
  const md = [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'No aplica.',
    '',
    '@tab Datos de Salida',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'estado | String | Estado.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope>',
    '   <soapenv:Body>',
    '      <bts:Test.Metodo>',
    '         <bts:Btinreq>',
    '            <bts:Canal>BTDIGITAL</bts:Canal>',
    '         </bts:Btinreq>',
    '      </bts:Test.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" }',
    '}',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <estado>OK</estado>',
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    '  "estado": "OK",',
    '  "Erroresnegocio": {},',
    '  "Btoutreq": { "Estado": "OK" }',
    '}',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    '',
    '::: details sBTConcepto',
    '',
    '### sBTConcepto',
    '',
    '::: center',
    'Los campos del tipo de dato estructurado sBTOuter son los siguientes:',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'campo1 | String | Campo 1.',
    'otrosConceptos | [sBTConcepto](#sbtconcepto1) | Otros.',
    '',
    '### sBTConcepto1',
    '',
    'Los campos del tipo de dato estructurado sBTConcepto son los siguientes:',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'concepto | String | Concepto.',
    ':::',
    ''
  ].join('\n');

  const filePath = tmpFile('sdt-mal-titulado.md', md);

  // Confirma que el caso reproduce el patrón real: detectarSdtsAnidados lo marca de entrada.
  const problemasAntes = validarArchivo(filePath).problemas;
  assert.ok(problemasAntes.some(p => p.includes('contiene SDT(s) anidado(s)')), `debería reproducir el bloque mal titulado: ${JSON.stringify(problemasAntes)}`);

  const c1 = fixarArchivo(filePath);
  const despues1 = fs.readFileSync(filePath, 'utf8');
  const c2 = fixarArchivo(filePath);
  const despues2 = fs.readFileSync(filePath, 'utf8');

  // No debe crecer sin límite entre corridas: el contenido debe estabilizarse.
  assert.equal(despues2, despues1, `una segunda corrida de --fix no debería seguir cambiando el archivo (no convergía antes de este fix): ${despues1.length} vs ${despues2.length} bytes`);
  assert.equal(c2, 0, 'la segunda corrida no debería reportar más cambios');

  // El problema estructural sigue ahí — correctamente, no se "resuelve" a medias.
  const problemasDespues = validarArchivo(filePath).problemas;
  assert.ok(problemasDespues.some(p => p.includes('contiene SDT(s) anidado(s)')), 'el problema estructural real debe seguir reportado para corrección manual, no ocultarse');

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── Prefijo de namespace XML ("bts:") copiado sin limpiar a las keys JSON ──
//
// Reproduce el caso real en ObtenerCronogramaOriginal.md (y 10 archivos más en
// el repo): el ejemplo JSON de "Datos de Entrada" copió las keys directo del
// tab XML, prefijo de namespace incluido — "bts:Btinreq", "bts:Canal", etc. —
// en vez de "Btinreq", "Canal". Como "Btinreq" está en camposIgnoradosEntrada,
// el resto del fixer nunca llega a mirar sus campos internos, así que esto
// nunca se corregía. limpiarPrefijoNamespaceJson corre ANTES de esa lista de
// ignorados, a cualquier profundidad, así que sí lo alcanza.

function mdConPrefijoNamespace() {
  return [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'operacionUId | Long | Identificador de operación.',
    '',
    '@tab Datos de Salida',
    '',
    'No aplica.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope xmlns:bts="http://uy.com.dlya.bantotal/BTSOA/">',
    '   <soapenv:Body>',
    '      <bts:Test.Metodo>',
    '         <bts:Btinreq>',
    '            <bts:Canal>BTDIGITAL</bts:Canal>',
    '         </bts:Btinreq>',
    '         <bts:operacionUId>10118</bts:operacionUId>',
    '      </bts:Test.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "bts:Btinreq": {',
    '    "bts:Canal": "BTDIGITAL",',
    '    "bts:Requerimiento": "1",',
    '    "bts:Usuario": "BANTOTAL",',
    '    "bts:Token": "480647346F955E77534D3E02",',
    '    "bts:Device": "AC"',
    '  },',
    '  "operacionUId": 10118',
    '}',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    '  "Erroresnegocio": {},',
    '  "Btoutreq": { "Estado": "OK" }',
    '}',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    ''
  ].join('\n');
}

test('validarArchivo detecta keys JSON con prefijo de namespace XML ("bts:") sin limpiar', () => {
  const filePath = tmpFile('namespace-bts.md', mdConPrefijoNamespace());
  const { problemas } = validarArchivo(filePath);
  assert.ok(problemas.some(p => p.includes('namespace XML') && p.includes('bts:Btinreq') && p.includes('bts:Canal')), `debería detectar el prefijo bts: en las keys: ${JSON.stringify(problemas)}`);
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo limpia el prefijo "bts:" de TODAS las keys JSON, incluso dentro de Btinreq (que el resto del fixer ignora)', () => {
  const filePath = tmpFile('namespace-bts-fix.md', mdConPrefijoNamespace());
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const jsonInv = parsearJsonEjemplo(contenido, 'Invocación').data;
  assert.ok(!('bts:Btinreq' in jsonInv), `no debería quedar "bts:Btinreq": ${JSON.stringify(jsonInv)}`);
  assert.ok('Btinreq' in jsonInv, `debería existir "Btinreq" limpio: ${JSON.stringify(jsonInv)}`);
  assert.equal(jsonInv.Btinreq.Canal, 'BTDIGITAL', 'no debería perder el valor real al limpiar el prefijo');
  assert.equal(jsonInv.Btinreq.Usuario, 'BANTOTAL');
  assert.equal(jsonInv.operacionUId, 10118);

  const despues = validarArchivo(filePath).problemas;
  assert.ok(!despues.some(p => p.includes('namespace XML')), `no debería seguir reportando el prefijo namespace: ${JSON.stringify(despues)}`);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo limpiando el prefijo "bts:" es idempotente', () => {
  const filePath = tmpFile('namespace-bts-idempotente.md', mdConPrefijoNamespace());
  fixarArchivo(filePath);
  const primeraPasada = fs.readFileSync(filePath, 'utf8');
  const cambios2 = fixarArchivo(filePath);
  const segundaPasada = fs.readFileSync(filePath, 'utf8');
  assert.equal(cambios2, 0, 'la segunda corrida no debería reportar cambios');
  assert.equal(segundaPasada, primeraPasada);
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo repara un placeholder "..." como último item de un array JSON (indica "hay más", no es JSON válido)', () => {
  const jsonRoto = [
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    '  "estado": "OK",',
    '  "monto": 100,',
    '  "cronograma": {',
    '    "sBTCuota": [',
    '      { "nroCuota": 1 },',
    '      ...',
    '    ]',
    '  },',
    '  "Erroresnegocio": {},',
    '  "Btoutreq": { "Estado": "OK" }',
    '}'
  ].join('\n');
  const filePath = tmpFile('json-roto-placeholder.md', mdConJsonRoto(jsonRoto));

  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');
  const jsonResp = parsearJsonEjemplo(contenido, 'Respuesta').data;
  assert.equal(jsonResp.cronograma.sBTCuota.length, 1, 'debería quitar el placeholder, no inventar un item');
  assert.equal(jsonResp.cronograma.sBTCuota[0].nroCuota, 1);

  const despues = validarArchivo(filePath).problemas;
  assert.ok(!despues.some(p => p.includes('JSON inválido')), `no debería seguir reportando JSON inválido: ${JSON.stringify(despues)}`);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── Documentos XML/SOAP-only (sin ningún @tab JSON) no son un error ──
//
// Reproduce el caso real de la línea de producto BPay: 49 de 50 métodos no
// documentan JSON en absoluto (ni en Invocación ni en Respuesta) — es la
// convención de ese producto (XML/SOAP-only), no un campo faltante. Antes,
// "No tiene sección @tab JSON" y "sin bloque de código json" se reportaban
// igual, generando ~139 falsos positivos en todo el repo. Ahora solo se
// reportan cuando el documento SÍ tiene @tab JSON en algún lado (asimetría
// real entre Invocación y Respuesta), no cuando está ausente en todo el doc.

function mdXmlOnly(conJsonEnInvocacion) {
  return [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'cuitIn | String | CUIT de entrada.',
    '',
    '@tab Datos de Salida',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'cuitOut | String | CUIT de salida.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope>',
    '   <soapenv:Body>',
    '      <bts:Test.Metodo>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <bts:cuitIn>27107718990</bts:cuitIn>',
    '      </bts:Test.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    ...(conJsonEnInvocacion ? [
      '',
      '@tab JSON',
      '```json',
      '{',
      '  "Btinreq": { "Canal": "BTDIGITAL" },',
      '  "cuitIn": "27107718990"',
      '}',
      '```'
    ] : []),
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <cuitOut>27106619870</cuitOut>',
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    ''
  ].join('\n');
}

test('validarArchivo NO reporta "sin JSON" cuando el documento entero es XML/SOAP-only (convención de producto, no un campo faltante)', () => {
  const filePath = tmpFile('xml-only.md', mdXmlOnly(false));
  const { problemas } = validarArchivo(filePath);
  assert.ok(!problemas.some(p => p.includes('No tiene sección @tab JSON')), `no debería reportar "no tiene @tab JSON" en un doc XML-only: ${JSON.stringify(problemas)}`);
  assert.ok(!problemas.some(p => p.includes('sin bloque de código')), `no debería reportar "sin bloque de código json" en un doc XML-only: ${JSON.stringify(problemas)}`);
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('validarArchivo SÍ reporta "sin JSON" cuando falta en Respuesta pero SÍ está en Invocación (asimetría real, no convención)', () => {
  const filePath = tmpFile('xml-json-asimetrico.md', mdXmlOnly(true));
  const { problemas } = validarArchivo(filePath);
  assert.ok(
    problemas.some(p => p.includes('No tiene sección @tab JSON') || p.includes('sin bloque de código')),
    `debería seguir reportando la asimetría real (JSON en Invocación pero no en Respuesta): ${JSON.stringify(problemas)}`
  );
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── Placeholder "..." en ejemplos: se quita la línea entera, no se deja en blanco ──
//
// A diferencia de un error de sintaxis JSON (donde SÍ hay que reparar con
// cuidado para no perder datos), un "..." en su propia línea dentro de un
// ejemplo XML o JSON es puro relleno — ni XML ni JSON necesitan esa línea
// para seguir siendo válidos. fixarArchivo ahora la elimina directamente
// (la línea completa, no solo el texto) en vez de dejar el problema
// reportado para siempre.

test('fixarArchivo quita una línea placeholder "..." en un ejemplo XML (sin dejar la línea en blanco)', () => {
  const md = [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'No aplica.',
    '',
    '@tab Datos de Salida',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'estado | String | Estado.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope>',
    '   <soapenv:Body>',
    '      <bts:Test.Metodo>',
    '         <bts:Btinreq>',
    '            <bts:Canal>BTDIGITAL</bts:Canal>',
    '         </bts:Btinreq>',
    '      </bts:Test.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" }',
    '}',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <cronograma>',
    '            <sBTCuota>',
    '               <nroCuota>1</nroCuota>',
    '            </sBTCuota>',
    '            ...',
    '         </cronograma>',
    '         <estado>OK</estado>',
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    '  "estado": "OK",',
    '  "Erroresnegocio": {},',
    '  "Btoutreq": { "Estado": "OK" }',
    '}',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    ''
  ].join('\n');

  const filePath = tmpFile('placeholder-xml.md', md);
  const antes = validarArchivo(filePath).problemas;
  assert.ok(antes.some(p => p.includes('Placeholder')), `debería detectar el placeholder antes de fixar: ${JSON.stringify(antes)}`);

  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');
  assert.doesNotMatch(contenido, /\.\.\./, `no debería quedar ningún "..." en el archivo: ${contenido}`);
  assert.doesNotMatch(contenido, /sBTCuota>\s*\n\s*\n\s*<\/cronograma>/, 'no debería dejar una línea en blanco donde estaba el placeholder');
  assert.match(contenido, /<nroCuota>1<\/nroCuota>/, 'no debería tocar los datos reales que sí estaban');

  const despues = validarArchivo(filePath).problemas;
  assert.ok(!despues.some(p => p.includes('Placeholder')), `no debería seguir reportando el placeholder: ${JSON.stringify(despues)}`);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo quita un placeholder "..." usado como elemento de array JSON entre comillas', () => {
  const { resultado, cambios } = require('./index.js').fixarPlaceholderPuntosSuspensivos([
    '{',
    '  "lista": [',
    '    { "a": 1 },',
    '    "..."',
    '  ]',
    '}'
  ].join('\n'));
  assert.equal(cambios, 1);
  assert.doesNotMatch(resultado, /\.\.\./, `no debería quedar el placeholder: ${resultado}`);
  assert.ok(JSON.parse(resultado.replace(/,(\s*[}\]])/g, '$1')), 'el resultado debería seguir siendo JSON válido');
});

test('fixarArchivo es idempotente al quitar placeholders "..." — correr --fix dos veces no cambia nada más', () => {
  const md = [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'No aplica.',
    '',
    '@tab Datos de Salida',
    '',
    'No aplica.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope>',
    '   <soapenv:Body>',
    '      <bts:Test.Metodo>',
    '         <bts:Btinreq>',
    '            <bts:Canal>BTDIGITAL</bts:Canal>',
    '         </bts:Btinreq>',
    '         ...',
    '      </bts:Test.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" }',
    '}',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    '',
    '@tab JSON',
    '```json',
    '{',
    '  "Btinreq": { "Canal": "BTDIGITAL" },',
    '  "Erroresnegocio": {},',
    '  "Btoutreq": { "Estado": "OK" }',
    '}',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    ''
  ].join('\n');

  const filePath = tmpFile('placeholder-idempotente.md', md);
  fixarArchivo(filePath);
  const primeraPasada = fs.readFileSync(filePath, 'utf8');
  const cambios2 = fixarArchivo(filePath);
  const segundaPasada = fs.readFileSync(filePath, 'utf8');
  assert.equal(cambios2, 0, 'la segunda corrida no debería reportar cambios');
  assert.equal(segundaPasada, primeraPasada);
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── <Envelope> nunca es un "parámetro no documentado", ni con XML mal formado ──
//
// Reproduce el caso real reportado: cuando el tag wrapper del método (ej:
// <bts:BTPayCaddy.CambioDePin>) está mal formado — abre dos veces y nunca
// cierra, o cierra dos veces y nunca abre, o el nombre de cierre no coincide
// con el de apertura — getDirectChildTagNames no logra detectar el wrapper y
// cae a usar el XML completo como raíz. Eso hacía que <Envelope> (el sobre
// SOAP en sí) apareciera como "hijo directo" y se reportara, sin sentido,
// como un parámetro no documentado. Ahora Envelope/Header/Body/Fault se
// excluyen siempre de esa detección, haya o no wrapper detectado.

test('validarArchivo NO reporta <Envelope> como parámetro no documentado cuando el tag wrapper del método está mal formado (abre 2 veces, nunca cierra)', () => {
  const md = [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'CarID | Long | Identificador de tarjeta.',
    '',
    '@tab Datos de Salida',
    '',
    'No aplica.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bts="http://uy.com.dlya.bantotal/BTSOA/">',
    '   <soapenv:Header/>',
    '   <soapenv:Body>',
    '      <bts:BTTest.Metodo>',
    '         <bts:Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </bts:Btinreq>',
    '         <bts:CarID>123</bts:CarID>',
    '      <bts:BTTest.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    ''
  ].join('\n');

  const filePath = tmpFile('envelope-malformado.md', md);
  const { problemas } = validarArchivo(filePath);
  assert.ok(
    !problemas.some(p => p.includes('<Envelope>') || p.includes('<Header>') || p.includes('<Body>')),
    `no debería reportar el envelope SOAP como parámetro no documentado: ${JSON.stringify(problemas)}`
  );
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── <SOAP-ENV:Envelope> (prefijo con guión) tampoco es un "parámetro no
// documentado" cuando el wrapper del método falla ──
//
// Reproduce el caso real reportado: en el XML de Respuesta el wrapper abre
// <BTClientes.ObtenerCuentasCorrientesResponse> y cierra
// </BTClientes.ObtenerCuentasCorrientesSDResponse> — un typo real en el doc
// (falta "SD" en la apertura). Como los nombres no coinciden, la regex del
// wrapper (backreference \1) no matchea y getDirectChildTagNames cae a usar
// el XML completo como raíz. Ahí aparece <SOAP-ENV:Envelope>, pero el regex
// que extrae el nombre de tag (antes `[\w:.]+`) no incluía el guión de
// "SOAP-ENV", así que truncaba el nombre en "SOAP" y el filtro defensivo de
// envelope/header/body/fault (que compara contra el nombre local ya
// separado del prefijo) nunca lo alcanzaba a filtrar. Se reportaba
// "<soap> está en el ejemplo pero no está documentado".

test('validarArchivo NO reporta <soap>/<Envelope> cuando el wrapper de Respuesta está mal formado Y el XML usa prefijo con guión (SOAP-ENV:)', () => {
  const md = [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'clienteUId | Long | Identificador único de cliente.',
    '',
    '@tab Datos de Salida',
    '',
    'No aplica.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bts="http://uy.com.dlya.bantotal/BTSOA/">',
    '   <soapenv:Body>',
    '      <bts:BTTest.Metodo>',
    '         <bts:Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </bts:Btinreq>',
    '         <bts:clienteUId>4</bts:clienteUId>',
    '      </bts:BTTest.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse xmlns="http://uy.com.dlya.bantotal/BTSOA/">',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoSDResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    ''
  ].join('\n');

  const filePath = tmpFile('envelope-guion-malformado.md', md);
  const { problemas } = validarArchivo(filePath);
  assert.ok(
    !problemas.some(p => /<soap[-:]?env>?/i.test(p) || p.includes('<Envelope>') || p.includes('<Header>') || p.includes('<Body>')),
    `no debería reportar el envelope SOAP con prefijo guionado como parámetro no documentado: ${JSON.stringify(problemas)}`
  );
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── "campo del SDT sin descripción": el regex debe anclar a inicio de línea ──
//
// Reproduce el caso real: un documento con una tabla de parámetros de 4
// columnas (Nombre | Tipo | Obligatorio | Comentarios, en vez de las 3
// columnas estándar) hace que el regex sin anclar matchee la COLA del propio
// encabezado ("Obligatorio | Comentarios |") como si fuera un campo real sin
// descripción. Mismo problema con filas de tabla de errores ("60001 |
// Descripción |", 2 columnas). Anclar a ^ elimina esos falsos positivos sin
// perder la detección real (un campo SDT genuino, en su propia línea, sin
// tercera columna).

test('validarArchivo NO reporta "campo sin descripción" por el encabezado de una tabla de 4 columnas (Nombre | Tipo | Obligatorio | Comentarios)', () => {
  const md = [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'Nombre            | Tipo   | Obligatorio | Comentarios |',
    ':--------- | :--------- | :--------- | :---------',
    'CarID      | Long   | S              | Identificador Tarjeta.',
    '',
    '@tab Datos de Salida',
    '',
    'No aplica.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope>',
    '   <soapenv:Body>',
    '      <bts:Test.Metodo>',
    '         <bts:Btinreq>',
    '            <bts:Canal>BTDIGITAL</bts:Canal>',
    '         </bts:Btinreq>',
    '         <bts:CarID>123</bts:CarID>',
    '      </bts:Test.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    ''
  ].join('\n');

  const filePath = tmpFile('tabla-4-columnas.md', md);
  const { problemas } = validarArchivo(filePath);
  assert.ok(
    !problemas.some(p => p.includes('sin descripción')),
    `el encabezado de 4 columnas no debería contar como campo sin descripción: ${JSON.stringify(problemas)}`
  );
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('validarArchivo SÍ reporta "campo sin descripción" cuando un campo real de un SDT está en su propia línea sin tercera columna', () => {
  const md = [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'No aplica.',
    '',
    '@tab Datos de Salida',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'sdtTest | [sBTTest](#sbttest) | Datos de prueba.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope>',
    '   <soapenv:Body>',
    '      <bts:Test.Metodo>',
    '         <bts:Btinreq>',
    '            <bts:Canal>BTDIGITAL</bts:Canal>',
    '         </bts:Btinreq>',
    '      </bts:Test.Metodo>',
    '   </soapenv:Body>',
    '</soapenv:Envelope>',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope>',
    '   <SOAP-ENV:Body>',
    '      <Test.MetodoResponse>',
    '         <Btinreq>',
    '            <Canal>BTDIGITAL</Canal>',
    '         </Btinreq>',
    '         <sdtTest>',
    '            <campo1>1</campo1>',
    '         </sdtTest>',
    '         <Erroresnegocio></Erroresnegocio>',
    '         <Btoutreq>',
    '            <Estado>OK</Estado>',
    '         </Btoutreq>',
    '      </Test.MetodoResponse>',
    '   </SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>',
    '```',
    ':::',
    '',
    '## **Tipos de Dato Estructurado**',
    '',
    '::: details sBTTest',
    '',
    '### sBTTest',
    '',
    '::: center',
    'Los campos del tipo de dato estructurado sBTTest son los siguientes:',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'campo1 | Long |',
    ':::',
    ''
  ].join('\n');

  const filePath = tmpFile('campo-real-sin-descripcion.md', md);
  const { problemas } = validarArchivo(filePath);
  assert.ok(
    problemas.some(p => p.includes('sin descripción')),
    `debería seguir detectando un campo SDT genuino sin descripción: ${JSON.stringify(problemas)}`
  );
  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── fixarSdtsAnidados: un SDT duplicado dentro del mismo bloque no debe
// "colgar" su contenido en la sección vecina ──
//
// Reproduce el caso real en ObtenerDetalledeOferta.md (V2R2/V2R3) y varios
// archivos de shared/Partners: un bloque "::: details Outer" documenta,
// además de sí mismo, tres sub-SDTs con "### Nombre" — pero el último repite
// el nombre de uno que ya apareció antes (mismo contenido, duplicado exacto).
// El splitter descartaba el duplicado ANTES de calcular su posición, así que
// su rango de texto quedaba sin dueño y terminaba absorbido dentro de la
// sección anterior — que entonces seguía "conteniendo" un SDT anidado y
// detectarSdtsAnidados lo seguía marcando para siempre (el guard de
// fixarArchivo correctamente descartaba ese split a medias, pero el problema
// nunca se resolvía). Ahora se calculan las posiciones de TODAS las
// definiciones (incluidos duplicados) antes de decidir cuáles emitir, así el
// duplicado se recorta limpio de su propio rango en vez de filtrarse afuera.

const MD_SDT_DUPLICADO = [
  '---',
  'title: Test',
  '---',
  '',
  '::: tabs #Datos',
  '',
  '@tab Datos de Entrada',
  '',
  'No aplica.',
  '',
  '@tab Datos de Salida',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :--------- | :---------',
  'sdtOuter | [sBTOuter](#sbtouter) | Datos de prueba.',
  '',
  '@tab Errores',
  '',
  'No aplica.',
  ':::',
  '',
  '::: details Ejemplo de Invocación',
  '::: code-tabs #Formato',
  '',
  '@tab XML',
  '```xml',
  '<soapenv:Envelope>',
  '   <soapenv:Body>',
  '      <bts:Test.Metodo>',
  '         <bts:Btinreq>',
  '            <bts:Canal>BTDIGITAL</bts:Canal>',
  '         </bts:Btinreq>',
  '      </bts:Test.Metodo>',
  '   </soapenv:Body>',
  '</soapenv:Envelope>',
  '```',
  ':::',
  '',
  '::: details Ejemplo de Respuesta',
  '::: code-tabs #Formato',
  '',
  '@tab XML',
  '```xml',
  '<SOAP-ENV:Envelope>',
  '   <SOAP-ENV:Body>',
  '      <Test.MetodoResponse>',
  '         <Btinreq>',
  '            <Canal>BTDIGITAL</Canal>',
  '         </Btinreq>',
  '         <sdtOuter>',
  '            <campoA>1</campoA>',
  '            <producto>',
  '               <productoUId>1</productoUId>',
  '            </producto>',
  '         </sdtOuter>',
  '         <Erroresnegocio></Erroresnegocio>',
  '         <Btoutreq>',
  '            <Estado>OK</Estado>',
  '         </Btoutreq>',
  '      </Test.MetodoResponse>',
  '   </SOAP-ENV:Body>',
  '</SOAP-ENV:Envelope>',
  '```',
  ':::',
  '',
  '## **Tipos de Dato Estructurado**',
  '',
  '<!-- ABRE SDT -->',
  '::: details sBTOuter',
  '',
  '### sBTOuter',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTOuter son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :--------- | :---------',
  'campoA | Long | Campo A.',
  'producto | [sBTProducto](#sbtproducto) | Producto.',
  ':::',
  '',
  '### sBTProducto',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTProducto son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :--------- | :---------',
  'productoUId | Long | Identificador único de producto.',
  ':::',
  '',
  '### sBTProducto',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTProducto son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :--------- | :---------',
  'productoUId | Long | Identificador único de producto.',
  ':::',
  '<!-- CIERRA SDT -->',
  ''
].join('\n');

test('fixarSdtsAnidados no deja el contenido de un SDT duplicado colgando en la sección vecina', () => {
  const filePath = tmpFile('sdt-duplicado.md', MD_SDT_DUPLICADO);

  const antes = detectarSdtsAnidados(fs.readFileSync(filePath, 'utf8'));
  assert.ok(antes.some(p => p.includes('contiene SDT(s) anidado(s)')), `debería reproducir el caso: ${JSON.stringify(antes)}`);

  const c1 = fixarArchivo(filePath);
  const despues1 = fs.readFileSync(filePath, 'utf8');
  const c2 = fixarArchivo(filePath);
  const despues2 = fs.readFileSync(filePath, 'utf8');

  assert.equal(despues2, despues1, 'una segunda corrida no debería seguir cambiando el archivo');
  assert.equal(c2, 0, 'la segunda corrida no debería reportar más cambios');

  // Solo debe quedar UN bloque "::: details sBTProducto", no dos.
  const ocurrenciasDetails = (despues1.match(/^::: details sBTProducto$/gim) || []).length;
  assert.equal(ocurrenciasDetails, 1, `debería quedar un único bloque sBTProducto, no duplicado: ${despues1}`);

  const problemasFinal = detectarSdtsAnidados(despues1);
  assert.deepEqual(problemasFinal, [], `no debería seguir habiendo SDT anidado tras el fix: ${JSON.stringify(problemasFinal)}`);

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

// ── SDTs duplicados en bloques ::: details HERMANOS (no anidados) ──
//
// Reproduce el caso real encontrado en V2r2 (ej: Depósitos-a-Plazo/Obtener/
// ObtenerInstruccionesHabilitados.md, Microfinanzas/Simular/SimularPrestamo*):
// desde que los SDTs anidados se separaron en bloques independientes, un tipo
// hoja referenciado desde MÁS DE UN SDT padre (ej. sBTDatoExtendido usado
// tanto por el SDT de "Datos de Salida" como por sBTCodigoInstrucciones) queda
// documentado en dos bloques "::: details sBTDatoExtendido" completos y
// separados en vez de uno solo — a diferencia del caso de arriba
// (MD_SDT_DUPLICADO), acá CADA bloque está bien formado (un solo SDT por
// bloque), así que detectarSdtsAnidados original no lo veía: no hay ningún
// "Los campos..." de más DENTRO de un mismo bloque, el duplicado está entre
// bloques hermanos.

const MD_SDT_HERMANOS_DUPLICADOS_IDENTICOS = [
  '## **Tipos de Dato Estructurado**',
  '',
  '<!-- ABRE SDT -->',
  '::: details sBTPadreUno',
  '',
  '### sBTPadreUno',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTPadreUno son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :----------- | :-----------',
  'hijo | [sBTHijoComun](#sbthijocomun) | Dato complementario.',
  ':::',
  '',
  '::: details sBTHijoComun',
  '',
  '### sBTHijoComun',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTHijoComun son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :----------- | :-----------',
  'clave | String | Clave del dato.',
  'valor | String | Valor del dato.',
  ':::',
  '',
  '::: details sBTPadreDos',
  '',
  '### sBTPadreDos',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTPadreDos son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :----------- | :-----------',
  'codigo | Short | Código.',
  'hijo | [sBTHijoComun](#sbthijocomun) | Dato complementario.',
  ':::',
  '',
  '::: details sBTHijoComun',
  '',
  '### sBTHijoComun',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTHijoComun son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :----------- | :-----------',
  'clave | String | Clave del dato.',
  'valor | String | Valor del dato.',
  ':::',
  '<!-- CIERRA SDT -->',
  ''
].join('\n');

// Misma forma, pero la segunda ocurrencia de sBTHijoComun documenta el tipo de
// "valor" con casing distinto ("string" en vez de "String") — reproduce el
// caso real de SimularPrestamoPlazoFijo.md, donde las dos copias de
// sBTConcepto no son un copy-paste exacto.
const MD_SDT_HERMANOS_DUPLICADOS_DIVERGENTES = MD_SDT_HERMANOS_DUPLICADOS_IDENTICOS.replace(
  'valor | String | Valor del dato.\n:::\n<!-- CIERRA SDT -->',
  'valor | string | Valor del dato.\n:::\n<!-- CIERRA SDT -->'
);

test('detectarSdtsAnidados detecta un SDT duplicado en bloques ::: details hermanos con contenido idéntico', () => {
  const problemas = detectarSdtsAnidados(MD_SDT_HERMANOS_DUPLICADOS_IDENTICOS);
  assert.ok(
    problemas.some(p => p.includes('SDT "sBTHijoComun" duplicado') && p.includes('idéntico')),
    `debería reportar el duplicado hermano idéntico: ${JSON.stringify(problemas)}`
  );
  // No debe confundirse con el chequeo de anidamiento-dentro-de-un-bloque: cada
  // bloque acá está bien formado, así que ese mensaje no debería aparecer.
  assert.ok(!problemas.some(p => p.includes('contiene SDT(s) anidado(s)')));
});

test('detectarSdtsAnidados detecta un SDT duplicado en bloques ::: details hermanos con contenido DIVERGENTE', () => {
  const problemas = detectarSdtsAnidados(MD_SDT_HERMANOS_DUPLICADOS_DIVERGENTES);
  assert.ok(
    problemas.some(p => p.includes('SDT "sBTHijoComun" duplicado') && p.includes('DIVERGENTE')),
    `debería reportar el duplicado hermano divergente: ${JSON.stringify(problemas)}`
  );
});

// Reproduce el caso real en Préstamos/Simular/SimularAmortizable.md y
// SimularRefinanciacion.md (V3R1): sBTComisionPrestamo, sBTSeguroPrestamo y
// sBTConcepto están duplicados en bloques hermanos con EXACTAMENTE los mismos
// campos, tipos y comentarios — pero la segunda copia quedó con las filas en
// otro orden (parece el orden previo a que se alfabetizara la tabla) y, en
// algunos casos, con la fila separadora de la tabla escrita sin ":" de
// alineación ("--- | --- | ---" en vez de ":--- | :--- | :---"). Ninguna de
// las dos diferencias cambia lo que el SDT documenta — deben seguir tratándose
// como duplicado idéntico y unificarse, no marcarse DIVERGENTE.
const MD_SDT_HERMANOS_MISMO_CONTENIDO_ORDEN_DISTINTO = [
  '## **Tipos de Dato Estructurado**',
  '',
  '<!-- ABRE SDT -->',
  '::: details sBTPadreUno',
  '',
  '### sBTPadreUno',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTPadreUno son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :----------- | :-----------',
  'hijo | [sBTSeguroPrestamo](#sbtseguroprestamo) | Seguro.',
  ':::',
  '',
  '::: details sBTSeguroPrestamo',
  '',
  '### sBTSeguroPrestamo',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTSeguroPrestamo son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :--------- | :---------',
  'codigo | Int | Código del seguro.',
  'descripcion | String | Descripción del seguro.',
  'importeFijo | Decimal | Importe fijo del seguro.',
  'modificable | String | Indica si es modificable.',
  'porcentaje | Decimal | Porcentaje del seguro.',
  'tipo | String | Tipo del seguro.',
  ':::',
  '',
  '::: details sBTPadreDos',
  '',
  '### sBTPadreDos',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTPadreDos son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  ':--------- | :----------- | :-----------',
  'hijo | [sBTSeguroPrestamo](#sbtseguroprestamo) | Seguro.',
  ':::',
  '',
  '::: details sBTSeguroPrestamo',
  '',
  '### sBTSeguroPrestamo',
  '',
  '::: center',
  'Los campos del tipo de dato estructurado sBTSeguroPrestamo son los siguientes:',
  '',
  'Nombre | Tipo | Comentarios',
  '--------- | ----------- | -----------',
  'codigo | Int | Código del seguro.',
  'descripcion | String | Descripción del seguro.',
  'tipo | String | Tipo del seguro.',
  'modificable | String | Indica si es modificable.',
  'importeFijo | Decimal | Importe fijo del seguro.',
  'porcentaje | Decimal | Porcentaje del seguro.',
  ':::',
  '<!-- CIERRA SDT -->',
  ''
].join('\n');

test('detectarSdtsAnidados trata como idéntico un SDT duplicado cuyas filas están en otro orden y/o la fila separadora de tabla usa otra sintaxis', () => {
  const problemas = detectarSdtsAnidados(MD_SDT_HERMANOS_MISMO_CONTENIDO_ORDEN_DISTINTO);
  assert.ok(
    problemas.some(p => p.includes('SDT "sBTSeguroPrestamo" duplicado') && p.includes('idéntico')),
    `mismos campos en otro orden no debería marcarse DIVERGENTE: ${JSON.stringify(problemas)}`
  );
});

test('fixarSdtsAnidados unifica un SDT duplicado cuyas filas están en otro orden y/o la fila separadora usa otra sintaxis, conservando la primera copia tal cual', () => {
  const { resultado, cambios } = fixarSdtsAnidados(MD_SDT_HERMANOS_MISMO_CONTENIDO_ORDEN_DISTINTO);
  assert.equal(cambios, 1);
  assert.equal((resultado.match(/^::: details sBTSeguroPrestamo$/gim) || []).length, 1);
  // La copia que sobrevive es la primera, con su orden de filas original intacto.
  assert.match(resultado, /codigo \| Int \| Código del seguro\.\ndescripcion \| String \| Descripción del seguro\.\nimporteFijo \| Decimal \| Importe fijo del seguro\.\nmodificable \| String \| Indica si es modificable\.\nporcentaje \| Decimal \| Porcentaje del seguro\.\ntipo \| String \| Tipo del seguro\./);
  assert.deepEqual(detectarSdtsAnidados(resultado), []);
});

test('detectarSdtsAnidados no confunde los bloques "::: details Ejemplo de Invocación/Respuesta" (ambos capturan el nombre "Ejemplo") con un SDT duplicado', () => {
  const md = [
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '@tab XML',
    '```xml',
    '<a></a>',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '@tab XML',
    '```xml',
    '<b></b>',
    '```',
    ':::',
    '',
    MD_SDT_VALIDO
  ].join('\n');
  const problemas = detectarSdtsAnidados(md);
  assert.ok(!problemas.some(p => p.includes('"Ejemplo"')), `no debería tratar "Ejemplo" como SDT duplicado: ${JSON.stringify(problemas)}`);
});

test('fixarSdtsAnidados unifica bloques ::: details hermanos duplicados con contenido idéntico, dejando uno solo', () => {
  const { resultado, cambios } = fixarSdtsAnidados(MD_SDT_HERMANOS_DUPLICADOS_IDENTICOS);
  assert.equal(cambios, 1);

  const ocurrencias = (resultado.match(/^::: details sBTHijoComun$/gim) || []).length;
  assert.equal(ocurrencias, 1, `debería quedar un único bloque sBTHijoComun: ${resultado}`);

  // Ambos padres siguen intactos, solo se quitó la copia redundante del hijo.
  assert.equal((resultado.match(/^::: details sBTPadreUno$/gim) || []).length, 1);
  assert.equal((resultado.match(/^::: details sBTPadreDos$/gim) || []).length, 1);

  assert.deepEqual(detectarSdtsAnidados(resultado), []);

  // Idempotente: correr el fixer de nuevo sobre el resultado no cambia nada más.
  const segunda = fixarSdtsAnidados(resultado);
  assert.equal(segunda.cambios, 0);
  assert.equal(segunda.resultado, resultado);
});

test('fixarSdtsAnidados NO toca bloques ::: details hermanos duplicados con contenido divergente (queda para revisión manual)', () => {
  const { resultado, cambios } = fixarSdtsAnidados(MD_SDT_HERMANOS_DUPLICADOS_DIVERGENTES);
  assert.equal(cambios, 0);
  assert.equal(resultado, MD_SDT_HERMANOS_DUPLICADOS_DIVERGENTES);

  // Sigue reportado, para que no desaparezca silenciosamente de la validación.
  const problemas = detectarSdtsAnidados(resultado);
  assert.ok(problemas.some(p => p.includes('DIVERGENTE')));
});

test('fixarArchivo (pipeline completo de --fix) también unifica SDTs duplicados en bloques hermanos, y el resultado queda limpio y estable', () => {
  const md = [
    '---',
    'title: Test',
    '---',
    '',
    '::: tabs #Datos',
    '',
    '@tab Datos de Entrada',
    '',
    'No aplica.',
    '',
    '@tab Datos de Salida',
    '',
    'Nombre | Tipo | Comentarios',
    ':--------- | :--------- | :---------',
    'padreUno | [sBTPadreUno](#sbtpadreuno) | Datos de prueba.',
    'padreDos | [sBTPadreDos](#sbtpadredos) | Datos de prueba.',
    '',
    '@tab Errores',
    '',
    'No aplica.',
    ':::',
    '',
    '::: details Ejemplo de Invocación',
    '::: code-tabs #Formato',
    '@tab XML',
    '```xml',
    '<soapenv:Envelope><soapenv:Body><bts:Test.Metodo><bts:Btinreq><bts:Canal>BTDIGITAL</bts:Canal></bts:Btinreq></bts:Test.Metodo></soapenv:Body></soapenv:Envelope>',
    '```',
    ':::',
    '',
    '::: details Ejemplo de Respuesta',
    '::: code-tabs #Formato',
    '@tab XML',
    '```xml',
    '<SOAP-ENV:Envelope><SOAP-ENV:Body><Test.MetodoResponse><Btinreq><Canal>BTDIGITAL</Canal></Btinreq><padreUno><hijo><clave></clave><valor></valor></hijo></padreUno><padreDos><codigo>0</codigo><hijo><clave></clave><valor></valor></hijo></padreDos><Erroresnegocio></Erroresnegocio><Btoutreq><Estado>OK</Estado></Btoutreq></Test.MetodoResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>',
    '```',
    ':::',
    '',
    MD_SDT_HERMANOS_DUPLICADOS_IDENTICOS
  ].join('\n');

  const filePath = tmpFile('sdt-duplicado-hermanos.md', md);

  const c1 = fixarArchivo(filePath);
  const despues1 = fs.readFileSync(filePath, 'utf8');
  assert.ok(c1 > 0, 'debería reportar al menos el cambio de unificar el SDT duplicado');
  assert.equal((despues1.match(/^::: details sBTHijoComun$/gim) || []).length, 1);

  const c2 = fixarArchivo(filePath);
  const despues2 = fs.readFileSync(filePath, 'utf8');
  assert.equal(c2, 0, 'una segunda corrida no debería reportar más cambios');
  assert.equal(despues2, despues1, 'una segunda corrida no debería seguir cambiando el archivo');

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});
