/* Reolink App Card – Live, Steuerung & Wiedergabe im Stil der Reolink-App */
const RAC_VERSION = '2.0.0';

/* ---------- Sprache ---------- */
const STR = {
  de: {
    live: 'Live', playback: 'Wiedergabe', settings: 'Einstellungen', paused: 'Pausiert', sleeping: 'Schlafmodus',
    start_live: 'Live starten', stop_live: 'Live beenden', fullscreen: 'Vollbild',
    talk: 'Sprechen (öffnet die Reolink-App)', siren: 'Ton-Alarm', siren_confirm: 'Ton-Alarm bei „{name}“ auslösen?',
    spotlight: 'Spotlight', record: 'Aufnahme', snapshot: 'Schnappschuss', quality: 'Qualität',
    q_fluent: 'Flüssig', q_balanced: 'Balanciert', q_clear: 'Klar', not_enabled: 'nicht aktiviert',
    no_talk_url: 'Auf diesem Gerät ist kein Link zur Reolink-App hinterlegt (Option „talk_url“).',
    grid: 'Alle Kameras', single: 'Einzelansicht', detected: '{type} erkannt · {name}',
    evt_person: 'Person', evt_vehicle: 'Fahrzeug', evt_animal: 'Tier', evt_motion: 'Bewegung', evt_other: 'Aufnahme',
    all: 'Alle', today: 'Heute', yesterday: 'Gestern', loading: 'Aufnahmen werden geladen …', loading_day: 'Lade Tag …',
    no_rec: 'Keine Aufnahmen auf der SD-Karte gefunden.', no_filter: 'Keine Ereignisse für diesen Filter.', error: 'Fehler',
    cam_not_found: 'Kamera in der Medienquelle nicht gefunden', play_error: 'Aufnahme kann nicht geladen werden',
    speed: 'Geschwindigkeit', next: 'Nächster Clip', download: 'Herunterladen', reset_zoom: 'Zoom zurücksetzen',
    preview_at: 'Bild {time}', bat_low: 'Akku schwach · {name} {v} %', temp_high: 'Akku zu warm · {name} {v} °C',
    temp_low: 'Akku zu kalt · {name} {v} °C', sd: 'SD {v} % belegt',
    scene_off: 'Aus', scene_disarm: 'Deaktiviert', scene_home: 'Zuhause', scene_away: 'Abwesend',
    g_general: 'Allgemein', g_detect: 'Erkennung', g_image: 'Bild', g_flood: 'Flutlicht', g_audio: 'Ton & Aufnahme',
    pir: 'PIR-Erkennung', rec: 'Aufzeichnung', push: 'Push-Benachrichtigungen', pir_reduce: 'PIR-Fehlalarme reduzieren',
    daynight: 'Tag/Nacht', ir: 'Infrarotlicht nachts', status_led: 'Status-LED', prealarm: 'Voralarm', play_btn: 'Abspielen',
    restart: 'Kamera neu starten', restart_btn: 'Neu starten', restart_confirm: 'Kamera „{name}“ neu starten?',
    pir_sens: 'PIR-Empfindlichkeit', ai_person: 'KI-Empfindlichkeit Person', ai_vehicle: 'KI-Empfindlichkeit Fahrzeug',
    ai_animal: 'KI-Empfindlichkeit Tier', img_bright: 'Helligkeit', img_contrast: 'Kontrast', img_sat: 'Sättigung',
    img_sharp: 'Schärfe', anti_flicker: 'Anti-Flimmer', ir_bright: 'Infrarot-Helligkeit', fl_mode: 'Modus',
    fl_bright: 'Helligkeit beim Einschalten', volume: 'Lautstärke', post_rec: 'Nachaufzeichnung', rec_audio: 'Audio aufnehmen',
    siren_event: 'Sirene bei Ereignis', prealarm_event: 'Voralarm bei Ereignis', hub_ring_event: 'Hub-Klingelton bei Ereignis',
    need_cameras: 'Bitte „cameras“ definieren', need_prefix: 'Jede Kamera braucht „prefix“',
  },
  en: {
    live: 'Live', playback: 'Playback', settings: 'Settings', paused: 'Paused', sleeping: 'Sleeping',
    start_live: 'Start live', stop_live: 'Stop live', fullscreen: 'Fullscreen',
    talk: 'Talk (opens the Reolink app)', siren: 'Siren', siren_confirm: 'Sound the siren on “{name}”?',
    spotlight: 'Spotlight', record: 'Record', snapshot: 'Snapshot', quality: 'Quality',
    q_fluent: 'Fluent', q_balanced: 'Balanced', q_clear: 'Clear', not_enabled: 'not enabled',
    no_talk_url: 'No link to the Reolink app is configured for this device (option “talk_url”).',
    grid: 'All cameras', single: 'Single view', detected: '{type} detected · {name}',
    evt_person: 'Person', evt_vehicle: 'Vehicle', evt_animal: 'Animal', evt_motion: 'Motion', evt_other: 'Recording',
    all: 'All', today: 'Today', yesterday: 'Yesterday', loading: 'Loading recordings …', loading_day: 'Loading day …',
    no_rec: 'No recordings found on the SD card.', no_filter: 'No events for this filter.', error: 'Error',
    cam_not_found: 'Camera not found in the media source', play_error: 'Recording could not be loaded',
    speed: 'Speed', next: 'Next clip', download: 'Download', reset_zoom: 'Reset zoom',
    preview_at: 'Image {time}', bat_low: 'Battery low · {name} {v} %', temp_high: 'Battery too hot · {name} {v} °C',
    temp_low: 'Battery too cold · {name} {v} °C', sd: 'SD {v} % used',
    scene_off: 'Off', scene_disarm: 'Disarmed', scene_home: 'Home', scene_away: 'Away',
    g_general: 'General', g_detect: 'Detection', g_image: 'Image', g_flood: 'Floodlight', g_audio: 'Audio & recording',
    pir: 'PIR detection', rec: 'Recording', push: 'Push notifications', pir_reduce: 'Reduce PIR false alarms',
    daynight: 'Day/night', ir: 'Infrared at night', status_led: 'Status LED', prealarm: 'Pre-alarm', play_btn: 'Play',
    restart: 'Restart camera', restart_btn: 'Restart', restart_confirm: 'Restart camera “{name}”?',
    pir_sens: 'PIR sensitivity', ai_person: 'AI sensitivity person', ai_vehicle: 'AI sensitivity vehicle',
    ai_animal: 'AI sensitivity animal', img_bright: 'Brightness', img_contrast: 'Contrast', img_sat: 'Saturation',
    img_sharp: 'Sharpness', anti_flicker: 'Anti-flicker', ir_bright: 'Infrared brightness', fl_mode: 'Mode',
    fl_bright: 'Turn-on brightness', volume: 'Volume', post_rec: 'Post-recording', rec_audio: 'Record audio',
    siren_event: 'Siren on event', prealarm_event: 'Pre-alarm on event', hub_ring_event: 'Hub ringtone on event',
    need_cameras: 'Please define “cameras”', need_prefix: 'Every camera needs a “prefix”',
  },
};
const fmt = (s, v = {}) => s.replace(/\{(\w+)\}/g, (_, k) => (v[k] ?? ''));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Konstanten ---------- */
const Q = {
  fluent: { key: 'q_fluent', icon: 'mdi:quality-low' },
  balanced: { key: 'q_balanced', icon: 'mdi:quality-medium' },
  clear: { key: 'q_clear', icon: 'mdi:quality-high' },
};
const Q_ORDER = ['fluent', 'balanced', 'clear'];
const Q_ALIAS = { sd: 'fluent', low: 'fluent', hd: 'clear', high: 'clear', medium: 'balanced' };
const REOLINK_PKG = 'com.mcu.reolink';
// Companion-App: öffnet Apps über app://<paket> (https://companion.home-assistant.io/docs/integrations/android-webview)
const REOLINK_COMPANION = `app://${REOLINK_PKG}`;
// Chrome auf Android: vollständiger Launcher-Intent
const REOLINK_CHROME = `intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${REOLINK_PKG};end`;

