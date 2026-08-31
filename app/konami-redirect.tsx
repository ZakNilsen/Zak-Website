"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useKonamiCode from "./hooks/useKonamiCode";

export default function KonamiRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const isActivated = useKonamiCode();

  useEffect(() => {
    if (isActivated && pathname !== "/secret") {
      router.replace("/secret");
    }
  }, [isActivated, pathname, router]);

  return null;
}
