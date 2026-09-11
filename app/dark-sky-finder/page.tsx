import type { Metadata } from "next";
import DarkSkyFinder from "./darkSkyFinder";

export const metadata: Metadata = {
  title: "Dark Sky Finder",
  description: "Find dark sky spots near you using NASA night-lights imagery and a live cloud-cover forecast.",
};

export default function DarkSkyFinderPage() {
  return (
    <main style={{ padding: "2rem 1.5rem", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Dark Sky Finder</h1>
      <DarkSkyFinder />
    </main>
  );
}