const EVT = {
  person: { icon: 'mdi:walk', color: '#ff5b5b', re: /person|people|human|mensch/i },
  vehicle: { icon: 'mdi:car', color: '#ffa630', re: /vehicle|car|fahrzeug/i },
  animal: { icon: 'mdi:paw', color: '#3ccf8e', re: /animal|pet|dog|cat|tier/i },
  motion: { icon: 'mdi:motion-sensor', color: '#4da3ff', re: /motion|md|pir|bewegung/i },
  other: { icon: 'mdi:record-rec', color: '#9aa4b2', re: /.^/ },
};
const EVT_ORDER = ['person', 'vehicle', 'animal', 'motion', 'other'];
const DET = ['person', 'vehicle', 'animal', 'motion'];
const SPEEDS = [1, 1.5, 2, 4, 0.5];

/* Entity-Suffixe der Reolink-Integration: [deutsch, englisch, Alternativen] */
const ENT = {
  cam_sd: ['camera', 'standardauflosung', 'fluent'],
  cam_bal: ['camera', 'ausgewogen', 'balanced'],
  cam_hd: ['camera', 'hochauflosung', 'clear'],
  snap: ['camera', 'schnappschusse_in_standardauflosung', 'snapshots_fluent'],
  light: ['light', 'flutlicht', 'floodlight'],
  status_led: ['light', 'status_led'],
  siren: ['siren', 'sirene', 'siren'],
  prealarm: ['button', 'voralarm', 'pre_alarm'],
  restart: ['button', 'neu_starten', 'restart'],
  manual_rec: ['switch', 'manuelle_aufzeichnung', 'manual_record'],
  rec: ['switch', 'aufzeichnen', 'record'],
  pir: ['switch', 'pir_aktiviert', 'pir_enabled'],
  pir_reduce: ['switch', 'pir_fehlalarme_reduzieren', 'pir_reduce_false_alarm'],
  push: ['switch', 'push_benachrichtigungen', 'push_notifications'],
  ir: ['switch', 'infrarotlicht_im_nachtmodus', 'infrared_lights_in_night_mode', 'infra_red_lights_in_night_mode'],
  rec_audio: ['switch', 'audio_aufnehmen', 'record_audio'],
  siren_event: ['switch', 'sirene_bei_ereignis', 'siren_on_event'],
  prealarm_event: ['switch', 'voralarm_bei_ereignis', 'pre_alarm_on_event'],
  hub_ring_event: ['switch', 'hub_klingelton_bei_ereignis', 'hub_ringtone_on_event'],
  daynight: ['select', 'tag_nacht_modus', 'day_night_mode'],
  anti_flicker: ['select', 'anti_flimmer', 'anti_flicker'],
  fl_mode: ['select', 'flutlicht_modus', 'floodlight_mode'],
  post_rec: ['select', 'nachaufzeichnungszeit', 'post_recording_time'],
  pir_sens: ['number', 'pir_empfindlichkeit', 'pir_sensitivity'],
  ai_person: ['number', 'ki_personen_empfindlichkeit', 'ai_person_sensitivity'],
  ai_vehicle: ['number', 'ki_fahrzeug_empfindlichkeit', 'ai_vehicle_sensitivity'],
  ai_animal: ['number', 'ki_tier_empfindlichkeit', 'ai_animal_sensitivity', 'ai_pet_sensitivity'],
  img_bright: ['number', 'bildhelligkeit', 'image_brightness'],
  img_contrast: ['number', 'bildkontrast', 'image_contrast'],
  img_sat: ['number', 'bildsattigung', 'image_saturation'],
  img_sharp: ['number', 'bildscharfe', 'image_sharpness'],
  ir_bright: ['number', 'helligkeit_des_infrarotlichts', 'infrared_light_brightness'],
  fl_bright: ['number', 'flutlicht_helligkeit_beim_einschalten', 'floodlight_turn_on_brightness'],
  volume: ['number', 'lautstarke', 'volume'],
  battery: ['sensor', 'batterie', 'battery'],
  battery_state: ['sensor', 'batteriestatus', 'battery_state'],
  battery_temp: ['sensor', 'batterietemperatur', 'battery_temperature'],
  wifi: ['sensor', 'wlan_signal', 'wi_fi_signal', 'wifi_signal'],
  sleep: ['binary_sensor', 'schlafstatus', 'sleep_status'],
  det_person: ['binary_sensor', 'person'],
  det_vehicle: ['binary_sensor', 'fahrzeug', 'vehicle'],
  det_animal: ['binary_sensor', 'tier', 'animal', 'pet'],
  det_motion: ['binary_sensor', 'bewegung', 'motion'],
};
const HUB_ENT = {
  scene: ['select', 'szenenmodus', 'scene_mode'],
  storage: ['sensor', 'sd_0_speicher', 'sd_0_storage'],
};
/* ältere Optionsnamen aus Version 1 */
const LEGACY = {
  camera_sd: 'cam_sd', camera_balanced: 'cam_bal', camera_hd: 'cam_hd', light: 'light', siren: 'siren',
  prealarm: 'prealarm', manual_record: 'manual_rec', record: 'rec', pir: 'pir', push: 'push',
  day_night: 'daynight', battery: 'battery', wifi: 'wifi', sleep: 'sleep',
};

const SETTINGS = [
  { g: 'g_general', icon: 'mdi:cog-outline', items: [
    ['pir', 'sw', 'mdi:motion-sensor'], ['rec', 'sw', 'mdi:sd'], ['push', 'sw', 'mdi:bell-ring-outline'],
    ['pir_reduce', 'sw', 'mdi:filter-outline'], ['daynight', 'sel', 'mdi:theme-light-dark'],
    ['ir', 'sw', 'mdi:weather-night'], ['status_led', 'sw', 'mdi:led-on'],
    ['prealarm', 'btn', 'mdi:bullhorn-outline', 'play_btn'], ['restart', 'btn', 'mdi:restart', 'restart_btn', 'restart_confirm'],
  ] },
  { g: 'g_detect', icon: 'mdi:radar', items: [
    ['pir_sens', 'num', 'mdi:motion-sensor'], ['ai_person', 'num', 'mdi:walk'],
    ['ai_vehicle', 'num', 'mdi:car'], ['ai_animal', 'num', 'mdi:paw'],
  ] },
  { g: 'g_image', icon: 'mdi:image-edit-outline', items: [
    ['img_bright', 'num', 'mdi:brightness-6'], ['img_contrast', 'num', 'mdi:contrast-box'],
    ['img_sat', 'num', 'mdi:palette-outline'], ['img_sharp', 'num', 'mdi:image-filter-center-focus'],
    ['anti_flicker', 'sel', 'mdi:sine-wave'], ['ir_bright', 'num', 'mdi:led-variant-on'],
  ] },
  { g: 'g_flood', icon: 'mdi:flashlight', items: [
    ['fl_mode', 'sel', 'mdi:lightbulb-auto-outline'], ['fl_bright', 'num', 'mdi:brightness-percent'],
  ] },
  { g: 'g_audio', icon: 'mdi:volume-high', items: [
    ['volume', 'num', 'mdi:volume-high'], ['post_rec', 'sel', 'mdi:timer-outline'], ['rec_audio', 'sw', 'mdi:microphone'],
    ['siren_event', 'sw', 'mdi:alarm-light-outline'], ['prealarm_event', 'sw', 'mdi:bullhorn-outline'],
    ['hub_ring_event', 'sw', 'mdi:bell-outline'],
  ] },
];

