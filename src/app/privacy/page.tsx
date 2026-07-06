import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy details for Old Damascus Mediterranean Restaurant.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="container-site max-w-3xl card p-8 bg-white space-y-6">
        <h1 className="font-heading text-3xl font-bold text-olive-dark">
          Privacy Policy
        </h1>
        <p className="text-sm text-olive">
          Last updated: July 6, 2026
        </p>

        <p className="text-sm text-olive leading-relaxed">
          At Old Damascus Mediterranean Restaurant, we are committed to protecting your privacy. This Privacy Policy describes how we collect, use, and share information when you use our website, online ordering features, or catering request forms.
        </p>

        <h2 className="font-heading text-xl font-semibold text-olive-dark pt-4">
          Information We Collect
        </h2>
        <p className="text-sm text-olive leading-relaxed">
          We collect information you provide directly, such as your name, email, phone number, and physical address for delivery, as well as billing info when processed securely via Clover.
        </p>

        <h2 className="font-heading text-xl font-semibold text-olive-dark pt-4">
          How We Use Your Information
        </h2>
        <p className="text-sm text-olive leading-relaxed">
          We use your information to fulfill orders, process payments, answer inquiry submissions, communicate about catering requests, and comply with legal requirements.
        </p>

        <h2 className="font-heading text-xl font-semibold text-olive-dark pt-4">
          Security
        </h2>
        <p className="text-sm text-olive leading-relaxed">
          All financial data is processed securely through Clover’s official integration. We do not store credit card details on our local servers.
        </p>
      </div>
    </div>
  );
}
