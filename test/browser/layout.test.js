import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const open = async (width, layout, extra = {}) => {
  const c = await openCard(browser, server, {
    config: { cameras: [{ name: 'Garten', prefix: 'garten', media_name: 'Garten' }], auto_live: false, show_hub: false, ...(layout ? { layout } : {}) },
    hass: { states: { ...CAM_STATES, 'light.garten_flutlicht': 'off' }, mediaCameras: ['Garten'], files: ['08:00:00 0:00:30 Person'] },
    ...extra,
  });
  await c.page.setViewportSize({ width: width + 40, height: 900 });
  await c.run((w) => { document.getElementById('wrap').style.width = `${w}px`; }, width);
  await wait(300);
  return c;
};
const geo = (c) => c.run(() => {
  const r = window.__card.shadowRoot, card = r.querySelector('ha-card'), box = (s) => r.querySelector(s).getBoundingClientRect();
  const vis = (s) => { const e = r.querySelector(s); return !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== 'none'; };
  return { layout: card.dataset.layout, stage: box('#stage'), seg: box('.seg'), phead: box('#phead'), bar: box('.barwrap'), settings: vis('.settings'), more: vis('.more'), barShown: vis('.barwrap'),
    segShown: vis('.seg'), pheadShown: vis('#phead'), events: vis('#pane-play'), edge: vis('#pedge'), items: r.querySelectorAll('#list .item').length };
});

test('schmal (Handy): wie bisher untereinander', async () => {
  const c = await open(400);
  const g = await geo(c);
  assert.equal(g.layout, '');
  assert.ok(g.seg.top > g.stage.bottom - 1);
  assert.equal(g.settings, false);
  await c.close();
});

test('breit, automatisch: Seitenleiste rechts mit Ereignissen, Steuerleiste kompakt unter dem Bild', async () => {
  const c = await open(1100);
  await wait(300);
  const g = await geo(c);
  assert.equal(g.layout, 'right');
  assert.ok(g.phead.left >= g.stage.right - 1, 'Panel-Kopf rechts vom Bild');
  assert.equal(g.segShown, false, 'kein Live/Wiedergabe-Umschalter, das Livebild bleibt');
  assert.equal(g.events, true, 'Ereignisse im Panel');
  assert.equal(g.items, 1);
  assert.ok(g.bar.top >= g.stage.bottom - 1, 'Steuerleiste unter dem Bild');
  assert.ok(g.bar.width <= 561, 'Steuerleiste nicht über die ganze Breite');
  assert.ok(Math.abs((g.bar.left + g.bar.right) / 2 - (g.stage.left + g.stage.right) / 2) < 2, 'mittig unter dem Bild');
  assert.equal(g.settings, false, 'Einstellungen erst auf Wunsch');
  assert.equal(g.more, false);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Seitenleiste links', async () => {
  const c = await open(1100, 'left');
  const g = await geo(c);
  assert.equal(g.layout, 'left');
  assert.ok(g.phead.right <= g.stage.left + 1);
  await c.close();
});

test('alles unten: Bild begrenzt, Steuerleiste mittig', async () => {
  const c = await open(1100, 'bottom');
  const g = await geo(c);
  assert.equal(g.layout, 'bottom');
  assert.ok(g.seg.top >= g.bar.bottom - 1 || g.seg.top >= g.stage.bottom - 1);
  assert.ok(g.bar.width <= 561);
  await c.close();
});

test('Seitenleiste: Ereignis antippen spielt im Bild, Steuerleiste verschwindet solange', async () => {
  const c = await open(1100);
  await wait(300);
  const r = await c.run(() => {
    const root = window.__card.shadowRoot, list = root.getElementById('list').getBoundingClientRect(), stage = root.getElementById('stage').getBoundingClientRect();
    return { right: list.left >= stage.right - 1, items: root.querySelectorAll('#list .item').length };
  });
  assert.deepEqual(r, { right: true, items: 1 });
  await c.click('#list .item');
  await wait(400);
  assert.equal((await geo(c)).barShown, false);
  await c.click('#stop');
  await wait(300);
  assert.equal((await geo(c)).barShown, true);
  await c.close();
});

