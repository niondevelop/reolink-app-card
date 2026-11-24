/* Wiedergabe der SD-Karten-Aufnahmen – Methoden der Klasse ReolinkAppCard */
import { DET, EVT, EVT_ORDER, PANEL_STORE, PLAY_Q_STORE, SPEEDS } from '../constants.js';
import { LOCALES } from '../i18n.js';
import { esc } from '../util.js';

export default {
  /* Passende Aufnahme zum Zeitpunkt der Meldung suchen und abspielen */
  _pickEvent() {
    const t = this._pendingEvent;
    if (!t || !Array.isArray(this._files) || !Array.isArray(this._days)) return;
    const day = this._days[this._dayIdx], when = new Date(t * 1000);
    const sameDay = day && day.date && day.date.toDateString() === when.toDateString();
    const sec = when.getHours() * 3600 + when.getMinutes() * 60 + when.getSeconds();
    let best = sameDay ? this._files.find((f) => f.start <= sec + 10 && f.start + Math.max(f.dur, 30) >= sec - 10) : null;
    // Sonst: Aufnahme, die kurz vor oder bis 2 Minuten nach der Meldung beginnt
    if (!best && sameDay) best = this._files.filter((f) => f.start >= sec - 60 && f.start <= sec + 120).sort((x, y) => Math.abs(x.start - sec) - Math.abs(y.start - sec))[0];
    // Nach mehreren Versuchen oder bei älteren Meldungen: nächstgelegene Aufnahme innerhalb von 10 Minuten
    const recent = Date.now() / 1000 - t < 300 && (this._eventTries || 0) < 3;
    if (!best && sameDay && !recent) {
      const near = this._files.map((f) => ({ f, d: Math.abs(f.start - sec) })).sort((x, y) => x.d - y.d)[0];
      if (near && near.d <= 600) best = near.f;
    }
    if (best) { this._pendingEvent = null; this._filter = 'all'; this._play(best); return; }
    // Kurz nach der Meldung nimmt die Kamera oft noch auf – etwas später nochmals nachsehen
    if (recent) {
      this._eventTries = (this._eventTries || 0) + 1;
      this._toast({ text: this._t('ev_wait'), color: '#636366', icon: 'mdi:timer-sand', wrap: true });
      clearTimeout(this._eventT);
      this._eventT = setTimeout(async () => {
        if (!this._pendingEvent || !this._eventsShown()) return;
        await this._loadDays();
      }, 15000);
      return;
    }
    this._pendingEvent = null;
    this._toast({ text: this._t('ev_missing'), color: '#636366', icon: 'mdi:filmstrip-off', wrap: true });
  },

  /* Aufnahmen sichtbar: Wiedergabe-Reiter oder Ereignisse in der Seitenleiste */
  _eventsShown() { return this._mode === 'play' || (!!this._side && this._panelNow() === 'events'); },

  /* Inhalt der Seitenleiste; ohne Aufnahmen gibt es keine Ereignisse, dann bleibt sie zu */
  _panelNow() {
    const p = this._panel || 'events';
    if (p === 'events' && !this._hasPlayback()) return 'none';
    // Ohne Einstellungen (z. B. Kamera eines anderen Herstellers): Ereignisse, sonst zugeklappt
    if (p === 'settings' && !this._hasSettings()) return this._hasPlayback() ? 'events' : 'none';
    return p;
  },

  _setPanel(p) {
    this._panel = p;
    try { localStorage.setItem(PANEL_STORE, p); } catch (_) { /* privater Modus o. ä. */ }
    this._update();
  },

  /* ---------- Wiedergabe (Reolink-Medienquelle) ---------- */
  _browse(id) { return this._hass.callWS({ type: 'media_source/browse_media', media_content_id: id }); },

  /* Eintrag einer Kamera in der Reolink-Medienquelle: über das Gerät (das Vorschaubild verweist auf die Kamera-Entität),
     sonst über den Namen. Kameras mit zwei Objektiven erscheinen als „Name lens 0“ und „Name lens 1“. */
  _mediaNodeOf(kids, cam = this._cam, lens = 0) {
    const reg = (this._hass && this._hass.entities) || {};
    this._devIndex(cam);
    const lensRe = / lens (\d)$/i;
    const t = (k) => String(k.title || '').toLowerCase();
    const pickLens = (list) => list.find((k) => (t(k).match(lensRe) || [0, '0'])[1] === String(lens)) || (lens === 0 ? list[0] : null);
    const devOf = (k) => { const m = String(k.thumbnail || '').match(/camera_proxy\/(camera\.[^?/]+)/); return m && reg[m[1]] && reg[m[1]].device_id; };
    const byDev = cam._devId ? kids.filter((k) => devOf(k) === cam._devId) : [];
    if (byDev.length) return pickLens(byDev);
    const want = String(cam.media_name || '').toLowerCase();
    const named = kids.filter((k) => t(k) === want || t(k).replace(lensRe, '') === want);
    if (named.length) return pickLens(named);
    if (lens) return null;
    return kids.find((k) => t(k).includes(want) || want.includes(t(k))) || null;
  },

  async _findCameraNode(lens = 0) {
    const root = await this._browse('media-source://reolink');
    this._mediaKids = root.children || [];
    return this._mediaNodeOf(this._mediaKids, this._cam, lens);
  },

  /* Einmal nachsehen, welche Kameras Home Assistant mit Aufnahmen anbietet (weckt keine Kamera) */
  async _loadMediaRoot() {
    try {
      const root = await this._browse('media-source://reolink');
      this._mediaKids = root.children || [];
    } catch (_) {
      this._mediaKids = null; // unbekannt: Wiedergabe wie bisher anbieten
    }
    this._update();
  },

  /* Hat die Kamera Aufnahmen in Home Assistant? Direkt eingebundene Klingeln z. B. erscheinen nicht in der Reolink-Medienquelle */
  _hasPlayback(cam = this._cam) {
    if (this._config.playback === false || cam.playback === false || this._foreign(cam)) return false;
    if (!Array.isArray(this._mediaKids)) return true;
    return !!this._mediaNodeOf(this._mediaKids, cam);
  },

  /* Auflösungsebene der Reolink-Medienquelle: „Low resolution“ (…|sub) und „High resolution“ (…|main) */
  _resNodes(kids) {
    const txt = (k) => `${k.media_content_id} ${k.title}`;
    const plain = kids.filter((k) => !/autotrack|telephoto/i.test(txt(k)));
    return {
      low: plain.find((k) => /\|sub(\||$)|low|niedrig|basse|fluent/i.test(txt(k))) || null,
      high: plain.find((k) => /\|main(\||$)|high|hoch|haute|clear/i.test(txt(k))) || null,
      // Tele der TrackMix an Hub/NVR: eigener Ordner „Telephoto low resolution“ (…|autotrack_sub)
      tele: kids.find((k) => /\|autotrack_sub(\||$)|telephoto low/i.test(txt(k))) || null,
      teleHigh: kids.find((k) => /\|autotrack_main(\||$)|telephoto high/i.test(txt(k))) || null,
    };
  },

  /* Niedrige oder hohe Auflösung wählen, dauerhaft auf diesem Gerät merken.
     Tag und laufender Clip (samt Stelle) bleiben erhalten. */
  async _setPlayQ(q) {
    if (!['low', 'high', 'tele'].includes(q)) return;
    try { localStorage.setItem(PLAY_Q_STORE, q); } catch (_) { /* privater Modus o. ä. */ }
    if (q === this._playQ) return;
    this._playQ = q;
    const day = Array.isArray(this._days) && this._days[this._dayIdx] ? this._days[this._dayIdx].date : null;
    const v = this._vid();
    const resume = this._playing ? { start: this._playing.start, at: v.currentTime || 0 } : null;
    if (!this._eventsShown()) { this._days = null; this._update(); return; }
    await this._loadDays({ day, resume });
  },

  async _loadDays(opts = {}) {
    const camIdx = this._idx;
    this._days = 'loading'; this._files = null; this._update();
    try {
      const camNode = await this._findCameraNode();
      if (!camNode) throw new Error(this._t('cam_not_found'));
      // Direkt eingebundene TrackMix/Duo: zweites Objektiv als eigener Eintrag „Name lens 1“
      const lens1 = this._mediaNodeOf(this._mediaKids || [], this._cam, 1);
      // Kachel für ein weiteres Objektiv (lens: 1): immer dessen Aufnahmen, ohne Umschalter zum anderen Objektiv
      const own = this._cam.lens ? this._mediaNodeOf(this._mediaKids || [], this._cam, this._cam.lens) : null;
      // TrackMix an Hub/NVR: kein eigener Eintrag fürs 2. Objektiv, sondern ein Tele-Ordner unter der Kamera
      const teleOwn = !own && this._cam.lens === 1;
      const useLens1 = !own && !teleOwn && !this._lensSplit(this._cam) && this._playQ === 'tele' && lens1;
      let node = await this._browse((own || (useLens1 ? lens1 : camNode)).media_content_id);
      let kids = node.children || [];
      // Auflösungsebene (falls vorhanden): gewählte Auflösung, sonst die andere
      let res = null;
      if (kids.length && kids.every((k) => k.can_expand) && !kids.some((k) => this._dayOf(k))) {
        res = this._resNodes(kids);
        if (teleOwn) {
          // Nur die Tele-Ordner zur Wahl; ohne Tele-Ordner keine (falschen) Aufnahmen des anderen Objektivs
          if (!res.tele) throw new Error(this._t('cam_not_found'));
          res = { low: res.tele, high: res.teleHigh || null, tele: null };
        } else if (own || this._lensSplit(this._cam)) { res.tele = null; res.teleFolder = false; } else if (lens1) res.tele = lens1; else if (res.tele) res.teleFolder = true;
        const pick = useLens1 ? (res.low || res.high || kids[0]) : (this._playQ !== 'tele' && res[this._playQ]) || (this._playQ === 'tele' && res.tele) || res.low || res.high || kids[0];
        res.used = useLens1 || pick === res.tele ? 'tele' : pick === res.high ? 'high' : 'low';
        node = await this._browse(pick.media_content_id);
        kids = node.children || [];
      }
      if (camIdx !== this._idx) return;
      this._res = res;
      const days = kids.filter((k) => k.can_expand).map((k) => ({ node: k, date: this._dayOf(k) }))
        .sort((a, b) => (b.date ? b.date.getTime() : 0) - (a.date ? a.date.getTime() : 0));
      if (camIdx !== this._idx) return;
      this._days = days;
      this._dayIdx = 0;
      if (opts.day) {
        const k = days.findIndex((d) => d.date && d.date.toDateString() === opts.day.toDateString());
        if (k >= 0) this._dayIdx = k;
      }
      if (this._pendingEvent) {
        const want = new Date(this._pendingEvent * 1000).toDateString();
        const k = days.findIndex((d) => d.date && d.date.toDateString() === want);
        if (k >= 0) this._dayIdx = k;
      }
      this._renderDays();
      if (days.length) await this._loadFiles();
      else this._update();
      if (opts.resume && camIdx === this._idx) this._resumeClip(opts.resume);
      if (this._pendingEvent && camIdx === this._idx) this._pickEvent();
    } catch (e) {
      if (camIdx !== this._idx) return;
      this._days = { error: e.message || String(e) };
      this._update();
    }
  },

  /* Nach dem Wechsel der Auflösung denselben Clip an derselben Stelle weiterspielen */
  _resumeClip({ start, at }) {
    const f = Array.isArray(this._files) && this._files.find((x) => x.start === start);
    if (!f) { this._stopPlayback(); return; }
    this._play(f).then(() => {
      const v = this._vid();
      if (!v || !(at > 0)) return;
      const seek = () => { v.removeEventListener('loadedmetadata', seek); try { v.currentTime = at; } catch (_) { /* ignorieren */ } };
      if (v.readyState >= 1) seek(); else v.addEventListener('loadedmetadata', seek);
    });
  },

  _dayOf(k) {
    const m = String(k.media_content_id).match(/(\d{4})\|(\d{1,2})\|(\d{1,2})(?:\||$)/)
      || String(k.title).match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    const d = String(k.title).match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    return d ? new Date(+d[3], +d[2] - 1, +d[1]) : null;
  },

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
  },

  _parseFile(k) {
    const t = String(k.title);
    const tm = t.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    const start = tm ? (+tm[1]) * 3600 + (+tm[2]) * 60 + (+tm[3]) : 0;
    const rest = tm ? t.slice(t.indexOf(tm[0]) + tm[0].length) : t;
    const dm = rest.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    const dur = dm ? (+dm[1]) * 3600 + (+dm[2]) * 60 + (+dm[3]) : 0;
    const tagText = dm ? rest.slice(rest.indexOf(dm[0]) + dm[0].length) : rest;
    const types = EVT_ORDER.filter((key) => key !== 'other' && EVT[key].re.test(tagText));
    return { node: k, start, dur, type: types[0] || 'other', types: types.length ? types : ['other'],
      time: tm ? `${tm[1].padStart(2, '0')}:${tm[2]}:${tm[3]}` : t };
  },

  get _visibleFiles() {
    return Array.isArray(this._files) ? this._files.filter((f) => this._filter === 'all' || f.types.includes(this._filter)) : [];
  },

  /* Aktives Videoelement: eigenes <video> oder das im HLS-Player von Home Assistant */
  _vid() {
    const inner = this._hls && this._hls.shadowRoot && this._hls.shadowRoot.querySelector('video');
    return inner || this.$('video');
  },

  /* Clips als HLS-Stream (z. B. von direkt eingebundenen Kameras ohne MP4-Dateien): Browser ohne eigenes HLS
     (Chrome, Firefox) spielen sie mit dem HLS-Player von Home Assistant ab */
  _needsHlsPlayer(r) {
    const hls = /mpegurl/i.test(r.mime_type || '') || /\.m3u8(\?|$)/i.test(r.url || '');
    return hls && !this.$('video').canPlayType('application/vnd.apple.mpegurl');
  },

  async _hlsPlayerReady() {
    if (customElements.get('ha-hls-player')) return true;
    try {
      // Der HLS-Player gehört zum Kamera-Stream von Home Assistant; die Livebild-Karte lädt ihn nach
      const helpers = await window.loadCardHelpers();
      helpers.createCardElement({ type: 'picture-entity', entity: this._e('cam_sd') || this._cam.entity || 'camera.none', camera_view: 'live' });
    } catch (_) { /* ignorieren */ }
    return Promise.race([customElements.whenDefined('ha-hls-player').then(() => true), new Promise((r) => setTimeout(() => r(false), 8000))]);
  },

  async _playHls(url, file) {
    if (!(await this._hlsPlayerReady())) throw new Error('HLS');
    if (this._playing !== file) return;
    this._removeHls();
    this.$('video').removeAttribute('src');
    const el = document.createElement('ha-hls-player');
    el.className = 'hls';
    el.hass = this._hass;
    el.controls = true; el.autoPlay = true; el.playsInline = true;
    el.fitMode = 'contain';
    el.url = url;
    this.$('media').appendChild(el);
    this._hls = el;
    this.$('stage').classList.add('hls');
    if (el.updateComplete) await el.updateComplete;
    const v = this._vid();
    if (v && v !== this.$('video')) {
      v.playbackRate = this._speed;
      v.addEventListener('loadedmetadata', () => { v.playbackRate = this._speed; });
      v.addEventListener('ended', () => { if (this._config.autoplay_next) this._playNext(true); });
      v.addEventListener('timeupdate', () => this._updatePlayhead());
    }
  },

  _removeHls() {
    if (this._hls) { this._hls.remove(); this._hls = null; }
    if (this.$) this.$('stage').classList.remove('hls');
  },

  async _play(file) {
    this._stopLive(true);
    this._resetZoom();
    this._playing = file;
    this._update();
    try {
      const r = await this._hass.callWS({ type: 'media_source/resolve_media', media_content_id: file.node.media_content_id, expires: 3600 });
      if (this._playing !== file) return;
      this._playUrl = this._hass.hassUrl(r.url);
      if (this._needsHlsPlayer(r)) {
        await this._playHls(this._playUrl, file);
      } else {
        this._removeHls();
        const v = this.$('video');
        v.src = this._playUrl;
        v.playbackRate = this._speed;
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      }
    } catch (e) {
      this._playing = null;
      this._toast({ text: `${this._t('play_error')}: ${e.message || e}`, color: '#636366', icon: 'mdi:alert-circle-outline', wrap: true });
    }
    this._update();
  },

  /* Laufende Stelle auf der Zeitleiste */
  _updatePlayhead() {
    const ph = this.$ && this.$('ph');
    if (!ph) return;
    const f = this._playing, v = this._vid();
    if (!f) { ph.style.display = 'none'; return; }
    ph.style.display = '';
    ph.style.left = `${(((f.start + ((v && v.currentTime) || 0)) / 864)).toFixed(3)}%`;
  },

  /* Zeitlich späterer Clip (die Liste ist absteigend sortiert, „nächster Clip“ ist der ältere) */
  _playNewer() {
    const files = this._visibleFiles;
    const i = files.findIndex((f) => this._playing && f.node.media_content_id === this._playing.node.media_content_id);
    if (i > 0) this._play(files[i - 1]);
  },

  /* Tastenkürzel in der Wiedergabe: Leertaste Pause/Weiter, ←/→ vorheriger/nächster Clip, Umschalt+←/→ 10 Sekunden */
  _playbackKey(e) {
    if (!this._eventsShown() || e.altKey || e.ctrlKey || e.metaKey) return;
    const tgt = e.composedPath()[0];
    if (tgt && /^(INPUT|TEXTAREA|SELECT)$/.test(tgt.tagName)) return;
    const v = this._vid();
    if (e.key === ' ' || e.key === 'k') {
      if (tgt && tgt.tagName === 'BUTTON' && e.key === ' ') return;
      if (!this._playing) { const f = this._visibleFiles[0]; if (f) this._play(f); } else if (v.paused) v.play().catch(() => {}); else v.pause();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      if (!this._playing) return;
      if (e.shiftKey) v.currentTime = Math.max(0, v.currentTime + (e.key === 'ArrowRight' ? 10 : -10));
      else if (e.key === 'ArrowRight') this._playNewer(); else this._playNext();
    } else return;
    e.preventDefault();
  },

  _playNext(auto) {
    const files = this._visibleFiles;
    const i = files.findIndex((f) => this._playing && f.node.media_content_id === this._playing.node.media_content_id);
    if (i >= 0 && i + 1 < files.length) this._play(files[i + 1]);
    else if (auto) this._stopPlayback();
  },

  _cycleSpeed() {
    this._speed = SPEEDS[(SPEEDS.indexOf(this._speed) + 1) % SPEEDS.length];
    this._vid().playbackRate = this._speed;
    this._update();
  },

  _download() {
    if (!this._playUrl || !this._playing) return;
    const day = this._days && this._days[this._dayIdx] && this._days[this._dayIdx].date;
    const d = day ? `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}` : '';
    this._openLink(this._playUrl, `${this._cam.name}_${d}_${this._playing.time.replace(/:/g, '-')}.mp4`);
  },

  _stopPlayback(silent) {
    const v = this.$ && this._vid();
    if (v) { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (_) { /* ignorieren */ } }
    this._removeHls();
    if (!this._playing) return;
    this._playing = null; this._playUrl = null;
    if (!silent) { this._update(); this._autoLive(); }
  },

  /* Filter-Chips: Person, Fahrzeug, Tier, Bewegung immer; seltenere Typen (Klingeln, Paket …) nur, wenn sie am Tag vorkommen */
  _renderFilters() {
    const box = this.$('filters');
    const seen = new Set(Array.isArray(this._files) ? this._files.flatMap((f) => f.types) : []);
    const keys = ['all', ...EVT_ORDER.filter((k) => k !== 'other' && (DET.includes(k) || seen.has(k) || this._filter === k))];
    const sig = `${keys.join()}|${this._lang}`;
    if (box.dataset.sig === sig) return;
    box.dataset.sig = sig;
    box.innerHTML = '';
    keys.forEach((k) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.dataset.k = k;
      b.innerHTML = k === 'all' ? `<span>${this._t('all')}</span>` : `<ha-icon icon="${EVT[k].icon}"></ha-icon><span>${this._t(`evt_${k}`)}</span>`;
      b.onclick = () => { this._filter = k; this._update(); };
      box.appendChild(b);
    });
  },

  _renderDays() {
    const box = this.$('days');
    box.innerHTML = '';
    if (!Array.isArray(this._days)) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const loc = LOCALES[this._lang];
    this._days.forEach((d, i) => {
      const b = document.createElement('button');
      b.className = 'day' + (i === this._dayIdx ? ' sel' : '');
      let top = '', bot = d.node.title;
      if (d.date) {
        const diff = Math.round((today - d.date) / 864e5);
        top = diff === 0 ? this._t('today') : diff === 1 ? this._t('yesterday') : d.date.toLocaleDateString(loc, { weekday: 'short' });
        bot = d.date.toLocaleDateString(loc, { day: '2-digit', month: '2-digit' });
      }
      b.innerHTML = `<small>${esc(top)}</small><b>${esc(bot)}</b>`;
      b.onclick = () => { if (i !== this._dayIdx) { this._dayIdx = i; this._loadFiles(); } };
      box.appendChild(b);
    });
  },

  _updatePlayPane() {
    const $ = this.$;
    // Umschalter Niedrig/Hoch(/Tele) nur, wenn es etwas zu wählen gibt
    const r = this._res || {};
    const avail = { low: !!r.low, high: !!r.high, tele: !!r.tele };
    const show = Object.values(avail).filter(Boolean).length > 1;
    $('pqrow').style.display = show ? '' : 'none';
    if (show) {
      $('pq-l').textContent = this._t('play_res');
      $('pq').querySelectorAll('button').forEach((b) => {
        b.style.display = avail[b.dataset.q] ? '' : 'none';
        // „Telephoto“-Ordner gibt es nur bei der TrackMix, sonst richtet sich der Name nach dem Modell (Tele / 2. Objektiv)
        b.textContent = b.dataset.q === 'tele' ? (r.teleFolder ? this._t('q_tele') : this._qLabel('tele')) : this._t(`play_res_${b.dataset.q}`);
        b.classList.toggle('sel', b.dataset.q === r.used);
      });
    }
    this._renderFilters();
    this.shadowRoot.querySelectorAll('.chip').forEach((b) => b.classList.toggle('sel', b.dataset.k === this._filter));
    const list = $('list'), bar = $('tlbar');
    const msg = (t) => { list.dataset.sig = ''; list.innerHTML = `<div class="msg">${t}</div>`; bar.innerHTML = ''; };
    const spin = '<ha-circular-progress indeterminate size="small"></ha-circular-progress>';
    if (this._days === 'loading' || this._days === null) return msg(`${spin} ${this._t('loading')}`);
    if (this._days.error) return msg(`${this._t('error')}: ${esc(this._days.error)}`);
    if (!this._days.length) return msg(this._t('no_rec'));
    if (this._files === 'loading' || this._files === null) return msg(`${spin} ${this._t('loading_day')}`);
    if (this._files.error) return msg(`${this._t('error')}: ${esc(this._files.error)}`);

    const files = this._visibleFiles;
    const sig = `${this._idx}|${this._dayIdx}|${this._filter}|${files.length}|${this._playing ? this._playing.node.media_content_id : ''}|${this._lang}`;
    if (list.dataset.sig === sig) return;
    list.dataset.sig = sig;

    const cur = this._playing && this._playing.node.media_content_id;
    bar.innerHTML = files.map((f, i) => {
      const l = (f.start / 864).toFixed(3);
      const w = Math.max(0.35, f.dur / 864).toFixed(3);
      return `<i data-i="${i}" class="${f.node.media_content_id === cur ? 'cur' : ''}" style="left:${l}%;width:${w}%;background:${EVT[f.type].color}"></i>`;
    }).join('') + '<b class="ph" id="ph"></b>';
    bar.querySelectorAll('i').forEach((el) => { el.onclick = (e) => { e.stopPropagation(); this._play(files[+el.dataset.i]); }; });
    // Tippen auf eine leere Stelle: der nächste Clip ab dieser Uhrzeit (sonst der letzte davor)
    bar.onclick = (e) => {
      const r = bar.getBoundingClientRect();
      const t = ((e.clientX - r.left) / r.width) * 86400;
      const byTime = [...files].sort((a, b) => a.start - b.start);
      const f = byTime.find((x) => x.start + x.dur >= t) || byTime[byTime.length - 1];
      if (f) this._play(f);
    };
    this._updatePlayhead();

    if (!files.length) { list.innerHTML = `<div class="msg">${this._t('no_filter')}</div>`; return; }
    list.innerHTML = files.map((f, i) => {
      const e = EVT[f.type];
      const sel = this._playing && this._playing.node.media_content_id === f.node.media_content_id;
      const d = f.dur ? `${Math.floor(f.dur / 60)}:${String(f.dur % 60).padStart(2, '0')}` : '';
      return `<button class="item${sel ? ' sel' : ''}" data-i="${i}">
        <span class="ei" style="--c:${e.color}"><ha-icon icon="${e.icon}"></ha-icon></span>
        <span class="et"><b>${esc(f.time)}</b><small>${f.types.map((t) => this._t(`evt_${t}`)).join(' · ')}</small></span>
        <span class="ed">${d}</span>
        <ha-icon class="ep" icon="${sel ? 'mdi:play-circle' : 'mdi:play-circle-outline'}"></ha-icon></button>`;
    }).join('');
    list.querySelectorAll('.item').forEach((el) => { el.onclick = () => this._play(files[+el.dataset.i]); });
  },
};
