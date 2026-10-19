import type { MetadataRoute } from "next";

import { APP_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: APP_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/register`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${APP_URL}/login`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_URL}/send`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
