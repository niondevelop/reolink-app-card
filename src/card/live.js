/* Livebild: Qualität, Stream, Raster, Schnappschüsse, Zoom – Methoden der Klasse ReolinkAppCard */
import { Q, Q_ALIAS, Q_ORDER, Q_STORE } from '../constants.js';
import { esc } from '../util.js';

export default {
  /* ---------- Qualität ---------- */
  _normQ(q) { q = Q_ALIAS[String(q).toLowerCase()] || String(q).toLowerCase(); return Q[q] ? q : 'fluent'; },

  _qEntity(q, cam = this._cam) { return this._e({ fluent: 'cam_sd', balanced: 'cam_bal', clear: 'cam_hd' }[q], cam); },

  _qAvail() { return Q_ORDER.filter((q) => this._st(this._qEntity(q))); },

  _ensureQ() {
    const a = this._qAvail();
    if (a.length && !a.includes(this._quality)) { this._quality = a[0]; return true; }
    return false;
  },

  _setQuality(q) {
    this._qOpen = false;
    if (q !== this._quality) { this._quality = q; if (this._live) this._makePic(); }
    try { localStorage.setItem(Q_STORE, q); } catch (_) { /* privater Modus o. ä. */ }
    this._update();
  },

  /* ---------- Bild: Live-Stream oder letzter Schnappschuss ---------- */
  async _liveCard(entity) {
    const helpers = await window.loadCardHelpers();
    const el = helpers.createCardElement({
      type: 'picture-entity', entity, show_name: false, show_state: false,
      camera_view: 'live', fit_mode: 'contain', tap_action: { action: 'none' }, hold_action: { action: 'none' },
    });
    el.hass = this._hass;
    return el;
  },

  async _makePic() {
    const token = (this._picToken = Symbol());
    const host = this.$('pic'), grid = this.$('grid');
    this._pics = [];
    this._micReset();
    this._streamType = null;
    if (!this._live) { host.innerHTML = ''; this._renderGrid([]); return; }
    if (this._grid) {
      const els = await Promise.all(this._cams.map((c) => this._liveCard(this._e('cam_sd', c))));
      if (token !== this._picToken) return;
      host.innerHTML = '';
      this._pics = els;
      this._renderGrid(els);
    } else {
      const want = this._qEntity(this._quality);
      const el = await this._liveCard(this._st(want) ? want : this._e('cam_sd'));
      if (token !== this._picToken) return;
      grid.innerHTML = '';
      host.innerHTML = '';
      host.appendChild(el);
      this._pics = [el];
      if (this._sound) this._applySound();
    }
  },

  _renderGrid(liveEls) {
    const grid = this.$('grid');
    grid.innerHTML = '';
    if (!this._grid) return;
    grid.style.setProperty('--cols', this._cams.length > 4 ? 3 : 2);
    this._cams.forEach((c, i) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.i = i;
      const snap = this._snaps[i];
      cell.innerHTML = `<img class="prev${snap ? ' ok' : ''}" alt="" ${snap ? `src="${esc(snap.url)}"` : ''}><div class="pic"></div>
        <span class="cl"><span class="dot"></span>${esc(c.name)}<span class="cb"></span></span>`;
      if (liveEls[i]) cell.querySelector('.pic').appendChild(liveEls[i]);
      cell.onclick = () => { this._idx = i; this._setGrid(false); this._rebuildCamera(); };
      grid.appendChild(cell);
    });
    this._update();
  },

  /* Schnappschuss einmalig laden (statt ständig neu abzufragen) – weckt die Akkukamera nur bei Bedarf */
  _loadSnap(i, force) {
    const cam = this._cams[i];
    if (!cam || !this._hass) return;
    if (this._snaps[i] && !force) return;
    const snapId = this._st(this._e('snap', cam)) ? this._e('snap', cam) : this._e('cam_sd', cam);
    const s = this._st(snapId);
    if (!s || !s.attributes.entity_picture) return;
    const base = this._hass.hassUrl(s.attributes.entity_picture);
    this._snaps[i] = { url: `${base}${base.includes('?') ? '&' : '?'}t=${Date.now()}`, time: new Date() };
    if (i === this._idx) this.$('prev').src = this._snaps[i].url;
    const cell = this.$('grid').querySelector(`.cell[data-i="${i}"] .prev`);
    if (cell) { cell.src = this._snaps[i].url; cell.classList.add('ok'); }
  },

  /* ---------- Live ---------- */
  _startLive() {
    this._linkLive = false;
    if (this._linkTalk) { this._linkTalk = false; setTimeout(() => this._talkWhenReady(), 0); }
    if (this._playing) this._stopPlayback(true);
    this._live = true;
    const t = +this._config.live_timeout || 0;
    this._liveEnds = t > 0 ? Date.now() + t * 1000 : 0;
    clearInterval(this._tick);
    if (this._liveEnds) {
      this._tick = setInterval(() => {
        if (this._mic !== 'off' && this._liveEnds - Date.now() < 60000) this._liveEnds = Date.now() + 60000;
        if (Date.now() >= this._liveEnds) { this._expired = true; this._stopLive(); }
        else this._updateTimer();
      }, 1000);
    }
    this._makePic();
    this._update();
  },

  _stopLive(silent) {
    clearInterval(this._tick);
    if (!this._live) return;
    this._live = false;
    this._makePic();
    // Kamera ist gerade wach: aktuelles Bild als Vorschau übernehmen
    if (this._grid) this._cams.forEach((_, i) => this._loadSnap(i, true));
    else this._loadSnap(this._idx, true);
    if (!silent) this._update();
  },

  _fullscreen() {
    const el = this.$('stage');
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen();
    else if (this._vid().webkitEnterFullscreen && this._playing) this._vid().webkitEnterFullscreen();
  },

  /* ---------- Digitaler Zoom ---------- */
  _setupZoom() {
    const stage = this.$('stage'), media = this.$('media');
    const pts = new Map();
    let pinch = null, pan = null, tap = 0, moved = false;
    const rect = () => stage.getBoundingClientRect();
    const zoomAt = (s, px, py) => {
      const z = this._zoom;
      s = Math.min(5, Math.max(1, s));
      z.x = px - (px - z.x) * (s / z.s);
      z.y = py - (py - z.y) * (s / z.s);
      z.s = s;
      this._applyZoom();
    };
    stage.addEventListener('pointerdown', (e) => {
      // Buttons und die Video-Bedienleiste unten nicht für Zoom/Verschieben abfangen
      if (this._grid || e.target.closest('button') || (this._playing && e.clientY > rect().bottom - 56)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = false;
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const r = rect();
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: this._zoom.s, mx: (a.x + b.x) / 2 - r.left, my: (a.y + b.y) / 2 - r.top };
        pan = null;
      } else if (this._zoom.s > 1) {
        pan = { x: e.clientX, y: e.clientY, zx: this._zoom.x, zy: this._zoom.y };
        try { stage.setPointerCapture(e.pointerId); } catch (_) { /* ignorieren */ }
      }
    });
    stage.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      const p = pts.get(e.pointerId);
      if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > 6) moved = true;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pts.size === 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        zoomAt(pinch.s * (d / pinch.d), pinch.mx, pinch.my);
      } else if (pan) {
        this._zoom.x = pan.zx + (e.clientX - pan.x);
        this._zoom.y = pan.zy + (e.clientY - pan.y);
        this._applyZoom();
      }
    });
    const up = (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (!pts.size) {
        pan = null;
        if (!moved) {
          const now = Date.now();
          if (now - tap < 320) {
            const r = rect();
            if (this._zoom.s > 1) this._resetZoom(); else zoomAt(2.5, e.clientX - r.left, e.clientY - r.top);
            tap = 0;
          } else tap = now;
        }
      }
    };
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', (e) => {
      if (this._grid || (!e.ctrlKey && this._zoom.s === 1)) return;
      e.preventDefault();
      const r = rect();
      zoomAt(this._zoom.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
  },

  _applyZoom() {
    const z = this._zoom, stage = this.$('stage');
    const w = stage.clientWidth, h = stage.clientHeight;
    if (z.s <= 1.001) { z.s = 1; z.x = 0; z.y = 0; }
    z.x = Math.min(0, Math.max(w - w * z.s, z.x));
    z.y = Math.min(0, Math.max(h - h * z.s, z.y));
    this.$('media').style.transform = z.s === 1 ? '' : `translate(${z.x}px, ${z.y}px) scale(${z.s})`;
    stage.classList.toggle('zoomed', z.s > 1);
    const zp = this.$('zoompill');
    zp.textContent = z.s > 1 ? `${z.s.toFixed(1)}×` : '';
    zp.style.display = z.s > 1 ? '' : 'none';
    this.$('unzoom').style.display = z.s > 1 ? '' : 'none';
  },

  _resetZoom() { this._zoom = { s: 1, x: 0, y: 0 }; if (this._built) this._applyZoom(); },

  _openLink(url, download) {
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noreferrer';
    if (download) a.download = download;
    a.style.display = 'none';
    this.shadowRoot.appendChild(a);
    a.click();
    a.remove();
  },

  _stamp() { return new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-'); },

  _snapshot() {
    const want = this._qEntity(this._quality);
    const id = this._st(want) ? want : this._e('cam_sd');
    const s = this._st(id);
    if (!s) return;
    this._openLink(this._hass.hassUrl(`/api/camera_proxy/${id}?token=${s.attributes.access_token}`), `${this._cam.name}_${this._stamp()}.jpg`);
  },
};
