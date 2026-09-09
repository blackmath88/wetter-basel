import { QUELLE } from "../config.js";
import * as openmeteo from "./openmeteo.js";
import { merken, letzter } from "./speicher.js";

/* Die Naht zwischen App und Anbieter. Alles darüber kennt nur die
   normalisierte Form, nie eine URL. */

async function vomDienst(){
  const a = await fetch(`${QUELLE.bffBasis}/v1/wetter`, {cache:"no-store"});
  if (!a.ok) throw new Error(`BFF → ${a.status}`);
  const s = await a.json();
  s.stunden.forEach(h => h.zeit = new Date(h.zeit));
  s.minuten.forEach(m => m.zeit = new Date(m.zeit));
  s.tage.forEach(t => { t.auf = new Date(t.auf); t.unter = new Date(t.unter); });
  return s;
}

/** Liefert {satz, frisch}. Bei Netzfehler den letzten bekannten Stand. */
export async function wetter(){
  try {
    const satz = QUELLE.art === "bff" ? await vomDienst() : await openmeteo.laden();
    merken(satz);
    return { satz, frisch: true };
  } catch (fehler) {
    const alt = letzter();
    if (alt) return { satz: alt, frisch: false, fehler };
    throw fehler;
  }
}
