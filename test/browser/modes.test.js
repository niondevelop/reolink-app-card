import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const MODES = ['Unscharf', 'Zuhause', 'Abwesend', 'Nacht', 'Klingeln'];
const open = async (width, modes = MODES) => {
  const c = await openCard(browser, server, {
    config: { cameras: [{ name: 'Garten', prefix: 'garten' }], auto_live: false, mode_entity: 'input_select.kameramodus' },
    hass: { states: { ...CAM_STATES, 'input_select.kameramodus': ['Zuhause', { options: modes }], 'sensor.reolink_hub_sd_0_storage': ['42', {}] } },
  });
  await c.run((w) => { document.getElementById('wrap').style.width = `${w}px`; }, width);
  await wait(300);
  return c;
};
const state = (c) => c.run(() => {
  const r = window.__card.shadowRoot, hub = r.getElementById('hub'), sc = r.querySelector('.scene');
  return { wrap: hub.classList.contains('wrap'), compact: sc.classList.contains('compact'), fits: sc.scrollWidth <= sc.clientWidth + 1,
    labels: [...sc.querySelectorAll('button')].map((b) => b.getAttribute('aria-label')) };
});

test('fünf Modi in Handy-Breite: SD-Anzeige darunter, Modi kompakt, nichts abgeschnitten', async () => {
  const c = await open(330);
  const s = await state(c);
  assert.equal(s.wrap, true);
  assert.equal(s.fits, true);
  assert.deepEqual(s.labels, MODES);
  await c.close();
});

test('genug Platz: alles in einer Zeile mit Namen', async () => {
  const c = await open(700);
  const s = await state(c);
  assert.equal(s.wrap, false);
  assert.equal(s.compact, false);
  assert.equal(s.fits, true);
  await c.close();
});

test('wird die Karte breiter, kommen die Namen zurück', async () => {
  const c = await open(300);
  assert.equal((await state(c)).fits, true);
  await c.run(() => { document.getElementById('wrap').style.width = '700px'; });
  await wait(300);
  const s = await state(c);
  assert.equal(s.compact, false);
  assert.equal(s.wrap, false);
  await c.close();
});

test('Symbole laden später (wie in Home Assistant): Zeile wird neu angepasst', async () => {
  const c = await open(330);
  // Symbole erst jetzt „laden“: jedes ha-icon bekommt nachträglich eine Breite
  await c.run(() => window.__card.shadowRoot.querySelectorAll('.scene ha-icon').forEach((i) => { i.style.display = 'inline-block'; i.style.width = '0px'; }));
  await c.run(() => { const h = window.__card.shadowRoot.getElementById('hub'); h.classList.remove('wrap'); h.querySelectorAll('.scene').forEach((r) => r.classList.remove('compact')); });
  await wait(100);
  await c.run(() => window.__card.shadowRoot.querySelectorAll('.scene ha-icon').forEach((i) => { i.style.width = '40px'; }));
  await wait(300);
  assert.equal((await state(c)).fits, true);
  await c.close();
});
