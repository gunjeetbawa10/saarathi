import type { Metadata } from "next";
import { format } from "date-fns";
import Link from "next/link";
import { listBookingsDesc } from "@/lib/supabase/server";
import { bookingFromRow } from "@/types/booking";
import { formatGbpFromPence, serviceLabel } from "@/lib/booking-pricing";
import { listRecentCheckoutSessions } from "@/lib/admin-stripe";
import { syncBookingPaymentFromCheckoutSession } from "@/lib/booking-payment-sync";
import { AdminBookingsCalendar } from "@/components/admin/AdminBookingsCalendar";
import { CancelBookingButton } from "@/components/booking/CancelBookingButton";

export const metadata: Metadata = {
  title: "Admin: Bookings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function sizeLabel(s: string) {
  const m: Record<string, string> = {
    ONE_BED: "1 bed",
    TWO_BED: "2 bed",
    THREE_BED: "3 bed",
    FOUR_PLUS: "4+",
  };
  return m[s] ?? s;
}

function formatStripeAmount(amount: number | null, currency: string | null) {
  if (amount == null) return "-";
  const upper = (currency ?? "gbp").toUpperCase();
  if (upper === "GBP") return formatGbpFromPence(amount);
  return `${(amount / 100).toFixed(2)} ${upper}`;
}

export default async function AdminBookingsPage() {
  let bookings: ReturnType<typeof bookingFromRow>[] = [];
  let bookingsError = false;
  try {
    const rows = await listBookingsDesc(200);
    bookings = rows.map(bookingFromRow);
  } catch (e) {
    bookingsError = true;
    console.error("[admin/bookings] listBookingsDesc failed", e);
  }

  if (bookings.length > 0) {
    const candidates = bookings
      .filter((b) => b.paymentStatus === "pending" && b.stripeSessionId)
      .slice(0, 20);

    if (candidates.length > 0) {
      const byId = new Map(bookings.map((b) => [b.id, b] as const));
      await Promise.all(
        candidates.map(async (booking) => {
          try {
            const synced = await syncBookingPaymentFromCheckoutSession(
              booking.stripeSessionId as string
            );
            if (synced.booking) {
              byId.set(synced.booking.id, synced.booking);
            }
          } catch (e) {
            console.error("[admin/bookings] payment reconcile failed", e);
          }
        })
      );
      bookings = Array.from(byId.values()).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    }
  }

  const stripeSessions = await listRecentCheckoutSessions(40);
  const bookingIdsInDb = new Set(bookings.map((b) => b.id));
  const stripeOnlySessions = stripeSessions.filter(
    (s) => !s.bookingId || !bookingIdsInDb.has(s.bookingId)
  );

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl text-primary">Bookings</h1>
      <p className="mt-2 text-sm text-ink/60">
        Hidden route. Do not link from public navigation.
      </p>
      {bookingsError && (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not load bookings from Supabase. Check{" "}
          <code className="rounded bg-primary/10 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and{" "}
          <code className="rounded bg-primary/10 px-1">SUPABASE_SERVICE_ROLE_KEY</code>
          . Recent Stripe checkouts are shown below as fallback.
        </p>
      )}
      {bookings.length > 0 && (
        <AdminBookingsCalendar
          bookings={bookings.map((b) => ({
            id: b.id,
            name: b.name,
            time: b.time,
            dateIso: b.date.toISOString(),
            paymentStatus: b.paymentStatus,
          }))}
        />
      )}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-primary/10 bg-cream/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Customer / postcode</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Coupon</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-primary/5">
                <td className="px-4 py-3 text-ink/70">
                  {format(b.createdAt, "dd MMM yyyy HH:mm")}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{b.name}</div>
                  <div className="text-xs text-ink/60">{b.email}</div>
                  <div className="text-xs text-ink/60">{b.phone}</div>
                  {b.postcode && (
                    <div className="mt-1 text-xs font-medium text-primary/90">{b.postcode}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-ink/80">
                  {serviceLabel(b.service)}
                  <div className="text-xs text-ink/50">{sizeLabel(b.propertySize)}</div>
                </td>
                <td className="px-4 py-3 text-ink/80">
                  {format(b.date, "dd MMM yyyy")}
                  <div className="text-xs text-ink/50">{b.time}</div>
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatGbpFromPence(b.price)}
                  {b.discountPence > 0 && (
                    <div className="text-xs font-normal text-ink/55">
                      Was {formatGbpFromPence(b.subtotalPence ?? b.price + b.discountPence)} · −
                      {formatGbpFromPence(b.discountPence)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-ink/70">
                  {b.couponCode ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      b.paymentStatus === "paid"
                        ? "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                        : b.paymentStatus === "failed"
                          ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-900"
                          : b.paymentStatus === "cancelled"
                            ? "rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700"
                            : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900"
                    }
                  >
                    {b.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View
                    </Link>
                    {(b.paymentStatus === "pending" || b.paymentStatus === "paid") && (
                      <CancelBookingButton
                        bookingId={b.id}
                        className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p className="px-4 py-10 text-center text-ink/50">No bookings yet.</p>
        )}
      </div>

      <h2 className="mt-10 font-display text-xl text-primary">
        Recent Stripe checkouts
      </h2>
      <p className="mt-2 text-sm text-ink/55">
        Helpful when a payment exists but the booking row is missing due to DB
        migration or environment mismatch.
      </p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-card">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-primary/10 bg-cream/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment status</th>
              <th className="px-4 py-3">Booking ID</th>
              <th className="px-4 py-3">Session</th>
            </tr>
          </thead>
          <tbody>
            {stripeOnlySessions.map((s) => (
              <tr key={s.id} className="border-b border-primary/5">
                <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                  {format(new Date(s.created * 1000), "dd MMM yyyy HH:mm")}
                </td>
                <td className="px-4 py-3 text-ink/80">{s.customerEmail ?? "-"}</td>
                <td className="px-4 py-3">{formatStripeAmount(s.amountTotal, s.currency)}</td>
                <td className="px-4 py-3 text-ink/80">{s.paymentStatus ?? "-"}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink/60">
                  {s.bookingId ?? "-"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink/60">{s.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {stripeOnlySessions.length === 0 && (
          <p className="px-4 py-10 text-center text-ink/50">
            No unmatched Stripe checkouts found.
          </p>
        )}
      </div>
    </div>
  );
}
