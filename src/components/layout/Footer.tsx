"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  Star,
} from "lucide-react";
import { restaurant } from "@/config/restaurant";
import { currentYear, isSocialUrlValid } from "@/lib/utils";
import { InstallButton } from "@/components/pwa/InstallButton";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About Us" },
  { href: "/catering", label: "Catering" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-brand-olive text-white relative overflow-hidden">
      {/* Main Footer */}
      <div className="container-site py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-1">
          <Link href="/" className="block mb-4">
            <Image
              src="/brand/old-damascus-logo-transparent.png"
              alt="Old Damascus Mediterranean Restaurant"
              width={300}
              height={150}
              className="h-[56px] w-auto sm:h-[64px] object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)] relative z-10"
            />
          </Link>
          <p className="text-sm text-white/75 leading-relaxed mb-5">
            Authentic Syrian and Mediterranean cuisine prepared with fresh
            ingredients and the warmth of Damascus hospitality.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {isSocialUrlValid(restaurant.social.facebook) && (
              <a
                href={restaurant.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
            )}
            {isSocialUrlValid(restaurant.social.instagram) && (
              <a
                href={restaurant.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            )}
            {/* TikTok and YouTube icons via text when social URLs are added */}
          </div>
          <InstallButton />
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-heading text-base font-semibold text-white mb-4">
            Pages
          </h3>
          <ul className="space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/75 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/order"
                className="text-sm text-brand-lime hover:text-white transition-colors font-semibold"
              >
                Order Online
              </Link>
            </li>
          </ul>

          <h3 className="font-heading text-base font-semibold text-white mb-4 mt-6">
            Order Options
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href={restaurant.doordashUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/75 hover:text-white transition-colors flex items-center gap-1.5"
              >
                DoorDash
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </li>
            <li>
              <a
                href={restaurant.uberEatsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/75 hover:text-white transition-colors flex items-center gap-1.5"
              >
                Uber Eats
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </li>
            <li>
              <a
                href={restaurant.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/75 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Star className="w-3 h-3 fill-brand-gold text-brand-gold" />
                Leave a Review
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-heading text-base font-semibold text-white mb-4">
            Contact
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href={restaurant.address.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-sm text-white/75 hover:text-white transition-colors group"
              >
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-lime" />
                <span>{restaurant.address.full}</span>
              </a>
            </li>
            <li>
              <a
                href={restaurant.phoneUrl}
                className="flex items-center gap-3 text-sm text-white/75 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0 text-brand-lime" />
                {restaurant.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${restaurant.email}`}
                className="flex items-center gap-3 text-sm text-white/75 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0 text-brand-lime" />
                {restaurant.email}
              </a>
            </li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h3 className="font-heading text-base font-semibold text-white mb-4">
            <Clock className="w-4 h-4 inline mr-2 text-brand-lime" />
            Hours
          </h3>
          <ul className="space-y-2">
            {restaurant.hours.map((h) => (
              <li key={h.days} className="text-sm">
                <div className="text-white/75">{h.days}</div>
                <div className="text-white font-semibold">
                  {h.open} – {h.close}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/50 mt-3">
            * Hours subject to change. Call to confirm.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 relative z-10">
        <div className="container-site py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear()} {restaurant.name}</span>
            <Image 
              src="/brand/old-damascus-star-transparent.png"
              alt="Brand Star"
              width={16}
              height={16}
              className="w-3 h-3 opacity-80 animate-in fade-in zoom-in duration-500 delay-300"
            />
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative Watermark */}
      <div className="absolute right-0 bottom-0 pointer-events-none overflow-hidden h-full w-full max-w-2xl opacity-10 flex items-end justify-end">
        <Image
          src="/brand/old-damascus-star-transparent.png"
          alt=""
          width={600}
          height={600}
          className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] object-contain translate-x-1/4 translate-y-1/4"
        />
      </div>
    </footer>
  );
}
