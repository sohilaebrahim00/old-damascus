"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { CheckCircle, AlertCircle, Sparkles, UtensilsCrossed, Truck, Loader2 } from "lucide-react";
import { restaurant } from "@/config/restaurant";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { trackEvent } from "@/lib/analytics";

const cateringSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  eventType: z.string().min(1, "Please select an event type"),
  eventDate: z.string().min(1, "Please select an event date"),
  eventTime: z.string().min(1, "Please select an event time"),
  guestCount: z.number().min(10, "Minimum guest count is 10"),
  serviceType: z.enum(["pickup", "delivery"]),
  address: z.string().optional(),
  budget: z.string().min(1, "Please select a budget range"),
  notes: z.string().optional(),
  honeypot: z.string().max(0).optional(), // anti-spam
});

type CateringFormValues = z.infer<typeof cateringSchema>;

export default function CateringPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<CateringFormValues>({
    resolver: zodResolver(cateringSchema),
    defaultValues: {
      guestCount: 10,
      serviceType: "pickup",
      address: "",
      notes: "",
      honeypot: "",
    },
  });

  const serviceType = useWatch({
    control,
    name: "serviceType",
  });

  const onSubmit = async (data: CateringFormValues) => {
    if (data.honeypot) return; // bot block

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/catering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || res.statusText || "Failed to submit request. Please try again.");
      }

      trackEvent("catering_submit", { guest_count: data.guestCount, event_date: data.eventDate });
      setIsSubmitted(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Premium Hero */}
      <div className="relative bg-brand-dark text-white pt-20 pb-28 sm:pt-28 sm:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-olive-dark/50 to-transparent z-0 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="container-site relative z-10 text-center">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-semibold tracking-wider text-brand-gold uppercase mb-6">
            Event Services
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Catering for Every Occasion
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Authentic Mediterranean catering tailored to your corporate events, family gatherings, and celebrations.
          </p>
        </div>
      </div>

      <div className="container-site py-16 sm:py-24 max-w-6xl mx-auto -mt-16 sm:-mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Benefits & Trust */}
          <motion.div 
            className="space-y-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <div>
              <h2 className="font-heading text-3xl font-bold text-olive-dark mb-4">
                Exceptional Quality for Your Guests
              </h2>
              <p className="text-olive text-lg leading-relaxed">
                From fresh mezze platters to slow-cooked mandi and charcoal-grilled skewers, our catering menu brings the vibrant flavors of Damascus directly to your event.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div variants={fadeUp} className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
                <Sparkles className="w-8 h-8 text-brand-gold mb-4" />
                <h3 className="font-semibold text-olive-dark mb-2">All Occasions</h3>
                <p className="text-sm text-olive">Corporate events, weddings, family platters & parties.</p>
              </motion.div>
              
              <motion.div variants={fadeUp} className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
                <UtensilsCrossed className="w-8 h-8 text-brand-gold mb-4" />
                <h3 className="font-semibold text-olive-dark mb-2">Customizable Menus</h3>
                <p className="text-sm text-olive">Select from our grills, mandi, dynamic mezze & drinks.</p>
              </motion.div>
              
              <motion.div variants={fadeUp} className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 sm:col-span-2">
                <Truck className="w-8 h-8 text-brand-gold mb-4" />
                <h3 className="font-semibold text-olive-dark mb-2">Delivery & Pickup</h3>
                <p className="text-sm text-olive">Convenient pickup or delivery direct to your location. We ensure your food arrives fresh, hot, and ready to serve.</p>
              </motion.div>
            </div>

            <div className="bg-brand-olive/10 border border-brand-olive/20 rounded-2xl p-6 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-brand-olive shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-olive-dark mb-1">What happens next?</h4>
                <p className="text-sm text-olive">
                  Submit your request and our catering team will contact you within 24 hours to confirm menu options, dietary needs, and finalize pricing.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div 
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-border/50"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 space-y-4"
                >
                  <CheckCircle className="w-20 h-20 text-success mx-auto" />
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-olive-dark">
                    Catering Request Submitted!
                  </h2>
                  <p className="text-olive text-lg max-w-md mx-auto mb-8">
                    Thank you for contacting us. We will review your request and get back to you shortly to finalize details.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="btn-primary"
                  >
                    Submit Another Request
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit(onSubmit)} 
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-olive-dark mb-1">Event Details</h3>
                    <p className="text-sm text-olive mb-6">Tell us about your upcoming event.</p>
                  </div>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-red-50 border border-error/20 text-error rounded-xl flex items-center gap-3 overflow-hidden"
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bot Honeypot */}
                  <input type="text" {...register("honeypot")} className="hidden" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="eventType" className="label">Event Type</label>
                      <select id="eventType" {...register("eventType")} className="input bg-white focus-visible:ring-2 focus-visible:ring-brand-gold outline-none">
                        <option value="">Select Event Type</option>
                        {restaurant.catering.eventTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {errors.eventType && <p className="text-xs text-error mt-1">{errors.eventType.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="guestCount" className="label">Guest Count (min 10)</label>
                      <input
                        id="guestCount"
                        type="number"
                        {...register("guestCount", { valueAsNumber: true })}
                        className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
                      />
                      {errors.guestCount && <p className="text-xs text-error mt-1">{errors.guestCount.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="eventDate" className="label">Event Date</label>
                      <input id="eventDate" type="date" {...register("eventDate")} className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none" />
                      {errors.eventDate && <p className="text-xs text-error mt-1">{errors.eventDate.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="eventTime" className="label">Preferred Time</label>
                      <input id="eventTime" type="time" {...register("eventTime")} className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none" />
                      {errors.eventTime && <p className="text-xs text-error mt-1">{errors.eventTime.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="serviceType" className="label">Service Type</label>
                      <select id="serviceType" {...register("serviceType")} className="input bg-white focus-visible:ring-2 focus-visible:ring-brand-gold outline-none">
                        <option value="pickup">Pickup</option>
                        <option value="delivery">Delivery</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="budget" className="label">Estimated Budget</label>
                      <select id="budget" {...register("budget")} className="input bg-white focus-visible:ring-2 focus-visible:ring-brand-gold outline-none">
                        <option value="">Select Budget Range</option>
                        {restaurant.catering.budgetRanges.map((range) => (
                          <option key={range} value={range}>{range}</option>
                        ))}
                      </select>
                      {errors.budget && <p className="text-xs text-error mt-1">{errors.budget.message}</p>}
                    </div>
                  </div>

                  {serviceType === "delivery" && (
                    <div>
                      <label htmlFor="address" className="label">Delivery Address</label>
                      <input
                        id="address"
                        type="text"
                        {...register("address")}
                        className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
                        placeholder="Street Address, Suite, City, ZIP"
                      />
                    </div>
                  )}

                  <div className="pt-6 border-t border-border/50 space-y-4">
                    <h4 className="font-semibold text-olive-dark">Contact Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="label">Name</label>
                        <input id="name" type="text" {...register("name")} className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none" placeholder="Your Name" />
                        {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="phone" className="label">Phone</label>
                        <input id="phone" type="tel" {...register("phone")} className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none" placeholder="Phone Number" />
                        {errors.phone && <p className="text-xs text-error mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="label">Email Address</label>
                      <input id="email" type="email" {...register("email")} className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none" placeholder="your@email.com" />
                      {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="notes" className="label">Menu Interests & Additional Notes</label>
                      <textarea
                        id="notes"
                        rows={3}
                        {...register("notes")}
                        className="input resize-none focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
                        placeholder="Tell us what you'd like to serve, diet preferences, event details..."
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full flex justify-center items-center py-4 text-base shadow-lg shadow-brand-olive/20 hover:-translate-y-0.5 transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Catering Request"
                      )}
                    </button>
                    <p className="text-xs text-center text-olive mt-4 max-w-sm mx-auto">
                      Submitting this form does not guarantee booking or charge your card. We will call you to confirm.
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
