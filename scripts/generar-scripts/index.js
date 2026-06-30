'use strict';

// Columnas de tablas BTI para V3 (SQL Server) y V4 (Oracle)
const V3_BTI004_COLS = ['BTINom','BTISrvNom','BTISrvVer','BTISrvDsc','BTISrvNSBT','BTISrvCanNSBT','BTISrvOpNSBT','BTISrvVarNSBT','BTISrvPgmName','BTISrvStatus','BTISrvFPath'];
const V3_BTI014_COLS = ['BTINom','BTISrvNom','BTISrvVer','BTIMtdNom','BTIMtdDsc','BTIMtdNSBT','BTIMtdPgmNom','BTIMtdPgmMtd','BTIMtdStatus','BTIMtdFPath','BTIMtdEnbTra','BTIMtdEsPgGx'];
const V4_BTI014_COLS = ['BTINOM','BTISRVNOM','BTISRVVER','BTIMTDNOM','BTIMTDDSC','BTIMTDNSBT','BTIMTDPGMNOM','BTIMTDPGMMTD','BTIMTDSTATUS','BTIMTDFPATH','BTIMTDENBTRA','BTIMTDESPGGX'];
const V3_BTI019_COLS = ['BTINom','BTISrvNom','BTISrvVer','BTIMtdNom','BTISrvParPosi','BTISrvParNom','BTISrvParNomJava','BTISrvParDir','BTISrvVarTipo','BTISrvParItTipo','BTISrvParValor','BTISrvSDTVer','BTISrvCat','BTISrvCatIt','BTISrvParLargo','BTISrvParLVal','BTISrvParItNom','BTISRVPARDECI'];
const V4_BTI019_COLS = ['BTINOM','BTISRVNOM','BTISRVVER','BTIMTDNOM','BTISRVPARPOSI','BTISRVPARNOM','BTISRVPARNOMJAVA','BTISRVPARDIR','BTISRVVARTIPO','BTISRVPARITTIPO','BTISRVPARVALOR','BTISRVCATIT','BTISRVCAT','BTISRVSDTVER','BTISRVPARLARGO','BTISRVPARLVAL','BTISRVPARITNOM','BTISRVPARDECI','BTISRVPARDSC'];
const V3_BTI025_COLS = ['BTISDTNom','BTISDTVersion','BTISDTDescrip','BTISDTNativo','BTISDTFecha','BTISDTNomInt','BTISDTEstado','BTISDTTipo','BTISDTNameSpace'];
const V4_BTI025_COLS = ['BTISDTNOM','BTISDTVERSION','BTISDTNOMINT','BTISDTESTADO','BTISDTTIPO','BTISDTNAMESPACE','BTISDTFECHA','BTISDTDESCRIP','BTISDTNATIVO'];
const V3_BTI026_COLS = ['BTISDTNom','BTISDTElemNom','BTISDTElemTipo','BTISDTElemLargo','BTISDTElemCat','BTISDTElemDsc','BTISDTElemSDT'];
const V4_BTI026_COLS = ['BTISDTNOM','BTISDTELEMNOM','BTISDTELEMTIPO','BTISDTELEMLARGO','BTISDTELEMDECI','BTISDTELEMCAT','BTISDTELEMDSC','BTISDTELEMSDT'];

function sg_fmtDate(val, ver) {
  if (!val) return ver === 'V3' ? "''" : 'NULL';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return ver === 'V3' ? "''" : 'NULL';
  const p = (n, z) => String(n).padStart(z || 2, '0');
  const s = d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
  return ver === 'V3' ? "'"+s+".000'" : "TIMESTAMP '"+s+".000000'";
}

const SG_SDT_EXCLUDE = new Set(['SdtsBTBusinessError']);

function sg_extractSdtNames(params) {
  const names = new Set();
  for (var i = 0; i < params.length; i++) {
    const p = params[i];
    if (p.tipo && p.tipo.startsWith('Sdt') && !SG_SDT_EXCLUDE.has(p.tipo.trim())) names.add(p.tipo.trim());
    if (p.ittipo && p.ittipo.trim().startsWith('Sdt') && !SG_SDT_EXCLUDE.has(p.ittipo.trim())) names.add(p.ittipo.trim());
  }
  return [...names];
}

function sg_sq(val, ver, nullable) {
  const s = val != null ? String(val) : '';
  if (nullable && s.trim() === '') return 'NULL';
  if (ver === 'V3') return "N'" + s + "'";
  return s.trim() === '' ? "' '" : "'" + s + "'";
}
function sg_nq(val) { const n = parseInt(String(val == null ? '0' : val).trim(), 10); return isNaN(n) ? '0' : String(n); }

