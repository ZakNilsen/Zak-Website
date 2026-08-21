"use client";
import { useEffect, useRef } from "react";

/**
 * CometCursor
 * A cosmic cursor trail: a smooth glowing comet line + drifting sparkle
 * particles. The trail follows a SMOOTHED cursor position (not the raw,
 * jittery mouse coordinates) and fades + tapers thinner the further back
 * it gets from the head.
 */

type Point = { x: number; y: number; time: number };
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  age: number;
  life: number;
  color: string;
  twinkleSeed: number;
};

// Cosmic palette — tweak freely
const COLORS = [
  "255,255,255", // white
  "173,216,255", // soft blue
  "200,170,255", // lavender
  "255,200,230", // pink
];

const TRAIL_MAX_AGE = 550; // ms a trail point stays visible — shorter = tighter tail
const SPARKLE_EVERY_PX = 10; // spawn a sparkle every N px of travel
const MAX_PARTICLES = 220;

// How strongly the rendered position chases the real mouse position each
// frame. Lower = smoother/laggier, higher = snappier/more jittery.
const SMOOTHING = 0.22;

// Trail line taper: width at the head vs. the tail end.
const HEAD_WIDTH = 3.5;
const TAIL_WIDTH = 0.4;

export default function CometCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- Pre-render a soft glow sprite ONCE. Reusing this with drawImage
    // is far cheaper than building a radial gradient per particle per frame.
    const sprite = document.createElement("canvas");
    const SPRITE_SIZE = 64;
    sprite.width = SPRITE_SIZE;
    sprite.height = SPRITE_SIZE;
    const sctx = sprite.getContext("2d")!;
    const grad = sctx.createRadialGradient(
      SPRITE_SIZE / 2, SPRITE_SIZE / 2, 0,
      SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE / 2
    );
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.5)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

    const trail: Point[] = [];
    let particles: Particle[] = [];
    let raf = 0;

    // Raw target = wherever the real mouse/touch currently is.
    const target = { x: -9999, y: -9999 };
    // Smoothed = the position everything actually renders from.
    let smoothed: { x: number; y: number } | null = null;
    let distanceSinceLastSparkle = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const spawnSparkle = (x: number, y: number) => {
      if (particles.length >= MAX_PARTICLES) return;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.1 + Math.random() * 0.35;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.12,
        size: 3 + Math.random() * 5,
        age: 0,
        life: 600 + Math.random() * 500,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        twinkleSeed: Math.random() * Math.PI * 2,
      });
    };

    // Walks in small steps from the last smoothed point to the new one so
    // fast movement still produces a dense, continuous trail.
    const addPoint = (from: { x: number; y: number } | null, to: { x: number; y: number }, now: number) => {
      if (!from) {
        trail.push({ x: to.x, y: to.y, time: now });
        return;
      }

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.floor(dist / 4));

      for (let i = 1; i <= steps; i++) {
        const ix = from.x + (dx * i) / steps;
        const iy = from.y + (dy * i) / steps;
        trail.push({ x: ix, y: iy, time: now });

        distanceSinceLastSparkle += dist / steps;
        if (distanceSinceLastSparkle >= SPARKLE_EVERY_PX) {
          spawnSparkle(ix, iy);
          distanceSinceLastSparkle = 0;
        }
      }
    };

    const handleMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const handleTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        target.x = t.clientX;
        target.y = t.clientY;
      }
    };

    const render = () => {
      const now = performance.now();

      // Chase the real cursor with a lerp — this is what smooths out
      // hand jitter before it ever becomes trail geometry.
      if (target.x >= 0) {
        if (!smoothed) {
          smoothed = { x: target.x, y: target.y };
        } else {
          const prevSmoothed = { x: smoothed.x, y: smoothed.y };
          smoothed.x += (target.x - smoothed.x) * SMOOTHING;
          smoothed.y += (target.y - smoothed.y) * SMOOTHING;
          addPoint(prevSmoothed, smoothed, now);
        }
      }

      // Age out old trail points
      while (trail.length && now - trail[0].time > TRAIL_MAX_AGE) trail.shift();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Comet line: draw as separate segments so each one can fade
      // and taper based on how old (i.e. how far from the head) it is. ---
      if (trail.length > 1) {
        ctx.lineCap = "round";
        for (let i = 1; i < trail.length; i++) {
          const p0 = trail[i - 1];
          const p1 = trail[i];

          // 0 = brand new (at the head), 1 = about to expire (tail end)
          const ageRatio = Math.min(1, (now - p1.time) / TRAIL_MAX_AGE);
          const alpha = 1 - ageRatio;
          const width = HEAD_WIDTH - (HEAD_WIDTH - TAIL_WIDTH) * ageRatio;

          // Soft outer glow pass
          ctx.strokeStyle = `rgba(180,230,255,${alpha * 0.35})`;
          ctx.lineWidth = width * 2.2;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();

          // Bright core pass
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }

        // Bright head glow, pinned to the smoothed cursor position
        if (smoothed) {
          ctx.globalAlpha = 0.9;
          ctx.drawImage(sprite, smoothed.x - 20, smoothed.y - 20, 40, 40);
          ctx.globalAlpha = 1;
        }
      }

      // --- Sparkle particles ---
      particles = particles.filter((p) => p.age < p.life);
      for (const p of particles) {
        p.age += 16;
        p.x += p.vx;
        p.y += p.vy;

        const lifeRatio = 1 - p.age / p.life;
        const twinkle = 0.6 + 0.4 * Math.sin(p.age * 0.02 + p.twinkleSeed);
        const alpha = Math.max(0, lifeRatio * twinkle);

        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleTouch, { passive: true });
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleTouch);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
