import { createFileRoute } from "@tanstack/react-router";
import { adminSessionStatus, endAdminSession, startAdminSession } from "@/lib/admin-session.server";

export const Route = createFileRoute("/api/admin-session")({
  server: {
    handlers: {
      GET: async ({ request }) => adminSessionStatus(request),
      POST: async ({ request }) => startAdminSession(request),
      DELETE: async () => endAdminSession(),
    },
  },
});
