"use client";

import { useMemo } from "react";
import styles from "./dark-sky-finder.module.css";

// Deterministic PRNG so the server and client render identical stars — random
// positions without a hydration mismatch.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAR_COLORS = ["#ffffff", "#ffffff", "#ffffff", "#e8e4ff", "#ffd76a", "#c46bff", "#aef0ff"];

type TwinkleStar = {
  id: number;
  left: number;
  top: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
};

export default function Starfield({ count = 130 }: { count?: number }) {
  const stars = useMemo<TwinkleStar[]>(() => {
    const rand = mulberry32(0x5747a2e);
    return Array.from({ length: count }, (_, id) => {
      const sideBias = rand();
      const sideBand = sideBias < 0.28 ? rand() * 18 : sideBias < 0.54 ? 82 + rand() * 18 : rand() * 100;

      return {
        id,
        left: sideBand,
        top: rand() * 100,
        size: 1 + rand() * 2.1,
        color: STAR_COLORS[Math.floor(rand() * STAR_COLORS.length)],
        delay: rand() * 8,
        duration: 2.2 + rand() * 5.5,
      };
    });
  }, [count]);

  return (
    <div className={styles.starfield} aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className={styles.twinkleStar}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: s.color,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
      <span className={`${styles.shootingStar} ${styles.shootingStarA}`} />
      <span className={`${styles.shootingStar} ${styles.shootingStarB}`} />
      <span className={`${styles.shootingStar} ${styles.shootingStarC}`} />
      <span className={`${styles.shootingStar} ${styles.shootingStarD}`} />
    </div>
  );
}
