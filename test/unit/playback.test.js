import { test } from 'node:test';
import assert from 'node:assert/strict';
import playback from '../../src/card/playback.js';

const parse = (title) => playback._parseFile.call({}, { title });

test('Clip-Titel der Reolink-Medienquelle werden gelesen', () => {
  const f = parse('13:01:44 0:00:21 Person Vehicle');
  assert.equal(f.start, 13 * 3600 + 60 + 44);
  assert.equal(f.dur, 21);
  assert.equal(f.time, '13:01:44');
  assert.deepEqual(f.types, ['person', 'vehicle']);
});

test('deutsche Ereignisnamen und Clips ohne Typ', () => {
  assert.deepEqual(parse('08:40:51 0:00:12 Tier').types, ['animal']);
  assert.deepEqual(parse('7:12:04 0:00:18').types, ['other']);
  assert.equal(parse('7:12:04 0:00:18').time, '07:12:04');
});

test('Tage werden aus Medien-ID oder Titel erkannt', () => {
  const day = (k) => playback._dayOf.call({}, k);
  assert.equal(day({ media_content_id: 'x|2026|11|10', title: '' }).toDateString(), new Date(2026, 10, 10).toDateString());
  assert.equal(day({ media_content_id: 'x', title: '2026/11/9' }).toDateString(), new Date(2026, 10, 9).toDateString());
  assert.equal(day({ media_content_id: 'x', title: '08.11.2026' }).toDateString(), new Date(2026, 10, 8).toDateString());
  assert.equal(day({ media_content_id: 'x', title: 'Hauptstream' }), null);
});

// Passende Aufnahme zu einem Zeitpunkt (Direktlink ?rac=event)
const pick = (time, files, now = time + 3600) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const at = (h, m, s = 0) => Math.floor(today.getTime() / 1000) + h * 3600 + m * 60 + s;
  const played = [], toasts = [];
  const ctx = {
    _pendingEvent: at(...time), _days: [{ date: today }], _dayIdx: 0, _eventTries: 0, _mode: 'play',
    _files: files.map((t) => parse(t)),
    _play(f) { played.push(f.time); }, _toast(t) { toasts.push(t.text); }, _t: (k) => k, _loadDays() {},
  };
  const realNow = Date.now;
  Date.now = () => at(...now) * 1000;
  try { playback._pickEvent.call(ctx); } finally { Date.now = realNow; }
  return { played, toasts, waiting: !!ctx._pendingEvent };
};
const FILES = ['08:00:00 0:00:40 Person', '12:30:00 0:00:25 Fahrzeug', '18:15:00 0:00:30 Bewegung'];

test('Aufnahme, die den Zeitpunkt enthält', () => {
  assert.deepEqual(pick([12, 30, 10], FILES).played, ['12:30:00']);
});

test('Aufnahme, die bis 2 Minuten nach der Meldung beginnt', () => {
  assert.deepEqual(pick([18, 13, 30], FILES).played, ['18:15:00']);
});

test('ältere Meldung ohne Aufnahme: Hinweis statt falschem Clip', () => {
  const r = pick([3, 0], FILES);
  assert.deepEqual(r.played, []);
  assert.deepEqual(r.toasts, ['ev_missing']);
});

test('frische Meldung ohne Aufnahme: warten und später nochmals suchen', () => {
  const r = pick([20, 0], FILES, [20, 1]);
  assert.deepEqual(r.played, []);
  assert.deepEqual(r.toasts, ['ev_wait']);
  assert.equal(r.waiting, true);
});
