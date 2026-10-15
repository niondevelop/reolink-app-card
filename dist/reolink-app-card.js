/* Reolink App Card – Live, Steuerung & Wiedergabe im Stil der Reolink-App */
const RAC_VERSION = '1.2.1';

const Q = {
  fluent:   { label: 'Flüssig',    icon: 'mdi:quality-low' },
  balanced: { label: 'Balanciert', icon: 'mdi:quality-medium' },
  clear:    { label: 'Klar',       icon: 'mdi:quality-high' },
};
const Q_ORDER = ['fluent', 'balanced', 'clear'];
const Q_ALIAS = { sd: 'fluent', low: 'fluent', hd: 'clear', high: 'clear', medium: 'balanced' };
const REOLINK_ANDROID = 'intent://#Intent;package=com.mcu.reolink;end';

const EVT = {
  person:  { label: 'Person',    icon: 'mdi:walk',      color: '#ff5b5b', re: /person|people|human|mensch/i },
  vehicle: { label: 'Fahrzeug',  icon: 'mdi:car',       color: '#ffa630', re: /vehicle|car|fahrzeug/i },
  animal:  { label: 'Tier',      icon: 'mdi:paw',       color: '#3ccf8e', re: /animal|pet|dog|cat|tier/i },
  motion:  { label: 'Bewegung',  icon: 'mdi:motion-sensor', color: '#4da3ff', re: /motion|md|pir|bewegung/i },
  other:   { label: 'Aufnahme',  icon: 'mdi:record-rec', color: '#9aa4b2', re: /.^/ },
};
const EVT_ORDER = ['person', 'vehicle', 'animal', 'motion', 'other'];

const ent = (p, s) => `${p}_${s}`;

class ReolinkAppCard extends HTMLElement {
  setConfig(config) {
    if (!config.cameras || !config.cameras.length) throw new Error('Bitte "cameras" definieren');
    this._config = {
      live_timeout: 300,
      auto_live: true,
      default_quality: 'fluent',
      ...config,
      cameras: config.cameras.map((c) => {
        const p = c.prefix;
        if (!p) throw new Error('Jede Kamera braucht "prefix"');
        return {
          name: c.name || p,
          media_name: c.media_name || c.name || p,
          cam_sd: c.camera_sd || `camera.${ent(p, 'standardauflosung')}`,
          cam_bal: c.camera_balanced || `camera.${ent(p, 'ausgewogen')}`,
          cam_hd: c.camera_hd || `camera.${ent(p, 'hochauflosung')}`,
          talk_url: c.talk_url,
          light: c.light || `light.${ent(p, 'flutlicht')}`,
          siren: c.siren || `siren.${ent(p, 'sirene')}`,
          prealarm: c.prealarm || `button.${ent(p, 'voralarm')}`,
          manual_rec: c.manual_record || `switch.${ent(p, 'manuelle_aufzeichnung')}`,
          rec: c.record || `switch.${ent(p, 'aufzeichnen')}`,
          pir: c.pir || `switch.${ent(p, 'pir_aktiviert')}`,
          push: c.push || `switch.${ent(p, 'push_benachrichtigungen')}`,
          daynight: c.day_night || `select.${ent(p, 'tag_nacht_modus')}`,
          battery: c.battery || `sensor.${ent(p, 'batterie')}`,
          wifi: c.wifi || `sensor.${ent(p, 'wlan_signal')}`,
          sleep: c.sleep || `binary_sensor.${ent(p, 'schlafstatus')}`,
          det: {
            person: `binary_sensor.${ent(p, 'person')}`,
            vehicle: `binary_sensor.${ent(p, 'fahrzeug')}`,
            animal: `binary_sensor.${ent(p, 'tier')}`,
            motion: `binary_sensor.${ent(p, 'bewegung')}`,
          },
        };
      }),
    };
    this._idx = 0;
    this._mode = 'live';
    this._quality = this._normQ(this._config.default_quality);
    this._qOpen = false;
    this._live = false;
    this._filter = 'all';
    this._days = null;
    this._dayIdx = 0;
    this._files = null;
    this._playing = null;
    this._settingsOpen = false;
    this._visible = false;
    if (this._built) this._rebuildCamera();
  }

  connectedCallback() {
    if (this._built) this._observe();
  }

