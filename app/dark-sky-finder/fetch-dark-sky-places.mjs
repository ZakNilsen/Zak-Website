// Regenerates app/dark-sky-finder/darkSkyPlaces.generated.json from the DSAG
// (IUCN Dark Skies Advisory Group) World List of Dark Sky Places — the most
// complete consolidated list, covering DarkSky International, the RASC, and
// Fundación Starlight designations.
//
//   node scripts/fetch-dark-sky-places.mjs
//
// The source is a hand-maintained WordPerfect-exported HTML page, so this
// parser is deliberately forgiving. It reads paragraphs in order:
//   - ALL-CAPS paragraphs are country headings
//   - an entry is a title paragraph followed by optional "•" bullet lines
//     (constituent protected areas), a "Central lat/long: X, Y." line, a
//     "Recognition: <year>, <body>" line, and a "DSAG class N" line.
// Anything that can't be parsed is reported to stderr rather than silently
// dropped, so a source-format change is noticeable.
//
// Known-bad coordinates in the source are NOT fixed here — corrections live
// in darkSkyPlaces.ts as overrides so they survive regeneration.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SOURCE_URL = "https://darkskyparks.org/dsag/DSAG_word_list.htm";
const OUT_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "darkSkyPlaces.generated.json"
);

// Friendlier names for the map popup than the source's formal headings.
const COUNTRY_RENAMES = {
  "UNITED STATES OF AMERICA": "United States",
  "UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND": "United Kingdom",
  "TAIWAN, PROVINCE OF CHINA": "Taiwan",
  COLUMBIA: "Colombia", // typo in the source
};

function titleCase(caps) {
  return caps
    .toLowerCase()
    .replace(/(^|[\s(-])([a-z])/g, (m, pre, ch) => pre + ch.toUpperCase())
    .replace(/\bOf\b/g, "of")
    .replace(/\bAnd\b/g, "and");
}

function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The certification title tells us the designation; DSAG class breaks ties.
function designationFor(title, dsagClass) {
  if (/sanctuary/i.test(title)) return "Sanctuary";
  if (/reserve/i.test(title)) return "Reserve";
  if (/community/i.test(title)) return "Community";
  if (dsagClass?.startsWith("6")) return "Community";
  if (dsagClass?.startsWith("5")) return "Reserve";
  return "Park";
}

// Strip certification boilerplate off the title for a cleaner marker label.
function displayName(title) {
  const stripped = title
    .replace(/\s+and Starlight Touris[mt] Destination$/i, "")
    .replace(/\s+(International\s+)?Dark Sky (Park|Reserve|Sanctuary|Community|Preserve)$/i, "")
    .replace(/\s+Urban Night Sky Place$/i, "")
    .trim();
  return stripped.length >= 3 ? stripped : title;
}

const res = await fetch(SOURCE_URL);
if (!res.ok) {
  console.error(`Fetch failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const html = await res.text();

// The accented names in the source use named entities (&aacute; etc.).
const NAMED_ENTITIES = {
  nbsp: " ", amp: "&", aacute: "á", agrave: "à", acirc: "â", auml: "ä",
  eacute: "é", egrave: "è", ecirc: "ê", euml: "ë", iacute: "í", icirc: "î",
  ntilde: "ñ", oacute: "ó", ocirc: "ô", oslash: "ø", ouml: "ö",
  uacute: "ú", uuml: "ü", ccedil: "ç", szlig: "ß", aring: "å", aelig: "æ",
};

// Pull every paragraph's plain text, in document order.
const paragraphs = [];
for (const m of html.matchAll(/<p[^>]*>(.*?)<\/p>/gs)) {
  const text = m[1]
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&([a-z]+);/g, (whole, name) => NAMED_ENTITIES[name] ?? whole)
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text) paragraphs.push(text);
}

const updatedMatch = paragraphs
  .slice(0, 10)
  .map((p) => p.match(/^Updated\s+(.+)$/i))
  .find(Boolean);

const places = [];
const warnings = [];
let country = null;
let pendingTitle = null;
let current = null; // last completed entry, still accepting Recognition/class lines

for (const text of paragraphs) {
  // Country heading (skip the front-matter headings before the first country).
  if (text === text.toUpperCase() && /^[A-Z][A-Z ,'()-]+$/.test(text) && text.length > 3) {
    if (!/^(WORLD LIST|CLASS AND SUB-CLASS)/.test(text)) {
      country = COUNTRY_RENAMES[text] ?? titleCase(text);
    }
    pendingTitle = null;
    current = null;
    continue;
  }
  if (!country) continue;

  if (text.startsWith("•")) continue; // constituent protected areas — not needed

  const coords = text.match(/Central lat\/?long:?\s*(-?\d+(?:\.\d+)?)[,;]\s*(-?\d+(?:\.\d+)?)/i);
  if (coords) {
    if (!pendingTitle) {
      warnings.push(`Coordinates with no preceding title near: "${text.slice(0, 60)}"`);
      continue;
    }
    current = {
      title: pendingTitle,
      lat: Number(coords[1]),
      lng: Number(coords[2]),
      region: country,
      year: null,
      dsagClass: null,
    };
    places.push(current);
    pendingTitle = null;
    continue;
  }

  const recognition = text.match(/^Recognition:?\s*(\d{4})/i);
  if (recognition) {
    if (current) current.year = Number(recognition[1]);
    continue;
  }

  const dsagClass = text.match(/^DSAG class\s*(\S+)/i);
  if (dsagClass) {
    if (current) current.dsagClass = dsagClass[1];
    continue;
  }

  // Skip other metadata continuation lines ("Total area ...", notes, etc.)
  if (/^(Total area|Protected area|Recognition)/i.test(text)) continue;

  // Anything else is (a candidate for) the next entry's title.
  pendingTitle = text;
  current = null;
}

// Shape, de-duplicate ids, and sort for a stable diff.
const seen = new Map();
const output = places.map((p) => {
  const name = displayName(p.title);
  let id = slugify(name);
  if (seen.has(id)) {
    id = `${id}-${slugify(p.region)}`;
    let n = 2;
    while (seen.has(id)) id = `${slugify(name)}-${slugify(p.region)}-${n++}`;
  }
  seen.set(id, true);
  return {
    id,
    name,
    lat: p.lat,
    lng: p.lng,
    designation: designationFor(p.title, p.dsagClass),
    region: p.region,
    ...(p.year ? { year: p.year } : {}),
  };
});
output.sort((a, b) => a.region.localeCompare(b.region) || a.name.localeCompare(b.name));

for (const w of warnings) console.error(`warning: ${w}`);
writeFileSync(
  OUT_PATH,
  JSON.stringify(
    {
      source: SOURCE_URL,
      sourceUpdated: updatedMatch ? updatedMatch[1] : null,
      fetched: new Date().toISOString().slice(0, 10),
      places: output,
    },
    null,
    2
  ) + "\n"
);
console.log(`Wrote ${output.length} places to ${OUT_PATH}`);
console.log(`Source last updated: ${updatedMatch ? updatedMatch[1] : "unknown"}`);
