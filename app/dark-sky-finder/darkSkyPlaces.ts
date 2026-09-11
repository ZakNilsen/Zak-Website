// Dark Sky Places, sourced from the DSAG (IUCN World Commission on Protected
// Areas, Dark Skies Advisory Group) World List of Dark Sky Places, compiled
// from the actual certifying bodies (DarkSky International, the Royal
// Astronomical Society of Canada, Fundación Starlight).
//
// The full list lives in darkSkyPlaces.generated.json and is regenerated from
// the source page with:
//
//   node scripts/fetch-dark-sky-places.mjs
//
// New sites are certified every year, so re-run that occasionally — the JSON's
// sourceUpdated field records the source page's own last-updated date.
//
// Known typos in the source are corrected via overrides below (keyed by
// generated id) so they survive regeneration:
//  - Boundary Waters Canoe Area: source gives -99.21° longitude, which falls
//    in North Dakota. Corrected to the wilderness's actual location in
//    northeastern Minnesota (~-91.5°).
//  - Flagstaff, AZ: source gives 31.20°N, which is near the Mexico border.
//    Corrected to Flagstaff's actual coordinates (~35.2°N).

import generated from "./darkSkyPlaces.generated.json";

export type DarkSkyPlace = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  designation: "Park" | "Reserve" | "Sanctuary" | "Community" | "Regional";
  region: string;
  year?: number;
  category?: "Certified" | "Regional";
};

const overrides: Record<string, Partial<DarkSkyPlace>> = {
  "boundary-waters-canoe-area": { lng: -91.5 },
  flagstaff: { lat: 35.1983, lng: -111.6513 },
};

const regionalAdditions: DarkSkyPlace[] = [
  {
    id: "afton-state-park",
    name: "Afton State Park",
    lat: 44.885,
    lng: -92.78,
    designation: "Regional",
    category: "Regional",
    region: "Minnesota, USA",
  },
  {
    id: "black-hills-national-forest",
    name: "Black Hills National Forest",
    lat: 43.7,
    lng: -103.9,
    designation: "Regional",
    category: "Regional",
    region: "South Dakota, USA",
  },
  {
    id: "badlands-national-park",
    name: "Badlands National Park",
    lat: 43.8554,
    lng: -102.3397,
    designation: "Regional",
    category: "Regional",
    region: "South Dakota, USA",
  },
  {
    id: "teddy-roosevelt-national-park",
    name: "Theodore Roosevelt National Park",
    lat: 46.9,
    lng: -103.45,
    designation: "Regional",
    category: "Regional",
    region: "North Dakota, USA",
  },
  {
    id: "whiterock-conservancy",
    name: "White Rock Conservancy",
    lat: 41.57,
    lng: -93.75,
    designation: "Regional",
    category: "Regional",
    region: "Iowa, USA",
  },
];

export const darkSkyPlaces: DarkSkyPlace[] = [
  ...(generated.places as DarkSkyPlace[]).map((place) => ({ ...place, ...overrides[place.id] })),
  ...regionalAdditions,
];
