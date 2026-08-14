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

/*
 * Serving hierarchy. Matched top-down against a letters-only reduction of
 * the category name, so the narrower drink tiers must precede the generic
 * one. Ranks drive both the tab order and the ALL-view item order.
 */
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
  // Drink tiers — narrowest first.
  { token: "smoothies", rank: 12, match: ["smoothie", "milkshake", "shake"] },
  { token: "hot-drinks", rank: 10, match: ["hotdrink", "coffee"] },
  {
    token: "cold-drinks",
    rank: 11,
    match: ["softdrink", "colddrink", "soda", "juice", "water"],
  },
  // Generic catch-all so a plain "drinks" link still resolves.
  { token: "drinks", rank: 11, match: ["drink", "beverage", "tea"] },
];

/** Every token that represents some kind of drink. */
const DRINK_TOKENS = new Set([
  "drinks",
  "hot-drinks",
  "cold-drinks",
  "smoothies",
]);

/**
 * Token equality, with one deliberate widening: the generic "drinks" token
 * (used by marketing links such as /menu?category=drinks) matches any of the
 * three drink tiers. Tier tokens never match each other, so tapping
 * "Hot Drinks" in the nav still shows only hot drinks.
 */
function sameToken(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a === "drinks" || b === "drinks") {
    return DRINK_TOKENS.has(a) && DRINK_TOKENS.has(b);
  }
  return false;
}

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
  return sameToken(
    canonicalToken(`${cat.slug ?? ""} ${cat.name ?? ""}`),
    canonicalToken(selection)
  );
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

/** True charcoal-grill items: skewers, kababs and grill plates. */
const GRILL_TERMS = [
  "shish tawook",
  "shish tawok",
  "tawook",
  "kabab",
  "kabob",
  "kebab",
  "kofta",
  "adana",
  "lamb cubes",
  "mix grill",
  "mixed grill",
  "grill",
  "skewer",
];

/**
 * Excluded even when a grill term appears: the collection represents food
 * that comes off the charcoal as a plate or skewer. Shawarma is spit-roasted
 * rather than grilled, and handhelds belong to Sandwiches.
 */
const GRILL_EXCLUSIONS = ["sandwich", "wrap", "shawarma"];

/** Is this dish part of the grilled collection? Matched on dish name. */
export function isGrilledItem(item: {
  name?: string;
  categoryName?: string;
}): boolean {
  const name = (item.name ?? "").toLowerCase();
  if (!name) return false;
  if (GRILL_EXCLUSIONS.some((t) => name.includes(t))) return false;
  // Drinks and desserts never qualify, even if oddly named.
  const cat = canonicalToken(item.categoryName ?? "");
  if (cat && (DRINK_TOKENS.has(cat) || cat === "desserts")) return false;
  return GRILL_TERMS.some((t) => name.includes(t));
}

/** True when a selection token refers to the grilled collection. */
export function isGrilledCollection(selection: string): boolean {
  const s = (selection || "").toLowerCase();
  return s === GRILLED_COLLECTION.slug || s === GRILLED_COLLECTION.id;
}

/* ------------------------------------------------------------------ */
/* ALL-view item ordering                                              */
/*                                                                     */
/* Clover returns inventory in its own order, which leads with drinks. */
/* The unfiltered menu instead reads as a meal is served: mains, then  */
/* the grill, working through to smoothies. Purely a display concern — */
/* item identity, pricing and cart payloads are untouched.             */
/* ------------------------------------------------------------------ */

export interface SortableItem {
  name?: string;
  categoryId?: string;
  categoryName?: string;
}

/** Serving rank for a single dish in the unfiltered list. */
export function itemRank(
  item: SortableItem,
  categories: CategoryLike[]
): number {
  // Grill items surface as their own course, just after the mains.
  if (isGrilledItem(item)) return GRILLED_COLLECTION.rank;

  const cat =
    categories.find((c) => c.id === item.categoryId) ??
    (item.categoryName ? { name: item.categoryName } : undefined);

  return cat ? categoryRank(cat) : UNKNOWN_RANK;
}

/**
 * Deterministic order for the ALL view: course first, then category name so
 * dishes of the same course stay grouped, then dish name. Never depends on
 * Clover's sortOrder or on API return order.
 */
export function sortItemsForAllView<T extends SortableItem>(
  items: T[],
  categories: CategoryLike[]
): T[] {
  return [...items].sort((a, b) => {
    const byCourse = itemRank(a, categories) - itemRank(b, categories);
    if (byCourse !== 0) return byCourse;

    const catA = (a.categoryName ?? "").toLowerCase();
    const catB = (b.categoryName ?? "").toLowerCase();
    if (catA !== catB) return catA.localeCompare(catB);

    return (a.name ?? "").localeCompare(b.name ?? "");
  });
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
