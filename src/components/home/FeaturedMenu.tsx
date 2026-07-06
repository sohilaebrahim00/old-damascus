"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Eye, Leaf, Flame, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { MenuItem } from "@/types";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";
import { getMenuItemMapping } from "@/data/menu-image-map";
import { useState, useEffect, useMemo } from "react";

interface FeaturedMenuProps {
  items: MenuItem[];
}

export function FeaturedMenu({ items }: FeaturedMenuProps) {
  // Normalize images
  const normalizedItems = useMemo(() => {
    return items.map((item) => {
      const mapping = getMenuItemMapping(item.cloverItemId || item.id)
        || getMenuItemMapping(item.id)
        || getMenuItemMapping(item.name)
        || getMenuItemMapping(item.slug);

      const primaryImage = mapping ? mapping.primary : (item.primaryImage || item.image || "");
      const gallery = mapping ? mapping.gallery : (item.images || (primaryImage ? [primaryImage] : []));

      return {
        ...item,
        primaryImage,
        images: gallery,
        image: primaryImage, // For backwards compatibility
      };
    });
  }, [items]);

  const { addItem } = useCartStore();

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      slug: item.slug,
      name: item.name,
      price: item.price,
      image: item.image,
      selectedModifiers: [],
      categoryName: item.categoryName,
    });
  };

  return (
    <section
      className="py-12 sm:py-16 bg-white"
      aria-labelledby="featured-menu-heading"
    >
      <div className="container-site">
        <div className="text-center mb-10">
          <span className="text-brand-dark text-sm font-semibold uppercase tracking-widest">
            Our Most Loved Dishes
          </span>
          <h2
            id="featured-menu-heading"
            className="section-title mt-2"
          >
            Featured Menu Items
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            From charcoal grills to classic mezze — here are some of our most
            popular dishes.
          </p>
        </div>

        {normalizedItems.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
              hidden: {}
            }}
          >
            {normalizedItems.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 14, scale: 0.985 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1, 
                    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } 
                  }
                }}
              >
                <MenuCard
                  item={item}
                  onAddToCart={() => handleAddToCart(item)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-olive mb-4">
              Explore our full menu with over 70 dishes from grilled meats
              to traditional desserts.
            </p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/menu" className="btn-primary btn-lg">
            View Full Menu
          </Link>
        </div>
      </div>
    </section>
  );
}

function MenuCard({
  item,
  onAddToCart,
}: {
  item: MenuItem;
  onAddToCart: () => void;
}) {
  const [hasError, setHasError] = useState(false);

  const imageSrc =
    item.primaryImage ||
    item.images?.[0] ||
    item.image ||
    null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasError(false);
  }, [imageSrc]);

  return (
    <article className="card flex flex-col group h-full overflow-hidden transition-transform duration-300 hover:-translate-y-[3px]">
      {/* Image or Neutral Block */}
      <div className="relative aspect-square w-full bg-cream flex items-center justify-center">
        {imageSrc && !hasError ? (
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-[340ms] group-hover:scale-[1.035] z-0 opacity-100"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full bg-olive-light/10 flex flex-col items-center justify-center text-olive p-4 text-center">
            <span className="text-sm font-medium opacity-80">Image unavailable</span>
          </div>
        )}
        <div className="absolute inset-0 bg-card-gradient" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {!item.available && (
            <span className="badge bg-red-600 text-white text-xs">
              Unavailable
            </span>
          )}
          {item.popular && (
            <span className="badge bg-brand-gold text-white">Popular</span>
          )}
        </div>

        {/* Category */}
        <span className="absolute bottom-3 left-3 text-xs text-white/80 font-medium bg-black/30 px-2 py-0.5 rounded-full">
          {item.categoryName}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-olive-dark line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-olive mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Dietary badges */}
        <div className="flex flex-wrap gap-1">
          {item.halal && (
            <span className="badge badge-green">
              <CheckCircle className="w-2.5 h-2.5" />
              Halal
            </span>
          )}
          {item.vegetarian && (
            <span className="badge badge-green">
              <Leaf className="w-2.5 h-2.5" />
              Vegetarian
            </span>
          )}
          {item.vegan && (
            <span className="badge badge-green">
              <Leaf className="w-2.5 h-2.5" />
              Vegan
            </span>
          )}
          {item.spicy && (
            <span className="badge badge-red">
              <Flame className="w-2.5 h-2.5" />
              Spicy
            </span>
          )}
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <span className="price-tag">{formatPrice(item.price)}</span>
          <div className="flex items-center gap-2">
            <Link
              href={`/menu/${item.slug}`}
              className="p-2 rounded-lg hover:bg-cream transition-colors text-olive"
              aria-label={`View details for ${item.name}`}
            >
              <Eye className="w-4 h-4" />
            </Link>
            <button
              onClick={onAddToCart}
              disabled={!item.available}
              className="btn-primary btn-sm"
              aria-label={`Add ${item.name} to cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
