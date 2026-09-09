import { el, zahl, lage, zeichen, windrichtung } from "../lib/format.js";

export function zeichneJetzt(satz){
  const a = satz.aktuell, heute = satz.tage[0];
  el("jetzt").innerHTML = `
    <div class="kopfzeile">
      <div class="grad">${zahl(a.temp,1)}<small>°C</small></div>
      <div class="heutespanne">HEUTE<b>${heute.tmin.toFixed(0)}° / ${heute.tmax.toFixed(0)}°</b>
        ${zeichen(heute.code)} ${lage(heute.code)}</div>
    </div>
    <div class="lage"><span class="zeichen">${zeichen(a.code)}</span>${lage(a.code)}</div>
    <div class="kennwerte">
      <div><span>gefühlt</span><b>${zahl(a.gefuehlt,1)}°</b></div>
      <div><span>Wind</span><b>${zahl(a.wind)} <small>km/h ${windrichtung(a.richtung)}</small></b></div>
      <div><span>Feuchte</span><b>${zahl(a.feuchte)} %</b></div>
    </div>
    <div class="briefing" id="briefing"></div>`;
}
