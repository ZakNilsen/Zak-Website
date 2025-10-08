import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.animationWrapper}>
          <h1 className={styles.title}>Zak's Website</h1>
          <p className={styles.description}>
            Welcome to my personal website!
          </p>
          <div className={styles.navGrid}>
            <a href="/about" className={styles.card}>
              <h2>About Me</h2>
            </a>
            <a href="/projects" className={styles.card}>
              <h2>Projects</h2>
            </a>
            <a href="/contact" className={styles.card}>
              <h2>Contact</h2>
            </a>
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        Footer
      </footer>
    </div>
  );
}
