/* Aufbau und Aktualisierung der Ansicht – Methoden der Klasse ReolinkAppCard */
import { BTN_DEFAULT, DOMAIN_ICON, EVT, Q, Q_ORDER } from '../constants.js';
import { modeIcon } from '../entities.js';
import { LOCALES, STR } from '../i18n.js';
import { RAC_CSS } from '../styles.js';
import { esc, scrollable } from '../util.js';
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
        <div class="stage" id="stage" tabindex="-1">
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
          <button class="pedge" id="pedge"><ha-icon></ha-icon></button>
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
        <div class="phead" id="phead">
          <div class="ptabs"><button id="p-ev"><ha-icon icon="mdi:motion-sensor"></ha-icon><span id="p-ev-l"></span></button><button id="p-set"><ha-icon icon="mdi:tune-variant"></ha-icon><span id="p-set-l"></span></button></div>
          <button class="pclose" id="pclose"><ha-icon></ha-icon></button>
        </div>
        <div id="pane-live">
          <div class="barwrap"><div class="bar" id="ctrls"></div><div class="qmenu" id="qmenu"></div></div>
          <button class="backlive" id="backlive"><ha-icon icon="mdi:cctv"></ha-icon><span id="backlive-l"></span></button>
          <div class="ptz" id="ptz"></div>
          <button class="more" id="more"><ha-icon icon="mdi:tune-variant"></ha-icon><span id="more-l"></span><ha-icon id="chev" icon="mdi:chevron-down"></ha-icon></button>
          <div class="settings" id="settings"></div>
        </div>
        <div class="dlg" id="dlg" role="dialog" aria-modal="true"><div class="dbox"><div class="dtext" id="dtext"></div><div class="dbtns"><button id="dno"></button><button id="dyes"></button></div></div></div>
        <div id="pane-play">
          <div class="days" id="days"></div>
          <div class="pqrow" id="pqrow"><span id="pq-l"></span><div class="pq" id="pq"><button data-q="low"></button><button data-q="high"></button><button data-q="tele"></button></div></div>
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
    // Seitenleiste: während eine Aufnahme läuft, führt dieser Knopf unter dem Bild zurück zum Livebild
    $('backlive').onclick = () => { this._expired = false; this._stopPlayback(true); this._startLive(); };
    $('gridbtn').onclick = () => this._setGrid(!this._grid);
    $('m-live').onclick = () => this._setMode('live');
    $('m-play').onclick = () => this._setMode('play');
    $('more').onclick = () => { this._settingsOpen = !this._settingsOpen; this._update(); };
    // Seitenleiste: Ereignisse / Einstellungen umschalten, zuklappen und am Bildrand wieder aufklappen
    $('p-ev').onclick = () => this._setPanel('events');
    $('p-set').onclick = () => this._setPanel('settings');
    $('pclose').onclick = () => this._setPanel('none');
    $('pedge').onclick = () => this._setPanel(this._lastPanel || (this._hasPlayback() ? 'events' : 'settings'));
    $('speed').onclick = () => this._cycleSpeed();
    $('next').onclick = () => this._playNext();
    $('dl').onclick = () => this._download();
    $('unzoom').onclick = () => this._unzoom();
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
    // Messung: Zeit bis zum ersten Bild des Livebilds (Browser-Konsole), zum Vergleich mit anderen Karten
    $('pic').addEventListener('load', () => {
      if (!this._t0) return;
      console.info(`[reolink-app-card] Livebild nach ${Math.round(performance.now() - this._t0)} ms (${this._cam.name})`);
      this._t0 = 0;
    }, true);
    $('prev').onload = () => { $('prev').classList.add('ok'); };
    $('prev').onerror = () => { $('prev').classList.remove('ok'); };
    const v = $('video');
    v.addEventListener('ended', () => { if (this._config.autoplay_next) this._playNext(true); });
    v.addEventListener('loadedmetadata', () => { v.playbackRate = this._speed; });
    v.addEventListener('timeupdate', () => this._updatePlayhead());
    this.addEventListener('keydown', (e) => this._playbackKey(e));
    this._setupZoom();
    ['tabs', 'days', 'filters'].forEach((id) => scrollable($(id)));
    if (window.ResizeObserver) new ResizeObserver(() => this._applyLayout()).observe(root.querySelector('ha-card'));
    if (this.isConnected) this._observe();
  },

  /* Knöpfe der Steuerleiste: eingebaute (sofern die Kamera sie kann) und eigene, in der eingestellten Reihenfolge.
     Option buttons (Karte oder pro Kamera): Liste aus eingebauten Namen (talk, siren, light, rec, snap, ptz, q)
     und eigenen Knöpfen { entity, name, icon, service, confirm }; nicht genannte eingebaute Knöpfe sind ausgeblendet */
  _btnList(cam = this._cam) {
    const own = Array.isArray(cam.buttons) ? cam.buttons : Array.isArray(this._config.buttons) ? this._config.buttons : null;
    return { list: own || BTN_DEFAULT, custom: !!own };
  },

  _controls() {
    const c = this._cam, siren = this._e('siren'), light = this._e('light'), mrec = this._e('manual_rec');
    const build = {
      talk: () => {
        if (this._grid) return null;
        const active = this._mic !== 'off', why = active ? null : this._talkReason();
        const legacy = why === 'feature' && this._talkLegacy();
        return { icon: active ? 'mdi:phone-hangup' : 'mdi:phone', on: active, warn: active,
          ring: this._mic === 'connecting', dis: !!why && !legacy,
          label: active ? this._t('hang_up') : legacy ? this._t('talk_app') : this._t('talk'),
          run: () => (legacy ? this._talk() : this._toggleTalk()) };
      },
      siren: () => this._st(siren) && { icon: 'mdi:alarm-light-outline', label: this._t('siren'), on: this._on(siren), warn: true,
        run: async () => (this._on(siren) ? this._call('siren', 'turn_off', siren)
          : ((await this._ask(this._t('siren_confirm', { name: c.name }), this._t('siren_btn'), true)) && this._call('siren', 'turn_on', siren))) },
      light: () => this._st(light) && { icon: 'mdi:flashlight', label: this._t('spotlight'), on: this._on(light), run: () => this._call('light', 'toggle', light) },
      rec: () => this._st(mrec) && { icon: 'mdi:video-outline', label: this._t('record'), on: this._on(mrec), run: () => this._call('switch', 'toggle', mrec) },
      snap: () => ({ icon: 'mdi:camera-outline', label: this._t('snapshot'), run: () => this._snapshot() }),
      ptz: () => !this._grid && this._hasPtz() && { icon: 'mdi:arrow-all', label: this._t('ptz'), on: this._ptzOpen,
        run: () => { this._ptzOpen = !this._ptzOpen; this._qOpen = false; this._update(); } },
      q: () => this._qAvail().length && !this._grid && { icon: Q[this._quality].icon,
        label: `${this._t('quality')}: ${this._t(Q[this._quality].key)}`, on: this._qOpen,
        run: () => { this._qOpen = !this._qOpen; this._ptzOpen = false; this._update(); } },
    };
    const items = [];
    this._btnList().list.forEach((b, i) => {
      const x = typeof b === 'string' ? (build[b] ? build[b]() : null) : this._customBtn(b);
      if (x) items.push({ ...x, id: typeof b === 'string' ? b : `x${i}` });
    });
    return items;
  },

  /* Eigener Knopf für eine beliebige Entität (Licht, Schalter, Türöffner, Taster, Skript …) */
  _customBtn(b) {
    const id = b && b.entity, st = this._st(id);
    if (!st) return null;
    const domain = id.split('.')[0];
    const on = domain === 'lock' ? ['unlocked', 'open', 'opening', 'unlocking'].includes(st.state)
      : domain === 'cover' ? ['open', 'opening'].includes(st.state) : st.state === 'on';
    const stateless = ['button', 'input_button', 'scene'].includes(domain);
    const label = b.name || st.attributes.friendly_name || id;
    const icon = b.icon || st.attributes.icon || (domain === 'lock' && on ? 'mdi:lock-open-variant' : DOMAIN_ICON[domain]) || 'mdi:gesture-tap';
    const confirm = b.confirm !== undefined ? !!b.confirm : domain === 'lock' && !on;
    const call = () => {
      if (b.service && /^\w+\.\w+$/.test(b.service)) { const [d, s] = b.service.split('.'); return this._call(d, s, id); }
      if (domain === 'lock') return this._call('lock', on ? 'lock' : 'unlock', id);
      if (domain === 'button' || domain === 'input_button') return this._call(domain, 'press', id);
      if (domain === 'script' || domain === 'scene') return this._call(domain, 'turn_on', id);
      if (domain === 'automation') return this._call('automation', 'trigger', id);
      if (['light', 'switch', 'input_boolean', 'fan', 'cover', 'siren'].includes(domain)) return this._call(domain, 'toggle', id);
      return this._call('homeassistant', 'toggle', id);
    };
    return { icon, label, on: stateless ? undefined : on, warn: domain === 'lock',
      dis: st.state === 'unavailable',
      run: async () => { if (st.state === 'unavailable') return; if (confirm && !(await this._ask(this._t('confirm_action', { name: label }), this._t('confirm_btn')))) return; call(); } };
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

  /* Anordnung: hochkant (Handy, schmale Spalte) oder bei breiter Karte Seitenleiste rechts/links bzw. alles unten.
     layout: auto (breit → rechts) | right | left | bottom */
  _applyLayout() {
    const card = this.shadowRoot && this.shadowRoot.querySelector('ha-card');
    if (!card) return;
    const wide = card.clientWidth >= 760;
    const want = String(this._config.layout || 'auto');
    const lay = !wide ? '' : want === 'auto' ? 'right' : ['right', 'left', 'bottom'].includes(want) ? want : '';
    if (card.dataset.layout === lay) return;
    card.dataset.layout = lay;
    ['right', 'left', 'bottom'].forEach((x) => card.classList.toggle(`lay-${x}`, lay === x));
    card.classList.toggle('lay-side', lay === 'right' || lay === 'left');
    this._side = lay === 'right' || lay === 'left';
    if (this._side && this._mode === 'play') { this._mode = 'live'; this._panel = 'events'; }
    this._update();
    this._fitHub();
  },

  /* Bezeichnungen für Screenreader: Symbol-Knöpfe ohne Text bekommen ihren Tooltip als aria-label */
  _a11y() {
    this.shadowRoot.querySelectorAll('button[title]').forEach((b) => { if (b.getAttribute('aria-label') !== b.title) b.setAttribute('aria-label', b.title); });
  },

  _update() {
    if (!this._built || !this._hass) return;
    if (this.shadowRoot.querySelector('ha-card').dataset.layout === undefined) this._applyLayout();
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
    $('snd').style.display = this._live && !this._grid && !playing && !this._snapOnly() ? '' : 'none';
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
    // Ohne Aufnahmen in Home Assistant gibt es nur Live: Umschalter ausblenden
    const hasPlay = this._hasPlayback();
    const side = !!this._side, pan = side ? this._panelNow() : null;
    if (pan && pan !== 'none') this._lastPanel = pan;
    this.shadowRoot.querySelector('.seg').style.display = hasPlay && !side ? '' : 'none';
    if (!hasPlay && this._mode === 'play') { this._setMode('live'); return; }
    $('m-live').classList.toggle('sel', this._mode === 'live');
    $('m-play').classList.toggle('sel', this._mode === 'play');
    // Seitenleiste (breite Karte): Livebild links, im Panel Ereignisse oder Einstellungen – oder zugeklappt
    const card = root.querySelector('ha-card');
    card.classList.toggle('pan-none', side && pan === 'none');
    card.classList.toggle('pan-set', side && pan === 'settings');
    card.classList.toggle('playing', playing);
    $('phead').style.display = side && pan !== 'none' ? '' : 'none';
    const hasSet = this._settingGroups().length > 0;
    $('pedge').style.display = side && pan === 'none' && !this._grid && (hasPlay || hasSet) ? 'grid' : 'none';
    $('more').style.display = hasSet ? '' : 'none';
    if (side) {
      const left = this._config.layout === 'left';
      $('p-ev').style.display = hasPlay ? '' : 'none';
      $('p-set').style.display = hasSet ? '' : 'none';
      $('p-ev-l').textContent = this._t('events');
      $('backlive-l').textContent = this._t('back_live');
      $('p-set-l').textContent = this._t('settings');
      $('p-ev').classList.toggle('sel', pan === 'events');
      $('p-set').classList.toggle('sel', pan === 'settings');
      $('pclose').title = this._t('panel_hide');
      $('pclose').querySelector('ha-icon').setAttribute('icon', left ? 'mdi:chevron-left' : 'mdi:chevron-right');
      $('pedge').title = this._t('panel_show');
      $('pedge').classList.toggle('left', left);
      $('pedge').querySelector('ha-icon').setAttribute('icon', left ? 'mdi:chevron-right' : 'mdi:chevron-left');
    }
    $('pane-live').style.display = side ? 'contents' : this._mode === 'live' ? '' : 'none';
    $('pane-play').style.display = side ? (pan === 'events' ? '' : 'none') : this._mode === 'play' ? '' : 'none';

    if (side) {
      this._updateLivePane();
      if (pan === 'events') {
        if (!this._days) this._loadDays();
        else this._updatePlayPane();
      }
    } else if (this._mode === 'live') this._updateLivePane();
    else this._updatePlayPane();
    this._a11y();
  },

  /* Kopfzeile: eigener Modus (z. B. input_select für Benachrichtigungen) oder Reolink-Szenenmodus, dazu SD-Karte */
  _updateHub() {
    const box = this.$('hub'), cfg = this._config;
    const modeId = cfg.mode_entity || null;
    // Immer nur eine Modus-Zeile: mit eigener Modus-Auswahl nie zusätzlich der Reolink-Szenenmodus.
    // show_hub: false blendet Szenenmodus und SD-Belegung aus (ältere Option); sonst einzeln mit show_scene und show_sd
    const useScene = cfg.show_hub !== false && !modeId && cfg.show_scene !== false;
    const scene = useScene ? this._hubE('scene') : null;
    // SD-Karte der gewählten Kamera, sonst die des Hubs
    const storage = cfg.show_hub !== false && cfg.show_sd !== false ? this._camSdE() || this._hubE('storage') : null;
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
    box.innerHTML = rows.map((r, i) => `<div class="scene" data-r="${i}" role="radiogroup">${r.opts.map((o) => `<button data-o="${esc(o)}" class="${r.st.state === o ? 'sel' : ''}" role="radio" aria-checked="${r.st.state === o}" title="${esc(r.label(o))}" aria-label="${esc(r.label(o))}">
      <ha-icon icon="${esc(r.icon(o))}"></ha-icon><span>${esc(r.label(o))}</span></button>`).join('')}</div>`).join('')
      + (sd !== null ? `<span class="sd"><ha-icon icon="mdi:micro-sd"></ha-icon>${this._t('sd', { v: sd < 10 ? sd.toFixed(1) : Math.round(sd) })}</span>` : '');
    box.querySelectorAll('.scene').forEach((row) => {
      const r = rows[+row.dataset.r];
      row.querySelectorAll('button').forEach((b) => {
        b.onclick = () => { if (b.dataset.o !== r.st.state) this._call(r.id.split('.')[0], 'select_option', r.id, { option: b.dataset.o }); };
      });
    });
    // Symbole und Schrift laden in Home Assistant erst nach dem Aufbau: bei jeder Grössenänderung neu anpassen
    if (window.ResizeObserver) {
      if (!this._hubRO) this._hubRO = new ResizeObserver(() => { cancelAnimationFrame(this._hubRaf); this._hubRaf = requestAnimationFrame(() => this._fitHub()); });
      this._hubRO.disconnect();
      this._hubRO.observe(box);
      box.querySelectorAll('.scene ha-icon, .scene span').forEach((el) => this._hubRO.observe(el));
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this._fitHub());
    this._fitHub();
  },

  /* Modus-Zeile an die Breite anpassen: die SD-Anzeige steht immer in einer eigenen Zeile;
     reicht der Platz nicht, zeigen nur der gewählte Modus Symbol und Namen, die übrigen nur das Symbol */
  _fitHub() {
    const box = this.$ && this.$('hub');
    if (!box || box.style.display === 'none' || !box.clientWidth) return;
    const rows = [...box.querySelectorAll('.scene')];
    box.classList.toggle('wrap', !!rows.length && !!box.querySelector('.sd'));
    rows.forEach((r) => r.classList.remove('compact'));
    rows.forEach((r) => { if (r.scrollWidth > r.clientWidth + 1) r.classList.add('compact'); });
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
    // SD-Karte fast voll: eigene Karten der Kameras und die des Hubs
    const SD_FULL = 95;
    const sds = this._cams.map((cam) => [cam.name, this._camSdE(cam)]).filter(([, id]) => id);
    const hubSd = this._hubE('storage');
    if (hubSd) sds.push([this._t('hub'), hubSd]);
    sds.forEach(([name, id]) => {
      const v = this._num(id);
      if (cfg.show_hub !== false && cfg.show_sd !== false && v !== null && v >= SD_FULL) warns.push({ icon: 'mdi:micro-sd', text: this._t('sd_full', { name, v: Math.round(v) }) });
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
      // Hörer in die Mitte; ohne eigene Reihenfolge die übrigen Buttons gleichmässig links und rechts,
      // mit eigener Reihenfolge links, was vor dem Hörer steht, und rechts, was danach kommt
      const at = this._btnList().custom ? ctrls.indexOf(mid) : Math.ceil(rest.length / 2);
      $('ctrls').classList.toggle('split', !!mid);
      $('ctrls').innerHTML = mid
        ? `<div class="side">${rest.slice(0, at).map(btn).join('')}</div>${btn(mid)}<div class="side">${rest.slice(at).map(btn).join('')}</div>`
        : ctrls.map(btn).join('');
      ctrls.forEach((x) => { $('ctrls').querySelector(`[data-id="${x.id}"]`).onclick = () => this._controls().find((y) => y.id === x.id).run(); });
    }
    ctrls.forEach((x) => {
      const b = $('ctrls').querySelector(`[data-id="${x.id}"]`);
      const icon = b.querySelector('ha-icon');
      if (icon.getAttribute('icon') !== x.icon) icon.setAttribute('icon', x.icon);
      b.title = x.label; b.setAttribute('aria-label', x.label);
      if (x.on !== undefined) b.setAttribute('aria-pressed', String(!!x.on));
      b.toggleAttribute('aria-disabled', !!x.dis);
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
        qm.innerHTML = Q_ORDER.filter((q) => q !== 'tele' || avail.includes(q)).map((q) => `<button class="qopt${q === this._quality ? ' sel' : ''}" data-q="${q}" role="menuitemradio" aria-checked="${q === this._quality}"${avail.includes(q) ? '' : ' aria-disabled="true"'}>
          <ha-icon icon="${Q[q].icon}"></ha-icon><span>${this._qLabel(q)}</span>${avail.includes(q) ? (q === this._quality ? '<ha-icon class="chk" icon="mdi:check"></ha-icon>' : '') : `<small>${this._t('not_enabled')}</small>`}</button>`).join('');
        qm.querySelectorAll('.qopt').forEach((el) => {
          // Ausgegraute Stufe: erklären, wo man den Stream in Home Assistant einschaltet
          el.onclick = () => (el.getAttribute('aria-disabled') ? this._toast({ text: this._t('q_off_hint', { q: this._qLabel(el.dataset.q), name: this._cam.name }), color: '#636366', icon: 'mdi:video-off-outline', wrap: true }) : this._setQuality(el.dataset.q));
        });
      }
    }

    const setOpen = this._side ? this._panelNow() === 'settings' : this._settingsOpen;
    $('chev').setAttribute('icon', this._settingsOpen ? 'mdi:chevron-up' : 'mdi:chevron-down');
    const box = $('settings');
    box.style.display = setOpen ? '' : 'none';
    if (setOpen) this._updateSettings(box);
  },
};
