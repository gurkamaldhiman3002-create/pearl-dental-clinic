import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/app/lib/seo";

const publicRoutes = [
  {
    changeFrequency: "weekly",
    path: "/",
    priority: 1,
  },
  {
    changeFrequency: "monthly",
    path: "/feedback",
    priority: 0.7,
  },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    changeFrequency: route.changeFrequency,
    lastModified: new Date(),
    priority: route.priority,
    url: absoluteUrl(route.path),
  }));
}
