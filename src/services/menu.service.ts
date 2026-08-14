// ============================================================
// Menu Provider Interface + Implementations
// Clover → Local Seed fallback architecture.
// Server-side only.
// ============================================================

import type { MenuCategory, MenuItem } from "@/types";
import { SEED_CATEGORIES, SEED_MENU_ITEMS } from "@/data/menu.seed";
import { isCloverConfigured } from "@/integrations/clover/config";
import { fetchCloverCategories, fetchCloverItems } from "@/integrations/clover/inventory";

// ---- Interface ----

export interface MenuProvider {
  getCategories(): Promise<MenuCategory[]>;
  getItems(): Promise<MenuItem[]>;
  getItemBySlug(slug: string): Promise<MenuItem | null>;
}

// ---- Local Seed Provider ----

export class LocalSeedMenuProvider implements MenuProvider {
  async getCategories(): Promise<MenuCategory[]> {
    return SEED_CATEGORIES;
  }

  async getItems(): Promise<MenuItem[]> {
    return SEED_MENU_ITEMS;
  }

  async getItemBySlug(slug: string): Promise<MenuItem | null> {
    return SEED_MENU_ITEMS.find((i) => i.slug === slug) ?? null;
  }
}

// ---- Clover Menu Provider ----

export class CloverMenuProvider implements MenuProvider {
  private categories: MenuCategory[] | null = null;
  private items: MenuItem[] | null = null;
  private loadedAt: number | null = null;
  private inFlight: Promise<void> | null = null;
  private readonly ttlMs = 5 * 60 * 1000; // 5 minutes

  private isStale(): boolean {
    if (!this.loadedAt) return true;
    return Date.now() - this.loadedAt > this.ttlMs;
  }

  async getCategories(): Promise<MenuCategory[]> {
    await this.ensureLoaded();
    return this.categories ?? [];
  }

  async getItems(): Promise<MenuItem[]> {
    await this.ensureLoaded();
    return this.items ?? [];
  }

  async getItemBySlug(slug: string): Promise<MenuItem | null> {
    const items = await this.getItems();
    return items.find((i) => i.slug === slug) ?? null;
  }

  private async ensureLoaded(): Promise<void> {
    if (!this.isStale()) return;

    // Single-flight: getItems() and getCategories() are called together via
    // Promise.all, and each used to trigger a full inventory pull. That
    // doubled every request and tipped the merchant into HTTP 429, which in
    // turn forced the seed fallback. Concurrent callers now share one load.
    if (this.inFlight) return this.inFlight;

    this.inFlight = (async () => {
      const rawCategories = await fetchCloverCategories();
      // We need CloverCategory[] for the mapper — use the raw data
      const cloverCats = rawCategories.map((c) => ({
        id: c.cloverCategoryId || c.id,
        name: c.name,
        sortOrder: c.sortOrder,
      }));

      const items = await fetchCloverItems(
        cloverCats as Parameters<typeof fetchCloverItems>[0]
      );

      this.categories = rawCategories;
      this.items = items;
      this.loadedAt = Date.now();
    })();

    try {
      await this.inFlight;
    } finally {
      this.inFlight = null;
    }
  }

  invalidateCache(): void {
    this.loadedAt = null;
  }
}

// ---- Menu Service (singleton with fallback) ----

let _cachedProvider: MenuProvider | null = null;

export function getMenuProvider(): MenuProvider {
  if (_cachedProvider) return _cachedProvider;
  if (isCloverConfigured()) {
    _cachedProvider = new CloverMenuProvider();
  } else {
    _cachedProvider = new LocalSeedMenuProvider();
  }
  return _cachedProvider;
}

/**
 * Atomic menu read — items and categories always come from the SAME source.
 *
 * Previously the page called getMenuItems() and getMenuCategories() in
 * parallel and each fell back independently. A single Clover hiccup could
 * therefore pair SEED items (categoryId "cat-mains") with CLOVER categories
 * (id "KTRNMHZMS0HT8"), so no item matched any category and every filter
 * rendered "No items found". Fetch them together or not at all.
 */
export async function getMenu(): Promise<{
  items: MenuItem[];
  categories: MenuCategory[];
  source: "clover" | "seed";
  error?: string;
}> {
  if (!isCloverConfigured()) {
    return { items: SEED_MENU_ITEMS, categories: SEED_CATEGORIES, source: "seed" };
  }

  try {
    const provider = getMenuProvider();

    const [items, categories] = await Promise.race([
      Promise.all([provider.getItems(), provider.getCategories()]),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Clover menu fetch timed out")), 8000)
      ),
    ]);

    // A successful call that yields nothing is a failure in disguise —
    // rendering an empty menu is worse than rendering the seed.
    if (!items.length || !categories.length) {
      throw new Error("Clover returned an empty menu");
    }

    return { items, categories, source: "clover" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Clover error";
    console.error("[MenuService] Clover unavailable, using seed:", message);
    return {
      items: SEED_MENU_ITEMS,
      categories: SEED_CATEGORIES,
      source: "seed",
      error: message,
    };
  }
}

/** Main entry point — falls back to seed on Clover failure */
export async function getMenuItems(): Promise<{
  items: MenuItem[];
  source: "clover" | "seed";
  error?: string;
}> {
  if (!isCloverConfigured()) {
    return { items: SEED_MENU_ITEMS, source: "seed" };
  }

  try {
    const provider = getMenuProvider();
    
    // Add 4-second timeout
    const items = await Promise.race([
      provider.getItems(),
      new Promise<MenuItem[]>((_, reject) =>
        setTimeout(() => reject(new Error("Clover menu fetch timed out")), 4000)
      ),
    ]);

    return { items, source: "clover" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Clover error";
    console.error("[MenuService] Clover unavailable, using seed:", message);

    // Fall back to local seed
    return { items: SEED_MENU_ITEMS, source: "seed", error: message };
  }
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  if (!isCloverConfigured()) {
    return SEED_CATEGORIES;
  }

  try {
    const provider = getMenuProvider();
    const categories = await Promise.race([
      provider.getCategories(),
      new Promise<MenuCategory[]>((_, reject) =>
        setTimeout(() => reject(new Error("Clover categories fetch timed out")), 4000)
      ),
    ]);
    return categories;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[MenuService] Failed to fetch Clover categories:", message);
    return SEED_CATEGORIES;
  }
}

export async function getMenuItemBySlug(
  slug: string
): Promise<MenuItem | null> {
  if (!isCloverConfigured()) {
    return SEED_MENU_ITEMS.find((i) => i.slug === slug) ?? null;
  }

  try {
    const provider = getMenuProvider();
    const item = await Promise.race([
      provider.getItemBySlug(slug),
      new Promise<MenuItem | null>((_, reject) =>
        setTimeout(() => reject(new Error("Clover item fetch timed out")), 4000)
      ),
    ]);
    return item;
  } catch {
    return SEED_MENU_ITEMS.find((i) => i.slug === slug) ?? null;
  }
}
