/* Ton des Livebilds und Gegensprechen (Zwei-Wege-Audio) – Methoden der Klasse ReolinkAppCard */
import { REOLINK_CHROME, REOLINK_COMPANION } from '../constants.js';
import { SND_EVENTS, deepFind } from '../util.js';

export default {
  /* Gegensprechen einschalten, sobald bekannt ist, ob es geht (Abfrage bei Home Assistant läuft evtl. noch) */
  async _talkWhenReady() {
    for (let n = 0; n < 40; n++) {
      if (!this._live || this._mic !== 'off') return;
      if (this._talkReason() !== 'wait') { this._toggleTalk(); return; }
      await new Promise((r) => setTimeout(r, 250));
    }
  },

  /* ---------- Ton des Livebilds ----------
     Die picture-entity-Karte startet den Stream immer stumm, und der WebRTC-Player lässt die Tonspur dann ganz weg.
     Zum Einschalten wird der Player deshalb ohne Stummschaltung neu verbunden. */
  async _applySound() {
    const tok = (this._sndTok = Symbol());
    // Browser spielen Ton erst nach einer Interaktion mit der Seite ab, sonst bliebe das Livebild schwarz
    const ua = navigator.userActivation;
    if (this._sound && ua && !ua.hasBeenActive) {
      if (!this._sndWait) {
        // Auf Touchgeräten zählt erst das Loslassen als Interaktion, darum auf pointerup/click/keydown warten
        this._sndWait = () => { this._sndStopWait(); setTimeout(() => { if (this._sound) this._applySound(); }, 0); };
        SND_EVENTS.forEach((t) => window.addEventListener(t, this._sndWait, true));
      }
      return;
    }
    for (let n = 0; n < 100; n++) {
      if (tok !== this._sndTok || !this._live || this._grid) return;
      const s = deepFind(this.$('pic'), 'ha-camera-stream');
      if (s) {
        const want = !this._sound;
        if (s.muted === want) return;
        s.muted = want;
        const p = s.shadowRoot && s.shadowRoot.querySelector('ha-web-rtc-player');
        // Nur beim Einschalten neu verbinden, und nur wenn der Player schon ohne Ton verbunden ist
        if (!want && p && p.entityid) {
          const talking = this._mic !== 'off' && !this._appSession;
          await s.updateComplete;
          const id = p.entityid;
          p.entityid = undefined;
          await p.updateComplete;
          p.entityid = id;
          if (talking) { this._setMic('off'); setTimeout(() => this._toggleTalk(), 300); }
        }
        return;
      }
      // Anfangs schnell nachsehen, damit der Player möglichst gleich mit Ton startet statt neu zu verbinden
      await new Promise((r) => setTimeout(r, n < 40 ? 25 : 200));
    }
  },

  _sndStopWait() {
    if (!this._sndWait) return;
    SND_EVENTS.forEach((t) => window.removeEventListener(t, this._sndWait, true));
    this._sndWait = null;
  },

  /* ---------- Gegensprechen über Home Assistant (Zwei-Wege-Audio, Labs-Funktion ab 2026.11) ----------
     Das Livebild läuft über den WebRTC-Player von Home Assistant; die Karte schaltet dort nur das Mikrofon zu.
     Ohne HTTPS sperren Browser das Mikrofon. Die Companion-App kann es dann selbst senden, sofern sie das unterstützt. */
  get _talkEnt() { const w = this._qEntity(this._quality); return this._st(w) ? w : this._e('cam_sd'); },

  get _appMic() {
    const ext = this._hass && this._hass.auth && this._hass.auth.external;
    return !window.isSecureContext && !!(ext && ext.config && ext.config.webrtc && ext.config.webrtc.hasCameraMicrophoneStream);
  },

  _talkLegacy() { return !!(this._cam.talk_url || this._config.talk_url); },

  /* Kann die Kamera Zwei-Wege-Audio? (undefined = wird noch abgefragt; Antwort 1 Minute zwischengespeichert) */
  _talkCaps(ent) {
    if (!ent || !this._hass || !this._hass.callWS) return false;
    const c = this._twa[ent];
    if (c && (c.p || Date.now() - c.t < 60000)) return c.v;
    this._twa[ent] = { v: c ? c.v : undefined, p: true };
    this._hass.callWS({ type: 'camera/capabilities', entity_id: ent })
      .then((r) => !!(r && r.two_way_audio), () => false)
      .then((v) => { this._twa[ent] = { v, t: Date.now() }; if (!c || c.v !== v) this._update(); });
    return c ? c.v : undefined;
  },

  /* Warum Gegensprechen gerade nicht geht – null heisst: bereit */
  _talkReason() {
    const caps = this._talkCaps(this._talkEnt);
    if (caps === undefined) return 'wait';
    if (!caps) return 'feature';
    if (!window.isSecureContext && !this._appMic) return 'https';
    if (this._streamType && this._streamType !== 'web_rtc') return 'webrtc';
    return null;
  },

  async _toggleTalk() {
    if (this._mic !== 'off') { this._hangUp(); return; }
    const why = this._talkReason();
    if (why) {
      if (why !== 'wait') this._toast({ text: this._t(`talk_na_${why}`), color: '#636366', icon: 'mdi:phone-off', wrap: true });
      return;
    }
    // Erst das Livebild starten (ersetzt den Player), dann das Mikrofon zuschalten
    if (!this._live) { this._expired = false; this._startLive(); }
    const req = ++this._micReq;
    this._setMic('connecting');
    if (this._appMic) { this._startAppMic(req); return; }
    const stream = await this._findStream(req);
    if (req !== this._micReq) return;
    if (!stream) {
      this._setMic('off');
      this._toast({ text: this._t(this._streamType && this._streamType !== 'web_rtc' ? 'talk_na_webrtc' : 'talk_failed'), color: '#636366', icon: 'mdi:phone-off', wrap: true });
      return;
    }
    this._micStream = stream;
    stream.toggleMicrophone();
  },

  /* Warten, bis der WebRTC-Player von Home Assistant im Livebild bereit ist (max. 15 s) */
  async _findStream(req) {
    for (let n = 0; n < 75; n++) {
      if (req !== this._micReq) return null;
      if (this._streamType && this._streamType !== 'web_rtc') return null;
      const s = deepFind(this.$('pic'), 'ha-camera-stream');
      if (s && typeof s.toggleMicrophone === 'function' && s.shadowRoot && s.shadowRoot.querySelector('ha-web-rtc-player')) return s;
      await new Promise((r) => setTimeout(r, 200));
    }
    return null;
  },

  async _startAppMic(req) {
    const ext = this._hass.auth.external;
    try {
      const r = await ext.sendMessage({ type: 'webrtc/stream/start', payload: { stream_type: 'microphone', entity_id: this._talkEnt } });
      if (req !== this._micReq) { ext.fireMessage({ type: 'webrtc/stream/stop', payload: { session_id: r.session_id } }); return; }
      this._appSession = r.session_id;
      this._setMic('on');
    } catch (e) {
      if (req !== this._micReq) return;
      this._setMic('off');
      this._toast({ text: `${this._t('talk_failed')}${e && e.message ? `: ${e.message}` : ''}`, color: '#636366', icon: 'mdi:phone-off', wrap: true });
    }
  },

  /* Die App hat die Mikrofon-Verbindung selbst beendet */
  _handleAppStop(e) {
    if (!this._appSession || !e.detail || e.detail.session_id !== this._appSession) return;
    this._appSession = null;
    this._setMic('off');
    if (e.detail.code && e.detail.code !== 'interrupted') {
      this._toast({ text: `${this._t('talk_failed')}${e.detail.message ? `: ${e.detail.message}` : ''}`, color: '#636366', icon: 'mdi:phone-off', wrap: true });
    }
  },

  _hangUp() {
    if (this._appSession || this._appMic) { this._micReset(); return; }
    const s = this._micStream;
    this._micReq++;
    this._micStream = null;
    const p = s && s.isConnected && s.shadowRoot && s.shadowRoot.querySelector('ha-web-rtc-player');
    if (p && (p.microphoneState === 'on' || p.microphoneState === 'connecting')) s.toggleMicrophone();
    this._setMic('off');
  },

  /* Gegensprechen sofort beenden, z. B. wenn das Livebild stoppt oder die Kamera wechselt */
  _micReset() {
    this._micReq = (this._micReq || 0) + 1;
    if (this._appSession) {
      try { this._hass.auth.external.fireMessage({ type: 'webrtc/stream/stop', payload: { session_id: this._appSession } }); } catch (_) { /* ignorieren */ }
      this._appSession = null;
    }
    this._micStream = null;
    if (this._mic && this._mic !== 'off') this._setMic('off');
  },

  _setMic(state) {
    if (state === 'denied') {
      this._toast({ text: this._t('talk_denied'), color: '#636366', icon: 'mdi:microphone-off', wrap: true });
      state = 'off';
    }
    const prev = this._mic;
    this._mic = state;
    if (state === 'on' && prev !== 'on') {
      this._talkSince = Date.now();
      clearInterval(this._talkTick);
      this._talkTick = setInterval(() => this._talkLabel(), 1000);
      this._startMeter();
    } else if (state !== 'on') {
      clearInterval(this._talkTick);
      this._stopMeter();
    }
    if (this._built) this._update();
  },

  _talkLabel() {
    const l = this.$('talk-l');
    if (!l) return;
    if (this._mic === 'connecting') { l.textContent = this._t('talk_connecting'); return; }
    const sec = Math.max(0, Math.floor((Date.now() - (this._talkSince || Date.now())) / 1000));
    l.textContent = `${this._t('talking')} · ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  },

  /* Pegelanzeige des eigenen Mikrofons */
  _startMeter() {
    this._stopMeter();
    const track = this._micStream && this._micStream.microphoneTrack;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!track || !AC) return;
    try {
      const ctx = new AC();
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      ctx.createMediaStreamSource(new MediaStream([track])).connect(an);
      const buf = new Uint8Array(an.fftSize);
      const loop = () => {
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) { const d = (buf[i] - 128) / 128; sum += d * d; }
        this.style.setProperty('--lvl', Math.min(1, Math.sqrt(sum / buf.length) * 5).toFixed(2));
        this._meterRaf = requestAnimationFrame(loop);
      };
      this._meterCtx = ctx;
      loop();
    } catch (_) { this._stopMeter(); }
  },

  _stopMeter() {
    cancelAnimationFrame(this._meterRaf);
    if (this._meterCtx) { this._meterCtx.close().catch(() => {}); this._meterCtx = null; }
    this.style.removeProperty('--lvl');
  },

  /* Alternativ (Option talk_url): Reolink-App öffnen. Reolink bietet keinen Deep-Link auf eine bestimmte Kamera */
  _talk() {
    const ua = navigator.userAgent;
    const android = /android/i.test(ua);
    const companion = android && (/Home ?Assistant/i.test(ua) || !!window.externalApp);
    const url = this._cam.talk_url || this._config.talk_url
      || (companion ? REOLINK_COMPANION : android ? REOLINK_CHROME : null);
    if (!url) { this._toast({ text: this._t('no_talk_url'), color: '#636366', icon: 'mdi:link-off', wrap: true }); return; }
    this._stopLive();
    this._openLink(url);
  },
};
