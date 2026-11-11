/* Nachbildung der Teile von Home Assistant, die die Karte verwendet (nur für Tests).
   - ha-icon, ha-card: einfache Platzhalter
   - picture-entity → hui-image → ha-camera-stream → ha-web-rtc-player: verhält sich wie im echten Frontend
     (Stummschaltung, Neuverbinden, Mikrofon an/aus, Ereignisse microphone-changed / stream-type-changed / streams)
   - makeHass(): hass-Objekt mit Zuständen, Register, callService/callWS und Medienquelle
   Steuerung über window.__T (Optionen) und Aufzeichnung über window.__R (Aufrufe, Ereignisse). */
window.__T = window.__T || {};
window.__R = { calls: [], ws: [], events: [], msgs: [], resolved: [], toggles: 0, connects: 0, lastMuted: null };
const fire = (el, type, detail) => el.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));

customElements.define('ha-icon', class extends HTMLElement {});
customElements.define('ha-card', class extends HTMLElement { connectedCallback() { this.style.display = 'block'; } });

customElements.define('ha-web-rtc-player', class extends HTMLElement {
  constructor() { super(); this.microphoneState = 'off'; this.muted = true; this._eid = undefined; this.updateComplete = Promise.resolve(true); }
  get entityid() { return this._eid; }
  set entityid(v) {
    if (v === this._eid) return;
    // Neu verbinden beendet ein laufendes Mikrofon (wie der echte Player)
    if (this.microphoneState !== 'off') { this.microphoneState = 'off'; fire(this, 'microphone-changed', { state: 'off' }); }
    this._eid = v;
    if (v) {
      window.__R.connects++;
      window.__R.lastMuted = this.muted;
      setTimeout(() => fire(this, 'streams', { hasVideo: true, hasAudio: !this.muted && window.__T.hasAudio !== false }), 30);
    }
  }
});

customElements.define('ha-camera-stream', class extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = '<ha-web-rtc-player></ha-web-rtc-player>'; }
  get player() { return this.shadowRoot.querySelector('ha-web-rtc-player'); }
  get muted() { return this._muted !== false; }
  set muted(v) { this._muted = !!v; this.player.muted = !!v; }
  get updateComplete() { return Promise.resolve(true); }
  get microphoneTrack() { return this._track; }
  connectedCallback() {
    this.player.entityid = 'camera.test';
    setTimeout(() => fire(this, 'stream-type-changed', { type: window.__T.streamType || 'web_rtc' }), 50);
  }
  async toggleMicrophone() {
    window.__R.toggles++;
    const p = this.player;
    if (p.microphoneState !== 'off') {
      p.microphoneState = 'off';
      if (this._track) this._track.stop();
      this._track = null;
      fire(this, 'microphone-changed', { state: 'off' });
      return;
    }
    p.microphoneState = 'connecting';
    fire(this, 'microphone-changed', { state: 'connecting' });
    await new Promise((r) => setTimeout(r, 200));
    if (window.__T.denyMic) { p.microphoneState = 'off'; fire(this, 'microphone-changed', { state: 'denied' }); return; }
    const ac = new AudioContext();
    const osc = ac.createOscillator(), dest = ac.createMediaStreamDestination();
    osc.connect(dest); osc.start();
    this._track = dest.stream.getAudioTracks()[0];
    p.microphoneState = 'on';
    fire(this, 'microphone-changed', { state: 'on' });
  }
});
customElements.define('hui-image', class extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = '<ha-camera-stream muted></ha-camera-stream>'; }
});
customElements.define('hui-picture-entity-card', class extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = '<hui-image></hui-image>'; }
});
window.loadCardHelpers = async () => ({
  createCardElement: (cfg) => { const e = document.createElement('hui-picture-entity-card'); e.cfg = cfg; return e; },
});

