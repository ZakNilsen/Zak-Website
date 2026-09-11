"use client";

import { useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { darkSkyPlaces } from "./darkSkyPlaces";
import styles from "./dark-sky-finder.module.css";

// Leaflet's default marker icons reference image paths that don't survive
// a Next.js/webpack bundle. Point them at a CDN instead of fighting the bundler.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const youAreHereIcon = L.divIcon({
  className: styles.youAreHereIcon,
  html: `<span class="${styles.youAreHerePulse}"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Yesterday's date (UTC), formatted YYYY-MM-DD. GIBS' daily layer typically
// lags by ~a day, so "yesterday" is the most reliable date to request.
function latestAvailableGibsDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

type Props = {
  userLocation: { lat: number; lng: number } | null;
  selected: { lat: number; lng: number } | null;
  onMapClickAction: (lat: number, lng: number) => void;
};

function ClickHandler({ onMapClickAction }: { onMapClickAction: Props["onMapClickAction"] }) {
  useMapEvents({
    click(e) {
      onMapClickAction(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function DarkSkyMap({ userLocation, selected, onMapClickAction }: Props) {
  const gibsDate = useRef(latestAvailableGibsDate());
  const center = userLocation ?? { lat: 39.8, lng: -98.6 }; // continental-US-ish default

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={userLocation ? 6 : 4}
      scrollWheelZoom
      className={styles.map}
    >
      {/* Base map */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* NASA GIBS VIIRS Day/Night Band — the actual "light pollution" layer.
          Night lights show up bright against a dark background, so a light
          blend/opacity mode reads well over the base map. */}
      <TileLayer
        url={`/api/gibs/{z}/{x}/{y}?date=${gibsDate.current}`}
        attribution='Imagery: <a href="https://wiki.earthdata.nasa.gov/display/GIBS">NASA EOSDIS GIBS</a>'
        opacity={0.65}
        maxNativeZoom={8}
        crossOrigin="anonymous"
      />

      <ClickHandler onMapClickAction={onMapClickAction} />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={youAreHereIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {selected && (
        <Marker position={[selected.lat, selected.lng]}>
          <Popup>Selected spot</Popup>
        </Marker>
      )}

      {darkSkyPlaces.map((place) => (
        <Marker key={place.id} position={[place.lat, place.lng]}>
          <Popup>
            <strong>{place.name}</strong>
            <br />
            {place.designation} &middot; {place.region}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
