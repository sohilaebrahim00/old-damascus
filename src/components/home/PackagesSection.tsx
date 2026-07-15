"use client";

import { CheckCircle2, Calendar, Utensils } from "lucide-react";
import { PACKAGES, type MealPackage } from "@/data/packages";
import { motion } from "framer-motion";
import { useState } from "react";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { trackEvent } from "@/lib/analytics";
import { PackageCheckoutModal } from "./PackageCheckoutModal";

export function PackagesSection() {
  const availablePackages = PACKAGES.filter((p) => p.available);
  const [selectedPackage, setSelectedPackage] = useState<MealPackage | null>(null);

  const merchantId = process.env.NEXT_PUBLIC_CLOVER_MERCHANT_ID || "4HHSMAKE7E941";
  const publicKey = process.env.NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN || "1bcefc9089cdd0e327373b3367a3c483";
  const environment = (process.env.NEXT_PUBLIC_CLOVER_ENVIRONMENT || "production") as "sandbox" | "production";

  const openModal = (pkg: MealPackage) => {
    setSelectedPackage(pkg);
    trackEvent("package_checkout_open", { package_id: pkg.id, package_name: pkg.name });
  };

  const closeModal = () => {
    setSelectedPackage(null);
  };

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
            Weekly Meal Packages
          </h2>
          <p className="text-lg text-olive leading-relaxed mt-4 max-w-2xl mx-auto">
            Enjoy our curated meal packages designed to bring the true taste of Damascus to your table every day.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {availablePackages.map((pkg, idx) => (
            <PackageCard key={pkg.id} pkg={pkg} index={idx} onSubscribe={() => openModal(pkg)} />
          ))}
        </motion.div>

        <div className="text-center mt-12 max-w-lg mx-auto">
          <p className="text-sm text-olive/80 italic">
            Activate online for immediate QR check-in access at Old Damascus.
          </p>
        </div>
      </div>

      {/* Package Online Checkout & Instant Activation Modal */}
      <PackageCheckoutModal
        pkg={selectedPackage}
        isOpen={Boolean(selectedPackage)}
        onClose={closeModal}
        merchantId={merchantId}
        publicKey={publicKey}
        environment={environment}
      />
    </section>
  );
}

function PackageCard({ pkg, index, onSubscribe }: { pkg: MealPackage; index: number; onSubscribe: () => void }) {
  const isPremium = index === 1;
  const bgClass = isPremium
    ? "bg-brand-dark ring-2 ring-brand-gold shadow-[0_0_30px_rgba(198,161,91,0.15)]"
    : "bg-olive-dark";

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ 
        y: -4, 
        boxShadow: isPremium ? "0 10px 40px -10px rgba(198,161,91,0.4)" : "0 10px 40px -10px rgba(0,0,0,0.3)",
        transition: { duration: 0.3 } 
      }}
      className={`rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col group transition-all duration-300 ${bgClass}`}
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
          <div className="flex items-end gap-2 text-brand-gold group-hover:text-yellow-400 transition-colors duration-300">
            <span className="text-4xl sm:text-5xl font-bold leading-none">${pkg.price}</span>
            <span className="text-white/70 text-lg mb-1">/ week</span>
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
            <span className="font-medium">Authentic Mediterranean cuisine</span>
          </li>
        </ul>
      </div>

      <div className="relative z-10 mt-auto pt-6">
        <button
          onClick={onSubscribe}
          className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 outline-none ${
            isPremium
              ? "text-brand-dark bg-brand-gold hover:bg-yellow-400 shadow-[0_4px_14px_0_rgba(198,161,91,0.39)] focus-visible:ring-brand-gold"
              : "text-white bg-white/10 hover:bg-white/20 border border-white/20 focus-visible:ring-white"
          }`}
        >
          {pkg.ctaText}
        </button>
      </div>
    </motion.div>
  );
}
