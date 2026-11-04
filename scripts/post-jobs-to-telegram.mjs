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
    const url = new URL(job.applyUrl || job.url || siteUrl);
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

function normalizeMatch(value) {
  return clean(value).toLocaleLowerCase("en").normalize("NFKC").replace(/[^a-z0-9]+/g, " ").trim();
}

function decodeTelegramHtml(value) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

async function editMessageKeyboard(messageId, applyLink) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch("https://api.telegram.org/bot" + token + "/editMessageReplyMarkup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: Number(messageId),
        reply_markup: { inline_keyboard: [[{ text: "Apply now", url: applyLink }]] },
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok && result.ok) return "edited";
    if (String(result.description || "").includes("message is not modified")) return "unchanged";
    const retryAfter = Number(result.parameters?.retry_after);
    if ((response.status === 429 || response.status >= 500) && attempt < 5) {
      await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : attempt * 2000));
      continue;
    }
    if (/message can't be edited|message to edit not found/i.test(result.description || "")) return "uneditable";
    throw new Error("Telegram could not repair message " + messageId + ": " + clean(result.description, "unknown API error"));
  }
  return "uneditable";
}

async function repairExistingTelegramLinks(jobs) {
  const linksByJob = new Map();
  for (const job of jobs) {
    const key = normalizeMatch(job.title) + "|" + normalizeMatch(job.company);
    if (!linksByJob.has(key) && job.applyUrl) linksByJob.set(key, applyUrl(job));
  }

  let beforeId = null;
  let previousOldest = Infinity;
  let edited = 0;
  let unchanged = 0;
  let unmatched = 0;

  for (let pageNumber = 0; pageNumber < 10; pageNumber += 1) {
    const pageUrl = "https://t.me/s/ethioserategna" + (beforeId ? "?before=" + beforeId : "");
    const response = await fetch(pageUrl, { signal: AbortSignal.timeout(20_000) });
    if (!response.ok) throw new Error("Could not read the public Telegram history (HTTP " + response.status + ")");
    const html = await response.text();
    const posts = [...html.matchAll(/data-post="ethioserategna\/(\d+)"/g)];
    if (posts.length === 0) break;

    const ids = posts.map((post) => Number(post[1]));
    const oldestId = Math.min(...ids);
    if (oldestId >= previousOldest) break;
    previousOldest = oldestId;

    for (let index = 0; index < posts.length; index += 1) {
      const start = posts[index].index ?? 0;
      const end = index + 1 < posts.length ? (posts[index + 1].index ?? html.length) : html.length;
      const block = html.slice(start, end);
      const textMatch = block.match(/<div class="tgme_widget_message_text js-message_text"[^>]*>([\s\S]*?)<\/div>/i);
      const buttonMatch = block.match(/tgme_widget_message_inline_button url_button" href="([^"]+)"/i);
      if (!textMatch || !buttonMatch) continue;

      const messageText = decodeTelegramHtml(textMatch[1]).split(/\n+/).map((line) => line.trim()).filter(Boolean);
      const titleLine = messageText.find((line) => line.includes("💼"));
      const companyLine = messageText.find((line) => line.includes("🏢"));
      let title = titleLine?.replace(/^.*?💼\s*/u, "").trim();
      let company = companyLine?.replace(/^.*?🏢\s*/u, "").trim();

      if (!title || !company) {
        const classicLine = messageText.find((line) => line.includes(" — "));
        if (classicLine) {
          const splitAt = classicLine.indexOf(" — ");
          title = classicLine.slice(0, splitAt).trim();
          company = classicLine.slice(splitAt + 3).trim();
        }
      }
      if (!title || !company) continue;

      const target = linksByJob.get(normalizeMatch(title) + "|" + normalizeMatch(company));
      if (!target) {
        unmatched += 1;
        continue;
      }
      const currentButton = decodeTelegramHtml(buttonMatch[1]);
      if (currentButton === target) {
        unchanged += 1;
        continue;
      }
      const messageId = posts[index][1];
      const result = await editMessageKeyboard(messageId, target);
      if (result === "edited") edited += 1;
      else unchanged += 1;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    if (oldestId <= 1) break;
    beforeId = String(oldestId);
  }

  console.log("Telegram link repair finished: updated " + edited + " button(s), left " + unchanged + " correct/unchanged, unmatched " + unmatched + ".");
}

const jobs = await readFeed();
if (process.env.REPAIR_TELEGRAM_LINKS === "true") {
  await repairExistingTelegramLinks(jobs);
  process.exit(0);
}
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
