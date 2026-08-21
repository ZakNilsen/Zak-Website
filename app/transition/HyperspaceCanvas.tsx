"use client";

import React, { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
};

export default function HyperspaceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];

    const STAR_COUNT = 700;
    const MAX_DEPTH = 1000;
    const ACCELERATION = 0.08;
    const STAR_SIZE = 1.5;
    const DURATION = 5000; // Duration of the hyperspace effect in milliseconds

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

    const createStar = (): Star => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * MAX_DEPTH,
      prevX: 0,
      prevY: 0,
    });

    const initialize = () => {
      stars = [];

      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(createStar());
      }
    };

    const resetStar = (star: Star) => {
      star.x = (Math.random() - 0.5) * width;
      star.y = (Math.random() - 0.5) * height;
      star.z = MAX_DEPTH;

      star.prevX = width / 2;
      star.prevY = height / 2;
    };

    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTime;

      const progress = Math.min(elapsed / DURATION, 1);

      const acceleration = Math.min(progress / 0.35, 1);
      const deceleration = Math.min((1 - progress) / 0.25, 1);

      const speed = acceleration * deceleration * ACCELERATION * 40;

      let opacity = 1;

      if (progress < 0.1) {
        opacity = progress / 0.1;
      } else if (progress > 0.78) {
        opacity = (1 - progress) / 0.22;
      }

      ctx.globalAlpha = opacity;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#fff";
      ctx.fillStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.lineCap = "round";

      for (const star of stars) {
        const previousScreenX = (star.x / star.z) * width + width / 2;
        const previousScreenY = (star.y / star.z) * height + height / 2;

        star.z -= speed;

        if (star.z <= 1) {
          resetStar(star);
          continue;
        }

        const screenX = (star.x / star.z) * width + width / 2;
        const screenY = (star.y / star.z) * height + height / 2;

        if (
          screenX < -100 ||
          screenX > width + 100 ||
          screenY < -100 ||
          screenY > height + 100
        ) {
          resetStar(star);
          continue;
        }

        const streakAmount = Math.max(1, (1 - star.z / MAX_DEPTH) * 25);

        const dx = screenX - previousScreenX;
        const dy = screenY - previousScreenY;

        const length = Math.sqrt(dx * dx + dy * dy) || 1;

        const streakX = screenX - (dx / length) * streakAmount;

        const streakY = screenY - (dy / length) * streakAmount;

        ctx.beginPath();
        ctx.moveTo(streakX, streakY);
        ctx.lineTo(screenX, screenY);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = STAR_SIZE + (1 - star.z / MAX_DEPTH) * 1.5;
        ctx.stroke();
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

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
