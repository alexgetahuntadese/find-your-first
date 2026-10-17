import type { PendingJob } from "@/lib/auth";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function headers(token: string, extra: Record<string, string> = {}) {
  if (!SUPABASE_KEY) throw new Error("Supabase is not configured");
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...extra };
}

function requireUrl() {
  if (!SUPABASE_URL) throw new Error("Supabase is not configured");
  return SUPABASE_URL;
}

export async function createJob(token: string, submittedBy: string, job: Pick<PendingJob, "title" | "company" | "location" | "type" | "mode" | "pay" | "description" | "applyUrl" | "contactEmail" | "contactPhone">) {
  const response = await fetch(`${requireUrl()}/rest/v1/job_submissions`, { method: "POST", headers: headers(token, { Prefer: "return=representation" }), body: JSON.stringify({ title: job.title, company: job.company, location: job.location, type: job.type, mode: job.mode, pay: job.pay, description: job.description, apply_url: job.applyUrl || null, contact_email: job.contactEmail, contact_phone: job.contactPhone, submitted_by: submittedBy }) });
  if (!response.ok) throw new Error("Could not submit this job");
}

export async function listJobs(token: string) {
  const response = await fetch(`${requireUrl()}/rest/v1/job_submissions?select=*&order=created_at.desc`, { headers: headers(token) });
  if (!response.ok) throw new Error("Could not load job submissions");
  const rows = await response.json() as Array<PendingJob & { submitted_by: string; created_at: string }>;
  return rows.map((row) => ({ ...row, submittedBy: row.submitted_by, submittedAt: row.created_at, applyUrl: (row as PendingJob & { apply_url?: string }).apply_url, contactEmail: (row as PendingJob & { contact_email?: string }).contact_email, contactPhone: (row as PendingJob & { contact_phone?: string }).contact_phone }));
}

export async function updateJob(token: string, id: string, status: PendingJob["status"]) {
  const response = await fetch(`${requireUrl()}/rest/v1/job_submissions?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: headers(token, { Prefer: "return=minimal" }), body: JSON.stringify({ status }) });
  if (!response.ok) throw new Error("Could not update this job");
}
