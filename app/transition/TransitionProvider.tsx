"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import styles from "./transition.module.css";

type Preset = { enterClass: string; exitClass: string; duration: number };

const presets: Record<string, Preset> = {
  fade: { enterClass: styles.fadeEnter, exitClass: styles.fadeExit, duration: 400 },
  slideLeft: { enterClass: styles.slideLeftEnter, exitClass: styles.slideLeftExit, duration: 450 },
  slideRight: { enterClass: styles.slideRightEnter, exitClass: styles.slideRightExit, duration: 450 },
};

type TransitionSpec = { preset?: string } | null;

type ContextValue = {
  register: (spec: TransitionSpec) => void;
};

const TransitionContext = createContext<ContextValue | null>(null);

export function useRegisterTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useRegisterTransition must be used within TransitionProvider");
  return ctx.register;
}

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [current, setCurrent] = useState<React.ReactNode>(children);
  const [exiting, setExiting] = useState<React.ReactNode | null>(null);
  const [spec, setSpec] = useState<TransitionSpec>(null);
  const timeoutRef = useRef<number | null>(null);

  // Update current when children change (initial and on navigation)
  useEffect(() => {
    setCurrent(children);
  }, [children]);

  // detect pathname change to trigger exit animation
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current && pathname !== prevPathRef.current) {
      // start exit: capture current into exiting, then show new current
      setExiting(current);
      // allow next render to set current from children (already handled by children effect)

      const p = spec?.preset && presets[spec.preset] ? presets[spec.preset] : presets.fade;
      const duration = p.duration;

      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setExiting(null);
      }, duration + 40);
    }
    prevPathRef.current = pathname;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const register = useCallback((s: TransitionSpec) => {
    setSpec((prev) => {
      const prevPreset = prev?.preset ?? null;
      const nextPreset = s?.preset ?? null;
      if (prevPreset === nextPreset) return prev;
      return s;
    });
  }, []);

  // determine classes for entering and exiting
  const activePreset = spec?.preset && presets[spec.preset] ? presets[spec.preset] : presets.fade;

  return (
    <TransitionContext.Provider value={{ register }}>
      <div className={styles.layer} style={{ position: "relative" }}>
        {/* Exiting layer sits below the entering layer so the entering content can overlay during enter animation */}
        {exiting ? (
          <div
            key="exiting"
            className={`${styles.pageLayer} ${activePreset.exitClass}`}
            style={{ "--duration": `${activePreset.duration}ms` } as React.CSSProperties}
          >
            {exiting}
          </div>
        ) : null}

        <div
          key={`current-${pathname}`}
          className={`${styles.pageLayer} ${activePreset.enterClass}`}
          style={{ "--duration": `${activePreset.duration}ms` } as React.CSSProperties}
        >
          {current}
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

export function PageTransition({ preset }: { preset?: string }) {
  const register = useRegisterTransition();
  useEffect(() => {
    register(preset ? { preset } : null);
  }, [preset, register]);
  return null;
}

export { presets };
