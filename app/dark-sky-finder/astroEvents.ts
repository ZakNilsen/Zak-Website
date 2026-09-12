// Upcoming sky events for the calendar panel: annual meteor showers, notable
// fixed-date events (eclipses, oppositions, solstices/equinoxes), and the next
// new/full moons computed from the same synodic math as astro.ts.
//
// Meteor shower peaks drift a day either way year to year; fixed events below
// are from published ephemerides. Dates are "the night of" — precise-enough
// for a heads-up card, not for expedition planning.

import { moonInfo } from "./astro";

export type AstroEvent = {
  date: Date;
  name: string;
  kind: "meteors" | "eclipse" | "planet" | "season" | "moon";
  detail: string;
};

// Annual showers: peak month/day (0-based month), typical zenithal hourly rate.
const METEOR_SHOWERS: { month: number; day: number; name: string; zhr: number }[] = [
  { month: 0, day: 3, name: "Quadrantids", zhr: 110 },
  { month: 3, day: 22, name: "Lyrids", zhr: 18 },
  { month: 4, day: 6, name: "Eta Aquariids", zhr: 50 },
  { month: 6, day: 30, name: "Delta Aquariids", zhr: 25 },
  { month: 7, day: 12, name: "Perseids", zhr: 100 },
  { month: 9, day: 21, name: "Orionids", zhr: 20 },
  { month: 10, day: 17, name: "Leonids", zhr: 15 },
  { month: 11, day: 14, name: "Geminids", zhr: 150 },
  { month: 11, day: 22, name: "Ursids", zhr: 10 },
];

// Notable one-off events (UTC dates, published ephemerides).
const FIXED_EVENTS: { iso: string; name: string; kind: AstroEvent["kind"]; detail: string }[] = [
  { iso: "2026-01-10", name: "Jupiter at opposition", kind: "planet", detail: "Brightest of the year, up all night" },
  { iso: "2026-02-17", name: "Annular solar eclipse", kind: "eclipse", detail: "Ring of fire — Antarctica only" },
  { iso: "2026-03-03", name: "Total lunar eclipse", kind: "eclipse", detail: "Blood moon — visible from the Americas & Pacific" },
  { iso: "2026-03-20", name: "Spring equinox", kind: "season", detail: "Equal day and night" },
  { iso: "2026-06-21", name: "Summer solstice", kind: "season", detail: "Shortest night of the year" },
  { iso: "2026-08-12", name: "Total solar eclipse", kind: "eclipse", detail: "Greenland, Iceland & Spain — same night as the Perseids!" },
  { iso: "2026-08-28", name: "Partial lunar eclipse", kind: "eclipse", detail: "Visible from the Americas" },
  { iso: "2026-09-23", name: "Fall equinox", kind: "season", detail: "Equal day and night" },
  { iso: "2026-10-04", name: "Saturn at opposition", kind: "planet", detail: "Best views of the rings" },
  { iso: "2026-12-21", name: "Winter solstice", kind: "season", detail: "Longest night of the year" },
  { iso: "2027-02-19", name: "Mars at opposition", kind: "planet", detail: "Closest and brightest until 2029" },
  { iso: "2027-03-20", name: "Spring equinox", kind: "season", detail: "Equal day and night" },
];

const SYNODIC_MONTH = 29.53058867;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14);

// Next moment the moon reaches the given phase fraction (0 = new, 0.5 = full).
function nextMoonPhase(after: Date, targetFrac: number): Date {
  const days = (after.getTime() - KNOWN_NEW_MOON_UTC) / 86_400_000;
  const cycles = days / SYNODIC_MONTH;
  let target = Math.floor(cycles) + targetFrac;
  if (target <= cycles) target += 1;
  return new Date(KNOWN_NEW_MOON_UTC + target * SYNODIC_MONTH * 86_400_000);
}

function moonNoteFor(date: Date): string {
  const { illuminationPct } = moonInfo(date);
  if (illuminationPct <= 30) return `🌑 ${illuminationPct}% moon — dark skies`;
  if (illuminationPct <= 65) return `🌓 ${illuminationPct}% moon`;
  return `🌕 ${illuminationPct}% moon washes it out`;
}

export function upcomingEvents(now: Date, count = 6): AstroEvent[] {
  const events: AstroEvent[] = [];

  // Meteor showers recur annually — materialize this year's and next year's.
  for (const year of [now.getFullYear(), now.getFullYear() + 1]) {
    for (const s of METEOR_SHOWERS) {
      const date = new Date(year, s.month, s.day, 22); // peak viewing is late evening
      events.push({
        date,
        name: `${s.name} meteor shower`,
        kind: "meteors",
        detail: `Up to ${s.zhr}/hr · ${moonNoteFor(date)}`,
      });
    }
  }

  for (const f of FIXED_EVENTS) {
    events.push({ date: new Date(`${f.iso}T22:00:00`), name: f.name, kind: f.kind, detail: f.detail });
  }

  const nextNew = nextMoonPhase(now, 0);
  const nextFull = nextMoonPhase(now, 0.5);
  events.push({ date: nextNew, name: "New Moon", kind: "moon", detail: "Darkest skies of the month" });
  events.push({ date: nextFull, name: "Full Moon", kind: "moon", detail: "Great for craters, bad for galaxies" });

  return events
    .filter((e) => e.date.getTime() > now.getTime() - 12 * 3_600_000) // keep tonight's events
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, count);
}

export const EVENT_EMOJI: Record<AstroEvent["kind"], string> = {
  meteors: "☄️",
  eclipse: "🌘",
  planet: "🪐",
  season: "🌍",
  moon: "🌙",
};
