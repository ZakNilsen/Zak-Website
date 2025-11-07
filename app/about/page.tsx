"use client";

import styles from "./about.module.css";
import Navigation from "../navigation/navigation";
import { useMobile } from "../mobile/mobileContext";


export default function About() {

  return (
    <div className={styles.aboutContainer}>
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
