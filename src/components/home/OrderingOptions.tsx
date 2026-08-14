"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Bike,
  ShieldCheck,
  Clock,
  Navigation,
  Zap,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { restaurant } from "@/config/restaurant";
import { integrations } from "@/config/integrations";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { BrandPattern } from "@/components/brand/BrandPattern";

/* ------------------------------------------------------------------ */
/* Fulfillment options                                                 */
/* Direct pickup runs through the existing menu → cart → Clover        */
/* checkout flow. Delivery is handled by Slice (external link only).   */
/* ------------------------------------------------------------------ */

interface Benefit {
  icon: LucideIcon;
  label: string;
}

const DIRECT_BENEFITS: Benefit[] = [
  { icon: ShieldCheck, label: "Secure payment with Clover" },
  { icon: Clock, label: "Ready when you arrive" },
];

const SLICE_BENEFITS: Benefit[] = [
  { icon: Navigation, label: "Live order tracking" },
  { icon: ShieldCheck, label: "Secure payment" },
  { icon: Zap, label: "Fast & reliable" },
];

function BenefitList({
  benefits,
  tone,
}: {
  benefits: Benefit[];
  tone: "dark" | "light";
}) {
  return (
    <ul className="mt-8 space-y-4">
      {benefits.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className={cn(
            "flex items-center gap-3.5 text-sm",
            tone === "dark" ? "text-white/75" : "text-olive"
          )}
        >
          <Icon
            className="w-[18px] h-[18px] text-brand-gold flex-shrink-0"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          {label}
        </li>
      ))}
    </ul>
  );
}

export function OrderingOptions() {
  const sliceEnabled = integrations.sliceEnabled;

  return (
    <section
      className="relative overflow-hidden bg-cream-warm py-20 sm:py-28"
      aria-labelledby="ordering-heading"
    >
      <BrandPattern className="text-brand-olive" scale={96} opacity={0.045} />
      <div className="relative z-10 container-site">
        {/* ---- Section Header ---- */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-gold">
            Fulfillment
          </span>
          <h2
            id="ordering-heading"
            className="font-heading text-4xl sm:text-5xl font-semibold text-olive-dark mt-5 tracking-tight"
          >
            How Would You Like to Order?
          </h2>
          <span
            className="block w-12 h-px bg-brand-gold mx-auto mt-7"
            aria-hidden="true"
          />
          <p className="text-base sm:text-lg text-olive leading-relaxed mt-7">
            Collect your order fresh from our kitchen, or have it delivered
            through our preferred partner.
          </p>
        </div>

        {/* ---- Fulfillment Cards ---- */}
        <div
          className={cn(
            "grid grid-cols-1 gap-6 lg:gap-8 items-stretch mx-auto",
            sliceEnabled ? "md:grid-cols-2 max-w-5xl" : "max-w-xl"
          )}
        >
          {/* ---- Card A — Order Direct (Pickup) ---- */}
          <div className="relative flex flex-col h-full rounded-3xl bg-brand-dark text-white p-8 sm:p-10 lg:p-12 shadow-card-hover ring-1 ring-brand-gold/25 overflow-hidden">
            {/* Soft gold light */}
            <div
              className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand-gold/10 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col h-full">
              <span className="self-start px-3.5 py-1.5 rounded-full border border-brand-gold/40 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gold">
                Recommended
              </span>

              <div className="w-16 h-16 rounded-2xl border border-brand-gold/25 bg-brand-gold/10 flex items-center justify-center mt-9">
                <ShoppingBag
                  className="w-7 h-7 text-brand-gold"
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
              </div>

              <h3 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight mt-8">
                Order Direct
              </h3>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-gold mt-3">
                Pickup
              </span>

              <p className="text-sm sm:text-[15px] leading-relaxed text-white/70 mt-6">
                Skip the fees and order directly with us. Freshly prepared and
                ready when you arrive.
              </p>

              <BenefitList benefits={DIRECT_BENEFITS} tone="dark" />

              <div className="mt-auto pt-10">
                <Link
                  href="/menu"
                  id="order-direct-btn"
                  className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-brand-gold bg-brand-gold px-6 py-4
                             text-xs font-bold uppercase tracking-[0.18em] text-brand-dark
                             transition-all duration-200 hover:bg-white hover:border-white hover:-translate-y-[1.5px]
                             active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-gold outline-none"
                >
                  Order Pickup
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* ---- Card B — Order Delivery (Slice) ---- */}
          {sliceEnabled && (
            <div className="relative flex flex-col h-full rounded-3xl bg-white p-8 sm:p-10 lg:p-12 border border-border shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-brand-gold/40">
              <span className="self-start px-3.5 py-1.5 rounded-full border border-border text-[10px] font-semibold uppercase tracking-[0.25em] text-olive">
                Preferred Partner
              </span>

              <div className="w-16 h-16 rounded-2xl border border-border bg-cream flex items-center justify-center mt-9">
                <Bike
                  className="w-7 h-7 text-brand-dark"
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
              </div>

              <h3 className="font-heading text-3xl sm:text-4xl font-semibold text-olive-dark tracking-tight mt-8">
                Order Delivery
              </h3>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-olive mt-3">
                Powered by Slice
              </span>

              <p className="text-sm sm:text-[15px] leading-relaxed text-olive mt-6">
                Get Old Damascus delivered to your door through our preferred
                partner.
              </p>

              <BenefitList benefits={SLICE_BENEFITS} tone="light" />

              <div className="mt-auto pt-10">
                <a
                  href={restaurant.sliceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent("slice_click", { source: "ordering_options" })
                  }
                  id="order-slice-btn"
                  className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-brand-dark bg-transparent px-6 py-4
                             text-xs font-bold uppercase tracking-[0.18em] text-brand-dark
                             transition-all duration-200 hover:bg-brand-dark hover:text-white hover:-translate-y-[1.5px]
                             active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-gold outline-none"
                >
                  Order Delivery
                  <ExternalLink
                    className="w-4 h-4"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ---- Call option ---- */}
        <div className="mt-14 text-center">
          <p className="text-sm text-olive">
            Prefer to call?{" "}
            <a
              href={restaurant.phoneUrl}
              className="font-semibold text-brand-dark hover:text-brand-gold transition-colors"
            >
              {restaurant.phone}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
