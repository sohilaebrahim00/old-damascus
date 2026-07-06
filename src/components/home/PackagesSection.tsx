"use client";

import { Phone, CheckCircle2, Calendar, Utensils } from "lucide-react";
import { PACKAGES, type MealPackage } from "@/data/packages";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function PackagesSection() {
  const availablePackages = PACKAGES.filter((p) => p.available);

  return (
    <section
      className="py-16 sm:py-24 bg-cream-warm"
      aria-labelledby="packages-heading"
    >
      <div className="container-site">
        <div className="text-center mb-16">
          <span className="inline-block text-brand-dark text-sm font-bold uppercase tracking-widest mb-3">
            Group &amp; Family Dining
          </span>
          <h2
            id="packages-heading"
            className="font-heading text-4xl sm:text-5xl font-semibold text-olive-dark mt-1"
          >
            Monthly Meal Packages
          </h2>
          <p className="text-lg text-olive leading-relaxed mt-4 max-w-2xl mx-auto">
            Enjoy our curated meal packages designed to bring the true taste of Damascus to your table every day.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {availablePackages.map((pkg, idx) => (
            <PackageCard key={pkg.id} pkg={pkg} index={idx} />
          ))}
        </motion.div>

        <div className="text-center mt-12 max-w-lg mx-auto">
          <p className="text-sm text-olive/80 italic">
            Contact us to activate your monthly meal plan.
          </p>
        </div>
      </div>
    </section>
  );
}

function PackageCard({ pkg, index }: { pkg: MealPackage; index: number }) {
  // Use a slightly different gradient for the second card to make them visually distinct
  const bgClass = index === 0
    ? "bg-gradient-to-br from-brand-olive to-brand-dark"
    : "bg-gradient-to-br from-olive-dark to-[#1A3300]";

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col group ${bgClass}`}
    >
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

      <div className="relative z-10 flex-1">
        <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">
          {pkg.name}
        </h3>
        <p className="text-white/80 leading-relaxed mb-6">
          {pkg.description}
        </p>

        <div className="mb-8 pb-8 border-b border-white/20">
          <div className="flex items-end gap-2 text-brand-gold">
            <span className="text-4xl sm:text-5xl font-bold leading-none">${pkg.price}</span>
            <span className="text-white/70 text-lg mb-1">/ month</span>
          </div>
        </div>

        <ul className="space-y-4 mb-8">
          <li className="flex items-center gap-3 text-white/90">
            <Utensils className="w-5 h-5 text-brand-gold flex-shrink-0" />
            <span className="font-medium">{pkg.mealsPerDay} freshly prepared {pkg.mealsPerDay === 1 ? "meal" : "meals"} per day</span>
          </li>
          <li className="flex items-center gap-3 text-white/90">
            <Calendar className="w-5 h-5 text-brand-gold flex-shrink-0" />
            <span className="font-medium">Valid for the {pkg.duration.toLowerCase()}</span>
          </li>
          <li className="flex items-center gap-3 text-white/90">
            <CheckCircle2 className="w-5 h-5 text-brand-gold flex-shrink-0" />
            <span className="font-medium">Authentic Syrian cuisine</span>
          </li>
        </ul>
      </div>

      <div className="relative z-10 mt-auto">
        {pkg.orderable ? (
          <button className="w-full py-4 rounded-xl font-semibold text-brand-dark bg-brand-gold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2">
            {pkg.ctaText}
          </button>
        ) : (
          <a
            href="tel:+14697285635"
            className="w-full py-4 rounded-xl font-semibold text-brand-dark bg-brand-gold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            {pkg.ctaText}
          </a>
        )}
      </div>
    </motion.div>
  );
}
