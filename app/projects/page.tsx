"use client";
import styles from "./projects.module.css";
import { makeRNG } from "../utility/utility";
import { useState, useEffect, useRef } from "react";

export default function Projects() {
  const stars = (() => {
    const rng = makeRNG(20220522);
    const starCount = 100;

    return Array.from({ length: starCount }, (_, i) => {
      const left = rng() * 100;
      const top = rng() * 100;
      const sizeRand = rng();
      const size = sizeRand < 0.7 ? 1 : sizeRand < 0.9 ? 2 : 3;
      const animDelay = rng() * 8;
      const animDuration = 3 + rng() * 5;

      const style = {
        "--star-left": `${left}%`,
        "--star-top": `${top}%`,
        "--star-size": `${size}px`,
        "--anim-delay": `${animDelay}s`,
        "--anim-duration": `${animDuration}s`,
      } as React.CSSProperties;

      return <div key={i} className={styles.star} style={style}></div>;
    });
  })();

  // Fireflies
  const fireflies = (() => {
    const rng = makeRNG(20000101);
    const fireflyCount = 15;

    return Array.from({ length: fireflyCount }, (_, i) => {
      const startX = rng() * 100;
      const startY = rng() * 100;
      const duration = 8 + rng() * 12; // 8-20s
      const delay = rng() * 10;
      const size = 3 + rng() * 3; // 3-6px

      const style = {
        "--start-x": `${startX}%`,
        "--start-y": `${startY}%`,
        "--float-duration": `${duration}s`,
        "--float-delay": `${delay}s`,
        "--firefly-size": `${size}px`,
      } as React.CSSProperties;

      return <div key={i} className={styles.firefly} style={style}></div>;
    });
  })();

  // Comet trail cursor effect
  const [cometTrail, setCometTrail] = useState<Array<{id: number, x: number, y: number}>>([]);
  const cometIdRef = useRef(0);
  const lastCometTime = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Throttle comet creation to every 50ms
      if (now - lastCometTime.current < 50) return;
      lastCometTime.current = now;

      const newComet = {
        id: cometIdRef.current++,
        x: e.clientX,
        y: e.clientY,
      };

      setCometTrail(prev => [...prev, newComet]);

      // Remove comet after animation
      setTimeout(() => {
        setCometTrail(prev => prev.filter(c => c.id !== newComet.id));
      }, 800);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Moon phase (cycles through 8 phases)
  const [moonPhase, setMoonPhase] = useState(0);

  useEffect(() => {
    // Change moon phase every 10 seconds
    const interval = setInterval(() => {
      setMoonPhase(prev => (prev + 1) % 8);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Parallax effect for mountains
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Placeholder project data
  const placeholderProjects = [
    {
      id: 1,
      title: "Project Coming Soon",
      description: "Exciting projects in development. Check back soon to see what I've been building!",
      tags: ["React", "TypeScript", "Node.js"],
    },
    {
      id: 2,
      title: "More on the Way",
      description: "Currently working on innovative solutions that blend creativity with technical excellence.",
      tags: ["AWS", "Next.js", "PostgreSQL"],
    },
    {
      id: 3,
      title: "Future Development",
      description: "Exploring new technologies and pushing boundaries in web development.",
      tags: ["Three.js", "WebGL", "Animation"],
    },
  ];

  return (
    <div className={styles.projectsContainer}>
      <div className={styles.stars}>{stars}</div>
      <div className={styles.fireflies}>{fireflies}</div>

      {/* Comet trail */}
      {cometTrail.map(comet => (
        <div
          key={comet.id}
          className={styles.comet}
          style={{
            left: `${comet.x}px`,
            top: `${comet.y}px`,
          }}
        />
      ))}

      {/* Moon */}
      <div className={styles.moon} data-phase={moonPhase}>
        <div className={styles.moonSurface}></div>
      </div>

      <div className={styles.projectsContent}>

        <section className={styles.headerSection}>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>
            A collection of work showcasing exploration through code
          </p>
        </section>

        <div className={styles.projectsGrid}>
          {placeholderProjects.map((project) => (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.projectIconPlaceholder}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className={styles.projectTitle}>{project.title}</h3>
              <p className={styles.projectDescription}>{project.description}</p>
              <div className={styles.projectTags}>
                {project.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <section className={styles.comingSoonSection}>
          <div className={styles.comingSoonCard}>
            <svg className={styles.rocketIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
            </svg>
            <h2 className={styles.comingSoonTitle}>More Projects Launching Soon</h2>
            <p className={styles.comingSoonText}>
              I'm currently working on some exciting projects that showcase my passion for
              development and exploration. Stay tuned for updates!
            </p>
          </div>
        </section>

      </div>

      {/* Parallax Mountains */}
      <div
        className={styles.mountainLayer3}
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      />
      <div
        className={styles.mountainLayer2}
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      />
      <div
        className={styles.mountainLayer1}
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      />
    </div>
  );
}
