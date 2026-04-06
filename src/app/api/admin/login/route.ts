import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionMaxAgeSec,
} from "@/lib/admin-session";
import { getAdminByUsername } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  if (
    !process.env.ADMIN_SESSION_SECRET?.trim() &&
    !process.env.ADMIN_SECRET?.trim()
  ) {
    return NextResponse.json(
      {
        error:
          "Server is not configured (set ADMIN_SESSION_SECRET or ADMIN_SECRET)",
      },
      { status: 503 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { username, password } = parsed.data;

  let row: Awaited<ReturnType<typeof getAdminByUsername>>;
  try {
    row = await getAdminByUsername(username);
  } catch (e) {
    console.error("[admin/login]", e);
    return NextResponse.json(
      { error: "Could not verify credentials" },
      { status: 500 }
    );
  }

  if (!row) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  let token: string;
  try {
    token = await createAdminSessionToken(row.username);
  } catch (e) {
    console.error("[admin/login] session", e);
    return NextResponse.json({ error: "Could not create session" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getAdminSessionMaxAgeSec(),
  });
  return res;
}
