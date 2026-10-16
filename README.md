<!-- BEGIN public-repo-header -->
<div align="center">

# Wetter Basel

<a href="https://github.com/blackmath88/wetter-basel"><img alt="Primary language: HTML" src="https://img.shields.io/badge/language-HTML-526078?style=flat"></a>
<a href="https://github.com/blackmath88/wetter-basel#readme"><img alt="README" src="https://img.shields.io/badge/docs-readme-16796f?style=flat"></a>
<a href="https://github.com/blackmath88/wetter-basel/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/blackmath88/wetter-basel?style=flat&amp;color=737373"></a>

</div>
<!-- END public-repo-header -->

Eine kleine Wetter-PWA für Basel. Morgens aufmachen, Stunde für Stunde lesen,
Regenradar prüfen, weitergehen.

Kein Build, kein Framework, kein Konto, kein Tracking. Nur ES-Module, die der
Browser direkt lädt.

## Starten

Ein Service Worker braucht einen Server — `file://` genügt nicht.

    python3 -m http.server 8080
    # dann http://localhost:8080 öffnen

## Veröffentlichen (GitHub Pages)

1. Repo anlegen, Dateien pushen (`.nojekyll` liegt bereits bei, damit Pages
   den Ordner `src/` nicht wegfiltert).
2. Settings → Pages → Source: `Deploy from a branch`, Branch `main`, Ordner `/`.
3. Nach ein bis zwei Minuten liegt die App unter
   `https://<konto>.github.io/<repo>/`.

Alle Pfade sind relativ, die App läuft also auch in einem Unterordner.
Auf Android und Desktop bietet Chrome dann „Installieren“ an, auf iOS
funktioniert „Zum Home-Bildschirm“.

## Aufbau

    index.html              nur Markup
    styles.css              ein Stylesheet, Variablen oben
    sw.js                   Service Worker (Hülle: cache first, Daten: netz first)
    manifest.webmanifest
    src/config.js           Ort, Codes, Farbskalen, Quellenschalter
    src/lib/                format.js (Zeit, Zahlen, Farben), mond.js
    src/data/               openmeteo.js, quelle.js, speicher.js, rainviewer.js
    src/view/               je eine Datei pro Block der Seite
    src/main.js             Verdrahtung, Uhr, Nachladen
    vendor/leaflet/         mitgeliefert, damit die Karte offline nicht fehlt
    fonts/                  IBM Plex Mono, Latin-1-Teilmenge (OFL, siehe license.txt)

### Die Naht zur Datenquelle

Alles über `src/data/` kennt nur eine **normalisierte Form**:

    { stand, modell, aktuell, stunden[], tage[], minuten[], luft, fluss }

`src/data/openmeteo.js` übersetzt Open-Meteo in diese Form. Wer später einen
eigenen Dienst davorsetzt (siehe `BUILD_PLAN.md`), ändert in `src/config.js`

    export const QUELLE = { art:"bff", bffBasis:"https://…workers.dev" };

und sonst nichts. Die Ansichten sehen nie eine URL.

### Offline

Der letzte erfolgreiche Datensatz liegt im `localStorage`. Ohne Netz zeigt die
App ihn samt Altersangabe („Offline — Stand vor 9 Std.“) statt einer leeren
Seite. Radarkacheln werden nie zwischengespeichert; sie sind nach fünf Minuten
falsch.

## Daten und Quellenangabe

- Wetter, Luftqualität, Rheinabfluss: [Open-Meteo](https://open-meteo.com)
  (CC BY 4.0), Modelle DWD ICON, CAMS, GloFAS. Freier Tarif, nicht kommerziell.
- Radar: [RainViewer](https://www.rainviewer.com)
- Karte: Esri Dark Gray Canvas, [OpenStreetMap](https://www.openstreetmap.org/copyright)

## Grenzen, die man kennen sollte

- Das Radar löst rund 1 km auf. Ab Zoom 13 wird hochskaliert: die Karte wird
  schärfer, das Radarbild nicht.
- Open-Meteo liefert keinen eigenen Radar-Nowcast und keine amtlichen Warnungen.
  Beides braucht einen eigenen Dienst — dafür `BUILD_PLAN.md`.
