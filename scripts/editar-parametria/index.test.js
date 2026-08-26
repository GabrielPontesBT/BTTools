const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createParamEditFeature, buildParams, generateParamsScript, suggestParamShape,
  buildFieldEdits, generateFieldsScript,
  isValidParamName, isValidDigits, isValidParamText, isValidDir, isValidCat, isValidCatit,
} = require('./index.js');

function sourceParams() {
  return [
    { nom: 'ParamA', nomjava: 'param0', dir: 'I', tipo: 'string', ittipo: '', valor: '', sdtver: '', cat: 'B', catit: 'B', largo: '50', lval: '', itnom: '', deci: '0', dsc: 'Parametro A.' },
    { nom: 'ParamB', nomjava: 'param1', dir: 'O', tipo: 'double', ittipo: '', valor: '', sdtver: '', cat: 'B', catit: 'B', largo: '15', lval: '', itnom: '', deci: '2', dsc: 'Parametro B.' },
    { nom: 'ParamC', nomjava: 'param2', dir: 'I', tipo: 'SdtAnidado', ittipo: '', valor: '', sdtver: '1', cat: 'S', catit: 'B', largo: '0', lval: '', itnom: '', deci: '0', dsc: 'Parametro anidado.' },
  ];
}

function sourceFields() {
  return [
    { elemnom: 'nombre', elemlargo: '50', elemdeci: '0', elemdsc: 'Nombre del cliente.', nomit: '' },
    { elemnom: 'cuit', elemlargo: '11', elemdeci: '0', elemdsc: 'CUIT del titular.', nomit: '' },
  ];
}

test('isValidParamName / isValidDigits / isValidParamText validan lo esperado', () => {
  assert.equal(isValidParamName('ParamA'), true);
  assert.equal(isValidParamName('1Param'), false);
  assert.equal(isValidDigits('0'), true);
  assert.equal(isValidDigits('-1'), false);
  assert.equal(isValidDigits('1.5'), false);
  assert.equal(isValidParamText('texto normal.'), true);
  assert.equal(isValidParamText("con '"), false);
});

test('isValidDir acepta los 6 valores reales de BTISRVPARDIR (H/S/R/I/B/O) y rechaza el resto', () => {
  for (const dir of ['H', 'S', 'R', 'I', 'B', 'O']) assert.equal(isValidDir(dir), true, dir + ' deberia ser valido');
  assert.equal(isValidDir('X'), false);
  assert.equal(isValidDir('io'), false, 'no debe aceptar minusculas sin normalizar');
});

test('isValidCat acepta B/C/S (Basico/Coleccion/SDT) y rechaza el resto', () => {
  for (const cat of ['B', 'C', 'S']) assert.equal(isValidCat(cat), true, cat + ' deberia ser valido');
  assert.equal(isValidCat('X'), false);
  assert.equal(isValidCat('b'), false, 'no debe aceptar minusculas sin normalizar');
});

test('isValidCatit acepta solo B/S (categoria del item de una Coleccion)', () => {
  assert.equal(isValidCatit('B'), true);
  assert.equal(isValidCatit('S'), true);
  assert.equal(isValidCatit('C'), false, 'una coleccion de colecciones no esta soportada');
  assert.equal(isValidCatit('X'), false);
});

test('buildParams conserva el orden recibido (define BTISRVPARPOSI) y normaliza dir a mayusculas', () => {
  const src = sourceParams();
  src[0].dir = 'i';
  const built = buildParams(src);
  assert.deepEqual(built.map(p => p.nom), ['ParamA', 'ParamB', 'ParamC']);
  assert.equal(built[0].dir, 'I');
});

test('buildParams aplica defaults (largo/deci "0", nomjava "param0", cat/catit "B") cuando faltan', () => {
  const built = buildParams([{ nom: 'ParamNuevo', dir: 'I', tipo: 'string' }]);
  assert.equal(built[0].largo, '0');
  assert.equal(built[0].deci, '0');
  assert.equal(built[0].nomjava, 'param0');
  assert.equal(built[0].cat, 'B');
  assert.equal(built[0].catit, 'B');
  assert.equal(built[0].valor, '');
  assert.equal(built[0].dsc, '');
});

test('buildParams lanza si la lista queda vacia', () => {
  assert.throws(() => buildParams([]), /no puede quedar vacia/);
  assert.throws(() => buildParams(null), /no puede quedar vacia/);
});

test('buildParams lanza si el nombre no es un identificador valido', () => {
  for (const nombreInvalido of ['Param A', '1Param', "Param'A", '']) {
    const src = sourceParams();
    src[0].nom = nombreInvalido;
    assert.throws(() => buildParams(src), /Nombre de parametro invalido/, 'deberia rechazar: ' + JSON.stringify(nombreInvalido));
  }
});

test('buildParams lanza si la direccion no es H/S/R/I/B/O', () => {
  const src = sourceParams();
  src[0].dir = 'X';
  assert.throws(() => buildParams(src), /Direccion invalida/);
});

test('buildParams lanza si la categoria no es B/C/S', () => {
  const src = sourceParams();
  src[0].cat = 'X';
  assert.throws(() => buildParams(src), /Categoria invalida/);
});

test('buildParams (cat=SDT) exige tipo (SDT elegido) y version, y limpia largo/decimales', () => {
  const base = () => ({ nom: 'ParamSdt', dir: 'I', cat: 'S' });
  assert.throws(() => buildParams([base()]), /Debe elegir un SDT/);
  assert.throws(() => buildParams([{ ...base(), tipo: 'SdtCliente' }]), /Falta la version del SDT elegido/);
  const built = buildParams([{ ...base(), tipo: 'SdtCliente', sdtver: '2', largo: '99', deci: '2' }]);
  assert.equal(built[0].tipo, 'SdtCliente');
  assert.equal(built[0].sdtver, '2');
  assert.equal(built[0].largo, '0', 'un SDT no usa largo, se limpia aunque venga seteado');
  assert.equal(built[0].deci, '0');
  assert.equal(built[0].catit, 'B', 'catit por defecto cuando cat no es Coleccion');
});

