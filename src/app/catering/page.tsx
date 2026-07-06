"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { CheckCircle, AlertCircle, Phone, Sparkles, UtensilsCrossed, Truck } from "lucide-react";
import { restaurant } from "@/config/restaurant";

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
      // Simulate/perform Supabase insert (represented locally)
      const res = await fetch("/api/catering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to submit request. Please try again.");
      }

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
      {/* Header Banner */}
      <div className="bg-brand-dark text-white py-12 sm:py-16">
        <div className="container-site text-center">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            Catering Request
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Bring the Flavors of Damascus to Your Guests
          </p>
        </div>
      </div>

      <div className="container-site py-16 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="card p-5 text-center flex flex-col items-center justify-center">
            <Sparkles className="w-7 h-7 text-brand-olive mb-1" />
            <h3 className="font-semibold text-sm text-olive-dark mt-2">All Occasions</h3>
            <p className="text-xs text-olive mt-1">Corporate events, weddings, family platters & parties.</p>
          </div>
          <div className="card p-5 text-center flex flex-col items-center justify-center">
            <UtensilsCrossed className="w-7 h-7 text-brand-olive mb-1" />
            <h3 className="font-semibold text-sm text-olive-dark mt-2">Customizable Menus</h3>
            <p className="text-xs text-olive mt-1">Select from our grills, mandi, dynamic mezze & drinks.</p>
          </div>
          <div className="card p-5 text-center flex flex-col items-center justify-center">
            <Truck className="w-7 h-7 text-brand-olive mb-1" />
            <h3 className="font-semibold text-sm text-olive-dark mt-2">Delivery & Pickup</h3>
            <p className="text-xs text-olive mt-1">Convenient pickup or delivery direct to your location.</p>
          </div>
        </div>

        <div className="card p-6 sm:p-8 bg-white">
          {isSubmitted ? (
            <div className="text-center py-10 space-y-4">
              <CheckCircle className="w-16 h-16 text-success mx-auto" />
              <h2 className="font-heading text-2xl font-semibold text-olive-dark">
                Catering Request Submitted!
              </h2>
              <p className="text-olive max-w-md mx-auto">
                Thank you for contacting us. We will review your request and get back to you shortly to finalize details.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="btn-primary"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-error/20 text-error rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Bot Honeypot */}
              <input type="text" {...register("honeypot")} className="hidden" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="label">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    className="input"
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="label">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="input"
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="label">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    className="input"
                    placeholder="+1 (555) 555-5555"
                  />
                  {errors.phone && <p className="text-xs text-error mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label htmlFor="eventType" className="label">Event Type</label>
                  <select id="eventType" {...register("eventType")} className="input bg-white">
                    <option value="">Select Event Type</option>
                    {restaurant.catering.eventTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.eventType && <p className="text-xs text-error mt-1">{errors.eventType.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="eventDate" className="label">Event Date</label>
                  <input id="eventDate" type="date" {...register("eventDate")} className="input" />
                  {errors.eventDate && <p className="text-xs text-error mt-1">{errors.eventDate.message}</p>}
                </div>

                <div>
                  <label htmlFor="eventTime" className="label">Preferred Time</label>
                  <input id="eventTime" type="time" {...register("eventTime")} className="input" />
                  {errors.eventTime && <p className="text-xs text-error mt-1">{errors.eventTime.message}</p>}
                </div>

                <div>
                  <label htmlFor="guestCount" className="label">Guest Count (min 10)</label>
                  <input
                    id="guestCount"
                    type="number"
                    {...register("guestCount", { valueAsNumber: true })}
                    className="input"
                  />
                  {errors.guestCount && <p className="text-xs text-error mt-1">{errors.guestCount.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="serviceType" className="label">Service Type</label>
                  <select id="serviceType" {...register("serviceType")} className="input bg-white">
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="budget" className="label">Estimated Budget</label>
                  <select id="budget" {...register("budget")} className="input bg-white">
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
                    className="input"
                    placeholder="Street Address, Suite, City, ZIP"
                  />
                </div>
              )}

              <div>
                <label htmlFor="notes" className="label">Menu Interests & Additional Notes</label>
                <textarea
                  id="notes"
                  rows={4}
                  {...register("notes")}
                  className="input"
                  placeholder="Tell us what you'd like to serve, diet preferences, event details..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 justify-center disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Catering Request"}
                </button>
                <a
                  href={`tel:${restaurant.phoneRaw}`}
                  className="btn-outline justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call to Discuss
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
