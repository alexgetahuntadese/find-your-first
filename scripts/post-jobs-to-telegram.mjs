import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
if (!token || !chatId) {
  console.log("Telegram posting skipped: configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID repository secrets.");
  process.exit(0);
}

const siteUrl = (process.env.SITE_JOBS_URL || "https://serategna.com.et/api/jobs.json").trim();
const statePath = resolve(process.env.POSTED_JOB_IDS_FILE || ".telegram-cache/posted-job-ids.json");
const expectedSource = await readFile(new URL("../src/data/scraped-jobs.ts", import.meta.url), "utf8");
const expectedSnapshot = expectedSource.match(/scrapedJobsGeneratedAt\s*=\s*"([^"]+)"/)?.[1];
if (!expectedSnapshot) throw new Error("Could not read the expected jobs snapshot timestamp");

function clean(value, fallback = "Not specified") {
  const normalized = String(value || "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

function escapeHtml(value) {
  return clean(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function applyUrl(job) {
  try {
    const url = new URL(job.url || siteUrl);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {}
  throw new Error("Job “" + clean(job.title) + "” has no valid apply URL");
}

function jobKey(job) {
  const value = job.id || job.url;
  if (!value) throw new Error("A job in the public feed has no stable ID or URL");
  return String(value);
}

async function readFeed() {
  const fromScraper = process.env.GITHUB_EVENT_NAME === "workflow_run";
  const stopAt = Date.now() + (fromScraper ? 30 * 60_000 : 2 * 60_000);
  let lastIssue = "site job feed is not available";

  while (Date.now() < stopAt) {
    try {
      const response = await fetch(siteUrl, {
        headers: { "User-Agent": "Serategna-Telegram-JobPublisher/1.0" },
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        lastIssue = "jobs endpoint returned HTTP " + response.status;
      } else {
        const feed = await response.json();
        if (!Array.isArray(feed.jobs)) throw new Error("jobs endpoint returned an invalid feed");
        if (!fromScraper || feed.scrapedJobsGeneratedAt === expectedSnapshot) return feed.jobs;
        lastIssue = "site has not published the refreshed scrape snapshot yet";
      }
    } catch (error) {
      lastIssue = error instanceof Error ? error.message : "could not read the site job feed";
    }
    console.log(lastIssue + "; checking again in 30 seconds");
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }
  throw new Error("Timed out waiting for the site job feed: " + lastIssue);
}

async function readSentKeys() {
  try {
    const parsed = JSON.parse(await readFile(statePath, "utf8"));
    if (!Array.isArray(parsed)) throw new Error("saved state is not an array");
    return new Set(parsed.map(String));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return null;
    console.log("Could not read saved Telegram state; initializing a fresh baseline.");
    return null;
  }
}

async function writeSentKeys(keys) {
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(statePath, JSON.stringify([...keys].sort(), null, 2) + "\n");
}

function ethiopiaDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "date unavailable";
  return new Intl.DateTimeFormat("en-ET", {
    timeZone: "Africa/Addis_Ababa",
    dateStyle: "medium",
  }).format(date);
}

function ethiopiaDateKey(value) {
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

const jobs = await readFeed();
let sentKeys = await readSentKeys();
const backfillDate = process.env.BACKFILL_DATE?.trim();
const backfillSkipUrls = new Set((process.env.BACKFILL_SKIP_URLS || "").split(",").map((url) => url.trim()).filter(Boolean));

if (sentKeys === null && !backfillDate) {
  const baseline = new Set(jobs.map(jobKey));
  await writeSentKeys(baseline);
  console.log("Initialized the Telegram baseline with " + baseline.size + " existing jobs; future additions will be posted.");
  process.exit(0);
}
if (sentKeys === null) sentKeys = new Set();

const newJobs = backfillDate
  ? jobs.filter((job) => ethiopiaDateKey(job.datePosted) === backfillDate && !backfillSkipUrls.has(job.url))
  : jobs.filter((job) => !sentKeys.has(jobKey(job)));
if (newJobs.length === 0) {
  console.log("No new jobs found in the site feed.");
  await writeSentKeys(sentKeys);
  process.exit(0);
}

console.log("Found " + newJobs.length + (backfillDate ? " backfill job(s) to post for " + backfillDate + "." : " new job(s) to post."));
for (let index = 0; index < newJobs.length; index += 1) {
  const job = newJobs[index];
  const deadline = job.deadline ? "\n⏳ <b>Apply by:</b> " + escapeHtml(ethiopiaDate(job.deadline)) : "";
  const message =
    "🇪🇹 <b>SERATEGNA · NEW JOB</b>\n" +
    "✨ Fresh opportunity for your next step\n\n" +
    "💼 <b>" + escapeHtml(job.title) + "</b>\n" +
    "🏢 " + escapeHtml(job.company) + "\n" +
    "📍 " + escapeHtml(job.location) + "\n" +
    "🕒 " + escapeHtml(job.type) + " · " + escapeHtml(job.mode) + "\n" +
    "💰 " + escapeHtml(job.pay) + deadline + "\n\n" +
    "🗓 <b>Posted:</b> " + escapeHtml(ethiopiaDate(job.datePosted)) + "\n" +
    "<i>Tap below to view details and apply.</i>";
  if (message.length > 4096) throw new Error("Telegram message exceeds the 4096-character limit for " + clean(job.title));
  const replyMarkup = {
    inline_keyboard: [[{ text: "Apply now", url: applyUrl(job) }]],
  };

  await sendMessage(message, replyMarkup);
  sentKeys.add(jobKey(job));
  await writeSentKeys(sentKeys);
  console.log("Posted " + (index + 1) + "/" + newJobs.length + ": " + clean(job.title));
  if (index + 1 < newJobs.length) await new Promise((resolve) => setTimeout(resolve, 1100));
}

console.log("Posted " + newJobs.length + " newly detected job(s), each with its own Apply now button.");