test('buildParams (cat=Coleccion, item Basico) exige catit/itnom/tipo-de-item y usa largo/decimales del item', () => {
  const base = () => ({ nom: 'ParamLista', dir: 'I', cat: 'C', catit: 'B', itnom: 'item', ittipo: 'int', largo: '9', deci: '0' });
  const built = buildParams([base()]);
  assert.equal(built[0].cat, 'C');
  assert.equal(built[0].catit, 'B');
  assert.equal(built[0].itnom, 'item');
  assert.equal(built[0].ittipo, 'int');
  assert.equal(built[0].largo, '9');
  assert.equal(built[0].tipo, '', 'una Coleccion no usa "tipo" propio, usa ittipo del item');
  assert.throws(() => buildParams([{ ...base(), itnom: '' }]), /Nombre de item invalido/);
  assert.throws(() => buildParams([{ ...base(), itnom: '1item' }]), /Nombre de item invalido/);
  assert.throws(() => buildParams([{ ...base(), ittipo: '' }]), /Tipo de item invalido/);
  assert.throws(() => buildParams([{ ...base(), catit: 'X' }]), /Categoria del item invalida/);
});

test('buildParams (cat=Coleccion, item SDT) exige SDT y version de item, y limpia largo/decimales', () => {
  const base = () => ({ nom: 'ParamListaSdt', dir: 'I', cat: 'C', catit: 'S', itnom: 'item' });
  assert.throws(() => buildParams([base()]), /Debe elegir un SDT de item/);
  assert.throws(() => buildParams([{ ...base(), ittipo: 'SdtDireccion' }]), /Falta la version del SDT de item elegido/);
  const built = buildParams([{ ...base(), ittipo: 'SdtDireccion', sdtver: '3', largo: '50' }]);
  assert.equal(built[0].ittipo, 'SdtDireccion');
  assert.equal(built[0].sdtver, '3');
  assert.equal(built[0].largo, '0');
  assert.equal(built[0].deci, '0');
});

test('buildParams lanza si el tipo esta vacio o contiene texto prohibido', () => {
  const vacio = sourceParams(); vacio[0].tipo = '';
  assert.throws(() => buildParams(vacio), /Tipo invalido/);
  const conComillas = sourceParams(); conComillas[0].tipo = "string'";
  assert.throws(() => buildParams(conComillas), /Tipo invalido/);
});

test('buildParams lanza si largo o decimales no son numericos', () => {
  const largoInvalido = sourceParams(); largoInvalido[0].largo = '12a';
  assert.throws(() => buildParams(largoInvalido), /Largo invalido/);
  const deciInvalido = sourceParams(); deciInvalido[1].deci = '-1';
  assert.throws(() => buildParams(deciInvalido), /Decimales invalidos/);
});

test('buildParams lanza si valor por defecto o descripcion contienen comillas, punto y coma, barra invertida o salto de linea', () => {
  for (const textoInvalido of ["Tiene ' apostrofo", 'Tiene " comilla doble', 'Tiene ; punto y coma', 'Tiene \\ barra', 'Tiene\nsalto de linea']) {
    const conValorInvalido = sourceParams(); conValorInvalido[0].valor = textoInvalido;
    assert.throws(() => buildParams(conValorInvalido), /Valor por defecto invalido/, 'deberia rechazar valor: ' + JSON.stringify(textoInvalido));
    const conDscInvalida = sourceParams(); conDscInvalida[0].dsc = textoInvalido;
    assert.throws(() => buildParams(conDscInvalida), /Descripcion invalida/, 'deberia rechazar dsc: ' + JSON.stringify(textoInvalido));
  }
});

test('generateParamsScript V3 con oldCount=newCount solo emite UPDATE (sin BTI012/014/004, sin DELETE ni INSERT)', () => {
  const script = generateParamsScript('MiServicio', '1', 'MiMetodo', sourceParams(), 'V3', 'publica', 3);
  assert.ok(!script.includes('BTI012'), 'no debe tocar BTI012');
  assert.ok(!script.includes('BTI014'), 'no debe tocar BTI014');
  assert.ok(!script.includes('BTI004'), 'no debe tocar BTI004');
  assert.ok(!script.includes('DELETE'), 'sin remociones no debe haber DELETE');
  assert.ok(!script.includes('INSERT'), 'sin agregados no debe haber INSERT');
  const lines = script.split('\n').filter(Boolean);
  assert.equal(lines.length, 3);
  assert.match(lines[0], /^UPDATE BTI019 SET .* WHERE BTINom=N'BTSERVICES' AND BTISrvNom=N'MiServicio' AND BTISrvVer=N'1' AND BTIMtdNom=N'MiMetodo' AND BTISrvParPosi=1;$/);
  assert.ok(lines[0].includes("BTISrvParNom=N'ParamA'"), 'el UPDATE debe setear el nombre del parametro');
});

