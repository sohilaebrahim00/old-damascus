import Link from "next/link";
import { ChevronRight, UtensilsCrossed } from "lucide-react";

const CATERING_OCCASIONS = [
  "Family Gatherings",
  "Corporate Lunches",
  "Birthday Celebrations",
  "Baby Showers",
  "Weddings",
  "Office Events",
  "Private Celebrations",
  "Community Events",
];

export function CateringBanner() {
  return (
    <section
      className="section-pad relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #234804 0%, #315F05 50%, #548B08 100%)" }}
      aria-labelledby="catering-heading"
    >
      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container-site relative z-10 text-center text-white">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-5 py-2 mb-6 text-sm font-semibold text-brand-lime border border-white/20">
          <UtensilsCrossed className="w-4 h-4" />
          Catering & Events
        </div>

        <h2 id="catering-heading" className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          Bring the Flavors of Damascus{" "}
          <span className="text-brand-lime">to Your Event</span>
        </h2>

        <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Whether it&apos;s a family gathering, corporate lunch, birthday
          celebration, or community event — Old Damascus provides fresh,
          authentic catering for any occasion.
        </p>

        {/* Occasion grid */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {CATERING_OCCASIONS.map((label) => (
            <span
              key={label}
              className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white/90 backdrop-blur"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/catering" className="btn-gold btn-lg">
            Request Catering
            <ChevronRight className="w-4 h-4" />
          </Link>
          <a href="tel:+14697285635" className="btn-outline-white btn-lg">
            Call About Catering
          </a>
        </div>
      </div>
    </section>
  );
}
