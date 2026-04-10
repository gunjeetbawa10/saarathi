import { Reveal } from "@/components/motion/Reveal";

export function EcoPromiseSection() {
  return (
    <section
      className="relative overflow-hidden border-y border-primary/10 bg-gradient-to-b from-white via-cream to-white px-4 py-16 md:px-6 md:py-24"
      aria-labelledby="eco-promise-heading"
    >
      <div
        className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-primary/5 blur-2xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Clean conscience
            </p>
            <h2
              id="eco-promise-heading"
              className="mt-3 font-display text-3xl text-primary md:text-4xl lg:text-[2.75rem] lg:leading-tight"
            >
              Spotless spaces,{" "}
              <span className="text-balance text-primary/90">kinder chemistry</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg text-ink/80">
              We clean exclusively with{" "}
              <strong className="font-medium text-primary">professional-grade,
              eco-friendly products</strong>
              : tough on grime, gentle on air quality, fine finishes, and the
              people who live and work in your space.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-primary/10 bg-white/90 p-8 shadow-card backdrop-blur-sm md:p-10">
              <ul className="space-y-5 text-ink/85">
                <li className="flex gap-4">
                  <span
                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-primary"
                    aria-hidden
                  >
                    1
                  </span>
                  <span>
                    <span className="font-medium text-primary">
                      Formulations chosen for performance
                    </span>
                    , so you never trade sparkle for sustainability.
                  </span>
                </li>
                <li className="flex gap-4">
                  <span
                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-primary"
                    aria-hidden
                  >
                    2
                  </span>
                  <span>
                    Safer for everyday life: pets, children, and sensitive
                    surfaces stay front of mind on every visit.
                  </span>
                </li>
                <li className="flex gap-4">
                  <span
                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-primary"
                    aria-hidden
                  >
                    3
                  </span>
                  <span>
                    A lighter footprint without cutting corners: luxury-level
                    results, responsibly delivered.
                  </span>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
