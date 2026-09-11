"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { darkSkyPlaces, type DarkSkyPlace } from "./darkSkyPlaces";
import styles from "./dark-sky-finder.module.css";

// Leaflet touches `window` on import, so the map must never render on the server.
const DarkSkyMap = dynamic(() => import("./darkSkyMap"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading the night sky&hellip;</div>,
});

type LatLng = { lat: number; lng: number };

type HourlyCloud = { time: string; cloudCoverPct: number };

// Haversine distance in miles.
function distanceMiles(a: LatLng, b: LatLng): number {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function fetchTonightsCloudCover(point: LatLng): Promise<HourlyCloud[]> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", point.lat.toFixed(4));
  url.searchParams.set("longitude", point.lng.toFixed(4));
  url.searchParams.set("hourly", "cloudcover");
  url.searchParams.set("forecast_days", "2");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Forecast request failed");
  const data = await res.json();

  const times: string[] = data.hourly.time;
  const clouds: number[] = data.hourly.cloudcover;

  // Keep tonight's evening/overnight window: 8pm today through 4am tomorrow.
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setHours(20, 0, 0, 0);
  const windowEnd = new Date(windowStart);
  windowEnd.setHours(windowEnd.getHours() + 8);

  return times
    .map((t, i) => ({ time: t, cloudCoverPct: clouds[i] }))
    .filter(({ time }) => {
      const d = new Date(time);
      return d >= windowStart && d <= windowEnd;
    });
}

function skyVerdict(avgCloud: number | null): { label: string; className: string } {
  if (avgCloud === null) return { label: "—", className: styles.verdictUnknown };
  if (avgCloud < 25) return { label: "Clear — go look up", className: styles.verdictGood };
  if (avgCloud < 60) return { label: "Partly cloudy — worth a shot", className: styles.verdictOk };
  return { label: "Cloudy — try another night", className: styles.verdictBad };
}

export default function DarkSkyFinder() {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [selected, setSelected] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [forecast, setForecast] = useState<HourlyCloud[] | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  const activePoint = selected ?? userLocation;

  const handleLocateMe = () => {
    if (!("geolocation" in navigator)) {
      setLocateError("Geolocation isn't available in this browser.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(point);
        setSelected(null);
        setLocating(false);
      },
      () => {
        setLocateError("Couldn't get your location — try selecting a spot on the map instead.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelected({ lat, lng });
  };

  const handleMapClickAction = (lat: number, lng: number) => {
    handleMapClick(lat, lng);
  };

  useEffect(() => {
    if (!activePoint) return;
    let cancelled = false;
    setForecastLoading(true);
    fetchTonightsCloudCover(activePoint)
      .then((hours) => {
        if (!cancelled) setForecast(hours);
      })
      .catch(() => {
        if (!cancelled) setForecast(null);
      })
      .finally(() => {
        if (!cancelled) setForecastLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activePoint]);

  const avgCloud = useMemo(() => {
    if (!forecast || forecast.length === 0) return null;
    const sum = forecast.reduce((acc, h) => acc + h.cloudCoverPct, 0);
    return Math.round(sum / forecast.length);
  }, [forecast]);

  const verdict = skyVerdict(avgCloud);

  const nearestPlaces = useMemo(() => {
    if (!activePoint) return [] as (DarkSkyPlace & { miles: number })[];
    return darkSkyPlaces
      .map((p) => ({ ...p, miles: distanceMiles(activePoint, p) }))
      .sort((a, b) => a.miles - b.miles)
      .slice(0, 5);
  }, [activePoint]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <p>
          The overlay is NASA&rsquo;s VIIRS night-lights satellite imagery &mdash; brighter
          patches mean more artificial light washing out the sky. Share your location or click
          anywhere on the map to check tonight&rsquo;s odds and find the nearest certified dark
          sky sites.
        </p>
        <div className={styles.controls}>
          <button className={styles.locateButton} onClick={handleLocateMe} disabled={locating}>
            {locating ? "Locating\u2026" : "Use my location"}
          </button>
          {locateError && <span className={styles.error}>{locateError}</span>}
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.mapPane}>
          <DarkSkyMap userLocation={userLocation} selected={selected} onMapClickAction={handleMapClickAction} />
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>Tonight&rsquo;s sky</h3>
            {!activePoint && <p className={styles.muted}>Pick a location to check the forecast.</p>}
            {activePoint && forecastLoading && <p className={styles.muted}>Checking the clouds&hellip;</p>}
            {activePoint && !forecastLoading && (
              <p className={verdict.className}>{verdict.label}</p>
            )}
            {activePoint && !forecastLoading && avgCloud !== null && (
              <p className={styles.muted}>~{avgCloud}% average cloud cover, 8pm&ndash;4am</p>
            )}
          </section>

          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>Nearest dark sky sites</h3>
            {!activePoint && <p className={styles.muted}>Pick a location to see nearby spots.</p>}
            <ul className={styles.placeList}>
              {nearestPlaces.map((p) => (
                <li key={p.id} className={styles.placeItem}>
                  <span className={styles.placeName}>{p.name}</span>
                  <span className={styles.placeMeta}>
                    {p.designation} &middot; {Math.round(p.miles)} mi
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
