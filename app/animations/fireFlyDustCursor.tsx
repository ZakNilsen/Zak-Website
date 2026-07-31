"use client";
import { useEffect, useRef } from "react";

/**
 * FireflyDustCursor
 * A subtle, ambient cursor companion for calmer pages (e.g. an About page).
 * A small handful of soft glowing motes lazily lag behind the cursor, each
 * with its own delay and gentle independent drift + twinkle — no trail
 * line, no bursts, nothing that competes for attention.
 */

type Mote = {
  x: number;
  y: number;
  lag: number; // 0-1, how quickly this mote catches up to the cursor (lower = lazier)
  driftRadius: number;
  driftSpeed: number;
  driftPhase: number;
  twinkleSpeed: number;
  twinklePhase: number;
  size: number;
  color: string;
};

// Cosmic palette. I could add more colors, but I want to keep it subtle and not too busy.
const COLORS = [
  "170,255,210", // soft teal/green
  "150,200,255", // soft blue
  "200,170,255", // soft violet
];

const MOTE_COUNT = COLORS.length;

export default function FireflyDustCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pre-render a soft glow sprite once, reused for every mote every frame.
    const sprite = document.createElement("canvas");
    const SPRITE_SIZE = 48;
    sprite.width = SPRITE_SIZE;
    sprite.height = SPRITE_SIZE;
    const sctx = sprite.getContext("2d")!;
    const grad = sctx.createRadialGradient(
      SPRITE_SIZE / 2, SPRITE_SIZE / 2, 0,
      SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE / 2
    );
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.45, "rgba(255,255,255,0.45)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

    const target = { x: -9999, y: -9999 };
    let hasMouse = false;

    const motes: Mote[] = Array.from({ length: MOTE_COUNT }, (_, i) => ({
      x: -9999,
      y: -9999,
      lag: 0.05 + i * 0.03, // each successive mote is a little lazier
      driftRadius: 8 + Math.random() * 10,
      driftSpeed: 0.0006 + Math.random() * 0.0006,
      driftPhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.0015 + Math.random() * 0.0015,
      twinklePhase: Math.random() * Math.PI * 2,
      size: 10 + Math.random() * 6,
      color: COLORS[i % COLORS.length],
    }));

    let raf = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const handleMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      hasMouse = true;
    };
    const handleTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        target.x = t.clientX;
        target.y = t.clientY;
        hasMouse = true;
      }
    };
    const handleLeave = () => {
      hasMouse = false;
    };

    const render = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (hasMouse) {
        for (const m of motes) {
          if (m.x < 0) {
            m.x = target.x;
            m.y = target.y;
          } else {
            m.x += (target.x - m.x) * m.lag;
            m.y += (target.y - m.y) * m.lag;
          }

          // Gentle independent orbit so each mote feels alive, not glued
          // in a straight line behind the cursor.
          const driftX = Math.cos(now * m.driftSpeed + m.driftPhase) * m.driftRadius;
          const driftY = Math.sin(now * m.driftSpeed * 1.3 + m.driftPhase) * m.driftRadius;

          const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(now * m.twinkleSpeed + m.twinklePhase));
          const alpha = twinkle * 0.55; // keep it soft overall

          const drawX = m.x + driftX;
          const drawY = m.y + driftY;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.globalCompositeOperation = "lighter";
          ctx.drawImage(sprite, drawX - m.size / 2, drawY - m.size / 2, m.size, m.size);
          ctx.restore();

          // Faint color tint on top of the white glow sprite
          ctx.save();
          ctx.globalAlpha = alpha * 0.5;
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = `rgba(${m.color},1)`;
          ctx.beginPath();
          ctx.arc(drawX, drawY, m.size / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      raf = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("mouseleave", handleLeave);
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("mouseleave", handleLeave);
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
