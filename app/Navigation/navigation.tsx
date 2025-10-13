import styles from "./navigation.module.css";

export default function Navigation() {
  return (
    <nav className={styles.topNav}>
      <a href="/about" className={styles.navLink}>About</a>
      <a href="/projects" className={styles.navLink}>Projects</a>
      <a href="/contact" className={styles.navLink}>Contact</a>
    </nav>
  );
}
