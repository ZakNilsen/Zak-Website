

import styles from "./page.module.css";
import Navigation from "../Navigation/navigation";

export default function Home() {
  return (
    <div className={styles.fullscreenBg}>
      <Navigation />
      <div className={styles.centeredWelcome}>
        <h1 className={styles.welcomeText}>Welcome</h1>
      </div>
    </div>
  );
}
