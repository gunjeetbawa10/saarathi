import { NextResponse } from "next/server";
import { formatInTimeZone } from "date-fns-tz";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-session";
import {
  insertBooking,
  listBookingsOnLocalCalendarDay,
} from "@/lib/supabase/server";
import { bookingApiSchema } from "@/validation/booking";
import { checkPostcodeInServiceArea } from "@/lib/service-area";
import { applyCouponCodeToSubtotal } from "@/lib/coupon-db";
import { calculateBookingPricePence } from "@/lib/booking-pricing";
import {
  isKnownSlotLabel,
  occupiedSlotStartKeysFromBookings,
  parseSlotStartKey,
} from "@/lib/booking-slots";
import { bookingFromRow } from "@/types/booking";
import {
  sendBookingConfirmedToCustomer,
  sendNewBookingToAdmin,
} from "@/lib/emails";

const BOOKING_TZ = "Europe/London";

export const dynamic = "force-dynamic";

const adminCreateBookingSchema = bookingApiSchema.and(
  z.object({
    paymentStatus: z.enum(["pending", "paid"]).default("pending"),
  })
);

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 503 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adminCreateBookingSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(". ");
    return NextResponse.json(
      { error: msg || "Invalid booking details" },
      { status: 400 }
    );
  }

  try {
    const data = parsed.data;

    const area = await checkPostcodeInServiceArea(data.postcode);
    if (!area.ok) {
      return NextResponse.json({ error: area.message }, { status: 400 });
    }

    if (!isKnownSlotLabel(data.time)) {
      return NextResponse.json({ error: "Invalid time slot" }, { status: 400 });
    }

    const ymd = formatInTimeZone(data.date, BOOKING_TZ, "yyyy-MM-dd");
    const dayRows = await listBookingsOnLocalCalendarDay(ymd);
    const occupied = occupiedSlotStartKeysFromBookings(dayRows);
    const key = parseSlotStartKey(data.time);
    if (key && occupied.has(key)) {
      return NextResponse.json(
        {
          error:
            "That time is no longer available. Please choose another slot or date.",
        },
        { status: 409 }
      );
    }

    const subtotalPence = calculateBookingPricePence(
      data.service,
      data.propertySize,
      data.addOns
    );
    const couponResult = await applyCouponCodeToSubtotal(
      data.couponCode,
      subtotalPence
    );
    if (!couponResult.ok) {
      return NextResponse.json({ error: couponResult.error }, { status: 400 });
    }

    const { finalPence, discountPence, couponId, couponCode } =
      couponResult.result;
    const normalizedEmail = data.email.trim().toLowerCase();

    const booking = await insertBooking({
      service: data.service,
      property_size: data.propertySize,
      date: data.date.toISOString(),
      time: data.time,
      name: data.name,
      email: normalizedEmail,
      phone: data.phone,
      postcode: area.postcode,
      address: data.address,
      notes: data.notes ?? null,
      price: finalPence,
      payment_status: data.paymentStatus,
      clerk_user_id: null,
      subtotal_pence: subtotalPence,
      discount_pence: discountPence,
      coupon_id: couponId,
      coupon_code: couponCode,
      add_ons: data.addOns,
    });

    const bookingModel = bookingFromRow(booking);
    try {
      await sendNewBookingToAdmin(bookingModel);
    } catch (e) {
      console.error("[api/admin/bookings] admin booking email", e);
    }
    try {
      await sendBookingConfirmedToCustomer(bookingModel);
    } catch (e) {
      console.error("[api/admin/bookings] customer booking email", e);
    }

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (e) {
    console.error("[api/admin/bookings] create booking", e);
    return NextResponse.json(
      { error: "Could not create booking" },
      { status: 500 }
    );
  }
}
