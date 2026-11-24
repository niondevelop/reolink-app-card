import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Direkt eingebundene TrackMix: die Integration behandelt sie als Kamera mit zwei Objektiven */
const img = ['idle', { entity_picture: '/x.jpg' }];
const reg = (id, tk) => ({ entity_id: id, device_id: 'dT', platform: 'reolink', translation_key: tk });
const ENTS = {
  'camera.trackmix_fluent_lens_0': 'sub_lens_0', 'camera.trackmix_clear_lens_0': 'main_lens_0',
  'camera.trackmix_fluent_lens_1': 'sub_lens_1', 'camera.trackmix_snapshots_fluent_lens_0': 'snapshots_sub_lens_0',
  'light.trackmix_floodlight': 'floodlight', 'button.trackmix_ptz_left': 'ptz_left',
};
const states = {}, entities = {};
Object.entries(ENTS).forEach(([id, tk]) => { states[id] = id.startsWith('camera') ? img : 'off'; entities[id] = reg(id, tk); });
const HASS = (model) => ({
  states, entities, devices: { dT: { name: 'TrackMix', model } },
  mediaCameras: ['TrackMix lens 0', 'TrackMix lens 1'], files: ['08:00:00 0:00:40 Person'],
});
const CFG = { cameras: [{ entity: 'camera.trackmix_fluent_lens_0' }], auto_live: false, show_hub: false };

test('TrackMix ohne Hub: Streams, Name, Tele-Stufe', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS('TrackMix WiFi') });
  const r = await c.run(() => {
    const k = window.__card;
    return { name: k._cam.name, sd: k._e('cam_sd'), hd: k._e('cam_hd'), tele: k._e('cam_tele'), snap: k._e('snap'), light: k._e('light'),
      avail: k._qAvail(), label: k._qLabel('tele') };
  });
  assert.deepEqual(r, {
    name: 'TrackMix', sd: 'camera.trackmix_fluent_lens_0', hd: 'camera.trackmix_clear_lens_0', tele: 'camera.trackmix_fluent_lens_1',
    snap: 'camera.trackmix_snapshots_fluent_lens_0', light: 'light.trackmix_floodlight', avail: ['fluent', 'clear', 'tele'], label: 'Tele',
  });
  // Qualitätsmenü: Tele wählbar, Livebild nutzt das zweite Objektiv
  await c.run(() => window.__card._setQuality('tele'));
  await c.click('#bigplay');
  await wait(300);
  const used = await c.run(() => window.__card.shadowRoot.querySelector('#pic ha-camera-stream').dataset.entity);
  assert.equal(used, 'camera.trackmix_fluent_lens_1');
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Duo: zweites Objektiv heisst „2. Objektiv“', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS('Reolink Duo WiFi') });
  assert.equal(await c.run(() => window.__card._qLabel('tele')), '2. Objektiv');
  await c.close();
});

test('Wiedergabe nimmt das erste Objektiv', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS('TrackMix WiFi') });
  await c.click('#m-play');
  await wait(400);
  await c.run(() => window.__card.shadowRoot.querySelector('#list .item').click());
  await wait(200);
  assert.match((await c.rec()).resolved.at(-1), /^R\|0\|/);
  await c.close();
});

test('Editor und Vorschläge finden die TrackMix', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: HASS('TrackMix WiFi') });
  const stub = await c.run(() => customElements.get('reolink-app-card').getStubConfig(window.__hass));
  assert.deepEqual(stub.cameras, [{ name: 'TrackMix', prefix: 'trackmix', media_name: 'TrackMix', entity: 'camera.trackmix_fluent_lens_0' }]);
  await c.close();
});

/* So, wie die Card bisher eingerichtet wurde bzw. wie man sich vertippen kann */
for (const [label, cam] of [['nur prefix (alte Konfiguration)', { prefix: 'trackmix' }], ['Entity-ID unter prefix', { prefix: 'camera.trackmix_fluent_lens_0' }]]) {
  test(`TrackMix mit ${label}: Bild und Tele`, async () => {
    const c = await openCard(browser, server, { config: { ...CFG, cameras: [cam] }, hass: HASS('TrackMix WiFi') });
    const r = await c.run(() => ({ sd: window.__card._e('cam_sd'), avail: window.__card._qAvail() }));
    assert.deepEqual(r, { sd: 'camera.trackmix_fluent_lens_0', avail: ['fluent', 'clear', 'tele'] });
    await c.close();
  });
}

