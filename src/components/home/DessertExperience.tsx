"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BrandPattern } from "@/components/brand/BrandPattern";

/* ------------------------------------------------------------------ */
/* The sweet course, given its own room. Full-bleed booza ground with  */
/* an inset baklava plate — the two strongest dessert frames in the    */
/* library, used as design rather than catalogue.                      */
/* ------------------------------------------------------------------ */

const reveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function DessertExperience() {
  return (
    <section
      className="relative overflow-hidden bg-brand-dark"
      aria-labelledby="dessert-heading"
    >
      {/* Ground: booza */}
      <Image
        src="/photos/booza.webp"
        alt=""
        aria-hidden="true"
        fill
        className="object-cover opacity-30"
        sizes="100vw"
        quality={82}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-dark/90 to-brand-dark/60"
      />
      <BrandPattern className="text-brand-gold" scale={110} opacity={0.05} />

      <div className="relative z-10 container-site py-24 sm:py-32 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-center">
          {/* Copy */}
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-6"
          >
            <span className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-gold">
              <span className="w-10 h-px bg-brand-gold/60" aria-hidden="true" />
              The Sweet Course
            </span>

            <h2
              id="dessert-heading"
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight mt-7 leading-[1.05]"
            >
              Finish the way
              <span className="block italic font-normal text-brand-gold">
                Damascus finishes
              </span>
            </h2>

            <p className="text-lg text-white/60 leading-relaxed mt-8 max-w-lg font-light">
              Booza pounded by hand until it stretches, rolled in Aleppo
              pistachio. Baklava layered thin, baked to amber, and soaked while
              still warm. Neither is rushed.
            </p>

            <Link
              href="/menu?category=desserts"
              className="group inline-flex items-center gap-3 mt-10 text-[11px] font-bold uppercase tracking-[0.22em] text-white
                         transition-colors hover:text-brand-gold outline-none rounded
                         focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-gold"
            >
              Explore desserts
              <span
                className="w-8 h-px bg-current transition-all duration-300 group-hover:w-14"
                aria-hidden="true"
              />
            </Link>
          </motion.div>

          {/* Inset plate */}
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-6"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl group shadow-2xl">
              <Image
                src="/photos/baklava.webp"
                alt="Pistachio baklava, layered thin and baked to amber"
                fill
                className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-brand-gold/25"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
