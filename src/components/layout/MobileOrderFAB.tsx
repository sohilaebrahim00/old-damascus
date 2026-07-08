"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Phone, ExternalLink } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { restaurant } from "@/config/restaurant";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { trackEvent } from "@/lib/analytics";

export function MobileOrderFAB() {
  const pathname = usePathname();
  const { getTotalItems } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const totalItems = getTotalItems();
  const isMenuPage = pathname?.startsWith("/menu");
  
  // Hide FAB if on menu page and cart has items (StickyMobileCart takes over)
  const shouldHide = isMenuPage && totalItems > 0;

  if (!isMounted || shouldHide) return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-4 z-40 lg:hidden pb-safe"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="bg-brand-dark text-white rounded-full px-6 py-4 shadow-xl flex items-center gap-2 hover:bg-olive-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 outline-none"
              aria-label="Order Online Options"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="font-semibold text-sm">Order Online</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-olive-dark/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white z-50 lg:hidden rounded-t-3xl shadow-2xl flex flex-col pb-safe"
            >
              <div className="p-6 border-b border-border/50 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-olive-dark">
                    Choose Order Method
                  </h2>
                  <p className="text-sm text-olive mt-1">
                    Select how you would like to order
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-cream-warm transition-colors text-olive bg-cream focus-visible:ring-2 focus-visible:ring-brand outline-none"
                  aria-label="Close ordering options"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <motion.div 
                className="p-6 flex flex-col gap-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.a
                  variants={fadeUp}
                  href="/order"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 px-4 bg-brand-dark text-white rounded-xl font-semibold flex items-center justify-between hover:bg-olive-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5" />
                    <span>Direct Online Order</span>
                  </div>
                  <span className="text-xs text-white/70">Pickup</span>
                </motion.a>

                <motion.a
                  variants={fadeUp}
                  href={restaurant.doordashUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackEvent("doordash_click", { source: "mobile_fab" });
                    setIsOpen(false);
                  }}
                  className="w-full py-4 px-4 border border-border text-olive-dark bg-white rounded-xl font-semibold flex items-center justify-between hover:border-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-brand-dark font-bold">DoorDash</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-olive/50" />
                </motion.a>

                <motion.a
                  variants={fadeUp}
                  href={restaurant.uberEatsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackEvent("ubereats_click", { source: "mobile_fab" });
                    setIsOpen(false);
                  }}
                  className="w-full py-4 px-4 border border-border text-olive-dark bg-white rounded-xl font-semibold flex items-center justify-between hover:border-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-brand-dark font-bold">Uber Eats</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-olive/50" />
                </motion.a>

                <motion.a
                  variants={fadeUp}
                  href={restaurant.phoneUrl}
                  onClick={() => {
                    trackEvent("call_click", { source: "mobile_fab" });
                    setIsOpen(false);
                  }}
                  className="w-full py-4 px-4 border border-border text-olive-dark bg-cream rounded-xl font-semibold flex items-center gap-3 hover:bg-cream-warm transition-colors focus-visible:ring-2 focus-visible:ring-brand-gold outline-none mt-2"
                >
                  <Phone className="w-5 h-5 text-brand-dark" />
                  <span>Call to Order: {restaurant.phone}</span>
                </motion.a>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
