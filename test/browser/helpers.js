/* Gemeinsame Hilfen für die Browser-Tests: kleiner Webserver, Chromium, Karte öffnen */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.mp4': 'video/mp4' };

/* Liefert test/browser/fixtures/ unter / und dist/ unter /dist/ aus */
export async function startServer() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = url.startsWith('/dist/') ? path.join(ROOT, url) : path.join(ROOT, 'test/browser/fixtures', url === '/' ? 'index.html' : url);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((r) => server.close(r)) };
}

export const launch = () => chromium.launch();

/* Öffnet die Testseite, hängt die Karte ein und wartet kurz, bis sie aufgebaut ist.
   options: { query, config, hass, test (window.__T), insecure, fakeActivation } */
export async function openCard(browser, server, options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 436, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript((t) => { window.__T = t; }, options.test || {});
  if (options.insecure) await page.addInitScript(() => Object.defineProperty(window, 'isSecureContext', { get: () => false }));
  if (options.fakeActivation) {
    // Headless Chromium meldet die Seite sonst immer als „schon angetippt“
    await page.addInitScript(() => {
      let active = false;
      Object.defineProperty(navigator, 'userActivation', { get: () => ({ get hasBeenActive() { return active; } }) });
      window.addEventListener('pointerup', () => { active = true; }, true);
    });
  }
  await page.goto(`${server.url}/index.html${options.query || ''}`);
  await page.evaluate(({ config, hass }) => { window.mountCard(config, hass); }, { config: options.config || TWO_CAMS, hass: options.hass || {} });
  await page.waitForTimeout(options.wait ?? 400);
  return {
    page, errors,
    info: () => page.evaluate(() => window.cardInfo()),
    rec: () => page.evaluate(() => window.__R),
    click: (sel) => page.evaluate((s) => window.__card.shadowRoot.querySelector(s).click(), sel),
    run: (fn, arg) => page.evaluate(fn, arg),
    close: () => ctx.close(),
  };
}

/* Zwei Kameras mit den Entitäten, die die Karte über die Namensendungen findet */
export const CAM_STATES = {
  'camera.garten_standardauflosung': ['idle', { entity_picture: '/x.jpg' }],
  'camera.eingang_standardauflosung': ['idle', { entity_picture: '/x.jpg' }],
};
export const TWO_CAMS = { cameras: [{ name: 'Garten', prefix: 'garten' }, { name: 'Eingang', prefix: 'eingang' }], auto_live: true, show_hub: false };
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
