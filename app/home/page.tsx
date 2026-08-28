"use client";

import React, { useState, useRef } from "react";
import styles from "./home.module.css";
import Image from "next/image";
import { useMobile } from "../mobile/mobileContext";
import { makeRNG } from "../utility/utility";
import { PageTransition } from "../transition/TransitionProvider";

const LEAF_COLORS = ["#7a9a52", "#d4a83e", "#c97c3d", "#a84b3d", "#6b8f3a"];
const LEAF_COUNT = 10;
const LEAF_STEPS = 4;
const LEAF_LIFETIME_MS = 1600;

const randBetween = (min: number, max: number) => Math.random() * (max - min) + min;

type LeafStyle = React.CSSProperties & Record<`--${string}`, string>;

type Leaf = {
  style: LeafStyle;
};

const makeLeaf = (): Leaf => {
  const spin = Math.random() < 0.5 ? 1 : -1;
  let x = 0;
  let y = 0;
  let rot = 0;

  const style: LeafStyle = {
    "--leaf-color": LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
  };

  for (let i = 1; i <= LEAF_STEPS; i++) {
    x += randBetween(-25, 25);
    y += i === 1 ? randBetween(-40, -10) : randBetween(30, 50);
    rot += spin * randBetween(80, 140);

    style[`--dx-${i}`] = `${x}px`;
    style[`--dy-${i}`] = `${y}px`;
    style[`--rot-${i}`] = `${rot}deg`;
  }

  return { style };
};

type Burst = { id: number; leaves: Leaf[]; originStyle: React.CSSProperties };

export default function Home() {
  const { isMobile } = useMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const starCount = isMobile ? 40 : 50;
  const starClass = isMobile ? styles.mobileStars : styles.stars;

  const stars = (() => {
    const rng = makeRNG(20220522); // fixed seed for consistent SSR + client
    const slowDownMultiplier = isMobile ? 1.25 : 1;

    return Array.from({ length: starCount }, (_, i) => {
      const tailLength = rng() * 2.5 + 5; // 5–7.5em
      const topOffset = rng() * 100; // 0–100vh
      const baseFallMs = rng() * 6000 + 6000; // 6000–12000ms
      const fallMs = Math.round(baseFallMs * slowDownMultiplier);
      const delayMs = rng() * 10000; // 0–10000ms

      const style = {
        "--star-tail-length": `${tailLength}em`,
        "--top-offset": `${topOffset}vh`,
        "--fall-duration": `${fallMs / 1000}s`,
        "--fall-delay": `${delayMs / 1000}s`,
      } as React.CSSProperties;

      return <div key={i} className={styles.star} style={style}></div>;
    });
  })();

  const [bursts, setBursts] = useState<Burst[]>([]);

  const handleWelcomeClick = (e: React.MouseEvent<HTMLHeadingElement>) => {
    const wrapperRect = wrapperRef.current?.getBoundingClientRect();
    const originX = wrapperRect ? e.clientX - wrapperRect.left : 0;
    const originY = wrapperRect ? e.clientY - wrapperRect.top : 0;

    const id = Date.now();
    const leaves = Array.from({ length: LEAF_COUNT }, makeLeaf);
    const originStyle = {
      "--origin-x": `${originX}px`,
      "--origin-y": `${originY}px`,
    } as React.CSSProperties;

    setBursts((b) => [...b, { id, leaves, originStyle }]);
    setTimeout(() => {
      setBursts((b) => b.filter((burst) => burst.id !== id));
    }, LEAF_LIFETIME_MS);
  };

  return (
    <div className={styles.homeContainer}>
      <PageTransition exclude={["slideRight"]} />
      <div className={starClass}>{stars}</div>
      <div className={styles.forest} aria-hidden="true">
        <Image
          src="/images/forest-silhouette.png"
          alt="Forest silhouette"
          aria-hidden="true"
          width={1600}
          height={900}
          className={styles.forestImage}
        />
      </div>
      <div className={styles.centeredWelcome}>
        <div className={styles.welcomeWrapper} ref={wrapperRef}>
          <h1 className={styles.welcomeText} onClick={handleWelcomeClick}>
            Welcome
          </h1>

          <div className={styles.fireflies} aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={styles.firefly} />
            ))}
          </div>

          {bursts.map((burst) => (
            <div
              key={burst.id}
              className={styles.burst}
              style={burst.originStyle}
              aria-hidden="true"
            >
              {burst.leaves.map((leaf, i) => (
                <div key={i} className={styles.leaf} style={leaf.style} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
