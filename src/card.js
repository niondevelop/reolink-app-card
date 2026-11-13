/* Die Karte: Klasse und Zusammensetzung aus den Modulen in card/ */
import { camConfig, detectCameras } from './entities.js';
import { pickLang, STR } from './i18n.js';
import audio from './card/audio.js';
import core from './card/core.js';
import doorbell from './card/doorbell.js';
import links from './card/links.js';
import live from './card/live.js';
import playback from './card/playback.js';
import ptz from './card/ptz.js';
import render from './card/render.js';
import settings from './card/settings.js';

export class ReolinkAppCard extends HTMLElement {
  constructor() {
    super();
    // Ereignis-Handler mit festem this, damit sie sich wieder abmelden lassen
    this._onLink = () => this._handleLink();
    this._onAppStop = (e) => this._handleAppStop(e);
  }

  static getConfigElement() { return document.createElement('reolink-app-card-editor'); }

  static getStubConfig(hass) {
    const cams = detectCameras(hass).slice(0, 4).map(camConfig);
    const name = STR[pickLang('auto', hass)].camera;
    return { cameras: cams.length ? cams : [{ name, prefix: 'camera' }] };
  }
}

// Methoden aus den Modulen übernehmen (inkl. Getter/Setter wie hass)
[core, live, audio, doorbell, ptz, links, playback, settings, render].forEach((part) => {
  Object.defineProperties(ReolinkAppCard.prototype, Object.getOwnPropertyDescriptors(part));
});
