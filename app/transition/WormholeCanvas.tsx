"use client";

import React, { useEffect, useRef } from "react";

/**
 * WormholeCanvas
 * The visual counterpart to HyperspaceCanvas: instead of streaks bursting
 * outward, particles spiral inward with accelerating pull (stronger as
 * they near center — a cheap approximation of gravitational collapse),
 * capped off by a bright flash as everything collapses to a point, which
 * doubles as the cue that we've "come out the other side."
 */

type Particle = {
  angle: number;
  distance: number;
  size: number;
  spinRate: number; // base spiral speed, varies per particle for a less mechanical look
};

export default function WormholeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const PARTICLE_COUNT = 260;
    const DURATION = 2400;
    const BURST_WINDOW = 0.15; // fade-in window, mirrors HyperspaceCanvas's convention

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

    const maxDist = () => Math.hypot(width, height) / 2 + 60;

    const initialize = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        angle: Math.random() * Math.PI * 2,
        distance: maxDist() * (0.25 + Math.random() * 0.75),
        size: 1 + Math.random() * 1.8,
        spinRate: 0.4 + Math.random() * 0.6,
      }));
    };

    const animate = () => {
      const now = performance.now();
      const progress = Math.min((now - startTime) / DURATION, 1);
      const cx = width / 2;
      const cy = height / 2;

      // Envelope fade, same shape/convention as HyperspaceCanvas.
      let opacity = 1;
      if (progress < BURST_WINDOW) {
        opacity = progress / BURST_WINDOW;
      } else if (progress > 0.85) {
        opacity = (1 - progress) / 0.15;
      }
      ctx.globalAlpha = opacity;

      // Trailing fade rather than a hard clear — reads as motion blur on
      // the spiral instead of flicker.
      ctx.fillStyle = "rgba(4,3,10,0.3)";
      ctx.fillRect(0, 0, width, height);

      for (const p of particles) {
        // Pull strengthens sharply as a particle nears the center — this
        // is what sells "accelerating collapse" rather than a uniform
        // inward drift.
        const pull = 4500 / (p.distance + 60);
        p.distance -= pull * 0.016 * (0.5 + progress * 1.5);
        p.angle += (p.spinRate * (1 + 300 / (p.distance + 50))) * 0.02;

        if (p.distance < 3) {
          // Respawn on the outer ring only during the first half — after
          // that, letting particles actually run out sells the "everything
          // has been consumed" moment right before the flash.
          if (progress < 0.5) {
            p.distance = maxDist();
            p.angle = Math.random() * Math.PI * 2;
          } else {
            continue;
          }
        }

        const x = cx + Math.cos(p.angle) * p.distance;
        const y = cy + Math.sin(p.angle) * p.distance;
        const alpha = Math.min(1, p.distance / 100);

        ctx.fillStyle = `rgba(200,190,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Collapse flash: a bright core that blooms right as the spiral
      // finishes emptying out, giving the transition a clear "punch"
      // moment instead of just quietly fading to black.
      const flashProgress = Math.max(0, (progress - 0.55) / 0.25);
      if (flashProgress > 0 && flashProgress <= 1) {
        const flashAlpha = Math.sin(Math.min(flashProgress, 1) * Math.PI); // ramps up then down
        const radius = 20 + flashProgress * Math.max(width, height);
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        glow.addColorStop(0, `rgba(230,220,255,${flashAlpha})`);
        glow.addColorStop(0.4, `rgba(160,140,255,${flashAlpha * 0.5})`);
        glow.addColorStop(1, "rgba(160,140,255,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.globalAlpha = 1;

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
