import { Phone, ExternalLink } from "lucide-react";
import { restaurant } from "@/config/restaurant";

export function FinalCTA() {
  return (
    <section
      className="section-pad bg-cream"
      aria-labelledby="final-cta-heading"
    >
      <div className="container-site text-center max-w-3xl mx-auto">
        <span className="text-brand-dark text-sm font-semibold uppercase tracking-widest">
          Ready to Order?
        </span>
        <h2 id="final-cta-heading" className="section-title mt-2 mb-4">
          Craving Authentic Damascus Flavor?
        </h2>
        <p className="section-subtitle max-w-xl mx-auto mb-10">
          Order fresh Syrian and Mediterranean cuisine directly from us, or
          through DoorDash and Uber Eats.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
          <a href="/order" className="btn-gold btn-lg">
            Order Direct
          </a>

          <a
            href={restaurant.doordashUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline btn-lg"
          >
            Order with DoorDash
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href={restaurant.uberEatsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline btn-lg"
          >
            Order with Uber Eats
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href={restaurant.phoneUrl}
            className="btn-ghost btn-lg border border-border"
          >
            <Phone className="w-5 h-5" />
            Call the Restaurant
          </a>
        </div>
      </div>
    </section>
  );
}