/* ======================================================================= */
class ReolinkAppCard extends HTMLElement {
  setConfig(config) {
    if (!config || !Array.isArray(config.cameras) || !config.cameras.length) throw new Error(STR.de.need_cameras);
    if (config.cameras.some((c) => !c || !c.prefix)) throw new Error(STR.de.need_prefix);
    this._config = {
      live_timeout: 300, auto_live: true, auto_switch: true, autoplay_next: true,
      default_quality: 'fluent', battery_warning: 20, temperature_warning: 45, temperature_low_warning: -10,
      hub_prefix: 'reolink_hub', show_hub: true, alert_seconds: 8, language: 'auto',
      ...config,
    };
    this._cams = config.cameras.map((c) => {
      const over = { ...(c.entities || {}) };
      Object.entries(LEGACY).forEach(([k, v]) => { if (c[k]) over[v] = c[k]; });
      return { prefix: c.prefix, name: c.name || c.prefix, media_name: c.media_name || c.name || c.prefix, talk_url: c.talk_url, over };
    });
    this._idx = 0;
    this._mode = 'live';
    this._grid = false;
    this._quality = this._normQ(this._config.default_quality);
    this._qOpen = false;
    this._live = false;
    this._filter = 'all';
    this._days = null; this._dayIdx = 0; this._files = null; this._playing = null;
    this._settingsOpen = false; this._group = null;
    this._speed = 1;
    this._zoom = { s: 1, x: 0, y: 0 };
    this._snaps = {};
    this._prevDet = null;
    this._pics = [];
    if (this._built) { this._renderTabs(); this._rebuildCamera(); }
  }

  /* ---------- Hilfen ---------- */
  get _lang() {
    const l = this._config.language && this._config.language !== 'auto' ? this._config.language
      : (this._hass && ((this._hass.locale && this._hass.locale.language) || this._hass.language)) || 'de';
    return String(l).toLowerCase().startsWith('de') ? 'de' : 'en';
  }
  _t(k, v) { return fmt((STR[this._lang] || STR.de)[k] || STR.de[k] || k, v); }
  get _cam() { return this._cams[this._idx]; }
  _st(id) { return this._hass && id ? this._hass.states[id] : undefined; }
  _on(id) { const s = this._st(id); return !!s && s.state === 'on'; }
  _num(id) { const s = this._st(id); return s && s.state !== '' && !isNaN(+s.state) ? +s.state : null; }

  /* Entity einer Kamera auflösen: Überschreibung > deutsch > englisch > Alternativen */
  _e(key, cam = this._cam) {
    if (cam.over[key]) return cam.over[key];
    const [domain, ...suf] = ENT[key];
    for (const s of suf) { const id = `${domain}.${cam.prefix}_${s}`; if (this._st(id)) return id; }
    return `${domain}.${cam.prefix}_${suf[0]}`;
  }
  _hubE(key) {
    const over = (this._config.hub_entities || {})[key];
    if (over) return over;
    const [domain, ...suf] = HUB_ENT[key];
    for (const s of suf) { const id = `${domain}.${this._config.hub_prefix}_${s}`; if (this._st(id)) return id; }
    return null;
  }
  _det(cam) { return DET.filter((k) => this._on(this._e(`det_${k}`, cam))); }

  getCardSize() { return 10; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }

  static getConfigElement() { return document.createElement('reolink-app-card-editor'); }
  static getStubConfig(hass) {
    const cams = detectCameras(hass).slice(0, 4).map((c) => ({ name: c.name, prefix: c.prefix, media_name: c.name }));
    return { cameras: cams.length ? cams : [{ name: 'Kamera', prefix: 'kamera' }] };
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (!this._built) this._build();
    this._pics.forEach((p) => { p.hass = hass; });
    if (first) { this._renderTabs(); this._renderFilters(); this._loadSnap(this._idx); }
    if (this._ensureQ() && this._live) this._makePic();
    this._checkDetections();
    this._update();
    this._autoLive();
  }

  connectedCallback() { if (this._built) this._observe(); }

  disconnectedCallback() {
    clearInterval(this._tick);
    clearTimeout(this._toastT);
    if (this._io) this._io.disconnect();
    if (this._onVis) { document.removeEventListener('visibilitychange', this._onVis); this._onVis = null; }
    this._visible = false;
    this._stopLive(true);
  }

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
  _qEntity(q, cam = this._cam) { return this._e({ fluent: 'cam_sd', balanced: 'cam_bal', clear: 'cam_hd' }[q], cam); }
  _qAvail() { return Q_ORDER.filter((q) => this._st(this._qEntity(q))); }
  _ensureQ() {
    const a = this._qAvail();
    if (a.length && !a.includes(this._quality)) { this._quality = a[0]; return true; }
    return false;
  }
  _setQuality(q) {
    this._qOpen = false;
    if (q !== this._quality) { this._quality = q; if (this._live) this._makePic(); }
    this._update();
  }

