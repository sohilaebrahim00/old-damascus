"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OfferBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("offerBannerDismissed");
    if (!dismissed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
    }
  }, []);

  const dismissBanner = () => {
    setIsVisible(false);
    localStorage.setItem("offerBannerDismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-brand-gold text-brand-dark overflow-hidden"
        >
          <div className="container-site py-2 flex items-center justify-between sm:justify-center gap-4 text-sm font-semibold">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center">
              <span>Weekly Meal Plans Available — Starting at $129/week</span>
              <Link 
                href="/packages" 
                className="underline hover:text-white transition-colors"
                onClick={() => localStorage.setItem("offerBannerDismissed", "true")}
              >
                View Packages
              </Link>
            </div>
            <button 
              onClick={dismissBanner}
              className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
