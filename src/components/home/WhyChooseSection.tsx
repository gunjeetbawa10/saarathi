import { Reveal } from "@/components/motion/Reveal";

const items = [
  { title: "Fully insured", body: "Comprehensive cover for your peace of mind on every visit." },
  { title: "Vetted professionals", body: "Trained teams, background-checked and briefed to your standard." },
  {
    title: "Eco-conscious cleaning",
    body:
      "Professional-grade, eco-friendly products: effective on dirt, gentle on air, surfaces, and everyone who shares your space.",
  },
  { title: "5-star rated service", body: "Consistent excellence trusted by hosts, homeowners, and offices." },
  {
    title: "Fixed price, no surprises",
    body:
      "What you see is what you pay: clear package pricing at checkout, with no hidden fees or last-minute add-ons.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="bg-primary px-4 py-20 text-white md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Why choose us
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl md:text-4xl">
            Quiet confidence in every detail
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <span aria-hidden className="text-lg">
                    ✓
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl">{item.title}</h3>
                <p className="mt-3 text-sm text-white/75">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
