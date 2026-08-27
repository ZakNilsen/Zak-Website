"use client";

import React, { useMemo } from "react";
import styles from "./moon-secrets.module.css";

type Pattern = {
  points: [number, number][];
  edges: [number, number][];
};

const PATTERNS: Pattern[] = [
  // Dipper
  {
    points: [
      [2, 18],
      [10, 12],
      [19, 17],
      [28, 8],
      [33, 20],
      [24, 30],
      [13, 27],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 2],
    ],
  },

  // Orion-ish
  {
    points: [
      [5, 5],
      [25, 3],
      [8, 16],
      [15, 17],
      [22, 18],
      [6, 30],
      [24, 29],
    ],
    edges: [
      [0, 3],
      [1, 4],
      [3, 5],
      [4, 6],
      [3, 4],
      [2, 3],
    ],
  },

  // Cassiopeia
  {
    points: [
      [2, 20],
      [10, 5],
      [18, 20],
      [26, 5],
      [34, 20],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },

  // Triangle
  {
    points: [
      [5, 5],
      [25, 5],
      [15, 22],
      [15, 32],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 0],
      [2, 3],
    ],
  },

  // Cross
  {
    points: [
      [15, 2],
      [15, 28],
      [2, 15],
      [28, 15],
      [15, 15],
    ],
    edges: [
      [0, 4],
      [4, 1],
      [2, 4],
      [4, 3],
    ],
  },
];

const LIFESPAN = 2400;

export default function ConstellationOverlay({
  animate = true,
}: {
  animate?: boolean;
}) {
  const { pattern, leftPct, topPct, rotation, scale } = useMemo(() => {
    const positionRoll = Math.random();

    let leftPct: number;

    if (positionRoll < 0.45) {
      // 45% — left side
      leftPct = 2 + Math.random() * 22;
    } else if (positionRoll < 0.9) {
      // 45% — right side
      leftPct = 63 + Math.random() * 22;
    } else {
      // 10% — occasionally allow one through the middle
      leftPct = 30 + Math.random() * 30;
    }

    return {
      pattern: PATTERNS[Math.floor(Math.random() * PATTERNS.length)],
      leftPct,
      topPct: 5 + Math.random() * 55,
      rotation: -12 + Math.random() * 24,
      scale: 0.8 + Math.random() * 0.5,
    };
  }, []);

  return (
    <div
      className={styles.constellationWrap}
      style={
        {
          left: `${leftPct}%`,
          top: `${topPct}%`,
          "--rotation": `${rotation}deg`,
          "--scale": scale,
          "--duration": `${LIFESPAN}ms`,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <svg
        className={`${styles.constellationSvg} ${
          !animate ? styles.constellationStatic : ""
        }`}
        viewBox="0 0 40 35"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Glow behind the constellation */}
        <g className={styles.constellationGlow}>
          {pattern.edges.map(([a, b], i) => {
            const [x1, y1] = pattern.points[a];
            const [x2, y2] = pattern.points[b];

            return (
              <line
                key={`glow-line-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              />
            );
          })}
        </g>

        {/* Actual connecting lines */}
        <g className={styles.constellationLines}>
          {pattern.edges.map(([a, b], i) => {
            const [x1, y1] = pattern.points[a];
            const [x2, y2] = pattern.points[b];

            return (
              <line
                key={`line-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                pathLength="1"
                style={{
                  animationDelay: `${350 + i * 100}ms`,
                }}
              />
            );
          })}
        </g>

        {/* Stars */}
        <g className={styles.constellationStars}>
          {pattern.points.map(([x, y], i) => (
            <g
              key={`star-${i}`}
              style={{
                animationDelay: `${i * 100}ms`,
              }}
            >
              <circle
                cx={x}
                cy={y}
                r="1.15"
                className={styles.constellationStarGlow}
              />

              <circle
                cx={x}
                cy={y}
                r="0.45"
                className={styles.constellationStar}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export { LIFESPAN as CONSTELLATION_LIFESPAN };
