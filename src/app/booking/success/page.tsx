import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Booking confirmed",
  robots: { index: false, follow: false },
};

export default function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center md:py-32">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
        Thank you
      </p>
      <h1 className="mt-4 font-display text-3xl text-primary md:text-4xl">
        Payment received
      </h1>
      <p className="mt-6 text-ink/75">
        Your booking is confirmed. A confirmation email is on its way. If you
        don&apos;t see it within a few minutes, check your spam folder.
      </p>
      {searchParams.session_id && (
        <p className="mt-4 text-xs text-ink/40">
          Reference: {searchParams.session_id.slice(0, 20)}…
        </p>
      )}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button href="/">Back home</Button>
        <Button href="/services" variant="secondary">
          Explore services
        </Button>
      </div>
    </div>
  );
}