test('generateParamsScript V4 con oldCount=0 (metodo nuevo) genera solo INSERT y asigna BTISRVPARPOSI por indice', () => {
  const script = generateParamsScript('MiServicio', '1', 'MiMetodo', sourceParams(), 'V4', 'publica', 0);
  assert.ok(!/[(,]\s*N'/.test(script), 'V4 no debe usar el prefijo N de SQL Server');
  assert.ok(!script.includes('UPDATE'), 'sin filas previas no debe haber UPDATE');
  const lines = script.split('\n').filter(l => l.startsWith('INSERT INTO BTI019'));
  assert.equal(lines.length, 3);
  assert.match(lines[0], /VALUES\('BTSERVICES', 'MiServicio', '1', 'MiMetodo', 1, 'ParamA'/);
  assert.match(lines[1], /VALUES\('BTSERVICES', 'MiServicio', '1', 'MiMetodo', 2, 'ParamB'/);
  assert.match(lines[2], /VALUES\('BTSERVICES', 'MiServicio', '1', 'MiMetodo', 3, 'ParamC'/);
});

test('generateParamsScript UPDATEa los parametros que ya existian e INSERTa solo el agregado al final', () => {
  const params = sourceParams();
  params.push({ nom: 'ParamNuevo', dir: 'I', tipo: 'int', largo: '9', deci: '0', valor: '', dsc: 'Nuevo parametro.' });
  const script = generateParamsScript('MiServicio', '1', 'MiMetodo', params, 'V4', 'publica', 3);
  const updateLines = script.split('\n').filter(l => l.startsWith('UPDATE BTI019'));
  const insertLines = script.split('\n').filter(l => l.startsWith('INSERT INTO BTI019'));
  assert.equal(updateLines.length, 3, 'los 3 parametros originales se actualizan, no se reinsertan');
  assert.equal(insertLines.length, 1);
  assert.match(insertLines[0], /VALUES\('BTSERVICES', 'MiServicio', '1', 'MiMetodo', 4, 'ParamNuevo'/);
  assert.ok(!script.includes('DELETE'), 'no se quito ningun parametro, no debe haber DELETE');
});

test('generateParamsScript DELETEa por posicion las filas que sobran cuando se quita un parametro', () => {
  const params = sourceParams().slice(0, 2); // se quito ParamC (quedan 2 de los 3 originales)
  const script = generateParamsScript('MiServicio', '1', 'MiMetodo', params, 'V4', 'publica', 3);
  const updateLines = script.split('\n').filter(l => l.startsWith('UPDATE BTI019'));
  assert.equal(updateLines.length, 2);
  assert.match(script, /DELETE FROM BTI019 WHERE BTINOM='BTSERVICES' AND BTISRVNOM='MiServicio' AND BTISRVVER='1' AND BTIMTDNOM='MiMetodo' AND BTISRVPARPOSI > 2;/);
  assert.ok(!script.includes('INSERT'), 'no se agrego ningun parametro, no debe haber INSERT');
});

test('generateParamsScript (apiMode interna) genera UPDATE/INSERT/DELETE contra BTCBS019, no BTI019', () => {
  const script = generateParamsScript('MiServicio', '1', 'MiMetodo', sourceParams(), 'V4', 'interna', 2);
  assert.ok(script.includes('BTCBS019'));
  assert.ok(!script.includes('BTI019'));
  assert.ok(!script.includes('BTCBS012'));
  assert.ok(!script.includes('BTCBS014'));
  assert.ok(script.split('\n').some(l => l.startsWith('UPDATE BTCBS019')));
  assert.ok(script.split('\n').some(l => l.startsWith('INSERT INTO BTCBS019')));
});

test('buildFieldEdits conserva el orden recibido (define BTISDTELEMPOSI) y normaliza defaults', () => {
  const built = buildFieldEdits([{ elemnom: 'campoNuevo' }]);
  assert.equal(built[0].elemnom, 'campoNuevo');
  assert.equal(built[0].elemlargo, '0');
  assert.equal(built[0].elemdeci, '0');
  assert.equal(built[0].elemdsc, '');
  assert.equal(built[0].nomit, '');
});

test('buildFieldEdits lanza si la lista queda vacia', () => {
  assert.throws(() => buildFieldEdits([]), /no puede quedar vacia/);
  assert.throws(() => buildFieldEdits(null), /no puede quedar vacia/);
});

test('buildFieldEdits lanza si el nombre no es un identificador valido', () => {
  for (const elemnom of ['campo A', '1campo', "campo'A", '']) {
    assert.throws(() => buildFieldEdits([{ elemnom }]), /Nombre de parametro invalido/, 'deberia rechazar: ' + JSON.stringify(elemnom));
  }
});

test('buildFieldEdits lanza si largo o decimales no son numericos', () => {
  assert.throws(() => buildFieldEdits([{ elemnom: 'campoA', elemlargo: '12a' }]), /Largo invalido/);
  assert.throws(() => buildFieldEdits([{ elemnom: 'campoA', elemdeci: '-1' }]), /Decimales invalidos/);
});

test('buildFieldEdits lanza si la descripcion o el iterador contienen comillas, punto y coma, barra invertida o salto de linea', () => {
  for (const texto of ["Tiene ' apostrofo", 'Tiene ; punto y coma', 'Tiene \\ barra', 'Tiene\nsalto de linea']) {
    assert.throws(() => buildFieldEdits([{ elemnom: 'campoA', elemdsc: texto }]), /Descripcion invalida/, 'deberia rechazar dsc: ' + JSON.stringify(texto));
    assert.throws(() => buildFieldEdits([{ elemnom: 'campoA', nomit: texto }]), /Nombre de iterador invalido/, 'deberia rechazar nomit: ' + JSON.stringify(texto));
  }
});

test('buildFieldEdits preserva tipo/categoria/SDT anidado tal cual llegaron (no los valida ni los pisa): esta herramienta solo edita nombre/largo/decimales/descripcion/iterador', () => {
  const built = buildFieldEdits([{ elemnom: 'campoA', elemtipo: 'SdtDireccion', elemcat: 'S', elemsdt: 'SdtDireccion', sdtve: '1' }]);
  assert.equal(built[0].elemtipo, 'SdtDireccion', 'el tipo debe preservarse para que un reorden no lo pierda');
  assert.equal(built[0].elemcat, 'S');
  assert.equal(built[0].elemsdt, 'SdtDireccion');
  assert.equal(built[0].sdtve, '1');
});

test('generateFieldsScript V4 con oldCount=newCount solo emite UPDATE (sin INSERT ni DELETE)', () => {
  const script = generateFieldsScript('SdtCliente', sourceFields(), 'V4', 'publica', 2);
  assert.ok(!script.includes('INSERT'), 'esta herramienta no agrega campos nuevos');
  assert.ok(!script.includes('DELETE'), 'sin remociones no debe haber DELETE');
  const lines = script.split('\n').filter(Boolean);
  // fase 0 (blanquear nombre por posicion) + fase 1 (UPDATE completo) por
  // cada uno de los 2 campos -- ver ORA-00001 en sg_generateFieldsUpdateScript.
  assert.equal(lines.length, 4);
  assert.match(lines[2], /^UPDATE BTI026 SET .* WHERE BTISDTNOM='SdtCliente' AND BTISDTELEMPOSI=1;$/);
  assert.ok(lines[2].includes("BTISDTELEMNOM='nombre'"));
});

test('generateFieldsScript DELETEa por posicion los campos que sobran cuando se quita uno', () => {
  const script = generateFieldsScript('SdtCliente', sourceFields().slice(0, 1), 'V4', 'publica', 2);
  assert.match(script, /DELETE FROM BTI026 WHERE BTISDTNOM='SdtCliente' AND BTISDTELEMPOSI > 1;/);
  assert.ok(!script.includes('INSERT'));
});

test('generateFieldsScript (apiMode interna) genera UPDATE contra BTCBS026, no BTI026', () => {
  const script = generateFieldsScript('SdtCliente', sourceFields(), 'V4', 'interna', 2);
  assert.ok(script.includes('BTCBS026'));
  assert.ok(!script.includes('BTI026'));
});

test('generateFieldsScript soporta reordenar campos: el tipo/categoria viaja junto con el campo movido', () => {
  const campoBasico = { elemnom: 'nombre', elemtipo: 'string', elemcat: 'B', elemlargo: '50', elemdeci: '0', elemdsc: 'Nombre del cliente.', nomit: '' };
  const campoSdt = { elemnom: 'direccion', elemtipo: 'SdtDireccion', elemcat: 'S', elemsdt: 'SdtDireccion', sdtve: '1', elemlargo: '0', elemdeci: '0', elemdsc: 'Direccion del cliente.', nomit: '' };
  // El campo SDT estaba en la posicion 2 y el usuario lo arrastro a la 1.
  const script = generateFieldsScript('SdtCliente', [campoSdt, campoBasico], 'V4', 'publica', 2);
  const lines = script.split('\n');
  // Las primeras 2 lineas son la fase 0 (blanquear nombre por posicion);
  // las lineas 2-3 son la fase 1 (UPDATE de la fila completa).
  assert.match(lines[2], /BTISDTELEMPOSI=1;$/);
  assert.ok(lines[2].includes("BTISDTELEMNOM='direccion'") && lines[2].includes("BTISDTELEMTIPO='SdtDireccion'"));
  assert.match(lines[3], /BTISDTELEMPOSI=2;$/);
  assert.ok(lines[3].includes("BTISDTELEMNOM='nombre'") && lines[3].includes("BTISDTELEMTIPO='string'"));
});

test('suggestParamShape devuelve null si no hay candidatos', () => {
  assert.equal(suggestParamShape([]), null);
  assert.equal(suggestParamShape(null), null);
  assert.equal(suggestParamShape(undefined), null);
});

test('suggestParamShape elige la combinacion mas frecuente (moda), no la primera ni la ultima', () => {
  const candidates = [
    { tipo: 'string', largo: '20', deci: '0', dsc: 'Nombre del cliente.', cat: 'B', catit: 'B', ittipo: '', itnom: '', sdtver: '', valor: '' },
    { tipo: 'string', largo: '50', deci: '0', dsc: 'typo aislado en un metodo viejo.', cat: 'B', catit: 'B', ittipo: '', itnom: '', sdtver: '', valor: '' },
    { tipo: 'string', largo: '20', deci: '0', dsc: 'Nombre del cliente.', cat: 'B', catit: 'B', ittipo: '', itnom: '', sdtver: '', valor: '' },
  ];
  const suggestion = suggestParamShape(candidates);
  assert.equal(suggestion.shape.largo, '20');
  assert.equal(suggestion.shape.dsc, 'Nombre del cliente.');
  assert.equal(suggestion.count, 2);
  assert.equal(suggestion.total, 3);
});

test('suggestParamShape ignora dir/nomjava/nom (no son intrinsecos al parametro, varian segun donde se usa)', () => {
  const candidates = [
    { nom: 'Cuit', nomjava: 'param5', dir: 'I', tipo: 'string', largo: '11', deci: '0', dsc: 'CUIT del titular.', cat: 'B', catit: 'B', ittipo: '', itnom: '', sdtver: '', valor: '' },
    { nom: 'Cuit', nomjava: 'param9', dir: 'O', tipo: 'string', largo: '11', deci: '0', dsc: 'CUIT del titular.', cat: 'B', catit: 'B', ittipo: '', itnom: '', sdtver: '', valor: '' },
  ];
  const suggestion = suggestParamShape(candidates);
  assert.equal(suggestion.count, 2, 'las dos filas deberian contar como la misma combinacion pese a dir/nomjava distintos');
  assert.equal(suggestion.shape.dir, undefined, 'la sugerencia no debe incluir "dir": la direccion depende del metodo, no del parametro');
});

test('suggestParamShape trata campos ausentes como string vacio (no rompe la agrupacion)', () => {
  const suggestion = suggestParamShape([{ tipo: 'int' }, { tipo: 'int' }]);
  assert.equal(suggestion.count, 2);
  assert.equal(suggestion.shape.dsc, '');
});

function fakeDeps(overrides) {
  return Object.assign({
    getPool: async () => { throw new Error('getPool no configurado en el fake'); },
    getOra: async () => { throw new Error('getOra no configurado en el fake'); },
    queryMethodParams: async () => { throw new Error('queryMethodParams no configurado en el fake'); },
    queryServiceVersions: async () => { throw new Error('queryServiceVersions no configurado en el fake'); },
    queryAllSdts: async () => { throw new Error('queryAllSdts no configurado en el fake'); },
    queryParamCandidates: async () => { throw new Error('queryParamCandidates no configurado en el fake'); },
    queryBti025: async () => { throw new Error('queryBti025 no configurado en el fake'); },
    queryBti026: async () => { throw new Error('queryBti026 no configurado en el fake'); },
  }, overrides || {});
}

test('loadParams resuelve la primera version del servicio y consulta los parametros con ella', async () => {
  const calls = [];
  const feature = createParamEditFeature(fakeDeps({
    queryServiceVersions: async (...a) => { calls.push(a); return ['2', '1']; },
    queryMethodParams: async (...a) => { calls.push(a); return sourceParams(); },
  }));
  const result = await feature.loadParams('sqlserver', {}, 'V3', 'MiServicio', 'MiMetodo', 'publica');
  assert.equal(result.srvver, '2');
  assert.deepEqual(result.params, sourceParams());
  assert.deepEqual(calls[1], ['sqlserver', {}, 'V3', 'MiServicio', '2', 'MiMetodo', 'publica']);
});

test('loadParams usa "1" como version por defecto si el servicio no tiene ninguna', async () => {
  const feature = createParamEditFeature(fakeDeps({
    queryServiceVersions: async () => [],
    queryMethodParams: async () => [],
  }));
  const result = await feature.loadParams('sqlserver', {}, 'V3', 'MiServicio', 'MiMetodo');
  assert.equal(result.srvver, '1');
});

test('listSdtOptions devuelve el catalogo tal cual lo entrega la dependencia inyectada', async () => {
  const feature = createParamEditFeature(fakeDeps({
    queryAllSdts: async () => [{ nom: 'SdtCliente', version: '1' }, { nom: 'SdtDireccion', version: '2' }],
  }));
  const sdts = await feature.listSdtOptions('oracle', {}, 'V4', 'publica');
  assert.deepEqual(sdts, [{ nom: 'SdtCliente', version: '1' }, { nom: 'SdtDireccion', version: '2' }]);
});

test('handleApi POST /api/paramgen/sdt-options responde con el catalogo de SDTs', async () => {
  const feature = createParamEditFeature(fakeDeps({
    queryAllSdts: async () => [{ nom: 'SdtCliente', version: '1' }],
  }));
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('POST', '/api/paramgen/sdt-options', {
    platform: 'oracle', db: {}, version: 'V4', apiMode: 'publica',
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.deepEqual(res.body, { ok: true, sdts: [{ nom: 'SdtCliente', version: '1' }] });
});

test('suggestParam consulta candidatos por el nombre recibido y devuelve la combinacion mas frecuente', async () => {
  const calls = [];
  const feature = createParamEditFeature(fakeDeps({
    queryParamCandidates: async (...a) => {
      calls.push(a);
      return [
        { tipo: 'string', largo: '11', deci: '0', dsc: 'CUIT del titular.', cat: 'B', catit: 'B', ittipo: '', itnom: '', sdtver: '', valor: '' },
        { tipo: 'string', largo: '11', deci: '0', dsc: 'CUIT del titular.', cat: 'B', catit: 'B', ittipo: '', itnom: '', sdtver: '', valor: '' },
      ];
    },
  }));
  const suggestion = await feature.suggestParam('oracle', {}, 'V4', 'Cuit', 'publica');
  assert.deepEqual(calls, [['oracle', {}, 'V4', 'Cuit', 'publica']]);
  assert.equal(suggestion.shape.tipo, 'string');
  assert.equal(suggestion.shape.largo, '11');
  assert.equal(suggestion.shape.dsc, 'CUIT del titular.');
  assert.equal(suggestion.count, 2);
});

test('suggestParam devuelve null si no hay ningun parametro con ese nombre', async () => {
  const feature = createParamEditFeature(fakeDeps({ queryParamCandidates: async () => [] }));
  const suggestion = await feature.suggestParam('oracle', {}, 'V4', 'ParametroNuevoNuncaUsado', 'publica');
  assert.equal(suggestion, null);
});

test('handleApi POST /api/paramgen/suggest responde con la sugerencia', async () => {
  const feature = createParamEditFeature(fakeDeps({
    queryParamCandidates: async () => [{ tipo: 'long', largo: '8', deci: '0', dsc: 'Fecha de nacimiento.', cat: 'B', catit: 'B', ittipo: '', itnom: '', sdtver: '', valor: '' }],
  }));
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('POST', '/api/paramgen/suggest', {
    platform: 'oracle', db: {}, version: 'V4', apiMode: 'publica', nombre: 'FechaNacimiento',
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.suggestion.shape.tipo, 'long');
  assert.equal(res.body.suggestion.shape.largo, '8');
});

test('handleApi POST /api/paramgen/suggest responde con suggestion:null si no hay coincidencias', async () => {
  const feature = createParamEditFeature(fakeDeps({ queryParamCandidates: async () => [] }));
  const res = fakeRes();
  await feature.handleApi(fakeReq('POST', '/api/paramgen/suggest', {
    platform: 'oracle', db: {}, version: 'V4', nombre: 'Inexistente',
  }), res, fakeHelpers(res));
  assert.deepEqual(res.body, { ok: true, suggestion: null });
});

function fakeMssqlTransaction(log) {
  return class FakeTransaction {
    constructor(p) { this.pool = p; }
    async begin() { log.push('begin'); }
    async commit() { log.push('commit'); }
    async rollback() { log.push('rollback'); }
  };
}

test('executeParams (SQL Server) re-consulta la cantidad actual en la base (no confia en la del cliente) y UPDATEa sin tocar DELETE/INSERT si no cambio', async () => {
  const log = [];
  const queriesRun = [];
  const FakeTransaction = fakeMssqlTransaction(log);
  const FakeRequest = class { async query(sql) { queriesRun.push(sql); } };
  let queriedCount = null;
  const feature = createParamEditFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
    queryMethodParams: async () => { queriedCount = sourceParams().length; return sourceParams(); },
  }));
  const result = await feature.executeParams('sqlserver', {}, 'V3', 'MiServicio', '1', 'MiMetodo', sourceParams());
  assert.equal(queriedCount, 3, 'debe re-consultar la cantidad actual de parametros antes de armar el script');
  assert.equal(result.ok, true);
  assert.ok(result.statementsRun > 0);
  assert.deepEqual(log, ['begin', 'commit']);
  assert.ok(queriesRun.every(q => q.startsWith('UPDATE BTI019')), 'sin agregados ni removidos, todo debe ser UPDATE');
  assert.deepEqual(queriesRun.filter(q => /;\s*$/.test(q)), [], 'ninguna sentencia debe terminar en ;');
});

test('executeParams (SQL Server) INSERTa solo el parametro agregado cuando la base tenia menos', async () => {
  const queriesRun = [];
  const FakeTransaction = fakeMssqlTransaction([]);
  const FakeRequest = class { async query(sql) { queriesRun.push(sql); } };
  const feature = createParamEditFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
    queryMethodParams: async () => sourceParams().slice(0, 2),
  }));
  await feature.executeParams('sqlserver', {}, 'V4', 'MiServicio', '1', 'MiMetodo', sourceParams());
  assert.equal(queriesRun.filter(q => q.startsWith('UPDATE BTI019')).length, 2);
  assert.equal(queriesRun.filter(q => q.startsWith('INSERT INTO BTI019')).length, 1);
  assert.ok(!queriesRun.some(q => q.startsWith('DELETE')));
});

test('executeParams (SQL Server) DELETEa por posicion cuando la base tenia mas parametros de los que quedaron', async () => {
  const queriesRun = [];
  const FakeTransaction = fakeMssqlTransaction([]);
  const FakeRequest = class { async query(sql) { queriesRun.push(sql); } };
  const feature = createParamEditFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
    queryMethodParams: async () => sourceParams(),
  }));
  await feature.executeParams('sqlserver', {}, 'V4', 'MiServicio', '1', 'MiMetodo', sourceParams().slice(0, 2));
  assert.equal(queriesRun.filter(q => q.startsWith('UPDATE BTI019')).length, 2);
  assert.ok(queriesRun.some(q => q.startsWith('DELETE FROM BTI019') && q.includes('BTISRVPARPOSI > 2')));
  assert.ok(!queriesRun.some(q => q.startsWith('INSERT')));
});

