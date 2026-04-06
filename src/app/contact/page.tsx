import type { Metadata } from "next";
import { CONTACT } from "@/lib/constants";
import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact Saarathi Services — ${CONTACT.phoneDisplay}, ${CONTACT.email}, ${CONTACT.location}.`,
};

export default function ContactPage() {
  return (
    <div className="bg-cream">
      <section className="border-b border-primary/10 bg-white px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Contact
            </p>
            <h1 className="mt-3 font-display text-4xl text-primary md:text-5xl">
              Let&apos;s talk
            </h1>
            <p className="mt-4 max-w-2xl text-ink/70">
              Enquiries, bespoke briefs, and partnership questions — we respond
              thoughtfully, usually within one business day.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20">
        <Reveal>
          <div className="rounded-3xl border border-primary/10 bg-white p-8 shadow-card md:p-10">
            <h2 className="font-display text-2xl text-primary">Direct lines</h2>
            <ul className="mt-8 space-y-6 text-ink/80">
              <li>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Phone
                </p>
                <a href={`tel:${CONTACT.phone}`} className="mt-1 block text-lg text-primary hover:underline">
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Email
                </p>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="mt-1 block text-lg text-primary hover:underline"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Location
                </p>
                <p className="mt-1 text-lg">{CONTACT.location}</p>
              </li>
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="rounded-3xl border border-primary/10 bg-white p-8 shadow-card md:p-10">
            <h2 className="font-display text-2xl text-primary">Send a note</h2>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
