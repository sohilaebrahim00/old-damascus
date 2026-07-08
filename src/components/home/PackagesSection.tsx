"use client";

import { CheckCircle2, Calendar, Utensils, X, AlertCircle } from "lucide-react";
import { PACKAGES, type MealPackage } from "@/data/packages";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { staggerContainer, fadeUp, modalReveal } from "@/lib/motion";

const packageInquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number is required"),
  packageId: z.string().min(1, "Please select a package"),
  startDate: z.string().min(1, "Preferred start date is required"),
  notes: z.string().optional(),
  honeypot: z.string().max(0).optional(), // anti-spam
});

type PackageInquiryValues = z.infer<typeof packageInquirySchema>;

export function PackagesSection() {
  const availablePackages = PACKAGES.filter((p) => p.available);
  const [selectedPackage, setSelectedPackage] = useState<MealPackage | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PackageInquiryValues>({
    resolver: zodResolver(packageInquirySchema),
    defaultValues: {
      notes: "",
      honeypot: "",
    },
  });

  const openForm = (pkg: MealPackage) => {
    setSelectedPackage(pkg);
    setIsSubmitted(false);
    setError(null);
    reset({ packageId: pkg.id });
  };

  const closeForm = () => {
    setSelectedPackage(null);
    setTimeout(() => {
      setIsSubmitted(false);
      setError(null);
      reset();
    }, 300);
  };

  const onSubmit = async (data: PackageInquiryValues) => {
    if (data.honeypot) return; // bot block
    setLoading(true);
    setError(null);

    const submitData = {
      ...data,
      type: "Package Inquiry",
      subject: `Package Inquiry: ${PACKAGES.find(p => p.id === data.packageId)?.name}`,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        throw new Error("Failed to submit request. Please try again.");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {availablePackages.map((pkg, idx) => (
            <PackageCard key={pkg.id} pkg={pkg} index={idx} onSubscribe={() => openForm(pkg)} />
          ))}
        </motion.div>

        <div className="text-center mt-12 max-w-lg mx-auto">
          <p className="text-sm text-olive/80 italic">
            Contact us to activate your weekly meal plan.
          </p>
        </div>
      </div>

      {/* Inquiry Form Modal */}
      <AnimatePresence>
        {selectedPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="absolute inset-0 bg-olive-dark/60 backdrop-blur-sm"
            />
            <motion.div
              variants={modalReveal}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-border bg-cream">
                <h3 className="font-heading text-xl font-bold text-olive-dark">
                  Inquire About Meal Plan
                </h3>
                <button
                  onClick={closeForm}
                  className="p-2 rounded-full hover:bg-white transition-colors text-olive"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                    <h4 className="font-heading text-2xl font-semibold text-olive-dark mb-2">
                      Request Received!
                    </h4>
                    <p className="text-olive mb-6">
                      Thank you. We will contact you to activate your weekly meal plan.
                    </p>
                    <button onClick={closeForm} className="btn-primary">
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 border border-error/20 text-error rounded-xl flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <input type="text" {...register("honeypot")} className="hidden" />

                    <div>
                      <label htmlFor="packageId" className="label">Selected Package</label>
                      <select id="packageId" {...register("packageId")} className="input bg-white">
                        {availablePackages.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - ${p.price}/week</option>
                        ))}
                      </select>
                      {errors.packageId && <p className="text-xs text-error mt-1">{errors.packageId.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="label">Your Name</label>
                        <input id="name" type="text" {...register("name")} className="input" placeholder="John Doe" />
                        {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="phone" className="label">Phone Number</label>
                        <input id="phone" type="tel" {...register("phone")} className="input" placeholder="(555) 555-5555" />
                        {errors.phone && <p className="text-xs text-error mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="startDate" className="label">Preferred Start Date</label>
                      <input id="startDate" type="date" {...register("startDate")} className="input" />
                      {errors.startDate && <p className="text-xs text-error mt-1">{errors.startDate.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="notes" className="label">Additional Notes / Dietary Requests</label>
                      <textarea id="notes" rows={3} {...register("notes")} className="input" placeholder="Any specific requirements?" />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full justify-center mt-2"
                    >
                      {loading ? "Submitting..." : "Submit Inquiry"}
                    </button>
                    <p className="text-xs text-center text-olive mt-3">
                      This does not charge your card. We will call you to confirm.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function PackageCard({ pkg, index, onSubscribe }: { pkg: MealPackage; index: number; onSubscribe: () => void }) {
  // Use a slightly different gradient for the second card to make them visually distinct
  const bgClass = index === 0
    ? "bg-gradient-to-br from-brand-olive to-brand-dark"
    : "bg-gradient-to-br from-olive-dark to-[#1A3300]";

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ 
        y: -4, 
        boxShadow: "0 10px 40px -10px rgba(198,161,91,0.3)",
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

      <div className="relative z-10 mt-auto">
        <button
          onClick={onSubscribe}
          className="w-full py-4 rounded-xl font-semibold text-brand-dark bg-brand-gold hover:bg-yellow-400 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl hover:-translate-y-[2px] flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-gold outline-none"
        >
          {pkg.ctaText}
        </button>
      </div>
    </motion.div>
  );
}
