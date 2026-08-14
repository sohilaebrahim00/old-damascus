"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BRAND_PHOTOS } from "@/data/menu-image-map";

/* ------------------------------------------------------------------ */
/* Cinematic hero — full-bleed 4K photography, deep olive-black wash,  */
/* editorial type. Deliberately no icon pills or badge clutter.        */
/* ------------------------------------------------------------------ */

export function HeroSection() {
  return (
    <section
      className="relative min-h-[88vh] lg:min-h-screen flex items-end overflow-hidden bg-brand-dark"
      aria-label="Old Damascus"
    >
      {/* Photography — slow ken-burns settle */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={BRAND_PHOTOS.hero}
          alt="A Damascene table set with mezze, mandi and charcoal-grilled skewers"
          fill
          className="object-cover"
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={90}
        />
      </motion.div>

      {/* Tonal wash — dark at the base so type always reads */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-brand-dark/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-brand-dark/80 via-transparent to-transparent"
      />

      {/* Content */}
      <div className="relative z-10 container-site pb-20 sm:pb-24 lg:pb-28 pt-40">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-gold"
          >
            <span className="w-10 h-px bg-brand-gold/60" aria-hidden="true" />
            Richardson, Texas
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-white font-semibold tracking-tight mt-7
                       text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[1.02]"
          >
            Authentic Damascus
            <span className="block italic font-normal text-brand-gold">
              Flavors
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl text-white/70 leading-relaxed mt-8 max-w-xl font-light"
          >
            Tradition crafted into every dish — charcoal-grilled over open
            flame, mezze made each morning, and rice slow-spiced the way
            Damascus has always done it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 mt-12"
          >
            <Link
              href="/menu"
              className="group inline-flex items-center justify-center gap-3 rounded-xl border-2 border-brand-gold bg-brand-gold
                         px-9 py-4 text-xs font-bold uppercase tracking-[0.18em] text-brand-dark
                         transition-all duration-300 hover:bg-transparent hover:text-brand-gold
                         focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-gold outline-none"
            >
              Explore Menu
            </Link>

            <Link
              href="/order"
              className="group inline-flex items-center justify-center gap-3 rounded-xl border-2 border-white/35 bg-white/5 backdrop-blur-sm
                         px-9 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white
                         transition-all duration-300 hover:bg-white hover:text-brand-dark hover:border-white
                         focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-gold outline-none"
            >
              Order Online
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
