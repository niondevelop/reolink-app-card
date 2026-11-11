import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const day = new Date(); day.setHours(0, 0, 0, 0);
const at = (h, m, s = 0) => Math.floor(day.getTime() / 1000) + h * 3600 + m * 60 + s;
const MEDIA = {
  states: CAM_STATES,
  mediaCameras: ['Garten', 'Eingang'],
  files: ['00:10:00 0:00:30 Tier', '08:00:00 0:00:40 Person', '12:30:00 0:00:25 Fahrzeug', '18:15:00 0:00:30 Bewegung'],
};
const CFG = { cameras: [{ name: 'Garten', prefix: 'garten', media_name: 'Garten' }, { name: 'Eingang', prefix: 'eingang', media_name: 'Eingang' }], auto_live: false, show_hub: false };
const open = (query, hass = MEDIA) => openCard(browser, server, { query, config: CFG, hass, wait: 900 });

test('rac=live wählt die Kamera und startet das Livebild', async () => {
  const c = await open('?rac=live&rac_cam=eingang');
  const i = await c.info();
  assert.equal(i.cam, 'Eingang');
  assert.equal(i.live, true);
  assert.doesNotMatch(await c.run(() => location.search), /rac=/);
  assert.deepEqual((await c.rec()).events, [{ type: 'reolink_app_card', data: { action: 'live', camera: 'eingang' } }]);
  await c.close();
});

test('rac=event spielt die Aufnahme, in der der Zeitpunkt liegt', async () => {
  const c = await open(`?rac=event&rac_cam=eingang&rac_t=${at(12, 30, 10)}`);
  const i = await c.info();
  assert.equal(i.cam, 'Eingang');
  assert.equal(i.playing, '12:30:00');
  await c.close();
});

test('rac=event nimmt eine knapp danebenliegende Aufnahme (Kamera über den Namen)', async () => {
  const c = await open(`?rac=event&rac_cam=Garten&rac_t=${at(18, 13)}`);
  assert.equal((await c.info()).playing, '18:15:00');
  await c.close();
});

test('rac=event ohne passende alte Aufnahme meldet das', async () => {
  const c = await open(`?rac=event&rac_cam=garten&rac_t=${at(0, 45)}`);
  const i = await c.info();
  assert.equal(i.playing, null);
  assert.ok(i.toast);
  await c.close();
});

test('unbekannte Kamera wird ignoriert', async () => {
  const c = await open('?rac=live&rac_cam=wohnzimmer');
  const i = await c.info();
  assert.equal(i.cam, 'Garten');
  assert.equal(i.live, false);
  await c.close();
});

test('andere Parameter bleiben erhalten, Kamera über die Entität', async () => {
  const c = await open('?foo=1&rac=live&rac_cam=camera.eingang_standardauflosung');
  assert.equal((await c.info()).cam, 'Eingang');
  assert.equal(await c.run(() => location.search), '?foo=1');
  await c.close();
});

test('rac=talk schaltet das Mikrofon ein', async () => {
  const c = await openCard(browser, server, { query: '?rac=talk&rac_cam=eingang', config: CFG, hass: MEDIA, wait: 1500 });
  const i = await c.info();
  assert.equal(i.cam, 'Eingang');
  assert.equal(i.mic, 'on');
  await c.close();
});

test('ohne Admin-Rechte kein Fehler beim Ereignis', async () => {
  const c = await open('?rac=live&rac_cam=eingang', { ...MEDIA, noAdmin: true });
  assert.equal((await c.info()).live, true);
  assert.deepEqual(c.errors, []);
  await c.close();
});
