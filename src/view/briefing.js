import { el, isoTag, stundeVon } from "../lib/format.js";

/* Der Satz, den man morgens im Halbdunkel liest, bevor man denkt. */
export function zeichneBriefing(satz){
  const heute = satz.tage[0].iso;
  const jetzt = new Date();
  const std = stundeVon(jetzt);
  const heuteIst = isoTag(jetzt) === heute;

  const alle = satz.stunden.filter(h => h.iso.startsWith(heute));
  const rest = heuteIst ? alle.filter(h => +h.iso.slice(11,13) >= std) : alle;
  const fenster = rest.length ? rest : alle;
  if (!fenster.length) return;

  const bei = s => alle.find(h => +h.iso.slice(11,13) === s);
  const temps = fenster.map(h => h.temp);
  const tMax = Math.max(...temps), tMin = Math.min(...temps);
  const waermste = fenster[temps.indexOf(tMax)];

  const saetze = [];
  const frueh = bei(8), mittag = bei(13), abend = bei(19);
  if (heuteIst && std < 10 && frueh){
    saetze.push(`Morgens <b>${frueh.temp.toFixed(0)}°</b>, mittags`
      + ` <b>${mittag ? mittag.temp.toFixed(0) : "–"}°</b>, abends`
      + ` <b>${abend ? abend.temp.toFixed(0) : "–"}°</b>.`);
  } else {
    saetze.push(`Bis Mitternacht <b>${tMin.toFixed(0)}°</b> bis <b>${tMax.toFixed(0)}°</b>,`
      + ` am wärmsten gegen <b>${waermste.iso.slice(11,13)} Uhr</b>.`);
  }

  const nass = fenster.filter(h => h.mm >= 0.1);
  const summe = fenster.reduce((s,h) => s + h.mm, 0);
  const pMax = Math.max(...fenster.map(h => h.wahrsch));
  if (!nass.length){
    saetze.push(pMax >= 30
      ? `Kein Regen im Modell, aber bis <b>${pMax} %</b> Wahrscheinlichkeit — Schauer möglich.`
      : `<b>Trocken</b> den ganzen Tag.`);
  } else {
    saetze.push(`Nass zwischen <b>${nass[0].iso.slice(11,13)}</b> und`
      + ` <b>${nass[nass.length-1].iso.slice(11,13)} Uhr</b>,`
      + ` zusammen <b>${summe.toFixed(1)} mm</b>.`);
  }

  const boe = Math.max(...fenster.map(h => h.boe));
  if (boe >= 45) saetze.push(`<span class="warn">Böen bis <b>${Math.round(boe)} km/h</b>.</span>`);
  const uv = satz.tage[0].uvMax;
  if (uv >= 6) saetze.push(`UV-Index bis <b>${uv.toFixed(0)}</b> — Sonnenschutz.`);

  const bezug = (heuteIst && std < 10 && frueh) ? Math.min(frueh.temp, frueh.gefuehlt) : tMin;
  const kleidung = bezug < 0 ? "Winterjacke, Mütze"
    : bezug < 7 ? "Warme Jacke" : bezug < 13 ? "Jacke"
    : bezug < 19 ? "Pullover oder leichte Jacke" : "Kurzarm reicht";
  const schirm = pMax >= 40 || summe >= 0.5;

  const feld = el("briefing");
  if (feld) feld.innerHTML = saetze.map(s => `<span class="satz">${s}</span>`).join("")
    + `<div class="rat">Mitnehmen: <b>${kleidung}</b>${schirm ? ", <b>Schirm</b>" : ""}.</div>`;
}
