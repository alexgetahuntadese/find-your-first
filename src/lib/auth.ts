export type SessionUser = {
  id?: string;
  name: string;
  email: string;
  role: "user" | "admin";
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
};

const SESSION_KEY = "launchboard-session";
const PENDING_JOBS_KEY = "launchboard-pending-jobs";

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as SessionUser | null;
  } catch {
    return null;
  }
}

export function saveSession(user: SessionUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

async function supabaseAuth(path: string, body: Record<string, unknown>) {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase is not configured");
  const response = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.msg || data.message || "Authentication failed");
  return data as { access_token?: string; refresh_token?: string; expires_in?: number; user?: { id?: string; email?: string; user_metadata?: { name?: string } } };
}

async function getRole(userId: string | undefined, token: string | undefined) {
  if (!userId || !token || !SUPABASE_URL || !SUPABASE_KEY) return "user" as const;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } });
  if (!response.ok) return "user" as const;
  const rows = await response.json() as Array<{ role?: "user" | "admin" }>;
  return rows[0]?.role === "admin" ? "admin" as const : "user" as const;
}

export async function signIn(email: string, password: string) {
  const data = await supabaseAuth("/token?grant_type=password", { email, password });
  if (!data.access_token || !data.user?.id) throw new Error("Sign-in did not return a valid session");
  const user = { id: data.user.id, name: data.user.user_metadata?.name || email.split("@")[0], email: data.user.email || email, role: await getRole(data.user.id, data.access_token), accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };
  saveSession(user);
  return user;
}

export async function signUp(name: string, email: string, password: string) {
  const data = await supabaseAuth("/signup", { email, password, data: { name } });
  if (!data.access_token || !data.user?.id) return { requiresEmailConfirmation: true as const };
  const user = { id: data.user.id, name, email: data.user.email || email, role: await getRole(data.user.id, data.access_token), accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };
  saveSession(user);
  return { requiresEmailConfirmation: false as const, user };
}

export async function refreshSession() {
  const session = getSession();
  if (!session?.refreshToken || !SUPABASE_URL || !SUPABASE_KEY) return session;
  if (session.expiresAt && session.expiresAt > Date.now() + 60_000) return session;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: session.refreshToken }) });
  if (!response.ok) { clearSession(); return null; }
  const data = await response.json() as { access_token?: string; refresh_token?: string; expires_in?: number };
  if (!data.access_token) { clearSession(); return null; }
  const next = { ...session, accessToken: data.access_token, refreshToken: data.refresh_token || session.refreshToken, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };
  saveSession(next);
  return next;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export type PendingJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  mode?: string;
  pay?: string;
  description?: string;
  applyUrl?: string;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedAt: string;
};

export function getPendingJobs(): PendingJob[] {
  try {
    return JSON.parse(localStorage.getItem(PENDING_JOBS_KEY) || "[]") as PendingJob[];
  } catch {
    return [];
  }
}

export function savePendingJobs(jobs: PendingJob[]) {
  localStorage.setItem(PENDING_JOBS_KEY, JSON.stringify(jobs));
}

