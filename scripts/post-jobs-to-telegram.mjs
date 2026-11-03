import { readFile } from "node:fs/promises";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
if (!token || !chatId) {
  console.log("Telegram posting skipped: configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID repository secrets.");
  process.exit(0);
}

const siteUrl = (process.env.SITE_JOBS_URL || "https://serategna.com.et/api/jobs.json").trim();
const source = await readFile(new URL("../src/data/scraped-jobs.ts", import.meta.url), "utf8");
const expectedSnapshot = source.match(/scrapedJobsGeneratedAt\s*=\s*"([^"]+)"/)?.[1];
if (!expectedSnapshot) throw new Error("Could not read the expected jobs snapshot timestamp");

async function readUpdatedFeed() {
  const endAt = Date.now() + 30 * 60 * 1000;
  let lastIssue = "site has not published the refreshed snapshot";
  while (Date.now() < endAt) {
    try {
      const response = await fetch(siteUrl, {
        headers: { "User-Agent": "EthioHub-Telegram-JobPublisher/1.0" },
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        lastIssue = "jobs endpoint returned HTTP " + response.status;
      } else {
        const feed = await response.json();
        if (feed.scrapedJobsGeneratedAt === expectedSnapshot && Array.isArray(feed.jobs)) return feed.jobs;
        lastIssue = "site has not published the refreshed snapshot";
      }
    } catch (error) {
      lastIssue = error instanceof Error ? error.message : "could not read the site job feed";
    }
    console.log(lastIssue + "; checking again in 30 seconds");
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }
  throw new Error("Timed out waiting for the refreshed site job feed: " + lastIssue);
}

function clean(value, fallback = "Not specified") {
  const normalized = String(value || "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

function ethiopiaDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return part("year") + "-" + part("month") + "-" + part("day");
}

const today = ethiopiaDate(new Date().toISOString());
const jobs = await readUpdatedFeed();
const todaysJobs = jobs.filter((job) => ethiopiaDate(job.datePosted) === today);

if (todaysJobs.length === 0) {
  console.log("No job listings dated " + today + " (Africa/Addis_Ababa) are available to post.");
  process.exit(0);
}

function applyUrl(job) {
  try {
    const url = new URL(job.url || siteUrl);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {}
  throw new Error("Job “" + clean(job.title) + "” has no valid apply URL");
}


function escapeHtml(value) {
  return clean(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatDeadline(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return clean(value);
  return new Intl.DateTimeFormat("en-ET", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Addis_Ababa",
  }).format(date);
}

async function sendMessage(text, replyMarkup) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok && result.ok) return;
    const retryAfter = Number(result.parameters?.retry_after);
    const retryable = response.status === 429 || response.status >= 500;
    if (retryable && attempt < 5) {
      await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : attempt * 2000));
      continue;
    }
    throw new Error("Telegram sendMessage failed (HTTP " + response.status + "): " + clean(result.description, "unknown API error"));
  }
}

for (let index = 0; index < todaysJobs.length; index += 1) {
  const job = todaysJobs[index];
  const deadline = job.deadline ? "\n⏳ Apply by " + escapeHtml(formatDeadline(job.deadline)) : "";
  const experience = job.experience ? "\n🎓 " + escapeHtml(job.experience) + " experience" : "";
  const message =
    "🇪🇹 <b>SERATEGNA · TODAY'S JOB</b>\n" +
    "<i>" + today + "</i>\n\n" +
    "💼 <b>" + escapeHtml(job.title) + "</b>\n" +
    "🏢 " + escapeHtml(job.company) + "\n" +
    "📍 " + escapeHtml(job.location) + "\n" +
    "🕒 " + escapeHtml(job.type) + " · " + escapeHtml(job.mode) +
    experience + "\n💰 " + escapeHtml(job.pay) + deadline +
    "\n\n<i>Tap “Apply now” to view the full listing.</i>";
  if (message.length > 4096) throw new Error("Telegram message exceeds the 4096-character limit for " + clean(job.title));
  const replyMarkup = {
    inline_keyboard: [[{ text: "Apply now", url: applyUrl(job) }]],
  };
  await sendMessage(message, replyMarkup);
  console.log("Posted individual job " + (index + 1) + "/" + todaysJobs.length + " with its own apply button");
  if (index + 1 < todaysJobs.length) await new Promise((resolve) => setTimeout(resolve, 1100));
}

console.log("Posted " + todaysJobs.length + " individual jobs dated " + today + ", each with its own apply button.");
