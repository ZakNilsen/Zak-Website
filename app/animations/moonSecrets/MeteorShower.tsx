"use client";

import React, { useMemo } from "react";
import styles from "./moon-secrets.module.css";

type MeteorTier = "normal" | "bright" | "hero";

type Meteor = {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  length: number;
  duration: number;
  delay: number;
  size: number;
  color: string;
  brightness: number;
  tier: MeteorTier;
};

const METEOR_COLORS = [
  "#ffffff", // white
  "#e0fbff", // ice
  "#7ce8ff", // cyan
  "#38bdf8", // sky blue
  "#60a5fa", // blue
  "#818cf8", // indigo
  "#a78bfa", // violet
  "#c084fc", // purple
  "#d946ef", // magenta
  "#e879f9", // fuchsia
  "#f472b6", // pink
  "#fb7185", // rose
  "#f87171", // coral red
  "#fb923c", // orange
  "#fbbf24", // amber
  "#facc15", // gold
  "#fef08a", // pale yellow
  "#a3e635", // lime
  "#4ade80", // green
  "#2dd4bf", // teal
  "#22d3ee", // turquoise
];

/*
 * Nudges a hex color's hue, saturation, and lightness by small
 * random amounts so every meteor gets its own subtle variation
 * instead of picking from a fixed, repeating set of swatches.
 */
function jitterColor(hex: string): string {
  const { h, s, l } = hexToHsl(hex);

  const hueShift = (Math.random() - 0.5) * 18; // +/- 9 degrees
  const satShift = (Math.random() - 0.5) * 24; // +/- 12%
  const lightShift = (Math.random() - 0.5) * 16; // +/- 8%

  const newH = (h + hueShift + 360) % 360;
  const newS = clamp(s + satShift, 35, 100);
  const newL = clamp(l + lightShift, 55, 92);

  return hslToHex(newH, newS, newL);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }

    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const toHex = (v: number) => {
    const hex = Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const METEOR_COUNT = 69;
const LIFESPAN = 7500;

export default function MeteorShower() {
  const meteors = useMemo<Meteor[]>(() => {
    return Array.from({ length: METEOR_COUNT }, (_, i) => {
      /*
       * Determine the type of meteor.
       *
       * 70% normal
       * 20% bright
       * 10% hero
       *
       * The hero meteors are intentionally uncommon so they
       * actually feel special when one crosses the sky.
       */
      const roll = Math.random();

      let tier: MeteorTier;

      if (roll < 0.10) {
        tier = "hero";
      } else if (roll < 0.30) {
        tier = "bright";
      } else {
        tier = "normal";
      }

      /*
       * Meteors begin above or right at the top of the
       * viewport, never deep into the middle -- otherwise they
       * read as "appearing" instead of falling from the sky.
       *
       * Allowing some to begin off-screen (left/right) makes the
       * shower feel continuous rather than like they are
       * spawning visibly.
       */
      const startX = -20 + Math.random() * 110;
      const startY = -30 + Math.random() * 50;

      /*
       * Keep the shower generally moving diagonally downward.
       *
       * The variation prevents every meteor from following the
       * exact same trajectory.
       */
      const angle = 18 + Math.random() * 28;

      /*
       * Each tier gets its own visual characteristics.
       */
      let length: number;
      let duration: number;
      let size: number;
      let brightness: number;

      switch (tier) {
        case "hero":
          /*
           * Large, slow, spectacular meteors.
           */
          length = 280 + Math.random() * 340;
          duration = 4200 + Math.random() * 1200;
          size = 2.5 + Math.random() * 2;
          brightness = 1;

          break;

        case "bright":
          /*
           * Noticeably brighter than the normal meteors,
           * but not quite as dramatic as the hero meteors.
           */
          length = 200 + Math.random() * 260;
          duration = 3600 + Math.random() * 1000;
          size = 1.5 + Math.random() * 1.5;
          brightness = 0.85 + Math.random() * 0.15;

          break;

        default:
          /*
           * Most of the sky consists of these smaller,
           * more subtle meteors.
           */
          length = 140 + Math.random() * 220;
          duration = 3100 + Math.random() * 1400;
          size = 1 + Math.random() * 1.5;
          brightness = 0.6 + Math.random() * 0.3;
      }

      /*
       * Spread meteors evenly across the *entire* shower
       * runtime rather than randomly within just the first
       * few seconds. Using the meteor's index as a base means
       * arrivals are naturally staggered no matter how many
       * meteors happen to roll similar random values -- this
       * is what avoids the "everything launches at once" burst.
       *
       * A little jitter on top keeps it from feeling
       * mechanically evenly-spaced.
       */
      const staggerWindow = LIFESPAN * 0.85;
      const baseDelay = (i / METEOR_COUNT) * staggerWindow;
      const jitter = (Math.random() - 0.5) * (staggerWindow / METEOR_COUNT) * 1.5;
      const delay = Math.max(0, baseDelay + jitter);

      /*
       * Pick a color independently for every meteor, then
       * jitter it slightly so no two meteors of the same
       * "base" color look identical.
       */
      const baseColor =
        METEOR_COLORS[
          Math.floor(Math.random() * METEOR_COLORS.length)
        ];
      const color = jitterColor(baseColor);

      return {
        id: i,
        startX,
        startY,
        angle,
        length,
        duration,
        delay,
        size,
        color,
        brightness,
        tier,
      };
    });
  }, []);

  return (
    <div
      className={styles.meteorShower}
      style={
        {
          "--meteor-lifespan": `${LIFESPAN}ms`,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          className={`${styles.meteor} ${styles[`meteor-${meteor.tier}`]}`}
          style={
            {
              "--meteor-x": `${meteor.startX}%`,
              "--meteor-y": `${meteor.startY}%`,
              "--meteor-angle": `${meteor.angle}deg`,
              "--meteor-length": `${meteor.length}px`,
              "--meteor-duration": `${meteor.duration}ms`,
              "--meteor-delay": `${meteor.delay}ms`,
              "--meteor-size": `${meteor.size}px`,
              "--meteor-color": meteor.color,
              "--meteor-brightness": meteor.brightness,
            } as React.CSSProperties
          }
        >
          <div className={styles.meteorTrail} />
          <div className={styles.meteorHead} />
        </div>
      ))}
    </div>
  );
}

export { LIFESPAN as METEOR_SHOWER_LIFESPAN };
