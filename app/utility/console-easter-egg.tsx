"use client";

import { useEffect } from "react";

export default function ConsoleEasterEgg() {
  useEffect(() => {
    console.log(
      `%c
        .  *  .    ✦     .   *  .  ✦    .   *
     *    ∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴   .    *
   .    ∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴∴    ✦
     ✦     ☾      *        .        *    .
   ______/\\____/\\/\\__/\\____/\\____/\\______
  /___/\\/  \\/  \\/  \\/  \\/  \\/  \\/  \\/\\___\\
   |  /\\  /\\  /\\  /\\  /\\  /\\  /\\  /\\  |
   | /  \\/  \\/  \\/  \\/  \\/  \\/  \\/  \\/  \\ |
   |/____________________________________\\|

`,
      "color: #7ee8fa; font-family: monospace; line-height: 1.1;"
    );

    console.log(
      "%cYou found the forest, wanderer.",
      "color: #a6f3c2; font-size: 14px; font-weight: bold;"
    );
    console.log(
      "%cHi, I'm Zak Nilsen. Thanks for looking under the hood. ✦",
      "color: #d9d9ff; font-size: 12px;"
    );
    console.log(
      "%c☾ The moon on the Projects page isn't just decoration...",
      "color: #f4e9c1; font-size: 12px; font-style: italic;"
    );
    console.log(
      "%cEvery click draws a new constellation. But patience reveals more.",
      "color: #f4e9c1; font-size: 11px;"
    );
    console.log(
      "%c☾ There's a secret woven into every page of this site, not just one...",
      "color: #f4e9c1; font-size: 12px; font-style: italic;"
    );
    console.log(
      "%cIt doesn't care where you are. It only cares that you remember the old ways.",
      "color: #f4e9c1; font-size: 11px;"
    );
    console.log(
      "%c(hint: just knock- you already know the rhythm)",
      "color: #7ee8fa; font-size: 10px; font-style: italic;"
    );
    console.log(
      "%cUp, up, down, down, left, right, left, right, B, A. ↑ ↑ ↓ ↓ ← → ← → B A",
      "color: #7ee8fa; font-size: 10px; font-style: italic;"
    );
    console.log(
      "%c(or if your fingers are lazy — try the right Ctrl key instead)",
      "color: #7ee8fa; font-size: 10px; font-style: italic;"
    );
  }, []);

  return null;
}
