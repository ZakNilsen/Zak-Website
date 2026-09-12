"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { darkSkyPlaces, type DarkSkyPlace } from "./darkSkyPlaces";
import { astroDarkness, moonInfo, stargazingScore } from "./astro";
import { estimateBortle, type BortleEstimate } from "./bortle";
import { upcomingEvents, EVENT_EMOJI, type AstroEvent } from "./astroEvents";
import HourlyStargazingForecast from "./hourlyStarGazingForecast";
import Starfield from "./starField";
import styles from "./dark-sky-finder.module.css";

// Leaflet touches `window` on import, so the map must never render on the server.
const DarkSkyMap = dynamic(() => import("./darkSkyMap"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading the night sky&hellip;</div>,
});

type LatLng = { lat: number; lng: number };

type TonightForecast = {
  avgCloudPct: number | null;
  avgHumidityPct: number | null;
  avgWindMph: number | null;
  avgVisibilityMiles: number | null;
  timezone: string | null; // IANA name of the location's timezone
};

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

async function fetchTonightForecast(point: LatLng): Promise<TonightForecast> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", point.lat.toFixed(4));
  url.searchParams.set("longitude", point.lng.toFixed(4));
  url.searchParams.set("hourly", "cloudcover,relative_humidity_2m,wind_speed_10m,visibility");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("forecast_days", "2");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Forecast request failed");
  const data = await res.json();

  const times: string[] = data.hourly.time;

  // Keep tonight's evening/overnight window: 8pm today through 4am tomorrow.
  const windowStart = new Date();
  windowStart.setHours(20, 0, 0, 0);
  const windowEnd = new Date(windowStart);
  windowEnd.setHours(windowEnd.getHours() + 8);

  const indices = times
    .map((t, i) => ({ d: new Date(t), i }))
    .filter(({ d }) => d >= windowStart && d <= windowEnd)
    .map(({ i }) => i);

  const avg = (values: number[] | undefined): number | null => {
    if (!values) return null;
    const picked = indices.map((i) => values[i]).filter((v) => typeof v === "number");
    if (picked.length === 0) return null;
    return picked.reduce((acc, v) => acc + v, 0) / picked.length;
  };

  const visibilityMeters = avg(data.hourly.visibility);
  return {
    avgCloudPct: avg(data.hourly.cloudcover),
    avgHumidityPct: avg(data.hourly.relative_humidity_2m),
    avgWindMph: avg(data.hourly.wind_speed_10m),
    avgVisibilityMiles: visibilityMeters === null ? null : visibilityMeters / 1609.34,
    timezone: typeof data.timezone === "string" ? data.timezone : null,
  };
}

// Format a UTC instant as a local wall-clock time at the forecast location.
function formatTime(date: Date | null, timezone: string | null): string {
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone ?? undefined,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
  }
}

