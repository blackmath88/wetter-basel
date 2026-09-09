import { el, uhrzeit, nassFarbe } from "../lib/format.js";

/* 15-Minuten-Schritte, drei Stunden voraus: ein Satz und ein Streifen. */
export function zeichneNowcast(minuten){
  const satzFeld = el("nowcast-satz");
  const jetzt = Date.now();
  const kommend = (minuten || []).filter(m => m.zeit.getTime() >= jetzt - 15*60000).slice(0, 12);
  if (!kommend.length){
    satzFeld.textContent = "Keine Kurzfrist-Daten verfügbar.";
    el("nowcast-strip").innerHTML = "";
    return;
  }

  const mm = kommend.map(m => m.mm);
  const erste = mm.findIndex(v => v >= 0.1);
  if (erste === -1){
    satzFeld.className = "nowcast-satz trocken";
    satzFeld.innerHTML = "<b>Trocken</b> in den nächsten drei Stunden.";
  } else if (erste === 0){
    const ende = mm.findIndex((v,i) => i > 0 && v < 0.1);
    satzFeld.className = "nowcast-satz";
    satzFeld.innerHTML = ende === -1
      ? "<b>Es regnet</b> — und hält die nächsten drei Stunden an."
      : `<b>Es regnet</b> — voraussichtlich bis ${uhrzeit(kommend[ende].zeit)}.`;
  } else {
    satzFeld.className = "nowcast-satz";
    satzFeld.innerHTML = `<b>Regen ab ca. ${uhrzeit(kommend[erste].zeit)}</b>,`
      + ` Spitze ${Math.max(...mm).toFixed(1)} mm/h.`;
  }

  const W = 340, H = 44, PAD = 2, N = kommend.length;
  const maxWert = Math.max(1, ...mm);
  const bw = (W - 2*PAD) / N;
  const balken = mm.map((v,i) => {
    const h = v <= 0 ? 1.5 : Math.max(3, (v / maxWert) * (H - 16));
    return `<rect x="${(PAD + i*bw + 1.5).toFixed(1)}" y="${(H - 13 - h).toFixed(1)}"
      width="${(bw-3).toFixed(1)}" height="${h.toFixed(1)}" rx="1"
      fill="${v <= 0 ? "#1E2C30" : nassFarbe(v)}"/>`;
  }).join("");
  const marken = kommend.map((m,i) => (i % 4) ? "" :
    `<text x="${(PAD + i*bw + bw/2).toFixed(1)}" y="${H-2}" fill="var(--ink-faint)"
      font-size="9" text-anchor="middle">${uhrzeit(m.zeit)}</text>`).join("");

  el("nowcast-strip").innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Niederschlag der nächsten drei Stunden">
       ${balken}${marken}</svg>`;
}
