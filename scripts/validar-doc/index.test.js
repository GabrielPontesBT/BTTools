const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  detectarSdtsAnidados, fixarSdtsAnidados, fixarArchivo, validarArchivo,
  detectarConflictosCasingArchivo, aplicarEleccionesCasing,
  parsearJsonEjemplo, parsearXmlEjemplo
} = require('./index.js');

function tmpFile(nombre, contenido) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'validar-doc-test-'));
  const filePath = path.join(dir, nombre);
  fs.writeFileSync(filePath, contenido, 'utf8');
  return filePath;
}

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
    assert.equal(item.otrosConceptos, 'REVISAR', `falta otrosConceptos en el item ${JSON.stringify(item)}`);
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
    assert.match(b[1], /<otrosConceptos>REVISAR<\/otrosConceptos>/, `falta <otrosConceptos> dentro de <sBTProducto>: ${b[1]}`);
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
// tipo simple. Cuando ese campo falta en el ejemplo, insertar "REVISAR" como
// string plano es incorrecto — hay que insertar un objeto/tag con los propios
// sub-campos de sBTConcepto (concepto, texto, valor), cada uno con su default.

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
  assert.equal(otrosConceptos.concepto, 'REVISAR');
  assert.equal(otrosConceptos.texto, 'REVISAR');
  assert.equal(otrosConceptos.valor, 'REVISAR');

  fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

test('fixarArchivo agrega el mismo campo SDT anidado dentro de <producto> en el XML, con sus propios sub-tags', () => {
  const filePath = tmpFile('sdt-anidado-simple-xml.md', MD_SDT_ANIDADO_SIN_CAMPO_SIMPLE);
  fixarArchivo(filePath);
  const contenido = fs.readFileSync(filePath, 'utf8');

  const xmlResp = parsearXmlEjemplo(contenido, 'Respuesta');
  const contenedor = xmlResp.match(/<otrosConceptos>([\s\S]*?)<\/otrosConceptos>/);
  assert.ok(contenedor, `debería existir <otrosConceptos> con contenido: ${xmlResp}`);
  assert.match(contenedor[1], /<concepto>REVISAR<\/concepto>/);
  assert.match(contenedor[1], /<texto>REVISAR<\/texto>/);
  assert.match(contenedor[1], /<valor>REVISAR<\/valor>/);

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
    assert.equal(item.otrosConceptos.concepto, 'REVISAR');
    assert.equal(item.otrosConceptos.texto, 'REVISAR');
    assert.equal(item.otrosConceptos.valor, 'REVISAR');
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
    assert.match(contenedor[1], /<concepto>REVISAR<\/concepto>/);
    assert.match(contenedor[1], /<texto>REVISAR<\/texto>/);
    assert.match(contenedor[1], /<valor>REVISAR<\/valor>/);
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
