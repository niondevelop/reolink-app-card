import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_STATES, launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Schnelles Livebild: Player von Home Assistant direkt, ohne Bildentitäts-Karte dazwischen */
test('Livebild: ha-camera-stream direkt im Bild, mit der Kamera-Entität, eine Verbindung', async () => {
  const c = await openCard(browser, server, { hass: { states: CAM_STATES }, config: { cameras: [{ prefix: 'garten' }], auto_live: true, show_hub: false } });
  await wait(200);
  const r = await c.run(() => {
    const pic = window.__card.shadowRoot.getElementById('pic'), s = pic.querySelector(':scope > ha-camera-stream');
    return { direct: !!s, card: !!pic.querySelector('hui-picture-entity-card'), entity: s && s.stateObj && s.stateObj.entity_id, fit: s && s.fitMode, muted: s && s.muted };
  });
  assert.deepEqual(r, { direct: true, card: false, entity: 'camera.garten_standardauflosung', fit: 'contain', muted: true });
  const rec = await c.rec();
  assert.equal(rec.connects, 1, 'nur eine Verbindung');
  assert.equal(rec.streamEntity, 'camera.garten_standardauflosung');
  await c.close();
});

test('Ton schon beim Start gewünscht (nach dem ersten Antippen): Player startet gleich mit Ton, ohne Neuverbindung', async () => {
  const c = await openCard(browser, server, {
    hass: { states: CAM_STATES },
    config: { cameras: [{ prefix: 'garten' }], auto_live: false, show_hub: false, audio: 'auto' },
  });
  await c.click('#bigplay'); // Antippen erlaubt Ton
  await wait(400);
  const rec = await c.rec();
  assert.equal(rec.connects, 1);
  assert.equal(rec.lastMuted, false);
  await c.close();
});

/* Neue deutsche Entitäts-IDs („fliessend“) und Präfix mit ganzer ID (Schwippser, Video Doorbell WiFi) */
const FL = {
  'camera.reolink_video_doorbell_wifi_fliessend': ['idle', { entity_picture: '/x.jpg' }],
  'camera.reolink_video_doorbell_wifi_schnappschusse_fliessend': ['idle', { entity_picture: '/x.jpg' }],
  'siren.reolink_video_doorbell_wifi_sirene': ['off', {}],
};
test('Entitäts-IDs mit „fliessend“: Kamera wird gefunden, auch mit der ganzen ID als Präfix', async () => {
  for (const cam of [{ prefix: 'reolink_video_doorbell_wifi_fliessend' }, { prefix: 'reolink_video_doorbell_wifi' }, { entity: 'camera.reolink_video_doorbell_wifi_fliessend' }]) {
    const c = await openCard(browser, server, { hass: { states: FL }, config: { cameras: [cam], auto_live: false, show_hub: false } });
    const r = await c.run(() => ({ sd: window.__card._e('cam_sd'), snap: window.__card._e('snap'), siren: window.__card._e('siren'), warn: window.__card.shadowRoot.getElementById('stage').textContent.includes('nicht gefunden') }));
    assert.deepEqual(r, { sd: 'camera.reolink_video_doorbell_wifi_fliessend', snap: 'camera.reolink_video_doorbell_wifi_schnappschusse_fliessend', siren: 'siren.reolink_video_doorbell_wifi_sirene', warn: false }, JSON.stringify(cam));
    await c.close();
  }
});
