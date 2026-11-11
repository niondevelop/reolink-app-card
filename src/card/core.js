/* Grundlagen: Konfiguration, Entitäten, hass, Sichtbarkeit, Kamera- und Moduswechsel, Dialoge – Methoden der Klasse ReolinkAppCard */
import { DET, EVT, PLAY_Q_STORE, Q, Q_STORE } from '../constants.js';
import { DC, ENT, HUB_ENT, LEGACY, TK, findHubPrefix, prefixOf } from '../entities.js';
import { STR, fmt, pickLang } from '../i18n.js';
import { esc } from '../util.js';

export default {
  setConfig(config) {
    if (!config || !Array.isArray(config.cameras) || !config.cameras.length) throw new Error(STR.de.need_cameras);
    if (config.cameras.some((c) => !c || !(c.prefix || c.entity))) throw new Error(STR[pickLang(config.language)].need_prefix);
    this._config = {
      live_timeout: 300, auto_live: true, auto_switch: true, autoplay_next: true,
      default_quality: 'fluent', audio: 'manual', battery_warning: 20, temperature_warning: 45, temperature_low_warning: -10,
      hub_prefix: 'reolink_hub', show_hub: true, alert_seconds: 8, language: 'auto', doorbell_timeout: 30, doorbell_sound: true,
      ...config,
    };
    this._cams = config.cameras.map((c) => {
      const over = { ...(c.entities || {}) };
      Object.entries(LEGACY).forEach(([k, v]) => { if (c[k]) over[v] = c[k]; });
      const prefix = c.prefix || prefixOf(c.entity) || String(c.entity).split('.').pop();
      return { prefix, entity: c.entity, doorbell: c.doorbell, nameSet: !!c.name, mediaSet: !!c.media_name, name: c.name || prefix, media_name: c.media_name || c.name || prefix, talk_url: c.talk_url, over };
    });
    this._idx = 0;
    this._mode = 'live';
    this._grid = false;
    // Zuletzt auf diesem Gerät gewählte Qualität hat Vorrang vor der Startqualität
    let saved = null;
    try { saved = localStorage.getItem(Q_STORE); } catch (_) { /* privater Modus o. ä. */ }
    this._quality = this._normQ(saved && Q[saved] ? saved : this._config.default_quality);
    this._qOpen = false;
    // Auflösung der Wiedergabe: zuletzt gewählte, sonst niedrig (schneller, akkuschonend)
    let playQ = null;
    try { playQ = localStorage.getItem(PLAY_Q_STORE); } catch (_) { /* privater Modus o. ä. */ }
    this._playQ = playQ === 'high' ? 'high' : 'low';
    this._res = null;
    this._live = false;
    this._filter = 'all';
    this._days = null; this._dayIdx = 0; this._files = null; this._playing = null;
    this._settingsOpen = false; this._group = null;
    this._speed = 1;
    this._zoom = { s: 1, x: 0, y: 0 };
    this._snaps = {};
    this._prevDet = null;
    this._pics = [];
    this._watch = null; this._hubAuto = undefined;
    this._twa = {}; this._sound = this._config.audio === 'auto'; this._sndCheck = this._sound; this._mic = 'off'; this._micReq = 0; this._streamType = null;
    if (this._built) { this._renderTabs(); this._rebuildCamera(); }
  },

  /* ---------- Hilfen ---------- */
  get _lang() { return pickLang(this._config && this._config.language, this._hass); },

  _t(k, v) { return fmt((STR[this._lang] || STR.en)[k] || STR.en[k] || k, v); },

  get _cam() { return this._cams[this._idx]; },

  _st(id) { return this._hass && id ? this._hass.states[id] : undefined; },

  _on(id) { const s = this._st(id); return !!s && s.state === 'on'; },

  _num(id) { const s = this._st(id); return s && s.state !== '' && !isNaN(+s.state) ? +s.state : null; },

  /* Entity einer Kamera auflösen: Überschreibung > Geräteregister (interner Schlüssel) > Namensendungen deutsch/englisch */
  _e(key, cam = this._cam) {
    if (cam.over[key]) return cam.over[key];
    const [domain, ...suf] = ENT[key];
    const dev = this._devIndex(cam);
    if (dev) {
      for (const tk of [].concat(TK[key] || [])) { const id = dev[`${domain}:${tk}`]; if (id) return id; }
      if (DC[key] && dev[`${domain}:dc:${DC[key]}`]) return dev[`${domain}:dc:${DC[key]}`];
    }
    for (const s of suf) { const id = `${domain}.${cam.prefix}_${s}`; if (this._st(id)) return id; }
    return `${domain}.${cam.prefix}_${suf[0]}`;
  },

  /* Alle Entitäten des Geräts einer Kamera nach internem Schlüssel (aus hass.entities, ohne Streams oder Abfragen) */
  _devIndex(cam) {
    const reg = this._hass && this._hass.entities;
    if (!reg) return null;
    if (cam._reg === reg) return cam._dev;
    cam._reg = reg; cam._dev = null; cam._devId = null;
    const cand = [cam.entity, ...['cam_sd', 'cam_bal', 'cam_hd', 'snap'].flatMap((k) => ENT[k].slice(1).map((x) => `camera.${cam.prefix}_${x}`))];
    const hit = cand.find((id) => id && reg[id] && reg[id].device_id);
    if (!hit) return null;
    cam._devId = reg[hit].device_id;
    const idx = {};
    Object.keys(reg).forEach((id) => {
      const r = reg[id];
      if (r.device_id !== cam._devId) return;
      const domain = id.split('.')[0];
      if (r.translation_key) idx[`${domain}:${r.translation_key}`] = id;
      const st = this._hass.states[id], dc = st && st.attributes.device_class;
      if (dc && !idx[`${domain}:dc:${dc}`]) idx[`${domain}:dc:${dc}`] = id;
    });
    cam._dev = idx;
    // Ohne eigenen Namen: Gerätename verwenden (ist auch der Name in der Reolink-Medienquelle)
    const dev = this._hass.devices && this._hass.devices[cam._devId];
    const devName = dev && (dev.name_by_user || dev.name);
    if (devName) { if (!cam.nameSet) cam.name = devName; if (!cam.mediaSet) cam.media_name = devName; }
    return idx;
  },

  _hubE(key) {
    const over = (this._config.hub_entities || {})[key];
    if (over) return over;
    const [domain, ...suf] = HUB_ENT[key];
    for (const pre of [this._config.hub_prefix, this._hubPrefix()]) {
      if (!pre) continue;
      for (const s of suf) { const id = `${domain}.${pre}_${s}`; if (this._st(id)) return id; }
    }
    return null;
  },

  /* Hub automatisch finden: Entität des Szenenmodus bzw. der SD-Karte (einmal suchen, dann merken) */
  _hubPrefix() {
    if (this._hubAuto !== undefined && (this._hubAuto || Date.now() - this._hubTry < 60000)) return this._hubAuto;
    this._hubTry = Date.now();
    this._hubAuto = findHubPrefix(this._hass);
    if (this._hubAuto) this._watch = null;
    return this._hubAuto;
  },

  /* Alle Entitäten, deren Änderung die Karte betrifft (alle Namensvarianten aller Kameras und des Hubs) */
  _watchIds() {
    if (this._watch) return this._watch;
    const ids = new Set();
    const reg = this._hass && this._hass.entities;
    this._cams.forEach((cam) => {
      Object.values(cam.over).forEach((id) => ids.add(id));
      if (this._devIndex(cam)) Object.keys(reg).forEach((id) => { if (reg[id].device_id === cam._devId) ids.add(id); });
      Object.values(ENT).forEach(([domain, ...suf]) => suf.forEach((x) => ids.add(`${domain}.${cam.prefix}_${x}`)));
    });
    [this._config.hub_prefix, this._hubAuto].filter(Boolean).forEach((pre) => Object.values(HUB_ENT).forEach(([domain, ...suf]) => suf.forEach((x) => ids.add(`${domain}.${pre}_${x}`))));
    Object.values(this._config.hub_entities || {}).forEach((id) => ids.add(id));
    if (this._config.mode_entity) ids.add(this._config.mode_entity);
    this._cams.forEach((cam) => { if (typeof cam.doorbell === 'string') ids.add(cam.doorbell); });
    this._watch = [...ids];
    return this._watch;
  },

  /* Hat sich seit dem letzten Mal etwas geändert, das die Karte betrifft? */
  _relevantChange(old, hass) {
    if (!old || old.language !== hass.language || old.locale !== hass.locale || old.themes !== hass.themes) return true;
    if (old.entities !== hass.entities) { this._watch = null; return true; }
    if (old.states === hass.states) return false;
    return this._watchIds().some((id) => old.states[id] !== hass.states[id]);
  },

  _det(cam) { return DET.filter((k) => this._on(this._e(`det_${k}`, cam))); },

  getCardSize() { return 10; },

  getGridOptions() { return { columns: 'full', rows: 'auto' }; },

  set hass(hass) {
    const old = this._hass, first = !old;
    this._hass = hass;
    // Home Assistant setzt hass bei jeder Zustandsänderung im ganzen System neu – nur reagieren, wenn es die Karte betrifft
    if (this._built && !this._relevantChange(old, hass)) return;
    if (!this._built) this._build();
    this._pics.forEach((p) => { p.hass = hass; });
    if (first) { this._cams.forEach((c) => this._devIndex(c)); setTimeout(() => this._onLink(), 0); this._renderTabs(); this._renderFilters(); this._loadSnap(this._idx); }
    if (this._ensureQ() && this._live) this._makePic();
    this._checkDoorbell(old, hass);
    this._checkDetections();
    this._update();
    this._autoLive();
  },

  connectedCallback() {
    if (this._built) this._observe();
    window.addEventListener('location-changed', this._onLink);
    window.addEventListener('popstate', this._onLink);
    this._onLink();
    window.addEventListener('webrtc-stream-stopped', this._onAppStop);
  },

  disconnectedCallback() {
    window.removeEventListener('webrtc-stream-stopped', this._onAppStop);
    window.removeEventListener('location-changed', this._onLink);
    this._endRing(false);
    window.removeEventListener('popstate', this._onLink);
    this._sndStopWait();
    this._micReset();
    clearInterval(this._tick);
    clearTimeout(this._toastT);
    if (this._io) this._io.disconnect();
    if (this._onVis) { document.removeEventListener('visibilitychange', this._onVis); this._onVis = null; }
    this._visible = false;
    this._stopLive(true);
  },

  /* ---------- Sichtbarkeit & Auto-Live ---------- */
  _observe() {
    if (!this._io) {
      this._io = new IntersectionObserver((entries) => {
        this._visible = entries.some((e) => e.isIntersecting);
        this._autoLive();
      }, { threshold: 0.2 });
    }
    this._io.observe(this.$('stage'));
    if (!this._onVis) {
      this._onVis = () => this._autoLive();
      document.addEventListener('visibilitychange', this._onVis);
    }
  },

  get _canAutoLive() {
    return (this._config.auto_live || this._linkLive) && this._visible && !document.hidden
      && this._mode === 'live' && !this._playing && !this._expired;
  },

  _autoLive() {
    if (!this._built || !this._hass) return;
    if (this._canAutoLive) { if (!this._live) this._startLive(); }
    else if (this._live && (!this._visible || document.hidden)) this._stopLive();
  },

  _setGrid(on) {
    if (this._cams.length < 2) on = false;
    this._grid = on;
    this._qOpen = false;
    this._resetZoom();
    if (on && this._mode !== 'live') this._mode = 'live';
    if (on) this._cams.forEach((_, i) => this._loadSnap(i));
    this._makePic();
    this._update();
    this._autoLive();
  },

  _select(i) {
    if (i === this._idx) return;
    this._idx = i;
    this._rebuildCamera();
  },

  _rebuildCamera() {
    if (this._ring && this._ring.idx !== this._idx) this._endRing(false);
    this._ptzOpen = false;
    const wasLive = this._live;
    this._stopLive(true);
    this._stopPlayback(true);
    this._expired = false;
    this._qOpen = false;
    this._resetZoom();
    this._ensureQ();
    this._days = null; this._files = null; this._dayIdx = 0;
    this._loadSnap(this._idx);
    if (this._canAutoLive || (wasLive && this._mode === 'live')) this._startLive();
    else this._makePic();
    if (this._mode === 'play') this._loadDays();
    this._update();
  },

  _setMode(m) {
    this._mode = m;
    if (m === 'play' && this._grid) { this._grid = false; this._makePic(); }
    if (m === 'play' && !this._days) this._loadDays();
    if (m === 'play' && this._live) this._stopLive(true);
    this._update();
    this._autoLive();
  },

  /* ---------- Erkennung: automatisch zur Kamera springen ---------- */
  _checkDetections() {
    const now = this._cams.map((c) => this._det(c));
    const prev = this._prevDet;
    this._prevDet = now;
    if (!prev) return;
    now.forEach((list, i) => {
      const fresh = list.filter((k) => !prev[i].includes(k));
      if (!fresh.length) return;
      const type = fresh[0];
      this._toast({ text: this._t('detected', { type: this._t(`evt_${type}`), name: this._cams[i].name }), color: EVT[type].color, icon: EVT[type].icon });
      if (!this._live) this._loadSnap(i, true);
      if (!this._config.auto_switch || this._mode !== 'live' || this._playing) return;
      if (i !== this._idx && !this._grid) { this._idx = i; this._expired = false; this._rebuildCamera(); }
      else if (!this._live && this._visible && !document.hidden) { this._expired = false; this._startLive(); }
    });
  },

  /* Bestätigung im Design der Karte statt Browser-Fenster; liefert true/false */
  _ask(text, okLabel, danger) {
    const $ = this.$, box = $('dlg');
    if (this._askDone) this._askDone(false);
    $('dtext').textContent = text;
    $('dno').textContent = this._t('cancel');
    $('dyes').textContent = okLabel;
    $('dyes').classList.toggle('danger', !!danger);
    box.classList.add('show');
    return new Promise((resolve) => {
      const done = (v) => { box.classList.remove('show'); this._askDone = null; document.removeEventListener('keydown', key, true); resolve(v); };
      const key = (e) => { if (e.key === 'Escape') done(false); else if (e.key === 'Enter') done(true); };
      this._askDone = done;
      $('dno').onclick = () => done(false);
      $('dyes').onclick = () => done(true);
      box.onclick = (e) => { if (e.target === box) done(false); };
      document.addEventListener('keydown', key, true);
      $('dyes').focus();
    });
  },

  _toast(t) {
    const el = this.$('toast');
    el.style.setProperty('--c', t.color);
    el.classList.toggle('wrap', !!t.wrap);
    el.innerHTML = `<ha-icon icon="${t.icon}"></ha-icon><span>${esc(t.text)}</span>`;
    el.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => el.classList.remove('show'), (+this._config.alert_seconds || 8) * 1000);
  },

  /* ---------- Steuerung ---------- */
  _call(domain, service, entity_id, data = {}) {
    return this._hass.callService(domain, service, { entity_id, ...data });
  },
};
