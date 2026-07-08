"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Menu,
  X,
  Phone,
  User,
  MapPin,
  ChevronRight
} from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { restaurant } from "@/config/restaurant";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";
import { trackEvent } from "@/lib/analytics";

// Timezone for Texas (Central Time)
const TIMEZONE = "America/Chicago";

function getRestaurantStatus() {
  const now = new Date();
  // Get time in Central Time
  const options = { timeZone: TIMEZONE, weekday: "long", hour: "numeric", minute: "numeric", hour12: false } as const;
  const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(now);
  
  let weekday = "";
  let hour = 0;
  let minute = 0;
  
  for (const part of parts) {
    if (part.type === "weekday") weekday = part.value;
    if (part.type === "hour") hour = parseInt(part.value, 10);
    if (part.type === "minute") minute = parseInt(part.value, 10);
  }
  
  const timeInMinutes = hour * 60 + minute;
  const openTime = 11 * 60; // 11:00 AM
  
  let closeTime = 21 * 60; // 9:00 PM for Sun-Thu
  if (weekday === "Friday" || weekday === "Saturday") {
    closeTime = 22 * 60; // 10:00 PM for Fri-Sat
  }
  
  return timeInMinutes >= openTime && timeInMinutes < closeTime ? "open" : "closed";
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About Us" },
  { href: "/catering", label: "Catering" },
  { href: "/contact", label: "Contact" },
];

export function Header({ isAuthenticated }: { isAuthenticated?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { getTotalItems, toggleCart } = useCartStore();
  const totalItems = getTotalItems();
  const mobileRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [openStatus, setOpenStatus] = useState<"loading" | "open" | "closed">("loading");

  // Mount detection for hydration and status check
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    setOpenStatus(getRestaurantStatus());
    
    // Update every minute to keep it accurate
    const interval = setInterval(() => {
      setOpenStatus(getRestaurantStatus());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Scroll detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile on route change
  useEffect(() => {
    const t = setTimeout(() => setMobileOpen(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ---- Announcement Bar ---- */}
      <div className="bg-brand-dark text-white text-xs py-2 px-4 relative z-50">
        <div className="container-site flex items-center justify-between gap-4">
          <span className="hidden sm:flex items-center gap-1.5 opacity-90 font-medium">
            <MapPin className="w-3.5 h-3.5" />
            {restaurant.address.street}, {restaurant.address.city}
          </span>
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[11px] sm:text-xs">
            {openStatus === "loading" ? (
              <span className="opacity-0">Loading...</span>
            ) : openStatus === "open" ? (
              <span className="flex items-center gap-1.5 font-semibold text-brand-lime bg-white/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse" />
                Open Now
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-semibold text-red-400 bg-white/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Closed Now
              </span>
            )}
            <span className="hidden sm:inline opacity-70">
              (Hours subject to change. Call to confirm)
            </span>
          </div>
          <a
            href={restaurant.phoneUrl}
            onClick={() => trackEvent("call_click", { source: "header" })}
            className="hidden sm:flex items-center gap-1.5 hover:text-brand-lime transition-colors font-semibold"
          >
            <Phone className="w-3.5 h-3.5" />
            {restaurant.phone}
          </a>
        </div>
      </div>

      {/* ---- Main Header ---- */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border/50 py-2"
            : "bg-white py-4"
        )}
      >
        <div className="container-site">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 group focus-visible:ring-2 focus-visible:ring-brand rounded-lg outline-none"
              aria-label="Old Damascus — Home"
            >
              <Image
                src="/brand/old-damascus-logo-transparent.png"
                alt="Old Damascus Mediterranean Restaurant"
                width={260}
                height={130}
                className={cn(
                  "w-auto object-contain transition-all duration-500 group-hover:scale-[1.02]",
                  scrolled ? "h-[45px] sm:h-[55px] lg:h-[62px]" : "h-[50px] sm:h-[60px] lg:h-[68px]"
                )}
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative px-4 py-2 rounded-lg text-[15px] font-semibold transition-colors duration-200 text-olive-dark hover:text-brand-olive focus-visible:ring-2 focus-visible:ring-brand-gold outline-none group"
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-1 left-4 right-4 h-0.5 bg-brand-dark rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href={isAuthenticated ? "/account" : "/sign-in"}
                className="p-2.5 rounded-full hover:bg-cream-warm transition-colors text-olive-dark group"
                aria-label="Account"
              >
                <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>

              <button
                onClick={toggleCart}
                className="relative p-2.5 rounded-full hover:bg-cream-warm transition-colors text-olive-dark group"
                aria-label={`Cart — ${isMounted ? totalItems : 0} item${isMounted && totalItems !== 1 ? "s" : ""}`}
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <AnimatePresence>
                  {isMounted && totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-0 right-0 bg-brand-dark text-white text-[10px] font-bold
                                 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                    >
                      {totalItems > 9 ? "9+" : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <div className="w-px h-8 bg-border/80 mx-2" />

              <a
                href="/order"
                className="btn-primary"
              >
                Order Online
              </a>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-3">
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-full hover:bg-cream-warm transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5 text-olive-dark" />
                <AnimatePresence>
                  {isMounted && totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-0 right-0 bg-brand-dark text-white text-[10px] font-bold
                                 w-4 h-4 rounded-full flex items-center justify-center border border-white"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 rounded-full hover:bg-cream-warm transition-colors"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
              >
                <Menu className="w-6 h-6 text-olive-dark" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-olive-dark/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 lg:hidden flex flex-col shadow-2xl border-l border-border"
              ref={mobileRef}
            >
              <div className="p-4 flex items-center justify-between border-b border-border/50">
                <Image
                  src="/brand/old-damascus-logo-transparent.png"
                  alt="Old Damascus Logo"
                  width={140}
                  height={48}
                  className="w-auto h-8 object-contain"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full hover:bg-cream-warm transition-colors text-olive-dark bg-cream"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <motion.div 
                className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
                }}
              >
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div key={link.href} variants={fadeUp}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center justify-between px-4 py-4 rounded-xl text-base font-semibold transition-colors",
                          isActive
                            ? "bg-brand-dark text-white shadow-md"
                            : "text-olive-dark hover:bg-cream-warm hover:text-brand-dark"
                        )}
                      >
                        {link.label}
                        <ChevronRight className={cn("w-5 h-5", isActive ? "text-white/80" : "text-olive/40")} />
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>

              <div className="p-6 bg-cream border-t border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                  <Link
                    href={isAuthenticated ? "/account" : "/sign-in"}
                    className="flex items-center gap-3 font-semibold text-olive-dark hover:text-brand-dark transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <User className="w-5 h-5" />
                    </div>
                    {isAuthenticated ? "My Account" : "Sign In / Register"}
                  </Link>
                </div>
                
                <a
                  href={restaurant.phoneUrl}
                  className="flex items-center gap-3 font-semibold text-olive-dark hover:text-brand-dark transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  {restaurant.phone}
                </a>

                <div className="pt-2">
                  <a
                    href="/order"
                    className="btn-primary w-full justify-center text-lg py-4 shadow-lg"
                  >
                    Order Online
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
