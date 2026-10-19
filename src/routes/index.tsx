import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Briefcase, Heart, ArrowUpRight, SlidersHorizontal, X, Sparkles, Rocket, Moon, Sun, ChevronDown, CalendarDays, ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";
import { jobs, postedLabel, type Job, type Experience, type Industry } from "@/data/jobs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jobs in Ethiopia — Internships & Entry-Level Roles | SERATEGNA" },
      { name: "description", content: "Find daily internships, fresh graduate jobs, and entry-level opportunities in Ethiopia, Addis Ababa, and remote roles." },
      { property: "og:title", content: "Jobs in Ethiopia — Internships & Entry-Level Roles" },
      { property: "og:description", content: "Daily opportunities for students, fresh graduates, and junior professionals in Ethiopia." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://serategna.com.et/" },
      { property: "og:image", content: "https://serategna.com.et/og-image.svg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://serategna.com.et/og-image.svg" },
    ],
    links: [{ rel: "canonical", href: "https://serategna.com.et/" }],
  }),
  component: Index,
});

const PILLS = ["Remote", "Software Engineering", "Data Analytics", "Paid Internships", "New Today"] as const;
const TABS = [
  { id: "all", label: "All Roles" },
  { id: "intern", label: "Internships & Externships" },
  { id: "entry", label: "Fresh Graduate / Entry Level" },
  { id: "featured", label: "Featured / Top Companies" },
] as const;
const EXPERIENCE: Experience[] = ["Undergrad", "New Grad", "0-2 Years"];
const INDUSTRIES: Industry[] = ["Tech", "Design", "Finance", "Healthcare", "Operations"];

