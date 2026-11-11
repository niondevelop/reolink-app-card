import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

test('Gegensprechen: Hörer an und auflegen', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES } });
  assert.equal((await c.info()).talkClass, 'tbn big');
  await c.click('[data-id="talk"]');
  await wait(100);
  assert.equal((await c.info()).mic, 'connecting');
  await wait(500);
  const on = await c.info();
  assert.equal(on.mic, 'on');
  assert.match(on.talkClass, /warn/);
  await c.click('[data-id="talk"]');
  await wait(100);
  assert.equal((await c.info()).mic, 'off');
  assert.equal((await c.rec()).toggles, 2);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Gegensprechen startet das Livebild, wenn es nicht läuft', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES }, config: { cameras: [{ name: 'Garten', prefix: 'garten' }], auto_live: false, show_hub: false } });
  assert.equal((await c.info()).live, false);
  await c.click('[data-id="talk"]');
  await wait(900);
  const i = await c.info();
  assert.equal(i.live, true);
  assert.equal(i.mic, 'on');
  await c.close();
});

test('ausgegraut ohne Zwei-Wege-Audio, Tipp erklärt den Grund', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES, twoWay: false } });
  assert.match((await c.info()).talkClass, /dis/);
  await c.click('[data-id="talk"]');
  await wait(200);
  assert.match((await c.info()).toast, /Labs/);
  await c.close();
});

test('ausgegraut ohne HTTPS', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES }, insecure: true });
  await c.click('[data-id="talk"]');
  await wait(200);
  const i = await c.info();
  assert.match(i.talkClass, /dis/);
  assert.match(i.toast, /HTTPS/);
  await c.close();
});

test('ausgegraut, wenn der Stream nicht über WebRTC läuft', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES }, test: { streamType: 'hls' } });
  await wait(200);
  assert.match((await c.info()).talkClass, /dis/);
  await c.close();
});

test('Mikrofon verweigert: Hinweis, Hörer wieder frei', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES }, test: { denyMic: true } });
  await c.click('[data-id="talk"]');
  await wait(600);
  const i = await c.info();
  assert.equal(i.mic, 'off');
  assert.match(i.toast, /Mikrofon/);
  await c.close();
});

test('Companion-App über HTTP sendet das Mikrofon selbst', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES, appMic: true }, insecure: true });
  await c.click('[data-id="talk"]');
  await wait(400);
  assert.equal((await c.info()).mic, 'on');
  await c.click('[data-id="talk"]');
  await wait(100);
  const r = await c.rec();
  assert.deepEqual(r.msgs.map((m) => m.type), ['webrtc/stream/start', 'webrtc/stream/stop']);
  assert.equal(r.msgs[0].payload.entity_id, 'camera.garten_standardauflosung');
  await c.close();
});

test('mit talk_url öffnet der Knopf ohne Zwei-Wege-Audio die Reolink-App', async () => {
  const c = await openCard(browser, server, {
    hass: { states: CAM_STATES, twoWay: false },
    config: { cameras: [{ name: 'Garten', prefix: 'garten', talk_url: 'app://com.mcu.reolink' }], show_hub: false },
  });
  const title = await c.run(() => window.__card.shadowRoot.querySelector('[data-id="talk"]').title);
  assert.match(title, /Reolink-App/);
  assert.doesNotMatch((await c.info()).talkClass, /dis/);
  await c.close();
});

test('Livebild stoppen legt auf', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES } });
  await c.click('[data-id="talk"]');
  await wait(600);
  await c.run(() => window.__card._stopLive());
  await wait(100);
  const i = await c.info();
  assert.equal(i.live, false);
  assert.equal(i.mic, 'off');
  await c.close();
});
