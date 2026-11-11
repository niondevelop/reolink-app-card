/* Direktlinks (?rac=live|event|talk), z. B. aus Push-Mitteilungen – Methoden der Klasse ReolinkAppCard */
import { prefixOf } from '../entities.js';

export default {
  /* ---------- Direktlink, z. B. aus einer Push-Mitteilung ----------
     ?rac=live&rac_cam=kamera_eingang            → Kamera wählen und live starten
     ?rac=event&rac_cam=kamera_eingang&rac_t=…   → Aufnahme zu diesem Zeitpunkt (Unix-Sekunden) abspielen
     ?rac=talk&rac_cam=kamera_eingang            → live starten und gleich das Gegensprechen einschalten (z. B. „Annehmen“) */
  _handleLink() {
    if (!this._built || !this._hass || !this.isConnected) return;
    let q;
    try { q = new URLSearchParams(window.location.search); } catch (_) { return; }
    const mode = q.get('rac');
    if (!['live', 'event', 'talk'].includes(mode)) return;
    const want = String(q.get('rac_cam') || '').trim().toLowerCase();
    const i = want ? this._cams.findIndex((c) => [c.prefix, c.entity, c.name, c.media_name].some((x) => x && String(x).toLowerCase() === want)
      || prefixOf(want) === c.prefix || (c._devId && this._hass.entities && this._hass.entities[want] && this._hass.entities[want].device_id === c._devId)) : 0;
    if (i < 0) return; // gehört zu einer anderen Karte auf der Seite
    const t = +q.get('rac_t') || Math.floor(Date.now() / 1000);
    ['rac', 'rac_cam', 'rac_t'].forEach((k) => q.delete(k));
    const qs = q.toString();
    try { history.replaceState(history.state, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`); } catch (_) { /* ignorieren */ }
    // Home Assistant mitteilen, dass die Mitteilung beantwortet wurde (z. B. damit ein „Anruf“ aufhört zu klingeln).
    // Ereignisse dürfen nur Administratoren auslösen; sonst wird es still übersprungen.
    try {
      const r = this._hass.callWS({ type: 'fire_event', event_type: 'reolink_app_card', event_data: { action: mode, camera: this._cams[i].prefix } });
      if (r && r.catch) r.catch(() => {});
    } catch (_) { /* ignorieren */ }
    if (this._grid) this._setGrid(false);
    if (i !== this._idx) { this._idx = i; this._rebuildCamera(); }
    this._expired = false;
    try { this.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (_) { /* ignorieren */ }
    if (mode === 'event') {
      this._pendingEvent = t; this._eventTries = 0;
      this._days = null; this._files = null;
      this._setMode('play');
    } else {
      this._linkLive = true;
      this._linkTalk = mode === 'talk';
      if (this._linkTalk && this._live) { this._linkTalk = false; this._talkWhenReady(); }
      this._setMode('live');
    }
  },
};