test('deutsche Entity-IDs mit „objektiv“', async () => {
  const ids = { 'camera.garten_standardauflosung_objektiv_0': 'sub_lens_0', 'camera.garten_standardauflosung_objektiv_1': 'sub_lens_1' };
  const st = {}, en = {};
  Object.entries(ids).forEach(([id, tk]) => { st[id] = img; en[id] = { entity_id: id, device_id: 'dG', platform: 'reolink', translation_key: tk }; });
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'garten' }], auto_live: false, show_hub: false },
    hass: { states: st, entities: en, devices: { dG: { name: 'Garten', model: 'TrackMix WiFi' } } } });
  const r = await c.run(() => ({ sd: window.__card._e('cam_sd'), tele: window.__card._e('cam_tele') }));
  assert.deepEqual(r, { sd: 'camera.garten_standardauflosung_objektiv_0', tele: 'camera.garten_standardauflosung_objektiv_1' });
  await c.close();
});

test('TrackMix ohne Hub: Tele-Aufnahmen vom zweiten Objektiv', async () => {
  const c = await openCard(browser, server, { config: CFG, hass: { ...HASS('TrackMix WiFi'), resolutions: true } });
  await c.click('#m-play');
  await wait(400);
  const btns = () => c.run(() => [...window.__card.shadowRoot.querySelectorAll('#pq button')].filter((b) => b.style.display !== 'none').map((b) => b.textContent));
  assert.deepEqual(await btns(), ['Niedrig', 'Hoch', 'Tele']);
  await c.click('#pq [data-q="tele"]');
  await wait(400);
  await c.run(() => window.__card.shadowRoot.querySelector('#list .item').click());
  await wait(200);
  assert.match((await c.rec()).resolved.at(-1), /^R\|1\|/); // „TrackMix lens 1“
  await c.close();
});

/* Eigene Kachel je Objektiv: Entität „… objektiv 1“ (oder lens: 1) zeigt Livebild und Aufnahmen des zweiten Objektivs */
const L1 = {
  'camera.hof_standardauflosung_objektiv_0': 'sub_lens_0', 'camera.hof_standardauflosung_objektiv_1': 'sub_lens_1',
  'camera.hof_ost_hochauflosung_objektiv_0': 'main_lens_0', 'camera.hof_ost_hochauflosung_objektiv_1': 'main_lens_1',
  'button.hof_ptz_links': 'ptz_left', 'binary_sensor.hof_person': 'person',
};
const l1st = {}, l1en = {};
Object.entries(L1).forEach(([id, tk]) => { l1st[id] = id.startsWith('camera') ? img : 'off'; l1en[id] = { entity_id: id, device_id: 'dH', platform: 'reolink', translation_key: tk }; });
const L1HASS = { states: l1st, entities: l1en, devices: { dH: { name: 'Hof', model: 'OMVI 3i PoE' } }, mediaCameras: ['Hof lens 0', 'Hof lens 1'], files: ['08:00:00 0:00:40 Person'], resolutions: true };

for (const [label, cam] of [['Entität des zweiten Objektivs', { entity: 'camera.hof_standardauflosung_objektiv_1' }], ['lens: 1', { prefix: 'hof', lens: 1 }]]) {
  test(`Zweites Objektiv als eigene Kachel (${label}): Streams, Name, PTZ`, async () => {
    const c = await openCard(browser, server, { config: { cameras: [{ entity: 'camera.hof_standardauflosung_objektiv_0' }, cam], auto_live: false, show_hub: false }, hass: L1HASS });
    const r = await c.run(() => {
      const k = window.__card, [a, b] = k._cams;
      return { a: [k._e('cam_sd', a), k._e('cam_hd', a), k._e('cam_tele', a).replace('camera.rac_none', 'camera.hof_rac_none')], b: [k._e('cam_sd', b), k._e('cam_hd', b)], bTele: !!k._st(k._e('cam_tele', b)), names: [a.name, b.name], ptz: k._hasPtz(b) };
    });
    assert.deepEqual(r, {
      a: ['camera.hof_standardauflosung_objektiv_0', 'camera.hof_ost_hochauflosung_objektiv_0', 'camera.hof_rac_none_cam_tele'],
      b: ['camera.hof_standardauflosung_objektiv_1', 'camera.hof_ost_hochauflosung_objektiv_1'],
      bTele: false, names: ['Hof', 'Hof – 2. Objektiv'], ptz: true,
    });
    assert.deepEqual(c.errors, []);
    await c.close();
  });
}

