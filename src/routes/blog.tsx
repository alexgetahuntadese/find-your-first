import { createFileRoute, Link } from "@tanstack/react-router";
import { posts } from "@/data/posts";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Fresh Graduate Career Blog — SERATEGNA" },
      { name: "description", content: "Career advice for fresh graduates in Ethiopia: CVs, interviews, internships and landing your first job." },
      { property: "og:title", content: "Fresh Graduate Career Blog — SERATEGNA" },
      { property: "og:description", content: "Career advice for fresh graduates in Ethiopia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Blog,
});

function Blog() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to jobs</Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Fresh Graduate Career Blog</h1>
      <p className="mt-2 text-muted-foreground">Practical advice for starting your career in Ethiopia.</p>
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
