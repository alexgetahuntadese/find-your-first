# SERATEGNA

Build a modern, full-featured web application for a Job & Internship Board platform launching tomorrow. The design should be clean, fast, mobile-responsive, and optimized for high conversions and user engagement.



---



### 1. Visual & UI Theme

* **Style:** Modern, sleek, and high-trust (similar to Linear, Vercel, or Wellfound).

* **Color Palette:** Dark mode default with sleek accent colors (electric blue/violet gradients, dark zinc background `#09090b`, bright accent buttons).

* **Typography:** Clean sans-serif font (Inter or Geist).

* **Components:** Smooth micro-interactions, subtle glassmorphism header, active pill filters, and clean loading skeletons.



---



### 2. Core Pages & Architecture



#### A. Hero & Search Section (Homepage Header)

* **Headline:** "Launch Your Career with Top Internships & Entry-Level Roles."

* **Subheadline:** "Hand-picked daily opportunities for students, fresh graduates, and junior professionals."

* **Search Bar:** Combined search input for Job Title/Keywords, Location (Remote, City, On-site), and Job Type (Internship, Full-time Entry Level, Contract).

* **Quick Filter Pills:** "Remote", "Software Engineering", "Data Analytics", "Paid Internships", "New Today".



#### B. Main Job Listing & Feed Section

* **Tab Switcher:** 

  * "All Roles"

  * "Internships & Externships"

  * "Fresh Graduate / Entry Level"

  * "Featured / Top Companies"

* **Job Cards:** Each card includes:

  * Company Logo placeholder, Company Name, Role Title, Location badge, Work Mode (Remote/Hybrid/Onsite).

  * Salary / Stipend range badge (e.g., "$25–$35/hr" or "Competitive").

  * "Posted X hours ago" badge with a "NEW" highlight tag.

  * Tag list (e.g., React, Python, Marketing).

  * Hover action buttons: "Quick Save" (heart icon) and "Apply Now" CTA.



#### C. Floating / Sidebar Interactive Features

* **Filter Sidebar:** 

  * Experience level checkbox (Undergrad, New Grad, 0-2 Years).

  * Industry categories (Tech, Design, F

inance, Healthcare, Operations).

  *

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://serategna.com.et

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/14bbaa7a-3159-458a-8c7e-a234a25a4a2d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Demo workflow

- Visit `/auth` to create a local demo account or sign in.
- Signed-in users can submit opportunities from `/post`; submissions are stored locally and wait for review.
- Use `admin@launchboard.dev` with any password of 6+ characters to open `/admin` and approve or reject submissions.

Employer job submissions, original EthioHub listings, and applications use Supabase with Row Level Security. For an existing project, run `supabase/migrations/20261103000000_original_jobs_applications.sql` in the Supabase SQL Editor after the base `profiles` table and `public.is_admin()` function exist. For a fresh project, run `supabase/schema.sql`. The migration creates the original-jobs and applications tables, grants only the operations needed by the app, and configures a private CV bucket with row-level policies.

Supabase authentication is configured through `.env.local` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The publishable key is safe for browser use; never expose a service-role key.

### Daily original job publishing

Sign in with an account whose `profiles.role` is `admin`, then open `/admin`. Use **Publish an original job** to add an accurate, verified vacancy. It is published immediately, appears in the public job feed and relevant landing pages, gets an on-site application form and JobPosting structured data, and is added to `/sitemap.xml`. Close filled or expired vacancies from the admin list so they are removed from public pages and the sitemap. Search engines decide when to recrawl the sitemap; publishing does not guarantee immediate indexing.

Applicants can submit their name, email, phone, education or experience, an optional note, and a PDF or DOCX CV (up to 5 MB) without creating an account. CV files are kept in a private Supabase Storage bucket; administrators view them through links that expire after 10 minutes. The Supabase SQL policies must be applied before accepting applications.

### Daily Telegram job posts

The `Post new site jobs to Telegram` GitHub Actions workflow checks the public jobs feed daily at 9:45 AM Addis Ababa time. It posts each newly listed job as a separate message with a formatted summary and an **Apply now** button. Previously posted jobs are tracked so daily checks do not repost them.

Add these repository Actions secrets:

- `TELEGRAM_BOT_TOKEN`: token for a Telegram bot that can post in the channel.
- `TELEGRAM_CHAT_ID`: the channel username (for example, `@yourchannel`) or numeric chat ID.

The bot must be added as a channel administrator with permission to post. Optionally set the repository variable `SITE_JOBS_URL` if the public feed endpoint uses a different URL; otherwise the workflow uses `https://serategna.com.et/api/jobs.json`.