  /* ---------- Aufbau ---------- */
  _build() {
    this._built = true;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>${RAC_CSS}</style>
      <ha-card>
        <div class="top"><div class="tabs" id="tabs"></div><button class="gridbtn" id="gridbtn"><ha-icon></ha-icon></button></div>
        <div class="hub" id="hub"></div>
        <div class="warns" id="warns"></div>
        <div class="stage" id="stage">
          <div class="media" id="media">
            <img class="prev" id="prev" alt="">
            <div class="pic" id="pic"></div>
            <video id="video" playsinline controls></video>
          </div>
          <div class="grid" id="grid"></div>
          <div class="ov top">
            <div class="pillrow"><span class="pill" id="badge"></span><span class="pill" id="zoompill"></span></div>
            <div class="pillrow" id="stat"></div>
          </div>
          <div class="ov det" id="det"></div>
          <div class="toast" id="toast"></div>
          <button class="bigplay" id="bigplay"><ha-icon icon="mdi:play"></ha-icon></button>
          <div class="ov bottom">
            <span class="pill" id="timer"></span>
            <span class="spacer"></span>
            <button class="pill btn" id="speed"></button>
            <button class="pill btn icon" id="next"><ha-icon icon="mdi:skip-next"></ha-icon></button>
            <button class="pill btn icon" id="dl"><ha-icon icon="mdi:download"></ha-icon></button>
            <button class="pill btn icon" id="unzoom"><ha-icon icon="mdi:magnify-minus-outline"></ha-icon></button>
            <button class="pill btn icon" id="stop"><ha-icon icon="mdi:stop"></ha-icon></button>
            <button class="pill btn icon" id="fs"><ha-icon icon="mdi:fullscreen"></ha-icon></button>
          </div>
        </div>
        <div class="seg"><button id="m-live"></button><button id="m-play"></button></div>
        <div id="pane-live">
          <div class="barwrap"><div class="bar" id="ctrls"></div><div class="qmenu" id="qmenu"></div></div>
          <button class="more" id="more"><ha-icon icon="mdi:tune-variant"></ha-icon><span id="more-l"></span><ha-icon id="chev" icon="mdi:chevron-down"></ha-icon></button>
          <div class="settings" id="settings"></div>
        </div>
        <div id="pane-play">
          <div class="days" id="days"></div>
          <div class="filters" id="filters"></div>
          <div class="tl"><div class="tlbar" id="tlbar"></div><div class="tlh"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div></div>
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
    $('gridbtn').onclick = () => this._setGrid(!this._grid);
    $('m-live').onclick = () => this._setMode('live');
    $('m-play').onclick = () => this._setMode('play');
    $('more').onclick = () => { this._settingsOpen = !this._settingsOpen; this._update(); };
    $('speed').onclick = () => this._cycleSpeed();
    $('next').onclick = () => this._playNext();
    $('dl').onclick = () => this._download();
    $('unzoom').onclick = () => this._resetZoom();
    $('prev').onload = () => { $('prev').classList.add('ok'); };
    $('prev').onerror = () => { $('prev').classList.remove('ok'); };
    const v = $('video');
    v.addEventListener('ended', () => { if (this._config.autoplay_next) this._playNext(true); });
    v.addEventListener('loadedmetadata', () => { v.playbackRate = this._speed; });
    this._setupZoom();
    if (this.isConnected) this._observe();
  }

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
  }

  _select(i) {
    if (i === this._idx) return;
    this._idx = i;
    this._rebuildCamera();
  }

  _rebuildCamera() {
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
  }

  /* ---------- Bild: Live-Stream oder letzter Schnappschuss ---------- */
  async _liveCard(entity) {
    const helpers = await window.loadCardHelpers();
    const el = helpers.createCardElement({
      type: 'picture-entity', entity, show_name: false, show_state: false,
      camera_view: 'live', fit_mode: 'contain', tap_action: { action: 'none' }, hold_action: { action: 'none' },
    });
    el.hass = this._hass;
    return el;
  }

  async _makePic() {
    const token = (this._picToken = Symbol());
    const host = this.$('pic'), grid = this.$('grid');
    this._pics = [];
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
    }
  }

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
  }

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
    this._makePic();
    // Kamera ist gerade wach: aktuelles Bild als Vorschau übernehmen
    if (this._grid) this._cams.forEach((_, i) => this._loadSnap(i, true));
    else this._loadSnap(this._idx, true);
    if (!silent) this._update();
  }

  _fullscreen() {
    const el = this.$('stage');
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen();
    else if (this.$('video').webkitEnterFullscreen && this._playing) this.$('video').webkitEnterFullscreen();
  }

  _setMode(m) {
    this._mode = m;
    if (m === 'play' && this._grid) { this._grid = false; this._makePic(); }
    if (m === 'play' && !this._days) this._loadDays();
    if (m === 'play' && this._live) this._stopLive(true);
    this._update();
    this._autoLive();
  }

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
  }

  _toast(t) {
    const el = this.$('toast');
    el.style.setProperty('--c', t.color);
    el.innerHTML = `<ha-icon icon="${t.icon}"></ha-icon><span>${esc(t.text)}</span>`;
    el.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => el.classList.remove('show'), (+this._config.alert_seconds || 8) * 1000);
  }

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
  }

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
  }

  _resetZoom() { this._zoom = { s: 1, x: 0, y: 0 }; if (this._built) this._applyZoom(); }

  /* ---------- Steuerung ---------- */
  _call(domain, service, entity_id, data = {}) {
    return this._hass.callService(domain, service, { entity_id, ...data });
  }

  _controls() {
    const c = this._cam, items = [];
    const siren = this._e('siren'), light = this._e('light'), mrec = this._e('manual_rec');
    items.push({ id: 'talk', icon: 'mdi:microphone-outline', label: this._t('talk'), run: () => this._talk() });
    if (this._st(siren)) items.push({ id: 'siren', icon: 'mdi:alarm-light-outline', label: this._t('siren'), on: this._on(siren), warn: true,
      run: () => (this._on(siren) ? this._call('siren', 'turn_off', siren)
        : (confirm(this._t('siren_confirm', { name: c.name })) && this._call('siren', 'turn_on', siren))) });
    if (this._st(light)) items.push({ id: 'light', icon: 'mdi:flashlight', label: this._t('spotlight'), on: this._on(light),
      run: () => this._call('light', 'toggle', light) });
    if (this._st(mrec)) items.push({ id: 'rec', icon: 'mdi:video-outline', label: this._t('record'), on: this._on(mrec),
      run: () => this._call('switch', 'toggle', mrec) });
    items.push({ id: 'snap', icon: 'mdi:camera-outline', label: this._t('snapshot'), run: () => this._snapshot() });
    if (this._qAvail().length && !this._grid) items.push({ id: 'q', icon: Q[this._quality].icon,
      label: `${this._t('quality')}: ${this._t(Q[this._quality].key)}`, on: this._qOpen,
      run: () => { this._qOpen = !this._qOpen; this._update(); } });
    return items;
  }

  /* Gegensprechen: Reolink bietet keinen Deep-Link auf eine bestimmte Kamera; die App öffnet die zuletzt genutzte */
  _talk() {
    const ua = navigator.userAgent;
    const android = /android/i.test(ua);
    const companion = android && (/Home ?Assistant/i.test(ua) || !!window.externalApp);
    const url = this._cam.talk_url || this._config.talk_url
      || (companion ? REOLINK_COMPANION : android ? REOLINK_CHROME : null);
    if (!url) { alert(this._t('no_talk_url')); return; }
    this._stopLive();
    this._openLink(url);
  }

  _openLink(url, download) {
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noreferrer';
    if (download) a.download = download;
    a.style.display = 'none';
    this.shadowRoot.appendChild(a);
    a.click();
    a.remove();
  }

  _stamp() { return new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-'); }

  _snapshot() {
    const want = this._qEntity(this._quality);
    const id = this._st(want) ? want : this._e('cam_sd');
    const s = this._st(id);
    if (!s) return;
    this._openLink(this._hass.hassUrl(`/api/camera_proxy/${id}?token=${s.attributes.access_token}`), `${this._cam.name}_${this._stamp()}.jpg`);
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
      if (!camNode) throw new Error(this._t('cam_not_found'));
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
    return { node: k, start, dur, type: types[0] || 'other', types: types.length ? types : ['other'],
      time: tm ? `${tm[1].padStart(2, '0')}:${tm[2]}:${tm[3]}` : t };
  }

  get _visibleFiles() {
    return Array.isArray(this._files) ? this._files.filter((f) => this._filter === 'all' || f.types.includes(this._filter)) : [];
  }

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
      alert(`${this._t('play_error')}: ${e.message || e}`);
    }
    this._update();
  }

  _playNext(auto) {
    const files = this._visibleFiles;
    const i = files.findIndex((f) => this._playing && f.node.media_content_id === this._playing.node.media_content_id);
    if (i >= 0 && i + 1 < files.length) this._play(files[i + 1]);
    else if (auto) this._stopPlayback();
  }

  _cycleSpeed() {
    this._speed = SPEEDS[(SPEEDS.indexOf(this._speed) + 1) % SPEEDS.length];
    this.$('video').playbackRate = this._speed;
    this._update();
  }

  _download() {
    if (!this._playUrl || !this._playing) return;
    const day = this._days && this._days[this._dayIdx] && this._days[this._dayIdx].date;
    const d = day ? `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}` : '';
    this._openLink(this._playUrl, `${this._cam.name}_${d}_${this._playing.time.replace(/:/g, '-')}.mp4`);
  }

  _stopPlayback(silent) {
    const v = this.$ && this.$('video');
    if (v) { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (_) { /* ignorieren */ } }
    if (!this._playing) return;
    this._playing = null; this._playUrl = null;
    if (!silent) { this._update(); this._autoLive(); }
  }

  /* ---------- Rendering ---------- */
  _renderTabs() {
    if (!this._built) return;
    const box = this.$('tabs');
    box.innerHTML = '';
    this._cams.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'tab';
      b.dataset.i = i;
      b.innerHTML = `<span class="dot"></span><span class="tn">${esc(c.name)}</span><span class="tb"></span>`;
      b.onclick = () => { if (this._grid) this._setGrid(false); this._select(i); };
      box.appendChild(b);
    });
  }

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
  }

  _renderDays() {
    const box = this.$('days');
    box.innerHTML = '';
    if (!Array.isArray(this._days)) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const loc = this._lang === 'de' ? 'de-CH' : undefined;
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
  }

  _batteryIcon(cam) {
    const v = this._num(this._e('battery', cam));
    if (v === null) return null;
    const lvl = Math.max(10, Math.min(100, Math.round(v / 10) * 10));
    const charging = /^charg|lade/i.test((this._st(this._e('battery_state', cam)) || {}).state || '');
    return { v: Math.round(v), charging, icon: `mdi:battery${charging ? '-charging' : ''}${lvl === 100 ? '' : '-' + lvl}` };
  }

  _camDot(cam) {
    const camSt = this._st(this._e('cam_sd', cam));
    return !camSt || camSt.state === 'unavailable' ? 'off' : this._det(cam).length ? 'alert' : this._on(this._e('sleep', cam)) ? 'sleep' : 'on';
  }

  _update() {
    if (!this._built || !this._hass) return;
    const $ = this.$, c = this._cam, root = this.shadowRoot;
    const playing = !!this._playing;

    // Kopf: Tabs & Rasterknopf
    root.querySelectorAll('.tab').forEach((b) => {
      const cam = this._cams[+b.dataset.i];
      b.classList.toggle('sel', !this._grid && +b.dataset.i === this._idx);
      const bat = this._batteryIcon(cam);
      b.querySelector('.tb').textContent = bat ? `${bat.v}%` : '';
      b.querySelector('.dot').className = `dot ${this._camDot(cam)}`;
    });
    const gb = $('gridbtn');
    gb.style.display = this._cams.length > 1 ? '' : 'none';
    gb.classList.toggle('sel', this._grid);
    gb.title = this._grid ? this._t('single') : this._t('grid');
    gb.querySelector('ha-icon').setAttribute('icon', this._grid ? 'mdi:checkbox-blank-outline' : 'mdi:view-grid-outline');

    this._updateHub();
    this._updateWarnings();

    // Bühne
    $('stage').classList.toggle('playing', playing);
    $('stage').classList.toggle('live', this._live);
    $('stage').classList.toggle('gridmode', this._grid);
    $('stage').classList.toggle('haspic', !!this._snaps[this._idx]);
    if (this._snaps[this._idx] && $('prev').getAttribute('src') !== this._snaps[this._idx].url) $('prev').src = this._snaps[this._idx].url;

    const snap = this._snaps[this._idx];
    const tm = snap ? snap.time.toLocaleTimeString(this._lang === 'de' ? 'de-CH' : undefined, { hour: '2-digit', minute: '2-digit' }) : '';
    $('badge').innerHTML = playing ? `<ha-icon icon="mdi:history"></ha-icon>${esc(this._playing.time)}`
      : this._live ? '<i class="rec"></i>LIVE'
        : this._on(this._e('sleep')) ? `<ha-icon icon="mdi:sleep"></ha-icon>${this._t('sleeping')}${tm ? ' · ' + tm : ''}`
          : `${this._t('paused')}${tm ? ' · ' + this._t('preview_at', { time: tm }) : ''}`;

    let stat = '';
    if (!this._grid) {
      const w = this._num(this._e('wifi'));
      if (w !== null) {
        // Reolink liefert je nach Gerät 0–4 Balken oder dBm (negativ)
        const bars = w < 0 ? (w >= -55 ? 4 : w >= -65 ? 3 : w >= -75 ? 2 : 1) : Math.max(1, Math.min(4, Math.round(w)));
        stat += `<span class="pill" title="WLAN ${w < 0 ? w + ' dBm' : bars + '/4'}"><ha-icon icon="mdi:wifi-strength-${bars}"></ha-icon></span>`;
      }
      const bat = this._batteryIcon(c);
      if (bat) stat += `<span class="pill ${bat.v <= this._config.battery_warning && !bat.charging ? 'low' : ''}"><ha-icon icon="${bat.icon}"></ha-icon>${bat.v}%</span>`;
    }
    $('stat').innerHTML = stat;

    const active = this._grid ? [] : this._det(c);
    $('det').innerHTML = active.map((k) => `<span class="pill det" style="--c:${EVT[k].color}"><ha-icon icon="${EVT[k].icon}"></ha-icon>${this._t(`evt_${k}`)}</span>`).join('');

    // Raster-Zellen
    root.querySelectorAll('.cell').forEach((cell) => {
      const cam = this._cams[+cell.dataset.i];
      const bat = this._batteryIcon(cam);
      cell.querySelector('.cb').textContent = bat ? ` · ${bat.v}%` : '';
      cell.querySelector('.dot').className = `dot ${this._camDot(cam)}`;
      cell.classList.toggle('alert', this._det(cam).length > 0);
    });

    const timed = this._live && !!this._liveEnds;
    const left = timed ? Math.max(0, Math.ceil((this._liveEnds - Date.now()) / 1000)) : 0;
    $('timer').textContent = timed ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : '';
    $('timer').style.display = timed ? '' : 'none';
    $('stop').style.display = this._live || playing ? '' : 'none';
    $('stop').title = this._t('stop_live');
    $('fs').title = this._t('fullscreen');
    $('bigplay').title = this._t('start_live');
    $('bigplay').style.display = this._live || playing || this._mode !== 'live' ? 'none' : '';
    $('speed').style.display = playing ? '' : 'none';
    $('speed').textContent = `${this._speed}×`;
    $('speed').title = this._t('speed');
    const files = this._visibleFiles;
    const pi = playing ? files.findIndex((f) => f.node.media_content_id === this._playing.node.media_content_id) : -1;
    $('next').style.display = playing && pi >= 0 && pi + 1 < files.length ? '' : 'none';
    $('next').title = this._t('next');
    $('dl').style.display = playing && this._playUrl ? '' : 'none';
    $('dl').title = this._t('download');
    $('unzoom').title = this._t('reset_zoom');
    this._applyZoom();

    // Modus
    $('m-live').textContent = this._t('live');
    $('m-play').textContent = this._t('playback');
    $('more-l').textContent = this._t('settings');
    $('m-live').classList.toggle('sel', this._mode === 'live');
    $('m-play').classList.toggle('sel', this._mode === 'play');
    $('pane-live').style.display = this._mode === 'live' ? '' : 'none';
    $('pane-play').style.display = this._mode === 'play' ? '' : 'none';

    if (this._mode === 'live') this._updateLivePane();
    else this._updatePlayPane();
  }

  _updateHub() {
    const box = this.$('hub');
    const scene = this._config.show_hub ? this._hubE('scene') : null;
    const storage = this._config.show_hub ? this._hubE('storage') : null;
    const s = this._st(scene), sd = this._num(storage);
    if (!s && sd === null) { box.style.display = 'none'; return; }
    box.style.display = '';
    const opts = s ? (s.attributes.options || []).filter((o) => o !== 'off') : [];
    const icons = { disarm: 'mdi:shield-off-outline', home: 'mdi:home-outline', away: 'mdi:shield-lock-outline' };
    const sig = `${this._lang}|${opts.join()}|${s ? s.state : ''}|${sd === null ? '' : Math.round(sd)}`;
    if (box.dataset.sig === sig) return;
    box.dataset.sig = sig;
    box.innerHTML = `${opts.length ? `<div class="scene">${opts.map((o) => `<button data-o="${esc(o)}" class="${s.state === o ? 'sel' : ''}">
      <ha-icon icon="${icons[o] || 'mdi:shield-outline'}"></ha-icon><span>${esc(STR[this._lang][`scene_${o}`] ? this._t(`scene_${o}`) : (this._hass.formatEntityState ? this._hass.formatEntityState(s, o) : o))}</span></button>`).join('')}</div>` : ''}
      ${sd !== null ? `<span class="sd"><ha-icon icon="mdi:micro-sd"></ha-icon>${this._t('sd', { v: sd < 10 ? sd.toFixed(1) : Math.round(sd) })}</span>` : ''}`;
    box.querySelectorAll('.scene button').forEach((b) => {
      b.onclick = () => { if (b.dataset.o !== s.state) this._call('select', 'select_option', scene, { option: b.dataset.o }); };
    });
  }

  _updateWarnings() {
    const cfg = this._config, warns = [];
    this._cams.forEach((cam) => {
      const bat = this._batteryIcon(cam);
      if (bat && cfg.battery_warning > 0 && bat.v <= cfg.battery_warning && !bat.charging) warns.push({ icon: 'mdi:battery-alert-variant-outline', text: this._t('bat_low', { name: cam.name, v: bat.v }) });
      const tmp = this._num(this._e('battery_temp', cam));
      if (tmp !== null && cfg.temperature_warning !== false && tmp >= cfg.temperature_warning) warns.push({ icon: 'mdi:thermometer-alert', text: this._t('temp_high', { name: cam.name, v: Math.round(tmp) }) });
      if (tmp !== null && cfg.temperature_low_warning !== false && tmp <= cfg.temperature_low_warning) warns.push({ icon: 'mdi:snowflake-alert', text: this._t('temp_low', { name: cam.name, v: Math.round(tmp) }) });
    });
    const box = this.$('warns');
    const sig = warns.map((w) => w.text).join('|');
    if (box.dataset.sig === sig) return;
    box.dataset.sig = sig;
    box.innerHTML = warns.map((w) => `<div class="warn"><ha-icon icon="${w.icon}"></ha-icon><span>${esc(w.text)}</span></div>`).join('');
  }

  _updateLivePane() {
    const $ = this.$;
    const ctrls = this._controls();
    const sig = ctrls.map((x) => x.id).join();
    if ($('ctrls').dataset.sig !== sig) {
      $('ctrls').dataset.sig = sig;
      $('ctrls').innerHTML = ctrls.map((x) => `<button class="tbn" data-id="${x.id}"><ha-icon></ha-icon></button>`).join('');
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
      const qsig = `${this._idx}|${this._quality}|${avail.join()}|${this._lang}`;
      if (qm.dataset.sig !== qsig) {
        qm.dataset.sig = qsig;
        qm.innerHTML = Q_ORDER.map((q) => `<button class="qopt${q === this._quality ? ' sel' : ''}" data-q="${q}"${avail.includes(q) ? '' : ' disabled'}>
          <ha-icon icon="${Q[q].icon}"></ha-icon><span>${this._t(Q[q].key)}</span>${avail.includes(q) ? (q === this._quality ? '<ha-icon class="chk" icon="mdi:check"></ha-icon>' : '') : `<small>${this._t('not_enabled')}</small>`}</button>`).join('');
        qm.querySelectorAll('.qopt:not([disabled])').forEach((el) => { el.onclick = () => this._setQuality(el.dataset.q); });
      }
    }

    $('chev').setAttribute('icon', this._settingsOpen ? 'mdi:chevron-up' : 'mdi:chevron-down');
    const box = $('settings');
    box.style.display = this._settingsOpen ? '' : 'none';
    if (this._settingsOpen) this._updateSettings(box);
  }

  /* ---------- Einstellungen: gruppiert, mit Reglern ---------- */
  _settingGroups() {
    return SETTINGS.map((g) => ({ ...g, items: g.items.map(([key, type, icon, btn, confirmKey]) => ({ key, type, icon, btn, confirmKey, id: this._e(key) }))
      .filter((it) => this._st(it.id)) })).filter((g) => g.items.length);
  }

  _updateSettings(box) {
    const groups = this._settingGroups();
    if (!this._group || !groups.some((g) => g.g === this._group)) this._group = groups.length ? groups[0].g : null;
    const sig = `${this._idx}|${this._lang}|${this._group}|${groups.map((g) => g.g + ':' + g.items.map((i) => i.key).join(',')).join(';')}`;
    if (box.dataset.sig !== sig) {
      box.dataset.sig = sig;
      box.innerHTML = groups.map((g) => `<div class="grp${g.g === this._group ? ' open' : ''}">
        <button class="gh" data-g="${g.g}"><ha-icon icon="${g.icon}"></ha-icon><span>${this._t(g.g)}</span><ha-icon class="gc" icon="mdi:chevron-${g.g === this._group ? 'up' : 'down'}"></ha-icon></button>
        ${g.g === this._group ? `<div class="gb">${g.items.map((it) => this._rowHtml(it)).join('')}</div>` : ''}</div>`).join('');
      box.querySelectorAll('.gh').forEach((b) => { b.onclick = () => { this._group = this._group === b.dataset.g ? '' : b.dataset.g; this._update(); }; });
      groups.forEach((g) => g.items.forEach((it) => this._bindRow(box, it)));
    }
    groups.forEach((g) => g.items.forEach((it) => this._syncRow(box, it)));
  }

  _rowHtml(it) {
    const ctl = it.type === 'sw' ? '<ha-switch></ha-switch>'
      : it.type === 'btn' ? `<button class="rowbtn">${this._t(it.btn)}</button>`
        : it.type === 'sel' ? '<select></select>'
          : '<span class="nv"></span>';
    const slider = it.type === 'num' ? '<input type="range" class="rng">' : '';
    return `<div class="row ${it.type}" data-k="${it.key}"><ha-icon icon="${it.icon}"></ha-icon><span class="rl">${this._t(it.key)}</span>${ctl}${slider}</div>`;
  }

  _bindRow(box, it) {
    const row = box.querySelector(`.row[data-k="${it.key}"]`);
    if (!row) return;
    const domain = it.id.split('.')[0];
    if (it.type === 'sw') row.querySelector('ha-switch').addEventListener('change', (e) => {
      const want = e.target.checked;
      this._call(domain, want ? 'turn_on' : 'turn_off', it.id);
    });
    else if (it.type === 'btn') row.querySelector('.rowbtn').onclick = () => {
      if (it.confirmKey && !confirm(this._t(it.confirmKey, { name: this._cam.name }))) return;
      this._call('button', 'press', it.id);
    };
    else if (it.type === 'sel') row.querySelector('select').onchange = (e) => this._call('select', 'select_option', it.id, { option: e.target.value });
    else if (it.type === 'num') {
      const r = row.querySelector('.rng');
      r.addEventListener('input', () => { row.querySelector('.nv').textContent = r.value; row.dataset.drag = '1'; });
      r.addEventListener('change', () => { delete row.dataset.drag; this._call('number', 'set_value', it.id, { value: +r.value }); });
    }
  }

  _syncRow(box, it) {
    const row = box.querySelector(`.row[data-k="${it.key}"]`);
    const s = this._st(it.id);
    if (!row || !s) return;
    row.classList.toggle('na', s.state === 'unavailable');
    if (it.type === 'sw') row.querySelector('ha-switch').checked = s.state === 'on';
    else if (it.type === 'sel') {
      const sel = row.querySelector('select');
      const opts = s.attributes.options || [];
      if (sel.dataset.o !== opts.join()) {
        sel.dataset.o = opts.join();
        sel.innerHTML = opts.map((o) => `<option value="${esc(o)}">${esc(this._hass.formatEntityState ? this._hass.formatEntityState(s, o) : o)}</option>`).join('');
      }
      sel.value = s.state;
    } else if (it.type === 'num' && !row.dataset.drag) {
      const r = row.querySelector('.rng');
      const a = s.attributes;
      r.min = a.min ?? 0; r.max = a.max ?? 100; r.step = a.step ?? 1;
      r.value = s.state;
      row.querySelector('.nv').textContent = isNaN(+s.state) ? s.state : `${+s.state}${a.unit_of_measurement ? ' ' + a.unit_of_measurement : ''}`;
    }
  }

  _updatePlayPane() {
    const $ = this.$;
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
  }
}

