/* Schwenken & Neigen (PTZ) – Methoden der Klasse ReolinkAppCard */
import { esc } from '../util.js';

export default {
  /* ---------- Schwenken & Neigen (PTZ) ---------- */
  _hasPtz(cam = this._cam) { return ['ptz_left', 'ptz_right', 'ptz_up', 'ptz_down'].some((k) => this._st(this._e(k, cam))); },

  _press(id) { if (this._st(id)) this._call('button', 'press', id); },

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
  },

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
  },
};
