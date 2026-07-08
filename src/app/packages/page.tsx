import type { Metadata } from "next";
import { PackagesSection } from "@/components/home/PackagesSection";
import { HelpCircle } from "lucide-react";
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
    a: "Simply select your preferred package on this page and submit an inquiry with your desired start date. Our team will contact you directly to finalize your menu preferences and activate your plan.",
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
      {/* Hero */}
      <div className="bg-brand-dark text-white py-12 sm:py-16">
        <div className="container-site text-center">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            Weekly Meal Packages
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Convenient, authentic Mediterranean dining for your busy lifestyle.
          </p>
        </div>
      </div>

      {/* Packages Section (Re-used) */}
      <div className="-mt-16 sm:-mt-24">
        <PackagesSection />
      </div>

      {/* FAQ Section */}
      <div className="container-site py-16 sm:py-24 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-olive-dark">
            Frequently Asked Questions
          </h2>
        </div>
        
        <PackagesFaqClient faqs={FAQS} />
      </div>
    </div>
  );
}
