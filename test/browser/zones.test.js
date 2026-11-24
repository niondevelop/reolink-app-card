import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Smarte Erkennung: Grenzlinien und Eindring-Zonen als eigene Sensoren mit Zonennamen */
const img = ['idle', { entity_picture: '/x.jpg' }];
const E = {
  'camera.hof_fluent': ['sub', img],
  'camera.tor_fluent': ['sub', img, 'dT'],
  'binary_sensor.hof_person': ['person', ['off', { friendly_name: 'Hof Person' }]],
  'binary_sensor.hof_person_crossline_fence': ['crossline_person', ['off', { friendly_name: 'Hof Person crossline Fence' }]],
  'binary_sensor.hof_animal_intrusion_lawn': ['intrusion_dog_cat', ['off', { friendly_name: 'Hof Animal intrusion Lawn' }]],
};
const states = {}, entities = {};
Object.entries(E).forEach(([id, [tk, st, dev]]) => { states[id] = st; entities[id] = { entity_id: id, device_id: dev || 'dH', platform: 'reolink', translation_key: tk }; });
const HASS = { states, entities, devices: { dH: { name: 'Hof' }, dT: { name: 'Tor' } } };
const CFG = { cameras: [{ prefix: 'tor' }, { prefix: 'hof' }], auto_live: false, show_hub: false, language: 'en' };

test('Zonen und Linien: gefunden, Hinweis mit Zonennamen, Umschalten, Status', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS });
  const zones = await c.run(() => window.__card._zoneSensors(window.__card._cams[1]).map((z) => z.label));
  assert.deepEqual(zones, ['Animal intrusion Lawn', 'Person crossline Fence']);
  await c.run(() => { window.setState('binary_sensor.hof_person', 'on'); window.setState('binary_sensor.hof_person_crossline_fence', 'on'); });
  await wait(100);
  const i = await c.info();
  assert.match(i.toast, /Person crossline Fence/);
  assert.match(i.toast, /Hof/);
  assert.equal(i.cam, 'Hof');
  const r = await c.run(() => ({ pills: [...window.__card.shadowRoot.querySelectorAll('#det .pill')].map((p) => p.textContent), alert: window.__card._alerting(window.__card._cams[1]) }));
  assert.deepEqual(r.pills, ['Person crossline Fence', 'Person']);
  assert.equal(r.alert, true);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Zone allein (ohne Personen-Sensor) schaltet ebenfalls um', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS });
  await c.run(() => window.setState('binary_sensor.hof_animal_intrusion_lawn', 'on'));
  await wait(100);
  const i = await c.info();
  assert.match(i.toast, /Animal intrusion Lawn/);
  assert.equal(i.cam, 'Hof');
  await c.close();
});

test('Ohne Geräteregister: Zonen über die Namensendungen (deutsch)', async () => {
  const st = { 'camera.hof_standardauflosung': img, 'binary_sensor.hof_person_grenzlinie_mauer': ['off', { friendly_name: 'Hof Person-Grenzlinie Mauer' }], 'binary_sensor.hof_person': 'off' };
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'hof' }], auto_live: false, show_hub: false }, hass: { states: st } });
  const zones = await c.run(() => window.__card._zoneSensors(window.__card._cams[0]).map((z) => z.label));
  assert.deepEqual(zones, ['Person-Grenzlinie Mauer']);
  await c.close();
});
