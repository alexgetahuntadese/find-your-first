import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BriefcaseBusiness, Building2, Calculator, Clapperboard, Newspaper, Store, UsersRound, MapPin, Tag, ExternalLink } from "lucide-react";
import { jobs } from "@/data/jobs";
import { latestNews } from "@/data/news";

export const Route = createFileRoute("/ethiopia")({
  head: () => ({
    meta: [
      { title: "Ethiopia Hub — News, Jobs, Real Estate & More | EthioHub.com.et" },
      { name: "description", content: "Discover Ethiopian news, jobs, real estate, entertainment, classifieds, and business listings in one on-site hub." },
      { property: "og:title", content: "Ethiopia Hub | EthioHub.com.et" },
      { property: "og:description", content: "Ethiopian companies, jobs, news, real estate, entertainment, and classifieds in one useful hub." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "https://serategna.com.et/ethiopia" }],
  }),
  component: EthiopiaHub,
});

const resources = [
  { id: "news", title: "Ethiopian News", description: "Latest Ethiopian and regional headlines summarized on EthioHub.com.et.", icon: Newspaper, color: "bg-blue-500/10 text-blue-600" },
  { id: "jobs", title: "Jobs", description: "Fresh graduate jobs, internships, and entry-level vacancies.", icon: BriefcaseBusiness, color: "bg-primary/10 text-primary" },
  { id: "real-estate", title: "Real Estate", description: "Homes, apartments, land, and rental categories in Ethiopia.", icon: Building2, color: "bg-amber-500/10 text-amber-600" },
  { id: "entertainment", title: "Entertainment", description: "New Ethiopian music, films, videos, and community categories.", icon: Clapperboard, color: "bg-pink-500/10 text-pink-600" },
  { id: "classifieds", title: "Classifieds", description: "A simple place to discover Ethiopian goods and services categories.", icon: Store, color: "bg-emerald-500/10 text-emerald-600" },
  { id: "business", title: "Companies in Ethiopia", description: "Ethiopian companies, employers, and local business profiles.", icon: UsersRound, color: "bg-violet-500/10 text-violet-600" },
  { id: "tools", title: "Ethiopian Tools", description: "Calendar converters, tax, currency, and unit tools for everyday use.", icon: Calculator, color: "bg-cyan-500/10 text-cyan-600" },
];

const realEstate: Array<[string, string, string]> = [
  ["Luxury Apartment — Bole Dombel", "For sale · Addis Ababa", "ETB 2,500,000"],
  ["Homes for sale in Addis Ababa", "Apartments, houses, condos, and land", "For sale"],
  ["Houses and apartments for rent", "Addis Ababa and other Ethiopian cities", "For rent"],
];

const entertainment: Array<[string, string]> = [
  ["Saba Andemariam — Awdeamet Eritrean Tigrigna Music", "https://www.youtube.com/results?search_query=Saba+Andemariam+Awdeamet"],
  ["ወጥመድ — Ethiopian movie 2026", "https://www.youtube.com/results?search_query=Ethiopian+movie+2026+%E1%8B%88%E1%8C%A5%E1%88%98%E1%8B%B5"],
  ["Tesfa Getaneh — Shewayew Ethiopian Amharic Music", "https://www.youtube.com/results?search_query=Tesfa+Getaneh+Shewayew"],
  ["Yo Mariyos — Bahir Dar Ethiopian Music", "https://www.youtube.com/results?search_query=Yo+Marios+Bahir+Dar+Ethiopian+Music"],
  ["Medhanit Tamirat — Zafu Ethiopian Music", "https://www.youtube.com/results?search_query=Medhanit+Tamirat+Zafu"],
  ["Mekonen Ezra — Zemed Ethiopian Tigrigna Music", "https://www.youtube.com/results?search_query=Mekonen+Ezra+Zemed"],
];

const classifieds: Array<[string, string]> = [
  ["Autos and transport", "Cars, motorcycles, parts, and transport services"],
  ["Computers and electronics", "Phones, computers, accessories, and repairs"],
  ["Goods and services", "Items for sale, rent, trade, and local services"],
  ["Tenders and opportunities", "Public notices, tenders, and business opportunities"],
];

