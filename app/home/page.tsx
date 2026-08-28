"use client";

import React, { useState } from "react";
import styles from "./home.module.css";
import Image from "next/image";
import { useMobile } from "../mobile/mobileContext";
import { makeRNG } from "../utility/utility";
import { PageTransition } from "../transition/TransitionProvider";

export default function Home() {
  const { isMobile } = useMobile();

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

  const [bursts, setBursts] = useState<{ id: number }[]>([]);

  const handleWelcomeClick = () => {
    const id = Date.now();
    setBursts((b) => [...b, { id }]);
    setTimeout(() => {
      setBursts((b) => b.filter((burst) => burst.id !== id));
    }, 900);
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
        <div className={styles.welcomeWrapper}>
          <h1 className={styles.welcomeText} onClick={handleWelcomeClick}>
            Welcome
          </h1>

          <div className={styles.fireflies} aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={styles.firefly} />
            ))}
          </div>

          {bursts.map((burst) => (
            <div key={burst.id} className={styles.burst} aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className={styles.sparkle}
                  style={{ "--angle": `${i * 30}deg` } as React.CSSProperties}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