  /* Live nur, solange die Karte sichtbar ist (schont Akku und Bandbreite) */
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
  }

  get _canAutoLive() {
    return this._config.auto_live && this._visible && !document.hidden
      && this._mode === 'live' && !this._playing && !this._expired;
  }

  _autoLive() {
    if (!this._built || !this._hass) return;
    if (this._canAutoLive) { if (!this._live) this._startLive(); }
    else if (this._live && (!this._visible || document.hidden)) this._stopLive();
  }

  /* ---------- Qualität ---------- */
  _normQ(q) { q = Q_ALIAS[String(q).toLowerCase()] || String(q).toLowerCase(); return Q[q] ? q : 'fluent'; }
  _qEntity(q, cam = this._cam) { return { fluent: cam.cam_sd, balanced: cam.cam_bal, clear: cam.cam_hd }[q]; }
  _qAvail() { return Q_ORDER.filter((q) => this._st(this._qEntity(q))); }
  _ensureQ() {
    const a = this._qAvail();
    if (a.length && !a.includes(this._quality)) { this._quality = a[0]; return true; }
    return false;
  }
  _setQuality(q) {
    this._qOpen = false;
    if (q !== this._quality) { this._quality = q; this._makePic(); }
    this._update();
  }

  getCardSize() { return 9; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  static getStubConfig() { return { cameras: [{ name: 'Kamera', prefix: 'kamera' }] }; }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) this._build();
    if (this._pic) this._pic.hass = hass;
    if (this._ensureQ()) this._makePic();
    this._update();
    this._autoLive();
  }

  get _cam() { return this._config.cameras[this._idx]; }
  _st(id) { return this._hass && this._hass.states[id]; }
  _on(id) { const s = this._st(id); return !!s && s.state === 'on'; }

  /* ---------- Aufbau ---------- */
  _build() {
    this._built = true;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>${RAC_CSS}</style>
      <ha-card>
        <div class="tabs" id="tabs"></div>
        <div class="stage" id="stage">
          <div class="pic" id="pic"></div>
          <video id="video" playsinline controls></video>
          <div class="ov top">
            <div class="pillrow">
              <span class="pill" id="badge"></span>
            </div>
            <div class="pillrow" id="stat"></div>
          </div>
          <div class="ov det" id="det"></div>
          <button class="bigplay" id="bigplay" title="Live starten"><ha-icon icon="mdi:play"></ha-icon></button>
          <div class="ov bottom">
            <span class="pill" id="timer"></span>
            <span class="spacer"></span>
            <button class="pill btn icon" id="stop" title="Live beenden"><ha-icon icon="mdi:stop"></ha-icon></button>
            <button class="pill btn icon" id="fs" title="Vollbild"><ha-icon icon="mdi:fullscreen"></ha-icon></button>
          </div>
        </div>
        <div class="seg">
          <button id="m-live">Live</button>
          <button id="m-play">Wiedergabe</button>
        </div>
        <div id="pane-live">
          <div class="barwrap"><div class="bar" id="ctrls"></div><div class="qmenu" id="qmenu"></div></div>
          <button class="more" id="more"><ha-icon icon="mdi:tune-variant"></ha-icon><span>Einstellungen</span><ha-icon id="chev" icon="mdi:chevron-down"></ha-icon></button>
          <div class="settings" id="settings"></div>
        </div>
        <div id="pane-play">
          <div class="days" id="days"></div>
          <div class="filters" id="filters"></div>
          <div class="tl" id="tl"><div class="tlbar" id="tlbar"></div><div class="tlh"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div></div>
          <div class="list" id="list"></div>
        </div>
      </ha-card>`;
    const $ = (id) => root.getElementById(id);
    this.$ = $;
    $('bigplay').onclick = () => { this._expired = false; this._startLive(); };
    $('stop').onclick = () => {
      if (this._playing) this._stopPlayback();
      else { this._expired = true; this._stopLive(); }
    };
    $('fs').onclick = () => this._fullscreen();
    $('m-live').onclick = () => this._setMode('live');
    $('m-play').onclick = () => this._setMode('play');
    $('more').onclick = () => { this._settingsOpen = !this._settingsOpen; this._update(); };
    this._renderTabs();
    this._renderFilters();
    this._makePic();
    if (this.isConnected) this._observe();
  }

  _rebuildCamera() {
    this._stopLive(true);
    this._stopPlayback(true);
    this._expired = false;
    this._qOpen = false;
    this._ensureQ();
    this._days = null; this._files = null; this._dayIdx = 0;
    this._renderTabs();
    if (this._canAutoLive) this._startLive();
    else this._makePic();
    if (this._mode === 'play') this._loadDays();
    this._update();
  }

  async _makePic() {
    const host = this.$('pic');
    const entity = this._st(this._qEntity(this._quality)) ? this._qEntity(this._quality) : this._cam.cam_sd;
    const cfg = {
      type: 'picture-entity', entity, show_name: false, show_state: false,
      camera_view: this._live ? 'live' : 'auto', fit_mode: 'contain',
      tap_action: { action: 'none' }, hold_action: { action: 'none' },
    };
    const token = (this._picToken = Symbol());
    const helpers = await window.loadCardHelpers();
    if (token !== this._picToken) return;
    const el = helpers.createCardElement(cfg);
    el.hass = this._hass;
    host.innerHTML = '';
    host.appendChild(el);
    this._pic = el;
  }

  /* ---------- Live ---------- */
  _startLive() {
    if (this._playing) this._stopPlayback(true);
    this._live = true;
    const t = +this._config.live_timeout || 0;
    this._liveEnds = t > 0 ? Date.now() + t * 1000 : 0;
    clearInterval(this._tick);
    if (this._liveEnds) {
      this._tick = setInterval(() => {
        if (Date.now() >= this._liveEnds) { this._expired = true; this._stopLive(); }
        else this._update();
      }, 1000);
    }
    this._makePic();
    this._update();
  }

  _stopLive(silent) {
    clearInterval(this._tick);
    if (!this._live) return;
    this._live = false;
    if (!silent) { this._makePic(); this._update(); }
  }

  _fullscreen() {
    const el = this.$('stage');
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen();
    else if (this.$('video').webkitEnterFullscreen && this._playing) this.$('video').webkitEnterFullscreen();
  }

  _setMode(m) {
    this._mode = m;
    if (m === 'play' && !this._days) this._loadDays();
    this._update();
    this._autoLive();
  }

  /* ---------- Steuerung ---------- */
  _call(domain, service, entity_id, data = {}) {
    return this._hass.callService(domain, service, { entity_id, ...data });
  }

  _controls() {
    const c = this._cam;
    const items = [];
    items.push({ id: 'talk', icon: 'mdi:microphone-outline', label: 'Sprechen (öffnet die Reolink-App)', run: () => this._talk() });
    if (this._st(c.siren)) items.push({ id: 'siren', icon: 'mdi:alarm-light-outline', label: 'Ton-Alarm', on: this._on(c.siren), warn: true,
      run: () => this._on(c.siren) ? this._call('siren', 'turn_off', c.siren)
        : (confirm(`Ton-Alarm bei „${c.name}“ auslösen?`) && this._call('siren', 'turn_on', c.siren)) });
    if (this._st(c.light)) items.push({ id: 'light', icon: 'mdi:flashlight', label: 'Spotlight', on: this._on(c.light),
      run: () => this._call('light', 'toggle', c.light) });
    if (this._st(c.manual_rec)) items.push({ id: 'rec', icon: 'mdi:video-outline', label: 'Aufnahme', on: this._on(c.manual_rec),
      run: () => this._call('switch', 'toggle', c.manual_rec) });
    items.push({ id: 'snap', icon: 'mdi:camera-outline', label: 'Schnappschuss', run: () => this._snapshot() });
    if (this._qAvail().length) items.push({ id: 'q', icon: Q[this._quality].icon, label: `Qualität: ${Q[this._quality].label}`, on: this._qOpen,
      run: () => { this._qOpen = !this._qOpen; this._update(); } });
    return items;
  }

  /* Gegensprechen: Reolink bietet keinen Deep-Link auf eine bestimmte Kamera; die App öffnet die zuletzt genutzte */
  _talk() {
    const url = this._cam.talk_url || this._config.talk_url
      || (/android/i.test(navigator.userAgent) ? REOLINK_ANDROID : null);
    if (!url) { alert('Auf diesem Gerät ist kein Link zur Reolink-App hinterlegt (Option „talk_url“).'); return; }
    this._stopLive();
    window.open(url, '_blank');
  }

  _snapshot() {
    const id = this._st(this._qEntity(this._quality)) ? this._qEntity(this._quality) : this._cam.cam_sd;
    const s = this._st(id);
    if (!s) return;
    const url = this._hass.hassUrl(`/api/camera_proxy/${id}?token=${s.attributes.access_token}`);
    const a = document.createElement('a');
    a.href = url; a.target = '_blank';
    a.download = `${this._cam.name}_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
    a.click();
  }

  _settings() {
    const c = this._cam;
    const rows = [];
    const sw = (id, label, icon) => { if (this._st(id)) rows.push({ type: 'sw', id, label, icon }); };
    sw(c.pir, 'PIR-Erkennung', 'mdi:motion-sensor');
    sw(c.rec, 'Aufzeichnung', 'mdi:sd');
    sw(c.push, 'Push-Benachrichtigungen', 'mdi:bell-ring-outline');
    if (this._st(c.daynight)) rows.push({ type: 'sel', id: c.daynight, label: 'Tag/Nacht', icon: 'mdi:theme-light-dark' });
    if (this._st(c.prealarm)) rows.push({ type: 'btn', id: c.prealarm, label: 'Voralarm', icon: 'mdi:bullhorn-outline' });
    return rows;
  }

  /* ---------- Wiedergabe (Reolink-Medienquelle) ---------- */
  _browse(id) { return this._hass.callWS({ type: 'media_source/browse_media', media_content_id: id }); }

  async _findCameraNode() {
    const root = await this._browse('media-source://reolink');
    const kids = root.children || [];
    const want = this._cam.media_name.toLowerCase();
    return kids.find((k) => k.title.toLowerCase() === want)
      || kids.find((k) => k.title.toLowerCase().includes(want) || want.includes(k.title.toLowerCase()))
      || kids[this._idx];
  }

  async _loadDays() {
    const camIdx = this._idx;
    this._days = 'loading'; this._files = null; this._update();
    try {
      const camNode = await this._findCameraNode();
      if (!camNode) throw new Error('Kamera in der Medienquelle nicht gefunden');
      let node = await this._browse(camNode.media_content_id);
      let kids = node.children || [];
      // Auflösungsebene (falls vorhanden): niedrige Auflösung bevorzugen (schneller, akkuschonend)
      if (kids.length && kids.every((k) => k.can_expand) && !kids.some((k) => this._dayOf(k))) {
        const sub = kids.find((k) => /\|sub|low|niedrig|fluent|clear/i.test(k.media_content_id + k.title)) || kids[0];
        node = await this._browse(sub.media_content_id);
        kids = node.children || [];
      }
      const days = kids.filter((k) => k.can_expand).map((k) => ({ node: k, date: this._dayOf(k) }))
        .sort((a, b) => (b.date ? b.date.getTime() : 0) - (a.date ? a.date.getTime() : 0));
      if (camIdx !== this._idx) return;
      this._days = days;
      this._dayIdx = 0;
      this._renderDays();
      if (days.length) await this._loadFiles();
      else this._update();
    } catch (e) {
      if (camIdx !== this._idx) return;
      this._days = { error: e.message || String(e) };
      this._update();
    }
  }

  _dayOf(k) {
    const m = String(k.media_content_id).match(/(\d{4})\|(\d{1,2})\|(\d{1,2})(?:\||$)/)
      || String(k.title).match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    const d = String(k.title).match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    return d ? new Date(+d[3], +d[2] - 1, +d[1]) : null;
  }

  async _loadFiles() {
    const day = this._days[this._dayIdx];
    const token = (this._filesToken = Symbol());
    this._files = 'loading'; this._renderDays(); this._update();
    try {
      const node = await this._browse(day.node.media_content_id);
      if (token !== this._filesToken) return;
      this._files = (node.children || []).filter((k) => k.can_play).map((k) => this._parseFile(k))
        .sort((a, b) => b.start - a.start);
    } catch (e) {
      if (token !== this._filesToken) return;
      this._files = { error: e.message || String(e) };
    }
    this._update();
  }

  _parseFile(k) {
    const t = String(k.title);
    const tm = t.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    const start = tm ? (+tm[1]) * 3600 + (+tm[2]) * 60 + (+tm[3]) : 0;
    const rest = tm ? t.slice(t.indexOf(tm[0]) + tm[0].length) : t;
    const dm = rest.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    const dur = dm ? (+dm[1]) * 3600 + (+dm[2]) * 60 + (+dm[3]) : 0;
    const tagText = dm ? rest.slice(rest.indexOf(dm[0]) + dm[0].length) : rest;
    const types = EVT_ORDER.filter((key) => key !== 'other' && EVT[key].re.test(tagText));
    const type = types[0] || 'other';
    return { node: k, start, dur, type, types: types.length ? types : ['other'],
      time: tm ? `${tm[1].padStart(2, '0')}:${tm[2]}:${tm[3]}` : t };
  }

  async _play(file) {
    this._stopLive(true);
    this._playing = file;
    this._update();
    const v = this.$('video');
    try {
      const r = await this._hass.callWS({ type: 'media_source/resolve_media', media_content_id: file.node.media_content_id, expires: 3600 });
      if (this._playing !== file) return;
      this._playUrl = this._hass.hassUrl(r.url);
      v.src = this._playUrl;
      v.play().catch(() => {});
    } catch (e) {
      this._playing = null;
      alert(`Aufnahme kann nicht geladen werden: ${e.message || e}`);
    }
    this._makePic();
    this._update();
  }

  _stopPlayback(silent) {
    const v = this.$ && this.$('video');
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
    if (!this._playing) return;
    this._playing = null; this._playUrl = null;
    if (!silent) { this._update(); this._autoLive(); }
  }

  /* ---------- Rendering ---------- */
  _renderTabs() {
    const box = this.$('tabs');
    box.innerHTML = '';
    this._config.cameras.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'tab';
      b.dataset.i = i;
      b.innerHTML = `<span class="dot"></span><span class="tn">${c.name}</span><span class="tb"></span>`;
      b.onclick = () => { if (i !== this._idx) { this._idx = i; this._rebuildCamera(); } };
      box.appendChild(b);
    });
  }

  _renderFilters() {
    const box = this.$('filters');
    box.innerHTML = '';
    ['all', 'person', 'vehicle', 'animal', 'motion'].forEach((k) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.dataset.k = k;
      b.innerHTML = k === 'all' ? '<span>Alle</span>' : `<ha-icon icon="${EVT[k].icon}"></ha-icon><span>${EVT[k].label}</span>`;
      b.onclick = () => { this._filter = k; this._update(); };
      box.appendChild(b);
    });
  }

  _renderDays() {
    const box = this.$('days');
    box.innerHTML = '';
    if (!Array.isArray(this._days)) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    this._days.forEach((d, i) => {
      const b = document.createElement('button');
      b.className = 'day' + (i === this._dayIdx ? ' sel' : '');
      let top = '', bot = d.node.title;
      if (d.date) {
        const diff = Math.round((today - d.date) / 864e5);
        top = diff === 0 ? 'Heute' : diff === 1 ? 'Gestern' : d.date.toLocaleDateString('de-CH', { weekday: 'short' });
        bot = d.date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
      }
      b.innerHTML = `<small>${top}</small><b>${bot}</b>`;
      b.onclick = () => { if (i !== this._dayIdx) { this._dayIdx = i; this._loadFiles(); } };
      box.appendChild(b);
    });
  }

  _update() {
    if (!this._built || !this._hass) return;
    const $ = this.$, c = this._cam;

    // Kamera-Tabs
    this.shadowRoot.querySelectorAll('.tab').forEach((b) => {
      const cam = this._config.cameras[+b.dataset.i];
      b.classList.toggle('sel', +b.dataset.i === this._idx);
      const bat = this._st(cam.battery);
      b.querySelector('.tb').textContent = bat && !isNaN(+bat.state) ? `${Math.round(+bat.state)}%` : '';
      const camSt = this._st(cam.cam_sd);
      const sleeping = this._on(cam.sleep);
      const alert = Object.values(cam.det).some((id) => this._on(id));
      b.querySelector('.dot').className = 'dot ' + (!camSt || camSt.state === 'unavailable' ? 'off' : alert ? 'alert' : sleeping ? 'sleep' : 'on');
    });

    // Status oben
    const playing = !!this._playing;
    $('stage').classList.toggle('playing', playing);
    $('stage').classList.toggle('live', this._live);
    $('badge').innerHTML = playing ? `<ha-icon icon="mdi:history"></ha-icon>${this._playing.time}`
      : this._live ? '<i class="rec"></i>LIVE' : (this._on(c.sleep) ? '<ha-icon icon="mdi:sleep"></ha-icon>Schlafmodus' : 'Pausiert');
    const bat = this._st(c.battery), wifi = this._st(c.wifi);
    let stat = '';
    if (wifi && !isNaN(+wifi.state)) stat += `<span class="pill"><ha-icon icon="mdi:wifi-strength-${Math.max(1, Math.min(4, Math.round(+wifi.state)))}"></ha-icon></span>`;
    if (bat && !isNaN(+bat.state)) {
      const v = Math.round(+bat.state), lvl = Math.max(10, Math.min(100, Math.round(v / 10) * 10));
      const charging = /charg|lade/i.test((this._st(c.battery.replace('_batterie', '_batteriestatus')) || {}).state || '');
      stat += `<span class="pill ${v <= 20 ? 'low' : ''}"><ha-icon icon="mdi:battery${charging ? '-charging' : ''}${lvl === 100 ? '' : '-' + lvl}"></ha-icon>${v}%</span>`;
    }
    $('stat').innerHTML = stat;

    // Live-Erkennung
    const active = Object.entries(c.det).filter(([, id]) => this._on(id)).map(([k]) => k);
    $('det').innerHTML = active.map((k) => `<span class="pill det" style="--c:${EVT[k].color}"><ha-icon icon="${EVT[k].icon}"></ha-icon>${EVT[k].label}</span>`).join('');

    // Timer / Buttons
    const timed = this._live && !!this._liveEnds;
    const left = timed ? Math.max(0, Math.ceil((this._liveEnds - Date.now()) / 1000)) : 0;
    $('timer').textContent = timed ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : '';
    $('timer').style.display = timed ? '' : 'none';
    $('stop').style.display = this._live || playing ? '' : 'none';
    $('bigplay').style.display = this._live || playing ? 'none' : '';

    // Modus
    $('m-live').classList.toggle('sel', this._mode === 'live');
    $('m-play').classList.toggle('sel', this._mode === 'play');
    $('pane-live').style.display = this._mode === 'live' ? '' : 'none';
    $('pane-play').style.display = this._mode === 'play' ? '' : 'none';

    if (this._mode === 'live') this._updateLivePane();
    else this._updatePlayPane();
  }

  _updateLivePane() {
    const $ = this.$;
    const ctrls = this._controls();
    const sig = ctrls.map((x) => x.id).join();
    if ($('ctrls').dataset.sig !== sig) {
      $('ctrls').dataset.sig = sig;
      $('ctrls').innerHTML = ctrls.map((x) => `<button class="tb" data-id="${x.id}"><ha-icon></ha-icon></button>`).join('');
      ctrls.forEach((x) => { $('ctrls').querySelector(`[data-id="${x.id}"]`).onclick = () => this._controls().find((y) => y.id === x.id).run(); });
    }
    ctrls.forEach((x) => {
      const b = $('ctrls').querySelector(`[data-id="${x.id}"]`);
      const icon = b.querySelector('ha-icon');
      if (icon.getAttribute('icon') !== x.icon) icon.setAttribute('icon', x.icon);
      b.title = x.label; b.setAttribute('aria-label', x.label);
      b.classList.toggle('on', !!x.on && !x.warn);
      b.classList.toggle('warn', !!x.on && !!x.warn);
    });

    // Qualitätsmenü
    const qm = $('qmenu');
    qm.classList.toggle('open', this._qOpen);
    if (this._qOpen) {
      const avail = this._qAvail();
      const qsig = `${this._idx}|${this._quality}|${avail.join()}`;
      if (qm.dataset.sig !== qsig) {
        qm.dataset.sig = qsig;
        qm.innerHTML = Q_ORDER.map((q) => `<button class="qopt${q === this._quality ? ' sel' : ''}" data-q="${q}"${avail.includes(q) ? '' : ' disabled'}>
          <ha-icon icon="${Q[q].icon}"></ha-icon><span>${Q[q].label}</span>${avail.includes(q) ? (q === this._quality ? '<ha-icon class="chk" icon="mdi:check"></ha-icon>' : '') : '<small>nicht aktiviert</small>'}</button>`).join('');
        qm.querySelectorAll('.qopt:not([disabled])').forEach((el) => { el.onclick = () => this._setQuality(el.dataset.q); });
      }
    }

    $('chev').setAttribute('icon', this._settingsOpen ? 'mdi:chevron-up' : 'mdi:chevron-down');
    const box = $('settings');
    box.style.display = this._settingsOpen ? '' : 'none';
    if (!this._settingsOpen) return;
    const rows = this._settings();
    const sig2 = this._idx + rows.map((r) => r.id).join();
    if (box.dataset.sig !== sig2) {
      box.dataset.sig = sig2;
      box.innerHTML = rows.map((r) => `<div class="row" data-id="${r.id}"><ha-icon icon="${r.icon}"></ha-icon><span class="rl">${r.label}</span>${
        r.type === 'sw' ? '<ha-switch></ha-switch>' : r.type === 'btn' ? '<button class="rowbtn">Abspielen</button>' : '<select></select>'}</div>`).join('');
      rows.forEach((r) => {
        const row = box.querySelector(`[data-id="${r.id}"]`);
        if (r.type === 'sw') row.querySelector('ha-switch').addEventListener('change', () => this._call('switch', 'toggle', r.id));
        else if (r.type === 'btn') row.querySelector('.rowbtn').onclick = () => this._call('button', 'press', r.id);
        else row.querySelector('select').onchange = (e) => this._call('select', 'select_option', r.id, { option: e.target.value });
      });
    }
    rows.forEach((r) => {
      const row = box.querySelector(`[data-id="${r.id}"]`);
      const s = this._st(r.id);
      if (r.type === 'btn') return;
      if (r.type === 'sw') row.querySelector('ha-switch').checked = s.state === 'on';
      else {
        const sel = row.querySelector('select');
        const opts = s.attributes.options || [];
        if (sel.dataset.o !== opts.join()) { sel.dataset.o = opts.join(); sel.innerHTML = opts.map((o) => `<option value="${o}">${this._hass.formatEntityState ? this._hass.formatEntityState(s, o) : o}</option>`).join(''); }
        sel.value = s.state;
      }
    });
  }

  _updatePlayPane() {
    const $ = this.$;
    this.shadowRoot.querySelectorAll('.chip').forEach((b) => b.classList.toggle('sel', b.dataset.k === this._filter));
    const list = $('list'), bar = $('tlbar');
    const msg = (t) => { list.innerHTML = `<div class="msg">${t}</div>`; bar.innerHTML = ''; };
    if (this._days === 'loading' || this._days === null) return msg('<ha-circular-progress indeterminate size="small"></ha-circular-progress> Aufnahmen werden geladen …');
    if (this._days.error) return msg(`Fehler: ${this._days.error}`);
    if (!this._days.length) return msg('Keine Aufnahmen auf der SD-Karte gefunden.');
    if (this._files === 'loading' || this._files === null) return msg('<ha-circular-progress indeterminate size="small"></ha-circular-progress> Lade Tag …');
    if (this._files.error) return msg(`Fehler: ${this._files.error}`);

    const files = this._files.filter((f) => this._filter === 'all' || f.types.includes(this._filter));
    const sig = `${this._idx}|${this._dayIdx}|${this._filter}|${files.length}|${this._playing ? this._playing.node.media_content_id : ''}`;
    if (list.dataset.sig === sig) return;
    list.dataset.sig = sig;

    bar.innerHTML = files.map((f, i) => {
      const left = (f.start / 864) .toFixed(3);
      const w = Math.max(0.35, (f.dur / 864)).toFixed(3);
      return `<i data-i="${i}" style="left:${left}%;width:${w}%;background:${EVT[f.type].color}"></i>`;
    }).join('');
    bar.querySelectorAll('i').forEach((el) => { el.onclick = () => this._play(files[+el.dataset.i]); });

    if (!files.length) { list.innerHTML = '<div class="msg">Keine Ereignisse für diesen Filter.</div>'; return; }
    list.innerHTML = files.map((f, i) => {
      const e = EVT[f.type];
      const sel = this._playing && this._playing.node.media_content_id === f.node.media_content_id;
      const d = f.dur ? `${Math.floor(f.dur / 60)}:${String(f.dur % 60).padStart(2, '0')}` : '';
      return `<button class="item${sel ? ' sel' : ''}" data-i="${i}">
        <span class="ei" style="--c:${e.color}"><ha-icon icon="${e.icon}"></ha-icon></span>
        <span class="et"><b>${f.time}</b><small>${f.types.map((t) => EVT[t].label).join(' · ')}</small></span>
        <span class="ed">${d}</span>
        <ha-icon class="ep" icon="${sel ? 'mdi:play-circle' : 'mdi:play-circle-outline'}"></ha-icon></button>`;
    }).join('');
    list.querySelectorAll('.item').forEach((el) => { el.onclick = () => this._play(files[+el.dataset.i]); });
  }

  disconnectedCallback() {
    clearInterval(this._tick);
    if (this._io) this._io.disconnect();
    if (this._onVis) { document.removeEventListener('visibilitychange', this._onVis); this._onVis = null; }
    this._visible = false;
    this._stopLive(true);
  }
}

