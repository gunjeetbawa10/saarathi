import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/BookingForm";
import { SLUG_TO_SERVICE, type ServiceSlug } from "@/lib/services-catalog";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Book",
  description:
    "Book luxury cleaning and property care online. Choose your service, date, and time — pay securely with Stripe.",
};

function resolveService(serviceParam?: string) {
  if (!serviceParam) return undefined;
  if (serviceParam in SLUG_TO_SERVICE) {
    return SLUG_TO_SERVICE[serviceParam as ServiceSlug];
  }
  return undefined;
}

export default function BookingPage({
  searchParams,
}: {
  searchParams: { service?: string };
}) {
  const defaultService = resolveService(searchParams.service);

  return (
    <div className="bg-cream">
      <section className="border-b border-primary/10 bg-white px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Book online
            </p>
            <h1 className="mt-3 font-display text-4xl text-primary md:text-5xl">
              Reserve your visit
            </h1>
            <p className="mt-4 max-w-2xl text-ink/70">
              Complete the form below. You&apos;ll be redirected to Stripe to pay
              and confirm your appointment. We&apos;ll email you as soon as
              payment succeeds.
            </p>
          </Reveal>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <BookingForm defaultService={defaultService} />
      </section>
    </div>
  );
}
