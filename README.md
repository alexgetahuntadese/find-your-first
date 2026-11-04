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

## Administrator workflow

- Set a strong `ADMIN_PASSWORD` server environment variable.
- Open `/admin`, sign in with that password, and publish or close original jobs.
- Community accounts and employer job submissions continue to use the configured Supabase project.

The site administrator publishes original jobs with the admin password configured as `ADMIN_PASSWORD`. Original job records and applicant details are stored in SQLite; CVs are stored in a private `cvs/` directory beside the database. Set `APP_DATA_DIR` to a persistent disk path in production. Local development defaults to `./data`.

`render.yaml` deploys the Node server with a persistent disk mounted at `/var/data`. Render prompts for the `ADMIN_PASSWORD` secret when the Blueprint is connected. The disk plan is required for job and CV data to survive deploys. Community accounts and employer-submitted jobs still use Supabase and require `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Original job publishing

Open `/admin` with the server's `ADMIN_PASSWORD`. Use **Publish an original job** to add an accurate, verified vacancy. It is published immediately, appears in the public job feed and relevant landing pages, gets an on-site application form and JobPosting structured data, and is added to `/sitemap.xml`. Close filled or expired vacancies from the admin list so they are removed from public pages and the sitemap. Search engines decide when to recrawl the sitemap; publishing does not guarantee immediate indexing.

Applicants can submit their name, email, phone, education or experience, an optional note, and a PDF or DOCX CV (up to 5 MB) without creating an account. CV files are not served from a public directory; the admin-only resume endpoint reads them from the private persistent disk.

### Daily Telegram job posts

The `Post new site jobs to Telegram` GitHub Actions workflow checks the public jobs feed daily at 9:45 AM Addis Ababa time. It posts each newly listed job as a separate message with a formatted summary and an **Apply now** button. Previously posted jobs are tracked so daily checks do not repost them.

Add these repository Actions secrets:

- `TELEGRAM_BOT_TOKEN`: token for a Telegram bot that can post in the channel.
- `TELEGRAM_CHAT_ID`: the channel username (for example, `@yourchannel`) or numeric chat ID.

The bot must be added as a channel administrator with permission to post. Optionally set the repository variable `SITE_JOBS_URL` if the public feed endpoint uses a different URL; otherwise the workflow uses `https://serategna.com.et/api/jobs.json`.
