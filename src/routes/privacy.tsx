import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | EthioHub.com.et" },
      { name: "description", content: "How EthioHub.com.et handles account, job application, CV, analytics, and advertising data." },
    ],
    links: [{ rel: "canonical", href: "https://serategna.com.et/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 text-foreground">
      <Link to="/" className="text-sm text-primary hover:underline">← EthioHub.com.et home</Link>
      <article className="mt-8 max-w-none space-y-5">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: November 3, 2026</p>
        <p>EthioHub.com.et provides job listings, news, and practical tools. This policy describes the information handled when you use this website.</p>

        <h2 className="pt-3 text-xl font-semibold">Information you provide</h2>
        <p>If you create a community account, our authentication provider (Supabase) processes the account details needed to sign you in. Original jobs and applications submitted through this site are stored in a private SQLite database on the site's persistent server disk. Do not include sensitive personal information in a job listing.</p>

        <h2 className="pt-3 text-xl font-semibold">Job applications and CVs</h2>
        <p>If you apply to an original Serategna listing, we collect the name, email, phone, education or experience, optional note, and CV you submit. Your application details are stored in the site's private SQLite database and your CV is stored in a private server directory on the site's persistent disk. Only the site administrator can review applications and open CVs. Applications are associated with the job you applied for. Do not upload information you do not want considered for this role. You must consent on the form before submitting.</p>

        <h2 className="pt-3 text-xl font-semibold">Analytics and advertising</h2>
        <p>We use Google Tag Manager, Ahrefs Analytics, and Vercel Web Analytics to understand site use and improve the service. Google AdSense may use cookies or similar technologies to serve, measure, and personalize ads. Google and its advertising partners may process information about your browser and visits to this and other websites, subject to their own privacy policies and settings.</p>
        <p>You can manage or disable cookies in your browser. You can also review Google's advertising and personalization controls at <a href="https://myadcenter.google.com/" rel="noreferrer">Google My Ad Center</a>. Blocking cookies may affect some site or advertising features.</p>

        <h2 className="pt-3 text-xl font-semibold">External links and job listings</h2>
        <p>Job listings may link to external employers or job boards. Those sites control their own content and privacy practices. EthioHub.com.et does not control what information you provide after following an external application link.</p>

        <h2 className="pt-3 text-xl font-semibold">Data sharing and retention</h2>
        <p>We use service providers to host the website, process authentication, analytics, advertising, and private CV storage. They handle information under their own service terms and privacy policies. We keep account and submission information as needed to provide the service, review listings, meet legal obligations, and protect the site. Published vacancies are public; application records and CVs are not public.</p>

        <h2 className="pt-3 text-xl font-semibold">Your choices</h2>
        <p>You may choose not to apply or submit a listing. You can clear browser storage and manage cookie permissions in your browser. This website has no self-service tool for application-data export or deletion. For privacy requests, contact the site operator using the contact details published on the website. The site operator should keep an active privacy contact channel available while collecting applications.</p>

        <h2 className="pt-3 text-xl font-semibold">Changes</h2>
        <p>We may update this policy when the site or its services change. The date above shows the latest revision.</p>
      </article>
    </main>
  );
}
