/* Übersetzungen und Sprachwahl */

/* ---------- Sprache ----------
   Die Texte liegen in src/translations/<sprache>.json: "card" für die Karte, "editor" für den visuellen Editor.
   Neue Sprache: Datei kopieren, übersetzen, hier eintragen; ein Test prüft, dass alle Schlüssel vorhanden sind. */
import de from './translations/de.json' with { type: 'json' };
import en from './translations/en.json' with { type: 'json' };
import fr from './translations/fr.json' with { type: 'json' };

const ALL = { de, en, fr };

export const STR = Object.fromEntries(Object.entries(ALL).map(([l, t]) => [l, t.card]));

export const LANGS = ['en', 'de', 'fr'];

export const LOCALES = { de: 'de-CH', fr: 'fr-CH', en: undefined };

/* Sprache wählen: Option > Sprache von Home Assistant > Englisch */
export const pickLang = (opt, hass) => {
  const l = String((opt && opt !== 'auto' ? opt : hass && ((hass.locale && hass.locale.language) || hass.language)) || 'en').toLowerCase();
  return LANGS.find((x) => l.startsWith(x)) || 'en';
};

export const fmt = (s, v = {}) => s.replace(/\{(\w+)\}/g, (_, k) => (v[k] ?? ''));

/* Beschriftungen des visuellen Editors */
export const ED_LABELS = Object.fromEntries(Object.entries(ALL).map(([l, t]) => [l, t.editor]));
