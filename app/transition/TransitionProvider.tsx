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
import WormholeCanvas from "./WormholeCanvas";
import FireflySwarmCanvas from "./FireflySwarmCanvas";
import AuroraCurtainCanvas from "./AuroraCurtainCanvas";
import { useMobile } from "../mobile/mobileContext";

type Preset = { enterClass: string; exitClass: string; duration: number };

const presets = {
  fade: { enterClass: styles.fadeEnter, exitClass: styles.fadeExit, duration: 400 },
  slideLeft: { enterClass: styles.slideLeftEnter, exitClass: styles.slideLeftExit, duration: 450 },
  slideRight: { enterClass: styles.slideRightEnter, exitClass: styles.slideRightExit, duration: 450 },
  slideUp: { enterClass: styles.slideUpEnter, exitClass: styles.slideUpExit, duration: 450 },
  zoom: { enterClass: styles.zoomEnter, exitClass: styles.zoomExit, duration: 500 },
  flipX: { enterClass: styles.flipXEnter, exitClass: styles.flipXExit, duration: 550 },
  flipY: { enterClass: styles.flipYEnter, exitClass: styles.flipYExit, duration: 550 },
  // These three just fade at the page-layer level — the actual visual
  // comes from a canvas overlay rendered on top of them (see
  // OVERLAY_COMPONENTS below).
  hyperspace: { enterClass: styles.fadeEnter, exitClass: styles.fadeExit, duration: 5000 },
  wormhole: { enterClass: styles.fadeEnter, exitClass: styles.fadeExit, duration: 2400 },
  fireflySwarm: { enterClass: styles.fadeEnter, exitClass: styles.fadeExit, duration: 2200 },
  auroraCurtain: { enterClass: styles.fadeEnter, exitClass: styles.fadeExit, duration: 2000 },
} satisfies Record<string, Preset>;

type PresetName = keyof typeof presets;
type TransitionSpec = { preset?: PresetName; exclude?: PresetName[] } | null;

// Maps a preset to the component that draws its overlay and the CSS class
// that positions/fades that overlay. Add a new canvas-driven transition by
// adding one entry here (plus a `presets` entry and a pool listing) —
// no new branch needed in the JSX below.
const OVERLAY_COMPONENTS: Partial<Record<PresetName, React.ComponentType>> = {
  hyperspace: HyperspaceCanvas,
  wormhole: WormholeCanvas,
  fireflySwarm: FireflySwarmCanvas,
  auroraCurtain: AuroraCurtainCanvas,
};

const OVERLAY_CLASSES: Partial<Record<PresetName, string>> = {
  hyperspace: styles.hyperspaceOverlay,
  wormhole: styles.wormholeOverlay,
  fireflySwarm: styles.fireflySwarmOverlay,
  auroraCurtain: styles.auroraCurtainOverlay,
};

const STANDARD_POOL: PresetName[] = [
  "slideLeft",
  "slideRight",
  "slideUp",
  "zoom",
  "flipX",
  "flipY",
];

const SPECIAL_POOL: PresetName[] = [
  "hyperspace",
  "wormhole",
  "fireflySwarm",
  "auroraCurtain",
];

function pickRandomPreset(exclude: PresetName[] = []): PresetName {
  const specialChance = 0.2;
  const excluded = new Set(exclude);

  const pool = (Math.random() < specialChance ? SPECIAL_POOL : STANDARD_POOL)
    .filter((preset) => !excluded.has(preset));

  const fallbackPool = (Math.random() < specialChance ? SPECIAL_POOL : STANDARD_POOL);
  const chosenPool = pool.length > 0 ? pool : fallbackPool;

  return chosenPool[Math.floor(Math.random() * chosenPool.length)];
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
  const { isMobile } = useMobile();
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
      const chosen = spec?.preset ?? pickRandomPreset(spec?.exclude ?? []);
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
    setSpec((prev) => {
      const prevKey = JSON.stringify({ preset: prev?.preset ?? null, exclude: prev?.exclude ?? [] });
      const nextKey = JSON.stringify({ preset: s?.preset ?? null, exclude: s?.exclude ?? [] });
      return prevKey === nextKey ? prev : s;
    });
  }, []);

  // If on mobile, disable visual page transitions but still provide a
  // no-op `register` so components calling `useRegisterTransition` don't throw.
  if (isMobile) {
    return (
      <TransitionContext.Provider value={{ register: () => {} }}>
        {children}
      </TransitionContext.Provider>
    );
  }

  const activePreset = resolvePreset(activePresetName);
  const durationVar = { "--duration": `${activePreset.duration}ms` } as React.CSSProperties;

  const OverlayComponent = OVERLAY_COMPONENTS[activePresetName];
  const overlayClass = OVERLAY_CLASSES[activePresetName];

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

        {/* The special-preset visual — layered above both page layers,
            only mounted while that transition is in flight */}
        {exiting && OverlayComponent && overlayClass && (
          <div className={overlayClass} style={durationVar}>
            <OverlayComponent />
          </div>
        )}
      </div>
    </TransitionContext.Provider>
  );
}

export function PageTransition({
  preset,
  exclude,
}: {
  preset?: PresetName;
  exclude?: PresetName[];
}) {
  const register = useRegisterTransition();

  useEffect(() => {
    register(preset ? { preset, exclude } : exclude?.length ? { exclude } : null);
  }, [preset, exclude, register]);

  return null;
}

export { presets };
