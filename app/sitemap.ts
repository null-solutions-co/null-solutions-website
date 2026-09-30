import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const PUBLIC_PATHS = ["", "/services", "/about", "/portfolio", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}${path || "/"}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
    alternates: {
      languages: {
        en: `${siteUrl}${path || "/"}`,
        ar: `${siteUrl}/ar${path}`,
      },
    },
  }));
}
