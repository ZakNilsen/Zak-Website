"use client";

import { usePathname } from "next/navigation";
import Navigation from "./navigation/navigation";
import { MobileProvider } from "./mobile/mobileContext";
import TransitionProvider from "./transition/TransitionProvider";
import ConsoleEasterEgg from "./utility/console-easter-egg";
import KonamiRedirect from "./utility/konami-redirect";
import { VisitedPagesProvider } from "./utility/visitedPageTracker";
import SecretUnlockToast from "./secret/unlockToast";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSecretPage = pathname === "/secret";

  return (
    <>
      <ConsoleEasterEgg />
      <KonamiRedirect />
      <VisitedPagesProvider>
        <MobileProvider>
          <TransitionProvider>
            {!isSecretPage && <Navigation />}
            {isSecretPage ? children : <main>{children}</main>}
          </TransitionProvider>
        </MobileProvider>
        <SecretUnlockToast />
      </VisitedPagesProvider>
    </>
  );
}
