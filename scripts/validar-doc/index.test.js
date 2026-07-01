const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { detectarSdtsAnidados, fixarSdtsAnidados, fixarArchivo, validarArchivo } = require('./index.js');

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
