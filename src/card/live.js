/* Livebild: Qualität, Stream, Raster, Schnappschüsse, Zoom – Methoden der Klasse ReolinkAppCard */
import { Q, Q_ALIAS, Q_ORDER, Q_STORE } from '../constants.js';
import { esc } from '../util.js';

export default {
  /* ---------- Qualität ---------- */
  _normQ(q) { q = Q_ALIAS[String(q).toLowerCase()] || String(q).toLowerCase(); return Q[q] ? q : 'fluent'; },

  _qEntity(q, cam = this._cam) { return this._e({ fluent: 'cam_sd', balanced: 'cam_bal', clear: 'cam_hd', tele: 'cam_tele' }[q], cam); },

  /* Bezeichnung der Stufe: „Tele“ bei der TrackMix, „2. Objektiv“ bei anderen Kameras mit zwei Objektiven (Duo) */
  _qLabel(q, cam = this._cam) {
    if (q !== 'tele') return this._t(Q[q].key);
    const dev = this._hass && this._hass.devices && cam._devId && this._hass.devices[cam._devId];
    const idx = this._devIndex(cam) || {};
    const tele = idx['camera:telephoto_sub'] || /trackmix/i.test((dev && (dev.model || dev.name)) || '');
    return this._t(tele ? 'q_tele' : 'q_lens2');
  },

  _qAvail() { return this._foreign() ? [] : Q_ORDER.filter((q) => this._st(this._qEntity(q))); },

  _ensureQ() {
    const a = this._qAvail();
    if (a.length && !a.includes(this._quality)) { this._quality = a[0]; return true; }
    return false;
  },

  _setQuality(q) {
    this._qOpen = false;
    // Im Raster nur die gewählte Kachel neu aufbauen, nicht alle Streams
    if (q !== this._quality) { this._quality = q; if (this._live) { if (this._grid) this._swapCell(this._idx); else this._makePic(); } }
    try { localStorage.setItem(Q_STORE, q); } catch (_) { /* privater Modus o. ä. */ }
    this._update();
  },

  /* ---------- Bild: Live-Stream oder letzter Schnappschuss ---------- */
  /* Entität für das Livebild: gewählte Qualität, sonst Flüssig; null, wenn die Kamera keinen Video-Stream hat */
  _streamEnt(cam = this._cam, q = cam === this._cam ? this._quality : 'fluent') {
    const want = this._qEntity(q, cam);
    if (this._st(want)) return want;
    const sd = this._e('cam_sd', cam);
    return this._st(sd) ? sd : null;
  },

  /* Kamera ohne Video-Stream, nur mit Schnappschüssen (z. B. Akku-Klingel ohne Hub) */
  _snapOnly(cam = this._cam) {
    return !this._streamEnt(cam) && !!(this._st(this._e('snap', cam)) || this._st(this._e('snap_hd', cam)));
  },

  /* Livebild einer Kamera: Player von Home Assistant, oder bei Kameras ohne Video-Stream eine eigene Bildfolge (MJPEG),
     die wie das Standbild das ganze Bild zeigt (der Player von Home Assistant schneidet sie zu) */
  async _liveEl(cam) {
    const ent = this._streamEnt(cam);
    if (ent || !this._snapOnly(cam)) return this._liveCard(ent || this._e('cam_sd', cam));
    const id = this._st(this._e('snap', cam)) ? this._e('snap', cam) : this._e('snap_hd', cam);
    const img = document.createElement('img');
    img.className = 'mjpeg';
    img.alt = '';
    img.src = this._hass.hassUrl(`/api/camera_proxy_stream/${id}?token=${this._st(id).attributes.access_token}`);
    return img;
  },

  /* Livebild: Player von Home Assistant (ha-camera-stream) direkt einsetzen, wie das Kamerafenster von Home Assistant.
     Ohne den Umweg über eine Bildentitäts-Karte startet der Stream schneller, und Ton ein/aus braucht keine neue Verbindung,
     wenn er schon beim Start gewünscht ist. Fehlt der Player (noch nicht geladen), dient die Bildentitäts-Karte als Rückfall. */
  async _liveCard(entity) {
    if (await this._streamReady()) {
      const el = document.createElement('ha-camera-stream');
      el.hass = this._hass;
      el.stateObj = this._st(entity);
      // Mit Ton erst, wenn der Browser es erlaubt (nach dem ersten Antippen), sonst bliebe das Bild schwarz
      const ua = navigator.userActivation;
      el.muted = !(this._sound && (!ua || ua.hasBeenActive));
      el.fitMode = 'contain';
      el.controls = false;
      el.dataset.entity = entity;
      // Gegensprechen vorbereiten: Verbindung gleich mit (stummem) Sprechkanal, damit das Mikrofon später sofort da ist
      if (this._talkPrepWanted() && (await this._talkPrepOk(entity))) this._talkPrep(el);
      return el;
    }
    const helpers = await window.loadCardHelpers();
    const el = helpers.createCardElement({
      type: 'picture-entity', entity, show_name: false, show_state: false,
      camera_view: 'live', fit_mode: 'contain', tap_action: { action: 'none' }, hold_action: { action: 'none' },
    });
    el.hass = this._hass;
    return el;
  },

  /* Player-Modul von Home Assistant einmal vorab laden (beim Aufbau der Karte, nicht erst beim Start des Livebilds).
     Home Assistant lädt ha-camera-stream erst mit einer Kamera-Karte; darum einmal eine Bildentitäts-Karte erzeugen. */
  _streamReady() {
    if (customElements.get('ha-camera-stream')) return Promise.resolve(true);
    if (!this._streamLoad) {
      this._streamLoad = (async () => {
        try {
          const helpers = window.loadCardHelpers && await window.loadCardHelpers();
          const cam = this._cams.map((c) => this._streamEnt(c)).find(Boolean);
          if (helpers && cam) helpers.createCardElement({ type: 'picture-entity', entity: cam, camera_view: 'live' });
          await Promise.race([customElements.whenDefined('ha-camera-stream'), new Promise((r) => setTimeout(r, 4000))]);
        } catch (_) { /* Rückfall auf die Bildentitäts-Karte */ }
        return !!customElements.get('ha-camera-stream');
      })();
    }
    return this._streamLoad;
  },

  async _makePic() {
    const token = (this._picToken = Symbol());
    if (this._live) this._t0 = performance.now();
    const host = this.$('pic'), grid = this.$('grid');
    this._pics = [];
    this._micReset();
    this._streamType = null;
    if (!this._live) { host.innerHTML = ''; this._renderGrid([]); return; }
    if (this._grid) {
      const els = await Promise.all(this._cams.map((c) => this._liveEl(c)));
      if (token !== this._picToken) return;
      host.innerHTML = '';
      this._pics = els;
      this._renderGrid(els);
    } else {
      const el = await this._liveEl(this._cam);
      if (token !== this._picToken) return;
      grid.innerHTML = '';
      host.innerHTML = '';
      host.appendChild(el);
      this._pics = [el];
      if (this._sound) this._applySound();
    }
  },

  /* Kachel im Raster wählen: Livebild bleibt, Tasten, PTZ und Qualität gelten für diese Kamera */
  _gridSelect(i) {
    if (i === this._idx) return;
    const old = this._idx, qBefore = this._quality;
    this._idx = i;
    this._ptzOpen = false; this._qOpen = false;
    this._ensureQ();
    this._loadSnap(i);
    // Aufnahmen und Ereignisse gehören zur gewählten Kamera
    this._days = null; this._files = null; this._dayIdx = 0;
    if (this._eventsShown()) this._loadDays();
    // Die gewählte Kamera läuft in der gewählten Qualität, die übrigen flüssig: nur alte und neue Kachel tauschen
    if (this._live && (qBefore !== 'fluent' || this._quality !== 'fluent')) { this._swapCell(old); this._swapCell(i); }
    this._update();
  },

  /* Livebild einer Rasterkachel neu aufbauen (z. B. andere Qualität), die übrigen Kacheln laufen weiter */
  async _swapCell(i) {
    if (!this._grid || !this._live || !this._cams[i]) return;
    const token = this._picToken;
    const el = await this._liveEl(this._cams[i]);
    if (token !== this._picToken || !this._grid) return;
    const pic = this.$('grid').querySelector(`.cell[data-i="${i}"] .pic`);
    if (!pic) return;
    pic.innerHTML = '';
    pic.appendChild(el);
    this._pics[i] = el;
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
      cell.tabIndex = 0;
      cell.setAttribute('role', 'button');
      cell.setAttribute('aria-label', c.name);
      const snap = this._snaps[i];
      cell.innerHTML = `<img class="prev${snap ? ' ok' : ''}" alt="" ${snap ? `src="${esc(snap.url)}"` : ''}><div class="pic"></div>
        <span class="cl"><span class="dot"></span>${esc(c.name)}<span class="cb"></span></span>`;
      if (liveEls[i]) cell.querySelector('.pic').appendChild(liveEls[i]);
      // Erster Tipp wählt die Kachel (Tasten wirken auf sie), ein weiterer Tipp auf die gewählte öffnet sie gross
      cell.onclick = () => { if (i === this._idx) { this._setGrid(false); this._rebuildCamera(); } else this._gridSelect(i); };
      cell.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cell.onclick(); } };
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
      delete z.cx; delete z.cy; // ab jetzt von Hand gezoomt
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
        delete this._zoom.cx; delete this._zoom.cy;
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
            if (this._zoom.s > 1) this._unzoom(); else zoomAt(2.5, e.clientX - r.left, e.clientY - r.top);
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
    // Voreingestellter Ausschnitt der Kamera: Mittelpunkt in Prozent des Bildes, auch nach Grössenänderung
    if (z.cx !== undefined && w) { z.x = w / 2 - w * z.s * z.cx / 100; z.y = h / 2 - h * z.s * z.cy / 100; }
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

  /* Ausgangsbild: voreingestellter Zoom der Kamera (Optionen zoom, zoom_x, zoom_y), sonst das ganze Bild */
  _defaultZoom(cam = this._cam) {
    const s = Math.min(4, Math.max(1, +(cam && cam.zoom) || 1));
    if (s <= 1) return { s: 1, x: 0, y: 0 };
    const pct = (v) => Math.min(100, Math.max(0, v === undefined || v === '' || isNaN(+v) ? 50 : +v));
    return { s, x: 0, y: 0, cx: pct(cam.zoom_x), cy: pct(cam.zoom_y) };
  },

  _resetZoom() { this._zoom = this._defaultZoom(); if (this._built) this._applyZoom(); },

  /* Herauszoomen: zurück zum voreingestellten Ausschnitt; ist er schon gezeigt, das ganze Bild */
  _unzoom() {
    const d = this._defaultZoom(), z = this._zoom;
    const atDefault = d.s > 1 && z.cx !== undefined && Math.abs(z.s - d.s) < 0.01;
    this._zoom = atDefault ? { s: 1, x: 0, y: 0 } : d;
    if (this._built) this._applyZoom();
  },

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
