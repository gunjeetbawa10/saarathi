import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { syncBookingPaymentFromCheckoutSession } from "@/lib/booking-payment-sync";
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
    if (!session.id) {
      return NextResponse.json({ received: true });
    }

    try {
      const synced = await syncBookingPaymentFromCheckoutSession(session.id);

      if (synced.booking && synced.changed) {
        try {
          await sendBookingConfirmedToCustomer(synced.booking);
        } catch (e) {
          console.error("Customer email failed", e);
        }
        try {
          await sendNewBookingToAdmin(synced.booking);
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
