import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getBookingById } from "@/lib/supabase/server";
import { bookingFromRow } from "@/types/booking";
import { addOnLabel, formatGbpFromPence, serviceLabel } from "@/lib/booking-pricing";

export const metadata: Metadata = {
  title: "Booking details",
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
  return "bg-amber-100 text-amber-900";
}

export const dynamic = "force-dynamic";

export default async function AccountBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/account/bookings/${params.id}`)}`);
  }

  const [user, row] = await Promise.all([currentUser(), getBookingById(params.id)]);
  if (!row) notFound();

  const booking = bookingFromRow(row);
  const emailSet = new Set(
    (user?.emailAddresses ?? [])
      .map((e) => e.emailAddress.trim().toLowerCase())
      .filter(Boolean)
  );
  const isOwner =
    booking.clerkUserId === userId || emailSet.has(booking.email.trim().toLowerCase());
  if (!isOwner) notFound();

  return (
    <div className="bg-cream px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-primary/10 bg-white p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl text-primary">Booking details</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(booking.paymentStatus)}`}
          >
            {booking.paymentStatus}
          </span>
        </div>

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
            <dt className="text-xs uppercase tracking-wide text-ink/50">Amount paid</dt>
            <dd className="mt-1 font-semibold text-ink">{formatGbpFromPence(booking.price)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/50">Booked on</dt>
            <dd className="mt-1 text-ink">{format(booking.createdAt, "d MMM yyyy HH:mm")}</dd>
          </div>
        </dl>

        <div className="mt-8 border-t border-primary/10 pt-6">
          <h2 className="font-semibold text-primary">Customer info</h2>
          <p className="mt-2 text-sm text-ink/80">{booking.name}</p>
          <p className="text-sm text-ink/70">{booking.email}</p>
          <p className="text-sm text-ink/70">{booking.phone}</p>
          {booking.postcode && <p className="mt-1 text-sm font-medium text-primary/90">{booking.postcode}</p>}
          <p className="mt-1 text-sm text-ink/70">{booking.address}</p>
          {booking.notes && <p className="mt-3 text-sm text-ink/70">Notes: {booking.notes}</p>}
        </div>

        <div className="mt-8">
          <Link href="/account/bookings" className="text-sm font-semibold text-primary hover:underline">
            Back to all bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
