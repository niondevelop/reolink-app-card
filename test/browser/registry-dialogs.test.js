import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Französische und umbenannte IDs, nur über das Geräteregister auffindbar */
const ENTS = {
  'camera.entree_fluide': 'sub', 'camera.entree_claire': 'main', 'light.entree_projecteur': 'floodlight',
  'siren.entree_sirene': 'siren', 'sensor.entree_signal_wifi': 'wifi_signal', 'binary_sensor.entree_personne': 'person',
  'switch.mein_umbenannter_record': 'record',
};
const states = {}, entities = {};
Object.entries(ENTS).forEach(([id, tk]) => {
  states[id] = [id.startsWith('camera') ? 'idle' : 'off', { entity_picture: '/x.jpg' }];
  entities[id] = { entity_id: id, device_id: 'devE', platform: 'reolink', translation_key: tk };
});
states['sensor.entree_signal_wifi'] = '3';
states['sensor.entree_batt'] = ['77', { device_class: 'battery', unit_of_measurement: '%' }];
entities['sensor.entree_batt'] = { entity_id: 'sensor.entree_batt', device_id: 'devE', platform: 'reolink' };
const HASS = { language: 'fr', states, entities, devices: { devE: { name: 'Entrée' } }, twoWay: false };
const CFG = { cameras: [{ entity: 'camera.entree_fluide' }], auto_live: false, show_hub: false };
const open = () => openCard(browser, server, { config: CFG, hass: HASS });

test('Entitäten über das Register (translation_key, Geräteklasse, Gerätename)', async () => {
  const c = await open();
  const r = await c.run(() => {
    const k = window.__card;
    return { ...Object.fromEntries(['cam_sd', 'cam_hd', 'light', 'siren', 'wifi', 'det_person', 'rec', 'battery'].map((x) => [x, k._e(x)])), name: k._cam.name, media: k._cam.media_name };
  });
  assert.deepEqual(r, {
    cam_sd: 'camera.entree_fluide', cam_hd: 'camera.entree_claire', light: 'light.entree_projecteur', siren: 'siren.entree_sirene',
    wifi: 'sensor.entree_signal_wifi', det_person: 'binary_sensor.entree_personne', rec: 'switch.mein_umbenannter_record',
    battery: 'sensor.entree_batt', name: 'Entrée', media: 'Entrée',
  });
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('gewählte Qualität wird auf dem Gerät gemerkt', async () => {
  const c = await open();
  const q = await c.run(() => {
    window.__card._setQuality('clear');
    const c2 = document.createElement('reolink-app-card');
    c2.setConfig({ cameras: [{ entity: 'camera.entree_fluide' }], auto_live: false, default_quality: 'fluent' });
    return c2._quality;
  });
  assert.equal(q, 'clear');
  await c.close();
});

test('Sirene fragt im eigenen Dialog nach; Abbrechen und Bestätigen', async () => {
  const c = await open();
  await c.click('[data-id="siren"]');
  await wait(50);
  assert.ok((await c.info()).dialog);
  await c.click('#dno');
  await wait(50);
  assert.equal((await c.info()).dialog, null);
  assert.ok(!(await c.rec()).calls.some((x) => x.startsWith('siren.')));
  await c.click('[data-id="siren"]');
  await wait(50);
  await c.click('#dyes');
  await wait(50);
  assert.equal((await c.info()).dialog, null);
  assert.ok((await c.rec()).calls.includes('siren.turn_on siren.entree_sirene'));
  await c.close();
});

test('Editor zeigt das Feld Audioausgabe', async () => {
  const c = await open();
  const has = await c.run(async () => {
    const ed = document.createElement('reolink-app-card-editor');
    document.body.appendChild(ed);
    ed.hass = window.__hass;
    ed.setConfig({ cameras: [{ entity: 'camera.entree_fluide' }] });
    await new Promise((r) => setTimeout(r, 100));
    const names = (sch) => sch.flatMap((x) => (x.schema ? names(x.schema) : [x.name]));
    return [...ed.shadowRoot.querySelectorAll('ha-form')].some((f) => names(f.schema || []).includes('audio'));
  });
  assert.equal(has, true);
  await c.close();
});
