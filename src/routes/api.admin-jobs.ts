import { createFileRoute } from "@tanstack/react-router";
import type { Job } from "@/data/jobs";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-session.server";
import { createOriginalJob, listOriginalJobs, updateOriginalJobStatus, type OriginalJobInput } from "@/lib/sqlite-jobs.server";

const jobTypes = new Set<Job["type"]>(["Internship", "Full-time Entry Level", "Contract"]);
const workModes = new Set<Job["mode"]>(["Onsite", "Hybrid", "Remote"]);
const experienceLevels = new Set<Job["experience"]>(["Undergrad", "New Grad", "0-2 Years"]);
const industries = new Set<Job["industry"]>(["Tech", "Design", "Finance", "Healthcare", "Marketing", "Operations"]);
const categories = new Set<Job["category"]>(["Software Engineering", "Data Analytics", "Design", "Marketing", "Finance", "Healthcare", "Operations"]);

function validText(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function parseJob(value: unknown): OriginalJobInput | null {
  if (!value || typeof value !== "object") return null;
  const job = value as Record<string, unknown>;
  if (!validText(job.title, 3, 160) || !validText(job.company, 2, 120) || !validText(job.location, 2, 120)
    || !validText(job.description, 80, 5000) || !jobTypes.has(job.type as Job["type"])
    || !workModes.has(job.mode as Job["mode"]) || !experienceLevels.has(job.experience as Job["experience"])
    || !industries.has(job.industry as Job["industry"]) || !categories.has(job.category as Job["category"])) return null;
  const tags = Array.isArray(job.tags) ? job.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean).slice(0, 10) : [];
  const deadline = job.deadline === null || job.deadline === "" ? null : typeof job.deadline === "string" && /^\d{4}-\d{2}-\d{2}$/.test(job.deadline) ? job.deadline : null;
  return {
    title: job.title.trim(), company: job.company.trim(), location: job.location.trim(), description: job.description.trim(),
    type: job.type as Job["type"], mode: job.mode as Job["mode"], experience: job.experience as Job["experience"],
    industry: job.industry as Job["industry"], category: job.category as Job["category"],
    pay: validText(job.pay, 1, 80) ? job.pay.trim() : "Not specified", paid: job.paid === true, tags, deadline,
  };
}

export const Route = createFileRoute("/api/admin-jobs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isAdminRequest(request)) return unauthorizedAdminResponse();
        try { return Response.json(await listOriginalJobs(), { headers: { "Cache-Control": "no-store" } }); }
        catch { return Response.json({ error: "Could not read the local SQLite job database." }, { status: 503 }); }
      },
      POST: async ({ request }) => {
        if (!isAdminRequest(request)) return unauthorizedAdminResponse();
        let input: unknown;
        try { input = await request.json(); } catch { return Response.json({ error: "The job details were not valid JSON." }, { status: 400 }); }
        const job = parseJob(input);
        if (!job) return Response.json({ error: "Check the job fields and try again." }, { status: 400 });
        try {
          const id = await createOriginalJob(job);
          return Response.json({ id }, { status: 201, headers: { "Cache-Control": "no-store" } });
        } catch { return Response.json({ error: "Could not save this job to SQLite." }, { status: 503 }); }
      },
      PATCH: async ({ request }) => {
        if (!isAdminRequest(request)) return unauthorizedAdminResponse();
        let body: { id?: unknown; status?: unknown };
        try { body = await request.json() as { id?: unknown; status?: unknown }; }
        catch { return Response.json({ error: "The update was not valid JSON." }, { status: 400 }); }
        if (typeof body.id !== "string" || !["published", "closed"].includes(String(body.status))) {
          return Response.json({ error: "Choose a job and a valid status." }, { status: 400 });
        }
        try {
          await updateOriginalJobStatus(body.id, body.status as "published" | "closed");
          return Response.json({ ok: true });
        } catch { return Response.json({ error: "Could not update this job." }, { status: 404 }); }
      },
    },
  },
});
