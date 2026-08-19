'use strict';

const crypto = require('crypto');

// Columnas de tablas BTI para V3 (SQL Server) y V4 (Oracle)
const V3_BTI004_COLS = ['BTINom','BTISrvNom','BTISrvVer','BTISrvDsc','BTISrvNSBT','BTISrvCanNSBT','BTISrvOpNSBT','BTISrvVarNSBT','BTISrvPgmName','BTISrvStatus','BTISrvFPath'];
const V3_BTI014_COLS = ['BTINom','BTISrvNom','BTISrvVer','BTIMtdNom','BTIMtdDsc','BTIMtdNSBT','BTIMtdPgmNom','BTIMtdPgmMtd','BTIMtdStatus','BTIMtdFPath','BTIMtdEnbTra','BTIMtdEsPgGx'];
const V4_BTI014_COLS = ['BTINOM','BTISRVNOM','BTISRVVER','BTIMTDNOM','BTIMTDDSC','BTIMTDNSBT','BTIMTDPGMNOM','BTIMTDPGMMTD','BTIMTDSTATUS','BTIMTDFPATH','BTIMTDENBTRA','BTIMTDESPGGX'];
const V3_BTI019_COLS = ['BTINom','BTISrvNom','BTISrvVer','BTIMtdNom','BTISrvParPosi','BTISrvParNom','BTISrvParNomJava','BTISrvParDir','BTISrvVarTipo','BTISrvParItTipo','BTISrvParValor','BTISrvSDTVer','BTISrvCat','BTISrvCatIt','BTISrvParLargo','BTISrvParLVal','BTISrvParItNom','BTISRVPARDECI'];
const V4_BTI019_COLS = ['BTINOM','BTISRVNOM','BTISRVVER','BTIMTDNOM','BTISRVPARPOSI','BTISRVPARNOM','BTISRVPARNOMJAVA','BTISRVPARDIR','BTISRVVARTIPO','BTISRVPARITTIPO','BTISRVPARVALOR','BTISRVCATIT','BTISRVCAT','BTISRVSDTVER','BTISRVPARLARGO','BTISRVPARLVAL','BTISRVPARITNOM','BTISRVPARDECI','BTISRVPARDSC'];
// BTI012: habilitacion por canal de cada metodo (API Publica, V3 y V4).
// Sin al menos una fila aca el metodo no queda expuesto por ningun canal,
// aunque BTI014/019 esten completos (equivalente a BTCBS012 en interna).
const V3_BTI012_COLS = ['BTICanNom','BTINom','BTISrvNom','BTISrvVer','BTIMtdNom','BTISrvHab'];
const V4_BTI012_COLS = ['BTICANNOM','BTINOM','BTISRVNOM','BTISRVVER','BTIMTDNOM','BTISRVHAB'];
const V3_BTI025_COLS = ['BTISDTNom','BTISDTVersion','BTISDTDescrip','BTISDTNativo','BTISDTFecha','BTISDTNomInt','BTISDTEstado','BTISDTTipo','BTISDTNameSpace'];
const V4_BTI025_COLS = ['BTISDTNOM','BTISDTVERSION','BTISDTNOMINT','BTISDTESTADO','BTISDTTIPO','BTISDTNAMESPACE','BTISDTFECHA','BTISDTDESCRIP','BTISDTNATIVO'];
const V3_BTI026_COLS = ['BTISDTNom','BTISDTElemNom','BTISDTElemTipo','BTISDTElemLargo','BTISDTElemCat','BTISDTElemDsc','BTISDTElemSDT','BTISDTElemPosi'];
const V4_BTI026_COLS = ['BTISDTNOM','BTISDTVERSION','BTISDTELEMNOM','BTISDTELEMNINT','BTISDTELEMOBL','BTISDTELEMCAT','BTISDTELEMTIPO','BTISDTELEMSDT','BTISDTELEMSDTVE','BTISDTELEMPLANO','BTISDTELEMLARGO','BTISDTELEMENU','BTISDTELEMVAL','BTISDTELEMDSC','BTISDTELEMPOSI','BTISDTELEMCATIT','BTISDTELEMDECI','BTISDTELEMNOMIT'];

