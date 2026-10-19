import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Building2, Clapperboard, Newspaper, Store, UsersRound } from "lucide-react";

export const Route = createFileRoute("/ethiopia")({
  head: () => ({
    meta: [
      { title: "Ethiopia Hub — News, Jobs, Real Estate & More | SERATEGNA" },
      { name: "description", content: "Explore useful Ethiopia resources for news, jobs, real estate, entertainment, classifieds, and business directories." },
      { property: "og:title", content: "Ethiopia Hub | SERATEGNA" },
      { property: "og:description", content: "Useful Ethiopian resources in one place." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "https://serategna.com.et/ethiopia" }],
  }),
  component: EthiopiaHub,
});

const resources = [
  { title: "Ethiopian News", description: "Follow Ethiopian, African, and international current events.", href: "https://www.ezega.com/News", icon: Newspaper, color: "bg-blue-500/10 text-blue-600" },
  { title: "Jobs in Ethiopia", description: "Browse Ethiopian vacancies and discover more job opportunities.", href: "https://www.ezega.com/Jobs/index", icon: BriefcaseBusiness, color: "bg-primary/10 text-primary" },
  { title: "Ethiopia Real Estate", description: "Explore homes, properties for sale, and rentals in Ethiopia.", href: "https://www.ezega.com/RealEstate", icon: Building2, color: "bg-amber-500/10 text-amber-600" },
  { title: "Ethiopia Entertainment", description: "Find Ethiopian videos, communities, blogs, and events.", href: "https://www.ezega.com/Communities", icon: Clapperboard, color: "bg-pink-500/10 text-pink-600" },
  { title: "Ethiopian Classifieds", description: "Browse goods and services, autos, computers, tenders, and more.", href: "https://www.ezega.com/Classifieds", icon: Store, color: "bg-emerald-500/10 text-emerald-600" },
  { title: "Ethiopian Business Directory", description: "Discover Ethiopian businesses and company profiles.", href: "https://businessguide.ezega.com/", icon: UsersRound, color: "bg-violet-500/10 text-violet-600" },
];

function EthiopiaHub() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to SERATEGNA</Link>
        <section className="mt-8 text-center"><span className="inline-flex rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">Ethiopia resources</span><h1 className="text-gradient mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Your Ethiopia hub</h1><p className="mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-lg">Useful starting points for Ethiopian news, jobs, homes, businesses, entertainment, and everyday listings.</p></section>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{resources.map(({ title, description, href, icon: Icon, color }) => <a key={title} href={href} target="_blank" rel="noreferrer" className="group rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"><span className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span><div className="mt-5 flex items-start justify-between gap-3"><h2 className="font-semibold">{title}</h2><ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p><p className="mt-4 text-xs font-medium text-primary">Open resource</p></a>)}</div>
        <p className="mt-8 text-center text-xs text-muted-foreground">SERATEGNA links to third-party resources for convenience. Content and services on those sites belong to their respective publishers.</p>
      </div>
    </main>
  );
}
