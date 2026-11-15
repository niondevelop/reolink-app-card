/* Visueller Editor der Karte */
import { Q, Q_ORDER } from './constants.js';
import { detectCameras, prefixOf } from './entities.js';
import { ED_LABELS, STR, pickLang } from './i18n.js';
import { esc } from './util.js';

export class ReolinkAppCardEditor extends HTMLElement {
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
        if (hit && v.prefix !== cam.prefix) { if (!v.name) v.name = hit.name; if (!v.media_name) v.media_name = hit.name; if (!prefixOf(hit.entity)) v.entity = hit.entity; }
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
