import { useState } from 'react';
import styles from "./mobile-menu.module.css";
import Link from 'next/link'; // For Next.js navigation

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
        <nav className={styles.menuItemsContainer}>
          <ul className={styles.menuItems}>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/projects">Projects</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default HamburgerMenu;
