import styles from "./home.module.css";
import Navigation from "../Navigation/navigation";

export default function Home() {
  const starCount = 50;

  function randomRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const stars = Array.from({ length: starCount }, (_, i) => {
    const style = {
      "--star-tail-length": `${randomRange(500, 750) / 100}em`,
      "--top-offset": `${randomRange(0, 10000) / 100}vh`,
      "--fall-duration": `${randomRange(6000, 12000) / 1000}s`,
      "--fall-delay": `${randomRange(0, 10000) / 1000}s`
    } as React.CSSProperties;

    return <div key={i} className={styles.star} style={style}></div>;
  });

  return (
    <div className={styles.homeContainer}>
      <Navigation />
      <div className={styles.stars}>{stars}</div>
      <div className={styles.centeredWelcome}>
        <h1 className={styles.welcomeText}>Welcome</h1>
      </div>
    </div>
  );
}
