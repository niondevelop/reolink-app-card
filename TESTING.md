# Testing a pull request in Home Assistant

Try a pull request with your real cameras before it is merged or released. Your installation from HACS / the Marketplace stays as it is. [Deutsch](TESTING.de.md)

## How it works

- For every pull request, GitHub builds the card, runs all tests and then provides the finished file. This happens again for every new commit.
- The pull request gets a comment **🧪 Test file for PR #…** with a command to copy. The comment is updated on every commit.
- The test file always goes to the same place: `/config/www/reolink-test/reolink-app-card.js`.
- **No second dashboard resource.** The stable and the test version both register `reolink-app-card` and must not load together. When the test version is switched on in a browser, the stable card loads the test file instead of itself.
- **Per device:** the switch only affects the browser or app where you turned it on. All other devices keep the stable version.
- **Always visible:** while the test version runs, the card shows a purple **Test version** bar. If the test file is missing, the bar is red and the stable version runs.
- **Cache:** the test file is loaded with a new timestamp every time, so a normal reload picks up a new file.

## Requirements

- The card **0.2.0 or newer** installed from HACS / the Marketplace (older versions don't have the switch).
- An admin user in Home Assistant.
- A way to put a file into `/config/www/`: the **Terminal & SSH** add-on is easiest; **Studio Code Server**, **File editor** or Samba work too.

Nothing else to install, and no restart needed as long as `/config/www` already exists (it does if you installed any card from HACS).

## Test a pull request

1. **Get the file:** copy the command from the **🧪 Test file** comment in the pull request, open **Terminal** in Home Assistant, paste and run it. The last line must say `reolink-app-card.js: OK`; the file is then checked and identical to the one in the pull request.
   Without a terminal: download the file from the link in the comment and copy it to `/config/www/reolink-test/reolink-app-card.js`.
2. **Switch on the test version** (once per device, it stays on):
   - **Browser:** open the dashboard with the card and add `?rac_channel=test` to the address, e.g. `https://…/dashboard-cameras/0?rac_channel=test`. The page reloads.
   - **Companion app:** add a temporary button with the action **Navigate** to `/dashboard-cameras/0?rac_channel=test` (your dashboard path) and tap it.
3. **Check:** the purple **Test version** bar is at the top of the card. Now test with your cameras.
4. **New commit in the pull request:** repeat step 1 and reload the dashboard.

## Back to the stable version

- Tap the purple **Test version** bar and choose **Go back**. The page reloads.
- If the test version doesn't start at all: open the dashboard with `?rac_channel=stable`.

The test file can stay where it is; it's only loaded while the test version is switched on. To clean up: `rm -r /config/www/reolink-test`.

## Reporting back

Please comment in the pull request with your camera model(s), whether they are connected directly or through a hub/NVR, your browser or app, and what worked or didn't. If a recording doesn't play, check whether the same clip plays in Home Assistant under **Media → Reolink**, and look for errors mentioning `reolink` in the Home Assistant log.
