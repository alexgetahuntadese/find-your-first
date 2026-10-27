import { createFileRoute, Link } from "@tanstack/react-router";

const title = "Ethiopia Job Application Kit: Tracker and Email Templates";
const description = "Free practical tools for organizing job applications in Ethiopia: an editable application tracker and ready-to-tailor email and messaging templates.";
const canonical = "https://serategna.com.et/job-seeker-toolkit-ethiopia";
const schema = {
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

export const Route = createFileRoute("/job-seeker-toolkit-ethiopia")({
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
    scripts: [{ type: "application/ld+json", children: JSON.stringify(schema) }],
  }),
  component: JobSeekerToolkit,
});

function JobSeekerToolkit() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">← Career guides</Link>
      <article className="mt-5">
        <p className="text-sm text-muted-foreground">Free resource · Ethiopia</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Ethiopia Job Application Kit</h1>
        <p className="mt-4 text-lg text-muted-foreground">Keep applications organized, make each message specific, and remember your next follow-up. These simple files work in common spreadsheet apps and email programs.</p>

        <section className="mt-9 rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold">1. Track each vacancy in one place</h2>
          <p className="mt-2 leading-7">The tracker has fields for employer, role, location, source link, deadline, application status, follow-up date, and next action. Open it in Excel, Google Sheets, or another spreadsheet app. Add one row per role and keep the original vacancy URL so you can verify details later.</p>
          <a href="/downloads/ethiopia-job-application-tracker.csv" download className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Download the application tracker (CSV)</a>
          <p className="mt-3 text-sm text-muted-foreground">Suggested status values: To review, Preparing, Applied, Interview, Offer, Rejected, or Closed. Keep private contact details in a file you control.</p>
        </section>

        <section className="mt-5 rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold">2. Use a short, tailored application message</h2>
          <p className="mt-2 leading-7">The free text kit includes an email application, a short WhatsApp or SMS message for vacancies that explicitly accept those channels, and a polite follow-up. Replace the prompts and remove any claim you cannot support.</p>
          <a href="/downloads/ethiopia-job-application-email-kit.txt" download className="mt-4 inline-flex rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-muted">Download the email and message templates (TXT)</a>
          <div className="mt-5 rounded-lg bg-muted p-4 text-sm leading-6">
            <p className="font-semibold">Quick email structure</p>
            <p className="mt-2"><strong>Subject:</strong> Application - [Role Title] - [Your Name]</p>
            <p className="mt-2">Dear Hiring Team, I am applying for [role] advertised on [source]. My [relevant project or experience] relates to [specific requirement]. My CV is attached. Thank you for your consideration.</p>
            <p className="mt-2 text-muted-foreground">Use the language requested in the vacancy, and keep the message aligned with the attached CV.</p>
          </div>
        </section>

        <section className="mt-5 rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold">3. Make follow-ups useful</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li>Before applying, confirm the closing date and application channel in the original vacancy notice.</li>
            <li>After sending, note the date and any expected next step in your tracker.</li>
            <li>If the employer gave a response timeline, wait until it passes before following up. If none was given, one brief, polite follow-up after a reasonable interval is usually enough.</li>
            <li>Do not repeatedly message recruiters or use WhatsApp unless the employer's notice invites it.</li>
          </ul>
        </section>

        <section className="mt-5 rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold">4. Protect yourself while applying</h2>
          <p className="mt-2 leading-7">Check that the role appears on the employer's official site or a trusted vacancy source, and confirm suspicious requests using contact details found independently. Do not pay an application fee. Send only documents requested for that stage, and share sensitive identity or banking information only through a verified, legitimate hiring process when required.</p>
        </section>

        <p className="mt-8 leading-7">Next: <Link to="/ethiopia-first-job-interview-preparation" className="text-primary underline">prepare for your first job interview</Link>, or <Link to="/blog/first-job-cv-ethiopia" className="text-primary underline">build a first-job CV</Link> with the sample and editable template.</p>
      </article>
    </main>
  );
}
