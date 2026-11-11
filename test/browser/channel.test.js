import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const KEY = 'reolink-app-card:channel';
const bar = (c) => c.run(() => {
  const b = window.__card.shadowRoot.getElementById('testbar');
  return { shown: b.style.display !== 'none', missing: b.classList.contains('missing'), text: b.textContent.trim() };
});
const state = (c) => c.run((k) => ({ channel: window.__RAC_CHANNEL || 'stable', stored: localStorage.getItem(k) }), KEY);

test('normal: stabile Version, keine Testdatei, kein Balken', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES } });
  assert.deepEqual(c.testLoads, []);
  assert.equal((await state(c)).channel, 'stable');
  assert.equal((await bar(c)).shown, false);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('eingeschaltet: lädt die Testdatei mit Zeitstempel, registriert nur einmal, zeigt den Balken', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES }, storage: { [KEY]: 'test' } });
  assert.equal(c.testLoads.length, 1);
  assert.match(c.testLoads[0], /\/local\/reolink-test\/reolink-app-card\.js\?v=\d+$/);
  assert.equal((await state(c)).channel, 'test');
  const b = await bar(c);
  assert.equal(b.shown, true);
  assert.equal(b.missing, false);
  assert.match(b.text, /Testversion 0\.\d+\.\d+/);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Testdatei fehlt: stabile Version läuft, Balken warnt, antippen beendet ohne Rückfrage', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES }, storage: { [KEY]: 'test' }, missingTest: true });
  assert.equal((await state(c)).channel, 'test-missing');
  assert.equal((await c.info()).cam, 'Garten');
  const b = await bar(c);
  assert.equal(b.shown, true);
  assert.equal(b.missing, true);
  await Promise.all([c.page.waitForEvent('load'), c.click('#testbar')]);
  assert.equal(await c.run((k) => localStorage.getItem(k), KEY), null);
  await c.close();
});

test('Balken antippen: Rückfrage, dann stabil und neu laden', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES }, storage: { [KEY]: 'test' } });
  await c.click('#testbar');
  await wait(50);
  assert.match((await c.info()).dialog, /stabilen Version/);
  await c.click('#dno');
  await wait(50);
  assert.equal((await state(c)).stored, 'test');
  await c.click('#testbar');
  await wait(50);
  await Promise.all([c.page.waitForEvent('load'), c.click('#dyes')]);
  assert.equal(await c.run((k) => localStorage.getItem(k), KEY), null);
  await c.close();
});

test('?rac_channel=test schaltet für Administratoren ein und lädt neu', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES }, query: '?rac_channel=test', wait: 0 });
  await c.page.waitForEvent('load');
  assert.equal(await c.run((k) => localStorage.getItem(k), KEY), 'test');
  assert.equal(await c.run(() => location.search), '');
  await c.close();
});

test('?rac_channel=test wird ohne Administratorrechte ignoriert', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES, noAdmin: true }, query: '?rac_channel=test' });
  assert.equal((await state(c)).stored, null);
  assert.equal(await c.run(() => location.search), '');
  await c.close();
});

test('?rac_channel=stable schaltet schon beim Laden aus', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES }, storage: { [KEY]: 'test' }, query: '?rac_channel=stable' });
  assert.deepEqual(c.testLoads, []);
  assert.equal((await state(c)).channel, 'stable');
  await c.close();
});
