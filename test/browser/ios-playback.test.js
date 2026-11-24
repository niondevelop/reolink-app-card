import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* iPhone/iPad: Clip erst ganz laden und aus dem Speicher abspielen (Wiedergabe-URL ohne Range-Anfragen) */
const img = ['idle', { entity_picture: '/x.jpg' }];
const HASS = { states: { 'camera.hof_standardauflosung': img }, mediaCameras: ['Hof'], files: ['08:00:00 0:00:40 Person', '07:00:00 0:00:30 Person'] };
const open = async (extra = {}) => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'hof' }], auto_live: false, show_hub: false, ...extra }, hass: HASS });
  // Wie die Reolink-Integration: 200 ohne Content-Length/Accept-Ranges, etwas verzögert
  await c.page.route('**/clip.mp4', async (r) => { await new Promise((res) => setTimeout(res, 150)); r.fulfill({ status: 200, contentType: 'video/mp4', body: Buffer.alloc(4096) }); });
  return c;
};
const playFirst = async (c, i = 0) => { await c.run((n) => window.__card.shadowRoot.querySelectorAll('#list .item')[n].click(), i); };

test('playback_preload: true – Clip als Blob, Fortschritt verschwindet danach', async () => {
  const c = await open({ playback_preload: true });
  await c.click('#m-play');
  await wait(400);
  await playFirst(c);
  await wait(500);
  const r = await c.run(() => ({ src: window.__card.$('video').src, dl: window.__card.$('preload').hidden, playing: !!window.__card._playing }));
  assert.match(r.src, /^blob:/);
  assert.equal(r.dl, true);
  assert.equal(r.playing, true);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Schneller Clipwechsel beim Laden: kein Fehlerhinweis, der zweite Clip läuft', async () => {
  const c = await open({ playback_preload: true });
  await c.click('#m-play');
  await wait(400);
  await c.run(() => { const items = window.__card.shadowRoot.querySelectorAll('#list .item'); items[0].click(); items[1].click(); });
  await wait(600);
  const r = await c.run(() => ({ src: window.__card.$('video').src, time: window.__card._playing && window.__card._playing.time, toast: window.__card.$('toast').classList.contains('show') && window.__card.$('toast').textContent }));
  assert.match(r.src, /^blob:/);
  assert.equal(r.time, '07:00:00');
  assert.equal(r.toast, false);
  await c.close();
});

test('Desktop (Standard): direkte URL; iPhone-Kennung schaltet das Vorladen ein', async () => {
  const c = await open();
  await c.click('#m-play');
  await wait(400);
  await playFirst(c);
  await wait(300);
  assert.match(await c.run(() => window.__card.$('video').src), /\/clip\.mp4/);
  const ios = await c.run(() => { Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_2 like Mac OS X) Home Assistant/2026.11' }); return window.__card._preloadClips(); });
  assert.equal(ios, true);
  await c.close();
});

test('Download-Knopf bleibt nach Beenden und erneutem Abspielen nutzbar', async () => {
  const c = await open({ playback_preload: true });
  await c.click('#m-play');
  await wait(400);
  await playFirst(c);
  await wait(400);
  await c.run(() => window.__card._stopPlayback());
  await playFirst(c);
  await wait(400);
  const r = await c.run(() => { const b = window.__card.$('dl'); return { hidden: b.hidden, shown: b.style.display !== 'none' }; });
  assert.deepEqual(r, { hidden: false, shown: true });
  await c.close();
});
