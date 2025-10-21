"use client";

import styles from "./home.module.css";
import Navigation from "../Navigation/navigation";

interface HomeProps {
  isMobile?: boolean;
}

export default function Home({ isMobile = false }: HomeProps) {
  const starCount = 50;

  /**
   * Deterministic random number generator
   * Ensures SSR and client generate identical values
   */
  function makeRNG(seed: number) {
    return function random() {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
  }

  const stars = (() => {
    const rng = makeRNG(20220522); // fixed seed for consistent SSR + client
    const speedMultiplier = isMobile ? 1.5 : 1;

    return Array.from({ length: starCount }, (_, i) => {
      const tailLength = rng() * 2.5 + 5; // 5–7.5em
      const topOffset = rng() * 100; // 0–100vh
      const baseFallMs = rng() * 6000 + 6000; // 6000–12000ms
      const fallMs = Math.round(baseFallMs * speedMultiplier);
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
      <Navigation isMobile={isMobile} />
      <div className={styles.stars}>{stars}</div>
      <div className={styles.forest} aria-hidden="true" />
      <div className={styles.centeredWelcome}>
        <h1 className={styles.welcomeText}>Welcome</h1>
      </div>
      <div className={styles.initialInfo}>
        <p>This is in progress- have to figure this out still</p>
      </div>
    </div>
  );
}
