import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { fetchAllBlogPosts } from "@/lib/hygraph-blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const posts = await fetchAllBlogPosts();
    return posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishDate),
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    // Hygraph can be optional in some environments.
    return [];
  }
}
