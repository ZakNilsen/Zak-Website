import type { Metadata } from "next";
import DarkSkyFinder from "./darkSkyFinder";

export const metadata: Metadata = {
  title: "Dark Sky Finder",
  description: "Find dark sky spots near you using NASA night-lights imagery and a live cloud-cover forecast.",
  alternates: {
    canonical: "/dark-sky-finder",
  },
  openGraph: {
    title: "Dark Sky Finder | Zak Nilsen",
    url: "https://www.zaknilsen.com/dark-sky-finder",
  },
};

export default function DarkSkyFinderPage() {
  return (
    <main style={{ padding: "7.5rem 1.5rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Dark Sky Finder</h1>
      <DarkSkyFinder />
    </main>
  );
}
