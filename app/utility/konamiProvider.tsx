"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import useKonamiCode from "../hooks/useKonamiCode";

export type PageKey = "home" | "about" | "projects";

export type TriggerCounts = Record<PageKey, number>;

type KonamiContextValue = {
  triggerSignal: number;
  triggerCounts: TriggerCounts;
  triggerPage: (page: PageKey) => void;
};

const DEFAULT_TRIGGER_COUNTS: TriggerCounts = {
  home: 0,
  about: 0,
  projects: 0,
};

const KonamiContext = createContext<KonamiContextValue | null>(null);

export function KonamiProvider({ children }: { children: ReactNode }) {
  const { triggerSignal } = useKonamiCode();
  const [triggerCounts, setTriggerCounts] = useState<TriggerCounts>(DEFAULT_TRIGGER_COUNTS);

  const triggerPage = useCallback((page: PageKey) => {
    setTriggerCounts((current) => ({
      ...current,
      [page]: (current[page] ?? 0) + 1,
    }));
  }, []);

  const value = useMemo<KonamiContextValue>(
    () => ({ triggerSignal, triggerCounts, triggerPage }),
    [triggerSignal, triggerCounts, triggerPage]
  );

  return <KonamiContext.Provider value={value}>{children}</KonamiContext.Provider>;
}

export function useKonamiTrigger() {
  const context = useContext(KonamiContext);

  if (!context) {
    throw new Error("useKonamiTrigger must be used inside KonamiProvider");
  }

  return context;
}
