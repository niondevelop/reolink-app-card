import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const FILES = ['06:00:00 0:00:30 Person', '12:00:00 0:00:20 Vehicle', '18:00:00 0:00:20 Animal'];
const open = async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ name: 'Garten', prefix: 'garten', media_name: 'Garten' }], auto_live: false, show_hub: false },
    hass: { states: CAM_STATES, mediaCameras: ['Garten'], files: FILES } });
  await c.click('#m-play');
  await wait(400);
  return c;
};
const clickAt = async (c, hour) => {
  const r = await c.run(() => { const b = window.__card.shadowRoot.getElementById('tlbar').getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
  await c.page.mouse.click(r.x + (r.w * hour) / 24, r.y + r.h / 2);
  await wait(200);
};

test('Tippen auf eine Lücke der Zeitleiste spielt den nächsten Clip, der laufende ist markiert', async () => {
  const c = await open();
  await clickAt(c, 9);
  assert.equal((await c.info()).playing, '12:00:00');
  const marked = await c.run(() => [...window.__card.shadowRoot.querySelectorAll('#tlbar i.cur')].length);
  assert.equal(marked, 1);
  assert.equal(await c.run(() => window.__card.shadowRoot.getElementById('ph').style.display), '');
  await clickAt(c, 23);
  assert.equal((await c.info()).playing, '18:00:00');
  await c.close();
});

test('Tastenkürzel: Leertaste startet, Pfeile wechseln den Clip', async () => {
  const c = await open();
  await c.run(() => window.__card.shadowRoot.getElementById('stage').focus());
  await c.run(() => window.__card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, composed: true })));
  await wait(200);
  assert.equal((await c.info()).playing, '18:00:00');
  await c.run(() => window.__card.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true })));
  await wait(200);
  assert.equal((await c.info()).playing, '12:00:00');
  await c.run(() => window.__card.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true })));
  await wait(200);
  assert.equal((await c.info()).playing, '18:00:00');
  await c.close();
});
