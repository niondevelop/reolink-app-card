/* Aufbau und Aktualisierung der Ansicht – Methoden der Klasse ReolinkAppCard */
import { EVT, Q, Q_ORDER } from '../constants.js';
import { modeIcon } from '../entities.js';
import { LOCALES, STR } from '../i18n.js';
import { RAC_CSS } from '../styles.js';
import { esc } from '../util.js';
import { runningChannel, setTestWanted } from '../channel.js';
import { RAC_VERSION } from '../version.js';

export default {
  /* ---------- Aufbau ---------- */
  _build() {
    this._built = true;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>${RAC_CSS}</style>
      <ha-card>
        <button class="testbar" id="testbar"><ha-icon icon="mdi:flask-outline"></ha-icon><span id="testbar-l"></span></button>
        <div class="top"><div class="tabs" id="tabs"></div><button class="gridbtn" id="gridbtn"><ha-icon></ha-icon></button></div>
        <div class="hub" id="hub"></div>
        <div class="warns" id="warns"></div>
        <div class="stage" id="stage">
          <div class="media" id="media">
            <img class="prev" id="prev" alt="">
            <div class="pic" id="pic"></div>
            <video id="video" playsinline controls></video>
          </div>
          <div class="grid" id="grid"></div>
          <div class="ov top">
            <div class="pillrow"><span class="pill" id="badge"></span><span class="pill" id="zoompill"></span></div>
            <div class="pillrow" id="stat"></div>
          </div>
          <div class="ov det" id="det"></div>
          <div class="toast" id="toast"></div>
          <button class="bigplay" id="bigplay"><ha-icon icon="mdi:play"></ha-icon></button>
          <div class="ring" id="ring">
            <div class="rhead"><span class="rbell"><ha-icon icon="mdi:doorbell-video"></ha-icon></span><b id="ring-t"></b><span id="ring-n"></span></div>
            <div class="rbtns">
              <button class="rb no" id="ring-no"><span><ha-icon icon="mdi:phone-hangup"></ha-icon></span><small id="ring-no-l"></small></button>
              <button class="rb yes" id="ring-yes"><span><ha-icon icon="mdi:phone"></ha-icon></span><small id="ring-yes-l"></small></button>
            </div>
          </div>
          <div class="talk" id="talk">
            <span class="tpill"><span class="tw"><i></i><i></i><i></i><i></i></span><span id="talk-l"></span></span>
          </div>
          <div class="ov bottom">
            <span class="pill" id="timer"></span>
            <span class="spacer"></span>
            <button class="pill btn" id="speed"></button>
            <button class="pill btn icon" id="next"><ha-icon icon="mdi:skip-next"></ha-icon></button>
            <button class="pill btn icon" id="dl"><ha-icon icon="mdi:download"></ha-icon></button>
            <button class="pill btn icon" id="unzoom"><ha-icon icon="mdi:magnify-minus-outline"></ha-icon></button>
            <button class="pill btn icon" id="snd"><ha-icon icon="mdi:volume-off"></ha-icon></button>
            <button class="pill btn icon" id="stop"><ha-icon icon="mdi:stop"></ha-icon></button>
            <button class="pill btn icon" id="fs"><ha-icon icon="mdi:fullscreen"></ha-icon></button>
          </div>
        </div>
        <div class="seg"><button id="m-live"></button><button id="m-play"></button></div>
        <div id="pane-live">
          <div class="barwrap"><div class="bar" id="ctrls"></div><div class="qmenu" id="qmenu"></div></div>
          <div class="ptz" id="ptz"></div>
          <button class="more" id="more"><ha-icon icon="mdi:tune-variant"></ha-icon><span id="more-l"></span><ha-icon id="chev" icon="mdi:chevron-down"></ha-icon></button>
          <div class="settings" id="settings"></div>
        </div>
        <div class="dlg" id="dlg" role="dialog" aria-modal="true"><div class="dbox"><div class="dtext" id="dtext"></div><div class="dbtns"><button id="dno"></button><button id="dyes"></button></div></div></div>
        <div id="pane-play">
          <div class="days" id="days"></div>
          <div class="pqrow" id="pqrow"><span id="pq-l"></span><div class="pq" id="pq"><button data-q="low"></button><button data-q="high"></button></div></div>
          <div class="filters" id="filters"></div>
          <div class="tl"><div class="tlbar" id="tlbar"></div><div class="tlh"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div></div>
          <div class="list" id="list"></div>
        </div>
      </ha-card>`;
    const $ = (id) => root.getElementById(id);
    this.$ = $;
    // Hinweis „Testversion“ (siehe channel.js); antippen führt zur stabilen Version zurück
    $('testbar').onclick = async () => {
      if (runningChannel() === 'test' && !(await this._ask(this._t('test_back'), this._t('test_back_btn')))) return;
      setTestWanted(false);
      location.reload();
    };
    $('pq').querySelectorAll('button').forEach((b) => { b.onclick = () => this._setPlayQ(b.dataset.q); });
    $('bigplay').onclick = () => { this._expired = false; this._startLive(); };
    $('stop').onclick = () => {
      if (this._playing) this._stopPlayback();
      else { this._expired = true; this._stopLive(); }
    };
    $('fs').onclick = () => this._fullscreen();
    $('gridbtn').onclick = () => this._setGrid(!this._grid);
    $('m-live').onclick = () => this._setMode('live');
    $('m-play').onclick = () => this._setMode('play');
    $('more').onclick = () => { this._settingsOpen = !this._settingsOpen; this._update(); };
    $('speed').onclick = () => this._cycleSpeed();
    $('next').onclick = () => this._playNext();
    $('dl').onclick = () => this._download();
    $('unzoom').onclick = () => this._resetZoom();
    $('snd').onclick = () => { this._sound = !this._sound; this._sndCheck = this._sound; this._applySound(); this._update(); };
    // Ohne Tonspur im WebRTC-Stream einmal darauf hinweisen
    $('pic').addEventListener('streams', (e) => {
      const src = e.composedPath()[0];
      if (!this._sndCheck || !src || src.localName !== 'ha-web-rtc-player' || !e.detail || !e.detail.hasVideo) return;
      this._sndCheck = false;
      if (!e.detail.hasAudio) this._toast({ text: this._t('no_audio'), color: '#636366', icon: 'mdi:volume-off', wrap: true });
    });
    // Meldungen des Kamera-Streams von Home Assistant (WebRTC-Player in der picture-entity-Karte)
    $('ring-yes').onclick = () => this._endRing(true);
    $('ring-no').onclick = () => this._endRing(false);
    $('pic').addEventListener('microphone-changed', (e) => { if (!this._appSession && !this._appMic) this._setMic(e.detail.state); });
    $('pic').addEventListener('stream-type-changed', (e) => { this._streamType = e.detail.type || null; this._update(); });
    $('prev').onload = () => { $('prev').classList.add('ok'); };
    $('prev').onerror = () => { $('prev').classList.remove('ok'); };
    const v = $('video');
    v.addEventListener('ended', () => { if (this._config.autoplay_next) this._playNext(true); });
    v.addEventListener('loadedmetadata', () => { v.playbackRate = this._speed; });
    this._setupZoom();
    if (this.isConnected) this._observe();
  },

  _controls() {
    const c = this._cam, items = [];
    const siren = this._e('siren'), light = this._e('light'), mrec = this._e('manual_rec');
    if (!this._grid) {
      const active = this._mic !== 'off', why = active ? null : this._talkReason();
      const legacy = why === 'feature' && this._talkLegacy();
      items.push({ id: 'talk', icon: active ? 'mdi:phone-hangup' : 'mdi:phone', on: active, warn: active,
        ring: this._mic === 'connecting', dis: !!why && !legacy,
        label: active ? this._t('hang_up') : legacy ? this._t('talk_app') : this._t('talk'),
        run: () => (legacy ? this._talk() : this._toggleTalk()) });
    }
    if (this._st(siren)) items.push({ id: 'siren', icon: 'mdi:alarm-light-outline', label: this._t('siren'), on: this._on(siren), warn: true,
      run: async () => (this._on(siren) ? this._call('siren', 'turn_off', siren)
        : ((await this._ask(this._t('siren_confirm', { name: c.name }), this._t('siren_btn'), true)) && this._call('siren', 'turn_on', siren))) });
    if (this._st(light)) items.push({ id: 'light', icon: 'mdi:flashlight', label: this._t('spotlight'), on: this._on(light),
      run: () => this._call('light', 'toggle', light) });
    if (this._st(mrec)) items.push({ id: 'rec', icon: 'mdi:video-outline', label: this._t('record'), on: this._on(mrec),
      run: () => this._call('switch', 'toggle', mrec) });
    items.push({ id: 'snap', icon: 'mdi:camera-outline', label: this._t('snapshot'), run: () => this._snapshot() });
    if (!this._grid && this._hasPtz()) items.push({ id: 'ptz', icon: 'mdi:arrow-all', label: this._t('ptz'), on: this._ptzOpen,
      run: () => { this._ptzOpen = !this._ptzOpen; this._qOpen = false; this._update(); } });
    if (this._qAvail().length && !this._grid) items.push({ id: 'q', icon: Q[this._quality].icon,
      label: `${this._t('quality')}: ${this._t(Q[this._quality].key)}`, on: this._qOpen,
      run: () => { this._qOpen = !this._qOpen; this._ptzOpen = false; this._update(); } });
    return items;
  },

  /* ---------- Rendering ---------- */
  _renderTabs() {
    if (!this._built) return;
    const box = this.$('tabs');
    box.innerHTML = '';
    this._cams.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'tab';
      b.dataset.i = i;
      b.innerHTML = `<span class="dot"></span><span class="tn">${esc(c.name)}</span><span class="tb"></span>`;
      b.onclick = () => { if (this._grid) this._setGrid(false); this._select(i); };
      box.appendChild(b);
    });
  },

  _batteryIcon(cam) {
    const v = this._num(this._e('battery', cam));
    if (v === null) return null;
    const lvl = Math.max(10, Math.min(100, Math.round(v / 10) * 10));
    const charging = /^charg|lade/i.test((this._st(this._e('battery_state', cam)) || {}).state || '');
    return { v: Math.round(v), charging, icon: `mdi:battery${charging ? '-charging' : ''}${lvl === 100 ? '' : '-' + lvl}` };
  },

  _camDot(cam) {
    const camSt = this._st(this._e('cam_sd', cam));
    return !camSt || camSt.state === 'unavailable' ? 'off' : this._det(cam).length ? 'alert' : this._on(this._e('sleep', cam)) ? 'sleep' : 'on';
  },

  _updateTimer() {
    const t = this.$('timer'), timed = this._live && !!this._liveEnds;
    const left = timed ? Math.max(0, Math.ceil((this._liveEnds - Date.now()) / 1000)) : 0;
    const txt = timed ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : '';
    if (t.textContent !== txt) t.textContent = txt;
    t.style.display = timed ? '' : 'none';
  },

  _update() {
    if (!this._built || !this._hass) return;
    const $ = this.$, c = this._cam, root = this.shadowRoot;
    const playing = !!this._playing;

    // Kopf: Tabs & Rasterknopf
    root.querySelectorAll('.tab').forEach((b) => {
      const cam = this._cams[+b.dataset.i];
      b.classList.toggle('sel', !this._grid && +b.dataset.i === this._idx);
      const bat = this._batteryIcon(cam);
      b.querySelector('.tb').textContent = bat ? `${bat.v}%` : '';
      b.querySelector('.dot').className = `dot ${this._camDot(cam)}`;
    });
    const gb = $('gridbtn');
    gb.style.display = this._cams.length > 1 ? '' : 'none';
    gb.classList.toggle('sel', this._grid);
    gb.title = this._grid ? this._t('single') : this._t('grid');
    gb.querySelector('ha-icon').setAttribute('icon', this._grid ? 'mdi:checkbox-blank-outline' : 'mdi:view-grid-outline');

    this._updateHub();
    this._updateWarnings();

    // Bühne
    $('stage').classList.toggle('playing', playing);
    $('stage').classList.toggle('live', this._live);
    $('stage').classList.toggle('gridmode', this._grid);
    const ringing = !!this._ring && !playing;
    $('stage').classList.toggle('ringing', ringing);
    if (ringing) {
      $('ring-t').textContent = this._t('ring_title');
      $('ring-n').textContent = this._cams[this._ring.idx].name;
      $('ring-yes-l').textContent = this._t('answer');
      $('ring-no-l').textContent = this._t('decline');
    }
    this._updatePtz();
    const talking = this._mic !== 'off' && !this._grid && !playing;
    $('stage').classList.toggle('talking', talking);
    $('talk').classList.toggle('conn', this._mic === 'connecting');
    $('talk').classList.toggle('lvl', !!this._meterCtx);
    $('snd').style.display = this._live && !this._grid && !playing ? '' : 'none';
    $('snd').classList.toggle('on', this._sound);
    $('snd').querySelector('ha-icon').setAttribute('icon', this._sound ? 'mdi:volume-high' : 'mdi:volume-off');
    $('snd').title = this._sound ? this._t('sound_off') : this._t('sound_on');
    if (talking) this._talkLabel();
    $('stage').classList.toggle('haspic', !!this._snaps[this._idx]);
    if (this._snaps[this._idx] && $('prev').getAttribute('src') !== this._snaps[this._idx].url) $('prev').src = this._snaps[this._idx].url;

    const snap = this._snaps[this._idx];
    const tm = snap ? snap.time.toLocaleTimeString(LOCALES[this._lang], { hour: '2-digit', minute: '2-digit' }) : '';
    $('badge').innerHTML = playing ? `<ha-icon icon="mdi:history"></ha-icon>${esc(this._playing.time)}`
      : this._live ? '<i class="rec"></i>LIVE'
        : this._on(this._e('sleep')) ? `<ha-icon icon="mdi:sleep"></ha-icon>${this._t('sleeping')}${tm ? ' · ' + tm : ''}`
          : `${this._t('paused')}${tm ? ' · ' + this._t('preview_at', { time: tm }) : ''}`;

    let stat = '';
    if (!this._grid) {
      const w = this._num(this._e('wifi'));
      if (w !== null) {
        // Reolink liefert je nach Gerät 0–4 Balken oder dBm (negativ)
        const bars = w < 0 ? (w >= -55 ? 4 : w >= -65 ? 3 : w >= -75 ? 2 : 1) : Math.max(1, Math.min(4, Math.round(w)));
        stat += `<span class="pill" title="${this._t('wifi')} ${w < 0 ? w + ' dBm' : bars + '/4'}"><ha-icon icon="mdi:wifi-strength-${bars}"></ha-icon></span>`;
      }
      const bat = this._batteryIcon(c);
      if (bat) stat += `<span class="pill ${bat.v <= this._config.battery_warning && !bat.charging ? 'low' : ''}"><ha-icon icon="${bat.icon}"></ha-icon>${bat.v}%</span>`;
    }
    $('stat').innerHTML = stat;

    const active = this._grid ? [] : this._det(c);
    $('det').innerHTML = active.map((k) => `<span class="pill det" style="--c:${EVT[k].color}"><ha-icon icon="${EVT[k].icon}"></ha-icon>${this._t(`evt_${k}`)}</span>`).join('');

    // Raster-Zellen
    root.querySelectorAll('.cell').forEach((cell) => {
      const cam = this._cams[+cell.dataset.i];
      const bat = this._batteryIcon(cam);
      cell.querySelector('.cb').textContent = bat ? ` · ${bat.v}%` : '';
      cell.querySelector('.dot').className = `dot ${this._camDot(cam)}`;
      cell.classList.toggle('alert', this._det(cam).length > 0);
    });

    this._updateTimer();
    $('stop').style.display = this._live || playing ? '' : 'none';
    $('stop').title = this._t('stop_live');
    $('fs').title = this._t('fullscreen');
    $('bigplay').title = this._t('start_live');
    $('bigplay').style.display = this._live || playing || this._mode !== 'live' ? 'none' : '';
    $('speed').style.display = playing ? '' : 'none';
    $('speed').textContent = `${this._speed}×`;
    $('speed').title = this._t('speed');
    const files = this._visibleFiles;
    const pi = playing ? files.findIndex((f) => f.node.media_content_id === this._playing.node.media_content_id) : -1;
    $('next').style.display = playing && pi >= 0 && pi + 1 < files.length ? '' : 'none';
    $('next').title = this._t('next');
    $('dl').style.display = playing && this._playUrl && !this._hls ? '' : 'none';
    $('dl').title = this._t('download');
    $('unzoom').title = this._t('reset_zoom');
    this._applyZoom();

    // Modus
    $('m-live').textContent = this._t('live');
    $('m-play').textContent = this._t('playback');
    $('more-l').textContent = this._t('settings');
    const ch = runningChannel();
    $('testbar').style.display = ch === 'stable' ? 'none' : '';
    $('testbar').classList.toggle('missing', ch === 'test-missing');
    if (ch !== 'stable') $('testbar-l').textContent = this._t(ch === 'test' ? 'test_on' : 'test_missing', { v: RAC_VERSION });
    $('m-live').classList.toggle('sel', this._mode === 'live');
    $('m-play').classList.toggle('sel', this._mode === 'play');
    $('pane-live').style.display = this._mode === 'live' ? '' : 'none';
    $('pane-play').style.display = this._mode === 'play' ? '' : 'none';

    if (this._mode === 'live') this._updateLivePane();
    else this._updatePlayPane();
  },

  /* Kopfzeile: eigener Modus (z. B. input_select für Benachrichtigungen) oder Reolink-Szenenmodus, dazu SD-Karte */
  _updateHub() {
    const box = this.$('hub'), cfg = this._config;
    const modeId = cfg.mode_entity || null;
    const useScene = cfg.show_hub && (modeId ? cfg.show_scene === true : cfg.show_scene !== false);
    const scene = useScene ? this._hubE('scene') : null;
    const storage = cfg.show_hub ? this._hubE('storage') : null;
    const m = this._st(modeId), s = this._st(scene), sd = this._num(storage);
    if (!m && !s && sd === null) { box.style.display = 'none'; return; }
    box.style.display = '';
    const fmtOpt = (st, o) => (this._hass.formatEntityState ? this._hass.formatEntityState(st, o) : o);
    const rows = [];
    if (m) {
      const icons = cfg.mode_icons || {};
      rows.push({ id: modeId, st: m, opts: m.attributes.options || [],
        icon: (o) => icons[o] || modeIcon(o), label: (o) => fmtOpt(m, o) });
    }
    if (s) {
      const icons = { disarm: 'mdi:shield-off-outline', home: 'mdi:home-outline', away: 'mdi:shield-lock-outline' };
      rows.push({ id: scene, st: s, opts: (s.attributes.options || []).filter((o) => o !== 'off'),
        icon: (o) => icons[o] || 'mdi:shield-outline', label: (o) => (STR[this._lang][`scene_${o}`] ? this._t(`scene_${o}`) : fmtOpt(s, o)) });
    }
    const sig = `${this._lang}|${rows.map((r) => `${r.id}:${r.opts.join()}:${r.st.state}`).join('|')}|${sd === null ? '' : Math.round(sd * 10)}`;
    if (box.dataset.sig === sig) return;
    box.dataset.sig = sig;
    box.innerHTML = rows.map((r, i) => `<div class="scene" data-r="${i}">${r.opts.map((o) => `<button data-o="${esc(o)}" class="${r.st.state === o ? 'sel' : ''}">
      <ha-icon icon="${esc(r.icon(o))}"></ha-icon><span>${esc(r.label(o))}</span></button>`).join('')}</div>`).join('')
      + (sd !== null ? `<span class="sd"><ha-icon icon="mdi:micro-sd"></ha-icon>${this._t('sd', { v: sd < 10 ? sd.toFixed(1) : Math.round(sd) })}</span>` : '');
    box.querySelectorAll('.scene').forEach((row) => {
      const r = rows[+row.dataset.r];
      row.querySelectorAll('button').forEach((b) => {
        b.onclick = () => { if (b.dataset.o !== r.st.state) this._call(r.id.split('.')[0], 'select_option', r.id, { option: b.dataset.o }); };
      });
    });
  },

  _updateWarnings() {
    const cfg = this._config, warns = [];
    this._cams.forEach((cam) => {
      const bat = this._batteryIcon(cam);
      if (bat && cfg.battery_warning > 0 && bat.v <= cfg.battery_warning && !bat.charging) warns.push({ icon: 'mdi:battery-alert-variant-outline', text: this._t('bat_low', { name: cam.name, v: bat.v }) });
      const tmp = this._num(this._e('battery_temp', cam));
      if (tmp !== null && cfg.temperature_warning !== false && tmp >= cfg.temperature_warning) warns.push({ icon: 'mdi:thermometer-alert', text: this._t('temp_high', { name: cam.name, v: Math.round(tmp) }) });
      if (tmp !== null && cfg.temperature_low_warning !== false && tmp <= cfg.temperature_low_warning) warns.push({ icon: 'mdi:snowflake-alert', text: this._t('temp_low', { name: cam.name, v: Math.round(tmp) }) });
    });
    const box = this.$('warns');
    const sig = warns.map((w) => w.text).join('|');
    if (box.dataset.sig === sig) return;
    box.dataset.sig = sig;
    box.innerHTML = warns.map((w) => `<div class="warn"><ha-icon icon="${w.icon}"></ha-icon><span>${esc(w.text)}</span></div>`).join('');
  },

  _updateLivePane() {
    const $ = this.$;
    const ctrls = this._controls();
    const sig = ctrls.map((x) => x.id).join();
    if ($('ctrls').dataset.sig !== sig) {
      $('ctrls').dataset.sig = sig;
      const btn = (x) => `<button class="tbn${x.id === 'talk' ? ' big' : ''}" data-id="${x.id}"><ha-icon></ha-icon></button>`;
      const mid = ctrls.find((x) => x.id === 'talk'), rest = ctrls.filter((x) => x !== mid);
      // Hörer in die Mitte, die übrigen Buttons links und rechts davon verteilt
      const half = Math.ceil(rest.length / 2);
      $('ctrls').classList.toggle('split', !!mid);
      $('ctrls').innerHTML = mid
        ? `<div class="side">${rest.slice(0, half).map(btn).join('')}</div>${btn(mid)}<div class="side">${rest.slice(half).map(btn).join('')}</div>`
        : ctrls.map(btn).join('');
      ctrls.forEach((x) => { $('ctrls').querySelector(`[data-id="${x.id}"]`).onclick = () => this._controls().find((y) => y.id === x.id).run(); });
    }
    ctrls.forEach((x) => {
      const b = $('ctrls').querySelector(`[data-id="${x.id}"]`);
      const icon = b.querySelector('ha-icon');
      if (icon.getAttribute('icon') !== x.icon) icon.setAttribute('icon', x.icon);
      b.title = x.label; b.setAttribute('aria-label', x.label);
      b.classList.toggle('on', !!x.on && !x.warn);
      b.classList.toggle('warn', !!x.on && !!x.warn);
      b.classList.toggle('dis', !!x.dis);
      b.classList.toggle('ring', !!x.ring);
    });

    // Qualitätsmenü
    const qm = $('qmenu');
    qm.classList.toggle('open', this._qOpen);
    if (this._qOpen) {
      const avail = this._qAvail();
      const qsig = `${this._idx}|${this._quality}|${avail.join()}|${this._lang}`;
      if (qm.dataset.sig !== qsig) {
        qm.dataset.sig = qsig;
        qm.innerHTML = Q_ORDER.map((q) => `<button class="qopt${q === this._quality ? ' sel' : ''}" data-q="${q}"${avail.includes(q) ? '' : ' disabled'}>
          <ha-icon icon="${Q[q].icon}"></ha-icon><span>${this._t(Q[q].key)}</span>${avail.includes(q) ? (q === this._quality ? '<ha-icon class="chk" icon="mdi:check"></ha-icon>' : '') : `<small>${this._t('not_enabled')}</small>`}</button>`).join('');
        qm.querySelectorAll('.qopt:not([disabled])').forEach((el) => { el.onclick = () => this._setQuality(el.dataset.q); });
      }
    }

    $('chev').setAttribute('icon', this._settingsOpen ? 'mdi:chevron-up' : 'mdi:chevron-down');
    const box = $('settings');
    box.style.display = this._settingsOpen ? '' : 'none';
    if (this._settingsOpen) this._updateSettings(box);
  },
};
