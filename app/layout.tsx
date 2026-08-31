import type { Metadata } from "next";
import "./globals.css";
import Navigation from "./navigation/navigation";
import { MobileProvider } from "./mobile/mobileContext";
import TransitionProvider from "./transition/TransitionProvider";
import ConsoleEasterEgg from "./console-easter-egg";

export const metadata: Metadata = {
  title: "Zak's Website",
  description: "Zak Nilsen's personal website",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/app/site.webmanifest" />
      </head>
      <body>
        <ConsoleEasterEgg />
        <MobileProvider>
          <TransitionProvider>
            <Navigation />

            {/* Render current page component */}
            <main>{children}</main>
          </TransitionProvider>
        </MobileProvider>
      </body>
    </html>
  );
}
