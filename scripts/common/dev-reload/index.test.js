const test = require('node:test');
const assert = require('node:assert/strict');
const { createReloadBroadcaster, watchForReload } = require('./index.js');

function fakeRes() {
  return { written: [], write(chunk) { this.written.push(chunk); } };
}

test('scheduleReload manda "reload" a todos los clientes conectados', async () => {
  const b = createReloadBroadcaster(10);
  const r1 = fakeRes();
  const r2 = fakeRes();
  b.add(r1);
  b.add(r2);
  b.scheduleReload();
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(r1.written.length, 1);
  assert.equal(r1.written[0], 'data: reload\n\n');
  assert.equal(r2.written.length, 1);
});

test('varios scheduleReload seguidos colapsan en un solo mensaje (debounce)', async () => {
  const b = createReloadBroadcaster(20);
  const r1 = fakeRes();
  b.add(r1);
  b.scheduleReload();
  b.scheduleReload();
  b.scheduleReload();
  await new Promise((r) => setTimeout(r, 40));
  assert.equal(r1.written.length, 1);
});

test('un cliente desconectado (write que tira) se saca de la lista sin frenar a los demas', async () => {
  const b = createReloadBroadcaster(10);
  const roto = { write() { throw new Error('ECONNRESET'); } };
  const sano = fakeRes();
  b.add(roto);
  b.add(sano);
  b.scheduleReload();
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(sano.written.length, 1);
  assert.equal(b.clients.has(roto), false);
});

test('remove saca un cliente antes de que llegue el proximo broadcast', async () => {
  const b = createReloadBroadcaster(10);
  const r1 = fakeRes();
  b.add(r1);
  b.remove(r1);
  b.scheduleReload();
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(r1.written.length, 0);
});

test('watchForReload no revienta si fs.watch tira (ej. recursive no soportado en Linux)', () => {
  const b = createReloadBroadcaster(10);
  const fakeFs = { watch() { throw new Error('ENOSYS'); } };
  const result = watchForReload(fakeFs, '/algun/dir', b);
  assert.equal(result, null);
});

test('watchForReload dispara scheduleReload en cada evento del watcher', async () => {
  const b = createReloadBroadcaster(10);
  const r1 = fakeRes();
  b.add(r1);
  let capturedCallback;
  const fakeFs = {
    watch(dir, opts, callback) {
      capturedCallback = callback;
      return { close() {} };
    },
  };
  watchForReload(fakeFs, '/public', b);
  capturedCallback('change', 'index.html');
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(r1.written.length, 1);
});