function toggle<T>(arr: T[], v: T) {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function Index() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [type, setType] = useState("");
  const [pills, setPills] = useState<string[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [exp, setExp] = useState<Experience[]>([]);
  const [ind, setInd] = useState<Industry[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("launchboard-theme");
    const nextTheme = storedTheme ? storedTheme === "dark" : false;
    setDarkMode(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme);
    try { setSaved(JSON.parse(localStorage.getItem("saved-jobs") || "[]")); } catch {}
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, [tab, pills, exp, ind, type, loc]);

  const toggleSave = (id: string) => {
    const next = toggle(saved, id);
    setSaved(next);
    localStorage.setItem("saved-jobs", JSON.stringify(next));
    toast(next.includes(id) ? "Saved to your list" : "Removed from saved");
  };

  const toggleTheme = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme);
    localStorage.setItem("launchboard-theme", nextTheme ? "dark" : "light");
  };

  const shareSite = async () => {
    const shareData = { title: "SERATEGNA — Jobs in Ethiopia", text: "Find internships and entry-level jobs in Ethiopia on SERATEGNA.", url: window.location.origin };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(shareData.url); toast.success("SERATEGNA link copied"); }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Could not share the site");
    }
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return jobs.filter((j) => {
      if (term && !`${j.title} ${j.company} ${j.tags.join(" ")}`.toLowerCase().includes(term)) return false;
      if (loc === "Remote" && j.mode !== "Remote") return false;
      if (loc === "Onsite" && j.mode === "Remote") return false;
      if (loc && !["Remote", "Onsite"].includes(loc) && !j.location.toLowerCase().includes(loc.toLowerCase())) return false;
      if (type && j.type !== type) return false;
      if (tab === "intern" && j.type !== "Internship") return false;
      if (tab === "entry" && j.type !== "Full-time Entry Level") return false;
      if (tab === "featured" && !j.featured) return false;
      if (pills.includes("Remote") && j.mode !== "Remote") return false;
      if (pills.includes("Software Engineering") && j.category !== "Software Engineering") return false;
      if (pills.includes("Data Analytics") && j.category !== "Data Analytics") return false;
      if (pills.includes("Paid Internships") && !(j.type === "Internship" && j.paid)) return false;
      if (pills.includes("New Today") && j.hoursAgo >= 24) return false;
      if (exp.length && !exp.includes(j.experience)) return false;
      if (ind.length && !ind.includes(j.industry)) return false;
      return true;
    });
  }, [q, loc, type, tab, pills, exp, ind]);

  const clearAll = () => { setExp([]); setInd([]); setPills([]); setQ(""); setLoc(""); setType(""); };

  const sidebar = (
    <div className="space-y-6">
      <FilterGroup title="Experience level" items={EXPERIENCE} selected={exp} onToggle={(v) => setExp(toggle(exp, v))} />
      <FilterGroup title="Industry" items={INDUSTRIES} selected={ind} onToggle={(v) => setInd(toggle(ind, v))} />
      <button onClick={clearAll} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Clear all filters</button>
      <div className="rounded-xl border bg-gradient-primary/10 p-4 bg-card">
        <p className="text-sm font-medium">Get new roles daily</p>
        <p className="mt-1 text-xs text-muted-foreground">Fresh picks in your inbox every morning.</p>
        <form onSubmit={(e) => { e.preventDefault(); toast.success("You're on the list!"); (e.target as HTMLFormElement).reset(); }} className="mt-3 flex gap-2">
          <input required type="email" placeholder="you@aau.edu.et" className="min-w-0 flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button className="rounded-md bg-gradient-primary px-3 text-sm font-medium text-primary-foreground">Join</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-primary shadow-glow"><Rocket className="h-4 w-4 text-primary-foreground" /></span>
            SERATEGNA
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden items-center gap-1 text-muted-foreground sm:flex"><Heart className="h-4 w-4" />{saved.length} saved</span>
            <button onClick={toggleTheme} aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`} title={`Switch to ${darkMode ? "light" : "dark"} mode`} className="grid h-9 w-9 place-items-center rounded-full border transition-colors hover:bg-secondary">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="relative">
              <button onClick={() => setExploreOpen((open) => !open)} aria-expanded={exploreOpen} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 transition-colors hover:bg-secondary"><span className="hidden sm:inline">Explore Ethiopia</span><span className="sm:hidden">Explore</span><ChevronDown className={`h-4 w-4 transition-transform ${exploreOpen ? "rotate-180" : ""}`} /></button>
              {exploreOpen && <>
                <button aria-label="Close explore menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setExploreOpen(false)} />
                <nav className="absolute right-0 z-50 mt-2 w-56 rounded-xl border bg-card p-2 text-left shadow-xl">
                  <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Ethiopia hub</p>
                  <a href="/ethiopia#news" onClick={() => setExploreOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Ethiopian News</a>
                  <a href="/#feed" onClick={() => setExploreOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Jobs</a>
                  <a href="/ethiopia#real-estate" onClick={() => setExploreOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Real Estate</a>
                  <a href="/ethiopia#entertainment" onClick={() => setExploreOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Entertainment</a>
                  <a href="/ethiopia#classifieds" onClick={() => setExploreOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Classifieds</a>
                  <a href="/ethiopia#business" onClick={() => setExploreOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">Business Directory</a>
                </nav>
              </>}
            </div>
            <button onClick={shareSite} aria-label="Share SERATEGNA" title="Share SERATEGNA" className="grid h-9 w-9 place-items-center rounded-full border transition-colors hover:bg-secondary"><Share2 className="h-4 w-4" /></button>
            <button onClick={() => navigate({ to: "/post" })} className="rounded-full bg-gradient-primary px-3 py-1.5 font-medium text-primary-foreground transition-transform hover:scale-[1.02]">Post a job</button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b">
        <div className="bg-hero-glow absolute inset-0" />
        <div className="bg-grid absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> {jobs.filter((j) => j.hoursAgo < 24).length} new roles added today
          </span>
          <h1 className="text-gradient mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
            Jobs in Ethiopia for your first opportunity.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground sm:text-lg">
            Find internships, fresh graduate jobs, and entry-level roles in Addis Ababa, across Ethiopia, and remotely.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" }); }}
            className="mx-auto mt-8 grid gap-2 rounded-2xl border bg-card/80 p-2 text-left shadow-glow backdrop-blur sm:grid-cols-[1.4fr_1fr_1fr_auto]">
            <label className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-secondary/60">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title or keyword" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </label>
            <label className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-secondary/60">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input list="locs" value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Remote, city, on-site" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              <datalist id="locs"><option value="Remote" /><option value="Onsite" /><option value="Addis Ababa" /><option value="Oromia" /></datalist>
            </label>
            <label className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-secondary/60">
              <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-transparent text-sm outline-none [&>option]:bg-card">
                <option value="">Any job type</option>
                <option>Internship</option>
                <option>Full-time Entry Level</option>
                <option>Contract</option>
              </select>
            </label>
            <button className="rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95">Search</button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {PILLS.map((p) => (
              <button key={p} onClick={() => setPills(toggle(pills, p))}
                className={cn("rounded-full border px-3.5 py-1.5 text-sm transition-all",
                  pills.includes(p) ? "border-transparent bg-gradient-primary text-primary-foreground shadow-glow" : "bg-card/50 text-muted-foreground hover:border-primary/50 hover:text-foreground")}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main id="feed" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10">
        <div className="-mx-4 mb-6 flex gap-1 overflow-x-auto px-4 pb-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("whitespace-nowrap rounded-lg px-3.5 py-2 text-sm transition-colors",
                tab === t.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block"><div className="sticky top-20">{sidebar}</div></aside>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{loading ? "Loading…" : `${filtered.length} roles`}</p>
              <button onClick={() => setDrawer(true)} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters{exp.length + ind.length ? ` (${exp.length + ind.length})` : ""}
              </button>
            </div>

            <div className="space-y-3">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : filtered.length === 0
                  ? <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No roles match. <button onClick={clearAll} className="text-primary underline-offset-4 hover:underline">Reset filters</button></div>
                  : filtered.map((j) => <JobCard key={j.id} job={j} saved={saved.includes(j.id)} onSave={() => toggleSave(j.id)} />)}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© 2026 SERATEGNA · Built for early-career talent · <button onClick={() => navigate({ to: "/blog" })} className="text-primary hover:underline">Career guides</button></footer>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-scrim backdrop-blur-sm animate-in fade-in" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t bg-card p-5 animate-in slide-in-from-bottom">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-medium">Filters</p>
              <button onClick={() => setDrawer(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            {sidebar}
            <button onClick={() => setDrawer(false)} className="mt-6 w-full rounded-xl bg-gradient-primary py-3 text-sm font-medium text-primary-foreground">Show {filtered.length} roles</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup<T extends string>({ title, items, selected, onToggle }: { title: string; items: T[]; selected: T[]; onToggle: (v: T) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="space-y-1">
        {items.map((it) => (
          <label key={it} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-secondary/60">
            <input type="checkbox" checked={selected.includes(it)} onChange={() => onToggle(it)} className="h-4 w-4 accent-primary" />
            {it}
          </label>
        ))}
      </div>
    </div>
  );
}

function JobCard({ job, saved, onSave }: { job: Job; saved: boolean; onSave: () => void }) {
  const isNew = job.hoursAgo < 24;
  return (
    <article className="group relative rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow sm:p-5 animate-in fade-in slide-in-from-bottom-1">
      <div className="flex gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-sm font-semibold text-primary-foreground"
          style={{ background: `linear-gradient(135deg, oklch(0.6 0.18 ${job.hue}), oklch(0.45 0.18 ${job.hue + 40}))` }}>
          {job.company.split(" ").map((w) => w[0]).join("").slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {job.company}
            {job.source && <span className="text-xs">· via {job.source}</span>}
            {job.featured && <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">Featured</span>}
          </div>
          <h3 className="mt-0.5 font-medium leading-snug">{job.title}</h3>
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs">
            <Badge><MapPin className="h-3 w-3" />{job.location}</Badge>
            <Badge>{job.mode}</Badge>
            <Badge className="border-primary/30 text-primary">{job.pay}</Badge>
            <Badge>{postedLabel(job.hoursAgo)}</Badge>
            {isNew && <span className="rounded-md bg-success/15 px-2 py-0.5 font-semibold text-success">NEW</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.tags.map((t) => <span key={t} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{t}</span>)}
          </div>
          {job.description && <details className="mt-3 rounded-lg border bg-background/60 px-3 py-2 text-sm"><summary className="cursor-pointer font-medium">View job details</summary><p className="mt-2 leading-6 text-muted-foreground">{job.description}</p>{job.deadline && <p className="mt-2 flex items-center gap-1.5 text-xs text-foreground"><CalendarDays className="h-3.5 w-3.5" /> Deadline: {formatDeadline(job.deadline)}</p>}</details>}
        </div>
      </div>
      <div className="mt-4 flex gap-2 sm:absolute sm:right-5 sm:top-5 sm:mt-0 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <button onClick={onSave} aria-label="Quick save"
          className={cn("grid h-9 w-9 place-items-center rounded-lg border transition-all active:scale-90", saved ? "border-destructive/40 text-destructive" : "hover:bg-secondary")}>
          <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        </button>
        <a href={job.url} target="_blank" rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-primary px-4 text-sm font-medium text-primary-foreground sm:flex-none">
          Apply{job.source ? ` on ${job.source}` : " now"} <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      {saved && <Heart className="absolute right-4 top-4 hidden h-4 w-4 fill-current text-destructive sm:block sm:group-hover:hidden" />}
    </article>
  );
}

function formatDeadline(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-muted-foreground", className)}>{children}</span>;
}

function SkeletonCard() {
  return (
    <div className="flex gap-4 rounded-xl border bg-card p-5">
      <div className="h-11 w-11 animate-pulse rounded-lg bg-muted" />
      <div className="flex-1 space-y-2.5">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="flex gap-2"><div className="h-5 w-20 animate-pulse rounded bg-muted" /><div className="h-5 w-16 animate-pulse rounded bg-muted" /></div>
      </div>
    </div>
  );
}