// "Sep 23", plus a relative tag like "tonight" / "in 12 days".
function formatEventDate(date: Date, now: Date): string {
  const label = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
  const days = Math.round((date.getTime() - now.getTime()) / 86_400_000);
  if (days <= 0) return `${label} · tonight!`;
  if (days === 1) return `${label} · tomorrow`;
  return `${label} · in ${days} days`;
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
  const [forecast, setForecast] = useState<TonightForecast | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [bortle, setBortle] = useState<BortleEstimate | null>(null);

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
    fetchTonightForecast(activePoint)
      .then((result) => {
        if (!cancelled) setForecast(result);
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

  // Bortle estimate refreshed whenever the point moves.
  useEffect(() => {
    if (!activePoint) return;
    let cancelled = false;

    setBortle(null);
    estimateBortle(activePoint.lat, activePoint.lng).then((estimate) => {
      if (!cancelled) setBortle(estimate);
    });

    return () => {
      cancelled = true;
    };
  }, [activePoint]);

  const avgCloud = forecast?.avgCloudPct === null || forecast?.avgCloudPct === undefined
    ? null
    : Math.round(forecast.avgCloudPct);

  const verdict = skyVerdict(avgCloud);

  const moon = useMemo(() => moonInfo(new Date()), []);

  const darkness = useMemo(() => {
    if (!activePoint) return null;
    return astroDarkness(new Date(), activePoint.lat, activePoint.lng);
  }, [activePoint]);

  const score = useMemo(() => {
    if (avgCloud === null) return null;
    return stargazingScore({
      avgCloudPct: avgCloud,
      moonIlluminationPct: moon.illuminationPct,
      avgHumidityPct: forecast?.avgHumidityPct ?? null,
      avgWindMph: forecast?.avgWindMph ?? null,
    });
  }, [avgCloud, moon, forecast]);

  // Computed after mount: the page is statically prerendered at build time, so
  // anything derived from "now" (days-until, moon %) would bake stale values
  // into the HTML and mismatch on hydration.
  const [events, setEvents] = useState<AstroEvent[]>([]);
  useEffect(() => {
    setEvents(upcomingEvents(new Date()));
  }, []);

  const nearestPlaces = useMemo(() => {
    if (!activePoint) return [] as (DarkSkyPlace & { miles: number })[];
    return darkSkyPlaces
      .map((p) => ({ ...p, miles: distanceMiles(activePoint, p) }))
      .sort((a, b) => a.miles - b.miles)
      .slice(0, 5);
  }, [activePoint]);

  return (
    <div className={styles.wrapper}>
      <Starfield />
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
        <div className={styles.mapColumn}>
          <div className={styles.mapPane}>
            <DarkSkyMap userLocation={userLocation} selected={selected} onMapClickAction={handleMapClickAction} />
          </div>
          <HourlyStargazingForecast point={activePoint} />
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>Tonight&rsquo;s sky</h3>
            {!activePoint && <p className={styles.muted}>Pick a location to check the forecast.</p>}
            {activePoint && forecastLoading && <p className={styles.muted}>Checking the clouds&hellip;</p>}
            {activePoint && !forecastLoading && (
              <>
                <p className={verdict.className}>{verdict.label}</p>
                {score !== null && (
                  <p
                    className={styles.scoreStars}
                    aria-label={`Stargazing score: ${score} out of 5`}
                    title={`Stargazing score: ${score}/5`}
                  >
                    <span>{"★".repeat(score)}</span>
                    <span className={styles.scoreStarsEmpty}>{"★".repeat(5 - score)}</span>
                  </p>
                )}
                <dl className={styles.statGrid}>
                  <div className={`${styles.stat} ${styles.statWide}`}>
                    <dt className={styles.statLabel}>Sky darkness (est.)</dt>
                    <dd className={styles.statValue}>
                      {bortle ? (
                        <>
                          <span
                            className={
                              bortle.bortle <= 3
                                ? styles.bortleGood
                                : bortle.bortle <= 5
                                  ? styles.bortleMid
                                  : styles.bortleBad
                            }
                          >
                            ~{bortle.label}
                          </span>
                          <span className={styles.statSub}>{bortle.description}</span>
                        </>
                      ) : (
                        <span className={styles.statSub}>Sampling satellite imagery&hellip;</span>
                      )}
                    </dd>
                  </div>
                  <div className={styles.stat}>
                    <dt className={styles.statLabel}>Moon</dt>
                    <dd className={styles.statValue}>
                      {moon.emoji} {moon.name}
                      <span className={styles.statSub}>{moon.illuminationPct}% lit</span>
                    </dd>
                  </div>
                  <div className={styles.stat}>
                    <dt className={styles.statLabel}>True darkness</dt>
                    <dd className={styles.statValue}>
                      {darkness?.dusk && darkness?.dawn
                        ? `${formatTime(darkness.dusk, forecast?.timezone ?? null)} – ${formatTime(darkness.dawn, forecast?.timezone ?? null)}`
                        : "No full darkness"}
                      <span className={styles.statSub}>sun 18&deg; below horizon</span>
                    </dd>
                  </div>
                  <div className={styles.stat}>
                    <dt className={styles.statLabel}>Cloud cover</dt>
                    <dd className={styles.statValue}>{avgCloud === null ? "—" : `~${avgCloud}%`}</dd>
                  </div>
                  <div className={styles.stat}>
                    <dt className={styles.statLabel}>Humidity</dt>
                    <dd className={styles.statValue}>
                      {forecast?.avgHumidityPct == null ? "—" : `${Math.round(forecast.avgHumidityPct)}%`}
                    </dd>
                  </div>
                  <div className={styles.stat}>
                    <dt className={styles.statLabel}>Wind</dt>
                    <dd className={styles.statValue}>
                      {forecast?.avgWindMph == null ? "—" : `${Math.round(forecast.avgWindMph)} mph`}
                    </dd>
                  </div>
                  <div className={styles.stat}>
                    <dt className={styles.statLabel}>Visibility</dt>
                    <dd className={styles.statValue}>
                      {forecast?.avgVisibilityMiles == null
                        ? "—"
                        : `${Math.round(forecast.avgVisibilityMiles)} mi`}
                    </dd>
                  </div>
                </dl>
                <p className={styles.statFootnote}>
                  Averages for 8pm&ndash;4am at the picked spot. Sky darkness is estimated from
                  satellite night-lights imagery.
                </p>
              </>
            )}
          </section>

          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>Sky calendar</h3>
            {events.length === 0 && <p className={styles.muted}>Reading the almanac&hellip;</p>}
            <ul className={styles.eventList}>
              {events.map((e) => (
                <li key={`${e.name}-${e.date.toISOString()}`} className={styles.eventItem}>
                  <span className={styles.eventEmoji} aria-hidden="true">
                    {EVENT_EMOJI[e.kind]}
                  </span>
                  <span className={styles.eventBody}>
                    <span className={styles.eventName}>{e.name}</span>
                    <span className={styles.eventMeta}>{formatEventDate(e.date, new Date())}</span>
                    <span className={styles.eventMeta}>{e.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>Nearest dark sky sites</h3>
            {!activePoint && <p className={styles.muted}>Pick a location to see nearby spots.</p>}
            <ul className={styles.placeList}>
              {nearestPlaces.map((p) => (
                <li key={p.id} className={styles.placeItem}>
                  <span className={styles.placeName}>
                    <span
                      className={
                        p.designation === "Regional" ? styles.placeStarRegional : styles.placeStarCertified
                      }
                      aria-hidden="true"
                    >
                      ✦
                    </span>{" "}
                    {p.name}
                  </span>
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
