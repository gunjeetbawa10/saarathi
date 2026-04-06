import Link from "next/link";
import { fetchLatestBlogPosts } from "@/lib/hygraph-blog";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

export async function InsightsSection() {
  const posts = await fetchLatestBlogPosts();

  if (posts.length === 0) {
    return (
      <section className="border-y border-primary/10 bg-white px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Blog
            </p>
            <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
              Calm guidance for exceptional spaces
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-ink/70">
              Connect Hygraph to surface articles here, or visit our blog when
              content is live.
            </p>
            <Button href="/blog" variant="secondary" className="mt-8">
              View blog
            </Button>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-primary/10 bg-white px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Blog
            </p>
            <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
              Latest insights
            </h2>
          </Reveal>
          <Link
            href="/blog"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            All articles →
          </Link>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {posts.slice(0, 3).map((post, i) => (
            <BlogPostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
