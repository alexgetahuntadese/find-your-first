import { createFileRoute, Link } from "@tanstack/react-router";
import { posts } from "@/data/posts";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Ethiopia Job Search Guides — CVs, Interviews & Internships | EthioHub.com.et" },
      { name: "description", content: "Practical Ethiopia job search guides for fresh graduates: CVs, interviews, internships, application emails, and scam prevention." },
      { property: "og:title", content: "Ethiopia Job Search Guides | EthioHub.com.et" },
      { property: "og:description", content: "Practical career advice for Ethiopian students and fresh graduates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://serategna.com.et/blog" }],
  }),
  component: Blog,
});

function Blog() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to jobs</Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Ethiopia job search guides</h1>
      <p className="mt-2 text-muted-foreground">Practical advice for CVs, interviews, internships, applications, and starting your career in Ethiopia.</p>
      <article className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Featured guide</p>
        <h2 className="mt-2 text-xl font-semibold">How to Write a CV for Your First Job in Ethiopia</h2>
        <p className="mt-2 text-sm text-muted-foreground">A practical walkthrough, an illustrative sample CV, a downloadable editable template, and application tips for students and new graduates.</p>
        <Link to="/blog/first-job-cv-ethiopia" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">Read the guide →</Link>
      </article>
      <section className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="Free job seeker resources">
        <article className="rounded-xl border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Free toolkit</p>
          <h2 className="mt-2 text-lg font-semibold">Ethiopia Job Application Kit</h2>
          <p className="mt-2 text-sm text-muted-foreground">Download a job application tracker and ready-to-edit email and WhatsApp message templates.</p>
          <Link to="/job-seeker-toolkit-ethiopia" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">Open the toolkit →</Link>
        </article>
        <article className="rounded-xl border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Interview practice</p>
          <h2 className="mt-2 text-lg font-semibold">Prepare for Your First Job Interview</h2>
          <p className="mt-2 text-sm text-muted-foreground">Practice common entry-level questions, structure examples from school or volunteering, and plan thoughtful questions for the employer.</p>
          <Link to="/ethiopia-first-job-interview-preparation" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">Read the interview guide →</Link>
        </article>
      </section>
      <div className="mt-8 space-y-6">
        {posts.map((p) => (
          <article key={p.slug} id={p.slug} className="rounded-xl border bg-card p-5">
            <p className="text-xs text-muted-foreground">{p.date} · {p.read} read</p>
            <h2 className="mt-1 text-xl font-medium">{p.title}</h2>
            <p className="mt-1 text-muted-foreground">{p.excerpt}</p>
            <div className="mt-4 space-y-3 text-sm leading-relaxed">
              {p.body.map((b, i) => <p key={i}>{b}</p>)}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