function sg_generateScript(data, mode) {
  const ver = data.version, h = data.header, m = data.method, ps = data.params || [], lines = [];
  const BTINom = h.BTINom||'BTSERVICES', BTISrvNom = h.BTISrvNom||'', BTISrvVer = h.BTISrvVer||'1', BTIMtdNom = h.BTIMtdNom||'';
  const q = (v) => sg_sq(v, ver);
  function delBti019() { if(ver==='V3')return["DELETE FROM BTI019 WHERE BTINom=N'"+BTINom+"' AND BTISrvNom=N'"+BTISrvNom+"' AND BTIMtdNom=N'"+BTIMtdNom+"';"]; return["DELETE FROM BTI019 WHERE BTINOM='"+BTINom+"' AND BTISRVNOM='"+BTISrvNom+"' AND BTIMTDNOM='"+BTIMtdNom+"';"]; }
  function delBti014() { if(ver==='V3')return["DELETE FROM BTI014 WHERE BTINom=N'"+BTINom+"' AND BTISrvNom=N'"+BTISrvNom+"' AND BTIMtdNom=N'"+BTIMtdNom+"';"]; return["DELETE FROM BTI014 WHERE BTINOM='"+BTINom+"' AND BTISRVNOM='"+BTISrvNom+"' AND BTIMTDNOM='"+BTIMtdNom+"';"]; }
  function delBti004() { return["DELETE FROM BTI004 WHERE BTINom=N'"+BTINom+"' AND BTISrvNom=N'"+BTISrvNom+"';"]; }
  function insBti004() { const cols=V3_BTI004_COLS.join(', '),dsc=h.BTISrvDsc||'',pgm=(h.BTISrvPgmName||'').trim()||' '; return['INSERT INTO BTI004 ('+cols+") VALUES(N'"+BTINom+"', N'"+BTISrvNom+"', N'"+BTISrvVer+"', N'"+dsc+"', N' ', 0, 0, 0, N'"+pgm+"', N'                    ', N' ');"]; }
  function insBti014() {
    const status=(m.status||'Validado').padEnd(20).slice(0,20), enbtra=m.enbtra||'N', enbtraV=enbtra==='NULL'?'NULL':(ver==='V3'?"N'"+enbtra+"'":"'"+enbtra+"'");
    if(ver==='V3'){const cols=V3_BTI014_COLS.join(', ');return['INSERT INTO BTI014 ('+cols+") VALUES(N'"+BTINom+"', N'"+BTISrvNom+"', N'"+BTISrvVer+"', N'"+BTIMtdNom+"', N'"+(m.dsc||'')+"', N'"+(m.nsbt||' ')+"', N'"+(m.pgmnom||'')+"', N'"+(m.pgmmtd||'execute')+"', N'"+status+"', N'"+(m.fpath||'')+"', "+enbtraV+", N'"+(m.espggx||'S')+"');"];}
    const cols=V4_BTI014_COLS.join(', '),dscV=(m.dsc||'').trim()?"'"+(m.dsc)+"'":"' '";
    return['INSERT INTO BTI014 ('+cols+") VALUES('"+BTINom+"', '"+BTISrvNom+"', '"+BTISrvVer+"', '"+BTIMtdNom+"', "+dscV+", '"+(m.nsbt||' ')+"', '"+(m.pgmnom||'')+"', '"+(m.pgmmtd||'execute')+"', '"+status+"', ' ', "+enbtraV+", '"+(m.espggx||'S')+"');"];
  }
  function insBti019() {
    const cols=(ver==='V3'?V3_BTI019_COLS:V4_BTI019_COLS).join(', ');
    return ps.map(function(p,i) {
      const posi=i+1,largo=sg_nq(p.largo),deci=sg_nq(p.deci);
      var vals;
      if(ver==='V3'){vals=[sg_sq(BTINom,ver),sg_sq(BTISrvNom,ver),sg_sq(BTISrvVer,ver),sg_sq(BTIMtdNom,ver),posi,sg_sq(p.nom,ver),sg_sq(p.nomjava,ver),sg_sq(p.dir,ver),sg_sq(p.tipo,ver),sg_sq(p.ittipo,ver),sg_sq(p.valor,ver),sg_sq(p.sdtver,ver),sg_sq(p.cat,ver),sg_sq(p.catit,ver),largo,sg_sq(p.lval,ver),sg_sq(p.itnom,ver),deci].join(', ');}
      else{vals=[sg_sq(BTINom,ver),sg_sq(BTISrvNom,ver),sg_sq(BTISrvVer,ver),sg_sq(BTIMtdNom,ver),posi,sg_sq(p.nom,ver),sg_sq(p.nomjava,ver),sg_sq(p.dir,ver),sg_sq(p.tipo,ver),sg_sq(p.ittipo,ver),sg_sq(p.valor,ver),sg_sq(p.catit,ver),sg_sq(p.cat,ver),sg_sq(p.sdtver,ver),largo,sg_sq(p.lval,ver),sg_sq(p.itnom,ver),deci,sg_sq(p.dsc,ver,true)].join(', ');}
      return 'INSERT INTO BTI019 ('+cols+') VALUES('+vals+');';
    });
  }
  if(mode==='delete'){if(ver==='V3')lines.push(...delBti004(),''); lines.push(...delBti014(),'', ...delBti019());}
  else if(mode==='insert'){if(ver==='V3')lines.push(...insBti004(),''); lines.push(...insBti014(),'', ...insBti019());}
  else{if(ver==='V3')lines.push(...delBti004(),...insBti004(),''); lines.push(...delBti014(),...insBti014(),'', ...delBti019(),...insBti019());}
  return lines.join('\n');
}

