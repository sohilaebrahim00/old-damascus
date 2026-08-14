"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BRAND_PHOTOS } from "@/data/menu-image-map";

/* ------------------------------------------------------------------ */
/* Brand storytelling — told through food, craft and ingredients.      */
/* Deliberately no interior/venue imagery.                             */
/* ------------------------------------------------------------------ */

const reveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const CHAPTERS = [
  {
    title: "Fresh Ingredients",
    body: "Chickpeas soaked overnight, herbs cut the morning they are served, olive oil poured at the plate. Nothing sits, nothing waits.",
    image: BRAND_PHOTOS.ingredients,
    alt: "Hummus finished with olive oil, sumac and parsley in a ceramic bowl",
  },
  {
    title: "Traditional Recipes",
    body: "Kibbeh shaped by hand, one at a time. The shell thin, the filling generous — a technique measured in years, not minutes.",
    image: BRAND_PHOTOS.recipes,
    alt: "Hand-formed fried kibbeh served with lemon and fresh mint",
  },
];

export function HeritageStory() {
  return (
    <section
      className="bg-brand-dark text-white py-24 sm:py-32 lg:py-40 overflow-hidden"
      aria-labelledby="heritage-heading"
    >
      <div className="container-site">
        {/* ---- Chapter 1: full-bleed heritage spread ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-6"
          >
            <span className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-gold">
              <span className="w-10 h-px bg-brand-gold/60" aria-hidden="true" />
              Our Story
            </span>

            <h2
              id="heritage-heading"
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mt-7 leading-[1.05] text-white"
            >
              Authentic Damascus
              <span className="block italic font-normal text-brand-gold">
                heritage
              </span>
            </h2>

            <span
              className="block w-12 h-px bg-brand-gold mt-8"
              aria-hidden="true"
            />

            <div className="space-y-6 mt-8 text-white/65 font-light leading-relaxed text-base sm:text-[17px] max-w-lg">
              <p>
                In Damascus, a meal is never one plate. It is the whole table —
                mezze passed hand to hand, bread torn rather than cut, grilled
                meat arriving while the salads are still being argued over.
              </p>
              <p>
                We cook the way that city taught us. Charcoal, not gas. Spices
                blended in-house. Rice layered with almonds and left alone until
                it is ready. It is slower, and it is the entire point.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-6"
          >
            <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] overflow-hidden rounded-3xl group">
              <Image
                src={BRAND_PHOTOS.heritage}
                alt="A full Damascene spread — grilled platter, mezze, salads and warm bread"
                fill
                className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 ring-1 ring-inset ring-brand-gold/20 rounded-3xl"
              />
            </div>
          </motion.div>
        </div>

        {/* ---- Chapters 2 & 3 ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mt-24 sm:mt-32">
          {CHAPTERS.map((chapter) => (
            <motion.article
              key={chapter.title}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <div className="relative aspect-[3/2] overflow-hidden rounded-3xl group">
                <Image
                  src={chapter.image}
                  alt={chapter.alt}
                  fill
                  className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]"
                  sizes="(max-width: 768px) 100vw, 45vw"
                  quality={85}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 ring-1 ring-inset ring-brand-gold/15 rounded-3xl"
                />
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight mt-8 text-white">
                {chapter.title}
              </h3>
              <span
                className="block w-10 h-px bg-brand-gold mt-5"
                aria-hidden="true"
              />
              <p className="text-white/60 font-light leading-relaxed mt-5 text-[15px] sm:text-base">
                {chapter.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
