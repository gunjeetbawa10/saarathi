import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-session";
import { insertCoupon, listCouponsDesc } from "@/lib/coupon-db";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  code: z.string().min(2).max(40),
  discount_type: z.enum(["percent", "fixed"]),
  discount_percent: z.number().int().min(1).max(100).optional().nullable(),
  discount_amount_pence: z.number().int().min(1).optional().nullable(),
  max_uses: z.number().int().min(1).optional().nullable(),
  valid_until: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  try {
    const coupons = await listCouponsDesc();
    return NextResponse.json({ coupons });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not load coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coupon fields" }, { status: 400 });
  }

  const d = parsed.data;
  if (d.discount_type === "percent" && (d.discount_percent == null || d.discount_percent < 1)) {
    return NextResponse.json({ error: "Percent coupons need a discount between 1 and 100." }, { status: 400 });
  }
  if (d.discount_type === "fixed" && (d.discount_amount_pence == null || d.discount_amount_pence < 1)) {
    return NextResponse.json(
      { error: "Fixed coupons need an amount in pence (e.g. 500 for £5)." },
      { status: 400 }
    );
  }

  let validUntilIso: string | null = null;
  if (d.valid_until?.trim()) {
    const t = new Date(d.valid_until.trim());
    if (!Number.isNaN(t.getTime())) validUntilIso = t.toISOString();
  }

  try {
    const row = await insertCoupon({
      code: d.code,
      discount_type: d.discount_type,
      discount_percent: d.discount_type === "percent" ? d.discount_percent ?? null : null,
      discount_amount_pence: d.discount_type === "fixed" ? d.discount_amount_pence ?? null : null,
      max_uses: d.max_uses ?? null,
      valid_until: validUntilIso,
      active: d.active ?? true,
    });
    return NextResponse.json({ coupon: row });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return NextResponse.json({ error: "A coupon with that code already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not create coupon" }, { status: 500 });
  }
}
