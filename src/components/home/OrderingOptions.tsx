"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ExternalLink,
  Store,
  UtensilsCrossed,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { restaurant } from "@/config/restaurant";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Clover fulfillment type IDs — DO NOT CHANGE without Clover update  */
/* ------------------------------------------------------------------ */
const CLOVER_PICKUP_ORDER_TYPE = "6F4R7QDTMDM3R";
const CLOVER_DELIVERY_ORDER_TYPE = "BSJ107MZC4GMG";

const isLiveCheckout =
  process.env.NEXT_PUBLIC_ENABLE_LIVE_CHECKOUT === "true";

type FulfillmentType = "pickup" | "delivery";

export function OrderingOptions() {
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("pickup");

  const selectedOrderType =
    fulfillment === "pickup"
      ? CLOVER_PICKUP_ORDER_TYPE
      : CLOVER_DELIVERY_ORDER_TYPE;

  return (
    <section
      className="py-14 sm:py-16 bg-cream-warm"
      aria-labelledby="ordering-heading"
    >
      <div className="container-site">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-brand-dark text-sm font-bold uppercase tracking-widest mb-3">
            Fulfillment Options
          </span>
          <h2
            id="ordering-heading"
            className="font-heading text-3xl sm:text-4xl font-semibold text-olive-dark mt-1"
          >
            How Would You Like to Order?
          </h2>
          <p className="text-base sm:text-lg text-olive leading-relaxed mt-3 max-w-xl mx-auto">
            Order directly from us for the best experience, or choose your
            preferred delivery app.
          </p>
        </div>

        {/* ---- Ordering Cards Grid ---- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Card A: Order Direct */}
          <div className="bg-white rounded-2xl p-7 flex flex-col gap-5 relative border border-brand-dark shadow-xl ring-1 ring-brand-dark/10 md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
              Recommended
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="p-4 w-16 h-16 rounded-2xl bg-brand-dark/10 flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-brand-dark" />
              </div>
              <h3 className="font-heading text-xl font-bold text-olive-dark mb-0.5">
                Order Direct
              </h3>
              <span className="text-xs font-bold text-olive uppercase tracking-wider mb-3">
                Pickup &amp; Delivery
              </span>
              <p className="text-sm text-olive leading-relaxed">
                Order directly from Old Damascus for the best experience and
                prices. Support local!
              </p>
            </div>

            {/* Fulfillment Selector */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setFulfillment("pickup")}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-semibold cursor-pointer",
                  fulfillment === "pickup"
                    ? "border-brand-dark bg-brand-dark/5 text-brand-dark shadow-sm"
                    : "border-border text-olive hover:border-brand-dark/40"
                )}
                aria-pressed={fulfillment === "pickup"}
              >
                <MapPin className="w-5 h-5" />
                Pickup
                {fulfillment === "pickup" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-dark" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setFulfillment("delivery")}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-semibold cursor-pointer",
                  fulfillment === "delivery"
                    ? "border-brand-dark bg-brand-dark/5 text-brand-dark shadow-sm"
                    : "border-border text-olive hover:border-brand-dark/40"
                )}
                aria-pressed={fulfillment === "delivery"}
              >
                <Truck className="w-5 h-5" />
                Delivery
                {fulfillment === "delivery" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-dark" />
                )}
              </button>
            </div>

            {/* Checkout info */}
            <div className="flex items-center gap-2 text-xs text-olive bg-cream rounded-lg px-3 py-2">
              <Clock className="w-3.5 h-3.5 flex-shrink-0 text-brand" />
              <span>Secure Clover checkout</span>
            </div>

            {/* CTA */}
            <div className="mt-auto">
              {isLiveCheckout ? (
                <Link
                  href={`/order?type=${fulfillment}&orderTypeId=${selectedOrderType}`}
                  className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-semibold text-sm bg-brand-dark text-white hover:bg-brand-olive shadow-lg shadow-brand-dark/20 transition-all duration-200"
                  id="order-direct-btn"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Start {fulfillment === "pickup" ? "Pickup" : "Delivery"} Order
                </Link>
              ) : (
                <Link
                  href="/order"
                  className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-semibold text-sm bg-brand-dark text-white hover:bg-brand-olive shadow-lg shadow-brand-dark/20 transition-all duration-200"
                  id="order-direct-btn"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Browse Menu &amp; Order
                </Link>
              )}
            </div>
          </div>

          {/* Card B: DoorDash */}
          <div className="bg-white rounded-2xl p-7 flex flex-col gap-5 relative border border-border shadow-sm hover:shadow-md hover:border-brand-dark/30 transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-heading text-xl font-bold text-olive-dark mb-0.5">
                DoorDash
              </h3>
              <span className="text-xs font-bold text-olive uppercase tracking-wider mb-3">
                Delivery
              </span>
              <p className="text-sm text-olive leading-relaxed">
                Fast and reliable delivery through DoorDash to your door.
              </p>
            </div>

            <div className="mt-auto">
              <a
                href={restaurant.doordashUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-semibold text-sm border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-all duration-200"
                id="order-doordash-btn"
              >
                Order on DoorDash
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card C: Uber Eats */}
          <div className="bg-white rounded-2xl p-7 flex flex-col gap-5 relative border border-border shadow-sm hover:shadow-md hover:border-brand-dark/30 transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-heading text-xl font-bold text-olive-dark mb-0.5">
                Uber Eats
              </h3>
              <span className="text-xs font-bold text-olive uppercase tracking-wider mb-3">
                Delivery
              </span>
              <p className="text-sm text-olive leading-relaxed">
                Real-time delivery tracking through Uber Eats.
              </p>
            </div>

            <div className="mt-auto">
              <a
                href={restaurant.uberEatsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-semibold text-sm border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-all duration-200"
                id="order-ubereats-btn"
              >
                Order on Uber Eats
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Call option */}
        <div className="mt-8 text-center">
          <p className="text-sm text-olive">
            Prefer to call?{" "}
            <a
              href={restaurant.phoneUrl}
              className="font-bold text-brand-dark hover:text-brand transition-colors"
            >
              {restaurant.phone}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
