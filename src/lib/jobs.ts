import type { PendingJob } from "@/lib/auth";
import type { Job } from "@/data/jobs";

const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const SUPABASE_KEY = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

function headers(token: string, extra: Record<string, string> = {}) {
  if (!SUPABASE_KEY) throw new Error("Supabase is not configured");
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...extra };
}

function requireUrl() {
  if (!SUPABASE_URL) throw new Error("Supabase is not configured");
  return SUPABASE_URL;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const isMultipart = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: { ...(isMultipart ? {} : { "Content-Type": "application/json" }), ...init?.headers },
  });
  const body = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) throw new Error(body.error || "The request could not be completed");
  return body;
}

export type OriginalJobInput = {
  title: string; company: string; location: string; type: Job["type"]; mode: Job["mode"];
  experience: Job["experience"]; industry: Job["industry"]; category: Job["category"];
  pay: string; paid: boolean; tags: string[]; description: string; deadline: string | null;
};

export type ApplicantInput = {
  jobId: string; name: string; email: string; phone: string; education: string;
  note: string; privacyConsent: boolean; resume: File;
};

export async function createOriginalJob(job: OriginalJobInput) {
  await requestJson<{ id: string }>("/api/admin-jobs", { method: "POST", body: JSON.stringify(job) });
}

export async function listOriginalJobs() {
  return requestJson<Array<Job & { status: "draft" | "published" | "closed"; created_at: string }>>("/api/admin-jobs");
}

export async function updateOriginalJobStatus(id: string, status: "published" | "closed") {
  await requestJson<{ ok: true }>("/api/admin-jobs", { method: "PATCH", body: JSON.stringify({ id, status }) });
}

export type JobApplication = {
  id: string; job_id: string; name: string; email: string; phone: string; education: string; note: string;
  resume_path: string; status: "new" | "reviewed" | "shortlisted" | "rejected"; created_at: string;
};

export async function submitApplication(input: ApplicantInput) {
  if (input.resume.size > 5 * 1024 * 1024) throw new Error("CV must be 5 MB or smaller");
  if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(input.resume.type)) throw new Error("Upload a PDF or DOCX CV");
  const form = new FormData();
  for (const [key, value] of Object.entries(input)) form.set(key, typeof File !== "undefined" && value instanceof File ? value : String(value));
  await requestJson<{ ok: true }>("/api/applications", { method: "POST", body: form });
}

export async function listApplications() {
  return requestJson<Array<JobApplication & { original_jobs: { title: string; company: string } }>>("/api/admin-applications");
}

export async function getResumeLink(applicationId: string) {
  return `/api/admin-resume?id=${encodeURIComponent(applicationId)}`;
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
