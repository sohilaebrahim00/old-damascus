"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function StickyMobileCart() {
  const pathname = usePathname();
  const { toggleCart, getTotalItems, getSubtotal } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const isMenuPage = pathname?.startsWith("/menu");
  const totalItems = getTotalItems();

  if (!isMounted || !isMenuPage || totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 p-4 lg:hidden pb-safe"
      >
        <button
          onClick={() => {
            // Wait, we can open the cart drawer: toggleCart()
            toggleCart();
          }}
          className="w-full bg-brand-olive text-white shadow-card-hover rounded-2xl p-4 flex items-center justify-between hover:bg-brand-dark transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-brand-gold" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-brand-dark rounded-full text-xs font-bold flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-sm">View Cart</span>
              <span className="text-white/80 text-xs font-medium">
                {formatPrice(getSubtotal())}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-brand-gold">
            <span className="text-sm font-semibold">View Cart</span>
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
