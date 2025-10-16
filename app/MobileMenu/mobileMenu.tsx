import { useState } from 'react';
import styles from "./mobile-menu.module.css";

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
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/projects">Projects</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default HamburgerMenu;
