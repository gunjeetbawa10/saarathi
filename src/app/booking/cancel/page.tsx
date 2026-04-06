import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Payment cancelled",
  robots: { index: false, follow: false },
};

export default function BookingCancelPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center md:py-32">
      <h1 className="font-display text-3xl text-primary md:text-4xl">
        Checkout cancelled
      </h1>
      <p className="mt-6 text-ink/75">
        No payment was taken. Your details may still be saved as a pending
        booking — our team can follow up, or you can complete payment anytime
        by starting a new booking.
      </p>
      {searchParams.id && (
        <p className="mt-4 text-xs text-ink/40">Booking reference: {searchParams.id}</p>
      )}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button href="/booking">Try again</Button>
        <Button href="/contact" variant="ghost">
          Contact us
        </Button>
      </div>
    </div>
  );
}
