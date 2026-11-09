# Reolink App Card

[English](README.md) · **Deutsch** · [Français](README.fr.md)

Eine Lovelace-Karte für Home Assistant, die sich wie die offizielle Reolink-App anfühlt: Livebild, Steuerung, Einstellungen und Wiedergabe der SD-Karten-Aufnahmen in einer Karte. Gebaut für akkubetriebene Reolink-Kameras (z. B. Argus-Serie) am Reolink Hub, funktioniert aber mit jeder Kamera der offiziellen [Reolink-Integration](https://www.home-assistant.io/integrations/reolink/).

<p>
  <img src="https://raw.githubusercontent.com/niondevelop/reolink-app-card/main/images/live.png" width="260" alt="Live-Ansicht">
  <img src="https://raw.githubusercontent.com/niondevelop/reolink-app-card/main/images/playback.png" width="260" alt="Wiedergabe">
  <img src="https://raw.githubusercontent.com/niondevelop/reolink-app-card/main/images/settings.png" width="260" alt="Einstellungen">
</p>

<sub>Screenshots mit einem gezeichneten Demo-Bild statt einer echten Kamera.</sub>

## Funktionen

- **Echtes Livebild:** startet automatisch, sobald die Karte sichtbar ist, und pausiert nach 5 Minuten (einstellbar) oder sofort, wenn du wegscrollst oder die App verlässt.
- **Schonende Vorschau:** Im pausierten Zustand zeigt die Karte das letzte Bild als Standbild, statt die Akkukamera ständig neu abzufragen.
- **Steuerleiste wie in der Reolink-App:** Sprechen (öffnet die Reolink-App), Ton-Alarm, Spotlight, Aufnahme, Schnappschuss und Qualität (Flüssig, Balanciert, Klar).
- **Modus-Auswahl oben:** entweder der Reolink-Szenenmodus des Hubs (Deaktiviert / Zuhause / Abwesend) oder ein eigener Modus aus Home Assistant (`mode_entity`), etwa für Push-Benachrichtigungen. Dazu die Belegung der SD-Karte.
- **Automatischer Sprung bei Erkennung:** Erkennt eine Kamera eine Person, ein Fahrzeug oder ein Tier, wechselt die Karte dorthin und zeigt einen Hinweis.
- **Alle Kameras gleichzeitig:** Rasteransicht mit allen Livebildern; ein Tipp öffnet die Kamera.
- **Digitaler Zoom:** mit zwei Fingern zoomen, doppeltippen zum Vergrössern, mit dem Mausrad bei gedrückter Ctrl-Taste.
- **Einstellungen in Gruppen:** Allgemein, Erkennung (PIR- und KI-Empfindlichkeit), Bild (Helligkeit, Kontrast, Sättigung, Schärfe), Flutlicht, Ton & Aufnahme – mit Reglern und Auswahllisten.
- **Wiedergabe:** Tagesauswahl, Filter nach Ereignistyp, farbige 24-Stunden-Zeitleiste, Geschwindigkeit (0,5× bis 4×), nächster Clip automatisch, Clip herunterladen.
- **Akku-Warnung:** Hinweis bei schwachem Akku und bei zu hoher oder zu tiefer Batterietemperatur.
- **Visueller Editor:** Kameras werden automatisch erkannt und lassen sich per Klick hinzufügen.
- **Englisch, Deutsch und Französisch,** passend zur Sprache von Home Assistant.

Einträge für Entitäten, die es nicht gibt oder die deaktiviert sind, blendet die Karte automatisch aus.

## Installation

[![Im Marketplace öffnen](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=niondevelop&repository=reolink-app-card&category=plugin)

### Über den Marketplace bzw. HACS

1. **Einstellungen → Marketplace** öffnen (ab Home Assistant 2026.11; davor in **HACS**)
2. Nach „Reolink App Card“ suchen und **Installieren**
3. Browser neu laden (in der Companion-App: Einstellungen → *Frontend-Cache zurücksetzen*)

Falls die Karte in der Suche noch nicht auftaucht, lässt sie sich selbst hinzufügen: im Marketplace oben rechts **Über Link hinzufügen** (*Add from link*) wählen, `niondevelop/reolink-app-card` eintragen und **Hinzufügen** (beim ersten Mal fragt der Marketplace nach einer Verbindung mit GitHub). Bei älteren Versionen mit HACS: Menü oben rechts → **Benutzerdefinierte Repositories**, Typ **Dashboard**. Sobald die Karte im Katalog ist, stellt der Marketplace von selbst um.

Der Marketplace legt die Dashboard-Ressource selbst an (`/local/community/reolink-app-card/reolink-app-card.js`). Wer die Ressourcen in YAML pflegt, trägt sie dort selbst ein.

### Manuelle Installation

`dist/reolink-app-card.js` nach `/config/www/` kopieren und unter **Einstellungen → Dashboards → Ressourcen** als JavaScript-Modul mit der URL `/local/reolink-app-card.js` hinzufügen.

## Konfiguration

Am einfachsten über den visuellen Editor: Karte hinzufügen → „Reolink App Card“. Oder in YAML:

```yaml
type: custom:reolink-app-card
cameras:
  - name: Eingang
    prefix: kamera_eingang
    media_name: Kamera Eingang
  - name: Garten
    prefix: kamera_garten
    media_name: Kamera Garten
```

### Karten-Optionen

| Option                    | Standard      | Beschreibung |
| ------------------------- | ------------- | ------------ |
| `cameras`                 | –             | **Pflicht.** Liste der Kameras (siehe unten) |
| `default_quality`         | `fluent`      | Startqualität: `fluent` (Flüssig), `balanced` (Balanciert) oder `clear` (Klar) |
| `live_timeout`            | `300`         | Sekunden, nach denen das Livebild pausiert. `0` = kein Limit |
| `auto_live`               | `true`        | Livebild automatisch starten, sobald die Karte sichtbar ist |
| `auto_switch`             | `true`        | Bei einer Erkennung automatisch zur betroffenen Kamera springen |
| `alert_seconds`           | `8`           | Wie lange der Erkennungs-Hinweis sichtbar bleibt |
| `autoplay_next`           | `true`        | Nach dem Ende eines Clips den nächsten abspielen |
| `battery_warning`         | `20`          | Akku-Warnung ab diesem Ladestand (%). `0` = aus |
| `temperature_warning`     | `45`          | Warnung bei Batterietemperatur ab (°C). `false` = aus |
| `temperature_low_warning` | `-10`         | Warnung bei Batterietemperatur bis (°C). `false` = aus |
| `mode_entity`             | –             | Eigene Modus-Auswahl oben in der Karte, z. B. ein `input_select` mit „Abwesend / Zuhause / Nacht / Aus“ für deine Benachrichtigungs-Automation. Ersetzt dort den Reolink-Szenenmodus |
| `mode_icons`              | –             | Eigene Symbole je Option, z. B. `{ Nacht: mdi:weather-night }`. Ohne Angabe wählt die Karte passende Symbole für typische Namen |
| `show_scene`              | `true` / `false` mit `mode_entity` | Reolink-Szenenmodus des Hubs anzeigen |
| `show_hub`                | `true`        | Hub-Zeile (Szenenmodus und SD-Karte) anzeigen |
| `hub_prefix`              | `reolink_hub` | Gemeinsamer Teil der Hub-Entity-IDs |
| `hub_entities`            | –             | Hub-Entitäten einzeln setzen: `scene`, `storage` |
| `language`                | `auto`        | `auto`, `en`, `de` oder `fr` |
| `talk_url`                | –             | Link für den Sprechen-Button (siehe Hinweise). Auch pro Kamera möglich |

### Kamera-Optionen

| Option       | Beschreibung |
| ------------ | ------------ |
| `prefix`     | **Pflicht.** Der gemeinsame Teil der Entity-IDs, z. B. `kamera_eingang` für `camera.kamera_eingang_standardauflosung` |
| `name`       | Angezeigter Name |
| `media_name` | Name der Kamera in der Reolink-Medienquelle (Medien → Reolink). Nötig für die Wiedergabe, wenn er vom Gerätenamen abweicht |
| `talk_url`   | Eigener Link für den Sprechen-Button dieser Kamera |
| `entities`   | Einzelne Entitäten überschreiben, z. B. `entities: { light: light.mein_flutlicht }` |

Die Karte findet die Entitäten selbst, sowohl mit deutschen als auch mit englischen Entity-IDs (z. B. `camera.<prefix>_standardauflosung` oder `camera.<prefix>_fluent`). Mit `entities` lässt sich jede einzeln setzen. Die Schlüssel sind: `cam_sd`, `cam_bal`, `cam_hd`, `snap`, `light`, `siren`, `manual_rec`, `rec`, `pir`, `push`, `daynight`, `battery`, `battery_state`, `battery_temp`, `wifi`, `sleep`, `det_person`, `det_vehicle`, `det_animal`, `det_motion` sowie die Einstellungen `pir_sens`, `ai_person`, `ai_vehicle`, `ai_animal`, `img_bright`, `img_contrast`, `img_sat`, `img_sharp`, `anti_flicker`, `ir_bright`, `fl_mode`, `fl_bright`, `volume`, `post_rec` u. a.

### Farbe anpassen

Die Akzentfarbe kommt aus der CSS-Variable `--reolink-accent` (Standard `#1e8bff`) und lässt sich im Theme setzen.

## Hinweise

- **Entitäten aktivieren:** Viele Reolink-Entitäten sind ab Werk deaktiviert, z. B. die Qualitätsstufen „Ausgewogen“ und „Hochauflösung“, die Bildeinstellungen und der SD-Sensor des Hubs. Unter *Einstellungen → Geräte & Dienste → Reolink → Gerät* lassen sie sich aktivieren; danach erscheinen sie in der Karte.
- **Akku:** Jede Minute Livebild kostet Akku. Wer sparen will, verkürzt `live_timeout` oder setzt `auto_live: false`.
- **Sprechen:** Home Assistant kann bei Reolink-Akkukameras kein Gegensprechen. Der Button öffnet deshalb die Reolink-App – in der Companion-App über `app://com.mcu.reolink`, in Chrome auf Android über einen Intent-Link. Reolink bietet keinen Link, der direkt eine bestimmte Kamera öffnet; die App startet mit der zuletzt genutzten Kamera. Auf iPhones gibt es keinen offiziellen Link zur App; dort lässt sich über `talk_url` ein eigener hinterlegen.
- **Wiedergabe:** nutzt die Medienquelle der Reolink-Integration und lädt bevorzugt die niedrige Auflösung, weil das schneller geht und Akku spart.

## Lizenz

MIT

