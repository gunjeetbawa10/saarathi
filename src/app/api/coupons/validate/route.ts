import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateBookingPricePence } from "@/lib/booking-pricing";
import { applyCouponCodeToSubtotal } from "@/lib/coupon-db";
import { BookingAddOnEnum, PropertySizeEnum, ServiceTypeEnum } from "@/types/booking";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  code: z.string().optional(),
  service: z.nativeEnum(ServiceTypeEnum),
  propertySize: z.nativeEnum(PropertySizeEnum),
  addOns: z.array(z.nativeEnum(BookingAddOnEnum)).default([]),
});

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const subtotalPence = calculateBookingPricePence(
      parsed.data.service,
      parsed.data.propertySize,
      parsed.data.addOns
    );

    const applied = await applyCouponCodeToSubtotal(parsed.data.code, subtotalPence);
    if (!applied.ok) {
      return NextResponse.json({ error: applied.error }, { status: 400 });
    }

    const r = applied.result;
    return NextResponse.json({
      subtotalPence: r.subtotalPence,
      discountPence: r.discountPence,
      finalPence: r.finalPence,
      couponCode: r.couponCode,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not validate coupon" }, { status: 500 });
  }
}
