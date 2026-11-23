import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const CFG = { cameras: [{ name: 'Garten', prefix: 'garten' }], show_hub: false };

test('Gegensprechen vorbereiten: Livebild startet mit stummem Sprechkanal, Mikrofon bleibt aus', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES }, config: { ...CFG, talk_prepare: true }, test: { privatePlayer: true } });
  await wait(600);
  const r = await c.rec();
  assert.deepEqual(r.starts, [true], 'Verbindung mit Sprechkanal');
  assert.equal(r.senderTrack, null, 'nichts wird gesendet');
  const i = await c.info();
  assert.equal(i.live, true);
  assert.equal(i.mic, 'off', 'keine Gegensprech-Anzeige');
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('ohne Option: Verbindung ohne Sprechkanal', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES }, config: CFG, test: { privatePlayer: true } });
  await wait(600);
  assert.deepEqual((await c.rec()).starts, [false]);
  await c.close();
});

test('nicht bei Kameras ohne Zwei-Wege-Audio, auch pro Kamera abschaltbar', async () => {
  let c = await openCard(browser, server, { hass: { states: CAM_STATES, twoWay: false }, config: { ...CFG, talk_prepare: true }, test: { privatePlayer: true } });
  await wait(600);
  assert.deepEqual((await c.rec()).starts, [false]);
  await c.close();
  c = await openCard(browser, server, { hass: { states: CAM_STATES }, config: { ...CFG, cameras: [{ ...CFG.cameras[0], talk_prepare: false }], talk_prepare: true }, test: { privatePlayer: true } });
  await wait(600);
  assert.deepEqual((await c.rec()).starts, [false]);
  await c.close();
});

test('Modus-Zeile ausblenden: SD-Belegung bleibt', async () => {
  const states = { ...CAM_STATES, 'select.reolink_hub_szenenmodus': ['home', { options: ['off', 'disarm', 'home', 'away'] }], 'sensor.reolink_hub_sd_0_speicher': ['42', {}] };
  const look = (c) => c.run(() => { const h = window.__card.shadowRoot.getElementById('hub'); return { scene: h.querySelectorAll('.scene').length, sd: !!h.querySelector('.sd') }; });
  let c = await openCard(browser, server, { hass: { states }, config: { cameras: CFG.cameras } });
  await wait(200);
  const before = await look(c);
  await c.close();
  c = await openCard(browser, server, { hass: { states }, config: { cameras: CFG.cameras, show_mode: false } });
  await wait(200);
  const after = await look(c);
  await c.close();
  assert.equal(before.scene, 1, JSON.stringify(before));
  assert.deepEqual(after, { scene: 0, sd: before.sd });
});
