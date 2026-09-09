/* Mondphase aus dem synodischen Monat. Genau genug für eine Sichel im Dunkeln. */
export function mondphase(d){
  const synodisch = 29.530588853;
  const neumond = Date.UTC(2000,0,6,18,14);
  const alter = ((((d.getTime()-neumond)/86400000) % synodisch) + synodisch) % synodisch;
  const anteil = alter / synodisch;
  const beleuchtet = (1 - Math.cos(2*Math.PI*anteil)) / 2;
  const namen = [
    [0.02,"Neumond"],[0.24,"Zunehmende Sichel"],[0.28,"Erstes Viertel"],
    [0.48,"Zunehmender Mond"],[0.52,"Vollmond"],[0.73,"Abnehmender Mond"],
    [0.77,"Letztes Viertel"],[0.98,"Abnehmende Sichel"],[1.01,"Neumond"]
  ];
  return { anteil, beleuchtet, alter, name: namen.find(n => anteil <= n[0])[1] };
}

export function mondSvg(anteil, beleuchtet){
  const r = 26, c = 30;
  const zunehmend = anteil < 0.5;
  const k = Math.abs(1 - 2*beleuchtet) * r;
  const richtung = (beleuchtet > 0.5) === zunehmend ? 1 : 0;
  return `<svg viewBox="0 0 60 60" width="60" height="60" role="img" aria-label="Mondphase">
    <circle cx="${c}" cy="${c}" r="${r}" fill="#111C1F" stroke="var(--line)"/>
    <path d="M ${c} ${c-r} A ${r} ${r} 0 0 ${zunehmend?1:0} ${c} ${c+r}
             A ${k} ${r} 0 0 ${richtung} ${c} ${c-r} Z" fill="#C9C3AE"/></svg>`;
}
