import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: "https://paluch-hair.pl/",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://paluch-hair.pl/gallery",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://paluch-hair.pl/pricing",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
