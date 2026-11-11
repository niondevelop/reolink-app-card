import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const PLAY_KEY = 'reolink-app-card:playback_quality';
const LIVE_KEY = 'reolink-app-card:quality';
const FILES = ['08:00:00 0:00:40 Person', '12:30:00 0:00:25 Fahrzeug'];
const CFG = { cameras: [{ name: 'Garten', prefix: 'garten', media_name: 'Garten' }], auto_live: false, show_hub: false };
const HASS = { states: CAM_STATES, mediaCameras: ['Garten'], files: FILES, resolutions: true };

const open = (extra = {}) => openCard(browser, server, { config: CFG, hass: HASS, ...extra });
const toPlayback = async (c) => { await c.click('#m-play'); await wait(400); };
const pq = (c) => c.run(() => {
  const r = window.__card.shadowRoot;
  return {
    shown: r.getElementById('pqrow').style.display !== 'none',
    label: r.getElementById('pq-l').textContent,
    buttons: [...r.querySelectorAll('#pq button')].map((b) => `${b.textContent}${b.classList.contains('sel') ? '*' : ''}`),
  };
});
const playFirst = async (c) => { await c.run(() => window.__card.shadowRoot.querySelector('#list .item').click()); await wait(200); };
const lastRes = async (c) => (await c.rec()).resolved.at(-1);

test('Standard: niedrige Auflösung, Umschalter im Bereich Wiedergabe', async () => {
  const c = await open();
  await toPlayback(c);
  assert.deepEqual(await pq(c), { shown: true, label: 'Auflösung', buttons: ['Niedrig*', 'Hoch'] });
  await playFirst(c);
  assert.match(await lastRes(c), /\|RES\|sub\|/);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Hoch wählen: speichert, spielt denselben Clip in hoher Auflösung weiter', async () => {
  const c = await open();
  await toPlayback(c);
  await playFirst(c);
  const before = (await c.info()).playing;
  await c.click('#pq [data-q="high"]');
  await wait(400);
  assert.deepEqual((await pq(c)).buttons, ['Niedrig', 'Hoch*']);
  assert.equal(await c.run((k) => localStorage.getItem(k), PLAY_KEY), 'high');
  assert.equal((await c.info()).playing, before);
  assert.match(await lastRes(c), /\|RES\|main\|/);
  await c.close();
});

test('Auswahl bleibt nach dem Neuladen erhalten', async () => {
  const c = await open({ storage: { [PLAY_KEY]: 'high' } });
  await toPlayback(c);
  assert.deepEqual((await pq(c)).buttons, ['Niedrig', 'Hoch*']);
  await playFirst(c);
  assert.match(await lastRes(c), /\|RES\|main\|/);
  await c.close();
});

test('unabhängig von der Livebild-Qualität', async () => {
  const c = await open({ storage: { [LIVE_KEY]: 'fluent', [PLAY_KEY]: 'high' } });
  await c.run(() => window.__card._setQuality('fluent'));
  await toPlayback(c);
  assert.deepEqual((await pq(c)).buttons, ['Niedrig', 'Hoch*']);
  await c.click('#pq [data-q="low"]');
  await wait(300);
  const s = await c.run(([a, b]) => [localStorage.getItem(a), localStorage.getItem(b), window.__card._quality], [PLAY_KEY, LIVE_KEY]);
  assert.deepEqual(s, ['low', 'fluent', 'fluent']);
  await c.close();
});

test('ohne Auflösungsebene kein Umschalter', async () => {
  const c = await open({ hass: { ...HASS, resolutions: false } });
  await toPlayback(c);
  assert.equal((await pq(c)).shown, false);
  await playFirst(c);
  assert.ok((await c.info()).playing);
  await c.close();
});
