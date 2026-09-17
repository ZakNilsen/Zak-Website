"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ConstellationOverlay, {
  CONSTELLATION_LIFESPAN,
} from "../animations/moonSecrets/ConstellationOverlay";
import MeteorShower, {
  METEOR_SHOWER_LIFESPAN,
} from "../animations/moonSecrets/MeteorShower";
import styles from "./projects.module.css";
import { makeRNG } from "../utility/utility";
import CometCursor from "../animations/cursor/cometCursor";
import { useMobile } from "../mobile/mobileContext";
import { PageTransition } from "../transition/TransitionProvider";
import { useVisitedPages } from "../utility/visitedPageTracker";
import { useKonamiTrigger } from "../utility/konamiProvider";
import { useNightfall } from "../utility/nightfallProvider";

const MAX_CONSTELLATIONS = 5;
const METEOR_TRIGGER_CLICKS = 7;

const BOOST_FIREFLY_COUNT = 20;

type FireflyStyle = React.CSSProperties & Record<`--${string}`, string>;

const FIREFLY_PALETTE: { c1: string; c2: string; glow1: string; glow2: string }[] = [
  { c1: "#ff3fa4", c2: "#ff8ccf", glow1: "rgba(255, 63, 164, 0.9)", glow2: "rgba(255, 140, 207, 0.5)" },
  { c1: "#e838ff", c2: "#c46bff", glow1: "rgba(232, 56, 255, 0.9)", glow2: "rgba(196, 107, 255, 0.5)" },
  { c1: "#7c4dff", c2: "#b388ff", glow1: "rgba(124, 77, 255, 0.9)", glow2: "rgba(179, 136, 255, 0.5)" },
  { c1: "#ff2ee6", c2: "#ff7de8", glow1: "rgba(255, 46, 230, 0.9)", glow2: "rgba(255, 125, 232, 0.5)" },
  { c1: "#c400ff", c2: "#e070ff", glow1: "rgba(196, 0, 255, 0.9)", glow2: "rgba(224, 112, 255, 0.5)" },
  { c1: "#ff5da2", c2: "#ffb3d1", glow1: "rgba(255, 93, 162, 0.9)", glow2: "rgba(255, 179, 209, 0.5)" },
  { c1: "#5ec8ff", c2: "#a3e4ff", glow1: "rgba(94, 200, 255, 0.9)", glow2: "rgba(163, 228, 255, 0.5)" },
];

const pickPaletteEntry = (rng: () => number = Math.random) =>
  FIREFLY_PALETTE[Math.floor(rng() * FIREFLY_PALETTE.length)];

const makeBoostFireflyStyle = (): FireflyStyle => {
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const duration = 8 + Math.random() * 12;
  const delay = Math.random() * 3;
  const size = 3 + Math.random() * 3;
  const palette = pickPaletteEntry();

  return {
    "--start-x": `${startX}%`,
    "--start-y": `${startY}%`,
    "--float-duration": `${duration}s`,
    "--float-delay": `${delay}s`,
    "--firefly-size": `${size}px`,
    "--boost-c1": palette.c1,
    "--boost-c2": palette.c2,
    "--boost-glow1": palette.glow1,
    "--boost-glow2": palette.glow2,
  };
};

