import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Akku-Klingel direkt in Home Assistant: nur Schnappschuss-Kameras, kein Video-Stream */
const snap = (tok) => ['idle', { entity_picture: '/x.jpg', access_token: tok }];
const STATES = {
  'camera.hintertur_schnappschusse_in_standardauflosung': snap('T1'),
  'camera.hintertur_schnappschusse_in_hochauflosung': snap('T2'),
  'camera.haustur_standardauflosung': ['idle', { entity_picture: '/x.jpg' }],
};
const reg = (id, dev, tk) => ({ entity_id: id, device_id: dev, platform: 'reolink', translation_key: tk });
const ENTITIES = {
  'camera.hintertur_schnappschusse_in_standardauflosung': reg('camera.hintertur_schnappschusse_in_standardauflosung', 'dB', 'snapshots_sub'),
  'camera.hintertur_schnappschusse_in_hochauflosung': reg('camera.hintertur_schnappschusse_in_hochauflosung', 'dB', 'snapshots_main'),
  'camera.haustur_standardauflosung': reg('camera.haustur_standardauflosung', 'dF', 'sub'),
};
const HASS = { states: STATES, entities: ENTITIES, devices: { dB: { name: 'Hintertür' }, dF: { name: 'Haustür' } } };

test('wird im Editor/Vorschlag gefunden', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'haustur' }], auto_live: false }, hass: HASS });
  const stub = await c.run(() => customElements.get('reolink-app-card').getStubConfig(window.__hass));
  assert.deepEqual(stub.cameras.map((x) => x.name), ['Haustür', 'Hintertür']);
  await c.close();
});

test('Livebild als eigene Bildfolge im richtigen Format, Gegensprechen ausgegraut, keine Qualitätswahl', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ entity: 'camera.hintertur_schnappschusse_in_standardauflosung' }], auto_live: true, show_hub: false }, hass: HASS });
  await wait(300);
  const r = await c.run(() => {
    const root = window.__card.shadowRoot, img = root.querySelector('#pic img.mjpeg');
    return { src: img && img.getAttribute('src'), fit: img && getComputedStyle(img).objectFit, player: !!root.querySelector('#pic hui-picture-entity-card'),
      talk: root.querySelector('[data-id="talk"]').className, q: !!root.querySelector('[data-id="q"]') };
  });
  assert.equal(r.src, '/api/camera_proxy_stream/camera.hintertur_schnappschusse_in_standardauflosung?token=T1');
  assert.equal(r.fit, 'contain');
  assert.equal(r.player, false);
  assert.match(r.talk, /dis/);
  assert.equal(r.q, false);
  await c.click('[data-id="talk"]');
  await wait(100);
  assert.match((await c.info()).toast, /Video-Stream/);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Raster: Stream-Kamera mit Player, Akku-Klingel mit Bildfolge', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'haustur' }, { prefix: 'hintertur' }], auto_live: true, show_hub: false }, hass: HASS });
  await c.run(() => window.__card._setGrid(true));
  await wait(300);
  const r = await c.run(() => [...window.__card.shadowRoot.querySelectorAll('#grid .cell .pic')].map((p) => (p.querySelector('img.mjpeg') ? 'mjpeg' : p.querySelector('hui-picture-entity-card') ? 'player' : '-')));
  assert.deepEqual(r, ['player', 'mjpeg']);
  await c.close();
});

/* Konfiguration aus älteren Versionen: Präfix endet auf „_schnappschusse_in“, Schnappschuss-Entität darf nicht als Video-Stream gelten */
test('alter Präfix …_schnappschusse_in: trotzdem eigene Bildfolge statt zugeschnittenem Player', async () => {
  for (const prefix of ['hintertur_schnappschusse_in', 'hintertur']) {
    const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'haustur' }, { prefix }], auto_live: true, show_hub: false }, hass: HASS });
    await c.run(() => { window.__card._idx = 1; window.__card._rebuildCamera(); });
    await wait(300);
    const single = await c.run(() => { const r = window.__card.shadowRoot; return { mjpeg: !!r.querySelector('#pic img.mjpeg'), player: !!r.querySelector('#pic hui-picture-entity-card') }; });
    assert.deepEqual(single, { mjpeg: true, player: false }, prefix);
    await c.run(() => window.__card._setGrid(true));
    await wait(300);
    const grid = await c.run(() => [...window.__card.shadowRoot.querySelectorAll('#grid .cell .pic')].map((p) => (p.querySelector('img.mjpeg') ? 'mjpeg' : p.querySelector('hui-picture-entity-card') ? 'player' : '-')));
    assert.deepEqual(grid, ['player', 'mjpeg'], prefix);
    assert.deepEqual(c.errors, []);
    await c.close();
  }
});
