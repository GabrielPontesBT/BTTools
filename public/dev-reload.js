// Recarga la pagina sola cuando el server avisa (SSE /api/dev-reload) que
// algo cambio adentro de /public. Ver setup.js y scripts/common/dev-reload
// para el lado del server. Si la conexion falla (server sin esta ruta,
// version empaquetada vieja, etc.) el EventSource reintenta solo y como
// mucho no hay auto-reload -- nunca rompe el resto de la app.
(function () {
  try {
    var es = new EventSource('/api/dev-reload');
    es.onmessage = function () {
      location.reload();
    };
  } catch (e) {
    /* sin auto-reload; F5 a mano sigue andando igual */
  }
})();
