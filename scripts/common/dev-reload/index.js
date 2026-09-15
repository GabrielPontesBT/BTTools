'use strict';

// Recarga automatica del navegador cuando cambia un archivo de /public, para
// no tener que apretar F5 a mano mientras se edita index.html/styles.css. El
// server abre esto como SSE (ver setup.js, ruta /api/dev-reload) y
// watchForReload() dispara scheduleReload() en cada cambio del filesystem.
//
// Separado en su propio modulo (services-first) para poder testear el
// broadcast y el debounce sin levantar un http.Server ni tocar el
// filesystem real.

function createReloadBroadcaster(debounceMs) {
  const delay = debounceMs == null ? 150 : debounceMs;
  const clients = new Set();
  let timer = null;

  function add(res) {
    clients.add(res);
  }

  function remove(res) {
    clients.delete(res);
  }

  // Varios eventos de fs.watch (rename + change, o un guardado que toca de
  // paso otro archivo) colapsan en un solo mensaje: sin el debounce cada
  // save dispararia N recargas seguidas y el navegador quedaria recargando
  // en loop mientras el editor todavia esta escribiendo el archivo.
  function scheduleReload() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      for (const res of clients) {
        try {
          res.write('data: reload\n\n');
        } catch (e) {
          clients.delete(res);
        }
      }
    }, delay);
  }

  return { add, remove, scheduleReload, clients };
}

// Conecta fs.watch(dir) al broadcaster. Devuelve el FSWatcher, o null si el
// filesystem no soporta watch recursivo (ej. Linux sin fallback propio): ese
// caso no tiene que tirar abajo el server entero, solo se pierde el
// auto-reload y queda F5 a mano como unica opcion.
function watchForReload(fsMod, dir, broadcaster) {
  try {
    return fsMod.watch(dir, { recursive: true }, () => broadcaster.scheduleReload());
  } catch (e) {
    return null;
  }
}

module.exports = { createReloadBroadcaster, watchForReload };