// Columnas de las tablas BTCBS (API Interna, Oracle). Mismo dominio que las
// BTI de arriba pero con nombres de tabla/columna propios y algunos tipos
// numericos donde V4 usaba CHAR 'S'/'N' (ver sn_num). BSPARENUM/BSPARDFVAL
// (BTCBS019) y una tabla a nivel de servicio (equivalente a BTI004) no
// existen / no se completan: BTI004 tampoco se toca para V4, solo para V3.
const INTERNA_BTCBS014_COLS = ['BSINTNAME','BSSRVNAME','BSSRVVER','BSMTDNAME','BSMTDDESC','BSMTDNSBT','BSMTDPRG','BSPRGENTPO','BSMTDSTAT','BSMTDPATH','BSMTDTRACE','BSMTDGXPRG','BSMTDUUID'];
// BTCBS012: habilitacion por canal de cada metodo. Sin al menos una fila
// aca el metodo no queda expuesto por ningun canal, aunque BTCBS014/019
// esten completos (ver sg_extractChannelWarnings).
const INTERNA_BTCBS012_COLS = ['BSCHNNAME','BSINTNAME','BSSRVNAME','BSSRVVER','BSMTDNAME','BSSRVENAB'];
const INTERNA_BTCBS019_COLS = ['BSINTNAME','BSSRVNAME','BSSRVVER','BSMTDNAME','BSPARPOS','BSPARNAME','BSPARINTNM','BSPARDIR','BSPARTYPE','BSPARITTYP','BSPARITCAT','BSPARITNAM','BSPARCAT','BSPARSDTVE','BSPARLEN','BSPARDECI'];
const INTERNA_BTCBS025_COLS = ['BSSDTNAME','BSSDTVER','BSSDTDESC','BSSDTNATIV','BSSDTDATE','BSSDTINTNM','BSSDTSTAT','BSSDTTYPE','BSSDTNMSP'];
const INTERNA_BTCBS026_COLS = ['BSSDTNAME','BSSDTVER','BSELMNAME','BSELMPOS','BSELMDESC','BSELMINTNM','BSELMISREQ','BSELMCAT','BSEIMITCAT','BSELMITNAM','BSELMTYPE','BSELMSDTNM','BSELMSDTVE','BSELMFLAT','BSELMLEN','BSELMDECI','BSELMENUM','BSELMVALS']; // BSEIMITCAT: typo de origen, la tabla real esta creada asi

// 'S'/'N' (o vacio) -> 1/0, para las columnas que en BTCBS son NUMBER(1,0)
// y en BTI eran CHAR.
function sn_num(val) { return String(val == null ? '' : val).trim().toUpperCase() === 'S' ? 1 : 0; }

// Prefijo por el que se filtra el listado de servicios: en las BTI los
// nombres arrancan con BT (V3) o Public (V4). En las BTCBS (API Interna) no
// hay prefijo, asi que no se filtra: aplicarles 'Public%' devolvia 0 filas.
function sg_serviceNamePrefix(version, apiMode) {
  if (apiMode === 'interna') return null;
  return version === 'V3' ? 'BT' : 'Public';
}

// SELECT del listado de servicios (paso "de que servicios querés generar
// scripts"). Devuelve el SQL Oracle ya armado + los binds, para que el
// filtro por prefijo sea testeable sin base de datos.
function sg_serviceListQuery(version, apiMode) {
  const interna = apiMode === 'interna';
  const col = interna ? 'BSSRVNAME' : 'BTISRVNOM';
  const table = interna ? 'BTCBS014' : 'BTI014';
  const prefix = sg_serviceNamePrefix(version, apiMode);
  const where = prefix ? ' WHERE ' + col + ' LIKE :1' : '';
  return {
    col: col,
    sql: 'SELECT DISTINCT ' + col + ' FROM ' + table + where + ' ORDER BY ' + col,
    binds: prefix ? [prefix + '%'] : [],
  };
}

// Texto de una celda de la base. No todo lo que devuelve el driver es un
// string: los CLOB vienen como objeto Lob, los RAW como Buffer. String(obj)
// daba '[object Object]' metido dentro del script generado, asi que todo lo
// que no sea primitivo se trata como vacio.
function sg_cellText(val, empty) {
  const e = empty === undefined ? '' : empty;
  if (val == null) return e;
  const t = typeof val;
  if (t === 'object' || t === 'function' || t === 'symbol') return e;
  return String(val);
}

// Header y metodo llegan directo de la base y se interpolan a mano en varios
// lugares (DELETEs, INSERT de BTI014). Se normalizan a texto una sola vez,
// asi ningun tipo raro del driver puede filtrarse al SQL generado.
const SG_METHOD_FIELDS = ['dsc','nsbt','pgmnom','pgmmtd','status','fpath','enbtra','espggx'];

function sg_normalizeHeader(h) {
  const src = h || {};
  return {
    BTINom:        sg_cellText(src.BTINom) || 'BTSERVICES',
    BTISrvNom:     sg_cellText(src.BTISrvNom),
    BTISrvVer:     sg_cellText(src.BTISrvVer) || '1',
    BTIMtdNom:     sg_cellText(src.BTIMtdNom),
    BTISrvDsc:     sg_cellText(src.BTISrvDsc),
    BTISrvPgmName: sg_cellText(src.BTISrvPgmName),
  };
}

function sg_normalizeMethod(m) {
  const src = (m && typeof m === 'object') ? m : {};
  const out = {};
  SG_METHOD_FIELDS.forEach(function(k) { out[k] = sg_cellText(src[k]); });
  return out;
}

function btcbs_fmtDate(val) {
  if (!val) return 'NULL';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return 'NULL';
  const p = (n, z) => String(n).padStart(z || 2, '0');
  const s = d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
  return "TO_DATE('"+s+"','YYYY-MM-DD HH24:MI:SS')";
}

