import { el, lage, zeichen, isoTag, stundeVon, nassFarbe } from "../lib/format.js";

let satzRef = null, gewaehlt = 0;

export function stundenAnbinden(){
  el("tag-heute").addEventListener("click", () => tagWaehlen(0));
  el("tag-morgen").addEventListener("click", () => tagWaehlen(1));
}

export function zeichneStunden(satz = satzRef){
  if (!satz) return;
  satzRef = satz;
  const tag = satz.tage[gewaehlt];
  if (!tag) return;
  const jetzt = new Date(), std = stundeVon(jetzt), heuteIst = isoTag(jetzt) === tag.iso;

  const zeilen = satz.stunden
    .filter(h => h.iso.startsWith(tag.iso))
    .filter(h => {
      const s = +h.iso.slice(11,13);
      return heuteIst ? s >= std : s >= 5;
    })
    .map(h => {
      const s = +h.iso.slice(11,13);
      const nachts = h.zeit < tag.auf || h.zeit >= tag.unter;
      const istJetzt = heuteIst && s === std;
      const breite = Math.max(h.mm > 0 ? 8 : 0, Math.min(100, h.wahrsch));
      const fuell = (h.wahrsch >= 5 || h.mm > 0)
        ? `<div class="fuell" style="width:${breite.toFixed(0)}%;background:${nassFarbe(h.mm)};opacity:${h.mm > 0 ? .95 : .3}"></div>`
        : "";
      const mmText = h.mm > 0 ? `${h.mm.toFixed(1)} mm` : (h.wahrsch >= 20 ? `${h.wahrsch} %` : "");
      const gefuehltAbweichung = Math.abs(h.gefuehlt - h.temp) >= 2;
      return `<div class="std ${nachts?"nacht":""} ${istJetzt?"jetzt":""}">
        <div class="zeit">${String(s).padStart(2,"0")}</div>
        <div class="zeichen" title="${lage(h.code)}">${zeichen(h.code)}</div>
        <div class="temp">${h.temp.toFixed(0)}°${gefuehltAbweichung ? `<i>${h.gefuehlt.toFixed(0)}°</i>` : ""}</div>
        <div class="nass"><div class="spur"></div>${fuell}<div class="mm">${mmText}</div></div>
        <div class="wind ${h.boe >= 45 ? "boe" : ""}"><b>${Math.round(h.wind)}</b>${h.boe >= 45 ? `<br>${Math.round(h.boe)}` : ""}</div>
      </div>`;
    });

  el("stunden").innerHTML = zeilen.length ? zeilen.join("")
    : `<div class="laedt">Für diesen Tag liegen keine Stundenwerte mehr vor.</div>`;
}

function tagWaehlen(n){
  gewaehlt = n;
  el("tag-heute").setAttribute("aria-pressed", n === 0 ? "true" : "false");
  el("tag-morgen").setAttribute("aria-pressed", n === 1 ? "true" : "false");
  zeichneStunden();
}
