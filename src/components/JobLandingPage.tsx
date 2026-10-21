import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BriefcaseBusiness, MapPin, Search } from "lucide-react";
import { jobs, postedLabel, type Job } from "@/data/jobs";
import { BrandLogo } from "@/components/BrandLogo";

type LandingKind = "fresh" | "internships" | "addis";

const landingCopy: Record<LandingKind, { title: string; description: string; intro: string; filter: (job: Job) => boolean }> = {
  fresh: {
    title: "Fresh Graduate Jobs in Ethiopia",
    description: "Find fresh graduate, new graduate, and entry-level jobs in Ethiopia. Browse current opportunities for graduates with little or no work experience.",
    intro: "Start your career with new graduate opportunities from employers hiring in Ethiopia. Listings are refreshed regularly from multiple Ethiopian job sources.",
    filter: (job) => job.experience === "New Grad" || job.type === "Full-time Entry Level",
  },
  internships: {
    title: "Internships in Ethiopia",
    description: "Discover internships, paid internships, and student opportunities in Ethiopia across technology, finance, operations, healthcare, and more.",
    intro: "Build experience and meet employers through internship opportunities in Ethiopia. Check each listing for its requirements, location, and application deadline.",
    filter: (job) => job.type === "Internship" || job.experience === "Undergrad" || job.tags.some((tag) => tag.toLowerCase().includes("intern")),
  },
  addis: {
    title: "Entry-Level Jobs in Addis Ababa",
    description: "Browse entry-level and junior jobs in Addis Ababa for fresh graduates and professionals with up to two years of experience.",
    intro: "Explore junior roles in Addis Ababa across technology, finance, sales, administration, healthcare, and operations.",
    filter: (job) => job.location.toLowerCase().includes("addis") && (job.experience !== "Undergrad" || job.type === "Internship"),
  },
};

export function JobLandingPage({ kind }: { kind: LandingKind }) {
  const copy = landingCopy[kind];
  const matchingJobs = jobs.filter(copy.filter).slice(0, 40);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-10 flex items-center justify-between" aria-label="Breadcrumb">
          <Link to="/" aria-label="SERATEGNA home" className="flex w-[148px] shrink-0 items-center"><BrandLogo className="h-8 w-[148px]" /></Link>
          <div className="flex gap-2 text-sm">
            <Link to="/" className="rounded-full border px-3 py-1.5 hover:bg-secondary">All jobs</Link>
          </div>
        </nav>

        <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Ethiopia jobs</p>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{copy.description}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Search className="h-4 w-4" /> Search all jobs</Link>
            <Link to="/blog" className="rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-secondary">Career guides</Link>
          </div>
        </section>

        <section className="mt-10" aria-labelledby="available-jobs">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><h2 id="available-jobs" className="text-2xl font-bold">Latest opportunities</h2><p className="mt-1 text-sm text-muted-foreground">{matchingJobs.length} matching listings from SERATEGNA’s job feed.</p></div>
          </div>
          {matchingJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">New matching jobs are being collected. Check the full job board for the latest listings.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {matchingJobs.map((job) => <LandingJobCard key={job.id} job={job} />)}
            </div>
          )}
        </section>

        <section className="mt-12 grid gap-4 border-t pt-8 sm:grid-cols-3">
          <Link to="/fresh-graduate-jobs-ethiopia" className="rounded-xl border p-4 hover:bg-secondary">Fresh graduate jobs →</Link>
          <Link to="/internships-ethiopia" className="rounded-xl border p-4 hover:bg-secondary">Internships in Ethiopia →</Link>
          <Link to="/entry-level-jobs-addis-ababa" className="rounded-xl border p-4 hover:bg-secondary">Addis Ababa entry-level jobs →</Link>
        </section>
      </div>
    </main>
  );
}

function LandingJobCard({ job }: { job: Job }) {
  return <article className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-muted-foreground">{job.company}</p><h3 className="mt-1 text-lg font-semibold">{job.title}</h3></div><BriefcaseBusiness className="h-5 w-5 shrink-0 text-primary" /></div>
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span><span>{job.type}</span><span>{postedLabel(job.hoursAgo)}</span></div>
    <div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{job.source ? `via ${job.source}` : "SERATEGNA listing"}</span><a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">View and apply <ArrowUpRight className="h-4 w-4" /></a></div>
  </article>;
}
