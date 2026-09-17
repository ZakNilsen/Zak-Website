import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About",
  description: "About Zak Nilsen — Full Stack Developer who loves exploring in code and nature.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About | Zak Nilsen",
    url: "https://www.zaknilsen.com/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
