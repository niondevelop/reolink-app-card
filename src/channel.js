/* Testversion pro Browser: Die stabile Karte (z. B. aus HACS) kann statt sich selbst eine Testdatei
   aus /config/www/reolink-test/ laden. Es bleibt bei einer Dashboard-Ressource, und pro Browser ist
   immer nur eine Version registriert (beide nutzen denselben Elementnamen).
   Einschalten:  Dashboard mit ?rac_channel=test öffnen (nur Administratoren)
   Ausschalten:  Balken „Testversion“ in der Karte antippen, oder ?rac_channel=stable */

export const TEST_URL = '/local/reolink-test/reolink-app-card.js';
const KEY = 'reolink-app-card:channel';

export const testWanted = () => { try { return localStorage.getItem(KEY) === 'test'; } catch (_) { return false; } };

export const setTestWanted = (on) => {
  try { if (on) localStorage.setItem(KEY, 'test'); else localStorage.removeItem(KEY); } catch (_) { /* ignorieren */ }
};

/* Entscheidung beim Laden der Datei:
   'self'      – diese Datei registriert die Karte (normaler Fall)
   'is-test'   – diese Datei IST die nachgeladene Testdatei und registriert die Karte
   'load-test' – Testdatei nachladen, diese Datei registriert nichts */
export function bootMode(win = window) {
  if (win.__RAC_LOADING_TEST) return 'is-test';
  // Ausschalten geht immer, auch per Adresse, falls die Testversion gar nicht startet
  try { if (new URLSearchParams(win.location.search).get('rac_channel') === 'stable') setTestWanted(false); } catch (_) { /* ignorieren */ }
  return testWanted() ? 'load-test' : 'self';
}

/* Welche Version läuft in diesem Browser: 'stable' | 'test' | 'test-missing' */
export const runningChannel = () => window.__RAC_CHANNEL || 'stable';
