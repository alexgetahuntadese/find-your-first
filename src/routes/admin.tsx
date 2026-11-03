import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, Check, Clock3, LogOut, ShieldCheck, X, Plus, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { clearSession, getSession, refreshSession, type PendingJob } from "@/lib/auth";
import { createOriginalJob, getResumeLink, listApplications, listJobs, listOriginalJobs, updateJob, updateOriginalJobStatus, type JobApplication } from "@/lib/jobs";
import type { Job } from "@/data/jobs";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type AdminOriginalJob = Job & { status: "draft" | "published" | "closed"; created_at: string };
const jobTypes: Job["type"][] = ["Internship", "Full-time Entry Level", "Contract"];
const workModes: Job["mode"][] = ["Onsite", "Hybrid", "Remote"];
const experienceLevels: Job["experience"][] = ["Undergrad", "New Grad", "0-2 Years"];
const industries: Job["industry"][] = ["Tech", "Design", "Finance", "Healthcare", "Marketing", "Operations"];
const categories: Job["category"][] = ["Software Engineering", "Data Analytics", "Design", "Marketing", "Finance", "Healthcare", "Operations"];

function AdminPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<PendingJob[]>([]);
  const [originals, setOriginals] = useState<AdminOriginalJob[]>([]);
  const [applications, setApplications] = useState<Array<JobApplication & { original_jobs: { title: string; company: string } }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("Addis Ababa");
  const [type, setType] = useState<Job["type"]>("Full-time Entry Level");
  const [mode, setMode] = useState<Job["mode"]>("Onsite");
  const [experience, setExperience] = useState<Job["experience"]>("New Grad");
  const [industry, setIndustry] = useState<Job["industry"]>("Tech");
  const [category, setCategory] = useState<Job["category"]>("Software Engineering");
  const [pay, setPay] = useState("");
  const [paid, setPaid] = useState(false);
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const load = useCallback(async () => {
    const user = await refreshSession();
    if (!user || user.role !== "admin" || !user.accessToken) { navigate({ to: "/auth" }); return; }
    const [community, own, applicants] = await Promise.all([listJobs(user.accessToken), listOriginalJobs(user.accessToken), listApplications(user.accessToken)]);
    setItems(community);
    setOriginals(own);
    setApplications(applicants);
  }, [navigate]);

  useEffect(() => { load().catch((error) => toast.error(error instanceof Error ? error.message : "Could not load admin dashboard")).finally(() => setLoading(false)); }, [load]);

  const updateCommunityJob = async (id: string, status: PendingJob["status"]) => {
    const user = getSession();
    if (!user?.accessToken) return;
    try { await updateJob(user.accessToken, id, status); setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item)); toast.success(`Job ${status}`); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not update this job"); }
  };

  const publish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = getSession();
    if (!user?.accessToken || !user.id) { toast.error("Please sign in again"); return; }
    if (description.trim().length < 80) { toast.error("Add at least 80 characters of accurate job details"); return; }
    try {
      setSaving(true);
      await createOriginalJob(user.accessToken, user.id, {
        title: title.trim(), company: company.trim(), location: location.trim(), type, mode, experience, industry, category,
        pay: pay.trim() || "Not specified", paid: type === "Internship" && paid,
        tags: [...new Set(tags.split(",").map((tag) => tag.trim()).filter(Boolean))].slice(0, 10),
        description: description.trim(), deadline: deadline || null,
      });
      toast.success("Original job published and added to the public sitemap");
      setTitle(""); setCompany(""); setPay(""); setTags(""); setDescription(""); setDeadline(""); setPaid(false);
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not publish this job"); }
    finally { setSaving(false); }
  };

  const closeJob = async (item: AdminOriginalJob) => {
    const user = getSession();
    if (!user?.accessToken) return;
    const status = item.status === "published" ? "closed" : "published";
    try {
      await updateOriginalJobStatus(user.accessToken, item.id, status);
      setOriginals((current) => current.map((job) => job.id === item.id ? { ...job, status } : job));
      toast.success(status === "closed" ? "Job closed and removed from public pages" : "Job republished");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update this job"); }
  };

  const openResume = async (application: JobApplication) => {
    const user = getSession();
    if (!user?.accessToken) return;
    try { const url = await getResumeLink(user.accessToken, application.resume_path); window.open(url, "_blank", "noopener,noreferrer"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not open CV"); }
  };

  const signOut = () => { clearSession(); navigate({ to: "/" }); };
  const pending = items.filter((item) => item.status === "pending");

  return <main className="min-h-screen bg-background px-4 py-8"><div className="mx-auto max-w-5xl">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to jobs</Link><h1 className="mt-5 flex items-center gap-2 text-3xl font-semibold"><ShieldCheck className="h-7 w-7 text-primary" /> Admin dashboard</h1><p className="mt-1 text-sm text-muted-foreground">Publish verified original opportunities and review applications.</p></div><button onClick={signOut} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-secondary"><LogOut className="h-4 w-4" /> Sign out</button></header>
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><Stat label="Pending employer posts" value={pending.length} icon={<Clock3 className="h-4 w-4" />} /><Stat label="Published original jobs" value={originals.filter((job) => job.status === "published").length} icon={<Check className="h-4 w-4" />} /><Stat label="Applications" value={applications.length} icon={<FileText className="h-4 w-4" />} /></div>

    <section className="mt-8 rounded-2xl border bg-card p-5 sm:p-7"><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Plus className="h-5 w-5" /></span><div><h2 className="font-semibold">Publish an original job</h2><p className="mt-1 text-sm text-muted-foreground">Add a real, verified vacancy with specific details. Published roles get their own searchable page and JobPosting structured data.</p></div></div>
      <form onSubmit={publish} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Job title"><input required minLength={3} maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Junior software developer" className={inputClass} /></Field>
        <Field label="Company"><input required minLength={2} maxLength={120} value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company name" className={inputClass} /></Field>
        <Field label="Location"><input required minLength={2} maxLength={120} value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Addis Ababa or Remote" className={inputClass} /></Field>
        <Field label="Job type"><select value={type} onChange={(event) => setType(event.target.value as Job["type"])} className={inputClass}>{jobTypes.map((value) => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Work mode"><select value={mode} onChange={(event) => setMode(event.target.value as Job["mode"])} className={inputClass}>{workModes.map((value) => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Experience"><select value={experience} onChange={(event) => setExperience(event.target.value as Job["experience"])} className={inputClass}>{experienceLevels.map((value) => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Industry"><select value={industry} onChange={(event) => setIndustry(event.target.value as Job["industry"])} className={inputClass}>{industries.map((value) => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Category"><select value={category} onChange={(event) => setCategory(event.target.value as Job["category"])} className={inputClass}>{categories.map((value) => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Salary or stipend"><input maxLength={80} value={pay} onChange={(event) => setPay(event.target.value)} placeholder="e.g. 15,000–20,000 ETB/month" className={inputClass} /></Field>
        <Field label="Application deadline"><input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className={inputClass} /></Field>
        <Field label="Skills / tags (comma separated)" full><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Excel, customer service, Amharic" className={inputClass} /></Field>
        {type === "Internship" && <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={paid} onChange={(event) => setPaid(event.target.checked)} className="h-4 w-4 accent-primary" /> Paid internship</label>}
        <Field label="Full job details" full><textarea required minLength={80} maxLength={5000} rows={9} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Write original, specific job details: responsibilities, required qualifications, benefits, how to apply, and the employer's verified contact or application process." className={`${inputClass} resize-y`} /><span className="text-xs text-muted-foreground">{description.length}/5000 characters</span></Field>
        <div className="flex items-center justify-between gap-4 sm:col-span-2"><p className="text-xs text-muted-foreground">Applications are collected on this site. Publish only roles that are currently open and verified.</p><button disabled={saving} className="shrink-0 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving ? "Publishing…" : "Publish job"}</button></div>
      </form>
    </section>

    <section className="mt-8 rounded-2xl border bg-card p-5"><h2 className="font-semibold">Original jobs</h2><div className="mt-4 space-y-3">{loading ? <p className="p-6 text-center text-sm text-muted-foreground">Loading jobs…</p> : originals.length === 0 ? <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No original jobs yet. Publish a verified opportunity above.</p> : originals.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"><div><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.company} · {item.location} · Posted {new Date(item.datePosted || item.created_at).toLocaleDateString()}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize">{item.status}</span><button onClick={() => closeJob(item)} className="rounded-lg border px-3 py-2 text-sm hover:bg-secondary">{item.status === "published" ? "Close job" : "Republish"}</button>{item.status === "published" && <Link to="/jobs/$id" params={{ id: item.id }} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">View <ExternalLink className="h-3.5 w-3.5" /></Link>}</div></article>)}</div></section>

    <section className="mt-8 rounded-2xl border bg-card p-5"><h2 className="font-semibold">On-site applications</h2><p className="mt-1 text-sm text-muted-foreground">Applicant details are private. CV links expire after 10 minutes.</p><div className="mt-4 space-y-3">{loading ? <p className="p-6 text-center text-sm text-muted-foreground">Loading applications…</p> : applications.length === 0 ? <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No applications yet.</p> : applications.map((app) => <article key={app.id} className="flex flex-wrap items-start justify-between gap-4 rounded-xl border p-4"><div className="min-w-0"><p className="font-medium">{app.name} <span className="font-normal text-muted-foreground">· {app.original_jobs.title} at {app.original_jobs.company}</span></p><p className="mt-1 text-sm text-muted-foreground">{app.email} · {app.phone} · {app.education}</p>{app.note && <p className="mt-2 whitespace-pre-line text-sm">{app.note}</p>}<p className="mt-1 text-xs text-muted-foreground">{new Date(app.created_at).toLocaleString()}</p></div><button onClick={() => openResume(app)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-secondary"><FileText className="h-4 w-4" /> Open CV</button></article>)}</div></section>

    <section className="mt-8 rounded-2xl border bg-card p-5"><h2 className="font-semibold">Employer-submitted jobs</h2><div className="mt-4 space-y-3">{loading ? <p className="p-6 text-center text-sm text-muted-foreground">Loading submissions…</p> : items.length === 0 ? <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No user submissions yet.</p> : items.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"><div className="min-w-0"><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.company} · {item.location} · {item.type} · {item.mode || "Remote"}</p><p className="mt-1 text-xs text-muted-foreground">{item.pay || "Not specified"} · Submitted by {item.submittedBy}</p>{item.description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{item.description}</p>}</div><div className="flex items-center gap-2">{item.status === "pending" ? <><button onClick={() => updateCommunityJob(item.id, "approved")} className="inline-flex items-center gap-1 rounded-lg bg-success/15 px-3 py-2 text-sm text-success hover:bg-success/25"><Check className="h-4 w-4" /> Approve</button><button onClick={() => updateCommunityJob(item.id, "rejected")} className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /> Reject</button></> : <span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize">{item.status}</span>}</div></article>)}</div></section>
  </div></main>;
}

const inputClass = "mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
function Field({ label, full, children }: { label: string; full?: boolean; children: ReactNode }) { return <label className={`text-sm ${full ? "sm:col-span-2" : ""}`}>{label}{children}</label>; }
function Stat({ label, value, icon }: { label: string; value: number; icon: ReactNode }) { return <div className="rounded-xl border bg-card p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</div><p className="mt-2 text-2xl font-semibold">{value}</p></div>; }
