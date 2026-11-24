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

test('Raster: Erkennung markiert die Kachel rot, Auswahl bleibt', async () => {
  const c = await openCard(browser, server, { config: { ...CFG, cameras: [CFG.cameras[1], CFG.cameras[0]], auto_switch: true }, hass: { states: STATES } });
  await c.run(() => window.__card._setGrid(true));
  await wait(100);
  await c.run(() => window.setState('binary_sensor.garten_person', 'on'));
  await wait(100);
  const s = await state(c);
  assert.equal(s.grid, true);
  assert.equal(s.cam, 'Eingang');
  assert.deepEqual(s.sel, [true, false]);
  assert.equal(await c.run(() => window.__card.shadowRoot.querySelectorAll('#grid .cell')[1].classList.contains('alert')), true);
  await c.close();
});

test('Raster: Auswahl lädt Aufnahmen der gewählten Kamera; Verlassen per Knopf behält sie', async () => {
  const c = await openCard(browser, server, { config: { ...CFG, cameras: [{ ...CFG.cameras[0], media_name: 'Garten' }, { ...CFG.cameras[1], media_name: 'Eingang' }] }, hass: { states: STATES, mediaCameras: ['Garten', 'Eingang'], files: ['08:00:00 0:00:40 Person'] } });
  await c.click('#m-play');
  await wait(400);
  await c.click('#m-live');
  await c.run(() => window.__card._setGrid(true));
  await wait(100);
  await tapCell(c, 1);
  await c.run(() => window.__card._setGrid(false));
  await c.click('#m-play');
  await wait(400);
  await c.run(() => window.__card.shadowRoot.querySelector('#list .item').click());
  await wait(200);
  assert.match((await c.rec()).resolved.at(-1), /^R\|1\|/);
  await c.close();
});

test('Raster: Auswahlwechsel baut nur alte und neue Kachel neu auf; Tastatur und aria-pressed', async () => {
  const c = await openCard(browser, server, { config: { ...CFG, cameras: [...CFG.cameras, { name: 'Hof', prefix: 'garten' }] }, hass: { states: STATES } });
  await c.run(() => { const k = window.__card; k._quality = 'clear'; k._setGrid(true); k._startLive(); });
  await wait(400);
  const r = await c.run(async () => {
    const k = window.__card, before = [...k.shadowRoot.querySelectorAll('#grid .cell .pic > *')];
    const cells = k.shadowRoot.querySelectorAll('#grid .cell');
    cells[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await new Promise((res) => setTimeout(res, 400));
    const after = [...k.shadowRoot.querySelectorAll('#grid .cell .pic > *')];
    return { kept: after.map((el, i) => el === before[i]), idx: k._idx, pressed: [...k.shadowRoot.querySelectorAll('#grid .cell')].map((x) => x.getAttribute('aria-pressed')), tab: cells[0].tabIndex };
  });
  assert.equal(r.idx, 1);
  assert.deepEqual(r.kept, [false, false, true]);
  assert.deepEqual(r.pressed, ['false', 'true', 'false']);
  assert.equal(r.tab, 0);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Raster: Leertaste auf einer Kachel wählt nur aus und startet keinen Clip', async () => {
  const c = await openCard(browser, server, { config: { ...CFG, layout: 'right', cameras: [{ ...CFG.cameras[0], media_name: 'Garten' }, { ...CFG.cameras[1], media_name: 'Eingang' }] }, hass: { states: STATES, mediaCameras: ['Garten', 'Eingang'], files: ['08:00:00 0:00:40 Person'] } });
  await c.page.setViewportSize({ width: 1140, height: 900 });
  await c.run(() => { document.getElementById('wrap').style.width = '1100px'; });
  await wait(300);
  await c.run(() => window.__card._setGrid(true));
  await wait(600);
  const pre = await c.run(() => ({ ev: window.__card._eventsShown(), files: (window.__card._visibleFiles || []).length }));
  assert.deepEqual(pre, { ev: true, files: 1 });
  await c.run(() => window.__card.shadowRoot.querySelectorAll('#grid .cell')[1].focus());
  await c.page.keyboard.press('Space');
  await wait(300);
  const r = await c.run(() => ({ idx: window.__card._idx, grid: window.__card._grid, playing: !!window.__card._playing }));
  assert.deepEqual(r, { idx: 1, grid: true, playing: false });
  await c.close();
});
