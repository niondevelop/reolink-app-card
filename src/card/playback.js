/* Wiedergabe der SD-Karten-Aufnahmen – Methoden der Klasse ReolinkAppCard */
import { DET, EVT, EVT_ORDER, PLAY_Q_STORE, SPEEDS } from '../constants.js';
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
        if (!this._pendingEvent || this._mode !== 'play') return;
        await this._loadDays();
      }, 15000);
      return;
    }
    this._pendingEvent = null;
    this._toast({ text: this._t('ev_missing'), color: '#636366', icon: 'mdi:filmstrip-off', wrap: true });
  },

  /* ---------- Wiedergabe (Reolink-Medienquelle) ---------- */
  _browse(id) { return this._hass.callWS({ type: 'media_source/browse_media', media_content_id: id }); },

  async _findCameraNode() {
    const root = await this._browse('media-source://reolink');
    const kids = root.children || [];
    const want = this._cam.media_name.toLowerCase();
    return kids.find((k) => k.title.toLowerCase() === want)
      || kids.find((k) => k.title.toLowerCase().includes(want) || want.includes(k.title.toLowerCase()))
      || kids[this._idx];
  },

  /* Auflösungsebene der Reolink-Medienquelle: „Low resolution“ (…|sub) und „High resolution“ (…|main) */
  _resNodes(kids) {
    const txt = (k) => `${k.media_content_id} ${k.title}`;
    const plain = kids.filter((k) => !/autotrack/i.test(txt(k)));
    return {
      low: plain.find((k) => /\|sub(\||$)|low|niedrig|basse|fluent/i.test(txt(k))) || null,
      high: plain.find((k) => /\|main(\||$)|high|hoch|haute|clear/i.test(txt(k))) || null,
    };
  },

  /* Niedrige oder hohe Auflösung wählen, dauerhaft auf diesem Gerät merken.
     Tag und laufender Clip (samt Stelle) bleiben erhalten. */
  async _setPlayQ(q) {
    if (q !== 'low' && q !== 'high') return;
    try { localStorage.setItem(PLAY_Q_STORE, q); } catch (_) { /* privater Modus o. ä. */ }
    if (q === this._playQ) return;
    this._playQ = q;
    const day = Array.isArray(this._days) && this._days[this._dayIdx] ? this._days[this._dayIdx].date : null;
    const v = this.$('video');
    const resume = this._playing ? { start: this._playing.start, at: v.currentTime || 0 } : null;
    if (this._mode !== 'play') { this._days = null; this._update(); return; }
    await this._loadDays({ day, resume });
  },

  async _loadDays(opts = {}) {
    const camIdx = this._idx;
    this._days = 'loading'; this._files = null; this._update();
    try {
      const camNode = await this._findCameraNode();
      if (!camNode) throw new Error(this._t('cam_not_found'));
      let node = await this._browse(camNode.media_content_id);
      let kids = node.children || [];
      // Auflösungsebene (falls vorhanden): gewählte Auflösung, sonst die andere
      let res = null;
      if (kids.length && kids.every((k) => k.can_expand) && !kids.some((k) => this._dayOf(k))) {
        res = this._resNodes(kids);
        const pick = res[this._playQ] || res.low || res.high || kids[0];
        res.used = pick === res.high ? 'high' : 'low';
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
    const v = this.$('video');
    const seek = () => { v.removeEventListener('loadedmetadata', seek); if (at > 0) { try { v.currentTime = at; } catch (_) { /* ignorieren */ } } };
    v.addEventListener('loadedmetadata', seek);
    this._play(f);
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

  async _play(file) {
    this._stopLive(true);
    this._resetZoom();
    this._playing = file;
    this._update();
    const v = this.$('video');
    try {
      const r = await this._hass.callWS({ type: 'media_source/resolve_media', media_content_id: file.node.media_content_id, expires: 3600 });
      if (this._playing !== file) return;
      this._playUrl = this._hass.hassUrl(r.url);
      v.src = this._playUrl;
      v.playbackRate = this._speed;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {
      this._playing = null;
      this._toast({ text: `${this._t('play_error')}: ${e.message || e}`, color: '#636366', icon: 'mdi:alert-circle-outline', wrap: true });
    }
    this._update();
  },

  _playNext(auto) {
    const files = this._visibleFiles;
    const i = files.findIndex((f) => this._playing && f.node.media_content_id === this._playing.node.media_content_id);
    if (i >= 0 && i + 1 < files.length) this._play(files[i + 1]);
    else if (auto) this._stopPlayback();
  },

  _cycleSpeed() {
    this._speed = SPEEDS[(SPEEDS.indexOf(this._speed) + 1) % SPEEDS.length];
    this.$('video').playbackRate = this._speed;
    this._update();
  },

  _download() {
    if (!this._playUrl || !this._playing) return;
    const day = this._days && this._days[this._dayIdx] && this._days[this._dayIdx].date;
    const d = day ? `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}` : '';
    this._openLink(this._playUrl, `${this._cam.name}_${d}_${this._playing.time.replace(/:/g, '-')}.mp4`);
  },

  _stopPlayback(silent) {
    const v = this.$ && this.$('video');
    if (v) { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (_) { /* ignorieren */ } }
    if (!this._playing) return;
    this._playing = null; this._playUrl = null;
    if (!silent) { this._update(); this._autoLive(); }
  },

  _renderFilters() {
    const box = this.$('filters');
    box.innerHTML = '';
    ['all', ...DET].forEach((k) => {
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
    // Umschalter Niedrig/Hoch nur, wenn die Kamera beide Auflösungen anbietet
    const both = !!(this._res && this._res.low && this._res.high);
    $('pqrow').style.display = both ? '' : 'none';
    if (both) {
      $('pq-l').textContent = this._t('play_res');
      $('pq').querySelectorAll('button').forEach((b) => {
        b.textContent = this._t(`play_res_${b.dataset.q}`);
        b.classList.toggle('sel', b.dataset.q === this._res.used);
      });
    }
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

    bar.innerHTML = files.map((f, i) => {
      const l = (f.start / 864).toFixed(3);
      const w = Math.max(0.35, f.dur / 864).toFixed(3);
      return `<i data-i="${i}" style="left:${l}%;width:${w}%;background:${EVT[f.type].color}"></i>`;
    }).join('');
    bar.querySelectorAll('i').forEach((el) => { el.onclick = () => this._play(files[+el.dataset.i]); });

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
