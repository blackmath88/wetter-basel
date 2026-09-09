import { RADAR } from "../config.js";

/** Vergangene Bilder plus Nowcast, in der Reihenfolge der Zeit. */
export async function rahmenHolen(){
  const a = await fetch(RADAR.api, {cache:"no-store"});
  if (!a.ok) throw new Error(`RainViewer → ${a.status}`);
  const j = await a.json();
  const rahmen = [...(j.radar?.past || []).slice(-8), ...(j.radar?.nowcast || [])];
  if (!rahmen.length) throw new Error("keine Radarbilder");
  return { wirt: j.host, rahmen };
}

/** 512er-Kacheln im 256er-Raster: doppelte Pixeldichte vor dem Hochskalieren. */
export const kachelUrl = (wirt, pfad) => `${wirt}${pfad}/512/{z}/{x}/{y}/8/1_1.png`;
