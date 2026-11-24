import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openCard, startServer, wait } from './helpers.js';

let browser, server;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

/* Einstellungen: jede Gruppe klappt für sich auf und zu – auch alle zu oder mehrere offen */
const STATES = {
  'camera.hof_standardauflosung': ['idle', { entity_picture: '/x.jpg' }],
  'switch.hof_aufzeichnen': 'on', 'number.hof_bewegungsempfindlichkeit': ['35', { min: 1, max: 50, step: 1 }],
  'select.hof_flutlicht_modus': ['auto', { options: ['off', 'auto'] }],
};
const groups = (c) => c.run(() => [...window.__card.shadowRoot.querySelectorAll('#settings .grp')].map((g) => g.classList.contains('open')));
const tap = (c, i) => c.run((n) => window.__card.shadowRoot.querySelectorAll('#settings .gh')[n].click(), i);

test('Einstellungen: Gruppen einzeln auf- und zuklappen, 0 oder mehrere offen', async () => {
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'hof' }], auto_live: false, show_hub: false }, hass: { states: STATES } });
  await c.run(() => { window.__card._settingsOpen = true; window.__card._update(); });
  await wait(100);
  assert.deepEqual(await groups(c), [true, false]);
  await tap(c, 0);
  assert.deepEqual(await groups(c), [false, false], 'alle zu');
  await tap(c, 0);
  await tap(c, 1);
  assert.deepEqual(await groups(c), [true, true], 'zwei offen');
  // Zustand bleibt bei Aktualisierungen von Home Assistant erhalten
  await c.run(() => window.setState('switch.hof_aufzeichnen', 'off'));
  await wait(100);
  assert.deepEqual(await groups(c), [true, true]);
  assert.deepEqual(c.errors, []);
  await c.close();
});

test('Seitenleiste: offene Gruppen werden nicht gestaucht (die Leiste scrollt stattdessen)', async () => {
  const states = { ...STATES, 'number.hof_ki_personen_empfindlichkeit': ['100', { min: 0, max: 100, step: 1 }], 'number.hof_ki_fahrzeug_empfindlichkeit': ['60', { min: 0, max: 100, step: 1 }], 'number.hof_ki_tier_empfindlichkeit': ['100', { min: 0, max: 100, step: 1 }],
    'switch.hof_push_benachrichtigungen': 'on', 'switch.hof_infrarotlicht_im_nachtmodus': 'on', 'light.hof_status_led': 'on',
    'select.hof_tag_nacht_modus': ['auto', { options: ['auto', 'color', 'black_white'] }], 'number.hof_lautstarke': ['100', { min: 0, max: 100, step: 1 }],
    'switch.hof_audio_aufnehmen': 'on', 'switch.hof_sirene_bei_ereignis': 'off' };
  const c = await openCard(browser, server, { config: { cameras: [{ prefix: 'hof' }], auto_live: false, show_hub: false }, hass: { states } });
  await c.page.setViewportSize({ width: 1140, height: 900 });
  await c.run(() => { document.getElementById('wrap').style.width = '1100px'; });
  await wait(300);
  await c.click('#p-set');
  await wait(300);
  const n = await c.run(() => window.__card.shadowRoot.querySelectorAll('#settings .gh').length);
  for (let i = 1; i < n; i += 1) await tap(c, i);
  await wait(100);
  const r = await c.run(() => {
    const box = window.__card.shadowRoot.getElementById('settings');
    return { squeezed: [...box.querySelectorAll('.grp.open')].some((g) => g.scrollHeight > g.clientHeight + 1), scrolls: box.scrollHeight > box.clientHeight };
  });
  assert.deepEqual(r, { squeezed: false, scrolls: true });
  await c.close();
});

test('Erste Kamera ohne Einstellungen: bei der nächsten ist die erste Gruppe offen', async () => {
  const states = { ...STATES, 'camera.fremd': ['idle', { entity_picture: '/x.jpg' }] };
  const c = await openCard(browser, server, { config: { cameras: [{ entity: 'camera.fremd', prefix: 'camera.fremd' }, { prefix: 'hof' }], auto_live: false, show_hub: false }, hass: { states } });
  await c.run(() => { window.__card._settingsOpen = true; window.__card._update(); });
  await wait(100);
  await c.run(() => window.__card._select(1));
  await c.run(() => { window.__card._settingsOpen = true; window.__card._update(); });
  await wait(100);
  assert.deepEqual(await groups(c), [true, false]);
  await c.close();
});
