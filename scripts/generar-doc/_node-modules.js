// Los scripts de esta carpeta viven fuera de V3/ y V4/, pero sus dependencias
// (dotenv, mssql, oracledb, xml2js) estan instaladas en V3/node_modules y
// V4/node_modules respectivamente. Node no las encuentra por resolucion normal
// porque scripts/generar-doc/ no es descendiente de V3/ ni V4/.
// Este helper agrega esa carpeta al path de busqueda del script que lo invoca.
//
// Recibe el `module` del script llamador explicitamente (en vez de usar
// `module.parent`): este helper se cachea la primera vez que se requiere,
// y `module.parent` quedaria fijo en el primer script que lo cargo, dando
// resultados incorrectos cuando otro script (p.ej. todos-v4.js) lo vuelve
// a invocar indirectamente a traves de v4.js.
const path = require('path');

module.exports = function useVersionModules(callerModule, version) {
  callerModule.paths.unshift(path.join(__dirname, '..', '..', version, 'node_modules'));
};