test('Zweites Objektiv als eigene Kachel: Aufnahmen vom zweiten Objektiv, ohne Objektiv-Umschalter', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ entity: 'camera.hof_standardauflosung_objektiv_1' }], auto_live: false, show_hub: false }, hass: L1HASS });
  await c.click('#m-play');
  await wait(400);
  const btns = await c.run(() => [...window.__card.shadowRoot.querySelectorAll('#pq button')].filter((b) => b.style.display !== 'none').map((b) => b.textContent));
  assert.deepEqual(btns, ['Niedrig', 'Hoch']);
  await c.run(() => window.__card.shadowRoot.querySelector('#list .item').click());
  await wait(200);
  assert.match((await c.rec()).resolved.at(-1), /^R\|1\|/); // „Hof lens 1“
  assert.deepEqual(c.errors, []);
  await c.close();
});

/* Editor: Auswahl des Objektivs, „+ Kamera“ bietet das zweite Objektiv an */
const openEditor = (c, config) => c.run(async (cfg) => {
  const ed = document.createElement('reolink-app-card-editor');
  document.body.appendChild(ed);
  ed.hass = window.__hass;
  ed.addEventListener('config-changed', (e) => { window.__edCfg = e.detail.config; });
  ed.setConfig(cfg);
  await new Promise((r) => setTimeout(r, 100));
  window.__ed = ed;
}, config);

test('Editor: Objektiv wählen und zweites Objektiv hinzufügen', async () => {
  const cfg = { cameras: [{ prefix: 'hof', name: 'Hof', entity: 'camera.hof_standardauflosung_objektiv_0' }], auto_live: false, show_hub: false };
  const c = await openCard(browser, server, { config: cfg, hass: L1HASS });
  await openEditor(c, cfg);
  const r = await c.run(async () => {
    const ed = window.__ed, f = ed.shadowRoot.querySelector('#cams ha-form');
    const fields = f.schema.map((s) => s.name), lens0 = f.data.lens;
    f.dispatchEvent(new CustomEvent('value-changed', { detail: { value: { ...f.data, lens: '1' } } }));
    const set1 = window.__edCfg.cameras[0];
    f.dispatchEvent(new CustomEvent('value-changed', { detail: { value: { ...f.data, lens: '0' } } }));
    const set0 = window.__edCfg.cameras[0];
    ed.setConfig(window.__edCfg);
    ed.shadowRoot.getElementById('add').click();
    const added = window.__edCfg.cameras[1];
    ed.setConfig(window.__edCfg);
    await new Promise((res) => setTimeout(res, 50));
    const title = ed.shadowRoot.querySelectorAll('#cams .ch b')[1].textContent;
    return { fields, lens0, set1, set0, added, title };
  });
  assert.deepEqual(r.fields.slice(0, 3), ['prefix', '', 'lens']);
  assert.equal(r.lens0, '0');
  assert.deepEqual(r.set1, { prefix: 'hof', name: 'Hof', entity: 'camera.hof_standardauflosung_objektiv_0', lens: 1 });
  assert.deepEqual(r.set0, { prefix: 'hof', name: 'Hof', entity: 'camera.hof_standardauflosung_objektiv_0' });
  assert.deepEqual(r.added, { prefix: 'hof', media_name: 'Hof', entity: 'camera.hof_standardauflosung_objektiv_0', lens: 1 });
  assert.equal(r.title, 'Hof – 2. Objektiv (Tele)');
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Editor: Kamera mit einem Objektiv hat kein Feld „Objektiv“', async () => {
  const st = { 'camera.tor_standardauflosung': img }, en = { 'camera.tor_standardauflosung': { entity_id: 'camera.tor_standardauflosung', device_id: 'dX', platform: 'reolink', translation_key: 'sub' } };
  const cfg = { cameras: [{ prefix: 'tor' }], auto_live: false, show_hub: false };
  const c = await openCard(browser, server, { config: cfg, hass: { states: st, entities: en, devices: { dX: { name: 'Tor' } } } });
  await openEditor(c, cfg);
  const fields = await c.run(() => window.__ed.shadowRoot.querySelector('#cams ha-form').schema.map((s) => s.name));
  assert.ok(!fields.includes('lens'));
  await c.close();
});

