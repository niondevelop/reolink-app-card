import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const img = ['idle', { entity_picture: '/x.jpg' }];
const PTZ = ['left', 'right', 'up', 'down', 'stop', 'zoom_in', 'zoom_out'];
const STATES = {
  'camera.garten_standardauflosung': img, 'camera.eingang_standardauflosung': img,
  'input_boolean.klingel': 'off', 'binary_sensor.garten_besucher': 'off',
  ...Object.fromEntries(PTZ.map((k) => [`button.eingang_ptz_${k}`, 'unknown'])),
  'select.eingang_ptz_preset': ['Tor', { options: ['Tor', 'Garage', 'Weg'] }],
};
const CFG = { cameras: [{ name: 'Garten', prefix: 'garten' }, { name: 'Eingang', prefix: 'eingang', doorbell: 'input_boolean.klingel' }], auto_live: false, show_hub: false, doorbell_timeout: 2 };
const open = () => openCard(browser, server, { config: CFG, hass: { states: STATES } });
const tap = (c, id) => c.run((i) => window.__card.shadowRoot.getElementById(i).click(), id);

test('zweckentfremdeter Schalter klingelt; ablehnen beendet den Anruf', async () => {
  const c = await open();
  assert.equal((await c.info()).ringing, false);
  await c.run(() => window.setState('input_boolean.klingel', 'on'));
  await wait(300);
  let i = await c.info();
  assert.equal(i.ringing, true);
  assert.equal(i.cam, 'Eingang');
  assert.equal(i.live, true);
  await tap(c, 'ring-no');
  await wait(200);
  i = await c.info();
  assert.equal(i.ringing, false);
  assert.equal(i.mic, 'off');
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('annehmen startet das Gegensprechen', async () => {
  const c = await open();
  await c.run(() => window.setState('input_boolean.klingel', 'on'));
  await wait(300);
  await tap(c, 'ring-yes');
  await wait(1200);
  const i = await c.info();
  assert.equal(i.ringing, false);
  assert.equal(i.mic, 'on');
  await c.close();
});

test('Reolink-Besuchersensor klingelt automatisch und läuft ab', async () => {
  const c = await open();
  await c.run(() => window.setState('binary_sensor.garten_besucher', 'on'));
  await wait(300);
  const i = await c.info();
  assert.equal(i.ringing, true);
  assert.equal(i.cam, 'Garten');
  await wait(2300);
  assert.equal((await c.info()).ringing, false);
  await c.close();
});

test('PTZ nur bei Kameras mit PTZ-Entitäten; halten, stoppen, zoomen, Position', async () => {
  const c = await open();
  const hasPtz = () => c.run(() => !!window.__card.shadowRoot.querySelector('[data-id="ptz"]'));
  assert.equal(await hasPtz(), false);
  await c.run(() => window.__card._select(1));
  await wait(300);
  assert.equal(await hasPtz(), true);
  await c.click('[data-id="ptz"]');
  await wait(200);
  const center = (k) => c.run((key) => { const r = window.__card.shadowRoot.querySelector(`[data-k="${key}"]`).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, k);
  await c.page.mouse.move(...await center('ptz_left'));
  await c.page.mouse.down(); await wait(600); await c.page.mouse.up(); await wait(100);
  await c.page.mouse.move(...await center('ptz_zoom_in'));
  await c.page.mouse.down(); await c.page.mouse.up(); await wait(400);
  await c.run(() => [...window.__card.shadowRoot.querySelectorAll('.chip')].find((x) => x.dataset.o === 'Garage').click());
  const calls = (await c.rec()).calls;
  assert.ok(calls.includes('button.press button.eingang_ptz_left'));
  assert.ok(calls.includes('button.press button.eingang_ptz_stop'));
  assert.ok(calls.includes('button.press button.eingang_ptz_zoom_in'));
  assert.ok(calls.includes('select.select_option select.eingang_ptz_preset Garage'));
  await c.close();
});
