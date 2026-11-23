/* Visueller Editor der Karte */
import { BTN_DEFAULT, BTN_LABEL, Q, Q_BASE } from './constants.js';
import { detectCameras, needsEntity, otherCameras } from './entities.js';
import { ED_LABELS, STR, pickLang } from './i18n.js';
import { esc } from './util.js';

export class ReolinkAppCardEditor extends HTMLElement {
  /* Home Assistant ruft setConfig nach jeder eigenen Änderung erneut auf: dann nicht neu aufbauen,
     sonst klappen die Gruppen zu und offene Auswahllisten schliessen sich */
  setConfig(config) {
    const same = this._emitted && JSON.stringify(config) === this._emitted;
    this._config = { ...config, cameras: [...(config.cameras || [])] };
    if (!same) this._render();
  }
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
    this._emitted = JSON.stringify(cfg);
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: cfg }, bubbles: true, composed: true }));
  }

  _render() {
    if (!this._config || !this._hass) return;
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    const L = this._l;
    const detected = detectCameras(this._hass);
    // Nur den Namen zeigen; den technischen Teil der Entity-IDs nur, wenn zwei Kameras gleich heissen
    const camOpts = detected.map((c) => ({ value: c.prefix, label: detected.filter((d) => d.name === c.name).length > 1 ? `${c.name} (${c.prefix})` : c.name }));
    // Kameras anderer Hersteller: nur Livebild und Bedienpanel; gespeichert wird die Entität
    const others = otherCameras(this._hass);
    others.forEach((o) => camOpts.push({ value: o.entity, label: `${o.name} · ${L.other_cam}` }));
    // Allgemeine Einstellungen in aufklappbaren Unterkategorien (Werte bleiben flach in der Konfiguration)
    const group = (key, icon, schema) => ({ type: 'expandable', name: key, flatten: true, title: L[key], icon, schema });
    const general = [
      group('grp_display', 'mdi:monitor-dashboard', [
        { type: 'grid', name: '', schema: [
          { name: 'layout', selector: { select: { mode: 'dropdown', options: ['auto', 'right', 'left', 'bottom'].map((v) => ({ value: v, label: L[`layout_${v}`] })) } } },
          { name: 'panel', selector: { select: { mode: 'dropdown', options: ['events', 'settings', 'none'].map((v) => ({ value: v, label: L[`panel_${v}`] })) } } },
        ] },
        { name: 'language', selector: { select: { mode: 'dropdown', options: [{ value: 'auto', label: L.auto }, { value: 'en', label: 'English' }, { value: 'de', label: 'Deutsch' }, { value: 'fr', label: 'Français' }] } } },
        { type: 'grid', name: '', schema: [
          { name: 'show_camera_tabs', selector: { boolean: {} } },
          { name: 'show_live_playback', selector: { boolean: {} } },
          { name: 'show_controls', selector: { boolean: {} } },
          { name: 'show_settings', selector: { boolean: {} } },
          { name: 'show_mode', selector: { boolean: {} } },
        ] },
      ]),
      group('grp_scene', 'mdi:shield-home-outline', [
        { name: 'mode_entity', selector: { entity: { domain: ['input_select', 'select'] } } },
        { type: 'grid', name: '', schema: [
          { name: 'show_scene', selector: { boolean: {} } },
          { name: 'show_sd', selector: { boolean: {} } },
        ] },
      ]),
      group('grp_stream', 'mdi:cctv', [
        { type: 'grid', name: '', schema: [
          { name: 'default_quality', selector: { select: { mode: 'dropdown', options: Q_BASE.map((q) => ({ value: q, label: STR[this._lang][Q[q].key] })) } } },
          { name: 'live_timeout', selector: { number: { min: 0, max: 3600, step: 30, mode: 'box', unit_of_measurement: 's' } } },
        ] },
        { name: 'audio', selector: { select: { mode: 'dropdown', options: [{ value: 'manual', label: L.audio_manual }, { value: 'auto', label: L.audio_auto }] } } },
        { type: 'grid', name: '', schema: [
          { name: 'auto_live', selector: { boolean: {} } },
          { name: 'auto_switch', selector: { boolean: {} } },
        ] },
      ]),
      group('grp_playback', 'mdi:play-box-multiple-outline', [
        { type: 'grid', name: '', schema: [
          { name: 'playback', selector: { boolean: {} } },
          { name: 'autoplay_next', selector: { boolean: {} } },
        ] },
      ]),
      group('grp_doorbell', 'mdi:doorbell-video', [
        { type: 'grid', name: '', schema: [
          { name: 'doorbell_timeout', selector: { number: { min: 10, max: 120, step: 5, mode: 'box', unit_of_measurement: 's' } } },
          { name: 'doorbell_sound', selector: { boolean: {} } },
        ] },
      ]),
      group('grp_warn', 'mdi:alert-outline', [
        { type: 'grid', name: '', schema: [
          { name: 'battery_warning', selector: { number: { min: 0, max: 100, step: 5, mode: 'box', unit_of_measurement: '%' } } },
          { name: 'temperature_warning', selector: { number: { min: 20, max: 80, step: 1, mode: 'box', unit_of_measurement: '°C' } } },
        ] },
      ]),
    ];
    const camSchema = [
      { name: 'prefix', required: true, selector: { select: { mode: 'dropdown', custom_value: true, options: camOpts } } },
      { type: 'grid', name: '', schema: [{ name: 'name', selector: { text: {} } }, { name: 'media_name', selector: { text: {} } }] },
      { name: 'doorbell', selector: { entity: { domain: ['binary_sensor', 'input_boolean', 'input_button', 'button', 'event', 'switch', 'sensor'] } } },
      { name: 'talk_prepare', selector: { boolean: {} } },
      // Voreingestellter Bildausschnitt, z. B. bei Fischaugen-Objektiven
      { type: 'expandable', name: 'zoom_grp', flatten: true, title: L.zoom_grp, icon: 'mdi:magnify-plus-outline', schema: [
        { name: 'zoom', selector: { number: { min: 1, max: 4, step: 0.1, mode: 'slider' } } },
        { type: 'grid', name: '', schema: [
          { name: 'zoom_x', selector: { number: { min: 0, max: 100, step: 1, mode: 'slider', unit_of_measurement: '%' } } },
          { name: 'zoom_y', selector: { number: { min: 0, max: 100, step: 1, mode: 'slider', unit_of_measurement: '%' } } },
        ] },
      ] },
    ];
    const defaults = { mode_entity: '', audio: 'manual', doorbell_timeout: 30, doorbell_sound: true, default_quality: 'fluent', live_timeout: 300, auto_live: true, auto_switch: true, autoplay_next: true, show_scene: true, show_sd: true, show_camera_tabs: true, show_live_playback: true, show_controls: true, show_settings: true, show_mode: true, layout: 'auto', panel: 'events', playback: true, battery_warning: 20, temperature_warning: 45, hub_prefix: 'reolink_hub', language: 'auto' };
    if (!this._openCams) this._openCams = new Set(this._config.cameras.length === 1 ? [0] : []);
    this.shadowRoot.innerHTML = `<style>
      .cams { display: flex; flex-direction: column; gap: 10px; margin: 8px 0 12px; }
      #btnbox { margin-top: 12px; }
      .cam { border: 1px solid var(--divider-color); border-radius: 12px; }
      .ch { display: flex; align-items: center; gap: 8px; padding: 10px 12px; cursor: pointer; user-select: none; }
      .ch .tt { flex: 1; min-width: 0; display: flex; flex-direction: column; }
      .ch .tt b { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ch .tt small { color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .chev { width: 20px; text-align: center; color: var(--secondary-text-color); transition: transform .15s; }
      .cam.open .chev { transform: rotate(90deg); }
      .cb { display: none; padding: 0 12px 12px; }
      .cam.open .cb { display: block; }
      h3 { margin: 18px 0 6px; font-size: 16px; font-weight: 500; }
      h4 { margin: 16px 0 4px; font-size: 14px; font-weight: 500; }
      .hint { margin: 0 0 8px; font-size: 12px; color: var(--secondary-text-color); }
      button { font: inherit; cursor: pointer; border-radius: 8px; border: 1px solid var(--divider-color); background: none; color: inherit; padding: 6px 10px; }
      button:disabled { opacity: .35; cursor: default; }
      .add { width: 100%; padding: 10px; color: var(--primary-color); border-style: dashed; }
      .own { display: flex; align-items: center; gap: 8px; margin: 12px 0 4px; font-size: 14px; }
      .btns { display: flex; flex-direction: column; gap: 6px; }
      .brow { border: 1px solid var(--divider-color); border-radius: 10px; padding: 6px 8px; }
      .bh { display: flex; align-items: center; gap: 8px; }
      .bh .bl { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .bh .bl.off { color: var(--secondary-text-color); }
      .bh button { padding: 2px 8px; }
      .bf { margin-top: 6px; }
    </style>
    <h3>${L.cameras}</h3><div class="cams" id="cams"></div><button class="add" id="add">+ ${L.add}</button>
    <h3>${L.general}</h3><div id="gen"></div>
    <div class="cam${this._openBtns ? ' open' : ''}" id="btnbox"><div class="ch" id="btnhead"><span class="chev">›</span><span class="tt"><b>${L.buttons}</b><small>${L.buttons_sub}</small></span></div>
      <div class="cb"><p class="hint">${L.buttons_hint}</p><div id="btns"></div></div></div>`;
    const label = (s) => L[s.name] || s.name;

    const cams = this.shadowRoot.getElementById('cams');
    this._config.cameras.forEach((cam, i) => {
      const box = document.createElement('div');
      box.className = `cam${this._openCams.has(i) ? ' open' : ''}`;
      const hit0 = detected.find((d) => d.prefix === cam.prefix) || others.find((o) => o.entity === (cam.entity || cam.prefix));
      box.innerHTML = `<div class="ch" data-a="toggle"><span class="chev">›</span><span class="tt"><b>${esc(cam.name || (hit0 && hit0.name) || cam.prefix || '—')}</b><small>${esc(cam.entity || cam.prefix || '')}</small></span>${i ? `<button data-a="up" title="${L.up}">↑</button>` : ''}<button data-a="rm">${L.remove}</button></div><div class="cb"></div>`;
      const form = document.createElement('ha-form');
      form.hass = this._hass; form.schema = camSchema; form.data = cam; form.computeLabel = label;
      form.addEventListener('value-changed', (e) => {
        const v = { ...e.detail.value };
        const hit = detected.find((d) => d.prefix === v.prefix);
        if (hit && v.prefix !== cam.prefix) { if (!v.name) v.name = hit.name; if (!v.media_name) v.media_name = hit.name; if (needsEntity(hit.entity)) v.entity = hit.entity; else delete v.entity; }
        const other = others.find((o) => o.entity === v.prefix);
        if (other && v.prefix !== cam.prefix) { if (!v.name) v.name = other.name; delete v.media_name; delete v.entity; }
        Object.keys(v).forEach((k) => { if (v[k] === '' || v[k] === undefined) delete v[k]; });
        // Zoom 1× = ganzes Bild: Mittelpunkt nicht speichern; Mitte (50 %) ist Standard
        if (!(+v.zoom > 1)) { delete v.zoom; delete v.zoom_x; delete v.zoom_y; }
        ['zoom_x', 'zoom_y'].forEach((k) => { if (+v[k] === 50) delete v[k]; });
        const list = [...this._config.cameras]; list[i] = v;
        this._changed({ ...this._config, cameras: list });
        if ((hit || other) && v.prefix !== cam.prefix) this._render();
        else form.data = v;
      });
      const body = box.querySelector('.cb');
      body.appendChild(form);
      // Eigenes Bedienpanel nur für diese Kamera (sonst gilt die der Karte)
      const own = document.createElement('label');
      own.className = 'own';
      own.innerHTML = `<input type="checkbox" ${Array.isArray(cam.buttons) ? 'checked' : ''}><span>${L.own_buttons}</span>`;
      own.querySelector('input').onchange = (e) => {
        const list = [...this._config.cameras], v = { ...cam };
        if (e.target.checked) v.buttons = [...(Array.isArray(this._config.buttons) ? this._config.buttons : BTN_DEFAULT)];
        else delete v.buttons;
        list[i] = v;
        this._changed({ ...this._config, cameras: list });
        this._render();
      };
      body.appendChild(own);
      if (Array.isArray(cam.buttons)) {
        body.appendChild(this._btnEditor(cam.buttons, (next) => {
          const list = [...this._config.cameras]; list[i] = { ...this._config.cameras[i], buttons: next };
          this._changed({ ...this._config, cameras: list });
        }));
      }
      box.querySelector('.ch').onclick = (e) => {
        if (e.target.closest('button')) return;
        if (this._openCams.has(i)) this._openCams.delete(i); else this._openCams.add(i);
        box.classList.toggle('open', this._openCams.has(i));
      };
      box.querySelectorAll('.ch button').forEach((b) => {
        b.onclick = () => {
          const list = [...this._config.cameras];
          if (b.dataset.a === 'rm') { list.splice(i, 1); this._openCams = new Set([...this._openCams].filter((x) => x !== i).map((x) => (x > i ? x - 1 : x))); } else {
            [list[i - 1], list[i]] = [list[i], list[i - 1]];
            const a = this._openCams.has(i), z = this._openCams.has(i - 1);
            this._openCams.delete(i); this._openCams.delete(i - 1);
            if (a) this._openCams.add(i - 1);
            if (z) this._openCams.add(i);
          }
          this._changed({ ...this._config, cameras: list });
          this._render();
        };
      });
      cams.appendChild(box);
    });
    this.shadowRoot.getElementById('add').onclick = () => {
      const used = this._config.cameras.map((c) => c.prefix);
      const next = detected.find((d) => !used.includes(d.prefix));
      const cam = next ? { name: next.name, prefix: next.prefix, media_name: next.name, ...(needsEntity(next.entity) ? { entity: next.entity } : {}) } : { prefix: '' };
      this._openCams.add(this._config.cameras.length);
      this._changed({ ...this._config, cameras: [...this._config.cameras, cam] });
      this._render();
    };

    const gen = document.createElement('ha-form');
    gen.hass = this._hass; gen.schema = general; gen.computeLabel = label;
    // Die ältere Option show_hub: false blendet Szenenmodus und SD-Belegung aus
    const defOf = (k) => defaults[k];
    const data = { ...defaults };
    Object.keys(defaults).forEach((k) => { if (this._config[k] !== undefined) data[k] = this._config[k]; });
    if (this._config.show_hub === false) { if (this._config.show_scene === undefined) data.show_scene = false; if (this._config.show_sd === undefined) data.show_sd = false; }
    gen.data = data;
    gen.addEventListener('value-changed', (e) => {
      const v = e.detail.value, cfg = { ...this._config };
      delete cfg.show_hub;
      Object.keys(defaults).forEach((k) => { if (v[k] === undefined || v[k] === null || v[k] === defOf(k)) delete cfg[k]; else cfg[k] = v[k]; });
      gen.data = { ...v };
      this._changed(cfg);
    });
    this.shadowRoot.getElementById('gen').appendChild(gen);

    this.shadowRoot.getElementById('btnhead').onclick = () => {
      this._openBtns = !this._openBtns;
      this.shadowRoot.getElementById('btnbox').classList.toggle('open', this._openBtns);
    };
    // Bedienpanel der Karte (gilt für alle Kameras ohne eigenes Bedienpanel)
    const cardBtns = Array.isArray(this._config.buttons) ? this._config.buttons : BTN_DEFAULT;
    this.shadowRoot.getElementById('btns').appendChild(this._btnEditor(cardBtns, (next) => {
      const cfg = { ...this._config };
      if (JSON.stringify(next) === JSON.stringify(BTN_DEFAULT)) delete cfg.buttons; else cfg.buttons = next;
      this._changed(cfg);
    }));
  }

  /* Liste der Knöpfe: eingebaute ein-/ausblenden und anordnen, eigene Knöpfe (Licht, Türöffner …) hinzufügen.
     Gespeichert wird nur, was sichtbar ist, in der gewählten Reihenfolge. */
  _btnEditor(list, onChange) {
    const L = this._l, T = STR[this._lang] || STR.en;
    const wrap = document.createElement('div');
    wrap.className = 'btns';
    const vis = list.filter((b) => typeof b !== 'string' || BTN_DEFAULT.includes(b));
    const hidden = BTN_DEFAULT.filter((b) => !vis.includes(b));
    const save = (next) => { onChange(next); this._render(); };
    const name = (b) => (typeof b === 'string' ? T[BTN_LABEL[b]] || b
      : b.name || (b.entity && this._hass.states[b.entity] && this._hass.states[b.entity].attributes.friendly_name) || b.entity || L.custom_button);
    vis.forEach((b, i) => {
      const row = document.createElement('div');
      row.className = 'brow';
      row.dataset.b = typeof b === 'string' ? b : `x${i}`;
      row.innerHTML = `<div class="bh">${typeof b === 'string' ? '<input type="checkbox" checked>' : '<span style="width:13px"></span>'}
        <span class="bl">${esc(name(b))}${typeof b === 'string' ? '' : ` <small>· ${esc(L.custom_button)}</small>`}</span>
        <button data-a="up" title="${L.up}" ${i ? '' : 'disabled'}>↑</button><button data-a="down" title="${L.down}" ${i < vis.length - 1 ? '' : 'disabled'}>↓</button>
        ${typeof b === 'string' ? '' : `<button data-a="rm" title="${L.remove}">✕</button>`}</div>`;
      const cb = row.querySelector('input');
      if (cb) cb.onchange = () => save(vis.filter((_, k) => k !== i));
      row.querySelectorAll('button').forEach((btn) => {
        btn.onclick = () => {
          const next = [...vis];
          if (btn.dataset.a === 'rm') next.splice(i, 1);
          else { const j = btn.dataset.a === 'up' ? i - 1 : i + 1; [next[i], next[j]] = [next[j], next[i]]; }
          save(next);
        };
      });
      if (typeof b !== 'string') {
        const form = document.createElement('ha-form');
        form.className = 'bf';
        form.hass = this._hass;
        form.schema = [
          { name: 'entity', selector: { entity: { domain: ['light', 'switch', 'input_boolean', 'lock', 'cover', 'fan', 'button', 'input_button', 'script', 'scene', 'automation', 'siren'] } } },
          { type: 'grid', name: '', schema: [{ name: 'name', selector: { text: {} } }, { name: 'icon', selector: { icon: {} } }] },
          { type: 'grid', name: '', schema: [{ name: 'service', selector: { text: {} } }, { name: 'confirm', selector: { boolean: {} } }] },
        ];
        form.data = b;
        form.computeLabel = (sch) => L[`btn_${sch.name}`] || sch.name;
        form.addEventListener('value-changed', (e) => {
          const v = { ...e.detail.value };
          Object.keys(v).forEach((k) => { if (v[k] === '' || v[k] === undefined || v[k] === null) delete v[k]; });
          const next = [...vis]; next[i] = v;
          onChange(next);
          vis[i] = v;
          form.data = v;
          row.querySelector('.bl').firstChild.textContent = name(v);
        });
        row.appendChild(form);
      }
      wrap.appendChild(row);
    });
    hidden.forEach((b) => {
      const row = document.createElement('div');
      row.className = 'brow';
      row.dataset.b = b;
      row.innerHTML = `<div class="bh"><input type="checkbox"><span class="bl off">${esc(name(b))}</span></div>`;
      row.querySelector('input').onchange = () => save([...vis, b]);
      wrap.appendChild(row);
    });
    const add = document.createElement('button');
    add.className = 'add';
    add.dataset.a = 'add-btn';
    add.textContent = `+ ${L.add_button}`;
    add.onclick = () => save([...vis, { entity: '' }]);
    wrap.appendChild(add);
    return wrap;
  }
}
