"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CATEGORY_PHOTOS } from "@/data/menu-image-map";

/* ------------------------------------------------------------------ */
/* Category navigation as photography, not icon chips.                 */
/* Slugs match the live menu categories so every tile filters.         */
/* ------------------------------------------------------------------ */

/*
 * Tokens below are resolved by the menu's canonical matcher, so they hold up
 * against Clover's own naming ("Appetizer", "Salad", "SPECIALTIES") without
 * needing to mirror it. Order follows the way the menu is served.
 */
const CATEGORIES = [
  { slug: "main-dishes", name: "Main Dishes", photo: CATEGORY_PHOTOS["main-dishes"] },
  { slug: "specialties", name: "Specialties", photo: CATEGORY_PHOTOS.specialties },
  {
    slug: "family-platters",
    name: "Family Platters",
    photo: CATEGORY_PHOTOS["family-platters"],
  },
  { slug: "sandwiches", name: "Sandwiches", photo: CATEGORY_PHOTOS.sandwiches },
  { slug: "appetizers", name: "Appetizers", photo: CATEGORY_PHOTOS.appetizers },
  { slug: "salads", name: "Salads", photo: CATEGORY_PHOTOS.salads },
  { slug: "desserts", name: "Desserts", photo: CATEGORY_PHOTOS.desserts },
  { slug: "drinks", name: "Drinks", photo: CATEGORY_PHOTOS.drinks },
  { slug: "kids-menu", name: "Kids Menu", photo: CATEGORY_PHOTOS["kids-menu"] },
];

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function CategoryPreview() {
  return (
    <section
      className="bg-cream-warm py-24 sm:py-32"
      aria-labelledby="categories-heading"
    >
      <div className="container-site">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-2xl"
        >
          <span className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-gold">
            <span className="w-10 h-px bg-brand-gold/60" aria-hidden="true" />
            The Menu
          </span>
          <h2
            id="categories-heading"
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-olive-dark tracking-tight mt-7 leading-[1.05]"
          >
            Every course,
            <span className="block italic font-normal text-brand">
              from mezze to booza
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ staggerChildren: 0.07 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-16 sm:mt-20"
        >
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.slug} variants={reveal}>
              <Link
                href={`/menu?category=${cat.slug}`}
                className="group relative block aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-2xl bg-brand-dark
                           focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-brand-gold outline-none"
              >
                <Image
                  src={cat.photo}
                  alt={cat.name}
                  fill
                  className="object-cover opacity-90 transition-all duration-[1.1s] ease-out group-hover:scale-[1.08] group-hover:opacity-100"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  quality={82}
                />

                {/* Tonal base so the label always reads */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/20 to-transparent"
                />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h3 className="font-heading text-lg sm:text-2xl font-semibold text-white tracking-tight">
                    {cat.name}
                  </h3>
                  <span
                    className="block w-8 h-px bg-brand-gold mt-3 transition-all duration-500 group-hover:w-14"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-14 sm:mt-16">
          <Link
            href="/menu"
            className="group inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-dark
                       transition-colors hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-offset-2
                       focus-visible:ring-brand-gold outline-none rounded"
          >
            Browse the full menu
            <span
              className="w-8 h-px bg-brand-dark transition-all duration-300 group-hover:w-14 group-hover:bg-brand-gold"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
