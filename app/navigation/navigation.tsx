"use client";

import styles from "./navigation.module.css";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobile } from "../mobile/mobileContext";
import { useState, useEffect } from "react";

function LogoName({ size = "normal", className = "" }) {
  const small = size === "small" ? styles.small : "";
  return (
    <Link href="/" className={`${styles.logoLink} ${small} ${className}`}>
      <Image
        src="/icons/space-logo.png"
        alt="Logo"
        width={48}
        height={48}
        className={`${styles.logoImage} ${small}`}
      />
      <span className={`${styles.siteName} ${small}`}>
        Zak<br />Nilsen
      </span>
    </Link>
  );
}

const HamburgerMenu = dynamic(() => import("../mobile/mobileMenu"), { ssr: false });

export default function Navigation() {
  const { isMobile } = useMobile();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isSecretPage = pathname === "/secret";

  if (isSecretPage) {
    return null;
  }

  useEffect(() => {
    // Only set up the listener if we are on a mobile device
    if (!isMobile) return;

    const handleScroll = () => {
      // Check if the vertical scroll position is greater than 100px (or any threshold)
      const scrolled = window.scrollY > 100;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, isScrolled]); // Re-run effect if mobile status or scroll state changes

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
          <LogoName size="small" className={isScrolled ? styles.hiddenLogo : ''} />
          <HamburgerMenu />
        </div>
      )}
      </div>
    );
}
