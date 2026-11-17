import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const img = ['idle', { entity_picture: '/x.jpg' }];
const STATES = { 'camera.haustur_fluent': img, 'camera.garten_fluent': img };
const ENTITIES = {
  'camera.haustur_fluent': { entity_id: 'camera.haustur_fluent', device_id: 'dH', platform: 'reolink', translation_key: 'sub' },
  'camera.garten_fluent': { entity_id: 'camera.garten_fluent', device_id: 'dG', platform: 'reolink', translation_key: 'sub' },
};
const DEVICES = { dH: { name: 'Haustür' }, dG: { name: 'Garten' } };
const CFG = { cameras: [{ entity: 'camera.haustur_fluent' }, { entity: 'camera.garten_fluent' }], auto_live: false, show_hub: false };
const segShown = (c) => c.run(() => window.__card.shadowRoot.querySelector('.seg').style.display !== 'none');

test('Kamera ohne Aufnahmen in Home Assistant: kein Reiter „Wiedergabe“; andere Kamera behält ihn', async () => {
  // Nur der Garten ist in der Reolink-Medienquelle (wie direkt eingebundene Klingeln, die fehlen)
  const c = await openCard(browser, server, { config: CFG, hass: { states: STATES, entities: ENTITIES, devices: DEVICES, mediaCameras: ['Garten'], files: ['08:00:00 0:00:30 Person'] } });
  await wait(200);
  assert.equal(await segShown(c), false);
  await c.run(() => window.__card._select(1));
  await wait(200);
  assert.equal(await segShown(c), true);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Zuordnung über das Gerät, auch wenn der Name in der Medienquelle anders ist', async () => {
  const c = await openCard(browser, server, { config: CFG,
    hass: { states: STATES, entities: ENTITIES, devices: DEVICES, mediaCameras: [{ title: 'Garden Cam', thumbnail: '/api/camera_proxy/camera.garten_fluent' }, { title: 'Front Door', thumbnail: '/api/camera_proxy/camera.haustur_fluent' }], files: ['08:00:00 0:00:30 Person'] } });
  await wait(200);
  assert.equal(await segShown(c), true);
  await c.click('#m-play');
  await wait(400);
  await c.run(() => window.__card.shadowRoot.querySelector('#list .item').click());
  await wait(200);
  assert.match((await c.rec()).resolved.at(-1), /^R\|1\|/); // Haustür ist der zweite Eintrag
  await c.close();
});

test('Option playback: false blendet den Reiter aus', async () => {
  const c = await openCard(browser, server, { config: { ...CFG, playback: false }, hass: { states: STATES, entities: ENTITIES, devices: DEVICES, mediaCameras: ['Haustür', 'Garten'] } });
  await wait(200);
  assert.equal(await segShown(c), false);
  await c.close();
});

test('Link zu einer Aufnahme bei Kamera ohne Aufnahmen: bleibt im Livebild', async () => {
  const c = await openCard(browser, server, { config: CFG, query: '?rac=event&rac_cam=camera.haustur_fluent', hass: { states: STATES, entities: ENTITIES, devices: DEVICES, mediaCameras: ['Garten'] } });
  await wait(400);
  assert.equal((await c.info()).mode, 'live');
  assert.deepEqual(c.errors, []);
  await c.close();
});