/* Reolink-Kameras in Home Assistant finden (für Editor und Vorschlag) */
function detectCameras(hass) {
  if (!hass) return [];
  const out = [];
  Object.keys(hass.states).forEach((id) => {
    const m = id.match(/^camera\.(.+)_(standardauflosung|fluent)$/);
    if (!m || /_(schnappschusse_in|snapshots)$/.test(m[1])) return;
    const fn = String(hass.states[id].attributes.friendly_name || m[1]);
    out.push({ prefix: m[1], name: fn.replace(/\s*(Standardauflösung|Fluent)$/i, '').trim() || m[1] });
  });
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/* ======================================================================= */
/* Visueller Editor                                                        */
const ED_LABELS = {
  de: {
    default_quality: 'Startqualität', live_timeout: 'Live-Limit (Sekunden, 0 = kein Limit)', auto_live: 'Live automatisch starten',
    auto_switch: 'Bei Erkennung zur Kamera springen', autoplay_next: 'Nächsten Clip automatisch abspielen',
    battery_warning: 'Akku-Warnung ab (%)', temperature_warning: 'Temperatur-Warnung ab (°C)', show_hub: 'Hub anzeigen (Szenenmodus, SD-Karte)',
    hub_prefix: 'Hub-Präfix', language: 'Sprache', prefix: 'Kamera', name: 'Anzeigename', media_name: 'Name in der Medienquelle (für Wiedergabe)',
    cameras: 'Kameras', add: 'Kamera hinzufügen', remove: 'Entfernen', up: 'Nach oben', auto: 'Automatisch', options: 'Optionen',
  },
  en: {
    default_quality: 'Start quality', live_timeout: 'Live limit (seconds, 0 = no limit)', auto_live: 'Start live automatically',
    auto_switch: 'Jump to camera on detection', autoplay_next: 'Autoplay next clip',
    battery_warning: 'Battery warning at (%)', temperature_warning: 'Temperature warning at (°C)', show_hub: 'Show hub (scene mode, SD card)',
    hub_prefix: 'Hub prefix', language: 'Language', prefix: 'Camera', name: 'Display name', media_name: 'Name in the media source (for playback)',
    cameras: 'Cameras', add: 'Add camera', remove: 'Remove', up: 'Move up', auto: 'Automatic', options: 'Options',
  },
};

class ReolinkAppCardEditor extends HTMLElement {
  setConfig(config) { this._config = { ...config, cameras: [...(config.cameras || [])] }; this._render(); }
  set hass(hass) { const first = !this._hass; this._hass = hass; if (first) this._render(); else this._forms().forEach((f) => { f.hass = hass; }); }
  get _l() { const l = (this._hass && ((this._hass.locale && this._hass.locale.language) || this._hass.language)) || 'de'; return String(l).startsWith('de') ? ED_LABELS.de : ED_LABELS.en; }
  _forms() { return this.shadowRoot ? [...this.shadowRoot.querySelectorAll('ha-form')] : []; }

  async connectedCallback() {
    if (!customElements.get('ha-form') && window.loadCardHelpers) {
      // Stellt sicher, dass ha-form geladen ist (Trick über den Editor einer Standardkarte)
      try { const h = await window.loadCardHelpers(); const c = await h.createCardElement({ type: 'entities', entities: [] }); if (c && c.constructor.getConfigElement) await c.constructor.getConfigElement(); } catch (_) { /* ignorieren */ }
      this._render();
    }
  }

  _changed(cfg) {
    this._config = cfg;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: cfg }, bubbles: true, composed: true }));
  }

  _render() {
    if (!this._config || !this._hass) return;
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    const L = this._l;
    const detected = detectCameras(this._hass);
    const camOpts = detected.map((c) => ({ value: c.prefix, label: `${c.name} (${c.prefix})` }));
    const general = [
      { name: 'default_quality', selector: { select: { mode: 'dropdown', options: Q_ORDER.map((q) => ({ value: q, label: (STR[this._l === ED_LABELS.de ? 'de' : 'en'])[Q[q].key] })) } } },
      { name: 'live_timeout', selector: { number: { min: 0, max: 3600, step: 30, mode: 'box', unit_of_measurement: 's' } } },
      { type: 'grid', name: '', schema: [
        { name: 'auto_live', selector: { boolean: {} } },
        { name: 'auto_switch', selector: { boolean: {} } },
        { name: 'autoplay_next', selector: { boolean: {} } },
        { name: 'show_hub', selector: { boolean: {} } },
      ] },
      { type: 'grid', name: '', schema: [
        { name: 'battery_warning', selector: { number: { min: 0, max: 100, step: 5, mode: 'box', unit_of_measurement: '%' } } },
        { name: 'temperature_warning', selector: { number: { min: 20, max: 80, step: 1, mode: 'box', unit_of_measurement: '°C' } } },
      ] },
      { name: 'hub_prefix', selector: { text: {} } },
      { name: 'language', selector: { select: { mode: 'dropdown', options: [{ value: 'auto', label: L.auto }, { value: 'de', label: 'Deutsch' }, { value: 'en', label: 'English' }] } } },
    ];
    const camSchema = [
      { name: 'prefix', required: true, selector: { select: { mode: 'dropdown', custom_value: true, options: camOpts } } },
      { type: 'grid', name: '', schema: [{ name: 'name', selector: { text: {} } }, { name: 'media_name', selector: { text: {} } }] },
    ];
    const defaults = { default_quality: 'fluent', live_timeout: 300, auto_live: true, auto_switch: true, autoplay_next: true, show_hub: true, battery_warning: 20, temperature_warning: 45, hub_prefix: 'reolink_hub', language: 'auto' };
    this.shadowRoot.innerHTML = `<style>
      .cams { display: flex; flex-direction: column; gap: 12px; margin: 8px 0 20px; }
      .cam { border: 1px solid var(--divider-color); border-radius: 12px; padding: 12px; }
      .ch { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 500; }
      .ch span { flex: 1; }
      h3 { margin: 16px 0 6px; font-size: 15px; font-weight: 500; }
      button { font: inherit; cursor: pointer; border-radius: 8px; border: 1px solid var(--divider-color); background: none; color: inherit; padding: 6px 10px; }
      .add { width: 100%; padding: 10px; color: var(--primary-color); border-style: dashed; }
    </style>
    <h3>${L.cameras}</h3><div class="cams" id="cams"></div><button class="add" id="add">+ ${L.add}</button>
    <h3>${L.options}</h3><div id="gen"></div>`;
    const label = (s) => L[s.name] || s.name;

    const cams = this.shadowRoot.getElementById('cams');
    this._config.cameras.forEach((cam, i) => {
      const box = document.createElement('div');
      box.className = 'cam';
      box.innerHTML = `<div class="ch"><span>${esc(cam.name || cam.prefix || '—')}</span>${i ? `<button data-a="up" title="${L.up}">↑</button>` : ''}<button data-a="rm">${L.remove}</button></div>`;
      const form = document.createElement('ha-form');
      form.hass = this._hass; form.schema = camSchema; form.data = cam; form.computeLabel = label;
      form.addEventListener('value-changed', (e) => {
        const v = { ...e.detail.value };
        const hit = detected.find((d) => d.prefix === v.prefix);
        if (hit && v.prefix !== cam.prefix) { if (!v.name) v.name = hit.name; if (!v.media_name) v.media_name = hit.name; }
        Object.keys(v).forEach((k) => { if (v[k] === '' || v[k] === undefined) delete v[k]; });
        const list = [...this._config.cameras]; list[i] = v;
        this._changed({ ...this._config, cameras: list });
        if (hit && v.prefix !== cam.prefix) this._render();
      });
      box.appendChild(form);
      box.querySelectorAll('button').forEach((b) => {
        b.onclick = () => {
          const list = [...this._config.cameras];
          if (b.dataset.a === 'rm') list.splice(i, 1);
          else [list[i - 1], list[i]] = [list[i], list[i - 1]];
          this._changed({ ...this._config, cameras: list });
          this._render();
        };
      });
      cams.appendChild(box);
    });
    this.shadowRoot.getElementById('add').onclick = () => {
      const used = this._config.cameras.map((c) => c.prefix);
      const next = detected.find((d) => !used.includes(d.prefix));
      const cam = next ? { name: next.name, prefix: next.prefix, media_name: next.name } : { prefix: '' };
      this._changed({ ...this._config, cameras: [...this._config.cameras, cam] });
      this._render();
    };

    const gen = document.createElement('ha-form');
    gen.hass = this._hass; gen.schema = general; gen.computeLabel = label;
    const data = { ...defaults };
    Object.keys(defaults).forEach((k) => { if (this._config[k] !== undefined) data[k] = this._config[k]; });
    gen.data = data;
    gen.addEventListener('value-changed', (e) => {
      const v = e.detail.value, cfg = { ...this._config };
      Object.keys(defaults).forEach((k) => { if (v[k] === undefined || v[k] === defaults[k]) delete cfg[k]; else cfg[k] = v[k]; });
      this._changed(cfg);
    });
    this.shadowRoot.getElementById('gen').appendChild(gen);
  }
}

