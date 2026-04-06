import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { markBookingPaidIfPending } from "@/lib/supabase/server";
import { bookingFromRow } from "@/types/booking";
import {
  sendBookingConfirmedToCustomer,
  sendNewBookingToAdmin,
} from "@/lib/emails";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !whSecret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, whSecret);
  } catch (err) {
    console.error("Stripe webhook signature failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      return NextResponse.json({ received: true });
    }

    try {
      const updated = await markBookingPaidIfPending(bookingId, session.id);

      if (updated) {
        const booking = bookingFromRow(updated);
        try {
          await sendBookingConfirmedToCustomer(booking);
        } catch (e) {
          console.error("Customer email failed", e);
        }
        try {
          await sendNewBookingToAdmin(booking);
        } catch (e) {
          console.error("Admin email failed", e);
        }
      }
    } catch (e) {
      console.error("Supabase booking update failed", e);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
