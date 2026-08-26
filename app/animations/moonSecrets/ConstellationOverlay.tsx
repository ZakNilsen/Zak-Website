"use client";

import React, { useMemo } from "react";
import styles from "./moon-secrets.module.css";

type Pattern = { points: [number, number][]; edges: [number, number][] };

// Loose, simplified constellation shapes. Coordinates live in a 0-40 (x)
// by 0-30 (y) space — doesn't need to be astronomically exact, just read
// as "a constellation" when connected.
const PATTERNS: Pattern[] = [
  // Dipper-like
  {
    points: [[2, 18], [10, 12], [19, 17], [28, 8], [33, 20], [24, 30], [13, 27]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 2]],
  },
  // Belt + shoulders (Orion-ish)
  {
    points: [[5, 5], [25, 3], [8, 16], [15, 17], [22, 18], [6, 30], [24, 29]],
    edges: [[0, 3], [1, 4], [3, 5], [4, 6], [3, 4], [2, 3]],
  },
  // Cassiopeia zigzag
  {
    points: [[2, 20], [10, 5], [18, 20], [26, 5], [34, 20]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  // Triangle with a tail
  {
    points: [[5, 5], [25, 5], [15, 22], [15, 32]],
    edges: [[0, 1], [1, 2], [2, 0], [2, 3]],
  },
  // Cross
  {
    points: [[15, 2], [15, 28], [2, 15], [28, 15], [15, 15]],
    edges: [[0, 4], [4, 1], [2, 4], [4, 3]],
  },
];

const LIFESPAN = 3400;

export default function ConstellationOverlay() {
  // Picked once per mount (parent remounts this via a fresh key on every
  // click, so a new random pattern/position happens naturally each time).
  const { pattern, leftPct, topPct } = useMemo(() => {
    const p = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    return {
      pattern: p,
      // Kept within the upper-left ~70% of the viewport so the fixed-size
      // box (see width/height below) doesn't run off the right/bottom
      // edge on typical screens.
      leftPct: 5 + Math.random() * 55,
      topPct: 5 + Math.random() * 40,
    };
  }, []);

  return (
    <div
      className={styles.constellationWrap}
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        "--duration": `${LIFESPAN}ms`,
      } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* viewBox aspect (40:30) matches width:height (280:200) below, so
          nothing gets stretched into ellipses/distorted lines */}
      <svg width={280} height={200} viewBox="0 0 40 30" style={{ overflow: "visible" }}>
        <g>
          {pattern.edges.map(([a, b], i) => {
            const [x1, y1] = pattern.points[a];
            const [x2, y2] = pattern.points[b];
            return (
              <line
                key={`edge-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                pathLength={100}
                className={styles.constellationLine}
                style={{ animationDelay: `${400 + pattern.points.length * 90}ms` }}
              />
            );
          })}
          {pattern.points.map(([x, y], i) => (
            <circle
              key={`star-${i}`}
              cx={x}
              cy={y}
              r={1}
              className={styles.constellationStar}
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export { LIFESPAN as CONSTELLATION_LIFESPAN };
