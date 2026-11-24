import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* TrackMix wie in der Reolink-Integration: viele Sensoren mit Geräteklasse „motion“, nur der echte Bewegungssensor
   ohne internen Schlüssel; je ein Satz pro Objektiv. Ein falscher Sensor ist dauerhaft „an“. */
const img = ['idle', { entity_picture: '/x.jpg' }];
const ms = (state) => [state, { device_class: 'motion' }];
const STATES = {
  'camera.garten_fliessend_lens_0': img,
  'binary_sensor.garten_paket_lens_1': ms('on'), // dauerhaft an, falsch
  'binary_sensor.garten_person_lens_0': ms('off'),
  'binary_sensor.garten_bewegung_lens_1': ms('on'),
  'binary_sensor.garten_bewegung_lens_0': ms('off'),
  'button.garten_ptz_links': ['unknown', {}], 'button.garten_ptz_rechts': ['unknown', {}], 'button.garten_ptz_stopp': ['unknown', {}],
  'number.garten_zoom_2': ['10', { min: 0, max: 33, step: 1 }],
};
const reg = (id, tk) => ({ entity_id: id, device_id: 'dT', platform: 'reolink', translation_key: tk });
const ENTITIES = {
  'camera.garten_fliessend_lens_0': reg('camera.garten_fliessend_lens_0', 'sub_lens_0'),
  'binary_sensor.garten_paket_lens_1': reg('binary_sensor.garten_paket_lens_1', 'package'),
  'binary_sensor.garten_person_lens_0': reg('binary_sensor.garten_person_lens_0', 'person'),
  'binary_sensor.garten_bewegung_lens_1': reg('binary_sensor.garten_bewegung_lens_1', null),
  'binary_sensor.garten_bewegung_lens_0': reg('binary_sensor.garten_bewegung_lens_0', null),
  'button.garten_ptz_links': reg('button.garten_ptz_links', 'ptz_left'),
  'button.garten_ptz_rechts': reg('button.garten_ptz_rechts', 'ptz_right'),
  'button.garten_ptz_stopp': reg('button.garten_ptz_stopp', 'ptz_stop'),
  'number.garten_zoom_2': reg('number.garten_zoom_2', 'zoom'),
};
const HASS = { states: STATES, entities: ENTITIES, devices: { dT: { name: 'Garten', model: 'TrackMix WiFi' } } };
const CFG = { cameras: [{ entity: 'camera.garten_fliessend_lens_0' }], auto_live: false, show_hub: false };

test('Bewegung: echter Bewegungssensor des Hauptobjektivs, nicht ein anderer Sensor mit Geräteklasse „motion“', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS });
  const r = await c.run(() => ({ motion: window.__card._e('det_motion'), det: window.__card._det(window.__card._cam) }));
  assert.equal(r.motion, 'binary_sensor.garten_bewegung_lens_0');
  assert.ok(!r.det.includes('motion'), 'keine Dauer-Bewegung');
  await c.close();
});

test('TrackMix-Zoom: + und − über die Zahl-Entität „Zoom“, wenn keine Zoom-Tasten da sind', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS });
  await c.click('[data-id="ptz"]');
  await wait(100);
  const r = await c.run(() => { const b = window.__card.shadowRoot.getElementById('ptz'); return { plus: !!b.querySelector('[data-z="1"]'), minus: !!b.querySelector('[data-z="-1"]'), val: b.querySelector('#zv').textContent }; });
  assert.deepEqual(r, { plus: true, minus: true, val: '10' });
  await c.click('#ptz [data-z="1"]');
  await c.click('#ptz [data-z="-1"]');
  await wait(50);
  const calls = (await c.rec()).calls.filter((x) => x.startsWith('number.'));
  assert.deepEqual(calls, ['number.set_value number.garten_zoom_2 13', 'number.set_value number.garten_zoom_2 7']);
  await c.close();
});

/* Bereiche ausblenden (Darstellung) */
const TWO = {
  states: { 'camera.garten_standardauflosung': img, 'camera.eingang_standardauflosung': img, 'siren.garten_sirene': ['off', {}], 'number.garten_pir_empfindlichkeit': ['50', { min: 0, max: 100 }] },
  mediaCameras: ['Garten', 'Eingang'],
};
const vis = (c) => c.run(() => {
  const r = window.__card.shadowRoot, v = (s) => { const e = r.querySelector(s); return !!e && e.getClientRects().length > 0; };
  return { tabs: v('.top'), seg: v('.seg'), bar: v('.barwrap'), more: v('#more') };
});
test('Bereiche ausblenden: Kameraauswahl, Live/Wiedergabe, Bedienpanel, Einstellungen', async () => {
  const base = { cameras: [{ prefix: 'garten' }, { prefix: 'eingang' }], auto_live: false, show_hub: false };
  let c = await openCard(browser, server, { config: base, hass: TWO });
  await wait(200);
  assert.deepEqual(await vis(c), { tabs: true, seg: true, bar: true, more: true });
  await c.close();
  c = await openCard(browser, server, { config: { ...base, show_camera_tabs: false, show_live_playback: false, show_controls: false, show_settings: false }, hass: TWO });
  await wait(200);
  assert.deepEqual(await vis(c), { tabs: false, seg: false, bar: false, more: false });
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('TrackMix: lens: 1 zeigt das Tele-Objektiv (telephoto_sub / telephoto_main)', async () => {
  const states = { ...STATES, 'camera.garten_tele_fliessend': img, 'camera.garten_tele_klar': img };
  const entities = { ...ENTITIES, 'camera.garten_tele_fliessend': reg('camera.garten_tele_fliessend', 'telephoto_sub'), 'camera.garten_tele_klar': reg('camera.garten_tele_klar', 'telephoto_main') };
  const c = await openCard(browser, server, { config: { ...CFG, cameras: [{ entity: 'camera.garten_fliessend_lens_0', lens: 1 }] }, hass: { ...HASS, states, entities } });
  const r = await c.run(() => ({ sd: window.__card._e('cam_sd'), hd: window.__card._e('cam_hd'), tele: window.__card._qAvail().includes('tele') }));
  assert.deepEqual(r, { sd: 'camera.garten_tele_fliessend', hd: 'camera.garten_tele_klar', tele: false });
  await c.close();
});
