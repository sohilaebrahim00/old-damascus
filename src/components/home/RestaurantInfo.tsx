"use client";

import { Phone, MapPin, Clock, ExternalLink, Navigation } from "lucide-react";
import { restaurant } from "@/config/restaurant";

export function RestaurantInfo() {
  return (
    <section
      className="section-pad bg-cream-warm"
      aria-labelledby="info-heading"
    >
      <div className="container-site">
        <div className="text-center mb-12">
          <h2 id="info-heading" className="section-title">
            Find Us in Richardson
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            We&apos;re conveniently located on W Campbell Rd. Come dine with us, or
            order for pickup and delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-2xl overflow-hidden shadow-card h-80 lg:h-96 bg-cream flex flex-col relative">
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ? (
              <iframe
                title="Old Damascus Mediterranean Restaurant location"
                src={process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL}
                className="w-full h-full border-0 absolute inset-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-white border border-olive-light/20">
                <div className="w-16 h-16 rounded-full bg-brand-olive/10 flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-brand-dark" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-olive-dark mb-2">
                  Old Damascus Mediterranean Restaurant
                </h3>
                <p className="text-olive mb-6 max-w-sm">
                  {restaurant.address.full}
                </p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=1310+W+Campbell+Rd+%23108%2C+Richardson%2C+TX+75080"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <Navigation className="w-4 h-4 mr-2 inline" />
                  Get Directions
                </a>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Address */}
            <div className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-dark/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-brand-dark" />
              </div>
              <div>
                <h3 className="font-semibold text-olive-dark text-sm mb-1">
                  Address
                </h3>
                <p className="text-sm text-olive">{restaurant.address.full}</p>
                <a
                  href={restaurant.address.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-dark font-semibold mt-2 inline-flex items-center gap-1 hover:text-brand"
                >
                  <Navigation className="w-3 h-3" />
                  Get Directions
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-dark/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-brand-dark" />
              </div>
              <div>
                <h3 className="font-semibold text-olive-dark text-sm mb-1">
                  Phone
                </h3>
                <a
                  href={restaurant.phoneUrl}
                  className="text-sm text-olive hover:text-brand-dark transition-colors"
                >
                  {restaurant.phone}
                </a>
                <br />
                <a
                  href={restaurant.phoneUrl}
                  className="text-xs text-brand-dark font-semibold mt-2 inline-flex items-center gap-1 hover:text-brand"
                >
                  Click to Call
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-dark/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-brand-dark" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-olive-dark text-sm mb-2">
                  Hours
                </h3>
                <div className="space-y-1">
                  {restaurant.hours.map((h) => (
                    <div
                      key={h.days}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-olive">{h.days}</span>
                      <span className="font-semibold text-olive-dark">
                        {h.open} – {h.close}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-olive/60 mt-2">
                  * Hours subject to change. Call to confirm.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href={restaurant.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline btn-sm flex-1"
              >
                Google Review
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={restaurant.doordashUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline btn-sm flex-1"
              >
                DoorDash
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={restaurant.uberEatsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline btn-sm flex-1"
              >
                Uber Eats
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