test('executeParams (SQL Server) hace rollback si el INSERT del parametro nuevo falla', async () => {
  const log = [];
  const FakeTransaction = fakeMssqlTransaction(log);
  const FakeRequest = class { async query(sql) { if (sql.startsWith('INSERT INTO BTI019')) throw new Error('fallo simulado'); } };
  const feature = createParamEditFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
    queryMethodParams: async () => sourceParams().slice(0, 2),
  }));
  await assert.rejects(
    () => feature.executeParams('sqlserver', {}, 'V3', 'MiServicio', '1', 'MiMetodo', sourceParams()),
    /fallo simulado/
  );
  assert.deepEqual(log, ['begin', 'rollback']);
});

test('executeParams (Oracle) corre con autoCommit false, confirma con commit y cierra la conexion', async () => {
  const calls = [];
  const fakeConn = {
    execute: async (sql, binds, opts) => { calls.push({ sql, opts }); },
    commit: async () => { calls.push({ action: 'commit' }); },
    rollback: async () => { calls.push({ action: 'rollback' }); },
    close: async () => { calls.push({ action: 'close' }); },
  };
  const feature = createParamEditFeature(fakeDeps({
    getOra: async () => ({ conn: fakeConn, oracledb: {} }),
    queryMethodParams: async () => sourceParams(),
  }));
  const result = await feature.executeParams('oracle', {}, 'V4', 'MiServicio', '1', 'MiMetodo', sourceParams());
  assert.equal(result.ok, true);
  assert.ok(calls.every(c => !c.sql || c.opts.autoCommit === false));
  assert.equal(calls[calls.length - 2].action, 'commit');
  assert.equal(calls[calls.length - 1].action, 'close');
});

