/* CSS der Karte */

/* ======================================================================= */
export const RAC_CSS = `
:host { --ra: var(--reolink-accent, #1e8bff); --rb: var(--ha-card-background, var(--card-background-color)); }
ha-card { overflow: hidden; padding-bottom: 8px; position: relative; }
.dlg { position: absolute; inset: 0; z-index: 10; display: none; align-items: center; justify-content: center; padding: 16px; background: rgba(0,0,0,.55); backdrop-filter: blur(2px); }
.dlg.show { display: flex; }
.dbox { width: 100%; max-width: 320px; padding: 18px 16px 14px; border-radius: 18px; background: #2c2c2e; color: #f2f2f2; box-shadow: 0 12px 32px rgba(0,0,0,.5); }
.dtext { font-size: 15px; line-height: 1.4; text-align: center; margin-bottom: 16px; }
.dbtns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dbtns button { padding: 11px; border-radius: 12px; font-size: 15px; font-weight: 600; background: #3a3a3c; color: #f2f2f2; }
.dbtns button.danger { background: #ff3b30; color: #fff; }
.dbtns button:not(.danger)#dyes { background: var(--ra); color: #fff; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.top { display: flex; align-items: center; gap: 6px; padding: 10px 10px 8px; }
.tabs { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; flex: 1; }
.tab { display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 18px; background: var(--secondary-background-color); white-space: nowrap; font-size: 14px; }
.tab.sel { background: var(--ra); color: #fff; }
.tab .tb { opacity: .75; font-size: 12px; }
.gridbtn { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: var(--secondary-background-color); flex: none; }
.gridbtn.sel { background: var(--ra); color: #fff; }
.gridbtn ha-icon { --mdc-icon-size: 20px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #3ccf8e; flex: none; display: inline-block; }
.dot.sleep { background: #9aa4b2; } .dot.off { background: #555; } .dot.alert { background: #ff5b5b; animation: pulse 1s infinite; }
.hub { display: flex; align-items: center; gap: 8px; padding: 0 10px 8px; flex-wrap: wrap; }
.scene { display: flex; gap: 2px; padding: 3px; border-radius: 12px; background: var(--secondary-background-color); flex: 1; min-width: 230px; }
.scene button { flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 6px 4px; border-radius: 9px; font-size: 13px; opacity: .75; }
.scene button ha-icon { --mdc-icon-size: 17px; }
.scene button.sel { background: var(--rb); color: var(--ra); opacity: 1; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.sd { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; }
.sd ha-icon { --mdc-icon-size: 16px; }
.warns:empty { display: none; }
.warns { display: flex; flex-direction: column; gap: 4px; padding: 0 10px 8px; }
.warn { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 10px; font-size: 13px; color: #ff9f43; background: color-mix(in srgb, #ff9f43 14%, transparent); }
.warn ha-icon { --mdc-icon-size: 18px; }
.stage { position: relative; background: #000; aspect-ratio: 16/9; overflow: hidden; border-radius: 0; touch-action: pan-y; user-select: none; -webkit-user-select: none;
  /* Eckige Kamerabild-Fläche: Variablen wirken bis in die eingebettete Bildkarte (Shadow DOM) */
  --ha-card-border-radius: 0px; --ha-card-border-width: 0px; --ha-card-box-shadow: none; }
.stage.zoomed { touch-action: none; cursor: grab; }
.stage:fullscreen { aspect-ratio: auto; }
.stage.gridmode { aspect-ratio: auto; min-height: 120px; }
.media { position: absolute; inset: 0; transform-origin: 0 0; will-change: transform; }
.stage.gridmode .media { display: none; }
.prev { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; opacity: 0; transition: opacity .3s; pointer-events: none; -webkit-user-drag: none; }
.prev.ok { opacity: 1; }
.stage.live .media > .prev { opacity: 0; }
.pic, .pic > * { position: absolute; inset: 0; }
.pic ha-card, .pic hui-picture-entity-card { height: 100%; border-radius: 0; border: 0; box-shadow: none; background: transparent; }
video { position: absolute; inset: 0; width: 100%; height: 100%; background: #000; display: none; border-radius: 0; }
.stage.playing video { display: block; } .stage.playing .pic, .stage.playing .media > .prev { display: none; }
.grid { display: none; }
.stage.gridmode .grid { display: grid; grid-template-columns: repeat(var(--cols, 2), 1fr); gap: 2px; }
.cell { position: relative; aspect-ratio: 16/9; background: #111; overflow: hidden; cursor: pointer; }
.cell::after { content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 2; transition: box-shadow .2s; }
.cell.alert::after { box-shadow: inset 0 0 0 3px #ff5b5b; }
.cell .cl { z-index: 3; }
.cell .cl { position: absolute; left: 6px; bottom: 6px; display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 10px; background: rgba(0,0,0,.55); color: #fff; font-size: 11px; font-weight: 600; }
.ov { position: absolute; left: 8px; right: 8px; display: flex; gap: 6px; align-items: center; pointer-events: none; }
.ov > *, .ov .pillrow > * { pointer-events: auto; }
.ov.top { top: 8px; justify-content: space-between; }
.ov.det { top: 42px; flex-wrap: wrap; }
.ov.bottom { bottom: 8px; }
.stage.gridmode .ov.top, .stage.gridmode .ov.det, .stage.gridmode #fs { display: none; }
.stage.gridmode .ov.bottom { top: 8px; bottom: auto; }
.spacer { flex: 1; }
.pillrow { display: flex; gap: 6px; }
.pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 12px; background: rgba(0,0,0,.55); color: #fff; font-size: 12px; font-weight: 600; backdrop-filter: blur(4px); }
.pill:empty { display: none; }
.pill ha-icon { --mdc-icon-size: 16px; }
.pill.low { color: #ff8a80; }
.pill.btn.icon { padding: 5px; } .pill.btn.icon ha-icon { --mdc-icon-size: 20px; }
.pill.btn { min-height: 26px; }
.pill.det { background: var(--c); }
.stage.playing .ov.bottom { bottom: 56px; }
.toast { position: absolute; left: 50%; top: 12px; transform: translate(-50%, -150%); display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 18px; background: var(--c, #ff5b5b); color: #fff; font-size: 13px; font-weight: 600; box-shadow: 0 4px 14px rgba(0,0,0,.35); transition: transform .3s, opacity .3s, visibility .3s; z-index: 4; white-space: nowrap; pointer-events: none; opacity: 0; visibility: hidden; }
.toast.show { transform: translate(-50%, 0); opacity: 1; visibility: visible; }
.toast.wrap { white-space: normal; width: max-content; max-width: calc(100% - 32px); text-align: left; line-height: 1.3; }
.toast ha-icon { --mdc-icon-size: 18px; }
.rec { width: 8px; height: 8px; border-radius: 50%; background: #ff3b30; animation: pulse 1.2s infinite; }
@keyframes pulse { 50% { opacity: .3; } }
.bigplay { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 64px; height: 64px; border-radius: 50%; background: rgba(0,0,0,.5); color: #fff; display: grid; place-items: center; backdrop-filter: blur(4px); }
.bigplay ha-icon { --mdc-icon-size: 38px; }
.seg { display: flex; margin: 10px 10px 4px; padding: 3px; border-radius: 10px; background: var(--secondary-background-color); }
.seg button { flex: 1; padding: 7px; border-radius: 8px; font-weight: 600; font-size: 14px; opacity: .7; }
.seg button.sel { background: var(--rb); opacity: 1; color: var(--ra); box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.barwrap { position: relative; padding: 10px 10px 4px; }
.bar { display: flex; justify-content: space-around; align-items: center; gap: 2px; padding: 8px 10px; border-radius: 30px; background: #1f1f21; border: 1px solid rgba(255,255,255,.08); }
.bar.split { display: grid; grid-template-columns: 1fr auto 1fr; gap: 6px; }
.bar .side { display: flex; justify-content: space-around; align-items: center; gap: 2px; min-width: 0; }
.tbn.big { width: 58px; height: 58px; margin: -8px 0; border-radius: 50%; background: #2c2c2e; border: 1px solid rgba(255,255,255,.12); box-shadow: 0 2px 8px rgba(0,0,0,.35); transition: background .2s, box-shadow .08s, transform .15s; }
.tbn.big ha-icon { --mdc-icon-size: 28px; }
.tbn.big:active { transform: scale(.94); }
.tbn.big.warn { border-color: transparent; box-shadow: 0 0 0 calc(var(--lvl, 0) * 12px) rgba(255,59,48,.3), 0 2px 8px rgba(0,0,0,.35); }
.tbn { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; color: #f2f2f2; transition: background .2s, color .2s; }
.tbn ha-icon { --mdc-icon-size: 24px; }
.tbn.on { background: var(--ra); color: #fff; }
.tbn.warn { background: #ff3b30; color: #fff; }
.tbn.dis { opacity: .35; }
.pill.btn.on { background: color-mix(in srgb, var(--ra) 85%, transparent); }
.tbn.ring { animation: ring 1.2s ease-in-out infinite; }
@keyframes ring { 50% { box-shadow: 0 0 0 7px rgba(255,59,48,.25); } }
.talk { position: absolute; inset: 0; display: none; pointer-events: none; z-index: 3; }
.ring { position: absolute; inset: 0; z-index: 6; display: none; flex-direction: column; justify-content: space-between; align-items: center; padding: 18px 12px 16px; color: #fff;
  background: linear-gradient(rgba(0,0,0,.72), rgba(0,0,0,.15) 45%, rgba(0,0,0,.72)); }
.stage.ringing .ring { display: flex; }
.stage.ringing .bigplay, .stage.ringing .ov, .stage.ringing .talk { display: none !important; }
.rhead { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; }
.rhead b { font-size: 18px; } .rhead span:last-child { font-size: 14px; opacity: .85; }
.rbell { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.16); animation: ring 1.2s ease-in-out infinite; }
.rbell ha-icon { --mdc-icon-size: 26px; }
.rbtns { display: flex; gap: 64px; }
.rb { display: flex; flex-direction: column; align-items: center; gap: 6px; color: #fff; font-size: 13px; font-weight: 600; }
.rb > span { width: 62px; height: 62px; border-radius: 50%; display: grid; place-items: center; box-shadow: 0 4px 14px rgba(0,0,0,.4); transition: transform .15s; }
.rb:active > span { transform: scale(.93); }
.rb ha-icon { --mdc-icon-size: 30px; }
.rb.no > span { background: #ff3b30; }
.rb.yes > span { background: #34c759; animation: answer 1.4s ease-in-out infinite; }
@keyframes answer { 50% { box-shadow: 0 0 0 10px rgba(52,199,89,.25), 0 4px 14px rgba(0,0,0,.4); } }
.ptz { display: none; padding: 4px 10px 6px; }
.ptz.open { display: block; }
.pwrap { display: flex; align-items: center; justify-content: center; gap: 28px; }
.pad { display: grid; grid-template-columns: repeat(3, 48px); grid-template-rows: repeat(3, 48px); gap: 4px; padding: 6px; border-radius: 50%; background: #1f1f21; border: 1px solid rgba(255,255,255,.08); }
.pd, .pz { display: grid; place-items: center; color: #f2f2f2; border-radius: 50%; touch-action: none; user-select: none; -webkit-user-select: none; }
.pd:active, .pz:active { background: var(--ra); color: #fff; }
.pd ha-icon { --mdc-icon-size: 30px; }
.pd.u { grid-area: 1 / 2; } .pd.l { grid-area: 2 / 1; } .pd.c { grid-area: 2 / 2; background: #2c2c2e; } .pd.r { grid-area: 2 / 3; } .pd.d { grid-area: 3 / 2; }
.pd.c ha-icon { --mdc-icon-size: 20px; }
.pzoom { display: flex; flex-direction: column; gap: 10px; }
.pz { width: 48px; height: 48px; background: #1f1f21; border: 1px solid rgba(255,255,255,.08); }
.pre { margin-top: 10px; } .pre small { display: block; margin: 0 2px 6px; opacity: .7; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { padding: 6px 12px; border-radius: 16px; background: #2c2c2e; color: #f2f2f2; font-size: 13px; }
.chip.sel { background: var(--ra); color: #fff; }
.stage.talking .talk { display: block; }
.stage.talking .bigplay { display: none !important; }
.tpill { position: absolute; left: 50%; bottom: 52px; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px; border-radius: 14px; background: rgba(255,59,48,.92); color: #fff; font-size: 13px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums; box-shadow: 0 2px 10px rgba(0,0,0,.3); }
.talk.conn .tpill { background: color-mix(in srgb, var(--ra) 92%, transparent); }
.tw { display: inline-flex; align-items: center; gap: 2px; height: 16px; }
.tw i { width: 3px; height: 5px; border-radius: 2px; background: #fff; }
.talk:not(.lvl) .tw i { animation: tw 1s ease-in-out infinite; }
.talk:not(.lvl) .tw i:nth-child(2) { animation-delay: .15s; } .talk:not(.lvl) .tw i:nth-child(3) { animation-delay: .3s; } .talk:not(.lvl) .tw i:nth-child(4) { animation-delay: .45s; }
.talk.lvl .tw i { transition: height .08s; height: calc(4px + var(--lvl, 0) * 8px); }
.talk.lvl .tw i:nth-child(2), .talk.lvl .tw i:nth-child(3) { height: calc(4px + var(--lvl, 0) * 12px); }
@keyframes tw { 50% { height: 14px; } }
.qmenu { position: absolute; right: 14px; bottom: calc(100% - 4px); min-width: 190px; padding: 6px; border-radius: 14px; background: #1f1f21; color: #f2f2f2; box-shadow: 0 8px 24px rgba(0,0,0,.4); z-index: 5; display: none; }
.qmenu.open { display: block; }
.qopt { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px; border-radius: 10px; font-size: 14px; text-align: left; }
.qopt ha-icon { --mdc-icon-size: 20px; }
.qopt.sel { color: var(--ra); }
.qopt .chk { margin-left: auto; }
.qopt[disabled] { opacity: .45; cursor: default; }
.qopt small { margin-left: auto; font-size: 11px; }
.more { display: flex; align-items: center; gap: 8px; width: calc(100% - 20px); margin: 6px 10px 0; padding: 8px 4px; border-top: 1px solid var(--divider-color); font-size: 14px; }
.more span { flex: 1; text-align: left; }
.more ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }
.settings { padding: 0 10px; display: flex; flex-direction: column; gap: 6px; }
.grp { border-radius: 12px; background: var(--secondary-background-color); overflow: hidden; }
.gh { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; font-size: 14px; font-weight: 600; text-align: left; }
.gh span { flex: 1; }
.gh ha-icon { --mdc-icon-size: 20px; }
.gc { color: var(--secondary-text-color); }
.gb { padding: 0 8px 6px; }
.row { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 12px; padding: 8px 4px; border-top: 1px solid var(--divider-color); }
.row.na { opacity: .5; }
.row ha-icon { color: var(--secondary-text-color); --mdc-icon-size: 20px; }
.rl { flex: 1; font-size: 14px; }
.nv { font-size: 13px; color: var(--secondary-text-color); min-width: 36px; text-align: right; }
.rng { width: 100%; margin: 2px 0 0 32px; accent-color: var(--ra); flex-basis: calc(100% - 32px); }
.row select { background: var(--rb); color: inherit; border: 0; border-radius: 8px; padding: 6px 8px; font: inherit; font-size: 13px; max-width: 50%; }
.rowbtn { padding: 6px 12px; border-radius: 8px; background: var(--rb); font-size: 13px; }
.days, .filters { display: flex; gap: 6px; overflow-x: auto; padding: 8px 10px 2px; scrollbar-width: none; }
.day { display: flex; flex-direction: column; align-items: center; min-width: 56px; padding: 6px 8px; border-radius: 10px; background: var(--secondary-background-color); }
.day small { font-size: 11px; opacity: .7; } .day b { font-size: 13px; }
.day.sel { background: var(--ra); color: #fff; }
.chip { display: inline-flex; align-items: center; gap: 4px; padding: 5px 11px; border-radius: 15px; border: 1px solid var(--divider-color); font-size: 13px; white-space: nowrap; }
.chip ha-icon { --mdc-icon-size: 16px; }
.chip.sel { background: var(--ra); border-color: var(--ra); color: #fff; }
.tl { padding: 12px 12px 2px; }
.tlbar { position: relative; height: 22px; border-radius: 6px; background: var(--secondary-background-color); overflow: hidden; }
.tlbar i { position: absolute; top: 3px; bottom: 3px; min-width: 3px; border-radius: 2px; cursor: pointer; }
.tlh { display: flex; justify-content: space-between; font-size: 10px; color: var(--secondary-text-color); padding-top: 2px; }
.list { padding: 4px 6px 0; max-height: 420px; overflow-y: auto; }
.item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 8px 6px; border-radius: 10px; text-align: left; }
.item.sel { background: var(--secondary-background-color); }
.ei { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; background: color-mix(in srgb, var(--c) 18%, transparent); color: var(--c); flex: none; }
.et { flex: 1; display: flex; flex-direction: column; } .et small { color: var(--secondary-text-color); font-size: 12px; }
.ed { font-size: 12px; color: var(--secondary-text-color); }
.ep { color: var(--ra); }
.msg { display: flex; gap: 8px; align-items: center; justify-content: center; padding: 18px; color: var(--secondary-text-color); font-size: 14px; }
`;
