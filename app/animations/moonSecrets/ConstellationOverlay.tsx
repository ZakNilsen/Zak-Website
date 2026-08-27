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

  // Little Dipper
  {
    points: [
      [4, 9],
      [12, 5],
      [20, 10],
      [27, 4],
      [32, 13],
      [24, 21],
      [15, 19],
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

  // Scorpius
  {
    points: [
      [2, 4],
      [7, 9],
      [12, 13],
      [17, 16],
      [21, 19],
      [24, 24],
      [20, 29],
      [14, 28],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
    ],
  },

  // Leo
  {
    points: [
      [4, 9],
      [7, 4],
      [13, 3],
      [17, 7],
      [15, 13],
      [9, 14],
      [24, 15],
      [32, 11],
      [29, 21],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [4, 6],
      [6, 7],
      [7, 8],
      [8, 6],
    ],
  },

  // Lyra
  {
    points: [
      [14, 2],
      [9, 9],
      [12, 17],
      [19, 16],
      [21, 8],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
    ],
  },

  // Pegasus Square
  {
    points: [
      [8, 4],
      [30, 4],
      [30, 26],
      [8, 26],
      [2, 15],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [3, 4],
    ],
  },

  // Gemini — two parallel "twin" figures joined at the shoulder
  {
    points: [
      [8, 2],
      [8, 14],
      [8, 26],
      [26, 3],
      [26, 15],
      [26, 27],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [3, 4],
      [4, 5],
      [1, 4],
    ],
  },

  // Draco — a long winding tail
  {
    points: [
      [2, 30],
      [6, 22],
      [4, 14],
      [10, 10],
      [18, 6],
      [26, 9],
      [32, 15],
      [30, 24],
      [22, 20],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
    ],
  },

  // Aquila — a bird with outstretched wings
  {
    points: [
      [20, 3],
      [20, 15],
      [8, 20],
      [32, 20],
      [20, 29],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ],
  },

  // Corona Borealis — a gentle arc
  {
    points: [
      [4, 20],
      [8, 10],
      [14, 4],
      [21, 4],
      [27, 10],
      [31, 20],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  },

  // Auriga — a five-sided pentagon
  {
    points: [
      [18, 2],
      [30, 10],
      [26, 24],
      [10, 24],
      [6, 10],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
    ],
  },

  // Delphinus — a tiny diamond with a trailing point
  {
    points: [
      [14, 4],
      [20, 8],
      [16, 14],
      [10, 12],
      [8, 22],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [3, 4],
    ],
  },

  // Bootes / Kite — a kite shape with a bright center star
  {
    points: [
      [18, 2],
      [28, 12],
      [18, 16],
      [8, 12],
      [18, 30],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [2, 4],
    ],
  },

  // Taurus — a V-shaped face with two horn tips
  {
    points: [
      [16, 18],
      [6, 4],
      [26, 2],
      [10, 10],
      [20, 8],
    ],
    edges: [
      [1, 3],
      [3, 0],
      [0, 4],
      [4, 2],
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
