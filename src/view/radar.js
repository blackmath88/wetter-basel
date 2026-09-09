import { el, uhrzeit } from "../lib/format.js";
import { ORT, RADAR } from "../config.js";
import { rahmenHolen, kachelUrl } from "../data/rainviewer.js";

let karte = null, rahmen = [], schichten = {}, wirt = "", idx = 0, laeuft = false, timer = null;

function karteAufbauen(){
  if (karte || typeof L === "undefined") return;
  const ESRI = "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/";
  karte = L.map("karte", {zoomControl:true, minZoom:RADAR.minZoom, maxZoom:RADAR.maxZoom})
           .setView([ORT.lat, ORT.lon], RADAR.stufen["z-stadt"]);
  L.tileLayer(ESRI + "World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    {attribution:"Esri, OpenStreetMap, RainViewer", maxNativeZoom:16, maxZoom:RADAR.maxZoom}).addTo(karte);
  L.tileLayer(ESRI + "World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    {maxNativeZoom:16, maxZoom:RADAR.maxZoom, opacity:.6, zIndex:400}).addTo(karte);
  L.circleMarker([ORT.lat, ORT.lon],
    {radius:4, color:"#D6301F", weight:1.5, fillOpacity:1, fillColor:"#D6301F"}).addTo(karte);

  // Der Container wird oft erst nach dem Layout gemessen — sonst sitzt die Mitte daneben.
  const mitte = () => { karte.invalidateSize(); karte.setView([ORT.lat, ORT.lon], RADAR.stufen["z-stadt"]); };
  setTimeout(mitte, 60);
  window.addEventListener("load", mitte, {once:true});
  window.addEventListener("resize", () => karte.invalidateSize());
  karte.on("zoomend", zoomKnoepfe);
}

function zoomKnoepfe(){
  if (!karte) return;
  const z = karte.getZoom();
  const naechste = Object.entries(RADAR.stufen)
    .sort((a,b) => Math.abs(a[1]-z) - Math.abs(b[1]-z))[0][0];
  Object.keys(RADAR.stufen).forEach(id =>
    el(id).setAttribute("aria-pressed", id === naechste ? "true" : "false"));
}

function rahmenZeigen(i){
  if (!rahmen.length) return;
  idx = (i + rahmen.length) % rahmen.length;
  const f = rahmen[idx];
  if (!schichten[f.path]){
    schichten[f.path] = L.tileLayer(kachelUrl(wirt, f.path),
      {opacity:0, tileSize:256, maxNativeZoom:RADAR.maxNativeZoom, maxZoom:RADAR.maxZoom,
       zIndex:300, crossOrigin:true}).addTo(karte);
  }
  Object.entries(schichten).forEach(([p,s]) => s.setOpacity(p === f.path ? RADAR.deckkraft : 0));
  const zeit = new Date(f.time * 1000);
  el("zeitmarke").innerHTML =
    `${uhrzeit(zeit)}<i>${f.time*1000 > Date.now() ? "Vorhersage" : "gemessen"}</i>`;
  el("schieber").value = idx;
}

export function spielen(an){
  laeuft = an;
  el("spiel").textContent = an ? "❚❚" : "▶";
  el("spiel").setAttribute("aria-label", an ? "Radar anhalten" : "Radar abspielen");
  clearInterval(timer);
  if (an) timer = setInterval(() => rahmenZeigen(idx + 1), RADAR.taktMs);
}

export function radarAnbinden(){
  el("spiel").addEventListener("click", () => spielen(!laeuft));
  el("schieber").addEventListener("input", e => { spielen(false); rahmenZeigen(+e.target.value); });
  Object.keys(RADAR.stufen).forEach(id => el(id).addEventListener("click", () => {
    if (karte) karte.setView([ORT.lat, ORT.lon], RADAR.stufen[id]);
  }));
}

export async function radarLaden(){
  try {
    karteAufbauen();
    if (!karte) throw new Error("Leaflet fehlt");
    const antwort = await rahmenHolen();
    wirt = antwort.wirt; rahmen = antwort.rahmen;
    Object.values(schichten).forEach(s => karte.removeLayer(s));
    schichten = {};
    el("schieber").max = rahmen.length - 1;
    const kuenftig = rahmen.findIndex(f => f.time * 1000 > Date.now());
    rahmenZeigen(kuenftig <= 0 ? rahmen.length - 1 : kuenftig - 1);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) spielen(true);
  } catch {
    el("zeitmarke").innerHTML = `<span class="fehler">Radar offline</span>`;
  }
}
