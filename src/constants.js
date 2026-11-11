/* Konstanten: Qualitäten, Ereignistypen, Einstellungsgruppen, Reolink-App-Links */

/* ---------- Konstanten ---------- */
export const Q = {
  fluent: { key: 'q_fluent', icon: 'mdi:quality-low' },
  balanced: { key: 'q_balanced', icon: 'mdi:quality-medium' },
  clear: { key: 'q_clear', icon: 'mdi:quality-high' },
};

export const Q_ORDER = ['fluent', 'balanced', 'clear'];

export const Q_STORE = 'reolink-app-card:quality';
/* Auflösung der Wiedergabe (unabhängig von der Livebild-Qualität): 'low' | 'high' */
export const PLAY_Q_STORE = 'reolink-app-card:playback_quality';

export const Q_ALIAS = { sd: 'fluent', low: 'fluent', hd: 'clear', high: 'clear', medium: 'balanced' };

export const REOLINK_PKG = 'com.mcu.reolink';

// Companion-App: öffnet Apps über app://<paket> (https://companion.home-assistant.io/docs/integrations/android-webview)
export const REOLINK_COMPANION = `app://${REOLINK_PKG}`;

// Chrome auf Android: vollständiger Launcher-Intent
export const REOLINK_CHROME = `intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${REOLINK_PKG};end`;

export const EVT = {
  person: { icon: 'mdi:walk', color: '#ff5b5b', re: /person|people|human|mensch/i },
  vehicle: { icon: 'mdi:car', color: '#ffa630', re: /vehicle|car|fahrzeug/i },
  animal: { icon: 'mdi:paw', color: '#3ccf8e', re: /animal|pet|dog|cat|tier/i },
  motion: { icon: 'mdi:motion-sensor', color: '#4da3ff', re: /motion|md|pir|bewegung/i },
  other: { icon: 'mdi:record-rec', color: '#9aa4b2', re: /.^/ },
};

export const EVT_ORDER = ['person', 'vehicle', 'animal', 'motion', 'other'];

export const DET = ['person', 'vehicle', 'animal', 'motion'];

export const SPEEDS = [1, 1.5, 2, 4, 0.5];

export const SETTINGS = [
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
