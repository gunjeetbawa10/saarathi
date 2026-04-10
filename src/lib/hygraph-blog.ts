import type { RichTextContent } from "@graphcms/rich-text-types";
import { hasHygraphApiToken, tryHygraphClient } from "./hygraph";

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishDate: string;
  imageUrl?: string;
};

export type BlogPostFull = BlogPostSummary & {
  content: RichTextContent | null;
};

const POSTS_FRAGMENT = `
  id
  title
  slug
  excerpt
  publishDate
  featuredImage {
    url
  }
`;

/** Build queries; `stage` null = omit stage (Hygraph default, usually DRAFT). */
function buildQueries(stage: "PUBLISHED" | "DRAFT" | null) {
  const list = (first?: number) => {
    if (stage === null) {
      return first != null
        ? `first: ${first}, orderBy: publishDate_DESC`
        : `orderBy: publishDate_DESC`;
    }
    return first != null
      ? `first: ${first}, stage: ${stage}, orderBy: publishDate_DESC`
      : `stage: ${stage}, orderBy: publishDate_DESC`;
  };
  const one = () =>
    stage === null
      ? `where: { slug: $slug }`
      : `where: { slug: $slug }, stage: ${stage}`;

  return {
    latestUpper: `
    query LatestBlogPosts {
      BlogPosts(${list(3)}) {
        ${POSTS_FRAGMENT}
      }
    }
  `,
    latestLower: `
    query LatestBlogPosts {
      blogPosts(${list(3)}) {
        ${POSTS_FRAGMENT}
      }
    }
  `,
    allUpper: `
    query AllBlogPosts {
      BlogPosts(${list()}) {
        ${POSTS_FRAGMENT}
      }
    }
  `,
    allLower: `
    query AllBlogPosts {
      blogPosts(${list()}) {
        ${POSTS_FRAGMENT}
      }
    }
  `,
    oneUpper: `
    query BlogPostBySlug($slug: String!) {
      BlogPost(${one()}) {
        ${POSTS_FRAGMENT}
        content {
          raw
        }
      }
    }
  `,
    oneLower: `
    query BlogPostBySlug($slug: String!) {
      blogPost(${one()}) {
        ${POSTS_FRAGMENT}
        content {
          raw
        }
      }
    }
  `,
  };
}

function is403Error(e: unknown): boolean {
  const msg = String(e);
  return msg.includes('"403"') || msg.includes("not allowed") || msg.includes("403");
}

/** Hygraph returns 403 when the Content API blocks access to a model or stage. */
function logHygraphAccessDenied(context: string, e: unknown) {
  if (!is403Error(e)) return;
  const hasToken = hasHygraphApiToken();
  console.error(`[Hygraph ${context}] Access denied (403).`);
  if (!hasToken) {
    console.error(
      `  → Set HYGRAPH_API_TOKEN in .env.local (Permanent Auth Token with Content API read). Restart: npm run dev`
    );
  } else {
    console.error(
      `  → In Hygraph: Settings → API Access → open your token → ensure permissions include read on BlogPost for the PUBLISHED stage (and Content API for this environment).`
    );
  }
}

function mapPost(p: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishDate: string;
  featuredImage?: { url: string } | null;
}): BlogPostSummary {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    publishDate: p.publishDate,
    imageUrl: p.featuredImage?.url,
  };
}

async function requestListUpperThenLower(
  client: import("graphql-request").GraphQLClient,
  q: ReturnType<typeof buildQueries>
): Promise<unknown[]> {
  try {
    const data = await client.request<{ BlogPosts: unknown[] }>(q.latestUpper);
    return data.BlogPosts ?? [];
  } catch {
    const data = await client.request<{ blogPosts: unknown[] }>(q.latestLower);
    return data.blogPosts ?? [];
  }
}

async function requestAllUpperThenLower(
  client: import("graphql-request").GraphQLClient,
  q: ReturnType<typeof buildQueries>
): Promise<unknown[]> {
  try {
    const data = await client.request<{ BlogPosts: unknown[] }>(q.allUpper);
    return data.BlogPosts ?? [];
  } catch {
    const data = await client.request<{ blogPosts: unknown[] }>(q.allLower);
    return data.blogPosts ?? [];
  }
}

