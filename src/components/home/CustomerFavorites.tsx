"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Eye, Leaf, CheckCircle, Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { MenuItem } from "@/types";
import { useCartStore } from "@/store/cart.store";
import { getMenuItemMapping } from "@/data/menu-image-map";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { cn, formatPrice } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";

interface CustomerFavoritesProps {
  items: MenuItem[];
}

export function CustomerFavorites({ items }: CustomerFavoritesProps) {
  // Normalize images
  const normalizedItems = useMemo(() => {
    return items.slice(0, 6).map((item) => {
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

  if (normalizedItems.length === 0) return null;

  return (
    <section
      className="py-12 sm:py-16 bg-cream"
      aria-labelledby="customer-favorites-heading"
    >
      <div className="container-site">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
          className="text-center mb-10 flex flex-col items-center"
        >
          <Heart className="w-8 h-8 text-brand-dark mb-3" />
          <h2
            id="customer-favorites-heading"
            className="section-title"
          >
            Customer Favorites
          </h2>
          <p className="section-subtitle max-w-xl mx-auto mt-2">
            The dishes our guests love the most. Hand-crafted fresh daily.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {normalizedItems.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
            >
              <FavoriteCard
                item={item}
                onAdd={() => handleAddToCart(item)}
              />
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Link href="/menu" className="btn-outline">
            See the Full Menu
          </Link>
        </div>
      </div>
    </section>
  );
}

function FavoriteCard({
  item,
  onAdd,
}: {
  item: MenuItem;
  onAdd: () => void;
}) {
  const [hasError, setHasError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const imageSrc =
    item.primaryImage ||
    item.images?.[0] ||
    item.image ||
    null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasError(false);
  }, [imageSrc]);

  const handleAdd = () => {
    onAdd();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <article className="card flex flex-col group h-full overflow-hidden transition-transform duration-300 hover:-translate-y-1 shadow-card bg-white">
      <div className="relative aspect-[4/3] w-full bg-cream-warm flex items-center justify-center overflow-hidden">
        {imageSrc && !hasError ? (
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105 z-0"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full bg-olive-light/10 flex flex-col items-center justify-center text-olive p-4 text-center">
            <span className="text-sm font-medium opacity-80">Image unavailable</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        
        <span className="absolute bottom-4 left-4 text-white font-bold text-lg drop-shadow-md z-10 line-clamp-1 pr-4">
          {item.name}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5 gap-4">
        <p className="text-sm text-olive line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-1 mt-auto">
          {item.halal && (
            <span className="badge badge-green px-2 py-0.5 text-[10px]">
              <CheckCircle className="w-2.5 h-2.5" /> Halal
            </span>
          )}
          {item.vegetarian && (
            <span className="badge badge-green px-2 py-0.5 text-[10px]">
              <Leaf className="w-2.5 h-2.5" /> Vegetarian
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="font-heading font-bold text-xl text-brand-dark">
            {formatPrice(item.price)}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/menu/${item.slug}`}
              className="p-2 rounded-lg hover:bg-cream transition-colors text-olive outline-none focus-visible:ring-2 focus-visible:ring-brand-gold hover:-translate-y-[1px] active:scale-[0.98]"
              aria-label={`View ${item.name} details`}
            >
              <Eye className="w-4 h-4" />
            </Link>
            <button
              onClick={handleAdd}
              disabled={!item.available || isAdded}
              className={cn(
                "btn-primary btn-sm transition-all duration-200 min-w-[80px]",
                isAdded ? "bg-brand-green border-brand-green" : "disabled:opacity-40"
              )}
              aria-label={`Add ${item.name} to cart`}
            >
              {isAdded ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Added
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" /> Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
