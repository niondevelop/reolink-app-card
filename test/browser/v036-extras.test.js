import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const STATES = {
  ...CAM_STATES,
  'sensor.garten_batterie': ['76', {}], 'sensor.garten_wlan_signal': ['3', {}],
  'binary_sensor.garten_bewegung': ['on', { device_class: 'motion' }], 'binary_sensor.garten_person': ['on', {}],
  'binary_sensor.garten_tier': ['on', {}], 'binary_sensor.garten_fahrzeug': ['on', {}],
};

test('Akku: Antippen des Ladestands öffnet den Verlauf (Detailfenster)', async () => {
  const c = await openCard(browser, server, { hass: { states: STATES } });
  const got = await c.run(() => new Promise((res) => {
    window.addEventListener('hass-more-info', (e) => res(e.detail.entityId), { once: true });
    window.__card.shadowRoot.querySelector('#stat .bat').click();
  }));
  assert.equal(got, 'sensor.garten_batterie');
  await c.close();
});

test('Kein doppelter Hinweis: Kamera im Bild bzw. Sprung dorthin zeigt nur die Erkennungs-Pill', async () => {
  const S = { ...CAM_STATES, 'binary_sensor.garten_person': ['off', {}], 'binary_sensor.eingang_person': ['off', {}] };
  const c = await openCard(browser, server, { hass: { states: S } });
  const fire = (id) => c.run((e) => { const h = window.__card._hass; const st = { ...h.states, [e]: { ...h.states[e], state: 'on' } }; window.__card.hass = { ...h, states: st }; }, id);
  const toast = () => c.run(() => window.__card.shadowRoot.getElementById('toast').classList.contains('show'));
  await fire('binary_sensor.eingang_person'); // andere Kamera: Karte springt hin
  await wait(300);
  const r1 = await c.run(() => ({ idx: window.__card._idx, pills: window.__card.shadowRoot.querySelectorAll('#det .pill').length }));
  assert.deepEqual(r1, { idx: 1, pills: 1 });
  assert.equal(await toast(), false, 'kein Hinweis zusätzlich zur Pill');
  await c.close();
  // Ohne Sprung (auto_switch: false) zeigt der Hinweis die andere Kamera an
  const d = await openCard(browser, server, { hass: { states: S }, config: { cameras: [{ name: 'Garten', prefix: 'garten' }, { name: 'Eingang', prefix: 'eingang' }], auto_switch: false, show_hub: false } });
  await d.run((e) => { const h = window.__card._hass; window.__card.hass = { ...h, states: { ...h.states, [e]: { ...h.states[e], state: 'on' } } }; }, 'binary_sensor.eingang_person');
  await wait(300);
  assert.equal(await d.run(() => window.__card.shadowRoot.getElementById('toast').classList.contains('show')), true);
  await d.close();
});

test('Raster: Spaltenzahl einstellbar (grid_columns)', async () => {
  const cols = async (config) => {
    const c = await openCard(browser, server, { hass: { states: CAM_STATES }, config: { cameras: [{ prefix: 'garten' }, { prefix: 'eingang' }], show_hub: false, ...config } });
    await c.click('#gridbtn');
    await wait(200);
    const v = await c.run(() => getComputedStyle(window.__card.shadowRoot.getElementById('grid')).gridTemplateColumns.split(' ').length);
    await c.close();
    return v;
  };
  assert.equal(await cols({}), 2);
  assert.equal(await cols({ grid_columns: 3 }), 3);
  assert.equal(await cols({ grid_columns: '1' }), 1);
});
