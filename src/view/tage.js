import { el, lage, zeichen } from "../lib/format.js";
import { WOCHENTAGE } from "../config.js";

export function zeichneTage(satz){
  const t = satz.tage;
  const alleMin = Math.min(...t.map(d => d.tmin));
  const alleMax = Math.max(...t.map(d => d.tmax));
  const gesamt = Math.max(alleMax - alleMin, 6);
  el("tage").innerHTML = t.map((d,i) => {
    const name = i === 0 ? "heute" : WOCHENTAGE[new Date(d.iso + "T12:00").getDay()];
    const links = ((d.tmin - alleMin) / gesamt) * 100;
    const breite = ((d.tmax - d.tmin) / gesamt) * 100;
    return `<div class="tag">
      <div class="name">${name}</div>
      <div class="zeichen" title="${lage(d.code)}">${zeichen(d.code)}</div>
      <div class="balken"><div class="spur"></div>
        <div class="spanne" style="left:${links.toFixed(1)}%;width:${Math.max(breite,2).toFixed(1)}%">
          <div class="min">${d.tmin.toFixed(0)}</div>
          <div class="max" style="left:100%">${d.tmax.toFixed(0)}</div>
        </div></div>
      <div class="nass ${d.nassWahrsch>=40?"aktiv":""}">${d.nassWahrsch}%</div>
    </div>`;
  }).join("");
}
