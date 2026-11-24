import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Einstellungen: jede Gruppe klappt für sich auf und zu – auch alle zu oder mehrere offen */
const STATES = {
  'camera.hof_standardauflosung': ['idle', { entity_picture: '/x.jpg' }],
  'switch.hof_aufzeichnen': 'on', 'number.hof_bewegungsempfindlichkeit': ['35', { min: 1, max: 50, step: 1 }],
  'select.hof_flutlicht_modus': ['auto', { options: ['off', 'auto'] }],
};
const groups = (c) => c.run(() => [...window.__card.shadowRoot.querySelectorAll('#settings .grp')].map((g) => g.classList.contains('open')));
const tap = (c, i) => c.run((n) => window.__card.shadowRoot.querySelectorAll('#settings .gh')[n].click(), i);

test('Einstellungen: Gruppen einzeln auf- und zuklappen, 0 oder mehrere offen', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'hof' }], auto_live: false, show_hub: false }, hass: { states: STATES } });
  await c.run(() => { window.__card._settingsOpen = true; window.__card._update(); });
  await wait(100);
  assert.deepEqual(await groups(c), [true, false]);
  await tap(c, 0);
  assert.deepEqual(await groups(c), [false, false], 'alle zu');
  await tap(c, 0);
  await tap(c, 1);
  assert.deepEqual(await groups(c), [true, true], 'zwei offen');
  // Zustand bleibt bei Aktualisierungen von Home Assistant erhalten
  await c.run(() => window.setState('switch.hof_aufzeichnen', 'off'));
  await wait(100);
  assert.deepEqual(await groups(c), [true, true]);
  assert.deepEqual(c.errors, []);
  await c.close();
});