const tools = [
  { title: "Ethiopian → Gregorian date converter", detail: "Convert Ethiopian calendar dates to their Gregorian equivalents.", meta: "Calendar tool", href: "/calendar" },
  { title: "Gregorian → Ethiopian date converter", detail: "Convert Gregorian dates into the Ethiopian calendar, including Pagumen.", meta: "Calendar tool", href: "/calendar" },
  { title: "Ethiopian salary tax calculator", detail: "Estimate monthly employment tax, pension, and take-home pay in ETB.", meta: "Finance tool", href: "/ethiopian-tax-calculator" },
  { title: "ETB currency converter", detail: "Compare Ethiopian birr with major currencies using the currency tool.", meta: "Finance tool", href: "/currency-converter" },
  { title: "All-unit converter", detail: "Convert length, weight, temperature, volume, speed, data, and more.", meta: "Utility tool", href: "/unit-converter" },
];

const companies = [
  { title: "Ethiopian Airlines", detail: "Ethiopia’s flag carrier and a major aviation, logistics, and travel employer headquartered in Addis Ababa.", meta: "Aviation · Addis Ababa", href: "https://www.ethiopianairlines.com/" },
  { title: "Ethio telecom", detail: "Telecommunications and digital-services provider offering mobile, broadband, enterprise, and digital products across Ethiopia.", meta: "Telecommunications · Ethiopia", href: "https://www.ethiotelecom.et/" },
  { title: "Safaricom Ethiopia", detail: "Technology and communications company providing mobile connectivity, data, enterprise services, and M-PESA.", meta: "Technology · Telecommunications", href: "https://www.safaricom.et/" },
  { title: "Commercial Bank of Ethiopia", detail: "A major Ethiopian bank serving individuals, businesses, and institutions through banking and digital-finance services.", meta: "Banking · Addis Ababa", href: "https://combanketh.et/" },
  { title: "Self Help Development International", detail: "Development organization working with communities and partners on sustainable livelihoods and social impact.", meta: "Development · Ethiopia" },
  { title: "YF Textile Fabric Factory", detail: "Textile and manufacturing business listed in EthioHub.com.et’s Ethiopian business directory.", meta: "Manufacturing · Ethiopia" },
  { title: "APL Commodities", detail: "Ethiopian trading and commodities business listed for local business discovery.", meta: "Trading · Ethiopia" },
  { title: "Woven Legacy Handcraft Ethiopia", detail: "Handcraft and creative-products business supporting local Ethiopian makers and products.", meta: "Handcrafts · Ethiopia" },
  { title: "Nancon Ready Mix Concrete Supplier", detail: "Construction-material supplier serving building and infrastructure needs in Ethiopia.", meta: "Construction · Ethiopia" },
];

