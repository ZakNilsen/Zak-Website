import type { Metadata } from "next";
import ProjectsClient from "./ProjectsClient";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects by Zak Nilsen — a collection of work showcasing exploration through code.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Projects | Zak Nilsen",
    url: "https://www.zaknilsen.com/projects",
  },
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}