test('Seitenleiste: Einstellungen als eigenes Panel, zuklappen und am Bildrand wieder öffnen', async () => {
  const c = await open(1100);
  await wait(300);
  await c.click('#p-set');
  await wait(300);
  let g = await geo(c);
  assert.equal(g.settings, true);
  assert.equal(g.events, false);
  await c.click('#pclose');
  await wait(300);
  g = await geo(c);
  assert.equal(g.pheadShown, false);
  assert.equal(g.settings, false);
  assert.equal(g.edge, true, 'Griff am Bildrand');
  assert.ok(g.stage.width > 1000, 'Bild nutzt die ganze Breite');
  assert.equal(await c.run(() => localStorage.getItem('reolink-app-card:panel')), 'none');
  await c.click('#pedge');
  await wait(300);
  g = await geo(c);
  assert.equal(g.settings, true, 'zuletzt gewähltes Panel kommt zurück');
  assert.equal(g.edge, false);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Seitenleiste links zugeklappt: Bild und Knöpfe über die ganze Breite', async () => {
  const c = await open(1100, 'left', { storage: { 'reolink-app-card:panel': 'none' } });
  const g = await geo(c);
  assert.equal(g.edge, true);
  assert.ok(g.stage.width > 1000, `Bild ${g.stage.width}px`);
  assert.ok(g.bar.top >= g.stage.bottom - 1, 'Knöpfe unter dem Bild');
  assert.ok(Math.abs((g.bar.left + g.bar.right) / 2 - (g.stage.left + g.stage.right) / 2) < 2, 'Knöpfe mittig unter dem Bild');
  await c.close();
});

test('Seitenleiste: Filter in einer Zeile, seitlich scrollbar', async () => {
  const c = await open(1100);
  await wait(300);
  const r = await c.run(() => {
    const f = window.__card.shadowRoot.getElementById('filters');
    const tops = new Set([...f.querySelectorAll('.chip')].map((b) => Math.round(b.getBoundingClientRect().top)));
    return { rows: tops.size, wrap: getComputedStyle(f).flexWrap };
  });
  assert.deepEqual(r, { rows: 1, wrap: 'nowrap' });
  await c.close();
});

test('Seitenleiste: zugeklappt bleibt zugeklappt (gespeichert) und panel: settings als Start', async () => {
  let c = await open(1100, null, { storage: { 'reolink-app-card:panel': 'none' } });
  let g = await geo(c);
  assert.equal(g.edge, true);
  assert.equal(g.pheadShown, false);
  await c.close();
  c = await openCard(browser, server, {
    config: { cameras: [{ name: 'Garten', prefix: 'garten', media_name: 'Garten' }], auto_live: false, show_hub: false, panel: 'settings' },
    hass: { states: { ...CAM_STATES, 'light.garten_flutlicht': 'off' }, mediaCameras: ['Garten'], files: ['08:00:00 0:00:30 Person'] },
  });
  await c.page.setViewportSize({ width: 1140, height: 900 });
  await c.run(() => { document.getElementById('wrap').style.width = '1100px'; });
  await wait(300);
  g = await geo(c);
  assert.equal(g.settings, true);
  await c.close();
});

test('Seitenleiste ohne Aufnahmen: zugeklappt, Griff öffnet die Einstellungen', async () => {
  const c = await open(1100, null, { hass: { states: { ...CAM_STATES, 'light.garten_flutlicht': 'off' }, mediaCameras: [] } });
  await wait(300);
  let g = await geo(c);
  assert.equal(g.edge, true);
  assert.equal(g.events, false);
  await c.click('#pedge');
  await wait(300);
  g = await geo(c);
  assert.equal(g.settings, true);
  assert.equal(g.pheadShown, true);
  await c.close();
});

test('Breite ändert sich: Anordnung passt sich an', async () => {
  const c = await open(1100);
  assert.equal((await geo(c)).layout, 'right');
  await c.run(() => { document.getElementById('wrap').style.width = '420px'; });
  await wait(300);
  assert.equal((await geo(c)).layout, '');
  await c.close();
});
