"use client";

import styles from "./projects.module.css";
import { useMobile } from "../mobile/mobileContext";

export default function Home() {
  const { isMobile } = useMobile();

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.title}>Projects</h1>
      <p className={styles.description}>
        This is the projects page. Content coming soon!
      </p>
    </div>
  );
}
