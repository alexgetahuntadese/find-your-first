import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BriefcaseBusiness, Building2, Clapperboard, Newspaper, Store, UsersRound, MapPin, Tag, ExternalLink } from "lucide-react";
import { jobs } from "@/data/jobs";
import { latestNews } from "@/data/news";

export const Route = createFileRoute("/ethiopia")({
  head: () => ({
    meta: [
      { title: "Ethiopia Hub — News, Jobs, Real Estate & More | SERATEGNA" },
      { name: "description", content: "Discover Ethiopian news, jobs, real estate, entertainment, classifieds, and business listings in one on-site hub." },
      { property: "og:title", content: "Ethiopia Hub | SERATEGNA" },
      { property: "og:description", content: "Six useful Ethiopian feeds aggregated in one place." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "https://serategna.com.et/ethiopia" }],
  }),
  component: EthiopiaHub,
});

const resources = [
  { id: "news", title: "Ethiopian News", description: "Latest Ethiopian and regional headlines summarized on SERATEGNA.", icon: Newspaper, color: "bg-blue-500/10 text-blue-600" },
  { id: "jobs", title: "Jobs", description: "Fresh graduate jobs, internships, and entry-level vacancies.", icon: BriefcaseBusiness, color: "bg-primary/10 text-primary" },
  { id: "real-estate", title: "Real Estate", description: "Homes, apartments, land, and rental categories in Ethiopia.", icon: Building2, color: "bg-amber-500/10 text-amber-600" },
  { id: "entertainment", title: "Entertainment", description: "New Ethiopian music, films, videos, and community categories.", icon: Clapperboard, color: "bg-pink-500/10 text-pink-600" },
  { id: "classifieds", title: "Classifieds", description: "A simple place to discover Ethiopian goods and services categories.", icon: Store, color: "bg-emerald-500/10 text-emerald-600" },
  { id: "business", title: "Business Directory", description: "Ethiopian businesses and local company profiles in one feed.", icon: UsersRound, color: "bg-violet-500/10 text-violet-600" },
];

const realEstate = [
  ["Luxury Apartment — Bole Dombel", "For sale · Addis Ababa", "ETB 2,500,000"],
  ["Homes for sale in Addis Ababa", "Apartments, houses, condos, and land", "For sale"],
  ["Houses and apartments for rent", "Addis Ababa and other Ethiopian cities", "For rent"],
];

const entertainment = [
  "Saba Andemariam — Awdeamet Eritrean Tigrigna Music",
  "ወጥመድ — Ethiopian movie 2026",
  "Tesfa Getaneh — Shewayew Ethiopian Amharic Music",
  "Yo Mariyos — Bahir Dar Ethiopian Music",
  "Medhanit Tamirat — Zafu Ethiopian Music",
  "Mekonen Ezra — Zemed Ethiopian Tigrigna Music",
];

const classifieds = [
  ["Autos and transport", "Cars, motorcycles, parts, and transport services"],
  ["Computers and electronics", "Phones, computers, accessories, and repairs"],
  ["Goods and services", "Items for sale, rent, trade, and local services"],
  ["Tenders and opportunities", "Public notices, tenders, and business opportunities"],
];

const businesses = [
  "Self Help Development International",
  "TEJUDAN YENUR",
  "YF Textile Fabric Factory",
  "OUSMAN HASSEN DEFFO",
  "APL Commodities",
  "Woven Legacy Handcraft Ethiopia",
  "Aschalew Dish & Electrical Work",
  "Nancon Ready Mix Concrete Supplier",
  "Sodai Foreign Employment Agency",
];

