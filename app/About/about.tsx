"use client";

import styles from "./about.module.css";
import Navigation from "../Navigation/navigation";
import { AppProps } from "../appProps";


export default function About({ isMobile = false }: AppProps) {


  return (
    <div className={styles.aboutContainer}>
      <Navigation isMobile={isMobile} />
      <div className={styles.content}>
        <h1>About Me</h1>
        <p>
          Hello! I'm Zak Nilsen, a passionate software developer with a love for creating innovative solutions. With experience in various programming languages and frameworks, I enjoy building applications that make a difference.
        </p>
        <p>
          When I'm not coding, I like to explore the outdoors, read sci-fi novels, and experiment with new technologies. Feel free to check out my projects and get in touch!
        </p>
      </div>
    </div>
  );
}
