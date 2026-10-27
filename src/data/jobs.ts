import { scrapedJobs, scrapedJobsGeneratedAt } from "./scraped-jobs";

export type JobType = "Internship" | "Full-time Entry Level" | "Contract";
export type WorkMode = "Remote" | "Hybrid" | "Onsite";
export type Experience = "Undergrad" | "New Grad" | "0-2 Years";
export type Industry = "Tech" | "Design" | "Finance" | "Healthcare" | "Marketing" | "Operations";
export type Category = "Software Engineering" | "Data Analytics" | "Design" | "Marketing" | "Finance" | "Healthcare" | "Operations";

export interface JobSalary {
  currency: string;
  value?: number;
  minValue?: number;
  maxValue?: number;
  unitText?: string;
}

export interface Job {
  id: string;
  company: string;
  title: string;
  location: string;
  mode: WorkMode;
  type: JobType;
  experience: Experience;
  industry: Industry;
  category: Category;
  pay: string;
  paid: boolean;
  hoursAgo: number;
  tags: string[];
  description?: string;
  datePosted?: string;
  deadline?: string;
  addressLocality?: string;
  streetAddress?: string;
  addressRegion?: string;
  postalCode?: string;
  baseSalary?: JobSalary;
  source?: string;
  featured?: boolean;
  hue?: number;
  url: string;
}

/** Returns true when a listing has no known closing date or its closing date is still open. */
export function isJobActive(job: Pick<Job, "deadline"> & Partial<Pick<Job, "title" | "description">>) {
  const listingText = `${job.title || ""} ${job.description || ""}`;
  if (/\b(expired|closed|no longer accepting|position has been filled|applications are closed)\b/i.test(listingText)) return false;
  if (!job.deadline?.trim()) return true;
  const raw = job.deadline.trim();
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const deadline = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]), 23, 59, 59, 999)
    : new Date(raw);
  return Number.isNaN(deadline.getTime()) || deadline.getTime() >= Date.now();
}

