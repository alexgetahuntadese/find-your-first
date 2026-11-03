import { createFileRoute } from "@tanstack/react-router";
import { JobLandingPage } from "@/components/JobLandingPage";
import { listPublishedJobs } from "@/lib/jobs";

export const Route = createFileRoute("/internships-ethiopia")({
  loader: async () => ({ publishedJobs: await listPublishedJobs() }),
  head: () => ({
    meta: [
      { title: "Internships in Ethiopia | EthioHub.com.et" },
      { name: "description", content: "Find internships, paid internships, and student opportunities in Ethiopia on EthioHub.com.et." },
      { property: "og:title", content: "Internships in Ethiopia | EthioHub.com.et" },
      { property: "og:description", content: "Discover current internship opportunities for students and early-career talent in Ethiopia." },
    ],
    links: [{ rel: "canonical", href: "https://serategna.com.et/internships-ethiopia" }],
  }),
  component: InternshipsPage,
});

function InternshipsPage() { const { publishedJobs } = Route.useLoaderData(); return <JobLandingPage kind="internships" publishedJobs={publishedJobs} />; }
