import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Knopfleiste: eingebaute Knöpfe ein-/ausblenden und anordnen, eigene Knöpfe für Licht, Türöffner usw. */
const img = ['idle', { entity_picture: '/x.jpg' }];
const STATES = {
  'camera.haustur_standardauflosung': img, 'camera.garten_standardauflosung': img,
  'siren.haustur_sirene': ['off', {}], 'light.haustur_flutlicht': ['off', {}], 'switch.haustur_manuelle_aufzeichnung': ['off', {}],
  'light.terrasse': ['on', { friendly_name: 'Terrasse' }],
  'lock.haustuer': ['locked', { friendly_name: 'Haustür' }],
  'button.tueroeffner': ['unknown', { friendly_name: 'Türöffner' }],
  'sensor.haustur_sd_0_storage': ['96', { unit_of_measurement: '%' }],
};
const ENTITIES = {
  'camera.haustur_standardauflosung': { entity_id: 'camera.haustur_standardauflosung', device_id: 'dH', platform: 'reolink', translation_key: 'sub' },
  'sensor.haustur_sd_0_storage': { entity_id: 'sensor.haustur_sd_0_storage', device_id: 'dH', platform: 'reolink' },
  'camera.garten_standardauflosung': { entity_id: 'camera.garten_standardauflosung', device_id: 'dG', platform: 'reolink', translation_key: 'sub' },
};
const HASS = { states: STATES, entities: ENTITIES, devices: { dH: { name: 'Haustür' }, dG: { name: 'Garten' } } };
const ids = (c) => c.run(() => {
  const bar = window.__card.shadowRoot.getElementById('ctrls'), sides = bar.querySelectorAll('.side');
  const list = (el) => [...el.querySelectorAll('[data-id]')].map((b) => b.dataset.id);
  return { all: list(bar), left: sides[0] ? list(sides[0]) : null, right: sides[1] ? list(sides[1]) : null };
});

test('ohne Einstellung: alle vorhandenen Knöpfe wie bisher, Hörer in der Mitte', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'haustur' }], auto_live: false, show_hub: false }, hass: HASS });
  const r = await ids(c);
  assert.deepEqual(r.all.sort(), ['light', 'q', 'rec', 'siren', 'snap', 'talk'].sort());
  assert.ok(r.left.length && r.right.length);
  await c.close();
});

test('buttons: Reihenfolge und Ausblenden; links vor dem Hörer, rechts danach', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'haustur' }], auto_live: false, show_hub: false, buttons: ['snap', 'siren', 'talk', 'light'] }, hass: HASS });
  const r = await ids(c);
  assert.deepEqual(r.left, ['snap', 'siren']);
  assert.deepEqual(r.right, ['light']);
  assert.ok(!r.all.includes('rec'));
  await c.close();
});

test('eigene Knöpfe: Licht schaltet, Schloss fragt nach, Taster drückt, Dienst überschreibbar; pro Kamera', async () => {
  const cfg = {
    auto_live: false, show_hub: false,
    buttons: ['talk', 'snap', { entity: 'light.terrasse', icon: 'mdi:outdoor-lamp' }],
    cameras: [
      { prefix: 'haustur', buttons: ['talk', { entity: 'lock.haustuer' }, { entity: 'lock.haustuer', service: 'lock.open', confirm: false, name: 'Öffnen' }, { entity: 'button.tueroeffner' }] },
      { prefix: 'garten' },
    ],
  };
  const c = await openCard(browser, server, { config: cfg, hass: HASS });
  let r = await ids(c);
  assert.deepEqual(r.all, ['talk', 'x1', 'x2', 'x3']);
  const btn = (id) => c.run((i) => { const b = window.__card.shadowRoot.querySelector(`#ctrls [data-id="${i}"]`); return { label: b.getAttribute('aria-label'), icon: b.querySelector('ha-icon').getAttribute('icon'), on: b.classList.contains('on') }; }, id);
  assert.deepEqual(await btn('x1'), { label: 'Haustür', icon: 'mdi:lock', on: false });
  // Schloss: Rückfrage, erst dann entriegeln
  await c.click('[data-id="x1"]');
  await wait(50);
  assert.ok((await c.info()).dialog);
  assert.ok(!(await c.rec()).calls.some((x) => x.startsWith('lock.')));
  await c.click('#dyes');
  await wait(50);
  assert.ok((await c.rec()).calls.includes('lock.unlock lock.haustuer'));
  // Eigener Dienst ohne Rückfrage, Taster
  await c.click('[data-id="x2"]');
  await c.click('[data-id="x3"]');
  await wait(50);
  assert.ok((await c.rec()).calls.includes('lock.open lock.haustuer'));
  assert.ok((await c.rec()).calls.includes('button.press button.tueroeffner'));
  // Zweite Kamera: Knopfleiste der Karte mit dem Terrassenlicht
  await c.run(() => window.__card._select(1));
  await wait(100);
  r = await ids(c);
  assert.deepEqual(r.all, ['talk', 'snap', 'x2']);
  assert.deepEqual(await btn('x2'), { label: 'Terrasse', icon: 'mdi:outdoor-lamp', on: true });
  await c.click('[data-id="x2"]');
  await wait(50);
  assert.ok((await c.rec()).calls.includes('light.toggle light.terrasse'));
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('SD-Karte fast voll: Warnung', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'haustur' }], auto_live: false }, hass: HASS });
  const w = await c.run(() => window.__card.shadowRoot.getElementById('warns').textContent);
  assert.match(w, /SD.*96/);
  await c.close();
});

