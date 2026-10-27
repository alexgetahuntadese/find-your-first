import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | EthioHub.com.et" },
      { name: "description", content: "How EthioHub.com.et uses account, job submission, analytics, and advertising data." },
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
        <p className="text-sm text-muted-foreground">Last updated: October 27, 2026</p>
        <p>EthioHub.com.et provides job listings, news, and practical tools. This policy describes the information handled when you use this website.</p>

        <h2 className="pt-3 text-xl font-semibold">Information you provide</h2>
        <p>If you create an account, our authentication provider (Supabase) processes the account details needed to sign you in. If you submit a job, we process the role, company, application, and hiring contact details you provide so the listing can be reviewed. Do not include sensitive personal information in a job listing. Job submissions are reviewed before publication; hiring contact details are not intended for public display.</p>

        <h2 className="pt-3 text-xl font-semibold">Analytics and advertising</h2>
        <p>We use Google Tag Manager, Ahrefs Analytics, and Vercel Web Analytics to understand site use and improve the service. Google AdSense may use cookies or similar technologies to serve, measure, and personalize ads. Google and its advertising partners may process information about your browser and visits to this and other websites, subject to their own privacy policies and settings.</p>
        <p>You can manage or disable cookies in your browser. You can also review Google's advertising and personalization controls at <a href="https://myadcenter.google.com/" rel="noreferrer">Google My Ad Center</a>. Blocking cookies may affect some site or advertising features.</p>

        <h2 className="pt-3 text-xl font-semibold">External links and job listings</h2>
        <p>Job listings may link to external employers or job boards. Those sites control their own content and privacy practices. EthioHub.com.et does not control what information you provide after following an external application link.</p>

        <h2 className="pt-3 text-xl font-semibold">Data sharing and retention</h2>
        <p>We use service providers to host the website, process authentication, analytics, and advertising. They handle information under their own service terms and privacy policies. We keep account and submission information as needed to provide the service, review listings, meet legal obligations, and protect the site.</p>

        <h2 className="pt-3 text-xl font-semibold">Your choices</h2>
        <p>You may choose not to create an account or submit a listing. You can clear browser storage and manage cookie permissions in your browser. This website currently has no self-service tool for data export or deletion; a direct privacy request channel should be published by the site operator before collecting account or hiring contact information.</p>

        <h2 className="pt-3 text-xl font-semibold">Changes</h2>
        <p>We may update this policy when the site or its services change. The date above shows the latest revision.</p>
      </article>
    </main>
  );
}
