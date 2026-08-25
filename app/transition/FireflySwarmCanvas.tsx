"use client";

import React, { useEffect, useRef } from "react";

/**
 * FireflySwarmCanvas
 * Fireflies drift in from scattered starting points, converge toward the
 * center into a dense golden cloud that reads as briefly "swallowing" the
 * screen, then scatter back outward and fade — revealing the new page in
 * their wake. Ties into the same firefly visual language already used
 * elsewhere on the site (warm glow, gentle wandering motion).
 */

type Firefly = {
  startX: number;
  startY: number;
  exitX: number;
  exitY: number;
  wanderPhase: number;
  wanderSpeed: number;
  wanderRadius: number;
  size: number;
  twinklePhase: number;
};

const FIREFLY_COUNT = 90;
const DURATION = 2200;
const CONVERGE_END = 0.5; // fraction of duration spent converging inward

export default function FireflySwarmCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pre-render a soft glow sprite once, reused every frame for every
    // firefly — much cheaper than a per-particle radial gradient.
    const sprite = document.createElement("canvas");
    const SPRITE_SIZE = 48;
    sprite.width = SPRITE_SIZE;
    sprite.height = SPRITE_SIZE;
    const sctx = sprite.getContext("2d")!;
    const grad = sctx.createRadialGradient(
      SPRITE_SIZE / 2, SPRITE_SIZE / 2, 0,
      SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE / 2
    );
    grad.addColorStop(0, "rgba(255,235,180,1)");
    grad.addColorStop(0.4, "rgba(255,210,110,0.55)");
    grad.addColorStop(1, "rgba(255,190,60,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

    let width = 0;
    let height = 0;
    let fireflies: Firefly[] = [];
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
      const cx = width / 2;
      const cy = height / 2;

      fireflies = Array.from({ length: FIREFLY_COUNT }, () => {
        const edgeAngle = Math.random() * Math.PI * 2;
        const edgeDist = Math.hypot(width, height) / 2 + 40;
        return {
          startX: cx + Math.cos(edgeAngle) * edgeDist * Math.random(),
          startY: cy + Math.sin(edgeAngle) * edgeDist * Math.random(),
          // Exit point: a different scattered edge point, so the dispersal
          // doesn't just mirror the convergence path in reverse.
          exitX: cx + Math.cos(Math.random() * Math.PI * 2) * edgeDist,
          exitY: cy + Math.sin(Math.random() * Math.PI * 2) * edgeDist,
          wanderPhase: Math.random() * Math.PI * 2,
          wanderSpeed: 0.002 + Math.random() * 0.003,
          wanderRadius: 15 + Math.random() * 25,
          size: 8 + Math.random() * 10,
          twinklePhase: Math.random() * Math.PI * 2,
        };
      });
    };

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = () => {
      const now = performance.now();
      const progress = Math.min((now - startTime) / DURATION, 1);
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Overall envelope: fade in as they arrive, fade out as they leave.
      let opacity = 1;
      if (progress < 0.12) opacity = progress / 0.12;
      else if (progress > 0.85) opacity = (1 - progress) / 0.15;

      for (const fly of fireflies) {
        let x: number;
        let y: number;

        if (progress < CONVERGE_END) {
          const t = easeInOutCubic(progress / CONVERGE_END);
          x = fly.startX + (cx - fly.startX) * t;
          y = fly.startY + (cy - fly.startY) * t;
        } else {
          const t = easeInOutCubic((progress - CONVERGE_END) / (1 - CONVERGE_END));
          x = cx + (fly.exitX - cx) * t;
          y = cy + (fly.exitY - cy) * t;
        }

        // Gentle organic wander layered on top of the converge/disperse
        // path so the motion doesn't look mechanically straight-line.
        x += Math.cos(now * fly.wanderSpeed + fly.wanderPhase) * fly.wanderRadius;
        y += Math.sin(now * fly.wanderSpeed * 1.3 + fly.wanderPhase) * fly.wanderRadius;

        const twinkle = 0.5 + 0.5 * Math.sin(now * 0.006 + fly.twinklePhase);
        const alpha = opacity * (0.6 + twinkle * 0.4);

        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, x - fly.size / 2, y - fly.size / 2, fly.size, fly.size);
      }

      // Bloom: near peak convergence, a soft warm haze washes the whole
      // screen — this is the moment that reads as "swallowed" before the
      // swarm scatters back apart to reveal the new page.
      const bloomT = 1 - Math.abs(progress - CONVERGE_END) / 0.22;
      if (bloomT > 0) {
        const bloomAlpha = Math.max(0, bloomT) * 0.35 * opacity;
        ctx.globalAlpha = bloomAlpha;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.6);
        glow.addColorStop(0, "rgba(255,220,150,1)");
        glow.addColorStop(1, "rgba(255,220,150,0)");
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
