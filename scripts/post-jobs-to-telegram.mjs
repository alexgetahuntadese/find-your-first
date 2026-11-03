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
        lastIssue = `jobs endpoint returned HTTP ${response.status}`;
      } else {
        const feed = await response.json();
        if (feed.scrapedJobsGeneratedAt === expectedSnapshot && Array.isArray(feed.jobs)) return feed.jobs;
        lastIssue = "site has not published the refreshed snapshot";
      }
    } catch (error) {
      lastIssue = error instanceof Error ? error.message : "could not read the site job feed";
    }
    console.log(`${lastIssue}; checking again in 30 seconds`);
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }
  throw new Error(`Timed out waiting for the refreshed site job feed: ${lastIssue}`);
}

function clean(value, fallback = "Not specified") {
  const normalized = String(value || "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

function formatDate() {
  return new Intl.DateTimeFormat("en-ET", { dateStyle: "full", timeZone: "Africa/Addis_Ababa" }).format(new Date());
}

const jobs = await readUpdatedFeed();
if (jobs.length === 0) {
  console.log("Telegram posting skipped: the public job feed has no active listings.");
  process.exit(0);
}

const entries = jobs.map((job, index) => {
  const deadline = job.deadline ? ` · Deadline: ${clean(job.deadline)}` : "";
  return `${index + 1}. ${clean(job.title)} — ${clean(job.company)}\n${clean(job.location)} · ${clean(job.type)} · ${clean(job.mode)} · ${clean(job.pay)}${deadline}\n${clean(job.url, siteUrl)}`;
});

const contentLimit = 3600;
const parts = [];
let part = "";
for (const entry of entries) {
  if (entry.length > contentLimit) throw new Error("A job entry is too long to send safely");
  if (part && part.length + entry.length + 2 > contentLimit) {
    parts.push(part);
    part = "";
  }
  part += `${part ? "\n\n" : ""}${entry}`;
}
if (part) parts.push(part);

async function sendMessage(text) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, link_preview_options: { is_disabled: true } }),
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
    throw new Error(`Telegram sendMessage failed (HTTP ${response.status}): ${clean(result.description, "unknown API error")}`);
  }
}

for (let index = 0; index < parts.length; index += 1) {
  const heading = `EthioHub daily jobs · ${formatDate()}\n${jobs.length} current openings · ${index + 1}/${parts.length}\n\n`;
  const message = `${heading}${parts[index]}`;
  if (message.length > 4096) throw new Error("Telegram message exceeds the 4096-character limit");
  await sendMessage(message);
  console.log(`Posted Telegram part ${index + 1}/${parts.length}`);
  if (index + 1 < parts.length) await new Promise((resolve) => setTimeout(resolve, 400));
}

console.log(`Posted ${jobs.length} job listings in ${parts.length} Telegram message(s).`);
