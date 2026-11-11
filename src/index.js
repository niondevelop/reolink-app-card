/* Reolink App Card – Live, Steuerung & Wiedergabe im Stil der Reolink-App.
   Einstiegspunkt: registriert die Karte und den Editor in Home Assistant. */
import { ReolinkAppCard } from './card.js';
import { ReolinkAppCardEditor } from './editor.js';
import { cardSuggestion } from './suggestions.js';
import { RAC_VERSION } from './version.js';

if (!customElements.get('reolink-app-card')) customElements.define('reolink-app-card', ReolinkAppCard);
if (!customElements.get('reolink-app-card-editor')) customElements.define('reolink-app-card-editor', ReolinkAppCardEditor);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'reolink-app-card')) {
  window.customCards.push({ type: 'reolink-app-card', name: 'Reolink App Card', preview: false, documentationURL: 'https://github.com/niondevelop/reolink-app-card',
    getEntitySuggestion: (hass, entityId) => cardSuggestion(hass, entityId),
    description: 'Live view, controls, settings and SD card playback for Reolink cameras, styled like the Reolink app' });
}
console.info(`%c REOLINK-APP-CARD %c ${RAC_VERSION} `, 'background:#1e8bff;color:#fff', '');
