// ============================================================
// Carpeta donde vive la documentación de un servicio V4: sin el
// prefijo "Public" y en kebab-case. Un solo lugar para esta regla
// para que la generación por método individual, por servicio
// completo y por workflow siempre caigan en la misma carpeta -
// antes cada camino la calculaba por su cuenta y se desincronizaban
// (ver workflow-v4.js, que hasta ahora usaba el nombre del servicio
// tal cual, con el "Public" incluido).
// ============================================================

const toFolderName = s => s
  .replace(/^Public/, '')
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
  .replace(/([a-z\d])([A-Z])/g, '$1-$2');

module.exports = { toFolderName };