/* ======================================================================= */
const RAC_CSS = `
:host { --ra: var(--reolink-accent, #1e8bff); --rb: var(--ha-card-background, var(--card-background-color)); }
ha-card { overflow: hidden; padding-bottom: 8px; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.top { display: flex; align-items: center; gap: 6px; padding: 10px 10px 8px; }
.tabs { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; flex: 1; }
.tab { display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 18px; background: var(--secondary-background-color); white-space: nowrap; font-size: 14px; }
.tab.sel { background: var(--ra); color: #fff; }
.tab .tb { opacity: .75; font-size: 12px; }
.gridbtn { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: var(--secondary-background-color); flex: none; }
.gridbtn.sel { background: var(--ra); color: #fff; }
.gridbtn ha-icon { --mdc-icon-size: 20px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #3ccf8e; flex: none; display: inline-block; }
.dot.sleep { background: #9aa4b2; } .dot.off { background: #555; } .dot.alert { background: #ff5b5b; animation: pulse 1s infinite; }
.hub { display: flex; align-items: center; gap: 8px; padding: 0 10px 8px; flex-wrap: wrap; }
.scene { display: flex; gap: 2px; padding: 3px; border-radius: 12px; background: var(--secondary-background-color); flex: 1; min-width: 230px; }
.scene button { flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 6px 4px; border-radius: 9px; font-size: 13px; opacity: .75; }
.scene button ha-icon { --mdc-icon-size: 17px; }
.scene button.sel { background: var(--rb); color: var(--ra); opacity: 1; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.sd { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; }
.sd ha-icon { --mdc-icon-size: 16px; }
.warns:empty { display: none; }
.warns { display: flex; flex-direction: column; gap: 4px; padding: 0 10px 8px; }
.warn { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 10px; font-size: 13px; color: #ff9f43; background: color-mix(in srgb, #ff9f43 14%, transparent); }
.warn ha-icon { --mdc-icon-size: 18px; }
.stage { position: relative; background: #000; aspect-ratio: 16/9; overflow: hidden; border-radius: 0; touch-action: pan-y; user-select: none; -webkit-user-select: none;
  /* Eckige Kamerabild-Fläche: Variablen wirken bis in die eingebettete Bildkarte (Shadow DOM) */
  --ha-card-border-radius: 0px; --ha-card-border-width: 0px; --ha-card-box-shadow: none; }
.stage.zoomed { touch-action: none; cursor: grab; }
.stage:fullscreen { aspect-ratio: auto; }
.stage.gridmode { aspect-ratio: auto; min-height: 120px; }
.media { position: absolute; inset: 0; transform-origin: 0 0; will-change: transform; }
.stage.gridmode .media { display: none; }
.prev { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; opacity: 0; transition: opacity .3s; pointer-events: none; -webkit-user-drag: none; }
.prev.ok { opacity: 1; }
.stage.live .media > .prev { opacity: 0; }
.pic, .pic > * { position: absolute; inset: 0; }
.pic ha-card, .pic hui-picture-entity-card { height: 100%; border-radius: 0; border: 0; box-shadow: none; background: transparent; }
video { position: absolute; inset: 0; width: 100%; height: 100%; background: #000; display: none; border-radius: 0; }
.stage.playing video { display: block; } .stage.playing .pic, .stage.playing .media > .prev { display: none; }
.grid { display: none; }
.stage.gridmode .grid { display: grid; grid-template-columns: repeat(var(--cols, 2), 1fr); gap: 2px; }
.cell { position: relative; aspect-ratio: 16/9; background: #111; overflow: hidden; cursor: pointer; }
.cell::after { content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 2; transition: box-shadow .2s; }
.cell.alert::after { box-shadow: inset 0 0 0 3px #ff5b5b; }
.cell .cl { z-index: 3; }
.cell .cl { position: absolute; left: 6px; bottom: 6px; display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 10px; background: rgba(0,0,0,.55); color: #fff; font-size: 11px; font-weight: 600; }
.ov { position: absolute; left: 8px; right: 8px; display: flex; gap: 6px; align-items: center; pointer-events: none; }
.ov > *, .ov .pillrow > * { pointer-events: auto; }
.ov.top { top: 8px; justify-content: space-between; }
.ov.det { top: 42px; flex-wrap: wrap; }
.ov.bottom { bottom: 8px; }
.stage.gridmode .ov.top, .stage.gridmode .ov.det, .stage.gridmode #fs { display: none; }
.stage.gridmode .ov.bottom { top: 8px; bottom: auto; }
.spacer { flex: 1; }
.pillrow { display: flex; gap: 6px; }
.pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 12px; background: rgba(0,0,0,.55); color: #fff; font-size: 12px; font-weight: 600; backdrop-filter: blur(4px); }
.pill:empty { display: none; }
.pill ha-icon { --mdc-icon-size: 16px; }
.pill.low { color: #ff8a80; }
.pill.btn.icon { padding: 5px; } .pill.btn.icon ha-icon { --mdc-icon-size: 20px; }
.pill.btn { min-height: 26px; }
.pill.det { background: var(--c); }
.stage.playing .ov.bottom { bottom: 56px; }
.toast { position: absolute; left: 50%; top: 12px; transform: translate(-50%, -150%); display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 18px; background: var(--c, #ff5b5b); color: #fff; font-size: 13px; font-weight: 600; box-shadow: 0 4px 14px rgba(0,0,0,.35); transition: transform .3s, opacity .3s, visibility .3s; z-index: 4; white-space: nowrap; pointer-events: none; opacity: 0; visibility: hidden; }
.toast.show { transform: translate(-50%, 0); opacity: 1; visibility: visible; }
.toast ha-icon { --mdc-icon-size: 18px; }
.rec { width: 8px; height: 8px; border-radius: 50%; background: #ff3b30; animation: pulse 1.2s infinite; }
@keyframes pulse { 50% { opacity: .3; } }
.bigplay { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 64px; height: 64px; border-radius: 50%; background: rgba(0,0,0,.5); color: #fff; display: grid; place-items: center; backdrop-filter: blur(4px); }
.bigplay ha-icon { --mdc-icon-size: 38px; }
.seg { display: flex; margin: 10px 10px 4px; padding: 3px; border-radius: 10px; background: var(--secondary-background-color); }
.seg button { flex: 1; padding: 7px; border-radius: 8px; font-weight: 600; font-size: 14px; opacity: .7; }
.seg button.sel { background: var(--rb); opacity: 1; color: var(--ra); box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.barwrap { position: relative; padding: 10px 10px 4px; }
.bar { display: flex; justify-content: space-around; align-items: center; gap: 2px; padding: 8px 10px; border-radius: 30px; background: #1f1f21; border: 1px solid rgba(255,255,255,.08); }
.tbn { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; color: #f2f2f2; transition: background .2s, color .2s; }
.tbn ha-icon { --mdc-icon-size: 24px; }
.tbn.on { background: var(--ra); color: #fff; }
.tbn.warn { background: #ff3b30; color: #fff; }
.qmenu { position: absolute; right: 14px; bottom: calc(100% - 4px); min-width: 190px; padding: 6px; border-radius: 14px; background: #1f1f21; color: #f2f2f2; box-shadow: 0 8px 24px rgba(0,0,0,.4); z-index: 5; display: none; }
.qmenu.open { display: block; }
.qopt { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px; border-radius: 10px; font-size: 14px; text-align: left; }
.qopt ha-icon { --mdc-icon-size: 20px; }
.qopt.sel { color: var(--ra); }
.qopt .chk { margin-left: auto; }
.qopt[disabled] { opacity: .45; cursor: default; }
.qopt small { margin-left: auto; font-size: 11px; }
.more { display: flex; align-items: center; gap: 8px; width: calc(100% - 20px); margin: 6px 10px 0; padding: 8px 4px; border-top: 1px solid var(--divider-color); font-size: 14px; }
.more span { flex: 1; text-align: left; }
.more ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }
.settings { padding: 0 10px; display: flex; flex-direction: column; gap: 6px; }
.grp { border-radius: 12px; background: var(--secondary-background-color); overflow: hidden; }
.gh { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; font-size: 14px; font-weight: 600; text-align: left; }
.gh span { flex: 1; }
.gh ha-icon { --mdc-icon-size: 20px; }
.gc { color: var(--secondary-text-color); }
.gb { padding: 0 8px 6px; }
.row { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 12px; padding: 8px 4px; border-top: 1px solid var(--divider-color); }
.row.na { opacity: .5; }
.row ha-icon { color: var(--secondary-text-color); --mdc-icon-size: 20px; }
.rl { flex: 1; font-size: 14px; }
.nv { font-size: 13px; color: var(--secondary-text-color); min-width: 36px; text-align: right; }
.rng { width: 100%; margin: 2px 0 0 32px; accent-color: var(--ra); flex-basis: calc(100% - 32px); }
.row select { background: var(--rb); color: inherit; border: 0; border-radius: 8px; padding: 6px 8px; font: inherit; font-size: 13px; max-width: 50%; }
.rowbtn { padding: 6px 12px; border-radius: 8px; background: var(--rb); font-size: 13px; }
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
if (!customElements.get('reolink-app-card-editor')) customElements.define('reolink-app-card-editor', ReolinkAppCardEditor);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'reolink-app-card')) {
  window.customCards.push({ type: 'reolink-app-card', name: 'Reolink App Card', preview: false, documentationURL: 'https://github.com/niondevelop/reolink-app-card',
    description: 'Live, Steuerung und Wiedergabe im Stil der Reolink-App / Live view, controls and playback styled like the Reolink app' });
}
console.info(`%c REOLINK-APP-CARD %c ${RAC_VERSION} `, 'background:#1e8bff;color:#fff', '');
