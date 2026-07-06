import type { Metadata } from "next";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import Link from "next/link";
import { Leaf, ChefHat, Handshake } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about the story, values, and traditions of Old Damascus Mediterranean Restaurant in Richardson, TX. Experience authentic Syrian hospitality.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header Banner */}
      <div className="bg-brand-dark text-white py-12 sm:py-16">
        <div className="container-site text-center">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            About Us
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            A Taste of Damascus in the Heart of Richardson
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-site py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-olive-dark">
              Our Story
            </h2>
            <p className="text-olive leading-relaxed">
              At Old Damascus, we celebrate the flavors, traditions, and hospitality of Syrian cuisine. Our menu brings together charcoal-grilled meats, fresh salads, handcrafted mezze, rice specialties, family platters, and traditional sweets prepared with care.
            </p>
            <p className="text-olive leading-relaxed">
              Our food is inspired by the culinary traditions of Syria&apos;s capital. We prepare our dishes with fresh ingredients, authentic spices, and the hospitality that brings families and friends together.
            </p>
          </div>
          <div className="relative h-80 rounded-3xl overflow-hidden shadow-card">
            <ImageWithFallback
              src="/restaurant/about-interior.jpg"
              fallbackSrc="/menu/placeholder.jpg"
              alt="Old Damascus Dining Room"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Pillars / Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card p-6 bg-white space-y-3 flex flex-col items-start">
            <div className="p-3 bg-brand-olive/10 rounded-full">
              <Leaf className="w-8 h-8 text-brand-olive" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-olive-dark">
              Fresh Ingredients
            </h3>
            <p className="text-sm text-olive leading-relaxed">
              We source only the freshest produce and meats, ensuring every dish is loaded with flavor and meets our high standards of quality.
            </p>
          </div>
          <div className="card p-6 bg-white space-y-3 flex flex-col items-start">
            <div className="p-3 bg-brand-olive/10 rounded-full">
              <ChefHat className="w-8 h-8 text-brand-olive" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-olive-dark">
              Authentic Syrian Flavors
            </h3>
            <p className="text-sm text-olive leading-relaxed">
              We use traditional spices and cooking techniques direct from Damascus to create an authentic dining experience.
            </p>
          </div>
          <div className="card p-6 bg-white space-y-3 flex flex-col items-start">
            <div className="p-3 bg-brand-olive/10 rounded-full">
              <Handshake className="w-8 h-8 text-brand-olive" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-olive-dark">
              Hospitality & Community
            </h3>
            <p className="text-sm text-olive leading-relaxed">
              We treat our customers like family. Hospitality is at the center of everything we do, welcoming you with open arms.
            </p>
          </div>
        </div>

        {/* CTA section */}
        <div className="card p-8 bg-brand-olive text-white text-center space-y-6">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-white">
            Experience Our Food Today
          </h2>
          <p className="text-white/80 max-w-xl mx-auto text-sm sm:text-base">
            Dine in, order pickup, or delivery to enjoy the rich taste of Syrian cuisine right in Richardson, Texas.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/menu" className="btn-gold">
              View Our Menu
            </Link>
            <Link href="/contact" className="btn-outline-white">
              Get Directions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
