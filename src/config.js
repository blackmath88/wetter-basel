/* Ein Ort, eine Zeitzone, ein Satz Konstanten. Sonst nichts. */

export const ORT = { name:"BASEL", lat:47.5596, lon:7.5886, hoehe:260, tz:"Europe/Zurich" };

/* Datenquelle. "openmeteo" fragt direkt aus dem Browser.
   "bff" erwartet einen eigenen Dienst (siehe BUILD_PLAN.md), der dieselbe
   normalisierte Form liefert — dann genügt hier eine Zeile Änderung. */
export const QUELLE = { art:"openmeteo", bffBasis:"" };

export const RADAR = {
  api: "https://api.rainviewer.com/public/weather-maps.json",
  /* Radardaten liegen bei rund 1 km Auflösung. Darüber wird hochskaliert:
     die Karte wird schärfer, das Radar nicht. */
  maxNativeZoom: 10, maxZoom: 15, minZoom: 5,
  deckkraft: 0.78, taktMs: 550,
  stufen: { "z-stadt":12, "z-region":9, "z-weit":7 }
};

export const CODES = {
  0:["Klar","○"], 1:["Meist klar","◔"], 2:["Teilweise bewölkt","◑"], 3:["Bedeckt","●"],
  45:["Nebel","▤"], 48:["Reifnebel","▤"],
  51:["Leichter Niesel","·"], 53:["Niesel","⁚"], 55:["Dichter Niesel","⁞"],
  56:["Gefrierender Niesel","⁚"], 57:["Gefrierender Niesel","⁞"],
  61:["Leichter Regen","╷"], 63:["Regen","╷╷"], 65:["Starker Regen","╷╷╷"],
  66:["Gefrierender Regen","╷*"], 67:["Gefrierender Regen","╷*"],
  71:["Leichter Schnee","✳"], 73:["Schnee","✳✳"], 75:["Starker Schnee","✳✳✳"],
  77:["Schneegriesel","✳"],
  80:["Leichte Schauer","╷"], 81:["Schauer","╷╷"], 82:["Heftige Schauer","╷╷╷"],
  85:["Schneeschauer","✳"], 86:["Starker Schneeschauer","✳✳"],
  95:["Gewitter","⚡"], 96:["Gewitter mit Hagel","⚡"], 99:["Schweres Gewitter","⚡"]
};

export const WIND_RICHTUNG = ["N","NNO","NO","ONO","O","OSO","SO","SSO",
                              "S","SSW","SW","WSW","W","WNW","NW","NNW"];
export const WOCHENTAGE = ["So","Mo","Di","Mi","Do","Fr","Sa"];

export const AQI_BAENDER = [
  [20,"sehr gut","#3E8E6E"], [40,"gut","#7FA83C"], [60,"mittel","#C9A227"],
  [80,"schlecht","#D6721F"], [100,"sehr schlecht","#D6301F"], [140,"extrem","#8B2E6B"]
];
export const AQI_RAT = {
  "sehr gut":"Alles offen — Fenster, Laufrunde, Rhein.",
  "gut":"Unbedenklich für alle.",
  "mittel":"Für Empfindliche merkbar; lange Anstrengung im Freien ruhiger angehen.",
  "schlecht":"Empfindliche Personen sollten Anstrengung im Freien reduzieren.",
  "sehr schlecht":"Anstrengung im Freien meiden, Fenster geschlossen halten.",
  "extrem":"Draussen möglichst kurz halten."
};

export const TAKT = { nachladenMs: 10*60*1000, uhrMs: 20000, altMinuten: 45 };
