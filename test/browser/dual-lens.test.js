import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Direkt eingebundene TrackMix: die Integration behandelt sie als Kamera mit zwei Objektiven */
const img = ['idle', { entity_picture: '/x.jpg' }];
const reg = (id, tk) => ({ entity_id: id, device_id: 'dT', platform: 'reolink', translation_key: tk });
const ENTS = {
  'camera.trackmix_fluent_lens_0': 'sub_lens_0', 'camera.trackmix_clear_lens_0': 'main_lens_0',
  'camera.trackmix_fluent_lens_1': 'sub_lens_1', 'camera.trackmix_snapshots_fluent_lens_0': 'snapshots_sub_lens_0',
  'light.trackmix_floodlight': 'floodlight', 'button.trackmix_ptz_left': 'ptz_left',
};
const states = {}, entities = {};
Object.entries(ENTS).forEach(([id, tk]) => { states[id] = id.startsWith('camera') ? img : 'off'; entities[id] = reg(id, tk); });
const HASS = (model) => ({
  states, entities, devices: { dT: { name: 'TrackMix', model } },
  mediaCameras: ['TrackMix lens 0', 'TrackMix lens 1'], files: ['08:00:00 0:00:40 Person'],
});
const CFG = { cameras: [{ entity: 'camera.trackmix_fluent_lens_0' }], auto_live: false, show_hub: false };

test('TrackMix ohne Hub: Streams, Name, Tele-Stufe', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS('TrackMix WiFi') });
  const r = await c.run(() => {
    const k = window.__card;
    return { name: k._cam.name, sd: k._e('cam_sd'), hd: k._e('cam_hd'), tele: k._e('cam_tele'), snap: k._e('snap'), light: k._e('light'),
      avail: k._qAvail(), label: k._qLabel('tele') };
  });
  assert.deepEqual(r, {
    name: 'TrackMix', sd: 'camera.trackmix_fluent_lens_0', hd: 'camera.trackmix_clear_lens_0', tele: 'camera.trackmix_fluent_lens_1',
    snap: 'camera.trackmix_snapshots_fluent_lens_0', light: 'light.trackmix_floodlight', avail: ['fluent', 'clear', 'tele'], label: 'Tele',
  });
  // Qualitätsmenü: Tele wählbar, Livebild nutzt das zweite Objektiv
  await c.run(() => window.__card._setQuality('tele'));
  await c.click('#bigplay');
  await wait(300);
  const used = await c.run(() => window.__card.shadowRoot.querySelector('#pic ha-camera-stream').dataset.entity);
  assert.equal(used, 'camera.trackmix_fluent_lens_1');
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Duo: zweites Objektiv heisst „2. Objektiv“', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS('Reolink Duo WiFi') });
  assert.equal(await c.run(() => window.__card._qLabel('tele')), '2. Objektiv');
  await c.close();
});

test('Wiedergabe nimmt das erste Objektiv', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS('TrackMix WiFi') });
  await c.click('#m-play');
  await wait(400);
  await c.run(() => window.__card.shadowRoot.querySelector('#list .item').click());
  await wait(200);
  assert.match((await c.rec()).resolved.at(-1), /^R\|0\|/);
  await c.close();
});

test('Editor und Vorschläge finden die TrackMix', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS('TrackMix WiFi') });
  const stub = await c.run(() => customElements.get('reolink-app-card').getStubConfig(window.__hass));
  assert.deepEqual(stub.cameras, [{ name: 'TrackMix', prefix: 'trackmix', media_name: 'TrackMix', entity: 'camera.trackmix_fluent_lens_0' }]);
  await c.close();
});

/* So, wie die Card bisher eingerichtet wurde bzw. wie man sich vertippen kann */
for (const [label, cam] of [['nur prefix (alte Konfiguration)', { prefix: 'trackmix' }], ['Entity-ID unter prefix', { prefix: 'camera.trackmix_fluent_lens_0' }]]) {
  test(`TrackMix mit ${label}: Bild und Tele`, async () => {
    const c = await openCard(browser, server, { config: { ...CFG, cameras: [cam] }, hass: HASS('TrackMix WiFi') });
    const r = await c.run(() => ({ sd: window.__card._e('cam_sd'), avail: window.__card._qAvail() }));
    assert.deepEqual(r, { sd: 'camera.trackmix_fluent_lens_0', avail: ['fluent', 'clear', 'tele'] });
    await c.close();
  });
}

test('deutsche Entity-IDs mit „objektiv“', async () => {
  const ids = { 'camera.garten_standardauflosung_objektiv_0': 'sub_lens_0', 'camera.garten_standardauflosung_objektiv_1': 'sub_lens_1' };
  const st = {}, en = {};
  Object.entries(ids).forEach(([id, tk]) => { st[id] = img; en[id] = { entity_id: id, device_id: 'dG', platform: 'reolink', translation_key: tk }; });
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'garten' }], auto_live: false, show_hub: false },
    hass: { states: st, entities: en, devices: { dG: { name: 'Garten', model: 'TrackMix WiFi' } } } });
  const r = await c.run(() => ({ sd: window.__card._e('cam_sd'), tele: window.__card._e('cam_tele') }));
  assert.deepEqual(r, { sd: 'camera.garten_standardauflosung_objektiv_0', tele: 'camera.garten_standardauflosung_objektiv_1' });
  await c.close();
});

test('TrackMix ohne Hub: Tele-Aufnahmen vom zweiten Objektiv', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: { ...HASS('TrackMix WiFi'), resolutions: true } });
  await c.click('#m-play');
  await wait(400);
  const btns = () => c.run(() => [...window.__card.shadowRoot.querySelectorAll('#pq button')].filter((b) => b.style.display !== 'none').map((b) => b.textContent));
  assert.deepEqual(await btns(), ['Niedrig', 'Hoch', 'Tele']);
  await c.click('#pq [data-q="tele"]');
  await wait(400);
  await c.run(() => window.__card.shadowRoot.querySelector('#list .item').click());
  await wait(200);
  assert.match((await c.rec()).resolved.at(-1), /^R\|1\|/); // „TrackMix lens 1“
  await c.close();
});
