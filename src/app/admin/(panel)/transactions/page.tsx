import type { Metadata } from "next";
import { format } from "date-fns";
import { formatGbpFromPence } from "@/lib/booking-pricing";
import { listBookingsDesc } from "@/lib/supabase/server";
import { bookingFromRow } from "@/types/booking";
import { listRecentCheckoutSessions } from "@/lib/admin-stripe";
import { syncBookingPaymentFromCheckoutSession } from "@/lib/booking-payment-sync";

export const metadata: Metadata = {
  title: "Admin: Payments",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatStripeAmount(amount: number | null, currency: string | null) {
  if (amount == null) return "-";
  const upper = (currency ?? "gbp").toUpperCase();
  if (upper === "GBP") return formatGbpFromPence(amount);
  return `${(amount / 100).toFixed(2)} ${upper}`;
}

export default async function AdminTransactionsPage() {
  const stripeSessions = await listRecentCheckoutSessions(40);
  const paidSessionsToSync = stripeSessions.filter(
    (s) => s.paymentStatus === "paid" && Boolean(s.bookingId)
  );
  await Promise.all(
    paidSessionsToSync.map(async (session) => {
      try {
        await syncBookingPaymentFromCheckoutSession(session.id);
      } catch (e) {
        console.error("[admin/transactions] payment reconcile failed", e);
      }
    })
  );

  let paidFromDb: ReturnType<typeof bookingFromRow>[] = [];
  try {
    const rows = await listBookingsDesc(500);
    paidFromDb = rows
      .filter((r) => r.payment_status === "paid")
      .map(bookingFromRow);
  } catch {
    return (
      <div className="px-4 py-10 md:px-8">
        <h1 className="font-display text-3xl text-primary">Payments</h1>
        <p className="mt-4 text-ink/70">Could not load bookings from Supabase.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl text-primary">Payments</h1>
      <p className="mt-2 text-sm text-ink/60">
        Paid bookings in the database and recent Stripe Checkout sessions (if
        configured).
      </p>

      <h2 className="mt-10 font-display text-xl text-primary">Paid bookings</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-primary/10 bg-cream/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Paid / created</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Stripe session</th>
            </tr>
          </thead>
          <tbody>
            {paidFromDb.map((b) => (
              <tr key={b.id} className="border-b border-primary/5">
                <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                  {format(b.createdAt, "dd MMM yyyy HH:mm")}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{b.name}</div>
                  <div className="text-xs text-ink/60">{b.email}</div>
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatGbpFromPence(b.price)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink/70">
                  {b.stripeSessionId ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paidFromDb.length === 0 && (
          <p className="px-4 py-10 text-center text-ink/50">No paid bookings yet.</p>
        )}
      </div>

      <h2 className="mt-12 font-display text-xl text-primary">
        Stripe Checkout (recent)
      </h2>
      <p className="mt-2 text-sm text-ink/50">
        Requires <code className="rounded bg-primary/10 px-1">STRIPE_SECRET_KEY</code>.
        Empty if Stripe is not configured or there are no sessions.
      </p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-card">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-primary/10 bg-cream/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Session</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Booking ID</th>
            </tr>
          </thead>
          <tbody>
            {stripeSessions.map((s) => (
              <tr key={s.id} className="border-b border-primary/5">
                <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                  {format(new Date(s.created * 1000), "dd MMM yyyy HH:mm")}
                </td>
                <td className="max-w-[140px] truncate px-4 py-3 font-mono text-xs">
                  {s.id}
                </td>
                <td className="px-4 py-3">
                  {formatStripeAmount(s.amountTotal, s.currency)}
                </td>
                <td className="px-4 py-3">{s.paymentStatus ?? "-"}</td>
                <td className="px-4 py-3 text-ink/80">{s.customerEmail ?? "-"}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink/60">
                  {s.bookingId ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stripeSessions.length === 0 && (
          <p className="px-4 py-10 text-center text-ink/50">
            No Stripe sessions returned.
          </p>
        )}
      </div>
    </div>
  );
}
