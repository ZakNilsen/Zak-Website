// Small, dependency-free astronomy helpers for the "Tonight's sky" card.
// Approximations are deliberate — this powers a fun forecast card, not an
// ephemeris. Moon phase is good to a few hours; twilight times to ~5 minutes.

const SYNODIC_MONTH = 29.53058867; // days between new moons
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14);

export type MoonInfo = {
  name: string;
  emoji: string;
  illuminationPct: number;
};

const MOON_PHASES: [string, string][] = [
  ["New Moon", "🌑"],
  ["Waxing Crescent", "🌒"],
  ["First Quarter", "🌓"],
  ["Waxing Gibbous", "🌔"],
  ["Full Moon", "🌕"],
  ["Waning Gibbous", "🌖"],
  ["Last Quarter", "🌗"],
  ["Waning Crescent", "🌘"],
];

export function moonInfo(date: Date): MoonInfo {
  const days = (date.getTime() - KNOWN_NEW_MOON_UTC) / 86_400_000;
  const age = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const frac = age / SYNODIC_MONTH; // 0 = new, 0.5 = full
  const illuminationPct = Math.round(50 * (1 - Math.cos(2 * Math.PI * frac)));
  const [name, emoji] = MOON_PHASES[Math.round(frac * 8) % 8];
  return { name, emoji, illuminationPct };
}

// Time the sun crosses `altitudeDeg` on the given UTC day (NOAA-style
// approximation: solar declination + equation of time). Returns null when the
// sun never reaches that altitude (e.g. no astronomical darkness at high
// latitudes in summer).
function solarCrossingUTC(
  dayUtcMidnight: number,
  lat: number,
  lng: number,
  altitudeDeg: number,
  rising: boolean
): Date | null {
  const rad = Math.PI / 180;
  const yearStart = Date.UTC(new Date(dayUtcMidnight).getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((dayUtcMidnight - yearStart) / 86_400_000);

  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10)); // degrees
  const b = (2 * Math.PI * (dayOfYear - 81)) / 364;
  const equationOfTimeMin = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  const cosHourAngle =
    (Math.sin(altitudeDeg * rad) - Math.sin(lat * rad) * Math.sin(declination * rad)) /
    (Math.cos(lat * rad) * Math.cos(declination * rad));
  if (cosHourAngle < -1 || cosHourAngle > 1) return null;

  const hourAngleDeg = Math.acos(cosHourAngle) / rad;
  const solarNoonMinUTC = 720 - 4 * lng - equationOfTimeMin;
  const minutes = solarNoonMinUTC + (rising ? -4 * hourAngleDeg : 4 * hourAngleDeg);
  return new Date(dayUtcMidnight + minutes * 60_000);
}

export type DarknessWindow = {
  dusk: Date | null; // astronomical dusk tonight (sun 18° below horizon)
  dawn: Date | null; // astronomical dawn tomorrow morning
};

export function astroDarkness(now: Date, lat: number, lng: number): DarknessWindow {
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return {
    dusk: solarCrossingUTC(todayUtc, lat, lng, -18, false),
    dawn: solarCrossingUTC(todayUtc + 86_400_000, lat, lng, -18, true),
  };
}

// 0–5 star stargazing score. Clouds dominate; a bright moon washes out faint
// targets; humidity means haze; wind means shaky views.
export function stargazingScore(input: {
  avgCloudPct: number;
  moonIlluminationPct: number;
  avgHumidityPct: number | null;
  avgWindMph: number | null;
}): number {
  const cloud = 1 - input.avgCloudPct / 100;
  const moon = 1 - input.moonIlluminationPct / 100;
  const humidity =
    input.avgHumidityPct === null ? 0.7 : 1 - Math.max(0, input.avgHumidityPct - 40) / 60;
  const wind = input.avgWindMph === null ? 0.8 : 1 - Math.min(input.avgWindMph, 25) / 25;
  const total = 0.5 * cloud + 0.25 * moon + 0.15 * humidity + 0.1 * wind;
  return Math.max(0, Math.min(5, Math.round(total * 5)));
}
