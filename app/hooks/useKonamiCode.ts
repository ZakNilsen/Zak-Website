"use client";

import { useEffect, useRef, useState } from "react";

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
  const [isActivated, setIsActivated] = useState(false);
  const inputRef = useRef<string[]>([]);

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
        inputRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return isActivated;
}
