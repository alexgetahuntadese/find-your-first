import { createFileRoute } from "@tanstack/react-router";
import { isJobActive, jobs as boardJobs } from "@/data/jobs";
import { scrapedJobsGeneratedAt } from "@/data/scraped-jobs";
import { listPublishedJobs } from "@/lib/jobs";

const siteUrl = "https://serategna.com.et";

export const Route = createFileRoute("/api/jobs.json")({
  server: {
    handlers: {
      GET: async () => {
        const originalJobs = await listPublishedJobs();

        const jobs = [...new Map([...originalJobs, ...boardJobs].filter(isJobActive).map((job) => [job.id, job])).values()]
          .map((job) => ({
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            mode: job.mode,
            pay: job.pay,
            datePosted: job.datePosted,
            deadline: job.deadline,
            applyUrl: job.applyOnSite ? `${siteUrl}/jobs/${encodeURIComponent(job.id)}` : job.url,
            url: `${siteUrl}/jobs/${encodeURIComponent(job.id)}`,
          }));

        return Response.json({ scrapedJobsGeneratedAt, jobs }, {
          headers: { "Cache-Control": "no-store, max-age=0" },
        });
      },
    },
  },
});
