/* Klingel: Auslöser, Anrufansicht, Klingelton – Methoden der Klasse ReolinkAppCard */

export default {
  /* ---------- Klingel ----------
     Auslöser pro Kamera (Option doorbell): Besucher-Sensor einer Reolink-Klingel oder ein beliebiger Taster/Schalter/Sensor.
     Ohne Angabe wird der Besucher-Sensor der Kamera genommen, falls vorhanden; doorbell: false schaltet es ab. */
  _bellId(cam) {
    if (cam.doorbell === false) return null;
    if (typeof cam.doorbell === 'string') return cam.doorbell;
    const v = this._e('visitor', cam);
    return this._st(v) ? v : null;
  },

  _checkDoorbell(old, hass) {
    if (!old) return;
    this._cams.forEach((cam, i) => {
      const id = this._bellId(cam);
      if (!id) return;
      const o = old.states[id], n = hass.states[id];
      if (!o || !n || o === n || ['unavailable', 'unknown'].includes(n.state)) return;
      const domain = id.split('.')[0];
      // An/Aus-Entitäten klingeln beim Einschalten, Ereignisse und Taster bei jeder neuen Auslösung, Sensoren bei jeder Änderung
      const rang = ['binary_sensor', 'input_boolean', 'switch', 'light'].includes(domain) ? o.state !== 'on' && n.state === 'on' : n.state !== o.state;
      if (rang) this._startRing(i);
    });
  },

  _startRing(i) {
    const again = this._ring && this._ring.idx === i;
    if (this._ring && !again) this._endRing(false);
    if (!again) {
      if (this._grid) this._setGrid(false);
      if (this._mode !== 'live') this._setMode('live');
      if (i !== this._idx) { this._idx = i; this._rebuildCamera(); }
      // Livebild nur während des Klingelns und nur, wenn die Karte sichtbar ist (Akku)
      const startLive = !this._live && this._visible && !document.hidden;
      if (startLive) { this._expired = false; this._startLive(); } else if (!this._live) this._loadSnap(i, true);
      this._ring = { idx: i, startedLive: startLive };
      if (this._config.doorbell_sound !== false) { this._ringTone(); this._ringToneT = setInterval(() => this._ringTone(), 3000); }
    }
    clearTimeout(this._ringT);
    this._ringT = setTimeout(() => this._endRing(false), (+this._config.doorbell_timeout || 30) * 1000);
    this._update();
  },

  _endRing(answer) {
    const r = this._ring;
    clearTimeout(this._ringT); clearInterval(this._ringToneT);
    if (!r) return;
    this._ring = null;
    if (answer) {
      this._expired = false;
      if (!this._live) this._startLive();
      if (this._mic === 'off') this._toggleTalk();
    } else if (r.startedLive && this._live && this._mic === 'off') this._stopLive();
    if (this._built) this._update();
  },

  /* Kurzer Ding-Dong über den Lautsprecher des Geräts (Browser erlauben Ton erst nach einer Interaktion) */
  _ringTone() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = this._ringCtx || (this._ringCtx = new AC());
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      [[880, 0], [659, 0.45]].forEach(([f, d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, now + d);
        g.gain.exponentialRampToValueAtTime(0.3, now + d + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + d + 0.9);
        o.connect(g).connect(ctx.destination);
        o.start(now + d); o.stop(now + d + 1);
      });
    } catch (_) { /* ohne Ton weiter */ }
  },
};
