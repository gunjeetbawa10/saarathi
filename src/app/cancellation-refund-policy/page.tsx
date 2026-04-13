import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description:
    "Strict cancellation and no-cash-refund policy for Saarathi Services Ltd bookings in the UK, including lock-out, reschedule, and re-clean terms.",
};

const effectiveDate = "13 April 2026";

export default function CancellationRefundPolicyPage() {
  return (
    <div className="bg-cream">
      <section className="border-b border-primary/10 bg-white px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Legal
          </p>
          <h1 className="mt-3 font-display text-4xl text-primary md:text-5xl">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="mt-4 text-sm text-ink/65">
            Effective date: {effectiveDate}
          </p>
          <p className="mt-4 max-w-3xl text-ink/75">
            This policy is intentionally strict. Our operations run on scheduled
            labour blocks, route planning, and reserved team capacity. Late
            cancellation directly affects staff earnings and business continuity.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-8 px-4 py-14 text-ink/85 md:px-6 md:py-20">
        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            1. Cancellation Time Bands and Charges
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              <strong className="text-primary">More than 48 hours before start:</strong>{" "}
              no charge.
            </li>
            <li>
              <strong className="text-primary">Within 48 hours:</strong> 50% of
              total estimated booking value.
            </li>
            <li>
              <strong className="text-primary">
                Within 24 hours, same day, or after dispatch:
              </strong>{" "}
              100% of total estimated booking value.
            </li>
          </ul>
          <p className="mt-4">
            The relevant time is when your cancellation message is received by
            us, not when it is drafted or queued.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            2. Lock-Out and Failed Access
          </h2>
          <p className="mt-4">
            If our team attends but cannot access the property, the booking is
            treated as a lock-out and charged at 100%.
          </p>
          <p className="mt-4">Examples include:</p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>no one present to provide entry;</li>
            <li>incorrect keys, codes, or access instructions;</li>
            <li>active alarms not disarmed by client;</li>
            <li>building management denying entry;</li>
            <li>
              utilities unavailable or conditions unsafe for work at arrival.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            3. Rescheduling Rules
          </h2>
          <p className="mt-4">
            Rescheduling is a cancellation and rebooking event for fee purposes.
            The same 48-hour and 24-hour charging bands apply.
          </p>
          <p className="mt-4">
            We may, at our sole discretion, waive or reduce a fee in exceptional
            circumstances. Any waiver once does not create a precedent or
            permanent right.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            4. Refund Position
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              We operate a <strong className="text-primary">no cash refund</strong>{" "}
              model for completed labour services, except where required under
              applicable law.
            </li>
            <li>
              Approved service-quality complaints are resolved by corrective
              re-clean of specific affected in-scope areas.
            </li>
            <li>
              Re-clean requests must be made in writing within 24 hours of
              completion, with supporting photos.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            5. Chargebacks and Payment Disputes
          </h2>
          <p className="mt-4">
            Initiating a card chargeback without first contacting us to resolve
            the issue in good faith is treated as breach of contract.
          </p>
          <p className="mt-4">
            We actively challenge unjustified chargebacks with technician logs,
            timestamps, communication records, call-out evidence, and site
            photographs where relevant.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            6. Repeat Late Cancellations
          </h2>
          <p className="mt-4">
            Where a client repeatedly cancels at short notice, we may require
            full prepayment for future bookings or decline further service.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            7. Your Responsibility Before the Appointment
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Provide correct address and active contact details.</li>
            <li>Ensure keys, codes, and alarm instructions are accurate.</li>
            <li>Secure pets and remove hazards from working areas.</li>
            <li>Ensure power and hot water are available.</li>
          </ul>
          <p className="mt-4">
            Failure to meet these obligations may result in full charge with no
            entitlement to refund.
          </p>
        </section>
      </section>
    </div>
  );
}
