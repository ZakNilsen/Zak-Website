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
  "#ffffff",
  "#dff6ff",
  "#8fd8ff",
  "#6bb7ff",
  "#b8a0ff",
  "#e5a6ff",
  "#ffb3d9",
  "#ff8fa3",
  "#ffd6a3",
  "#fff1b8",
];

const METEOR_COUNT = 69;
const LIFESPAN = 5500;

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
       * Most meteors begin above or around the upper half of
       * the viewport.
       *
       * Allowing some to begin off-screen makes the shower feel
       * continuous rather than like they are spawning visibly.
       */
      const startX = -15 + Math.random() * 130;
      const startY = -25 + Math.random() * 75;

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
          length = 180 + Math.random() * 220;
          duration = 4000 + Math.random() * 1000;
          size = 2.5 + Math.random() * 2;
          brightness = 1;

          break;

        case "bright":
          /*
           * Noticeably brighter than the normal meteors,
           * but not quite as dramatic as the hero meteors.
           */
          length = 120 + Math.random() * 180;
          duration = 3500 + Math.random() * 900;
          size = 1.5 + Math.random() * 1.5;
          brightness = 0.85 + Math.random() * 0.15;

          break;

        default:
          /*
           * Most of the sky consists of these smaller,
           * more subtle meteors.
           */
          length = 80 + Math.random() * 160;
          duration = 3000 + Math.random() * 1300;
          size = 1 + Math.random() * 1.5;
          brightness = 0.6 + Math.random() * 0.3;
      }

      /*
       * Spread meteors throughout the shower rather than
       * having everything happen simultaneously.
       */
      const delay = Math.random() * 3200;

      /*
       * Pick a color independently for every meteor.
       */
      const color =
        METEOR_COLORS[
          Math.floor(Math.random() * METEOR_COLORS.length)
        ];

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
