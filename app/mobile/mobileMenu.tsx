import { useState } from 'react';
import styles from "./mobileMenu.module.css";
import Link from 'next/link'

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.hamburgerMenuContainer}>
      <button className={styles.hamburgerIcon} onClick={toggleMenu} aria-label="Open navigation menu">
        <div className={`${styles.line} ${isOpen ? styles.open : ''}`}></div>
        <div className={`${styles.line} ${isOpen ? styles.open : ''}`}></div>
        <div className={`${styles.line} ${isOpen ? styles.open : ''}`}></div>
      </button>

      <div className={`${styles.sideOverlay} ${isOpen ? styles.open : ''}`}>
        <div className={styles.mobileOverlayStars} />
        <div className={styles.twinkling} />
        <nav className={styles.menuItemsContainer}>
          <ul className={styles.menuItems}>
            <li>
              <Link href="/" className={styles.navLink} onClick={toggleMenu}>Home</Link>
            </li>
            <li>
              <Link href="/about" className={styles.navLink} onClick={toggleMenu}>About</Link>
            </li>
            <li>
              <Link href="/projects" className={styles.navLink} onClick={toggleMenu}>Projects</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default HamburgerMenu;
