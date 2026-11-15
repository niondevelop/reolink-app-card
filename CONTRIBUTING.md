# Contributing

Thanks for helping! Issues and pull requests are welcome.

## Project layout

| Path | Content |
|---|---|
| `src/index.js` | Entry point: registers the card and the editor |
| `src/card.js` | The card class; puts the parts below together |
| `src/card/core.js` | Config, state, entity lookup, toasts, dialogs |
| `src/card/live.js` | Live view (WebRTC player, quality, timeout) |
| `src/card/audio.js` | Sound and two-way audio |
| `src/card/playback.js` | Recordings (media source, timeline, playback) |
| `src/card/settings.js` | Camera settings panel |
| `src/card/doorbell.js`, `ptz.js`, `links.js` | Doorbell, pan & tilt, notification links |
| `src/card/render.js` | HTML of the card |
| `src/editor.js` | Visual editor |
| `src/channel.js` | Per-browser switch to a test file in `/local/reolink-test/` |
| `src/i18n.js` | Texts in English, German and French |
| `src/entities.js`, `constants.js`, `suggestions.js`, `styles.js`, `util.js` | Shared helpers |
| `dist/reolink-app-card.js` | **Generated** – the file HACS installs. Don't edit it by hand |
| `test/unit/` | Unit tests (Node test runner) |
| `test/browser/` | Browser tests against a simulated Home Assistant (Playwright) |

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run build      # src/ → dist/reolink-app-card.js
npm run watch      # rebuild on every change
npm test           # unit tests
npx playwright install chromium   # once
npm run test:browser               # browser tests
npm run check      # build + all tests
```

To try a change in Home Assistant, copy `dist/reolink-app-card.js` to `/config/www/` and add it as a dashboard resource (or use `npm run watch` with a network share).

## Pull requests

- Every pull request gets a ready-to-use test file (artifact `reolink-app-card-pr-<number>` and a comment with a copy-and-paste command). How to try it in Home Assistant without touching the HACS install: [TESTING.md](TESTING.md) ([Deutsch](TESTING.de.md)).

- Change files in `src/`, run `npm run build` and **commit `dist/` too**. The check on GitHub fails if `dist/` doesn't match `src/`.
- New texts need an entry in all three languages in `src/i18n.js` (a unit test checks this).
- Add or adapt a test for changed behaviour where possible.
- Never commit personal data (names, entity IDs of your own home, IP addresses, serial numbers).
- Keep the version in `src/version.js` unchanged; it's bumped for a release.
