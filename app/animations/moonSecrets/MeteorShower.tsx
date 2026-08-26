"use client";

import React, { useMemo } from "react";
import styles from "./moon-secrets.module.css";

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

const METEOR_COUNT = 55;
const LIFESPAN = 5200;

export default function MeteorShower() {
  const meteors = useMemo<Meteor[]>(() => {
    return Array.from({ length: METEOR_COUNT }, (_, i) => {
      /*
       * Most meteors originate above or around the upper half
       * of the screen, creating a sky-falling effect.
       */
      const startX = -10 + Math.random() * 120;
      const startY = -20 + Math.random() * 65;

      /*
       * Mostly diagonal, but with enough variation that the
       * shower doesn't look mechanically generated.
       */
      const angle = 18 + Math.random() * 28;

      return {
        id: i,
        startX,
        startY,
        angle,

        /*
         * Long trails are important for the cinematic look.
         */
        length: 80 + Math.random() * 180,

        /*
         * Some meteors are fast, some linger.
         */
        duration: 700 + Math.random() * 1300,

        /*
         * Spread the shower across the entire animation.
         */
        delay: Math.random() * 3000,

        /*
         * A few large "hero" meteors mixed in with smaller ones.
         */
        size:
          Math.random() < 0.12
            ? 3 + Math.random() * 2
            : 1 + Math.random() * 1.5,

        color:
          METEOR_COLORS[
            Math.floor(Math.random() * METEOR_COLORS.length)
          ],

        brightness: 0.65 + Math.random() * 0.35,
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
          className={styles.meteor}
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
