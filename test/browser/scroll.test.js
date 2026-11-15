import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Viele Filter in einer schmalen Karte, damit die Zeile scrollt */
const FILES = ['08:00:00 0:00:30 Person Doorbell', '09:00:00 0:00:20 Package', '10:00:00 0:00:20 Face', '11:00:00 0:00:20 Crossline', '12:00:00 0:00:20 Crying'];
const open = async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ name: 'Garten', prefix: 'garten', media_name: 'Garten' }], auto_live: false, show_hub: false },
    hass: { states: CAM_STATES, mediaCameras: ['Garten'], files: FILES } });
  await c.click('#m-play');
  await wait(400);
  return c;
};
const row = (c) => c.run(() => { const f = window.__card.shadowRoot.getElementById('filters'); const r = f.getBoundingClientRect();
  return { left: f.scrollLeft, max: f.scrollWidth - f.clientWidth, x: r.x, y: r.y + r.height / 2, w: r.width, cls: f.className }; });

test('Filterzeile: mit der Maus ziehen scrollt, ohne einen Filter zu wählen', async () => {
  const c = await open();
  const r = await row(c);
  assert.ok(r.max > 0, 'Zeile muss scrollen können');
  assert.match(r.cls, /more-r/);
  await c.page.mouse.move(r.x + r.w - 20, r.y);
  await c.page.mouse.down();
  await c.page.mouse.move(r.x + 40, r.y, { steps: 8 });
  await c.page.mouse.up();
  await wait(100);
  const after1 = await row(c);
  assert.ok(after1.left > 0);
  assert.match(after1.cls, /more-l/);
  assert.equal(await c.run(() => window.__card._filter), 'all');
  await c.close();
});

test('Filterzeile: Mausrad scrollt seitlich, Klick wählt weiterhin', async () => {
  const c = await open();
  const r = await row(c);
  await c.page.mouse.move(r.x + 30, r.y);
  await c.page.mouse.wheel(0, 200);
  await wait(100);
  assert.ok((await row(c)).left > 0);
  await c.click('#filters [data-k="person"]');
  await wait(50);
  assert.equal(await c.run(() => window.__card._filter), 'person');
  await c.close();
});
