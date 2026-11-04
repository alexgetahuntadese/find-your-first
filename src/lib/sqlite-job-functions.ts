import { createServerFn } from "@tanstack/react-start";

export const getPublishedJobsFromSqlite = createServerFn({ method: "GET" }).handler(async () => {
  const store = await import("@/lib/sqlite-jobs.server");
  return store.listPublishedJobs();
});

export const getPublishedJobFromSqlite = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const store = await import("@/lib/sqlite-jobs.server");
    return store.getPublishedJob(data.id);
  });
