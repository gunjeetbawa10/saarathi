import type { CouponRow } from "@/types/coupon";

/** Stripe/card minimum charge in GBP pence (safety floor for checkout). */
export const STRIPE_MIN_CHARGE_PENCE = 30;

export function rawDiscountFromCoupon(subtotalPence: number, coupon: CouponRow): number {
  if (coupon.discount_type === "percent" && coupon.discount_percent != null) {
    return Math.floor((subtotalPence * coupon.discount_percent) / 100);
  }
  if (coupon.discount_type === "fixed" && coupon.discount_amount_pence != null) {
    return Math.min(subtotalPence, coupon.discount_amount_pence);
  }
  return 0;
}

/** Caps discount so final amount stays at or above minimum charge. */
export function finalizeDiscount(
  subtotalPence: number,
  rawDiscountPence: number
): { discountPence: number; finalPence: number } {
  const maxDiscount = Math.max(0, subtotalPence - STRIPE_MIN_CHARGE_PENCE);
  const discountPence = Math.min(Math.max(0, rawDiscountPence), maxDiscount);
  const finalPence = subtotalPence - discountPence;
  return { discountPence, finalPence };
}
