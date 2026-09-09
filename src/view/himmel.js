import { el, uhrzeit, dauerText } from "../lib/format.js";
import { mondphase, mondSvg } from "../lib/mond.js";

export function zeichneHimmel(satz){
  const heute = satz.tage[0], morgen = satz.tage[1];
  const dauer = (heute.unter - heute.auf) / 60000;
  const delta = morgen ? Math.round(((morgen.unter - morgen.auf) / 60000) - dauer) : 0;

  el("sonne-hinweis").textContent = `${uhrzeit(heute.auf)} – ${uhrzeit(heute.unter)}`;
  el("sonne").innerHTML = `
    <div class="zeile"><span>Aufgang</span><b>${uhrzeit(heute.auf)}</b></div>
    <div class="zeile"><span>Untergang</span><b>${uhrzeit(heute.unter)}</b></div>
    <div class="zeile"><span>Tageslänge</span><b>${dauerText(dauer)}</b></div>
    <div class="zeile"><span>morgen</span><b>${delta>=0?"+":"−"}${Math.abs(delta)} min</b></div>`;

  const m = mondphase(new Date());
  el("mond").innerHTML = `<div class="mond">${mondSvg(m.anteil, m.beleuchtet)}
    <div class="beschriftung">${m.name}
      <small>${Math.round(m.beleuchtet*100)} % beleuchtet</small>
      <small>Tag ${m.alter.toFixed(1)} von 29,5</small></div></div>`;
}
