"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export default function useKonamiCode() {
  const [triggerSignal, setTriggerSignal] = useState(0);
  const [isActivated, setIsActivated] = useState(false);
  const inputRef = useRef<string[]>([]);

  const resetActivated = useCallback(() => {
    setIsActivated(false);
    inputRef.current = [];
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      inputRef.current.push(key);

      if (inputRef.current.length > KONAMI_CODE.length) {
        inputRef.current.shift();
      }

      const matches = inputRef.current.every((value, index) => {
        return value === KONAMI_CODE[index];
      });

      if (matches && inputRef.current.length === KONAMI_CODE.length) {
        setIsActivated(true);
        setTriggerSignal((current) => current + 1);
        inputRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return { isActivated, resetActivated, triggerSignal };
}