/* Editor: Kameras aufklappbar, Abschnitt „Allgemeine Karteneinstellungen“, Knopfleiste bearbeiten */
const editor = async (c, config) => c.run(async (cfg) => {
  document.querySelectorAll('reolink-app-card-editor').forEach((e) => e.remove());
  const ed = document.createElement('reolink-app-card-editor');
  document.body.appendChild(ed);
  ed.hass = window.__hass;
  window.__edCfg = null;
  ed.addEventListener('config-changed', (e) => { window.__edCfg = e.detail.config; });
  ed.setConfig(cfg);
  await new Promise((r) => setTimeout(r, 100));
  window.__ed = ed;
}, config);
const edInfo = (c) => c.run(() => {
  const r = window.__ed.shadowRoot;
  return {
    heads: [...r.querySelectorAll('h3,h4')].map((h) => h.textContent),
    open: [...r.querySelectorAll('#cams .cam')].map((x) => x.classList.contains('open')),
    rows: [...r.querySelector('#btns').querySelectorAll('.brow')].map((x) => [x.dataset.b, !!(x.querySelector('input') || {}).checked]),
    cfg: window.__edCfg,
  };
});

test('Editor: Kameras zugeklappt und aufklappbar, Überschrift „Allgemeine Karteneinstellungen“', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'haustur' }], auto_live: false }, hass: HASS });
  await editor(c, { cameras: [{ prefix: 'haustur', name: 'Haustür' }, { prefix: 'garten', name: 'Garten' }] });
  let r = await edInfo(c);
  assert.ok(r.heads.includes('Allgemeine Karteneinstellungen'));
  assert.ok(r.heads.includes('Allgemeine Karteneinstellungen'));
  assert.match(await c.run(() => window.__ed.shadowRoot.getElementById('btnhead').textContent), /Bedienpanel/);
  assert.deepEqual(r.open, [false, false]);
  await c.run(() => window.__ed.shadowRoot.querySelectorAll('#cams .cam .ch')[1].click());
  r = await edInfo(c);
  assert.deepEqual(r.open, [false, true]);
  await c.close();
});

test('Editor: Knöpfe ausblenden, anordnen, eigenen Knopf hinzufügen; Standard wird nicht gespeichert', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'haustur' }], auto_live: false }, hass: HASS });
  await editor(c, { cameras: [{ prefix: 'haustur' }] });
  let r = await edInfo(c);
  assert.deepEqual(r.rows.map((x) => x[0]), ['talk', 'siren', 'light', 'rec', 'snap', 'ptz', 'q']);
  // Sirene ausblenden
  await c.run(() => { const i = window.__ed.shadowRoot.querySelector('#btns .brow[data-b="siren"] input'); i.checked = false; i.dispatchEvent(new Event('change')); });
  r = await edInfo(c);
  assert.deepEqual(r.cfg.buttons, ['talk', 'light', 'rec', 'snap', 'ptz', 'q']);
  assert.deepEqual(r.rows.at(-1), ['siren', false]);
  // Schnappschuss nach oben
  await c.run(() => window.__ed.shadowRoot.querySelector('#btns .brow[data-b="snap"] [data-a="up"]').click());
  r = await edInfo(c);
  assert.deepEqual(r.cfg.buttons, ['talk', 'light', 'snap', 'rec', 'ptz', 'q']);
  // Eigener Knopf
  await c.run(() => window.__ed.shadowRoot.querySelector('#btns [data-a="add-btn"]').click());
  r = await edInfo(c);
  assert.deepEqual(r.cfg.buttons.at(-1), { entity: '' });
  // Wieder Standard: Option fällt weg
  await editor(c, { cameras: [{ prefix: 'haustur' }], buttons: ['talk', 'siren', 'light', 'rec', 'snap', 'q'] });
  await c.run(() => { const i = window.__ed.shadowRoot.querySelector('#btns .brow[data-b="ptz"] input'); i.checked = true; i.dispatchEvent(new Event('change')); });
  r = await edInfo(c);
  assert.deepEqual(r.cfg.buttons, ['talk', 'siren', 'light', 'rec', 'snap', 'q', 'ptz']);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Editor: eigene Knopfleiste pro Kamera', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'haustur' }], auto_live: false }, hass: HASS });
  await editor(c, { cameras: [{ prefix: 'haustur' }], buttons: ['talk', 'snap'] });
  await c.run(() => { const i = window.__ed.shadowRoot.querySelector('.cam .own input'); i.checked = true; i.dispatchEvent(new Event('change')); });
  const r = await edInfo(c);
  assert.deepEqual(r.cfg.cameras[0].buttons, ['talk', 'snap']);
  const camRows = await c.run(() => window.__ed.shadowRoot.querySelectorAll('#cams .cam .btns .brow').length);
  assert.equal(camRows, 7);
  await c.close();
});

