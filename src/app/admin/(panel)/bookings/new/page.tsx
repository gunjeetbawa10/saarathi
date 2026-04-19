import type { Metadata } from "next";
import Link from "next/link";
import { AdminCreateBookingForm } from "@/components/admin/AdminCreateBookingForm";

export const metadata: Metadata = {
  title: "Admin: Create booking",
  robots: { index: false, follow: false },
};

export default function AdminCreateBookingPage() {
  return (
    <div className="px-4 py-10 md:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Create booking</h1>
          <p className="mt-2 text-sm text-ink/60">
            Create a booking on behalf of a customer directly from the admin panel.
          </p>
        </div>
        <Link
          href="/admin/bookings"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Back to bookings
        </Link>
      </div>
      <AdminCreateBookingForm />
    </div>
  );
}
