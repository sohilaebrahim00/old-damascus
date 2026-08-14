"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, X, Flame, CheckCircle, Utensils, ShoppingBag } from "lucide-react";
import type { MenuItem, MenuCategory } from "@/types";
import { useCartStore } from "@/store/cart.store";
import { formatPrice, cn } from "@/lib/utils";
import {
  getMenuItemMapping,
  BRAND_PHOTOS,
  CATEGORY_PHOTOS,
} from "@/data/menu-image-map";
import { BrandPattern } from "@/components/brand/BrandPattern";
import {
  canonicalToken,
  categoryDisplayName,
  categoryRank,
  GRILLED_COLLECTION,
  isGrilledCollection,
  isGrilledItem,
  makeCategoryPredicate,
  sortCategories,
  sortItemsForAllView,
} from "@/lib/menu-categories";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { trackEvent } from "@/lib/analytics";

interface MenuPageClientProps {
  items: MenuItem[];
  categories: MenuCategory[];
  source: "clover" | "seed";
}


export function MenuPageClient({ items, categories, source }: MenuPageClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [filters, setFilters] = useState({
    vegetarian: false,
    spicy: false,
    halal: false,
    availableOnly: false,
    featured: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const { addItem } = useCartStore();
  const searchRef = useRef<HTMLInputElement>(null);

  // Menu reads like a served meal, not a warehouse listing: mains lead,
  // drinks and kids close it out. Clover's own sortOrder puts drinks first,
  // so it is deliberately ignored except as a tie-breaker.
  const sortedCategories = useMemo(() => {
    const all = { id: "all", name: "All", slug: "all" } as MenuCategory;
    const ordered = sortCategories(categories);

    // The grilled collection is a display lens, not a Clover category. It is
    // only offered when the live catalogue actually contains grill items.
    if (!items.some(isGrilledItem)) return [all, ...ordered];

    const collection = {
      id: GRILLED_COLLECTION.id,
      slug: GRILLED_COLLECTION.slug,
      name: GRILLED_COLLECTION.name,
      sortOrder: 0,
      available: true,
    } as MenuCategory;

    // Seat it directly after Main Dishes.
    const at = ordered.findIndex((c) => categoryRank(c) > GRILLED_COLLECTION.rank - 1);
    const out = [...ordered];
    out.splice(at < 0 ? out.length : at, 0, collection);
    return [all, ...out];
  }, [categories, items]);

  // Apply URL search param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) {
      const t = setTimeout(() => setActiveCategory(cat), 0);
      return () => clearTimeout(t);
    }
  }, []);

  // Resolve photography: explicit mapping first, then whatever the provider
  // supplied, then the category's own shot, then the house placeholder. No
  // menu item should ever render without an image.
  const normalizedItems = useMemo(() => {
    return items.map((item) => {
      const mapping =
        getMenuItemMapping(item.cloverItemId || item.id) ||
        getMenuItemMapping(item.id) ||
        getMenuItemMapping(item.name) ||
        getMenuItemMapping(item.slug);

      const categoryFallback =
        CATEGORY_PHOTOS[canonicalToken(item.categoryName ?? "") ?? ""] ?? "";

      const primaryImage =
        mapping?.primary ||
        item.primaryImage ||
        item.image ||
        categoryFallback ||
        BRAND_PHOTOS.placeholder;

      const gallery =
        mapping?.gallery ??
        (item.images?.length ? item.images : [primaryImage]);

      return {
        ...item,
        primaryImage,
        images: gallery,
        image: primaryImage, // For backwards compatibility
      };
    });
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = normalizedItems;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.categoryName?.toLowerCase().includes(q)
      );
    }

    if (isGrilledCollection(activeCategory)) {
      // Display-only lens across the real categories.
      result = result.filter(isGrilledItem);
    } else if (activeCategory !== "all") {
      const matches = makeCategoryPredicate(categories, activeCategory);

      const byCategory = result.filter((item) => {
        if (item.categoryId === activeCategory) return true;
        const cat = categories.find((c) => c.id === item.categoryId);
        if (matches(cat)) return true;
        // Last resort for seed data, whose categoryId may not be in the list.
        return matches({ name: item.categoryName, slug: item.categoryName });
      });

      // Guard: a stale or unknown ?category= token must not render an empty
      // menu. Only apply the filter when it actually resolves to something.
      const categoryExists = categories.some((c) => matches(c));
      if (categoryExists || byCategory.length > 0) {
        result = byCategory;
      }
    }

    if (filters.vegetarian) result = result.filter((i) => i.vegetarian);
    if (filters.spicy) result = result.filter((i) => i.spicy);
    if (filters.halal) result = result.filter((i) => i.halal);
    if (filters.availableOnly) result = result.filter((i) => i.available);
    if (filters.featured) result = result.filter((i) => i.featured);

    // Present the list as a meal is served rather than as Clover returns it,
    // which leads with drinks. Display order only.
    return sortItemsForAllView(result, categories);
  }, [normalizedItems, search, activeCategory, filters, categories]);

  const clearAll = useCallback(() => {
    setSearch("");
    setActiveCategory("all");
    setFilters({
      vegetarian: false,
      spicy: false,
      halal: false,
      availableOnly: false,
      featured: false,
    });
  }, []);

  const hasActiveFilters =
    search ||
    activeCategory !== "all" ||
    Object.values(filters).some(Boolean);

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
    
    trackEvent("add_to_cart", {
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      item_category: item.categoryName,
      quantity: 1,
    });
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Editorial Header */}
      <div className="relative overflow-hidden bg-brand-dark">
        <Image
          src={BRAND_PHOTOS.hero}
          alt=""
          aria-hidden="true"
          fill
          className="object-cover opacity-30"
          sizes="100vw"
          priority
          quality={80}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/60"
        />
        <BrandPattern className="text-brand-gold" scale={104} opacity={0.06} />

        <div className="relative z-10 container-site py-24 sm:py-32">
          <span className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-gold">
            <span className="w-10 h-px bg-brand-gold/60" aria-hidden="true" />
            Old Damascus
          </span>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-semibold text-white tracking-tight mt-6 leading-[1.02]">
            The Menu
          </h1>
          <p className="text-white/60 text-lg mt-6 max-w-lg font-light leading-relaxed">
            Charcoal-grilled over open flame, mezze made each morning, rice
            slow-spiced the way Damascus has always done it.
          </p>
          {source === "clover" && (
            <p className="text-brand-gold/70 text-[11px] mt-8 font-semibold uppercase tracking-[0.2em] flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5" /> Live pricing
            </p>
          )}
        </div>
      </div>

      {/* Sticky Category Nav */}
      <div className="sticky top-[72px] z-20 bg-cream/95 backdrop-blur-md border-b border-border">
        <div className="container-site">
          <div className="flex items-center gap-8 py-4 overflow-x-auto scrollbar-none">
            {sortedCategories.map((cat) => {
              const slug = (cat as MenuCategory).slug ?? cat.id;
              const isCollection = cat.id === GRILLED_COLLECTION.id;
              const isActive =
                cat.id === "all"
                  ? activeCategory === "all"
                  : isCollection
                    ? isGrilledCollection(activeCategory)
                    : !isGrilledCollection(activeCategory) &&
                      makeCategoryPredicate(categories, activeCategory)(cat);
              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setActiveCategory(cat.id === "all" ? "all" : slug)
                  }
                  className={cn(
                    "relative flex-shrink-0 pb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-300 cursor-pointer outline-none",
                    "focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-brand-gold rounded",
                    isActive
                      ? "text-brand-dark"
                      : "text-olive/60 hover:text-brand-dark"
                  )}
                  aria-current={isActive ? "true" : undefined}
                >
                  {categoryDisplayName(cat)}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 bottom-0 h-px bg-brand-gold transition-all duration-400",
                      isActive ? "w-full" : "w-0"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="container-site py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive" />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 pr-10"
              aria-label="Search menu items"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-olive hover:text-olive-dark"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={cn(
              "btn-ghost border border-border flex-shrink-0",
              showFilters && "bg-cream border-brand"
            )}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {Object.values(filters).filter(Boolean).length > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-dark text-white text-xs flex items-center justify-center ml-1">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Clear */}
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-sm text-error font-semibold hover:underline flex-shrink-0">
              Clear All
            </button>
          )}

          {/* Results count */}
          <span className="text-sm text-olive ml-auto flex-shrink-0">
            {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filter chips */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-4 p-4 bg-white rounded-2xl border border-border">
            {[
              { key: "featured", label: "Featured" },
              { key: "vegetarian", label: "Vegetarian" },
              { key: "spicy", label: "Spicy" },
              { key: "halal", label: "Halal" },
              { key: "availableOnly", label: "Available Only" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    [key]: !prev[key as keyof typeof prev],
                  }))
                }
                className={cn(
                  "cat-pill",
                  filters[key as keyof typeof filters] && "cat-pill-active"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items Grid */}
      <div className="container-site pb-16">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <Utensils className="w-12 h-12 text-olive/30 mb-4" />
            <h3 className="font-heading text-xl font-semibold text-olive-dark mb-2">
              No items found
            </h3>
            <p className="text-olive mb-6">
              Try adjusting your search or filters.
            </p>
            <button onClick={clearAll} className="btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 sm:gap-y-16"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredItems.map((item, index) => (
              <motion.div key={item.id} variants={fadeUp}>
                <MenuItemCard
                  item={item}
                  index={index}
                  onAddToCart={() => handleAddToCart(item)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MenuItemCard({
  item,
  index,
  onAddToCart,
}: {
  item: MenuItem;
  index: number;
  onAddToCart: () => void;
}) {
  const [hasError, setHasError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

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
    <article className="group flex flex-col h-full">
      {/* Photography */}
      <Link
        href={`/menu/${item.slug}`}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cream-warm
                   shadow-card transition-shadow duration-500 group-hover:shadow-card-hover
                   focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-brand-gold outline-none"
        aria-label={`View ${item.name}`}
      >
        {imageSrc && !hasError ? (
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={80}
            loading={index < 6 ? "eager" : "lazy"}
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full bg-cream-warm flex flex-col items-center justify-center text-olive/40">
            <Utensils className="w-7 h-7" strokeWidth={1.25} />
          </div>
        )}

        {!item.available && (
          <div className="absolute inset-0 bg-brand-dark/55 flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white border border-white/50 px-3 py-1.5 rounded-full">
              Unavailable
            </span>
          </div>
        )}
      </Link>

      {/* Copy */}
      <div className="flex flex-col flex-1 pt-6">
        <h2 className="font-heading text-xl sm:text-2xl font-semibold text-olive-dark tracking-tight leading-snug">
          <Link
            href={`/menu/${item.slug}`}
            className="hover:text-brand-gold transition-colors outline-none focus-visible:underline"
          >
            {item.name}
          </Link>
        </h2>

        {item.description && (
          <p className="text-sm text-olive/75 mt-3 line-clamp-2 leading-relaxed font-light">
            {item.description}
          </p>
        )}

        {item.spicy && (
          <span className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-error self-start">
            <Flame className="w-3 h-3" strokeWidth={1.75} /> Spicy
          </span>
        )}

        {/* Price + explicit ordering action */}
        <div className="mt-auto pt-6 flex items-center justify-between gap-4">
          <span className="font-heading text-2xl font-semibold text-brand-dark leading-none">
            {formatPrice(item.price)}
          </span>

          <button
            onClick={handleAdd}
            disabled={!item.available || isAdded}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3",
              "text-[11px] font-bold uppercase tracking-[0.16em] cursor-pointer",
              "transition-all duration-300 outline-none whitespace-nowrap",
              "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-gold",
              "disabled:cursor-not-allowed",
              isAdded
                ? "border-brand-green bg-brand-green text-white"
                : item.available
                  ? "border-brand-dark bg-brand-dark text-white hover:bg-brand-gold hover:border-brand-gold hover:text-brand-dark hover:-translate-y-[1.5px] active:scale-[0.98]"
                  : "border-border bg-transparent text-olive/50"
            )}
            aria-label={`Add ${item.name} to cart`}
          >
            {isAdded ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                Added
              </>
            ) : item.available ? (
              <>
                <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.75} />
                Add to Cart
              </>
            ) : (
              "Unavailable"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
