// ============================================================
// Canonical menu-category identity and ordering.
//
// Clover names its categories "Appetizer", "Salad", "SPECIALTIES",
// "Smoothie / MilkShakes" — none of which equal the slugs the site links
// with ("appetizers", "salads", "drinks"). Matching on exact slug therefore
// resolved to nothing and rendered "No items found".
//
// Both sides are reduced to a canonical token instead. Kept dependency-free
// so it can be exercised directly by a verification script.
// ============================================================

export interface CategoryLike {
  id?: string;
  slug?: string;
  name?: string;
  sortOrder?: number;
}

export const CANONICAL_CATEGORIES: Array<{
  token: string;
  rank: number;
  match: string[];
}> = [
  { token: "main-dishes", rank: 1, match: ["main"] },
  {
    token: "grilled-dishes",
    rank: 2,
    match: ["grill", "kabab", "kabob", "kebab", "skewer"],
  },
  { token: "specialties", rank: 3, match: ["specialt"] },
  { token: "family-platters", rank: 4, match: ["family", "platter"] },
  { token: "sandwiches", rank: 5, match: ["sandwich", "wrap"] },
  { token: "appetizers", rank: 6, match: ["appetizer", "mezze", "starter"] },
  { token: "salads", rank: 7, match: ["salad"] },
  { token: "desserts", rank: 8, match: ["dessert", "sweet"] },
  { token: "kids-menu", rank: 9, match: ["kid"] },
  {
    token: "drinks",
    rank: 10,
    match: [
      "drink",
      "beverage",
      "juice",
      "smoothie",
      "milkshake",
      "soda",
      "coffee",
      "tea",
    ],
  },
];

/** Rank given to a category we do not recognise: before kids/drinks. */
const UNKNOWN_RANK = 8.5;

/* ------------------------------------------------------------------ */
/* Customer-facing labels                                              */
/*                                                                     */
/* Clover's own names are kept untouched as the source of truth for    */
/* matching, ordering and ordering-flow payloads. Only the label shown */
/* on the page is polished.                                            */
/* ------------------------------------------------------------------ */

const DISPLAY_NAMES: Record<string, string> = {
  specialties: "Specialties",
  appetizer: "Appetizers",
  appetizers: "Appetizers",
  salad: "Salads",
  salads: "Salads",
  "soft drinks": "Cold Drinks",
  "hot drinks": "Hot Drinks",
  "smoothie / milkshakes": "Smoothies & Milkshakes",
  "smoothie/milkshakes": "Smoothies & Milkshakes",
  "kids menu": "Kids Menu",
  "main dishes": "Main Dishes",
  "family platters": "Family Platters",
  sandwiches: "Sandwiches",
  desserts: "Desserts",
};

/** Title-case a SHOUTED or lowercase name as a sane fallback. */
function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * The label a guest should read. Never used for matching or for anything
 * sent to Clover.
 */
export function categoryDisplayName(cat: CategoryLike): string {
  const raw = (cat.name ?? "").trim();
  if (!raw) return "";
  const mapped = DISPLAY_NAMES[raw.toLowerCase()];
  if (mapped) return mapped;
  // Leave sensible mixed-case names alone; tidy shouted ones.
  return raw === raw.toUpperCase() ? titleCase(raw) : raw;
}

/** Reduce any category name, slug or URL token to a canonical key. */
export function canonicalToken(value: string): string | null {
  const key = (value || "").toLowerCase().replace(/[^a-z]/g, "");
  if (!key) return null;
  for (const entry of CANONICAL_CATEGORIES) {
    if (entry.match.some((m) => key.includes(m))) return entry.token;
  }
  return null;
}

/** Serving order — deliberately ignores Clover's own sortOrder. */
export function categoryRank(cat: CategoryLike): number {
  const token = canonicalToken(`${cat.slug ?? ""} ${cat.name ?? ""}`);
  const entry = CANONICAL_CATEGORIES.find((c) => c.token === token);
  return entry ? entry.rank : UNKNOWN_RANK;
}

/** Does a category satisfy the active selection (id, slug or canonical)? */
export function categoryMatches(
  cat: CategoryLike | undefined | null,
  selection: string
): boolean {
  if (!cat) return false;
  if (cat.id === selection || cat.slug === selection) return true;
  const a = canonicalToken(`${cat.slug ?? ""} ${cat.name ?? ""}`);
  const b = canonicalToken(selection);
  return !!a && a === b;
}

/** Sort categories into serving order, tie-broken by Clover's sortOrder. */
export function sortCategories<T extends CategoryLike>(categories: T[]): T[] {
  return [...categories].sort(
    (a, b) =>
      categoryRank(a) - categoryRank(b) ||
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
}

/* ------------------------------------------------------------------ */
/* Display collections                                                 */
/*                                                                     */
/* The merchant has no "Grilled" category in Clover — grill items live */
/* across Main Dishes and SPECIALTIES. Rather than invent a Clover     */
/* category, this is a presentation-only lens over the real catalogue. */
/* Nothing here reaches Clover: items keep their true categoryId, and  */
/* cart/checkout payloads are unaffected.                              */
/* ------------------------------------------------------------------ */

export const GRILLED_COLLECTION = {
  id: "collection-grilled",
  slug: "grilled-collection",
  name: "Grilled Collection",
  rank: 2, // sits directly after Main Dishes
} as const;

const GRILL_TERMS = [
  "shish tawook",
  "shish tawok",
  "tawook",
  "kabab",
  "kabob",
  "kebab",
  "kofta",
  "adana",
  "mix grill",
  "mixed grill",
  "grill",
  "skewer",
  "arayes",
  "shawarma",
];

/** Is this dish part of the grilled collection? Matched on dish name. */
export function isGrilledItem(item: {
  name?: string;
  categoryName?: string;
}): boolean {
  const name = (item.name ?? "").toLowerCase();
  if (!name) return false;
  // Drinks and desserts never qualify, even if oddly named.
  const cat = canonicalToken(item.categoryName ?? "");
  if (cat === "drinks" || cat === "desserts") return false;
  return GRILL_TERMS.some((t) => name.includes(t));
}

/** True when a selection token refers to the grilled collection. */
export function isGrilledCollection(selection: string): boolean {
  const s = (selection || "").toLowerCase();
  return s === GRILLED_COLLECTION.slug || s === GRILLED_COLLECTION.id;
}

/**
 * Build the predicate for an active selection.
 *
 * Exactness first: if the selection names a real category (the user tapped
 * "Hot Drinks" in the nav), match only that category — otherwise every drinks
 * category would canonicalise to "drinks" and Hot Drinks would list soda.
 * Only when nothing matches exactly — a marketing link such as /menu?
 * category=appetizers against Clover's "Appetizer" — do we widen to the
 * canonical token.
 */
export function makeCategoryPredicate(
  categories: CategoryLike[],
  selection: string
): (cat: CategoryLike | undefined | null) => boolean {
  const exact = categories.some(
    (c) => c.id === selection || c.slug === selection
  );

  if (exact) {
    return (cat) =>
      !!cat && (cat.id === selection || cat.slug === selection);
  }

  return (cat) => categoryMatches(cat, selection);
}
