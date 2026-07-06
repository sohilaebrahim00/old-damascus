// ============================================================
// Clover → Internal Type Mapper
// Converts Clover API shapes into the website's MenuItem types.
// ============================================================

import type {
  CloverItem,
  CloverCategory,
  CloverModifierGroup,
} from "./types";
import type { MenuItem, MenuCategory, ModifierGroup } from "@/types";
import { getMenuItemMapping } from "@/data/menu-image-map";
import { SEED_MENU_ITEMS } from "@/data/menu.seed";

/** Convert Clover integer cents to USD float */
export function centsToUsd(cents: number): number {
  return Math.round(cents) / 100;
}

export function mapCloverCategory(cat: CloverCategory): MenuCategory {
  return {
    id: cat.id,
    cloverCategoryId: cat.id,
    name: cat.name,
    slug: slugify(cat.name),
    sortOrder: cat.sortOrder ?? 0,
    available: !cat.deleted,
  };
}

export function mapCloverModifierGroup(
  group: CloverModifierGroup
): ModifierGroup {
  return {
    id: group.id,
    cloverModifierGroupId: group.id,
    name: group.name,
    required: (group.minRequired ?? 0) > 0,
    minimumSelections: group.minRequired ?? 0,
    maximumSelections: group.maxAllowed ?? 1,
    modifiers: (group.modifiers?.elements ?? []).map((m) => ({
      id: m.id,
      cloverModifierId: m.id,
      name: m.name,
      additionalPrice: centsToUsd(m.price ?? 0),
      available: m.available !== false,
    })),
  };
}

export function mapCloverItem(
  item: CloverItem,
  categories: CloverCategory[],
  modifierGroups: ModifierGroup[]
): MenuItem {
  // Find the first category assigned to this item
  const catRef = item.categories?.elements?.[0];
  const cat = catRef
    ? categories.find((c) => c.id === catRef.id)
    : undefined;

  // Find stable local ID from seed by matching cloverItemId or exact name
  const seedMatch =
    SEED_MENU_ITEMS.find((s) => s.cloverItemId === item.id) ||
    SEED_MENU_ITEMS.find(
      (s) => s.name.toLowerCase() === item.name.toLowerCase()
    );
  
  const localId = seedMatch ? seedMatch.id : slugify(item.name);
  
  // Try mapping by Clover ID, then local ID, then exact name, then slug
  const mapping = getMenuItemMapping(item.id) 
    || getMenuItemMapping(localId) 
    || getMenuItemMapping(item.name.toLowerCase()) 
    || getMenuItemMapping(slugify(item.name));

  if (!mapping) {
    console.warn(`[Mapper] Missing image mapping for: ID=${item.id}, Name="${item.name}", LocalID=${localId}, Slug=${slugify(item.name)}`);
  }

  return {
    id: item.id,
    cloverItemId: item.id,
    slug: slugify(item.name),
    name: item.name,
    description: item.description || "",
    price: centsToUsd(item.price ?? 0),
    categoryId: cat?.id || "uncategorized",
    categoryName: cat?.name || "Uncategorized",
    image: mapping ? mapping.primary : "", 
    primaryImage: mapping ? mapping.primary : "",
    images: mapping ? mapping.gallery : [],
    available: item.available !== false && !item.hidden,
    modifierGroups,
    source: "clover",
    lastVerifiedAt: new Date().toISOString(),
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
