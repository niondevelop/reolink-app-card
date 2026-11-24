import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { launch, openCard, startServer, wait } from './helpers.js';

const AUDIO_ONLY = readFileSync(new URL('./fixtures/audio-only.mp4', import.meta.url));
const HEVC_ONLY = readFileSync(new URL('./fixtures/hevc-only.mp4', import.meta.url));

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Hohe Auflösung nicht abspielbar (H.265 in Chrome unter Linux): automatisch auf die niedrige ausweichen */
const img = ['idle', { entity_picture: '/x.jpg' }];
const HASS = { states: { 'camera.hof_standardauflosung': img }, mediaCameras: ['Hof'], files: ['08:00:00 0:00:40 Person'], resolutions: true };

const STORE = 'reolink-app-card:playback_quality';
const run = async (q, body = AUDIO_ONLY) => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'hof' }], auto_live: false, show_hub: false, language: 'de' }, hass: HASS, storage: { [STORE]: q } });
  // Wie H.265 ohne Dekoder: Datei lädt, aber nur mit Ton (videoWidth 0)
  await c.page.route('**/clip.mp4', (r) => r.fulfill({ status: 200, contentType: 'video/mp4', body }));
  await c.click('#m-play');
  await wait(400);
  await c.run(() => window.__card.shadowRoot.querySelector('#list .item').click());
  await wait(800);
  return c;
};

test('Hoch ohne Bild (H.265 ohne Dekoder): Hinweis, Wechsel auf Niedrig, gespeicherte Wahl bleibt', async () => {
  const c = await run('high');
  const r = await c.run((k) => ({ q: window.__card._playQ, used: window.__card._res && window.__card._res.used, toast: window.__card.$('toast').textContent, stored: localStorage.getItem(k) }), STORE);
  assert.equal(r.q, 'low');
  assert.equal(r.used, 'low');
  assert.match(r.toast, /H\.265/);
  assert.equal(r.stored, 'high');
  await c.close();
});

test('Niedrig ohne Bild: kein Ausweichen', async () => {
  const c = await run('low');
  const r = await c.run(() => ({ q: window.__card._playQ, toast: window.__card.$('toast').textContent }));
  assert.equal(r.q, 'low');
  assert.doesNotMatch(r.toast || '', /H\.265/);
  await c.close();
});

test('Hoch nur H.265 ohne Tonspur (Ladefehler): ebenfalls Wechsel auf Niedrig', async () => {
  const c = await run('high', HEVC_ONLY);
  const r = await c.run(() => ({ q: window.__card._playQ, err: window.__card.$('video').error && window.__card.$('video').error.message, toast: window.__card.$('toast').textContent }));
  assert.equal(r.q, 'low', JSON.stringify(r));
  assert.match(r.toast, /H\.265/);
  await c.close();
});