test('executeParams (Oracle) hace rollback y cierra la conexion si falla', async () => {
  const calls = [];
  const fakeConn = {
    execute: async () => { throw new Error('fallo oracle'); },
    commit: async () => { calls.push('commit'); },
    rollback: async () => { calls.push('rollback'); },
    close: async () => { calls.push('close'); },
  };
  const feature = createParamEditFeature(fakeDeps({
    getOra: async () => ({ conn: fakeConn, oracledb: {} }),
    queryMethodParams: async () => sourceParams(),
  }));
  await assert.rejects(
    () => feature.executeParams('oracle', {}, 'V4', 'MiServicio', '1', 'MiMetodo', sourceParams()),
    /fallo oracle/
  );
  assert.deepEqual(calls, ['rollback', 'close']);
});

function fakeReq(method, url, body) { return { method, url, _body: body }; }
function fakeRes() { return { statusCode: null, body: null }; }
function fakeHelpers(res) {
  return {
    readBody: async (req) => req._body,
    json: (status, obj) => { res.statusCode = status; res.body = obj; },
  };
}

test('handleApi POST /api/paramgen/params responde con srvver y parametros', async () => {
  const feature = createParamEditFeature(fakeDeps({
    queryServiceVersions: async () => ['1'],
    queryMethodParams: async () => sourceParams(),
  }));
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('POST', '/api/paramgen/params', {
    platform: 'sqlserver', db: {}, version: 'V3', service: 'MiServicio', method: 'MiMetodo',
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.srvver, '1');
  assert.deepEqual(res.body.params, sourceParams());
});

test('handleApi POST /api/paramgen/generate responde con el script (INSERT si no se manda oldCount)', async () => {
  const feature = createParamEditFeature(fakeDeps());
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('POST', '/api/paramgen/generate', {
    version: 'V3', service: 'MiServicio', srvver: '1', method: 'MiMetodo', params: sourceParams(),
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.script.includes("INSERT INTO BTI019"));
});

test('handleApi POST /api/paramgen/generate con oldCount genera UPDATE en vez de DELETE+INSERT', async () => {
  const feature = createParamEditFeature(fakeDeps());
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('POST', '/api/paramgen/generate', {
    version: 'V3', service: 'MiServicio', srvver: '1', method: 'MiMetodo', params: sourceParams(), oldCount: 3,
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.script.includes('UPDATE BTI019'));
  assert.ok(!res.body.script.includes('DELETE'));
  assert.ok(!res.body.script.includes('INSERT'));
});

test('handleApi POST /api/paramgen/generate rechaza un parametro con nombre invalido', async () => {
  const feature = createParamEditFeature(fakeDeps());
  const res = fakeRes();
  const params = sourceParams();
  params[0].nom = "Param'; DROP TABLE BTI019--";
  await feature.handleApi(fakeReq('POST', '/api/paramgen/generate', {
    version: 'V3', service: 'MiServicio', srvver: '1', method: 'MiMetodo', params,
  }), res, fakeHelpers(res));
  assert.equal(res.body.ok, false);
  assert.match(res.body.message, /Nombre de parametro invalido/);
});

test('handleApi POST /api/paramgen/execute ejecuta usando los parametros editados enviados por el cliente', async () => {
  const log = [];
  const queriesRun = [];
  const FakeTransaction = fakeMssqlTransaction(log);
  const FakeRequest = class { async query(sql) { queriesRun.push(sql); } };
  const feature = createParamEditFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
    queryMethodParams: async () => sourceParams(),
  }));
  const res = fakeRes();
  const params = sourceParams();
  // BTISRVPARDSC (descripcion) solo existe en V4, ver V3_BTI019_COLS vs
  // V4_BTI019_COLS en generar-scripts/index.js.
  params[0].dsc = 'Descripcion editada.';
  const handled = await feature.handleApi(fakeReq('POST', '/api/paramgen/execute', {
    platform: 'sqlserver', db: {}, version: 'V4', service: 'MiServicio', srvver: '1', method: 'MiMetodo', params,
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.statementsRun > 0);
  assert.ok(queriesRun.some(s => s.includes("'Descripcion editada.'")));
});

test('handleApi POST /api/paramgen/execute rechaza parametros invalidos sin tocar la base', async () => {
  let touched = false;
  const feature = createParamEditFeature(fakeDeps({
    getPool: async () => { touched = true; throw new Error('no deberia llamarse'); },
    getOra: async () => { touched = true; throw new Error('no deberia llamarse'); },
  }));
  const res = fakeRes();
  const params = sourceParams();
  params[1].largo = 'no-numerico';
  await feature.handleApi(fakeReq('POST', '/api/paramgen/execute', {
    platform: 'sqlserver', db: {}, version: 'V3', service: 'MiServicio', srvver: '1', method: 'MiMetodo', params,
  }), res, fakeHelpers(res));
  assert.equal(res.body.ok, false);
  assert.match(res.body.message, /Largo invalido/);
  assert.equal(touched, false);
});

test('loadFields devuelve bti025 y bti026 del SDT pedido', async () => {
  const feature = createParamEditFeature(fakeDeps({
    queryBti025: async () => ({ nom: 'SdtCliente', version: '1', estado: 'Validado' }),
    queryBti026: async () => sourceFields(),
  }));
  const result = await feature.loadFields('oracle', {}, 'V4', 'SdtCliente', 'publica');
  assert.equal(result.bti025.nom, 'SdtCliente');
  assert.deepEqual(result.bti026, sourceFields());
});

test('loadFields devuelve bti025:null y bti026:[] sin consultar los campos si el SDT no existe', async () => {
  let touched = false;
  const feature = createParamEditFeature(fakeDeps({
    queryBti025: async () => null,
    queryBti026: async () => { touched = true; throw new Error('no deberia llamarse'); },
  }));
  const result = await feature.loadFields('oracle', {}, 'V4', 'Inexistente', 'publica');
  assert.equal(result.bti025, null);
  assert.deepEqual(result.bti026, []);
  assert.equal(touched, false);
});

test('executeFieldEdits (SQL Server) re-consulta la cantidad actual de campos y UPDATEa sin DELETE si no cambio', async () => {
  const log = [];
  const queriesRun = [];
  const FakeTransaction = fakeMssqlTransaction(log);
  const FakeRequest = class { async query(sql) { queriesRun.push(sql); } };
  let queriedCount = null;
  const feature = createParamEditFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
    queryBti026: async () => { queriedCount = sourceFields().length; return sourceFields(); },
  }));
  const result = await feature.executeFieldEdits('sqlserver', {}, 'V4', 'SdtCliente', sourceFields(), 'publica');
  assert.equal(queriedCount, 2, 'debe re-consultar la cantidad actual de campos antes de armar el script');
  assert.equal(result.ok, true);
  assert.ok(result.statementsRun > 0);
  assert.deepEqual(log, ['begin', 'commit']);
  assert.ok(queriesRun.every(q => q.startsWith('UPDATE BTI026')));
  assert.deepEqual(queriesRun.filter(q => /;\s*$/.test(q)), [], 'ninguna sentencia debe terminar en ;');
});

