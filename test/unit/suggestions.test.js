import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardSuggestion } from '../../src/suggestions.js';

const st = (s) => ({ state: s, attributes: {} });
const hass = {
  language: 'de',
  states: {
    'camera.nord_standardauflosung': st('idle'), 'sensor.nord_batterie': st('80'),
    'camera.sued_standardauflosung': st('idle'),
    'select.hub_szenenmodus': st('home'),
    'light.wohnzimmer': st('on'),
  },
  entities: {
    'camera.nord_standardauflosung': { platform: 'reolink', device_id: 'n' },
    'sensor.nord_batterie': { platform: 'reolink', device_id: 'n' },
    'camera.sued_standardauflosung': { platform: 'reolink', device_id: 's' },
    'select.hub_szenenmodus': { platform: 'reolink', device_id: 'h' },
  },
  devices: { n: { name: 'Nord' }, s: { name: 'Süd' }, h: { name: 'Hub' } },
};
const summary = (r) => r && r.map((x) => `${x.label} → ${x.config.cameras.map((c) => c.prefix).join('+')}`);

test('Entität einer Kamera: diese Kamera und alle Kameras', () => {
  assert.deepEqual(summary(cardSuggestion(hass, 'sensor.nord_batterie')), ['Reolink App Card – Nord → nord', 'Reolink App Card – Alle Kameras → nord+sued']);
});

test('Entität des Hubs: alle Kameras', () => {
  assert.deepEqual(summary(cardSuggestion(hass, 'select.hub_szenenmodus')), ['Reolink App Card – Alle Kameras → nord+sued']);
});

test('fremde Entität: kein Vorschlag', () => {
  assert.equal(cardSuggestion(hass, 'light.wohnzimmer'), null);
  assert.equal(cardSuggestion({ states: {} }, 'camera.x'), null);
});

test('Vorschlag ist eine gültige Kartenkonfiguration', () => {
  const [first] = cardSuggestion(hass, 'camera.nord_standardauflosung');
  assert.equal(first.config.type, 'custom:reolink-app-card');
  assert.deepEqual(first.config.cameras[0], { name: 'Nord', prefix: 'nord', media_name: 'Nord' });
});
