"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import styles from "./transition.module.css";

type Preset = { enterClass: string; exitClass: string; duration: number };

const presets = {
  fade: { enterClass: styles.fadeEnter, exitClass: styles.fadeExit, duration: 400 },
  slideLeft: { enterClass: styles.slideLeftEnter, exitClass: styles.slideLeftExit, duration: 450 },
  slideRight: { enterClass: styles.slideRightEnter, exitClass: styles.slideRightExit, duration: 450 },
} satisfies Record<string, Preset>;

// Deriving the preset name type from `presets` itself means adding a new
// preset above automatically makes it a valid option everywhere else —
// no separate list to keep in sync, and typos get caught at compile time.
type PresetName = keyof typeof presets;
type TransitionSpec = { preset?: PresetName } | null;

function resolvePreset(spec: TransitionSpec): Preset {
  return (spec?.preset && presets[spec.preset]) || presets.fade;
}

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
  const [exiting, setExiting] = useState<React.ReactNode | null>(null);
  const [spec, setSpec] = useState<TransitionSpec>(null);

  // Tracks the previously rendered children/pathname so that when the
  // route changes, we can freeze the outgoing page's content into
  // `exiting` for its exit animation, without needing a separate
  // "current" state that just mirrors `children` a render behind.
  const prevChildrenRef = useRef(children);
  const prevPathRef = useRef(pathname);
  const exitTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      setExiting(prevChildrenRef.current);

      const { duration } = resolvePreset(spec);
      if (exitTimeoutRef.current) window.clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = window.setTimeout(() => setExiting(null), duration + 40);

      prevPathRef.current = pathname;
    }
    prevChildrenRef.current = children;
    // Intentionally only reacting to pathname changes — `spec` and
    // `children` are read for their latest values, not watched for changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, children]);

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) window.clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  const register = useCallback((s: TransitionSpec) => {
    setSpec((prev) => (prev?.preset ?? null) === (s?.preset ?? null) ? prev : s);
  }, []);

  const activePreset = resolvePreset(spec);
  const durationVar = { "--duration": `${activePreset.duration}ms` } as React.CSSProperties;

  return (
    <TransitionContext.Provider value={{ register }}>
      <div className={styles.layer}>
        {/* Exiting layer sits beneath the new content so the entering
            page can overlay during the transition without collapsing layout. */}
        {exiting && (
          <div
            key="exiting"
            className={`${styles.pageLayer} ${styles.pageLayerExiting} ${activePreset.exitClass}`}
            style={durationVar}
          >
            {exiting}
          </div>
        )}

        <div
          key={`current-${pathname}`}
          className={`${styles.pageLayer} ${styles.pageLayerCurrent} ${activePreset.enterClass}`}
          style={durationVar}
        >
          {children}
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

export function PageTransition({ preset }: { preset?: PresetName }) {
  const register = useRegisterTransition();

  useEffect(() => {
    register(preset ? { preset } : null);
  }, [preset, register]);

  return null;
}

export { presets };
