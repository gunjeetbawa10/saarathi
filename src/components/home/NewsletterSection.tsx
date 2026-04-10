import { Reveal } from "@/components/motion/Reveal";
import { NewsletterForm } from "./NewsletterForm";

export function NewsletterSection() {
  return (
    <section className="bg-cream px-4 py-20 md:px-6 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Newsletter
          </p>
          <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
            Notes on care, quietly delivered
          </h2>
          <p className="mt-4 text-ink/70">
            Occasional insights on maintaining luxury spaces. No clutter, no
            noise.
          </p>
        </Reveal>
        <div className="mt-10">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