test('Beide Objektive als eigene Kameras: Objektiv 0 bietet „2. Objektiv“ weder live noch in der Wiedergabe an', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ entity: 'camera.hof_standardauflosung_objektiv_0' }, { entity: 'camera.hof_standardauflosung_objektiv_1' }], auto_live: false, show_hub: false }, hass: L1HASS });
  assert.deepEqual(await c.run(() => window.__card._qAvail()), ['fluent', 'clear']);
  await c.click('#m-play');
  await wait(400);
  const btns = await c.run(() => [...window.__card.shadowRoot.querySelectorAll('#pq button')].filter((b) => b.style.display !== 'none').map((b) => b.textContent));
  assert.deepEqual(btns, ['Niedrig', 'Hoch']);
  await c.run(() => window.__card.shadowRoot.querySelector('#list .item').click());
  await wait(200);
  assert.match((await c.rec()).resolved.at(-1), /^R\|0\|/); // „Hof lens 0“
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Nur Objektiv 0 eingetragen: „2. Objektiv“ bleibt wie bisher', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ entity: 'camera.hof_standardauflosung_objektiv_0' }], auto_live: false, show_hub: false }, hass: L1HASS });
  assert.deepEqual(await c.run(() => window.__card._qAvail()), ['fluent', 'clear', 'tele']);
  await c.close();
});

test('Zwei Objektiv-Kacheln: eine Erkennung, ein Hinweis, die gewählte Kachel bleibt', async () => {
  const states = { ...L1HASS.states, 'camera.tor_standardauflosung': img, 'binary_sensor.tor_person': 'off' };
  const c = await openCard(browser, server, { config: { cameras: [{ entity: 'camera.tor_standardauflosung' }, { entity: 'camera.hof_standardauflosung_objektiv_0' }, { entity: 'camera.hof_standardauflosung_objektiv_1' }], auto_live: false, show_hub: false, auto_switch: true }, hass: { ...L1HASS, states } });
  // Tor gewählt: Erkennung am Hof wechselt auf die erste Kachel des Geräts (Objektiv 0), nicht auf Objektiv 1
  await c.run(() => { window.__toasts = []; const k = window.__card, t = k._toast.bind(k); k._toast = (x) => { window.__toasts.push(x.text); t(x); }; window.setState('binary_sensor.hof_person', 'on'); });
  await wait(100);
  let r = await c.run(() => ({ idx: window.__card._idx, toasts: window.__toasts.length }));
  assert.deepEqual(r, { idx: 1, toasts: 1 });
  // Objektiv 1 gewählt: neue Erkennung lässt die Auswahl dort
  await c.run(() => { window.__card._idx = 2; window.__card._rebuildCamera(); window.setState('binary_sensor.hof_person', 'off'); });
  await wait(50);
  await c.run(() => { window.__toasts = []; window.setState('binary_sensor.hof_person', 'on'); });
  await wait(100);
  r = await c.run(() => ({ idx: window.__card._idx, toasts: window.__toasts.length }));
  assert.deepEqual(r, { idx: 2, toasts: 1 });
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Editor: Kamerawechsel setzt das Objektiv zurück; Objektiv-1-Kachel nur mit entity wird nicht erneut angeboten', async () => {
  const states = { ...L1HASS.states, 'camera.tor_standardauflosung': img };
  const cfg = { cameras: [{ entity: 'camera.hof_standardauflosung_objektiv_0' }, { entity: 'camera.hof_standardauflosung_objektiv_1' }, { prefix: 'hof', lens: 1 }], auto_live: false, show_hub: false };
  const c = await openCard(browser, server, { config: cfg, hass: { ...L1HASS, states } });
  await openEditor(c, cfg);
  const r = await c.run(async () => {
    const ed = window.__ed, f = ed.shadowRoot.querySelectorAll('#cams ha-form')[2];
    f.dispatchEvent(new CustomEvent('value-changed', { detail: { value: { ...f.data, prefix: 'tor' } } }));
    const switched = window.__edCfg.cameras[2];
    const cfg2 = { ...window.__edCfg, cameras: window.__edCfg.cameras.slice(0, 2) };
    ed.setConfig(cfg2);
    ed.shadowRoot.getElementById('add').click();
    return { switched, added: window.__edCfg.cameras[2] };
  });
  assert.equal(r.switched.prefix, 'tor');
  assert.equal(r.switched.lens, undefined);
  assert.notEqual(r.added.lens, 1);
  assert.deepEqual(c.errors, []);
  await c.close();
});

