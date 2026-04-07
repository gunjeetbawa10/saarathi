import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { CouponRow } from "@/types/coupon";
import { finalizeDiscount, rawDiscountFromCoupon } from "@/lib/coupon-discount";

export async function getCouponByCode(normalizedCode: string): Promise<CouponRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle();

  if (error) throw error;
  return data ? (data as CouponRow) : null;
}

export async function listCouponsDesc(): Promise<CouponRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CouponRow[];
}

export type InsertCouponInput = {
  code: string;
  discount_type: "percent" | "fixed";
  discount_percent: number | null;
  discount_amount_pence: number | null;
  max_uses: number | null;
  valid_until: string | null;
  active: boolean;
};

export async function insertCoupon(input: InsertCouponInput): Promise<CouponRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code: input.code.trim().toUpperCase(),
      discount_type: input.discount_type,
      discount_percent: input.discount_percent,
      discount_amount_pence: input.discount_amount_pence,
      max_uses: input.max_uses,
      valid_until: input.valid_until,
      active: input.active,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CouponRow;
}

export async function incrementCouponUse(couponId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.rpc("increment_coupon_use", {
    coupon_uuid: couponId,
  });
  if (error) throw error;
}

function isCouponRowUsable(coupon: CouponRow, now: Date): string | null {
  if (!coupon.active) return "This coupon is not active.";
  const from = new Date(coupon.valid_from);
  if (now < from) return "This coupon is not valid yet.";
  if (coupon.valid_until) {
    const until = new Date(coupon.valid_until);
    if (now > until) return "This coupon has expired.";
  }
  if (coupon.max_uses != null && coupon.uses_count >= coupon.max_uses) {
    return "This coupon has reached its usage limit.";
  }
  return null;
}

export type AppliedCouponResult = {
  couponId: string | null;
  couponCode: string | null;
  subtotalPence: number;
  discountPence: number;
  finalPence: number;
};

/**
 * Resolves optional coupon code against DB. Invalid / unusable codes return an error string.
 */
export async function applyCouponCodeToSubtotal(
  code: string | undefined | null,
  subtotalPence: number
): Promise<{ ok: true; result: AppliedCouponResult } | { ok: false; error: string }> {
  const trimmed = code?.trim();
  if (!trimmed) {
    return {
      ok: true,
      result: {
        couponId: null,
        couponCode: null,
        subtotalPence,
        discountPence: 0,
        finalPence: subtotalPence,
      },
    };
  }

  const normalized = trimmed.toUpperCase();
  const coupon = await getCouponByCode(normalized);
  if (!coupon) {
    return { ok: false, error: "That coupon code is not valid." };
  }

  const why = isCouponRowUsable(coupon, new Date());
  if (why) return { ok: false, error: why };

  const raw = rawDiscountFromCoupon(subtotalPence, coupon);
  const { discountPence, finalPence } = finalizeDiscount(subtotalPence, raw);

  return {
    ok: true,
    result: {
      couponId: coupon.id,
      couponCode: coupon.code,
      subtotalPence,
      discountPence,
      finalPence,
    },
  };
}
