import { createHmac, timingSafeEqual } from "node:crypto";

const cookieName = "serategna_admin";
const sessionLifetimeSeconds = 7 * 24 * 60 * 60;

function configuredPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || "";
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function signature(expiresAt: string, password: string) {
  return createHmac("sha256", password).update(`serategna-admin:${expiresAt}`).digest("base64url");
}

function cookieValue(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const entry = cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
  return entry?.slice(cookieName.length + 1) || "";
}

export function isAdminRequest(request: Request) {
  const password = configuredPassword();
  if (!password) return false;
  const [expiresAt, suppliedSignature] = cookieValue(request).split(".");
  if (!expiresAt || !suppliedSignature || !/^\d+$/.test(expiresAt) || Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;
  return safeEqual(suppliedSignature, signature(expiresAt, password));
}

export function adminSessionStatus(request: Request) {
  if (!configuredPassword()) return Response.json({ authenticated: false, configured: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return Response.json({ authenticated: isAdminRequest(request), configured: true }, { headers: { "Cache-Control": "no-store" } });
}

export async function startAdminSession(request: Request) {
  const password = configuredPassword();
  if (!password) return Response.json({ error: "The site admin password is not configured on the server." }, { status: 503 });
  let body: { password?: unknown };
  try { body = await request.json() as { password?: unknown }; }
  catch { return Response.json({ error: "Enter your admin password." }, { status: 400 }); }
  const supplied = typeof body.password === "string" ? body.password : "";
  if (!safeEqual(supplied, password)) return Response.json({ error: "Incorrect admin password." }, { status: 401 });

  const expiresAt = String(Math.floor(Date.now() / 1000) + sessionLifetimeSeconds);
  const value = `${expiresAt}.${signature(expiresAt, password)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return Response.json({ authenticated: true }, {
    headers: {
      "Cache-Control": "no-store",
      "Set-Cookie": `${cookieName}=${value}; Path=/; Max-Age=${sessionLifetimeSeconds}; HttpOnly; SameSite=Strict${secure}`,
    },
  });
}

export function endAdminSession() {
  return Response.json({ authenticated: false }, {
    headers: {
      "Cache-Control": "no-store",
      "Set-Cookie": `${cookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    },
  });
}

export function unauthorizedAdminResponse() {
  return Response.json({ error: "Sign in as the site administrator to continue." }, { status: 401, headers: { "Cache-Control": "no-store" } });
}
