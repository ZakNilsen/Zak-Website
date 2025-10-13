"use client";

import styles from "./navigation.module.css";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HamburgerMenu = dynamic(() => import("../MobileMenu/mobileMenu"), { ssr: false });

export default function Navigation() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth <= 700);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <div className={styles.navigationContainer}>
          {!isMobile && (
            <nav className={styles.topNav}>
              <a href="/" className={styles.navLink}>Home</a>
              <a href="/about" className={styles.navLink}>About</a>
              <a href="/projects" className={styles.navLink}>Projects</a>
              <a href="/contact" className={styles.navLink}>Contact</a>
            </nav>
          )}
          {isMobile && <HamburgerMenu />}
        </div>
    );
}
