"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { restaurant } from "@/config/restaurant";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  subject: z.string().min(1, "Please select or type a subject"),
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
    q: "Can I order directly from the website?",
    a: "Yes, when our Clover direct ordering system is active, you can build your cart and pay securely right here. If direct ordering is undergoing maintenance, DoorDash and Uber Eats links are always available.",
  },
  {
    q: "Do you provide catering?",
    a: "Yes, we offer professional catering services for corporate events, family gatherings, birthday parties, baby showers, and more. Visit our Catering page to submit a request.",
  },
  {
    q: "Where is the restaurant located?",
    a: "We are located at 1310 W Campbell Rd #108, Richardson, TX 75080. We have convenient parking and a welcoming dining area.",
  },
  {
    q: "How are online payments processed?",
    a: "All online payments are securely processed server-side through Clover's official Hosted Checkout flow. We never store or handle raw card numbers on our servers.",
  },
  {
    q: "Can I place a large family order?",
    a: "Yes, we have delicious family platters and mix grills designed for sharing. Feel free to order online or call us directly for large group suggestions.",
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
        throw new Error(errorData.error || res.statusText || "Failed to send message. Please try again later.");
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
            Contact Us
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Have questions or feedback? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <div className="container-site py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Info & Map */}
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-olive-dark">
              Get In Touch
            </h2>
            <p className="text-olive">
              Visit us, give us a call, or fill out the contact form. We aim to respond to all inquiries within 24 hours.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card p-5 flex items-start gap-4">
                <MapPin className="w-5 h-5 text-brand-dark flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm text-olive-dark">Address</h3>
                  <p className="text-xs text-olive mt-1">{restaurant.address.full}</p>
                </div>
              </div>

              <div className="card p-5 flex items-start gap-4">
                <Phone className="w-5 h-5 text-brand-dark flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm text-olive-dark">Phone</h3>
                  <p className="text-xs text-olive mt-1">{restaurant.phone}</p>
                </div>
              </div>

              <div className="card p-5 flex items-start gap-4">
                <Mail className="w-5 h-5 text-brand-dark flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm text-olive-dark">Email</h3>
                  <p className="text-xs text-olive mt-1">{restaurant.email}</p>
                </div>
              </div>

              <div className="card p-5 flex items-start gap-4">
                <Clock className="w-5 h-5 text-brand-dark flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm text-olive-dark">Hours</h3>
                  <p className="text-xs text-olive mt-1">
                    Sun-Thu: 11am–9pm <br />
                    Fri-Sat: 11am–10pm
                  </p>
                </div>
              </div>
            </div>

            {/* Static Map Placeholder/Directions */}
            <div className="card p-6 bg-cream-warm flex flex-col items-center justify-center text-center h-48 border border-border">
              <MapPin className="w-8 h-8 text-brand-dark mb-2" />
              <p className="font-semibold text-sm text-olive-dark">1310 W Campbell Rd #108</p>
              <a
                href={restaurant.address.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn-sm mt-3"
              >
                Get Directions
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="card p-6 sm:p-8 bg-white">
            {isSubmitted ? (
              <div className="text-center py-10 space-y-4">
                <CheckCircle className="w-16 h-16 text-success mx-auto" />
                <h2 className="font-heading text-2xl font-semibold text-olive-dark">
                  Message Sent Successfully!
                </h2>
                <p className="text-sm text-olive max-w-sm mx-auto">
                  Thank you for reaching out. We will get back to you shortly.
                </p>
                <button onClick={() => setIsSubmitted(false)} className="btn-primary">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 border border-error/20 text-error rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <input type="text" {...register("honeypot")} className="hidden" />

                <div>
                  <label htmlFor="name" className="label">Name</label>
                  <input id="name" type="text" {...register("name")} className="input" placeholder="Your Name" />
                  {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="label">Email</label>
                  <input id="email" type="email" {...register("email")} className="input" placeholder="your@email.com" />
                  {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="label">Phone</label>
                  <input id="phone" type="tel" {...register("phone")} className="input" placeholder="Phone Number" />
                  {errors.phone && <p className="text-xs text-error mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label htmlFor="subject" className="label">Subject</label>
                  <input id="subject" type="text" {...register("subject")} className="input" placeholder="Subject / Reason for contact" />
                  {errors.subject && <p className="text-xs text-error mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="label">Message</label>
                  <textarea id="message" rows={4} {...register("message")} className="input resize-none" placeholder="Your message here..." />
                  {errors.message && <p className="text-xs text-error mt-1">{errors.message.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-center text-olive-dark mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="card bg-white overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-olive-dark hover:bg-cream/40 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-brand-dark flex-shrink-0" />
                    {faq.q}
                  </span>
                  <span className="text-xl font-light text-olive">{openFaq === idx ? "−" : "+"}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-sm text-olive leading-relaxed border-t border-border/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
