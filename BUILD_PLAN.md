# Build-Plan: eigener Datendienst (BFF)

Für Codex. Alles hier ist **serverseitige** Arbeit — der Client ist fertig und
erwartet nur eine normalisierte JSON-Antwort.

## Warum überhaupt ein Dienst

Die besseren Quellen sind nicht browsertauglich:

| Quelle | Was sie liefert | Warum nicht direkt im Browser |
|---|---|---|
| MeteoSchweiz SMN (10 min) | Messwerte Basel/Binningen, CSV/JSON auf `data.geo.admin.ch` | machbar, aber CSV pro Station; besser einmal serverseitig geparst |
| MeteoSchweiz Lokalprognose | Prognose für ~5600 Punkte (PLZ, Stationen) | eine Datei **pro Parameter mit allen Punkten** — viel zu gross fürs Handy |
| MeteoSchweiz PRECIP / CombiPrecip | 1-km-Niederschlagsraster, alle 5 min | GeoTIFF in LV95; Browser kann daraus keine Kacheln machen |
| MeteoAlarm | amtliche Warnungen CH/DE/FR als CAP/Atom | kein CORS, XML |
| Open Data Basel-Stadt | Luftmesswerte, Rheindaten | CORS ok, aber Datensatz-IDs gehören an eine Stelle |

**Nicht bauen:** PostGIS, Redis, S3, Python-Worker, SvelteKit. Ein Cloudflare
Worker mit KV deckt alles unten ab. Wenn eines Tages eigene Radarkacheln dazu
kommen, kommt Object Storage dazu — vorher nicht.

## Paket 1 — Worker mit einem Endpunkt

`GET /v1/wetter` → exakt die Form aus `src/data/openmeteo.js`:

    { stand, modell, aktuell{temp,gefuehlt,feuchte,wind,richtung,code},
      stunden[{iso,temp,gefuehlt,mm,wahrsch,code,wind,boe}],
      tage[{iso,code,tmin,tmax,auf,unter,nassWahrsch,uvMax}],
      minuten[{iso,mm}], luft{aqi,pm25}, fluss{abfluss}, warnungen[] }

Regeln:
- Antwort in KV, TTL 10 Minuten, `Cache-Control: max-age=300`.
- CORS offen (`Access-Control-Allow-Origin: *`), nur GET.
- Jede Teilquelle darf ausfallen, ohne die Antwort zu kippen: fehlt ein Block,
  ist er `null`. Nie einen Fehler durchreichen, wenn Reste vorhanden sind.
- Ein Feld `quellen: {...}` mitschicken, damit der Client anzeigen kann, woher
  welcher Teil stammt.

Abnahme: `curl …/v1/wetter | jq` liefert dieselben Schlüssel wie heute, die App
läuft nach Umstellen von `QUELLE.art` auf `"bff"` unverändert weiter.

## Paket 2 — MeteoSchweiz als primäre Prognose

- Lokalprognose: Punkt für Basel einmalig aus `ogd-local-forecasting_meta_point.csv`
  bestimmen (PLZ 4051), `point_type_id` + `point_id` als Konstante ablegen.
- Pro Lauf die benötigten Parameterdateien holen, **nur die eine Punktzeile**
  herausschneiden, in die normalisierte Form übersetzen.
- Parameternamen nicht raten: `ogd-local-forecasting_meta_parameters.csv` beim
  Start lesen und in KV halten.
- Messwerte Basel/Binningen (SMN, 10 min) ersetzen `aktuell`.
- Open-Meteo bleibt als Rückfall, wenn MeteoSchweiz stockt. Beides in
  `quellen` ausweisen.

Lizenz: freie Weiterverwendung mit Quellenangabe — „Quelle: MeteoSchweiz“
gehört in den Footer.

## Paket 3 — Warnungen

MeteoAlarm-Feed für die Schweiz serverseitig holen, auf die Region
Basel-Stadt filtern, auf `{stufe, titel, von, bis, text}` reduzieren.
Client: ein Band über dem Jetzt-Block, Farbe nach Stufe. Erst bauen, wenn
Paket 1 steht.

## Paket 4 — Basler Zahlen

data.bs.ch (Opendatasoft, `/api/explore/v2.1/catalog/datasets/<id>/records`):
Luftmesswerte der kantonalen Stationen statt CAMS-Modellwerten, dazu Rheindaten.
Datensatz-IDs beim Bauen im Katalog verifizieren, nicht aus dem Gedächtnis.

## Paket 5 — eigene Radarkacheln (nur wenn wirklich gewünscht)

PRECIP/CombiPrecip GeoTIFF → PNG-Kacheln in EPSG:3857, Zoom 8–12, Farbskala wie
die App. Das ist ein eigener kleiner Dienst mit Ablage und Aufräumjob, kein
Worker-Nebenbei. Ehrliche Kosten-Nutzen-Rechnung vorher: RainViewer liefert
bereits 1-km-Kacheln fertig. Der Gewinn wäre Aktualität (5 min) und die
Schweizer Radarabdeckung — nicht mehr Auflösung.

## Reihenfolge

1 → 2 → 3 → 4. Paket 5 nur, wenn nach Wochen echter Nutzung das Radar der
Punkt ist, der stört.
