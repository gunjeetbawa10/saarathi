import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Saarathi Services: a North Wales team delivering luxury cleaning and property management with discretion and craft.",
};

const portrait =
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80";

export default function AboutPage() {
  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              About us
            </p>
            <h1 className="mt-4 font-display text-4xl text-primary md:text-5xl">
              Calm hands, exacting standards
            </h1>
            <div className="mt-8 space-y-4 text-ink/80">
              <p>
                Saarathi Services was founded on a simple belief: exceptional
                spaces deserve unhurried care. We serve homeowners, hospitality
                operators, and executive teams who value discretion as much as
                shine.
              </p>
              <p>
                Every visit is choreographed. We use{" "}
                <strong className="font-medium text-primary">
                  eco-friendly cleaning products
                </strong>{" "}
                that deliver professional results while staying mindful of air
                quality, delicate finishes, and the world outside your door.
                Schedules align with yours, and teams treat your property with
                the same respect you do.
              </p>
              <p>
                Based in Bangor, we work across North Wales and select
                neighbouring postcodes. If you&apos;re unsure whether we cover
                your area, ask. We&apos;re happy to advise.
              </p>
            </div>
            <Button href="/booking" className="mt-10">
              Plan a visit
            </Button>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-luxury">
              <Image
                src={portrait}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
