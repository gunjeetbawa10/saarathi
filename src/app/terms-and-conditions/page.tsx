import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Saarathi Services Ltd Terms and Conditions of Service, including strict cancellation fees, billing terms, and service limitations for UK clients.",
};

const effectiveDate = "13 April 2026";

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-cream">
      <section className="border-b border-primary/10 bg-white px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Legal
          </p>
          <h1 className="mt-3 font-display text-4xl text-primary md:text-5xl">
            Terms &amp; Conditions of Service
          </h1>
          <p className="mt-4 text-sm text-ink/65">
            Effective date: {effectiveDate}
          </p>
          <p className="mt-4 max-w-3xl text-ink/75">
            These Terms apply to all bookings with Saarathi Services Ltd in the
            United Kingdom. They are drafted to protect staff time, set clear
            legal expectations, and avoid payment or access disputes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-8 px-4 py-14 text-ink/85 md:px-6 md:py-20">
        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            1. Acceptance of Terms
          </h2>
          <p className="mt-4">
            By placing a booking with Saarathi Services Ltd by website, phone,
            email, WhatsApp, social media, or any third-party platform, you
            confirm that:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>You are legally authorised to request service at the property.</li>
            <li>
              You accept these Terms in full, including all cancellation and
              charging provisions.
            </li>
            <li>
              You accept that these Terms form a binding service contract under
              applicable UK law.
            </li>
          </ul>
          <p className="mt-4">
            If you do not agree, do not book. Continued use of our services
            constitutes acceptance of any updated Terms published on this site.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            2. Cancellations, Rescheduling, and Lock-Outs
          </h2>
          <p className="mt-4">
            We reserve technician time, travel, and staffing in advance. Late
            changes cause direct losses and are charged accordingly.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              <strong className="text-primary">More than 48 hours&apos; notice:</strong>{" "}
              no cancellation fee.
            </li>
            <li>
              <strong className="text-primary">Within 48 hours:</strong> 50% of
              the total estimated booking value is payable.
            </li>
            <li>
              <strong className="text-primary">
                Within 24 hours or lock-out:
              </strong>{" "}
              100% of the total estimated booking value is payable.
            </li>
          </ul>
          <p className="mt-4">
            A lock-out includes failed access due to missing keys, no answer at
            site, incorrect code, unresolved alarm, denied entry, unsafe
            conditions, or any client-side failure preventing work from starting
            on arrival.
          </p>
          <p className="mt-4">
            Repeated short-notice cancellations may require prepayment for all
            future bookings, and we reserve the right to decline future work.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            3. Property Size, Condition, and Fair Usage
          </h2>
          <p className="mt-4">
            All quotes are estimates based on normal UK room dimensions and an
            average level of soiling.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              We inspect on arrival and may re-price where room size, occupancy,
              clutter, staining, waste, odour, or risk materially exceeds the
              stated booking details.
            </li>
            <li>
              You will be informed before additional chargeable time is
              committed.
            </li>
            <li>
              You may approve revised pricing for full completion or cap the
              clean to the original amount and priority areas.
            </li>
            <li>
              We may take date-stamped photographs of heavily soiled or unsafe
              areas to support re-pricing, refusals, disputes, and chargeback
              defence.
            </li>
          </ul>
          <p className="mt-4">
            Deliberately inaccurate booking information may result in partial
            completion, revised charges, or immediate service refusal with
            charge.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            4. Payments, Invoices, and Debt Recovery
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              Payment is due immediately on completion unless written commercial
              terms are agreed in advance.
            </li>
            <li>
              Invoices unpaid after 7 calendar days incur a fixed late fee of
              GBP 15 plus interest at 8% above the Bank of England base rate per
              month in line with UK late payment rules.
            </li>
            <li>
              You are liable for all reasonable debt collection and legal
              enforcement costs where payment default continues.
            </li>
            <li>
              We may suspend ongoing and future bookings until all overdue sums
              are settled in cleared funds.
            </li>
          </ul>
          <p className="mt-4">
            Raising an unsubstantiated chargeback without first giving us a
            chance to resolve in writing is treated as contractual breach and
            will be defended using job logs, photos, communications, and access
            records.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            5. Access, Pets, Utilities, and Health &amp; Safety
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              You must provide safe and timely access, active electricity, and
              running hot water.
            </li>
            <li>
              Aggressive, anxious, or disruptive pets must be secured away from
              working zones before team arrival.
            </li>
            <li>
              Staff will not move heavy furniture over 15kg, handle sharps or
              biological hazards, or work at unsafe heights.
            </li>
            <li>
              Where health and safety risks are present, our team may withdraw
              immediately; call-out and reserved labour remain chargeable.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            6. Quality Guarantee, Complaints, and Damage Liability
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              We do not issue cash refunds for completed labour services except
              where required by law.
            </li>
            <li>
              Service quality concerns must be reported in writing with clear
              photos within 24 hours of completion.
            </li>
            <li>
              If validated, we will return once to re-clean the affected
              in-scope area at no additional charge.
            </li>
            <li>
              Damage claims must be submitted within 24 hours with images and
              supporting detail.
            </li>
            <li>
              We are not liable for pre-existing faults, normal wear, poor
              installation, fragile items, or sentimental/high-value items not
              protected before service.
            </li>
          </ul>
          <p className="mt-4">
            Liability, where established, is limited to the proven direct loss
            and never exceeds the amount paid for the relevant service booking.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            7. Service Refusal and Termination
          </h2>
          <p className="mt-4">
            We may refuse, suspend, or terminate service immediately if there is
            threatening behaviour, harassment, unsafe premises, illegal
            activity, non-payment, repeated abuse of cancellations, or persistent
            non-cooperation.
          </p>
          <p className="mt-4">
            Any time already reserved, travel incurred, and work completed up to
            termination remains chargeable in full.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            8. Governing Law and Jurisdiction
          </h2>
          <p className="mt-4">
            These Terms are governed by the laws of England and Wales. Disputes
            shall be subject to the exclusive jurisdiction of the courts of
            England and Wales, unless mandatory UK consumer law states otherwise.
          </p>
        </section>
      </section>
    </div>
  );
}
