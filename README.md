# Reolink App Card

**Deutsch** · [English](#english)

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
- **Szenenmodus des Hubs:** Deaktiviert / Zuhause / Abwesend umschalten, dazu die Belegung der SD-Karte.
- **Automatischer Sprung bei Erkennung:** Erkennt eine Kamera eine Person, ein Fahrzeug oder ein Tier, wechselt die Karte dorthin und zeigt einen Hinweis.
- **Alle Kameras gleichzeitig:** Rasteransicht mit allen Livebildern; ein Tipp öffnet die Kamera.
- **Digitaler Zoom:** mit zwei Fingern zoomen, doppeltippen zum Vergrössern, mit dem Mausrad bei gedrückter Ctrl-Taste.
- **Einstellungen in Gruppen:** Allgemein, Erkennung (PIR- und KI-Empfindlichkeit), Bild (Helligkeit, Kontrast, Sättigung, Schärfe), Flutlicht, Ton & Aufnahme – mit Reglern und Auswahllisten.
- **Wiedergabe:** Tagesauswahl, Filter nach Ereignistyp, farbige 24-Stunden-Zeitleiste, Geschwindigkeit (0,5× bis 4×), nächster Clip automatisch, Clip herunterladen.
- **Akku-Warnung:** Hinweis bei schwachem Akku und bei zu hoher oder zu tiefer Batterietemperatur.
- **Visueller Editor:** Kameras werden automatisch erkannt und lassen sich per Klick hinzufügen.
- **Deutsch und Englisch,** passend zur Sprache von Home Assistant.

Einträge für Entitäten, die es nicht gibt oder die deaktiviert sind, blendet die Karte automatisch aus.

## Installation über HACS

1. HACS öffnen → Menü oben rechts → **Benutzerdefinierte Repositories**
2. `https://github.com/niondevelop/reolink-app-card` eintragen, Typ **Dashboard** wählen, **Hinzufügen**
3. „Reolink App Card“ suchen und **Herunterladen**
4. Browser neu laden (in der Companion-App: Einstellungen → *Frontend-Cache zurücksetzen*)

### Manuelle Installation

`dist/reolink-app-card.js` nach `/config/www/` kopieren und unter **Einstellungen → Dashboards → Ressourcen** als JavaScript-Modul mit der URL `/local/reolink-app-card.js` hinzufügen.

## Konfiguration

Am einfachsten über den visuellen Editor: Karte hinzufügen → „Reolink App Card“. Oder in YAML:

```yaml
type: custom:reolink-app-card
cameras:
  - name: Garten Nord
    prefix: kamera_eingang
    media_name: Kamera Eingang
  - name: Garten Süd
    prefix: camera1
    media_name: Kamera Garten Sued
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
| `show_hub`                | `true`        | Szenenmodus und SD-Karte des Hubs anzeigen |
| `hub_prefix`              | `reolink_hub` | Gemeinsamer Teil der Hub-Entity-IDs |
| `hub_entities`            | –             | Hub-Entitäten einzeln setzen: `scene`, `storage` |
| `language`                | `auto`        | `auto`, `de` oder `en` |
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

---

<a id="english"></a>

# Reolink App Card (English)

A Lovelace card for Home Assistant that feels like the official Reolink app: live view, controls, settings and playback of SD card recordings in a single card. Built for battery-powered Reolink cameras (e.g. the Argus series) on a Reolink Hub, but it works with every camera of the official [Reolink integration](https://www.home-assistant.io/integrations/reolink/).

<img src="https://raw.githubusercontent.com/niondevelop/reolink-app-card/main/images/grid.png" width="300" alt="Grid view">

## Features

- **Real live view** that starts when the card becomes visible and pauses after 5 minutes (configurable) or as soon as you scroll away or leave the app.
- **Battery-friendly preview:** while paused, the card shows the last image instead of polling the battery camera all the time.
- **Control bar like the Reolink app:** talk (opens the Reolink app), siren, spotlight, record, snapshot and quality (fluent, balanced, clear).
- **Hub scene mode:** switch between disarmed / home / away, plus the SD card usage.
- **Jump on detection:** when a camera detects a person, vehicle or animal, the card switches to it and shows a notice.
- **All cameras at once:** grid view with every live stream; tap one to open it.
- **Digital zoom:** pinch, double-tap, or ctrl + mouse wheel.
- **Grouped settings:** general, detection (PIR and AI sensitivity), image, floodlight, audio & recording – with sliders and dropdowns.
- **Playback:** day picker, event filter, coloured 24-hour timeline, speed (0.5× to 4×), autoplay next clip, download.
- **Battery warnings** for low charge and battery temperature.
- **Visual editor** that detects your cameras automatically.
- **German and English,** following the Home Assistant language.

## Installation

Add `https://github.com/niondevelop/reolink-app-card` as a custom repository of type **Dashboard** in HACS, download “Reolink App Card”, then reload your browser.

## Configuration

Use the visual editor, or YAML:

```yaml
type: custom:reolink-app-card
cameras:
  - name: Front door
    prefix: front_door
```

All options are listed in the German tables above; option names are the same. Entity IDs are detected for both German and English Home Assistant installations, and any entity can be overridden per camera with `entities:`.

Many Reolink entities (balanced/clear streams, image settings, hub SD sensor) are disabled by default — enable them on the device page of the Reolink integration to use them in the card.

## License

MIT
