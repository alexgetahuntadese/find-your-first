import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "_EbEVXSgjtdwMhRTP9dr8I6Y67zhdkox1Nm-EHeSC-I" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { title: "EthioHub.com.et — Ethiopia Jobs, News, Tools & Opportunities" },
      { name: "description", content: "Find internships, entry-level jobs, Ethiopian news, business listings, calculators, converters, and practical tools on EthioHub.com.et." },
      { name: "theme-color", content: "#eff2fa" },
      { property: "og:site_name", content: "EthioHub.com.et" },
      { property: "og:url", content: "https://serategna.com.et/" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "EthioHub.com.et — Ethiopia Jobs, News, Tools & Opportunities" },
      { property: "og:description", content: "Jobs, Ethiopian news, business listings, and practical tools in one useful platform." },
      { property: "og:image", content: "https://serategna.com.et/og-image.svg" },
      { property: "og:image:alt", content: "EthioHub.com.et — Ethiopia jobs, news, and tools" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "EthioHub.com.et — Ethiopia Jobs, News, Tools & Opportunities" },
      { name: "twitter:description", content: "Jobs, Ethiopian news, business listings, and practical tools in one useful platform." },
      { name: "twitter:image", content: "https://serategna.com.et/og-image.svg" },
    ],
    links: [
      { rel: "canonical", href: "https://serategna.com.et/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/logo.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          async
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="vdRf1ofq5DFMBt7kUNCVfg"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MWXGSZ5W');`,
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9108560356664628"
          crossOrigin="anonymous"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://serategna.com.et/#website",
          name: "EthioHub.com.et",
          url: "https://serategna.com.et/",
          inLanguage: ["en", "am"],
          description: "Ethiopia jobs, news, business listings, and practical online tools.",
          publisher: { "@id": "https://serategna.com.et/#organization" },
          potentialAction: { "@type": "SearchAction", target: "https://serategna.com.et/?q={search_term_string}", "query-input": "required name=search_term_string" },
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://serategna.com.et/#organization",
          name: "EthioHub.com.et",
          url: "https://serategna.com.et/",
          logo: "https://serategna.com.et/logo.svg",
          areaServed: { "@type": "Country", name: "Ethiopia" },
        }) }} />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MWXGSZ5W"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster theme="light" position="bottom-center" />
      <Analytics />
    </QueryClientProvider>
  );
}


