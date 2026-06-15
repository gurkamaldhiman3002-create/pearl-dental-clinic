import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/app/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/api/",
        "/patient/dashboard",
        "/patient/dashboard/",
      ],
      userAgent: "*",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
