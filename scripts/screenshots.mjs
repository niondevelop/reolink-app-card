/* README-Bilder neu erzeugen: node scripts/screenshots.mjs [--lang en|de|fr]
   Baut ein nachgebautes Home Assistant mit zwei Demo-Kameras (gerenderte Bilder, kein echter Ort) und
   speichert images/live.png, playback.png, settings.png, grid.png, doorbell.png. Vorher `npm run build`. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { ENT } from '../src/entities.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lang = (process.argv.find((a) => a.startsWith('--lang=')) || '--lang=en').split('=')[1];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg' };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = url.startsWith('/dist/') ? path.join(ROOT, url) : path.join(ROOT, 'scripts/screenshots', url === '/' ? 'page.html' : url);
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

/* Zustände der zwei Demo-Kameras aus der Liste der Entitäten der Karte */
function demoStates() {
  const st = (state, attributes = {}) => ({ state, attributes });
  const states = {};
  const cams = { garten: { name: 'Garden', bat: '86', charging: true }, eingang: { name: 'Entrance', bat: '100', charging: false } };
  Object.entries(cams).forEach(([pre, c]) => {
    Object.entries(ENT).forEach(([key, [domain, , en]]) => {
      if (key.startsWith('ptz_') || key === 'visitor' || key === 'cam_tele') return;
      const id = `${domain}.${pre}_${en || ENT[key][1]}`;
      const a = { friendly_name: `${c.name} ${key}` };
      let v = 'off';
      if (domain === 'camera') { v = 'idle'; a.entity_picture = pre === 'eingang' ? '/scene-entrance.jpg' : '/scene-garden.jpg'; }
      if (domain === 'number') { v = { pir_sens: '80', ai_person: '75', ai_vehicle: '60', volume: '70' }[key] || '50'; Object.assign(a, { min: 0, max: 100, step: 1 }); }
      if (domain === 'select') { const o = { daynight: ['Auto', 'Color', 'Black & white'], anti_flicker: ['Off', '50 Hz', '60 Hz'], fl_mode: ['Off', 'Auto', 'Schedule'], post_rec: ['15 s', '30 s', '1 min'] }[key] || ['A']; a.options = o; v = o[0]; }
      if (domain === 'sensor') v = { battery: c.bat, battery_state: c.charging ? 'charging' : 'discharging', battery_temp: '18', wifi: '3' }[key] || '0';
      if (key === 'battery') { a.unit_of_measurement = '%'; a.device_class = 'battery'; }
      if (key === 'light' && pre === 'garten') v = 'on';
      if (key === 'det_person' && pre === 'garten') v = 'on';
      if (['pir', 'rec', 'push', 'rec_audio', 'ir'].includes(key)) v = 'on';
      states[id] = st(v, a);
    });
  });
  states['select.reolink_hub_scene_mode'] = st('home', { options: ['disarm', 'home', 'away'] });
  states['sensor.reolink_hub_sd_0_storage'] = st('1.8', { unit_of_measurement: '%' });
  states['input_boolean.doorbell'] = st('off');
  return states;
}

const FILES = [['18:21:40', '0:00:19', 'Person Doorbell'], ['13:01:44', '0:00:21', 'Person Vehicle'], ['12:58:07', '0:00:16', 'Person'],
  ['11:03:20', '0:00:25', 'Vehicle'], ['09:14:02', '0:00:14', 'Package'], ['08:40:51', '0:00:12', 'Animal'], ['07:12:04', '0:00:18', 'Person']];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 420, height: 1100 }, deviceScaleFactor: 2 });

async function shot(name, setup, extra = {}, width = 420) {
  const page = await ctx.newPage();
  if (width !== 420) await page.setViewportSize({ width: width + 40, height: 800 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${base}/page.html`);
  await page.waitForFunction(() => window.__iconsReady);
  await page.evaluate(({ states, files, lang, extra }) => {
    const day = (o) => { const d = new Date(); d.setDate(d.getDate() - o); return d; };
    const hass = {
      language: lang, locale: { language: lang }, themes: {}, states, entities: {}, devices: {}, user: { is_admin: true },
      hassUrl: (x) => x, auth: {}, callService: async () => {},
      callWS: async (m) => {
        if (m.type === 'camera/capabilities') return { frontend_stream_types: ['web_rtc'], two_way_audio: true };
        const id = m.media_content_id;
        if (id === 'media-source://reolink') return { children: [{ title: 'Garden', media_content_id: 'R|g', can_expand: true }, { title: 'Entrance', media_content_id: 'R|e', can_expand: true }] };
        if (/^R\|[ge]$/.test(id)) return { children: [0, 1, 2].map((o) => { const d = day(o); return { title: `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`, media_content_id: `${id}|${d.getFullYear()}|${d.getMonth() + 1}|${d.getDate()}`, can_expand: true }; }) };
        return { children: files.map(([t, d, tag], i) => ({ title: `${t} ${d} ${tag}`, media_content_id: `${id}|f${i}`, can_play: true })) };
      },
    };
    const c = document.createElement('reolink-app-card');
    c.setConfig({ cameras: [{ name: 'Garden', prefix: 'garten' }, { name: 'Entrance', prefix: 'eingang', doorbell: 'input_boolean.doorbell' }], live_timeout: 300, ...extra });
    document.getElementById('wrap').appendChild(c);
    c.hass = hass;
    window.__c = c; window.__hass = hass;
  }, { states: demoStates(), files: FILES, lang, extra });
  if (width !== 420) await page.evaluate((w) => { document.getElementById('wrap').style.width = `${w}px`; }, width);
  await page.waitForTimeout(500);
  await page.evaluate(async (setup) => {
    const c = window.__c, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    if (setup === 'play') { c._setMode('play'); await wait(400); }
    if (setup === 'settings') { c._settingsOpen = true; c._group = 'g_detect'; c._update(); }
    if (setup === 'panel-settings') { c._group = 'g_detect'; c._setPanel('settings'); await wait(400); }
    if (setup === 'panel-none') { c._setPanel('none'); await wait(400); }
    if (setup === 'grid') { c._setGrid(true); await wait(300); }
    if (setup === 'ring') { c._select(1); await wait(200); const h = window.__hass; c.hass = { ...h, states: { ...h.states, 'input_boolean.doorbell': { state: 'on', attributes: {} } } }; }
    c.shadowRoot.getElementById('toast').classList.remove('show');
  }, setup);
  await page.waitForTimeout(700);
  await page.locator('reolink-app-card').screenshot({ path: path.join(ROOT, 'images', `${name}.png`) });
  if (errors.length) console.warn(name, errors);
  console.log(`images/${name}.png`);
  await page.close();
}

try {
  await shot('live', 'live');
  await shot('playback', 'play', { auto_live: false });
  await shot('settings', 'settings');
  await shot('grid', 'grid');
  await shot('doorbell', 'ring', { auto_live: false });
  await shot('landscape', 'play', { auto_live: false }, 1140);
  if (process.env.SHOTS_ALL) {
    await shot('landscape-settings', 'panel-settings', { auto_live: false }, 1140);
    await shot('landscape-collapsed', 'panel-none', { auto_live: false }, 1140);
  }
} finally {
  await browser.close();
  server.close();
}
