import { createFileRoute } from "@tanstack/react-router";
import { submitApplication } from "@/lib/sqlite-jobs.server";

function requiredText(value: FormDataEntryValue | null, max: number) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max ? value.trim() : "";
}

export const Route = createFileRoute("/api/applications")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let form: FormData;
        try { form = await request.formData(); }
        catch { return Response.json({ error: "The application form could not be read." }, { status: 400 }); }
        const resume = form.get("resume");
        if (!(resume instanceof File)) return Response.json({ error: "Attach a PDF or DOCX CV." }, { status: 400 });
        const input = {
          jobId: requiredText(form.get("jobId"), 100),
          name: requiredText(form.get("name"), 120),
          email: requiredText(form.get("email"), 254),
          phone: requiredText(form.get("phone"), 40),
          education: requiredText(form.get("education"), 160),
          note: typeof form.get("note") === "string" ? String(form.get("note")).trim().slice(0, 2000) : "",
          privacyConsent: form.get("privacyConsent") === "true",
          resume,
        };
        if (!input.jobId || input.name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || input.phone.length < 5 || !input.education) {
          return Response.json({ error: "Complete the required application fields and try again." }, { status: 400 });
        }
        try {
          await submitApplication(input);
          return Response.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "Could not save this application." }, { status: 400 });
        }
      },
    },
  },
});
