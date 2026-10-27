import { createFileRoute } from "@tanstack/react-router";
import { isJobActive, jobs } from "@/data/jobs";

const siteUrl = "https://serategna.com.et";
const staticPaths = [
  "/",
  "/fresh-graduate-jobs-ethiopia",
  "/internships-ethiopia",
  "/entry-level-jobs-addis-ababa",
  "/unit-converter",
  "/ethiopian-tax-calculator",
  "/currency-converter",
  "/ethiopia",
  "/calendar",
  "/blog",
  "/blog/first-job-cv-ethiopia",
  "/privacy",
];

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character]!);
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const paths = [
          ...staticPaths,
          ...jobs.filter(isJobActive).map((job) => `/jobs/${encodeURIComponent(job.id)}`),
        ];
        const urls = paths.map((path) => `  <url><loc>${escapeXml(`${siteUrl}${path}`)}</loc></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
