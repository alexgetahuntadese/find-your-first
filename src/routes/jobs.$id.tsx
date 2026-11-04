import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, CalendarDays, MapPin, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { jobs, type Job } from "@/data/jobs";
import { getPublishedJob, submitApplication } from "@/lib/jobs";

export const Route = createFileRoute("/jobs/$id")({
  loader: async ({ params }) => {
    const job = jobs.find((entry) => entry.id === params.id) || await getPublishedJob(params.id);
    if (!job) throw notFound();
    return { job };
  },
  head: ({ loaderData }) => {
    const job = loaderData?.job;
    if (!job) return { meta: [{ title: "Job not found | EthioHub.com.et" }] };
    const title = `${job.title} at ${job.company} | EthioHub.com.et`;
    const description = job.description || `${job.title} opportunity at ${job.company} in ${job.location}.`;
    const canonical = `https://serategna.com.et/jobs/${encodeURIComponent(job.id)}`;
    return {
      meta: [
        { title }, { name: "description", content: description.slice(0, 300) },
        { property: "og:title", content: title }, { property: "og:description", content: description.slice(0, 300) },
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState("");
  const [note, setNote] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const apply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!job.applyOnSite || !resume) return;
    try {
      setSubmitting(true);
      await submitApplication({ jobId: job.id, name, email, phone, education, note, resume });
      setSubmitted(true);
      toast.success("Your application has been submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit your application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />}
      <article className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to jobs</Link>
        <section className="mt-7 rounded-2xl border bg-card p-6 shadow-sm sm:p-9">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BriefcaseBusiness className="h-6 w-6" /></span>
            <div className="min-w-0">
              {job.applyOnSite && <p className="text-xs font-semibold uppercase tracking-wide text-primary">Original EthioHub opportunity</p>}
              <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{job.title}</h1>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>
            <span>{job.type}</span><span>{job.experience}</span><span>{job.mode}</span>
            <span>{job.pay}</span>
            {job.deadline && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Apply by {formatDate(job.deadline)}</span>}
          </div>
          <div className="mt-7 flex flex-wrap gap-2">{job.tags.map((tag) => <span key={tag} className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{tag}</span>)}</div>
          <section className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold">About this role</h2>
            {(() => {
              const fullDescription = job.description || `${job.title} is an opportunity with ${job.company} in ${job.location}. Review the original listing for full requirements and application details.`;
              const preview = descriptionPreview(fullDescription);
              const hasMore = preview !== fullDescription.replace(/\\s+/g, " ").trim();
              return (
                <>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{preview}</p>
                  {hasMore && (
                    <details className="mt-4 rounded-xl border bg-background/50 px-4 py-3">
                      <summary className="cursor-pointer text-sm font-medium text-primary">Read full job description</summary>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{fullDescription}</p>
                    </details>
                  )}
                </>
              );
            })()}
          </section>
          {job.applyOnSite ? (
            <section id="apply" className="mt-8 rounded-xl border bg-background/70 p-5 sm:p-6">
              <h2 className="text-xl font-semibold">Apply for this role</h2>
              <p className="mt-1 text-sm text-muted-foreground">Share your contact details and attach a CV to apply directly on EthioHub.</p>
              {submitted ? <div role="status" className="mt-5 flex gap-3 rounded-lg bg-primary/10 p-4 text-sm"><CheckCircle2 className="h-5 w-5 shrink-0 text-primary" /><span>Application received. The hiring team can now review your details and CV.</span></div> : <form onSubmit={apply} className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm">Full name<input required autoComplete="name" minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" /></label>
                <label className="text-sm">Email<input required type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" /></label>
                <label className="text-sm">Phone<input required type="tel" autoComplete="tel" minLength={5} maxLength={40} value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 w-full rounded-lg border bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" /></label>
                <label className="text-sm">Education or experience<input required maxLength={160} value={education} onChange={(event) => setEducation(event.target.value)} placeholder="e.g. BSc Computer Science, 2025" className="mt-1.5 w-full rounded-lg border bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" /></label>
                <label className="text-sm sm:col-span-2">Short note <span className="text-muted-foreground">(optional)</span><textarea maxLength={2000} rows={4} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tell the hiring team why this role interests you." className="mt-1.5 w-full resize-y rounded-lg border bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" /></label>
                <label className="text-sm sm:col-span-2">CV (PDF or DOCX, up to 5 MB)<input required type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setResume(event.target.files?.[0] || null)} className="mt-1.5 block w-full rounded-lg border bg-card px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm" /><span className="mt-1 block text-xs text-muted-foreground">Your CV is stored privately and can only be viewed by the hiring administrator.</span></label>
                <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground sm:col-span-2"><input required type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-primary" /><span>I agree to share these details and my CV with the EthioHub hiring administrator to review this application. See the <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>.</span></label>
                <button disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60 sm:col-span-2 sm:justify-self-start"><Upload className="h-4 w-4" />{submitting ? "Submitting…" : "Submit application"}</button>
              </form>}
            </section>
          ) : <><a href={job.url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">View original posting and apply <ArrowUpRight className="h-4 w-4" /></a><p className="mt-3 text-xs text-muted-foreground">Application details and requirements are maintained by the original employer or listing site.</p></>}
        </section>
      </article>
    </main>
  );
}

function descriptionPreview(description: string, limit = 420) {
  const normalized = description.replace(/\\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;

  const sample = normalized.slice(0, limit + 1);
  const sentenceEnd = Math.max(sample.lastIndexOf(". "), sample.lastIndexOf("? "), sample.lastIndexOf("! "));
  const cutAt = sentenceEnd >= limit * 0.55 ? sentenceEnd + 1 : sample.lastIndexOf(" ");
  return normalized.slice(0, cutAt > 0 ? cutAt : limit).trimEnd() + "…";
}

function toJobPosting(job: Job) {
  if (!job.datePosted) return null;
  const description = job.description || `${job.title} opportunity at ${job.company} in ${job.location}. See the original listing for full details.`;
  const address = { "@type": "PostalAddress", ...(!job.location.match(/^remote$/i) ? { addressLocality: job.addressLocality || job.location } : {}), ...(job.addressRegion ? { addressRegion: job.addressRegion } : {}), ...(job.postalCode ? { postalCode: job.postalCode } : {}), addressCountry: "ET" };
  return {
    "@context": "https://schema.org", "@type": "JobPosting", title: job.title, description,
    datePosted: job.datePosted,
    ...(job.deadline ? { validThrough: /^\d{4}-\d{2}-\d{2}$/.test(job.deadline) ? `${job.deadline}T23:59:59+03:00` : job.deadline } : {}),
    ...(job.baseSalary ? { baseSalary: { "@type": "MonetaryAmount", currency: job.baseSalary.currency, value: { "@type": "QuantitativeValue", ...(job.baseSalary.value !== undefined ? { value: job.baseSalary.value } : {}), ...(job.baseSalary.minValue !== undefined ? { minValue: job.baseSalary.minValue } : {}), ...(job.baseSalary.maxValue !== undefined ? { maxValue: job.baseSalary.maxValue } : {}), ...(job.baseSalary.unitText ? { unitText: job.baseSalary.unitText } : {}) } } } : {}),
    employmentType: job.type === "Internship" ? "INTERN" : job.type === "Contract" ? "CONTRACTOR" : "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: job.company }, jobLocation: { "@type": "Place", address },
    ...(job.mode === "Remote" ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "Ethiopia" } } : {}),
    ...(job.applyOnSite ? { directApply: true } : {}),
    url: `https://serategna.com.et/jobs/${encodeURIComponent(job.id)}`,
    identifier: { "@type": "PropertyValue", name: "EthioHub.com.et", value: job.id },
  };
}

function formatDate(value: string) {
  const parsed = value.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(`${value}T00:00:00Z`) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(parsed);
}