function sg_generateSdtScript(sdt, mode, version) {
  const lines = [], nom = sdt.nom || '', b25 = sdt.bti025, b26 = sdt.bti026 || [];
  const q = function(v) { return sg_sq(v, version); };
  const nomCol = version === 'V3' ? 'BTISDTNom' : 'BTISDTNOM';
  function delBti025() { return ['DELETE FROM BTI025 WHERE '+nomCol+'='+q(nom)+';']; }
  function delBti026() { return ['DELETE FROM BTI026 WHERE '+nomCol+'='+q(nom)+';']; }
  function insBti025() {
    if (!b25) return [];
    if (version === 'V3') {
      const cols = V3_BTI025_COLS.join(', ');
      const vals = [q(b25.nom),q(b25.version),q(b25.descrip),q(b25.nativo),sg_fmtDate(b25.fecha,'V3'),q(b25.nomint),q(b25.estado),b25.tipo,q(b25.namespace)].join(', ');
      return ['INSERT INTO BTI025 ('+cols+') VALUES('+vals+');'];
    }
    const cols = V4_BTI025_COLS.join(', ');
    const dsc = b25.descrip ? q(b25.descrip) : "' '";
    const vals = [q(b25.nom),q(b25.version),q(b25.nomint),q(b25.estado),b25.tipo,q(b25.namespace),sg_fmtDate(b25.fecha,'V4'),dsc,q(b25.nativo)].join(', ');
    return ['INSERT INTO BTI025 ('+cols+') VALUES('+vals+');'];
  }
  function insBti026() {
    if (!b26.length) return [];
    if (version === 'V3') {
      const cols = V3_BTI026_COLS.join(', ');
      return b26.map(function(e) { return 'INSERT INTO BTI026 ('+cols+') VALUES('+[q(nom),q(e.elemnom),q(e.elemtipo),sg_nq(e.elemlargo),q(e.elemcat),q(e.elemdsc),q(e.elemsdt)].join(', ')+');'; });
    }
    const cols = V4_BTI026_COLS.join(', ');
    return b26.map(function(e) {
      const dsc = e.elemdsc ? q(e.elemdsc) : "' '", sdt = e.elemsdt ? q(e.elemsdt) : "' '";
      return 'INSERT INTO BTI026 ('+cols+') VALUES('+[q(nom),q(e.elemnom),q(e.elemtipo),sg_nq(e.elemlargo),sg_nq(e.elemdeci),q(e.elemcat),dsc,sdt].join(', ')+');';
    });
  }
  if (mode === 'delete') { lines.push(...delBti025(), '', ...delBti026()); }
  else if (mode === 'insert') { lines.push(...insBti025(), '', ...insBti026()); }
  else { lines.push(...delBti025(), ...insBti025(), '', ...delBti026(), ...insBti026()); }
  return lines.join('\n');
}

module.exports = {
  sg_generateScript,
  sg_generateSdtScript,
  sg_extractSdtNames,
  sg_sq,
  sg_nq,
  sg_fmtDate,
  V3_BTI004_COLS, V3_BTI014_COLS, V4_BTI014_COLS,
  V3_BTI019_COLS, V4_BTI019_COLS,
  V3_BTI025_COLS, V4_BTI025_COLS,
  V3_BTI026_COLS, V4_BTI026_COLS,
  SG_SDT_EXCLUDE,
};