test('executeFieldEdits (SQL Server) DELETEa por posicion cuando se quito un campo', async () => {
  const queriesRun = [];
  const FakeTransaction = fakeMssqlTransaction([]);
  const FakeRequest = class { async query(sql) { queriesRun.push(sql); } };
  const feature = createParamEditFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
    queryBti026: async () => sourceFields(),
  }));
  await feature.executeFieldEdits('sqlserver', {}, 'V4', 'SdtCliente', sourceFields().slice(0, 1), 'publica');
  // fase 0 (blanquear nombre) + fase 1 (UPDATE completo) para la unica
  // posicion tocada, ver ORA-00001 en sg_generateFieldsUpdateScript.
  assert.equal(queriesRun.filter(q => q.startsWith('UPDATE BTI026')).length, 2);
  assert.ok(queriesRun.some(q => q.startsWith('DELETE FROM BTI026') && q.includes('BTISDTELEMPOSI > 1')));
});

test('executeFieldEdits rechaza campos invalidos sin tocar la base', async () => {
  let touched = false;
  const feature = createParamEditFeature(fakeDeps({
    getPool: async () => { touched = true; throw new Error('no deberia llamarse'); },
    getOra: async () => { touched = true; throw new Error('no deberia llamarse'); },
  }));
  const fields = sourceFields();
  fields[0].elemlargo = 'no-numerico';
  await assert.rejects(
    () => feature.executeFieldEdits('sqlserver', {}, 'V4', 'SdtCliente', fields, 'publica'),
    /Largo invalido/
  );
  assert.equal(touched, false);
});

