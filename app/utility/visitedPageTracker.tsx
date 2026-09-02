"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type PageKey = "home" | "about" | "projects";
const ALL_PAGES: PageKey[] = ["home", "about", "projects"];
const STORAGE_KEY = "zak-site-visited-pages";
const UNLOCK_SHOWN_KEY = "zak-site-secret-unlock-shown";

interface VisitedPagesContextValue {
  markVisited: (page: PageKey) => void;
  justUnlocked: boolean;
  dismissUnlock: () => void;
}

const VisitedPagesContext = createContext<VisitedPagesContextValue | null>(null);

export function VisitedPagesProvider({ children }: { children: ReactNode }) {
  const [justUnlocked, setJustUnlocked] = useState(false);

  const markVisited = (page: PageKey) => {
    if (typeof window === "undefined") return;

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as PageKey[];
    if (!stored.includes(page)) {
      stored.push(page);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }

    const allVisited = ALL_PAGES.every((p) => stored.includes(p));
    const alreadyShown = localStorage.getItem(UNLOCK_SHOWN_KEY) === "true";

    if (allVisited && !alreadyShown) {
      setJustUnlocked(true);
    }
  };

  const dismissUnlock = () => {
    localStorage.setItem(UNLOCK_SHOWN_KEY, "true");
    setJustUnlocked(false);
  };

  return (
    <VisitedPagesContext.Provider value={{ markVisited, justUnlocked, dismissUnlock }}>
      {children}
    </VisitedPagesContext.Provider>
  );
}

export function useVisitedPages() {
  const ctx = useContext(VisitedPagesContext);
  if (!ctx) throw new Error("useVisitedPages must be used inside VisitedPagesProvider");
  return ctx;
}
