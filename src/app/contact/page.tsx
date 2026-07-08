"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle, HelpCircle, Loader2, ArrowRight } from "lucide-react";
import { restaurant } from "@/config/restaurant";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  subject: z.string().min(1, "Please select an inquiry type"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  honeypot: z.string().max(0).optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const FAQS = [
  {
    q: "Do you offer delivery?",
    a: "Yes! You can order delivery directly from our website using our Clover system, or complete your delivery through DoorDash or Uber Eats.",
  },
  {
    q: "Can I order pickup?",
    a: "Absolutely. You can order online for pickup directly from our kitchen on W Campbell Rd, Richardson.",
  },
  {
    q: "Do you provide catering?",
    a: "Yes, we offer professional catering services for corporate events, family gatherings, birthday parties, baby showers, and more. Visit our Catering page to submit a request.",
  },
  {
    q: "How do I contact the restaurant?",
    a: "You can call us directly at +1 469-728-5635 or send an email to info@olddamascustx.com.",
  },
];

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      honeypot: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    if (data.honeypot) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || res.statusText || "Message delivery is not configured yet. Please call us directly.");
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
      {/* Premium Hero */}
      <div className="relative bg-brand-dark text-white pt-20 pb-28 sm:pt-28 sm:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-olive-dark/50 to-transparent z-0 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="container-site relative z-10 text-center">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-semibold tracking-wider text-brand-gold uppercase mb-6">
            Get In Touch
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Contact Us
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            We&apos;d love to hear from you. Whether you have a question about our menu, catering, or a recent order, our team is ready to help.
          </p>
        </div>
      </div>

      <div className="container-site py-16 sm:py-24 max-w-6xl mx-auto -mt-16 sm:-mt-24 relative z-20">
        
        {/* Contact Info Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-xl border border-border/50 text-center flex flex-col items-center group hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-gold/20 transition-colors">
              <MapPin className="w-6 h-6 text-brand-gold" />
            </div>
            <h3 className="font-heading text-lg font-bold text-olive-dark mb-2">Location</h3>
            <p className="text-olive text-sm mb-4 flex-1">
              {restaurant.address.street}<br />
              {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zip}
            </p>
            <a href={restaurant.address.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-brand-gold font-medium text-sm inline-flex items-center gap-1 hover:text-yellow-500">
              Get Directions <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-xl border border-border/50 text-center flex flex-col items-center group hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-gold/20 transition-colors">
              <Phone className="w-6 h-6 text-brand-gold" />
            </div>
            <h3 className="font-heading text-lg font-bold text-olive-dark mb-2">Phone</h3>
            <p className="text-olive text-sm mb-4 flex-1">
              Call us for orders or general questions.
            </p>
            <a href={restaurant.phoneUrl} className="text-brand-gold font-medium text-sm inline-flex items-center gap-1 hover:text-yellow-500">
              {restaurant.phone} <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-xl border border-border/50 text-center flex flex-col items-center group hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-gold/20 transition-colors">
              <Mail className="w-6 h-6 text-brand-gold" />
            </div>
            <h3 className="font-heading text-lg font-bold text-olive-dark mb-2">Email</h3>
            <p className="text-olive text-sm mb-4 flex-1">
              Send us an email anytime.
            </p>
            <a href={`mailto:${restaurant.email}`} className="text-brand-gold font-medium text-sm inline-flex items-center gap-1 hover:text-yellow-500">
              {restaurant.email} <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-xl border border-border/50 text-center flex flex-col items-center group hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-gold/20 transition-colors">
              <Clock className="w-6 h-6 text-brand-gold" />
            </div>
            <h3 className="font-heading text-lg font-bold text-olive-dark mb-2">Hours</h3>
            <div className="text-olive text-sm mb-4 flex-1 space-y-1">
              <p>Sun-Thu: 11am - 9pm</p>
              <p>Fri-Sat: 11am - 10pm</p>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Form */}
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
                    Message Sent!
                  </h2>
                  <p className="text-olive text-lg max-w-md mx-auto mb-8">
                    Thank you for reaching out. We have received your message and will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="btn-primary"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit(onSubmit)} 
                  className="space-y-5"
                >
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-olive-dark mb-1">Send a Message</h3>
                    <p className="text-sm text-olive mb-6">Fill out the form below and we&apos;ll be in touch.</p>
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

                  <input type="text" {...register("honeypot")} className="hidden" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="label">Name</label>
                      <input
                        id="name"
                        type="text"
                        {...register("name")}
                        className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="label">Phone</label>
                      <input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
                        placeholder="Phone Number"
                      />
                      {errors.phone && <p className="text-xs text-error mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="label">Email</label>
                    <input
                      id="email"
                      type="email"
                      {...register("email")}
                      className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="subject" className="label">Inquiry Type</label>
                    <select
                      id="subject"
                      {...register("subject")}
                      className="input bg-white focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
                    >
                      <option value="">Select a topic</option>
                      <option value="General">General Inquiry</option>
                      <option value="Catering">Catering</option>
                      <option value="Weekly Meal Plan">Weekly Meal Plan</option>
                      <option value="Order Question">Order Question</option>
                    </select>
                    {errors.subject && <p className="text-xs text-error mt-1">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className="label">Message</label>
                    <textarea
                      id="message"
                      rows={4}
                      {...register("message")}
                      className="input resize-none focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
                      placeholder="How can we help you?"
                    />
                    {errors.message && <p className="text-xs text-error mt-1">{errors.message.message}</p>}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full flex justify-center items-center py-4 text-base shadow-lg shadow-brand-olive/20 hover:-translate-y-0.5 transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column: Map & FAQ */}
          <div className="space-y-8">
            {/* Action Links */}
            <motion.div 
              className="grid grid-cols-2 gap-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.a 
                href={restaurant.doordashUrl}
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeUp} 
                className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-transform group"
              >
                <div className="font-semibold text-brand-dark group-hover:text-brand-gold transition-colors">DoorDash</div>
                <div className="text-xs text-olive">Order Delivery</div>
              </motion.a>
              <motion.a 
                href={restaurant.uberEatsUrl}
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeUp} 
                className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-transform group"
              >
                <div className="font-semibold text-brand-dark group-hover:text-brand-gold transition-colors">Uber Eats</div>
                <div className="text-xs text-olive">Order Delivery</div>
              </motion.a>
            </motion.div>

            {/* Map Fallback placeholder */}
            <motion.div 
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-border/50 aspect-video sm:aspect-[4/3] relative"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <div className="absolute inset-0 bg-brand-olive/10 flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="w-12 h-12 text-brand-gold mb-4 opacity-80" />
                <h4 className="font-heading font-bold text-olive-dark text-xl mb-2">Visit Old Damascus</h4>
                <p className="text-olive text-sm max-w-[200px] mb-6">1310 W Campbell Rd #108<br/>Richardson, TX 75080</p>
                <a href={restaurant.address.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn-outline bg-white">
                  Open in Google Maps
                </a>
              </div>
            </motion.div>

            {/* FAQs */}
            <motion.div 
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-border/50"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <h3 className="font-heading text-2xl font-bold text-olive-dark mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-brand-gold" />
                Quick Answers
              </h3>
              <div className="space-y-4">
                {FAQS.slice(0, 4).map((faq, index) => (
                  <div 
                    key={index}
                    className="border border-border/50 rounded-xl overflow-hidden bg-cream/30"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full text-left px-5 py-4 font-semibold text-olive-dark hover:text-brand-gold transition-colors flex justify-between items-center outline-none"
                    >
                      {faq.q}
                      <span className="text-brand-gold text-xl leading-none">
                        {openFaq === index ? "−" : "+"}
                      </span>
                    </button>
                    
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 text-olive text-sm leading-relaxed border-t border-border/50 pt-3">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
