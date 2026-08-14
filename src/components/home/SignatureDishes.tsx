"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BRAND_PHOTOS } from "@/data/menu-image-map";

/* ------------------------------------------------------------------ */
/* Editorial signature showcase — alternating image / copy spreads.    */
/* No cards, no icons: large photography and generous negative space.  */
/* ------------------------------------------------------------------ */

interface Dish {
  index: string;
  name: string;
  description: string;
  image: string;
  href: string;
}

const DISHES: Dish[] = [
  {
    index: "01",
    name: "Mix Grill Platter",
    description:
      "Lamb cubes, shish tawook and kofta over saffron rice — grilled to order on open charcoal and served the way a Damascene table is meant to be shared.",
    image: BRAND_PHOTOS.signature[0],
    href: "/menu?category=grilled-dishes",
  },
  {
    index: "02",
    name: "Lamb Mandi",
    description:
      "Slow-cooked lamb shank resting on spiced rice, finished with toasted almonds. A dish that takes hours and tastes like it took generations.",
    image: BRAND_PHOTOS.signature[1],
    href: "/menu?category=main-dishes",
  },
  {
    index: "03",
    name: "Arabic Chicken Shawarma",
    description:
      "Marinated overnight, stacked and slow-roasted on the vertical spit, then carved thin and wrapped with garlic sauce and pickles.",
    image: BRAND_PHOTOS.signature[2],
    href: "/menu?category=sandwiches",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function SignatureDishes() {
  return (
    <section
      className="bg-cream py-24 sm:py-32 lg:py-40"
      aria-labelledby="signature-heading"
    >
      <div className="container-site">
        {/* Section head */}
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-2xl"
        >
          <span className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-gold">
            <span className="w-10 h-px bg-brand-gold/60" aria-hidden="true" />
            The Signatures
          </span>
          <h2
            id="signature-heading"
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-olive-dark tracking-tight mt-7 leading-[1.05]"
          >
            Dishes that carry
            <span className="block italic font-normal text-brand">
              a whole city
            </span>
          </h2>
        </motion.div>

        {/* Spreads */}
        <div className="mt-20 sm:mt-28 space-y-24 sm:space-y-32 lg:space-y-40">
          {DISHES.map((dish, i) => {
            const flipped = i % 2 === 1;
            return (
              <motion.article
                key={dish.name}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
              >
                {/* Image */}
                <div
                  className={`lg:col-span-7 ${
                    flipped ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <Link
                    href={dish.href}
                    className="group block relative aspect-[4/3] overflow-hidden rounded-3xl bg-cream-warm
                               focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-brand-gold outline-none"
                  >
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      quality={85}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-brand-dark/0 transition-colors duration-700 group-hover:bg-brand-dark/10"
                    />
                  </Link>
                </div>

                {/* Copy */}
                <div
                  className={`lg:col-span-5 ${
                    flipped ? "lg:order-1 lg:pr-8" : "lg:order-2 lg:pl-8"
                  }`}
                >
                  <span className="font-heading text-5xl sm:text-6xl text-brand-gold/25 leading-none select-none">
                    {dish.index}
                  </span>

                  <h3 className="font-heading text-3xl sm:text-4xl font-semibold text-olive-dark tracking-tight mt-4">
                    {dish.name}
                  </h3>

                  <span
                    className="block w-12 h-px bg-brand-gold mt-6"
                    aria-hidden="true"
                  />

                  <p className="text-base sm:text-[17px] text-olive leading-relaxed mt-6 font-light">
                    {dish.description}
                  </p>

                  <Link
                    href={dish.href}
                    className="group inline-flex items-center gap-3 mt-9 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-dark
                               transition-colors hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-offset-2
                               focus-visible:ring-brand-gold outline-none rounded"
                  >
                    View on the menu
                    <span
                      className="w-8 h-px bg-brand-dark transition-all duration-300 group-hover:w-12 group-hover:bg-brand-gold"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
