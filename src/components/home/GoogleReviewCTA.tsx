import { Star, ExternalLink } from "lucide-react";

export function GoogleReviewCTA() {
  return (
    <section
      className="py-16 sm:py-24 bg-brand-olive text-white relative overflow-hidden"
      aria-labelledby="review-heading"
    >
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-olive-dark/40 to-transparent pointer-events-none" />
      
      <div className="container-site relative z-10 text-center max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 mb-2">
            <Star className="w-8 h-8 fill-brand-gold text-brand-gold" />
          </div>

          <h2 id="review-heading" className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">
            Enjoyed your experience?
          </h2>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-4">
            Share your feedback on Google
          </p>

          <a
            href="https://g.page/r/CSL54Z45HjXmEAE/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-gold text-brand-dark rounded-xl font-bold hover:bg-white hover:-translate-y-1 transition-all duration-300 shadow-lg group mt-4"
            id="leave-google-review-btn"
          >
            Leave a Google Review
            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>

          <p className="text-xs font-semibold uppercase tracking-widest text-brand-lime mt-10">
            Old Damascus Mediterranean Restaurant
          </p>
        </div>
      </div>
    </section>
  );
}
