import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardSuggestion } from '../../src/suggestions.js';

const st = (s) => ({ state: s, attributes: {} });
const hass = {
  language: 'de',
  states: {
    'camera.garten_standardauflosung': st('idle'), 'sensor.garten_batterie': st('80'),
    'camera.eingang_standardauflosung': st('idle'),
    'select.hub_szenenmodus': st('home'),
    'light.wohnzimmer': st('on'),
  },
  entities: {
    'camera.garten_standardauflosung': { platform: 'reolink', device_id: 'n' },
    'sensor.garten_batterie': { platform: 'reolink', device_id: 'n' },
    'camera.eingang_standardauflosung': { platform: 'reolink', device_id: 's' },
    'select.hub_szenenmodus': { platform: 'reolink', device_id: 'h' },
  },
  devices: { n: { name: 'Garten' }, s: { name: 'Eingang' }, h: { name: 'Hub' } },
};
const summary = (r) => r && r.map((x) => `${x.label} → ${x.config.cameras.map((c) => c.prefix).join('+')}`);

test('Entität einer Kamera: diese Kamera und alle Kameras', () => {
  assert.deepEqual(summary(cardSuggestion(hass, 'sensor.garten_batterie')), ['Reolink App Card – Garten → garten', 'Reolink App Card – Alle Kameras → eingang+garten']);
});

test('Entität des Hubs: alle Kameras', () => {
  assert.deepEqual(summary(cardSuggestion(hass, 'select.hub_szenenmodus')), ['Reolink App Card – Alle Kameras → eingang+garten']);
});

test('fremde Entität: kein Vorschlag', () => {
  assert.equal(cardSuggestion(hass, 'light.wohnzimmer'), null);
  assert.equal(cardSuggestion({ states: {} }, 'camera.x'), null);
});

test('Vorschlag ist eine gültige Kartenkonfiguration', () => {
  const [first] = cardSuggestion(hass, 'camera.garten_standardauflosung');
  assert.equal(first.config.type, 'custom:reolink-app-card');
  assert.deepEqual(first.config.cameras[0], { name: 'Garten', prefix: 'garten', media_name: 'Garten' });
});
