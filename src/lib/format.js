import { ORT, CODES, WIND_RICHTUNG } from "../config.js";

export const el = id => document.getElementById(id);
export const lage = c => (CODES[c] || ["–","·"])[0];
export const zeichen = c => (CODES[c] || ["–","·"])[1];

export const uhrzeit = d =>
  d.toLocaleTimeString("de-CH", {hour:"2-digit", minute:"2-digit", timeZone:ORT.tz});
export const datumKurz = d =>
  d.toLocaleDateString("de-CH", {weekday:"short", day:"2-digit", month:"short", timeZone:ORT.tz});

/** ISO-Tag (YYYY-MM-DD) in der Zeitzone des Orts, nicht der des Geräts. */
export const isoTag = d => d.toLocaleDateString("sv-SE", {timeZone:ORT.tz});
/** Stunde 0–23 in der Zeitzone des Orts. */
export const stundeVon = d =>
  +d.toLocaleString("de-CH", {hour:"2-digit", hour12:false, timeZone:ORT.tz});

export const zahl = (v, n = 0) =>
  (v == null || Number.isNaN(v)) ? "–" : v.toFixed(n).replace("-0", "0");
export const windrichtung = g => g == null ? "" : WIND_RICHTUNG[Math.round(g / 22.5) % 16];

/** Farbskala für Niederschlagsintensität in mm/h. */
export const nassFarbe = v =>
  v >= 2.5 ? "#D6301F" : v >= 1 ? "#D6721F" : v >= 0.4 ? "#C9A227" : "#4E9E86";

export const dauerText = min =>
  `${Math.floor(min/60)} h ${String(Math.round(min%60)).padStart(2,"0")} min`;

export function vorWieLange(zeitpunkt){
  const min = Math.round((Date.now() - zeitpunkt) / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} min`;
  const std = Math.round(min / 60);
  return std < 24 ? `vor ${std} Std.` : `vor ${Math.round(std/24)} Tagen`;
}
