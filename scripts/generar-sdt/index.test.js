const test = require('node:test');
const assert = require('node:assert/strict');

const { buildSdtCopy, generateSdtScript } = require('./index.js');

function sourceSdt() {
  return {
    bti025: { nom: 'SdtOriginal', version: '2', descrip: 'Descripcion original.', nativo: 'S', fecha: new Date('2025-01-01'), nomint: 'SdtOriginalInt', estado: 'Validado', tipo: '0', namespace: 'uy.com.dlya' },
    bti026: [
      { elemnom: 'campoA', elemtipo: 'String', elemlargo: '50', elemcat: 'B', elemdsc: 'Campo A.', elemsdt: '' },
      { elemnom: 'campoB', elemtipo: 'Int', elemlargo: '0', elemcat: 'B', elemdsc: 'Campo B.', elemsdt: '' },
      { elemnom: 'campoC', elemtipo: 'SdtAnidado', elemlargo: '0', elemcat: 'B', elemdsc: 'Campo anidado.', elemsdt: 'SdtAnidado' },
    ],
  };
}

test('buildSdtCopy fuerza Nativo=N y Version=1 en la copia, hereda el resto de BTI025', () => {
  const { bti025Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA', 'campoB', 'campoC']);
  assert.equal(bti025Copy.nativo, 'N');
  assert.equal(bti025Copy.version, '1');
  assert.equal(bti025Copy.nom, 'SdtCopia');
  assert.equal(bti025Copy.namespace, 'uy.com.dlya');
  assert.equal(bti025Copy.descrip, 'Descripcion original.');
});

test('buildSdtCopy respeta el orden de fieldsOrdenados y asigna posi consecutivo', () => {
  const { bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoC', 'campoA']);
  assert.deepEqual(bti026Copy.map(f => f.elemnom), ['campoC', 'campoA']);
  assert.equal(bti026Copy[0].posi, '1');
  assert.equal(bti026Copy[1].posi, '2');
});

test('buildSdtCopy excluye campos no presentes en fieldsOrdenados', () => {
  const { bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA']);
  assert.equal(bti026Copy.length, 1);
  assert.equal(bti026Copy[0].elemnom, 'campoA');
});

test('buildSdtCopy conserva el SDT anidado referenciado sin renombrarlo', () => {
  const { bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoC']);
  assert.equal(bti026Copy[0].elemsdt, 'SdtAnidado');
  assert.equal(bti026Copy[0].elemtipo, 'SdtAnidado');
});

test('buildSdtCopy lanza si fieldsOrdenados referencia un campo inexistente', () => {
  assert.throws(() => buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoZ']), /campoZ/);
});

test('generateSdtScript V3 emite DELETE antes que INSERT y usa el nombre nuevo', () => {
  const { bti025Copy, bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA', 'campoB']);
  const script = generateSdtScript('SdtCopia', bti025Copy, bti026Copy, 'V3', 'both');
  const deleteIdx = script.indexOf("DELETE FROM BTI025 WHERE BTISDTNom=N'SdtCopia'");
  const insertIdx = script.indexOf("INSERT INTO BTI025");
  assert.ok(deleteIdx >= 0, 'debe incluir el DELETE de BTI025 con el nombre nuevo');
  assert.ok(insertIdx > deleteIdx, 'el INSERT debe venir despues del DELETE');
  assert.ok(script.includes("N'N'"), 'debe insertar Nativo=N');
  assert.match(script, /INSERT INTO BTI026 \([^)]+\) VALUES\(N'SdtCopia', N'campoA'/);
});

test('generateSdtScript V4 usa columnas y comillas de Oracle', () => {
  const { bti025Copy, bti026Copy } = buildSdtCopy(sourceSdt(), 'SdtCopia', ['campoA']);
  const script = generateSdtScript('SdtCopia', bti025Copy, bti026Copy, 'V4', 'insert');
  assert.ok(!/[(,]\s*N'/.test(script), 'V4 no debe usar el prefijo N de SQL Server');
  assert.match(script, /INSERT INTO BTI026 \([^)]+\) VALUES\('SdtCopia', '1', 'campoA'/);
});