async function requestOneUpperThenLower(
  client: import("graphql-request").GraphQLClient,
  q: ReturnType<typeof buildQueries>,
  slug: string
): Promise<
  | (Parameters<typeof mapPost>[0] & {
      content?: { raw: RichTextContent } | null;
    })
  | null
> {
  try {
    const data = await client.request<{
      BlogPost:
        | (Parameters<typeof mapPost>[0] & {
            content?: { raw: RichTextContent } | null;
          })
        | null;
    }>(q.oneUpper, { slug });
    return data.BlogPost;
  } catch {
    const data = await client.request<{
      blogPost:
        | (Parameters<typeof mapPost>[0] & {
            content?: { raw: RichTextContent } | null;
          })
        | null;
    }>(q.oneLower, { slug });
    return data.blogPost;
  }
}

/** Try PUBLISHED first, then default stage, then DRAFT (token may only allow some stages). */
const STAGE_FALLBACK: Array<"PUBLISHED" | "DRAFT" | null> = [
  "PUBLISHED",
  null,
  "DRAFT",
];

export async function fetchLatestBlogPosts(): Promise<BlogPostSummary[]> {
  const client = tryHygraphClient();
  if (!client) return [];

  let last403: unknown;
  for (const stage of STAGE_FALLBACK) {
    const q = buildQueries(stage);
    try {
      const posts = await requestListUpperThenLower(client, q);
      if (posts.length > 0) {
        if (stage !== "PUBLISHED") {
          console.warn(
            `[Hygraph] Latest posts loaded using ${stage === null ? "default" : stage} stage (PUBLISHED empty or blocked). Prefer granting read on PUBLISHED for production.`
          );
        }
        return posts.map((p) => mapPost(p as Parameters<typeof mapPost>[0]));
      }
    } catch (e) {
      if (is403Error(e)) {
        last403 = e;
        continue;
      }
      console.error("Hygraph latest posts:", e);
      return [];
    }
  }
  if (last403) {
    logHygraphAccessDenied("latest posts", last403);
    console.error("Hygraph latest posts:", last403);
  }
  return [];
}

export async function fetchAllBlogPosts(): Promise<BlogPostSummary[]> {
  const client = tryHygraphClient();
  if (!client) return [];

  let last403: unknown;
  for (const stage of STAGE_FALLBACK) {
    const q = buildQueries(stage);
    try {
      const posts = await requestAllUpperThenLower(client, q);
      if (posts.length > 0) {
        if (stage !== "PUBLISHED") {
          console.warn(
            `[Hygraph] All posts loaded using ${stage === null ? "default" : stage} stage (PUBLISHED empty or blocked). Prefer granting read on PUBLISHED for production.`
          );
        }
        return posts.map((p) => mapPost(p as Parameters<typeof mapPost>[0]));
      }
    } catch (e) {
      if (is403Error(e)) {
        last403 = e;
        continue;
      }
      console.error("Hygraph all posts:", e);
      return [];
    }
  }
  if (last403) {
    logHygraphAccessDenied("all posts", last403);
    console.error("Hygraph all posts:", last403);
  }
  return [];
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPostFull | null> {
  const client = tryHygraphClient();
  if (!client) return null;

  let last403: unknown;
  for (const stage of STAGE_FALLBACK) {
    const q = buildQueries(stage);
    try {
      const p = await requestOneUpperThenLower(client, q, slug);
      if (p) {
        if (stage !== "PUBLISHED") {
          console.warn(
            `[Hygraph] Post "${slug}" loaded using ${stage === null ? "default" : stage} stage.`
          );
        }
        return {
          ...mapPost(p),
          content: p.content?.raw ?? null,
        };
      }
    } catch (e) {
      if (is403Error(e)) {
        last403 = e;
        continue;
      }
      console.error("Hygraph post by slug:", e);
      return null;
    }
  }
  if (last403) {
    logHygraphAccessDenied("post by slug", last403);
    console.error("Hygraph post by slug:", last403);
  }
  return null;
}
