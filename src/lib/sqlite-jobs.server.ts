import { createClient, type Row } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { isJobActive, type Job } from "@/data/jobs";

const dataDirectory = resolve(process.env.APP_DATA_DIR || "./data");
const cvDirectory = join(dataDirectory, "cvs");
const databaseFile = join(dataDirectory, "serategna.sqlite");
const client = createClient({ url: pathToFileURL(databaseFile).href });

let ready: Promise<void> | undefined;

async function database() {
  if (!ready) {
    ready = (async () => {
      await mkdir(cvDirectory, { recursive: true });
      await client.batch([
        `CREATE TABLE IF NOT EXISTS original_jobs (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          company TEXT NOT NULL,
          location TEXT NOT NULL,
          type TEXT NOT NULL,
          mode TEXT NOT NULL,
          experience TEXT NOT NULL,
          industry TEXT NOT NULL,
          category TEXT NOT NULL,
          pay TEXT NOT NULL,
          paid INTEGER NOT NULL DEFAULT 0,
          tags TEXT NOT NULL DEFAULT '[]',
          description TEXT NOT NULL,
          deadline TEXT,
          status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
          created_by TEXT NOT NULL DEFAULT 'admin',
          date_posted TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE INDEX IF NOT EXISTS original_jobs_status_date_idx ON original_jobs(status, date_posted DESC)`,
        `CREATE TABLE IF NOT EXISTS job_applications (
          id TEXT PRIMARY KEY,
          job_id TEXT NOT NULL REFERENCES original_jobs(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          education TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          privacy_consent INTEGER NOT NULL CHECK (privacy_consent = 1),
          resume_path TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'shortlisted', 'rejected')),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE INDEX IF NOT EXISTS job_applications_date_idx ON job_applications(created_at DESC)`,
      ], "write");
    })();
  }
  await ready;
  return client;
}

function text(row: Row, field: string) {
  const value = row[field];
  return value === null || value === undefined ? "" : String(value);
}

function toJob(row: Row): Job & { status?: "draft" | "published" | "closed"; created_at?: string } {
  const datePosted = text(row, "date_posted");
  let tags: string[] = [];
  try { tags = JSON.parse(text(row, "tags")) as string[]; } catch { /* malformed legacy tags are ignored */ }
  return {
    id: text(row, "id"), title: text(row, "title"), company: text(row, "company"), location: text(row, "location"),
    type: text(row, "type") as Job["type"], mode: text(row, "mode") as Job["mode"],
    experience: text(row, "experience") as Job["experience"], industry: text(row, "industry") as Job["industry"],
    category: text(row, "category") as Job["category"], pay: text(row, "pay") || "Not specified", paid: Number(row.paid) === 1,
    hoursAgo: Math.max(0, Math.floor((Date.now() - Date.parse(datePosted)) / 3_600_000)), tags,
    description: text(row, "description"), deadline: text(row, "deadline") || undefined, datePosted,
    applyOnSite: true, url: `/jobs/${encodeURIComponent(text(row, "id"))}`,
    status: text(row, "status") as "draft" | "published" | "closed", created_at: text(row, "created_at"),
  };
}

export type OriginalJobInput = {
  title: string; company: string; location: string; type: Job["type"]; mode: Job["mode"];
  experience: Job["experience"]; industry: Job["industry"]; category: Job["category"];
  pay: string; paid: boolean; tags: string[]; description: string; deadline: string | null;
};

export type ApplicantInput = {
  jobId: string; name: string; email: string; phone: string; education: string; note: string;
  privacyConsent: boolean; resume: File;
};

export type JobApplication = {
  id: string; job_id: string; name: string; email: string; phone: string; education: string; note: string;
  resume_path: string; status: "new" | "reviewed" | "shortlisted" | "rejected"; created_at: string;
};

export async function listPublishedJobs() {
  const db = await database();
  const result = await db.execute("SELECT * FROM original_jobs WHERE status = 'published' ORDER BY date_posted DESC");
  return result.rows.map(toJob).filter(isJobActive);
}

export async function getPublishedJob(id: string) {
  const db = await database();
  const result = await db.execute({ sql: "SELECT * FROM original_jobs WHERE id = ? AND status = 'published' LIMIT 1", args: [id] });
  const job = result.rows[0] ? toJob(result.rows[0]) : undefined;
  return job && isJobActive(job) ? job : undefined;
}

