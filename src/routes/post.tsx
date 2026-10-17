import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, Rocket } from "lucide-react";
import { toast } from "sonner";
import { getSession } from "@/lib/auth";
import { createJob } from "@/lib/jobs";

export const Route = createFileRoute("/post")({ component: PostJobPage });

function PostJobPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getSession());
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Internship");

  useEffect(() => { const session = getSession(); setUser(session); if (!session) navigate({ to: "/auth" }); }, [navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    if (!user.accessToken) { toast.error("Please verify your email, then sign in again"); return; }
    try { await createJob(user.accessToken, user.id || "", { title, company, location, type }); toast.success("Job submitted for admin review"); navigate({ to: "/" }); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not submit this job"); }
  };

  return <main className="min-h-screen bg-background px-4 py-10"><div className="mx-auto max-w-2xl"><Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to jobs</Link><div className="mt-8 rounded-2xl border bg-card p-6 shadow-glow sm:p-8"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary"><BriefcaseBusiness className="h-5 w-5 text-primary-foreground" /></span><div><p className="font-semibold">Post a job</p><p className="text-sm text-muted-foreground">Your listing will be reviewed before publishing.</p></div></div><form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2"><label className="text-sm sm:col-span-2">Role title<input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" placeholder="Software Engineering Intern" /></label><label className="text-sm">Company<input required value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" placeholder="Northwind Labs" /></label><label className="text-sm">Location<input required value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" placeholder="Remote or city" /></label><label className="text-sm sm:col-span-2">Job type<select value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"><option>Internship</option><option>Full-time Entry Level</option><option>Contract</option></select></label><button className="flex items-center justify-center gap-2 rounded-lg bg-gradient-primary py-2.5 text-sm font-medium text-primary-foreground sm:col-span-2"><Rocket className="h-4 w-4" /> Submit for review</button></form></div></div></main>;
}

