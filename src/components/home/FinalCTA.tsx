import Link from "next/link";
import Image from "next/image";
import { restaurant } from "@/config/restaurant";
import { integrations } from "@/config/integrations";
import { BRAND_PHOTOS } from "@/data/menu-image-map";

/* ------------------------------------------------------------------ */
/* Editorial closer — full-bleed dessert photography, dark wash.       */
/* ------------------------------------------------------------------ */

export function FinalCTA() {
  return (
    <section
      className="relative overflow-hidden bg-brand-dark"
      aria-labelledby="final-cta-heading"
    >
      <Image
        src={BRAND_PHOTOS.finale}
        alt="Pistachio booza — traditional Damascene ice cream"
        fill
        className="object-cover opacity-40"
        sizes="100vw"
        quality={82}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/85 to-brand-dark/50"
      />

      <div className="relative z-10 container-site py-28 sm:py-36 lg:py-44">
        <div className="max-w-2xl">
          <span className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-gold">
            <span className="w-10 h-px bg-brand-gold/60" aria-hidden="true" />
            Your Table Awaits
          </span>

          <h2
            id="final-cta-heading"
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight mt-7 leading-[1.05]"
          >
            Craving authentic
            <span className="block italic font-normal text-brand-gold">
              Damascus flavor?
            </span>
          </h2>

          <p className="text-lg text-white/65 leading-relaxed mt-8 max-w-lg font-light">
            Order direct for pickup, or have it delivered through Slice.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-12">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center rounded-xl border-2 border-brand-gold bg-brand-gold
                         px-9 py-4 text-xs font-bold uppercase tracking-[0.18em] text-brand-dark
                         transition-all duration-300 hover:bg-transparent hover:text-brand-gold
                         focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-gold outline-none"
            >
              Order Direct
            </Link>

            {integrations.sliceEnabled && (
              <a
                href={restaurant.sliceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/35 bg-white/5 backdrop-blur-sm
                           px-9 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white
                           transition-all duration-300 hover:bg-white hover:text-brand-dark hover:border-white
                           focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-gold outline-none"
              >
                Order Delivery on Slice
              </a>
            )}
          </div>

          <a
            href={restaurant.phoneUrl}
            className="inline-block mt-10 text-sm text-white/50 hover:text-brand-gold transition-colors"
          >
            Or call {restaurant.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
