/* Reolink App Card – Live, Steuerung & Wiedergabe im Stil der Reolink-App.
   Einstiegspunkt: registriert die Karte und den Editor in Home Assistant
   (oder lädt stattdessen die Testversion, siehe channel.js). */
import { ReolinkAppCard } from './card.js';
import { ReolinkAppCardEditor } from './editor.js';
import { bootMode, TEST_URL } from './channel.js';
import { cardSuggestion } from './suggestions.js';
import { RAC_VERSION } from './version.js';

function register(label) {
  if (!customElements.get('reolink-app-card')) customElements.define('reolink-app-card', ReolinkAppCard);
  if (!customElements.get('reolink-app-card-editor')) customElements.define('reolink-app-card-editor', ReolinkAppCardEditor);
  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === 'reolink-app-card')) {
    window.customCards.push({ type: 'reolink-app-card', name: 'Reolink App Card', preview: false, documentationURL: 'https://github.com/niondevelop/reolink-app-card',
      getEntitySuggestion: (hass, entityId) => cardSuggestion(hass, entityId),
      description: 'Live view, controls, settings and SD card playback for Reolink cameras, styled like the Reolink app' });
  }
  console.info(`%c REOLINK-APP-CARD %c ${RAC_VERSION}${label ? ` ${label}` : ''} `, 'background:#1e8bff;color:#fff', '');
}

const boot = bootMode();
if (boot === 'load-test' && !customElements.get('reolink-app-card')) {
  window.__RAC_LOADING_TEST = true;
  // Zeitstempel in der Adresse: nach dem Austauschen der Datei lädt der Browser sicher die neue
  import(`${TEST_URL}?v=${Date.now()}`)
    .then(() => {
      if (!customElements.get('reolink-app-card')) throw new Error('test file did not register the card');
      window.__RAC_CHANNEL = 'test';
    })
    .catch((e) => {
      console.warn(`Reolink App Card: test version ${TEST_URL} could not be loaded, using the stable version.`, e);
      window.__RAC_CHANNEL = 'test-missing';
      register();
    });
} else {
  if (boot === 'is-test') window.__RAC_CHANNEL = 'test';
  register(boot === 'is-test' ? 'TEST' : '');
}
