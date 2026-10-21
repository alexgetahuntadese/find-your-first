import { createFileRoute } from "@tanstack/react-router";
import { JobLandingPage } from "@/components/JobLandingPage";

export const Route = createFileRoute("/fresh-graduate-jobs-ethiopia")({
  head: () => ({
    meta: [
      { title: "Fresh Graduate Jobs in Ethiopia | SERATEGNA" },
      { name: "description", content: "Find fresh graduate, new graduate, and entry-level jobs in Ethiopia on SERATEGNA." },
      { property: "og:title", content: "Fresh Graduate Jobs in Ethiopia | SERATEGNA" },
      { property: "og:description", content: "Current opportunities for fresh graduates and entry-level job seekers in Ethiopia." },
    ],
    links: [{ rel: "canonical", href: "https://serategna.com.et/fresh-graduate-jobs-ethiopia" }],
  }),
  component: () => <JobLandingPage kind="fresh" />,
});
