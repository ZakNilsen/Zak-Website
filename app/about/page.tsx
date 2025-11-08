import styles from "./about.module.css";

export default function About() {
  return (
    <div className={styles.aboutContainer}>
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
              <li>Implemented AI-generated learning content using OpenAI's ChatGPT API and AWS Transcribe</li>
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
            <a href="mailto:zakarynilsen@gmail.com" className={styles.contactButton}>
              Email Me
            </a>
            <a
              href="https://linkedin.com/in/zakary-nilsen"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactButton}
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/ZakNilsen"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactButton}
            >
              GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
