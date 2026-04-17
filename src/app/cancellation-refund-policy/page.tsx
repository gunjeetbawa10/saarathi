import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description:
    "Customers can cancel any time, and refunds are issued within 48 hours of cancellation.",
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
            Customers can cancel any time, and their refund will be issued
            within 48 hours of cancellation.
          </p>
        </div>
      </section>
    </div>
  );
}
