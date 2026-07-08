"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { ChevronLeft, ChevronRight, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ImageGalleryProps {
  primaryImage: string;
  images: string[];
  alt: string;
  categoryName: string;
}

export function ImageGallery({ primaryImage, images, alt, categoryName }: ImageGalleryProps) {
  const allImages = images?.length > 0 ? images : [primaryImage];
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => setCurrentIndex((i) => (i + 1) % allImages.length);
  const prevImage = () => setCurrentIndex((i) => (i - 1 + allImages.length) % allImages.length);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  };

  return (
    <div 
      className="relative"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Image Gallery"
    >
      <div className="relative h-72 sm:h-96 w-full bg-cream overflow-hidden flex items-center justify-center">
        <AnimatePresence initial={false} mode="wait">
          {allImages[currentIndex] ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <ImageWithFallback
                src={allImages[currentIndex]}
                alt={`${alt} - Image ${currentIndex + 1}`}
                fill
                className="object-cover z-0 opacity-100"
                priority
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </motion.div>
          ) : (
          <motion.div 
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full bg-olive-light/10 flex flex-col items-center justify-center text-olive p-4 text-center"
          >
            <Utensils className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-sm font-medium opacity-80">Image unavailable</span>
          </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        <span className="absolute bottom-4 left-4 px-3 py-1 bg-brand-dark text-white text-xs font-semibold rounded-full z-10">
          {categoryName}
        </span>

        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all duration-200 active:scale-90 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all duration-200 active:scale-90 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 right-4 bg-black/40 px-3 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm">
              {currentIndex + 1} / {allImages.length}
            </div>
            
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    currentIndex === idx ? "bg-brand-gold w-4" : "bg-white/60 hover:bg-white"
                  )}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2 p-4 bg-white border-b border-border/50 overflow-x-auto scrollbar-hide">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300",
                currentIndex === idx ? "border-brand-gold scale-95" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              {img ? (
                <ImageWithFallback
                  src={img}
                  alt={`${alt} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full bg-olive-light/10 flex items-center justify-center text-olive">
                  <Utensils className="w-6 h-6 opacity-50" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
