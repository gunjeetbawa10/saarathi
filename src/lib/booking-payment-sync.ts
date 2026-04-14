import type { Booking } from "@/types/booking";
import { bookingFromRow } from "@/types/booking";
import { getStripe } from "@/lib/stripe";
import { getBookingById, markBookingPaidIfPending } from "@/lib/supabase/server";
import { incrementCouponUse } from "@/lib/coupon-db";

type SyncResult = {
  booking: Booking | null;
  changed: boolean;
};

/** Reconciles DB payment status using a Stripe Checkout session id. */
export async function syncBookingPaymentFromCheckoutSession(
  checkoutSessionId: string
): Promise<SyncResult> {
  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return { booking: null, changed: false };
  }

  const session = await getStripe().checkout.sessions.retrieve(checkoutSessionId);
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    return { booking: null, changed: false };
  }

  if (session.payment_status !== "paid") {
    return { booking: null, changed: false };
  }

  const updated = await markBookingPaidIfPending(bookingId, session.id);
  if (updated) {
    if (updated.coupon_id) {
      try {
        await incrementCouponUse(updated.coupon_id);
      } catch (e) {
        console.error("[syncBookingPaymentFromCheckoutSession] coupon increment failed", e);
      }
    }
    return { booking: bookingFromRow(updated), changed: true };
  }

  const existing = await getBookingById(bookingId);
  return { booking: existing ? bookingFromRow(existing) : null, changed: false };
}
