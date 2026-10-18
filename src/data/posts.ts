export interface Post { slug: string; title: string; excerpt: string; date: string; read: string; body: string[] }

export const posts: Post[] = [
  {
    slug: "first-job-ethiopia-guide",
    title: "Landing your first job in Ethiopia as a fresh graduate",
    excerpt: "A practical roadmap from graduation day to your first offer letter.",
    date: "Oct 18, 2026", read: "6 min",
    body: [
      "Graduating is exciting, but the job market in Addis Ababa and beyond is competitive. The good news: employers actively hire fresh graduates for junior accountant, sales, IT support and assistant roles.",
      "Start by gathering your documents: your degree or temporary certificate, official transcript, ID, and any internship letters. Many employers ask for scanned copies when you apply online.",
      "Check trusted job sites every day, since new roles are posted daily and many close within one or two weeks. Apply early, apply only to roles you match, and tailor every application.",
      "Finally, tell your network. Classmates, lecturers and family often hear about openings before they are posted publicly.",
    ],
  },
  {
    slug: "cv-tips-fresh-graduates",
    title: "7 CV tips that get fresh graduates shortlisted",
    excerpt: "Keep it to one or two pages and lead with what you can do.",
    date: "Oct 15, 2026", read: "5 min",
    body: [
      "1. Put your contact details, including a working phone number, at the top. Recruiters in Ethiopia often call rather than email.",
      "2. Write a short two-line summary of who you are and the role you want.",
      "3. List your education with your CGPA if it is strong.",
      "4. Include internships, volunteering, senior projects and campus clubs — they count as experience.",
      "5. Name concrete skills: Excel, Peachtree, QuickBooks, Python, AutoCAD, languages like Amharic, Afaan Oromo and English.",
      "6. Keep the layout simple so it reads well when printed.",
      "7. Add two references, ideally a lecturer and an internship supervisor.",
    ],
  },
  {
    slug: "interview-prep",
    title: "How to prepare for your first job interview",
    excerpt: "Research the company, practice common questions and arrive early.",
    date: "Oct 11, 2026", read: "4 min",
    body: [
      "Research the company: what it sells, who its customers are and why you want to work there.",
      "Practice answers to common questions: tell us about yourself, your strengths and weaknesses, and why you should be hired.",
      "Many employers include a written exam, especially for finance and engineering roles. Revise the basics of your field.",
      "Dress neatly, bring printed copies of your CV and documents, and arrive 15 minutes early. Send a short thank-you message afterwards.",
    ],
  },
  {
    slug: "internships-matter",
    title: "Why internships matter — even unpaid ones",
    excerpt: "Experience is the number one thing employers ask fresh grads for.",
    date: "Oct 6, 2026", read: "4 min",
    body: [
      "Many listings ask for 0–2 years of experience. An internship or volunteer role is the fastest way to get it.",
      "Internships let you build references, learn workplace habits and test whether a field suits you.",
      "Ask for a letter or certificate at the end — it strengthens every future application.",
    ],
  },
];
