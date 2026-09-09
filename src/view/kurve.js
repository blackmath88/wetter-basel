import { el, uhrzeit, stundeVon, nassFarbe } from "../lib/format.js";

let daten = null;

export function zeichneKurve(satz){
  const jetzt = new Date();
  const ab = satz.stunden.findIndex(h => h.zeit >= new Date(jetzt.getTime() - 3600000));
  const reihe = satz.stunden.slice(Math.max(ab,0), Math.max(ab,0) + 36);
  if (!reihe.length) return;

  const N = reihe.length, W = 340, HT = 96, HP = 26, PAD = 12;
  const temps = reihe.map(h => h.temp);
  const tmin = Math.min(...temps), tmax = Math.max(...temps);
  const spanne = Math.max(tmax - tmin, 3);
  const x = i => PAD + i * (W - 2*PAD) / (N - 1);
  const y = t => 10 + (1 - (t - tmin) / spanne) * (HT - 22);
  daten = { reihe, N, W, PAD, x, y };

  const grenze = d => PAD + ((d - reihe[0].zeit) / 3600000) * (W - 2*PAD) / (N - 1);
  const nachtRects = satz.tage.map(t => {
    const a = grenze(t.unter), b = grenze(new Date(t.auf.getTime() + 86400000));
    const x1 = Math.max(PAD, Math.min(W-PAD, a)), x2 = Math.max(PAD, Math.min(W-PAD, b));
    return x2 > x1 ? `<rect x="${x1}" y="0" width="${x2-x1}" height="${HT}" fill="#0E181B"/>` : "";
  }).join("");

  const punkte = temps.map((t,i) => `${x(i).toFixed(1)},${y(t).toFixed(1)}`).join(" ");
  const flaeche = `M ${x(0)},${HT-6} L ` + punkte.split(" ").join(" L ") + ` L ${x(N-1)},${HT-6} Z`;

  const nassMax = Math.max(0.6, ...reihe.map(h => h.mm));
  const bw = (W - 2*PAD) / (N-1) * 0.62;
  const balken = reihe.map((h,i) => {
    if (h.mm <= 0 && h.wahrsch < 15) return "";
    const hb = h.mm > 0 ? Math.max(2.5, (h.mm / nassMax) * (HP-4)) : 2;
    const deck = h.mm > 0 ? 0.9 : 0.22 + (h.wahrsch/100)*0.28;
    return `<rect x="${(x(i)-bw/2).toFixed(1)}" y="${(HP-hb).toFixed(1)}" width="${bw.toFixed(1)}"
      height="${hb.toFixed(1)}" rx="1" fill="${h.mm > 0 ? nassFarbe(h.mm) : "#4E9E86"}"
      opacity="${deck.toFixed(2)}"/>`;
  }).join("");

  const marken = reihe.map((h,i) => {
    const s = stundeVon(h.zeit);
    if (s % 6 !== 0) return "";
    return `<line x1="${x(i)}" y1="0" x2="${x(i)}" y2="${HT}" stroke="var(--line)"/>
      <text x="${x(i)}" y="${HT+HP+14}" fill="var(--ink-faint)" font-size="9"
        text-anchor="middle">${String(s).padStart(2,"0")}</text>`;
  }).join("");

  const jx = grenze(jetzt);
  const jetztLinie = (jx >= PAD && jx <= W-PAD) ? `
    <line x1="${jx.toFixed(1)}" y1="-6" x2="${jx.toFixed(1)}" y2="${HT+HP}" stroke="var(--rot)"/>
    <circle cx="${jx.toFixed(1)}" cy="-6" r="2.4" fill="var(--rot)"/>
    <text x="${Math.min(jx+6, W-58).toFixed(1)}" y="-8" fill="var(--rot)" font-size="9">jetzt ${uhrzeit(jetzt)}</text>` : "";

  const iMax = temps.indexOf(tmax), iMin = temps.indexOf(tmin);
  const beschriftung = (i,t,dy) =>
    `<text x="${x(i)}" y="${(y(t)+dy).toFixed(1)}" fill="var(--ink)" font-size="10"
      text-anchor="middle">${t.toFixed(0)}°</text>`;

  el("spanne-hinweis").textContent = `${tmin.toFixed(0)}° bis ${tmax.toFixed(0)}°`;
  el("kurvenfeld").innerHTML = `<svg id="kurve-svg" viewBox="0 -18 ${W} ${HT+HP+36}" role="img"
      aria-label="Temperaturverlauf der nächsten 36 Stunden">
    ${nachtRects}${marken}
    <path d="${flaeche}" fill="#4E9E86" opacity="0.07"/>
    <polyline points="${punkte}" fill="none" stroke="var(--ink)" stroke-width="1.4"
      stroke-linejoin="round" stroke-linecap="round"/>
    ${beschriftung(iMax,tmax,-7)}${beschriftung(iMin,tmin,14)}
    <g transform="translate(0,${HT+4})">${balken}</g>
    <text x="${W-PAD}" y="${HT+HP+14}" fill="var(--ink-faint)" font-size="9"
      text-anchor="end">Niederschlag mm/h</text>
    ${jetztLinie}
    <line id="tastlinie" x1="0" y1="-12" x2="0" y2="${HT+HP}" stroke="var(--ink)" opacity="0"/>
    <circle id="tastpunkt" r="3" fill="var(--ink)" opacity="0"/></svg>`;
  ablesungZuruecksetzen();
}

function ablesungSetzen(i, zeigen){
  if (!daten) return;
  i = Math.max(0, Math.min(daten.N-1, i));
  const h = daten.reihe[i];
  el("ablesung").innerHTML =
    `<div><b>${uhrzeit(h.zeit)}</b></div>
     <div><b>${h.temp.toFixed(1)}°</b></div>
     <div>${h.mm > 0 ? `<b>${h.mm.toFixed(1)} mm/h</b>` : "kein Regen"}</div>
     <div>${h.wahrsch} % Wahrsch.</div>`;
  const linie = el("tastlinie"), punkt = el("tastpunkt");
  if (!linie) return;
  linie.setAttribute("x1", daten.x(i)); linie.setAttribute("x2", daten.x(i));
  punkt.setAttribute("cx", daten.x(i)); punkt.setAttribute("cy", daten.y(h.temp));
  linie.setAttribute("opacity", zeigen ? ".35" : "0");
  punkt.setAttribute("opacity", zeigen ? "1" : "0");
}

function ablesungZuruecksetzen(){
  if (!daten) return;
  ablesungSetzen(Math.round((Date.now() - daten.reihe[0].zeit) / 3600000), false);
}

function tasten(ev){
  const svg = el("kurve-svg");
  if (!daten || !svg) return;
  const rect = svg.getBoundingClientRect();
  const px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
  const vx = (px / rect.width) * daten.W;
  ablesungSetzen(Math.round((vx - daten.PAD) * (daten.N-1) / (daten.W - 2*daten.PAD)), true);
}

export function kurveAnbinden(){
  const feld = el("kurvenfeld");
  feld.addEventListener("pointermove", tasten);
  feld.addEventListener("pointerdown", tasten);
  feld.addEventListener("pointerleave", ablesungZuruecksetzen);
  feld.addEventListener("touchmove", ev => { tasten(ev); ev.preventDefault(); }, {passive:false});
  feld.addEventListener("touchend", ablesungZuruecksetzen);
}
