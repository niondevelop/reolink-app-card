import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const snd = (c) => c.run(() => { const b = window.__card.shadowRoot.getElementById('snd'); return { visible: b.style.display !== 'none', icon: b.querySelector('ha-icon').getAttribute('icon') }; });

test('Ton ein und aus: Player wird ohne Stummschaltung neu verbunden', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES } });
  assert.equal((await c.info()).sound, false);
  assert.equal((await snd(c)).visible, true);
  const before = (await c.rec()).connects;
  await c.click('#snd');
  await wait(300);
  const r = await c.rec();
  assert.equal((await c.info()).sound, true);
  assert.ok(r.connects > before);
  assert.equal(r.lastMuted, false);
  await c.click('#snd');
  await wait(200);
  assert.equal((await c.info()).sound, false);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Ton bleibt nach Neustart des Livebilds an', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES } });
  await c.click('#snd');
  await wait(300);
  await c.run(() => { window.__card._stopLive(); window.__card._startLive(); });
  await wait(800);
  assert.equal((await c.info()).sound, true);
  assert.equal((await c.rec()).lastMuted, false);
  await c.close();
});

test('Ton während des Gegensprechens legt nicht auf', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES } });
  await c.click('[data-id="talk"]');
  await wait(800);
  await c.click('#snd');
  await wait(1500);
  const i = await c.info();
  assert.equal(i.sound, true);
  assert.equal(i.mic, 'on');
  await c.close();
});

test('Kamera ohne Tonspur: Hinweis', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES }, test: { hasAudio: false } });
  await c.click('#snd');
  await wait(400);
  assert.ok((await c.info()).toast);
  await c.close();
});

test('audio: auto wartet auf den ersten Tipp', async () => {
  const c = await openCard(browser, server, {
    hass: { states: CAM_STATES }, fakeActivation: true,
    config: { cameras: [{ name: 'Garten', prefix: 'garten' }], auto_live: true, show_hub: false, audio: 'auto' },
  });
  await wait(300);
  assert.equal((await c.rec()).lastMuted, true);
  await c.page.mouse.click(200, 200);
  await wait(600);
  assert.equal((await c.info()).sound, true);
  assert.equal((await c.rec()).lastMuted, false);
  await c.close();
});
