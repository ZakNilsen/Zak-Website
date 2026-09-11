// A small curated set of internationally-recognized Dark Sky Places
// (DarkSky International certifications: Parks, Reserves, Sanctuaries).
// This list is intentionally short to keep the map readable — expand it
// with more entries (and coords you've verified) whenever you like.
//
// NOTE: verify/refresh coordinates and certification status periodically —
// DarkSky International adds new sites over time. See:
// https://darksky.org/what-we-do/international-dark-sky-places/

export type DarkSkyPlace = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  designation: "Park" | "Reserve" | "Sanctuary" | "Community";
  region: string;
};

export const darkSkyPlaces: DarkSkyPlace[] = [
  { id: "cherry-springs", name: "Cherry Springs State Park", lat: 41.6631, lng: -77.8256, designation: "Park", region: "Pennsylvania, USA" },
  { id: "death-valley", name: "Death Valley National Park", lat: 36.5054, lng: -117.0794, designation: "Park", region: "California, USA" },
  { id: "big-bend", name: "Big Bend National Park", lat: 29.1275, lng: -103.2425, designation: "Park", region: "Texas, USA" },
  { id: "great-basin", name: "Great Basin National Park", lat: 39.0058, lng: -114.2161, designation: "Park", region: "Nevada, USA" },
  { id: "natural-bridges", name: "Natural Bridges National Monument", lat: 37.6069, lng: -110.0161, designation: "Park", region: "Utah, USA" },
  { id: "headlands", name: "Headlands International Dark Sky Park", lat: 45.7794, lng: -84.7844, designation: "Park", region: "Michigan, USA" },
  { id: "central-idaho", name: "Central Idaho Dark Sky Reserve", lat: 43.9, lng: -114.9, designation: "Reserve", region: "Idaho, USA" },
  { id: "westhavelland", name: "Westhavelland Nature Park", lat: 52.7167, lng: 12.45, designation: "Reserve", region: "Germany" },
  { id: "exmoor", name: "Exmoor National Park", lat: 51.1333, lng: -3.65, designation: "Reserve", region: "England, UK" },
  { id: "aoraki", name: "Aoraki Mackenzie", lat: -43.9333, lng: 170.1, designation: "Reserve", region: "New Zealand" },
  { id: "niue", name: "Niue", lat: -19.0544, lng: -169.8672, designation: "Sanctuary", region: "Niue" },
  { id: "kerry", name: "Kerry Dark Sky Reserve", lat: 51.85, lng: -10.15, designation: "Reserve", region: "Ireland" },
];
