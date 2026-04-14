import { NextResponse } from "next/server";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { auth, currentUser } from "@clerk/nextjs/server";
import { syncClerkUserToSupabase } from "@/lib/clerk-customer-sync";
import { getStripe } from "@/lib/stripe";
import {
  insertBooking,
  listBookingsOnLocalCalendarDay,
  updateBookingStripeSession,
} from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";
import { calculateBookingPricePence, serviceLabel } from "@/lib/booking-pricing";
import { applyCouponCodeToSubtotal } from "@/lib/coupon-db";
import {
  isKnownSlotLabel,
  occupiedSlotStartKeysFromBookings,
  parseSlotStartKey,
} from "@/lib/booking-slots";
import { bookingApiSchema } from "@/validation/booking";
import { checkPostcodeInServiceArea } from "@/lib/service-area";

const BOOKING_TZ = "Europe/London";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { error: "Database is not configured" },
        { status: 503 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payments are not configured" },
        { status: 503 }
      );
    }

    const json = await req.json();
    const parsed = bookingApiSchema.safeParse({
      ...json,
      date: json.date,
    });

    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join(". ");
      return NextResponse.json({ error: msg || "Invalid booking details" }, { status: 400 });
    }

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

    const subtotalPence = calculateBookingPricePence(data.service, data.propertySize);

    const couponResult = await applyCouponCodeToSubtotal(data.couponCode, subtotalPence);
    if (!couponResult.ok) {
      return NextResponse.json({ error: couponResult.error }, { status: 400 });
    }

    const { finalPence, discountPence, couponId, couponCode } = couponResult.result;
    const price = finalPence;
    const normalizedEmail = data.email.trim().toLowerCase();

    const { userId } = await auth();
    if (userId) {
      try {
        const u = await currentUser();
        if (u) await syncClerkUserToSupabase(u);
      } catch (e) {
        console.error("[api/bookings] clerk profile sync", e);
      }
    }

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
      price,
      payment_status: "pending",
      clerk_user_id: userId ?? null,
      subtotal_pence: subtotalPence,
      discount_pence: discountPence,
      coupon_id: couponId,
      coupon_code: couponCode,
    });

    const descParts = [
      `${format(data.date, "d MMM yyyy")} · ${data.time}`,
      discountPence > 0
        ? `Subtotal ${(subtotalPence / 100).toFixed(2)} GBP · Discount −${(discountPence / 100).toFixed(2)} GBP`
        : null,
    ].filter(Boolean);

    const origin = req.headers.get("origin")?.trim();
    const baseUrl = origin && /^https?:\/\//.test(origin) ? origin : SITE_URL;

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: normalizedEmail,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: price,
            product_data: {
              name: `Saarathi: ${serviceLabel(data.service)}`,
              description: descParts.join(" · "),
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/booking/cancel?id=${booking.id}`,
      metadata: {
        bookingId: booking.id,
        subtotalPence: String(subtotalPence),
        discountPence: String(discountPence),
        couponCode: couponCode ?? "",
      },
    });

    await updateBookingStripeSession(booking.id, session.id);

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not start checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not create booking" },
      { status: 500 }
    );
  }
}
