import { format } from "date-fns";
import Link from "next/link";
import type { Booking } from "@/types/booking";
import { formatGbpFromPence, serviceLabel } from "@/lib/booking-pricing";

function sizeLabel(s: string) {
  const m: Record<string, string> = {
    ONE_BED: "1 bed",
    TWO_BED: "2 bed",
    THREE_BED: "3 bed",
    FOUR_PLUS: "4+",
  };
  return m[s] ?? s;
}

function StatusBadge({ status }: { status: Booking["paymentStatus"] }) {
  const paid = status === "paid";
  return (
    <span
      className={
        paid
          ? "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
          : status === "failed"
            ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-900"
            : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900"
      }
    >
      {status}
    </span>
  );
}

export function MyBookingsTable({
  bookings,
  emptyMessage,
}: {
  bookings: Booking[];
  emptyMessage: string;
}) {
  if (bookings.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-primary/20 bg-cream/50 px-6 py-12 text-center text-sm text-ink/60">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-primary/10 bg-cream/80 text-xs uppercase tracking-wider text-ink/50">
          <tr>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Address</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Payment</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-primary/5">
              <td className="px-4 py-3 text-ink/80">
                <div className="font-medium text-ink">{serviceLabel(b.service)}</div>
                <div className="text-xs text-ink/50">{sizeLabel(b.propertySize)}</div>
              </td>
              <td className="px-4 py-3 text-ink/80">
                {format(b.date, "EEE d MMM yyyy")}
                <div className="text-xs text-ink/50">{b.time}</div>
              </td>
              <td className="max-w-[200px] px-4 py-3 text-xs text-ink/70">
                {b.postcode && (
                  <span className="mb-1 block font-medium text-primary/90">{b.postcode}</span>
                )}
                <span className="line-clamp-2">{b.address}</span>
              </td>
              <td className="px-4 py-3 font-medium">{formatGbpFromPence(b.price)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={b.paymentStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MyBookingsEmptyCta() {
  return (
    <p className="mt-4 text-center text-sm text-ink/60">
      Ready to book?{" "}
      <Link href="/booking" className="font-semibold text-primary hover:underline">
        Request a quote
      </Link>
    </p>
  );
}
