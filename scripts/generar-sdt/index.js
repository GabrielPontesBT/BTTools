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

function createSdtGenFeature(deps) {
  const getPool = deps.getPool;
  const getOra = deps.getOra;
  const queryBti025 = deps.queryBti025;
  const queryBti026 = deps.queryBti026;

  async function listSdtNames(platform, db) {
    if (platform === 'sqlserver') {
      const { pool } = await getPool(db);
      const r = await pool.request().query('SELECT BTISDTNom FROM BTI025 ORDER BY BTISDTNom');
      return r.recordset.map(row => (row.BTISDTNom || '').trim()).filter(Boolean);
    }
    const { conn, oracledb } = await getOra(db);
    try {
      const r = await conn.execute('SELECT BTISDTNOM FROM BTI025 ORDER BY BTISDTNOM', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return r.rows.map(row => (row.BTISDTNOM || '').trim()).filter(Boolean);
    } finally {
      await conn.close();
    }
  }

  return { listSdtNames };
}

module.exports = { createSdtGenFeature, buildSdtCopy, generateSdtScript };
