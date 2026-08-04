"use client";
import styles from "./projects.module.css";
import { makeRNG } from "../utility/utility";
import CometCursor from "./../animations/cometCursor";

export default function Projects() {

  // Fireflies - increased count for forest atmosphere
  const fireflies = (() => {
    const rng = makeRNG(20230101);
    const fireflyCount = 25;

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
      <div className={styles.fireflies}>{fireflies}</div>

      {/* Cosmic cursor trail */}
      <CometCursor />

      {/* Moon - animates via css */}
      <div className={styles.moon}>
        <div className={styles.moonSurface}></div>
        <div className={styles.moonShadow}></div>
      </div>

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
    </div>
  );
}
