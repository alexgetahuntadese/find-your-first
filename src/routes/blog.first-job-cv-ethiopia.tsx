import { createFileRoute, Link } from "@tanstack/react-router";
import { jobs, type Job } from "@/data/jobs";

const title = "How to Write a CV for Your First Job in Ethiopia";
const description = "A practical guide for Ethiopian students and fresh graduates, with an illustrative sample CV, an editable download, and application tips.";
const canonical = "https://serategna.com.et/blog/first-job-cv-ethiopia";
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  datePublished: "2026-10-27",
  dateModified: "2026-10-27",
  mainEntityOfPage: canonical,
  author: { "@type": "Organization", name: "Serategna" },
  publisher: { "@type": "Organization", name: "Serategna", url: "https://serategna.com.et" },
};

export const Route = createFileRoute("/blog/first-job-cv-ethiopia")({
  head: () => ({
    meta: [
      { title: `${title} | Serategna` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonical }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(articleSchema) }],
  }),
  component: FirstJobCvGuide,
});

function JobLinks({ items }: { items: Job[] }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">No matching listings are available right now. Check the <Link to="/fresh-graduate-jobs-ethiopia" className="text-primary underline">fresh graduate jobs</Link> and <Link to="/internships-ethiopia" className="text-primary underline">internships</Link> pages for updates.</p>;
  return <ul className="mt-3 space-y-2">{items.map((job) => <li key={job.id} className="rounded-lg border p-3"><Link to="/jobs/$id" params={{ id: job.id }} className="font-medium text-primary hover:underline">{job.title}</Link><span className="text-muted-foreground"> · {job.company} · {job.location}</span></li>)}</ul>;
}

function FirstJobCvGuide() {
  const entryJobs = jobs.filter((job) => job.type === "Full-time Entry Level").slice(0, 4);
  const internships = jobs.filter((job) => job.type === "Internship").slice(0, 4);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">← All career guides</Link>
      <article className="mt-5">
        <header>
          <p className="text-sm text-muted-foreground">Career guide · Ethiopia · 8 minute read</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">Your first CV does not need years of employment history. Show employers what you studied, what you can do, and what you have done with those skills.</p>
          <a href="/downloads/first-job-cv-ethiopia-template.docx" download className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Download the editable CV template (Word)</a>
        </header>

        <div className="mt-10 space-y-9 leading-7">
          <section>
            <h2 className="text-2xl font-semibold">What to put on a first-job CV</h2>
            <p className="mt-3">Keep it concise, easy to scan, and tailored to the vacancy. One page is a good target for a new graduate. Use clear headings and a simple layout that still reads well when printed or opened on a phone.</p>
            <ol className="mt-3 list-decimal space-y-2 pl-6">
              <li><strong>Contact:</strong> your name, phone number, professional email, and city. Add LinkedIn or a portfolio only if it is current.</li>
              <li><strong>Profile:</strong> two or three specific lines about your field, strongest relevant skills, and the type of role you seek.</li>
              <li><strong>Education:</strong> qualification, institution, city, and completion year (or expected graduation). Add relevant coursework if it supports the job.</li>
              <li><strong>Experience and projects:</strong> internships, volunteering, campus roles, freelance work, class projects, or practical assignments. Explain your contribution and outcome honestly.</li>
              <li><strong>Skills and languages:</strong> list tools and job-related abilities you can demonstrate. State language proficiency accurately.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Illustrative sample CV</h2>
            <p className="mt-2 text-sm text-muted-foreground">This is a fictional example for a new accounting graduate. Replace every detail with your own true information; do not claim sample experience, results, or references as yours.</p>
            <div className="mt-4 rounded-xl border bg-card p-5 sm:p-7">
              <h3 className="text-xl font-bold">Mekdes Sample</h3>
              <p className="text-sm text-muted-foreground">Addis Ababa, Ethiopia · +251 9XX XXX XXX · mekdes.sample@email.com</p>
              <h4 className="mt-5 font-semibold">PROFILE</h4>
              <p className="text-sm">Recent accounting graduate seeking a junior accountant or finance assistant role. Familiar with spreadsheet-based bookkeeping, reconciliations, and preparing clear reports through coursework and a supervised student project.</p>
              <h4 className="mt-4 font-semibold">EDUCATION</h4>
              <p className="text-sm"><strong>BA in Accounting and Finance</strong> · Example University, Ethiopia · 2025</p>
              <p className="text-sm">Relevant study: financial accounting, cost accounting, auditing, business statistics.</p>
              <h4 className="mt-4 font-semibold">RELEVANT PROJECT</h4>
              <p className="text-sm"><strong>Student bookkeeping exercise</strong> · University coursework · 2024</p>
              <ul className="list-disc pl-5 text-sm"><li>Entered a set of fictional transactions into a spreadsheet ledger and checked totals.</li><li>Prepared a sample monthly summary and explained discrepancies to a four-person project group.</li></ul>
              <h4 className="mt-4 font-semibold">SKILLS</h4>
              <p className="text-sm">Microsoft Excel (formulas, sorting, basic tables) · document preparation · attention to detail · teamwork</p>
              <h4 className="mt-4 font-semibold">LANGUAGES</h4>
              <p className="text-sm">Amharic · English — describe your actual speaking, reading, and writing levels.</p>
            </div>
            <p className="mt-3 text-sm">The names, institution, contact details, dates, and project above are illustrative placeholders, not a real applicant or employer.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Application tips that help</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Match your profile and skills to the vacancy’s actual requirements. Use relevant terms naturally and give evidence for each skill.</li>
              <li>Put your strongest relevant project or experience near the top. Use short action-and-result bullets, and never invent numbers or achievements.</li>
              <li>Proofread names, phone number, dates, spelling, and email address. Ask someone you trust to review it.</li>
              <li>Export to PDF unless the employer requests another format. Use a clear filename such as <code>Mekdes_Sample_CV_Junior_Accountant.pdf</code>.</li>
              <li>Follow the vacancy’s application instructions and deadline. Send a short, specific email and attach only the requested documents.</li>
              <li>Verify the employer and vacancy through official channels. Do not pay an application or recruitment fee, and share sensitive identity or banking information only through a verified, legitimate hiring process when required.</li>
            </ul>
            <div className="mt-4 rounded-xl bg-muted p-4 text-sm">
              <p><strong>Email subject:</strong> Application — Finance Assistant — Mekdes Sample</p>
              <p className="mt-2"><strong>Message:</strong> Dear Hiring Team, I am applying for the Finance Assistant position. I recently completed a degree in Accounting and Finance and have relevant spreadsheet and bookkeeping coursework. My CV is attached for your consideration. Thank you, Mekdes Sample · +251 9XX XXX XXX.</p>
              <p className="mt-2 text-muted-foreground">Edit this example to reflect your real qualification and the specific vacancy.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Find a role to apply for</h2>
            <p className="mt-2">These links come from listings currently included in our active job feed. Check each employer’s original notice for the latest requirements and deadline before applying.</p>
            <h3 className="mt-5 text-lg font-semibold">Entry-level jobs</h3>
            <JobLinks items={entryJobs} />
            <h3 className="mt-5 text-lg font-semibold">Internships</h3>
            <JobLinks items={internships} />
            <p className="mt-5 text-sm"><Link to="/fresh-graduate-jobs-ethiopia" className="text-primary underline">Browse fresh graduate jobs</Link> · <Link to="/internships-ethiopia" className="text-primary underline">Browse internships in Ethiopia</Link></p>
          </section>
        </div>
      </article>
    </main>
  );
}
