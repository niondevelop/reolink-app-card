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
| `src/translations/*.json` | Texts in English, German and French (`card` and `editor`); `src/i18n.js` loads them |
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
- New texts need an entry in all three files in `src/translations/` (a unit test checks this). New language: copy `en.json`, translate it and add it in `src/i18n.js`.
- Add or adapt a test for changed behaviour where possible.
- Never commit personal data (names, entity IDs of your own home, IP addresses, serial numbers).
- Keep the version in `src/version.js` unchanged; it's bumped for a release.

## Screenshots

`npm run screenshots` renders the README images in `images/` from a simulated Home Assistant with two demo cameras (run `npm run build` first). The demo camera pictures in `scripts/screenshots/` are rendered, not real cameras; `scripts/screenshots/render-scenes.py` recreates them (needs Python with numpy and Pillow).

## Releasing

1. **Actions → Prepare release → Run workflow**, enter the new version (e.g. `0.3.2`). The workflow bumps the version, builds `dist/`, runs the unit tests and opens a pull request *Version x.y.z* with a draft of the release notes. (Pull requests opened by the workflow don't start the other checks; the workflow has already built and tested them.) The first time, allow it under *Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests*.
2. Merge that pull request.
3. Create the release with the link from the pull request (tag `vx.y.z` on `main`). The release workflow checks the tag against the version and attaches the file.
