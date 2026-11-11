import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ED_LABELS, LANGS, STR, fmt, pickLang } from '../../src/i18n.js';

test('alle Sprachen haben dieselben Texte (Karte und Editor)', () => {
  for (const [name, table] of [['STR', STR], ['ED_LABELS', ED_LABELS]]) {
    const base = Object.keys(table.en).sort();
    for (const lang of LANGS) {
      assert.deepEqual(Object.keys(table[lang]).sort(), base, `${name}.${lang} weicht von Englisch ab`);
    }
  }
});

test('keine leeren Texte', () => {
  for (const lang of LANGS) {
    for (const [k, v] of Object.entries(STR[lang])) assert.ok(String(v).trim(), `STR.${lang}.${k} ist leer`);
  }
});

test('Platzhalter stimmen in allen Sprachen überein', () => {
  const holes = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join();
  for (const k of Object.keys(STR.en)) {
    for (const lang of LANGS) assert.equal(holes(STR[lang][k]), holes(STR.en[k]), `Platzhalter in STR.${lang}.${k}`);
  }
});

test('pickLang: Option, Sprache von Home Assistant, Rückfall auf Englisch', () => {
  assert.equal(pickLang('fr', { language: 'de' }), 'fr');
  assert.equal(pickLang('auto', { language: 'de' }), 'de');
  assert.equal(pickLang('auto', { locale: { language: 'fr-CH' } }), 'fr');
  assert.equal(pickLang('auto', { language: 'it' }), 'en');
  assert.equal(pickLang(undefined, undefined), 'en');
});

test('fmt setzt Werte ein und lässt Unbekanntes leer', () => {
  assert.equal(fmt('{name} · {v} %', { name: 'Garten', v: 80 }), 'Garten · 80 %');
  assert.equal(fmt('Hallo {x}'), 'Hallo ');
});
