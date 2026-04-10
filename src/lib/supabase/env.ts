/** Trim keys and strip trailing slash; bad .env line endings break fetch URLs. */
export function normalizeSupabaseUrl(url: string | undefined): string {
  return (url ?? "").trim().replace(/\/$/, "");
}
