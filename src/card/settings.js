/* Einstellungen der Kamera (Schalter, Regler, Auswahllisten) – Methoden der Klasse ReolinkAppCard */
import { SETTINGS } from '../constants.js';
import { esc } from '../util.js';

export default {
  /* ---------- Einstellungen: gruppiert, mit Reglern ---------- */
  _settingGroups() {
    return SETTINGS.map((g) => ({ ...g, items: g.items.map(([key, type, icon, btn, confirmKey]) => ({ key, type, icon, btn, confirmKey, id: this._e(key) }))
      .filter((it) => this._st(it.id)) })).filter((g) => g.items.length);
  },

  _updateSettings(box) {
    const groups = this._settingGroups();
    if (!this._group || !groups.some((g) => g.g === this._group)) this._group = groups.length ? groups[0].g : null;
    const sig = `${this._idx}|${this._lang}|${this._group}|${groups.map((g) => g.g + ':' + g.items.map((i) => i.key).join(',')).join(';')}`;
    if (box.dataset.sig !== sig) {
      box.dataset.sig = sig;
      box.innerHTML = groups.map((g) => `<div class="grp${g.g === this._group ? ' open' : ''}">
        <button class="gh" data-g="${g.g}"><ha-icon icon="${g.icon}"></ha-icon><span>${this._t(g.g)}</span><ha-icon class="gc" icon="mdi:chevron-${g.g === this._group ? 'up' : 'down'}"></ha-icon></button>
        ${g.g === this._group ? `<div class="gb">${g.items.map((it) => this._rowHtml(it)).join('')}</div>` : ''}</div>`).join('');
      box.querySelectorAll('.gh').forEach((b) => { b.onclick = () => { this._group = this._group === b.dataset.g ? '' : b.dataset.g; this._update(); }; });
      groups.forEach((g) => g.items.forEach((it) => this._bindRow(box, it)));
    }
    groups.forEach((g) => g.items.forEach((it) => this._syncRow(box, it)));
  },

  _rowHtml(it) {
    const ctl = it.type === 'sw' ? '<ha-switch></ha-switch>'
      : it.type === 'btn' ? `<button class="rowbtn">${this._t(it.btn)}</button>`
        : it.type === 'sel' ? '<select></select>'
          : '<span class="nv"></span>';
    const slider = it.type === 'num' ? '<input type="range" class="rng">' : '';
    return `<div class="row ${it.type}" data-k="${it.key}"><ha-icon icon="${it.icon}"></ha-icon><span class="rl">${this._t(it.key)}</span>${ctl}${slider}</div>`;
  },

  _bindRow(box, it) {
    const row = box.querySelector(`.row[data-k="${it.key}"]`);
    if (!row) return;
    const domain = it.id.split('.')[0];
    if (it.type === 'sw') row.querySelector('ha-switch').addEventListener('change', (e) => {
      const want = e.target.checked;
      this._call(domain, want ? 'turn_on' : 'turn_off', it.id);
    });
    else if (it.type === 'btn') row.querySelector('.rowbtn').onclick = async () => {
      if (it.confirmKey && !(await this._ask(this._t(it.confirmKey, { name: this._cam.name }), this._t('restart_btn'), true))) return;
      this._call('button', 'press', it.id);
    };
    else if (it.type === 'sel') row.querySelector('select').onchange = (e) => this._call('select', 'select_option', it.id, { option: e.target.value });
    else if (it.type === 'num') {
      const r = row.querySelector('.rng');
      r.addEventListener('input', () => { row.querySelector('.nv').textContent = r.value; row.dataset.drag = '1'; });
      r.addEventListener('change', () => { delete row.dataset.drag; this._call('number', 'set_value', it.id, { value: +r.value }); });
    }
  },

  _syncRow(box, it) {
    const row = box.querySelector(`.row[data-k="${it.key}"]`);
    const s = this._st(it.id);
    if (!row || !s) return;
    row.classList.toggle('na', s.state === 'unavailable');
    if (it.type === 'sw') row.querySelector('ha-switch').checked = s.state === 'on';
    else if (it.type === 'sel') {
      const sel = row.querySelector('select');
      const opts = s.attributes.options || [];
      if (sel.dataset.o !== opts.join()) {
        sel.dataset.o = opts.join();
        sel.innerHTML = opts.map((o) => `<option value="${esc(o)}">${esc(this._hass.formatEntityState ? this._hass.formatEntityState(s, o) : o)}</option>`).join('');
      }
      sel.value = s.state;
    } else if (it.type === 'num' && !row.dataset.drag) {
      const r = row.querySelector('.rng');
      const a = s.attributes;
      r.min = a.min ?? 0; r.max = a.max ?? 100; r.step = a.step ?? 1;
      r.value = s.state;
      row.querySelector('.nv').textContent = isNaN(+s.state) ? s.state : `${+s.state}${a.unit_of_measurement ? ' ' + a.unit_of_measurement : ''}`;
    }
  },
};
