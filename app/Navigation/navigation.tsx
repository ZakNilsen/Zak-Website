"use client";

import styles from "./navigation.module.css";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

function LogoName({ size = "normal" }) {
  const small = size === "small" ? styles.small : "";
  return (
    <a href="/" className={`${styles.logoLink} ${small}`}>
      <img
        src="/icons/space-logo.png"
        alt="Logo"
        className={`${styles.logoImage} ${small}`}
      />
      <span className={`${styles.siteName} ${small}`}>
        Zak<br />Nilsen
      </span>
    </a>
  );
}

const HamburgerMenu = dynamic(() => import("../MobileMenu/mobileMenu"), { ssr: false });

export default function Navigation() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth <= 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
      <div className={styles.navigationContainer}>
        {!isMobile && (
          <div className={styles.topBar}>
            <div className={styles.logoName}>
              <LogoName />
            </div>
            <nav className={styles.topNav}>
              <a href="/" className={styles.navLink}>Home</a>
              <a href="/about" className={styles.navLink}>About</a>
              <a href="/projects" className={styles.navLink}>Projects</a>
              <a href="/contact" className={styles.navLink}>Contact</a>
            </nav>
          </div>
        )}
        {isMobile && (
          <div className={styles.mobileNavHeader}>
            <LogoName size="small" />
            <HamburgerMenu />
          </div>
        )}
      </div>
    );
}