/* TrackMix an Hub/NVR: zweites Objektiv heißt „Tele“ (telephoto_sub, Aufnahmeordner autotrack_*) */
const HUB = {
  'camera.tm_fluent': 'sub', 'camera.tm_clear': 'main', 'camera.tm_telephoto_fluent': 'telephoto_sub',
};
const hubSt = {}, hubEn = {};
Object.entries(HUB).forEach(([id, tk]) => { hubSt[id] = img; hubEn[id] = { entity_id: id, device_id: 'dT', platform: 'reolink', translation_key: tk }; });
const HUBHASS = { states: hubSt, entities: hubEn, devices: { dT: { name: 'TrackMix', model: 'TrackMix PoE' } }, mediaCameras: ['TrackMix'], files: ['08:00:00 0:00:40 Person'], resolutions: true, telephoto: true };

test('TrackMix an Hub: lens 1 nimmt den Tele-Stream und die Tele-Aufnahmen; Objektiv 0 ohne Tele-Stufe', async () => {
  const cfg = { cameras: [{ entity: 'camera.tm_fluent', media_name: 'TrackMix' }, { entity: 'camera.tm_fluent', media_name: 'TrackMix', lens: 1 }], auto_live: false, show_hub: false };
  const c = await openCard(browser, server, { config: cfg, hass: HUBHASS });
  const r = await c.run(() => {
    const k = window.__card, [a, b] = k._cams;
    const avail = (cam) => { const o = k._cam; k._idx = k._cams.indexOf(cam); const v = k._qAvail(); k._idx = k._cams.indexOf(o); return v; };
    return { bSd: k._e('cam_sd', b), bHd: !!k._st(k._e('cam_hd', b)), aAvail: avail(a), bAvail: avail(b), names: [a.name, b.name] };
  });
  assert.deepEqual(r, { bSd: 'camera.tm_telephoto_fluent', bHd: false, aAvail: ['fluent', 'clear'], bAvail: ['fluent'], names: ['TrackMix', 'TrackMix – Tele'] });
  await c.run(() => window.__card._select(1));
  await c.click('#m-play');
  await wait(400);
  const btns = await c.run(() => [...window.__card.shadowRoot.querySelectorAll('#pq button')].filter((x) => x.style.display !== 'none').map((x) => x.textContent));
  assert.deepEqual(btns, ['Niedrig', 'Hoch']);
  await c.run(() => window.__card.shadowRoot.querySelector('#list .item').click());
  await wait(200);
  assert.match((await c.rec()).resolved.at(-1), /\|RES\|autotrack_sub\|/);
  await openEditor(c, cfg);
  const fields = await c.run(() => window.__ed.shadowRoot.querySelector('#cams ha-form').schema.map((s) => s.name));
  assert.ok(fields.includes('lens'));
  assert.deepEqual(c.errors, []);
  await c.close();
});
