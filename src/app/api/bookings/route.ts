import { NextResponse } from "next/server";
import { format } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import { insertBooking, updateBookingStripeSession } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";
import { calculateBookingPricePence, serviceLabel } from "@/lib/booking-pricing";
import { bookingApiSchema } from "@/validation/booking";

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
    const price = calculateBookingPricePence(data.service, data.propertySize);

    const { userId } = await auth();

    const booking = await insertBooking({
      service: data.service,
      property_size: data.propertySize,
      date: data.date.toISOString(),
      time: data.time,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      notes: data.notes ?? null,
      price,
      payment_status: "pending",
      clerk_user_id: userId ?? null,
    });

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: data.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: price,
            product_data: {
              name: `Saarathi — ${serviceLabel(data.service)}`,
              description: `${format(data.date, "d MMM yyyy")} · ${data.time}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/booking/cancel?id=${booking.id}`,
      metadata: { bookingId: booking.id },
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