// Quoting Oracle-only (BTCBS es Oracle siempre), mismo criterio que sg_sq
// para V4: ' ' si esta vacio y no es nullable, NULL si es nullable y vacio.
function btcbs_sq(val, nullable) {
  const s = sg_cellText(val);
  if (nullable && s.trim() === '') return 'NULL';
  return s.trim() === '' ? "' '" : "'" + s.replace(/'/g, "''") + "'";
}

function sg_fmtDate(val, ver) {
  if (!val) return ver === 'V3' ? "''" : 'NULL';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return ver === 'V3' ? "''" : 'NULL';
  const p = (n, z) => String(n).padStart(z || 2, '0');
  const s = d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
  return ver === 'V3' ? "'"+s+".000'" : "TIMESTAMP '"+s+".000000'";
}

const SG_SDT_EXCLUDE = new Set(['SdtsBTBusinessError']);

// Prefijo de tipo estructurado (SDT): en API publica (BTI) siempre es 'Sdt'.
// En API interna (BTCBS) el tipo real no lleva ese prefijo, va directo como
// 'sBT<Nombre>' (confirmado contra la documentacion real, ver
// scripts/validar-doc/index.test.js: sBTProductosDepositoAPlazo, sBTSimulacion).
function sg_isSdtType(name, apiMode) {
  if (!name) return false;
  const n = name.trim();
  if (n.startsWith('Sdt')) return true;
  if (apiMode === 'interna' && n.startsWith('sBT')) return true;
  return false;
}

function sg_extractSdtNames(params, apiMode) {
  const names = new Set();
  for (var i = 0; i < params.length; i++) {
    const p = params[i];
    if (p.tipo && sg_isSdtType(p.tipo, apiMode) && !SG_SDT_EXCLUDE.has(p.tipo.trim())) names.add(p.tipo.trim());
    if (p.ittipo && sg_isSdtType(p.ittipo, apiMode) && !SG_SDT_EXCLUDE.has(p.ittipo.trim())) names.add(p.ittipo.trim());
  }
  return [...names];
}

function sg_sq(val, ver, nullable) {
  const s = sg_cellText(val);
  if (nullable && s.trim() === '') return 'NULL';
  const esc = s.replace(/'/g, "''");
  if (ver === 'V3') return "N'" + esc + "'";
  return s.trim() === '' ? "' '" : "'" + esc + "'";
}
function sg_nq(val) { const n = parseInt(String(val == null ? '0' : val).trim(), 10); return isNaN(n) ? '0' : String(n); }

// Genera el bloque BTCBS014/BTCBS019 (API Interna) equivalente al que
// sg_generateScript arma para BTI014/BTI019 en V4. Se usa aparte porque el
// mapeo de columnas y tipos es distinto (ver INTERNA_BTCBS0xx_COLS arriba).
function btcbs_generateScript(data, mode) {
  const h = sg_normalizeHeader(data.header), m = sg_normalizeMethod(data.method), ps = data.params || [], chs = data.channels || [], lines = [];
  const BTINom = h.BTINom, BTISrvNom = h.BTISrvNom, BTISrvVer = h.BTISrvVer, BTIMtdNom = h.BTIMtdNom;
  const q = (v, nullable) => btcbs_sq(v, nullable);
  function delBtcbs014() { return ["DELETE FROM BTCBS014 WHERE BSINTNAME="+q(BTINom)+" AND BSSRVNAME="+q(BTISrvNom)+" AND BSMTDNAME="+q(BTIMtdNom)+";"]; }
  function delBtcbs019() { return ["DELETE FROM BTCBS019 WHERE BSINTNAME="+q(BTINom)+" AND BSSRVNAME="+q(BTISrvNom)+" AND BSMTDNAME="+q(BTIMtdNom)+";"]; }
  function delBtcbs012() { return ["DELETE FROM BTCBS012 WHERE BSSRVNAME="+q(BTISrvNom)+" AND BSSRVVER="+q(BTISrvVer)+" AND BSMTDNAME="+q(BTIMtdNom)+";"]; }
  function insBtcbs014() {
    const status=(m.status||'Validado').padEnd(20).slice(0,20);
    const cols = INTERNA_BTCBS014_COLS.join(', ');
    const vals = [q(BTINom),q(BTISrvNom),q(BTISrvVer),q(BTIMtdNom),q(m.dsc||'',true),sn_num(m.nsbt),q(m.pgmnom||''),q(m.pgmmtd||'execute'),q(status),"' '",sn_num(m.enbtra||'N'),sn_num(m.espggx||'S'),q(crypto.randomUUID().toUpperCase())].join(', ');
    return ['INSERT INTO BTCBS014 ('+cols+') VALUES('+vals+');'];
  }
  function insBtcbs019() {
    const cols = INTERNA_BTCBS019_COLS.join(', ');
    return ps.map(function(p,i) {
      const posi=i+1, largo=sg_nq(p.largo), deci=sg_nq(p.deci);
      const vals=[q(BTINom),q(BTISrvNom),q(BTISrvVer),q(BTIMtdNom),posi,q(p.nom),q(p.nomjava),q(p.dir),q(p.tipo),q(p.ittipo),q(p.catit),q(p.itnom),q(p.cat),q(p.sdtver),largo,deci].join(', ');
      return 'INSERT INTO BTCBS019 ('+cols+') VALUES('+vals+');';
    });
  }
  function insBtcbs012() {
    const cols = INTERNA_BTCBS012_COLS.join(', ');
    return chs.map(function(c) {
      const vals=[q(c.chnname||''),q(BTINom),q(BTISrvNom),q(BTISrvVer),q(BTIMtdNom),sn_num(c.srvenab)].join(', ');
      return 'INSERT INTO BTCBS012 ('+cols+') VALUES('+vals+');';
    });
  }
  if(mode==='delete'){lines.push(...delBtcbs012(),'', ...delBtcbs014(),'', ...delBtcbs019());}
  else if(mode==='insert'){lines.push(...insBtcbs012(),'', ...insBtcbs014(),'', ...insBtcbs019());}
  else{lines.push(...delBtcbs012(),...insBtcbs012(),'', ...delBtcbs014(),...insBtcbs014(),'', ...delBtcbs019(),...insBtcbs019());}
  return lines.join('\n');
}

// Genera UPDATE (+ INSERT solo de filas nuevas, + DELETE solo de las que
// sobran) para los parametros de un metodo, en vez del DELETE+INSERT total
// que arma btcbs_generateScript. Usado por editar-parametria: como esa UI no
// permite reordenar, cada posicion 1..oldCount ya identifica una fila real
// existente en la base, y sobreescribirla con UPDATE es mas quirurgico que
// borrar todo y reinsertar (menos ruido en triggers/auditoria de BTCBS019).
//   i = 1..min(oldCount,newCount): UPDATE (la fila ya existia en esa posicion)
//   i = oldCount+1..newCount:      INSERT (fila nueva, se agrego al final)
//   i = newCount+1..oldCount:      DELETE (fila removida, sobra en la base)
function btcbs_generateParamsUpdateScript(data, oldCount) {
  const h = sg_normalizeHeader(data.header), ps = data.params || [], lines = [];
  const BTINom = h.BTINom, BTISrvNom = h.BTISrvNom, BTISrvVer = h.BTISrvVer, BTIMtdNom = h.BTIMtdNom;
  const q = (v, nullable) => btcbs_sq(v, nullable);
  const newCount = ps.length;
  const whereRow = (posi) => 'BSINTNAME='+q(BTINom)+' AND BSSRVNAME='+q(BTISrvNom)+' AND BSSRVVER='+q(BTISrvVer)+' AND BSMTDNAME='+q(BTIMtdNom)+' AND BSPARPOS='+posi;

  for (let i = 0; i < Math.min(oldCount, newCount); i++) {
    const p = ps[i];
    const sets = [
      'BSPARNAME='+q(p.nom), 'BSPARINTNM='+q(p.nomjava), 'BSPARDIR='+q(p.dir), 'BSPARTYPE='+q(p.tipo),
      'BSPARITTYP='+q(p.ittipo), 'BSPARITCAT='+q(p.catit), 'BSPARITNAM='+q(p.itnom), 'BSPARCAT='+q(p.cat),
      'BSPARSDTVE='+q(p.sdtver), 'BSPARLEN='+sg_nq(p.largo), 'BSPARDECI='+sg_nq(p.deci),
    ].join(', ');
    lines.push('UPDATE BTCBS019 SET '+sets+' WHERE '+whereRow(i+1)+';');
  }
  if (newCount > oldCount) {
    const cols = INTERNA_BTCBS019_COLS.join(', ');
    for (let i = oldCount; i < newCount; i++) {
      const p = ps[i], posi = i+1;
      const vals = [q(BTINom),q(BTISrvNom),q(BTISrvVer),q(BTIMtdNom),posi,q(p.nom),q(p.nomjava),q(p.dir),q(p.tipo),q(p.ittipo),q(p.catit),q(p.itnom),q(p.cat),q(p.sdtver),sg_nq(p.largo),sg_nq(p.deci)].join(', ');
      lines.push('INSERT INTO BTCBS019 ('+cols+') VALUES('+vals+');');
    }
  } else if (oldCount > newCount) {
    lines.push('DELETE FROM BTCBS019 WHERE BSINTNAME='+q(BTINom)+' AND BSSRVNAME='+q(BTISrvNom)+' AND BSSRVVER='+q(BTISrvVer)+' AND BSMTDNAME='+q(BTIMtdNom)+' AND BSPARPOS > '+newCount+';');
  }
  return lines.join('\n');
}

// Equivalente de btcbs_generateParamsUpdateScript para BTI019 (API Publica,
// V3 SQL Server / V4 Oracle).
function sg_generateParamsUpdateScript(data, oldCount) {
  const ver = data.version, apiMode = data.apiMode || 'publica';
  if (ver === 'V4' && apiMode === 'interna') return btcbs_generateParamsUpdateScript(data, oldCount);
  const h = sg_normalizeHeader(data.header), ps = data.params || [], lines = [];
  const BTINom = h.BTINom, BTISrvNom = h.BTISrvNom, BTISrvVer = h.BTISrvVer, BTIMtdNom = h.BTIMtdNom;
  const q = (v) => sg_sq(v, ver);
  const newCount = ps.length;
  const nomCol = ver==='V3'?'BTINom':'BTINOM', svcCol = ver==='V3'?'BTISrvNom':'BTISRVNOM', verCol = ver==='V3'?'BTISrvVer':'BTISRVVER', mtdCol = ver==='V3'?'BTIMtdNom':'BTIMTDNOM', posiCol = ver==='V3'?'BTISrvParPosi':'BTISRVPARPOSI';
  const whereRow = (posi) => nomCol+'='+q(BTINom)+' AND '+svcCol+'='+q(BTISrvNom)+' AND '+verCol+'='+q(BTISrvVer)+' AND '+mtdCol+'='+q(BTIMtdNom)+' AND '+posiCol+'='+posi;

  function setClause(p) {
    const largo = sg_nq(p.largo), deci = sg_nq(p.deci);
    if (ver === 'V3') {
      return [
        'BTISrvParNom='+q(p.nom), 'BTISrvParNomJava='+q(p.nomjava), 'BTISrvParDir='+q(p.dir), 'BTISrvVarTipo='+q(p.tipo),
        'BTISrvParItTipo='+q(p.ittipo), 'BTISrvParValor='+q(p.valor), 'BTISrvSDTVer='+q(p.sdtver), 'BTISrvCat='+q(p.cat),
        'BTISrvCatIt='+q(p.catit), 'BTISrvParLargo='+largo, 'BTISrvParLVal='+q(p.lval), 'BTISrvParItNom='+q(p.itnom), 'BTISRVPARDECI='+deci,
      ].join(', ');
    }
    return [
      'BTISRVPARNOM='+q(p.nom), 'BTISRVPARNOMJAVA='+q(p.nomjava), 'BTISRVPARDIR='+q(p.dir), 'BTISRVVARTIPO='+q(p.tipo),
      'BTISRVPARITTIPO='+q(p.ittipo), 'BTISRVPARVALOR='+q(p.valor), 'BTISRVCATIT='+q(p.catit), 'BTISRVCAT='+q(p.cat),
      'BTISRVSDTVER='+q(p.sdtver), 'BTISRVPARLARGO='+largo, 'BTISRVPARLVAL='+q(p.lval), 'BTISRVPARITNOM='+q(p.itnom), 'BTISRVPARDECI='+deci, 'BTISRVPARDSC='+sg_sq(p.dsc, ver, true),
    ].join(', ');
  }

  for (let i = 0; i < Math.min(oldCount, newCount); i++) {
    lines.push('UPDATE BTI019 SET '+setClause(ps[i])+' WHERE '+whereRow(i+1)+';');
  }
  if (newCount > oldCount) {
    const cols = (ver==='V3'?V3_BTI019_COLS:V4_BTI019_COLS).join(', ');
    for (let i = oldCount; i < newCount; i++) {
      const p = ps[i], posi = i+1, largo = sg_nq(p.largo), deci = sg_nq(p.deci);
      var vals;
      if (ver === 'V3') vals=[q(BTINom),q(BTISrvNom),q(BTISrvVer),q(BTIMtdNom),posi,q(p.nom),q(p.nomjava),q(p.dir),q(p.tipo),q(p.ittipo),q(p.valor),q(p.sdtver),q(p.cat),q(p.catit),largo,q(p.lval),q(p.itnom),deci].join(', ');
      else vals=[q(BTINom),q(BTISrvNom),q(BTISrvVer),q(BTIMtdNom),posi,q(p.nom),q(p.nomjava),q(p.dir),q(p.tipo),q(p.ittipo),q(p.valor),q(p.catit),q(p.cat),q(p.sdtver),largo,q(p.lval),q(p.itnom),deci,sg_sq(p.dsc,ver,true)].join(', ');
      lines.push('INSERT INTO BTI019 ('+cols+') VALUES('+vals+');');
    }
  } else if (oldCount > newCount) {
    lines.push('DELETE FROM BTI019 WHERE '+nomCol+'='+q(BTINom)+' AND '+svcCol+'='+q(BTISrvNom)+' AND '+verCol+'='+q(BTISrvVer)+' AND '+mtdCol+'='+q(BTIMtdNom)+' AND '+posiCol+' > '+newCount+';');
  }
  return lines.join('\n');
}

function sg_generateScript(data, mode) {
  const ver = data.version, apiMode = data.apiMode || 'publica';
  if (ver === 'V4' && apiMode === 'interna') return btcbs_generateScript(data, mode);
  const h = sg_normalizeHeader(data.header), m = sg_normalizeMethod(data.method), ps = data.params || [], chs = data.channels || [], lines = [];
  const BTINom = h.BTINom, BTISrvNom = h.BTISrvNom, BTISrvVer = h.BTISrvVer, BTIMtdNom = h.BTIMtdNom;
  const q = (v) => sg_sq(v, ver);
  function delBti019() { return["DELETE FROM BTI019 WHERE "+(ver==='V3'?'BTINom':'BTINOM')+"="+q(BTINom)+" AND "+(ver==='V3'?'BTISrvNom':'BTISRVNOM')+"="+q(BTISrvNom)+" AND "+(ver==='V3'?'BTIMtdNom':'BTIMTDNOM')+"="+q(BTIMtdNom)+";"]; }
  function delBti014() { return["DELETE FROM BTI014 WHERE "+(ver==='V3'?'BTINom':'BTINOM')+"="+q(BTINom)+" AND "+(ver==='V3'?'BTISrvNom':'BTISRVNOM')+"="+q(BTISrvNom)+" AND "+(ver==='V3'?'BTIMtdNom':'BTIMTDNOM')+"="+q(BTIMtdNom)+";"]; }
  function delBti004() { return["DELETE FROM BTI004 WHERE BTINom="+q(BTINom)+" AND BTISrvNom="+q(BTISrvNom)+";"]; }
  function delBti012() { return["DELETE FROM BTI012 WHERE "+(ver==='V3'?'BTINom':'BTINOM')+"="+q(BTINom)+" AND "+(ver==='V3'?'BTISrvNom':'BTISRVNOM')+"="+q(BTISrvNom)+" AND "+(ver==='V3'?'BTISrvVer':'BTISRVVER')+"="+q(BTISrvVer)+" AND "+(ver==='V3'?'BTIMtdNom':'BTIMTDNOM')+"="+q(BTIMtdNom)+";"]; }
  function insBti012() {
    // BTISrvHab es nullable (a diferencia de BSSRVENAB en BTCBS012, que es
    // NUMBER NOT NULL): si el origen no tiene valor, se preserva como NULL
    // en vez de inventar un default.
    const cols=(ver==='V3'?V3_BTI012_COLS:V4_BTI012_COLS).join(', ');
    return chs.map(function(c) {
      const vals=[q(c.chnname||''),q(BTINom),q(BTISrvNom),q(BTISrvVer),q(BTIMtdNom),sg_sq(c.srvenab,ver,true)].join(', ');
      return 'INSERT INTO BTI012 ('+cols+') VALUES('+vals+');';
    });
  }
  function insBti004() { const cols=V3_BTI004_COLS.join(', '),dsc=h.BTISrvDsc||'',pgm=(h.BTISrvPgmName||'').trim()||' '; return['INSERT INTO BTI004 ('+cols+') VALUES('+q(BTINom)+', '+q(BTISrvNom)+', '+q(BTISrvVer)+', '+q(dsc)+", N' ', 0, 0, 0, "+q(pgm)+", N'                    ', N' ');"]; }
  function insBti014() {
    const status=(m.status||'Validado').padEnd(20).slice(0,20), enbtra=m.enbtra||'N', enbtraV=enbtra==='NULL'?'NULL':(ver==='V3'?"N'"+enbtra+"'":"'"+enbtra+"'");
    if(ver==='V3'){const cols=V3_BTI014_COLS.join(', ');return['INSERT INTO BTI014 ('+cols+') VALUES('+q(BTINom)+', '+q(BTISrvNom)+', '+q(BTISrvVer)+', '+q(BTIMtdNom)+', '+q(m.dsc||'')+', '+q(m.nsbt||' ')+', '+q(m.pgmnom||'')+', '+q(m.pgmmtd||'execute')+', '+q(status)+', '+q(m.fpath||'')+', '+enbtraV+', '+q(m.espggx||'S')+');'];}
    const cols=V4_BTI014_COLS.join(', ');
    return['INSERT INTO BTI014 ('+cols+') VALUES('+q(BTINom)+', '+q(BTISrvNom)+', '+q(BTISrvVer)+', '+q(BTIMtdNom)+', '+q(m.dsc||'')+', '+q(m.nsbt||' ')+', '+q(m.pgmnom||'')+', '+q(m.pgmmtd||'execute')+', '+q(status)+", ' ', "+enbtraV+', '+q(m.espggx||'S')+');'];
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
  if(mode==='delete'){if(ver==='V3')lines.push(...delBti004(),''); lines.push(...delBti012(),'', ...delBti014(),'', ...delBti019());}
  else if(mode==='insert'){if(ver==='V3')lines.push(...insBti004(),''); lines.push(...insBti012(),'', ...insBti014(),'', ...insBti019());}
  else{if(ver==='V3')lines.push(...delBti004(),...insBti004(),''); lines.push(...delBti012(),...insBti012(),'', ...delBti014(),...insBti014(),'', ...delBti019(),...insBti019());}
  return lines.join('\n');
}

// Genera el bloque BTCBS025/BTCBS026 (API Interna) equivalente al que
// sg_generateSdtScript arma para BTI025/BTI026 en V4.
function btcbs_generateSdtScript(sdt, mode) {
  const lines = [], nom = sdt.nom || '', b25 = sdt.bti025, b26 = sdt.bti026 || [];
  const q = function(v, nullable) { return btcbs_sq(v, nullable); };
  function delBtcbs025() { return ['DELETE FROM BTCBS025 WHERE BSSDTNAME='+q(nom)+';']; }
  function delBtcbs026() { return ['DELETE FROM BTCBS026 WHERE BSSDTNAME='+q(nom)+';']; }
  function insBtcbs025() {
    if (!b25) return [];
    const cols = INTERNA_BTCBS025_COLS.join(', ');
    const dsc = b25.descrip ? q(b25.descrip) : "' '";
    const vals = [q(b25.nom),q(b25.version),dsc,sn_num(b25.nativo),btcbs_fmtDate(b25.fecha),q(b25.nomint),q(b25.estado),sg_nq(b25.tipo),q(b25.namespace)].join(', ');
    return ['INSERT INTO BTCBS025 ('+cols+') VALUES('+vals+');'];
  }
  function insBtcbs026() {
    if (!b26.length) return [];
    const cols = INTERNA_BTCBS026_COLS.join(', ');
    return b26.map(function(e) {
      const dsc = e.elemdsc ? q(e.elemdsc) : "' '";
      const sdtNm = e.elemsdt ? q(e.elemsdt) : "' '";
      const sdtve = e.sdtve ? q(e.sdtve) : "' '";
      const plano = e.plano ? q(e.plano) : "' '";
      const enu = e.enu ? q(e.enu) : "' '";
      const val = e.val ? q(e.val) : "' '";
      const catit = e.catit ? q(e.catit) : "' '";
      const nomit = e.nomit ? q(e.nomit) : "' '";
      return 'INSERT INTO BTCBS026 ('+cols+') VALUES('+[q(nom),q(e.version||'1'),q(e.elemnom),sg_nq(e.posi),dsc,q(e.nint||''),sn_num(e.obl||'N'),q(e.elemcat),catit,nomit,q(e.elemtipo),sdtNm,sdtve,plano,sg_nq(e.elemlargo),sg_nq(e.elemdeci),enu,val].join(', ')+');';
    });
  }
  if (mode === 'delete') { lines.push(...delBtcbs025(), '', ...delBtcbs026()); }
  else if (mode === 'insert') { lines.push(...insBtcbs025(), '', ...insBtcbs026()); }
  else { lines.push(...delBtcbs025(), ...insBtcbs025(), '', ...delBtcbs026(), ...insBtcbs026()); }
  return lines.join('\n');
}

function sg_generateSdtScript(sdt, mode, version, apiMode) {
  if (version === 'V4' && apiMode === 'interna') return btcbs_generateSdtScript(sdt, mode);
  const lines = [], nom = sdt.nom || '', b25 = sdt.bti025, b26 = sdt.bti026 || [];
  const q = function(v) { return sg_sq(v, version); };
  const nomCol = version === 'V3' ? 'BTISDTNom' : 'BTISDTNOM';
  function delBti025() { return ['DELETE FROM BTI025 WHERE '+nomCol+'='+q(nom)+';']; }
  function delBti026() { return ['DELETE FROM BTI026 WHERE '+nomCol+'='+q(nom)+';']; }
  function insBti025() {
    if (!b25) return [];
    if (version === 'V3') {
      const cols = V3_BTI025_COLS.join(', ');
      const vals = [q(b25.nom),q(b25.version),q(b25.descrip),q(b25.nativo),sg_fmtDate(b25.fecha,'V3'),q(b25.nomint),q(b25.estado),sg_nq(b25.tipo),q(b25.namespace)].join(', ');
      return ['INSERT INTO BTI025 ('+cols+') VALUES('+vals+');'];
    }
    const cols = V4_BTI025_COLS.join(', ');
    const dsc = b25.descrip ? q(b25.descrip) : "' '";
    const vals = [q(b25.nom),q(b25.version),q(b25.nomint),q(b25.estado),sg_nq(b25.tipo),q(b25.namespace),sg_fmtDate(b25.fecha,'V4'),dsc,q(b25.nativo)].join(', ');
    return ['INSERT INTO BTI025 ('+cols+') VALUES('+vals+');'];
  }
  function insBti026() {
    if (!b26.length) return [];
    if (version === 'V3') {
      const cols = V3_BTI026_COLS.join(', ');
      return b26.map(function(e) { return 'INSERT INTO BTI026 ('+cols+') VALUES('+[q(nom),q(e.elemnom),q(e.elemtipo),sg_nq(e.elemlargo),q(e.elemcat),q(e.elemdsc),q(e.elemsdt),sg_nq(e.posi)].join(', ')+');'; });
    }
    const cols = V4_BTI026_COLS.join(', ');
    return b26.map(function(e) {
      const dsc = e.elemdsc ? q(e.elemdsc) : "' '";
      const sdt = e.elemsdt ? q(e.elemsdt) : "' '";
      const sdtve = e.sdtve ? q(e.sdtve) : "' '";
      const plano = e.plano ? q(e.plano) : "' '";
      const enu = e.enu ? q(e.enu) : "' '";
      const val = e.val ? q(e.val) : "' '";
      const catit = e.catit ? q(e.catit) : "' '";
      const nomit = e.nomit ? q(e.nomit) : "' '";
      return 'INSERT INTO BTI026 ('+cols+') VALUES('+[q(nom),q(e.version||'1'),q(e.elemnom),q(e.nint||''),q(e.obl||'N'),q(e.elemcat),q(e.elemtipo),sdt,sdtve,plano,sg_nq(e.elemlargo),enu,val,dsc,sg_nq(e.posi),catit,sg_nq(e.elemdeci),nomit].join(', ')+');';
    });
  }
  if (mode === 'delete') { lines.push(...delBti025(), '', ...delBti026()); }
  else if (mode === 'insert') { lines.push(...insBti025(), '', ...insBti026()); }
  else { lines.push(...delBti025(), ...insBti025(), '', ...delBti026(), ...insBti026()); }
  return lines.join('\n');
}

// Genera UPDATE (+ DELETE por posicion si se quitan campos) para los campos
// de un SDT YA EXISTENTE, misma filosofia que sg_generateParamsUpdateScript
// para BTI019: la UI que la usa (editar-parametria) no permite reordenar ni
// agregar campos nuevos, asi que la posicion 1..oldCount ya identifica una
// fila real en la base y sobreescribirla con UPDATE es mas quirurgico que
// borrar todo el SDT y reinsertarlo (que es lo que hace sg_generateSdtScript,
// pensado para clonar un SDT entero en "Generar SDT", no para corregir uno
// existente). Solo toca las columnas editables en ese flujo (elemnom,
// elemlargo, elemdeci, elemdsc, nomit) — el resto (tipo, categoria, SDT
// anidado, obligatoriedad, etc.) se preserva tal cual esta.
//   i = 1..min(oldCount,newCount): UPDATE (la fila ya existia en esa posicion)
//   i = newCount+1..oldCount:      DELETE (fila removida, sobra en la base)
function btcbs_generateFieldsUpdateScript(sdt, oldCount) {
  const nom = sdt.nom || '', b26 = sdt.bti026 || [];
  const newCount = b26.length;
  const q = (v, nullable) => btcbs_sq(v, nullable);
  const lines = [];
  for (let i = 0; i < Math.min(oldCount, newCount); i++) {
    const e = b26[i], posi = i + 1;
    const nomit = e.nomit ? q(e.nomit) : "' '";
    const sets = ['BSELMNAME='+q(e.elemnom), 'BSELMLEN='+sg_nq(e.elemlargo), 'BSELMDECI='+sg_nq(e.elemdeci), 'BSELMDESC='+q(e.elemdsc), 'BSELMITNAM='+nomit].join(', ');
    lines.push('UPDATE BTCBS026 SET '+sets+' WHERE BSSDTNAME='+q(nom)+' AND BSELMPOS='+posi+';');
  }
  if (oldCount > newCount) {
    lines.push('DELETE FROM BTCBS026 WHERE BSSDTNAME='+q(nom)+' AND BSELMPOS > '+newCount+';');
  }
  return lines.join('\n');
}

function sg_generateFieldsUpdateScript(sdt, oldCount, version, apiMode) {
  if (version === 'V4' && apiMode === 'interna') return btcbs_generateFieldsUpdateScript(sdt, oldCount);
  const nom = sdt.nom || '', b26 = sdt.bti026 || [];
  const newCount = b26.length;
  const q = (v, nullable) => sg_sq(v, version, nullable);
  const nomCol = version === 'V3' ? 'BTISDTNom' : 'BTISDTNOM';
  const posiCol = version === 'V3' ? 'BTISDTElemPosi' : 'BTISDTELEMPOSI';
  const lines = [];
  for (let i = 0; i < Math.min(oldCount, newCount); i++) {
    const e = b26[i], posi = i + 1;
    let sets;
    if (version === 'V3') {
      sets = ['BTISDTElemNom='+q(e.elemnom), 'BTISDTElemLargo='+sg_nq(e.elemlargo), 'BTISDTElemDsc='+q(e.elemdsc)].join(', ');
    } else {
      const nomit = e.nomit ? q(e.nomit) : "' '";
      sets = ['BTISDTELEMNOM='+q(e.elemnom), 'BTISDTELEMLARGO='+sg_nq(e.elemlargo), 'BTISDTELEMDECI='+sg_nq(e.elemdeci), 'BTISDTELEMDSC='+q(e.elemdsc), 'BTISDTELEMNOMIT='+nomit].join(', ');
    }
    lines.push('UPDATE BTI026 SET '+sets+' WHERE '+nomCol+'='+q(nom)+' AND '+posiCol+'='+posi+';');
  }
  if (oldCount > newCount) {
    lines.push('DELETE FROM BTI026 WHERE '+nomCol+'='+q(nom)+' AND '+posiCol+' > '+newCount+';');
  }
  return lines.join('\n');
}

module.exports = {
  sg_generateScript,
  sg_generateParamsUpdateScript,
  sg_generateSdtScript,
  sg_generateFieldsUpdateScript,
  sg_extractSdtNames,
  sg_isSdtType,
  sg_sq,
  sg_nq,
  sg_fmtDate,
  V3_BTI004_COLS, V3_BTI012_COLS, V4_BTI012_COLS, V3_BTI014_COLS, V4_BTI014_COLS,
  V3_BTI019_COLS, V4_BTI019_COLS,
  V3_BTI025_COLS, V4_BTI025_COLS,
  V3_BTI026_COLS, V4_BTI026_COLS,
  INTERNA_BTCBS012_COLS, INTERNA_BTCBS014_COLS, INTERNA_BTCBS019_COLS,
  INTERNA_BTCBS025_COLS, INTERNA_BTCBS026_COLS,
  sn_num, btcbs_sq, btcbs_fmtDate,
  sg_serviceNamePrefix, sg_serviceListQuery, sg_cellText,
  SG_SDT_EXCLUDE,
};
