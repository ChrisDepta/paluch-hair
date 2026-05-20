import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://paluch-hair.pl/sitemap.xml",
    host: "https://paluch-hair.pl",
  };
}
