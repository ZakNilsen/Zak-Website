"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type NightfallContextValue = {
  nightfallActive: boolean;
  setNightfall: (v: boolean) => void;
  toggleNightfall: () => void;
};

const STORAGE_KEY = "nightfallActive";

const NightfallContext = createContext<NightfallContextValue | null>(null);

export function NightfallProvider({ children }: { children: React.ReactNode }) {
  const [nightfallActive, setNightfallActive] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setNightfallActive(stored === "true");
      }
    } catch (e) {
      // ignore (SSR safety)
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setNightfallActive(e.newValue === "true");
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, nightfallActive ? "true" : "false");
    } catch (e) {
      // ignore
    }
  }, [nightfallActive]);

  const value = useMemo(
    () => ({
      nightfallActive,
      setNightfall: (v: boolean) => setNightfallActive(v),
      toggleNightfall: () => setNightfallActive((s) => !s),
    }),
    [nightfallActive]
  );

  return <NightfallContext.Provider value={value}>{children}</NightfallContext.Provider>;
}

export function useNightfall() {
  const ctx = useContext(NightfallContext);
  if (!ctx) throw new Error("useNightfall must be used inside NightfallProvider");
  return ctx;
}

export default NightfallProvider;
