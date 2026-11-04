import { createFileRoute } from "@tanstack/react-router";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-session.server";
import { readApplicationResume } from "@/lib/sqlite-jobs.server";

export const Route = createFileRoute("/api/admin-resume")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isAdminRequest(request)) return unauthorizedAdminResponse();
        const id = new URL(request.url).searchParams.get("id") || "";
        if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "Application not found." }, { status: 404 });
        try {
          const resume = await readApplicationResume(id);
          if (!resume) return Response.json({ error: "Application not found." }, { status: 404 });
          return new Response(resume.content, {
            headers: {
              "Content-Type": resume.contentType,
              "Content-Disposition": `inline; filename="${resume.filename}"`,
              "Cache-Control": "private, no-store",
              "X-Content-Type-Options": "nosniff",
            },
          });
        } catch { return Response.json({ error: "Could not read this CV." }, { status: 404 }); }
      },
    },
  },
});
