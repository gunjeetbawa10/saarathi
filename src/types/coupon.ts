export type DiscountType = "percent" | "fixed";

export type CouponRow = {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_percent: number | null;
  discount_amount_pence: number | null;
  max_uses: number | null;
  uses_count: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  created_at: string;
};
