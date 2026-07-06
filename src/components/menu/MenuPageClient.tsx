"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, X, ShoppingBag, Eye, Flame, CheckCircle, Utensils } from "lucide-react";
import type { MenuItem, MenuCategory } from "@/types";
import { useCartStore } from "@/store/cart.store";
import { formatPrice, cn } from "@/lib/utils";
import { getMenuItemMapping } from "@/data/menu-image-map";

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

  // Sorted categories with "All" first
  const sortedCategories = useMemo(
    () =>
      [{ id: "all", name: "All", slug: "all" } as MenuCategory & { slug: string }, ...categories].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      ),
    [categories]
  );

  // Apply URL search param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) {
      const t = setTimeout(() => setActiveCategory(cat), 0);
      return () => clearTimeout(t);
    }
  }, []);

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

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = normalizedItems;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== "all") {
      result = result.filter(
        (item) =>
          item.categoryId === activeCategory ||
          // match by slug from category object
          categories.find((c) => c.id === item.categoryId)?.slug === activeCategory
      );
    }

    if (filters.vegetarian) result = result.filter((i) => i.vegetarian);
    if (filters.spicy) result = result.filter((i) => i.spicy);
    if (filters.halal) result = result.filter((i) => i.halal);
    if (filters.availableOnly) result = result.filter((i) => i.available);
    if (filters.featured) result = result.filter((i) => i.featured);

    return result;
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
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-brand-dark text-white py-12 sm:py-16">
        <div className="container-site text-center">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            Our Menu
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Fresh Syrian and Mediterranean cuisine — prepared daily with
            authentic ingredients.
          </p>
          {source === "clover" && (
            <p className="text-brand-lime text-xs mt-3 font-semibold flex items-center justify-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Live menu from Clover
            </p>
          )}
        </div>
      </div>

      {/* Sticky Category Bar */}
      <div className="sticky top-[72px] z-20 bg-white border-b border-border shadow-sm">
        <div className="container-site">
          <div className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-none">
            {sortedCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id === "all" ? "all" : (cat as MenuCategory).slug ?? cat.id)}
                className={cn(
                  "cat-pill flex-shrink-0",
                  (activeCategory === "all" && cat.id === "all") ||
                    (cat as MenuCategory).slug === activeCategory ||
                    cat.id === activeCategory
                    ? "cat-pill-active"
                    : ""
                )}
              >
                {cat.name}
              </button>
            ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <MenuItemCard
                key={item.id}
                item={item}
                index={index}
                onAddToCart={() => handleAddToCart(item)}
              />
            ))}
          </div>
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

  if (index < 4) {
    console.log({
      name: item.name,
      image: item.image,
      primaryImage: item.primaryImage,
      images: item.images,
      imageSrc
    });
  }

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
            <Utensils className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm font-medium opacity-80">Image unavailable</span>
          </div>
        )}
        <div className="absolute inset-0 bg-card-gradient" />
        {!item.available && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-lg">
            Unavailable
          </div>
        )}
        <span className="absolute bottom-3 left-3 text-xs text-white/80 font-medium bg-black/30 px-2 py-0.5 rounded-full">
          {item.categoryName}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h2 className="font-heading text-base font-semibold text-olive-dark line-clamp-1">
            {item.name}
          </h2>
          <p className="text-xs text-olive mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {/* Unverified badges removed based on instructions */}
          {item.spicy && (
            <span className="badge badge-red">
              <Flame className="w-2.5 h-2.5" /> Spicy
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <span className="price-tag">{formatPrice(item.price)}</span>
          <div className="flex items-center gap-2">
            <Link
              href={`/menu/${item.slug}`}
              className="p-2 rounded-lg hover:bg-cream transition-colors text-olive"
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
                  <CheckCircle className="w-3.5 h-3.5" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
