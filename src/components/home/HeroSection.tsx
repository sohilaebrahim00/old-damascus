"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ChevronRight, MapPin, UtensilsCrossed, Store, ShoppingBag, Truck, CheckCircle2 } from "lucide-react";
import { restaurant } from "@/config/restaurant";

import { staggerContainer, fadeUp, zoomIn } from "@/lib/motion";

export function HeroSection() {
  return (
    <section
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background Image */}
      <motion.div 
        className="absolute inset-0"
        variants={zoomIn}
        initial="hidden"
        animate="visible"
      >
        <Image
          src="/restaurant/hero-bg.jpg"
          alt="Old Damascus restaurant ambiance and food"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-hero-gradient" />
      </motion.div>

      {/* Content */}
      <motion.div 
        className="relative z-10 container-site text-center text-white py-24"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          variants={fadeUp}
          className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 text-white drop-shadow-lg max-w-5xl mx-auto"
        >
          Authentic Mediterranean Flavor,{" "}
          <span className="text-brand-gold">Made Fresh</span> in Richardson
        </motion.h1>

        <motion.p 
          variants={fadeUp}
          className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Discover charcoal-grilled meats, shawarma, mandi, fresh mezze, family
          platters, desserts, and traditional drinks inspired by the heart of
          Damascus.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link
            href="/menu"
            className="btn-outline-white btn-lg group"
          >
            <UtensilsCrossed className="w-5 h-5" />
            View Our Menu
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="/order"
            className="btn-gold btn-lg shadow-xl shadow-brand-gold/20"
          >
            Order Online
          </a>

          <a
            href={restaurant.address.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost btn-lg text-white hover:text-brand-lime hover:bg-white/10 border-0"
          >
            <MapPin className="w-5 h-5 text-brand-gold" />
            Get Directions
          </a>
        </motion.div>

        {/* Info pills */}
        <motion.div 
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm font-medium text-white/90 border border-white/20 shadow-sm">
            <Store className="w-4 h-4 text-brand-gold" /> Dine-In
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm font-medium text-white/90 border border-white/20 shadow-sm">
            <ShoppingBag className="w-4 h-4 text-brand-gold" /> Pickup
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm font-medium text-white/90 border border-white/20 shadow-sm">
            <Truck className="w-4 h-4 text-brand-gold" /> Delivery
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm font-medium text-white/90 border border-white/20 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-brand-gold" /> Halal
          </span>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center pt-1">
          <div className="w-1.5 h-3 rounded-full bg-white/60 animate-pulse" />
        </div>
      </motion.div>
    </section>
  );
}