function EthiopiaHub() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to SERATEGNA</Link>
        <section className="mt-8 text-center"><span className="inline-flex rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">Six Ethiopian feeds in one place</span><h1 className="text-gradient mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Your Ethiopia hub</h1><p className="mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-lg">Read, search, and discover Ethiopian news, opportunities, listings, entertainment, and businesses without leaving SERATEGNA.</p></section>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{resources.map(({ id, title, description, icon: Icon, color }) => <a key={id} href={`#${id}`} className="group rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"><span className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span><h2 className="mt-5 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p><p className="mt-4 text-xs font-medium text-primary">View on this page →</p></a>)}</div>

        <div className="mt-14 space-y-12">
          <section id="news" className="scroll-mt-6"><SectionHeading icon={Newspaper} title="Ethiopian News" text="Fresh headlines and short summaries from Ethiopian publishers." /><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{latestNews.slice(0, 6).map((item) => <article key={`${item.source}-${item.title}`} className="rounded-2xl border bg-card p-5"><p className="text-xs font-medium text-primary">{item.source} · {formatDate(item.publishedAt)}</p><h3 className="mt-3 font-semibold leading-6">{item.title}</h3>{item.summary && <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>}</article>)}</div><SourceNote text="Headlines are summarized and attributed; full articles remain the property of their publishers." /></section>

          <section id="jobs" className="scroll-mt-6"><SectionHeading icon={BriefcaseBusiness} title="Jobs" text="Early-career opportunities already indexed inside SERATEGNA." /><div className="mt-5 grid gap-3 md:grid-cols-2">{jobs.slice(0, 6).map((job) => <article key={job.id} className="rounded-2xl border bg-card p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{job.title}</h3><p className="mt-1 text-sm text-muted-foreground">{job.company} · {job.location}</p></div><span className="rounded-full bg-secondary px-2.5 py-1 text-xs">{job.type}</span></div><p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {job.mode} · {job.experience}</p></article>)}</div><Link to="/" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">Search all jobs on SERATEGNA →</Link></section>

          <HubSection id="real-estate" icon={Building2} title="Real Estate" text="Homes, apartments, and rental categories for Ethiopian cities." source="Ezega Real Estate" items={realEstate.map(([title, detail, meta]) => ({ title, detail, meta }))} />
          <HubSection id="entertainment" icon={Clapperboard} title="Entertainment" text="New Ethiopian music, films, and video topics in one feed." source="Ezega Entertainment" items={entertainment.map((title) => ({ title, detail: "Ethiopian music, film, or video", meta: "Entertainment" }))} />
          <HubSection id="classifieds" icon={Store} title="Classifieds" text="Discover useful categories for buying, selling, renting, and trading." source="Ezega Classifieds" items={classifieds.map(([title, detail]) => ({ title, detail, meta: "Classifieds" }))} />
          <HubSection id="business" icon={UsersRound} title="Business Directory" text="Ethiopian companies and local business profiles surfaced in one place." source="Ezega Business Guide" items={businesses.map((title) => ({ title, detail: "Ethiopian business profile", meta: "Business directory" }))} />
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground">SERATEGNA aggregates titles, categories, and short summaries for discovery. Source publishers retain ownership of their content and listings.</p>
      </div>
    </main>
  );
}

function SectionHeading({ icon: Icon, title, text }: { icon: typeof Newspaper; title: string; text: string }) {
  return <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary"><Icon className="h-5 w-5 text-primary-foreground" /></span><div><h2 className="text-2xl font-semibold tracking-tight">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{text}</p></div></div>;
}

function HubSection({ id, icon, title, text, source, items }: { id: string; icon: typeof Newspaper; title: string; text: string; source: string; items: Array<{ title: string; detail: string; meta: string }> }) {
  return <section id={id} className="scroll-mt-6"><SectionHeading icon={icon} title={title} text={text} /><p className="mt-3 text-xs text-muted-foreground">Latest source snapshot · {source}</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article key={item.title} className="rounded-2xl border bg-card p-5"><div className="flex items-center justify-between gap-3"><Tag className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">{item.meta}</span></div><h3 className="mt-4 font-semibold leading-6">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p></article>)}</div></section>;
}

function SourceNote({ text }: { text: string }) {
  return <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><ExternalLink className="h-3.5 w-3.5" />{text}</p>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}
