/* Entitäten der Reolink-Integration finden: Namensendungen, interne Schlüssel, Kamera- und Hub-Erkennung */

/* Entity-Suffixe der Reolink-Integration: [deutsch, englisch, Alternativen] */
export const ENT = {
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
export const TK = {
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
export const DC = { battery: 'battery', det_motion: 'motion', restart: 'restart' };

export const HUB_ENT = {
  scene: ['select', 'szenenmodus', 'scene_mode'],
  storage: ['sensor', 'sd_0_speicher', 'sd_0_storage'],
};

/* ältere Optionsnamen aus Version 1 */
export const LEGACY = {
  camera_sd: 'cam_sd', camera_balanced: 'cam_bal', camera_hd: 'cam_hd', light: 'light', siren: 'siren',
  prealarm: 'prealarm', manual_record: 'manual_rec', record: 'rec', pir: 'pir', push: 'push',
  day_night: 'daynight', battery: 'battery', wifi: 'wifi', sleep: 'sleep',
};

/* Passendes Symbol für typische Modusnamen (deutsch und englisch) */
export function modeIcon(o) {
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
export const CAM_SUFFIX = /_(standardauflosung|ausgewogen|hochauflosung|fluent|balanced|clear|schnappschusse_in_(standard|hoch)auflosung|snapshots_(fluent|clear|balanced))$/;

export function prefixOf(entityId) {
  const m = String(entityId || '').match(/^camera\.(.+)$/);
  return m && CAM_SUFFIX.test(m[1]) ? m[1].replace(CAM_SUFFIX, '') : null;
}

/* Reolink-Kameras in Home Assistant finden (für Editor und Vorschläge); nutzt das Geräte-Register, wenn vorhanden */
export function detectCameras(hass) {
  if (!hass) return [];
  const out = [], seen = new Set();
  const add = (id, prefix, fallbackName) => {
    const reg = hass.entities && hass.entities[id];
    const dev = reg && reg.device_id && hass.devices ? hass.devices[reg.device_id] : null;
    if (reg && reg.device_id) { if (seen.has(reg.device_id)) return; seen.add(reg.device_id); }
    const name = (dev && (dev.name_by_user || dev.name)) || fallbackName || prefix;
    out.push({ prefix, name, entity: id, device_id: reg ? reg.device_id : undefined });
  };
  // 1. Über die Namensendung (deutsche/englische Entity-IDs)
  Object.keys(hass.states).forEach((id) => {
    const m = id.match(/^camera\.(.+)_(standardauflosung|fluent)$/);
    if (!m) return;
    const reg = hass.entities && hass.entities[id];
    if (reg && reg.platform && reg.platform !== 'reolink') return;
    add(id, m[1], String(hass.states[id].attributes.friendly_name || m[1]).replace(/\s*(Standardauflösung|Fluent)$/i, '').trim());
  });
  // 2. Über das Geräteregister: Fluent-Stream jeder Reolink-Kamera (andere Sprachen, umbenannte IDs),
  //    gleich ob über einen Hub/NVR oder direkt in Home Assistant eingebunden
  Object.keys(hass.entities || {}).forEach((id) => {
    const r = hass.entities[id];
    if (!id.startsWith('camera.') || r.platform !== 'reolink' || r.translation_key !== TK.cam_sd || !hass.states[id]) return;
    add(id, prefixOf(id) || id.slice(7), String(hass.states[id].attributes.friendly_name || '').trim());
  });
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/* Hub finden: Szenenmodus- oder SD-Karten-Entität, die keiner Kamera gehört */
/* Kamera-Eintrag für eine Konfiguration; die Entität nur, wenn sich der Präfix nicht aus ihr ableiten lässt */
export const camConfig = (c) => ({ name: c.name, prefix: c.prefix, media_name: c.name, ...(c.entity && !prefixOf(c.entity) ? { entity: c.entity } : {}) });

export function findHubPrefix(hass) {
  if (!hass) return null;
  // Direkt eingebundene Kameras haben selbst einen Szenenmodus bzw. eine SD-Karte; das ist kein Hub
  const reg = hass.entities || {};
  const camDevs = new Set(Object.keys(reg).filter((id) => id.startsWith('camera.') && reg[id].platform === 'reolink' && reg[id].device_id).map((id) => reg[id].device_id));
  const isCamera = (pre) => Object.keys(hass.states).some((id) => id.startsWith(`camera.${pre}_`) && CAM_SUFFIX.test(id.slice(7)));
  for (const id of Object.keys(hass.states)) {
    const m = id.match(/^select\.(.+)_(szenenmodus|scene_mode)$/) || id.match(/^sensor\.(.+)_sd_0_(speicher|storage)$/);
    if (!m) continue;
    const r = reg[id];
    if (r && r.platform && r.platform !== 'reolink') continue;
    if ((r && r.device_id && camDevs.has(r.device_id)) || isCamera(m[1])) continue;
    return m[1];
  }
  return null;
}
