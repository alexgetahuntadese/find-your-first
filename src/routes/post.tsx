import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, Rocket, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { refreshSession } from "@/lib/auth";
import { createJob } from "@/lib/jobs";

export const Route = createFileRoute("/post")({ component: PostJobPage });

function PostJobPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getSession());
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Internship");
  const [mode, setMode] = useState("Remote");
  const [pay, setPay] = useState("");
  const [description, setDescription] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { refreshSession().then((session) => { setUser(session); if (!session) navigate({ to: "/auth" }); }).catch(() => navigate({ to: "/auth" })); }, [navigate]);

  useEffect(() => {
    const draft = localStorage.getItem("launchboard-job-draft");
    if (!draft) return;
    try { const saved = JSON.parse(draft); setTitle(saved.title || ""); setCompany(saved.company || ""); setLocation(saved.location || ""); setType(saved.type || "Internship"); setMode(saved.mode || "Remote"); setPay(saved.pay || ""); setDescription(saved.description || ""); setApplyUrl(saved.applyUrl || ""); } catch {}
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    if (!user.accessToken) { toast.error("Please verify your email, then sign in again"); return; }
    if (description.trim().length < 40) { toast.error("Add at least 40 characters describing the opportunity"); return; }
    try { setSubmitting(true); await createJob(user.accessToken, user.id || "", { title: title.trim(), company: company.trim(), location: location.trim(), type, mode, pay: pay.trim() || "Not specified", description: description.trim(), applyUrl: applyUrl.trim() }); localStorage.removeItem("launchboard-job-draft"); toast.success("Job submitted for admin review"); navigate({ to: "/" }); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not submit this job"); }
    finally { setSubmitting(false); }
  };

  const saveDraft = () => { localStorage.setItem("launchboard-job-draft", JSON.stringify({ title, company, location, type, mode, pay, description, applyUrl })); toast.success("Draft saved on this device"); };

  return <main className="min-h-screen bg-background px-4 py-10"><div className="mx-auto max-w-2xl"><Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to jobs</Link><div className="mt-8 rounded-2xl border bg-card p-6 shadow-glow sm:p-8"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary"><BriefcaseBusiness className="h-5 w-5 text-primary-foreground" /></span><div><p className="font-semibold">Post a job</p><p className="text-sm text-muted-foreground">Share the details candidates need. Listings are reviewed before publishing.</p></div></div><form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2"><label className="text-sm sm:col-span-2">Role title<input required maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" placeholder="Software Engineering Intern" /></label><label className="text-sm">Company<input required maxLength={120} value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" placeholder="Northwind Labs" /></label><label className="text-sm">Location<input required maxLength={120} value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" placeholder="Remote or city" /></label><label className="text-sm">Job type<select value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"><option>Internship</option><option>Full-time Entry Level</option><option>Contract</option></select></label><label className="text-sm">Work mode<select value={mode} onChange={(e) => setMode(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"><option>Remote</option><option>Hybrid</option><option>Onsite</option></select></label><label className="text-sm sm:col-span-2">Pay or stipend<input maxLength={80} value={pay} onChange={(e) => setPay(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" placeholder="$25â€“$35/hr or Competitive" /></label><label className="text-sm sm:col-span-2">Description<textarea required minLength={40} maxLength={3000} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 min-h-32 w-full resize-y rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" placeholder="What will this person work on? Include responsibilities, requirements, and what makes the opportunity compelling." /><span className="mt-1 block text-xs text-muted-foreground">{description.length}/3000 characters</span></label><label className="text-sm sm:col-span-2">Application URL<input type="url" value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" placeholder="https://example.com/apply" /></label><div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end"><button type="button" onClick={saveDraft} className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm hover:bg-secondary"><CheckCircle2 className="h-4 w-4" /> Save draft</button><button disabled={submitting} className="flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"><Rocket className="h-4 w-4" /> {submitting ? "Submittingâ€¦" : "Submit for review"}</button></div></form></div></div></main>;
}

