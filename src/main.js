import { TAKT } from "./config.js";
import { el, uhrzeit, datumKurz, vorWieLange } from "./lib/format.js";
import { wetter } from "./data/quelle.js";
import { zeichneJetzt } from "./view/jetzt.js";
import { zeichneBriefing } from "./view/briefing.js";
import { zeichneStunden, stundenAnbinden } from "./view/stunden.js";
import { zeichneNowcast } from "./view/nowcast.js";
import { zeichneKurve, kurveAnbinden } from "./view/kurve.js";
import { zeichneTage } from "./view/tage.js";
import { zeichneHimmel } from "./view/himmel.js";
import { zeichneLuft } from "./view/luft.js";
import { radarLaden, radarAnbinden, spielen } from "./view/radar.js";

function tickUhr(){
  const jetzt = new Date();
  el("uhr").textContent = uhrzeit(jetzt);
  el("datum").textContent = datumKurz(jetzt);
}

function altersbanner(satz, frisch){
  const banner = el("altbanner");
  const alt = (Date.now() - satz.stand) / 60000;
  if (!frisch && alt > TAKT.altMinuten){
    banner.hidden = false;
    banner.textContent = `Offline — angezeigt wird der Stand von ${vorWieLange(satz.stand)}.`;
  } else {
    banner.hidden = true;
  }
}

function zeichneAlles(satz){
  zeichneJetzt(satz);
  zeichneBriefing(satz);
  zeichneStunden(satz);
  zeichneNowcast(satz.minuten);
  zeichneKurve(satz);
  zeichneTage(satz);
  zeichneHimmel(satz);
  zeichneLuft(satz);
}

async function laden(){
  el("stand").textContent = "lädt …";
  try {
    const { satz, frisch } = await wetter();
    zeichneAlles(satz);
    altersbanner(satz, frisch);
    el("stand").textContent = frisch
      ? `Stand ${uhrzeit(new Date(satz.stand))} · ${satz.modell}`
      : `Kein Netz · gespeicherter Stand ${vorWieLange(satz.stand)}`;
  } catch {
    el("jetzt").innerHTML = `<div class="fehler">Keine Verbindung und kein gespeicherter Stand.
      Prüf die Netzverbindung und lade neu.</div>`;
    el("stand").textContent = "letzter Versuch fehlgeschlagen";
  }
  radarLaden();
}

/* Verdrahtung */
stundenAnbinden();
kurveAnbinden();
radarAnbinden();
el("neu").addEventListener("click", laden);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) spielen(false); else { tickUhr(); zeichneStunden(); }
});

tickUhr();
setInterval(tickUhr, TAKT.uhrMs);
setInterval(laden, TAKT.nachladenMs);
laden();

if ("serviceWorker" in navigator){
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("sw.js").catch(() => { /* z.B. file:// */ }));
}
