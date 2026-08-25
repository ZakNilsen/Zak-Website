"use client";

import React, { useEffect, useRef } from "react";

/**
 * AuroraCurtainCanvas
 * Several wavy, translucent ribbon bands sweep horizontally across the
 * screen, staggered so they don't all move in lockstep — like curtains of
 * aurora light rippling past. Colors echo the actual aurora used elsewhere
 * on the site. Additive blending (`lighter`) lets overlapping ribbons glow
 * where they cross, the way real aurora light does.
 */

type Ribbon = {
  color: [number, number, number]; // RGB, alpha applied separately per-fill
  width: number;
  waveAmplitude: number;
  waveFreq: number; // spatial frequency along the ribbon's height
  waveSpeed: number; // how fast the wave itself ripples over time
  phase: number;
  startDelayFrac: number; // 0-1, fraction of the duration before this ribbon starts sweeping
  direction: 1 | -1; // 1 = left to right, -1 = right to left
};

const RIBBON_COUNT = 5;
const DURATION = 2000;

// Aurora palette — soft teal/green, blue, violet, a touch of pink. Matches
// the palette already used for FireflyDustCursor on the about page.
const AURORA_COLORS: [number, number, number][] = [
  [120, 255, 190], // teal-green
  [120, 210, 255], // blue
  [180, 140, 255], // violet
  [255, 170, 210], // soft pink accent
];

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function AuroraCurtainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let ribbons: Ribbon[] = [];
    let startTime = performance.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initialize = () => {
      ribbons = Array.from({ length: RIBBON_COUNT }, (_, i) => ({
        color: AURORA_COLORS[i % AURORA_COLORS.length],
        width: 140 + Math.random() * 120,
        waveAmplitude: 40 + Math.random() * 60,
        waveFreq: 0.005 + Math.random() * 0.006,
        waveSpeed: 0.0015 + Math.random() * 0.0025,
        phase: Math.random() * Math.PI * 2,
        startDelayFrac: (i / RIBBON_COUNT) * 0.35 + Math.random() * 0.08,
        direction: i % 2 === 0 ? 1 : -1,
      }));
    };

    const animate = () => {
      const now = performance.now();
      const progress = Math.min((now - startTime) / DURATION, 1);

      ctx.clearRect(0, 0, width, height);

      // Overall envelope fade, same convention as the other special transitions.
      let opacity = 1;
      if (progress < 0.12) opacity = progress / 0.12;
      else if (progress > 0.85) opacity = (1 - progress) / 0.15;

      // Faint dark wash first so the ribbons read with contrast regardless
      // of what color the underlying page happens to be mid-fade.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(5,8,20,${0.3 * opacity})`;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";

      for (const ribbon of ribbons) {
        const localT = Math.min(
          1,
          Math.max(0, (progress - ribbon.startDelayFrac) / (1 - ribbon.startDelayFrac))
        );
        if (localT <= 0) continue;

        const eased = easeInOutCubic(localT);
        const travel = width + ribbon.width * 2;
        const startX = ribbon.direction === 1 ? -ribbon.width : width + ribbon.width;
        const baseX = startX + (ribbon.direction === 1 ? travel : -travel) * eased;

        const path = new Path2D();
        const step = 12;

        for (let y = 0; y <= height; y += step) {
          const wave = Math.sin(y * ribbon.waveFreq + ribbon.phase + now * ribbon.waveSpeed) * ribbon.waveAmplitude;
          const x = baseX + wave - ribbon.width / 2;
          if (y === 0) path.moveTo(x, y);
          else path.lineTo(x, y);
        }
        for (let y = height; y >= 0; y -= step) {
          const wave = Math.sin(y * ribbon.waveFreq + ribbon.phase + now * ribbon.waveSpeed) * ribbon.waveAmplitude;
          const x = baseX + wave + ribbon.width / 2;
          path.lineTo(x, y);
        }
        path.closePath();

        const [r, g, b] = ribbon.color;
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, `rgba(${r},${g},${b},${0.05 * opacity})`);
        gradient.addColorStop(0.5, `rgba(${r},${g},${b},${0.45 * opacity})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},${0.1 * opacity})`);

        ctx.fillStyle = gradient;
        ctx.fill(path);
      }

      ctx.globalCompositeOperation = "source-over";

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    resize();
    initialize();
    window.addEventListener("resize", resize);
    startTime = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
