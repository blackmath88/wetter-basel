/* Letzter Datensatz im localStorage. Damit die App morgens sofort etwas zeigt,
   auch im Keller ohne Empfang — mit ehrlicher Altersangabe. */
const SCHLUESSEL = "wetter-basel:letzter";

export function merken(satz){
  try { localStorage.setItem(SCHLUESSEL, JSON.stringify(satz)); } catch { /* voll oder gesperrt */ }
}

export function letzter(){
  try {
    const roh = localStorage.getItem(SCHLUESSEL);
    return roh ? beleben(JSON.parse(roh)) : null;
  } catch { return null; }
}

/** JSON kennt keine Date-Objekte — beim Lesen zurückverwandeln. */
function beleben(s){
  s.stunden?.forEach(h => h.zeit = new Date(h.zeit));
  s.minuten?.forEach(m => m.zeit = new Date(m.zeit));
  s.tage?.forEach(t => { t.auf = new Date(t.auf); t.unter = new Date(t.unter); });
  return s;
}
