/* Zwei Strategien, mehr braucht es nicht:
   - Hülle (HTML, CSS, Module, Leaflet, Schriften): cache first, damit die App
     sofort und offline öffnet.
   - Wetterdaten: network first mit kurzem Zeitlimit, sonst der letzte Stand.
   Radarkacheln werden nie gespeichert — sie sind in fünf Minuten falsch. */

const VERSION = "v1";
const HUELLE = `huelle-${VERSION}`;
const DATEN = `daten-${VERSION}`;

const SCHALE = [
  "./", "./index.html", "./styles.css", "./manifest.webmanifest",
  "./src/main.js", "./src/config.js",
  "./src/lib/format.js", "./src/lib/mond.js",
  "./src/data/quelle.js", "./src/data/openmeteo.js",
  "./src/data/speicher.js", "./src/data/rainviewer.js",
  "./src/view/jetzt.js", "./src/view/briefing.js", "./src/view/stunden.js",
  "./src/view/nowcast.js", "./src/view/kurve.js", "./src/view/tage.js",
  "./src/view/himmel.js", "./src/view/luft.js", "./src/view/radar.js",
  "./vendor/leaflet/leaflet.js", "./vendor/leaflet/leaflet.css",
  "./fonts/IBMPlexMono-Light-Latin1.woff2",
  "./fonts/IBMPlexMono-Regular-Latin1.woff2",
  "./fonts/IBMPlexMono-Medium-Latin1.woff2",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"
];

const DATEN_WIRTE = ["api.open-meteo.com", "air-quality-api.open-meteo.com",
                     "flood-api.open-meteo.com"];

self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(HUELLE)
    .then(c => c.addAll(SCHALE))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", ev => {
  ev.waitUntil(caches.keys()
    .then(namen => Promise.all(namen
      .filter(n => n !== HUELLE && n !== DATEN)
      .map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", ev => {
  const url = new URL(ev.request.url);
  if (ev.request.method !== "GET") return;

  if (DATEN_WIRTE.includes(url.hostname)){
    ev.respondWith(netzZuerst(ev.request));
    return;
  }
  // Radar und Kartenkacheln: durchreichen, nicht speichern.
  if (url.hostname.includes("rainviewer.com") || url.hostname.includes("arcgisonline.com")) return;

  if (url.origin === self.location.origin){
    ev.respondWith(cacheZuerst(ev.request));
  }
});

async function cacheZuerst(anfrage){
  const treffer = await caches.match(anfrage);
  if (treffer) return treffer;
  try {
    const antwort = await fetch(anfrage);
    if (antwort.ok && anfrage.url.startsWith(self.location.origin)){
      const kopie = antwort.clone();
      caches.open(HUELLE).then(c => c.put(anfrage, kopie));
    }
    return antwort;
  } catch {
    return caches.match("./index.html");
  }
}

async function netzZuerst(anfrage){
  try {
    const antwort = await fetch(anfrage);
    if (antwort.ok){
      const kopie = antwort.clone();
      caches.open(DATEN).then(c => c.put(anfrage, kopie));
    }
    return antwort;
  } catch (fehler) {
    const treffer = await caches.match(anfrage);
    if (treffer) return treffer;
    throw fehler;
  }
}
