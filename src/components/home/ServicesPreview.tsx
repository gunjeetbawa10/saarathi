"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SERVICE_CARDS } from "@/lib/services-catalog";
import { Reveal } from "@/components/motion/Reveal";

export function ServicesPreviewSection() {
  return (
    <section className="bg-cream px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Services
          </p>
          <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
            Tailored care, transparent pricing
          </h2>
          <p className="mt-4 max-w-2xl text-ink/70">
            From full resets to rapid turnovers — every visit is choreographed
            for calm, consistent results.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_CARDS.map((card, i) => (
            <motion.article
              key={card.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="flex flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-card"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={card.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 50vw, 25vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl text-primary">{card.title}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-accent">
                  {card.tagline}
                </p>
                <p className="mt-3 flex-1 text-sm text-ink/70">{card.description}</p>
                <p className="mt-4 font-display text-2xl text-primary">
                  £{card.priceGbp}
                </p>
                <Link
                  href={`/booking?service=${card.slug}`}
                  className="mt-4 inline-flex items-center justify-center rounded-2xl bg-accent py-3 text-center text-sm font-semibold text-ink shadow-sm transition hover:shadow-md"
                >
                  Book now
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
