import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service details for Old Damascus Mediterranean Restaurant.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="container-site max-w-3xl card p-8 bg-white space-y-6">
        <h1 className="font-heading text-3xl font-bold text-olive-dark">
          Terms of Service
        </h1>
        <p className="text-sm text-olive">
          Last updated: July 6, 2026
        </p>

        <p className="text-sm text-olive leading-relaxed">
          By accessing or using the Old Damascus website, ordering features, or catering requests, you agree to comply with and be bound by these Terms of Service.
        </p>

        <h2 className="font-heading text-xl font-semibold text-olive-dark pt-4">
          Online Orders & Clover Payments
        </h2>
        <p className="text-sm text-olive leading-relaxed">
          All orders are final. Online payments are secured and processed by Clover. Please review your order items, quantities, and chosen pickup/delivery type before submitting checkout.
        </p>

        <h2 className="font-heading text-xl font-semibold text-olive-dark pt-4">
          Catering Requests
        </h2>
        <p className="text-sm text-olive leading-relaxed">
          A request submitted online is not a booking confirmation. Our staff will follow up to secure catering details, verify dates/pricing, and issue a formal agreement.
        </p>
      </div>
    </div>
  );
}
