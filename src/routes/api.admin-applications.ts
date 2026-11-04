import { createFileRoute } from "@tanstack/react-router";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-session.server";
import { listApplications } from "@/lib/sqlite-jobs.server";

export const Route = createFileRoute("/api/admin-applications")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isAdminRequest(request)) return unauthorizedAdminResponse();
        try { return Response.json(await listApplications(), { headers: { "Cache-Control": "no-store" } }); }
        catch { return Response.json({ error: "Could not read applications from SQLite." }, { status: 503 }); }
      },
    },
  },
});
