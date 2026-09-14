import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./AppShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://zaknilsen.com"),
  title: {
    default: "Zak Nilsen",
    template: "%s | Zak Nilsen",
  },
  description: "Personal website for Zak Nilsen, featuring projects, creative work, and digital experiments.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Zak Nilsen",
    description: "Personal website for Zak Nilsen, featuring projects, creative work, and digital experiments.",
    url: "https://zaknilsen.com",
    siteName: "Zak Nilsen",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/forest-silhouette.png",
        width: 1200,
        height: 630,
        alt: "Zak Nilsen",
      },
    ],
  },
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
