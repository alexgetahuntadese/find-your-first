import { createFileRoute } from "@tanstack/react-router";
import { JobLandingPage } from "@/components/JobLandingPage";

export const Route = createFileRoute("/entry-level-jobs-addis-ababa")({
  head: () => ({
    meta: [
      { title: "Entry-Level Jobs in Addis Ababa | SERATEGNA" },
      { name: "description", content: "Browse junior and entry-level jobs in Addis Ababa for fresh graduates and early-career professionals." },
      { property: "og:title", content: "Entry-Level Jobs in Addis Ababa | SERATEGNA" },
      { property: "og:description", content: "Current junior and entry-level opportunities in Addis Ababa." },
    ],
    links: [{ rel: "canonical", href: "https://serategna.com.et/entry-level-jobs-addis-ababa" }],
  }),
  component: () => <JobLandingPage kind="addis" />,
});
