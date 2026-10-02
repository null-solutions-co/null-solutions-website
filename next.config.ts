import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
let apiOrigin = "";
let apiWs = "";
try {
  const u = new URL(apiUrl);
  apiOrigin = u.origin;
  apiWs = `${u.protocol === "https:" ? "wss:" : "ws:"}//${u.host}`;
} catch {
  /* NEXT_PUBLIC_API_URL not set / not a URL */
}

const isProd = process.env.NODE_ENV === "production";
/**
 * HTTPS-only rules (upgrade-insecure-requests, HSTS). Off when a production
 * build is opened from a phone over the local network for testing
 * (LOCAL_HTTP_PREVIEW=1 at build time): that link is plain http, and the
 * upgrade made the phone fetch the CSS over https and fail.
 */
const httpsOnly = isProd && process.env.LOCAL_HTTP_PREVIEW !== "1";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (isProd ? "" : " 'unsafe-eval'"),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin} ${apiWs}`.trim(),
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  httpsOnly ? "upgrade-insecure-requests" : "",
]
  .filter(Boolean)
  .join("; ");

/**
 * Sent on every response. Beyond the usual:
 * - frame-ancestors / X-Frame-Options: nobody can load the site inside their
 *   own page (clickjacking, or a lookalike wrapping the real thing);
 * - Cross-Origin-Resource-Policy: other sites can't hotlink our scripts,
 *   styles, fonts or images, so a copied page doesn't work off our assets;
 * - Cross-Origin-Opener-Policy: a window we open can't reach back into ours.
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  ...(httpsOnly
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

/** Private surfaces stay out of search engines, whatever robots.txt says. */
const PRIVATE = "(dashboard|projects|invoices|documents|notifications|requests|partner|admin|team)";
const noIndex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/:path*", headers: [...noIndex, { key: "Cache-Control", value: "no-store" }] },
      { source: `/:p${PRIVATE}/:rest*`, headers: noIndex },
      { source: `/ar/:p${PRIVATE}/:rest*`, headers: noIndex },
    ];
  },
  async redirects() {
    return [
      { source: "/case-studies", destination: "/portfolio", permanent: true },
      { source: "/ar/case-studies", destination: "/ar/portfolio", permanent: true },
      // Netlify runs the locale middleware first, which turns /case-studies into /en/case-studies
      { source: "/en/case-studies", destination: "/portfolio", permanent: true },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