function EthiopiaHub() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Your Ethiopia hub — Companies, Jobs, News and Opportunities",
    description: "Discover Ethiopian companies, jobs, news, real estate, entertainment, classifieds, and business listings on EthioHub.com.et.",
    url: "https://serategna.com.et/ethiopia",
    mainEntity: {
      "@type": "ItemList",
      name: "Companies in Ethiopia",
      numberOfItems: companies.length,
      itemListElement: companies.map((company, index) => ({ "@type": "ListItem", position: index + 1, name: company.title, url: company.href || "https://serategna.com.et/ethiopia#business" })),
    },
  };
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to EthioHub.com.et</Link>
        <section className="mt-8 text-center"><span className="inline-flex rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">Ethiopian feeds and useful tools</span><h1 className="text-gradient mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Your Ethiopia hub</h1><p className="mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-lg">Read, search, and discover Ethiopian news, opportunities, listings, entertainment, companies, and practical tools without leaving EthioHub.com.et.</p></section>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{resources.map(({ id, title, description, icon: Icon, color }) => <a key={id} href={`#${id}`} className="group rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"><span className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span><h2 className="mt-5 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p><p className="mt-4 text-xs font-medium text-primary">View on this page →</p></a>)}</div>

        <div className="mt-14 space-y-12">
          <section id="news" className="scroll-mt-6"><SectionHeading icon={Newspaper} title="Ethiopian News" text="Fresh headlines and short summaries from Ethiopian publishers." /><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{latestNews.slice(0, 6).map((item) => <article key={`${item.source}-${item.title}`} className="rounded-2xl border bg-card p-5"><p className="text-xs font-medium text-primary">{item.source} · {formatDate(item.publishedAt)}</p><h3 className="mt-3 font-semibold leading-6">{item.title}</h3>{item.summary && <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>}</article>)}</div><SourceNote text="Headlines are summarized and attributed; full articles remain the property of their publishers." /></section>

          <section id="jobs" className="scroll-mt-6"><SectionHeading icon={BriefcaseBusiness} title="Jobs" text="Early-career opportunities already indexed inside EthioHub.com.et." /><div className="mt-5 grid gap-3 md:grid-cols-2">{jobs.slice(0, 6).map((job) => <article key={job.id} className="rounded-2xl border bg-card p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{job.title}</h3><p className="mt-1 text-sm text-muted-foreground">{job.company} · {job.location}</p></div><span className="rounded-full bg-secondary px-2.5 py-1 text-xs">{job.type}</span></div><p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {job.mode} · {job.experience}</p></article>)}</div><Link to="/" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">Search all jobs on EthioHub.com.et →</Link></section>

          <HubSection id="real-estate" icon={Building2} title="Real Estate" text="Homes, apartments, and rental categories for Ethiopian cities." source="Ezega Real Estate" items={realEstate.map(([title, detail, meta]) => ({ title, detail, meta }))} />
          <HubSection id="entertainment" icon={Clapperboard} title="Entertainment" text="New Ethiopian music, films, and video topics in one feed." source="Ezega Entertainment" items={entertainment.map(([title, href]) => ({ title, href, detail: "Ethiopian music, film, or video", meta: "Entertainment" }))} />
          <HubSection id="classifieds" icon={Store} title="Classifieds" text="Discover useful categories for buying, selling, renting, and trading." source="Ezega Classifieds" items={classifieds.map(([title, detail]) => ({ title, detail, meta: "Classifieds" }))} />
          <HubSection id="tools" icon={Calculator} title="Ethiopian Tools" text="Convert dates between Ethiopian and Gregorian calendars and use practical finance and measurement tools." source="EthioHub.com.et tools" items={tools} />
          <HubSection id="business" icon={UsersRound} title="Companies in Ethiopia" text="Discover Ethiopian companies, employers, and local business profiles in one directory." source="EthioHub.com.et company directory" items={companies} />
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground">EthioHub.com.et aggregates titles, categories, and short summaries for discovery. Source publishers retain ownership of their content and listings.</p>
      </div>
    </main>
  );
}

function SectionHeading({ icon: Icon, title, text }: { icon: typeof Newspaper; title: string; text: string }) {
  return <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary"><Icon className="h-5 w-5 text-primary-foreground" /></span><div><h2 className="text-2xl font-semibold tracking-tight">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{text}</p></div></div>;
}

function HubSection({ id, icon, title, text, source, items }: { id: string; icon: typeof Newspaper; title: string; text: string; source: string; items: Array<{ title: string; detail: string; meta: string; href?: string }> }) {
  return <section id={id} className="scroll-mt-6"><SectionHeading icon={icon} title={title} text={text} /><p className="mt-3 text-xs text-muted-foreground">Latest source snapshot · {source}</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <HubCard key={item.title} item={item} />)}</div></section>;
}

function HubCard({ item }: { item: { title: string; detail: string; meta: string; href?: string } }) {
  const content = <><div className="flex items-center justify-between gap-3"><Tag className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">{item.meta}</span></div><h3 className="mt-4 font-semibold leading-6">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>{item.href && <p className="mt-4 text-xs font-medium text-primary">{item.href.startsWith("/") ? "Open tool" : item.href.includes("youtube.com") ? "Find on YouTube" : "Visit official website"} ↗</p>}</>;
  return item.href ? <a href={item.href} target="_blank" rel="noreferrer" className="rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/30">{content}</a> : <article className="rounded-2xl border bg-card p-5">{content}</article>;
}

function SourceNote({ text }: { text: string }) {
  return <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><ExternalLink className="h-3.5 w-3.5" />{text}</p>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}
