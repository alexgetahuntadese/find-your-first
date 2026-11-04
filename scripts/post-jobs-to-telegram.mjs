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

const historicalApplyUrls = Object.freeze({
  "scraped-3d04202dcfbc": "https://ethiojobs.net/job/rvaoatlqsa-hr-and-admin-assistant",
  "scraped-cb9986ea0aa9": "https://ethiojobs.net/job/ubpyrlsl1e-invitation-for-bids-production-of-brand-visibility-materials",
  "scraped-da2969b9bcf4": "https://ethiojobs.net/job/rs3rke1ztp-invitation-for-bids-printing-of-project-communication-and-visibility-material",
  "scraped-29a63feb19ab": "https://ethiojobs.net/job/tgqcjcdfir-gender-equality-social-inclusion-gesi-officer",
  "scraped-8f0cc0192b5c": "https://ethiojobs.net/job/kqgswwza1j-middle-level-human-resources-officer",
  "scraped-5210478ab689": "https://ethiojobs.net/job/ttqbtigwwf-dental-nurse",
  "scraped-7dcdd5efd0e0": "https://ethiojobs.net/job/ndsxj86xxg-supply-chain-management-team-leader",
  "scraped-a81616ae64b6": "https://ethiojobs.net/job/cbtivdz7mz-principal-esg-analyst-i",
  "scraped-7ccf0f4f749a": "https://ethiojobs.net/job/b2fzj548am-finance-officer",
  "scraped-94ac37d2029e": "https://ethiojobs.net/job/divm36zj5m-protection-srh-officer",
  "scraped-026aab3e40d0": "https://ethiojobs.net/job/r0v18pbzpm-chef",
  "scraped-73e9deabf0a7": "https://ethiojobs.net/job/wvwyrc4uwl-fb-control",
  "scraped-6413f6dc7983": "https://ethiojobs.net/job/w3mrsojthi-associate-business-advisor",
  "scraped-5e2786f6cb28": "https://ethiojobs.net/job/khytuhhfai-general-services-officer",
  "scraped-10306ba5f9a6": "https://ethiojobs.net/job/bgjdkonzx3-",
  "scraped-954abd88a0a6": "https://ethiojobs.net/job/j46fu6mlum-production-quality-control-officer-wooden-furniture-manufacturing",
  "scraped-1513314cdf28": "https://ethiojobs.net/job/qsc8xv0qtg-anesthetist",
  "scraped-1f8f4b1bacf7": "https://ethiojobs.net/job/ryiy2wdjqf-property-admin-head",
  "scraped-10f9ca294902": "https://ethiojobs.net/job/m0knmlopnz-monitoring-and-evaluation-officer-hrh-program",
  "scraped-1850c1a2a58d": "https://ethiojobs.net/job/sfy46qjiul-human-resources-for-health-hrh-program-coordinator",
  "scraped-df058f35f235": "https://ethiojobs.net/job/mei954wypg-public-health-operation-center-technical-assistant-secondment-for-zonal-health-department",
  "scraped-7ea9b304eaad": "https://ethiojobs.net/job/movpbkrg8q-woreda-human-resources-for-health-hrh-health-system-strengthening-officer",
  "scraped-271ed33ad5f6": "https://ethiojobs.net/job/bliqikgukr-research-and-business-development-specialist-i-for-addis-ababa",
  "scraped-f2e7d491409f": "https://ethiojobs.net/job/kvz2v4shex-project-officer",
  "scraped-cd9793f89cd7": "https://ethiojobs.net/job/fdylhpkw5f-junior-software-developer",
  "scraped-b36a46bec91d": "https://ethiojobs.net/job/zqmycvthy5-property-administration-head",
  "scraped-d55a24e49dc2": "https://ethiojobs.net/job/wr3sagux5f-monitoring-evaluation-learning-mel-officer",
  "scraped-d8a57c0d82a6": "https://ethiojobs.net/job/cyx9qca9rz-forklift-driver",
  "scraped-22584b487b5e": "https://ethiojobs.net/job/kpiqfdrdwx-spare-parts-raw-materials-purchasing-officer",
  "scraped-3abbef9ba084": "https://ethiojobs.net/job/74xyk0erlm-communication-intern",
  "scraped-8ba9116a41ae": "https://ethiojobs.net/job/78rubwsghu-finance-department-head",
  "scraped-6977ba799d46": "https://ethiojobs.net/job/qve9baedmx-junior-accountant",
  "scraped-e976cf9261ab": "https://ethiojobs.net/job/m8yv0kbzlh-motorist",
  "scraped-a58b54ca2657": "https://ethiojobs.net/job/voita7ylmr-physiotherapy-professional",
  "scraped-65ca583dc0db": "https://ethiojobs.net/job/7qhcn9trkc-hospital-receptionist",
  "scraped-dc104883cdce": "https://ethiojobs.net/job/91pndzjbnm-field-project-officer",
  "scraped-ff0931532ba7": "https://ethiojobs.net/job/p6kunswrzd-call-for-consultancy-services-shared-space-shared-futures-3sf-advancing-social-cohesion-and-civic-participation-in-post-conflict-ethiopia",
  "scraped-14e65775f8ae": "https://ethiojobs.net/job/wq703na0r7-finance-and-administration-officer-fao-oromia",
  "scraped-187200ff15c4": "https://ethiojobs.net/job/txakpijqen-cooperative-advisor-lobby-and-advocacy-expert",
  "scraped-a2ee4bcbf8c0": "https://ethiojobs.net/job/t51myr4yf1-junior-accountant",
  "scraped-119cd8917c42": "https://ethiojobs.net/job/ajwhxwtnmw-project-officer",
  "scraped-5ead615cdde1": "https://ethiojobs.net/job/ccq8ghfr6q-clinical-service-specialist",
  "scraped-a289fd16c5bc": "https://ethiojobs.net/job/lhesuduycl-gbv-case-management-expert-officer",
  "scraped-0846b4f9ce33": "https://ethiojobs.net/job/ftrpjdwte5-case-management-specialist",
  "scraped-b53ec54c20f3": "https://ethiojobs.net/job/jwn5nclysu-assistant-project-coordinator",
  "scraped-c009128df72d": "https://ethiojobs.net/job/1705exv8jz-auditor-ii",
  "scraped-01d7456d7702": "https://ethiojobs.net/job/fjfkc0vmxj-sales-officer-batching-plant",
  "scraped-4ff51d64b91a": "https://ethiojobs.net/job/p53fxlxdgo-physiotherapist",
  "scraped-618a982a95ea": "https://ethiojobs.net/job/6wldaaicpc-ophthalmic-nurse",
  "scraped-45af83650eb6": "https://ethiojobs.net/job/qysjumvrpu-emergency-and-critical-care-nurse",
  "scraped-7fc73c243918": "https://ethiojobs.net/job/t2dzihnite-study-physician-assistant-researcher-ii",
  "scraped-714b4f1fbe95": "https://ethiojobs.net/job/e5px4qcmca-project-officer-gender-and-safeguarding-kombolcha",
  "scraped-29697fec3ded": "https://ethiojobs.net/job/nmbeb9ulkm-mhnt-nurse",
  "scraped-5b448f5cb5f8": "https://ethiojobs.net/job/0w8ooajdct-mhnt-midwife",
});

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
  const linksById = new Map();
  for (const job of jobs) {
    const key = normalizeMatch(job.title) + "|" + normalizeMatch(job.company);
    if (!linksByJob.has(key) && job.applyUrl) linksByJob.set(key, applyUrl(job));
    try {
      const detailId = new URL(job.url).pathname.split("/").filter(Boolean).at(-1);
      if (detailId && job.applyUrl) linksById.set(detailId, applyUrl(job));
    } catch {}
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

      const currentButton = decodeTelegramHtml(buttonMatch[1]);
      let currentId = "";
      try {
        currentId = new URL(currentButton).pathname.split("/").filter(Boolean).at(-1) || "";
      } catch {}
      const target = historicalApplyUrls[currentId] || linksById.get(currentId) || linksByJob.get(normalizeMatch(title) + "|" + normalizeMatch(company));
      if (!target) {
        unmatched += 1;
        continue;
      }
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
