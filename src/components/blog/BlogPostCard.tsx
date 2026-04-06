"use client";

import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import type { BlogPostSummary } from "@/lib/hygraph-blog";
import { motion } from "framer-motion";

export function BlogPostCard({
  post,
  index = 0,
}: {
  post: BlogPostSummary;
  index?: number;
}) {
  const date =
    post.publishDate &&
    (() => {
      try {
        return format(parseISO(post.publishDate), "d MMM yyyy");
      } catch {
        return post.publishDate;
      }
    })();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-luxury"
    >
      <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] w-full overflow-hidden">
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary/10 font-display text-2xl text-primary/40">
            Insight
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <time className="text-xs font-medium uppercase tracking-wider text-accent">
          {date}
        </time>
        <h3 className="mt-2 font-display text-xl text-primary group-hover:text-primary/80">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink/70">{post.excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Read article
        </Link>
      </div>
    </motion.article>
  );
}
