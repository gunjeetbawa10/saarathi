import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fair Usage & Room Size Policy",
  description:
    "Saarathi Services Ltd Fair Usage & Room Size Policy defining standard room measurements, open-plan charging, oversized room surcharges, and inspection re-quote rights.",
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
            1. Definition of a Standard Room
          </h2>
          <p className="mt-4">
            Our flat-rate room prices for domestic cleaning and carpet steam
            cleaning are based on standard UK room sizes.
          </p>
          <p className="mt-4">
            A <strong className="text-primary">Standard Room</strong> is any
            single room measuring up to{" "}
            <strong className="text-primary">15 square metres</strong> (approx.
            160 square feet).
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            2. Open-Plan Spaces
          </h2>
          <p className="mt-4">
            Open-plan living spaces (for example a combined lounge/diner or
            kitchen/living area) are not treated as a single room.
          </p>
          <p className="mt-4">
            These spaces are assessed by total square meterage and are typically
            charged as two or more standard rooms depending on size.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            3. Oversized Rooms and Additional Charges
          </h2>
          <p className="mt-4">
            If a room exceeds the 15-square-metre limit (for example large
            master suites, converted lofts, or extended living rooms), Saarathi
            Services may apply an oversized-room surcharge.
          </p>
          <p className="mt-4">
            Rooms significantly larger than the standard limit may be counted as
            two rooms for booking and billing purposes.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            4. Hallways, Stairs, and Landings
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              Standard hallways (up to 5 metres in length) are charged at our
              standard hallway rate.
            </li>
            <li>
              A standard staircase is defined as a single flight of up to 14
              steps.
            </li>
            <li>
              Additional steps or multiple landings may incur supplementary
              charges.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            5. Right to Re-Quote Upon Inspection
          </h2>
          <p className="mt-4">
            All phone, online, and text estimates are subject to visual
            inspection at the property.
          </p>
          <p className="mt-4">
            On arrival, our technicians assess area size and condition. If rooms
            are significantly larger than the Standard Room definition, or if
            conditions require extraordinary time and resources, Saarathi
            Services reserves the right to issue a revised binding quote before
            work starts.
          </p>
          <p className="mt-4">
            You are under no obligation to accept the revised quote. If declined,
            no work will proceed beyond inspection.
          </p>
        </section>
      </section>
    </div>
  );
}
