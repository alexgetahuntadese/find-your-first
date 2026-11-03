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

function publicHeaders(extra: Record<string, string> = {}) {
  if (!SUPABASE_KEY) throw new Error("Supabase is not configured");
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, ...extra };
}

type PublishedJobRow = {
  id: string; title: string; company: string; location: string; type: Job["type"];
  mode: Job["mode"]; experience: Job["experience"]; industry: Job["industry"];
  category: Job["category"]; pay: string; paid: boolean; tags: string[];
  description: string; deadline: string | null; date_posted: string;
};

function toJob(row: PublishedJobRow): Job {
  const hoursAgo = Math.max(0, Math.floor((Date.now() - Date.parse(row.date_posted)) / 3_600_000));
  return {
    id: row.id, title: row.title, company: row.company, location: row.location,
    type: row.type, mode: row.mode, experience: row.experience, industry: row.industry,
    category: row.category, pay: row.pay || "Not specified", paid: row.paid,
    tags: row.tags || [], description: row.description, deadline: row.deadline || undefined,
    datePosted: row.date_posted, hoursAgo, applyOnSite: true, url: `/jobs/${encodeURIComponent(row.id)}`,
  };
}

/** Published original listings are readable without an account for SSR and search engines. */
export async function listPublishedJobs(): Promise<Job[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const response = await fetch(`${SUPABASE_URL}/rest/v1/original_jobs?select=*&status=eq.published&order=date_posted.desc`, { headers: publicHeaders() });
  // Keep the existing public job board available until the new Supabase schema
  // is applied; admin writes still surface configuration errors explicitly.
  if (!response.ok) return [];
  return (await response.json() as PublishedJobRow[]).map(toJob);
}

export async function getPublishedJob(id: string): Promise<Job | undefined> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return undefined;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/original_jobs?select=*&id=eq.${encodeURIComponent(id)}&status=eq.published&limit=1`, { headers: publicHeaders() });
  if (!response.ok) return undefined;
  const rows = await response.json() as PublishedJobRow[];
  return rows[0] ? toJob(rows[0]) : undefined;
}

export type OriginalJobInput = Omit<PublishedJobRow, "id" | "date_posted"> & { deadline: string | null };
export type ApplicantInput = { jobId: string; name: string; email: string; phone: string; education: string; note: string; resume: File };

export async function createOriginalJob(token: string, createdBy: string, job: OriginalJobInput) {
  const response = await fetch(`${requireUrl()}/rest/v1/original_jobs`, {
    method: "POST", headers: headers(token, { Prefer: "return=minimal" }),
    body: JSON.stringify({ ...job, created_by: createdBy, status: "published" }),
  });
  if (!response.ok) throw new Error("Could not publish this job");
}

export async function listOriginalJobs(token: string) {
  const response = await fetch(`${requireUrl()}/rest/v1/original_jobs?select=*&order=date_posted.desc`, { headers: headers(token) });
  if (!response.ok) throw new Error("Could not load original jobs");
  const rows = await response.json() as Array<PublishedJobRow & { status: "draft" | "published" | "closed"; created_at: string }>;
  return rows.map((row) => ({ ...toJob(row), status: row.status, created_at: row.created_at }));
}

export async function updateOriginalJobStatus(token: string, id: string, status: "published" | "closed") {
  const response = await fetch(`${requireUrl()}/rest/v1/original_jobs?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", headers: headers(token, { Prefer: "return=minimal" }), body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Could not update this job");
}

export type JobApplication = { id: string; job_id: string; name: string; email: string; phone: string; education: string; note: string; resume_path: string; status: "new" | "reviewed" | "shortlisted" | "rejected"; created_at: string };

export async function submitApplication(input: ApplicantInput) {
  if (!SUPABASE_KEY) throw new Error("Applications are not configured yet");
  if (input.resume.size > 5 * 1024 * 1024) throw new Error("CV must be 5 MB or smaller");
  if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(input.resume.type)) throw new Error("Upload a PDF or DOCX CV");
  const id = crypto.randomUUID();
  const extension = input.resume.type === "application/pdf" ? "pdf" : "docx";
  const path = `${input.jobId}/${id}.${extension}`;
  const upload = await fetch(`${requireUrl()}/storage/v1/object/cvs/${path}`, {
    method: "POST", headers: publicHeaders({ "Content-Type": input.resume.type, "x-upsert": "false" }), body: input.resume,
  });
  if (!upload.ok) throw new Error("Could not upload your CV. Please try again.");
  const response = await fetch(`${requireUrl()}/rest/v1/job_applications`, {
    method: "POST", headers: publicHeaders({ "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify({ id, job_id: input.jobId, name: input.name.trim(), email: input.email.trim(), phone: input.phone.trim(), education: input.education.trim(), note: input.note.trim(), privacy_consent: true, resume_path: path }),
  });
  if (!response.ok) throw new Error("Your CV uploaded, but we could not save the application. Please try again.");
}

export async function listApplications(token: string) {
  const response = await fetch(`${requireUrl()}/rest/v1/job_applications?select=*,original_jobs(title,company)&order=created_at.desc`, { headers: headers(token) });
  if (!response.ok) throw new Error("Could not load applications");
  return await response.json() as Array<JobApplication & { original_jobs: { title: string; company: string } }>;
}

export async function getResumeLink(token: string, path: string) {
  const response = await fetch(`${requireUrl()}/storage/v1/object/sign/cvs/${path}`, {
    method: "POST", headers: headers(token), body: JSON.stringify({ expiresIn: 600 }),
  });
  if (!response.ok) throw new Error("Could not open this CV");
  const data = await response.json() as { signedURL: string };
  const storagePath = data.signedURL.startsWith("/storage/v1/") ? data.signedURL : `/storage/v1${data.signedURL}`;
  return `${requireUrl()}${storagePath}`;
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