/* Szenenmodus und SD-Karte einzeln ausblendbar; show_hub: false (ältere Option) blendet beides aus */
const HUB = {
  states: { 'camera.garten_standardauflosung': img, 'select.reolink_hub_szenenmodus': ['home', { options: ['off', 'disarm', 'home', 'away'] }], 'sensor.reolink_hub_sd_0_speicher': ['37', { unit_of_measurement: '%' }] },
};
const hubRow = (c) => c.run(() => { const h = window.__card.shadowRoot.getElementById('hub'); return { scene: !!h.querySelector('.scene'), sd: !!h.querySelector('.sd'), shown: h.style.display !== 'none' }; });
test('Szenenmodus und SD-Belegung einzeln ausblendbar', async () => {
  const base = { cameras: [{ prefix: 'garten' }], auto_live: false };
  for (const [opt, want] of [[{}, { scene: true, sd: true, shown: true }], [{ show_scene: false }, { scene: false, sd: true, shown: true }],
    [{ show_sd: false }, { scene: true, sd: false, shown: true }], [{ show_hub: false }, { scene: false, sd: false, shown: false }]]) {
    const c = await openCard(browser, server, { config: { ...base, ...opt }, hass: HUB });
    assert.deepEqual(await hubRow(c), want, JSON.stringify(opt));
    await c.close();
  }
});

test('Editor: allgemeine Einstellungen in Unterkategorien, Szenenmodus/SD getrennt', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'haustur' }], auto_live: false }, hass: HASS });
  await editor(c, { cameras: [{ prefix: 'haustur' }], show_hub: false });
  const r = await c.run(() => {
    const f = window.__ed.shadowRoot.querySelector('#gen ha-form');
    const names = (sch) => sch.flatMap((x) => (x.schema ? names(x.schema) : [x.name]));
    return { groups: f.schema.map((g) => [g.type, g.title, g.flatten]), names: names(f.schema), data: f.data };
  });
  assert.deepEqual(r.groups.map((g) => g[1]), ['Darstellung', 'Szenenmodus & SD-Karte', 'Streaming (Livebild)', 'Wiedergabe', 'Klingel', 'Warnungen']);
  assert.ok(r.groups.every((g) => g[0] === 'expandable' && g[2] === true));
  assert.ok(r.names.includes('show_scene') && r.names.includes('show_sd') && !r.names.includes('show_hub'));
  // show_hub: false wird als „beides aus“ angezeigt
  assert.equal(r.data.show_scene, false);
  assert.equal(r.data.show_sd, false);
  // Ändern: show_hub fällt weg, nur die Abweichung wird gespeichert
  const cfg = await c.run(() => {
    const f = window.__ed.shadowRoot.querySelector('#gen ha-form');
    f.dispatchEvent(new CustomEvent('value-changed', { detail: { value: { ...f.data, show_scene: true } } }));
    return window.__edCfg;
  });
  assert.equal(cfg.show_hub, undefined);
  assert.equal(cfg.show_scene, undefined);
  assert.equal(cfg.show_sd, false);
  await c.close();
});

test('SD-Belegung steht in einer eigenen Zeile unter dem Modus', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'garten' }], auto_live: false }, hass: HUB });
  const r = await c.run(() => {
    const h = window.__card.shadowRoot.getElementById('hub'), a = h.querySelector('.scene').getBoundingClientRect(), b = h.querySelector('.sd').getBoundingClientRect();
    return { wrap: h.classList.contains('wrap'), below: b.top >= a.bottom - 1 };
  });
  assert.deepEqual(r, { wrap: true, below: true });
  await c.close();
});

