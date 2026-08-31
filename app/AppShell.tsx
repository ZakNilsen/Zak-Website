"use client";

import { usePathname } from "next/navigation";
import Navigation from "./navigation/navigation";
import { MobileProvider } from "./mobile/mobileContext";
import TransitionProvider from "./transition/TransitionProvider";
import ConsoleEasterEgg from "./console-easter-egg";
import KonamiRedirect from "./konami-redirect";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSecretPage = pathname === "/secret";

  return (
    <>
      <ConsoleEasterEgg />
      <KonamiRedirect />
      <MobileProvider>
        <TransitionProvider>
          {!isSecretPage && <Navigation />}
          {isSecretPage ? children : <main>{children}</main>}
        </TransitionProvider>
      </MobileProvider>
    </>
  );
}