const RAC_CSS = `
:host { --ra: var(--reolink-accent, #1e8bff); --rb: var(--ha-card-background, var(--card-background-color)); }
ha-card { overflow: hidden; padding-bottom: 8px; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.tabs { display: flex; gap: 6px; padding: 10px 10px 8px; overflow-x: auto; scrollbar-width: none; }
.tab { display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 18px; background: var(--secondary-background-color); white-space: nowrap; font-size: 14px; }
.tab.sel { background: var(--ra); color: #fff; }
.tab .tb { opacity: .75; font-size: 12px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #3ccf8e; flex: none; }
.dot.sleep { background: #9aa4b2; } .dot.off { background: #555; } .dot.alert { background: #ff5b5b; animation: pulse 1s infinite; }
.stage { position: relative; background: #000; aspect-ratio: 16/9; overflow: hidden; border-radius: 0;
  /* Eckige Kamerabild-Fläche: Variablen wirken bis in die eingebettete Bildkarte (Shadow DOM) */
  --ha-card-border-radius: 0px; --ha-card-border-width: 0px; --ha-card-box-shadow: none; }
.stage video, .stage img { border-radius: 0; }
.stage:fullscreen { aspect-ratio: auto; }
.pic, .pic > * { position: absolute; inset: 0; }
.pic ha-card, .pic hui-picture-entity-card { height: 100%; border-radius: 0; border: 0; box-shadow: none; background: #000; }
video { position: absolute; inset: 0; width: 100%; height: 100%; background: #000; display: none; }
.stage.playing video { display: block; } .stage.playing .pic { display: none; }
.ov { position: absolute; left: 8px; right: 8px; display: flex; gap: 6px; align-items: center; pointer-events: none; }
.ov > *, .ov .pillrow > * { pointer-events: auto; }
.ov.top { top: 8px; justify-content: space-between; }
.ov.det { top: 42px; flex-wrap: wrap; }
.ov.bottom { bottom: 8px; }
.spacer { flex: 1; }
.pillrow { display: flex; gap: 6px; }
.pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 12px; background: rgba(0,0,0,.55); color: #fff; font-size: 12px; font-weight: 600; backdrop-filter: blur(4px); }
.pill ha-icon { --mdc-icon-size: 16px; }
.pill.low { color: #ff8a80; }
.pill.btn.icon { padding: 5px; } .pill.btn.icon ha-icon { --mdc-icon-size: 20px; }
.pill.det { background: var(--c); }
.stage.playing video ~ .ov.bottom { bottom: 56px; }
.rec { width: 8px; height: 8px; border-radius: 50%; background: #ff3b30; animation: pulse 1.2s infinite; }
@keyframes pulse { 50% { opacity: .3; } }
.bigplay { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 64px; height: 64px; border-radius: 50%; background: rgba(0,0,0,.5); color: #fff; display: grid; place-items: center; backdrop-filter: blur(4px); }
.bigplay ha-icon { --mdc-icon-size: 38px; }
.seg { display: flex; margin: 10px 10px 4px; padding: 3px; border-radius: 10px; background: var(--secondary-background-color); }
.seg button { flex: 1; padding: 7px; border-radius: 8px; font-weight: 600; font-size: 14px; opacity: .7; }
.seg button.sel { background: var(--rb); opacity: 1; color: var(--ra); box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.barwrap { position: relative; padding: 10px 10px 4px; }
.bar { display: flex; justify-content: space-around; align-items: center; gap: 2px; padding: 8px 10px; border-radius: 30px; background: #1f1f21; border: 1px solid rgba(255,255,255,.08); }
.tb { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; color: #f2f2f2; transition: background .2s, color .2s; }
.tb ha-icon { --mdc-icon-size: 24px; }
.tb.on { background: var(--ra); color: #fff; }
.tb.warn { background: #ff3b30; color: #fff; }
.qmenu { position: absolute; right: 14px; bottom: calc(100% - 4px); min-width: 190px; padding: 6px; border-radius: 14px; background: #1f1f21; color: #f2f2f2; box-shadow: 0 8px 24px rgba(0,0,0,.4); z-index: 5; display: none; }
.qmenu.open { display: block; }
.qopt { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px; border-radius: 10px; font-size: 14px; text-align: left; }
.qopt ha-icon { --mdc-icon-size: 20px; }
.qopt.sel { color: var(--ra); }
.qopt .chk { margin-left: auto; }
.qopt[disabled] { opacity: .45; cursor: default; }
.qopt small { margin-left: auto; font-size: 11px; }
.rowbtn { padding: 6px 12px; border-radius: 8px; background: var(--secondary-background-color); font-size: 13px; }
.more { display: flex; align-items: center; gap: 8px; width: calc(100% - 20px); margin: 6px 10px 0; padding: 8px 4px; border-top: 1px solid var(--divider-color); font-size: 14px; }
.more span { flex: 1; text-align: left; }
.more ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }
.settings { padding: 0 10px; }
.row { display: flex; align-items: center; gap: 12px; padding: 8px 4px; }
.row ha-icon { color: var(--secondary-text-color); --mdc-icon-size: 20px; }
.rl { flex: 1; font-size: 14px; }
.row select { background: var(--secondary-background-color); color: inherit; border: 0; border-radius: 8px; padding: 6px 8px; font: inherit; font-size: 13px; }
.days, .filters { display: flex; gap: 6px; overflow-x: auto; padding: 8px 10px 2px; scrollbar-width: none; }
.day { display: flex; flex-direction: column; align-items: center; min-width: 56px; padding: 6px 8px; border-radius: 10px; background: var(--secondary-background-color); }
.day small { font-size: 11px; opacity: .7; } .day b { font-size: 13px; }
.day.sel { background: var(--ra); color: #fff; }
.chip { display: inline-flex; align-items: center; gap: 4px; padding: 5px 11px; border-radius: 15px; border: 1px solid var(--divider-color); font-size: 13px; white-space: nowrap; }
.chip ha-icon { --mdc-icon-size: 16px; }
.chip.sel { background: var(--ra); border-color: var(--ra); color: #fff; }
.tl { padding: 12px 12px 2px; }
.tlbar { position: relative; height: 22px; border-radius: 6px; background: var(--secondary-background-color); overflow: hidden; }
.tlbar i { position: absolute; top: 3px; bottom: 3px; min-width: 3px; border-radius: 2px; cursor: pointer; }
.tlh { display: flex; justify-content: space-between; font-size: 10px; color: var(--secondary-text-color); padding-top: 2px; }
.list { padding: 4px 6px 0; max-height: 420px; overflow-y: auto; }
.item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 8px 6px; border-radius: 10px; text-align: left; }
.item.sel { background: var(--secondary-background-color); }
.ei { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; background: color-mix(in srgb, var(--c) 18%, transparent); color: var(--c); flex: none; }
.et { flex: 1; display: flex; flex-direction: column; } .et small { color: var(--secondary-text-color); font-size: 12px; }
.ed { font-size: 12px; color: var(--secondary-text-color); }
.ep { color: var(--ra); }
.msg { display: flex; gap: 8px; align-items: center; justify-content: center; padding: 18px; color: var(--secondary-text-color); font-size: 14px; }
`;

if (!customElements.get('reolink-app-card')) customElements.define('reolink-app-card', ReolinkAppCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'reolink-app-card')) {
  window.customCards.push({ type: 'reolink-app-card', name: 'Reolink App Card', description: 'Live, Steuerung und Wiedergabe im Stil der Reolink-App' });
}
console.info(`%c REOLINK-APP-CARD %c ${RAC_VERSION} `, 'background:#1e8bff;color:#fff', '');
