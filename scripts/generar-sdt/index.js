'use strict';

const { sg_generateSdtScript } = require('../generar-scripts/index.js');

function buildSdtCopy(sourceSdt, nuevoNombre, fieldsOrdenados) {
  const b25 = sourceSdt.bti025 || {};
  const bti025Copy = Object.assign({}, b25, { nom: nuevoNombre, nativo: 'N', version: '1' });

  const byName = new Map((sourceSdt.bti026 || []).map(f => [f.elemnom, f]));
  const bti026Copy = fieldsOrdenados.map((elemnom, idx) => {
    const f = byName.get(elemnom);
    if (!f) throw new Error('Campo no encontrado en el SDT original: ' + elemnom);
    return Object.assign({}, f, { posi: String(idx + 1) });
  });

  return { bti025Copy, bti026Copy };
}

function generateSdtScript(nuevoNombre, bti025Copy, bti026Copy, version, mode) {
  return sg_generateSdtScript({ nom: nuevoNombre, bti025: bti025Copy, bti026: bti026Copy }, mode || 'both', version);
}

module.exports = { buildSdtCopy, generateSdtScript };
