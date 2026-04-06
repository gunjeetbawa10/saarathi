import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "admin_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

/** Prefer `ADMIN_SESSION_SECRET`; `ADMIN_SECRET` is accepted as a legacy fallback for the same signing purpose. */
function getSigningSecret(): string | null {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_SECRET?.trim() ||
    null
  );
}

export function getAdminSessionMaxAgeSec(): number {
  return MAX_AGE_SEC;
}

/** Create signed cookie value: base64url(payload).hmac */
export async function createAdminSessionToken(username: string): Promise<string> {
  const secret = getSigningSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = Buffer.from(JSON.stringify({ u: username, exp }), "utf8").toString(
    "base64url"
  );
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string): { username: string } | null {
  const secret = getSigningSecret();
  if (!secret) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  try {
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      u: string;
      exp: number;
    };
    if (typeof json.exp !== "number" || typeof json.u !== "string") return null;
    if (json.exp < Math.floor(Date.now() / 1000)) return null;
    return { username: json.u };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<{ username: string } | null> {
  if (!getSigningSecret()) return null;
  const store = cookies();
  const raw = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!raw) return null;
  return verifyAdminSessionToken(raw);
}

/** Redirects to login if not authenticated or session secret missing (treated as logged out). */
export async function requireAdminSession(): Promise<{ username: string }> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export function isAdminSessionConfigured(): boolean {
  return Boolean(getSigningSecret());
}
