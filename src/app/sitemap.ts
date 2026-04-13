import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { fetchAllBlogPosts } from "@/lib/hygraph-blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const staticPaths = [
    "",
    "/services",
    "/booking",
    "/blog",
    "/about",
    "/contact",
    "/terms-and-conditions",
    "/privacy-policy",
    "/cancellation-refund-policy",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await fetchAllBlogPosts();
    blogEntries = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.publishDate),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    /* Hygraph optional at build */
  }

  return [...staticEntries, ...blogEntries];
}
