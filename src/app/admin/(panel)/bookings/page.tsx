import type { Metadata } from "next";
import { format } from "date-fns";
import { listBookingsDesc } from "@/lib/supabase/server";
import { bookingFromRow } from "@/types/booking";
import { formatGbpFromPence, serviceLabel } from "@/lib/booking-pricing";

export const metadata: Metadata = {
  title: "Admin — Bookings",
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

export default async function AdminBookingsPage() {
  let bookings: ReturnType<typeof bookingFromRow>[] = [];
  try {
    const rows = await listBookingsDesc(200);
    bookings = rows.map(bookingFromRow);
  } catch {
    return (
      <div className="px-4 py-10 md:px-8 text-ink/80">
        <h1 className="font-display text-2xl text-primary">Bookings</h1>
        <p className="mt-4">
          Could not load bookings. Check{" "}
          <code className="rounded bg-primary/10 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and{" "}
          <code className="rounded bg-primary/10 px-1">SUPABASE_SERVICE_ROLE_KEY</code>
          , and ensure the SQL migration has been applied.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl text-primary">Bookings</h1>
      <p className="mt-2 text-sm text-ink/60">
        Hidden route — do not link from public navigation.
      </p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-primary/10 bg-cream/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Coupon</th>
              <th className="px-4 py-3">Status</th>
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
                  {b.couponCode ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      b.paymentStatus === "paid"
                        ? "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                        : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900"
                    }
                  >
                    {b.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p className="px-4 py-10 text-center text-ink/50">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}
