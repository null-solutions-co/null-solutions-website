import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const PRIVATE = ["/dashboard", "/projects", "/invoices", "/documents", "/notifications", "/requests", "/partner", "/admin", "/team"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", ...PRIVATE.flatMap((p) => [p, `/ar${p}`])],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
