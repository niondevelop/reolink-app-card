import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* iPhone: keine Fullscreen-API für Elemente. Dann Video im iOS-Player, sonst Bildfläche über den ganzen Bildschirm */
const img = ['idle', { entity_picture: '/x.jpg' }];
const CFG = { cameras: [{ prefix: 'hof' }], auto_live: false, show_hub: false };
const HASS = { states: { 'camera.hof_standardauflosung': img } };
const noApi = (c) => c.run(() => { delete Element.prototype.requestFullscreen; Element.prototype.requestFullscreen = undefined; Element.prototype.webkitRequestFullscreen = undefined; });
const tapFs = (c) => c.run(() => window.__card.shadowRoot.getElementById('fs').click());

test('ohne Fullscreen-API und ohne Video: Bildfläche füllt den Bildschirm, zweiter Tipp beendet', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS });
  await noApi(c);
  await tapFs(c);
  const on = await c.run(() => {
    const st = window.__card.shadowRoot.getElementById('stage'), r = st.getBoundingClientRect();
    return { cls: st.classList.contains('pseudofs'), w: Math.round(r.width) === innerWidth, h: Math.round(r.height) === innerHeight, icon: window.__card.shadowRoot.querySelector('#fs ha-icon').getAttribute('icon') };
  });
  assert.deepEqual(on, { cls: true, w: true, h: true, icon: 'mdi:fullscreen-exit' });
  await tapFs(c);
  assert.equal(await c.run(() => window.__card.shadowRoot.getElementById('stage').classList.contains('pseudofs')), false);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('ohne Fullscreen-API mit Live-Video: iOS-Player (webkitEnterFullscreen) im Shadow DOM', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS });
  await noApi(c);
  const used = await c.run(() => {
    // Livebild nachbilden: Player mit Video im Shadow DOM
    const host = document.createElement('div'), sr = host.attachShadow({ mode: 'open' }), v = document.createElement('video');
    Object.defineProperty(v, 'readyState', { get: () => 4 });
    window.__fs = 0; v.webkitEnterFullscreen = () => { window.__fs += 1; };
    sr.appendChild(v);
    window.__card.shadowRoot.getElementById('pic').appendChild(host);
    window.__card.shadowRoot.getElementById('fs').click();
    return { fs: window.__fs, pseudo: window.__card.shadowRoot.getElementById('stage').classList.contains('pseudofs') };
  });
  assert.deepEqual(used, { fs: 1, pseudo: false });
  await c.close();
});

test('Vollbild-Ersatz: auch in Container mit transform bildschirmfüllend, Escape beendet, Seite scrollt nicht', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS });
  await noApi(c);
  await c.run(() => { const w = document.getElementById('wrap'); w.style.transform = 'translateZ(0)'; w.style.width = '300px'; });
  await tapFs(c);
  let r = await c.run(() => {
    const st = window.__card.shadowRoot.getElementById('stage'), b = st.getBoundingClientRect();
    return { full: Math.round(b.width) === innerWidth && Math.round(b.height) === innerHeight && b.left === 0 && b.top === 0, overflow: document.documentElement.style.overflow };
  });
  assert.deepEqual(r, { full: true, overflow: 'hidden' });
  await c.page.keyboard.press('Escape');
  r = await c.run(() => ({ on: window.__card.shadowRoot.getElementById('stage').classList.contains('pseudofs'), overflow: document.documentElement.style.overflow }));
  assert.deepEqual(r, { on: false, overflow: '' });
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Abhängen der Karte: Vollbild-Ersatz endet, Listener am Dokument werden entfernt', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS });
  await noApi(c);
  const r = await c.run(() => {
    const added = new Map(), orig = { add: document.addEventListener, rm: document.removeEventListener };
    document.addEventListener = function (t, f, o) { added.set(f, (added.get(f) || 0) + 1); return orig.add.call(this, t, f, o); };
    document.removeEventListener = function (t, f, o) { if (added.has(f)) added.set(f, added.get(f) - 1); return orig.rm.call(this, t, f, o); };
    window.__card.shadowRoot.getElementById('fs').click();
    const during = [...added.values()].reduce((a, b) => a + b, 0);
    window.__card.remove();
    const left = [...added.values()].reduce((a, b) => a + b, 0);
    document.addEventListener = orig.add; document.removeEventListener = orig.rm;
    return { during: during > 0, left, overflow: document.documentElement.style.overflow, on: !!window.__card._pseudoFs };
  });
  assert.deepEqual(r, { during: true, left: 0, overflow: '', on: false });
  await c.close();
});
