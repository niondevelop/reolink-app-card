# Reolink App Card

Eine Lovelace-Karte für Home Assistant, die sich wie die offizielle Reolink-App anfühlt: Livebild, Steuerung und Wiedergabe der SD-Karten-Aufnahmen in einer Karte. Gebaut für akkubetriebene Reolink-Kameras (z. B. Argus-Serie) am Reolink Hub, funktioniert aber mit jeder Kamera der offiziellen [Reolink-Integration](https://www.home-assistant.io/integrations/reolink/).

## Funktionen

- **Kamera-Tabs** mit Statuspunkt (online, schläft, Erkennung aktiv, offline) und Akkustand
- **Echtes Livebild** startet automatisch, sobald die Karte sichtbar ist, und stoppt, wenn du wegscrollst, die App verlässt oder den Tab wechselst; Wechsel zwischen SD und HD (wenn die HD-Entität aktiviert ist)
- **Overlay** mit Akku, WLAN-Signal und laufenden Erkennungen (Person, Fahrzeug, Tier, Bewegung)
- **Schnellsteuerung:** Flutlicht, Sirene (mit Rückfrage), Voralarm, manuelle Aufnahme, Foto speichern
- **Einstellungen:** PIR, Aufzeichnung, Push-Benachrichtigungen, Tag-/Nacht-Modus
- **Wiedergabe** der Aufnahmen über die Reolink-Medienquelle: Tagesauswahl, Filter nach Ereignistyp, farbige 24-Stunden-Zeitleiste und Ereignisliste
- **Vollbild** für Live und Wiedergabe

Einträge für Entitäten, die es nicht gibt, blendet die Karte automatisch aus.

## Installation über HACS

1. HACS öffnen → Menü oben rechts → **Benutzerdefinierte Repositories**
2. Repository-URL dieses Repos eintragen, Typ **Dashboard** wählen, **Hinzufügen**
3. „Reolink App Card“ suchen und **Herunterladen**
4. Browser neu laden (in der Companion-App: Einstellungen → *Frontend-Cache zurücksetzen*)

HACS registriert die Ressource automatisch.

### Manuelle Installation

`dist/reolink-app-card.js` nach `/config/www/` kopieren und unter **Einstellungen → Dashboards → Ressourcen** als JavaScript-Modul mit der URL `/local/reolink-app-card.js` hinzufügen.

## Konfiguration

```yaml
type: custom:reolink-app-card
default_quality: sd
cameras:
  - name: Garten Nord
    prefix: kamera_eingang
    media_name: Kamera Eingang
  - name: Garten Süd
    prefix: camera1
    media_name: Kamera Garten Sued
```

### Karten-Optionen

| Option            | Standard | Beschreibung                                                   |
| ----------------- | -------- | -------------------------------------------------------------- |
| `cameras`         | –        | **Pflicht.** Liste der Kameras (siehe unten)                   |
| `default_quality` | `sd`     | Startqualität des Livebilds: `sd` oder `hd`                    |
| `auto_live`       | `true`   | Livebild automatisch starten, sobald die Karte sichtbar ist. Bei `false` startet es erst per Tipp |
| `live_timeout`    | `0`      | Sekunden, nach denen das Livebild stoppt. `0` = kein Limit, solange die Karte sichtbar ist |

### Kamera-Optionen

| Option       | Beschreibung                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| `prefix`     | **Pflicht.** Der gemeinsame Teil der Entity-IDs, z. B. `kamera_eingang` für `camera.kamera_eingang_standardauflosung` |
| `name`       | Angezeigter Name im Tab                                                                                       |
| `media_name` | Name der Kamera in der Reolink-Medienquelle (Medien → Reolink). Nötig für die Wiedergabe, wenn er vom Gerätenamen abweicht |

### Entitäten überschreiben

Die Karte leitet alle Entity-IDs aus `prefix` ab. Die Standardnamen entsprechen einer **deutschsprachigen** Home-Assistant-Installation. Bei anderer Sprache oder umbenannten Entitäten lassen sie sich einzeln setzen:

| Option          | Standard                                     |
| --------------- | -------------------------------------------- |
| `camera_sd`     | `camera.<prefix>_standardauflosung`          |
| `camera_hd`     | `camera.<prefix>_hochauflosung`              |
| `light`         | `light.<prefix>_flutlicht`                   |
| `siren`         | `siren.<prefix>_sirene`                      |
| `prealarm`      | `button.<prefix>_voralarm`                   |
| `manual_record` | `switch.<prefix>_manuelle_aufzeichnung`      |
| `record`        | `switch.<prefix>_aufzeichnen`                |
| `pir`           | `switch.<prefix>_pir_aktiviert`              |
| `push`          | `switch.<prefix>_push_benachrichtigungen`    |
| `day_night`     | `select.<prefix>_tag_nacht_modus`            |
| `battery`       | `sensor.<prefix>_batterie`                   |
| `wifi`          | `sensor.<prefix>_wlan_signal`                |
| `sleep`         | `binary_sensor.<prefix>_schlafstatus`        |

Die Erkennungs-Sensoren (`_person`, `_fahrzeug`, `_tier`, `_bewegung`) werden immer aus `prefix` abgeleitet.

### Farbe anpassen

Die Akzentfarbe kommt aus der CSS-Variable `--reolink-accent` (Standard `#1e8bff`) und lässt sich im Theme setzen.

## Hinweise

- Das Livebild läuft über den Kamera-Stream von Home Assistant (HLS bzw. WebRTC). Akkukameras brauchen nach dem Aufwecken einige Sekunden, bis das Bild läuft.
- Jede Minute Livebild kostet Akku. Wer sparen will, setzt `live_timeout` oder `auto_live: false`.
- Die Wiedergabe nutzt die Medienquelle der Reolink-Integration und lädt bevorzugt die niedrige Auflösung, weil das schneller geht und Akku spart.
- Die HD-Kamera-Entität ist in der Reolink-Integration standardmässig deaktiviert und muss für den HD-Modus aktiviert werden.

## Lizenz

MIT
