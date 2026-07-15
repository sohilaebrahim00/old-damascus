import type { Metadata } from "next";
import { PackagesSection } from "@/components/home/PackagesSection";
import { Phone, ArrowRight } from "lucide-react";
import { restaurant } from "@/config/restaurant";
import { PackagesFaqClient } from "./PackagesFaqClient";

export const metadata: Metadata = {
  title: "Weekly Meal Packages",
  description: "Subscribe to Old Damascus weekly meal packages. Authentic Mediterranean food prepared fresh daily in Richardson, TX. Starting at $129/week.",
  alternates: { canonical: "/packages" },
};

const FAQS = [
  {
    q: "Do you offer weekly meal plans?",
    a: "Yes! We offer curated weekly meal packages starting at $129/week to bring the true taste of Damascus to your table every day.",
  },
  {
    q: "How do I subscribe to a weekly meal package?",
    a: "Simply select your preferred package on this page to activate immediately online via secure Clover checkout. Once paid, you will instantly receive your unique Membership ID and QR code for daily meal redemptions. You may also submit a staff inquiry if you prefer in-person assistance.",
  },
  {
    q: "Do you offer catering?",
    a: "Yes, we provide professional catering for events of all sizes. Please visit our Catering page to request a custom quote.",
  },
  {
    q: "Can I order through DoorDash or Uber Eats?",
    a: "Yes, we partner with DoorDash and Uber Eats for standard menu delivery.",
  },
  {
    q: "Where is Old Damascus located?",
    a: `We are located at ${restaurant.address.full}.`,
  },
  {
    q: "Are hours always the same?",
    a: "Our standard hours are Sunday–Thursday 11am-9pm and Friday-Saturday 11am-10pm, but hours are subject to change on holidays. Please call us to confirm.",
  },
];

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Premium Hero */}
      <div className="relative bg-brand-dark text-white pt-20 pb-28 sm:pt-28 sm:pb-36 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-olive-dark/50 to-transparent z-0 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="container-site relative z-10 text-center">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-semibold tracking-wider text-brand-gold uppercase mb-6">
            Chef-Prepared Daily
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Weekly Meal Plans
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience the true taste of Damascus at home. Authentic Mediterranean meals prepared fresh and ready for your busy lifestyle.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#packages"
              className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Choose Your Plan
              <ArrowRight className="w-4 h-4" />
            </a>
            <a 
              href={restaurant.phoneUrl}
              className="px-8 py-3.5 text-base w-full sm:w-auto font-semibold text-white border border-white/30 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call to Subscribe
            </a>
          </div>
        </div>
      </div>

      {/* Packages Section (Re-used) */}
      <div id="packages" className="-mt-16 sm:-mt-24 relative z-20">
        <PackagesSection />
      </div>

      {/* FAQ Section */}
      <div className="container-site py-16 sm:py-24 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-olive-dark">
            Frequently Asked Questions
          </h2>
          <p className="text-olive mt-3">
            Everything you need to know about our weekly plans.
          </p>
        </div>
        
        <PackagesFaqClient faqs={FAQS} />
      </div>

      {/* Final CTA */}
      <div className="bg-cream-warm py-16 border-t border-border/50 text-center">
        <div className="container-site max-w-2xl">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-olive-dark mb-4">
            Need help choosing a plan?
          </h2>
          <p className="text-olive mb-8">
            Our team is happy to assist you in selecting the perfect package for your dietary preferences and schedule.
          </p>
          <a href={restaurant.phoneUrl} className="btn-primary inline-flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact the Restaurant
          </a>
        </div>
      </div>
    </div>
  );
}
