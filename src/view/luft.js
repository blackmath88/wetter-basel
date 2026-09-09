import { el, zahl } from "../lib/format.js";
import { AQI_BAENDER, AQI_RAT } from "../config.js";

export function zeichneLuft(satz){
  const v = satz.luft?.aqi;
  const pm = satz.luft?.pm25;
  const abfluss = satz.fluss?.abfluss;
  const uv = satz.tage[0]?.uvMax;
  const band = AQI_BAENDER.find(b => (v ?? 0) <= b[0]) || AQI_BAENDER[AQI_BAENDER.length-1];
  const urteil = v == null ? "–" : band[1];
  const pos = Math.max(0, Math.min(100, ((v ?? 0) / 140) * 100));

  el("luft-hinweis").textContent = v == null ? "" : `${v} · ${urteil}`;
  el("luft").innerHTML = `
    <div class="aqi-kopf">
      <b style="color:${v==null?"var(--ink)":band[2]}">${zahl(v)}</b>
      <div class="urteil">${urteil}</div>
    </div>
    <div class="aqi-skala">
      <div class="baender">${AQI_BAENDER.map(b => `<i style="background:${b[2]};opacity:.85"></i>`).join("")}</div>
      ${v == null ? "" : `<div class="marke" style="left:${pos.toFixed(1)}%"></div>`}
    </div>
    <div class="aqi-beschriftung">${AQI_BAENDER.map(b => `<i>${b[1]}</i>`).join("")}</div>
    <div class="aqi-rat">${AQI_RAT[urteil] || ""}</div>
    <div class="aqi-detail">
      <div class="wert"><span>PM2.5</span><b>${zahl(pm,1)}</b><i>µg/m³</i></div>
      <div class="wert"><span>UV HEUTE</span><b>${zahl(uv,1)}</b><i>Index max</i></div>
      <div class="wert"><span>RHEIN ABFLUSS</span><b>${zahl(abfluss)}</b>
        <i>${abfluss == null ? "keine Daten" : "m³/s"}</i></div>
    </div>`;
}
