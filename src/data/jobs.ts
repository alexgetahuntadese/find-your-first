export type JobType = "Internship" | "Full-time Entry Level" | "Contract";
export type WorkMode = "Remote" | "Hybrid" | "Onsite";
export type Experience = "Undergrad" | "New Grad" | "0-2 Years";
export type Industry = "Tech" | "Design" | "Finance" | "Healthcare" | "Operations";
export type Category = "Software Engineering" | "Data Analytics" | "Design" | "Marketing" | "Finance" | "Operations";

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
  featured?: boolean;
  hue: number;
}

export const jobs: Job[] = [
  { id: "1", company: "Northwind Labs", title: "Software Engineering Intern", location: "San Francisco, CA", mode: "Hybrid", type: "Internship", experience: "Undergrad", industry: "Tech", category: "Software Engineering", pay: "$45–$55/hr", paid: true, hoursAgo: 2, tags: ["React", "TypeScript", "Node.js"], featured: true, hue: 285 },
  { id: "2", company: "Lumen Analytics", title: "Junior Data Analyst", location: "Remote", mode: "Remote", type: "Full-time Entry Level", experience: "New Grad", industry: "Tech", category: "Data Analytics", pay: "$78k–$92k", paid: true, hoursAgo: 5, tags: ["SQL", "Python", "Tableau"], hue: 302 },
  { id: "3", company: "Halcyon Health", title: "Product Design Intern", location: "Boston, MA", mode: "Onsite", type: "Internship", experience: "Undergrad", industry: "Healthcare", category: "Design", pay: "$30–$38/hr", paid: true, hoursAgo: 9, tags: ["Figma", "UX Research", "Prototyping"], hue: 268 },
  { id: "4", company: "Vertex Capital", title: "Investment Analyst, New Grad", location: "New York, NY", mode: "Onsite", type: "Full-time Entry Level", experience: "New Grad", industry: "Finance", category: "Finance", pay: "$95k–$110k", paid: true, hoursAgo: 14, tags: ["Excel", "Modeling", "Valuation"], featured: true, hue: 318 },
  { id: "5", company: "Orbit Logistics", title: "Operations Associate", location: "Austin, TX", mode: "Hybrid", type: "Full-time Entry Level", experience: "0-2 Years", industry: "Operations", category: "Operations", pay: "Competitive", paid: true, hoursAgo: 20, tags: ["Supply Chain", "Excel", "SQL"], hue: 258 },
  { id: "6", company: "Pixelforge", title: "Frontend Engineer (Contract)", location: "Remote", mode: "Remote", type: "Contract", experience: "0-2 Years", industry: "Tech", category: "Software Engineering", pay: "$50–$65/hr", paid: true, hoursAgo: 30, tags: ["React", "Tailwind", "Next.js"], hue: 332 },
  { id: "7", company: "Brightpath", title: "Growth Marketing Intern", location: "Remote", mode: "Remote", type: "Internship", experience: "Undergrad", industry: "Tech", category: "Marketing", pay: "$22–$28/hr", paid: true, hoursAgo: 4, tags: ["Marketing", "SEO", "Analytics"], hue: 292 },
  { id: "8", company: "Cobalt AI", title: "Machine Learning Intern", location: "Seattle, WA", mode: "Hybrid", type: "Internship", experience: "Undergrad", industry: "Tech", category: "Data Analytics", pay: "$50–$60/hr", paid: true, hoursAgo: 11, tags: ["Python", "PyTorch", "ML"], featured: true, hue: 310 },
  { id: "9", company: "Meridian Bank", title: "Risk Externship (Unpaid)", location: "Chicago, IL", mode: "Onsite", type: "Internship", experience: "Undergrad", industry: "Finance", category: "Finance", pay: "Unpaid · Credit", paid: false, hoursAgo: 48, tags: ["Finance", "Research"], hue: 275 },
  { id: "10", company: "Stratus Cloud", title: "Associate Software Engineer", location: "Denver, CO", mode: "Hybrid", type: "Full-time Entry Level", experience: "New Grad", industry: "Tech", category: "Software Engineering", pay: "$105k–$125k", paid: true, hoursAgo: 7, tags: ["Go", "Kubernetes", "AWS"], featured: true, hue: 300 },
  { id: "11", company: "Kindred Care", title: "Healthcare Data Intern", location: "Remote", mode: "Remote", type: "Internship", experience: "Undergrad", industry: "Healthcare", category: "Data Analytics", pay: "$25–$32/hr", paid: true, hoursAgo: 60, tags: ["Python", "Excel", "Healthcare"], hue: 325 },
  { id: "12", company: "Atelier Studio", title: "Junior Brand Designer", location: "Los Angeles, CA", mode: "Onsite", type: "Contract", experience: "0-2 Years", industry: "Design", category: "Design", pay: "$35–$45/hr", paid: true, hoursAgo: 18, tags: ["Branding", "Illustrator", "Figma"], hue: 262 },
];

export function postedLabel(h: number) {
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