/* Voreingestellter Bildausschnitt pro Kamera (z. B. Fischauge): zoom, zoom_x, zoom_y */
test('Bild-Zoom pro Kamera: Ausschnitt beim Start, Herauszoomen, andere Kamera ganzes Bild', async () => {
  const cfg = { auto_live: false, show_hub: false, cameras: [{ prefix: 'haustur', zoom: 2, zoom_x: 25, zoom_y: 50 }, { prefix: 'garten' }] };
  const c = await openCard(browser, server, { config: cfg, hass: HASS });
  const z = () => c.run(() => {
    const k = window.__card, st = k.shadowRoot.getElementById('stage');
    return { s: k._zoom.s, x: Math.round(k._zoom.x), y: Math.round(k._zoom.y), w: st.clientWidth, h: st.clientHeight,
      t: k.shadowRoot.getElementById('media').style.transform, pill: k.shadowRoot.getElementById('zoompill').textContent, unzoom: k.shadowRoot.getElementById('unzoom').style.display !== 'none' };
  });
  let r = await z();
  assert.equal(r.s, 2);
  // Mitte bei 25 % der Breite: x = w/2 - 2*w*0.25 = 0; senkrecht Mitte: y = h/2 - h = -h/2
  assert.equal(r.x, 0);
  assert.equal(r.y, Math.round(-r.h / 2));
  assert.match(r.t, /scale\(2\)/);
  assert.equal(r.pill, '2.0×');
  assert.equal(r.unzoom, true);
  // Herauszoomen: ganzes Bild
  await c.click('#unzoom');
  r = await z();
  assert.equal(r.s, 1);
  assert.equal(r.t, '');
  // Andere Kamera ohne Zoom: ganzes Bild; zurück: wieder der Ausschnitt
  await c.run(() => window.__card._select(1));
  await wait(100);
  assert.equal((await z()).s, 1);
  await c.run(() => window.__card._select(0));
  await wait(100);
  assert.equal((await z()).s, 2);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Editor: nach einer Änderung kein Neuaufbau (Gruppen bleiben offen), Formular behält den neuen Wert', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'haustur' }], auto_live: false }, hass: HASS });
  await editor(c, { cameras: [{ prefix: 'haustur' }] });
  const r = await c.run(async () => {
    const ed = window.__ed, gen = ed.shadowRoot.querySelector('#gen ha-form');
    gen.dispatchEvent(new CustomEvent('value-changed', { detail: { value: { ...gen.data, live_timeout: 600 } } }));
    // Home Assistant gibt die geänderte Konfiguration zurück
    ed.setConfig(window.__edCfg);
    await new Promise((res) => setTimeout(res, 50));
    const gen2 = ed.shadowRoot.querySelector('#gen ha-form');
    // Kamera-Formular: Zoom setzen
    const cf = ed.shadowRoot.querySelector('#cams ha-form');
    cf.dispatchEvent(new CustomEvent('value-changed', { detail: { value: { ...cf.data, zoom: 1.5, zoom_x: 50 } } }));
    ed.setConfig(window.__edCfg);
    return { same: gen === gen2, timeout: gen2.data.live_timeout, cfgTimeout: window.__edCfg.live_timeout, cam: window.__edCfg.cameras[0], camData: ed.shadowRoot.querySelector('#cams ha-form') === cf && cf.data.zoom };
  });
  assert.equal(r.same, true);
  assert.equal(r.timeout, 600);
  assert.equal(r.cfgTimeout, 600);
  assert.deepEqual(r.cam, { prefix: 'haustur', zoom: 1.5 });
  assert.equal(r.camData, 1.5);
  await c.close();
});

test('immer nur eine Modus-Zeile: mit eigener Modus-Auswahl nie zusätzlich der Reolink-Szenenmodus', async () => {
  const hass = { states: { ...HUB.states, 'input_select.kamera_modus': ['Zuhause', { options: ['Unscharf', 'Zuhause', 'Abwesend'] }] } };
  for (const extra of [{}, { show_scene: true }]) {
    const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'garten' }], auto_live: false, mode_entity: 'input_select.kamera_modus', ...extra }, hass });
    const rows = await c.run(() => [...window.__card.shadowRoot.querySelectorAll('#hub .scene')].map((r) => [...r.querySelectorAll('button')].map((b) => b.dataset.o)));
    assert.deepEqual(rows, [['Unscharf', 'Zuhause', 'Abwesend']], JSON.stringify(extra));
    await c.close();
  }
});
