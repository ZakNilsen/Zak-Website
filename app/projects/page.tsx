"use client";

import React, { useEffect, useRef, useState } from "react";
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

// Curated palette for the boosted/color-shifted fireflies. Using explicit
// colors instead of a hue-rotate filter guarantees real, distinct color per
// firefly -- hue-rotate on the original pale-gold gradient tends to wash
// back toward pink/pastel regardless of rotation amount, since the gradient
// blends toward near-white at its core and near-white pixels barely have a
// hue for the filter to grab onto.
const FIREFLY_PALETTE: { c1: string; c2: string; glow1: string; glow2: string }[] = [
  { c1: "#ff3fa4", c2: "#ff8ccf", glow1: "rgba(255, 63, 164, 0.9)", glow2: "rgba(255, 140, 207, 0.5)" }, // pink
  { c1: "#e838ff", c2: "#c46bff", glow1: "rgba(232, 56, 255, 0.9)", glow2: "rgba(196, 107, 255, 0.5)" }, // magenta-violet
  { c1: "#7c4dff", c2: "#b388ff", glow1: "rgba(124, 77, 255, 0.9)", glow2: "rgba(179, 136, 255, 0.5)" }, // violet
  { c1: "#ff2ee6", c2: "#ff7de8", glow1: "rgba(255, 46, 230, 0.9)", glow2: "rgba(255, 125, 232, 0.5)" }, // fuchsia
  { c1: "#c400ff", c2: "#e070ff", glow1: "rgba(196, 0, 255, 0.9)", glow2: "rgba(224, 112, 255, 0.5)" }, // deep magenta
  { c1: "#ff5da2", c2: "#ffb3d1", glow1: "rgba(255, 93, 162, 0.9)", glow2: "rgba(255, 179, 209, 0.5)" }, // rose
  { c1: "#5ec8ff", c2: "#a3e4ff", glow1: "rgba(94, 200, 255, 0.9)", glow2: "rgba(163, 228, 255, 0.5)" }, // icy blue, for contrast against the pinks/violets
];

const pickPaletteEntry = (rng: () => number = Math.random) =>
  FIREFLY_PALETTE[Math.floor(rng() * FIREFLY_PALETTE.length)];

const makeBoostFireflyStyle = (): FireflyStyle => {
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const duration = 8 + Math.random() * 12;
  // shorter delay range than the base fireflies so the boosted ones
  // appear quickly rather than trickling in over 10s
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

export default function Projects() {
  const pathname = usePathname();
  const { triggerSignal, triggerCounts, triggerPage } = useKonamiTrigger();
  const { markVisited } = useVisitedPages();
  useEffect(() => {
    if (pathname === "/projects") {
      markVisited("projects");
    }
  }, [pathname, markVisited]);

  const lastSignalRef = useRef<number | null>(null);

  // Firefly boost: temporarily multiplies + recolors the firefly swarm
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

  // Fireflies - increased count for forest atmosphere
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

  // Moon click state
  const [moonClicks, setMoonClicks] = useState(0);

  // Active constellation IDs
  const [constellations, setConstellations] = useState<number[]>([]);

  // Meteor shower state
  const [meteorShower, setMeteorShower] = useState(false);

  // Keep track of constellation cleanup timers
  const constellationTimers = useRef<Map<number, number>>(new Map());

  // Keep track of the meteor shower timer
  const meteorTimer = useRef<number | null>(null);

  /*
   * Clean everything up if the page/component is removed.
   */
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
    /*
     * Don't allow another moon interaction while the meteor shower
     * is currently happening.
     */
    if (meteorShower) {
      return;
    }

    /*
     * Use a functional state update so rapid clicks don't accidentally
     * read an old value of moonClicks.
     */
    setMoonClicks((currentClicks) => {
      const nextClicks = currentClicks + 1;

      /*
       * Every 7th click triggers the meteor shower.
       */
      if (nextClicks >= METEOR_TRIGGER_CLICKS) {
        setMeteorShower(true);

        /*
         * Reset the click counter so the next meteor shower
         * requires another 7 clicks.
         */
        return 0;
      }

      return nextClicks;
    });

    /*
     * We need to determine whether this click is going to trigger
     * the meteor shower. Because setState is asynchronous, calculate
     * the next click count separately.
     */
    const nextClickCount = moonClicks + 1;

    if (nextClickCount >= METEOR_TRIGGER_CLICKS) {
      /*
       * Remove all active constellations when the meteor shower begins.
       */
      setConstellations([]);

      /*
       * Cancel their cleanup timers because the constellations
       * have already been removed.
       */
      constellationTimers.current.forEach((timer) => {
        window.clearTimeout(timer);
      });

      constellationTimers.current.clear();

      /*
       * Clear any previous meteor timer just in case.
       */
      if (meteorTimer.current !== null) {
        window.clearTimeout(meteorTimer.current);
      }

      /*
       * End the meteor shower after its animation finishes.
       */
      meteorTimer.current = window.setTimeout(() => {
        setMeteorShower(false);
        meteorTimer.current = null;
      }, METEOR_SHOWER_LIFESPAN);

      return;
    }

    /*
     * Create a unique ID for this constellation.
     *
     * Date.now() can technically produce the same value if two clicks
     * happen within the same millisecond, so add a random component.
     */
    const id =
      Date.now() + Math.random();

    setConstellations((current) => {
      /*
       * Keep only the newest MAX_CONSTELLATIONS.
       *
       * If we already have 5, the oldest constellation gets removed.
       */
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

    /*
     * Remove this constellation after its animation finishes.
     */
    const timer = window.setTimeout(() => {
      setConstellations((current) =>
        current.filter((constellationId) => constellationId !== id)
      );

      constellationTimers.current.delete(id);
    }, CONSTELLATION_LIFESPAN);

    constellationTimers.current.set(id, timer);
  };

  // Placeholder project data
  const placeholderProjects = [
    {
      id: 1,
      title: "Project Coming Soon",
      description:
        "Exciting projects in development. Check back soon to see what I've been building!",
      tags: ["React", "TypeScript", "Node.js"],
    },
    {
      id: 2,
      title: "More on the Way",
      description:
        "Currently working on innovative solutions that blend creativity with technical excellence.",
      tags: ["AWS", "Next.js", "PostgreSQL"],
    },
    {
      id: 3,
      title: "Future Development",
      description:
        "Exploring new technologies and pushing boundaries in web development.",
      tags: ["Three.js", "WebGL", "Animation"],
    },
  ];

  return (
    <div className={styles.projectsContainer}>
      <PageTransition exclude={["slideLeft"]} />
      <div className={`${styles.fireflies} ${visuallyActive ? styles.fireflyColorShift : ""}`}>
        {fireflies}
        {boostFireflies}
      </div>

      {/* Cosmic cursor trail (hidden on mobile) */}
      {!isMobile && (
        <CometCursor rgbPulse={cursorRgbPulse} burstOnClick={cursorBurstOnClick} />
      )}

      {/* Moon */}
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

      {/* Constellations */}
      {constellations.map((id, index) => (
        <ConstellationOverlay
          key={id}
          animate={index === constellations.length - 1}
        />
      ))}

      {/* Meteor shower */}
      {meteorShower && <MeteorShower />}

      {/* Mountain silhouettes */}
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
          {placeholderProjects.map((project) => (
            <div
              key={project.id}
              className={styles.projectCard}
            >
              <div className={styles.projectIconPlaceholder}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>

              <h3 className={styles.projectTitle}>
                {project.title}
              </h3>

              <p className={styles.projectDescription}>
                {project.description}
              </p>

              <div className={styles.projectTags}>
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={styles.tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
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
