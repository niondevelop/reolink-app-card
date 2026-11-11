# Pull Requests in Home Assistant testen

Damit lässt sich ein Pull Request mit echten Kameras ausprobieren, bevor er gemergt oder als Version veröffentlicht wird. Die Installation aus HACS bzw. dem Marketplace bleibt dabei unverändert.

## So funktioniert es

- Bei jedem Pull Request baut GitHub die Karte, führt alle Tests aus und legt danach die fertige Datei bereit. Bei jedem neuen Commit passiert das erneut.
- Im Pull Request erscheint ein Kommentar **🧪 Testdatei für PR #…** mit einem Befehl zum Kopieren. Der Kommentar wird bei jedem Commit aktualisiert. Dieselben Angaben stehen auch in GitHub unter **Actions** → Lauf **Validate** → **Summary**.
- Die Testdatei liegt immer an derselben Stelle: `/config/www/reolink-test/reolink-app-card.js` (im Browser `/local/reolink-test/reolink-app-card.js`).
- **Keine zweite Ressource.** Stabile Version und Testversion heissen beide `reolink-app-card` und dürfen nicht gleichzeitig geladen werden. Darum bleibt die Ressource aus HACS die einzige. Ist in einem Browser die Testversion eingeschaltet, lädt die stabile Karte stattdessen die Testdatei und registriert sich selbst nicht.
- **Pro Gerät:** Die Umschaltung gilt nur für den Browser bzw. die App, in der sie eingeschaltet wurde. Alle anderen Geräte im Haushalt laufen weiter mit der stabilen Version.
- **Immer sichtbar:** Solange die Testversion läuft, zeigt die Karte oben einen lila Balken **Testversion …**. Fehlt die Testdatei, ist der Balken rot und die stabile Version läuft.
- **Cache:** Die Testdatei wird bei jedem Laden mit neuem Zeitstempel geholt (`?v=…`). Nach dem Austauschen genügt deshalb ein normales Neuladen des Dashboards.

> **Erstes Mal:** Die Umschaltung ist erst in der stabilen Version enthalten, die nach dem Merge dieser Funktion veröffentlicht wird. Bis diese Version aus HACS installiert ist, siehe [Ohne Umschaltung](#ohne-umschaltung-nur-bis-zur-nächsten-version).

## Einmalig einrichten

Nichts zu installieren: Es reichen die App **Terminal & SSH** (oder **Studio Code Server** / **File editor**) und ein Administrator-Konto.

Der Ordner `/config/www` existiert bereits (dort liegen auch die HACS-Dateien unter `community/`), ein Neustart von Home Assistant ist also nicht nötig.

## Einen Pull Request testen

1. **Datei holen:** Im Pull Request den Befehl aus dem Kommentar **🧪 Testdatei** kopieren, in Home Assistant **Terminal** öffnen, einfügen und ausführen. Am Ende muss `reolink-app-card.js: OK` stehen; damit ist die Datei geprüft und identisch mit der im Pull Request.
2. **Testversion einschalten** (nur beim ersten Mal pro Gerät, danach bleibt sie eingeschaltet):
   - **Browser:** Das Dashboard mit der Karte öffnen und an die Adresse `?rac_channel=test` anhängen, z. B. `https://…/dashboard-kameras/0?rac_channel=test`. Die Seite lädt neu.
   - **Companion-App:** Im Dashboard vorübergehend eine Schaltfläche mit der Aktion **Navigieren** zu `/dashboard-kameras/0?rac_channel=test` anlegen (Pfad des eigenen Dashboards) und antippen.
3. **Prüfen:** Oben in der Karte steht der lila Balken **Testversion**. Jetzt mit den echten Kameras testen.
4. **Neuer Commit im PR:** Schritt 1 wiederholen und das Dashboard neu laden (Browser: F5, App: nach unten ziehen). Schritt 2 entfällt.

## Zurück zur stabilen Version

- In der Karte auf den lila Balken **Testversion** tippen und **Zurück** wählen. Die Seite lädt neu; fertig.
- Startet die Testversion gar nicht: im Browser `?rac_channel=stable` an die Adresse anhängen. Das wirkt schon beim Laden der stabilen Datei.

Die Testdatei darf liegen bleiben; sie wird nur geladen, solange die Testversion eingeschaltet ist. Wer aufräumen möchte: `rm -r /config/www/reolink-test`.

## Danach

1. Funktioniert alles: Pull Request mergen.
2. Erst dann bei Bedarf eine neue Version veröffentlichen (Tag `vX.Y.Z`). Die veröffentlichte Datei ist dieselbe wie die getestete, wenn nach dem Test nichts mehr geändert wurde (SHA-256 im Kommentar vergleichen).

## Ohne Umschaltung (nur bis zur nächsten Version)

Solange die installierte stabile Version die Umschaltung noch nicht kennt (bis Version 0.1.0; ab 0.2.0 ist sie enthalten):

1. Datei wie oben mit dem Befehl holen.
2. **Einstellungen → Dashboards → ⋮ → Ressourcen**, den Eintrag `/local/community/reolink-app-card/reolink-app-card.js?v=…` öffnen und **die bisherige Adresse notieren**.
3. Adresse ersetzen durch `/local/reolink-test/reolink-app-card.js?v=1` (bei jedem neuen Test die Zahl erhöhen, wegen des Browser-Cache) und speichern. Dashboard neu laden.
4. Zurück: dieselbe Ressource wieder auf die notierte Adresse stellen und neu laden.

Diese Umstellung gilt für alle Geräte. Danach nicht vergessen, sie zurückzustellen, sonst läuft überall die Testdatei.

## Hinweise

- Die Testdatei ist die normale gebaute Datei `dist/reolink-app-card.js` aus dem Pull Request. GitHub prüft, dass sie aus `src/` gebaut ist, und stellt sie erst bereit, wenn Unit- und Browser-Tests grün sind.
- Die Version im Balken ist die Versionsnummer im Code (z. B. 0.2.0). Welcher Commit getestet wird, zeigt der Kommentar im Pull Request.
- Bei Pull Requests aus einem Fork gibt es keinen Kommentar (fehlende Berechtigung); die Angaben stehen dann in der **Summary** des Laufs.
- Es wird nichts automatisch veröffentlicht oder gemergt.