/* Medienquelle: ein Tag (heute) je Kamera mit den Clips aus opts.files */
function media(opts, id) {
  const d = new Date();
  if (id === 'media-source://reolink') return { children: (opts.mediaCameras || []).map((t, i) => ({ title: t, media_content_id: `R|${i}`, can_expand: true })) };
  // Mit opts.resolutions wie die Reolink-Integration: erst „Low/High resolution“, dann die Tage
  if (opts.resolutions && /^R\|\d+$/.test(id)) {
    return { children: [
      { title: 'Low resolution', media_content_id: `${id}|RES|sub`, can_expand: true },
      { title: 'High resolution', media_content_id: `${id}|RES|main`, can_expand: true },
      { title: 'Autotrack low resolution', media_content_id: `${id}|RES|autotrack_sub`, can_expand: true },
    ] };
  }
  if (/^R\|\d+(\|RES\|\w+)?$/.test(id)) return { children: [{ title: `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`, media_content_id: `${id}|${d.getFullYear()}|${d.getMonth() + 1}|${d.getDate()}`, can_expand: true }] };
  return { children: (opts.files || []).map((t, i) => ({ title: t, media_content_id: `${id}|f${i}`, can_play: true })) };
}

window.makeHass = (opts = {}) => {
  const st = (state, attributes = {}) => ({ state, attributes });
  const states = {};
  Object.entries(opts.states || {}).forEach(([id, v]) => { states[id] = Array.isArray(v) ? st(v[0], v[1] || {}) : st(v); });
  const hass = {
    language: opts.language || 'de', locale: { language: opts.language || 'de' }, themes: {},
    states, entities: opts.entities || {}, devices: opts.devices || {},
    user: { is_admin: !opts.noAdmin },
    hassUrl: (x) => x,
    auth: opts.appMic ? { external: { config: { webrtc: { hasCameraMicrophoneStream: true } },
      sendMessage: async (m) => { window.__R.msgs.push(m); await new Promise((r) => setTimeout(r, 100)); return { session_id: 'S1' }; },
      fireMessage: (m) => window.__R.msgs.push(m) } } : {},
    callService: async (domain, service, data) => { window.__R.calls.push(`${domain}.${service} ${data.entity_id}${data.option ? ' ' + data.option : ''}`); },
    callWS: async (m) => {
      window.__R.ws.push(m.type);
      if (m.type === 'camera/capabilities') return { frontend_stream_types: ['web_rtc'], two_way_audio: opts.twoWay !== false };
      if (m.type === 'fire_event') { if (opts.noAdmin) throw new Error('Unauthorized'); window.__R.events.push({ type: m.event_type, data: m.event_data }); return {}; }
      if (m.type === 'media_source/resolve_media') { window.__R.resolved.push(m.media_content_id); return { url: '/clip.mp4' }; }
      if (m.type === 'media_source/browse_media') return media(opts, m.media_content_id);
      return {};
    },
  };
  return hass;
};

/* Karte einhängen und hass setzen; liefert das Element */
window.mountCard = (config, hassOpts) => {
  const c = document.createElement('reolink-app-card');
  c.setConfig(config);
  document.getElementById('wrap').appendChild(c);
  window.__hass = window.makeHass(hassOpts);
  c.hass = window.__hass;
  window.__card = c;
  return c;
};

/* Zustand einer Entität ändern, wie Home Assistant es tut (neues hass-Objekt) */
window.setState = (id, state, attributes) => {
  const h = window.__hass;
  window.__hass = { ...h, states: { ...h.states, [id]: { state, attributes: attributes || (h.states[id] || {}).attributes || {} } } };
  window.__card.hass = window.__hass;
};

/* Kurzer Blick in die Karte für die Tests */
window.cardInfo = () => {
  const c = window.__card, r = c.shadowRoot;
  const toast = r.getElementById('toast');
  const talk = r.querySelector('[data-id="talk"]');
  return {
    cam: c._cam.name, mode: c._mode, live: c._live, mic: c._mic, sound: c._sound,
    playing: c._playing ? c._playing.time : null,
    talkClass: talk ? talk.className : null,
    toast: toast.classList.contains('show') ? toast.textContent.trim() : null,
    ringing: r.getElementById('stage').classList.contains('ringing'),
    dialog: r.getElementById('dlg').classList.contains('show') ? r.getElementById('dtext').textContent : null,
  };
};
