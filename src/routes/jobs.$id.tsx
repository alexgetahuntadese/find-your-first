import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, CalendarDays, MapPin } from "lucide-react";
import { jobs, type Job } from "@/data/jobs";

export const Route = createFileRoute("/jobs/$id")({
  loader: ({ params }) => {
    const job = jobs.find((entry) => entry.id === params.id);
    if (!job) throw notFound();
    return { job };
  },
  head: ({ loaderData }) => {
    const job = loaderData?.job;
    if (!job) return { meta: [{ title: "Job not found | SERATEGNA" }] };
    const title = `${job.title} at ${job.company} | SERATEGNA`;
    const description = job.description || `${job.title} opportunity at ${job.company} in ${job.location}.`;
    const canonical = `https://serategna.com.et/jobs/${encodeURIComponent(job.id)}`;
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 300) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 300) },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: JobDetailPage,
});

function JobDetailPage() {
  const { job } = Route.useLoaderData();
  const structuredData = toJobPosting(job);

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />}
      <article className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to jobs</Link>
        <section className="mt-7 rounded-2xl border bg-card p-6 shadow-sm sm:p-9">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BriefcaseBusiness className="h-6 w-6" /></span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{job.title}</h1>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>
            <span>{job.type}</span>
            <span>{job.experience}</span>
            {job.deadline && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Apply by {formatDate(job.deadline)}</span>}
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {job.tags.map((tag) => <span key={tag} className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{tag}</span>)}
          </div>
          <section className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold">About this role</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{job.description || `${job.title} is an opportunity with ${job.company} in ${job.location}. Review the original listing for full requirements and application details.`}</p>
          </section>
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">View original posting and apply <ArrowUpRight className="h-4 w-4" /></a>
          <p className="mt-3 text-xs text-muted-foreground">Application details and requirements are maintained by the original employer or listing site.</p>
        </section>
      </article>
    </main>
  );
}

function toJobPosting(job: Job) {
  if (!job.datePosted) return null;
  const description = job.description || `${job.title} opportunity at ${job.company} in ${job.location}. See the original listing for full details.`;
  const address = {
    "@type": "PostalAddress",
    ...(job.streetAddress ? { streetAddress: job.streetAddress } : {}),
    ...(!job.location.match(/^remote$/i) ? { addressLocality: job.addressLocality || job.location } : {}),
    ...(job.addressRegion ? { addressRegion: job.addressRegion } : {}),
    ...(job.postalCode ? { postalCode: job.postalCode } : {}),
    addressCountry: "ET",
  };
  const location = { "@type": "Place", address };

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    datePosted: job.datePosted,
    ...(job.deadline ? { validThrough: job.deadline } : {}),
    ...(job.baseSalary ? { baseSalary: { "@type": "MonetaryAmount", currency: job.baseSalary.currency, value: { "@type": "QuantitativeValue", ...(job.baseSalary.value !== undefined ? { value: job.baseSalary.value } : {}), ...(job.baseSalary.minValue !== undefined ? { minValue: job.baseSalary.minValue } : {}), ...(job.baseSalary.maxValue !== undefined ? { maxValue: job.baseSalary.maxValue } : {}), ...(job.baseSalary.unitText ? { unitText: job.baseSalary.unitText } : {}) } } } : {}),
    employmentType: job.type === "Internship" ? "INTERN" : job.type === "Contract" ? "CONTRACTOR" : "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: job.company },
    jobLocation: location,
    ...(job.mode === "Remote" ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "Ethiopia" } } : {}),
    url: `https://serategna.com.et/jobs/${encodeURIComponent(job.id)}`,
    identifier: { "@type": "PropertyValue", name: "SERATEGNA", value: job.id },
  };
}

function formatDate(value: string) {
  const parsed = value.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(`${value}T00:00:00Z`) : new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(parsed);
}
