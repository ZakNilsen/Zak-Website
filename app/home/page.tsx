"use client";

import styles from "./home.module.css";
import { useMobile } from "../mobile/mobileContext";
import { makeRNG } from "../utility/utility";

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

  return (
    <div className={styles.homeContainer}>
      <div className={starClass}>{stars}</div>
      <div className={styles.forest} aria-hidden="true">
        <img src="/images/forest-silhouette.png" alt="" aria-hidden="true" />
      </div>
      <div className={styles.centeredWelcome}>
        <h1 className={styles.welcomeText}>Welcome</h1>
      </div>
    </div>
  );
}
