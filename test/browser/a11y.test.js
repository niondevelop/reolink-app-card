import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Jeder sichtbare Knopf hat einen Namen (Text oder aria-label), Schalter melden ihren Zustand */
const unnamed = (c) => c.run(() => [...window.__card.shadowRoot.querySelectorAll('button')]
  .filter((b) => b.offsetParent !== null && !(b.textContent || '').trim() && !b.getAttribute('aria-label'))
  .map((b) => b.id || b.dataset.id || b.className));

test('Live und Wiedergabe: alle Knöpfe benannt', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ name: 'Garten', prefix: 'garten', media_name: 'Garten' }, { name: 'Eingang', prefix: 'eingang' }], auto_live: true },
    hass: { states: { ...CAM_STATES, 'light.garten_flutlicht': 'off' }, mediaCameras: ['Garten'], files: ['08:00:00 0:00:30 Person'] } });
  await wait(300);
  assert.deepEqual(await unnamed(c), []);
  const light = await c.run(() => window.__card.shadowRoot.querySelector('[data-id="light"]').getAttribute('aria-pressed'));
  assert.equal(light, 'false');
  await c.click('#m-play');
  await wait(400);
  await c.run(() => window.__card.shadowRoot.querySelector('#list .item').click());
  await wait(200);
  assert.deepEqual(await unnamed(c), []);
  await c.close();
});
