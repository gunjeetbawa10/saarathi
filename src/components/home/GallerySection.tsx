import Image from "next/image";
import { GALLERY_IMAGES } from "@/lib/gallery";
import { Reveal } from "@/components/motion/Reveal";

export function GallerySection() {
  return (
    <section className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Our work
          </p>
          <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
            Gallery
          </h2>
          <p className="mt-4 max-w-xl text-ink/70">
            A glimpse of the calm, considered spaces we maintain across North
            Wales.
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {GALLERY_IMAGES.map((img, i) => (
            <Reveal key={`${img.alt}-${i}`} delay={i * 0.04}>
              <div className="relative aspect-square overflow-hidden rounded-2xl shadow-card">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition duration-500 hover:scale-105"
                  sizes="(max-width:768px) 50vw, 33vw"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
