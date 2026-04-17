import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { getBookingById } from "@/lib/supabase/server";
import { bookingFromRow } from "@/types/booking";
import { addOnLabel, formatGbpFromPence, serviceLabel } from "@/lib/booking-pricing";
import { CancelBookingButton } from "@/components/booking/CancelBookingButton";

export const metadata: Metadata = {
  title: "Admin: Booking details",
  robots: { index: false, follow: false },
};

function sizeLabel(s: string) {
  const m: Record<string, string> = {
    ONE_BED: "1 bed",
    TWO_BED: "2 bed",
    THREE_BED: "3 bed",
    FOUR_PLUS: "4+",
  };
  return m[s] ?? s;
}

function statusBadgeClass(status: string) {
  if (status === "paid") return "bg-primary/10 text-primary";
  if (status === "failed") return "bg-red-100 text-red-900";
  if (status === "cancelled") return "bg-slate-200 text-slate-700";
  return "bg-amber-100 text-amber-900";
}

export const dynamic = "force-dynamic";

export default async function AdminBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const row = await getBookingById(params.id);
  if (!row) notFound();

  const booking = bookingFromRow(row);

  return (
    <div className="px-4 py-10 md:px-8">
      <div className="rounded-3xl border border-primary/10 bg-white p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl text-primary">Booking details</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(booking.paymentStatus)}`}
          >
            {booking.paymentStatus}
          </span>
        </div>

        <p className="mt-2 text-xs text-ink/50">ID: {booking.id}</p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/50">Service</dt>
            <dd className="mt-1 text-ink">{serviceLabel(booking.service)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/50">Property size</dt>
            <dd className="mt-1 text-ink">{sizeLabel(booking.propertySize)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/50">Add-ons</dt>
            <dd className="mt-1 text-ink">
              {booking.addOns.length > 0
                ? booking.addOns.map((addOn) => addOnLabel(addOn)).join(", ")
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/50">Date</dt>
            <dd className="mt-1 text-ink">{format(booking.date, "EEEE, d MMM yyyy")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/50">Time</dt>
            <dd className="mt-1 text-ink">{booking.time}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/50">Final amount</dt>
            <dd className="mt-1 font-semibold text-ink">{formatGbpFromPence(booking.price)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/50">Booked on</dt>
            <dd className="mt-1 text-ink">{format(booking.createdAt, "d MMM yyyy HH:mm")}</dd>
          </div>
        </dl>

        <div className="mt-8 border-t border-primary/10 pt-6">
          <h2 className="font-semibold text-primary">Customer</h2>
          <p className="mt-2 text-sm text-ink/85">{booking.name}</p>
          <p className="text-sm text-ink/75">{booking.email}</p>
          <p className="text-sm text-ink/75">{booking.phone}</p>
          {booking.postcode && <p className="mt-1 text-sm font-medium text-primary/90">{booking.postcode}</p>}
          <p className="mt-1 text-sm text-ink/75">{booking.address}</p>
          {booking.notes && <p className="mt-3 text-sm text-ink/75">Notes: {booking.notes}</p>}
        </div>

        <div className="mt-8 border-t border-primary/10 pt-6">
          <h2 className="font-semibold text-primary">Payment & coupon</h2>
          <p className="mt-2 text-sm text-ink/75">Stripe session: {booking.stripeSessionId ?? "-"}</p>
          <p className="text-sm text-ink/75">Subtotal: {formatGbpFromPence(booking.subtotalPence ?? booking.price)}</p>
          <p className="text-sm text-ink/75">Discount: {formatGbpFromPence(booking.discountPence ?? 0)}</p>
          <p className="text-sm text-ink/75">Coupon code: {booking.couponCode ?? "-"}</p>
          <p className="text-sm text-ink/75">Coupon id: {booking.couponId ?? "-"}</p>
          <p className="text-sm text-ink/75">Clerk user id: {booking.clerkUserId ?? "-"}</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {(booking.paymentStatus === "pending" || booking.paymentStatus === "paid") && (
            <CancelBookingButton bookingId={booking.id} />
          )}
          <Link href="/admin/bookings" className="text-sm font-semibold text-primary hover:underline">
            Back to bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