export default function ProjectsClient() {
  const pathname = usePathname();
  const { triggerSignal, triggerCounts, triggerPage } = useKonamiTrigger();
  const { markVisited } = useVisitedPages();
  useEffect(() => {
    if (pathname === "/projects") {
      markVisited("projects");
    }
  }, [pathname, markVisited]);

  const lastSignalRef = useRef<number | null>(null);

  const [fireflyBoostActive, setFireflyBoostActive] = useState(false);
  const [boostFireflyStyles, setBoostFireflyStyles] = useState<FireflyStyle[]>([]);
  const [cursorRgbPulse, setCursorRgbPulse] = useState(true);
  const [cursorBurstOnClick, setCursorBurstOnClick] = useState(false);

  useEffect(() => {
    if (lastSignalRef.current === null) {
      lastSignalRef.current = triggerSignal;
      return;
    }

    if (lastSignalRef.current === triggerSignal) return;
    lastSignalRef.current = triggerSignal;

    const nextCount = (triggerCounts.projects ?? 0) + 1;
    triggerPage("projects");

    setFireflyBoostActive(true);
    setBoostFireflyStyles(
      Array.from({ length: BOOST_FIREFLY_COUNT }, () => makeBoostFireflyStyle())
    );
    setCursorRgbPulse(true);
    setCursorBurstOnClick(true);

    console.log("Projects konami trigger fired", {
      triggerSignal,
      count: nextCount,
    });
  }, [triggerSignal, triggerPage, triggerCounts.projects]);

  const { nightfallActive } = useNightfall();
  const visuallyActive = fireflyBoostActive || nightfallActive;
  const { isMobile } = useMobile();

  const fireflies = (() => {
    const rng = makeRNG(20230101);
    const fireflyCount = 25;

    return Array.from({ length: fireflyCount }, (_, i) => {
      const startX = rng() * 100;
      const startY = rng() * 100;
      const duration = 8 + rng() * 12;
      const delay = rng() * 10;
      const size = 3 + rng() * 3;
      const palette = pickPaletteEntry(rng);

      const style = {
        "--start-x": `${startX}%`,
        "--start-y": `${startY}%`,
        "--float-duration": `${duration}s`,
        "--float-delay": `${delay}s`,
        "--firefly-size": `${size}px`,
        "--boost-c1": palette.c1,
        "--boost-c2": palette.c2,
        "--boost-glow1": palette.glow1,
        "--boost-glow2": palette.glow2,
      } as React.CSSProperties;

      return (
        <div
          key={i}
          className={styles.firefly}
          style={style}
        />
      );
    });
  })();

  const boostFireflies = boostFireflyStyles.map((style, i) => (
    <div
      key={`boost-${i}`}
      className={styles.firefly}
      style={style}
    />
  ));

  const [moonClicks, setMoonClicks] = useState(0);
  const [constellations, setConstellations] = useState<number[]>([]);
  const [meteorShower, setMeteorShower] = useState(false);

  const constellationTimers = useRef<Map<number, number>>(new Map());
  const meteorTimer = useRef<number | null>(null);

  useEffect(() => {
    const timers = constellationTimers.current;

    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });

      timers.clear();

      if (meteorTimer.current !== null) {
        window.clearTimeout(meteorTimer.current);
      }
    };
  }, []);

  const handleMoonClick = () => {
    if (meteorShower) {
      return;
    }

    setMoonClicks((currentClicks) => {
      const nextClicks = currentClicks + 1;

      if (nextClicks >= METEOR_TRIGGER_CLICKS) {
        setMeteorShower(true);
        return 0;
      }

      return nextClicks;
    });

    const nextClickCount = moonClicks + 1;

    if (nextClickCount >= METEOR_TRIGGER_CLICKS) {
      setConstellations([]);

      constellationTimers.current.forEach((timer) => {
        window.clearTimeout(timer);
      });

      constellationTimers.current.clear();

      if (meteorTimer.current !== null) {
        window.clearTimeout(meteorTimer.current);
      }

      meteorTimer.current = window.setTimeout(() => {
        setMeteorShower(false);
        meteorTimer.current = null;
      }, METEOR_SHOWER_LIFESPAN);

      return;
    }

    const id = Date.now() + Math.random();

    setConstellations((current) => {
      const updated = [...current, id];

      if (updated.length > MAX_CONSTELLATIONS) {
        const removedId = updated.shift();

        if (removedId !== undefined) {
          const timer = constellationTimers.current.get(removedId);

          if (timer !== undefined) {
            window.clearTimeout(timer);
            constellationTimers.current.delete(removedId);
          }
        }
      }

      return updated;
    });

    const timer = window.setTimeout(() => {
      setConstellations((current) =>
        current.filter((constellationId) => constellationId !== id)
      );

      constellationTimers.current.delete(id);
    }, CONSTELLATION_LIFESPAN);

    constellationTimers.current.set(id, timer);
  };

  const projects = [
  {
    id: 1,
    title: "Dark Sky Finder",
    description:
      "Find the darkest, least light-polluted skies near you — a tool for planning your next stargazing trip.",
    tags: ["Next.js", "Geolocation", "Maps"],
    href: "/dark-sky-finder",
  },
];

  return (
    <div className={styles.projectsContainer}>
      <PageTransition exclude={["slideLeft"]} />
      <div className={`${styles.fireflies} ${visuallyActive ? styles.fireflyColorShift : ""}`}>
        {fireflies}
        {boostFireflies}
      </div>

      {!isMobile && (
        <CometCursor rgbPulse={cursorRgbPulse} burstOnClick={cursorBurstOnClick} />
      )}

      <div
        className={styles.moon}
        onClick={handleMoonClick}
        role="button"
        tabIndex={0}
        aria-label="Moon"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleMoonClick();
          }
        }}
      >
        <div className={styles.moonSurface}></div>
        <div className={styles.moonShadow}></div>
      </div>

      {constellations.map((id, index) => (
        <ConstellationOverlay
          key={id}
          animate={index === constellations.length - 1}
        />
      ))}

      {meteorShower && <MeteorShower />}

      <div className={styles.mountainBack}></div>
      <div className={styles.mountainMid}></div>
      <div className={styles.mountainFront}></div>

      <div className={styles.projectsContent}>
        <section className={styles.headerSection}>
          <h1 className={styles.title}>Projects</h1>

          <p className={styles.subtitle}>
            A collection of work showcasing exploration through code
          </p>
        </section>

        <div className={styles.projectsGrid}>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={project.href}
              className={styles.featuredProjectCard}
            >
              <div className={styles.featuredProjectIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <path
                    d="M12 6.5l1.1 2.2 2.4.35-1.75 1.7.4 2.4L12 12l-2.15 1.15.4-2.4-1.75-1.7 2.4-.35L12 6.5z"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </div>

              <div className={styles.featuredProjectBody}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.projectDescription}>{project.description}</p>
                <div className={styles.projectTags}>
                  {project.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <span className={styles.viewProjectLink}>Explore the project →</span>
              </div>
            </Link>
          ))}
        </div>

        <section className={styles.comingSoonSection}>
          <div className={styles.comingSoonCard}>
            <svg
              className={styles.rocketIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
            </svg>

            <h2 className={styles.comingSoonTitle}>
              More Projects Launching Soon
            </h2>

            <p className={styles.comingSoonText}>
              I&apos;m currently working on some exciting projects that
              showcase my passion for development and exploration. Stay
              tuned for updates!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
