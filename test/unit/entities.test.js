import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ENT, TK, camConfig, detectCameras, findHubPrefix, modeIcon, prefixOf } from '../../src/entities.js';

const st = (state, attributes = {}) => ({ state, attributes });

test('prefixOf leitet den gemeinsamen Teil aus jeder Kamera-Entität ab', () => {
  assert.equal(prefixOf('camera.kamera_eingang_standardauflosung'), 'kamera_eingang');
  assert.equal(prefixOf('camera.front_door_fluent'), 'front_door');
  assert.equal(prefixOf('camera.garten_hochauflosung'), 'garten');
  assert.equal(prefixOf('camera.garten_schnappschusse_in_standardauflosung'), 'garten');
  assert.equal(prefixOf('camera.front_door_snapshots_clear'), 'front_door');
  assert.equal(prefixOf('camera.umbenannt'), null);
  assert.equal(prefixOf('sensor.garten_fluent'), null);
  assert.equal(prefixOf(undefined), null);
});

test('jeder interne Schlüssel gehört zu einer bekannten Entität', () => {
  for (const key of Object.keys(TK)) assert.ok(ENT[key], `TK.${key} ohne ENT-Eintrag`);
});

test('detectCameras findet Reolink-Kameras, nimmt den Gerätenamen und ignoriert fremde Kameras', () => {
  const hass = {
    states: {
      'camera.eingang_standardauflosung': st('idle', { friendly_name: 'Eingang Standardauflösung' }),
      'camera.garten_fluent': st('idle', { friendly_name: 'Garten Fluent' }),
      'camera.garten_hochauflosung': st('idle'),
      'camera.fremd_fluent': st('idle'),
    },
    entities: {
      'camera.eingang_standardauflosung': { platform: 'reolink', device_id: 'd1' },
      'camera.garten_fluent': { platform: 'reolink', device_id: 'd2' },
      'camera.fremd_fluent': { platform: 'onvif', device_id: 'd3' },
    },
    devices: { d1: { name: 'Kamera Eingang' }, d2: { name: 'Garten', name_by_user: 'Mein Garten' } },
  };
  assert.deepEqual(detectCameras(hass).map((c) => [c.prefix, c.name, c.device_id]), [
    ['eingang', 'Kamera Eingang', 'd1'],
    ['garten', 'Mein Garten', 'd2'],
  ]);
});

test('detectCameras ohne Geräteregister nutzt den Anzeigenamen', () => {
  const hass = { states: { 'camera.eingang_standardauflosung': st('idle', { friendly_name: 'Eingang Standardauflösung' }) } };
  assert.deepEqual(detectCameras(hass).map((c) => [c.prefix, c.name]), [['eingang', 'Eingang']]);
  assert.deepEqual(detectCameras(undefined), []);
});

test('findHubPrefix erkennt den Hub über Szenenmodus oder SD-Karte', () => {
  assert.equal(findHubPrefix({ states: { 'select.mein_hub_szenenmodus': st('home') } }), 'mein_hub');
  assert.equal(findHubPrefix({ states: { 'sensor.hub_sd_0_storage': st('2') } }), 'hub');
  assert.equal(findHubPrefix({ states: { 'select.x_scene_mode': st('home') }, entities: { 'select.x_scene_mode': { platform: 'other' } } }), null);
  assert.equal(findHubPrefix({ states: {} }), null);
});

test('modeIcon wählt passende Symbole in drei Sprachen', () => {
  const cases = {
    Away: 'shield-lock', Abwesend: 'shield-lock', Absent: 'shield-lock',
    Night: 'weather-night', Nacht: 'weather-night', Nuit: 'weather-night',
    Home: 'home', Zuhause: 'home', Maison: 'home',
    Off: 'bell-off', Aus: 'bell-off', Arrêt: 'bell-off',
    Unscharf: 'shield-off', Klingeln: 'doorbell', Urlaub: 'shield-lock', Gäste: 'circle-medium',
  };
  for (const [mode, icon] of Object.entries(cases)) assert.match(modeIcon(mode), new RegExp(icon), mode);
});

/* ---------- Direkt eingebundene Kameras ohne Hub ---------- */
const directHass = () => ({
  states: {
    'camera.einfahrt_fluent': st('idle'), 'select.einfahrt_scene_mode': st('home'), 'sensor.einfahrt_sd_0_storage': st('42'),
    'camera.entree_fluide': st('idle', { friendly_name: 'Entrée Fluide' }),
  },
  entities: {
    'camera.einfahrt_fluent': { entity_id: 'camera.einfahrt_fluent', device_id: 'dE', platform: 'reolink', translation_key: 'sub' },
    'select.einfahrt_scene_mode': { entity_id: 'select.einfahrt_scene_mode', device_id: 'dE', platform: 'reolink', translation_key: 'scene_mode' },
    'sensor.einfahrt_sd_0_storage': { entity_id: 'sensor.einfahrt_sd_0_storage', device_id: 'dE', platform: 'reolink' },
    'camera.entree_fluide': { entity_id: 'camera.entree_fluide', device_id: 'dF', platform: 'reolink', translation_key: 'sub' },
  },
  devices: { dE: { name: 'Einfahrt' }, dF: { name: 'Entrée' } },
});

test('ohne Hub: Szenenmodus und SD-Karte einer Kamera sind kein Hub', () => {
  assert.equal(findHubPrefix(directHass()), null);
  // auch ohne Geräteregister (nur über die Entity-IDs)
  const h = directHass(); delete h.entities;
  assert.equal(findHubPrefix(h), null);
});

test('mit Hub und direkter Kamera: der Hub wird gefunden', () => {
  const h = directHass();
  h.states['select.reolink_home_hub_scene_mode'] = st('home');
  h.entities['select.reolink_home_hub_scene_mode'] = { entity_id: 'select.reolink_home_hub_scene_mode', device_id: 'dH', platform: 'reolink' };
  assert.equal(findHubPrefix(h), 'reolink_home_hub');
});

test('Kameras über das Geräteregister, auch mit anderssprachigen IDs', () => {
  const cams = detectCameras(directHass());
  assert.deepEqual(cams.map((c) => [c.name, c.prefix, c.entity]), [
    ['Einfahrt', 'einfahrt', 'camera.einfahrt_fluent'],
    ['Entrée', 'entree_fluide', 'camera.entree_fluide'],
  ]);
  // jede Kamera nur einmal
  assert.equal(cams.filter((c) => c.name === 'Einfahrt').length, 1);
});

test('camConfig nimmt die Entität nur, wenn sich der Präfix nicht ableiten lässt', () => {
  const [a, b] = detectCameras(directHass());
  assert.deepEqual(camConfig(a), { name: 'Einfahrt', prefix: 'einfahrt', media_name: 'Einfahrt' });
  assert.deepEqual(camConfig(b), { name: 'Entrée', prefix: 'entree_fluide', media_name: 'Entrée', entity: 'camera.entree_fluide' });
});
