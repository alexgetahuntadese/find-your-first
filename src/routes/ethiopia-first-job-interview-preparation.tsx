import { createFileRoute, Link } from "@tanstack/react-router";

const title = "How to Prepare for Your First Job Interview in Ethiopia";
const description = "A practical interview preparation guide for Ethiopian students and new graduates, with question prompts, answer planning, and an interview day checklist.";
const canonical = "https://serategna.com.et/ethiopia-first-job-interview-preparation";
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

export const Route = createFileRoute("/ethiopia-first-job-interview-preparation")({
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
  component: InterviewPreparation,
});

const questions = [
  { q: "Tell us about yourself.", prompt: "Give a brief work-focused introduction: what you studied or trained in, one relevant example, and why this role interests you." },
  { q: "Why do you want this position?", prompt: "Connect a real responsibility in the vacancy to a skill or interest you can demonstrate." },
  { q: "What is a project or task you are proud of?", prompt: "Use coursework, volunteering, a student club, family business work, or personal practice. Explain your part and what you learned." },
  { q: "Tell us about a challenge or mistake.", prompt: "Choose a genuine example. Focus on how you responded, what you learned, and what you would do now." },
  { q: "How do you organize competing tasks?", prompt: "Describe a real method, such as listing deadlines, confirming priorities, and updating the person who assigned the work." },
  { q: "What would you like to ask us?", prompt: "Ask about the team's priorities, how success is measured, training, or the next steps in the selection process." },
];

function InterviewPreparation() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">← Career guides</Link>
      <article className="mt-5">
        <p className="text-sm text-muted-foreground">Interview practice · Ethiopia</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">You can give strong examples even without a long employment history. Prepare from real study, volunteer, community, family business, or personal project experience.</p>

        <section className="mt-9">
          <h2 className="text-2xl font-semibold">Plan examples before the interview</h2>
          <p className="mt-2 leading-7">For a behavioral question, organize one true example as Situation, Task, Action, Result, and Learning. Keep the setup short. Spend most of your answer on what <em>you</em> did, and do not invent numbers or outcomes.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["Situation: What was happening?", "Task: What were you responsible for?", "Action: What steps did you personally take?", "Result and learning: What changed, and what did you learn?"].map((item) => <div key={item} className="rounded-lg border bg-card p-4 text-sm leading-6">{item}</div>)}
          </div>
        </section>

        <section className="mt-9">
          <h2 className="text-2xl font-semibold">Practice these questions aloud</h2>
          <div className="mt-4 space-y-4">
            {questions.map(({ q, prompt }) => <div key={q} className="rounded-xl border bg-card p-4 sm:p-5"><h3 className="font-semibold">{q}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{prompt}</p></div>)}
          </div>
        </section>

        <section className="mt-9">
          <h2 className="text-2xl font-semibold">Before the interview</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li>Re-read the vacancy and your CV. Prepare one example for the key requirements.</li>
            <li>Confirm the interview time, format, address or meeting link, and a contact to use if you have trouble joining.</li>
            <li>For an in-person interview, plan your route and travel time. For a phone or online interview, check your connection, sound, battery, and a quiet place in advance.</li>
            <li>Bring or open only the documents requested. Keep your CV and a few notes easy to reach.</li>
            <li>Prepare two questions for the employer. Listen carefully, ask for clarification when needed, and answer honestly.</li>
          </ul>
        </section>

        <section className="mt-9 rounded-xl border border-amber-500/40 bg-amber-500/5 p-5">
          <h2 className="text-xl font-semibold">Check unusual requests</h2>
          <p className="mt-2 leading-7">Confirm the interview and employer using official contact details. Be cautious if someone asks you to pay for an interview, job placement, or guaranteed offer. Do not send banking details or original identity documents through informal channels.</p>
        </section>

        <p className="mt-8 leading-7">For the next step, use the <Link to="/job-seeker-toolkit-ethiopia" className="text-primary underline">job application tracker and message templates</Link>, or see the <Link to="/blog/first-job-cv-ethiopia" className="text-primary underline">first-job CV guide</Link>.</p>
      </article>
    </main>
  );
}
