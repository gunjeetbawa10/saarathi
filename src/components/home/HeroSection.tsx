"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const heroImage =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85";

export function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative min-h-[85vh] overflow-hidden md:min-h-[90vh]">
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/70 to-primary/90" />
      <div className="relative mx-auto flex max-w-6xl flex-col justify-end px-4 pb-20 pt-32 md:px-6 md:pb-28 md:pt-40">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
            Saarathi Services
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl leading-tight tracking-[0.08em] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            EXPERTISE YOU CAN TRUST
          </h1>
          <p className="mt-5 inline-flex max-w-full items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/95 backdrop-blur-sm">
            Eco-friendly products · Luxury-level shine
          </p>
          <p className="mt-6 max-w-xl text-lg text-white/85 md:text-xl">
            Your Premier Property Management and Cleaning Team. Meticulous care
            with products chosen for people, pets, and the planet.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button variant="primary" href="/booking" className="min-w-[200px]">
              Request a quote
            </Button>
            <Link
              href="/services"
              className="inline-flex min-w-[200px] items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              View services
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
