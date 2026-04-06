import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  fetchAllBlogPosts,
  fetchBlogPostBySlug,
} from "@/lib/hygraph-blog";
import { BlogRichContent } from "@/components/blog/BlogRichContent";
import { SITE_URL } from "@/lib/constants";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const posts = await fetchAllBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchBlogPostBySlug(params.slug);
  if (!post) return { title: "Post" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      ...(post.imageUrl && { images: [{ url: post.imageUrl }] }),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await fetchBlogPostBySlug(params.slug);
  if (!post) notFound();

  const date =
    post.publishDate &&
    (() => {
      try {
        return format(parseISO(post.publishDate), "d MMMM yyyy");
      } catch {
        return post.publishDate;
      }
    })();

  return (
    <article className="bg-cream">
      <header className="border-b border-primary/10 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
          <time className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {date}
          </time>
          <h1 className="mt-4 font-display text-4xl text-primary md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-6 text-lg text-ink/75">{post.excerpt}</p>
        </div>
      </header>
      {post.imageUrl && (
        <div className="relative mx-auto aspect-[21/9] max-w-5xl md:px-6">
          <div className="relative h-full min-h-[200px] w-full overflow-hidden md:rounded-3xl md:shadow-luxury">
            <Image
              src={post.imageUrl}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width:1200px) 100vw, 1200px"
            />
          </div>
        </div>
      )}
      <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
        {post.content ? (
          <BlogRichContent content={post.content} />
        ) : (
          <p className="text-ink/60">This post has no body content yet.</p>
        )}
      </div>
    </article>
  );
}
