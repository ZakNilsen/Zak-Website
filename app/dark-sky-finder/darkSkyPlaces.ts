// Dark Sky Places, sourced from the DSAG (IUCN World Commission on Protected
// Areas, Dark Skies Advisory Group) World List of Dark Sky Places, compiled
// from the actual certifying bodies (DarkSky International, the Royal
// Astronomical Society of Canada, Fundación Starlight).
// Source: https://darkskyparks.org/dsag/DSAG_word_list.htm (last updated
// 2025-10-23 as of writing).
//
// Two coordinate corrections were made to typos in that source list:
//  - Boundary Waters Canoe Area Wilderness: source gives -99.21° longitude,
//    which falls in North Dakota. Corrected to the wilderness's actual
//    location in northeastern Minnesota (~-91.5°).
//  - Flagstaff, AZ: source gives 31.20°N, which is near the Mexico border.
//    Corrected to Flagstaff's actual coordinates (~35.2°N).
//
// This list still isn't exhaustive (the full source has 400+ entries) —
// it's a curated, geographically-spread subset. Re-check against the source
// periodically since new sites are certified every year.

export type DarkSkyPlace = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  designation: "Park" | "Reserve" | "Sanctuary" | "Community";
  region: string;
};

export const darkSkyPlaces: DarkSkyPlace[] = [
  // --- Minnesota ---
  { id: "voyageurs", name: "Voyageurs National Park", lat: 48.48, lng: -92.85, designation: "Park", region: "Minnesota, USA" },
  { id: "boundary-waters", name: "Boundary Waters Canoe Area Wilderness", lat: 47.9, lng: -91.5, designation: "Sanctuary", region: "Minnesota, USA" },
  // Just across the border — often mentioned alongside the MN sites as part of the same dark-sky region
  { id: "quetico", name: "Quetico Provincial Park", lat: 48.41, lng: -91.54, designation: "Park", region: "Ontario, Canada" },

  // --- Other US ---
  { id: "cherry-springs", name: "Cherry Springs State Park", lat: 41.65, lng: -77.82, designation: "Park", region: "Pennsylvania, USA" },
  { id: "death-valley", name: "Death Valley National Park", lat: 36.51, lng: -117.08, designation: "Park", region: "California, USA" },
  { id: "big-bend", name: "Big Bend National Park", lat: 29.22, lng: -103.24, designation: "Park", region: "Texas, USA" },
  { id: "great-basin", name: "Great Basin National Park", lat: 39.01, lng: -114.22, designation: "Park", region: "Nevada, USA" },
  { id: "natural-bridges", name: "Natural Bridges National Monument", lat: 37.60, lng: -110.01, designation: "Park", region: "Utah, USA" },
  { id: "headlands", name: "Headlands International Dark Sky Park", lat: 45.78, lng: -84.78, designation: "Park", region: "Michigan, USA" },
  { id: "central-idaho", name: "Central Idaho Dark Sky Reserve", lat: 44.03, lng: -114.81, designation: "Reserve", region: "Idaho, USA" },
  { id: "arches", name: "Arches National Park", lat: 38.68, lng: -109.57, designation: "Park", region: "Utah, USA" },
  { id: "canyonlands", name: "Canyonlands National Park", lat: 38.33, lng: -109.88, designation: "Park", region: "Utah, USA" },
  { id: "bryce-canyon", name: "Bryce Canyon National Park", lat: 37.63, lng: -112.17, designation: "Park", region: "Utah, USA" },
  { id: "capitol-reef", name: "Capitol Reef National Park", lat: 38.36, lng: -111.26, designation: "Park", region: "Utah, USA" },
  { id: "zion", name: "Zion National Park", lat: 37.30, lng: -113.00, designation: "Park", region: "Utah, USA" },
  { id: "grand-canyon", name: "Grand Canyon National Park", lat: 36.06, lng: -112.12, designation: "Park", region: "Arizona, USA" },
  { id: "joshua-tree", name: "Joshua Tree National Park", lat: 33.87, lng: -115.90, designation: "Park", region: "California, USA" },
  { id: "chaco-culture", name: "Chaco Culture National Historical Park", lat: 36.06, lng: -107.97, designation: "Park", region: "New Mexico, USA" },
  { id: "glacier", name: "Glacier National Park", lat: 48.70, lng: -113.72, designation: "Park", region: "Montana, USA" },
  { id: "great-sand-dunes", name: "Great Sand Dunes National Park and Preserve", lat: 37.73, lng: -105.51, designation: "Park", region: "Colorado, USA" },
  { id: "black-canyon", name: "Black Canyon of the Gunnison National Park", lat: 38.58, lng: -107.74, designation: "Park", region: "Colorado, USA" },
  { id: "mammoth-cave", name: "Mammoth Cave National Park", lat: 37.19, lng: -86.00, designation: "Park", region: "Kentucky, USA" },
  { id: "big-cypress", name: "Big Cypress National Preserve", lat: 25.86, lng: -81.03, designation: "Park", region: "Florida, USA" },
  { id: "cape-lookout", name: "Cape Lookout National Seashore", lat: 34.60, lng: -76.54, designation: "Park", region: "North Carolina, USA" },
  { id: "katahdin", name: "Katahdin Woods and Waters", lat: 45.85, lng: -68.75, designation: "Sanctuary", region: "Maine, USA" },
  { id: "cosmic-campground", name: "Cosmic Campground", lat: 33.48, lng: -108.92, designation: "Sanctuary", region: "New Mexico, USA" },
  { id: "rainbow-bridge", name: "Rainbow Bridge National Monument", lat: 37.08, lng: -110.96, designation: "Sanctuary", region: "Utah, USA" },
  { id: "massacre-rim", name: "Massacre Rim Wilderness Area", lat: 41.74, lng: -119.59, designation: "Sanctuary", region: "Nevada, USA" },
  { id: "flagstaff", name: "Flagstaff", lat: 35.1983, lng: -111.6513, designation: "Community", region: "Arizona, USA" },
  { id: "sedona", name: "Sedona", lat: 34.87, lng: -111.76, designation: "Community", region: "Arizona, USA" },
  { id: "antelope-island", name: "Antelope Island State Park", lat: 40.96, lng: -112.21, designation: "Park", region: "Utah, USA" },

  // --- International ---
  { id: "aoraki-mackenzie", name: "Aoraki Mackenzie", lat: -43.60, lng: 170.35, designation: "Reserve", region: "New Zealand" },
  { id: "exmoor", name: "Exmoor National Park", lat: 51.14, lng: -3.65, designation: "Reserve", region: "England, UK" },
  { id: "namibrand", name: "NamibRand Nature Reserve", lat: -25.12, lng: 15.99, designation: "Reserve", region: "Namibia" },
  { id: "westhavelland", name: "Westhavelland", lat: 52.70, lng: 12.48, designation: "Reserve", region: "Germany" },
  { id: "kerry", name: "Kerry Dark Sky Reserve", lat: 51.8969, lng: -10.0894, designation: "Reserve", region: "Ireland" },
  { id: "pic-du-midi", name: "Pic du Midi", lat: 42.94, lng: 0.14, designation: "Reserve", region: "France" },
  { id: "mont-megantic", name: "Mont-Mégantic", lat: 45.46, lng: -71.15, designation: "Reserve", region: "Québec, Canada" },
  { id: "niue", name: "Niue", lat: -19.0, lng: -169.85, designation: "Sanctuary", region: "Niue" },
];
