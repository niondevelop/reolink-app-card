/* Reolink App Card – Live, Steuerung & Wiedergabe im Stil der Reolink-App */
const RAC_VERSION = '0.1.0';

/* ---------- Sprache ---------- */
const STR = {
  de: {
    live: 'Live', playback: 'Wiedergabe', settings: 'Einstellungen', paused: 'Pausiert', sleeping: 'Schlafmodus',
    start_live: 'Live starten', stop_live: 'Live beenden', fullscreen: 'Vollbild',
    ring_title: 'Es klingelt', answer: 'Annehmen', decline: 'Ablehnen', ptz: 'Schwenken & Neigen', ptz_presets: 'Positionen', zoom_in: 'Heranzoomen', zoom_out: 'Wegzoomen', ptz_stop: 'Stopp',
    ev_missing: 'Zu diesem Zeitpunkt gibt es keine Aufnahme', ev_wait: 'Aufnahme wird noch gespeichert …',
    sound_on: 'Ton einschalten', sound_off: 'Ton ausschalten', no_audio: 'Der Stream dieser Kamera enthält keinen Ton',
    talk: 'Sprechen', talk_app: 'Sprechen (öffnet die Reolink-App)', hang_up: 'Auflegen', siren: 'Ton-Alarm', siren_confirm: 'Ton-Alarm bei „{name}“ auslösen?',
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
    restart: 'Kamera neu starten', restart_btn: 'Neu starten', cancel: 'Abbrechen', siren_btn: 'Auslösen', restart_confirm: 'Kamera „{name}“ neu starten?',
    pir_sens: 'PIR-Empfindlichkeit', ai_person: 'KI-Empfindlichkeit Person', ai_vehicle: 'KI-Empfindlichkeit Fahrzeug',
    ai_animal: 'KI-Empfindlichkeit Tier', img_bright: 'Helligkeit', img_contrast: 'Kontrast', img_sat: 'Sättigung',
    img_sharp: 'Schärfe', anti_flicker: 'Anti-Flimmer', ir_bright: 'Infrarot-Helligkeit', fl_mode: 'Modus',
    fl_bright: 'Helligkeit beim Einschalten', volume: 'Lautstärke', post_rec: 'Nachaufzeichnung', rec_audio: 'Audio aufnehmen',
    siren_event: 'Sirene bei Ereignis', prealarm_event: 'Voralarm bei Ereignis', hub_ring_event: 'Hub-Klingelton bei Ereignis',
    need_cameras: 'Bitte „cameras“ definieren', need_prefix: 'Jede Kamera braucht „entity“ (oder „prefix“)',
    wifi: 'WLAN', camera: 'Kamera',
    talking: 'Gegensprechen', talk_connecting: 'Verbinde …', talk_failed: 'Gegensprechen fehlgeschlagen',
    talk_na_feature: 'Gegensprechen nicht verfügbar – in Home Assistant unter Einstellungen → System → Labs „Zwei-Wege-Audio“ aktivieren',
    talk_na_https: 'Gegensprechen braucht HTTPS – Home Assistant über https:// öffnen',
    talk_na_webrtc: 'Gegensprechen geht nur mit einem WebRTC-Stream', talk_denied: 'Kein Zugriff auf das Mikrofon – im Browser bzw. in der App erlauben',
  },
  en: {
    live: 'Live', playback: 'Playback', settings: 'Settings', paused: 'Paused', sleeping: 'Sleeping',
    start_live: 'Start live', stop_live: 'Stop live', fullscreen: 'Fullscreen',
    ring_title: 'Someone is ringing', answer: 'Answer', decline: 'Decline', ptz: 'Pan & tilt', ptz_presets: 'Positions', zoom_in: 'Zoom in', zoom_out: 'Zoom out', ptz_stop: 'Stop',
    ev_missing: 'There is no recording at this time', ev_wait: 'Recording is still being saved …',
    sound_on: 'Turn sound on', sound_off: 'Turn sound off', no_audio: 'This camera’s stream has no sound',
    talk: 'Talk', talk_app: 'Talk (opens the Reolink app)', hang_up: 'Hang up', siren: 'Siren', siren_confirm: 'Sound the siren on “{name}”?',
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
    restart: 'Restart camera', restart_btn: 'Restart', cancel: 'Cancel', siren_btn: 'Sound it', restart_confirm: 'Restart camera “{name}”?',
    pir_sens: 'PIR sensitivity', ai_person: 'AI sensitivity person', ai_vehicle: 'AI sensitivity vehicle',
    ai_animal: 'AI sensitivity animal', img_bright: 'Brightness', img_contrast: 'Contrast', img_sat: 'Saturation',
    img_sharp: 'Sharpness', anti_flicker: 'Anti-flicker', ir_bright: 'Infrared brightness', fl_mode: 'Mode',
    fl_bright: 'Turn-on brightness', volume: 'Volume', post_rec: 'Post-recording', rec_audio: 'Record audio',
    siren_event: 'Siren on event', prealarm_event: 'Pre-alarm on event', hub_ring_event: 'Hub ringtone on event',
    need_cameras: 'Please define “cameras”', need_prefix: 'Every camera needs an “entity” (or “prefix”)',
    wifi: 'Wi-Fi', camera: 'Camera',
    talking: 'Talking', talk_connecting: 'Connecting …', talk_failed: 'Two-way audio failed',
    talk_na_feature: 'Two-way audio not available – enable “Two-way audio” in Home Assistant under Settings → System → Labs',
    talk_na_https: 'Two-way audio needs HTTPS – open Home Assistant via https://',
    talk_na_webrtc: 'Two-way audio only works with a WebRTC stream', talk_denied: 'No access to the microphone – allow it in your browser or app',
  },
  fr: {
    live: 'Direct', playback: 'Lecture', settings: 'Réglages', paused: 'En pause', sleeping: 'En veille',
    start_live: 'Démarrer le direct', stop_live: 'Arrêter le direct', fullscreen: 'Plein écran',
    ring_title: 'On sonne', answer: 'Répondre', decline: 'Refuser', ptz: 'Orientation', ptz_presets: 'Positions', zoom_in: 'Zoom avant', zoom_out: 'Zoom arrière', ptz_stop: 'Arrêt',
    ev_missing: 'Aucun enregistrement à ce moment', ev_wait: 'Enregistrement en cours de sauvegarde …',
    sound_on: 'Activer le son', sound_off: 'Couper le son', no_audio: 'Le flux de cette caméra n’a pas de son',
    talk: 'Parler', talk_app: 'Parler (ouvre l’app Reolink)', hang_up: 'Raccrocher', siren: 'Sirène', siren_confirm: 'Déclencher la sirène sur « {name} » ?',
    spotlight: 'Projecteur', record: 'Enregistrer', snapshot: 'Capture', quality: 'Qualité',
    q_fluent: 'Fluide', q_balanced: 'Équilibrée', q_clear: 'Nette', not_enabled: 'non activé',
    no_talk_url: 'Aucun lien vers l’app Reolink n’est configuré sur cet appareil (option « talk_url »).',
    grid: 'Toutes les caméras', single: 'Vue unique', detected: '{type} détecté(e) · {name}',
    evt_person: 'Personne', evt_vehicle: 'Véhicule', evt_animal: 'Animal', evt_motion: 'Mouvement', evt_other: 'Enregistrement',
    all: 'Tous', today: 'Aujourd’hui', yesterday: 'Hier', loading: 'Chargement des enregistrements …', loading_day: 'Chargement du jour …',
    no_rec: 'Aucun enregistrement trouvé sur la carte SD.', no_filter: 'Aucun événement pour ce filtre.', error: 'Erreur',
    cam_not_found: 'Caméra introuvable dans la source multimédia', play_error: 'Impossible de charger l’enregistrement',
    speed: 'Vitesse', next: 'Clip suivant', download: 'Télécharger', reset_zoom: 'Réinitialiser le zoom',
    preview_at: 'Image {time}', bat_low: 'Batterie faible · {name} {v} %', temp_high: 'Batterie trop chaude · {name} {v} °C',
    temp_low: 'Batterie trop froide · {name} {v} °C', sd: 'SD {v} % utilisée',
    scene_off: 'Arrêt', scene_disarm: 'Désarmé', scene_home: 'Maison', scene_away: 'Absent',
    g_general: 'Général', g_detect: 'Détection', g_image: 'Image', g_flood: 'Projecteur', g_audio: 'Son et enregistrement',
    pir: 'Détection PIR', rec: 'Enregistrement', push: 'Notifications push', pir_reduce: 'Réduire les fausses alarmes PIR',
    daynight: 'Jour/nuit', ir: 'Infrarouge la nuit', status_led: 'LED d’état', prealarm: 'Pré-alarme', play_btn: 'Lire',
    restart: 'Redémarrer la caméra', restart_btn: 'Redémarrer', cancel: 'Annuler', siren_btn: 'Déclencher', restart_confirm: 'Redémarrer la caméra « {name} » ?',
    pir_sens: 'Sensibilité PIR', ai_person: 'Sensibilité IA personne', ai_vehicle: 'Sensibilité IA véhicule',
    ai_animal: 'Sensibilité IA animal', img_bright: 'Luminosité', img_contrast: 'Contraste', img_sat: 'Saturation',
    img_sharp: 'Netteté', anti_flicker: 'Anti-scintillement', ir_bright: 'Luminosité infrarouge', fl_mode: 'Mode',
    fl_bright: 'Luminosité à l’allumage', volume: 'Volume', post_rec: 'Post-enregistrement', rec_audio: 'Enregistrer le son',
    siren_event: 'Sirène lors d’un événement', prealarm_event: 'Pré-alarme lors d’un événement', hub_ring_event: 'Sonnerie du hub lors d’un événement',
    need_cameras: 'Veuillez définir « cameras »', need_prefix: 'Chaque caméra a besoin d’une « entity » (ou d’un « prefix »)',
    wifi: 'Wi-Fi', camera: 'Caméra',
    talking: 'Interphone', talk_connecting: 'Connexion …', talk_failed: 'Échec de l’audio bidirectionnel',
    talk_na_feature: 'Audio bidirectionnel indisponible – activez « Audio bidirectionnel » dans Home Assistant sous Paramètres → Système → Labs',
    talk_na_https: 'L’audio bidirectionnel nécessite HTTPS – ouvrez Home Assistant via https://',
    talk_na_webrtc: 'L’audio bidirectionnel ne fonctionne qu’avec un flux WebRTC', talk_denied: 'Pas d’accès au micro – autorisez-le dans le navigateur ou l’app',
  },
};
const LANGS = ['en', 'de', 'fr'];
const LOCALES = { de: 'de-CH', fr: 'fr-CH', en: undefined };
/* Sprache wählen: Option > Sprache von Home Assistant > Englisch */
const pickLang = (opt, hass) => {
  const l = String((opt && opt !== 'auto' ? opt : hass && ((hass.locale && hass.locale.language) || hass.language)) || 'en').toLowerCase();
  return LANGS.find((x) => l.startsWith(x)) || 'en';
};
const fmt = (s, v = {}) => s.replace(/\{(\w+)\}/g, (_, k) => (v[k] ?? ''));
/* Element in verschachtelten Shadow-DOMs suchen (z. B. den Kamera-Stream in der picture-entity-Karte) */
const SND_EVENTS = ['pointerup', 'click', 'keydown'];
const deepFind = (root, sel) => {
  if (!root) return null;
  const hit = root.querySelector && root.querySelector(sel);
  if (hit) return hit;
  for (const el of (root.querySelectorAll ? root.querySelectorAll('*') : [])) {
    if (el.shadowRoot) { const r = deepFind(el.shadowRoot, sel); if (r) return r; }
  }
  return null;
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Konstanten ---------- */
const Q = {
  fluent: { key: 'q_fluent', icon: 'mdi:quality-low' },
  balanced: { key: 'q_balanced', icon: 'mdi:quality-medium' },
  clear: { key: 'q_clear', icon: 'mdi:quality-high' },
};
const Q_ORDER = ['fluent', 'balanced', 'clear'];
const Q_STORE = 'reolink-app-card:quality';
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
  visitor: ['binary_sensor', 'besucher', 'visitor'],
  ptz_left: ['button', 'ptz_links', 'ptz_left'],
  ptz_right: ['button', 'ptz_rechts', 'ptz_right'],
  ptz_up: ['button', 'ptz_hoch', 'ptz_up'],
  ptz_down: ['button', 'ptz_runter', 'ptz_down'],
  ptz_stop: ['button', 'ptz_stopp', 'ptz_stop'],
  ptz_zoom_in: ['button', 'ptz_hineinzoomen', 'ptz_zoom_in'],
  ptz_zoom_out: ['button', 'ptz_herauszoomen', 'ptz_zoom_out'],
  ptz_preset: ['select', 'ptz_voreinstellung', 'ptz_preset'],
};
/* Interne Schlüssel (translation_key) der Reolink-Integration – unabhängig von Sprache und Umbenennungen */
const TK = {
  cam_sd: 'sub', cam_bal: 'ext', cam_hd: 'main', snap: 'snapshots_sub',
  light: 'floodlight', status_led: 'status_led', siren: 'siren', prealarm: 'pre_siren',
  manual_rec: 'manual_record', rec: 'record', pir: 'pir_enabled', pir_reduce: 'pir_reduce_alarm', push: 'push_notifications',
  ir: 'ir_lights', rec_audio: 'record_audio', siren_event: 'siren_on_event', prealarm_event: 'pre_siren_on_event', hub_ring_event: 'hub_ringtone_on_event',
  daynight: 'day_night_mode', anti_flicker: 'anti_flicker', fl_mode: 'floodlight_mode', post_rec: 'post_rec_time',
  pir_sens: 'pir_sensitivity', ai_person: 'ai_person_sensitivity', ai_vehicle: 'ai_vehicle_sensitivity', ai_animal: ['ai_animal_sensitivity', 'ai_pet_sensitivity'],
  img_bright: 'image_brightness', img_contrast: 'image_contrast', img_sat: 'image_saturation', img_sharp: 'image_sharpness',
  ir_bright: 'ir_brightness', fl_bright: 'floodlight_brightness', volume: 'volume',
  battery_state: 'battery_state', battery_temp: 'battery_temperature', wifi: 'wifi_signal', sleep: 'sleep',
  det_person: 'person', det_vehicle: 'vehicle', det_animal: ['animal', 'pet'], visitor: 'visitor',
  ptz_left: 'ptz_left', ptz_right: 'ptz_right', ptz_up: 'ptz_up', ptz_down: 'ptz_down', ptz_stop: 'ptz_stop',
  ptz_zoom_in: 'ptz_zoom_in', ptz_zoom_out: 'ptz_zoom_out', ptz_preset: 'ptz_preset',
};
/* Entitäten ohne internen Schlüssel: über die Geräteklasse finden */
const DC = { battery: 'battery', det_motion: 'motion', restart: 'restart' };
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
  }

  /* ---------- Hilfen ---------- */
  get _lang() { return pickLang(this._config && this._config.language, this._hass); }
  _t(k, v) { return fmt((STR[this._lang] || STR.en)[k] || STR.en[k] || k, v); }
  get _cam() { return this._cams[this._idx]; }
  _st(id) { return this._hass && id ? this._hass.states[id] : undefined; }
  _on(id) { const s = this._st(id); return !!s && s.state === 'on'; }
  _num(id) { const s = this._st(id); return s && s.state !== '' && !isNaN(+s.state) ? +s.state : null; }

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
  }

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
  }
  _hubE(key) {
    const over = (this._config.hub_entities || {})[key];
    if (over) return over;
    const [domain, ...suf] = HUB_ENT[key];
    for (const pre of [this._config.hub_prefix, this._hubPrefix()]) {
      if (!pre) continue;
      for (const s of suf) { const id = `${domain}.${pre}_${s}`; if (this._st(id)) return id; }
    }
    return null;
  }

  /* Hub automatisch finden: Entität des Szenenmodus bzw. der SD-Karte (einmal suchen, dann merken) */
  _hubPrefix() {
    if (this._hubAuto !== undefined && (this._hubAuto || Date.now() - this._hubTry < 60000)) return this._hubAuto;
    this._hubTry = Date.now();
    this._hubAuto = findHubPrefix(this._hass);
    if (this._hubAuto) this._watch = null;
    return this._hubAuto;
  }

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
  }

  /* Hat sich seit dem letzten Mal etwas geändert, das die Karte betrifft? */
  _relevantChange(old, hass) {
    if (!old || old.language !== hass.language || old.locale !== hass.locale || old.themes !== hass.themes) return true;
    if (old.entities !== hass.entities) { this._watch = null; return true; }
    if (old.states === hass.states) return false;
    return this._watchIds().some((id) => old.states[id] !== hass.states[id]);
  }
  _det(cam) { return DET.filter((k) => this._on(this._e(`det_${k}`, cam))); }

  getCardSize() { return 10; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }

  static getConfigElement() { return document.createElement('reolink-app-card-editor'); }
  static getStubConfig(hass) {
    const cams = detectCameras(hass).slice(0, 4).map((c) => ({ name: c.name, prefix: c.prefix, media_name: c.name }));
    const name = STR[pickLang('auto', hass)].camera;
    return { cameras: cams.length ? cams : [{ name, prefix: 'camera' }] };
  }

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
  }

  connectedCallback() {
    if (this._built) this._observe();
    window.addEventListener('location-changed', this._onLink);
    window.addEventListener('popstate', this._onLink);
    this._onLink();
    window.addEventListener('webrtc-stream-stopped', this._onAppStop);
  }

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
    return (this._config.auto_live || this._linkLive) && this._visible && !document.hidden
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
    try { localStorage.setItem(Q_STORE, q); } catch (_) { /* privater Modus o. ä. */ }
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
          <div class="ring" id="ring">
            <div class="rhead"><span class="rbell"><ha-icon icon="mdi:doorbell-video"></ha-icon></span><b id="ring-t"></b><span id="ring-n"></span></div>
            <div class="rbtns">
              <button class="rb no" id="ring-no"><span><ha-icon icon="mdi:phone-hangup"></ha-icon></span><small id="ring-no-l"></small></button>
              <button class="rb yes" id="ring-yes"><span><ha-icon icon="mdi:phone"></ha-icon></span><small id="ring-yes-l"></small></button>
            </div>
          </div>
          <div class="talk" id="talk">
            <span class="tpill"><span class="tw"><i></i><i></i><i></i><i></i></span><span id="talk-l"></span></span>
          </div>
          <div class="ov bottom">
            <span class="pill" id="timer"></span>
            <span class="spacer"></span>
            <button class="pill btn" id="speed"></button>
            <button class="pill btn icon" id="next"><ha-icon icon="mdi:skip-next"></ha-icon></button>
            <button class="pill btn icon" id="dl"><ha-icon icon="mdi:download"></ha-icon></button>
            <button class="pill btn icon" id="unzoom"><ha-icon icon="mdi:magnify-minus-outline"></ha-icon></button>
            <button class="pill btn icon" id="snd"><ha-icon icon="mdi:volume-off"></ha-icon></button>
            <button class="pill btn icon" id="stop"><ha-icon icon="mdi:stop"></ha-icon></button>
            <button class="pill btn icon" id="fs"><ha-icon icon="mdi:fullscreen"></ha-icon></button>
          </div>
        </div>
        <div class="seg"><button id="m-live"></button><button id="m-play"></button></div>
        <div id="pane-live">
          <div class="barwrap"><div class="bar" id="ctrls"></div><div class="qmenu" id="qmenu"></div></div>
          <div class="ptz" id="ptz"></div>
          <button class="more" id="more"><ha-icon icon="mdi:tune-variant"></ha-icon><span id="more-l"></span><ha-icon id="chev" icon="mdi:chevron-down"></ha-icon></button>
          <div class="settings" id="settings"></div>
        </div>
        <div class="dlg" id="dlg" role="dialog" aria-modal="true"><div class="dbox"><div class="dtext" id="dtext"></div><div class="dbtns"><button id="dno"></button><button id="dyes"></button></div></div></div>
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
    $('snd').onclick = () => { this._sound = !this._sound; this._sndCheck = this._sound; this._applySound(); this._update(); };
    // Ohne Tonspur im WebRTC-Stream einmal darauf hinweisen
    $('pic').addEventListener('streams', (e) => {
      const src = e.composedPath()[0];
      if (!this._sndCheck || !src || src.localName !== 'ha-web-rtc-player' || !e.detail || !e.detail.hasVideo) return;
      this._sndCheck = false;
      if (!e.detail.hasAudio) this._toast({ text: this._t('no_audio'), color: '#636366', icon: 'mdi:volume-off', wrap: true });
    });
    // Meldungen des Kamera-Streams von Home Assistant (WebRTC-Player in der picture-entity-Karte)
    $('ring-yes').onclick = () => this._endRing(true);
    $('ring-no').onclick = () => this._endRing(false);
    $('pic').addEventListener('microphone-changed', (e) => { if (!this._appSession && !this._appMic) this._setMic(e.detail.state); });
    $('pic').addEventListener('stream-type-changed', (e) => { this._streamType = e.detail.type || null; this._update(); });
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
    this._micReset();
    this._streamType = null;
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
      if (this._sound) this._applySound();
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
  }

  _toast(t) {
    const el = this.$('toast');
    el.style.setProperty('--c', t.color);
    el.classList.toggle('wrap', !!t.wrap);
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
    if (!this._grid) {
      const active = this._mic !== 'off', why = active ? null : this._talkReason();
      const legacy = why === 'feature' && this._talkLegacy();
      items.push({ id: 'talk', icon: active ? 'mdi:phone-hangup' : 'mdi:phone', on: active, warn: active,
        ring: this._mic === 'connecting', dis: !!why && !legacy,
        label: active ? this._t('hang_up') : legacy ? this._t('talk_app') : this._t('talk'),
        run: () => (legacy ? this._talk() : this._toggleTalk()) });
    }
    if (this._st(siren)) items.push({ id: 'siren', icon: 'mdi:alarm-light-outline', label: this._t('siren'), on: this._on(siren), warn: true,
      run: async () => (this._on(siren) ? this._call('siren', 'turn_off', siren)
        : ((await this._ask(this._t('siren_confirm', { name: c.name }), this._t('siren_btn'), true)) && this._call('siren', 'turn_on', siren))) });
    if (this._st(light)) items.push({ id: 'light', icon: 'mdi:flashlight', label: this._t('spotlight'), on: this._on(light),
      run: () => this._call('light', 'toggle', light) });
    if (this._st(mrec)) items.push({ id: 'rec', icon: 'mdi:video-outline', label: this._t('record'), on: this._on(mrec),
      run: () => this._call('switch', 'toggle', mrec) });
    items.push({ id: 'snap', icon: 'mdi:camera-outline', label: this._t('snapshot'), run: () => this._snapshot() });
    if (!this._grid && this._hasPtz()) items.push({ id: 'ptz', icon: 'mdi:arrow-all', label: this._t('ptz'), on: this._ptzOpen,
      run: () => { this._ptzOpen = !this._ptzOpen; this._qOpen = false; this._update(); } });
    if (this._qAvail().length && !this._grid) items.push({ id: 'q', icon: Q[this._quality].icon,
      label: `${this._t('quality')}: ${this._t(Q[this._quality].key)}`, on: this._qOpen,
      run: () => { this._qOpen = !this._qOpen; this._ptzOpen = false; this._update(); } });
    return items;
  }

  /* ---------- Klingel ----------
     Auslöser pro Kamera (Option doorbell): Besucher-Sensor einer Reolink-Klingel oder ein beliebiger Taster/Schalter/Sensor.
     Ohne Angabe wird der Besucher-Sensor der Kamera genommen, falls vorhanden; doorbell: false schaltet es ab. */
  _bellId(cam) {
    if (cam.doorbell === false) return null;
    if (typeof cam.doorbell === 'string') return cam.doorbell;
    const v = this._e('visitor', cam);
    return this._st(v) ? v : null;
  }

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
  }

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
  }

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
  }

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
  }

  /* ---------- Schwenken & Neigen (PTZ) ---------- */
  _hasPtz(cam = this._cam) { return ['ptz_left', 'ptz_right', 'ptz_up', 'ptz_down'].some((k) => this._st(this._e(k, cam))); }

  _press(id) { if (this._st(id)) this._call('button', 'press', id); }

  /* Gedrückt halten bewegt, Loslassen stoppt (mindestens 250 ms, damit ein kurzer Tipp sichtbar etwas bewegt) */
  _bindHold(btn, key) {
    let since = 0, active = false;
    const stop = () => {
      if (!active) return;
      active = false;
      const wait = Math.max(0, 250 - (Date.now() - since));
      setTimeout(() => this._press(this._e('ptz_stop')), wait);
    };
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); active = true; since = Date.now(); try { btn.setPointerCapture(e.pointerId); } catch (_) { /* ignorieren */ } this._press(this._e(key)); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => btn.addEventListener(t, stop));
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _updatePtz() {
    const box = this.$('ptz');
    const show = this._ptzOpen && !this._grid && this._mode === 'live' && this._hasPtz();
    box.classList.toggle('open', !!show);
    if (!show) return;
    const preset = this._e('ptz_preset'), ps = this._st(preset);
    const opts = ps && Array.isArray(ps.attributes.options) ? ps.attributes.options : [];
    const has = (k) => !!this._st(this._e(k));
    const sig = `${this._idx}|${this._lang}|${opts.join(',')}|${['ptz_up', 'ptz_down', 'ptz_left', 'ptz_right', 'ptz_zoom_in', 'ptz_zoom_out'].map(has).join()}`;
    if (box.dataset.sig !== sig) {
      box.dataset.sig = sig;
      const dir = (k, icon, cls) => (has(k) ? `<button class="pd ${cls}" data-k="${k}" title="${esc(this._t('ptz'))}"><ha-icon icon="${icon}"></ha-icon></button>` : '');
      box.innerHTML = `<div class="pwrap">
          <div class="pad">${dir('ptz_up', 'mdi:chevron-up', 'u')}${dir('ptz_left', 'mdi:chevron-left', 'l')}<button class="pd c" id="pstop" title="${esc(this._t('ptz_stop'))}"><ha-icon icon="mdi:stop"></ha-icon></button>${dir('ptz_right', 'mdi:chevron-right', 'r')}${dir('ptz_down', 'mdi:chevron-down', 'd')}</div>
          <div class="pzoom">${has('ptz_zoom_in') ? `<button class="pz" data-k="ptz_zoom_in" title="${esc(this._t('zoom_in'))}"><ha-icon icon="mdi:magnify-plus-outline"></ha-icon></button>` : ''}${has('ptz_zoom_out') ? `<button class="pz" data-k="ptz_zoom_out" title="${esc(this._t('zoom_out'))}"><ha-icon icon="mdi:magnify-minus-outline"></ha-icon></button>` : ''}</div>
        </div>
        ${opts.length ? `<div class="pre"><small>${esc(this._t('ptz_presets'))}</small><div class="chips">${opts.map((o) => `<button class="chip" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>` : ''}`;
      box.querySelectorAll('[data-k]').forEach((b) => this._bindHold(b, b.dataset.k));
      const st = box.querySelector('#pstop');
      if (st) st.onclick = () => this._press(this._e('ptz_stop'));
      box.querySelectorAll('.chip').forEach((b) => { b.onclick = () => this._call('select', 'select_option', preset, { option: b.dataset.o }); });
    }
    box.querySelectorAll('.chip').forEach((b) => b.classList.toggle('sel', !!ps && ps.state === b.dataset.o));
  }

  /* ---------- Direktlink, z. B. aus einer Push-Mitteilung ----------
     ?rac=live&rac_cam=kamera_eingang            → Kamera wählen und live starten
     ?rac=event&rac_cam=kamera_eingang&rac_t=…   → Aufnahme zu diesem Zeitpunkt (Unix-Sekunden) abspielen
     ?rac=talk&rac_cam=kamera_eingang            → live starten und gleich das Gegensprechen einschalten (z. B. „Annehmen“) */
  _onLink = () => {
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
  };

  /* Gegensprechen einschalten, sobald bekannt ist, ob es geht (Abfrage bei Home Assistant läuft evtl. noch) */
  async _talkWhenReady() {
    for (let n = 0; n < 40; n++) {
      if (!this._live || this._mic !== 'off') return;
      if (this._talkReason() !== 'wait') { this._toggleTalk(); return; }
      await new Promise((r) => setTimeout(r, 250));
    }
  }

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
  }

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
  }

  _sndStopWait() {
    if (!this._sndWait) return;
    SND_EVENTS.forEach((t) => window.removeEventListener(t, this._sndWait, true));
    this._sndWait = null;
  }

  /* ---------- Gegensprechen über Home Assistant (Zwei-Wege-Audio, Labs-Funktion ab 2026.11) ----------
     Das Livebild läuft über den WebRTC-Player von Home Assistant; die Karte schaltet dort nur das Mikrofon zu.
     Ohne HTTPS sperren Browser das Mikrofon. Die Companion-App kann es dann selbst senden, sofern sie das unterstützt. */
  get _talkEnt() { const w = this._qEntity(this._quality); return this._st(w) ? w : this._e('cam_sd'); }

  get _appMic() {
    const ext = this._hass && this._hass.auth && this._hass.auth.external;
    return !window.isSecureContext && !!(ext && ext.config && ext.config.webrtc && ext.config.webrtc.hasCameraMicrophoneStream);
  }

  _talkLegacy() { return !!(this._cam.talk_url || this._config.talk_url); }

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
  }

  /* Warum Gegensprechen gerade nicht geht – null heisst: bereit */
  _talkReason() {
    const caps = this._talkCaps(this._talkEnt);
    if (caps === undefined) return 'wait';
    if (!caps) return 'feature';
    if (!window.isSecureContext && !this._appMic) return 'https';
    if (this._streamType && this._streamType !== 'web_rtc') return 'webrtc';
    return null;
  }

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
  }

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
  }

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
  }

  /* Die App hat die Mikrofon-Verbindung selbst beendet */
  _onAppStop = (e) => {
    if (!this._appSession || !e.detail || e.detail.session_id !== this._appSession) return;
    this._appSession = null;
    this._setMic('off');
    if (e.detail.code && e.detail.code !== 'interrupted') {
      this._toast({ text: `${this._t('talk_failed')}${e.detail.message ? `: ${e.detail.message}` : ''}`, color: '#636366', icon: 'mdi:phone-off', wrap: true });
    }
  };

  _hangUp() {
    if (this._appSession || this._appMic) { this._micReset(); return; }
    const s = this._micStream;
    this._micReq++;
    this._micStream = null;
    const p = s && s.isConnected && s.shadowRoot && s.shadowRoot.querySelector('ha-web-rtc-player');
    if (p && (p.microphoneState === 'on' || p.microphoneState === 'connecting')) s.toggleMicrophone();
    this._setMic('off');
  }

  /* Gegensprechen sofort beenden, z. B. wenn das Livebild stoppt oder die Kamera wechselt */
  _micReset() {
    this._micReq = (this._micReq || 0) + 1;
    if (this._appSession) {
      try { this._hass.auth.external.fireMessage({ type: 'webrtc/stream/stop', payload: { session_id: this._appSession } }); } catch (_) { /* ignorieren */ }
      this._appSession = null;
    }
    this._micStream = null;
    if (this._mic && this._mic !== 'off') this._setMic('off');
  }

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
  }

  _talkLabel() {
    const l = this.$('talk-l');
    if (!l) return;
    if (this._mic === 'connecting') { l.textContent = this._t('talk_connecting'); return; }
    const sec = Math.max(0, Math.floor((Date.now() - (this._talkSince || Date.now())) / 1000));
    l.textContent = `${this._t('talking')} · ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  }

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
  }

  _stopMeter() {
    cancelAnimationFrame(this._meterRaf);
    if (this._meterCtx) { this._meterCtx.close().catch(() => {}); this._meterCtx = null; }
    this.style.removeProperty('--lvl');
  }

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
      if (this._pendingEvent) {
        const want = new Date(this._pendingEvent * 1000).toDateString();
        const k = days.findIndex((d) => d.date && d.date.toDateString() === want);
        if (k >= 0) this._dayIdx = k;
      }
      this._renderDays();
      if (days.length) await this._loadFiles();
      else this._update();
      if (this._pendingEvent && camIdx === this._idx) this._pickEvent();
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
      this._toast({ text: `${this._t('play_error')}: ${e.message || e}`, color: '#636366', icon: 'mdi:alert-circle-outline', wrap: true });
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

  _updateTimer() {
    const t = this.$('timer'), timed = this._live && !!this._liveEnds;
    const left = timed ? Math.max(0, Math.ceil((this._liveEnds - Date.now()) / 1000)) : 0;
    const txt = timed ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : '';
    if (t.textContent !== txt) t.textContent = txt;
    t.style.display = timed ? '' : 'none';
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
    const ringing = !!this._ring && !playing;
    $('stage').classList.toggle('ringing', ringing);
    if (ringing) {
      $('ring-t').textContent = this._t('ring_title');
      $('ring-n').textContent = this._cams[this._ring.idx].name;
      $('ring-yes-l').textContent = this._t('answer');
      $('ring-no-l').textContent = this._t('decline');
    }
    this._updatePtz();
    const talking = this._mic !== 'off' && !this._grid && !playing;
    $('stage').classList.toggle('talking', talking);
    $('talk').classList.toggle('conn', this._mic === 'connecting');
    $('talk').classList.toggle('lvl', !!this._meterCtx);
    $('snd').style.display = this._live && !this._grid && !playing ? '' : 'none';
    $('snd').classList.toggle('on', this._sound);
    $('snd').querySelector('ha-icon').setAttribute('icon', this._sound ? 'mdi:volume-high' : 'mdi:volume-off');
    $('snd').title = this._sound ? this._t('sound_off') : this._t('sound_on');
    if (talking) this._talkLabel();
    $('stage').classList.toggle('haspic', !!this._snaps[this._idx]);
    if (this._snaps[this._idx] && $('prev').getAttribute('src') !== this._snaps[this._idx].url) $('prev').src = this._snaps[this._idx].url;

    const snap = this._snaps[this._idx];
    const tm = snap ? snap.time.toLocaleTimeString(LOCALES[this._lang], { hour: '2-digit', minute: '2-digit' }) : '';
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
        stat += `<span class="pill" title="${this._t('wifi')} ${w < 0 ? w + ' dBm' : bars + '/4'}"><ha-icon icon="mdi:wifi-strength-${bars}"></ha-icon></span>`;
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

    this._updateTimer();
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

  /* Kopfzeile: eigener Modus (z. B. input_select für Benachrichtigungen) oder Reolink-Szenenmodus, dazu SD-Karte */
  _updateHub() {
    const box = this.$('hub'), cfg = this._config;
    const modeId = cfg.mode_entity || null;
    const useScene = cfg.show_hub && (modeId ? cfg.show_scene === true : cfg.show_scene !== false);
    const scene = useScene ? this._hubE('scene') : null;
    const storage = cfg.show_hub ? this._hubE('storage') : null;
    const m = this._st(modeId), s = this._st(scene), sd = this._num(storage);
    if (!m && !s && sd === null) { box.style.display = 'none'; return; }
    box.style.display = '';
    const fmtOpt = (st, o) => (this._hass.formatEntityState ? this._hass.formatEntityState(st, o) : o);
    const rows = [];
    if (m) {
      const icons = cfg.mode_icons || {};
      rows.push({ id: modeId, st: m, opts: m.attributes.options || [],
        icon: (o) => icons[o] || modeIcon(o), label: (o) => fmtOpt(m, o) });
    }
    if (s) {
      const icons = { disarm: 'mdi:shield-off-outline', home: 'mdi:home-outline', away: 'mdi:shield-lock-outline' };
      rows.push({ id: scene, st: s, opts: (s.attributes.options || []).filter((o) => o !== 'off'),
        icon: (o) => icons[o] || 'mdi:shield-outline', label: (o) => (STR[this._lang][`scene_${o}`] ? this._t(`scene_${o}`) : fmtOpt(s, o)) });
    }
    const sig = `${this._lang}|${rows.map((r) => `${r.id}:${r.opts.join()}:${r.st.state}`).join('|')}|${sd === null ? '' : Math.round(sd * 10)}`;
    if (box.dataset.sig === sig) return;
    box.dataset.sig = sig;
    box.innerHTML = rows.map((r, i) => `<div class="scene" data-r="${i}">${r.opts.map((o) => `<button data-o="${esc(o)}" class="${r.st.state === o ? 'sel' : ''}">
      <ha-icon icon="${esc(r.icon(o))}"></ha-icon><span>${esc(r.label(o))}</span></button>`).join('')}</div>`).join('')
      + (sd !== null ? `<span class="sd"><ha-icon icon="mdi:micro-sd"></ha-icon>${this._t('sd', { v: sd < 10 ? sd.toFixed(1) : Math.round(sd) })}</span>` : '');
    box.querySelectorAll('.scene').forEach((row) => {
      const r = rows[+row.dataset.r];
      row.querySelectorAll('button').forEach((b) => {
        b.onclick = () => { if (b.dataset.o !== r.st.state) this._call(r.id.split('.')[0], 'select_option', r.id, { option: b.dataset.o }); };
      });
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
      const btn = (x) => `<button class="tbn${x.id === 'talk' ? ' big' : ''}" data-id="${x.id}"><ha-icon></ha-icon></button>`;
      const mid = ctrls.find((x) => x.id === 'talk'), rest = ctrls.filter((x) => x !== mid);
      // Hörer in die Mitte, die übrigen Buttons links und rechts davon verteilt
      const half = Math.ceil(rest.length / 2);
      $('ctrls').classList.toggle('split', !!mid);
      $('ctrls').innerHTML = mid
        ? `<div class="side">${rest.slice(0, half).map(btn).join('')}</div>${btn(mid)}<div class="side">${rest.slice(half).map(btn).join('')}</div>`
        : ctrls.map(btn).join('');
      ctrls.forEach((x) => { $('ctrls').querySelector(`[data-id="${x.id}"]`).onclick = () => this._controls().find((y) => y.id === x.id).run(); });
    }
    ctrls.forEach((x) => {
      const b = $('ctrls').querySelector(`[data-id="${x.id}"]`);
      const icon = b.querySelector('ha-icon');
      if (icon.getAttribute('icon') !== x.icon) icon.setAttribute('icon', x.icon);
      b.title = x.label; b.setAttribute('aria-label', x.label);
      b.classList.toggle('on', !!x.on && !x.warn);
      b.classList.toggle('warn', !!x.on && !!x.warn);
      b.classList.toggle('dis', !!x.dis);
      b.classList.toggle('ring', !!x.ring);
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
    else if (it.type === 'btn') row.querySelector('.rowbtn').onclick = async () => {
      if (it.confirmKey && !(await this._ask(this._t(it.confirmKey, { name: this._cam.name }), this._t('restart_btn'), true))) return;
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

/* Passendes Symbol für typische Modusnamen (deutsch und englisch) */
function modeIcon(o) {
  const s = String(o).toLowerCase();
  if (/klingel|ring|doorbell|sonnette|sonner/.test(s)) return 'mdi:doorbell';
  if (/unscharf|disarm|deaktiv|d[eé]sarm/.test(s)) return 'mdi:shield-off-outline';
  if (/abwes|away|weg|urlaub|vacation|absent|vacances/.test(s)) return 'mdi:shield-lock-outline';
  if (/nacht|night|schlaf|sleep|nuit/.test(s)) return 'mdi:weather-night';
  if (/zuhause|home|daheim|maison/.test(s)) return 'mdi:home-outline';
  if (/^(aus|off|arr[eê]t)$|stumm|mute|deaktiv|disarm|silence/.test(s)) return 'mdi:bell-off-outline';
  return 'mdi:circle-medium';
}

/* Gemeinsamen Teil der Entity-IDs aus einer Kamera-Entität ableiten, z. B. camera.kamera_eingang_standardauflosung → kamera_eingang */
const CAM_SUFFIX = /_(standardauflosung|ausgewogen|hochauflosung|fluent|balanced|clear|schnappschusse_in_(standard|hoch)auflosung|snapshots_(fluent|clear|balanced))$/;
function prefixOf(entityId) {
  const m = String(entityId || '').match(/^camera\.(.+)$/);
  return m && CAM_SUFFIX.test(m[1]) ? m[1].replace(CAM_SUFFIX, '') : null;
}

/* Reolink-Kameras in Home Assistant finden (für Editor und Vorschläge); nutzt das Geräte-Register, wenn vorhanden */
function detectCameras(hass) {
  if (!hass) return [];
  const out = [];
  Object.keys(hass.states).forEach((id) => {
    const m = id.match(/^camera\.(.+)_(standardauflosung|fluent)$/);
    if (!m) return;
    const reg = hass.entities && hass.entities[id];
    if (reg && reg.platform && reg.platform !== 'reolink') return;
    const dev = reg && reg.device_id && hass.devices ? hass.devices[reg.device_id] : null;
    const fn = String(hass.states[id].attributes.friendly_name || m[1]).replace(/\s*(Standardauflösung|Fluent)$/i, '').trim();
    const name = (dev && (dev.name_by_user || dev.name)) || fn || m[1];
    out.push({ prefix: m[1], name, entity: id, device_id: reg ? reg.device_id : undefined });
  });
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/* Hub finden: Szenenmodus- oder SD-Karten-Entität, die keiner Kamera gehört */
function findHubPrefix(hass) {
  if (!hass) return null;
  for (const id of Object.keys(hass.states)) {
    const m = id.match(/^select\.(.+)_(szenenmodus|scene_mode)$/) || id.match(/^sensor\.(.+)_sd_0_(speicher|storage)$/);
    if (!m) continue;
    const reg = hass.entities && hass.entities[id];
    if (reg && reg.platform && reg.platform !== 'reolink') continue;
    return m[1];
  }
  return null;
}

/* Vorschlag für „Zur Übersicht hinzufügen“: zu jeder Entität einer Reolink-Kamera (oder des Hubs) */
function cardSuggestion(hass, entityId) {
  const cams = detectCameras(hass);
  if (!cams.length || !entityId) return null;
  const obj = entityId.split('.')[1] || '';
  const reg = hass.entities && hass.entities[entityId];
  const dev = reg && reg.device_id;
  const hit = cams.find((c) => (dev && c.device_id === dev) || obj === c.prefix || obj.startsWith(`${c.prefix}_`));
  const hub = findHubPrefix(hass);
  const hubDev = hub && hass.entities && Object.keys(hass.entities).some((id) => hass.entities[id].device_id === dev && (id.split('.')[1] || '').startsWith(`${hub}_`));
  const isHub = !hit && hub && (obj.startsWith(`${hub}_`) || hubDev);
  if (!hit && !isHub) return null;
  const t = STR[pickLang('auto', hass)];
  const conf = (list) => ({ type: 'custom:reolink-app-card', cameras: list.map((c) => ({ name: c.name, prefix: c.prefix, media_name: c.name })) });
  const out = [];
  if (hit) out.push({ label: `Reolink App Card – ${hit.name}`, config: conf([hit]) });
  if (cams.length > 1 || isHub) out.push({ label: `Reolink App Card – ${t.grid}`, config: conf(cams) });
  return out;
}

/* ======================================================================= */
/* Visueller Editor                                                        */
const ED_LABELS = {
  de: {
    mode_entity: 'Modus-Auswahl oben (z. B. input_select für Benachrichtigungen)', default_quality: 'Startqualität', live_timeout: 'Live-Limit (Sekunden, 0 = kein Limit)', auto_live: 'Live automatisch starten',
    auto_switch: 'Bei Erkennung zur Kamera springen', autoplay_next: 'Nächsten Clip automatisch abspielen',
    battery_warning: 'Akku-Warnung ab (%)', temperature_warning: 'Temperatur-Warnung ab (°C)', show_hub: 'Hub anzeigen (Szenenmodus, SD-Karte)',
    hub_prefix: 'Hub-Präfix', language: 'Sprache', prefix: 'Kamera', doorbell: 'Klingel-Auslöser (optional, z. B. Taster oder Besucher-Sensor)', doorbell_timeout: 'Klingeln anzeigen für (Sekunden)', doorbell_sound: 'Klingelton abspielen', name: 'Anzeigename', media_name: 'Name in der Medienquelle (für Wiedergabe)',
    cameras: 'Kameras', add: 'Kamera hinzufügen', remove: 'Entfernen', up: 'Nach oben', auto: 'Automatisch', options: 'Optionen',
    audio: 'Audioausgabe', audio_auto: 'Automatisch (Ton an, sobald das Livebild läuft)', audio_manual: 'Manuell (mit dem Lautsprecher-Button)',
  },
  en: {
    mode_entity: 'Mode selector on top (e.g. an input_select for notifications)', default_quality: 'Start quality', live_timeout: 'Live limit (seconds, 0 = no limit)', auto_live: 'Start live automatically',
    auto_switch: 'Jump to camera on detection', autoplay_next: 'Autoplay next clip',
    battery_warning: 'Battery warning at (%)', temperature_warning: 'Temperature warning at (°C)', show_hub: 'Show hub (scene mode, SD card)',
    hub_prefix: 'Hub prefix', language: 'Language', prefix: 'Camera', doorbell: 'Doorbell trigger (optional, e.g. a button or visitor sensor)', doorbell_timeout: 'Show ringing for (seconds)', doorbell_sound: 'Play ring tone', name: 'Display name', media_name: 'Name in the media source (for playback)',
    cameras: 'Cameras', add: 'Add camera', remove: 'Remove', up: 'Move up', auto: 'Automatic', options: 'Options',
    audio: 'Audio output', audio_auto: 'Automatic (sound on as soon as the live view runs)', audio_manual: 'Manual (with the speaker button)',
  },
  fr: {
    mode_entity: 'Sélecteur de mode en haut (p. ex. un input_select pour les notifications)', default_quality: 'Qualité au démarrage', live_timeout: 'Limite du direct (secondes, 0 = sans limite)', auto_live: 'Démarrer le direct automatiquement',
    auto_switch: 'Basculer vers la caméra lors d’une détection', autoplay_next: 'Lire automatiquement le clip suivant',
    battery_warning: 'Alerte batterie à partir de (%)', temperature_warning: 'Alerte température à partir de (°C)', show_hub: 'Afficher le hub (mode scène, carte SD)',
    hub_prefix: 'Préfixe du hub', language: 'Langue', prefix: 'Caméra', doorbell: 'Déclencheur de sonnette (facultatif, p. ex. bouton ou capteur visiteur)', doorbell_timeout: 'Afficher la sonnerie pendant (secondes)', doorbell_sound: 'Jouer une sonnerie', name: 'Nom affiché', media_name: 'Nom dans la source multimédia (pour la lecture)',
    cameras: 'Caméras', add: 'Ajouter une caméra', remove: 'Supprimer', up: 'Monter', auto: 'Automatique', options: 'Options',
    audio: 'Sortie audio', audio_auto: 'Automatique (son activé dès que le direct démarre)', audio_manual: 'Manuelle (avec le bouton haut-parleur)',
  },
};

class ReolinkAppCardEditor extends HTMLElement {
  setConfig(config) { this._config = { ...config, cameras: [...(config.cameras || [])] }; this._render(); }
  set hass(hass) { const first = !this._hass; this._hass = hass; if (first) this._render(); else this._forms().forEach((f) => { f.hass = hass; }); }
  get _lang() { return pickLang(this._config && this._config.language, this._hass); }
  get _l() { return ED_LABELS[this._lang]; }
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
    // Nur den Namen zeigen; den technischen Teil der Entity-IDs nur, wenn zwei Kameras gleich heissen
    const camOpts = detected.map((c) => ({ value: c.prefix, label: detected.filter((d) => d.name === c.name).length > 1 ? `${c.name} (${c.prefix})` : c.name }));
    const general = [
      { name: 'mode_entity', selector: { entity: { domain: ['input_select', 'select'] } } },
      { type: 'grid', name: '', schema: [
        { name: 'doorbell_timeout', selector: { number: { min: 10, max: 120, step: 5, mode: 'box', unit_of_measurement: 's' } } },
        { name: 'doorbell_sound', selector: { boolean: {} } },
      ] },
      { name: 'audio', selector: { select: { mode: 'dropdown', options: [{ value: 'manual', label: L.audio_manual }, { value: 'auto', label: L.audio_auto }] } } },
      { name: 'default_quality', selector: { select: { mode: 'dropdown', options: Q_ORDER.map((q) => ({ value: q, label: STR[this._lang][Q[q].key] })) } } },
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
      { name: 'language', selector: { select: { mode: 'dropdown', options: [{ value: 'auto', label: L.auto }, { value: 'en', label: 'English' }, { value: 'de', label: 'Deutsch' }, { value: 'fr', label: 'Français' }] } } },
    ];
    const camSchema = [
      { name: 'prefix', required: true, selector: { select: { mode: 'dropdown', custom_value: true, options: camOpts } } },
      { type: 'grid', name: '', schema: [{ name: 'name', selector: { text: {} } }, { name: 'media_name', selector: { text: {} } }] },
      { name: 'doorbell', selector: { entity: { domain: ['binary_sensor', 'input_boolean', 'input_button', 'button', 'event', 'switch', 'sensor'] } } },
    ];
    const defaults = { mode_entity: '', audio: 'manual', doorbell_timeout: 30, doorbell_sound: true, default_quality: 'fluent', live_timeout: 300, auto_live: true, auto_switch: true, autoplay_next: true, show_hub: true, battery_warning: 20, temperature_warning: 45, hub_prefix: 'reolink_hub', language: 'auto' };
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
      Object.keys(defaults).forEach((k) => { if (v[k] === undefined || v[k] === null || v[k] === defaults[k]) delete cfg[k]; else cfg[k] = v[k]; });
      this._changed(cfg);
    });
    this.shadowRoot.getElementById('gen').appendChild(gen);
  }
}

/* ======================================================================= */
const RAC_CSS = `
:host { --ra: var(--reolink-accent, #1e8bff); --rb: var(--ha-card-background, var(--card-background-color)); }
ha-card { overflow: hidden; padding-bottom: 8px; position: relative; }
.dlg { position: absolute; inset: 0; z-index: 10; display: none; align-items: center; justify-content: center; padding: 16px; background: rgba(0,0,0,.55); backdrop-filter: blur(2px); }
.dlg.show { display: flex; }
.dbox { width: 100%; max-width: 320px; padding: 18px 16px 14px; border-radius: 18px; background: #2c2c2e; color: #f2f2f2; box-shadow: 0 12px 32px rgba(0,0,0,.5); }
.dtext { font-size: 15px; line-height: 1.4; text-align: center; margin-bottom: 16px; }
.dbtns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dbtns button { padding: 11px; border-radius: 12px; font-size: 15px; font-weight: 600; background: #3a3a3c; color: #f2f2f2; }
.dbtns button.danger { background: #ff3b30; color: #fff; }
.dbtns button:not(.danger)#dyes { background: var(--ra); color: #fff; }
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
.toast.wrap { white-space: normal; width: max-content; max-width: calc(100% - 32px); text-align: left; line-height: 1.3; }
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
.bar.split { display: grid; grid-template-columns: 1fr auto 1fr; gap: 6px; }
.bar .side { display: flex; justify-content: space-around; align-items: center; gap: 2px; min-width: 0; }
.tbn.big { width: 58px; height: 58px; margin: -8px 0; border-radius: 50%; background: #2c2c2e; border: 1px solid rgba(255,255,255,.12); box-shadow: 0 2px 8px rgba(0,0,0,.35); transition: background .2s, box-shadow .08s, transform .15s; }
.tbn.big ha-icon { --mdc-icon-size: 28px; }
.tbn.big:active { transform: scale(.94); }
.tbn.big.warn { border-color: transparent; box-shadow: 0 0 0 calc(var(--lvl, 0) * 12px) rgba(255,59,48,.3), 0 2px 8px rgba(0,0,0,.35); }
.tbn { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; color: #f2f2f2; transition: background .2s, color .2s; }
.tbn ha-icon { --mdc-icon-size: 24px; }
.tbn.on { background: var(--ra); color: #fff; }
.tbn.warn { background: #ff3b30; color: #fff; }
.tbn.dis { opacity: .35; }
.pill.btn.on { background: color-mix(in srgb, var(--ra) 85%, transparent); }
.tbn.ring { animation: ring 1.2s ease-in-out infinite; }
@keyframes ring { 50% { box-shadow: 0 0 0 7px rgba(255,59,48,.25); } }
.talk { position: absolute; inset: 0; display: none; pointer-events: none; z-index: 3; }
.ring { position: absolute; inset: 0; z-index: 6; display: none; flex-direction: column; justify-content: space-between; align-items: center; padding: 18px 12px 16px; color: #fff;
  background: linear-gradient(rgba(0,0,0,.72), rgba(0,0,0,.15) 45%, rgba(0,0,0,.72)); }
.stage.ringing .ring { display: flex; }
.stage.ringing .bigplay, .stage.ringing .ov, .stage.ringing .talk { display: none !important; }
.rhead { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; }
.rhead b { font-size: 18px; } .rhead span:last-child { font-size: 14px; opacity: .85; }
.rbell { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.16); animation: ring 1.2s ease-in-out infinite; }
.rbell ha-icon { --mdc-icon-size: 26px; }
.rbtns { display: flex; gap: 64px; }
.rb { display: flex; flex-direction: column; align-items: center; gap: 6px; color: #fff; font-size: 13px; font-weight: 600; }
.rb > span { width: 62px; height: 62px; border-radius: 50%; display: grid; place-items: center; box-shadow: 0 4px 14px rgba(0,0,0,.4); transition: transform .15s; }
.rb:active > span { transform: scale(.93); }
.rb ha-icon { --mdc-icon-size: 30px; }
.rb.no > span { background: #ff3b30; }
.rb.yes > span { background: #34c759; animation: answer 1.4s ease-in-out infinite; }
@keyframes answer { 50% { box-shadow: 0 0 0 10px rgba(52,199,89,.25), 0 4px 14px rgba(0,0,0,.4); } }
.ptz { display: none; padding: 4px 10px 6px; }
.ptz.open { display: block; }
.pwrap { display: flex; align-items: center; justify-content: center; gap: 28px; }
.pad { display: grid; grid-template-columns: repeat(3, 48px); grid-template-rows: repeat(3, 48px); gap: 4px; padding: 6px; border-radius: 50%; background: #1f1f21; border: 1px solid rgba(255,255,255,.08); }
.pd, .pz { display: grid; place-items: center; color: #f2f2f2; border-radius: 50%; touch-action: none; user-select: none; -webkit-user-select: none; }
.pd:active, .pz:active { background: var(--ra); color: #fff; }
.pd ha-icon { --mdc-icon-size: 30px; }
.pd.u { grid-area: 1 / 2; } .pd.l { grid-area: 2 / 1; } .pd.c { grid-area: 2 / 2; background: #2c2c2e; } .pd.r { grid-area: 2 / 3; } .pd.d { grid-area: 3 / 2; }
.pd.c ha-icon { --mdc-icon-size: 20px; }
.pzoom { display: flex; flex-direction: column; gap: 10px; }
.pz { width: 48px; height: 48px; background: #1f1f21; border: 1px solid rgba(255,255,255,.08); }
.pre { margin-top: 10px; } .pre small { display: block; margin: 0 2px 6px; opacity: .7; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { padding: 6px 12px; border-radius: 16px; background: #2c2c2e; color: #f2f2f2; font-size: 13px; }
.chip.sel { background: var(--ra); color: #fff; }
.stage.talking .talk { display: block; }
.stage.talking .bigplay { display: none !important; }
.tpill { position: absolute; left: 50%; bottom: 52px; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px; border-radius: 14px; background: rgba(255,59,48,.92); color: #fff; font-size: 13px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums; box-shadow: 0 2px 10px rgba(0,0,0,.3); }
.talk.conn .tpill { background: color-mix(in srgb, var(--ra) 92%, transparent); }
.tw { display: inline-flex; align-items: center; gap: 2px; height: 16px; }
.tw i { width: 3px; height: 5px; border-radius: 2px; background: #fff; }
.talk:not(.lvl) .tw i { animation: tw 1s ease-in-out infinite; }
.talk:not(.lvl) .tw i:nth-child(2) { animation-delay: .15s; } .talk:not(.lvl) .tw i:nth-child(3) { animation-delay: .3s; } .talk:not(.lvl) .tw i:nth-child(4) { animation-delay: .45s; }
.talk.lvl .tw i { transition: height .08s; height: calc(4px + var(--lvl, 0) * 8px); }
.talk.lvl .tw i:nth-child(2), .talk.lvl .tw i:nth-child(3) { height: calc(4px + var(--lvl, 0) * 12px); }
@keyframes tw { 50% { height: 14px; } }
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
    getEntitySuggestion: (hass, entityId) => cardSuggestion(hass, entityId),
    description: 'Live view, controls, settings and SD card playback for Reolink cameras, styled like the Reolink app' });
}
console.info(`%c REOLINK-APP-CARD %c ${RAC_VERSION} `, 'background:#1e8bff;color:#fff', '');
