"use client";

import React from "react";
import { useNightfall } from "../utility/nightfallProvider";
import { useMobile } from "./mobileContext";
import styles from "./mobileMenu.module.css";

export default function NightfallToggle({ className }: { className?: string }) {
  const { isMobile } = useMobile();
  const { nightfallActive, toggleNightfall } = useNightfall();

  if (!isMobile) return null;

  return (
    <button
      aria-pressed={nightfallActive}
      aria-label={nightfallActive ? "Disable Nightfall" : "Enable Nightfall"}
      className={`${styles.nightfallButton} ${nightfallActive ? styles.full : ""} ${className ?? ""}`}
      onClick={toggleNightfall}
      title={nightfallActive ? "Nightfall is on" : "Turn on Nightfall"}
    >
      {nightfallActive ? "🌕" : "🌙"}
    </button>
  );
}
