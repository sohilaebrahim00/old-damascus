"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Leaf, ChefHat, CheckCircle } from "lucide-react";

export function AboutPreview() {
  return (
    <section
      className="section-pad bg-white"
      aria-labelledby="about-preview-heading"
    >
      <div className="container-site grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div className="relative h-80 lg:h-full min-h-[400px] rounded-3xl overflow-hidden">
          <Image
            src="/restaurant/about-interior.jpg"
            alt="Old Damascus restaurant interior"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-olive/40 to-transparent rounded-3xl" />

          {/* Floating card */}
          <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-card">
            <p className="text-xs text-olive text-center mt-1">
              Authentic Mediterranean Cuisine Since the Beginning
            </p>
          </div>
        </div>

        {/* Text */}
        <div>
          <span className="text-brand-dark text-sm font-semibold uppercase tracking-widest">
            Our Story
          </span>
          <h2
            id="about-preview-heading"
            className="section-title mt-2 mb-6"
          >
            A Taste of Damascus in{" "}
            <span className="text-brand-dark">Richardson</span>
          </h2>

          <p className="text-olive leading-relaxed mb-4">
            At Old Damascus, our food is inspired by the culinary traditions of
            Syria&apos;s capital. We prepare our dishes with fresh ingredients,
            authentic spices, and the hospitality that brings families and
            friends together.
          </p>

          <p className="text-olive leading-relaxed mb-8">
            Our menu brings together charcoal-grilled meats, fresh salads,
            handcrafted mezze, rice specialties, family platters, and
            traditional sweets — all prepared with care and served with warmth.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Fresh Ingredients", icon: Leaf },
              { label: "Authentic Spices", icon: ChefHat },
              { label: "Halal Certified", icon: CheckCircle },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="text-center p-3 rounded-xl bg-cream flex flex-col items-center justify-center"
                >
                  <Icon className="w-5 h-5 text-brand-olive mb-1" />
                  <p className="text-xs font-semibold text-olive-dark">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          <Link href="/about" className="btn-outline">
            Learn More About Us
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
