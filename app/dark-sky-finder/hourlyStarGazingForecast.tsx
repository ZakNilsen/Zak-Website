"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./hourly-stargazing-forecast.module.css";

type HourPoint = {
  time: string; // ISO, local to the location (Open-Meteo returns local time when timezone=auto)
  cloudCover: number; // %
  humidity: number; // %
  windSpeed: number; // km/h
  precipProb: number; // %
  isNight: boolean;
  score: number; // 0-100 composite viewing score
};

type Props = {
  point: { lat: number; lng: number } | null;
  hoursAhead?: number; // how many hours to show, default 30
};

// Weighted composite: cloud cover dominates (it's the single biggest factor
// for visual/photographic viewing), humidity matters for dew/fogging on
// optics, wind matters for scope stability and comfort, precip is a hard cap.
function computeScore(cloud: number, humidity: number, wind: number, precipProb: number): number {
  if (precipProb > 50) return Math.max(0, 15 - cloud / 10);
  const cloudScore = 100 - cloud; // 0% clouds -> 100, 100% clouds -> 0
  const humidityPenalty = humidity > 85 ? (humidity - 85) * 1.5 : 0;
  const windPenalty = wind > 25 ? (wind - 25) * 0.6 : 0;
  const raw = cloudScore - humidityPenalty - windPenalty;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function scoreLabel(score: number): { label: string; className: string } {
  if (score >= 75) return { label: "Great", className: styles.scoreGreat };
  if (score >= 45) return { label: "Okay", className: styles.scoreOkay };
  return { label: "Poor", className: styles.scorePoor };
}

function cloudIcon(cloud: number): string {
  if (cloud < 20) return "\u2726"; // sparkle - clear
  if (cloud < 60) return "\u26C5"; // partly cloudy
  return "\u2601"; // cloud
}

async function fetchHourly(point: { lat: number; lng: number }): Promise<HourPoint[]> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", point.lat.toFixed(4));
  url.searchParams.set("longitude", point.lng.toFixed(4));
  url.searchParams.set("hourly", "cloudcover,relative_humidity_2m,wind_speed_10m,precipitation_probability,is_day");
  url.searchParams.set("forecast_days", "3");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Forecast request failed");
  const data = await res.json();

  const times: string[] = data.hourly.time;
  const cloud: number[] = data.hourly.cloudcover;
  const humidity: number[] = data.hourly.relative_humidity_2m;
  const wind: number[] = data.hourly.wind_speed_10m;
  const precip: number[] = data.hourly.precipitation_probability;
  const isDay: number[] = data.hourly.is_day;

  const now = new Date();

  return times
    .map((t, i) => {
      const c = cloud[i];
      const h = humidity[i];
      const w = wind[i];
      const p = precip[i] ?? 0;
      return {
        time: t,
        cloudCover: c,
        humidity: h,
        windSpeed: w,
        precipProb: p,
        isNight: isDay[i] === 0,
        score: computeScore(c, h, w, p),
      };
    })
    .filter((h) => new Date(h.time) >= new Date(now.getTime() - 60 * 60 * 1000));
}

export default function HourlyStargazingForecast({ point, hoursAhead = 30 }: Props) {
  const [hours, setHours] = useState<HourPoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!point) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchHourly(point)
      .then((h) => {
        if (!cancelled) setHours(h.slice(0, hoursAhead));
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the hourly forecast.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [point?.lat, point?.lng, hoursAhead]);

  const bestWindow = useMemo(() => {
    if (!hours) return null;
    const nightHours = hours.filter((h) => h.isNight);
    if (nightHours.length === 0) return null;
    const best = nightHours.reduce((a, b) => (b.score > a.score ? b : a));
    // find the contiguous stretch of good hours (score >= 60) around the peak
    const idx = hours.indexOf(best);
    let start = idx;
    let end = idx;
    while (start > 0 && hours[start - 1].isNight && hours[start - 1].score >= 60) start--;
    while (end < hours.length - 1 && hours[end + 1].isNight && hours[end + 1].score >= 60) end++;
    return { best, start: hours[start], end: hours[end] };
  }, [hours]);

  const formatHour = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "numeric" });

  const bestWindowLabel = bestWindow
    ? bestWindow.start.time === bestWindow.end.time
      ? formatHour(bestWindow.start.time)
      : `${formatHour(bestWindow.start.time)}–${formatHour(bestWindow.end.time)}`
    : null;

  if (!point) {
    return (
      <div className={styles.panel}>
        <h3 className={styles.title}>Hourly viewing forecast</h3>
        <p className={styles.muted}>Pick a spot on the map to see the hour-by-hour outlook.</p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Hourly viewing forecast</h3>

      {loading && <p className={styles.muted}>Checking the sky\u2026</p>}
      {error && <p className={styles.muted}>{error}</p>}

      {bestWindow && bestWindowLabel && (
        <p className={styles.bestWindow}>
          Best viewing window: <strong>{bestWindowLabel}</strong> ({bestWindow.best.cloudCover}% cloud cover)
        </p>
      )}

      {hours && (
        <div className={styles.strip}>
          {hours.map((h) => {
            const { label, className } = scoreLabel(h.score);
            return (
              <div
                key={h.time}
                className={`${styles.hourCard} ${h.isNight ? styles.night : styles.day}`}
                title={`${h.cloudCover}% cloud, ${h.humidity}% humidity, ${h.windSpeed} km/h wind`}
              >
                <span className={styles.hourLabel}>{formatHour(h.time)}</span>
                <span className={styles.icon}>{cloudIcon(h.cloudCover)}</span>
                <span className={styles.cloudPct}>{h.cloudCover}%</span>
                <span className={`${styles.scoreTag} ${className}`}>{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