export async function listOriginalJobs() {
  const db = await database();
  const result = await db.execute("SELECT * FROM original_jobs ORDER BY date_posted DESC");
  return result.rows.map(toJob);
}

export async function createOriginalJob(input: OriginalJobInput) {
  const db = await database();
  const id = randomUUID();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO original_jobs
      (id, title, company, location, type, mode, experience, industry, category, pay, paid, tags, description, deadline, status, created_by, date_posted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 'admin', ?)`,
    args: [id, input.title, input.company, input.location, input.type, input.mode, input.experience, input.industry, input.category,
      input.pay, input.paid ? 1 : 0, JSON.stringify(input.tags), input.description, input.deadline, now],
  });
  return id;
}

export async function updateOriginalJobStatus(id: string, status: "published" | "closed") {
  const db = await database();
  const result = await db.execute({ sql: "UPDATE original_jobs SET status = ? WHERE id = ?", args: [status, id] });
  if (Number(result.rowsAffected) === 0) throw new Error("Job not found");
}

export async function submitApplication(input: ApplicantInput) {
  if (!input.privacyConsent) throw new Error("Please agree to the application privacy notice");
  if (input.resume.size <= 0 || input.resume.size > 5 * 1024 * 1024) throw new Error("CV must be between 1 byte and 5 MB");
  if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(input.resume.type)) {
    throw new Error("Upload a PDF or DOCX CV");
  }

  const db = await database();
  const job = await db.execute({ sql: "SELECT id FROM original_jobs WHERE id = ? AND status = 'published' LIMIT 1", args: [input.jobId] });
  if (!job.rows[0]) throw new Error("This job is no longer accepting applications");

  const id = randomUUID();
  const extension = input.resume.type === "application/pdf" ? "pdf" : "docx";
  const relativePath = `cvs/${id}.${extension}`;
  const absolutePath = join(dataDirectory, relativePath);
  const resolvedPath = resolve(absolutePath);
  if (!resolvedPath.startsWith(cvDirectory + sep)) throw new Error("Invalid CV storage path");
  await writeFile(resolvedPath, Buffer.from(await input.resume.arrayBuffer()), { flag: "wx", mode: 0o600 });
  try {
    await db.execute({
      sql: `INSERT INTO job_applications (id, job_id, name, email, phone, education, note, privacy_consent, resume_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      args: [id, input.jobId, input.name.trim(), input.email.trim().toLowerCase(), input.phone.trim(), input.education.trim(), input.note.trim(), relativePath],
    });
  } catch (error) {
    await rm(resolvedPath, { force: true });
    throw error;
  }
}

export async function listApplications() {
  const db = await database();
  const result = await db.execute(`SELECT a.*, j.title AS job_title, j.company AS job_company
    FROM job_applications a JOIN original_jobs j ON j.id = a.job_id ORDER BY a.created_at DESC`);
  return result.rows.map((row) => ({
    id: text(row, "id"), job_id: text(row, "job_id"), name: text(row, "name"), email: text(row, "email"),
    phone: text(row, "phone"), education: text(row, "education"), note: text(row, "note"), resume_path: text(row, "resume_path"),
    status: text(row, "status") as JobApplication["status"], created_at: text(row, "created_at"),
    original_jobs: { title: text(row, "job_title"), company: text(row, "job_company") },
  }));
}

export async function readApplicationResume(id: string) {
  const db = await database();
  const result = await db.execute({ sql: "SELECT resume_path FROM job_applications WHERE id = ? LIMIT 1", args: [id] });
  if (!result.rows[0]) return undefined;
  const storedPath = text(result.rows[0], "resume_path");
  if (!/^cvs\/[0-9a-f-]+\.(pdf|docx)$/i.test(storedPath)) throw new Error("Invalid stored CV path");
  const absolutePath = resolve(dataDirectory, storedPath);
  if (!absolutePath.startsWith(cvDirectory + sep)) throw new Error("Invalid stored CV path");
  const content = await readFile(absolutePath);
  const isPdf = storedPath.endsWith(".pdf");
  return { content, contentType: isPdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename: `application-${id}.${isPdf ? "pdf" : "docx"}` };
}
