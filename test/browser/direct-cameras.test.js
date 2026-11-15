import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Zwei Kameras direkt in Home Assistant, ohne Hub: jede hat selbst Szenenmodus und SD-Karte */
const img = ['idle', { entity_picture: '/x.jpg' }];
const STATES = {
  'camera.einfahrt_fluent': img, 'camera.garage_fluent': img,
  'select.einfahrt_scene_mode': ['home', { options: ['off', 'home', 'away'] }],
  'sensor.einfahrt_sd_0_storage': ['42', { unit_of_measurement: '%' }],
  'sensor.garage_sd_0_storage': ['17', { unit_of_measurement: '%' }],
};
const ENTITIES = {
  'camera.einfahrt_fluent': { entity_id: 'camera.einfahrt_fluent', device_id: 'dE', platform: 'reolink', translation_key: 'sub' },
  'select.einfahrt_scene_mode': { entity_id: 'select.einfahrt_scene_mode', device_id: 'dE', platform: 'reolink', translation_key: 'scene_mode' },
  'sensor.einfahrt_sd_0_storage': { entity_id: 'sensor.einfahrt_sd_0_storage', device_id: 'dE', platform: 'reolink' },
  'camera.garage_fluent': { entity_id: 'camera.garage_fluent', device_id: 'dG', platform: 'reolink', translation_key: 'sub' },
  'sensor.garage_sd_0_storage': { entity_id: 'sensor.garage_sd_0_storage', device_id: 'dG', platform: 'reolink' },
};
const HASS = {
  states: STATES, entities: ENTITIES, devices: { dE: { name: 'Einfahrt' }, dG: { name: 'Garage' } },
  mediaCameras: ['Einfahrt', 'Garage'], files: ['08:00:00 0:00:40 Person', '12:30:00 0:00:25 Fahrzeug'], resolutions: true,
};
const CFG = { cameras: [{ entity: 'camera.einfahrt_fluent' }, { entity: 'camera.garage_fluent' }], auto_live: false };

const toPlayback = async (c) => { await c.click('#m-play'); await wait(400); };
const playFirst = async (c) => { await c.run(() => window.__card.shadowRoot.querySelector('#list .item').click()); await wait(400); };
const player = (c) => c.run(() => {
  const r = window.__card.shadowRoot, hls = r.querySelector('ha-hls-player');
  return { hls: !!hls, hlsUrl: hls ? hls.url : null, videoSrc: r.getElementById('video').getAttribute('src'), download: r.getElementById('dl').style.display !== 'none' };
});

test('ohne Hub: Kameras, Namen und Entitäten werden gefunden, keine Hub-Zeile', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS });
  const r = await c.run(() => {
    const k = window.__card;
    return { names: k._cams.map((x) => x.name), light: k._e('cam_sd'), hubShown: k.shadowRoot.getElementById('hub').innerHTML.trim() !== '' && k.shadowRoot.getElementById('hub').style.display !== 'none' };
  });
  assert.deepEqual(r.names, ['Einfahrt', 'Garage']);
  assert.equal(r.light, 'camera.einfahrt_fluent');
  assert.equal(r.hubShown, false);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('HLS-Aufnahme in Chrome/Firefox: HLS-Player von Home Assistant', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: { ...HASS, hls: true }, nativeHls: false });
  await toPlayback(c);
  await playFirst(c);
  const p = await player(c);
  assert.equal(p.hls, true);
  assert.equal(p.hlsUrl, '/api/hls/T1/playlist.m3u8');
  assert.equal(p.videoSrc, null);
  assert.equal(p.download, false);
  assert.equal((await c.info()).playing, '12:30:00');
  // Stoppen entfernt den HLS-Player wieder
  await c.click('#stop');
  await wait(100);
  assert.equal((await player(c)).hls, false);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('HLS-Aufnahme in Safari: eigenes Videoelement', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: { ...HASS, hls: true }, nativeHls: true });
  await toPlayback(c);
  await playFirst(c);
  const p = await player(c);
  assert.equal(p.hls, false);
  assert.equal(p.videoSrc, '/api/hls/T1/playlist.m3u8');
  await c.close();
});

test('MP4-Aufnahme: wie bisher im eigenen Videoelement', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS, nativeHls: false });
  await toPlayback(c);
  await playFirst(c);
  const p = await player(c);
  assert.equal(p.hls, false);
  assert.equal(p.videoSrc, '/clip.mp4');
  assert.equal(p.download, true);
  await c.close();
});

test('Wechsel von HLS zu MP4 und zurück', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: { ...HASS, hls: true }, nativeHls: false });
  await toPlayback(c);
  await playFirst(c);
  assert.equal((await player(c)).hls, true);
  await c.run(() => { window.__hass.callWS = ((orig) => async (m) => (m.type === 'media_source/resolve_media' ? { url: '/clip.mp4', mime_type: 'video/mp4' } : orig(m)))(window.__hass.callWS); });
  await c.run(() => window.__card.shadowRoot.querySelectorAll('#list .item')[1].click());
  await wait(300);
  const p = await player(c);
  assert.equal(p.hls, false);
  assert.equal(p.videoSrc, '/clip.mp4');
  assert.equal(await c.run(() => window.__card.shadowRoot.querySelectorAll('ha-hls-player').length), 0);
  await c.close();
});
