import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SERVICE_CARDS } from "@/lib/services-catalog";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Deep cleans, Airbnb turnovers, standard home care, and executive office cleaning — Saarathi Services across North Wales.",
};

export default function ServicesPage() {
  return (
    <div className="bg-cream">
      <section className="border-b border-primary/10 bg-primary px-4 py-16 text-white md:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              What we do
            </p>
            <h1 className="mt-4 font-display text-4xl md:text-5xl">Services</h1>
            <p className="mt-6 max-w-2xl text-lg text-white/80">
              Precision cleaning and property care — scaled to your space, your
              schedule, and your standard of quiet luxury.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          {SERVICE_CARDS.map((card, i) => (
            <Reveal key={card.slug} delay={i * 0.05}>
              <article className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-card">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 50vw"
                  />
                </div>
                <div className="p-8 md:p-10">
                  <h2 className="font-display text-2xl text-primary md:text-3xl">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium uppercase tracking-wider text-accent">
                    {card.tagline}
                  </p>
                  <p className="mt-4 text-ink/75">{card.description}</p>
                  <p className="mt-6 font-display text-3xl text-primary">
                    From £{card.priceGbp}
                  </p>
                  <p className="mt-2 text-xs text-ink/50">
                    Final price reflects property size at checkout.
                  </p>
                  <Link
                    href={`/booking?service=${card.slug}`}
                    className="mt-8 inline-flex rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:shadow-md"
                  >
                    Book this service
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 rounded-3xl border border-primary/10 bg-primary px-8 py-12 text-center text-white md:px-16">
          <h2 className="font-display text-2xl md:text-3xl">
            Need something bespoke?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/75">
            Corporate blocks, estate portfolios, and pre-event resets — tell us
            what you need and we&apos;ll shape a proposal.
          </p>
          <Button href="/contact" variant="primary" className="mt-8">
            Contact the team
          </Button>
        </div>
      </section>
    </div>
  );
}
