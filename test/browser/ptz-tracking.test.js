import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Einstellungen „PTZ & Tracking“: automatisches Tracking, Rückkehr zur Startposition, Patrouille */
const img = ['idle', { entity_picture: '/x.jpg' }];
const sets = (c) => c.run(() => window.__card._settingGroups().map((g) => [g.g, g.items.map((i) => i.id)]));

test('PTZ & Tracking: deutsche Namen ohne Register', async () => {
  const states = {
    'camera.hof_standardauflosung': img, 'switch.hof_automatisches_tracking': 'off',
    'switch.hof_automatisch_zur_startposition': 'on', 'number.hof_ruckkehrzeit_zur_startposition': ['60', { min: 10, max: 300, step: 1 }],
  };
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'hof' }], auto_live: false, show_hub: false }, hass: { states } });
  const g = Object.fromEntries(await sets(c));
  assert.deepEqual(g.g_ptz, ['switch.hof_automatisches_tracking', 'switch.hof_automatisch_zur_startposition', 'number.hof_ruckkehrzeit_zur_startposition']);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('PTZ & Tracking: über das Register (englische Schlüssel, umbenannte Entitäten)', async () => {
  const E = { 'camera.cam_fluent': ['sub', img], 'switch.x_track': ['auto_tracking', 'on'], 'select.x_method': ['auto_track_method', ['digital', { options: ['digital', 'pan_tilt'] }]], 'switch.x_home': ['gaurd_return', 'on'], 'switch.x_patrol': ['ptz_patrol', 'off'] };
  const states = {}, entities = {};
  Object.entries(E).forEach(([id, [tk, st]]) => { states[id] = st; entities[id] = { entity_id: id, device_id: 'd1', platform: 'reolink', translation_key: tk }; });
  const c = await openCard(browser, server, { config: { cameras: [{ entity: 'camera.cam_fluent' }], auto_live: false, show_hub: false }, hass: { states, entities, devices: { d1: { name: 'Cam' } } } });
  const g = Object.fromEntries(await sets(c));
  assert.deepEqual(g.g_ptz, ['switch.x_track', 'select.x_method', 'switch.x_home', 'switch.x_patrol']);
  await c.close();
});
