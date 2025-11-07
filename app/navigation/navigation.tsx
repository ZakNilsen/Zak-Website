"use client";

import styles from "./navigation.module.css";
import dynamic from "next/dynamic";
import Link from 'next/link'
import { useMobile } from "../mobile/mobileContext";

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

const HamburgerMenu = dynamic(() => import("../mobile/mobileMenu"), { ssr: false });

export default function Navigation() {
  const { isMobile } = useMobile();

    return (
      <div className={styles.navigationContainer}>
        {!isMobile && (
          <div className={styles.topBar}>
            <div className={styles.logoName}>
              <LogoName />
            </div>
            <nav className={styles.topNav}>
              <Link href="/" className={styles.navLink}>Home</Link>
              <Link href="/about" className={styles.navLink}>About</Link>
              <Link href="/projects" className={styles.navLink}>Projects</Link>
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
