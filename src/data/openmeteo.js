import { ORT } from "../config.js";

/* Open-Meteo → normalisierte Form. Jede weitere Quelle (eigener Dienst,
   MeteoSchweiz) muss nur dieselbe Form zurückgeben; die Ansichten bleiben. */

const q = o => Object.entries(o).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join("&");
const BASIS = { latitude: ORT.lat, longitude: ORT.lon, timezone: ORT.tz };

const WETTER = "https://api.open-meteo.com/v1/forecast?" + q({
  ...BASIS,
  current: "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m",
  minutely_15: "precipitation",
  hourly: "temperature_2m,apparent_temperature,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m",
  daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max",
  forecast_days: 7, forecast_minutely_15: 1
});
const LUFT = "https://air-quality-api.open-meteo.com/v1/air-quality?" + q({
  ...BASIS, current: "european_aqi,pm2_5" });
const RHEIN = "https://flood-api.open-meteo.com/v1/flood?" + q({
  latitude: ORT.lat, longitude: ORT.lon, daily: "river_discharge", forecast_days: 3 });

async function hole(url){
  const a = await fetch(url, {cache:"no-store"});
  if (!a.ok) throw new Error(`${url} → ${a.status}`);
  return a.json();
}

export async function laden(){
  const d = await hole(WETTER);
  const [luft, rhein] = await Promise.all([
    hole(LUFT).catch(() => null), hole(RHEIN).catch(() => null)
  ]);
  return normalisieren(d, luft, rhein);
}

function normalisieren(d, luft, rhein){
  const h = d.hourly, t = d.daily, c = d.current;
  return {
    stand: Date.now(),
    modell: "ICON-D2 über Open-Meteo",
    aktuell: {
      temp: c.temperature_2m, gefuehlt: c.apparent_temperature,
      feuchte: c.relative_humidity_2m, wind: c.wind_speed_10m,
      richtung: c.wind_direction_10m, code: c.weather_code
    },
    stunden: h.time.map((iso,i) => ({
      iso, zeit: new Date(iso + ":00"),
      temp: h.temperature_2m[i], gefuehlt: h.apparent_temperature[i],
      mm: h.precipitation[i] ?? 0, wahrsch: h.precipitation_probability[i] ?? 0,
      code: h.weather_code[i], wind: h.wind_speed_10m[i], boe: h.wind_gusts_10m[i] ?? 0
    })),
    tage: t.time.map((iso,i) => ({
      iso, code: t.weather_code[i],
      tmin: t.temperature_2m_min[i], tmax: t.temperature_2m_max[i],
      auf: new Date(t.sunrise[i]), unter: new Date(t.sunset[i]),
      nassWahrsch: t.precipitation_probability_max[i] ?? 0,
      uvMax: t.uv_index_max[i]
    })),
    minuten: (d.minutely_15?.time || []).map((iso,i) => ({
      iso, zeit: new Date(iso + ":00"), mm: d.minutely_15.precipitation[i] ?? 0
    })),
    luft: luft?.current ? { aqi: luft.current.european_aqi, pm25: luft.current.pm2_5 } : null,
    fluss: rhein?.daily ? { abfluss: rhein.daily.river_discharge?.[0] } : null
  };
}
