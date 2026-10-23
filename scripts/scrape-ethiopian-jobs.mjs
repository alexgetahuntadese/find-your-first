import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const OUTPUT = new URL("../src/data/scraped-jobs.ts", import.meta.url);
const SOURCES = [
  { name: "EthioJobs", kind: "jsonld", url: "https://ethiojobs.net/sitemap-jobs.xml", sitemap: true },
  { name: "Ethiopiawork", kind: "html", url: "https://www.ethiopiawork.com/", linkPattern: /\/job-vacancies-ethiopia\//i },
  { name: "Enat Jobs", kind: "html", url: "https://enatjobs.com/jobs/", linkPattern: /^https:\/\/enatjobs\.com\/(?!jobs\/?$|category\/)/i },
  { name: "EthioJob.org", kind: "html", url: "https://ethiojob.org/", linkPattern: /^https:\/\/ethiojob\.org\/(?!category\/|author\/|privacy|terms|cookies)/i },
];
const freshSignal = /\b(intern(ship)?|trainee|graduate|entry[- ]level|junior|assistant|no experience|fresh|vacanc(y|ies)|job)\b/i;
const articleSignal = /\b(guide|tips|prepare|preparation|how to|cv|interview|training|course|scholarship|privacy|terms|cookie)\b/i;
const seniorSignal = /\b(senior|director|chief|vice president|vp)\b/i;
const closedSignal = /\b(expired|closed|no longer accepting|position has been filled|applications are closed)\b/i;
const categoryRules = [[/software|developer|engineer|it |data|technical|cyber|qa/i, "Software Engineering"], [/design|creative|graphic|ux|ui/i, "Design"], [/finance|account|audit|bank|econom/i, "Finance"], [/health|medical|nurse|pharmacy|clinic/i, "Healthcare"], [/sales|marketing|brand|customer/i, "Marketing"]];
const headers = { "User-Agent": "SERATEGNA-job-indexer/1.0 (+https://serategna.com.et/)" };

function text(value) { return String(value || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code))).replace(/\s+/g, " ").trim(); }
function categoryFor(value) { return categoryRules.find(([rule]) => rule.test(value))?.[1] || "Operations"; }
function stableId(url) { return `scraped-${createHash("sha1").update(url).digest("hex").slice(0, 12)}`; }
function hoursAgo(date) { const parsed = Date.parse(date || ""); return Number.isFinite(parsed) ? Math.max(0, Math.floor((Date.now() - parsed) / 3600000)) : 0; }
function absoluteUrl(url, base) { try { return new URL(url, base).href; } catch { return ""; } }
function parseJsonLd(html) {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of scripts) {
    try {
      const data = JSON.parse(match[1].trim());
      const items = Array.isArray(data) ? data : data?.["@graph"] || [data];
      const job = items.find((item) => item?.["@type"] === "JobPosting");
      if (job) return job;
    } catch {}
  }
  return null;
}
function meta(html, name) {
  const match = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`, "i"));
  return text(match?.[1]);
}
function pageTitle(html) { return text(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]).replace(/\s*[|–-]\s*(Enat Jobs|EthioJob\.org|Ethiopiawork).*$/i, ""); }
function pageDescription(html, title) {
  const body = text(html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]);
  const marker = body.search(/job ad|job description|position\s*:/i);
  const start = marker >= 0 ? marker : Math.max(body.indexOf(title) + title.length, 0);
  return body.slice(start, start + 1000);
}
function normalizeDate(value) {
  const match = String(value || "").match(/(\d{2})\.(\d{2})\.(\d{4})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}
function isExpired(value) {
  if (!value || !String(value).trim()) return false;
  const raw = String(value).trim();
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parsed = dateOnly ? new Date(`${raw}T23:59:59`) : new Date(raw);
  return Number.isFinite(parsed.getTime()) && parsed.getTime() < Date.now();
}
function locationFor(value) { return /addis ababa/i.test(value) ? "Addis Ababa" : /oromia|amhara|tigray|sidama|hawassa|dire dawa|bahir dar|mekelle|adama/i.test(value) ? (value.match(/(Oromia|Amhara|Tigray|Sidama|Hawassa|Dire Dawa|Bahir Dar|Mekelle|Adama)/i)?.[1] || "Ethiopia") : "Ethiopia"; }
function toJob({ source, company, url, title, description, datePosted, deadline }) {
  const searchable = `${title} ${description}`;
  if (!title || articleSignal.test(title) || isExpired(deadline) || closedSignal.test(searchable)) return null;
  const category = categoryFor(searchable);
  const internship = /\bintern(ship)?\b/i.test(title);
  const fresh = freshSignal.test(title);
  return { id: stableId(url), company: company || source, source, title, location: locationFor(searchable), mode: /remote/i.test(searchable) ? "Remote" : /hybrid/i.test(searchable) ? "Hybrid" : "Onsite", type: internship ? "Internship" : "Full-time Entry Level", experience: internship || fresh ? "New Grad" : "0-2 Years", industry: category === "Software Engineering" ? "Tech" : category, category, pay: "See listing", paid: false, hoursAgo: datePosted ? hoursAgo(datePosted) : 48, datePosted: datePosted || undefined, description: description.slice(0, 700), deadline, tags: ["Ethiopia", internship ? "Internship" : "Job listing"], url };
}

async function fetchText(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    return response.ok ? response.text() : "";
  } finally {
    clearTimeout(timeout);
  }
}

async function mapLimit(items, limit, mapper) {
  const results = [];
  for (let index = 0; index < items.length; index += limit) {
    results.push(...await Promise.all(items.slice(index, index + limit).map(mapper)));
  }
  return results;
}

async function collectEthioJobs(source) {
  const sitemap = await fetchText(source.url, 30000);
  const urls = [...sitemap.matchAll(/<loc>(https:\/\/ethiojobs\.net\/job\/[^<]+)<\/loc>/g)].map((match) => match[1]).slice(0, 160);
  return mapLimit(urls, 8, async (url) => {
    try {
      const html = await fetchText(url);
      const job = parseJsonLd(html);
      if (!job) return null;
      return toJob({ source: source.name, company: text(job.hiringOrganization?.name), url, title: text(job.title), description: text(job.description), datePosted: job.datePosted, deadline: job.validThrough });
    } catch { return null; }
  });
}

async function collectHtmlSource(source) {
  const listingHtml = await fetchText(source.url);
  const candidates = [...listingHtml.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({ url: absoluteUrl(match[1], source.url), label: text(match[2]) }))
    .filter(({ url, label }) => url && source.linkPattern.test(url) && label.length > 8 && label.length < 180)
    .slice(0, 80);
  const unique = [...new Map(candidates.map((item) => [item.url, item])).values()];
  return mapLimit(unique, 8, async ({ url, label }) => {
    try {
      const html = await fetchText(url);
      const job = parseJsonLd(html);
      const title = text(job?.title) || label || pageTitle(html);
      const description = text(job?.description) || meta(html, "description") || meta(html, "og:description") || pageDescription(html, title);
      const published = job?.datePosted || meta(html, "article:published_time") || html.match(/<time[^>]+datetime=["']([^"']+)/i)?.[1] || normalizeDate(html.match(/published on\s+(\d{2}\.\d{2}\.\d{4})/i)?.[1]) || "";
      return toJob({ source: source.name, url, title, description, datePosted: published, deadline: meta(html, "job:deadline") });
    } catch { return null; }
  });
}

const collected = [];
for (const source of SOURCES) {
  try {
    const jobs = source.sitemap ? await collectEthioJobs(source) : await collectHtmlSource(source);
    collected.push(...jobs.filter(Boolean));
    console.log(`${source.name}: ${jobs.filter(Boolean).length} listings`);
  } catch (error) {
    console.warn(`Could not refresh ${source.name}: ${error.message}`);
  }
}

const unique = [...new Map(collected.map((job) => [job.url, job])).values()].sort((a, b) => a.hoursAgo - b.hoursAgo).slice(0, 120);
const source = `// Generated by scripts/scrape-ethiopian-jobs.mjs. Refresh with npm run scrape:jobs.\nimport type { Job } from "./jobs";\n\nexport const scrapedJobsGeneratedAt = ${JSON.stringify(new Date().toISOString())};\nexport const scrapedJobs: Job[] = ${JSON.stringify(unique, null, 2)};\n`;
await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
await writeFile(OUTPUT, source);
console.log(`Saved ${unique.length} Ethiopian jobs from ${SOURCES.length} sources to ${OUTPUT.pathname}`);
