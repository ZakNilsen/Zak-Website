import type { Metadata } from "next";
import Link from 'next/link'
import React from 'react'
import styles from './not-found.module.css'

export const metadata: Metadata = {
  title: "404 — Not Found",
  robots: { index: false, follow: true },
};

const TWINKLE_STARS = [
  { top: '10%', left: '15%', size: '3px', duration: '3.2s', delay: '0s' },
  { top: '20%', left: '80%', size: '2px', duration: '2.6s', delay: '0.4s' },
  { top: '35%', left: '45%', size: '2px', duration: '3.8s', delay: '1.1s' },
  { top: '15%', left: '60%', size: '3px', duration: '2.9s', delay: '0.8s' },
  { top: '60%', left: '10%', size: '2px', duration: '3.4s', delay: '1.6s' },
  { top: '70%', left: '85%', size: '3px', duration: '2.7s', delay: '0.2s' },
  { top: '80%', left: '30%', size: '2px', duration: '3.1s', delay: '1.3s' },
  { top: '50%', left: '92%', size: '2px', duration: '3.6s', delay: '0.6s' },
  { top: '45%', left: '5%', size: '3px', duration: '2.5s', delay: '1.9s' },
  { top: '85%', left: '55%', size: '2px', duration: '3.3s', delay: '0.9s' },
];

export default function NotFound() {
  return (
    <main className={styles.notFoundContainer}>
      <div className={styles.twinkleField} aria-hidden="true">
        {TWINKLE_STARS.map((star, i) => (
          <div
            key={i}
            className={styles.twinkle}
            style={{
              '--top': star.top,
              '--left': star.left,
              '--size': star.size,
              '--duration': star.duration,
              '--delay': star.delay,
            } as React.CSSProperties}
          />
        ))}
        <div className={styles.shootingStar} />
      </div>

      <h1 className={styles.title}>404</h1>
      <p className={styles.message}>Page not found — the stars must&apos;ve moved it.</p>
      <Link href="/" className={styles.homeLink}>
        Go back home
      </Link>
    </main>
  )
}
