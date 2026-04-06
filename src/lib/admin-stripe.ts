import { getStripe } from "@/lib/stripe";

export type StripeCheckoutSummary = {
  id: string;
  amountTotal: number | null;
  currency: string | null;
  paymentStatus: string | null;
  customerEmail: string | null;
  bookingId: string | null;
  created: number;
};

/** Recent Checkout sessions for the admin payments view. Returns [] if Stripe is not configured or on error. */
export async function listRecentCheckoutSessions(
  limit: number
): Promise<StripeCheckoutSummary[]> {
  if (!process.env.STRIPE_SECRET_KEY?.trim()) return [];
  try {
    const stripe = getStripe();
    const { data } = await stripe.checkout.sessions.list({ limit });
    return data.map((s) => ({
      id: s.id,
      amountTotal: s.amount_total,
      currency: s.currency,
      paymentStatus: s.payment_status,
      customerEmail:
        s.customer_details?.email ?? s.customer_email ?? null,
      bookingId: s.metadata?.bookingId ?? null,
      created: s.created,
    }));
  } catch (e) {
    console.error("[listRecentCheckoutSessions]", e);
    return [];
  }
}