const seedJobs: Job[] = [
  { id: "1", company: "Sun Jun Bo Furniture Production", title: "Showroom Manager", location: "Addis Ababa", mode: "Onsite", type: "Full-time Entry Level", experience: "0-2 Years", industry: "Operations", category: "Operations", pay: "Negotiable", paid: true, hoursAgo: 0, tags: ["Sales", "Retail", "Leadership"], featured: true, hue: 285, url: "https://ethiojobs.net/job/Rf9wdVtoOU-showroom-manager" },
  { id: "2", company: "Sun Jun Bo Furniture Production", title: "Showroom Sales Associate", location: "Addis Ababa", mode: "Onsite", type: "Full-time Entry Level", experience: "New Grad", industry: "Operations", category: "Marketing", pay: "Negotiable", paid: true, hoursAgo: 0, tags: ["Sales", "Customer Service"], hue: 292, url: "https://ethiojobs.net/job/tX57wyv1AP-showroom-sales-associate" },
  { id: "3", company: "Sun Jun Bo Furniture Production", title: "IT Support Specialist", location: "Addis Ababa", mode: "Onsite", type: "Full-time Entry Level", experience: "0-2 Years", industry: "Tech", category: "Software Engineering", pay: "Negotiable", paid: true, hoursAgo: 0, tags: ["Networking", "Hardware", "PMS"], featured: true, hue: 300, url: "https://ethiojobs.net/job/9RoIOvnYjK-it-support-specialist" },
  { id: "4", company: "Sun Jun Bo Furniture Production", title: "Human Resources Manager", location: "Addis Ababa", mode: "Onsite", type: "Full-time Entry Level", experience: "0-2 Years", industry: "Operations", category: "Operations", pay: "Negotiable", paid: true, hoursAgo: 0, tags: ["HR", "Recruitment"], hue: 310, url: "https://ethiojobs.net/job/sAXub1H6xK-human-resources-manager" },
  { id: "5", company: "Sun Jun Bo Furniture Production", title: "Production Assistant", location: "Oromia", mode: "Onsite", type: "Full-time Entry Level", experience: "New Grad", industry: "Operations", category: "Operations", pay: "Negotiable", paid: true, hoursAgo: 0, tags: ["Manufacturing", "FMCG"], hue: 318, url: "https://ethiojobs.net/job/ont94eVvxZ-production-assistant" },
  { id: "6", company: "Sun Jun Bo Furniture Production", title: "Finance Assistant", location: "Oromia", mode: "Onsite", type: "Full-time Entry Level", experience: "New Grad", industry: "Finance", category: "Finance", pay: "Negotiable", paid: true, hoursAgo: 0, tags: ["Accounting", "Excel"], hue: 322, url: "https://ethiojobs.net/job/ZFiJ4hGTHQ-finance-assistant" },
  { id: "7", company: "Romel General Trading Plc", title: "Sales Representative", location: "Ethiopia", mode: "Onsite", type: "Full-time Entry Level", experience: "New Grad", industry: "Operations", category: "Marketing", pay: "Negotiable", paid: true, hoursAgo: 7, tags: ["Sales", "Business"], hue: 288, url: "https://ethiojobs.net/job/HOfK7T9HkZ-sales-representative" },
  { id: "8", company: "GKP Construction and Import", title: "AI and Software Development Engineer", location: "Addis Ababa", mode: "Onsite", type: "Full-time Entry Level", experience: "0-2 Years", industry: "Tech", category: "Software Engineering", pay: "Negotiable", paid: true, hoursAgo: 24, tags: ["AI", "Software", "Python"], featured: true, hue: 296, url: "https://ethiojobs.net/job/eVNS4tLOwx-ai-and-software-development-engineer" },
  { id: "9", company: "Teklehaimanot General Hospital", title: "Wellness / Marketing / GP", location: "Addis Ababa", mode: "Onsite", type: "Full-time Entry Level", experience: "0-2 Years", industry: "Healthcare", category: "Marketing", pay: "Negotiable", paid: true, hoursAgo: 24, tags: ["Healthcare", "Marketing"], hue: 340, url: "https://ethiojobs.net/job/4B55QxpCZO-wellnessmarketinggp" },
  { id: "10", company: "GKP Construction and Import", title: "Office Receptionist", location: "Addis Ababa", mode: "Onsite", type: "Full-time Entry Level", experience: "New Grad", industry: "Operations", category: "Operations", pay: "Negotiable", paid: true, hoursAgo: 24, tags: ["Communication", "Admin"], hue: 302, url: "https://ethiojobs.net/job/ilt1OqxpWR-office-receptionist" },
  { id: "11", company: "GKP Construction and Import", title: "Junior Accountant", location: "Addis Ababa", mode: "Onsite", type: "Full-time Entry Level", experience: "New Grad", industry: "Finance", category: "Finance", pay: "Negotiable", paid: true, hoursAgo: 24, tags: ["Accounting", "Finance"], hue: 330, url: "https://ethiojobs.net/job/5ZSXgT8rFd-junior-accountant" },
  { id: "12", company: "GKP Construction and Import", title: "Irrigation Foreman / Engineer", location: "Addis Ababa", mode: "Onsite", type: "Full-time Entry Level", experience: "0-2 Years", industry: "Operations", category: "Operations", pay: "Negotiable", paid: true, hoursAgo: 24, tags: ["Engineering", "Irrigation"], hue: 312, url: "https://ethiojobs.net/job/waD2h2JJ98-irrigation-foreman-engineer" },
];

const scrapedSnapshotTime = Date.parse(scrapedJobsGeneratedAt);
const datedScrapedJobs = scrapedJobs.map((job) => ({
  ...job,
  // Older snapshots stored only hoursAgo. Anchor that age to the committed
  // snapshot time so SSR and hydration always see the same date.
  datePosted: job.datePosted || new Date(scrapedSnapshotTime - job.hoursAgo * 60 * 60 * 1000).toISOString(),
}));
const datedSeedJobs = seedJobs.map((job) => ({
  ...job,
  datePosted: job.datePosted || new Date(scrapedSnapshotTime - job.hoursAgo * 60 * 60 * 1000).toISOString(),
}));

export const jobs: Job[] = [...new Map([...datedScrapedJobs, ...datedSeedJobs].map((job) => [job.url, job])).values()].filter(isJobActive);

export function postedLabel(h: number) {
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

