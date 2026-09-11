"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { darkSkyPlaces } from "./darkSkyPlaces";
import styles from "./dark-sky-finder.module.css";

// Every marker on this map is a star. divIcons with inline SVG mean no image
// assets to fight the bundler over (Leaflet's default pin icons don't survive
// a Next.js bundle anyway).
function starIcon(fill: string, glow: string, size: number, className?: string) {
  // A four-point light glint (concave curves) with a white-hot core — reads as
  // an actual point of starlight rather than a cartoon star shape.
  return L.divIcon({
    className: `${styles.starIcon}${className ? ` ${className}` : ""}`,
    html: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="filter: drop-shadow(0 0 ${Math.round(size / 4)}px ${glow})" aria-hidden="true"><path fill="${fill}" d="M12 0C12.9 9.1 14.9 11.1 24 12 14.9 12.9 12.9 14.9 12 24 11.1 14.9 9.1 12.9 0 12 9.1 11.1 11.1 9.1 12 0Z"/><circle cx="12" cy="12" r="1.8" fill="#fff"/></svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const certifiedIcon = starIcon("#ffd76a", "rgba(255, 215, 106, 0.9)", 18);
const regionalIcon = starIcon("#c46bff", "rgba(196, 107, 255, 0.9)", 16);
const selectedIcon = starIcon("#aef0ff", "rgba(94, 200, 255, 1)", 28, styles.selectedStar);

// Clusters render as glowing nebula orbs with a count.
function createClusterIcon(cluster: { getChildCount(): number }) {
  return L.divIcon({
    className: styles.clusterIcon,
    html: `<span>${cluster.getChildCount()}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

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
  const [mounted, setMounted] = useState(false);
  const center = userLocation ?? { lat: 39.8, lng: -98.6 }; // continental-US-ish default

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={styles.map} aria-label="Loading map" />;
  }

  return (
    <MapContainer
      key={`${center.lat}-${center.lng}-${userLocation ? "loc" : "default"}`}
      center={[center.lat, center.lng]}
      zoom={userLocation ? 6 : 4}
      minZoom={2}
      maxZoom={8}
      scrollWheelZoom
      worldCopyJump={false}
      maxBounds={[
        [-90, -180],
        [90, 180],
      ]}
      maxBoundsViscosity={1.0}
      className={styles.map}
    >
      {/* Base map — standard OSM tiles inverted to night colors with a CSS
          filter (see .darkBase). Keyless dark tile providers all watermark or
          rate-limit now, and OSM itself is reliable. */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className={styles.darkBase}
        noWrap
      />

      {/* NASA GIBS VIIRS Day/Night Band — the actual "light pollution" layer.
          The tiles are mostly black with bright city lights, so screen-blending
          them over the dark base makes the lights glow instead of graying the
          map out. */}
      <TileLayer
        url={`/api/gibs/{z}/{x}/{y}?date=${gibsDate.current}`}
        attribution='Imagery: <a href="https://wiki.earthdata.nasa.gov/display/GIBS">NASA EOSDIS GIBS</a>'
        className={styles.gibsLayer}
        opacity={0.8}
        maxNativeZoom={8}
        noWrap
        crossOrigin="anonymous"
      />

      <ClickHandler onMapClickAction={onMapClickAction} />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={youAreHereIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {selected && (
        <Marker position={[selected.lat, selected.lng]} icon={selectedIcon}>
          <Popup>Selected spot</Popup>
        </Marker>
      )}

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={120}
        disableClusteringAtZoom={4}
        iconCreateFunction={createClusterIcon}
      >
        {darkSkyPlaces.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={place.designation === "Regional" ? regionalIcon : certifiedIcon}
          >
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.designation} &middot; {place.region}
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