test('handleApi POST /api/paramgen/sdt-fields responde con bti025 y bti026', async () => {
  const feature = createParamEditFeature(fakeDeps({
    queryBti025: async () => ({ nom: 'SdtCliente', version: '1' }),
    queryBti026: async () => sourceFields(),
  }));
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('POST', '/api/paramgen/sdt-fields', {
    platform: 'oracle', db: {}, version: 'V4', apiMode: 'publica', nom: 'SdtCliente',
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.bti025.nom, 'SdtCliente');
  assert.deepEqual(res.body.bti026, sourceFields());
});

test('handleApi POST /api/paramgen/sdt-fields responde ok:false si el SDT no existe', async () => {
  const feature = createParamEditFeature(fakeDeps({ queryBti025: async () => null }));
  const res = fakeRes();
  await feature.handleApi(fakeReq('POST', '/api/paramgen/sdt-fields', {
    platform: 'oracle', db: {}, version: 'V4', nom: 'Inexistente',
  }), res, fakeHelpers(res));
  assert.equal(res.body.ok, false);
  assert.match(res.body.message, /Inexistente/);
});

test('handleApi POST /api/paramgen/generate-fields responde con el script', async () => {
  const feature = createParamEditFeature(fakeDeps());
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('POST', '/api/paramgen/generate-fields', {
    version: 'V4', apiMode: 'publica', sdtNom: 'SdtCliente', editedFields: sourceFields(), oldCount: 2,
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.script.includes('UPDATE BTI026'));
});

test('handleApi POST /api/paramgen/generate-fields rechaza un campo con nombre invalido', async () => {
  const feature = createParamEditFeature(fakeDeps());
  const res = fakeRes();
  const fields = sourceFields();
  fields[0].elemnom = "campo'; DROP TABLE BTI026--";
  await feature.handleApi(fakeReq('POST', '/api/paramgen/generate-fields', {
    version: 'V4', apiMode: 'publica', sdtNom: 'SdtCliente', editedFields: fields, oldCount: 2,
  }), res, fakeHelpers(res));
  assert.equal(res.body.ok, false);
  assert.match(res.body.message, /Nombre de parametro invalido/);
});

test('handleApi POST /api/paramgen/execute-fields ejecuta usando los campos editados enviados por el cliente', async () => {
  const log = [];
  const queriesRun = [];
  const FakeTransaction = fakeMssqlTransaction(log);
  const FakeRequest = class { async query(sql) { queriesRun.push(sql); } };
  const feature = createParamEditFeature(fakeDeps({
    getPool: async () => ({ pool: {}, mssql: { Transaction: FakeTransaction, Request: FakeRequest } }),
    queryBti026: async () => sourceFields(),
  }));
  const res = fakeRes();
  const fields = sourceFields();
  fields[0].elemdsc = 'Descripcion editada.';
  const handled = await feature.handleApi(fakeReq('POST', '/api/paramgen/execute-fields', {
    platform: 'sqlserver', db: {}, version: 'V4', apiMode: 'publica', sdtNom: 'SdtCliente', editedFields: fields,
  }), res, fakeHelpers(res));
  assert.equal(handled, true);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.statementsRun > 0);
  assert.ok(queriesRun.some(s => s.includes("'Descripcion editada.'")));
});

test('handleApi devuelve false para una ruta desconocida', async () => {
  const feature = createParamEditFeature(fakeDeps());
  const res = fakeRes();
  const handled = await feature.handleApi(fakeReq('GET', '/api/otra-cosa', {}), res, fakeHelpers(res));
  assert.equal(handled, false);
});
