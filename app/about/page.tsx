"use client";
import styles from "./about.module.css";
import { makeRNG } from "../utility/utility";
import { useState, useRef } from "react";

export default function About() {
  const stars = (() => {
    const rng = makeRNG(20010418);
    const starCount = 100;

    return Array.from({ length: starCount }, (_, i) => {
      const left = rng() * 100;
      const top = rng() * 100;
      const sizeRand = rng();
      const size = sizeRand < 0.7 ? 1 : sizeRand < 0.9 ? 2 : 3; // 70% small, 20% medium, 10% large
      const animDelay = rng() * 8; // 0–8s
      const animDuration = 3 + rng() * 5; // 3–8s

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

  // Particle state - tracks active particles
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    buttonIndex: number;
  }>>([]);

  // Ref to generate unique particle IDs
  const particleIdRef = useRef(0);

  const handleButtonHover = (e: React.MouseEvent<HTMLAnchorElement>, buttonIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Use deterministic RNG seeded with current timestamp + button index
    const rng = makeRNG(Date.now() + buttonIndex);

    // Create 6 particles with deterministic randomness
    const newParticles = Array.from({ length: 6 }, () => {
      const offsetX = (rng() - 0.5) * 60; // -30 to +30
      const offsetY = -40 - rng() * 30; // -40 to -70

      const newId = particleIdRef.current++;

      return {
        id: newId,
        x,
        y,
        offsetX,
        offsetY,
        buttonIndex,
      };
    });

    setParticles(prev => [...prev, ...newParticles]);

    // Remove particles after animation completes
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  return (
    <div className={styles.aboutContainer}>
      <div className={styles.stars}>{stars}</div>
      <div className={styles.aboutContent}>

        <section className={styles.meSection}>
          <h1 className={styles.name}>Hi, I'm Zakary Nilsen</h1>
          <p className={styles.tagline}>
            Full Stack Developer who loves exploring &mdash; in code, in nature, and
            anywhere curiosity leads.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>About Me</h2>
          <div className={styles.aboutText}>
            <p>
              I've always been drawn to the way technology lets us explore &mdash;
              whether it's building something new in code or looking up at the
              night sky and wondering what's out there.
            </p>
            <p>
              I studied Computer Science at the University of St. Thomas and now work at
              ClearCompany, helping develop software that supports people and teams in
              their everyday work. It's been an incredible place to learn how complex
              systems come together &mdash; and how small ideas can grow into something meaningful.
            </p>
            <p>
              Outside of coding, I spend as much time as I can outdoors
               &mdash; hiking, camping, and stargazing whenever the weather cooperates.
               I've always had a soft spot for space and astronomy, and someday
               I'd love to contribute to that field, maybe even build tools that help us
               understand the universe a little better.
            </p>
            <p>
              For me, development isn't just problem-solving &mdash; it's exploration.
              Each project is a small journey into the unknown.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Technical Skills</h2>
          <div className={styles.skillsGrid}>
            <div className={styles.skillCategory}>
              <h3 className={styles.skillCategoryTitle}>Frontend</h3>
              <div className={styles.skillTags}>
                <span className={styles.skillTag}>React</span>
                <span className={styles.skillTag}>TypeScript</span>
                <span className={styles.skillTag}>JavaScript</span>
                <span className={styles.skillTag}>Angular</span>
                <span className={styles.skillTag}>HTML/CSS</span>
                <span className={styles.skillTag}>Figma</span>
              </div>
            </div>

            <div className={styles.skillCategory}>
              <h3 className={styles.skillCategoryTitle}>Backend</h3>
              <div className={styles.skillTags}>
                <span className={styles.skillTag}>C#/.NET</span>
                <span className={styles.skillTag}>Node.js</span>
                <span className={styles.skillTag}>Java</span>
                <span className={styles.skillTag}>ColdFusion</span>
                <span className={styles.skillTag}>SQL</span>
                <span className={styles.skillTag}>Python</span>
              </div>
            </div>

            <div className={styles.skillCategory}>
              <h3 className={styles.skillCategoryTitle}>Cloud & Tools</h3>
              <div className={styles.skillTags}>
                <span className={styles.skillTag}>AWS</span>
                <span className={styles.skillTag}>GitHub</span>
                <span className={styles.skillTag}>RESTful APIs</span>
                <span className={styles.skillTag}>Docker</span>
              </div>
            </div>

            <div className={styles.skillCategory}>
              <h3 className={styles.skillCategoryTitle}>Specialties</h3>
              <div className={styles.skillTags}>
                <span className={styles.skillTag}>Full Stack Development</span>
                <span className={styles.skillTag}>API Development</span>
                <span className={styles.skillTag}>AI Integration</span>
                <span className={styles.skillTag}>Database Design</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Experience</h2>

          <div className={styles.experienceItem}>
            <div className={styles.experienceHeader}>
              <h3 className={styles.jobTitle}>Software Engineer (Full Stack)</h3>
              <span className={styles.jobDate}>June 2024 - Present</span>
            </div>
            <p className={styles.company}>ClearCompany</p>
            <ul className={styles.jobDescription}>
              <li>Developed features using React, TypeScript, C#, and .NET across multiple product teams</li>
              <li>Led frontend development for ClearInsights, a high-priority reporting product with ThoughtSpot AI integration</li>
              <li>Built scalable backend endpoints and ensured pixel-perfect UI implementation from Figma designs</li>
            </ul>
          </div>

          <div className={styles.experienceItem}>
            <div className={styles.experienceHeader}>
              <h3 className={styles.jobTitle}>Full Stack Developer</h3>
              <span className={styles.jobDate}>July 2022 - June 2024</span>
            </div>
            <p className={styles.company}>Brainier Solutions</p>
            <ul className={styles.jobDescription}>
              <li>Integrated AWS Transcribe to automate video subtitle generation and extract searchable video metadata</li>
              <li>Developed video transcription module with AWS Transcribe for automated subtitle generation</li>
              <li>Strengthened email security by implementing DKIM authentication through AWS SES</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          <div className={styles.educationBox}>
            <h3 className={styles.degree}>Bachelor of Science in Computer Science</h3>
            <p className={styles.school}>University of St. Thomas, St. Paul, MN</p>
            <p className={styles.gradDate}>Graduated: May 2022</p>
            <div className={styles.coursework}>
              <p className={styles.courseworkLabel}>Relevant Coursework:</p>
              <div className={styles.courseList}>
                <span className={styles.course}>Web Development</span>
                <span className={styles.course}>OOP</span>
                <span className={styles.course}>Algorithms</span>
                <span className={styles.course}>Data Structures</span>
                <span className={styles.course}>Information Security</span>
                <span className={styles.course}>Database Design</span>
                <span className={styles.course}>Computer Graphics</span>
                <span className={styles.course}>Deep Learning</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.contactSection}>
          <h2 className={styles.sectionTitle}>Let's Connect</h2>
          <p className={styles.contactText}>
            I'm always interested in hearing about new opportunities and collaborations.
          </p>
          <div className={styles.contactButtons}>
            <a
              href="mailto:zakarynilsen@gmail.com"
              className={styles.contactButton}
              onMouseMove={(e) => handleButtonHover(e, 0)}
            >
              <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>Email Me</span>
              {particles.filter(p => p.buttonIndex === 0).map(p => (
                <div
                  key={p.id}
                  className={styles.particle}
                  style={{
                    left: `${p.x}px`,
                    top: `${p.y}px`,
                    '--offset-x': `${p.offsetX}px`,
                    '--offset-y': `${p.offsetY}px`,
                  } as React.CSSProperties}
                />
              ))}
            </a>
            <a
              href="https://linkedin.com/in/zakary-nilsen"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactButton}
              onMouseMove={(e) => handleButtonHover(e, 1)}
            >
              <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>LinkedIn</span>
              {particles.filter(p => p.buttonIndex === 1).map(p => (
                <div
                  key={p.id}
                  className={styles.particle}
                  style={{
                    left: `${p.x}px`,
                    top: `${p.y}px`,
                    '--offset-x': `${p.offsetX}px`,
                    '--offset-y': `${p.offsetY}px`,
                  } as React.CSSProperties}
                />
              ))}
            </a>
            <a
              href="https://github.com/ZakNilsen"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactButton}
              onMouseMove={(e) => handleButtonHover(e, 2)}
            >
              <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
              {particles.filter(p => p.buttonIndex === 2).map(p => (
                <div
                  key={p.id}
                  className={styles.particle}
                  style={{
                    left: `${p.x}px`,
                    top: `${p.y}px`,
                    '--offset-x': `${p.offsetX}px`,
                    '--offset-y': `${p.offsetY}px`,
                  } as React.CSSProperties}
                />
              ))}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
