import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const CFG = { cameras: [{ name: 'Garten', prefix: 'garten', media_name: 'Garten' }], auto_live: false, show_hub: false };
const open = (files) => openCard(browser, server, { config: CFG, hass: { states: CAM_STATES, mediaCameras: ['Garten'], files } });
const chips = (c) => c.run(() => [...window.__card.shadowRoot.querySelectorAll('#filters .chip')].map((b) => b.dataset.k));
const items = (c) => c.run(() => [...window.__card.shadowRoot.querySelectorAll('#list .item small')].map((s) => s.textContent));

test('Klingeln: eigener Typ und Filter, nur wenn am Tag vorhanden', async () => {
  const c = await open(['08:00:00 0:00:30 Person', '12:00:00 0:00:20 Person Doorbell', '18:00:00 0:00:20 Package']);
  await c.click('#m-play');
  await wait(400);
  assert.deepEqual(await chips(c), ['all', 'doorbell', 'person', 'vehicle', 'animal', 'package', 'motion']);
  assert.deepEqual(await items(c), ['Paket', 'Klingeln · Person', 'Person']);
  await c.click('#filters [data-k="doorbell"]');
  await wait(100);
  assert.deepEqual(await items(c), ['Klingeln · Person']);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('ohne seltene Ereignisse nur die üblichen Filter', async () => {
  const c = await open(['08:00:00 0:00:30 Person', '09:00:00 0:00:30 Motion']);
  await c.click('#m-play');
  await wait(400);
  assert.deepEqual(await chips(c), ['all', 'person', 'vehicle', 'animal', 'motion']);
  await c.close();
});
