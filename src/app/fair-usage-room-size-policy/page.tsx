import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fair Usage & Room Size Policy",
  description:
    "Saarathi Services Ltd Fair Usage & Room Size Policy for on-site assessment, revised quotes, and your right to cancel.",
};

const effectiveDate = "15 April 2026";

export default function FairUsageRoomSizePolicyPage() {
  return (
    <div className="bg-cream">
      <section className="border-b border-primary/10 bg-white px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Legal
          </p>
          <h1 className="mt-3 font-display text-4xl text-primary md:text-5xl">
            Fair Usage &amp; Room Size Policy
          </h1>
          <p className="mt-4 text-sm text-ink/65">
            Effective date: {effectiveDate}
          </p>
          <p className="mt-4 max-w-3xl text-ink/75">
            To ensure fair and transparent pricing for all clients, and to make
            sure our staff have adequate time to deliver Saarathi&apos;s premium
            standard of service, all bookings are subject to this Fair Usage
            &amp; Room Size Policy.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-8 px-4 py-14 text-ink/85 md:px-6 md:py-20">
        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            On-Site Assessment and Re-Quoting
          </h2>
          <p className="mt-4">
            All prices quoted online or over the phone are estimates.
          </p>
          <p className="mt-4">
            Upon arrival at your property, our team will conduct a visual
            assessment. If your property layout requires additional time, labour,
            or cleaning materials, the team member will inform you of the
            necessary extra charges before beginning the service.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            Your Right to Cancel
          </h2>
          <p className="mt-4">
            You are under no obligation to accept the revised price. If you
            agree to the new quote, we will proceed immediately.
          </p>
          <p className="mt-4">
            If you do not agree, we will cancel the service and issue a full
            refund of any money paid upfront, with no cancellation penalties
            applied.
          </p>
        </section>
      </section>
    </div>
  );
}
