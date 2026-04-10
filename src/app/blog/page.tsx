import type { Metadata } from "next";
import { fetchAllBlogPosts } from "@/lib/hygraph-blog";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Articles on luxury property care, turnovers, and maintaining exceptional spaces from Saarathi Services.",
};

export default async function BlogPage() {
  const posts = await fetchAllBlogPosts();

  return (
    <div className="bg-cream">
      <section className="border-b border-primary/10 bg-white px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Blog
            </p>
            <h1 className="mt-3 font-display text-4xl text-primary md:text-5xl">
              Insights
            </h1>
            <p className="mt-4 max-w-2xl text-ink/70">
              Practical perspective on keeping homes, rentals, and workplaces
              at their best, powered by Hygraph.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        {posts.length === 0 ? (
          <Reveal>
            <p className="max-w-xl text-ink/70">
              No posts yet. Add the <code className="rounded bg-primary/10 px-1">BlogPost</code>{" "}
              model in Hygraph (see README), publish content, and posts will
              appear here automatically.
            </p>
          </Reveal>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <BlogPostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
