import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Raster: erster Tipp wählt die Kachel (Rahmen, Tasten wirken auf sie), zweiter Tipp öffnet sie gross */
const img = ['idle', { entity_picture: '/x.jpg' }];
const PTZ = ['left', 'right', 'up', 'down', 'stop'];
const STATES = {
  'camera.garten_standardauflosung': img, 'camera.eingang_standardauflosung': img, 'camera.eingang_hochauflosung': img,
  'light.garten_flutlicht': 'off', 'light.eingang_flutlicht': 'off', 'binary_sensor.garten_person': 'off',
  ...Object.fromEntries(PTZ.map((k) => [`button.eingang_ptz_${k}`, 'unknown'])),
};
const CFG = { cameras: [{ name: 'Garten', prefix: 'garten' }, { name: 'Eingang', prefix: 'eingang' }], auto_live: false, show_hub: false };
const state = (c) => c.run(() => {
  const k = window.__card, r = k.shadowRoot;
  return {
    grid: k._grid, cam: k._cam.name,
    sel: [...r.querySelectorAll('#grid .cell')].map((x) => x.classList.contains('sel')),
    btns: [...r.querySelectorAll('#ctrls [data-id]')].map((b) => b.dataset.id),
  };
});
const tapCell = (c, i) => c.run((n) => window.__card.shadowRoot.querySelectorAll('#grid .cell')[n].click(), i);

test('Raster: Tipp wählt Kachel mit Rahmen, Tasten inkl. PTZ und Qualität gelten für sie', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: { states: STATES } });
  await c.run(() => window.__card._setGrid(true));
  await wait(200);
  let s = await state(c);
  assert.equal(s.cam, 'Garten');
  assert.deepEqual(s.sel, [true, false]);
  assert.ok(!s.btns.includes('ptz'));
  await tapCell(c, 1);
  await wait(100);
  s = await state(c);
  assert.equal(s.grid, true);
  assert.equal(s.cam, 'Eingang');
  assert.deepEqual(s.sel, [false, true]);
  assert.ok(s.btns.includes('ptz'));
  assert.ok(s.btns.includes('q'));
  assert.ok(!s.btns.includes('talk'));
  // Licht schaltet die gewählte Kamera
  await c.run(() => window.__card.shadowRoot.querySelector('#ctrls [data-id="light"]').click());
  const calls = await c.run(() => window.__R.calls);
  assert.ok(JSON.stringify(calls).includes('light.eingang_flutlicht'), JSON.stringify(calls));
  // PTZ-Steuerkreuz im Raster
  await c.run(() => window.__card.shadowRoot.querySelector('#ctrls [data-id="ptz"]').click());
  assert.equal(await c.run(() => window.__card.shadowRoot.getElementById('ptz').classList.contains('open')), true);
  // Zweiter Tipp auf die gewählte Kachel öffnet sie gross
  await tapCell(c, 1);
  await wait(100);
  s = await state(c);
  assert.equal(s.grid, false);
  assert.equal(s.cam, 'Eingang');
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Raster: Erkennung wählt die Kachel, statt das Raster zu verlassen', async () => {
  const c = await openCard(browser, server, { config: { ...CFG, cameras: [CFG.cameras[1], CFG.cameras[0]] }, hass: { states: STATES } });
  await c.run(() => window.__card._setGrid(true));
  await wait(100);
  await c.run(() => window.setState('binary_sensor.garten_person', 'on'));
  await wait(100);
  const s = await state(c);
  assert.equal(s.grid, true);
  assert.equal(s.cam, 'Garten');
  assert.deepEqual(s.sel, [false, true]);
  await c.close();
});
