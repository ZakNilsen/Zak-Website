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
import HyperspaceCanvas from "./HyperspaceCanvas";

type Preset = { enterClass: string; exitClass: string; duration: number };

const presets = {
  fade: { enterClass: styles.fadeEnter, exitClass: styles.fadeExit, duration: 400 },
  slideLeft: { enterClass: styles.slideLeftEnter, exitClass: styles.slideLeftExit, duration: 450 },
  slideRight: { enterClass: styles.slideRightEnter, exitClass: styles.slideRightExit, duration: 450 },
  slideUp: { enterClass: styles.slideUpEnter, exitClass: styles.slideUpExit, duration: 450 },
  zoom: { enterClass: styles.zoomEnter, exitClass: styles.zoomExit, duration: 500 },
  flipX: { enterClass: styles.flipXEnter, exitClass: styles.flipXExit, duration: 550 },
  flipY: { enterClass: styles.flipYEnter, exitClass: styles.flipYExit, duration: 550 },
  // The page layers themselves just fade for this one — the actual "warp"
  // visual comes from the HyperspaceCanvas overlay rendered on top of them.
  hyperspace: { enterClass: styles.fadeEnter, exitClass: styles.fadeExit, duration: 5000 },
} satisfies Record<string, Preset>;

type PresetName = keyof typeof presets;
type TransitionSpec = { preset?: PresetName } | null;

const STANDARD_POOL: PresetName[] = [
  "fade",
  "fade",
  "slideLeft",
  "slideRight",
  "slideUp",
  "zoom",
];

const SPECIAL_POOL: PresetName[] = [
  "flipX",
  "flipY",
  "hyperspace",
];

function pickRandomPreset(): PresetName {
  const specialChance = 0.2;

  const pool =
    Math.random() < specialChance
      ? SPECIAL_POOL
      : STANDARD_POOL;

  return pool[Math.floor(Math.random() * pool.length)];
}

function resolvePreset(name: PresetName): Preset {
  return presets[name];
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
  // The preset actually used for the transition currently in flight. Chosen
  // once per navigation (either from `spec` or randomly) and held steady
  // for the duration of that transition, rather than re-derived every render.
  const [activePresetName, setActivePresetName] = useState<PresetName>("fade");

  const prevChildrenRef = useRef(children);
  const prevPathRef = useRef(pathname);
  const exitTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      const chosen = spec?.preset ?? pickRandomPreset();
      setActivePresetName(chosen);
      setExiting(prevChildrenRef.current);

      const { duration } = resolvePreset(chosen);
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
    setSpec((prev) => ((prev?.preset ?? null) === (s?.preset ?? null) ? prev : s));
  }, []);

  const activePreset = resolvePreset(activePresetName);
  const durationVar = { "--duration": `${activePreset.duration}ms` } as React.CSSProperties;

  return (
    <TransitionContext.Provider value={{ register }}>
      <div className={styles.layer} style={{ position: "relative" }}>
        {/* Exiting layer sits below the entering layer so the entering
            content can overlay during the enter animation */}
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

        {/* Hyperspace's actual warp visual — layered above both page
            layers, only mounted while this transition is in flight */}
        {exiting && activePresetName === "hyperspace" && (
          <div className={styles.hyperspaceOverlay} style={durationVar}>
            <HyperspaceCanvas />
          </div>
        )}
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
